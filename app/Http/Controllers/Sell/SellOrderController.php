<?php
/**
 * Created by PhpStorm.
 * User: haoziye
 * Date: 2018/3/31
 * Time: 下午5:58
 */
namespace App\Http\Controllers\Sell;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Http\Models\Sell\SellOrder;

class SellOrderController extends Controller{

    public function __construct()
    {
        parent::__construct();
        if(empty($this->model)) $this->model = new SellOrder();
    }


//region 检

    /**
     * 检测唯一性
     * @param Request $request
     * @return string  返回json
     * @throws \App\Exceptions\ApiException
     */
    public  function unique(Request $request)
    {
        //获取参数并过滤
        $input=$request->all();
        $where=$this->getUniqueExistWhere($input);
        $input['has']=$this->model->isExisted($where);
        //拼接返回值
        $results=$this->getUniqueResponse($input);
        return  response()->json(get_success_api_response($results));
    }

//endregion

//region 增

    /**
     * 添加
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request){
        $input = $request->all();
        trim_strings($input);
        $this->model->checkFormField($input);
        $insertId = $this->model->store($input);
        return response()->json(get_success_api_response($insertId));
    }

    public function createPO(Request $request){
        $id = $request->input($this->model->apiPrimaryKey);
        if(empty($id)) TEA('700',$this->model->apiPrimaryKey);
        $this->model->createPO($id);
        return response()->json(get_success_api_response(200));
    }

//endregion

//region 改

    /**
     *  生成生产单
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request){
        $input = $request->all();
        trim_strings($input);
        if(empty($input[$this->model->apiPrimaryKey])) TEA('700',$this->model->apiPrimaryKey);
        $this->model->checkFormField($input);
        $this->model->update($input);
        return response()->json(get_success_api_response(200));
    }

//endregion

//region 查

    /**
     * 分页列表
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function pageIndex(Request $request){
        $input = $request->all();
        trim_strings($input);
        $this->checkPageParams($input);
        $obj_list = $this->model->pageIndex($input);
        $paging = $this->getPagingResponse($input);
        return response()->json(get_success_api_response($obj_list,$paging));
    }

    /**
     * 销售订单详情
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function show(Request $request){
        $id = $request->input($this->model->apiPrimaryKey);
        if(empty($id)) TEA('700',$this->model->apiPrimaryKey);
        $obj = $this->model->show($id);
        return response()->json(get_success_api_response($obj));
    }

//endregion

//region 删

    /**
     * 删除销售单
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function destory(Request $request){
        $id = $request->input($this->model->apiPrimaryKey);
        if(empty($id)) TEA('700',$this->model->apiPrimaryKey);
        $this->model->destory($id);
        return response()->json(get_success_api_response(200));
    }

//endregion
}