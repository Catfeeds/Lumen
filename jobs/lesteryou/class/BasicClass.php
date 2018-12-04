<?php

/**
 * Class BasicClass
 * 这是一个数据库基类，包含最基本的增删改查
 * 根据业务逻辑需求，进行组装调用
 */
class BasicClass
{
    public $table;
    public $pdo;

    public function __construct($tableName)
    {
        $this->table = $tableName;
        $this->pdo = DB::getInstance();
    }

    /**
     * 添加新的记录
     * 如果成功，返回自增字段的id
     * @param array $keyValArr 需要插入的列=>值
     * @return bool|int
     */
    public function addData($keyValArr)
    {
        $table = $this->table;
        $result = $this->pdo->insertRecord($table, $keyValArr);
        return $result;
    }

    /**
     * 物理删除表(慎用)
     * @param array $whereKeyValArr 条件 字段、值
     * @return bool     true/false
     */
    public function realDeleteData($whereKeyValArr)
    {
        //为了防止误操作，需要保证条件不能为空
        if (count($whereKeyValArr) == 0) {
            return false;
        }
        $table = $this->table;
        $result = $this->pdo->deleteRecords($table, $whereKeyValArr);
        return $result;
    }

    /**
     * 更新表
     * @param array $updateKeyValArr 更新 字段、值
     * @param array $whereKeyValArr 条件 字段、值(不能为空数组，否者为更新整张表)
     * @return bool
     */
    public function updateData($updateKeyValArr, $whereKeyValArr)
    {
        if (count($whereKeyValArr) == 0) {
            return false;
        }
        $table = $this->table;
        $result = $this->pdo->updateRecords($table, $updateKeyValArr, $whereKeyValArr);
        return $result;
    }

    /**
     * 获取多条数据
     * 如果无数据，返回空数组
     * @param array|string $columns 需要获取的字段
     * @param array $whereKeyValArr 条件 列=>值
     * @param array $searchKeyArr 需要like模糊搜索的列
     * @param boolean $hasPage 是否需要分页(false,后面page和pagesize不用)
     * @param int $page 第几页(不是起始数)
     * @param int $pageSize 单页的大小
     * @param string $orderBy 根据排序的字段
     * @param string $orderWay ASC/DESC 升序/降序
     * @return array|bool
     */
    public function getData($columns, $whereKeyValArr, $searchKeyArr = array(), $hasPage = false, $page = 1, $pageSize = 10, $orderBy = null, $orderWay = null)
    {
        $table = $this->table;
        $page = empty($page) ? 1 : intval($page);
        $pageSize = empty($pageSize) ? 10 : intval($pageSize);
        $startNum = ($page - 1) * $pageSize;
        $result = $this->pdo->getRecordsFromTable($table, $columns, $whereKeyValArr, $searchKeyArr, $hasPage, $startNum, $pageSize, $orderBy, $orderWay);
        return $result;
    }

    /**
     * 获取单条数据
     * 如果无数据，返回null
     * @param array|string $columns 需要获取的字段
     * @param array $whereKeyValArr 条件 列=>值
     * @param array $searchKeyArr 需要like模糊搜索的列
     * @param string $orderBy 根据排序的字段
     * @param string $orderWay ASC/DESC 升序/降序
     * @return array|bool
     */
    public function getSingleData($columns, $whereKeyValArr, $searchKeyArr = array(), $orderBy = null, $orderWay = null)
    {
        $table = $this->table;
        $result = $this->pdo->getSingleRecordFromTable($table, $columns, $whereKeyValArr, $searchKeyArr, $orderBy, $orderWay);
        return $result;
    }

    /**
     * 统计数据的条数
     * 如果成功，返回具体的条数；反之，为 false
     * @param array $whereKeyValArr 条件 列=>值
     * @param array $searchKeyArr 需要like模糊搜索的列
     * @return bool|int         如果不为false,则为统计的条数
     */
    public function countData($whereKeyValArr, $searchKeyArr = array())
    {
        $table = $this->table;
        $result = $this->pdo->getRecordCountsFromTable($table, $whereKeyValArr, $searchKeyArr);
        return $result;
    }
}

?>