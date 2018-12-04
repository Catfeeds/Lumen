<?php
/**
 * Created by PhpStorm.
 * User: ruiyanchao
 * Date: 2018/2/9
 * Time: 下午3:43
 */

namespace App\Http\Models;//定义命名空间
use App\Libraries\ProductOrderStrategy;
use App\Libraries\ProductOrderStrategy\MesProductOrderStrategy;
use App\Libraries\ProductOrderStrategy\SapProductOrderStrategy;
use App\Libraries\Tree;
use Illuminate\Support\Facades\DB;
use App\Http\Models\WorkOrder;
/**
 * BOM操作类
 * @author  rick
 * @time    2017年10月19日13:39:39
 */
class APS extends Base
{

    public function __construct()
    {
        parent::__construct();
    }

    public function getRules()
    {
        return array(
            'factory_id'   => array('name'=>'factory_id','type'=>'int','require'=>true,'on'=>'simplePlan,getCapacity,carefulPlan','desc'=>'工厂ID'),
            'work_shop_id'   => array('name'=>'work_shop_id','type'=>'int','require'=>true,'on'=>'simplePlan,getCapacity,carefulPlan','desc'=>'车间'),
            'work_task_id'   => array('name'=>'work_task_id','type'=>'int','require'=>true,'on'=>'simplePlan,carefulPlan','desc'=>'工作任务id'),
            'work_center_id'   => array('name'=>'work_center_id','type'=>'int','require'=>true,'on'=>'simplePlan,carefulPlan','desc'=>'工作中心'),
            'operation_id'   => array('name'=>'operation_id','type'=>'int','require'=>true,'on'=>'simplePlan','desc'=>'工序'),
            'operation_ability_id'   => array('name'=>'operation_ability_id','type'=>'int','require'=>true,'on'=>'simplePlan','desc'=>'能力'),
            'work_station_time'   => array('name'=>'work_station_time','type'=>'string','require'=>true,'on'=>'simplePlan','desc'=>'工作时间'),
            'ids'   => array('name'=>'ids','type'=>'array','format'=>'json','require'=>true,'on'=>'simplePlan,carefulPlan','desc'=>'操作ids'),
            'operation_ids'   => array('name'=>'operation_ids','type'=>'array','format'=>'json','require'=>true,'on'=>'getCapacity','desc'=>'工序ids'),
            'start'   => array('name'=>'start','type'=>'string','require'=>true,'on'=>'getCapacity','desc'=>'开始时间'),
            'end'   => array('name'=>'end','type'=>'string','require'=>true,'on'=>'getCapacity','desc'=>'结束时间'),
            'work_center'   => array('name'=>'work_center','type'=>'int','require'=>false,'on'=>'getCapacity','desc'=>'工作中心'),
            'work_shift_id'    => array('name'=>'work_shift_id','type'=>'int','require'=>true,'on'=>'carefulPlan','desc'=>'工作台'),
            'plan_start_time'    => array('name'=>'plan_start_time','type'=>'string','require'=>true,'on'=>'carefulPlan','desc'=>'计划开始时间'),
            'plan_end_time'    => array('name'=>'plan_end_time','type'=>'string','require'=>true,'on'=>'carefulPlan','desc'=>'计划结束时间'),
            'all_select_abilitys'    => array('name'=>'all_select_abilitys','type'=>'array','format'=>'json','require'=>true,'on'=>'simplePlan','desc'=>'工单选择的能力'),
        );
    }

    /**
     * 获取生产订单
     *
     * @param array $input
     * @return mixed
     */
    public function getProductOrder(&$input)
    {
        $where[]=['a1.status','=',2];   // 0 表示未发布   1 表示发布了    2 表示其下的工作任务都拆了
        $builder = DB::table(config('alias.rpo').' as a1')
            ->select('a1.id as product_order_id',
                'a1.number')
            ->offset(($input['page_no']-1)*$input['page_size'])
            ->limit($input['page_size'])
            ->where($where);
        if(!empty($input['operation_ids'])){
            $operation_ids = json_decode($input['operation_ids'],true);
            $builder->whereExists(function($query)use($operation_ids){
                $query->select('roo.production_order_id')->from(config('alias.roo').' as roo')
                    ->whereRaw('a1.id = roo.production_order_id')
                    ->whereIn('roo.operation_id',$operation_ids);
            });
        }
        //order  (多order的情形,需要多次调用orderBy方法即可)
        if (!empty($input['order']) && !empty($input['sort'])) $builder->orderBy( 'a1.'.$input['sort'], $input['order']);
        //get获取接口
        $obj_list = $builder->get();

        //总共有多少条记录
        $count_builder= DB::table(config('alias.rpo').' as a1');
        if (!empty($where)) $count_builder
            ->where($where);
        $input['total_records']=$count_builder->count();
        return $obj_list;
    }

    /**
     * 获取生产子订单（工艺单）
     *
     * 分析代码得：oo.status->1 为待排产
     *
     * @param array $input
     * @return mixed
     * @throws \App\Exceptions\ApiException
     */
    public function getWorkTask(&$input)
    {
        if(!isset($input['production_order_id'])) TEA('700','production_order_id');
        $where[]=['a1.status','=',1];
        $where[]=['a1.production_order_id','=',$input['production_order_id']];
        $builder = DB::table(config('alias.roo').' as a1')
            ->select('a1.id as work_task_id',
                'a1.number',
                'a1.operation_id',
                'a1.operation_name',
                'a1.operation_ability_pluck',
                'a1.group_step_withnames'
            )
            ->offset(($input['page_no']-1)*$input['page_size'])
            ->limit($input['page_size']);
        $operation_ids = json_decode($input['operation_ids'],true);
        if(!empty($operation_ids)){
            $builder->whereIn('a1.operation_id',$operation_ids);
        }
        if (!empty($where)) $builder->where($where);
        //order  (多order的情形,需要多次调用orderBy方法即可)
        if (!empty($input['order']) && !empty($input['sort'])) $builder->orderBy( 'a1.'.$input['sort'], $input['order']);
        //get获取接口
        $obj_list = $builder->get();

        //总共有多少条记录
        $count_builder= DB::table(config('alias.roo').' as a1');
        if (!empty($where)) $count_builder
            ->where($where);
        $input['total_records']=$count_builder->count();
        return $obj_list;
    }

    /**
     * 获取工单
     *
     * @param array $input
     * @return mixed
     */
    public function getWorkOrder(&$input)
    {
        (!empty($input['status']) || $input['status'] === 0) &&  $where[]=['a1.status','=',$input['status']];
        !empty($input['work_task_id']) &&  $where[]=['a1.operation_order_id','=',$input['work_task_id']];
        !empty($input['operation_id']) &&  $where[]=['a1.operation_id','=',$input['operation_id']];
        !empty($input['work_station_time']) &&  $where[]=['a1.work_station_time','=',strtotime($input['work_station_time'])];
        (!empty($input['work_shop_id']) && is_numeric($input['work_shop_id'])) && $where[] = ['a1.work_shop_id','=',$input['work_shop_id']];
        (!empty($input['work_center_id']) && is_numeric($input['work_center_id'])) && $where[] = ['a1.work_center_id','=',$input['work_center_id']];
//        !empty($input['production_order_number']) && $where[] = ['po.number', '=', $input['production_order_number']];//生产订单号
//        !empty($input['operation_order_number']) && $where[] = ['a2.number','=', $input['operation_order_number']];//工艺单号

        $builder = DB::table(config('alias.rwo').' as a1')
            ->select('a1.id as work_order_id',
                'a1.number',
                'a2.operation_ability_pluck',
                'a2.operation_id',
                'a2.operation_name',
                'a1.qty',
                'a1.status',
                'a1.operation_order_id as work_task_id',
                'a1.operation_id as wo_operation_id',
                'a1.operation_ability_id',
                'rioa.ability_name',
                'a1.group_step_withnames',
                'a1.total_workhour',
                'unit.commercial'
            )
            ->leftJoin(config('alias.roo').' as a2','a2.id','=','a1.operation_order_id')
            ->leftJoin(config('alias.rioa').' as rioa','rioa.id','=','a1.operation_ability_id')
            ->leftJoin(config('alias.rpo').' as po','po.id','=','a1.production_order_id')
            ->leftJoin(config('alias.ruu').' as unit','unit.id','=','po.unit_id')
            ->offset(($input['page_no']-1)*$input['page_size'])
            ->limit($input['page_size']);

        //whereBetween
        if(isset($input['start_date']) && isset($input['end_date'])) $builder->whereBetween('a1.work_station_time', [strtotime($input['start_date']), strtotime($input['end_date'])]);
        if (!empty($where)) $builder->where($where);
        //order  (多order的情形,需要多次调用orderBy方法即可)
        if (!empty($input['order']) && !empty($input['sort'])) $builder->orderBy( 'a1.'.$input['sort'], $input['order']);

        //get获取接口
        !empty($input['production_order_number']) && $builder->where('po.number',$input['production_order_number']);
        !empty($input['operation_order_number']) && $builder->where('a2.number',$input['operation_order_number']);
        $obj_list = $builder->get();

        //总共有多少条记录
        $count_builder= DB::table(config('alias.rwo').' as a1');
        if (!empty($where)) $count_builder
            ->where($where);
        //whereBetween
        if(isset($input['start_date']) && isset($input['end_date'])) $count_builder->whereBetween('a1.work_station_time', [strtotime($input['start_date']), strtotime($input['end_date'])]);
        $input['total_records']=$count_builder->count();
        return $obj_list;
    }

