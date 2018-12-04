<?php 
/**
 * Created by Sublime.
 * User: liming
 * Date: 17/10/27
 */
namespace App\Http\Models;//定义命名空间
use Illuminate\Support\Facades\DB;//引入DB操作类
use App\Exceptions\ApiException;

class OutWorkOrder extends  Base
{
    public function __construct()
    {
        $this->table='ruis_subcontract_order';
        $this->item_table='ruis_subcontract_order_item';
        if(empty($this->item)) $this->item =new OutWorkOrderItem();
    }

    /**
     * 获取列表
     * @return array  返回数组对象集合
     */
    public function getOrderList($input)
    {
        if (!array_key_exists('page_no',$input ) && !array_key_exists('page_size',$input )) TEA('8312','page');
        //order  (多order的情形,需要多次调用orderBy方法即可)
        if (empty($input['order']) || empty($input['sort']))
        {
            $input['order']='desc';$input['sort']='id';
        }
        $where_res = $this->_search($input);
        $where = $where_res['where'];

        $builder = DB::table(config('alias.rsco').' as  outwork')
            ->leftJoin(config('alias.rpo').' as  production', 'production.id', '=', 'outwork.production_order_id')
            ->leftJoin(config('alias.rio').' as  operation', 'operation.id', '=', 'outwork.operation_id')
            ->select(
                'outwork.*',
                'operation.name  as operation_name',
                'production.number  as production_number'
                )
            ->where($where)
            ->where('outwork.is_delete',0)
            ->offset(($input['page_no'] - 1) * $input['page_size'])
            ->limit($input['page_size'])
            ->orderBy($input['sort'],$input['order']);
            if (isset($where_res['inwhere'])) 
            {
              $inwhere = $where_res['inwhere'];
              $builder->whereIn('outwork.id',$inwhere);
            }
            $obj_list = $builder->get();
            foreach ($obj_list as $obj)
            {
                $ingroup_list = $this->getInItemsByOrder($obj->id);
                $outgroup_list = $this->getOutItemsByOrder($obj->id);
                $prgroup_list = $this->getPrItemsByOrder($obj->id);
                $obj->ingroups = $ingroup_list;
                $obj->outgroups = $outgroup_list;
                $obj->prgroups = $prgroup_list;
            }

            $builder_two = DB::table(config('alias.rsco').' as  outwork')
            ->leftJoin(config('alias.rpo').' as  production', 'production.id', '=', 'outwork.production_order_id')
            ->leftJoin(config('alias.rio').' as  operation', 'operation.id', '=', 'outwork.operation_id')
            ->where($where)
            ->where('outwork.is_delete',0)
            ->orderBy($input['sort'],$input['order']);
            if (isset($where_res['inwhere'])) 
            {
              $inwhere = $where_res['inwhere'];
              $builder_two->whereIn('outwork.id',$inwhere);
            }
            $obj_list->total_count = $builder_two->count();
            return $obj_list;
    }

    /**
     * 获取
     * @return array  返回数组对象集合
     */
    public function getOneOrder($id)
    {
        $obj_list = DB::table(config('alias.rsco').' as  outwork')
                 ->leftJoin(config('alias.rpo').' as  production', 'production.id', '=', 'outwork.production_order_id')
                 ->leftJoin(config('alias.rio').' as  operation', 'operation.id', '=', 'outwork.operation_id')
                 ->select('outwork.*','operation.name  as operation_name','production.number  as production_number')
                 ->where('outwork.id', $id)
                 ->first();
        $ingroup_list = $this->getInItemsByOrder($id);
        $outgroup_list = $this->getOutItemsByOrder($id);
        $prgroup_list = $this->getPrItemsByOrder($id);
        $obj_list->ingroups = $ingroup_list;
        $obj_list->outgroups = $outgroup_list;
        $obj_list->prgroups = $prgroup_list;

        //获取所有的相关物料id
        $materials = DB::table(config('alias.rscoi').' as  item')
            ->select('material.id  as  material_id')
            ->leftJoin(config('alias.rm').' as  material', 'material.id', '=', 'item.material_id')
            ->where('item.subcontract_order_id', $id)
            ->get();
        $material_ids =  obj2array($materials);
        $obj_list->attr_res  = $this->getAttrs($material_ids);  
        return $obj_list;
    }


