<?php

namespace App\Http\Controllers\Front;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;


/**
 * 物料清单管理视图控制器
 * @author  rick
 * @time    2018年01月10日14:41:31
 */
class PersonnelController extends Controller
{



    //region  岗位管理
    /**
     * 岗位列表
     * @return   string   json
     * @author   rick
     */
    public function jobIndex(Request  $request)
    {
        return view('personnel.job_index');
    }

    /**
     * 岗位添加
     * @return   string   json
     * @author   rick
     */
    public function jobCreate(Request  $request)
    {
        return view('personnel.job_form');
    }

    /**
     * 岗位编辑
     * @return   string   json
     * @author   rick
     */
    public function jobEdit(Request  $request)
    {
        return view('personnel.job_form');
    }

    //endregion

    //region  部门管理
    /**
     * 部门列表
     * @return   string   json
     * @author   rick
     */
    public function departmentIndex(Request  $request)
    {
        return view('personnel.department_index');
    }

    /**
     * 部门创建
     * @return   string   json
     * @author   rick
     */
    public function departmentCreate(Request  $request)
    {
        return view('personnel.department_form');
    }

    /**
     * 部门修改
     * @return   string   json
     * @author   rick
     */
    public function departmentEdit(Request  $request)
    {
        return view('personnel.department_form');
    }
    //endregion

    //region 员工管理

    /**
     * 员工列表
     * @return   string   json
     * @author   rick
     */
    public function employeeIndex(Request  $request)
    {
        return view('personnel.employee_index');
    }

    /**
     * 员工创建
     * @return   string   json
     * @author   rick
     */
    public function employeeCreate(Request  $request)
    {
        return view('personnel.employee_form');
    }

    /**
     * 员工修改
     * @return   string   json
     * @author   rick
     */
    public function employeeEdit(Request  $request)
    {
        return view('personnel.employee_form');
    }
    /**
     * 员工查看
     * @return   string   json
     * @author   rick
     */
    public function employeeView(Request  $request)
    {
        return view('personnel.employee_view');
    }
    //endregion





}