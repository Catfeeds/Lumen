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
 * @author  guangyang.wange
 * @time    2018年02月06日08:46:25
 */
class WorkOrderController extends Controller
{
    /**
     * 列表
     * @return   string   json
     * @author   guangyang.wang
     */
    public function workOrderIndex(Request $request)
    {
        return view('work_order.index');
    }

    /**
     * 查看
     * @return   string   json
     * @author   guangyang.wang
     */
    public function workOrderView(Request $request)
    {
        return view('work_order.view');
    }
    /**
     * 生成领料单
     * @return   string   json
     * @author   guangyang.wang
     */
    public function createPickingList(Request $request)
    {
        return view('work_order.createPickingList');
    }
    /**
     * 生成领料单
     * @return   string   json
     * @author   guangyang.wang
     */
    public function createWorkshopPickingList(Request $request)
    {
        return view('work_order.createWorkshopPickingList');
    }
    /**
     * 生成领料单
     * @return   string   json
     * @author   guangyang.wang
     */
    public function viewPickingList(Request $request)
    {
        return view('work_order.viewPickingList');
    }
    /**
     * 生成领料单
     * @return   string   json
     * @author   guangyang.wang
     */
    public function viewWorkshopPickingList(Request $request)
    {
        return view('work_order.viewWorkShopPickingList');
    }
    /**
     * 生成领料单
     * @return   string   json
     * @author   guangyang.wang
     */
    public function workshopPickingList(Request $request)
    {
        return view('work_order.pickingWorkshopList');
    }
    /**
     * 生成领料单
     * @return   string   json
     * @author   guangyang.wang
     */
    public function pickingList(Request $request)
    {
        return view('work_order.pickingList');
    }
    /**
     * 生成领料单
     * @return   string   json
     * @author   guangyang.wang
     */
    public function specialCauseIndex(Request $request)
    {
        return view('work_order.special_cause');
    }

}