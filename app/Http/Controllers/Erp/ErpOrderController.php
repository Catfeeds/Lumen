<?php
/**
 * Created by PhpStorm.
 * User: zhufeng
 * Date: 2018/5/8
 * Time: 上午9:39
 */
namespace App\Http\Controllers\Erp;
use App\Http\Models\Erp\ErpOrder;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
/**
 * 拉取Erp订单转存Mes系统
 * @author  Bruce Chu
 * @package App\Http\Controllers\Erp
 */
class ErpOrderController extends Controller
{
    protected $model;

    public function __construct()
    {
        parent::__construct();
        $this->model = new ErpOrder();
    }

    /**
     * 拉取erpOrder接口所有生产订单
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getErpOrder(Request $request)
    {
        $input = $request->all();
        //根据开始-结束时间查询
        if (!isset($input['start_time'])) TEA('700', 'start_time');
        if (!isset($input['end_time'])) TEA('700', 'end_time');
        $start_time = $input['start_time'];
        $end_time = $input['end_time'];
        //根据日期查询所有订单
        $url = 'http://58.221.197.202:30087/Proorder/showOrder?company_id=&order_no=&code=&product_department_id=&order_status=&start_date=' . $start_time . '&end_date=' . $end_time . '&_token=8b5491b17a70e24107c89f37b1036078';
        //若传销售订单编号
        if (isset($input['sales_order_no']) && !empty($input['sales_order_no'])) {
            $url = 'http://58.221.197.202:30087/Proorder/showOrder?company_id=&order_no=' . $input['sales_order_no'] . '&code=&product_department_id=&order_status=&start_date=' . $start_time . '&end_date=' . $end_time . '&_token=8b5491b17a70e24107c89f37b1036078';
        }
        $result = $this->model->myCurl($url);
        return response()->json(get_success_api_response($result));
    }

    /**
     * 将前端传递生产订单数据插入Mes
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function insertToMes(Request $request)
    {
        $input = $request->all();
        $orders = json_decode($input['orders']);
        //联系M层入库
        $result=$this->model->insertToMes($orders);
        return response()->json(get_success_api_response($result));
    }
}
