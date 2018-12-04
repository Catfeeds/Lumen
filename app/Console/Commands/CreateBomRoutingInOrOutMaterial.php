<?php
/**
 * Created by PhpStorm.
 * User: haoziye
 * Date: 2018/10/27
 * Time: 上午9:01
 */
namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Facades\Excel;
use App\Http\Models\Encoding\EncodingSetting;
use App\Libraries\Soap;
use App\Http\Models\Procedure;

ini_set('memory_limit','-1');

class CreateBomRoutingInOrOutMaterial extends Command{

    protected $signature = 'init:CreateBomRoutingInOrOutMaterial';
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

    public function Handle(){
        echo '请选择模式（1：导入模式）（2:组合模式）：';
        $type = fread(STDIN,1024);
        if($type == 1){
            echo '请输入导入的sheet顺序：';
            $count = fread(STDIN,1024);
            //先获取数据
            $sheet_data = $this->getExcelData(intval($count));
            //导入数据
            unset($sheet_data[0]);
            $this->importSheetData($sheet_data);
        }else if($type == 2){
            //获取bom物料的数量,用来做分页，这样的话，错误数据再可控范围内,
            $total_count = DB::table('ruis_temp_in_out_material')->count(DB::raw('distinct bom_material_code,factory_code'));
            $this->total_page = ceil($total_count/$this->pagesize);
            echo '共有'.$this->total_page.'页,请输入开始页码：'.PHP_EOL;
            $this->current_page = intval(fread(STDIN,1024));
            echo '请输入结束页码：'.PHP_EOL;
            $this->end_page = intval(fread(STDIN,1024));
            //3.循环跑所有页数的物料整理出工艺路线来
            $codeDao = new EncodingSetting();
//            try{
                for($this->current_page; $this->current_page <= $this->end_page; $this->current_page ++){
                    //3.1 查找每页的进出来料
                    $material_list = $this->getInOutMaterialByPage($this->current_page,$this->pagesize);
                    foreach ($material_list as $k=>$v){
                        echo '共有'.$this->total_page.'页，正在处理第'.$this->current_page.'页，第'.($k+1).'条'.PHP_EOL;
                        if(empty($v)) continue;
                        try{
                            DB::connection()->beginTransaction();
                            //报错信息
                            $error_info = [];
                            //查找是否有有效bom
                            $bom_id = DB::table(config('alias.rb'))
                                ->where([['code','=',$v[0]['bom_material_code']],['bom_no','=',$v[0]['bom_no']],['is_version_on','=',1]])
                                ->value('id');
                            if(empty($bom_id)){
                                echo '物料编码'.$v[0]['bom_material_code'].'的bom不存在'.PHP_EOL;
                                $error_info[] = [
                                    'error_info'=>'物料编码'.$v[0]['bom_material_code'].'的bom不存在',
                                    'ctime'=>time(),
                                    'bom_material_code'=>$v[0]['bom_material_code'],
                                ];
                                if(!empty($error_info)) DB::table('ruis_temp_routing_error_info')->insert($error_info);
                                DB::connection()->commit();
                                continue;
                            }
                            $routing_id = DB::table('ruis_temp_operation_code_node')->where([['material_code','=',$v[0]['bom_material_code']],['factory_code','=',$v[0]['factory_code']]])->value('routing_id');
                            if(empty($routing_id)){
                                echo '物料编码:'.$v[0]['bom_material_code'].'的bom没有工艺路线，bom_id :'.$bom_id.PHP_EOL;
                                $error_info[] = [
                                    'error_info'=>'物料编码:'.$v[0]['bom_material_code'].'的bom没有工艺路线，bom_id :'.$bom_id.',猜测可能excel中未给出工艺路线',
                                    'ctime'=>time(),
                                    'bom_material_code'=>$v[0]['bom_material_code'],
                                ];
                                if(!empty($error_info)) DB::table('ruis_temp_routing_error_info')->insert($error_info);
                                DB::connection()->commit();
                                continue;
                            }
                            //判断是否已经包含进出料
                            $has = DB::table(config('alias.rbri'))->where([['bom_id','=',$bom_id],['routing_id','=',$routing_id]])->count();
                            if(!$has){
                                $routing_id = $this->createBomInOutMaterial($v,$codeDao,$error_info);
                                if(empty($routing_id)){
                                    DB::connection()->rollback();
                                    if(!empty($error_info)) DB::table('ruis_temp_routing_error_info')->insert($error_info);
                                    DB::connection()->commit();
                                    continue;
                                }
                            }
                            //同步工艺路线
                            $res = $this->syncRouting($bom_id,$routing_id,$error_info,$v[0]['bom_material_code']);
                            if(!$res){
                                DB::connection()->rollback();
                                if(!empty($error_info)) DB::table('ruis_temp_routing_error_info')->insert($error_info);
                                DB::connection()->commit();
                                continue;
                            }
                            //添加报错信息
                            if(!empty($error_info)) DB::table('ruis_temp_routing_error_info')->insert($error_info);
                            DB::connection()->commit();
                        }catch (\Exception $e){
                            $error_info[] = [
                                'error_info'=>'错误编码：'.$e->getCode().',错误信息：'.$e->getMessage().get_error_info_by_code($e->getCode()).',bom编码：'.$v[0]['bom_material_code'],
                                'ctime'=>time(),
                                'bom_material_code'=>$v[0]['bom_material_code'],
                            ];
                            DB::table('ruis_temp_routing_error_info')->insert($error_info);
                            DB::connection()->commit();
                        }
                    }
                }
//            }catch (\Exception $e){
//                DB::connection()->rollback();
//                exit('失败'.$e->getLine().PHP_EOL.$e->getMessage().PHP_EOL.$e->getCode());
//            }
        }
    }

