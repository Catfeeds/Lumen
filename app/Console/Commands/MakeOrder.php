<?php
/**
 * Created by PhpStorm.
 * User:  sam.shan <sam.shan@ruis-ims.cn>
 * Time:  2018年03月11日14:03:07
 */
namespace App\Console\Commands;

use App\Http\Models\ProductOrder;

use App\Http\Models\WorkOrder;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;


class MakeOrder extends Command
{
    /**
     * 控制台命令 signature 的名称。
     * php artisan make:order
     * @var string
     */
    protected $signature = 'make:order {production_order_id}';

    /**
     * 控制台命令说明。
     * php artisan help  cron:test命令后的输出内容
     * @var string
     *
     */
    protected $description = '创建测试订单';

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

        //参数获取
        $production_order_id=$this->argument('production_order_id');
        //还是先清理一下吧
        DB::table(config('alias.roo'))->where('production_order_id','=',$production_order_id)->delete();
        DB::table(config('alias.rwo'))->where('production_order_id','=',$production_order_id)->delete();

        //发布PO
        $m=new ProductOrder();
        $m->release($production_order_id);
        //拆WT

        $operation_orders= DB::table(config('alias.roo'))
            ->where('production_order_id',$production_order_id)
            ->get();


        $m=new WorkOrder();
        foreach($operation_orders as $key=>$value){
            $input=[
                'split_rules'=>[ceil($value->qty/2),$value->qty-ceil($value->qty/2)],
                'operation_order_id'=>$value->id,
            ];
            $m->split($input);
        }

        //分配工位机

        $work_orders=DB::table(config('alias.rwo'))
            ->where('production_order_id',$production_order_id)
            ->get();

        foreach($work_orders as $key=>$value) {
            //获取工单对应的工序以及资源
            $record = DB::table(config('alias.roo'))->select('operation_id','operation_ability')->where('id', '=', $value->operation_order_id)->first();

            $tmp = date('Y-m-d', time());
            $data = [
                'status' => 2,
                'factory_id' => 3,
                'work_shop_id' => 1,
                'work_center_id' => 4,
                'work_shift_id' => 4,
                'work_station_time' => strtotime($tmp),
                'plan_start_time' => strtotime($tmp . ' 8:00:00'),
                'plan_end_time' => strtotime($tmp . ' 9:00:00'),
                'operation_id' => $record->operation_id,
                'operation_ability_id' => explode(',', $record->operation_ability)['0']
            ];
            DB::table(config('alias.rwo'))->where('id', $value->id)->update($data);

        }
    }
}


