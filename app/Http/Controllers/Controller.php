<?php
/**
 * Created by Lumen.
 * User: Lumen
 * Date: 17/9/21
 * Time: 上午9:48
 */

namespace App\Http\Controllers;//定义命名空间
use Laravel\Lumen\Routing\Controller as BaseController;
use Symfony\Component\HttpFoundation\Request;//引入Lumen底层控制器




/**
 * 应用模块底层控制器
 * @author  sam.shan   <sam.shan@ruis-ims.cn>
 */
class Controller extends BaseController
{
    /**
     * 控制器连接M层的实例
     * @var
     */
    protected  $model;
    /**
     * 构造方法,由于父类未定义构造方法,所以不需要执行parent::__construct()
     */
    public function __construct()
    {
        $this->middleware('token');
        $this->middleware('dm');
        $this->middleware('login');
        $this->middleware('vars');
        $this->middleware('auth');
    }

//region  检
    /**
     * 检测分页传递参数的公共方法
     * @param array $input request
     * @throws \App\Exceptions\ApiException
     * @author sam.shan  <sam.shan.@ruis-ims.cn>
     */
    public function checkPageParams(&$input)
    {
        //过滤
        trim_strings($input);
        if(empty($input['page_no']) || !is_numeric($input['page_no'])  || $input['page_no'] < 1) TEA('700','page_no');
        if(empty($input['page_size']) || !is_numeric($input['page_size']) || $input['page_size']  > 100 || $input['page_size']  < 0) TEA('700','page_size');
    }


    /**
     * 检测操作日志传递参数的公共方法
     * @param $input request
     * @throws \App\Exceptions\ApiException
     * @author sam.shan  <sam.shan.@ruis-ims.cn>
     */
    public function checkTraceParams($input)
    {
        if(empty($input['owner_type']))  TEA('owner_type','700');
        if(empty($input['owner_id']))  TEA('owner_id','700');
    }


    /**
     * 检测表格编辑传递参数的公共方法
     * @param $input request
     * @throws \App\Exceptions\ApiException
     * @author sam.shan  <sam.shan.@ruis-ims.cn>
     */
    public function checkTableParams($input)
    {
        if(empty($input['pk']))  TEA('pk','700');
        if(empty($input['field']))  TEA('field','700');
        if(!isset($input['value']) || $input['value']==='')  TEA('value','700');
    }

//endregion
//region  响
    /**
     * 统一获取分页时候的响应信息
     * @param $input
     * @return array
     * @author  sam.shan   <sam.shan@ruis-ims.cn>
     */
    public function getPagingResponse($input)
    {
        return [
              'page_size'=>$input['page_size'],
              'page_index'=>$input['page_no'],
              'total_records'=>isset($input['total_records'])?$input['total_records']:0,
             ];
    }

    /**
     * 统一获取唯一性检查的时候的响应信息
     * @param $input
     * @return array
     * @author  sam.shan   <sam.shan@ruis-ims.cn>
     */
    public function getUniqueResponse($input)
    {
        return ['exist'=>$input['has'],'field'=>$input['field'],'value'=>$input['value']];
    }

    /**
     * 上传附件的返回
     * @param $input
     * @return array
     * @author   sam.shan   <sam.shan@ruis-ims.cn>
     */
    public  function getUploadAttachmentResponse($input)
    {

        return [
            'path'=>$input['path'],
            'attachment_id'=>$input['attachment_id'],
            'creator'=>!empty(session('administrator')->name)?session('administrator')->name:'',
            'time'=>date('Y-m-d H:i:s',time()),
        ];

    }
//endregion
//region 条

    /**
     * 获取唯一存在的判断条件
     * @param $input
     * @return array
     * @throws \App\Exceptions\ApiException
     * @author  sam.shan  <sam.shan@ruis-ims.cn>
     */
    public  function  getUniqueExistWhere(&$input)
    {
        trim_strings($input);
        //field
        if(empty($input['field'])) TEA('700','field');
        //value
        if(empty($input['value'])) TEA('700','value');
        //拼接where条件
        $where=[[$input['field'],'=',$input['value']]];
        if(!empty($input['id'])) $where[]=[$this->model->primaryKey,'<>',$input['id']];
        return $where;
    }

//endregion













}
