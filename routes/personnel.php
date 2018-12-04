<?php
/**
 * Created by PhpStorm.
 * User: ruiyanchao
 * Date: 2018/1/18
 * Time: 下午3:58
 */

/*
 |-----------------------------------------------------------------------
 |岗位
 |@author rick.rui
 |----------------------------------------------------------------------
 | 唯一性检测:               EmployeePosition/unique
 | 添加:                    EmployeePosition/store
 | 修改:                    EmployeePosition/update
 | 详情:                    EmployeePosition/show
 | 分页列表:                 EmployeePosition/pageIndex
 */


$router->get('EmployeePosition/unique','Mes\EmployeePositionController@unique');
$router->post('EmployeePosition/store','Mes\EmployeePositionController@store');
$router->post('EmployeePosition/update','Mes\EmployeePositionController@update');
$router->get('EmployeePosition/destroy','Mes\EmployeePositionController@destroy');
$router->get('EmployeePosition/pageIndex','Mes\EmployeePositionController@pageIndex');
$router->get('EmployeePosition/show','Mes\EmployeePositionController@show');
$router->post('EmployeePosition/positionToRole','Mes\EmployeePositionController@positionToRole');
$router->get('EmployeePosition/getPositionRole','Mes\EmployeePositionController@getPositionRole');

/*
 |-----------------------------------------------------------------------
 |部门
 |@author rick.rui
 |----------------------------------------------------------------------
 | 唯一性检测:               Department/unique
 | 添加:                    Department/store
 | 修改:                    Department/update
 | 详情:                    Department/show
 | 分页列表:                 Department/pageIndex
 */


$router->get('Department/unique','Mes\DepartmentController@unique');
$router->post('Department/store','Mes\DepartmentController@store');
$router->post('Department/update','Mes\DepartmentController@update');
$router->get('Department/destroy','Mes\DepartmentController@destroy');
$router->get('Department/treeIndex','Mes\DepartmentController@treeIndex');
$router->get('Department/pageIndex','Mes\DepartmentController@pageIndex');
$router->get('Department/show','Mes\DepartmentController@show');
$router->get('Department/select','Mes\DepartmentController@select');
$router->get('Department/getTreeByCompany','Mes\DepartmentController@getTreeByCompany');
$router->get('Department/getNextLevelList','Mes\DepartmentController@getNextLevelList');



/*
 |-----------------------------------------------------------------------
 |员工
 |@author rick.rui
 |----------------------------------------------------------------------
 | 唯一性检测:               Employee/unique
 | 添加:                    Employee/store
 | 修改:                    Employee/update
 | 详情:                    Employee/show
 | 分页列表:                 Employee/pageIndex
 */


$router->get('Employee/unique','Mes\EmployeeController@unique');
$router->get('Employee/getRoles','Mes\EmployeeController@getRoles');
$router->get('Employee/getDepartments','Mes\EmployeeController@getDepartments');
$router->get('Employee/getPositions','Mes\EmployeeController@getPositions');
$router->get('Employee/getEducations','Mes\EmployeeController@getEducations');
$router->get('Employee/getProvince','Mes\EmployeeController@getProvince');
$router->post('Employee/store','Mes\EmployeeController@store');
$router->post('Employee/update','Mes\EmployeeController@update');
$router->get('Employee/destroy','Mes\EmployeeController@destroy');
$router->get('Employee/pageIndex','Mes\EmployeeController@pageIndex');
$router->get('Employee/show','Mes\EmployeeController@show');
$router->get('Employee/export','Mes\EmployeeController@import');
$router->get('Employee/select','Mes\EmployeeController@select');
$router->get('Employee/downloadTemplate','Mes\EmployeeController@downloadTemplate');
