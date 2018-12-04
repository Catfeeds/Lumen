<?php
/**
 * Created by PhpStorm.
 * User: lester
 * Date: 2018/6/5 9:52
 * Desc:
 */
require_once __DIR__ . '/config/config.php';

$RuisDrawing = new BasicClass('ruis_drawing');
$RuisDrawingAttribute = new BasicClass('ruis_drawing_attribute');
$RuisDrawingAttributeDefinition = new BasicClass('ruis_drawing_attribute_definition');
$RuisDrawingAttributeDefinitionGroupType = new BasicClass('ruis_drawing_attribute_definition_group_type');


$Drawing = new Drawing();
$DrawingType = new BasicClass('drawing_type');
$DrawingTypeAttribute = new BasicClass('drawing_type_attribute');
$OperationAttributeValue = new BasicClass('operation_attribute_value');
$AttributeDefinition = new BasicClass('attribute_definition');


//1.遍历新的主表 ruis_drawing
$startPage = 1;
$select = ['id', 'code', 'name'];
$DataList = $RuisDrawing->getData($select, [], [], true, $startPage, 20, 'id', 'ASC');
while (!empty($DataList)) {
    foreach ($DataList as $key => $value) {
        //2.根据上一步取出的ID,code去旧的主表，取数据（属性定义、属性值）。
        if (intval($value['id']) > 20853) {
            exit('Finish');
        }
        $data = $Drawing->list($value['id']);
        if (empty($data)) {
            continue;
        }
        foreach ($data as $k => $v) {
            if (empty($v['attribute_id']) || empty($v['attribute_name']) || empty($v['attribute_type_id'])) {
                continue;
            }
            //3.取属性定义数据，判断新的属性定义表 相关属性定义是否存在；
            $attributeData = $RuisDrawingAttributeDefinition->getSingleData(['id', 'name'], ['name' => $v['attribute_name'], 'category_id' => 1]);
            if (empty($attributeData)) {
                $keyValArr = [
                    'name' => $v['attribute_name'],
                    'ctime' => time(),
                    'mtime' => time(),
                    'category_id' => 1,
                    'creator_id' => 1
                ];
                //插入属性定义
                $attributeData['id'] = $RuisDrawingAttributeDefinition->addData($keyValArr);
                $RuisDrawingAttributeDefinitionGroupType->addData(['attribute_definition_id' => $attributeData['id'], 'group_type_id' => $v['attribute_type_id']]);
            }
            //5.取属性值，插入属性值并关联属性定义。
            $keyValArr = ['drawing_id' => $value['id'], 'attribute_definition_id' => $attributeData['id'], 'value' => $v['attribute_value']];
            if (empty($RuisDrawingAttribute->getSingleData(['id'], $keyValArr))) {
                $RuisDrawingAttribute->addData($keyValArr);
            }
        }
        //6.更新search_string
        $data = $RuisDrawingAttribute->getData(
            array('drawing_id', 'attribute_definition_id', 'value'),
            array('drawing_id' => $value['id']), array(), false, 1, 100, 'attribute_definition_id', 'ASC'
        );
        if (!empty($data)) {
            $search_str_arr = [];
            foreach ($data as $k => $v) {
                if (!empty($v['value'])) {
                    $search_str_arr[] = $v['attribute_definition_id'] . ',' . $v['value'];
                }
            }
            if (empty($search_str_arr)) {
                continue;
            }
            $search_str = join('|', $search_str_arr);
            $res = $RuisDrawing->updateData(array('search_string' => $search_str), array('id' => $v['drawing_id']));
            echo 'drawing:' . $v['drawing_id'] . ',res:' . $res . "\n";
        } else {
            echo 'drawing:' . $value['id'] . ',empty attribute_definition' . "\n";
        }

    }
    $startPage++;
    $DataList = $RuisDrawing->getData($select, [], [], true, $startPage, 20, 'id', 'ASC');
}




//4.取属性所属分类数据，判断新的分类表 相关分类数据是否存在；不存在即插入，同时。

