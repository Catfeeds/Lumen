<?php 
/**
 * 模板管理器
 * @author  liming
 * @time    2017年11月8日
 */
namespace App\Http\Controllers\Mes;//定义命名空间
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Http\Models\OutWorkOrder;//

class OutWorkController extends Controller{

    /**
     * 构造方法初始化操作类
     */
    public function __construct()
    {
      parent::__construct();
      if(empty($this->model)) $this->model =new OutWorkOrder();
    }

    /**
     * 获取列表
     * @param Request $request
     * @return  string   返回json
     * @author  liming
     */
    public function  pageIndex(Request $request)
    {
        //过滤,判断并提取所有的参数
        $input=$request->all();
        // 获取列表信息
        $obj_list=$this->model->getOrderList($input);
        //获取返回值
        $paging=$this->getPagingResponse($input);
        $paging['total_records'] = $obj_list->total_count;
        return  response()->json(get_success_api_response($obj_list,$paging));
    }

    /**
     * 查看某条入库单信息
     * @param   \Illuminate\Http\Request  $request   Request实例
     * @return  string  返回json
     * @author  liming
     */
    public function show(Request $request)
    {
        //判断ID是否提交
        $id=$request->input('id');
        if(empty($id)|| !is_numeric($id)) TEA('703','id');

         // 获取单个单信息
        $obj_list=$this->model->getOneOrder($id);

        //呼叫M层进行处理
        $response=get_api_response('200');
        $response['results']=$obj_list;
        return  response()->json($response);
    }


    /**
     * @message 查找该委外单的委外工单的进出料
     * @author  liming
     * @time    年 月 日
     */    
    public  function  getFlowItems(Request $request)
    {
         //判断ID是否提交
         $id=$request->input('id');
         if(empty($id)|| !is_numeric($id)) TEA('703','id');

         // 获取单个入库单信息
         $obj_list=$this->model->getFlowItems($id);

        //呼叫M层进行处理
        $response=get_api_response('200');
        $response['results']=$obj_list;
        return  response()->json($response);
    }

}