<?php
/**
 * Created by PhpStorm.
 * User: sansheng
 * Date: 17/11/30
 * Time: 上午11:03
 */



/*
|------------------------------------------------------------------------------
|通用路由配置
|@author  sam.shan   <sam.shan@ruis-ims.cn>
|------------------------------------------------------------------------------
|获得单位列表：getUnits
|属性数据类型列表 getAttributeDataType
*/
$router->get('getUnits','Mes\GeneralController@getUnitList');
$router->get('getAttributeDataType','Mes\GeneralController@getAttributeDataTypeList');


/*
|------------------------------------------------------------------------------
|操作日志
|@author  sam.shan   <sam.shan@ruis-ims.cn>
|------------------------------------------------------------------------------
*/
$router->get('Trace/pageIndex','Mes\TraceController@pageIndex');
$router->get('Trace/operators','Mes\TraceController@operators');



/*
|------------------------------------------------------------------------------
|版本管理
|@author  kevin
|------------------------------------------------------------------------------
*/
$router->get('Mes/Version','Mes\VersionController@managerVersion');


