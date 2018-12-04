<?php
namespace App\Http\Models;


use Illuminate\Support\Facades\DB;
use App\Libraries\Soap;

class OutMachineZy extends Base
{

    public function __construct()
    {
        $this->table='ruis_out_machine_zxxx_order';
        $this->item_table='ruis_out_machine_zxxx_order_item';
        $this->pickTable='ruis_sap_out_picking';
        if(empty($this->outitem)) $this->outitem =new OutMachineZyItem();

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
        // if (empty($input['factory_id'])) TEA('700', 'factory_id');
        
        // if (empty($input['employee_id'])) TEA('700', 'employee_id');
        if (empty($input['out_picking_id'])) TEA('700', 'out_picking_id');
        if (empty($input['type'])) TEA('700', 'type');
        if (empty($input['type_code'])) TEA('700', 'type_code');
        $input['creator_id'] = (!empty(session('administrator')->admin_id)) ? session('administrator')->admin_id : 0;
        $input['employee_id'] = (!empty(session('administrator')->admin_id)) ? session('administrator')->admin_id : 0;
    }
//endregion

//region store
    /**
     * 新增领料单
     *
     * @param $input
     * @return mixed
     * @throws \App\Exceptions\ApiException
     */
    public function storeZy($input)
    {
        $type_code = $input['type_code'];
        $insert_ids=[];
        try {
            //开启事务
            DB::connection()->beginTransaction();
            if (isset($input['id'])) 
            {
                // 存在  id  修改
                $insert_id = $input['id'];
                //明细修改
                $this->outitem->saveItem(json_decode($input['items'],true), $insert_id,$type_code);
            }
            else
            {
                //不存在id  新增 
                //领料单组件信息
                $materials_arr  =  json_decode($input['items']);
                $temp = [];//定义一个容器
                foreach ($materials_arr as $key => $value) 
                {
                    $material_code=$value->MATNR;
                    if (empty($value->LGFSB)) TEA('9509',$material_code); 

                    $LGFSB = $value->LGFSB;

                    if (empty($LGFSB)) 
                    {
                      // 如果不存在  就在容器中  加一个  空地址 分组
                      $temp['air'][]= obj2array($value);
                    }
                    else
                    {
                      $temp[$LGFSB][]= obj2array($value);
                    }
                }
                foreach ($temp as $k => $v) 
                {
                      // 键值 为采购存储地点
                      $this->checkFormField($input);  //验证数据
                      $timeStr = date('YmdHis');
                      $temp_code  = 'ZY4'. $timeStr . rand(100, 999);
                      //1、入库单添加
                      //获取编辑数组
                      $data=[
                          'code' => $temp_code,
                          'out_picking_id' => $input['out_picking_id'],
                          'type'=>$input['type'],
                          'type_code'=>$input['type_code'],
                          'factory_id' => isset($input['factory_id'])?$input['factory_id']:'',
                          'DWERKS' =>($k=='air')?'':$k,
                          'employee_id' => $input['employee_id'],
                          'time' => time(),
                          'ctime' => time(),
                          'mtime' => time(),
                          'from' => 1,                                  //系统来源
                          'status' => 1,
                          'creator_id' => $input['creator_id']
                      ];
                      $insert_id = $this->save($data);
                      if(!$insert_id) TEA('802');
                      $insert_ids[]=$insert_id;
                      //2明细添加
                      $this->outitem->saveItem($v, $insert_id,$type_code);
                  }
            }
        } catch (\ApiException $e) {
            //回滚
            DB::connection()->rollBack();
            TEA($e->getCode());
        }
        DB::connection()->commit();
        return $insert_ids;
    }
//endregion
    /**
     * @message  推送领料结果 给sap
     *
     * @param $id
     * @return mixed
     * @throws \App\Exceptions\ApiException
     * @author  liming
     * @time    2018年 9月 13日
     */
    public function pushOutMachineZy($id)
    {
        $this->unit =new Units();
        //判断状态是否为2  如果是2 怎不能继续推送
        $status_res  =   DB::table($this->table)->where('id', $id)->select('status','DWERKS')->first();
        $DWERKS = $status_res->DWERKS;
        if (empty($status_res->DWERKS)) TEA('9505');
        if ($status_res->status  == 2) TEA('9503');
        $result = [];
        $data = [
            'outZy.code  as  outZy_code',  //领料单号
            'outZy.type_code  as  outZy_type_code',  //类型
            'outZy.time  as  outZy_time', //领料时间
            'outZy.from  as  outZy_from', //系统来源
            'rf.name as factory_name',    // 工厂
            'rf.code as factory_code',
            're.name as employee_name',   //员工
            'rm.name as material_name',   // 物料名
            'rm.item_no as material_code',   //物料编号
            'pick.EBELN', //采购凭证编号
            'pick.LIFNR', //供应商或债权人的帐号
            'outZyItem.*', //采购凭证编号
            'rsd.id  as  wms_depot_id', //wms 发货仓地址
            'rsd.name as wms_depot_name', 
            'rsd.code   as wms_depot_code', 
        ];
        $objs = DB::table($this->item_table.' as outZyItem')
            ->leftJoin($this->table. ' as outZy', 'outZyItem.out_machine_zxxx_order_id', '=', 'outZy.id')
            ->leftJoin($this->pickTable. ' as pick', 'outZy.out_picking_id', '=', 'pick.id')
            ->leftJoin(config('alias.rf') . ' as rf', 'rf.id', '=', 'outZy.factory_id')
            ->leftJoin(config('alias.re') . ' as re', 're.id', '=', 'outZy.employee_id')
            ->leftJoin(config('alias.rm') . ' as rm', 'rm.id', '=', 'outZyItem.material_id')
            ->leftJoin(config('alias.rsd') . ' as rsd', 'rsd.id', '=', 'outZy.wms_depot_id')
            ->where('outZy.id', '=', $id)
            ->select($data)
            ->get();
        foreach ($objs as $key => $value) {
           $material_code=preg_replace('/^0+/','',$value->material_code);
           $mat_res = DB::table('ruis_material'.' as material')
                 ->select('material.id','material.unit_id','unit.commercial')
                 ->leftJoin('ruis_uom_unit  as unit', 'unit.id', '=', 'material.unit_id')
                 ->where('item_no', $material_code)
                 ->first();
             if ($mat_res) 
             {
               //单位数量处理 
               $material_unit_qty  = 0;
               $bom_unit_res = DB::table('ruis_uom_unit')->select('id')->where('commercial',$value->XQSLDW)->first();
               if ($bom_unit_res) 
               {
                 $bom_unit_id = $bom_unit_res->id;
                 $unit_res=$this->unit->getExchangeUnitValueById($bom_unit_id,$mat_res->unit_id,$value->XQSL,$mat_res->id);
                 $material_unit_qty  = $unit_res;
                 $real_XQSL = $material_unit_qty;
                 $real_XQSLDW = $mat_res->commercial;
               }
               else
               {
                 $real_XQSL = 0;
                 $real_XQSLDW = $mat_res->commercial;
               }

             }
             else
             {
               $real_XQSL = 0;
               $real_XQSLDW ='';
             }
            //获取 第一条 明细
            $first_item =DB::table($this->item_table)
                          ->select('material_id','LGFSB','MATNR')
                          ->where('out_machine_zxxx_order_id','=', $id)
                          ->first();
            if (!$first_item) TEA('9510');     
            $material_code=preg_replace('/^0+/','',$first_item->MATNR);  
            $factory_where=[
                'LGFSB'=>$first_item->LGFSB,
                'material_id'=>$first_item->material_id
            ];
            $reall_WERKS='';
            $factory_res  =DB::table('ruis_material_marc')->select('WERKS')->where($factory_where)->first();
            //假如 按采购地址找不到工厂    就按生产地址找
            if (!$factory_res) 
            {
                $clone_factory_where=[
                    'LGPRO'=>$first_item->LGFSB,
                    'material_id'=>$first_item->material_id
                ];  
                $clone_factory_res  =DB::table('ruis_material_marc')->select('WERKS')->where($clone_factory_where)->first();
                if (!$clone_factory_res) TEA('9511',$material_code);
                $reall_WERKS=  $clone_factory_res->WERKS;
            }
            else
            {
              $reall_WERKS=  $factory_res->WERKS;
            }
            if (empty($reall_WERKS)) TEA('9511',$material_code);  
            $temp_data = [
                    'LLDH' => $value->outZy_code,
                    'LLHH' => $value->line_project_code,
                    'LLLX' => $value->outZy_type_code,
                    'LLRQ' => date('Ymd', $value->outZy_time),
                    'LLSJ' => date('His', $value->outZy_time),
                    'LLR' => $value->employee_name,
                    'WERKS' => $reall_WERKS,
                    'XNBK' => '',              //线边库
                    'GOGNW' => '',             //工位
                    'GONGD' => '',             //工单
                    'FCKCDD'=>$DWERKS,         //发出库存地点
                    'AUFNR' => '',             //订单号（非PO）
                    'KDAUF' => '',             //销售订单（非mes销售订单）
                    'KDPOS' => '',             //销售订单项目
                    'EBELN' => $value->EBELN,  //采购凭证编号    
                    'EBELP' => $value->EBELP,  //采购凭证的项目  
                    'MATNR' => $value->material_code, // 物料编码
                    'LIFNR' => $value->LIFNR,         //供应商或债权人的帐号
                    // 'XQSL' => $value->XQSL,
                    'XQSL' =>ceil($real_XQSL*10)/10,
                    // 'XQSLDW' => $value->XQSLDW,
                    'XQSLDW' => $real_XQSLDW,
                    'XTLY' => 1,  //系统来源
                    'SOBKZ' => $value->is_special_stock,  //特殊库存
            ];
            $result[] = $temp_data;
        }
        $response = Soap::doRequest($result, 'INT_PP000300002', '0003');       //接口名称     //系统序号
        return $response;
    }

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
     * @message  反写委外订单状态
     * @author  liming
     * @time    年 月 日
     */    
    public  function  updateZyStatus($id)
    {
        DB::table('ruis_sap_out_picking')->where('id', $id)->update(['HAS_ZY03' => 1]);
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
            'outZy.*',
            'pick.EBELN  as EBELN',
            'rf.name as factory_name',    // 工厂
            'rf.code as factory_code',
            're.name as employee_name',   //员工
            'rsd.id  as  wms_depot_id',   //wms 发货仓地址
            'rsd.name as wms_depot_name', 
            'rsd.code   as wms_depot_code', 
          ];
          $obj_list=DB::table($this->table.' as outZy')
            ->select($data)
            ->leftJoin($this->pickTable. ' as pick', 'outZy.out_picking_id', '=', 'pick.id')
            ->leftJoin(config('alias.rf') . ' as rf', 'rf.id', '=', 'outZy.factory_id')
            ->leftJoin(config('alias.re') . ' as re', 're.id', '=', 'outZy.employee_id')
            ->leftJoin(config('alias.rsd') . ' as rsd', 'rsd.id', '=', 'outZy.wms_depot_id')
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
          $obj_list->total_count = DB::table($this->table.' as outZy')
                                ->leftJoin($this->pickTable. ' as pick', 'outZy.out_picking_id', '=', 'pick.id')
                                ->leftJoin(config('alias.rf') . ' as rf', 'rf.id', '=', 'outZy.factory_id')
                                ->leftJoin(config('alias.re') . ' as re', 're.id', '=', 'outZy.employee_id')
                                ->leftJoin(config('alias.rsd') . ' as rsd', 'rsd.id', '=', 'outZy.wms_depot_id')
                                ->where($where)->count();
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
            'outZyItem.*',
            'rm.name as material_name',   // 物料名
            'rm.item_no as material_code',   //物料编号
         ];


         $obj_list=DB::table($this->item_table.' as outZyItem')
                  ->select($data)
                  ->where('outZyItem.out_machine_zxxx_order_id','=', $order_id)
                  ->leftJoin(config('alias.rm') . ' as rm', 'rm.id', '=', 'outZyItem.material_id')
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
            'outZy.*',
            'pick.EBELN  as EBELN',
            'rf.name as factory_name',    // 工厂
            'rf.code as factory_code',
            're.name as employee_name',   //员工
            'rsd.id  as  wms_depot_id',   //wms 发货仓地址
            'rsd.name as wms_depot_name', 
            'rsd.code   as wms_depot_code', 
          ];

           $obj_list=DB::table($this->table.' as outZy')
            ->select($data)
            ->leftJoin($this->pickTable. ' as pick', 'outZy.out_picking_id', '=', 'pick.id')
            ->leftJoin(config('alias.rf') . ' as rf', 'rf.id', '=', 'outZy.factory_id')
            ->leftJoin(config('alias.re') . ' as re', 're.id', '=', 'outZy.employee_id')
            ->leftJoin(config('alias.rsd') . ' as rsd', 'rsd.id', '=', 'outZy.wms_depot_id')
            ->orderBy('id','asc')
            ->where('outZy.id',$id)
            ->get();
            foreach ($obj_list as $key => $obj)
            {
                $obj->time  = date('Y-m-d H:i:s',$obj->time);
                $obj->groups = $this->getItemsByOrder($obj->id);
            }
            return $obj_list;
    }

    /**
     * 搜索
     */
    private function _search($input)
    {
        $where = array();
        if (isset($input['EBELN']) && $input['EBELN']) {//采购凭证编号
            $where[]=['pick.EBELN','like','%'.$input['EBELN'].'%'];
        }

        if (isset($input['code']) && $input['code']) {//采购凭证编号
            $where[]=['outZy.code','like','%'.$input['code'].'%'];
        }

        if (isset($input['picking_id']) && $input['picking_id']) {//采购凭证编号
            $where[]=['pick.id','=',$input['picking_id']];
        }

        if (isset($input['type_code']) && $input['type_code']) {//采购凭证编号
            $where[]=['outZy.type_code','=',$input['type_code']];
        }
        return $where;
    }

}