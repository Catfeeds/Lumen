<?php
/**
 * Created by PhpStorm.
 * User: zhufeng
 * Date: 2018/9/17
 * Time: 上午11:18
 */

namespace App\Console\Commands;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
/**
 * 处理工艺路线 工艺路线组关联关系错乱问题
 * Class CleanProcedureRouteRelation
 * @package App\Console\Commands
 * @author Bruce.Chu
 * @date 2018-09-17
 */
class CleanProcedureRouteRelation extends Command
{
    protected $signature = 'clean:procedure-route';

    /**
     * 控制台命令说明。
     * php artisan help clean:procedure-route命令后的输出内容
     * @var string
     *
     */
    protected $description = '处理工艺路线表中的procedure_group_id,该id有可能为脏数据(手动测试的/旧代码关联的)';

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
        //已经关联过工艺路线的工艺路线组id集合
        $has_relation_group=DB::table(config('alias.rgfr'))
            ->distinct()
            ->pluck('procedure_group_id')
            ->toArray();
        //置空不在此集合内的工艺路线组的关联关系
        DB::table(config('alias.rpr'))->whereNotIn('procedure_group_id',$has_relation_group)->update(['procedure_group_id'=>0]);
    }
}