<?php

namespace App\Http\Models;//定义命名空间
use App\Http\Models\Material\Material;
use Illuminate\Support\Facades\DB;
/**
 * 工艺单处理类
 * @author  kevin
 * @time    2018年08月08日18:18:18
 */
class RoutingOrder extends Base
{

    /**
     * 前端传递的api主键名称
     * @var string
     */
    public $apiPrimaryKey = 'operation_order_id';

    public function __construct()
    {
        parent::__construct();
        $this->table = config('alias.roo');
    }


//region  拆生产订单

    /**
     * 拆分生产订单
     * @param $production_order_id  int           生产订单表主键
     * @param $bom_tree             object|array  制造BOM树
     * @param $qty                  int           生产单的数量
     * @return     返回bool值           true表示拆单成功,false表示失败
     * @author  kevin
     */
    public function splitProductionOrderByRouting($production_order_id,$bom_id,$qty,$routing_id,$confirm_number)
    {
        //遍历bom树获取结构图
        //$routings=[];
        //$this->RQRouting($bom_tree,$routings,$qty,0,1,$routing_id);

        ####获取顶级bom工艺文件上，最后一道工序的出料比，作为全局的出料标准。
        ####后期所有进出料需要除以顶级bom的出料比，得出最终的用料比，这样才能正确计算'进出'料的用料（qty）。
            //获取工艺文件最后一个出料
        //$bom_id = $bom_tree['bom_id'];
        $last_outmaterial_usenum = $this->getLastOutMaterialByRoute($bom_id,$routing_id);

        $this->splitRoutingOrder($production_order_id,$bom_id,$confirm_number,$last_outmaterial_usenum->use_num,$qty,$routing_id);


        //工艺路线上key值会重复，wt number重新生成
//        foreach($routings as $key=> $routing) {
//            $this->splitRoutingOrder($production_order_id,$routing,$confirm_number,$last_outmaterial_usenum->use_num,$qty);
//        }

        return true;

    }

    /**
     * 递归遍历BOM树查找工艺路线
     * @param $bom_tree          object|array  BOM树
     * @param $routings        array  工艺路线保存数组
     * @param $qty            int    生产单数量
     * @param $j                 int    递归开始序号,建议使用订单号代替
     * @param $level                  int         层级数
     * @author  kevin
     */
    //parent_code是上一个wt块的编码（块是树形结构）
    public function RQRouting($bom_tree,&$routings,$qty,$parent_code=0,$level=1,$routingId=0)
    {
        if($level == 1){
            $bom_id = $bom_tree['bom_id'];
            $has_route = 1;
        }else{
            $bom_id = $bom_tree['self_bom_id'];
            $has_route = isset($bom_tree['has_route']) ? $bom_tree['has_route'] : 0;
        }

        if($has_route){
            $has_default_route = $this->isExisted([['bom_id','=',$bom_id],['is_default','=',1]],config('alias.rbr'));
            if($has_default_route){
                $routing_id = DB::table(config('alias.rbr'))
                    ->select('routing_id')->where([['bom_id','=',$bom_id],['is_default','=',1]])->first();
            }else{
                $routing_id = DB::table(config('alias.rbr'))
                    ->select('routing_id')->where([['bom_id','=',$bom_id]])->first();
            }

            //为了方便订单是半成品，并且选择工艺路线进行拆单
            if($level == 1){
                $routing_id->routing_id = $routingId;
            }

            //需要母件的个数
            $usage_number=$bom_tree['usage_number'];
            $mother_qty=round(eval("return $usage_number;")*$qty,3);
            $wt_code=$this->get_routing_sn();
            $routings[$wt_code]=[
                'code' => $wt_code,
                'parent_code' => $parent_code,
                'bom_id' => $bom_id,
                'routing_id' => $routing_id->routing_id,
                'level'=> $level,
                'qty' => $mother_qty
            ];
        }

        //sap过来po的bom都是单层结构，所以先不考虑多层的遍历，等后期需求变更需要时再用
//        if(isset($bom_tree['children'])){
//            $children=$bom_tree['children'];
//
//            //遍历一下半成品,注意不是所有的半成品都要拆单的
//            foreach ($children  as $key => $value){
//                if($value['is_assembly'] == 1) $this->RQRouting($value,$routings,$mother_qty,$wt_code,$level+1);
//            }
//        }

    }

    public function getLastOutMaterialByRoute($bom_id,$routing_id)
    {
        $where[]=['a1.bom_id','=',$bom_id];
        $where[]=['a1.routing_id','=',$routing_id];
        $where[]=['a2.type','=',2];
        $obj = DB::table(config('alias.rbrb').' as a1')
            ->select(
                'a1.id',
                'a2.use_num',
                'a2.type',
                'a2.material_code'
            )
            ->leftJoin(config('alias.rbri').' as a2','a2.bom_routing_base_id','=','a1.id')
            ->where($where)
            ->orderBy('a1.routing_node_id', 'desc')
            ->orderBy('a1.index', 'desc')
            ->first();

        if (!$obj) TEA('1211');
        return $obj;
    }



