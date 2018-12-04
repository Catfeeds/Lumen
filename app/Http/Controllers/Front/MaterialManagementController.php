<?php


namespace App\Http\Controllers\Front;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;


/**
 * 物料管理视图控制器
 * @author  sam.shan  <sam.shan@ruis-ims.cn>
 * @time    2018年01月09日09:27:25
 */
class MaterialManagementController extends Controller
{



//region 物料基础信息定义

//region  物料属性



    /**
     * 物料属性列表
     * @return   string   json
     * @author   sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function attributeIndex(Request  $request)
    {
        return view('material_management.attribute_index');
    }
//endregion
//region  物料模板


    /**
     * 物料模板列表
     * @param Request $request
     * @return  string
     * @author  sam.shan  <sam.shan@ruis-ims.cn>
     */
    public  function templateIndex(Request $request)
    {
        return view('material_management.template_index');
    }


    /**
     * 添加物料模板
     * @param Request $request
     * @return  string
     * @author  sam.shan  <sam.shan@ruis-ims.cn>
     */
    public  function templateCreate(Request $request)
    {
        return view('material_management.template_form');
    }


    /**
     * 编辑物料模板
     * @param Request $request
     * @return  string
     * @author  sam.shan  <sam.shan@ruis-ims.cn>
     */
    public  function templateEdit(Request $request)
    {
        return view('material_management.template_form');
    }

    /**
     * 查看物料模板
     * @param Request $request
     * @return  string
     * @author  sam.shan  <sam.shan@ruis-ims.cn>
     */
    public  function templateView(Request $request)
    {
        return view('material_management.template_view');
    }


//endregion
//region  物料分类



    /**
     * 物料分类列表页面
     * @param Request $request
     * @return  string
     * @author  sam.shan  <sam.shan@ruis-ims.cn>
     */
    public  function categoryIndex(Request $request)
    {
        return view('material_management.category_index');
    }




//endregion
//endregion


//region 物料定义

    /**
     * 物料列表页面
     * @param Request $request
     * @return  string
     * @author  sam.shan  <sam.shan@ruis-ims.cn>
     */
    public  function materialIndex(Request $request)
    {
        return view('material_management.material_index');
    }

    /**
     * 添加物料
     * @param Request $request
     * @return  string
     * @author  sam.shan  <sam.shan@ruis-ims.cn>
     */
    public  function materialCreate(Request $request)
    {
        return view('material_management.material_form');
    }


    /**
     * 编辑物料
     * @param Request $request
     * @return  string
     * @author  sam.shan  <sam.shan@ruis-ims.cn>
     */
    public  function materialEdit(Request $request)
    {
        return view('material_management.material_form');
    }


    /**
     * 查看物料
     * @param Request $request
     * @return  string
     * @author  sam.shan  <sam.shan@ruis-ims.cn>
     */
    public  function materialView(Request $request)
    {
        return view('material_management.material_view');
    }





//endregion







}


