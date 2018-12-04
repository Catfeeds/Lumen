<?php
/**
 * Created by PhpStorm.
 * User: wangguangyang
 * Date: 2018/2/7
 * Time: 09:02
 */

namespace App\Http\Controllers\Mes;

use App\Http\Models\QC\Setting;
use App\Http\Models\QC\CheckType;
use App\Libraries\Tree;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

/**
 *检验设置控制器
 *@author  guangyang.wang
 */

class SettingController extends Controller
{
    protected $checkType;
    public function __construct()
    {
        parent::__construct();
        if (empty($this->model)) $this->model = new Setting();
        if (empty($this->checkType)) $this->checkType = new CheckType();
    }



//region 增
    public function addCheckItem(Request $request)
    {
        //过滤,判断并提取所有的参数
        $input=$request->all();
        $this->model->checkItemList($input);
        $obj_list=$this->model->addCheckItem($input);
        $response=get_api_response('200');
        $response['results']=$obj_list;
        return  response()->json($response);
    }

    public function addTpye(Request $request)
    {
        //过滤,判断并提取所有的参数
        $input=$request->all();
        $qc_check_type=$this->checkType->add($input);
        $response=get_api_response('200');
        $response['results']=$qc_check_type;
        return  response()->json($response);
    }
//endregion

//region 修
    public function editTpye(Request $request)
    {
        //过滤,判断并提取所有的参数
        $input=$request->all();
        $qc_check_type=$this->checkType->edit($input);
        $response=get_api_response('200');
        $response['results']=$qc_check_type;
        return  response()->json($response);
    }
//endregion

//region 查
    public function typeSelect()
    {
        $qc_check_type=$this->checkType->select();//查询ruis_check_type表
        $tree_list=Tree::findDescendants($qc_check_type);

        $response=get_api_response('200');
        $response['results']=$tree_list;
        return  response()->json($response);
    }
    public function templateList(Request $request)
    {
        //过滤,判断并提取所有的参数
        $input=$request->all();
        $qc_check_type=$this->checkType->templateList($input);//查询ruis_check_type表
//        $tree_list=Tree::findDescendants($qc_check_type);

        $response=get_api_response('200');
        $response['results']=$qc_check_type;
        return  response()->json($response);
    }

    public function viewTpye(Request $request)
    {
        //过滤,判断并提取所有的参数
        $input=$request->all();
        $qc_check_type=$this->checkType->viewType($input);
        $response=get_api_response('200');
        $response['results']=$qc_check_type;
        return  response()->json($response);
    }


    //检验
    public function getCheckItemsByType(Request $request)
    {
        //过滤,判断并提取所有的参数
        $input=$request->all();
        $qc_check_type=$this->model->getCheckItemsByType($input);
        $qc_check_type['template']=Tree::findDescendants($qc_check_type['template']);
        $response=get_api_response('200');
        $response['results']=$qc_check_type;
        return  response()->json($response);
    }


    
    public function getItemsByType(Request $request)
    {
        //过滤,判断并提取所有的参数
        $input=$request->all();
        $qc_check_type=$this->model->getItemsByType($input);
        $qc_check_type=Tree::findDescendants($qc_check_type);
        $response=get_api_response('200');
        $response['results']=$qc_check_type;
        return  response()->json($response);
    }
//endregion

//region 删
    public function deleteCheckItem(Request $request)
    {
        //过滤,判断并提取所有的参数
        $input=$request->all();
        $obj_list=$this->model->deleteCheckItem($input);
        $response=get_api_response('200');
        $response['results']=$obj_list;
        return  response()->json($response);
    }

    public function deleteTpye(Request $request)
    {
        //过滤,判断并提取所有的参数
        $input=$request->all();
        $qc_check_type=$this->checkType->deleteType($input);
        $response=get_api_response('200');
        $response['results']=$qc_check_type;
        return  response()->json($response);
    }
//endregion
}