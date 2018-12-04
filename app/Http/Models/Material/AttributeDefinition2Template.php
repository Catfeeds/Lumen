<?php
/**
 * Created by PhpStorm.
 * User: xujian
 * Date: 17/9/25
 * Time: 下午17:49
 */

namespace App\Http\Models\Material;//定义命名空间
use App\Http\Models\Base;
use Illuminate\Support\Facades\DB;//引入DB操作类

/**
 * 模板绑定参数操作类
 * @author  sam.shan@ruis-ims.cn
 * @time    2017年09月28日 17:28
 */
class AttributeDefinition2Template extends Base
{


    public function __construct()
    {
        parent::__construct();
        $this->table=config('alias.ad2t');
    }


    /**
     * 物料模板中批量添加物料属性
     * @param $add_set
     * @param $template_id
     * @param $category_id
     * @param $input_ref_arr
     * @throws \App\Exceptions\ApiException
     * @author  sam.shan   <sam.shan@ruis-ims.cn>
     */
    public function addSet($add_set,$template_id,$category_id,$input_ref_arr)
    {

        foreach ($add_set as $key => $value) {
                if(empty($value)) continue;
                $bool=DB::table($this->table)->insert(
                    [
                     'template_id'=>$template_id,
                     'attribute_definition_id'=>$value,
                     'category_id'=>$category_id,
                     'is_extends'=>isset($input_ref_arr[$value]['is_extends'])?$input_ref_arr[$value]['is_extends']:0,
                    ]
                   );
                if(empty($bool)) TEA('806');
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
    public function  delSet($del_set,$template_id,$db_ref_arr)
    {

        foreach ($del_set as $key => $value) {
             if(empty($value)) continue;
            //要删除的属性是继承属性,没被物料使用,且没有模板基于当前模板才可以删除,切记不要漏掉任何一个逻辑
            //要删除的属性非继承属性,则没被物料使用就可以删除了

            //1.不管模板中的属性是继承的还不是继承的,只要被物料使用了,都不可以删除了
            $has=DB::table(config('alias.rm').' as rm')
                     ->join(config('alias.ma').' as ma','rm.id','=','ma.material_id')
                     ->where('rm.template_id',$template_id)
                     ->count();
            if($has) TEA('4010');
            //2.被继承的继承属性不可以删除
            if($db_ref_arr[$value]==1){
                $has=DB::table(config('alias.template'))->where('parent_id',$template_id)->count();
                if($has)  TEA('4011');
            }
            // 3.可以毫不顾忌的移除了
            $num=DB::table($this->table)->where([['template_id','=',$template_id],['attribute_definition_id','=',$value]])->delete();
            if($num===false) TEA('806');
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
    public function  commonSet($common_set,$template_id,$db_ref_arr,$input_ref_arr)
    {

        foreach($common_set as $key =>$value){
                if(empty($value)) continue;
                if($input_ref_arr[$value]['is_extends'] != $db_ref_arr[$value]){
                    //要编辑的属性是继承属性,且没有模板基于当前模板才可以编辑
                    //要编辑的属性是非继承属性,则可以编辑



                    //当属性由继承修改为非继承时候需要判断
                    if($db_ref_arr[$value]==1){

                        //1.被使用的属性也不可以修改
                        $has=DB::table(config('alias.rm').' as rm')
                            ->join(config('alias.ma').' as ma','rm.id','=','ma.material_id')
                            ->where('rm.template_id',$template_id)
                            ->count();
                        if($has)  TEA('4013');
                        //2.被继承的属性不可以修改为非继承性
                        $has=DB::table($this->tTable)->where('parent_id',$template_id)->count();
                        if($has)  TEA('4012');
                    }

                    $upd=DB::table($this->table)
                                 ->where('template_id',$template_id)
                                 ->where('attribute_definition_id',$value)
                                 ->update(['is_extends'=>$input_ref_arr[$value]['is_extends']]);
                    if($upd===false) TEA('806');
                }

            }
    }













}