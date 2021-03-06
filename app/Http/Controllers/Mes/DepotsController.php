<?php 
/**
 * 模板管理器
 * @author  liming
 * @time    2017年10月27日
 */

namespace App\Http\Controllers\Mes;//定义命名空间
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Libraries\Tree;//引入无限极分类操作类
use App\Http\Models\Depots;//引入仓库处理类


class DepotsController extends Controller{

	/**
     * 构造方法初始化操作类
     */
    public function __construct()
    {
      parent::__construct();
      if(empty($this->model)) $this->model=new Depots();
    }

   	/**
     * 添加或者编辑仓库时候进行的提交数据处理
     * @param $input  array 要过滤判断的get/post数组
     * @return void         址传递,不需要返回值
     */
    public function checkFormFields(&$input)
    {
        //过滤
        trim_strings($input);
        //code
        if(empty($input['code'])) TEA('8002','code');
        //name
        if(empty($input['name'])) TEA('8000','name');
        //employee_id
        if(!isset($input['employee_id']) || !is_numeric($input['employee_id']))  TEA('730','employee_id');

        //plant_id
        if(!isset($input['plant_id']) || !is_numeric($input['plant_id']))  TEA('736','plant_id');
        
        //department_id
        if(!isset($input['department_id']) || !is_numeric($input['department_id']))  TEA('731','department_id');
      
        if(!isset($input['remark'])) TEA('732','remark');
        if( mb_strlen($input['remark'])>500)  TEA('8009','remark');

        if(!isset($input['address'])) TEA('733','address');
        if( mb_strlen($input['address'])>500)  TEA('8003','address');
        
        // //ismanage
        // if(!isset($input['ismanage']) || !is_numeric($input['ismanage']))  TEA('732','ismanage');

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
     * 所有字段检测唯一性
     * @param Request $request
     * @return string  返回json
     * @throws \App\Exceptions\ApiException
     */
    public  function unique(Request $request)
    {
        //获取参数并过滤
        $input=$request->all();
        trim_strings($input);
        $where=$this->getUniqueExistWhere($input);
        $input['has']=$this->model->isExisted($where);
        //拼接返回值
        $results=$this->getUniqueResponse($input);
        return  response()->json(get_success_api_response($results));
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
      	$obj_list=$this->model->getDepotsList($input);
        $response=get_api_response('200');
        $response['results']=$obj_list;
        return  response()->json($response);
    }



    /**
     * 添加仓库
     * @return   string   json
     * @author   liming
     */
    public function store(Request  $request)
    {
            //过滤,判断并提取所有的参数
            $input=$request->all();
            //检测参数
            $this->checkFormFields($input);
            //呼叫M层进行处理
            $insert_id=$this->model->add($input);
            $response=get_api_response('200');
            $response['results']=['depot_id'=>$insert_id];
            return  response()->json($response);
    }

    /**
     * 编辑仓库
     * @param Request $request
     * @return  string  返回json
     * @author  sam.shan  <sam.shan@ruis-ims.cn>
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
        $response['results']=['depot_id'=>$input['id']];
        return  response()->json($response);
    }


    /**
     * 仓库删除
     * @param Request $request
     * @return string  返回json字符串
     * @author sam.shan  <sam.shan@ruis-ims.cn>
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
     * 仓库查询某条记录
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
        $obj_list=$this->model->get($id);
        $response['results']= $obj_list; 
        return  response()->json($response);
    }





}