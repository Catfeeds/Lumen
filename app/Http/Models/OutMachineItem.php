<?php 
/**
 * Created by Sublime.
 * User: liming
 * Date: 18/8/31
 */
namespace App\Http\Models;//定义命名空间
use Illuminate\Support\Facades\DB;//引入DB操作类
use App\Exceptions\ApiException;

class OutMachineItem extends  Base
{
    public function __construct()
    {
        $this->table='ruis_sap_out_picking_line_item';

        //定义表别名
        $this->aliasTable=[
            'item'=>$this->table.' as item',
        ];
    }

    /**
	 * 保存明细数据
	 */
	public function saveItem($input, $order_id)
	{
		foreach ($input as  $key=>$item)
		{
			 $item_data = [
                    'line_id'    => $order_id,
                    'RSNUM'      => $item['RSNUM'],
                    'RSPOS'      => $item['RSPOS'],
                    'DMATNR'      => $item['DMATNR'],
                    'DWERKS'      => $item['DWERKS'],
                    'DLGORT'      => $item['DLGORT'],
                    'DBDMNG'      => $item['DBDMNG'],
                    'DMEINS'      => $item['DMEINS'],
                ];
		     //添加
            $insert_id=DB::table($this->table)->insertGetId($item_data);
            if(!$insert_id) TESAP('802');
		}

	}

}