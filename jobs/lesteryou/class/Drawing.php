<?php
/**
 * Created by PhpStorm.
 * User: lester
 * Date: 2018/6/5 13:20
 * Desc:
 */

class Drawing extends BasicClass
{
    public function __construct()
    {
        parent::__construct('drawing');
    }

    public function list($id)
    {
        $sql = "select 
d.id as drawing_id,
oav.attribute_id,
oav.value as attribute_value,
ad.label as attribute_name,
dta.type_id as attribute_type_id

FROM drawing as d
left join operation_attribute_value as oav on oav.owner_id = d.id
left join attribute_definition as ad on ad.id = oav.attribute_id
left join drawing_type_attribute as dta on dta.attribute_id = oav.attribute_id
where oav.owner_type='drawing' and d.id={$id}";
        return $this->pdo->queryRecords($sql, []);
    }
}