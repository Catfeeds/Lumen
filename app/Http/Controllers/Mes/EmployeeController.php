<?php
/**
 * Created by PhpStorm.
 * User: ruiyanchao
 * Date: 2018/1/19
 * Time: 下午3:29
 */
namespace App\Http\Controllers\Mes;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Http\Models\Employee;


/**
 *员工
 *@author    rick
 *@reviser  sam.shan <sam.shan@ruis-ims.cn>
 */
class EmployeeController extends Controller
{
    public function __construct()
    {
        parent::__construct();
        if (empty($this->model)) $this->model = new Employee();
    }

    //region 检
    /**
     * 检测唯一性
     * @param Request $request
     * @return string  返回json
     * @throws \App\Exceptions\ApiException
     * @author  rick
     */
    public  function unique(Request $request)
    {
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

    //region 查
    /**
     * 员工列表
     * @param Request $request
     * @return  \Illuminate\Http\Response
     * @author   rick 2018年01月19日18:11:35
     */
    public function  pageIndex(Request $request)
    {
        $input=$request->all();
        //获取数据
        $obj_list=$this->model->getEmployeeList($input);
        //获取返回值
        $paging=$this->getPagingResponse($input);
        return  response()->json(get_success_api_response($obj_list,$paging));
    }

    /**
     * 人员select列表
     * @param Request $request
     */
    public function select(Request $request){
        $input = $request->all();
        $obj_list = $this->model->getEmplyeeSelect($input);
        return response()->json(get_success_api_response($obj_list));
    }

    /**
     * 获取角色下拉框
     * @return \Illuminate\Http\JsonResponse
     */
    public function getRoles(Request $request)
    {
        //获取数据
        $obj_list=$this->model->getRoles();
        return  response()->json(get_success_api_response($obj_list));
    }

    /**
     * 获取部门下拉
     * @return \Illuminate\Http\JsonResponse
     */
    public function getDepartments(Request $request)
    {
        //获取数据
        $obj_list=$this->model->getDepartments();
        return  response()->json(get_success_api_response($obj_list));
    }

    /**
     * 获取岗位下拉
     * @return \Illuminate\Http\JsonResponse
     */
    public function getPositions(Request $request)
    {
        //获取数据
        $obj_list=$this->model->getPositions();
        return  response()->json(get_success_api_response($obj_list));
    }

    /**
     * 获取学历下拉
     * @return \Illuminate\Http\JsonResponse
     */
    public function getEducations(Request $request)
    {
        //获取数据
        $obj_list=config('personnel.education');
        return  response()->json(get_success_api_response($obj_list));
    }


    /**
     * 获取省份下拉
     * @return \Illuminate\Http\JsonResponse
     */
    public function getProvince(Request $request)
    {
        //获取数据
        $tmp =config('personnel.province');
        $i = 0;
        $obj_list = array();
        foreach ($tmp as $key=>$value){
            $obj_list[$i]['id']= $key;
            $obj_list[$i]['name'] = $value;
            $i++;
        }
        return  response()->json(get_success_api_response($obj_list));
    }

    /**
     * 查看物料基础信息
     * @param  \Illuminate\Http\Request  $request  Request实例
     * @return  \Illuminate\Http\JsonResponse     返回json格式
     * @author  sam.shan   <sam.shan@ruis-ims.cn>
     */
    public function show(Request $request)
    {
        //判断ID是否提交
        $id = $request->input($this->model->apiPrimaryKey);
        if(empty($id) || !is_numeric($id)) TEA('700',$this->model->apiPrimaryKey);
        //呼叫M层进行处理
        $results= $this->model->get($id);
        return  response()->json(get_success_api_response($results));
    }
    //endregion

    //region 增
    public function store(Request $request)
    {
        //获取所有参数
        $input=$request->all();
        //呼叫M层进行处理
        $this->model->checkFormField($input);
        $insert_id=$this->model->add($input);
        //获取返回值
        $results=[$this->model->apiPrimaryKey=>$insert_id];
        return  response()->json(get_success_api_response($results));
    }
    //endregion

    //region 改
    public function update(Request $request)
    {
        //获取所有参数
        $input=$request->all();
        //呼叫M层进行处理
        $this->model->checkFormField($input);
        $this->model->update($input);
        //获取返回值
        $results=[$this->model->apiPrimaryKey=>$input[$this->model->apiPrimaryKey]];
        return  response()->json(get_success_api_response($results));
    }
    //endregion

    //region 删
    /**
     * 删除
     * @param  \Illuminate\Http\Request  $request  Request实例
     * @return  string    返回json格式
     * @author   rick
     */
    public function destroy(Request $request)
    {
        //判断ID是否提交
        $id = $request->input($this->model->apiPrimaryKey);
        if(empty($id) || !is_numeric($id)) TEA('700',$this->model->apiPrimaryKey);
        //呼叫M层进行处理
        $this->model->destroy($id);
        //获取返回值
        return  response()->json(get_success_api_response([$this->model->apiPrimaryKey=>$id]));
    }
    //endregion

    /**
     * 导入excel
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function import(Request $request)
    {
        //获取所有参数
        $input = $request->all();
        if(empty($input['data'])) TEA('1118');
        $this->model->importEmplyeeFromExcelData($input);
        return  response()->json(get_success_api_response());

    }

    /**
     *下载Excel模版
     * @author Bruce.Chu
     */
    public function downloadTemplate()
    {
        //联系M层处理
        $this->model->downloadTemplate();
        return  response()->json(get_success_api_response());
    }

}
