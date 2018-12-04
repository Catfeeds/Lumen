<?php
/**
 * Created by PhpStorm.
 * User: sansheng
 * Date: 17/9/21
 * Time: 上午9:25
 */
namespace App\Http\Models;
use function FastRoute\TestFixtures\empty_options_cached;
use Illuminate\Support\Facades\DB;//引入DB操作类
use Illuminate\Support\Facades\Cache;
use App\Libraries\RequestFormatter;
use Exception;
/**
 * 数据操作类Base
 * @author  sam.shan  <sam.shan@ruis-ims.cn>
 * @time    2017年09月19日15:37:39
 */
class Base
{

    /**
     * 与模型关联的数据表全名,可继承,所以设置为protected
     * @var string
     */
    protected $table;
    /**
     * 默认的主键ID字段名称,控制器层可以直接访问,所以设置为public
     * @var string
     */
    public $primaryKey='id';

    /**
     * api主键名称
     * @var
     */
    protected  $apiPrimaryKey;


    public function __construct()
    {
        //无
    }


//region   sam定义的基类方法

    /**
     * 根据表主键获取一条记录
     * @param int $id             主键
     * @param string $fields  字段名  通过一维数组传递查询的字段,如['field1','field2'...]
     * @param bool|string $table     表名
     * @param string $connection 连接名
     * @return mixed
     * @author  sam.shan   <sam.shan@ruis-ims.cn>
     */
    public function getRecordById($id,$fields='*',$table=false,$connection='mysql')
    {
        $table=$table?$table:$this->table;
        return DB::connection($connection)->table($table)->select($fields)->where('id','=',$id)->first();
    }

    /**
     * 根据主键删除一条记录
     * @param $id
     * @param $table
     * @param $connection
     * @throws \Exception
     * @author   sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function destroyById($id,$table=false,$connection='mysql')
    {
        $table=$table?$table:$this->table;
        return DB::connection($connection)->table($table)->where('id','=',$id)->delete();
    }

    /**
     * 根据主键修改一条记录
     * @param $id
     * @param $data
     * @param bool $table
     * @param string $connection
     * @return mixed
     * @author  sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function updateById($id,$data,$table=false,$connection='mysql')
    {
        $table=$table?$table:$this->table;
        return DB::connection($connection)->table($table)->where('id',$id)->update($data);
    }
    /**
     * @param $where
     * @$table 可以指明表名的,默认是当前模型对应的表名
     * @$connection 可以指明连接
     * @return mixed
     * @author sam.shan   <sam.shan@ruis-ims.cn>
     */
    public function  isExisted($where,$table=false,$connection='mysql')
    {
        $table=$table?$table:$this->table;
//        return DB::connection($connection)->table($table)->where($where)->limit(1)->toSql();
        return DB::connection($connection)->table($table)->where($where)->limit(1)->count();
    }

    /**
     * 由于该方法依赖于模型获取的数据库对象格式,所以封装在了模型基类中
     * @param $obj
     * @return array
     * @author sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function pluckObj2Array($obj)
    {
        $arr=[];
        foreach ( $obj as $key=>$value) {
            $arr[$key]=$value;
        }
        return $arr;
    }
    /*
     * 根据主键的值获取某个字段的值
     * @param $id       主键ID
     * @param $field    想获取的某个字段的名称
     * @param $table
     * @param $connection
     * @return string   该字段的值
     * @author  sam.shan   <sam.shan@ruis-ims.cn>
     */
    public function getFieldValueById($id,$field,$table=false,$connection='mysql')
    {
        $table=$table?$table:$this->table;
        $obj=DB::connection($connection)->table($table)->select($field)->where('id','=',$id)->first();
        return isset($obj->$field)?$obj->$field:'';
    }

    /**
     * 判断操作模式是添加还是编辑,如果是编辑,则检测是否存在对应的记录
     * @param $input
     * @throws \App\Exceptions\ApiException
     * @author  sam.shan <sam.shan@ruis-ims.cn>
     */
    public  function  judgeApiOperationMode($input)
    {
        //判断操作模式
        $add=empty($input[$this->apiPrimaryKey])?true:false;
        //如果是编辑判断要编辑的存不存在
        if(!$add){
            $has=$this->isExisted([['id','=',$input[$this->apiPrimaryKey]]]);
            if(!$has) TEA('700',$this->apiPrimaryKey);
        }

        return $add;
    }


