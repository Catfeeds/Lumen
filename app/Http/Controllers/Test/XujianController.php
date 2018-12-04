<?php
/**
 * Created by PhpStorm.
 * User: xujian
 * Date: 17/11/27
 * Time: 上午13:04
 */

namespace App\Http\Controllers\Test;

use Laravel\Lumen\Routing\Controller as BaseController;//引入Lumen底层控制器
use Illuminate\Http\Request;


/**
 * 许建测试控制器
 * Class XujianController
 * @package App\Http\Controllers\Test
 */
class XujianController extends BaseController
{
    public function getExcel()
    {
        //验证phpExcel是否已经安装
        $objPHPExcel = new \PHPExcel();

        print_r($objPHPExcel);
    }

    //导出excel
    public function  exportExcel()
    {
        $objPHPExcel = new \PHPExcel();

        $objPHPExcel->getProperties()->setTitle('export')->setDescription('Test Excel Export');

        $objPHPExcel->setActiveSheetIndex(0);

        //添加表头
        $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(0,1, 'column1');
        $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(1,1, 'column2');
        $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(2,1, 'column3');
        $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(3,1, 'column4');

        //添加数据
        $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(0,2,'value1col1');
        $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(1,2,'value1col2');
        $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(2,2,'value1col3');
        $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(3,2,'value1col4');
        //添加数据
        $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(0,3,'value2col1');
        $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(1,3,'value2col2');
        $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(2,3,'value2col3');
        $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(3,3,'value2col4');

        $objPHPExcel->setActiveSheetIndex(0);

        $objWrite = \PHPExcel_IOFactory::createWriter($objPHPExcel,'Excel5');

        //Sending headers to force the user to download the file
        header('Content-Type:application/vnd.ms-excel');

        //header('Content-Disposition:attachment;filename="Products_' .date('dMy') . '.xls"');

        header('Content-Disposition:attachment;filename="Brand_' .date('Y-m-d') . '.xls"');

        header('Cache-Control:max-age=0');

        $objWrite->save('php://output');
    }

    //导入Excel
    public function importExcel(Request $request)
    {
        $input=$request->all();
        $file = $input['import_file'];
        //获得文件后缀，并且转为小写字母显示
        $extension = strtolower(pathinfo($file,PATHINFO_EXTENSION));
        $excel_type = 'Excel5';
        if ($extension == 'xlsx' || $extension == 'xls')
        {
            //判断是否为excel
            $excel_type = ($extension == 'xlsx' ? 'Excel2007' : 'Excel5');
        }else
        {
            pd('文件不是excel');
        }
        //创建读取对象
        $objReader = \PHPExcel_IOFactory::createReader($excel_type)->load($file);
        $sheet = $objReader->getSheet( 0 );
        $highestRow = $sheet->getHighestRow();       //取得总行数 但是很多无数据的空白行也读取了，所以未采用此方法
        $highestColumn = $sheet->getHighestColumn(); //取得总列数
        //获得表头信息A,B,C......
        $col_span = range( 'A', $highestColumn );

//        $rowArray = $sheet->getRowDimensions();// 取得总行数
//
//        $rowCount = count($rowArray);
//        pd($rowArray);
        $values = [];
        //循环读取excel文件
        for ( $i = 0; $i < $highestRow; $i++ ) {
            $array = array( );
            foreach ( $col_span as $value ) {
                $array[] = $objReader->getActiveSheet()->getCell( $value . ($i + 1) )->getValue();
            }
            $values[] = $array;
        }
        pd($values);
    }
}


