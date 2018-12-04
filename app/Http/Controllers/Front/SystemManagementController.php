<?php
/**
 * 系统管理控制器
 * @author  sam.shan  <sam.shan@ruis-ims.cn>
 * @time    2018年01月30日10:55:49
 */

namespace App\Http\Controllers\Front;
use App\Http\Controllers\Controller;



class SystemManagementController extends Controller
{

//region  系统消息
    /**
     * 系统消息
     * @return   string   json
     * @author   sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function msg()
    {
        return view('system_management.msg');
    }


//endregion
//region  系统配置
    /**
     * 系统配置
     * @return   string   json
     * @author   sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function config()
    {
        return view('system_management.config');
    }
//endregion















}