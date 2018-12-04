<?php

namespace App\Http\Controllers\Front;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
/**
 * Class OperationManagementController
 * 工艺路线
 * @package App\Http\Controllers\Front
 * @author  xin.min
 * @time    2018年04月03日13:53
 */
class PracticeManagementController extends Controller
{
    /**
     * 做法列表
     * @return \Illuminate\View\View
     */
    public function practiceIndex()
    {
        return view('practice.practice_index');
    }

    /**
     * 做法维护
     * @return \Illuminate\View\View
     */
    public function practiceEdit()
    {
        return view('practice.practice_edit');
    }

    /**做法查看(单个做法查看)
     * @param
     * @return
     * @author
     */
    public function practiceDetail(){
        return view('practice.practice_detail');
    }

    /**做法添加
     * @param
     * @return
     * @author
     */
    public function practiceAdd(){
        return view('practice.practice_add');
    }

    /**
     * 用处维护
     * @return \Illuminate\View\View
     * @author lesteryou 2018-04-25
     */
    public function useIndex(){
        return view('practice.use_index');
    }

    public function practiceCategoryIndex(){
        return view('practice.practiceCategoryIndex');
    }
}