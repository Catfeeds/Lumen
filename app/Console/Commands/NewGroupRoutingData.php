<?php
/**
 * Created by PhpStorm.
 * User: haoziye
 * Date: 2018/10/26
 * Time: 上午11:45
 */
namespace App\Console\Commands;

use App\Http\Models\Procedure;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use App\Http\Models\Encoding\EncodingSetting;
use App\Libraries\Soap;

class NewGroupRoutingData extends Command{

    protected $signature = 'init:NewGroupRoutingData';
    protected $description = '根据您导入的excel的数据组合出工艺路线';
    protected $pagesize = 10;
    protected $current_page = 1;
    protected $total_page = 0;
    protected $total_success_time = 0;
    protected $end_page = 0;

    public function __construct()
    {
        parent::__construct();
    }

    public function handle(){
        //1.先找出物料的工序记录
        $total_count = DB::table('ruis_temp_bom_operation_3000')->count(DB::raw('distinct material_code,factory_code'));
        //2.计算总页数
        $this->total_page = ceil($total_count/$this->pagesize);
        echo '共有'.$this->total_page.'页,请输入开始页码：'.PHP_EOL;
        $this->current_page = intval(fread(STDIN,1024));
        echo '请输入结束页码：'.PHP_EOL;
        $this->end_page = intval(fread(STDIN,1024));
        //3.循环跑所有页数的物料整理出工艺路线来
        $codeDao = new EncodingSetting();
//        try{
            for($this->current_page; $this->current_page <= $this->end_page; $this->current_page ++){
                //3.1 查找每页的物料和工序
                $material_operation_list = $this->getMaterialOperationListByPage($this->current_page,$this->pagesize);
                foreach ($material_operation_list as $k=>$v){
                    echo '共有'.$this->total_page.'页，正在处理第'.$this->current_page.'页，第'.($k+1).'条'.PHP_EOL;
                    if(empty($v)) continue;
                    try{
                        DB::connection()->beginTransaction();
                        $error_info = [];
                        //查找是否有有效bom
                        $bom_id = DB::table(config('alias.rb'))
                            ->where([['code','=',$v[0]['material_code']],['bom_no','=',$v[0]['bom_no']],['is_version_on','=',1]])
                            ->value('id');
                        if(empty($bom_id)){
                            echo '编码'.$v[0]['material_code'].'的bom不存在';
                            $error_info[] = [
                                'error_info' => '编码'.$v[0]['material_code'].'的bom不存在',
                                'ctime'=>time(),
                                'bom_material_code'=>$v[0]['material_code'],
                            ];
                            if(!empty($error_info)) DB::table('ruis_temp_routing_error_info')->insert($error_info);
                            DB::connection()->commit();
                            continue;
                        }
                        $material = DB::table(config('alias.rm'))->select('id','material_category_id','item_no')->where('item_no',$v[0]['material_code'])->first();
                        if(empty($material)){
                            echo '编码'.$v[0]['material_code'].'的物料不存在'.PHP_EOL;
                            $error_info[] = [
                                'error_info' => '编码'.$v[0]['material_code'].'的物料不存在',
                                'ctime'=>time(),
                                'bom_material_code'=>$v[0]['material_code'],
                            ];
                            if(!empty($error_info)) DB::table('ruis_temp_routing_error_info')->insert($error_info);
                            DB::connection()->commit();
                            continue;
                        }
                        $routing_id = $this->createRouting($v,$codeDao,$bom_id,$error_info);
                        if(empty($routing_id)){
                            DB::connection()->rollback();
                            if(!empty($error_info)) DB::table('ruis_temp_routing_error_info')->insert($error_info);
                            DB::connection()->commit();
                            continue;
                        }
                        //创建工艺文件
                        $has = DB::table(config('alias.rbr'))->where([['bom_id','=',$bom_id],['routing_id','=',$routing_id]])->count();
                        if(!$has){
                            $bom_routing_res = $this->createBomRouting($bom_id,$routing_id,$v,$material,$error_info);
                            if(!$bom_routing_res){
                                DB::connection()->rollback();
                                if(!empty($error_info)) DB::table('ruis_temp_routing_error_info')->insert($error_info);
                                DB::connection()->commit();
                                continue;
                            }
                        }
                        //添加报错信息
                        if(!empty($error_info)) DB::table('ruis_temp_routing_error_info')->insert($error_info);
                        DB::connection()->commit();
                    }catch (\Exception $e){
                        $error_info[] = [
                            'error_info'=>'错误编码：'.$e->getCode().',错误信息：'.$e->getMessage().get_error_info_by_code($e->getCode()).',bom编码：'.$v[0]['material_code'],
                            'ctime'=>time(),
                            'bom_material_code'=>$v[0]['material_code'],
                        ];
                        DB::table('ruis_temp_routing_error_info')->insert($error_info);
                        DB::connection()->commit();
                    }
                }
            }
//        }catch (\Exception $e){
//            DB::connection()->rollback();
//            exit('失败'.$e->getLine().PHP_EOL.$e->getMessage().PHP_EOL);
//        }

    }

