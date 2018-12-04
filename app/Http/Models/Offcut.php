<?php 
/**
 * Created by Sublime.
 * User: liming
 * Date: 18/9/20
 */
namespace App\Http\Models;//定义命名空间
use Illuminate\Support\Facades\DB;//引入DB操作类

class Offcut extends  Base
{
    public function __construct()
    {
        $this->table='ruis_offcut_basedata';
    }


    /**
     * 树状列表
     * @return array  返回数组对象集合
     */
    public function getOffcutList($input)
    {
        $obj_list = DB::table($this->table)->select('*')->get();
        return $obj_list;
    }

    /**
     * 添加操作,添加
     * @param $input array  input数组
     * @return int         返回插入表之后返回的主键值
     * @author liming
     */
    public function add($input)
    {
        //获取添加数组,此处一定要严谨一些,否则前端传递额外字段将导致报错,甚至攻击
        $data=[
            'offcut_code'=>$input['offcut_code'],
            'offcut_name'=>$input['offcut_name'],
            'parent_id'=>$input['parent_id'],
            'ctime'=>time(),
        ];
        //添加
        $insert_id=DB::table($this->table)->insertGetId($data);
        if(!$insert_id) TEA('802');
        return  $insert_id;
    }


    /**
     * 删除列表
     * @param $id
     * @throws \Exception
     * @author
     */
    public function destroy($id)
    {
        try{
             //开启事务
             DB::connection()->beginTransaction();
             //删除之前先判断是否有子集 如果有不能删
             $has  = DB::table($this->table)->select('*')->where('parent_id',$id)->get();
             if(count($has)>0) TEA('6520');
            
             $num=$this->destroyById($id);
             if($num===false) TEA('803');
             if(empty($num))  TEA('404');
        }catch(\ApiException $e){
            //回滚
            DB::connection()->rollBack();
            TEA($e->getCode());
        }
        //提交事务
        DB::connection()->commit();
    }


    /**
     * 修改
     * @param $input   array   input数组
     * @throws \Exception
     * @author    liming
     */
    public function update($input)
    {
        //获取编辑数组
        $data=[
            'offcut_code'=>$input['offcut_code'],
            'offcut_name'=>$input['offcut_name'],
        ];
        try{
            //开启事务
            DB::connection()->beginTransaction();
            $upd=DB::table($this->table)->where('id',$input['id'])->update($data);
            if($upd===false) TEA('804');
        }catch(\ApiException $e){
            //回滚
            DB::connection()->rollBack();
            TEA($e->getCode());
        }

        //提交事务
        DB::connection()->commit();

    }

   /**
     * 查看某条信息
     * @param $id
     * @return array
     * @author  liming 
     * @todo 
     */
    public function get($id)
    {
        $obj = DB::table($this->table)->select('*')->where("id",'=',$id)->first();
        if (!$obj) TEA('404');
        return $obj;
    }
}