    /**
     * 根据工艺路线拆分生产订单
     * @param $production_order_id  int           生产订单表主键
     * @param $qty                  int           生产单的数量
     * @return     返回bool值           true表示拆单成功,false表示失败
     * @author  kevin
     */
    public function splitRoutingOrder($production_order_id,$bom_id,$confirm_number,$top_usenum,$top_qty,$routing_id)
    {
        //当前bom id
//        $bom_id = $routing['bom_id'];
//        $routing_id = $routing['routing_id'];
//        $level = $routing['level'];
//        $qty = $routing['qty'];
//        $code = $routing['code'];
//        $parent_code = $routing['parent_code'];

        //取出生产订单表中的sap物料
        $PO_info=DB::table(config('alias.rpo'))->select('component','confirm_number','factory_id')->where('id',$production_order_id)->first();
        $component=json_decode($PO_info->component,true);
        $factory_id = $PO_info->factory_id;
        $m=new Material();

        //当前工艺文件所有工时信息
        $workhour_model =  new WorkHour();
        $array_workhour_package = $workhour_model->getAllHoursByBom($bom_id,$routing_id);

        //遍历工艺路线，获取所有的出料
        $routing_out_material=$this->getRoutingOutMaterial($bom_id,$routing_id);
        //对出料进行归类，相同步骤中产生的出料归为一类
        $classify_out_material = $this->classifyOutMaterial($routing_out_material);

        //遍历工艺路线上所有出料，进行拆单,相同步骤的出料生成一个工单
        foreach($classify_out_material as $each_out_material) {
            $final_out_material_value = [];
            //SAP对接，需要将进出料插入明细，表中所需数据
            $sap_insert_material = [];
            foreach($each_out_material as $key => $out_material) {
                if ($out_material->material_id && $out_material->operation_id) {

                    #######入库准备
                    //计算出料qty,用出料比除以顶级bom出料比，再乘以总的qty得出最终出料qty
                    $out_material_qty = ceil_dot(eval("return $out_material->use_num / $top_usenum ;") * $top_qty, 1);

                    //$usage_number = $out_material->use_num;
                    //$mother_qty=round(eval("return $usage_number;")*$qty,3);
                    //获取工序名称
                    $operation_name = $this->getOperationName($out_material->operation_id);
                    //获取工序顺序,并计算拼接成sap的工序顺序号
                    $operation_code = DB::table(config('alias.rpro'))
                        ->select('order')->where([['id', '=', $out_material->routing_node_id]])->first();
                    $tmp_order = (string) (10*$operation_code->order);
                    $sap_routing_operation_order = str_pad($tmp_order,4,"0",STR_PAD_LEFT);

                    //加入生产存储地点和采购仓储地点
                    $sap_material_out = $this->getSapMaterial($out_material->material_id,$factory_id);

                    //出料重新组装
                    $out_material_value = [
                        'material_category_id' => $out_material->material_category_id,
                        'material_category_name' => $out_material->material_category_name,
                        'material_id' => $out_material->material_id,
                        'item_no' => $out_material->material_code,
                        'material_attributes' => $m->getAttributeByMaterial($out_material->material_id),
                        'operation_attributes' => $m->getOperationAttributeValue($out_material->material_id),
                        'drawings' => $m->getMaterialDrawings($out_material->material_id),
                        'name' => $out_material->material_name,
                        'unit_id' => $out_material->unit_id,
                        'unit' => $out_material->unit_name,
                        'material_commercial' => $out_material->material_commercial,
                        'bom_unit_id' => $out_material->bom_unit_id,
                        'bom_commercial' => $out_material->bom_commercial,
                        //'usage_number' => round($out_material->use_num / $top_usenum, 3),
                        'usage_number' => 1,
                        'loss_rate' => isset($out_material->loss_rate) ? $out_material->loss_rate : 0,
                        'qty' => $out_material_qty,
                        'LGPRO' => isset($sap_material_out->LGPRO) ? $sap_material_out->LGPRO : '',
                        'LGFSB' => isset($sap_material_out->LGFSB) ? $sap_material_out->LGFSB : '',
                    ];
                    array_push($final_out_material_value,$out_material_value);

                    $sap_insert_material[] =
                        [
                        'subcontract_order_id' => 0,
                        'raw_or_flow' => 1,
                        'in_or_out' => 2,
                        'material_id' => $out_material->material_id,
                        'unit_id' => $out_material->unit_id,
                        'unit_commercial' => $out_material->material_commercial,
                            'bom_unit_id' => $out_material->bom_unit_id,
                            'bom_commercial' => $out_material->bom_commercial,
                            'ERFME' => '',
                        'plan_qty' => $out_material_qty,
                            'LGPRO' => isset($sap_material_out->LGPRO) ? $sap_material_out->LGPRO : '',
                            'LGFSB' => isset($sap_material_out->LGFSB) ? $sap_material_out->LGFSB : '',
                    ];

                }
            }

            //获取进料
            $in_material = $this->getBaseInMaterial($out_material->bom_id, $out_material->routing_node_id, $out_material->group_index);
            //重新组装进料
            $in_material_value = [];
            $in_material_ids = [];
            $routing_group_in_material = [];

            //当前工序用到了哪些component中的料,物料编码作为索引
            $material_in_component = [];

            foreach ($in_material as $each) {

                //先比对从sap过来的po的物料信息,物料不在$component中，不产生WT
                //从componet上那进料的真实用料
                if($each->is_lzp != 1) {
                    $can_create_order = 0;
                    foreach ($component as $v) {
                        if ($v['MATNR'] == $each->material_code && $v['VORNR'] == $sap_routing_operation_order && $v['SCHGT'] != 'X') {
                            $routing_group_in_material[$each->material_code] = $v['ERFMG'];
                            $final_in_material = $v['ERFMG'];
                            $material_replace_no = $v['MATNR1'];
                            $special_stock = $v['SOBKZ'];
                            $can_create_order = 1;

                            $material_in_component[$each->material_code] = $each->material_code;
                            break;
                        }
                    }
                    if ($can_create_order == 0) {
                        continue;
                    }
                }else{
                    $routing_group_in_material[$each->material_code] = round(eval("return $each->use_num  / $top_usenum ;") * $top_qty, 6);
                    $final_in_material = round(eval("return $each->use_num  / $top_usenum ;") * $top_qty, 3);
                }

                $sap_material_in = $this->getSapMaterial($each->material_id,$factory_id);

                $in_material_value[] = [
                    'material_category_id' => $each->material_category_id,
                    'material_category_name' => $each->material_category_name,
                    'material_id' => $each->material_id,
                    'item_no' => $each->material_code,
                    //SAP中进料可能有替换物料
                    'material_replace_no' => isset($material_replace_no) ? $material_replace_no : '',
                    //特殊库存
                    'special_stock' => isset($special_stock) ? $special_stock : '',
                    'material_attributes' => $m->getAttributeByMaterial($each->material_id),
                    'operation_attributes' => $m->getOperationAttributeValue($each->material_id),
                    'drawings' => $m->getMaterialDrawings($each->material_id),
                    'name' => $each->material_name,
                    'unit_id' => $each->unit_id,
                    'unit' => $each->unit_name,
                    'material_commercial' => $each->material_commercial,
                    'bom_unit_id' => $each->bom_unit_id,
                    'bom_commercial' => $each->bom_commercial,
                    //'usage_number' => round($each->use_num / $top_usenum, 3),
                    ###暂时用进出料自身的比，后面拆单重新计算更方便
                    'usage_number' => round($final_in_material / $out_material_qty, 6),
                    'loss_rate' => isset($each->loss_rate) ? $each->loss_rate : 0,
                    //'qty' => round(eval("return $each->use_num  / $top_usenum ;") * $top_qty, 3),
                    'qty' => $final_in_material,
                    'LGPRO' => isset($sap_material_in->LGPRO) ? $sap_material_in->LGPRO : '',
                    'LGFSB' => isset($sap_material_in->LGFSB) ? $sap_material_in->LGFSB : '',
                ];
                $sap_insert_material[] =
                    [
                        'subcontract_order_id' => 0,
                        'raw_or_flow' => 1,
                        'in_or_out' => 1,
                        'material_id' => $each->material_id,
                        'unit_id' => $each->unit_id,
                        'unit_commercial' => $each->material_commercial,
                        'bom_unit_id' => $each->bom_unit_id,
                        'bom_commercial' => $each->bom_commercial,
                        'ERFME' => '',
                        //'plan_qty' => round(eval("return $each->use_num  / $top_usenum ;") * $top_qty, 3),
                        'plan_qty' => $final_in_material,
                        'LGPRO' => isset($sap_material_in->LGPRO) ? $sap_material_in->LGPRO : '',
                        'LGFSB' => isset($sap_material_in->LGFSB) ? $sap_material_in->LGFSB : '',
                    ];

                $in_material_ids[] = $each->material_id;
            }
            //对比现有的进料，获得component中当前工序多出的料
            $extra_component = [];
            foreach ($component as $c) {
                if($c['VORNR'] == $sap_routing_operation_order){
                    if(!array_key_exists($c['MATNR'],$material_in_component)){
                        $extra_component[] = $c;
                    }
                }
            }
            if(count($extra_component) > 0){
                foreach ($extra_component as $e) {
                    $extra_in_material = $this->getExtraInMaterial($e['MATNR']);
                    $extra_unit = DB::table(config('alias.ruu'))->select('commercial as bom_commercial','id as bom_unit_id')->where('commercial', $e['ERFME'])->first();
                    $sap_material_in_extra = $this->getSapMaterial($extra_in_material->material_id,$factory_id);

                    $in_material_value[] = [
                        'material_category_id' => $extra_in_material->material_category_id,
                        'material_category_name' => $extra_in_material->material_category_name,
                        'material_id' => $extra_in_material->material_id,
                        'item_no' => $extra_in_material->material_code,
                        //SAP中进料可能有替换物料
                        'material_replace_no' => isset($e['MATNR1']) ? $e['MATNR1'] : '',
                        //特殊库存
                        'special_stock' => isset($e['SOBKZ']) ? $e['SOBKZ'] : '',
                        'material_attributes' => $m->getAttributeByMaterial($extra_in_material->material_id),
                        'operation_attributes' => $m->getOperationAttributeValue($extra_in_material->material_id),
                        'drawings' => $m->getMaterialDrawings($extra_in_material->material_id),
                        'name' => $extra_in_material->material_name,
                        'unit_id' => $extra_in_material->unit_id,
                        'unit' => $extra_in_material->unit_name,
                        'material_commercial' => $extra_in_material->material_commercial,
                        'bom_unit_id' => $extra_unit->bom_unit_id,
                        'bom_commercial' => $extra_unit->bom_commercial,
                        'usage_number' => round($e['ERFMG'] / $out_material_qty, 6),
                        'loss_rate' => isset($each->loss_rate) ? $each->loss_rate : 0,
                        'qty' => $e['ERFMG'],
                        'LGPRO' => isset($sap_material_in_extra->LGPRO) ? $sap_material_in_extra->LGPRO : '',
                        'LGFSB' => isset($sap_material_in_extra->LGFSB) ? $sap_material_in_extra->LGFSB : '',
                    ];
                }
            }

            //工艺路线上工序顺序号,order
            $routing_operation_order = $this->getOperationOrder($out_material->routing_node_id);

            //当前工序节点下,该步骤的顺序号，index
            $routingnode_step_order = $out_material->index;

            //当前步骤组所有步骤，能力的id和名称组合
            $group_steps = $this->getGroupSteps($out_material->bom_id, $out_material->routing_node_id, $out_material->group_index);
            $group_step_withnames = [];
            foreach ($group_steps as $key3 => $value3) {
                if (!empty($value3->operation_ability_ids)) {
                    $operation_ability_ids = explode(',', $value3->operation_ability_ids);
                    $ability_names = $this->getAbilityName($operation_ability_ids);
                } else {
                    $ability_names = [];
                }

                $group_step_withnames[$key3] = [
                    'base_step_id' => $value3->base_step_id,
                    'base_step_index' => $value3->index,
                    'step_name' => $value3->step_name,
                    'operation_id' => $value3->operation_id,
                    'operation_name' => $value3->operation_name,
                    'abilitys' => $ability_names
                ];
            }

            //获取当前数量WT总工时，确保该wt所有步骤加起来是有工时的，否则订单就有问题，得报错
            $array_total_hours = array();
            if (!empty($array_workhour_package)) {
                $workhour_model = new WorkHour();
                $array_total_hours = $workhour_model->countTotalHours($out_material->bom_id, $group_step_withnames, $out_material_qty, $array_workhour_package);
            }
            //pd($array_total_hours);
            $count_hour = 0;
            foreach ($array_total_hours as $value4) {
                if (isset($value4['base_hour'])) {
                    $count_hour = $count_hour + $value4['base_hour']['total_hour'];
                }
            }
            if ($count_hour <= 0) TEA('1204', 'base_hour');

            //当前步骤组的所有工艺文件信息，后期到工位机时使用
            $bom_routing_model = new BomRouting();
            $group_routing_package = $bom_routing_model->getSchedulingNeedRoutingInfo($out_material->bom_id, $out_material->routing_node_id, $out_material->group_index);
            $out_material_info = [
                'top_usenum' => $top_usenum,
                'material_code' => $out_material->material_code,
                'qty' => $out_material_qty
            ];
            $final_group_routing_package = $this->addQtyInRoutingPackage((array) $group_routing_package,$top_qty,$out_material_info,$routing_group_in_material);

            #####应对sap需求，PO过来的工序生成WT，进料可能有替换物料
            //从json中拿到具体确认号
            $array_confirm_number = json_decode($confirm_number, true);

            $can_create_order2 = 0;
            foreach ($array_confirm_number as $k){
                if($k['VORNR'] == $sap_routing_operation_order) {
                    $RUECK = $k['RUECK'];
                    $ARBPL = $k['ARBPL'];
                    $STEUS = $k['STEUS'];
                    $BANFN = $k['BANFN'];
                    $BNFPO = $k['BNFPO'];
                    $can_create_order2 = 1;
                    break;
                }
            }
            //先比对工序,工艺文件的工序不在PO字段中，不产生WT
            if($can_create_order2 == 0){
                continue;
            }

            $final_confirm_number = isset($RUECK) ? $RUECK : '';
            $work_center_code = isset($ARBPL) ? $ARBPL : '';
            $work_center_id = DB::table(config('alias.rwc'))
                ->select('id')->where([['code', '=', $work_center_code]])->first();
            $work_center_id2 = isset($work_center_id->id) ? $work_center_id->id : '';

            //判断当前工序是否是最后一道工序,1为是，0为否
            $is_end_operation = $this->check_islast_operation($out_material->operation_id,$routing_id);

            //因为委外工单需要WT编码，提前生成WT编码
            $WT_code = get_order_sn('WT');

            //控制码是PP06的，不产生WT
            if (isset($STEUS) && $STEUS == 'PP06') {
                continue;
            }

            //控制码是PP02的，是委外工单，做额外处理
            $is_outsource = 0;
            if (isset($STEUS) && $STEUS == 'PP02') {
                $sub_number = get_order_sn('WO');
                $data = [];
                $data['number'] = $sub_number;
                $data['production_order_id'] = $production_order_id;
                $data['operation_id'] = $out_material->operation_id;
                $data['operation_order_code'] = $WT_code;
                $data['confirm_number_RUECK'] = $final_confirm_number;
                $data['work_center_id'] = $work_center_id2;
                $data['BANFN'] = isset($BANFN) ? $BANFN : '';
                $data['BNFPO'] = isset($BNFPO) ? $BNFPO : '';
                $data['is_end_operation'] = $is_end_operation;
                $data['routing_node_id'] = $out_material->routing_node_id;
                $data['routing_operation_index'] = $routing_operation_order->order;
                $data['current_workhour_package'] = json_encode($array_total_hours);
                $data['group_routing_package'] = json_encode($final_group_routing_package);
                $data['group_step_withnames'] = json_encode($group_step_withnames);
                $data['ctime'] = time();

                $sub_insert_id = DB::table(config('alias.rsco'))->insertGetId($data);
                if (!$sub_insert_id) return false;
                //将委外单主表的id插入，进行明细表的插入

                //根据sap过来的component，再添加sap的原料
                foreach ($component as $item) {
                    $material_code=preg_replace('/^0+/','',$item['MATNR']);
                    $realmaterial_id  = DB::table(config('alias.rm'))->select('id')->where('item_no',$material_code)->first();

                    $sap_material_origin = $this->getSapMaterial($each->material_id,$factory_id);

                    $sap_insert_material[] =
                        [
                            'subcontract_order_id' => 0,
                            'raw_or_flow' => 0,
                            'in_or_out' => 0,
                            'material_id' => $realmaterial_id->id,
                            'unit_id' => '',
                            'unit_commercial' => '',
                            'bom_unit_id' => '',
                            'bom_commercial' => '',
                            'ERFME' => $item['ERFME'],
                            'plan_qty' => $item['ERFMG'],
                            'LGPRO' => isset($sap_material_origin->LGPRO) ? $sap_material_origin->LGPRO : '',
                            'LGFSB' => isset($sap_material_origin->LGFSB) ? $sap_material_origin->LGFSB : '',
                        ];
                }

                foreach ($sap_insert_material as &$v){
                    $v['subcontract_order_id'] = $sub_insert_id;
                }
                $res2 = DB::table(config('alias.rscoi'))->insert($sap_insert_material);
                if (!$res2) return false;

                $is_outsource = 1;
            }

            ######SAP数据处理--end####

            //入库
            $data = [
                'number' => $WT_code,
                'production_order_id' => $production_order_id,
                'confirm_number_RUECK' => $final_confirm_number,
                'work_center_id' => $work_center_id2,
                'factory_id' => $factory_id,
                'is_end_operation' => $is_end_operation,
                'qty' => $out_material_qty,
                'name' => $out_material->material_name,
                'operation_id' => $out_material->operation_id,
                'operation_name' => $operation_name->name,
                'operation_ability' => $out_material->operation_ability_ids,
                'level' => 1,
                'code' => '',
                'parent_code' => '',
                'routing_node_id' => $out_material->routing_node_id,
                'routing_operation_order' => $routing_operation_order->order,
                'routingnode_step_order' => $routingnode_step_order,
                'out_material' => json_encode($final_out_material_value),
                'out_material_id' => $out_material->material_id,
                'out_material_name' => $out_material->material_name,
                'in_material' => json_encode($in_material_value),
                'in_material_ids' => is_array($in_material_ids) ? implode(',', $in_material_ids) : '',
                'belong_bom_id' => $out_material->bom_id,
                'group_step_withnames' => json_encode($group_step_withnames),
                'group_routing_package' => json_encode($final_group_routing_package),
                'workhour_package' => json_encode($array_workhour_package),
                'admin_id' => !empty(session('administrator')->admin_id) ? session('administrator')->admin_id : 0,
                'created_at' => time(),
                'is_outsource' => $is_outsource,
            ];
            $insert_id = DB::table($this->table)->insertGetId($data);
            if (!$insert_id) return false;

            //根据工序的字段决定是否生成送检单
            $obj_is_ipqc = DB::table(config('alias.rio'))->select('is_ipqc')->where('id','=',$out_material->operation_id)->first();
            if($obj_is_ipqc->is_ipqc == 1) {
                //生成送检单
                $out_material2 = $final_out_material_value;
                $material_id = $out_material2[0]['material_id'];
                $item_no = $out_material2[0]['item_no'];
                $unit = $out_material2[0]['unit_id'];
                $order_number = $out_material2[0]['qty'];
                $attr = '';
                if (count($out_material2[0]['material_attributes']) > 0) {
                    foreach ($out_material2[0]['material_attributes'] as $key => $value) {
                        $attr .= $value->name;
                        $attr .= $value->value;
                    }
                }

                $check_resource = 2;
                $check_time = time();
                $ctime = time();

                if (isset($STEUS) && $STEUS == 'PP02') {
                    $sub_number = $sub_number;
                    $sub_insert_id = $sub_insert_id;
                } else {
                    $sub_number = '';
                    $sub_insert_id = 0;
                }

                // 处理检验单号
                // 当前时间
                $nowtime = date("YmdHis", time());
                $round_no = rand(0, 9);

                // // 根据 单子数量自动 填充检验数量
                $qty = $out_material_qty;
                $qc_checkqty_rules = config('app.qc_checkqty_rule');
                //判断数量在哪个区间
                $amount_of_inspection = 0;
                foreach ($qc_checkqty_rules as $k => $qc_checkqty_rule) {
                    if ($qty >= $qc_checkqty_rule['min'] && $qty <= $qc_checkqty_rule['max']) {
                        if ($k == 'own') {
                            $amount_of_inspection = $qty;
                        } else {
                            $amount_of_inspection = $k;
                        }
                        break;
                    }
                }
                $keyVal['amount_of_inspection'] = $amount_of_inspection;
                $keyVal['material_id'] = $material_id;
                $keyVal['MATNR'] = $item_no;
                $keyVal['check_time'] = $check_time;
                $keyVal['order_number'] = $order_number;
                $keyVal['ctime'] = $ctime;
                $keyVal['attr'] = $attr;
                $keyVal['operation_id'] = $out_material->operation_id;
                $keyVal['unit'] = $unit;
                $keyVal['code'] = 'ipqc' . $nowtime . $round_no;  // 检验单号 ipqc开头 + 时间+两位随机数字
                $keyVal['check_resource'] = $check_resource;
                $keyVal['work_order_id'] = $insert_id;
                $keyVal['production_order_id'] = $production_order_id;
                $keyVal['wo_number'] = $WT_code;
                $keyVal['result'] = 0;
                $keyVal['sub_number'] = $sub_number;
                $keyVal['sub_order_id'] = $sub_insert_id;
                $keyVal['checker'] = !empty(session('administrator')->admin_id) ? session('administrator')->admin_id : 0;
                $insert_id2 = DB::table('ruis_qc_check')->insertGetId($keyVal);
                if (!$insert_id2) TEA('802');
            }
        }
    }

