<?php
/**
 * Created by PhpStorm.
 * User: xiafengjuan
 * Date: 2017/11/04
 * Time: 09:13
 */
namespace App\Http\Models;//定义命名空间storageInitialIndex
use Illuminate\Support\Facades\DB;//引入DB操作类
use Excel;
class StorageInitial extends Base
{
    public function __construct()
    {
        $this->table='ruis_storage_initial';
        $this->item_table='ruis_storage_item';
        $this->employee_table='ruis_rbac_admin';
        $this->plant_table='ruis_factory';
        $this->depot_table='ruis_storage_depot';
        $this->subarea_table='ruis_storage_subarea';
        $this->bin_table='ruis_storage_bin';
        $this->material_table='ruis_material';
        $this->unit_table='ruis_uom_unit';

        //定义表别名
        $this->aliasTable=[
            'initial'=>$this->table.' as initial',
            'item'=>$this->item_table.' as item',
            'creator'=>$this->employee_table.' as creator',
            'auditor'=>$this->employee_table.' as auditor',
            'plant'=>$this->plant_table.' as plant',
            'depot'=>$this->depot_table.' as depot',
            'subarea'=>$this->subarea_table.' as subarea',
            'ruis_material'=>$this->material_table.' as ruis_material',
            'bin'=>$this->bin_table.' as bin',
            'unit'=>$this->unit_table.' as unit',
        ];
        if(empty($this->sitem)) $this->sitem =new StorageItem();
    }
    /**
     * 根据条件查看单条期初库存
     * @author xiafengjuan
     */
    public function getStorageInitial($input)
    {
        $whereStr = "";$start_time=0;$end_time=0;
        $data = array();

        if (isset($input['id']) && $input['id']) {
            $whereStr .='initial.id = '.$input['id'];
        }
        else
        {
            TEA('703','id');
        }

        if (!empty($whereStr)) {//查询条件

            $builder = DB::table($this->aliasTable['initial'])
                ->select('initial.id',
                    'initial.billdate',
                    'initial.direct',
                    'unit.unit_text',
                    'initial.sale_order_code',
                    'initial.po_number',
                    'initial.lock_status',
                    'initial.status',
                    'ruis_material.name  as   material_name',
                    'ruis_material.item_no  as   material_number',
                    'initial.lot',
                    'plant.name   as   plant_name',
                    'depot.name   as   depot_name',
                    'subarea.name   as   subarea_name',
                    'bin.name   as   bin_name',
                    'initial.volume',
                    'initial.quantity',
                    'initial.price',
                    'initial.amount',
                    'creator.name  as   creator_name',
                    'auditor.id  as   auditor_id',
                    'auditor.name  as   auditor_name',
                    'initial.audittime',
                    'initial.remark')
                ->leftJoin($this->aliasTable['ruis_material'], 'initial.material_id', '=', 'ruis_material.id')
                ->leftJoin($this->aliasTable['depot'], 'initial.depot_id', '=', 'depot.id')
                ->leftJoin($this->aliasTable['plant'], 'initial.plant_id', '=', 'plant.id')
                ->leftJoin($this->aliasTable['unit'], 'initial.unit_id', '=', 'unit.id')
                ->leftJoin($this->aliasTable['subarea'], 'initial.subarea_id', '=', 'subarea.id')
                ->leftJoin($this->aliasTable['bin'], 'initial.bin_id', '=', 'bin.id')
                ->leftJoin($this->aliasTable['creator'], 'initial.creator', '=', 'creator.id')
                ->leftJoin($this->aliasTable['auditor'], 'initial.auditor', '=', 'auditor.id')
                ->whereRaw($whereStr, $data);
        }

        $obj_list = $builder->get();
        //遍历格式化数据
        foreach($obj_list as $key=>&$value){
            $value->billdate=date('Y-m-d H:i:s',$value->billdate);
            if($value->audittime>0)
            {
                $value->audittime=date('Y-m-d H:i:s',$value->audittime);
            }
        }
        return $obj_list;
    }
    /**
     * 根据条件查看期初库存
     * @author xiafengjuan
     */
    public function getStorageInitialList(&$input)
    {
        if (isset($input['sale_order_code']) && $input['sale_order_code']) {//根据入库的物料查找
            $where[]=['initial.sale_order_code','like','%'.$input['sale_order_code'].'%'];
        }
        if (isset($input['material_name']) && $input['material_name']) {//根据入库的物料查找
            $where[]=['ruis_material.name','like','%'.$input['material_name'].'%'];
        }
        if (isset($input['material_item_no']) && $input['material_item_no']) {//根据入库的物料编码查找
            $where[]=['ruis_material.item_no','like','%'.$input['material_item_no'].'%'];
        }

        if (isset($input['warehouse_keeper']) && $input['warehouse_keeper']) {//根据仓库人员查找
            $where[]=['creator.name','like','%'.$input['warehouse_keeper'].'%'];
        }

        if (isset($input['starttime']) && $input['starttime']) {//获取来料开始时间
            $start_time = strtotime($input['starttime']);
            $where[]=['initial.billdate','>=',$start_time];
        }
        if (isset($input['endtime']) && $input['endtime']) {//获取来料结束时间
            $end_time = strtotime($input['endtime']);
            $where[]=['initial.billdate','<=',$end_time];
        }
        if (isset($input['isaudit']) && $input['isaudit']==1) {//已审核
            $where[]=['initial.status','=',$input['isaudit']];
        }
        else//未审核
        {
            $where[]=['initial.status','=',0];
        }
        $builder =  DB::table($this->aliasTable['initial'])
            ->select('initial.id',
                'initial.billdate',
                'initial.direct',
                'unit.unit_text',
                'initial.sale_order_code',
                'initial.po_number',
                'initial.lock_status',
                'initial.status',
                'ruis_material.name  as   material_name',
                'ruis_material.item_no  as   material_number',
                'initial.lot',
                'plant.name   as   plant_name',
                'depot.name   as   depot_name',
                'subarea.name   as   subarea_name',
                'bin.name   as   bin_name',
                'initial.volume',
                'initial.quantity',
                'initial.price',
                'initial.amount',
                'creator.name  as   creator_name',
                'auditor.id  as   auditor_id',
                'auditor.name  as   auditor_name',
                'initial.audittime',
                'initial.remark')
            ->leftJoin($this->aliasTable['ruis_material'], 'initial.material_id', '=', 'ruis_material.id')
            ->leftJoin($this->aliasTable['depot'], 'initial.depot_id', '=', 'depot.id')
            ->leftJoin($this->aliasTable['plant'], 'initial.plant_id', '=', 'plant.id')
            ->leftJoin($this->aliasTable['unit'], 'initial.unit_id', '=', 'unit.id')
            ->leftJoin($this->aliasTable['subarea'], 'initial.subarea_id', '=', 'subarea.id')
            ->leftJoin($this->aliasTable['bin'], 'initial.bin_id', '=', 'bin.id')
            ->leftJoin($this->aliasTable['creator'], 'initial.creator', '=', 'creator.id')
            ->leftJoin($this->aliasTable['auditor'], 'initial.auditor', '=', 'auditor.id')
            ->offset(($input['page_no']-1)*$input['page_size'])
            ->limit($input['page_size']);

        if (!empty($where)) $builder->where($where);
        //order  (多order的情形,需要多次调用orderBy方法即可)
        if (!empty($input['order']) && !empty($input['sort'])) $builder->orderBy('initial.' . $input['sort'], $input['order']);
        $builder->orderBy('initial.id','desc');
        //get获取接口
        $obj_list = $builder->get();

        //遍历格式化数据
        foreach($obj_list as $key=>&$value){
            $value->billdate=date('Y-m-d H:i:s',$value->billdate);
            if($value->audittime>0)
            {
                $value->audittime=date('Y-m-d H:i:s',$value->audittime);
            }
        }
        //总共有多少条记录
        $count_builder= DB::table($this->aliasTable['initial'])
            ->leftJoin($this->aliasTable['ruis_material'], 'initial.material_id', '=', 'ruis_material.id')
            ->leftJoin($this->aliasTable['creator'], 'creator.id', '=', 'initial.creator')
            ->leftJoin($this->aliasTable['depot'], 'depot.id', '=', 'initial.depot_id')
            ->leftJoin($this->aliasTable['unit'], 'unit.id', '=', 'initial.unit_id')
            ->leftJoin($this->aliasTable['plant'], 'initial.plant_id', '=', 'plant.id')
            ->leftJoin($this->aliasTable['subarea'], 'initial.subarea_id', '=', 'subarea.id')
            ->leftJoin($this->aliasTable['bin'], 'initial.bin_id', '=', 'bin.id')
            ->leftJoin($this->aliasTable['auditor'], 'initial.auditor', '=', 'auditor.id');
        if (!empty($where)) $count_builder->where($where);
        $input['total_records']= $count_builder->count();
        return $obj_list;

    }
    /**
     * 保存审核数据
     */
    public function save($input,$id=0)
    {
        if ($id>0)
        {
            try{
                //开启事务
                DB::connection()->beginTransaction();
                $upd=DB::table($this->table)->where('id',$id)->update($input);
                if($upd===false) TEA('804');
            }catch(\ApiException $e){
                //回滚
                DB::connection()->rollBack();
                TEA($e->getCode());
            }

            //提交事务
            DB::connection()->commit();

        }
    }
    /**
     * 期初入库单审核
     * @param $input   array   input数组
     * @throws \Exception
     * @author    xiafengjuan
     */
    public function audit($input)
    {
        $order_id   = $input['id'];
        $input['creator_id'] = (!empty(session('administrator')->admin_id)) ? session('administrator')->admin_id : 0;
        $creator_id=$input['creator_id'];
        $id = $this->getFieldValueByWhere([['id','=',$input['id']]], 'id','ruis_storage_initial');//判断id是否存在
        if($id=='')
        {
            TEA('703','id');
        }
        //判断 是否 审核
        $status = $this->getStatus($input['id']);
        if ($status[0]->status  ==  1) TEA('8904');

        //获取编辑数组
        $data=[
            'status'=>1,
            'audittime'=>time(),
            'auditor'=>$creator_id,
        ];
        try{
            //开启事务
            DB::connection()->beginTransaction();

            //1、修改审核状态
            $upd=DB::table($this->table)->where('id',$input['id'])->update($data);
            if($upd===false) TEA('804');

            $tmpdata=$this->getRecordById($input['id']);
            //2、审核期初库存后，入库明细添加
            //过滤数据
            $merge_data  = obj2array($tmpdata);

            $item_id   = $merge_data['id'];
            $res_data = $this->sitem->merge_data($merge_data, 9, 1, 1);


            //保存明细数据
            $this->sitem->save($res_data);
            $item_ = $this->sitem->pk;
            // 外键字段关联
            $this->save(array('item_id'=>$item_), $item_id);

            // 处理出入库明细, 是否入库还是出库
            $this->sitem->passageway($item_);

        }catch(\ApiException $e){
            //回滚
            DB::connection()->rollBack();
            TEA($e->getCode());
        }
        //提交事务
        DB::connection()->commit();
    }
    /**
     * 批量审核调拨单
     * @throws \Exception
     * @author    xiafengjuan
     */
    public function batchaudit($input)
    {
        foreach (json_decode($input['ids'],true)  as  $key=>$tid)
        {
            //id判断
            if(empty($tid['id']) || !is_numeric($tid['id'])) TEA('703','id');
            $this->audit($tid);
        }
    }
    /**
     * 入库单反审核
     * @param $input   array   input数组
     * @throws \Exception
     * @author    xiafengjuan
     */
    public function noaudit($input)
    {
        $input['creator_id'] = (!empty(session('administrator')->admin_id)) ? session('administrator')->admin_id : 0;
        $creator_id=$input['creator_id'];
        //判断 是否 审核
        $status = $this->getStatus($input['id']);
        $id = $this->getFieldValueByWhere([['id','=',$input['id']]], 'id','ruis_storage_initial');//判断id是否存在
        if($id=='')
        {
            TEA('703','id');
        }
        if ($status[0]->status  ==  0) TEA('8905');
        $list = $this->getListsByWhere([['id','=',$input['id']]], 'item_id');
        $item_id=$list[0]->item_id;
        //获取编辑数组
        $data=[
            'status'=>0,
            'audittime'=>time(),
            'item_id'=>'',
            'auditor'=>$creator_id,
        ];

        try{
            //开启事务
            DB::connection()->beginTransaction();
            //1、修改审核状态
            $upd=DB::table($this->table)->where('id',$input['id'])->update($data);
            if($upd===false) TEA('804');

            //[反冲] 库存和出入库明细通道函数
            $this->sitem->destroyById($item_id);


        }catch(\ApiException $e){
            //回滚
            DB::connection()->rollBack();
            TEA($e->getCode());
        }
        //提交事务
        DB::connection()->commit();
    }
    /**
     * 编辑期初库存
     * @param $input
     * @throws \Exception
     * @author  xiafengjuan
     */
    public function update($input)
    {
        $obj_list=DB::table($this->table)->select('id')->get();
        $id = $this->getFieldValueByWhere([['id','=',$input['id']]], 'id','ruis_storage_initial');//判断id是否存在
        if($id=='')
        {
            TEA('703','id');
        }
        //判断 是否 审核
        $status = $this->getStatus($input['id']);
        if ($status[0]->status  ==  1) TEA('8906');
//        $material_id= $this->getFieldValueByWhere([['item_no','=',$input['material_item_no']]], 'id','material');//根据物料编码获取物料id
        //获取编辑数组
        $data=[
            'quantity'=>$input['quantity'],
            'price'=>$input['price'],
            'amount'=>$input['quantity'] * $input['price'],
            'status'=>0,
            'editime'=>time(),
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
     * 导出期初库存模板
     */
    public function Export_initial()
    {
        $cellData = [
            ['物料编码','库存基本单位','销售订单号','生产订单号','批次号','工厂编码','仓库编码','分区','仓位','库存数量','备注'],
        ];
        Excel::create('initial/excel',function($excel) use ($cellData){
            $excel->sheet('score', function($sheet) use ($cellData){
                $sheet->rows($cellData);
            });
        })->export('xls');
    }
    /**
     * 批量导入期初库存数据
     */
    public function saveInitial($inputs)
    {
        $input['creator_id'] = (!empty(session('administrator')->admin_id)) ? session('administrator')->admin_id : 0;
        $creator_id=$input['creator_id'];
        $input['company_id'] = (!empty(session('administrator')->company_id)) ? session('administrator')->company_id: 0;
        $company_id=$input['company_id'];
        $input['factory_id'] = (!empty(session('administrator')->factory_id)) ? session('administrator')->factory_id : 0;
        $factory_id=$input['factory_id'];


        foreach ($inputs  as  $key=>$input)
        {
            $material_id= $this->getFieldValueByWhere([['item_no','=',$input[2]]], 'id','ruis_material');//根据物料编码获取物料id
            $unit_id=$this->getFieldValueByWhere([['unit_text','=',$input[3]]], 'id','ruis_uom_unit');//根据单位名称获取单位id
            $plant_id=$this->getFieldValueByWhere([['code','=',$input[7]]], 'id','ruis_factory');//根据编码获取厂区id
            $depot_id=$this->getFieldValueByWhere([['code','=',$input[8]]], 'id','ruis_storage_depot');//根据编码获取仓库id
            $subarea_id=$this->getFieldValueByWhere([['code','=',$input[9]]], 'id','ruis_storage_subarea');//根据编码获取分区id
            $bin_id=$this->getFieldValueByWhere([['code','=',$input[10]]], 'id','ruis_storage_bin');//根据编码获取仓位id
            $initial_id=$this->getFieldValueByWhere([['sale_order_code','=',$input[4]],['material_id','=',$material_id],['unit_id','=',$unit_id],['plant_id','=',$plant_id],['depot_id','=',$depot_id],['subarea_id','=',$subarea_id],['bin_id','=',$bin_id],['quantity','=',$input[11]]], 'id','ruis_storage_initial');
            if($initial_id>0)//判断是否重复
            {
                continue;
            }

            if (empty($input[0]) && empty($material_id) )
            {
                break;
            }
            $data=[
                'billdate'=>strtotime($input[0]),
                'direct'=>1,
                'sale_order_code'=>empty($input[4])?'':$input[4],//销售订单号
                'po_number'=>empty($input[5])?'':$input[5],//生产订单号
                'material_id'=>$material_id,
                'unit_id'=>$unit_id,
                'lot'=>empty($input[6])?'':$input[6],//批次号
                'lock_status'=>0,//锁库存状态
                'plant_id'=>$plant_id,//工厂id
                'depot_id'=>$depot_id,//仓库id
                'subarea_id'=>$subarea_id,
                'bin_id'=>$bin_id,
                'volume'=>'',
                'status'=>0,
                'quantity'=>$input[11],
                'price'=>0,
                'amount'=>0,
                'creator'=>$creator_id,
                'ctime'=>time(),
                'remark'=>$input[12],
            ];
            $insert_id=DB::table($this->table)->insertGetId($data);
            if(!$insert_id) TEA('802');
        }

    }
    /**
     * 添加或编辑期初库存
     * @author xiafengjuan
     */
    public function add($input,$id=0)
    {
        $input['creator_id'] = (!empty(session('administrator')->admin_id)) ? session('administrator')->admin_id : 0;
        $data=[
            'billdate'=>strtotime($input['billdate']),
            'direct'=>$input['direct'],
            'sale_order_code'=>$input['sale_order_code'],//销售订单号
            'po_number'=>$input['po_number'],//生产订单号
            'wfactory_id'=>$input['wfactory_id'],
            'material_id'=>$input['material_id'],
            'unit_id'=>$input['unit_id'],
            'lot'=>$input['lot'],
            'lock_status'=>$input['lock_status'],//锁库存状态
            'plant_id'=>$input['plant_id'],
            'depot_id'=>$input['depot_id'],
            'subarea_id'=>$input['subarea_id'],
            'bin_id'=>$input['bin_id'],
            'volume'=>$input['volume'],
            'quantity'=>$input['quantity'],
            'price'=>0,
            'amount'=>0,
            'status'=>$input['status'],
            'creator'=>$input['creator_id'],
            'ctime'=>time(),
            'remark'=>$input['remark'],
        ];

        //入库
        $insert_id=DB::table($this->table)->insertGetId($data);
        if(!$insert_id) TEA('802');
    }

    /**
     * 删除期初库存
     * @param $id
     * @throws \Exception
     * @author   xiafengjuan
     */
    public function destroy($id)
    {
        $id = $this->getFieldValueByWhere([['id','=',$id]], 'id','ruis_storage_initial');//判断id是否存在
        if($id=='')
        {
            TEA('703','id');
        }
        //判断 是否 审核
        $status = $this->getStatus($id);
        if ($status[0]->status  ==  1) TEA('8907');
        $num=$this->destroyById($id);
        if($num===false) TEA('803');
        if(empty($num))  TEA('404');
    }
}