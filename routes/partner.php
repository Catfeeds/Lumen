<?php
/**
 * @message 往来业务伙伴（新）
 * @author  liming
 * @time    18年 11月 26日
 */	
	
/*
|------------------------------------------------------------------------------
|往来业务伙伴（新）
|@author   ming.li
|------------------------------------------------------------------------------
|
*/
$router->post('Partner/store','Mes\PartnerController@store');
$router->get('Partner/unique','Mes\PartnerController@unique');
$router->get('Partner/show','Mes\PartnerController@show');
$router->get('Partner/pageIndex','Mes\PartnerController@pageIndex');
$router->post('Partner/update','Mes\PartnerController@update');
$router->get('Partner/delete','Mes\PartnerController@delete');
$router->get('Partner/select','Mes\PartnerController@select');
// 生成登录用户
$router->get('Partner/upgradeAadmin','Mes\PartnerController@upgradeAadmin');