<?php


namespace App\Http\Middleware;
use Closure;
use Illuminate\Support\Facades\DB;

/**
 * 数据采集
 * @author  sam.shan  <sam.shan@ruis-ims.cn>
 */
class DM
{


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

        //如果开启权限节点采集,则进行采集
        if(config('auth.dm_auth_nodes')){
            $node=$request->path();
            $has=DB::table(config('alias.rrn'))->where('node',$node)->limit(1)->count();
            if($has) return $next($request);
            $collection=[
                'node'=>$node,
                'name'=>config('title.'.$node,''),
                'status'=>0,
                'created_at'=>date('Y-m-d H:i:s',time())
            ];
            DB::table(config('alias.rrn'))->insert($collection);
        }


        return $next($request);
    }




}
