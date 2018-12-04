<?php
/**
 * author: kevin
 * Date: 2018/11/9
 * Time: 下午4:36
 */

namespace  App\Libraries;

class Rsa
{
    private $_encrypt_string;

    public function __construct($input)
    {
        $this->_encrypt_string = $input;
    }

    public static function getPublicKey()
    {
        return config('rsa.PUBLIC_KEY');
    }

    public static function getPrivateKey()
    {
        return config('rsa.PRIVATE_KEY');
    }

    public function enRSA(){
        $aString = $this->_encrypt_string;
        $PUBLIC_KEY = self::getPublicKey();
        $pu_key = openssl_pkey_get_public($PUBLIC_KEY);//这个函数可用来判断公钥是否是可用的
        openssl_public_encrypt($aString, $encrypted, $pu_key);//公钥加密，私钥解密
        $encrypted = base64_encode($encrypted);//加密后的内容通常含有特殊字符，需要编码转换下，在网络间通过url传输时要注意base64编码是否是url安全的
        return $encrypted;
    }

    public function deRSA(){
        $aString = $this->_encrypt_string;
        $PRIVATE_KEY = self::getPrivateKey();;
        $pr_key = openssl_pkey_get_private($PRIVATE_KEY);//这个函数可用来判断私钥是否是可用的
        openssl_private_decrypt(base64_decode($aString), $decrypted, $pr_key);//公钥加密，私钥解密
        return $decrypted;
    }

}