    /**
     * @message 根据物料
     * @author  liming
     * @time    年 月 日
     */    
     public  function   getAttrs($ids)
     {
        $res = [];
        foreach ($ids as $key => $value)
        {
              $material_id =$value['material_id'];
              //判断是否存在 key
              if (array_key_exists($material_id,$res))
              {
                continue;
              }
              else
              {
                $obj_list = DB::table(config('alias.ma').' as  attr')
                          ->leftJoin(config('alias.ad').' as  ad', 'attr.attribute_definition_id', '=', 'ad.id')
                          ->select('attr.value','ad.name')
                          ->where('attr.material_id',$material_id)
                          ->get();
                $res[$material_id]=$obj_list;   
              }
        }
        return $res; 
     }   



    /**
     * 获取进料明细数据
     * @param $id
     * @return mixed
     * @author liming
     */
    public function getInItemsByOrder($id)
    {
        //获取列表
        $obj_list = DB::table(config('alias.rscoi').' as  item')
            ->select(
                'item.*',
                'material.item_no  as  material_code',
                'material.id       as  material_id',
                'material.name     as  material_name',
                'unit.commercial   as  commercial',
                'unit.id  as  unit_id',
                'unit.name  as  unit_name'
                )
            ->leftJoin(config('alias.rm').' as  material', 'material.id', '=', 'item.material_id')
            ->leftJoin(config('alias.ruu').' as  unit', 'unit.id', '=', 'item.unit_id')
            ->where('item.subcontract_order_id', $id)
            ->where('item.raw_or_flow', 1)
            ->where('item.in_or_out', 1)
            ->orderBy('item.id', 'asc')->get();
        return $obj_list;
    }

    /**
     * 获取出料明细数据
     * @param $id
     * @return mixed
     * @author liming
     */
    public function getOutItemsByOrder($id)
    {
        //获取列表
        $obj_list = DB::table(config('alias.rscoi').' as  item')
            ->select(
                'item.*',
                'material.item_no  as  material_code',
                'material.id  as  material_id',
                'material.name  as  material_name',
                'unit.commercial  as  commercial',
                'unit.id  as  unit_id',
                'unit.name  as  unit_name'
                )
            ->leftJoin(config('alias.rm').' as  material', 'material.id', '=', 'item.material_id')
            ->leftJoin(config('alias.ruu').' as  unit', 'unit.id', '=', 'item.unit_id')
            ->where('item.subcontract_order_id', $id)
            ->where('item.raw_or_flow', 1)
            ->where('item.in_or_out', 2)
            ->orderBy('item.id', 'asc')->get();
        return $obj_list;
    }

    /**
     * 获取PR明细数据
     * @param $id
     * @return mixed
     * @author liming
     */
    public function getPrItemsByOrder($id)
    {
        //获取列表
        $obj_list = DB::table(config('alias.rscoi').' as  item')
            ->select(
                'item.*',
                'material.item_no  as  material_code',
                'material.id  as  material_id',
                'material.name  as  material_name',
                'unit.commercial  as  commercial',
                'unit.id  as  unit_id',
                'unit.name  as  unit_name'
                )
            ->leftJoin(config('alias.rm').' as  material', 'material.id', '=', 'item.material_id')
            ->leftJoin(config('alias.ruu').' as  unit', 'unit.id', '=', 'item.unit_id')
            ->where('item.raw_or_flow', 0)
            ->where('item.subcontract_order_id', $id)
            ->orderBy('item.id', 'asc')->get();
        return $obj_list;
    }


