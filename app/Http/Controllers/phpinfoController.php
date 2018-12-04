<?php
/**
 * Created by PhpStorm.
 * User: Xiaoliang.Chen
 * Date: 2018/3/15
 * Time: 1:07
 */
namespace App\Http\Controllers;//定义命名空间
use Laravel\Lumen\Routing\Controller as BaseController;
use Symfony\Component\HttpFoundation\Request;//引入Lumen底层控制器

class phpinfoController extends Controller{
    public function info(){
        phpinfo();
//        return json_encode(session());
    }
}