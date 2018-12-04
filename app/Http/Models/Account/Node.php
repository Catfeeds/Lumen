<?php


namespace App\Http\Models\Account;//定义命名空间
use App\Http\Models\Base;
use Illuminate\Support\Facades\DB;//引入DB操作类

/**
 * 权限节点表
 * @author  sam.shan  <sam.shan@ruis-ims.cn>
 * @time    2018年01月12日14:33:31
 */
class Node extends Base
{

    /**
     * 前端传递的api主键名称
     * @var string
     */
    public  $apiPrimaryKey='node_id';


    public function __construct()
    {
        parent::__construct();
        $this->table=config('alias.rrn');
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
        //1.name 节点名称   YU
            #1.1 不可以为空
        if(empty($input['name'])) TEA('700','name');
            #1.2 唯一性检测
        $check=$add?[['name','=',$input['name']]]:[['name','=',$input['name']],[$this->primaryKey,'<>',$input[$this->apiPrimaryKey]]];
        $has=$this->isExisted($check);
        if($has) TEA('913','name');
        //2.node  YUS
        if($add){
            #2.1 不可以为空
            if(empty($input['node'])) TEA('700','node');
            #2.2 唯一性检测
            $check=$add?[['node','=',$input['node']]]:[['node','=',$input['node']],[$this->primaryKey,'<>',$input[$this->apiPrimaryKey]]];
            $has=$this->isExisted($check);
            if($has) TEA('914','node');
        }
        //3.type  Y 节点类型
        //4.menu_id  N 归属的菜单
        //5.status  Y 状态


    }


    /**
     * 检查表格编辑
     * @explain              编辑字段检测
     * @return  异常处理
     * @author sam.shan   <sam.shan@ruis-ims.cn>
     */
    public function checkTableUpdate($input)
    {

        //node不可以修改
        if($input['field']=='node') TEA('916');
        //name检测
        if($input['field']=='name'){
            $check=[['name','=',$input['value']],['id','<>',$input['pk']]];
            $has=$this->isExisted($check);
            if($has) TEA('913','name');
        }
    }



//endregion
//region  增

    /**
     * 添加
     * @param $input array    input数组
     * @return int            返回插入表之后返回的主键值
     * @author     sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function add($input)
    {

        //获取入库数组,此处一定要严谨一些,否则前端传递额外字段将导致报错,甚至攻击
        $data=[
            'name'=>$input['name'],
            'node'=>$input['node'],
            'type'=>$input['type'],
            'menu_id'=>$input['menu_id'],
            'status'=>$input['status'],
            'created_at'=>date('Y-m-d H:i:s',time()),
            'updated_at'=>date('Y-m-d H:i:s',time()),
        ];
        //入库
        $insert_id=DB::table($this->table)->insertGetId($data);
        if(!$insert_id) TEA('802');
        return  $insert_id;
    }


//endregion
//region  修



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
            //'node'=>$input['node'],
            'type'=>$input['type'],
            'menu_id'=>$input['menu_id'],
            'status'=>$input['status'],
            'updated_at'=>date('Y-m-d H:i:s',time()),
        ];
        //入库
        $upd=DB::table($this->table)->where($this->primaryKey,$input[$this->apiPrimaryKey])->update($data);
        //当返回值为0的时候,表示影响的行数为0,即更新的内容未做任何改变或者说更新的记录不存在数据库中
        if($upd===false) TEA('804');
        //if($upd==0) TEA('805');
    }


    /**
     * 表格编辑
     * @param $input
     * @throws \Exception
     * @author  sam.shan   <sam.shan@ruis-ims.cn>
     */
    public function tableUpdate($input)
    {
        //获取编辑数组
        $data=[$input['field']=>$input['value']];
        //入库
        $upd=$this->updateById($input['pk'],$data);
        if($upd===false) TEA('804');
        if($upd==0) TEA('805');
    }



//endregion



//region 查

    /**
     * 获取子孙后代ids
     * @param $template_id
     * @return array
     * @author   sam.shan <sam.shan@ruis-ims.cn>
     */
    public function  getMenuIdsByForefatherId($menu_id)
    {
        $menu_ids=DB::table(config('alias.rrm'))
            ->where('forefathers','like','%,'.$menu_id.',%')
            ->pluck('id');
        return  json_decode(json_encode($menu_ids),true);
    }

