<?php

namespace App\Http\Controllers\Encoding;

use App\Http\Controllers\Controller;
use App\Http\Models\Encoding\EncodingSetting;
use Illuminate\Http\Request;

class EncodingController extends Controller
{
    protected $model;
    public function __construct()
    {
        parent::__construct();
        if (empty($this->model)){
            $this->model = new EncodingSetting();
        }
    }

    /**
     * 保存编码设置
     */
    public function saveEncodingSetting(Request $request)
    {
        $input = $request->all();
        //检测字段
        $this->model->checkFormFields($input);
        //更新数据
        $this->model->save($input);

        return  response()->json(get_success_api_response(200));
    }

    /**
     * 获取编码设置
     */
    public function showEncodingSetting(Request $request)
    {
        $input = $request->all();
        $results = $this->model->show($input);
        return  response()->json(get_success_api_response($results));
    }

    public function useEncoding(Request $request){
        $setting_id = $request->input('setting_id');
        if(empty($setting_id)) TEA('700','setting_id');
        $encoding = $request->input('encoding');
        if(empty($setting_id)) TEA('700','encoding');
        $encoding = $this->model->useEncoding($setting_id,$encoding);
        return response()->json(get_success_api_response($encoding));
    }

    /**
     * 根据编码设置产生编码
     */
    public function getEncoding(Request $request)
    {
        $input = $request->all();
        if(!isset($input['type_code'])) TEA('700','type_code');
        if(empty($input['type'])) TEA('700','type');
        $result = $this->model->get($input);
        return  response()->json(get_success_api_response($result));
    }
}


