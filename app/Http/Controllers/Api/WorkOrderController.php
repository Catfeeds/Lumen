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
class WorkOrderController extends ApiController
{
    public function __construct()
    {
        parent::__construct();
    }

    public function unfinishedWorkOrder(Request $request)
    {
        $input = $request->all();
        $machine_no = $input['machine_no'];
        $today = strtotime(date('Y-m-d',time()));
        $result = DB::table(config('alias.rwo').' as a1')
            ->select(
                'a1.id as work_order_id',
                'a1.number as work_order_no',
                'a2.out_material',
                'a1.start_time as actual_start_time',
                'a1.end_time as actual_end_time',
                'a1.qty',
                'a1.used_qty as actual_quantity',
                'a1.operation_ability_id',
                'a2.operation_ability_pluck',
                'a1.status'
            )
            ->leftJoin(config('alias.roo').' as a2','a1.operation_order_id','a2.id')
            ->leftJoin(config('alias.rwb').' as a3','a1.work_shift_id','a3.id')
            ->leftJoin(config('alias.rwm').' as a4','a3.id','a4.workbench_id')
            ->where([
                ['a1.work_station_time','=',$today],
                ['a4.code','=',$machine_no],
                ['a1.status','=',2]
            ])
            ->limit(20)
            ->get();
        foreach ($result as $key=>&$value){
            $out_material = json_decode($value->out_material);
            $value->materials_no = isset($out_material[0]->item_no)?$out_material[0]->item_no:'';
            $pluck = json_decode($value->operation_ability_pluck);
            $operation_ability_id=$value->operation_ability_id;
            $value->planned_working_time = $pluck->$operation_ability_id->standard_working_hours*$value->qty;
            unset($value->out_material);
            unset($value->operation_ability_pluck);
            unset($value->operation_ability_id);
            unset($value->qty);
        }
        return  response()->json(get_success_api_response($result));
    }

    public function startUnfinishedWorkOrder(Request $request)
    {
        $input = $request->all();
        if(!isset($input['work_order_id'])) TEA('700','work_order_id');
        $work_order_id = $input['work_order_id'];
        if(!isset($input['is_go_on'])) TEA('700','is_go_on');
        $is_go_on= $input['is_go_on'];
        $data = [
            'status'=>3,
        ];
        if($is_go_on==0){
            $data['start_time']=time();
        }
        $this->update($work_order_id,$data);
        $result = $this->get($work_order_id);
        return response()->json(get_success_api_response([$result]));
    }


    public function update($id,$data)
    {
        //入库
        $upd= DB::table(config('alias.rwo'))->where('id',$id)->update($data);
        if($upd===false) TEA('806');
    }

    public function get($id)
    {
        $field = [
            'a1.id as work_order_id',
            'a1.number as work_order_no',
            'a5.name as operation_name',
            'a6.ability_name',
            'a1.qty',
            'a2.in_material',
            'a2.out_material',
            //'a4.item_no',
        ];
        $obj = DB::table(config('alias.rwo').' as a1')->select($field)
            ->leftJoin(config('alias.roo').' as a2','a2.id','=','a1.operation_order_id')
            ->leftJoin(config('alias.rpo').' as a3','a3.id','=','a1.production_order_id')
            ->leftJoin(config('alias.rm').' as a4','a4.id','=','a3.product_id')
            ->leftJoin(config('alias.rio').' as a5','a5.id','=','a1.operation_id')
            ->leftJoin(config('alias.rioa').' as a6','a6.id','=','a1.operation_ability_id')
            ->where('a1.id',$id)->first();
        $obj->in_material = $this->getAttributes(json_decode($obj->in_material));
        $obj->out_material = $this->getAttributes(json_decode($obj->out_material));
//        $bili= $obj->in_material[0]['qty']/$obj->out_material[0]['qty'];
//        $obj->out_material[0]['qty']=$obj->qty;
//        $obj->in_material[0]['qty']=$bili*$obj->out_material[0]['qty'];
        foreach($obj->in_material as $key=>$value){
            //工单的进出料比默认按照工艺单的进出料比计算
            $bili= $obj->in_material[$key]['qty']/$obj->out_material[0]['qty'];
            //工艺单进出料比乘以工单qty(工单出料数量)即为工单进料数量
            $obj->in_material[$key]['qty']=$bili*$obj->qty;
        }
        //工单的出料数量默认等于工单的qty字段值
        $obj->out_material[0]['qty']=$obj->qty;
        if(!$obj) TEA('404');
        return $obj;
    }

    public function hangWorkOrder(Request $request)
    {
        $input = $request->all();
        if(!isset($input['work_order_id'])) TEA('700','work_order_id');
        $work_order_id = $input['work_order_id'];
        $data = [
            'status'=>4,
        ];
        $this->update($work_order_id,$data);
        return response()->json(get_success_api_response([['work_order_id'=>$input['work_order_id']]]));
    }

    /**
     * 查看当前工单已完成数量
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @author Bruce Chu
     * @time 2018年04月02日 18:42
     */
    public function getUsedQty(Request $request)
    {
        $input = $request->all();
        //数据过滤,work_order_id必须传
        if(!isset($input['work_order_id'])) TEA('700','work_order_id');
        $work_order_id = $input['work_order_id'];
        $result=DB::table(config('alias.rwo'))->select('used_qty')->where('id',$work_order_id)->get();
        //如果结果返回为NULL 默认数量为0
        if(is_null($result[0]->used_qty)){
            $result[0]->used_qty=0;
        }
        return response()->json(get_success_api_response($result));
    }


