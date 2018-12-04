<?php
namespace App\Http\Controllers\Proce;//定义命名空间
use App\Http\Controllers\Controller;//引入基础控制器类
use Illuminate\Http\Request;//获取请求参数
use App\Http\Models\Proce\Proce;



//存储过程控制器
class ProceController extends Controller
{
    protected $model;

    public function __construct()
    {
        parent::__construct();
        if (empty($this->model)) $this->model = new Proce();
    }


    /**
     * P_ERPTOMESBOM
     */
    public function getBom(Request $request)
    {
        //获取参数并过滤
        $input=$request->all();
        trim_strings($input);
        //呼叫M层进行处理
        $response=get_api_response('200');
        $obj_list=$this->model->getBom($input);
        $response['results']= $obj_list; 
        return  response()->json($response);
    }


    /**
     * ERPTOMESBOM
     */
    public function getInv(Request $request)
    {
        //获取参数并过滤
        $input=$request->all();
        trim_strings($input);
        //呼叫M层进行处理
        $response=get_api_response('200');
        $obj_list=$this->model->getInv($input);
        $response['results']= $obj_list; 
        return  response()->json($response);
    }


    /**
     * ERPTOMESBOM
     */
    public function getOrder(Request $request)
    {
        header("Access-Control-Allow-Origin: *");
        //获取参数并过滤
        $input=$request->all();
        trim_strings($input);
        //呼叫M层进行处理
        $response=get_api_response('200');
        $obj_list=$this->model->getOrder($input);
        $response['results']= $obj_list; 
        return  response()->json($response);
    }


    /**
     * ERPTOMESBOM
     */
    public function getBomTree(Request $request)
    {
        //获取参数并过滤
        $input=$request->all();
        trim_strings($input);
        //呼叫M层进行处理
        $response=get_api_response('200');
        $obj_list=$this->model->getBomTree($input);
        $response['results']= $obj_list; 
        return  response()->json($response);
    }



    /**
     * ERPTOMESBOM
     */
    public function getOrderStatus(Request $request)
    {
        //获取参数并过滤
        $input=$request->all();
        trim_strings($input);
        //呼叫M层进行处理
        $response=get_api_response('200');
        $obj_list=$this->model->getOrderStatus($input);
        $response['results']= $obj_list; 
        return  response()->json($response);
    }


    /**
     * liming 用来测试 db
     */
    public function showEnterPriseOrder(Request $request)
    {
        header("Access-Control-Allow-Origin: *");
        //过滤,判断并提取所有的参数
        $input=$request->all();
        $obj_list=$this->model->showEnterPriseOrder($input);
        $response=get_api_response('200');
        $response['results']=$obj_list;
        return  response()->json($response);
    }



    /**
     * liming 用来测试 db
     */
    public function limingtest(Request $request)
    {
        header("Access-Control-Allow-Origin: *");
        //过滤,判断并提取所有的参数
        $input=$request->all();
        $obj_list=$this->model->getDepotsList($input);
        $response=get_api_response('200');
        $response['results']=$obj_list;
        return  response()->json($response);
    }



}
