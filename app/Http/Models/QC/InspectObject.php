<?php 
/**
 * 检验项
 * User: liming
 */
namespace App\Http\Models\QC;
use App\Http\Models\Base;
use Illuminate\Support\Facades\DB;

class InspectObject extends Base
{
	public function __construct()
    {
        $this->table='ruis_inspect_object';
        $this->templateTable='ruis_qc_template';
      
        $this->aliasTable=[
            'insobj'=>$this->table.' as insobj',
            'template'=>$this->templateTable.' as template',
        ];
    }

    /**
     * 添加操作
     * @param $input array  input数组
     * @return int         返回插入表之后返回的主键值
     * @author liming
     */
    public function add($input)
    {
        //代码唯一性检测
        $has=$this->isExisted([['code','=',$input['code']]]);
        if($has) TEA('6511','code');

        //获取添加数组,此处一定要严谨一些,否则前端传递额外字段将导致报错,甚至攻击
        $data=[
            'code'       =>$input['code'],
            'name'       =>$input['name'],
            'remark'     =>$input['remark'],
            'type'       =>$input['type'],
            'parent_id'  =>$input['parent_id'],
           
        ];
        //添加
        $insert_id=DB::table($this->table)->insertGetId($data);
        if(!$insert_id) TEA('802');
        return  $insert_id;
    }

    /**
     * 修改
     * @param $input   array   input数组
     * @throws \Exception
     * @author    liming
     */
    public function update($input)
    {

        $has=$this->isExisted([['code','=',$input['code']],[$this->primaryKey,'<>',$input['id']]]);
        if($has) TEA('6511','code');


        //获取编辑数组
        $data=[
            'name'=>$input['name'],
            'code'=>$input['code'],
            'remark'=>$input['remark'],
            'type'=>$input['type'],
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
        $data = [
            'insobj.id          as    object_id',
            'insobj.name        as    object_name',
            'insobj.code        as    object_code',
            'insobj.sort        as    object_sort',
            'insobj.type        as    object_type',
            'insobj.parent_id   as    object_parent_id',
            'insobj.remark      as    object_remark',
        ];

        $obj = DB::table($this->aliasTable['insobj'])
            ->select($data)
            ->where("insobj.$this->primaryKey",'=',$id)
            ->first();

        if (!$obj) TEA('404');
        return $obj;
    }

    /**
     * 删除
     * @param $id
     * @throws \Exception
     */
    public function destroy($id)
    {

        //该分组的使用状况,使用的话,则禁止删除[暂时略][是否使用由具体业务场景判断]
        try{
            //开启事务
            DB::connection()->beginTransaction();

             // 删除之前删除所有的子集
             $this->del_son($id);

            // 删除之前 删除检验模板所有相关的项目
             DB::table($this->templateTable)->where('check_inspect_id',$id)->delete();
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


       // 删除所有子集
        public  function  del_son($parent_id)
        {
            $where = [
                'parent_id' =>  $parent_id,
            ]; 
            $cateId = obj2array(DB::table($this->table)->where($where)->get());
            foreach ($cateId as $key => $value)
            {
              $temp_id  = $value['id'];
              // 删除之前 删除检验模板所有相关的项目
              DB::table($this->templateTable)->where('check_inspect_id',$temp_id)->delete();
              
              $num=$this->destroyById($temp_id);
              $result=  $this->del_son($temp_id);
            }
            return  TRUE;
        }

    /**
     * 获取所有的物料分类列表
     * @return object  返回对象集合
     * @todo  分类树少的时候适合采取,后续多的时候采用层级递进方式
     */
    public function getObjectsList()
    {
        $obj_list=DB::table($this->table)->select(['id','name','parent_id','remark','code','type'])->get();
        return $obj_list;
    }
    
}