    /**
     * 获取PO和他下面的WT的所有信息
     *
     * @param array $input
     * @return mixed
     */
    public function getProductOrderInfo(&$input)
    {
        if(!isset($input['production_order_id'])) TEA('700','production_order_id');
        $where1[]=['a1.id','=',$input['production_order_id']];

        $builder = DB::table(config('alias.rpo').' as a1')
            ->select('a1.id as product_order_id',
                'a1.ctime',
                'a1.number',
                'a1.status',
                'a1.qty',
                'a1.scrap',
                'a1.start_date',
                'a1.end_date',
                'a2.description',
                'a1.sales_order_code',
                'a2.name as material_name',
                'a2.item_no as item_no',
                'a1.routing_id',
                'a1.unit_id',
                'a3.commercial'
            )
            ->leftJoin(config('alias.rm').' as a2','a2.id','=','a1.product_id')
            ->leftJoin(config('alias.ruu').' as a3', 'a3.id', '=', 'a1.unit_id')
            ->where($where1);
        //get获取接口
        $obj_po = $builder->first();

        $where2[]=['a2.production_order_id','=',$input['production_order_id']];
        $where2[]=['a2.is_outsource','=','0'];
        $builder = DB::table(config('alias.roo').' as a2')
            ->select('a2.id as wt_id',
                'a2.number',
                'a2.operation_id',
                'a2.operation_name',
                'a2.status as wt_status',
                'a2.qty',
                'a2.out_material_name',
                'a2.belong_bom_id',
                'a2.group_step_withnames',
                'a2.workhour_package',
                'a3.item_no',
                'a2.level',
                'a2.code',
                'a2.simple_plan_start_time',
                'a2.simple_plan_end_time',
                'a2.is_outsource'
            )
            ->leftJoin(config('alias.rm').' as a3','a2.out_material_id','=','a3.id');
            //->offset(($input['page_no']-1)*$input['page_size'])
            //->limit($input['page_size']);
        $operation_ids = json_decode($input['operation_ids'],true);
        if(!empty($operation_ids)){
            $builder->whereIn('a2.operation_id',$operation_ids);
        }
        if (!empty($where2)) $builder->where($where2);
        //order  (多order的情形,需要多次调用orderBy方法即可)
        if (!empty($input['order']) && !empty($input['sort'])) $builder->orderBy( 'a2.'.$input['sort'], $input['order']);
        //get获取接口
        $obj_wt = $builder->get();

        //总共有多少条记录
        $count_builder= DB::table(config('alias.roo').' as a2');
        if (!empty($where2)) $count_builder
            ->where($where2);
        $input['total_records']=$count_builder->count();
        $work_task=new WorkOrder();
        //对现有wt的数据进行分类汇总
        foreach($obj_wt as $key => &$value){
            $wt_id = $value->wt_id;
            //判断wt状态 若wt未拆单 拆wt 否 过滤
            if(!$value->wt_status && $value->is_outsource == 0){
                $work_task->split(['operation_order_id'=>$wt_id,'split_rules'=>json_decode("[$value->qty]",true)]);
                //拆单成功之后状态修改 这时库中状态已为1 返还给前端的状态也及时修改
                $value->wt_status=1;
            }
            //获取该wt下已排和总得wo数量
            $wo_in=DB::table(config('alias.rwo'))
                ->select('SUM(qty) as sum')
                ->where([['operation_order_id', $wt_id], ['status', '<>', 0]])
                ->sum('qty');
            $wo_all = $value->qty;
            $value->wt_completion = $wo_in .'/' .$wo_all;

            //计算wt的预估工时
            $array_total_hours = array();
            $group_step_withnames = json_decode($value->group_step_withnames);
            $array_workhour_package = json_decode($value->workhour_package);
            $bom_id = $value->belong_bom_id;
            if(!empty($array_workhour_package)){
                $workhour_model=new WorkHour();
                $array_total_hours = $workhour_model->countTotalHours($bom_id,obj2array($group_step_withnames),$wo_all,obj2array($array_workhour_package));
            }
            $count_hour = 0;
            foreach($array_total_hours as $value4){
                if(isset($value4['base_hour'])){
                    $count_hour = $count_hour + $value4['base_hour']['total_hour'];
                }
            }
            //预估工时
            $value->wt_estimate_workhour = $count_hour;

            //获取wt底下所有wo的排单时间，用于甘特图
            $wo_count = DB::table(config('alias.rwo'))
                ->where([['operation_order_id', '=', $wt_id],['status', '<>', 0]])
                ->count();

            if($wo_count <= 0 ){
                $value->simple_plan_start_time = '';
                $value->simple_plan_end_time = '';
            }
        }

        //将PO底下的wt进行汇总
        $obj_po->wt_info = $obj_wt;
        return $obj_po;
    }

    /**
     * 主排（粗排）
     *
     * @param array $input
     * @throws \App\Exceptions\ApiException
     * @throws \Exception
     */
    public function simplePlan($input)
    {
        $this->checkRules($input);
        // 判断是否允许排产
        $result = $this->isAllow($input['work_task_id'],$input['work_station_time']);
        if(!$result) {
            TEA('2405');    // 依赖订单排产时间前尚未完成排产，请先完成依赖订单排产！
        }
        //找到要排工单
        $workOrderList = DB::table(config('alias.rwo'))
            ->whereIn('id',$input['ids'])
            ->where('status',0)
            ->get();
        try{
            DB::connection()->beginTransaction();
            foreach ($workOrderList as $k=>$v){
                $total_workhour = $this->countWorkOrderTotalWorkHour(json_decode($v->current_workhour_package,true),$input['all_select_abilitys']) * $v->qty;
                $data = [
                    'status'=>1,
                    'factory_id'=>$input['factory_id'],
                    'work_shop_id'=>$input['work_shop_id'],
                    'work_center_id'=>$input['work_center_id'],
                    'operation_id'=>$input['operation_id'],
                    'operation_ability_id'=>$input['operation_ability_id'],
                    'work_station_time'=>strtotime($input['work_station_time']),
                    'select_ability_info'=>json_encode($input['all_select_abilitys']),
                    'total_workhour'=>$total_workhour,
                ];
                $res = DB::table(config('alias.rwo'))
                    ->where('id',$v->id)
                    ->update($data);
                if($res === false) TEA('804');
            }
            /**
             * 数据库原来备注：rwo.status 0是未发布，1是发布 ，2是粗排
             *
             * 分析代码结果：rwo.status 0->发布, 1->粗排
             *
             * 所有的 WO 均完成排产之后，oo.status状态更改为 2
             */
            $need = DB::table(config('alias.rwo'))
                ->where([['operation_order_id','=',$input['work_task_id']],['status','=',0]])
                ->first();
            if(empty($need)){
                DB::table(config('alias.roo'))
                    ->where('id', $input['work_task_id'])
                    ->update([
                        'status'=>2,
                    ]);
                $wo = DB::table(config('alias.rwo'))
                    ->whereIn('id', $input['ids'])
                    ->first();
                $tmp = DB::table(config('alias.roo'))
                    ->where([['production_order_id','=',$wo->production_order_id],['status','=',1]])
                    ->count();
                // 所有的 WT排完后，PO状态更新为 3
                if(empty($tmp)){
                    DB::table(config('alias.rpo'))
                        ->where('id', $wo->production_order_id)
                        ->update([
                            'status'=>3,
                        ]);
                }
            }
        }catch (\ApiException $exception){
            DB::connection()->rollBack();
            TEA($exception->getCode());
        }
        DB::connection()->commit();
    }

