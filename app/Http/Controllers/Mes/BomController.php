<?php
/**
 * Created by PhpStorm.
 * User: ruiyanchao
 * Date: 17/12/04
 * Time: 上午 10:21
 */
namespace App\Http\Controllers\Mes;

use App\Libraries\Trace;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Http\Models\Bom;

/**
 *BOM控制器
 *@author    rick
 *@reviser   sam.shan  <sam.shan@ruis-ims.cn>
 */
class BomController extends Controller
{


    public function __construct()
    {
        parent::__construct();
        if (empty($this->model)) $this->model = new Bom();
    }

//region  增

    /**
     * 添加BOM所有字段检测唯一性
     * @param Request $request
     * @return string  返回json
     * @throws \App\Exceptions\ApiException
     * @author  sam.shan  <sam.shan@ruis-ims.cn>
     */
    public  function unique(Request $request)
    {
        //获取参数并过滤
        $input=$request->all();
        trim_strings($input);
        $where=$this->getUniqueExistWhere($input);
        if(!empty($input['version'])) $where[]=['version','<>',$input['version']];
        $input['has']=$this->model->isExisted($where);
        //拼接返回值
        $results=$this->getUniqueResponse($input);
        return  response()->json(get_success_api_response($results));
    }

    /**
     * BOM添加
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @author   rick
     * @reviser  sam.shan <sam.shan@ruis-ims.cn>
     */
    public function store(Request $request)
    {
        //获取所有参数
        $input=$request->all();
        //呼叫M层进行处理
        $insert_id=$this->model->add($input);
        //获取返回值
        $results=['bom_id'=>$insert_id];
        return  response()->json(get_success_api_response($results));
    }

    /**
     * sap 同步bom给mes
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     * @throws \App\Exceptions\ApiSapException
     */
    public function syncBom(Request $request)
    {
        $input = $request->all();
        api_to_txt($input, $request->path());
        $response = $this->model->syncBom($input);
        return response()->json(get_success_sap_response($response));
    }
//endregion

//region  改

    /**
     * 组装子项
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function assemblyItem(Request $request){
        $input = $request->all();
        trim_strings($input);
        $this->model->assemblyItem($input);
        return response()->json(get_success_api_response(200));
    }

    /**
     * BOM修改
     * @param Request $request
     * @throws \App\Exceptions\ApiException
     * @return \Illuminate\Http\JsonResponse
     * @author   rick
     */
    public function update(Request $request)
    {
        //获取所有参数
        $input=$request->all();
        //呼叫M层进行处理
        $result = $this->model->update($input);
        $result = $result==null?$input['bom_id']:$result;
        //获取返回值
        return  response()->json(get_success_api_response([$this->model->apiPrimaryKey=>$result]));
    }

    /**
     * 修改状态
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function changeStatus(Request $request)
    {
        $id = $request->input($this->model->apiPrimaryKey);
        //获得所有参数
        $input = $request->all();
        //呼叫M层进行处理
        $this->model->changeStatus($input);
        //获取返回值
        return  response()->json(get_success_api_response([$this->model->apiPrimaryKey=>$id]));
    }

    /**
     * 修改是否组装
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function changeAssembly(Request $request)
    {
        $id = $request->input('bom_item_id');
        //获得所有参数
        $input = $request->all();
        //呼叫M层进行处理
        $this->model->changeAssembly($input);
        //获取返回值
        return  response()->json(get_success_api_response(['bom_item_id'=>$id]));
    }

//endregion

//region  查

    /**
     * 查看详情
     * @param  \Illuminate\Http\Request  $request  Request实例
     * @return  \Illuminate\Http\JsonResponse     返回json格式
     * @author  sam.shan   <sam.shan@ruis-ims.cn>
     */
    public function show(Request $request)
    {
        //判断ID是否提交
        $id = $request->input($this->model->apiPrimaryKey);
        if(empty($id) || !is_numeric($id)) TEA('700',$this->model->apiPrimaryKey);
        $need_find_level = ($request->input('need_find_level')) ? true : false;
        //呼叫M层进行处理
        $results= $this->model->get($id,$need_find_level);
        return  response()->json(get_success_api_response($results));
    }

