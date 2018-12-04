<?php
/**
 * Created by PhpStorm.
 * User: zhufeng
 * Date: 2018/7/23
 * Time: 下午2:57
 */
namespace App\Http\Controllers\Excel;
use App\Http\Controllers\Controller;
use App\Http\Models\Excel\ExportExcel;
use Illuminate\Http\Request;

/**
 * 对接SAP 数据导出Excel 控制器
 * Class ExportExcelController
 * @package App\Http\Controllers\Excel
 * @author Bruce Chu
 */
Class ExportExcelController extends Controller
{
    protected $model;

    public function __construct()
    {
        parent::__construct();
        $this->model=new ExportExcel();
    }

    /**
     * 导出Excel 已经移动到计划任务处理
     */
    public function exportExcel()
    {
        //前端传参 => 物料清单编码
//        $item_no = $request->input('item_no');
//        if (empty($item_no)) TEA('700', 'item_no');
        //联系M层导出
        $er=$this->model->exportExcel();
        return $er;
    }
}