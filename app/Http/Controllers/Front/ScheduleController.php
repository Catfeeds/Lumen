<?php
/**
 * Created by PhpStorm.
 * User: haoziye
 * Date: 2018/3/20
 * Time: 上午11:33
 */
namespace App\Http\Controllers\Front;

use App\Http\Controllers\Controller;

class ScheduleController extends Controller{

    public function __construct()
    {
        parent::__construct();
    }

    public function master(){
        return view('schedule.master');
    }

    public function detail(){
        return view('schedule.detail');
    }

    public function splitOrder(){
        return view('schedule.splitOrder');
    }
}