<?php 
/**
 * 模板管理器
 * @author  liming
 * @time    2017年10月18日
 */
namespace App\Http\Controllers\Mes;//定义命名空间
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Libraries\Tree;//引入无限极分类操作类
use App\Http\Models\Partners;//引入业务伙伴处理类


class PartnersController extends Controller{

	/**
     * 构造方法初始化操作类
     */
    public function __construct()
    {
      parent::__construct();
      if(empty($this->model)) $this->model=new Partners();
    }



	/**
	 * 获取业务伙伴列表
	 * @param Request $request
	 * @return  string   返回json
	 * @author  liming
	 */
    public function  select(Request $request)
    {
    	//过滤,判断并提取所有的参数
        $input=$request->all();
        //id判断
        if(empty($input['is_vendor']) && empty($input['is_customer'])) TEA('703','id');

        if (isset($input['is_vendor'])  &&  $input['is_vendor'] == 1) 
        {
        	//查找供应商列表
      		$obj_list=$this->model->getVendorsList($input);
        }

        if (isset($input['is_customer'])  &&  $input['is_customer'] == 1) {
        	//查找客户列表
      		$obj_list=$this->model->getCustomersList($input);
        }

       
        $response=get_api_response('200');
        $response['results']=$obj_list;
        return  response()->json($response);
    }

    /**
     * 业务伙伴查询某条记录
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
        $response['results']=$this->model->get($id);
        return  response()->json($response);
    }



}
