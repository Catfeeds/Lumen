<?php
/**
 * 客诉控制器
 * Created by PhpStorm.
 * User: xin.min
 * Date: 2018-06-21
 * Time: 10:50
 */
namespace App\Http\Controllers\Qc;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Http\Models\QC\CustomerComplaint;
class CustomerComplaintController extends Controller {
    public $model;
    public function __construct()
    {
        parent::__construct();
        $this->model=new CustomerComplaint();
    }

    /**
     * 显示完成的客诉单
     * @param  Request $request
     * @return
     * @author
     */
    public function displayWholeComplaint(Request $request){
        $input=$request->all();
        $this->model->checkDisplayWholeComplaint($input);
        $results=$this->model->displayWholeComplaint($input);
        return get_success_api_response($results);
    }

    /**
     * 显示所有已发送给qc的客诉单
     * @param
     * @return
     * @author
     */
    public function showAllComplaintToQc(Request $request){
        $input=$request->all();
        $content=$this->model->showAllComplaintToQc($input);
        $page=$this->getPagingResponse($input);
        return get_success_api_response($content,$page);
    }

    /**
     * 显示所有未发送给qc的客诉单
     * @param Request $request
     * @return
     * @author xin.min 20180710
     */
    public function showAllComplaintNotToQc(Request $request){
        $input=$request->all();
        $content=$this->model->showAllComplaintNotToQc($input);
        $page=$this->getPagingResponse($input);
        return get_success_api_response($content,$page);
    }
    /**
     * 发送问题
     * @param Request $request
     * @return
     * @author
     */
    public function sendQuestion(Request $request){
        $input=$request->all();
        $checkResult=$this->model->checkSend($input);
        if($checkResult){
            return get_api_response('700',$checkResult['field'],$checkResult['value']);
        }
        $results=$this->model->sendQuestion($input);
        return get_success_api_response($results);
    }

    /**
     * @提交客诉
     * @author  mingxin
     * @time    年 月 日
     */    
    public function sendToQc(Request $request){
        $input=$request->all();
        $results=$this->model->sendToQc($input);
        return get_success_api_response($results);
    }
  

    /**
     * @完结客诉
     * @author  liming
     * @time    年 月 日
     */    
    public function overComplaint(Request $request){
        $input=$request->all();
        $results=$this->model->overComplaint($input);
        return get_success_api_response($results);
    }
  
    /**
     * @中止客诉单
     * @author  liming
     * @time    年 月 日
     */    
    public function stopComplaint(Request $request){
        $input=$request->all();
        $results=$this->model->stopComplaint($input);
        return get_success_api_response($results);
    }






    /**
     * @message
     * @author  mingxin
     * @time    年 月 日
     */  
    public function storeComplaint(Request $request){
        $input=$request->all();
        $this->model->checkStoreComplaint($input);
        $results=$this->model->storeComplaint($input);
        return get_success_api_response($results);
    }

    /**
     * @message  查看客诉单
     * @author  liming
     * @time    年 月 日
     */  
    public function showComplaint(Request $request){
        //判断ID是否提交
        $id=$request->input('id');
        if(empty($id)|| !is_numeric($id)) TEA('703','id');
        //呼叫M层进行处理
        $response=get_api_response('200');
        $response['results']=$this->model->get($id);
        return  response()->json($response);
    }


     /**
     * @message  编辑客诉单
     * @author  liming
     * @time    年 月 日
     */  
    public  function updateComplaint(Request $request)
    {
        //业务权限判断
        //过滤,判断并提取所有的参数
        $input=$request->all();
        //id判断
        if(empty($input['id']) || !is_numeric($input['id'])) TEA('703','id');
        //呼叫M层进行处理
        $this->model->updateComplaint($input);
        //拼接返回值
        $response=get_api_response('200');
        $response['results']=['id'=>$input['id']];
        return  response()->json($response);
    }


    /**
     * @message  编辑D3
     * @author  liming
     * @time    年 月 日
     */  
    public  function updateD3(Request $request)
    {
        //业务权限判断
        //过滤,判断并提取所有的参数
        $input=$request->all();
        //id判断
        if(empty($input['id']) || !is_numeric($input['id'])) TEA('703','id');
        //呼叫M层进行处理
        $this->model->updateD3($input);
        //拼接返回值
        $response=get_api_response('200');
        $response['results']=['id'=>$input['id']];
        return  response()->json($response);
    }



    public function storeD3(Request $request){
        $input=$request->all();
        $this->model->checkStoreD3($input);
        $results=$this->model->storeD3($input);
        return get_success_api_response($results);
    }

