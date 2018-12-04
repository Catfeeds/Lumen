<?php
/**
 * Created by PhpStorm.
 * User: haoziye
 * Date: 2018/5/16
 * Time: 下午4:04
 */
namespace App\Exceptions;
use Exception;
use Throwable;

class ApiParamException extends Exception{

    public function __construct($message = "")
    {
        parent::__construct($message);
    }
}