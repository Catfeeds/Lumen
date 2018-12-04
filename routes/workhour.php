<?php
$router->get('workhour/test','WorkHour\WorkHourController@test');

//liming    
$router->get('workhour/showMaterials','WorkHour\WorkHourController@showMaterials');

//按工序查找 物料
$router->get('workhour/showMaterialsByProcess','WorkHour\WorkHourController@showMaterialsByProcess');

/**
 * 工序模块
 */
$router->get('operation/unique','WorkHour\OperationController@unique');
//添加工序
$router->post('operation/store','WorkHour\OperationController@store');
//修改工序
$router->post('operation/update','WorkHour\OperationController@update');
//删除工序
$router->post('operation/destroy','WorkHour\OperationController@destroy');
//分页获取工序列表
$router->get('operation/index','WorkHour\OperationController@index');
//获取全部工序
$router->get('operation/AllIndex','WorkHour\OperationController@AllIndex');
//查看工序
$router->get('operation/show','WorkHour\OperationController@show');
//工序同步工时设置
$router->get('operation/fit','WorkHour\OperationController@fit');
//工序列表
$router->get('operation/select','WorkHour\OperationController@select');
//根据工序获得能力
$router->get('operation/optoability','WorkHour\OperationController@optoability');
//验证工序能力是否被bom使用 add by xin 2018517
$router->get('operation/abilityHasUsed','WorkHour\OperationController@abilityHasUsed');
//验证工序做法字段是否被bom使用 add by xin 2018517
$router->get('operation/practiceFieldsHasUsed','WorkHour\OperationController@practiceFieldsHasUsed');

//物料分类与工序关联 一个物料分类可以关联多个工序
$router->post('operation/operationMaterialCategory','WorkHour\OperationController@operationMaterialCategory');
//根据物料分类获取已关联的工序
$router->get('operation/getOperationMaterialCategory','WorkHour\OperationController@getOperationMaterialCategory');
//根据工序获取已关联的物料分类
$router->get('operation/getMaterialCategoryByOperation','WorkHour\OperationController@getMaterialCategoryByOperation');

//物料编码获取工序列表
$router->get('operation/getOperationsByMaterialNo','WorkHour\OperationController@getOperationsByMaterialNo');

//条件获取工序列表
$router->get('operation/getOperations','WorkHour\OperationController@getOperations');

/**
 * 能力模块
 * add by xin.min 20180320
 */
//获取能力列表
$router->get('operation/getAbilitys','WorkHour\OperationController@getAbilitys');
//新获取能力列表
$router->get('operation/getAbilities','WorkHour\OperationController@getAbilities');
//add by xin.min 20180320 初始化能力表, 同步更新rioa表
$router->get('operation/initAbilities','WorkHour\OperationController@initAbilities');
//新建能力
$router->post('operation/createAbility','WorkHour\OperationController@createAbility');
//编辑能力
$router->post('operation/updateAbility','WorkHour\OperationController@updateAbility');
//查看能力
$router->post('operation/displayAbility','WorkHour\OperationController@displayAbility');
//删除能力
$router->post('operation/deleteAbility','WorkHour\OperationController@deleteAbility');
//检查唯一性;
$router->get('operation/checkUnique','WorkHour\OperationController@checkUnique');
//根据工序id获取工序所有能力
$router->get('operation/getAbilitiesByOperation','WorkHour\OperationController@getAbilitiesByOperation');


//获取所有工序带上步骤
$router->get('operation/getAllOperation','WorkHour\OperationController@getAllOperation');

//添加工序关系
$router->post('operation/relationStore','WorkHour\OperationController@relationStore');
//修改工序关系
$router->post('operation/relationUpdate','WorkHour\OperationController@relationUpdate');
//获取维护关系列表
$router->get('operation/relationIndex','WorkHour\OperationController@relationIndex');
//删除维护关系
$router->post('operation/relationDestroy','WorkHour\OperationController@relationDestroy');
//查看维护关系
$router->get('operation/relationShow','WorkHour\OperationController@relationShow');



/**
 * 工时模块
 */
//基础工时设置
$router->post('workhour/setting','WorkHour\WorkHourController@setting');
$router->post('workhour/updateSetting','WorkHour\WorkHourController@updateSetting');
//获取标准工时设置列表
$router->get('workhour/Setting_list','WorkHour\WorkHourController@Setting_list');
$router->get('workhour/setting_show','WorkHour\WorkHourController@setting_show');
$router->get('workhour/setting_empty','WorkHour\WorkHourController@setting_empty');
// 设置为基准能力
$router->get('workhour/setting_sign','WorkHour\WorkHourController@setting_sign');
// 取消基准能力
$router->get('workhour/cancel_sign','WorkHour\WorkHourController@cancel_sign');



//添加标准工时
$router->post('workhour/store','WorkHour\WorkHourController@store');
//根据物料编码获取工序工时
$router->get('workhour/getWorkHoursByMaterialNo','WorkHour\WorkHourController@getWorkHoursByMaterialNo');

