<?php 
/**
 * Created by Sublime.
 * User: liming
 * Date: 18/10/11
 */
namespace App\Http\Models;//定义命名空间
use Illuminate\Support\Facades\DB;//引入DB操作类
use App\Exceptions\ApiException;

class OutMachineShopItem extends  Base
{
    public function __construct()
    {
        $this->table='ruis_out_machine_shop_item';
    }

    /**
	 * 保存数据
	 */
	public function save($data, $id)
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
	 * 保存明细数据
	 */
	public function saveItem($input,$instore_data, $order_id)
	{
		foreach ($instore_data  as  $key=>$item)
		{
			 $item_data = [
                    'out_machine_shop_id' => $order_id,
                    'material_id'    => $item['material_id'],      
                    'qty'            => $item['qty'],      
                    'unit_id'        => $item['unit_id'],      
                    'production_id'  => $input['production_id'],         
                    'sub_id'         => $input['sub_id'],                  // 需求数量单位 
                    'BANFN'          => $input['BANFN'],                   // 采购申请编号
                    'BNFPO'          => $input['BNFPO'],                   // 采购申请的项目编号 
                    'rated'          => $item['rated'],                    // 额定数量
                    'inve_id'        => $item['inve_id'],                  // 实时库存id
                    'lot'            => $item['lot'],                      // 实时库存id
                    'depot_id'       => $item['depot_id'],                 // 实时库存
                ];
                
             if (isset($item['actual_send_qty'])  && $item['actual_send_qty']>0) 
             {
             	$item_data['actual_send_qty']=$item['actual_send_qty'];
             }

            $id  =  $item['id']? $item['id'] : 0;
		    $this->save($item_data,$id);
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
	 * 获取明细id
	 * @param int $id
	 */
	private function _get_ids($id)
	{
		$list = $this->getLists([['out_machine_shop_id','=',$id]], 'id');
		foreach ($list as $val) 
			$ids[] = $val;
		return empty($ids) ? array() : $ids;
	}


	/**
	 * 获取明细list
	 * @param array   list
	 */
	public function getItems($id)
	{
		$list = $this->getListsByWhere([['out_machine_shop_id','=',$id]]);
		return empty($list) ? array() : $list;
	}
}