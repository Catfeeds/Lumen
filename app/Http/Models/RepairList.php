<?php 
/**
 * Created by Sublime.
 * User: liming
 * Date: 18/4/3
 */
namespace App\Http\Models;//定义命名空间
use Illuminate\Support\Facades\DB;//引入DB操作类

class RepairList extends  Base
{
    public function __construct()
    {
        $this->table='ruis_repairs_list';
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
            'repairlist'=>$this->table.' as repairlist',
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
                'is_outsource'=>$input['is_outsource'], 
                'proposer'=>$input['proposer'], 
                'application_cause'=>$input['application_cause'], 
                'happen_time'=>$input['happen_time'], 
                'fault_grade'=>$input['fault_grade'], 
                'urgency_degree'=>$input['urgency_degree'], 
                'fault_department'=>$input['fault_department'], 
                'fault_describe'=>$input['fault_describe'], 
                'use_employee'=>$input['use_employee'], 
                'ctime'=>time(), 
                'creator'=>$creator_id, 
                'remark'=>$input['remark'], 
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
            'repairlist.id  as   id',
            'repairlist.happen_time  as    happen_time',
            'repairlist.fault_describe  as    fault_describe',
            'repairlist.remark  as    remark',
            'repairlist.application_cause  as    application_cause',
            'devicelist.id  as    device_id',
            'devicelist.name  as    device_name',
            'devicelist.spec  as   device_spec',
            'proposer.id  as   proposer_id',
            'proposer.name  as   proposer_name',
            'department.id  as   department_id',
            'department.name  as   department_name',
            'user.id  as   user_name',
            'user.name  as   user_name',
            'faulttype.id  as   faulttype_id',
            'faulttype.name  as   faulttype_name',
            'faulttype.code  as   faulttype_code',
            'faultgrade.id  as   faultgrade_id',
            'faultgrade.name  as   faultgrade_name',
            'faultgrade.code  as   faultgrade_code',
            'urgencygrade.id  as   urgencygrade_id',
            'urgencygrade.name  as   urgencygrade_name',
            'urgencygrade.code  as   urgencygrade_code',
        ];

