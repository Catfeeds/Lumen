<?php
/**
 * Created by PhpStorm.
 * User: lester
 * Date: 2018/11/14 14:19
 * Desc:
 */

namespace App\Http\Controllers\BPO;


use App\Http\Controllers\Controller;
use App\Http\Models\BPO\ReportForm;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ReportFormController extends Controller
{
    public function __construct()
    {
        parent::__construct();
        empty($this->model) && $this->model = new ReportForm();
    }

    /**
     * 上传Excel并导入到数据库
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function uploadExcel(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        if (empty($input['name'])) TEA('700', 'name');
        if (empty($input['file'])) TEA('700', 'file');

        $input['creator_id'] = (!empty(session('administrator')->admin_id)) ? session('administrator')->admin_id : 0;
        $extension = $input['file']->getClientOriginalExtension();//文件后缀
        if (empty($extension) || !in_array($extension, $this->model->extensionArr)) {
            TEA('1101'); // 不被允许的文件
        }

        $input['file_path'] = Storage::disk('public')->putFileAs(config('app.bpo_report_form') . date('Y-m-d'), $input['file'], md5($input['name'] . time()) . '.' . $extension);
        if (empty($input['file_path'])) TEA('7028'); //上传失败
        $insert_id = $this->model->storeFile($input);
        //读取Excel数据导入数据库中
        $this->model->import($insert_id);
        return response()->json(get_success_api_response(['id' => $insert_id]));
    }

    /**
     * excel导入到数据库
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function import(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        if (empty($input['file_id'])) TEA(700, 'file_id');
        $this->model->import($input['file_id']);
        return response()->json(get_success_api_response(200));
    }

    /**
     * 删除列表
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function delete(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        $this->model->delete($input);
        return response()->json(get_success_api_response(200));
    }

    /**
     * 列表页
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function pageIndex(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        $obj_list = $this->model->pageIndex($input);
        $paging = $this->getPagingResponse($input);
        return response()->json(get_success_api_response($obj_list, $paging));
    }

    /**
     * 内容展示
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function contentList(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        $obj_list = $this->model->contentList($input);
        $paging = $this->getPagingResponse($input);
        return response()->json(get_success_api_response($obj_list, $paging));
    }
}