    /**
     * 根据cookie获取用户信息
     * @param $cookie
     * @param array $fields 通过一维数组传递查询的字段,如['field1','field2'...]
     * @return mixed
     * @throws \App\Exceptions\ApiException
     * @author  sam.shan <sam.shan@ruis-ims.cn>
     */
    public function getUserInfoByCookie($cookie,$fields='*')
    {
        $value = Cache::store('memcached')->get($cookie);
        if (empty($value)) return false;
        //以'"'隔开作为分割字符
        $values = explode('"', $value);
        $loginToken = $values[1];//start_login    dh|database
        if($loginToken=='start_login') return false;
        //通过登录的用户认证唯一标志，取得用户id
        return DB::Table(config('alias.u'))->select($fields)->where('token', '=', $loginToken)->first();
    }

    /**
     * 根据cookie获取用户的具体的某个字段信息
     * @param $cookie
     * @param array $field 如name或者id等
     * @return mixed
     * @throws \App\Exceptions\ApiException
     * @author  sam.shan <sam.shan@ruis-ims.cn>
     */
    public function getUserFieldByCookie($cookie,$field)
    {
        $obj=$this->getUserInfoByCookie($cookie,[$field]);
        return isset($obj->$field)?$obj->$field:'';
    }



//endregion
//region 李明定义的基类方法
    /**
     * 查询$id 数据的status
     * @param $id
     * @return stauts  
     * @author liming
     */
    public function  getStatus($id)
    {
        return DB::table($this->table)->select('status')->where($this->primaryKey,'=',$id)->get();
    }


    /*
     * 根据条件获取  某个字段集合
     * @param $where     where 条件
     * @param $field    想获取的某个字段的名称
     * @author liming
     */
    public function getLists($where,$field='*')
    {
        $obj=DB::table($this->table)->select($field)->where($where)->get();
        $list  = [];
        if (count($obj) > 0)
        {
            foreach ($obj as $key => $value) {
               $list[]  = $value->$field;
            }
        }
        return $list;
    }

    /**
     * 根据唯一条件获取某个字段值
     * @param $id
     * @param $table
     * @param $field   要获取的某个字段值
     * @reviser  sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function getFieldValueByWhere($where,$field,$table=false)
    {
        $table=$table?$table:$this->table;
        $obj = DB::table($table)->select($field)->where($where)->first();
        return isset($obj->$field)?$obj->$field:'';
    }


    /*
     * 根据条件获取  某个字段集合
     * @param $where     where 条件
     * @param $field    想获取的某个字段的名称
     * @author liming
     */
    public function getListsByWhere($where,$field='*')
    {
        $obj=DB::table($this->table)->select($field)->where($where)->get();
        $list   =  $this->pluckObj2Array($obj);
        return $list;
    }

    /**
     * 根据条件删除记录
     * @param $where
     * @param $table
     * @throws \Exception
     * @author liming
     */
    public function destroyByWhere($where,$table=false)
    {
        if(empty($where) || !is_array($where))  TEA('905', "Parameter illegality");
   
        $table=$table?$table:$this->table;
        return DB::table($table)->where($where)->delete();
    }
//endregion




//region rick定义的基类方法

    /**
     * 获取制定的规则
     * @return array
     */
    public function getApiRules()
    {
        $rules = array();
        //获取当前模型下的规则
        $allRules = $this->getRules();
        //追踪获取模型方法名
        $trace = debug_backtrace(DEBUG_BACKTRACE_IGNORE_ARGS,3);
        $function = $trace[2]['function'];
        //获取当前请求方法下的参数规则
        foreach ($allRules as $key=>$value){
            $tmp = isset($value['on'])?explode(',',$value['on']):array();
            if(!in_array($function,$tmp)){
                unset($allRules[$key]);
            }
        }
        //$allRules合并到$rules
        if (!empty($allRules) && is_array($allRules)) {
            $rules = array_merge($rules, $allRules);
        }
        //获取公共规则
        $apiCommonRules = config('app.apiCommonRules');
        //$apiCommonRules合并数组到$rules
        if (!empty($apiCommonRules) && is_array($apiCommonRules)) {
            $rules = array_merge($apiCommonRules, $allRules);
        }
        return $rules;
    }

