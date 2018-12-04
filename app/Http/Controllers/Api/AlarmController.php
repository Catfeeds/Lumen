<?php
/**
 * Created by PhpStorm.
 * User: ruiyanchao
 * Date: 2018/3/11
 * Time: 下午6:17
 */
namespace App\Http\Controllers\Api;

use App\Http\Controllers\ApiController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 *员工控制器
 *@author    rick
 */
class AlarmController extends ApiController
{
    public function getErrorType(Request $request)
    {
        $result = DB::table(config('alias.ret'))
            ->get();
        return  response()->json(get_success_api_response($result));
    }

    public function submitErrorType(Request $request)
    {
        $input = $request->all();
        if(!isset($input['work_order_id'])) TEA('700','work_order_id');
        if(!isset($input['error_type_id'])) TEA('700','error_type_id');
        if(!isset($input['creator_id'])) TEA('700','creator_id');
        $work_order_id = $input['work_order_id'];
        $error_type_id = $input['error_type_id'];
        $creator_id = $input['creator_id'];
        $work_order = DB::table(config('alias.rwo'))->select('id','work_shift_id','operation_id')->where('id',$work_order_id)->first();
        if(empty($work_order)){
            TEA('2505');
        }
        $data = [
            'work_order_id'=>$work_order_id,
            'error_type_id'=>$error_type_id,
            'status'=>0,
            'work_station_id'=>$work_order->work_shift_id,
            'operation_id'=>$work_order->operation_id,
            'creator_id'=>$creator_id,
            'ctime'=>time(),
        ];
        $insert_id = DB::table(config('alias.rwoa'))->insertGetId($data);
        if (!$insert_id) TEA('802');
        return  response()->json(get_success_api_response(['id'=>$insert_id]));
    }

    public function handleWorkOrderAlarm(Request $request)
    {
        $input = $request->all();
        if(!isset($input['work_order_alarm_id'])) TEA('700','work_order_alarm_id');
        if(!isset($input['creator_id'])) TEA('700','creator_id');
        if(!isset($input['alarm_status'])) TEA('700','alarm_status');
        $work_order_alarm_id = $input['work_order_alarm_id'];
        $creator_id = $input['creator_id'];
        $status  = $input['alarm_status'];

        $data =[
            'processing_user_id'=>$creator_id,
            'status'=>$status,
        ];
        $upd= DB::table(config('alias.rwoa'))->where('id',$work_order_alarm_id)->update($data);
        if($upd===false) TEA('806');

        return  response()->json(get_success_api_response(['id'=>$work_order_alarm_id]));

    }
}