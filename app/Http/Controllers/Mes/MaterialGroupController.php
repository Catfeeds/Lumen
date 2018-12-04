<?php
/**
 * Created by PhpStorm.
 * User: sansheng
 * Date: 17/9/21
 * Time: 上午9:02
 */
namespace App\Http\Controllers\Mes;
use App\Http\Controllers\Controller;
use App\Http\Models\MaterialGroup;//物料分组操作类
use App\Libraries\Tree;
use Illuminate\Http\Request;

/**
 * 物料分组控制器
 * @author  sam.shan  <sam.shan@ruis-ims.cn>
 * @time    2017年09月20日08:45:47
 */
class MaterialGroupController extends Controller
{

    /**
     * 构造方法初始化需要的数据操作类
     */
    public function __construct()
    {
        parent::__construct();
        if(empty($this->model)) $this->model=new MaterialGroup();
    }
    /**
     * 添加或者编辑物料分类时候进行的提交数据处理
     * @param $input  array 要过滤判断的get/post数组
     * @return void         址传递,不需要返回值
     */
    public function checkFormFields(&$input)
    {
        //trim过滤
        trim_strings($input);
        //code
        if(empty($input['code'])) TEA('2002','code');
        if(!preg_match('/^[A-Z]{1,10}+$/',$input['code'])) TEA('2004','code');
        //name
        if(empty($input['name'])) TEA('2000','name');
        //material_category_ids
        if(!isset($input['material_category_ids']) || (!empty($input['material_category_ids']) && !is_array($input['material_category_ids'])) ) TEA('707','material_category_ids');
        $input['material_category_ids']=(array)$input['material_category_ids']; //当前台可选项只有一个，且勾选一个的时候，有可能传递过来不是数组，所以我们必须强制转换
        //description
        if(!isset($input['description'])) TEA('702','description');
        if( mb_strlen($input['description'])>500)  TEA('2005','description');
    }

    /**
     * 添加物料分组
     * @return   string  json
     * @author   sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function store(Request  $request)
    {

       //获取所有参数
       $input=$request->all();
       //参数检测
       $this->checkFormFields($input);
       //呼叫M层进行处理
       $insert_id=$this->model->add($input);
       //拼接返回值
       $response=get_api_response('200');
       $response['results']=['material_group_id'=>$insert_id];
       return  response()->json($response);
    }

    /**
     * 物理删除物料分组记录
     * @param Request $request
     * @return string  返回json字符串
     * @author sam.shan  <sam.shan@ruis-ims.cn>
     */
    public  function  destroy(Request $request)
    {
        //判断ID是否提交
        $id=$request->input('id');
        if(empty($id)|| !is_numeric($id)) TEA('703','id');
        //呼叫M层进行处理
        $this->model->destroy($id);
        $response=get_api_response('200');
        return  response()->json($response);
    }

    /**
     * 编辑物料分组
     * @param Request $request
     * @return  string  返回json
     * @author  sam.shan  <sam.shan@ruis-ims.cn>
     */
    public  function update(Request $request)
    {
        //业务权限判断
        //过滤,判断并提取所有的参数
        $input=$request->all();
        //id判断
        if(empty($input['id']) || !is_numeric($input['id'])) TEA('703','id');
        //集中营判断
        $this->checkFormFields($input);
        //呼叫M层进行处理
        $this->model->update($input);
        //拼接返回值
        $response=get_api_response('200');
        $response['results']=['material_group_id'=>$input['id']];
        return  response()->json($response);
    }

    /**
     * 物料分组查询某条记录
     * @param Request $request
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
     * 物料分组列表
     * @param Request $request
     * @return string  返回json
     * @author  sam.shan  <san.shan@ruis-ims.cn>
     */
    public function  index(Request  $request)
    {
        //呼叫M层进行处理
        $response=get_api_response('200');
        $response['results']=$this->model->getGroupsList();
        return  response()->json($response);
    }



    /**
     * 物料分组所有字段检测唯一性
     * @param Request $request
     * @return string  返回json
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
     * 添加或者编辑物料分组的时候获取的关联分类select列表
     * @param Request $request
     * @return  string    返回json
     * @author  sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function  select(Request $request)
    {

        //获取传递的分组ID
        $group_id=$request->input('material_group_id','0');
        //呼叫M层进行处理
        $obj_list=$this->model->getCategoriesList();
        $tree_list=Tree::findDescendants($obj_list);
        //获取这个分组的关联分类
        $material_category_ids=[];
        if($group_id>0) $material_category_ids=$this->model->getMaterialCategoryIdsByGroupId($group_id);
        //遍历
        foreach ($tree_list as $key => &$value) {
            $value->selected=in_array($value->id,$material_category_ids)?1:0;
        }
        $response=get_api_response('200');
        $response['results']=$tree_list;
        return  response()->json($response);
    }


    /**
     * 物料分组选择关联分类的实时检测
     * @param Request $request
     * @author  sam.shan   <sam.shan@ruis-ims.cn>
     */
    public function  choose(Request $request)
    {
        //获取关联分类IDs
        $material_category_ids=$request->input('material_category_ids');
        $material_category_id=$request->input('material_category_id');
        //检测
        if(empty($material_category_ids) || !is_array($material_category_ids))  TEA('707');
        if(empty($material_category_id) || !is_numeric($material_category_id))  TEA('708');
        //判断
        $this->model->judgeRelateCategory($material_category_ids,$material_category_id);
        $response=get_api_response('200');
        return  response()->json($response);

    }


















}


