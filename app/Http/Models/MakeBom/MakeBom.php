<?php
/**
 * Created by PhpStorm.
 * User: haoziye
 * Date: 2018/9/17
 * Time: 下午6:38
 */
namespace App\Http\Models\MakeBom;

use App\Http\Models\Base;
use App\Http\Models\Encoding\EncodingSetting;
use Illuminate\Support\Facades\DB;

class MakeBom extends Base{

    public function __construct()
    {
        parent::__construct();
    }

//region 增

    /**
     * 创建制造bom
     * @param $bom_id
     */
    public function createMakeBom($bom_id){
        $has = $this->isExisted([['id','=',$bom_id],['status','=',1]],config('alias.rb'));
        if(!$has) TEA('1700');
        try{
            DB::connection()->beginTransaction();
            //复制bom出来
            $make_bom_id = $this->createMakeBomBase($bom_id);
            //复制bom的子项
            $this->createMakeBomItem($bom_id,$make_bom_id);
            //复制bom附件
            $this->createMakeBomAttachment($bom_id,$make_bom_id);
            //复制工艺文件
            $this->createMakeBomRouting($bom_id,$make_bom_id);
        }catch (\ApiException $e){
            DB::connection()->rollback();
            TEA($e->getCode());
        }
        DB::connection()->commit();

    }

    /**
     * 添加制造bom主表信息
     * @param $bom_id
     * @return mixed
     * @throws \App\Exceptions\ApiException
     */
    public function createMakeBomBase($bom_id){
        $bom = DB::table(config('alias.rb'))->where('id',$bom_id)->first();
        $codeDao = new EncodingSetting();
        $make_bom_code = $codeDao->get(['type'=>10,'type_code'=>'']);
        $codeDao->useEncoding(10,$make_bom_code['code']);
        $make_bom_data = [
            'code'=>$make_bom_code['code'],
            'bom_id'=>$bom_id,
            'bom_code'=>$bom->code,
            'bom_name'=>$bom->name,
            'source_version'=>$bom->version,
            'version_description'=>$bom->version_description,
            'material_id'=>$bom->material_id,
            'bom_group_id'=>$bom->bom_group_id,
            'qty'=>$bom->qty,
            'loss_rate'=>$bom->loss_rate,
            'description'=>$bom->description,
            'creator_id'=>$bom->creator_id,
            'mtime'=>time(),
            'operation_id'=>$bom->operation_id,
            'operation_ability'=>$bom->operation_ability,
            'label'=>$bom->label,
            'ctime'=>$bom->ctime,
            'company_id'=>(!empty(session('administrator')->company_id)) ? session('administrator')->company_id: 0,
            'factory_id'=>(!empty(session('administrator')->factory_id)) ? session('administrator')->factory_id : 0,
            'bom_no'=>$bom->bom_no,
            'bom_sap_desc'=>$bom->bom_sap_desc,
            'BMEIN'=>$bom->BMEIN,
            'STLAN'=>$bom->STLAN,
            'from'=>$bom->from,
        ];
        $id = DB::table(config('alias.rmkb'))->insertGetId($make_bom_data);
        if(empty($id)) TEA('802');
        return $id;
    }

