<?php 
/**
 * Created by Sublime.
 * User: liming
 * Date: 17/11/13
 */
namespace App\Http\Models;//定义命名空间
use Illuminate\Support\Facades\DB;//引入DB操作类

class Subarea extends  Base
{
  public function __construct()
    {
        $this->table='ruis_storage_subarea';
        $this->newbin_table='ruis_storage_bin';
        $this->depot_table='ruis_storage_depot';
        $this->employee_table='ruis_employee';
        $this->plant_table='ruis_factory';

        //定义表别名
        $this->aliasTable=[
            'ssub'=>$this->table.' as ssub',
            'employee'=>$this->employee_table.' as employee',
            'bin'=>$this->newbin_table.' as bin',
            'sdepot'=>$this->depot_table.' as sdepot',
            'plant'=>$this->plant_table.' as plant',
        ];

    }

    /**
     * 获取列表
     * @return array  返回数组对象集合
     */
    public function getSubareaList($input)
    {
        if (empty($input['order']) || empty($input['sort']))
        {
            $input['order']='desc';$input['sort']='id';
        }
        $where = $this->_search($input);
        $obj_list=DB::table($this->table)
        ->leftJoin('ruis_storage_depot', 'ruis_storage_depot.id', '=', 'ruis_storage_subarea.depot_id')
        ->leftJoin('ruis_employee', 'ruis_employee.id', '=', 'ruis_storage_subarea.employee_id')
        ->select(
            'ruis_storage_subarea.id  as   id',
            'ruis_storage_subarea.id  as   subarea_id',
            'ruis_storage_subarea.code  as subarea_code',
            'ruis_storage_subarea.max_capacity  as max_capacity',
            'ruis_storage_subarea.name  as subarea_name',
            'ruis_storage_subarea.hasshipp  as subarea_hasshipp',
            'ruis_storage_subarea.remark  as subarea_remark',
            'ruis_storage_depot.name   as depot_name',
            'ruis_storage_depot.id     as depot_id',
            'ruis_employee.name   as employee_name',
            'ruis_employee.id     as employee_id',
            'ruis_employee.surname   as employee_surname'
          )
        ->where($where)
        ->orderBy($input['sort'],$input['order'])
        ->get();
        return $obj_list;
    }

    /**
     * 分页列表
     * @return array  返回数组对象集合
     */
    public function getPageList($input)
    {
       //$input['page_no']、$input['page_size   检验是否存在参数
       if (!array_key_exists('page_no',$input ) && !array_key_exists('page_size',$input )) TEA('8112','page');
        //order  (多order的情形,需要多次调用orderBy方法即可)
        if (empty($input['order']) || empty($input['sort']))
        {
            $input['order']='desc';$input['sort']='id';
        }
          $where = $this->_search($input);
          $obj_list=DB::table($this->table)
          ->leftJoin('ruis_storage_depot', 'ruis_storage_depot.id', '=', 'ruis_storage_subarea.depot_id')
          ->leftJoin('ruis_employee', 'ruis_employee.id', '=', 'ruis_storage_subarea.employee_id')
          ->select(
              'ruis_storage_subarea.id  as   id',
              'ruis_storage_subarea.id  as   subarea_id',
              'ruis_storage_subarea.code  as subarea_code',
              'ruis_storage_subarea.max_capacity  as max_capacity',
              'ruis_storage_subarea.name  as subarea_name',
              'ruis_storage_subarea.hasshipp  as subarea_hasshipp',
              'ruis_storage_subarea.remark  as subarea_remark',
              'ruis_storage_depot.name   as depot_name',
              'ruis_storage_depot.id     as depot_id',
              'ruis_employee.name   as employee_name',
              'ruis_employee.id     as employee_id',
              'ruis_employee.surname   as employee_surname'
            )
            ->where($where)
            ->offset(($input['page_no']-1)*$input['page_size'])
            ->limit($input['page_size'])
            ->orderBy($input['sort'],$input['order'])
            ->get();
        $obj_list->total_count = DB::table($this->table)->where($where)->count();
        return $obj_list;
    }


