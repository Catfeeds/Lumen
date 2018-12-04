<?php
/**
 * Created by PhpStorm.
 * User: wangguangyang
 * Date: 2018/3/28
 * Time: 14:52
 */

namespace App\Http\Controllers\Front;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;


/**
 * 质检管理视图控制器
 * @author  guangyang.wang
 */
class QCBasicSettingController extends Controller
{



//region 质量检验基础信息定义


    /**
     * 检验类别列表
     * @return   string   json
     * @author   guangyang.wang
     */
    public function typeSetting(Request  $request)
    {
        return view('qc_management.type_setting');
    }
//endregion


//region 缺失项定义


    /**
     * 缺失项列表
     * @return   string   json
     * @author   guangyang.wang
     */
    public function missingItems(Request  $request)
    {
        return view('qc_management.missingItems');
    }
//endregion
//region 生成模板


    /**
     * 模板创建
     * @return   string   json
     * @author   guangyang.wang
     */
    public function templateCreate(Request  $request)
    {
        return view('qc_management.templateCreate');
    }
//endregion
//region 检验项设置


    /**
     * 检验项列表
     * @return   string   json
     * @author   guangyang.wang
     */
    public function inspectObject(Request  $request)
    {
        return view('qc_management.inspectObject');
    }
//endregion




}


