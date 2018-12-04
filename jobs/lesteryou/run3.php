<?php
/**
 * File : run2.php
 * Desc :
 * Time : 2018/3/30 15:41
 * Create by Lester You.
 */
include(__DIR__ . '/config/config.php');
$DrawingGroup = new BasicClass('drawing_group');
$RuisDrawingGroup = new BasicClass('ruis_drawing_group');

//1.首先把drawing_group表导入到ruis_drawing_group
$groupList = $DrawingGroup->getData(
    array('id', 'code', 'name', 'ctime', 'mtime')
    , array()
);
$insertKeyVal = array(
    'creator_id' => 1
);
echo "-----------------\n";
foreach ($groupList as $k => $v) {
    $insertKeyVal['id'] = $v['id'];
    $insertKeyVal['code'] = $v['code'];
    $insertKeyVal['name'] = $v['name'];
    $insertKeyVal['ctime'] = $v['ctime'];
    $insertKeyVal['mtime'] = $v['mtime'];
    $res = $RuisDrawingGroup->addData($insertKeyVal);
    echo 'group_id:' . $res . "\n";
}

//2.从drawing取老数据
echo "-----------------\n";
$Drawing = new BasicClass('drawing');
$RuisDrawing = new BasicClass('ruis_drawing');
$RuisDrawingAttribute = new BasicClass('ruis_drawing_attribute');


$insertKeyVal_drawing = array(
    'creator_id' => 1,
    'category_id' => 1,
    'extension' => 'jpg',
    'status' => 1
);

$page = 1;
$pageSize = 500;
$dataList = $Drawing->getData('*', array(), array(), true, $page, $pageSize);
while ($dataList) {
    foreach ($dataList as $k => $data) {
        if (empty($data) || empty($data['image_name'])) {
            continue;
        }
        $oldPath = substr($data['image_path'], 33);
        if (empty($oldPath) || strlen($oldPath) < 2) {
            continue;
        }
        $path = 'drawing/material/old/';
        $insertKeyVal_drawing['id'] = $data['id'];
        $insertKeyVal_drawing['name'] = $data['name'];
        $insertKeyVal_drawing['code'] = $data['code'];
        $insertKeyVal_drawing['ctime'] = $data['ctime'];
        $insertKeyVal_drawing['mtime'] = $data['mtime'];
        $insertKeyVal_drawing['group_id'] = $data['group_id'];
        $insertKeyVal_drawing['image_name'] = $data['image_name'] . '.jpg';
        $insertKeyVal_drawing['image_path'] = $path . $oldPath . $data['image_name'] . '.jpg';

        //长 ruis_drawing_attribute_definition --> 1
        $insertKeyVal_length = array(
            'drawing_id' => $data['id'],
            'attribute_definition_id' => 1,
            'value' => $data['length']
        );
        //宽 ruis_drawing_attribute_definition --> 2
        $insertKeyVal_width = array(
            'drawing_id' => $data['id'],
            'attribute_definition_id' => 2,
            'value' => $data['width']
        );
        //高 ruis_drawing_attribute_definition --> 3
        $insertKeyVal_height = array(
            'drawing_id' => $data['id'],
            'attribute_definition_id' => 3,
            'value' => $data['height']
        );
        //长2 ruis_drawing_attribute_definition --> 4
        $insertKeyVal_length2 = array(
            'drawing_id' => $data['id'],
            'attribute_definition_id' => 4,
            'value' => $data['length2']
        );
        //宽2 ruis_drawing_attribute_definition --> 5
        $insertKeyVal_width2 = array(
            'drawing_id' => $data['id'],
            'attribute_definition_id' => 5,
            'value' => $data['width2']
        );
        //高2 ruis_drawing_attribute_definition --> 6
        $insertKeyVal_height2 = array(
            'drawing_id' => $data['id'],
            'attribute_definition_id' => 6,
            'value' => $data['height2']
        );
        //是否为样板 ruis_drawing_attribute_definition --> 7
        $insertKeyVal_model = array(
            'drawing_id' => $data['id'],
            'attribute_definition_id' => 7,
            'value' => $data['is_model'] == 1 ? '是' : '否'
        );

        $rd_res = $RuisDrawing->addData($insertKeyVal_drawing);
        $length_res = $RuisDrawingAttribute->addData($insertKeyVal_length);
        $width_res = $RuisDrawingAttribute->addData($insertKeyVal_width);
        $height_res = $RuisDrawingAttribute->addData($insertKeyVal_height);
        $length2_res = $RuisDrawingAttribute->addData($insertKeyVal_length2);
        $width2_res = $RuisDrawingAttribute->addData($insertKeyVal_width2);
        $height2_res = $RuisDrawingAttribute->addData($insertKeyVal_height2);
        $model_res = $RuisDrawingAttribute->addData($insertKeyVal_model);

        $resArr = array($rd_res, $length_res, $width_res, $height_res, $length2_res, $width2_res, $height2_res, $model_res);

        echo 'drawing_id:' . $data['id'] . ', res:' . implode(',',$resArr) . "\n";
    }
    $page++;
    $dataList = $Drawing->getData('*', array(), array(), true, $page, $pageSize);
}

