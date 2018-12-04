<?php


namespace App\Http\Models\Account;//定义命名空间
use App\Http\Models\Base;
use Illuminate\Support\Facades\DB;//引入DB操作类

/**
 * 菜单表
 * @author  sam.shan  <sam.shan@ruis-ims.cn>
 * @time    2018年01月12日14:33:31
 */
class Menu extends Base
{

    /**
     * 前端传递的api主键名称
     * @var string
     */
    public  $apiPrimaryKey='menu_id';


    public function __construct()
    {
        parent::__construct();
        $this->table=config('alias.rrm');
    }



//region  检


    /**
     * add/update参数检测
     * @param $input  array 要过滤判断的get/post数组
     * @return void         址传递,不需要返回值
     */
    public function checkFormFields(&$input)
    {
        //过滤参数
        trim_strings($input);
        //判断操作模式
        $add=$this->judgeApiOperationMode($input);

        //1.name 菜单名称  Y
            //1.1 不可以为空
        if(empty($input['name'])) TEA('700','name');
            //1.2 唯一性检测
        $check=$add?[['name','=',$input['name']]]:[['name','=',$input['name']],['id','<>',$input[$this->apiPrimaryKey]]];
        $has=$this->isExisted($check);
        if($has) TEA('922','name');
        //2.icon 字体标签  N
        //3.uri  资源     N
        //4.belong_to_uris 归属资源   N
        //5.  parent_id  上级分类  YS
        if($add){
                //5.1  数据类型正确与否
                if(!isset($input['parent_id']) || !is_numeric($input['parent_id']))  TEA('700','parent_id');
                if($input['parent_id']>0){
                //5.2  选择的上级分类必须是存在数据库中的分类
                $has=$this->isExisted([['id','=',$input['parent_id']]]);
                if(!$has) TEA('700','parent_id');
                //5.3 如果选择的上级分类已经存有具体实物,则不允许被其他分类选择作为上级分类[这里不需要]
            }

        }
        //6.sort  排序值   Y
        //7.status 状态   Y
        //8.forefathers 祖先路径
        if($add){
            #4.1 自动识别祖先路径
            if($input['parent_id']==0){
                $input['forefathers']='';
            }else{
                $f_forefathers=$this->getFieldValueById($input['parent_id'],'forefathers');
                $input['forefathers']=rtrim($f_forefathers,',').','.$input['parent_id'].',';
            }
        }


    }
//endregion
//region  增
    /**
     * 入库操作
     * @param $input array    input数组
     * @return int            返回插入表之后返回的主键值
     * @author     sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function add($input)
    {
        //获取入库数组,此处一定要严谨一些,否则前端传递额外字段将导致报错,甚至攻击
        $data=[
            'name'=>$input['name'],
            'icon'=>$input['icon'],
            'uri'=>$input['uri'],
            'belong_to_uris'=>$input['belong_to_uris'],
            'parent_id'=>$input['parent_id'],
            'sort'=>$input['sort'],
            'status'=>$input['status'],
            'forefathers'=>$input['forefathers'],
        ];
        //入库
        $insert_id=DB::table($this->table)->insertGetId($data);
        if(!$insert_id) TEA('802');
        //同步更新对应节点的代码
         $this->syncNode($insert_id,$data['uri'],$data['belong_to_uris']);
        return  $insert_id;
    }


//endregion
//region  修

    /**
     * 同步对应节点
     * @param $menu_id
     * @param $node
     * @author  sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function syncNode($menu_id,$node,$belong_to_node)
    {
        //先删除该菜单的相关节点
        DB::table(config('alias.rrn'))->where('menu_id',$menu_id)->update(['menu_id'=>0]);
        //再更显,此处代码有很大优化空间,因为后续仓促加上的
        DB::table(config('alias.rrn'))->where('node',$node)->update(['menu_id'=>$menu_id]);
        if(!empty($belong_to_node)){
            $belong_to_node_arr=explode(',',$belong_to_node);
            foreach($belong_to_node_arr as $node){
                if(!empty($node)) DB::table(config('alias.rrn'))->where('node',$node)->update(['menu_id'=>$menu_id]);
            }
        }
    }

    /**
     * 入库操作,编辑物料分类
     * 由于不能修改上级分类,所以判断辈分是否错乱就不需要了
     * @param $input
     * @throws \Exception
     * @author  sam.shan   <sam.shan@ruis-ims.cn>
     */
    public function update($input)
    {
        //获取编辑数组
        $data=[
            'name'=>$input['name'],
            'icon'=>$input['icon'],
            'uri'=>$input['uri'],
            'belong_to_uris'=>$input['belong_to_uris'],
            'sort'=>$input['sort'],
            'status'=>$input['status'],
        ];
        //入库
        $upd=DB::table($this->table)->where($this->primaryKey,$input[$this->apiPrimaryKey])->update($data);
        //当返回值为0的时候,表示影响的行数为0,即更新的内容未做任何改变或者说更新的记录不存在数据库中
        if($upd===false) TEA('804');
        //if($upd==0) TEA('805');
        //同步更新对应的节点
        $this->syncNode($input[$this->apiPrimaryKey],$data['uri'],$data['belong_to_uris']);
    }


//endregion
//region  查

