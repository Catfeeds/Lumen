<?php


namespace App\Http\Controllers\Mes;

use App\Http\Models\Account\Node;
use App\Http\Models\Account\Role;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;



/**
 *权限节点控制器
 *@author  sam.shan <sam.shan@ruis-ims.cn>
 */
class NodeController extends Controller
{
    public function __construct()
    {
        parent::__construct();
        if (empty($this->model)) $this->model = new Node();
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
        trim_strings($input);
        $where=$this->getUniqueExistWhere($input);
        $input['has']=$this->model->isExisted($where);
        //拼接返回值
        $results=$this->getUniqueResponse($input);
        return  response()->json(get_success_api_response($results));
    }

    /**
     * BOMGroup添加
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @author   rick
     * @reviser sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function store(Request $request)
    {
        //获取所有参数
        $input=$request->all();
        //参数检测
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
     * @author  rick
     */
    public function update(Request $request)
    {
        //过滤,判断并提取所有的参数
        $input = $request->all();
        //参数检测
        $this->model->checkFormFields($input);
        //呼叫M层进行处理
        $this->model->update($input);
        //获取返回值
        return  response()->json(get_success_api_response([$this->model->apiPrimaryKey=>$input[$this->model->apiPrimaryKey]]));
    }


    /**
     * 表格编辑
     * @param  \Illuminate\Http\Request  $request  Request实例
     * @return  \Illuminate\Http\JsonResponse     返回json格式
     * @author  rick
     */
    public function tableUpdate(Request $request)
    {
        //过滤,判断并提取所有的参数
        $input = $request->all();
        //参数检测
        trim_strings($input);
        $this->checkTableParams($input);
        $this->model->checkTableUpdate($input);
        //呼叫M层进行处理
        $this->model->tableUpdate($input);
        //获取返回值
        return  response()->json(get_success_api_response([$this->model->apiPrimaryKey=>$input['pk']]));
    }


//endregion
//region  查


    /**
     * 转换搜索参数
     * @param $input
     * @author sam.shan <sam.shan@ruis-ims.cn>
     */
    public function transformSearchParams(&$input)
    {
        //菜单,注意当用户传递某个菜单的时候,我们得连它的子孙后代都抓取进来
        if(!empty($input['menu_id'])){
            $input['menu_ids']=$this->model->getMenuIdsByForefatherId($input['menu_id']);
            //将自己添加进来
            array_unshift($input['menu_ids'],$input['menu_id']);
        }

    }

    /**
     * 列表[需要传递分页参数]
     * @param Request $request
     * @return  \Illuminate\Http\Response
     * @author  sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function  pageIndex(Request $request)
    {
        $input=$request->all();
        //转换一下参数
        $this->transformSearchParams($input);
        //获取数据
        $obj_list=$this->model->getNodeList($input);
        //获取返回值
        $paging=$this->getPagingResponse($input);
        return  response()->json(get_success_api_response($obj_list,$paging));
    }
    /**
     * select列表
     * @param Request $request
     * @return  \Illuminate\Http\Response
     * @author  sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function  select(Request $request)
    {
        $input=$request->all();
        //转换一下参数
        $this->transformSearchParams($input);
        //获取数据
        $obj_list=$this->model->getSelectNodeList($input);
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

//region 赋予角色
    /**
     * 列表[需要传递分页参数]
     * @param Request $request
     * @return  \Illuminate\Http\Response
     * @author  sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function  selectedRole(Request $request)
    {
        $node_id=$request->input('node_id');
        if(empty($node_id)) TEA('700','node_id');
        $obj_list=$this->model->getRolesByNode($node_id);

        return  response()->json(get_success_api_response($obj_list));
    }


    /**
     * 保存赋予的节点
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     * @author sam.shan <sam.shan@ruis-ims.cn>
     */
    public function  node2role(Request $request)
    {
        //参数处理
        $input=$request->all();
        trim_strings($input);
        if(empty($input['node_id']))  TEA('700','node_id');
        if(!isset($input['role_ids'])) TEA('700','role_ids');
        $this->model->node2role($input);
        //获取返回值
        return response()->json(get_success_api_response(['role_ids'=>$input['role_ids']]));

    }

//endregion







}