<?php
/**
 * Created by PhpStorm.
 * User: sansheng
 * Date: 17/12/2
 * Time: 上午9:04
 */

/*
|------------------------------------------------------------------------------
|工序
|@author   xujian
|------------------------------------------------------------------------------
| 获取工序列表：getOperations
*/
$router->get('getOperations','Mes\OperationController@select');
$router->get('Operation/getAllOperationAndStep','WorkHour\OperationController@getAllOperationAndStep');




/*
|------------------------------------------------------------------------------
|工艺属性
|@author   sam.shan <sam.shan@ruis-ims.cn>
|------------------------------------------------------------------------------
| 获取工艺属性分页列表：MaterialAttributeDefinition/pageIndex
*/
$router->get('OperationAttributeDefinition/pageIndex','Mes\OperationAttributeDefinitionController@pageIndex');
$router->post('OperationAttributeDefinition/store','Mes\OperationAttributeDefinitionController@store');
$router->get('OperationAttributeDefinition/unique','Mes\OperationAttributeDefinitionController@unique');
$router->post('OperationAttributeDefinition/update','Mes\OperationAttributeDefinitionController@update');
$router->get('OperationAttributeDefinition/show','Mes\OperationAttributeDefinitionController@show');
$router->get('OperationAttributeDefinition/destroy','Mes\OperationAttributeDefinitionController@destroy');