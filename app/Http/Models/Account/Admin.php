<?php


namespace App\Http\Models\Account;//定义命名空间
use App\Http\Models\Base;
use App\Http\Models\Employee;
use App\Libraries\Verify;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;//引入DB操作类

/**
 * 系统用户表
 * @author  sam.shan  <sam.shan@ruis-ims.cn>
 * @time    2018年01月12日14:33:31
 */
class Admin extends Base
{

    /**
     * 前端传递的api主键名称
     * @var string
     */
    public  $apiPrimaryKey='admin_id';

    public function __construct()
    {
        parent::__construct();
        $this->table=config('alias.rrad');
    }


//region 删
    /**
     * 删除管理员 超管不可删在前端已限制
     * @param $id
     * @throws \App\Exceptions\ApiException
     * @author  Bruce.Chu  <Bruce.Chu@ruis-ims.cn>
     * @author  Ming.Li   
     * Ming.Li  修改删除之前  如果是加工商的账号  先改变供应商 列表 状态
     */
    public function delete($id)
    {
        // 删除之前  先做一些处理
        $res  = $this->getRecordById($id,'name');
        // 通过 name 查找是否有
        $has  = DB::table('ruis_partner_new')->select('id')->where('code',$res->name)->first();
        if ($has) 
        {
            //更新  has_admin字段为 0
            $res = DB::table('ruis_partner_new')->where('id',$has->id)->update(['has_admin'=>0]);
            if($res === false) TEA('804');
        }
        $del=$this->destroyById($id);
        if (!$del) TEA('404');
    }
//endregion


//region 查


    /**
     * 查看详情
     * @param $id
     * @return mixed
     * @throws \App\Exceptions\ApiException
     * @author  sam.shan <sam.shan@ruis-ims.cn>
     */
    public function get($id)
    {
        $fields= [
            'id as admin_id','name','cn_name','email','mobile','superman','header_photo','status',
            'last_login_at','created_at','updated_at','introduction','sex','date_of_birth','attachment_id'
        ];
        $obj =$this->getRecordById($id,$fields);
        if (!$obj) TEA('404');
        //身份
        //$obj->roles= $this->getRolesByAdminId($id);
        return $obj;
    }


    /**
     * 根据管理员获取身份
     * @param $admin_id
     * @return array
     * @author  sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function getRolesByAdminId($admin_id)
    {
        $obj_list=DB::table(config('alias.rri').' as rri')
            ->where('rri.admin_id',$admin_id)
            ->leftJoin(config('alias.rrr').' as rrr', 'rri.role_id', '=', 'rrr.id')
            ->select(
                'rri.role_id','rri.admin_id',
                'rrr.name','rrr.status'
            )
            ->get();
        return $obj_list;
    }



    /**
     * 分页查询列表
     * @param $input
     * @return mixed
     * @author  sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function getAdminList(&$input)
    {
        //1.创建公共builder
           //1.1where条件预搜集
        $where = [];
        !empty($input['name']) && $where[] = ['name', 'like', '%' . $input['name'] . '%'];
        !empty($input['cn_name']) && $where[] = ['cn_name', 'like', '%' . $input['cn_name'] . '%'];
        isset($input['status']) && is_numeric($input['status']) && $where[]=['status','=',$input['status']];
           //1.2.预生成builder,注意仅仅在get中需要的连表请放在builder_get中
        $builder = DB::table($this->table);
           //1.3 where条件拼接
        if (!empty($where)) $builder->where($where);
        //2.总共有多少条记录
        $input['total_records'] = $builder->count();
        //3.select查询
        $builder_get=$builder;
           //3.1拼接分页条件
        $builder_get->select('id as admin_id','name','cn_name','email','mobile','superman','header_photo','status','last_login_at','created_at')
            ->offset(($input['page_no'] - 1) * $input['page_size'])
            ->limit($input['page_size']);
           //3.2 order排序
        if (!empty($input['order']) && !empty($input['sort'])) $builder_get->orderBy($input['sort'], $input['order']);
            //3.3 get查询
        $obj_list = $builder_get->get();

        return $obj_list;
    }


//endregion


//region  检
    /**
     * add/update参数检测
     * @param $input  array 要过滤判断的get/post数组
     * @return void         址传递,不需要返回值
     */
    public function checkFormFields(&$input)
    {
        //过滤参数
        trim_strings($input);
        //判断操作模式
        $add=$this->judgeApiOperationMode($input);
        //1.name 账户名 YUS
        if($add){
            //1.1 不可以为空
            if(empty($input['name'])) TEA('700','name');
            //1.2 唯一性检测
            $check=[['name','=',$input['name']]];
            $has=$this->isExisted($check);
            if($has) TEA('919','name');
        }
        //2.password  账户密码  YS
        if($add){
            if(empty($input['password'])) TEA('700','password');
            if(!check_admin_password_regular($input['password']))  TEA('701','password');
        }
        //3.cn_name   真实姓名  N
        //4.mobile    手机号 N
        if(!empty($input['mobile'])){
            $check=$add?[['mobile','=',$input['mobile']]]:[['mobile','=',$input['mobile']],['id','<>',$input[$this->apiPrimaryKey]]];
            $has=$this->isExisted($check);
            if($has) TEA('920','mobile');
        }
        //5.email     邮箱   N
        if(!empty($input['email'])){
            $check=$add?[['email','=',$input['email']]]:[['email','=',$input['email']],['id','<>',$input[$this->apiPrimaryKey]]];
            $has=$this->isExisted($check);
            if($has) TEA('921','email');
        }
        //6.superman  是否为超级管理员  Y
        //7.status    状态    Y
    }


