<?php 
/**
 * 库存调拨
 * User: xiafengjuan
 * Date: 18/12/05
 */
namespace App\Http\Models;//定义命名空间
use Illuminate\Support\Facades\DB;//引入DB操作类
use App\Exceptions\ApiException;


class StorageAllocate extends Base
{
    
    public function __construct()
    {
        $this->table='ruis_storage_allocate';
        $this->allot_item_table='ruis_storage_allot_item';
        $this->inve_table='ruis_storage_inve';
        $this->item_table='ruis_storage_item';
        $this->partner='ruis_partner';
        $this->uTable  = 'ruis_rbac_admin';
        $this->plant_table='ruis_factory';
        $this->depot_table='ruis_storage_depot';
        $this->subarea_table='ruis_storage_subarea';
        $this->bin_table='ruis_storage_bin';
        $this->material_table='ruis_material';
        $this->unit_table='ruis_uom_unit';

        $this->aliasTable=[
            'allocate'=>$this->table.' as allocate',
            'allot_item'=> $this->allot_item_table.' as allot_item',
            'inve'=>$this->inve_table.' as inve',
            'item'=>$this->item_table.' as item',
            'partner'=>$this->partner.' as partner',
            'user'=>$this->uTable.' as user',
            'auditor'=>$this->uTable.' as auditor',
            'plant'=>$this->plant_table.' as plant',
            'depot'=>$this->depot_table.' as depot',
            'subarea'=>$this->subarea_table.' as subarea',
            'ruis_material'=>$this->material_table.' as ruis_material',
            'bin'=>$this->bin_table.' as bin',
            'unit'=>$this->unit_table.' as unit',
        ];
        if(empty($this->sitem)) $this->sitem =new StorageAllotitem();
        if(empty($this->stgitem)) $this->stgitem =new StorageItem();
        if(empty($this->sinve)) $this->sinve =new StorageInve();
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
            if($has) TEA('8803','code');
            //补全数据
            $data['createtime']=time();
            //添加
            $order_id=DB::table($this->table)->insertGetId($data);
            if(!$order_id) TEA('802');
        }
        return $order_id;
    }
    /**
     * 添加操作,添加调拨申请单
     * @param $input array  input数组
     * @return int         返回插入表之后返回的主键值
     * @author xiafengjuan
     */
    public function add($input)
    {
        $input['creator_id'] = (!empty(session('administrator')->admin_id)) ? session('administrator')->admin_id : 0;
        $input['company_id'] = (!empty(session('administrator')->company_id)) ? session('administrator')->company_id: 0;
        $input['factory_id'] = (!empty(session('administrator')->factory_id)) ? session('administrator')->factory_id : 0;
        
        try {
            if($input['code']=='')
            {
                TEA('703','code');
            }
            if($input['plant_id']=='')
            {
                TEA('703','plant');
            }
            if($input['depot_id']=='')
            {
                TEA('703','depot');
            }
            if($input['subarea_id']=='')
            {
                TEA('703','subarea');
            }
            if($input['bin_id']=='')
            {
                TEA('703','bin');
            }
            //开启事务
            DB::connection()->beginTransaction();
            $has=$this->isExisted([['code','=',$input['code']]]);
            if($has) TEA('8803','code');

            //1、调拨单添加
            //获取编辑数组
            $data=[
                'code'=>$input['code'],
                'billdate'=>time(),
                'nplant_id'=>$input['plant_id'],
                'ndepot_id'=>$input['depot_id'],
                'nsubarea_id'=>$input['subarea_id'],
                'nbin_id'=>$input['bin_id'],
                'creator'=>$input['creator_id'],
                'createtime'=>time(),
                'remark'=>$input['remark'],
            ];
            $insert_id = $this->save($data);
            if(!$insert_id) TEA('802');
            //2、调拨明细添加
            $this->sitem->saveItem($input, $insert_id);

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
    public function getOrderList(&$input)
    {
        $where = $this->_search($input);
        $builder = DB::table($this->aliasTable['allocate'])
            ->select('allocate.id',
                'allocate.createtime',
                'allocate.audittime',
                'allocate.code',
                'allocate.barcode',
                'allocate.status',
                'plant.id  as   plant_id',
                'plant.name  as   plant_name',
                'depot.id  as   depot_id',
                'depot.name  as   depot_name',
                'subarea.id  as  subarea_id',
                'subarea.name  as   subarea_name',
                'bin.id  as   bin_id',
                'bin.name  as   bin_name',
                'user.id  as   creator_id',
                'user.name  as   creator_name',
                'user.id  as   auditor_id',
                'user.name  as   auditor_name',
                'allocate.remark')
            ->leftJoin($this->aliasTable['plant'], 'allocate.nplant_id', '=', 'plant.id')
            ->leftJoin($this->aliasTable['depot'], 'allocate.ndepot_id', '=', 'depot.id')
            ->leftJoin($this->aliasTable['subarea'], 'allocate.nsubarea_id', '=', 'subarea.id')
            ->leftJoin($this->aliasTable['bin'], 'allocate.nbin_id', '=', 'bin.id')
            ->leftJoin($this->aliasTable['user'], 'allocate.creator', '=', 'user.id')
            ->leftJoin($this->aliasTable['auditor'], 'allocate.auditor', '=', 'auditor.id')
            ->offset(($input['page_no'] - 1) * $input['page_size'])
            ->limit($input['page_size']);
        if (!empty($where)) $builder->where($where);
        //order  (多order的情形,需要多次调用orderBy方法即可)
        if (!empty($input['order']) && !empty($input['sort'])) $builder->orderBy('allocate.' . $input['sort'], $input['order']);
        $builder->orderBy('allocate.id','desc');
        $obj_list = $builder->get();
        //遍历格式化数据
        foreach($obj_list as $key=>&$value){
            $value->createtime=date('Y-m-d H:i:s',$value->createtime);
            if($value->audittime>0)
            {
                $value->audittime=date('Y-m-d H:i:s',$value->audittime);
            }
        }
        foreach ($obj_list as $obj)
        {
            $group_list = $this->getItemsByOrder($obj->id);
            $obj->groups = $group_list;
        }
        //总共有多少条记录
        $count_builder= DB::table($this->aliasTable['allocate'])
            ->leftJoin($this->aliasTable['plant'], 'allocate.nplant_id', '=', 'plant.id')
            ->leftJoin($this->aliasTable['depot'], 'allocate.ndepot_id', '=', 'depot.id')
            ->leftJoin($this->aliasTable['subarea'], 'allocate.nsubarea_id', '=', 'subarea.id')
            ->leftJoin($this->aliasTable['bin'], 'allocate.nbin_id', '=', 'bin.id')
            ->leftJoin($this->aliasTable['user'], 'allocate.creator', '=', 'user.id')
            ->leftJoin($this->aliasTable['auditor'], 'allocate.auditor', '=', 'auditor.id');
        if (!empty($where)) $count_builder->where($where);
        $input['total_records']= $count_builder->count();
        return $obj_list;
    }
    /**
     * 搜索
     */
    private function _search($input)
    {
        $where = array();
        if (isset($input['plant_name']) && $input['plant_name']) {//根据厂区查找
            $where[]=['plant.name','like','%'.$input['plant_name'].'%'];
        }
        if (isset($input['depot_name']) && $input['depot_name']) {//根据仓库查找
            $where[]=['depot.name','like','%'.$input['depot_name'].'%'];
        }
        if (isset($input['subarea_name']) && $input['subarea_name']) {//根据区域查找
            $where[]=['subarea.name','like','%'.$input['subarea_name'].'%'];
        }
        if (isset($input['bin_name']) && $input['bin_name']) {//根据仓位查找
            $where[]=['bin.name','like','%'.$input['bin_name'].'%'];
        }
        if(isset($input['isaudit']) && $input['isaudit']==1) {//是否审核
            $where[]=['allocate.status','=',$input['isaudit']];
        }
        else
        {
            $where[]=['allocate.status','=',0];

        }
        return $where;
    }
    /**
     * 获取
     * @return array  返回数组对象集合
     */
    public function getOneOrder($id)
    {
        $builder = DB::table($this->aliasTable['allocate'])
            ->select('allocate.id',
                'allocate.createtime',
                'allocate.audittime',
                'allocate.code',
                'allocate.barcode',
                'allocate.status',
                'plant.id  as   plant_id',
                'plant.name  as   plant_name',
                'depot.id  as   depot_id',
                'depot.name  as   depot_name',
                'subarea.id  as  subarea_id',
                'subarea.name  as   subarea_name',
                'bin.id  as   bin_id',
                'bin.name  as   bin_name',
                'user.id  as   creator_id',
                'user.name  as   creator_name',
                'user.id  as   auditor_id',
                'user.name  as   auditor_name',
                'allocate.remark')
            ->leftJoin($this->aliasTable['plant'], 'allocate.nplant_id', '=', 'plant.id')
            ->leftJoin($this->aliasTable['depot'], 'allocate.ndepot_id', '=', 'depot.id')
            ->leftJoin($this->aliasTable['subarea'], 'allocate.nsubarea_id', '=', 'subarea.id')
            ->leftJoin($this->aliasTable['bin'], 'allocate.nbin_id', '=', 'bin.id')
            ->leftJoin($this->aliasTable['user'], 'allocate.creator', '=', 'user.id')
            ->leftJoin($this->aliasTable['auditor'], 'allocate.auditor', '=', 'auditor.id')
            ->where('allocate.id', $id);
        $obj_list = $builder->get();
        //遍历格式化数据
        foreach($obj_list as $key=>&$value){
            $value->createtime=date('Y-m-d H:i:s',$value->createtime);
            if($value->audittime>0)
            {
                $value->audittime=date('Y-m-d H:i:s',$value->audittime);
            }
        }
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
     * @author xiafengjuan
     */
    public function getItemsByOrder($id)
    {
        //获取列表
        $obj_list = DB::table($this->aliasTable['allot_item'])
            ->select('allot_item.id',
                'allot_item.lot           as lot',
                'allot_item.customcode          as customcode',
                'allot_item.quantity      as quantity',
                'allot_item.direct         as direct',
                'allot_item.remark        as remark',
                'plant.id         as plant_id',
                'plant.name         as plant_name',
                'depot.id         as depot_id',
                'depot.name         as depot_name',
                'subarea.id         as subarea_id',
                'subarea.name       as subarea_name',
                'bin.id         as bin_id',
                'bin.name           as bin_name',
                'ruis_material.id         as material_id',
                'ruis_material.name      as material_name',
                'ruis_material.item_no      as material_item_no',
                'unit.id     as unit_id',
                'unit.unit_text     as unit_text')
            ->leftJoin($this->aliasTable['plant'], 'allot_item.plant_id', '=', 'plant.id')
            ->leftJoin($this->aliasTable['depot'], 'allot_item.depot_id', '=', 'depot.id')
            ->leftJoin($this->aliasTable['subarea'], 'allot_item.subarea_id', '=', 'subarea.id')
            ->leftJoin($this->aliasTable['bin'], 'allot_item.bin_id', '=', 'bin.id')
            ->leftJoin($this->aliasTable['ruis_material'], 'allot_item.material_id', '=', 'ruis_material.id')
            ->leftJoin($this->aliasTable['unit'], 'allot_item.unit_id', '=', 'unit.id')
            ->where('allot_item.fk_id', $id)
            ->where('allot_item.direct', '-1')
            ->orderBy('allot_item.id', 'asc')->get();
        return $obj_list;
    }
    /**
     * 编辑调拨单
     * @param $input array  input数组
     * @return int         返回插入表之后返回的主键值
     * @author xiafengjuan
     */
    public function update($input)
    {
        //  判断单据是否审核
        $order_id   = $input['id'];
        $id = $this->getFieldValueByWhere([['id','=',$order_id]], 'id','ruis_storage_allocate');//判断id是否存在
        if($id=='')
        {
            TEA('703','id');
        }
        $status = $this->getStatus($order_id);

        if ($status[0]->status  ==  1) TEA('8806');
        try {
            //开启事务
            DB::connection()->beginTransaction();
            //1、调拨单添加
            //获取编辑数组
            $data=[
                'code'=>$input['code'],
                'billdate'=>time(),
                'nplant_id'=>$input['plant_id'],
                'ndepot_id'=>$input['depot_id'],
                'nsubarea_id'=>$input['subarea_id'],
                'nbin_id'=>$input['bin_id'],
                'creator'=>'',
                'createtime'=>time(),
                'remark'=>$input['remark'],
            ];
            $insert_id = $this->save($data,$order_id);
            if(!$insert_id) TEA('804');

            //2、调拨明细添加
            $this->sitem->saveItem($input, $insert_id);

        } catch (\ApiException $e) {
            //回滚
            DB::connection()->rollBack();
            TEA($e->getCode());
        }
        DB::connection()->commit();
        return $order_id;
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
     * 调拨单审核
     * @param $input   array   input数组
     * @throws \Exception
     * @author    xiafengjuan
     */
    public function audit($input)
    {
        $order_id   = $input['id'];
        $id = $this->getFieldValueByWhere([['id','=',$order_id]], 'id','ruis_storage_allocate');//判断id是否存在
        if($id=='')
        {
            TEA('703','id');
        }
        //判断 是否 审核
        $status = $this->getStatus($order_id);
        if ($status[0]->status  ==  1) TEA('8804');

        //获取编辑数组
        $data=[
            'status'=>1,
            'audittime'=>time(),
        ];

        // 获取明细 数据
        $gdata = $this->sitem->getItems($order_id);
        try{
            //开启事务
            DB::connection()->beginTransaction();
            //改变状态
            $upd=DB::table($this->table)->where('id',$input['id'])->update($data);
            if($upd===false) TEA('804');


            if(count($gdata) < 1) TEA('8807');
            //保存明细至 storage_item表
            foreach ($gdata as $value) {
                //过滤数据
                $merge_data  = obj2array($value);
                $direct=$merge_data['direct'];
                if($merge_data['inve_id']>0)
                {
                    $this->sinve->updateRelation($merge_data['inve_id']);//计算实时库存，保证获取最新库龄
                    $inve_list = $this->sinve->getRecordById($merge_data['inve_id']);//实时库存id
                    $inve_data= obj2array($inve_list);
                    $inve_age=$inve_data['inve_age']*86400;//实时库龄
                    $dotime= time()-$inve_age;//实际入库时间
                }
               else
               {
                   $dotime= time();
               }

                $item_id   = $merge_data['id'];
                if($direct=='1')
                {
                    $res_data = $this->stgitem->merge_data($merge_data, 13, 1, 1);//调拨入库
                    $res_data['ctime']=$dotime;
                    //保存明细数据
                    $this->stgitem->save($res_data);
                    $item_ = $this->stgitem->pk;
                    // 外键字段关联
                    $this->sitem->save(array('initem_id'=>$item_), $item_id);//入库

                }
                else if($direct=='-1')
                {
                    $res_data_out = $this->stgitem->merge_data($merge_data, 32, '-1', 1);//调拨出库
                    $res_data_out['ctime']=$dotime;
                    //保存明细数据
                    $this->stgitem->save($res_data_out);
                    $item_ = $this->stgitem->pk;
                    // 外键字段关联
                    $this->sitem->save(array('outitem_id'=>$item_), $item_id);//出库\
                }
                // 处理出入库明细, 是否入库还是出库
                $this->stgitem->passageway($item_);

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
     * 删除调拨单
     * @param $id
     * @throws \Exception
     * @author xiafengjuan
     */
    public function destroy($id)
    {
        $id = $this->getFieldValueByWhere([['id','=',$id]], 'id','ruis_storage_allocate');//判断id是否存在
        if($id=='')
        {
            TEA('703','id');
        }
        //判断 是否 审核
        $status = $this->getStatus($id);
        if ($status[0]->status  ==  1) TEA('8809');

        try{
            //开启事务
            DB::connection()->beginTransaction();

            //1、删除调拨单之前先删除明细
            $res = DB::table($this->allot_item_table)->where('fk_id','=',$id)->delete();


            //2、删除调拨单
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

}