    /**
     * 从常规bom复制子项到制造bom
     * @param $bom_id 常规bom的id
     * @param $make_bom_id 新增制造bom的id
     */
    public function createMakeBomItem($bom_id,$make_bom_id){
        //找到常规bom子项
        $item_list = DB::table(config('alias.rbi'))->where('bom_id',$bom_id)->get();
        //以子项id做键组合下
        $need_insert_item_list = [];
        foreach ($item_list as $k=>$v){
            if(empty($v)) continue;
            $need_insert_item_list[$v->id] = $v;
        }
        //找到子项的阶梯用量
        $item_level_list = DB::table(config('alias.rbiql'))->whereIn('bom_item_id',array_keys($need_insert_item_list))->get();
        //把阶梯用量映射进子项中
        foreach ($item_level_list as $k=>$v){
            if(empty($v)) continue;
            $need_insert_item_list[$v->bom_item_id]->qty_level[] = [
                'parent_min_qty'=>$v->parent_min_qty,
                'qty'=>$v->qty,
            ];
        }
        $need_insert_item_level_list = [];
        //添加制造bom子项
        foreach ($need_insert_item_list as $k=>$v){
            if(empty($v)) continue;
            $data = [
                'make_bom_id'=>$make_bom_id,
                'parent_id'=>$v->parent_id,
                'bom_material_id'=>$v->bom_material_id,
                'material_id'=>$v->material_id,
                'loss_rate'=>$v->loss_rate,
                'is_assembly'=>$v->is_assembly,
                'not_accurate'=>$v->not_accurate,
                'comment'=>$v->comment,
                'priority'=>$v->priority,
                'rank'=>$v->rank,
                'total_consume'=>$v->total_consume,
                'version'=>$v->version,
                'usage_number'=>$v->usage_number,
                'POSNR'=>$v->POSNR,
                'POSTP'=>$v->POSTP,
                'MEINS'=>$v->MEINS,
                'from'=>$v->from,
                'bom_no'=>$v->bom_no,
                'AENNR'=>$v->AENNR,
                'DATUV'=>$v->DATUV,
                'DATUB'=>$v->DATUB,
            ];
            $insert_id = DB::table(config('alias.rmbi'))->insertGetId($data);
            if(!empty($v->qty_level)){
                foreach ($v->qty_level as $j=>$w){
                    $need_insert_item_level_list[] = [
                        'make_bom_item_id'=>$insert_id,
                        'parent_min_qty'=>$w['parent_min_qty'],
                        'qty'=>$w['qty']
                    ];
                }
            }
        }
        //添加制造bom子项的阶梯用量
        if(!empty($need_insert_item_level_list)){
            $res = DB::table(config('alias.rmbiql'))->insert($need_insert_item_level_list);
            if(!$res) TEA('802');
        }
    }

    /**
     * 从常规bom添加制造bom的附件
     * @param $bom_id
     * @param $make_bom_id
     * @throws \App\Exceptions\ApiException
     */
    public function createMakeBomAttachment($bom_id,$make_bom_id){
        //找到之前的常规bom的附件
        $attachment_list = DB::table(config('alias.rba'))->where('bom_id',$bom_id)->get();
        //添加制造的bom的附件
        $need_insert_attachment = [];
        foreach ($attachment_list as $k=>$v){
            if(empty($v)) continue;
            $need_insert_attachment[] = [
                'make_bom_id'=>$make_bom_id,
                'attachment_id'=>$v['attachment_id'],
                'comment'=>$v['comment'],
            ];
        }
        $res = DB::table(config('alias.rmba'))->insert($need_insert_attachment);
        if(!$res) TEA('802');
    }

