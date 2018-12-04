<?php
/**
 * File : run_search.php
 * Desc :
 * Time : 2018/4/3 17:29
 * Create by Lester You.
 */
include(__DIR__ . '/config/config.php');
$RuisDrawing = new BasicClass('ruis_drawing');
$RuisDrawingAttribute = new BasicClass('ruis_drawing_attribute');
for ($drawing_id = 1; $drawing_id <= 37; $drawing_id++) {
    $data = $RuisDrawingAttribute->getData(
        array('drawing_id', 'attribute_definition_id', 'value'),
        array('drawing_id' => $drawing_id),array(),false,1,100,'id','ASC'
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
        echo 'drawing:'.$v['drawing_id'].',res:'.$res."\n";
    }else{
        echo 'drawing:'.$drawing_id.',empty attribute_definition'."\n";
    }
}
