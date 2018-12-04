<?php
namespace App\Http\Controllers\Mes;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Http\Models\EmployeePosition;

/**
 *BOM控制器
 *@author    rick
 */
class EmployeePositionController extends Controller
{


    public function __construct()
    {
        parent::__construct();
        if (empty($this->model)) $this->model = new EmployeePosition();
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


    /**
     * 岗位列表
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function pageIndex(Request $request)
    {
        $input=$request->all();
        //trim过滤一下参数
        trim_strings($input);
        //分页参数判断
        $this->checkPageParams($input);
        //获取数据
        $obj_list=$this->model->getEmployeePositionList($input);
        //获取返回值
        $paging=$this->getPagingResponse($input);
        return  response()->json(get_success_api_response($obj_list,$paging));
    }

    /**
     * 查看物料基础信息
     * @param  \Illuminate\Http\Request  $request  Request实例
     * @return  \Illuminate\Http\JsonResponse     返回json格式
     * @author  rick
     */
    public function show(Request $request)
    {
        //判断ID是否提交
        $id = $request->input($this->model->apiPrimaryKey);
        if(empty($id) || !is_numeric($id)) TEA('700',$this->model->apiPrimaryKey);
        //呼叫M层进行处理
        $results= $this->model->get($id);
        return  response()->json(get_success_api_response($results));
    }

    /**
     * 查看职位关联的功能
     * @param Request $request
     */
    public function getPositionRole(Request $request){
        $position_id = $request->input('position_id');
        if(empty($position_id)) TEA('700','position_id');
        $obj_list = $this->model->getPositionRole($position_id);
        return response()->json(get_success_api_response($obj_list));
    }
    //endregion

    //region 增

    /**
     * 岗位添加
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        //获取所有参数
        $input=$request->all();
        //呼叫M层进行处理
        $insert_id=$this->model->add($input);
        //获取返回值
        $results=['employee_position_id'=>$insert_id];
        return  response()->json(get_success_api_response($results));
    }
    //endregion

    //region 改
    /**
     * 岗位更新
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request)
    {
        //获取所有参数
        $input=$request->all();
        //呼叫M层进行处理
        $this->model->update($input);
        //获取返回值
        return  response()->json(get_success_api_response([$this->model->apiPrimaryKey=>$input[$this->model->apiPrimaryKey]]));
    }

    /**
     * 更新职位关联的角色（功能集合）
     * @param Request $request
     */
    public function positionToRole(Request $request){
        $input = $request->all();
        trim_strings($input);
        if(empty($input['position_id'])) TEA('700','position_id');
        if(empty($input['role_ids'])) TEA('700','role_ids');
        $this->model->positionToRole($input);
        return response()->json(get_success_api_response(200));
    }

    //endregion

    //region 删

    /**
     * 岗位删除
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
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