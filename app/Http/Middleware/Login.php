<?php


namespace App\Http\Middleware;
use Closure;
use Illuminate\Support\Facades\DB;
/**
 * 登陆检测中间件
 * @author  sam.shan  <sam.shan@ruis-ims.cn>
 */
class Login
{

    /**
     * 运行请求过滤器。
     * Handle an incoming request.
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return \Illuminate\Http\RedirectResponse|\Laravel\Lumen\Http\Redirector|mixed
     * @throws \App\Exceptions\ApiException
     * @throws \Illuminate\Container\EntryNotFoundException
     * @author  sam.shan   <sam.shan@ruis-ims.cn>
     * @since lesteryou 登录后自动跳转到原先的页面
     */
    public function handle($request, Closure $next)
    {
        if (empty(session('administrator')->admin_id)) {

            //获取当前的uri
            $uri = $request->path();
            //判断是否是免登陆的
            $has=DB::table(config('alias.rrn'))->where('node',$uri)->where('type',config('app.node_type.ignore_login'))->where('status',1)->limit(1)->count();
            if(!$has){
                if($request->ajax() || is_postman()) TEA('411');
                $callbackUrl = $request->getRequestUri();
                session(['callbackUrl' => $callbackUrl]);
                return redirect('AccountManagement/login');
            }
        }
        //刷新发呆时间,这个就不用了,框架本身已经帮我们做好了,万分感谢
        return $next($request);
    }



}
