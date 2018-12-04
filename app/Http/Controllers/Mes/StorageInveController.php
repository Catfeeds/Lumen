<?php 
/**
 * 模板管理器
 * @author  liming
 * @time    2017年12月7日
 */

namespace App\Http\Controllers\Mes;//定义命名空间
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Libraries\Tree;//引入无限极分类操作类
use App\Http\Models\StorageInve;//引入实时库存处理类


class StorageInveController extends Controller
{
    /**
     * 构造方法初始化操作类
     */
    public function __construct()
    {
      parent::__construct();
      if(empty($this->model)) $this->model=new StorageInve();
    }


  /**
     * 实时库存列表显示
     * @param Request $request
     * @return  string   返回json
     * @author  liming
     */
    public function  pageIndex(Request $request)
    {
        //过滤,判断并提取所有的参数
        $input=$request->all();
        // 获取列表信息
        $obj_list=$this->model->getStorageInveList($input);

        $response=get_api_response('200');
        $response['results']=$obj_list;
        if(array_key_exists('page_no',$input )|| array_key_exists('page_size',$input ))//判断传入的key是否存在
        {
            //获取返回值
            $paging = $this->getPagingResponse($input);
            return response()->json(get_success_api_response($obj_list, $paging));
        }else
        {
            $response['results']=$obj_list;
            return  response()->json($response);
        }
    }


    /**
     * 仓位查询某条记录
     * @param Request   $request
     * @return string   返回json
     */
    public function  show(Request $request)
    {
        //判断ID是否提交
        $id=$request->input('id');
        if(empty($id)|| !is_numeric($id)) TEA('703','id');
        //呼叫M层进行处理
        $response=get_api_response('200');
        $response['results']=$this->model->get($id);
        return  response()->json($response);
    }



   /**
     * 查看出入库明细
     * @param Request   $request
     * @return string   返回json
     */
    public function  showItems(Request $request)
    {
        //判断ID是否提交
        $id=$request->input('id');
        if(empty($id)|| !is_numeric($id)) TEA('703','id');
        //呼叫M层进行处理
        $response=get_api_response('200');
        $response['results']=$this->model->getitems($id);
        return  response()->json($response);
    }

}
