<?php
/**
 * Created by PhpStorm.
 * User: wangguangyang
 * Date: 2017/12/14
 * Time: 17:39
 */

//region  异常单
/*
 |-----------------------------------------------------------------------
 |@author guangyang.wang
 |----------------------------------------------------------------------
 | 异常报告申请         abnormal/insert
 | 异常报告编辑         abnormal/edit
 | 异常报告按ID查看     abnormal/view
 | 异常单列表           abnormal/viewAll
 | 异常单提交           abnormal/inform
 | 异常处理意见发送     abnormal/transmission
 | 异常处理意见         abnormal/updateTransmission
 | 异常处理意见退回意见        abnormal/backTransmission
 | 异常处理发送结案        abnormal/adjudicate
 | 异常处理结案        abnormal/editAdjudicate
 |
 |
 */
//endregion

$router->post('abnormal/insert','Mes\AbnormalController@insert');
$router->post('abnormal/edit','Mes\AbnormalController@edit');
$router->get('abnormal/view','Mes\AbnormalController@view');
$router->get('abnormal/delete','Mes\AbnormalController@delete');
$router->get('abnormal/viewAll','Mes\AbnormalController@viewAll');
$router->get('abnormal/inform','Mes\AbnormalController@inform');
$router->post('abnormal/transmission','Mes\AbnormalController@tranmission');
$router->post('abnormal/updateTransmission','Mes\AbnormalController@updateTransmission');
$router->post('abnormal/backTransmission','Mes\AbnormalController@backTransmission');
$router->post('abnormal/adjudicate','Mes\AbnormalController@adjudicate');
$router->post('abnormal/editAdjudicate','Mes\AbnormalController@editAdjudicate');


$router->get('department/list','Mes\AbnormalController@departmentList');
$router->get('employee/list','Mes\AbnormalController@employeeList');
$router->get('abnormal/sendEmployee','Mes\AbnormalController@sendEmployee');
$router->get('abnormal/viewReportInfo','Mes\AbnormalController@viewReportInfo');
$router->get('abnormal/deleteReportInfo','Mes\AbnormalController@deleteReportInfo');

$router->post('abnormal/audit','Mes\AbnormalController@audit');

//region  特采
/*
 |-----------------------------------------------------------------------
 |@author guangyang.wang
 |----------------------------------------------------------------------
 |特采申请     aod/insert
 |特采修改     aod/update
 |特采提交审核     aod/commitAod
 |特采审核     aod/approval
 |
 */
//endregion

$router->post('aod/insert','Mes\AodController@insert');
$router->post('aod/update','Mes\AodController@update');
$router->post('aod/commitAod','Mes\AodController@commitAod');
$router->post('aod/approval','Mes\AodController@approval');

//region  qc检验设置
/*
 |-----------------------------------------------------------------------
 |@author guangyang.wang
 |----------------------------------------------------------------------
 | qc/settingType    类别列表
 | qc/addType        添加类别
 | qc/viewType       查看类别
 | qc/deleteType     删除类别
 | qc/addCheckItem      类别模板添加检验项
 | qc/deleteCheckItem   类别模板删除检验项
 | qc/getCheckItemsByType   检验类别模板检验项列表
 |
 */
//endregion
$router->get('qc/settingType','Mes\SettingController@typeSelect');
$router->get('qc/templateList','Mes\SettingController@templateList');
$router->post('qc/addType','Mes\SettingController@addTpye');
$router->post('qc/editType','Mes\SettingController@editTpye');
$router->get('qc/viewType','Mes\SettingController@viewTpye');
$router->get('qc/deleteType','Mes\SettingController@deleteTpye');
$router->post('qc/addCheckItem','Mes\SettingController@addCheckItem');
$router->get('qc/deleteCheckItem','Mes\SettingController@deleteCheckItem');
$router->get('qc/getCheckItemsByType','Mes\SettingController@getCheckItemsByType');
$router->get('qc/getItemsByType','Mes\SettingController@getItemsByType');