    /**
     * 分页获取每个工厂的bom的进出来数据
     * @param $page_no
     * @param $page_size
     * @return array|mixed
     */
    public function getInOutMaterialByPage($page_no,$page_size){
        echo '正在获取第'.$this->current_page.'页的进出料'.PHP_EOL;
        $code_list = DB::table('ruis_temp_in_out_material')->select(DB::raw('distinct bom_material_code,factory_code'))->offset(($page_no - 1) * $page_size)->limit($page_size)->get();
        $data = [];
        foreach ($code_list as $k=>$v){
            if(empty($v)) continue;
            $data[] = DB::table('ruis_temp_in_out_material')
                ->select(DB::raw('distinct bom_no,factory_code,bom_material_code,bom_material_name,item_material_code,item_material_name,item_material_unit,operation_code,lzp_code,lzp_next_operation_code'))
                ->where([['bom_material_code',$v->bom_material_code],['factory_code','=',$v->factory_code]])
                ->get();
        }
        if(empty($data)) exit('获取第'.$this->current_page.'页进出料失败');
        return obj2array($data);
    }

    /**
     * 获取每个sheet的工艺数据
     * @param $count
     * @return array
     */
    public function getExcelData($count){
        $res = [];
        $filePath = storage_path().'/app/public/attachment/init_file/init_routing_material.xlsx';
        Excel::load($filePath,function ($reader) use(&$res,$count){
            $reader = $reader->getSheet($count);
            $res = $reader->toArray();
        });
        return $res;
    }

    /**
     * 导入数据
     * @param $sheet_data
     */
    public function importSheetData($sheet_data){
        foreach ($sheet_data as $k=>$v){
            echo '正在处理第'.$k.'条数据'.PHP_EOL;
            if(empty($v)) continue;
            $temp_in_out_material = [
                'factory_code'=>$v[0],
                'bom_material_code'=>$v[1],
                'bom_material_name'=>$v[2],
                'item_material_code'=>$v[3],
                'item_material_name'=>!empty($v[4]) ? $v[4] : '',
                'operation_code'=>$v[5],
                'lzp_code'=>!empty($v[6]) ? $v[6] : '',
                'lzp_next_operation_code'=>!empty($v[7]) ? $v[7] : '',
            ];
            $res = DB::table('ruis_temp_in_out_material')->insert($temp_in_out_material);
            if(!$res) exit('数据导入有误');
        }
    }


