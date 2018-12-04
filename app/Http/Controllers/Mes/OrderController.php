<?php
/**
 * 半成品仓库管理订单控制器
 * Created by PhpStorm.
 * User: Xiaoliang.Chen
 * Date: 2017/9/27
 * Time: 14:13
 */

namespace App\Http\Controllers\Mes;


use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Http\Models\OrderModel;
class OrderController extends Controller
{
    //构建模型对象
    private static $orderModel;
    public function __construct()
    {
        if(!(self::$orderModel instanceof OrderModel)){
            self::$orderModel = new OrderModel();
        }
    }
    /*
     * 获取订单列表
     */
    public function index(Request $request){
          $page_num = $request->input('page') ? $request->input('page') :1;

          $result = self::$orderModel->getOrder($page_num);
          $result = array_merge($result,get_api_response('200'));
          return response()->json($result);
    }
    /*
     * 添加订单
     */
    public function store(Request $request){
       $input =  $request->all();
       $this->validate($request,[
           'number'=>'required',
       ]);

    }
    //订单入库
    public function in_storage(Request $request,$id){
        $input  = $request->all();

        self::$orderModel->In_storage($input,$id);
        return response()->json(get_api_response('200'));
    }
}