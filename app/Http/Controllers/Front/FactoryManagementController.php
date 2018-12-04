<?php
/**
 * Created by PhpStorm.
 * User: haoziye
 * Date: 2018/2/6
 * Time: 下午6:04
 */
namespace App\Http\Controllers\Front;

use App\Http\Controllers\Controller;

class FactoryManagementController extends Controller{

    public function companyIndex(){
        return view('factory_management.companyIndex');
    }

    public function factoryDefine(){
        return view('factory_management.factoryDefine');
    }

    public function rankPlanDefine(){
        return view('factory_management.rankPlanDefine');
    }

    public function rankPlanManage(){
        return view('factory_management.rankPlanManage');
    }

    public function rankPlanType(){
        return view('factory_management.rankPlanType');
    }
}

