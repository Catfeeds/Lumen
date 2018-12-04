<?php
/**
 * 自定义的公共函数
 * @author   sam.shan  <sam.shan@ruis-ims.cn>
 * @time     2017年09月14日10:14:51
 * @todo    当使用第三方函数库的时候,请务必将第三方函数库至于不同的命名空间下
 *
 */


/**
 * print_r的调试输出,不停止继续执行
 * @return void
 * @author sam.shan <sam.shan@ruis-ims.cn>
 */
function p()
{
    $arr = func_get_args();
    foreach ($arr as $_arr) {
        echo "<pre>";
        print_r($_arr);
        echo "</pre>";
    }
}


/**
 * print_r的调试输出,停止程序继续执行
 * @return void
 * @author sam.shan <sam.shan@ruis-ims.cn>
 */
function pd()
{
    $arr = func_get_args();
    foreach ($arr as $_arr) {
        echo "<pre>";
        print_r($_arr);
        echo "</pre>";
    }
    die(1);
}


/**
 * var_dump的调试输出,不停止程序继续执行
 * @return void
 * @author sam.shan <sam.shan@ruis-ims.cn>
 */
function d()
{
    $arr = func_get_args();
    foreach ($arr as $_arr) {
        echo "<pre>";
        var_dump($_arr);
        echo "</pre>";
    }
}


/**
 * 常量输出调试函数  返回所有常量的关联数组，键是常量名，值是常量值
 * @param string $key 指明要获取具体的常量组
 * @return  void
 * @author  sam.shan <sam.shan@ruis-ims.cn>
 *
 */
function pc($key = NULL)
{
    $const = get_defined_constants(true);
    if ($key && isset($const[$key])) $const = $const[$key];
    echo '<pre>';
    print_r($const);
    echo '</pre>';
}


/**
 * 封装PHP内核抛出异常的全局函数
 * @param $message  string   异常消息内容
 * @param $code     string   异常代码
 * @throws Exception
 * @author        sam.shan  <sam.shan@ruis-ims.cn>
 */
function TE($message, $code = 0)
{
    throw new \Exception($message, $code);
}

/**
 * 封装抛出API异常的全局函数
 * 注意,则方法故意将底层参数颠倒
 * @param $code     int      异常代码,通过该代码可以找到对应的message
 * @param $field  string     异常的参数名称,可以不传递
 * @throws \App\Exceptions\ApiException
 * @author        sam.shan  <sam.shan@ruis-ims.cn>
 */

function TEA($code, $field = '')
{
    throw new \App\Exceptions\ApiException($field, $code);
}

/**
 * @param int $code
 * @param string $field
 * @param string|null $value
 * @return array
 * @author  sam.shan  <sam.shan@ruis-ims.cn>
 * update by xin.min 20180416:
 * update content: add parameter $value=null; if $value!=null  return $response['value']=$value;
 */
function get_api_response($code, $field = '', $value = null)
{
    //初始化返回值
    $response = ['code' => $code];
    //添加field值
    if (!empty($field)) $response['field'] = $field;
    //惰性加载code码配置的文件
    $code = intval($code);
    //700~799特殊处理,该段码,为了兼容历史遗留问题
    if ($code >= 700 && $code <= 799) {
        $response['message'] = 'Parameter ' . $field . ' missing or invalid value.';
        //为了方便前端翻查数据, 添加$value, 后端将异常数据返回给前端; 默认json格式;
        if (!is_null($value)) {
            $response['value'] = $value;
        }
    } else {
        $odd = $code % 100;
        $interval = $code - $odd;
        $error_config_path = dirname(__FILE__) . '/../../config/codes/' . $interval . '_' . ($interval + 99) . '.php';
        //先判断文件是否存在
        if (!is_file($error_config_path)) {
            $response['message'] = $error_config_path . ' not exist.';
        } else {
            $error_config = include_once($error_config_path);
            $response['message'] = isset($error_config[$code]) ? $error_config[$code] : '';
        }
    }
    return $response;
}

/**
 * 自定义异常传入自己想返回的动态信息
 * @param string $message
 * @throws \App\Exceptions\ApiParamException
 */
function TEPA($message = '')
{
    throw new \App\Exceptions\ApiParamException($message);
}

/**
 * 封装SAP 接口抛出API异常的全局函数
 *
 * @param string $code
 * @param string $message
 * @throws \App\Exceptions\ApiSapException
 */
function TESAP($code = '', $message = '')
{
    throw new \App\Exceptions\ApiSapException($message, $code);
}

