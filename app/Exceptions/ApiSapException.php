<?php
/**
 * Created by PhpStorm.
 * User: lester
 * Date: 2018/8/8 11:05
 * Desc:
 */

namespace App\Exceptions;

/**
 * Sap 接口异常。
 * Class ApiSapException
 * @package App\Exceptions
 */
class ApiSapException extends \Exception
{
    public function __construct($message = '', $code = 0)
    {
        parent::__construct($message, $code);
    }

}