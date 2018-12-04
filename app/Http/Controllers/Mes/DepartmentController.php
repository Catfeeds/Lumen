<?php
/**
 * Created by PhpStorm.
 * User: ruiyanchao
 * Date: 2018/1/19
 * Time: 上午9:28
 */
namespace App\Http\Controllers\Mes;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Http\Models\Department;
use App\Libraries\Tree;

/**
 *BOM控制器
 *@author    rick
 */
class DepartmentController extends Controller
{


    public function __construct()
    {
        parent::__construct();
        if (empty($this->model)) $this->model = new Department();
    }

    //region 查
    /**
     * 检测唯一性
     * @param Request $request
     * @return string  返回json
     * @throws \App\Exceptions\ApiException
     * @author  rick
     */
    public  function unique(Request $request)
    {
        //获取参数并过滤
        $input=$request->all();
        trim_strings($input);
        $where=$this->getUniqueExistWhere($input);
        $input['has']=$this->model->isExisted($where);
        //拼接返回值
        $results=$this->getUniqueResponse($input);
        return  response()->json(get_success_api_response($results));
    }

    public function  show(Request $request)
    {

        //判断ID是否提交
        $id=$request->input($this->model->apiPrimaryKey);
        if(empty($id)|| !is_numeric($id)) TE('700',$this->model->apiPrimaryKey);
        //呼叫M层进行处理
        $results=$this->model->get($id);
        //成功返回前端
        return  response()->json(get_success_api_response($results));
    }

    /**
     * select列表
     * @return \Illuminate\Http\JsonResponse
     * @auth rick
     */
    public function  select()
    {
        //呼叫M层进行处理
        $obj_list=$this->model->select();
        return  response()->json(get_success_api_response($obj_list));
    }

    /**
     * 物料分类树形列表
     * @param Request $request
     * @return  string   返回json
     * @author  sam.shan  <san.shan@ruis-ims.cn>
     */
    public function  pageIndex()
    {
        //呼叫M层进行处理
        $obj_list=$this->model->getDepartmentList();
        return  response()->json(get_success_api_response($obj_list));
    }

    public function  treeIndex()
    {
        //呼叫M层进行处理
        $results=$this->model->select();
        return  response()->json(get_success_api_response($results));
    }

    public function getTreeByCompany(Request $request){
        $company_id = $request->input('company_id');
        if(empty($company_id)) TEA('700','company_id');
        $result = $this->model->getTreeByCompany($company_id);
        return response()->json(get_success_api_response($result));
    }

    /**
     * 获取下级
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function getNextLevelList(Request $request){
        $input = $request->all();
        $obj_list = $this->model->getNextLevelList($input);
        return response()->json(get_success_api_response($obj_list));
    }

    //endregion

    //region 增
    /**
     * 部门添加
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        //获取所有参数
        $input=$request->all();
        //呼叫M层进行处理
        $this->model->checkFormField($input);
        $insert_id=$this->model->add($input);
        //获取返回值
        $results=[$this->model->apiPrimaryKey=>$insert_id];
        return  response()->json(get_success_api_response($results));
    }
    //endregion

    //region 改
    public function update(Request $request)
    {
        //过滤,判断并提取所有的参数
        $input=$request->all();
        //id判断
        if(empty($input[$this->model->apiPrimaryKey]) || !is_numeric($input[$this->model->apiPrimaryKey])) TEA('700',$this->model->apiPrimaryKey);
        //集中营判断
        //呼叫M层进行处理
        $this->model->update($input);
        //返回前端结果
        $results=[$this->model->apiPrimaryKey=>$input[$this->model->apiPrimaryKey]];
        return  response()->json(get_success_api_response($results));
    }
    //endregion

    //region 删
    public function destroy(Request $request)
    {
        //判断ID是否提交
        $id = $request->input($this->model->apiPrimaryKey);
        if(empty($id) || !is_numeric($id)) TEA('700',$this->model->apiPrimaryKey);
        //呼叫M层进行处理
        $this->model->destroy($id);
        //获取返回值
        return  response()->json(get_success_api_response([$this->model->apiPrimaryKey=>$id]));
    }
    //endregion
}