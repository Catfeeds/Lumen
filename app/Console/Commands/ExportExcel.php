<?php
/**
 * Created by PhpStorm.
 * User: zhufeng
 * Date: 2018/5/15
 * Time: 下午4:44
 */
namespace App\Console\Commands;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Excel;

/**
 * 导出工艺excel
 * Class ExportExcel
 * @package App\Console\Commands
 * @author Bruce.Chu
 * @date 2018-07-24
 */
class ExportExcel extends Command
{
    /**
     * 控制台命令 signature 的名称。
     * php artisan export:excel
     * @var string
     */
    protected $signature = 'export:excel';

    /**
     * 控制台命令说明。
     * php artisan help  export:excel命令后的输出内容
     * @var string
     *
     */
    protected $description = '导出工艺excel';

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
        //声明表格数组 设置表头
        $cellData = [
            [
                "物料编码(子件)", '物料描述', "物料编码(父件)", '工厂',
                '工艺路线描述', '组计数器', '从批量', '到批量', '批量单位',
                '系统标识', '设备代码', '工序号', '工序描述', '步骤',
                '工作中心', '控制码', 'SAP基本数量', 'SAP基本单位',
                '准备时间', '单位', '机器成本时间', '单位', '人工时间',
                '单位', '机器排产时间', '单位', '有效期始于', '有效期至'
            ]
        ];
        //拼接 表格中 除了表头之外的 表格内容数据
        //多个连接查询 取出有效并配置了工艺路线的bom相关数据
        //基础表ruis_bom表 拿bom'code bom'id bom'description
        $bom_infos = DB::table(config('alias.rb') . ' as bom')
            //关联ruis_bom_routing表 拿routing_id 条件bom'id
            ->leftJoin(config('alias.rbr') . ' as rbr', 'rbr.bom_id', 'bom.id')
            //关联ruis_material表 拿物料来源 条件 bom'code
            ->leftJoin(config('alias.rm') . ' as material', 'material.item_no', 'bom.code')
            //关联uom_unit表 拿物料单位 条件 material'unit_id
            ->leftJoin(config('alias.uu') . ' as unit', 'unit.id', 'material.unit_id')
            //关联ruis_procedure_route表 拿工艺路线名称 条件 rbr'routing_id --工艺路线id
            ->leftJoin(config('alias.rpr') . ' as rpr', 'rpr.id', 'rbr.routing_id')
            //关联ruis_procedure_route_operation表 拿工序id 工序顺序 条件 rbr'routing_id
            ->leftJoin(config('alias.rpro') . ' as rpro', 'rpro.rid', 'rbr.routing_id')
            //关联ruis_ie_operation表 拿工序名称 条件 rpro'oid --工序id
            ->leftJoin(config('alias.rio') . ' as rio', 'rio.id', 'rpro.oid')
            //关联ruis_ie_workhours表 拿准备工时 条件rio'id --工序id
            ->leftJoin(config('alias.riw') . ' as riw', 'riw.operation_id', 'rio.id')
            ->select(
                'bom.code', 'bom.id', 'bom.description',
                'rbr.routing_id',
                'material.from',
                'unit.commercial',
                'rpr.name as procedure_name',
                'rpro.oid', 'rpro.order',
                'rio.name',
                'riw.preparation_hour'
            )
            ->where([['bom.is_version_on', '=', 1], ['riw.parent_id', '=', 0]])
            ->whereNotNull('rbr.routing_id')
            ->orderBy('bom.code')
            ->get();
        //以该bom配置的工艺路线上每个工序为单位 即每个工序对应一行记录
        //对查询出来的数据进行格式转换 以及计算 继续拼接
        foreach ($bom_infos as $bom_info) {
            //查询该有效bom的所有父级有效bom
            $parents_bom = DB::table(config('alias.rb') . ' as bom')
                //bom表关联bom_item表再关联bom表  主-辅-主
                ->leftJoin(config('alias.rbi') . ' as bom_item', 'bom_item.material_id', 'bom.material_id')
                ->leftJoin(config('alias.rb') . ' as parents_bom', 'parents_bom.id', 'bom_item.bom_id')
                ->where([['bom.code', '=', $bom_info->code], ['bom.is_version_on', '=', 1], ['parents_bom.is_version_on', '=', 1]])
                ->pluck('parents_bom.code')
                ->toArray();
            //转为字符串 插入单元格
            $parents_bom = implode(',', $parents_bom);
            //拿该bom此工序下所有的步骤 步骤有顺序
            //基础表 ruis_bom_routing_base bom工艺路线主表
            $steps = DB::table(config('alias.rbrb') . ' as rbrb')
                //关联ruis_practice_field表 步骤表
                ->leftJoin(config('alias.rpf') . ' as rpf', 'rpf.id', 'rbrb.step_id')
                ->where([['rbrb.bom_id', '=', $bom_info->id], ['rbrb.operation_id', '=', $bom_info->oid]])
                ->orderBy('rbrb.index', 'asc')
                ->pluck('rpf.name')
                ->toArray();
            $steps = implode('+', $steps);
            //工序号 str_pad 凑足3位数 不足的 用0填充 同一物料按0010递增
            $operation_no = str_pad($bom_info->order - 1, 3, '0', STR_PAD_LEFT) . "0";
            //处理工作中心 能力绑定工作中心 故先拿该bom此工序下所有的能力
            $ability_ids = DB::table(config('alias.rbrb'))
                ->where([['bom_id', '=', $bom_info->id], ['operation_id', '=', $bom_info->oid]])
                ->pluck('operation_ability_ids')
                ->toArray();
            //能力格式转换 转换为一维数组 方便下面whereIn使用
            $ability_ids = explode(',', implode(',', $ability_ids));
            //拿此工序下所有能力关联的工作中心id 去重
            $workcenter_id = DB::table(config('alias.rwcoa'))
                ->where('operation_id', $bom_info->oid)
                ->whereIn('operation_to_ability_id', $ability_ids)
                ->distinct()
                ->pluck('workcenter_id')
                ->toArray();
            if (isset($workcenter_id)) {
                //拿工作中心编码 根据工作中心id
                $workcenter = DB::table(config('alias.rwc'))
                    ->whereIn('id', $workcenter_id)
                    ->pluck('code')
                    ->toArray();
                //由于此工序可能涉及多个工作中心 故转为字符串插入单元格中 工厂同理
                $workcenter = implode(',', $workcenter);
                //拿工厂编码 去重 工作中心找车间 车间找工厂 小蝌蚪找妈妈
                $factory = DB::table(config('alias.rwc') . ' as rwc')
                    ->leftJoin(config('alias.rws') . ' as rws', 'rws.id', 'rwc.workshop_id')
                    ->leftJoin(config('alias.rf') . ' as rf', 'rf.id', 'rws.factory_id')
                    ->whereIn('rwc.id', $workcenter_id)
                    ->distinct()
                    ->pluck('rf.code')
                    ->toArray();
                $factory = implode(',', $factory);
            } else {
                //友好一下 查无工作中心 工厂 默认为空
                $workcenter = '';
                $factory = '';
            }
            //查找此物料涉及多少个工艺路线 过滤重复值 正常情况是不会有重复routing_id
            $bom_routing_num = DB::table(config('alias.rbr'))
                ->where('bom_id', $bom_info->id)
                ->distinct()
                ->pluck('routing_id')
                ->count();
            //定义系统标识 M:MES=>NULL S:SAP=>erp A:ALL 目前数据库只区分了物料是否来源于erp
            $from = 'M';
            if (isset($bom_info->from)) $from = 'S';
            //求和合并 总工时work_hours 人工工时man_hours
            $hours = DB::table(config('alias.rimw'))
                ->where([['material_no', '=', $bom_info->code], ['operation_id', '=', $bom_info->oid], ['bom_id', '=', $bom_info->id]])
                ->first(
                    array(
                        DB::raw('SUM(work_hours) as work_hours'),
                        DB::raw('SUM(man_hours) as man_hours')
                    )
                );
            //sheet的每一行记录
            $cellData[] = [
                $bom_info->code, $bom_info->description, $parents_bom, $factory, $bom_info->procedure_name, $bom_routing_num, '', '', '', $from,
                '', $operation_no, $bom_info->name, $steps, $workcenter, 'PP01', '1', $bom_info->commercial,
                $bom_info->preparation_hour, 'S', isset($hours->work_hours) ? $hours->work_hours : 0, 'S', isset($hours->man_hours) ? $hours->man_hours : 0, 'S', '', 'S'
            ];
        }
        //调用Maatwebsite/Excel组件 并保存 路径storage/exports/ 文件名使用当前时间标识 sheet名 工艺路线
        Excel::create(date('Y-m-d-H.i.s', time()), function ($excel) use ($cellData) {
            $excel->sheet('工艺路线', function ($sheet) use ($cellData) {
                $sheet->rows($cellData);
            });
        })->store('xls');
    }
}