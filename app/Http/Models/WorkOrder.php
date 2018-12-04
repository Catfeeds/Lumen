<?php

namespace App\Http\Models;//定义命名空间
use Illuminate\Support\Facades\DB;
/**
 * 工单处理类
 * @author  sam.shan  <sam.shan@ruis-ims.cn>
 * @time    2018年02月08日13:14:54
 */
class WorkOrder extends Base
{

    /**
     * 前端传递的api主键名称
     * @var string
     */
    public $apiPrimaryKey = 'work_order_id';

    public function __construct()
    {
        parent::__construct();
        $this->table = config('alias.rwo');
        $this->materialAttributeTable='material_attribute';
    }


//region  检


    /**
     * 拆单参数检测
     * @param $input  array 要过滤判断的get/post数组
     * @return void         址传递,不需要返回值
     */
    public function checkSplitFields(&$input)
    {
        //过滤参数
        trim_strings($input);
        //1.operation_order_id WT主键   Y
            //1.1 不可以为空且必须是number
        if(empty($input['operation_order_id']) || !is_numeric($input['operation_order_id'])) TEA('700','operation_order_id');
            //1.2先判断当前工艺单是否已经拆过了
        $has=$this->isExisted([['operation_order_id','=',$input['operation_order_id']]]);
        if($has)  TEA('1202','operation_order_id');
        //2.split_rules 规则不能空,切拆分准确
          //2.1 不能为空
        if(empty($input['split_rules'])) TEA('700','split_rules');
          //2.2 格式正确
        if(!is_json($input['split_rules'])) TEA('701','split_rules');
          //2.3 拆分数据准确
        $input['split_rules']=json_decode($input['split_rules'],true);
          //获取数据库中WT的数量
        $db_wt_qty=$this->getFieldValueById($input['operation_order_id'],'qty',config('alias.roo'));
        $input_wt_qty=array_sum($input['split_rules']);
        if($db_wt_qty != $input_wt_qty) TEA('1201','split_rules');

    }
//endregion


//region 拆工单
//    public function splitOrder($input)
//    {
//        if(!isset($input['number'])) TEA('700','number');
//        if(!isset($split_num)) TEA('700','split_num');
//        $number    = $input['number'];
//        $split_num = $input['split_num'];
//        $is_bath   = $input['is_bath'];
//        $description = $input['description'];
//
//        $oo        = DB::table($this->table)->where('number','=',$number)->first();
//        if(!$oo) TEA('404');
//        $qty       = $oo->qty;
//        if($qty<$number) TEA('xxx');
//
//        if($is_bath==1){
//            $n = intval($qty/$split_num);
//            $i = $qty%$split_num;
//        }else{
//            $data=[
//                'product_order_id'=> $oo->production_order_id,
//                'operation_order_id'=>$oo->operation_id,
//                'description'=>$description,
//                ''
//            ];
//        }
//    }


    /**
     * 拆工单
     * @param $input
     * @throws \App\Exceptions\ApiException
     * @author sam.shan <sam.shan@ruis-ims.cn>
     */
    public function split($input)
    {

        //获取入库数组,此处一定要严谨一些,否则前端传递额外字段将导致报错,甚至攻击
        //获取上层wt的信息
        $workTask = DB::table(config('alias.roo'))->where('id',$input['operation_order_id'])->first();
        $data = [];
        $workHourDao = new WorkHour();
        $RoutingModel = new RoutingOrder();
        foreach ($input['split_rules'] as $k=>$v){
            $data[] = [
                'production_order_id'=>$workTask->production_order_id,
                'confirm_number_RUECK'=>$workTask->confirm_number_RUECK,
                'work_center_id'=>$workTask->work_center_id,
                'factory_id'=>$workTask->factory_id,
                'operation_id'=>$workTask->operation_id,
                'operation_order_id'=>$input['operation_order_id'],
                'is_end_operation'=>$workTask->is_end_operation,
                'admin_id'=>!empty(session('administrator')->admin_id)?session('administrator')->admin_id:0,
                'created_at'=>time(),
                'number'=>get_order_sn('WO'),
                'qty'=>$v,
                'in_material'=>json_encode($this->recountInOrOutMaterial(json_decode($workTask->in_material,true),$v)),
                'out_material'=>json_encode($this->recountInOrOutMaterial(json_decode($workTask->out_material,true),$v)),
                'belong_bom_id'=>$workTask->belong_bom_id,
                'group_step_withnames'=>$workTask->group_step_withnames,
                'group_routing_package'=>json_encode($RoutingModel->addQtyInRoutingPackage(json_decode($workTask->group_routing_package,true),$v,'','')),
                'current_workhour_package'=>json_encode($workHourDao->countTotalHours($workTask->belong_bom_id,json_decode($workTask->group_step_withnames,true),$v,json_decode($workTask->workhour_package,true))),
                'select_ability_info'=>'',
                'workhour_package'=>$workTask->workhour_package,
                'routing_operation_index'=>$workTask->routing_operation_order,
                'routing_step_index'=>$workTask->routingnode_step_order,
                'routing_node_id'=>$workTask->routing_node_id,
            ];
        }
        try {
            //开启事务大杀特杀
            DB::connection()->beginTransaction();
            $res = DB::table($this->table)->insert($data);
            //修改工艺单状态,让其改为1
            $upd=DB::table(config('alias.roo'))->where('id',$input['operation_order_id'])->update(['status'=>1]);
            if(!$upd)  TEA('2404');
            //判断是否该生产单的所有的WT都拆完了
            $has=$this->isExisted([['production_order_id','=',$workTask->production_order_id],['status','=',0]],config('alias.roo'));
            if(!$has){
                $upd=DB::table(config('alias.rpo'))->where('id',$workTask->production_order_id)->update(['status'=>2]);
                if(!$upd)  TEA('2404');
            }
        } catch (\ApiException $e) {
            //回滚
            DB::connection()->rollBack();
            TEA($e->getCode());
        }
        //提交事务
        DB::connection()->commit();
    }

