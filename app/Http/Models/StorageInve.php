<?php 
/**
 * 实时库存
 * 仓库核心model
 * User: liming
 * Date: 17/11/29
 */
namespace App\Http\Models;//定义命名空间
use Illuminate\Support\Facades\DB;//引入DB操作类
use App\Exceptions\ApiException;


class StorageInve extends Base
{
    
    public function __construct()
    {
        $this->table='ruis_storage_inve';
        $this->item_table='ruis_storage_item';
        $this->employee_table='ruis_employee';
        $this->plant_table='ruis_factory';
        $this->depot_table='ruis_storage_depot';
        $this->subarea_table='ruis_storage_subarea';
        $this->bin_table='ruis_storage_bin';
        $this->material_table='ruis_material';
        $this->unit_table='ruis_uom_unit';
        $this->partner_table='ruis_partner';

        $this->aliasTable=[
            'inve'=>$this->table.' as inve',
            'item'=>$this->item_table.' as item',
            'owner'=>$this->partner_table.' as owner',
            'employee'=>$this->employee_table.' as employee',
            'plant'=>$this->plant_table.' as plant',
            'depot'=>$this->depot_table.' as depot',
            'subarea'=>$this->subarea_table.' as subarea',
            'material'=>$this->material_table.' as material',
            'bin'=>$this->bin_table.' as bin',
            'unit'=>$this->unit_table.' as unit',
            'company'=>$this->partner_table.' as company',
        ];
    }

    /**
     * 根据条件查实时库存
     * @author xiafengjuan
     */
    public function getStorageInveList(&$input)
    {

         $where = $this->_search($input);

         $builder = DB::table($this->aliasTable['inve'])
                ->select('inve.id',
                    'unit.unit_text',
                    'inve.unit_id',
                    'inve.inve_age',
                    'inve.sale_order_code',
                    'inve.wo_number',
                    'inve.customcode',
                    'inve.lock_status',
                    'inve.po_number',
                    'material.name  as   material_name',
                    'material.id    as   material_id',
                    'material.item_no as material_item_no',
                    'inve.lot',
                    'plant.name   as   plant_name',
                    'inve.plant_id',
                    'depot.name   as   depot_name',
                    'inve.depot_id',
                    'subarea.name   as   subarea_name',
                    'inve.subarea_id',
                    'bin.name   as   bin_name',
                    'inve.bin_id',
                    'inve.quantity',
                    'owner.name  as   owner_name',
                    'inve.own_id  as   own_id')
                ->leftJoin($this->aliasTable['material'], 'inve.material_id', '=', 'material.id')
                ->leftJoin($this->aliasTable['depot'], 'inve.depot_id', '=', 'depot.id')
                ->leftJoin($this->aliasTable['plant'], 'inve.plant_id', '=', 'plant.id')
                ->leftJoin($this->aliasTable['unit'], 'inve.unit_id', '=', 'unit.id')
                ->leftJoin($this->aliasTable['subarea'], 'inve.subarea_id', '=', 'subarea.id')
                ->leftJoin($this->aliasTable['bin'], 'inve.bin_id', '=', 'bin.id')
                ->leftJoin($this->aliasTable['owner'], 'inve.own_id', '=', 'owner.id');
        if(array_key_exists('page_no',$input )|| array_key_exists('page_size',$input ))//判断传入的key是否存在
        {
             $builder->offset(($input['page_no']-1)*$input['page_size'])
            ->limit($input['page_size']);
            if (!empty($where)) $builder->where($where);
            //order  (多order的情形,需要多次调用orderBy方法即可)
            if (!empty($input['order']) || !empty($input['sort'])) $builder->orderBy('inve.' . $input['sort'], $input['order']);
            $builder->orderBy('inve.id','desc');
            //get获取接口
          $obj_list = $builder->get();
            foreach ($obj_list as   $key => $value)
            {
                $oldage  = $value->inve_age;
                $inve_  = $value->id;
                $quantity  = $value->quantity;
                $inveage   =  $this->inveage($inve_ ,$quantity);

                $diffage  = nf($inveage,4) - $oldage;

                if ($diffage > 0.5 ) {
                    $obj_list[$key]->inve_age  = nf($inveage,1);
                    $updata['inve_age'] = (float)$inveage;
                    // 保存
                    $this->save($updata, $inve_);
                } else{
                   $obj_list[$key]->inve_age  = nf($oldage,1);
                }
            }

        }else{
            if (!empty($where)) $builder->where($where);
            //order  (多order的情形,需要多次调用orderBy方法即可)
            if (!empty($input['order']) || !empty($input['sort'])) $builder->orderBy('inve.' . $input['sort'], $input['order']);
            $builder->orderBy('inve.id','desc');
            //get获取接口
            $obj_list = $builder->get();
        }

        //总共有多少条记录
        $count_builder= DB::table($this->aliasTable['inve'])
           ->leftJoin($this->aliasTable['material'], 'inve.material_id', '=', 'material.id')
                ->leftJoin($this->aliasTable['depot'], 'inve.depot_id', '=', 'depot.id')
                ->leftJoin($this->aliasTable['plant'], 'inve.plant_id', '=', 'plant.id')
                ->leftJoin($this->aliasTable['unit'], 'inve.unit_id', '=', 'unit.id')
                ->leftJoin($this->aliasTable['subarea'], 'inve.subarea_id', '=', 'subarea.id')
                ->leftJoin($this->aliasTable['bin'], 'inve.bin_id', '=', 'bin.id')
                ->leftJoin($this->aliasTable['owner'], 'inve.own_id', '=', 'owner.id');
        if (!empty($where)) $count_builder->where($where);
        $input['total_records']=$count_builder->count();
        $array_rtn = obj2array($obj_list);
        return $array_rtn;
    }