    /**
     * @param array $input
     * @throws \App\Exceptions\ApiException
     * @throws \Exception
     */
    public function carefulPlan($input)
    {
        $this->checkRules($input);
//        $result = $this->isAllow($input['work_task_id']);
//        if(!$result){
//            TEA('2405');
//        }
        $result = DB::table(config('alias.rwo'))
            ->whereIn('id', $input['ids'])
            ->update([
                'status'=>2,
                //'company_id'=>'',
                'factory_id'=>$input['factory_id'],
                'work_shop_id'=>$input['work_shop_id'],
                'work_center_id'=>$input['work_center_id'],
                'work_shift_id'=>$input['work_shift_id'],
                'plan_start_time'=>strtotime($input['plan_start_time']),
                'plan_end_time'=>strtotime($input['plan_end_time']),
                'rank_plan_id'=>isset($input['rank_plan_id']) ? $input['rank_plan_id'] : 0,
                'rank_plan_type_id'=>isset($input['rank_plan_type_id']) ? $input['rank_plan_type_id'] : 0,
            ]);
        if($result===false) TEA('804');
    }

    public function getCapacity($input)
    {
        $this->checkRules($input);
        $start = strtotime($input['start']);
        $end   = strtotime($input['end']);

        !empty($input['factory_id']) &&  $where[]=['a1.factory_id','=',$input['factory_id']];
        !empty($input['work_shop_id']) &&  $where[]=['a1.work_shop_id','=',$input['work_shop_id']];
        !empty($input['work_center']) &&  $where[]=['a1.work_center_id','=',$input['work_center']];
        $where[]=['a1.status','=',1];

        $result = DB::table(config('alias.rwo').' as a1')
            ->select('a1.id','a1.number','a1.operation_id','a1.operation_ability_id','a1.qty','a2.operation_ability_pluck','a1.work_station_time','a1.total_workhour as power')
            ->leftJoin(config('alias.roo').' as a2','a2.id','=','a1.operation_order_id')
            ->whereBetween('a1.work_station_time', [$start, $end])
            ->whereIn('a1.operation_id',$input['operation_ids'])
            ->where($where)
            ->get();
        foreach ($result as $key=>&$value){
            $value->work_station_time = date('Y-m-d',$value->work_station_time);
//            $ability = json_decode($value->operation_ability_pluck);
//            $id=$value->operation_ability_id;
//            $standard_working_hours = $ability->$id->standard_working_hours;
//            $value->power = $standard_working_hours*$value->qty;
        }
        return $result;

    }

    public function destroy($input)
    {
        if(empty($input['id']) || !is_numeric($input['id'])) TEA('700','id');
        $workorder = DB::table(config('alias.rwo'))->where('id',$input['id'])->first();
        if(empty($workorder)) TEA('700','id');
        try{
            DB::connection()->beginTransaction();
            $rwo_result = DB::table(config('alias.rwo'))
                ->where('id', $input['id'])
                ->update([
                    'status'=>0,
                ]);
            if($rwo_result===false) TEA('804');
            $roo_res = DB::table(config('alias.roo'))
                ->where([['id','=',$workorder->operation_order_id],['status','=',2]])
                ->update(['status'=>1]);
            if($roo_res === false) TEA('804');
            $rpo_res = DB::table(config('alias.rpo'))
                ->where([['id','=',$workorder->production_order_id],['status','=',3]])
                ->update(['status'=>2]);
            if($rpo_res === false) TEA('804');

            //如果WT下的WO没有排单，得清空WT的排单日期
            $count_wo = DB::table(config('alias.rwo'))
                ->where([['operation_order_id','=',$workorder->operation_order_id],['status','<>',0]])
                ->count();
            if($count_wo <= 0){
                $roo_res2 = DB::table(config('alias.roo'))
                    ->where([['id','=',$workorder->operation_order_id]])
                    ->update(['simple_plan_start_time'=>'','simple_plan_end_time'=>'']);
                if($roo_res2 === false) TEA('804');
            }

        }catch(\ApiException $e){
            DB::connection()->rollback();
            TEA($e->getCode());
        }
        DB::connection()->commit();
    }

    /**
     * 拆单
     *
     * @param array $input
     * @return mixed
     * @throws \App\Exceptions\ApiException
     * @throws \Illuminate\Container\EntryNotFoundException
     */
    public function splitWorkOrder($input)
    {
        $workHourDao = new WorkHour();
        if(empty($input['id']))
            TEA('700','id');
        if(empty($input['qty']))
            TEA('700','qty');
        try {
            DB::connection()->beginTransaction();
            $RoutingModel = new RoutingOrder();
            $wo = DB::table(config('alias.rwo'))->where('id','=',$input['id'])->first();
            //原工单要减去拆出去的qty
            $original_qty = $wo->qty - $input['qty'];
            if($original_qty <= 0) TEA('809');
            //重新计算进出料
            $original_in_material = json_encode(array_map(function($material)use($original_qty){
                $material['qty'] = round($material['usage_number'] * $original_qty,3);
                return $material;
            },json_decode($wo->in_material,true)));
            $original_out_material = json_encode(array_map(function($material)use($original_qty){
                $material['qty'] = round($material['usage_number'] * $original_qty,0);
                return $material;
            },json_decode($wo->out_material,true)));

            $original_workhour_package = $workHourDao->countTotalHours($wo->belong_bom_id, json_decode($wo->group_step_withnames, true), $original_qty, json_decode($wo->workhour_package, true));
            $select_ability_info = json_decode($wo->select_ability_info, true);
            if(!is_array($select_ability_info)){
                $select_ability_info = json_decode($select_ability_info, true);
            }
            if($wo->status == 1){
                $update_total_workhour = $this->countWorkOrderTotalWorkHour($original_workhour_package, $select_ability_info);
            }else{
                $update_total_workhour = 0;
            }

            DB::table(config('alias.rwo'))
                ->where('id', $input['id'])
                ->update([
                    'qty'=>$original_qty,
                    'current_workhour_package'=>json_encode($original_workhour_package),
                    'in_material'=>$original_in_material,
                    'out_material'=>$original_out_material,
                    'total_workhour'=>$update_total_workhour,
                    'group_routing_package'=>json_encode($RoutingModel->addQtyInRoutingPackage(json_decode($wo->group_routing_package,true),$original_qty,'','')),
                ]);
            //要拆出去的qty
            $qty = $input['qty'];

            //拆单时，总工时得重新计算
            $current_workhour_package2 = $workHourDao->countTotalHours($wo->belong_bom_id,json_decode($wo->group_step_withnames,true),$input['qty'],json_decode($wo->workhour_package,true));
            if($wo->status == 1){
                $split_total_insert_hours = $this->countWorkOrderTotalWorkHour($current_workhour_package2, $select_ability_info);
            }else{
                $split_total_insert_hours = 0;
            }

            $data=[
                'number'=>get_order_sn('WO'),
                'production_order_id'=>$wo->production_order_id,
                'confirm_number_RUECK'=>$wo->confirm_number_RUECK,
                'factory_id' => $wo->factory_id,
                'work_shop_id' => $wo->work_shop_id,
                'work_center_id'=>$wo->work_center_id,
                'work_station_time'=>$wo->work_station_time,
                'operation_order_id'=>$wo->operation_order_id,
                'operation_id'=>$wo->operation_id,
                'operation_ability_id'=>$wo->operation_ability_id,
                'is_end_operation'=>$wo->is_end_operation,
                'qty'=>$input['qty'],
                'in_material'=>json_encode(array_map(function($material)use($qty){
                    $material['qty'] = round($material['usage_number'] * $qty,3);
                    return $material;
                },json_decode($wo->in_material,true))),
                'out_material'=>json_encode(array_map(function($material)use($qty){
                    $material['qty'] = round($material['usage_number'] * $qty,3);
                    return $material;
                },json_decode($wo->out_material,true))),
                'admin_id'=>(!empty(session('administrator')->admin_id)) ? session('administrator')->admin_id : 0,
                'created_at'=>time(),
                'status'=>$wo->status,
                'belong_bom_id'=>$wo->belong_bom_id,
                'group_step_withnames'=>$wo->group_step_withnames,
                'select_ability_info'=>$wo->select_ability_info,
                'group_routing_package'=>json_encode($RoutingModel->addQtyInRoutingPackage(json_decode($wo->group_routing_package,true),$input['qty'],'','')),
                'current_workhour_package'=>json_encode($workHourDao->countTotalHours($wo->belong_bom_id,json_decode($wo->group_step_withnames,true),$input['qty'],json_decode($wo->workhour_package,true))),
                'total_workhour'=>$split_total_insert_hours,
                'workhour_package'=>$wo->workhour_package,
                'routing_operation_index'=>$wo->routing_operation_index,
                'routing_step_index'=>$wo->routing_step_index,
                'routing_node_id'=>$wo->routing_node_id,
            ];
            $insert_id = DB::table(config('alias.rwo'))->insertGetId($data);

        } catch (\ApiException $e) {
            DB::connection()->rollBack();
            TEA($e->getCode());
        }
        DB::connection()->commit();
        if (!$insert_id) TEA('802');
        return $insert_id;
    }