    public function submitPiece(Request $request)
    {
        $input = $request->all();
        if(!isset($input['work_order_id'])) TEA('700','work_order_id');
        if(!isset($input['real_piece_qty'])) TEA('700','real_piece_qty');
        if(!isset($input['creator_id'])) TEA('700','creator_id');
        $work_order_id = $input['work_order_id'];
        $work_order = DB::table(config('alias.rwo'))->select('id','qty','used_qty')->where('id',$work_order_id)->first();
        if(empty($work_order)){
            TEA('2505');
        }
        $qty = $work_order->qty;
        $used_qty = $work_order->used_qty;
        if(($used_qty+$input['real_piece_qty'])>$qty) {
            TEA('2506');
        }else{
            $data=[
                'used_qty'=>$used_qty+$input['real_piece_qty']
            ];
            $this->update($work_order_id,$data);
            return response()->json(get_success_api_response([['work_order_id'=>$input['work_order_id']]]));
        }
    }

    public function submitWorkOrder(Request $request)
    {
        $input = $request->all();
        if(!isset($input['work_order_id'])) TEA('700','work_order_id');
        $work_order_id = $input['work_order_id'];
        $work_order = DB::table(config('alias.rwo'))->select('id','qty','used_qty')->where('id',$work_order_id)->first();
        if($work_order->qty != $work_order->used_qty)
        {
            TEA('2507');
        }
        $data = [
            'status'=>10,
            'end_time'=>time(),
        ];
        $this->update($work_order_id,$data);
        return response()->json(get_success_api_response([['work_order_id'=>$input['work_order_id']]]));
    }

    public function listHistoryWorkOrder(Request $request)
    {
        $input = $request->all();
        $machine_no = $input['machine_no'];
        $today = strtotime(date('Y-m-d',time()));
        $result = DB::table(config('alias.rwo').' as a1')
            ->select(
                'a1.id as work_order_id',
                'a1.number as work_order_no',
                'a1.start_time as actual_start_time',
                'a1.end_time as actual_end_time',
                'a1.status'
            )
            ->leftJoin(config('alias.roo').' as a2','a1.operation_order_id','a2.id')
            ->leftJoin(config('alias.rwb').' as a3','a1.work_shift_id','a3.id')
            ->leftJoin(config('alias.rwm').' as a4','a3.id','a4.workbench_id')
            ->where([
                ['a1.work_station_time','=',$today],
                ['a4.code','=',$machine_no],
                ['a1.status','!=',2],
                ['a1.status','!=',1],
                ['a1.status','!=',3]

            ])
            ->get();

        return  response()->json(get_success_api_response($result));
    }

    public function saveWorkOrder(Request $request)
    {
        $input = $request->all();
        if(!isset($input['work_order_id'])) TEA('700','work_order_id');
        if(!isset($input['status'])) TEA('700','status');
        if(!isset($input['employee_no'])) TEA('700','employee_no');
        $data=[
            'status'=>$input['status'],
        ];
        $this->update($input['work_order_id'],$data);
        return response()->json(get_success_api_response([['work_order_id'=>$input['work_order_id']]]));

    }

    public function getAttributes($data)
    {
        $result = array();
        foreach ($data as $row){
            $tmp['material_no'] =  $row->item_no;
            $tmp['name'] =  $row->name;
            $tmp['drawings'] =  $row->drawings;
            $tmp['qty'] = $row->qty;
            foreach ($tmp['drawings'] as $a){
                //修改图纸特性格式 存drawings时转为json格式
                if($a->attributes=='[]') {
                    $a->attributes='';
                }else{
                    $a->attributes=json_decode($a->attributes);
                }
                 unset($a->material_id);
                 unset($a->image_name);
                 unset($a->ctime);
                 unset($a->code);
                 unset($a->creator_name);
                 unset($a->category_name);
                 unset($a->owner);
                 unset($a->category_id);
                 unset($a->image_orgin_name);
                 unset($a->image_name);
                 unset($a->group_name);
            }
            $tmp['operation_attributes'] = array();
            $tmp['material_attributes']  = array();
            $material_attributes = $row->material_attributes;
            foreach ($material_attributes as $material_attribute){
                if($material_attribute->is_view ==1){
                    $attribute = $material_attribute->name.':'.$material_attribute->value;
                    if(!empty($material_attribute->range)) $attribute .= $material_attribute->unit;
                    $tmp['material_attributes'][] = $attribute;
//                    $tmp['material_attributes'][$material_attribute->name]=$material_attribute->value.$material_attribute->unit;
                }
            }
            //将数组转为字符串
            if(!empty($tmp['material_attributes'])){
                $tmp['material_attributes']=implode(',',$tmp['material_attributes']);
            }else{
                $tmp['material_attributes']='';
            }
            $operation_attributes = $row->operation_attributes;
            foreach ($operation_attributes as $operation_attribute){
                if($operation_attribute->is_view ==1){
                    $attribute = $operation_attribute->name.':'.$operation_attribute->value;
                    if(!empty($operation_attribute->unit)) $attribute .= $operation_attribute->unit;
                    $tmp['operation_attributes'][] = $attribute;
                }
            }
            //将数组转为字符串
            if(!empty($tmp['operation_attributes'])) {
                $tmp['operation_attributes']=implode(',',$tmp['operation_attributes']);
            }else{
                $tmp['operation_attributes']='';
            }
            $result[] = $tmp;
        }
        return $result;
    }
}