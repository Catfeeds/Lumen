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
use App\Http\Models\WorkCenterRankPlan;

class WorkCenterRankPlanController extends Controller{

    public function __construct()
    {
        parent::__construct();
        if(empty($this->model)) $this->model = new WorkCenterRankPlan();
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
    public function getWorkCenterRankPlan(Request $request){
        $id = $request->input('workcenter_id');
        if(empty($id)) TEA('700','workcenter_id');
        $obj_list = $this->model->getWorkCenterRankPlan($id);
        return response()->json(get_success_api_response($obj_list));
    }

//endregion

}