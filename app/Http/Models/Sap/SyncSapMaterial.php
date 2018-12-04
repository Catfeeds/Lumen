<?php
/**
 * Created by PhpStorm.
 * User: zhufeng
 * Date: 2018/8/28
 * Time: 下午4:04
 */

namespace App\Http\Models\Sap;
use App\Http\Models\Base;
use Illuminate\Support\Facades\DB;

/**
 * 同步 SAP Material 模型
 * Class syncSapMaterial
 * @package App\Http\Models\Sap
 * @author Bruce.Chu
 */
class SyncSapMaterial extends Base
{
    public function __construct()
    {
        parent::__construct();
        $this->table = config('alias.rm');
    }

    /**
     * 同步
     * @param $input
     */
    public function syncSapMaterial($input)
    {
        //先组合物料基础信息
        $material_data = $this->groupMaterialData($input['MARA']);
        $material_attr_data = $this->groupAttrData($input['ZTWLCC']);
        $material_marc = $this->groupMarcData($input['MARC']);
        $material_marm = $this->groupMarcData($input['MARM']);
        //添加数据
//        DB::connection()->beginTransaction();
        try{
            foreach ($material_data as $k=>$v){
                //判断物料是否已存在
                $material = DB::table(config('alias.rm'))->where('item_no',$v['MATNR'])->select('id')->first();
                if(!empty($material)){
                    $base_data = [
                        'material_category_id'=>!empty($v['material_type_id']) ? $v['material_type_id'] : (!empty($v['material_big_type_id']) ? $v['material_big_type_id'] : 0),//物料分类
                        'sap_big_material_type_id'=>!empty($v['material_big_type_id']) ? $v['material_big_type_id'] : 0,//sap物料大类
                        'name'=>$v['ZMA001'],//物料名称
                        'description'=>$v['MAKTX'],//描述
                        'is_ecm'=>($v['MSTAE'] == 'Z1' || $v['MSTAE'] == 'z1') ? 1 :0,
                        'unit_id'=>!empty($v['unit_id']) ? $v['unit_id'] : 0,//单位
                        'mtime'=>time(),//最后修改时间
                    ];
                    DB::table(config('alias.rm'))->where('id',$material->id)->update($base_data);
                    $materialId = $material->id;
                }else{
                    $identify = $this->identityCard(empty($material_attr_data[$k]) ? [] : $material_attr_data[$k]);
                    $base_data = [
                        'uuid'=>create_uuid(),//分布式uuid
                        'identity_card'=>$identify['identity_card_md5'],//身份识别码
                        'identity_card_string'=>$identify['identity_card_string'],
                        'material_attribute_ids'=>$identify['material_attribute_ids'],
                        'material_category_id'=>!empty($v['material_type_id']) ? $v['material_type_id'] : (!empty($v['material_big_type_id']) ? $v['material_big_type_id'] : 0),//物料分类
                        'sap_big_material_type_id'=>!empty($v['material_big_type_id']) ? $v['material_big_type_id'] : 0,//sap物料大类
                        'item_no'=>$v['MATNR'],//物料编码
                        'name'=>$v['ZMA001'],//物料名称
                        'description'=>$v['MAKTX'],//描述
                        'is_ecm'=>($v['MSTAE'] == 'Z1' || $v['MSTAE'] == 'z1') ? 1 :0,
                        'unit_id'=>!empty($v['unit_id']) ? $v['unit_id'] : 0,//单位
                        'mtime'=>time(),//最后修改时间
                        'ctime'=>time(),//创建时间
                    ];
                    $materialId = DB::table(config('alias.rm'))->insertGetId($base_data);
                }
                $this->saveMaterialAttribute($materialId,empty($material_attr_data[$k]) ? [] : $material_attr_data[$k]);
                $this->saveMaterialMarc($materialId,empty($material_marc[$k]) ? [] : $material_marc[$k]);
                $this->saveMaterialMarm($materialId,empty($material_marm[$k]) ? [] : $material_marm[$k]);
            }
        }catch(\ApiException $e){
//            DB::connection()->rollback();
            TESAP('500', $e->getMessage());
        }
//        DB::connection()->commit();
    }


