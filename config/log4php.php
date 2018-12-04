<?php
/**
 * Created by PhpStorm.
 * User: sansheng
 * Date: 17/9/17
 * Time: 上午9:02
 */






/**
 * Log4php日志的配置文件
 * @link http://logging.apache.org/log4php/docs/configuration.html
 * @author  sam.shan   <sam.shan@ruis-ims.cn>
 */
return array(
    'rootLogger' => array(
        'appenders' => array('default'),
        'level'=>'DEBUG',//设置日志等级,只有大于或者等于它的才会被记录
    ),


    'appenders' => array(
        //========default配置=====
        'default' => array(
            'class' => 'LoggerAppenderDailyFile',
            'layout' => array(
                'class' => 'LoggerLayoutPattern',
                'params' => array(
                    //定义日志输出格式
                    'conversionPattern' => '%level %date{Y-m-d H:i:s} %msg%newline%ex'
                )
            ),
            'params' => array(
                'datePattern' => 'Y-m-d',
                'file' =>__DIR__."/../storage/logs/sql/log4php-%s.log",
                'append'=>true,//是否是追加
            ),
        ),
        //====================
    )
);