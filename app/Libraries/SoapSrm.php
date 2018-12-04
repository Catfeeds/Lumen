<?php
/**
 * Created by PhpStorm.
 * User: lester
 * Date: 2018/9/20 9:10
 * Desc:
 */

namespace App\Libraries;

use Illuminate\Support\Facades\DB;

class SoapSrm
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
        self::checkFile(config('app.srm_webservice.wsdl_path'));
        $option = [
            'exceptions' => true,
            'trace' => 1,
            'encoding' => 'UTF-8',
            'login' => config('app.srm_webservice.username'),
            'password' => config('app.srm_webservice.password'),
            'default_socket_timeout' => 600,
        ];
        self::$soap = new \SoapClient(config('app.srm_webservice.wsdl_path'), $option);
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
    }

    /**
     * 创建WSDL文件
     *
     * @param string $wsdl_path 文件路径
     * @throws \App\Exceptions\ApiException
     */
    public static function getWSDLFile($wsdl_path)
    {
        $auth = sprintf('Authorization: Basic %s',
            base64_encode(config('app.srm_webservice.username') . ':' . config('app.srm_webservice.password'))); // 加入这句
        $opt = array(
            'http' => array(
                'method' => 'GET',
                'header' => "content-type:application/x-www-form-urlencoded\r\n" . $auth . "\r\n", // 把$auth加入到header
            )
        );
        $context = stream_context_create($opt);
        try {
            $wsdl_str = file_get_contents(self::getHost() . config('app.srm_webservice.wsdl_url'), false, $context);
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
            return config('app.srm_webservice.intranet_host');
        } else {
            return config('app.srm_webservice.external_host');
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
    public static function doRequest($content, $cate_code = 'QMS_CLAIM_FORM', $code = 'PUR_QMS_CLAIM_FORM_IMP')
    {
        self::getInstance();

        $header = self::getHeader($cate_code, $code);
        $data = [
            'HEADER' => $header,
            'CONTEXT' => $content
        ];

        // 添加记录
        $recordID = self::makeRecord($cate_code . '#' . $code, $header['REQUEST_ID'], $data, []);
        if ($recordID) session(['sap_api_record_id' => $recordID]);

        // 执行请求
        try {
            $response = self::$soap->execute($data);
        } catch (\Exception $e) {
            // 更新记录
            if ($recordID) self::updateResponse($recordID, ['RETURNCODE' => 2452, 'RETURNINFO' => $e->getMessage()]);
            TEA('2452', $e->getMessage());
        }

        $responseArr = self::getResponse($response);

        // 更新记录
        if ($recordID) self::updateResponse($recordID, $responseArr);
        return $responseArr;
    }

    /**
     * @param $cate_code
     * @param $code
     * @return array
     */
    public static function getHeader($cate_code, $code)
    {
        return [
            'BUSINESS_GROUP' => 'BG00000101',
            'SYSTEM_CODE' => 'BG00000101_SAP',
            'REQUEST_ID' => substr(md5($cate_code . '#' . $code . time() . rand(100, 999)), 0, 29),
            'IF_CATE_CODE' => $cate_code,
            'IF_CODE' => $code,
            'USER_NAME' => config('app.srm_webservice.username'),
            'PASSWORD' => config('app.srm_webservice.password'),
            'BATCH_NUM' => 1,
            'SEG_NUM' => 1,
            'TOTAL_SEG_COUNT' => 1
        ];

    }

    /**
     * 处理返回的数据格式 转为多维数组
     *
     * @param object $response
     * @return mixed
     * @throws \App\Exceptions\ApiException
     */
    public static function getResponse($response)
    {
        if (empty($response->RESPONSE_HEADER)) {
            TEA('2451');    // 返回数据异常
        }
        try {
            $response = obj2array($response->RESPONSE_HEADER);
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
     * @param array $requestData 请求的数据
     * @param array $response 接口返回的数据(数组格式)
     * @return mixed
     */
    private static function makeRecord($serviceID, $SrvgUID, $requestData, $response = [])
    {
        $keyVal = [
            'serviceID' => $serviceID,
            'srvGUID' => $SrvgUID,
            'srvTimestamp' => date('YmdHis'),
            'sourceSysID' => 0,
            'targetSysID' => 0,
            'ctime' => time(),
            'returnCode' => empty($response['RETURNCODE']) ? 0 : $response['RETURNCODE'],
            'data_json' => json_encode($requestData),
            'request_uri' => empty($_SERVER['REQUEST_URI']) ? '' : $_SERVER['REQUEST_URI'],
            'return_json' => json_encode($response)
        ];
        return DB::table(config('alias.sar'))->insertGetId($keyVal);
    }

    /**
     * @param $id
     * @param $response
     */
    private static function updateResponse($id, $response)
    {
        $code = 1;
        if (isset($response['RETURNCODE'])) {
            $code = $response['RETURNCODE'];
        } else {
            if (!empty($response['RESPONSE_STATUS']) && $response['RESPONSE_STATUS'] == 'SUCCESSED') {
                $code = 0;
            }
        }

        DB::table(config('alias.sar'))
            ->where('id', $id)
            ->update([
                'return_json' => json_encode($response),
                'returnCode' => $code
            ]);
    }

}