<?php 
/**
 * Created by Sublime.
 * User: liming
 * Date: 18/4/9
 */
namespace App\Http\Models;//定义命名空间
use Illuminate\Support\Facades\DB;//引入DB操作类
use App\Exceptions\ApiException;


class MaintainPlan extends  Base
{
    public function __construct()
    {
        $this->table='ruis_maintain_plan';
        $this->item_table='ruis_maintain_plan_item';
        $this->deviceitem_table='ruis_maintain_device_item';
        $this->spareitem_table='ruis_maintain_spare_item';
        $this->device_table='ruis_device_list';
        $this->department_table='ruis_department';
        $this->employee_table='ruis_employee';
        $this->degree_table='ruis_device_options';
        $this->require_table='ruis_upkee_require';
        $this->spare_table='ruis_spare_list';


        //定义表别名
        $this->aliasTable=[
            'plan'=>$this->table.' as plan',
            'item'=>$this->item_table.' as item',
            'device'=>$this->device_table.' as device',
            'deviceitem'=>$this->deviceitem_table.' as deviceitem',
            'spareitem'=>$this->spareitem_table.' as spareitem',
            'department'=>$this->department_table.' as department',
            'employee'=>$this->employee_table.' as employee',
            'degree'=>$this->degree_table.' as degree',
            'require'=>$this->require_table.' as require',
            'spare'=>$this->spare_table.' as spare',

        ];

        if(empty($this->item)) $this->item =new MaintainPlanItem();
        if(empty($this->maintaindevice)) $this->maintaindevice =new MaintainPlanDevice();
        if(empty($this->maintainspare)) $this->maintainspare =new MaintainPlanSpare();

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
            //添加
            $order_id=DB::table($this->table)->insertGetId($data);
            if(!$order_id) TEA('802');
        }
        return $order_id;
    }


    /**
     * 编辑
     * @param $input array  input数组
     * @return int         返回插入表之后返回的主键值
     * @author liming
     */
    public function update($input)
    {
        $order_id   = $input['id'];
        try {
            //开启事务
            DB::connection()->beginTransaction();

            //1、修改
            //获取编辑数组
            $data=[
                'maintain_department'=>$input['maintain_department'],
                'maintain_employee'=>$input['maintain_employee'],
                'maintain_degree'=>$input['maintain_degree'],
                'remind_time'=>$input['remind_time'],
                'loop_way'=>$input['loop_way'],
                'loop_cycle'=>$input['loop_cycle'],
                'start_time'=>$input['start_time'],
                'end_time'=>$input['end_time'],
                'remark'=>$input['remark'],
            ];
            $order_id = $this->save($data,$order_id);
            if(!$order_id) TEA('804');


             //2、明细添加
            $this->item->saveItem($input, $order_id);


             //3、明细设备
            $this->maintaindevice->saveItem($input, $order_id);


             //4、添加备件
            $this->maintainspare->saveItem($input, $order_id);


        } catch (\ApiException $e) {
            //回滚
            DB::connection()->rollBack();
            TEA($e->getCode());
        }
        DB::connection()->commit();
        return $order_id;
    }



    /**
     * 添加操作,添加
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
                'maintain_department'=>$input['maintain_department'],
                'maintain_employee'=>$input['maintain_employee'],
                'maintain_degree'=>$input['maintain_degree'],
                'remind_time'=>$input['remind_time'],
                'loop_way'=>$input['loop_way'],
                'loop_cycle'=>$input['loop_cycle'],
                'start_time'=>$input['start_time'],
                'end_time'=>$input['end_time'],
                'remark'=>$input['remark'],
            ];
            $insert_id = $this->save($data);
            if(!$insert_id) TEA('802');

            //2、明细添加
            $this->item->saveItem($input, $insert_id);


             //3、明细设备
            $this->maintaindevice->saveItem($input, $insert_id);


             //4、添加备件
            $this->maintainspare->saveItem($input, $insert_id);



        } catch (\ApiException $e) {
            //回滚
            DB::connection()->rollBack();
            TEA($e->getCode());
        }
        DB::connection()->commit();
        return $insert_id;
    }

    /**
     * 删除
     * @param $id
     * @throws \Exception
     * @author liming
     */
    public function destroy($id)
    {
        try{
             //开启事务
             DB::connection()->beginTransaction();

             //1、删除之前先删除明细
             $itemres = DB::table($this->item_table)->where('plan_id','=',$id)->delete();

             $deviceres = DB::table($this->deviceitem_table)->where('plan_id','=',$id)->delete();

             $spareres = DB::table($this->spareitem_table)->where('plan_id','=',$id)->delete();

             //2、删除
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
     * 获取列表
     * @return array  返回数组对象集合
     */
    public function getOrderList($input)
    {
        if (!array_key_exists('page_no',$input ) && !array_key_exists('page_size',$input )) TEA('8312','page');
        //order  (多order的情形,需要多次调用orderBy方法即可)
        if (empty($input['order']) || empty($input['sort']))
        {
            $input['order']='desc';$input['sort']='id';
        }
        $where = $this->_search($input);
        $builder = DB::table($this->aliasTable['plan'])
            ->select(
                 'plan.id            as  id',
                'plan.remind_time   as  remind_time',
                'plan.loop_way      as  loop_way',
                'plan.loop_cycle    as  loop_cycle',
                'plan.start_time    as  start_time',
                'plan.end_time      as  end_time',
                'plan.remark        as  remark',
                'degree.id          as  degree_id',
                'degree.name        as  degree_name',
                'degree.code        as  degree_code',
                'department.id      as  department_id',
                'department.name    as  department_name',
                'employee.id          as  employee_id',
                'employee.name        as  employee_name'
                )
            ->leftJoin($this->aliasTable['department'], 'plan.maintain_department', '=', 'department.id')
            ->leftJoin($this->aliasTable['employee'], 'plan.maintain_employee', '=', 'employee.id')
            ->leftJoin($this->aliasTable['degree'], 'plan.maintain_degree', '=', 'degree.id')
            ->offset(($input['page_no'] - 1) * $input['page_size'])
            ->limit($input['page_size'])
            ->orderBy($input['sort'],$input['order']);
            $obj_list = $builder->get();
            foreach ($obj_list as $obj)
            {
                $item_list = $this->getItemsByOrder($obj->id);
                $device_list = $this->getDeviceItemsByOrder($obj->id);
                $spare_list = $this->getSpareItemsByOrder($obj->id);
                $obj->itemgroups = $item_list;
                $obj->devicegroups = $device_list;
                $obj->sparegroups = $spare_list;
            }
            $obj_list->total_count = DB::table($this->aliasTable['plan'])->where($where)->count();
            return $obj_list;
    }

    /**
     * 获取
     * @return array  返回数组对象集合
     */
    public function getOneOrder($id)
    {
        $builder = DB::table($this->aliasTable['plan'])
            ->select(
                'plan.id            as  id',
                'plan.remind_time   as  remind_time',
                'plan.loop_way      as  loop_way',
                'plan.loop_cycle    as  loop_cycle',
                'plan.start_time    as  start_time',
                'plan.end_time      as  end_time',
                'plan.remark        as  remark',
                'degree.id          as  degree_id',
                'degree.name        as  degree_name',
                'degree.code        as  degree_code',
                'department.id      as  department_id',
                'department.name    as  department_name',
                'employee.id          as  employee_id',
                'employee.name        as  employee_name'
                )
            ->leftJoin($this->aliasTable['department'], 'plan.maintain_department', '=', 'department.id')
            ->leftJoin($this->aliasTable['employee'], 'plan.maintain_employee', '=', 'employee.id')
            ->leftJoin($this->aliasTable['degree'], 'plan.maintain_degree', '=', 'degree.id')
            ->where('plan.id', $id);
        $obj_list = $builder->get();
        foreach ($obj_list as $obj)
        {
            $item_list = $this->getItemsByOrder($obj->id);
            $device_list = $this->getDeviceItemsByOrder($obj->id);
            $spare_list = $this->getSpareItemsByOrder($obj->id);
            $obj->itemgroups = $item_list;
            $obj->devicegroups = $device_list;
            $obj->sparegroups = $spare_list;
        }
        return $obj_list;
    }

    /**
     * 获取明细数据
     * @param $id
     * @return mixed
     * @author liming
     */
    public function getItemsByOrder($id)
    {
        //获取列表
        $obj_list = DB::table($this->aliasTable['item'])
            ->select(
             'item.id',
             'require.id            as   require_id',
             'require.upkee_part    as   upkee_part',
             'require.upkee_require   as   upkee_require',
             'item.plan_id          as   plan_id'
             )
            ->leftJoin($this->aliasTable['require'], 'item.plan_id', '=', 'require.id')
            ->where('item.plan_id', $id)
            ->orderBy('item.id', 'asc')->get();
        return $obj_list;
    }


    /**
     * 获取设备明细数据
     * @param $id
     * @return mixed
     * @author liming
     */
    public function getDeviceItemsByOrder($id)
    {
        //获取列表
        $obj_list = DB::table($this->aliasTable['deviceitem'])
            ->select(
             'deviceitem.id',
             'deviceitem.plan_id          as   plan_id',
             'device.id                   as   device_id',
             'device.name                 as   device_name',
             'device.code                 as   device_code'
             )
            ->leftJoin($this->aliasTable['device'], 'deviceitem.device_id', '=', 'device.id')
            ->where('deviceitem.plan_id', $id)
            ->orderBy('deviceitem.id', 'asc')->get();
        return $obj_list;
    }


    /**
     * 获取备件明细数据
     * @param $id
     * @return mixed
     * @author liming
     */
    public function getSpareItemsByOrder($id)
    {
        //获取列表
        $obj_list = DB::table($this->aliasTable['spareitem'])
            ->select(
             'spareitem.id',
             'spareitem.plan_id          as   plan_id',
             'spare.id                   as   spare_id',
             'spare.name                 as   spare_name',
             'spare.code                 as   spare_code'
             )
            ->leftJoin($this->aliasTable['spare'], 'spareitem.spare_id', '=', 'spare.id')
            ->where('spareitem.plan_id', $id)
            ->orderBy('spareitem.id', 'asc')->get();
        return $obj_list;
    }


    /**
     * 搜索
     */
    private function _search($input)
    {
        $where = array();
        if (isset($input['indent_code']) && $input['indent_code']) {//根据订单号
            $where[]=['plan.indent_code','like','%'.$input['indent_code'].'%'];
        }
        return $where;
    }
}