    /**
     * 添加分去
     * @param $input array  input数组
     * @return int         返回插入表之后返回的主键值
     * @author liming
     */
    public function add($input)
    {
        //代码唯一性检测
        $has=$this->isExisted([['code','=',$input['code']]]);
        if($has) TEA('8107','code');
        //名称唯一性检测
        $has=$this->isExisted([['name','=',$input['name']]]);
        if($has) TEA('8108','name');
        //获取添加数组,此处一定要严谨一些,否则前端传递额外字段将导致报错,甚至攻击
        $data=[
            'code'=>$input['code'],
            'name'=>$input['name'],
            'sort'=>$input['sort'],
            'employee_id'=>$input['employee_id'],
            'depot_id'=>$input['depot_id'],
            'remark'=>$input['remark'],
        ];
        
        //添加
        $insert_id=DB::table($this->table)->insertGetId($data);
        if(!$insert_id) TEA('802');
        return  $insert_id;
    }



    /**
     * 删除仓库列表
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

            //判断是否有子集仓位  如果有子集元素  不允许删除
             $bin_list=DB::table($this->newbin_table)->select('id')->where('subarea_id','=',$id)->limit(1)->count();
             if($bin_list) TEA('8109');


             //判断是否有货物  如果有货物  不允许删除
             $sub_list=DB::table($this->table)->select('id')->where('now_capacity','>',0)->limit(1)->count();
             if($sub_list) TEA('8110');


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
     * 修改仓库
     * @param $input   array   input数组
     * @throws \Exception
     * @author    liming
     */
    public function update($input)
    {
      //仓库编码唯一性检测
        $has=$this->isExisted([['name','=',$input['name']],[$this->primaryKey,'<>',$input['id']]]);
        if($has) TEA('8108','name');


        $has=$this->isExisted([['code','=',$input['code']],[$this->primaryKey,'<>',$input['id']]]);
        if($has) TEA('8107','code');


        //获取编辑数组
        $data=[
            'name'=>$input['name'],
            'code'=>$input['code'],
            'depot_id'=>$input['depot_id'],
            'employee_id'=>$input['employee_id'],
            'remark'=>$input['remark'],
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
     * 查看某条分区信息
     * @param $id
     * @return array
     * @author  liming 
     * @todo 
     */
    public function get($id)
    {
        $data = [
            'ssub.id  as   id',
            'ssub.id  as   subarea_id',
            'ssub.name as  subarea_name',
            'ssub.code  as  subarea_code',
            'ssub.remark as  subarea_remark',
            'ssub.hasshipp as  subarea_hasshipp',
            'ssub.max_capacity as subarea_maxcapacity',
            'ssub.now_capacity  as subarea_nowcapacity',
            'ssub.condition  as  subarea_condition',
            'employee.name   as  employee_name',
            'employee.id   as  employee_id',
            'employee.surname as  employee_surname',
            'sdepot.id  as   depot_id',
            'plant.id  as   plant_id',
            'plant.name  as   plant_name',
            'sdepot.name  as  depot_name',
        ];

        $obj = DB::table($this->aliasTable['ssub'])
            ->select($data)
            ->leftJoin($this->aliasTable['employee'], 'ssub.employee_id', '=', 'employee.id')
            ->leftJoin($this->aliasTable['sdepot'], 'ssub.depot_id', '=', 'sdepot.id')
            ->leftJoin($this->aliasTable['plant'], 'sdepot.plant_id', '=', 'plant.id')
            ->where("ssub.$this->primaryKey",'=',$id)
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
        if (isset($input['subarea_name']) && $input['subarea_name']) {//根据名字查找
            $where[]=['ruis_storage_subarea.name','like','%'.$input['subarea_name'].'%'];
        }
        if (isset($input['depot_id']) && $input['depot_id']) {
            $where[]=['ruis_storage_subarea.depot_id','=',$input['depot_id']];
        }
        if (isset($input['subarea_code']) && $input['subarea_code']) {//根据编号查找
            $where[]=['ruis_storage_subarea.code','like','%'.$input['subarea_code'].'%'];
        }
        return $where;
    }

}