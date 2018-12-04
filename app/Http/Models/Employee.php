<?php
/**
 * Created by PhpStorm.
 * User: ruiyanchao
 * Date: 2018/1/19
 * Time: 下午3:53
 */
namespace App\Http\Models;//定义命名空间
use App\Exceptions\ApiException;
use App\Http\Models\Account\Admin;
use function GuzzleHttp\Psr7\parse_header;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Support\Facades\Storage;

/**
 * BOM操作类
 * @author  rick
 * @time    2017年10月19日13:39:39
 */
class Employee extends Base
{
    public $apiPrimaryKey = 'employee_id';

    public function __construct()
    {
        parent::__construct();
        $this->table = config('alias.re');
    }

    //region 检
    /**
     * 制定规则
     * @return array
     */
    public function getRules()
    {
        return array(

            'cookie'   => array('name'=>'cookie','type'=>'string','require'=>true,'on'=>'add,update','desc'=>'客户端cookie'),
            'name'     => array('name'=>'name','type'=>'string','require'=>true,'on'=>'add,update','desc'=>'姓名'),
            'email'    => array('name'=>'email','type'=>'string','require'=>false,'on'=>'add,update','desc'=>'邮箱'),
            'gender'   => array('name'=>'gender','type'=>'int','require'=>true,'on'=>'add,update','desc'=>'性别'),
            'native_province' => array('name'=>'native_province','type'=>'int','require'=>false,'default'=>0,'on'=>'add,update','desc'=>'籍贯省份'),
            'department_id' => array('name'=>'department_id','type'=>'int','require'=>true,'on'=>'add,update','desc'=>'部门'),
            'position_id'=> array('name'=>'position_id','type'=>'int','require'=>true,'on'=>'add,update','desc'=>'岗位'),
            'education_degree_id'=>array('name'=>'education_degree_id','type'=>'int','on'=>'add,update','require'=>false,'desc'=>'教育水平'),
            'phone'=> array('name'=>'phone','type'=>'string','require'=>false,'desc'=>'电话','on'=>'add,update'),
            'fax'=> array('name'=>'fax','type'=>'string','require'=>false,'desc'=>'传真','on'=>'add,update'),
            'mobile'=> array('name'=>'mobile','type'=>'string','require'=>false,'default'=>'','desc'=>'手机','on'=>'add,update'),
            'address'=> array('name'=>'address','type'=>'string','require'=>false,'default'=>'','desc'=>'地址','on'=>'add,update'),
            'birthday'=> array('name'=>'birthday','type'=>'string','require'=>false,'desc'=>'地址','on'=>'add,update'),
            'ID_number'=> array('name'=>'ID_number','type'=>'string','require'=>false,'desc'=>'身份证号','on'=>'add,update'),
            'working_years'=> array('name'=>'working_years','type'=>'int','require'=>false,'default'=>0,'desc'=>'工作经验','on'=>'add,update'),
            'entry_date'=> array('name'=>'entry_date','type'=>'string','require'=>false,'default'=>'','desc'=>'入职日期','on'=>'add,update'),
            'resignation_date'=> array('name'=>'resignation_date','type'=>'string','require'=>false,'desc'=>'离职日期','on'=>'add,update'),
            'attachment_id'=> array('name'=>'attachment_id','type'=>'string','require'=>false,'desc'=>'头像','on'=>'add,update'),
            'now_address'=> array('name'=>'now_address','type'=>'string','require'=>false,'default'=>'','desc'=>'现居地','on'=>'add,update'),
            'description'=> array('name'=>'description','type'=>'string','require'=>false,'desc'=>'描述','on'=>'add,update'),
            'status'=> array('name'=>'status','type'=>'int','require'=>true,'desc'=>'员工状态','on'=>'add,update'),
            'employee_id'=> array('name'=>'employee_id','type'=>'int','require'=>true,'desc'=>'主键ID','on'=>'update'),
            'employee_type'=> array('name'=>'employee_type','type'=>'int','default'=>0,'require'=>false,'desc'=>'员工类型','on'=>'add,update'),
            'recruiting_source'=> array('name'=>'recruiting_source','type'=>'int','default'=>0,'require'=>false,'desc'=>'招聘来源','on'=>'add,update'),

        );
    }

