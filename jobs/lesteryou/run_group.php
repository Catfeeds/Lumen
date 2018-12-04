<?php
include(__DIR__ . '/config/config.php');
$DrawingGroup = new BasicClass('drawing_group');
$RuisDrawingGroup = new BasicClass('ruis_drawing_group');


//1.首先把drawing_group表导入到ruis_drawing_group
$groupList = $DrawingGroup->getData(
    array('id', 'code', 'name', 'type_id', 'ctime', 'mtime')
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
    $insertKeyVal['type_id'] = $v['type_id'];
    $res = $RuisDrawingGroup->addData($insertKeyVal);
    echo 'group_id:' . $v['id'] . ",res: " . $res . " \n";
}
