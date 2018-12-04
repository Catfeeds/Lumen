<?php
namespace App\Http\Controllers\Mes;


use App\Http\Controllers\Controller;
use App\Http\Models\OutMachineZy;
use App\Libraries\Soap;
use Illuminate\Http\Request;

class OutMachineZyController extends Controller
{
    public function __construct()
    {
        parent::__construct();
        !$this->model && $this->model = new OutMachineZy();
    }

    /**
     * @message 新增委外相关单据
     * @author  liming
     * @time    年 月 日
     */    
    public function storeZy(Request $request)
    {
        $input = $request->all();
        $insert_ids= $this->model->storeZy($input);
        $response=get_api_response('200');
        foreach ($insert_ids as $key => $insert_id) 
        {
            $sap_response = $this->model->pushOutMachineZy($insert_id);
            if ($sap_response['RETURNCODE'] != 0) 
            {
               TEA('2450');
            }
            // 如果推送成功，状态为2
            $this->model->updateStatus($insert_id, 2);
        }
        if ($input['type_code'] == 'ZY03')
        {
            //如果是委外额定领料单
            //反写领料单 状态字段
            $this->model->updateZyStatus($input['out_picking_id']);
        }
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
    public function pushOutMachineZy(Request $request)
    {
        $input = $request->all();
        //id判断
        if(empty($input['id']) || !is_numeric($input['id'])) TEA('703','id');
        $response = $this->model->pushOutMachineZy($input['id']);

        if ($response['RETURNCODE'] != 0) {
            TEPA($response['RETURNINFO']);
        }
        // 如果推送成功，状态为2
        $this->model->updateStatus($input['id'], 2);
        return response()->json(get_success_api_response($response));
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

}