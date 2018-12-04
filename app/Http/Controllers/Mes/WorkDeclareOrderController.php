<?php
namespace App\Http\Controllers\Mes;


use App\Http\Controllers\Controller;
use App\Http\Models\WorkDeclareOrder;
use App\Libraries\Soap;
use Illuminate\Http\Request;

class WorkDeclareOrderController extends Controller
{
    public function __construct()
    {
        parent::__construct();
        !$this->model && $this->model = new WorkDeclareOrder();
    }

    /**
     * @message 新增报工单
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
     * @message 新增报工单
     * @author  liming
     * @time    年 月 日
     */    
    public function outStore(Request $request)
    {
        $input = $request->all();
        $insert_id= $this->model->outStore($input);
        $response=get_api_response('200');
        $response['results']=['instore_id'=>$insert_id];
        return  response()->json($response);
    }


    /**
     * 编辑
     * @param  \Illuminate\Http\Request  $request  Request实例
     * @return  \Illuminate\Http\JsonResponse     返回json格式
     * @author liming 
     */
    public function update(Request $request)
    {
        //过滤,判断并提取所有的参数
        $input=$request->all();
        //id判断
        if(empty($input['id']) || !is_numeric($input['id'])) TEA('703','id');

        //呼叫M层进行处理
        $this->model->update($input);
        //获取返回值
        $response=get_api_response('200');
        $response['results']=['other_instore_id'=>$input['id']];
        return  response()->json($response);
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
        //获取数据
        $obj_list=$this->model->getPageList($input);
        //获取返回值
        $paging=$this->getPagingResponse($input);
        $paging['total_records'] =$obj_list->total_count;
        return  response()->json(get_success_api_response($obj_list,$paging));
    }


    /**
     * 查询某条记录
     * @param Request   $request
     * @return string   返回json
     */
    public function  show(Request $request)
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
     * @message  推送报工单
     *
     * @param Request $request
     * @return mixed
     * @throws \App\Exceptions\ApiException
     * @author  liming
     */
    public function pushWorkDeclareOrder(Request $request)
    {
        $input = $request->all();
        //id判断
        if(empty($input['id']) || !is_numeric($input['id'])) TEA('703','id');
        $response = $this->model->pushWorkDeclareOrder($input['id']);
        if ($response['RETURNCODE'] ==1) {
            TEPA($response['RETURNINFO']);
        }
        // 如果推送成功，状态为2
        $this->model->updateStatus($input['id'], 2);

        if ($response['RETURNCODE'] == 2) 
        {
           $this->model->updateStatus($input['id'], 3);
           TEA($response['RETURNINFO']);
        }

        if ($response['RETURNCODE'] == 3) 
        {
           $this->model->updateStatus($input['id'], 4);
           TEA($response['RETURNINFO']);
        }
        // $this->model->storageInstore($input['id']);
        return response()->json(get_success_api_response($response));
    }


    /**
     * @message 生成单子
     * @author  liming
     * @time    年 月 日
     */    
      public  function   capacityFill(Request $request)
      {
        $input = $request->all();
        // 推送成功之后  生成各种领料、补料、退料单子
        $response['insert_id'] = $this->model->capacityFill($input['id']);
        return response()->json(get_success_api_response($response));
      }


        /**
         * 删除
         * @param Request $request
         * @return string  返回json字符串
         * @author liming
         */
        public  function  destroy(Request $request)
        {
            //判断ID是否提交
            $id=$request->input('id');
            if(empty($id)|| !is_numeric($id)) TEA('703','id');
            //呼叫M层进行处理
            $this->model->destroy($id);
            $response=get_api_response('200');
            return  response()->json($response);
        }

  /**
   * @message
   * @author  liming
   * @time    年 月 日
   */    
    public  function   storageInstore(Request $request)
    {
        //判断ID是否提交
        $id=$request->input('id');
        if(empty($id)|| !is_numeric($id)) TEA('703','id');
        //呼叫M层进行处理
        $response=get_api_response('200');
        $response['results']=$this->model->storageInstore($id);
        return  response()->json($response);
    }

  /**
   * @message
   * @author  liming
   * @time    年 月 日
   */    
    public  function   getDeclareByPr(Request $request)
    {
        //判断ID是否提交
        $id=$request->input('id');
        if(empty($id)|| !is_numeric($id)) TEA('703','id');
        //呼叫M层进行处理
        $response=get_api_response('200');
        $response['results']=$this->model->getDeclareByPr($id);
        return  response()->json($response);
    }


}