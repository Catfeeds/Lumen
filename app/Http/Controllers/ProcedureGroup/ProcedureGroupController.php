<?php
/**
 * Created by PhpStorm.
 * User: zhufeng
 * Date: 2018/8/15
 * Time: 下午1:40
 */
namespace App\Http\Controllers\ProcedureGroup;
use App\Http\Controllers\Controller;
use App\Http\Models\ProcedureGroup\ProcedureGroup;
use Illuminate\Http\Request;

/**
 * 工艺路线组控制器
 * Class ProcedureGroupController
 * @package App\Http\Controllers\ProcedureGroup
 * @author Bruce.Chu
 */
class ProcedureGroupController extends Controller
{
    protected $model;

    public function __construct()
    {
        parent::__construct();
        if (empty($this->model)) $this->model = new ProcedureGroup();
    }

    /**
     * 增
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function add(Request $request)
    {
        //获取所有参数
        $input=$request->all();
        //呼叫M层进行处理
        $insert_id=$this->model->add($input);
        //获取返回值
        $results=[$this->model->apiPrimaryKey=>$insert_id];
        return  response()->json(get_success_api_response($results));
    }
    /**
     * 删
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function delete(Request $request)
    {
        //前端传递的工艺路线组表的主键id
        $delete_id=$request->input($this->model->apiPrimaryKey);
        //不为空 且必须为数字 否 参数丢失
        if(empty($delete_id) || !is_numeric($delete_id)) TEA('700',$this->model->apiPrimaryKey);
        //呼叫M层处理
        $this->model->delete($delete_id);
        return response()->json(get_success_api_response([$this->model->apiPrimaryKey=>$delete_id]));
    }

    /**
     * 改
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request)
    {
        //获取所有参数
        $input=$request->all();
        //呼叫M层进行处理
        $result=$this->model->update($input);
        //获取返回值
        return  response()->json(get_success_api_response([$this->model->apiPrimaryKey=>$result]));
    }
    /**
     * 工艺路线组列表
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function pageIndex(Request $request)
    {
        $input=$request->all();
        //分页参数过滤
        $this->checkPageParams($input);
        //获取数据
        $obj_list=$this->model->getProcedureGroupList($input);
        //获取分页返回值
        $paging=$this->getPagingResponse($input);
        return  response()->json(get_success_api_response($obj_list,$paging));
    }

    /**
     * 查看所有工艺路线组即下属的工艺路线
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(Request $request)
    {
        $input=$request->all();
        //参数过滤
        if(!isset($input['material_code'])) TEA('700','material_code');
        if(!isset($input['bom_no'])) TEA('700','bom_no');
        //联系M层处理
        $results= $this->model->show($input);
        return  response()->json(get_success_api_response($results));
    }

    /**
     * 查看单条记录
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function view(Request $request)
    {
        $view_id=$request->input($this->model->apiPrimaryKey);
        //不为空 且必须为数字 否 参数丢失
        if(empty($view_id) || !is_numeric($view_id)) TEA('700',$this->model->apiPrimaryKey);
        $result=$this->model->view($view_id);
        return  response()->json(get_success_api_response($result));
    }

    /**
     * 唯一性检测
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
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
     * 更新组时验证工艺路线是否被其他组占用
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function groupIsUsed(Request $request)
    {
        //获取参数 工艺路线组id 工艺路线id集合必传
        $procedure_group_id=$request->input($this->model->apiPrimaryKey);
        if(empty($procedure_group_id) || !is_numeric($procedure_group_id)) TEA('700',$this->model->apiPrimaryKey);
        $procedure_route_ids=$request->input('procedure_route');
        if(empty($procedure_route_ids)) TEA('700','procedure_route');
        //联系M层处理
        $results=$this->model->groupIsUsed($procedure_group_id,$procedure_route_ids);
        return  response()->json(get_success_api_response($results));
    }

    /**
     * 添加组时验证工艺路线是否被占用
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function groupIsEmpty(Request $request)
    {
        //获取参数 工艺路线id集合必传
        $procedure_route_ids=$request->input('procedure_route');
        if(empty($procedure_route_ids)) TEA('700','procedure_route');
        //联系M层处理
        $results=$this->model->groupIsEmpty($procedure_route_ids);
        return  response()->json(get_success_api_response($results));
    }

    /**
     * 不同场景展示工艺路线
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getProcedureRoute(Request $request)
    {
        $input=$request->all();
        //联系M层处理
        $results=$this->model->getProcedureRoute($input);
        return  response()->json(get_success_api_response($results));
    }

    /**
     * 校验厂是否与bom的工艺路线关联
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function factoryIsUsed(Request $request)
    {
        //获取参数 工厂id 工艺路线id集合必传
        $factory_id=$request->input('factory_id');
        if(empty($factory_id) || !is_numeric($factory_id)) TEA('700','factory_id');
        $procedure_route_ids=$request->input('procedure_route');
        if(empty($procedure_route_ids)) TEA('700','procedure_route');
        //联系M层处理
        $this->model->factoryIsUsed($factory_id,$procedure_route_ids);
        return  response()->json(get_success_api_response());
    }
}