    public function classifyOutMaterial($out_material_array)
    {
        $final_arr = [];
        foreach ($out_material_array as $v) {
            if($v->bom_routing_base_id){
                $final_arr[$v->bom_routing_base_id][] = $v;
            }
        }
        if(count($final_arr) < 0){ TEA('1207');}

        return $final_arr;

    }

    public function check_islast_operation($operation_id,$routing_id)
    {
        $obj_operation_id = DB::table(config('alias.rpro'))
            ->select('oid')->where([['rid', '=', $routing_id]])
            ->orderBy('order', 'desc')
            ->first();
        if($obj_operation_id->oid == $operation_id){
            return 1;
        }else{
            return 0;
        }
    }

    public function addQtyInRoutingPackage($group_routing_package,$qty,$out_material_info,$group_in_material)
    {
        foreach ($group_routing_package as &$item) {
            if(isset($item['material'])){
                foreach ($item['material'] as $key => &$m) {
                    if(isset($m['qty']) && isset($m['divided_by_outusenum'])){
                        $m['qty'] = round($m['divided_by_outusenum']  * $qty, 3);
                    }else{
                        if($m['material_code'] == $out_material_info['material_code']){
                            $m['qty'] = ceil_dot(eval("return $m[use_num]  / $out_material_info[top_usenum] ;") * $qty, 1);
                            $m['divided_by_outusenum'] = 1;
                        }else{
                            if(array_key_exists($m['material_code'], $group_in_material)){
                                $m['qty'] = $group_in_material[$m['material_code']];
                                $m['divided_by_outusenum'] = round($m['qty']  / $out_material_info['qty'], 6);
                            }else{
                                unset($item['material'][$key]);
                            }
                        }
                    }
                }
            }
        }
        return obj2array($group_routing_package);
    }

