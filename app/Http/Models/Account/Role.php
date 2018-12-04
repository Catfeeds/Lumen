<?php

namespace App\Http\Models\Account;//定义命名空间
use App\Http\Models\Base;
use Illuminate\Support\Facades\DB;//引入DB操作类

/**
 * 系统角色表
 * @author  sam.shan  <sam.shan@ruis-ims.cn>
 * @time    2018年01月17日14:30:09
 */
class Role extends Base
{

    /**
     * 前端传递的api主键名称
     * @var string
     */
    public  $apiPrimaryKey='role_id';


    public function __construct()
    {
        parent::__construct();
        $this->table=config('alias.rrr');
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
        //1.name 角色名称   YU
           //1.1 不可以为空
        if(empty($input['name'])) TEA('700','name');
           //1.2 唯一性检测
        $check=$add?[['name','=',$input['name']]]:[['name','=',$input['name']],['id','<>',$input[$this->apiPrimaryKey]]];
        $has=$this->isExisted($check);
        if($has) TEA('917','name');
        //2.status  Y 状态
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
            'status'=>$input['status'],
            'updated_at'=>date('Y-m-d H:i:s',time()),
        ];
        //入库
        $upd=DB::table($this->table)->where('id',$input[$this->apiPrimaryKey])->update($data);
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
     * 查看详情
     * @param $id  int  主键id
     * @return object   返回的是一个对象
     * @author  sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function get($id)
    {
        $obj=$this->getRecordById($id,['id','id as '.$this->apiPrimaryKey,'name','status']);
        if(!$obj) TEA('404');
        return $obj;
    }

    /**
     * 分页查询列表
     * @param $input
     * @return mixed
     * @author  sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function getRoleList(&$input)
    {
        //1.创建公共builder
            //1.1where条件预搜集
        $where = [];
        !empty($input['name']) && $where[] = ['name', 'like', '%' . $input['name'] . '%'];
        isset($input['status']) && is_numeric($input['status']) && $where[]=['status','=',$input['status']];
            //1.2.预生成builder,注意仅仅在get中需要的连表请放在builder_get中
        $builder = DB::table($this->table);
            //1.3 where条件拼接
        if (!empty($where)) $builder->where($where);
        //2.总共有多少条记录
        $input['total_records'] = $builder->count();
        //3.select查询
        $builder_get=$builder;
        //3.1拼接分页条件
        $builder_get->select('id as role_id','name','status','created_at')
            ->offset(($input['page_no'] - 1) * $input['page_size'])
            ->limit($input['page_size']);
        //3.2 order排序
        if (!empty($input['order']) && !empty($input['sort'])) $builder_get->orderBy($input['sort'], $input['order']);
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

        //角色被使用,则禁止删除
        $has=$this->isExisted([[$this->apiPrimaryKey,'=',$id]],config('alias.rri'));
        if($has) TEA('918');
        //先删关联表
        $num = DB::table(config('alias.rra'))->where($this->apiPrimaryKey, '=', $id)->delete();
        if ($num === false) TEA('803');
        //删除主表
        $num=$this->destroyById($id);
        if($num===false) TEA('803');
        if(empty($num))  TEA('404');
        //删除该角色赋予的权限

    }


//endregion

//region 赋予角色


    /**
     * 某个角色分配了哪些节点
     * @param $node_id  节点ID
     * @return mixed
     * @author  sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function getNodesByRole($role_id)
    {


        $obj_list=DB::table(config('alias.rra').' as rra')
            ->where('rra.role_id',$role_id)
            ->leftJoin(config('alias.rrn').' as rrn', 'rra.node_id', '=', 'rrn.id')
            ->select(
                'rra.role_id','rra.node_id',
                'rrn.name','rrn.node','rrn.status'
            )
            ->get();
        return $obj_list;
        //return   $db_ref_obj=DB::table(config('alias.rra'))->where('role_id',$role_id)->pluck('node_id');
    }

    /**
     * 保存分配的权限
     * @param $input
     */
    public  function  role2node($input)
    {
        //1.获取数据库中该节点已经分配的权限节点
        $db_ref_obj=DB::table(config('alias.rra'))->where('role_id',$input['role_id'])->pluck('node_id');
        $db_ids=obj2array($db_ref_obj);
        //2.获取前端传递的附件
        $input_ids=(array)$input['node_ids'];
        //3.通过颠倒位置的差集获取改动情况,多字段要考虑编辑的情况额[有的人喜欢先删除所有然后变成全部添加,这种是错误的投机取巧行为,要杜绝!]
        $set=get_array_diff_intersect($input_ids,$db_ids);
        if(!empty($set['add_set']) || !empty($set['del_set']) || $set['common_set'])  $m=new Auth();
        //4.要添加的
        if(!empty($set['add_set']))  $m->addSetNodes($set['add_set'],$input['role_id']);
        //5.要删除
        if(!empty($set['del_set']))  $m->delSetNodes($set['del_set'],$input['role_id']);
    }
//endregion
















}