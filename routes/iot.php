<?php
/**
 * mes系统路由放置位置
 * @author  rick.rui  <rick@ruis-ims.cn>
 * @time    2017年10月18日22:48:19
 */

$router->get('iot/iot_alarm/index','Iot\AlarmController@index');
$router->get('iot/iot_alarm/handleResult','Iot\AlarmController@handleResult');
$router->get('iot/iot_work/index','Iot\WorkController@index');
$router->get('iot/iot_cut/index','Iot\CutController@index');