/**
 * 参数异常返回方法
 * @param string $message
 * @return array
 */
function get_api_exception_response($message = '')
{
    $response = [];
    $response['code'] = 0;
    $response['message'] = !empty($message) ? $message : "未知异常";
    return $response;
}

/**
 * 仅适用于SAP接口
 *
 * 封装SAP接口抛出异常
 * 借用系统的错误记录
 *
 * @param $code
 * @param string $field
 * @param null $value
 * @return array
 * @author lester.you
 */
function get_api_sap_exception_response($code, $field = '', $value = null)
{
    $res = get_api_response($code, $field, $value);
    $response = [
        'RETURNCODE' => $res['code'],
        'RETURNINFO' => $res['message'],
    ];
    if (!empty($res['field'])) {
        $response['RETURNINFO'] .= "  Info:" . $res['field'];
    }

    // 更新接口日志数据
    if (!empty(session('sap_api_record_id'))) {
        $SapApiRecord = new \App\Http\Models\SapApiRecord();
        $recordOjb = $SapApiRecord->getControl(session('sap_api_record_id'));
        if ($recordOjb) {
            $SapApiRecord->updateStatus(session('sap_api_record_id'), $code, $response);
            $response['SERVICEID'] = $recordOjb->serviceID;
            $response['SRVGUID'] = $recordOjb->srvGUID;
        }
        session(['sap_api_record_id' => 0]);
    }
    return $response;
}

/**
 * 是get_api_response的特殊封装,仅仅针对成功的返回
 * @param $results
 * @param $paging
 * @return array
 * $author sam.shan   <sam.shan@ruis-ims.cn>
 */
function get_success_api_response($results = [], $paging = NULL)
{
    $response = ['code' => '200', 'message' => 'OK', 'results' => $results];
    if ($paging) $response['paging'] = $paging;
    return $response;

}

/**
 * 仅适用于SAP接口
 *
 * 封装SAP 接口的返回数据
 *
 * @param array $input
 * @param array $results
 * @param array $data
 * @return array
 * @author lester.you
 */
function get_success_sap_response($input = [], $results = [])
{
    $response = [
        'RETURNCODE' => 0,
        'RETURNINFO' => 'success',
    ];
    if (!empty($input)) {
        $response['SERVICEID'] = $input['CONTROL']['SERVICEID'];
        $response['SRVGUID'] = $input['CONTROL']['SRVGUID'];
    }
    if (!empty($results)) {
        $response['DATA'] = $results;
    }
    return $response;
}

/**
 * 兼容中文的截取字符方法
 * @param $text    string  待截取的字符本身,比如某个事物的描述信息
 * @param $length  int    截取的长度
 * @return string
 * @author   sam.shan   <sam.shan@ruis-ims.cn>
 */
function subtext($text, $length)
{
    if (mb_strlen($text, 'utf8') > $length)
        return mb_substr($text, 0, $length, 'utf8') . '...';
    else
        return $text;
}


/**
 * 判断某个字符串是否是json格式
 * @param $string
 * @return bool
 * @author  sam.shan   <sam.shan@ruis-ims.cn>
 */
function is_json($string)
{
    try {
        json_decode($string);
    } catch (\Exception $e) {
        return false;
    }
    return true;
}


/**
 * 去除左右空格符号
 * @param $input
 * @return void
 * @author  sam.shan  <sam.shan@ruis-ims.cn>
 */
function trim_strings(&$input)
{
    foreach ($input as $key => &$value) {
        $value = is_string($value) ? trim($value) : $value;
    }
}


/**
 * 将NULL转成空字符
 * @param $input
 * @return void
 * @author  sam.shan  <sam.shan@ruis-ims.cn>
 */
function null2strings(&$input)
{
    foreach ($input as $key => &$value) {
        $value = is_null($value) ? '' : $value;
    }
}


/**
 * 求一维数组的差集以及交集
 * @param array $input_ids 如 [11,12,13,29]
 * @param array $db_ids 如 [11,12,13]
 * @return array
 * @author  sam.shan <sam.shan@ruis-ims.cn>
 */
function get_array_diff_intersect($input_ids, $db_ids)
{
    $add_set = array_diff($input_ids, $db_ids);
    $del_set = array_diff($db_ids, $input_ids);
    $common_set = array_intersect($db_ids, $input_ids);
    return ['add_set' => $add_set, 'del_set' => $del_set, 'common_set' => $common_set];
}


/**
 * 处理祖宗树,返回数组
 * @param string $forefathers 来源于数据库的forefathers字段值
 * @return array
 * @author sam.shan
 */
