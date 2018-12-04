<?php
/**
 * Created by PhpStorm.
 * User: haoziye
 * Date: 2018/9/26
 * Time: 下午1:50
 */
namespace App\Console\Commands;

use App\Http\Models\Encoding\EncodingSetting;
use Illuminate\Console\Command;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Support\Facades\DB;
ini_set('memory_limit','-1');
class InitRoutingExcel extends Command{

    protected $signature = 'init:routing_from_excel';
    protected $description = '通过读取excel初始化工艺路线';

    public function __construct()
    {
        parent::__construct();
    }

    public function handle(){
        echo '请选择导入模式--1：导入物料和工序--2：导入工序顺序： ';
        $type = fread(STDIN, 1024);
        echo '请选择导入表（1：ruis_temp_bom_operation）(2:ruis_temp_bom_operation_3000)';
        $table_type = fread(STDIN,1024);
        if($table_type == 1){
            $table = 'ruis_temp_bom_operation';
        }elseif ($table_type == 2){
            $table = 'ruis_temp_bom_operation_3000';
        }
        echo '请输入导入sheet的顺序：';
        $count = fread(STDIN,1024);
//        echo '请输入标准值模式--（1：正常模式）--（2：非正常模式）-- (3:很不正常模式) -- (4:极为不正常模式)： ';
//        $standard_type = fread(STDIN,1024);
        //先获取excel上的数据
        $data = $this->getExcelData(intval($count));
        //去掉第一行导航
        unset($data[0]);
        //处理数据
//        $routing_info = $this->groupRoutingData($data);
        try{
            DB::connection()->beginTransaction();
            //添加工艺路线基础数据
//            $res = $this->createRoutingBase($routing_info);
            //拿出整个工序sheet下的物料和工序的关联的数据和步骤信息,等所有sheet跑完了才能确定工艺路线
//            $this->createTempMaterialToOperationData($data,$res,$routing_info['workcenters'],$count);
            if($type == 1){
                $this->newCreateRoutingBaseInfo($data,$table);
            }else if($type == 2){
                $this->getOperationOrder($data);
            }
        }catch (\Exception $exception){
            DB::connection()->rollback();
            exit($exception->getMessage());
        }
        DB::connection()->commit();
    }

    /**
     * 获取每个sheet的工艺数据
     * @param $count
     * @return array
     */
    public function getExcelData($count){
        $res = [];
        $filePath = storage_path().'/app/public/attachment/init_file/init_routing3000.xlsx';
        Excel::load($filePath,function ($reader) use(&$res,$count){
            $reader = $reader->getSheet($count);
            $res = $reader->toArray();
        });
        return $res;
    }

    /**
     * 暂时弃用
     * @param $data
     * @return array
     */
    public function groupRoutingData($data){
        //找到步骤组
        $routing_info = [];
        $routing_info['practice_field'] = [];
        $routing_info['operation'] = '';
        $routing_info['workcenters'] = [];
        foreach ($data as $k=>$v){
            if(empty($v[0])) continue;
            echo '正在组合基本工序和做法字段,当前第'.($k+1).'条'.PHP_EOL;
            if($v[8] == 'S'){
                //工序
                if(empty($routing_info['operation'])){
                    $routing_info['operation'] = [
                        'name'=>$v[11],
                        'time'=>$v[26],
                    ];
                }
            }else if($v[8] == 'M'){
                //做法字段
                if(!in_array($v[11],$routing_info['practice_field'])){
                    $routing_info['practice_field'][] = $v[11];
                }
            }
            if(!in_array($v[12],$routing_info['workcenters'])){
                $workcenter_id = DB::table(config('alias.rwc'))->where('code',$v[12])->value('id');
                if(empty($workcenter_id)){
                    exit('工作中心（'.$v[12].'）不存在');
                }
                $routing_info['workcenters'][$v[12]] = $workcenter_id;
            }
        }
        return $routing_info;
    }

