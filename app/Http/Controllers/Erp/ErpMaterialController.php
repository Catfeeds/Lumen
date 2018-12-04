<?php
/**
 * Created by PhpStorm.
 * User: Xin
 * Date: 2018-05-07
 * Time: 14:55
 */

namespace App\Http\Controllers\Erp;

use Laravel\Lumen\Routing\Controller as BaseController;//引入Lumen底层控制器
use Illuminate\Http\Request;
use App\Http\Models\Erp\ErpMaterial;

class ErpMaterialController extends BaseController
{

    protected $ErpModel;
    protected $model;

    public function __construct()
    {
        $this->model = new ErpMaterial();

    }

    public function material(Request $request)
    {
        $input = $request->all();
        $results=$this->model->material($input['production_code']);
        return get_success_api_response($results);
    }
    public function implodeMaterial(Request $request){
        $input = $request->all();
        $results=$this->model->implodeMaterial($input);
        return get_success_api_response($results);
    }

}