<?php
/**
 * File : ImageAttributeDefinitionController.php
 * Desc : 图纸属性定义
 * Time : 2018/3/29 14:33
 * Create by Lester You.
 */

namespace App\Http\Controllers\Mes;

use App\Http\Controllers\Controller;
use App\Http\Models\ImageAttributeDefinition;
use Illuminate\Http\Request;

class ImageAttributeDefinitionController extends Controller
{
    public function __construct()
    {
        parent::__construct();
        if (empty($this->model)) $this->model = new ImageAttributeDefinition();
    }

    //region 检

    /**
     * 唯一性检测
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function unique(Request $request)
    {
        //获取参数并过滤
        $input = $request->all();
        trim_strings($input);
        $where = $this->getUniqueExistWhere($input);
        if (!empty($input['category_id'])) $where[] = ['category_id', '=', $input['category_id']];
        $input['has'] = $this->model->isExisted($where);
        //拼接返回值
        $results = $this->getUniqueResponse($input);
        return response()->json(get_success_api_response($results));
    }
    //endregion

    //region 增

    /**
     * 添加图纸属性定义
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     * @throws \Illuminate\Container\EntryNotFoundException
     */
    public function store(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        $this->model->checkFormField($input);
        $insert_id = $this->model->store($input);
        return response()->json(get_success_api_response($insert_id));
    }

    //endregion

    //region 删
    /**
     * 删除图纸属性定义
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function delete(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        $this->model->delete($input);
        return response()->json(get_success_api_response($input[$this->model->apiPrimaryKey]));
    }
    //endregion

//region 改
    /**
     * 更改图纸属性定义
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     * @throws \Illuminate\Container\EntryNotFoundException
     */
    public function update(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        $this->model->checkFormField($input);
        if (empty($input[$this->model->apiPrimaryKey]) || !is_numeric($input[$this->model->apiPrimaryKey])) TEA('700', $this->model->apiPrimaryKey);
        $has = $this->model->isExisted([[$this->model->primaryKey, '=', $input[$this->model->apiPrimaryKey]]]);
        if (!$has) TEA('700', $this->model->apiPrimaryKey);
        $this->model->checkFormField($input);
        $this->model->update($input);
        return response()->json(get_success_api_response($input[$this->model->apiPrimaryKey]));
    }
//endregion

//region 查
    /**
     * 根据分类查询所有的属性（不分页）
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function selectAll(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        $obj_list = $this->model->selectAllByCategory($input);
        return response()->json(get_success_api_response($obj_list));
    }

    /**
     * 根据分类查询所有的属性（分页）
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function selectPage(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        $this->checkPageParams($input);
        $obj_list = $this->model->selectPagesByCategory($input);
        $paging = $this->getPagingResponse($input);
        return response()->json(get_success_api_response($obj_list,$paging));
    }

    /**
     * 根据id获取某一条属性定义
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function selectOne(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        if(empty($input[$this->model->apiPrimaryKey])) TEA('700', $this->model->apiPrimaryKey);
        $obj = $this->model->selectOne($input[$this->model->apiPrimaryKey]);
        return response()->json(get_success_api_response($obj));
    }
//endregion
}