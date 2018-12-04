<?php
/**
 * Created by PhpStorm.
 * User: wangguangyang
 * Date: 2018/8/31
 * Time: 09:13
 */
namespace App\Http\Controllers\Front;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
/**
 * 委外模块
 * @author  guangyang.wang
 * @time    2018年08月31日09:30:31
 */
class OutsourceController extends Controller
{
    /**
     * 委外订单
     * @return \Illuminate\View\View
     */
    public function outsourceIndex()
    {
        return view('outsource.outsource_index');
    }
    /**
     * 委外订单
     * @return \Illuminate\View\View
     */
    public function outsourceOrderIndex()
    {
        return view('outsource.outsource_order_index');
    }
    /**
     * 委外订单给客户
     * @return \Illuminate\View\View
     */
    public function outsourceIndexForCustomer()
    {
        return view('outsource.outsource_index_customer');
    }
    /**
     * 委外订单
     * @return \Illuminate\View\View
     */
    public function viewOutsource()
    {
        return view('outsource.outsource_view');
    }
    /*
    /**
     * 委外领料单
     * @return \Illuminate\View\View
     */
    public function outsourcePickingIndex()
    {
        return view('outsource.outsourcePickingList');
    }
    /**
     * 委外订单报工
     * @return \Illuminate\View\View
     */
    public function busteOutsourceOrder()
    {
        return view('outsource.busteOutsource');
    }
    /**
     * 委外订单
     * @return \Illuminate\View\View
     */
    public function viewOutsourceOrder()
    {
        return view('outsource.outsource_order_view');
    }
    /**
     * 委外退补料
     * @return \Illuminate\View\View
     */
    public function createOutsource()
    {
        return view('outsource.createOutsource');
    }
    /**
     * 委外工单退补料
     * @return \Illuminate\View\View
     */
    public function createOutsourceOrder()
    {
        return view('outsource.createOutsourceOrder');
    }
    /**
     * 委外退补料
     * @return \Illuminate\View\View
     */
    public function editOutsource()
    {
        return view('outsource.editOutsource');
    }
    /**
     * 委外退补料
     * @return \Illuminate\View\View
     */
    public function sendOutsourceOrder()
    {
        return view('outsource.sendOutsourceOrder');
    }
    /**
     * 委外退补料
     * @return \Illuminate\View\View
     */
    public function editOutsourceOrder()
    {
        return view('outsource.createOutsourceOrderView');
    }
}