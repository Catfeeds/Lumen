<?php

namespace App\Http\Controllers\WorkHour;//定义命名空间

use App\Http\Controllers\Controller;//引入基础控制器类
use Illuminate\Http\Request;//获取请求参数
use App\Http\Models\Operation;
use App\Http\Models\WorkHour;
use Illuminate\Support\Facades\DB;//引入DB操作类



/**
 * 工序控制器
 * Class OperationController
 * @package App\Http\Controllers\Mes
 */
class OperationController extends Controller
{
    protected $model;
    protected $WorkHour;

    public function __construct()
    {
        parent::__construct();
        if (empty($this->model)) $this->model = new Operation();
        if (empty($this->WorkHour)) $this->WorkHour = new WorkHour();
    }



    /**
     * 根据工序获得能力
     * @param Request $request
     * @return  string   返回json
     * @author  liming
     */
    public function  optoability(Request $request)
    {
        //过滤,判断并提取所有的参数
        $input=$request->all();
        $obj_list=$this->model->getAbilitysByOperation($input);
        $response=get_api_response('200');
        $response['results']=$obj_list;
        return  response()->json($response);
    }


    /**
     * 获取列表
     * @param Request $request
     * @return  string   返回json
     * @author  liming
     */
    public function  select(Request $request)
    {
        //过滤,判断并提取所有的参数
        $input=$request->all();
        $obj_list=$this->model->getOperationList($input);
        $response=get_api_response('200');
        $response['results']=$obj_list;
        return  response()->json($response);
    }



    /**
     * 检测唯一性
     */
    public function unique(Request $request)
    {
        //获取参数并过滤
        $input = $request->all();
        trim_strings($input);
        $where = $this->getUniqueExistWhere($input);
        $input['has'] = $this->model->isExisted($where);
        //拼接返回值
        $results = $this->getUniqueResponse($input);
        return response()->json(get_success_api_response($results));
    }

    /**
     * 添加工序
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $input = $request->all();
        //检测字段
        $this->model->checkFields($input);
        try {
             //开启事务
             DB::connection()->beginTransaction();

             //插入数据
             $insert_id = $this->model->store($input);


            //同时添加工时设置
            //能力非必传 Modify By Bruce.Chu On 2018-11-27
            if (!empty($input['ability_id']))   $sign = $this->WorkHour->storOperationSetting($input, $insert_id);

       }catch(\ApiException $e){
                //回滚
                DB::connection()->rollBack();
                TEA($e->getCode());
       }
       //提交事务
       DB::connection()->commit();

  
        $results = ['operation_id' => $insert_id];
        return response()->json(get_success_api_response($results));
    }


    /**
     * 同步
     */
    public function fit(Request $request)
    {
        $sign = $this->WorkHour->fitSetting();
        return response()->json(get_api_response(200));
    }

    /**
     * 检查能力是否被使用
     * @param Request $request
     * @return
     * @author
     */
    public function abilityHasUsed(Request $request){
        $input=$request->all();
        $results=$this->model->abilityHasUsed($input);
        return get_success_api_response($results);
    }

    /**
     * 检查能力是否被使用
     * @param Request $request
     * @return
     * @author
     */
    public function practiceFieldsHasUsed(Request $request){
        $input=$request->all();
        $results=$this->model->practiceFieldsHasUsed($input);
        return get_success_api_response($results);
    }

    /**
     * 修改工序
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     * @throws \Illuminate\Container\EntryNotFoundException
     */
    public function update(Request $request)
    {
        $input = $request->all();
        //检测字段
        $this->model->checkFields($input);

        //更新工时设置 一致性
        $sign = $this->WorkHour->updateOperationSetting($input);

        //更新数据
        $operation_id = $this->model->update($input);

        $results = ['operation_id' => $operation_id];
        return response()->json(get_success_api_response($results));
    }

    /**
     * 删除工序
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function destroy(Request $request)
    {
        $input = $request->all();

         //删除工序
         $this->model->destroy($input);

         //删除工时设置 
         $sign = $this->WorkHour->delOperationSetting($input['operation_id']);


         return response()->json(get_success_api_response(['operation_id'=>$input['operation_id']]));
    }

    /**
     * 获取工序列表
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    //#minxin20180316
    public function index(Request $request)
    {
        $input = $request->all();
        //$input  {page_no:"1",page_size:"50",_token:"8b5491b17a70e24107c89f37b1036078"}
        //return response()->json($input);
        $results = $this->model->index($input);
        //return response()->json($results);
        return response()->json(get_success_api_response($results));
    }

    /**
     * 获取全部工序
     * @return \Illuminate\Http\JsonResponse
     */
    public function AllIndex()
    {
        $results = $this->model->AllIndex();
        return response()->json(get_success_api_response($results));
    }

