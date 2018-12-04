<?php

/**
 * Created by PhpStorm.
 * User: zhufeng
 * Date: 2018/9/20
 * Time: 上午9:53
 */
namespace App\Libraries\ProductOrderStrategy;
use App\Libraries\ProductOrderStrategy;
use Illuminate\Support\Facades\DB;
use App\Http\Models\Base;
use App\Http\Models\Procedure;
use App\Http\Models\WorkBenchOperationAbility;

/**
 * Mes PO 策略 根据PO的BOM母件绑定的工艺路线找到每个工序对应的唯一工作中心
 * Class MesProductOrderStrategy
 * @package App\Libraries\ProductOrderStrategy
 * @author Bruce.Chu
 */
class MesProductOrderStrategy extends Base implements ProductOrderStrategy
{
    private $input;
    private $workBenchOperationAbilityModel;
    private $procedureModel;
    private static $mesProductOrder;

    public function __construct($input)
    {
        //保存前端传参
        $this->input = $input;
        //引入工作台产能 工艺路线 模型
        $this->workBenchOperationAbilityModel = new WorkBenchOperationAbility();
        $this->procedureModel = new Procedure();
    }

    /**
     * 单例模式 已废弃
     * @param $input
     * @return MesProductOrderStrategy
     */
    public static function getInstance($input)
    {
        if (!self::$mesProductOrder) self::$mesProductOrder = new self($input);
        return self::$mesProductOrder;
    }

    /**
     * Mes PO的产能信息
     * @return array
     */
    public function getWorkCenterInfo()
    {
        $input = $this->input;
        //声明结果返回数组
        $results = [];
        //时间段中实际共有多少天
        $date_num = (strtotime($input['end_date']) - strtotime($input['start_date'])) / 86400 + 1;
        //时间段为开始日期的0:0:0至结束日期的23:59:59
        $input['end_date'] = $input['end_date'] . ' 23:59:59';
        //先找到该po绑定的工艺路线上的工序(有序)
        $operations = DB::table(config('alias.rpo') . ' as po')
            ->leftJoin(config('alias.rpro') . ' as rpro', 'po.routing_id', 'rpro.rid')
            ->select('rpro.oid', 'po.bom_id', 'po.routing_id')
            ->where('po.id', $input['production_order_id'])
            ->orderBy('rpro.order')
            ->distinct()
            ->get()
            ->toArray();
        //去除第一个工序(开始)
        array_shift($operations);
        //遍历工序集合 每个工序对应为一个工作中心 使用游长明定义的sql
        foreach ($operations as $value) {
            //工作中心信息 包括厂 车间 工作中心名称
            $workcenter_info = DB::table(config('alias.rbrw') . ' as rbrw')
                ->leftJoin(config('alias.rbrb') . ' as rbrb', 'rbrb.id', 'rbrw.bom_routing_base_id')
                ->leftJoin(config('alias.rwc') . ' as rwc', 'rwc.id', 'rbrw.workcenter_id')
                ->leftJoin(config('alias.rws') . ' as rws', 'rws.id', 'rwc.workshop_id')
                ->leftJoin(config('alias.rf') . ' as rf', 'rf.id', 'rws.factory_id')
                ->select([
                    'rbrw.workcenter_id',
                    'rwc.code as workcenter_code',
                    'rwc.name as workcenter_name',
                    'rws.id as workshop_id',
                    'rws.name as workshop_name',
                    'rf.id as factory_id',
                    'rf.name as factory_name',
                ])
                ->where([
                    ['rbrb.routing_id', $value->routing_id],
                    ['rbrb.bom_id', $value->bom_id],
                    ['rbrb.operation_id', $value->oid],
                ])
                ->orderBy('rbrb.index', 'ASC')
                ->first();
            //没有配置工作中心
            if (!isset($workcenter_info)) continue;
            //该工作中心的总产能 所有能力总产能累加
            $workcenter_info->all_ability_capacity = 0;
            //该工作中心的总剩余产能 所有能力剩余产能累加
            $workcenter_info->all_ability_capacity_remain = 0;
            //工序也存入结果返回数组
            $workcenter_info->operation_id = $value->oid;
            $workcenter_info->operation_code = $this->getFieldValueById($workcenter_info->operation_id, 'code', config('alias.rio'));
            $workcenter_info->operation_name = $this->getFieldValueById($workcenter_info->operation_id, 'name', config('alias.rio'));
            //已排工单
            $workcenter_info->work_orders = DB::table(config('alias.rwo') . ' as rwo')
                ->leftJoin(config('alias.rioa') . ' as rioa', 'rioa.id', 'rwo.operation_ability_id')
                ->leftJoin(config('alias.rpo') . ' as po', 'rwo.production_order_id', 'po.id')
                ->select('po.number as production_order_number', 'rwo.id', 'rwo.number', 'rwo.qty', 'rioa.ability_name', 'rwo.total_workhour', 'rwo.work_station_time', 'rwo.production_order_id', 'rwo.operation_order_id')
                ->where([
                    ['rwo.operation_id', $workcenter_info->operation_id],
                    ['rwo.work_center_id', $workcenter_info->workcenter_id]
                ])
                ->whereIn('rwo.status', [1, 2])
                ->whereBetween('work_station_time', [strtotime($input['start_date']), strtotime($input['end_date'])])
                ->orderBy('rwo.work_station_time')
                ->get();
            //找到该工作中心下的所有台板下所有的能力
            $workcenter_info->operation_ability = $this->getWorkBenches($workcenter_info->operation_id, $workcenter_info->workcenter_id);
            //该工作中心绑定的排班 可能有多个排班 排班集合集中在每天的产能 周日到周一 调用浩子那边的方法
            $capacity_week = $this->workBenchOperationAbilityModel->getEveryAbilityCapacity(0, $workcenter_info->workcenter_id);
            //遍历所有的能力 每个能力有自己的产能
            foreach ($workcenter_info->operation_ability as $ability) {
                //获取指定时间段的总产能 存放前端传递的时间段 对应的每天的产能
                //声明该时间段每天总产能数组
                $capacity_date = [];
                //声明该时间段每天剩余产能数组
                $capacity_remain_date = [];
                //循环 指定时间段中的每一天 匹配该排班集合集中在每天的产能 计算剩余产能
                for ($i = 0; $i < $date_num; $i++) {
                    //当天
                    $current_date = date("Y-m-d", strtotime("+$i day", strtotime($input['start_date'])));
                    //当天的所有时段 0:0:0-23:59:59
                    $today = $current_date . ' 23:59:59';
                    //当天该能力总产能 将所有台板下的该能力叠加
                    $capacity_date[$current_date] = $capacity_week[date('w', strtotime($current_date))]*$ability->work_bench_num;
                    //当天该能力已用产能 只有该WO状态是主排或者细排才计算
                    $capacity_used_date = DB::table(config('alias.rwo'))
                        ->where([
                            ['operation_id', $workcenter_info->operation_id],
                            ['work_center_id', $workcenter_info->workcenter_id],
                            ['operation_ability_id', $ability->operation_to_ability_id]
                        ])
                        ->whereIn('status', [1, 2])
                        ->whereBetween('work_station_time', [strtotime($current_date), strtotime($today)])
                        ->sum('total_workhour');
                    //当天该能力剩余产能
                    $capacity_remain_date[$current_date] = $capacity_date[$current_date] - $capacity_used_date;
                }
                //每个能力在指定时间段的每天总产能
//                $ability->capacity_date=$capacity_date;
                //每个能力在指定时间段的每天剩余产能
//                $ability->capacity_remain_date=$capacity_remain_date;
                //每个能力在指定时间段的总产能 由于累加出现无限位小数 这里将总产能和剩余产能保留2位小数 四舍五入
                $ability->capacity_total = round(array_sum($capacity_date), 2);
                //每个能力在指定时间段的剩余产能
                $ability->capacity_remain = round(array_sum($capacity_remain_date), 2);
                //该工作中心的总产能 所有能力总产能累加
                $workcenter_info->all_ability_capacity += $ability->capacity_total;
                //该工作中心的剩余产能 所有能力剩余产能累加
                $workcenter_info->all_ability_capacity_remain += $ability->capacity_remain;
                $workcenter_info->all_ability_capacity = round($workcenter_info->all_ability_capacity, 2);
                $workcenter_info->all_ability_capacity_remain = round($workcenter_info->all_ability_capacity_remain, 2);
            }
            //每个工作中心对应的相关信息加产能 存入结果返回数组
            $results[] = $workcenter_info;
        }
        return $results;
    }

