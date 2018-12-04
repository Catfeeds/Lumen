<?php
/**
 * Created by PhpStorm.
 * User: zhufeng
 * Date: 2018/8/27
 * Time: 下午5:01
 */

namespace App\Http\Models\Sap;
use App\Http\Models\Base;
use Illuminate\Support\Facades\DB;
use App\Http\Models\Bom;
use App\Http\Models\ManufactureBom;

/**
 * 同步SAP PO 入MES 模型
 * Class SyncSapProductOrder
 * @package App\Http\Models\Sap
 * @author Bruce.Chu
 */
class SyncSapProductOrder extends Base
{
    protected $bomModel;
    protected $manufactureModel;

    public function __construct()
    {
        parent::__construct();
        $this->table = config('alias.rpo');
        $this->bomModel = new Bom();
        $this->manufactureModel = new ManufactureBom();
    }

    /**
     * 同步
     * @param $input
     */
    public function syncSapProductOrder($input)
    {
        //把会抛异常的逻辑放在首位 提升程序效率
        //判断该物料是否已同步
        $material_id = DB::table(config('alias.rm'))->where('item_no', preg_replace('/^0+/', '', $input['HEAD']['PLNBEZ']))->value('id');
        if (!$material_id) TESAP('2475');
        //拿有效bom 待add/update的PO的BOM信息
        $bom = DB::table(config('alias.rb'))->where([['material_id', '=', $material_id], ['bom_no', '=', $input['HEAD']['STLAL']], ['is_version_on', '=', 1]])->first();
        if (empty($bom)) TESAP('2477');
        $bomId = $bom->id;
        //sap的工艺路线 工艺路线组关联表 拿routing_id
        $routing = DB::table(config('alias.rprgn'))
            ->where([['group_number', $input['HEAD']['PLNNR']], ['group_count', $input['HEAD']['PLNAL']], ['material_code', '=', preg_replace('/^0+/', '', $input['HEAD']['PLNBEZ'])],['bom_no','=',$input['HEAD']['STLAL']]])
            ->whereIn('routing_id', function ($query) use ($bomId) {
                $query->select('routing_id')->from(config('alias.rbr'))->where('bom_id', $bomId);
            })
            ->first();
        if (empty($routing->routing_id)) TESAP('2478');
        //ROUTING与COMPONENT节点数据必传
        if (empty($input['ROUTING'])) TESAP('2486');
        if (empty($input['COMPONENT'])) TESAP('2487');
        //生产订单
        $data = [
            'number' => preg_replace('/^0+/', '', $input['HEAD']['AUFNR']),//生产订单号
            'qty' => $input['HEAD']['GAMNG'],//数量
            'type' => $input['HEAD']['DAUAT'],//生产订单类型
            'sales_order_code' => preg_replace('/^0+/', '', $input['HEAD']['KDAUF']),//销售订单号
            'sales_order_project_code' => $input['HEAD']['KDPOS'],//销售订单行项目
            'product_id' => $material_id,//物料id
            'bom_id' => $bom->id,//bom id
            'bom_qty' => $bom->qty,//bom基础数量
            'routing_id' => $routing->routing_id,//bom绑定的工艺路线
            'start_date' => strtotime($input['HEAD']['GSTRP']),//订单开始时间
            'end_date' => strtotime($input['HEAD']['GLTRP']),//订单结束时间
            'from' => 3,//来源sap
            'is_delete' => 0,//未删除
            'on_off' => 1,//开启
            'optional_bom_number' => $input['HEAD']['STLAL']//可选bom编号
        ];
        //工艺路线 工序 确认号
        $operations = DB::table(config('alias.rpro') . ' as rpro')
            ->leftJoin(config('alias.rio') . ' as rio', 'rpro.oid', 'rio.id')
            ->select('rpro.oid', 'rpro.order', 'rio.code')
            ->where('rpro.rid', $routing->routing_id)
            ->orderBy('rpro.order')
            ->get()
            ->toArray();
        //去除第一个工序(开始) 0010
        array_shift($operations);
        //格式化工序的顺序 形如0020
        $operations = array_map(function ($value) {
            $value->order = str_pad($value->order, 3, '0', STR_PAD_LEFT) . '0';
            return $value;
        }, $operations);
        //取出工序顺序
        $operation_order = array_column($operations, 'order');
        //根据sap推送的工序order 匹配标准工艺路线 匹配到 筛出来 否 过滤
        $routing_compare = array_map(function ($value) use ($operation_order, $operations) {
            $key = array_search($value['VORNR'], $operation_order);
            if (is_numeric($key)) {
                $value['operation_code'] = $operations[$key]->code;
                return $value;
            }
        }, $input['ROUTING']);
        //过滤数组中null元素
        $routing_compare = array_filter($routing_compare, function ($value) {
            return !is_null($value);
        });
        if (!empty($routing_compare)) $data['confirm_number'] = json_encode($routing_compare);
        //将bom原料数组的物料编码去除字符0
        $component = array_map(function ($value) {
            //当前物料
            $value['MATNR'] = preg_replace('/^0+/', '', $value['MATNR']);
            //当前物料的原物料 若是该字段有值 说明MATNR为替换物料 MATNR1为被替换物料
            if (!empty($value['MATNR1'])) $value['MATNR1'] = preg_replace('/^0+/', '', $value['MATNR1']);
            return $value;
        }, $input['COMPONENT']);
        $data['component'] = json_encode($component);//bom原料数组转为json入库
        //单位 未匹配到库中的单位 这里未做增操作 推PO属于第三步 推物料和bom应保证不会有漏网之鱼
        $unit_id = $this->getIdByFieldValue('commercial', $input['HEAD']['GMEIN'], config('alias.ruu'));
        if ($unit_id) $data['unit_id'] = $unit_id;
        //工厂 工厂同处理单位逻辑一样 不做增操作 工厂应有专门的途径维护数据
        $factory_id = $this->getIdByFieldValue('code', $input['HEAD']['DWERK'], config('alias.rf'));
        if ($factory_id) $data['factory_id'] = $factory_id;
        //计划工厂 物料做101收货时 工厂取该字段
        if (!empty($input['HEAD']['PWERK'])) {
            $plan_factory_id = $this->getIdByFieldValue('code', $input['HEAD']['PWERK'], config('alias.rf'));
            if ($plan_factory_id) $data['plan_factory_id'] = $plan_factory_id;
        }
        //判断该操作是add=>0 还是update=>1
        $has_order = $this->isExisted([['number', preg_replace('/^0+/', '', $input['HEAD']['AUFNR'])]]);
        if ($has_order) {
            //找到所有逻辑删除的po，逻辑删除后，直接生成新的po
            $exist_po = $this->isExisted([['number', preg_replace('/^0+/', '', $input['HEAD']['AUFNR'])],['is_delete', 0]]);
            if($exist_po){
                TESAP('2491');
            }else{
                $this->add($bom,$data,$input['HEAD']['STLAL'],preg_replace('/^0+/', '', $input['HEAD']['AUFNR']));

            }

//            //判断该PO是否已参与排产
//            $count=DB::table(config('alias.rwo').' as wo')
//                ->leftJoin(config('alias.rpo').' as po','wo.production_order_id','po.id')
//                ->where([['po.number',preg_replace('/^0+/', '', $input['HEAD']['AUFNR'])],['wo.status','<>',0]])
//                ->count();
//            //该PO已参与排产,不可覆盖
//            if($count) TESAP('2491');
//            //未参与排产的PO 删除所有数据 重新入库
//            //删该PO下的WT
//            DB::table(config('alias.roo').' as wt')
//                ->leftJoin(config('alias.rpo').' as po','wt.production_order_id','po.id')
//                ->where('po.number',preg_replace('/^0+/', '', $input['HEAD']['AUFNR']))
//                ->delete();
//            //删该PO下的WO
//            DB::table(config('alias.rwo').' as wo')
//                ->leftJoin(config('alias.rpo').' as po','wo.production_order_id','po.id')
//                ->where('po.number',preg_replace('/^0+/', '', $input['HEAD']['AUFNR']))
//                ->delete();
//            //删PO
//            DB::table($this->table)->where('number', preg_replace('/^0+/', '', $input['HEAD']['AUFNR']))->delete();
//            //删PO关联的制造BOM
//            DB::table(config('alias.rmb'))
//                ->where('version_description',preg_replace('/^0+/', '', $input['HEAD']['AUFNR']))
//                ->delete();
//            //PO重新入库
//            $this->add($bom,$data,$input['HEAD']['STLAL'],preg_replace('/^0+/', '', $input['HEAD']['AUFNR']));
        } else {
            //PO入库
            $this->add($bom,$data,$input['HEAD']['STLAL'],preg_replace('/^0+/', '', $input['HEAD']['AUFNR']));
        }
    }

