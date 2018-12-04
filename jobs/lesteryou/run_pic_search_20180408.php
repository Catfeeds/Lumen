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
$RuisDrawingAttribute = new BasicClass('ruis_drawing_attribute');


$startNum  = 1;     //起始ID
$startPage = 1;     //预测起始页
$pageSize  = 200;   //分页的大小

$dataList = $RuisDrawing->getData(array('id'), array(), array(), true, $startPage, $pageSize, 'id', 'ASC');
while (!empty($dataList)) {
    foreach ($dataList as $key => $value) {
        if (empty($value['id']) || $value['id'] < $startNum) {
            continue;
        }
        $data = $RuisDrawingAttribute->getData(
            array('drawing_id', 'attribute_definition_id', 'value'),
            array('drawing_id' => $value['id']), array(), false, 1, 100, 'id', 'ASC'
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
    $dataList = $RuisDrawing->getData(array('id'), array(), array(), true, $startPage, $pageSize, 'id', 'ASC');
}

