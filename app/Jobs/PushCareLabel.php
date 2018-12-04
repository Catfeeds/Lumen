<?php
/**
 * Created by PhpStorm.
 * User: lester
 * Date: 2018/11/29 15:08
 * Desc:
 */

namespace App\Jobs;

use App\Http\Models\CareLabel;
use App\Http\Models\QueueRecord;
use App\Libraries\Soap;

class PushCareLabel extends Job
{
    private $inputData;

    private $queueRecordModel;

    /**
     * Create a new job instance.
     *
     * @return void
     */
    public function __construct($inputData)
    {
        //
        $this->inputData = $inputData;
        $this->queueRecordModel = new QueueRecord();

    }

    /**
     * Execute the job.
     *
     * @return void
     * @throws \App\Exceptions\ApiException
     */
    public function handle()
    {
        if (empty($this->inputData)) {
            return;
        }
        $input = $this->inputData;
        if (empty($input['drawing_id'])) {
            return;
        }

        // 添加队列日志
        $arr['code'] = 1;
        $arr['queue_name'] = $this->queue;
        $arr['attempts'] = $this->attempts();
        $arr['input_data'] = $this->inputData;
        $queue_record_id = $this->queueRecordModel->store($arr);
        if ($queue_record_id) {
            session(['queue_record_id' => $queue_record_id]);
        }

        //调用 处理业务的代码
        $CareLabel = new CareLabel();
        $syncData = $CareLabel->getSyncDataByDrawingID($input['drawing_id']);
        $response = Soap::doRequest($syncData, 'INT_SD002200001', '0004', '0022');
        //如果推送成功，则更新 状态为 已推送
        if (isset($response['SERVICERESPONSE']) && isset($response['SERVICERESPONSE']['RETURNCODE']) && $response['SERVICERESPONSE']['RETURNCODE'] == 0) {
            $CareLabel->updatePushed($input['drawing_id']);
        }

        /**
         * 如果走到这一步，表示队列处理成功，
         * 更新状态为成功。
         */
        $this->queueRecordModel->updateStatus($queue_record_id, 0,
            [
                'code' => 0,
                'time' => time(),
                'message' => 'Queue Success',
                'response' => $response
            ]);
    }

    /**
     * 队列消息处理失败后，会调用此函数
     *
     * @param \Exception $exception
     * @return void
     */
    public function failed(\Exception $exception)
    {
        // do somethings
        $errorArr = [
            'Time' => time(),
            'Line' => $exception->getLine(),
            'File' => $exception->getFile(),
            'Message' => $exception->getMessage(),
            'Trace' => $exception->getTraceAsString(),
        ];
        $this->queueRecordModel->updateStatus(session('queue_record_id'), $exception->getCode(), $errorArr);
    }
}
