<?php
/**
 * Created by PhpStorm.
 * User: Xiaoliang.Chen
 * Date: 2017/9/29
 * Time: 10:25
 */

namespace App\Http\Models;
use App\Http\Models\Base;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Exceptions\ApiException;
class OrderModel extends Base
{
    //获取订单列表
    /*
     * @param $page_num 页数
     */
    public function getOrder($page_num){
        //分页
        $page_size = 20;
        $result = array();
        $count = DB::table('work_order')->count('id');
        //总页数
        $page_total = ceil($count/$page_size);
        $limit = ($page_num-1)*$page_size;
        $sql = "select * from work_order where status in (1,4,31,19,34,32)  order By production_date desc limit  $limit , $page_size";



        $curr_day_orders =  DB::select($sql);

        foreach ($curr_day_orders as $curr_day_order){
            $tmp_emp = '';
            $tmp_incoming_material_no = '';
            $incoming_material_items = DB::table('raa_material_item')->where('owner_type','work_order')->where('owner_id',$curr_day_order->id)
                                        ->where('type',1)->get();

            foreach ($incoming_material_items as $incoming_material_item){

                //物料编码
                $item_no = DB::table('material')->where('id',$incoming_material_item->material_id)->first()->item_no;
                $tmp_incoming_material_no .= $item_no.",";
            }


            //获取计划数量，完成数量
            $output_material_items = DB::table('raa_material_item')->where('owner_type','work_order')->where('owner_id',$curr_day_order->id)
                                     ->where('type',2)->get();
            foreach ($output_material_items as $output_material_item){
                $el = new \stdClass();
                //获取订单号
                $order_no  = DB::table('production_order')->where('id',$curr_day_order->production_order_id)->first()->sales_order_code;
                $el->order_no = $order_no;
                $el->id = $curr_day_order->id;
                //面料编码
                $el->incoming_material_no = substr($tmp_incoming_material_no,0,-1);
                //半成品编号
                $tmp_semi_prod_measure = '';
                $bom_prods = DB::table('bom_prod')->where('production_order_id',$curr_day_order->production_order_id)->get();
                foreach ($bom_prods as $bom_prod){
                    //获取产品编码
                    $el->semi_finished_no  = $bom_prod->code;
                    //获取半成品尺寸
                    $materials = DB::table('material')->where('item_no',$bom_prod->code)->get();
                    $tmp_material_size = '';
                    foreach ($materials as $material){
                        //物料属性
                        $atts_template_material = DB::table('attribute_definition2template')->where('template_id',$material->template_id)
                                                  ->where('is_merge',1)->orderBy('index','asc')->get();

                        if(count($atts_template_material)>0){
                            foreach ($atts_template_material as $relation){
                                $material_attribute = DB::table('material_attribute')->where('material_id',$material->id)->where('r_definition_template_id',$relation->id)->first();
                                if(isset($material_attribute->value)&&$material_attribute->value!=0){

                                    $label = DB::table('attribute_definition')->where('id',$relation->attribute_definition_id)->first();
-                                   $tmp_semi_prod_measure .=  $label->label.":" . $material_attribute->value;

                                }

                            }
                        }
                    }
                }

                //半成品规格
                $el->measure = $tmp_semi_prod_measure;
                //计划开始时间
                $el->planned_date = date('Y/m/d',$curr_day_order->production_date);
                //完成情况
                $el->completon = '';
                //库位
                $el->storage_location_no = '';
                //入库时间
                $el->storage_date = '';
                //空白
                $el->blank = '';
                //外套加工商
                $el->overcoat_processor = '';                //内套加工商
                $el->innder_casing_processor = '';

                //出库数量
                $el->outbound_qty = '';

                //出库日期
                $el->outbound_date = '';

                //裁片退库数量
                $el->piece_back_qty = '';

                //货位
                $el->goods_allocation = '';

                //裁片退库时间
                $el->piece_back_date = '';

                //裁片尺寸
                $tmp_material_size = '';
                $template_id  = DB::table('material')->where('id',$output_material_item->material_id)->first()->template_id;
                $atts_template_material = DB::table('attribute_definition2template')->where('template_id',$template_id)
                                          ->where('is_merge',1)->orderBy('index','asc')->get();
                $material_id = DB::table('material')->where('id',$output_material_item->material_id)->first()->id;

                foreach ($atts_template_material as $relation){
                    $material_attribute = DB::table('material_attribute')->where('material_id',$material_id)->where('r_definition_template_id',$relation->id)->first();

                    if(isset($material_attribute->id)){

                        if($material_attribute->value!=0){
                            $label = DB::table('attribute_definition')->where('id',$relation->attribute_definition_id)->first();
                            $tmp_material_size.= $label->label.":".$material_attribute->value.",".'  ';
                        }
                    }
                }
                $el->piece_size = substr($tmp_material_size,0,-1);
                $item_no  =  DB::table('material')->where('id',$output_material_item->material_id)->first()->item_no;
                $el->piece_name = $item_no;
                //裁片计划数量
                $el->piece_qty = $output_material_item->qty;
                //获取实际完成数量
                $work_number = DB::table('work_order_group')->where('id',$curr_day_order->work_order_group_id)->first();
                $work_number = $work_number ? $work_number->number  : $curr_day_order->number;
                $work_order_piece = DB::table('bp_piece')->where('child_work_order_no',$curr_day_order->number)
                                    ->where("piece_no",$item_no)->get();
                $real_qty = 0;
                $tmp_emp = '';
                foreach ($work_order_piece as $v){
                    $real_qty += $v->real_piece_qty;
                    $tmp_emp = $v->employee_no;
                }
                //完成数量
                $el->finished_qty = $real_qty;
                //台板号(操作人)；
                $employees = explode(',', $tmp_emp);
                $tmp_str = '';
                foreach ($employees as $employee){
                    $emps  = DB::table('employee')->where('number',$employee)->get();
                    foreach ($emps as $emp){
                        $tmp_str .= $emp->surname . $emp->name . ',';
                    }
                }
                $el->status = '已入库';
                if($curr_day_order->status!=10){
                    $el->status = '未入库';
                }


                $el->wor_station_no = substr($tmp_str, 0, -1);
                //差异
                $el->quantity_variance = intval($el->finished_qty) - intval($el->piece_qty);
                array_push($result,$el);
            }
        }

        return array('paging'=>array(
            'page_size' => $page_size,
            'page_index' => $page_num,
            'total_records' => $count
        ));

    }
    //订单入库
    public function In_storage($input,$id){

        DB::beginTransaction();
        $result  = array();

        //查看info表是否有记录
        $item = DB::table('work_order_info')->where('work_order_id',$id)->first();
        try{
            DB::table('work_order')->where('id',$id)->update(['order_status'=>1]);
         //   if($item){
                //有则入库数量自增加
               // DB::update("update work_order_info set in_number+=".$input['in_number']." where work_order_id=".$id);
            //}else{
                //新增入库记录
                DB::table('work_order_info')->insert([
                    'work_order_id' => $id,
                    'in_storage_time'=> date('Y-m-d H:i:s'),//入库时间
                    'in_number'=> $input['in_number']  ,//入库数量
                ]);
         //   }
            DB::commit();

        }catch (ApiException $e){
            //回滚
            DB::rollBack();
            TEA($e->getCode());
        }

    }
}