<?php
/**
 * Created by PhpStorm.
 * User: ruiyanchao
 * Date: 2018/1/4
 * Time: 上午9:43
 */
namespace App\Http\Controllers\Mes;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Http\Models\ManufactureBom;

/**
 *BOM控制器
 *@author    rick
 */
class ManufactureBomController extends Controller
{
    public function __construct()
    {
        parent::__construct();
        if (empty($this->model)) $this->model = new ManufactureBom();
    }
    //region 查
    /**
     * 获取BOM列表[需要传递分页参数]
     * @param Request $request
     * @return  \Illuminate\Http\Response
     * @author   rick
     */
    public function  pageIndex(Request $request)
    {
        $input=$request->all();
        //trim过滤一下参数
        trim_strings($input);
        //获取数据
        $obj_list=$this->model->getProductBomList($input);
        //获取返回值
        $paging=$this->getPagingResponse($input);
        return  response()->json(get_success_api_response($obj_list,$paging));
    }

    /**
     * 查看详情
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

    //endregion

    //region 增
    /**
     * 制造BOM添加
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @author   rick
     * @reviser  sam.shan <sam.shan@ruis-ims.cn>
     */
    public function store(Request $request)
    {
        //获取所有参数
        $input=$request->all();
        //呼叫M层进行处理
        $insert_id=$this->model->add($input);
        //获取返回值
        $results=['manufacture_bom_id'=>$insert_id];
        return  response()->json(get_success_api_response($results));
    }
    //endregion


    //region 删
    /**
     * 删除
     * @param  \Illuminate\Http\Request  $request  Request实例
     * @return  string    返回json格式
     * @author   sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function destroy(Request $request)
    {
        $input=$request->all();
        //呼叫M层进行处理
        $result = $this->model->destroy($input);
        //获取返回值
        return  response()->json(get_success_api_response($result));
    }
    //endregion


    public function update(Request $request)
    {
        //获取所有参数
        $input=$request->all();
        //呼叫M层进行处理
        $this->model->update($input);
        //获取返回值
        $results=[$this->model->apiPrimaryKey=>$input[$this->model->apiPrimaryKey]];
        return  response()->json(get_success_api_response($results));
    }

}