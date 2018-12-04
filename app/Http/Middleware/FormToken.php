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
 * FormToken中间件
 * @author  sam.shan  <sam.shan@ruis-ims.cn>
 */
class FormToken
{
    /**
     * 固定api的token值,这个不建议放在.env中
     */
    const TOKEN="8b5491b17a70e24107c89f37b1036078";
    /**
     * 运行请求过滤器。
     * Handle an incoming request.
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     * @author  sam.shan   <sam.shan@ruis-ims.cn>
     */
    public function handle($request, Closure $next)
    {
        if($request->ajax() ||  is_postman()){
            if(empty($request->input('_token')) || $request->input('_token') !==self::TOKEN) TEA('401');
        }
        return $next($request);
    }



}
