<?php
/**
 * Created by PhpStorm.
 * User: haoziye
 * Date: 2018/5/11
 * Time: 上午9:23
 */
namespace App\Http\Controllers\Practice;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Http\Models\PracticeCategory;

class PracticeCategoryController extends Controller{

    public function __construct()
    {
        parent::__construct();
        if(empty($this->model)) $this->model = new PracticeCategory();
    }


//region 检

    /**
     * 检测唯一性
     */
    public function unique(Request $request){
        //获取参数并过滤
        $input=$request->all();
        trim_strings($input);
        $where=$this->getUniqueExistWhere($input);
        $input['has']=$this->model->isExisted($where);
        //拼接返回值
        $results=$this->getUniqueResponse($input);
        return  response()->json(get_success_api_response($results));
    }

//endregion

//region 增

    /**
     * 添加做法分类
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request){
        $input = $request->all();
        trim_strings($input);
        $this->model->checkFormField($input);
        $res = $this->model->store($input);
        return response()->json(get_success_api_response($res));
    }

//endregion

//region 查

    /**
     * 查询树结构
     * @return \Illuminate\Http\JsonResponse
     */
    public function select(){
        $obj_list = $this->model->select();
        return response()->json(get_success_api_response($obj_list));
    }

    /**
     * 详情
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function show(Request $request){
        $id = $request->input($this->model->apiPrimaryKey);
        if(empty($id) || !is_numeric($id)) TEA('700',$this->model->apiPrimaryKey);
        $obj = $this->model->show($id);
        return response()->json(get_success_api_response($obj));
    }

//endregion

//region 修

    /**
     * 修改分类
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function update(Request $request){
        $input = $request->all();
        trim_strings($input);
        $this->model->checkFormField($input);
        $this->model->update($input);
        return response()->json(get_success_api_response(200));
    }

//endregion

//region 删

    /**
     * 删除分类
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function delete(Request $request){
        $id = $request->input($this->model->apiPrimaryKey);
        if(empty($id) || !is_numeric($id)) TEA('700',$this->model->apiPrimaryKey);
        $this->model->delete($id);
        return response()->json(get_success_api_response(200));
    }

//endregion
}