<?php
/**
 * Created by PhpStorm.
 * User: lester
 * Date: 2018/5/9 15:23
 * Desc:
 */

class OperationAttributeValue extends BasicClass
{

    public function __construct()
    {
        parent::__construct('operation_attribute_value');
    }

    public function list($startPage, $pageSize)
    {
        $startNum = ($startPage - 1) * $pageSize;
        $sql = 'select `id`,`owner_id`,`attribute_id`,`value` 
from operation_attribute_value 
where owner_type="drawing" and attribute_id in (12,13) limit ' . $startNum . ',' . $pageSize;
        return $this->pdo->queryRecords($sql);
    }
}