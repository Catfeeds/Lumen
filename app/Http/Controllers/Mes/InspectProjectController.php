<?php 
/**
 * Created by Sublime Text
 * User: liming
 * Date: 2018/2/1
 */

namespace App\Http\Controllers\Mes;//定义命名空间
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Http\Models\QC\InspectObject;
use App\Libraries\Tree;


class InspectProjectController extends Controller
{
	/**
     * 构造方法初始化操作类
     */
    public function __construct()
    {
      parent::__construct();
      if(empty($this->model)) $this->model=new InspectObject();
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
        if(empty($input['code'])) TEA('6508','code');
        if(!preg_match('/^[A-Z]{1,50}+$/',$input['code'])) TEA('6508','code');
        //name
        if(empty($input['name'])) TEA('6509','name');
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
        $response['results']=['object_id'=>$insert_id];
        return  response()->json($response);
    }

    /**
     * 编辑仓库
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
        $response['results']=['depot_id'=>$input['id']];
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
     * 物料分类树形列表
     * @param Request $request
     * @return  string   返回json
     * @author  sam.shan  <san.shan@ruis-ims.cn>
     */
    public function  treeIndex()
    {
        //呼叫M层进行处理
        $obj_list=$this->model->getObjectsList();
        $results=Tree::findDescendants($obj_list);
        return  response()->json(get_success_api_response($results));
    }

}