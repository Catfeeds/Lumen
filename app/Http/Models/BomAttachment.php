<?php
/**
 * Created by PhpStorm.
 * User: sam
 * Date: 17/12/20
 * Time: 下午17:32
 */

namespace App\Http\Models;//定义命名空间
use App\Libraries\Trace;
use Illuminate\Support\Facades\DB;//引入DB操作类

/**
 * bom附件
 * @author  sam.shan  <sam.shan@ruis-ims.cn>
 * @time    2017年09月28日 16:01
 */
class BomAttachment extends Base
{

    public function __construct()
    {
       parent::__construct();
       $this->table=config('alias.rba');
    }


    /**
     * bom中添加附件
     * @param $add_set
     * @param $bom_id
     * @param $input_ref_arr
     * @throws \App\Exceptions\ApiException
     * @author  sam.shan   <sam.shan@ruis-ims.cn>
     */
    public function  addSet($add_set,$bom_id,$input_ref_arr,$creator_id)
    {

        foreach ($add_set as $key => $value) {
            if(empty($value)) continue;
            $bool=DB::table($this->table)->insert(
                [
                    'bom_id'=>$bom_id,
                    'attachment_id'=>$value,
                    'comment'=>isset($input_ref_arr[$value]['comment'])?$input_ref_arr[$value]['comment']:'',
                ]
            );
            if(empty($bool)) TEA('806');
            //操作日志
            $attachment=$this->getRecordById($value,['filename','path','extension'],config('alias.attachment'));
            $events=[
                'field'=>'attachment_id',
                'comment'=>'附件',
                'action'=>'add',
                'extra'=>$attachment,
                'desc'=>'添加附件['.$attachment->filename.']',
            ];
            Trace::save(config('alias.rb'),$bom_id,$creator_id,$events);

        }
    }

    /**
     * bom中删除附件
     * @param $del_set
     * @param $bom_id
     * @param $db_ref_arr
     * @throws \App\Exceptions\ApiException
     * @author sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function  delSet($del_set,$bom_id,$db_ref_arr,$creator_id)
    {

        foreach ($del_set as $key => $value) {
            if(empty($value)) continue;
            $num=DB::table($this->table)->where([['bom_id','=',$bom_id],['attachment_id','=',$value]])->delete();
            if($num===false) TEA('806');
            //操作日志
            $attachment=$this->getRecordById($value,['filename','path','extension'],config('alias.attachment'));
            $events=[
                'field'=>'attachment_id',
                'comment'=>'附件',
                'action'=>'delete',
                'extra'=>$attachment,
                'desc'=>'删除附件['.$attachment->filename.']',
            ];
            Trace::save(config('alias.rb'),$bom_id,$creator_id,$events);
        }

    }


    /**
     * bom中修改附件
     * @param $common_set
     * @param $bom_id
     * @param $db_ref_arr
     * @param $input_ref_arr
     * @throws \App\Exceptions\ApiException
     * @author  sam.shan <sam.shan@ruis-ims.cn>
     */
    public function  commonSet($common_set,$bom_id,$db_ref_arr,$input_ref_arr,$creator_id)
    {

        foreach($common_set as $key =>$value){
            if(empty($value)) continue;
            if($input_ref_arr[$value]['comment'] != $db_ref_arr[$value]){
                $upd=DB::table($this->table)
                    ->where('bom_id',$bom_id)
                    ->where('attachment_id',$value)
                    ->update(['comment'=>$input_ref_arr[$value]['comment']]);
                if($upd===false) TEA('806');

                //操作日志
                $attachment=$this->getRecordById($value,['filename','path','extension'],config('alias.attachment'));
                $events=[
                    'field'=>'comment',
                    'comment'=>'附件备注',
                    'from'=>$db_ref_arr[$value],
                    'to'=>$input_ref_arr[$value]['comment'],
                    'action'=>'update',
                    'extra'=>$attachment,
                    'desc'=>'将附件['.$attachment->filename.']的备注,从['.$db_ref_arr[$value].']改为['.$input_ref_arr[$value]['comment'].']',
                ];
                Trace::save(config('alias.rb'),$bom_id,$creator_id,$events);
            }

        }
    }








}