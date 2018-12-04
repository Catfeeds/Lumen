<?php 
/**
 * Created by Sublime.
 * User: liming
 * Date: 17/10/27
 */
namespace App\Http\Models;//定义命名空间
use Illuminate\Support\Facades\DB;//引入DB操作类
use App\Exceptions\ApiException;

class ClaimItem extends  Base
{
    public function __construct()
    {
        $this->table='ruis_claim_item';

        //定义表别名
        $this->aliasTable=[
            'item'=>$this->table.' as item',
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
		foreach (json_decode($input['items'],true)  as  $key=>$item)
		{

			 $line_code = isset($item['line_project_code'])?$item['line_project_code']:$this->createLineCode($order_id);

			 $item_data = [
                    'claim_id' => $order_id,
                    'MATNR' => $item['MATNR'],
                    'MATNR_qty'    => $item['MATNR_qty'],
                    'OCCURRED_DATE'    => time(),
                    'DEFECT_DESC'  => $item['DEFECT_DESC'],
                    'DEFECT_SUM'      => $item['DEFECT_SUM'],
                    'RELATIVE_ITEM_CODE'  => $item['RELATIVE_ITEM_CODE'],
                    'RELATIVE_ITEM_SUM'    => $item['RELATIVE_ITEM_SUM'],
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
     * 生成一个行项目号
     *
     * @param $order_id
     * @return string
     */
    public function createLineCode($order_id)
    {
    	//根据order_id 找现有的最大行项目号
    	$lists = $this->getLists([['claim_id','=',$order_id]], 'code');
    	if(!$lists)
    	{
    		$start = '0001';
    		return  $start;
    	}
    	else
    	{
    		//定义一个容器  用来存放code
	    	$code_arr = [];
	    	foreach ($lists as  $list)
	    	{
	    		$code_arr[]=preg_replace('/^0+/','',$list);
	    	}
	    	$temp_code =max($code_arr)+1;
	    	$real_code = str_pad($temp_code, 4, '0', STR_PAD_LEFT);
	    	return  $real_code;
    	}

    }


	/**
	 * 获取明细id
	 * @param int $id
	 */
	private function _get_ids($id)
	{
		$list = $this->getLists([['claim_id','=',$id]], 'id');
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
		$list = $this->getListsByWhere([['claim_id','=',$id]]);
		return empty($list) ? array() : $list;
	}


}