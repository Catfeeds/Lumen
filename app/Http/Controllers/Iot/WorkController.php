<?php
/**
 * 工单计算.
 * User: ruiyanchao
 * Date: 2017/10/19
 * Time: 下午5:53
 */

namespace App\Http\Controllers\Iot;//定义命名空间

use App\Http\Controllers\Controller;    //引入基础控制器类
use Illuminate\Http\Request;            //获取请求参数
use App\Http\Models\Mongo\WorkComplete;

class WorkController extends Controller
{
    private  $workComplete;
    public function __construct()
    {
        parent::__construct();
        if(empty($this->workComplete)) $this->workComplete=new WorkComplete();
    }

    public function index(Request $request)
    {
        $result   = $this->workComplete->getCompleteNum();
        $response =get_api_response('200');
        $response['results'] = $result;
        return  response()->json($response);
    }
}