    //只对半成品（没有子bom）有用
    /**
     * 根据工艺路线拆分生产订单
     * @param $production_order_id  int           生产订单表主键
     * @param $qty                  int           生产单的数量
     * @return     返回bool值           true表示拆单成功,false表示失败
     * @author  kevin
     */
    public function splitProductionOrder2($production_order_id,$routing_package,$workhour_package)
    {
        //根据生产单id获取顶级bom id
        $bom_id = DB::table(config('alias.rpo'))->select('bom_id')->where('id','=',$production_order_id)->first();
        if(!$bom_id)  TEA('1203','production_order_id');

        //当前工艺文件所有工时信息
        $array_workhour_package = obj2array(json_decode($workhour_package));

        //根据工艺文件包进行拆单
        $array_routing_package = obj2array(json_decode($routing_package));
        if(!empty($array_routing_package)){
            $this->splitOrderByRoutingpackage($production_order_id,$array_routing_package,$array_workhour_package);
            return true;
        }else{
            TEA('1205');
        }
    }

    //只对半成品（没有子bom）有用
    public function splitOrderByRoutingpackage($production_order_id,$array_routing_package,$array_workhour_package)
    {
        foreach($array_routing_package as $v){
            //入库
            $data = [
                'number' => get_order_sn('WT'),
                'production_order_id' => $production_order_id,
                'qty' => $v['qty'],
                'name' => $v['name'],
                'operation_id' => $v['operation_id'],
                'operation_name' => $v['operation_name'],
                'operation_ability' => $v['operation_ability'],
                'level' => 1,
                'routing_operation_order' => $v['routing_operation_order'],
                'routingnode_step_order' => $v['routingnode_step_order'],
                'out_material' => $v['out_material'],
                'out_material_id' => $v['out_material_id'],
                'out_material_name' => $v['out_material_name'],
                'in_material' => $v['in_material'],
                'in_material_ids' => $v['in_material_ids'],
                'belong_bom_id' => $v['belong_bom_id'],
                'group_step_withnames' => $v['group_step_withnames'],
                'group_routing_package' => $v['group_routing_package'],
                'workhour_package' => json_encode($array_workhour_package),
                'admin_id' => !empty(session('administrator')->admin_id) ? session('administrator')->admin_id : 0,
                'created_at' => time(),
            ];
            $insert_id = DB::table($this->table)->insertGetId($data);
            if (!$insert_id) return false;
        }
        return true;
    }

//endregion
//region  增

//endregion
//region  修

//endregion
//region  查
    public function get($id)
    {
        $obj = DB::table($this->table.' as a1')
            ->select('a1.id as product_order_id',
                'a1.number as wt_number',
                'a1.qty',
                'a1.name as material_name',
                'a2.number as po_number',
                'a1.operation_name',
                'a4.item_no',
                'a2.product_id as material_id'
            )
            ->leftJoin(config('alias.rpo').' as a2','a2.id','=','a1.production_order_id')
            ->leftJoin(config('alias.rm').' as a4','a4.id','=','a2.product_id')
            ->where('a1.id','=',$id)
            ->first();
        if (!$obj) TEA('404');
        return $obj;
    }

