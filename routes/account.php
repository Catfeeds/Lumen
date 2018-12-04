<?php
/**
 * 账户管理路由放置位置
 * @author  sam.shan  <sam.shan@ruis-ims.cn>
 * @time    2018年01月15日15:45:43
 */



/*
 |菜单路由
 |-----------------------------------------------------------------------
 |@author sam.shan  <sam.shan@ruis-ims.cn>
 |----------------------------------------------------------------------
 |每个接口的含义请参考:账户管理——权限节点
 |
 */


$router->get('Menu/unique','Mes\MenuController@unique');
$router->post('Menu/store','Mes\MenuController@store');
$router->post('Menu/update','Mes\MenuController@update');
$router->get('Menu/show','Mes\MenuController@show');
$router->get('Menu/treeIndex','Mes\MenuController@treeIndex');
$router->get('Menu/select','Mes\MenuController@select');
$router->get('Menu/destroy','Mes\MenuController@destroy');
$router->get('Menu/oneLevel','Mes\MenuController@oneLevel');
$router->get('Menu/oneLevel','Mes\MenuController@oneLevel');
$router->get('Menu/initialize','Mes\MenuController@initialize');
$router->get('Menu/clear','Mes\MenuController@clear');


/*
 |权限节点路由
 |-----------------------------------------------------------------------
 |@author sam.shan  <sam.shan@ruis-ims.cn>
 |----------------------------------------------------------------------
 |每个接口的含义请参考:账户管理——权限节点
 |
 */

$router->get('Node/unique','Mes\NodeController@unique');
$router->post('Node/store','Mes\NodeController@store');
$router->post('Node/update','Mes\NodeController@update');
$router->post('Node/tableUpdate','Mes\NodeController@tableUpdate');
$router->get('Node/destroy','Mes\NodeController@destroy');
$router->get('Node/pageIndex','Mes\NodeController@pageIndex');
$router->get('Node/select','Mes\NodeController@select');
$router->get('Node/selectedRole','Mes\NodeController@selectedRole');
$router->post('Node/node2role','Mes\NodeController@node2role');

/*
 |角色路由
 |-----------------------------------------------------------------------
 |@author sam.shan  <sam.shan@ruis-ims.cn>
 |----------------------------------------------------------------------
 |每个接口的含义请参考:账户管理——权限节点
 |
 */

$router->get('Role/unique','Mes\RoleController@unique');
$router->post('Role/store','Mes\RoleController@store');
$router->post('Role/update','Mes\RoleController@update');
$router->get('Role/show','Mes\RoleController@show');
$router->get('Role/pageIndex','Mes\RoleController@pageIndex');
$router->get('Role/destroy','Mes\RoleController@destroy');
$router->get('Role/selectedNode','Mes\RoleController@selectedNode');
$router->post('Role/role2node','Mes\RoleController@role2node');


/*
 |管理员路由
 |-----------------------------------------------------------------------
 |@author sam.shan  <sam.shan@ruis-ims.cn>
 |----------------------------------------------------------------------
 | 每个接口的含义请参考:账户管理——权限节点
 |
 */
$router->get('Admin/unique','Mes\AdminController@unique');
$router->post('Admin/store','Mes\AdminController@store');
$router->post('Admin/update','Mes\AdminController@update');
$router->get('Admin/show','Mes\AdminController@show');
$router->get('Admin/pageIndex','Mes\AdminController@pageIndex');
$router->get('Admin/delete','Mes\AdminController@delete');
$router->get('Admin/log','Mes\AdminController@loginLog');
$router->post('Admin/login','Mes\AdminController@login');
$router->post('Admin/captcha','Mes\AdminController@makeCaptcha');
$router->get('Admin/selectedRole','Mes\AdminController@selectedRole');
$router->post('Admin/admin2role','Mes\AdminController@admin2role');






