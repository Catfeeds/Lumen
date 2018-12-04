<?php
/**
 * Created by PhpStorm.
 * User: haoziye
 * Date: 2018/10/8
 * Time: 上午9:59
 */
namespace App\Console\Commands;

use App\Http\Models\Procedure;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use App\Http\Models\Encoding\EncodingSetting;
use App\Libraries\Soap;

class GroupRoutingInitData extends Command{

    protected $signature = 'init:groupRoutingInitData';
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
        $total_count = DB::table('ruis_temp_bom_operation')->count(DB::raw('distinct material_code'));
        //2.计算总页数
        $this->total_page = ceil($total_count/$this->pagesize);
        echo '共有'.$this->total_page.'页,请输入开始页码：'.PHP_EOL;
        $this->current_page = intval(fread(STDIN,1024));
        echo '请输入结束页码：'.PHP_EOL;
        $this->end_page = intval(fread(STDIN,1024));
        //3.循环跑所有页数的物料整理出工艺路线来
        $codeDao = new EncodingSetting();
        try{
            for($this->current_page; $this->current_page <= $this->end_page; $this->current_page ++){
                //3.1 查找每页的物料和工序
                $material_operation_list = $this->getMaterialOperationListByPage($this->current_page,$this->pagesize);
                foreach ($material_operation_list as $k=>$v){
                    echo '共有'.$this->total_page.'页，正在处理第'.$this->current_page.'页，第'.($k+1).'条'.PHP_EOL;
                    if(empty($v)) continue;
                    //查找是否有有效bom
                    $bom_id = DB::table(config('alias.rb'))
                        ->where([['code','=',$v[0]['material_code']],['bom_no','=',$v[0]['bom_no']],['is_version_on','=',1]])
                        ->value('id');
                    if(empty($bom_id)){
                        echo '编码'.$v[0]['material_code'].'的bom不存在';
                        continue;
                    }
                    $material = DB::table(config('alias.rm'))->select('id','name','material_category_id','item_no')->where('item_no',$v[0]['material_code'])->first();
                    if(empty($material)) exit('编码'.$v[0]['material_code'].'的物料不存在');
                    $routing_id = $this->createRouting($v,$codeDao,$material->name);
                    //创建工艺文件
                    $has = DB::table(config('alias.rbr'))->where([['bom_id','=',$bom_id],['routing_id','=',$routing_id]])->count();
                    if(!$has){
                        $this->createBomRouting($bom_id,$routing_id,$v,$material);
                    }
                    //同步工艺路线
                    $this->syncRouting($bom_id,$routing_id);
                }
            }
        }catch (\Exception $e){
            exit('失败'.$e->getLine().PHP_EOL.$e->getMessage().PHP_EOL);
        }

    }

    public function getMaterialOperationListByPage($page_no,$page_size){
        echo '正在获取第'.$this->current_page.'页的物料和工序'.PHP_EOL;
        $code_list = DB::table('ruis_temp_bom_operation')->select(DB::raw('distinct material_code'))->offset(($page_no - 1) * $page_size)->limit($page_size)->pluck('material_code');
        $data = [];
        foreach ($code_list as $k=>$v){
            if(empty($v)) continue;
            $data[] = DB::table('ruis_temp_bom_operation as rtbo')
                ->select(DB::raw('distinct rtoo.order,rtbo.material_code, rtbo.bom_no, rtbo.operation_id, rtbo.field_info, rtbo.factory_code, rtbo.routing_name, rtbo.control_code, rtbo.equipment_code, rtbo.workcenter_id,rtbo.base_qty'))
                ->join('ruis_temp_operation_order as rtoo','rtbo.operation_id','rtoo.operation_id')
                ->where('rtbo.material_code',$v)->orderBy('rtoo.order','asc')->get();
        }
        if(empty($data)) exit('获取第'.$this->current_page.'页物料和工序失败');
        return obj2array($data);
    }

    public function createRouting($material_operation,$codeDao,$routing_name){
        echo '正在创建工艺路线,物料编码：'.$material_operation[0]['material_code'].PHP_EOL;
        //为了工艺路线能重用,要先找到工艺路线的标识
        $routing_identify = [];
        foreach ($material_operation as $k=>$v){
            if(empty($v)) continue;
            $routing_identify[] = $v['operation_id'].'|'.($k+2);
        }
        $routing_identify = $material_operation[0]['factory_code'].'-'.implode(',',$routing_identify);
        //0.先找是否有相同工艺路线标识的工艺路线
        $routing_id = DB::table(config('alias.rpr'))->where('identify',$routing_identify)->value('id');
        if(!empty($routing_id)) return $routing_id;
//        dd($material_operation);
        //1.找到工艺路线组
        $group_code = '';
        if($material_operation[0]['factory_code'] == '1101'){
            $group_code = 'cs0014';
        }else if($material_operation[0]['factory_code'] == '1102'){
            $group_code = 'cs0015';
        }else if($material_operation[0]['factory_code'] == '1103'){
            $group_code = 'cs0016';
        }
        $group_id = DB::table(config('alias.rprg'))->where('code',$group_code)->value('id');
        //2.创建工艺路线
        if(empty($group_code)) exit('工艺路线组找不到');
        $route_code = $codeDao->get(['type'=>11,'type_code'=>'']);
        $data = [
            'code' => $route_code['code'],
            'name' => $routing_name,
            'procedure_group_id' => $group_id,
        ];
        $codeDao->useEncoding(11,$route_code['code']);
        try{
            DB::connection()->beginTransaction();
            $routing_id = DB::table(config('alias.rpr'))->insertGetId($data);
            //3.查找开始工序
            $start_operation = DB::table(config('alias.rio'))->where('name','开始')->first();
            $operation_data = [];
            $first_operation = [
                'rid'=>$routing_id,
                'oid'=>$start_operation->id,
                'type'=>0,
                'order'=>1,
            ];
            $first_node_id = DB::table(config('alias.rpro'))->insertGetId($first_operation);
            if(empty($first_node_id)) exit('创建开始节点出错啦');
            $operation_data[1][] = $first_node_id;
            $operation_times = [];
            foreach ($material_operation as $k=>$v){
                if(empty($v)) continue;
                $operation = [
                    'rid'=>$routing_id,
                    'oid'=>$v['operation_id'],
                    'type'=>0,
                    'order'=>$k+2,
                    'ctime'=>date('Y-m-d H:i:s',time()),
                ];
                $node_id = DB::table(config('alias.rpro'))->insertGetId($operation);
                if(empty($node_id)) exit('创建工艺路线节点出错啦');
                $operation_times[] = $v['operation_id'];
                $times = array_count_values($operation_times);
                if(!empty($times[$v['operation_id']]) && $times[$v['operation_id']] > 1){
                    $special_operation_orders = DB::table('ruis_temp_special_operation_order')->where('operation_id',$v['operation_id'])->pluck('order');
                    if(empty($special_operation_orders[$times[$v['operation_id']] - 1])){
                        if(empty($special_operation_orders[count($special_operation_orders) - 1])){
                            $operation_data[intval($v['order'])][] = $node_id;
                        }else{
                            $operation_data[intval($special_operation_orders[count($special_operation_orders) - 1])][] = $node_id;
                        }
                    }else{
                        $operation_data[intval($special_operation_orders[$times[$v['operation_id']] - 1])][] = $node_id;
                    }
                }else{
                    $operation_data[intval($v['order'])][] = $node_id;
                }
            }
            $data = [];
            ksort($operation_data);
            $last_node = [];
            foreach ($operation_data as $k=>$v){
                if($k != 1){
                    foreach ($v as $j=>$w){
                        foreach ($last_node as $h=>$z){
                            $data[] = [
                                'cid'=>$z,
                                'nid'=>$w,
                                'route_id'=>$routing_id,
                                'ctime'=>date('Y-m-d H:i:s',time()),
                            ];
                        }
                    }
                }
                $last_node = $v;
            }
            //添加工艺路线关系
            $relation_res = DB::table(config('alias.rprm'))->insert($data);
            if($relation_res === false) exit('工艺路线关系添加错误');
            //更新工艺路线的标识
            $identifyRes = DB::table(config('alias.rpr'))->where('id',$routing_id)->update(['identify'=>$routing_identify]);
            if($identifyRes === false) exit('工艺路线更新标识错误');
        }catch(\Exception $e){
            DB::connection()->rollback();
            exit($e->getMessage());
        }
        DB::connection()->commit();
        return $routing_id;
    }

    public function createBomRouting($bom_id,$routing_id,$bom_info,$material){
        echo '正在创建bom的工艺文件bom_id:'.$bom_id.'routing_id:'.$routing_id.PHP_EOL;
        //查找所有标准码
//        dd($bom_info);
        $all_standard_code = DB::table(config('alias.spi'))->pluck('id','code');
        if(empty($all_standard_code)) exit('查询标准值码失败');
        //查找工艺路线的节点
//        $node_list = DB::table(config('alias.rpro'))->where('rid',$routing_id)->get();
        //查找工厂
        $factory_id = DB::table(config('alias.rf'))->where('code',$bom_info[0]['factory_code'])->value('id');
        if(empty($factory_id)) exit('物料'.$bom_info[0]['material_code'].'工厂不存在，factory_code:'.$bom_info[0]['factory_code']);
        try{
            DB::connection()->beginTransaction();
            //先创建bom和工艺路线的关联
            DB::table(config('alias.rbr'))->insert(['bom_id'=>$bom_id,'routing_id'=>$routing_id,'factory_id'=>$factory_id,'is_default'=>1]);
            $operation_times = [];
            $workcenter_data = [];
            $stand_data = [];
            $workhour_data = [];
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
                $control_res = DB::table(config('alias.rbroc'))->insert($control_info);
                if(!$control_res) exit('添加工序的控制码信息失败,id:'.$v['operation_id']);
                //找到工序关联的流转品物料分类
                $lzp_material_type = DB::table(config('alias.riomc'))->select('material_category_id')->where('operation_id',$v['operation_id'])->first();
                if(empty($lzp_material_type)) exit('工序没有流转品物料分类 id：'.$v['operation_id']);
                $field_info = json_decode($v['field_info'],true);
                $i = 1;
                foreach ($field_info as $j=>$w){
                    //查找做法字段信息
//                    $field = DB::table(config('alias.rpf'))->where('id',$w['field_id'])->first();
//                    if(empty($field)) exit('找不到做法字段'.$w['field_id']);
                    //判断是否有圆盘字段
                    if(!empty($w['every_cut_time'])){
                        $disk_ability = DB::table(config('alias.riw'))->where([['operation_id','=',$v['operation_id']],['is_ladder','=',1]])->value('ability_id');
                        if(empty($disk_ability)) exit('工序没有圆盘切割能力，工序id:'.$v['operation_id']);
                        $operation_ability_id = DB::table(config('rioa'))->where([['operation_id','=',$v['operation_id']],['ability_id','=',$disk_ability]])->first('id');
                        if(empty($operation_ability_id)) exit('没有工序和能力的关联，工序id:'.$v['operation_id'].'能力id:'.$disk_ability);
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
                        'operation_ability_ids'=>!empty($operation_ability_id) ? $operation_ability_id : '',
                    ];
                    $base_id = DB::table(config('alias.rbrb'))->insertGetId($step_info);
                    if(empty($base_id)) exit('添加工艺文件步骤不成功，名称:'.$w['field_id']);
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
                    if(!empty($v['every_cut_time'])){
                        $workhour_data[] = [
                            'material_no'=>$material->item_no,
                            'material_category_id'=>$material->material_category_id,
                            'material_id'=>$material->id,
                            'step_info_id'=>$base_id,
                            'once_clip_time'=>$w['every_cut_time'],
                            'bom_id'=>$bom_id,
                            'routing_id'=>$routing_id,
                            'ability_id'=>$operation_ability_id,
                            'operation_id'=>$v['operation_id'],
                            'ctime'=>time(),
                            'mtime'=>time(),
                        ];
                    }
                    $i++;
                }
            }
            //添加步骤的工作中心
            if(!empty($workcenter_data)){
                $workcenter_res = DB::table(config('alias.rbrw'))->insert($workcenter_data);
                if(!$workcenter_res) exit('添加步骤的工作中心');
            }
            //添加步骤的标准值
            if(!empty($stand_data)){
                $stand_res = DB::table(config('alias.spiv'))->insert($stand_data);
                if(!$stand_res) exit('添加步骤的标准值');
            }
            //添加步骤的工时
            if(!empty($workhour_data)){
                $workhours_res = DB::table(config('alias.rimw'))->insert($workhour_data);
                if(!$workhours_res) exit('添加圆盘切割工时出错');
            }
        }catch (\Exception $e){
            DB::connection()->rollback();
            exit($e->getMessage());
        }
        DB::connection()->commit();
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