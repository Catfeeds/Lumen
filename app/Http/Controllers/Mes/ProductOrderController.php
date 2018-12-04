<?php
/**
 * Created by PhpStorm.
 * User: ruiyanchao
 * Date: 2018/2/6
 * Time: 上午10:15
 */

namespace App\Http\Controllers\Mes;

use App\Jobs\ReleaseProductOrder;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Http\Models\ProductOrder;

/**
 *生产订单管理
 *@author    rick
 */
class ProductOrderController extends Controller
{


    public function __construct()
    {
        parent::__construct();
        if (empty($this->model)) $this->model = new ProductOrder();
    }


//region 增

    /**
     * 增加生产订单
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     *
     */
    public function store(Request $request)
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
     * sap 同步 生产订单 给mes
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     * @throws \App\Exceptions\ApiSapException
     */
    public function syncProductOrder(Request $request)
    {
        $input = $request->all();
        api_to_txt($input, $request->path());
        $response = $this->model->syncProductOrder($input);
        return response()->json(get_success_sap_response($response));
    }

    /**
     * sap 同步 生产订单状态 给mes
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     * @throws \App\Exceptions\ApiSapException
     */
    public function syncProductOrderStatus(Request $request)
    {
        $input = $request->all();
        api_to_txt($input, $request->path());
        $response = $this->model->syncProductOrderStatus($input);
        return response()->json(get_success_sap_response($response));
    }

//endregion


//region 删

    /**
     * 删除生产订单
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     * @todo   业务判断未添加
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


//region 改

    /**
     * 修改生产订单
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request)
    {
        //获取所有参数
        $input=$request->all();
        //呼叫M层进行处理
        $result = $this->model->update($input);
        $result = $result==null?$input[$this->model->apiPrimaryKey]:$result;
        //获取返回值
        return  response()->json(get_success_api_response([$this->model->apiPrimaryKey=>$result]));
    }

//endregion


//region 查

    /**
     * 生产订单列表查询
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function  pageIndex(Request $request)
    {
        $input=$request->all();
        //trim过滤一下参数
        trim_strings($input);
        //获取数据
        $obj_list=$this->model->getProductOrderList($input);
        //获取返回值
        $paging=$this->getPagingResponse($input);


        return  response()->json(get_success_api_response($obj_list,$paging));
    }

    /**
     * 生产订单详情
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
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



//endregion

//region   发布

    /**
     * 发布生产订单
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     * @author  sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function release(Request $request)
    {
        //判断ID是否提交
        $production_order_id= $request->input('production_order_id');
        if(empty($production_order_id) || !is_numeric($production_order_id)) TEA('700','production_order');
        //发布生产订单
        $this->model->release($production_order_id);
        return  response()->json(get_success_api_response());
    }

    /**
     * 撤回已发布的生产订单
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     * @author  kevin
     */
    public function cancelRelease(Request $request)
    {
        //判断ID是否提交
        $production_order_id= $request->input('production_order_id');
        if(empty($production_order_id) || !is_numeric($production_order_id)) TEA('700','production_order');
        //发布生产订单
        $this->model->cancelRelease($production_order_id);
        return  response()->json(get_success_api_response());
    }

    /**
     * 批量发布生产订单
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     * @author lester.you
     */
    public function batchRelease(Request $request)
    {
        $input = $request->all();
        if (empty($input['product_order_id_arr'])) TEA('700', 'product_order_id_arr');

        try {
            $input['product_order_id_arr'] = json_decode($input['product_order_id_arr'], true);
        } catch (\Exception $exception) {
            TEA('700', 'product_order_id_arr');
        }

        foreach ($input['product_order_id_arr'] as $po_id) {
            $has = $this->model->isExisted([['id', '=', $po_id]]);
            if (!$has) TEA('700', 'product_order_id');
            $data=[
                'product_order_id' => $po_id,
            ];
            $job = (new ReleaseProductOrder($data))->onQueue('release_PO');
            $this->dispatch($job);
        }
        return  response()->json(get_success_api_response());
    }
//endregion

//region 所有PO排产信息
    /**计划排产
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @author Bruce.Chu
     */
    public function productOrderSchedule(Request $request)
    {
        $input=$request->all();
        //分页参数过滤
        $this->checkPageParams($input);
        //获取数据
        $obj_list=$this->model->getProductOrderScheduleList($input);
        //获取返回值
        $paging=$this->getPagingResponse($input);
        return  response()->json(get_success_api_response($obj_list,$paging));
    }
//endregion

    /**
     * 检测BOM是否配置is_ecm
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @author Bruce.Chu
     */
    public function isEcm(Request $request)
    {
        //前端传参 物料id 必传
        $material_id=$request->input('material_id');
        if(empty($material_id)) TEA('700','material_id');
        //联系M层处理
        $result=$this->model->isEcm($material_id);
        return  response()->json(get_success_api_response($result));
    }

    /**
     * 生产实时看板
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @author kevin
     */
    public function productBoard(Request $request)
    {
        //联系M层处理
        $result=$this->model->productBoard();
        return  response()->json(get_success_api_response($result));
    }

    /**
     * 生产订单关闭／开启
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @author kevin
     */
    public function productOrderOnOff(Request $request)
    {
        //判断ID是否提交
        $id = $request->input($this->model->apiPrimaryKey);
        if(empty($id) || !is_numeric($id)) TEA('700',$this->model->apiPrimaryKey);

        //联系M层处理
        $this->model->productOrderOnOff($id);
        return  response()->json(get_success_api_response([$this->model->apiPrimaryKey=>$id]));
    }
}