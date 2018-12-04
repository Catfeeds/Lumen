<?php
/**
 * Created by PhpStorm.
 * User: ruiyanchao
 * Date: 2017/12/18
 * Time: 下午6:48
 */

namespace App\Http\Controllers\Test;

use Laravel\Lumen\Routing\Controller as BaseController;//引入Lumen底层控制器
use Illuminate\Support\Facades\DB;//引入DB操作类
use Maatwebsite\Excel\Facades\Excel;

/**
 * rick用来测试的控制器
 * Class SamController
 * @package App\Http\Controllers\Test
 */
class RickController extends BaseController
{
    public function test()
    {
        dd(config('dictionary'));
        $tmp = array(
            array(
                "bom_id" => 6,
                "bom_item_id"=>4,  //id 添加时为空 编辑时为具体参数
                "material_id"=>3,  //物料ID
                "loss_rate"=>0, //损耗率
                "is_assembly"=>1,  //是否组装
                "usage_number"=>200,//使用量
                "comment"=>"",  //描述
                "bom_item_qty_levels"=>array(  //阶梯使用量
                    array(
                        "bom_item_qty_level_id"=>129,
                        "bom_item_id"=>4,
                        "parent_min_qty"=>100,   //父项用量
                        "qty"=>1000              //用量
                    ),
                    array(
                        "bom_item_qty_level_id"=>130,
                        "bom_item_id"=>4,
                        "parent_min_qty"=>200,
                        "qty"=>2500
                    ),
                    array(
                        "bom_item_qty_level_id"=>131,
                        "bom_item_id"=>4,
                        "parent_min_qty"=>1000,
                        "qty"=>10000
                    ),

                ),
                "son_material_id"=>array(1,2,3), //所有儿子的物料ID
                "total_consume"=>1000,           //总单号
                "replaces"=>array(                //替换物料
//                    array(
//                        "bom_item_id"=>2,
//                        "material_id"=>2,
//                        "loss_rate"=>0.00,
//                        "is_assembly"=>1,
//                        "usage_number"=>11,
//                        "comment"=>"描述",
//                        "bom_item_qty_levels"=>array(
//                            array(
//                                "bom_item_qty_level_id"=>3,
//                                "parent_min_qty"=>12,
//                                "qty"=>15
//                            ),
//                            array(
//                                "bom_item_qty_level_id"=>4,
//                                "parent_min_qty"=>20,
//                                "qty"=>21
//                            ),
//
//                        ),
//                        "son_material_id"=>array(4,5,6),
//                        "total_consume"=>1200,
//                    ),
//                    array(
//                        "bom_item_id"=>3,
//                        "material_id"=>3,
//                        "loss_rate"=>0.00,
//                        "is_assembly"=>1,
//                        "usage_number"=>11,
//                        "comment"=>"描述",
//                        "bom_item_qty_levels"=>array(
//                            array(
//                                "bom_item_qty_level_id"=>5,
//                                "parent_min_qty"=>12,
//                                "qty"=>15
//                            ),
//                            array(
//                                "bom_item_qty_level_id"=>6,
//                                "parent_min_qty"=>20,
//                                "qty"=>21
//                            ),
//
//                        ),
//                        "son_material_id"=>array(7,8,9),
//                        "total_consume"=>1200,
//                    )
//
                )
            ),
            array(
                "bom_item_id"=>5,
                "material_id"=>8,
                "loss_rate"=>0,
                "is_assembly"=>0,
                "usage_number"=>0,
                "comment"=>"",
                "bom_item_qty_levels"=>array(
                    array(
                        "bom_item_qty_level_id"=>273,
                        "bom_item_id"=>5,
                        "parent_min_qty"=>11,
                        "qty"=>111
                    ),


                ),
                "son_material_id"=>array(10,11,12),
                "total_consume"=>null,
                "replaces"=>array(
                    array(
                        "bom_id"=>6,
                        "bom_item_id"=>6,
                        "material_id"=>9,
                        "loss_rate"=>0,
                        "is_assembly"=>0,
                        "usage_number"=>0,
                        "comment"=>"",
                        "bom_item_qty_levels"=>array(
                            array(
                                "bom_item_qty_level_id"=>135,
                                "bom_item_id"=>6,
                                "parent_min_qty"=>10,
                                "qty"=>40
                            ),
                            array(
                                "bom_item_qty_level_id"=>136,
                                "bom_item_id"=>6,
                                "parent_min_qty"=>77,
                                "qty"=>888
                            ),

                        ),
                        "son_material_id"=>array(13,14,15),
                        "total_consume"=>null,
                    ),
//                    array(
//                        "bom_item_id"=>6,
//                        "material_id"=>6,
//                        "loss_rate"=>0.00,
//                        "is_assembly"=>1,
//                        "usage_number"=>11,
//                        "comment"=>"描述",
//                        "bom_item_qty_levels"=>array(
//                            array(
//                                "bom_item_qty_level_id"=>11,
//                                "parent_min_qty"=>12,
//                                "qty"=>15
//                            ),
//                            array(
//                                "bom_item_qty_level_id"=>12,
//                                "parent_min_qty"=>20,
//                                "qty"=>21
//                            ),
//
//                        ),
//                        "son_material_id"=>array(16,17,18),
//                        "total_consume"=>1200,
//                    )

                )
            )


        );
        echo json_encode($tmp);
    }

    public function excelExport()
    {
//        $cellData = [
//            ['学号','姓名','成绩'],
//            ['10001','AAAAA','99'],
//            ['10002','BBBBB','92'],
//            ['10003','CCCCC','95'],
//            ['10004','DDDDD','89'],
//            ['10005','EEEEE','96'],
//        ];
//        Excel::create('学生成绩',function($excel) use ($cellData){
//            $excel->sheet('score', function($sheet) use ($cellData){
//                $sheet->rows($cellData);
//            });
//            ob_end_clean();
//        })->export('xlsx');
        Excel::create('Filename', function($excel) {
            // Set the title
            $excel->setTitle('Our new awesome title');
            // Chain the setters
            $excel->setCreator('Maatwebsite')
                ->setCompany('Maatwebsite');
            // Call them separately,
            $excel->setDescription('A demonstration to change the file properties');
            $excel->sheet('First sheet', function($sheet) {
                $sheet->cells('A1:A5', function($cells) {
                });
            });
            ob_end_clean();
        })->export('xlsx');
    }

    public function excelImport()
    {
        $filePath = 'storage/exports/'.iconv('UTF-8', 'GBK', '学生成绩').'.xls';
        Excel::load($filePath, function($reader) {
            $data = $reader->all();
            dd($data);
        });
        // 加载文件
        Excel::load('file.xls', function($reader) {

            // 获取数据的集合
            $results = $reader->get();

            // 获取第一行数据
            $results = $reader->first();

            // 获取前10行数据
            $reader->take(10);

            // 跳过前10行数据
            $reader->skip(10);

            // 以数组形式获取数据
            $reader->toArray();

            // 打印数据
            $reader->dump();

            // 遍历工作表
            $reader->each(function($sheet) {

                // 遍历行
                $sheet->each(function($row) {

                });

            });

            // 获取指定的列
            $reader->select(array('firstname', 'lastname'))->get();

            // 获取指定的列
            $reader->get(array('firstname', 'lastname'));

        });

        // 选择名为sheet1的工作表
        Excel::selectSheets('sheet1')->load();

         // 根据索引选择工作表
        Excel::selectSheetsByIndex(0)->load();
    }
}