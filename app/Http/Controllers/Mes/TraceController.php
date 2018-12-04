<?php
/**
 * Created by PhpStorm.
 * User: sansheng
 * Date: 17/12/29
 * Time: 上午9:02
 */
namespace App\Http\Controllers\Mes;
use App\Http\Controllers\Controller;
use App\Http\Models\Trace\Trace;
use Illuminate\Http\Request;



/**
 * 轨迹追踪控制器
 * @author  sam.shan  <sam.shan@ruis-ims.cn>
 * @time    2017年12月29日17:50:25
 */
class TraceController extends Controller
{

    /**
     * 构造方法初始化操作类
     */
    public function __construct()
    {
        parent::__construct();
        if(empty($this->model)) $this->model=new Trace();
    }

//region  查



    /**
     * 查看物料分类
     * @param Request $request
     * @return string   返回json
     * @author  sam.shan  <sam.shan@ruis-ims.cn>
     */
//    public function  show(Request $request)
//    {
//
//        //判断ID是否提交
//        $id=$request->input($this->model->apiPrimaryKey);
//        if(empty($id)|| !is_numeric($id)) TE('700',$this->model->apiPrimaryKey);
//        //呼叫M层进行处理
//        $results=$this->model->get($id);
//        //成功返回前端
//        return  response()->json(get_success_api_response($results));
//    }



    /**
     * 转换搜索参数
     * @param $input
     * @author sam.shan <sam.shan@ruis-ims.cn>
     */
    public function transformSearchParams(&$input)
    {
//        //分类,注意当用户传递某个物料分类的时候,我们得连它的子孙后代都抓取进来
//        if(!empty($input['material_category_id'])){
//            $input['material_category_ids']=$this->model->getMaterialCategoryIdsByForefatherId($input['material_category_id']);
//            //将自己添加进来
//            array_unshift($input['material_category_ids'],$input['material_category_id']);
//        }
//        //bom顶级母件
//        if(!empty($input['bom_material_id'])){
//            $input['bom_mother_forefathers_ids']=$this->model->getBomMotherForefathers($input['bom_material_id']);
//            //将自己添加进来
//            array_unshift($input['bom_mother_forefathers_ids'],$input['bom_material_id']);
//        }
    }

    /**
     * 分页列表页
     * @param  \Illuminate\Http\Request  $request  Request实例
     * @return  \Illuminate\Http\Response
     * @author  sam.shan <sam.shan@ruis-ims.cn>
     */
    public function  pageIndex(Request  $request)
    {
        //过滤,判断并提取所有的参数
        $input = $request->all();
        //trim过滤一下参数
        trim_strings($input);
        //操作日志参数判断
        $this->checkTraceParams($input);
        //分页参数判断
        $this->checkPageParams($input);
        //转换一下参数
       // $this->transformSearchParams($input);
        //联系M层
        $obj_list = $this->model->getTraceList($input);
        $paging=$this->getPagingResponse($input);
        return  response()->json(get_success_api_response($obj_list,$paging));
    }


    /**
     * 获取操作日志的操作人员
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @author  sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function  operators(Request $request)
    {
        //过滤,判断并提取所有的参数
        $input = $request->all();
        //trim过滤一下参数
        trim_strings($input);
        //操作日志参数判断
        $this->checkTraceParams($input);

        //联系M层
        $obj_list = $this->model->getTraceOperatorsList($input);
        return  response()->json(get_success_api_response(array_values($obj_list)));


    }










//endregion
//region  删



    /**
     * 删除物料分类
     * @param Request $request
     * @return   string  json
     * @author   sam.shan  <sam.shan@ruis-ims.cn>
     */
//    public  function  destroy(Request $request)
//    {
//        //判断ID是否提交
//        $id=$request->input($this->model->apiPrimaryKey);
//        if(empty($id)|| !is_numeric($id)) TEA('700',$this->model->apiPrimaryKey);
//        //呼叫M层进行处理
//        $this->model->destroy($id);
//        //获取返回值
//        return  response()->json(get_success_api_response([$this->model->apiPrimaryKey=>$id]));
//
//    }




//endregion






}