function filter_forefathers($forefathers)
{
    return array_values(array_filter(explode(',', $forefathers)));
}


/**
 * 产生分布式uuid,我们将-拼接符号去掉就返回32位了,否则返回36位字符
 * @return string
 * @author sam.shan <sam.shan@ruis-ims.cn>
 *
 */
function create_uuid()
{
    $char_id = strtoupper(md5(uniqid(mt_rand(), true)));//3D2056F9538E219E7D83C733BF6FBFEC
    //$hyphen = chr(45);// 这里的值就是 -    chr() 函数从指定的 ASCII 值返回字符。ASCII 值可被指定为十进制值、八进制值或十六进制值。八进制值被定义为带前置 0，而十六进制值被定义为带前置 0x。
    $uuid = substr($char_id, 6, 2)
        . substr($char_id, 4, 2)
        . substr($char_id, 2, 2)
        . substr($char_id, 0, 2)
        //.$hyphen
        . substr($char_id, 10, 2)
        . substr($char_id, 8, 2)
        //.$hyphen
        . substr($char_id, 14, 2)
        . substr($char_id, 12, 2)
        //.$hyphen
        . substr($char_id, 16, 4)
        //.$hyphen
        . substr($char_id, 20, 12);//F956203D-8E53-9E21-7D83-C733BF6FBFEC
    return $uuid;
}


/**
 * 产生随机码
 * @param bool $length
 * @return string
 * @author  sam.shan <sam.shan@ruis-ims.cn>
 */
function make_random_code($length = false)
{

    $length = $length ? $length : 8;
    //注意激活码中不能有很特殊的符号，比如#yYFMAUJ  这个激活码我们用get解析的时候就获取不了，因为#的语言，锚点啊,或者发送的时候激活码做加密处理就好了
    $str = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    $code = substr(str_shuffle($str), 0, $length);
    return $code;
}

/**
 * 标准对象转换成数组(不支持复杂的对象以及层级深的对象)
 * @param $obj
 * @author  sam.shan  <sam.shan@ruis-ims.cn>
 */
function obj2array($obj)
{
    if (empty($obj)) return [];
    return json_decode(json_encode($obj), true);
}


/**
 * number_format的别名函数
 *
 * @param int|string $number
 *          要格式化的数字
 * @param int $decimals
 *          规定多少个小数
 * @param string $decimalpoint
 *          规定用作小数点的字符串
 * @param string $separator
 *          规定用作千位分隔符的字符串
 * @return string $return
 *         格式化后的数字
 * @author liming
 */
function nf($number = 0, $decimals = 2, $decimalpoint = '.', $separator = '')
{
    return number_format($number, $decimals, $decimalpoint, $separator);
}


/**
 * 去掉小数点后面的0和.
 * @param $number
 * @param int|string $number
 *          要格式化的数字
 * @author liming
 * @return string
 */
function rnf($number, $decimals = 4)
{
    return rtrim(rtrim(nf($number, $decimals), '0'), '.');
}


/**
 * 求两个日期之间相差的天数
 * @param int $day1
 * @param int $day2
 * @return int
 */
function diff_between_twodays($day1, $day2)
{
    if ($day1 < $day2) {
        $tmp = $day2;
        $day2 = $day1;
        $day1 = $tmp;
    }
    return ($day1 - $day2) / 86400;
}


/**
 * session公共方法
 * @param null $key
 * @param null $default
 * @return \Laravel\Lumen\Application|mixed
 * @author  sam.shan  <sam.shan@ruis-ims.cn>
 */
function session($key = null, $default = null)
{
    $session = app('session');

    if (is_null($key)) {
        return $session;
    }
    if (is_array($key)) {
        return $session->put($key);
    }

    return $session->get($key, $default);
}


/**
 * 这里是对明文密码进行加盐md5
 * @param  string $clear_text_password 明文密码
 * @return string                     加密后的密码
 */
function encrypted_password($clear_text_password, $salt = '')
{
    return md5($clear_text_password . $salt);
}


/**
 * 打招呼
 * @return string
 * @author sam.shan <sam.shan@ruis-ims.cn>
 */
function say_hello()
{
    $h = date('H', time());
    if ($h < 6) {
        return '凌晨好';
    } else if ($h < 9) {
        return '早上好';
    } else if ($h < 12) {
        return '上午好';
    } else if ($h < 14) {
        return '中午好';
    } else if ($h < 17) {
        return '下午好';
    } else if ($h < 19) {
        return '傍晚好';
    } else if ($h < 22) {
        return '晚上好';
    } else {
        return '夜里好';
    }

}


