<?php


namespace App\Http\Controllers\Mes;

use App\Http\Models\Account\Role;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;


/**
 *角色控制器
 *@author  sam.shan <sam.shan@ruis-ims.cn>
 */
class RoleController extends Controller
{
    public function __construct()
    {
        parent::__construct();
        if (empty($this->model)) $this->model = new Role();
    }

//region  增
    /**
     * 检测唯一性
     * @param Request $request
     * @return string  返回json
     * @throws \App\Exceptions\ApiException
     * @author  sam.shan  <sam.shan@ruis-ims.cn>
     */
    public  function unique(Request $request)
    {
        //获取参数并过滤
        $input=$request->all();
        $where=$this->getUniqueExistWhere($input);
        $input['has']=$this->model->isExisted($where);
        //拼接返回值
        $results=$this->getUniqueResponse($input);
        return  response()->json(get_success_api_response($results));
    }

    /**
     * 添加
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @author  sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function store(Request $request)
    {
        //获取所有参数
        $input=$request->all();
        $this->model->checkFormFields($input);
        //呼叫M层进行处理
        $insert_id=$this->model->add($input);
        //获取返回值
        $results=[$this->model->apiPrimaryKey=>$insert_id];
        return  response()->json(get_success_api_response($results));
    }

//endregion
//region  修
    /**
     * 编辑
     * @param  \Illuminate\Http\Request  $request  Request实例
     * @return  \Illuminate\Http\JsonResponse     返回json格式
     * @author  sam.shan <sam.shan@ruis-ims.cn>
     */
    public function update(Request $request)
    {
        //过滤,判断并提取所有的参数
        $input = $request->all();
        $this->model->checkFormFields($input);
        //呼叫M层进行处理
        $this->model->update($input);
        //获取返回值
        return  response()->json(get_success_api_response([$this->model->apiPrimaryKey=>$input[$this->model->apiPrimaryKey]]));
    }

//endregion
//region  查


    /**
     * 查看
     * @param  \Illuminate\Http\Request  $request  Request实例
     * @return  \Illuminate\Http\JsonResponse     返回json格式
     * @author  sam.shan   <sam.shan@ruis-ims.cn>
     */
    public function show(Request $request)
    {
        //判断ID是否提交
        $id = $request->input($this->model->apiPrimaryKey);
        if(empty($id) || !is_numeric($id)) TEA('700',$this->model->apiPrimaryKey);
        //呼叫M层进行处理
        $results= $this->model->get($id);
        return  response()->json(get_success_api_response($results));
    }

    /**
     * 列表[需要传递分页参数]
     * @param Request $request
     * @return  \Illuminate\Http\Response
     * @author   sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function  pageIndex(Request $request)
    {
        $input=$request->all();
        trim_strings($input);
        //获取数据
        $obj_list=$this->model->getRoleList($input);
        //获取返回值
        $paging=$this->getPagingResponse($input);
        return  response()->json(get_success_api_response($obj_list,$paging));
    }



//endregion
//region  删

    /**
     * 删除
     * @param  \Illuminate\Http\Request  $request  Request实例
     * @return  string    返回json格式
     * @author   sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function destroy(Request $request)
    {
        //判断ID是否提交
        $id = $request->input($this->model->apiPrimaryKey);
        if(empty($id) || !is_numeric($id)) TEA('700',$this->model->apiPrimaryKey);
        //呼叫M层进行处理
        $this->model->destroy($id);
        //获取返回值
        return  response()->json(get_success_api_response([$this->model->apiPrimaryKey=>$id]));
    }

//endregion


//region 分配权限
    /**
     * 列表[需要传递分页参数]
     * @param Request $request
     * @return  \Illuminate\Http\Response
     * @author  sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function  selectedNode(Request $request)
    {
        $role_id=$request->input('role_id');
        if(empty($role_id)) TEA('700','role_id');
        $obj_list=$this->model->getNodesByRole($role_id);

        return  response()->json(get_success_api_response($obj_list));
    }
    /**
     * 保存赋予的节点
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     * @author sam.shan <sam.shan@ruis-ims.cn>
     */
    public function  role2node(Request $request)
    {
        //参数处理
        $input=$request->all();
        trim_strings($input);
        if(empty($input['role_id']))  TEA('700','role_id');
        if(!isset($input['node_ids'])) TEA('700','node_ids');

        $this->model->role2node($input);
        //获取返回值
        return response()->json(get_success_api_response(['node_ids'=>$input['node_ids']]));

    }

//endregion








}