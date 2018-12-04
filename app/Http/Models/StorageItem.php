<?php 
/**
 * 库存出入库明细
 * 仓库核心model
 * User: liming
 * Date: 17/11/3
 */
namespace App\Http\Models;//定义命名空间
use Illuminate\Support\Facades\DB;//引入DB操作类
use App\Exceptions\ApiException;


class StorageItem extends Base
{
    
    public function __construct()
    {
        $this->table='ruis_storage_item';
        $this->employee_table='ruis_employee';
        $this->plant_table='ruis_factory';
        $this->depot_table='ruis_storage_depot';
        $this->subarea_table='ruis_storage_subarea';
        $this->bin_table='ruis_storage_bin';
        $this->material_table='ruis_material';
        $this->unit_table='ruis_uom_unit';
        $this->partner_table='ruis_partner';
        //定义表别名
        $this->aliasTable=[
            'item'=>$this->table.' as item',
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

        if(empty($this->sinve)) $this->sinve =new StorageInve();

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
            $item_id=DB::table($this->table)->insertGetId($data);
            if(!$item_id) TEA('802');
            $this->pk = $item_id;
        }
    }


    /**
     * 删除记录
     * @param string|array $var
     */
    public function del($var)
    {
        //id判断
        if(empty($var) || !is_numeric($var)) TEA('703','id');
        $id   =  $var;
        $list = $this->getListsByWhere([['id','=',$id]]);
        $this->destroyByWhere([['id','=',$id]]);
        foreach ($list as $value)
        {
          $this->sinve->updateRelation($value->inve_id, TRUE);
        }

    }



    /**
     * 获取抽取合并数据
     * @param array $data
     *          待抽取的数组
     * @param int|string $category
     *          出入库分类
     * @param string $direct
     *          方向: 入库(1)还是出库(-1)
     * @param int $status
     *          状态: 1 或者 0
     */
    public function merge_data($gdata, $category, $direct, $status = 1)
    {
        $keys = array(
            'plant_id',
            'depot_id',
            'subarea_id',
            'bin_id',
            'inve_id',
            'lock_status',          //锁状态
            'own_id',               //所属公司
            'indent_id',            //订单ID
            'customcode',           //订单编号
            'po_number',            //生产单号
            'sale_order_code',      //销售订单号
            'wo_number',            //工单
            'company_id',
            'employee_id',
            'material_id',
            'spare_id',              //备件
            'send_depot',            //发货地点编号
            'quantity',
            'unit_id',
            'lot',      
            'convert',              
            'kilo',
            'uuid',
            'remark'
        );

        $data = array();
        foreach ($keys as $key)
        {
            if (isset($gdata[$key]))
            {
                $data[$key] = $gdata[$key];
            }
        }

        if(empty($data['indent_']))
        {
            unset($data['indent_']);
        }

        if(empty($data['lot']))
        {
            unset($data['lot']);
        }

        $data['category_id'] = $category;
        $data['direct']    = $direct;
        $data['status']    = $status;
        $data['ctime']     = time();
        return $data;
    }


    /**
     * 产品与库存的通道函数
     * @param numeric $id 出入库明细id
     */
    public function passageway($id)
    {
        if(empty($id))
            TEA('8502');
        $gdata =obj2array($this->getRecordById($id));
        switch ($gdata['direct'])
        {
            case '1':
                $this->_instore($gdata);
                break;
            case '-1':
                $this->_outstore($gdata);
                break;
            default:
                TEA('8501');
                break;
        }
    }

