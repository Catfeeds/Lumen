<?php
/*
|------------------------------------------------------------------------------
|称重sap
|@author   liming
|------------------------------------------------------------------------------
|
 */
$router->post('/OffcutWeright/store','Mes\OffcutWerightController@store');
$router->get('/OffcutWeright/pageIndex','Mes\OffcutWerightController@pageIndex');
$router->get('/OffcutWeright/show','Mes\OffcutWerightController@show');
$router->post('/OffcutWeright/update','Mes\OffcutWerightController@update');
$router->get('/OffcutWeright/unique','Mes\OffcutWerightController@unique');
$router->get('/OffcutWeright/destroy','Mes\OffcutWerightController@destory');
$router->get('/OffcutWeright','Mes\OffcutWerightController@select');


/*
|------------------------------------------------------------------------------
|称重  基础数据
|@author   liming
|------------------------------------------------------------------------------
 */
$router->get('/Offcut','Mes\OffcutController@select');
$router->get('/Offcut/unique','Mes\OffcutController@unique');
$router->post('/Offcut/store','Mes\OffcutController@store');
$router->get('/Offcut/destroy','Mes\OffcutController@destroy');
$router->post('/Offcut/update','Mes\OffcutController@update');
$router->get('/Offcut/show','Mes\OffcutController@show');