    public function saveMaterialAttribute($materialId,$attributes){
        $db_attr = DB::table(config('alias.ma'))->where('material_id',$materialId)->get();
        $db_attr = obj2array($db_attr);
        $db_ref_attr = [];
        foreach ($db_attr as $k=>$v){
            $db_ref_attr[$v['attribute_definition_id']] = $v;
        }
        $set = get_array_diff_intersect(array_keys($attributes),array_keys($db_ref_attr));
        if(!empty($set['add_set'])){
            $add_data = [];
            foreach ($set['add_set'] as $k=>$v){
                if(empty($v)) continue;
                $add_data[] = [
                    'material_id'=>$materialId,
                    'attribute_definition_id'=>$v,
                    'value'=>$attributes[$v]['value'],
                    'from'=>3,
                ];
            }
            DB::table(config('alias.ma'))->insert($add_data);
        }
        if(!empty($set['common_set'])){
            foreach ($set['common_set'] as $k=>$v){
                if(empty($v)) continue;
                $change = [];
                if($attributes[$v]['value'] != $db_ref_attr[$v]['value']) $change['value'] = $attributes[$v]['value'];
                if(!empty($change)) DB::table(config('alias.ma'))->where('id',$db_ref_attr[$v]['id'])->update($change);
            }
        }
        if(!empty($set['del_set'])){
            $del_data = [];
            foreach ($set['del_set'] as $k=>$v){
                if(empty($v)) continue;
                $del_data[] = $db_ref_attr[$v]['id'];
            }
            DB::table(config('alias.ma'))->whereIn('id',$del_data)->delete();
        }
    }

    public function saveMaterialMarc($material_id,$marc){
        $db_marc = DB::table(config('alias.ramc'))->where('material_id',$material_id)->get();
        $db_marc = obj2array($db_marc);
        $db_ref_marc = [];
        foreach ($db_marc as $k=>$v){
            $db_ref_marc[$v['WERKS']] = $v;
        }
        $input_ref_marc = [];
        foreach ($marc as $k=>$v){
            $input_ref_marc[$v['WERKS']] = $v;
        }
        $set = get_array_diff_intersect(array_keys($input_ref_marc),array_keys($db_ref_marc));
        if(!empty($set['add_set'])){
            $data = [];
            foreach ($set['add_set'] as $k=>$v){
                if(empty($v)) continue;
                $data[] = [
                    'MATNR'=>$input_ref_marc[$v]['MATNR'],
                    'material_id'=>$material_id,
                    'WERKS'=>$v,
                    'FEVOR'=>$input_ref_marc[$v]['FEVOR'],
                    'AUSME'=>$input_ref_marc[$v]['AUSME'],
                    'XCHAR'=>$input_ref_marc[$v]['XCHAR'],
                    'MMSTA'=>$input_ref_marc[$v]['MMSTA'],
                    'LGPRO'=>!empty($input_ref_marc[$v]['LGPRO']) ? $input_ref_marc[$v]['LGPRO'] : '',
                    'SBDKZ'=>$input_ref_marc[$v]['SBDKZ'],
                    'UNETO'=>$input_ref_marc[$v]['UNETO'],
                    'UEETO'=>$input_ref_marc[$v]['UEETO'],
                    'UEETK'=>$input_ref_marc[$v]['UEETK'],
                    'VERKZ'=>$input_ref_marc[$v]['VERKZ'],
                    'LGFSB'=>!empty($input_ref_marc[$v]['LGFSB']) ? $input_ref_marc[$v]['LGFSB'] : '',
                ];
            }
            DB::table(config('alias.ramc'))->insert($data);
        }
        if(!empty($set['common_set'])){
            foreach ($set['common_set'] as $k=>$v){
                if(empty($v)) continue;
                $change = [];
                if($db_ref_marc[$v]['FEVOR'] != $input_ref_marc[$v]['FEVOR']) $change['FEVOR'] = $input_ref_marc[$v]['FEVOR'];
                if($db_ref_marc[$v]['AUSME'] != $input_ref_marc[$v]['AUSME']) $change['AUSME'] = $input_ref_marc[$v]['AUSME'];
                if($db_ref_marc[$v]['XCHAR'] != $input_ref_marc[$v]['XCHAR']) $change['XCHAR'] = $input_ref_marc[$v]['XCHAR'];
                if($db_ref_marc[$v]['MMSTA'] != $input_ref_marc[$v]['MMSTA']) $change['MMSTA'] = $input_ref_marc[$v]['MMSTA'];
                if(!empty($input_ref_marc[$v]['LGPRO'])){
                    if($db_ref_marc[$v]['LGPRO'] != $input_ref_marc[$v]['LGPRO']) $change['LGPRO'] = $input_ref_marc[$v]['LGPRO'];
                }
                if($db_ref_marc[$v]['SBDKZ'] != $input_ref_marc[$v]['SBDKZ']) $change['SBDKZ'] = $input_ref_marc[$v]['SBDKZ'];
                if($db_ref_marc[$v]['UNETO'] != $input_ref_marc[$v]['UNETO']) $change['UNETO'] = $input_ref_marc[$v]['UNETO'];
                if($db_ref_marc[$v]['UEETO'] != $input_ref_marc[$v]['UEETO']) $change['UEETO'] = $input_ref_marc[$v]['UEETO'];
                if($db_ref_marc[$v]['UEETK'] != $input_ref_marc[$v]['UEETK']) $change['UEETK'] = $input_ref_marc[$v]['UEETK'];
                if($db_ref_marc[$v]['VERKZ'] != $input_ref_marc[$v]['VERKZ']) $change['VERKZ'] = $input_ref_marc[$v]['VERKZ'];
                if(!empty($input_ref_marc[$v]['LGFSB'])){
                    if($db_ref_marc[$v]['LGFSB'] != $input_ref_marc[$v]['LGFSB']) $change['LGFSB'] = $input_ref_marc[$v]['LGFSB'];
                }
                if(!empty($change)) DB::table(config('alias.ramc'))->where('id',$db_ref_marc[$v]['id'])->update($change);
            }
        }
        if(!empty($set['del_set'])){
            $data = [];
            foreach ($set['del_set'] as $k=>$v){
                if(empty($v)) continue;
                $data[] = $db_ref_marc[$v]['id'];
            }
            DB::table(config('alias.ramc'))->whereIn('id',$data)->delete();
        }
    }

