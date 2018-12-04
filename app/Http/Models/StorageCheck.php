<?php 
/**
 * 库存盘点
 * User: xiafengjuan
 * Date: 17/12/05
 */
namespace App\Http\Models;//定义命名空间
use Illuminate\Support\Facades\DB;//引入DB操作类
use App\Exceptions\ApiException;


class StorageCheck extends Base
{
    
    public function __construct()
    {
        $this->table='ruis_storage_check';
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
            'storage_check'=>$this->table.' as storage_check',
            'inve'=>$this->inve_table.' as inve',
            'item'=>$this->item_table.' as item',
            'partner'=>$this->partner.' as partner',
            'user'=>$this->uTable.' as user',
            'plant'=>$this->plant_table.' as plant',
            'depot'=>$this->depot_table.' as depot',
            'subarea'=>$this->subarea_table.' as subarea',
            'ruis_material'=>$this->material_table.' as ruis_material',
            'bin'=>$this->bin_table.' as bin',
            'unit'=>$this->unit_table.' as unit',
        ];
        if(empty($this->sitem)) $this->sitem =new StorageItem();
        if(empty($this->sinve)) $this->sinve =new StorageInve();
    }




    /**
     * 保存明细数据
     */
    public function saveCheck($inputs, $id)
    {
        $input['creator_id'] = (!empty(session('administrator')->admin_id)) ? session('administrator')->admin_id : 0;
        $creator_id=$input['creator_id'];
        $input['company_id'] = (!empty(session('administrator')->company_id)) ? session('administrator')->company_id: 0;
        $company_id=$input['company_id'];
        $input['factory_id'] = (!empty(session('administrator')->factory_id)) ? session('administrator')->factory_id : 0;
        $factory_id=$input['factory_id'];
        foreach ($inputs  as  $key=>$input)
        {
            $list = $this->getLists([['inve_id','=',$input['0']],['status','=','0']], 'id');
           if(count($list)>0)
           {
               TEA('8008');
           }
            if($input['14']>$input['13'])
            {
                $sjkc=$input['14'];
                $sign='盘盈';
                $bqty=$input['14']-$input['13'];
            }
            else if($input['14']==''||$input['14']==$input['13'])
            {
                $sjkc=$input['13'];
                $sign='相同';
                $bqty=0;
            }
            else if($input['14']<$input['13'])
            {
                $sjkc=$input['14'];
                $sign='盘亏';
                $bqty=abs($input['14']-$input['13']);
            }
            $check_data=[
                'inve_id'=>$input['0'],
                'haspack'=>0,
                'code'=>'',//盘点单号自动生成
                'customcode'=>$input['5'],
                'barcode'=>'',//条码
                'lock_status'=>$input['6'],
                'depot_id'=>$input['10'],
                'material_id'=>$this->getFieldValueByWhere([['item_no','=',$input[2]]], 'id','ruis_material'),//根据物料编码获取物料id
                'grade'=>'',
                'reel'=>'',
                'lot'=>$input['7'],
                'unit_id'=>$input['4'],
                'oquantity'=>$input['13'],//盘点前
                'nquantity'=>$sjkc,//盘点后
                'bquantity'=>$bqty,//差异
                'sign'=>$sign,//盘点类型
                'creator'=>$creator_id,
                'createtime'=>time(),
                'remark'=>'',
            ];

            $id  =  $id? $id : 0;
            $this->save($check_data,$id);
        }

    }
    /**
     * 添加或编辑盘点数据
     * @author xiafengjuan
     */
    public function save($data,$id)
    {
        if($id > 0)//编辑
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
            $this->pk = $id;
        }
        else
        {
            //入库
            $insert_id=DB::table($this->table)->insertGetId($data);
            if(!$insert_id) TEA('802');
            $this->pk = $insert_id;
        }
    }

    /**
     * 盘点单列表
     * @throws \Exception
     * @author    xiafengjuan
     */
    public function getCheckLists(&$input)
    {
        if (isset($input['material_name']) && $input['material_name']) {//根据入库的物料查找
            $where[]=['ruis_material.name','like','%'.$input['material_name'].'%'];
        }
        if (isset($input['material_item_no']) && $input['material_item_no']) {//根据入库的物料编码查找
            $where[]=['ruis_material.item_no','like','%'.$input['material_item_no'].'%'];
        }
        if (isset($input['isaudit']) && $input['isaudit']) {//已审核
            $where[]=['storage_check.status','=',$input['isaudit']];
        }
        else
        {
            $where[]=['storage_check.status','=',0];//未审核
        }

        $builder = DB::table($this->aliasTable['storage_check'])
            ->select('storage_check.id as check_id',
                'storage_check.customcode as customcode',
                'depot.name as depot_name',
                'ruis_material.name as material_name',
                'ruis_material.item_no as material_item',
                'unit.unit_text as unit_text',
                'storage_check.oquantity',
                'storage_check.nquantity',
                'storage_check.bquantity',
                'storage_check.sign',
                'user.name as user_name',
                'storage_check.createtime',
                'storage_check.remark',
                'storage_check.lock_status',
                'storage_check.status')
            ->leftJoin($this->aliasTable['ruis_material'], 'storage_check.material_id', '=', 'ruis_material.id')
            ->leftJoin($this->aliasTable['user'], 'user.id', '=', 'storage_check.creator')
            ->leftJoin($this->aliasTable['depot'], 'depot.id', '=', 'storage_check.depot_id')
            ->leftJoin($this->aliasTable['unit'], 'unit.id', '=', 'storage_check.unit_id')
            ->offset(($input['page_no']-1)*$input['page_size'])
            ->limit($input['page_size']);

        if (!empty($where)) $builder->where($where);
        //order  (多order的情形,需要多次调用orderBy方法即可)
        if (!empty($input['order']) && !empty($input['sort'])) $builder->orderBy('storage_check.' . $input['sort'], $input['order']);
        $builder->orderBy('storage_check.id','desc');
        //get获取接口
        $obj_list = $builder->get();

        //遍历格式化数据
        foreach($obj_list as $key=>&$value){
            $value->createtime=date('Y-m-d H:i:s',$value->createtime);
        }
        //总共有多少条记录
        $count_builder= DB::table($this->aliasTable['storage_check'])
            ->leftJoin($this->aliasTable['ruis_material'], 'storage_check.material_id', '=', 'ruis_material.id')
            ->leftJoin($this->aliasTable['user'], 'user.id', '=', 'storage_check.creator')
            ->leftJoin($this->aliasTable['depot'], 'depot.id', '=', 'storage_check.depot_id')
            ->leftJoin($this->aliasTable['unit'], 'unit.id', '=', 'storage_check.unit_id');
        if (!empty($where)) $count_builder->where($where);
        $input['total_records']=$count_builder->count();
        return $obj_list;
    }

    /**
     * 盘点单显示
     * @throws \Exception
     * @author    xiafengjuan
     */
    public function getCheck($input)
    {
        if (isset($input['id']) && $input['id']) {
            $where[]=['storage_check.id','=',$input['id']];
        }
        else
        {
            TEA('703','id');
        }

        $builder = DB::table($this->aliasTable['storage_check'])
            ->select('storage_check.id as check_id',
                'storage_check.customcode as customcode',
                'depot.name as depot_name',
                'ruis_material.name as material_name',
                'ruis_material.item_no as material_item',
                'unit.unit_text as unit_text',
                'storage_check.oquantity',
                'storage_check.nquantity',
                'storage_check.bquantity',
                'storage_check.sign',
                'user.name as user_name',
                'storage_check.createtime',
                'storage_check.remark',
                'storage_check.lock_status',
                'storage_check.status')
            ->leftJoin($this->aliasTable['ruis_material'], 'storage_check.material_id', '=', 'ruis_material.id')
            ->leftJoin($this->aliasTable['user'], 'user.id', '=', 'storage_check.creator')
            ->leftJoin($this->aliasTable['depot'], 'depot.id', '=', 'storage_check.depot_id')
            ->leftJoin($this->aliasTable['unit'], 'unit.id', '=', 'storage_check.unit_id');

        if (!empty($where)) $builder->where($where);
        //get获取接口
        $obj_list = $builder->get();
        //4.遍历格式化数据
        foreach($obj_list as $key=>&$value){
            $value->createtime=date('Y-m-d H:i:s',$value->createtime);
        }
        return $obj_list;
    }

    /**
     * 修改盘点单
     * @throws \Exception
     * @author    xiafengjuan
     */
    public function editcheck($input)
    {
        $order_id   = $input['id'];//获取盘点单ID
        $id = $this->getFieldValueByWhere([['id','=',$order_id]], 'id','ruis_storage_check');//判断id是否存在
        if($id=='')
        {
            TEA('703','id');
        }
        //判断 是否 审核
        $status = $this->getStatus($order_id);
        if ($status[0]->status  ==  1) TEA('8708');
        $list = $this->getLists([['id','=',$order_id],['status','=','0']], 'oquantity');
        if($input['real_quantity']>$list[0])
        {
            $sjkc=$input['real_quantity'];
            $sign='盘盈';
            $bqty=$input['real_quantity']-$list[0];
        }
        else if($input['real_quantity']==''||$input['real_quantity']==$list[0])
        {
            $sjkc=$list[0];
            $sign='相同';
            $bqty=0;
        }
        else if($input['real_quantity']<$list[0])
        {
            $sjkc=$input['real_quantity'];
            $sign='盘亏';
            $bqty=$input['real_quantity']-$list[0];
        }
        //获取编辑数组
        $data=[
            'nquantity'=>$input['real_quantity'],
            'nquantity'=>$sjkc,//盘点后
            'bquantity'=>$bqty,//差异
            'sign'=>$sign,//盘点类型
            'createtime'=>time(),
        ];
        try{
            //开启事务
            DB::connection()->beginTransaction();
            //修改盘点单实际库存
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
     * 批量盘点单审核
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
     * 盘点单审核
     * @throws \Exception
     * @author    xiafengjuan
     */
    public function audit($input)
    {
        $order_id   = $input['id'];//获取盘点单ID
        $id = $this->getFieldValueByWhere([['id','=',$order_id]], 'id','ruis_storage_check');//判断id是否存在
        if($id=='')
        {
            TEA('703','id');
        }
        //判断 是否 审核
        $status = $this->getStatus($order_id);
        if ($status[0]->status  ==  1) TEA('8805');

        //获取编辑数组
        $data=[
            'status'=>1,
            'audittime'=>time(),
        ];
        try{
            //开启事务
            DB::connection()->beginTransaction();
            //改变状态
            $upd=DB::table($this->table)->where('id',$input['id'])->update($data);
            if($upd===false) TEA('804');

            $list = $this->getRecordById($order_id);//得到盘点表数据
            $merge_data  = obj2array($list);
            $this->sinve->updateRelation($merge_data['inve_id']);//计算实时库存，保证获取最新库龄
            $inve_list = $this->sinve->getRecordById($merge_data['inve_id']);//实时库存id
            $inve_data= obj2array($inve_list);
            $inve_age=$inve_data['inve_age']*86400;//实时库龄
            $dotime= time()-$inve_age;//实际入库时间
            if($merge_data['sign']=='盘盈')
            {
                $merge_data['material_id']=$inve_data['material_id'];
                $merge_data['plant_id'] = $inve_data['plant_id'];
                $merge_data['subarea_id']    = $inve_data['subarea_id'];
                $merge_data['bin_id']    = $inve_data['bin_id'];
                $merge_data['inve_id']    = $inve_data['id'];
                $merge_data['own_id']    = $inve_data['own_id'];
                $merge_data['quantity']    = $merge_data['bquantity'];
                $res_data = $this->sitem->merge_data($merge_data, 12, 1, 1);
                $res_data['ctime']=$dotime;
                //保存明细数据
                $this->sitem->save($res_data);
                $item_ = $this->sitem->pk;
                // 外键字段关联
                $this->save(array('item_id'=>$item_), $order_id);
                // 处理出入库明细, 是否入库还是出库
                $this->sitem->passageway($item_);
            }
            else if ($merge_data['sign']=='盘亏')
            {
                $merge_data['material_id']=$inve_data['material_id'];
                $merge_data['plant_id'] = $inve_data['plant_id'];
                $merge_data['subarea_id']    = $inve_data['subarea_id'];
                $merge_data['bin_id']    = $inve_data['bin_id'];
                $merge_data['inve_id']    = $inve_data['id'];
                $merge_data['own_id']    = $inve_data['own_id'];
                $merge_data['quantity']    = $merge_data['bquantity'];
                $res_data = $this->sitem->merge_data($merge_data, 31, '-1', 1);
                $res_data['ctime']=$dotime;
                //保存明细数据
                $this->sitem->save($res_data);
                $item_ = $this->sitem->pk;

                // 外键字段关联
                $this->save(array('item_id'=>$item_), $order_id);
                // 处理出入库明细, 是否入库还是出库
                $this->sitem->passageway($item_);
            }
            else if ($merge_data['sign']=='相等')
            {

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
     * 盘点单反审核
     * @throws \Exception
     * @author    xiafengjuan
     */
    public function noaudit($input)
    {
        $order_id   = $input['id'];//获取盘点单ID
        $id = $this->getFieldValueByWhere([['id','=',$order_id]], 'id','ruis_storage_check');//判断id是否存在
        if($id=='')
        {
            TEA('703','id');
        }
        $list = $this->getListsByWhere([['id','=',$input['id']]], 'item_id');
        $item_id=$list[0]->item_id;
        //判断 是否 审核
        $status = $this->getStatus($order_id);
        if ($status[0]->status  ==  0) TEA('8705');

        //获取编辑数组
        $data=[
            'status'=>0,
            'audittime'=>0,
            'item_id'=>'',
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



        return $order_id;
    }

}