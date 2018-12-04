<?php
/**
 * Created by PhpStorm.
 * User: ruiyanchao
 * Date: 2018/3/8
 * Time: 上午10:03
 */

namespace App\Http\Controllers\Api;
use App\Http\Controllers\ApiController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 *员工控制器
 *@author    rick
 */
class EmployeeController extends ApiController
{
    public function __construct()
    {
        parent::__construct();
    }

    public function getAllEmployee(Request $request)
    {
        $input = $request->all();
        $machine_no = $input['machine_no'];
        $result = DB::table(config('alias.re').' as a1')
            ->select('a1.card_id','a1.id as employees_no','a1.name as employees_name')
            ->rightJoin(config('alias.rwbre').' as a2','a1.id','a2.emplyee_id')
            ->rightJoin(config('alias.rwb').' as a3','a3.id','a2.workbench_id')
            ->rightJoin(config('alias.rwm').' as a4','a4.workbench_id','a3.id')
            ->where('a4.code','=',$machine_no)
            ->groupBy('a1.id')
            ->get();
        return  response()->json(get_success_api_response($result));
    }

    public function getEmployeeInfo(Request $request)
    {
        $input = $request->all();
        $input['is_scan']=isset($input['is_scan'])?$input['is_scan']:0;
        $machine_no = $input['machine_no'];
        if(!isset($input['card_id'])) TEA('700','card_id');
        switch ($input['is_scan']){
            case 0:
                if(!isset($input['password'])) TEA('700','password');
                $check = DB::table(config('alias.re'))
                    ->select('id as employee_id')
                    ->where([['card_id','=',$input['card_id']],['password','=',$input['password']]])
                    ->first();
                if(empty($check)){
                    TEA('2503');
                }
                $employee = DB::table(config('alias.re').' as a1')
                    ->select('a1.id as employee_id','a1.card_id','a1.name as employee_name')
                    ->rightJoin(config('alias.rwbre').' as a2','a1.id','a2.emplyee_id')
                    ->rightJoin(config('alias.rwb').' as a3','a3.id','a2.workbench_id')
                    ->rightJoin(config('alias.rwm').' as a4','a4.workbench_id','a3.id')
                    ->where([['a1.card_id','=',$input['card_id']],['a4.code','=',$machine_no]])
                    ->first();
                break;
            case 1:
                $employee = DB::table(config('alias.re').' as a1')
                    ->select('a1.id as employee_id','a1.card_id','a1.name as employee_name')
                    ->rightJoin(config('alias.rwbre').' as a2','a1.id','a2.emplyee_id')
                    ->rightJoin(config('alias.rwb').' as a3','a3.id','a2.workbench_id')
                    ->rightJoin(config('alias.rwm').' as a4','a4.workbench_id','a3.id')
                    ->where([['a1.card_id','=',$input['card_id']],['a4.code','=',$machine_no]])
                    ->first();
                break;
            default:
                TEA('2502');
        }
        if(empty($employee)){
            TEA('2504');
        }else{
            return  response()->json(get_success_api_response([$employee]));
        }
    }
}