    /**
     * 从常规bom复制工艺文件到制造bom
     * @param $bom_id
     * @param $make_bom_id
     * @throws \App\Exceptions\ApiException
     */
    public function createMakeBomRouting($bom_id,$make_bom_id){
        //常规bom的工艺路线
        $bom_routings = DB::table(config('alias.rbr'))->where('bom_id','=',$bom_id)->get();
        $bom_routings_data = [];
        foreach ($bom_routings as $k=>$v){
            $bom_routings_data[] = [
                'make_bom_id'=>$make_bom_id,
                'routing_id'=>$v->routing_id,
                'is_default'=>$v->is_default,
                'factory_id'=>$v->factory_id
            ];
        }
        //常规bom的工艺路线信息
        $bomRouting_list = DB::table(config('alias.rbrb'))->where('bom_id','=',$bom_id)->get();
        foreach ($bomRouting_list as $k=>&$v){
            $v->item_info = DB::table(config('alias.rbri'))->where('bom_routing_base_id',$v->id)->get();
            $v->drawing = DB::table(config('alias.rbrd'))->where('bom_routing_base_id',$v->id)->get();
            $v->attachment = DB::table(config('alias.rbra'))->where('bom_routing_base_id',$v->id)->get();
            $v->workcenter = DB::table(config('alias.rbrw'))->where('bom_routing_base_id',$v->id)->get();
            $v->workHours = DB::table(config('alias.rimw'))->where('step_info_id',$v->id)->get();
        }
        try{
            DB::connection()->beginTransaction();
            //添加新bom的工艺流线
            $routings_res = DB::table(config('alias.rmbr'))->insert($bom_routings_data);
            $itemData = [];//工艺文件进出料
            $drawingData = [];//工艺文件的图片
            $attachmentData = [];//工艺文件的附件
            $workHour_data = [];//工时
            $workcenter = [];//工作中心
            foreach ($bomRouting_list as $k=>$v){
                $baseData = [
                    'routing_node_id'=>$v->routing_node_id,
                    'make_bom_id'=>$make_bom_id,
                    'comment'=>$v->comment,
                    'operation_ability_ids'=>$v->operation_ability_ids,
                    'practice_id'=>$v->practice_id,
                    'step_id'=>$v->step_id,
                    'operation_id'=>$v->operation_id,
                    'practice_work_hour'=>$v->practice_work_hour,
                    'is_start_or_end'=>$v->is_start_or_end,
                    'routing_id'=>$v->routing_id,
                    'index'=>$v->index,
                    'select_type'=>$v->select_type,
                    'old_description'=>$v->old_description,
                    'group_index'=>$v->group_index,
                    'material_category_id'=>$v->material_category_id,
                    'practice_step_order_id'=>$v->practice_step_order_id,
                ];
                $baseId = DB::table(config('alias.rmbrb'))->insertGetId($baseData);
                foreach ($v->item_info as $j=>$w){
                    $itemData[] = [
                        'material_id'=>$w->material_id,
                        'material_code'=>$w->material_code,
                        'use_num'=>$w->use_num,
                        'type'=>$w->type,
                        'make_bom_id'=>$w->bom_id,
                        'make_bom_routing_base_id'=>$baseId,
                        'material_category_id'=>$w->material_category_id,
                        'material_category_name'=>$w->material_category_name,
                        'material_name'=>$w->material_name,
                        'unit_id'=>$w->unit_id,
                        'unit_name'=>$w->unit_name,
                        'commercial'=>$w->commercial,
                        'step_path'=>$w->step_path,
                        'is_lzp'=>$w->is_lzp,
                        'routing_id'=>$w->routing_id,
                        'index'=>$w->index,
                        'desc'=>$w->desc,
                    ];
                }
                foreach ($v->drawing as $j=>$w){
                    $drawingData[] = [
                        'make_bom_routing_base_id'=>$baseId,
                        'drawing_id'=>$w->id,
                    ];
                }
                foreach ($v->attachment as $j=>$w){
                    $attachmentData[] = [
                        'make_bom_routing_base_id'=>$baseId,
                        'attachment_id'=>$w->id,
                        'comment'=>$w->comment,
                    ];
                }
                foreach ($v->workcenter as $j=>$w){
                    $workcenter[] = [
                        'make_bom_routing_base_id'=>$baseId,
                        'workcenter_id'=>$w->workcenter_id,
                    ];
                }
                foreach ($v->workHours as $k=>$v){
                    $workHour_data[] = [
                        'material_no'=>$v->material_no,
                        'material_category_id'=>$v->material_category_id,
                        'work_hours'=>$v->work_hours,
                        'operation_id'=>$v->operation_id,
                        'ctime'=>time(),
                        'mtime'=>time(),
                        'ability_id'=>$v->ability_id,
                        'material_id'=>$v->material_id,
                        'min_value'=>$v->min_value,
                        'max_value'=>$v->max_value,
                        'creator_id'=>!empty(session('administrator')->admin_id) ? (session('administrator')->admin_id) : 0,
                        'sample_hours'=>$v->sample_hours,
                        'step_info_id'=>$baseId,
                        'make_bom_id'=>$make_bom_id,
                        'routing_id'=>$v->routing_id,
                        'man_hours'=>$v->man_hours,
                    ];
                }
            }
            DB::table(config('alias.rmbri'))->insert($itemData);
            DB::table(config('alias.rmbrd'))->insert($drawingData);
            DB::table(config('alias.rmbra'))->insert($attachmentData);
            DB::table(config('alias.rmbw'))->insert($workHour_data);
            DB::table(config('alias.rmbrw'))->insert($workcenter);
        }catch(\ApiException $exception){
            DB::connection()->rollback();
            TEA($exception->getCode());
        }
        DB::connection()->commit();

    }

//endregion


//region

    public function get($id){

    }

//endregion
}