    /**
     * 获取参数设置的规则
     * 由开发人员根据需求重载
     * @return array
     */
    public function getRules()
    {
        return array();
    }

    /**
     * 格式规则检查
     *
     * @param array $input
     * @throws Exception
     */
    protected function checkRules(&$input)
    {
        //获取api规则 循环判断
        foreach ($this->getApiRules() as $key => $rule) {
            $input[$key] = $this->getByRule($rule,$input);
        }
    }

    /**
     * 接口参数过滤
     * @param $rule
     * @param $input
     * @return null
     * @throws Exception
     */
    public function getByRule($rule,$input)
    {
        //必填字段 name
        if (!isset($rule['name'])) {
            throw new Exception('miss name for rule');
        }
        //格式化处理数组
        $rs = $this->format($rule['name'], $rule, $input);

        //必填的情况下 不为空 或 null
        if (($rs === NULL || $rs === '') && (isset($rule['require']) && $rule['require'])) {
            $name = $rule['name'];
            TEA('700', $name);
        }

        return $rs;
    }

    /**
     * 统一格式化操作
     * @param $varName
     * @param $rule
     * @param $params
     * @return null
     */
    public function format($varName, $rule, $params)
    {
        //优先给value赋值default参数
        $value = isset($rule['default']) ? $rule['default'] : NULL;
        //获取type类型
        $type = !empty($rule['type']) ? strtolower($rule['type']) : 'string';
        //获取键值
        $key = isset($rule['name']) ? $rule['name'] : $varName;
        //获取请求中的值
        $value = isset($params[$key]) ? $params[$key] : $value;
        //去空格操作
        $value = is_string($value) ? trim($value) : $value;

        if ($value === NULL && $type != 'file') { //排除文件类型
            return $value;
        }
        //组合模式 统一分发
        return $this->formatAllType($type, $value, $rule);
    }

    /**
     * 统一分发处理
     * @param $type
     * @param $value
     * @param $rule
     * @return mixed
     * @throws Exception
     */
    protected  function formatAllType($type, $value, $rule) {
        $Defautl = 'App\Libraries\RequestFormatter\Formatter' . ucfirst($type);;
        $formatter = new $Defautl;
        $name = $rule['name'];
        if (!($formatter instanceof RequestFormatter)) {
            throw new Exception("invalid type: $type for rule: $name");
        }
        return $formatter->parse($value, $rule);
    }
//endregion

//region hao.wei

    /**
     * 二维数组根据键值去重
     * @param $arr
     * @param $str 传入的键
     * @return array
     */
    function qc($arr,$str){
        $temp = [];
        foreach ($arr as $value) {
            empty($temp[$value[$str]]) &&
            $temp[$value[$str]]=$value;
        }
        return array_values($temp);
    }

//endregion

//region xin.min定义的基类方法;
    //是否正常/正确;
    public function isCurrect($type){

    }
    //是否唯一
    public function isUnique($type){

    }

    /**
     * 判断字段值是否存在
     * @param      $field 字段名
     * @param      $value 要判断的值
     * @param bool $table 要判断的表
     * @return bool true/false
     * @author xin.min 20180626
     * @update xin.min 改名为isHave
     */
    public function isHave($field, $value, $table = false)
    {
        $where = [[$field, '=', $value]];
        $has = $this->isExisted($where, $table);
        if ($has) return true;
        return false;
    }


//endregion


//region   Bruce定义的基类方法
    /**
     * 二维数组转换为一维关系数组
     * [[key=>value],[key=>value],[key=>value]] => [key=>value,key=>value,key=>value]
     * @param $array
     * @return array
     */
    public function twoDemension2One($array)
    {
        $result=[];
        foreach ($array as $value){
            foreach ($value as $k=>$v){
                $result[$k]=$v;
            }
        }
        return $result;
    }

    /**
     * 根据某个字段的值获取主键id 该字段值唯一对应主键id
     * @param $field
     * @param $value
     * @param bool $table
     * @param string $connection
     * @return string
     */
    public function getIdByFieldValue($field,$value,$table=false,$connection='mysql')
    {
        $table=$table?$table:$this->table;
        $id=DB::connection($connection)->table($table)->where($field,$value)->value('id');
        return isset($id)?$id:'';
    }
//endregion

}