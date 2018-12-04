<?php
/**
 * Created by PhpStorm.
 * User: lester
 * Date: 2018/5/9 13:04
 * Desc: 用途：附件数据迁移
 */

require_once 'config/config.php';

$RuisDrawing = new BasicClass('ruis_drawing');
$RuisAttachment = new BasicClass('attachment');
$RuisDrawingAttachment = new BasicClass('ruis_drawing_attachment');

$OldAttachment = new BasicClass('old_attachment');

$startPage = 1;
$pageSize = 20;

//缓存drawing_id,用于判断drawing_id是否存在
$cacheDrawingIsExistArr = [];
$dataList = $OldAttachment->getData('*', ['owner_type' => 'drawing'], [], true, $startPage, $pageSize, 'id', 'ASC');

while (!empty($dataList)) {
    foreach ($dataList as $key => $value) {
        //判断drawing_id是否存在
        if (drawing_is_exist($value['owner_id'], $cacheDrawingIsExistArr)) {
            unset($value['id']);
            $replace_str = 'attachment/image/old';
            $value['path'] = str_replace('storage/mlily/demo/drawing/attachment', $replace_str, $value['path']);
            $attachment_id = $RuisAttachment->addData($value);
            $insertKeyVal = [
                'drawing_id' => $value['owner_id'],
                'attachment_id' => $attachment_id,
                'description' => $value['comment']
            ];
            $res = $RuisDrawingAttachment->addData($insertKeyVal);
            echo 'drawing_id:' . $value['owner_id'] . ', attachment_id:' . $attachment_id . ', res:' . $res . "\n";
        }
    }
    $startPage++;
    $dataList = $OldAttachment->getData('*', ['owner_type' => 'drawing'], [], true, $startPage, $pageSize, 'id', 'ASC');
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