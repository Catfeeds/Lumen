<?php
/**
 * Created by PhpStorm.
 * User: sansheng
 * Date: 17/11/16
 * Time: 下午4:12
 */
namespace App\Http\Controllers\Mes;//定义命名空间
use App\Http\Controllers\Controller;//引入基础控制器类
use App\Http\Models\DrawingType;
use Illuminate\Http\Request;//获取请求参数

/**
 * 图纸类型控制器
 * @author  sam.shan  <sam.shan@ruis-ims.cn>
 * @time    2017年10月21日 16:29
 */
class DrawingTypeController extends Controller
{
    /**
     * DrawingTypeController constructor.
     */
    public function  __construct(){
        parent::__construct();
        //if(empty($this->model)) $this->model=new DrawingType();
    }

    /**
     * 图纸类型select列表
     * @return  string    返回json
     * @author  sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function  select()
    {
        //呼叫M层进行处理
        //$obj_list=$this->model->getDrawingTypeList();
        $obj_list=[];
        $response=get_api_response('200');
        $response['results']=$obj_list;
        return  response()->json($response);
    }










}





