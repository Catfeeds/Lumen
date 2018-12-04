<?php
/**
 * Created by PhpStorm.
 * User: zhufeng
 * Date: 2018/8/15
 * Time: 下午2:08
 */

/*
|------------------------------------------------------------------------------
|procedure_group
|@author   Bruce.Chu
|------------------------------------------------------------------------------
|
*/

$router->post('ProcedureGroup/add','ProcedureGroup\ProcedureGroupController@add');
$router->get('ProcedureGroup/delete','ProcedureGroup\ProcedureGroupController@delete');
$router->post('ProcedureGroup/update','ProcedureGroup\ProcedureGroupController@update');
$router->get('ProcedureGroup/pageIndex','ProcedureGroup\ProcedureGroupController@pageIndex');
$router->get('ProcedureGroup/show','ProcedureGroup\ProcedureGroupController@show');
$router->get('ProcedureGroup/view','ProcedureGroup\ProcedureGroupController@view');
$router->get('ProcedureGroup/unique','ProcedureGroup\ProcedureGroupController@unique');
$router->get('ProcedureGroup/groupIsUsed','ProcedureGroup\ProcedureGroupController@groupIsUsed');
$router->get('ProcedureGroup/groupIsEmpty','ProcedureGroup\ProcedureGroupController@groupIsEmpty');
$router->get('ProcedureGroup/getProcedureRoute','ProcedureGroup\ProcedureGroupController@getProcedureRoute');
$router->get('ProcedureGroup/factoryIsUsed','ProcedureGroup\ProcedureGroupController@factoryIsUsed');
