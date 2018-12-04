<?php
/**
 * @message
 * @author  liming
 * @time    2018年 11月 26日
 */    
    
namespace App\Http\Controllers\Mes;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Http\Models\Partner;

class PartnerController extends Controller{

    public function __construct()
    {
        parent::__construct();
        if(!$this->model) $this->model = new Partner();
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
     * 添加往来单位
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
     * 往来单位分页列表
     * @param Request $request
     * @author ming.li
     */
    public function pageIndex(Request $request){
        $input = $request->all();
        trim_strings($input);
        $this->checkPageParams($input);
        $obj_list = $this->model->getPageList($input);
        $paging = $this->getPagingResponse($input);
        return response()->json(get_success_api_response($obj_list,$paging));
    }

    /**
     * 往来单位详情
     * @param Request $request
     * @author ming.li
     */
    public function show(Request $request){
        $id = $request->input('id');
        if(empty($id)) TEA('700','id');
        $obj = $this->model->get($id);
        return response()->json(get_success_api_response($obj));
    }

    /**
     * 往来单位select列表
     * @author ming.li
     */
    public function select(){
        $obj_list = $this->model->select();
        return response()->json(get_success_api_response($obj_list));
    }


    /**
     * 修改往来单位
     * @param Request $request
     * @author ming.li
     */
    public function update(Request $request){
        $input = $request->all();
        trim_strings($input);
        if(empty($input['id'])) TEA('700','id');
        $this->model->checkFormField($input);
        $this->model->update($input);
        return response()->json(get_success_api_response($input['id']));
    }

    /**
     * 删除往来单位
     * @param Request $request
     * @author ming.li
     */
    public function delete(Request $request){
        $id = $request->input('id');
        if(empty($id)) TEA('700','id');
        $this->model->delete($id);
        return response()->json(get_success_api_response($id));
    }



    /**
     * @message 生成登录账号
     * @author  liming
     * @time    2018年 11月 26日
     */    
    public  function  upgradeAadmin(Request $request)  
    {
        $id = $request->input('id');
        if(empty($id)) TEA('700','id');
        $this->model->upgradeAadmin($id);
        return response()->json(get_success_api_response($id));
    }
}