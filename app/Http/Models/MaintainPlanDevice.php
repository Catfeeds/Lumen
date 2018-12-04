<?php 
/**
 * Created by Sublime.
 * User: liming
 * Date: 18/4/9
 */
namespace App\Http\Models;//定义命名空间
use Illuminate\Support\Facades\DB;//引入DB操作类
use App\Exceptions\ApiException;

class MaintainPlanDevice extends  Base
{
    public function __construct()
    {
        $this->table='ruis_maintain_device_item';

        //定义表别名
        $this->aliasTable=[
            'maintaindevice'=>$this->table.' as maintaindevice',
        ];


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
	public function saveItem($input, $order_id)
	{

		$resarr  = json_decode($input['deviceitems'],true);
		if (!is_array($resarr) ||  empty($resarr)) TEA('905');
		
		foreach ($resarr  as  $key=>$item)
		{
			 $item_data = [
                    'plan_id' => $order_id,
                    'device_id' => $item['device_id'],
                ];

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
		$list = $this->getLists([['plan_id','=',$id]], 'id');
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
		$list = $this->getListsByWhere([['plan_id','=',$id]]);
		return empty($list) ? array() : $list;
	}

}