<?php
/**
 * Created by PhpStorm.
 * User: zhufeng
 * Date: 2018/8/28
 * Time: 下午4:03
 */

namespace App\Http\Controllers\Sap;

use App\Http\Controllers\Controller;
use App\Http\Models\Sap\SyncSapMaterial;
use Illuminate\Http\Request;
use App\Http\Models\SapApiRecord;
use App\Jobs\SyncBomMaterial;

/**
 * 同步 SAP Material 控制器
 * Class syncSapMaterialController
 * @package App\Http\Controllers\Sap
 * @author Bruce.Chu
 */
class SyncSapMaterialController extends Controller
{
    public function __construct()
    {
        parent::__construct();
        if (empty($this->model)) $this->model = new SyncSapMaterial();
    }

    /**
     * SAP导入material（接口同步）
     *
     * 1.先处理请求参数
     * 2.存储到api日志表
     * 3.调用Model处理；有错误则抛出异常
     * 4.返回success
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     * @throws \App\Exceptions\ApiSapException
     */
//    public function syncSapMaterial(Request $request)
//    {
//        $input = $request->all();
//        trim_strings($input);
//        api_to_txt($input, $request->path());
//        $ApiControl = new SapApiRecord();
//        $ApiControl->store($input);
//        //联系M层处理
//        $this->model->syncSapMaterial($input['DATA']);
//        return response()->json(get_success_sap_response($input));
//    }

    /**
     * SAP导入material （队列）
     *
     * 1.先处理请求参数
     * 2.存储到API日志表
     * 3.入队列，等待处理
     * 4.返回请求。
     * 5.脚本处理队列
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     * @throws \App\Exceptions\ApiSapException
     */
    public function syncSapMaterial(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        api_to_txt($input, $request->path());

//        $ApiControl = new SapApiRecord();
//        $api_id = $ApiControl->store($input);

        $input['_type'] = 'materiel';
        $input['REQUEST_URI'] = '/Sap/syncMaterial';
//        $input['_api_id'] = $api_id;
        $job = (new SyncBomMaterial($input))->onQueue('bom_materiel');
        $this->dispatch($job);

        //联系M层处理\
//        $this->model->syncSapMaterial(json_decode($input['DATA'],true));
        return response()->json(get_success_sap_response($input));
    }
}