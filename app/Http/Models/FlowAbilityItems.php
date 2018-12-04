<?php 
/**
 * Created by Sublime.
 * User: liming
 * Date: 18/5/2
 */
namespace App\Http\Models;//定义命名空间
use Illuminate\Support\Facades\DB;//引入DB操作类
use App\Exceptions\ApiException;

class FlowAbilityItems extends  Base
{
    public function __construct()
    {
        $this->table='ruis_flow_ability_item';
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
    
	public function saveItem($input)
	{
		$setting_id  = $input['id'];
		foreach (json_decode($input['items'],true)  as  $key=>$item)
		{
			 $item_data = [
                    'setting_id' => $setting_id,
                    'next_operation'      => $item['next_operation'],
                    'next_ability'      => $item['next_ability'],
                    'flow_value'     => $item['flow_value'],
                ];
            $id  =  $item['id']? $item['id'] : 0;
            //检测是否存在 相同的流转
            $where = [
            	'next_operation' => $item['next_operation'],
            	'next_ability' =>$item['next_ability'],
            	'setting_id' =>$setting_id,
            ];
	        $has=$this->isExisted($where);

	        if (!$has) 
	        {
	        	$this->save($item_data,$id);
				$id = $this->pk;
	        }
	        else
	        {
				$act_ids[] = $id;
	        	continue;
	        }

			$act_ids[] = $id;
		}
		// 获取明细
		$db_ids = $this->_get_ids($setting_id);

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
		$list = $this->getLists([['setting_id','=',$id]], 'id');
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
		$list = $this->getListsByWhere([['setting_id','=',$id]]);
		return empty($list) ? array() : $list;
	}


}