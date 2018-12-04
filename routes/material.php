<?php
/**
 * 物料路由放置位置
 * @author  sam.shan  <sam.shan@ruis-ims.cn>
 * @time    2017年09月14日10:04:16
 */




//region 物料分类路由
/*
 |-----------------------------------------------------------------------
 |@author sam.shan  <sam.shan@ruis-ims.cn>
 |----------------------------------------------------------------------
 | 唯一性检测:     MaterialCategory/unique
 | 添加:          MaterialCategory/store
 | 编辑:          MaterialCategory/update
 | 查看:          MaterialCategory/show
 | 树形结构列表:    MaterialCategory/treeIndex
 | select列表:    MaterialCategory/select
 | 删除:          MaterialCategory/destroy
 |
 */

$router->get('MaterialCategory/unique','Mes\MaterialCategoryController@unique');
$router->post('MaterialCategory/store','Mes\MaterialCategoryController@store');
$router->post('MaterialCategory/update','Mes\MaterialCategoryController@update');
$router->get('MaterialCategory/show','Mes\MaterialCategoryController@show');
$router->get('MaterialCategory/treeIndex','Mes\MaterialCategoryController@treeIndex');
$router->get('MaterialCategory/select','Mes\MaterialCategoryController@select');
$router->get('MaterialCategory/destroy','Mes\MaterialCategoryController@destroy');
//endregion




//region  物料属性路由
/*
|------------------------------------------------------------------------------
|@author   sam.shan <sam.shan@ruis-ims.cn>
|------------------------------------------------------------------------------
|检查唯一性:            MaterialAttributeDefinition/unique
|添加:                 MaterialAttributeDefinition/store
|编辑:                 MaterialAttributeDefinition/update
|查看:                 MaterialAttributeDefinition/show
|分页列表:              MaterialAttributeDefinition/pageIndex
|删除:                 MaterialAttributeDefinition/destroy
*/

$router->get('MaterialAttributeDefinition/unique','Mes\MaterialAttributeDefinitionController@unique');
$router->post('MaterialAttributeDefinition/store','Mes\MaterialAttributeDefinitionController@store');
$router->post('MaterialAttributeDefinition/update','Mes\MaterialAttributeDefinitionController@update');
$router->get('MaterialAttributeDefinition/show','Mes\MaterialAttributeDefinitionController@show');
$router->get('MaterialAttributeDefinition/pageIndex','Mes\MaterialAttributeDefinitionController@pageIndex');
$router->get('MaterialAttributeDefinition/destroy','Mes\MaterialAttributeDefinitionController@destroy');
//endregion




