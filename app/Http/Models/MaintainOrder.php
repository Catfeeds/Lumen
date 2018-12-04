<?php 
/**
 * Created by Sublime.
 * User: liming
 * Date: 18/4/8
 */
namespace App\Http\Models;//定义命名空间
use Illuminate\Support\Facades\DB;//引入DB操作类

class MaintainOrder extends  Base
{
    public function __construct()
    {
        $this->table='ruis_maintain_order';
        $this->device_table='ruis_device_list';
        $this->rentpartner_table='ruis_partner';
        $this->supplier_table='ruis_partner';
        $this->procude_table='ruis_partner';       //  生产厂商
        $this->proposer_table='ruis_employee';       //  申请人
        $this->employee_table='ruis_employee';       //  员工
        $this->useemployee_table='ruis_employee';       //  员工
        $this->fault_type_table='ruis_fault_type';       // 故障类型
        $this->fault_grade_table='ruis_device_options';       // 故障等级
        $this->urgency_grade_table='ruis_device_options';       // 紧急等级
        $this->department_table='ruis_department';       // 部门
        //定义表别名
        $this->aliasTable=[
            'maintainorder'=>$this->table.' as maintainorder',
            'devicelist'=>$this->device_table.' as devicelist',
            'rentpartner'=>$this->rentpartner_table.' as rentpartner', // 租用单位
            'supplier'=>$this->supplier_table.' as supplier',         // 供应商
            'procude'=>$this->procude_table.' as procude',         // 生产厂商
            'proposer'=>$this->proposer_table.' as proposer',         // 申请人
            'employee'=>$this->employee_table.' as employee',         // 员工
            'user'=>$this->useemployee_table.' as user',         // 员工
            'faulttype'=>$this->fault_type_table.' as faulttype',         // 故障类型
            'faultgrade'=>$this->fault_grade_table.' as faultgrade',         // 故障等级
            'urgencygrade'=>$this->urgency_grade_table.' as urgencygrade',         // 故障等级
            'department'=>$this->department_table.' as department',         //部门
        ];

    }



    /**
     * 保存数据
     */
    public function save($data,$id=0)
    {
        if ($id>0)
        {
                try{
                    //开启事务
                    DB::connection()->beginTransaction();
                    $upd=DB::table($this->table)->where('id',$id)->update($data);
                    if($upd===false) TEA('804');
                }catch(\ApiException $e){
                    //回滚
                    DB::connection()->rollBack();
                    TEA($e->getCode());
                }

                //提交事务
                DB::connection()->commit();
                $order_id   = $id;

        }
        else
        {
            //补全数据
            $data['ctime']=time();
            //添加
            $order_id=DB::table($this->table)->insertGetId($data);
            if(!$order_id) TEA('802');
        }
        return $order_id;
    }



    /**
     * 添加操作
     * @param $input array  input数组
     * @return int         返回插入表之后返回的主键值
     * @author liming
     */
    public function add($input)
    {
        $input['creator_id'] = (!empty(session('administrator')->admin_id)) ? session('administrator')->admin_id : 0;
        $creator_id=$input['creator_id'];
        $input['company_id'] = (!empty(session('administrator')->company_id)) ? session('administrator')->company_id: 0;
        $company_id=$input['company_id'];
        $input['factory_id'] = (!empty(session('administrator')->factory_id)) ? session('administrator')->factory_id : 0;
        $factory_id=$input['factory_id'];

        try {
            //开启事务
            DB::connection()->beginTransaction();
            //1、添加
            //获取编辑数组

            $data=[
                'device_id'=>$input['device_id'], 
                'work_describe'=>$input['work_describe'], 
                'maintain_department'=>$input['maintain_department'], 
                'maintain_degree'=>$input['maintain_degree'], 
                'maintain_status'=>$input['maintain_status'], 
                'is_stopapparatus'=>$input['is_stopapparatus'], 
                'stop_time'=>$input['stop_time'], 
                'start_time'=>$input['start_time'], 
                'end_time'=>$input['end_time'], 
                'require'=>$input['require'], 
                'maintain_time'=>$input['maintain_time'], 
                'maintain_price'=>$input['maintain_price'], 
                'ctime'=>time(), 
                'creator'=>$creator_id, 
            ];

            $insert_id = $this->save($data);
            if(!$insert_id) TEA('802');

        } catch (\ApiException $e) {
            //回滚
            DB::connection()->rollBack();
            TEA($e->getCode());
        }
        DB::connection()->commit();
        return $insert_id;
    }



