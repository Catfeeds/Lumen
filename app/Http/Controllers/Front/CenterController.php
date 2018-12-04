<?php
/**
 * 个人中心控制器
 * @author  sam.shan  <sam.shan@ruis-ims.cn>
 * @time    2018年01月23日17:07:31
 */

namespace App\Http\Controllers\Front;
use App\Http\Controllers\Controller;



class CenterController extends Controller
{




/*
 * 账户设置
 */
public function  setting()
{

    return view('center_management.setting');

}

/*
 * 消息
 */
public function  msg()
{

    return view('center_management.msg');

}

/*
 * 登陆日志
 */
public function  loginLog()
{

    return view('center_management.login_log');

}















}