//region 物料模板路由
/*
|------------------------------------------------------------------------------
|@author  sam.shan   <sam.shan@ruis-ims.cn>
|------------------------------------------------------------------------------
|唯一性检测:               MaterialTemplate/unique
|添加基础信息:             MaterialTemplate/store
|保存基础信息:             MaterialTemplate/update
|可选择的物料属性:          MaterialTemplate/optionalMaterialAttributes
|已选择的物料属性:          MaterialTemplate/selectedMaterialAttributes
|已继承的物料属性:          MaterialTemplate/extendMaterialAttributes
|保存物料属性:             MaterialTemplate/bindMaterialAttributes
|可选择的工艺属性:          MaterialTemplate/optionalOperationAttributes
|已选择的工艺属性:          MaterialTemplate/selectedOperationAttributes
|根据勾选的工序筛选工艺属性   MaterialTemplate/linkOperationAttributes
|保存工艺属性              MaterialTemplate/bindOperationAttributes
|属性过滤设置展示接口        MaterialTemplate/attributesFilter
|保存属性过滤              MaterialTemplate/setAttributesFilter
|查看
|分页列表
|树形结构列表
|物料模板select列表
|删除                    MaterialTemplate/destroy

|
*/
$router->get('MaterialTemplate/unique','Mes\MaterialTemplateController@unique');
$router->post('MaterialTemplate/store','Mes\MaterialTemplateController@store');
$router->post('MaterialTemplate/update','Mes\MaterialTemplateController@update');
$router->get('MaterialTemplate/optionalMaterialAttributes','Mes\MaterialTemplateController@optionalMaterialAttributes');
$router->get('MaterialTemplate/selectedMaterialAttributes','Mes\MaterialTemplateController@selectedMaterialAttributes');
$router->get('MaterialTemplate/extendMaterialAttributes','Mes\MaterialTemplateController@extendMaterialAttributes');
$router->post('MaterialTemplate/bindMaterialAttributes','Mes\MaterialTemplateController@bindMaterialAttributes');
$router->get('MaterialTemplate/optionalOperationAttributes','Mes\MaterialTemplateController@optionalOperationAttributes');
$router->get('MaterialTemplate/selectedOperationAttributes','Mes\MaterialTemplateController@selectedOperationAttributes');
$router->get('MaterialTemplate/linkOperationAttributes','Mes\MaterialTemplateController@linkOperationAttributes');
$router->post('MaterialTemplate/bindOperationAttributes','Mes\MaterialTemplateController@bindOperationAttributes');
$router->get('MaterialTemplate/attributesFilter','Mes\MaterialTemplateController@attributesFilter');
$router->post('MaterialTemplate/setAttributesFilter','Mes\MaterialTemplateController@setAttributesFilter');
$router->get('MaterialTemplate/show','Mes\MaterialTemplateController@show');
$router->get('MaterialTemplate/pageIndex','Mes\MaterialTemplateController@pageIndex');
$router->get('MaterialTemplate/treeIndex','Mes\MaterialTemplateController@treeIndex');
$router->get('MaterialTemplate/select','Mes\MaterialTemplateController@select');
$router->get('MaterialTemplate/destroy','Mes\MaterialTemplateController@destroy');

//endregion




//region 物料管理路由
/**
|------------------------------------------------------------------------------
|@author   sam.shan  <sam.shan@ruis-ims.cn>
|------------------------------------------------------------------------------
|添加物料唯一性检测:                 Material/unique
|使用模板方式添加物料,返回模板的属性:   Material/getTemplateAttributeList
|继承关系的属性值可以参看相应的物料:    Material/getGeneticReferMaterial
|参照物料的属性情况:                 Material/getAttributeValueList
|添加                             Material/store
|修改                             Material/update
|查看:                            Material/show
|分页列表:                         Material/pageIndex
|BOM顶级母件查询:                   Material/bomMother
|BOM子项查询:                      Material/bomItem
|删除:                            Material/destroy
|根据某个物料获取使用模板的属性及属性值 Material/getMaterialTemplateAttributeList
|上传ERP物料                       Material/uploadErpMaterial
 */
$router->get('Material/unique','Mes\MaterialController@unique');
$router->get('Material/getTemplateAttributeList','Mes\MaterialController@getTemplateAttributeList');
$router->get('Material/getGeneticReferMaterial','Mes\MaterialController@getGeneticReferMaterial');
$router->get('Material/getAttributeValueList','Mes\MaterialController@getAttributeValueList');
$router->post('Material/store','Mes\MaterialController@store');
$router->post('Material/update','Mes\MaterialController@update');
$router->get('Material/show','Mes\MaterialController@show');
$router->get('Material/pageIndex','Mes\MaterialController@pageIndex');
$router->get('Material/bomMother','Mes\MaterialController@bomMother');
$router->get('Material/orderMother','Mes\MaterialController@orderMother');
$router->get('Material/bomItem','Mes\MaterialController@bomItem');
$router->get('Material/destroy','Mes\MaterialController@destroy');
$router->get('Material/getMaterialTemplateAttributeList','Mes\MaterialController@getMaterialTemplateAttributeList');
$router->post('Material/checkSimilar','Mes\MaterialController@checkSimilar');

/**
|------------------------------------------------------------------------------
|@author   Bruce.Chu 2018-07-02
|------------------------------------------------------------------------------
|上传ERP物料                       Material/pullErpMaterialAndBOM
 */
$router->post('Material/pullErpMaterialAndBOM','Mes\MaterialController@pullErpMaterialAndBOM');
//endregion