    /**
     * @message 获取所有相关进料
     * @author  liming
     * @time    年 月 日
     */    
    public  function  getFlowItems($id)
    {
        $this->unit =new Units();
        $obj_list= [];
        $material_ids = [];
        //先获取委外单行信息数据
        $obj_list = DB::table('ruis_sap_out_picking_line'.' as  pick_line')
        ->leftJoin('ruis_sap_out_picking  as picking', 'picking.id', '=', 'pick_line.picking_id')
        ->select('pick_line.*','picking.id  as   picking_id','picking.EBELN  as   EBELN','pick_line.AUFNR  as AUFNR')
        ->where('pick_line.id',$id)
        ->first();
        $qty = $obj_list->MENGE;     // 数量
        $BANFN  = $obj_list->BANFN;  // pr号
        $BNFPO  = $obj_list->BNFPO;  // pr项目号
        $AUFNR  = $obj_list->AUFNR;  // 未处理的生产订单
        $po_code=preg_replace('/^0+/','', $AUFNR);
        $sale_res =   DB::table('ruis_production_order')->select('sales_order_code')->where('number',$po_code)->first();
        if (!$sale_res) TEA('9513');
        $sale_code  = $sale_res->sales_order_code;
        //根据pr号 和pr行项目号找  委外工单
        $subres_where=[
            'BANFN'=> $BANFN,
            'BNFPO'=> $BNFPO
        ];
        $sub_result  =   DB::table('ruis_subcontract_order')->select('work_center_id','operation_order_code','routing_node_id')->where($subres_where)->first();
        if (!$sub_result) 
        {
           TEA('9507');
        }
        $obj_list->work_center_id  = $sub_result->work_center_id;
        $obj_list->operation_order_code  = $sub_result->operation_order_code;
        $obj_list->routing_node_id  = $sub_result->routing_node_id;
        $AUFNR  = $obj_list->AUFNR;  // 订单号
        $obj_list->in_list=[];
        $obj_list->out_list=[];
        $obj_list->sap_list=[];
        $obj_list->diff=[];
        $production_code=preg_replace('/^0+/','',$AUFNR);
        $production_res  = DB::table('ruis_production_order')->select('id')->where('number',$production_code)->first();
        if (!$production_res) 
        {   
            $obj_list->in_list=[];
            $obj_list->out_list=[];
            $obj_list->sap_list=[];
            $obj_list->diff=[];
            return  $obj_list; 
        }
        $production_id  = $production_res->id;

        $where=[
            'BANFN'=>$BANFN,
            'BNFPO'=>$BNFPO,
            'production_order_id'=>$production_id
        ];
        //获取委外工单id
        $sub_res  =  DB::table(config('alias.rsco'))->select('id')->where($where)->first();
        if ($sub_res) 
        {
        $sub_id  =  $sub_res->id;
        $obj_list->sub_id= $sub_id;
        $obj_list->production_id= $production_id;
        //获取所有的相关物料id
        $materials = DB::table(config('alias.rscoi').' as  item')
            ->select('material.id  as  material_id')
            ->leftJoin(config('alias.rm').' as  material', 'material.id', '=', 'item.material_id')
            ->where('item.subcontract_order_id', $sub_id)
            ->get();
        $material_ids =  obj2array($materials);   

        //获取 委外工单里面的 额定进出料
        $obj_list->in_list = DB::table(config('alias.rscoi').' as  item')
            ->select(
                'item.*',
                'material.item_no  as  material_code',
                'material.id  as  material_id',
                'material.name  as  material_name',
                'category.code  as  category_code',
                'unit.commercial  as  commercial',
                'unit.id  as  unit_id',
                'unit.name  as  unit_name'
                )
            ->leftJoin(config('alias.rm').' as  material', 'material.id', '=', 'item.material_id')
            ->leftJoin('ruis_material_category as  category', 'category.id', '=', 'material.material_category_id')
            ->leftJoin(config('alias.ruu').' as  unit', 'unit.id', '=', 'item.unit_id')
            ->where('item.raw_or_flow', 1)
            ->where('item.in_or_out', 1)
            ->where('item.subcontract_order_id',$sub_id)
            ->get();
 
          $obj_list->out_list = DB::table(config('alias.rscoi').' as  item')
            ->select(
                'item.*',
                'material.item_no  as  material_code',
                'material.id  as  material_id',
                'material.name  as  material_name',
                'unit.commercial  as  commercial',
                'workcenter.id  as  workcenter_id',
                'depot.id  as  depot_id',
                'depot.id  as  line_depot_id',
                'depot.code  as  depot_code',
                'depot.code  as  line_depot_code',
                'depot.name  as  depot_name',
                'unit.id  as  unit_id',
                'unit.name  as  unit_name'
                )
            ->leftJoin(config('alias.rm').' as  material', 'material.id', '=', 'item.material_id')
            ->leftJoin(config('alias.ruu').' as  unit', 'unit.id', '=', 'item.unit_id')
            ->leftJoin(config('alias.rsco').' as sub','sub.id','=','item.subcontract_order_id')
            ->leftJoin(config('alias.rwc').' as workcenter','workcenter.id','=','sub.work_center_id')
            ->leftJoin(config('alias.rws').' as workshop','workshop.id','=','workcenter.workshop_id')
            ->leftJoin(config('alias.rsd').' as depot','workshop.address','=','depot.code')
            ->where('item.raw_or_flow', 1)
            ->where('item.in_or_out', 2)
            ->where('item.subcontract_order_id', $sub_id)
            ->get();

        $obj_list->sap_list = DB::table(config('alias.rscoi').' as  item')
            ->select(
                'item.*',
                'material.item_no  as  material_code',
                'material.id  as  material_id',
                'material.name  as  material_name',
                'unit.commercial  as  commercial',
                'unit.id  as  unit_id',
                'unit.name  as  unit_name'
                )
            ->leftJoin(config('alias.rm').' as  material', 'material.id', '=', 'item.material_id')
            ->leftJoin(config('alias.ruu').' as  unit', 'unit.id', '=', 'item.unit_id')
            ->where('item.raw_or_flow', 0)
            ->where('item.subcontract_order_id', $sub_id)
            ->get();
            // $out_qty  = $obj_list->out_list[0]->plan_qty;
            $obj_list->diff= [];
            foreach ($obj_list->in_list as $key => $value)
            {
                // $value->rated  = round($qty/$out_qty*$value->plan_qty);
                $value->rated  = $value->plan_qty;
                //判断是否在SAP 订单组件里面
                $is_in = DB::table(config('alias.rscoi'))
                    ->select('id')
                    ->where('raw_or_flow', 0)
                    ->where('material_id', $value->material_id)
                    ->where('subcontract_order_id', $sub_id)
                    ->first();
                if (!$is_in) 
                {
                    //如果不存在  则 放到 差集 容器中
                    $obj_list->diff[] = $value;
                    $in_type_arr=['1','2'];
                    $temp_in_qty= DB::table('ruis_out_machine_shop  as shop')
                          ->leftJoin('ruis_out_machine_shop_item as  shop_item', 'shop_item.out_machine_shop_id', '=', 'shop.id')
                          ->where('shop.sub_id',$sub_id)
                          ->where('shop_item.material_id',$value->material_id)
                          ->wherein('shop.type', $in_type_arr)
                          ->sum('shop_item.actual_send_qty');
                    $temp_out_qty= DB::table('ruis_out_machine_shop  as shop')
                          ->leftJoin('ruis_out_machine_shop_item as  shop_item', 'shop_item.out_machine_shop_id', '=', 'shop.id')
                          ->where('shop.sub_id',$sub_id)
                          ->where('shop_item.material_id',$value->material_id)
                          ->where('shop.type', 3)
                          ->sum('shop_item.actual_send_qty');
                    $value->expend  = $temp_in_qty - $temp_out_qty;  
                }
                else
                {
                    // 如果存在   但  是特殊料也需要  放入diff 里面
                    $category_code  =$value->category_code;
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
                    if ($sign  ==  1) 
                    {
                        $obj_list->diff[] = $value;
                        $in_type_arr=['1','2'];
                        $temp_in_qty= DB::table('ruis_out_machine_shop  as shop')
                              ->leftJoin('ruis_out_machine_shop_item as  shop_item', 'shop_item.out_machine_shop_id', '=', 'shop.id')
                              ->where('shop.sub_id',$sub_id)
                              ->where('shop_item.material_id',$value->material_id)
                              ->wherein('shop.type', $in_type_arr)
                              ->sum('shop_item.actual_send_qty');
                        $temp_out_qty= DB::table('ruis_out_machine_shop  as shop')
                              ->leftJoin('ruis_out_machine_shop_item as  shop_item', 'shop_item.out_machine_shop_id', '=', 'shop.id')
                              ->where('shop.sub_id',$sub_id)
                              ->where('shop_item.material_id',$value->material_id)
                              ->where('shop.type', 3)
                              ->sum('shop_item.actual_send_qty');
                        $value->expend  = $temp_in_qty - $temp_out_qty;  
                    }
                    else
                    {
                            // 通过 picking_line  id  和 物料编码 查询  picking_line_item id
                            $sap_material_code  = str_pad($value->material_code, 18, '0', STR_PAD_LEFT);
                            $pick_item_where=[
                                'line_id'=>$id,
                                'DMATNR'=>$sap_material_code
                            ];
                            $picking_item_res = DB::table('ruis_sap_out_picking_line_item')->where($pick_item_where)->select('id')->first();
                            $picking_line_item_id  = $picking_item_res->id;

                            //  查询所有的进出料在委外采购订单
                            //  查询 所有的进出料  在委外车间领料
                            $in_arr=['ZY03','ZB03','ZY05'];
                            $out_arr=['ZY04','ZY06'];
         
                            $unit_id  = $value->unit_id;  
                            $bom_unit_id    = $value->bom_unit_id;
                            $temp_in_qty= DB::table('ruis_out_machine_zxxx_order_item')
                                    ->where('picking_line_item_id',$picking_line_item_id)
                                    ->where('MATNR',$sap_material_code)
                                    ->wherein('type_code', $in_arr)
                                    ->sum('actual_send_qty');
                            $temp_out_qty= DB::table('ruis_out_machine_zxxx_order_item')
                                    ->where('picking_line_item_id',$picking_line_item_id)
                                    ->where('MATNR',$sap_material_code)
                                    ->wherein('type_code', $out_arr)
                                    ->sum('XQSL');

                            $temp_qty = $temp_in_qty - $temp_out_qty;
                            //转换 单位
                            $unit_res=$this->unit->getExchangeUnitValueById($unit_id,$bom_unit_id,$temp_qty,$value->material_id); 
                            $value->expend  = $unit_res;
                    }
                }
            }

            //如果存在 差集  则计算差集的 实际额定数量
            if (count($obj_list->diff)>0) 
            {
                foreach ($obj_list->diff as $diif_key => $diif_value)
                 {
                   // $diif_value->rated  = round($qty/$out_qty*$diif_value->plan_qty);
                   $diif_value->rated  =$diif_value->plan_qty;
                   $material_id =$diif_value->material_id;
                   $search_where_one = [
                        'material_id'=>$material_id,
                        'sale_order_code'=>$sale_code,
                   ];
                   $storage_one_res=DB::table('ruis_storage_inve')
                                  ->where($search_where_one)
                                  ->where('storage_validate_quantity','>',0)
                                  ->select('*','id  as  inve_id')
                                  ->get();
                   $storage_one= obj2array($storage_one_res);
                   $search_where_two = [
                        'material_id'=>$material_id,
                        'sale_order_code'=>'',
                   ];
                   $storage_two_res=DB::table('ruis_storage_inve')
                                  ->where($search_where_two)
                                  ->where('storage_validate_quantity','>',0)
                                  ->select('*','id  as  inve_id')
                                  ->get();
                   $storage_two= obj2array($storage_two_res);
                   $storage = array_merge($storage_one,$storage_two);

                    $diif_value->storage= $storage;
                 }
            }
            foreach ($obj_list->out_list as $k => $val)
            {
                // $val->rated  = round($qty/$out_qty*$val->plan_qty);
                $val->rated  = $val->plan_qty;
            }
            foreach ($obj_list->sap_list as $kk => $vval)
            {
                // $vval->rated  = round($qty/$out_qty*$vval->plan_qty);
                $vval->rated  = $vval->plan_qty;
            }
        }
        else
        {
            return   $obj_list;
        }
        return  $obj_list;
    }