    /**
     * @param int $id ruis_operation_order.id 工艺单
     * @param string $time 日期：y-m-d
     * @return bool
     * @since lester.you 添加注释
     */
    public function isAllow($id,$time)
    {
        //$oo      = DB::table(config('alias.roo'))->where('id','=',$id)->first();
        $model   = new OperationOrder();
        $rely_on = $model->getOperationOrderSons($id);  // 获取工艺单
        /**
         * 排产需要先排下一级，才能排当前一级.
         *
         * 如果下一级为空，可以允许当前排产;
         * r
         */
        if(empty($rely_on)){
            return true;
        }else{
            $ids = array_keys($rely_on);
            //TODO 添加后续的一些状态 目前只有1为可用
            // 获取 给定的时间之前 子工艺单的WO 已完成粗排的数量
            $real = DB::table(config('alias.rwo'))
                ->select('id','qty','operation_order_id')
                ->whereIn('operation_order_id',$ids)
                ->where([['status','=',1],['work_station_time','<=',strtotime($time)]])
                ->count();
            // 获取 子工艺单 下 所有的 WO
            $need = DB::table(config('alias.rwo'))
                ->select('id','qty','operation_order_id')
                ->whereIn('operation_order_id',$ids)
                ->count();
            // 如果 总的WO和已排产的WO相等，即 子工艺单所有的WO均已完成排产
            if($real == $need){
                return true;
            }else{
                return false;
            }

            //TODO 注释部分是存在做一半拿一半的情况
//            if(empty($all)){
//                return false;
//            }else{
//                $tmp =   obj2array($all);
//                foreach ($rely_on as $key=>$value){
//                    $rely_on[$key]['detail'] =0;
//                    foreach ($tmp as $row){
//                        if($key == $row['operation_order_id']){
//                            $rely_on[$key]['detail'] = $rely_on[$key]['detail']+$row['qty'];
//                        }
//                    }
//                }
//
//            }

        }
    }

    /**
     * 判断能否排产
     * @param $input
     * @return array
     * @throws \App\Exceptions\ApiException
     */
    public function checkCanPlan($input){
        //先判断产能够不够用
        //找到哪些工单
        $ids = json_decode($input['ids'],true);
        $workOrderList = DB::table(config('alias.rwo'))
                        ->whereIn('id',$ids)
                        ->where('status',0)
                        ->get();
        if(empty($workOrderList)) TEA('1600');
        //找到车间或工作中心的工序的能力的产能
        //先找到车间或工作中心下班次，因为班次是维护在工作中心层的
        $rankWhere = [];
        $rankWhere[] = ['rwc.workshop_id','=',$input['workshop_id']];
        if(!empty($input['workcenter_id'])) $rankWhere[] = ['rwc.id','=',$input['workcenter_id']];
        $workcenterRankList = DB::table(config('alias.rwcr').' as rwcr')
            ->leftJoin(config('alias.rwc').' as rwc','rwcr.workcenter_id','rwc.id')
            ->leftJoin(config('alias.rrp').' as rrp','rwcr.rankplan_id','rrp.id')
            ->select('rrp.work_time','rrp.work_date','rwcr.workcenter_id')
            ->where($rankWhere)->get();
        //处理一下班次的workdate的json数据
        foreach ($workcenterRankList as $k=>&$v){
            $v->work_date = json_decode($v->work_date,true);
        }
        //找到具有选择的能力的工作台，并且要带出工作中心才能算出该车间或者该工作中心下该能力的产能
        $workBenchWhere = [];
        $workBenchWhere[] = ['rwc.workshop_id','=',$input['workshop_id']];
        $workBenchWhere[] = ['rwboa.operation_to_ability_id','=',$input['workcenter_operation_to_ability_id']];
        if(!empty($input['workcenter_id'])) $workBenchWhere[] = ['rwc.id','=',$input['workcenter_id']];
        $workbenchList = DB::table(config('alias.rwboa').' as rwboa')
            ->leftJoin(config('alias.rwb').' as rwb','rwb.id','rwboa.workbench_id')
            ->leftJoin(config('alias.rwc').' as rwc','rwc.id','rwb.workcenter_id')
            ->where($workBenchWhere)
            ->pluck('rwb.workcenter_id');
        //计算产能
        $capacity = 0;
        foreach ($workbenchList as $k=>$v){
            foreach ($workcenterRankList as $w=>$j){
                if($v == $j->workcenter_id && in_array($input['week_date'],$j->work_date)){
                    $capacity += $j->work_time;
                }
            }
        }
        //所有工单根据前端选择的工单的能力计算总工时
        $all_select_abilitys = json_decode($input['all_select_abilitys'],true);
        $allWorkOrderTotalWorkHour = 0;
        $alertMessage = [];
        foreach ($workOrderList as $k=>$v){
            //如果有顺序比较小的工单应该给出提醒,不应该在循环内做查询，但是不知道怎么换
            $moreSmallIndexWorkOrderList = DB::table(config('alias.rwo'))->select('id')
                ->where('production_order_id',$v->production_order_id)
                ->whereNotIn('id',$ids)
                ->whereRaw('(routing_operation_index < ? or routing_step_index < ?)',[$v->routing_operation_index,$v->routing_step_index])
                ->get();
            if(!empty($moreSmallIndexWorkOrderList)){
                $alertMessage[] = "有工序或者步骤在 $v->number 前的工单";
            }
            $allWorkOrderTotalWorkHour += $this->countWorkOrderTotalWorkHour(json_decode($v->current_workhour_package,true),$all_select_abilitys) * $v->qty;
        }
        //如果车间或工作中心拿出来的产能为0或者小于所有工单的总工时，直接抛出异常
        if($capacity <= 0 || $capacity < $allWorkOrderTotalWorkHour) TEA('1601');
        return $alertMessage;
    }

