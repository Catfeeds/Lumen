<?php
/**
 * Created by PhpStorm.
 * User: sam
 * Date: 17/12/08
 * Time: 下午15:26
 */

namespace App\Http\Models\Material;//定义命名空间
use App\Http\Models\Base;
use Illuminate\Support\Facades\DB;//引入DB操作类
use App\Libraries\Trace;

/**
 * 物料附件
 * @author  sam.shan  <sam.shan@ruis-ims.cn>
 * @time    2017年09月28日 16:01
 */
class MaterialAttachment extends Base
{

    public function __construct()
    {
       parent::__construct();
       $this->table=config('alias.rma');
    }


    /**
     * 物料中添加附件
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
                    'attachment_id'=>$value,
                    'comment'=>isset($input_ref_arr[$value]['comment'])?$input_ref_arr[$value]['comment']:'',
                ]
            );
            if(empty($bool)) TEA('806');
            //操作日志
            $attachment=$this->getRecordById($value,['filename','path','extension'],config('alias.attachment'));
//            $material = $this->getRecordById($material_id,['name'],config('alias.rm'));
            $events=[
                'field'=>'attachment_id',
                'comment'=>'附件',
                'action'=>'add',
                'extra'=>$attachment,
                'desc'=>'给物料添加附件['.$attachment->filename.']',
            ];
            Trace::save(config('alias.rm'),$material_id,$creator_id,$events);
        }
    }

    /**
     * 物料中删除附件
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
            $num=DB::table($this->table)->where([['material_id','=',$material_id],['attachment_id','=',$value]])->delete();
            if($num===false) TEA('806');
            //操作日志
            $attachment=$this->getRecordById($value,['filename','path','extension'],config('alias.attachment'));
//            $material = $this->getRecordById($material_id,['name'],config('alias.rm'));
            $events=[
                'field'=>'attachment_id',
                'comment'=>'附件',
                'action'=>'delete',
                'extra'=>$attachment,
                'desc'=>'删除物料的附件['.$attachment->filename.']',
            ];
            Trace::save(config('alias.rm'),$material_id,$creator_id,$events);
        }


    }


    /**
     * 物料中修改附件
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
                    ->where('attachment_id',$value)
                    ->update(['comment'=>$input_ref_arr[$value]['comment']]);
                if($upd===false) TEA('806');
                //操作日志
                $attachment=$this->getRecordById($value,['filename'],config('alias.attachment'));
//                $material = $this->getRecordById($material_id,['name'],config('alias.rm'));
                $events=[
                    'action'=>'update',
                    'desc'=>'把物料的附件['.$attachment->filename.']的注释['.$db_ref_arr[$value].']修改为['.$input_ref_arr[$value]['comment'].']',
                ];
                Trace::save(config('alias.rm'),$material_id,$creator_id,$events);
            }

        }
    }








}