//region  qc检验记录
/*
 |-----------------------------------------------------------------------
 |@author guangyang.wang
 |----------------------------------------------------------------------
 | qc/updateCheck    修改检验
 | qc/viewCheck      查看检验
 | qc/select         检验项列表
 | qc/addCheckItemResult    添加检验项结果
 | qc/editCheckItemResult   修改检验项结果
 | qc/viewCheckItemResult   查看检验项结果
 */
//endregion
$router->get('qc/audit','Mes\CheckItemController@audit');
$router->get('qc/noaudit','Mes\CheckItemController@noaudit');

$router->post('qc/updateCheck','Mes\CheckItemController@updateCheck');
$router->post('qc/IQCCheckMore','Mes\CheckItemController@checkMore');
$router->get('qc/viewCheck','Mes\CheckItemController@viewCheck');
$router->get('qc/select','Mes\CheckItemController@select');
$router->get('qc/dropdownSelect','Mes\CheckItemController@dropdownSelect');
$router->post('qc/editCheckItemResult','Mes\CheckItemResultController@editCheckItemResult');
$router->get('qc/viewCheckItemResult','Mes\CheckItemResultController@viewCheckItemResult');

// liming
// 选择模板
$router->post('qc/selectTemplate','Mes\CheckItemController@selectTemplate');
// 查看模板
$router->get('qc/showTemplate','Mes\CheckItemController@showTemplate');
//设置检验数量
$router->post('qc/setCheckQty','Mes\CheckItemController@setCheckQty');
//更改 检验单状态
$router->get('qc/updatePushStatus','Mes\CheckItemController@updatePushStatus');
//增加ipqc检验单
$router->get('qc/addIpqc','Mes\CheckItemController@addIpqc');


//region  qc
/*
 |-----------------------------------------------------------------------
 |@author liming
 |----------------------------------------------------------------------
 |检验项
 |
 */
//endregion
$router->post('inspectproject/store','Mes\InspectProjectController@store');
$router->post('inspectproject/update','Mes\InspectProjectController@update');
$router->get('inspectproject/show','Mes\InspectProjectController@show');
$router->get('inspectproject/destroy','Mes\InspectProjectController@destroy');
$router->get('inspectproject/treeIndex','Mes\InspectProjectController@treeIndex');


//region  qc检验问题设置
/*
 |-----------------------------------------------------------------------
 |@author guangyang.wang
 |----------------------------------------------------------------------
 |qc/questionSetting/addItems        缺失项（问题项）添加
 |qc/questionSetting/updateItems     缺失项（问题项）编辑
 |qc/questionSetting/viewItems       缺失项（问题项）查看
 |qc/questionSetting/viewItems       缺失项（问题项）删除
 |qc/questionSetting/viewItems       缺失项（问题项）列表
 */
//endregion
$router->post('qc/questionSetting/addItems','Mes\QuestionSettingController@addItems');
$router->post('qc/questionSetting/updateItems','Mes\QuestionSettingController@updateItems');
$router->get('qc/questionSetting/viewItems','Mes\QuestionSettingController@viewItems');
$router->get('qc/questionSetting/deleteItems','Mes\QuestionSettingController@deleteItems');
$router->get('qc/questionSetting/viewItemsList','Mes\QuestionSettingController@viewItemsList');


//region  客诉
/*
 |-----------------------------------------------------------------------
 |@author xin.min
 |----------------------------------------------------------------------
 |
 */
//endregion

//显示所有已发送给qc的客诉单
$router->get('qc/showAllComplaintToQc','Qc\CustomerComplaintController@showAllComplaintToQc');
//显示所有未发送给qc的客诉单
$router->get('qc/showAllComplaintNotToQc','Qc\CustomerComplaintController@showAllComplaintNotToQc');

//新建客诉单
$router->post('qc/storeComplaint','Qc\CustomerComplaintController@storeComplaint');
// 查看客诉单
$router->get('qc/showComplaint','Qc\CustomerComplaintController@showComplaint');
// 修改客诉单
$router->post('qc/updateComplaint','Qc\CustomerComplaintController@updateComplaint');

