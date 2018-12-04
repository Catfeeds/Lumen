<?php
/**
 * 从excel导入SAP的PO
 * User: kevin
 * Date: 2018/11/30
 * Time: 下午6:24
 */

namespace App\Console\Commands;

use App\Libraries\Log4php;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Facades\Excel;

ini_set('memory_limit','-1');
class ImportSapPo extends Command
{
    /**
     * 控制台命令 signature 的名称。
     *
     * @var string
     */
    protected $signature = 'po:import';

    /**
     * 控制台命令说明。
     *
     * @var string
     */
    protected $description = '从excel导入SAP的PO';

    protected $table       = 'ruis_production_order';
    /**
     * 创建一个新的命令实例。
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * 执行控制台命令。
     * @return mixed
     */
    public function handle()
    {
        //先获取excel上的数据
        $data = $this->getExcelData(intval(0));
        //去掉第一行导航
        unset($data[0]);

        try{
            DB::connection()->beginTransaction();
            //对po的数据进行导入
            $this->InsertPO($data,$this->table);
        }catch (\Exception $exception){
            DB::connection()->rollback();
            exit($exception->getMessage());
        }
        DB::connection()->commit();
    }

    /**
     * 获取每个sheet的工艺数据
     * @param $count
     * @return array
     */
    public function getExcelData($count){
        $res = [];
        $filePath = 'storage/app/public/po_excel/po.xls';
        Excel::load($filePath,function ($reader) use(&$res,$count){
            $reader = $reader->getSheet($count);
            $res = $reader->toArray();
        });
        return $res;
    }

    /**
     * 对excel中po的数据进行处理，插入数据库
     * @param $data
     * @return boolean
     */
    public function InsertPO($data,$table)
    {
        foreach ($data as $k => $v) {
            $insert_data[] = [
                'number' => $v[2],
                'sales_order_code' => $v[3],
                'status' => 0,
                'product_id' => $v[8],
                'qty' => $v[9],
                'component' => $v[24],
            ];
        }
        $res = DB::table($table)->insert($insert_data);
        if(!$res) exit('插入失败');
        return $res;
    }
}