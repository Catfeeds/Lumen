<?php
/**
 * Created by PhpStorm.
 * User: sam.shan
 * Date: 17/10/19
 * Time: 上午9:02
 */

namespace App\Http\Controllers\Mes;//定义命名空间
use App\Http\Controllers\Controller;//引入基础控制器类
use Illuminate\Http\Request;//获取请求参数
use App\Http\Models\Material\AttributeDefinition;//自定义属性数据处理模型


/**
 * 物料属性管理控制器
 * @author sam.shan   <sam.shan@ruis-ims.cn>
 * @time    2017年09月25日
 */
class MaterialAttributeDefinitionController extends Controller
{



    public function __construct()
    {
        parent::__construct();
        if(empty($this->model)) $this->model=new AttributeDefinition();
    }

//region  增



    /**
     * 自定义属性所有字段检测唯一性
     * @param Request $request
     * @return string  返回json
     * @throws \App\Exceptions\ApiException
     * @author  sam.shan   <sam.shan@ruis-ims.cn>
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
     * 添加自定义参数
     * @param  \Illuminate\Http\Request  $request  Request实例
     * @return  string    返回json格式
     * @author  xujian
     * @reviser sam.shan   <sam.shan@ruis-ims.cn>
     */
    public function store(Request $request)
    {

        //获取所有参数
        $input=$request->all();
        //检测参数
        $this->model->checkFormFields($input);
        //呼叫M层进行处理
        $insert_id=$this->model->add($input,config('app.category.material'));
        //返回前端
        $results=[$this->model->apiPrimaryKey=>$insert_id];
        return  response()->json(get_success_api_response($results));
    }






//endregion
//region  修



    /**
     * 编辑自定义参数
     * @param  \Illuminate\Http\Request  $request  Request实例
     * @return  \Illuminate\Http\JsonResponse     返回json格式
     * @author  xujian
     */
    public function update(Request $request)
    {
        //过滤,判断并提取所有的参数
        $input=$request->all();
        //id判断,一定要在集中监测前判断,编辑比较特殊
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
//region  查



    /**
     * 查看自定义属性
     * @param   \Illuminate\Http\Request  $request   Request实例
     * @return  string  返回json
     * @author  xujian
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
     * 通过类型获取属性自定义的列表列表[需要传递分页参数]
     * @return  \Illuminate\Http\Response
     * @author   sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function  pageIndex(Request $request)
    {

        $input=$request->all();
        //trim过滤一下参数
        trim_strings($input);
        //分页参数判断
        $this->checkPageParams($input);
        //获取数据
        $obj_list=$this->model->getAttributeList($input,config('app.category.material'));
        //获取返回值
        $paging=$this->getPagingResponse($input);
        return  response()->json(get_success_api_response($obj_list,$paging));
    }



//endregion
//region  删




    /**
     * 删除一个自定义参数
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
        $this->model->destroy($id);
        //获取返回值
        $results=[$this->model->apiPrimaryKey=>$id];
        return  response()->json(get_success_api_response($results));
    }




//endregion




















}