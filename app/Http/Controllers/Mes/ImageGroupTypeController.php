<?php
/**
 * File : ImageGroupTypeController.php
 * Desc :
 * Time : 2018/3/31 14:19
 * Create by Lester You.
 */

namespace App\Http\Controllers\Mes;


use App\Http\Controllers\Controller;
use App\Http\Models\ImageGroupType;
use Illuminate\Http\Request;

class ImageGroupTypeController extends Controller
{
    public function __construct()
    {
        parent::__construct();
        if (empty($this->model)) $this->model = new ImageGroupType() ;
    }

    //region 增

    /**
     * 唯一性检测('name'和'code',分别检测)
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     * @author lesteryou
     */
    public function unique(Request $request)
    {
        $input=$request->all();
        trim_strings($input);
        $where=$this->getUniqueExistWhere($input);
        $input['has']=$this->model->isExisted($where);
        //拼接返回值
        $results=$this->getUniqueResponse($input);
        return  response()->json(get_success_api_response($results));
    }

    /**
     * 添加数据
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \Exception
     * @throws \App\Exceptions\ApiException
     * @throws \Illuminate\Container\EntryNotFoundException
     * @author lesteryou
     */
    public function store(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        $this->model->checkFormField($input);
        $insert_id = $this->model->add($input);
        return response()->json(get_success_api_response($insert_id));
    }
    //endregion

    //region 删
    /**
     * 根据id删除数据
     * @param Request $request
     * @throws \Exception
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
     * @throws \Exception
     * @throws \App\Exceptions\ApiException
     * @throws \Illuminate\Container\EntryNotFoundException
     */
    public function update(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        $this->model->checkFormField($input);
        $this->model->update($input);
        return response()->json(get_success_api_response($input[$this->model->apiPrimaryKey]));
    }
    //endregion

    //region 查
    /**
     * 获取所有的数据(不分页)
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
     * 获取所有的数据(分页)
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function selectPages(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        $this->checkPageParams($input);
        $obj_list = $this->model->selectPages($input);
        $paging = $this->getPagingResponse($input);
        return response()->json(get_success_api_response($obj_list, $paging));
    }

    /**
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function selectOne(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        if (empty($input[$this->model->apiPrimaryKey])) {
            TEA('700', $this->model->apiPrimaryKey);
        }
        $obj = $this->model->selectOne($input[$this->model->apiPrimaryKey]);
        return response()->json(get_success_api_response($obj));
    }
    //endregion


}