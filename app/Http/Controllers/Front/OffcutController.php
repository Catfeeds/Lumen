<?php
/**
 * Created by PhpStorm.
 * User: ruiyanchao
 * Date: 2018/3/6
 * Time: 下午2:47
 */
namespace App\Http\Controllers\Front;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
/**
 * 订单
 * @author  rick
 * @time    2018年02月06日08:46:25
 */
class OffcutController extends Controller
{

    /**
     * 边角料维护
     * @return   string   json
     * @author   guangyang.wang
     */
    public function pageIndex(Request $request)
    {
        return view('offcut.offcut');
    }
    /**
     * 称重维护
     * @return   string   json
     * @author   guangyang.wang
     */
    public function pageWeightIndex(Request $request)
    {
        return view('offcut.offcutWeight');
    }

    /**
     * 称重维护
     * @return   string   json
     * @author   guangyang.wang
     */
    public function offcutWeightShowAll(Request $request)
    {
        return view('offcut.offcutWeightShowAll');
    }

}