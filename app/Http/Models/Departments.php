<?php 
/**
 * Created by Sublime.
 * User: liming
 * Date: 17/10/27
 */
namespace App\Http\Models;//定义命名空间
use Illuminate\Support\Facades\DB;//引入DB操作类

class Departments extends  Base
{
	public function __construct()
    {
        $this->table='department';
    }

    /**
     * 获取部门列表
     * @return array  返回数组对象集合
     */
    public function getDepartmentsList($input)
    {
        $obj_list=DB::table($this->table)->select('id','name','abbreviation')->get();
        return $obj_list;
    }
}
