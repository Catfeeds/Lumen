<?php 
/**
 * Created by Sublime.
 * User: liming
 * Date: 18/4/3
 */
namespace App\Http\Models;//定义命名空间
use Illuminate\Support\Facades\DB;//引入DB操作类

class DeviceList extends  Base
{
    public function __construct()
    {
        $this->table='ruis_device_list';
        $this->rentpartner_table='ruis_partner';
        $this->supplier_table='ruis_partner';
        $this->procude_table='ruis_partner';       //  生产厂商
        $this->employee_table='ruis_employee';       //  员工
        $this->useemployee_table='ruis_employee';       //  员工
        $this->sign_table='ruis_device_options';       // 设备标记
        $this->status_table='ruis_device_options';       // 设备状况
        $this->device_type_table='ruis_device_type';       // 设备类型
        $this->department_table='ruis_department';       // 部门

        //定义表别名
        $this->aliasTable=[
            'devicelist'=>$this->table.' as devicelist',
            'rentpartner'=>$this->rentpartner_table.' as rentpartner', // 租用单位
            'supplier'=>$this->supplier_table.' as supplier',         // 供应商
            'procude'=>$this->procude_table.' as procude',         // 生产厂商
            'employee'=>$this->employee_table.' as employee',         // 员工
            'user'=>$this->useemployee_table.' as user',         // 员工
            'sign'=>$this->sign_table.' as sign',         // 标记
            'status'=>$this->status_table.' as status',         // 设备状况
            'devtype'=>$this->device_type_table.' as devtype',         // 设备类型
            'department'=>$this->department_table.' as department',         // 部门
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
            //代码唯一性检测
            $has=$this->isExisted([['code','=',$data['code']]]);
            if($has) TEA('9405','code');
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
            //1、入库单添加
            //获取编辑数组
            $data=[
                'code'=>$input['code'],
                'name'=>$input['name'],
                'device_type'=>$input['device_type'], 
                'spec'=>$input['spec'], 
                'rent_partner'=>$input['rent_partner'], 
                'procude_partner'=>$input['procude_partner'], 
                'supplier'=>$input['supplier'], 
                'useful_life'=>$input['useful_life'], 
                'purchase_time'=>$input['purchase_time'], 
                'initial_price'=>$input['initial_price'], 
                'net_price'=>$input['net_price'], 
                'employee_id'=>$input['employee_id'], 
                'device_sign'=>$input['device_sign'], 
                'use_status'=>$input['use_status'], 
                'use_department'=>$input['use_department'], 
                'use_employee'=>$input['use_employee'], 
                'placement_address'=>$input['placement_address'], 
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
            'devicelist.id  as   id',
            'devicelist.code  as    device_code',
            'devicelist.name  as    device_name',
            'devicelist.spec  as    device_spec',
            'devicelist.id    as     device_id',
            'devicelist.procude_partner  as   procude_partner',
            'devicelist.useful_life  as   useful_life',
            'devicelist.purchase_time  as   purchase_time',
            'devicelist.initial_price  as   initial_price',
            'devicelist.net_price  as   net_price',
            'devicelist.placement_address  as   address',
            'devicelist.remark  as   remark',
            'rentpartner.id  as   rentpartner_id',
            'rentpartner.name  as   rentpartner_name',
            'rentpartner.code  as   rentpartner_code',
            'supplier.id  as   supplier_id',
            'supplier.name  as   supplier_name',
            'supplier.code  as   supplier_code',
            'employee.id  as   employee_id',
            'employee.name  as   employee_name',
            'user.id  as   user_id',
            'user.name  as   user_name',
            'sign.id  as   sign_id',
            'sign.name  as   sign_name',
            'sign.code  as   sign_code',
            'status.id  as   status_id',
            'status.name  as   status_name',
            'status.code  as   status_code',
            'devtype.id  as   devtype_id',
            'devtype.name  as   devtype_name',
            'devtype.code  as   devtype_code',
            'department.id  as   department_id',
            'department.name  as   department_name',
        ];

        $where = $this->_search($input);

        $obj_list = DB::table($this->aliasTable['devicelist'])
            ->orderBy('id','asc')
            ->select($data)
            ->leftJoin($this->aliasTable['rentpartner'], 'devicelist.rent_partner', '=', 'rentpartner.id')  // 租用单位
            ->leftJoin($this->aliasTable['supplier'], 'devicelist.supplier', '=', 'supplier.id')
            ->leftJoin($this->aliasTable['employee'], 'devicelist.employee_id', '=', 'employee.id')
            ->leftJoin($this->aliasTable['user'], 'devicelist.use_employee', '=', 'user.id')
            ->leftJoin($this->aliasTable['sign'], 'devicelist.device_sign', '=', 'sign.id')
            ->leftJoin($this->aliasTable['status'], 'devicelist.use_status', '=', 'status.id')
            ->leftJoin($this->aliasTable['devtype'], 'devicelist.device_type', '=', 'devtype.id')
            ->leftJoin($this->aliasTable['department'], 'devicelist.use_department', '=', 'department.id')
            ->orderBy($input['sort'],$input['order'])
            ->where($where)
            ->limit(10)
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
        // 唯一性检测
        $has=$this->isExisted([['code','=',$input['code']],[$this->primaryKey,'<>',$input['id']]]);
        if($has) TEA('9407','code');


         //获取编辑数组
            $data=[
                'code'=>$input['code'],
                'name'=>$input['name'],
                'device_type'=>$input['device_type'], 
                'spec'=>$input['spec'], 
                'rent_partner'=>$input['rent_partner'], 
                'procude_partner'=>$input['procude_partner'], 
                'supplier'=>$input['supplier'], 
                'useful_life'=>$input['useful_life'], 
                'purchase_time'=>$input['purchase_time'], 
                'initial_price'=>$input['initial_price'], 
                'net_price'=>$input['net_price'], 
                'employee_id'=>$input['employee_id'], 
                'device_sign'=>$input['device_sign'], 
                'use_status'=>$input['use_status'], 
                'use_department'=>$input['use_department'], 
                'use_employee'=>$input['use_employee'], 
                'placement_address'=>$input['placement_address'], 
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
            'devicelist.id  as   id',
            'devicelist.code  as    device_code',
            'devicelist.name  as    device_name',
            'devicelist.spec  as   device_spec',
            'devicelist.procude_partner  as   procude_partner',
            'devicelist.id  as   device_id',
            'devicelist.useful_life  as   useful_life',
            'devicelist.purchase_time  as   purchase_time',
            'devicelist.initial_price  as   initial_price',
            'devicelist.net_price  as   net_price',
            'devicelist.placement_address  as   address',
            'devicelist.remark  as   remark',
            'rentpartner.id  as   rentpartner_id',
            'rentpartner.name  as   rentpartner_name',
            'rentpartner.code  as   rentpartner_code',
            'supplier.id  as   supplier_id',
            'supplier.name  as   supplier_name',
            'supplier.code  as   supplier_code',
            'employee.id  as   employee_id',
            'employee.name  as   employee_name',
            'user.id  as   user_id',
            'user.name  as   user_name',
            'sign.id  as   sign_id',
            'sign.name  as   sign_name',
            'sign.code  as   sign_code',
            'status.id  as   status_id',
            'status.name  as   status_name',
            'status.code  as   status_code',
            'devtype.id  as   devtype_id',
            'devtype.name  as   devtype_name',
            'devtype.code  as   devtype_code',
            'department.id  as   department_id',
            'department.name  as   department_name',
        ];




        $obj = DB::table($this->aliasTable['devicelist'])
            ->orderBy('id','asc')
            ->select($data)
            ->leftJoin($this->aliasTable['rentpartner'], 'devicelist.rent_partner', '=', 'rentpartner.id')  // 租用单位
            ->leftJoin($this->aliasTable['supplier'], 'devicelist.supplier', '=', 'supplier.id')
            ->leftJoin($this->aliasTable['employee'], 'devicelist.employee_id', '=', 'employee.id')
            ->leftJoin($this->aliasTable['user'], 'devicelist.use_employee', '=', 'user.id')
            ->leftJoin($this->aliasTable['sign'], 'devicelist.device_sign', '=', 'sign.id')
            ->leftJoin($this->aliasTable['status'], 'devicelist.use_status', '=', 'status.id')
            ->leftJoin($this->aliasTable['devtype'], 'devicelist.device_type', '=', 'devtype.id')
            ->leftJoin($this->aliasTable['department'], 'devicelist.use_department', '=', 'department.id')
            ->where("devicelist.$this->primaryKey",'=',$id)
            ->first();
        if (!$obj) TEA('404');
        return $obj;
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
            'devicelist.id  as   id',
            'devicelist.code  as    device_code',
            'devicelist.name  as    device_name',
            'devicelist.spec  as   device_spec',
            'devicelist.procude_partner  as   procude_partner',
            'devicelist.id  as   device_id',
            'devicelist.useful_life  as   useful_life',
            'devicelist.purchase_time  as   purchase_time',
            'devicelist.initial_price  as   initial_price',
            'devicelist.net_price  as   net_price',
            'devicelist.placement_address  as   address',
            'devicelist.remark  as   remark',
            'rentpartner.id  as   rentpartner_id',
            'rentpartner.name  as   rentpartner_name',
            'rentpartner.code  as   rentpartner_code',
            'supplier.id  as   supplier_id',
            'supplier.name  as   supplier_name',
            'supplier.code  as   supplier_code',
            'employee.id  as   employee_id',
            'employee.name  as   employee_name',
            'user.id  as   user_id',
            'user.name  as   user_name',
            'sign.id  as   sign_id',
            'sign.name  as   sign_name',
            'sign.code  as   sign_code',
            'status.id  as   status_id',
            'status.name  as   status_name',
            'status.code  as   status_code',
            'devtype.id  as   devtype_id',
            'devtype.name  as   devtype_name',
            'devtype.code  as   devtype_code',
            'department.id  as   department_id',
            'department.name  as   department_name',
        ];



          $obj_list=DB::table($this->aliasTable['devicelist'])
            ->select($data)
            ->leftJoin($this->aliasTable['rentpartner'], 'devicelist.rent_partner', '=', 'rentpartner.id')  // 租用单位
            ->leftJoin($this->aliasTable['supplier'], 'devicelist.supplier', '=', 'supplier.id')
            ->leftJoin($this->aliasTable['employee'], 'devicelist.employee_id', '=', 'employee.id')
            ->leftJoin($this->aliasTable['user'], 'devicelist.use_employee', '=', 'user.id')
            ->leftJoin($this->aliasTable['sign'], 'devicelist.device_sign', '=', 'sign.id')
            ->leftJoin($this->aliasTable['status'], 'devicelist.use_status', '=', 'status.id')
            ->leftJoin($this->aliasTable['devtype'], 'devicelist.device_type', '=', 'devtype.id')
            ->leftJoin($this->aliasTable['department'], 'devicelist.use_department', '=', 'department.id')
            ->where($where)
            ->offset(($input['page_no']-1)*$input['page_size'])
            ->limit($input['page_size'])
            ->orderBy($input['sort'],$input['order'])
            ->get();
        $obj_list->total_count = DB::table($this->aliasTable['devicelist'])->where($where)->count();
        return $obj_list;
    }   /**
     * 分页列表
     * @return array  返回数组对象集合
     */
    public function getPageLists($input)
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
            'devicelist.id  as   id',
            'devicelist.code  as    code',
            'devicelist.name  as    name',

        ];
          $obj_list=DB::table($this->aliasTable['devicelist'])
            ->select($data)

            ->where($where)
            ->offset(($input['page_no']-1)*$input['page_size'])
            ->limit($input['page_size'])
            ->orderBy($input['sort'],$input['order'])
            ->get();
        $obj_list->total_count = DB::table($this->aliasTable['devicelist'])->where($where)->count();
        return $obj_list;
    }


    // 搜索方法
    public   function  _search($input)
    {
    	$where  =  array();
    	if (isset($input['device_type']) && $input['device_type']) {//根据设备类型
            $where[]=['devicelist.device_type','=',$input['device_type']];
        }

        if (isset($input['device_code']) && $input['device_code']) {//根据设备编码
            $where[]=['devicelist.code','like','%'.$input['device_code'].'%'];
        }


        if (isset($input['device_name']) && $input['device_name']) {//根据设备编码
            $where[]=['devicelist.name','like','%'.$input['device_name'].'%'];
        }
        if (isset($input['name']) && $input['name']) {//根据设备编码
            $where[]=['devicelist.name','like','%'.$input['name'].'%'];
        }

    	return  $where;
    }

}