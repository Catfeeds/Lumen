<?php
/**
 * Created by PhpStorm.
 * User: sansheng
 * Date: 17/9/21
 * Time: 上午9:02
 */

namespace App\Http\Middleware;
use App\Libraries\Tree;
use Closure;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\View;

/**
 * Sidebar中间件
 * @author  sam.shan  <sam.shan@ruis-ims.cn>
 */
class VARS
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
        if($request->isMethod('post') || $request->ajax() || is_postman())  return $next($request);
        //① 获取公共模板变量之资源定位符
        $uri = $request->path();
        //去除不需要获取菜单的情况,免登陆的也不需要获取菜单
        $has=DB::table(config('alias.rrn'))->where('node',$uri)->where('type',config('app.node_type.ignore_login'))->where('status',1)->limit(1)->count();
        if($has)return $next($request);
        //② 获取公共模板变量之菜单
        $sidebars=$this->getSidebars();
        //③获取公共模板变量之标题值
        $title=config('title.'.$uri);
        if(empty($title)){
            $obj=DB::table(config('alias.rrn'))->select('name')->where('node',$uri)->first();
            $title=!empty($obj->name)?$obj->name:NULL;
        }
        //④ 获取公共模板变量之版本号
        $release=config('app.release');
        //分配菜单
        View::share('uri',$uri);
        View::share('sidebars',$sidebars);
        View::share('title',$title);
        View::share('release',$release);
        return $next($request);
    }



    /**
     * 获取菜单
     * @return mixed
     * @author sam.shan <sam.shan@ruis-ims.cn>
     * @todo  没必要使用递归,直接写死支持四级即可
     */
    public function  getSidebars()
    {
        //从数据库中获取展示的菜单
        $superman=false;
        if(!empty(session('administrator')->superman))  $superman=true;

        if(!$superman) $menu_ids=$this->getMenuIds(session('administrator')->admin_id);
        $builder=DB::table(config('alias.rrm'))->select(['id','name','icon','uri','belong_to_uris','descendants_uris','class','parent_id'])->where('status',1)->orderBy('sort','asc');
        if(isset($menu_ids)) $builder->whereIn('id',$menu_ids); //当$menu_ids为[]的时候,底层拼接sql的时候会转成 where 0=1
        $sidebars=$builder->get();
        $sidebars=obj2array($sidebars);
        //格式化菜单
        foreach ($sidebars as $key => &$sidebar) {
            $sidebar['belong_to_uris']=empty($sidebar['belong_to_uris'])?[]:explode(',',$sidebar['belong_to_uris']);
            $sidebar['descendants_uris']=empty($sidebar['descendants_uris'])?[]:explode(',',$sidebar['descendants_uris']);
        }
        //转成树状图
        $sidebars=Tree::listToTree($sidebars,'id','parent_id','sub_menu');

        return $sidebars;
    }


    /**
     * 获取某个用户可以展示哪些菜单
     * @param $admin_id
     * @return array|mixed
     * @author sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function getMenuIds($admin_id)
    {

        //1.用户角色关系表取出分配了哪些角色
        $role_ids=DB::table(config('alias.rrr').' as rrr')
            ->leftJoin(config('alias.rri').' as rri','rri.role_id','=','rrr.id')
            ->where('rri.admin_id',$admin_id)
            ->where('rrr.status',1)
            ->pluck('rri.role_id');
        $role_ids=obj2array($role_ids);
        if(empty($role_ids)) return [];
        //2.角色权限关系表获取分配了哪些菜单
        $obj_list=DB::table(config('alias.rrn').' as rrn')
            ->where('rrn.status',1)
            ->where(function($query) use($role_ids){
                $query->whereIn('rra.role_id',$role_ids)->orWhere('rrn.type',config('app.node_type.ignore_auth'));
              })
            ->leftJoin(config('alias.rra').' as rra','rra.node_id','=','rrn.id')
            ->leftJoin(config('alias.rrm').' as rrm','rrm.id','=','rrn.menu_id')
            ->select('rrn.menu_id','rrm.forefathers','rrm.name')
            ->get();
         if ($obj_list->isEmpty())  return [];
        $menu_ids=[];
        foreach($obj_list as $key=>$value){
            $menu_ids[]=$value->menu_id;
            if(!empty($value->forefathers)){
                $menu_ids=array_merge($menu_ids,explode(',',trim($value->forefathers,',')));
            }
        }
        return array_unique($menu_ids);

    }







}
