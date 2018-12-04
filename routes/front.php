<?php
/**
 * Created by PhpStorm.
 * User: sansheng
 * Date: 18/1/8
 * Time: 下午5:41
 */



/*
 |错误控制器
 |-----------------------------------------------------------------------
 |@author sam.shan  <sam.shan@ruis-ims.cn>
 |----------------------------------------------------------------------
 |
 */

$router->get('error/404','Front\ErrorController@noPage');
$router->get('error/412','Front\ErrorController@stop');
$router->get('error/419','Front\ErrorController@expired');
$router->get('error/429','Front\ErrorController@tooMany');
$router->get('error/500','Front\ErrorController@error');
$router->get('error/503','Front\ErrorController@unavailable');





/*
 |首页控制器
 |-----------------------------------------------------------------------
 |@author sam.shan  <sam.shan@ruis-ims.cn>
 |----------------------------------------------------------------------
 | 默认后台欢迎页面:     /
 |
 */
$router->get('/','Front\IndexController@index');


/*
 |个人中心控制器
 |-----------------------------------------------------------------------
 |@author sam.shan  <sam.shan@ruis-ims.cn>
 |----------------------------------------------------------------------
 |
 */
$router->get('CenterManagement/setting','Front\CenterController@setting');
$router->get('CenterManagement/msg','Front\CenterController@msg');
$router->get('CenterManagement/loginLog','Front\CenterController@loginLog');


/*
 |工艺管理控制器
 |-----------------------------------------------------------------------
 |@author sam.shan  <sam.shan@ruis-ims.cn>
 |----------------------------------------------------------------------
 |
 */
$router->get('CraftManagement/attributeIndex','Front\CraftManagementController@attributeIndex');

/*
 |物料管理控制器
 |-----------------------------------------------------------------------
 |@author sam.shan  <sam.shan@ruis-ims.cn>
 |----------------------------------------------------------------------
 |
 */
$router->get('MaterialManagement/attributeIndex','Front\MaterialManagementController@attributeIndex');
$router->get('MaterialManagement/templateIndex','Front\MaterialManagementController@templateIndex');
$router->get('MaterialManagement/templateCreate','Front\MaterialManagementController@templateCreate');
$router->get('MaterialManagement/templateEdit','Front\MaterialManagementController@templateEdit');
$router->get('MaterialManagement/templateView','Front\MaterialManagementController@templateView');
$router->get('MaterialManagement/categoryIndex','Front\MaterialManagementController@categoryIndex');
$router->get('MaterialManagement/materialIndex','Front\MaterialManagementController@materialIndex');
$router->get('MaterialManagement/materialCreate','Front\MaterialManagementController@materialCreate');
$router->get('MaterialManagement/materialEdit','Front\MaterialManagementController@materialEdit');
$router->get('MaterialManagement/materialView','Front\MaterialManagementController@materialView');

/*
 |物料清单管理控制器
 |-----------------------------------------------------------------------
 |@author sam.shan  <sam.shan@ruis-ims.cn>
 |----------------------------------------------------------------------
 |
 */
$router->get('BomManagement/groupIndex','Front\BomManagementController@groupIndex');
$router->get('BomManagement/bomIndex','Front\BomManagementController@bomIndex');
$router->get('BomManagement/bomCreate','Front\BomManagementController@bomCreate');
$router->get('BomManagement/bomEdit','Front\BomManagementController@bomEdit');
$router->get('BomManagement/bomView','Front\BomManagementController@bomView');
$router->get('BomManagement/manufactureBomView','Front\BomManagementController@manufactureBomView');


/*
 |账户管理控制器
 |-----------------------------------------------------------------------
 |@author sam.shan  <sam.shan@ruis-ims.cn>
 |----------------------------------------------------------------------
 |
 */
$router->get('AccountManagement/menuIndex','Front\AccountManagementController@menuIndex');
$router->get('AccountManagement/nodeIndex','Front\AccountManagementController@nodeIndex');
$router->get('AccountManagement/nodeStore','Front\AccountManagementController@nodeStore');
$router->get('AccountManagement/nodeUpdate','Front\AccountManagementController@nodeUpdate');

