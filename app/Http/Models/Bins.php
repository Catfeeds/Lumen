<?php 
/**
 * Created by Sublime.
 * User: liming
 * Date: 17/11/2
 */
namespace App\Http\Models;//定义命名空间
use Illuminate\Support\Facades\DB;//引入DB操作类

class Bins extends  Base
{
    public function __construct()
    {
        $this->table='ruis_storage_bin';
        $this->plant_table='ruis_factory';
        $this->employee_table='ruis_employee';
        $this->subarea_table='ruis_storage_subarea';
        $this->depot_table='ruis_storage_depot';

        //定义表别名
        $this->aliasTable=[
            'snbin'=>$this->table.' as snbin',
            'plant'=>$this->plant_table.' as plant',
            'employee'=>$this->employee_table.' as employee',
            'depot'=>$this->depot_table.' as depot',
            'subarea'=>$this->subarea_table.' as subarea',
        ];

    }

    /**
     * 获取列表
     * @return array  返回数组对象集合
     */
    public function getBinsList($input)
    {
        //order  (多order的情形,需要多次调用orderBy方法即可)
        if (empty($input['order']) || empty($input['sort']))
        {
            $input['order']='desc';$input['sort']='id';
        }
        $data = [
            'snbin.id  as   id',
            'snbin.id  as   bin_id',
            'snbin.name as  bin_name',
            'snbin.code  as  bin_code',
            'snbin.remark as  bin_remark',
            'snbin.is_using as  is_using',
            'snbin.max_capacity as bin_maxcapacity',
            'snbin.now_capacity  as bin_nowcapacity',
            'snbin.condition  as  bin_condition',
            'employee.name   as  employee_name',
            'employee.id   as  employee_id',
            'employee.surname as  employee_surname',
            'depot.id  as   depot_id',
            'plant.id  as   plant_id',
            'plant.name  as   plant_name',
            'depot.id  as  depot_id',
            'depot.name  as  depot_name',
            'subarea.id  as  subarea_id',
            'subarea.name  as  subarea_name',
        ];

        $obj_list = DB::table($this->aliasTable['snbin'])
            ->orderBy('id','asc')
            ->select($data)
            ->leftJoin($this->aliasTable['employee'], 'snbin.employee_id', '=', 'employee.id')
            ->leftJoin($this->aliasTable['depot'], 'snbin.depot_id', '=', 'depot.id')
            ->leftJoin($this->aliasTable['subarea'], 'snbin.subarea_id', '=', 'subarea.id')
            ->leftJoin($this->aliasTable['plant'], 'depot.plant_id', '=', 'plant.id')
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
        

          $where = $this->_search($input);
          $obj_list=DB::table($this->aliasTable['snbin'])
            ->leftJoin($this->aliasTable['employee'], 'snbin.employee_id', '=', 'employee.id')
            ->leftJoin($this->aliasTable['depot'], 'snbin.depot_id', '=', 'depot.id')
            ->leftJoin($this->aliasTable['subarea'], 'snbin.subarea_id', '=', 'subarea.id')
            ->leftJoin($this->aliasTable['plant'], 'depot.plant_id', '=', 'plant.id')
            ->select(
                'snbin.id  as   id',
                'snbin.id  as   bin_id',
                'snbin.name as  bin_name',
                'snbin.code  as  bin_code',
                'snbin.remark as  bin_remark',
                'snbin.is_using as  is_using',
                'snbin.max_capacity as bin_maxcapacity',
                'snbin.now_capacity  as bin_nowcapacity',
                'snbin.condition  as  bin_condition',
                'employee.name   as  employee_name',
                'employee.id   as  employee_id',
                'employee.surname as  employee_surname',
                'depot.id  as   depot_id',
                'plant.id  as   plant_id',
                'plant.name  as   plant_name',
                'depot.id  as  depot_id',
                'depot.name  as  depot_name',
                'subarea.id  as  subarea_id',
                'subarea.name  as  subarea_name'
            )
            ->where($where)
            ->offset(($input['page_no']-1)*$input['page_size'])
            ->limit($input['page_size'])
            ->orderBy($input['sort'],$input['order'])
            ->get();
        $obj_list->total_count = DB::table($this->aliasTable['snbin'])->where($where)->count();
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
        //代码唯一性检测
        $has=$this->isExisted([['code','=',$input['code']]]);
        if($has) TEA('8207','code');
        //名称唯一性检测
        $has=$this->isExisted([['name','=',$input['name']]]);
        if($has) TEA('8204','name');

        if (empty($input['depot_id'])) TEA('8209','nodepot');

        if (empty($input['subarea_id'])) TEA('8212','nosubarea');
        //获取添加数组,此处一定要严谨一些,否则前端传递额外字段将导致报错,甚至攻击
        $data=[
            'code'=>$input['code'],
            'name'=>$input['name'],
            'remark'=>$input['remark'],
            'sort'=>$input['sort'],
            'depot_id'=>$input['depot_id'],
            'subarea_id'=>$input['subarea_id'],
            'employee_id'=>$input['employee_id'],
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

            //判断是否有子集分区  如果有子集元素  不允许删除
             $sub_list=DB::table($this->table)->select('id')->where('now_capacity','>',0)->limit(1)->count();
             if($sub_list) TEA('8208','code');


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
     * 修改仓位
     * @param $input   array   input数组
     * @throws \Exception
     * @author    liming
     */
    public function update($input)
    {
      //仓库编码唯一性检测
        $has=$this->isExisted([['name','=',$input['name']],[$this->primaryKey,'<>',$input['id']]]);
        if($has) TEA('8204','name');

        $has=$this->isExisted([['code','=',$input['code']],[$this->primaryKey,'<>',$input['id']]]);
        if($has) TEA('8207','code');

        if (empty($input['subarea_id'])) TEA('8212','nosubarea');
        if (empty($input['depot_id'])) TEA('8209','nodepot');
        
        //获取编辑数组
        $data=[
            'name'=>$input['name'],
            'code'=>$input['code'],
            'sort'=>$input['sort'],
            'depot_id'=>$input['depot_id'],
            'employee_id'=>$input['employee_id'],
            'subarea_id'=>$input['subarea_id'],
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
     * 查看某条仓位信息
     * @param $id
     * @return array
     * @author  liming 
     * @todo 
     */
    public function get($id)
    {
        $data = [
            'snbin.id  as   id',
            'snbin.id  as   bin_id',
            'snbin.name as  bin_name',
            'snbin.code  as  bin_code',
            'snbin.remark as  bin_remark',
            'snbin.is_using as  is_using',
            'snbin.max_capacity as bin_maxcapacity',
            'snbin.now_capacity  as bin_nowcapacity',
            'snbin.condition  as  bin_condition',
            'employee.id     as  employee_id',
            'employee.name   as  employee_name',
            'employee.surname as  employee_surname',
            'depot.id  as   depot_id',
            'plant.id  as   plant_id',
            'plant.name  as   plant_name',
            'depot.id  as  depot_id',
            'depot.name  as  depot_name',
            'subarea.id  as  subarea_id',
            'subarea.name  as  subarea_name',
        ];

        $obj = DB::table($this->aliasTable['snbin'])
            ->select($data)
            ->leftJoin($this->aliasTable['employee'], 'snbin.employee_id', '=', 'employee.id')
            ->leftJoin($this->aliasTable['depot'], 'snbin.depot_id', '=', 'depot.id')
            ->leftJoin($this->aliasTable['subarea'], 'snbin.subarea_id', '=', 'subarea.id')
            ->leftJoin($this->aliasTable['plant'], 'depot.plant_id', '=', 'plant.id')
            ->where("snbin.$this->primaryKey",'=',$id)
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
        if (isset($input['bin_name']) && $input['bin_name']) {//根据名字查找
            $where[]=['snbin.name','like','%'.$input['bin_name'].'%'];
        }
        if (isset($input['bin_code']) && $input['bin_code']) {//根据编号查找
            $where[]=['snbin.code','like','%'.$input['bin_code'].'%'];
        }
        return $where;
    }

}