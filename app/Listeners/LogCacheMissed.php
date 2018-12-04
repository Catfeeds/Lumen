<?php
/**
 * 未命中缓存时候触发的事件
 * @author   sam.shan  <sam.shan@ruis-ims.cn>
 * @time     2017年11月12日16:56:09
 */

namespace App\Listeners;

use Illuminate\Cache\Events\CacheMissed;
use App\Libraries\Log4php;//引入Log4php操作类



class LogCacheMissed
{

    /**
     * Handle the event.
     *
     * @param  CacheMissed  $event
     * @return void
     */
    public function handle(CacheMissed $event)
    {
        $log=sprintf('CacheMissed-%s',$event->key);
        Log4php::debug($log);
    }
}



