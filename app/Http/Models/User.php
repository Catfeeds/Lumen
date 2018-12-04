<?php
/**
 * Created by PhpStorm.
 * User: xujian
 * Date: 17/10/21
 * Time: 下午15:07
 */

namespace App\Http\Models;//定义命名空间
use Illuminate\Support\Facades\DB;//引入DB操作类
use Illuminate\Support\Facades\Cache;

/**
 * 用户表
 * @author  xujian
 * @time    2017年10月21日 15:07
 */
class User extends Base
{
    /**
     * 当前模型对应的表名
     * @var string
     */
    protected  $table='user';

    /**
     * 从cache中获得登录人的账号，并根据账号得到登录人的id
     * Q框架中保存的数据格式是：auth.token|s:16:"jian.xu|database";system.last_layout_url|N;system.current_layout_url|s:24:"!people/profile/index.44";
     * @param $cookie 保存在cookie中的key值
     * @throws \ApiException
     * @author  xujian
     * @reviser  sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function getIdFromCache($cookie)
    {
        //windows电脑安装memcached的扩展比较复杂，所有在windows电脑测试的时候调用memcache进行测试
        //还原到服务器中再切换到memcached，memcached是memcache的一个扩展

            $value = Cache::store('memcached')->get($cookie);
            if (empty($value))  return false;
            //以'"'隔开作为分割字符
            $values = explode('"', $value);
            $loginToken = $values[1];//start_login    dh|database
            if($loginToken=='start_login')  return false;
            //通过登录的用户认证唯一标志，取得用户id
            $obj = DB::Table($this->table)->select('id')->where('token', '=', $loginToken)->first();
            return $obj->id;

    }






}