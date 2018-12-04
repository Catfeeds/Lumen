<?php
/**
 * Created by PhpStorm.
 * User: ruiyanchao
 * Date: 2018/2/23
 * Time: 上午10:41
 */

namespace App\Http\Controllers\Mes;

use App\Http\Models\WorkOrder;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;


class WorkOrderController extends Controller
{


    public function __construct()
    {
        parent::__construct();
        if (empty($this->model)) $this->model = new WorkOrder();
    }

    public function  pageIndex(Request $request)
    {
        header('Access-Control-Allow-Origin:*');
        header('Access-Control-Allow-Methods:OPTIONS, GET, POST'); // 允许option，get，post请求
        header('Access-Control-Allow-Headers:x-requested-with'); // 允许x-requested-with请求头
        header('Access-Control-Max-Age:86400'); // 允许访问的有效期
        $input=$request->all();
        //trim过滤一下参数
        trim_strings($input);
        //获取数据
        $obj_list=$this->model->getWorkOrderList($input);
        //获取返回值
        $paging=$this->getPagingResponse($input);

        return  response()->json(get_success_api_response($obj_list,$paging));
    }

    public function show(Request $request)
    {
        header('Access-Control-Allow-Origin:*');
        header('Access-Control-Allow-Methods:OPTIONS, GET, POST'); // 允许option，get，post请求
        header('Access-Control-Allow-Headers:x-requested-with'); // 允许x-requested-with请求头
        header('Access-Control-Max-Age:86400'); // 允许访问的有效期
        //该接口支持用工单id或者工单号查询 Modify By Bruce.Chu in 2018-09-12
        $input = $request->all();
        if(empty($input[$this->model->apiPrimaryKey]) && empty($input['wo_number'])) TEA('700',$this->model->apiPrimaryKey.' or wo_number');
        $obj = $this->model->get($input);
        return response()->json(get_success_api_response($obj));
    }

    public function edit(Request $request)
    {
        $input = $request->all();
        if(empty($input[$this->model->apiPrimaryKey])&& empty($input['in_material'])) TEA('700',$this->model->apiPrimaryKey.' or in_material');
        $obj = $this->model->edit($input);
        return response()->json(get_success_api_response($obj));
    }

}

