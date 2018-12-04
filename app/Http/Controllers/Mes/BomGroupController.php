<?php
/**
 * Created by PhpStorm.
 * User: rick
 * Date: 2017/12/18
 * Time: 下午2:33
 */

namespace App\Http\Controllers\Mes;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Http\Models\BomGroup;

/**
 *BOMGroup控制器
 *@author    rick
 *@reviser  sam.shan <sam.shan@ruis-ims.cn>
 */
class BomGroupController extends Controller
{
    public function __construct()
    {
        parent::__construct();
        if (empty($this->model)) $this->model = new BomGroup();
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
        //呼叫M层进行处理
        $this->model->update($input);
        //获取返回值
        return  response()->json(get_success_api_response([$this->model->apiPrimaryKey=>$input[$this->model->apiPrimaryKey]]));
    }

//endregion
//region  查

    /**
     * 查看物料基础信息
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
     * select列表
     * @return  \Illuminate\Http\Response
     * @author   sam.shan <sam.shan@ruis-ims.cn>
     */
    public function  select()
    {
        //获取数据
        $obj_list=$this->model->getSelectBomGroupList();
        //获取返回值
        return  response()->json(get_success_api_response($obj_list));
    }


    /**
     * 获取BOMGroup列表[需要传递分页参数]
     * @param Request $request
     * @return  \Illuminate\Http\Response
     * @author   rick
     * @reviser  sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function  pageIndex(Request $request)
    {
        $input=$request->all();
        //获取数据
        $obj_list=$this->model->getBomGroupList($input);
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








}