<?php
/**
 * Created by PhpStorm.
 * User: wangguangyang
 * Date: 2017/12/27
 * Time: 15:46
 */

namespace App\Http\Controllers\Mes;//定义命名空间
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Http\Models\QC\QualityAbnormalityReport;
use App\Libraries\Tree;


class AbnormalController extends Controller
{
    /**
     * 构造方法初始化操作类
     */
    public function __construct()
    {
        parent::__construct();
        if(empty($this->model)) $this->model=new QualityAbnormalityReport();
    }
//region  增

    public function insert(Request $request)
    {
////        $file = $request->file('file')->isValid();
////        $file = $request->file->path();
//        $file = $request->file->extension();
//        pd($file);
        //过滤,判断并提取所有的参数
        $input = $request->all();
        //trim过滤一下参数
        trim_strings($input);
        $obj_result=$this->model->insertAbnormal($input);
        $response=get_api_response('200');
        $response['results']=$obj_result;
        return  response()->json($response);
    }

    public function tranmission(Request $request)
    {
        $input = $request->all();
        //trim过滤一下参数
        trim_strings($input);
        $obj_result=$this->model->tranmission($input);
        $response=get_api_response('200');
        $response['results']=$obj_result;
        return  response()->json($response);
    }

    public function adjudicate(Request $request)
    {
       $input = $request->all();
       //trim过滤一下参数
        trim_strings($input);
        $obj_result=$this->model->adjudicate($input);
        $response=get_api_response('200');
        $response['result']=$obj_result;
        return response()->json($response);
    }

//endregion

//region  修

    public function edit(Request $request)
    {
        //过滤,判断并提取所有的参数
        $input = $request->all();
        //trim过滤一下参数
        trim_strings($input);
        $obj_result=$this->model->editAbnormal($input);
        $response=get_api_response('200');
        $response['results']=$obj_result;
        return  response()->json($response);
    }

    public function inform(Request $request)
    {
        //过滤,判断并提取所有的参数
        $input = $request->all();
        //trim过滤一下参数
        trim_strings($input);
        $obj_result=$this->model->abnormalInform($input);
        $response=get_api_response('200');
        $response['results']=$obj_result;
        return  response()->json($response);
    }

    public function updateTransmission(Request $request)
    {
        $input = $request->all();
        //trim过滤一下参数
        trim_strings($input);
        $obj_result=$this->model->uptadeTranmission($input);
        $response=get_api_response('200');
        $response['results']=$obj_result;
        return  response()->json($response);
    }

    public function backTransmission(Request $request)
    {
        $input = $request->all();
        //trim过滤一下参数
        trim_strings($input);
        $obj_result=$this->model->backTranmission($input);
        $response=get_api_response('200');
        $response['results']=$obj_result;
        return  response()->json($response);
    }

    public function editAdjudicate(Request $request)
    {
        $input = $request->all();
        //trim过滤一下参数
        trim_strings($input);
        $obj_result=$this->model->editAdjudicate($input);
        $response=get_api_response('200');
        $response['result']=$obj_result;
        return response()->json($response);
    }
    public function audit(Request $request)
    {
        $input = $request->all();
        //trim过滤一下参数
        trim_strings($input);
        $obj_result=$this->model->audit($input);
        $response=get_api_response('200');
        $response['result']=$obj_result;
        return response()->json($response);
    }



//endregion

//region  查

    public function view(Request $request)
    {
        //过滤,判断并提取所有的参数
        $input = $request->all();
        //trim过滤一下参数
        trim_strings($input);
        $obj_result=$this->model->viewAbnormal($input);
        $response=get_api_response('200');
        $response['results']=$obj_result;
        return  response()->json($response);
    }
    public function viewAll(Request $request)
    {
        //过滤,判断并提取所有的参数
        $input = $request->all();
        //trim过滤一下参数
        trim_strings($input);
        $obj_list=$this->model->viewAbnormalALL($input);
        //获取返回值
        $paging=$this->getPagingResponse($input);
        return  response()->json(get_success_api_response($obj_list,$paging));
    }

    public function departmentList(Request $request)
    {
        //过滤,判断并提取所有的参数
        $input=$request->all();
        $qc_check_result=$this->model->departmentList($input);
        $tree_list=Tree::findDescendants($qc_check_result);

        $response=get_api_response('200');
        $response['results']=$tree_list;
        return  response()->json($response);
    }
    public function employeeList(Request $request)
    {
        //过滤,判断并提取所有的参数
        $input=$request->all();
        $qc_check_result=$this->model->employeeList($input);
        $response=get_api_response('200');
        $response['results']=$qc_check_result;
        return  response()->json($response);
    }
    public function sendEmployee(Request $request)
    {
        //过滤,判断并提取所有的参数
        $input=$request->all();
        $qc_check_result=$this->model->sendEmployee($input);
        $response=get_api_response('200');
        $response['results']=$qc_check_result;
        return  response()->json($response);
    }
    public function viewReportInfo(Request $request)
    {
        //过滤,判断并提取所有的参数
        $input=$request->all();
        $qc_check_result=$this->model->viewReportInfo($input);
        $response=get_api_response('200');
        $response['results']=$qc_check_result;
        return  response()->json($response);
    }

//endregion

//region  删
    public function delete(Request $request)
    {
        //过滤,判断并提取所有的参数
        $input = $request->all();
        //trim过滤一下参数
        trim_strings($input);
        $obj_list=$this->model->delete($input);
        //获取返回值
        return  response()->json(get_success_api_response($input['abnormal_id']));
    }
    public function deleteReportInfo(Request $request)
    {
        //过滤,判断并提取所有的参数
        $input = $request->all();
        //trim过滤一下参数
        trim_strings($input);
        $obj_list=$this->model->deleteReportInfo($input);
        //获取返回值
        return  response()->json(get_success_api_response(true));
    }

//endregion



}