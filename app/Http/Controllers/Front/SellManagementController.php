<?php
/**
 * Created by PhpStorm.
 * User: haoziye
 * Date: 2018/3/31
 * Time: 上午9:38
 */

namespace App\Http\Controllers\Front;

use App\Http\Controllers\Controller;

class SellManagementController extends Controller{

    public function __construct()
    {
        parent::__construct();
    }

    public function customerDefine(){
        return view('sellManagement.customerDefine');
    }

    public function sellOrder(){
        return view('sellManagement.sellOrder');
    }

    public function sellOrderAdd(){
        return view('sellManagement.sellOrderAdd');
    }

    public function sellOrderUpdate(){
        return view('sellManagement.sellOrderUpdate');
    }

    public function sellOrderShow(){
        return view('sellManagement.sellOrderShow');
    }
}