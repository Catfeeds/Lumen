<?php
namespace App\Http\Models;

use Illuminate\Support\Facades\DB;
use App\Http\Models\MaterialRequisition;
use App\Libraries\Soap;

class WorkDeclareOrder extends Base
{
    public function __construct()
    {
        $this->table='ruis_work_declare_order';
        $this->workOrderTable='ruis_work_order';
        $this->ProductionTable='ruis_production_order';
        $this->OperationTable='ruis_operation_order';
        $this->itemTable='ruis_work_declare_order_item';
        $this->materialTable='ruis_material';
        $this->depotTable='ruis_storage_depot';
        $this->factoryTable='ruis_factory';
        $this->materialCategoryTable='ruis_material_category';
        $this->unitTable='ruis_uom_unit';
        $this->workCenterTable='ruis_workcenter';
        $this->workShopTable='ruis_workshop';
        $this->unitTable='ruis_uom_unit';
        $this->subTable='ruis_subcontract_order';

        if(empty($this->item)) $this->item =new WorkDeclareOrderItem();
        if(empty($this->sitem)) $this->sitem =new StorageItem();
        if(empty($this->standarditem)) $this->standarditem =new SapStandardDeclareItem();
        if(empty($this->materialrequisition)) $this->materialrequisition =new MaterialRequisition();
    }

//region 捡
    /**
     * @param $input
     * @throws \App\Exceptions\ApiException
     */
    public function checkFormField(&$input)
    {
        if(!isset($input['work_order_id']) || !is_numeric($input['work_order_id']))  TEA('730','work_order_id');
        $input['creator_id'] = (!empty(session('administrator')->admin_id)) ? session('administrator')->admin_id : 0;
    }
//endregion

    /**
     * 保存数据
     */
    public function save($data,$id=0)
    {
        if ($id>0)
        {
                try{
                    //开启事务
                    DB::connection()->beginTransaction();
                    $upd=DB::table($this->table)->where('id',$id)->update($data);
                    if($upd===false) TEA('804');
                }catch(\ApiException $e){
                    //回滚
                    DB::connection()->rollBack();
                    TEA($e->getCode());
                }

                //提交事务
                DB::connection()->commit();
                $order_id   = $id;

        }
        else
        {
            //代码唯一性检测
            $has=$this->isExisted([['code','=',$data['code']]]);
            if($has) TEA('8305','code');
            //添加
            $order_id=DB::table($this->table)->insertGetId($data);
            if(!$order_id) TEA('802');
        }
        return $order_id;
    }

//region store
    /**
     * 新增车间报工单
     *
     * @param $input
     * @return mixed
     * @throws \App\Exceptions\ApiException
     */
    public function store($input)
    {
        try {
              //开启事务
              DB::connection()->beginTransaction();
              $this->checkFormField($input);  //验证数据
              $timeStr = date('YmdHis');
              $temp_code  = 'WDO'. $timeStr . rand(100, 999);
              //获取工单相关信息
              $work_order_id = $input['work_order_id'];
              $work_order_res = DB::table($this->workOrderTable.' as workOrder')
                              ->leftJoin(config('alias.rf').' as  factory', 'factory.id', '=', 'workOrder.factory_id')
                              ->select('workOrder.*','factory.code as factory_code')->where('workOrder.id',$work_order_id)->first();
              if (!$work_order_res) TEA('9500');
              if ($work_order_res ->is_delete  == 1  || $work_order_res ->on_off  == 0 ) TEA('9530');

              $input['factory_code']= $work_order_res->factory_code;
              //生产单
              $production_order_id =$work_order_res->production_order_id;
              $production_order_res = DB::table($this->ProductionTable)->select('*')->where('id',$production_order_id)->first();
              if (!$production_order_res) TEA('9501');
              //工序订单
              $operation_order_id =$work_order_res->operation_order_id;
              $operation_order_res = DB::table($this->OperationTable)->select('*')->where('id',$operation_order_id)->first();
              if (!$operation_order_res) TEA('9502');
              $input['production_order_id']=$production_order_id;
              $input['operation_order_id']=$operation_order_id;
              $input['work_order_id']=$work_order_id;
              // $wt_qty=$operation_order_res->qty;
              $wt_out_material=json_decode($operation_order_res->out_material);

              if ($input['routing_node_id']<1) TEA('9518');
              //获取编辑数组
              $data=[
                  'code' => $temp_code,
                  'production_order_id'=>$production_order_id,
                  'operation_order_id'=>$operation_order_id,
                  'work_order_id'=>$work_order_id,   //工单id
                  'RUECK'=>$work_order_res->confirm_number_RUECK, //确认号   wo中找
                  'MANUR'=>1,                        //确认类型
                  'ISDD'    =>empty($work_order_res->start_time)?'00000000':date("Ymd",strtotime($input['start_time'])),                   //开始执行日期 工单开始日期
                  'ISDZ'    =>empty($work_order_res->start_time)?'000000':date("His",strtotime($input['start_time'])),                     //开始执行时间 工单开始时间
                  'IEDD'    =>empty($work_order_res->end_time)?'00000000':date("Ymd",strtotime($input['end_time'])),                     //结束执行日期 工单结束日期
                  'IEDZ'    =>empty($work_order_res->end_time)?'000000':date("His",strtotime($input['end_time'])),                       //结束执行时间 工单结束时间
                  'BUDAT'   =>time(),                //过账日期     工单报工时间
                  'operation_order_code'=>$operation_order_res->number,        //工艺订单号
                  'production_order_code'=>$production_order_res->number,       //生产单号
                  'remark' => isset($input['remark'])?$input['remark']:'',
                  'ctime' => time(),
                  'mtime' => time(),
                  'start_time'=>strtotime($input['start_time']),
                  'end_time'=>strtotime($input['end_time']),
                  'from' => 1,                                  //系统来源
                  'status' => 1,
                  'is_teco'=> isset($input['is_teco'])?$input['is_teco']:0,// 是否是最后一次报工
                  'routing_node_id'=>$input['routing_node_id'],//节点
                  'creator_id' => $input['creator_id']
              ];
              $insert_id = $this->save($data);
              if(!$insert_id) TEA('802');

              //2、添加明细
              $this->item->saveItem($input, $insert_id,1);

              // 3、添加工作类型
              $this->standarditem->saveItem($input,$insert_id);
              // 4、找到出料数量   更新WT 的完成进度
              $out_materials  =json_decode($input['out_materials'],true);

              //定义一个空数组
              $real_material_res = [];
              foreach ($out_materials as $ke => $va) 
              {
                foreach ($wt_out_material as $kee => $vaa) 
                {
                  if ($va['material_id']  == $vaa->material_id) 
                  {
                    $out_materials[$ke]['wt_qty'] =$vaa->qty;  
                    $out_materials[$ke]['wt_schedule'] = $va['GMNGA'] / $vaa->qty;  

                    // 如果 $real_material_res 为空数组 
                    if (empty($real_material_res)) 
                    {
                      $real_material_res[$ke]=$out_materials[$ke]['wt_schedule'];
                    }
                    elseif (!empty($real_material_res)  &&  $out_materials[$ke]['wt_schedule']<current($real_material_res)) 
                    {
                      //清空 $real_material_res  重新写入 新的值
                      array_splice($real_material_res, 0, count($real_material_res));
                      $real_material_res[$ke]=$out_materials[$ke]['wt_schedule'];
                    }
                  }
                }
              }
              $effective_out_material = $out_materials[key($out_materials)];
              $out_qty= $effective_out_material['GMNGA'];
              $wt_qty= $effective_out_material['wt_qty'];
              if ($out_qty > 0) 
              {
                //如果出料 数量大于0 更新wt 生产进度
                $old_schedule_res = DB::table('ruis_operation_order')->where('id',$operation_order_id)->select('schedule')->first();
                $old_schedule = $old_schedule_res->schedule;
                $schedule = $out_qty/$wt_qty;
                $schedule_data=[
                  'schedule'=> $schedule + $old_schedule,
                ];
                $upd=DB::table('ruis_operation_order')->where('id',$operation_order_id)->update($schedule_data);
                if($upd===false) TEA('804');

                //把 该报工单的   完成进度  记录到 报工单上
                $dec_data=[
                  'wt_schedule'=> $schedule,
                ];
                $uupd=DB::table('ruis_work_declare_order')->where('id',$insert_id)->update($dec_data);
                if($uupd===false) TEA('804');

              }
              // 4、生成车间 领补退  单据
              $in_materials  =json_decode($input['in_materials'],true);

              if (count($in_materials)>0)
              {
                 $this->materialrequisition->mixedStore($input,$input['is_teco'],$insert_id);
              }
        } catch (\ApiException $e) {
            //回滚
            DB::connection()->rollBack();
            TEA($e->getCode());
        }
        DB::connection()->commit();
        return $insert_id;
    }

