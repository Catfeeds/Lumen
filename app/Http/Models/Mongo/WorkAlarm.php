<?php
/**
 * 报警统计
 * User: ruiyanchao
 * Date: 2017/10/19
 * Time: 上午8:10
 */

namespace App\Http\Models\Mongo;
use Illuminate\Support\Facades\DB;

/**
 * 报警记录数据操作类
 * @author  rick
 * @time    2017年10月19日08:20:02
 */
class WorkAlarm extends Base
{

    public function __construct()
    {
        $this->table      = 'work_alarm';
        $this->connection = 'mongodb';
    }

    /*
     * 获取报警统计周报统计图
     * turn mixed
     * TODO 需要优化
     * @author rick
     */
    public function getAlarmCount()
    {
        $type =  DB::table('error_type')->get();
        $time_str = time();
        $now_day = date('w',$time_str);
        $monday_str = $time_str - ($now_day-1)*60*60*24;
        $count = array();
        $j = 0;
        foreach ($type as $row){
            for($i=0;$i<7;$i++){
                $time = date('Y-m-d',$monday_str+$i*24*3600);
                $start_time = strtotime($time.' 00:00:00');
                $end_time   = strtotime($time.' 23:59:59');

                $tmp   = DB::connection($this->connection)->collection($this->table)
                    ->where('create_time', '>=', $start_time)
                    ->where('create_time', '<=', $end_time)
                    ->where('error_type_no','=', $row->code)
                    ->count();
                $count[$j]['data'][] = $tmp;
                $count[$j]['name'] = $row->name;
            }
            $j++;
        }
        return  $count;

    }

    /*
     * 获取不同处理状态的条数
     * @return mixed
     * @author rick
     */
    public function getByStatus($status)
    {
        $result   = DB::connection($this->connection)->collection($this->table)
            ->where('status','=', $status)
            ->count();
        return $result;
    }


}