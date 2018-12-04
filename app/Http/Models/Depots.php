<?php 
/**
 * Created by Sublime.
 * User: liming
 * Date: 17/10/27
 */
namespace App\Http\Models;//定义命名空间
use Illuminate\Support\Facades\DB;//引入DB操作类

class Depots extends  Base
{
    public function __construct()
    {
        $this->table='ruis_storage_depot';
        $this->subarea_table='ruis_storage_subarea';
        $this->bin_table='ruis_storage_bin';
        $this->plant_table='ruis_factory';
        $this->employee_table='ruis_employee';
        $this->department_table='ruis_department';


        //定义表别名
        $this->aliasTable=[
            'sub'=>$this->subarea_table.' as sub',
            'bin'=>$this->bin_table.' as bin',
            'sdepot'=>$this->table.' as sdepot',
            'plant'=>$this->plant_table.' as plant',
            'employee'=>$this->employee_table.' as employee',
            'department'=>$this->department_table.' as department',
        ];
    }


    /**
     * 获取供应商列表
     * @return array  返回数组对象集合
     */
    public function getDepotsList($input)
    {

        //order  (多order的情形,需要多次调用orderBy方法即可)
        if (empty($input['order']) || empty($input['sort']))
        {
            $input['order']='desc';$input['sort']='id';
        }
        $where = $this->_search($input);
        $builder = DB::table($this->aliasTable['sdepot'])
            ->select('sdepot.id as id',//仓库id
                'sdepot.code as code',//仓库code
                'sdepot.name as depot_name',//仓库名称
                'sdepot.name',//仓库名称
                'sdepot.phone as phone',//仓库phone
                'sdepot.address as address',//address
                'sdepot.is_line_depot as is_line_depot',//是否为线编仓
                'sdepot.sap_depot_code as sap_depot_code',//sap仓位编码
                'sdepot.remark as remark',//remark
                'sdepot.ismanage as ismanage',//ismanage
                'employee.name as employee_name',//employee_name
                'employee.surname as employee_surname',//employee_surname
                'employee.id as employee_id',//employee_id
                'plant.name as plant_name',//plant_name
                'plant.id   as plant_id',//plant_name
                'department.name as department_name'//employee_name
                )
            ->where($where)
            ->leftJoin($this->aliasTable['department'], 'department.id', '=', 'sdepot.department_id')
            ->leftJoin($this->aliasTable['employee'], 'employee.id', '=', 'sdepot.employee_id')
            ->leftJoin($this->aliasTable['plant'], 'plant.id', '=', 'sdepot.plant_id')
            ->orderBy($input['sort'],$input['order']);
            $obj_list = $builder->get();           
            return $obj_list;
       
    }

