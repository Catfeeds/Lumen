<?php
/**
 * Created by PhpStorm.
 * User: xujian
 * Date: 17/10/23
 * Time: 下午13:04
 */

namespace App\Http\Models;//定义命名空间
use Illuminate\Support\Facades\DB;//引入DB操作类

/**
 * 用户表
 * @author  xujian
 * @time    2017年10月23日 13:04
 */
class Tag extends Base
{
    public function __construct()
    {
       $this->table='tag';
    }
}