<?php 
/**
 * Created by Sublime.
 * User: liming
 * Date: 18/8/31
 */
namespace App\Http\Models;//定义命名空间
use Illuminate\Support\Facades\DB;//引入DB操作类
use App\Exceptions\ApiException;

class OutMachineLine extends  Base
{
    public function __construct()
    {
        $this->table='ruis_sap_out_picking_line';

        //定义表别名
        $this->aliasTable=[
            'line'=>$this->table.' as line',
        ];
        if(empty($this->outlineitem)) $this->outlineitem =new OutMachineItem();

    }

    /**
	 * 保存明细数据
	 */
	public function saveLine($input, $order_id)
	{
		foreach ($input as  $key=>$line)
		{
            if (!isset($line['LOEKZ'])) TESAP('9523');
            $LOEKZ = $line['LOEKZ'];
            //查询是否 已经存在 该行项目  先清空一次
            $where=[
                'picking_id'=>$order_id,
                'EBELP'=>$line['EBELP']
            ];
            $line_res  = DB::table($this->table)->where($where)->select('id')->first();
            if ($line_res)
            {
                $line_id  = $line_res->id;
                DB::table('ruis_sap_out_picking_line_item')->where('line_id',$line_id)->delete();
                DB::table($this->table)->where($where)->delete();
            }

            if (!empty($LOEKZ)) 
            {
               // 如果不等于空  那么该行项目删除  以及该行项目下的明细删除  
               // 应为上面已经全部清空  所以 不需要进行任何操作

            } 
            else
            {
                $line_data = [
                    'picking_id' => $order_id,
                    'EBELP'      => $line['EBELP'],
                    'MATNR'      => $line['MATNR'],
                    'WERKS'      => $line['WERKS'],
                    'MENGE'      => $line['MENGE'],
                    'MEINS'      => $line['MEINS'],
                    'VBELN'      => $line['VBELN'],
                    'VBELP'      => $line['VBELP'],
                    'AUFNR'      => $line['AUFNR'],
                    'BANFN'      => $line['BANFN'],
                    'BNFPO'      => $line['BNFPO'],
                ];
                 //添加
                $insert_id=DB::table($this->table)->insertGetId($line_data);
                if(!$insert_id) TESAP('802');

                // 添加行明细
                $this->outlineitem->saveItem($line['DITEM'], $insert_id);
            }

		}

	}

}