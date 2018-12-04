<?php
/**
 * 查询采购订单
 * User: xiafengjuan
 * Date: 2017/10/17
 * Time: 16:17
 */
namespace App\Http\Controllers\Mes;//定义命名空间
use App\Http\Controllers\Controller;//引入基础控制器类
use Illuminate\Http\Request;//获取请求参数
use App\Http\Models\PurchaseOrder;//单位数据处理模型

class PurchaseOrderController extends Controller
{
    private  $purchaseorder;
    public function __construct()
    {
        parent::__construct();
        if (empty($this->purchaseorder)) $this->purchaseorder = new PurchaseOrder();
    }
    /**
     * 根据条件获得采购订单列表
     * @param   \Illuminate\Http\Request  $request   Request实例
     * @return  string  返回json|jsonp格式
     * @author  xiafengjuan
     */
    public function index(Request $request)
    {
        $input = $request->all();
        $obj_list=$this->purchaseorder->getOrderList($input);
        //呼叫M层进行处理
        $response=get_api_response('200');
        $response['results']=$obj_list;
        return  response()->json($response);
    }


    /**
     * @message  同步  采购订单
     * @author  liming
     * @time    年 月 日
     */    
    public function syncInspectOrder(Request $request)
    {
        $input = $request->all();
        api_to_txt($input, $request->path());
        $response = $this->model->syncInspectOrder($input);
        return response()->json(get_success_sap_response($response));
    }    

}