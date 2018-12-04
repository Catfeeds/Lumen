<?php
namespace App\Http\Controllers\Mes;

use App\Http\Controllers\Controller;
use App\Http\Models\OffcutWeright;
use App\Libraries\Soap;
use Illuminate\Http\Request;

class OffcutWerightController extends Controller
{
    public function __construct()
    {
        parent::__construct();
        !$this->model && $this->model = new OffcutWeright();
    }

    /**
     * @message 新增边角料称重单据
     * @author  liming
     * @time    年 月 日
     */    
    public function store(Request $request)
    {
        $input = $request->all();
        $insert_id= $this->model->store($input);
        $response=get_api_response('200');
        $response['results']=['instore_id'=>$insert_id];
        return  response()->json($response);
    }
    /**
     * @message 边角料称重单据分页列表
     * @author  guangyag.wang
     * @time    年 月 日
     */
    public function pageIndex(Request $request)
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
     * @message 边角料称重单据列表
     * @author  guangyag.wang
     * @time    年 月 日
     */
    public function  select(Request $request)
    {
        //过滤,判断并提取所有的参数
        $input=$request->all();
        $obj_list=$this->model->getOffList($input);
        $response=get_api_response('200');
        $response['results']=$obj_list;
        return  response()->json($response);
    }


    /**
     * @message 查看边角料称重单据
     * @author  guangyag.wang
     * @time    年 月 日
     */
    public function show(Request $request)
    {
        //判断ID是否提交
        $id=$request->input('id');
        if(empty($id)|| !is_numeric($id)) TEA('703','id');
        //呼叫M层进行处理
        $response=get_api_response('200');
        $obj_list=$this->model->get($id);
        $response['results']= $obj_list;
        return  response()->json($response);
    }
    /**
     * @message 编辑边角料称重单据
     * @author  guangyag.wang
     * @time    年 月 日
     */
    public function update(Request $request)
    {
        //业务权限判断
        //过滤,判断并提取所有的参数
        $input=$request->all();
        //id判断
        if(empty($input['id']) || !is_numeric($input['id'])) TEA('703','id');

        //呼叫M层进行处理
        $this->model->update($input);
        //拼接返回值
        $response=get_api_response('200');
        $response['update_id']=$input['id'];
        return  response()->json($response);
    }
    /**
     * @message 删除边角料称重单据
     * @author  guangyag.wang
     * @time    年 月 日
     */
    public function destory(Request $request)
    {
        //判断ID是否提交
        $id=$request->input('id');
        if(empty($id)|| !is_numeric($id)) TEA('703','id');
        //呼叫M层进行处理
        $this->model->destroy($id);
        $response['destroy_id']= $id;
        $response=get_api_response('200');
        return  response()->json($response);
    }

    /**
     * @message  推送委外相关单据
     *
     * @param Request $request
     * @return mixed
     * @throws \App\Exceptions\ApiException
     * @author  liming
     */
    public function pushOffcutWeright(Request $request)
    {
        $input = $request->all();
        //id判断
        if(empty($input['ids'])) TEA('703','ids');
        $order_ids  =  explode(',', $input['ids']);

        $response = $this->model->pushOffcutWeright($order_ids);
        if ($response['RETURNCODE'] != 0) {
            TEPA($response['RETURNINFO']);
        }
        foreach ($order_ids as  $order_id) 
        {
            // 如果推送成功，状态为2
            $this->model->updateStatus($order_id, 2);
        }
        return response()->json(get_success_api_response($response));
    }
}