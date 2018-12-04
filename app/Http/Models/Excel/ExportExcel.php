<?php
/**
 * Created by PhpStorm.
 * User: zhufeng
 * Date: 2018/7/23
 * Time: 下午3:04
 */
namespace App\Http\Models\Excel;
use App\Http\Models\Base;
use Excel;
use Illuminate\Support\Facades\DB;

/**
 * 对接SAP 数据导出Excel 模型
 * Class ExportExcel
 * @package App\Http\Models\Excel
 */
class ExportExcel extends Base
{
    /**
     * 导出Excel
     */
    public function exportExcel()
    {
        //声明数组 设置表头
        $cellData = [
            [
                "物料编码(子件)", '物料描述', "物料编码(父件)",'工厂',
                '工艺路线描述','组计数器', '从批量','到批量','批量单位',
                '系统标识','设备代码','工序号', '工序描述','步骤',
                '工作中心','控制码','SAP基本数量','SAP基本单位',
                '准备时间','单位','机器成本时间','单位','人工时间',
                '单位', '机器排产时间','单位','有效期始于','有效期至'
            ]
        ];
//        $item_nos=DB::table(config('alias.rb') . ' as bom')
////            ->where('is_version_on',1)
//            ->leftJoin(config('alias.rbr') . ' as rbr', 'rbr.bom_id', 'bom.id')
//            ->where('bom.is_version_on', 1)
//            ->whereNotNull('rbr.routing_id')
//            ->select('bom.code','rbr.routing_id')
//            ->orderBy('bom.code')
//            ->limit(2)
//            ->get();
//            ->pluck('bom.code');
//        return $item_nos;
//        foreach ($item_nos as $item_no) {
            //拼接 表格中 除了表头之外的 表格内容数据
            //拿BOM信息 bom'id + bom'description
//            $sql = DB::table(config('alias.rb') . ' as bom')
//                ->leftJoin(config('alias.rbr') . ' as rbr', 'rbr.bom_id', 'bom.id')
//                ->where([['bom.code', '=', $item_no], ['bom.is_version_on', '=', 1]]);
//            $step_one = $sql->value('rbr.routing_id');
////            var_dump(obj2array($step_one));
//            if (empty($step_one)) var_dump('yes');
            $bom_infos = DB::table(config('alias.rb') . ' as bom')
                ->leftJoin(config('alias.rbr') . ' as rbr', 'rbr.bom_id', 'bom.id')
                ->leftJoin(config('alias.rm') . ' as material', 'material.item_no', 'bom.code')
                ->leftJoin(config('alias.uu') . ' as unit', 'unit.id', 'material.unit_id')
                ->leftJoin(config('alias.rpr') . ' as rpr', 'rpr.id', 'rbr.routing_id')
                ->leftJoin(config('alias.rpro') . ' as rpro', 'rpro.rid', 'rbr.routing_id')
                ->leftJoin(config('alias.rio') . ' as rio', 'rio.id', 'rpro.oid')
                ->leftJoin(config('alias.riw') . ' as riw', 'riw.operation_id', 'rio.id')
                ->select('bom.code','bom.id', 'bom.description', 'material.from', 'unit.commercial', 'rbr.routing_id',
                    'rpr.name as procedure_name', 'rpro.oid', 'rpro.order','rio.name', 'riw.preparation_hour')
                ->where([
                    ['bom.is_version_on', '=', 1],
                    ['riw.parent_id', '=', 0]
                ])
                ->whereNotNull('rbr.routing_id')
                ->orderBy('bom.code')
                ->limit(19)
                ->get();
            return $bom_infos;
            //判断BOM是否存在
//            if (!isset($bom_info)) TEA('2112');
//            if (!isset($bom_info)) continue;
            //遍历工序 将拼接好的数据 逐行插入表格内容数组
            foreach ($bom_infos as $key=>$bom_info) {
                $parents_bom=DB::table(config('alias.rb') . ' as bom')
                    ->leftJoin(config('alias.rbi').' as bom_item','bom_item.material_id','bom.material_id')
                    ->leftJoin(config('alias.rb').' as parents_bom','parents_bom.id','bom_item.bom_id')
                    ->where([['bom.code', '=', $bom_info->code], ['bom.is_version_on', '=', 1],['parents_bom.is_version_on', '=', 1]])
                    ->pluck('parents_bom.code')
                    ->toArray();
                $parents_bom=implode(',',$parents_bom);
                $steps=DB::table(config('alias.rbrb') .' as rbrb')
                    ->leftJoin(config('alias.rpf').' as rpf','rpf.id','rbrb.step_id')
                    ->where([['rbrb.bom_id','=',$bom_info->id],['rbrb.operation_id','=',$bom_info->oid]])
                    ->orderBy('rbrb.index','asc')
                    ->pluck('rpf.name')
                    ->toArray();
                $steps=implode('+',$steps);
                $operation_no=str_pad($key+1,3,'0',STR_PAD_LEFT)."0";
//                $workcenter=DB::table(config('alias.rbrb') .' as rbrb')
//                    ->leftJoin(config('alias.rwc') .' as rwc','rwc.id','rbrb.workcenter_id')
//                    ->where([['bom_id','=',$bom_info->id],['operation_id','=',$bom_info->oid]])
//                    ->value('rwc.code');
                $ability_ids=DB::table(config('alias.rbrb'))
                    ->where([['bom_id','=',$bom_info->id],['operation_id','=',$bom_info->oid]])
                    ->pluck('operation_ability_ids')
                    ->toArray();
                $ability_ids=explode(',',implode(',',$ability_ids));
                $workcenter_id=DB::table(config('alias.rwcoa'))
                    ->where('operation_id',$bom_info->oid)
                    ->whereIn('operation_to_ability_id',$ability_ids)
                    ->distinct()
                    ->pluck('workcenter_id')
                    ->toArray();
                if(isset($workcenter_id)){
                    $workcenter=DB::table(config('alias.rwc') .' as rwc')
                        ->whereIn('id',$workcenter_id)
                        ->pluck('code')
                        ->toArray();
                    $workcenter=implode(',',$workcenter);
                    $factory=DB::table(config('alias.rwc') .' as rwc')
                        ->leftJoin(config('alias.rws') .' as rws','rws.id','rwc.workshop_id')
                        ->leftJoin(config('alias.rf') .' as rf','rf.id','rws.factory_id')
                        ->whereIn('rwc.id',$workcenter_id)
                        ->distinct()
                        ->pluck('rf.code')
                        ->toArray();
                    $factory=implode(',',$factory);
                }else{
                    $workcenter='';
                    $factory='';
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
                //总工时求和 这里没调李明那边接口 遍历计算 直接通过物料编码,工序id,bom'id查询数据库
                $total_hour = DB::table(config('alias.rimw'))
                    ->where([['material_no', '=', $bom_info->code], ['operation_id', '=', $bom_info->oid], ['bom_id', '=', $bom_info->id]])
                    ->sum('work_hours');
                //人工时间
                $man_hour = DB::table(config('alias.rimw'))
                    ->where([['material_no', '=', $bom_info->code], ['operation_id', '=', $bom_info->oid], ['bom_id', '=', $bom_info->id]])
                    ->sum('man_hours');
                //sheet的每一行记录
                $cellData[] = [
                    $bom_info->code, $bom_info->description, $parents_bom,$factory, $bom_info->procedure_name, $bom_routing_num, '', '', '', $from,
                    '', $operation_no, $bom_info->name, $steps,$workcenter, 'PP01', '1', $bom_info->commercial,
                    $bom_info->preparation_hour, 'S', $total_hour, 'S', $man_hour, 'S', '', 'S'
                ];
            }
//        }
//        exit();
//        return $cellData;
        //调用Maatwebsite/Excel组件 并导出 文件名使用物料编码与当前时间标识
        Excel::create(time(), function ($excel) use ($cellData) {
            $excel->sheet('score', function ($sheet) use ($cellData) {
                $sheet->rows($cellData);
            });
        })->export('csv');
    }
}