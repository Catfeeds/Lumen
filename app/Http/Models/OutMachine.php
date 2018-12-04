<?php 
/**
 * Created by Sublime.
 * User: liming
 * Date: 18/8/31
 */
namespace App\Http\Models;//定义命名空间
use Illuminate\Support\Facades\DB;//引入DB操作类
use App\Exceptions\ApiException;

class OutMachine extends  Base
{
    public function __construct()
    {
        $this->table='ruis_sap_out_picking';
        $this->lineTable='ruis_sap_out_picking_line';
        $this->lineItemTable='ruis_sap_out_picking_line_item';
        $this->receiveTable='ruis_receive_order';
        $this->receiveItemTable='ruis_receive_item';
        $this->materialTable='ruis_material';
        if(empty($this->outline)) $this->outline =new OutMachineLine();
    }

   
    /**
     * 同步  委外加工领料单
     * @param $input array  input数组
     * @return int         返回插入表之后返回的主键值
     * @author liming
     */
    public function syncOutMachine($input)
    {
    	$ApiControl = new SapApiRecord();
        $ApiControl->store($input);

        /**
         * @todo 业务处理
         * 如果有异常,直接 TESAP('code',$params='',$data=null)
         */
        foreach ($input['DATA'] as $key => $value) 
        {   
            //判断是否已经存在 采购订单号
            $has  =  DB::table('ruis_sap_out_picking')->select('id')->where('EBELN',$value['EBELN'])->first();
            if ($has) 
            {
               $this->outline->saveLine($value['ITEMS'], $has->id);
            }
            else
            {
                $keyVal = [
                    'EBELN' => $value['EBELN'],   //采购订单号
                    'BUKRS' => $value['BUKRS'],
                    'BSTYP' => $value['BSTYP'],
                    'BSART' => $value['BSART'],
                    'LIFNR' => $value['LIFNR'],
                    'EKORG' => $value['EKORG'],
                    'EKGRP' => $value['EKGRP'],
                   ];

                //添加
                $insert_id=DB::table($this->table)->insertGetId($keyVal);
                if(!$insert_id) TESAP('802');
                // 添加行项目
                $this->outline->saveLine($value['ITEMS'], $insert_id);
            }

        }
          return [];
    }



    /**
     * 分页列表
     * @return array  返回数组对象集合
     */
    public function getPageList($input)
    {
       //$input['page_no']、$input['page_size   
       if (!array_key_exists('page_no',$input ) && !array_key_exists('page_size',$input )) TEA('8010','page');
        //order  (多order的情形,需要多次调用orderBy方法即可)
        if (empty($input['order']) || empty($input['sort']))
        {
            $input['order']='asc';$input['sort']='id';
        }      
        $where = $this->_search($input);
        $data =[
            'outMachine.*'
        ];
        $builder = DB::table($this->table.' as outMachine')
            ->select($data)
            ->where($where)
            ->offset(($input['page_no']-1)*$input['page_size'])
            ->limit($input['page_size'])
            ->orderBy($input['sort'],$input['order']);
            $obj_list = $builder->get();   
            // foreach ($obj_list as $obj)
            // {
            //     $group_list = $this->getLinesByOrder($obj->id);
            //     $obj->lines = $group_list;
            // }
            $obj_list->total_count = DB::table($this->table)->where($where)->count();        
            return $obj_list;
         
    }


    /**
     * 获取行项目列表
     * @return array  返回数组对象集合
     */
    public function getLinesByOrder($id)
    {
        $builder = DB::table($this->lineTable)
            ->select('*')
            ->where('picking_id', $id);
        $obj_list = $builder->get();
        foreach ($obj_list as $obj)
        {
            $group_list = $this->getItemsByLine($obj->id,$id);
            $obj->items = $group_list;
        }
        return $obj_list;
    }


