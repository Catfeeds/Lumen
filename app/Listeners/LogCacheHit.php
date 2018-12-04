<?php
/**
 * 命中缓存时候触发的事件
 * @author   sam.shan  <sam.shan@ruis-ims.cn>
 * @time     2017年11月12日16:56:09
 */


namespace App\Listeners;
use Illuminate\Cache\Events\CacheHit;
use App\Libraries\Log4php;//引入Log4php操作类



class LogCacheHit
{

    /**
     * Handle the event.
     *
     * @param  CacheHit  $event
     * @return void
     */
    public function handle(CacheHit $event)
    {
        $log=sprintf('CacheHit:%s=>%s',$event->key,$event->value);
        Log4php::debug($log);

    }
}



