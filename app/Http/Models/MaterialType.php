<?php
/**
 * Created by PhpStorm.
 * User: sansheng
 * Date: 17/9/21
 * Time: 上午9:07
 */

namespace App\Http\Models;//定义命名空间
use App\Libraries\Tree;//引入分类树操作类
use Illuminate\Support\Facades\DB;//引入DB操作类

/**
 * 物料模板类型数据操作类
 * @author  sam.shan  <sam.shan@ruis-ims.cn>
 * @time    2017年09月19日15:37:39
 */
class MaterialType extends Base
{

    public function __construct()
    {
       $this->table='material_type';
    }


    /**
     * 操作数据库添加物料模板类型记录
     * @param $input array  input数组
     * @return int           返回插入表之后返回的主键值
     * @author     sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function add($input)
    {

        //物料类型键值唯一性检测
        $has=$this->isExisted([['key','=',$input['key']]]);
        if($has) TEA('4004','key');
        //物料类型名称唯一性检测
        $has=$this->isExisted([['name','=',$input['name']]]);
        if($has) TEA('4005','name');
        //获取入库数组,此处一定要严谨一些,否则前端传递额外字段将导致报错,甚至攻击
        $data=[
            'key'=>$input['key'],
            'parent_id'=>$input['parent_id'],
            'is_packaging'=>$input['is_packaging'],
            'label'=>$input['label'],
            'name'=>$input['name'],
            'description'=>$input['description'],
        ];
        //入库
        $insert_id=DB::table($this->table)->insertGetId($data);
        if(!$insert_id) TEA('802');
        return  $insert_id;
    }


    /**
     * 物理删除物料分类
     * @param $id
     * @throws \Exception
     * @author   sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function destroy($id)
    {
        //存在一个儿子就禁止删除[更别说子孙一片了]
         $has_son=$this->isExisted([['parent_id','=',$id]]);
        if($has_son) TEA('904');
        //该模板类型已经存在模板在使用了,则禁止删除[暂时略]
        $num=$this->destroyById($id);
        if($num===false) TEA('803');
        if(empty($num))  TEA('404');
    }




    /**
     * 入库操作,编辑物料模板类型
     * @param $input
     * @throws \Exception
     * @author  sam.shan   <sam.shan@ruis-ims.cn>
     */
    public function update($input)
    {
        //物料类型键值唯一性检测
         $has=$this->isExisted([['key','=',$input['key']],[$this->primaryKey,'<>',$input['id']]]);
         if($has) TEA('4004','key');
        //物料类型标签唯一性检测
         $has=$this->isExisted([['name','=',$input['name']],[$this->primaryKey,'<>',$input['id']]]);
         if($has) TEA('4005','name');
        //判断辈分是否错乱
        $obj_list=DB::table($this->table)->select('id','parent_id')->get();
        if(Tree::isSeniorityWrong($input['id'],$input['parent_id'],$obj_list)) TEA('903','parent_id');
        //获取编辑数组
        $data=[
            //'key'=>$input['key'],
            'parent_id'=>$input['parent_id'],
            'is_packaging'=>$input['is_packaging'],
            'label'=>$input['label'],
            'name'=>$input['name'],
            'description'=>$input['description'],
        ];
        //入库
         $upd=DB::table($this->table)->where('id',$input['id'])->update($data);
         //当返回值为0的时候,表示影响的行数为0,即更新的内容未做任何改变或者说更新的记录不存在数据库中
        if($upd===false) TEA('804');
        //if($upd==0) TEA('805');
    }



    /**
     * 查看某条物料模板类型信息
     * @param $id
     * @return array
     * @author  sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function get($id)
    {
        $obj=$this->getRecordById($id,['id','key','name','label','parent_id','description','is_packaging']);
        if(!$obj) TEA('404');
        return $obj;
    }


    /**
     * 获取物料模板类型列表
     * @return array
     * @author sam.shan   <sam.shan@ruis-ims.cn>
     */
    public function getTypesList()
    {
        $obj_list=DB::table($this->table)->select('id','key','name','label','description','parent_id','is_packaging')->orderBy('id','desc')->get();
        return $obj_list;
    }




















}