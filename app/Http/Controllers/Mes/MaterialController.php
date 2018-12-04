<?php
/**
 * 物料管理控制器
 * @author  xujian
 * @reviser  sam.shan  <sam.shan@ruis-ims.cn>
 * @time    2017年10月19日09:54:59
 */


namespace App\Http\Controllers\Mes;
use App\Http\Controllers\Controller;
use App\Http\Models\Material\Material;
use Illuminate\Http\Request;
/**
 * 物料操作控制器
 * Class MaterialController
 * @package App\Http\Controllers\Mes
 * @author  sam.shan  <sam.shan@ruis-ims.cn>
 */
class MaterialController extends Controller
{


    public function __construct()
    {
        parent::__construct();
        if (empty($this->model)) $this->model = new Material();
    }


//region 增

    /**
     * 添加物料所有字段检测唯一性
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
        $input['has']=$this->model->isExisted($where);
        //拼接返回值
        $results=$this->getUniqueResponse($input);
        return  response()->json(get_success_api_response($results));
    }


    /**
     * 添加属性,如果使用了模板,则选择物料模板后获取对应的模板属性
     * @param   \Illuminate\Http\Request  $request  Request实例
     * @return  \Illuminate\Http\JsonResponse     返回json格式
     * @author  sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function getTemplateAttributeList(Request $request)
    {

        //根据template_id找到该模板的所有父项模板
        $input = $request->all();
        if(empty($input['template_id']) || !is_numeric($input['template_id'])) TEA('700','template_id');
        $obj_list = $this->model->getTemplateAttributeList($input['template_id']);
        return  response()->json(get_success_api_response($obj_list));
    }

    /**
     * 添加的时候,继承属性的填写值可以直接参照父模板物料
     * @param  \Illuminate\Http\Request  $request  Request实例
     * @return  \Illuminate\Http\JsonResponse     返回json格式
     * @author  sam.shan   <sam.shan@ruis-ims.cn>
     */
    public function  getGeneticReferMaterial(Request $request)
    {
        $input = $request->all();
        //trim过滤一下参数
        trim_strings($input);
        if(empty($input['template_id']))  TEA('700','template_id');
        //分页参数判断
        $this->checkPageParams($input);
        $obj_list = $this->model->getGeneticReferMaterial($input);
        $paging= $this->getPagingResponse($input);
        return  response()->json(get_success_api_response($obj_list,$paging));
    }
    /**
     * 添加物料,选择参照物料的属性值
     * @param  \Illuminate\Http\Request  $request  Request实例
     * @return  string  返回json格式
     * @author  sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function getAttributeValueList(Request $request)
    {
        //过滤,判断并提取所有的参数
        $id = $request->input($this->model->apiPrimaryKey);
        if(empty($id) || !is_numeric($id)) TEA('700',$this->model->apiPrimaryKey);
        $obj_list = $this->model->getAttributeByMaterial($id);
        return  response()->json(get_success_api_response($obj_list));
    }

    /**
     * 根据物料id获得该物料的标签
     * @param  \Illuminate\Http\Request  $request  Request实例
     * @return  string  返回json格式
     * @author  sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function store(Request $request)
    {
        //获取所有参数并检测
        $input = $request->all();
        $this->model->checkFormFields($input);
        //呼叫M层进行处理
        $res = $this->model->add($input);
        return  response()->json(get_success_api_response($res));
    }

    /**
     * 根据某个物料获取使用模板的属性及属性值
     * @param  \Illuminate\Http\Request  $request  Request实例
     * @return  string    返回json格式
     * @author   hao.wei  <weihao>
     */
    public function getMaterialTemplateAttributeList(Request $request){
        $input = $request->all();
        if(empty($input['template_id']) || !is_numeric($input['template_id'])) TEA('700','template_id');
        if(empty($input[$this->model->apiPrimaryKey]) || !is_numeric($input[$this->model->apiPrimaryKey])) TEA('700',$this->model->apiPrimaryKey);
        $obj_list = $this->model->getAttributeByMaterialAndTemplate($input['template_id'],$input[$this->model->apiPrimaryKey]);
        return response()->json(get_success_api_response($obj_list));
    }

    /**
     * sap 同步物料给mes
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     * @throws \App\Exceptions\ApiSapException
     */
    public function syncMaterial(Request $request)
    {
        $input = $request->all();
//        api_to_txt($input, $request->path());
        $response = $this->model->syncMaterial($input);
        return response()->json(get_success_sap_response($response));
    }

//endregion

//region 修

