<?php
/**
 * 暂时不用的路由放置的位置
 * Created by PhpStorm.
 * User: sansheng
 * Date: 17/11/29
 * Time: 下午3:16
 */



/*
 |----------------------------------------------------------------------
 |物料分组路由
 |@author sam.shan  <sam.shan@ruis-ims.cn>
 |----------------------------------------------------------------------
 |添加物料分组：MaterialGroup/store
 |编辑物料分组：MaterialGroup/update
 |删除某个物料分组信息：MaterialGroup/destroy
 |查看某个分组信息：MaterialGroup/show
 |物料分组列表：MaterialGroup/index
 |添加或者编辑物料分类时候关联分类的select列表:MaterialGroup/select
 |物料分组中所有字段唯一性检测接口：MaterialGroup/unique
 |物料分组关联分类选择实时检测：MaterialGroup/choose
 */

$router->post('MaterialGroup/store','Mes\MaterialGroupController@store');
$router->post('MaterialGroup/update','Mes\MaterialGroupController@update');
$router->get('MaterialGroup/destroy','Mes\MaterialGroupController@destroy');
$router->get('MaterialGroup/show','Mes\MaterialGroupController@show');
$router->get('MaterialGroup/index','Mes\MaterialGroupController@index');
$router->get('MaterialGroup/select','Mes\MaterialGroupController@select');
$router->get('MaterialGroup/unique','Mes\MaterialGroupController@unique');
$router->post('MaterialGroup/choose','Mes\MaterialGroupController@choose');



/**
|------------------------------------------------------------------------------
|物料模板类型路由
|@author   sam.shan   <sam.shan@ruis-ims.cn>
|------------------------------------------------------------------------------
| 添加物料模板类型：MaterialTemplateType/store
| 物理删除某个模板类型信息：MaterialTemplateType/destroy
| 编辑物料模板类型：MaterialTemplateType/update
| 查看某个物料模板类型信息：MaterialTemplateType/show
| 物料模板类型树状列表：MaterialTemplateType/treeIndex
| 添加或者编辑物料模板类型时候的select列表:material_basic/categories/select
| 物料模板类型中所有的字段唯一性检测接口:material_basic/categories/unique
 */
$router->post('MaterialTemplateType/store','Mes\MaterialTemplateTypeController@store');
$router->get('MaterialTemplateType/destroy','Mes\MaterialTemplateTypeController@destroy');
$router->post('MaterialTemplateType/update','Mes\MaterialTemplateTypeController@update');
$router->get('MaterialTemplateType/show','Mes\MaterialTemplateTypeController@show');
$router->get('MaterialTemplateType/treeIndex','Mes\MaterialTemplateTypeController@treeIndex');
$router->get('MaterialTemplateType/select','Mes\MaterialTemplateTypeController@select');
$router->get('MaterialTemplateType/unique','Mes\MaterialTemplateTypeController@unique');


