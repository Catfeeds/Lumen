<?php
/**
 * sql语句监听[从rick中直接复制过来的]
 * @author   sam.shan  <sam.shan@ruis-ims.cn>
 * @time     2017年09月17日11:23:34
 */

namespace App\Listeners;

use Illuminate\Database\Events\QueryExecuted;
//use Illuminate\Queue\InteractsWithQueue;
//use Illuminate\Contracts\Queue\ShouldQueue;
use App\Libraries\Log4php;//引入Log4php操作类



class QueryListener
{

    /**
     * Handle the event.
     *
     * @param  QueryExecuted  $event
     * @return void
     */
    public function handle(QueryExecuted $event)
    {
        $sql= vsprintf(str_replace("?", "'%s'", $event->sql), $event->bindings).' ['.$event->time.' ms] ';
        Log4php::debug($sql);

    }
}



