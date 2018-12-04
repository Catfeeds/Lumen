<?php
/**
 * MongoDB 模型基类
 * User: ruiyanchao
 * Date: 2017/10/19
 * Time: 上午8:11
 */

namespace App\Http\Models\Mongo;
use Illuminate\Support\Facades\DB;//引入DB操作类
/**
 * 数据操作类Base
 * @author  rick  <rick@ruis-ims.cn>
 * @time    2017年10月19日08:12:44
 */
class Base
{
    /**
     * 与模型关联的数据表全名
     * @var string
     */
    protected $table;

    /**
     * 与模型连接的数据库配置
     * @var string
     */
    protected $connection;


}
