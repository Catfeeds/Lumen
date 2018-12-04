<?php
namespace App\Http\Models;

use Illuminate\Support\Facades\DB;
use App\Libraries\Soap;

class OutMachineShop extends Base
{
    public function __construct()
    {
        $this->table='ruis_out_machine_shop';
        $this->item_table='ruis_out_machine_shop_item';
        if(empty($this->outitem)) $this->outitem =new OutMachineShopItem();
        if(empty($this->sitem)) $this->sitem =new StorageItem();
    }

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
//region 捡
    /**
     * @param $input
     * @throws \App\Exceptions\ApiException
     */
    public function checkFormField(&$input)
    {
        if (empty($input['picking_id'])) TEA('700', 'picking_id');
        if (empty($input['type'])) TEA('700', 'type');
        $input['creator_id'] = (!empty(session('administrator')->admin_id)) ? session('administrator')->admin_id : 0;
        $input['employee_id'] = (!empty(session('administrator')->admin_id)) ? session('administrator')->admin_id : 0;
    }
//endregion

//region store
    /**
     * 新增
     *
     * @param $input
     * @return mixed
     * @throws \App\Exceptions\ApiException
     */
    public function storeFlowItems($input)
    {
            //不存在id  新增 
            //领料单组件信息
            $materials_arr  =  json_decode($input['items']);
            $temp = [];//定义一个容器
            foreach ($materials_arr as $key => $value) 
            {
                if ($value->depot_id>0   && $value->qty>0) 
                {
                  $depot_id  =$value->depot_id;
                  $temp[$depot_id][]= obj2array($value);
                }
                else
                {
                  continue;
                }
            }

        try {
            //开启事务
            DB::connection()->beginTransaction();
            if(empty($input['sub_id']) || !is_numeric($input['sub_id'])) TEA('703','sub_id');
            $sub_id  = $input['sub_id'];

            $work_order_res = DB::table('ruis_subcontract_order')->select('*')->where('id',$sub_id)->first();
            if (!$work_order_res) TEA('9500');
            if ($work_order_res ->is_delete  == 1  || $work_order_res ->on_off  == 0 ) TEA('9530');

            if (isset($input['id'])) 
            {
                // 存在  id  修改
                $insert_id = $input['id'];
                //明细修改
                $this->outitem->saveItem($input,json_decode($input['items'],true), $insert_id);
            }
            else
            {
                foreach ($temp as $k => $v) 
                {
                      // 键值 为采购存储地点
                      $this->checkFormField($input);  //验证数据
                      $timeStr = date('YmdHis');
                      $temp_code  = 'SP'.$input['type']. $timeStr . rand(100, 999);
                      //1、入库单添加
                      //获取编辑数组
                      $data=[
                          'code' => $temp_code,
                          'depot_id' => $k,
                          'picking_id' => $input['picking_id'],
                          'picking_line_id' => $input['picking_line_id'],
                          'sub_id' => $input['sub_id'],
                          'type' => $input['type'],
                          'production_id' => $input['production_id'],
                          'BANFN'=>$input['BANFN'],
                          'BNFPO'=>$input['BNFPO'],
                          'employee_id' => $input['employee_id'],
                          'time' => time(),
                          'ctime' => time(),
                          'mtime' => time(),
                          'from' => 1,                      //系统来源
                          'status' => 0,
                          'creator_id' => $input['creator_id']
                      ];
                      $insert_id = $this->save($data);
                      if(!$insert_id) TEA('802');
                      $insert_ids[]=$insert_id;
                      //2明细添加
                      $this->outitem->saveItem($input,$v,$insert_id);
                  }
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
     * 编辑实发
     * @param $input
     * @return mixed
     * @throws \App\Exceptions\ApiException
     */
    public function updateFlowItems($input)
    {
        try {
            //开启事务
            DB::connection()->beginTransaction();
            $order_id = $input['id'];
            //编辑明细
            $this->outitem->saveItem($input,json_decode($input['items'],true), $order_id);
        } catch (\ApiException $e) {
            //回滚
            DB::connection()->rollBack();
            TEA($e->getCode());
        }
        DB::connection()->commit();
        return $order_id;
    }

//endregion
    /**
     * 更改状态
     *
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
            $input['order']='desc';$input['sort']='id';
        } 

          $where = $this->_search($input);
          $data=[
            'shop.*',
            'pick.EBELN  as EBELN',
            're.name as employee_name',   //员工
            'production.number as po_number',   //生产订单号
            'production.sales_order_code as sales_order_code',   //销售订单号
            'production.sales_order_project_code as sales_order_project_code',   //销售订单行项目号
            'factory.id as factory_id',   //工厂id
            'factory.name as factory_name',   //工厂名称
            'factory.code as factory_code',   //工厂编号
            'sub.number as sub_number',   //委外工单编号
            'depot.id as depot_id',       //线边仓id
            'depot.name as depot_name',   //线边仓名称
            'sub.number as sub_number',   //委外工单编号
          ];
          $obj_list=DB::table($this->table.' as shop')
            ->select($data)
            ->leftJoin('ruis_sap_out_picking'. ' as pick', 'shop.picking_id', '=', 'pick.id')
            ->leftJoin('ruis_storage_depot'. ' as depot', 'shop.depot_id', '=', 'depot.id')
            ->leftJoin('ruis_production_order'. ' as production', 'production.id', '=', 'shop.production_id')
            ->leftJoin('ruis_factory'. ' as factory', 'factory.id', '=', 'production.factory_id')
            ->leftJoin('ruis_subcontract_order'. ' as sub', 'sub.id', '=', 'shop.sub_id')
            ->leftJoin(config('alias.re') . ' as re', 're.id', '=', 'shop.employee_id')
            ->where($where)
            ->offset(($input['page_no']-1)*$input['page_size'])
            ->limit($input['page_size'])
            ->orderBy($input['sort'],$input['order'])
            ->get();
            foreach ($obj_list as $key => $obj)
            {
                $obj->time  = date('Y-m-d H:i:s',$obj->time);
                $obj->groups = $this->getItemsByOrder($obj->id);
            }
          $obj_list->total_count = DB::table($this->table.' as shop')->where($where)->count();
          return $obj_list;
    }

    /**
     * @message 获取明细
     * @author  liming
     * @time    年 月 日
     */    
    public  function   getItemsByOrder($order_id)       
    {

         $data=[
            'item.*',
            'rm.name as material_name',   // 物料名
            'rm.item_no as material_code',   //物料编号
            'ruu.commercial as unit_commercial',   //物料编号
            'ruu.id as unit_id',   //物料编号
            'inve.lot as lot',
            'inve.sale_order_code as sale_order_code',   
            'inve.storage_validate_quantity as storage_validate_quantity',   
            'inve.wo_number as wo_number',  
            'inve.po_number as po_number',   
            'inve.material_id as material_id',   
            'depot.code as depot_code',   
            'depot.name as depot_name',
         ];
         $obj_list=DB::table($this->item_table.' as item')
                  ->select($data)
                  ->where('item.out_machine_shop_id','=', $order_id)
                  ->leftJoin(config('alias.rm') . ' as rm', 'rm.id', '=', 'item.material_id')
                  ->leftJoin(config('alias.ruu') . ' as ruu', 'ruu.id', '=', 'item.unit_id')
                  ->leftJoin('ruis_storage_inve as inve', 'inve.id', '=', 'item.inve_id') 
                  ->leftJoin('ruis_storage_depot as depot', 'depot.id', '=', 'inve.depot_id') 
                  ->get();
         return  $obj_list;
    }

    /**
     * 查看某条委外相关单条
     * @param $id
     * @return array
     * @author  liming 
     * @todo 
     */
    public function show($id)
    {
          $data=[
            'shop.*',
            'pick.EBELN  as EBELN',
            're.name as employee_name',   //员工
            'production.number as po_number',   //生产订单号
            'production.sales_order_code as sales_order_code',   //销售订单号
            'production.sales_order_project_code as sales_order_project_code',   //销售订单行项目号
            'factory.id as factory_id',   //工厂id
            'factory.name as factory_name',   //工厂名称
            'factory.code as factory_code',   //工厂编号
            'sub.number as sub_number',   //委外工单编号
          ];
           $obj_list=DB::table($this->table.' as shop')
            ->select($data)
            ->leftJoin('ruis_sap_out_picking'. ' as pick', 'shop.picking_id', '=', 'pick.id')
            ->leftJoin('ruis_production_order'. ' as production', 'production.id', '=', 'shop.production_id')
            ->leftJoin('ruis_factory'. ' as factory', 'factory.id', '=', 'production.factory_id')
            ->leftJoin('ruis_subcontract_order'. ' as sub', 'sub.id', '=', 'shop.sub_id')
            ->leftJoin(config('alias.re') . ' as re', 're.id', '=', 'shop.employee_id')
            ->orderBy('id','asc')
            ->where('shop.id',$id)
            ->get();
            foreach ($obj_list as $key => $obj)
            {
                $obj->time  = date('Y-m-d H:i:s',$obj->time);
                $obj->groups = $this->getItemsByOrder($obj->id);
            }
            return $obj_list;
    }

    /**
     * @message 获取所有的物料信息
     * @author  liming
     * @time    年 月 日
     */    
    public function getWorkShopSyncSapData($id)
    {
        $this->unit =new Units();
        $obj_list=DB::table('ruis_out_machine_shop_item as shop_item')
               ->leftJoin('ruis_out_machine_shop as shop', 'shop.id', '=','shop_item.out_machine_shop_id')
               ->leftJoin('ruis_sap_out_picking as picking', 'picking.id', '=','shop.picking_id')
               ->leftJoin('ruis_employee as employee', 'employee.id', '=','shop.employee_id')
               ->leftJoin('ruis_production_order as pro', 'pro.id', '=','shop.production_id')
               ->leftJoin('ruis_factory as factory', 'factory.id', '=','pro.factory_id')
               ->leftJoin('ruis_storage_inve as inve', 'inve.id', '=','shop_item.inve_id')
               ->leftJoin('ruis_storage_depot as depot', 'depot.id', '=','inve.depot_id')
               ->leftJoin('ruis_material as material', 'material.id', '=','shop_item.material_id')
               ->leftJoin('ruis_uom_unit as unit', 'unit.id', '=','material.unit_id')
               ->leftJoin('ruis_material_category as category', 'category.id', '=','material.material_category_id')
               ->select(
                'shop.production_id',
                'shop.code',
                'shop.type',
                'shop.picking_id',
                'shop.BANFN',
                'shop.BNFPO',
                'shop_item.material_id',
                'shop_item.qty',
                'shop_item.actual_send_qty',
                'shop_item.unit_id',
                'shop_item.lot',
                'shop_item.inve_id',
                'pro.sales_order_code',
                'pro.sales_order_project_code',
                'pro.component',
                'pro.factory_id',
                'factory.code  as  factory_code',
                'factory.name  as  factory_name',
                'material.item_no  as  material_item_no',
                'material.name  as  material_name',
                'material.unit_id  as  material_unit_id',
                'unit.commercial  as  material_commercial',
                'category.name  as  category_name',
                'category.code  as  category_code',
                'picking.LIFNR  as  LIFNR',
                'depot.code    as  depot_code',
                'depot.name    as  depot_name',
                'employee.name    as  employee_name'
                )
               ->where('shop_item.out_machine_shop_id',$id)
               ->get();
        $sendData = [];
        if (count($obj_list) > 0)
        {   
            $j = 1;
            foreach ($obj_list as $key => $value) 
            {
                $category_code  =$value->category_code;
                //如果当前物料的分类不在限定之列，则不需要发送
                $category_preg_arr = config('app.pattern.material_category_preg');
                $sign = 0;
                foreach ($category_preg_arr as $keee=> $vaaa) 
                {
                    if(preg_match($vaaa,$category_code))   
                    {
                        $sign  = 1;
                    }
                }
                if ($sign == 0) 
                {
                   continue;
                }
                // bom单位转为基本单位
                $qty = $value->actual_send_qty;
                $unit_res=$this->unit->getExchangeUnitValueById($value->unit_id,$value->material_unit_id,$qty,$value->material_id);
                $type  = $value->type;
                //1 领料   2补料  3 退料 
                $LLLX='';
                if ($type == 1) 
                {
                  $LLLX='ZY03';
                }

                if ($type == 2) 
                {
                  $LLLX='ZB03';
                }

                if ($type == 3) 
                {
                  $LLLX='ZY04';
                }

                $temp=[];
                $temp['LLDH']=$value->code;
                $temp['LLHH']=str_pad($j, 5, '0', STR_PAD_LEFT);
                $temp['LLLX']=$LLLX;
                $temp['LLRQ']=date('Ymd', time());
                $temp['LLSJ']=date('His', time());
                $temp['LLR'] =$value->employee_name;
                $temp['WERKS'] =$value->factory_code;
                $temp['XNBK'] ='';//需求地点
                $temp['GONGW'] ='';
                $temp['GONGD'] ='';
                $temp['FCKCDD'] =$value->depot_code;//发出库存地点
                $temp['AUFNR'] ='';//订单号（非PO）
                $temp['LIFNR'] =$value->LIFNR;
                $temp['MATNR'] =$value->material_item_no;
                $temp['MAKTX'] =$value->material_name;
                $temp['XTLY']  =1;//系统来源
                $temp['BATCH'] = $value->lot; //批次
                $temp['XQSL'] = $unit_res; //单位转换结果
                $temp['XQSLDW'] =$value->material_commercial; //物料基础单位
                $sap_arr = json_decode($value->component,true);

                $KDA_temp = '';
                $KDP_temp = '';
                //根据物料  和工厂  查找是否是特殊库存
                $special_where=[
                  'MATNR'=>$value->material_item_no,
                  'WERKS'=>$value->factory_code,
                ];
                $marc_res = DB::table('ruis_material_marc')->where($special_where)->select('SBDKZ')->first();
                if (!$marc_res) TEA('9532',$value->material_item_no);
                if ($marc_res) 
                {
                  if ($marc_res->SBDKZ != 2) 
                  {
                       $KDA_temp= $value->sales_order_code;
                       $KDP_temp= $value->sales_order_project_code;
                  }
                }
                $temp['KDAUF'] =$KDA_temp; 
                $temp['KDPOS'] =$KDP_temp; 
                // 作废
                // if (count($sap_arr)>0) 
                // {
                //     $KDA_temp = '';
                //     $KDP_temp = '';
                //     foreach ($sap_arr as $k => $v) 
                //     {
                //        if ($v['MATNR'] == $value->material_item_no  &&  $v['SOBKZ']=='E') 
                //        {
                //           $KDA_temp= $value->sales_order_code;
                //           $KDP_temp= $value->sales_order_project_code;
                //           break;
                //        }
                //     }
                //     $temp['KDAUF'] =$KDA_temp; 
                //     $temp['KDPOS'] =$KDP_temp; 
                // }
                // else
                // {
                //     $temp['KDAUF'] =''; 
                //     $temp['KDPOS'] =''; 
                // }
                $sendData[] = $temp;
                $j++;
            }
        }
        return $sendData;
    }

    /**
     * 生成一个行项目号
     *
     * @param $i
     * @return string
     */
    public function createLineCode($i)
    {
        return str_pad($i, 5, '0', STR_PAD_LEFT);
    }

    /**
     * 审核
     * @param $input   array   input数组
     * @throws \Exception
     * @author    liming
     */
    public function audit($input)
    {
        $order_id   = $input['id'];
        $type_res=DB::table('ruis_out_machine_shop')->where('id',$order_id)->select('type')->first(); 
        $type= $type_res->type;  // 1 领料   2补料  3 退料 
        //判断 是否 审核
        $status = $this->getStatus($order_id);
        if ($status[0]->status  ==  1) TEA('9522');
        //获取编辑数组
        $data=[
            'status'=>1,
        ];
        // 获取明细 数据
        $gdata = $this->outitem->getItems($order_id);
        try{
            //开启事务
            DB::connection()->beginTransaction();
            //改变状态
            $upd=DB::table($this->table)->where('id',$input['id'])->update($data);
            if($upd===false) TEA('804');
            if(count($gdata) < 1) TEA('8309');
            if ($type == 1)   // 委外车间领料
            {
                //保存明细至 storage_item表
                foreach ($gdata as $value) {
                    //过滤数据
                    $merge_data  = obj2array($value);
                    $inve_id  = $merge_data['inve_id'];
                    $inve_res = DB::table('ruis_storage_inve')->where('id',$inve_id)->select('sale_order_code','wo_number','po_number','depot_id','lot','plant_id')->first(); 
                    if (!$inve_res) TEA('9524');
                    $merge_data['wo_number']=$inve_res->wo_number;
                    $merge_data['po_number']=$inve_res->po_number;
                    $merge_data['sale_order_code']=$inve_res->sale_order_code;
                    $merge_data['depot_id']=$inve_res->depot_id;
                    $merge_data['plant_id']=$inve_res->plant_id;
                    $merge_data['lot']=$inve_res->lot;
                    $merge_data['quantity']=$merge_data['actual_send_qty'];
                    if ($merge_data['quantity'] ==0) TEA('9526');
                    $item_id   = $merge_data['id'];
                    $res_data = $this->sitem->merge_data($merge_data, 37, '-1', 1);
                    //保存明细数据
                    $this->sitem->save($res_data);
                    $item_ = $this->sitem->pk;
                    // 外键字段关联
                    $this->outitem->save(array('storage_item_id'=>$item_), $item_id);
                    // 处理出入库明细, 是否入库还是出库
                    $this->sitem->passageway($item_);
                }
            }

            if ($type == 2)   // 委外车间补料
            {
                //保存明细至 storage_item表
                foreach ($gdata as $value) {
                    //过滤数据
                    $merge_data  = obj2array($value);
                    $inve_id  = $merge_data['inve_id'];
                    $inve_res = DB::table('ruis_storage_inve')->where('id',$inve_id)->select('sale_order_code','wo_number','po_number','depot_id','lot','plant_id')->first(); 
                    if (!$inve_res) TEA('9524');
                    $merge_data['wo_number']=$inve_res->wo_number;
                    $merge_data['po_number']=$inve_res->po_number;
                    $merge_data['sale_order_code']=$inve_res->sale_order_code;
                    $merge_data['depot_id']=$inve_res->depot_id;
                    $merge_data['plant_id']=$inve_res->plant_id;
                    $merge_data['lot']=$inve_res->lot;
                    $merge_data['quantity']=$merge_data['actual_send_qty'];
                    if ($merge_data['quantity']==0) TEA('9526');

                    $item_id   = $merge_data['id'];
                    $res_data = $this->sitem->merge_data($merge_data, 38, '-1', 1);

                    //保存明细数据
                    $this->sitem->save($res_data);
                    $item_ = $this->sitem->pk;

                    // 外键字段关联
                    $this->outitem->save(array('storage_item_id'=>$item_), $item_id);

                    // 处理出入库明细, 是否入库还是出库
                    $this->sitem->passageway($item_);
                }
            }

            if ($type == 3)   // 委外车间退料
            {
                //保存明细至 storage_item表
                foreach ($gdata as $value) {
                    //过滤数据
                    $merge_data  = obj2array($value);
                    $inve_id  = $merge_data['inve_id'];
                    $inve_res = DB::table('ruis_storage_inve')->where('id',$inve_id)->select('sale_order_code','wo_number','po_number','depot_id','lot','plant_id')->first(); 
                    if (!$inve_res) TEA('9524');
                    $merge_data['wo_number']=$inve_res->wo_number;
                    $merge_data['po_number']=$inve_res->po_number;
                    $merge_data['sale_order_code']=$inve_res->sale_order_code;
                    $merge_data['depot_id']=$inve_res->depot_id;
                    $merge_data['plant_id']=$inve_res->plant_id;
                    $merge_data['lot']=$inve_res->lot;
                    $merge_data['quantity']=$merge_data['actual_send_qty'];
                    if ($merge_data['quantity'] == 0) TEA('9528');
                    $item_id   = $merge_data['id'];
                    $res_data = $this->sitem->merge_data($merge_data, 20, '1', 1);

                    //保存明细数据
                    $this->sitem->save($res_data);
                    $item_ = $this->sitem->pk;

                    // 外键字段关联
                    $this->outitem->save(array('storage_item_id'=>$item_), $item_id);

                    // 处理出入库明细, 是否入库还是出库
                    $this->sitem->passageway($item_);
                }
            }
        }catch(\ApiException $e){
            //回滚
            DB::connection()->rollBack();
            TEA($e->getCode());
        }
        //提交事务
        DB::connection()->commit();
        return $order_id;
    }




    /**
     * 反审核
     * @param $input   array   input数组
     * @throws \Exception
     * @author    liming
     */
    public function noaudit($input)
    {
        $order_id   = $input['id'];
        //判断 是否 审核
        $status = $this->getStatus($order_id);
        if ($status[0]->status  ==  0) TEA('8307');

        // 获取明细 数据
        $gdata = $this->outitem->getItems($order_id);

        //获取编辑数组
        $data=[
            'status'=>0,
        ];

        try{
            //开启事务
            DB::connection()->beginTransaction();
            $upd=DB::table($this->table)->where('id',$input['id'])->update($data);
            if($upd===false) TEA('804');

            foreach ($gdata as $value) {
                $vaule_arr=obj2array($value);

                //给明细的 item_id  重新置空
                $this->outitem->save(array('storage_item_id'=>"NULL"), $vaule_arr['id']);

                //[反冲] 库存和出入库明细通道函数
                $this->sitem->del($vaule_arr['storage_item_id']);
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
     * @message 获取退料信息
     * @author  liming
     * @time    年 月 日
     */  
    public  function  showSendBack($picking_line_id)
    {
        $vessel  =  [];//定义一个容器
        //先获取委外单行信息数据
        $result = DB::table('ruis_sap_out_picking_line'.' as  pick_line')
        ->leftJoin('ruis_sap_out_picking  as picking', 'picking.id', '=', 'pick_line.picking_id')
        ->select('pick_line.*','picking.id  as   picking_id','picking.EBELN  as   EBELN','pick_line.AUFNR  as AUFNR')
        ->where('pick_line.id',$picking_line_id)
        ->first();
        $qty = $result->MENGE;     // 数量
        $BANFN  = $result->BANFN;  // pr号
        $BNFPO  = $result->BNFPO;  // pr项目号
        $AUFNR  = $result->AUFNR;  // 未处理的生产订单
        $EBELN  = $result->EBELN;  // 
        $EBELP  = $result->EBELP;  // 
        $picking_id  = $result->picking_id;  // 
        $po_code=preg_replace('/^0+/','', $AUFNR);
        $sale_res =   DB::table('ruis_production_order')->select('sales_order_code')->where('number',$po_code)->first();
        if (!$sale_res) TEA('9513');
        $sale_code  = $sale_res->sales_order_code;
        $production_code=preg_replace('/^0+/','',$AUFNR);
        $production_res  = DB::table('ruis_production_order')->select('id')->where('number',$production_code)->first();
        $production_id  = $production_res->id;
        //根据pr号 和pr行项目号找  委外工单
        $subres_where=[
            'BANFN'=> $BANFN,
            'BNFPO'=> $BNFPO,
            'production_order_id'=>$production_id
        ];
        $sub_result  =   DB::table('ruis_subcontract_order')->select('work_center_id','operation_order_code','routing_node_id','id')->where($subres_where)->first();
        if (!$sub_result) 
        {
           TEA('9507');
        }
        $sub_id  = $sub_result->id;
      //根据  picking_line_id  去获取所有的  车间领料单 和 补料单
      $materials_res  =  DB::table('ruis_out_machine_shop_item  as  shop_item')
                      ->leftJoin('ruis_uom_unit as unit', 'unit.id', '=','shop_item.unit_id')
                      ->leftJoin('ruis_out_machine_shop as shop', 'shop.id', '=','shop_item.out_machine_shop_id')
                      ->leftJoin('ruis_storage_inve as inve', 'inve.id', '=','shop_item.inve_id')
                      ->leftJoin('ruis_storage_depot as depot', 'depot.id', '=','inve.depot_id')
                      ->leftJoin('ruis_material as material', 'material.id', '=','inve.material_id')
                      ->select(
                        'shop_item.*',
                        'depot.name  as  depot_name',
                        'depot.code  as  depot_code',
                        'depot.id  as  depot_id',
                        'unit.commercial  as  commercial',
                        'inve.lot  as  lot',
                        'inve.po_number  as  po_number',
                        'inve.wo_number  as  wo_number',
                        'inve.sale_order_code  as  sale_order_code',
                        'material.item_no  as  item_no',
                        'material.name  as  material_name',
                        'material.id  as  material_id'
                        )
                      ->wherein('shop.type',[1,2])
                      ->where('shop.picking_line_id',$picking_line_id)
                      ->get();

      // 如果 一条物料都没有 则 不需要   退料
      if (count($materials_res) < 1) 
      {
        TEA('9527');          
      }                
      $vessel['BNFPO']=$BNFPO;
      $vessel['BANFN']=$BANFN;
      $vessel['AUFNR']=$AUFNR;
      $vessel['EBELP']=$EBELP;
      $vessel['EBELN']=$EBELN;
      $vessel['production_id']=$production_id;
      $vessel['sub_id']=$sub_id;
      $vessel['picking_id']=$picking_id;
      // 按 inve_id  分组
      $vessel['materials'] = [];
      foreach ($materials_res as $ke => $va) 
      { 
          if ($va->actual_send_qty == 0) 
          {
            continue;
          }
          $vessel['materials'][$va->material_id][$va->inve_id]['material_id'] =  $va->material_id;
          $vessel['materials'][$va->material_id][$va->inve_id]['unit_id']     =  $va->unit_id;
          $vessel['materials'][$va->material_id][$va->inve_id]['commercial']  =  $va->commercial;
          $vessel['materials'][$va->material_id][$va->inve_id]['lot']         =  $va->lot; 
          $vessel['materials'][$va->material_id][$va->inve_id]['inve_id']     =  $va->inve_id;
          $vessel['materials'][$va->material_id][$va->inve_id]['material_item_no']=  $va->item_no;
          $vessel['materials'][$va->material_id][$va->inve_id]['material_name']   =  $va->material_name;
          $vessel['materials'][$va->material_id][$va->inve_id]['po_number']         =  $va->po_number;
          $vessel['materials'][$va->material_id][$va->inve_id]['wo_number']         =  $va->wo_number;
          $vessel['materials'][$va->material_id][$va->inve_id]['sale_order_code']   =  $va->sale_order_code;
          $vessel['materials'][$va->material_id][$va->inve_id]['depot_name']   =  $va->depot_name;
          $vessel['materials'][$va->material_id][$va->inve_id]['depot_code']   =  $va->depot_code;
          $vessel['materials'][$va->material_id][$va->inve_id]['depot_id']   =  $va->depot_id;

          if (!isset($vessel[$va->inve_id]['total_qty']))
          {
            $vessel['materials'][$va->material_id][$va->inve_id]['total_qty']=0;
          }
          $vessel['materials'][$va->material_id][$va->inve_id]['total_qty']   += $va->actual_send_qty;
      }
      return $vessel;
    }

    /**
     * 搜索
     */
    private function _search($input)
    {
        $where = array();
        if (isset($input['type']) && $input['type']) {//根据类型编码
            $where[]=['shop.type','=',$input['type']];
        }
        if (isset($input['picking_id']) && $input['picking_id']) {//根据委外订单
            $where[]=['shop.picking_id','=',$input['picking_id']];
        }
        if (isset($input['sub_id']) && $input['sub_id']) {//根据委外工单
            $where[]=['shop.sub_id','=',$input['sub_id']];
        }
        if (isset($input['po_number']) && $input['po_number']) {//根据生产订单号
            $where[]=['production.number','=',$input['po_number']];
        }
        if (isset($input['EBELN']) && $input['EBELN']) {//委外采购订单
            $where[]=['pick.EBELN','=',$input['EBELN']];
        }
        return $where;
    }

}