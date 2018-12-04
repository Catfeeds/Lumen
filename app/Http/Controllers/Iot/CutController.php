<?php
/**
 * 仓库统计
 * User: ruiyanchao
 * Date: 2017/10/19
 * Time: 下午4:33
 */

namespace App\Http\Controllers\Iot;//定义命名空间

use App\Http\Controllers\Controller;    //引入基础控制器类
use Illuminate\Http\Request;            //获取请求参数
use App\Http\Models\Mongo\WorkCut;

class CutController extends Controller
{
    private  $workCut;
    public function __construct()
    {
        parent::__construct();
        if(empty($this->workCut)) $this->workCut=new workCut();
    }

    public function index(Request $request)
    {
        $result   = $this->workCut->getCompleteNum();
        $response =get_api_response('200');
        $response['results'] = $result;
        return  response()->json($response);
    }
}