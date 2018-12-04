<?php
/**
 * 拉取每日工单和裁片.
 * User: ruiyanchao
 * Date: 2017/10/20
 * Time: 下午6:24
 */

namespace App\Console\Commands;

use App\Libraries\Log4php;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class GetOrders extends Command
{
    /**
     * 控制台命令 signature 的名称。
     *
     * @var string
     */
    protected $signature = 'orders:get';

    /**
     * 控制台命令说明。
     *
     * @var string
     */
    protected $description = '拉取每日订单以及裁片,每日凌晨拉取前一天的。';

    protected $connection  = 'mongodb';
    protected $table       = 'work_order';
    protected $workTotal   = 'work_order_total';
    protected $cutTotal    = 'work_cut_total';
    /**
     * 创建一个新的命令实例。
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * 执行控制台命令。
     * TODO 工位机增多后加入队列 加上日志记录插入数量
     * @return mixed
     */
    public function handle()
    {
        $yesterday  = date("Y-m-d",strtotime("-1 day"));
        $start_time = strtotime($yesterday.' 00:00:00');
        $end_time   = strtotime($yesterday.' 23:59:59');
        $data       = DB::table('work_order as a')
            ->leftJoin('work_order_group as b', 'b.id', '=', 'a.work_order_group_id')
            ->leftjoin('raa_material_item as c', function ($join) {
                $join->on('a.id', '=', 'c.owner_id')
                    ->where('c.owner_type', '=', 'work_order')
                    ->where('c.type','=',2);
            })
            ->select('a.number as work_order_no','a.work_station_time','a.production_date','a.work_station_id','a.work_shift_id','a.creator_id','c.qty','b.number as father_work_order_id')
            ->where([['production_date','>=',$start_time],['production_date','<=',$end_time]])
            ->get();
        $tmp = array();
        $piece_num = 0;
        $i = 0;
        foreach ($data as $row){
            $tmp[$i]['work_order_no']        = $row->work_order_no;
            $tmp[$i]['work_station_time']    = $row->work_station_time;
            $tmp[$i]['production_date']      = $row->production_date;
            $tmp[$i]['work_station_id']      = $row->work_station_id;
            $tmp[$i]['work_shift_id']        = $row->work_shift_id;
            $tmp[$i]['creator_id']           = $row->creator_id;
            $tmp[$i]['qty']                  = (int)$row->qty;
            $tmp[$i]['father_work_order_id'] = $row->father_work_order_id;
            $piece_num = $piece_num+$row->qty;
            $i++;
        }

        if(empty($tmp)){
            Log4php::warn('CODE:1001,MES:拉取昨日订单为空！');
        }else{
            $totalCut['num']     = $i;
            $totalCut['create_time']    = $start_time;

            $totalWork['num']    = $piece_num;
            $totalWork['create_time']    = $start_time;

            DB::connection($this->connection)->collection($this->workTotal)->insert($totalWork);
            DB::connection($this->connection)->collection($this->cutTotal)->insert($totalCut);

            $result = DB::connection($this->connection)->collection($this->table)->insert($tmp);
            if($result){
                Log4php::info('CODE:1001,MES:插入成功,NUM:'.count($data));
            }else{
                Log4php::warn('CODE:1001,MES:插入失败');
            }
        }
    }
}