    public function getRoutingOutMaterial($bom_id,$routing_id)
    {
        $obj = DB::table(config('alias.rbri').' as rbri')
            ->where('rbri.bom_id',$bom_id)
            ->where('rbri.routing_id',$routing_id)
            ->where('rbri.type',2)
            ->leftJoin(config('alias.rbrb').' as rbrb', 'rbri.bom_routing_base_id', '=', 'rbrb.id')
            ->leftJoin(config('alias.rm').' as rm', 'rbri.material_id', '=', 'rm.id')
            ->leftJoin(config('alias.ruu').' as ruu', 'rm.unit_id', '=', 'ruu.id')
            ->leftJoin(config('alias.ruu').' as ruu2', 'rbri.bom_unit_id', '=', 'ruu2.id')
            ->leftJoin(config('alias.rmc').' as rmc', 'rm.material_category_id', '=', 'rmc.id')
            ->select(
                'rbri.material_id',
                'rm.item_no as material_code',
                'rm.name as material_name',
                'rm.material_category_id',
                'rmc.name as material_category_name',
                'rm.unit_id',
                'ruu.commercial as material_commercial',
                'ruu.name as unit_name',
                'rbri.bom_unit_id',
                'ruu2.commercial as bom_commercial',
                'rbri.use_num',
                'rbri.bom_routing_base_id',
                'rbri.step_path',
                'rbrb.group_index',
                'rbrb.index',
                'rbrb.operation_id',
                'rbrb.operation_ability_ids',
                'rbrb.routing_node_id',
                'rbrb.bom_id'
            )
            ->get();
        if (!$obj) TEA('1211');
        return $obj;
    }

