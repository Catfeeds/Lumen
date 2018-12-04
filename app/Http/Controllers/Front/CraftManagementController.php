<?php


namespace App\Http\Controllers\Front;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;


/**
 * 工艺管理视图控制器
 * @author  sam.shan  <sam.shan@ruis-ims.cn>
 * @time    2018年01月09日09:27:25
 */
class CraftManagementController extends Controller
{







    /**
     * 工艺属性列表
     * @return   string   json
     * @author   sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function attributeIndex(Request  $request)
    {
        return view('craft_management.attribute_index');
    }
//endregion








}