    /**
     * 暂时弃用
     * @param $routing_info
     * @return array
     * @throws \App\Exceptions\ApiException
     */
    public function createRoutingBase($routing_info){
        //先创建没有的工序
        $operationId = DB::table(config('alias.rio'))->where('name',$routing_info['operation']['name'])->value('id');
        $codeDao = new EncodingSetting();
        if(empty($operationId)){
            $operationCode = $codeDao->get(['type'=>5,'type_code'=>'']);
            $codeDao->useEncoding(4,$operationCode['code']);
            $operationData = [
                'code'=>$operationCode['code'],
                'name'=>$routing_info['operation']['name'],
                'ctime'=>time(),
                'mtime'=>time(),
            ];
            $operationId = DB::table(config('alias.rio'))->insertGetId($operationData);
            if($operationId === false) exit('无法添加工序');
        }
        //创建工序无能力的准备工时
        $this->createOperationPreapreWorkHour($operationId,$routing_info['operation']['time']);
        //再创建没有的做法字段
        $practice_field_list = [];
        //工序和做法字段关联数据
        $operation_practice_field_data = [];
        foreach ($routing_info['practice_field'] as $k=>$v){
            echo '正在处理做法字段，当前第'.$k.'条'.PHP_EOL;
            $practice_field_id = DB::table(config('alias.rpf'))->where('name',$v)->value('id');
            if(empty($practice_field_id)){
                $fieldCode = $codeDao->get(['type'=>12,'type_code'=>'']);
                $codeDao->useEncoding(12,$fieldCode['code']);
                $data = [
                    'code'=>$fieldCode['code'],
                    'name'=>$v,
                ];
                $practice_field_id = DB::table(config('alias.rpf'))->insertGetId($data);
            }
            $practice_field_list[$v] = $practice_field_id;
            $operation_practice_field_data[$practice_field_id] = [
                'operation_id'=>$operationId,
                'practice_field_id'=>$practice_field_id,
            ];
        }
        //工序和做法字段做关联
        $this->createOperationToField($operationId,$operation_practice_field_data);
        return ['operation_id'=>$operationId,'field_list'=>$practice_field_list];
    }

    /**
     * 暂时弃用
     * @param $sheet_data
     * @param $base_info
     * @param $workcenters
     * @param int $count
     */
    public function createTempMaterialToOperationData($sheet_data,$base_info,$workcenters,$count = 0){
        $temp_info = [];
        //工序关联工作中心数据
        $workcenter_operation = [];
        //做法字段关联工作中心数据
        $workcenter_field = [];
        foreach ($sheet_data as $k=>$v){
            echo '正在导入mysql,当前正在处理第'.($k).'条'.PHP_EOL;
            if($k != 1 && !in_array($v[0],array_keys($temp_info))){
                DB::table('ruis_temp_bom_operation')->insert(array_pop($temp_info));
            }
            if(!isset($temp_info[$v[0]])){
                $temp_info[$v[0]] = [
                    'material_code'=>$v[0],
                    'bom_no'=>'01',
                    'factory_code'=>$v[2],
                    'routing_name'=>$v[3],
                    'operation_id'=>$base_info['operation_id'],
                    'control_code'=>$v[13],
                    'index'=>$count+2,
                    'field_info'=>'[]',
                    'equipment_code'=>$v[9],
                ];
            }
            if($v[8] == 'M'){
                $data = [[
                    'field_id'=>$base_info['field_list'][$v[11]],
                    'workcenter_id'=>$workcenters[$v[12]],
                    'standard_value'=>[
                        'ZPP005'=>$v[16],
                        'ZPP008'=>$v[18],
                        'ZPP009'=>$v[20],
                        'ZPP001'=>$v[22],
                    ],
                ]];
                $temp_info[$v[0]]['field_info'] = json_encode(array_merge(json_decode($temp_info[$v[0]]['field_info'],true),$data));
                if(!isset($workcenter_field[$workcenters[$v[12]]])){
                    $workcenter_field[$workcenters[$v[12]]][] = $base_info['field_list'][$v[11]];
                }else{
                    if(!in_array($base_info['field_list'][$v[11]],$workcenter_field[$workcenters[$v[12]]])){
                        $workcenter_field[$workcenters[$v[12]]][] = $base_info['field_list'][$v[11]];
                    }
                }
            }else if($v[8] == 'S'){
                if(!isset($workcenter_operation[$workcenters[$v[12]]])){
                    $workcenter_operation[$workcenters[$v[12]]] = $base_info['operation_id'];
                }
            }
        }
        //工序关联工作中心
        $this->createWorkcenterOperation($workcenter_operation);
        //做法字段关联工作中心
        $this->createWorkcenterField($workcenter_field,$base_info['operation_id']);
    }

