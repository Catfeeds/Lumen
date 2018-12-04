<?php


namespace App\Http\Models\Account;//定义命名空间
use App\Http\Models\Base;
use Illuminate\Support\Facades\DB;//引入DB操作类

/**
 * 管理员与角色关联表
 * @author  sam.shan  <sam.shan@ruis-ims.cn>
 * @time    2018年01月19日13:22:11
 */
class Identity extends Base
{

    /**
     * 前端传递的api主键名称
     * @var string
     */
    public  $apiPrimaryKey='identity_id';


    public function __construct()
    {
        parent::__construct();
        $this->table=config('alias.rri');
    }



    /**
     * 添加角色
     * @param $add_set
     * @param $admin_id
     * @throws \App\Exceptions\ApiException
     * @author  sam.shan   <sam.shan@ruis-ims.cn>
     */
    public function  addSet($add_set,$admin_id)
    {

        foreach ($add_set as $key => $value) {
            if(empty($value)) continue;
            $bool=DB::table($this->table)->insert(
                [
                    'admin_id'=>$admin_id,
                    'role_id'=>$value
                ]
            );
            if(empty($bool)) TEA('806');
        }
    }

    /**
     * 删除角色
     * @param $del_set
     * @param $admin_id
     * @author sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function  delSet($del_set,$admin_id)
    {

        foreach ($del_set as $key => $value) {
            if(empty($value)) continue;
            $num=DB::table($this->table)->where([['admin_id','=',$admin_id],['role_id','=',$value]])->delete();
            if($num===false) TEA('806');
        }


    }









}