    /**
     * 查找指定工作中心下的所有的台板 合并能力
     * @param $operation_id
     * @param $workcenter_id
     * @return mixed
     */
    private function getWorkBenches($operation_id, $workcenter_id)
    {
        //先查到所有的台板 按台板细分
        $field = [
            'rwboa.operation_to_ability_id',
            'rioa.ability_name',
            'rwboa.workbench_id',
            'rwb.name as workbench_name'
        ];
        $where = [
            ['rwboa.operation_id', $operation_id],
            ['rwb.status', 1],
            ['rwc.id', $workcenter_id]
        ];
        $builder = DB::table(config('alias.rwboa') . ' as rwboa')
            ->leftJoin(config('alias.rioa') . ' as rioa', 'rwboa.operation_to_ability_id', 'rioa.id')
            ->leftJoin(config('alias.rwb') . ' as rwb', 'rwb.id', 'rwboa.workbench_id')
            ->leftJoin(config('alias.rwc') . ' as rwc', 'rwc.id', 'rwb.workcenter_id')
            ->where($where);
        //暂时未想到最优处理方法 先这样处理
        $array_list=obj2array($builder->select($field)->distinct()->get());
        //合并能力 能力可以在多个台板下 统计能力出现次数 以备叠加能力的产能
        $count_field=array_column($array_list,'operation_to_ability_id');
        $array_count_values=array_count_values($count_field);
        $field = [
            'rwboa.operation_to_ability_id',
            'rioa.ability_name',
        ];
        //按能力细分 将能力出现次数留存
        $obj_list=$builder->select($field)->distinct()->get();
        foreach ($obj_list as $value){
            $value->work_bench_num=$array_count_values[$value->operation_to_ability_id];
        }
        return $obj_list;
    }
}