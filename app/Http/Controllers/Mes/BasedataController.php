<?php 
/**
 * 模板管理器
 * @author  liming
 * @time    2017年12月12日
 */

namespace App\Http\Controllers\Mes;//定义命名空间
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Libraries\Tree;//引入无限极分类操作类
use App\Http\Models\Basedatas;//引入仓位处理类


class BasedataController extends Controller
{
	/**
     * 构造方法初始化操作类
     */
    public function __construct()
    {
      parent::__construct();
      if(empty($this->model)) $this->model=new Basedatas();
    }




    /**
	 * 
	 * @param Request $request
	 * @return  string   返回json
	 * @author  liming
	 */
    public function  employeeshow(Request $request)
    {
    	//过滤,判断并提取所有的参数
        $input=$request->all();
      	$obj_list=$this->model->getEmployeeList($input);
        $response=get_api_response('200');
        $response['results']=$obj_list;
        return  response()->json($response);
    }


    /**
	 * 获取部门列表
	 * @param Request $request
	 * @return  string   返回json
	 * @author  liming
	 */
    public function  departmentshow(Request $request)
    {
    	//过滤,判断并提取所有的参数
        $input=$request->all();
      	$obj_list=$this->model->getDepartmentList($input);
        $response=get_api_response('200');
        $response['results']=$obj_list;
        return  response()->json($response);
    }



    /**
	 * 获取业务伙伴列表
	 * @param Request $request
	 * @return  string   返回json
	 * @author  liming
	 */
    public function  partnerShow(Request $request)
    {
    	//过滤,判断并提取所有的参数
        $input=$request->all();
      	$obj_list=$this->model->getPartnerList($input);
        $response=get_api_response('200');
        $response['results']=$obj_list;
        return  response()->json($response);
    }



    /**
	 * 获取业务伙伴列表(供应商)
	 * @param Request $request
	 * @return  string   返回json
	 * @author  liming
	 */
    public function  vendorShow(Request $request)
    {
    	//过滤,判断并提取所有的参数
        $input=$request->all();
      	$obj_list=$this->model->getVendorList($input);
        $response=get_api_response('200');
        $response['results']=$obj_list;
        return  response()->json($response);
    }


    /**
	 * 获取业务伙伴列表(客户)
	 * @param Request $request
	 * @return  string   返回json
	 * @author  liming
	 */
    public function  customershow(Request $request)
    {
    	//过滤,判断并提取所有的参数
        $input=$request->all();
      	$obj_list=$this->model->getCustomerList($input);
        $response=get_api_response('200');
        $response['results']=$obj_list;
        return  response()->json($response);
    }



    /**
     * 获取入库分类列表
     * @param Request $request
     * @return  string   返回json
     * @author  liming
     */
    public function  instoreCategoryShow(Request $request)
    {
       
        $instorecategory_path=dirname(__FILE__).'/../../../../caches/caches_data/storage_category_instore.cache.php';
        $instorecategorys=include_once ($instorecategory_path);
        $result['code']=200;
        $result['message']='ok';
        $result['results'] = $instorecategorys;
        $response=get_api_response('200');
        return  response()->json($result);
    }


    /**
     * 获取出库分类列表
     * @param Request $request
     * @return  string   返回json
     * @author  liming
     */
    public function  outstoreCategoryShow(Request $request)
    {
        $outstorecategory_path=dirname(__FILE__).'/../../../../caches/caches_data/storage_category_outstore.cache.php';
        $outstorecategorys=include_once ($outstorecategory_path);
        $result['code']=200;
        $result['message']='ok';
        $result['results'] = $outstorecategorys;
        $response=get_api_response('200');
        return  response()->json($result);
    }


    /**
     * 获取仓库树
     * @param Request $request
     * @return  string   返回json
     * @author  liming
     */
    public function  wareHuseTreeShow(Request $request)
    {
     //过滤,判断并提取所有的参数
        $input=$request->all();
        $obj_list=$this->model->getWareHouseTree($input);
        $result['code']=200;
        $result['message']='ok';
        $result['results'] = $obj_list;
        $response=get_api_response('200');
        return  response()->json($result);
    }



     /**
     * 获取仓库树 父节点
     * @param Request $request
     * @return  string   返回json
     * @author  liming
     */
    public function  treeFatherShow(Request $request)
    {
     //过滤,判断并提取所有的参数
        $input=$request->all();
        $obj_list=$this->model->getTreeFathers($input);
        $result['code']=200;
        $result['message']='ok';
        $result['results'] = $obj_list;
        $response=get_api_response('200');
        return  response()->json($result);
    }




}