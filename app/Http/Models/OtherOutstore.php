<?php  
/**
 * Created by Sublime.
 * User: liming
 * Date: 17/12/19
 */
namespace App\Http\Models;//定义命名空间
use Illuminate\Support\Facades\DB;//引入DB操作类
use App\Exceptions\ApiException;


/**
 *其他出库modle
 */
class OtherOutstore extends Base
{
    
    public function __construct()
    {
        $this->table='ruis_other_outstore';
        $this->item_table='ruis_other_outstore_item';
        $this->employee_table='ruis_employee';
        $this->plant_table='ruis_factory';
        $this->depot_table='ruis_storage_depot';
        $this->subarea_table='ruis_storage_subarea';
        $this->bin_table='ruis_storage_bin';
        $this->material_table='ruis_material';
        $this->unit_table='ruis_uom_unit';
        $this->partner_table='ruis_partner';
        $this->uTable  = 'ruis_rbac_admin';
        


        //定义表别名
        $this->aliasTable=[
            'oouts'=>$this->table.' as oouts',
            'owner'=>$this->partner_table.' as owner',
            'item'=>$this->item_table.' as item',
            'employee'=>$this->employee_table.' as employee',
            'creator'=>$this->uTable.' as creator',
            'auditor'=>$this->uTable.' as auditor',
            'plant'=>$this->plant_table.' as plant',
            'depot'=>$this->depot_table.' as depot',
            'subarea'=>$this->subarea_table.' as subarea',
            'material'=>$this->material_table.' as material',
            'bin'=>$this->bin_table.' as bin',
            'unit'=>$this->unit_table.' as unit',
        ];

        if(empty($this->outstoreitem)) $this->outstoreitem =new OtherOutstoreItem();
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
            if($has) TEA('8405','code');
            //补全数据
            $data['createtime']=time();
            //添加
            $order_id=DB::table($this->table)->insertGetId($data);
            if(!$order_id) TEA('802');
        }
        return $order_id;
    }


    /**
     * 添加操作,添加出库单
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
            //1、出库单添加
            //获取编辑数组
            $data=[
                'code'=>$input['code'],
                'indent_code'=>$input['indent_code'],
                'employee_id'=>$input['employee_id'],
                'workorder_code'=>$input['workorder_code'], 
                'own_id'=>$input['own_id'],
                'creator'=>$creator_id,
                'remark'=>$input['remark'],
            ];

            $insert_id = $this->save($data);
            if(!$insert_id) TEA('802');

            //2、出库明细添加
            $this->outstoreitem->saveItem($input, $insert_id);

        } catch (\ApiException $e) {
            //回滚
            DB::connection()->rollBack();
            TEA($e->getCode());
        }
        DB::connection()->commit();
        return $insert_id;
    }

    /**
     * 编辑出库单
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

            //1、出库单修改
            //获取编辑数组
            $data=[
                'code'=>$input['code'],
                'indent_code'=>$input['indent_code'],
                'employee_id'=>$input['employee_id'],
                'company_id'=>$input['company_id'],
                'workorder_code'=>$input['workorder_code'],
                'own_id'=>$input['own_id'],
                'remark'=>$input['remark'],
            ];
            $order_id = $this->save($data,$order_id);
            if(!$order_id) TEA('804');

            //2、出库明细添加
            $this->outstoreitem->saveItem($input,$order_id);

        } catch (\ApiException $e) {
            //回滚
            DB::connection()->rollBack();
            TEA($e->getCode());
        }
        DB::connection()->commit();
        return $order_id;
    }


    /**
     * 删除其他出库单
     * @param $id
     * @throws \Exception
     * @author liming
     */
    public function destroy($id)
    {
        //判断 是否 审核
        $status = $this->getStatus($id);
        if ($status[0]->status  ==  1) TEA('803');

        try{
             //开启事务
             DB::connection()->beginTransaction();

             //1、删除入库单之前先删除明细
             $res = DB::table($this->item_table)->where('other_outstore_id','=',$id)->delete();

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
    public function getOrderList($input)
    {
        if (!array_key_exists('page_no',$input ) && !array_key_exists('page_size',$input )) TEA('8312','page');
        //order  (多order的情形,需要多次调用orderBy方法即可)
        if (empty($input['order']) || empty($input['sort']))
        {
            $input['order']='desc';$input['sort']='id';
        }
        $where = $this->_search($input);
        $builder = DB::table($this->aliasTable['oouts'])
            ->select('oouts.id as id',
                'oouts.createtime',
                'oouts.auditime',
                'oouts.code',
                'oouts.workorder_code',
                'oouts.indent_code',
                'oouts.status',
                'employee.id       as   employee_id',
                'employee.name     as   employee_name',
                'employee.surname  as   employee_surname',
                'creator.id        as   creator_id',
                'creator.name      as   creator_name',
                'creator.cn_name   as   creator_surname',
                'auditor.id        as   auditor_id',
                'auditor.name      as   auditor_name',
                'owner.id          as   owner_id',
                'owner.name         as   owner_name',
                'owner.abbreviation  as  owner_abbreviation',
                'auditor.cn_name   as   auditor_surname',
                'oouts.remark')
            ->where($where)
            ->leftJoin($this->aliasTable['employee'], 'oouts.employee_id', '=', 'employee.id')
            ->leftJoin($this->aliasTable['owner'], 'oouts.own_id', '=', 'owner.id')
            ->leftJoin($this->aliasTable['creator'], 'oouts.creator', '=', 'creator.id')
            ->leftJoin($this->aliasTable['auditor'], 'oouts.auditor', '=', 'auditor.id')
            ->offset(($input['page_no'] - 1) * $input['page_size'])
            ->limit($input['page_size'])
            ->orderBy($input['sort'],$input['order']);
            $obj_list = $builder->get();
            foreach ($obj_list as $obj)
            {
                $obj->createdate  = date("Y-m-d H:i:s",$obj->createtime);
                $obj->auditdate  = date("Y-m-d H:i:s",$obj->auditime);
                $group_list = $this->getItemsByOrder($obj->id);
                $obj->groups = $group_list;
            }
            $obj_list->total_count = DB::table($this->aliasTable['oouts'])->where($where)->count();
            return $obj_list;
    }


    /**
     * 获取
     * @return array  返回数组对象集合
     */
    public function getOneOrder($id)
    {
        $builder = DB::table($this->aliasTable['oouts'])
            ->select('oouts.id',
                'oouts.createtime',
                'oouts.auditime',
                'oouts.code',
                'oouts.indent_code',
                'oouts.workorder_code',
                'oouts.status',
                'owner.id          as   owner_id',
                'owner.name         as   owner_name',
                'owner.abbreviation  as  owner_abbreviation',
                'employee.id  as     employee_id',
                'employee.name  as   employee_name',
                'employee.surname  as   employee_surname',
                'creator.id  as      creator_id',
                'creator.name  as    creator_name',
                'creator.cn_name  as   creator_surname',
                'auditor.id  as      auditor_id',
                'auditor.name  as    auditor_name',
                'auditor.cn_name  as    auditor_surname',
                'oouts.remark')
            ->leftJoin($this->aliasTable['employee'], 'oouts.employee_id', '=', 'employee.id')
            ->leftJoin($this->aliasTable['owner'], 'oouts.own_id', '=', 'owner.id')
            ->leftJoin($this->aliasTable['creator'], 'oouts.creator', '=', 'creator.id')
            ->leftJoin($this->aliasTable['auditor'], 'oouts.auditor', '=', 'auditor.id')
            ->where('oouts.id', $id);
        $obj_list = $builder->get();
        foreach ($obj_list as $obj)
        {
            $obj->createdate  = date("Y-m-d H:i:s",$obj->createtime);
            $obj->auditdate  = date("Y-m-d H:i:s",$obj->auditime);
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
            ->select('item.id',
             'item.lot           as lot',
             'item.kilo          as kilo',
             'item.quantity      as quantity',
             'item.price         as price',
             'item.amount        as amount',
             'item.total_amount  as total_amount',
             'item.remark        as remark',
             'item.inve_id       as inve_id',
             'item.lock_status   as lock_status',
             'plant.id           as plant_id', 
             'plant.name         as plant_name', 
             'depot.id           as depot_id', 
             'depot.name         as depot_name', 
             'subarea.id         as subarea_id', 
             'subarea.name       as subarea_name', 
             'bin.id             as bin_id', 
             'bin.name           as bin_name', 
             'employee.id        as     employee_id',
             'employee.name      as   employee_name',
             'employee.surname   as   employee_surname',
             'item.indent_code    as indent_code', 
             'item.workorder_code    as workorder_code', 
             'material.id        as material_id',
             'material.item_no   as material_item_no',
             'material.name      as material_name', 
             'owner.id           as   owner_id',
             'owner.name         as   owner_name',
             'owner.abbreviation  as  owner_abbreviation',
             'unit.id             as  unit_id',
             'unit.unit_text     as unit_text')
            ->leftJoin($this->aliasTable['plant'], 'item.plant_id', '=', 'plant.id')
            ->leftJoin($this->aliasTable['depot'], 'item.depot_id', '=', 'depot.id')
            ->leftJoin($this->aliasTable['subarea'], 'item.subarea_id', '=', 'subarea.id')
            ->leftJoin($this->aliasTable['bin'], 'item.bin_id', '=', 'bin.id')
            ->leftJoin($this->aliasTable['owner'], 'item.own_id', '=', 'owner.id')
            ->leftJoin($this->aliasTable['material'], 'item.material_id', '=', 'material.id')
            ->leftJoin($this->aliasTable['employee'], 'item.employee_id', '=', 'employee.id')
            ->leftJoin($this->aliasTable['unit'], 'item.unit_id', '=', 'unit.id')
            ->where('item.other_outstore_id', $id)
            ->orderBy('item.id', 'asc')->get();
        return $obj_list;
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
        if ($status[0]->status  ==  1) TEA('8406');

        //获取编辑数组
        $data=[
            'status'=>1,
            'auditime'=>time(),
        ];

        // 获取明细 数据
        $gdata = $this->outstoreitem->getItems($order_id);

        try{
            //开启事务
            DB::connection()->beginTransaction();
            //改变状态
            $upd=DB::table($this->table)->where('id',$input['id'])->update($data);
            if($upd===false) TEA('804');

            if(count($gdata) < 1) TEA('8407');
            //保存明细至 storage_item表
            foreach ($gdata as $value) {
                //过滤数据
                $merge_data  = obj2array($value);
                $item_id   = $merge_data['id'];
                $res_data = $this->sitem->merge_data($merge_data, 21, '-1', 1);

                //保存明细数据
                $this->sitem->save($res_data);
                $item_ = $this->sitem->pk;

                // 外键字段关联
                $this->outstoreitem->save(array('item_id'=>$item_), $item_id);

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
     * 其他出库单反审
     * @param $input   array   input数组
     * @throws \Exception
     * @author    liming
     */
    public function noaudit($input)
    {

        $order_id   = $input['id'];

        //判断 是否 审核
        $status = $this->getStatus($order_id);
        if ($status[0]->status  ==  0) TEA('8400');

        // 获取明细 数据
        $gdata = $this->outstoreitem->getItems($order_id);

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

            foreach ($gdata as $value) {
                $vaule_arr=obj2array($value);

                //给明细的 item_id  重新置空
                $this->outstoreitem->save(array('item_id'=>"NULL"), $vaule_arr['id']);

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
     * 搜索
     */
    private function _search($input)
    {
        $where = array();
        if (isset($input['indent_code']) && $input['indent_code']) {//根据订单号
            $where[]=['oouts.indent_code','like','%'.$input['indent_code'].'%'];
        }
        if (isset($input['workorder_code']) && $input['workorder_code']) {//根据工单号
            $where[]=['oouts.workorder_code','like','%'.$input['workorder_code'].'%'];
        }
        if (isset($input['own_id']) && $input['own_id']) {//根据所属者id
            $where[]=['oouts.own_id','=',$input['own_id']];
        }
        if (isset($input['status']) && $input['status']) {//根据单据状态
            $where[]=['oouts.status','=',$input['status']];
        }else{
            $where[]=['oouts.status','=',0];
        }
        if (isset($input['start_time']) && $input['start_time']) {//根据创建时间
            $where[]=['oouts.createtime','>=',strtotime($input['start_time'])];
        }
        if (isset($input['end_time']) && $input['end_time']) {//根据创建时间
            $where[]=['oouts.createtime','<=', strtotime($input['end_time'])];
        }
        return $where;
    }
}