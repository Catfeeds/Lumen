<?php

namespace App\Http\Controllers\Procedure;//定义命名空间

use App\Http\Controllers\Controller;//引入基础控制器类
use App\Libraries\Soap;
use Illuminate\Http\Request;//获取请求参数
use App\Http\Models\Procedure;

/**
 * 工艺路线控制器
 * Class ProcedureController
 * @package App\Http\Controllers\Mes
 */
class ProcedureController extends Controller
{
    protected $model;

    public function __construct()
    {
        parent::__construct();
        if (empty($this->model)) $this->model = new Procedure();
    }

    /**
     * 显示所有工艺路线
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {

        $results = $this->model->index();
        //return response()->json($results);
        return response()->json(get_success_api_response($results));
    }

    /**
     * 显示某个工艺路线的详细信息
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function display(Request $request)
    {
        $input = $request->all();
        //检测字段
        $this->model->checkFields($input);
        $results = $this->model->display($input);
        return response()->json(get_success_api_response($results));
    }

    /**
     * 添加工艺路线基础信息;(base)
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function store(Request $request)
    {
        $input = $request->all();
        $results = $this->model->store($input);
        return response()->json(get_success_api_response($results));
    }

    /**
     * 修改工艺路线基础数据
     *
     * @param Request $request
     * @return array
     * @throws \App\Exceptions\ApiException
     */
    public function edit(Request $request)
    {
        $input = $request->all();
        $results = $this->model->edit($input);
        return get_success_api_response($results);
    }

    /**
     * 删除工艺路线
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function delete(Request $request)
    {
        $input = $request->all();
        //检测字段
        $this->model->checkFields($input);
        $results = $this->model->delete($input);
        return response()->json(get_success_api_response($results));
    }

    /**
     * 增加工艺路线详细信息(detail增加节点)
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function storeDetail(Request $request)
    {
        $input = $request->all();
        //检查详情
        $this->model->checkDetailFields($input);
        $results = $this->model->storeDetail($input);
        return response()->json(get_success_api_response($results));
    }

    /**
     * 删除工艺路线详细信息(删除一个节点)
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function deleteDetail(Request $request)
    {
        $input = $request->all();
//        $this->model->checkDetailFields($input);
        $results = $this->model->deleteDetail($input);
        return response()->json(get_success_api_response($results));
    }

    /**
     * 修改工艺路线工艺关联(修改节点)
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function updateDetail(Request $request)
    {
        $input = $request->all();
        $results = $this->model->updateDetail($input);
        return response()->json(get_success_api_response($results));
    }

    /**
     * 显示所有节点
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function showDetail(Request $request)
    {
        $input = $request->all();
        $results = $this->model->showDetail($input);
        return response()->json(get_success_api_response($results));
    }

    /**
     * 重新选节点
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function editDetail(Request $request)
    {
        $input = $request->all();
        $results = $this->model->editDetail($input);
        return response()->json(get_success_api_response($results));
    }

    /**
     * 判断工艺路线是否被bom使用
     *
     * @param Request $request
     * @return array
     * @throws \App\Exceptions\ApiException
     */
    public function hasUsed(Request $request)
    {
        $input = $request->all();
        $results = $this->model->hasUsed($input);
        return get_success_api_response($results);
    }

    /**
     * Mes 同步工艺路线 给 SAP
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     * @throws \App\Exceptions\ApiParamException
     * @author lester.you
     */
    public function syncToSap(Request $request)
    {
        $input = $request->all();
        if (empty($input['bom_id'])) TEA('700', 'bom_id');
        if (empty($input['routing_id'])) TEA('700', 'routing_id');
//        if(empty($input['factory_id'])) TEA('700', 'factory_id');

        $input['factory_id'] = $this->model->getFactoryID($input['bom_id'], $input['routing_id']);
        $data = $this->model->GetSyncRouteToSapData($input['bom_id'], $input['routing_id'], $input['factory_id']);
        $resp = Soap::doRequest($data['data'], 'INT_PP000300009', '0003');
        if ($resp['RETURNCODE'] != 0) {
            TEPA($resp['RETURNINFO']);
        }
        // 处理返回的数据
        if (empty($resp['PLNNR'])) TEPA('SAP返回参数（PLNNR）有误。');
        if (empty($resp['PLNAL'])) TEPA('SAP返回参数（PLNAL）有误。');
        $this->model->updateGroupNumberAndCount($resp['PLNNR'], $resp['PLNAL'], $data['bomNo'], $data['materialCode'], $input['routing_id'], $input['factory_id']);
        return response()->json(get_success_api_response($resp));
    }
}