    public function getExtraInMaterial($material_code)
    {

        $where[]=['rm.item_no',$material_code];

        $obj = DB::table(config('alias.rm').' as rm')
            ->where($where)
            ->leftJoin(config('alias.ruu').' as ruu', 'rm.unit_id', '=', 'ruu.id')
            ->leftJoin(config('alias.rmc').' as rmc', 'rm.material_category_id', '=', 'rmc.id')
            ->select(
                'rm.id as material_id',
                'rm.item_no as material_code',
                'rm.name as material_name',
                'rm.material_category_id',
                'rmc.name as material_category_name',
                'rm.unit_id',
                'ruu.commercial as material_commercial',
                'ruu.name as unit_name'
            )
            ->first();

        if (!$obj) TEA('1211');
        return $obj;
    }

    public function getBaseInMaterial($bom_id,$routing_node_id,$group_index)
    {

        $where[]=['rbri.bom_id',$bom_id];
        $where[]=['rbrb.routing_node_id',$routing_node_id];
        $where[]=['rbrb.group_index',$group_index];
        $where[]=['rbri.type',1];

        $obj = DB::table(config('alias.rbri').' as rbri')
            ->where($where)
            ->leftJoin(config('alias.rbrb').' as rbrb', 'rbri.bom_routing_base_id', '=', 'rbrb.id')
            ->leftJoin(config('alias.rm').' as rm', 'rbri.material_id', '=', 'rm.id')
            ->leftJoin(config('alias.ruu').' as ruu', 'rm.unit_id', '=', 'ruu.id')
            ->leftJoin(config('alias.ruu').' as ruu2', 'rbri.bom_unit_id', '=', 'ruu2.id')
            ->leftJoin(config('alias.rmc').' as rmc', 'rm.material_category_id', '=', 'rmc.id')
            ->select(
                'rbri.material_id',
                'rm.item_no as material_code',
                'rm.name as material_name',
                'rm.material_category_id',
                'rmc.name as material_category_name',
                'rm.unit_id',
                'ruu.commercial as material_commercial',
                'ruu.name as unit_name',
                'rbri.bom_unit_id',
                'ruu2.commercial as bom_commercial',
                'rbri.use_num',
                'rbri.bom_routing_base_id',
                'rbri.is_lzp'
            )
            ->get();

//        $base_id = DB::table(config('alias.rbrb'))->where($where)->select('id')->first();
//
//        $obj = DB::table(config('alias.rbri'))
//            ->where('type',1)
//            ->where('bom_routing_base_id',$base_id->id)
//            ->select(
//                'material_id',
//                'material_code',
//                'use_num',
//                'bom_routing_base_id',
//                'material_category_id',
//                'material_category_name',
//                'material_name',
//                'unit_id',
//                'unit_name',
//                'commercial',
//                'bom_routing_base_id'
//            )
//            ->get();

        if (!$obj) TEA('1211');
        return $obj;
    }

