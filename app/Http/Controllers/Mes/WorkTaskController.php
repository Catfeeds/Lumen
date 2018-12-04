<?php




namespace App\Http\Controllers\Mes;



use App\Http\Models\OperationOrder;
use App\Http\Models\WorkOrder;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;


/**
 *生产订单管理
 *@author    rick
* @reviser  sam.shan <sam.shan@ruis-ims.cn> 2018年02月10日09:33:42
 */
class WorkTaskController extends Controller
{


    public function __construct()
    {
        parent::__construct();
        if (empty($this->model)) $this->model = new WorkOrder();
    }
//region 查


    /**
     * 工作任务列表
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function  pageIndex(Request $request)
    {
        $input=$request->all();
        //trim过滤一下参数
        trim_strings($input);
        $model = new OperationOrder();
        //获取数据
        $obj_list=$model->getOperationOrderList($input);
        //获取返回值
        $paging=$this->getPagingResponse($input);

        return  response()->json(get_success_api_response($obj_list,$paging));
    }

    /**
     * 工作任务详情
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function show(Request $request)
    {
        $model = new OperationOrder();
        //判断ID是否提交
        $id = $request->input($model->apiPrimaryKey);
        if(empty($id) || !is_numeric($id)) TEA('700',$this->model->apiPrimaryKey);
        //呼叫M层进行处理

        $results= $model->get($id);
        return  response()->json(get_success_api_response($results));
    }
//endregion


//region  拆任务成工单

    /**
     * 将工作任务拆成工单
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @author  sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function split(Request $request)
    {
        $input = $request->all();
        $this->model->checkSplitFields($input);
        $this->model->split($input);
        return response()->json(get_success_api_response($input['split_rules']));
    }
//endregion




}