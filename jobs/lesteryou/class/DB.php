<?php

class DB
{
    private $dbAddress = DBAddress;
    private $dbName = DBName;
    private $dbUser = DBUser;
    private $dbPassword = DBPassword;
    private $Logs;
    private $pdoInstance = null;

    private $operators = array('=', '<', '>', '<=', '>=', '<>', '!=',
        'like', 'not like',
        '&', '|', '^', '<<', '>>',
        'regexp', 'not regexp',
        '~', '~*', '!~', '!~*', 'similar to',
    );

    private static $instance = null;

    public function __construct()
    {
    }

    /**
     * @param string $databaseName
     * @param string $databaseAddress
     * @param string $databaseUser
     * @param string $databasePsd
     * @return DB|null
     */
    public static function getInstance($databaseName = DBName, $databaseAddress = DBAddress, $databaseUser = DBUser, $databasePwd = DBPassword)
    {
        if (!self::$instance instanceof self) {
            self::$instance = new self();
            self::$instance->dbName = $databaseName;
            self::$instance->dbAddress = $databaseAddress;
            self::$instance->dbUser = $databaseUser;
            self::$instance->dbPassword = $databasePwd;
            self::$instance->Logs = new Logs("DB_" . date('Y-m-d'));
        }
        return self::$instance;
    }

    /**
     * @return null|PDO
     */
    public function getPDOInstance()
    {
        if ($this->pdoInstance == null) {
            $dsn = "mysql:host=" . $this->dbAddress . ";dbname=" . $this->dbName . ";charset=utf8";
            try {
                $this->pdoInstance = new PDO($dsn, $this->dbUser, $this->dbPassword, array(PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES 'utf8';"));
                $this->pdoInstance->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
                $this->pdoInstance->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
            } catch (PDOException $e) {
                $err = 'errCode:' . $e->getCode() . "\n" . 'errMsg:' . $e->getMessage() . "\n";
                $err .= "trace:\n" . $e->getTraceAsString();
                $this->Logs->error($err);
                $this->pdoInstance = null;
            }
        }
        return $this->pdoInstance;
    }

    /**
     * 查询多条数据
     * 如果无数据，返回空数组;
     * 如果sql错误,返回false;
     * @param string $sql sql语句
     * @param array $params 参数数组
     * @return array|bool
     */
    function queryRecords($sql, $params = array())
    {
        $pdo = $this->getPDOInstance();
        if (!$pdo) {
            return false;
        }
        try {
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
            $resultSet = array();
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $resultSet[] = $row;
            }
            return $resultSet;
        } catch (PDOException $e) {
            $err = 'errCode:' . $e->getCode() . "\n" . 'errMsg:' . $e->getMessage() . "\n";
            $err .= "trace:\n" . $e->getTraceAsString();
            $this->Logs->error($err);
            return false;
        }
    }

    /**
     * 查询单条记录
     * 如果无数据，返回null;
     * 如果sql错误,返回false;
     * @param string $sql sql语句
     * @param array $params 参数数组
     * @return bool|mixed|null
     */
    function querySingleRecord($sql, $params = array())
    {
        $pdo = $this->getPDOInstance();
        if (!$pdo) {
            return false;
        }
        try {
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
            $resultSet = array();
            if ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                return $row;
            }
            return null;
        } catch (PDOException $e) {
            $err = 'errCode:' . $e->getCode() . "\n" . 'errMsg:' . $e->getMessage() . "\n";
            $err .= "trace:\n" . $e->getTraceAsString();
            $this->Logs->error($err);
            return false;
        }
    }

    /**
     * 增删改通用方法
     * @param string $sql sql语句
     * @param array $params 参数数组
     * @return bool  true/false 是否成功
     */
    function query($sql, $params = array())
    {
        $pdo = $this->getPDOInstance();
        if (!$pdo) {
            return false;
        }
        try {
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
            return true;
        } catch (PDOException $e) {
            $err = 'errCode:' . $e->getCode() . "\n" . 'errMsg:' . $e->getMessage() . "\n";
            $err .= "trace:\n" . $e->getTraceAsString();
            $this->Logs->error($err);
            return false;
        }
    }

