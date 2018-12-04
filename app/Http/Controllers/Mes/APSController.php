<?php
/**
 * Created by PhpStorm.
 * User: ruiyanchao
 * Date: 2018/2/9
 * Time: 下午3:10
 */

namespace App\Http\Controllers\Mes;

use App\Libraries\Trace;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Http\Models\APS;


/**
 *生产订单管理
 *@author    rick
 */
class APSController extends Controller
{


    public function __construct()
    {
        parent::__construct();
        if (empty($this->model)) $this->model = new APS();
    }

    public function getProductOrder(Request $request)
    {
        $input=$request->all();
        //trim过滤一下参数
        trim_strings($input);
        //获取数据
        $obj_list=$this->model->getProductOrder($input);
        //获取返回值
        $paging=$this->getPagingResponse($input);

        return  response()->json(get_success_api_response($obj_list,$paging));
    }

    public function getProductOrderInfo(Request $request)
    {
        $input=$request->all();
        //trim过滤一下参数
        trim_strings($input);
        //获取数据
        $obj_list=$this->model->getProductOrderInfo($input);
        //获取返回值
        $paging=$this->getPagingResponse($input);

        return  response()->json(get_success_api_response($obj_list,$paging));
    }

    public function getWorkTask(Request $request)
    {
        $input=$request->all();
        //trim过滤一下参数
        trim_strings($input);
        //获取数据
        $obj_list=$this->model->getWorkTask($input);
        //获取返回值
        $paging=$this->getPagingResponse($input);

        return  response()->json(get_success_api_response($obj_list,$paging));
    }

    public function getWorkOrder(Request $request)
    {
        $input=$request->all();
        //trim过滤一下参数
        trim_strings($input);
        //获取数据
        $obj_list=$this->model->getWorkOrder($input);
        //获取返回值
        $paging=$this->getPagingResponse($input);

        return  response()->json(get_success_api_response($obj_list,$paging));
    }

    public function simplePlan(Request $request)
    {
        $input=$request->all();
        //trim过滤一下参数
        trim_strings($input);
        //获取数据
        $this->model->simplePlan($input);
        //获取返回值
        return  response()->json(get_success_api_response(['ids'=>$input['ids']]));
    }
    public function carefulPlan(Request $request)
    {
        $input=$request->all();
        //trim过滤一下参数
        trim_strings($input);
        //获取数据
        $this->model->carefulPlan($input);
        //获取返回值
        return  response()->json(get_success_api_response(['ids'=>$input['ids']]));
    }

    public function destroy(Request $request)
    {
        $input=$request->all();
        //trim过滤一下参数
        trim_strings($input);
        //获取数据
        $this->model->destroy($input);
        //获取返回值
        return  response()->json(get_success_api_response(['id'=>$input['id']]));
    }

    public function splitWorkOrder(Request $request)
    {
        $input=$request->all();
        //trim过滤一下参数
        trim_strings($input);
        //获取数据
        $this->model->splitWorkOrder($input);
        //获取返回值
        return  response()->json(get_success_api_response(['id'=>$input['id']]));
    }

    public function getCapacity(Request $request)
    {
        $input=$request->all();
        //trim过滤一下参数
        trim_strings($input);
        //获取数据
        $result = $this->model->getCapacity($input);
        //获取返回值
        return  response()->json(get_success_api_response($result));
    }

    public function getCarefulPlan(Request $request)
    {
        $input=$request->all();
        //trim过滤一下参数
        trim_strings($input);
        //获取数据
        $result = $this->model->getCarefulPlan($input);
        //获取返回值
        return  response()->json(get_success_api_response($result));
    }

    /**
     * 检查是否能排产
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function checkCanPlan(Request $request){
        $input = $request->all();
        trim_strings($input);
        if(empty($input['ids']) || !is_json($input['ids'])) TEA('700','ids');
        if(empty($input['workshop_id']) || !is_numeric($input['workshop_id'])) TEA('700','workshop_id');
        if(empty($input['workcenter_operation_to_ability_id']) || !is_numeric($input['workcenter_operation_to_ability_id'])) TEA('700','workcenter_operation_to_ability_id');
        if(!isset($input['week_date']) || !is_numeric($input['week_date']) || !in_array($input['week_date'],[0,1,2,3,4,5,6])) TEA('700','week_date');
        if(empty($input['all_select_abilitys']) || !is_json($input['all_select_abilitys'])) TEA('700','all_select_abilitys');
        $res = $this->model->checkCanPlan($input);
        return response()->json(get_success_api_response($res));
    }

    /**
     * 拉出生产该PO的工作中心相关信息+产能计算
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @author Bruce.Chu
     */
    public function getWorkCenterInfo(Request $request)
    {
        $input = $request->all();
        //参数过滤
        if(empty($input['production_order_id']) || !is_numeric($input['production_order_id'])) TEA('700','production_order_id');
        if(empty($input['start_date'])) TEA('700','start_date');
        if(empty($input['end_date'])) TEA('700','end_date');
        //联系M层处理
        $results = $this->model->getWorkCenterInfo($input);
        return response()->json(get_success_api_response($results));
    }

    /**
     * 查询所有的工作中心
     * @return \Illuminate\Http\JsonResponse
     * @author Bruce.Chu
     */
    public function showAllWorkCenters()
    {
        //联系M层处理
        $results = $this->model->showAllWorkCenters();
        return response()->json(get_success_api_response($results));
    }

    /**
     * 查询指定工作中心绑定的排班
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @author Bruce.Chu
     */
    public function showWorkCenterRankPlan(Request $request)
    {
        $input = $request->all();
        //参数过滤
        if(empty($input['work_center_id']) || !is_numeric($input['work_center_id'])) TEA('700','work_center_id');
        if(empty($input['work_station_time'])) TEA('700','work_station_time');
        //联系M层处理
        $results = $this->model->showWorkCenterRankPlan($input);
        return response()->json(get_success_api_response($results));
    }

    /**
     * 格式化指定日期的所有工单
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @author Bruce.Chu
     */
    public function getWorkOrdersByDate(Request $request)
    {
        $input = $request->all();
        //参数过滤
        if(empty($input['work_station_time'])) TEA('700','work_station_time');
        //联系M层处理
        $results = $this->model->getWorkOrdersByDate($input);
        return response()->json(get_success_api_response($results));
    }

    /**
     * 检查是否能按时间段排产
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     * kevin
     */
    public function checkCanPlanByPeriod(Request $request){
        $input = $request->all();
        trim_strings($input);
        if(empty($input['workshop_id']) || !is_numeric($input['workshop_id'])) TEA('700','workshop_id');
        if(empty($input['workcenter_operation_to_ability_id']) || !is_numeric($input['workcenter_operation_to_ability_id'])) TEA('700','workcenter_operation_to_ability_id');
        //if(!isset($input['week_date']) || !is_numeric($input['week_date']) || !in_array($input['week_date'],[0,1,2,3,4,5,6])) TEA('700','week_date');
        if(empty($input['all_select_abilitys']) || !is_json($input['all_select_abilitys'])) TEA('700','all_select_abilitys');
        $res = $this->model->checkCanPlanByPeriod($input);
        return response()->json(get_success_api_response($res));
    }

    public function simplePlanByPeriod(Request $request)
    {
        $input=$request->all();
        //trim过滤一下参数
        trim_strings($input);
        //获取数据
        $this->model->simplePlanByPeriod($input);
        //获取返回值
        return  response()->json(get_success_api_response(['ids'=>$input['ids']]));
    }

}
