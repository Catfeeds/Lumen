<?php 
/**
 * mes系统路由放置位置
 * @author liming
 * @time   2017年11月22日
 */


/**
 |------------------------------------------------------------------------------
 |部门模块
 |@author   liming   
 |@reviser  liming
 |------------------------------------------------------------------------------
 | 部门列表：department
 */
 $router->get('departments','Mes\DepartmentsController@select');

 /**
 |------------------------------------------------------------------------------
 |业务伙伴路由
 |@author   liming   
 |------------------------------------------------------------------------------
 | 业务伙伴列表：getpartners
 | 查看具体某体业务伙伴的信息
 */
$router->get('getpartners','Mes\PartnersController@select');
$router->get('partners/show','Mes\PartnersController@show');


/**
 |------------------------------------------------------------------------------
 |采购组销售组路由
 |@author   liming   
 |------------------------------------------------------------------------------
 | 业务伙伴列表：Agentgroups/select
 */
$router->get('agentgroups/select','MgmGeneral\GsBasic\AgentgroupsController@select');


/**
 |------------------------------------------------------------------------------
 |采购订单路由
 |@author     xiafengjuan
 |------------------------------------------------------------------------------
 | 获取采购订单
 */
$router->get('getPurchaseOrders','Mes\PurchaseOrderController@index');










