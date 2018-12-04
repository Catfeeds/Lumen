<?php 
/**
 * 库存调拨明细
 * User: xiafengjuan
 * Date: 19/12/05
 */
namespace App\Http\Models;//定义命名空间
use Illuminate\Support\Facades\DB;//引入DB操作类
use App\Exceptions\ApiException;


class StorageAllotitem extends Base
{
    
    public function __construct()
    {
        $this->table='ruis_storage_allot_item';
        $this->allot_table='ruis_storage_allocate';
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
            'allot_item'=> $this->table.' as allot_item',
            'allocate'=>$this->allot_table.' as allocate',
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
                'creator'       => $item['creator'],
                'remark'      => $item['remark'],
                'unit_id'     => $item['unit_id'],
                'createtime'       => time(),   //创建时间
            ];
            //入库
            $instor_data=$data;
            $instor_data['plant_id'] = $input['plant_id'];
            $instor_data['depot_id'] = $input['depot_id'];
            $instor_data['subarea_id'] = $input['subarea_id'];
            $instor_data['bin_id'] = $input['bin_id'];
            $instor_data['inve_id'] = $item['inve_id'];
            $instor_data['direct'] =1;
            $io_id=0;
            $this->save($instor_data,$io_id);
            $id = $this->pk;
            $act_ids[] = $id;
            //出库
            $outstor_data=$data;
            $outstor_data['plant_id'] = $item['plant_id'];
            $outstor_data['depot_id'] = $item['depot_id'];
            $outstor_data['subarea_id'] = $item['subarea_id'];
            $outstor_data['bin_id'] = $item['bin_id'];
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