    /**
     * 修改个人资料参数检测
     * @param $input  array 要过滤判断的get/post数组
     * @return void         址传递,不需要返回值
     */
    public function checkProfileFormFields(&$input)
    {
        //过滤参数
        trim_strings($input);
        //1.cn_name   真实姓名  N
        //2.email     邮箱   N
        if(!empty($input['email'])){
            $check=[['email','=',$input['email']],['id','<>',$input[$this->apiPrimaryKey]]];
            $has=$this->isExisted($check);
            if($has) TEA('921','email');
        }
        //3.mobile    手机号 N
        if(!empty($input['mobile'])){
            $check=[['mobile','=',$input['mobile']],['id','<>',$input[$this->apiPrimaryKey]]];
            $has=$this->isExisted($check);
            if($has) TEA('920','mobile');
        }

        //4.date_of_birth  出生日期  N
        //5.sex  性别  N
        //6.introduction  自我介绍  N
        //7.header_photo  头像  N

    }




//endregion

//region 员工同步保存

    /**
     * 员工部分同步系统管理账户
     * @param $data
     * @return bool|string 执行成功返回true,失败返回false
     * @throws \Exception 参数传递错误直接抛异常
     * @author sam.shan <sam.shan@ruis-ims.cn>
     */
    public function  syncSave($data)
    {
        //参数检测
        if(empty($data['employee_id']))   TE('Parameter employee_id missing or invalid type.');
        if(empty($data['role_ids']) || !is_array($data['role_ids']))   TE('Parameter role_ids missing or invalid type.');
        //判断是添加还是编辑
        $obj=DB::table($this->table)->select('id')->where('employee_id','=',$data['employee_id'])->first();
        $admin_id=isset($obj->id)?$obj->id:'';
        //获取入库数组
        $save=[
            'updated_at'=>date('Y-m-d H:i:s',time())
        ];
        if(isset($data['employee_id'])) $save['employee_id']=$data['employee_id'];//员工表主键
        if(isset($data['company_id'])) $save['company_id']=$data['company_id'];//公司ID
        if(isset($data['factory_id'])) $save['factory_id']=$data['factory_id'];//工厂ID
        if(isset($data['cn_name'])) $save['cn_name']=$data['cn_name'];//姓名
        if(isset($data['sex'])) $save['sex']=$data['sex'];//性别  1是男  2是女
        if(isset($data['name'])) $save['name']=$data['name'];//账户名
        if(isset($data['mobile'])) $save['mobile']=$data['mobile'];//手机号
        if(isset($data['email'])) $save['email']=$data['email'];//邮箱
        if(isset($data['introduction'])) $save['introduction']=$data['introduction'];//简介
        if(isset($data['attachment_id'])) $save['attachment_id']=$data['attachment_id'];//附件ID
        if(isset($data['header_photo'])) $save['header_photo']=$data['header_photo'];//头像
        if(isset($data['status'])) $save['status']=$data['status'];//是否激活 0不激活 1激活
        if(isset($data['date_of_birth'])) $save['date_of_birth']=$data['date_of_birth'];//生日,如1990-12-10
        if(isset($data['password'])) $save['password']=encrypted_password($data['password'],config('auth.salt'));
        if(!$admin_id){
            $save['created_at']=date('Y-m-d H:i:s',time());
            $save['salt']=config('auth.salt');
        }
        //进行操作
        if(!$admin_id){
            $admin_id=DB::table($this->table)->insertGetId($save);
            if(empty($admin_id)) return false;
        }else{
            $upd=DB::table($this->table)->where('id',$admin_id)->update($save);
            if($upd===false)  return false;
        }
        //给管理员分配角色
        $this->admin2role(['admin_id'=>$admin_id,'role_ids'=>$data['role_ids']]);
         return $admin_id;
    }

//endregion
//region  增