    /**
     * 获取行项目明细
     * @param $id
     * @return mixed
     * @author liming
     */
    public function getItemsByLine($id,$picking_id)
    {
        $this->unit =new Units();
        //获取列表
        $obj_list = DB::table($this->lineItemTable)
            ->select('*')
            ->where('line_id', $id)
            ->orderBy('id', 'asc')
            ->get();

        //处理物料信息
        foreach ($obj_list as  $obj) 
        {
           $LGFSB='';
           $material_code=preg_replace('/^0+/','',$obj->DMATNR);
           $res = DB::table($this->materialTable.' as material')
                 ->select('material.name','material.item_no','material.id','material.unit_id','unit.commercial','category.code  as category_code')
                 ->leftJoin('ruis_uom_unit  as unit', 'unit.id', '=', 'material.unit_id')
                 ->leftJoin('ruis_material_category  as category', 'category.id', '=', 'material.material_category_id')
                 ->where('item_no', $material_code)
                 ->first();
            if (!$res) TEA('9525');
            $category_code  =$res->category_code;
            //如果当前物料的分类在限定之列，则过滤掉
            $category_preg_arr = config('app.pattern.material_category_preg');
            $sign = 0;
            foreach ($category_preg_arr as $keee=> $vaaa) 
            {
                if(preg_match($vaaa,$category_code))   
                {
                    $sign  = 1;
                }
            }
            if ($sign == 1) 
            {
                // 如果是特殊料  添加一个 作废标记
                $obj->zuofei = 1;
            }
            else
            {
               $obj->zuofei = 0; 
            }

           // 查找当前  物料采购存储地点
            if ($res) 
            {
                $where  = [
                  'material_id' =>$res->id,
                  'WERKS' =>$obj->DWERKS,
                ];
                $add_res = DB::table('ruis_material_marc')->where($where)->select('LGFSB','LGPRO')->first();
                if ($add_res)
                {
                  $LGFSB = !empty($add_res->LGFSB)?$add_res->LGFSB:$add_res->LGPRO;
                }

                $send_where=[
                    'picking_line_item_id'=>$obj->id,
                    'type_code'=>'ZY03',
                ];
                //查找 实发数量
                $actual_send_qty= DB::table('ruis_out_machine_zxxx_order_item')
                ->where($send_where)
                ->sum('actual_send_qty');

                //查找 委外额定退料zy04 +  超发退料zy06
                $zy03_where=[
                    'picking_line_item_id'=>$obj->id,
                    'type_code'=>'ZY04',
                ];

                $TuiLiao_qty= DB::table('ruis_out_machine_zxxx_order_item')
                ->where($zy03_where)
                ->orwhere('type_code','ZY06')
                ->sum('XQSL');

                //查找补料数量 ZB03   zy05
                $zb03_where=[
                    'picking_line_item_id'=>$obj->id,
                    'type_code'=>'ZB03',
                ];
                $BuLiao_qty= DB::table('ruis_out_machine_zxxx_order_item')
                ->where($zb03_where)
                ->orwhere('type_code','ZY05')
                ->sum('XQSL');
            }

           if (!$res) 
           {
              $obj->material_item_no=$obj->DMATNR;
              $obj->material_name='';  
              $obj->LGFSB=$LGFSB;  
              $obj->actual_send_qty=0;  
              $obj->TuiLiao_qty=0;  
              $obj->BuLiao_qty=0;  
           }
           else
           {
             $obj->material_item_no=$res->item_no;
             $obj->material_name=$res->name;
             $obj->LGFSB=$LGFSB; 
             $obj->actual_send_qty=$actual_send_qty;  
             $obj->TuiLiao_qty=$TuiLiao_qty;  
             $obj->BuLiao_qty=$BuLiao_qty;  
           }
        }
        return $obj_list;
    }

     /**
     * 查看某条委外领料单信息
     * @param $id
     * @return array
     * @author  liming 
     * @todo 
     */
    public function show($id)
    {
        $data =[
            'outMachine.*'
        ];
        $builder = DB::table($this->table.' as outMachine')
            ->select($data)
            ->where('outMachine.id',$id)
            ->orderBy('id','asc');
            $obj_list = $builder->get();   

            foreach ($obj_list as $obj)
            {
                $group_list = $this->getLinesByOrder($obj->id);
                $obj->lines = $group_list;
            }
            return $obj_list;
    }

    /**
     * @message 通过委外工单获取委外订单
     * @author  liming
     * @time    年 月 日
     */    
    public function showOutWork($id)
    {
        $obj_list = DB::table($this->lineTable.' as pick_line')
            ->leftJoin('ruis_sap_out_picking  as picking', 'picking.id', '=', 'pick_line.picking_id')
            ->select('pick_line.BANFN','pick_line.BNFPO')
            ->where('picking.id',$id)
            ->get();

        $return_data = [];
        foreach ($obj_list as $obj)
        {
            $where = [
                'BANFN'=>$obj->BANFN,
                'BNFPO'=>$obj->BNFPO
            ];
            $res = $this->getOrderList($where);
            if (!$res) 
            {
            continue; 
            }
            $return_data[] = $res;
        }
        return $return_data;
    }     


    /**
     * 获取列表
     * @return array  返回数组对象集合
     */
    public function getOrderList($where)
    {
        $obj_list = DB::table(config('alias.rsco').' as  outwork')
            ->leftJoin(config('alias.rpo').' as  production', 'production.id', '=', 'outwork.production_order_id')
            ->leftJoin(config('alias.rio').' as  operation', 'operation.id', '=', 'outwork.operation_id')
            ->select('outwork.*','operation.name  as operation_name','production.number  as production_number')
            ->where($where)
            ->first();
            return $obj_list;
    }

    /**
     * 搜索
     */
    private function _search($input)
    {
        $where = array();
        if (isset($input['EBELN']) && $input['EBELN']) {//采购凭证编号
            $where[]=['EBELN','like','%'.$input['EBELN'].'%'];
        }

        if (isset($input['EKGRP']) && $input['EKGRP']) {//采购组
            $where[]=['EKGRP','like','%'.$input['EKGRP'].'%'];
        }

        if (isset($input['BUKRS']) && $input['BUKRS']) {//公司代码
            $where[]=['BUKRS','like','%'.$input['BUKRS'].'%'];
        }

        if (isset($input['LIFNR']) && $input['LIFNR']) {//供应商或债权人的帐号
            $where[]=['LIFNR','like','%'.$input['LIFNR'].'%'];
        }

        $superman   = session('administrator')->superman;
        if ($superman != 1) 
        {
            $admin_name  = session('administrator')->name;
            //如果不是 超级管理员  需要加一些限制
            $where[]=['LIFNR','like','%'.$admin_name.'%'];
        }

        return $where;
    }


}