    public function createBomInOutMaterial($in_out_material_list,$codeDao,&$error_info){
        $count = count($in_out_material_list);
        $routing_id = 0;
        foreach ($in_out_material_list as $k=>$v){
            echo '正在处理bom的进出料，编码：'.$v['bom_material_code'].',一共'.$count.'条,当前第'.($k+1).'条'.PHP_EOL;
            $res = $this->getBomRoutingBase($v['bom_material_code'],$v['factory_code'],$v['bom_no'],$v['operation_code'],$error_info);
            if(empty($res)) return false;
            $node_info = $res['node_info'];
            $bom_routing_base = $res['bom_routing_base'];
            //找到bom子项物料的信息
            $bom_item_material = DB::table(config('alias.rbi').' as rbi')
                ->select('rbi.material_id','rbi.bom_unit_id','rbi.POSNR')
                ->leftJoin(config('alias.rm').' as rm','rm.id','rbi.material_id')
                ->where([['rm.item_no','=',$v['item_material_code']],['bom_id','=',$node_info->bom_id]])
                ->first();
            if(empty($bom_item_material)){
                echo '父项物料编码:'.$v['bom_material_code'].'的子项物料不存在，bom_id:'.$node_info->bom_id.',子项物料编码：'.$v['item_material_code'].PHP_EOL;
                $error_info[] = [
                    'error_info'=>'父项物料编码:'.$v['bom_material_code'].'的子项物料不存在，bom_id:'.$node_info->bom_id.',子项物料编码：'.$v['item_material_code'].'猜测可能是excel中子项物料比实际bom多',
                    'ctime'=>time(),
                    'bom_material_code'=>$v['bom_material_code'],
                ];
                return false;
            }
            //判断这个步骤是否已经存在这个进料
            $item_res = $this->checkStepHasMaterial($bom_routing_base->id,1,$bom_item_material->material_id,$node_info,$bom_item_material->bom_unit_id,$bom_item_material->POSNR,0,$error_info);
            if(empty($item_res)) return false;
            //如果流转品不空
            if(!empty($v['lzp_code'])){
                //先生成流转品
                $lzp = $this->createLzp($v['lzp_code'],$node_info->bom_id,$node_info->routing_id,$bom_routing_base->material_category_id,$codeDao,$error_info);
                if(empty($lzp)) return false;
                //先把当前流转品放在这个节点这个步骤作为出料
                $item_res = $this->checkStepHasMaterial($bom_routing_base->id,2,$lzp['material_id'],$node_info,$lzp['bom_unit_id'],'',1,$error_info,$v['lzp_code']);
                if(empty($item_res)) return false;
                //如果该流转品指定下一个工序的话，还需要作为下个工序节点第一个步骤的进料
                if(!empty($v['lzp_next_operation_code'])){
                    $next_node_res = $this->getBomRoutingBase($v['bom_material_code'],$v['factory_code'],$v['bom_no'],$v['lzp_next_operation_code'],$error_info);
                    if(empty($next_node_res)) return false;
                    $next_node_info = $next_node_res['node_info'];
                    $next_bom_routing_base = $next_node_res['bom_routing_base'];
                    $item_res = $this->checkStepHasMaterial($next_bom_routing_base->id,1,$lzp['material_id'],$next_node_info,$lzp['bom_unit_id'],'',1,$error_info,$v['lzp_code']);
                    if(empty($item_res)) return false;
                    //如果没有该bom的下道工序的记录还要以父项物料作为后道工序的出料
                    $has = DB::table('ruis_temp_in_out_material')
                        ->where([['bom_material_code','=',$v['bom_material_code']],['factory_code','=',$v['factory_code']],['operation_code','=',$v['lzp_next_operation_code']]])
                        ->count();
                    if(!$has){
                        $bom_material = DB::table(config('alias.rb'))->where('code',$v['bom_material_code'])->first();
                        if(empty($bom_material)){
                            echo '物料编码：'.$bom_material.'的bom不存在'.PHP_EOL;
                            $error_info[] = [
                                'error_info'=>'物料编码：'.$v['bom_material_code'].'的bom不存在',
                                'ctime'=>time(),
                                'bom_material_code'=>$v['bom_material_code'],
                            ];
                            return false;
                        }
                        $item_res = $this->checkStepHasMaterial($next_bom_routing_base->id,2,$bom_material->material_id,$next_node_info,$bom_material->bom_unit_id,'',0,$error_info);
                        if(empty($item_res)) return false;
                    }
                }
            }else{
                //如果没有指定流转品，那么就以父项物料作为该工序节点第一个步骤的出料
                $bom_material = DB::table(config('alias.rb'))->where('code',$v['bom_material_code'])->first();
                if(empty($bom_material)){
                    echo '物料编码：'.$bom_material.'的bom不存在'.PHP_EOL;
                    $error_info[] = [
                        'error_info'=>'物料编码：'.$v['bom_material_code'].'的bom不存在',
                        'ctime'=>time(),
                        'bom_material_code'=>$v['bom_material_code'],
                    ];
                    return false;
                }
                $item_res = $this->checkStepHasMaterial($bom_routing_base->id,2,$bom_material->material_id,$node_info,$bom_material->bom_unit_id,'',0,$error_info);
                if(empty($item_res)) return false;
            }
            if(!$routing_id) $routing_id = $node_info->routing_id;
        }
        return $routing_id;
    }


