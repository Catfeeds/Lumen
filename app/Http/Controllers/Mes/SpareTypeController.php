<?php 
/**
 * 模板管理器
 * @author  liming
 * @time    2018年3月29日
 */


namespace App\Http\Controllers\Mes;//定义命名空间
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Libraries\Tree;//引入无限极分类操作类
use App\Http\Models\SpareType;


class SpareTypeController extends Controller
{
	/**
     * 构造方法初始化操作类
     */
    public function __construct()
    {
      parent::__construct();
      if(empty($this->model)) $this->model=new SpareType();
    }


    /**
     * 添加或者编辑仓位时候进行的提交数据处理
     * @param $input  array 要过滤判断的get/post数组
     * @return void         址传递,不需要返回值
     */
    public function checkFormFields(&$input)
    {
        //过滤
        trim_strings($input);
        //code
        if(empty($input['code'])) TEA('8202','code');
        if(!preg_match('/^[A-Z]{1,10}+$/',$input['code'])) TEA('8201','code');

        //name
        if(empty($input['name'])) TEA('8200','name');
      
        if(!isset($input['remark'])) TEA('732','remark');
        if( mb_strlen($input['remark'])>500)  TEA('8210','remark');

    }


    /**
     * 添加时候的检测唯一性
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
        $response['results']=['object_id'=>$insert_id];
        return  response()->json($response);
    }

    /**
     * 编辑
     * @param Request $request
     * @return  string  返回json
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
        $response['results']=['object_id'=>$input['id']];
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


    /**
     * 删除
     * @param Request $request
     * @return string  返回json字符串
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
     * 分类树形列表
     * @param Request $request
     * @return  string   返回json
     */
    public function  treeIndex()
    {
        //呼叫M层进行处理
        $obj_list=$this->model->getObjectsList();
        $results=Tree::findDescendants($obj_list);
        return  response()->json(get_success_api_response($results));
    }


}