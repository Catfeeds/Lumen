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
class ProcedureManagementController extends Controller
{
    /**
     * 工艺路线列表
     * @return \Illuminate\View\View
     */
    public function procedureIndex()
    {
        return view('procedure.procedure_index');
    }

    /**
     * 工艺路线维护
     * @return \Illuminate\View\View
     */
    public function procedureEdit()
    {
        return view('procedure.procedure_edit');
    }

    /**工艺路线查看(单个工艺路线查看)
     * @param
     * @return
     * @author
     */
    public function procedureDetail(){
        return view('procedure.procedure_detail');
    }

    /**工艺路线添加
     * @param
     * @return
     * @author
     */
    public function procedureAdd(){
        return view('procedure.procedure_add');
    }

    /**
     * 工艺路线组
     * @return \Illuminate\View\View
     */
    public function procedureGroup()
    {
        return view('procedure.procedure_group');
    }
}