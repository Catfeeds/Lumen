<?php

namespace App\Http\Models;
use Illuminate\Support\Facades\DB;//引入DB操作类


/**
 * 图纸组数据操作类
 * @author  sam.shan  <sam.shan@ruis-ims.cn>
 * @time    2017年09月15日08:46:14
 */
class DrawingGroup extends  Base
{
    public function __construct()
    {
        $this->table='drawing_group';
    }

    /**
     * 根据图纸类型查看图纸分组[这个组是针对某类图纸划分的]
     * @param $drawing_type_id
     * @return mixed
     */
    public function getGroupListByType($drawing_type_id)
    {
        $obj_list=DB::table($this->table)
            ->select('name','code','id as drawing_group_id')
            ->where('type_id',$drawing_type_id)
            ->orderby('id','desc')
            ->get();
        return $obj_list;
    }




}