    /**
     * 工序和做法字段做关联
     * @param $operation_id
     * @param $operation_practice_field_data
     */
    public function createOperationToField($operation_id,$operation_practice_field_data){
        $db_operation_field_list = DB::table(config('alias.riopf'))->where('operation_id',$operation_id)->get();
        $db_operation_field_list = obj2array($db_operation_field_list);
        $db_ref_operation_field_list = [];
        foreach ($db_operation_field_list as $k=>$v){
            $db_ref_operation_field_list[$v['practice_field_id']] = $v;
        }
        $set = get_array_diff_intersect(array_keys($operation_practice_field_data),array_keys($db_ref_operation_field_list));
        if(!empty($set['add_set'])){
            $data = [];
            foreach ($set['add_set'] as $k=>$v){
                if(empty($v)) continue;
                $data[] = [
                    'practice_field_id'=>$v,
                    'operation_id'=>$operation_id
                ];
            }
            DB::table(config('alias.riopf'))->insert($data);
        }
    }

    /**
     * 暂时弃用
     * 创建工序和工作中心的关联
     * @param $workcenter_operation
     */
    public function createWorkcenterOperation($workcenter_operation){
        foreach ($workcenter_operation as $k=>$v){
            if(empty($v)) continue;
            $has = DB::table(config('alias.rwco'))->where([['operation_id','=',$v],['workcenter_id',$k]])->count();
            if(!$has) DB::table(config('alias.rwco'))->insert(['operation_id'=>$v,'workcenter_id'=>$k]);
        }
    }

    /**
     * 做法字段和工作中心的关联
     * @param $workcenter_id
     * @param $workcenter_step_data
     */
    public function createWorkcenterField($field_list,$operation_id){
        $data = [];
        foreach ($field_list as $k=>$v){
            if(empty($v)) continue;
            $has = DB::table(config('alias.rwcos'))->where([['workcenter_id','=',$v['workcenter_id']],['operation_id','=',$operation_id],['step_id','=',$k]])->count();
            if(!$has) $data[] = ['workcenter_id'=>$v['workcenter_id'],'operation_id'=>$operation_id,'step_id'=>$k];
        }
        DB::table(config('alias.rwcos'))->insert($data);
    }

    /**
     * 创建工序的准备工时
     * @param $operationId
     * @param $prepare_hour
     */
    public function createOperationPreapreWorkHour($operationId,$prepare_hour){
        $workhour = DB::table('ruis_ie_workhours')->where([['operation_id','=',$operationId],['parent_id','=',0]])->first();
        if(empty($workhour)){
            $data = [
                'parent_id'=>0,
                'preparation_hour'=>!empty($prepare_hour) ? $prepare_hour : 0,
                'operation_id'=>$operationId,
            ];
            $res = DB::table('ruis_ie_workhours')->insert($data);
            if(!$res) exit('添加工序的准备工时失败');
        }else{
            $res = DB::table('ruis_ie_workhours')->where('id',$workhour->id)->update(['preparation_hour'=>$prepare_hour]);
            if($res === false) exit('更新工序准备工时失败');
        }
    }

