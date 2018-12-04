<?php
/**
 * Created by PhpStorm.
 * User: lester
 * Date: 2018/10/11 9:12
 * Desc:
 */

namespace App\Jobs;


use App\Http\Models\ProductOrder;
use App\Http\Models\QueueRecord;
use Illuminate\Support\Facades\DB;

class ReleaseProductOrder extends Job
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
        if (empty($input['product_order_id'])) {
            return;
        }

        $arr['code'] = 1;
        $arr['queue_name'] = $this->queue;
        $arr['attempts'] = $this->attempts();
        $arr['input_data'] = $this->inputData;
        $queue_record_id = $this->queueRecordModel->store($arr);
        if ($queue_record_id) {
            session(['queue_record_id' => $queue_record_id]);
        }

        //先判断当前订单是否已经拆过了
        $has = DB::table(config('alias.roo'))->where('production_order_id',$input['product_order_id'])->limit(1)->count();
        if(!$has) {
            // 调用Model 处理消息
            (new ProductOrder())->release($input['product_order_id']);
        }

        //发布完成后，进行自动排产
        (new ProductOrder())->autoPlanAPS($input['product_order_id']);

        /**
         * 如果走到这一步，表示队列处理成功，
         * 更新状态为成功。
         */
        $this->queueRecordModel->updateStatus($queue_record_id, 0, ['code' => 0, 'time' => time(), 'message' => 'Queue Success']);

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