    /**
     * 搜索
     */
    private function _search($input)
    {
        $where_all =[];
        $where_all['where'] =[];
        $where_all['inwhere'] =[];
        if (isset($input['production_code']) && $input['production_code']) {//生产订单
            $where_all['where'][]=['production.number','like','%'.$input['production_code'].'%'];
        }
      
        if (isset($input['purchase_code']) && $input['purchase_code']) 
        {  //采购订单号
            //通过采购订单号 获取所有的line
            $lines  = DB::table('ruis_sap_out_picking  as picking')
                   ->where('picking.EBELN',$input['purchase_code'])
                   ->leftJoin('ruis_sap_out_picking_line  as  line', 'line.picking_id', '=', 'picking.id')
                   ->select('line.BANFN','line.BNFPO')
                   ->get();
            //通过line 查找BANFN和BNFPO
            foreach ($lines as $key => $value) 
            {
                $sub_where =[
                    'BANFN'=>$value->BANFN,
                    'BNFPO'=>$value->BNFPO
                ];
                $sub_id=DB::table('ruis_subcontract_order')->select('id')->where($sub_where)->first();
                if ($sub_id)
                {
                  $where_all['inwhere'][]=  $sub_id->id;
                }
            }
        }
        else
        {
            unset($where_all['inwhere']);
        }

        return $where_all;
    }
}