    public function newCreateRoutingBaseInfo($sheet_data,$table){
        $temp_info = [];
        $codeDao = new EncodingSetting();
        $total = count($sheet_data);
        foreach ($sheet_data as $k=>$v){
            if(empty($v[0])) continue;
            if($k % 2 == 0){
                $str = '😊,强行欢笑中，完全无法优化，这样的事我再也不会干第二次！！！';
            }else{
                $str = '(ಥ﹏ಥ),现实总要逼迫我写如此恶心的代码，慢的一匹，还受气！！！️';
            }
            echo '正在导入mysql，共有'.$total.'条,正在处理第'.$k.'条          '.$str.PHP_EOL;
            if(!isset($temp_info[$v[0]])){
                $temp_info[$v[0]] = [
                    'material_code'=>$v[0],
                    'bom_no'=>'01',
                    'factory_code'=>$v[2],
                    'routing_name'=>!empty($v[1]) ? $v[1] : '',
                    'control_code'=>$v[9],
                    'field_info'=>[],
                    'equipment_code'=>'',
                ];
            }
            //先找到工作中心的id
            if(empty($temp_info[$v[0]]['workcenter_id'])){
                $temp_info[$v[0]]['workcenter_id'] = DB::table(config('alias.rwc'))->where('code',$v[8])->value('id');
                if(empty($temp_info[$v[0]]['workcenter_id'])){
                    exit('工作中心（'.$v[8].'）不存在');
                }
            }
            if($v[5] == 'M'){
                $practice_field_id = DB::table(config('alias.rpf'))->where('name',$v[7])->value('id');
                if(empty($practice_field_id)){
                    $fieldCode = $codeDao->get(['type'=>12,'type_code'=>'']);
                    $codeDao->useEncoding(12,$fieldCode['code']);
                    $data = [
                        'code'=>$fieldCode['code'],
                        'name'=>$v[7],
                    ];
                    $practice_field_id = DB::table(config('alias.rpf'))->insertGetId($data);
                }
//                if($standard_type == 1){
//                    $temp_info[$v[0]]['field_info'][$practice_field_id] = [
//                        'field_id'=>$practice_field_id,
//                        'workcenter_id'=>$temp_info[$v[0]]['workcenter_id'],
//                         'standard_value'=>[
//                             'ZPP001'=>$v[17],
//                             'ZPP002'=>$v[19],
//                             'ZPP007'=>$v[21],
//                         ],
//                    ];
//                }else if ($standard_type == 2){
//                    $temp_info[$v[0]]['field_info'][$practice_field_id] = [
//                        'field_id'=>$practice_field_id,
//                        'workcenter_id'=>$temp_info[$v[0]]['workcenter_id'],
//                        'standard_value'=>[
//                            'ZPP005'=>$v[17],
//                            'ZPP008'=>$v[19],
//                            'ZPP009'=>$v[21],
//                            'ZPP001'=>$v[23],
//                        ],
//                    ];
//                }else if($standard_type == 3){
//                    $temp_info[$v[0]]['field_info'][$practice_field_id] = [
//                        'field_id'=>$practice_field_id,
//                        'workcenter_id'=>$temp_info[$v[0]]['workcenter_id'],
//                        'standard_value'=>[
//                            'ZPP001'=>$v[17],
//                            'ZPP002'=>$v[19],
//                            'ZPP007'=>$v[21],
//                        ],
//                    ];
//                }else if($standard_type == 4){
//                    $temp_info[$v[0]]['field_info'][$practice_field_id] = [
//                        'field_id'=>$practice_field_id,
//                        'workcenter_id'=>$temp_info[$v[0]]['workcenter_id'],
//                        'standard_value'=>[
//                            'ZPP001'=>$v[17],
//                            'ZPP002'=>$v[19],
//                            'ZPP007'=>$v[21],
//                        ],
//                        'every_cut_time'=>$v[24],
//                    ];
//                }
                $temp_info[$v[0]]['field_info'][$practice_field_id] = [
                    'field_id'=>$practice_field_id,
                    'workcenter_id'=>$temp_info[$v[0]]['workcenter_id'],
                    'standard_value'=>[
                        'ZPP007'=>$v[11],
                        'ZPP005'=>$v[12],
                        'ZPP008'=>$v[13],
                        'ZPP009'=>$v[14],
                        'ZPP001'=>$v[15],
                        'ZPP002'=>$v[16],
                    ],
                    'every_cut_time'=>$v[18],
                    'from'=>$v[3],
                    'to'=>$v[4],
                ];
            }else if($v[5] == 'S'){
                $operationId = DB::table(config('alias.rio'))->where('name',$v[7])->value('id');
                if(empty($operationId)){
                    $operationCode = $codeDao->get(['type'=>5,'type_code'=>'']);
                    $codeDao->useEncoding(5,$operationCode['code']);
                    $operationData = [
                        'code'=>$operationCode['code'],
                        'name'=>$v[7],
                        'ctime'=>time(),
                        'mtime'=>time(),
                    ];
                    $operationId = DB::table(config('alias.rio'))->insertGetId($operationData);
                    if($operationId === false) exit('无法添加工序');
                }
                //创建工序无能力的准备工时
//                if($standard_type == 1){
//                    $this->createOperationPreapreWorkHour($operationId,$v[25]);
//                }else if($standard_type == 2){
//                    $this->createOperationPreapreWorkHour($operationId,$v[27]);
//                }
                //创建工序和做法字段的关联
                $this->createOperationToField($operationId,$temp_info[$v[0]]['field_info']);
                //创建工序和工作中心的关联
                $has = DB::table(config('alias.rwco'))->where([['workcenter_id','=',$temp_info[$v[0]]['workcenter_id']],['operation_id',$operationId]])->count();
                if(!$has) DB::table(config('alias.rwco'))->insert(['operation_id'=>$operationId,'workcenter_id'=>$temp_info[$v[0]]['workcenter_id']]);
                //创建工作中心和做法字段的关联
                $this->createWorkcenterField($temp_info[$v[0]]['field_info'],$operationId);
                $temp_info[$v[0]]['operation_id'] = $operationId;
                $temp_info[$v[0]]['base_qty'] = !empty($v[10]) ? $v[10] : 0;
                $temp_info[$v[0]]['operation_code'] = $v[6];
                $temp_info[$v[0]]['operation_name'] = $v[7];
//                if($standard_type == 1){
//                    $temp_info[$v[0]]['index'] = ltrim($v[27],'0');
//                }else if($standard_type == 2){
//                    $temp_info[$v[0]]['index'] = ltrim($v[29],'0');
//                }else if($standard_type == 3){
//                    $temp_info[$v[0]]['max_split_point'] = !empty($v[23]) ? $v[23] : 0;
//                    $temp_info[$v[0]]['index'] = ltrim($v[28],'0');
//                }else if($standard_type == 4){
//                    $temp_info[$v[0]]['index'] = ltrim($v[30],'0');
//                }
                $temp_info[$v[0]]['max_split_point'] = !empty($v[19]) ? $v[19] : 0;
                $temp_info[$v[0]]['index'] = ltrim($v[6],'0');
                //导入数据库，必须导一个去除一个，因为在一块儿的物料会有两个工序会区别不出来
                $data = array_pop($temp_info);
                $data['field_info'] = json_encode($data['field_info']);
                DB::table($table)->insert($data);
            }
        }
    }

    public function getOperationOrder($data){
        $count = count($data);
        foreach ($data as $k=>$v){
            echo '正在处理工序顺序,共'.$count.'条,正在处理第'.$k.'条'.PHP_EOL;
            if(empty($v[0])) continue;
            $operation_id = DB::table(config('alias.rio'))->where('name',$v[1])->value('id');
            if(empty($operation_id)) continue;
            $operation_order = DB::table('ruis_temp_operation_order')->where('operation_id',$operation_id)->first();
            if(!empty($operation_order)){
                $has = DB::table('ruis_temp_special_operation_order')->where([['operation_id','=',$operation_id],['order','=',$operation_order->order]])->count();
                if($has){
                    $special_data = ['operation_id'=>$operation_id,'order'=>$v[0]];
                }else{
                    $special_data = [
                        ['operation_id'=>$operation_id,'order'=>$operation_order->order],
                        ['operation_id'=>$operation_id,'order'=>$v[0]]
                    ];
                }
                $res = DB::table('ruis_temp_special_operation_order')->insert($special_data);
            }else{
                $res = DB::table('ruis_temp_operation_order')->insert(['operation_id'=>$operation_id,'order'=>$v[0]]);
            }
            if(!$res) exit('添加工序顺序不成功');
        }
    }
}