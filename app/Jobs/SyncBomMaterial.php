<?php

namespace App\Jobs;

use App\Http\Models\SapApiRecord;
use App\Http\Models\Sap\SyncSapMaterial;
use App\Http\Models\Sap\ImportSapBom;

class SyncBomMaterial extends Job
{

    private $input;

    /**
     * Create a new job instance.
     * @param array $input
     * @return void
     */
    public function __construct($input)
    {
        //
        $this->input = $input;
    }


    /**
     * Execute the job.
     *
     * @return void
     * @throws \App\Exceptions\ApiException
     * @throws \App\Exceptions\ApiSapException
     */
    public function handle()
    {
        if (empty($this->input)) {
            return;
        }
        $input = $this->input;
        $input['returnCode'] = 2499;    // 队列里面的接口日志 code 默认为2499
        $type = $input['_type'];

        $ApiControl = new SapApiRecord();
        $api_id = $ApiControl->store($input);
        if ($api_id) {
            session(['sap_api_record_id' => $api_id]);
        }

        if ($type == 'bom') {
            // bom处理类
//            trim_strings($input);
            (new  ImportSapBom())->importSapBomData($input['DATA']);
        } else {
            // materiel
//            trim_strings($input);
            //联系M层处理
            (new SyncSapMaterial())->syncSapMaterial($input['DATA']);
        }

        /**
         * 如果走到这一步，表示队列处理成功，
         * 更新状态为成功。
         */
        $ApiControl->updateStatus($api_id, 0, ['code' => 0, 'time' => time(), 'message' => 'Queue Success']);
    }

    /**
     * 队列消息处理失败后，会调用此函数
     *
     * @param \Exception $exception
     * @return void
     */
    public function failed(\Exception $exception)
    {
        $errorArr = [
            'Time' => time(),
            'Line' => $exception->getLine(),
            'File' => $exception->getFile(),
            'Message' => $exception->getMessage(),
            'Trace' => $exception->getTraceAsString(),
        ];
        (new \App\Http\Models\SapApiRecord())->updateStatus(session('sap_api_record_id'), $exception->getCode(), $errorArr);
    }
}
