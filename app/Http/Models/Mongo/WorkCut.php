<?php
/**
 * 裁片数量.
 * User: ruiyanchao
 * Date: 2017/10/19
 * Time: 下午5:13
 */

namespace App\Http\Models\Mongo;
use Illuminate\Support\Facades\DB;

/**
 * 报警记录数据操作类
 * @author  rick
 * @time    2017年10月19日08:20:02
 */
class WorkCut extends Base
{
    private $tableTotal;
    public function __construct()
    {
        $this->table      = 'work_cut';
        $this->tableTotal = 'work_cut_total';
        $this->connection = 'mongodb';
    }

    public function getCompleteNum()
    {
        $time_str = time();
        $now_day = date('w',$time_str);
        $monday_str = $time_str - ($now_day-1)*60*60*24;
        $count = array();
        $totalCount = array();
        for($i=0;$i<7;$i++){
            $time = date('Y-m-d',$monday_str+$i*24*3600);
            $start_time = strtotime($time.' 00:00:00');
            $end_time   = strtotime($time.' 23:59:59');

            $tmp   = DB::connection($this->connection)->collection($this->table)
                ->where('create_time', '>=', $start_time)
                ->where('create_time', '<=', $end_time)
                ->sum('real_piece_qty');
            $count[] = $tmp;
        }
        $count = !empty($count)?$count:[0,0,0,0,0,0];
        $time = date('Y-m-d',$monday_str);
        $start_time = strtotime($time.' 00:00:00');
        $time = date('Y-m-d',$monday_str+6*24*3600);
        $end_time = strtotime($time.' 23:59:59');
        $totals = DB::connection($this->connection)->collection($this->tableTotal)
            ->where('create_time', '>=', $start_time)
            ->where('create_time', '<=', $end_time)
            ->get();
        foreach ($totals as $row){
            $totalCount[] = $row->num;
        }
        $totalCount = !empty($totalCount)?$totalCount:[0,0,0,0,0,0];
        return [['name'=>'计划完成数','data'=>$totalCount],['name'=>'实际完成数','data'=>$count]];
    }
}
