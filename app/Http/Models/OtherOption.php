<?php 
/**
 * 设备类型
 * User: liming
 */
namespace App\Http\Models;//定义命名空间
use Illuminate\Support\Facades\DB;//引入DB操作类

class OtherOption extends Base
{
    public function __construct()
    {
        $this->table='ruis_device_options';
      
        $this->aliasTable=[
            'otheroption'=>$this->table.' as otheroption',
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
        if($has) TEA('710','code');
        //名称唯一性检测
        $has=$this->isExisted([['name','=',$input['name']]]);
        if($has) TEA('710','name');
        //获取添加数组,此处一定要严谨一些,否则前端传递额外字段将导致报错,甚至攻击
        $data=[
            'code'     =>$input['code'],
            'name'     =>$input['name'],
            'category_id'     =>$input['category_id'],
            'sort'     =>$input['sort'],
            'remark'=>$input['remark'],
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

        $has=$this->isExisted([['name','=',$input['name']],[$this->primaryKey,'<>',$input['id']]]);
        if($has) TEA('710','name');

        $has=$this->isExisted([['code','=',$input['code']],[$this->primaryKey,'<>',$input['id']]]);
        if($has) TEA('710','code');


        //获取编辑数组
        $data=[
            'name'=>$input['name'],
            'code'=>$input['code'],
            'sort'=>$input['sort'],
            'category_id'     =>$input['category_id'],
            'remark'=>$input['remark'],
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
     * 获取列表
     * @return array  返回数组对象集合
     */
    public function getList($input)
    {
        $where = $this->_search($input);
        $data = [
            'otheroption.id          as    option_id',
            'otheroption.name        as    option_name',
            'otheroption.code        as    option_code',
            'otheroption.sort        as    option_sort',
            'otheroption.category_id   as    option_category_id',
            'otheroption.remark        as    option_remark',
        ];
        $obj_list=DB::table($this->aliasTable['otheroption'])
            ->select($data)
            ->where($where)
            ->get();
        if (!$obj_list) TEA('404');
        return $obj_list;
    }







    /**
     * 分页列表
     * @return array  返回数组对象集合
     */
    public function getPageList($input)
    {
       //$input['page_no']、$input['page_size   检验是否存在参数
       if (!array_key_exists('page_no',$input ) && !array_key_exists('page_size',$input )) TEA('8211','page');
        //order  (多order的情形,需要多次调用orderBy方法即可)
        if (empty($input['order']) || empty($input['sort'])) 
        {
            $input['order']='desc';$input['sort']='id';
        } 
        

          $where = $this->_search($input);
          $data = [
            'otheroption.id          as    option_id',
            'otheroption.name        as    option_name',
            'otheroption.code        as    option_code',
            'otheroption.sort        as    option_sort',
            'otheroption.category_id   as    option_category_id',
            'otheroption.remark        as    option_remark',
           ];

          $obj_list=DB::table($this->aliasTable['otheroption'])
            ->select($data)
            ->where($where)
            ->offset(($input['page_no']-1)*$input['page_size'])
            ->limit($input['page_size'])
            ->orderBy($input['sort'],$input['order'])
            ->get();
        $obj_list->total_count = DB::table($this->aliasTable['otheroption'])->where($where)->count();
        return $obj_list;
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
            'otheroption.id          as    option_id',
            'otheroption.name        as    option_name',
            'otheroption.code        as    option_code',
            'otheroption.sort        as    option_sort',
            'otheroption.category_id   as    option_category_id',
            'otheroption.remark        as    option_remark',
        ];

        $obj = DB::table($this->aliasTable['otheroption'])
            ->select($data)
            ->where("otheroption.$this->primaryKey",'=',$id)
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
     * 搜索
     */
    private function _search($input)
    {
        $where = array();

        if (isset($input['category_id'])  && $input['category_id']!='' ) {//根据订单号
            $where[]=['otheroption.category_id','=',$input['category_id']];
        }

        if (isset($input['category_code']) && $input['category_code']) {//根据工单号
            $where[]=['otheroption.code','like','%'.$input['category_code'].'%'];
        }

        return $where;
    }

}

