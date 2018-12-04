<?php
/**
 * Created by PhpStorm.
 * User: haoziye
 * Date: 2018/3/7
 * Time: 下午2:04
 */
namespace App\Http\Controllers\Mes;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Http\Models\WorkCenterOperation;

class WorkCenterOperationController extends Controller{

    public function __construct()
    {
        parent::__construct();
        if(empty($this->model)) $this->model = new WorkCenterOperation();
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
        if(!empty($input['workcenter_id'])){
            $where[] = ['workcenter_id','=',$input['workcenter_id']];
        }
        $input['has']=$this->model->isExisted($where);
        //拼接返回值
        $results=$this->getUniqueResponse($input);
        return  response()->json(get_success_api_response($results));
    }

//endregion

//region 修

    /**
     * 修改
     * @param Request $request
     */
    public function update(Request $request){
        $input = $request->all();
        $this->model->checkFromField($input);
        $this->model->update($input);
        return response()->json(get_success_api_response(200));
    }

//endregion

//region 查

    /**
     * 查找工作中心所有关联的工序
     * @param Request $request
     */
    public function getWorkCenterOperation(Request $request){
        $id = $request->input('workcenter_id');
        if(empty($id)) TEA('700','workcenter_id');
        $obj_list = $this->model->getWorkCenterOperation($id);
        return response()->json(get_success_api_response($obj_list));
    }

    public function getWorkCenterOperationAbilitys(Request $request){
        $input = $request->all();
        $obj_list = $this->model->getWorkCenterOperationAbilitys($input);
        return response()->json(get_success_api_response($obj_list));
    }

    /**
     * 获取工作中心的工艺路线
     * @param Request $request
     */
    public function getWorkcenterRoutings(Request $request){
        $workcenter_id = $request->input('workcenter_id');
        if(empty($workcenter_id) || !is_numeric($workcenter_id)) TEA('700','workcenter_id');
        $obj_list = $this->model->getWorkcenterRoutings($workcenter_id);
        return response()->json(get_success_api_response($obj_list));
    }

    public function getWorkCenterBySteps(Request $request){
        $input = $request->all();
        if(empty($input['operation_id'])) TEA('700','operation_id');
        if(!isset($input['step_ids']) || !is_json($input['step_ids'])) TEA('700','step_ids');
        $obj_list = $this->model->getWorkCenterBySteps($input);
        return response()->json(get_success_api_response($obj_list));
    }
//endregion

    /**
     * @message 通过工作中心获取相关要填的值
     * @author  liming
     * @time    年 月 日
     */    
    public  function   getStandardByWorkCenter(Request $request)
    {
        $input  = $request->all();
        if(empty($input['step_info_id']) || !is_numeric($input['step_info_id'])) TEA('700','step_info_id');
        if(empty($input['workcenter_id']) || !is_numeric($input['workcenter_id']))
        {
            $obj_list = [];
            // TEA('700','workcenter_id');
        }
        else
        {
           $obj_list = $this->model->getStandardByWorkCenter($input['workcenter_id'],$input['step_info_id']);
        }
        return    response()->json(get_success_api_response($obj_list));
    }


    /**
     * @message 通过工作中心获取相关要填的值
     * @author  liming
     * @time    年 月 日
     */    
    public  function   getDeclareStandardByWorkCenter(Request $request)
    {
        $input  = $request->all();
        if(empty($input['workcenter_id']) || !is_numeric($input['workcenter_id']))
        {
            $obj_list = [];
        }
        else
        {
           $obj_list = $this->model->getDeclareStandardByWorkCenter($input['workcenter_id']);
        }
        return    response()->json(get_success_api_response($obj_list));
    }
}