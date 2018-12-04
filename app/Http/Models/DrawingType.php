<?php

namespace App\Http\Models;
use Illuminate\Support\Facades\DB;//引入DB操作类


/**
 * 物料分类数据操作类
 * @author  sam.shan  <sam.shan@ruis-ims.cn>
 * @time    2017年09月15日08:46:14
 */
class DrawingType extends  Base
{
    public function __construct()
    {
        $this->table='drawing_type';
    }



    /**
     * 获取所有的图纸类型列表
     * @return array  返回数组对象集合
     */
    public function getDrawingTypeList()
    {
        $obj_list=DB::table($this->table)
            ->select('id as drawing_type_id','name','code')
            ->orderby('id','desc')->get();
        return $obj_list;
    }








}