    /**
     * @删除qc
     * @author  liming
     * @param Request $request
     */    
    public  function  deleteComplaint(Request $request)
    {
        //判断ID是否提交
        $id=$request->input('id');
        if(empty($id)|| !is_numeric($id)) TEA('703','id');
        //呼叫M层进行处理
        $this->model->destroy($id);
        $response=get_api_response('200');
        return  response()->json($response);
    }



    /**
     * 填写/修改答案
     * @param Request $request
     * @return
     * @author
     */
    public function storeAnswer(Request $request){
        $input= $request->all();
        $this->model->checkSend($input);
        $results=$this->model->storeAnswer($input);
        return get_success_api_response($results);
    }

    /**
     * 根据客诉单id和D4-D8 的discipline_no展示答案
     * @param Request $request
     * @return
     * @author
     */
    public function detailAnswer(Request $request){
        $input=$request->all();
        $this->model->checkDetailAnswer($input);
        $results=$this->model->detailAnswer($input);
        return get_success_api_response($results);
    }

    /**
     * 查看问题解答
     * @param Request $request
     * @return
     * @author
     */
    public function detailQuestion(Request $request){
        $input=$request->all();
        $this->model->checkDetailQuestion($input);
        $results=$this->model->detailQuestion($input);
        return get_success_api_response($results);
    }

    /**
     * 查看需要验证的
     * @param Request $request
     * @return
     * @author
     */
    public function listComplaintToJudge(Request $request){
        $input=$request->all();
        $content=$this->model->listComplaintToJudge($input);
        $page=$this->getPagingResponse($input);
        return get_success_api_response($content,$page);
    }

    /**
     * 列表显示已发送的问题;
     * @param Request $request
     * @return
     * @author xin.min 20180710
     */
    public function listQuestion(Request $request){
        $input=$request->all();
        $results=$this->model->listQuestion($input);
        return get_success_api_response($results);
    }

    /**
     * 删除答案
     * @param Request $request
     * @return
     * @author
     */
    public function deleteSendQuestion(Request $request){
        $input= $request->all();
        $this->model->checkDeleteSendQuestion($input);
        $results=$this->model->deleteSendQuestion($input);
        return get_success_api_response($results);
    }

    /**
     * 根据当前用户id显示需要填写问题的客诉列表
     * @param  Request $request
     * @return
     * @author
     */
    public function detailComplaintByAdmin(Request $request){
        $input=$request->all();
        $content=$this->model->detailComplaintByAdmin($input);
        $page=$this->getPagingResponse($input);
        return get_success_api_response($content,$page);
    }

    /**
     * 归档客诉单
     * @param Request $request
     * @return
     * @author
     */
    public function finishComplaint(Request $request){
        $input=$request->all();
        $results=$this->model->finishComplaint($input);
        return get_success_api_response($results);
    }

    /**
     * 提交审核
     * @param  Request $request
     * @return
     * @author
     */
    public function submitJudgeComplaint(Request $request){
        $input=$request->all();
        $this->model->checkSubmitJudgeComplaint($input);
        $results=$this->model->submitJudgeComplaint($input);
        return get_success_api_response($results);
    }

    /**
     * 审核客诉单
     * @param Request $request
     * @return
     * @author
     */
    public function judgeComplaint(Request $request){
        $input=$request->all();
        $this->model->checkJudgeComplaint($input);
        $results=$this->model->judgeComplaint($input);
        return get_success_api_response($results);
    }

    /**
     * 打回问题
     * @param  Request $request
     * @return
     * @author
     */
    public function judgeQuestion(Request $request){
        $input=$request->all();
        $this->model->checkJudgeQuestion($input);
        $results=$this->model->judgeQuestion($input);
        return get_success_api_response($results);
    }


    /**
     * PO_number   模糊查询
     * @param  Request $request
     * @return
     * @author
     */
    public function dimPonumber(Request $request){
        $input=$request->all();
        $results=$this->model->dimPonumber($input);
        return get_success_api_response($results);

    }

    

    /**
     * 物料编号   模糊查询
     * @param  Request $request
     * @return
     * @author
     */
    public function dimMaterial(Request $request){
        $input=$request->all();
        $results=$this->model->dimMaterial($input);
        return get_success_api_response($results);

    }


    /**
     * 所有字段检测唯一性
     * @param Request $request
     * @return string  返回json
     * @throws \App\Exceptions\ApiException
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
    
}