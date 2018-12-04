<?php
/**
 * Created by PhpStorm.
 * User: lester
 * Date: 2018/9/26 18:03
 * Desc:
 */

namespace App\Http\Controllers\Mes;


use App\Http\Controllers\Controller;
use App\Http\Models\CareLabel;
use App\Http\Models\SapApiRecord;
use App\Libraries\Soap;
use Illuminate\Http\Request;

class CareLabelController extends Controller
{
    public function __construct()
    {
        parent::__construct();
        $this->model = new CareLabel();
    }

//region 增

    /**
     * 增 & 删 & 改
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function store(Request $request)
    {
        $input = $request->input();
        trim_strings($input);
        $this->model->checkCareLabel($input);
        $this->model->store($input);
        return response()->json(get_success_api_response(200));
    }
//endregion

//region 删
//endregion

//region 改
//endregion

//region 查

    /**
     * 详情
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function show(Request $request)
    {
        $input = $request->input();
        trim_strings($input);
        if (empty($input['drawing_id'])) TEA('700', 'drawing_id');
        $response = $this->model->show($input['drawing_id']);
        return response()->json(get_success_api_response($response));
    }
//endregion

//region other
    /**
     * sap 洗标 翻单
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     * @throws \App\Exceptions\ApiSapException
     */
    public function copyCareLabel(Request $request)
    {
        $input = $request->all();
        trim_strings($input);

        api_to_txt($input, $request->path());
        $SapApiRecord = new SapApiRecord();
        $SapApiRecord->store($input);

        $this->model->checkSapParams($input);
        $this->model->copyCareLabel($input);

        return response()->json(get_success_sap_response($input));
    }

    /**
     * 同步 洗标 给SAP
     * 参数 drawing_id 图片id
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function syncCareLabel(Request $request)
    {
        $input = $request->all();
        if (empty($input['drawing_id'])) {
            TEA('700', 'drawing_id');
        }
        $syncData = $this->model->getSyncDataByDrawingID($input['drawing_id']);
        $response = Soap::doRequest($syncData, 'INT_SD002200001', '0004', '0022');
        //如果推送成功，则更改状态
        if (isset($response['SERVICERESPONSE']) && isset($response['SERVICERESPONSE']['RETURNCODE']) && $response['SERVICERESPONSE']['RETURNCODE'] == 0) {
            $this->model->updatePushed($input['drawing_id']);
        }
        return response()->json(get_success_api_response($response));
    }
//end


}