    /**
     * 根据选择的步骤的能力计算工单的总工时
     * @param $workorder_current_workhour_package
     * @param $select_ability
     */
    public function countWorkOrderTotalWorkHour($workorder_current_workhour_package,$select_ability){
        $total_workHour = 0;
        foreach ($select_ability as $k=>$v){
            //能力不选或者当前工时包中步骤不存在
            if(empty($v) || empty($workorder_current_workhour_package[$k])) continue;
            //步骤下能力为空或者步骤下能力的total_hour为空为0
            if(empty($workorder_current_workhour_package[$k][$v]) || empty($workorder_current_workhour_package[$k][$v]['total_hour'])){
                $total_workHour += isset($workorder_current_workhour_package[$k]['base_hour']['total_hour']) ? $workorder_current_workhour_package[$k]['base_hour']['total_hour'] : 0;
            }else{
                $total_workHour += $workorder_current_workhour_package[$k][$v]['total_hour'];
            }
        }
        return $total_workHour;
    }

    /**
     * 要做排产的预估工时，实际工时乘以系数后误差会特别大，现在只取标准工时来计算
     * 根据选择的步骤的能力计算工单的总工时
     * @param $workorder_current_workhour_package
     * @param $select_ability
     */
    public function countWorkOrderTotalWorkHour2($workorder_current_workhour_package,$select_ability){
        $total_workHour = 0;
        foreach ($select_ability as $k=>$v){
            //能力不选或者当前工时包中步骤不存在
            if(empty($v) || empty($workorder_current_workhour_package[$k])) continue;
            //步骤下能力为空或者步骤下能力的total_hour为空为0
            if(empty($workorder_current_workhour_package[$k][$v]) || empty($workorder_current_workhour_package[$k][$v]['total_hour'])){
                $total_workHour += isset($workorder_current_workhour_package[$k]['base_hour']['sign_hours']) ? $workorder_current_workhour_package[$k]['base_hour']['sign_hours'] : 0;
            }else{
                $total_workHour += $workorder_current_workhour_package[$k][$v]['sign_hours'];
            }
        }
        return $total_workHour;
    }

    /**
     * 要做排产的预估工时，实际工时乘以系数后误差会特别大，现在只取标准工时来计算
     * 根据选择的步骤的能力计算工单的总工时
     * @param $workorder_current_workhour_package
     * @param $select_ability
     */
    public function countOtherWorkHour($workorder_current_workhour_package,$select_ability){
        $total_workHour = 0;
        foreach ($select_ability as $k=>$v){
            //能力不选或者当前工时包中步骤不存在
            if(empty($v) || empty($workorder_current_workhour_package[$k])) continue;
            //步骤下能力为空或者步骤下能力的total_hour为空为0
            if(empty($workorder_current_workhour_package[$k][$v]) || empty($workorder_current_workhour_package[$k][$v]['sign_hours'])){
                if(isset($workorder_current_workhour_package[$k]['base_hour'])){
                    $total_workHour = $total_workHour + $workorder_current_workhour_package[$k]['base_hour']['sample_hours']
                        + $workorder_current_workhour_package[$k]['base_hour']['liuzhuan']
                        + $workorder_current_workhour_package[$k]['base_hour']['preparation_hour'];
                }
            }else{
                $total_workHour = $total_workHour + $workorder_current_workhour_package[$k][$v]['sample_hours']
                    + $workorder_current_workhour_package[$k][$v]['liuzhuan']
                    + $workorder_current_workhour_package[$k][$v]['preparation_hour'];
            }
        }
        return $total_workHour;
    }

    public function getCarefulPlan($input)
    {
       $time = strtotime($input['time']);
       $work_center_id = $input['work_center_id'];
       //该工作中心下的所有工作台
       $work_bench = DB::table(config('alias.rwb'))
           ->select('id','name')
           ->where('workcenter_id',$work_center_id)
           ->get();
       $result = DB::table(config('alias.rwo').' as a1')
           ->select('a1.id as work_order_id','a1.number','a1.plan_start_time','a1.plan_end_time','a1.work_shift_id','a2.name','a1.total_workhour')
           ->where([
               ['a1.work_station_time','=',$time],
               ['a1.work_center_id','=',$work_center_id],
               ['a1.status','=',2],
           ])
           ->leftJoin(config('alias.rwb').' as a2','a2.id','=','a1.work_shift_id')
           ->get();
        $data = [];
       foreach ($work_bench as $row){
           $row_tmp['work_bench_id']  = $row->id;
           $row_tmp['name']           = $row->name;
           $data[$row->id]  = $row_tmp;
           $data[$row->id]['task_list'] = array();
           //工作台关联的设备
           $device=DB::table(config('alias.rwbdi').' as bench_device')
               ->leftJoin(config('alias.rdlt').' as device','bench_device.device_id','device.id')
               ->where('bench_device.workbench_id',$row->id)
               ->where('bench_device.device_id','<>',0)
               ->select('device.id','device.code','device.name')
               ->get();
           $data[$row->id]['device'] = obj2array($device);
       }
       foreach ($result as $key=>$value){
           $tmp['work_bench_id']  = $value->work_shift_id;
           $tmp['name']  = $value->name;
           $tmp_child['number'] = $value->number;
           $tmp_child['plan_start_time'] = $value->plan_start_time==null?'':date('Y-m-d H:i:s',$value->plan_start_time);
           $tmp_child['plan_end_time'] = $value->plan_end_time==null?'':date('Y-m-d H:i:s',$value->plan_end_time);
           $tmp_child['time'] = $value->plan_end_time-$value->plan_start_time;
           $tmp_child['total_workhour'] = $value->total_workhour;
           if(isset($data[$value->work_shift_id])){
               $data[$value->work_shift_id]['task_list'][] = $tmp_child;
           }else{
               $data[$value->work_shift_id]=$tmp;
               $data[$value->work_shift_id]['task_list'][] = $tmp_child;
           }
       }
       return array_values($data);
    }

    /**
     * 分发策略
     * @param ProductOrderStrategy $strategy
     * @return mixed
     * @author Bruce.Chu
     */
    public function setStrategy(ProductOrderStrategy $strategy)
    {
        return $strategy->getWorkCenterInfo();
    }

    /**
     * 拉出生产该PO的工作中心相关信息+产能计算
     * @param $input
     * @return array
     * @author Bruce.Chu
     */
    public function getWorkCenterInfo($input)
    {
        //根据PO来源 应用不同策略 来源 1:Mes,2:Erp,3:Sap
        $from=$this->getFieldValueById($input['production_order_id'],'from',config('alias.rpo'));
        //PHP单次请求结束之后会释放内存 单例也就不存在了 因而废弃单例模式
        if($from==3) $strategy = new SapProductOrderStrategy($input);
        if($from==1) $strategy = new MesProductOrderStrategy($input);
        return $this->setStrategy($strategy);
    }

    /**
     * 查询所有的工作中心
     * @return mixed
     * @author Bruce.Chu
     */
    public function showAllWorkCenters()
    {
        //找到所有厂
        $factorys=DB::table(config('alias.rf'))->select('id as factory_id','name as factory_name')->orderBy('code')->get();
        foreach ($factorys as $factory){
            //找到厂下属的所有工作车间
            $factory->workshops=DB::table(config('alias.rws'))->select('id as workshop_id','name as workshop_name')->where('factory_id',$factory->factory_id)->get();
            foreach($factory->workshops as $workshop){
                //找到车间下属的所有工作中心
                $workshop->workcenters=DB::table(config('alias.rwc'))->select('id as workcenter_id','name as workcenter_name')->where('workshop_id',$workshop->workshop_id)->get();
            }
        }
        return $factorys;
    }

