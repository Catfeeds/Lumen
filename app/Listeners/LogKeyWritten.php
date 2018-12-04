<?php
/**
 * 缓存写入时候触发的事件
 * @author   sam.shan  <sam.shan@ruis-ims.cn>
 * @time     2017年11月12日16:49:18
 */

namespace App\Listeners;

use Illuminate\Cache\Events\KeyWritten;
use App\Libraries\Log4php;//引入Log4php操作类



class LogKeyWritten
{

    /**
     * Handle the event.
     *
     * @param  KeyWritten  $event
     * @return void
     */
    public function handle(KeyWritten $event)
    {
        $log=sprintf('KeyWritten:%s=>%s=>%d minutes',$event->key,$event->value,$event->minutes);
        Log4php::debug($log);
    }
}