//删除客诉单
$router->get('qc/deleteComplaint','Qc\CustomerComplaintController@deleteComplaint');


//新建D3
$router->post('qc/storeD3','Qc\CustomerComplaintController@storeD3');

//修改D3
$router->post('qc/updateD3','Qc\CustomerComplaintController@updateD3');

//回答答案/修改答案
$router->post('qc/storeAnswer','Qc\CustomerComplaintController@storeAnswer');

//显示完整客诉
$router->get('qc/displayWholeComplaint','Qc\CustomerComplaintController@displayWholeComplaint');
//显示所有答案和需要回答的问题
$router->post('qc/detailAnswer','Qc\CustomerComplaintController@detailAnswer');

$router->get('qc/detailComplaintByAdmin','Qc\CustomerComplaintController@detailComplaintByAdmin');
$router->post('qc/detailQuestion','Qc\CustomerComplaintController@detailQuestion');
$router->get('qc/listQuestion','Qc\CustomerComplaintController@listQuestion');
$router->get('qc/listComplaintToJudge','Qc\CustomerComplaintController@listComplaintToJudge');

$router->post('qc/sendQuestion','Qc\CustomerComplaintController@sendQuestion');
$router->get('qc/sendToQc','Qc\CustomerComplaintController@sendToQc');
//完结 按钮
$router->get('qc/overComplaint','Qc\CustomerComplaintController@overComplaint');

$router->post('qc/deleteSendQuestion','Qc\CustomerComplaintController@deleteSendQuestion');
$router->post('qc/submitJudgeComplaint','Qc\CustomerComplaintController@submitJudgeComplaint');
$router->post('qc/judgeComplaint','Qc\CustomerComplaintController@judgeComplaint');
$router->post('qc/judgeQuestion','Qc\CustomerComplaintController@judgeQuestion');
$router->get('qc/finishComplaint','Qc\CustomerComplaintController@finishComplaint');

//中止客诉单
$router->get('qc/stopComplaint','Qc\CustomerComplaintController@stopComplaint');

//QO munber模糊查询
$router->get('qc/dimPonumber','Qc\CustomerComplaintController@dimPonumber');
//物料编号 模糊查询
$router->get('qc/dimMaterial','Qc\CustomerComplaintController@dimMaterial');

// 客诉单唯一性检查
$router->get('qc/uniqueComplaint','Qc\CustomerComplaintController@unique');

//region  检验计划
/*
 |-----------------------------------------------------------------------
 |@author Ming.Li
 |----------------------------------------------------------------------
 |
 */
 // 新增 检验计划
 $router->post('QcPlan/store','Mes\QcPlanController@store');
 $router->get('QcPlan/unique','Mes\QcPlanController@unique');
 $router->get('QcPlan/show','Mes\QcPlanController@show');
 $router->get('QcPlan/pageIndex','Mes\QcPlanController@pageIndex');
 $router->get('QcPlan/destroy','Mes\QcPlanController@destroy');
 $router->post('QcPlan/update','Mes\QcPlanController@update');


//region  索赔单
 
/*
 |-----------------------------------------------------------------------
 |@author Ming.Li
 |----------------------------------------------------------------------
 |
 */
 // 新增 检验计划
 $router->post('QcClaim/store','Mes\ClaimController@store');
 $router->get('QcClaim/unique','Mes\ClaimController@unique');
 $router->get('QcClaim/show','Mes\ClaimController@show');
 $router->get('QcClaim/pageIndex','Mes\ClaimController@pageIndex');
 $router->get('QcClaim/destroy','Mes\ClaimController@destroy');
 $router->post('QcClaim/update','Mes\ClaimController@update');

/*
 |-----------------------------------------------------------------------
 |@author Ming.Li
 |----------------------------------------------------------------------
 |
 */
 //检验单导出
 $router->get('qc/exportExcel','Mes\CheckItemController@exportExcel');
