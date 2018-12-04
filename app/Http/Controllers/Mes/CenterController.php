<?php



namespace App\Http\Controllers\Mes;

use App\Http\Models\Account\Admin;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;


/**
 *个人中心控制器
 *@author   sam.shan <sam.shan@ruis-ims.cn>
 */
class CenterController extends Controller
{
    public function __construct()
    {
        parent::__construct();
        if (empty($this->model)) $this->model = new Admin();
    }


//region  账号设置

    /**
     * 查看详情
     * @param  \Illuminate\Http\Request  $request  Request实例
     * @return  \Illuminate\Http\JsonResponse     返回json格式
     * @author  sam.shan   <sam.shan@ruis-ims.cn>
     */
    public function profile()
    {

        $id =session('administrator')->admin_id;
        //呼叫M层进行处理
        $results= $this->model->get($id);
        return  response()->json(get_success_api_response($results));
    }

    /**
     * 修改密码接口
     * @param  \Illuminate\Http\Request  $request  Request实例
     * @return  \Illuminate\Http\JsonResponse     返回json格式
     * @author  sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function updatePassword(Request $request)
    {

        //第一步 参数检测
        $input=$request->all();
        trim_strings($input);
        if(empty($input['old_password']))  TEA('700','old_password');
        if(empty($input['new_password']))  TEA('700','new_password');
        if(empty($input['confirm_password']))  TEA('700','confirm_password');
        if($input['new_password'] != $input['confirm_password']) TEA('701','confirm_password');
        if(!check_admin_password_regular($input['new_password']))  TEA('701','new_password');
        //原密码比对
        $admin_id=session('administrator')->admin_id;
        $old_password=session('administrator')->password;
        $old_salt=session('administrator')->salt;
        if(encrypted_password($input['old_password'],$old_salt) !=$old_password) TEA('937','old_password');
        //呼叫M层进行处理
        $this->model->updatePassword($input);
        //获取返回值
        return  response()->json(get_success_api_response([$this->model->apiPrimaryKey=>$admin_id]));
    }


    /**
     * 修改基础信息
     * @param  \Illuminate\Http\Request  $request  Request实例
     * @return  \Illuminate\Http\JsonResponse     返回json格式
     * @author  sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function updateProfile(Request $request)
    {
        //过滤,判断并提取所有的参数
        $input = $request->all();
        $input[$this->model->apiPrimaryKey]=session('administrator')->admin_id;
        $this->model->checkProfileFormFields($input);
        //呼叫M层进行处理
        $this->model->updateProfile($input);
        //获取返回值
        return  response()->json(get_success_api_response([$this->model->apiPrimaryKey=>$input[$this->model->apiPrimaryKey]]));
    }

//endregion


//region 我的消息


//endregion



//region 登陆日志
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
        $input['admin_name']=session('administrator')->name;
        //获取数据
        $obj_list=$this->model->getLoginLogList($input);
        //获取返回值
        $paging=$this->getPagingResponse($input);
        return  response()->json(get_success_api_response($obj_list,$paging));

    }

//endregion









}