/**
 * 判断是否是postman
 * @return bool
 * @author sam.shan <sam.shan@ruis-ims.cn>
 */
function is_postman()
{
    return !empty($_SERVER['HTTP_POSTMAN_TOKEN']) ? TRUE : FALSE;
}

/**
 * 返回数组中对应值的id
 * @param $data
 * @param $value
 * @return int
 */
function get_id($data, $value)
{
    $id = 0;
    foreach ($data as $row) {
        if ($row['name'] == $value) {
            $id = $row['id'];
        }
    }
    return $id;
}


/**检测是否是邮箱
 * @param $email
 * @return bool
 * @TODO  使用php内置的方法也可以  filter_var
 * @author  sam.shan   <sam.shan@ruis-ims.cn>
 *
 */
function check_email_regular($email)
{
    if (!preg_match('/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/', $email)) return false;
    return true;
}


/**
 * 检测是否是中文名称
 * @param $cn_name
 * @return bool
 * @author  sam.shan  <sam.shan@ruis-ims.cn>
 */
function check_cn_name_regular($cn_name)
{
    if (!preg_match('/^[\x{4e00}-\x{9fa5}]{2,5}$/u', $cn_name)) return false;
    return true;
}


/**
 * 检测是否是手机号
 * @param $mobile
 * @return bool
 * @author  sam.shan  <sam.shan@ruis-ims.cn>
 *
 */
function check_mobile_regular($mobile)
{
    if (!preg_match('/^(13[0-9]|14[5|7]|15[0|1|2|3|5|6|7|8|9]|18[0|1|2|3|5|6|7|8|9])\d{8}$/', $mobile)) return false;
    return true;
}


/**
 * 检测管理员密码格式是否正确
 * @param $password
 * @param $pattern
 * @return bool
 * @author  sam
 */
function check_admin_password_regular($password, $pattern = NULL)
{
    if (empty($pattern)) $pattern = '/^.{6,18}$/';
    if (!preg_match($pattern, $password)) return false;
    return true;
}

/**
 * 得到新订单号
 * @param  $prefix
 * @return  string
 * @author  rick
 */
function get_order_sn($prefix = '')
{
    #函数str_pad会将某个值填充到指定的长度，如这里不足5位数的时候，会在左边填充0的
    return $prefix . date('Ymd') . str_pad(mt_rand(1, 99999), 5, '0', STR_PAD_LEFT);
}

/**
 * @param int $bom_material_id bom母件主键
 * @param int $version 版本号
 * @param bool $replace 是否要替代
 * @param bool $bom_item_qty_level 是否要阶梯用量
 * @return string
 * @author  sam.shan  <sam.shan@ruis-ims.cn>
 */
function make_bom_cache_key($bom_material_id, $version = 1, $replace = TRUE, $bom_item_qty_level = False)
{
    $replace = $replace ? '1' : '0';
    $bom_item_qty_level = $bom_item_qty_level ? '1' : '0';
    return md5($bom_material_id . '_' . $version . '_' . $replace . '_' . $bom_item_qty_level);
}

function make_redis_key($param)
{
    $key = '';
    if (is_array($param)) {
        $key = implode($param, '-');
    } else {
        $key .= $key;
    }
    return md5($key);
}

function xmlToArray($xml)
{
    //禁止引用外部xml实体
//    libxml_disable_entity_loader(true);
    $xmlObj = simplexml_load_string($xml, 'SimpleXMLElement', LIBXML_NOCDATA);
    $val = json_decode(json_encode($xmlObj), true);
    return $val;
}

/**
 * XML编码 (只限于SAP WebService)
 * @param mixed $data 数据
 * @param string $encoding 数据编码
 * @param string $root 根节点名
 * @return string
 */
function xml_encode($data, $encoding = 'utf-8', $root = 'SERVICE')
{
    $xml = '<?xml version="1.0" encoding="' . $encoding . '"?>';
    $xml .= '<' . $root . '>';
    $xml .= data_to_xml($data);
    $xml .= '</' . $root . '>';
    return $xml;
}

/**
 * 数据XML编码 (只限于SAP WebService)
 * @param mixed $data 数据
 * @return string
 */
