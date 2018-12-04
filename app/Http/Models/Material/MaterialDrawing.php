<?php
/**
 * Created by PhpStorm.
 * User: sam
 * Date: 17/12/08
 * Time: 下午15:26
 */

namespace App\Http\Models\Material;//定义命名空间
use App\Http\Models\Base;
use App\Libraries\Trace;
use Illuminate\Support\Facades\DB;//引入DB操作类

/**
 * 物料关联图纸
 * @author  sam.shan  <sam.shan@ruis-ims.cn>
 * @time    2017年09月28日 16:01
 */
class MaterialDrawing extends Base
{

    public function __construct()
    {
        parent::__construct();
        $this->table=config('alias.rmd');
    }

    /**
     * 物料中添加图纸
     * @param $add_set
     * @param $material_id
     * @param $input_ref_arr
     * @throws \App\Exceptions\ApiException
     * @author  sam.shan   <sam.shan@ruis-ims.cn>
     */
    public function  addSet($add_set,$material_id,$input_ref_arr,$creator_id)
    {
        foreach ($add_set as $key => $value) {
            if(empty($value)) continue;
            $bool=DB::table($this->table)->insert(
                [
                    'material_id'=>$material_id,
                    'drawing_id'=>$value,
                    'comment'=>isset($input_ref_arr[$value]['comment'])?$input_ref_arr[$value]['comment']:'',
                ]
            );
            if(empty($bool)) TEA('806');
            //操作日志
            $drawing = $this->getRecordById($value,['image_orgin_name','image_name','image_path',],config('alias.drawing'));
//            $material = $this->getRecordById($material_id,['name'],config('alias.rm'));
            $events = [
                'field'=>'drawing_id',
                'comment'=>'图纸',
                'extra'=>$drawing,
                'action'=>'add',
                'desc'=>'给物料关联图纸['.$drawing->image_name.']',
            ];
            Trace::save(config('alias.rm'),$material_id,$creator_id,$events);
        }
    }

    /**
     * 物料模板中批量删除物料属性
     * @param $del_set
     * @param $template_id
     * @param $db_ref_arr
     * @throws \App\Exceptions\ApiException
     * @author sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function  delSet($del_set,$material_id,$db_ref_arr,$creator_id)
    {

        foreach ($del_set as $key => $value) {
            if(empty($value)) continue;
            $num=DB::table($this->table)->where([['material_id','=',$material_id],['drawing_id','=',$value]])->delete();
            if($num===false) TEA('806');
            //操作日志
            $drawing = $this->getRecordById($value,['image_orgin_name','image_name','image_path',],config('alias.drawing'));
//            $material = $this->getRecordById($material_id,['name'],config('alias.rm'));
            $events = [
                'field'=>'drawing_id',
                'comment'=>'图纸',
                'extra'=>$drawing,
                'action'=>'delete',
                'desc'=>'删除物料关联图纸['.$drawing->image_name.']',
            ];
            Trace::save(config('alias.rm'),$material_id,$creator_id,$events);
        }


    }


    /**
     * 物料模板中批量修改物料属性
     * @param $common_set
     * @param $template_id
     * @param $db_ref_arr
     * @param $input_ref_arr
     * @throws \App\Exceptions\ApiException
     * @author  sam.shan <sam.shan@ruis-ims.cn>
     */
    public function  commonSet($common_set,$material_id,$db_ref_arr,$input_ref_arr,$creator_id)
    {

        foreach($common_set as $key =>$value){
            if(empty($value)) continue;
            if($input_ref_arr[$value]['comment'] != $db_ref_arr[$value]){

                $upd=DB::table($this->table)
                    ->where('material_id',$material_id)
                    ->where('drawing_id',$value)
                    ->update(['comment'=>$input_ref_arr[$value]['comment']]);
                if($upd===false) TEA('806');
                //操作日志
                $drawing = $this->getRecordById($value,['image_name'],config('alias.drawing'));
//                $material = $this->getRecordById($material_id,['name'],config('alias.rm'));
                $events = [
                    'action'=>'update',
                    'desc'=>'把物料关联图纸['.$drawing->image_name.']的注释['.$db_ref_arr[$value].']修改为['.$input_ref_arr[$value]['comment'].']',
                ];
                Trace::save(config('alias.rm'),$material_id,$creator_id,$events);
            }

        }
    }












}


