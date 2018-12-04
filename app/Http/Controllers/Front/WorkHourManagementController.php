<?php

namespace App\Http\Controllers\Front;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
/**
 * 工序模块
 * @author  leo
 * @time    2018年02月02日14:41:31
 */
class WorkHourManagementController extends Controller
{
    /**
     * 工时列表
     * @return \Illuminate\View\View
     */
    public function workHourIndex()
    {
        return view('workhour.workhour_index');
    }


    public function addWorkHour()
    {
        return view('workhour.add_workhour');
    }

    public function editWorkHour()
    {
        return view('workhour.add_workhour');
    }
}