//根据routing获取工序工时
$router->get('workhour/getWorkHoursByRouting','WorkHour\WorkHourController@getWorkHoursByRouting');

//获取标准工时列表
$router->get('workhour/index','WorkHour\WorkHourController@index');
$router->get('workhour/indextest','WorkHour\WorkHourController@indextest');  // 测试中

//标准工时删除
$router->post('workhour/destroy','WorkHour\WorkHourController@destroy');
//标准工时修改
$router->post('workhour/update','WorkHour\WorkHourController@update');
//查看标准工时
$router->get('workhour/show','WorkHour\WorkHourController@show');
//导出标准工时列表
$router->get('workhour/work_hours_list_exportExcel','WorkHour\WorkHourController@workHoursListExportExcel');
//导入标准工时
$router->post('workhour/work_hours_list_importExcel','WorkHour\WorkHourController@workHoursListImportExcel');
//标准工时待维护数据查询
$router->get('workhour/whlistExportExcel','WorkHour\WorkHourController@whlistExportExcel');
//批量提交待审核
$router->post('workhour/batch_submit_check','WorkHour\WorkHourController@batchSubmitCheck');

//标准工时审核
$router->post('workhour/audit','WorkHour\WorkHourController@audit');
//标准工时批量审核
$router->post('workhour/batchaudit','WorkHour\WorkHourController@batchaudit');

//标准工时待审核撤回
$router->post('workhour/return_check','WorkHour\WorkHourController@returnCheck');
//标准工时待审核批量撤回
$router->post('workhour/batch_return_check','WorkHour\WorkHourController@batchReturnCheck');

// 根据bom_id 获取所有相关的工时
$router->get('workhour/getAllHoursByBom','WorkHour\WorkHourController@getAllHoursByBom');

//获取总工时
$router->get('workhour/getTotalHours','WorkHour\WorkHourController@getTotalHours');

//复制工时
$router->get('workhour/copyWorkHours','WorkHour\WorkHourController@copyWorkHours');


/**
 * 工艺路线模块
 * add by xin.min 20180403
 */
//显示所有工艺路线列表
$router->get('procedure/index','Procedure\ProcedureController@index');
//显示某个工艺路线的基本信息和拥有工艺以及工艺关系;
$router->get('procedure/display','Procedure\ProcedureController@display');
//添加工艺路线(base)
$router->post('procedure/store','Procedure\ProcedureController@store');
//修改工艺路线基础数据
$router->post('procedure/edit','Procedure\ProcedureController@edit');
//删除工艺路线(基础+所有关系)
$router->get('procedure/delete','Procedure\ProcedureController@delete');
//添加工艺路线工艺(detail)
$router->post('procedure/storeDetail','Procedure\ProcedureController@storeDetail');
//删除工艺路线工艺(删除节点)
$router->post('procedure/deleteDetail','Procedure\ProcedureController@deleteDetail');
//更新工艺路线工艺(增加/删除路由)
$router->post('procedure/updateDetail','Procedure\ProcedureController@updateDetail');
//获取工艺路线内大于某一个order的所有工艺;
$router->post('procedure/showDetail','Procedure\ProcedureController@showDetail');
//编辑工艺路线工序节点(更换工序)
$router->post('procedure/editDetail','Procedure\ProcedureController@editDetail');
//检测工艺路线是否被bom使用
$router->get('procedure/hasUsed','Procedure\ProcedureController@hasUsed');



/**
 * 做法模块
 * add by xin.min 20180411
 */
//显示所有做法;
$router->get('practice/index','Practice\PracticeController@index');
//根据工序模块显示工序所有做法
$router->get('practice/indexByOperation','Practice\PracticeController@indexByOperation');
//根据做法模板和查询条件查询满足条件的做法
//$router->get('practice/indexByCondition','Practice\PracticeController@indexByCondition');
$router->post('practice/indexByCondition','Practice\PracticeController@indexByCondition');
//做法编码唯一性检测
$router->get('practice/checkCodeUnique','Practice\PracticeController@checkCodeUnique');
//在做法里新增一条做法字段
$router->post('practice/addAFields','Practice\PracticeController@addAFields');
//添加做法;
$router->post('practice/store','Practice\PracticeController@store');
//做法关联做法字段
$router->post('practice/storeFields','Practice\PracticeController@storeFields');
//做法更新做法字段
$router->post('practice/updateFields','Practice\PracticeController@updateFields');
//显示做法的所有做法字段;
$router->get('practice/displayFields','Practice\PracticeController@displayFields');
//做法删除做法字段
$router->post('practice/deleteFields','Practice\PracticeController@deleteFields');
//根据做法id获取基本信息以及所有做法字段信息(步骤);
$router->get('practice/detailPractice','Practice\PracticeController@detailPractice');
//判断做法是否被bom使用;
$router->get('practice/hasUsed','Practice\PracticeController@hasUsed');
//查看做法所有的图纸;
$router->get('practice/showPracticeDraw','Practice\PracticeController@showPracticeDraw');
//查看做法所有做法分类图纸; add by xin 20180530
$router->get('practice/showPracticeFieldDraw','Practice\PracticeController@showPracticeFieldDraw');

