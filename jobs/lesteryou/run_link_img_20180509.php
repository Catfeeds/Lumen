<?php
/**
 * Created by PhpStorm.
 * User: lester
 * Date: 2018/5/9 10:27
 * Desc: 用途：关联图片数据迁移
 */
require_once 'config/config.php';

$DrawingCombination = new BasicClass('drawing_combination');
$RuisDrawing = new BasicClass('ruis_drawing');
$RuisDrawingLink = new BasicClass('ruis_drawing_link');

$startPage = 1;
$pageSize = 20;

//缓存drawing_id,用于判断drawing_id是否存在
$cacheDrawingIsExistArr = [];

$dataList = $DrawingCombination->getData(['id', 'parent_drawing_id', 'child_drawing_id', 'count'], [], [], true, $startPage, $pageSize, 'id', 'ASC');
while (!empty($dataList)) {
    foreach ($dataList as $key => $value) {
        //判断drawing_id是否存在
        if (drawing_is_exist($value['parent_drawing_id'], $cacheDrawingIsExistArr) && drawing_is_exist($value['parent_drawing_id'], $cacheDrawingIsExistArr)) {
            $has = $RuisDrawingLink->getSingleData(
                ['id'],
                ['drawing_id' => $value['parent_drawing_id'], 'link_id' => $value['child_drawing_id']]
            );
            //关联数据是否已经存在
            if (empty($has) && $value['child_drawing_id'] != 0) {
                $insertKeyVal = [
                    'drawing_id' => $value['parent_drawing_id'],
                    'link_id' => $value['child_drawing_id'],
                    'count' => $value['count']
                ];
                $insertRes = $RuisDrawingLink->addData($insertKeyVal);
                echo 'drawing:' . $value['parent_drawing_id'] . ',link:' . $value['child_drawing_id'] . ', res:' . $insertRes . "\n";
            }
        }
    }
    $startPage++;
    $dataList = $DrawingCombination->getData(['id', 'parent_drawing_id', 'child_drawing_id', 'count'], [], [], true, $startPage, $pageSize, 'id', 'ASC');
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