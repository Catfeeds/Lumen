<?php 
/**
 * 库存签转
 * User: liming
 * Date: 18/10/27
 */
namespace App\Http\Models;//定义命名空间
use Illuminate\Support\Facades\DB;//引入DB操作类
use App\Exceptions\ApiException;
class StorageChange extends Base
{
    
    public function __construct()
    {
        $this->table='ruis_storage_change';
        $this->change_item_table='ruis_storage_change_item';
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
            'change'=>$this->table.' as change',
            'change_item'=> $this->change_item_table.' as change_item',
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
        if(empty($this->sitem)) $this->sitem =new StorageChangeItem();
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
            //补全数据
            $data['createtime']=time();
            //添加
            $order_id=DB::table($this->table)->insertGetId($data);
            if(!$order_id) TEA('802');
        }
        return $order_id;
    }
    /**
     * 添加操作,添加签转申请单
     * @param $input array  input数组
     * @return int         返回插入表之后返回的主键值
     * @author liming
     */
    public function add($input)
    {
        $input['creator_id'] = (!empty(session('administrator')->admin_id)) ? session('administrator')->admin_id : 0;
        $input['company_id'] = (!empty(session('administrator')->company_id)) ? session('administrator')->company_id: 0;
        $input['factory_id'] = (!empty(session('administrator')->factory_id)) ? session('administrator')->factory_id : 0;
        
        try {

            //开启事务
            DB::connection()->beginTransaction();
            //1、签转单添加
            //获取编辑数组
            $data=[
                'billdate'=>time(),
                'new_sale_order_code'=>$input['new_sale_order_code'],
                'new_po_number'=>$input['new_po_number'],
                'new_wo_number'=>$input['new_wo_number'],
                'creator'=>$input['creator_id'],
                'createtime'=>time(),
                'remark'=>$input['remark'],
            ];
            $insert_id = $this->save($data);
            if(!$insert_id) TEA('802');
            //2、签转明细添加
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
        $builder = DB::table($this->aliasTable['change'])
            ->select(
                'change.*',
                'user.id  as   creator_id',
                'user.name  as   creator_name',
                'user.id  as   auditor_id',
                'user.name  as   auditor_name'
                )
            ->leftJoin($this->aliasTable['user'], 'change.creator', '=', 'user.id')
            ->leftJoin($this->aliasTable['auditor'], 'change.auditor', '=', 'auditor.id')
            ->offset(($input['page_no'] - 1) * $input['page_size'])
            ->limit($input['page_size']);
        if (!empty($where)) $builder->where($where);
        //order  (多order的情形,需要多次调用orderBy方法即可)
        if (!empty($input['order']) && !empty($input['sort'])) $builder->orderBy('change.' . $input['sort'], $input['order']);
        $builder->orderBy('change.id','desc');
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
        $count_builder= DB::table($this->aliasTable['change'])
            ->leftJoin($this->aliasTable['user'], 'change.creator', '=', 'user.id')
            ->leftJoin($this->aliasTable['auditor'], 'change.auditor', '=', 'auditor.id');
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
        if (isset($input['new_sale_order_code']) && $input['new_sale_order_code']) {//根据销售订单
            $where[]=['change.new_sale_order_code','like','%'.$input['new_sale_order_code'].'%'];
        }
        if (isset($input['new_po_number']) && $input['new_po_number']) {//根据生产订单
            $where[]=['change.new_po_number','like','%'.$input['new_po_number'].'%'];
        }
        if (isset($input['new_wo_number']) && $input['new_wo_number']) {//根据工单
            $where[]=['change.new_wo_number','like','%'.$input['new_wo_number'].'%'];
        }
        if(isset($input['isaudit']) && $input['isaudit']==1) {//是否审核
            $where[]=['change.status','=',$input['isaudit']];
        }
        else
        {
            $where[]=['change.status','=',0];
        }
        return $where;
    }
    /**
     * 获取
     * @return array  返回数组对象集合
     */
    public function getOneOrder($id)
    {
        $builder = DB::table($this->aliasTable['change'])
            ->select(
                'change.*',
                'user.id  as   creator_id',
                'user.name  as   creator_name',
                'user.id  as   auditor_id',
                'user.name  as   auditor_name'
                )
            ->leftJoin($this->aliasTable['user'], 'change.creator', '=', 'user.id')
            ->leftJoin($this->aliasTable['auditor'], 'change.auditor', '=', 'auditor.id')
            ->where('change.id', $id);
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
     * @author liming
     */
    public function getItemsByOrder($id)
    {
        //获取列表
        $obj_list = DB::table($this->aliasTable['change_item'])
            ->select(
                'change_item.*',
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
                'unit.unit_text     as unit_text'
                )
            ->leftJoin($this->aliasTable['plant'], 'change_item.plant_id', '=', 'plant.id')
            ->leftJoin($this->aliasTable['depot'], 'change_item.depot_id', '=', 'depot.id')
            ->leftJoin($this->aliasTable['subarea'], 'change_item.subarea_id', '=', 'subarea.id')
            ->leftJoin($this->aliasTable['bin'], 'change_item.bin_id', '=', 'bin.id')
            ->leftJoin($this->aliasTable['ruis_material'], 'change_item.material_id', '=', 'ruis_material.id')
            ->leftJoin($this->aliasTable['unit'], 'change_item.unit_id', '=', 'unit.id')
            ->where('change_item.fk_id', $id)
            ->where('change_item.direct', '-1')
            ->orderBy('change_item.id', 'asc')->get();
        return $obj_list;
    }
    /**
     * 编辑签转单
     * @param $input array  input数组
     * @return int         返回插入表之后返回的主键值
     * @author liming
     */
    public function update($input)
    {
        //  判断单据是否审核
        $order_id   = $input['id'];
        $status = $this->getStatus($order_id);
        if ($status[0]->status  ==  1) TEA('8806');
        try {
            //开启事务
            DB::connection()->beginTransaction();
            //1、签转单添加
            //获取编辑数组
            $data=[
                'billdate'=>time(),
                'new_sale_order_code'=>$input['new_sale_order_code'],
                'new_po_number'=>$input['new_po_number'],
                'new_wo_number'=>$input['new_wo_number'],
                'creator'=>'',
                'createtime'=>time(),
                'remark'=>$input['remark'],
            ];
            $insert_id = $this->save($data,$order_id);
            if(!$insert_id) TEA('804');
            //2、签转明细添加
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
     * 批量审核签转单
     * @throws \Exception
     * @author    liming
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
     * 签转单审核
     * @param $input   array   input数组
     * @throws \Exception
     * @author    liming
     */
    public function audit($input)
    {
        $order_id   = $input['id'];
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
                    $res_data = $this->stgitem->merge_data($merge_data, 17, '1', 1);//签转入库
                    $res_data['ctime']=$dotime;
                    //保存明细数据
                    $this->stgitem->save($res_data);
                    $item_ = $this->stgitem->pk;
                    // 外键字段关联
                    $this->sitem->save(array('initem_id'=>$item_), $item_id);//入库

                }
                else if($direct=='-1')
                {
                    $res_data_out = $this->stgitem->merge_data($merge_data, 35, '-1', 1);//签转出库
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
     * 删除
     * @param $id
     * @throws \Exception
     * @author liming
     */
    public function destroy($id)
    {
        //判断 是否 审核
        $status = $this->getStatus($id);
        if ($status[0]->status  ==  1) TEA('8809');

        try{
            //开启事务
            DB::connection()->beginTransaction();

            //1、删除签转单之前先删除明细
            $res = DB::table($this->change_item_table)->where('fk_id','=',$id)->delete();

            //2、删除签转单
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