//做法分类
$router->post('practiceCategory/store','Practice\PracticeCategoryController@store');
$router->get('practiceCategory/unique','Practice\PracticeCategoryController@unique');
$router->get('practiceCategory/select','Practice\PracticeCategoryController@select');
$router->get('practiceCategory/show','Practice\PracticeCategoryController@show');
$router->post('practiceCategory/update','Practice\PracticeCategoryController@update');
$router->get('practiceCategory/delete','Practice\PracticeCategoryController@delete');

/**
 * 做法线模块;
 * create by xin.min 20180423
 * @todo 未来需要review做法线所有方法, 甚至需要重新梳理做法线逻辑.目前为止做法线考虑到的东西非常少, 只能实现做法线的简单功能;
 */
//创建做法关联做法
$router->post('practice/storeLine','Practice\PracticeController@storeLine');
//删除做法线;
$router->get('practice/deleteLine','Practice\PracticeController@deleteLine');
//编辑做法线;
$router->post('practice/editLine','Practice\PracticeController@editLine');
//根据做法id查询所有有此做法的做法线;
$router->get('practice/showLines','Practice\PracticeController@showLines');
//根据做法线id查询做法线详情;
$router->get('practice/showALine','Practice\PracticeController@showALine');



/*
|------------------------------------------------------------------------------
|做法字段
|@author  lesteryou 2018-04-11
|------------------------------------------------------------------------------
|检查唯一性  ： PracticeField/unique
|添加       ： PracticeField/store
|修改       ： PracticeField/update
|删除       ： PracticeField/delete
|获取所有(不分页)： PracticeField/selectAll
|获取所有(分页)： PracticeField/selectPage
|获取一个： PracticeField/selectOne
|
 */
$router->get('PracticeField/unique', 'WorkHour\PracticeFieldController@unique');
$router->post('PracticeField/store', 'WorkHour\PracticeFieldController@store');
$router->post('PracticeField/update', 'WorkHour\PracticeFieldController@update');
$router->get('PracticeField/delete', 'WorkHour\PracticeFieldController@delete');
$router->get('PracticeField/selectAll', 'WorkHour\PracticeFieldController@selectAll');
$router->get('PracticeField/selectPage', 'WorkHour\PracticeFieldController@selectPage');
$router->get('PracticeField/selectOne', 'WorkHour\PracticeFieldController@selectOne');

/*
|------------------------------------------------------------------------------
|用处
|@author  lesteryou 2018-04-25
|------------------------------------------------------------------------------
|检查唯一性  ：    PracticeUse/unique
|添加       ：     PracticeUse/store
|修改       ：     PracticeUse/update
|删除       ：     PracticeUse/delete
|获取所有(不分页)： PracticeUse/selectAll
|获取所有(分页)：  PracticeUse/selectPage
|获取一个：        PracticeUse/selectOne
|
 */
$router->get('PracticeUse/unique', 'Practice\PracticeUseController@unique');
$router->post('PracticeUse/store', 'Practice\PracticeUseController@store');
$router->post('PracticeUse/update', 'Practice\PracticeUseController@update');
$router->get('PracticeUse/delete', 'Practice\PracticeUseController@delete');
$router->get('PracticeUse/selectAll', 'Practice\PracticeUseController@selectAll');
$router->get('PracticeUse/selectTree', 'Practice\PracticeUseController@selectTree');
$router->get('PracticeUse/selectPage', 'Practice\PracticeUseController@selectPage');
$router->get('PracticeUse/selectOne', 'Practice\PracticeUseController@selectOne');

/*
|------------------------------------------------------------------------------
|产品细分类
|@author  lesteryou 2018-04-28
|------------------------------------------------------------------------------
|检查唯一性  ：    ProductType/unique
|添加       ：     ProductType/store
|修改       ：     ProductType/update
|删除       ：     ProductType/delete
|获取所有(不分页)： ProductType/selectAll
|获取所有(分页)：  ProductType/selectPage
|获取一个：        ProductType/selectOne
|
 */
$router->get('ProductType/unique', 'WorkHour\ProductTypeController@unique');
$router->post('ProductType/store', 'WorkHour\ProductTypeController@store');
$router->post('ProductType/update', 'WorkHour\ProductTypeController@update');
$router->get('ProductType/delete', 'WorkHour\ProductTypeController@delete');
$router->get('ProductType/selectAll', 'WorkHour\ProductTypeController@selectAll');
$router->get('ProductType/selectTree', 'WorkHour\ProductTypeController@selectTree');
$router->get('ProductType/selectPage', 'WorkHour\ProductTypeController@selectPage');
$router->get('ProductType/selectOne', 'WorkHour\ProductTypeController@selectOne');
