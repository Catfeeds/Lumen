<?php 
/**
 * Created by Sublime.
 * User: liming
 * Date: 18/9/12
 */
namespace App\Http\Models;//定义命名空间
use Illuminate\Support\Facades\DB;//引入DB操作类
use App\Exceptions\ApiException;

class OutMachineZyItem extends  Base
{
    public function __construct()
    {
        $this->table='ruis_out_machine_zxxx_order_item';
        $this->materialTable='ruis_material';
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
	public function saveItem($instore_data, $order_id,$type_code)
	{

		foreach ($instore_data  as  $key=>$item)
		{
			 $line_code = isset($item['line_project_code'])?$item['line_project_code']:$this->createLineCode($order_id);
			 $item_data = [
                    'out_machine_zxxx_order_id' => $order_id,
                    'line_project_code' => $line_code,
                    'EBELN' => $item['EBELN'],          // 采购凭证编号
                    'EBELP' => $item['EBELP'],          // 采购凭证的项目
                    'MATNR'    => $item['MATNR'],       // 物料编码
                    'XQSL'     => $item['XQSL'],        // 需求数量 
                    'XQSLDW'   => $item['XQSLDW'],      // 需求数量单位 
                    'BANFN'    => $item['BANFN'],       // 采购申请编号
                    'BNFPO'    => $item['BNFPO'],       // 采购申请的项目编号 
                    'LGFSB'    => $item['LGFSB'],       // 采购存储仓库
                    'DWERKS'    => $item['DWERKS'],     // 工厂
                    'picking_line_item_id'    => $item['picking_line_item_id'],     //明细id
                    'type_code'    => $type_code,       //领料单类型
                ];
            $material_code=preg_replace('/^0+/','',$item['MATNR']);
            $realmaterial_id  = DB::table($this->materialTable)->select('id')->where('item_no',$material_code)->first();
            $item_data['material_id'] = isset($realmaterial_id->id)?$realmaterial_id->id:'';
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
    	$lists = $this->getLists([['out_machine_zxxx_order_id','=',$order_id]], 'line_project_code');
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
		$list = $this->getLists([['out_machine_zxxx_order_id','=',$id]], 'id');
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
		$list = $this->getListsByWhere([['out_machine_zxxx_order_id','=',$id]]);
		return empty($list) ? array() : $list;
	}
}