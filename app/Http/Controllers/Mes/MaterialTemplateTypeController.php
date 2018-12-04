<?php
/**
 * Created by PhpStorm.
 * User: sansheng
 * Date: 17/9/21
 * Time: 上午9:02
 */
namespace App\Http\Controllers\Mes;
use App\Http\Controllers\Controller;
use App\Libraries\Tree;
use Illuminate\Http\Request;//引入Request类
use App\Http\Models\MaterialType;//物料模板类型操作类
/**
 * 物料类型管理控制器类[这个物料类型,准确的说应该是物料模板类型]
 * @author  sam.shan  <sam.shan@ruis-ims.cn>
 * @time    2017年09月21日08:59:04
 */

class MaterialTemplateTypeController extends Controller
{

    /**
     * 构造方法初始化需要的数据操作类
     */
    public function __construct()
    {
        parent::__construct();
        if(empty($this->model)) $this->model=new MaterialType();
    }

    /**
     * 添加或者编辑物料模板类型时候进行的提交数据处理
     * 尽量防呆检测,避免前端传递参数的失误造成入库数据的异常,当然过分精细的检测也不推荐,比如枚举类型的值不需要进行精细排查
     * 不建议使用ORM那套检验参数的封装,灵活度太低了,大部分框架都有这种检测封装
     * @param $input  array 要过滤判断的get/post数组
     * @return void         址传递,不需要返回值
     * @todo  后续封装一个不依赖独立模型本身的验证工具validate进行封装吧
     * @todo  个人感觉这样的书写检测更灵活一些,适当的违背封装性不失为一种好的抉择.因为从api设计角度要保证接口的单元性,尽量避免太宽泛的封装性
     * @author   sam.shan   <sam.shan@ruis-ims.cn>
     */
    public function checkFormFields(&$input)
    {
        //过滤
        trim_strings($input);
        //parent_id
        if(!isset($input['parent_id']) || !is_numeric($input['parent_id']))  TEA('700','parent_id');
        //key
        if(empty($input['key'])) TEA('4000','key');
        if(!preg_match('/^[a-zA-Z][a-z_A-Z]{2,49}+$/',$input['key'])) TEA('4001','key');
        //name
        if(empty($input['name'])) TEA('4002','name');
        //label
        if(!isset($input['label']))  TEA('704','label');
        //is_packaging
        if(!isset($input['is_packaging']) || !is_numeric($input['is_packaging'])) TEA('701','is_packaging');
        //description
        if(!isset($input['description'])) TEA('702','description');
        if( mb_strlen($input['description'])>500)  TEA('4003','description');
    }
    /**
     * 添加物料模板类型
     * Store a newly created resource in storage.
     * @param  \Illuminate\Http\Request  $request  Request实例
     * @return  string    返回json格式
     * @author  sam.shan   <sam.shan@ruis-ims.cn>
     */
    public function store(Request $request)
    {

        //获取所有参数
        $input=$request->all();
        //检测参数
        $this->checkFormFields($input);
        //呼叫M层进行处理
        $insert_id=$this->model->add($input);
        //获取返回值
        $response=get_api_response('200');
        $response['results']=['material_type_id'=>$insert_id];
        return  response()->json($response);
    }
    /**
     * 删除[至于到底是物理删除还是软删除取决于表中是否有is_del字段]
     * Remove the specified resource from storage.
     * @param \Illuminate\Http\Request  $request  Request实例
     * @return  string         返回json
     * @author    sam.shan     <sam.shan@ruis-ims.cn>
     */
    public function destroy(Request $request)
    {
        //判断ID是否提交
        $id=$request->input('id');
        if(empty($id)|| !is_numeric($id)) TEA('703','id');
        //呼叫M层进行处理
        $this->model->destroy($id);
        //获取返回值
        $response=get_api_response('200');
        return  response()->json($response);
    }

    /**
     * 编辑物料模板类型
     * Update the specified resource in storage.
     * @param  \Illuminate\Http\Request  $request  Request实例
     * @return  string     返回json格式
     * @author  sam.shan   <sam.shan@ruis-ims.cn>
     */
    public function update(Request $request)
    {
        //过滤,判断并提取所有的参数
        $input=$request->all();
        //id判断
        if(empty($input['id']) || !is_numeric($input['id'])) TEA('703','id');
        //集中营判断
        $this->checkFormFields($input);
        //呼叫M层进行处理
        $this->model->update($input);
        //获取返回值
        $response=get_api_response('200');
        $response['results']=['material_type_id'=>$input['id']];
        return  response()->json($response);
    }

    /**
     * 查看某个物料模板类型
     * Display the specified resource.
     * @param   \Illuminate\Http\Request  $request   Request实例
     * @return  string  返回json|jsonp格式
     * @author  sam.shan   <sam.shan@ruis-ims.cn>
     */
    public function show(Request $request)
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
     * 获取所有物料模板类型列表
     * Display a listing of the resource.
     * @param   \Illuminate\Http\Request  $request   Request实例
     * @return  string  返回json
     * @author  sam.shan   <sam.shan@ruis-ims.cn>
     */
    public function treeIndex()
    {

        //呼叫M层进行处理
        $obj_list=$this->model->getTypesList();
        $response=get_api_response('200');
        $response['results']=Tree::findDescendants($obj_list);
        return  response()->json($response);

    }


    /**
     * 物料模板类型所有字段检测唯一性
     * @param Request $request
     * @return string  返回json
     * @throws \App\Exceptions\ApiException
     * @author  sam.shan <sam.shan@ruis-ims.cn>
     */
    public  function unique(Request $request)
    {

        //id
        $id=$request->input('id');
        //field
        $field=$request->input('field');
        if(empty($field)) TEA('705','field');
        //value
        $value=$request->input('value');
        if(empty($value)) TEA('706','value');
        //拼接where条件
        $where=[[$field,'=',$value]];
        if(!empty($id)) $where[]=[$this->model->primaryKey,'<>',$id];
        $has=$this->model->isExisted($where);
        //拼接返回值
        $response=get_api_response('200');
        $response['results']=['exist'=>$has,'field'=>$field,'value'=>$value];
        if(!empty($id)) $response['results']['id']=$id;
        return  response()->json($response);

    }



    /**
     * 添加或者编辑物料模板类型的时候获取的select列表
     * @param Request $request
     * @return  string    返回json
     * @author  sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function  select(Request $request)
    {

        //获取编辑的时候,selected
        $type_id=$request->input('material_type_id','0');


        //呼叫M层进行处理
        $obj_list=$this->model->getTypesList();
        $tree_list=Tree::findDescendants($obj_list);
        //遍历
        foreach ($tree_list as $key => &$value) {
            $value->selected=$value->id==$type_id?1:0;
        }
        $response=get_api_response('200');
        $response['results']=$tree_list;
        return  response()->json($response);
        
    }



//    public function  schema()
//    {
//
//        $this->model->schema();
//
//    }







}


