<?php
namespace App\Http\Controllers\Mes;//定义命名空间
use App\Http\Controllers\Controller;//引入基础控制器类
use Illuminate\Http\Request;//获取请求参数
use App\Http\Models\Operation;

/**
 * 工序控制器
 * Class OperationController
 * @package App\Http\Controllers\Mes
 */
class OperationController extends Controller
{
    public function __construct()
    {
        parent::__construct();
        if (empty($this->model)) $this->model = new Operation();
    }

    /**
     * 工序添加
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function add(Request $request)
    {
        $input = $request->all();
        //检测字段
        $this->model->checkFields($input);

        //插入数据
        $insert_id = $this->model->addOperation($input);

        $results=['operation_id'=>$insert_id];
        return  response()->json(get_success_api_response($results));
    }


    /**
     * 添加或者编辑物料模板的时候获取的工序checkbox列表
     * @param Request $request
     * @return  string    返回json
     * @author  sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function  select()
    {
        //呼叫M层进行处理
        $obj_list=$this->model->getOperationSelectList();
        return  response()->json(get_success_api_response($obj_list));
    }



}