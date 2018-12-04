<?php 
/**
 * Created by Sublime.
 * User: liming
 * Date: 17/11/2
 */
namespace App\Http\Models;//定义命名空间
use Illuminate\Support\Facades\DB;//引入DB操作类

class Plants extends  Base
{
	public function __construct()
    {
        $this->table='ruis_plant';
    }

    /**
     * 获取部门列表
     * @return array  返回数组对象集合
     */
    public function getPlantsList($input)
    {
        $obj_list=DB::table($this->table)->select('id','code','name','address')->get();
        return $obj_list;
    }
}