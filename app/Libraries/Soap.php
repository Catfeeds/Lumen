<?php
/**
 * Created by PhpStorm.
 * User: lester
 * Date: 2018/8/3 10:50
 * Desc:
 */

namespace App\Libraries;

use Illuminate\Support\Facades\DB;

class Soap
{
    /**
     * soap客户端实例
     * @var \SoapClient $soap
     */
    public static $soap;

    /**
     * Soap constructor.
     * @author lester.you
     */
    private function __construct()
    {
    }

    /**
     * 单例
     * @throws \App\Exceptions\ApiException
     */
    public static function getInstance()
    {
        if (!self::$soap instanceof \SoapClient) {
            self::createSoapClient();
        }
    }

    /**
     * 创建 Soap客户端
     * @throws \App\Exceptions\ApiException
     */
    private static function createSoapClient()
    {
        self::checkFile(config('app.sap_service.wsdl_path'));
        $option = [
            'exceptions' => true,
            'trace' => 1,
            'encoding' => 'UTF-8',
            'login' => config('app.sap_service.username'),
            'password' => config('app.sap_service.password'),
            'default_socket_timeout' => 600,
        ];
        self::$soap = new \SoapClient(config('app.sap_service.wsdl_path'), $option);
    }

    /**
     * 验证WSDL文件
     *
     * @param string $wsdl_path 文件路径
     * @throws \App\Exceptions\ApiException
     */
    private static function checkFile($wsdl_path)
    {
        // 判断WSDL文件是否存在，不存在就重新获取
        if (!is_file($wsdl_path) || !file_exists($wsdl_path) || filesize($wsdl_path) == 0) {
            self::getWSDLFile($wsdl_path);
        }

        $fp = fopen($wsdl_path, 'r');
        $fileStr = "";
        while (!feof($fp)) {
            $buffer = fgets($fp);

            $findArr = ['<wsp:UsingPolicy wsdl:required="true"/>'];
            $replaceArr = ['<wsp:UsingPolicy wsdl:required="false"/>'];
            $findArr[] = config('app.sap_service.wsdl_service_host');
            // 是否为内网
            if (self::isIntranet()) {
                $replaceArr[] = config('app.sap_service.intranet_host');
            } else {
                $replaceArr[] = config('app.sap_service.external_host');
            }
            $lineStr = str_replace(isset($findArr) ? $findArr : [], isset($replaceArr) ? $replaceArr : [], $buffer);
            $fileStr .= $lineStr;
        }
        fclose($fp);
        $fp2 = fopen($wsdl_path, 'w');
        fwrite($fp2, $fileStr);
        fclose($fp2);
    }

    /**
     * 创建WSDL文件
     *
     * @param string $wsdl_path 文件路径
     * @throws \App\Exceptions\ApiException
     */
    public static function getWSDLFile($wsdl_path)
    {
        $auth = sprintf('Authorization: Basic %s', base64_encode(config('app.sap_service.username') . ':' . config('app.sap_service.password'))); // 加入这句
        $opt = array(
            'http' => array(
                'method' => 'GET',
                'header' => "content-type:application/x-www-form-urlencoded\r\n" . $auth . "\r\n", // 把$auth加入到header
            )
        );
        $context = stream_context_create($opt);
        try {
            $wsdl_str = file_get_contents(self::getHost() . config('app.sap_service.wsdl_url'), false, $context);
        } catch (\Exception $e) {
            TEA('2453');
        }
        file_put_contents($wsdl_path, $wsdl_str);
    }

    /**
     * 根据是否内网 获取对应的host
     *
     * @return mixed
     */
    private static function getHost()
    {
        if (self::isIntranet()) {
            return config('app.sap_service.intranet_host');
        } else {
            return config('app.sap_service.external_host');
        }
    }

    /**
     * 判断是否为内网
     *
     * @return bool
     */
    private static function isIntranet()
    {
        $IS_INTRANET = env('IS_INTRANET', 0);
        if (empty($IS_INTRANET)) {
            return false;
        } else {
            return true;
        }
    }

    /**
     * 获取方法
     *
     * @return array
     * @throws \App\Exceptions\ApiException
     */
    public static function getFunctions()
    {
        self::getInstance();
        return self::$soap->__getFunctions();
    }

    /**
     * 获取参数
     *
     * @return array
     * @throws \App\Exceptions\ApiException
     */
    public static function getParams()
    {
        self::getInstance();
        return self::$soap->__getTypes();
    }

