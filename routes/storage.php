<?php 
/**
 * mes系统路由放置位置
 * @author liming
 * @time    2017年11月22日
 */


/**
 |------------------------------------------------------------------------------
 |厂区模块
 |@author   liming   
 |@reviser  liming
 |------------------------------------------------------------------------------
 | 厂区列表：department
 */
 $router->get('plants','Mes\PlantsController@select');


/**
 |------------------------------------------------------------------------------
 |库存模块
 |@author   liming   
 |@reviser  liming
 |------------------------------------------------------------------------------
 | 业务伙伴列表：depot
 | 业务伙伴列表：depot/store   新增
 | 业务伙伴列表：depot/destroy  删除
 */
$router->get('depots','Mes\DepotsController@select');
$router->get('depots/unique','Mes\DepotsController@unique');
$router->post('depot/store','Mes\DepotsController@store');
$router->get('depot/destroy','Mes\DepotsController@destroy');
$router->post('depot/update','Mes\DepotsController@update');
$router->get('depot/show','Mes\DepotsController@show');
$router->get('depot/pageIndex','Mes\DepotsController@pageIndex');





/**
 |------------------------------------------------------------------------------
 |库存分区
 |@author   liming   
 |@reviser  liming
 |------------------------------------------------------------------------------
 | 
 */
$router->get('subarea/unique','Mes\SubareaController@unique');
$router->get('subarea','Mes\SubareaController@select');
$router->post('subarea/store','Mes\SubareaController@store');
$router->get('subarea/destroy','Mes\SubareaController@destroy');
$router->post('subarea/update','Mes\SubareaController@update');
$router->get('subarea/show','Mes\SubareaController@show');
$router->get('subarea/pageIndex','Mes\SubareaController@pageIndex');




 /**
 |------------------------------------------------------------------------------
 |仓位模块
 |@author   liming   
 |@reviser  liming
 |------------------------------------------------------------------------------
 | 仓位列表：
 */
 $router->get('bin/unique','Mes\BinsController@unique');
 $router->get('bin','Mes\BinsController@select');
 $router->post('bin/store','Mes\BinsController@store');
 $router->get('bin/destroy','Mes\BinsController@destroy');
 $router->post('bin/update','Mes\BinsController@update');
 $router->get('bin/show','Mes\BinsController@show');
 $router->get('bin/pageIndex','Mes\BinsController@pageIndex');



 /**
 |------------------------------------------------------------------------------
 |其他入库
 |@author   liming
 |@reviser  liming
 |------------------------------------------------------------------------------
 | 
 */
 $router->get('otherinstore/unique','Mes\OtherInstoreController@unique');
 $router->post('otherinstore/store','Mes\OtherInstoreController@store');
 $router->get('otherinstore/destroy','Mes\OtherInstoreController@destroy');
 $router->post('otherinstore/audit','Mes\OtherInstoreController@audit');
 $router->post('otherinstore/noaudit','Mes\OtherInstoreController@noaudit');
 $router->get('otherinstore/pageIndex','Mes\OtherInstoreController@pageIndex');
 $router->get('otherinstore/show','Mes\OtherInstoreController@show');
 $router->post('otherinstore/update','Mes\OtherInstoreController@update');



 /**
 |------------------------------------------------------------------------------
 |其他出库
 |@author   liming
 |@reviser  liming
 |------------------------------------------------------------------------------
 | 
 */
 $router->get('otheroutstore/unique','Mes\OtherOutstoreController@unique');
 $router->post('otheroutstore/store','Mes\OtherOutstoreController@store');
 $router->get('otheroutstore/destroy','Mes\OtherOutstoreController@destroy');
 $router->post('otheroutstore/audit','Mes\OtherOutstoreController@audit');
 $router->post('otheroutstore/noaudit','Mes\OtherOutstoreController@noaudit');
 $router->get('otheroutstore/pageIndex','Mes\OtherOutstoreController@pageIndex');
 $router->get('otheroutstore/show','Mes\OtherOutstoreController@show');
 $router->post('otheroutstore/update','Mes\OtherOutstoreController@update');




/**
|------------------------------------------------------------------------------
|期初库存
|@author     xiafengjuan
|------------------------------------------------------------------------------
| 批量导入期初库存
| 导出期初库存模板
| 新增期初库存
| 查看期初库存
| 修改期初库存
| 删除期初库存
| 入库审核
| 期初批量审核
| 入库反审核
 */
$router->post('initialinstore/importExcel','Mes\StorageInitialController@storageinitial_importExcel');
$router->get('initialinstore/exportExcel','Mes\StorageInitialController@exportExcel');
$router->post('AddStorageInitial','Mes\StorageInitialController@store');
$router->get('getStorageInitial','Mes\StorageInitialController@index');
$router->get('getInitialShow','Mes\StorageInitialController@show');
$router->post('UpdateStorageInitial','Mes\StorageInitialController@update');
$router->get('DestroyStorageInitial','Mes\StorageInitialController@destroy');
$router->post('initialinstore/audit','Mes\StorageInitialController@audit');
$router->post('initialinstore/batchaudit','Mes\StorageInitialController@batchaudit');
$router->post('initialinstore/noaudit','Mes\StorageInitialController@noaudit');
 $router->get('initialinstore/unique','Mes\StorageInitialController@unique');



