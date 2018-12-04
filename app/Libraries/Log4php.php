<?php
/**
 * 一个多才多艺的php日志组件
 * A versatile logging framework for PHP
 * @author  sam.shan <sam.shan@ruis-ims.cn>
 * @time    2017年09月17日14:39:44
 */
namespace  App\Libraries;
use Logger;


//由于类直接调用方法,而不会触发构造方法的,所有配置放在这里
$config=include __DIR__."/../../config/log4php.php";
Logger::configure($config);


class Log4php
{
    /**
     * [trace description]
     * @param  [type] $log [description]
     * @return [type]      [description]
     */
    static  public function trace($log)
    {
        Logger::getRootLogger()->trace($log);
    }

    /**
     * [debug description]
     * @param  [type] $log [description]
     * @return [type]      [description]
     */
    static  public function debug($log)
    {
        Logger::getRootLogger()->debug($log);
    }


    /**
     * [info description]
     * @param  [type] $log [description]
     * @return [type]      [description]
     */
    static  public function info($log)
    {
        Logger::getRootLogger()->info($log);
    }


    /**
     * [warn description]
     * @param  [type] $log [description]
     * @return [type]      [description]
     */
    static  public function warn($log)
    {
        Logger::getRootLogger()->warn($log);
    }



    /**
     * [error description]
     * @param  [type] $log [description]
     * @return [type]      [description]
     */
    static  public function error($log)
    {
        Logger::getRootLogger()->error($log);
    }

    /**
     * [fatal description]
     * @param  [type] $log [description]
     * @return [type]      [description]
     */
    static  public function fatal($log)
    {
        Logger::getRootLogger()->fatal($log);
    }



}

