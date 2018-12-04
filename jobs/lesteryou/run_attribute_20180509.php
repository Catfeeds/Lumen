<?php
/**
 * Created by PhpStorm.
 * User: lester
 * Date: 2018/5/9 15:07
 * Desc: 用途：单耗和排版图件数 数据迁移
 */

require_once 'config/config.php';

$RuisDrawing = new BasicClass('ruis_drawing');
$RuisDrawingAttribute = new BasicClass('ruis_drawing_attribute');
$RuisDrawingAttributeDefinition = new BasicClass('ruis_drawing_attribute_definition');

$OperationAttributeValue = new OperationAttributeValue();

$startPage = 1;
$pageSize = 20;

$dh_id = 8;  //新的单耗 属性id
$bt_id = 9;  //新的 排版图件数 属性id

$old_dh_id = 12;    //老的单耗 属性id
$old_bt_id = 13;    //老的 排版图件数 属性id

//缓存drawing_id,用于判断drawing_id是否存在
$cacheDrawingIsExistArr = [];

$select = ['value', 'attribute_id', 'owner_id'];
$dataList = $OperationAttributeValue->list($startPage, $pageSize);
while (!empty($dataList)) {
    foreach ($dataList as $key => $value) {
        //判断drawing_id是否存在
        if (drawing_is_exist($value['owner_id'], $cacheDrawingIsExistArr)) {
            if ($value['attribute_id'] == $old_dh_id) {
                $insertKeyVal = [
                    'drawing_id' => $value['owner_id'],
                    'attribute_definition_id' => $dh_id,
                    'value' => $value['value']
                ];
                $res = $RuisDrawingAttribute->addData($insertKeyVal);
                echo 'drawing_id:' . $value['owner_id'] . ', attribute_definition_id:' . $dh_id . ', res:' . $res . "\n";
            } else if ($value['attribute_id'] == $old_bt_id) {
                $insertKeyVal = [
                    'drawing_id' => $value['owner_id'],
                    'attribute_definition_id' => $bt_id,
                    'value' => $value['value']
                ];
                $res = $RuisDrawingAttribute->addData($insertKeyVal);
                echo 'drawing_id:' . $value['owner_id'] . ', attribute_definition_id:' . $bt_id . ', res:' . $res . "\n";
            }
        }
    }
    $startPage++;
    $dataList = $OperationAttributeValue->list($startPage, $pageSize);
}

function drawing_is_exist($drawing_id, &$cacheDrawingIsExistArr)
{
    global $RuisDrawing;
    if (in_array($drawing_id, $cacheDrawingIsExistArr)) {
        return true;
    } else {
        $total = $RuisDrawing->countData(['id' => $drawing_id]);
        if ($total > 0) {
            $cacheDrawingIsExistArr[] = $drawing_id;
            return true;
        } else {
            return false;
        }
    }
}