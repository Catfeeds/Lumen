<?php

namespace App\Providers;

use Illuminate\Queue\Events\JobFailed;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\DB;
use App\Libraries\Log4php;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        //
    }

    public function boot()
    {


//        DB::connection('mongodb')->enableQueryLog();
//        DB::listen(function ($query) {
//            $sql= vsprintf(str_replace("?", "'%s'", $query->sql), $query->bindings).' ['.$query->time.' ms] ';
//            Log4php::debug($sql);
//        });


        /**
         * Queue fail job.
         */
//        Queue::failing(function (JobFailed $event) {
//            // $event->exception
//            $errorArr = [
//                'Time' => time(),
//                'Line' => $event->exception->getLine(),
//                'File' => $event->exception->getLine(),
//                'Message' => $event->exception->getMessage(),
//                'Trace' => $event->exception->getTrace(),
//            ];
//            (new \App\Http\Models\SapApiRecord())->updateStatus(session('sap_api_record_id'), $event->exception->getCode().'_sp', $errorArr);
//        });

    }

}

