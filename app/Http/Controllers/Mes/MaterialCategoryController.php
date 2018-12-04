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
use Illuminate\Http\Request;
use App\Http\Models\Material\MaterialCategory;//引入新版物料分类处理类


/**
 * 物料分类管理控制器
 * @author  sam.shan  <sam.shan@ruis-ims.cn>
 * @time    2017年09月14日10:13:59
 */
class MaterialCategoryController extends Controller
{

    /**
     * 构造方法初始化操作类
     */
    public function __construct()
    {
      parent::__construct();
      if(empty($this->model)) $this->model=new MaterialCategory();
    }


//region  增
    /**
     * 添加时候的检测唯一性
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
     * 添加物料分类
     * @return   string   json
     * @author   sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function store(Request  $request)
    {
        //过滤,判断并提取所有的参数
        $input=$request->all();
        $this->model->checkFormFields($input);
        //呼叫M层进行处理
        $insert_id=$this->model->add($input);
        //返回前端
        return  response()->json(get_success_api_response(['material_category_id'=>$insert_id]));
    }
//endregion
//region  修


    /**
     * 编辑物料分类
     * @param Request $request
     * @return  string
     * @author  sam.shan  <sam.shan@ruis-ims.cn>
     */
    public  function update(Request $request)
    {
        //过滤,判断并提取所有的参数
        $input=$request->all();
        //id判断
        if(empty($input[$this->model->apiPrimaryKey]) || !is_numeric($input[$this->model->apiPrimaryKey])) TEA('700',$this->model->apiPrimaryKey);
        //集中营判断
        $this->model->checkFormFields($input);
        //呼叫M层进行处理
        $this->model->update($input);
        //返回前端结果
        $results=[$this->model->apiPrimaryKey=>$input[$this->model->apiPrimaryKey]];
        return  response()->json(get_success_api_response($results));
    }
//endregion
//region  查



    /**
     * 查看物料分类
     * @param Request $request
     * @return string   返回json
     * @author  sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function  show(Request $request)
    {

        //判断ID是否提交
        $id=$request->input($this->model->apiPrimaryKey);
        if(empty($id)|| !is_numeric($id)) TE('700',$this->model->apiPrimaryKey);
        //呼叫M层进行处理
        $results=$this->model->get($id);
        //成功返回前端
        return  response()->json(get_success_api_response($results));
    }

    /**
     * 物料分类树形列表
     * @param Request $request
     * @return  string   返回json
     * @author  sam.shan  <san.shan@ruis-ims.cn>
     */
    public function  treeIndex()
    {
        //呼叫M层进行处理
        $obj_list=$this->model->getCategoriesList();
        $results=Tree::findDescendants($obj_list);
        return  response()->json(get_success_api_response($results));
    }

    /**
     * 添加或者编辑物料分类的时候获取的select列表
     * @param Request $request
     * @return  string    返回json
     * @todo  虽然返回值与treeIndex一致,但不赞同公用,保持业务接口独立性,解耦
     * @author  sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function  select(Request $request)
    {
        $name = $request->input('name');
        //呼叫M层进行处理
        if(empty($name)){
            $obj_list=$this->model->getCategoriesList();
        }else{
            $obj_list = $this->model->getCategoriesListByWhere($name);
        }
        $tree_list=Tree::findDescendants($obj_list);
        return  response()->json(get_success_api_response($tree_list));
    }





//endregion
//region  删



    /**
     * 删除物料分类
     * @param Request $request
     * @return   string  json
     * @author   sam.shan  <sam.shan@ruis-ims.cn>
     */
    public  function  destroy(Request $request)
    {
        //判断ID是否提交
        $id=$request->input($this->model->apiPrimaryKey);
        if(empty($id)|| !is_numeric($id)) TEA('700',$this->model->apiPrimaryKey);
        //呼叫M层进行处理
        $this->model->destroy($id);
        //获取返回值
        return  response()->json(get_success_api_response([$this->model->apiPrimaryKey=>$id]));

    }




//endregion






}


