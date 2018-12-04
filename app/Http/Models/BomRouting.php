<?php
/**
 * Created by PhpStorm.
 * User: haoziye
 * Date: 2018/4/8
 * Time: 下午2:25
 */
namespace App\Http\Models;
use App\Http\Models\Encoding\EncodingSetting;
use App\Http\Models\Material\AttributeDefinition;
use App\Http\Models\Material\Material;
use App\Libraries\Tree;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class BomRouting extends Base{

    public function __construct()
    {
        parent::__construct();
    }

//region 检


    /**
     * 检查生成流转品需要的参数
     * @param $input
     * @throws \App\Exceptions\ApiException
     */
    public function checkLZPFormField(&$input){
        if(empty($input['select_type']) || !is_numeric($input['select_type']) || !in_array($input['select_type'],[1,2,3,4])) TEA('700','select_type');
        if(empty($input['bom_id']) || !is_numeric($input['bom_id'])) TEA('700','bom_id');
        $has = $this->isExisted([['id','=',$input['bom_id']]],config('alias.rb'));
        if(!$has) TEA('1136');
        if(empty($input['operation_id']) || !is_numeric($input['operation_id'])) TEA('700','operation_id');
        $has = $this->isExisted([['id','=',$input['operation_id']]],config('alias.rio'));
        if(!$has) TEA('1135');
        if(empty($input['operation_code'])) TEA('700','operation_code');
        if(empty($input['operation_ability_ids'])) TEA('700','operation_ability_ids');
        if(empty($input['start_step_id']) || !is_numeric($input['start_step_id'])) TEA('700','start_step_id');
        $has = $this->isExisted([['id','=',$input['start_step_id']]],config('alias.rpf'));
        if(!$has) TEA('1131');
        if(empty($input['end_step_id']) || !is_numeric($input['end_step_id'])) TEA('700','end_step_id');
        $has = $this->isExisted([['id','=',$input['end_step_id']]],config('alias.rpf'));
        if(!$has) TEA('1134');
        if(empty($input['step_path'])) TEA('700','step_path');
        if(empty($input['routing_node_id']) || !is_numeric($input['routing_node_id'])) TEA('700','routing_node_id');
        $has = $this->isExisted([['id','=',$input['routing_node_id']]],config('alias.rpro'));
        if(!$has) TEA('1133');
        if(!isset($input['children']) || !is_json($input['children'])) TEA('700','children');
        $input['children'] = json_decode($input['children'],true);
        if(empty(json_decode($input['drawings'],true)) || !is_json($input['drawings'])) TEA('700','drawings');
        if(empty($input['index']) || !is_numeric($input['index'])) TEA('700','index');
        if(empty($input['practice_id']) || !is_numeric($input['practice_id'])) TEA('700','practice_id');
        if($input['practice_id'] > 0){
            $practice = DB::table(config('alias.rp').' as rp')->select('rp.id','rp.m_c_id','rmc.unit_id','rmc.code','uu.commercial')
                ->leftJoin(config('alias.rmc').' as rmc','rmc.id','rp.m_c_id')
                ->leftJoin(config('alias.uu').' as uu','uu.id','rmc.unit_id')
                ->where('rp.id',$input['practice_id'])
                ->first();
            if(empty($practice)) TEA('1132');
            $input['material_category_id'] = $practice->m_c_id;
            $input['material_category_code'] = $practice->code;
            if(empty($practice->unit_id)) TEA('1137');
            $input['unit_id'] = $practice->unit_id;
            $input['commercial'] = $practice->commercial;
        }else{
            if(empty($input['material_category_id']) || !is_numeric($input['material_category_id'])) TEA('700','material_category_id');
            $material_category = DB::table(config('alias.rmc').' as rmc')->select('rmc.code','rmc.unit_id','uu.commercial')
                ->leftJoin(config('alias.uu').' as uu','uu.id','rmc.unit_id')
                ->where('rmc.id',$input['material_category_id'])
                ->first();
            if(empty($material_category)) TEA('1142');
            $input['material_category_code'] = $material_category->code;
            if(empty($material_category->unit_id)) TEA('1137');
            $input['unit_id'] = $material_category->unit_id;
            $input['commercial'] = $material_category->commercial;
        }
    }

    /**
     * 检查bom工艺路线信息参数
     * @param $input
     * @throws \App\Exceptions\ApiException
     */
    public function checkBomRoutingFormField(&$input){
        if(empty($input['bom_id']) || !is_numeric($input['bom_id'])) TEA('700','bom_id');
        $has = $this->isExisted([['id','=',$input['bom_id']]],config('alias.rb'));
        if(!$has) TEA('1136');
        if(empty($input['routing_id']) || !is_numeric($input['routing_id'])) TEA('700','routing_id');
        $has = $this->isExisted([['id','=',$input['routing_id']]],config('alias.rpr'));
        if(!$has) TEA('1139');
        if(empty($input['routing_info']) || !is_json($input['routing_info'])) TEA('700','routing_info');
        $input['input_ref_routing_info'] = [];
        $input['lzp_list'] = [];
        $routing_info = json_decode($input['routing_info'],true);
        foreach ($routing_info as $k=>$v){
            if(empty($v['index']) || !is_numeric($v['index'])) TEA('700','index');
            if(empty($v['step_id']) || !is_numeric($v['step_id'])) TEA('700','step_id');
            $has = $this->isExisted([['id','=',$v['step_id']]],config('alias.rpf'));
            if(!$has) TEA('1140');
            if(!isset($v['select_type']) || !is_numeric($v['select_type']) || !in_array($v['select_type'],[0,1,2,3,4])) TEA('700','select_type');
            if(empty($v['routing_node_id']) || !is_numeric($v['routing_node_id'])) TEA('700','routing_node_id');
            $has = $this->isExisted([['id','=',$v['routing_node_id']]],config('alias.rpro'));
            if(!$has) TEA('1133');
//            if(empty($v['practice_id']) || !is_numeric($v['practice_id'])) TEA('700','practice_id');
//            $has = $this->isExisted([['id','=',$v['practice_id']]],config('alias.rp'));
//            if(!$has) TEA('1132');
            if(empty($v['operation_id']) || !is_numeric($v['operation_id'])) TEA('700','operation_id');
            $has = $this->isExisted([['id','=',$v['operation_id']]],config('alias.rio'));
            if(!$has) TEA('1135');
            if(empty($v['is_start_or_end']) || !in_array($v['is_start_or_end'],[1,2,3])) TEA('700','is_start_or_end');
            if(!isset($v['practice_work_hour'])) TEA('700','practice_work_hour');
            if(!isset($v['comment'])) TEA('700','comment');
            if(!isset($v['operation_ability_ids'])) TEA('700','operation_ability_ids');
            if(!isset($v['drawings'])) TEA('700','drawings');
            if(empty($v['group_index'])) TEA('700','group_index');
            if(!isset($v['practice_step_order_id'])) TEA('700','practice_step_order_id');
            foreach ($v['drawings'] as $j=>$z){
                $has = $this->isExisted([['id','=',$z['drawing_id']]],config('alias.rdr'));
                if(!$has) TEA('1141');
            }
            if(!isset($v['attachments'])) TEA('700','attachments');
            foreach ($v['attachments'] as $j=>$z){
                $has = $this->isExisted([['id',$z]],config('alias.attachment'));
                if(!$has) TEA('1143');
            }
            if(!isset($v['material_category_id'])) TEA('700','material_category_id');
            if(!isset($v['material_info'])) TEA('700','material_info');
            if(!isset($v['workcenters'])) TEA('700','workcenters');
            if(!isset($v['device_id']) || !is_numeric($v['device_id'])) TEA('700','device_id');
            foreach ($v['material_info'] as $j=>$z){
                if(empty($z['material_id']) || !is_numeric($z['material_id'])) TEA('700','material_id');
                $has = $this->isExisted([['id','=',$z['material_id']]],config('alias.rm'));
                if(!$has) TEA('1138');
                if(empty($z['usage_number']) || !is_numeric($z['usage_number'])) TEA('700','usage_number');
                if(empty($z['type']) || !in_array($z['type'],[1,2])) TEA('700','type');
                if(!isset($z['is_lzp'])) TEA('700','is_lzp');
                if($z['is_lzp'] == 1) $input['lzp_list'][] = $z['material_id'];
//                if(empty($z['step_path'])) TEA('700','step_path');
                if(empty($z['index']) || !is_numeric($z['index'])) TEA('700','index');
                if(!isset($z['desc'])) TEA('700','desc');
                if(empty($z['bom_unit_id']) || !is_numeric($z['bom_unit_id'])) TEA('700','bom_unit_id');
                if(!isset($z['POSNR'])) TEA('700','POSNR');
            }
            $input['input_ref_routing_info'][$v['routing_node_id'].'-'.$v['practice_id'].'-'.$v['step_id'].'-'.$v['index']] = $v;
        }
        if(empty($input['routings']) || !is_json($input['routings'])) TEA('700','routings');
        $routings = json_decode($input['routings'],true);
        $input['input_ref_routings'] = [];
        foreach($routings as $k=>$v){
            if(empty($v['routing_id']) || !is_numeric($v['routing_id'])) TEA('700','routing_id');
            $has = $this->isExisted([['id','=',$v['routing_id']]],config('alias.rpr'));
            if(!$has) TEA('1169');
            $input['input_ref_routings'][$v['factory_id'].'-'.$v['routing_id']] = $v;
        }
        if(empty($input['control_info']) || !is_json($input['control_info'])) TEA('700','control_info');
        $controls = json_decode($input['control_info'],true);
        $input['input_ref_control_info'] = [];
        foreach ($controls as $k=>$v){
            if(empty($v['operation_id']) || !is_numeric($v['operation_id'])) TEA('700','operation_id');
            if(empty($v['control_code'])) TEA('700','control_code');
            if(empty($v['routing_node_id']) || !is_numeric($v['routing_node_id'])) TEA('700','routing_node_id');
            $input['input_ref_control_info'][$v['routing_node_id']] = $v;
        }
    }


//endregion

//region 增

    /**
     * @param $input
     */
    public function storeLZP($input){
        $lzp_list = [];
        try{
            DB::connection()->beginTransaction();
            $drawings = json_decode($input['drawings'],true);
            if($input['select_type'] == 1 || $input['select_type'] == 4){//1进1图1流转，n进1图n流转
                foreach ($input['children'] as $k=>$v){
                    $this->addLzpMaterialAndBom($input,$drawings[0],$lzp_list,[$v]);
                }
            }else if($input['select_type'] == 3){//n进1图1流转
                $this->addLzpMaterialAndBom($input,$drawings[0],$lzp_list,$input['children']);
            }else if($input['select_type'] == 2){//1进n图n流转
                foreach ($drawings as $k=>$v){
                    $this->addLzpMaterialAndBom($input,$v,$lzp_list,[$input['children'][0]]);
                }
            }
            $bom_lzp_data = [];
            foreach ($lzp_list as $k=>$v){
                $bom_lzp_data[] = [
                    'start_step_id'=>$input['start_step_id'],
                    'end_step_id'=>$input['end_step_id'],
                    'step_path'=>$input['step_path'],
                    'material_id'=>$v['material_id'],
                    'routing_node_id'=>$input['routing_node_id'],
                    'bom_id'=>$input['bom_id'],
                    'routing_id'=>$input['routing_id'],
                    'ctime'=>time(),
                    'index'=>$input['index'],
                ];
            }
            DB::table(config('alias.rbrl'))->insert($bom_lzp_data);
        }catch (\ApiException $exception){
            DB::connection()->rollback();
            TEA($exception->getCode());
        }
        DB::connection()->commit();
        return $lzp_list;
    }

    /**
     * 添加流转品的物料和bom
     * @param $input
     * @param $drawings
     * @param $lzp_list
     * @param $children
     * @throws \App\Exceptions\ApiException
     */
    public function addLzpMaterialAndBom($input,$drawing_id,&$lzp_list,$children){
        $identity_card = $this->createLzpIdentityCard($input['operation_id'],$children,$drawing_id);
        $lzp_material = DB::table(config('alias.rm').' as rm')
            ->leftJoin(config('alias.ruu').' as ruu','rm.unit_id','ruu.id')
            ->select('rm.id as material_id','rm.item_no','rm.name','ruu.id as unit_id','ruu.commercial')
            ->where('rm.lzp_identity_card',$identity_card)
            ->first();
        if($lzp_material){
            //如果是已经生成的流转品需要找到它在这个bom已经有的描述（默认第一个描述）
            $item = DB::table(config('alias.rbri').' as rbri')->select('desc')
                ->where([['bom_id','=',$input['bom_id']],['material_id','=',$lzp_material->material_id],['is_lzp','=',1],['type','=',2]])->first();
            $lzp_list[] = [
                'item_no'=>$lzp_material->item_no,
                'code'=>$lzp_material->item_no,
                'material_id'=>$lzp_material->material_id,
                'name'=>$lzp_material->name,
                'bom_unit_id' => $lzp_material->unit_id,
                'commercial' => $lzp_material->commercial,
                'desc'=>isset($item->desc)?$item->desc:'',
            ];
        }else{
            $encodingDao = new EncodingSetting();
            $code = $encodingDao->get(['type'=>1,'type_code'=>$input['material_category_code'].$input['operation_code']]);
            //先找到进料的物料大类名称用于流转品的名称
            //这边把物料编码先拿出来做名称的方式会因为发放相同编码最后保存并不一样
            $lzp_name = $code['code'];
            foreach ($children as $k=>$v){
                $material_category = DB::table(config('alias.rm').' as rm')->select('rmc.name')
                    ->leftJoin(config('alias.rmc').' as rmc','rm.material_category_id','rmc.id')
                    ->where('rm.id',$v['material_id'])->first();
                if(!empty($material_category)) $lzp_name .= $material_category->name;
            }
            $res = $this->addLzpMaterial($input['material_category_id'],$input['unit_id'],$code['code'],[$drawing_id],$identity_card,$lzp_name);
            $this->newAddLzpBom($input,$res['material_id'],$res['item_no'],$children,$input['unit_id']);
            $lzp_list[] = [
                'item_no'=>$res['item_no'],
                'code'=>$res['item_no'],
                'material_id'=>$res['material_id'],
                'name'=>$lzp_name,
                'bom_unit_id' => $input['unit_id'],
                'commercial' => $input['commercial'],
            ];
        }
    }

    /**
     * 添加流转品的物料属性定义并返回属性定义id和属性值的集合
     * @param $drawing_id
     */
//    public function addLzpMaterialAttribute($drawing_id){
//        //找到流转品图片的图片属性
//        $attributes = DB::table(config('alias.rda').' as rda')->select('rdad.name','rda.value')
//            ->leftJoin(config('alias.rdad').' as rdad','rda.attribute_definition_id','rdad.id')
//            ->where('rda.id',$drawing_id)
//            ->get();
//        $encodingDao = new EncodingSetting();
//        $attributeDefinitionDao = new AttributeDefinition();
//        $attribute_list = [];
//        foreach ($attributes as $k=>&$v){
//            //查看是否具有文字类型的属性定义
//            $attr = DB::table(config('alias.rdad'))->select('id')->where([['name','=',$v->name],['datatype_id','=',3],['category_id','=',3]])->first();
//            if(empty($attr)){
//                $key = $encodingDao->get(['type'=>1,'type_code'=>'']);
//                $data=[
//                    'key' => $key,
//                    'name' => $v->name,
//                    'label' => '',
//                    'datatype_id' => 3,
//                    'unit_id' => 0,
//                    'is_searchable'=>1,
//                    'is_visible_table'=>0,
//                    'is_man_haur_param'=>0,
//                    'comment'=>'',
//                    'range'=>'{}',
//                    'company_id'=>!empty(session('administrator')->company_id) ? session('administrator')->company_id : 0,//公司ID
//                    'factory_id'=>!empty(session('administrator')->factory_id) ? session('administrator')->factory_id : 0,//工厂ID
//                ];
//                $id = $attributeDefinitionDao->add($data,3);
//                $attribute_list[] = ['attribute_definition_id'=>$id,'value'=>$v->value];
//            }else{
//                $attribute_list[] = ['attribute_definition_id'=>$attr->id,'value'=>$v->value];
//            }
//        }
//    }

    /**
     * 生成流转品的身份信息，指代该流转品是在什么工序什么进料什么图片下生成的
     * @param $operation_id
     * @param $children
     * @param $drawings
     * @return string
     */
    public function createLzpIdentityCard($operation_id,$children,$drawing_id){
        $in_material = [];
        foreach ($children as $k=>$v){
            $in_material[] = $v['material_id'];
        }
        array_multisort($in_material,SORT_ASC,SORT_NUMERIC);
        $in_code = '';
        foreach ($in_material as $k=>$v){
            if($k == 0){
                $in_code .= $v;
            }else{
                $in_code .= ','.$v;
            }
        }
       return  $operation_id.'-'.$in_code.'-'.$drawing_id['drawing_id'];
    }

    /**
     * 添加流转品的物料
     * @param $material_category_id
     * @param $unit_id
     * @param $code
     * @param $drawings
     * @return mixed
     */
    public function addLzpMaterial($material_category_id,$unit_id,$code,$drawings,$identity_card,$lzp_name){
        $materialDao = new Material();
        $materialData = [
            'material_category_id'=>$material_category_id,
            'name'=>$lzp_name,
            'unit_id'=>$unit_id,
            'source'=>1,
            'batch_no_prefix'=>'',
            'item_no'=>$code,
            'moq'=>'',
            'description'=>'',
            'mpq'=>'',
            'weight'=>'',
            'length'=>'',
            'width'=>'',
            'height'=>'',
            'template_id'=>0,
            'material_attributes'=>'[]',
            'operation_attributes'=>'[]',
            'safety_stock'=>'',
            'max_stock'=>'',
            'min_stock'=>'',
            'fixed_advanced_period'=>'',
            'cumulative_lead_time'=>'',
            'attachments'=>'[]',
            'drawings'=>json_encode($drawings),
            'label'=>'',
            'is_provider'=>'',
            'lzp_identity_card'=>$identity_card,
        ];
        $materialDao->checkFormFields($materialData);
        $res = $materialDao->add($materialData);
        return $res;
    }

    /**
     * 添加流转品的bom
     * @param $input
     * @param $material_id
     * @param $material_code
     * @param $identity_card
     * @param $children
     */
    public function addLzpBom($input,$material_id,$material_code,$children,$unit_id){
        $bomDao = new Bom();
        //有时间一定要把这个优化掉，当时写的时候不熟悉bom，所以调用了山哥之前写的方法，但是熟悉后一定要修改，不然造成不必要的资源浪费
        $bom_tree = new \StdClass();
        $bom_tree->material_id = $material_id;
        $bom_tree->name = $material_code;
        $bom_tree->item_no = $material_code;
        $bom_tree->children = $children;
        $bomData = [
            'code'=>$material_code,
            'material_id'=>$material_id,
            'loss_rate'=>0,
            'name'=>$material_code,
            'bom_group_id'=>'',
            'version'=>1,
            'version_description'=>'第一版本',
            'qty'=>1,
            'description'=>'',
            'bom_tree'=>json_encode($bom_tree),
            'attachments'=>'[]',
            'operation_id'=>$input['operation_id'],
            'operation_capacity'=>$input['operation_ability_ids'],
            'status'=>1,
            'is_verison_on'=>1,
            'bom_no'=>'01',
            'bom_unit_id'=>$unit_id
        ];
        $bomres = $bomDao->add($bomData);
        //激活
        $bomDao->changeStatus(["type"=>"active","status"=>1,"bom_id"=>$bomres]);
        //发布
        $bomDao->changeStatus(["type"=>"release","status"=>1,"bom_id"=>$bomres]);

    }

    /**
     * 生成流转品新方法
     * @param $input
     * @param $material_id
     * @param $material_code
     * @param $children
     * @param $unit_id
     * @throws \App\Exceptions\ApiSapException
     */
    public function newAddLzpBom($input,$material_id,$material_code,$children,$unit_id){
        $bomData = [
            'code' => $material_code,//bom编码
            'name' => $material_code,//名称
            'version' => 1,//版本
            'material_id' => $material_id,//物料id
            'status' =>  1,
            'qty' => 1,
            'creator_id' => (!empty(session('administrator')->admin_id)) ? session('administrator')->admin_id : 0,
            'company_id' => (!empty(session('administrator')->company_id)) ? session('administrator')->company_id : 0,
            'factory_id' => (!empty(session('administrator')->factory_id)) ? session('administrator')->factory_id : 0,
            'mtime' => time(),//最后修改时间
            'ctime' => time(),//创建时间
            'from' => 0,
            'bom_no' => '01',
            'loss_rate' => 0,
            'bom_group_id' => 0,
            'description' => '',
            'operation_id' => $input['operation_id'],
            'operation_ability' => $input['operation_ability_ids'],
            'is_version_on'=> 1,
            'bom_unit_id'=>$unit_id,
        ];
        $bom_id = DB::table(config('alias.rb'))->insertGetId($bomData);
        if(!$bom_id) TEA('802');
        //添加子项
        $bom_items = [];
        $item_material_ids = [];
        foreach ($children as $k=>$v){
            $bom_items[] = [
                'bom_id'=>$bom_id,
                'parent_id'=>0,
                'material_id'=>$v['material_id'],
                'bom_material_id'=>$material_id,
                'usage_number'=>$v['usage_number'],
                'total_consume'=>0,
                'comment'=>'',
                'is_assembly'=>0,
                'version'=>0,
                'bom_no'=>'',
                'bom_unit_id'=>$v['bom_unit_id'],
            ];
            $item_material_ids[] = $v['material_id'];
        }
        if(!empty($bom_items)){
            DB::table(config('alias.rbi'))->insert($bom_items);
            //并且更新bom的子项物料集合
            DB::table(config('alias.rb'))->where('id',$bom_id)->update(['item_material_path'=>implode(',',$item_material_ids)]);
        }
    }

    /**
     * 添加工序和能力关联，弃用
     * @param $input
     * @return string
     */
    public function addOperationAbilitys($operation_id,$abilitys){
        $ability_str = '';
        foreach ($abilitys as $k=>$v){
            $ability = DB::table(config('alias.rioa'))->select('id')->where([['operation_id','=',$operation_id],['ability_id','=',$v['ability_id']],['status','=',1]])->first();
            if(!empty($ability)){
                if($k == 0){
                    $ability_str .= $ability->id;
                }else{
                    $ability_str .= ','.$ability->id;
                }
                continue;
            }else{
                $operation_ability_data = [
                    'code'=>'AB' . $operation_id . time() . mt_rand(1000, 9999),
                    'ability_id'=>$v['ability_id'],
                    'operation_id'=>$operation_id,
                    'ability_name'=>$v['ability_name'],
                    'status'=>1,
                ];
                $instert_id = DB::table(config('alias.rioa'))->insertGetId($operation_ability_data);
                if($k == 0){
                    $ability_str .= $instert_id;
                }else{
                    $ability_str .= ','.$instert_id;
                }
            }
        }
        return $ability_str;
    }

    /**
     * 添加标准工时
     * @param $material
     * @param $operation_id
     * @param $operation_ability_ids
     * @throws \App\Exceptions\ApiException
     */
    public function addMaterialWorkHour($material,$operation_id,$operation_ability_ids){
        $operation_ability_ids = explode(',',$operation_ability_ids);
        $workHourData = [];
        foreach ($operation_ability_ids as $k=>$v){
            if(empty($v)) continue;
            $has = $this->isExisted([['ability_id','=',$v],['material_id','=',$material->id],['operation_id','=',$operation_id]],config('alias.rimw'));
            if(!$has){
                $workHourData[] = [
                    'material_no'=>$material->item_no,
                    'material_category_id'=>$material->material_category_id,
                    'work_hours'=>0,
                    'operation_id'=>$operation_id,
                    'ctime'=>time(),
                    'mtime'=>time(),
                    'ability_id'=>$v,
                    'material_id'=>$material->id,
                ];
            }
        }
        $res = DB::table(config('alias.rimw'))->insert($workHourData);
        if(!$res) TEA('802');
    }



    /**
     * bom升级的时候
     * @param $bom_id
     * @param $routing_id
     * @param $new_bom_id
     */
    public function addBomRoutingByUpgrade($new_bom_id,$bom_old_id,$current_routing_id,$version,$version_description){
        //老bom的工艺路线
        $bom_routings = DB::table(config('alias.rbr'))->where([['bom_id','=',$bom_old_id],['routing_id','<>',$current_routing_id]])->get();
        $bom_routings_data = [];
        //因为升级的时候，正在编辑被选择默认了，之前工艺路线也选择默认,就会产生两个默认，就不对了
        $has = $this->isExisted([['is_default','=',1],['bom_id','=',$new_bom_id]],config('alias.rbr'));
        foreach ($bom_routings as $k=>$v){
            $bom_routings_data[] = [
                'bom_id'=>$new_bom_id,
                'routing_id'=>$v->routing_id,
                'is_default'=>$has ? 0 : $v->is_default,
                'factory_id'=>$v->factory_id
            ];
        }
        //老bom的工艺路线信息
        $bomRouting_list = DB::table(config('alias.rbrb'))->where([['bom_id','=',$bom_old_id],['routing_id','<>',$current_routing_id]])->get();
        foreach ($bomRouting_list as $k=>&$v){
            $v->item_info = DB::table(config('alias.rbri'))->where('bom_routing_base_id',$v->id)->get();
            $v->drawing = DB::table(config('alias.rbrd'))->where('bom_routing_base_id',$v->id)->get();
            $v->attachment = DB::table(config('alias.rbra'))->where('bom_routing_base_id',$v->id)->get();
            $v->workHours = DB::table(config('alias.rimw'))->where('step_info_id',$v->id)->get();
            $v->workcenter = DB::table(config('alias.rbrw'))->where('bom_routing_base_id',$v->id)->get();
        }
        //老工艺路线流转品和bom的关系
        $old_bom_lzp_list = DB::table(config('alias.rbrl'))->where('bom_id',$bom_old_id)->get();
        $new_bom_lzp_list = [];
        foreach ($old_bom_lzp_list as $k=>$v){
            $new_bom_lzp_list[] = [
                'start_step_id'=>$v->start_step_id,
                'end_step_id'=>$v->end_step_id,
                'step_path'=>$v->step_path,
                'material_id'=>$v->material_id,
                'routing_node_id'=>$v->routing_node_id,
                'bom_id'=>$new_bom_id,
                'routing_id'=>$v->routing_id,
                'ctime'=>time(),
                'index'=>$v->index,
                'identity_card'=>$v->identity_card,
            ];
        }
        //老工艺路线的控制码信息
        $control_info = DB::table(config('alias.rbroc'))->where([['bom_id','=',$bom_old_id],['routing_id','<>',$current_routing_id]])->get();
        $new_control_info = [];
        foreach ($control_info as $k=>$v){
            $new_control_info[] = [
                'bom_id'=>$new_bom_id,
                'routing_id'=>$v->routing_id,
                'operation_id'=>$v->operation_id,
                'control_code'=>$v->control_code,
                'routing_node_id'=>$v->routing_node_id,
            ];
        }
        try{
            DB::connection()->beginTransaction();
            //添加新bom的工艺流线
            DB::table(config('alias.rbr'))->insert($bom_routings_data);
            //添加新bom的工艺路线上的控制码
            DB::table(config('alias.rbroc'))->insert($new_control_info);
            //添加bom和流转品的关系
            DB::table(config('alias.rbrl'))->insert($new_bom_lzp_list);
            $itemData = [];
            $drawingData = [];
            $attachmentData = [];
            $workcenter = [];
            $workHour_data = [];
            foreach ($bomRouting_list as $k=>$v){
                $baseData = [
                    'routing_node_id'=>$v->routing_node_id,
                    'bom_id'=>$new_bom_id,
                    'comment'=>$v->comment,
                    'operation_ability_ids'=>$v->operation_ability_ids,
                    'practice_id'=>$v->practice_id,
                    'step_id'=>$v->step_id,
                    'operation_id'=>$v->operation_id,
                    'practice_work_hour'=>$v->practice_work_hour,
                    'is_start_or_end'=>$v->is_start_or_end,
                    'routing_id'=>$v->routing_id,
                    'index'=>$v->index,
                    'select_type'=>$v->select_type,
                    'old_description'=>$v->old_description,
                    'group_index'=>$v->group_index,
                    'material_category_id'=>$v->material_category_id,
                    'practice_step_order_id'=>$v->practice_step_order_id,
                    'device_id'=>$v->device_id,
                ];
                $baseId = DB::table(config('alias.rbrb'))->insertGetId($baseData);
                foreach ($v->item_info as $j=>$w){
                    $itemData[] = [
                        'material_id'=>$w->material_id,
//                        'material_code'=>$w->material_code,
                        'use_num'=>$w->use_num,
                        'type'=>$w->type,
                        'bom_id'=>$new_bom_id,
                        'bom_routing_base_id'=>$baseId,
//                        'material_category_id'=>$w->material_category_id,
//                        'material_category_name'=>$w->material_category_name,
//                        'material_name'=>$w->material_name,
//                        'unit_id'=>$w->unit_id,
//                        'unit_name'=>$w->unit_name,
//                        'commercial'=>$w->commercial,
                        'step_path'=>$w->step_path,
                        'is_lzp'=>$w->is_lzp,
                        'routing_id'=>$w->routing_id,
                        'index'=>$w->index,
                        'desc'=>$w->desc,
                        'bom_unit_id'=>$w->bom_unit_id,
                        'POSNR'=>$w->POSNR,
                    ];
                }
                foreach ($v->drawing as $j=>$w){
                    $drawingData[] = [
                        'bom_routing_base_id'=>$baseId,
                        'drawing_id'=>$w->id,
                    ];
                }
                foreach ($v->attachment as $j=>$w){
                    $attachmentData[] = [
                        'bom_routing_base_id'=>$baseId,
                        'attachment_id'=>$w->id,
                        'comment'=>$w->comment,
                    ];
                }
                foreach ($v->workcenter as $j=>$w){
                    $workcenter[] = [
                        'bom_routing_base_id'=>$baseId,
                        'workcenter_id'=>$w->workcenter_id,
                    ];
                }
                foreach ($v->workHours as $k=>$v){
                    $workHour_data[] = [
                        'material_no'=>$v->material_no,
                        'material_category_id'=>$v->material_category_id,
                        'work_hours'=>$v->work_hours,
                        'operation_id'=>$v->operation_id,
                        'ctime'=>time(),
                        'mtime'=>time(),
                        'ability_id'=>$v->ability_id,
                        'material_id'=>$v->material_id,
                        'min_value'=>$v->min_value,
                        'max_value'=>$v->max_value,
                        'creator_id'=>!empty(session('administrator')->admin_id) ? (session('administrator')->admin_id) : 0,
                        'sample_hours'=>$v->sample_hours,
                        'step_info_id'=>$baseId,
                        'bom_id'=>$new_bom_id,
                        'bom_version'=>$version,
                        'bom_version_description'=>$version_description,
                        'routing_id'=>$v->routing_id,
                        'man_hours'=>$v->man_hours,
                    ];
                }
            }
            DB::table(config('alias.rbri'))->insert($itemData);
            DB::table(config('alias.rbrd'))->insert($drawingData);
            DB::table('alias.rbra')->insert($attachmentData);
            DB::table(config('alias.rimw'))->insert($workHour_data);
            DB::table(config('alias.rbrw'))->insert($workcenter);
        }catch(\ApiException $exception){
            DB::connection()->rollback();
            TEA($exception->getCode());
        }
        DB::connection()->commit();
    }

    /**
     * 升级的时候添加工艺路线上的工时
     * @param $workHours
     * @param $bom_routing_base_id
     * @param $bom_id
     * @param $version
     * @param $version_description
     * @throws \Illuminate\Container\EntryNotFoundException
     */
    public function addBomRoutingWorkHourByUpgrade($workHours,$bom_routing_base_id,$bom_id,$version,$version_description){
        $workHour_data = [];
        foreach ($workHours as $k=>$v){
            $workHour_data[] = [
                'material_no'=>$v['material_no'],
                'material_category_id'=>$v['material_category_id'],
                'work_hours'=>$v['work_hours'],
                'operation_id'=>$v['operation_id'],
                'ctime'=>time(),
                'mtime'=>time(),
                'ability_id'=>$v['ability_id'],
                'material_id'=>$v['material_id'],
                'min_value'=>$v['min_value'],
                'max_value'=>$v['max_value'],
                'creator_id'=>!empty(session('administrator')->admin_id) ? (session('administrator')->admin_id) : 0,
                'sample_hours'=>$v['sample_hours'],
                'step_info_id'=>$bom_routing_base_id,
                'bom_id'=>$bom_id,
                'bom_version'=>$version,
                'bom_version_description'=>$version_description,
                'routing_id'=>$v['routing_id'],
                'man_hours'=>$v['man_hours'],
            ];
        }
        $workHourRes = DB::table(config('alias.rimw'))->insert($workHour_data);
    }

    /**
     * 添加工艺路线base信息
     * @param $input
     * @param $add_set
     * @throws \App\Exceptions\ApiException
     */
    public function add($input,$add_set){
        $input_routing_info = $input['input_ref_routing_info'];
        try{
            DB::connection()->beginTransaction();
            foreach ($add_set as $k=>$v){
                if(empty($v)) continue;
                $baseData = [
                    'routing_node_id'=>$input_routing_info[$v]['routing_node_id'],
                    'bom_id'=>$input['bom_id'],
                    'comment'=>$input_routing_info[$v]['comment'],
                    'operation_ability_ids'=>$input_routing_info[$v]['operation_ability_ids'],
                    'practice_id'=>$input_routing_info[$v]['practice_id'],
                    'step_id'=>$input_routing_info[$v]['step_id'],
                    'operation_id'=>$input_routing_info[$v]['operation_id'],
                    'practice_work_hour'=>$input_routing_info[$v]['practice_work_hour'],
                    'is_start_or_end'=>$input_routing_info[$v]['is_start_or_end'],
                    'routing_id'=>$input['routing_id'],
                    'index'=>$input_routing_info[$v]['index'],
                    'select_type'=>$input_routing_info[$v]['select_type'],
                    'old_description'=>empty($input_routing_info[$v]['description']) ? '' : $input_routing_info[$v]['description'],
                    'practice_step_order_id'=>$input_routing_info[$v]['practice_step_order_id'],
                    'group_index'=>$input_routing_info[$v]['group_index'],
                    'material_category_id'=>$input_routing_info[$v]['material_category_id'],
                    'device_id'=>$input_routing_info[$v]['device_id'],
                ];
                $baseId = DB::table(config('alias.rbrb'))->insertGetId($baseData);
                $this->saveBomRoutingItem($baseId,$input_routing_info[$v]['material_info'],$input);
                $this->saveBomRoutingDrawing($baseId,$input_routing_info[$v]['drawings']);
                $this->saveBomRoutingAttachment($baseId,$input_routing_info[$v]['attachments']);
                //保存选中的工艺路线所关联的工作中兴
                $this->saveBomRoutingWorkcenter($baseId,$input_routing_info[$v]['workcenters']);
                if(isset($input['is_upgrade']) && $input['is_upgrade'] == 1){
                    $this->addBomRoutingWorkHourByUpgrade($input_routing_info[$v]['workHours'],$baseId,$input['bom_id'],$input['version'],$input['version_description']);
                }
            }
        }catch(\ApiException $exception){
            DB::connection()->rollback();
            TEA($exception->getCode());
        }
        DB::connection()->commit();
    }

    /**
     * 添加工艺路线节点下进出料信息
     * @param $add_set
     * @param $input_ref_material_list
     * @param $input
     * @param $baseId
     * @param $opertion_id
     * @param $operation_ability_ids
     * @throws \App\Exceptions\ApiException
     */
    public function addBomRoutingItem($add_set,$input_ref_material_list,$input,$baseId){
        $materialData = [];
        foreach ($add_set as $k=>$v){
            if(empty($v)) continue;
//            $materialField = [
//                'rm.id',
//                'rm.item_no',
//                'rm.material_category_id',
//                'rm.name',
//                'rmc.name as material_category_name',
//                'rm.unit_id',
//                'uu.name as unit_name',
//                'uu.commercial'
//            ];
//            $material = DB::table(config('alias.rm').' as rm')->select($materialField)
//                ->leftJoin(config('alias.rmc').' as rmc','rmc.id','rm.material_category_id')
//                ->leftJoin(config('alias.uu').' as uu','uu.id','rm.unit_id')
//                ->where('rm.id',$input_ref_material_list[$v]['material_id'])
//                ->first();
            //上面这个物料信息本来是不想存的，因为只要通过物料id就能找到，存的话还会导致物料修改的时候，这边数据不同步，并且浪费这边的效率，但是他们非要我存
            $materialData[] = [
                'material_id'=>$input_ref_material_list[$v]['material_id'],
//                'material_code'=>$material->item_no,
                'use_num'=>$input_ref_material_list[$v]['usage_number'],
                'type'=>$input_ref_material_list[$v]['type'],
                'bom_id'=>$input['bom_id'],
                'bom_routing_base_id'=>$baseId,
//                'material_category_id'=>$material->material_category_id,
//                'material_category_name'=>$material->material_category_name,
//                'material_name'=>$material->name,
//                'unit_id'=>$material->unit_id,
//                'unit_name'=>$material->unit_name,
//                'commercial'=>$material->commercial,
                'is_lzp'=>$input_ref_material_list[$v]['is_lzp'],
                'step_path'=>$input_ref_material_list[$v]['step_path'],
                'routing_id'=>$input['routing_id'],
                'index'=>$input_ref_material_list[$v]['index'],
                'desc'=>$input_ref_material_list[$v]['desc'],
                'bom_unit_id'=>$input_ref_material_list[$v]['bom_unit_id'],
                'POSNR'=>$input_ref_material_list[$v]['POSNR'],
            ];
        }
        DB::table(config('alias.rbri'))->insert($materialData);
    }


//endregion

//region 查

    /**
     * 获取bom挂载的工艺路线节点的信息
     * @param $bom_id
     * @return array
     */
    public function getBomRouting($bom_id,$routing_id){
//        $cache_key = make_redis_key([$bom_id,$routing_id]);
//        $obj_list = Cache::get($cache_key);
//        if(!empty($obj_list)) return unserialize($obj_list);
        $obj_list = DB::table(config('alias.rbrb').' as rbrb')
            ->leftJoin(config('alias.rpf').' as rpf','rpf.id','rbrb.step_id')
            ->leftJoin(config('alias.rppf').' as rppf','rppf.id','rbrb.practice_step_order_id')
            ->select('rbrb.*','rpf.name','rpf.code','rpf.id as field_id','rppf.description','rpf.description as field_description')
            ->where([['rbrb.bom_id','=',$bom_id],['rbrb.routing_id','=',$routing_id]])
            ->orderBy('rbrb.index','asc')
            ->get();
        foreach ($obj_list as $k=>&$v){
            $field = [
                'rm.name',
                'rm.item_no',
                'uu.commercial',
                'rbri.material_id',
                'rbri.use_num as usage_number',
                'rbri.type',
                'rbri.is_lzp',
                'rbri.step_path',
                'rbri.index',
                'rbri.desc',
                'uu.id as bom_unit_id',
                'rbri.POSNR'
            ];
            $v->material_info = DB::table(config('alias.rbri').' as rbri')->select($field)
                ->leftJoin(config('alias.rm').' as rm','rm.id','rbri.material_id')
                ->leftJoin(config('alias.uu').' as uu','uu.id','rbri.bom_unit_id')
                ->where('rbri.bom_routing_base_id',$v->id)
                ->orderBy('rbri.index','asc')
                ->get();
            $v->drawings = DB::table(config('alias.rbrd').' as rbrd')->select('rdr.id as drawing_id','rdr.name','rdr.code','rdr.image_path')
                ->leftJoin(config('alias.rdr').' as rdr','rdr.id','rbrd.drawing_id')
                ->where('rbrd.bom_routing_base_id',$v->id)
                ->get();
            $v->attachments = DB::table(config('alias.rbra').' as rbra')
                ->select('a.id as attachment_id','a.path','a.filename','rbra.comment','a.size','rrad.name as creator_name','a.ctime')
                ->leftJoin(config('alias.attachment').' as a','rbra.attachment_id','a.id')
                ->leftJoin(config('alias.rrad').' as rrad','a.creator_id','rrad.id')
                ->where('rbra.bom_routing_base_id',$v->id)
                ->get();
            $v->workHours = DB::table(config('alias.rimw'))->where('step_info_id',$v->id)->get();
            $v->workcenters = DB::table(config('alias.rbrw').' as rbrw')
                ->leftJoin(config('alias.rwc').' as rwc','rwc.id','rbrw.workcenter_id')
                ->select('rwc.code','rwc.name','rbrw.workcenter_id')
                ->where('rbrw.bom_routing_base_id',$v->id)
                ->get();
        }
        //查找控制码信息
        $control_info = DB::table(config('alias.rbroc'))->where([['bom_id','=',$bom_id],['routing_id','=',$routing_id]])->get();
        //放入缓存
//        if(!empty($obj_list))   Cache::put($cache_key,serialize($obj_list),config('app.redis_timeout.bom_routing'));
        return ['routing_info'=>$obj_list,'control_info'=>$control_info];
    }

    /**
     * 根据物料id获取发布版本的bom的所有工艺路线和工艺路线信息
     * @param $bom_id
     * @param $routing_id
     * @return mixed
     */
    public function getBomAllRoutingByMaterialId($material_id){
        //1.根据物料id查找有效bom
        $bom = DB::table(config('alias.rb'))->select('id')
            ->where([['material_id','=',$material_id],['is_version_on','=',1],['status','=',1]])->first();
        if(empty($bom)) return [];
        //2.查找bom的工艺路线
        $routings = DB::table(config('alias.rbr').' as rbr')
            ->select('rbr.routing_id','rpr.name')
            ->leftJoin(config('alias.rpr').' as rpr','rbr.routing_id','rpr.id')
            ->where('rbr.bom_id',$bom->id)->get();
        //3.查找bom的所有工艺路线节点信息
        $obj_list = DB::table(config('alias.rbrb').' as rbrb')
            ->leftJoin(config('alias.rpf').' as rpf','rpf.id','rbrb.step_id')
            ->leftJoin(config('alias.rppf').' as rppf','rppf.id','rbrb.practice_step_order_id')
            ->leftJoin(config('alias.rdlt').' as rdlt','rdlt.id','rbrb.device_id')
            ->select('rbrb.*','rpf.name','rpf.code','rpf.id as field_id','rppf.description','rdlt.name as device_name','rpf.description as field_description')
            ->where('rbrb.bom_id','=',$bom->id)
            ->orderBy('rbrb.index','asc')
            ->get();
        //4.查找bom的所有工艺路线的进出料信息
        $material_info = DB::table(config('alias.rbri').' as rbri')->select('rm.name','rm.item_no','uu.commercial','rbri.*')
            ->leftJoin(config('alias.rm').' as rm','rm.id','rbri.material_id')
            ->leftJoin(config('alias.uu').' as uu','uu.id','rbri.bom_unit_id')
            ->where('rbri.bom_id',$bom->id)
            ->orderBy('rbri.index','asc')
            ->get();
        //5.查找bom的所有所有工艺路线的图片
        $drawings = DB::table(config('alias.rbrd').' as rbrd')->select('rdr.id as drawing_id','rdr.name','rdr.code','rdr.image_path','rbrd.bom_routing_base_id')
            ->leftJoin(config('alias.rdr').' as rdr','rdr.id','rbrd.drawing_id')
            ->leftJoin(config('alias.rbrb').' as rbrb','rbrb.id','rbrd.bom_routing_base_id')
            ->where('rbrb.bom_id',$bom->id)
            ->get();
        //6.查找bom的所有工艺路线的附件
        $attachments = DB::table(config('alias.rbra').' as rbra')
            ->select('a.id as attachment_id','a.path','a.filename','rbra.comment','a.size','a.ctime','rbra.bom_routing_base_id')
            ->leftJoin(config('alias.attachment').' as a','rbra.attachment_id','a.id')
            ->leftJoin(config('alias.rbrb').' as rbrb','rbrb.id','rbra.bom_routing_base_id')
            ->where('rbrb.bom_id',$bom->id)
            ->get();
        //7.查找bom的所有工艺路线的工作中心
        $workcenters = DB::table(config('alias.rbrw').' as rbrw')
            ->leftJoin(config('alias.rwc').' as rwc','rwc.id','rbrw.workcenter_id')
            ->leftJoin(config('alias.rbrb').' as rbrb','rbrw.bom_routing_base_id','rbrb.id')
            ->select('rwc.name','rwc.code','rbrw.workcenter_id','rbrw.bom_routing_base_id')
            ->where('rbrb.bom_id',$bom->id)
            ->get();
        //8.把进出料信息，图片，附件组装进节点信息
        foreach ($obj_list as $k=>&$v){
            $v->material_info = [];
            foreach ($material_info as $j=>$w){
                if($w->bom_routing_base_id == $v->id){
                    $v->material_info[] = $w;
                }
            }
            $v->drawings = [];
            foreach ($drawings as $j=>$w){
                if($w->bom_routing_base_id == $v->id){
                    $v->drawings[] = $w;
                }
            }
            $v->attachments = [];
            foreach ($attachments as $j=>$w){
                if($w->bom_routing_base_id == $v->id){
                    $v->attachments[] = $w;
                }
            }
            $v->workcenters = [];
            foreach ($workcenters as $j=>$w){
                if($w->bom_routing_base_id == $v->id){
                    $v->workcenters[] = $w;
                }
            }
        }
        //9.把节点信息组装进工艺路线
        foreach ($routings as $k=>&$v){
            $v->routing_info = [];
            foreach ($obj_list as $j=>$w){
                if($w->routing_id == $v->routing_id){
                    $v->routing_info[] = $w;
                }
            }
        }
        return $routings;
    }

    /**
     * 获取bom的工艺路线集合
     * @param $bom_id
     * @return mixed
     */
    public function getBomRoutings($bom_id){
        $obj_list = DB::table(config('alias.rbr').' as rbr')->select('rb.bom_no','rbr.factory_id','rbr.routing_id','rpr.name','rpr.procedure_group_id','rprg.name as group_name','rprg.code','rbr.is_default','rf.name as factory_name','rm.item_no')
            ->leftJoin(config('alias.rpr').' as rpr','rbr.routing_id','rpr.id')
            ->leftJoin(config('alias.rprg').' as rprg','rprg.id','rpr.procedure_group_id')
            ->leftJoin(config('alias.rf').' as rf','rf.id','rbr.factory_id')
            ->leftJoin(config('alias.rb').' as rb','rb.id','rbr.bom_id')
            ->leftJoin(config('alias.rm').' as rm','rm.id','rb.material_id')
            ->where('bom_id',$bom_id)
            ->get();
        foreach ($obj_list as $k=>&$v){
            $gn = DB::table(config('alias.rprgn'))
                ->where([['material_code','=',$v->item_no],['routing_id','=',$v->routing_id],['bom_no','=',$v->bom_no],['factory_id','=',$v->factory_id]])
                ->first();
            if(!empty($gn)){
                $v->name .= '-'.$gn->group_number.'-'.$gn->group_count;
            }
        }
        return $obj_list;
    }

    /**
     * 获取工艺路线预览数据
     * @param $bom_id
     * @param $routing_id
     * @param $routing_node_id
     * @return array
     */
    public function getPreviewData($bom_id,$routing_id,$routing_node_id){
//        $cache_key = make_redis_key(['bom_routing_preview',$bom_id,$routing_id,$routing_node_id]);
//        $group_arr = Cache::get($cache_key);
//        if(!empty($group_arr)) return unserialize($group_arr);
        //先准备数据
        //找到工艺路线所有步骤基本信息
        $bom_routing_base_info = DB::table(config('alias.rbrb').' as rbrb')
            ->leftJoin(config('alias.rpf').' as rpf','rpf.id','rbrb.step_id')
            ->leftJoin(config('alias.rppf').' as rppf','rppf.id','rbrb.practice_step_order_id')
            ->leftJoin(config('alias.rdlt').' as rdlt','rdlt.id','rbrb.device_id')
            ->select('rbrb.*','rpf.name','rpf.code','rppf.description','rdlt.name as device_name','rpf.description as field_description')
            ->where([['rbrb.bom_id','=',$bom_id],['rbrb.routing_id','=',$routing_id],['routing_node_id','=',$routing_node_id]])
            ->orderBy('rbrb.index','asc')
            ->get();
        //找到所有的进出料
        $material = DB::table(config('alias.rbri').' as rbri')
            ->select('rm.name as material_name','uu.commercial','rbri.material_id','rbri.is_lzp','rbri.bom_routing_base_id','rbri.use_num','rbri.type','rm.item_no as material_code','rbri.desc','rbri.POSNR')
            ->leftJoin(config('alias.uu').' as uu','uu.id','=','rbri.bom_unit_id')
            ->leftJoin(config('alias.rm').' as rm','rm.id','rbri.material_id')
            ->leftJoin(config('alias.rbrb').' as rbrb','rbrb.id','=','rbri.bom_routing_base_id')
            ->where([['rbrb.bom_id','=',$bom_id],['rbrb.routing_id','=',$routing_id],['routing_node_id','=',$routing_node_id]])
            ->orderBy('rbri.index','asc')
            ->get();
        //找到物料的属性
        $materialIds = [];
        foreach ($material as $k=>$v){
            $materialIds[] = $v->material_id;
        }
        $material_attributes = DB::table(config('alias.ma').' as ma')
            ->select('ma.value','ma.from','ad.name','uu.commercial','uu.unit_text','uu.iso_code','ma.material_id')
            ->leftJoin(config('alias.ad').' as ad','ma.attribute_definition_id','ad.id')
            ->leftJoin(config('alias.uu').' as uu','uu.id','ad.unit_id')
            ->whereIn('ma.material_id',$materialIds)->get();
        foreach ($material as $k=>&$v){
            $v->attributes = [];
            if(!$v->is_lzp){
                foreach ($material_attributes as $j=>$w){
                    if($w->material_id == $v->material_id){
                        $v->attributes[] = $w;
                    }
                }
            }else{
                $drawing = DB::table(config('alias.rmd'))->select(DB::raw('drawing_id'))
                    ->where('material_id',$v->material_id)->orderBy('id','asc')->first();
                if(!empty($drawing)){
                    $drawing_attribute = DB::table(config('alias.rda').' as rda')->select('rda.value','rdad.name')
                        ->leftJoin(config('alias.rdad').' as rdad','rdad.id','rda.attribute_definition_id')
                        ->where('rda.drawing_id',$drawing->drawing_id)
                        ->get();
                    foreach ($drawing_attribute as $j=>$w){
                        $v->attributes[] = $w;
                    }
                }
            }
        }
        //找到所有的图纸
        $drawings = DB::table(config('alias.rbrd').' as rbrd')
            ->leftJoin(config('alias.rdr').' as rdr','rdr.id','rbrd.drawing_id')
            ->leftJoin(config('alias.rbrb').' as rbrb','rbrd.bom_routing_base_id','=','rbrb.id')
            ->leftJoin(config('alias.rpf').' as rpf','rpf.id','rbrb.step_id')
            ->select('rbrd.*','rdr.image_path','rdr.name as image_name','rpf.name as step_name','rdr.code')
            ->where([['rbrb.bom_id','=',$bom_id],['rbrb.routing_id','=',$routing_id],['routing_node_id','=',$routing_node_id]])
            ->get();
        //找到所有的工作中心
        $workcenters = DB::table(config('alias.rbrw').' as rbrw')
            ->leftJoin(config('alias.rwc').' as rwc','rwc.id','rbrw.workcenter_id')
            ->leftJoin(config('alias.rbrb').' as rbrb','rbrw.bom_routing_base_id','rbrb.id')
            ->select('rwc.name','rwc.code','rbrw.workcenter_id','rbrw.bom_routing_base_id')
            ->where([['rbrb.bom_id','=',$bom_id],['rbrb.routing_id','=',$routing_id],['routing_node_id','=',$routing_node_id]])
            ->get();
        //开始组合
        //找到每个步骤能力
        $searchAbilitys = function($id){
            $ability = DB::table(config('alias.rioa').' as rioa')
                ->leftJoin(config('alias.ria').' as ria','rioa.ability_id','ria.id')
                ->select('rioa.ability_name','ria.description')->where('rioa.id',$id)->first();
            return !empty($ability)? $ability :'';
        };
        //开始分组，相同group_index为一组
        $bom_routing_base_info = obj2array($bom_routing_base_info);
        $group_arr = [];
        foreach ($bom_routing_base_info as $k=>&$v){
            $operation_abilitys = explode(',',$v['operation_ability_ids']);
            $v['abilitys'] = array_filter(array_map($searchAbilitys,$operation_abilitys));
            $v['abilitys_ids'] = array_filter($operation_abilitys);
            //找到每个步骤的进出料信息
            $v['material'] = [];
            foreach ($material as $j=>$w){
                if($w->bom_routing_base_id == $v['id']){
                    $v['material'][] = $w;
                }
            }
            $v['workcenters'] = [];
            foreach ($workcenters as $j=>$w){
                if($w->bom_routing_base_id == $v['id']){
                    $v['workcenters'][] = $w;
                }
            }
            $v['step_drawings'] = [];
            foreach ($drawings as $j=>$w){
                if($w->bom_routing_base_id == $v['id']){
                    $v['step_drawings'][] = $w;
                }
            }
            $has = false;
            $index = 0;
            foreach ($group_arr as $j=>$w){
                if($w['group_index'] == $v['group_index']){
                    $has = true;
                    $index = $j;
                    break;
                }
            }
            //mdzz，第一版搞得那么复杂，害我费了这么多脑子，现在又不用了，暂时也不删了，这边是大分组里的小分组（开始和中间为一组，结束为一组，没开始没结束为一组）
//            if($has){//在group_arr中已经有group_inde的一定是有开始和结束
//                if($v['is_start_or_end'] == 2 || $v['is_start_or_end'] == 1){//判断是否是开始和中间
//                    $group_arr[$index]['in_step_info']['step_info'][] = $v;
//                    $group_arr[$index]['in_step_info']['drawings'] = array_merge($group_arr[$index]['in_step_info']['drawings'],$v['step_drawings']);
//                }else if($v['is_start_or_end'] == 3){//判断是否是结束
//                    $group_arr[$index]['out_step_info']['step_info'][] = $v;
//                    $group_arr[$index]['out_step_info']['drawings'] = array_merge($group_arr[$index]['out_step_info']['drawings'],$v['step_drawings']);
//                }
//            }else{
//                //如果在group_index中没有且is_start_or_end为1的时候那么他自己就是一组（一定是在index排序下，因为有开始会先把开始把进去,否则就是数据填充有误）
//                if($v['is_start_or_end'] == 1){
//                    $group_arr[] = [
//                        'group_index' => $v['group_index'],
//                        'in_step_info'=> ['step_info'=>[$v],'drawings'=>$v['step_drawings']],
//                        'out_step_info'=>['step_info'=>[$v],'drawings'=>$v['step_drawings']],
//                    ];
//                }else{
//                    $group_arr[] = [
//                        'group_index' => $v['group_index'],
//                        'in_step_info'=> $v['is_start_or_end'] == 2 ? ['step_info'=>[$v],'drawings'=>$v['step_drawings']] : ['step_info'=>[],'drawings'=>[]],
//                        'out_step_info'=>$v['is_start_or_end'] == 3 ? ['step_info'=>[$v],'drawings'=>$v['step_drawings']] : ['step_info'=>[],'drawings'=>[]],
//                    ];
//                }
//            }
            if($has){
                $group_arr[$index]['step_info'][] = $v;
                $group_arr[$index]['drawings'] = array_merge($group_arr[$index]['drawings'],$v['step_drawings']);
            }else{
                $group_arr[] = [
                    'routing_node_id'=>$v['routing_node_id'],
                    'group_index' => $v['group_index'],
                    'step_info'=> [$v],
                    'drawings'=>$v['step_drawings'],
                ];
            }
        }
        //放入缓存
//        if(!empty($group_arr)) Cache::put($cache_key,serialize($group_arr),config('app.redis_timeout.brom_routing_preview'));
        return $group_arr;
    }

    /**
     * 获取排产需要的步骤组信息
     * @param $bom_id
     * @param $routing_node_id
     * @param $group_index
     */
    public function getSchedulingNeedRoutingInfo($bom_id,$routing_node_id,$group_index){
        //找到工艺路线所有步骤基本信息
        $bom_routing_base_info = DB::table(config('alias.rbrb').' as rbrb')
            ->leftJoin(config('alias.rpf').' as rpf','rpf.id','rbrb.step_id')
            ->leftJoin(config('alias.rppf').' as rppf','rppf.id','rbrb.practice_step_order_id')
            ->leftJoin(config('alias.rdlt').' as rdlt','rdlt.id','rbrb.device_id')
            ->select('rbrb.*','rpf.name','rpf.code','rppf.description','rdlt.name as device_name','rpf.description as field_description')
            ->where([['rbrb.bom_id','=',$bom_id],['rbrb.group_index','=',$group_index],['rbrb.routing_node_id','=',$routing_node_id]])
            ->orderBy('rbrb.index','asc')
            ->get();
        //找到所有的进出料
        $material = DB::table(config('alias.rbri').' as rbri')
            ->select('uu.commercial as bom_commercial','rbri.material_id','rbri.material_name','rm.item_no as material_code','rbri.is_lzp','rbri.bom_routing_base_id','rbri.use_num','rbri.type','rbri.desc','uu.id as bom_unit_id')
            ->leftJoin(config('alias.uu').' as uu','uu.id','=','rbri.bom_unit_id')
            ->leftJoin(config('alias.rbrb').' as rbrb','rbrb.id','=','rbri.bom_routing_base_id')
            ->leftJoin(config('alias.rm').' as rm', 'rbri.material_id', '=', 'rm.id')
            ->where([['rbrb.bom_id','=',$bom_id],['rbrb.group_index','=',$group_index],['rbrb.routing_node_id','=',$routing_node_id]])
            ->orderBy('rbri.index','asc')
            ->get();
        //找到物料的属性
        $materialIds = [];
        foreach ($material as $k=>$v){
            $materialIds[] = $v->material_id;
        }
        $material_attributes = DB::table(config('alias.ma').' as ma')
            ->select('ma.value','ma.from','ad.name','uu.commercial','uu.unit_text','uu.iso_code','ma.material_id')
            ->leftJoin(config('alias.ad').' as ad','ma.attribute_definition_id','ad.id')
            ->leftJoin(config('alias.uu').' as uu','uu.id','ad.unit_id')
            ->whereIn('ma.material_id',$materialIds)->get();
        foreach ($material as $k=>&$v){
            $v->attributes = [];
            if(!$v->is_lzp){
                foreach ($material_attributes as $j=>$w){
                    if($w->material_id == $v->material_id){
                        $v->attributes[] = $w;
                    }
                }
            }else{
                $drawing = DB::table(config('alias.rmd'))->select(DB::raw('drawing_id'))
                    ->where('material_id',$v->material_id)->orderBy('id','asc')->first();
                if(!empty($drawing)){
                    $drawing_attribute = DB::table(config('alias.rda').' as rda')->select('rda.value','rdad.name')
                        ->leftJoin(config('alias.rdad').' as rdad','rdad.id','rda.attribute_definition_id')
                        ->where('rda.drawing_id',$drawing->drawing_id)
                        ->get();
                    foreach ($drawing_attribute as $j=>$w){
                        $v->attributes[] = $w;
                    }
                }
            }
        }
        //找到所有的图纸
        $drawings = DB::table(config('alias.rbrd').' as rbrd')
            ->leftJoin(config('alias.rdr').' as rdr','rdr.id','rbrd.drawing_id')
            ->leftJoin(config('alias.rbrb').' as rbrb','rbrd.bom_routing_base_id','=','rbrb.id')
            ->leftJoin(config('alias.rpf').' as rpf','rpf.id','rbrb.step_id')
            ->select('rbrd.*','rdr.image_path','rdr.name as image_name','rpf.name as step_name','rdr.code')
            ->where([['rbrb.bom_id','=',$bom_id],['rbrb.group_index','=',$group_index],['rbrb.routing_node_id','=',$routing_node_id]])
            ->get();
        //找到所有的工作中心
        $workcenters = DB::table(config('alias.rbrw').' as rbrw')
            ->leftJoin(config('alias.rwc').' as rwc','rwc.id','rbrw.workcenter_id')
            ->leftJoin(config('alias.rbrb').' as rbrb','rbrw.bom_routing_base_id','rbrb.id')
            ->select('rwc.name','rwc.code','rbrw.workcenter_id','rbrw.bom_routing_base_id')
            ->where([['rbrb.bom_id','=',$bom_id],['rbrb.group_index','=',$group_index],['rbrb.routing_node_id','=',$routing_node_id]])
            ->get();
        //找到所有的附件
        $attachment = DB::table(config('alias.rbra').' as rbra')
            ->leftJoin(config('alias.attachment').' as a','a.id','=','rbra.attachment_id')
            ->leftJoin(config('alias.rbrb').' as rbrb','rbra.bom_routing_base_id','rbrb.id')
            ->select('rbra.comment','rbra.bom_routing_base_id','a.name','a.filename','a.path','a.extension')
            ->where([['rbrb.bom_id','=',$bom_id],['rbrb.group_index','=',$group_index],['rbrb.routing_node_id','=',$routing_node_id]])
            ->get();
        //开始组合
        //找到每个步骤能力
        $searchAbilitys = function($id){
            $ability = DB::table(config('alias.rioa').' as rioa')
                ->leftJoin(config('alias.ria').' as ria','rioa.ability_id','ria.id')
                ->select('rioa.ability_name','ria.description')->where('rioa.id',$id)->first();
            return !empty($ability)? $ability :'';
        };
        //开始分组
        $bom_routing_base_info = obj2array($bom_routing_base_info);
        foreach ($bom_routing_base_info as $k=>&$v){
            $operation_abilitys = explode(',',$v['operation_ability_ids']);
            $v['abilitys'] = array_filter(array_map($searchAbilitys,$operation_abilitys));
            $v['abilitys_ids'] = array_filter($operation_abilitys);
            //找到每个步骤的进出料信息
            $v['material'] = [];
            foreach ($material as $j=>$w){
                if($w->bom_routing_base_id == $v['id']){
                    $v['material'][] = $w;
                }
            }
            $v['step_drawings'] = [];
            foreach ($drawings as $j=>$w){
                if($w->bom_routing_base_id == $v['id']){
                    $v['step_drawings'][] = $w;
                }
            }
            $v['workcenters'] = [];
            foreach ($workcenters as $j=>$w){
                if($w->bom_routing_base_id == $v['id']){
                    $v['workcenters'][] = $w;
                }
            }
            $v['attachment'] = [];
            foreach ($attachment as $j=>$w){
                if($w->bom_routing_base_id == $v['id']){
                    $v['attachment'][] = $w;
                }
            }
        }
        return obj2array($bom_routing_base_info);
    }

    /**
     * 获取下载bom工艺路线数据
     * @param $bom_id
     * @param $routing_id
     */
    public function getBomRoutingDownloadData($bom_id,$routing_id){
        //1.找到工艺路线节点
        $routing_node_info = DB::table(config('alias.rpro').' as rpro')
            ->leftJoin(config('alias.rio').' as rio','rio.id','rpro.oid')
            ->select('rpro.id as routing_node_id','rpro.oid as operation_id','rpro.order','rio.name as operation_name')
            ->where([['rpro.rid','=',$routing_id],['rpro.order','<>',1]])
            ->orderBy('rpro.order','asc')
            ->get();
        foreach ($routing_node_info as $k=>&$v){
            $v->group_arr = $this->getPreviewData($bom_id,$routing_id,$v->routing_node_id);
        }
        return $routing_node_info;
    }

    /**
     * 获取包含需要复制的工序节点的bom
     * @param $input
     * @return mixed
     */
    public function getNeedCopyBomList(&$input){
        $field = [
            'rb.id',
            'rb.name',
            'rb.code',
            'rb.version',
            'rb.bom_no'
        ];
        $where = [];
        $where[] = ['rb.is_version_on','=',1];
        $where[] = ['rb.status','=',1];
        $where[] = ['rbrb.operation_id','=',$input['operation_id']];
        if(!empty($input['name'])) $where[] = ['rb.name','like','%'.$input['name'].'%'];
        if(!empty($input['code'])) $where[] = ['rb.code','like','%'.$input['code'].'%'];
        $builder = DB::table(config('alias.rbrb').' as rbrb')->select($field)
            ->leftJoin(config('alias.rb').' as rb','rb.id','rbrb.bom_id')
            ->where($where)
            ->distinct();
        if(!empty($input['bom_id'])) $builder->orWhere('rb.id',$input['bom_id']);
        $input['total_records'] = $builder->count('rb.id');
        $builder->offset(($input['page_no'] - 1) * $input['page_size'])->limit($input['page_size']);
        if(!empty($input['order']) && !empty($input['sort'])) $builder->orderBy('rb.'.$input['sort'],$input['order']);
        $obj_list = $builder->get();
        return $obj_list;
    }

    /**
     * 获取bom工艺路线节点要复制的数据
     * @param $bom_id
     * @param $operation_id
     */
    public function getNeedCopyBomRoutingNodeInfo($bom_id,$operation_id){
        //先查找出bom的工艺路线
        $routings = $this->getBomRoutings($bom_id);
        //再找到节点
        $nodes = DB::table(config('alias.rbrb').' as rbrb')
            ->select('rbrb.routing_node_id','rpro.order','rio.name','rbrb.routing_id')
            ->leftJoin(config('alias.rpro').' as rpro','rbrb.routing_node_id','rpro.id')
            ->leftJoin(config('alias.rio').' as rio','rio.id','rbrb.operation_id')
            ->where([['rbrb.bom_id','=',$bom_id],['rbrb.operation_id','=',$operation_id]])
            ->distinct()
            ->get();
        //再找各个节点信息这边代码后面刻意优化到共用$this->>getBomRouting
        $obj_list = DB::table(config('alias.rbrb').' as rbrb')
            ->leftJoin(config('alias.rpf').' as rpf','rpf.id','rbrb.step_id')
            ->leftJoin(config('alias.rppf').' as rppf','rppf.id','rbrb.practice_step_order_id')
            ->select('rbrb.*','rpf.name','rpf.code','rpf.id as field_id','rppf.description','rpf.description as field_description')
            ->where([['rbrb.bom_id','=',$bom_id],['rbrb.operation_id','=',$operation_id]])
            ->orderBy('rbrb.index','asc')
            ->get();
        foreach ($obj_list as $k=>&$v){
            $field = [
                'rm.name',
                'rm.item_no',
                'uu.commercial',
                'rbri.material_id',
                'rbri.use_num as usage_number',
                'rbri.type',
                'rbri.is_lzp',
                'rbri.step_path',
                'rbri.index',
                'rbri.desc',
                'uu.id as bom_unit_id',
                'rbri.POSNR'
            ];
            $v->material_info = DB::table(config('alias.rbri').' as rbri')->select($field)
                ->leftJoin(config('alias.rm').' as rm','rm.id','rbri.material_id')
                ->leftJoin(config('alias.uu').' as uu','uu.id','rbri.bom_unit_id')
                ->where('rbri.bom_routing_base_id',$v->id)
                ->orderBy('rbri.index','asc')
                ->get();
            $v->drawings = DB::table(config('alias.rbrd').' as rbrd')->select('rdr.id as drawing_id','rdr.name','rdr.code','rdr.image_path')
                ->leftJoin(config('alias.rdr').' as rdr','rdr.id','rbrd.drawing_id')
                ->where('rbrd.bom_routing_base_id',$v->id)
                ->get();
            $v->attachments = DB::table(config('alias.rbra').' as rbra')
                ->select('a.id as attachment_id','a.path','a.filename','rbra.comment','a.size','rrad.name as creator_name','a.ctime')
                ->leftJoin(config('alias.attachment').' as a','rbra.attachment_id','a.id')
                ->leftJoin(config('alias.rrad').' as rrad','a.creator_id','rrad.id')
                ->where('rbra.bom_routing_base_id',$v->id)
                ->get();
//            $v->workcenters = DB::table(config('alias.rbrw').' as rbrw')
//                ->leftJoin(config('alias.rwc').' as rwc','rwc.id','rbrw.workcenter_id')
//                ->where('rbrw.bom_routing_base_id',$v->id)
//                ->pluck('rbrw.workcenter_id');
        }
        //然后组合
        //把节点信息拼装进node中
        foreach ($nodes as $k=>&$v){
            $v->routing_info = [];
            foreach ($obj_list as $j=>$w){
                if($w->routing_node_id == $v->routing_node_id){
                    $v->routing_info[] = $w;
                }
            }
        }
        //把node拼装进routing中
        foreach ($routings as $k=>&$v){
            $v->nodes = [];
            foreach ($nodes as $j=>$w){
                if($w->routing_id == $v->routing_id){
                    $v->nodes[] = $w;
                }
            }
        }
        return $routings;
    }

    /**
     * 获取工时那儿需要维护的基本数量
     * 暂时挂靠在工序节点控制码中，但是不能在这控制码这儿做更新，会导致错误
     * @param $input
     * @return mixed
     * @throws \App\Exceptions\ApiException
     */
    public function getBomRoutingBaseQty($input){
        if(empty($input['bom_id']) || !is_numeric($input['bom_id'])) TEA('700','bom_id');
        if(empty($input['routing_id']) || !is_numeric($input['routing_id'])) TEA('700','routing_id');
        $where = [];
        $where[] = ['bom_id','=',$input['bom_id']];
        $where[] = ['routing_id','=',$input['routing_id']];
        if(!empty($input['routing_node_id']) || !is_numeric($input['routing_node_id'])) $where[] = ['routing_node_id','=',$input['routing_node_id']];
        $obj_list = DB::table(config('alias.rbroc'))->where($where)->get();
        return $obj_list;
    }

    /**
     * 获取能够被替换的工艺路线
     * @param $input
     * @return array
     * @throws \App\Exceptions\ApiException
     */
    public function getCanReplaceBom($input){
        if(empty($input['bom_id']) || !is_numeric($input['bom_id'])) TEA('bom_id');
        if(empty($input['routing_id']) || !is_numeric($input['routing_id'])) TEA('routing_id');
        $current_routing = DB::table(config('alias.rbr'))->where([['bom_id','=',$input['bom_id']],['routing_id','=',$input['routing_id']]])->first();
        if(empty($current_routing)) TEA(404);
        //查询出当前bom的所有工艺路线（排除自己）
        $routing_list = DB::table(config('alias.rbr').' as rbr')
            ->leftJoin(config('alias.rb').' as rb','rb.id','rbr.bom_id')
            ->leftJoin(config('alias.rm').' as rm','rm.id','rb.material_id')
            ->leftJoin(config('alias.rpr').' as rpr','rpr.id','rbr.routing_id')
            ->leftJoin(config('alias.rf').' as rf','rf.id','rbr.factory_id')
            ->select('rbr.factory_id','rbr.routing_id','rb.bom_no','rm.item_no','rpr.name as routing_name','rf.name as factory_name')
            ->where([['rbr.bom_id','=',$input['bom_id']],['rbr.routing_id','<>',$input['routing_id']],['rbr.factory_id','=',$current_routing->factory_id]])
            ->get();
        $data = [];
        foreach ($routing_list as $k=>$v){
            $routing_gn = DB::table(config('alias.rprgn'))
                ->where([['material_code','=',$v->item_no],['factory_id','=',$v->factory_id],['bom_no','=',$v->bom_no]])
                ->first();
            if(!empty($routing_gn)){
                $data[] = [
                    'routing_name'=>$v->routing_name,
                    'factory_name'=>$v->factory_name,
                    'routing_id'=>$v->routing_id,
                    'group_number'=>$routing_gn->group_number,
                    'group_count'=>$routing_gn->group_count,
                ];
            }
        }
        return $data;
    }


//endregion


//region 改

    /**
     * 修改工时那儿的基本数值
     * @param $id
     * @param $base_qty
     * @throws \App\Exceptions\ApiException
     */
    public function updateBomRoutingBaseQty($input){
        if(empty($input['id']) || !is_numeric($input['id'])) TEA('700','id');
        $has = DB::table(config('alias.rbroc'))->where('id',$input['id'])->count();
        if(!$has) TEA('404');
        if(empty($input['base_qty']) || !is_numeric($input['base_qty'])) TEA('700','base_qty');
        if(!isset($input['is_split']) || !in_array($input['is_split'],[0,1])) TEA('700','is_split');
        if(!isset($input['max_split_point']) || !is_numeric($input['max_split_point'])) TEA('700','max_split_point');
        if(!isset($input['curing_time']) || !is_numeric($input['curing_time'])) TEA('700','curing_time');
        $data = [
            'base_qty'=>$input['base_qty'],
            'is_split'=>$input['is_split'],
            'max_split_point'=>$input['max_split_point'],
            'curing_time'=>$input['curing_time'],
        ];
        $res = DB::table(config('alias.rbroc'))->where('id',$input['id'])->update($data);
        if($res === false) TEA('804');
    }

    /**
     * 保存工艺路线信息
     * @param $input_ref_arr_routing_bom_items
     * @param $bom_id
     * @throws \App\Exceptions\ApiException
     */
    public function saveBomRoutingInfo($input){
        $db_obj_list = DB::table(config('alias.rbrb'))->where([['bom_id','=',$input['bom_id']],['routing_id','=',$input['routing_id']]])->get();
        $db_obj_list = obj2array($db_obj_list);
        $db_ref_obj = [];
        foreach ($db_obj_list as $k=>$v){
            if(empty($v['routing_node_id']) || empty($v['practice_id']) || empty($v['step_id'])) unset($db_obj_list[$k]);
            $db_ref_obj[$v['routing_node_id'].'-'.$v['practice_id'].'-'.$v['step_id'].'-'.$v['index']] = $v;
        }
        $db_ids = array_keys($db_ref_obj);
        $input_ids = array_keys($input['input_ref_routing_info']);
        $set = get_array_diff_intersect($input_ids,$db_ids);
        //4.删除垃圾流转品（这个原本是应该第四步的，但是发现如果在删除工艺路线上的流转品之后做，会找不到哪些流转品需要被删除）
        $this->deleteRubbishLzp($input['lzp_list'],$input['bom_id'],$input['routing_id']);
        //1.要添加的
        if(!empty($set['add_set'])){
            $this->add($input,$set['add_set']);
        }
        //2.要删除
        if(!empty($set['del_set'])){
            $this->delete($set['del_set'],$db_ref_obj);
        }
        //3.可能要编辑的
        if(!empty($set['common_set'])){
            $this->update($input,$set['common_set'],$db_ref_obj);
        }
        //5.更新bom的工艺路线集合
        $this->saveBomRoutings($input['bom_id'],$input['input_ref_routings']);
        //6.更新工艺文件的工序控制码
        $this->saveBomRoutingControl($input['bom_id'],$input['routing_id'],$input['input_ref_control_info']);
        //6.清除缓存
        if(!empty($set)){
            $cache_key = make_redis_key([$input['bom_id'],$input['routing_id']]);
            Cache::forget($cache_key);
        }
    }

    public function saveBomRoutingControl($bom_id,$routing_id,$control_info){
        $db_control_list = DB::table(config('alias.rbroc'))->where([['bom_id','=',$bom_id],['routing_id','=',$routing_id]])->get();
        $db_control_list = obj2array($db_control_list);
        $db_ref_control_list = [];
        foreach ($db_control_list as $k=>$v){
            $db_ref_control_list[$v['routing_node_id']] = $v;
        }
        $set = get_array_diff_intersect(array_keys($control_info),array_keys($db_ref_control_list));
        try{
            DB::connection()->beginTransaction();
            if(!empty($set['add_set'])){
                $data = [];
                foreach ($set['add_set'] as $k=>$v){
                    if(empty($v)) continue;
                    $data[] = [
                        'bom_id'=>$bom_id,
                        'routing_id'=>$routing_id,
                        'routing_node_id'=>$control_info[$v]['routing_node_id'],
                        'operation_id'=>$control_info[$v]['operation_id'],
                        'control_code'=>$control_info[$v]['control_code'],
                    ];
                }
                DB::table(config('alias.rbroc'))->insert($data);
            }
            if(!empty($set['common_set'])){
                foreach ($set['common_set'] as $k=>$v){
                    if(empty($v)) continue;
                    $data = [];
                    if($db_ref_control_list[$v]['control_code'] != $control_info[$v]['control_code']) $data['control_code'] = $control_info[$v]['control_code'];
                    if($db_ref_control_list[$v]['operation_id'] != $control_info[$v]['operation_id']) $data['operation_id'] = $control_info[$v]['operation_id'];
                    if(!empty($data)){
                        DB::table(config('alias.rbroc'))->where('id',$db_ref_control_list[$v]['id'])->update($data);
                    }
                }
            }
            if(!empty($set['del_set'])){
                $data = [];
                foreach ($set['del_set'] as $k=>$v){
                    if(empty($v)) continue;
                    $data[] = $db_ref_control_list[$v]['id'];
                }
                DB::table(config('alias.rbroc'))->whereIn('id',$data)->delete();
            }
        }catch (\ApiException $e){
            DB::connection()->rollback();
            TEA($e->getCode());
        }
        DB::connection()->commit();
    }

    /**
     * 编辑工艺路线base信息
     * @param $input
     * @param $common_set
     * @param $db_routing_info
     * @throws \App\Exceptions\ApiException
     */
    public function update($input,$common_set,$db_routing_info){
        $input_routing_info = $input['input_ref_routing_info'];
        try{
            DB::connection()->beginTransaction();
            foreach ($common_set as $k => $v) {
                if (empty($v)) continue;
                $needChange = [];
                if($input_routing_info[$v]['comment'] != $db_routing_info[$v]['comment']) $needChange['comment'] = $input_routing_info[$v]['comment'];
                if($input_routing_info[$v]['description'] != $db_routing_info[$v]['old_description']) $needChange['old_description'] = empty($input_routing_info[$v]['description']) ? '' : $input_routing_info[$v]['description'];
                if($input_routing_info[$v]['operation_ability_ids'] != $db_routing_info[$v]['operation_ability_ids']) $needChange['operation_ability_ids'] = $input_routing_info[$v]['operation_ability_ids'];
                if($input_routing_info[$v]['practice_work_hour'] != $db_routing_info[$v]['practice_work_hour']) $needChange['practice_work_hour'] = $input_routing_info[$v]['practice_work_hour'];
                if($input_routing_info[$v]['index'] != $db_routing_info[$v]['index']) $needChange['index'] = $input_routing_info[$v]['index'];
                if($input_routing_info[$v]['is_start_or_end'] != $db_routing_info[$v]['is_start_or_end']) $needChange['is_start_or_end'] = $input_routing_info[$v]['is_start_or_end'];
                if($input_routing_info[$v]['operation_id'] != $db_routing_info[$v]['operation_id']) $needChange['operation_id'] = $input_routing_info[$v]['operation_id'];
                if($input_routing_info[$v]['select_type'] != $db_routing_info[$v]['select_type']) $needChange['select_type'] = $input_routing_info[$v]['select_type'];
                if($input_routing_info[$v]['group_index'] != $db_routing_info[$v]['group_index']) $needChange['group_index'] = $input_routing_info[$v]['group_index'];
                if($input_routing_info[$v]['material_category_id'] != $db_routing_info[$v]['material_category_id']) $needChange['material_category_id'] = $input_routing_info[$v]['material_category_id'];
                if($input_routing_info[$v]['practice_step_order_id'] != $db_routing_info[$v]['practice_step_order_id']) $needChange['practice_step_order_id'] = $input_routing_info[$v]['practice_step_order_id'];
                if($input_routing_info[$v]['device_id'] != $db_routing_info[$v]['device_id']) $needChange['device_id'] = $input_routing_info[$v]['device_id'];
                if(!empty($needChange)){
                    $res = DB::table(config('alias.rbrb'))->where('id',$db_routing_info[$v]['id'])->update($needChange);
                    if ($res === false) TEA('804');
                }
                //保存bom工艺路线节点的子项
                $this->saveBomRoutingItem($db_routing_info[$v]['id'],$input_routing_info[$v]['material_info'],$input,$input_routing_info[$v]['operation_id'],$input_routing_info[$v]['operation_ability_ids']);
                //保存图纸
                $this->saveBomRoutingDrawing($db_routing_info[$v]['id'],$input_routing_info[$v]['drawings']);
                //保存附件
                $this->saveBomRoutingAttachment($db_routing_info[$v]['id'],$input_routing_info[$v]['attachments']);
                //保存选中的工艺路线所关联的工作中兴
                $this->saveBomRoutingWorkcenter($db_routing_info[$v]['id'],$input_routing_info[$v]['workcenters']);
                //升级时保存工时
                if(isset($input['is_upgrade']) && $input['is_upgrade'] == 1){
                    $this->addBomRoutingWorkHourByUpgrade($input_routing_info[$v]['workHours'],$db_routing_info[$v]['id'],$input['bom_id'],$input['version'],$input['version_description']);
                }
            }
        }catch(\ApiException $exception){
            DB::connection()->rollback();
            TEA($exception->getCode());
        }
        DB::connection()->commit();
    }

    /**
     * 保存bom的工艺路线
     * @param $bom_id
     * @param $routings
     * @throws \App\Exceptions\ApiException
     */
    public function saveBomRoutings($bom_id,$routings){
        $db_bom_routings = DB::table(config('alias.rbr'))->where('bom_id',$bom_id)->get();
        $db_bom_routings = obj2array($db_bom_routings);
        $db_ref_bom_routings = [];
        foreach ($db_bom_routings as $k=>$v){
            $db_ref_bom_routings[$v['factory_id'].'-'.$v['routing_id']] = $v;
        }
        $set = get_array_diff_intersect(array_keys($routings),array_keys($db_ref_bom_routings));
        //1.要添加
        if(!empty($set['add_set'])){
            $data = [];
            foreach ($set['add_set'] as $k=>$v){
                if(empty($v)) continue;
                $data[] = [
                    'bom_id'=>$bom_id,
                    'routing_id'=>$routings[$v]['routing_id'],
                    'is_default'=>$routings[$v]['is_default'],
                    'factory_id'=>$routings[$v]['factory_id'],
                ];
            }
            if(!empty($data)){
                $res = DB::table(config('alias.rbr'))->insert($data);
                if(!$res) TEA('802');
            }
        }
        //2.要编辑
        if(!empty($set['common_set'])){
            foreach ($set['common_set'] as $k=>$v){
                if(empty($v)) continue;
                $change = [];
                if($routings[$v]['is_default'] != $db_ref_bom_routings[$v]['is_default']) $change['is_default'] = $routings[$v]['is_default'];
                if($routings[$v]['factory_id'] != $db_ref_bom_routings[$v]['factory_id']) $change['factory_id'] = $routings[$v]['factory_id'];
                if(!empty($change)){
                    DB::table(config('alias.rbr'))->where('id',$db_ref_bom_routings[$v]['id'])->update($change);
                }
            }
        }
        //3.要删除
        if(!empty($set['del_set'])){
            $del_data = [];
            foreach ($set['del_set'] as $k=>$v){
                if(empty($v)) continue;
                $del_data[] = $db_ref_bom_routings[$v]['id'];
            }
            if(!empty($del_data)){
                DB::table(config('alias.rbr'))->whereIn('id',$del_data)->delete();
            }
        }
    }


    /**
     * 保存bom工艺路线节点的附件
     * @param $bom_routing_base_id
     * @param $drawings
     * @throws \App\Exceptions\ApiException
     */
    public function saveBomRoutingDrawing($bom_routing_base_id,$drawings){
        $db_draw_list = DB::table(config('alias.rbrd'))->where('bom_routing_base_id',$bom_routing_base_id)->pluck('drawing_id');
        $db_draw_list = obj2array($db_draw_list);
        $input_drawing_list = [];
        foreach ($drawings as $k=>$v){
            if(empty($v)) continue;
            $input_drawing_list[$v['drawing_id']] = $v;
        }
        $set = get_array_diff_intersect(array_keys($input_drawing_list),$db_draw_list);
        //1.要添加
        if(!empty($set['add_set'])){
            $data = [];
            foreach ($set['add_set'] as $k=>$v){
                if(empty($v)) continue;
                $data[] = [
                    'bom_routing_base_id'=>$bom_routing_base_id,
                    'drawing_id'=>$v,
                ];
            }
            $res = DB::table(config('alias.rbrd'))->insert($data);
            if(!$res) TEA('802');
        }
        //2.要删除
        if(!empty($set['del_set'])){
            foreach ($set['del_set'] as $k=>$v){
                $res = DB::table(config('alias.rbrd'))->where([['bom_routing_base_id','=',$bom_routing_base_id],['drawing_id','=',$v]])->delete();
                if(!$res) TEA('803');
            }
        }
        //3.要编辑（暂时不考虑）
    }

    /**
     * 保存bom工艺路线节点的附件
     * @param $bom_routing_base_id
     * @param $attachments
     * @throws \App\Exceptions\ApiException
     */
    public function saveBomRoutingAttachment($bom_routing_base_id,$attachments){
        $db_attachment_list = DB::table(config('alias.rbra'))->select('attachment_id','comment')->where('bom_routing_base_id','=',$bom_routing_base_id)->get();
        $db_ref_attachment_list = [];
        $db_attachment_list = obj2array($db_attachment_list);
        foreach ($db_attachment_list as $k=>$v){
            $db_ref_attachment_list[$v['attachment_id']] = $v;
        }
        $input_ref_attachment_list = [];
        foreach ($attachments as $k=>$v){
            $input_ref_attachment_list[$v['attachment_id']] = $v;
        }
        $set = get_array_diff_intersect(array_keys($input_ref_attachment_list),array_keys($db_ref_attachment_list));
        //要添加
        if(!empty($set['add_set'])){
            $data = [];
            foreach ($set['add_set'] as $k=>$v){
                if(empty($v)) continue;
                $data[] = [
                    'bom_routing_base_id'=>$bom_routing_base_id,
                    'attachment_id'=>$v,
                    'comment'=>$input_ref_attachment_list[$v]['comment'],
                ];
            }
            $res = DB::table(config('alias.rbra'))->insert($data);
            if(!$res) TEA('802');
        }
        //要删除
        if(!empty($set['del_set'])){
            foreach ($set['del_set'] as $k=>$v){
                $res = DB::table(config('alias.rbra'))->where([['bom_routing_base_id','=',$bom_routing_base_id],['attachment_id','=',$v]])->delete();
                if(!$res) TEA('803');
            }
        }
        //3.要编辑
        if(!empty($set['common_set'])){
            foreach ($set['common_set'] as $k=>$v){
                $change = [];
                if($input_ref_attachment_list[$v]['comment'] != $db_ref_attachment_list[$v]['comment']) $change['comment'] = $input_ref_attachment_list[$v]['comment'];
                if(!empty($change)){
                    $res = DB::table(config('alias.rbra'))->where([['bom_routing_base_id','=',$bom_routing_base_id],['attachment_id','=',$v]])->update($change);
                    if(!$res) TEA('803');
                }
            }
        }
    }

    /**
     * 保存每个节点上的进出料
     * @param $bom_routing_base_id
     * @param $material_list
     * @param $input
     * @param $operation_id
     * @param $operation_ability_ids
     * @throws \App\Exceptions\ApiException
     */
    public function saveBomRoutingItem($bom_routing_base_id,$material_list,$input){
        $db_material_list = DB::table(config('alias.rbri'))->where('bom_routing_base_id',$bom_routing_base_id)->get();
        $db_ref_material_list = [];
        $db_material_list = obj2array($db_material_list);
        foreach ($db_material_list as $k=>$v){
            if(empty($v)) continue;
            $db_ref_material_list[$v['type'].'-'.$v['material_id']] = $v;
        }
        $input_ref_material_list = [];
        foreach ($material_list as $k=>$v){
            if(empty($v)) continue;
            $input_ref_material_list[$v['type'].'-'.$v['material_id']] = $v;
        }
        $set = get_array_diff_intersect(array_keys($input_ref_material_list),array_keys($db_ref_material_list));
        //1.要添加
        if(!empty($set['add_set'])){
            $this->addBomRoutingItem($set['add_set'],$input_ref_material_list,$input,$bom_routing_base_id);
        }
        //2.要删除
        if(!empty($set['del_set'])){
            $this->delBomRoutingItem($set['del_set'],$db_ref_material_list);
        }
        //3.要更新
        if(!empty($set['common_set'])){
            $this->updateBomRoutingItem($set['common_set'],$input_ref_material_list,$db_ref_material_list);
        }
    }

    /**
     * 保存工艺节点选中的能力所关联的工作中心
     * @param $bom_routing_base_id
     * @param $ability_workcenter_list
     */
    public function saveBomRoutingWorkcenter($bom_routing_base_id,$workcenters){
        $db_workcenter = DB::table(config('alias.rbrw'))->where('bom_routing_base_id',$bom_routing_base_id)->get();
        $db_workcenter = obj2array($db_workcenter);
        $db_ref_workcenter = [];
        foreach ($db_workcenter as $k=>$v){
            $db_ref_workcenter[$v['workcenter_id']] = $v;
        }
        $set = get_array_diff_intersect($workcenters,array_keys($db_ref_workcenter));
        //要添加
        if(!empty($set['add_set'])){
            $add_data = [];
            foreach ($set['add_set'] as $k=>$v){
                if(empty($v)) continue;
                $add_data[] = [
                    'bom_routing_base_id'=>$bom_routing_base_id,
                    'workcenter_id'=>$v,
                ];
            }
            DB::table(config('alias.rbrw'))->insert($add_data);
        }
        //要编辑（暂不考虑）
        //要删除
        if(!empty($set['del_set'])){
            $del_data = [];
            foreach ($set['del_set'] as $k=>$v){
                if(empty($v)) continue;
                $del_data[] = $db_ref_workcenter[$v]['id'];
            }
            DB::table(config('alias.rbrw'))->whereIn('id',$del_data)->delete();
        }
    }

    /**
     * 修改节点的进出料
     * @param $common_set
     * @param $input_ref_material_list
     * @param $db_ref_material_list
     * @param $operation_id
     * @param $operation_ability_ids
     * @throws \App\Exceptions\ApiException
     */
    public function updateBomRoutingItem($common_set,$input_ref_material_list,$db_ref_material_list){
        foreach ($common_set as $k=>$v){
            if(empty($v)) continue;
//            $materialField = [
//                'rm.id',
//                'rm.item_no',
//                'rm.material_category_id',
//                'rm.name',
//                'rmc.name as material_category_name',
//                'rm.unit_id',
//                'uu.name as unit_name',
//                'uu.commercial'
//            ];
//            $material = DB::table(config('alias.rm').' as rm')->select($materialField)
//                ->leftJoin(config('alias.rmc').' as rmc','rmc.id','rm.material_category_id')
//                ->leftJoin(config('alias.uu').' as uu','uu.id','rm.unit_id')
//                ->where('rm.id',$input_ref_material_list[$v]['material_id'])
//                ->first();
            $change = [];
            if($input_ref_material_list[$v]['usage_number'] != $db_ref_material_list[$v]['use_num']) $change['use_num'] = $input_ref_material_list[$v]['usage_number'];
            if($input_ref_material_list[$v]['step_path'] != $db_ref_material_list[$v]['step_path']) $change['step_path'] = $input_ref_material_list[$v]['step_path'];
            if($input_ref_material_list[$v]['is_lzp'] != $db_ref_material_list[$v]['is_lzp']) $change['is_lzp'] = $input_ref_material_list[$v]['is_lzp'];
            if($input_ref_material_list[$v]['index'] != $db_ref_material_list[$v]['index']) $change['index'] = $input_ref_material_list[$v]['index'];
            if($input_ref_material_list[$v]['desc'] != $db_ref_material_list[$v]['desc']) $change['desc'] = $input_ref_material_list[$v]['desc'];
            if($input_ref_material_list[$v]['bom_unit_id'] != $db_ref_material_list[$v]['bom_unit_id']) $change['bom_unit_id'] = $input_ref_material_list[$v]['bom_unit_id'];
            if($input_ref_material_list[$v]['POSNR'] != $db_ref_material_list[$v]['POSNR']) $change['POSNR'] = $input_ref_material_list[$v]['POSNR'];
//            if($material->item_no != $db_ref_material_list[$v]['material_code']) $change['material_code'] = $input_ref_material_list[$v]['material_code'];
//            if($material->material_category_id != $db_ref_material_list[$v]['material_category_id']) $change['material_category_id'] = $input_ref_material_list[$v]['material_category_id'];
//            if($material->material_category_name != $db_ref_material_list[$v]['material_category_name']) $change['material_category_name'] = $input_ref_material_list[$v]['material_category_name'];
//            if($material->name != $db_ref_material_list[$v]['material_name']) $change['material_name'] = $input_ref_material_list[$v]['material_name'];
//            if($material->unit_id != $db_ref_material_list[$v]['unit_id']) $change['unit_id'] = $input_ref_material_list[$v]['unit_id'];
//            if($material->unit_name != $db_ref_material_list[$v]['unit_name']) $change['unit_name'] = $input_ref_material_list[$v]['unit_name'];
//            if($material->commercial != $db_ref_material_list[$v]['commercial']) $change['commercial'] = $input_ref_material_list[$v]['commercial'];
            if(!empty($change)){
                $res = DB::table(config('alias.rbri'))->where('id',$db_ref_material_list[$v]['id'])->update($change);
//                if($res === false) TEA('804');
            }
        }

    }

    /**
     * 替换bom的工艺路线的组号
     * @param $input
     */
    public function replaceBomRoutingGn($input){
        if(empty($input['bom_id']) || !is_numeric($input['bom_id'])) TEA('700','bom_id');
        if(empty($input['current_routing_id']) || !is_numeric($input['current_routing_id'])) TEA('700','current_routing_id');
        if(empty($input['need_replace_routing_id']) || !is_numeric($input['need_replace_routing_id'])) TEA('700','need_replace_routing_id');
        //找到bom的物料信息
        $bom = DB::table(config('alias.rb').' as rb')
            ->leftJoin(config('alias.rm').' as rm','rb.material_id','rm.id')
            ->select('rm.item_no','rb.bom_no','rb.is_version_on')->where('rb.id',$input['bom_id'])->first();
        if(empty($bom)) TEA('404');
        if(empty($bom->is_version_on)) TEA('1147');
        //查找该bom想要替换的工艺路线
        $current_bom_routing = DB::table(config('alias.rbr'))->where([['bom_id','=',$input['bom_id']],['routing_id','=',$input['current_routing_id']]])->first();
        if(empty($current_bom_routing)) TEA('1139');
        //查找该bom想要被替换的工艺路线
        $need_replace_bom_routing = DB::table(config('alias.rbr'))->where([['bom_id','=',$input['bom_id']],['routing_id','=',$input['need_replace_routing_id']]])->first();
        if(empty($need_replace_bom_routing)) TEA('1145');
        if($current_bom_routing->factory_id != $need_replace_bom_routing->factory_id) TEA('1148');
        //查找当前工艺路线是否同步过
        $current_has = DB::table(config('alias.rprgn'))
            ->where([['material_code','=',$bom->item_no],['bom_no','=',$bom->bom_no],['factory_id','=',$current_bom_routing->factory_id],['routing_id','=',$current_bom_routing->routing_id]])
            ->first();
        //查找要被替换的工艺路线
        $need_replace_has = DB::table(config('alias.rprgn'))
            ->where([['material_code','=',$bom->item_no],['bom_no','=',$bom->bom_no],['factory_id','=',$need_replace_bom_routing->factory_id],['routing_id','=',$need_replace_bom_routing->routing_id]])
            ->first();
        if(empty($need_replace_has)) TEA('1149');
        try{
            DB::connection()->beginTransaction();
            if(empty($current_has) && !empty($need_replace_has)){
                DB::table(config('alias.rprgn'))->where('id',$need_replace_has->id)->update(['routing_id'=>$current_bom_routing->routing_id]);
            }else if(!empty($current_has) && !empty($need_replace_has)){
                DB::table(config('alias.rprgn'))->where('id',$current_has->id)->update(['routing_id'=>$need_replace_bom_routing->routing_id]);
                DB::table(config('alias.rprgn'))->where('id',$need_replace_has->id)->update(['routing_id'=>$current_bom_routing->routing_id]);
            }

        }catch (\ApiException $e){
            DB::connection()->rollback();
            TEA($e->getCode());
        }
        DB::connection()->commit();
    }


//endregion

//region 删

    /**
     * 删除工艺路线上节点所有数据
     * @param $del_set
     * @param $db_routing_info
     * @throws \App\Exceptions\ApiException
     */
    public function delete($del_set,$db_routing_info){
        try{
            DB::connection()->beginTransaction();
            foreach ($del_set as $k => $v) {
                if(empty($v)) continue;
                DB::table(config('alias.rbrb'))->where('id',$db_routing_info[$v]['id'])->delete();
                DB::table(config('alias.rbri'))->where('bom_routing_base_id',$db_routing_info[$v]['id'])->delete();
                DB::table(config('alias.rbrd'))->where('bom_routing_base_id',$db_routing_info[$v]['id'])->delete();
                DB::table(config('alias.rbra'))->where('bom_routing_base_id',$db_routing_info[$v]['id'])->delete();
                DB::table(config('alias.rbrw'))->where('bom_routing_base_id',$db_routing_info[$v]['id'])->delete();
            }
        }catch(\ApiException $exception){
            DB::connection()->rollback();
            TEA($exception->getCode());
        }
        DB::connection()->commit();
    }

    /**
     * 删除bom上的垃圾流转品
     * @param $lzp_list
     * @param $bom_id
     * @param $routing_id
     * @throws \App\Exceptions\ApiException
     */
    public function deleteRubbishLzp($lzp_list,$bom_id,$routing_id){
        $db_lzp_list = DB::table(config('alias.rbri'))->where([['bom_id','=',$bom_id],['routing_id','=',$routing_id],['is_lzp','=',1]])->pluck('material_id');
        $del_set = array_diff(obj2array($db_lzp_list),$lzp_list);
        $del_set = array_unique($del_set);
        try{
            DB::connection()->beginTransaction();
            $materialDao = new Material();
            foreach ($del_set as $k=>$v){
                //判断流转品是否已经被别的bom的工艺路线使用
                $routingHas = $this->isExisted([['material_id','=',$v]],config('alias.rbri'));
                //判断是否已经被bom子项使用
                $bomItemHas = $this->isExisted([['material_id','=',$v]],config('alias.rbi'));
                //判断是否已经生成多个版本
                $num = DB::table(config('alias.rb') )->where('material_id',"=",$v)->count();
                if($routingHas<=1 && !$bomItemHas && $num <= 1){
                    $bom = DB::table(config('alias.rb'))->select('id as bom_id')->where([['material_id','=',$v],['is_version_on','=',1]])->first();
                    //删除bom
                    if(!empty($bom)){
                        DB::table(config('alias.rb') )->where('id',"=",$bom->bom_id)->delete();
                        //找出bom_item
                        $bom_items = DB::table(config('alias.rbi') )->where('bom_id',"=",$bom->bom_id)->get();
                        //删除bom_item
                        DB::table(config('alias.rbi') )->where('bom_id',"=",$bom->bom_id)->delete();
                        //删除阶梯用量
                        $items  = array();
                        foreach ($bom_items as $bom_item){
                            $items[] = $bom_item->id;
                        }
                        if(!empty($items)){
                            DB::table(config('alias.rbiql') )->whereIN('bom_item_id',$items)->delete();
                        }
                    }
                    //1.删除该物料的物料属性
                    $materialDao->destroyMaterialAttribute($v,!empty(session('administrator')->admin_id)?session('administrator')->admin_id:0);
                    //2.删除该物料的工艺属性
                    $materialDao->destroyOperationAttribute($v,!empty(session('administrator')->admin_id)?session('administrator')->admin_id:0);
                    //3.删除图纸
                    $materialDao->destroyDrawing($v);
                    //4.删除附件
                    $materialDao->destroyAttachment($v);
                    //5.删除物料关联工序得到的工时
                    $materialDao->destoryWorkHour($v);
                    //5.删除物料
                    $materialDao->destroyById($v);
                    //6.删除流转品和bom的关联
                    DB::table(config('alias.rbrl'))->where([['material_id','=',$v],['bom_id','=',$bom_id],['routing_id','=',$routing_id]])->delete();
                }
            }
        }catch(\ApiException $exception){
            DB::connection()->rollback();
            TEA($exception->getCode());
        }
        DB::connection()->commit();
    }

    /**
     * 删除bom的工艺路线
     * @param $bom_id
     * @param $routing_id
     * @throws \App\Exceptions\ApiException
     */
    public function deleteBomRouting($bom_id,$routing_id){
        try{
            DB::connection()->beginTransaction();
            //删除bom工艺路线的关联
            DB::table(config('alias.rbr'))->where([['bom_id','=',$bom_id],['routing_id','=',$routing_id]])->delete();
            //查找bom工艺路线base的id
            $ids = DB::table(config('alias.rbrb'))->where([['bom_id','=',$bom_id],['routing_id','=',$routing_id]])->pluck('id');
//            $ids = obj2array($ids);
            //删除bom工艺路线的base的子项
            DB::table(config('alias.rbri'))->whereIn('bom_routing_base_id',$ids)->delete();//进出料
            DB::table(config('alias.rbrd'))->whereIn('bom_routing_base_id',$ids)->delete();//图片
            DB::table(config('alias.rbra'))->whereIn('bom_routing_base_id',$ids)->delete();//附件
            DB::table(config('alias.rbrw'))->whereIn('bom_routing_base_id',$ids)->delete();//工作中心
            DB::table(config('alias.rimw'))->whereIn('step_info_id',$ids)->delete();//工时列表
            DB::table(config('alias.spiv'))->whereIn('step_info_id',$ids)->delete();//工时列表
            //删除控制码信息
            DB::table(config('alias.rbroc'))->where([['bom_id','=',$bom_id],['routing_id','=',$routing_id]])->delete();
            //删除bom工艺路线绑定的流转品信息
            DB::table(config('alias.rbrl'))->where([['bom_id','=',$bom_id],['routing_id','=',$routing_id]])->delete();
            //最后删除bom工艺路线的base
            DB::table(config('alias.rbrb'))->where([['bom_id','=',$bom_id],['routing_id','=',$routing_id]])->delete();
            //更新bom的工艺路线集合
//            $this->saveBomRoutings($bom_id,json_decode($routings,true));
        }catch(\ApiException $exception){
            DB::connection()->rollback();
            TEA($exception->getCode());
        }
        DB::connection()->commit();
    }

    /**
     * 删除工艺路线上的节点的进出料
     * @param $del_set
     * @param $db_ref_material_list
     */
    public function delBomRoutingItem($del_set,$db_ref_material_list){
        foreach ($del_set as $k=>$v){
            if(empty($v)) continue;
            DB::table(config('alias.rbri'))->where('id',$db_ref_material_list[$v]['id'])->delete();
        }
    }

    /**
     * 添加进料时，删除流转品和bom的工艺路线关系
     * @param $bom_id
     * @param $routing_id
     * @param $material_id
     * @throws \App\Exceptions\ApiException
     */
    public function deleteEnterMaterialLzp($bom_id,$routing_id,$material_id){
        $res = DB::table(config('alias.rbrl'))->where([['bom_id','=',$bom_id],['routing_id','=',$routing_id],['material_id','=',$material_id]])->delete();
        if($res === false) TEA('803');
    }

//endregion
}