    /**
     * 添加
     * @param $input array    input数组
     * @return int            返回插入表之后返回的主键值
     * @author     sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function add($input)
    {

        //获取入库数组,此处一定要严谨一些,否则前端传递额外字段将导致报错,甚至攻击
        $data=[
            'name'=>$input['name'],
            'salt'=>config('auth.salt'),
            'password'=>encrypted_password($input['password'],config('auth.salt')),
            'cn_name'=>$input['cn_name'],
            'mobile'=>!empty($input['mobile'])?$input['mobile']:NULL,
            'email'=>!empty($input['email'])?$input['email']:NULL,
            'superman'=>$input['superman'],
            'status'=>$input['status'],
            'created_at'=>date('Y-m-d H:i:s',time()),
            'updated_at'=>date('Y-m-d H:i:s',time()),
        ];
        //入库
        $insert_id=DB::table($this->table)->insertGetId($data);
        if(!$insert_id) TEA('802');
        return  $insert_id;
    }


//endregion
//region  修



    /**
     * 入库操作,编辑
     * 由于不能修改上级分类,所以判断辈分是否错乱就不需要了
     * @param $input
     * @throws \Exception
     * @author  sam.shan   <sam.shan@ruis-ims.cn>
     */
    public function update($input)
    {
        //获取编辑数组
        $data=[

            'cn_name'=>$input['cn_name'],
            'mobile'=>!empty($input['mobile'])?$input['mobile']:NULL,
            'email'=>!empty($input['email'])?$input['email']:NULL,
            'superman'=>$input['superman'],
            'status'=>$input['status'],
            'updated_at'=>date('Y-m-d H:i:s',time()),
        ];
        //入库
        $upd=DB::table($this->table)->where('id',$input[$this->apiPrimaryKey])->update($data);
        //当返回值为0的时候,表示影响的行数为0,即更新的内容未做任何改变或者说更新的记录不存在数据库中
        if($upd===false) TEA('804');
        //if($upd==0) TEA('805');
    }

    /**
     * 修改密码
     * @param $input
     * @throws \Exception
     * @author  sam.shan   <sam.shan@ruis-ims.cn>
     */
    public function updatePassword($input)
    {
        //获取编辑数组
        $data=[
            'salt'=>config('auth.salt'),
            'password'=>encrypted_password($input['new_password'],config('auth.salt')),
            'updated_at'=>date('Y-m-d H:i:s',time()),
        ];
        //入库
        $upd=DB::table($this->table)->where('id',session('administrator')->admin_id)->update($data);
        //当返回值为0的时候,表示影响的行数为0,即更新的内容未做任何改变或者说更新的记录不存在数据库中
        if($upd===false) TEA('936');
        //if($upd==0) TEA('805');
        //更新session
        $administrator=session('administrator');
        $administrator->password=encrypted_password($input['new_password'],config('auth.salt'));
        $administrator->salt=config('auth.salt');
        session(['administrator'=>$administrator]);
    }

    /**
     * 修改个人资料
     * @param $input
     * @throws \Exception
     * @author  sam.shan   <sam.shan@ruis-ims.cn>
     */
    public function updateProfile($input)
    {
        //获取编辑数组

        $data=[
            'cn_name'=>$input['cn_name'],
            'mobile'=>!empty($input['mobile'])?$input['mobile']:NULL,
            'email'=>!empty($input['email'])?$input['email']:NULL,
            'date_of_birth'=>$input['date_of_birth'],
            'sex'=>$input['sex'],
            'introduction'=>$input['introduction'],
            'header_photo'=>$input['header_photo'],
            'attachment_id'=>$input['attachment_id'],
            'updated_at'=>date('Y-m-d H:i:s',time()),
        ];

        //入库
        $upd=DB::table($this->table)->where('id',$input[$this->apiPrimaryKey])->update($data);
        //当返回值为0的时候,表示影响的行数为0,即更新的内容未做任何改变或者说更新的记录不存在数据库中
        if($upd===false) TEA('938');
        //if($upd==0) TEA('805');
        //更新session
        $administrator=session('administrator');
        $administrator->cn_name=$input['cn_name'];
        $administrator->header_photo=$input['header_photo'];
        session(['administrator'=>$administrator]);

        //判断是否需要同步员工表
        $obj=DB::table(config('alias.rrad'))->select('employee_id')->where('id','=',$input[$this->apiPrimaryKey])->first();
        $employee_id=isset($obj->employee_id)?$obj->employee_id:0;
        if($employee_id){
            $m=new Employee();
            $sync=[
                'employee_id'=>$employee_id,
                'name'=>$input['cn_name'],
                'email'=>$input['email'],
                'gender'=>$input['sex'],
                'phone'=>$input['mobile'],
                'description'=>$input['introduction'],
                'attachment_id'=>$input['attachment_id'],
                'birthday'=>$input['date_of_birth'],
                'is_admin'=>1
            ];
            $m->syncSave($sync);
        }

    }



//endregion


//region 登陆
    /**
     * @param $name
     * @param string $fields
     * @return mixed
     * @author sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function  getAdminInfoByName($name,$fields='*')
    {

        return DB::table(config('alias.rrad'))->select($fields)->where('name',$name)->first();

    }

    /**
     * 验证登陆频率
     * @param $name
     * @return bool
     * @todo  暂时不想做,结合登陆日志就可以进行判断了
     * @author sam.shan <sam.shan@ruis-ims.cn>
     */
    public function checkLoginFrequency($name)
    {
        //验证当前用户是否频率登陆
        //验证ip今天是否频繁登录
        //每分钟登陆错误次数检查
        return false;
    }


