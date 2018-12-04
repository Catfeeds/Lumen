<?php
/**
 * Created by PhpStorm.
 * User: ruiyanchao
 * Date: 2018/2/6
 * Time: 下午2:03
 */

/*
 |-----------------------------------------------------------------------
 |生产订单
 |@author rick.rui
 |@reviser  sam.shan  <sam.shan@ruis-ims.cn>
 |----------------------------------------------------------------------
 */

$router->post('ProductOrder/store','Mes\ProductOrderController@store');
$router->post('ProductOrder/update','Mes\ProductOrderController@update');
$router->get('ProductOrder/destroy','Mes\ProductOrderController@destroy');
$router->get('ProductOrder/pageIndex','Mes\ProductOrderController@pageIndex');
$router->get('ProductOrder/show','Mes\ProductOrderController@show');
$router->get('ProductOrder/release','Mes\ProductOrderController@release');
// 批量发布 PO
$router->get('ProductOrder/batchRelease','Mes\ProductOrderController@batchRelease');
$router->get('ProductOrder/productOrderSchedule','Mes\ProductOrderController@productOrderSchedule');
$router->get('ProductOrder/isEcm','Mes\ProductOrderController@isEcm');
$router->get('ProductOrder/productBoard','Mes\ProductOrderController@productBoard');
$router->get('ProductOrder/cancelRelease','Mes\ProductOrderController@cancelRelease');
$router->get('ProductOrder/productOrderOnOff','Mes\ProductOrderController@productOrderOnOff');

/*
 |-----------------------------------------------------------------------
 |生产任务
 |@author rick.rui
 |@reviser  sam.shan  <sam.shan@ruis-ims.cn>
 |----------------------------------------------------------------------
 */

$router->post('WorkTask/store','Mes\WorkTaskController@store');
$router->post('WorkTask/update','Mes\WorkTaskController@update');
$router->post('WorkTask/split','Mes\WorkTaskController@split');
$router->get('WorkTask/destroy','Mes\WorkTaskController@destroy');
$router->get('WorkTask/pageIndex','Mes\WorkTaskController@pageIndex');
$router->get('WorkTask/show','Mes\WorkTaskController@show');

/*
 |-----------------------------------------------------------------------
 |工单
 |@author rick.rui
 |----------------------------------------------------------------------
 */
$router->get('WorkOrder/pageIndex','Mes\WorkOrderController@pageIndex');
$router->get('WorkOrder/show','Mes\WorkOrderController@show');
$router->post('WorkOrder/edit','Mes\WorkOrderController@edit');

/*
 |-----------------------------------------------------------------------
 |APS
 |@author rick.rui
 |----------------------------------------------------------------------
 */

$router->get('APS/getProductOrder','Mes\APSController@getProductOrder');
$router->get('APS/getWorkTask','Mes\APSController@getWorkTask');
$router->get('APS/getWorkOrder','Mes\APSController@getWorkOrder');
$router->get('APS/getProductOrderInfo','Mes\APSController@getProductOrderInfo');

$router->post('APS/simplePlan','Mes\APSController@simplePlan');
$router->post('APS/carefulPlan','Mes\APSController@carefulPlan');
$router->get('APS/getCapacity','Mes\APSController@getCapacity');
$router->post('APS/splitWorkOrder','Mes\APSController@splitWorkOrder');
$router->get('APS/destroy','Mes\APSController@destroy');
$router->post('APS/getCarefulPlan','Mes\APSController@getCarefulPlan');
$router->post('APS/checkCanPlan','Mes\APSController@checkCanPlan');
$router->post('APS/checkCanPlanByPeriod','Mes\APSController@checkCanPlanByPeriod');
$router->post('APS/simplePlanByPeriod','Mes\APSController@simplePlanByPeriod');

/*
 |-----------------------------------------------------------------------
 | 产能 细排
 |@author Bruce.Chu
 |----------------------------------------------------------------------
 */

$router->post('APS/getWorkCenterInfo','Mes\APSController@getWorkCenterInfo');
$router->get('APS/showAllWorkCenters','Mes\APSController@showAllWorkCenters');
$router->get('APS/showWorkCenterRankPlan','Mes\APSController@showWorkCenterRankPlan');
$router->get('APS/getWorkOrdersByDate','Mes\APSController@getWorkOrdersByDate');
/*
 |-----------------------------------------------------------------------
 | 领料单
 |@author lester.you
 |----------------------------------------------------------------------
 */
// 保存领料单
$router->post('MaterialRequisition/store', 'Mes\MaterialRequisitionController@store');
//领料单列表页
$router->get('MaterialRequisition/pageIndex', 'Mes\MaterialRequisitionController@pageIndex');
// 某一详情
$router->get('MaterialRequisition/show', 'Mes\MaterialRequisitionController@show');
// 更新实收数量
$router->post('MaterialRequisition/updateActualReceive', 'Mes\MaterialRequisitionController@updateActualReceiveNumber');
// 修改子项
$router->post('MaterialRequisition/updateItem', 'Mes\MaterialRequisitionController@updateItem');
//刪除領料單
$router->get('MaterialRequisition/delete', 'Mes\MaterialRequisitionController@delete');
// 删除子项
$router->post('MaterialRequisition/deleteItem', 'Mes\MaterialRequisitionController@deleteItem');
// 验证子项可领数量
$router->get('MaterialRequisition/checkItemNumber', 'Mes\MaterialRequisitionController@checkItemNumber');
// 领料单审核
$router->get('MaterialRequisition/auditing', 'Mes\MaterialRequisitionController@auditing');
// 领料单反审
$router->get('MaterialRequisition/unAuditing', 'Mes\MaterialRequisitionController@unAuditing');
// 领料单 获取实时库存
$router->get('MaterialRequisition/getMaterialStorage', 'Mes\MaterialRequisitionController@getMaterialStorage');
// 根据 工单code 获取物料和相应批次
$router->get('MaterialRequisition/getMaterialBatch', 'Mes\MaterialRequisitionController@getMaterialBatch');

