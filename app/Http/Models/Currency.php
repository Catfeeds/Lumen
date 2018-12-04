<?php
/**
 * Created by PhpStorm.
 * User: xujian
 * Date: 17/10/21
 * Time: 下午15:28
 */

namespace App\Http\Models;//定义命名空间
use Illuminate\Support\Facades\DB;//引入DB操作类

/**
 * 货币单位
 * @author  xujian
 * @time    2017年10月21日 15:28
 */
class Currency extends Base
{
    public function __construct()
    {
       $this->table='currency';
    }

    /**
     * 获取货币单位列表
     * @param $input array  input数组
     * @return array
     * @author xujian
     */
    public function getCurrencyList()
    {
        $obj_list = DB::table($this->table)->orderBy('label','asc')->select('id','key','label','is_default','is_activated','description')->get();
        return $obj_list;
    }
}