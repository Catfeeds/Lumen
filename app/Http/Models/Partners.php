<?php 
/**
 * Created by Sublime.
 * User: liming
 * Date: 17/10/18
 */
namespace App\Http\Models;//定义命名空间
use Illuminate\Support\Facades\DB;//引入DB操作类

class Partners extends  Base
{
    public function __construct()
    {
        $this->table='partner';
    }


    /**
     * 获取供应商列表
     * @return array  返回数组对象集合
     */
    public function getVendorsList($input)
    {
        $obj_list=DB::table($this->table)->where('is_vendor',$input['is_vendor'])->select('id','name','code','number','abbreviation','phone','fax','address')->get();
        return $obj_list;
    }


    /**
     * 获取客户列表
     * @return array  返回数组对象集合
     */
    public function getCustomersList($input)
    {
        $obj_list=DB::table($this->table)->where('is_customer',$input['is_customer'])->select('id','name','code','number','abbreviation','phone','fax','address')->get();
        return $obj_list;
    }




    /**
     * 查看某条业务伙伴信息
     * @param   $id
     * @return  mixed
     * @author  liming
     */
    public function get($id)
    {
        $obj=$this->getRecordById($id,['id','name','code','number','abbreviation','phone','fax','address']);
        if(!$obj) TEA('404');
        return $obj;
    }




}