    /**
     * 增删改通用方法，返回受影响的行数
     * @param string $sql sql语句
     * @param array $params 参数数组
     * @return bool|int     如果不为false,则为受影响的行数
     */
    function queryReturnRowCount($sql, $params = array())
    {
        $pdo = $this->getPDOInstance();
        if (!$pdo) {
            return false;
        }
        try {
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
            $rowCount = $stmt->rowCount();
            return $rowCount;
        } catch (PDOException $e) {
            $err = 'errCode:' . $e->getCode() . "\n" . 'errMsg:' . $e->getMessage() . "\n";
            $err .= "trace:\n" . $e->getTraceAsString();
            $this->Logs->error($err);
            return false;
        }
    }

    /**
     * 新增单条记录并返回自增id
     * 如果成功，返回自增id
     * 如果sql错误，返回 false
     * @param string $sql sql语句
     * @param array $params 需要插入的列=>值 (数组)
     * @return bool|string
     */
    function addDataReturnID($sql, $params = array())
    {
        $pdo = $this->getPDOInstance();
        if (!$pdo) {
            return false;
        }
        try {
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
            $id = $pdo->lastInsertId();
            return $id;
        } catch (PDOException $e) {
            $err = 'errCode:' . $e->getCode() . "\n" . 'errMsg:' . $e->getMessage() . "\n";
            $err .= "trace:\n" . $e->getTraceAsString();
            $this->Logs->error($err);
            return false;
        }
    }

    /**
     * 事务处理
     * @param $sqls array sql语句数组
     * @param $paramArray array 参数数组
     * @return bool
     */
    function queryWithTransaction($sqls, $paramArray)
    {
        $pdo = $this->getPDOInstance();
        if (!$pdo) {
            return false;
        }
        $pdo->setAttribute(PDO::ATTR_AUTOCOMMIT, 0);
        try {
            $pdo->beginTransaction();
            for ($i = 0; $i < count($sqls); $i++) {
                $stmt = $pdo->prepare($sqls[$i]);
                $stmt->execute($paramArray[$i]);
            }
            $pdo->commit();
            $result = true;
        } catch (PDOException $e) {
            $pdo->rollback();
            $err = 'errCode:' . $e->getCode() . "\n" . 'errMsg:' . $e->getMessage() . "\n";
            $err .= "trace:\n" . $e->getTraceAsString();
            $this->Logs->error($err);
            $result = false;
        }
        $pdo->setAttribute(PDO::ATTR_AUTOCOMMIT, 1);
        return $result;
    }

    /**
     * 拼接查询的sql语句
     * @param string $table 表名
     * @param array|string $columns 需要查询的字段 ( 'count(*)'->统计; '*'-> 查询所有;多个查询则放在数组中)
     * @param array $conditionKeyValArr 查询的条件， ( array("mid"=>2 [,...]) )
     * @param array $searchKeyArr 需要搜索的字段数组
     * @param boolean $hasPage 是否需要分页
     * @param int $startNum 分页起始数
     * @param int $pageSize 单个分页的大小
     * @param string $orderby 排序的字段
     * @param string $orderway ASC/DESC 升序/降序
     * @return string   拼接后的sql语句
     */
    public function fixQuerySql($table, $columns, $conditionKeyValArr, $searchKeyArr, $hasPage, $startNum, $pageSize, $orderby, $orderway)
    {
        $sql = "select ";
        if ($columns == "count(*)") {
            $sql .= "count(*) as total ";
        } else if (is_array($columns)) {
            foreach ($columns as $_k => $_v) {
                $columns[$_k] = "`" . $_v . "`";
            }
            $columnStr = join(",", $columns);
            $sql .= $columnStr . " ";
        } else {
            $sql .= "* ";
        }
        $sql .= "from " . $table . " ";
        if (count($conditionKeyValArr) > 0) {
            $sql .= "where ";
            $conditionStr = "";
            foreach ($conditionKeyValArr as $key => $value) {
                if (in_array($key, $searchKeyArr)) {
                    $conditionStr .= "`" . $key . "`" . " like ? ";
                } else {
                    $conditionStr .= "`" . $key . "`" . " = ? ";
                }
                $conditionStr .= "and ";
            }
            $sql .= $conditionStr . "1 = 1 ";
        }
        if ($orderby != '') {
            $sql .= "order by `" . $orderby . "` ";
        }
        if (!empty($orderway)) {
            $sql .= " " . $orderway . " ";
        }
        if ($hasPage) {
            $sql .= "limit " . $startNum . "," . $pageSize;
        }
        return $sql;
    }