    public function checkFormField(&$input){
        $add = $this->judgeApiOperationMode($input);
        // if(empty($input['card_id'])) TEA('700','card_id');
        // $check = $add ? [['card_id','=',$input['card_id']]] : [['id','<>',$input[$this->apiPrimaryKey]],['card_id','=',$input['card_id']]];
        // $has = $this->isExisted($check);
        // if($has) TEA('700','card_id');
        if(!preg_match(config('app.pattern.emplyee_card_id'),$input['card_id'])) TEA('700','card_id');
        // if(empty($input['password'])) TEA('700','password');
        if(!preg_match(config('app.pattern.emplyee_password'),$input['password'])) TEA('700','password');
        $input['company_id'] = isset($input['company_id']) ? $input['company_id'] : 0;
        $input['factory_id'] = isset($input['factory_id']) ? $input['factory_id'] : 0;
        $input['workshop_id'] = isset($input['workshop_id']) ? $input['workshop_id'] : 0;
        $input['workcenter_id'] = isset($input['workcenter_id']) ? $input['workcenter_id'] :0 ;
        if(!isset($input['is_admin']) || ($input['is_admin'] != 0 && $input['is_admin'] != 1)) TEA('700','is_admin');
        if(empty($input['position_id'])) TEA('700','position_id');
        if($input['is_admin']){
            if(empty($input['admin_username'])) TEA('700','admin_username');
            if($add && empty($input['admin_password'])) TEA('700','admin_password');
            $role_ids = DB::table(config('alias.repr'))->where('position_id',$input['position_id'])->pluck('role_id');
            $input['role_ids'] = obj2array($role_ids);
        }
        if(empty($input['dep_company_id'])) TEA('700','dep_company_id');
        if(!empty($input['department_id'])){
            $root = DB::table(config('alias.rd'))->select('root_node')->where('id',$input['department_id'])->first();
            if($root){
                if(!empty($root->root_node)) $input['dep_factory_id'] = $root->root_node;
            }
        }
    }
    //endregion

    //region 查
    public function getEmployeeList(&$input)
    {
        !empty($input['name']) &&  $where[]=['a1.name','like','%'.$input['name'].'%'];  //名称
        !empty($input['gender']) &&  $where[]=['a1.gender','like',$input['gender']];
        !empty($input['status']) &&  $where[]=['a1.status_id','=',$input['status']];
        !empty($input['card_number']) &&  $where[]=['a1.id','=',$input['card_number']];
        !empty($input['department_id']) &&  $where[]=['a1.department_id','=',$input['department_id']];
        !empty($input['position_id']) &&  $where[]=['a1.position_id','=',$input['position_id']];
//        !empty($input['role_id']) &&  $where[]=['a1.role_id','=',$input['role_id']];
        !empty($input['phone']) &&  $where[]=['a1.phone','=',$input['phone']];
        !empty($input['email']) &&  $where[]=['a1.email','=',$input['email']];
        !empty($input['admin_name']) &&  $where[]=['a3.name','like','%'.$input['admin_name'].'%'];
        !empty($input['workcenter_id']) && $where[] = ['a1.workcenter_id','=',$input['workcenter_id']];

        $builder = DB::table($this->table.' as a1')
            ->select('a1.id as id',//卡号
                'a1.card_id as card_number',
                'a1.name',
                'a1.gender as sex',
//                'a2.name as role_name',
                'a3.name as admin_name',
                'a1.status_id as status',
                'a4.name as department_name',
                'a5.name as position_name',
                'a1.phone',
                'a1.email',
                'a1.description')
//            ->leftJoin(config('alias.rrr').' as a2','a2.id','=','a1.role_id')
            ->leftJoin(config('alias.rrad').' as a3','a3.id','=','a1.creator_id')
            ->leftJoin(config('alias.rd').' as a4','a4.id','=','a1.department_id')
            ->leftJoin(config('alias.rep').' as a5','a5.id','=','a1.position_id')
            ->offset(($input['page_no']-1)*$input['page_size'])
            ->limit($input['page_size']);

        if (!empty($where)) $builder->where($where);
        //order  (多order的情形,需要多次调用orderBy方法即可)
        if (!empty($input['order']) && !empty($input['sort'])) $builder->orderBy( 'a1.'.$input['sort'], $input['order']);
        //get获取接口
        $obj_list = $builder->get();
        //总共有多少条记录
        $count_builder= DB::table($this->table.' as a1');
        if (!empty($where))
            $count_builder
//                ->leftJoin(config('alias.rrr').' as a2','a2.id','=','a1.role_id')
                ->leftJoin(config('alias.rrad').' as a3','a3.id','=','a1.creator_id')
                ->leftJoin(config('alias.rd').' as a4','a4.id','=','a1.department_id')
                ->leftJoin(config('alias.rep').' as a5','a5.id','=','a1.position_id')
                ->where($where);
        $input['total_records']=$count_builder->count();
        return $obj_list;
    }