$router->get('AccountManagement/roleIndex','Front\AccountManagementController@roleIndex');
$router->get('AccountManagement/roleStore','Front\AccountManagementController@roleStore');
$router->get('AccountManagement/roleUpdate','Front\AccountManagementController@roleUpdate');


$router->get('AccountManagement/adminIndex','Front\AccountManagementController@adminIndex');
$router->get('AccountManagement/adminStore','Front\AccountManagementController@adminStore');
$router->get('AccountManagement/adminUpdate','Front\AccountManagementController@adminUpdate');

$router->get('AccountManagement/logIndex','Front\AccountManagementController@logIndex');

$router->get('AccountManagement/login','Front\AccountManagementController@adminLogin');
$router->get('AccountManagement/logout','Front\AccountManagementController@adminLogout');


/*
 |人事管理控制器
 |-----------------------------------------------------------------------
 |@author rick
 |----------------------------------------------------------------------
 |
 */
$router->get('Personnel/jobIndex','Front\PersonnelController@jobIndex');

$router->get('Personnel/departmentIndex','Front\PersonnelController@departmentIndex');
$router->get('Personnel/departmentCreate','Front\PersonnelController@departmentCreate');
$router->get('Personnel/departmentEdit','Front\PersonnelController@departmentEdit');

$router->get('Personnel/employeeIndex','Front\PersonnelController@employeeIndex');
$router->get('Personnel/employeeCreate','Front\PersonnelController@employeeCreate');
$router->get('Personnel/employeeEdit','Front\PersonnelController@employeeEdit');
$router->get('Personnel/employeeView','Front\PersonnelController@employeeView');

/*
 |图纸库
 |-----------------------------------------------------------------------
 |@author weihao
 |----------------------------------------------------------------------
 |
 */
$router->get('ImageManagement/imageIndex','Front\ImageManagementController@imageIndex');
$router->get('ImageManagement/imageCategoryIndex','Front\ImageManagementController@imageCategoryIndex');
$router->get('ImageManagement/imageGroupIndex','Front\ImageManagementController@imageGroupIndex');
$router->get('ImageManagement/addImage','Front\ImageManagementController@addImage');
$router->get('ImageManagement/updateImage','Front\ImageManagementController@updateImage');
$router->get('ImageManagement/imageAttributeDefine','Front\ImageManagementController@imageAttributeDefine');
$router->get('ImageManagement/ImageGroupType','Front\ImageManagementController@ImageGroupType');
$router->get('ImageManagement/careLabelIndex','Front\ImageManagementController@careLabelIndex');
$router->get('ImageManagement/addCareLabel','Front\ImageManagementController@addCareLabel');



/*
 |系统管理
 |-----------------------------------------------------------------------
 |@author sam.shan  <sam.shan@ruis-ims.cn>
 |----------------------------------------------------------------------
 |
 */
$router->get('SystemManagement/config','Front\SystemManagementController@config');
$router->get('SystemManagement/msg','Front\SystemManagementController@msg');

/*
 |实施导航
 |-----------------------------------------------------------------------
 |@author rick
 |----------------------------------------------------------------------
 |
 */
$router->get('Implement/dataExport','Front\ImplementController@dataExport');
$router->get('Implement/materialEncoding','Front\ImplementController@materialEncoding');   //物料编码设置
$router->get('Implement/unitSetting','Front\ImplementController@unitSetting');   //物料编码设置

/*
 |工序模块
 |-----------------------------------------------------------------------
 |@author leo
 |----------------------------------------------------------------------
 |
 */
//change by minxin20180316
$router->get('Operation/operationIndex','Front\OperationManagementController@operationIndex');//工序列表

//change by guangyang,wang
$router->get('Operation/operationOrWorkHourSetting','Front\OperationManagementController@operationOrWorkHourSetting');//工艺维护

//add by lesteryou
//做法字段页面：
$router->get('Operation/practiceField','Front\OperationManagementController@practiceField');
//end add

//add by lesteryou
//做法字段页面：
$router->get('Operation/productType','Front\OperationManagementController@productType');
//end add

/*
 |IE模块
 |-----------------------------------------------------------------------
 |@author leo
 |----------------------------------------------------------------------
 |
 */