        $obj_list = DB::table($this->aliasTable['repairlist'])
            ->orderBy('id','asc')
            ->select($data)
            ->leftJoin($this->aliasTable['devicelist'], 'repairlist.device_id', '=', 'devicelist.id')  // 设备
            ->leftJoin($this->aliasTable['proposer'], 'repairlist.proposer', '=', 'proposer.id')  // 申请人
            ->leftJoin($this->aliasTable['user'], 'repairlist.use_employee', '=', 'user.id')  // 操作员
            ->leftJoin($this->aliasTable['faulttype'], 'repairlist.fault_type', '=', 'faulttype.id')  // 故障类型
            ->leftJoin($this->aliasTable['faultgrade'], 'repairlist.fault_grade', '=', 'faultgrade.id')  // 故障类型
            ->leftJoin($this->aliasTable['urgencygrade'], 'repairlist.urgency_degree', '=', 'urgencygrade.id')  // 故障类型
            ->leftJoin($this->aliasTable['department'], 'repairlist.fault_department', '=', 'department.id')  // 故障类型
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
                'is_outsource'=>$input['is_outsource'], 
                'proposer'=>$input['proposer'], 
                'application_cause'=>$input['application_cause'], 
                'happen_time'=>$input['happen_time'], 
                'fault_grade'=>$input['fault_grade'], 
                'urgency_degree'=>$input['urgency_degree'], 
                'fault_department'=>$input['fault_department'], 
                'fault_describe'=>$input['fault_describe'], 
                'use_employee'=>$input['use_employee'], 
                'remark'=>$input['remark'],
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
           'repairlist.id  as   id',
            'repairlist.happen_time  as    happen_time',
            'repairlist.fault_describe  as    fault_describe',
            'repairlist.remark  as    remark',
            'repairlist.application_cause  as    application_cause',
            'devicelist.id  as    device_id',
            'devicelist.name  as    device_name',
            'devicelist.spec  as   device_spec',
            'proposer.id  as   proposer_id',
            'proposer.name  as   proposer_name',
            'department.id  as   department_id',
            'department.name  as   department_name',
            'user.id  as   user_name',
            'user.name  as   user_name',
            'faulttype.id  as   faulttype_id',
            'faulttype.name  as   faulttype_name',
            'faulttype.code  as   faulttype_code',
            'faultgrade.id  as   faultgrade_id',
            'faultgrade.name  as   faultgrade_name',
            'faultgrade.code  as   faultgrade_code',
            'urgencygrade.id  as   urgencygrade_id',
            'urgencygrade.name  as   urgencygrade_name',
            'urgencygrade.code  as   urgencygrade_code',
        ];

         $obj_list = DB::table($this->aliasTable['repairlist'])
            ->orderBy('id','asc')
            ->select($data)
            ->leftJoin($this->aliasTable['devicelist'], 'repairlist.device_id', '=', 'devicelist.id')  // 设备
            ->leftJoin($this->aliasTable['proposer'], 'repairlist.proposer', '=', 'proposer.id')  // 申请人
            ->leftJoin($this->aliasTable['user'], 'repairlist.use_employee', '=', 'user.id')  // 操作员
            ->leftJoin($this->aliasTable['faulttype'], 'repairlist.fault_type', '=', 'faulttype.id')  // 故障类型
            ->leftJoin($this->aliasTable['faultgrade'], 'repairlist.fault_grade', '=', 'faultgrade.id')  // 故障类型
            ->leftJoin($this->aliasTable['urgencygrade'], 'repairlist.urgency_degree', '=', 'urgencygrade.id')  // 故障类型
            ->leftJoin($this->aliasTable['department'], 'repairlist.fault_department', '=', 'department.id')  // 故障类型
            ->where("repairlist.$this->primaryKey",'=',$id)
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
           'repairlist.id  as   id',
            'repairlist.happen_time  as    happen_time',
            'repairlist.fault_describe  as    fault_describe',
            'repairlist.remark  as    remark',
            'repairlist.application_cause  as    application_cause',
            'devicelist.id  as    device_id',
            'devicelist.name  as    device_name',
            'devicelist.spec  as   device_spec',
            'proposer.id  as   proposer_id',
            'proposer.name  as   proposer_name',
            'department.id  as   department_id',
            'department.name  as   department_name',
            'user.id  as   user_name',
            'user.name  as   user_name',
            'faulttype.id  as   faulttype_id',
            'faulttype.name  as   faulttype_name',
            'faulttype.code  as   faulttype_code',
            'faultgrade.id  as   faultgrade_id',
            'faultgrade.name  as   faultgrade_name',
            'faultgrade.code  as   faultgrade_code',
            'urgencygrade.id  as   urgencygrade_id',
            'urgencygrade.name  as   urgencygrade_name',
            'urgencygrade.code  as   urgencygrade_code',
        ];



          $obj_list=DB::table($this->aliasTable['repairlist'])
            ->select($data)
            ->leftJoin($this->aliasTable['devicelist'], 'repairlist.device_id', '=', 'devicelist.id')  // 设备
            ->leftJoin($this->aliasTable['proposer'], 'repairlist.proposer', '=', 'proposer.id')  // 申请人
            ->leftJoin($this->aliasTable['user'], 'repairlist.use_employee', '=', 'user.id')  // 操作员
            ->leftJoin($this->aliasTable['faulttype'], 'repairlist.fault_type', '=', 'faulttype.id')  // 故障类型
            ->leftJoin($this->aliasTable['faultgrade'], 'repairlist.fault_grade', '=', 'faultgrade.id')  // 故障类型
            ->leftJoin($this->aliasTable['urgencygrade'], 'repairlist.urgency_degree', '=', 'urgencygrade.id')  // 故障类型
            ->leftJoin($this->aliasTable['department'], 'repairlist.fault_department', '=', 'department.id')  // 故障类型
            ->where($where)
            ->offset(($input['page_no']-1)*$input['page_size'])
            ->limit($input['page_size'])
            ->orderBy($input['sort'],$input['order'])
            ->get();
        $obj_list->total_count = DB::table($this->aliasTable['repairlist'])->where($where)->count();
        return $obj_list;
    }


    // 搜索方法
    public   function  _search($input)
    {
        $where  =  array();
        if (isset($input['device_type']) && $input['device_type']) {//根据设备类型
            $where[]=['devicelist.device_type','=',$input['device_type']];
        }

        if (isset($input['type_name']) && $input['type_name']) {//根据设备类型名称
            $where[]=['devtype.name','like','%'.$input['type_name'].'%'];
        }
        return  $where;
    }

}