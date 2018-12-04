#!/usr/bin/env php
<?php
/**
 * Created by PhpStorm.
 * User: lester
 * Date: 2018/4/8 12:46
 * Desc: 用途：更新数据库--根据图片属性筛选图片
 */
require(__DIR__ . '/config/config.php');

$RuisDrawing = new BasicClass('ruis_drawing');

$startNum = 1;     //起始ID
$startPage = 1;     //预测起始页
$pageSize = 200;   //分页的大小

$dataList = $RuisDrawing->getData(array('id', 'code'), array(), array(), true, $startPage, $pageSize, 'id', 'ASC');
while (!empty($dataList)) {
    foreach ($dataList as $key => $value) {
        if (!empty($value['code'])) {
            $new_code = str_replace('-', '', $value['code']);
            $res = $RuisDrawing->updateData(['code' => $new_code], ['id' => $value['id']]);
            echo 'ID:' . $value['id'] . ',res:' . $res . "\n";
        }


    }
    $startPage++;
    $dataList = $RuisDrawing->getData(array('id', 'code'), array(), array(), true, $startPage, $pageSize, 'id', 'ASC');
}

