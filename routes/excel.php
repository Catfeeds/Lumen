<?php
/**
 * Created by PhpStorm.
 * User: zhufeng
 * Date: 2018/7/23
 * Time: 下午3:08
 */

/**
|------------------------------------------------------------------------------
|export excel
|@author   Bruce.Chu
|------------------------------------------------------------------------------
*/

//导出Excel SAP工艺数据对接
$router->post('Excel/ExportExcel','Excel\ExportExcelController@exportExcel');