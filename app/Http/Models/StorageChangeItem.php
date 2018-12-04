<?php 
/**
 * 库存签转明细
 * User: liming
 * Date: 18/10/27
 */
namespace App\Http\Models;//定义命名空间
use Illuminate\Support\Facades\DB;//引入DB操作类
use App\Exceptions\ApiException;

class StorageChangeItem extends Base
{
    public function __construct()
    {
        $this->table='ruis_storage_change_item';
        $this->change_table='ruis_storage_change';
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
            'change_item'=> $this->table.' as change_item',
            'change'=>$this->change_table.' as change',
            'inve'=>$this->inve_table.' as inve',
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
    public function save($data,$id)
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
     * 获取明细id
     * @param int $id
     */
    private function _get_ids($id)
    {
        $list = $this->getLists([['fk_id','=',$id]], 'id');
        foreach ($list as $val)
            $ids[] = $val;
        return empty($ids) ? array() : $ids;
    }
    /**
     * 保存明细数据
     */
    public function saveItem($input, $order_id)
    {
        foreach (json_decode($input['items'],true)  as  $key=>$item)
        {
            if($item['material_id']=='')
            {
                TEA('703','material');
            }
            if($item['real_quantity']=='')
            {
                TEA('703','real_quantity');
            }
            //调拨出库
            $data = [
                'fk_id' => $order_id,
                'material_id' => $item['material_id'],
                'lot'         => $item['lot'],
                'quantity'    => $item['real_quantity'],
                'creator'     => $item['creator'],
                'remark'      => $item['remark'],
                'unit_id'     => $item['unit_id'],
                'plant_id'     => is_null($item['plant_id'])?'':$item['plant_id'],
                'depot_id'     => is_null($item['depot_id'])?'':$item['depot_id'],
                'subarea_id'   => is_null($item['subarea_id'])?'':$item['subarea_id'],
                'bin_id'       => is_null($item['bin_id'])?'':$item['bin_id'],
                'createtime'   => time(),   //创建时间
            ];
            //入库
            $instor_data=$data;
            $instor_data['sale_order_code'] = $input['new_sale_order_code'];
            $instor_data['po_number'] = $input['new_po_number'];
            $instor_data['wo_number'] = $input['new_wo_number'];
            $instor_data['direct'] ='1';
            $io_id=0;
            $this->save($instor_data,$io_id);
            $id = $this->pk;
            $act_ids[] = $id;
            //出库
            $outstor_data=$data;
            $outstor_data['sale_order_code'] = $item['sale_order_code'];
            $outstor_data['po_number'] = $item['po_number'];
            $outstor_data['wo_number'] = $item['wo_number'];
            $outstor_data['inve_id'] = $item['inve_id'];
            $outstor_data['direct'] ='-1';
            $this->save($outstor_data,$io_id);
            $id = $this->pk;
            $act_ids[] = $id;
        }
        // 获取明细
        $db_ids = $this->_get_ids($order_id);

        // 需要删除的id
        $del_ids = array_diff($db_ids, empty($act_ids) ? array() : $act_ids);
        if ($del_ids)
        {
            foreach ($del_ids as $id)  $this->destroyById($id);
        }
    }


    /**
     * 获取明细list
     * @param array   list
     */
    public function getItems($id)
    {
        $list = $this->getListsByWhere([['fk_id','=',$id]]);
        return empty($list) ? array() : $list;
    }
}