    public function saveMaterialMarm($material_id,$marm){
        $db_marm = DB::table(config('alias.ramm'))->where('material_id',$material_id)->get();
        $db_marm = obj2array($db_marm);
        $db_ref_marm = [];
        foreach ($db_marm as $k=>$v){
            $db_ref_marm[$v['MEINH']] = $v;
        }
        $input_ref_marm = [];
        foreach ($marm as $k=>$v){
            $input_ref_marm[$v['MEINH']] = $v;
        }
        $set = get_array_diff_intersect(array_keys($input_ref_marm),array_keys($db_ref_marm));
        if(!empty($set['add_set'])){
            $data = [];
            foreach ($set['add_set'] as $k=>$v){
                if(empty($v)) continue;
                $data[] = [
                    'MATNR'=>$input_ref_marm[$v]['MATNR'],
                    'material_id'=>$material_id,
                    'UMREZ'=>$input_ref_marm[$v]['UMREZ'],
                    'UMREN'=>$input_ref_marm[$v]['UMREN'],
                    'MEINH'=>$input_ref_marm[$v]['MEINH'],
                ];
            }
            DB::table(config('alias.ramm'))->insert($data);
        }
        if(!empty($set['common_set'])){
            foreach ($set['common_set'] as $k=>$v){
                if(empty($v)) continue;
                $change = [];
                if($db_ref_marm[$v]['UMREZ'] != $input_ref_marm[$v]['UMREZ']) $change['UMREZ'] = $input_ref_marm[$v]['UMREZ'];
                if($db_ref_marm[$v]['UMREN'] != $input_ref_marm[$v]['UMREN']) $change['UMREN'] = $input_ref_marm[$v]['UMREN'];
                if($db_ref_marm[$v]['MEINH'] != $input_ref_marm[$v]['MEINH']) $change['MEINH'] = $input_ref_marm[$v]['MEINH'];
                if(!empty($change)) DB::table(config('alias.ramm'))->where('material_id',$material_id)->update($change);
            }
        }
        if(!empty($set['del_set'])){
            $data = [];
            foreach ($set['del_set'] as $k=>$v){
                if(empty($v)) continue;
                $data[] = $db_ref_marm[$v]['id'];
            }
            DB::table(config('alias.ramm'))->whereIn('id',$data)->delete();
        }
    }