    public function getBomRoutingBase($material_code,$factory_code,$bom_no,$operation_code,&$error_info){
        //先获取当前料工序号对应的节点id
        $node_info = DB::table('ruis_temp_operation_code_node')
            ->where([['material_code','=',$material_code],['factory_code','=',$factory_code],['bom_no','=',$bom_no],['operation_code','=',$operation_code]])
            ->first();
        if(empty($node_info)){
            echo '找不到编码为'.$material_code.'bom物料的工序号对应的节点，工序号：'.$operation_code.PHP_EOL;
            $error_info[] = [
                'error_info'=>'找不到编码为'.$material_code.'bom物料的工序号对应的节点，工序号：'.$operation_code.',猜测可能为excel中工艺路线和进出料工序号不对应',
                'ctime'=>time(),
                'bom_material_code'=>$material_code,
            ];
            return false;
        }
        //找到对应的节点的第一个步骤id
        $bom_routing_base = DB::table(config('alias.rbrb'))
            ->where([['bom_id','=',$node_info->bom_id],['routing_id','=',$node_info->routing_id],['routing_node_id','=',$node_info->node_id]])
            ->orderBy('index','asc')
            ->first();
        if(empty($bom_routing_base)){
            echo '工序节点的步骤不存在，物料号：'.$material_code.',工序号：'.$operation_code.PHP_EOL;
            $error_info[] = [
                'error_info'=>'工序节点的步骤不存在，物料号：'.$material_code.',工序号：'.$operation_code.'猜测可能是excel中未给出m步骤',
                'ctime'=>time(),
                'bom_material_code'=>$material_code,
            ];
            return false;
        }
        return ['node_info'=>$node_info,'bom_routing_base'=>$bom_routing_base];
    }

    public function createLzp($code,$bom_id,$routing_id,$material_category_id,$codeDao,&$error_info){
        //先查看这个bom这条工艺路线是否已经生成这个流转品了
        $lzp = DB::table(config('alias.rbrl').' as rbrl')
            ->select('rm.id as material_id','rm.unit_id as bom_unit_id')
            ->leftJoin(config('alias.rm').' as rm','rm.id','rbrl.material_id')
            ->where([['rbrl.identity_card','=',$code],['rbrl.bom_id','=',$bom_id],['rbrl.routing_id','=',$routing_id]])
            ->first();
        if(!empty($lzp)) return obj2array($lzp);
        //如果没有就要生成
        //找到物料分类的默认单位
        $material_category_unit = DB::table(config('alias.rmc'))->where('id',$material_category_id)->value('unit_id');
        if(empty($material_category_unit)){
            echo '物料分类没有默认单位,id:'.$material_category_id.PHP_EOL;
            $error_info[] = [
                'error_info'=>'物料分类没有默认单位,id:'.$material_category_id,
                'ctime'=>time(),
                'bom_material_code'=>'',
            ];
            return false;
        }
        $lzp_code = $codeDao->get(['type'=>1,'type_code'=>$code.'-']);
        $codeDao->useEncoding(1,$lzp_code['code']);
        $data = [
            'name'=>$lzp_code['code'],
            'item_no'=>$lzp_code['code'],
            'lzp_identity_card'=>$lzp_code['code'],
            'material_category_id'=>$material_category_id,
            'unit_id'=>$material_category_unit,
            'ctime'=>time(),
            'mtime'=>time(),
        ];
        $material_id = DB::table(config('alias.rm'))->insertGetId($data);
        if(!$material_id){
            echo '添加流转品失败,bom_id:'.$bom_id.',routing_id'.$routing_id.',流转品编码：'.$code.PHP_EOL;
            $error_info[] = [
                'error_info'=>'添加流转品失败,bom_id:'.$bom_id.',routing_id'.$routing_id.',流转品编码：'.$code,
                'ctime'=>time(),
                'bom_material_code'=>'',
            ];
            return false;
        }
        return ['material_id'=>$material_id,'bom_unit_id'=>$material_category_unit];
    }

