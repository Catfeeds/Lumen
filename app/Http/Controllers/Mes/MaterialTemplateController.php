<?php
/**
 * Created by PhpStorm.
 * User: sam.shan
 * Date: 17/10/19
 * Time: 上午9:02
 */
namespace App\Http\Controllers\Mes;
use App\Http\Controllers\Controller;
use App\Http\Models\Material\Template;
use App\Libraries\Tree;
use Illuminate\Http\Request;



/**
 * 物料模板控制器类
 * @author  sam.shan  <sam.shan@ruis-ims.cn>
 * @time    2017年10月19日10:13:59
 */
class MaterialTemplateController extends Controller
{


    public function __construct()
    {
        parent::__construct();

        if(empty($this->model)) $this->model=new Template();
    }




//region  增




    /**
     * 物料模板类型所有字段检测唯一性
     * @param Request $request
     * @return string  返回json
     * @throws \App\Exceptions\ApiException
     * @author  sam.shan <sam.shan@ruis-ims.cn>
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
     * 添加物料模板
     * @param  \Illuminate\Http\Request  $request  Request实例
     * @return  string    返回json格式
     * @author  xujian
     */
    public function store(Request $request)
    {
        //获取所有参数
        $input=$request->all();
        //检测参数
        $this->model->checkFormFields($input);
        //呼叫M层进行处理
        $insert_id=$this->model->add($input,config('app.category.material'));
        //获取返回值
        $results=['template_id'=>$insert_id];
        return  response()->json(get_success_api_response($results));
    }




//endregion
//region  修-基础信息

    /**
     * 编辑模板
     * @param  \Illuminate\Http\Request  $request  Request实例
     * @return  \Illuminate\Http\JsonResponse     返回json格式
     * @author  xujian
     */
    public function update(Request $request)
    {
        //过滤,判断并提取所有的参数
        $input=$request->all();
        //id判断
        if(empty($input[$this->model->apiPrimaryKey]) || !is_numeric($input[$this->model->apiPrimaryKey])) TEA('700',$this->model->apiPrimaryKey);
        //集中营判断
        $this->model->checkFormFields($input);
        //呼叫M层进行处理
        $this->model->update($input);
        //获取返回值
        $results=[$this->model->apiPrimaryKey=>$input[$this->model->apiPrimaryKey]];
        return  response()->json(get_success_api_response($results));
    }


//endregion
//region  修-物料属性

    /**
     * 根据模板获取可选择的物料属性
     * @param  \Illuminate\Http\Request  $request  Request实例
     * @return  string  返回json格式
     * @author  sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function optionalMaterialAttributes(Request $request)
    {
        //过滤,判断并提取所有的参数
        $template_id=$request->input($this->model->apiPrimaryKey);
        if(empty($template_id) || !is_numeric($template_id)) TEA('700',$this->model->apiPrimaryKey);
        $obj_list=$this->model->getOptionalAttributesByTemplate($template_id,config('app.category.material'));
        return  response()->json(get_success_api_response($obj_list));
    }

    /**
     * 根据模板获取已经选择的物料属性
     * @param  \Illuminate\Http\Request  $request  Request实例
     * @return  string  返回json格式
     * @author  sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function selectedMaterialAttributes(Request $request)
    {
        //过滤,判断并提取所有的参数
        $template_id=$request->input($this->model->apiPrimaryKey);
        if(empty($template_id) || !is_numeric($template_id)) TEA('700',$this->model->apiPrimaryKey);
        $obj_list=$this->model->getSelectedAttributesByTemplate($template_id,config('app.category.material'));
        return  response()->json(get_success_api_response($obj_list));
    }

    /**
     * 根据模板获取继承的物料属性
     * @param  \Illuminate\Http\Request  $request  Request实例
     * @return  string  返回json格式
     * @author  sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function extendMaterialAttributes(Request $request)
    {
        //过滤,判断并提取所有的参数
        $template_id=$request->input($this->model->apiPrimaryKey);
        if(empty($template_id) || !is_numeric($template_id)) TEA('700',$this->model->apiPrimaryKey);
        $obj_list=$this->model->getExtendAttributesByTemplate($template_id,config('app.category.material'));
        return  response()->json(get_success_api_response($obj_list));
    }
    /**
     * 保存物料属性
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     * @author   sam.shan  <sam.shan@ruis-ims.cn>
     */
    public  function   bindMaterialAttributes(Request  $request)
    {

        //过滤,判断并提取所有的参数
        $input=$request->all();
        $this->model->saveAttributes($input,config('app.category.material'));
        //拼接返回值
        $results=[$this->model->apiPrimaryKey=>$input[$this->model->apiPrimaryKey]];
        return  response()->json(get_success_api_response($results));

    }


//endregion
//region  修-工艺属性

    /**
     * 根据模板获取可选择的工艺属性(它没有继承,所以不需要踢出继承)
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     * @author  sam.shan   <sam.shan@ruis-ims.cn>
     */
    public   function   optionalOperationAttributes(Request  $request)
    {

        //过滤,判断并提取所有的参数
        $template_id=$request->input($this->model->apiPrimaryKey);
        if(empty($template_id) || !is_numeric($template_id)) TEA('700',$this->model->apiPrimaryKey);
        $obj_list=$this->model->getOptionalAttributesByTemplate($template_id,config('app.category.operation'));
        return  response()->json(get_success_api_response($obj_list));
    }