    public function groupMaterialData($material_data){
        //先取得物料信息物料分类信息,以物料编码做键
        //物料
        $material_info_code_key = [];
        //物料类型
        $type_codes = [];
        //单位
        $unit_info = [];
        foreach ($material_data as $k=>&$v){
            //物料
            $v['MATNR'] = preg_replace('/^0+/','',$v['MATNR']);
            $material_info_code_key[$v['MATNR']] = $v;
            //物料类型
            if(!in_array($v['MATKL'],$type_codes) && !empty($v['MATKL'])){
                $type_codes[] = $v['MATKL'];
            }
            if(!in_array($v['MTART'],$type_codes) && !empty($v['MTART'])){
                $type_codes[] = $v['MTART'];
            }
            //单位
            if(!in_array(strtolower($v['MEINS']),$unit_info)){
                $unit_info[] = strtolower($v['MEINS']);
            }
        }
        //查询出物料类型id
        $db_types = DB::table(config('alias.rmc'))->whereIn('code',$type_codes)->select('id as material_type_id','code')->get();
        //查询出单位id
        $db_units = DB::table(config('alias.ruu'))->whereIn('commercial',$unit_info)->select('id as unit_id','commercial')->get();
        //映射进物料
        foreach ($material_info_code_key as $k=>&$v){
            foreach ($db_types as $j=>$w){
                if($v['MATKL'] == $w->code){
                    $v['material_type_id'] = $w->material_type_id;
                }
                if($v['MTART'] == $w->code){
                    $v['material_big_type_id'] = $w->material_type_id;
                }
            }
            foreach ($db_units as $j=>$w){
                if(strtolower($v['MEINS']) == strtolower($w->commercial)){
                    $v['unit_id'] = $w->unit_id;
                    break;
                }
            }
        }
        return $material_info_code_key;
    }


    public function groupAttrData($attr_data){
        //已经有属性定义的属性和值
        $material_attr = [];
        foreach ($attr_data as $k=>&$v){
            $v['MATNR'] = preg_replace('/^0+/','',$v['MATNR']);
            $material_attr[$v['MATNR']] = [];
            //查找物料属性定义是否存在
            for($i = 1;$i <= 15;$i++){
                $x = 'ZATNAM'.str_pad($i,2,0,STR_PAD_LEFT);
                $y = 'ZATBEZ'.str_pad($i,2,0,STR_PAD_LEFT);
                $z = 'ZATWRT'.str_pad($i,2,0,STR_PAD_LEFT);
                if(empty($v[$x])) continue;
                $attr_define = DB::table(config('alias.ad'))->where('key',$v[$x])->select('id as attr_id','key')->first();
                if(!empty($attr_define)){
                    //存在
                    $material_attr[$v['MATNR']][$attr_define->attr_id] = [
                        'attribute_definition_id'=>$attr_define->attr_id,
                        'value'=>($v[$z] == 'default') ? '' : $v[$z],
                    ];
                }else{
                    //不存在添加属性定义
                    $data = [
                        'key'=>$v[$x],
                        'name'=>$v[$y],
                        'datatype_id'=>3,
                        'range'=>'{}',
                        'comment'=>'',
                        'category_id'=>3,
                        'from'=>3,
                        'company_id' => (!empty(session('administrator')->company_id)) ? session('administrator')->company_id : 0,
                        'factory_id' => (!empty(session('administrator')->factory_id)) ? session('administrator')->factory_id : 0,
                    ];
                    $insert_id = DB::table(config('alias.ad'))->insertGetId($data);
                    $material_attr[$v['MATNR']][$insert_id] = [
                        'attribute_definition_id'=>$insert_id,
                        'value'=>($v[$z] == 'default') ? '' : $v[$z],
                    ];
                }
            }
        }
        return $material_attr;
    }

    public function groupMarcData($input_marcData){
        $marcData = [];
        foreach ($input_marcData as $k=>&$v){
            $v['MATNR'] = preg_replace('/^0+/','',$v['MATNR']);
            if(isset($marcData[$v['MATNR']])){
                $marcData[$v['MATNR']][] = $v;
            }else{
                $marcData[$v['MATNR']] = [$v];
            }
        }
        return $marcData;
    }

    public function groupMarmData($input_marmData){
        $marmData = [];
        foreach ($input_marmData as $k=>&$v){
            $v['MATNR'] = preg_replace('/^0+/','',$v['MATNR']);
            if(isset($marmData[$v['MATNR']])){
                $marmData[$v['MATNR']][] = $v;
            }else{
                $marmData[$v['MATNR']] = [$v];
            }
        }
        return $marmData;
    }

    public function  identityCard($factors)
    {
        //通过key值进行排序
        ksort($factors);
        $material_attribute_ids=!empty($factors)?','.implode(',',array_keys($factors)).',':'';
        //摘菜了
        $strings_arr= [];
        foreach ($factors  as $key=>$factor){
            $strings_arr[] = implode(',',$factor);
        }
        //属性与属性之间以' | '隔开
        $string=!empty($strings_arr)?implode('|',$strings_arr):'';
        $md5_string=!empty($string)?md5($string):'';
        $identity_card_string=!empty($string)?'|'.$string.'|':'';
        return ['material_attribute_ids'=>$material_attribute_ids,'identity_card_string'=>$identity_card_string,'identity_card_md5'=>$md5_string];
    }

}