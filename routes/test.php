<?php
/**
 * Created by PhpStorm.
 * User: sam.shan
 * Date: 17/10/19
 * Time: 上午9:02
 */


//use Illuminate\Support\Facades\Cache;







/*
|------------------------------------------------------------------------------
|大山测试区域
|@author  sam.shan   <sam.shan@ruis-ims.cn>
|------------------------------------------------------------------------------
|
*/


$router->get('sam/automatic_code','Test\SamController@automaticCode');
$router->get('sam/display_cate','Test\SamMaterialController@displayCate');
$router->get('sam/mongo','Test\SamController@mongo');
$router->get('sam/cache','Test\SamController@cache');
$router->get('sam/redis','Test\SamController@redis');
$router->get('sam/memcached','Test\SamController@memcached');
$router->get('sam/filesystems','Test\SamController@filesystems');
$router->post('sam/upload','Test\SamController@upload');
$router->post('sam/upload2','Test\SamController@upload2');
$router->post('sam/upload3','Test\SamController@upload3');
$router->get('sam/image','Test\SamController@image');
$router->get('sam/index','Test\SamController@index');
$router->get('sam/syntax','Test\SamController@syntax');
$router->get('sam/view01','Test\SamController@view01');
$router->get('sam/ajax01','Test\SamController@ajax01');
$router->get('sam/cookie01','Test\SamController@cookie01');
$router->get('sam/captcha01','Test\SamController@captcha01');
$router->get('sam/management_info','Test\SamController@managementInfo');
$router->get('sam/excelExport','Test\SamController@excelExport');
$router->get('sam/splitOrder','Test\SamController@splitOrder');
$router->get('sam/bomAttributes','Test\SamController@bomAttributes');






$router->get('sam/bom',function(){


    return '[{"bom_id":"4","bom_material_id":26,"bom_item_id":10,"material_id":24,"loss_rate":"0","is_assembly":0,"usage_number":"1","comment":"","bom_item_qty_levels":[{"bom_item_qty_level_id":"8","bom_item_id":"10","parent_min_qty":"1","qty":"1"}],"son_material_id":[],"total_consume":"1","replaces":[{"bom_id":"4","bom_material_id":26,"bom_item_id":13,"material_id":29,"loss_rate":"0","is_assembly":0,"usage_number":"2","comment":"","bom_item_qty_levels":[{"bom_item_qty_level_id":"_29_1","bom_item_id":"13","parent_min_qty":"6","qty":"6"}],"son_material_id":[],"total_consume":"4"}]}]';
     //return '[{"bom_item_id":0,"material_id":21,"loss_rate":"0.00","is_assembly":1,"usage_number":"8","comment":"ceshi","bom_item_qty_levels":[{"bom_item_qty_level_id":0,"bom_item_id":0,"parent_min_qty":"3","qty":"4"},{"bom_item_qty_level_id":0,"bom_item_id":0,"parent_min_qty":"5","qty":"6"}],"son_material_id":[15,14,19,20],"total_consume":"30","replaces":[]}]';
});


$router->get('xujian/getExcel','Test\XujianController@getExcel');
$router->get('xujian/exportExcel','Test\XujianController@exportExcel');
$router->post('xujian/importExcel','Test\XujianController@importExcel');


/*
|------------------------------------------------------------------------------
|rick测试区域
|@author  rick
|------------------------------------------------------------------------------
|
*/
$router->get('rick/test','Test\RickController@test');
$router->get('rick/excelExport','Test\RickController@excelExport');
$router->get('rick/excelImport','Test\RickController@excelImport');


/*
|------------------------------------------------------------------------------
|kevin测试区域
|@author  kevin
|------------------------------------------------------------------------------
|
*/
$router->get('kevin/test','Test\KevinController@test');
$router->get('kevin/managerVersion','Test\KevinController@managerVersion');
$router->get('ERP/handleMaterial','Test\KevinController@handleMaterial');
$router->get('ERP/handleOrder','Test\KevinController@handleOrder');

/*
|------------------------------------------------------------------------------
|Bruce测试区域
|@author  Bruce Chu
|------------------------------------------------------------------------------
|
*/

$router->get('excel/export','Test\BruceController@export');
$router->get('excel/exportProcedureRoute','Test\BruceController@exportProcedureRoute');
$router->get('excel/import','Test\BruceController@import');
$router->get('erp/getErpOrderApi','Test\BruceController@getErpOrderApi');
$router->get('erp/pullAttachment','Test\BruceController@pullAttachment');
$router->get('download/excel','Test\BruceController@downloadExcel');
/*
|------------------------------------------------------------------------------
|Xin测试区域
|@author  xin
|------------------------------------------------------------------------------
|
*/
$router->get('Xin/material','Test\XinController@material');
$router->get('Xin/test','Test\XinController@test');


/*
 |------------------------------------------------------------------------------
 | lester.you 测试区域
 | @author lester.you
 |------------------------------------------------------------------------------
 |
*/
$router->get('lester/queueAsync', 'Test\LesterController@queueAsync');
$router->get('lester/queueSync', 'Test\LesterController@queueSync');
$router->get('lester/import', 'Test\LesterController@import');
$router->get('lester/srm', 'Test\LesterController@srm');
$router->get('lester/errorTest', 'Test\LesterController@errorTest');
$router->get('lester/sapReturn', 'Test\LesterController@sapReturn');



