<?php

namespace  App\Libraries;
/**
 * 测试使用的Curl
 * @author sam.shan  <sam.shan@ruis-ims.cn>
 * @todo  如果想使用curl的话,请去composer中安装正规的类库,此处是用来测试的
 */
class Curl {

    static function post($url, &$errno = 0, &$httpcode = 0, &$error = "", $post = array(), $options = array())
    {

        $defaults = array(
            CURLOPT_POST => 1,
            CURLOPT_HEADER => 0,
            CURLOPT_URL => $url,
            CURLOPT_FRESH_CONNECT => 1,
            CURLOPT_RETURNTRANSFER => 1,
            CURLOPT_FORBID_REUSE => 1,
            CURLOPT_TIMEOUT => 10,
        );
        if (is_string($post))
        {
            $defaults[CURLOPT_POSTFIELDS] = $post;
        }
        else
        {
            $defaults[CURLOPT_POSTFIELDS] = http_build_query($post);
        }
        $ch = curl_init();
        curl_setopt_array($ch, ($options + $defaults));
        $result = curl_exec($ch);
        $errno = curl_errno($ch);
        if ($errno)
        {
            $error = 'Curl error: ' . curl_error($ch).".";
        }
        $httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        if ($httpcode < 200 || $httpcode >= 300)
        {
            $error.="httpcode:" . $httpcode;
        }
        curl_close($ch);
        return $result;
    }

    /**
     * Send a GET requst using cURL
     * @param string $url to request
     * @param array $get values to send
     * @param array $options for cURL
     * @return string
     */
    static function get($url, &$errno = 0, &$httpcode = 0, &$error = "", array $get = array(), array $options = array())
    {
        $defaults = array(
            CURLOPT_URL => $url . (strpos($url, '?') === FALSE ? '?' : '') . http_build_query($get),
            CURLOPT_HEADER => 0,
            CURLOPT_RETURNTRANSFER => TRUE,
            CURLOPT_TIMEOUT => 10
        );
        $ch = curl_init();
        curl_setopt_array($ch, ($options + $defaults));
        $result = curl_exec($ch);
        $errno = curl_errno($ch);
        if ($errno)
        {
            $error = 'Curl error: ' . curl_error($ch);
        }
        $httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        if ($httpcode < 200 || $httpcode >= 300)
        {
            $error.="httpcode:" . $httpcode;
        }
        curl_close($ch);
        return $result;
    }

}
