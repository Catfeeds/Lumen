<?php

namespace App\Http\Controllers\Practice;//定义命名空间

use App\Http\Controllers\Controller;//引入基础控制器类
use Illuminate\Http\Request;//获取请求参数
use App\Http\Models\Practice;

/**
 *做法控制器
 * @author   xin.min 20180411
 */
class PracticeController extends Controller
{

    protected $model;

    public function __construct()
    {
        parent::__construct();
        if (empty($this->model)) $this->model = new Practice();
    }



    /**显示所有做法
     * @param
     * @return
     * @author
     */
    public function index()
    {
        $results = $this->model->index();
        return get_success_api_response($results);
    }

    /**根据做法模板id获取模板所有做法
     * @param Request $request
     * @return
     * @author
     */
    public function indexByOperation(Request $request)
    {
        $input = $request->all();
        $this->model->checkIndexBO($input);
        $results = $this->model->indexByOperation($input);
        return get_success_api_response($results);
    }

    /**
     * 根据做法模板id和查询条件获取模板所有做法
     *
     * @param Request $request
     * @return array
     */
    public function indexByCondition(Request $request)
    {
        $input = $request->all();
        $this->model->checkIndexBC($input);
//        return $input;
        $results = $this->model->indexByCondition($input);
        return get_success_api_response($results);
    }

    /**检查code唯一性
     * @param * @param Request $request
     * @return
     * @author
     */
    public function checkCodeUnique(Request $request)
    {
        $input = $request->all();
        $results = $this->model->checkCodeUnique($input);
        return get_success_api_response($results);
    }


    /**做法关联做法字段
     * @param Request $request
     * @return
     * @author
     */
    public function storeFields(Request $request)
    {
        $input = $request->all();
//        return json_decode($input);
        //检查字段是否正常
        $res = $this->model->checkStoreFields($input);
        if ($res !== true) {
            return $res;
        }
        $results = $this->model->storeFields($input);
        return get_success_api_response($results);
    }

    /**检查做法是否已被bom使用
     * @param Request $request
     * @return
     * @author
     */
    public function hasUsed(Request $request)
    {
        $input = $request->all();
        $results = $this->model->hasUsed($input);
        return get_success_api_response($results);
    }

    /**做法更新做法字段
     * @param Request $request
     * @return
     * @author
     */
    public function updateFields(Request $request)
    {
        $input = $request->all();
//        $this->model->checkUpdateFields($input);
        //检查字段是否正常(和新增一样);
        $res = $this->model->checkStoreFields($input);
        if ($res !== true) {
            return $res;
        }
        $results = $this->model->updateFields($input);
        return get_success_api_response($results);
    }

    /**新增一条做法字段到做法里面;
     * @param Request $request
     * @return
     * @author
     */
    public function addAFields(Request $request)
    {
        $input = $request->all();
        $this->model->checkAddAFields($input);
        $results = $this->model->addAFields($input);
        return get_success_api_response($results);
    }

    /**显示做法里面的所有做法字段(给bom用;)
     * @param Request $request
     * @return
     * @author
     */
    public function displayFields(Request $request)
    {
        $input = $request->all();
        $results = $this->model->displayFields($input);
        return get_success_api_response($results);
    }

    /**删除做法和做法字段的关联
     * @param Request $request
     * @return
     * @author
     */
    public function deleteFields(Request $request)
    {
        $input = $request->all();
        $results = $this->model->deleteFields($input);
        return get_success_api_response($results);
    }

    /**根据做法id获取基本信息以及所有做法字段信息(步骤);
     * @param $input
     * @return
     * @author 20180413
     */
    public function detailPractice(Request $request)
    {
        $input = $request->all();
        $results = $this->model->detailPractice($input);
        return get_success_api_response($results);
    }

    /**
     * 创建做法和做法的关联
     *
     * @param Request $request
     * @return array|bool
     * @throws \App\Exceptions\ApiException'
     */
    public function storeLine(Request $request)
    {
        $input = $request->all();
        $res = $this->model->checkStoreLine($input);
        if ($res !== true) {
            return $res;
        }
        $results = $this->model->storeLine($input);
        return get_success_api_response($results);
    }

    /**
     * 修改做法线
     *
     * @param Request $request
     * @return array
     * @throws \App\Exceptions\ApiException
     */
    public function editLine(Request $request){
        $input=$request->all();
        $this->model->checkEditLine($input);
        $results=$this->model->editLine($input);
        return get_success_api_response($results);
    }

    /**
     * 删除做法线
     *
     * @param Request $request
     * @return array
     * @throws \App\Exceptions\ApiException
     */
    public function deleteLine(Request $request){
        $input=$request->all();
        $results=$this->model->deleteLine($input);
        return get_success_api_response($results);
    }

    /**根据做法id显示所有做法线和做法线内部数据;
     * @param Request $request
     * @return
     * @author
     */
    public function showLines(Request $request)
    {
        $input = $request->all();
        $results = $this->model->showLines($input);
        return get_success_api_response($results);
    }

    /**根据做法线id查询做法线;
     * @param Request $request
     * @return
     * @author
     */
    public function showALine(Request $request){
        $input=$request->all();
        $this->model->checkLineId($input);
        $results=$this->model->showALine($input);
        return get_success_api_response($results);
    }

    /**获取做法的所有图纸
     * @param Request $request
     * @return
     * @author
     */
    public function showPracticeDraw(Request $request){
        $input=$request->all();
        $result=$this->model->showPracticeDraw($input);
        return get_success_api_response($result);
    }
    public function showPracticeFieldDraw(Request $request){
        $input=$request->all();
        $result=$this->model->showPracticeFieldDraw($input);
        return get_success_api_response($result);
    }
}