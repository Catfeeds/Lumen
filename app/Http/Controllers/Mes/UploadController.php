<?php
/**
 * Created by PhpStorm.
 * User: sansheng
 * Date: 17/11/18
 * Time: 下午1:43
 */

/**
 *MES系统通用上传控制器类
 * @author    sam.shan  <sam.shan@ruis-ims.cn>
 */

namespace App\Http\Controllers\Mes;
use App\Http\Controllers\Controller;
use App\Http\Models\Attachment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;


class UploadController extends Controller
{

    /**
     * UploadController constructor.
     */
    public function __construct()
    {
         parent::__construct();
         if(empty($this->model)) $this->model=new Attachment();
    }


    /**
     * 上传附件
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     * @author   sam.shan <sam.shan@ruis-ims.cn>
     *
     * @since 20180514 lester.you
     * Storage::disk()->putFile() 更改为 Storage::disk()->putFileAs()
     */
    public function attachment(Request $request)
    {
        //判断参数
        $input = $request->all();
        trim_strings($input);
        if (empty($input['flag'])) TEA('700', 'flag');
        if (empty($input['attachment'])) TEA('700', 'attachment');
        //存入emi2c-mes磁盘
        $file = $input['attachment'];
        $file_name = $file->getClientOriginalName();
        $extension = $file->getClientOriginalExtension();
        if (!empty($extension) && strtolower($extension) == 'php') TEA('1117');
//        $input['path'] = Storage::disk('public')->putFileAs('attachment/' . $input['flag'] . '/' . date('Y-m-d'), $input['attachment']);
        $input['path'] = Storage::disk('public')->putFileAs('attachment/' . $input['flag'] . '/' . date('Y-m-d'), $input['attachment'], md5($file_name.'_'.time()) . '.' . $extension);
        if (empty($input['path'])) TEA('7028');//上传失败
//        $input['path'] = $input['path'];
        //联系M层预处理
        $input['attachment_id'] = $this->model->add($input);
        //获取返回值
        $results = $this->getUploadAttachmentResponse($input);
        return response()->json(get_success_api_response($results));
    }


    /**
     * 删除附件,先禁止在这里删除,有专门的垃圾回收机制
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     * @author  sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function destroy(Request $request)
    {
        pd('暂时关闭该接口,请前端使用虚拟删除即可,后台会提供自动垃圾回收机制的');
        //判断参数
        $input=$request->all();
        trim_strings($input);

        if(empty($input['attachment_id'])) TEA('700','attachment_id');
        if(empty($input['attachment_path'])) TEA('700','attachment_path');
        //存在才去删除,注意一定去删除真的,而不是删除软链文件
        if(is_file(env('EMI2C_MES_CODE_URL').$input['attachment_path'])) Storage::disk('emi2c-mes')->delete($input['attachment_path']);
        //删除上传临时表中的对应记录
        $this->model->destroy($input['attachment_id']);
        //获取返回值
        return  response()->json(get_success_api_response(['attachment_id'=>$input['attachment_id']]));
    }
}