    /**
     * 整体编辑
     * @param  \Illuminate\Http\Request  $request  Request实例
     * @return  \Illuminate\Http\JsonResponse     返回json格式
     * @author  sam.shan   <sam.shan@ruis-ims.cn>
     */
    public function update(Request $request)
    {
        //过滤,判断并提取所有的参数
        $input = $request->all();

        //id判断
        if(empty($input[$this->model->apiPrimaryKey]) || !is_numeric($input[$this->model->apiPrimaryKey])) TEA('700',$this->model->apiPrimaryKey);
        //集中营判断
        $this->model->checkFormFields($input);
        //呼叫M层进行处理
        $this->model->update($input);
        //获取返回值
        return  response()->json(get_success_api_response([$this->model->apiPrimaryKey=>$input[$this->model->apiPrimaryKey]]));
    }


    /**
     * 编辑物料图纸
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     * @author  sam.shan <sam.shan@ruis-ims.cn>
     */
//    public function  updateDrawings(Request $request)
//    {
//        //获取参数并过滤
//        $input=$request->all();
//        trim_strings($input);
//        if(empty($input['material_id']) || !is_numeric($input['material_id'])) TEA('700','material_id');
//        if(!empty($input['drawings']) && !is_json($input['drawings'])) TEA('700','drawings');
//        //联系M层
//        $this->model->addMaterialDrawings($input['drawings'],$input['material_id']);
//        //返回
//        $response = get_api_response('200');
//        $response['results'] =['material_id'=>$input['material_id']];
//        return  response()->json($response);
//    }

    /**
     * 编辑物料附件
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     * @author  sam.shan <sam.shan@ruis-ims.cn>
     */
//    public function  updateAttachments(Request $request)
//    {
//        //获取参数并过滤
//        $input=$request->all();
//        trim_strings($input);
//        if(empty($input['material_id']) || !is_numeric($input['material_id'])) TEA('700','material_id');
//        if(!empty($input['attachments']) && !is_json($input['attachments'])) TEA('700','attachments');
//        //联系M层
//        $this->model->addMaterialAttachments($input['attachments'],$input['material_id']);
//        //返回
//        $response = get_api_response('200');
//        $response['results'] =['material_id'=>$input['material_id']];
//        return  response()->json($response);
//    }


//endregion
//region 查

    /**
     * 查看物料基础信息
     * @param  \Illuminate\Http\Request  $request  Request实例
     * @return  \Illuminate\Http\JsonResponse     返回json格式
     * @author  sam.shan   <sam.shan@ruis-ims.cn>
     */
    public function show(Request $request)
    {
        //判断ID是否提交
        $id = $request->input($this->model->apiPrimaryKey);
        if(empty($id) || !is_numeric($id)) TEA('700',$this->model->apiPrimaryKey);
        //呼叫M层进行处理
        $results= $this->model->get($id);
        return  response()->json(get_success_api_response($results));
    }
    /**
     * 转换搜索参数
     * @param $input
     * @author sam.shan <sam.shan@ruis-ims.cn>
     */
    public function transformSearchParams(&$input)
    {
        //分类,注意当用户传递某个物料分类的时候,我们得连它的子孙后代都抓取进来
        if(!empty($input['material_category_id'])){
            $input['material_category_ids']=$this->model->getMaterialCategoryIdsByForefatherId($input['material_category_id']);
            //将自己添加进来
            array_unshift($input['material_category_ids'],$input['material_category_id']);
        }
        //bom顶级母件
        if(!empty($input['bom_material_id'])){
            $input['bom_mother_forefathers_ids']=$this->model->getBomMotherForefathers($input['bom_material_id']);
            //将自己添加进来
            array_unshift($input['bom_mother_forefathers_ids'],$input['bom_material_id']);
        }
        //物料属性

        if(!empty($input['material_attributes'])){

            if(!isset($input['material_attributes']) || !is_json($input['material_attributes'])) TEA('700','material_attributes');
            $input['material_attributes']=json_decode($input['material_attributes'],true);
            //生成ref
            $ref=[];
            foreach( $input['material_attributes'] as $key =>$value){
                if(trim($value['value'])==='') unset($input['material_attributes'][$key]);
                $ref[$value['attribute_definition_id']]=$value;
            }

            $input['identity']=$this->model->identityCard($ref);
            unset($input['material_attributes']);

        }

        //物料属性ids
        if(!empty($input['material_attribute_ids'])){
            $material_attribute_ids=json_decode($input['material_attribute_ids'],true);
            sort($material_attribute_ids);
            $input['material_attribute_ids']=!empty($material_attribute_ids)?','.implode(',',$material_attribute_ids).',':'';

        }
    }