    /**
     * 查询指定工作中心绑定的排班
     * @param $input
     * @return array
     * @author Bruce.Chu
     */
    public function showWorkCenterRankPlan($input)
    {
        $workcenter_id=$input['work_center_id'];
        //前端传递 工单的细排日期
        $work_station_time=strtotime($input['work_station_time']);
        //拿到该工作中心绑定的排班id
        $rank_plan_ids=DB::table(config('alias.rwcr'))->where('workcenter_id',$workcenter_id)->pluck('rankplan_id');
        //判断前端传递的日期是周几
        $time_week=date('w',$work_station_time);
        //排班信息 班次名称 排班可能有多个
        $rank_plan=DB::table(config('alias.rrp').' as plan')
            ->leftJoin(config('alias.rrpt').' as plan_type','plan.type_id','plan_type.id')
            ->select('plan.from as work_time_start','plan.to as work_time_end','plan.work_date',
                'plan.rest_time','plan.id as rank_plan_id','plan.work_time','plan_type.name','plan_type.id as rank_plan_type_id')
            ->whereIn('plan.id',$rank_plan_ids)
            ->get();
        //筛出包含前端传递日期的排班
        $rank_plan=array_filter(obj2array($rank_plan),function($value) use($time_week){
            return in_array($time_week,json_decode($value['work_date']));
        });
        //格式化返回给前端的数据 工作休息时长等数据
        foreach ($rank_plan as &$plan){
            unset($plan['work_date']);
            $rest_time=json_decode($plan['rest_time']);
            $plan['rest_time_start']=$rest_time[0]->rest_from;
            $plan['rest_time_end']=$rest_time[0]->rest_to;
            unset($plan['rest_time']);
        }
        //排班按照开始上班时间升序排序
        array_multisort($rank_plan);
        return $rank_plan;
    }

