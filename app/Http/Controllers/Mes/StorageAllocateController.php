<?php
/**
 * 库存调拨管理控制器
 * User: xiafengjuan
 * Date: 2017/12/19
 * Time: 15:17
 */
namespace App\Http\Controllers\Mes;//定义命名空间
use App\Http\Controllers\Controller;//引入基础控制器类
use Illuminate\Http\Request;//获取请求参数
use Laravel\Lumen\Routing\Controller as BaseController;//引入Lumen底层控制器
use App\Http\Models\StorageAllocate;
use App\Http\Models\StorageAllotitem;
use App\Http\Models\StorageInve;

class StorageAllocateController extends Controller
{
    public function __construct()
    {
        parent::__construct();
        if (empty($this->storageallocate)) $this->storageallocate = new StorageAllocate();
        if (empty($this->storageallotitem)) $this->storageallotitem = new StorageAllotitem();
        if(empty($this->sinve)) $this->sinve =new StorageInve();
    }
    /**
     * 验证实际调拨数据
     * @return  真实数量
     * @author  xiafengjuan
     */
    public function  Verify_Data (Request $request)
    {
        $input = $request->all();
        if(!is_numeric($input['real_quantity']))//是否数字
        {
            TEA('6003');
        }
        //根据实时库存id获取数量
        $quantity = $this->sinve->getFieldValueById($input['id'],'quantity');
        if($quantity<$input['real_quantity'])
        {
            TEA('8801');
        }

        return $input['real_quantity'];
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
        $input['has']=$this->storageallocate->isExisted($where);
        //拼接返回值
        $results=$this->getUniqueResponse($input);
        return  response()->json(get_success_api_response($results));
    }

    /**
     * 调拨单添加
     * @return   string   json
     * @author   xiafengjuan
     */
    public function store(Request  $request)
    {
        //过滤,判断并提取所有的参数
        $input=$request->all();

        //呼叫M层进行处理
        $insert_id=$this->storageallocate->add($input);
        $response=get_api_response('200');
        $response['results']=['instore_id'=>$insert_id];
        return  response()->json($response);
    }
    /**
     * 获取调拨单列表
     * @param Request $request
     * @return  string   返回json
     * @author  xiafengjuan
     */
    public function  getAllocateList(Request $request)
    {
        //过滤,判断并提取所有的参数
        $input=$request->all();
        // 获取列表信息
        $obj_list=$this->storageallocate->getOrderList($input);

        $response=get_api_response('200');
        $response['results']=$obj_list;
        //获取返回值
        $paging=$this->getPagingResponse($input);
        return  response()->json(get_success_api_response($obj_list,$paging));
    }


    /**
     * 查看某条调拨单信息
     * @param   \Illuminate\Http\Request  $request   Request实例
     * @return  string  返回json
     * @author  xiafengjuan
     */
    public function show(Request $request)
    {
        //判断ID是否提交
        $id=$request->input('id');
        if(empty($id)|| !is_numeric($id)) TEA('703','id');

        // 获取单个入库单信息
        $obj_list=$this->storageallocate->getOneOrder($id);

        //呼叫M层进行处理
        $response=get_api_response('200');
        $response['results']=$obj_list;
        return  response()->json($response);
    }



    /**
     * 编辑调拨单
     * @param  \Illuminate\Http\Request  $request  Request实例
     * @return  \Illuminate\Http\JsonResponse     返回json格式
     * @author xiafengjuan
     */
    public function update(Request $request)
    {
        //过滤,判断并提取所有的参数
        $input=$request->all();
        //id判断
        if(empty($input['id']) || !is_numeric($input['id'])) TEA('703','id');

        //呼叫M层进行处理
        $this->storageallocate->update($input);
        //获取返回值
        $response=get_api_response('200');
        $response['results']=['id'=>$input['id']];
        return  response()->json($response);
    }


    /**
     * 调拨单删除
     * @param Request $request
     * @return string  返回json字符串
     * @author xiafengjuan
     */
    public  function  destroy(Request $request)
    {
        //判断ID是否提交
        $id=$request->input('id');
        if(empty($id)|| !is_numeric($id)) TEA('703','id');
        //呼叫M层进行处理
        $this->storageallocate->destroy($id);
        $response=get_api_response('200');
        return  response()->json($response);
    }
    /**
     * 调拨单批量审核
     * @param Request $request
     * @return  string  返回json
     * @author xiafengjuan
     */
    public  function batchaudit(Request $request)
    {
        //过滤,判断并提取所有的参数
        $input=$request->all();
        if($input['ids']=="")
        {
            TEA('8800','ids');
        }
        //呼叫M层进行处理
        $this->storageallocate->batchaudit($input);
        //拼接返回值
        $response=get_api_response('200');
        $response['results']=['order_id'=>$input['ids']];
        return  response()->json($response);
    }
    /**
     * 调拨单审核
     * @param Request $request
     * @return  string  返回json
     * @author xiafengjuan
     */
    public  function audit(Request $request)
    {
        //业务权限判断
        //过滤,判断并提取所有的参数
        $input=$request->all();

        //id判断
        if(empty($input['id']) || !is_numeric($input['id'])) TEA('703','id');

        //呼叫M层进行处理
        $order_id   =   $this->storageallocate->audit($input);

        //拼接返回值
        $response=get_api_response('200');
        $response['results']=['order_id'=>$input['id']];
        return  response()->json($response);
    }
}