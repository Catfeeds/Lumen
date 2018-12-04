<?php 
/**
 * Created by Sublime.
 * User: liming
 * Date: 18/10/7
 */
namespace App\Http\Models;//定义命名空间
use Illuminate\Support\Facades\DB;//引入DB操作类
use App\Exceptions\ApiException;

class SapStandardMaterialWorkHoursItem extends  Base
{
    public function __construct()
    {
        $this->table='sap_standard_material_workhours_item';
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
	public function saveItem($input,$step_info_id)
	{
		// pd($input);
		foreach (json_decode($input['stands'],true)  as  $key=>$item)
		{

			if ($item['standard_item_id'] <1)
			{
				continue;
			}
			 //根据id获取code
			 $standard_item_code  = DB::table('sap_param_item')->select('code')->where('id',$item['standard_item_id'])->first();

			 $item_data = [
                    'step_info_id' => $step_info_id,
                    'standard_item_id' => $item['standard_item_id'],
                    'standard_item_code' => $standard_item_code->code,
                    'value'    => $item['value'],
                ];

            $id  =  $item['id']? $item['id'] : 0;
		    $this->save($item_data,$id);

			$id = $this->pk;
			$act_ids[] = $id;
		}
		// 获取明细
		$db_ids = $this->_get_ids($step_info_id);

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
		$list = $this->getLists([['step_info_id','=',$id]], 'id');
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
		$list = $this->getListsByWhere([['step_info_id','=',$id]]);
		return empty($list) ? array() : $list;
	}
}