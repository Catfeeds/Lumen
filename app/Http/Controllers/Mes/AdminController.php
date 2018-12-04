<?php



namespace App\Http\Controllers\Mes;

use App\Http\Models\Account\Admin;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Libraries\Verify;

/**
 *账户管理角色控制器
 *@author   sam.shan <sam.shan@ruis-ims.cn>
 */
class AdminController extends Controller
{
    public function __construct()
    {
        parent::__construct();
        if (empty($this->model)) $this->model = new Admin();
    }

//region  增
    /**
     * 检测唯一性
     * @param Request $request
     * @return string  返回json
     * @throws \App\Exceptions\ApiException
     * @author  sam.shan  <sam.shan@ruis-ims.cn>
     */
    public  function unique(Request $request)
    {
        //获取参数并过滤
        $input=$request->all();
        $where=$this->getUniqueExistWhere($input);
        $input['has']=$this->model->isExisted($where);
        //拼接返回值
        $results=$this->getUniqueResponse($input);
        return  response()->json(get_success_api_response($results));
    }

    /**
     * 添加
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @author  sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function store(Request $request)
    {
        //获取所有参数
        $input=$request->all();
        $this->model->checkFormFields($input);
        //呼叫M层进行处理
        $insert_id=$this->model->add($input);
        //获取返回值
        $results=[$this->model->apiPrimaryKey=>$insert_id];
        return  response()->json(get_success_api_response($results));
    }

//endregion
//region  修
    /**
     * 编辑
     * @param  \Illuminate\Http\Request  $request  Request实例
     * @return  \Illuminate\Http\JsonResponse     返回json格式
     * @author  sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function update(Request $request)
    {
        //过滤,判断并提取所有的参数
        $input = $request->all();
        $this->model->checkFormFields($input);
        //呼叫M层进行处理
        $this->model->update($input);
        //获取返回值
        return  response()->json(get_success_api_response([$this->model->apiPrimaryKey=>$input[$this->model->apiPrimaryKey]]));
    }

//endregion
//region  查

    /**
     * 查看详情
     * @param  \Illuminate\Http\Request  $request  Request实例
     * @return  \Illuminate\Http\JsonResponse     返回json格式
     * @author  sam.shan   <sam.shan@ruis-ims.cn>
     */
    public function show(Request $request)
    {
        //判断ID是否提交
        $id = $request->input($this->model->apiPrimaryKey);
        if(empty($id) || !is_numeric($id)) TEA('700',$this->model->apiPrimaryKey);
        //呼叫M层进行处理
        $results= $this->model->get($id);
        return  response()->json(get_success_api_response($results));
    }


    /**
     * 分页列表页[需要传递分页参数]
     * @param Request $request
     * @return  \Illuminate\Http\Response
     * @author   sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function  pageIndex(Request $request)
    {
        $input=$request->all();
        //分页参数判断
        $this->checkPageParams($input);
        //获取数据
        $obj_list=$this->model->getAdminList($input);
        //获取返回值
        $paging=$this->getPagingResponse($input);
        return  response()->json(get_success_api_response($obj_list,$paging));
    }

    /**
     * 获取登陆日志
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @author sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function loginLog(Request $request)
    {
        $input=$request->all();
        //过滤
        trim_strings($input);
        //分页参数判断
        $this->checkPageParams($input);
        //获取数据
        $obj_list=$this->model->getLoginLogList($input);
        //获取返回值
        $paging=$this->getPagingResponse($input);
        return  response()->json(get_success_api_response($obj_list,$paging));

    }



//endregion
//region  删

    /**
     * 删除
     * @param  \Illuminate\Http\Request  $request  Request实例
     * @return  string    返回json格式
     * @author   Bruce.Chu  <Bruce.Chu@ruis-ims.cn>
     */
    public function delete(Request $request)
    {
        //判断ID是否提交
        $id = $request->input($this->model->apiPrimaryKey);
        if(empty($id) || !is_numeric($id)) TEA('700',$this->model->apiPrimaryKey);
        //呼叫M层进行处理
        $this->model->delete($id);
        //获取返回值
        return  response()->json(get_success_api_response([$this->model->apiPrimaryKey=>$id]));
    }

//endregion



//region 登陆

