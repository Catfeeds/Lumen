<?php
/**
 * 用来测试物料功能模块的,可以任意写,不需要规范化,注不注释无所谓的
 */

namespace App\Http\Controllers\Test;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Http\Models\MaterialCategories;//引入物料分类处理类
use App\Libraries\Tree;//引入无限极分类操作类



class TestMaterialController extends  Controller
{


    function displayCate(Request $request)
    {

        $id=$request->input('id',0);
        $selected=$request->input('selected',1);


        $m=new MaterialCategories;
        //这里可以被下面注释的两句所替代
        $tree_list=$m->getTreeList($id);
        //$obj_list=$m->getCategoriesList();
        //$tree_list=Tree::findDescendants($obj_list);

        $str="<select name='cate'>";
        foreach ($tree_list as $key => $value) {
            $formatted_name=str_repeat('&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;',$value->level).'|-'.$value->name;
            $selectedstr='';
            if($value->id==$selected) $selectedstr="selected";
            $str.="<option {$selectedstr} value='{$value->id}'>{$formatted_name}</option>";
        }
        $str.='</select>';

        pd($str);
    }










}