    public function getMaterialOperationListByPage($page_no,$page_size){
        echo '正在获取第'.$this->current_page.'页的物料和工序'.PHP_EOL;
        $code_list = DB::table('ruis_temp_bom_operation_3000')->select(DB::raw('distinct material_code,factory_code'))->offset(($page_no - 1) * $page_size)->limit($page_size)->get();
        $data = [];
        foreach ($code_list as $k=>$v){
            if(empty($v)) continue;
            $data[] = DB::table('ruis_temp_bom_operation_3000 as a')
                ->select(DB::raw('distinct a.max_split_point,a.operation_name,a.index,a.material_code,a.operation_code,a.bom_no,a.operation_id,a.field_info,a.factory_code,a.routing_name,a.control_code,a.equipment_code,a.workcenter_id,a.base_qty'))
                ->where([['a.material_code','=',$v->material_code],['a.factory_code','=',$v->factory_code]])
                ->get();
        }
        if(empty($data)) exit('获取第'.$this->current_page.'页物料和工序失败');
        return obj2array($data);
    }

    public function createRouting($material_operation,$codeDao,&$error_info){
        echo '正在创建工艺路线,物料编码：'.$material_operation[0]['material_code'].PHP_EOL;
        //为了工艺路线能重用,要先找到工艺路线的标识
        //如果谁有幸看到这段代码，劝你早日脱坑，这日了狗的excel，谈好的格式可以乱变的，这边根本不把开发当人看
        //本来还想好好写，效率尽量高点，这傻逼到底的业务让你觉得写出来的东西都恶心
        //收集工艺路线顺序
        $operation_order_list = [];
        foreach ($material_operation as $k=>$v){
            $operation_order_list[] = $v['index'];
        }
        //升序排列
        sort($operation_order_list);
        //反转建值
        $operation_order_list = array_flip($operation_order_list);
        $routing_identify = [];
        $operation_names = [];
        foreach ($material_operation as $k=>$v){
            if(empty($v)) continue;
            $routing_identify[] = $v['operation_id'].'|'.($operation_order_list[$v['index']]+2);
            $operation_names[] = $v['operation_name'];
        }
        $routing_identify = $material_operation[0]['factory_code'].'-'.implode(',',$routing_identify);
        if($material_operation[0]['factory_code'] == '1101'){
            $routing_name = 'M1'.implode('-',$operation_names);
        }else if($material_operation[0]['factory_code'] == '1102'){
            $routing_name = 'M2'.implode('-',$operation_names);
        }else if($material_operation[0]['factory_code'] == '1103'){
            $routing_name = 'M3'.implode('-',$operation_names);
        }
        //先找是否有相同工艺路线标识的工艺路线
        $routing_id = DB::table(config('alias.rpr'))->where('identify',$routing_identify)->value('id');
        if(!empty($routing_id)) return $routing_id;
        //1.找到工艺路线组
        $group_code = '';
        if($material_operation[0]['factory_code'] == '1101'){
            $group_code = 'QCDR0014';
        }else if($material_operation[0]['factory_code'] == '1102'){
            $group_code = 'QCDR0015';
        }else if($material_operation[0]['factory_code'] == '1103'){
            $group_code = 'QCDR0016';
        }
        $group_id = DB::table(config('alias.rprg'))->where('code',$group_code)->value('id');
        //2.创建工艺路线
        if(empty($group_code)){
            echo '工艺路线组找不到,物料号：'.$material_operation[0]['material_code'].',工厂号：'.$material_operation[0]['factory_code'].PHP_EOL;
            $error_info[] = [
                'error_info' => '工艺路线组找不到,物料号：'.$material_operation[0]['material_code'].',工厂号：'.$material_operation[0]['factory_code'],
                'ctime'=>time(),
                'bom_material_code'=>$material_operation[0]['material_code'],
            ];
            return false;
        }
        $route_code = $codeDao->get(['type'=>11,'type_code'=>'']);
        $data = [
            'code' => $route_code['code'],
            'name' => $routing_name,
            'procedure_group_id' => $group_id,
        ];
        $codeDao->useEncoding(11,$route_code['code']);

        $routing_id = DB::table(config('alias.rpr'))->insertGetId($data);
        //3.查找开始工序
        $start_operation = DB::table(config('alias.rio'))->where('name','开始')->first();
        $node_list = [];
        $first_operation = [
            'rid'=>$routing_id,
            'oid'=>$start_operation->id,
            'type'=>0,
            'order'=>1,
        ];
        $first_node_id = DB::table(config('alias.rpro'))->insertGetId($first_operation);
        if(empty($first_node_id)){
            echo '创建工艺路线开始节点出错啦'.PHP_EOL;
            $error_info[] = [
                'error_info' => '物料号：'.$material_operation[0]['material_code'].',创建工艺路线开始节点出错啦',
                'ctime'=>time(),
                'bom_material_code'=>$material_operation[0]['material_code'],
            ];
            return false;
        }
        $node_list[1] = $first_node_id;

        foreach ($material_operation as $k=>$v){
            if(empty($v)) continue;
            $operation = [
                'rid'=>$routing_id,
                'oid'=>$v['operation_id'],
                'type'=>0,
                'order'=>$operation_order_list[$v['index']]+2,
                'ctime'=>date('Y-m-d H:i:s',time()),
            ];
            $node_id = DB::table(config('alias.rpro'))->insertGetId($operation);
            if(empty($node_id)){
                echo '创建工艺路线节点出错啦'.PHP_EOL;
                $error_info[] = [
                    'error_info' => '物料号：'.$material_operation[0]['material_code'].'，创建工艺路线节点出错啦',
                    'ctime'=>time(),
                    'bom_material_code'=>$material_operation[0]['material_code'],
                ];
                return false;
            }
            $node_list[$operation_order_list[$v['index']]+2] = $node_id;
        }
        $data = [];
        ksort($node_list);
        $last_node = 0;
        foreach ($node_list as $k=>$v){
            if($k != 1){
                $data[] = [
                    'cid'=>$last_node,
                    'nid'=>$v,
                    'route_id'=>$routing_id,
                    'ctime'=>date('Y-m-d H:i:s',time()),
                ];
            }
            $last_node = $v;
        }
        //添加工艺路线关系
        $relation_res = DB::table(config('alias.rprm'))->insert($data);
        if(!$relation_res){
            echo '工艺路线关系添加错误'.PHP_EOL;
            $error_info[] = [
                'error_info' => '物料号：'.$material_operation[0]['material_code'].',工艺路线关系添加错误',
                'ctime'=>time(),
                'bom_material_code'=>$material_operation[0]['material_code'],
            ];
            return false;
        }
        //更新工艺路线的标识
        $identifyRes = DB::table(config('alias.rpr'))->where('id',$routing_id)->update(['identify'=>$routing_identify]);
        if(!$identifyRes){
            echo '工艺路线更新标识错误'.PHP_EOL;
            $error_info[] = [
                'error_info' => '物料号：'.$material_operation[0]['material_code'].',工艺路线更新标识错误',
                'ctime'=>time(),
                'bom_material_code'=>$material_operation[0]['material_code'],
            ];
            return false;
        }
        return $routing_id;
    }

