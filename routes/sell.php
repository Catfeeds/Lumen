<?php
/**
 * Created by PhpStorm.
 * User: haoziye
 * Date: 2018/3/31
 * Time: 下午1:22
 */
/*
|------------------------------------------------------------------------------
|客户信息
|@author   hao.wei <weihao>
|------------------------------------------------------------------------------
|
 */
$router->post('/Customer/store','Sell\CustomerController@store');
$router->get('/Customer/pageIndex','Sell\CustomerController@pageIndex');
$router->get('/Customer/show','Sell\CustomerController@show');
$router->post('/Customer/update','Sell\CustomerController@update');
$router->get('/Customer/unique','Sell\CustomerController@unique');
$router->get('/Customer/destory','Sell\CustomerController@destory');

/*
|------------------------------------------------------------------------------
|销售订单
|@author   hao.wei <weihao>
|------------------------------------------------------------------------------
|
 */
$router->get('/SellOrder/unique','Sell\SellOrderController@unique');
$router->post('/SellOrder/store','Sell\SellOrderController@store');
$router->post('/SellOrder/update','Sell\SellOrderController@update');
$router->get('/SellOrder/pageIndex','Sell\SellOrderController@pageIndex');
$router->get('/SellOrder/show','Sell\SellOrderController@show');
$router->get('/SellOrder/destory','Sell\SellOrderController@destory');
$router->get('/SellOrder/createPO','Sell\SellOrderController@createPO');