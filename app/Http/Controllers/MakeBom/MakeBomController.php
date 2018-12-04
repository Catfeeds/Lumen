<?php
/**
 * Created by PhpStorm.
 * User: haoziye
 * Date: 2018/9/20
 * Time: 下午1:20
 */
namespace App\Http\Controllers\MakeBom;

use App\Http\Controllers\Controller;
use App\Http\Models\MakeBom\MakeBom;
use Illuminate\Http\Request;

class MakeBomController extends Controller{

    public function __construct()
    {
        parent::__construct();
        if(empty($this->model)) $this->model = new MakeBom();
    }

//region 增

    /**
     * 创建制造bom
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function createMakeBom(Request $request){
        $bom_id = $request->input('bom_id');
        if(empty($bom_id)) TEA('700','bom_id');
        $this->model->createMakeBom($bom_id);
        return response()->json(get_success_api_response(200));
    }

//endregion
}