    /**
     * 入库
     * @param array $gdata
     */
    private function _instore($gdata)
    {
        $id = $gdata['id'];
        $idata = $this->sinve->merge_data($gdata);
        $condition= [
                      ['depot_id','=',$idata['depot_id']],
                      ['subarea_id','=',$idata['subarea_id']],
                      ['bin_id','=',$idata['bin_id']],
                      ['company_id','=',$idata['company_id']],
                      ['material_id','=',$idata['material_id']],
                      ['lot','=',$idata['lot']],
                    ];
        if (array_key_exists("po_number",$idata)){
            $condition[] =  ['po_number','=',$idata['po_number']];
        }

        if (array_key_exists("wo_number",$idata)){
            $condition[] =  ['wo_number','=',$idata['wo_number']];
        }

        if (array_key_exists("sale_order_code",$idata)){
            $condition[] =  ['sale_order_code','=',$idata['sale_order_code']];
        }

        if (array_key_exists("indent_id",$idata)){
            $condition[] =  ['indent_id','=',$idata['indent_id']];
        }

        if (array_key_exists("send_depot",$idata)){
            $condition[] =  ['send_depot','=',$idata['send_depot']];
        }

        $inve_ = $this->sinve->getFieldValueByWhere($condition, 'id');
        try{
            //开启事务
            DB::connection()->beginTransaction();
            // 合并
            if (empty($inve_))
            {
                $this->sinve->save($idata);
                $inve_ = $this->sinve->pk;
            }

            //获取编辑数组
            $data=['inve_id'=>$inve_];
            $this->save($data, $id);
        }catch(\ApiException $e){
            //回滚
            DB::connection()->rollBack();
            TEA($e->getCode());
        }
        //提交事务
        DB::connection()->commit();
        $this->sinve->updateRelation($inve_, TRUE);
    }


    /**
     * 出库
     * @param array $gdata
     */
    private function _outstore($gdata)
    {
        $inve_id = $gdata['inve_id'];
        $this->sinve->outstore($inve_id, $gdata);
        $this->sinve->updateRelation($inve_id, FALSE);
        return $inve_id;
    }




    /**
     * 根据条件查询出入库
     * @author liming
     */
    public function getItemList($input , $direct)
    {
        if (!array_key_exists('page_no',$input ) && !array_key_exists('page_size',$input )) TEA('8512','page');
        //order  (多order的情形,需要多次调用orderBy方法即可)
        if (empty($input['order']) || empty($input['sort']))
        {
            $input['order']='desc';$input['sort']='id';
        }
        $where = $this->_search($input);

        $instorecategory_path=dirname(__FILE__).'/../../../caches/caches_data/storage_category_instore.cache.php';
        $outstorecategory_path=dirname(__FILE__).'/../../../caches/caches_data/storage_category_outstore.cache.php';
        $instorecategorys=include_once ($instorecategory_path);
        $outstorecategorys=include_once ($outstorecategory_path);
        $categorys = $instorecategorys + $outstorecategorys;

        $data = [
            'item.id as id',
            'item.direct        as   direct',
            'item.ctime         as   ctime',
            'item.category_id   as   category_id',
            'item.customcode    as   customcode',
            'item.lock_status   as   lock_status',
            'item.lot           as   lot',
            'item.quantity      as   quantity',
            'item.po_number     as   po_number',
            'item.wo_number     as   wo_number',
            'item.sale_order_code     as   sale_order_code',
            'plant.id           as   plant_id',
            'depot.id           as   depot_id',
            'subarea.id         as   subarea_id',
            'bin.id             as   bin_id',
            'plant.name         as   plant_name',
            'depot.name         as   depot_name',
            'subarea.name       as   subarea_name',
            'bin.name           as   bin_name',
            'unit.id            as   unit_id',
            'unit.name          as   unit_name',
            'unit.unit_text     as   unit_text',
            'item.material_id   as   material_id',
            'material.name      as   material_name',
            'material.item_no   as   item_no',
            'item.company_id    as   company_id',
            'company.name       as   company_name',
            'company.abbreviation    as   company_abbreviation',
            'item.own_id        as   own_id',
            'owner.name         as   owner_name',
            'owner.abbreviation  as  owner_abbreviation',
            'item.remark'
        ];

        $obj_list = DB::table($this->aliasTable['item'])
            ->select($data)
            ->leftJoin($this->aliasTable['plant'], 'item.plant_id', '=', 'plant.id')
            ->leftJoin($this->aliasTable['company'], 'item.company_id', '=', 'company.id')
            ->leftJoin($this->aliasTable['depot'], 'item.depot_id', '=', 'depot.id')
            ->leftJoin($this->aliasTable['subarea'], 'item.subarea_id', '=', 'subarea.id')
            ->leftJoin($this->aliasTable['bin'], 'item.bin_id', '=', 'bin.id')
            ->leftJoin($this->aliasTable['material'], 'item.material_id', '=', 'material.id')
            ->leftJoin($this->aliasTable['owner'], 'item.own_id', '=', 'owner.id')
            ->leftJoin($this->aliasTable['unit'], 'item.unit_id', '=', 'unit.id')
            ->where("item.direct",'=',$direct)
            ->where($where)
            ->offset(($input['page_no'] - 1) * $input['page_size'])
            ->limit($input['page_size'])
            ->orderBy($input['sort'],$input['order'])
            ->get();
        foreach ($obj_list as $obj)
        {
            $obj->createdate  = date("Y-m-d H:i:s",$obj->ctime);
            $obj->category    = $categorys[$obj->category_id]; 
        }

         $builder = DB::table($this->aliasTable['item'])
                    ->select($data)
                    ->leftJoin($this->aliasTable['plant'], 'item.plant_id', '=', 'plant.id')
                    ->leftJoin($this->aliasTable['company'], 'item.company_id', '=', 'company.id')
                    ->leftJoin($this->aliasTable['depot'], 'item.depot_id', '=', 'depot.id')
                    ->leftJoin($this->aliasTable['subarea'], 'item.subarea_id', '=', 'subarea.id')
                    ->leftJoin($this->aliasTable['bin'], 'item.bin_id', '=', 'bin.id')
                    ->leftJoin($this->aliasTable['material'], 'item.material_id', '=', 'material.id')
                    ->leftJoin($this->aliasTable['owner'], 'item.own_id', '=', 'owner.id')
                    ->leftJoin($this->aliasTable['unit'], 'item.unit_id', '=', 'unit.id')
                    ->where("item.direct",'=',$direct)
                    ->where($where);

        $obj_list->initemtotal_count = $builder->count();
        $obj_list->outitemtotal_count = $builder->count();
        return $obj_list;
    }

