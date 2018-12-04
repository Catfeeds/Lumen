<?php
/**
 * Created by PhpStorm.
 * User: haoziye
 * Date: 2018/4/13
 * Time: 下午1:50
 */
namespace App\Http\Controllers\Mes;
use App\Http\Controllers\Controller;
use App\Http\Models\BomRouting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BomRoutingController extends Controller{

    public function __construct()
    {
        parent::__construct();
        if(empty($this->model)) $this->model = new BomRouting();
    }

//region 增

    /**
     * 添加流转品
     * @param Request $request
     */
    public function storeLZP(Request $request){
        $input = $request->all();
        trim_strings($input);
        $this->model->checkLZPFormField($input);
        $res = $this->model->storeLZP($input);
        return response()->json(get_success_api_response($res));
    }

//endregion

//region 查

    /**
     * 获取工时那儿需要维护的基本数量
     * 暂时挂靠在工序节点控制码中，但是不能在这控制码这儿做更新，会导致错误
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function getBomRoutingBaseQty(Request $request){
        $input = $request->all();
        trim_strings($input);
        $obj_list = $this->model->getBomRoutingBaseQty($input);
        return response()->json(get_success_api_response($obj_list));
    }

    /**
     * 获取bom工艺路线信息
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function getBomRouting(Request $request){
        $bom_id = $request->input('bom_id');
        if(empty($bom_id)) TEA('700','bom_id');
        $routing_id = $request->input('routing_id');
        if(empty($routing_id)) TEA('700','routing_id');
        $obj_list = $this->model->getBomRouting($bom_id,$routing_id);
        return response()->json(get_success_api_response($obj_list));
    }

    /**
     * 获取bom工艺路线集合
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function getBomRoutings(Request $request){
        $bom_id = $request->input('bom_id');
        if(empty($bom_id) || !is_numeric($bom_id)) TEA('700','bom_id');
        $obj_list = $this->model->getBomRoutings($bom_id);
        return response()->json(get_success_api_response($obj_list));
    }

    /**
     * 获取bom工艺路线预览的数据
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function getPreviewData(Request $request){
        $bom_id = $request->input('bom_id');
        if(empty($bom_id)) TEA('700','bom_id');
        $routing_id = $request->input('routing_id');
        if(empty($routing_id)) TEA('700','routing_id');
        $routing_node_id = $request->input('routing_node_id');
        if(empty($routing_node_id)) TEA('700','routing_node_id');
        $obj_list = $this->model->getPreviewData($bom_id,$routing_id,$routing_node_id);
        return response()->json(get_success_api_response($obj_list));
    }

    /**
     * 获取包含需要复制的工序节点的bom
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function getNeedCopyBomList(Request $request){
        $input = $request->all();
        trim_strings($input);
        if(empty($input['operation_id'])) TEA('700','operation_id');
        $this->checkPageParams($input);
        $obj_list = $this->model->getNeedCopyBomList($input);
        $paging = $this->getPagingResponse($input);
        return response()->json(get_success_api_response($obj_list,$paging));
    }

    /**
     * 获取bom工艺路线节点要复制的数据
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function getNeedCopyBomRoutingNodeInfo(Request $request){
        $bom_id = $request->input('bom_id');
        if(empty($bom_id) || !is_numeric($bom_id)) TEA('700','bom_id');
        $operation_id = $request->input('operation_id');
        if(empty($operation_id) || !is_numeric($operation_id)) TEA('700','operation_id');
        $obj_list = $this->model->getNeedCopyBomRoutingNodeInfo($bom_id,$operation_id);
        return response()->json(get_success_api_response($obj_list));
    }

    /**
     * 获取下载bom工艺路线数据
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function getBomRoutingDownloadData(Request $request){
        $bom_id = $request->input('bom_id');
        if(empty($bom_id) || !is_numeric($bom_id)) TEA('700','bom_id');
        $routing_id = $request->input('routing_id');
        if(empty($routing_id) || !is_numeric($routing_id)) TEA('700','routing_id');
        $obj_list = $this->model->getBomRoutingDownloadData($bom_id,$routing_id);
        return response()->json(get_success_api_response($obj_list));
    }

    /**
     * 获取能够被替换的工艺路线
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function getCanReplaceBom(Request $request){
        $input = $request->all();
        trim_strings($input);
        $data = $this->model->getCanReplaceBom($input);
        return response()->json(get_success_api_response($data));
    }

//endregion

//region 改

    public function saveBomRoutinginfo(Request $request){
        $input = $request->all();
        trim_strings($input);
        $this->model->checkBomRoutingFormField($input);
        $this->model->saveBomRoutinginfo($input);
        return response()->json(get_success_api_response(200));
    }

    /**
     * 修改工时那儿的基本数值
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function updateBomRoutingBaseQty(Request $request){
        $input = $request->all();
        trim_strings($input);
        $this->model->updateBomRoutingBaseQty($input);
        return response()->json(get_success_api_response(200));
    }

    /**
     * 替换工艺路线
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function replaceBomRoutingGn(Request $request){
        $input = $request->all();
        trim_strings($input);
        $this->model->replaceBomRoutingGn($input);
        return response()->json(get_success_api_response(200));
    }


//endregion

//region 删

    public function deleteBomRouting(Request $request){
        $bom_id = $request->input('bom_id');
        if(empty($bom_id)) TEA('700','bom_id');
        $routing_id = $request->input('routing_id');
        if(empty($routing_id)) TEA('700','routing_id');
        $routings = $request->input('routings');
        if(empty($routings)) TEA('700','routings');
        $this->model->deleteBomRouting($bom_id,$routing_id,$routings);
        return response()->json(get_success_api_response(200));
    }

    /**
     * 删除bom的工艺路线和流转品的关系
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function deleteEnterMaterialLzp(Request $request){
        $bom_id = $request->input('bom_id');
        if(empty($bom_id) || !is_numeric($bom_id)) TEA('700','bom_id');
        $routing_id = $request->input('routing_id');
        if(empty($routing_id) || !is_numeric($routing_id)) TEA('700','routing_id');
        $material_id = $request->input('material_id');
        if(empty($material_id) || !is_numeric($material_id)) TEA('700','material_id');
        $this->model->deleteEnterMaterialLzp($bom_id,$routing_id,$material_id);
        return response()->json(get_success_api_response(200));
    }

//endregion

}