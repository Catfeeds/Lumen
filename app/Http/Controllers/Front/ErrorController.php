<?php
/**
 * 报错提醒控制器
 * @author  sam.shan  <sam.shan@ruis-ims.cn>
 * @time    2018年01月16日08:42:58
 */

namespace App\Http\Controllers\Front;
use App\Http\Controllers\Controller;



class ErrorController extends Controller
{


    /**
     * 权限不够的时候
     * @return [type] [description]
     */
    public function stop()
    {
        return view('error.412');
    }

    /**
     * 访问不存在的路由的时候
     * @return [type] [description]
     */
    public function noPage()
    {
       return view('error.404');
    }


    /**
     * 过期
     * @return [type] [description]
     */
    public function expired()
    {
        return view('error.419');
    }


    /**
     * 请求过多
     * @return [type] [description]
     */
    public function tooMany()
    {
        return view('error.429');
    }



    /**
     * 服务器出错
     * @return [type] [description]
     */
    public function error()
    {
        return view('error.500');
    }


    /**
     * 服务器到达不了
     * @return [type] [description]
     */
    public function unavailable()
    {
        return view('error.503');
    }




















}