    /**
     * 搜索
     */
    private function _search($input)
    {
        $where = array();
        if (isset($input['category_id']) && $input['category_id'] !='') {
            $where[]=['item.category_id','=',$input['category_id']];
        }
        if (isset($input['customcode']) && $input['customcode']) {
            $where[]=['item.customcode','=',$input['customcode']];
        }
        if (isset($input['own_id']) && $input['own_id']) {
            $where[]=['item.own_id','=',$input['own_id']];
        }
        if (isset($input['plant_id']) && $input['plant_id']) {
            $where[]=['item.plant_id','=',$input['plant_id']];
        }
        if (isset($input['plant_name']) && $input['plant_name']) {//根据名字
            $where[]=['plant.name','like','%'.$input['plant_name'].'%'];
        }

        if (isset($input['subarea_id']) && $input['subarea_id']) {
            $where[]=['item.subarea_id','=',$input['subarea_id']];
        }
        if (isset($input['subarea_name']) && $input['subarea_name']) {//根据名字
            $where[]=['subarea.name','like','%'.$input['subarea_name'].'%'];
        }

        if (isset($input['depot_id']) && $input['depot_id']) {
            $where[]=['item.depot_id','=',$input['depot_id']];
        }
        if (isset($input['depot_name']) && $input['depot_name']) {//根据名字
            $where[]=['depot.name','like','%'.$input['depot_name'].'%'];
        }

        if (isset($input['po_number']) && $input['po_number']) {//根据生产订单
            $where[]=['item.po_number','=',$input['po_number']];
        }

        if (isset($input['wo_number']) && $input['wo_number']) {//根据wo
            $where[]=['item.wo_number','=',$input['wo_number']];
        }

        if (isset($input['sale_order_code']) && $input['sale_order_code']) {//根据销售订单
            $where[]=['item.sale_order_code','=',$input['sale_order_code']];
        }

        if (isset($input['bin_id']) && $input['bin_id']) {
            $where[]=['item.bin_id','=',$input['bin_id']];
        }
        if (isset($input['bin_name']) && $input['bin_name']) {//根据名字
            $where[]=['bin.name','like','%'.$input['bin_name'].'%'];
        }

        if (isset($input['material_id']) && $input['material_id']) {
            $where[]=['item.material_id','=',$input['material_id']];
        }

        if (isset($input['item_no']) && $input['item_no']) {//根据物料编码
            $where[]=['material.item_no','like','%'.$input['item_no'].'%'];
        }

        if (isset($input['material_name']) && $input['material_name']) {//根据名字
            $where[]=['material.name','like','%'.$input['material_name'].'%'];
        }

        if (isset($input['start_time']) && $input['start_time']) {
            $where[]=['item.ctime','>=',strtotime($input['start_time'])];
        }
        if (isset($input['end_time']) && $input['end_time']) {//根据创建时间
            $where[]=['item.ctime','<=', strtotime($input['end_time'])];
        }
        return $where;
    }

}