$router->get('WorkHour/workHourIndex','Front\WorkHourManagementController@workHourIndex');
$router->get('WorkHour/addWorkHour','Front\WorkHourManagementController@addWorkHour');
$router->get('WorkHour/editWorkHour','Front\WorkHourManagementController@editWorkHour');

//add by minxin 20180320
//功能列表页;
$router->get('Ability/abilityList','Front\AbilityManagementController@abilityList');
//end add


/*
 |工艺路线模块
 |-----------------------------------------------------------------------
 |@author minxin20180411
 |----------------------------------------------------------------------
 |
 */
$router->get('Procedure/procedureIndex','Front\ProcedureManagementController@procedureIndex');//工艺路线列表
$router->get('Procedure/procedureEdit','Front\ProcedureManagementController@procedureEdit');//工艺路线编辑
$router->get('Procedure/procedureDetail','Front\ProcedureManagementController@procedureDetail');//工艺路线查看
$router->get('Procedure/procedureAdd','Front\ProcedureManagementController@procedureAdd');//工艺路线添加
$router->get('Procedure/procedureGroup','Front\ProcedureManagementController@procedureGroup');//工艺路线添加

/*
 |做法模块
 |-----------------------------------------------------------------------
 |@author minxin20180412
 |----------------------------------------------------------------------
 |
 */
$router->get('Practice/practiceEdit','Front\PracticeManagementController@practiceEdit');//做法维护
$router->get('Practice/useIndex','Front\PracticeManagementController@useIndex');//做法维护
$router->get('Practice/practiceCategoryIndex','Front\PracticeManagementController@practiceCategoryIndex');//做法分类
/*
|------------------------------------------------------------------------------
|工厂管理
|@author hao.wei <weihao>
|------------------------------------------------------------------------------
|
*/
$router->get('FactoryManagement/companyIndex','Front\FactoryManagementController@companyIndex');
$router->get('FactoryManagement/rankPlanDefine','Front\FactoryManagementController@rankPlanDefine');
$router->get('FactoryManagement/rankPlanManage','Front\FactoryManagementController@rankPlanManage');
$router->get('FactoryManagement/factoryDefine','Front\FactoryManagementController@factoryDefine');
$router->get('FactoryManagement/rankPlanType','Front\FactoryManagementController@rankPlanType');
/*
|------------------------------------------------------------------------------
|生产管理
|@author  rick
|------------------------------------------------------------------------------
|
*/
$router->get('ProductOrder/productOrderIndex','Front\ProductOrderController@productOrderIndex');
$router->get('ProductOrder/productOrderCreate','Front\ProductOrderController@productOrderCreate');
$router->get('ProductOrder/productOrderEdit','Front\ProductOrderController@productOrderEdit');
$router->get('ProductOrder/productOrderView','Front\ProductOrderController@productOrderView');
$router->get('ProductOrder/productOrderBoardView','Front\ProductOrderController@productOrderBoardView');

$router->get('WorkTask/workTaskIndex','Front\WorkTaskController@workTaskIndex');
$router->get('WorkTask/workTaskView','Front\WorkTaskController@workTaskView');

$router->get('WorkOrder/workOrderIndex','Front\WorkOrderController@workOrderIndex');
$router->get('WorkOrder/workOrderView','Front\WorkOrderController@workOrderView');

//change by guangyang,wang
$router->get('WorkOrder/createPickingList','Front\WorkOrderController@createPickingList');
$router->get('WorkOrder/createWorkshopPickingList','Front\WorkOrderController@createWorkshopPickingList');
$router->get('WorkOrder/viewPickingList','Front\WorkOrderController@viewPickingList');
$router->get('WorkOrder/viewWorkshopPickingList','Front\WorkOrderController@viewWorkshopPickingList');
$router->get('WorkOrder/viewPickingListForPicking','Front\WorkOrderController@viewPickingList');
$router->get('WorkOrder/pickingList','Front\WorkOrderController@pickingList');
$router->get('WorkOrder/workshopPickingList','Front\WorkOrderController@workshopPickingList');

//实时看板
$router->get('WorkTask/realTimeBashboard','Front\TestManagementController@testFour');

