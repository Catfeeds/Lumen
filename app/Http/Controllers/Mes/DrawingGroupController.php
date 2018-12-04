<?php
/**
 * Created by PhpStorm.
 * User: sansheng
 * Date: 17/11/16
 * Time: 下午4:15
 */



namespace App\Http\Controllers\Mes;//定义命名空间
use App\Http\Controllers\Controller;//引入基础控制器类
use App\Http\Models\DrawingGroup;
use Illuminate\Http\Request;//获取请求参数

/**
 * 图纸分组控制器
 * @author  sam.shan  <sam.shan@ruis-ims.cn>
 * @time    2017年10月21日 16:29
 */
class DrawingGroupController extends Controller
{

    public function  __construct()
    {
        parent::__construct();
        if(empty($this->model)) $this->model=new DrawingGroup();
    }

    /**
     * 图纸分组联动select列表
     * @return  string    返回json
     * @author  sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function  linkSelect(Request $request)
    {

        $drawing_type_id=$request->input('drawing_type_id');
        if(empty($drawing_type_id) || !is_numeric($drawing_type_id)) TEA('737','drawing_type_id');
        //呼叫M层进行处理
        $obj_list=$this->model->getGroupListByType($drawing_type_id);
        $response=get_api_response('200');
        $response['results']=$obj_list;
        return  response()->json($response);
    }










}