    /**
     * 查询物料的bom编号
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function getMaterialBomNos(Request $request){
        $material_id = $request->input('material_id');
        if(empty($material_id)) TEA('700','material_id');
        $obj_list = $this->model->getMaterialBomNos($material_id);
        return response()->json(get_success_api_response($obj_list));
    }

    /**
     * 转换搜索参数
     * @param $input
     * @author sam.shan <sam.shan@ruis-ims.cn>
     */
    public function transformSearchParams(&$input)
    {
        //物料项
        if(!empty($input['item_material_id']))  $input['item_material_path']=','.$input['item_material_id'].',';
        //物料替代项
        if(!empty($input['replace_material_id']))  $input['replace_material_path']=','.$input['replace_material_id'].',';
        //bom状态
        $input['condition'] = empty($input['condition']) ? 'undefined' : $input['condition'];
        $input['status']=$input['condition'];
        if($input['condition']==config('app.bom.condition.released')){
            $input['status']=1;
            $input['is_version_on']=1;
        }else if($input['condition']==config('app.bom.condition.activated')){
            $input['is_version_on']=0;
        }
    }
    /**
     * 获取BOM列表[需要传递分页参数]
     * @param Request $request
     * @return  \Illuminate\Http\Response
     * @author   rick
     * @throws \App\Exceptions\ApiException
     */
    public function  pageIndex(Request $request)
    {
        $input=$request->all();
        //trim过滤一下参数
        trim_strings($input);
        //分页参数判断
        $this->checkPageParams($input);
        //转换参数
        $this->transformSearchParams($input);
        //获取数据
        $obj_list=$this->model->getBomList($input);
        //获取返回值
        $paging=$this->getPagingResponse($input);

        return  response()->json(get_success_api_response($obj_list,$paging));
    }

    /**
     * @param Request $request
     * @throws \App\Exceptions\ApiException
     * @author sam.shan  <sam.shan@ruis-ims.cn>
     */
    public  function  getBomTree(Request $request)
    {
        //获取参数
        $bom_material_id=$request->input('bom_material_id');
        if(empty($bom_material_id))  TEA('700','bom_material_id');
        $version=$request->input('version');
        if(empty($version))  TEA('700','version');
        //默认不反回替代物料的
        $replace=$request->input('replace',0);
        //默认也不返回阶梯信息的
        $bom_item_qty_level=$request->input('bom_item_qty_level',0);
        //联系M层
        $trees=$this->model->getBomTree($bom_material_id,$version,$replace,$bom_item_qty_level);
        //返回给前端
        return  response()->json(get_success_api_response($trees));

    }

    /**
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getDesignBom(Request $request)
    {
        $input = $request->all();
        if(empty($input['material_id']) || !is_numeric($input['material_id'])) TEA('700','material_id');
        if(!isset($input['bom_no'])) TEA('700','bom_no');
        //呼叫M层进行处理
        $result = $this->model->getDesignBom($input['material_id'],$input['bom_no']);
        //获取返回值
        return  response()->json(get_success_api_response($result));
    }

    public function releaseBeforeCheck(Request $request)
    {
        $input = $request->all();
        if(empty($input['material_id']) || !is_numeric($input['material_id'])) TEA('700','material_id');
        if(!isset($input['bom_no'])) TEA('700','bom_no');
        //呼叫M层进行处理
        $result = $this->model->releaseBeforeCheck($input['material_id'],$input['bom_no']);
        //获取返回值
        return  response()->json(get_success_api_response(['num'=>$result]));
    }


    /**
     * 获取进料
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function getEnterBomMaterial(Request $request){
        $bom_id = $request->input($this->model->apiPrimaryKey);
        if(empty($bom_id)) TEA('700',$this->model->apiPrimaryKey);
        $routing_id = $request->input('routing_id');
        if(empty($routing_id)) TEA('700','routing_id');
        $obj_list = $this->model->newGetEnterBomMaterial($bom_id,$routing_id);
        return response()->json(get_success_api_response($obj_list));
    }

    /**
     * 根据进料集合获取出料
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function getOutBomMaterial(Request $request){
        $materials = $request->input('materials');
        if(empty($materials) || !is_json($materials)) TEA('700','materials');
        $bom_id = $request->input('bom_id');
        if(empty($bom_id)) TEA('700','bom_id');
        $obj_list = $this->model->newGetOutBomMaterial($bom_id,$materials);
        return response()->json(get_success_api_response($obj_list));
    }

//endregion

//region  删

    /**
     * 删除
     * @param  \Illuminate\Http\Request  $request  Request实例
     * @return  string    返回json格式
     * @author   sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function destroy(Request $request)
    {
        //判断ID是否提交
        $id = $request->input($this->model->apiPrimaryKey);
        if(empty($id) || !is_numeric($id)) TEA('700',$this->model->apiPrimaryKey);
        //呼叫M层进行处理
        $this->model->destroy($id);
        //获取返回值
        return  response()->json(get_success_api_response([$this->model->apiPrimaryKey=>$id]));
    }

//endregion


















}










