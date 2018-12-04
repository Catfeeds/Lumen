<?php


namespace App\Http\Controllers\Front;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;


/**
 * 物料清单管理视图控制器
 * @author  rick
 * @time    2018年01月10日14:41:31
 */
class BusteController extends Controller
{



    /**
     * 报工
     * @return   string   json
     * @author   rick
     */
    public function busteIndex(Request  $request)
    {
        return view('buste_management.busteIndex');
    }
    /**
     * 报工列表
     * @return   string   json
     * @author   rick
     */
    public function bustePageIndex(Request  $request)
    {
        return view('buste_management.bustePageIndex');
    }









}


