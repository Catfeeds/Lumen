<?php
/**
 * Created by PhpStorm.
 * User: sansheng
 * Date: 17/11/18
 * Time: 下午2:07
 */


/*
|------------------------------------------------------------------------------
|上传下载路由
|@author  sam.shan   <sam.shan@ruis-ims.cn>
|------------------------------------------------------------------------------
|下载附件  Download/attachment
|上传附件  Upload/attachment
|删除附件  Upload/destroy
*/

$router->get('Download/attachment','Mes\DownloadController@attachment');
$router->post('Upload/attachment','Mes\UploadController@attachment');
$router->get('Upload/destroy','Mes\UploadController@destroy');

/*
|------------------------------------------------------------------------------
|图纸库
|@author   sam.shan  <sam.shan@ruis-ims.cn>
|------------------------------------------------------------------------------
| 图纸分页列表:Drawing/pageIndex
| 查看图纸详情:Drawing/show
 */
$router->get('Drawing/pageIndex','Mes\DrawingController@pageIndex');
$router->get('Drawing/show','Mes\DrawingController@show');



/*
|------------------------------------------------------------------------------
|图纸类型
|@author   sam.shan  <sam.shan@ruis-ims.cn>
|------------------------------------------------------------------------------
| 图纸类型select列表:DrawingType/select
 */
$router->get('DrawingType/select','Mes\DrawingTypeController@select');


/*
|------------------------------------------------------------------------------
|图纸组
|@author   sam.shan  <sam.shan@ruis-ims.cn>
|------------------------------------------------------------------------------
| 图纸组联动select列表:DrawingGroup/linkSelect
*/

$router->get('DrawingGroup/linkSelect','Mes\DrawingGroupController@linkSelect');






/*
|------------------------------------------------------------------------------
|针对options请求特殊处理的路由
|@author  sam.shan   <sam.shan@ruis-ims.cn>
|------------------------------------------------------------------------------
|上传附件  Upload/attachment
*/


//$router->group(['middleware' => 'cross-origin'], function () use ($router){
//    $router->get('Upload/attachment','Mes\UploadController@attachment');
//
//
//
//});

/*
|------------------------------------------------------------------------------
|excel 上传导入
|@author  rick
|------------------------------------------------------------------------------
|上传excel  Upload/excel
*/
$router->post('Upload/excel','Mes\UploadController@excel');