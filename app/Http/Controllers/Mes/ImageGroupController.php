<?php
/**
 * Created by PhpStorm.
 * User: haoziye
 * Date: 2018/1/17
 * Time: 下午5:23
 */

namespace App\Http\Controllers\Mes;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Http\Models\ImageGroup;

class ImageGroupController extends Controller
{

    public function __construct()
    {
        parent::__construct();
        if (empty($this->model)) $this->model = new ImageGroup();
    }

//region 增


    /**
     * 添加图纸分组
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     * @throws \Illuminate\Container\EntryNotFoundException
     * @author hao.wei <weihao>
     */
    public function store(Request $request)
    {
        $input = $request->all();
        $this->model->checkFormField($input);
        $insert_id = $this->model->add($input);
        return response()->json(get_success_api_response($insert_id));
    }

    /**
     * 添加时候的检测唯一性
     * 如果是检测name,必须要加type_id
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
        //如果是检测name,必须要加上type_id
        if ($input['field'] == 'name') {
            if (empty($input['type_id'])) {
                TEA('700', 'type_id');
            }
            $where[] = ['type_id', '=', $input['type_id']];
        }
        $input['has'] = $this->model->isExisted($where);
        //拼接返回值
        $results = $this->getUniqueResponse($input);
        return response()->json(get_success_api_response($results));
    }

//endregion

//region 查

    /**
     * 图纸分组详情
     * @param request
     * @return json
     * @author hao.wei <weihao>
     */
    public function show(Request $request)
    {
        $imageGroup_id = $request->input($this->model->apiPrimaryKey);
        if (empty($imageGroup_id) || !is_numeric($imageGroup_id)) TEA('700', $this->model->apiPrimaryKey);
        $obj = $this->model->get($imageGroup_id);
        return response()->json(get_success_api_response($obj));
    }

    /**
     * 图纸分组分页列表
     * @param $request
     * @return json
     * @author hao.wei <weihao>
     */
    public function pageIndex(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        $this->checkPageParams($input);
        $obj_list = $this->model->getImageGroupListByPage($input);
        $paging = $this->getPagingResponse($input);
        return response()->json(get_success_api_response($obj_list, $paging));

    }

    /**
     * 图纸分组select
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     * @author hao.wei <weihao>
     */
    public function select(Request $request)
    {
        $input = $request->all();
        $obj_list = $this->model->getImageGroupList($input);
        return response()->json(get_success_api_response($obj_list));

    }
//endregion

//region 修

    /**
     * 修改图纸分组属性
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     * @throws \Illuminate\Container\EntryNotFoundException
     * @author hao.wei <weihao>
     */
    public function update(Request $request)
    {
        $input = $request->all();
        if (empty($input[$this->model->apiPrimaryKey]) || !is_numeric($input[$this->model->apiPrimaryKey])) TEA('700', $this->model->apiPrimaryKey);
        $has = $this->model->isExisted([[$this->model->primaryKey, '=', $input[$this->model->apiPrimaryKey]]]);
        if (!$has) TEA('700', $this->model->apiPrimaryKey);
        $this->model->checkFormField($input);
        $this->model->update($input);
        return response()->json(get_success_api_response($input[$this->model->apiPrimaryKey]));
    }

//endregion

//region 删

    /**
     * 删除图纸分组
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     * @throws \Illuminate\Container\EntryNotFoundException
     * @author hao.wei <weihao>
     */
    public function destroy(Request $request)
    {
        $input = $request->all();
        if (empty($input[$this->model->apiPrimaryKey]) || !is_numeric($input[$this->model->apiPrimaryKey])) TEA('700', $this->model->apiPrimaryKey);
        $has = $this->model->isExisted([[$this->model->primaryKey, '=', $input[$this->model->apiPrimaryKey]]]);
        if (!$has) TEA('700', $this->model->apiPrimaryKey);
        $admin = session('administrator');
        $creator_id = ($admin) ? $admin->admin_id : 0;
        //检查一下是否有图纸属性含有这个分组
        $has = $this->model->isExisted([['group_id', '=', $input[$this->model->apiPrimaryKey]]], config('alias.rdr'));
        if ($has) TEA('1102');
        $this->model->delete($input[$this->model->apiPrimaryKey]);
        return response()->json(get_success_api_response($input[$this->model->apiPrimaryKey]));
    }

//endregion
}