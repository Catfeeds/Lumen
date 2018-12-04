<?php

namespace App\Jobs;

class ExampleJob extends Job
{
    /**
     * Create a new job instance.
     *
     * @return void
     */
    public function __construct()
    {
        //
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        //
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
    }
}