    public function createBomRouting($bom_id,$routing_id,$bom_info,$material,&$error_info){
        echo '正在创建bom的工艺文件bom_id:'.$bom_id.'routing_id:'.$routing_id.PHP_EOL;
        //查找所有标准码
//        dd($bom_info);
        $all_standard_code = DB::table(config('alias.spi'))->pluck('id','code');
        if(empty($all_standard_code)){
            echo '查询标准值码失败'.PHP_EOL;
            $error_info[] = [
                'error_info' => '查询标准值码失败',
                'ctime'=>time(),
                'bom_material_code'=>'',
            ];
            return false;
        }
        //查找工艺路线的节点
//        $node_list = DB::table(config('alias.rpro'))->where('rid',$routing_id)->get();
        //查找工厂
        $factory_id = DB::table(config('alias.rf'))->where('code',$bom_info[0]['factory_code'])->value('id');
        if(empty($factory_id)){
            echo '物料'.$bom_info[0]['material_code'].'工厂不存在，factory_code:'.$bom_info[0]['factory_code'].PHP_EOL;
            $error_info[] = [
                'error_info' => '物料'.$bom_info[0]['material_code'].'工厂不存在，factory_code:'.$bom_info[0]['factory_code'],
                'ctime'=>time(),
                'bom_material_code'=>$bom_info[0]['material_code'],
            ];
            return false;
        }
        //先创建bom和工艺路线的关联
        DB::table(config('alias.rbr'))->insert(['bom_id'=>$bom_id,'routing_id'=>$routing_id,'factory_id'=>$factory_id,'is_default'=>1]);
        $operation_times = [];
        $workcenter_data = [];
        $stand_data = [];
        $workhour_data = [];
        //临时的工序码和工序节点的对照关系
        $temp_node_info = [];
        foreach ($bom_info as $k=>$v){
            $operation_times[] = $v['operation_id'];
            $node_list = DB::table(config('alias.rpro'))->where([['rid','=',$routing_id],['oid','=',$v['operation_id']]])->orderBy('id','asc')->pluck('id');
            $times = array_count_values($operation_times);
            if(!empty($times[$v['operation_id']]) && $times[$v['operation_id']] > 1){
                if(empty($node_list[$times[$v['operation_id']] - 1])){
                    $node_id = $node_list[count($node_list) - 1];
                }else{
                    $node_id = $node_list[$times[$v['operation_id']] - 1];
                }
            }else{
//                    $operation_data[intval($v['order'])][] = $node_id;
                $node_id = $node_list[0];
            }
            //添加工序的控制码
            $control_info = [
                'bom_id'=>$bom_id,
                'routing_id'=>$routing_id,
                'operation_id'=>$v['operation_id'],
                'control_code'=>$v['control_code'],
                'routing_node_id'=>$node_id,
                'base_qty'=>$v['base_qty'],
                'is_split'=>!empty($v['max_split_point']) ? 1 : 0,
                'max_split_point'=>$v['max_split_point'],
            ];
            $temp_node_info[] = [
                'material_code'=>$v['material_code'],
                'bom_no'=>$v['bom_no'],
                'operation_code'=>$v['operation_code'],
                'factory_code'=>$v['factory_code'],
                'node_id'=>$node_id,
                'routing_id'=>$routing_id,
                'bom_id'=>$bom_id,
            ];
            $control_res = DB::table(config('alias.rbroc'))->insert($control_info);
            if(!$control_res){
                echo '添加工序的控制码信息失败,id:'.$v['operation_id'].PHP_EOL;
                $error_info[] = [
                    'error_info' => '物料'.$bom_info[0]['material_code'].',添加工序的控制码信息失败,id:'.$v['operation_id'],
                    'ctime'=>time(),
                    'bom_material_code'=>$bom_info[0]['material_code'],
                ];
                return false;
            }
            //找到工序关联的流转品物料分类
            $lzp_material_type = DB::table(config('alias.riomc'))->select('material_category_id')->where('operation_id',$v['operation_id'])->first();
            if(empty($lzp_material_type)){
                echo '工序没有流转品物料分类 id：'.$v['operation_id'].PHP_EOL;
                $error_info[] = [
                    'error_info' => '物料'.$bom_info[0]['material_code'].',工序没有流转品物料分类 id：'.$v['operation_id'],
                    'ctime'=>time(),
                    'bom_material_code'=>$bom_info[0]['material_code'],
                ];
                return false;
            }
            $field_info = json_decode($v['field_info'],true);
            $i = 1;
            foreach ($field_info as $j=>$w){
                //查找做法字段信息
//                    $field = DB::table(config('alias.rpf'))->where('id',$w['field_id'])->first();
//                    if(empty($field)) exit('找不到做法字段'.$w['field_id']);
                //判断是否有圆盘字段
                if(!empty($w['every_cut_time'])){
                    $disk_ability = DB::table(config('alias.riw'))->where([['operation_id','=',$v['operation_id']],['is_ladder','=',1]])->value('ability_id');
                    if(empty($disk_ability)){
                        echo '工序没有圆盘切割能力，工序id:'.$v['operation_id'].PHP_EOL;
                        $error_info[] = [
                            'error_info' => '物料'.$bom_info[0]['material_code'].',工序没有圆盘切割能力，工序id:'.$v['operation_id'],
                            'ctime'=>time(),
                            'bom_material_code'=>$bom_info[0]['material_code'],
                        ];
                        return false;
                    }
                    $operation_ability_id = DB::table(config('alias.rioa'))->where([['operation_id','=',$v['operation_id']],['ability_id','=',$disk_ability],['status','=',1]])->value('id');
                    if(empty($operation_ability_id)){
                        echo '没有工序和能力的关联，工序id:'.$v['operation_id'].'能力id:'.$disk_ability.PHP_EOL;
                        $error_info[] = [
                            'error_info' => '物料'.$bom_info[0]['material_code'].',没有工序和能力的关联，工序id:'.$v['operation_id'].'能力id:'.$disk_ability,
                            'ctime'=>time(),
                            'bom_material_code'=>$bom_info[0]['material_code'],
                        ];
                        return false;
                    }
                }else{
                    $operation_ability_id = DB::table(config('alias.rioa'))->where([['operation_id','=',$v['operation_id']],['status','=',1]])->orderBy('id','asc')->limit(1)->value('id');
                    if(empty($operation_ability_id)){
                        echo '工序没有能力，工序id:'.$v['operation_id'].PHP_EOL;
                        $error_info[] = [
                            'error_info' => '物料'.$bom_info[0]['material_code'].',工序没有能力，工序id:'.$v['operation_id'],
                            'ctime'=>time(),
                            'bom_material_code'=>$bom_info[0]['material_code'],
                        ];
                        return false;
                    }
                }
                $step_info = [
                    'routing_node_id'=>$node_id,
                    'practice_id'=>-1,
                    'operation_id'=>$v['operation_id'],
                    'material_category_id'=>$lzp_material_type->material_category_id,
                    'step_id'=>$w['field_id'],
                    'practice_step_order_id'=>0,
                    'index'=>$i,
//                        'name'=>$field->name,
                    'select_type'=>0,
                    'is_start_or_end'=>1,
                    'bom_id'=>$bom_id,
                    'routing_id'=>$routing_id,
//                        'code'=>$field->code,
                    'group_index'=>$w['field_id'].'_'.$i.'-'.$w['field_id'].'_'.$i,
                    'comment'=>'',
                    'operation_ability_ids'=>'',
                    'practice_work_hour'=>0.00,
                    'old_description'=>'',
                    'operation_ability_ids'=>$operation_ability_id,
                ];
                $base_id = DB::table(config('alias.rbrb'))->insertGetId($step_info);
                if(empty($base_id)){
                    echo '添加工艺文件步骤不成功，名称:'.$w['field_id'].PHP_EOL;
                    $error_info[] = [
                        'error_info' => '物料'.$bom_info[0]['material_code'].',添加工艺文件步骤不成功，名称:'.$w['field_id'],
                        'ctime'=>time(),
                        'bom_material_code'=>$bom_info[0]['material_code'],
                    ];
                    return false;
                }
                $workcenter_data[] = [
                    'bom_routing_base_id'=>$base_id,
                    'workcenter_id'=>$w['workcenter_id'],
                ];
                foreach ($w['standard_value'] as $z=>$s){
                    $stand_data[] = [
                        'step_info_id'=>$base_id,
                        'standard_item_id'=>$all_standard_code[$z],
                        'standard_item_code'=>$z,
                        'value'=>$s,
                    ];
                }
                $workhour_data[] = [
                    'material_no'=>$material->item_no,
                    'material_category_id'=>$material->material_category_id,
                    'material_id'=>$material->id,
                    'step_info_id'=>$base_id,
                    'once_clip_time'=>!empty($w['every_cut_time']) ? $w['every_cut_time'] : 0,
                    'man_hours'=>!empty($w['standard_value']['ZPP002']) ? $w['standard_value']['ZPP002'] : 0,
                    'work_hours'=>!empty($w['standard_value']['ZPP001']) ? $w['standard_value']['ZPP001'] : 0,
                    'bom_id'=>$bom_id,
                    'routing_id'=>$routing_id,
                    'ability_id'=>$operation_ability_id,
                    'operation_id'=>$v['operation_id'],
                    'ctime'=>time(),
                    'mtime'=>time(),
                    'min_value'=>!empty($w['from']) ? $w['from'] : 0,
                    'max_value'=>!empty($w['to']) ? $w['to'] : 0,
                ];
                $i++;
            }
        }
        //添加步骤的工作中心
        if(!empty($workcenter_data)){
            $workcenter_res = DB::table(config('alias.rbrw'))->insert($workcenter_data);
            if(!$workcenter_res){
                echo '添加步骤的工作中心失败'.PHP_EOL;
                $error_info[] = [
                    'error_info' => '物料'.$bom_info[0]['material_code'].',添加步骤的工作中心失败',
                    'ctime'=>time(),
                    'bom_material_code'=>$bom_info[0]['material_code'],
                ];
                return false;
            }
        }
        //添加步骤的标准值
        if(!empty($stand_data)){
            $stand_res = DB::table(config('alias.spiv'))->insert($stand_data);
            if(!$stand_res){
                echo '添加步骤的标准值失败'.PHP_EOL;
                $error_info[] = [
                    'error_info' => '物料'.$bom_info[0]['material_code'].'，添加步骤的标准值失败',
                    'ctime'=>time(),
                    'bom_material_code'=>$bom_info[0]['material_code'],
                ];
                return false;
            }
        }
        //添加步骤的工时
        if(!empty($workhour_data)){
            $workhours_res = DB::table(config('alias.rimw'))->insert($workhour_data);
            if(!$workhours_res){
                echo '添加圆盘切割工时出错失败'.PHP_EOL;
                $error_info[] = [
                    'error_info' => '物料'.$bom_info[0]['material_code'].'添加圆盘切割工时失败',
                    'ctime'=>time(),
                    'bom_material_code'=>$bom_info[0]['material_code'],
                ];
                return false;
            }
        }
        //添加临时工序码和节点的对照关系
        $code_node_res = DB::table('ruis_temp_operation_code_node')->insert($temp_node_info);
        if(!$code_node_res){
            echo '工序码和节点的临时对照关系添加错误，物料编码：'.$bom_info[0]['material_code'].PHP_EOL;
            $error_info[] = [
                'error_info' => '工序码和节点的临时对照关系添加错误，物料编码：'.$bom_info[0]['material_code'],
                'ctime'=>time(),
                'bom_material_code'=>$bom_info[0]['material_code'],
            ];
            return false;
        }
        return true;
    }

    public function syncRouting($bom_id,$routing_id){
        echo '正在同步工艺路线bom_id:'.$bom_id.'|routing_id:'.$routing_id.PHP_EOL;
        $sysncDao = new Procedure();
        $factory_id = $sysncDao->getFactoryID($bom_id, $routing_id);
        $data = $sysncDao->GetSyncRouteToSapData($bom_id,$routing_id,$factory_id);
        $resp = Soap::doRequest($data['data'], 'INT_PP000300009', '0003');
        if ($resp['RETURNCODE'] != 0) {
            exit('同步工艺路线失败，'.$resp['RETURNINFO']);
        }else{
            $this->total_success_time ++;
            echo '成功同步bom的工艺路线,bom_id:'.$bom_id.'-routing_id:，已成功同步'.$this->total_success_time.'条'.PHP_EOL;
        }
        if(empty($resp['PLNNR'])) exit('SAP返回参数（PLNNR）有误。');
        if(empty($resp['PLNAL'])) exit('SAP返回参数（PLNAL）有误。');
        $sysncDao->updateGroupNumberAndCount($resp['PLNNR'], $resp['PLNAL'], $data['bomNo'], $data['materialCode'], $routing_id);
    }
}