<?php
/**
 * Created by PhpStorm.
 * User: sansheng
 * Date: 17/9/21
 * Time: 上午9:02
 */

namespace App\Http\Middleware;
use Closure;

/**
 * ApiToken中间件
 * @author  rick
 */
class ApiToken
{
     /**
     * 运行请求过滤器。
     * Handle an incoming request.
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     * @author  rick
     */
    public function handle($request, Closure $next)
    {
        $user = $request->header('php-auth-user');
        $pw   = $request->header('php-auth-pw');
        $machine_no = $request->header('machine-no');
        if(!$machine_no) TEA('700','machine-no');
        if(!$user || !$pw) TEA('2500');
        if($user=='ruis' && $pw == "8b5491b17a70e24107c89f37b1036078"){
            $request['machine_no'] = $machine_no;
            $request['company_id'] = 1;
            return $next($request);
        }else{
            TEA('2501');
        }
    }



}
