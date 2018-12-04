<?php
/**
 * 工单完成数.
 * User: ruiyanchao
 * Date: 2017/10/19
 * Time: 下午5:54
 */

namespace App\Http\Models\Mongo;

use Illuminate\Support\Facades\DB;

/**
 * 工单完成数
 * @author  rick
 * @time    2017年10月19日08:20:02
 */
class WorkComplete extends Base
{
    private $workOrder;
    public function __construct()
    {
        $this->table      = 'work_complete';
        $this->workOrder  = 'work_order';
        $this->connection = 'mongodb';
    }

    public function getCompleteNum()
    {
//        $total     = DB::connection($this->connection)->collection($this->table)->count();
//        $realTotal = DB::connection($this->connection)->collection($this->workOrder)->count();
//        $inTimeTotal = DB::connection($this->connection)->collection($this->workTotal)
//            ->where('is_late','=',1)
//            ->count();
        $total       = 1839;
        $realTotal   = 2193;
        $inTimeTotal = 1723;
        #TODO 这里造假数据
        return [
            [['value'=>$total,'name'=>'已完成'],
                ['value'=>$realTotal-$total,'name'=>'未完成']]
            ,[['value'=>$inTimeTotal,'name'=>'按时完成'],
                ['value'=>$total-$inTimeTotal,'name'=>'未按时完成']]
        ];
    }
}