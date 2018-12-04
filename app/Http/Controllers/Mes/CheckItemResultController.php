<?php
/**
 * Created by PhpStorm.
 * User: wangguangyang
 * Date: 2018/2/9
 * Time: 14:13
 */
namespace App\Http\Controllers\Mes;

use App\Http\Models\QC\CheckItemResult;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class CheckItemResultController extends Controller
{
    public function __construct()
    {
        parent::__construct();
        if (empty($this->model)) $this->model = new CheckItemResult();
    }
//region 修
//修改检验项结果
    public function editCheckItemResult(Request $request)
    {
        //过滤,判断并提取所有的参数
        $input=$request->all();
        $qc_check_result=$this->model->edit($input);
        $response=get_api_response('200');
        $response['results']=$qc_check_result;
        return  response()->json($response);
    }
//endregion

//region 查
//查看检验项结果
    public function viewCheckItemResult(Request $request)
    {
        //过滤,判断并提取所有的参数
        $input=$request->all();
        $qc_check_result=$this->model->view($input['check_id']);
        $response=get_api_response('200');
        $response['results']=$qc_check_result;
        return  response()->json($response);
    }

//endregion

//region 删
//endregion


}