<?php
/**
 * Created by PhpStorm.
 * User: ruiyanchao
 * Date: 2017/11/2
 * Time: 上午11:01
 */
namespace App\Console\Commands;

use App\Libraries\Log4php;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class TestCron extends Command
{
    /**
     * 控制台命令 signature 的名称。
     * php artisan cron:test
     * @var string
     */
    protected $signature = 'cron:test';

    /**
     * 控制台命令说明。
     * php artisan help  cron:test命令后的输出内容
     * @var string
     *
     */
    protected $description = '测试定时任务';

    /**
     * 创建一个新的命令实例。
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * 执行控制台命令。
     * @return mixed
     */
    public function handle()
    {
        Log4php::info('我被执行了');
    }
}