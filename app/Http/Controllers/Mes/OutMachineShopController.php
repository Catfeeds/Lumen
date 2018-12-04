<?php
namespace App\Http\Controllers\Mes;


use App\Http\Controllers\Controller;
use App\Http\Models\OutMachineShop;
use App\Libraries\Soap;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OutMachineShopController extends Controller
{
    public function __construct()
    {
        parent::__construct();
        !$this->model && $this->model = new OutMachineShop();
    }

    /**
     * @message 新增委外单据
     * @author  liming
     * @time    年 月 日
     */    
    public function storeFlowItems(Request $request)
    {
        $input = $request->all();
        $insert_id= $this->model->storeFlowItems($input);
        $response=get_api_response('200');
        $response['results']=['instore_id'=>$insert_id];
        return  response()->json($response);
    }

    /**
     * @message 编辑委外实发
     * @author  liming
     * @time    年 月 日
     */    
    public function updateFlowItems(Request $request)
    {
        //业务权限判断
        //过滤,判断并提取所有的参数
        $input=$request->all();
        //id判断
        if(empty($input['id']) || !is_numeric($input['id'])) TEA('703','id');
     
        try{
            DB::connection()->beginTransaction();
            //呼叫M层进行处理
            $this->model->updateFlowItems($input);
            //呼叫M层进行处理
            $order_id   =   $this->model->audit($input);
            $sendData   =   $this->model->getWorkShopSyncSapData($input['id']);
        }catch(\Exception $e){
            DB::connection()->rollBack();
            TEA($e->getCode());
        }
        //判断是否需要发送给SAP,如果为空，就不需要发送。
        if (!empty($sendData)) {
            $resp = Soap::doRequest($sendData, 'INT_MM002200003', '0002');
            if (!isset($resp['RETURNCODE'])||!isset($resp['RETURNINFO'])) {
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
        //拼接返回值
        $response=get_api_response('200');
        $response['results']=['id'=>$input['id']];
        return  response()->json($response);
        // return response()->json(get_success_api_response(200));
    }


    /**
     * 分页列表[需要传递分页参数]
     * @return  \Illuminate\Http\Response
     */
    public function  pageIndex(Request $request)
    {
        $input=$request->all();
        //trim过滤一下参数
        trim_strings($input);
        //分页参数判断
        $this->checkPageParams($input);
        //获取数据
        $obj_list=$this->model->getPageList($input);
        //获取返回值
        $paging=$this->getPagingResponse($input);
        $paging['total_records'] =$obj_list->total_count;
        return  response()->json(get_success_api_response($obj_list,$paging));
    }


    /**
     * @message 获取单条委外单条相关
     * @author  liming
     * @time    年 月 日
     */    
    public function show(Request $request)
    {
        //判断ID是否提交
        $id=$request->input('id');
        if(empty($id)|| !is_numeric($id)) TEA('703','id');
        //呼叫M层进行处理
        $response=get_api_response('200');
        $response['results']=$this->model->show($id);
        return  response()->json($response);
    }


    /**
     * 审核
     * @param Request $request
     * @return  string  返回json
     * @author  
     */
    public  function audit(Request $request)
    {
        //业务权限判断
        //过滤,判断并提取所有的参数
        $input=$request->all();
        //id判断
        if(empty($input['id']) || !is_numeric($input['id'])) TEA('703','id');
        try{
            DB::connection()->beginTransaction();
            //呼叫M层进行处理
            $order_id   =   $this->model->audit($input);
            $sendData   =   $this->model->getWorkShopSyncSapData($input['id']);
        }catch(\Exception $e){
            DB::connection()->rollBack();
            TEA($e->getCode());
        }
        //判断是否需要发送给SAP,如果为空，就不需要发送。
        if (!empty($sendData)) {
            $resp = Soap::doRequest($sendData, 'INT_MM002200003', '0002');
            if (!isset($resp['RETURNCODE'])||!isset($resp['RETURNINFO'])) {
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



    /**
     * 反审
     * @param   Request $request
     * @return  string  返回json
     * @author  
     */
    public  function noaudit(Request $request)
    {
        //业务权限判断
        //过滤,判断并提取所有的参数
        $input=$request->all();

        //id判断
        if(empty($input['id']) || !is_numeric($input['id'])) TEA('703','id');
        //呼叫M层进行处理
        $this->model->noaudit($input);
        //拼接返回值
        $response=get_api_response('200');
        $response['results']=['order_id'=>$input['id']];
        return  response()->json($response);
    }


    /**
     * @message 退料信息接口
     * @author  liming
     * @time    年 月 日
     */    
    public   function  showSendBack(Request $request)  
    {
        //业务权限判断
        //过滤,判断并提取所有的参数
        $input=$request->all();

        //picking_line_id  判断
        if(empty($input['picking_line_id']) || !is_numeric($input['picking_line_id'])) TEA('703','picking_line_id');

        $picking_line_id  = $input['picking_line_id'];

        //呼叫M层进行处理
        $response=get_api_response('200');
        $response['results']=$this->model->showSendBack($picking_line_id);
        return  response()->json($response);
    }
}