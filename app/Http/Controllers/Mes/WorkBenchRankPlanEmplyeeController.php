<?php
/**
 * Created by PhpStorm.
 * User: haoziye
 * Date: 2018/3/2
 * Time: 上午8:49
 */
namespace App\Http\Controllers\Mes;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Http\Models\WorkBenchRankPlanEmplyee;

class WorkBenchRankPlanEmplyeeController extends Controller{


    public function __construct()
    {
        parent::__construct();
        if(!$this->model) $this->model = new WorkBenchRankPlanEmplyee();
    }

//region 查

    /**
     * 获取人员的集合
     * @param Request $request
     * @author hao.wei <weihao>
     */
    public function getList(Request $request){
        $input = $request->all();
        $obj_list = $this->model->getWorkBenchRankPlanEmplyeeList($input);
        return response()->json(get_success_api_response($obj_list));
    }

//endregion

//region 修

    /**
     * 修改班次关联的工序
     * @param Request $request
     * hao.wei <weihao>
     */
    public function update(Request $request){
        $input = $request->all();
        $this->model->checkFormField($input);
        $this->model->updateWorkBenchRankPlanEmplyee($input);
        return response()->json(get_success_api_response('200'));
    }

//endregion
}