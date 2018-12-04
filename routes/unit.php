<?php
/**
 * @message 单位维护
 * @author  liming
 * @time    18年 9月 1日
 */	
/*
|------------------------------------------------------------------------------
|公司
|@author   ming.li
|------------------------------------------------------------------------------
|
 */
$router->post('Unit/store','Mes\UnitController@store');
$router->get('Unit/unique','Mes\UnitController@unique');
$router->get('Unit/show','Mes\UnitController@show');
$router->get('Unit/pageIndex','Mes\UnitController@pageIndex');
$router->post('Unit/update','Mes\UnitController@update');
$router->get('Unit/delete','Mes\UnitController@delete');
$router->get('Unit/select','Mes\UnitController@select');