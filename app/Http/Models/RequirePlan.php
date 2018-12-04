<?php 
/**
 * Created by Sublime.
 * User: liming
 * Date: 18/4/9
 */
namespace App\Http\Models;//定义命名空间
use Illuminate\Support\Facades\DB;//引入DB操作类
use App\Exceptions\ApiException;


class RequirePlan extends  Base
{
    public function __construct()
    {
        $this->table='ruis_repair_plan';
        $this->item_table='ruis_repair_plan_item';
        $this->device_table='ruis_device_list';


        //定义表别名
        $this->aliasTable=[
            'plan'=>$this->table.' as plan',
            'item'=>$this->item_table.' as item',
            'device'=>$this->device_table.' as device',
        ];

        if(empty($this->item)) $this->item =new RequirePlanItem();

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
        //  判断单据是否审核
        $order_id   = $input['id'];
        $status = $this->getStatus($order_id);
        if ($status[0]->status  ==  1) TEA('8308');

        try {
            //开启事务
            DB::connection()->beginTransaction();

            //1、修改
            //获取编辑数组
            $data=[
                'happen_time'=>$input['happen_time'],
                'use_status'=>$input['use_status'],
                'fault_degree'=>$input['fault_degree'],
                'fault_type'=>$input['fault_type'],
                'fault_describe'=>$input['fault_describe'],
                'plan_time'=>$input['plan_time'],
                'remind_day'=>$input['remind_day'],
                'repair_type'=>$input['repair_type'],
                'urgency_degree'=>$input['urgency_degree'],
                'fault_department'=>$input['fault_department'],
                'fault_employee'=>$input['fault_employee'],
                'plan_day'=>$input['plan_day'],
                'ave_hour'=>$input['ave_hour'],
                'out_partner'=>$input['out_partner'],
                'out_hour'=>$input['out_hour'],
                'remark'=>$input['remark'],
            ];
            $order_id = $this->save($data,$order_id);
            if(!$order_id) TEA('804');

            //2、添加
            $this->item->saveItem($input,$order_id);

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
                'happen_time'=>$input['happen_time'],
                'use_status'=>$input['use_status'],
                'fault_degree'=>$input['fault_degree'],
                'fault_type'=>$input['fault_type'],
                'fault_describe'=>$input['fault_describe'],
                'plan_time'=>$input['plan_time'],
                'remind_day'=>$input['remind_day'],
                'repair_type'=>$input['repair_type'],
                'urgency_degree'=>$input['urgency_degree'],
                'fault_department'=>$input['fault_department'],
                'fault_employee'=>$input['fault_employee'],
                'plan_day'=>$input['plan_day'],
                'ave_hour'=>$input['ave_hour'],
                'out_partner'=>$input['out_partner'],
                'out_hour'=>$input['out_hour'],
                'remark'=>$input['remark'],
            ];


            $insert_id = $this->save($data);
            if(!$insert_id) TEA('802');

            //2、明细添加
            $this->item->saveItem($input, $insert_id);

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

        //判断 是否 审核
        $status = $this->getStatus($id);
        if ($status[0]->status  ==  1) TEA('8311');
        try{
             //开启事务
             DB::connection()->beginTransaction();

             //1、删除之前先删除明细
             $res = DB::table($this->item_table)->where('plan_id','=',$id)->delete();

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
            'auditime'=>time(),
        ];

        // 获取明细 数据
        $gdata = $this->item->getItems($order_id);

        try{
            //开启事务
            DB::connection()->beginTransaction();
            //改变状态
            $upd=DB::table($this->table)->where('id',$input['id'])->update($data);
            if($upd===false) TEA('804');
            if(count($gdata) < 1) TEA('8309');
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
     * 审核
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
        $gdata = $this->item->getItems($order_id);


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
                'plan.id',
                'plan.happen_time',
                'plan.use_status',
                'plan.fault_type',
                'plan.fault_describe',
                'plan.plan_time',
                'plan.remind_day',
                'plan.repair_type',
                'plan.urgency_degree',
                'plan.fault_department',
                'plan.fault_employee',
                'plan.plan_day',
                'plan.ave_hour',
                'plan.out_partner',
                'plan.status',
                'plan.remark'
                )
            ->where($where)
            ->offset(($input['page_no'] - 1) * $input['page_size'])
            ->limit($input['page_size'])
            ->orderBy($input['sort'],$input['order']);
            $obj_list = $builder->get();
            foreach ($obj_list as $obj)
            {
                $group_list = $this->getItemsByOrder($obj->id);
                $obj->groups = $group_list;
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
                'plan.id',
                'plan.happen_time',
                'plan.use_status',
                'plan.fault_type',
                'plan.fault_describe',
                'plan.plan_time',
                'plan.remind_day',
                'plan.repair_type',
                'plan.urgency_degree',
                'plan.fault_department',
                'plan.fault_employee',
                'plan.plan_day',
                'plan.ave_hour',
                'plan.out_partner',
                'plan.status',
                'plan.remark'
                )
            ->where('plan.id', $id);
        $obj_list = $builder->get();
        foreach ($obj_list as $obj)
        {
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
             'device.id     as   device_id',
             'device.name     as   device_name',
             'device.code     as   device_code',
             'item.plan_id  as   plan_id'
             )
            ->leftJoin($this->aliasTable['device'], 'item.device_id', '=', 'device.id')
            ->where('item.plan_id', $id)
            ->orderBy('item.id', 'asc')->get();
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