    /**
     * 格式化指定日期的所有工单
     * @param $input
     * @return array
     * @author Bruce.Chu
     */
    public function getWorkOrdersByDate($input)
    {
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
                    $where[] = ['wo.factory_id', '=', $emploee_info->factory_id];//区分到厂
                } elseif ($emploee_info->factory_id != 0 && $emploee_info->workshop_id != 0) {
                    $where[] = ['wo.work_shop_id', '=', $emploee_info->workshop_id];//区分到车间
                }
            }
        }
        ####

        $where=[['wo.work_station_time',strtotime($input['work_station_time'])],['wo.status','<>',0]];
        !empty($input['production_order_number']) && $where[] = ['po.number', '=', $input['production_order_number']];//生产订单号
        !empty($input['work_order_number']) && $where[] = ['wo.number','=', $input['work_order_number']];//工艺单号

        //查询指定日期的所有工单
        $work_orders=DB::table(config('alias.rwo').' as wo')
            ->leftJoin(config('alias.rpo').' as po','po.id','wo.production_order_id')
            ->leftJoin(config('alias.ruu').' as unit','unit.id','po.unit_id')
            ->leftJoin(config('alias.rwc').' as work_center','work_center.id','wo.work_center_id')
            ->leftJoin(config('alias.rioa').' as ability','ability.id','wo.operation_ability_id')
            ->select('wo.id as work_order_id','wo.number','wo.qty','wo.work_center_id','wo.work_shop_id',
                'wo.status','wo.factory_id', 'wo.operation_id','wo.total_workhour','unit.commercial',
                'wo.operation_ability_id','work_center.name as work_center_name','ability.ability_name')
            ->where($where)
            ->get();
        //转为数组 方便使用
        $work_orders=obj2array($work_orders);
        //取出工单列表的厂的集合 去重 索引置0
        $factory_ids=array_column($work_orders,'factory_id');
        $factory_ids=array_values(array_unique($factory_ids));
        //声明结果返回数组
        $result=[];
        //格式化工单层级结构 厂->工序->工单
        foreach ($factory_ids as $key=>$factory_id){
            //厂的基础信息 包括厂id 厂名 工单在该厂下的工序
            $factory_name=DB::table(config('alias.rf'))->where('id',$factory_id)->value('name');
            //筛出每个厂下面的工单
            $factory_wo=array_values(array_filter($work_orders,function($value) use($factory_id){
                return ($value['factory_id']===$factory_id);
            }));
            //取出该厂工单所使用的工序 去重 索引置0
            $operation_ids=array_column($factory_wo,'operation_id');
            $operation_ids=array_values(array_unique($operation_ids));
            //声明工序数组 厂的下一级
            $operation_info=[];
            foreach ($operation_ids as $k=>$operation_id){
                //工序的基础信息 包括工序id 工序名 在该厂使用该工序的工单
                $operation_name=DB::table(config('alias.rio'))->where('id',$operation_id)->value('name');
                $operation_wo=array_values(array_filter($factory_wo,function ($value) use ($operation_id){
                    return ($value['operation_id']===$operation_id);
                }));
                //填充工序数组
                $operation_info[$k]=['operation_id'=>$operation_id,'operation_name'=>$operation_name,'work_orders'=>$operation_wo];
            }
            //填充厂数组
            $factory_info=['factory_id'=>$factory_id,'factory_name'=>$factory_name,'operations'=>$operation_info];
            //填充结果返回数组
            $result[$key]=$factory_info;
        }
        return $result;
    }

    /**
     * 按时间段排产的校验
     * @param $input
     * @return array
     * @throws \App\Exceptions\ApiException
     * kevin
     */
    public function checkCanPlanByPeriod($input){
        //先判断产能够不够用
        //找到哪些工单
        $ids = $input['ids'];
        $workOrderList = DB::table(config('alias.rwo'))
            ->whereIn('id',$ids)
            ->where('status',0)
            ->get();
        if(empty($workOrderList)) TEA('1600');

        if(empty($input['workcenter_id']) || empty($input['workshop_id'])) TEA('1603');

        if(!isset($input['start_time']) || !isset($input['end_time'])) TEA('700','start_time');

        $today_time=mktime(0, 0, 0, date('m'), date('d'), date('Y'));
        if(strtotime($input['end_time']) < $today_time) TEA('1605');

        $workhour_model=new WorkHour();

        //工作中心的总产能
        //$period_all_ability_capacity = $input['total_capacity'];

        //计算产能：遍历时间段，计算该能力对应的所有时间段的总产能
        //获取日期时间段数组
        $start_time = $input['start_time'];
        if(strtotime($input['start_time']) < $today_time) {$start_time = date("Y-m-d", $today_time);}

        $daterange = $this->getDateRange($start_time,$input['end_time']);

        $period_ability_capacity = 0;
        //计算一种能力总的工作时间（总产能），因为一天中所有能力的工作时间都是一样的（物料选不同能力用时不一样）
        foreach($daterange as $date){
            $weekday = date("w",strtotime($date['date']));
            $oneday_all_ability_capacity = $this->getCapacityByWeekdayAbility($input['workshop_id'],$input['workcenter_id'],$weekday,$input['workcenter_operation_to_ability_id']);
            $period_ability_capacity += $oneday_all_ability_capacity;
        }
        //获得当前所选能力已经占用的工作时间（排入工单）
        $workorderWhere = [];
        $workorderWhere[] = ['rwo.work_shop_id','=',$input['workshop_id']];
        $workorderWhere[] = ['rwo.work_center_id','=',$input['workcenter_id']];
        $workorderWhere[] = ['rwo.operation_ability_id','=',$input['workcenter_operation_to_ability_id']];
        $workorderWhere[] = ['rwo.work_station_time','>=',strtotime($start_time)];
        $workorderWhere[] = ['rwo.work_station_time','<=',strtotime($input['end_time'])];
        $workcenterHasCapacity = DB::table(config('alias.rwo').' as rwo')
            ->select('rwo.number','rwo.total_workhour')
            ->where($workorderWhere)
            ->whereIn('rwo.status',[1,2])
            ->get();
        $hasCapacity = 0;
        foreach ($workcenterHasCapacity as $each){
            $hasCapacity += $each->total_workhour;
        }
        //工作中心，当前能力剩余工作时间
        $left_ability_capacity = $period_ability_capacity - $hasCapacity;

        //所有工单根据前端选择的工单的能力计算总工时
        $all_select_abilitys = json_decode($input['all_select_abilitys'],true);
        $allWorkOrderTotalWorkHour = 0;
        $alertMessage = [];
        foreach ($workOrderList as $k=>$v){
            $orderWhere = [];
            $orderWhere[] = ['production_order_id','=',$v->production_order_id];
            $orderWhere[] = ['status','=',0];
            $moreSmallIndexWorkOrderList = DB::table(config('alias.rwo'))->select('id')
                ->where($orderWhere)
                ->whereNotIn('id',$ids)
                ->whereRaw('(routing_operation_index < ?)',[$v->routing_operation_index])
                ->get();
            $moreSmallIndex2 = DB::table(config('alias.rwo'))->select('id')
                ->where($orderWhere)
                ->whereNotIn('id',$ids)
                ->whereRaw('(routing_operation_index < ? && routing_step_index < ?)',[$v->routing_operation_index,$v->routing_step_index])
                ->get();

            if(count($moreSmallIndexWorkOrderList) > 0 or count($moreSmallIndex2) > 0){
                $alertMessage[] = "有工序或者步骤在 $v->number 前的工单";
            }

            $current_workhour_package = $workhour_model->countTotalHours($v->belong_bom_id,json_decode($v->group_step_withnames,true),$v->qty,json_decode($v->workhour_package,true));
            $oneOrder_total_workhour = $this->countWorkOrderTotalWorkHour($current_workhour_package, $all_select_abilitys);
            $allWorkOrderTotalWorkHour += $oneOrder_total_workhour;

//            //1个WO的工时，只取标准工时（sign_hours），不拿首样工时等
//            $current_workhour_package = $workhour_model->countTotalHours($v->belong_bom_id,json_decode($v->group_step_withnames,true),1,json_decode($v->workhour_package,true));
//            $one_workhour = $this->countWorkOrderTotalWorkHour2($current_workhour_package, $all_select_abilitys);
//            //按一个工单计算首样，流转，准备的时间
//            $one_other_workhour = $this->countOtherWorkHour($current_workhour_package, $all_select_abilitys);
//
//            //配合排产那边工时最大化处理
//            $allWorkOrderTotalWorkHour += $one_workhour * $v->qty + $one_other_workhour;
        }
        //如果车间或工作中心拿出来的产能为0或者小于所有工单的总工时，直接抛出异常
        if($left_ability_capacity <= 0 || $left_ability_capacity < $allWorkOrderTotalWorkHour) TEA('1601');
        return $alertMessage;
    }

    /**
     * 按时间段主排（粗排）
     * 拆分到具体天时，其实做的是拆WO，不过是程序自动化的，根据当天剩余产能优先排满开始日期。细排该做的部分在这边先做了。
     * @param array $input
     * @throws \App\Exceptions\ApiException
     * @throws \Exception
     * author kevin
     */
    public function simplePlanByPeriod($input)
    {
        $this->checkRules($input);
        // 判断是否允许排产
//        $result = $this->isAllow($input['work_task_id'],$input['work_station_time']);
//        if(!$result) {
//            TEA('2405');    // 依赖订单排产时间前尚未完成排产，请先完成依赖订单排产！
//        }
        //找到要排工单
        $workOrderList = DB::table(config('alias.rwo'))
            ->whereIn('id',$input['ids'])
            ->where('status',0)
            ->get();
        try {
            DB::connection()->beginTransaction();
            $workhour_model=new WorkHour();
            //先找到车间或工作中心下班次，因为班次是维护在工作中心层的
            $rankWhere = [];
            $rankWhere[] = ['rwc.workshop_id', '=', $input['workshop_id']];
            $rankWhere[] = ['rwc.id', '=', $input['workcenter_id']];
            $workcenterRankList = DB::table(config('alias.rwcr') . ' as rwcr')
                ->leftJoin(config('alias.rwc') . ' as rwc', 'rwcr.workcenter_id', 'rwc.id')
                ->leftJoin(config('alias.rrp') . ' as rrp', 'rwcr.rankplan_id', 'rrp.id')
                ->select('rrp.work_time', 'rrp.work_date', 'rwcr.workcenter_id')
                ->where($rankWhere)->get();
            foreach ($workOrderList as $k => $v) {
                //找到车间或工作中心的工序的能力的产能

                //处理一下班次的workdate的json数据
                foreach ($workcenterRankList as $k => &$v1) {
                    $v1->work_date = json_decode($v1->work_date, true);
                }

                //所有WO的总工时
                $all_select_abilitys = json_decode($input['all_select_abilitys'],true);

                //1个WO的工时，只取标准工时，不拿首样工时等
                $current_workhour_package = $workhour_model->countTotalHours($v->belong_bom_id,json_decode($v->group_step_withnames,true),1,json_decode($v->workhour_package,true));
                $one_workhour = $this->countWorkOrderTotalWorkHour2($current_workhour_package, $all_select_abilitys);
                //按一个工单计算首样，流转，准备的时间
                $one_other_workhour = $this->countOtherWorkHour($current_workhour_package, $all_select_abilitys);

                //获取日期时间段数组
                $today_time=mktime(0, 0, 0, date('m'), date('d'), date('Y'));
                $start_time = $input['start_time'];
                if(strtotime($input['start_time']) < $today_time) {$start_time = date("Y-m-d", $today_time);}
                $daterange = $this->getDateRange($start_time, $input['end_time']);
                //最初WO的qty
                $origin_qty = $v->qty;
                $left_qty = $origin_qty;

                //按时间段遍历，获取每天该能力的产能，排满相应数量的WO
                foreach ($daterange as $date) {

                    if($left_qty <= 0) break;

                    $weekday = date("w",strtotime($date['date']));
                    $today_plan_time = strtotime(date("Y-m-d",strtotime($date['date'])));
                    //当天0点
                    $today_start=date("Y-m-d",strtotime($date['date']));
                    //当天的所有时段 0:0:0-23:59:59
                    $today_end= $today_start.' 23:59:59';

                    $today_capacity = 0;
                    $today_capacity = $this->getCapacityByWeekdayAbility($input['workshop_id'],$input['workcenter_id'],$weekday,$input['workcenter_operation_to_ability_id']);

                    //计算当天的剩余产能
                    //获得当前已排工单在今天，所选能力已经占用的工作时间
                    $workorderWhere = [];
                    $workorderWhere[] = ['rwo.work_shop_id', '=', $input['workshop_id']];
                    $workorderWhere[] = ['rwo.work_center_id', '=', $input['workcenter_id']];
                    $workorderWhere[] = ['rwo.operation_ability_id', '=', $input['workcenter_operation_to_ability_id']];
                    $workcenterHasCapacity = DB::table(config('alias.rwo') . ' as rwo')
                        ->select('rwo.number','rwo.total_workhour')
                        ->where($workorderWhere)
                        ->whereIn('rwo.status',[1,2])
                        ->whereBetween('work_station_time', [strtotime($today_start), strtotime($today_end)])
                        ->get();
                    $hasCapacity = 0;
                    foreach ($workcenterHasCapacity as $each) {
                        $hasCapacity += $each->total_workhour;
                    }
//                    $hasCapacity = array_walk($workcenterHasCapacity,function($v)use(&$hasCapacity){
//                        $hasCapacity += $v->total_workhour;
//                    });

                    //工作中心，当前能力剩余工作时间
                    $today_left_ability_capacity = $today_capacity - $hasCapacity;

                    #####最终能够全部排入的工单，就是原始工单拆分后的剩的最后一个（批）
                    //$total_left_capacity = $one_workhour * $left_qty + $one_other_workhour;

                    //计算要拆分出来的工单的实际工时
                    $left_current_workhour_package = $workhour_model->countTotalHours($v->belong_bom_id,json_decode($v->group_step_withnames,true),$left_qty,json_decode($v->workhour_package,true));
                    $total_left_capacity = $this->countWorkOrderTotalWorkHour($left_current_workhour_package, $all_select_abilitys);
                    if ($total_left_capacity <= $today_left_ability_capacity) {
                        //因为区间维护工时的存在，最终排入工单的总工时得重新计算，1个工单*数量，是最大化的工时计算，实际会更小
                        //$current_workhour_package = $workhour_model->countTotalHours($v->belong_bom_id,json_decode($v->group_step_withnames,true),$left_qty,json_decode($v->workhour_package,true));
                        //$total_left_capacity2 = $this->countWorkOrderTotalWorkHour($current_workhour_package, $all_select_abilitys);

                        //获取日期时间段数组
                        $data = [
                            'status' => 1,
                            'qty' => $left_qty,
                            'factory_id' => $input['factory_id'],
                            'work_shop_id' => $input['workshop_id'],
                            'work_center_id' => $input['workcenter_id'],
                            'operation_id' => $input['operation_id'],
                            'operation_ability_id' => $input['workcenter_operation_to_ability_id'],
                            'work_station_time' => $today_plan_time,
                            'select_ability_info' => json_encode($all_select_abilitys),
                            'total_workhour' => $total_left_capacity
                        ];
                        $res = DB::table(config('alias.rwo'))
                            ->where('id', $v->id)
                            ->update($data);
                        if ($res === false) TEA('804');
                        break;
                    } else {
                        //比对剩余工时和1个WO的比例，得出今天应该排入工单的数量
                        $insert_qty = intval($today_left_ability_capacity / $one_workhour);

                        ###由于存在首样，准备，流转等额外工时，但insert_qty跟1这个数量处于同一区间，并且上面计算整除时，存在产能溢出。
                        ###防止产能溢出，这边做一步基础的校验，并优化排入工单的数量，但不完美。比较完美的方案暂时还没有。

                            //一个工单都排不进去，直接到下一天
                            if($insert_qty <= 0){
                                continue;
                            }
                            //计算要拆分出来的工单的实际工时
                            $insert_current_workhour_package = $workhour_model->countTotalHours($v->belong_bom_id,json_decode($v->group_step_withnames,true),$insert_qty,json_decode($v->workhour_package,true));
                            $insert_total_capacity = $this->countWorkOrderTotalWorkHour($insert_current_workhour_package, $all_select_abilitys);
                            if($insert_qty >= $left_qty || $insert_total_capacity > $today_left_ability_capacity){
                                $insert_qty = $insert_qty - 1;
                                if($insert_qty <= 0){
                                    continue;
                                }
                            }
                        ###########

                        //insert_qty会改变，总工时得重新计算
                        $current_workhour_package2 = $workhour_model->countTotalHours($v->belong_bom_id,json_decode($v->group_step_withnames,true),$insert_qty,json_decode($v->workhour_package,true));
                        $update_total_insert_capacity2 = $this->countWorkOrderTotalWorkHour($current_workhour_package2, $all_select_abilitys);

                        $left_qty = $left_qty - $insert_qty;
                        $insert_data  = [
                            'id' => $v->id,
                            'qty' => $insert_qty,
                        ];
                        $insert_id = $this->splitWorkOrder($insert_data);
                        if (!$insert_id) TEA('804');

                        //先拆再更新
                        $data = [
                            'status' => 1,
                            'factory_id' => $input['factory_id'],
                            'work_shop_id' => $input['workshop_id'],
                            'work_center_id' => $input['workcenter_id'],
                            'operation_id' => $input['operation_id'],
                            'operation_ability_id' => $input['workcenter_operation_to_ability_id'],
                            'work_station_time' => $today_plan_time,
                            'select_ability_info' => json_encode($all_select_abilitys),
                            'total_workhour' => $update_total_insert_capacity2
                        ];
                        $res = DB::table(config('alias.rwo'))
                            ->where('id', $insert_id)
                            ->update($data);
                        if ($res === false) TEA('804');

                    }
                }
            }

            //按时间段排完后，将排单的开始和结束时间更新到wt中,用于甘特图
            $start_plantime=$this->getFieldValueById($input['work_task_id'],'simple_plan_start_time',config('alias.roo'));
            if(empty($start_plantime)){
                $data = [
                    'simple_plan_start_time' => strtotime($input['start_time']),
                    'simple_plan_end_time' => strtotime($input['end_time'])
                ];
                $res = DB::table(config('alias.roo'))
                    ->where('id', $input['work_task_id'])
                    ->update($data);
                if ($res === false) TEA('804');
            }

            /**
             * 数据库原来备注：rwo.status 0是未发布，1是发布 ，2是粗排
             *
             * 分析代码结果：rwo.status 0->发布, 1->粗排
             *
             * 所有的 WO 均完成排产之后，oo.status状态更改为 2
             */
            $need = DB::table(config('alias.rwo'))
                ->where([['operation_order_id', '=', $input['work_task_id']], ['status', '=', 0]])
                ->first();
            if (empty($need)) {
                DB::table(config('alias.roo'))
                    ->where('id', $input['work_task_id'])
                    ->update([
                        'status' => 2,
                    ]);
                $wo = DB::table(config('alias.rwo'))
                    ->whereIn('id', $input['ids'])
                    ->first();
                $tmp = DB::table(config('alias.roo'))
                    ->where([['production_order_id', '=', $wo->production_order_id], ['status', '=', 1]])
                    ->count();
                $tmp2 = DB::table(config('alias.roo'))
                    ->where([['production_order_id', '=', $wo->production_order_id], ['status', '=', 0]])
                    ->count();
                // 所有的 WT排完后，PO状态更新为 3
                if (empty($tmp) && empty($tmp2)) {
                    DB::table(config('alias.rpo'))
                        ->where('id', $wo->production_order_id)
                        ->update([
                            'status' => 3,
                        ]);
                }
            }

        }catch (\ApiException $exception){
            DB::connection()->rollBack();
            TEA($exception->getCode());
        }
        DB::connection()->commit();
    }

    /**
     * 获取工作中心的产能区间，层级：工作中心->星期几->能力->具体产能(直接计算产能，该方式舍弃)
     * @param $workcenter_id $weekday
     * @return
     * @author kevin
     */
    public function getCapacityByWeekdayAbility($workshop_id,$workcenter_id,$weekday,$operation_ability_id)
    {
        //比对当前工作中心是否存在该能力的台板
        //找到该工作中心下所有的能力，并且得出重复的能力（不同台板会存在相同能力）累加计算值
        $rwcWhere = [];
        $rwcWhere[] = ['rwc.workshop_id','=',$workshop_id];
        $rwcWhere[] = ['rwc.id','=',$workcenter_id];
        $rwcWhere[] = ['rwboa.operation_to_ability_id','=',$operation_ability_id];
        $workcenterOperationAbilityCount = DB::table(config('alias.rwc').' as rwc')
            ->leftJoin(config('alias.rwb').' as rwb','rwc.id','rwb.workcenter_id')
            ->leftJoin(config('alias.rwboa').' as rwboa','rwb.id','rwboa.workbench_id')
            ->select('rwc.id','rwc.name','rwboa.operation_to_ability_id',DB::raw('count(rwc.id) as num'))
            ->groupBy('rwboa.operation_to_ability_id')
            ->where($rwcWhere)->count();
        if(empty($workcenterOperationAbilityCount)) TEA('1604');

        //先找到车间或工作中心下班次，因为班次是维护在工作中心层的
        $rankWhere = [];
        $rankWhere[] = ['rwc.workshop_id','=',$workshop_id];
        $rankWhere[] = ['rwc.id','=',$workcenter_id];
        $workcenterRankList = DB::table(config('alias.rwcr').' as rwcr')
            ->leftJoin(config('alias.rwc').' as rwc','rwcr.workcenter_id','rwc.id')
            ->leftJoin(config('alias.rrp').' as rrp','rwcr.rankplan_id','rrp.id')
            ->select('rrp.work_time','rrp.work_date','rwcr.workcenter_id')
            ->where($rankWhere)->get();
        //处理一下班次的workdate的json数据
        foreach ($workcenterRankList as $k=>&$v){
            $v->work_date = json_decode($v->work_date,true);
        }
        //一种能力的产能
        $capacity = 0;
        foreach ($workcenterRankList as $w=>$j){
            if(in_array($weekday,$j->work_date)){
                $capacity += $j->work_time;
            }
        }
        //考虑生成产能包太浪费效率，这边直接根据星期几和能力，计算当天的总产能
        $capacity = round($capacity * $workcenterOperationAbilityCount,3);

        return $capacity;
    }

    /**
     * 获取时间段方法
     * @param $input
     * @return array
     * kevin
     */
    public function getDateRange($start_time,$end_time){
        $begin = new \DateTime( $start_time );
        $end = new \DateTime( $end_time );
        $end = $end->modify( '+1 day' );  // 不包含结束日期当天，需要人为的加一天

        $interval = new \DateInterval('P1D');
        $daterange = new \DatePeriod($begin, $interval ,$end);

        $dates = iterator_to_array($daterange);

        return obj2array($dates);
    }

}