    /**
     * 重新计算进出料
     * @param $material
     * @param $qty
     * @return mixed
     */
    public function recountInOrOutMaterial($material,$qty){
        foreach ($material as $k=>&$v){
            $v['qty'] = round($v['usage_number'] * $qty,3);
        }
        return $material;
    }

//endregion

//region 查
    public function getWorkOrderList(&$input)
    {
        if(!isset($input['status'])) TEA('700','status');

        //按员工档案那配置的生产单元，按厂对po进行划分
        $admin_id = session('administrator')->admin_id;
        $admin_is_super = session('administrator')->superman;
        $where2=[['re.admin_id','=',$admin_id]];
        $emploee_info = DB::table(config('alias.re'). ' as re')
            ->select('re.id', 're.factory_id', 're.workshop_id')
            ->where($where2)
            ->first();
        if(!empty($emploee_info)) {
            if ($admin_is_super != 1) {
                if ($emploee_info->factory_id != 0 && $emploee_info->workshop_id == 0) {
                    $where[] = ['a1.factory_id', '=', $emploee_info->factory_id];//区分到厂
                } elseif ($emploee_info->factory_id != 0 && $emploee_info->workshop_id != 0) {
                    $where[] = ['a1.work_shop_id', '=', $emploee_info->workshop_id];//区分到车间
                }
            }
        }
        ####

        $where[] = ['a1.is_delete', '=', 0];//订单状态未删除
        !empty($input['work_task_id']) &&  $where[]=['a1.operation_order_id','=',$input['work_task_id']];
        !empty($input['work_task_number']) &&  $where[]=['a2.number','=',$input['work_task_number']];
        !empty($input['work_order_number']) &&  $where[]=['a1.number','=',$input['work_order_number']];
        !empty($input['production_order_number']) &&  $where[]=['a3.number','=',$input['production_order_number']];
        !empty($input['sales_order_code']) &&  $where[]=['a3.sales_order_code','=',$input['sales_order_code']];
        !empty($input['sales_order_project_code']) &&  $where[]=['a3.sales_order_project_code','=',$input['sales_order_project_code']];//销售订单行项目号
        if($input['status'] == 0) $where[]=['a1.status','=',$input['status']];
        if($input['status'] == 1) $where[]=['a1.status','=',$input['status']];
        if($input['status'] == 2) $where[]=['a1.status','>=',$input['status']];
        $builder = DB::table($this->table.' as a1')
            ->select('a1.id as work_order_id',
                'a1.number as wo_number',
                'a2.number as wt_number',
                'a3.number as po_number',
                'a3.sales_order_code',
                'a3.sales_order_project_code',
                'a1.total_workhour',
                'a2.in_material',
                'a2.out_material',
                'a4.item_no',
                'a1.work_station_time',
                'a1.qty',
                'a1.status',
                'a1.on_off',
                'factory.name as factory_name',
                'work_center.name as work_center',
                'rwb.name as work_shift_name'
            )
            ->leftJoin(config('alias.roo').' as a2','a2.id','=','a1.operation_order_id')
            ->leftJoin(config('alias.rpo').' as a3','a3.id','=','a1.production_order_id')
            ->leftJoin(config('alias.rm').' as a4','a4.id','=','a3.product_id')
            ->leftJoin(config('alias.rf').' as factory','a1.factory_id','factory.id')
            ->leftJoin(config('alias.rwc').' as work_center','a1.work_center_id','work_center.id')
            ->leftJoin(config('alias.rwb').' as rwb','a1.work_shift_id','rwb.id')
            ->offset(($input['page_no']-1)*$input['page_size'])
            ->limit($input['page_size']);

        if (!empty($where)) $builder->where($where);
        //order  (多order的情形,需要多次调用orderBy方法即可)
        if (!empty($input['order']) && !empty($input['sort'])) $builder->orderBy( 'a1.'.$input['sort'], $input['order']);
        //get获取接口
        $obj_list = $builder->get();
        foreach ($obj_list as $key=>&$value){
            $value->work_station_time = $value->work_station_time==null?0:date('Y-m-d H:i:s',$value->work_station_time);
            $value->up_time = 0;
            $value->down_time = 0;
            !isset($value->work_center) && $value->work_center='';
            !isset($value->factory_name) && $value->factory_name='';
            $value->work_station='';
        }

        //总共有多少条记录
        $count_builder= DB::table($this->table.' as a1');
        if (!empty($where)) $count_builder
            ->leftJoin(config('alias.roo').' as a2','a2.id','=','a1.operation_order_id')
            ->leftJoin(config('alias.rpo').' as a3','a3.id','=','a1.production_order_id')
            ->leftJoin(config('alias.rm').' as a4','a4.id','=','a3.product_id')
            ->where($where);
        $input['total_records']=$count_builder->count();
        return $obj_list;
    }