    /**
     * 查看
     * @param $id  int  主键id
     * @return object   返回的是一个对象
     * @author  sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function get($id)
    {
        $obj=$this->getRecordById($id,['id','id as '.$this->apiPrimaryKey,'name','icon','uri','belong_to_uris','descendants_uris','sort','status','parent_id','forefathers']);
        if(!$obj) TEA('404');
        return $obj;
    }



    /**
     * 获取所有的菜单列表
     * @return object  返回对象集合
     * @author sam.shan   <sam.shan@ruis-ims.cn>
     * @todo  分类树少的时候适合采取,后续多的时候采用层级递进方式
     */
    public function getMenuList()
    {
        $obj_list=DB::table($this->table)->select(['id','id as '.$this->apiPrimaryKey,'name','icon','uri','belong_to_uris','sort','status','parent_id','forefathers'])
                                         ->orderBy('sort','asc')
                                         ->get();
        return $obj_list;

    }

    /**
     * 获取一级菜单
     * @return mixed
     * @author sam.shan  <sam.shan@ruis-ims.cn>
     */
    public  function oneLevel()
    {
        $obj_list=DB::table($this->table)->select(['id','id as '.$this->apiPrimaryKey,'name','icon','status'])
                                         ->where('parent_id',0)
                                         ->orderBy('sort','asc')
                                         ->get();
        return $obj_list;
    }

//endregion




//region  删


    /**
     * 物理删除
     * @param $id
     * @throws \Exception
     * @author   sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function destroy($id)
    {

        //存在一个儿子就禁止删除[更别说子孙一片了]
        $has_son=$this->isExisted([['parent_id','=',$id]]);
        if($has_son) TEA('904');
        //该分类使用已经使用了,使用的话,则禁止删除
//        $has=$this->isExisted([[$this->apiPrimaryKey,'=',$id]],config('alias.rrn'));
//        if($has) TEA('933');

        $num=$this->destroyById($id);
        if($num===false) TEA('803');
        if(empty($num))  TEA('404');

        //同步更新对应的节点
        $this->syncNode(0,$this->getFieldValueById($id,'uri'));
    }


//endregion

//region  菜单初始化


   public function   getDescendants($parent_id)
   {
       $obj_list=DB::table($this->table)
           ->select(['uri','belong_to_uris'])
           ->where('forefathers','like','%,'.$parent_id.',%')
           ->get();
       $descendants=[];
       foreach($obj_list  as $key=>$value){
              $uri=empty($value->uri)?[]:[$value->uri];
              $belong_to_uris=empty($value->belong_to_uris)?[]:explode(',',$value->belong_to_uris);
              $descendants=array_merge($descendants,$uri,$belong_to_uris);
       }
       return $descendants;
   }
    /**
     * 菜单初始化
     */
   public function initialize()
   {
       $sidebars=$this->getMenuList();
       foreach($sidebars as $key=>$value){
           $uri=empty($value->uri)?[]:[$value->uri];
           $belong_to_uris=empty($value->belong_to_uris)?[]:explode(',',$value->belong_to_uris);
           $descendants=$this->getDescendants($value->id);
           $data=['descendants_uris'=>implode(',',array_merge($uri,$belong_to_uris,$descendants))];
           $upd=DB::table($this->table)->where('id',$value->id)->update($data);
           //当返回值为0的时候,表示影响的行数为0,即更新的内容未做任何改变或者说更新的记录不存在数据库中
           if($upd===false) TEA('934');

       }

   }

//endregion













}