function data_to_xml($data)
{
    $xml = '';
    foreach ($data as $key => $val) {
//        is_numeric($key) && $key = "item id=\"$key\"";
        if (preg_match('/^Label_Fix__([0-9a-zA-Z]+)\+([0-9a-zA-Z]+)$/', $key, $matches)) {
            $key = !empty($matches[1]) ? $matches[1] : 'ITEM';
            $xml .= "<$key>";
            $xml .= (is_array($val) || is_object($val)) ? data_to_xml($val) : xml_special_character_encode($val);
            list($key,) = explode(' ', $key);
            $xml .= "</$key>";
        } else {
            if ($val === '') {
                $xml .= "<$key/>";   // 如果某个是空字符串 则为 <emptyValue/>
            } else {
                $xml .= "<$key>";
                $xml .= (is_array($val) || is_object($val)) ? data_to_xml($val) : xml_special_character_encode($val);
                list($key,) = explode(' ', $key);
                $xml .= "</$key>";
            }
        }
    }
    return $xml;
}

/**
 * 把SAP接口数据存入txt文件，用户测试
 * @param $input
 */
function api_to_txt($input, $path)
{
    $data = '[' . date('Y-m-d H:i:s') . ']:' . PHP_EOL;
    $data .= "route:" . $path . PHP_EOL;
    $data .= "input:" . json_encode($input) . PHP_EOL;
    $data .= "server:" . json_encode($_SERVER) . PHP_EOL;
//    $data .= "POST:" . json_encode($_POST) . PHP_EOL;
//    $data .= "GET:" . json_encode($_GET) . PHP_EOL;
    $fileName = !empty($path) ? str_replace('/', '_', $path) : 'default';

    // 如果路径不存在，就递归创建
    $filePath = __DIR__ . '/../../storage/logs/sap/';
    if (!is_dir($filePath)) {
        $res = mkdir($filePath, 0766, true);
        $res == true && chmod($filePath, 0766);
    }
    $fp = fopen($filePath . $fileName . '_' . date('Y-m-d', time()) . '.txt', 'a+');
    fwrite($fp, $data);
    fclose($fp);
}

/**
 * 如果$input 不存在或为null，则返回默认值
 *
 * @param array|object $input
 * @param string $index
 * @param string $defaultValue
 * @return string
 */
function get_value_or_default($input, $index, $defaultValue = '')
{
    if (is_array($input) && isset($input[$index])) {
        return $input[$index];
    }

    if (is_object($input) && isset($input->{$index})) {
        return $input->{$index};
    }

    return $defaultValue;
}

/**
 * 统计数组中 某个值出现的次数
 *
 * @param array $arr
 * @param string $value
 * @return int
 */
function array_count_one_value($arr, $value)
{
    $tempArr = array_count_values($arr);
    if (empty($tempArr[$value])) {
        return 0;
    }
    return $tempArr[$value];
}

/**
 * 向上取 n 位小数
 *
 * @example ceil_dot(3.141,2) = 3.15
 * @param float $value
 * @param int $n
 * @return float
 */
function ceil_dot($value, $n = 2)
{
    return ceil($value * pow(10, $n)) / (pow(10, $n));
}

/**
 * xml 特殊字符转义
 *
 * @param $tag
 * @return mixed
 */
function xml_special_character_encode($tag)
{
    $tag = str_replace("&", "&amp;", $tag);
    $tag = str_replace("<", "&lt;", $tag);
    $tag = str_replace(">", "&gt;", $tag);
    $tag = str_replace("'", "&apos;", $tag);
    $tag = str_replace("\"", '&quot;', $tag);
    return $tag;
}

/**
 * 根据code 获取自定义的错误信息
 *
 * @param string $code
 * @return string
 */
function get_error_info_by_code($code)
{
    if (empty($code) || $code < 0 || !is_numeric($code)) {
        return '';
    }

    $odd = $code % 100;
    $interval = $code - $odd;
    $file_name = $interval . '_' . ($interval + 99) . '.php';
    $error_config_path = dirname(__FILE__) . '/../../config/codes/' . $file_name;
    //先判断文件是否存在
    if (!is_file($error_config_path)) {
        return '';
    } else {
        global ${'error_config' . $file_name};
        empty(${'error_config' . $file_name}) && ${'error_config' . $file_name} = include_once($error_config_path);
        return isset(${'error_config' . $file_name}[$code]) ? ${'error_config' . $file_name}[$code] : '';
    }
}

/**
 * 判断当前的运行环境是否是cli模式
 *
 * @return bool
 */
function is_cli()
{
    return preg_match("/cli/i", php_sapi_name()) ? true : false;
}

/**
 * 根据不同环境，获取HTTP_HOST
 *
 * @return mixed|string
 */
function get_host()
{
    if (is_cli()) {
        return config('app.cli_http_host');
    }
    return $_SERVER['REQUEST_SCHEME'] . '://' . $_SERVER['HTTP_HOST'];
}