    public function getEmplyeeSelect($input){
        $where = [];
        $where[] = ['status_id','=',1];
        if(!empty($input['department_id'])) $where[] = ['department_id','=',$input['department_id']];
        if(!empty($input['workcenter_id'])) $where[] = ['workcenter_id','=',$input['workcenter_id']];
        $obj_list = DB::table($this->table)->select('id','name')->where($where)->get();
        return $obj_list;
    }

    public function getRoles()
    {
        $obj_list = DB::table(config('alias.rrr'))->select('id','name')->get();
        return $obj_list;
    }

    public function getDepartments()
    {
        $obj_list = DB::table(config('alias.rd'))->select('id','name')->get();
        return $obj_list;
    }

    public function getPositions()
    {
        $obj_list = DB::table(config('alias.rep'))->select('id','name')->get();
        return $obj_list;
    }

    /**
     * 查看详情
     * @param $id  int  主键id
     * @return object   返回的是一个对象
     * @author  rick
     */
    public function get($id)
    {
        $obj=$this->getRecordById($id);
        if(empty($obj)) TEA('404');
        $obj->entry_date = date("Y-m-d",$obj->entry_date);
        $obj->resignation_date = $obj->resignation_date==''?'':date("Y-m-d",$obj->resignation_date);
        $obj->birthday = $obj->birthday==''?'':date("Y-m-d",$obj->birthday);
        $attachment =DB::table(config('alias.attachment'))->where('id','=',$obj->attachment_id)->first();
        if(!empty($attachment)){
            $obj->attachment_url =  $attachment->path;
        }else{
            $obj->attachment_url =  '';
        }
        if($obj->is_admin){
            $admin = DB::table(config('alias.rrad'))->select('name')->where('id',$obj->admin_id)->first();
            if($admin) $obj->admin_username = $admin->name;
        }

        if(!$obj) TEA('404');
        return $obj;
    }

    //endregion

