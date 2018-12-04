<?php
/**
 * Created by PhpStorm.
 * User: haoziye
 * Date: 2018/1/30
 * Time: 下午1:22
 */
namespace App\Http\Controllers\Mes;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Http\Models\ImageAttribute;

class ImageAttributeController extends Controller{

    public function __construct()
    {
        parent::__construct();
        if(empty($this->model)) $this->model=new ImageAttribute();
    }

//region 检

    /**
     * 添加时候的检测唯一性
     */
    public function unique(Request $request){
        //获取参数并过滤
        $input=$request->all();
        trim_strings($input);
        $where=$this->getUniqueExistWhere($input);
        $input['has']=$this->model->isExisted($where);
        //拼接返回值
        $results=$this->getUniqueResponse($input);
        return  response()->json(get_success_api_response($results));
    }

//endregion
}