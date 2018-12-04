<?php


namespace App\Http\Middleware;
use Closure;
use Illuminate\Support\Facades\DB;

/**
 * 权限检测中间件
 * @author  sam.shan  <sam.shan@ruis-ims.cn>
 */
class Auth
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
        $uri=$request->path();
        //判断权限
        if( !$this->checkAuth($uri) ){
            if($request->ajax() || is_postman()) TEA('412');
            return response(view('error.412'));
        }
        return $next($request);
    }

    /**
     *
     * 判断权限的逻辑是[具体权限不存在模糊匹配]
     * 取出当前登录用户的所属角色，
     * 在通过角色 取出 所属 权限关系
     * 在权限表中取出所有的权限链接
     * 判断当前访问的链接 是否在 所拥有的权限列表中
     * @param  [type] $uri [description]
     * @return [type]      [description]
     */
    public function checkAuth( $uri )
    {
        //如果是超级管理员 也不需要权限判断
        if(!empty(session('administrator')->superman))  return true;
        //有一些页面是不需要进行权限判断的
        $has=DB::table(config('alias.rrn'))
                    ->where('node',$uri)
                    ->whereIn('type',[config('app.node_type.ignore_login'),config('app.node_type.ignore_auth')])
                    ->where('status',1)
                    ->limit(1)
                    ->count();
        if($has) return true;
        //看看是否分配了该权限
        return in_array($uri,$this->getAuth(session('administrator')->admin_id));
    }

    /*
     * 获取某用户的所有权限
     * 取出指定用户的所属角色，
     * 在通过角色 取出 所属 权限关系
     * 在权限表中取出所有的权限链接
     */
    public function getAuth($admin_id)
    {

        //1.用户角色关系表取出分配了哪些角色
        $role_ids=DB::table(config('alias.rrr').' as rrr')
            ->leftJoin(config('alias.rri').' as rri','rri.role_id','=','rrr.id')
            ->where('rri.admin_id',$admin_id)
            ->where('rrr.status',1)
            ->pluck('rri.role_id');
        $role_ids=obj2array($role_ids);
        if(empty($role_ids)) return [];
        //2.角色权限关系表获取分配了哪些权限
        $nodes=DB::table(config('alias.rrn').' as rrn')
                  ->where('rrn.status',1)
                  ->whereIn('rra.role_id',$role_ids)
                  ->leftJoin(config('alias.rra').' as rra','rra.node_id','=','rrn.id')
                  ->pluck('rrn.node');
        return  obj2array($nodes);
    }










}