    /**
     * 根据模板获取已经选择的工艺属性
     * @param  \Illuminate\Http\Request  $request  Request实例
     * @return  string  返回json格式
     * @author  sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function selectedOperationAttributes(Request $request)
    {
        //过滤,判断并提取所有的参数
        $template_id=$request->input($this->model->apiPrimaryKey);
        if(empty($template_id) || !is_numeric($template_id)) TEA('700',$this->model->apiPrimaryKey);
        $obj_list=$this->model->getSelectedAttributesByTemplate($template_id,config('app.category.operation'));
        return  response()->json(get_success_api_response($obj_list));
    }



    /**
     * 根据勾选的工序筛选工艺属性
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     * @author sam.shan   <sam.shan@ruis-ims.cn>
     */
    public function  linkOperationAttributes(Request $request)
    {
        //获取参数并过滤
        $input=$request->all();
        trim_strings($input);
        //模板
        if(empty($input[$this->model->apiPrimaryKey]) || !is_numeric($input[$this->model->apiPrimaryKey])) TEA('700','template_id');
        //选择的工序
        if(!isset($input['operation_ids']) || !is_array($input['operation_ids'])) TEA('700','operations_ids');
        foreach($input['operation_ids'] as $key=>$value){
            if(!is_numeric($value)) TEA('701','operations_ids');
        }
        //联系M层
        $obj_list=$this->model->getLinkAttributesByTemplateOperations($input[$this->model->apiPrimaryKey],$input['operation_ids'],config('app.category.operation'));
        return  response()->json(get_success_api_response($obj_list));


    }

    /**
     * 保存绑定的工艺属性
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     * @author  sam.shan <sam.shan@ruis-ims.cn>
     */
    public  function   bindOperationAttributes(Request  $request)
    {
        //过滤,判断并提取所有的参数
        $input=$request->all();
        $this->model->saveAttributes($input,config('app.category.operation'));
        //拼接返回值
        return  response()->json(get_success_api_response([$this->model->apiPrimaryKey=>$input[$this->model->apiPrimaryKey]]));

    }




//endregion
//region  修-属性过滤设置

    /**
     * 属性过滤设置展示接口
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse  返回json
     * @author  sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function attributesFilter(Request $request)
    {
        //过滤,判断并提取所有的参数
        $input=$request->all();
        if(empty($input[$this->model->apiPrimaryKey]) || !is_numeric($input[$this->model->apiPrimaryKey])) TEA('700',$this->model->apiPrimaryKey);
        $obj_list=$this->model->attributesFilterList($input,config('app.category.material'),config('app.category.operation'));
        //拼接返回值
        return  response()->json(get_success_api_response($obj_list));
    }

    /**
     * 保存属性过滤值
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     * @author sam.shan <sam.shan@ruis-ims.cn>
     */
    public  function setAttributesFilter(Request $request)
    {
        //过滤,判断并提取所有的参数
        $input=$request->all();;
        $this->model->saveAttributesFilter($input);
        //拼接返回值
        return  response()->json(get_success_api_response([$this->model->apiPrimaryKey=>$input[$this->model->apiPrimaryKey]]));

    }




//endregion





//region  查

    /**
     * 查看模板
     * @param   \Illuminate\Http\Request  $request   Request实例
     * @return  string  返回json|jsonp格式
     * @author  sam.shan <sam.shan@ruis-ims.cn>
     */
    public function show(Request $request)
    {
        //判断ID是否提交
        $id=$request->input($this->model->apiPrimaryKey);
        if(empty($id)|| !is_numeric($id)) TEA('700',$this->model->apiPrimaryKey);
        //呼叫M层进行处理
        $results=$this->model->get($id);
        return  response()->json(get_success_api_response($results));
    }





    /**
     * 根据类型获取模板列表[需要传递分页参数]
     * @param  \Illuminate\Http\Request  $request  Request实例
     * @return  \Illuminate\Http\Response
     * @author   xujian
     * @reviser  sam.shan <sam.shan@ruis-ims.cn>
     */
    public function  pageIndex(Request  $request)
    {
        //过滤,判断并提取所有的参数
        $input=$request->all();
        //trim过滤一下参数
        trim_strings($input);
        //分页参数判断
        $this->checkPageParams($input);
        //根据category_id查询相关的自定义参数值
        $obj_list=$this->model->getPageTemplateList($input,config('app.category.material'));
        $paging=$this->getPagingResponse($input);
        return  response()->json(get_success_api_response($obj_list,$paging));
    }

    /**
     * 物料模板树形结构列表
     * @return  string   返回json
     * @author  sam.shan  <san.shan@ruis-ims.cn>
     */
    public function  treeIndex()
    {
        //呼叫M层进行处理
        $obj_list=$this->model->getTemplateList(config('app.category.material'));
        $results=Tree::findDescendants($obj_list);
        return  response()->json(get_success_api_response($results));
    }


    /**
     * 返回生效的所有的物料模板的树形结构
     * @return  string   返回json
     * @author  sam.shan  <san.shan@ruis-ims.cn>
     */
    public function  select(Request $request)
    {
        $name = $request->input('name');
        //呼叫M层进行处理
        if(empty($name)){
            $obj_list=$this->model->getSelectTemplateList(config('app.category.material'));
        }else{
            $obj_list = $this->model->getSelectTemplateListByWhere($name);
        }
        $results=Tree::findDescendants($obj_list);
        return  response()->json(get_success_api_response($results));
    }




//endregion
//region  删


    /**
     * 删除一个模板
     * @param  \Illuminate\Http\Request  $request  Request实例
     * @return  string    返回json格式
     * @author   sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function destroy(Request $request)
    {

        //判断ID是否提交
        $id=$request->input($this->model->apiPrimaryKey);
        if(empty($id)|| !is_numeric($id)) TEA('700',$this->model->apiPrimaryKey);
        //呼叫M层进行处理
        $this->model->destroyMaterialTemplate($id);
        return  response()->json(get_success_api_response([$this->model->apiPrimaryKey=>$id]));
    }




//endregion

























}