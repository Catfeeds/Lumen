<?php
/**
|------------------------------------------------------------------------------
|半成品仓库管理路由
|订单列表 order/index
|编辑订单 order/update
|@author   sam.shan   <sam.shan@ruis-ims.cn>
|------------------------------------------------------------------------------
 */


$router->get('order/index','Mes\OrderController@index');
$router->post('order/in_storage/{id}','Mes\OrderController@In_storage');