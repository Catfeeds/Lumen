<?php
/**
 * 后台首页控制器
 * @author  sam.shan  <sam.shan@ruis-ims.cn>
 * @time    2018年01月08日14:07:37
 */

namespace App\Http\Controllers\Front;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cookie;


class IndexController extends Controller
{

    public function __construct()
    {
        parent::__construct();
    }


    public function index()
    {
        return view('index.index');

    }














}