/**
|------------------------------------------------------------------------------
|实时库存
|@author    liming
|------------------------------------------------------------------------------
| 
 */
 $router->get('storageinve/pageIndex','Mes\StorageInveController@pageIndex');
 $router->get('storageinve/show','Mes\StorageInveController@show');
 $router->get('storageinve/showItems','Mes\StorageInveController@showItems');



/**
|------------------------------------------------------------------------------
|入库明细
|@author    liming
|------------------------------------------------------------------------------
| 
 */
 $router->get('instoreitem/pageIndex','Mes\InstoreItemController@pageIndex');



/**
|------------------------------------------------------------------------------
|出库明细
|@author    liming
|------------------------------------------------------------------------------
| 
 */
 $router->get('outstoreitem/pageIndex','Mes\OutstoreItemController@pageIndex');





/**
|------------------------------------------------------------------------------
|库存盘点
|@author     xiafengjuan
|------------------------------------------------------------------------------
| 导出盘点所需的实时库存
| 实时库存导入盘点单
| 盘点单查询
| 盘点单修改实际库存
| 盘点单审核
| 盘点单批量审核
| 盘点单反审核
 */
$router->get('storagecheck/exportExcel','Mes\StorageCheckController@storageinve_exportExcel');
$router->post('storagecheck/importExcel','Mes\StorageCheckController@storageinve_importExcel');
$router->get('getStorageCheck','Mes\StorageCheckController@getCheckList');
$router->post('storagecheck/editcheck','Mes\StorageCheckController@editcheck');
$router->post('storagecheck/audit','Mes\StorageCheckController@audit');
$router->post('storagecheck/batchaudit','Mes\StorageCheckController@batchaudit');
$router->post('storagecheck/noaudit','Mes\StorageCheckController@noaudit');
$router->get('getCheckShow','Mes\StorageCheckController@getCheckShow');
$router->get('getCheckShow/unique','Mes\StorageCheckController@unique');



/**
|------------------------------------------------------------------------------
|库存调拨
|@author     xiafengjuan
|------------------------------------------------------------------------------
| 库存数量验证
| 库存调拨添加
| 库存调拨删除
| 库存调拨批量审核
| 库存调拨审核
| 获取调拨列表
| 调拨显示
| 库存调拨修改
 */
$router->get('StorageInveVerify','Mes\StorageAllocateController@Verify_Data');
$router->post('StorageAllocate/store','Mes\StorageAllocateController@store');
$router->get('StorageAllocate/destroy','Mes\StorageAllocateController@destroy');
$router->post('StorageAllocate/batchaudit','Mes\StorageAllocateController@batchaudit');
$router->post('StorageAllocate/audit','Mes\StorageAllocateController@audit');
$router->get('StorageAllocate/getAllocateList','Mes\StorageAllocateController@getAllocateList');
$router->get('StorageAllocate/show','Mes\StorageAllocateController@show');
$router->post('StorageAllocate/update','Mes\StorageAllocateController@update');
$router->get('StorageAllocate/unique','Mes\StorageAllocateController@unique');


// $router->post('storagecheck/audit','Mes\StorageCheckController@audit');




/**
|------------------------------------------------------------------------------
|基础资料的一些接口  
|@author   liming
|作用：    用来做autocomplete
|------------------------------------------------------------------------------
|1    负责人             employee  
|2    部门               department  
|3    往来单位列表       partner
|4    供应商列表         vendor
|5    客户列表           customer
|6    入库分类           instorecateory
|7    出库分类           outstorecateory
 */
$router->get('basedata/employeeShow','Mes\BasedataController@employeeshow');
$router->get('basedata/departmentShow','Mes\BasedataController@departmentshow');
$router->get('basedata/partnerShow','Mes\BasedataController@partnershow');
$router->get('basedata/vendorShow','Mes\BasedataController@vendorshow');
$router->get('basedata/customerShow','Mes\BasedataController@customershow');
$router->get('basedata/instoreCategoryShow','Mes\BasedataController@instoreCategoryShow');
$router->get('basedata/outstoreCategoryShow','Mes\BasedataController@outstoreCategoryShow');
$router->get('basedata/wareHuseTreeShow','Mes\BasedataController@wareHuseTreeShow');
$router->get('basedata/treeFatherShow','Mes\BasedataController@treeFatherShow');


/**
|------------------------------------------------------------------------------
|库存签转
|@author   liming
|------------------------------------------------------------------------------
| 库存数量验证
| 库存调拨添加
| 库存调拨删除
| 库存调拨批量审核
| 库存调拨审核
| 获取调拨列表
| 调拨显示
| 库存调拨修改
 */
$router->get('StorageInveChange','Mes\StorageChangeController@Change_Data');
$router->post('StorageInveChange/store','Mes\StorageChangeController@store');
$router->get('StorageInveChange/destroy','Mes\StorageChangeController@destroy');
$router->post('StorageInveChange/batchaudit','Mes\StorageChangeController@batchaudit');
$router->post('StorageInveChange/audit','Mes\StorageChangeController@audit');
$router->get('StorageInveChange/getChangeList','Mes\StorageChangeController@getChangeList');
$router->get('StorageInveChange/show','Mes\StorageChangeController@show');
$router->post('StorageInveChange/update','Mes\StorageChangeController@update');
$router->get('StorageInveChange/unique','Mes\StorageChangeController@unique');