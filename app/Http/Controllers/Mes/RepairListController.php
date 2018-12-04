<?php 
/**
 * 模板管理器
 * @author  liming
 * @time    2018年4月3日
 */

namespace App\Http\Controllers\Mes;//定义命名空间
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Libraries\Tree;//引入无限极分类操作类
use App\Http\Models\RepairList; // 


class RepairListController extends Controller
{
	
	function __construct()
	{
	  parent::__construct();
      if(empty($this->model)) $this->model=new RepairList();
	}


	 /**
     * 添加或者编辑时候进行的提交数据处理
     * @param $input  array 要过滤判断的get/post数组
     * @return void         址传递,不需要返回值
     */
    public function checkFormFields(&$input)
    {
        //过滤
        trim_strings($input);
        //code
        // if(empty($input['code'])) TEA('8202','code');
        // if(!preg_match('/^[A-Z]{1,10}+$/',$input['code'])) TEA('8201','code');

        // //name
        // if(empty($input['name'])) TEA('8200','name');
      
        // if(!isset($input['remark'])) TEA('732','remark');
        // if( mb_strlen($input['remark'])>500)  TEA('8210','remark');

    }



    public  function  pageIndex(Request $request)
    {
    	//  提取所有参数
        $input=$request->all();
        //检测参数
        $this->checkFormFields($input);
        //呼叫M层进行处理
        $obj_list=$this->model->getPageList($input);
        //获取返回值
        $paging=$this->getPagingResponse($input);
        $paging['total_records'] =$obj_list->total_count;
        return  response()->json(get_success_api_response($obj_list,$paging));

    }







    public  function  store(Request $request)
    {
    	//  提取所有参数
        $input=$request->all();

        //检测参数
        $this->checkFormFields($input);

        //呼叫M层进行处理
        $insert_id=$this->model->add($input);
        $response=get_api_response('200');
        $response['results']=['store_id'=>$insert_id];
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

        //呼叫M层进行处理
        $order_id   =   $this->model->audit($input);

        //拼接返回值
        $response=get_api_response('200');
        $response['results']=['order_id'=>$input['id']];
        return  response()->json($response);
    }





    /**
     * 反审核
     * @param Request $request
     * @return 4 string  返回json
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
        $order_id   =   $this->model->noaudit($input);

        //拼接返回值
        $response=get_api_response('200');
        $response['results']=['order_id'=>$input['id']];
        return  response()->json($response);
    }






    /**
     *编辑
     * @param Request $request
     * @return  string  返回json
     * @author  liming
     */
    public  function update(Request $request)
    {
        //业务权限判断
        //过滤,判断并提取所有的参数
        $input=$request->all();
        //id判断
        if(empty($input['id']) || !is_numeric($input['id'])) TEA('703','id');
        //集中营判断
        $this->checkFormFields($input);
        //呼叫M层进行处理
        $this->model->update($input);
        //拼接返回值
        $response=get_api_response('200');
        $response['results']=['require_id'=>$input['id']];
        return  response()->json($response);
    }


    public   function  select(Request $request)
    {
    	//  提取所有参数
        $input=$request->all();

        //检测参数
        $this->checkFormFields($input);
        $obj_list = $this->model->getList($input);

        //拼接返回值
        return  response()->json(get_success_api_response($obj_list));
    }


    public   function   destroy(Request $request)
    {
        //判断ID是否提交
        $id=$request->input('id');
        if(empty($id)|| !is_numeric($id)) TEA('703','id');

        //呼叫M层进行处理
        $this->model->destroy($id);
        $response=get_api_response('200');
        return  response()->json($response);

    }

    public  function   show(Request $request)
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

}