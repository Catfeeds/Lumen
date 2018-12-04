<?php
/**
 * @message
 * @author  liming
 * @time    2018年 9月 1日
 */    
    

namespace App\Http\Controllers\Mes;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Http\Models\Units;

class UnitController extends Controller{

    public function __construct()
    {
        parent::__construct();
        if(!$this->model) $this->model = new Units();
    }


    /**
     * 检测唯一性
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


    /**
     * 添加单位
     * @param Request $request
     * @return json
     * @author ming.li
     */
    public function store(Request $request){
        $input = $request->all();
        trim_strings($input);
        $this->model->checkFormField($input);
        $insert_id = $this->model->add($input);
        return response()->json(get_success_api_response($insert_id));
    }


    /**
     * 单位分页列表
     * @param Request $request
     * @author ming.li
     */
    public function pageIndex(Request $request){
        $input = $request->all();
        trim_strings($input);
        $this->checkPageParams($input);
        $obj_list = $this->model->getUnitListByPage($input);
        $paging = $this->getPagingResponse($input);
        return response()->json(get_success_api_response($obj_list,$paging));
    }

    /**
     * 单位详情
     * @param Request $request
     * @author ming.li
     */
    public function show(Request $request){
        $id = $request->input($this->model->apiPrimaryKey);
        if(empty($id)) TEA('700',$this->model->apiPrimaryKey);
        $obj = $this->model->get($id);
        return response()->json(get_success_api_response($obj));
    }

    /**
     * 单位select列表
     * @author ming.li
     */
    public function select(){
        $obj_list = $this->model->select();
        return response()->json(get_success_api_response($obj_list));
    }


    /**
     * 修改单位
     * @param Request $request
     * @author ming.li
     */
    public function update(Request $request){
        $input = $request->all();
        trim_strings($input);
        if(empty($input[$this->model->apiPrimaryKey])) TEA('700',$this->model->apiPrimaryKey);
        $this->model->checkFormField($input);
        $this->model->update($input);
        return response()->json(get_success_api_response($input[$this->model->apiPrimaryKey]));
    }


    /**
     * 删除单位
     * @param Request $request
     * @author ming.li
     */
    public function delete(Request $request){
        $id = $request->input($this->model->apiPrimaryKey);
        if(empty($id)) TEA('700',$this->model->apiPrimaryKey);
        $has = $this->model->isExisted([['company_id','=',$id]],config('alias.rf'));
        if($has) TEA('1102');
        $this->model->delete($id);
        return response()->json(get_success_api_response($id));
    }

}