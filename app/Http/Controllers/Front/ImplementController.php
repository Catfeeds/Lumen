<?php

namespace App\Http\Controllers\Front;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
/**
 * 实施模块
 * @author  rick
 * @time    2018年01月10日14:41:31
 */
class ImplementController extends Controller
{



    //region  数据导入
    /**
     * 岗位列表
     * @return   string   json
     * @author   rick
     */
    public function dataExport(Request $request)
    {
        return view('implement.data_export');
    }

    //endregion

    /**
     * 物料编码设置
     * @return \Illuminate\View\View
     */
    public function materialEncoding()
    {
        return view('implement.material_encoding');
    }
    /**
     * 物料编码设置
     * @return \Illuminate\View\View
     */
    public function unitSetting()
    {
        return view('implement.unit_setting');
    }



}