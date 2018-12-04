<?php  
/**
 * @message 委外加工 领料单
 * @author  liming
 * @time    年 月 日
 */	
namespace App\Http\Controllers\Mes;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Http\Models\OutMachine;


/**
 *委外加工  领料单
 *@author   liming 
 */
class OutMachineController extends Controller
{

	public function __construct()
    {
        parent::__construct();
        if (empty($this->model)) $this->model = new OutMachine();
    }

	/**
	 * @message  sap   同步委外订单  领料
	 * @author  liming
	 * @time    年 月 日
	 */	
    public function syncOutMachine(Request $request)
    {
        $input = $request->all();
        api_to_txt($input, $request->path());
        $response = $this->model->syncOutMachine($input);
        return response()->json(get_success_sap_response($response));
    }



    /**
     * 委外订单分页列表[需要传递分页参数]
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
     * @message 通过委外订单获取 委外工单
     * @author  liming
     * @time    年 月 日
     */    
    public function showOutWork(Request $request)
    {
        //判断ID是否提交
        $id=$request->input('id');
        if(empty($id)|| !is_numeric($id)) TEA('703','id');
        //呼叫M层进行处理
        $response=get_api_response('200');
        $response['results']=$this->model->showOutWork($id);
        return  response()->json($response);
    }
   



    /**
     * @message 获取单条委外订单的信息
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
?>