    /**
     * 删除
     * @param $id
     * @throws \Exception
     * @author liming
     */
    public function destroy($id)
    {
        //判断 是否 已经推送
        $status = $this->getStatus($id);
        if ($status[0]->status  !=  1) TEA('9508');

        try{
             //开启事务
             DB::connection()->beginTransaction();
              // 获取当前报工单所有信息
              $dec_result =  DB::table($this->table.' as declare')
                          ->where('declare.id',$id)
                          ->where('dec_item.type','-1')
                          ->select(
                            'declare.operation_order_id',
                            'declare.routing_node_id',
                            'declare.production_order_id',
                            'declare.wt_schedule',
                            'dec_item.qty'
                            )
                          ->leftJoin('ruis_work_declare_order_item as  dec_item', 'dec_item.declare_id', '=', 'declare.id')
                          ->first();
              if (!$dec_result) TEA('9516');
              // if ($dec_result->operation_order_id<1)TEA('9515');
              if ($dec_result->production_order_id<1)TEA('9517');
              $operation_order_id= $dec_result->operation_order_id;
              $production_order_id= $dec_result->production_order_id;
              $out_qty= $dec_result->qty;

              //0、反写是否报工 到  委外采购明细行id
              $picking =  DB::table($this->table)->where('id',$id)->select('picking_line_id')->first();

              //1、删除之前先删除明细
              $res = DB::table($this->itemTable)->where('declare_id','=',$id)->delete();
              //2、删除
               $num=$this->destroyById($id);
               if($num===false) TEA('803');
               if(empty($num))  TEA('404');

              //3、反写是否报工 到  委外采购明细行id
              if ($picking ) 
              {
                 $this->toline($picking->picking_line_id);
              }
              // 目前委外报工单 没有 operation_id
              if ($dec_result->operation_order_id>0) 
              {
                  //工序订单
                  $operation_order_res = DB::table($this->OperationTable)->select('*')->where('id',$operation_order_id)->first();
                  if (!$operation_order_res) TEA('9502');
                  // 当前工艺单的进度
                  $old_schedule = $operation_order_res->schedule;
                  $now_schedule =  $dec_result->wt_schedule;

                  $schedule_data=[
                    'schedule'=>$old_schedule-$now_schedule,
                  ];
                  $upd=DB::table('ruis_operation_order')->where('id',$operation_order_id)->update($schedule_data);
                  if($upd===false) TEA('804');
              }
        }catch(\ApiException $e){
            //回滚
            DB::connection()->rollBack();
            TEA($e->getCode());
        }
        //提交事务
        DB::connection()->commit();
    }

    /**
     * 新增车间委外报工单
     * @param $input
     * @return mixed
     * @throws \App\Exceptions\ApiException
     */
    public function outStore($input)
    {
        try {
              //开启事务
              DB::connection()->beginTransaction();

              $input['creator_id'] = (!empty(session('administrator')->admin_id)) ? session('administrator')->admin_id : 0;
              if(!isset($input['sub_id']) || !is_numeric($input['sub_id']))  TEA('730','sub_id');
              if(!isset($input['production_id']) || !is_numeric($input['production_id']))  TEA('730','production_id');
              if(!isset($input['picking_id']) || !is_numeric($input['picking_id']))  TEA('730','picking_id');
              if(!isset($input['picking_line_id']) || !is_numeric($input['picking_line_id']))  TEA('730','picking_line_id');


              $timeStr = date('YmdHis');
              $temp_code  = 'WDO'. $timeStr . rand(100, 999);

              //生产单
              $production_order_id =$input['production_id'];
              $production_order_res = DB::table($this->ProductionTable)->select('*')->where('id',$production_order_id)->first();
              if (!$production_order_res) TEA('9501');

              //获取委外工单相关信息
              $sub_id = $input['sub_id'];
              $work_order_res = DB::table('ruis_subcontract_order')->select('*')->where('id',$sub_id)->first();
              if (!$work_order_res) TEA('9500');
              if ($work_order_res ->is_delete  == 1  || $work_order_res ->on_off  == 0 ) TEA('9530');
              if (empty($input['operation_order_code'])) TEA('9519');

              // 获取工艺单
              //根据 工艺路线 code  查找  工艺路线id
              $operation_order_res = DB::table('ruis_operation_order')->select('*')->where('number',$input['operation_order_code'])->first();
              if (!$operation_order_res) TEA('9515');
              $operation_order_id= $operation_order_res->id;
              // $wt_qty=$operation_order_res->qty;
              $wt_out_material=json_decode($operation_order_res->out_material);
              $input['production_order_id']= $production_order_id;
              $input['operation_order_id']= $operation_order_id;
              if (!isset($input['routing_node_id']))TEA('9520');
              if ($input['routing_node_id']<1) TEA('9518');
             
              //获取编辑数组
              $data=[
                  'code' => $temp_code,
                  'production_order_id'=>$production_order_id,
                  'operation_order_id'=>$operation_order_id,
                  'operation_order_code'=>$input['operation_order_code'],        //工艺订单号
                  'sub_id'=>$sub_id,   //工单id
                  'picking_id'=>$input['picking_id'],   //委外单id
                  'picking_line_id'=>$input['picking_line_id'],   //委外行id
                  'type'=>1,                    //type ==1  委外报工单
                  'RUECK'=>$work_order_res->confirm_number_RUECK, //确认号   wo中找
                  'MANUR'=>1,                        //确认类型
                  'ISDD'    =>empty($work_order_res->start_time)?'00000000':date("Ymd",strtotime($input['start_time'])),                   //开始执行日期 工单开始日期
                  'ISDZ'    =>empty($work_order_res->start_time)?'000000':date("His",strtotime($input['start_time'])),                     //开始执行时间 工单开始时间
                  'IEDD'    =>empty($work_order_res->end_time)?'00000000':date("Ymd",strtotime($input['end_time'])),                     //结束执行日期 工单结束日期
                  'IEDZ'    =>empty($work_order_res->end_time)?'000000':date("His",strtotime($input['end_time'])),                       //结束执行时间 工单结束时间
                  'BUDAT'   =>time(),                //过账日期     工单报工时间
                  'production_order_code'=>$production_order_res->number,       //生产单号
                  'remark' => isset($input['remark'])?$input['remark']:'',
                  'ctime' => time(),
                  'mtime' => time(),
                  'start_time'=>strtotime($input['start_time']),
                  'end_time'=>strtotime($input['end_time']),
                  'from' => 1,                                  //系统来源
                  'status' => 1,
                  'is_teco'=> isset($input['is_teco'])?$input['is_teco']:0,// 是否是最后一次报工
                  'creator_id' => $input['creator_id'],
                  'routing_node_id'=>$input['routing_node_id'],//节点
              ];

              $insert_id = $this->save($data);
              if(!$insert_id) TEA('802');
              //2、添加明细
              $this->item->saveItem($input,$insert_id,2);

              // 3、添加工作类型
              $this->standarditem->saveItem($input,$insert_id);

              // 4、反写是否报工 到  委外采购明细行id
              $this->toline($input['picking_line_id']);

              // 5、找到出料数量   更新WT 的完成进度
              $out_materials  =json_decode($input['out_materials'],true);
              //定义一个空数组
              $real_material_res = [];
              foreach ($out_materials as $ke => $va) 
              {
                foreach ($wt_out_material as $kee => $vaa) 
                {
                  if ($va['material_id']  == $vaa->material_id) 
                  {
                    $out_materials[$ke]['wt_qty'] =$vaa->qty;  
                    $out_materials[$ke]['wt_schedule'] = $va['GMNGA'] / $vaa->qty;  

                    // 如果 $real_material_res 为空数组 
                    if (empty($real_material_res)) 
                    {
                      $real_material_res[$ke]=$out_materials[$ke]['wt_schedule'];
                    }
                    elseif (!empty($real_material_res)  &&  $out_materials[$ke]['wt_schedule']<current($real_material_res)) 
                    {
                      //清空 $real_material_res  重新写入 新的值
                      array_splice($real_material_res, 0, count($real_material_res));
                      $real_material_res[$ke]=$out_materials[$ke]['wt_schedule'];
                    }
                  }
                }
              }
              $effective_out_material = $out_materials[key($out_materials)];
              $out_qty= $effective_out_material['GMNGA'];
              $wt_qty= $effective_out_material['wt_qty'];
              if ($out_qty > 0 ) 
              {
                //如果出料 数量大于0 更新wt 生产进度
                $old_schedule_res = DB::table('ruis_operation_order')->where('id',$operation_order_id)->select('schedule')->first();
                $old_schedule = $old_schedule_res->schedule;
                $schedule = $out_qty/$wt_qty;
                $schedule_data=[
                  'schedule'=> $schedule + $old_schedule,
                ];

                $upd=DB::table('ruis_operation_order')->where('id',$operation_order_id)->update($schedule_data);
                if($upd===false) TEA('804');

                //把 该报工单的   完成进度  记录到 报工单上
                $dec_data=[
                  'wt_schedule'=> $schedule,
                ];
                $uupd=DB::table('ruis_work_declare_order')->where('id',$insert_id)->update($dec_data);
                if($uupd===false) TEA('804');

              }
        } catch (\ApiException $e) {
            //回滚
            DB::connection()->rollBack();
            TEA($e->getCode());
        }
        DB::connection()->commit();
        return $insert_id;
    }
//endregion
    /**
     * 编辑
     * @param $input array  input数组
     * @return int         返回插入表之后返回的主键值
     * @author liming
     */
    public function update($input)
    {
        //  判断单据是否审核
        $order_id   = $input['id'];
        $status = $this->getStatus($order_id);
        if ($status[0]->status  ==  2) TEA('9506');
        //获取编辑数组
        $data=[
              'start_time'=>strtotime($input['start_time']),
              'end_time'=>strtotime($input['end_time']),
              'is_teco'=>isset($input['is_teco'])?$input['is_teco']:'',// 是否是最后一次报工
        ];
        try {
            //开启事务
            DB::connection()->beginTransaction();
            $upd=DB::table($this->table)->where('id',$order_id)->update($data);
            if($upd===false) TEA('804');
            //明细修改
            $this->item->saveItem($input,$order_id);

             // 3、添加工作类型
            $this->standarditem->saveItem($input, $order_id);

            // 4、反写是否报工 到  委外采购明细行id
            $picking =  DB::table($this->table)->where('id',$order_id)->select('picking_line_id')->first();
            if ($picking ) 
            {
               $this->toline($picking->picking_line_id);
            }
        } catch (\ApiException $e) {
            //回滚
            DB::connection()->rollBack();
            TEA($e->getCode());
        }
        DB::connection()->commit();
        return $order_id;
    }

