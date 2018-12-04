<?php
/**
 * Created by PhpStorm.
 * User: haoziye
 * Date: 2018/3/31
 * Time: 上午10:59
 */
namespace App\Http\Controllers\Sell;

use App\Http\Controllers\Controller;
use App\Http\Models\Sell\Customer;
use Illuminate\Http\Request;

class CustomerController extends Controller{

    public function __construct()
    {
        parent::__construct();
        if(empty($this->model)) $this->model = new Customer();
    }


//region 检

    /**
     * 检测唯一性
     * @param Request $request
     * @return string  返回json
     * @throws \App\Exceptions\ApiException
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

//endregion

//region 增

    /**
     * 添加
     * @param Request $request
     */
    public function store(Request $request){
        $input = $request->all();
        trim_strings($input);
        $this->model->checkFormField($input);
        $insertId = $this->model->store($input);
        return response()->json(get_success_api_response($insertId));
    }

//endregion

//region 查

    /**
     * 分页列表
     * @param Request $request
     */
    public function pageindex(Request $request){
        $input = $request->all();
        $this->checkPageParams($input);
        $obj_list = $this->model->pageIndex($input);
        $paging = $this->getPagingResponse($input);
        return response()->json(get_success_api_response($obj_list,$paging));
    }

    /**
     * 详情
     * @param Request $request
     */
    public function show(Request $request){
        $id = $request->input($this->model->apiPrimaryKey);
        if(empty($id)) TEA('700',$this->model->apiPrimaryKey);
        $obj = $this->model->show($id);
        return response()->json(get_success_api_response($obj));
    }

//endregion

//region 改

    public function update(Request $request){
        $input = $request->all();
        $this->model->checkFormField($input);
        $this->model->update($input);
        return response()->json(get_success_api_response(200));
    }

//endregion

//region 删

    /**
     * 删除
     * @param Request $request
     */
    public function destory(Request $request){
        $id = $request->input($this->model->apiPrimaryKey);
        if(empty($id)) TEA('700',$this->model->apiPrimaryKey);
        $has = $this->model->isExisted([['customer_id','=',$id]],config('alias.rso'));
        if($has) TEA('1182');
        $this->model->destory($id);
        return response()->json(get_success_api_response(200));
    }

//endregion

}