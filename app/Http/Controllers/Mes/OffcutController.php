<?php 
/**
 * 模板管理器
 * @author  liming
 * @time    2018年9月20日
 */

namespace App\Http\Controllers\Mes;//定义命名空间
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Http\Models\Offcut;//引入处理类
use App\Libraries\Tree;


class OffcutController extends Controller{

	/**
     * 构造方法初始化操作类
     */
    public function __construct()
    {
      parent::__construct();
      if(empty($this->model)) $this->model=new Offcut();
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
        //name
        if(!isset($input['offcut_code'])) TEA('732','offcut_code');
        if(!isset($input['offcut_name'])) TEA('732','offcut_name');
        if(!isset($input['parent_id'])) TEA('732','parent_id');
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
	 * 列表
	 * @param Request $request
	 * @return  string   返回json
	 * @author  liming
	 */
    public function  select(Request $request)
    {
        $input=$request->all();
        //trim过滤一下参数
        trim_strings($input);
        //获取数据
        $obj_list=$this->model->getOffcutList($input);
        $results=Tree::findDescendants($obj_list);
        return  response()->json(get_success_api_response($results));
    }


    /**
     * 添加
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
     * 编辑
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
        //呼叫M层进行处理
        $this->model->update($input);
        //拼接返回值
        $response=get_api_response('200');
        $response['results']=['depot_id'=>$input['id']];
        return  response()->json($response);
    }


    /**
     * 删除
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
        $obj_list=$this->model->get($id);
        $response['results']= $obj_list; 
        return  response()->json($response);
    }

}