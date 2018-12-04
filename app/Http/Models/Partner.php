<?php
/**
 * @message 往来单位
 * @author  liming
 * @time    年 月 日
 */    
    
namespace App\Http\Models;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

class Partner extends Base{
    public function __construct()
    {
        parent::__construct();
        if(!$this->table) $this->table = config('alias.rpn');
    }

    /**
     * @param $input
     * @author ming.li
     */
    public function checkFormField(&$input)
    {
        if(empty($input['name'])) TEA('8907','name');
        if(empty($input['code'])) TEA('8909','code');
    }

    /**
     * @param $input
     * @author ming.li
     */
    public function add($input)
    {
        //名称唯一性检测
        $has=$this->isExisted([['name','=',$input['name']]]);
        if($has) TEA('8908','name');

        //名称唯一性检测
        $has=$this->isExisted([['code','=',$input['code']]]);
        if($has) TEA('8908','code');

        if(empty($input['code'])) TEA('8202','code');
        if(!preg_match('/^[0-9]{1,10}+$/',$input['code'])) TEA('8911','code');

        $data = [
            'name'=>$input['name'],
            'code'=>$input['code'],
            'ceo'=>isset($input['ceo'])?$input['ceo']:'',
            'phone'=>isset($input['phone'])?$input['phone']:'',
            'fax'=>isset($input['fax'])?$input['fax']:'',
            'address'=>isset($input['address'])?$input['address']:'',
            'email'=>isset($input['email'])?$input['email']:'',
            'web'=>isset($input['web'])?$input['web']:'',
            'info'=>isset($input['info'])?$input['info']:'',
            'ctime'=>time(),
            'is_customer'=>isset($input['is_customer'])?$input['is_customer']:'',
            'is_vendor'=>isset($input['is_vendor'])?$input['is_vendor']:'',
            'is_processor'=>isset($input['is_processor'])?$input['is_processor']:'',
        ];
        $insert_id = DB::table($this->table)->insertGetId($data);
        if(!$insert_id) TEA('802');
        return $insert_id;
    }

    /**
     * @param $input
     * @author ming.li
     */
    public function getPageList(&$input)
    {
        $where = $this->_search($input);
        $builer = DB::table($this->table)->select('*')->where($where);
        $input['total_records'] = $builer->count();
        $builer->offset(($input['page_no'] - 1) * $input['page_size'])->limit($input['page_size']);
        if(!empty($input['sort']) && !empty($input['order'])) $builer->orderBy($input['sort'],$input['order']);
        $obj_list = $builer->get();
        return $obj_list;
    }

    /**
     * @param $input
     * @author ming.li
     */
    public function select(&$input)
    {
        $where = $this->_search($input);
        $obj_list = DB::table($this->table)->select('*')->where($where)->get();
        return $obj_list;
    }


    /**
     * @param $id
     * @author ming.li
     */
    public function get($id){
        $obj = DB::table($this->table)->select('*')->where('id',$id)->first();
        if(!$obj) TEA('404');
        return $obj;
    }

    /**
     * 修改单位
     * @param $input
     * @author ming.li
     */
    public function update($input){
        //名称唯一性检测
        $has=$this->isExisted([['name','=',$input['name']],['id','<>',$input['id']]]);
        if($has) TEA('8908','name');


        //编码唯一性检测
        $has=$this->isExisted([['code','=',$input['code']],['id','<>',$input['id']]]);
        if($has) TEA('8910','code');

        $data = [
            'name'=>$input['name'],
            'code'=>$input['code'],
            'ceo'=>isset($input['ceo'])?$input['ceo']:'',
            'phone'=>isset($input['phone'])?$input['phone']:'',
            'fax'=>isset($input['fax'])?$input['fax']:'',
            'address'=>isset($input['address'])?$input['address']:'',
            'email'=>isset($input['email'])?$input['email']:'',
            'web'=>isset($input['web'])?$input['web']:'',
            'info'=>isset($input['info'])?$input['info']:'',
            'ctime'=>time(),
            'is_customer'=>isset($input['is_customer'])?$input['is_customer']:'',
            'is_vendor'=>isset($input['is_vendor'])?$input['is_vendor']:'',
            'is_processor'=>isset($input['is_processor'])?$input['is_processor']:'',
        ];
        $res = DB::table($this->table)->where('id',$input['id'])->update($data);
        if($res === false) TEA('804');
    }
    
    /**
     * 删除往来单位
     * @param $id
     * @author ming.li
     */
    public function delete($id)
    {
        // 删除之前  先删除  登录账号
        $Partner_res   = DB::table($this->table)->select('code','has_admin')->where('id',$id)->first();
        if($Partner_res->has_admin == 1) 
        {
            $admin_res = DB::table('ruis_rbac_admin')->select('id')->where('name',$Partner_res->code)->first();
            if ($admin_res) 
            {
                  $admin_delres = DB::table('ruis_rbac_admin')->where('id',$admin_res->id)->delete();
                  if(!$admin_delres) TEA('803');
            }
        }
        $res = DB::table($this->table)->where('id',$id)->delete();
        if(!$res) TEA('803');
    }

    /**
     * @message 生成登录账号
     * @author  liming
     * @time    2018年 11月 26日
     */    
    public  function  upgradeAadmin($id)
    {
        // 获取该条业务伙伴的编码
        $code_res  = DB::table($this->table)->where('id',$id)->select('code','has_admin')->first();
        $code  = $code_res->code;
        if ($code_res->code  == 1) TEA('8912');
        // code 作为账号   code 作为 编码   加上盐
        $data=[
            'name'=>$code,
            'salt'=>config('auth.salt'),
            'password'=>encrypted_password($code,config('auth.salt')),
            'cn_name'=>'',
            'mobile'=>'',
            'email'=>'',
            'superman'=>0,
            'status'=>1,
            'created_at'=>date('Y-m-d H:i:s',time()),
            'updated_at'=>date('Y-m-d H:i:s',time()),
        ];
        try {
             //开启事务
            DB::connection()->beginTransaction();
             //入库
            $insert_id=DB::table('ruis_rbac_admin')->insertGetId($data);
            if(!$insert_id) TEA('802');

            //更新  has_admin字段为 1
            $res = DB::table($this->table)->where('id',$id)->update(['has_admin'=>1]);
            if($res === false) TEA('804');
        }catch(\ApiException $e){
            //回滚
            DB::connection()->rollBack();
            TEA($e->getCode());
        }
        //提交事务
        DB::connection()->commit();
        return  $insert_id;
    }

    /**
     * @message 搜索
     * @author  liming
     * @time    年 月 日
     */    
    private function _search($input)
    {
        $where = array();
        if (isset($input['ceo']) && $input['ceo']) {//ceo
            $where[]=['ceo','like','%'.$input['ceo'].'%'];
        }
        if (isset($input['name']) && $input['name']) {//name
            $where[]=['name','like','%'.$input['name'].'%'];
        }
        return $where;
    }

}