<?php
/**
 * Created by PhpStorm.
 * User: lester
 * Date: 2018/11/14 14:31
 * Desc:
 */
//上传excel
$router->post('ReportForm/uploadExcel', 'BPO\ReportFormController@uploadExcel');
//excel导入到数据库中
$router->post('ReportForm/import', 'BPO\ReportFormController@import');

//删除
$router->post('ReportForm/delete', 'BPO\ReportFormController@delete');
//列表
$router->get('ReportForm/pageIndex', 'BPO\ReportFormController@pageIndex');
//excel内容展示列表
$router->get('ReportForm/contentList', 'BPO\ReportFormController@contentList');