    /**
     * 检测相同属性的物料
     * @param Request $request
     * @author  sam.shan   <sam.shan@ruis-ims.cn>
     * @todo  注意,当属性过多的时候请进行代码优化,因为sql长度是有限制的
     */
    public function checkSimilar(Request  $request)
    {


        //过滤,判断并提取所有的参数
        $input = $request->all();
        //trim过滤一下参数
        trim_strings($input);
        //分页参数判断
        $this->checkPageParams($input);
        //转换一下参数
        $this->transformSearchParams($input);
        if(!empty($input['identity']['identity_card_string'])) $input['identity_card_string']=$input['identity']['identity_card_string'];

        //联系M层
        $obj_list =$this->model->checkSimilar($input);
        $paging=$this->getPagingResponse($input);
        return  response()->json(get_success_api_response($obj_list,$paging));

    }



    /**
     * 物料分页列表页
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
        //分页参数判断
        $this->checkPageParams($input);
        //转换一下参数
        $this->transformSearchParams($input);
        //联系M层
        $obj_list = $this->model->getMaterialList($input);
        $paging=$this->getPagingResponse($input);
        return  response()->json(get_success_api_response($obj_list,$paging));
    }
    /**
     * BOM顶级母件查询
     * @param  \Illuminate\Http\Request  $request  Request实例
     * @return  \Illuminate\Http\Response
     * @author  sam.shan <sam.shan@ruis-ims.cn>
     */
    public function  bomMother(Request  $request)
    {
        //过滤,判断并提取所有的参数
        $input = $request->all();
        //trim过滤一下参数
        trim_strings($input);
        //分页参数判断
        $this->checkPageParams($input);
        //转换一下参数
        $this->transformSearchParams($input);
        if(!empty($input['identity']['identity_card_string'])) $input['identity_card_string']=$input['identity']['identity_card_string'];
        //联系M层
        $obj_list = $this->model->getBomMotherMaterialList($input);
        $paging=$this->getPagingResponse($input);
        return  response()->json(get_success_api_response($obj_list,$paging));
    }

    /**
     * BOM顶级母件查询
     * @param  \Illuminate\Http\Request  $request  Request实例
     * @return  \Illuminate\Http\Response
     * @author  sam.shan <sam.shan@ruis-ims.cn>
     */
    public function  orderMother(Request  $request)
    {
        //过滤,判断并提取所有的参数
        $input = $request->all();
        //trim过滤一下参数
        trim_strings($input);
        //分页参数判断
        $this->checkPageParams($input);
        //转换一下参数
        $this->transformSearchParams($input);
        //联系M层
        $obj_list = $this->model->getOrderBomMotherMaterialList($input);
        $paging=$this->getPagingResponse($input);
        return  response()->json(get_success_api_response($obj_list,$paging));
    }
    /**
     * BOM子项查询
     * @param  \Illuminate\Http\Request  $request  Request实例
     * @return  \Illuminate\Http\Response
     * @author  sam.shan <sam.shan@ruis-ims.cn>
     */
    public function  bomItem(Request  $request)
    {
        //过滤,判断并提取所有的参数
        $input = $request->all();
        //trim过滤一下参数
        trim_strings($input);
        //分页参数判断
        $this->checkPageParams($input);
        //转换一下参数
        $this->transformSearchParams($input);
        if(!empty($input['identity']['identity_card_string'])) $input['identity_card_string']=$input['identity']['identity_card_string'];
        //联系M层
        $obj_list = $this->model->getBomItemMaterialList($input);
        $paging=$this->getPagingResponse($input);
        return  response()->json(get_success_api_response($obj_list,$paging));
    }

//endregion


//region 删

    /**
     * 删除一个物料
     * @param  \Illuminate\Http\Request  $request  Request实例
     * @return  string    返回json格式
     * @author   sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function destroy(Request $request)
    {
        $creator_id = (!empty(session('administrator')->admin_id)) ? session('administrator')->admin_id : 0;
        //判断ID是否提交
        $id = $request->input($this->model->apiPrimaryKey);
        if(empty($id) || !is_numeric($id)) TEA('700',$this->model->apiPrimaryKey);
        //呼叫M层进行处理
        $this->model->destroy($id,$creator_id);
        //获取返回值
        return  response()->json(get_success_api_response([$this->model->apiPrimaryKey=>$id]));
    }



//endregion

//region 拉取ERP物料和BOM
    /**
     * 拉取ERP物料和BOM
     * @author Bruce Chu
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function pullErpMaterialAndBOM(Request $request)
    {
        //前端传参 => 物料编码
        $item_no = $request->input('item_no');
        if (empty($item_no)) TEA('700', 'item_no');
        //联系M层入库
        $result = $this->model->pullErpMaterialAndBOM($item_no);
        return response()->json(get_success_api_response($result));
    }
//endregion


}