    /**
     * 登陆
     * 注意: 登陆失败后是否要重置验证码呢?不需要,因为我们可以将获取的验证码设置有效期
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     * @throws \Illuminate\Container\EntryNotFoundException
     * @author  sam.shan   <sam.shan@ruis-ims.cn>
     * @since lesteryou 2018-04-24 去除验证码
     */
    public function login(Request $request)
    {
            //禁止重复登陆
            if (!empty(session('administrator')->admin_id))   TEA('935');
            //第一步 参数检测
            $input=$request->all();
            if(empty($input['name'])) TEA('700','name');
            if(empty($input['password'])) TEA('700','password');
//            if(empty($input['captcha'])) TEA('700','captcha');
//            //测试组进行自动化测试的
//            if($input['captcha']!=config('auth.auto_test')){
//                if(!($this->checkVerify($input['captcha']))) TEA('906','captcha');
//            }
            //第二步  验证登陆频率 如果要求这一行为,则记录登陆日志得放到第二步与第三步之前记录
            $this->model->checkLoginFrequency($input['name']);
            //第三步 核实用户信息
            $admin=$this->model->getAdminInfoByName($input['name'],['id as admin_id','name','company_id','factory_id','cn_name','status','superman','password','salt','header_photo']);
            if(empty($admin))   TEA('907','name');
            //看看是否激活
            if(empty($admin->status))  TEA('908','name');

            //将前端加密后的密码进行rsa解密
            if(isset($input['is_encrypt_rsa']) && $input['is_encrypt_rsa'] == 1){
                $new_rsa = new \App\Libraries\Rsa($input['password']);
                $input['password'] = $new_rsa->deRSA();
            }

            //验证密码  分开验证的好处是防止sql万能注入登录 所以不要同时拼接条件进行验证
            if(encrypted_password($input['password'],$admin->salt) != $admin->password)  TEA('907','password');
            //第四步 更新最后登陆时间
            $this->model->updateLastLogin($admin->admin_id);
            //第五步   记录登录日志
            $this->model->keepAdminLoginLog($admin->admin_id,$request->getClientIp());
            //第六步   通过后打入烙印
            session(['administrator'=>$admin]);
            //拼接返回值
            return  response()->json(get_success_api_response(['admin_name'=>$admin->name,'next_url'=>url('/')]));
//            return  response()->json(get_success_api_response(['admin_name'=>$admin->name,'next_url'=>url(session('callbackUrl')?:'/')]));

    }

    /**
     * 检测输入的验证码是否正确
     * @param  string $code $code为用户输入的验证码字符串
     * @param  int $id       当一个页面有多个验证码的时候，这个是指明是哪个
     * @return [type]       [description]
     * @author  sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function checkVerify($code, $id = '')
    {
        $verify = new Verify();
        return $verify->check($code, $id);
    }


    /**
     * 生成验证码
     */
    public function makeCaptcha(Request $request)
    {

        $config=array(
            'imageW'=>$request->input('imageW',0), //验证码宽度 设置为0为自动计算
            'imageH'=>$request->input('imageH',0), //验证码高度 设置为0为自动计算
            'length'=>$request->input('length',4), //验证码位数
            'fontSize'=>$request->input('fontSize',12), //验证码字体大小（像素） 默认为25
            'fontttf'=>$request->input('fontttf','5.ttf'), //指定验证码字体 默认为随机获取
            'useImgBg'=>$request->input('useImgBg',false), //是否使用背景图纸 默认为false
            'useCurve'=>$request->input('useCurve',false), //是否使用混淆曲线 默认为true
            'useNoise'=>$request->input('useNoise',false), //是否添加杂点 默认为true
            'useZh'=>$request->input('useZh',false), //是否使用中文验证码
            'save'=>true,//是否保存成图纸
        );
        //参数检测
        if($config['imageW']>500)  TEA('700','imageW');
        if($config['imageH']>500)  TEA('700','imageH');
        //生成验证码
        $Verify = new Verify($config);
        $path=$Verify->entry();//同一个用户如果有多处交互界面需要用到验证码,则传递$id值即可,每处的值不同即可搞定了

        //返回值
        return  response()->json(get_success_api_response(['captcha'=>ltrim($path,'.')]));

    }




//endregion



//region 分配角色
    /**
     * 列表[需要传递分页参数]
     * @param Request $request
     * @return  \Illuminate\Http\Response
     * @author  sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function  selectedRole(Request $request)
    {
        $admin_id=$request->input('admin_id');
        if(empty($admin_id)) TEA('700','admin_id');
        $obj_list=$this->model->getRolesByAdmin($admin_id);

        return  response()->json(get_success_api_response($obj_list));
    }
    /**
     * 保存分配的角色
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     * @author sam.shan <sam.shan@ruis-ims.cn>
     */
    public function  admin2role(Request $request)
    {
        //参数处理
        $input=$request->all();
        trim_strings($input);
        if(empty($input['admin_id']))  TEA('700','admin_id');
        if(!isset($input['role_ids'])) TEA('700','role_ids');
        $this->model->admin2role($input);
        //获取返回值
        return response()->json(get_success_api_response(['role_ids'=>$input['role_ids']]));
    }
//endregion









}