    public function getSapMaterial($material_id,$factory_id)
    {
        $where[]=['a1.material_id',$material_id];
        $where[]=['a2.id',$factory_id];

        $obj = DB::table(config('alias.ramc').' as a1')
            ->where($where)
            ->select('a1.LGPRO',
                'a1.LGFSB'
            )
            ->leftJoin(config('alias.rf').' as a2','a1.WERKS', '=', 'a2.code')
            ->first();

        return $obj;
    }

    public function getBeforeOperation($routing_node_id)
    {
        $obj = DB::table(config('alias.rprm').' as rprm')
            ->where('rprm.nid',$routing_node_id)
            ->leftJoin(config('alias.rpro').' as rpro', 'rpro.id', '=', 'rprm.cid')
            ->select(
                'rpro.oid'
            )
            ->get();
        if (!$obj) TEA('404');
        return $obj;
    }

    public function getOperationOrder($routing_node_id)
    {
        $obj = DB::table(config('alias.rpro'))
            ->where('id',$routing_node_id)
            ->select(
                'order'
            )
            ->first();
        if (!$obj) TEA('404');
        return $obj;
    }

    public function getOperationName($operation_id)
    {
        $obj = DB::table(config('alias.rio'))
            ->where('id',$operation_id)
            ->select(
                'name'
            )
            ->first();
        if (!$obj) TEA('404');
        return $obj;
    }

