<?php


namespace App\Http\Models\Account;//定义命名空间
use App\Http\Models\Base;
use Illuminate\Support\Facades\DB;//引入DB操作类

/**
 * 角色与权限节点关联表
 * @author  sam.shan  <sam.shan@ruis-ims.cn>
 * @time    2018年01月19日13:22:11
 */
class Auth extends Base
{

    /**
     * 前端传递的api主键名称
     * @var string
     */
    public  $apiPrimaryKey='auth_id';


    public function __construct()
    {
        parent::__construct();
        $this->table=config('alias.rra');
    }

    /**
     * 添加权限
     * @param $add_set
     * @param $node_id
     * @throws \App\Exceptions\ApiException
     * @author  sam.shan   <sam.shan@ruis-ims.cn>
     */
    public function  addSetRoles($add_set,$node_id)
    {

        foreach ($add_set as $key => $value) {
            if(empty($value)) continue;
            $bool=DB::table($this->table)->insert(
                [
                    'node_id'=>$node_id,
                    'role_id'=>$value
                ]
            );
            if(empty($bool)) TEA('806');
        }
    }

    /**
     * 删除权限
     * @param $del_set
     * @param $node_id
     * @author sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function  delSetRoles($del_set,$node_id)
    {

        foreach ($del_set as $key => $value) {
            if(empty($value)) continue;
            $num=DB::table($this->table)->where([['node_id','=',$node_id],['role_id','=',$value]])->delete();
            if($num===false) TEA('806');
        }


    }



    /**
     * 添加权限
     * @param $add_set
     * @param $role_id
     * @throws \App\Exceptions\ApiException
     * @author  sam.shan   <sam.shan@ruis-ims.cn>
     */
    public function  addSetNodes($add_set,$role_id)
    {

        foreach ($add_set as $key => $value) {
            if(empty($value)) continue;
            $bool=DB::table($this->table)->insert(
                [
                    'node_id'=>$value,
                    'role_id'=>$role_id
                ]
            );
            if(empty($bool)) TEA('806');
        }
    }

    /**
     * 删除权限
     * @param $del_set
     * @param $role_id
     * @author sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function  delSetNodes($del_set,$role_id)
    {

        foreach ($del_set as $key => $value) {
            if(empty($value)) continue;
            $num=DB::table($this->table)->where([['role_id','=',$role_id],['node_id','=',$value]])->delete();
            if($num===false) TEA('806');
        }


    }











}