    /**
     * 入库单审核
     * @param $input   array   input数组
     * @throws \Exception
     * @author    liming
     */
    public function audit($input)
    {
        $order_id   = $input['id'];
        //判断 是否 审核
        $status = $this->getStatus($order_id);
        if ($status[0]->status  ==  1) TEA('8308');

        //获取编辑数组
        $data=[
            'status'=>1,
            'auditime'=>time(),
        ];

        try{
            //开启事务
            DB::connection()->beginTransaction();
            //改变状态
            $upd=DB::table($this->table)->where('id',$input['id'])->update($data);
            if($upd===false) TEA('804');
       

        }catch(\ApiException $e){
            //回滚
            DB::connection()->rollBack();
            TEA($e->getCode());
        }
        //提交事务
        DB::connection()->commit();
        return $order_id;
    }


    /**
     * 反审核
     * @param $input   array   input数组
     * @throws \Exception
     * @author    liming
     */
    public function noaudit($input)
    {

        $order_id   = $input['id'];

        //判断 是否 审核
        $status = $this->getStatus($order_id);
        if ($status[0]->status  ==  0) TEA('8307');

        //获取编辑数组
        $data=[
            'status'=>0,
            'auditime'=>0,
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
        //order  (多order的情形,需要多次调用orderBy方法即可)
        if (empty($input['order']) || empty($input['sort']))
        {
            $input['order']='desc';$input['sort']='id';
        }
        $data = [
            'maintainorder.id                   as   id',
            'maintainorder.maintain_status      as   status',
            'maintainorder.start_time           as   start_time',
            'maintainorder.end_time             as   end_time',
            'maintainorder.maintain_time        as   maintain_time',
            'maintainorder.maintain_price       as   maintain_price',
            'maintainorder.require              as   require',
            'maintainorder.is_stopapparatus     as   stopapparatus',
            'maintainorder.stop_time            as   stop_time',
            'maintainorder.work_describe        as   work_describe',
            'devicelist.id                      as    device_id',
            'devicelist.name                    as    device_name',
            'devicelist.spec                    as   device_spec',
            'department.id                      as   department_id',
            'department.name                    as   department_name',
            'urgencygrade.id                    as   urgencygrade_id',
            'urgencygrade.name                  as   urgencygrade_name',
            'urgencygrade.code                  as   urgencygrade_code',
        ];

        $obj_list = DB::table($this->aliasTable['maintainorder'])
            ->orderBy('id','asc')
            ->select($data)
            ->leftJoin($this->aliasTable['devicelist'], 'maintainorder.device_id', '=', 'devicelist.id')  // 设备
            ->leftJoin($this->aliasTable['urgencygrade'], 'maintainorder.maintain_degree', '=', 'urgencygrade.id')  //保修等级
            ->leftJoin($this->aliasTable['department'], 'maintainorder.maintain_department', '=', 'department.id')  //保修部门
            ->orderBy($input['sort'],$input['order'])
            ->get();
        if (!$obj_list) TEA('404');
        return $obj_list;
    }


    public  function destroy($id)
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



    public function  update($input)
    {

         //获取编辑数组
         $data=[
                'device_id'=>$input['device_id'], 
                'work_describe'=>$input['work_describe'], 
                'maintain_department'=>$input['maintain_department'], 
                'maintain_degree'=>$input['maintain_degree'], 
                'maintain_status'=>$input['maintain_status'], 
                'is_stopapparatus'=>$input['is_stopapparatus'], 
                'stop_time'=>$input['stop_time'], 
                'start_time'=>$input['start_time'], 
                'end_time'=>$input['end_time'], 
                'require'=>$input['require'], 
                'maintain_time'=>$input['maintain_time'], 
                'maintain_price'=>$input['maintain_price'], 
            ];

        try{
            //开启事务
            DB::connection()->beginTransaction();
            $order_id = $this->save($data,$input['id']);
            if($order_id===false) TEA('804');
        }catch(\ApiException $e){
            //回滚
            DB::connection()->rollBack();
            TEA($e->getCode());
        }

        //提交事务
        DB::connection()->commit();
        return $order_id;
    }


    /**
     * 查看某条设备台账信息
     * @param $id
     * @return array
     * @author  liming 
     * @todo 
     */
    public function get($id)
    {
         $data = [
            'maintainorder.id                   as   id',
            'maintainorder.maintain_status      as   status',
            'maintainorder.start_time           as   start_time',
            'maintainorder.end_time             as   end_time',
            'maintainorder.maintain_time        as   maintain_time',
            'maintainorder.maintain_price       as   maintain_price',
            'maintainorder.require              as   require',
            'maintainorder.is_stopapparatus     as   stopapparatus',
            'maintainorder.stop_time            as   stop_time',
            'maintainorder.work_describe        as   work_describe',
            'devicelist.id                      as    device_id',
            'devicelist.name                    as    device_name',
            'devicelist.spec                    as   device_spec',
            'department.id                      as   department_id',
            'department.name                    as   department_name',
            'urgencygrade.id                    as   urgencygrade_id',
            'urgencygrade.name                  as   urgencygrade_name',
            'urgencygrade.code                  as   urgencygrade_code',
        ];

         $obj_list = DB::table($this->aliasTable['maintainorder'])
            ->orderBy('id','asc')
            ->select($data)
            ->leftJoin($this->aliasTable['devicelist'], 'maintainorder.device_id', '=', 'devicelist.id')  // 设备
            ->leftJoin($this->aliasTable['urgencygrade'], 'maintainorder.maintain_degree', '=', 'urgencygrade.id')  //保修等级
            ->leftJoin($this->aliasTable['department'], 'maintainorder.maintain_department', '=', 'department.id')  // 报修部门
            ->where("maintainorder.$this->primaryKey",'=',$id)
            ->first();
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
            'maintainorder.id                   as   id',
            'maintainorder.maintain_status      as   status',
            'maintainorder.start_time           as   start_time',
            'maintainorder.end_time             as   end_time',
            'maintainorder.maintain_time        as   maintain_time',
            'maintainorder.maintain_price       as   maintain_price',
            'maintainorder.require              as   require',
            'maintainorder.is_stopapparatus     as   stopapparatus',
            'maintainorder.stop_time            as   stop_time',
            'maintainorder.work_describe        as   work_describe',
            'devicelist.id                      as    device_id',
            'devicelist.name                    as    device_name',
            'devicelist.spec                    as   device_spec',
            'department.id                      as   department_id',
            'department.name                    as   department_name',
            'urgencygrade.id                    as   urgencygrade_id',
            'urgencygrade.name                  as   urgencygrade_name',
            'urgencygrade.code                  as   urgencygrade_code',
        ];



          $obj_list=DB::table($this->aliasTable['maintainorder'])
            ->select($data)
            ->leftJoin($this->aliasTable['devicelist'], 'maintainorder.device_id', '=', 'devicelist.id')  // 设备
            ->leftJoin($this->aliasTable['urgencygrade'], 'maintainorder.maintain_degree', '=', 'urgencygrade.id')  //保修等级
            ->leftJoin($this->aliasTable['department'], 'maintainorder.maintain_department', '=', 'department.id')  // 报修部门
            ->where($where)
            ->offset(($input['page_no']-1)*$input['page_size'])
            ->limit($input['page_size'])
            ->orderBy($input['sort'],$input['order'])
            ->get();
        $obj_list->total_count = DB::table($this->aliasTable['maintainorder'])->where($where)->count();
        return $obj_list;
    }


    // 搜索方法
    public   function  _search($input)
    {
        $where  =  array();

        return  $where;
    }

}