<?php
/**
 * 报警统计
 * User: ruiyanchao
 * Date: 2017/10/18
 * Time: 下午10:48
 */

namespace App\Http\Controllers\Iot;//定义命名空间

use App\Http\Controllers\Controller;//引入基础控制器类
use Illuminate\Http\Request;//获取请求参数
use App\Http\Models\Mongo\WorkAlarm;//自定义属性数据类型处理模型

class AlarmController extends Controller
{
    private  $workAlarm;
    public function __construct()
    {
        parent::__construct();
        if(empty($this->workAlarm)) $this->workAlarm=new WorkAlarm();
    }

    /**
     * 报警统计条形图数据
     * @return string
     * @author  rick
     */
    public function index(Request $request)
    {
        $result   = $this->workAlarm->getAlarmCount();
        $response =get_api_response('200');
        $response['results'] = $result;
        return  response()->json($response);
    }

    /**
     * 报警统计饼图数据
     * @return string
     * @author  rick
     */
    public function handleResult(Request $request)
    {
        $deal    = $this->workAlarm->getByStatus(1);
        #TODO 先做了假数据
        //$unDeal  = $this->workAlarm->getByStatus(1);
        //$dealing = $this->workAlarm->getByStatus(1);
        $unDeal  = 10;
        $dealing = 26;
        $result = [
            ['value'=>$unDeal+$dealing,'name'=>"未完成"],
            ['value'=>$deal,'name'=>"已完成"]
            ];
        $response =get_api_response('200');
        $response['results'] = $result;
        return  response()->json($response);

    }
}