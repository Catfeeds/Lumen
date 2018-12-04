<?php
/**
 * Created by PhpStorm.
 * 消息路由
 * User: haoziye
 * Date: 2018/1/30
 * Time: 下午3:37
 */


/*
|------------------------------------------------------------------------------
|消息
|@author   hao.wei <weihao>
|------------------------------------------------------------------------------
|
 */

$router->post('Message/sendMessage','Mes\MessageController@sendMessage');
$router->get('Message/sysMessagePageIndex','Mes\MessageController@sysMessagePageIndex');
$router->get('Message/sysMessageDetail','Mes\MessageController@sysMessageDetail');
$router->get('Message/sysMessageDelete','Mes\MessageController@sysMessageDelete');
