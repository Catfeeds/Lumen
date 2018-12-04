<?php
/**
 * Created by PhpStorm.
 * User: lester
 * Date: 2018/9/5 14:04
 * Desc:
 */

namespace App\Http\Controllers\Mes;


use App\Http\Controllers\Controller;
use App\Http\Models\MaterialRequisition;
use App\Libraries\Soap;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MaterialRequisitionController extends Controller
{
    public function __construct()
    {
        parent::__construct();
        !$this->model && $this->model = new MaterialRequisition();
    }

//region 检

    /**
     * 检验 领料单 子项 当前可领的数量
     *
     * 可领的数量 = WO里面总的数量 - 已被领取的数量
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function checkItemNumber(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        $resp = $this->model->checkItemNumber($input);
        return response()->json(get_success_api_response($resp));
    }

    /**
     * 验证是否允许退料单
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function checkReturnMaterial(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        $this->model->checkReturnMaterial($input);
        return response()->json(get_success_api_response(200));
    }

    /**
     * 齐料检测(工单是否允许向mes领料)
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     * @throws \App\Exceptions\ApiParamException
     */
    public function checkApplyMes(Request $request)
    {
        $input = $request->all();
//        $json_string = '[{"work_order_id":361,"materials":[{"material_id":60092,"qty":50,"line_depot":"1008","product_depot":""}]},{"work_order_id":362,"materials":[{"material_id":60093,"qty":140,"line_depot":"1008","product_depot":""}]}]';
//        $input['items'] = json_decode($json_string, true);
        trim_strings($input);
        if (empty($input['items'])) TEA('700', 'items');
        $responseArr = [];
        foreach ($input['items'] as $item) {
            $this->model->checkAppLyMesParams($item);
            $is_full = $this->model->checkApplyMes($item);
            $responseArr[] = [
                'work_order_id' => $item['work_order_id'],
                'is_full' => $is_full,
            ];
        }
        return response()->json(get_success_api_response($responseArr));
    }

    /**
     * 验证是否允许生成 车间退料单
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function checkWorkShopReturnMaterial(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        $this->model->checkWorkShopReturnMaterial($input);
        return response()->json(get_success_api_response(200));
    }
//endregion

//region 增

    /**
     * 添加
     *
     * @todo mes需要验证实时库存
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     * @since 2018-09-13 lester.you 保存后不再同步，同步这个步骤 单独提出来
     */
    public function store(Request $request)
    {
        $input = $request->all();
        trim_strings($input);

        $this->model->checkFormField($input);
        $this->model->getProductOrder($input);
        if ($input['push_type'] == 0) {     // 0:针对MES 需要验证实时库存
//            $this->model->checkStorage($input);
        }
        $idArr = $this->model->store($input);
        // 如果是mes领料，直接入库
        if ($input['push_type'] == 0 && !empty($idArr[0])) {
            $_input[$this->model->apiPrimaryKey] = $idArr[0];
            $this->model->auditing($_input);
        }
        return response()->json(get_success_api_response(['id' => $idArr]));
    }

    /**
     * 生成退料单
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function storeReturnMaterial(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        $this->model->checkStoreReturnMaterialParams($input);
        $resp = $this->model->storeReturnMaterial($input);
        return response()->json(get_success_api_response(['ids' => $resp]));
    }

    /**
     * 生成车间领/补料单
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function storeWorkShop(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        $this->model->checkWorkShopParams($input);
        $resp = $this->model->storeWorkShop($input);
        return response()->json(get_success_api_response($resp));
    }

    /**
     * 生成车间退料单
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function storeWorkShopReturn(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        $this->model->checkWorkStopReturnParams($input);
        $response = $this->model->storeWorkShopReturn($input);
        return response()->json(get_success_api_response($response));

    }
//endregion

//region 删

    /**
     * 删除子项
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function deleteItem(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        $this->model->deleteItem($input);
        return response()->json(get_success_api_response(['item_id' => $input['item_id']]));
    }

    /**
     * 刪除整個領料單
     * 只允許刪除狀態為1 的訂單
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function delete(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        $this->model->delete($input);
        return response()->json(get_success_api_response(['mr_id' => $input[$this->model->apiPrimaryKey]]));
    }

//endregion

//region 改

    /**
     * 更改某一子项
     * 只限修改 需求数量和单位
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function updateItem(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        $this->model->updateItem($input);
        return response()->json(get_success_api_response(200));
    }

    /**
     * 更新实收数量&入库
     * 添加入库
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function updateActualReceiveNumber(Request $request)
    {
        $input = $request->all();
        api_to_txt($input, $request->path());
        trim_strings($input);
        try {
            DB::connection()->beginTransaction();
            $this->model->updateActualReceiveNumber($input);
            $this->model->auditing($input);     //入库
        } catch (\Exception $e) {
            DB::connection()->rollBack();
            TEA($e->getCode(), $e->getMessage());
        }
        DB::connection()->commit();
        return response()->json(get_success_api_response(200));
    }

    /**
     * 退料单 出库
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function auditing(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        $this->model->auditing($input);
        return response()->json(get_success_api_response(200));
    }

    /**
     * 领料单核验
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function unAuditing(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        $this->model->unAuditing($input);
        return response()->json(get_success_api_response(200));
    }

    /**
     * 车间领补退 确认发料、跟新实收数量
     * 并 出/入库
     *
     * 1.添加实收数据
     * 2.出入库 并更新状态
     * 3.收集所有物料id，根据其分类，判断是否需要同步给SAP。(如果 1,2,3执行失败回滚，并不执行以下步骤)
     * 4.发送SAP请求。
     * 5.根据4,成功与否， 判断是提交，还是回滚
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     * @throws \App\Exceptions\ApiParamException
     */
    public function workShopConfirmAndUpdate(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        try {
            DB::connection()->beginTransaction();
            $this->model->workShopConfirmAndUpdate($input);
            $this->model->auditing($input);     //入库
        } catch (\Exception $e) {
            DB::connection()->rollBack();
            TEA($e->getCode(), $e->getMessage());
        }
        //3.判断是否需要发送给SAP,如果为空，就不需要发送。
        $sendData = $this->model->getWorkShopSyncSapData($input);
        if (!empty($sendData)) {
            $resp = Soap::doRequest($sendData, 'INT_MM002200003', '0002');
            if (!isset($resp['RETURNCODE']) || !isset($resp['RETURNINFO'])) {
                DB::connection()->rollBack();
                TEA('2454');
            }
            if ($resp['RETURNCODE'] != 0) {
                DB::connection()->rollBack();
                TEPA($resp['RETURNINFO']);
            }
        }

        //4.如果 3 执行成功，就提交.
        DB::connection()->commit();
        return response()->json(get_success_api_response(200));
    }
//endregion

//region 查

    /**
     * 获取列表
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function pageIndex(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        $obj_list = $this->model->lists($input);
        $paging = $this->getPagingResponse($input);
        return response()->json(get_success_api_response($obj_list, $paging));
    }

    /**
     * 获取详情
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function show(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        $results = $this->model->show($input);
        return response()->json(get_success_api_response($results));
    }

    /**
     * 获取实时库存
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function getMaterialStorage(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        $this->model->getProductOrder($input);
        $results = $this->model->getMaterialStorage($input);
        return response()->json(get_success_api_response($results));
    }

    /**
     * 根据 工单code 获取物料和相应批次
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function getMaterialBatch(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        $result = $this->model->getMaterialBatch($input);
        return response()->json(get_success_api_response($result));
    }

    /**
     * 获取 创建SAP退料单数据
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function getCreateReturnMaterial(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        $this->model->checkReturnMaterial($input);
        $response = $this->model->getCreateReturnMaterialNew($input);
        return response()->json(get_success_api_response($response));
    }

    /**
     * 报工用到的 获取实时库存
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function getMaterialStorageInPW(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        $response = $this->model->getMaterialStorageInPW($input);
        return response()->json(get_success_api_response($response));
    }

    /**
     * 获取 车间退料的 可退的库存数量
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function getWorkShopReturnStorage(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        $this->model->checkWorkShopReturnMaterial($input);
        $response = $this->model->getWorkShopReturnStorage($input);
        return response()->json(get_success_api_response($response));
    }

    /**
     * SAP领料 查询采购仓库和生产仓库
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function getMaterialDepot(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        $response = $this->model->getMaterialDepot($input);
        return response()->json(get_success_api_response($response));
    }

    /**
     * SAP领料获取相关信息
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function getSapPackingInfo(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        $resp = $this->model->getSapPackingInfo($input);
        return response()->json(get_success_api_response($resp));
    }
//endregion

//region 推送

    /**
     * 同步领料单给SAP
     *
     * 还有状态为1的时候允许推送
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     * @throws \App\Exceptions\ApiParamException
     * @since 2018.11.22 直接推送(不需要出库)
     */
    public function syncMaterialRequisition(Request $request)
    {
        $input = $request->all();
        if (empty($input['id'])) TEA('700', 'id');
        if (empty($input['type'])) TEA('700', 'type');

        // 验证所属工单是否被锁定
        $this->model->checkWorkOrderLockByMRID($input['id']);

//        // 1.如果为退料，需要出库
//        if ($input['type'] == 2) {
//            $input[$this->model->apiPrimaryKey] = $input['id'];
//            try {
//                DB::connection()->beginTransaction();
//                $this->model->auditing($input);     //退料出库
//            } catch (\Exception $e) {
//                DB::connection()->rollBack();
//                TEA($e->getCode(), $e->getMessage());
//            }
//        }

        if ($input['type'] == 2) {  // SAP退料
            $data = $this->model->getReturnMaterial($input['id']);
//            $updateStatus = 3;
            $updateStatus = 2;  // 11.23 生成退料后 推送 状态: 1->2
        } else {            // SAP 领、补料
            $data = $this->model->getMaterialRequisition($input['id']);
            $updateStatus = 2;
        }

        $resp = Soap::doRequest($data, 'INT_MM002200001', '0002');
        if (!isset($resp['RETURNCODE'])) {
//            if ($input['type'] == 2) {     //如果为退料，则需要回滚
//                DB::connection()->rollBack();
//            }
            TEA('2454');
        }
        if ($resp['RETURNCODE'] != 0) {   //如果为退料，则需要回滚
//            if ($input['type'] == 2) {
//                DB::connection()->rollBack();
//            }
            TEPA($resp['RETURNINFO']);
        }

//        //如果为退料，成功需要提交
//        if ($input['type'] == 2) {
//            DB::connection()->commit();
//        }

        // 推送成功
        $this->model->updateStatus($input['id'], $updateStatus);
        return response()->json(get_success_api_response($resp));
    }


    /**
     * sap  同步委外领料单结果
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     * @throws \App\Exceptions\ApiSapException
     * @author  liming
     */
    public function syncPickingResult(Request $request)
    {
        $input = $request->all();
        $response = $this->model->syncPickingResult($input);
        return response()->json(get_success_sap_response($input, $response));
    }


    /**
     * sap  同步车间领料单结果
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
//     * @throws \App\Exceptions\ApiException
     * @throws \App\Exceptions\ApiSapException
     * @author  liming
     */
    public function syncShopResult(Request $request)
    {
        $input = $request->all();
        try {
            DB::connection()->beginTransaction();
            $response = $this->model->syncShopResult($input);
        } catch (\Exception $e) {
            DB::connection()->rollBack();
            TESAP($e->getCode(), $e->getMessage());
        }
        DB::connection()->commit();
        return response()->json(get_success_sap_response($input, $response));
    }
//endregion
}