    //region 增
    public function add($input)
    {
        $this->checkRules($input);
        //$creator_id = $this->getUserFieldByCookie($input['cookie'],'id');
        $creator_id = (!empty(session('administrator')->admin_id)) ? session('administrator')->admin_id : 0;
        $data = [
            'creator_id'=> $creator_id,        //创建人
            'name'      => $input['name'],     //姓
            'email'     => $input['email'],    //邮箱
            'gender'    => $input['gender'],   //性别
            'native_province' => $input['native_province'],         //籍贯
            'department_id'   => $input['department_id'],           //部门ID
            'position_id'     => $input['position_id'],             //岗位ID
            'education_degree_id' => $input['education_degree_id'], //教育水平
            'phone'=>$input['phone'],               //电话
            'fax'=>$input['fax'],                   //传真
            'mobile'=>$input['mobile'],             //座机
            'address'=>$input['address'],           //地址
            'birthday' => empty($input['birthday'])?'':strtotime($input['birthday']),       //生日
            'ID_number'   => $input['ID_number'],   //身份证
            'working_years' => $input['working_years'],       //工龄
            'entry_date' => strtotime($input['entry_date']),             //入职时间
            'resignation_date' => empty($input['resignation_date'])?'':strtotime($input['resignation_date']),  //离职时间
//            'role_id' => $input['role_id'],      //关联角色
            'attachment_id' => $input['attachment_id'],        //头像
            'now_address'=>$input['now_address'],  //现居地址
            'status_id' => $input['status'],          //状态
            'description' => $input['description'],//描述
            'employee_type_id'=>$input['employee_type'],
            'recruiting_source_id'=>$input['recruiting_source'],
            'ctime'=>time(),
            'card_id'=>$input['card_id'],//工位机卡号
            'password'=>$input['password'],//工位机密码
            'company_id'=>$input['dep_company_id'],
            'factory_id'=>$input['factory_id'],
            'workshop_id'=>$input['workshop_id'],
            'workcenter_id'=>$input['workcenter_id'],
            'is_admin'=>$input['is_admin'],
            'dep_factory_id'=>isset($input['dep_factory_id']) ? $input['dep_factory_id'] : 0,
        ];
        try{
            DB::connection()->beginTransaction();
            $insert_id=DB::table($this->table)->insertGetId($data);
            if($input['is_admin']){
                $adminDao = new Admin();
                $adminData = [
                    'employee_id'=>$insert_id,
                    'cn_name'=>$input['name'],
                    'password'=>$input['admin_password'],
                    'name'=>$input['admin_username'],
                    'sex'=>$input['gender'],
                    'mobile'=>$input['phone'],
                    'email'=>$input['email'],
                    'introduction'=>$input['description'],
                    'attachment_id'=>$input['attachment_id'],
                    'status'=>$input['is_admin'],
                    'company_id'=>$input['dep_company_id'],
                    'date_of_birth'=>$input['birthday'],
                    'role_ids'=>$input['role_ids'],
                    'factory_id'=>isset($input['dep_factory_id']) ? $input['dep_factory_id'] : 0,
                ];
                $attachment =DB::table(config('alias.attachment'))->where('id','=',$input['attachment_id'])->first();
                if($attachment){
                    $adminData['header_photo'] = $attachment->path;
                }
                $admin_id = $adminDao->syncSave($adminData);
                if(!$admin_id) TEA('804');
                DB::table($this->table)->where('id',$insert_id)->update(['admin_id'=>$admin_id]);
            }
        }catch (\ApiException $exception){
            DB::connection()->rollback();
            TEA($exception->getCode());
        }
        DB::connection()->commit();
        //入库
        return  $insert_id;

    }

    /**
     * 导入人员
     * @param $input
     * @throws ApiException
     */
    public function importEmplyeeFromExcelData($input){
        if(empty($input['data'])) TEA('1118');
        foreach ($input['data'] as $k=>$v){

        }
    }

    /**
     * 下载Excel模版
     * @author Bruce.Chu
     */
    public function downloadTemplate()
    {
        //声明数组,设置表头
        $cellData = [
            ['#','#','#男/女','#','#请如实填写系统内的角色','#在职/离职/试用/等待入职','#格式1970-01-01',
                '#请如实填写系统内的部门','#博士研究生/硕士研究生/大学本科/大专/中专/职高/技校/高中/初中/其他',
                '#请如实填写系统内的职位','#11位手机号','#注意邮箱格式','#XXX省/市/自治区/特别行政区', '#', '#',
                '#格式1970-01-01','#格式1970-01-01','#全职/兼职','#内部推荐/网招','#','#无需填写,系统自动识别'],//表头注释
            ['身份证号', '姓名','性别','卡号','角色','员工状态','生日','部门','学历','职位', '手机','邮箱',
                '省份','户籍地址','居住地址','入职日期','离职日期','员工类型','招聘来源','描述','创建人'],//表头
        ];

        //导出Excel
        Excel::create('employee', function ($excel) use ($cellData) {
            $excel->sheet('employee', function ($sheet) use ($cellData) {
                $sheet->rows($cellData);
                //单元格字体大小设置为15号
                $sheet->setFontSize(15);
                //解决导出xls格式文件乱码
                ob_end_clean();
            });
        })->export('xls');
    }