    public function fixSelectSql($table, $columns, $whereKeyValArr, $searchKeyOperators, $hasPage, $startNum, $pageSize, $orderBy, $orderWay)
    {

    }

    /**
     * 查询单个表的多条数据
     * @param $table        string  表名(例：#__user)
     * @param $columns array|string 需要查询的字段 ( 'count(*)'->统计; '*'-> 查询所有;多个查询则放在数组中)
     * @param $conditionKeyValArr array 查询的条件， ( array("mid"=>2 [,...]) )
     * @param $searchKeyArr array    需要搜索的字段数组
     * @param boolean $hasPage 是否需要分页
     * @param int $startNum 分页：起始数
     * @param int $pageSize 分页大小
     * @param string $orderby 排序字段
     * @param string $orderway ASC/DESC 升序/降序
     * @return array|bool
     */
    function getRecordsFromTable($table, $columns, $conditionKeyValArr, $searchKeyArr, $hasPage, $startNum = 0, $pageSize = 10, $orderby = "", $orderway = "ASC")
    {
        $sql = $this->fixQuerySql($table, $columns, $conditionKeyValArr, $searchKeyArr, $hasPage, $startNum, $pageSize, $orderby, $orderway);
        $conditionValArr = array();
        //如果该字段需要搜索，其值改为 ' %'.$value.'% '
        foreach ($conditionKeyValArr as $key => $value) {
            if (in_array($key, $searchKeyArr)) {
                $conditionValArr[] = '%' . $value . '%';
            } else {
                $conditionValArr[] = $value;
            }
        }
//        return array($sql, $conditionValArr);
        return $this->queryRecords($sql, $conditionValArr);
    }

    //获取单条数据
    function getSingleRecordFromTable($table, $columns, $conditionKeyValArr, $searchKeyArr, $orderby = "", $orderway = "")
    {
        $sql = $this->fixQuerySql($table, $columns, $conditionKeyValArr, $searchKeyArr, true, 0, 1, $orderby, $orderway);
        $conditionValArr = array();
        //如果该字段需要搜索，其值改为 ' %'.$value.'% '
        foreach ($conditionKeyValArr as $key => $value) {
            if (in_array($key, $searchKeyArr)) {
                $conditionValArr[] = "%" . $value . "%";
            } else {
                $conditionValArr[] = $value;
            }
        }
        return $this->querySingleRecord($sql, $conditionValArr);
    }

    /**
     * 统计数据的条数
     * @param string $table 表名
     * @param array $conditionKeyValArr 条件 列=>值
     * @param array $searchKeyArr like模糊查询的字段名
     * @return bool|int 如果不为false,则为统计的条数
     */
    function getRecordCountsFromTable($table, $conditionKeyValArr, $searchKeyArr)
    {
        $sql = $this->fixQuerySql($table, 'count(*)', $conditionKeyValArr, $searchKeyArr, false, 0, 0, '', '');
        $conditionValArr = array();
        //如果该字段需要搜索，其值改为 ' %'.$value.'% '
        foreach ($conditionKeyValArr as $key => $value) {
            if (in_array($key, $searchKeyArr)) {
                $conditionValArr[] = '%' . $value . '%';
            } else {
                $conditionValArr[] = $value;
            }
        }
        $result = $this->querySingleRecord($sql, $conditionValArr);
        if ($result === false) {
            return false;
        }
        $counts = $result['total'];
        return $counts;
    }

    /**
     * 更新表记录
     * @param $table                string  表名
     * @param $updateKeyValArr      array   需要更新的字段数组(键和值)
     * @param $conditionKeyValArr   array   条件的字段数组(键和值)
     * @return bool              true/false 是否成功
     */
    function updateRecords($table, $updateKeyValArr, $conditionKeyValArr)
    {
        $fixData = $this->fixUpdateSql($table, $updateKeyValArr, $conditionKeyValArr);
        $sql = $fixData['sql'];
        $paramArr = $fixData['paramArr'];
        return $this->query($sql, $paramArr);
    }

