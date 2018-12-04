<?php 
/**
 * Created by Sublime.
 * User: liming
 * Date: 17/11/2
 */
namespace App\Http\Models;//定义命名空间
use Illuminate\Support\Facades\DB;//引入DB操作类

class UpkeeRequire extends  Base
{
    public function __construct()
    {
        $this->table='ruis_upkee_require';
        $this->devicetype_table='ruis_device_type';
     
        //定义表别名
        $this->aliasTable=[
            'uprequire'=>$this->table.' as uprequire',
            'devicetype'=>$this->devicetype_table.' as devicetype',
        ];

    }

    /**
     * 获取列表
     * @return array  返回数组对象集合
     */
    public function getList($input)
    {
        //order  (多order的情形,需要多次调用orderBy方法即可)
        if (empty($input['order']) || empty($input['sort']))
        {
            $input['order']='desc';$input['sort']='id';
        }
        $data = [
            'uprequire.id  as   id',
            'uprequire.sort  as   sort',
            'uprequire.upkee_part as  part',
            'uprequire.upkee_require  as  require',
            'uprequire.device_type  as  type',
            'devicetype.name  as  devicetype_name'
        ];

        $obj_list = DB::table($this->aliasTable['uprequire'])
            ->orderBy('id','asc')
            ->select($data)
            ->leftJoin($this->aliasTable['devicetype'], 'uprequire.device_type', '=', 'devicetype.id')
            ->orderBy($input['sort'],$input['order'])
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

        $data =[
                'uprequire.id  as   id',
                'uprequire.sort  as   sort',
                'uprequire.upkee_part as  part',
                'uprequire.upkee_require  as  require',
                'devicetype.name  as  devicetype_name',
                'uprequire.device_type  as  type'
              ];

          $where = $this->_search($input);
          $obj_list=DB::table($this->aliasTable['uprequire'])
            ->select($data)
            ->where($where)
            ->leftJoin($this->aliasTable['devicetype'], 'uprequire.device_type', '=', 'devicetype.id')
            ->offset(($input['page_no']-1)*$input['page_size'])
            ->limit($input['page_size'])
            ->orderBy($input['sort'],$input['order'])
            ->get();
        $obj_list->total_count = DB::table($this->aliasTable['uprequire'])->where($where)->count();
        return $obj_list;
    }


    /**
     * 添加操作,添加仓库
     * @param $input array  input数组
     * @return int         返回插入表之后返回的主键值
     * @author liming
     */
    public function add($input)
    {
      $items  = json_decode($input['items'],true);
      foreach ($items as $key => $value){
        if(!isset($value['upkee_part'])) TEA('732','upkee_part');
        if(!isset($value['upkee_require'])) TEA('732','upkee_require');
        $data=[
            'device_type'=>$input['device_type'],
            'upkee_part'=>$value['upkee_part'],
            'upkee_require'=>$value['upkee_require'],
            'sort'=>$input['sort'],
        ];
        //添加
        $insert_id=DB::table($this->table)->insertGetId($data);
        if(!$insert_id) TEA('802');
      }
        return  $insert_id;
    }


    /**
     * 删除
     * @param $id
     * @throws \Exception
     * @author sam.shan <sam.shan@ruis-ims.cn>
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
     * 修改
     * @param $input   array   input数组
     * @throws \Exception
     * @author    liming
     */
    public function update($input)
    {
        if (empty($input['device_type'])) TEA('9111','device_type');
        
        //获取编辑数组
        $data=[
            'device_type'=>$input['device_type'],
            'upkee_part'=>$input['upkee_part'],
            'upkee_require'=>$input['upkee_require'],
            'sort'=>$input['sort'],
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
            'uprequire.id  as   id',
            'uprequire.sort  as   sort',
            'uprequire.upkee_part as  part',
            'uprequire.upkee_require  as  require',
            'uprequire.device_type  as  type',
        ];

        $obj = DB::table($this->aliasTable['uprequire'])
            ->select($data)
            ->where("uprequire.$this->primaryKey",'=',$id)
            ->first();

        if (!$obj) TEA('404');
        return $obj;
    }

    /**
     * 搜索
     */
    private function _search($input)
    {
        $where = array();
        if (isset($input['type']) && $input['type']) {//设备类型
            $where[]=['uprequire.device_type','=',$input['type']];
        }
        if (isset($input['upkee_part']) && $input['upkee_part']) {//保养部位
            $where[]=['uprequire.upkee_part','like','%'.$input['upkee_part'].'%'];
        }
        if (isset($input['upkee_require']) && $input['upkee_require']) {//保养需求
            $where[]=['uprequire.upkee_require','like','%'.$input['upkee_require'].'%'];
        }
        return $where;
    }

}