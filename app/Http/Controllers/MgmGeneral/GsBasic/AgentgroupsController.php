<?php 
/**
 * 模板管理器
 * @author  liming
 * @time    2017年10月20日
 */
namespace App\Http\Controllers\MgmGeneral\GsBasic;//定义命名空间
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Libraries\Tree;//引入无限极分类操作类
use App\Http\Models\Agentgroups;//引入采购销售分组类


class AgentgroupsController extends Controller
{
	/**
     * 构造方法初始化操作类
     */
    public function __construct()
    {
      parent::__construct();
      if(empty($this->model)) $this->model=new Agentgroups();
    }

    /**
	 * 获取采购组、销售组列表
	 * @param Request $request
	 * @return  string   返回json
	 * @author  liming
	 */
    public function  select(Request $request)
    {
        //过滤,判断并提取所有的参数
        $input=$request->all();
        //role判断
        if(empty($input['role'])) TEA('703','role');
        $obj_list=$this->model->getAgentGroup($input);
        $response=get_api_response('200');
        $response['results']=$obj_list;
        return  response()->json($response);
    }
}