    /**
     * 导入excel
     * @param $input
     * @return BOOL
     * @author Bruce.Chu
     */
    public function excelImport($input)
    {
        $path = $input['path'];
        if (empty($path)) TEA('700', 'path');
        //是否已上传成功
        $has_upload = Storage::disk('public')->exists($path);
        if (!$has_upload) TEA('7029');
        $path = Storage::disk('public')->url($path);
        //去掉/ 以便程序拼接绝对路径
        $path = substr($path, 1);
        //取Excel记录 封装为数组 作为关联数组的value
        $value = [];
        Excel::load($path, function ($reader) use (&$value) {
            $reader = $reader->getSheet(0);
            $value = $reader->toArray();
        });
        //按指定模版上传的excel记录不会小于3行
        if(count($value)<3) TEA('2000');
        //截取表头和表头注释
        array_splice($value, 0, 2);
        //筛 根据员工卡号筛取数据库中无记录的员工 防止重复导入 浪费效率
        //数据中录入的员工卡号
        $card_number = DB::table(config('alias.re'))
            ->pluck('card_id')
            ->toArray();
        //去重
        $value = array_filter($value, function ($v) use ($card_number) {
            //3为card_id在数组中的索引 确保不为null
            if(isset($v[3])) return !in_array($v[3], $card_number, true);
        });
        //过滤之后数组为空即无新记录需导入
        if(empty($value)) TEA('2001');
        //索引重置
        $value=array_values($value);
        //关联数组的key
        $key = ['ID_number', 'name', 'gender', 'card_id', 'status_id', 'birthday', 'department_id',
            'education_degree_id', 'position_id', 'phone', 'email', 'native_province', 'address',
            'now_address', 'entry_date', 'resignation_date', 'employee_type_id', 'recruiting_source_id',
            'description', 'creator_id'];
        //检验模版格式
        if(count($key)!=count($value[0])) TEA('2002');
        $creator_id = (!empty(session('administrator')->admin_id)) ? session('administrator')->admin_id : 0;
//        $roles       = obj2array(DB::table(config('alias.rrr'))->select('id','name')->get());
        //取出数据库中的部门职位等 通过excel单元格的值匹配数据库中的值拿对应id
        $departments = obj2array(DB::table(config('alias.rd'))->select('id', 'name')->get());
        $positions = obj2array(DB::table(config('alias.rd'))->select('id', 'name')->get());
        $educations = config('personnel.education');
        $status = config('personnel.status');
        $type = config('personnel.type');
        $source = config('personnel.source');
        $province = config('personnel.province');
        //数组数据拼接与格式转换
        $data = array_map(function ($v) use ($key, $creator_id, $status, $departments, $educations, $positions, $type, $source, $province) {
            $v[2] = ($v[2] == '男') ? 1 : 2;
            $v[4] = get_id($status, $v[4]);//员工状态
            $v[5] = strtotime($v[5]);//生日
            $v[6] = get_id($departments, $v[6]);//部门
            $v[7] = get_id($educations, $v[7]);//学历
            $v[8] = get_id($positions, $v[8]);//职位
            $v[11] = array_search($v[11], $province);//省份
            $v[14] = strtotime($v[14]);//入职日期
            $v[15] = strtotime($v[15]);//离职日期
            $v[16] = get_id($type, $v[16]);//员工类型
            $v[17] = get_id($source, $v[17]);//招聘来源
            $v[19] = $creator_id;
            //合并为关联数组 以便一次insert入库
            $v = array_combine($key, $v);
            return $v;
        }, $value);
        DB::table($this->table)->insert($data);
    }

    //endregion

