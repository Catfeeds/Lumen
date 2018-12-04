<?php

namespace App\Providers;

use Laravel\Lumen\Providers\EventServiceProvider as ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    /**
     * The event listener mappings for the application.
     *
     * @var array
     */
    protected $listen = [
//        'App\Events\SomeEvent' => [
//            'App\Listeners\EventListener',
//        ],

        //sql查询触发的事件
        'Illuminate\Database\Events\QueryExecuted' => [
            'App\Listeners\QueryListener'
        ],

        //缓存系统触发的事件

        'Illuminate\Cache\Events\CacheHit' => [
          'App\Listeners\LogCacheHit',
        ],

       'Illuminate\Cache\Events\CacheMissed' => [
         'App\Listeners\LogCacheMissed',
        ],

       'Illuminate\Cache\Events\KeyForgotten' => [
        'App\Listeners\LogKeyForgotten',
        ],

       'Illuminate\Cache\Events\KeyWritten' => [
        'App\Listeners\LogKeyWritten',
        ],

    ];
}