//异常原因维护
$router->get('SpecialCause/specialCauseIndex','Front\WorkOrderController@specialCauseIndex');

$router->get('Schedule/master','Front\ScheduleController@master');
$router->get('Schedule/detail','Front\ScheduleController@detail');
$router->get('Schedule/splitOrder','Front\ScheduleController@splitOrder');
//add by guangyang.wang
$router->get('ProductOrder/pullOrderIndex','Front\ProductOrderController@pullOrderIndex');
$router->get('ProductOrder/pullOrderbom','Front\ProductOrderController@pullOrderbom');

$router->get('ProductOrder/productOrderReleased','Front\ProductOrderController@productOrderReleased');
$router->get('ProductOrder/productOrderReleasedView','Front\ProductOrderController@productOrderReleasedView');
/*
|------------------------------------------------------------------------------
|测试区域
|@author  sam.shan  <sam.shan@ruis-ims.cn>
|------------------------------------------------------------------------------
|
*/
$router->get('TestManagement/ally','Front\TestManagementController@ally');
$router->get('TestManagement/chaidan','Front\TestManagementController@chaidan');
$router->get('TestManagement/testThree','Front\TestManagementController@testThree');
$router->get('TestManagement/testFour','Front\TestManagementController@testFour');


/*
|------------------------------------------------------------------------------
|仓库设置
|@author  liming
|------------------------------------------------------------------------------
|
*/
$router->get('WareHouse/depotSetting','Front\DepotsController@depotIndex');
$router->get('WareHouse/subareaSetting','Front\SubareasController@subareaIndex');
$router->get('WareHouse/binSetting','Front\BinsController@binIndex');

/*
|------------------------------------------------------------------------------
|仓库业务
|@author  liming
|------------------------------------------------------------------------------
|
*/
$router->get('WareHouse/otherInstoreIndex','Front\StorageOtherInstoreController@instoreIndex');
$router->get('WareHouse/otherInstoreAdd','Front\StorageOtherInstoreController@addInstore');
$router->get('WareHouse/otherInstoreEdit','Front\StorageOtherInstoreController@editInstore');
$router->get('WareHouse/otherInstoreView','Front\StorageOtherInstoreController@viewInstore');

$router->get('WareHouse/otherOutstoreIndex','Front\StorageOtherOutstoreController@outstoreIndex');
$router->get('WareHouse/otherOutstoreAdd','Front\StorageOtherOutstoreController@addOutstore');
$router->get('WareHouse/otherOutstoreEdit','Front\StorageOtherOutstoreController@editOutstore');
$router->get('WareHouse/otherOutstoreView','Front\StorageOtherOutstoreController@viewOutstore');


$router->get('WareHouse/storageInitialIndex','Front\StorageInitialController@initialIndex');
$router->get('WareHouse/storageInitialAdd','Front\StorageInitialController@addInitial');
$router->get('WareHouse/storageInitialEdit','Front\StorageInitialController@editInitial');
$router->get('WareHouse/storageInitialView','Front\StorageInitialController@viewInitial');


$router->get('WareHouse/storageCheckIndex','Front\StorageCheckController@checkIndex');
$router->get('WareHouse/storageCheckAdd','Front\StorageCheckController@addCheck');
$router->get('WareHouse/storageCheckEdit','Front\StorageCheckController@editCheck');
$router->get('WareHouse/storageCheckView','Front\StorageCheckController@viewCheck');

$router->get('WareHouse/storageAllocateIndex','Front\StorageAllocateController@allocateIndex');
$router->get('WareHouse/storageAllocateAdd','Front\StorageAllocateController@addAllocate');
$router->get('WareHouse/storageAllocateEdit','Front\StorageAllocateController@editAllocate');
$router->get('WareHouse/storageAllocateView','Front\StorageAllocateController@viewAllocate');

$router->get('WareHouse/storageMoveIndex','Front\StorageMoveController@moveIndex');
$router->get('WareHouse/storageMoveAdd','Front\StorageMoveController@addMove');
$router->get('WareHouse/storageMoveEdit','Front\StorageMoveController@editMove');
$router->get('WareHouse/storageMoveView','Front\StorageMoveController@viewMove');


