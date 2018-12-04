<?php
/**
 * Created by PhpStorm.
 * User: sansheng
 * Date: 17/9/22
 * Time: 上午5:31
 */

namespace App\Exceptions;

use Exception;

/**
 * 自定义的api异常处理类
 * @author sam.shan  <sam.shan@ruis-ims.cn>
 */
class ApiException extends Exception
{


    /**
     * @param @string $message 异常消息内容
     * @param @int   $code     异常代码
     * @return void
     */
    public function __construct($message = '', $code = 0)
    {
        parent::__construct($message, $code);
    }


}


