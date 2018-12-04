<?php
/**
 * Created by PhpStorm.
 * User: xujian
 * Date: 17/10/20
 * Time: 下午15:26
 */

namespace App\Http\Models\Material;//定义命名空间
use App\Http\Models\Base;
use App\Libraries\Trace;
use Illuminate\Support\Facades\DB;//引入DB操作类

/**
 * 物料属性
 * @author  sam.shan  <sam.shan@ruis-ims.cn>
 * @time    2017年09月28日 16:01
 */
class MaterialAttribute extends Base
{

    public function __construct()
    {
        parent::__construct();
        $this->table=config('alias.ma');
    }


    /**
     * 物料中添加属性
     * @param $add_set
     * @param $material_id
     * @param $input_ref_arr
     * @throws \App\Exceptions\ApiException
     * @author  sam.shan   <sam.shan@ruis-ims.cn>
     */
    public function  addSet($add_set,$material_id,$input_ref_arr,$creator_id)
    {

        foreach ($add_set as $key => $value) {
            if(empty($value)) continue;
            $bool=DB::table($this->table)->insert(
                [
                    'material_id'=>$material_id,
                    'attribute_definition_id'=>$value,
                    'value'=>$input_ref_arr[$value]['value'],
                ]
            );
            if(empty($bool)) TEA('806');
            //操作日志

            $attribute = $this->getRecordById($value,['id as attribute_definition_id','key','name','label'],config('alias.ad'));
//            $material = $this->getRecordById($material_id,['name'],config('alias.rm'));
            $events = [
                'field'=>'attribute_definition_id',
                'comment'=>'物料属性',
                'action'=>'add',
                'extra'=>$attribute,
                'desc'=>'给物料关联物料属性['.$attribute->name.']并赋值['.$input_ref_arr[$value]['value'].']',
            ];
            Trace::save(config('alias.rm'),$material_id,$creator_id,$events);

        }
    }

    /**
     * 物料模板中批量删除物料属性
     * @param $del_set
     * @param $template_id
     * @param $db_ref_arr
     * @throws \App\Exceptions\ApiException
     * @author sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function  delSet($del_set,$material_id,$db_ref_arr,$creator_id)
    {
        foreach ($del_set as $key => $value) {
            if(empty($value)) continue;
            $num=DB::table($this->table)->where([['material_id','=',$material_id],['attribute_definition_id','=',$value]])->delete();
            if($num===false) TEA('806');
            //操作日志
            $attribute = $this->getRecordById($value,['id as attri，bute_definition_id','key','name','label'],config('alias.ad'));
//            $material = $this->getRecordById($material_id,['name'],config('alias.rm'));
            $events = [
                'field'=>'attribute_definition_id',
                'comment'=>'物料属性',
                'action'=>'delete',
                'extra'=>$attribute,
                'desc'=>'删除物料关联物料属性['.$attribute->name.']',
            ];
            Trace::save(config('alias.rm'),$material_id,$creator_id,$events);
        }


    }


    /**
     * 物料模板中批量修改物料属性
     * @param $common_set
     * @param $template_id
     * @param $db_ref_arr
     * @param $input_ref_arr
     * @throws \App\Exceptions\ApiException
     * @author  sam.shan <sam.shan@ruis-ims.cn>
     */
    public function  commonSet($common_set,$material_id,$db_ref_arr,$input_ref_arr,$creator_id)
    {

        foreach($common_set as $key =>$value){
            if(empty($value)) continue;
            if($input_ref_arr[$value]['value'] != $db_ref_arr[$value]){
                $upd=DB::table($this->table)
                    ->where('material_id',$material_id)
                    ->where('attribute_definition_id',$value)
                    ->update(['value'=>$input_ref_arr[$value]['value']]);
                if($upd===false) TEA('806');
                //操作日志
                $attribute = $this->getRecordById($value,['name'],config('alias.ad'));
//                $material = $this->getRecordById($material_id,['name'],config('alias.rm'));
                $events = [
                    'action'=>'update',
                    'desc'=>'把物料关联物料属性['.$attribute->name.']的值['.$db_ref_arr[$value].']修改为['.$input_ref_arr[$value]['value'].']',
                ];
                Trace::save(config('alias.rm'),$material_id,$creator_id,$events);
            }

        }
    }






}