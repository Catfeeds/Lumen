<?php
/**
 * Created by PhpStorm.
 * User: haoziye
 * Date: 2018/2/2
 * Time: 上午11:32
 */

namespace App\Http\Controllers\Mes;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Http\Models\Company;

class CompanyController extends Controller{

    public function __construct()
    {
        parent::__construct();
        if(!$this->model) $this->model = new Company();
    }

//region 检

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

//endregion
//region 增

    /**
     * 添加公司
     * @param Request $request
     * @return json
     * @author hao.wei <weihao>
     */
    public function store(Request $request){
        $input = $request->all();
        trim_strings($input);
        $this->model->checkFormField($input);
        $insert_id = $this->model->add($input);
        return response()->json(get_success_api_response($insert_id));
    }

//endregion

//region 查

    /**
     * 公司分页列表
     * @param Request $request
     * @author hao.wei <weihao>
     */
    public function pageIndex(Request $request){
        $input = $request->all();
        trim_strings($input);
        $this->checkPageParams($input);
        $obj_list = $this->model->getCompanyListByPage($input);
        $paging = $this->getPagingResponse($input);
        return response()->json(get_success_api_response($obj_list,$paging));
    }

    /**
     * 公司详情
     * @param Request $request
     * @author hao.wei <weihao>
     */
    public function show(Request $request){
        $id = $request->input($this->model->apiPrimaryKey);
        if(empty($id)) TEA('700',$this->model->apiPrimaryKey);
        $obj = $this->model->get($id);
        return response()->json(get_success_api_response($obj));
    }

    /**
     * 公司select列表
     * @author hao.wei <weihao>
     */
    public function select(){
        $obj_list = $this->model->select();
        return response()->json(get_success_api_response($obj_list));
    }

    public function contrySelect(){
        $obj_list = $this->model->contrySelect();
        return response()->json(get_success_api_response($obj_list));
    }

    /**
     * 查找当前用户公司(超管能看到所有公司，普通管理员不行)
     * @author hao.wei <weihao>
     */
    public function getCurrentAdminCompany(){
        $company = $this->model->select();
        return response()->json(get_success_api_response($company));
    }
//endregion

//region 改

    /**
     * 修改公司
     * @param Request $request
     * @author hao.wei <weihao>
     */
    public function update(Request $request){
        $input = $request->all();
        trim_strings($input);
        if(empty($input[$this->model->apiPrimaryKey])) TEA('700',$this->model->apiPrimaryKey);
        $this->model->checkFormField($input);
        $this->model->update($input);
        return response()->json(get_success_api_response($input[$this->model->apiPrimaryKey]));
    }

//endregion

//region

    /**
     * 删除公司
     * @param Request $request
     * @author hao.wei <weihao>
     */
    public function delete(Request $request){
        $id = $request->input($this->model->apiPrimaryKey);
        if(empty($id)) TEA('700',$this->model->apiPrimaryKey);
        $has = $this->model->isExisted([['company_id','=',$id]],config('alias.rf'));
        if($has) TEA('1102');
        $this->model->delete($id);
        return response()->json(get_success_api_response($id));
    }

//endregion
}