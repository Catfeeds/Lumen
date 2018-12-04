<?php

/*
|--------------------------------------------------------------------------
|引入composer中第三方库
|--------------------------------------------------------------------------
*/
require_once __DIR__.'/../vendor/autoload.php';

/*
|--------------------------------------------------------------------------
|引入自定义函数
|--------------------------------------------------------------------------
|@author  sam.shan <sam.shan@ruis-ims.cn>
*/

require_once __DIR__.'/../app/Helpers/functions.php';






/*
|--------------------------------------------------------------------------
| Create The Application
|--------------------------------------------------------------------------
|
| Here we will load the environment and create the application instance
| that serves as the central piece of this framework. We'll use this
| application as an "IoC" container and router for this framework.
|
*/

try {
    (new Dotenv\Dotenv(__DIR__.'/../'))->load();
} catch (Dotenv\Exception\InvalidPathException $e) {
    //
}

/*
|--------------------------------------------------------------------------
| Create The Application
|--------------------------------------------------------------------------
|
| Here we will load the environment and create the application instance
| that serves as the central piece of this framework. We'll use this
| application as an "IoC" container and router for this framework.
|
*/

$app = new Laravel\Lumen\Application(
    realpath(__DIR__.'/../')
);



/*
 |-------------------------------------------------
 |加载定义的配置文件
 |---------------------------------------------------
 |
 */


$app->configure('database');
$app->configure('cache');
$app->configure('app');
$app->configure('filesystems');
$app->configure('image');
$app->configure('alias');
$app->configure('dictionary');
$app->configure('personnel');
$app->configure('deviceoption');
//下面需要移动到front路由控制器的基类中手动加载  sam.shan
$app->configure('title');
$app->configure('session');
$app->configure('auth');
$app->configure('version');
//$app->configure('dompdf');
$app->configure('queue');
$app->configure('rsa');



/*
|--------------------------------------------------------------------------
|开启Facades
|--------------------------------------------------------------------------
|lumen默认开启的原生,如果想使用查询构造器,则需要开启如下的注释额
|如果你想使用 DB facade 的话,你需要把 $app->withFacades() 这行调用的注释去除掉。
|
|@author  sam.shan <sam.shan@ruis-ims.cn>
*/

 $app->withFacades();


/*
|--------------------------------------------------------------------------
|开启ORM
|--------------------------------------------------------------------------
|如果你想要使用 Eloquent ORM，你需要把 $app->withEloquent()这行调用的注释删除掉。
|@author  sam.shan <sam.shan@ruis-ims.cn>
*/

// $app->withEloquent();

/*
|--------------------------------------------------------------------------
| Register Container Bindings
|--------------------------------------------------------------------------
|
| Now we will register a few bindings in the service container. We will
| register the exception handler and the console kernel. You may add
| your own bindings here if you like or you can make another file.
|
*/

$app->singleton(
    Illuminate\Contracts\Debug\ExceptionHandler::class,
    App\Exceptions\Handler::class
);

$app->singleton(
    Illuminate\Contracts\Console\Kernel::class,
    App\Console\Kernel::class
);


/*
|--------------------------------------------------------------------------
| Register Middleware
|--------------------------------------------------------------------------
|
| Next, we will register the middleware with the application. These can
| be global middleware that run before and after each request into a
| route or middleware that'll be assigned to some specific routes.
| 若是希望每个 HTTP 请求都经过一个中间件，只要将中间件的类加入到$app->middleware() 调用参数数组中。
| 这里可以添加自定义的全局中间件，且添加之后默认就启动了
*/

 $app->middleware([

      Illuminate\Session\Middleware\StartSession::class,
      //\App\Http\Middleware\FormToken::class,//ajax或者postman的访问都要验证固定token

 ]);


/*
 |----------------------------------------------------------------
 |这里也可以添加自定义的中间件，只是这里的中间件默认没有启动，哪个路由想用，请按照key指明即可
 |-----------------------------------------------------------------
 */
 $app->routeMiddleware([
     'dm'=>\App\Http\Middleware\DM::class,
     'login'=>\App\Http\Middleware\Login::class,
     'auth'=>\App\Http\Middleware\Auth::class,
     'vars'=>\App\Http\Middleware\VARS::class,
     'Excel' => Maatwebsite\Excel\Facades\Excel::class,
     'token'=>\App\Http\Middleware\FormToken::class,
     'api_token'=>\App\Http\Middleware\ApiToken::class,
 ]);

/*
|--------------------------------------------------------------------------
| Register Service Providers
|--------------------------------------------------------------------------
|
| Here we will register all of the application's service providers which
| are used to bind services into the container. Service providers are
| totally optional, so you are not required to uncomment this line.
|
*/


// $app->register(App\Providers\AuthServiceProvider::class);
//添加了sql语句监听输出
if(env('APP_DEBUG') || !empty($_REQUEST['_debug']) ) $app->register(App\Providers\EventServiceProvider::class);
//注册应用级的服务
$app->register(App\Providers\AppServiceProvider::class);
// 注册mongodb服务
$app->register(Jenssegers\Mongodb\MongodbServiceProvider::class);
//注册redis服务
$app->register(Illuminate\Redis\RedisServiceProvider::class);
//注册文件系统服务
$app->register(Illuminate\Filesystem\FilesystemServiceProvider::class);
//注册图像处理系统
$app->register(Intervention\Image\ImageServiceProvider::class);
// 注册 SessionServiceProvider
$app->register(Illuminate\Session\SessionServiceProvider::class);
// excel导入
$app->register(Maatwebsite\Excel\ExcelServiceProvider::class);
//给excel起别名
class_alias('Maatwebsite\Excel\Facades\Excel', 'Excel');

//$app->register(\Barryvdh\DomPDF\ServiceProvider::class);
/*
|--------------------------------------------------------------------------
| 设置别名
|--------------------------------------------------------------------------
|@author  sam.shan
|@time   2018年01月12日10:28:42
|
*/

// 设置session别名
$app->alias('session', 'Illuminate\Session\SessionManager');


/*
|--------------------------------------------------------------------------
| Load The Application Routes
|--------------------------------------------------------------------------
|
| Next we will include the routes file so that they can all be added to
| the application. This will provide all of the URLs the application
| can respond to, as well as the controllers that may handle them.
|
*/

$app->router->group([
    'namespace' => 'App\Http\Controllers',
], function ($router) {
    require __DIR__.'/../routes/web.php';
});

/**
 * lumen 日志 按照日期保存
 */
$app->configureMonologUsing(function(Monolog\Logger $monoLog) use ($app){
    return $monoLog->pushHandler(
        (new \Monolog\Handler\RotatingFileHandler($app->storagePath().'/logs/lumen/lumen.log'))
            ->setFormatter(new Monolog\Formatter\LineFormatter(null, null, true, true))
    );
});

return $app;
