<?php
/**
 * BOM路由放置位置
 * @author  rick.rui
 * @time    2017年12月04日13:26:18
 */

/*
 |-----------------------------------------------------------------------
 |物料清单
 |@author rick.rui
 |@reviser sam.shan
 |----------------------------------------------------------------------
 | 唯一性检测:               Bom/unique
 | 添加:                    Bom/store
 | 修改:                    Bom/update
 | 详情:                    Bom/show
 | 分页列表:                 Bom/pageIndex
 | 获取bom树信息:            Bom/getBomTree
 | 获取设计bom列表:           Bom/getDesignBom
 | 修改bom状态:              Bom/changeStatus
 | 发布版本前检查:            Bom/releaseBeforeCheck
 */


$router->get('Bom/unique','Mes\BomController@unique');
$router->post('Bom/store','Mes\BomController@store');
$router->post('Bom/update','Mes\BomController@update');
$router->get('Bom/destroy','Mes\BomController@destroy');
$router->get('Bom/show','Mes\BomController@show');
$router->get('Bom/pageIndex','Mes\BomController@pageIndex');
$router->get('Bom/getBomTree','Mes\BomController@getBomTree');
$router->get('Bom/getDesignBom','Mes\BomController@getDesignBom');
$router->get('Bom/changeStatus','Mes\BomController@changeStatus');
$router->get('Bom/changeAssembly','Mes\BomController@changeAssembly');
$router->get('Bom/releaseBeforeCheck','Mes\BomController@releaseBeforeCheck');
$router->get('Bom/getEnterBomMaterial','Mes\BomController@getEnterBomMaterial');
$router->get('Bom/getOutBomMaterial','Mes\BomController@getOutBomMaterial');
$router->get('Bom/getMaterialBomNos','Mes\BomController@getMaterialBomNos');
$router->post('Bom/assemblyItem','Mes\BomController@assemblyItem');


/*
 |-----------------------------------------------------------------------
 |物料清单分组
 |@author rick.rui
 |@reviser sam.shan
 |----------------------------------------------------------------------
 | 唯一性检测:               BomGroup/unique
 | 添加:                    BomGroup/store
 | 修改:                    BomGroup/update
 | 查看:                    BomGroup/show
 | select列表:              BomGroup/select
 | 分页列表:                 BomGroup/pageIndex
 | 删除:                    BomGroup/destroy
 */

$router->get('BomGroup/unique','Mes\BomGroupController@unique');
$router->post('BomGroup/store','Mes\BomGroupController@store');
$router->post('BomGroup/update','Mes\BomGroupController@update');
$router->get('BomGroup/show','Mes\BomGroupController@show');
$router->get('BomGroup/select','Mes\BomGroupController@select');
$router->get('BomGroup/pageIndex','Mes\BomGroupController@pageIndex');
$router->get('BomGroup/destroy','Mes\BomGroupController@destroy');

/*
 |-----------------------------------------------------------------------
 |制造bom
 |@author rick.rui
 |----------------------------------------------------------------------
 | 添加:                    Bom/store
 | 详情:                    Bom/show
 | 分页列表:                 Bom/pageIndex
 */
$router->get('ManufactureBom/pageIndex','Mes\ManufactureBomController@pageIndex');
$router->post('ManufactureBom/store','Mes\ManufactureBomController@store');
$router->get('ManufactureBom/show','Mes\ManufactureBomController@show');
$router->get('ManufactureBom/destroy','Mes\ManufactureBomController@destroy');
$router->post('ManufactureBom/update','Mes\ManufactureBomController@update');

/*
 |-----------------------------------------------------------------------
 |bom工艺路线
 |@author hao.wei
 |----------------------------------------------------------------------

 */
$router->post('BomRouting/storeLZP','Mes\BomRoutingController@storeLZP');
$router->get('BomRouting/getBomRouting','Mes\BomRoutingController@getBomRouting');
$router->post('BomRouting/saveBomRoutinginfo','Mes\BomRoutingController@saveBomRoutinginfo');
$router->get('BomRouting/getBomRoutings','Mes\BomRoutingController@getBomRoutings');
$router->get('BomRouting/deleteBomRouting','Mes\BomRoutingController@deleteBomRouting');
$router->get('BomRouting/getPreviewData','Mes\BomRoutingController@getPreviewData');
$router->get('BomRouting/getNeedCopyBomRoutingNodeInfo','Mes\BomRoutingController@getNeedCopyBomRoutingNodeInfo');
$router->get('BomRouting/getNeedCopyBomList','Mes\BomRoutingController@getNeedCopyBomList');
$router->get('BomRouting/getBomRoutingDownloadData','Mes\BomRoutingController@getBomRoutingDownloadData');
$router->get('BomRouting/getBomRoutingBaseQty','Mes\BomRoutingController@getBomRoutingBaseQty');
$router->post('BomRouting/updateBomRoutingBaseQty','Mes\BomRoutingController@updateBomRoutingBaseQty');
$router->get('BomRouting/deleteEnterMaterialLzp','Mes\BomRoutingController@deleteEnterMaterialLzp');
$router->post('BomRouting/replaceBomRoutingGn','Mes\BomRoutingController@replaceBomRoutingGn');
$router->get('BomRouting/getCanReplaceBom','Mes\BomRoutingController@getCanReplaceBom');
/*
 |-----------------------------------------------------------------------
 |调用ERP接口，添加bom
 |@author kevin
 |----------------------------------------------------------------------

 */
$router->get('ERP/handleOrder','Mes\ErpbomController@handleOrder');