    public function get($input){
        //where子句条件数组 条件:工单id或者工单号 Modify By Bruce.Chu in 2018-09-12
        $where=[];
        if(isset($input[$this->apiPrimaryKey])) $where[]=['a1.id',$input[$this->apiPrimaryKey]];
        if(isset($input['wo_number'])) $where[]=['a1.number',$input['wo_number']];
        $field = [
            'a1.id as '.$this->apiPrimaryKey,
            'a1.number as wo_number',
            'a2.number as wt_number',
            'a3.number as po_number',
            'a3.sales_order_code as sales_order_code',
            'a3.sales_order_project_code as sales_order_project_code',
            'a1.in_material',
            'a1.out_material',
            'a1.total_workhour',
            'a4.item_no',
            'a4.id as  material_id',
            'a1.work_station_time',
            'a1.group_step_withnames',
            'a1.group_routing_package',
            'a1.qty',
            'a5.name as factory_name',
            'a6.name as workshop_name',
            'a6.id   as workshop_id',
            'a7.name as workcenter_name',
            'a7.id as workcenter_id',
            'a1.work_shift_id',
            'depot.id  as  depot_id',
            'depot.id  as  line_depot_id',
            'depot.code  as  depot_code',
            'depot.code  as  line_depot_code',
            'depot.name  as  depot_name',
            'a1.factory_id',
            'a1.operation_ability_id',
            'a1.routing_node_id',
            'a8.ability_name'

        ];
        $obj = DB::table($this->table.' as a1')->select($field)
            ->leftJoin(config('alias.roo').' as a2','a2.id','=','a1.operation_order_id')
            ->leftJoin(config('alias.rpo').' as a3','a3.id','=','a1.production_order_id')
            ->leftJoin(config('alias.rm').' as a4','a4.id','=','a3.product_id')
            ->leftJoin(config('alias.rf').' as a5','a5.id','=','a1.factory_id')
            ->leftJoin(config('alias.rwc').' as a7','a7.id','=','a1.work_center_id')
            ->leftJoin(config('alias.rws').' as a6','a6.id','=','a7.workshop_id')
            ->leftJoin(config('alias.rsd').' as depot','a6.address','=','depot.code')
            ->leftJoin(config('alias.rioa').' as a8','a8.id','=','a1.operation_ability_id')
            ->where($where)->first();
        if (!$obj) TEA('1208');
        //获取物料长编属性
        $temp = [];   // 定义一个临时空数组
        $attr ='';   // 定义一个空字符串，用来存物料属性      
        $vaules  = DB::table($this->materialAttributeTable)->select('value')->where('material_id',$obj->material_id)->get();
        if ($vaules) 
        {
           foreach ($vaules as $key => $value) 
            {
               $temp[]=$value->value;
            } 
        }
        $attr = implode("/", $temp);
        $obj->attr =$attr;    
        //SAP中会过来该进料替换了哪种物料，需要展示出来
        $in_material_data = json_decode($obj->in_material);
        foreach ($in_material_data as &$value){
            if(isset($value->material_replace_no)){
                $field = [
                    'material_category_id',
                    'id',
                    'item_no',
                    'name',
                    'unit_id',
                ];
                $replace_material = DB::table(config('alias.rm'))->select($field)
                    ->where('item_no',$value->material_replace_no)->first();

                if(isset($replace_material)){
                    $m=new \App\Http\Models\Material\Material;
                    $replace_material->material_attributes = $m->getAttributeByMaterial($replace_material->id);
                    $replace_material->operation_attributes = $m->getOperationAttributeValue($replace_material->id);
                    $replace_material->drawings = $m->getMaterialDrawings($replace_material->id);

                }
                $value->material_replace = $replace_material;
            }
        }
        $obj->in_material = json_encode($in_material_data);
        if(!$obj) TEA('404');
        return $obj;
    }

    public function edit($input)
    {
        $data=[
            'in_material'=>$input['in_material'],
        ];
        $res=DB::table($this->table)->where('id','=',$input['work_order_id'])->update($data);
        if(!$res) TEA('2494');
        return $res;
    }
//endregion
}
