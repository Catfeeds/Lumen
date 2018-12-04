<?php
/**
 * Created by PhpStorm.
 * User: lester
 * Date: 2018/8/7 13:54
 * Desc:
 */
/*
 |-----------------------------------------------------------------------
 | SAP pp
 | @author lester.you
 |----------------------------------------------2------------------------
 |
 */

$router->post('Sap/syncBom', 'Sap\ImportSapBomController@importSapBomData');
$router->post('Sap/syncWorkCenter', 'Mes\WorkCenterController@syncWorkCenter');
// 同步生产订单
$router->post('Sap/syncProductOrder', 'Sap\SyncSapProductOrderController@syncSapProductOrder');
$router->post('Sap/syncProductOrderStatus', 'Mes\ProductOrderController@syncProductOrderStatus');
$router->post('Sap/syncMaterial', 'Sap\SyncSapMaterialController@syncSapMaterial');
$router->get('Sap/syncRoute', 'Procedure\ProcedureController@syncToSap');

// 推送领料单
$router->get('Sap/syncMaterialRequisition', 'Mes\MaterialRequisitionController@syncMaterialRequisition');

/*
 |-----------------------------------------------------------------------
 | SAP mm
 | @author Ming.Li
 |----------------------------------------------------------------------
 |
 */
//同步采购订单
$router->post('Sap/syncPurchaseOrder', 'Mes\PurchaseOrderController@syncPurchaseOrder');

//同步送检单
$router->post('Sap/syncInspectOrder', 'Mes\CheckItemController@syncInspectOrder');

 //同步委外领料单
$router->post('Sap/syncOutMachine','Mes\OutMachineController@syncOutMachine');

// 同步委外领料单结果
$router->post('Sap/syncPickingResult','Mes\MaterialRequisitionController@syncPickingResult');

// 同步车间领料单结果
$router->post('Sap/syncShopResult','Mes\MaterialRequisitionController@syncShopResult');

//推送领料结果
// $router->get('Sap/pushPickingResult','Mes\MaterialRequisitionController@pushPickingResult');

//推送检验单
$router->get('sap/pushInspectOrder','Mes\CheckItemController@pushInspectOrder');

//推送委外ZY04、ZY05、ZY06等相关单据
$router->get('Sap/pushOutMachineZy','Mes\OutMachineZyController@pushOutMachineZy');

// 推送sap  称重接口
$router->get('Sap/pushOffcutWeright','Mes\OffcutWerightController@pushOffcutWeright');

// 推送sap报工单
$router->get('Sap/pushWorkDeclareOrder','Mes\WorkDeclareOrderController@pushWorkDeclareOrder');

//SRM推送索赔单
$router->get('Srm/pushClaim','Mes\ClaimController@pushClaim');

//生成相关单据
$router->get('MaterialRe/capacityFill','Mes\WorkDeclareOrderController@capacityFill');

/*
|-----------------------------------------------------------------------
| SAP import
| @author haoziye
|----------------------------------------------------------------------
|
*/
$router->post('Sap/importSapBomData','Sap\ImportSapBomController@importSapBomData');

/*
|-----------------------------------------------------------------------
| SAP 洗标
| @author lester.you
|----------------------------------------------------------------------
|
*/
//  洗标-翻单  (SAP发起的请求)
$router->post('Sap/copyCareLabel','Mes\CareLabelController@copyCareLabel');
//  同步 洗标 给SAP
$router->post('Sap/syncCareLabel','Mes\CareLabelController@syncCareLabel');


//日志
$router->get('Sap/pageIndex', 'Sap\ApiRecord@pageIndex');