    /**
     * 查看工序
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(Request $request)
    {
        $input = $request->all();
        $results = $this->model->show($input);
        return response()->json(get_success_api_response($results));
    }

    /**
     * 物料分类与工序关联
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function operationMaterialCategory(Request $request)
    {
        $input = $request->all();
        $result = $this->model->operationMaterialCategory($input);
        return response()->json(get_success_api_response(200));
    }

    /**
     * 根据物料分类获取已关联的工序
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getOperationMaterialCategory(Request $request)
    {
        $input = $request->all();
        $results = $this->model->getOperationMaterialCategory($input);
        return response()->json(get_success_api_response($results));
    }

    /**
     * 添加工序关系
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function relationStore(Request $request)
    {
        $input = $request->all();

        $insert_id = $this->model->relationStore($input);
        $results = ['relation_id' => $insert_id];
        return response()->json(get_success_api_response($results));
    }

    /**
     * 修改工序关系
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function relationUpdate(Request $request)
    {
        $input = $request->all();
        $result = $this->model->relationUpdate($input);
        return response()->json(get_api_response(200));
    }

    /**
     * 获取维护关系列表
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function relationIndex(Request $request)
    {
        $input = $request->all();
        $results = $this->model->relationIndex($input);
        return response()->json(get_success_api_response($results));
    }

    /**
     * 删除维护关系
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function relationDestroy(Request $request)
    {
        $input = $request->all();
        //删除维护关系
        $result = $this->model->relationDestroy($input);
        return response()->json(get_api_response(200));
    }

    /**
     * 查看维护关系
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function relationShow(Request $request)
    {
        $input = $request->all();
        $results = $this->model->relationShow($input);
        return response()->json(get_success_api_response($results));
    }

    /**
     * 物料编码获取工序列表
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getOperationsByMaterialNo(Request $request)
    {
        $input = $request->all();
        $results = $this->model->getOperationsByMaterialNo($input);
        return response()->json(get_success_api_response($results));
    }

    /**
     * 条件获取工序列表
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getOperations(Request $request)
    {
        $input = $request->all();
        $results = $this->model->getOperations($input);
        return response()->json(get_success_api_response($results));
    }

    /**
     * 获取能力列表(已弃用)
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getAbilitys(Request $request)
    {
        $input = $request->all();
        $results = $this->model->getAbilitys($input);
        $paging = $this->getPagingResponse($input);
        return response()->json(get_success_api_response($results, $paging));
    }

//region 能力
    //add by minxin20180320 初始化能力表;
    /*
     * 初始化能力表,同步更新ruis_ie_operation_ability表
     */
    public function initAbilities()
    {
        //model  Operation调用initAbilities()开始初始化;
        $results = $this->model->initAbilities();
        return response()->json(get_success_api_response($results));
    }

    /*
     * 获取能力表;
     *
     * */
    public function getAbilities(Request $request)
    {
        $input = $request->all();
        $results = $this->model->getAbilities($input);
        $paging = $this->getPagingResponse($input);
        return response()->json(get_success_api_response($results, $paging));
    }

    /*
     * 添加能力
     * @param mix
     * @return int
     * create by minxin 20180321
     * */
    public function createAbility(Request $request)
    {
        $input = $request->all();
        //检测字段
        $this->model->checkAbilityFields($input);
        //进行添加
        $results = $this->model->createAbility($input);
        return response()->json(get_success_api_response($results));
    }


    /*
     * 查看能力
     * @param mix
     * @return int
     * create by minxin 20180321
     * */
    public function displayAbility(Request $request)
    {
        $input = $request->all();
        //进行添加
        $results = $this->model->displayAbility($input);
        return response()->json(get_success_api_response($results));
    }

    /*
     * 删除能力
     * @param mix
     * @return int
     * create by minxin 20180321
     * */
    public function deleteAbility(Request $request)
    {
        $input = $request->all();
        $results = $this->model->deleteAbility($input);
        return response()->json(get_success_api_response($results));
    }

    /*
     * 修改能力
     * @param mix
     * @return int
     * create by minxin 20180321
     * */
    public function updateAbility(Request $request)
    {
        $input = $request->all();
        //检测字段
        $this->model->checkAbilityFields($input);
        //进行添加
        $results = $this->model->updateAbility($input);
        return response()->json(get_success_api_response($results));
    }

    /**
     * 检查能力的名字/编码唯一性
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function checkUnique(Request $request)
    {
        //获取参数并过滤
        $input = $request->all();

        $where = $this->getUniqueExistWhere($input);
        $where[] = ['deleted', '=', 0];
        $input['has'] = $this->model->checkUnique($where);
        //拼接返回值
        $results = $this->getUniqueResponse($input);
        return response()->json(get_success_api_response($results));
    }


    /**
     * 获取所有工序不带能力
     * @param Request $request
     */
    public function getAllOperation(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        $this->checkPageParams($input);
        $obj_list = $this->model->getOperationListByPage($input);
        $paging = $this->getPagingResponse($input);
        return response()->json(get_success_api_response($obj_list, $paging));
    }

    /**根据工序id获取能力
     * @param Request $request
     * @return
     * @author
     */
    public function getAbilitiesByOperation(Request $request)
    {
        $input=$request->all();
        $results=$this->model->getAbilitiesByOperation($input);
        return get_success_api_response($results);
    }

    /**
     * 根据工序获取已关联的物料分类
     * @param Request $request
     */
    public function getMaterialCategoryByOperation(Request $request){
        $operationId = $request->input('operation_id');
        if(empty($operationId) || !is_numeric($operationId)) TEA('700','operationId');
        $obj_list = $this->model->getMaterialCategoryByOperation($operationId);
        return response()->json(get_success_api_response($obj_list));
    }

    /**
     * 获取所有工序和工序下的步骤
     */
    public function getAllOperationAndStep(Request $request){
        $input = $request->all();
        $this->checkPageParams($input);
        $obj_list = $this->model->getAllOperationAndStep($input);
        $paging = $this->getPagingResponse($input);
        return response()->json(get_success_api_response($obj_list,$paging));
    }

}
