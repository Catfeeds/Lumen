<?php 
/**
 * Created by Sublime.
 * User: liming
 * Date: 17/10/24
 */
namespace App\Http\Models;//定义命名空间
use Illuminate\Support\Facades\DB;//引入DB操作类

class Agentgroups extends  Base
{
	public function __construct()
    {
        $this->table='btransaction_agent_group';
    }

    /**
     * 获取采购组列表
     * @return array  返回数组对象集合
     */
    public function getAgentGroup($input)
    {
        $obj_list=DB::table($this->table)->where('role',$input['role'])->select('id','name','role','description')->get();
        return $obj_list;
    }

}
