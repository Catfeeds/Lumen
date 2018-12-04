<?php

namespace App\Jobs;

use Illuminate\Support\Facades\DB;
class TestJob extends Job
{
    private $msg;
    /**
     * Create a new job instance.
     * @param string $msg
     * @return void
     */
    public function __construct($msg)
    {
        //
        $this->msg = $msg;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        sleep(4);
        //处理事务
        DB::table('test_queue')->insertGetId(['msg' => '1 '.$this->msg.' '.date('Y-m-d H:i:s')]);
    }
}