    /**
     * 分页列表
     * @return array  返回数组对象集合
     */
    public function getPageList($input)
    {

       //$input['page_no']、$input['page_size   
       if (!array_key_exists('page_no',$input ) && !array_key_exists('page_size',$input )) TEA('8010','page');
        //order  (多order的情形,需要多次调用orderBy方法即可)
        if (empty($input['order']) || empty($input['sort']))
        {
            $input['order']='asc';$input['sort']='id';
        }      
        $where = $this->_search($input);
        $builder = DB::table($this->aliasTable['sdepot'])
            ->select('sdepot.id as id',//仓库id
                'sdepot.code as code',//仓库code
                'sdepot.name as depot_name',//仓库code
                'sdepot.phone as phone',//仓库phone
                'sdepot.address as address',//address
                'sdepot.remark as remark',//remark
                'sdepot.ismanage as ismanage',//ismanage
                'sdepot.is_line_depot as is_line_depot',//是否为线编仓
                'sdepot.sap_depot_code as sap_depot_code',//sap仓位编码
                'employee.name as employee_name',//employee_name
                'employee.surname as employee_surname',//employee_surname
                'employee.id as employee_id',//employee_id
                'plant.name as plant_name',//plant_name
                'plant.id   as plant_id',//plant_name
                'department.name as department_name'//employee_name
                )
            ->where($where)
            ->leftJoin($this->aliasTable['department'], 'department.id', '=', 'sdepot.department_id')
            ->leftJoin($this->aliasTable['employee'], 'employee.id', '=', 'sdepot.employee_id')
            ->leftJoin($this->aliasTable['plant'], 'plant.id', '=', 'sdepot.plant_id')
            ->offset(($input['page_no']-1)*$input['page_size'])
            ->limit($input['page_size'])
            ->orderBy($input['sort'],$input['order']);
            $obj_list = $builder->get();   
            $obj_list->total_count = DB::table($this->aliasTable['sdepot'])->where($where)->count();        
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
        if($has) TEA('8005','code');
        //名称唯一性检测
        $has=$this->isExisted([['name','=',$input['name']]]);
        if($has) TEA('8004','name');
        //获取添加数组,此处一定要严谨一些,否则前端传递额外字段将导致报错,甚至攻击
        $data=[
            'code'=>$input['code'],
            'name'=>$input['name'],
            'remark'=>$input['remark'],
            'sort'=>$input['sort'],
            'department_id'=>$input['department_id'],
            'phone'=>$input['phone'],
            'is_line_depot'=>$input['is_line_depot'],//是否为线编仓
            'sap_depot_code'=>$input['sap_depot_code'],//sap仓位编码
            // 'ismanage'=>$input['ismanage'],    是否管理 暂时不用
            'employee_id'=>$input['employee_id'],
            'address'=>$input['address'],
            'plant_id'=>$input['plant_id'],
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
     * @author
     */
    public function destroy($id)
    {

        //该分组的使用状况,使用的话,则禁止删除[暂时略][是否使用由具体业务场景判断]
        try{
            //开启事务
            DB::connection()->beginTransaction();

            //判断是否有子集分区  如果有子集元素  不允许删除
             $sub_list=DB::table($this->subarea_table)->select('id')->where('depot_id','=',$id)->limit(1)->count();
             if($sub_list) TEA('8006');

            //判断是否有子集仓位  如果有子集元素  不允许删除
             $bin_list=DB::table($this->bin_table)->select('id')->where('depot_id','=',$id)->limit(1)->count();
             if($bin_list) TEA('8007');

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

      //仓库名称唯一性检测
      //仓库编码唯一性检测
        $has=$this->isExisted([['name','=',$input['name']],[$this->primaryKey,'<>',$input['id']]]);
        if($has) TEA('8004','name');

        $has=$this->isExisted([['code','=',$input['code']],[$this->primaryKey,'<>',$input['id']]]);
        if($has) TEA('8005','code');

        //获取编辑数组
        $data=[
            'name'=>$input['name'],
            'code'=>$input['code'],
            'department_id'=>$input['department_id'],
            'phone'=>$input['phone'],
            'employee_id'=>$input['employee_id'],
            // 'ismanage'=>$input['ismanage'],  是否管理 暂时不用
            'is_line_depot'=>$input['is_line_depot'],//是否为线编仓
            'sap_depot_code'=>$input['sap_depot_code'],//sap仓位编码
            'address'=>$input['address'],
            'plant_id'=>$input['plant_id'],
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
     * 查看某条仓库信息
     * @param $id
     * @return array
     * @author  liming 
     * @todo 
     */
    public function get($id)
    {
        $data = [
            'sdepot.id     as    depot_id',
            'sdepot.name   as    depot_name',
            'sdepot.ismanage as  ismanage',
            'sdepot.code   as    depot_code',
            'sdepot.phone  as    depot_phone',
            'sdepot.address as    depot_address',
            'sdepot.remark  as    depot_remark',
            'sdepot.is_line_depot  as  is_line_depot',
            'sdepot.sap_depot_code  as  sap_depot_code',
            'plant.id       as    plant_id',
            'plant.name     as    plant_name',
            'employee.name  as    employee_name',
            'employee.id  as      employee_id',
            'employee.surname   as    employee_surname',
            'department.id  as  department_id',
            'department.name as  department_name',
        ];
        $obj = DB::table($this->aliasTable['sdepot'])
            ->select($data)
            ->leftJoin($this->aliasTable['plant'], 'sdepot.plant_id', '=', 'plant.id')
            ->leftJoin($this->aliasTable['employee'], 'sdepot.employee_id', '=', 'employee.id')
            ->leftJoin($this->aliasTable['department'], 'sdepot.department_id', '=', 'department.id')
            ->where("sdepot.$this->primaryKey",'=',$id)
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
        if (isset($input['depot_name']) && $input['depot_name']) {//根据仓库名字查找
            $where[]=['sdepot.name','like','%'.$input['depot_name'].'%'];
        }
        if (isset($input['depot_code']) && $input['depot_code']) {//根据仓库编号查找
            $where[]=['sdepot.code','like','%'.$input['depot_code'].'%'];
        }
        if (isset($input['is_line_depot']) && $input['is_line_depot']) {//是否是线编库
            $where[]=['sdepot.is_line_depot','=',$input['is_line_depot']];
        }

        return $where;
    }
}