    /**
     * 分页查询列表
     * @param $input
     * @return mixed
     * @author  sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function getNodeList(&$input)
    {
        //1.创建公共builder
            //1.1where条件预搜集
        $where = [];
        !empty($input['type']) && $where[] = ['rrn.type', '=',$input['type']];
        !empty($input['node']) && $where[] = ['rrn.node', 'like', '%' . $input['node'] . '%'];
        !empty($input['name']) && $where[] = ['rrn.name', 'like', '%' . $input['name'] . '%'];
        isset($input['status']) && is_numeric($input['status']) && $where[]=['rrn.status','=',$input['status']];
            //1.2.预生成builder,注意仅仅在get中需要的连表请放在builder_get中
        $builder = DB::table($this->table.' as rrn')
            ->leftJoin(config('alias.rrm').' as rrm','rrn.menu_id', '=', 'rrm.id');
            //1.3 where条件拼接
        if (!empty($where)) $builder->where($where);
            //1.4 whereIn条件拼接
        if (!empty($input['menu_ids'])) $builder->whereIn('rrn.menu_id',$input['menu_ids']);
        //2.总共有多少条记录
        $input['total_records'] = $builder->count();
        //3.select查询
        $builder_get=$builder;
           //3.1拼接分页条件
        $builder_get->select('rrn.id','rrn.id as node_id','rrn.type','rrm.name as menu_name','rrm.id as menu_id','rrn.name','rrn.node','rrn.status','rrn.created_at')
            ->offset(($input['page_no'] - 1) * $input['page_size'])
            ->limit($input['page_size']);
            //3.2 order排序
        if (!empty($input['order']) && !empty($input['sort'])) $builder_get->orderBy('rrn.'.$input['sort'], $input['order']);
        //3.3 get查询
        $obj_list = $builder_get->get();


        return $obj_list;
    }


    /**
     * select查询列表
     * @param $input
     * @return mixed
     * @author  sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function getSelectNodeList(&$input)
    {
        //1.创建公共builder
            //1.1where条件预搜集
        $where[] =['rrn.type', '=',config('app.node_type.need_auth')];
        !empty($input['node']) && $where[] = ['rrn.node', 'like', '%' . $input['node'] . '%'];
        !empty($input['name']) && $where[] = ['rrn.name', 'like', '%' . $input['name'] . '%'];
        isset($input['status']) && is_numeric($input['status']) && $where[]=['rrn.status','=',$input['status']];
            //1.2.预生成builder,注意仅仅在get中需要的连表请放在builder_get中
        $builder = DB::table($this->table.' as rrn')
            ->leftJoin(config('alias.rrm').' as rrm','rrn.menu_id', '=', 'rrm.id');
             //1.3 where条件拼接
        if (!empty($where)) $builder->where($where);
             //1.4 whereIn条件拼接
        if (!empty($input['menu_ids'])) $builder->whereIn('rrn.menu_id',$input['menu_ids']);
        //2.总共有多少条记录
        $input['total_records'] = $builder->count();
        //3.select查询
        $builder_get=$builder;
             //3.1拼接分页条件
        $builder_get->select('rrn.id','rrn.id as node_id','rrn.type','rrm.name as menu_name','rrm.id as menu_id','rrn.name','rrn.node','rrn.status','rrn.created_at')
            ->offset(($input['page_no'] - 1) * $input['page_size'])
            ->limit($input['page_size']);
             //3.2 order排序
        if (!empty($input['order']) && !empty($input['sort'])) $builder_get->orderBy('rrn.'.$input['sort'], $input['order']);
             //3.3 get查询
        $obj_list = $builder_get->get();


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

        //该节点使用的话,则禁止删除
        $has=$this->isExisted([[$this->apiPrimaryKey,'=',$id]],config('alias.rra'));
        if($has) TEA('915');
        $num=$this->destroyById($id);
        if($num===false) TEA('803');
        if(empty($num))  TEA('404');
    }


//endregion

//region 赋予角色


    /**
     * 某个节点赋予了哪些角色
     * @param $node_id  节点ID
     * @return mixed
     * @author  sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function getRolesByNode($node_id)
    {

        return   $db_ref_obj=DB::table(config('alias.rra'))->where('node_id',$node_id)->pluck('role_id');
    }

    /**
     * 赋予角色
     * @param $input
     */
    public  function  node2role($input)
    {
        //1.获取数据库中该节点已经赋予的角色
        $db_ref_obj=DB::table(config('alias.rra'))->where('node_id',$input['node_id'])->pluck('role_id');
        $db_ids=obj2array($db_ref_obj);
        //2.获取前端传递的附件
        $input_ids=(array)$input['role_ids'];
        //3.通过颠倒位置的差集获取改动情况,多字段要考虑编辑的情况额[有的人喜欢先删除所有然后变成全部添加,这种是错误的投机取巧行为,要杜绝!]
        $set=get_array_diff_intersect($input_ids,$db_ids);
        if(!empty($set['add_set']) || !empty($set['del_set']) || $set['common_set'])  $m=new Auth();
        //4.要添加的
        if(!empty($set['add_set']))  $m->addSetRoles($set['add_set'],$input['node_id']);
        //5.要删除
        if(!empty($set['del_set']))  $m->delSetRoles($set['del_set'],$input['node_id']);


    }
//endregion

























}