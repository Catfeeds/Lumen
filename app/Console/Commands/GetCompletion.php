<?php
/**
 * 获取订单完成状态
 * User: ruiyanchao
 * Date: 2017/11/6
 * Time: 上午9:15
 */

namespace App\Console\Commands;

use App\Libraries\Log4php;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class GetCompletion extends Command
{
    /**
     * 控制台命令 signature 的名称。
     *
     * @var string
     */
    protected $signature = 'completion:get';

    /**
     * 控制台命令说明。
     *
     * @var string
     */
    protected $description = '整理每日订单状态,是否准时完成';
    protected $connection  = 'mongodb';
    protected $table       = 'work_complete_status';
    protected $workOrder   = 'work_order';
    protected $workComplete   = 'work_complete';

    /**
     * 创建一个新的命令实例。
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * 执行控制台命令。
     * TODO 工位机增多后加入队列
     * @return mixed
     */
    public function handle()
    {
        $yesterday  = date("Y-m-d",strtotime("-1 day"));
        $start_time = strtotime($yesterday.' 00:00:00');
        $end_time   = strtotime($yesterday.' 23:59:59');
        $work_order = DB::connection($this->connection)
            ->collection($this->workOrder)
            ->where('production_date','>=',$start_time)
            ->where('production_date','<=',$end_time)
            ->get();
        $work_complete = DB::connection($this->connection)
            ->collection($this->workComplete)
            ->where('create_time','>=',$start_time)
            ->where('create_time','<=',$end_time)
            ->get();
        $tmp = array();
        $j = 0;
        foreach ($work_order as $order_row){
            if($order_row['father_work_order_id'] != null){
                if(!array_search($order_row['father_work_order_id'],$tmp)){
                    $tmp[$order_row['work_station_time'].'_'.$j] = $order_row['father_work_order_id'];
                }

            }else{
                $tmp[$order_row['work_station_time'].'_'.$j] = $order_row['work_order_no'];
            }

            $j++;
        }
        if(empty($tmp)){
            Log4php::warn('CODE:1002,MES:订单记录为空');
            exit();
        }
        $i = 0;
        foreach ($work_complete as $complete_row){

            $plane_tmp = array_search($complete_row['work_order_no'],$tmp);
            if($plane_tmp){
                $plane_array = explode('_',$plane_tmp);
                $plane_time  = $plane_array[0];
                $real_time   = $complete_row['work_station_time'];
                if($real_time != 0 && $plane_time>=$real_time){
                    $status  = 1; //超时
                }
                if($real_time != 0 && $plane_time<$real_time){
                    $status  = 2; //延时
                }
                if($real_time == 0){
                    $status  = 3; //挂起等特殊原因
                }
                $data[$i]['work_order_no'] = $complete_row['work_order_no'];
                $data[$i]['status']     = $status;
                $data[$i]['time']       = $start_time;
                $i++;
            }
        }
        if(empty($data)){
            Log4php::warn('CODE:1002,MES:整理后的数据为空');
            exit();
        }
        $result = DB::connection($this->connection)
            ->collection($this->table)
            ->insert($data);
        if($result){
            Log4php::info('CODE:1002,MES:插入成功,NUM:'.count($data));
        }else{
            Log4php::warn('CODE:1002,MES:插入失败');
        }
    }

}