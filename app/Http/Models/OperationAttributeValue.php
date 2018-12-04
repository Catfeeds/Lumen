<?php
/**
 * Created by PhpStorm.
 * User: xujian
 * Date: 17/10/25
 * Time: 下午14:20
 */

namespace App\Http\Models;//定义命名空间
use Illuminate\Support\Facades\DB;//引入DB操作类
use App\Libraries\Trace;
/**
 * 工艺属性参数值公共表数据操作,本质就是其他与工艺属性的关联表吧了,恶心,不知道谁创建了这样的一张表
 * @author  sam.shan  <sam.shan@ruis-ims.cn>
 * @time    2017年10月25日 14:20
 */
class OperationAttributeValue extends Base
{

    public function __construct()
    {
        parent::__construct();
        $this->table=config('alias.oav');
    }

    /**
     * 物料中添加工艺属性
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
                    'owner_id'=>$material_id,
                    'attribute_id'=>$value,
                    'owner_type'=>'material',
                    'value'=>$input_ref_arr[$value]['value'],
                ]
            );
            if(empty($bool)) TEA('806');
            //操作日志
            $attribute = $this->getRecordById($value,['id as attribute_definition_id','key','name','label'],config('alias.ad'));
            $material = $this->getRecordById($material_id,['name'],config('alias.rm'));
            $events = [
                'action'=>'add',
                'desc'=>'给物料['.$material->name.']关联工艺属性['.$attribute->name.']并赋值['.$input_ref_arr[$value]['value'].']',
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
            $num=DB::table($this->table)->where([
                                            ['owner_id','=',$material_id],
                                            ['attribute_id','=',$value]],
                                            ['owner_type','=','material']
                                           )->delete();
            if($num===false) TEA('806');
            //操作日志
            $attribute = $this->getRecordById($value,['id as attribute_definition_id','key','name','label'],config('alias.ad'));
            $material = $this->getRecordById($material_id,['name'],config('alias.rm'));
            $events = [
                'action'=>'delete',
                'desc'=>'删除物料['.$material->name.']关联工艺属性['.$attribute->name.']',
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
                    ->where('owner_type','material')
                    ->where('owner_id',$material_id)
                    ->where('attribute_id',$value)
                    ->update(['value'=>$input_ref_arr[$value]['value']]);
                if($upd===false) TEA('806');

                //操作日志
                $attribute = $this->getRecordById($value,['name'],config('alias.ad'));
                $material = $this->getRecordById($material_id,['name'],config('alias.rm'));
                $events = [
                    'action'=>'update',
                    'desc'=>'把物料['.$material->name.']关联物料属性['.$attribute->name.']的值['.$db_ref_arr[$value].']修改为['.$input_ref_arr[$value]['value'].']',
                ];
                Trace::save(config('alias.rm'),$material_id,$creator_id,$events);
            }

        }
    }







    /**
     * 获取工艺属性值列表
     * @param $owner_id    类型表主键值
     * @param $owner_type  类型,如drawing
     * @author   sam.shan <sam.shan@ruis-ims.cn>
     */
    public function  getOperationAttributeValueList($owner_id,$owner_type)
    {

        $obj_list=DB::table($this->table.' as oav')->select('ad.id as attribute_definition_id',
            'ad.name as attribute_definition_name',
            'ad.name',
            'ad.range',
            'ad.key',
            'ad.datatype_id',
            'ad.unit_id',
            'oav.value as attribute_definition_value',
            'oav.value',
            'oav.is_editable',
            'uu.unit_text',
            'uu.commercial',
            'uu.commercial as unit',
            'adt.cn_name'
            )
            ->leftJoin(config('alias.ad').' as ad','oav.attribute_id','=','ad.id')
            ->leftJoin(config('alias.uu').' as uu','ad.unit_id','=','uu.id')
            ->leftJoin(config('alias.adt').' as adt','ad.datatype_id','=','adt.id')
            ->where('oav.owner_id',$owner_id)
            ->where('oav.owner_type',$owner_type)
            ->get();


        return $obj_list;

    }






}