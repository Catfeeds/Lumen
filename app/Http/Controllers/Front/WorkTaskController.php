<?php
/**
 * Created by PhpStorm.
 * User: ruiyanchao
 * Date: 2018/2/8
 * Time: 下午2:53
 */

namespace App\Http\Controllers\Front;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
/**
 * 订单
 * @author  rick
 * @time    2018年02月06日08:46:25
 */
class WorkTaskController extends Controller
{
    /**
     * 列表
     * @return   string   json
     * @author   rick
     */
    public function workTaskIndex(Request $request)
    {
        return view('work_task.index');
    }

    /**
     * 查看
     * @return   string   json
     * @author   rick
     */
    public function workTaskView(Request $request)
    {
        return view('work_task.view');
    }
}