    /**
     * 保存数据
     */
    public function save($data, $id=0)
    {
        if ($id > 0)
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
            //添加
            $inve_id=DB::table($this->table)->insertGetId($data);
            if(!$inve_id) TEA('802');
            $this->pk = $inve_id;

        }

    }

    /**
     * 查看某条库存信息
     * @param $id
     * @return array
     * @author  liming 
     * @todo 
     */
    public function getitems($id)
    {
        $instorecategory_path=dirname(__FILE__).'/../../../caches/caches_data/storage_category_instore.cache.php';
        $outstorecategory_path=dirname(__FILE__).'/../../../caches/caches_data/storage_category_outstore.cache.php';
        $instorecategorys=include_once ($instorecategory_path);
        $outstorecategorys=include_once ($outstorecategory_path);
        $categorys = $instorecategorys + $outstorecategorys;

        $data = [
            'item.id',
            'item.direct        as   direct',
            'item.category_id   as   category_id',
            'item.customcode    as   customcode',
            'item.lock_status   as   lock_status',
            'item.lot           as   lot',
            'item.quantity      as   quantity',
            'plant.id           as   plant_id',
            'depot.id           as   depot_id',
            'subarea.id         as   subarea_id',
            'bin.id             as   bin_id',
            'plant.name         as   plant_name',
            'depot.name         as   depot_name',
            'subarea.name       as   subarea_name',
            'bin.name           as   bin_name',
            'item.material_id   as   material_id',
            'material.name      as   material_name',
            'item.company_id    as   company_id',
            'company.name       as   company_name',
            'company.abbreviation    as   company_abbreviation',
            'item.own_id        as   own_id',
            'owner.name         as   owner_name',
            'owner.abbreviation  as   owner_abbreviation',
            'item.remark'
        ];

        $obj = DB::table($this->aliasTable['item'])
            ->select($data)
            ->leftJoin($this->aliasTable['plant'], 'item.plant_id', '=', 'plant.id')
            ->leftJoin($this->aliasTable['company'], 'item.company_id', '=', 'company.id')
            ->leftJoin($this->aliasTable['depot'], 'item.depot_id', '=', 'depot.id')
            ->leftJoin($this->aliasTable['subarea'], 'item.subarea_id', '=', 'subarea.id')
            ->leftJoin($this->aliasTable['bin'], 'item.bin_id', '=', 'bin.id')
            ->leftJoin($this->aliasTable['material'], 'item.material_id', '=', 'material.id')
            ->leftJoin($this->aliasTable['owner'], 'item.own_id', '=', 'owner.id')
            ->where("item.inve_id",'=',$id)
            ->get();
        if (!$obj) TEA('404');
        foreach ($obj as $key => $val)
        {
          $val->category = $categorys[$val->category_id];
        }
        return $obj;
    }


    /**
     * 查看某条库存信息
     * @param $id
     * @return array
     * @author  liming 
     * @todo 
     */
    public function get($id)
    {
        $data = [
                'inve.id',
                'inve.order_id',
                'plant.id           as   plant_id',
                'depot.id           as   depot_id',
                'subarea.id         as   subarea_id',
                'bin.id             as   bin_id',
                'plant.name         as   plant_name',
                'depot.name         as   depot_name',
                'subarea.name       as   subarea_name',
                'bin.name           as   bin_name',
                'inve.material_id   as   material_id',
                'material.name      as   material_name',
                'inve.company_id    as   company_id',
                'company.name       as   company_name',
                'company.abbreviation    as   company_abbreviation',
                'inve.own_id        as   own_id',
                'owner.name         as   owner_name',
                'owner.abbreviation  as   owner_abbreviation',
                'inve.lock_status   as   lock_status',
                'inve.lot           as   lot',
                'inve.inqty         as   inqty',
                'inve.outqty        as   outqty',
                'inve.quantity      as   quantity',
                'inve.price         as   price',
                'inve.amount        as   amount',
                'inve.sale_order_code      as   sale_order_code',
                'inve.po_number            as   po_number',
                'inve.in_today_volume      as    in_today_volume',
                'inve.in_today_quantity    as    in_today_quantity',
                'inve.out_today_volume     as    out_today_volume',
                'inve.out_today_quantity   as    out_today_quantity',
                'inve.in_before_volume     as    in_before_volume',
                'inve.in_before_quantity   as    in_before_quantity',
                'inve.out_before_volume    as    out_before_volume',
                'inve.out_before_quantity  as    out_before_quantity',
                'inve.before_volume        as    before_volume',
                'inve.before_quantity      as    before_quantity',
                'inve.unit_id              as    unit_id',
                'inve.wo_number            as    wo_number',
                'inve.po_number            as    po_number',
                'inve.remark'

        ];
        $obj = DB::table($this->aliasTable['inve'])
            ->select($data)
            ->leftJoin($this->aliasTable['plant'], 'inve.plant_id', '=', 'plant.id')
            ->leftJoin($this->aliasTable['company'], 'inve.company_id', '=', 'company.id')
            ->leftJoin($this->aliasTable['depot'], 'inve.depot_id', '=', 'depot.id')
            ->leftJoin($this->aliasTable['subarea'], 'inve.subarea_id', '=', 'subarea.id')
            ->leftJoin($this->aliasTable['bin'], 'inve.bin_id', '=', 'bin.id')
            ->leftJoin($this->aliasTable['material'], 'inve.material_id', '=', 'material.id')
            ->leftJoin($this->aliasTable['owner'], 'inve.own_id', '=', 'owner.id')
            ->where("inve.$this->primaryKey",'=',$id)
            ->first();

        if (!$obj) TEA('404');
        return $obj;
    }



    /**
     * 获取抽取合并数据
     * @param array $data
     *  待抽取的数组
     */
    public function merge_data($data)
    {

        $keys = array(
            'customcode',
            'indent_id',
            'plant_id',
            'depot_id',
            'subarea_id',
            'bin_id',
            'order_id',
            'material_id',
            'company_id',
            'unit_id',
            'lot',
            'volume',
            'quantity',
            'uuid',
            'storage_billdate',                 
            'po_number',            //生产单号
            'wo_number',            //工单号
            'sale_order_code',      //销售订单号
            'send_depot',           //发料地点编号
            'remark'
        );

        $item = array();
        foreach ($keys as $key)
        {
            if (isset($data[$key]))
            {
                $item[$key] = $data[$key];
            }
        }
        return $item;
    }


    /**
     * 仓库产品出库, 没有码单
     * @param int $id   主键id
     * @param array $odata  出库数据
     * @return boolean
     */
    public function outstore($id, $odata)
    {
        $gdata =obj2array($this->getRecordById($id));

        if (empty($gdata)) TEA('8601');

        // 产品已经出库
        if (nf($gdata['quantity'], 4) == 0)  TEA('8602',json_encode($gdata));

        $quantity = nf($odata['quantity'], 4);
  
        // 判断库存中数量是否足够
        if (nf($gdata['storage_validate_quantity'], 0) < nf($quantity, 0)) TEA('8603');
        $quantity = nf($gdata['quantity'], 0) == nf($quantity, 0) ? $gdata['quantity'] : $quantity;

        $udata['quantity'] = $gdata['quantity'] - $quantity;
        $udata['storage_validate_quantity'] = $gdata['storage_validate_quantity'] - $quantity;
        $udata['amount'] = $udata['quantity']  * $gdata['price'] ;
        $this->save($udata, $id);
    }


    /**
     * 搜索
     */
    private function _search($input)
    {

        $where = array();
        if (isset($input['material_name']) && $input['material_name']) {//根据入库的物料查找
            $where[]=['material.name','like','%'.$input['material_name'].'%'];
        }
        if (isset($input['partner']) && $input['partner']) {//根据所属公司查找
            $where[]=['partner.name','like','%'.$input['partner'].'%'];
        }
        if (isset($input['material_item_no']) && $input['material_item_no']) {//根据物料编码查找
            $where[]=['material.item_no','like','%'.$input['material_item_no'].'%'];
        }
        if (isset($input['plant_name']) && $input['plant_name']) {//根据厂区查找
            $where[]=['plant.name','like','%'.$input['plant_name'].'%'];
        }

        if (isset($input['depot_id']) && $input['depot_id']) {//根据厂区查找
            $where[]=['depot.id','=',$input['depot_id']];
        }

        if (isset($input['po_number']) && $input['po_number']) {//根据生产订单
            $where[]=['inve.po_number','=',$input['po_number']];
        }

        if (isset($input['wo_number']) && $input['wo_number']) {//根据wo
            $where[]=['inve.wo_number','=',$input['wo_number']];
        }

        if (isset($input['sale_order_code']) && $input['sale_order_code']) {//根据销售订单
            $where[]=['inve.sale_order_code','=',$input['sale_order_code']];
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

        $where[]=['inve.quantity','>',0];
        return $where;
    }


    // 计算实时库存
    public function updateRelation($var, $iscost = true)
    {
        if(empty($var) || !is_numeric($var)) TEA('703');


        if(empty($this->sitem)) $this->sitem =new StorageItem();
        $gdata = $this->getRecordById($var);

        if($gdata=='')
        {
            TEA('8604');
        }
        $id = $var;

        $time = date('Y-m-d');
        $start_time = strtotime($time.' 00:00:00');
        $end_time   = strtotime($time.' 23:59:59');

        // 今日入库数
        $today_in= DB::table($this->aliasTable['item'])
                    ->where('direct', '=', '1')
                    ->where('inve_id', '=', $id)
                    ->where('ctime', '>=', $start_time)
                    ->where('ctime', '<=', $end_time)
                    ->sum('quantity');
        $in_today_quantity  = $today_in;


        // 今日出库
        $today_out= DB::table($this->aliasTable['item'])
                    ->where('direct', '=', '-1')
                    ->where('inve_id', '=', $id)
                    ->where('ctime', '>=', $start_time)
                    ->where('ctime', '<=', $end_time)
                    ->sum('quantity');
        $out_today_quantity = $today_out;


        // 今日之前入库
        $before_in= DB::table($this->aliasTable['item'])
                    ->where('direct', '=', '1')
                    ->where('inve_id', '=', $id)
                    ->where('ctime', '<', $start_time)
                    ->sum('quantity');
        $in_before_quantity =$before_in;


        // 今日之前出库
        $before_out= DB::table($this->aliasTable['item'])
                    ->where('direct', '=', '-1')
                    ->where('inve_id', '=', $id)
                    ->where('ctime', '<', $start_time)
                    ->sum('quantity');
        $out_before_quantity = $before_out;

        // lock_quantity  带锁入库数量
        $locks_in= DB::table($this->aliasTable['item'])
                    ->where('direct', '=', '1')
                    ->where('inve_id', '=', $id)
                    ->where('lock_status', '=', 1)
                    ->sum('quantity');
        $locks_in_quantity =$locks_in;

        // lock_quantity  带锁出库数量
        $locks_out= DB::table($this->aliasTable['item'])
                    ->where('direct', '=', '-1')
                    ->where('inve_id', '=', $id)
                    ->where('lock_status', '=', 1)
                    ->sum('quantity');
        $locks_out_quantity =$locks_out;

        $data['in_today_quantity']   = (float)$in_today_quantity;
        $data['out_today_quantity']  = (float)$out_today_quantity;
        $data['in_before_quantity']  = (float)$in_before_quantity;
        $data['out_before_quantity'] = (float)$out_before_quantity;
        $data['before_quantity']     = $data['in_before_quantity'] - $data['out_before_quantity'];
        $data['quantity']            = $data['in_today_quantity'] + $data['in_before_quantity'] - $data['out_today_quantity'] -$data['out_before_quantity'];
        $data['lock_quantity']                = $locks_in_quantity -  $locks_out_quantity ;
        $data['storage_validate_quantity']    =  $data['quantity']  -   $data['lock_quantity'] ;

        //  计算库龄(理论值)
        //  1.  获取当前的 实时库存   
        //  2.  查找入库明细  推算入库单
        //  3.  计算库龄
        $now_qunatity  = $data['quantity'] ;

        // 判断实时数量 与出入库明细是否   相符
        $allin= DB::table($this->aliasTable['item'])
            ->where('direct', '=', '1')
            ->where('inve_id', '=', $id)
            ->sum('quantity');

        $contrast_result=bccomp($allin, $now_qunatity);
        if ($contrast_result == -1) 
        {
            TEA('8605','id');
        }

       if($now_qunatity>0)
       {
           $i   = 1;
           do {
               $now_lists = DB::table($this->aliasTable['item'])
                 ->select('ctime','quantity','id')
                 ->where('direct', '=', 1)
                 ->where('inve_id', '=', $id)
                 ->orderby('id','desc')
                 ->limit($i)
                 ->get();

                 $sum_quantity  = 0;
                 $length = count($now_lists);
                if($length==0)
                {
                    TEA('8606','id');
                }
               $last_quantity  = $now_lists[$length-1]->quantity;
                 foreach ($now_lists as  $list) {
                   $sum_quantity =  $sum_quantity + $list->quantity;
                 }
                 $i ++;
                 if ($i>1000) 
                 {
                    TEA('8607');
                 }
                 $final_result=bccomp($sum_quantity, $now_qunatity);
           } while ($final_result == -1);
           //while ($sum_quantity <  $now_qunatity);  原来的  精度计算有问题
           //后的最后一条记录的有效库存
           $valid_quantity =  $now_qunatity  -  $sum_quantity  + $last_quantity;
           // 计算库龄  公式：   每一条有效入库的     入库时间  *  （入库数量/实时库存）  的累加

           // 拼凑我们的完整数据  并 计算
           $now_lists[$length-1]->quantity  = $valid_quantity;
           $inveage  =0;
           foreach ($now_lists as  $value)
           {
               // 距离今天有多少天
                $days  = diff_between_twodays($value->ctime,time());
               // 占比
                $ratio   =  $value->quantity  /  $now_qunatity;
                //  库龄
                $inveage    += $days * $ratio ;
           }
           $data['inve_age'] = (float)$inveage;
       }
       else
       {
           $data['inve_age'] = 0;
       }
       // 保存
       $this->save($data, $id);
    }



    // 获取库龄 （公用）
    public  function   inveage($inve_, $quantity)
    {
        $now_qunatity  = $quantity;
        // 判断实时数量 与出入库明细是否   相符
        $allin= DB::table($this->aliasTable['item'])
            ->where('direct', '=', '1')
            ->where('inve_id', '=', $inve_)
            ->sum('quantity');
         if ($allin <  $now_qunatity) TEA('8605','id');
        

    if($now_qunatity>0) {

        $i = 1;
        do {
            $now_lists = DB::table($this->aliasTable['item'])
                ->select('ctime', 'quantity', 'id')
                ->where('direct', '=', 1)
                ->where('inve_id', '=', $inve_)
                ->orderby('id', 'desc')
                ->limit($i)
                ->get();

            $sum_quantity = 0;
            $length = count($now_lists);
            $last_quantity = $now_lists[$length - 1]->quantity;
            foreach ($now_lists as $list) {
                $sum_quantity = $sum_quantity + $list->quantity;
            }
            $i++;
            if ($i>1000) 
            {
                TEA('8607');
            }
            $final_result=bccomp($sum_quantity, $now_qunatity);
        } while ($final_result == -1);
        // while ($sum_quantity < $now_qunatity);  原来的精度计算有问题
        //后的最后一条记录的有效库存
        $valid_quantity = $now_qunatity - $sum_quantity + $last_quantity;
        // 计算库龄  公式：   每一条有效入库的     入库时间  *  （入库数量/实时库存）  的累加

        // 拼凑我们的完整数据  并 计算
        $now_lists[$length - 1]->quantity = $valid_quantity;
        $inveage = 0;
        foreach ($now_lists as $value) {
            // 距离今天有多少天
            $days = diff_between_twodays($value->ctime, time());
            // 占比
            $ratio = $value->quantity / $now_qunatity;
            //  库龄
            $inveage += $days * $ratio;
        }
        return $inveage;
    }
    else
    {
        return 0;
    }
    }
}