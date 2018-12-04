<?php 
/**
 * Created by Sublime.
 * User: liming
 * Date: 17/10/27
 */
namespace App\Http\Models;//定义命名空间
use Illuminate\Support\Facades\DB;//引入DB操作类
use App\Exceptions\ApiException;

class SpareReceive extends  Base
{
    public function __construct()
    {
        $this->table='ruis_spare_receive';
        $this->item_table='ruis_spare_receive_item';
        $this->employee_table='ruis_employee';
        $this->department_table='ruis_department';
        $this->depot_table='ruis_storage_depot';
        $this->spare_table='ruis_spare_list';
        $this->uTable  = 'ruis_rbac_admin';

   

        //定义表别名
        $this->aliasTable=[
            'receive'=>$this->table.' as receive',
            'item'=>$this->item_table.' as item',
            'employee'=>$this->employee_table.' as employee',
            'department'=>$this->department_table.' as department',
            'depot'=>$this->depot_table.' as depot',
            'spare'=>$this->spare_table.' as spare',
            'creator'=>$this->uTable.' as creator',
            'auditor'=>$this->uTable.' as auditor',
        ];

        if(empty($this->receiveitem)) $this->receiveitem =new SpareReceiveItem();
        if(empty($this->sitem)) $this->sitem =new StorageItem();

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
            if($has) TEA('8305','code');
            //添加
            $order_id=DB::table($this->table)->insertGetId($data);
            if(!$order_id) TEA('802');
        }
        return $order_id;
    }


    /**
     * 编辑入库单
     * @param $input array  input数组
     * @return int         返回插入表之后返回的主键值
     * @author liming
     */
    public function update($input)
    {
        //  判断单据是否审核
        $reveive_id   = $input['id'];
        $status = $this->getStatus($reveive_id);
        if ($status[0]->status  ==  1) TEA('8308');

        try {
            //开启事务
            DB::connection()->beginTransaction();

            //1修改
            //获取编辑数组
            $data=[
                'code'=>$input['code'],
                'order_id'=>$input['order_id'],
                'device_id'=>$input['device_id'],
                'department_id'=>$input['department_id'],
                'employee_id'=>$input['employee_id'],
                'depot_id'=>$input['depot_id'],
                'remark'=>$input['remark'],
            ];



            $order_id = $this->save($data,$reveive_id);
            if(!$order_id) TEA('804');

            //2、入库明细添加
            $this->receiveitem->saveItem($input,$reveive_id);

        } catch (\ApiException $e) {
            //回滚
            DB::connection()->rollBack();
            TEA($e->getCode());
        }
        DB::connection()->commit();
        return $order_id;
    }



    /**
     * 添加操作,添加入库单
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
                'order_id'=>$input['order_id'],
                'device_id'=>$input['device_id'],
                'department_id'=>$input['department_id'],
                'employee_id'=>$input['employee_id'],
                'depot_id'=>$input['depot_id'],
                'creator'=>$creator_id,
                'remark'=>$input['remark'],
                'ctime'=>time(),
            ];
            $insert_id = $this->save($data);
            if(!$insert_id) TEA('802');
            //2、添加明细
            $this->receiveitem->saveItem($input, $insert_id);

        } catch (\ApiException $e) {
            //回滚
            DB::connection()->rollBack();
            TEA($e->getCode());
        }
        DB::connection()->commit();
        return $insert_id;
    }

    /**
     * 删除入库单
     * @param $id
     * @throws \Exception
     * @author liming
     */
    public function destroy($id)
    {
        //判断 是否 审核
        $status = $this->getStatus($id);
        if ($status[0]->status  ==  1) TEA('8311');

        try{
             //开启事务
             DB::connection()->beginTransaction();

             //1、删除入库单之前先删除明细
             $res = DB::table($this->item_table)->where('receive_id','=',$id)->delete();

             //2、删除入库单
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
    public function getList($input)
    {
        //order  (多order的情形,需要多次调用orderBy方法即可)
        if (empty($input['order']) || empty($input['sort']))
        {
            $input['order']='desc';$input['sort']='id';
        }
   
        $obj_list = DB::table($this->aliasTable['receive'])
            ->orderBy('id','asc')
            ->select(
                'receive.id',
                'receive.ctime',
                'receive.code',
                'receive.status',
                'receive.order_id',
                'employee.id  as     employee_id',
                'employee.name  as   employee_name',
                'employee.surname  as   employee_surname',
                'creator.id  as      creator_id',
                'creator.name  as    creator_name',
                'creator.cn_name  as   creator_surname',
                'auditor.id  as      auditor_id',
                'auditor.name  as    auditor_name',
                'auditor.cn_name  as    auditor_surname',
                'department.id  as      department_id',
                'department.name  as    department_name',
                'depot.id  as      depot_id',
                'depot.name  as    depot_name',
                'depot.code  as    depot_code',
                'receive.remark')
            ->leftJoin($this->aliasTable['employee'], 'receive.employee_id', '=', 'employee.id')
            ->leftJoin($this->aliasTable['creator'], 'receive.creator', '=', 'creator.id')
            ->leftJoin($this->aliasTable['auditor'], 'receive.auditor', '=', 'auditor.id')
            ->leftJoin($this->aliasTable['department'], 'receive.department_id', '=', 'department.id')
            ->leftJoin($this->aliasTable['depot'], 'receive.depot_id', '=', 'depot.id')
            ->orderBy($input['sort'],$input['order'])
            ->get();
        if (!$obj_list) TEA('404');
        return $obj_list;
    }


    /**
     * 审核
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
        ];

        // 获取明细 数据
        $gdata = $this->receiveitem->getItems($order_id);

        try{
            //开启事务
            DB::connection()->beginTransaction();
            //改变状态
            $upd=DB::table($this->table)->where('id',$input['id'])->update($data);
            if($upd===false) TEA('804');


            if(count($gdata) < 1) TEA('8309');
            //保存明细至 storage_item表
            foreach ($gdata as $value) {

                //过滤数据
                $merge_data  = obj2array($value);
                $item_id   = $merge_data['id'];
                $res_data = $this->sitem->merge_data($merge_data, 0, '-1', 1);

                //保存明细数据
                $this->sitem->save($res_data);
                $item_ = $this->sitem->pk;

                // 外键字段关联
                $this->receiveitem->save(array('item_id'=>$item_), $item_id);

                // 处理出入库明细, 是否入库还是出库
                $this->sitem->passageway($item_);
            }
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
     * 审核反冲
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

        // 获取明细 数据
        $gdata = $this->receiveitem->getItems($order_id);


        //获取编辑数组
        $data=[
            'status'=>0,
        ];

        try{
            //开启事务
            DB::connection()->beginTransaction();
            $upd=DB::table($this->table)->where('id',$input['id'])->update($data);
            if($upd===false) TEA('804');

            foreach ($gdata as $value) {
                $vaule_arr=obj2array($value);

                //给明细的 item_id  重新置空
                $this->receiveitem->save(array('item_id'=>"NULL"), $vaule_arr['id']);

                //[反冲] 库存和出入库明细通道函数
                $this->sitem->del($vaule_arr['item_id']);
            }

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
    public function getPageList($input)
    {
        if (!array_key_exists('page_no',$input ) && !array_key_exists('page_size',$input )) TEA('8312','page');
        //order  (多order的情形,需要多次调用orderBy方法即可)
        if (empty($input['order']) || empty($input['sort']))
        {
            $input['order']='desc';$input['sort']='id';
        }
        $where = $this->_search($input);
        $builder = DB::table($this->aliasTable['receive'])
            ->select(
                'receive.id',
                'receive.ctime',
                'receive.code',
                'receive.status',
                'receive.order_id',
                'employee.id  as     employee_id',
                'employee.name  as   employee_name',
                'employee.surname  as   employee_surname',
                'creator.id  as      creator_id',
                'creator.name  as    creator_name',
                'creator.cn_name  as   creator_surname',
                'auditor.id  as      auditor_id',
                'auditor.name  as    auditor_name',
                'auditor.cn_name  as    auditor_surname',
                'department.id  as      department_id',
                'department.name  as    department_name',
                'depot.id  as      depot_id',
                'depot.name  as    depot_name',
                'depot.code  as    depot_code',
                'receive.remark')
            ->where($where)
            ->leftJoin($this->aliasTable['employee'], 'receive.employee_id', '=', 'employee.id')
            ->leftJoin($this->aliasTable['creator'], 'receive.creator', '=', 'creator.id')
            ->leftJoin($this->aliasTable['auditor'], 'receive.auditor', '=', 'auditor.id')
            ->leftJoin($this->aliasTable['department'], 'receive.department_id', '=', 'department.id')
            ->leftJoin($this->aliasTable['depot'], 'receive.depot_id', '=', 'depot.id')
            ->offset(($input['page_no'] - 1) * $input['page_size'])
            ->limit($input['page_size'])
            ->orderBy($input['sort'],$input['order']);
            $obj_list = $builder->get();
            foreach ($obj_list as $obj)
            {
                $obj->createdate  = date("Y-m-d H:i:s",$obj->ctime);
                $group_list = $this->getItemsByOrder($obj->id);
                $obj->groups = $group_list;
            }
            $obj_list->total_count = DB::table($this->aliasTable['receive'])->where($where)->count();
            return $obj_list;
    }

    /**
     * 获取
     * @return array  返回数组对象集合
     */
    public function getOneSpare($id)
    {
        $builder = DB::table($this->aliasTable['receive'])
            ->select(
                'receive.id',
                'receive.ctime',
                'receive.code',
                'receive.status',
                'receive.order_id',
                'employee.id  as     employee_id',
                'employee.name  as   employee_name',
                'employee.surname  as   employee_surname',
                'creator.id  as      creator_id',
                'creator.name  as    creator_name',
                'creator.cn_name  as   creator_surname',
                'auditor.id  as      auditor_id',
                'auditor.name  as    auditor_name',
                'auditor.cn_name  as    auditor_surname',
                'department.id  as      department_id',
                'department.name  as    department_name',
                'depot.id  as      depot_id',
                'depot.name  as    depot_name',
                'depot.code  as    depot_code',
                'receive.remark')
            ->leftJoin($this->aliasTable['employee'], 'receive.employee_id', '=', 'employee.id')
            ->leftJoin($this->aliasTable['creator'], 'receive.creator', '=', 'creator.id')
            ->leftJoin($this->aliasTable['auditor'], 'receive.auditor', '=', 'auditor.id')
            ->leftJoin($this->aliasTable['department'], 'receive.department_id', '=', 'department.id')
            ->leftJoin($this->aliasTable['depot'], 'receive.depot_id', '=', 'depot.id')
            ->where('receive.id', $id);
        $obj_list = $builder->get();
        foreach ($obj_list as $obj)
        {
            $obj->createdate  = date("Y-m-d H:i:s",$obj->ctime);
            $group_list = $this->getItemsByOrder($obj->id);
            $obj->groups = $group_list;
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
             'item.trade_id      as trade_id',
             'spare.id           as spare_id',
             'spare.name         as spare_name',
             'spare.code         as spare_code'
             )
            ->leftJoin($this->aliasTable['spare'], 'item.spare_id', '=', 'spare.id')
            ->where('item.receive_id', $id)
            ->orderBy('item.id', 'asc')->get();
        return $obj_list;
    }

    /**
     * 搜索
     */
    private function _search($input)
    {
        $where = array();
        // if (isset($input['indent_code']) && $input['indent_code']) {//根据订单号
        //     $where[]=['oins.indent_code','like','%'.$input['indent_code'].'%'];
        // }
        // if (isset($input['workorder_code']) && $input['workorder_code']) {//根据工单号
        //     $where[]=['oins.code','like','%'.$input['workorder_code'].'%'];
        // }
        // if (isset($input['own_id']) && $input['own_id']) {//根据所属者id
        //     $where[]=['oins.own_id','=',$input['own_id']];
        // }
        // if (isset($input['status']) && $input['status']) {//根据单据状态
        //     $where[]=['oins.status','=',$input['status']];
        // }else{
        //     $where[]=['oins.status','=',0];
        // }
        // if (isset($input['start_time']) && $input['start_time']) {//根据创建时间
        //     $where[]=['oins.createtime','>=',strtotime($input['start_time'])];
        // }
        // if (isset($input['end_time']) && $input['end_time']) {//根据创建时间
        //     $where[]=['oins.createtime','<=', strtotime($input['end_time'])];
        // }
        return $where;
    }
}