$router->get('WareHouse/storageInstoreItem','Front\StorageInstoreItemController@storageInItemIndex');
$router->get('WareHouse/storageOutstoreItem','Front\StorageOutstoreItemController@storageOutItemIndex');
$router->get('WareHouse/storageInve','Front\StorageInveController@inveIndex');


/*
|------------------------------------------------------------------------------
|QC management
|@author  guangyang.wang
|------------------------------------------------------------------------------
|
*/

$router->get('QC/typeSetting','Front\QCBasicSettingController@typeSetting');
$router->get('QC/missingItemsSetting','Front\QCBasicSettingController@missingItems');
$router->get('QC/templateCreate','Front\QCBasicSettingController@templateCreate');
$router->get('QC/inspectObject','Front\QCBasicSettingController@inspectObject');

$router->get('QC/inspectionIQCIndex','Front\QCInspectionecordController@inspectionIQCIndex');
$router->get('QC/inspectionIQCPlan','Front\QCInspectionecordController@inspectionIQCPlan');
$router->get('QC/inspectionIPQCIndex','Front\QCInspectionecordController@inspectionIPQCIndex');
$router->get('QC/inspectionOQCIndex','Front\QCInspectionecordController@inspectionOQCIndex');

$router->get('QC/acceptOnDeviationApply','Front\QCInspectionecordController@acceptOnDeviationApply');
$router->get('QC/acceptOnDeviationAudit','Front\QCInspectionecordController@acceptOnDeviationAudit');


$router->get('QC/abnormalApply','Front\QCInspectionecordController@abnormalApply');
$router->get('QC/abnormalSend','Front\QCInspectionecordController@abnormalSend');
$router->get('QC/abnormalFillReport','Front\QCInspectionecordController@abnormalFillReport');
$router->get('QC/abnormalAudit','Front\QCInspectionecordController@abnormalAudit');

$router->get('QC/abnormalSendList','Front\QCInspectionecordController@abnormalSendList');

$router->get('QC/addComplaint','Front\QCComplaintManagementController@addComplaint');

$router->get('QC/viewComplaint','Front\QCComplaintManagementController@viewComplaint');
$router->get('QC/disposeComplaint','Front\QCComplaintManagementController@disposeComplaint');
$router->get('QC/replyComplaint','Front\QCComplaintManagementController@replyComplaint');
$router->get('QC/auditComplaint','Front\QCComplaintManagementController@auditComplaint');

$router->get('QC/viewComplaintById','Front\QCComplaintManagementController@viewComplaintById');
$router->get('QC/disposeComplaintSend','Front\QCComplaintManagementController@disposeComplaintSend');
$router->get('QC/replyComplaintView','Front\QCComplaintManagementController@replyComplaintView');


$router->get('QC/addComplaintItem','Front\QCComplaintManagementController@addComplaintItem');
$router->get('QC/viewComplaintItem','Front\QCComplaintManagementController@viewComplaintItem');
$router->get('QC/editComplaintItem','Front\QCComplaintManagementController@editComplaintItem');





/*
|------------------------------------------------------------------------------
|销售管理
|@author  weihao
|------------------------------------------------------------------------------
|
*/
$router->get('/Sell/customerDefine','Front\SellManagementController@customerDefine');
$router->get('/Sell/sellOrder','Front\SellManagementController@sellOrder');
$router->get('/Sell/sellOrderAdd','Front\SellManagementController@sellOrderAdd');
$router->get('/Sell/sellOrderUpdate','Front\SellManagementController@sellOrderUpdate');
$router->get('/Sell/sellOrderShow','Front\SellManagementController@sellOrderShow');


/*
|------------------------------------------------------------------------------
|设备管理
|@author   guangyang.wang
|------------------------------------------------------------------------------
|
*/