    /**
     * @param $bom                  -> 顶级bom
     * @param $data                 -> 入库的PO数据
     * @param $optional_bom_number  -> 可选bom编号
     * @param $number               -> 生产订单号
     */
    private function add($bom,$data,$optional_bom_number,$number)
    {
        //生成制造BOM
        $bom_tree = $this->bomModel->getBomTree($bom->material_id, $bom->version, true, true, false, $optional_bom_number);//BOM树 只取单层 取消递归
        $attachments = $this->bomModel->getBomAttachments($bom->id);//BOM附件
        $bom_input['code'] = $bom->code;//BOM编码
        $bom_input['material_id'] = $bom->material_id;//物料编码
        $bom_input['loss_rate'] = $bom->loss_rate;//损耗率
        $bom_input['name'] = $bom->name;//BOM名称
        $bom_input['bom_group_id'] = $bom->bom_group_id;//BOM分组
        $bom_input['version'] = $bom->version;//BOM版本
        $bom_input['version_description'] = $number;//BOM版本描述=>生产订单号
        $bom_input['qty'] = $bom->qty;//BOM母件数量
        $bom_input['description'] = $bom->description;//描述
        $bom_input['bom_tree'] = obj2array($bom_tree);
        $bom_input['attachments'] = $attachments;
        $bom_input['differences'] = '';//差别=>更新制造BOM树时字段
        try {
            //开启事务
            DB::connection()->beginTransaction();
            //add ManufactureBOM
            $manufacture_bom_id = $this->manufactureModel->add($bom_input, false, 3);
            $data['manufacture_bom_id'] = $manufacture_bom_id;//制造BOM的ID
            $data['ctime'] = time();//创建时间
            $res = DB::table($this->table)->insert($data);
            if(!$res){TESAP('2493');}
        } catch (\ApiException $e) {
            //回滚
            DB::connection()->rollBack();
            TEA($e->getCode());
        }
        //提交事务
        DB::connection()->commit();
    }
}