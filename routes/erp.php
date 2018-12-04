<?php
/**
 * Created by PhpStorm.
<<<<<<< HEAD
 * User: haoziye
 * Date: 2018/5/8
 * Time: 上午10:57
 */

/*
|------------------------------------------------------------------------------
|bom
|@author   hao.wei <weihao>
|------------------------------------------------------------------------------
|
 */
$router->get('ErpBomData/getErpBomData','Erp\ErpBomDataImportController@getBomData');
$router->get('ErpBomData/importBomData','Erp\ErpBomDataImportController@importBomData');

//拉取Erp生产订单
$router->get('Erp/getErpOrder','Erp\ErpOrderController@getErpOrder');
//将前端传递生产订单数据插入Mes
$router->post('Erp/insertToMes','Erp\ErpOrderController@insertToMes');


$router->get('Erp/getProductionId','Erp\ErpMaterialController@material');
$router->get('Erp/implodeMaterial','Erp\ErpMaterialController@implodeMaterial');

