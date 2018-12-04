<?php


/**
 * Created by PhpStorm.
 * User: sam.shan
 * Date: 2017/11/16
 * Time: 18:56
 */

/*
|--------------------------------------------------------------------------
| 缓存驱动
|--------------------------------------------------------------------------
|@author  sam.shan   <sam.shan@ruis-ims.cn>
|注意
| 1.env有个bug,当常量MEMCACHED_HOST不存在的时候,底层默认就是取127.0.0.1了,而不会使用下面的env的第二个参数
| 2.redis的配置之所以可以单独拿出来,是因为redis除了可以当成缓存数据库来使用,同时也可以当成nosql数据库来使用的
|   也就是说除了使用Cache类来与redis服务器交互,也可以通过单独的门脸类Redis来与redis服务器交互
|   除非这里规定,只要是作为缓存系统来使用的,请全部通过Cache类,这样针对缓存系统的一套监控机制就在我们的掌控之中了.
|
*/



return [

    /*
    |--------------------------------------------------------------------------
    | Default Cache Store
    |--------------------------------------------------------------------------
    |
    | This option controls the default cache connection that gets used while
    | using this caching library. This connection is used when another is
    | not explicitly specified when executing a given caching function.
    |  这里一定要配置默认驱动否则artisan命令报错In CacheManager.php line 96: Cache store [] is not defined.
    |
    | sam  2017年12月14日13:49:23
    */

    'default' => env('CACHE_DRIVER', 'memcached'),

    /*
    |--------------------------------------------------------------------------
    | Cache Stores
    |--------------------------------------------------------------------------
    |
    | Here you may define all of the cache "stores" for your application as
    | well as their drivers. You may even define multiple stores for the
    | same cache driver to group types of items stored in your caches.
    |
    */

    'stores' => [

        'file' => [
            'driver' => 'file',
            'path'   => storage_path('framework/cache'),
        ],

        'memcached' => [
            'driver'  => 'memcached',
            'servers' => [
                [
                    'host' => env('MEMCACHED_HOST', '127.0.0.1'),
                    'port' => env('MEMCACHED_PORT', 11211),
                    'weight' => 100,
                ],
            ],
        ],

        'redis' => [
            'driver' => 'redis',
            'connection' => env('CACHE_REDIS_CONNECTION', 'default'),
        ],

    ],

    /*
    |--------------------------------------------------------------------------
    | Cache Key Prefix
    |--------------------------------------------------------------------------
    |
    | When utilizing a RAM based store such as APC or Memcached, there might
    | be other applications utilizing the same cache. So, we'll specify a
    | value to get prefixed to all our keys so we can avoid collisions.
    |
    */

    'prefix' => env('CACHE_PREFIX', 'mes'),

];
