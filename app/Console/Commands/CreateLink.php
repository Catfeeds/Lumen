<?php
/**
 * Created by PhpStorm.
 * User: ruiyanchao
 * Date: 2017/11/2
 * Time: 上午11:01
 */
namespace App\Console\Commands;

use Illuminate\Console\Command;


class CreateLink extends Command
{
    /**
     * 控制台命令 signature 的名称。
     * php artisan cron:test
     * @var string
     */
    protected $signature = 'Create:link  {path*}';

    /**
     * 控制台命令说明。
     * php artisan help  cron:test命令后的输出内容
     * @var string
     *
     */
    protected $description = '创建软链,需要传入俩个系统路径参数，如php artisan Create:link /home/www  /home/public 表示在home/public下创建一个软链指向  /home/www';

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
        $path    = $this->argument('path');
        if (!is_dir($path[0])){
            $this->info('要链接的目录不存在');
            exit();
        }

        if(!is_dir($path[1])){
            mkdir($path[2]);
        }
        @exec('ln -s '.$path[0].' '.$path[1]);
        $this->info('The  directory has been linked');
    }
}