    /**
     * @param array $requestData 请求的数据
     * @param string $serviceID 请求接口编号(15位)
     * @param string $targetSysID 目标系统代码
     * @param string $sourceSysID 源系统代码(我们当前系统为 0022)
     * @return mixed
     * @throws \App\Exceptions\ApiException
     */
    public static function doRequest($requestData, $serviceID, $targetSysID, $sourceSysID = '0022')
    {
        self::getInstance();

        $nowTime = time();
        $SrvgUID = md5('Mes_' . $targetSysID . '_' . time() . '_' . rand(100, 999) . '_' . $serviceID);
        $timestamp = date('YmdHis', $nowTime);
//        $xml=self::createRequestXml($requestData, $serviceID, $SrvgUID, $timestamp, $targetSysID, $sourceSysID);
//        pd($xml);

        // 添加记录
        $recordID = self::makeRecord($serviceID, $SrvgUID, $timestamp, $targetSysID, $sourceSysID, $requestData, []);
        if ($recordID) session(['sap_api_record_id' => $recordID]);

        // 执行请求
        try {
            $response = self::$soap->ZfmService(
                ['IvRequest' => self::createRequestXml($requestData, $serviceID, $SrvgUID, $timestamp, $targetSysID, $sourceSysID)]
            );
        } catch (\Exception $e) {
            // 更新记录
            if ($recordID) self::updateResponse($recordID, ['RETURNCODE' => 2452, 'RETURNINFO' => $e->getMessage()]);
            TEA('2452', $e->getMessage());
        }

        if (empty($response->EvResponse)) {
            TEA('2451');
        }
        $responseArr = self::getAspResponse($response);
        // 更新记录
        if ($recordID) self::updateResponse($recordID, $responseArr);
        return $responseArr;
    }

    /**
     * 生成请求xml字符串
     *
     * @example $requestData = [['id' => '111', 'name' => 'ruis','A'=>[1,2,3]],['id' => '222', 'name' => 'rui_si','b'=>[3,4]],]
     *
     * @param array $requestData 为多维数组，最顶层为索引数组(即使最顶层只有一个元素)
     * @param string $serviceID 请求接口编号(15位)
     * @param string $SrvgUID 具有唯一性的随机码(32位)
     * @param string $targetSysID 目标系统代码
     * @param string $sourceSysID
     * @return string
     */
    public static function createRequestXml($requestData = array(), $serviceID, $SrvgUID, $timestamp, $targetSysID = '', $sourceSysID)
    {
        $data = self::add_fix($requestData);
        $requestService = [
            'CONTROL' => [
                'SERVICEID' => $serviceID,
                'SRVGUID' => $SrvgUID,
                'SRVTIMESTAMP' => $timestamp,
                'SOURCESYSID' => $sourceSysID,
                'TARGETSYSID' => $targetSysID,
            ],
            'DATA' => $data
        ];
        return xml_encode($requestService);
    }

    /**
     * 创建xml之前，先对数组进行处理
     *
     * @param array $data
     * @return array
     */
    private static function add_fix($data)
    {
        if (!is_array($data)) return $data;
        $temp = [];
        foreach ($data as $key => $value) {
            if (is_numeric($key)) {
                $key = 'Label_Fix__ITEM+' . $key;
            }
            if (is_array($value)) {
                $value = self::add_fix($value);
            }
            $temp[$key] = $value;
        }
        return $temp;
    }

    /**
     * 处理返回的数据格式 转为多维数组
     *
     * @param object $response
     * @return mixed
     * @throws \App\Exceptions\ApiException
     */
    public static function getAspResponse($response)
    {
        if (empty($response->EvResponse)) {
            TEA('2451');    // 返回数据异常
        }
        try {
            $response = xmlToArray($response->EvResponse);
        } catch (\Exception $e) {
            TEA('2451');
        }
        return $response;
    }

    /**
     * 添加记录
     *
     * @param string $serviceID 接口服务ID
     * @param string $SrvgUID 随机码(32位)
     * @param string $timestamp 格式化的时间 YYYYmmddHHiiss 如：20180829092400
     * @param string $targetSysID 目标系统ID
     * @param string $sourceSysID 源系统ID
     * @param array $requestData 请求的数据
     * @param array $response 接口返回的数据(数组格式)
     * @return mixed
     */
    private static function makeRecord($serviceID, $SrvgUID, $timestamp, $targetSysID, $sourceSysID, $requestData, $response)
    {
        $keyVal = [
            'serviceID' => $serviceID,
            'srvGUID' => $SrvgUID,
            'srvTimestamp' => $timestamp,
            'sourceSysID' => $sourceSysID,
            'targetSysID' => $targetSysID,
            'ctime' => time(),
            'returnCode' => empty($response['RETURNCODE']) ? 1 : $response['RETURNCODE'],
            'data_json' => json_encode($requestData),
            'request_uri' => empty($_SERVER['REQUEST_URI']) ? '' : $_SERVER['REQUEST_URI'],
            'return_json' => json_encode($response)
        ];
        return DB::table(config('alias.sar'))->insertGetId($keyVal);
    }

    /**
     * 针对请求SAP接口返回的不同状态进行判断
     *
     * 注：
     * code为2454, 表示 返回数据格式有误
     *
     * @param $response
     * @return string
     */
    private static function checkResponse($response)
    {
        if (isset($response['RETURNCODE'])) {
            return $response['RETURNCODE'];
        }

        if (isset($response['SERVICERESPONSE']) && isset($response['SERVICERESPONSE']['RETURNCODE'])) {
            $response['SERVICERESPONSE']['RETURNCODE'];
        }

        return '2454';
    }

    /**
     * @param $id
     * @param $response
     */
    private static function updateResponse($id, $response)
    {
        DB::table(config('alias.sar'))
            ->where('id', $id)
            ->update([
                'return_json' => json_encode($response),
                'returnCode' => self::checkResponse($response)
            ]);
    }

}