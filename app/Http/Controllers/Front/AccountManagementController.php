<?php
/**
 * 后台账户管理控制器
 * @author  sam.shan  <sam.shan@ruis-ims.cn>
 * @time    2018年01月11日15:35:05
 */

namespace App\Http\Controllers\Front;
use App\Http\Controllers\Controller;



class AccountManagementController extends Controller
{

//region  菜单配置
    /**
     * 菜单列表
     * @return   string   json
     * @author   sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function menuIndex()
    {
        return view('account_management.menu_index');
    }


//endregion


//region  权限节点
    /**
     * 权限节点列表
     * @return   string   json
     * @author   sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function nodeIndex()
    {
        return view('account_management.node_index');
    }


//endregion

//region  角色
    /**
     * 角色列表
     * @return   string   json
     * @author   sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function roleIndex()
    {
        return view('account_management.role_index');
    }
//endregion



//region  管理员
    /**
     * 管理员列表
     * @return   string   json
     * @author   sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function adminIndex()
    {
        return view('account_management.admin_index');
    }

    /**
     * 登陆界面
     * 注意: 登陆失败后是否要重置验证码呢?不需要,因为我们可以将获取的验证码设置有效期
     * @author  sam.shan   <sam.shan@ruis-ims.cn>
     */
    public function adminLogin()
    {
        //如果已经登陆,则不允许再次登陆,比如 当前用户1登陆了,然后1没有退出就允许2登陆的话,则1的用户环境将被替换为2的,那我们还不如直接不允许了
        if (!empty(session('administrator')->admin_id))   return redirect('/');
        return view('account_management.admin_login');
    }

    /**
     * 退出登陆
     * @author  sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function adminLogout()
    {
        session()->flush();
        return redirect(('AccountManagement/login'));
    }

//endregion


//region 登陆日志列表

    /**
     * 登陆日志列表
     * @return   string   json
     * @author   sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function logIndex()
    {

        return view('account_management.log_index');
    }



//endregion














}