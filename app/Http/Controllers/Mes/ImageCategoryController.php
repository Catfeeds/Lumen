<?php
/**
 * Created by PhpStorm.
 * User: haoziye
 * Date: 2018/1/16
 * Time: 下午2:07
 */
namespace App\Http\Controllers\Mes;

use App\Exceptions\ApiException;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Http\Models\ImageCategory;

class ImageCategoryController extends Controller{

    public function __construct()
    {
        parent::__construct();
        if(empty($this->model)) $this->model = new ImageCategory();
    }

//region 增

    /**
     * 添加图纸模块
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     * @throws \Exception
     * @throws \Illuminate\Container\EntryNotFoundException
     * @author hao.wei <weihao>
     */
    public function store(Request $request){
        $input = $request->all();
        $this->model->checkFormField($input);
        $insert_id = $this->model->add($input);
        return response()->json(get_success_api_response($insert_id));
    }

    /**
     * 添加时候的检测唯一性
     * @throws ApiException
     */
    public function unique(Request $request){
        //获取参数并过滤
        $input=$request->all();
        trim_strings($input);
        $where=$this->getUniqueExistWhere($input);
        $input['has']=$this->model->isExisted($where);
        //拼接返回值
        $results=$this->getUniqueResponse($input);
        return  response()->json(get_success_api_response($results));
    }

//endRegion

//region 查

    /**
     * 查找图纸模块信息
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws ApiException
     * @author hao.wei <weihao>
     */
    public function show(Request $request){
        $id = $request->input($this->model->apiPrimaryKey);
        if(empty($id) || !is_numeric($id)) TEA('700',$this->model->apiPrimaryKey);
        $obj = $this->model->get($id);
        return response()->json(get_success_api_response($obj));
    }

    /**
     * 图纸模块分页列表
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws ApiException
     * @author hao.wei <weihao>
     */
    public function pageIndex(Request $request){
        $input = $request->all();
        trim_strings($input);
        $this->checkPageParams($input);
        $obj_list = $this->model->getImageCategoryListByPage($input);
        $paging = $this->getPagingResponse($input);
        return response()->json(get_success_api_response($obj_list,$paging));
    }

    /**
     * 获取select列表
     * @return \Illuminate\Http\JsonResponse
     * @author hao.wei <weihao>
     */
    public function select(){
        $obj_list = $this->model->getImageCategoryList();
        return response()->json(get_success_api_response($obj_list));
    }

//endregion

//region 改

    /**
     * 更新图纸模块信息
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws ApiException
     * @throws \Exception
     * @throws \Illuminate\Container\EntryNotFoundException
     * @author hao.wei <weihao>
     */
    public function update(Request $request){
        $input = $request->all();
        if(empty($input[$this->model->apiPrimaryKey]) || !is_numeric($input[$this->model->apiPrimaryKey])) TEA('700',$this->model->apiPrimaryKey);
        $has = $this->model->isExisted([[$this->model->primaryKey,'=',$input[$this->model->apiPrimaryKey]]]);
        if(!$has) TEA('700',$this->model->apiPrimaryKey);
        $this->model->checkFormField($input);
        $this->model->update($input);
        return response()->json(get_success_api_response($input[$this->model->apiPrimaryKey]));
    }

//endregion

//region 删

    /**
     * 删除图纸模块
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws ApiException
     * @throws \Exception
     * @author hao.wei <weihao>
     */
    public function destroy(Request $request){
        $input = $request->all();
        trim_strings($input);
        if(empty($input[$this->model->apiPrimaryKey]) || !is_numeric($input[$this->model->apiPrimaryKey])) TEA('700',$this->model->apiPrimaryKey);
        $has = $this->model->isExisted([[$this->model->primaryKey,'=',$input[$this->model->apiPrimaryKey]]]);
        if(!$has) TEA('700',$this->model->apiPrimaryKey);
        $has = $this->model->isExisted([['category_id','=',$input[$this->model->apiPrimaryKey]],['status','=',1]],config('alias.rdr'));
        if($has) TEA('1102');
        $this->model->delete($input[$this->model->apiPrimaryKey]);
        return response()->json(get_success_api_response($input[$this->model->apiPrimaryKey]));
    }

//endregion
}