    /**
     * 更新最后登陆时间
     * @param $id
     * @throws \App\Exceptions\ApiException
     * @author  sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function updateLastLogin($id)
    {
        //入库
        $upd=DB::table($this->table)->where($this->primaryKey,$id)->update(['last_login_at'=>date('Y-m-d H:i:s',time())]);
        if($upd===false) TEA('912','last_login_at');

    }

    /**
     * 登陆日志
     * @param $admin_id
     * @param $ip
     * @param int $login_status
     * @author  sam.shan <sam.shan@ruis-ims.cn>
     */
    public  function keepAdminLoginLog($admin_id,$ip,$login_status=1)
    {

        $data=[
            'admin_id'=>$admin_id,
            'login_ip'=>$ip,
            'login_time'=>time(),
            'login_status'=>$login_status,
        ];
        //入库
        DB::table(config('alias.rrall'))->insert($data);
    }

    /**
     * 登陆日志分页列表
     * @param $input
     * @return mixed
     * @author  sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function getLoginLogList(&$input)
    {
        //1.创建公共builder
        //1.1where条件预搜集
        $where = [];
        !empty($input['admin_name']) && $where[] = ['ra.name', 'like', '%' . $input['admin_name'] . '%'];
        isset($input['login_status']) && isset($input['login_status']) && $where[]=['rall.login_status','=',$input['login_status']];
        //1.2.预生成builder,注意仅仅在get中需要的连表请放在builder_get中
        $builder = DB::table(config('alias.rrall').' as rall')
            ->leftJoin(config('alias.rrad').' as ra','rall.admin_id', '=', 'ra.id');
        //1.3 where条件拼接
        if (!empty($where)) $builder->where($where);
        //2.总共有多少条记录
        $input['total_records'] = $builder->count();
        //3.select查询
        $builder_get=$builder;
        //3.1拼接分页条件
        $builder_get->select('rall.id as admin_id','rall.login_ip','login_time',
            'ra.name as admin_name')
            ->offset(($input['page_no'] - 1) * $input['page_size'])
            ->limit($input['page_size']);
        //3.2 order排序
        if (!empty($input['order']) && !empty($input['sort'])) $builder_get->orderBy('rall.' . $input['sort'], $input['order']);
        //3.3 get查询
        $obj_list = $builder_get->get();
        //4.遍历格式化数据
        foreach($obj_list as $key=>&$value){
            $value->login_time=date('Y-m-d H:i:s',$value->login_time);
        }
        return $obj_list;
    }


//endregion



//region 分配角色


    /**
     * 某个管理员分配了哪些角色
     * @param $admin_id  管理员ID
     * @return mixed
     * @author  sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function getRolesByAdmin($admin_id)
    {
        return   $db_ref_obj=DB::table(config('alias.rri'))->where('admin_id',$admin_id)->pluck('role_id');
    }

    /**
     * 保存分配的角色
     * @param $input
     */
    public  function  admin2role($input)
    {
        //1.获取数据库中该管理员已经分配的角色
        $db_ref_obj=DB::table(config('alias.rri'))->where('admin_id',$input['admin_id'])->pluck('role_id');
        $db_ids=obj2array($db_ref_obj);
        //2.获取前端传递的附件
        $input_ids=(array)$input['role_ids'];
        //3.通过颠倒位置的差集获取改动情况,多字段要考虑编辑的情况额[有的人喜欢先删除所有然后变成全部添加,这种是错误的投机取巧行为,要杜绝!]
        $set=get_array_diff_intersect($input_ids,$db_ids);

        if(!empty($set['add_set']) || !empty($set['del_set']) || $set['common_set'])  $m=new Identity();
        //4.要添加的
        if(!empty($set['add_set']))  $m->addSet($set['add_set'],$input['admin_id']);
        //5.要删除
        if(!empty($set['del_set']))  $m->delSet($set['del_set'],$input['admin_id']);
    }
//endregion















}