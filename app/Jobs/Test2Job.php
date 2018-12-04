<?php

namespace App\Jobs;

use Illuminate\Support\Facades\DB;
use Illuminate\Queue\SerializesModels;
use Illuminate\Contracts\Queue\ShouldQueue;
class Test2Job extends Job implements ShouldQueue
{
    use SerializesModels;

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
        sleep(6);
        //处理事务
        DB::table('test_queue')->insertGetId(['msg' => '2 '.$this->msg.' '.date('Y-m-d H:i:s')]);
    }
}