    public function checkStepHasMaterial($bom_routing_base_id,$type,$material_id,$node_info,$bom_unit_id,$POSNR,$is_lzp,&$error_info,$lzp_identity = ''){
        //判断这个步骤是否已经存在这个进料
        $has = DB::table(config('alias.rbri'))
            ->where([['bom_routing_base_id','=',$bom_routing_base_id],['type','=',$type],['material_id','=',$material_id]])
            ->count();
        if(!$has){
            //如果物料为出料，需要找到步骤的最大index加1，这样好看点
            if($type == 2){
                $max_index = DB::table(config('alias.rbri'))->where('bom_routing_base_id',$bom_routing_base_id)
                    ->orderBy('index','desc')
                    ->limit(1)
                    ->value('index');
            }
            //添加子项进料
            $bom_routing_item = [
                'material_id'=>$material_id,
                'use_num'=>1,
                'type'=>$type,
                'bom_id'=>$node_info->bom_id,
                'bom_routing_base_id'=>$bom_routing_base_id,
                'routing_id'=>$node_info->routing_id,
                'is_lzp'=>$is_lzp,
                'bom_unit_id'=>$bom_unit_id,
                'POSNR'=>$POSNR,
                'index'=>!empty($max_index) ? ($max_index + 1) : 1,
            ];
            //添加进出料
            $in_out_material = DB::table(config('alias.rbri'))->insert($bom_routing_item);
            if(!$in_out_material){
                echo '添加进出料失败,工艺文件步骤id:'.$bom_routing_base_id.',bom_id:'.$node_info->bom_id.',routing_id:'.$node_info->routing_id.PHP_EOL;
                $error_info[] = [
                    'error_info'=>'添加进出料失败,工艺文件步骤id:'.$bom_routing_base_id.',bom_id:'.$node_info->bom_id.',routing_id:'.$node_info->routing_id,
                    'ctime'=>time(),
                    'bom_material_code'=>'',
                ];
                return false;
            }
            if($is_lzp == 1){
                //如果是流转品的话，还要和bom关联
                $lzp_res = DB::table(config('alias.rbrl'))
                    ->insert(['material_id'=>$material_id,'bom_id'=>$node_info->bom_id,'routing_id'=>$node_info->routing_id,'routing_node_id'=>$node_info->node_id,'identity_card'=>$lzp_identity]);
                if(!$lzp_res){
                    echo '添加流转品和bom的关联失败,物料id:'.$material_id.',bom_id'.$node_info->bom_id.',routing_id'.$node_info->routing_id.PHP_EOL;
                    $error_info[] = [
                        'error_info'=>'添加流转品和bom的关联失败,物料id:'.$material_id.',bom_id'.$node_info->bom_id.',routing_id'.$node_info->routing_id,
                        'ctime'=>time(),
                        'bom_material_code'=>'',
                    ];
                    return false;
                }
            }
        }
        return true;
    }


    public function syncRouting($bom_id,$routing_id,&$error_info,$bom_material_code){
        echo '正在同步工艺路线bom_id:'.$bom_id.'|routing_id:'.$routing_id.PHP_EOL;
        $sysncDao = new Procedure();
        $factory_id = $sysncDao->getFactoryID($bom_id, $routing_id);
        $data = $sysncDao->GetSyncRouteToSapData($bom_id,$routing_id,$factory_id);
        $resp = Soap::doRequest($data['data'], 'INT_PP000300009', '0003');
        if ($resp['RETURNCODE'] != 0) {
            echo '同步工艺路线失败，'.$resp['RETURNINFO'].',bom_id:'.$bom_id.',routing_id:'.$routing_id.PHP_EOL;
            $error_info[] = [
                'error_info'=>'同步工艺路线失败，'.$resp['RETURNINFO'].',bom_id:'.$bom_id.',routing_id:'.$routing_id,
                'ctime'=>time(),
                'bom_material_code'=>$bom_material_code,
            ];
            return false;
        }else{
            $this->total_success_time ++;
            echo '成功同步bom的工艺路线,bom_id:'.$bom_id.'-routing_id:'.$routing_id.'，已成功同步'.$this->total_success_time.'条'.PHP_EOL;
        }
        if(empty($resp['PLNNR'])){
            echo 'SAP返回参数（PLNNR）有误。bom_id:'.$bom_id.',routing_id:'.$routing_id.PHP_EOL;
            $error_info[] = [
                'error_info'=>'SAP返回参数（PLNNR）有误。bom_id:'.$bom_id.',routing_id:'.$routing_id,
                'ctime'=>time(),
                'bom_material_code'=>$bom_material_code,
            ];
            return false;
        }
        if(empty($resp['PLNAL'])){
            echo 'SAP返回参数（PLNAL）有误。bom_id:'.$bom_id.',routing_id:'.$routing_id.PHP_EOL;
            $error_info[] = [
                'error_info'=>'SAP返回参数（PLNAL）有误。bom_id:'.$bom_id.',routing_id:'.$routing_id,
                'ctime'=>time(),
                'bom_material_code'=>$bom_material_code,
            ];
            return false;
        }
        $sysncDao->updateGroupNumberAndCount($resp['PLNNR'], $resp['PLNAL'], $data['bomNo'], $data['materialCode'], $routing_id,$factory_id);
        return true;
    }
}