    /**
     * 新增记录，并返回id
     * @param $table   string   表名
     * @param $keyValArr array  键和值数组
     * @return bool|int      如果不为false,返回刚插入数据的自增字段id
     */
    function insertRecord($table, $keyValArr)
    {
        $fixData = $this->fixInsertSql($table, $keyValArr);
        $sql = $fixData['sql'];
        $paramArr = $fixData['paramArr'];
        return $this->addDataReturnID($sql, $paramArr);
    }

    /**
     * 物理删除记录(慎重选择)，推荐逻辑删除
     * @param $table   string   表名
     * @param $conditionKeyValArr array 条件键和值数组
     * @return bool     如果不为false，则为受影响的行数
     */
    function deleteRecords($table, $conditionKeyValArr)
    {
        $result = array();
        $conditionKeySrtArr = array();
        $conditionValArr = array();
        if (count($conditionKeyValArr) == 0) {
            return false;
        }
        foreach ($conditionKeyValArr as $key => $val) {
            $conditionKeySrtArr[] = " `" . trim($key) . "` = ? ";
            $conditionValArr[] = trim($val);
        }
        $sql = "delete from " . $table . " where " . join(" and ", $conditionKeySrtArr);
//            $result['sql'] = $sql;
//            $result['arr'] = $conditionValArr;
//            $result['res'] = $this->queryReturnRowCount($sql,$conditionValArr);
//            return $result;
        return $this->queryReturnRowCount($sql, $conditionValArr);
    }

    //联表查询
    function selecttoRecords($table, $keyvalue, $conditionKeyValArr)
    {
        $result = array();
        $conditionKeySrtArr = array();
        $conditionValArr = array();
        if (count($conditionKeyValArr) == 0) {
            return false;
        }
        foreach ($conditionKeyValArr as $key => $val) {
            $conditionKeySrtArr[] = " `" . trim($key) . "` = ? ";
            $conditionValArr[] = trim($val);
        }
        $sql = "select " . $keyvalue . " from " . $table . " where " . join(" and ", $conditionKeySrtArr);
        return $this->queryReturnRowCount($sql, $conditionValArr);
    }

    /**
     * 拼接插入sql语句
     * 返回sql语句、和参数数组
     * @param string $table 表名
     * @param array $keyValArr 需要插入的列和值
     * @return array
     */
    function fixInsertSql($table, $keyValArr)
    {
        $keyArr = array();
        $valArr = array();
        foreach ($keyValArr as $key => $val) {
            $keyArr[] = "`" . $key . "`";
            $valArr[] = trim($val);
        }
        $insertStr = join(",", $keyArr);
        $valStr = "";
        for ($i = 1; $i <= count($keyValArr); $i++) {
            $valStr .= "?,";
        }
        if (strlen($valStr) > 0) {
            $valStr = substr($valStr, 0, strlen($valStr) - 1);
        }
        $sql = "insert into " . $table . " (" . $insertStr . ") values ( " . $valStr . " ) ";
        return array("sql" => $sql, "paramArr" => $valArr);
    }

    /**
     * 拼接更新表的sql语句
     * 返回sql语句、参数数组
     * @param string $table 表名
     * @param array $updateKeyValArr 需要更新的列和值
     * @param array $conditionKeyValArr 条件的列和值
     * @return array
     */
    function fixUpdateSql($table, $updateKeyValArr, $conditionKeyValArr)
    {
        $columnArr = array();
        $params = array();
        foreach ($updateKeyValArr as $key => $val) {
            $columnArr[] = "`" . trim($key) . "` = ? ";
            $params[] = trim($val);
        }
        $columnStr = join(",", $columnArr);
        $conditionStr = "";
        if (count($conditionKeyValArr) > 0) {
            $conditionArr = array();
            foreach ($conditionKeyValArr as $key => $val) {
                $conditionArr[] = " `" . trim($key) . "` = ? ";
                $params[] = trim($val);
            }
            $conditionStr .= " where " . join(" and ", $conditionArr);
        }
        $sql = "update " . $table . " set " . $columnStr . $conditionStr;
        return array("sql" => $sql, "paramArr" => $params);
    }

}

?>