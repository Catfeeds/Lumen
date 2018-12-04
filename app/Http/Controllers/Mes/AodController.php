<?php
/**
 * Created by PhpStorm.
 * User: wangguangyang
 * Date: 2018/1/9
 * Time: 16:34
 */

namespace App\Http\Controllers\Mes;//定义命名空间
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Http\Models\QC\Aod;

class AodController extends Controller
{
    /**
     * 构造方法初始化操作类
     */
    public function __construct()
    {
        parent::__construct();
        if(empty($this->model)) $this->model=new Aod();
    }
//region  增

    public function insert(Request $request)
    {
        $input=$request->all();
        //trim过滤一下参数
        trim_strings($input);
        $obj_result=$this->model->insertAod($input);
        $response=get_api_response('200');
        $response['results']=$obj_result;
        return  response()->json($response);
    }

    public function commitAod(Request $request)
    {
        $input=$request->all();
        //trim过滤一下参数
        trim_strings($input);
        $obj_result=$this->model->commitAod($input);
        $response=get_api_response('200');
        $response['results']=$obj_result;
        return  response()->json($response);
    }

//endregion
//region  修

    public function update(Request $request)
    {
        $input=$request->all();
        //trim过滤一下参数
        trim_strings($input);
        $obj_result=$this->model->updateAod($input);
        $response=get_api_response('200');
        $response['results']=$obj_result;
        return  response()->json($response);
    }

    public function approval(Request $request)
    {
        $input=$request->all();
        //trim过滤一下参数
        trim_strings($input);
        $obj_result=$this->model->approval($input);
        $response=get_api_response('200');
        $response['results']=$obj_result;
        return  response()->json($response);
    }

//endregion
//region  查

//endregion
//region  删

//endregion

}