    //region 改
    /**
     * 员工增加
     * @param $input
     */
    public function update($input)
    {
        $this->checkRules($input);
        //$creator_id = $this->getUserFieldByCookie($input['cookie'],'id');
        $creator_id = (!empty(session('administrator')->admin_id)) ? session('administrator')->admin_id : 0;
        $data = [
            'creator_id'=> $creator_id,        //创建人
            'name'      => $input['name'],     //姓
            'email'     => $input['email'],    //邮箱
            'gender'    => $input['gender'],   //性别
            'native_province' => $input['native_province'],         //籍贯
            'department_id'   => $input['department_id'],           //部门ID
            'position_id'     => $input['position_id'],             //岗位ID
            'education_degree_id' => $input['education_degree_id'], //教育水平
            'phone'=>$input['phone'],               //电话
            'fax'=>$input['fax'],                   //传真
            'mobile'=>$input['mobile'],             //座机
            'address'=>$input['address'],           //地址
            'birthday' => empty($input['birthday'])?'':strtotime($input['birthday']),       //生日
            'ID_number'   => $input['ID_number'],   //身份证
            'working_years' => $input['working_years'],       //工龄
            'entry_date' => strtotime($input['entry_date']),             //入职时间
            'resignation_date' => empty($input['resignation_date'])?'':strtotime($input['resignation_date']),  //离职时间
//            'role_id' => $input['role_id'],      //关联角色
            'attachment_id' => $input['attachment_id'],        //头像
            'now_address'=>$input['now_address'],  //现居地址
            'status_id' => $input['status'],          //状态
            'description' => $input['description'],//描述
            'employee_type_id'=>$input['employee_type'],
            'recruiting_source_id'=>$input['recruiting_source'],
            'mtime'=>time(),
            'card_id'=>$input['card_id'],//工位机卡号
            'password'=>$input['password'],//工位机密码
            'company_id'=>$input['dep_company_id'],
            'factory_id'=>$input['factory_id'],
            'workshop_id'=>$input['workshop_id'],
            'workcenter_id'=>$input['workcenter_id'],
            'is_admin'=>$input['is_admin'],
            'dep_factory_id'=>isset($input['dep_factory_id']) ? $input['dep_factory_id'] : 0,
        ];

        //入库
        try{
            DB::connection()->beginTransaction();
            DB::table($this->table)->where('id',$input['employee_id'])->update($data);
            if($input['is_admin']){
                $adminDao = new Admin();
                $adminData = [
                    'employee_id'=>$input['employee_id'],
                    'cn_name'=>$input['name'],
                    'name'=>$input['admin_username'],
                    'sex'=>$input['gender'],
                    'mobile'=>$input['phone'],
                    'email'=>$input['email'],
                    'introduction'=>$input['description'],
                    'attachment_id'=>$input['attachment_id'],
                    'status'=>$input['is_admin'],
                    'company_id'=>$input['dep_company_id'],
                    'role_ids'=>$input['role_ids'],
                    'date_of_birth'=>$input['birthday'],
                    'factory_id'=>isset($input['dep_factory_id']) ? $input['dep_factory_id'] : 0,
                ];
                if(!empty($input['admin_password'])) $adminData['password'] = $input['admin_password'];
                $attachment =DB::table(config('alias.attachment'))->where('id','=',$input['attachment_id'])->first();
                if($attachment){
                    $adminData['header_photo'] = $attachment->path;
                }
                $admin_id = $adminDao->syncSave($adminData);
                if($admin_id === false) TEA('804');
            }
        }catch (\ApiException $exception){
            DB::connection()->rollback();
            TEA($exception->getCode());
        }
        DB::connection()->commit();

    }

    /**
     * 同步管理员修改同步人员信息
     * @param $data
     * @return bool
     * @throws \Exception
     * @since lester.you 2018-08-29 如果不是员工，就不需要在更新员工表
     */
    public function syncSave($data){
        if(empty($data['employee_id'])) TE('Parameter employee_id missing or invalid type.');
        $has = $this->isExisted([['id','=',$data['employee_id']]]);
        if($has){
            $save['mtime'] = time();
            if(isset($data['name'])) $save['name'] = $data['name'];//中文名
            if(isset($data['email'])) $save['email'] = $data['email'];//邮箱
            if(isset($data['gender'])) $save['gender'] = $data['gender'];//性别
            if(isset($data['phone'])) $save['phone'] = $data['phone'];//手机号
            if(isset($data['description'])) $save['description'] = $data['description'];//描述
            if(isset($data['attachment_id'])) $save['attachment_id'] = $data['attachment_id'];//附件id
            if(isset($data['birthday'])) $save['birthday'] = $data['birthday'];//出生日期
            if(isset($data['is_admin'])) $save['is_admin'] = $data['is_admin'];//是否是管理员
            $res = DB::table($this->table)->where('id',$data['employee_id'])->update($save);
            if($res === false) return false;
            return true;
        }else{
            return false;
        }
    }
    //endregion
    //region 删
    /**
     * 删除
     * @param $id
     * @throws \Exception
     * @author   rick
     */
    public function destroy($id)
    {
        $employee = $this->getRecordById($id,['is_admin']);
        try{
            DB::connection()->beginTransaction();
            $num=$this->destroyById($id);
            if($employee->is_admin){
                $adminDao = new Admin();
                $res = $adminDao->syncSave(['employee_id'=>$id,'status'=>0,'role_ids'=>[0]]);
            }
        }catch (\ApiException $exception){
            DB::connection()->rollback();
            TEA($exception->getCode());
        }
        DB::connection()->commit();
    }
    //endregion
}