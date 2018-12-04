<?php
/**
 * Created by PhpStorm.
 * User: lester
 * Date: 2018/5/14 10:39
 * Desc:
 */
require_once 'config/config.php';
$RuisBom = new BasicClass('ruis_bom');
$RuisBomRouting = new BasicClass('ruis_bom_routing');

$select = [
    'id',
    'routings'
];
$startPage = 1;
$dataList = $RuisBom->getData($select, [], [], true, $startPage, 20, 'id', 'ASC');

while (!empty($dataList)) {
    foreach ($dataList as $key => $value) {
        if (empty($value['routings'])) {
            continue;
        }
        $routingArr = json_decode($value['routings'], true);
        foreach ($routingArr as $k => $v) {
            $insertKeyVal = [
                'bom_id' => $value['id'],
                'routing_id' => $v['id']

            ];
            $res = $RuisBomRouting->addData($insertKeyVal);
            echo 'bom_id:' . $value['id'] . ', routing_id:' . $v['id'] . ', res:' . $res . "\n";
        }
    }
    $startPage++;
    $dataList = $RuisBom->getData($select, [], [], true, $startPage, 20, 'id', 'ASC');
}
