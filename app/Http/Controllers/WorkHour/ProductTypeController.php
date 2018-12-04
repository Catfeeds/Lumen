<?php

namespace App\Http\Controllers\WorkHour;


use App\Http\Controllers\Controller;
use App\Http\Models\ProductType;
use Illuminate\Http\Request;

class ProductTypeController extends Controller
{
    protected $model;

    public function __construct()
    {
        parent::__construct();
        empty($this->model) && $this->model = new ProductType();
    }

//region 检

    /**
     * 字段唯一性检测
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function unique(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        $where = $this->getUniqueExistWhere($input);
        if (!empty($input[$this->model->apiPrimaryKey])) $where[] = ['id', '<>', $input[$this->model->apiPrimaryKey]];
        $input['has'] = $this->model->isExisted($where);
        $res = $this->getUniqueResponse($input);
        return response()->json(get_success_api_response($res));
    }
    //endregion

    //region 增

    /**
     * 添加
     *
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
     * 删除
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
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     * @throws \Illuminate\Container\EntryNotFoundException
     */
    public function update(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        if (empty($input[$this->model->apiPrimaryKey]) || !is_numeric($input[$this->model->apiPrimaryKey])) TEA('701', $this->model->apiPrimaryKey);
        $has = $this->model->isExisted([['id', '=', $input[$this->model->apiPrimaryKey]]]);
        if (!$has) TEA('404');
        $this->model->checkFormField($input);
        $this->model->update($input);
        return response()->json(get_success_api_response($input[$this->model->apiPrimaryKey]));
    }
//endregion

    //region 查
    /**
     * 根据分类查询所有的数据（不分页）
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function selectAll(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        $obj_list = $this->model->selectAll($input);
        return response()->json(get_success_api_response($obj_list));
    }

    /**
     * 获取所有的数据（分页）
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function selectPage(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        $this->checkPageParams($input);
        $obj_list = $this->model->selectPage($input);
        $paging = $this->getPagingResponse($input);
        return response()->json(get_success_api_response($obj_list, $paging));
    }

    /**
     * 获取树形结构的数据
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function selectTree(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        $obj_list = $this->model->selectTree($input);
        return response()->json(get_success_api_response($obj_list));
    }

    /**
     * 根据id获取某一条
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function selectOne(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        if (empty($input[$this->model->apiPrimaryKey])) TEA('700', $this->model->apiPrimaryKey);
        $obj = $this->model->selectOne($input[$this->model->apiPrimaryKey]);
        return response()->json(get_success_api_response($obj));
    }
//endregion
}