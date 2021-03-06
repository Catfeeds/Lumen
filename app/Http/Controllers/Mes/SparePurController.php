<?php 
/**
 * 模板管理器
 * @author  liming
 * @time    2018年5月23日
 */
namespace App\Http\Controllers\Mes;//定义命名空间
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Libraries\Tree;//引入无限极分类操作类
use App\Http\Models\SparePur;
use App\Http\Models\SparePurItem;


class SparePurController extends Controller{

    /**
     * 构造方法初始化操作类
     */
    public function __construct()
    {
      parent::__construct();
      if(empty($this->model)) $this->model =new SparePur();
      if(empty($this->instoreitem)) $this->instoreitem =new SparePurItem();
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
        if(empty($input['code'])) TEA('8301','code');
        if(!preg_match('/^[A-Z]{1,10}+$/',$input['code'])) TEA('8302','code');

        if( mb_strlen($input['remark'])>500)  TEA('8303','remark');
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
        $response['results']=['purchase_id'=>$insert_id];
        return  response()->json($response);
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
    public function  pageIndex(Request $request)
    {
        //过滤,判断并提取所有的参数
        $input=$request->all();
        // 获取列表信息
        $obj_list=$this->model->getPageList($input);
        //获取返回值
        $paging=$this->getPagingResponse($input);
        $paging['total_records'] = $obj_list->total_count;
        return  response()->json(get_success_api_response($obj_list,$paging));
    }


    /**
     * 查看某条信息
     * @param   \Illuminate\Http\Request  $request   Request实例
     * @return  string  返回json
     * @author  liming
     */
    public function show(Request $request)
    {

        //判断ID是否提交
        $id=$request->input('id');
        if(empty($id)|| !is_numeric($id)) TEA('703','id');

         // 获取单个信息
        $obj_list=$this->model->getOneSpare($id);

        //呼叫M层进行处理
        $response=get_api_response('200');
        $response['results']=$obj_list;
        return  response()->json(get_success_api_response($response));
    }


    /**
     * 获取列表
     * @param Request $request
     * @return  string   返回json
     * @author  liming
     */
    public function  select(Request $request)
    {
        //过滤,判断并提取所有的参数
        $input=$request->all();
        $obj_list=$this->model->getList($input);
        $response=get_api_response('200');
        $response['results']=$obj_list;
        return  response()->json($response);
    }


    /**
     * 编辑
     * @param  \Illuminate\Http\Request  $request  Request实例
     * @return  \Illuminate\Http\JsonResponse     返回json格式
     * @author liming 
     */
    public function update(Request $request)
    {
        //过滤,判断并提取所有的参数
        $input=$request->all();
        //id判断
        if(empty($input['id']) || !is_numeric($input['id'])) TEA('703','id');

        //集中营判断
        $this->checkFormFields($input);
        //呼叫M层进行处理
        $this->model->update($input);
        //获取返回值
        $response=get_api_response('200');
        $response['results']=['receive_order_id'=>$input['id']];
        return  response()->json($response);
    }


    /**
     * 删除
     * @param Request $request
     * @return string  返回json字符串
     * @author liming
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
     * 反审
     * @param Request $request
     * @return  string  返回json
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
        $this->model->noaudit($input);
        //拼接返回值
        $response=get_api_response('200');
        $response['results']=['order_id'=>$input['id']];
        return  response()->json($response);
    }

}