<?php
/**
 * Created by PhpStorm.
 * User: wangguangyang
 * Date: 2018/3/23
 * Time: 15:50
 */


namespace App\Http\Controllers\Mes;

use App\Http\Models\QC\Question;
use App\Libraries\Tree;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
class QuestionSettingController extends Controller
{
    public function __construct()
    {
        parent::__construct();
        if (empty($this->model)) $this->model = new Question();
    }

//region 增
    public function addItems(Request $request)
    {
        //过滤,判断并提取所有的参数
        $input=$request->all();
        $qc_check_result=$this->model->addItems($input);
        $response=get_api_response('200');
        $response['results']=$qc_check_result;
        return  response()->json($response);
    }
//endregion
//region 修

    public function updateItems(Request $request)
    {
        //过滤,判断并提取所有的参数
        $input=$request->all();
        $qc_check_result=$this->model->updateItems($input);
        $response=get_api_response('200');
        $response['results']=$qc_check_result;
        return  response()->json($response);
    }

//endregion
//region 查

    public function viewItems(Request $request)
    {
        //过滤,判断并提取所有的参数
        $input=$request->all();
        $qc_check_result=$this->model->viewItems($input);
        $response=get_api_response('200');
        $response['results']=$qc_check_result;
        return  response()->json($response);
    }

    public function viewItemsList(Request $request)
    {
        //过滤,判断并提取所有的参数
        $input=$request->all();
        $qc_check_result=$this->model->viewItemsList($input);
        $tree_list=Tree::findDescendants($qc_check_result);

        $response=get_api_response('200');
        $response['results']=$tree_list;
        return  response()->json($response);
    }

//endregion
//region 删
    public function deleteItems(Request $request)
    {
        //过滤,判断并提取所有的参数
        $input=$request->all();
        $qc_check_result=$this->model->deleteItems($input);
        $response=get_api_response('200');
        $response['results']=$qc_check_result;
        return  response()->json($response);
    }

//endregion

}