    public function getAbilityName($ids)
    {
        $arr = [];
        foreach ($ids as $id) {
            $name = DB::table(config('alias.rioa'))
                ->where('id',$id)
                ->select(
                    'ability_name'
                )
                ->first();
            $arr[$id] = $name->ability_name;
        }

        return $arr;
    }

    public function getGroupSteps($bom_id,$routing_node_id,$group_index)
    {
        $where[]=['bom_id',$bom_id];
        $where[]=['routing_node_id',$routing_node_id];
        $where[]=['group_index',$group_index];

        $obj = DB::table(config('alias.rbrb').' as rbrb')
            ->where($where)
            ->leftJoin(config('alias.rpf').' as rpf', 'rpf.id', '=', 'rbrb.step_id')
            ->leftJoin(config('alias.rio').' as rio', 'rio.id', '=', 'rbrb.operation_id')
            ->select(
                'rbrb.id as base_step_id',
                'rpf.name as step_name',
                'rbrb.operation_id',
                'rio.name as operation_name',
                'rbrb.operation_ability_ids',
                'rbrb.index'
            )
            ->orderBy('rbrb.index','asc')
            ->get();

        if (!$obj) TEA('1211');
        return $obj;
    }

    public function getAllSteps($bom_id,$routing_node_id)
    {
        $where[]=['bom_id',$bom_id];
        $where[]=['routing_node_id',$routing_node_id];

        $obj = DB::table(config('alias.rbrb'))
            ->where($where)
            ->select(
                'id'
            )
            ->get()
            ->toArray();

        if (!$obj) TEA('1211');
        return $obj;
    }

    /**
     * 得到新的wt块号
     * @return  string
     * @author  kevin
     */
    protected function get_routing_sn()
    {
        #函数str_pad会将某个值填充到指定的长度，如这里不足5位数的时候，会在左边填充0的
        return date('Ymd') . str_pad(mt_rand(1, 99999), 5, '0', STR_PAD_LEFT);
    }

//endregion



}