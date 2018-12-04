<?php
/**
 * Created by PhpStorm.
 * User: haoziye
 * Date: 2018/1/15
 * Time: 下午5:05
 */

namespace App\Http\Models;

use App\Exceptions\ApiException;
use App\Http\Models\Base;
use Illuminate\Support\Facades\DB;
use App\Libraries\Trace;

class ImageAttribute extends Base
{

    public $apiPrimaryKey = 'drawing_attribute_id';

    public function __construct()
    {
        parent::__construct();
        $this->table = config('alias.rda');
    }

//region 检

    /**
     * 检查基础信息字段
     * @param $input
     * @author hao.wei <weihao>
     * @throws ApiException
     */
    public function checkFormFields(&$input)
    {
//        $add = $this->judgeApiOperationMode($input);
        if (!isset($input['drawing_attributes']) || !is_json($input['drawing_attributes'])) TEA('700', 'drawing_attributes');
        $input['drawing_attributes'] = json_decode($input['drawing_attributes'], true);
        $input['input_ref_arr_drawing_attributes'] = [];
        foreach ($input['drawing_attributes'] as $key => $value) {
            if (trim($value['value']) === '') unset($input['drawing_attributes'][$key]);
            $input['input_ref_arr_drawing_attributes'][$value['attribute_definition_id']] = $value;
            $has = $this->isExisted([['id', '=', $value['attribute_definition_id']]], config('alias.rdad'));
            if (!$has) TEA('701', 'drawing_attributes');
        }
    }


    /**
     * 检查传入参数在数据库中相同字段不同的值
     * @param $fields       限定字段
     * @param $id
     * @return  array       返回需要改变的字段对应值的数组
     * @author  hao.wei <weihao>
     */
    public function checkChangeFieldsValue($id, $fields, $input)
    {
        $obj = DB::Table($this->table)->select($fields)->where('id', '=', $id)->first();
        $obj_list = [];
        foreach ($obj as $k => $v) {
            if ($v != $input[$k]) {
                $obj_list[$k] = $v;
            }
        }
        return $obj_list;
    }

//endregion

//region 增

    /**
     * 添加图纸库图纸属性
     * @param $input
     * @author hao.wei <weihao>
     * @throws ApiException
     * @return int
     */
    public function add($input)
    {
        $data = [
            'name' => $input['name'],
            'ctime' => time(),
            'creator_id' => $input['creator_id'],
            'group_id' => $input['group_id'],
            'height' => $input['height'],
            'height_two' => $input['height_two'],
            'length' => $input['length'],
            'length_two' => $input['length_two'],
            'width' => $input['width'],
            'width_two' => $input['width_two'],
            'description' => $input['description'],
            'is_model' => $input['is_model'],
            'model_time' => $input['model_time'],
        ];
        $insert_id = DB::table($this->table)->insertGetId($data);
        if (!$insert_id) TEA('802');
        return $insert_id;
    }

//endregion

//region 修

    /**
     * 修改图纸关联的属性和属性值
     * @param $image_attributes
     * @param $drwing_id
     * @throws \App\Exceptions\ApiException
     */
    public function saveImageAttribute($image_attributes, $drwing_id)
    {
        //0.获取是否为样板 的属性定义ID
        $attribute_definition_id = $this->selectIsModelID();
        $old_obj = DB::table($this->table)
            ->select(['id', 'drawing_id', 'attribute_definition_id', 'value'])
            ->where([['attribute_definition_id', '=', $attribute_definition_id], ['drawing_id', '=', $drwing_id]])
            ->first();
        if (!empty($old_obj) && isset($image_attributes[$old_obj->attribute_definition_id])) {
            $newValue = $image_attributes[$old_obj->attribute_definition_id]['value'];
            if ($newValue != $old_obj->value) {
                DB::table($this->table)
                    ->where([['id', '=', $old_obj->id]])
                    ->update(['mtime' => time()]);
            }
        }
        //1.获取数据库中图纸已经添加属性
        $db_ref_obj = DB::table($this->table)->where('drawing_id', $drwing_id)
            ->pluck('value', 'attribute_definition_id');
        $db_ref_arr = obj2array($db_ref_obj);
        $db_ids = array_keys($db_ref_arr);
        //2.获取前端传递的图纸属性
        $input_ref_arr = $image_attributes;
        $input_ids = array_keys($input_ref_arr);
        //3.通过颠倒位置的差集获取改动情况
        $set = get_array_diff_intersect($input_ids, $db_ids);
        //4.要添加的
        if (!empty($set['add_set'])) {
            $data = [];
            foreach ($set['add_set'] as $k => $v) {
                if (empty($v)) continue;
                $data[] = [
                    'drawing_id' => $drwing_id,
                    'attribute_definition_id' => $v,
                    'value' => $input_ref_arr[$v]['value'],
                ];
            }
            $res = DB::table($this->table)->insert($data);
            if (!$res) TEA('802');
        }
        //5.要删除的
        if (!empty($set['del_set'])) {
            foreach ($set['del_set'] as $k => $v) {
                if (empty($v)) continue;
                $res = DB::table($this->table)->where([['drawing_id', '=', $drwing_id], ['attribute_definition_id', '=', $v]])->delete();
                if (!$res) TEA('803');
            }
        }
        //6.可能要编辑的
        if (!empty($set['common_set'])) {
            foreach ($set['common_set'] as $k => $v) {
                if (empty($v)) continue;
                if ($input_ref_arr[$v]['value'] != $db_ref_arr[$v]) {
                    $upd = DB::table($this->table)
                        ->where('drawing_id', $drwing_id)
                        ->where('attribute_definition_id', $v)
                        ->update(['value' => $input_ref_arr[$v]['value']]);
                    if ($upd === false) TEA('806');
                }
            }
        }
    }


//endregion

//region 查

    /**
     * 图纸属性列表
     * @param $drawing_attribute_id
     * @return object
     * @author hao.wei <weihao>
     */
    public function getDrawingAttributeList($drawing_id)
    {
        $field = [
            'rda.attribute_definition_id',
            'rdad.name as definition_name',
            'rda.value',
            'rda.mtime',
        ];
        $obj_list = DB::table($this->table . ' as rda')
            ->select($field)
            ->leftJoin(config('alias.rdad') . ' as rdad', 'rda.attribute_definition_id', 'rdad.id')
            ->where('rda.drawing_id', $drawing_id)->get();
        foreach ($obj_list as $key => &$value) {
            if ($value->definition_name == '是否为样板') {
                $value->isModel = 1;
                $value->mtime = $value->mtime ? date('Y-m-d H:i:s', $value->mtime) : '';
            } else {
                $value->isModel = 0;
            }
        }
        return $obj_list;
    }

    public function getDrawingAttributesJson($drawing_id)
    {
        $obj_list = DB::table($this->table . ' as rda')
            ->leftJoin(config('alias.rdad') . ' as rdad', 'rda.attribute_definition_id', 'rdad.id')
            ->where('rda.drawing_id', $drawing_id)->pluck('rda.value', 'rdad.name');
        $obj_list = json_encode($obj_list);
        return $obj_list;
    }

    /**
     * 查找 是否为样板的ID
     * @return int
     */
    public function selectIsModelID()
    {
        $obj = DB::table(config('alias.rdad'))->select(['id'])->where('name', '=', '是否为样板')->first();
        return isset($obj->id) ? $obj->id : 0;
    }


//endregion
}