<?php
/**
 * Created by PhpStorm.
 * User: sam.shan
 * Date: 17/11/16
 * Time: 上午15:14
 */

namespace App\Http\Controllers\Mes;//定义命名空间
use App\Http\Controllers\Controller;//引入基础控制器类
use App\Libraries\Thumb;
use Illuminate\Http\Request;//获取请求参数
use App\Http\Models\Drawing;


/**
 * 图纸库之图纸管理器
 * @author  sam.shan   <sam.shan@ruis-ims.cn>
 */
class DrawingController extends Controller
{

    public function __construct()
    {
        parent::__construct();
        //if(empty($this->model)) $this->model=new Drawing();
    }

    /**
     * 图纸库列表页[需要传递分页参数]
     * @return  \Illuminate\Http\Response
     * @author   sam.shan  <sam.shan@ruis-ims.cn>
     * @todo   注意缩略图是被动反应的,后续应该在图纸上传的时候进行处理,这样此处就不需要了,这里是为了解决历史遗留问题
     */
    public function  pageIndex(Request $request)
    {

        $input=$request->all();
        //trim过滤一下参数
        trim_strings($input);
        //分页参数判断
        $this->checkPageParams($input);
        //给M层打个电话获取数据
        $obj_list=[];
        //$obj_list=$this->model->getDrawingList($input);
        //处理缩略图
        //Thumb::createThumb($obj_list,'material');
        //获取返回值
        $response=get_api_response('200');
        $response['paging']=$this->getPagingResponse($input);
        $response['results'] = $obj_list;
        return  response()->json($response);
    }



    /**
     * 查看图纸详情
     * @param   \Illuminate\Http\Request  $request   Request实例
     * @return  string  返回json
     * @author  sam.shan  <sam.shan@ruis-ims.cn>
     * @todo  注意缩略图是被动反应的,后续应该在图纸上传的时候进行处理
     */
    public function show(Request $request)
    {
        //判断ID是否提交
        $drawing_id=$request->input('drawing_id');
        if(empty($drawing_id)|| !is_numeric($drawing_id)) TEA('738','drawing_id');
        //呼叫M层进行处理
        $obj_list=$this->model->getMultiDetail($drawing_id);
        //处理一下缩略图
        if(!empty($obj_list['combination'])) Thumb::createThumb($obj_list['combination'],'material');
        $response=get_api_response('200');
        $response['results']=$obj_list;
        return  response()->json($response);
    }















}