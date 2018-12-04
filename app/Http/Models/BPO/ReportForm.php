<?php
/**
 * Created by PhpStorm.
 * User: lester
 * Date: 2018/11/14 14:22
 * Desc:
 */

namespace App\Http\Models\BPO;


use App\Http\Models\Base;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Maatwebsite\Excel\Facades\Excel;

class ReportForm extends Base
{

    public $extensionArr = [
        'xls', 'xlsx'
    ];

    public function __construct()
    {
        $this->apiPrimaryKey = 'report_form_id';
        $this->table = config('alias.rbprf');
    }

    /**
     * 保存
     *
     * @param $input
     * @return mixed
     */
    public function storeFile($input)
    {
        $keyVal = [
            'name' => $input['name'],
            'file_path' => $input['file_path'],
            'creator_id' => $input['creator_id'],
            'ctime' => time(),
        ];
        $insert_id = DB::table(config('alias.rbpf'))->insertGetId($keyVal);
        return $insert_id;
    }

    /**
     * 读取Excel文件，并导入数据库
     *
     * @param $file_id
     * @param string $path
     * @throws \App\Exceptions\ApiException
     */
    public function import($file_id, $path = '')
    {
        if (empty($path)) {
            $obj = DB::table(config('alias.rbpf'))->select(['file_path', 'status'])->where('id', $file_id)->first();
            if (empty($obj)) {
                TEA('5100');
            }
            if ($obj->status == 2) {
                TEA('5103');    //改Excel已导入
            }
            $path = $obj->file_path;
        }

        $path = storage_path('app/public') . DIRECTORY_SEPARATOR . $path;

        if (!is_readable($path)) {
            var_dump($path);
            TEA('5101');    //文件不可读
        }

        $excelDataArr = [];
        Excel::load($path, function ($reader) use (&$excelDataArr) {
            $reader = $reader->getSheet(0);
            $excelDataArr = $reader->toArray();
        });

        if (empty($excelDataArr) || count($excelDataArr[0]) != 17) TEA('5102');
        unset($excelDataArr[0]);

        $keyValArr = [];
        $keyArr = [
            'sale_order_code',
            'sale_order_line_code',
            'operation_text',
            'deliver_date',
            'buy_number',
            'today_repot_number',
            'sum_repot_number',
            'semimanufactures_code',
            'semimanufactures_description',
            'buy_order_code',
            'product_order_code',
            'operation_code',
            'statistician',
            'supplier_code',
            'supplier_name',
            'status',
            'actual_start_date',
        ];
        $i = 0;
        try {
            DB::connection()->beginTransaction();
            $dataCount = count($excelDataArr);
            foreach ($excelDataArr as $key => $value) {
                if (count($value) != 17) {
                    TEA(5102);
                }
                $keyVal = array_combine($keyArr, $value);
                $keyVal['file_id'] = $file_id;
                $keyValArr[] = $keyVal;
                $i++;
                if ($i == 50 || ($dataCount < 50 && $dataCount == $i)) {
                    $i = 0;
                    DB::table($this->table)->insert($keyValArr);
                    $keyValArr = [];
                }
            }
            DB::table(config('alias.rbpf'))->where('id', $file_id)->update(['status' => 2]);
        } catch (\Exception $e) {
            DB::connection()->rollBack();
            TEA($e->getCode(), $e->getMessage());
        }
        DB::connection()->commit();
    }

    /**
     * 删除
     *
     * @param $input
     * @throws \App\Exceptions\ApiException
     */
    public function delete($input)
    {
        if (empty($input['file_id'])) TEA(700, 'file_id');

        $obj = DB::table(config('alias.rbpf'))->select(['id', 'file_path'])->where('id', $input['file_id'])->first();
        if (empty($obj)) {
            TEA('5105');
        }
        $path = storage_path('app/public') . DIRECTORY_SEPARATOR . $obj->file_path;

        try {
            DB::connection()->beginTransaction();
            DB::table($this->table)->where('file_id', $input['file_id'])->delete();
            DB::table(config('alias.rbpf'))->where('id', $input['file_id'])->delete();
            //如果文件存在就删除
            if (is_file($path)) {
                Storage::disk('public')->delete($obj->file_path);;
            }
        } catch (\Exception $e) {
            DB::connection()->rollBack();
            TEA($e->getCode(), $e->getMessage());
        }
        DB::connection()->commit();

    }

    /**
     * Excel文件列表
     *
     * @param $input
     * @return mixed
     */
    public function pageIndex(&$input)
    {
        if (empty($input['page_no'])) $input['page_no'] = 1;
        if (empty($input['page_size'])) $input['page_size'] = 20;
        $where = [];
        $builder = DB::table(config('alias.rbpf') . ' as rbpf')
            ->leftJoin(config('alias.rrad') . ' as rrad', 'rrad.id', '=', 'rbpf.creator_id')
            ->select([
                'rbpf.*',
                'rrad.name as creator_name',
            ])
            ->where($where);
        $input['total_records'] = $builder->count('*');
        $builder->forPage($input['page_no'], $input['page_size']);
        $input['sort'] = empty($input['sort']) ? 'id' : $input['sort'];
        $input['order'] = empty($input['order']) ? 'DESC' : $input['order'];
        $builder->orderBy('rbpf.' . $input['sort'], $input['order']);
        $obj_list = $builder->get();
        foreach ($obj_list as $k => &$v) {
            $v->ctime = date('Y-m-d H:i:s', $v->ctime);
        }
        return $obj_list;
    }

    /**
     * excel内容页面展示
     *
     * @param $input
     * @return mixed
     * @throws \App\Exceptions\ApiException
     */
    public function contentList(&$input)
    {
        if (empty($input['file_id'])) TEA(700, 'file_id');
        if (empty($input['page_no'])) $input['page_no'] = 1;
        if (empty($input['page_size'])) $input['page_size'] = 20;
        $builder = DB::table($this->table)
            ->select('*')
            ->where('file_id', $input['file_id']);
        $input['total_records'] = $builder->count();
        $builder->forPage($input['page_no'], $input['page_size']);
        $input['sort'] = empty($input['sort']) ? 'id' : $input['sort'];
        $input['order'] = empty($input['order']) ? 'DESC' : $input['order'];
        $builder->orderBy($input['sort'], $input['order']);
        $obj_list = $builder->get();
        return $obj_list;
    }
}