$router->get('/Device/deviceType','Front\DeviceManagementController@deviceType');
$router->get('/Device/faultType','Front\DeviceManagementController@faultType');
$router->get('/Device/otherOption','Front\DeviceManagementController@otherOpthion');
$router->get('/Device/upkeeRequire','Front\DeviceManagementController@upkeeRequire');
$router->get('/Device/upkeeExpreience','Front\DeviceManagementController@upkeeExpreience');
$router->get('/Device/operateUpkeeExpreience','Front\DeviceManagementController@operateUpkeeExpreience');
$router->get('/Device/deviceList','Front\DeviceManagementController@deviceList');
$router->get('/Device/repairsList','Front\DeviceManagementController@repairsList');
$router->get('/Device/repairsOrder','Front\DeviceManagementController@repairsOrder');
$router->get('/Device/requirePlan','Front\DeviceManagementController@requirePlan');
$router->get('/Device/maintainOrder','Front\DeviceManagementController@maintainOrder');
$router->get('/Device/maintainPlan','Front\DeviceManagementController@maintainPlan');
$router->get('/Deveice/repairs','Front\DeviceManagementController@repairs');

/*
|------------------------------------------------------------------------------
|版本管理
|@author   kevin
|------------------------------------------------------------------------------
|
*/
$router->get('Version/versionList','Front\VersionManagerController@versionList');



/*
|------------------------------------------------------------------------------
|委外管理
|@author   guangyang.wang
|------------------------------------------------------------------------------
|
*/

$router->get('Outsource/outsourceIndex','Front\OutsourceController@outsourceIndex');
$router->get('Outsource/outsourceIndexForCustomer','Front\OutsourceController@outsourceIndexForCustomer');
$router->get('Outsource/viewOutsource','Front\OutsourceController@viewOutsource');
$router->get('Outsource/viewOutsourceCopy','Front\OutsourceController@viewOutsource');
$router->get('Outsource/createOutsource','Front\OutsourceController@createOutsource');
$router->get('Outsource/editOutsource','Front\OutsourceController@editOutsource');

$router->get('Outsource/outsourceOrderIndex','Front\OutsourceController@outsourceOrderIndex');
$router->get('Outsource/viewOutsourceOrder','Front\OutsourceController@viewOutsourceOrder');
$router->get('Outsource/viewOutsourceOrderCopy','Front\OutsourceController@viewOutsourceOrder');

$router->get('Outsource/createOutsourceOrder','Front\OutsourceController@createOutsourceOrder');
$router->get('Outsource/editOutsourceOrder','Front\OutsourceController@editOutsourceOrder');
$router->get('Outsource/sendOutsourceOrder','Front\OutsourceController@sendOutsourceOrder');
$router->get('Outsource/busteOutsourceOrder','Front\OutsourceController@busteOutsourceOrder');
$router->get('Outsource/outsourcePickingIndex','Front\OutsourceController@outsourcePickingIndex');



/*
|------------------------------------------------------------------------------
|边角料及称重
|@author   guangyang.wang
|------------------------------------------------------------------------------
|
*/

$router->get('Offcut/offcutIndex','Front\OffcutController@pageIndex');
$router->get('Offcut/offcutWeightIndex','Front\OffcutController@pageWeightIndex');
$router->get('Offcut/offcutWeightShowAll','Front\OffcutController@offcutWeightShowAll');




/*
|------------------------------------------------------------------------------
|报工
|@author   guangyang.wang
|------------------------------------------------------------------------------
|
*/


$router->get('Buste/busteIndex','Front\BusteController@busteIndex');
$router->get('Buste/bustePageIndex','Front\BusteController@bustePageIndex');
/*
|------------------------------------------------------------------------------
|索赔单
|@author   guangyang.wang
|------------------------------------------------------------------------------
|
*/

$router->get('Claim/claimIndex','Front\QCComplaintManagementController@claimIndex');
$router->get('Log/viewLogRecord','Front\LogRecordController@viewLogRecord');


/*
|------------------------------------------------------------------------------
|委外数据导入
|@author   guangyang.wang
|------------------------------------------------------------------------------
|
*/

$router->get('Outsource/ImportExcel','Front\ImportExcelController@ImportExcel');
$router->get('Outsource/ImportExcelItem','Front\ImportExcelController@ImportExcelItem');




/*
|------------------------------------------------------------------------------
|往来业务伙伴
|@author   guangyang.wang
|------------------------------------------------------------------------------
|
*/
$router->get('PartnerView/pageIndex','Front\PartnerController@pageIndex');