// 验证是否生成退料单
$router->get('MaterialRequisition/checkReturnMaterial','Mes\MaterialRequisitionController@checkReturnMaterial');
// 获取生成退料单数据
$router->get('MaterialRequisition/getCreateReturnMaterial','Mes\MaterialRequisitionController@getCreateReturnMaterial');
//生成退料单
$router->post('MaterialRequisition/storeReturnMaterial','Mes\MaterialRequisitionController@storeReturnMaterial');
// 工单齐料检测
$router->post('MaterialRequisition/checkApplyMes','Mes\MaterialRequisitionController@checkApplyMes');
//报工用到的获取实时库存
$router->get('MaterialRequisition/getMaterialStorageInPW','Mes\MaterialRequisitionController@getMaterialStorageInPW');
// 生成车间领/补料单
$router->post('MaterialRequisition/storeWorkShop','Mes\MaterialRequisitionController@storeWorkShop');
//验证是否允许生成 车间退料单
$router->get('MaterialRequisition/checkWorkShopReturnMaterial','Mes\MaterialRequisitionController@checkWorkShopReturnMaterial');
//获取车间退料的 可退库存数量
$router->get('MaterialRequisition/getWorkShopReturnStorage','Mes\MaterialRequisitionController@getWorkShopReturnStorage');
//车间领补退 确认发料、跟新实收数量
$router->post('MaterialRequisition/workShopConfirmAndUpdate','Mes\MaterialRequisitionController@workShopConfirmAndUpdate');
//生成车间退料单
$router->post('MaterialRequisition/storeWorkShopReturn','Mes\MaterialRequisitionController@storeWorkShopReturn');
  //  SAP领料 查询采购仓库和生产仓库
$router->get('MaterialRequisition/getMaterialDepot','Mes\MaterialRequisitionController@getMaterialDepot');
//SAP领料获取相关信息
$router->get('MaterialRequisition/getSapPackingInfo','Mes\MaterialRequisitionController@getSapPackingInfo');

/*
 |-----------------------------------------------------------------------
 |报工单
 |@author ming.li
 |----------------------------------------------------------------------
 */
 // 保存报工单
 $router->post('WorkDeclareOrder/store', 'Mes\WorkDeclareOrderController@store');
 $router->post('WorkDeclareOrder/outStore', 'Mes\WorkDeclareOrderController@outStore');
 $router->post('WorkDeclareOrder/update', 'Mes\WorkDeclareOrderController@update');
 $router->get('WorkDeclareOrder/pageIndex', 'Mes\WorkDeclareOrderController@pageIndex');
 $router->get('WorkDeclareOrder/show', 'Mes\WorkDeclareOrderController@show');
 $router->get('WorkDeclareOrder/storageInstore', 'Mes\WorkDeclareOrderController@storageInstore');
 $router->get('WorkDeclareOrder/destroy','Mes\WorkDeclareOrderController@destroy');
 $router->get('WorkDeclareOrder/getDeclareByPr','Mes\WorkDeclareOrderController@getDeclareByPr');


/*
|-----------------------------------------------------------------------
| 预选原因
|@author lester.you
|----------------------------------------------------------------------
*/
$router->get('Preselection/unique', 'Mes\PreselectionController@unique');
$router->get('Preselection/pageIndex', 'Mes\PreselectionController@selectPage');
$router->get('Preselection/show', 'Mes\PreselectionController@selectOne');
$router->post('Preselection/store', 'Mes\PreselectionController@store');
$router->post('Preselection/update', 'Mes\PreselectionController@update');
$router->post('Preselection/delete', 'Mes\PreselectionController@delete');



/*
|-----------------------------------------------------------------------
|委外工单列表
|@author Ming.Li
|----------------------------------------------------------------------
*/
 $router->get('OutWork/pageIndex','Mes\OutWorkController@pageIndex');
 $router->get('OutWork/show','Mes\OutWorkController@show');
 $router->get('OutWork/getFlowItems','Mes\OutWorkController@getFlowItems');
  //委外相关单据列表
 $router->post('OutWork/storeFlowItems','Mes\OutMachineShopController@storeFlowItems');
 $router->post('OutWork/updateFlowItems','Mes\OutMachineShopController@updateFlowItems');
 $router->get('OutWorkShop/pageIndex', 'Mes\OutMachineShopController@pageIndex');
 $router->get('OutWorkShop/show', 'Mes\OutMachineShopController@show');
 $router->get('OutWorkShop/showSendBack', 'Mes\OutMachineShopController@showSendBack');
 $router->get('OutWorkShop/audit','Mes\OutMachineShopController@audit');
 $router->get('OutWorkShop/noaudit','Mes\OutMachineShopController@noaudit');