<?php

/**
 * File : RuisDrawingAttribute.php
 * Desc :
 * Time : 2018/3/30 18:09
 * Create by Lester You.
 */
class RuisDrawingAttribute extends BasicClass
{
    public function __construct()
    {
        parent::__construct('ruis_drawing_attribute');
    }

    public function addRecords($arr)
    {
        $str = [];
        foreach ($arr as $k => $v) {
            $string = "(" . $v['drawing_id'] . "," . $v['attribute_definition_id'] . "," .( is_numeric($v['value']) ? $v['value'] : "'" . $v['value'] . "'" ). ")";
            $str[] = $string;
        }

        $sql = "insert into `ruis_drawing_attribute` (`drawing_id`,`attribute_definition_id`,`value`) values " . join(",", $str) . "  ";
//        return $sql;
        return $this->pdo->query($sql);
    }
}