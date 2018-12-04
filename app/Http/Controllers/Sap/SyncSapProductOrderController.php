<?php
/**
 * Created by PhpStorm.
 * User: zhufeng
 * Date: 2018/8/27
 * Time: 下午5:01
 */

namespace App\Http\Controllers\Sap;
use App\Http\Controllers\Controller;
use App\Http\Models\Sap\SyncSapProductOrder;
use Illuminate\Http\Request;

/**
 * 同步SAP PO 入MES 控制器
 * Class SyncSapProductOrderController
 * @package App\Http\Controllers\Sap
 * @author Bruce.Chu
 */
class SyncSapProductOrderController extends Controller
{
    public function __construct()
    {
        parent::__construct();
        if(empty($this->model)) $this->model = new SyncSapProductOrder();
    }

    /**
     * 同步
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiSapException
     */
    public function syncSapProductOrder(Request $request)
    {
        $input = $request->all();
        api_to_txt($input, $request->path());
        // 添加接口记录
        $ApiControl = new \App\Http\Models\SapApiRecord();
        $ApiControl->store($input);
        //联系M层处理
        $this->model->syncSapProductOrder($input['DATA']);
        return response()->json(get_success_sap_response($input));
    }
}