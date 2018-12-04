<?php

namespace App\Http\Controllers\Front;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
/**
 * 工序模块
 * @author  leo
 * @time    2018年02月02日14:41:31
 */
class OperationManagementController extends Controller
{
    /**
     * 工序列表
     * @return \Illuminate\View\View
     */
    public function operationIndex()
    {
        return view('operation.operation_index');
    }

    /**
     * 工序维护
     * @return \Illuminate\View\View
     */
    public function operationSetting()
    {
        return view('operation.operation_setting');
    }

    /**
     * 做法字段
     * @author lesteryou
     * @time 2018-04-10
     * @return \Illuminate\View\View
     */
    public function practiceField()
    {
        return view('operation.practice_field');
    }

    /**
     * 工序工时设置
     * @author guangyang.wang
     * @time 2018-04-21
     * @return \Illuminate\View\View
     */
    public function operationOrWorkHourSetting()
    {
        return view('operation.operation_workhour_setting');
    }

    /**
     * 产品细分类
     * @author lesteryou
     * @time 2018-04-28
     * @return \Illuminate\View\View
     */
    public function productType()
    {
        return view('product_type.type_index');
    }




}