  /**
   * @message 反写委外采购订单
   * @author  liming
   * @time    年 月 日
   */  
    public  function   toline($picking_line)
    {
        $total_out= DB::table('ruis_work_declare_order  as  declare')
                ->leftJoin('ruis_work_declare_order_item as declareitem', 'declareitem.declare_id', '=', 'declare.id')
                ->where('declare.picking_line_id', '=', $picking_line)
                ->where('declareitem.type', '=', '-1')
                ->sum('declareitem.GMNGA');
        $count = DB::table('ruis_work_declare_order  as  declare')
                ->leftJoin('ruis_work_declare_order_item as declareitem', 'declareitem.declare_id', '=', 'declare.id')
                ->where('declare.picking_line_id', '=', $picking_line)
                ->where('declareitem.type', '=', '-1')
                ->count();
        if ($count > 0) 
        {
            $update_data=[
              'has_declare'=>1,
              'declare_qty'=>$total_out,
             ];
        }
        else
        {
            $update_data=[
              'has_declare'=>0,
              'declare_qty'=>$total_out,
             ];
        }
        $upd=DB::table('ruis_sap_out_picking_line')->where('id',$picking_line)->update($update_data);
        if($upd===false) TEA('804');
    }

    /**
     * 分页列表
     * @return array  返回数组对象集合
     */
    public function getPageList($input)
    {
        //$input['page_no']、$input['page_size   检验是否存在参数
        if (!array_key_exists('page_no',$input ) && !array_key_exists('page_size',$input )) TEA('8211','page');
        //order  (多order的情形,需要多次调用orderBy方法即可)
        if (empty($input['order']) || empty($input['sort'])) 
        {
            $input['order']='desc';$input['sort']='workOrder.number';
        }

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
                    $where[] = ['workOrder.factory_id', '=', $emploee_info->factory_id];//区分到厂
                } elseif ($emploee_info->factory_id != 0 && $emploee_info->workshop_id != 0) {
                    $where[] = ['workOrder.work_shop_id', '=', $emploee_info->workshop_id];//区分到车间
                }
            }
        }

          $data=[
            'declare.*',
            'workOrder.id as workOrder_id ',
            'workOrder.number as workOrder_number',
            'production.id as production_id',
            'production.number as production_number',
            'operation.id as operation_id',
            'operation.number as operation_number',
            'factory.id  as   factory_id',
            'factory.code  as   factory_code',
            'factory.name  as   factory_name',
            'workcenter.id  as   workcenter_id',
            'workcenter.code  as   workcenter_code',
            'workcenter.name  as   workcenter_name',
            'subworkcenter.id  as   subworkcenter_id',
            'subworkcenter.code  as   subworkcenter_code',
            'subworkcenter.name  as   subworkcenter_name',
            'sub.number as sub_number',
            'sub.id as sub_id'
          ];
          $where_res = $this->_search($input);
          $where = $where_res['where'];
          $builder=DB::table($this->table.' as declare')
            ->leftJoin($this->workOrderTable.' as workOrder', 'declare.work_order_id', '=', 'workOrder.id')
            ->leftJoin($this->workCenterTable.' as workcenter', 'workcenter.id', '=', 'workOrder.work_center_id')
            ->leftJoin($this->ProductionTable.' as production', 'declare.production_order_id', '=', 'production.id')
            ->leftJoin($this->factoryTable.' as factory', 'factory.id', '=', 'production.factory_id')
            ->leftJoin($this->OperationTable.' as operation', 'declare.operation_order_id', '=', 'operation.id')
            ->leftJoin($this->subTable.' as sub', 'declare.sub_id','=','sub.id')
            ->leftJoin($this->workCenterTable.' as subworkcenter', 'subworkcenter.id', '=', 'sub.work_center_id')
            ->select($data)
            ->where($where)
            ->offset(($input['page_no']-1)*$input['page_size'])
            ->limit($input['page_size'])
            ->orderBy($input['sort'],$input['order']);

            if (isset($where_res['orwhere'])) 
            {
              $builder->orwhere($where_res['orwhere']);
            }
            $obj_list = $builder->get();
            foreach ($obj_list as $key => $obj)
            {
               $out_where=[
                'declareitem.declare_id'=>$obj->id,
                'declareitem.type'=>'-1'
               ];
                $obj->ctime  = date("Y-m-d H:i:s",$obj->ctime);
                $obj->mtime  = date("Y-m-d H:i:s",$obj->mtime);
                $obj->start_time  = date("Y-m-d H:i:s",$obj->start_time);
                $obj->end_time  = date("Y-m-d H:i:s",$obj->end_time);
               //获取产出品
               $out_res  =   DB::table('ruis_work_declare_order_item as declareitem')
                         ->leftJoin('ruis_material as material', 'material.id', '=', 'declareitem.material_id')
                         ->leftJoin('ruis_uom_unit as unit', 'unit.id', '=', 'declareitem.unit_id')
                         ->where($out_where)
                         ->select('material.name','declareitem.qty','declareitem.GMNGA','unit.commercial')
                         ->get();
               $obj->out=$out_res;
            }
             $builder_two= DB::table($this->table.' as declare')
                                ->leftJoin($this->workOrderTable.' as workOrder', 'declare.work_order_id', '=', 'workOrder.id')
                                ->leftJoin($this->workCenterTable.' as workcenter', 'workcenter.id', '=', 'workOrder.work_center_id')
                                ->leftJoin($this->ProductionTable.' as production', 'declare.production_order_id', '=', 'production.id')
                                ->leftJoin($this->factoryTable.' as factory', 'factory.id', '=', 'production.factory_id')
                                ->leftJoin($this->OperationTable.' as operation', 'declare.operation_order_id', '=', 'operation.id')
                                ->leftJoin($this->subTable.' as sub', 'declare.sub_id','=','sub.id')
                                ->leftJoin($this->workCenterTable.' as subworkcenter', 'subworkcenter.id', '=', 'sub.work_center_id')
                                ->where($where);
            if (isset($where_res['orwhere'])) 
            {
              $builder_two->orwhere($where_res['orwhere']);
            }                  
            $obj_list->total_count=  $builder_two->count();

        return $obj_list;
    }


    /**
     * 获取
     * @return array  返回数组对象集合
     */
    public function show($id)
    {
          $data=[
            'declare.*',
            'workOrder.id as workOrder_id ',
            'workOrder.number as workOrder_number',
            'production.id as production_id',
            'production.number as production_number',
            'production.sales_order_code as sales_order_code',
            'production.sales_order_project_code as sales_order_project_code',
            'factory.id as factory_id',
            'factory.code as factory_code',
            'planfactory.id as planfactory_id',
            'planfactory.code as planfactory_code',
            'subfactory.id as subfactory_id',
            'subfactory.code as subfactory_code',
            'sub.number as sub_number',
            'sub.id as sub_id',
            'pickingline.WERKS as sub_WERKS',
            'operation.id as operation_id',
            'operation.number as operation_number'
          ];
        $obj_list = DB::table($this->table.' as declare')
            ->leftJoin($this->workOrderTable.' as workOrder', 'declare.work_order_id','=','workOrder.id')
            ->leftJoin('ruis_sap_out_picking_line as pickingline', 'pickingline.id','=','declare.picking_line_id')
            ->leftJoin($this->factoryTable.' as factory', 'factory.id','=','workOrder.factory_id')
            ->leftJoin($this->subTable.' as sub', 'declare.sub_id','=','sub.id')
            ->leftJoin($this->factoryTable.' as subfactory', 'subfactory.id','=','sub.factory_id')
            ->leftJoin($this->ProductionTable.' as production', 'declare.production_order_id', '=', 'production.id')
            ->leftJoin($this->factoryTable.' as planfactory', 'planfactory.id', '=', 'production.plan_factory_id')
            ->leftJoin($this->OperationTable.' as operation', 'declare.operation_order_id', '=', 'operation.id')
            ->where('declare.id', $id)
            ->select($data)
            ->get();  

            if (!isset($obj_list[0]->planfactory_id)  || $obj_list[0]->planfactory_id<1) 
            {
              TEA('9514');
            }
           $plan_factory_code= $obj_list[0]->planfactory_code;
        foreach ($obj_list as $obj)
        {
            $obj->ctime  = date("Y-m-d H:i:s",$obj->ctime);
            $obj->mtime  = date("Y-m-d H:i:s",$obj->mtime);
            $obj->start_time  = date("Y-m-d H:i:s",$obj->start_time);
            $obj->end_time  = date("Y-m-d H:i:s",$obj->end_time);
            $in_materials = $this->getItemsByOrder($obj->id,'1',$obj->factory_code,$obj->sub_WERKS);
            $out_materials = $this->getItemsByOrder($obj->id,'-1',$obj->factory_code,$obj->sub_WERKS);
            //获取第一个出料   并且找出 计划存储地点
            if (count($out_materials)>0) 
            {
              $first_out_material = $out_materials[0]->material_id;
              $plan_factory_where=[
                'material_id'=>$first_out_material,
                'WERKS'=>$plan_factory_code
              ];
              $plan_res= DB::table('ruis_material_marc')->where($plan_factory_where)->select('LGPRO')->first();
              if ($plan_res) 
              {
                $plan_LGPRO = $plan_res->LGPRO;
              }
              else
              {
                $plan_LGPRO ='';
              }
            }
            else
            {
               $plan_LGPRO ='';
            }
            $stands = $this->getStandByOrder($obj->id);
            $obj->plan_LGPRO=$plan_LGPRO;
            $obj->in_materials = $in_materials;
            $obj->out_materials = $out_materials;
            $obj->stands = $stands;
        }
        return $obj_list;
    }

    /**
     * @message 获取stands
     * @author  liming
     * @time    年 月 日
     */  
    public  function  getStandByOrder($id)  
    {
         $obj_list =  DB::table('sap_standard_declare_item as  declareItem')
              ->leftJoin('sap_param_item  as item','item.id','declareItem.standard_item_id')
              ->where('declareItem.declare_order_id',$id)
              ->select('declareItem.*','declareItem.standard_item_id  as  param_item_id','item.name  as  name','item.code  as code')
              ->get();
              return   $obj_list;
    }     

    /**
     * 获取明细数据
     * @param $id
     * @return mixed
     * @author liming
     */
    public function getItemsByOrder($id,$sign,$subfactory_code='',$factory_code='')
    {
        $data=[
            'item.*',
            'material.id as material_id',
            'material.item_no as material_item_no',
            'material.name as material_name',
            'depot.id as depot_id',
            'depot.name as depot_name',
            'depot.code as depot_code',
            'unit.id  as  unit_id',
            'unit.name  as  unit_name',
            'unit.unit_text  as  unit_text',
            'unit.commercial  as  commercial',
            'inve.sale_order_code  as  sale_order_code',
            'inve.po_number  as  product_order_code',
        ];
        //获取列表
        $obj_list = DB::table($this->itemTable.' as item')
            ->select($data)
            ->leftJoin($this->materialTable.' as material', 'item.material_id', '=', 'material.id')
            ->leftJoin($this->depotTable.' as depot', 'item.line_depot_id', '=', 'depot.id')
            ->leftJoin($this->unitTable.' as unit', 'item.unit_id', '=', 'unit.id')
            ->leftJoin('ruis_storage_inve as inve', 'inve.id', '=', 'item.inve_id')
            ->where('item.declare_id', $id)
            ->where('item.type', $sign)
            ->orderBy('item.id', 'asc')
            ->get();

        if ($sign  ==  '-1') 
        {
              if (empty($subfactory_code)  &&  empty($factory_code)) 
              {
                foreach ($obj_list as $key => $value) 
                {
                  $value->LGPRO  = '';
                }
              }

              if (!empty($factory_code)) 
              {
                foreach ($obj_list as $key => $value) 
                {
                    $material_id = $value->material_id;
                    $where= [
                      'WERKS'=>$factory_code,
                      'material_id'=>$material_id
                    ];
                    $res_list = DB::table('ruis_material_marc')->select('LGPRO','LGFSB')->where($where)->first();
                    if ($res_list) 
                    {
                      if (empty($res_list->LGPRO)  && empty($res_list->LGFSB)) 
                      {
                        $value->LGPRO  = '';
                      }
                      else
                      {
                        $value->LGPRO= !empty($res_list->LGPRO)?$res_list->LGPRO:$res_list->LGFSB;
                      }

                    }
                    else
                    {
                        $value->LGPRO  = '';
                    }
                }

              }

              if (!empty($subfactory_code)) 
              {
                foreach ($obj_list as $key => $value) 
                {
                  $material_id = $value->material_id;
                    $where= [
                      'WERKS'=>$subfactory_code,
                      'material_id'=>$material_id
                    ];
                  $res_list = DB::table('ruis_material_marc')->select('LGPRO','LGFSB')->where($where)->first();
                  if ($res_list) 
                  {
                    if (empty($res_list->LGPRO)  && empty($res_list->LGFSB)) 
                    {
                      $value->LGPRO  = '';
                    }
                    else
                    {
                      $value->LGPRO= !empty($res_list->LGPRO)?$res_list->LGPRO:$res_list->LGFSB;
                    }

                  }
                  else
                  {
                      $value->LGPRO  = '';
                  }
                
                }

              }
        }
        return $obj_list;
    }


    /**
     * @message  推送报工单给sap
     *
     * @param $id
     * @return mixed
     * @throws \App\Exceptions\ApiException
     * @author  liming
     * @time    2018年 9月 14日
     */
    public function pushWorkDeclareOrder($id)
    { 
      //判断 是否 已经推送
      $status = $this->getStatus($id);
      //报工成功不能再推送，其他情况可以再次报工
      if ($status[0]->status  ==  2) TEA('9508');

       $nowday_str  =   date("Ymd",time());
       $nowtime_str  =   date("His",strtotime("-1 hour"));
       $day_str       =   date("Ymd",strtotime("-11 hour"));
       $time_str       =   date("His",strtotime("-11 hour"));

       $ISDD  = $day_str;// 开始执行日期
       $ISDZ  = $time_str;// 开始执行时间
       $IEDD  = $nowday_str;// 结束执行日期
       $IEDZ  = $nowtime_str;// 结束执行时间
       $head=[];
      $result = [];
      $asp_material_arr=[];
      $sales_order_code='';
      // 查看是 委外报工还是 车间报工
      $type  =  DB::table($this->table.' as declare')->select('type')->where('declare.id', $id)->first();
      if ($type->type  == 1) 
      {
        $data=[
            'declare.id as id',                        // id
            'declare.RUECK as RUECK',                  // 确认号
            'declare.MANUR as MANUR',                  // 确认类型
            'declare.BUDAT as BUDAT',                  // 过账日期
            'declare.ISDD as ISDD',                    // 开始执行日期
            'declare.ISDZ as ISDZ',                    // 开始执行时间
            'declare.IEDD as IEDD',                    // 结束执行日期
            'declare.IEDZ as IEDZ',                    // 结束执行时间
            'declare.operation_order_code as operation_order_code',   // 工序单编号
            'declare.production_order_code as production_order_code', //订单号
            'declare.from as from',                    // 系统来源
            'declare.start_time as start_time',                 //  开始时间
            'declare.end_time as end_time',                    //   结束时间
            'declare.routing_node_id as routing_node_id',                    //节点id
            'factory.id as factory_id',
            'factory.name as factory_name',
            'factory.code as factory_code',
            'rsco.current_workhour_package as current_workhour_package',
            'rsco.is_end_operation as is_end_operation',
            'rsco.id as workOrder_id',
            'rsco.group_step_withnames as group_step_withnames',
            'rsco.routing_operation_index as routing_operation_index',
            'rsco.number as wo_number',
            'workcenter.code as workcenter_code',
            'workcenter.id as workcenter_id',
            'declare.picking_id as picking_id',
            'declare.picking_line_id as picking_line_id',
            'picking_line.WERKS as WERKS',   //工厂
            'picking_line.MENGE as MENGE',   //数量
            'picking_line.MEINS as MEINS',   //单位
            'picking_line.BANFN as BANFN',   //采购申请编号
            'picking_line.BNFPO as BNFPO',   //采购申请的项目编号
            'picking_line.AUFNR as AUFNR',   //订单号
            'picking_line.EBELP as EBELP',   //采购凭证的项目编号 
            'production.id as production_id',   // 生产订单id
            'production.qty as production_qty',   //订单数量
            'production.number as production_number',   //订单号
            'production.component as component',   //sap的该PO的原料 BOM母件的原料
            'production.sales_order_code as sales_order_code',                   //销售订单
            'production.sales_order_project_code as sales_order_project_code',   //销售订单行项目
            'picking.EBELN as EBELN',   //采购凭证编号
            'operation_order.id as operation_id',   //sap的该PO的原料 BOM母件的原料
          ];
            //如果是type == 1  表示是委外加工
            $obj_list = DB::table($this->table.' as declare')
                      ->leftJoin(config('alias.rsco') . ' as rsco', 'rsco.id', '=', 'declare.sub_id')
                      ->leftJoin('ruis_ie_operation' . ' as operation', 'operation.id', '=', 'rsco.operation_id')
                      ->leftJoin('ruis_workcenter'. ' as workcenter', 'rsco.work_center_id', '=', 'workcenter.id')
                      ->leftJoin($this->workCenterTable.' as workCenter', 'rsco.work_center_id','=','workCenter.id')
                      ->leftJoin($this->workShopTable.' as workShop', 'workCenter.workshop_id','=','workShop.id')
                      ->leftJoin($this->factoryTable.' as factory', 'workShop.factory_id','=','factory.id')
                      ->leftJoin($this->ProductionTable.' as production', 'declare.production_order_id', '=', 'production.id')
                      ->leftJoin('ruis_sap_out_picking_line'.' as picking_line', 'declare.picking_line_id', '=', 'picking_line.id')
                      ->leftJoin('ruis_sap_out_picking'.' as picking', 'picking.id', '=', 'picking_line.picking_id')
                      ->leftJoin($this->OperationTable.' as operation_order', 'declare.operation_order_id', '=', 'operation_order.id')
                      ->where('declare.id', $id)
                      ->select($data)
                      ->first();
          $total_times  =  $obj_list->end_time  - $obj_list->start_time;
          $sales_order_code = $obj_list->sales_order_code;
          $wo_number = $obj_list->wo_number;
          $operation_id = $obj_list->operation_id;
          $production_id = $obj_list->production_id;
          $wo_number = $obj_list->wo_number;
          $routing_node_id = $obj_list->routing_node_id;
          $production_qty = $obj_list->production_qty;
          $sap_operation = str_pad($obj_list->routing_operation_index * 10, 4, '0', STR_PAD_LEFT);
          $asp_material_arr = obj2array(json_decode($obj_list->component));
          $stand = DB::table($this->workCenterTable.' as workCenter')
                   ->leftJoin('sap_standard_value  as standValue', 'standValue.code', '=', 'workCenter.standard_code')
                   ->leftJoin('sap_standard_value_param_item  as standItem', 'standItem.standard_value_id', '=', 'standValue.id')
                   ->leftJoin('sap_param_item  as paramItem', 'paramItem.id', '=', 'standItem.param_item_id')
                   ->select('paramItem.id','paramItem.unit','paramItem.code')
                   ->where('workCenter.id',$obj_list->workcenter_id)
                   ->orderBy('desc','standItem.index')
                   ->get();
            //判断是否是最后一道工序
            //获取出料
            $out_material = DB::table($this->itemTable.' as  item')
            ->leftJoin('ruis_material  as material', 'material.id', '=', 'item.material_id')
            ->select('item.GMNGA','item.unit_id','item.lot','item.LGPRO','material.item_no','material.lzp_identity_card')
            ->where('item.declare_id', $id)
            ->where('type', '-1')
            ->first();
            //找单位  
            $unit_code = DB::table($this->unitTable)->select('commercial')->where('id',$out_material->unit_id)->first();
            if(empty($unit_code)) TEA('2433');
            $conf_quan_unit =$unit_code->commercial; 
            foreach ($stand as $kk => $sta) 
            {
              $kk_1= $kk+1;
              $val_key='conf_activity'.$kk_1;
              $unit_key='conf_acti_unit'.$kk_1;
              $head[$val_key]=0;
              $head[$unit_key]='';
                    if ($sta->code == 'ZPP001') 
                    {
                         // $head[$val_key]=ceil($total_times);
                         $head[$val_key]=0;
                         $head[$unit_key]=$sta->unit;
                    }

                    if ($sta->code == 'ZPP002') 
                    {
                         // $head[$val_key]=ceil($total_times);
                         $head[$val_key]=0;
                         $head[$unit_key]=$sta->unit;
                    }

                    if ($sta->code == 'ZPP005') 
                    {
                         $head[$val_key]=0;
                         // $head[$val_key]=$yield;
                         $head[$unit_key]=$sta->unit;
                    }
                    $where =[
                      'declare_order_id'=>$id,
                      'standard_item_id'=>$sta->id,
                    ];
                    $stand_res= DB::table('sap_standard_declare_item')->select('value','standard_item_code')->where($where)->first();
                    if ($stand_res) 
                    {
                      if ($sta->code != 'ZPP001'  && $sta->code != 'ZPP002'   &&  $sta->code != 'ZPP005') 
                      {
                          $head[$val_key]+=$stand_res->value;
                          $head[$unit_key]=$sta->unit;
                      }
                      if ($sta->code == 'ZPP009' ) 
                      {
                          $head[$val_key]+=0;
                          $head[$unit_key]=$sta->unit;
                      }

                    }
                    else
                    {
                      if ($sta->code == 'ZPP009' ) 
                      {
                          $head[$val_key]+=0;
                          $head[$unit_key]=$sta->unit;
                      }
                      else
                      {
                         $head[$val_key]+=0;
                         $head[$unit_key]=$sta->unit;
                      }
                    }
            }
            $head['conf_no']=$obj_list->RUECK;  //确认号
            $head['fin_conf']=$obj_list->MANUR;  //确认类型
            $head['orderid']=$obj_list->production_number;  //订单号
            $head['operation']=$sap_operation;  //活动编号
            $head['arbpl']=$obj_list->workcenter_code;  //工作中心
            $head['postg_date']=date("Ymd",$obj_list->BUDAT);  //过账日期
            // 计算实际应该报多少
            // 找所有相关的  wt
            $wt_where = [
              'production_order_id'=>$production_id,
              'routing_node_id'=>$routing_node_id
            ];
            //取所有wt
            $wt_res = DB::table('ruis_operation_order')->select('id','schedule','declare_qty')->where($wt_where)->get();
            if (empty($wt_res)) 
            {
              TEA('9515');
            }
            // 取当前wt
            $now_wt_res = DB::table('ruis_operation_order')->select('id','schedule','declare_qty')->where('id',$operation_id)->first();
            $now_schedule = $now_wt_res->schedule;
            //取当前最小的 完成进度
            $min_res=[];
            foreach ($wt_res as $ke_wt => $va_wt)
            {
                $min_res[]=$va_wt->schedule;
            }

            $min_schedule=min($min_res);
            //比较当前
            //1如果最小进度 不是比当前 进度小那么报0
            if ($now_schedule>$min_schedule) 
            {
                $head['yield']=0;  //产出量
            }
            if ($now_schedule = $min_schedule)
            {
              //2 如果最小进度就是当前进度
              //那么得到之前已报数量之和
              $before_sum= DB::table('ruis_operation_order')
                    ->where('routing_node_id',$routing_node_id)
                    ->where('production_order_id',$production_id)
                    ->sum('declare_qty');
              //计算应报多少      
              // 算出理论应该报的数量
              $should_declare_qty  = round($production_qty*$now_schedule,3);
              // 本次应该报多少
              $yield= $should_declare_qty-$before_sum;
              $head['yield']=$yield;  //产出量
            }

             //出料code  
             $out_material_code  = $out_material->item_no;
             //查物料分类
             $catergory  = DB::table('ruis_material  as  material')
                           ->leftJoin('ruis_material_category as category', 'category.id','=','material.material_category_id')
                           ->select('category.warehouse_management')
                           ->where('material.item_no',$out_material_code)
                           ->first();
             if ($catergory->warehouse_management  == 1) 
             {
                if (!empty($out_material->lzp_identity_card)) 
                {
                  $head['material1']='';  //物料编码  18 位
                  $head['stge_loc1']='';  //库存地点
                  $head['batch1']='';     //批号
                }
                else
                {
                  $head['material1']=$out_material->item_no;  //物料编码  18 位
                  $head['stge_loc1']=$out_material->LGPRO;  //库存地点
                  $head['batch1']=$out_material->lot;     //批号
                }
             }
             else
             {
                  $head['material1']='';  //物料编码  18 位
                  $head['stge_loc1']='';  //库存地点
                  $head['batch1']='';     //批号
             }

            $head['conf_quan_unit']=$conf_quan_unit;  //产出单位
            $head['exec_start_date']=($obj_list->ISDD>0)?$obj_list->ISDD:$ISDD;  //开始执行日期
            $head['exec_start_time']=($obj_list->ISDZ>0)?$obj_list->ISDZ:$ISDZ;  //开始执行时间
            $head['exec_fin_date']=($obj_list->IEDD>0)?$obj_list->IEDD:$IEDD;  //结束执行日期
            $head['exec_fin_time']=($obj_list->IEDZ>0)?$obj_list->IEDZ:$IEDZ;  //结束执行时间
            if ($obj_list->is_end_operation == 1) 
            {
              // $head['TECO']='X';
            }
        $result['head']=$head;
        $wxzdrk=[
          'po_number'  =>$obj_list->EBELN,        //采购订单号
          'po_item'    =>$obj_list->EBELP,        //采购凭证的项目编号
          'plant1'     =>$obj_list->WERKS,        //工厂
          //'entry_qnt1'     =>$obj_list->MENGE,    //数量$head['yield']
          'entry_qnt1'     =>$head['yield'],    //数量
          'entry_uom1'     =>($obj_list->MEINS =='ST')?'PC':$obj_list->MEINS,    // 单位
        ];
          $result['wxzdrk']=$wxzdrk;
          $response = Soap::doRequest($result, 'INT_PP000300006', '0003');       //接口名称  //系统序号
          if ($response['RETURNCODE'] != 1) 
          {
            if (isset($should_declare_qty)  && $should_declare_qty>0) 
            {
                $should_declare_data=[
                    'declare_qty'=> $should_declare_qty
                ];
                 $upd=DB::table('ruis_operation_order')->where('id',$operation_id)->update($should_declare_data);
                  if($upd===false) TEA('804');
            }
            $this->storageInstore($id,$asp_material_arr,$sales_order_code,$wo_number,$asp_material_arr);
          }
      }
      else
      {
        $data=[
            'declare.id as id',                        // id
            'declare.RUECK as RUECK',                  // 确认号
            'declare.MANUR as MANUR',                  // 确认类型
            'declare.BUDAT as BUDAT',                  // 过账日期
            'declare.ISDD as ISDD',                    // 开始执行日期
            'declare.ISDZ as ISDZ',                    // 开始执行时间
            'declare.IEDD as IEDD',                    // 结束执行日期
            'declare.IEDZ as IEDZ',                    // 结束执行时间
            'declare.operation_order_code as operation_order_code',   // 工序单编号
            'declare.production_order_code as production_order_code', //订单号
            'declare.from as from',                    // 系统来源
            'declare.start_time as start_time',                 //  开始时间
            'declare.end_time as end_time',                    //   结束时间
            'declare.routing_node_id as routing_node_id',                    //节点id
            'factory.id as factory_id',
            'factory.name as factory_name',
            'factory.code as factory_code',
            'workCenter.code as workcenter_code',
            'workCenter.id as workcenter_id',
            'workShop.address as address',
            'workOrder.current_workhour_package as current_workhour_package',
            'workOrder.group_step_withnames as group_step_withnames',
            'workOrder.is_end_operation as is_end_operation',
            'workOrder.id as workOrder_id',
            'workOrder.routing_operation_index as routing_operation_index',
            'workOrder.number as wo_number',
            'production.qty as production_qty',   //订单数量
            'production.number as production_number',   //订单号
            'production.id as production_id',   // 生产订单id
            'production.component as component',   //sap的该PO的原料 BOM母件的原料
            'production.sales_order_code as sales_order_code',                   //sap的该PO的原料 BOM母件的原料
            'production.sales_order_project_code as sales_order_project_code',   //sap的该PO的原料 BOM母件的原料
            'operation.id as operation_id',   //sap的该PO的原料 BOM母件的原料
          ];

          $obj_list = DB::table($this->table.' as declare')
            ->leftJoin($this->workOrderTable.' as workOrder', 'declare.work_order_id','=','workOrder.id')
            ->leftJoin($this->workCenterTable.' as workCenter', 'workOrder.work_center_id','=','workCenter.id')
            ->leftJoin($this->workShopTable.' as workShop', 'workCenter.workshop_id','=','workShop.id')
            ->leftJoin($this->factoryTable.' as factory', 'workShop.factory_id','=','factory.id')
            ->leftJoin($this->ProductionTable.' as production', 'declare.production_order_id', '=', 'production.id')
            ->leftJoin($this->OperationTable.' as operation', 'declare.operation_order_id', '=', 'operation.id')
            ->where('declare.id', $id)
            ->select($data)
            ->first();
          $total_times  =  $obj_list->end_time  - $obj_list->start_time;
          $sales_order_code = $obj_list->sales_order_code;
          $operation_id = $obj_list->operation_id;
          $production_id = $obj_list->production_id;
          $wo_number = $obj_list->wo_number;
          $routing_node_id = $obj_list->routing_node_id;
          $production_qty = $obj_list->production_qty;
          $asp_material_arr = obj2array(json_decode($obj_list->component));
            //获取出料
            $out_material = DB::table($this->itemTable.' as  item')
            ->leftJoin('ruis_material  as material', 'material.id', '=', 'item.material_id')
            ->select('item.GMNGA','item.unit_id','item.lot','item.LGPRO','material.item_no','material.lzp_identity_card')
            ->where('item.declare_id', $id)
            ->where('type', '-1')
            ->first();
          $stand = DB::table($this->workCenterTable.' as workCenter')
                   ->leftJoin('sap_standard_value  as standValue', 'standValue.code', '=', 'workCenter.standard_code')
                   ->leftJoin('sap_standard_value_param_item  as standItem', 'standItem.standard_value_id', '=', 'standValue.id')
                   ->leftJoin('sap_param_item  as paramItem', 'paramItem.id', '=', 'standItem.param_item_id')
                   ->select('paramItem.id','paramItem.unit','paramItem.code')
                   ->where('workCenter.id',$obj_list->workcenter_id)
                   ->orderBy('desc','standItem.index')
                   ->get();
            $sap_operation = str_pad($obj_list->routing_operation_index * 10, 4, '0', STR_PAD_LEFT);
            foreach ($stand as $kk => $sta) 
            {
              $kk_1= $kk+1;
              $val_key='conf_activity'.$kk_1;
              $unit_key='conf_acti_unit'.$kk_1;
              $head[$val_key]=0;
              $head[$unit_key]='';
                    $where =[
                      'declare_order_id'=>$id,
                      'standard_item_id'=>$sta->id,
                    ];

                    if ($sta->code == 'ZPP001') 
                    {
                         // $head[$val_key]=ceil($total_times);
                         $head[$val_key]=0;
                         $head[$unit_key]=$sta->unit;
                    }
                    if ($sta->code == 'ZPP002') 
                    {
                         // $head[$val_key]=ceil($total_times);
                         $head[$val_key]=0;
                         $head[$unit_key]=$sta->unit;
                    }

                    if ($sta->code == 'ZPP005') 
                    {
                         $head[$val_key]=0;
                         // $head[$val_key]=$yield;
                         $head[$unit_key]=$sta->unit;
                    }

                    $stand_res= DB::table('sap_standard_declare_item')->select('value','standard_item_code')->where($where)->first();
                    if ($stand_res) 
                    {
                      if ($sta->code != 'ZPP001'  && $sta->code != 'ZPP002' ) 
                      {
                          $head[$val_key]+=$stand_res->value;
                          $head[$unit_key]=$sta->unit;
                      }

                      if ($sta->code == 'ZPP009' ) 
                      {
                          $head[$val_key]+=0;
                          $head[$unit_key]=$sta->unit;
                      }
                    }
                    else
                    {
                      if ($sta->code == 'ZPP009' ) 
                      {
                          $head[$val_key]+=0;
                          $head[$unit_key]=$sta->unit;
                      }
                      else
                      {
                         $head[$val_key]+=0;
                         $head[$unit_key]=$sta->unit;
                      }
                    }
            }
//产出数据准备=======================================================================================================
//判断是否是最后一道工序
           //找单位  
            $unit_code = DB::table($this->unitTable)->select('commercial')->where('id',$out_material->unit_id)->first();
            if(empty($unit_code)) TEA('2433');
            $conf_quan_unit =$unit_code->commercial;
            $head['conf_no']=$obj_list->RUECK;  //确认号
            $head['fin_conf']=$obj_list->MANUR;  //确认类型
            $head['orderid']=$obj_list->production_number;  //订单号
            $head['operation']=$sap_operation;  //活动编号
            $head['arbpl']=$obj_list->workcenter_code;  //工作中心
            $head['postg_date']=date("Ymd",$obj_list->BUDAT);  //过账日期
            // 计算实际应该报多少
            // 找所有相关的  wt
            $wt_where = [
              'production_order_id'=>$production_id,
              'routing_node_id'=>$routing_node_id
            ];
            //取所有wt
            $wt_res = DB::table('ruis_operation_order')->select('id','schedule','declare_qty')->where($wt_where)->get();
            if (empty($wt_res)) 
            {
              TEA('9515');
            }

            // 取当前wt
            $now_wt_res = DB::table('ruis_operation_order')->select('id','schedule','declare_qty')->where('id',$operation_id)->first();
            $now_schedule = $now_wt_res->schedule;
            //取当前最小的 完成进度
            $min_res=[];
            foreach ($wt_res as $ke_wt => $va_wt)
            {
                $min_res[]=$va_wt->schedule;
            }
            $min_schedule=min($min_res);
            //比较当前
            //1如果最小进度 不是比当前 进度小那么报0
            if ($now_schedule>$min_schedule) 
            {
                $head['yield']=0;  //产出量
            }
            if ($now_schedule < $min_schedule || $now_schedule == $min_schedule)
            {
              //2 如果最小进度就是当前进度
              //那么得到之前已报数量之和
              $before_sum= DB::table('ruis_operation_order')
                    ->where('routing_node_id',$routing_node_id)
                    ->where('production_order_id',$production_id)
                    ->sum('declare_qty');
              //计算应报多少      
              // 算出理论应该报的数量
              $should_declare_qty  = round($production_qty*$now_schedule,3);
              //本次应该报多少
              $yield= $should_declare_qty-$before_sum;
              $head['yield']=$yield;  //产出量
            }

             //出料code  
             $out_material_code  = $out_material->item_no;
              //查物料分类
             $catergory  = DB::table('ruis_material  as  material')
                           ->leftJoin('ruis_material_category as category', 'category.id','=','material.material_category_id')
                           ->select('category.warehouse_management')
                           ->where('material.item_no',$out_material_code)
                           ->first();
             if ($catergory->warehouse_management  == 1) 
             {
                if (!empty($out_material->lzp_identity_card)) 
                {
                  $head['material1']='';  //物料编码  18 位
                  $head['stge_loc1']='';  //库存地点
                  $head['batch1']='';     //批号
                }
                else
                {
                  $head['material1']=$out_material->item_no;  //物料编码  18 位
                  $head['stge_loc1']=$out_material->LGPRO;  //库存地点
                  $head['batch1']=$out_material->lot;     //批号
                }
             }
             else
             {
                  $head['material1']='';  //物料编码  18 位
                  $head['stge_loc1']='';  //库存地点
                  $head['batch1']='';     //批号
             }

            $head['conf_quan_unit']=$conf_quan_unit;  //产出单位
            $head['exec_start_date']=($obj_list->ISDD>0)?$obj_list->ISDD:$ISDD;  //开始执行日期
            $head['exec_start_time']=($obj_list->ISDZ>0)?$obj_list->ISDZ:$ISDZ;  //开始执行时间
            $head['exec_fin_date']=($obj_list->IEDD>0)?$obj_list->IEDD:$IEDD;  //结束执行日期
            $head['exec_fin_time']=($obj_list->IEDZ>0)?$obj_list->IEDZ:$IEDZ;  //结束执行时间
            if ($obj_list->is_end_operation == 1) 
            {
              // $head['TECO']='X';
            }
            $result['head']=$head;
            $asp_material_arr = obj2array(json_decode($obj_list->component));
            $in_materials=[];
            $in_materials =obj2array($this->getItemsByOrder($obj_list->id,'1'));
            foreach ($in_materials as  $in_material)
            {
              if ($in_material['material_item_no']  == '99999999') 
              {
                continue;
              }

              if ($in_material['GMNGA']==0)
              {
                continue;
              }

              if (empty($in_material['unit_id'])) TEA('2434');
              //找单位  
              $now_material = $in_material['material_id'];
              $in_unit_code = DB::table($this->unitTable)->select('commercial')->where('id',$in_material['unit_id'])->first();
              if(empty($in_unit_code)) TEA('2433');

              $lzp_identity_card  = DB::table('ruis_material')->select('lzp_identity_card')->where('id',$now_material)->first();
              if (!empty($lzp_identity_card->lzp_identity_card)) 
              {
                continue;
              }
              $indata=[
                'material'=>$in_material['material_item_no'],
                'plant'=>$obj_list->factory_code,
                'entry_qnt'=>$in_material['GMNGA'],
                'entry_uom'=>$in_unit_code->commercial,
                'erfmg'=>$in_material['MSEG_ERFMG'],
                'bktxt'=>$in_material['MKPF_BKTXT'],
                'batch'=>$in_material['lot'],
                'sales_ord'=>$obj_list->sales_order_code,    //销售订单
                's_ord_item'=>$obj_list->sales_order_project_code,   // 销售订单行项目
              ];
               if (empty($obj_list->address))
               {
                 TEA('9512');
               }

               $indata['spec_stock']='';
               foreach ($asp_material_arr as $keeee => $vaaaa) 
               {
                 if ($in_material['material_item_no']  ==  $vaaaa['MATNR']) 
                 {
                   $indata['spec_stock']=$vaaaa['SOBKZ'];
                 }
               }
               $indata['stge_loc']=$obj_list->address;
               $result[]=$indata;
            }
            
              $response = Soap::doRequest($result, 'INT_PP000300006', '0003');       //接口名称     //系统序号
              if ($response['RETURNCODE'] != 1) 
              {
                if (isset($should_declare_qty)  && $should_declare_qty>0) 
                {
                    $should_declare_data=[
                        'declare_qty'=>$should_declare_qty
                    ];
                     $upd=DB::table('ruis_operation_order')->where('id',$operation_id)->update($should_declare_data);
                      if($upd===false) TEA('804');
                }
                $this->storageInstore($id,$asp_material_arr,$sales_order_code,$wo_number,$asp_material_arr);
              }
      }
      return $response;
    }

   /**
     * @message 报告入库
     * @author  liming
     * @time    年 月 日
     */  
      public  function  storageInstore($id,$sap_material_arr=array(),$sales_order_code='',$wo_number='',$asp_material_arr=array())
      { 
        $end_operation = DB::table($this->table.' as declare')
                     ->leftJoin($this->workOrderTable.' as workOrder', 'declare.work_order_id','=','workOrder.id')
                     ->leftJoin($this->factoryTable.' as factory', 'factory.id','=','workOrder.factory_id')
                     ->leftJoin($this->subTable.' as sub', 'declare.sub_id','=','sub.id')
                     ->leftJoin($this->factoryTable.' as subfactory', 'subfactory.id','=','sub.factory_id')
                     ->leftJoin($this->ProductionTable.' as production', 'production.id','=','declare.production_order_id')
                     ->select(
                      "sub.is_end_operation  as sub_end_operation",
                      'factory.id as factory_id',
                      'factory.code as factory_code',
                      'subfactory.id as subfactory_id',
                      'subfactory.code as subfactory_code',
                      "workOrder.is_end_operation  as workOrder_end_operation",
                      "production.number as production_number"
                      )
                     ->where('declare.id',$id)
                     ->first();
            if ($end_operation->sub_end_operation ==1  && $end_operation->workOrder_end_operation ==1)
            {
                return $id;
            }
            $production_number  = $end_operation->production_number;   
            //获取出料   
            $out_material = DB::table($this->itemTable)
            ->select('*')
            ->where('declare_id', $id)
            ->where('type', '-1')
            ->get();
        try{
                  //开启事务
                  DB::connection()->beginTransaction();
                  foreach ($out_material as $value) 
                  {
                       //查找物料类型
                       $material_id  = $value->material_id;
                       //查物料分类
                       $catergory  =   DB::table('ruis_material  as  material')
                                     ->leftJoin('ruis_material_category as category', 'category.id','=','material.material_category_id')
                                     ->select('category.warehouse_management','material.item_no')
                                     ->where('material.id',$material_id)
                                     ->first();
                       if ($catergory->warehouse_management  == 0) 
                       {
                        continue;
                       }
                        //过滤数据
                        $value->quantity = $value->GMNGA;
                        $value->depot_id = $value->line_depot_id;
                        // 通过depot_id  查找  plant_id
                        $plant_res  =  DB::table('ruis_storage_depot')->where('id',$value->line_depot_id)->select('plant_id')->first();
                        // $value->po_number = $production_number;
                        $value->plant_id = $plant_res->plant_id;

                        $materials=[];  // 定义一个空数组 容器
                        $materials_new=[];  // 定义一个空数组 容器
                        if (count($asp_material_arr)>0)
                        {
                           foreach ($asp_material_arr as $keeee => $vaaaa) 
                           {
                              $materials[]=$vaaaa['MATNR'];
                              $materials_new[$vaaaa['MATNR']]['SOBKZ']=$vaaaa['SOBKZ'];
                           }
                        }
                        if (in_array($catergory->item_no,$materials)) 
                        {
                            $SOBKZ= $materials_new[$catergory->item_no]['SOBKZ'];
                            if ($SOBKZ == 'E') 
                            {
                               $value->sale_order_code = $sales_order_code;
                               // $value->wo_number = $wo_number;
                            }
                            else
                            {
                               $value->sale_order_code ='';
                               // $value->wo_number ='';
                            }

                        }
                        else
                        {
                            $value->sale_order_code = $sales_order_code;
                            // $value->wo_number = $wo_number;
                        }

                        $merge_data  = obj2array($value);
                        $item_id   = $merge_data['id'];
                        $res_data = $this->sitem->merge_data($merge_data, 16, '1', 1);
                        //保存明细数据
                        $this->sitem->save($res_data);
                        $item_ = $this->sitem->pk;

                        // // 外键字段关联
                        $this->item->save(array('item_id'=>$item_), $item_id);

                        // 处理出入库明细, 是否入库还是出库
                        $this->sitem->passageway($item_);
                  }
            }catch(\ApiException $e){
            //回滚
            DB::connection()->rollBack();
            TEA($e->getCode());
        }
        //提交事务
        DB::connection()->commit();
        return $id;
      }

    /**
     * 更改状态
     * 1->填完申请单，未推送或推送失败
     * 2->推送成功（完成申请)
     * 3->完成（已填写实收数量）
     *
     * @param $id
     * @param $status
     */
    public function updateStatus($id, $status)
    {
        DB::table($this->table)->where('id', $id)->update(['status' => $status]);
    }

    /**hello
     * @message 自动填充各种补料退料等各种单据
     * @author  liming
     * @time    年 月 日
     */  
    public  function  capacityFill($id)
    {
      $data_zb01=[]; //定义两个空 容器 用来存储 待新增的 数据    //车间补料 zb01   7
      $data_zy02=[]; //车间退料 zy02  2
      $heard=[];

      //获取工单明细
      $data=[
            'item.*',
            'material.id as material_id',
            'material.item_no as material_item_no',
            'material.name as material_name',
            'depot.id as depot_id',
            'depot.name as depot_name',
            'depot.code as depot_code',
            'unit.id  as  unit_id',
            'unit.commercial  as  unit_commercial',
            'unit.name  as  unit_name',
            'unit.unit_text  as  unit_text',
            'declare.work_order_id  as  work_order_id',
        ];
        
        //获取列表
        $obj_list = DB::table($this->itemTable.' as item')
            ->select($data)
            ->leftJoin($this->materialTable.' as material', 'item.material_id', '=', 'material.id')
            ->leftJoin($this->depotTable.' as depot', 'item.line_depot_id', '=', 'depot.id')
            ->leftJoin($this->unitTable.' as unit', 'item.unit_id', '=', 'unit.id')
            ->leftJoin($this->table.' as declare', 'declare.id', '=', 'item.declare_id')
            ->where('item.declare_id', $id)
            ->where('item.type', '1')
            ->orderBy('item.id', 'asc')
            ->get();

        $work_order = $obj_list[0]->work_order_id; //工单id
        $line_depot_id = $obj_list[0]->line_depot_id; //工单id
        $workOrderRes =  DB::table($this->workOrderTable)->select('*')->where('id',$work_order)->first();
        $heard=[
            'factory_id'=>!empty($workOrderRes->factory_id)?$workOrderRes->factory_id:0,
            'send_depot'=>$line_depot_id,
            'work_order_id'=>$work_order,
            'workbench_id'=>!empty($workOrderRes->work_shift_id)?$workOrderRes->work_shift_id:0,
        ];
        $select_data= [
            'requ_item.actual_receive_qty',
            'requ_item.actual_send_qty',
            'requ_item.id as  item_id',
            'requ_item.is_special_stock',
            'requ.factory_id',
            'requ.send_depot',
            'requ.workbench_id',
            'requ.work_order_id',
            'requ.line_depot_id',
           ];
        foreach ($obj_list as $key => $value) 
        {
          $qty  =  $value->qty;         //额定消耗数量
          $GMNGA  =  $value->GMNGA;     //报工消耗数据
          //比较  额定消耗数量  和报工消耗数量
          if ($GMNGA  < $qty) 
          {
            // 如果报工消耗数量小于额定消耗数量 则生成一张领料单针对mes线边库 车间退料zy02   type=2
            $zy02temp= [
                'material_id' => $value->material_id,
                'demand_qty' =>  $qty-$GMNGA,
                'demand_unit_id' => $value->unit_id,
                'is_special_stock' => $value->is_spec_stock,
                'send_status' => 1
            ];
            $data_zy02[]=$zy02temp;
          }

          if($GMNGA>$qty) 
          {
            //  如果报工消耗数量大于额定消耗数量
            //2 生成一张补料单针对mes 线边库zb01车间补料  type=7
            $zb01temp= [
                'material_id' => $value->material_id,
                'demand_qty' =>  $GMNGA-$qty,
                'demand_unit_id' => $value->unit_id,
                'is_special_stock' => $value->is_spec_stock,
                'send_status' => 1
            ];
            $data_zb01[]=$zb01temp;
          }
        }
        $insert_id  = $this->capacityZxxx($heard,$data_zb01,$data_zy02);
        return  $insert_id;
    }

    //新增领料单
    public  function   capacityZxxx($heard,$data_zb01,$data_zy02)
    {
       $creator_id = (!empty(session('administrator')->admin_id)) ? session('administrator')->admin_id : 0;
       $employee_id = (!empty(session('administrator')->admin_id)) ? session('administrator')->admin_id : 0;
       $materialRequisition = new MaterialRequisition();
       if (count($data_zb01)>0) 
       {
         $code  = $materialRequisition->getNewCode(1);
         $heard['code'] = $code;
         $heard['type'] = 7;
         $heard['employee_id'] = $employee_id;
         $heard['creator_id'] = $creator_id;
         $heard['time'] =time();
         $heard['ctime'] =time();
         $heard['mtime'] =time();
         $heard['from'] = 1;
         $heard['status'] = 1;
         try {
              DB::connection()->beginTransaction();
               $insert_id = DB::table(config('alias.rmr'))->insertGetId($heard);
               $item_data = [];
               $i = 1; // 用于生成行项目号
               foreach ($data_zb01 as $key => $value) 
               {
                 $item_data=$value;
                 $item_data['material_requisition_id'] = $insert_id;
                 $item_data['line_project_code']=$materialRequisition->createLineCode($i);
                 $fin_insert_id = DB::table(config('alias.rmri'))->insert($item_data);
                 $i++;
               }
          }catch(\ApiException $e){
              //回滚
              DB::connection()->rollBack();
              TEA($e->getCode());
          }
          //提交事务
          DB::connection()->commit(); 
       }


       if (count($data_zy02)>0) 
       {
          $code  = $materialRequisition->getNewCode(7);
          $heard['code'] = $code;
          $heard['type'] = 2;
          $heard['employee_id'] = $employee_id;
          $heard['creator_id'] = $creator_id;
          $heard['time'] = time();
          $heard['ctime'] = time();
          $heard['mtime'] = time();
          $heard['from'] = 1;
          $heard['status'] = 1;
          try {
              DB::connection()->beginTransaction();
               $insert_id = DB::table(config('alias.rmr'))->insertGetId($heard);
               $item_data = [];
               $i = 1; // 用于生成行项目号
               foreach ($data_zy02 as $key => $value) 
               {
                 $item_data=$value;
                 $item_data['material_requisition_id'] = $insert_id;
                 $item_data['line_project_code']=$materialRequisition->createLineCode($i);
                 $fin_insert_id = DB::table(config('alias.rmri'))->insert($item_data);
                 $i++;
               }
            }catch(\ApiException $e){
                //回滚
                DB::connection()->rollBack();
                TEA($e->getCode());
            }
            //提交事务
            DB::connection()->commit(); 
       }
       return  $fin_insert_id;
    }


    /**
     * @message 通过pr号和pr行项目号查询委外未推送的报工单
     * @author  liming
     * @time    年 月 日
     */  
    public  function   getDeclareByPr($id)
    {
        $obj_list= [];
        $dec_res= [];
        //先获取委外单行信息数据
        $obj_list = DB::table('ruis_sap_out_picking_line'.' as  pick_line')
        ->leftJoin('ruis_sap_out_picking  as picking', 'picking.id', '=', 'pick_line.picking_id')
        ->select('pick_line.*','picking.id  as   picking_id','picking.EBELN  as   EBELN','pick_line.AUFNR  as AUFNR')
        ->where('pick_line.id',$id)
        ->first();
        $BANFN  = $obj_list->BANFN;  // pr号
        $BNFPO  = $obj_list->BNFPO;  // pr项目号
        //根据pr号 和pr行项目号找  委外工单
        $subres_where=[
            'BANFN'=> $BANFN,
            'BNFPO'=> $BNFPO
        ];
        $sub_result  =   DB::table('ruis_subcontract_order')->select('id')->where($subres_where)->first();
        if (!$sub_result) 
        {
           TEA('9507');
        }
        $sub_id  = $sub_result->id;
        $sub_where =[
          'sub_id'=>$sub_id,
          // 'status'=>1,
        ];
        $dec_res =  DB::table('ruis_work_declare_order')->select('*')->where($sub_where)->get();
        if (count($dec_res) == 0) 
        {
          return  $dec_res;
        }
        else
        {
          return  $dec_res;
        }
    } 

    /**
     * 搜索
     */
    private function _search($input)
    {
        $where_all =[];
        $where_all['where'] =[];
        $where_all['orwhere'] =[];
        $now_admin = session('administrator')->admin_id;
        $employee_res=DB::table('ruis_employee  as  employee')->select('is_admin','factory_id','workcenter_id')->where('id',$now_admin)->first();
        if ($employee_res) 
        {
                if ($employee_res->is_admin == 1) 
                {
                    //如果是超管  一路畅通
                }
                else
                {
                    if ($employee_res->factory_id>0  && $employee_res->workcenter_id>0) 
                    {
                     // 如果存在工作中心id  也存在工厂  则根据工作中心查询
                     $where_all['where'][]=['workcenter.id','=',$employee_res->workcenter_id];
                     $where_all['orwhere'][]=['subworkcenter.id','=',$employee_res->workcenter_id];
                    }
                    elseif ($employee_res->factory_id>0  && $employee_res->workcenter_id==0) 
                    {
                     // 如果不存在工作中心id  存在工厂  则根据工厂查询
                     $where_all['where'][]=['factory.id','=',$employee_res->factory_id];
                    }
                    else
                    {
                      //如果什么都没有 则什么也看不到
                      $where_all['where'][]=['factory.id','=',-1];
                    }
                }
        }


        if (isset($input['production_number']) && $input['production_number']) {//根据生产订单号
            $where_all['where'][]=['production.number','like','%'.$input['production_number'].'%'];
        }
        if (isset($input['workOrder_number']) && $input['workOrder_number']) {//根据工单号
            $where_all['where'][]=['workOrder.number','like','%'.$input['workOrder_number'].'%'];
        }
        return $where_all;
    }

}