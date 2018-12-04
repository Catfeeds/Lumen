<?php
/**
 * Created by PhpStorm.
 * User: haoziye
 * Date: 2018/2/2
 * Time: 下午5:02
 */
/*
|------------------------------------------------------------------------------
|工厂
|@author   hao.wei <weihao>
|------------------------------------------------------------------------------
|
 */
$router->get('Factory/unique','Mes\FactoryController@unique');
$router->post('Factory/store','Mes\FactoryController@store');
$router->get('Factory/pageIndex','Mes\FactoryController@pageIndex');
$router->get('Factory/show','Mes\FactoryController@show');
$router->post('Factory/update','Mes\FactoryController@update');
$router->get('Factory/select','Mes\FactoryController@select');
$router->get('Factory/delete','Mes\FactoryController@delete');
$router->get('Factory/getTree','Mes\FactoryController@getTree');

/*
|------------------------------------------------------------------------------
|车间
|@author   hao.wei <weihao>
|------------------------------------------------------------------------------
|
 */
$router->get('Workshop/unique','Mes\WorkshopController@unique');
$router->post('Workshop/store','Mes\WorkshopController@store');
$router->get('Workshop/pageIndex','Mes\WorkshopController@pageIndex');
$router->get('Workshop/show','Mes\WorkshopController@show');
$router->get('Workshop/select','Mes\WorkshopController@select');
$router->post('Workshop/update','Mes\WorkshopController@update');
$router->get('Workshop/delete','Mes\WorkshopController@delete');
/*
|------------------------------------------------------------------------------
|班次
|@author   hao.wei <weihao>
|------------------------------------------------------------------------------
|
 */
//班次类型
$router->get('RankPlanType/unique','Mes\RankPlanTypeController@unique');
$router->post('RankPlanType/store','Mes\RankPlanTypeController@store');
$router->get('RankPlanType/pageIndex','Mes\RankPlanTypeController@pageIndex');
$router->get('RankPlanType/show','Mes\RankPlanTypeController@show');
$router->get('RankPlanType/select','Mes\RankPlanTypeController@select');
$router->post('RankPlanType/update','Mes\RankPlanTypeController@update');
$router->get('RankPlanType/delete','Mes\RankPlanTypeController@delete');
//班次定义
$router->get('RankPlan/unique','Mes\RankPlanController@unique');
$router->post('RankPlan/store','Mes\RankPlanController@store');
$router->get('RankPlan/pageIndex','Mes\RankPlanController@pageIndex');
$router->get('RankPlan/show','Mes\RankPlanController@show');
$router->get('RankPlan/select','Mes\RankPlanController@select');
$router->post('RankPlan/update','Mes\RankPlanController@update');
$router->get('RankPlan/delete','Mes\RankPlanController@delete');
/*
|------------------------------------------------------------------------------
|工作中心
|@author   hao.wei <weihao>
|------------------------------------------------------------------------------
|
 */
$router->get('WorkCenter/unique','Mes\WorkCenterController@unique');
$router->post('WorkCenter/store','Mes\WorkCenterController@store');
$router->get('WorkCenter/pageIndex','Mes\WorkCenterController@pageIndex');
$router->get('WorkCenter/show','Mes\WorkCenterController@show');
$router->get('WorkCenter/select','Mes\WorkCenterController@select');
$router->post('WorkCenter/update','Mes\WorkCenterController@update');
$router->get('WorkCenter/delete','Mes\WorkCenterController@delete');
//工作中心关联工序
$router->post('WorkCenterOperation/update','Mes\WorkCenterOperationController@update');
$router->get('WorkCenterOperation/getWorkCenterOperation','Mes\WorkCenterOperationController@getWorkCenterOperation');
$router->get('WorkCenterOperation/getWorkCenterOperationAbilitys','Mes\WorkCenterOperationController@getWorkCenterOperationAbilitys');
$router->get('WorkCenterOperation/getWorkcenterRoutings','Mes\WorkCenterOperationController@getWorkcenterRoutings');
$router->get('WorkCenterOperation/getWorkCenterBySteps','Mes\WorkCenterOperationController@getWorkCenterBySteps');
//工作中心关联班次
$router->post('WorkCenterRankPlan/update','Mes\WorkCenterRankPlanController@update');
$router->get('WorkCenterRankPlan/getWorkCenterRankPlan','Mes\WorkCenterRankPlanController@getWorkCenterRankPlan');

//工作中心关联sap_standard_value
$router->get('WorkCenterStandard/getStandardByWorkCenter','Mes\WorkCenterOperationController@getStandardByWorkCenter');
//工作中心关联sap_standard_value
$router->get('WorkCenterStandard/getDeclareStandardByWorkCenter','Mes\WorkCenterOperationController@getDeclareStandardByWorkCenter');

/*
|------------------------------------------------------------------------------
|工作台
|@author   hao.wei <weihao>
|------------------------------------------------------------------------------
|
 */
$router->get('WorkBench/unique','Mes\WorkBenchController@unique');
$router->post('WorkBench/store','Mes\WorkBenchController@store');
$router->get('WorkBench/pageIndex','Mes\WorkBenchController@pageIndex');
$router->get('WorkBench/show','Mes\WorkBenchController@show');
$router->get('WorkBench/select','Mes\WorkBenchController@select');
$router->post('WorkBench/update','Mes\WorkBenchController@update');
$router->get('WorkBench/delete','Mes\WorkBenchController@delete');
//关联工序
$router->get('WorkBenchOperationAbility/unique','Mes\WorkBenchOperationAbilityController@unique');
$router->post('WorkBenchOperationAbility/store','Mes\WorkBenchOperationAbilityController@store');
$router->get('WorkBenchOperationAbility/pageIndex','Mes\WorkBenchOperationAbilityController@pageIndex');
$router->get('WorkBenchOperationAbility/getList','Mes\WorkBenchOperationAbilityController@getList');
$router->get('WorkBenchOperationAbility/show','Mes\WorkBenchOperationAbilityController@show');
$router->post('WorkBenchOperationAbility/update','Mes\WorkBenchOperationAbilityController@update');
$router->get('WorkBenchOperationAbility/delete','Mes\WorkBenchOperationAbilityController@delete');
$router->get('WorkBenchOperationAbility/capacity','Mes\WorkBenchOperationAbilityController@capacity');
$router->get('WorkBenchOperationAbility/newCapacity','Mes\WorkBenchOperationAbilityController@newCapacity');
//关联班次关联人员
$router->get('WorkBenchRankPlanEmplyee/getList','Mes\WorkBenchRankPlanEmplyeeController@getList');
$router->post('WorkBenchRankPlanEmplyee/update','Mes\WorkBenchRankPlanEmplyeeController@update');

/*
|------------------------------------------------------------------------------
|工位机
|@author   hao.wei <weihao>
|------------------------------------------------------------------------------
|
 */
$router->get('WorkMachine/unique','Mes\WorkMachineController@unique');
$router->post('WorkMachine/store','Mes\WorkMachineController@store');
$router->get('WorkMachine/pageIndex','Mes\WorkMachineController@pageIndex');
$router->get('WorkMachine/show','Mes\WorkMachineController@show');
$router->get('WorkMachine/select','Mes\WorkMachineController@select');
$router->post('WorkMachine/update','Mes\WorkMachineController@update');
$router->get('WorkMachine/delete','Mes\WorkMachineController@delete');