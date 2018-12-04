<?php
/**
 * Created by PhpStorm.
 * User: wangguangyang
 * Date: 2018/11/26
 * Time: 11:12
 */

namespace App\Http\Controllers\Front;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
/**
 * 往来用户伙伴模块
 * @author  guangyang.wang
 * @time    2018年11月23日09:30:31
 */
class PartnerController extends Controller
{
    /**
     * 往来用户伙伴列表
     * @return \Illuminate\View\View
     */
    public function pageIndex()
    {
        return view('partner.index');
    }
}