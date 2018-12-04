<?php
/**
 * 删除某个key的时候触发的事件
 * @author   sam.shan  <sam.shan@ruis-ims.cn>
 * @time     2017年11月12日16:54:10
 */

namespace App\Listeners;

use Illuminate\Cache\Events\KeyForgotten;
use App\Libraries\Log4php;//引入Log4php操作类



class LogKeyForgotten
{

    /**
     * Handle the event.
     *
     * @param  KeyForgotten  $event
     * @return void
     */
    public function handle(KeyForgotten $event)
    {
        $log=sprintf('KeyForgotten:%s',$event->key);
        Log4php::debug($log);
    }
}



