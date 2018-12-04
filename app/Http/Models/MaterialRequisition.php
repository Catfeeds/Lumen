<?php
/**
 * Created by PhpStorm.
 * User: lester
 * Date: 2018/9/5 14:08
 * Desc:
 */

namespace App\Http\Models;


use Illuminate\Support\Facades\DB;

class MaterialRequisition extends Base
{
    public $apiPrimaryKey = 'material_requisition_id';
    protected $itemTable;
    protected $ZyTable;
    protected $ZyItemTable;
    private $mrCode = [];

    public function __construct()
    {
        !$this->table && $this->table = config('alias.rmr');
        $this->itemTable = config('alias.rmri');

        $this->ZyTable = 'ruis_out_machine_zxxx_order';
        $this->ZyItemTable = 'ruis_out_machine_zxxx_order_item';

    }
//region 检

    /**
     * 验证 领补料参数
     *
     * @param $input
     * @throws \App\Exceptions\ApiException
     */
    public function checkFormField(&$input)
    {
        if (empty($input['type']) || !is_numeric($input['type']) || $input['type'] > 9) TEA('700', 'type');
        if (!isset($input['push_type']) || ($input['push_type'] != 0 && $input['push_type'] != 1)) TEA('700', 'push_type');

        //如果是SAP领料，并且尚未完成领料，则拒绝
        if ($input['type'] == 1 && $input['push_type'] == 1) {
            $obj = DB::table($this->table)
                ->where([
                    ['work_order_id', '=', $input['work_order_id']],
                    ['type', '=', 1],
                    ['push_type', '=', 1],
                    ['status', '<>', 4],
                    ['is_delete', '=', 0],
                ])
                ->count();
            if ($obj) TEA('2410');
        }

        if (empty($input['factory_id'])) TEA('700', 'factory_id');
        $has = $this->isExisted([['id', '=', $input['factory_id']]], config('alias.rf'));
        if (!$has) TEA('700', 'factory_id');

        if (empty($input['employee_id'])) TEA('700', 'employee_id');
        $has = $this->isExisted([['id', '=', $input['employee_id']]], config('alias.re'));
        if (!$has) TEA('700', 'employee_id');

        // 非mes定额领料才有 line_depot_id
        if ($input['push_type'] != 0) {
            if (empty($input['line_depot_id'])) TEA('700', 'line_depot_id');
            $has = $this->isExisted([['id', '=', $input['line_depot_id']]], config('alias.rsd'));
            if (!$has) TEA('700', 'line_depot_id');
        }

//        if (empty($input['send_depot_id'])) TEA('700', 'send_depot_id');
//        $has = $this->isExisted([['id', '=', $input['send_depot_id']]], config('alias.rsd'));
//        if (!$has) TEA('700', 'send_depot_id');

//        if (empty($input['workbench_id'])) TEA('700', 'workbench_id');
//        $has = $this->isExisted([['id', '=', $input['workbench_id']]], config('alias.rwb'));
//        if (!$has) TEA('700', 'workbench_id');

        if (empty($input['work_order_id'])) TEA('700', 'work_order_id');
        // 验证所属工单是否被锁定
        $this->checkWorkOrderLock($input['work_order_id']);
        $has = $this->isExisted([['id', '=', $input['work_order_id']]], config('alias.rwo'));
        if (!$has) TEA('700', 'work_order_id');

        if (empty($input['materials']) || is_array($input['materials']) || trim($input['materials']) == '[]') TEA('700', 'materials');
        $input['materials'] = json_decode($input['materials'], true);
        $materialQtyArr = [];
        foreach ($input['materials'] as $key => &$value) {
            if (empty($value['material_id'])) TEA('700', 'material_id');
            $obj = DB::table(config('alias.rm'))
                ->select(['id', 'item_no as material_code'])
                ->where('id', $value['material_id'])
                ->first();
            if (!isset($obj->material_code)) TEA('700', 'material_id');

            //虚拟进料 无需领料
            if ($obj->material_code == '99999999') {
                unset($input['materials'][$key]);
                continue;
            }
            $value['material_code'] = $obj->material_code;

            if (empty($value['unit_id'])) TEA('700', 'unit_id');    // 此unit_id 是bom_unit_id
            $has = $this->isExisted([['id', '=', $value['unit_id']]], config('alias.ruu'));
            if (!$has) TEA('700', 'unit_id');

            // 非mes领料，有发出库存地点
            if ($input['push_type'] != 0) {
                if (!isset($value['send_depot'])) TEA('700', 'send_depot');
                // 判断是否为特出类型的物料，发料地点的值用生产库存地点代替
                $is_butao = $this->checkIsButao($value['material_id']);
                if (empty($value['send_depot']) || $is_butao) {
                    if (!isset($value['produce_depot'])) TEA('700', 'produce_depot');
                    $value['send_depot'] = $value['produce_depot'];
                }
            }

            /**
             * 向mes领料，使用 rated_qty 定额总数
             * 其他，使用 demand_qty 需求总数
             */
            if ($input['push_type'] == 0) {
                empty($value['rated_qty']) && TEA('700', 'rated_qty');
            } else {
                //如果为SAP领料也会有额定数量(即WO的计划数量)
                $input['push_type'] == 1 && $input['type'] == 1 && empty($value['rated_qty']) && TEA('700', 'rated_qty');
                empty($value['demand_qty']) && TEA('700', 'demand_qty');
            }

            // 统计物料需求数量
            if ($input['type'] == 1 && $input['push_type'] == 1) {
                if (bccomp($value['demand_qty'], $value['rated_qty'], 3) > 0) TEA(2411, json_encode($value));
                if (!empty($materialQtyArr[$value['material_id']])) {
                    $materialQtyArr[$value['material_id']]['demand_qty'] += $value['demand_qty'];
                } else {
                    $materialQtyArr[$value['material_id']] = [
                        'rated_qty' => $value['rated_qty'],
                        'demand_qty' => $value['demand_qty']
                    ];
                }
            }

            // 只有 mes领料的时候 才有批次
            if ($input['push_type'] == 0) {
                if (empty($value['batches'])) TEA('700', 'batches');
                $batch_qty_sum = 0;
                foreach ($value['batches'] as &$batch) {
                    if (!isset($batch['batch'])) TEA('700', 'batch');
                    // 验证库存地点
                    if (empty($batch['depot_id'])) TEA('700', 'depot_id');
                    $has = $this->isExisted([['id', '=', $batch['depot_id']]], config('alias.rsd'));
                    if (!$has) TEA('700', 'depot_id');

                    //验证单位
                    if (empty($batch['unit_id'])) TEA('700', 'unit_id');
                    $has = $this->isExisted([['id', '=', $batch['unit_id']]], config('alias.ruu'));
                    if (!$has) TEA('700', 'batch unit_id');

                    //验证库存id
                    if (empty($batch['inve_id'])) TEA('700', 'inve_id');
                    $has = $this->isExisted([['id', '=', $batch['inve_id']]], config('alias.rsi'));
                    if (!$has) TEA('700', 'inve_id');

                    // 累加 计算定额总数
                    empty($batch['batch_qty']) && TEA('700', 'batch_qty');
                    $batch_qty_sum += $batch['batch_qty'];
                }
                /**
                 * @TODO 先让流程走下去
                 */
//                if (bccomp($batch_qty_sum ,$value['rated_qty'],3)) {
//                    TEA('2429', '物料：' . $value['material_code'] . ',定额总数为' . $value['rated_qty'] . ',需求总数为' . $batch_qty_sum);
//                }
            }
        }
        // SAP领料： 遍历当前领料是否超额
        if ($input['type'] == 1 && $input['push_type'] == 1) {
            foreach ($materialQtyArr as $material_id => $m) {
                if (bccomp($m['demand_qty'], $m['rated_qty'], 3) > 0) TEA(2411, json_encode($m));
                $obj = DB::table($this->table . ' as rmr')
                    ->leftJoin($this->itemTable . ' as rmri', 'rmri.material_requisition_id', '=', 'rmr.id')
                    ->leftJoin(config('alias.rmrib') . ' as rmrib', 'rmrib.item_id', '=', 'rmri.id')
                    ->where([
                        ['rmr.work_order_id', '=', $input['work_order_id']],
                        ['rmr.type', '=', 1],
                        ['rmr.push_type', '=', 1],
                        ['rmr.status', '=', 4],
                        ['rmr.is_delete', '=', 0],
                        ['rmri.material_id', '=', $material_id]
                    ])
                    ->sum('rmrib.actual_receive_qty');
                if (bccomp($obj + $m['demand_qty'], $m['rated_qty'], 3) > 0)
                    TEA(2411, json_encode(['sum_demand_qty' => $obj + $m['demand_qty'], 'rated_qty' => $m['rated_qty']]));
            }
        }

        $input['creator_id'] = (!empty(session('administrator')->admin_id)) ? session('administrator')->admin_id : 0;
    }

    /**
     * 检验 领料单 子项 当前可领的数量
     *
     * 可领的数量 = WO里面总的数量 - 已被领取的数量
     *
     * @param $input
     * @return array
     * @throws \App\Exceptions\ApiException
     */
    public function checkItemNumber($input)
    {
        if (empty($input['work_order_id'])) TEA('700', 'work_order_id');

        // 验证所属工单是否被锁定
        $this->checkWorkOrderLock($input['work_order_id']);

        if (empty($input['material_id'])) TEA('700', 'material_id');
        $obj = DB::table(config('alias.rwo'))->select(['in_material'])->where('id', '=', $input['work_order_id'])->first();
        if (!isset($obj->in_material)) {
            TEA('700', 'work_order_id');
        }
        if (empty($obj->in_material)) {
            TEA('2482');
        }
        $temp = [];
        try {
            $temp = json_decode($obj->in_material, true);
        } catch (\Exception $e) {
            TEA('700', 'work_order_id');
        }
        $qty = 0; // WO带出的物料总的数量
        foreach ($temp as $key => $value) {
            if ($value['material_id'] == $input['material_id']) {
                $qty = $value['qty'];
                break;
            }
        }

        if ($qty == 0) {
            return ['qty' => 0];
        }

        /**
         * 查询已被领取的数量
         * 只查 类型为领料的数据
         */
        $mr_obj = DB::table($this->itemTable . ' as rmri')
            ->leftJoin($this->table . ' as rmr', 'rmr.id', '=', 'rmri.material_requisition_id')
            ->select(['rmri.demand_qty'])
            ->where([
                ['rmr.work_order_id', '=', $input['work_order_id']],
                ['rmr.type', '=', 1],
                ['rmr.is_delete', '=', 0],
                ['rmri.material_id', '=', $input['material_id']]
            ])
            ->get();
        $lq_qty = 0;    //已经被领取的数量
        foreach ($mr_obj as $k => $v) {
            if (is_numeric($v->demand_qty)) {
                $lq_qty += $v->demand_qty;
            }
        }

        /**
         * @var int $kl_qty 可领取的数量
         */
        if ($qty < $lq_qty) {
            $kl_qty = 0;
        } else {
            $kl_qty = $qty - $lq_qty;
        }

        return ['qty' => $kl_qty, 'lq_qty' => $lq_qty];
    }

    /**
     * 根据 wo 获取 PO
     * @param $input
     * @throws \App\Exceptions\ApiException
     */
    public function getProductOrder(&$input)
    {
        if (empty($input['work_order_id'])) TEA('700', 'work_order_id');

        $wo_obj = DB::table(config('alias.rwo') . ' as rwo')
            ->leftJoin(config('alias.rpo') . ' as rpo', 'rpo.id', '=', 'rwo.production_order_id')
            ->select(['rpo.number', 'rpo.id'])
            ->where('rwo.id', $input['work_order_id'])
            ->first();
        if (empty($wo_obj) || !isset($wo_obj->number)) {
            TEA('2427');
        }
        $input['product_order_code'] = $wo_obj->number;
        $input['product_order_id'] = $wo_obj->id;
    }

    /**
     * 验证库存数量
     *
     * @param $input
     * @throws \App\Exceptions\ApiException
     */
    public function checkStorage($input)
    {
        /**
         * @var array $materialArr 物料需求数量数组
         *   key=>物料ID, value=>需求数量
         */
        $materialArr = [];
        $material_ID_arr = [];
        foreach ($input['materials'] as $value) {
            $materialArr[$value['material_id']] = $value['demand_qty'];
            $material_ID_arr[] = $value['material_id'];
        }
        $obj_lists = DB::table(config('alias.rsi'))
            ->select(['material_id', 'storage_validate_quantity as storage_number'])
            ->where([['depot_id', '=', $input['line_depot_id']], ['po_number', '=', $input['product_order_code']]])
            ->whereIn('material_id', $material_ID_arr)
            ->get();
        $arr_lists = obj2array($obj_lists);

        /**
         * 获取不到数据 或者 数据条目和物料数目不同，也意味着线边库余量不足
         */
        if ($input['push_type'] == 0) {
            //mes
            if (empty($arr_lists) || count($material_ID_arr) != count($arr_lists)) {
                TEA('2426');        //线边库余量不足
            }
        } else if ($input['push_type'] == 1) {
            //sap
        }


        /**
         * @var array $storage_arr 物料库存数组
         *   (key=>物料ID，value=>库存数量)
         */
        $storage_arr = [];
        foreach ($arr_lists as $value) {
            $storage_arr[$value['material_id']] = $value['storage_number'];
        }
        foreach ($materialArr as $key => $value) {
            if ($input['push_type'] == 0) {
                // 如果该物料需求数量 大于 库存数量 则提示余量不足
                if (!isset($storage_arr[$key]) || $value > $storage_arr[$key]) {
                    TEA('2426');        //线边库余量不足
                }
            } else if ($input['push_type'] == 1) {
                //sap
            }
        }
    }

    /**
     * 验证是否允许生成退料单
     *
     * @param $input
     * @throws \App\Exceptions\ApiException
     */
    public function checkReturnMaterial($input)
    {
        if (empty($input['work_order_id'])) TEA('700', 'work_order_id');
        //验证所属工单是否被锁定
        $this->checkWorkOrderLock($input['work_order_id']);
        $has = $this->isExisted([['id', '=', $input['work_order_id']]], config('alias.rwo'));
        if (!$has) TEA('9500');

        $has = $this->isExisted([
            ['work_order_id', '=', $input['work_order_id']],
            ['status', '=', 4],
            ['type', '=', 1],
            ['push_type', '=', 1],
        ]);
        if (!$has) TEA('2431');  // 尚未完成领料单

        $has = $this->isExisted([
            ['work_order_id', '=', $input['work_order_id']],
            ['type', '=', 2],
            ['push_type', '=', 1],
            ['status', '<>', 4],
        ]);
        if ($has) TEA('2410');  // 有未完成的退料单，请先完成

        //验证是否已创建退料单
//        $has = $this->isExisted([
//            ['type', '=', 2],
//            ['push_type', '=', 1],
//            ['work_order_id', '=', $input['work_order_id']]
//        ]);
//        if ($has) TEA('2430');  // 补料单已重复创建
    }


    /**
     * 验证 生成退料单参数
     *
     * @param $input
     * @throws \App\Exceptions\ApiException
     */
    public function checkStoreReturnMaterialParams(&$input)
    {
        if (empty($input['product_order_id'])) TEA('700', 'product_order_id');
        if (empty($input['product_order_code'])) TEA('700', 'product_order_code');
        $has = $this->isExisted([['id', '=', $input['product_order_id']], ['number', '=', $input['product_order_code']]], config('alias.rpo'));
        if (!$has) TEA('700', 'product_order_id');

        if (empty($input['work_order_id'])) TEA('700', 'work_order_id');
        //验证所属工单是否被锁定
        $this->checkWorkOrderLock($input['work_order_id']);
        $has = $this->isExisted([['id', '=', $input['work_order_id']]], config('alias.rwo'));
        if (!$has) TEA('700', 'work_order_id');

        // 如果当前有存在退料单尚未完成，则禁止操作
        $obj = DB::table($this->table)
            ->where([
                ['work_order_id', '=', $input['work_order_id']],
                ['type', '=', 2],
                ['push_type', '=', 1],
                ['is_delete', '=', 0],
                ['status', '<>', 4]
            ])
            ->count();
        if ($obj) TEA('2410');

        //如果 参数line_depot_id 存在异常，说明该工单对应的车间 没有维护线边仓
        if (empty($input['line_depot_id'])) TEA('2412', 'line_depot_id');
        if (empty($input['line_depot_code'])) TEA('2412', 'line_depot_code');
        $has = $this->isExisted([['id', $input['line_depot_id']]], config('alias.rsd'));
        if (!$has) TEA('2412', 'line_depot_id');

        if (empty($input['factory_id'])) TEA('700', 'factory_id');
        $has = $this->isExisted([['id', $input['factory_id']]], config('alias.rf'));
        if (!$has) TEA('700', 'factory_id');

        /**
         * 判断是否为特殊库存
         * 原理：
         * 如果为特殊库存，则WO.in_material.special_stock 为E
         */
        $woObj = DB::table(config('alias.rwo'))
            ->select([
                'in_material'
            ])
            ->where('id', '=', $input['work_order_id'])
            ->first();
        $materialSpecialStockArr = [];
        $inMaterialStr = empty($woObj) ? '[]' : $woObj->in_material;
        $inMaterialArr = json_decode($inMaterialStr, true);
        foreach ($inMaterialArr as $m) {
            // 如果物料ID 字段和 特殊库存字段都在，则放入临时数组，供下面使用
            isset($m['material_id']) && isset($m['special_stock']) && $materialSpecialStockArr[$m['material_id']] = $m['special_stock'];
        }
        unset($woObj, $inMaterialArr, $inMaterialStr);

        if (empty($input['items'])) TEA('700', 'items');
        foreach ($input['items'] as $k => &$item) {
            //如果batches为空，表示当前无退料，需要跳过。
            if (empty($item['batches'])) {
                unset($input['items'][$k]);
                continue;
            }

            if (empty($item['material_id'])) TEA('700', 'material_id');
            if (empty($item['material_code'])) TEA('700', 'material_code');
            $has = $this->isExisted([['id', $item['material_id']], ['item_no', $item['material_code']]], config('alias.rm'));
            if (!$has) TEA('700', 'material_id');

            /**
             * 查询是否为特殊库存
             */
            $item['special_stock'] = isset($materialSpecialStockArr[$item['material_id']]) ? $materialSpecialStockArr[$item['material_id']] : '';

//            if (!isset($item['send_depot'])) TEA('700', 'send_depot');
//            $is_butao = $this->checkIsButao($item['material_id']);
//            if ($is_butao) {
//                if (empty($item['produce_depot'])) TEA('700', 'produce_depot');
//                $item['send_depot'] = $item['produce_depot'];
//            }

            foreach ($item['batches'] as $batch) {
                if (!isset($batch['storage_number'])) TEA('700', 'storage_number');
                if (!isset($batch['return_number'])) TEA('700', 'return_number');
                if (!isset($batch['batch'])) TEA('700', 'batch');

                if (empty($batch['inve_id'])) TEA('700', 'inve_id');
                $has = $this->isExisted([['id', '=', $batch['inve_id']]], config('alias.rsi'));
                if (!$has) TEA('700', 'inve_id');
//                if (empty($batch['unit_id'])) TEA('700', 'unit_id');
//                $has = $this->isExisted([['id', '=', $batch['unit_id']]], config('alias.rsd'));
//                if (!$has) TEA('700', 'unit_id');
            }
        }
        $input['creator_id'] = (!empty(session('administrator')->admin_id)) ? session('administrator')->admin_id : 0;
    }

    /**
     * 验证物料分类是不是布套
     *
     * @param $material_id
     * @return bool
     */
    public function checkIsButao($material_id)
    {
        // 如果物料id为空 false
        if (empty($material_id)) {
            return false;
        }

        $categoryObj = DB::table(config('alias.rm'))
            ->select(['material_category_id'])
            ->where('id', $material_id)
            ->first();
        // 获取失败 false
        if (empty($categoryObj) || empty($categoryObj->material_category_id)) {
            return false;
        }

        return $this->checkMaterialCategoryIsInArray($categoryObj->material_category_id, config('app.material_category', []));
    }

    /**
     * 验证 物料分类ID以及父级ID 是否在给定的数组内
     *
     * @param int $category_id
     * @param array $inArray
     * @return bool
     */
    private function checkMaterialCategoryIsInArray($category_id, $inArray = [])
    {
        // 如果 为空直接返回
        if (empty($inArray) || !is_array($inArray)) {
            return false;
        }
        if (in_array($category_id, $inArray)) {
            return true;
        }
        // 设置flag，默认 false，如果找到则为 true
        $flag = false;
        $obj = DB::table(config('alias.rmc'))->select('parent_id')->where('id', $category_id)->first();
        while (!empty($obj)) {
            if (in_array($obj->parent_id, $inArray)) {
                $flag = true;
                break;
            }
            $obj = DB::table(config('alias.rmc'))->select('parent_id')->where('id', $obj->parent_id)->first();
        }
        return $flag;
    }

    /**
     * 验证 齐料检测(是否允许向mes领料)的参数
     *
     * @param $input
     * @throws \App\Exceptions\ApiException
     */
    public function checkAppLyMesParams(&$input)
    {
        if (empty($input['work_order_id'])) TEA('700', 'work_order_id');
        $wo_obj = DB::table(config('alias.rwo') . ' as rwo')
            ->leftJoin(config('alias.rpo') . ' as rpo', 'rpo.id', '=', 'rwo.production_order_id')
            ->select(['rwo.id', 'rpo.number as product_order_code'])
            ->where([['rwo.id', '=', $input['work_order_id']]])
            ->first();
        if (empty($wo_obj)) TEA('700', 'work_order_id');
//        $input['product_order_code'] = $wo_obj->product_order_code;

        $input['sale_order_code'] = empty($input['sale_order_code']) ? '' : $input['sale_order_code'];

        if (empty($input['materials'])) TEA('700', 'materials');
        foreach ($input['materials'] as &$material) {
            if (empty($material['material_id'])) TEA('700', 'material_id');
            $exist = $this->isExisted([['id', '=', $material['material_id']]], config('alias.rm'));
            if (!$exist) TEA('700', 'material_id');
            if (empty($material['qty'])) TEA('700', 'qty');
        }
    }

    /**
     * 验证是否允许向mes领料
     *
     * 条件：
     * 1.尚未进行额定领料
     * 2.线边库满足WO下面的物料库存
     * @param array $input
     * @return boolean
     */
    public function checkApplyMes($input)
    {
        // 1.查询 额定领料单是否存在
        $rmr_obj = DB::table($this->table . ' as rmr')
            ->leftJoin(config('alias.rwo') . ' as rwo', 'rwo.id', '=', 'rmr.work_order_id')
            ->select([
                'rmr.sale_order_code',
                'rmr.product_order_code',
                'rwo.number as work_order_code'
            ])
            ->where([
                ['rmr.type', '=', 1],
                ['is_delete', '=', 0],
                ['rmr.push_type', '=', 0],
                ['rmr.work_order_id', '=', $input['work_order_id']]
            ])
            ->first();
        if (empty($rmr_obj)) {
            return false;
        }


        // 2. 判断 库存 >? 额定数
        /**
         * @var array $material_ID_Arr 查询实时库存的whereIn的material_id条件的值
         * @var array $lineDepot_ID_Arr 查询实时库存的whereIn的line_depot_id条件的值
         */
        $material_ID_Arr = [];
        if (empty($input['materials'])) {
            return false;
        }
        foreach ($input['materials'] as $material) {
            $material_ID_Arr[] = $material['material_id'];
        }

        /**
         * 先根据SO,PO,WO查实时库存，然后再根据SO查出的结果取交集
         */
        $input['sale_order_code'] = $rmr_obj->sale_order_code;
        $input['product_order_code'] = $rmr_obj->product_order_code;
        $input['work_order_code'] = $rmr_obj->work_order_code;
        $input['material_id_arr'] = $material_ID_Arr;

        $objs = DB::table(config('alias.rsi') . ' as rsi')
            ->select([
                'rsi.id as inve_id',
                'rsi.material_id',
            ])
            ->addSelect(DB::raw('SUM(rsi.storage_validate_quantity) as storage_number'))
            ->where(function ($query) use ($input) {
                $query->where([
                    ['rsi.po_number', '=', $input['product_order_code']],
                    ['rsi.wo_number', '=', $input['work_order_code']]
                ])
                    ->orWhere([
                        ['rsi.po_number', '=', ''],
                        ['rsi.wo_number', '=', '']
                    ]);
            })
            ->where('rsi.sale_order_code', '=', $input['sale_order_code'])
            ->whereIn('rsi.material_id', $input['material_id_arr'])
            ->groupBy('rsi.material_id', 'rsi.lot', 'rsi.depot_id')
            ->get();

//        // 构造查询实时库存
//        $objs = DB::table(config('alias.rsi'))
//            ->select([
//                'material_id',
//                'storage_validate_quantity as storage_number',
//                'depot_id as line_depot_id'
//            ])
//            ->where([['sale_order_code', '=', $input['sale_order_code']]])
//            ->whereIn('material_id', $material_ID_Arr)
//            ->get();
        // 遍历查询结果 拼接成 key 为line_depot_id _ material_id的数组
        $storageArr = [];
        foreach ($objs as $obj) {
            $storageArr[$obj->material_id] = obj2array($obj);
        }

        //遍历进料数组，判断每一个物料的实时库存是否满足额定值
        foreach ($input['materials'] as $material) {
            $storageNumber = empty($storageArr[$material['material_id']]) ? 0 :
                $storageNumber = $storageArr[$material['material_id']]['storage_number'];
            // 如果 实时库存小于额定值，则返回 false
            if ($storageNumber < $material['qty']) {
                return false;
            }
        }
        // 如果以上判断都通过，则返回成功
        return true;
    }


    /**
     * @param $input
     * @throws \App\Exceptions\ApiException
     */
    public function checkWorkShopParams(&$input)
    {
        if (empty($input['type']) || !in_array($input['type'], [1, 2, 7])) TEA('700', 'type');

        if (empty($input['factory_id'])) TEA('700', 'factory_id');
        $has = $this->isExisted([['id', '=', $input['factory_id']]], config('alias.rf'));
        if (!$has) TEA('700', 'factory_id');

        if (empty($input['employee_id'])) TEA('700', 'employee_id');
        $has = $this->isExisted([['id', '=', $input['employee_id']]], config('alias.re'));
        if (!$has) TEA('700', 'employee_id');

        if (empty($input['line_depot_id'])) TEA('700', 'line_depot_id');
        $has = $this->isExisted([['id', '=', $input['line_depot_id']]], config('alias.rsd'));
        if (!$has) TEA('700', 'line_depot_id');

//        if (empty($input['workbench_id'])) TEA('700', 'workbench_id');
//        $has = $this->isExisted([['id', '=', $input['workbench_id']]], config('alias.rwb'));
//        if (!$has) TEA('700', 'workbench_id');

        if (empty($input['work_order_id'])) TEA('700', 'work_order_id');
        //验证所属工单是否被锁定
        $this->checkWorkOrderLock($input['work_order_id']);
        $has = $this->isExisted([['id', '=', $input['work_order_id']], ['number', '=', $input['wo_number']]], config('alias.rwo'));
        if (!$has) TEA('700', 'work_order_id');
        $input['work_order_code'] = $input['wo_number'];

        $wo_obj = DB::table(config('alias.rwo') . ' as rwo')
            ->leftJoin(config('alias.rpo') . ' as rpo', 'rpo.id', '=', 'rwo.production_order_id')
            ->select(['rpo.number', 'rpo.id'])
            ->where('rwo.id', $input['work_order_id'])
            ->first();
        if (empty($wo_obj) || !isset($wo_obj->number)) {
            TEA('2427');
        }
        $input['product_order_code'] = $wo_obj->number;
        $input['product_order_id'] = $wo_obj->id;

        if (empty($input['materials']) || !is_array($input['materials'])) TEA('700', 'materials');
        foreach ($input['materials'] as $key => &$value) {
            if (empty($value['material_id'])) TEA('700', 'material_id');
            $obj = DB::table(config('alias.rm'))
                ->select(['id', 'item_no as material_code'])
                ->where('id', $value['material_id'])
                ->first();
            if (!isset($obj->material_code)) TEA('700', 'material_id');
            //虚拟进料 无需领料
            if ($obj->material_code == '99999999') {
                unset($input['materials'][$key]);
                continue;
            }
            $value['material_code'] = $obj->material_code;

            if (empty($value['unit_id'])) TEA('700', 'unit_id');    // 此unit_id 是bom_unit_id
            $has = $this->isExisted([['id', '=', $value['unit_id']]], config('alias.ruu'));
            if (!$has) TEA('700', 'unit_id');

            if (empty($value['demand_qty'])) TEA('700', 'demand_qty');

            if (empty($value['batches'])) TEA('700', 'batches');
            $batch_qty_sum = 0;
            foreach ($value['batches'] as &$batch) {
                if (!isset($batch['batch'])) TEA('700', 'batch');
                // 验证库存地点
                if (empty($batch['depot_id'])) TEA('700', 'depot_id');
                $has = $this->isExisted([['id', '=', $batch['depot_id']]], config('alias.rsd'));
                if (!$has) TEA('700', 'depot_id');

                //验证单位
                if (empty($batch['unit_id'])) TEA('700', 'unit_id');
                $has = $this->isExisted([['id', '=', $batch['unit_id']]], config('alias.ruu'));
                if (!$has) TEA('700', 'batch unit_id');

                //验证库存id
                if (empty($batch['inve_id'])) TEA('700', 'inve_id');
                $has = $this->isExisted([['id', '=', $batch['inve_id']]], config('alias.rsi'));
                if (!$has) TEA('700', 'inve_id');

                // 累加 计算定额总数
                empty($batch['batch_qty']) && TEA('700', 'batch_qty');
                $batch_qty_sum += $batch['batch_qty'];
            }
            if ($input['type'] == 1 && bccomp($batch_qty_sum, $value['demand_qty'], 3)) {
                TEA('2429', '物料：' . $value['material_code'] . ',定额总数为' . $value['demand_qty'] . ',需求总数为' . $batch_qty_sum);
            }
        }

        $input['creator_id'] = (!empty(session('administrator')->admin_id)) ? session('administrator')->admin_id : 0;
    }

    /**
     * 验证是否允许生成车间退料单
     *
     * @param $input
     * @throws \App\Exceptions\ApiException
     */
    public function checkWorkShopReturnMaterial($input)
    {
        if (empty($input['work_order_id'])) TEA('700', 'work_order_id');
        $has = $this->isExisted([['id', '=', $input['work_order_id']]], config('alias.rwo'));
        if (!$has) TEA('9500');

        $has = $this->isExisted([
            ['work_order_id', '=', $input['work_order_id']],
            ['status', '=', 4],
            ['type', '=', 1],
            ['push_type', '=', 2],
        ]);
        if (!$has) TEA('2431');  // 尚未完成领料单

        //验证是否已创建退料单
        $has = $this->isExisted([
            ['type', '=', 2],
            ['push_type', '=', 2],
            ['work_order_id', '=', $input['work_order_id']]
        ]);
        if ($has) TEA('2430');  // 退料单已重复创建
    }

    /**
     * @param $input
     * @throws \App\Exceptions\ApiException
     */
    public function checkWorkStopReturnParams(&$input)
    {
        if (empty($input['work_order_id'])) TEA('700', 'work_order_id');
        //验证所属工单是否被锁定
        $this->checkWorkOrderLock($input['work_order_id']);
        $has = $this->isExisted([['id', '=', $input['work_order_id']]], config('alias.rwo'));
        if (!$has) TEA('700', 'work_order_id');

        if (empty($input['batches'])) TEA('700', 'batches');
        foreach ($input['batches'] as &$batch) {
            if (!isset($batch['return_qty'])) TEA('700', 'return_qty');

            //如果退料数量为 0 or负数，则跳过
            if ($batch['return_qty'] <= 0) {
                continue;
            }

            if (!isset($batch['batch'])) TEA('700', 'batch');
            // 验证上个车间库存地点
            if (empty($batch['origin_depot_id'])) TEA('700', 'origin_depot_id');
            $has = $this->isExisted([['id', '=', $batch['origin_depot_id']]], config('alias.rsd'));
            if (!$has) TEA('700', 'origin_depot_id');

            //验证单位
            if (empty($batch['unit_id'])) TEA('700', 'unit_id');
            $has = $this->isExisted([['id', '=', $batch['unit_id']]], config('alias.ruu'));
            if (!$has) TEA('700', 'unit_id');

            if (empty($batch['material_id'])) TEA('700', 'material_id');
            $obj = DB::table(config('alias.rm'))
                ->select(['id', 'item_no as material_code'])
                ->where('id', $batch['material_id'])
                ->first();
            if (!isset($obj->material_code)) TEA('700', 'material_id');
            $batch['material_code'] = $obj->material_code;

            //验证库存id
            if (empty($batch['inve_id'])) TEA('700', 'inve_id');
            $inve_obj = DB::table(config('alias.rsi'))
                ->select([
                    'id',
                    'storage_validate_quantity as storage_number',
                ])
                ->where('id', $batch['inve_id'])
                ->first();
            if (empty($inve_obj) || $inve_obj->storage_number < $batch['return_qty']) TEA('700', 'inve_id');
        }
        $input['creator_id'] = (!empty(session('administrator')->admin_id)) ? session('administrator')->admin_id : 0;
    }

    /**
     * 验证 SAP发料是否为最后一次
     *
     * @param int $material_requisition_id
     * @return bool
     */
    public function checkIsLastSend($material_requisition_id)
    {
        if (empty($material_requisition_id)) return false;
        $obj_list = DB::table($this->table . ' as rmr')
            ->leftJoin($this->itemTable . ' as rmri', 'rmri.material_requisition_id', '=', 'rmr.id')
            ->leftJoin(config('alias.rmrib') . ' as rmrib', 'rmrib.item_id', '=', 'rmri.id')
            ->select([
                'rmr.id as rmr_id',
                'rmri.id as rmri_id',
                'rmrib.id as rmrib_id'
            ])
            ->where([
                ['rmr.is_delete', '=', 0],
                ['rmr.id', '=', $material_requisition_id]
            ])
            ->get();
        if (empty(obj2array($obj_list))) {
            return false;
        }

        /**
         * 判断 是否为最后一次发料。
         *
         * 原理：
         * 默认为最后一次，
         * 如果物料对应的批次表的ID 不存在/空/NULL，则不是最后一次
         */
        $flag = true;
        foreach ($obj_list as $obj) {
            if (!isset($obj->rmrib_id) || empty($obj->rmrib_id) || is_null($obj->rmrib_id)) {
                $flag = false;
                break;
            }
        }
        return $flag;
    }

    /**
     * 验证 是否为退料最后一次更新实收数量
     *
     * @param $material_requisition_id
     * @return bool
     */
    public function checkIsLastReturn($material_requisition_id)
    {
        if (empty($material_requisition_id)) return false;
        $obj_list = DB::table($this->table . ' as rmr')
            ->leftJoin(config('alias.rmrib') . ' as rmrib', 'rmrib.material_requisition_id', '=', 'rmr.id')
            ->select([
                'rmr.id as rmr_id',
                'rmrib.id as rmrib_id',
                'rmrib.actual_send_qty',
                'rmrib.actual_receive_qty',
            ])
            ->where([
                ['rmr.is_delete', '=', 0],
                ['rmr.id', '=', $material_requisition_id]
            ])
            ->get();
        if (empty(obj2array($obj_list))) {
            return false;
        }

        /**
         * 判断 是否为最后一次实收
         *
         * 原理：
         * 如果物料对应的批次表，其实收数量为 空/NULL/0 ，则不是最后一次
         */
        $flag = true;
        foreach ($obj_list as $obj) {
            if (empty($obj->actual_receive_qty) || is_null($obj->actual_receive_qty) || $obj->actual_receive_qty == 0) {
                $flag = false;
                break;
            }
        }
        return $flag;
    }

    /**
     * 判断当前工单是否被锁定
     *
     * @param $work_order_id
     * @throws \App\Exceptions\ApiException
     */
    public function checkWorkOrderLock($work_order_id)
    {
        $obj = DB::table(config('alias.rwo'))
            ->select([
                'on_off',   // 0->锁定; 1->正常
                'number as work_order_code'
            ])
            ->where([
                ['id', '=', $work_order_id],
                ['is_delete', '=', 0],
            ])
            ->first();
        if (empty($obj) || empty($obj->on_off)) {
            TEA(2413);
        }
    }

    /**
     * 判断当前工单是否被锁定（根据领料单ID）
     *
     * @param $material_requisition_id
     * @throws \App\Exceptions\ApiException
     */
    public function checkWorkOrderLockByMRID($material_requisition_id)
    {
        $obj = DB::table(config('alias.rmr') . ' as rmr')
            ->leftJoin(config('alias.rwo') . ' as rwo', 'rwo.id', '=', 'rmr.work_order_id')
            ->select(['rwo.on_off'])
            ->where([
                ['rmr.id', '=', $material_requisition_id],
                ['rmr.is_delete', '=', 0],
                ['rwo.is_delete', '=', 0],
            ])
            ->first();
        if (empty($obj) || empty($obj->on_off)) {
            TEA(2413);
        }
    }

    /**
     * 判断当前工单是否被锁定（根据领料单CODE）
     *
     * @param $material_requisition_code
     * @throws \App\Exceptions\ApiException
     */
    public function checkWorkOrderLockByMRCode($material_requisition_code)
    {
        $obj = DB::table(config('alias.rmr') . ' as rmr')
            ->leftJoin(config('alias.rwo') . ' as rwo', 'rwo.id', '=', 'rmr.work_order_id')
            ->select(['rwo.on_off'])
            ->where([
                ['rmr.code', '=', $material_requisition_code],
                ['rmr.is_delete', '=', 0],
                ['rwo.is_delete', '=', 0],
            ])
            ->first();
        if (empty($obj) || empty($obj->on_off)) {
            TEA(2413);
        }
    }
//endregion

//region 增

    /**
     * 生成领料单号
     *
     * @param int $type
     * @return string
     */
    public function createCode($type = 1)
    {
        $timeStr = date('YmdHis');
        $code = 'MR' . $type . $timeStr . str_pad(rand(1, 999), 3, '0', STR_PAD_LEFT);
        while (in_array($code, $this->mrCode)) {
            $code = 'MR' . $type . $timeStr . str_pad(rand(1, 999), 3, '0', STR_PAD_LEFT);
        }
        ($this->mrCode)[] = $code;
        return $code;
    }

    /**
     * 获取一个新的领料单号
     *
     * @param int $type
     * @return string
     */
    public function getNewCode($type = 1)
    {
        $code = $this->createCode($type);
        $obj = DB::table($this->table)->select(['code'])->where('code', $code)->first();
        while (!empty($obj)) {
            $code = $this->createCode($type);
            $obj = DB::table($this->table)->where('code', $code)->select('code')->first();
        }
        return $code;
    }

    /**
     * 生成一个行项目号
     *
     * @param $i
     * @return string
     */
    public function createLineCode($i)
    {
        if (count($i) > 5) {
            return rand(10000, 99999);
        }
        return str_pad($i, 5, '0', STR_PAD_LEFT);
    }


    /**
     * 新增领料单
     *
     * @param $input
     * @return mixed
     * @throws \App\Exceptions\ApiException
     * @author lester.you
     */
    public function store($input)
    {
        //如果是额定领料，需要判断是否为首次，否则需拒绝
        if ($input['type'] == 1 && $input['push_type'] == 0) {
            $obj = DB::table($this->table)
                ->where([
                    ['work_order_id', '=', $input['work_order_id']],
                    ['type', '=', 1],
                    ['is_delete', '=', 0],
                    ['push_type', '=', 0]
                ])
                ->count();
            if ($obj) TEA('2488');
        }

        $keyVal = [
            'type' => $input['type'],
            'factory_id' => $input['factory_id'],
            'line_depot_id' => get_value_or_default($input, 'line_depot_id', 0),  // 如果为mes领料，则没有线边库
            'workbench_id' => get_value_or_default($input, 'workbench_id', 0),
            'work_order_id' => $input['work_order_id'],
            'product_order_id' => $input['product_order_id'],
            'product_order_code' => $input['product_order_code'],
            'sale_order_code' => empty($input['sales_order_code']) ? '' : $input['sales_order_code'],
            'sale_order_project_code' => empty($input['sales_order_project_code']) ? '' : $input['sales_order_project_code'],
            'employee_id' => $input['employee_id'],
            'time' => time(),
            'ctime' => time(),
            'mtime' => time(),
            'from' => 1,
            'status' => $input['push_type'] ?: 3,   // 如果SAP领料，状态为1,;mes领料状态为3
            'push_type' => $input['push_type'],
            'creator_id' => $input['creator_id']
        ];
        $depotItemsArr = [];
        $iArr = []; // 用于生成行项目号
        foreach ($input['materials'] as $key => $value) {
            /**
             * 1.如果是mes领料，
             */
            if ($input['push_type'] == 0) {
                $tempItemArr = [
//                'line_project_code' => $this->createLineCode($iArr[$sendDepot]),
                    'material_id' => $value['material_id'],
                    'material_code' => $value['material_code'],
                    'demand_qty' => ceil_dot($input['push_type'] ? $value['demand_qty'] : $value['rated_qty'], 1),
                    'demand_unit_id' => $value['unit_id'],  //此为 bom_unit_id
                    'is_special_stock' => isset($value['special_stock']) ? $value['special_stock'] : '',
                    'send_status' => 1,
//                'batchArr' => $tempBatchArr
                ];
                // 1.遍历 batches
                /**
                 * @var array $temp_depot_arr 根据库存地点，进行分组
                 */
                $temp_depot_arr = [];
                foreach ($value['batches'] as $batch) {
                    // 如果物料为 0，则舍弃
                    if ($batch['batch_qty'] <= 0) {
                        continue;
                    }
                    $temp_depot_arr[$batch['depot_id']][] = $batch;
                }

                //遍历 库存地点分组 数组，封装itemArr
                foreach ($temp_depot_arr as $temp_depot_id => $temp_batch) {
                    !isset($iArr[$temp_depot_id]) && $iArr[$temp_depot_id] = 1;
                    $tempItemArr['line_project_code'] = $this->createLineCode($iArr[$temp_depot_id]);
                    $tempItemArr['depot_id'] = $temp_depot_id;
                    $batchArr = [];
                    $j = 1;
                    foreach ($temp_batch as $t_batch) {
                        $batchArr[] = [
                            'order' => str_pad($j, 5, '0', STR_PAD_LEFT),
                            'batch' => empty($t_batch['batch']) ? '' : $t_batch['batch'],
                            'actual_send_qty' => $t_batch['batch_qty'],
                            'actual_receive_qty' => $t_batch['batch_qty'],  //mes領料不需要填寫實收數據，實收數據為實發數據
                            'bom_unit_id' => $t_batch['unit_id'],
                            'inve_id' => $t_batch['inve_id']
                        ];
                        $j++;
                    }
                    $tempItemArr['batchArr'] = $batchArr;
                    $iArr[$temp_depot_id]++;
                    $depotItemsArr[0][] = $tempItemArr;
                }
            } else {
                $sendDepot = $value['send_depot'];
                !isset($iArr[$sendDepot]) && $iArr[$sendDepot] = 1;
                // item表数据数组
                $tempItemArr = [
                    'line_project_code' => $this->createLineCode($iArr[$sendDepot]),
                    'material_id' => $value['material_id'],
                    'material_code' => $value['material_code'],
                    'demand_qty' => ceil_dot($input['push_type'] ? $value['demand_qty'] : $value['rated_qty'], 1),
                    'demand_unit_id' => $value['unit_id'],  //此为 bom_unit_id
                    'is_special_stock' => isset($value['special_stock']) ? $value['special_stock'] : '',
                    'send_status' => 1,
                    'batchArr' => []
                ];
                $depotItemsArr[$sendDepot][] = $tempItemArr;
                $iArr[$sendDepot]++;
            }

        }

        /**
         * @var array $mrKeyValArr 组装数据 顶层数组
         */
        $mrKeyValArr = [];
        foreach ($depotItemsArr as $sendDepot => $depotItem) {
            $keyVal['code'] = $this->getNewCode($input['type']);    //生产领料单
            // 如果为 向SAP领料，则需要 添加send_depot字段
            if ($input['push_type'] == 1) {
                $keyVal['send_depot'] = $sendDepot;
            } else {
                $keyVal['send_depot'] = '';
            }
            $keyVal['items'] = $depotItem;
            $mrKeyValArr[] = $keyVal;
        }

        $mrIDArr = [];
        try {
            DB::connection()->beginTransaction();

            // 遍历 插入mr表
            $batchesKeyValArr = [];
            foreach ($mrKeyValArr as $mr) {
                $itemsArr = $mr['items'];
                unset($mr['items']);
                $mr_id = DB::table($this->table)->insertGetId($mr);
                $mrIDArr[] = $mr_id;

                //遍历 插入 item 表
                foreach ($itemsArr as $item) {
                    $batchArr = $item['batchArr'];
                    unset($item['batchArr']);
                    $item['material_requisition_id'] = $mr_id;
                    $item_id = DB::table($this->itemTable)->insertGetId($item);  //插入 item表

                    //遍历 生产 batch 表数据
                    foreach ($batchArr as $batch) {
                        $batch['material_requisition_id'] = $mr_id;
                        $batch['item_id'] = $item_id;
                        $batchesKeyValArr[] = $batch;
                    }
                }
            }
            DB::table(config('alias.rmrib'))->insert($batchesKeyValArr);
        } catch (\Exception $e) {
            //回滚
            DB::connection()->rollBack();
            TEA('2420');
        }
        DB::connection()->commit();
        return $mrIDArr;
    }

    /**
     * 废弃
     *
     * @param $input
     * @return array
     * @throws \App\Exceptions\ApiException
     */
    public function mesStore($input)
    {
        //如果是额定领料，需要判断是否为首次，否则需拒绝
        if ($input['type'] == 1 && $input['push_type'] == 0) {
            $obj = DB::table($this->table)
                ->where([
                    ['work_order_id', '=', $input['work_order_id']],
                    ['type', '=', 1],
                    ['is_delete', '=', 0],
                    ['push_type', '=', 0]
                ])
                ->count();
            if ($obj) TEA('2488');
        }

        $keyVal = [
            'type' => $input['type'],
            'factory_id' => $input['factory_id'],
            'line_depot_id' => $input['line_depot_id'],
            'workbench_id' => get_value_or_default($input, 'workbench_id', 0),
            'work_order_id' => $input['work_order_id'],
            'product_order_id' => $input['product_order_id'],
            'product_order_code' => $input['product_order_code'],
            'sale_order_code' => empty($input['sales_order_code']) ? '' : $input['sales_order_code'],
            'sale_order_project_code' => empty($input['sales_order_project_code']) ? '' : $input['sales_order_project_code'],
            'employee_id' => $input['employee_id'],
            'time' => time(),
            'ctime' => time(),
            'mtime' => time(),
            'from' => 1,
            'status' => $input['push_type'] ?: 3,   // 如果SAP领料，状态为1,;mes领料状态为2
            'push_type' => $input['push_type'],
            'creator_id' => $input['creator_id']
        ];
        $depotItemsArr = [];
        $iArr = []; // 用于生成行项目号
        foreach ($input['materials'] as $key => $value) {
            $sendDepot = $input['push_type'] == 0 ? $input['line_depot_id'] : $value['send_depot'];

            !isset($iArr[$sendDepot]) && $iArr[$sendDepot] = 1;

            /**
             * @var array $tempBatchArr 批次表插入值数组
             */
            $tempBatchArr = [];
            if ($input['push_type'] == 0) {
                $j = 1;  // 用于生成批次表的序号
                foreach ($value['batches'] as $batchItem) {
                    // 如果 为mes领料 则会需要有插入批次表数据
                    if ($input['push_type'] == 0) {
                        $tempBatchArr[] = [
                            'order' => str_pad($j, 5, '0', STR_PAD_LEFT),
                            'batch' => empty($batchItem['batch']) ? '' : $batchItem['batch'],
                            'actual_send_qty' => $batchItem['batch_qty'],
                            'bom_unit_id' => $value['unit_id']
                        ];
                    }
                    $j++;
                }
            }

            // item表数据数组
            $tempItemArr = [
                'line_project_code' => $this->createLineCode($iArr[$sendDepot]),
                'material_id' => $value['material_id'],
                'material_code' => $value['material_code'],
                'demand_qty' => ceil_dot($input['push_type'] ? $value['demand_qty'] : $value['rated_qty'], 1),
                'demand_unit_id' => $value['unit_id'],  //此为 bom_unit_id
                'is_special_stock' => isset($value['special_stock']) ? $value['special_stock'] : '',
                'send_status' => 1,
                'batchArr' => $tempBatchArr
            ];
            $depotItemsArr[$sendDepot][] = $tempItemArr;

            $iArr[$sendDepot]++;
        }

        /**
         * @var array $mrKeyValArr 组装数据 顶层数组
         */
        $mrKeyValArr = [];
        foreach ($depotItemsArr as $sendDepot => $depotItem) {
            $keyVal['code'] = $this->getNewCode($input['type']);    //生产领料单
            // 如果为 向SAP领料，则需要 添加send_depot字段
            if ($input['push_type'] == 1) {
                $keyVal['send_depot'] = $sendDepot;
            } else {
                $keyVal['send_depot'] = '';
            }
            $keyVal['items'] = $depotItem;
            $mrKeyValArr[] = $keyVal;
        }

        $mrIDArr = [];
        try {
            DB::connection()->beginTransaction();

            // 遍历 插入mr表
            $batchesKeyValArr = [];
            foreach ($mrKeyValArr as $mr) {
                $itemsArr = $mr['items'];
                unset($mr['items']);
                $mr_id = DB::table($this->table)->insertGetId($mr);
                $mrIDArr[] = $mr_id;

                //遍历 插入 item 表
                foreach ($itemsArr as $item) {
                    $batchArr = $item['batchArr'];
                    unset($item['batchArr']);
                    $item['material_requisition_id'] = $mr_id;
                    $item_id = DB::table($this->itemTable)->insertGetId($item);  //插入 item表

                    //遍历 生产 batch 表数据
                    foreach ($batchArr as $batch) {
                        $batch['material_requisition_id'] = $mr_id;
                        $batch['item_id'] = $item_id;
                        $batchesKeyValArr[] = $batch;
                    }
                }
            }
            DB::table(config('alias.rmrib'))->insert($batchesKeyValArr);
        } catch (\Exception $e) {
            //回滚
            DB::connection()->rollBack();
            TEA('2420');
        }
        DB::connection()->commit();
        return $mrIDArr;
    }


    /**
     * 生成SAP退料单
     *
     * @param $input
     * @return array
     * @throws \App\Exceptions\ApiException
     */
    public function storeReturnMaterial($input)
    {
        $keyVal = [
            'type' => 2, //ZY02 车间退料
            'factory_id' => $input['factory_id'],
            'line_depot_id' => $input['line_depot_id'],
            'work_order_id' => $input['work_order_id'],
            'product_order_id' => $input['product_order_id'],
            'product_order_code' => $input['product_order_code'],
            'sale_order_code' => empty($input['sale_order_code']) ? '' : $input['sale_order_code'],
            'sale_order_project_code' => empty($input['sale_order_project_code']) ? '' : $input['sale_order_project_code'],
            'employee_id' => $input['employee_id'],
            'time' => time(),
            'ctime' => time(),
            'mtime' => time(),
            'from' => 1,
            'status' => 1,
            'push_type' => 1,   // sap退料
            'creator_id' => $input['creator_id']
        ];
        $depotItemsArr = [];
        $iArr = []; // 用于生成行项目号
        foreach ($input['items'] as $key => $value) {
            $sendDepot = empty($value['send_depot']) ? '' : $value['send_depot'];
            !isset($iArr[$sendDepot]) && $iArr[$sendDepot] = 1;

            /**
             * @var array $tempBatchArr 批次表插入值数组
             */
            $tempBatchArr = [];
            $j = 1;  // 用于生成批次表的序号
            foreach ($value['batches'] as $batchItem) {
                $tempBatchArr[] = [
                    'order' => str_pad($j, 5, '0', STR_PAD_LEFT),
                    'batch' => empty($batchItem['batch']) ? '' : $batchItem['batch'],
                    'actual_send_qty' => $batchItem['return_number'],
                    'base_unit' => '',  //基本单位
                    'bom_unit_id' => $batchItem['unit_id'],     // bom单位
                    'inve_id' => $batchItem['inve_id'],     // bom单位
                ];
                $j++;
            }

            // item表数据数组
            $tempItemArr = [
                'line_project_code' => $this->createLineCode($iArr[$sendDepot]),
                'material_id' => $value['material_id'],
                'material_code' => $value['material_code'],
//                'demand_qty' => $input['push_type'] ? $value['demand_qty'] : $value['rated_qty'],
//                'demand_unit_id' => $value['unit_id'],
                'is_special_stock' => isset($value['special_stock']) ? $value['special_stock'] : '',
                'send_status' => 1,
//                'send_depot' => $value['send_depot'],
                'batchArr' => $tempBatchArr,
            ];
            $depotItemsArr[$sendDepot][] = $tempItemArr;

            $iArr[$sendDepot]++;
        }

        /**
         * @var array $mrKeyValArr 组装数据 顶层数组
         */
        $mrKeyValArr = [];
        foreach ($depotItemsArr as $sendDepot => $depotItem) {
            $keyVal['code'] = $this->getNewCode(2);    //生成退料单
            $keyVal['send_depot'] = $sendDepot;

            $keyVal['items'] = $depotItem;
            $mrKeyValArr[] = $keyVal;
        }

        $mrIDArr = [];
        try {
            DB::connection()->beginTransaction();

            // 遍历 插入mr表
            $batchesKeyValArr = [];
            foreach ($mrKeyValArr as $mr) {
                $itemsArr = $mr['items'];
                unset($mr['items']);
                $mr_id = DB::table($this->table)->insertGetId($mr);
                $mrIDArr[] = $mr_id;

                //遍历 插入 item 表
                foreach ($itemsArr as $item) {
                    $batchArr = $item['batchArr'];
                    unset($item['batchArr']);
                    $item['material_requisition_id'] = $mr_id;
                    $item_id = DB::table($this->itemTable)->insertGetId($item);  //插入 item表

                    //遍历 生产 batch 表数据
                    foreach ($batchArr as $batch) {
                        $batch['material_requisition_id'] = $mr_id;
                        $batch['item_id'] = $item_id;
                        $batchesKeyValArr[] = $batch;
                    }
                }
            }
            DB::table(config('alias.rmrib'))->insert($batchesKeyValArr);
        } catch (\Exception $e) {
            //回滚
            DB::connection()->rollBack();
            TEA('2420');
        }
        DB::connection()->commit();
        return $mrIDArr;
    }


    /**
     * 生成 车间领/补料订单
     * @param $input
     * @return array
     * @throws \App\Exceptions\ApiException
     */
    public function storeWorkShop($input)
    {
        //如果是额定领料，需要判断是否为首次，否则需拒绝
        if ($input['type'] == 1) {
            $obj = DB::table($this->table)
                ->where([
                    ['work_order_id', '=', $input['work_order_id']],
                    ['type', '=', 1],
                    ['is_delete', '=', 0],
                    ['push_type', '=', 2]
                ])
                ->count();
            if ($obj) TEA('2488');
        }
        $keyVal = [
            'type' => $input['type'],
            'factory_id' => $input['factory_id'],
            'line_depot_id' => $input['line_depot_id'],  // 领补料的需求车间库存地点
            'workbench_id' => get_value_or_default($input, 'workbench_id', 0),
            'work_order_id' => $input['work_order_id'],
            'product_order_id' => $input['product_order_id'],
            'product_order_code' => $input['product_order_code'],
            'sale_order_code' => empty($input['sales_order_code']) ? '' : $input['sales_order_code'],
            'sale_order_project_code' => empty($input['sales_order_project_code']) ? '' : $input['sales_order_project_code'],
            'employee_id' => $input['employee_id'],
            'time' => time(),
            'ctime' => time(),
            'mtime' => time(),
            'from' => 1,
            'status' => 2,   // 状态均为2
            'push_type' => 2,   //类型固定为 车间领料
            'creator_id' => $input['creator_id']
        ];

        $tempMaterialArr = [];
        foreach ($input['materials'] as $material) {
            // 把batches拆分为 key为depot_id的数组(第三层)
            $tempBatchArr = [];
            foreach ($material['batches'] as $batch) {
                $tempBatchArr[$batch['depot_id']][] = $batch;
            }

            /**
             * 遍历上面的数组，然后拆分为 key为depot_id的数组(第二层)
             */
            foreach ($tempBatchArr as $key => $depotArr) {
                $material['batches'] = $depotArr;   //rm_item 层数组
                $material['depot_id'] = $key;
                $tempMaterialArr[$key][] = $material;
            }
        }
        $keyValArr = [];
        foreach ($tempMaterialArr as $depot_id => $materialArr) {
            $keyVal['code'] = $this->getNewCode($input['type']);
            $keyVal['send_depot'] = $depot_id;  //发料地点ID(冗余item.depot_id字段)
            $i = 1;
            $itemsArr = [];
            foreach ($materialArr as $material) {
                $item = [
                    'line_project_code' => $this->createLineCode($i),
                    'material_id' => $material['material_id'],
                    'material_code' => $material['material_code'],
                    'demand_qty' => $material['demand_qty'],
                    'demand_unit_id' => $material['unit_id'],
                    'depot_id' => $material['depot_id'],    //发料地点
                    'send_status' => 2,
                    'is_special_stock' => isset($material['special_stock']) ? $material['special_stock'] : '',
                ];
                $j = 1;
                foreach ($material['batches'] as $batch) {
                    $batchKeyVal = [
                        'order' => $this->createLineCode($j),
                        'batch' => $batch['batch'],
                        'actual_send_qty' => $batch['batch_qty'],
                        'bom_unit_id' => $batch['unit_id'],
//                        'actual_receive_qty' => $batch['batch_qty'],
                        'inve_id' => $batch['inve_id']
                    ];
                    $j++;
                    $item['batches'][] = $batchKeyVal;
                }
                $i++;
                $itemsArr[] = $item;
            }
            $keyVal['materials'] = $itemsArr;
            $keyValArr[] = $keyVal;
        }
        $mrIDArr = [];
        try {
            DB::connection()->beginTransaction();
            // 遍历 插入mr表
            $batchesKeyValArr = [];
            foreach ($keyValArr as $mr) {
                $itemsArr = $mr['materials'];
                unset($mr['materials']);
                $mr_id = DB::table($this->table)->insertGetId($mr);
                $mrIDArr[] = $mr_id;

                //遍历 插入 item 表
                foreach ($itemsArr as $item) {
                    $batchArr = $item['batches'];
                    unset($item['batches']);
                    $item['material_requisition_id'] = $mr_id;
                    $item_id = DB::table($this->itemTable)->insertGetId($item);  //插入 item表

                    //遍历 生产 batch 表数据
                    foreach ($batchArr as $batch) {
                        $batch['material_requisition_id'] = $mr_id;
                        $batch['item_id'] = $item_id;
                        $batchesKeyValArr[] = $batch;
                    }
                }
            }
            DB::table(config('alias.rmrib'))->insert($batchesKeyValArr);
        } catch (\Exception $e) {
            //回滚
            DB::connection()->rollBack();
            TEA('2420');
        }
        DB::connection()->commit();
        return $mrIDArr;
    }

    /**
     * 生成 车间退料单
     * @param $input
     * @return array
     * @throws \App\Exceptions\ApiException
     */
    public function storeWorkShopReturn($input)
    {
        $obj = DB::table($this->table)
            ->select([
                'id',
                'sale_order_code',
                'sale_order_project_code',
                'factory_id',
                'line_depot_id',
                'workbench_id',
                'work_order_id',
                'product_order_code',
                'product_order_id',
            ])
            ->where([
                ['work_order_id', '=', $input['work_order_id']],
                ['status', '=', 4],
                ['push_type', '=', 2],
                ['is_delete', '=', 0],
            ])
            ->whereIn('type', [1, 7])
            ->first();
        if (empty($obj)) {
            TEA('2431');
        }

        $keyVal = [
            'type' => 2,
            'factory_id' => $obj->factory_id,
            'line_depot_id' => $obj->line_depot_id,  // 领补料的需求车间库存地点
            'workbench_id' => $obj->workbench_id,
            'work_order_id' => $obj->work_order_id,
            'product_order_id' => $obj->product_order_id,
            'product_order_code' => $obj->product_order_code,
            'sale_order_code' => $obj->sale_order_code,
            'sale_order_project_code' => $obj->sale_order_project_code,
            'employee_id' => $input['employee_id'],
            'time' => time(),
            'ctime' => time(),
            'mtime' => time(),
            'from' => 1,
            'status' => 2,   // 状态均为2
            'push_type' => 2,   //类型固定为 车间领料
            'creator_id' => $input['creator_id']
        ];

        $tempDepotArr = [];
        foreach ($input['batches'] as $batch) {
            //如果退料数量为0，则直接跳过
            if ($batch['return_qty'] <= 0) {
                continue;
            }

            //$batch['origin_depot_id'] 为上一个仓库地点
            //生成领料单的时候，rmr.line_depot_id为当前库存地点，rmri.depot_id为上一个库存地点
            //地点顺序和SAP退料单保持一致。
            //出入库的时候，做特别处理。
            $temp_key = $batch['material_id'] . '_' . $batch['origin_depot_id'];
            if (empty($tempDepotArr[$temp_key]['material_id'])) {
                $tempDepotArr[$temp_key]['material_id'] = $batch['material_id'];
                $tempDepotArr[$temp_key]['material_code'] = $batch['material_code'];
                $tempDepotArr[$temp_key]['depot_id'] = $batch['origin_depot_id'];
            }
            $tempDepotArr[$temp_key]['batches'][] = $batch;
        }

        $tempMaterialArr = [];
        foreach ($tempDepotArr as $temp_depot) {
            $tempMaterialArr[$temp_depot['depot_id']][] = $temp_depot;
        }

        $keyValArr = [];
        foreach ($tempMaterialArr as $depot_id => $materialArr) {
            $keyVal['code'] = $this->getNewCode(2);
            $keyVal['send_depot'] = $depot_id;  //发料地点ID(冗余item.depot_id字段)
            $itemArr = [];
            $i = 1;
            foreach ($materialArr as $material) {
                $item = [
                    'line_project_code' => $this->createLineCode($i++),
                    'material_id' => $material['material_id'],
                    'material_code' => $material['material_code'],
                    'demand_qty' => 0,
                    'demand_unit_id' => 0,
                    'depot_id' => $depot_id,    //对于车间退料，该地址是上个车间的地址
                    'send_status' => 2,
                    'is_special_stock' => '',
                ];
                $j = 1;
                foreach ($material['batches'] as $batch) {
                    $batchKeyVal = [
                        'order' => $this->createLineCode($j++),
                        'batch' => $batch['batch'],
                        'actual_send_qty' => $batch['return_qty'],
                        'bom_unit_id' => $batch['unit_id'],
                        'inve_id' => $batch['inve_id']
                    ];
                    $item['batches'][] = $batchKeyVal;
                }
                $itemArr[] = $item;
            }
            $keyVal['materials'] = $itemArr;
            $keyValArr[] = $keyVal;
        }

        $mrIDArr = [];
        try {
            DB::connection()->beginTransaction();
            // 遍历 插入mr表
            $batchesKeyValArr = [];
            foreach ($keyValArr as $mr) {
                $itemsArr = $mr['materials'];
                unset($mr['materials']);
                $mr_id = DB::table($this->table)->insertGetId($mr);
                $mrIDArr[] = $mr_id;

                //遍历 插入 item 表
                foreach ($itemsArr as $item) {
                    $batchArr = $item['batches'];
                    unset($item['batches']);
                    $item['material_requisition_id'] = $mr_id;
                    $item_id = DB::table($this->itemTable)->insertGetId($item);  //插入 item表

                    //遍历 生产 batch 表数据
                    foreach ($batchArr as $batch) {
                        $batch['material_requisition_id'] = $mr_id;
                        $batch['item_id'] = $item_id;
                        $batchesKeyValArr[] = $batch;
                    }
                }
            }
            DB::table(config('alias.rmrib'))->insert($batchesKeyValArr);
        } catch (\Exception $e) {
            //回滚
            DB::connection()->rollBack();
            TEA('2420');
        }
        DB::connection()->commit();
        return $mrIDArr;
    }
//endregion


//region 删


    /**
     * 删除整条记录（包含子项)
     * 只允許刪除狀態為1的單子
     *
     * @param $input
     * @throws \App\Exceptions\ApiException
     */
    public function delete($input)
    {
        if (empty($input[$this->apiPrimaryKey])) TEA('700', $this->apiPrimaryKey);
        //判断所属工单是否被锁定
        $this->checkWorkOrderLockByMRID($input[$this->apiPrimaryKey]);

        // 判斷訂單是否存在
        $obj = DB::table($this->table)
            ->select(['id', 'status'])
            ->where([
                ['id', '=', $input[$this->apiPrimaryKey]],
                ['is_delete', '=', 0],
            ])
            ->first();
        if (empty($obj)) TEA('2421');
        //如果狀態不為1，則不允許刪除
        if ($obj->status != 1) {
            TEA('2489');
        }

//        DB::table($this->table)->where('id', $input[$this->apiPrimaryKey])->delete();
        DB::table($this->table)->where('id', $input[$this->apiPrimaryKey])->update(['is_delete' => 1]);
//        DB::table($this->itemTable)->where('material_requisition_id', $input[$this->apiPrimaryKey])->delete();
//        DB::table(config('alias.rmrib'))->where('material_requisition_id', $input[$this->apiPrimaryKey])->delete();
    }

    /**
     * 删除某一子项
     *
     * @param $input
     * @throws \App\Exceptions\ApiException
     */
    public function deleteItem($input)
    {
        if (empty($input['item_id'])) TEA('700', 'item_id');
        $item_obj = DB::table($this->itemTable . ' as rmri')
            ->leftJoin($this->table . ' as rmr', 'rmr.id', '=', 'rmri.material_requisition_id')
            ->select([
                'rmr.id',
                'rmr.status',
            ])
            ->where([
                ['rmri.id', '=', $input['item_id']],
                ['rmr.is_delete', '=', 0],
            ])
            ->first();
        if (empty($item_obj) || empty($item_obj->id) || $item_obj->status != 1) {
            TEA(2423);
        }
        //验证当前所属工单是否被锁定
        $this->checkWorkOrderLockByMRID($item_obj->id);

        DB::table($this->itemTable)->where('id', $input['item_id'])->delete();
        DB::table(config('alias.rmrib'))->where('item_id', $input['item_id'])->delete();
    }

//endregion


//region 改

    /**
     * 更改状态
     *
     * 1->填完申请单，未推送或推送失败
     * 2->推送成功（完成申请)
     * 3->完成（已填写实收数量）
     *
     * @param integer $id
     * @param integer $status
     * @throws \App\Exceptions\ApiException
     */
    public function updateStatus($id, $status)
    {
        //验证所属工单是否被锁定
        $this->checkWorkOrderLockByMRID($id);
        $db_rep = DB::table($this->table)->where('id', $id)->update(['status' => $status]);
        if ($db_rep === false) {
            TEA('500');
        }
    }

    /**
     * 更改子项需求数量
     *
     * 只有状态为 1 才可以修改
     *
     * @param array $input
     * @throws \App\Exceptions\ApiException
     */
    public function updateItem($input)
    {
        if (empty($input[$this->apiPrimaryKey])) TEA('700', $this->apiPrimaryKey);
        //验证所属工单是否被锁定
        $this->checkWorkOrderLockByMRID($input[$this->apiPrimaryKey]);
        if (empty($input['demands'])) TEA('700', 'demands');
        $mr_obj = DB::table($this->table . ' as rmr')
            ->select(['rmr.status', 'rmr.id'])
            ->where([
                ['rmr.id', '=', $input[$this->apiPrimaryKey]],
                ['rmr.status', '=', 1],
                ['rmr.is_delete', '=', 0],
            ])
            ->first();
        if (!isset($mr_obj->id)) {
            TEA('2423');
        }

        foreach ($input['demands'] as $demand) {
            if (empty($demand['item_id'])) TEA('700', 'item_id');
            if (empty($demand['demand_qty'])) TEA('700', 'demand_qty');
            $isExist = $this->isExisted([
                ['id', '=', $demand['item_id']],
                ['material_requisition_id', '=', $input[$this->apiPrimaryKey]]
            ], $this->itemTable);

            if (!$isExist) {
                continue;
            }
            DB::table($this->itemTable)
                ->where([
                    ['id', '=', $demand['item_id']],
                    ['material_requisition_id', '=', $input[$this->apiPrimaryKey]]
                ])
                ->update(['demand_qty' => $demand['demand_qty']]);
        }
    }

    /**
     * 更改每个子项的实收数量
     *
     * 只有状态为 3 时候才允许修改
     *
     * @param $input
     * @throws \App\Exceptions\ApiException
     */
    public function updateActualReceiveNumber($input)
    {
        if (empty($input[$this->apiPrimaryKey])) TEA('700', $this->apiPrimaryKey);
        //验证所属工单是否被锁定
        $this->checkWorkOrderLockByMRID($input[$this->apiPrimaryKey]);
        if (empty($input['batches'])) TEA('700', 'batches');
        $mr_obj = DB::table($this->table . ' as rmr')
            ->select(['rmr.status', 'rmr.id'])
            ->where([
                ['rmr.id', '=', $input[$this->apiPrimaryKey]],
                ['rmr.is_delete', '=', 0],
            ])
            ->whereIn('rmr.status', [3])
            ->first();
        if (!isset($mr_obj->id)) {
            TEA('2423');
        }

        foreach ($input['batches'] as $batch) {
            if (empty($batch['batch_id'])) TEA('700', 'batch_id');
            if (empty($batch['actual_receive_qty'])) TEA('700', 'actual_receive_qty');
            $is_exist = $this->isExisted([
                ['id', '=', $batch['batch_id']],
                ['material_requisition_id', '=', $mr_obj->id]
            ], config('alias.rmrib'));
            if (!$is_exist) TEA('2422');
            DB::table(config('alias.rmrib'))
                ->where([
                    ['id', '=', $batch['batch_id']],
                    ['material_requisition_id', '=', $mr_obj->id]
                ])
                ->update([
                    'actual_receive_qty' => $batch['actual_receive_qty']
                ]);
        }
//        DB::table($this->table)->where('id', $mr_obj->id)->update(['status' => 4]);
    }

    /**
     * 领/退/补 出入库
     *
     * @param $input
     * @param int $is_last_produce_work 是否为最后一次报工
     * @throws \App\Exceptions\ApiException
     */
    public function auditing($input, $is_last_produce_work = 0)
    {
        if (empty($input[$this->apiPrimaryKey])) TEA('700', $this->apiPrimaryKey);
        //验证所属工单是否被锁定
        $this->checkWorkOrderLockByMRID($input[$this->apiPrimaryKey]);
        $obj = DB::table($this->table)
            ->select([
                'id',
                'status',
                'type',
                'work_order_id',
                'push_type'
            ])
            ->where([
                ['id', '=', $input[$this->apiPrimaryKey]],
                ['status', '<', 4],
                ['is_delete', '=', 0],
            ])
            ->first();
        if (!isset($obj->id)) {
            TEA('2421');
        }

        $status = 3;
        $updateStatus = 4;
        if ($obj->type == 2) {
//            $status = 1;
//            $updateStatus = 2;
            $status = 2;        // 11.23 修改：推送后出库 状态：2->3
            $updateStatus = 3;
        }

        // 报工生成的mes领补退
        if (in_array($obj->type, [1, 2, 7]) && $obj->push_type == 0) {
            $status = 1;
            $updateStatus = 4;
        }

        // 车间的领补退
        if (in_array($obj->type, [1, 2, 7]) && $obj->push_type == 2) {
            $status = $obj->status; // 实发->2; 实收->3
            $updateStatus = $status + 1;    // 实发更新状态为3，实收状态改为4
        }

        $obj_list = DB::table($this->table . ' as rmr')
            ->leftJoin($this->itemTable . ' as rmri', 'rmri.material_requisition_id', '=', 'rmr.id')
            ->leftJoin(config('alias.rmrib') . ' as rmrib', 'rmrib.item_id', '=', 'rmri.id')
            ->leftJoin(config('alias.rwo') . ' as rwo', 'rwo.id', '=', 'rmr.work_order_id')
            ->select([
                'rmr.id as mr_id',
                'rmr.status',
                'rmr.factory_id',
                'rmr.line_depot_id',
                'rmr.send_depot',
                'rmr.work_order_id',
                'rmr.product_order_code',
                'rmr.sale_order_code',
                'rmr.type',
                'rmri.id as item_id',
                'rmri.material_id',
                'rmri.is_special_stock',
                'rmri.demand_unit_id as bom_unit_id',
                'rmri.depot_id as depot_id',
//                'rmri.actual_receive_qty as qty',
                'rmrib.id as rmrib_id',
                'rmrib.batch',
                'rmrib.actual_send_qty as send_qty',    //车间领补退 发料的时候使用这个字段
                'rmrib.actual_receive_qty as qty',
                'rmrib.inve_id',
                'rmrib.bom_unit_id as batch_bom_unit_id',
                'rwo.number as work_order_code',
            ])
            ->where([
                ['rmr.id', '=', $input[$this->apiPrimaryKey]],
                ['rmr.status', '=', $status],
                ['rmr.is_delete', '=', 0],
            ])
            ->get();
        if (empty(obj2array($obj_list))) {
            TEA('2424');
        }

        /**
         * @todo 销售订单号没获取
         */

        /**
         * 根据type判断 入库还是出库
         * type=2 车间退料 为出库
         * type=7 车间补料 为入库
         * type=1 & push_type=0 生产领料 出库
         */
        //车间向WMS领料
        $storageArr = [
            'id' => 14,
            'io' => '1'
        ];
        //车间向WMS退料
        if ($obj->type == 2) {
            $storageArr = [
                'id' => 36,
                'io' => '-1'
            ];
        }
        if ($obj->type == 7) {    //车间向WMS补料
            $storageArr = [
                'id' => 19,
                'io' => '1'
            ];
        }

        // 报工生成的 mes领补退
        if ($obj->push_type == 0) {
            if ($obj->type == 1) {    //领料
                $storageArr = [
                    'id' => 34,
                    'io' => '-1'
                ];
            }
            if ($obj->type == 2) {    //退料
                $storageArr = [
                    'id' => 18,
                    'io' => '1'
                ];
            }
            if ($obj->type == 7) {    //补料
                $storageArr = [
                    'id' => 33,
                    'io' => '-1'
                ];
            }
        }

        // 车间的 领补退
        if ($obj->push_type == 2) {
            if ($obj->type == 1) {    //领料
                //实发
                $storageArr = [
                    'id' => 39,
                    'io' => '-1',
                    'depot_field_name' => 'depot_id'
                ];
                //实收
                if ($obj->status == 3) {    //需求地点入库
                    $storageArr = [
                        'id' => 51,
                        'io' => '1',
                        'depot_field_name' => 'line_depot_id'
                    ];
                }
            }
            if ($obj->type == 2) {    //退料
                $storageArr = [
                    'id' => 41,
                    'io' => '-1',
                    'depot_field_name' => 'line_depot_id',    //领补的需求地点出库
                ];
                if ($obj->status == 3) {    //领补的发料地点入库
                    $storageArr = [
                        'id' => 53,
                        'io' => '1',
                        'depot_field_name' => 'depot_id'
                    ];
                }
            }
            if ($obj->type == 7) {    //补料
                $storageArr = [     //发料地点出库
                    'id' => 40,
                    'io' => '-1',
                    'depot_field_name' => 'depot_id'
                ];
                if ($obj->status == 3) {    //需求地点入库
                    $storageArr = [
                        'id' => 52,
                        'io' => '1',
                        'depot_field_name' => 'line_depot_id'
                    ];
                }
            }
        }

        $StorageItem = new StorageItem();
        foreach ($obj_list as $key => $value) {

            /**
             * 如果满足一下三种条件，则入库的时候作为通用库存，
             * 即PO、WO、SO均为空
             * 1.是否为最后一次报工
             * 2.不是特殊库存
             * 3.为退料
             */
            $is_usual_storage = $value->is_special_stock != 'E' && $is_last_produce_work && $obj->type == 2 ? 1 : 0;
            $temp['plant_id'] = $value->factory_id;
            $temp['po_number'] = $is_usual_storage ? '' : $value->product_order_code;
            $temp['wo_number'] = $is_usual_storage ? '' : $value->work_order_code;
            $temp['sale_order_code'] = $is_usual_storage ? '' : $value->sale_order_code;
            /**
             * 如果 push_type -> 0 mes领料，地点为 depot_id
             * 如果 push_type -> 1 SAP领料，地点为 line_depot_id
             * 如果 push_type -> 2 车间领料，地点取 $storageArr['depot_field_name']
             */
            $temp['depot_id'] = $obj->push_type == 1 ?
                $value->line_depot_id : ($obj->push_type == 2 ? $value->{$storageArr['depot_field_name']} : $value->depot_id);    //如果是想mes领补退，则取rmri.depot_id
            $temp['send_depot'] = $obj->push_type == 1 ? $value->send_depot : '';
            $temp['material_id'] = $value->material_id;
            $temp['unit_id'] = $value->batch_bom_unit_id;
            $temp['quantity'] = ($obj->status == 2 && $obj->push_type == 2) || ($obj->push_type == 1 && $obj->type == 2) ?
                $value->send_qty : $value->qty;   //如果为车间领补退(实发)以及SAP退料 使用send_qty，其他都是qty
            $temp['lot'] = $value->batch;
            $storageArr['io'] == '-1' && $temp['inve_id'] = $value->inve_id;    //出库的时候才会有inve_id
            $arr = $StorageItem->merge_data($temp, $storageArr['id'], $storageArr['io'], 1);
            $StorageItem->save($arr);
            $storage_item_id = $StorageItem->pk;
            $StorageItem->passageway($storage_item_id);

            DB::table(config('alias.rmrib'))->where('id', $value->rmrib_id)->update(['storage_item_id' => $storage_item_id]);
            //入库的时候更新inve_id
            if ($storageArr['io'] == '1') {
                $storage_item_obj = DB::table(config('alias.rsit'))->select('inve_id')->where('id', $storage_item_id)->first();
                if (!empty($storage_item_obj->inve_id)) {
                    DB::table(config('alias.rmrib'))->where('id', $value->rmrib_id)->update(['inve_id' => $storage_item_obj->inve_id]);
                }
            }
        }
        // 更新状态
        DB::table($this->table)->where('id', $input[$this->apiPrimaryKey])->update(['status' => $updateStatus]);
    }

    /**
     * 领料单 反审
     *
     * @param $input
     * @throws \App\Exceptions\ApiException
     */
    public function unAuditing($input)
    {
        if (empty($input[$this->apiPrimaryKey])) TEA('700', $this->apiPrimaryKey);
        //验证所属工单是否被锁定
        $this->checkWorkOrderLockByMRID($input[$this->apiPrimaryKey]);
        //只有mes领补退，却状态为4
        $obj = DB::table($this->table . ' as rmr')
            ->leftJoin(config('alias.rwdo') . ' as rwdo', 'rwdo.id', '=', 'rmr.declare_id')
            ->select(['rmr.id', 'rmr.status', 'rwdo.status as rwdo_status'])
            ->where([
                ['rmr.id', '=', $input[$this->apiPrimaryKey]],
                ['rmr.status', '=', 4],
                ['rmr.is_delete', '=', 0],
                ['rmr.push_type', '=', 0],
            ])
            ->first();
        //如果id不存在 或者 rwdo状态不为1，则不允许反审
        if (!isset($obj->id) || (isset($obj->rwdo_status) && $obj->rwdo_status > 1)) {
            TEA('2425');
        }

        $obj_list = DB::table($this->table . ' as rmr')
            ->leftJoin(config('alias.rmrib') . ' as rmrib', 'rmrib.material_requisition_id', '=', 'rmr.id')
            ->select([
                'rmr.id as mr_id',
                'rmrib.id as rmrib_id',
                'rmrib.storage_item_id',
            ])
            ->where([
                ['rmr.id', '=', $input[$this->apiPrimaryKey]],
                ['rmr.status', '=', 4],
                ['rmr.is_delete', '=', 0],
                ['rmr.push_type', '=', 0]
            ])
            ->get();
        if (empty(obj2array($obj_list))) {
            TEA('2424');
        }

        /**
         * 调用 李明 的方法 进行反审操作
         */
        $StorageItem = new StorageItem();
        try {
            DB::connection()->beginTransaction();
            foreach ($obj_list as $value) {
                $StorageItem->del($value->storage_item_id);
                DB::table(config('alias.rmrib'))->where('id', $value->rmrib_id)->update(['storage_item_id' => 0]);
            }
            // 更新状态
            DB::table($this->table)->where('id', $input[$this->apiPrimaryKey])->update(['status' => 5]);
        } catch (\Exception $e) {
            DB::connection()->rollBack();
            TEA($e->getCode());
        }
        DB::connection()->commit();
    }

    /**
     * 车间领补退 确认发料、更新实收数量 统一接口
     *
     * @param $input
     * @throws \App\Exceptions\ApiException
     */
    public function workShopConfirmAndUpdate($input)
    {
        if (empty($input[$this->apiPrimaryKey])) TEA('700', $this->apiPrimaryKey);
        //验证所属工单是否被锁定
        $this->checkWorkOrderLockByMRID($input[$this->apiPrimaryKey]);
        if (empty($input['status']) || !in_array($input['status'], [2, 3])) TEA('700', 'status');
        if (empty($input['type']) || !in_array($input['type'], [1, 2, 7])) TEA('700', 'type');
        $obj = DB::table($this->table)
            ->select('id')
            ->where([
                ['type', '=', $input['type']],
                ['push_type', '=', 2],
                ['is_delete', '=', 0],
                ['status', '=', $input['status']],
                ['id', '=', $input[$this->apiPrimaryKey]]
            ])
            ->first();
        if (!isset($obj->id)) {
            TEA('2423');
        }

        // 如果是 补退料单，需要修改实收数量
        if (in_array($input['type'], [1, 2, 7]) && $input['status'] == 3) {
            if (empty($input['batches'])) TEA('700', 'batches');
            foreach ($input['batches'] as $batch) {
                if (empty($batch['batch_id'])) TEA('700', 'batch_id');

                if (empty($batch['actual_receive_qty'])) TEA('700', 'actual_receive_qty');
                //验证子项是否存在
                $is_exist = $this->isExisted([
                    ['id', '=', $batch['batch_id']],
                    ['material_requisition_id', '=', $obj->id]
                ], config('alias.rmrib'));
                if (!$is_exist) TEA('2422');

                //更新实收数量
                DB::table(config('alias.rmrib'))
                    ->where([
                        ['id', '=', $batch['batch_id']],
                        ['material_requisition_id', '=', $obj->id]
                    ])
                    ->update([
                        'actual_receive_qty' => $batch['actual_receive_qty']
                    ]);
            }
        }
//        DB::table($this->table)->where([['id', '=', $input[$this->apiPrimaryKey]]])->update(['status' => $input['status'] + 1]);
    }
//endregion


//region 查

    /**
     * @param $input
     * @return mixed
     */
    public function lists(&$input)
    {
        $where = [];
        $where[] = ['rmr.is_delete', '=', 0];
        $where[] = ['rwo.is_delete', '=', 0];
        $where[] = ['rwo.on_off', '=', 1];
        if (!empty($input['code'])) $where[] = ['rmr.code', 'like', '%' . $input['code'] . '%'];
        if (!empty($input['type']) && is_numeric($input['type'])) $where[] = ['rmr.type', '=', $input['type']];
        if (!empty($input['status']) && in_array($input['status'], [1, 2, 3, 4])) $where[] = ['rmr.status', '=', $input['status']];
        if (isset($input['push_type']) && in_array($input['push_type'], [0, 1, 2])) $where[] = ['rmr.push_type', '=', $input['push_type']];
        if (!empty($input['work_order_code'])) $where[] = ['rwo.number', 'like', '%' . $input['work_order_code'] . '%'];
        if (!empty($input['product_order_code'])) $where[] = ['rmr.product_order_code', 'like', '%' . $input['product_order_code'] . '%'];

        //按员工档案那配置的生产单元，按厂对po进行划分
        $admin_id = session('administrator')->admin_id;
        $admin_is_super = session('administrator')->superman;
        $where2 = [['re.admin_id', '=', $admin_id]];
        $emploee_info = DB::table(config('alias.re') . ' as re')
            ->select('re.id', 're.factory_id', 're.workshop_id')
            ->where($where2)
            ->first();
        if (!empty($emploee_info)) {
            if ($admin_is_super != 1) {
                if ($emploee_info->factory_id != 0 && $emploee_info->workshop_id == 0) {
                    $where[] = ['rwo.factory_id', '=', $emploee_info->factory_id];//区分到厂
                } elseif ($emploee_info->factory_id != 0 && $emploee_info->workshop_id != 0) {
                    $where[] = ['rwo.work_shop_id', '=', $emploee_info->workshop_id];//区分到车间
                }
            }
        }

        $builder = DB::table($this->table . ' as rmr')
            ->leftJoin(config('alias.rf') . ' as rf', 'rf.id', '=', 'rmr.factory_id')
            ->leftJoin(config('alias.rwb') . ' as rwb', 'rwb.id', '=', 'rmr.workbench_id')
            ->leftJoin(config('alias.rwo') . ' as rwo', 'rwo.id', '=', 'rmr.work_order_id')
            ->leftJoin(config('alias.re') . ' as re', 're.id', '=', 'rmr.employee_id')
            ->leftJoin(config('alias.rsd') . ' as rsd', 'rsd.id', '=', 'rmr.line_depot_id')
            ->leftJoin(config('alias.rsd') . ' as rsd_s', 'rsd_s.id', '=', 'rmr.send_depot')
            ->select([
                'rmr.id as ' . $this->apiPrimaryKey,
                'rmr.code as code',
                'rmr.time',
                'rmr.ctime',
                'rmr.from',
                'rmr.type',
                'rmr.push_type',
                'rmr.status',
                'rmr.product_order_code',
                'rmr.sale_order_code',
                're.name as employee_name',
                'rf.name as factory_name',
                'rf.code as factory_code',
                'rwb.code as workbench_code',
                'rwb.name as workbench_name',
                'rwo.number as work_order_code',
                'rsd.code as line_depot_code',
                'rsd.name as line_depot_name',
                'rsd.id as line_depot_id',
                'rsd_s.code as send_depot_code',
                'rsd_s.name as send_depot_name',
                'rsd_s.id as send_depot_id',
            ])
            ->where($where);
        $input['total_records'] = $builder->count();
        $builder->forPage($input['page_no'], $input['page_size']);
        $input['sort'] = empty($input['sort']) ? 'id' : $input['sort'];
        $input['order'] = empty($input['order']) ? 'DESC' : $input['order'];
        $builder->orderBy('rmr.' . $input['sort'], $input['order']);
        $obj_list = $builder->get();
        foreach ($obj_list as $k => &$v) {
            $v->ctime = date('Y-m-d H:i:s', $v->ctime);
            if ($v->push_type != 2) {
                $v->send_depot_code = '';
                $v->send_depot_name = '';
            }
        }
        return $obj_list;
    }

    /**
     * 详情
     *
     * @param $input
     * @return array
     * @throws \App\Exceptions\ApiException
     */
    public function show($input)
    {
        if (empty($input[$this->apiPrimaryKey])) TEA('700', $this->apiPrimaryKey);
        $objs = DB::table($this->table . ' as rmr')
            ->leftJoin(config('alias.rmri') . ' as rmri', 'rmri.material_requisition_id', '=', 'rmr.id')
            ->leftJoin(config('alias.rf') . ' as rf', 'rf.id', '=', 'rmr.factory_id')
            ->leftJoin(config('alias.rwb') . ' as rwb', 'rwb.id', '=', 'rmr.workbench_id')
            ->leftJoin(config('alias.rwo') . ' as rwo', 'rwo.id', '=', 'rmr.work_order_id')
            ->leftJoin(config('alias.re') . ' as re', 're.id', '=', 'rmr.employee_id')
            ->leftJoin(config('alias.rsd') . ' as rsd', 'rsd.id', '=', 'rmr.line_depot_id')
            ->leftJoin(config('alias.rm') . ' as rm', 'rm.id', '=', 'rmri.material_id')
            ->leftJoin(config('alias.ruu') . ' as ruu_d', 'ruu_d.id', '=', 'rmri.demand_unit_id')
            ->leftJoin(config('alias.rsd') . ' as rsd_i', 'rsd_i.id', '=', 'rmri.depot_id')
            ->select([
                'rmr.id as id',
                'rmr.code as code',
                'rmr.type',
                'rmr.push_type',
                'rmr.ctime',
                'rmr.mtime',
                'rmr.time',
                'rmr.from',
                'rmr.status',
                'rmr.sale_order_code',
                'rmr.sale_order_project_code',
                'rmr.product_order_id',
                'rmr.product_order_code',
                'rmr.send_depot',
                're.id as employee_id',
                're.name as employee_name',
                'rf.id as factory_id',
                'rf.name as factory_name',
                'rf.code as factory_code',
                'rwb.id as workbench_id',
                'rwb.code as workbench_code',
                'rwb.name as workbench_name',
                'rwo.number as work_order_code',
                'rsd.id as line_depot_id',
                'rsd.code as line_depot_code',
                'rsd.name as line_depot_name',
                'rm.id as material_id',
                'rm.item_no as material_code',
                'rm.name as material_name',
                'rmri.id as item_id',
                'rmri.line_project_code',
                'rmri.demand_qty',
                'ruu_d.commercial as demand_unit',
//                'rmri.actual_send_qty',
//                'rmri.actual_send_unit',
//                'rmri.actual_receive_qty',
//                'rmri.wait_send_qty',
//                'rmri.over_send_qty',
                'rmri.is_special_stock',
                'rsd_i.id as depot_id',
                'rsd_i.code as depot_code',
                'rsd_i.name as depot_name',
            ])
            ->where([
                ['rmr.id', '=', $input[$this->apiPrimaryKey]],
                ['rmr.is_delete', '=', 0],
                ['rwo.is_delete', '=', 0],
                ['rwo.on_off', '=', 1],
            ])
            ->get();
        if (empty($objs) || empty(obj2array($objs))) TEA('2421');

        /**
         * 获取批次表
         */
        $batch_objs = DB::table(config('alias.rmrib') . ' as rmrib')
            ->leftJoin(config('alias.ruu') . ' as ruu', 'ruu.id', '=', 'rmrib.bom_unit_id')
            ->select([
                'rmrib.id as batch_id',
                'rmrib.material_requisition_id',
                'rmrib.item_id',
                'rmrib.order',
                'rmrib.batch',
                'rmrib.actual_send_qty',
                'rmrib.base_unit',
                'rmrib.actual_receive_qty',
                'rmrib.bom_unit_id',
                'ruu.commercial as bom_unit',
            ])
            ->where('rmrib.material_requisition_id', '=', $input[$this->apiPrimaryKey])
            ->get();
        $batchArr = [];
        foreach ($batch_objs as $batch) {
            if (isset($batch->item_id)) {
                $batchArr[$batch->item_id][] = $batch;
            }
        }

        $data = [];
        foreach ($objs as $key => $value) {
            if (empty($data)) {
                $data['id'] = $value->id;
                $data['code'] = $value->code;
                $data['type'] = $value->type;
                $data['line_depot_id'] = $value->line_depot_id;
                $data['line_depot_name'] = $value->line_depot_name;
                $data['send_depot'] = $value->send_depot;
                $data['work_order_code'] = $value->work_order_code;
                $data['workbench_code'] = $value->workbench_code;
                $data['workbench_name'] = $value->workbench_name;
                $data['ctime'] = date('Y-m-d H:i:s', $value->ctime);
                $data['time'] = date('Y-m-d H:i:s', $value->time);
                $data['employee_name'] = $value->employee_name;
                $data['factory_name'] = $value->factory_name;
                $data['factory_code'] = $value->factory_code;
                $data['factory_id'] = $value->factory_id;
                $data['status'] = $value->status;
                $data['push_type'] = $value->push_type;
                $data['sales_order_code'] = $value->sale_order_code;
                $data['sales_order_project_code'] = $value->sale_order_project_code;
                $data['product_order_id'] = $value->product_order_id;
                $data['product_order_code'] = $value->product_order_code;
            }
            if (!empty($value->item_id)) {
                $temp = [
                    'item_id' => $value->item_id,
                    'line_project_code' => $value->line_project_code,
                    'material_id' => $value->material_id,
                    'material_code' => $value->material_code,
                    'material_name' => $value->material_name,
                    'demand_qty' => $value->demand_qty,
                    'demand_unit' => $value->demand_unit,
//                    'actual_send_qty' => $value->actual_send_qty,
//                    'actual_receive_qty' => $value->actual_receive_qty,
//                    'wait_send_qty' => $value->wait_send_qty,
//                    'over_send_qty' => $value->over_send_qty,
                    'depot_id' => get_value_or_default($value, 'depot_id', 0),
                    'depot_name' => get_value_or_default($value, 'depot_name', ''),
                    'depot_code' => get_value_or_default($value, 'depot_code', ''),
                    'special_stock' => $value->is_special_stock,
                    'batches' => isset($batchArr[$value->item_id]) ? $batchArr[$value->item_id] : []
                ];
                $data['materials'][] = $temp;
            }
        }
        return $data;
    }


    /**
     * 获取领料单数据（推送给SAP）
     *
     * @param int $id 领料单ID
     * @return array
     * @throws \App\Exceptions\ApiException
     * @author lester.you
     * @since 2018-10-12 添加发出线边库 send_depot_code
     */
    public function getMaterialRequisition($id)
    {
        $objs = DB::table($this->table . ' as rmr')
            ->leftJoin(config('alias.rmri') . ' as rmri', 'rmri.material_requisition_id', '=', 'rmr.id')
            ->leftJoin(config('alias.rf') . ' as rf', 'rf.id', '=', 'rmr.factory_id')
            ->leftJoin(config('alias.rwb') . ' as rwb', 'rwb.id', '=', 'rmr.workbench_id')
            ->leftJoin(config('alias.rwo') . ' as rwo', 'rwo.id', '=', 'rmr.work_order_id')
            ->leftJoin(config('alias.re') . ' as re', 're.id', '=', 'rmr.employee_id')
            ->leftJoin(config('alias.rsd') . ' as rsd', 'rsd.id', '=', 'rmr.line_depot_id')
//            ->leftJoin(config('alias.rsd') . ' as rsd2', 'rsd2.id', '=', 'rmr.send_depot_id')
            ->leftJoin(config('alias.rm') . ' as rm', 'rm.id', '=', 'rmri.material_id')
            ->leftJoin(config('alias.ruu') . ' as ruu_d', 'ruu_d.id', '=', 'rmri.demand_unit_id')
            ->select([
                'rmr.code as mr_code',
                'rmr.time',
                'rmr.from',
                'rmr.type',
                'rmr.sale_order_code',  // 销售订单号
                'rmr.sale_order_project_code', //销售订单项目号
                'rmr.send_depot',
                'rmri.line_project_code',
                're.name as employee_name',
                'rf.name as factory_name',
                'rf.code as factory_code',
                'rwb.code as workbench_code',
                'rwo.number as work_order_code',
                'rsd.code as line_depot_code',
//                'rsd2.code as send_depot_code',
                'rmri.line_project_code',
                'rmri.material_id',
                'rm.item_no as material_code',
                'rm.name as material_name',
                'rmri.demand_qty',
                'ruu_d.id as bom_unit_id',
                'ruu_d.commercial as demand_unit', // bom单位
//                'rmri.actual_send_qty',
//                'rmri.actual_send_unit',
//                'rmri.actual_receive_qty',
                'rmri.wait_send_qty',
                'rmri.over_send_qty',
                'rmri.is_special_stock',

            ])
            ->where([
                ['rmr.id', '=', $id],
                ['rmr.status', '=', 1],
                ['rmr.is_delete', '=', 0],
                ['rmr.push_type', '=', 1]
            ])
            ->get();
        if (empty(obj2array($objs))) {
            TEA('2432');    // 不允许推送或已推送
        }
        $sendData = [];
        foreach ($objs as $key => $value) {

            // bom单位转为基本单位
            $baseUnitArr = $this->bomUnitToBaseUnit($value->material_id, $value->bom_unit_id, $value->demand_qty);
            $temp = [
                'LLDH' => $value->mr_code,
                'LLHH' => $value->line_project_code,
                'LLLX' => $this->intToType($value->type),
                'LLRQ' => date('Ymd', $value->time),
                'LLSJ' => date('His', $value->time),
                'LLR' => $value->employee_name,
                'WERKS' => $value->factory_code,
                'XNBK' => $value->line_depot_code,     //需求线边库
//                'GOGNW' => $value->workbench_code,
                'GONGW' => empty($value->workbench_code) ? '' : $value->workbench_code,
                'GONGD' => $value->work_order_code,
                'FCKCDD' => $value->send_depot,     //发出库存地点
                'AUFNR' => '',      //订单号（非PO）
                'KDAUF' => $value->is_special_stock == 'E' ? $value->sale_order_code : '',  //销售订单（非mes销售订单）
                'KDPOS' => $value->is_special_stock == 'E' ? $value->sale_order_project_code : '',    //销售订单项目
                'MATNR' => $value->material_code,
                'MAKTX' => $value->material_name,
//                'LIFNR' => '',    //供应商或债权人的账号
//                'NAME1' => '',    //供应商描述
//                'XQSL' => $value->demand_qty,
                'XQSL' => $baseUnitArr['base_qty'],
                'XQSLDW' => empty($baseUnitArr['base_unit']) ? '' : strtoupper($baseUnitArr['base_unit']),
//                'SFHSL' => '',      //实发数量
//                'SFHSLDW' => '',    //实发数量单位
//                'SSSL' => '',       //实收数量
//                'DFSL' => '',       //待发数量
//                'CFSL' => '',       //超发数量
//                'FLZT' => 1,        //发料状态
//                'BUDAT' => '',    //凭证中的过账日期
//                'BZ' => '',
                'XTLY' => 1,  //系统来源
//                'SOBKZ' => $value->is_special_stock,  //特殊库存
            ];
            $sendData[] = $temp;
        }
        if (empty($sendData)) {
            TEA('2421');
        }
        return $sendData;
    }

    /**
     * 获取退料单数据（推送给SAP）
     * @param $id
     * @return array
     * @throws \App\Exceptions\ApiException
     */
    public function getReturnMaterial($id)
    {
        $objs = DB::table($this->table . ' as rmr')
            ->leftJoin(config('alias.rmri') . ' as rmri', 'rmri.material_requisition_id', '=', 'rmr.id')
            ->leftJoin(config('alias.rmrib') . ' as rmrib', 'rmrib.item_id', '=', 'rmri.id')
            ->leftJoin(config('alias.rf') . ' as rf', 'rf.id', '=', 'rmr.factory_id')
            ->leftJoin(config('alias.rwb') . ' as rwb', 'rwb.id', '=', 'rmr.workbench_id')
            ->leftJoin(config('alias.rwo') . ' as rwo', 'rwo.id', '=', 'rmr.work_order_id')
            ->leftJoin(config('alias.re') . ' as re', 're.id', '=', 'rmr.employee_id')
            ->leftJoin(config('alias.rsd') . ' as rsd', 'rsd.id', '=', 'rmr.line_depot_id')
//            ->leftJoin(config('alias.rsd') . ' as rsd2', 'rsd2.id', '=', 'rmr.send_depot_id')
            ->leftJoin(config('alias.rm') . ' as rm', 'rm.id', '=', 'rmri.material_id')
            ->leftJoin(config('alias.ruu') . ' as ruu_d', 'ruu_d.id', '=', 'rmrib.bom_unit_id')
            ->select([
                'rmr.code as mr_code',
                'rmr.time',
                'rmr.from',
                'rmr.type',
                'rmr.sale_order_code',  // 销售订单号
                'rmr.sale_order_project_code', //销售订单项目号
                'rmr.send_depot', //发出库存地点
                'rmri.line_project_code',
                're.name as employee_name',
                'rf.name as factory_name',
                'rf.code as factory_code',
                'rwb.code as workbench_code',
                'rwo.number as work_order_code',
                'rsd.code as line_depot_code',
                'rmri.line_project_code',
                'rm.item_no as material_code',
                'rm.name as material_name',
                'rm.id as material_id',
                'rmri.demand_qty',
                'ruu_d.commercial as base_unit',
                'rmri.wait_send_qty',
                'rmri.over_send_qty',
                'rmri.is_special_stock',
                'rmrib.order',
                'rmrib.batch',
                'rmrib.actual_send_qty as return_number',
//                'rmrib.base_unit',
                'rmrib.bom_unit_id',

            ])
            ->where([
                ['rmr.id', '=', $id],
//                ['rmr.status', '=', 2],
                ['rmr.status', '=', 1],     // 11.23 修改： 生成退料单 后就推送 状态：1->2
                ['rmr.push_type', '=', 1],
                ['rmr.is_delete', '=', 0],
                ['rmr.type', '=', 2],
            ])
            ->get();
        if (empty(obj2array($objs))) {
            TEA('2432');    // 不允许推送或已推送
        }
        $sendData = [];
        foreach ($objs as $key => $value) {
            $baseUnitArr = $this->bomUnitToBaseUnit($value->material_id, $value->bom_unit_id, $value->return_number);
            $temp = [
                'LLDH' => $value->mr_code,
                'LLHH' => str_pad($value->line_project_code, 5, '0', STR_PAD_LEFT) . str_pad($value->order, 5, '0', STR_PAD_LEFT),
                'LLLX' => $this->intToType($value->type),
                'LLRQ' => date('Ymd', $value->time),
                'LLSJ' => date('His', $value->time),
                'LLR' => $value->employee_name,
                'WERKS' => $value->factory_code,
                'XNBK' => $value->line_depot_code,     //需求线边库
                'GONGW' => '',
                'GONGD' => $value->work_order_code,
                'FCKCDD' => $value->send_depot,     //发出库存地点
                'AUFNR' => '',      //订单号（非PO）
                'KDAUF' => $value->is_special_stock == 'E' ? $value->sale_order_code : '',  //销售订单（非mes销售订单）
                'KDPOS' => $value->is_special_stock == 'E' ? $value->sale_order_project_code : '',    //销售订单项目
                'MATNR' => $value->material_code,
                'MAKTX' => $value->material_name,
//                'XQSL' => $value->return_number,
                'XQSL' => $baseUnitArr['base_qty'],
                'XQSLDW' => empty($baseUnitArr['base_unit']) ? '' : strtoupper($baseUnitArr['base_unit']),
                'XTLY' => 1,  //系统来源
                'BATCH' => $value->batch
            ];
            $sendData[] = $temp;
        }
        if (empty($sendData)) {
            TEA('2421');
        }
        return $sendData;
    }

    /**
     * 获取实时库存
     *
     * @param $input
     * @return mixed
     * @throws \App\Exceptions\ApiException
     * @author lester.you
     * @since 2018-10-14 lester.you 返回值添加批次
     */
    public function getMaterialStorage($input)
    {
        if (empty($input['material_ids'])) TEA('700', 'material_ids');
        $material_ids_arr = array_unique(explode(',', $input['material_ids']));

        /**
         * 1.查询所有的仓库(默认)
         * 2.查询当前仓库
         * 3.查询非当前仓库
         * 注：1,2 需要传入当前仓库字段 line_depot_id
         */
        if (!isset($input['type'])) $input['type'] = 1;
        if (in_array($input['type'], [2, 3])) {
            if (empty($input['line_depot_id'])) TEA('700', 'line_depot_id');
        }

        // 验证 物料id是否存在
        $material_count = DB::table(config('alias.rm'))
            ->whereIn('id', $material_ids_arr)
            ->count();
        if ($material_count != count($material_ids_arr)) TEA('700', 'material_ids');

        //验证 工单
        if (empty($input['work_order_id'])) TEA('700', 'work_order_id');
        $wo_obj = DB::table(config('alias.rwo'))
            ->select(['id', 'number as work_order_code'])
            ->where('id', $input['work_order_id'])
            ->first();
        if (empty($wo_obj)) TEA('700', 'work_order_id');
        $input['work_order_code'] = $wo_obj->work_order_code;

        //如果销售订单为空，查询的时候也要带上条件，值为空字符串
        $input['sale_order_code'] = empty($input['sale_order_code']) ? '' : $input['sale_order_code'];

        $builder = DB::table(config('alias.rsi') . ' as rsi')
            ->leftJoin(config('alias.rsd') . ' as rsd', 'rsd.id', '=', 'rsi.depot_id')
            ->leftJoin(config('alias.rf') . ' as rf', 'rf.id', '=', 'rsi.plant_id')
            ->leftJoin(config('alias.ruu') . ' as ruu', 'ruu.id', '=', 'rsi.unit_id')
            ->select([
                'rsi.id as inve_id',
                'rsi.material_id',
                'rsi.lot as batch',
                'rsi.depot_id',
                'rsi.unit_id',
                'ruu.commercial as unit_name',
                'rsd.code as depot_code',
                'rsd.name as depot_name',
                'rf.code as factory_code',
                'rf.name as factory_name',
            ])
            ->addSelect(DB::raw('SUM(rsi.storage_validate_quantity) as storage_number'))
            ->where(function ($query) use ($input) {
                $query->where([
                    ['rsi.po_number', '=', $input['product_order_code']],
                    ['rsi.wo_number', '=', $input['work_order_code']]
                ])
                    ->orWhere([
                        ['rsi.po_number', '=', ''],
                        ['rsi.wo_number', '=', '']
                    ]);
            })
            ->where([['rsi.sale_order_code', '=', $input['sale_order_code']]])
            ->whereIn('rsi.material_id', $material_ids_arr)
            ->groupBy('rsi.material_id', 'rsi.lot', 'rsi.depot_id');
        if ($input['type'] == 2) {  //查询当前仓库
            $builder->where([['rsi.depot_id', '=', $input['line_depot_id']]]);
        }
        if ($input['type'] == 3) {  //查询非当前仓库
            $builder->where([['rsi.depot_id', '<>', $input['line_depot_id']]]);
        }
        $obj_lists = $builder->get();
        $tempArr = [];
        foreach ($obj_lists as $obj) {
            //只有实时库存大于0，才会收集
            if ($obj->storage_number > 0) {
                $tempArr[$obj->material_id][] = $obj;
            }
        }

        // 查询物料分類是否屬於線邊庫管理
        $materialObjList = DB::table(config('alias.rm') . ' as rm')
            ->leftJoin(config('alias.rmc') . ' as rmc', 'rmc.id', '=', 'rm.material_category_id')
            ->select(['rm.id', 'rmc.warehouse_management'])
            ->whereIn('rm.id', $material_ids_arr)
            ->get();
        $lzArr = [];
        foreach ($materialObjList as $material) {
            $lzArr[$material->id]['is_lzp'] = $material->warehouse_management == 1 ? 1 : 0;
        }

        // 判断当前工单是否已经领过定额订单
        $mr_obj = DB::table($this->table)
            ->select(['id', 'code'])
            ->where([
                ['work_order_id', '=', $input['work_order_id']],
                ['type', '=', 1],
                ['push_type', '=', 0],
                ['is_delete', '=', 0]
            ])
            ->first();
        $is_rated = 0;
        $mr_code = '';
        if (!empty($mr_obj)) {
            $is_rated = 1;
            $mr_code = $mr_obj->code;
        }

        return ['materials' => $tempArr, 'lzps' => $lzArr, 'is_rated_picking' => $is_rated, 'mr_code' => $mr_code];
    }

    /**
     * 根据 工单code 获取物料和相应批次
     *
     * @param array $input
     * @return array
     * @throws \App\Exceptions\ApiException
     */
    public function getMaterialBatch($input)
    {
        if (empty($input['work_order_code'])) TEA('700', 'work_order_code');
        /**
         * 查询额定领料单
         * 一遍情况下，只会有一张额定领料单
         */
        $obj_list = DB::table($this->itemTable . ' as rmri')
            ->leftJoin($this->table . ' as rmr', 'rmr.id', '=', 'rmri.material_requisition_id')
            ->leftJoin(config('alias.rwo') . ' as rwo', 'rwo.id', '=', 'rmr.work_order_id')
            ->leftJoin(config('alias.rmrib') . ' as rmrib', 'rmrib.item_id', '=', 'rmri.id')
            ->leftJoin(config('alias.ruu') . ' as ruu', 'ruu.id', '=', 'rmri.demand_unit_id')
            ->select([
                'rmri.material_id',
                'rmri.material_code',
                'ruu.commercial as unit',
                'rmrib.batch',
            ])
            ->addSelect(DB::raw('SUM(rmrib.actual_send_qty) as sum_qty'))
            ->where([
                ['rwo.number', '=', $input['work_order_code']],
                ['rmr.type', '=', 1],
                ['rmr.push_type', '=', 0],
                ['rmr.is_delete', '=', 0],
            ])
            ->groupBy('rmri.material_code', 'rmrib.batch')
            ->get();
        $temp = [];
        foreach ($obj_list as $obj) {
            is_null($obj->batch) && $obj->batch = '';
            $temp[$obj->material_code . $obj->batch] = [
                'material_id' => $obj->material_id,
                'material_code' => $obj->material_code,
                'qty' => $obj->sum_qty,
                'batch' => $obj->batch,
                'is_rated' => 1
            ];
        }

//        $obj_list2 = DB::table($this->itemTable . ' as rmri')
//            ->leftJoin($this->table . ' as rmr', 'rmr.id', '=', 'rmri.material_requisition_id')
//            ->leftJoin(config('alias.rwo') . ' as rwo', 'rwo.id', '=', 'rmr.work_order_id')
//            ->leftJoin(config('alias.rmrib') . ' as rmrib', 'rmrib.item_id', '=', 'rmri.id')
//            ->select([
//                'rmri.material_id',
//                'rmri.material_code',
//                'rmrib.batch',
//            ])
//            ->where([
//                ['rwo.number', '=', $input['work_order_code']],
//                ['rmr.type', '=', 1],
//                ['rmr.push_type', '=', 1]
//            ])
//            ->distinct()
//            ->get();
//        foreach ($obj_list2 as $obj) {
//            is_null($obj->batch) && $obj->batch = '';
//            if (!isset($temp[$obj->material_code . $obj->batch])) {
//                $temp[$obj->material_code . $obj->batch] = [
//                    'material_id' => $obj->material_id,
//                    'material_code' => $obj->material_code,
//                    'batch' => $obj->batch,
//                    'qty' => 0,
//                    'is_rated' => 0
//                ];
//            }
//        }
        return array_values($temp);
    }

    /**
     * 获取 用于生成退料单的数据（废弃）
     *
     * 批次+库存 --> 物料数组 --> items
     *
     * @param $input
     * @return array
     * @throws \App\Exceptions\ApiException
     */
    public function getCreateReturnMaterial($input)
    {
        // 1.获取PO，线边库，
        $mr_obj = DB::table($this->table . ' as rmr')
            ->leftJoin(config('alias.rsd') . ' as rsd', 'rsd.id', '=', 'rmr.line_depot_id')
            ->leftJoin(config('alias.rwo') . ' as rwo', 'rwo.id', '=', 'rmr.work_order_id')
            ->leftJoin(config('alias.rf') . ' as rf', 'rf.id', '=', 'rmr.factory_id')
            ->select([
                'rmr.id as ' . $this->apiPrimaryKey,
                'rmr.line_depot_id',
                'rsd.code as line_depot_code',
                'rsd.name as line_depot_name',
                'rmr.work_order_id',
                'rwo.number as work_order_code',
//                'rmr.send_depot',
                'rmr.product_order_code',
                'rmr.product_order_id',
                'rmr.product_order_code',
                'rmr.sale_order_code',
                'rmr.sale_order_project_code',
                'rmr.factory_id',
                'rf.name as factory_name',
            ])
            ->where([
                ['rmr.work_order_id', '=', $input['work_order_id']],
                ['rmr.type', '=', 1],
                ['rmr.push_type', 1],
                ['rmr.status', '=', 4],
                ['rmr.is_delete', '=', 0],
            ])
            ->first();
        if (empty($mr_obj)) TEA('2431');

        // 2.去重获取物料和批次
        $obj_list = DB::table($this->itemTable . ' as rmri')
            ->leftJoin($this->table . ' as rmr', 'rmr.id', '=', 'rmri.material_requisition_id')
            ->leftJoin(config('alias.rmrib') . ' as rmrib', 'rmrib.item_id', '=', 'rmri.id')
            ->leftJoin(config('alias.rm') . ' as rm', 'rm.id', '=', 'rmri.material_id')
            ->select([
                'rmr.product_order_code',
                'rmr.line_depot_id',
                'rmr.send_depot',
                'rmri.material_id',
                'rmri.material_code',
                'rmrib.batch',
                'rm.name as material_name'
            ])
            ->where([
                ['rmr.work_order_id', '=', $input['work_order_id']],
                ['rmr.type', '=', 1],
                ['rmr.push_type', 1],
                ['rmr.is_delete', '=', 0]
            ])
            ->distinct()
            ->get();
        $materialIDArr = [];
        $batchArr = [];
        $sendDepotArr = [];
        foreach ($obj_list as $obj) {
            $materialIDArr[] = $obj->material_id;
            !empty($obj->batch) && $batchArr[] = $obj->batch;
            !empty($obj->send_depot) && $sendDepotArr[] = $obj->send_depot;
        }

        // 3.获取实时库存
        $storage_builder = DB::table(config('alias.rsi') . ' as rsi')
            ->leftJoin(config('alias.ruu') . ' as ruu', 'ruu.id', '=', 'rsi.unit_id')
            ->select([
                'rsi.material_id',
                'rsi.storage_validate_quantity as storage_number',
                'rsi.lot as batch',
                'rsi.po_number as product_order_code',
                'rsi.depot_id as line_depot_id',
                'rsi.unit_id',  // bom_unit_id
                'rsi.send_depot',
                'rsi.id as inve_id',
                'ruu.commercial as unit'
            ])
            ->where([
                ['rsi.po_number', '=', $mr_obj->product_order_code],
                ['rsi.depot_id', '=', $mr_obj->line_depot_id],
            ])
            ->whereIn('rsi.material_id', $materialIDArr);
        // 如果批次/发出库存地点为空，则不做查询
        !empty($batchArr) && $storage_builder->whereIn('rsi.lot', $batchArr);
        !empty($sendDepotArr) && $storage_builder->whereIn('rsi.send_depot', $sendDepotArr);
        $storage_obj_list = $storage_builder->get();
        /**
         * @var array $tempStorageArr 用于存库存的数组
         * key 为 send_depot,material_id,batch 拼接
         */
        $tempStorageArr = [];
        foreach ($storage_obj_list as $obj) {
            $tempStorageArr[$obj->send_depot . '_' . $obj->material_id . '_' . $obj->batch] = [
                'storage_number' => $obj->storage_number,
                'batch' => $obj->batch,
                'unit_id' => $obj->unit_id,
                'unit' => $obj->unit,
                'inve_id' => $obj->inve_id
            ];
        }

        /**
         * @var array $tempMaterialArr 用于存物料的数组
         * key为 send_depot,material_id 拼接
         */
        $tempMaterialArr = [];
        foreach ($obj_list as $obj) {

            // 如果是虚拟进料则不会生成退料单
            if ($obj->material_code == '99999999') {
                continue;
            }

            if (!isset($tempMaterialArr[$obj->send_depot . '_' . $obj->material_id])) {
                $tempMaterialArr[$obj->send_depot . '_' . $obj->material_id] = [
                    'send_depot' => $obj->send_depot,
                    'material_id' => $obj->material_id,
                    'material_code' => $obj->material_code,
                    'material_name' => $obj->material_name,
                ];
            }

            // 当前批次如果有实时库存，则插入到 batches数组中
            if (isset($tempStorageArr[$obj->send_depot . '_' . $obj->material_id . '_' . $obj->batch])) {
                $tempBatch = $tempStorageArr[$obj->send_depot . '_' . $obj->material_id . '_' . $obj->batch];
                $tempMaterialArr[$obj->send_depot . '_' . $obj->material_id]['batches'][] = [
                    'storage_number' => $tempBatch['storage_number'],
                    'batch' => $tempBatch['batch'],
                    'unit_id' => $tempBatch['unit_id'],
                    'bom_commercial' => $tempBatch['unit'],
                    'inve_id' => $tempBatch['inve_id'],
                ];
            }
        }

        $data = obj2array($mr_obj);
        $data['items'] = array_values($tempMaterialArr);
        return $data;
    }

    /**
     * 获取 用于生成退料单的数据
     *
     * @param $input
     * @return array
     * @throws \App\Exceptions\ApiException
     */
    public function getCreateReturnMaterialNew($input)
    {
        //1.先获取PO，WO，SO
        $obj = DB::table(config('alias.rwo') . ' as rwo')
            ->leftJoin(config('alias.rpo') . ' as rpo', 'rpo.id', '=', 'rwo.production_order_id')
            ->leftJoin(config('alias.rf') . ' as rf', 'rf.id', '=', 'rwo.factory_id')
            ->leftJoin(config('alias.rwc') . ' as rwc', 'rwc.id', '=', 'rwo.work_center_id')
            ->leftJoin(config('alias.rws') . ' as rws', 'rws.id', '=', 'rwc.workshop_id')
            ->leftJoin(config('alias.rsd') . ' as rsd', 'rsd.code', '=', 'rws.address')
            ->select([
                'rwo.number as work_order_code',
                'rwo.id as work_order_id',
                'rpo.id as product_order_id',
                'rpo.number as product_order_code',
                'rpo.sales_order_code as sale_order_code',
                'rpo.sales_order_project_code as sale_order_project_code',
                'rf.id as factory_id',
                'rf.code as factory_code',
                'rf.name as factory_name',
                'rsd.id as line_depot_id',
                'rsd.name as line_depot_name',
                'rsd.code as line_depot_code'
            ])
            ->where([
                ['rwo.id', '=', $input['work_order_id']]
            ])
            ->first();
        if (empty($obj)) {
            TEA(2421);
        }
        $result = [];
        if (!empty($obj)) {
            $result = [
                'factory_id' => $obj->factory_id,
                'factory_code' => $obj->factory_code,
                'factory_name' => $obj->factory_name,
                'sale_order_code' => $obj->sale_order_code,
                'sale_order_project_code' => $obj->sale_order_project_code,
                'work_order_id' => $obj->work_order_id,
                'work_order_code' => $obj->work_order_code,
                'product_order_id' => $obj->product_order_id,
                'product_order_code' => $obj->product_order_code,
                'line_depot_id' => $obj->line_depot_id,
                'line_depot_name' => $obj->line_depot_name,
                'line_depot_code' => $obj->line_depot_code,
            ];
        }
        //2.根据PO，WO，SO查询实时库存表
        $obj_list = DB::table(config('alias.rsi') . ' as rsi')
            ->leftJoin(config('alias.rm') . ' as rm', 'rm.id', '=', 'rsi.material_id')
            ->leftJoin(config('alias.ruu') . ' as ruu', 'ruu.id', '=', 'rsi.unit_id')
            ->leftJoin(config('alias.rsd') . ' as rsd', 'rsd.id', '=', 'rsi.depot_id')
            ->leftJoin(config('alias.rf') . ' as rf', 'rf.id', '=', 'rsi.plant_id')
            ->select([
                'rsi.id as inve_id',
                'rsi.storage_validate_quantity as storage_number',
                'rsi.material_id',
                'rm.item_no as material_code',
                'rm.name as material_name',
                'rsi.unit_id',
                'ruu.commercial as bom_commercial',
                'rsi.depot_id as line_depot_id',
                'rsd.name as line_depot_name',
                'rsd.code as line_depot_code',
                'rf.id as factory_id',
                'rf.code as factory_code',
                'rf.name as factory_name',
                'rsi.send_depot',
                'rsi.lot as batch',
            ])
            ->where([
                ['rsi.sale_order_code', '=', $obj->sale_order_code],
                ['rsi.po_number', '=', $obj->product_order_code],
                ['rsi.wo_number', '=', $obj->work_order_code],
                ['rsi.storage_validate_quantity', '>', 0]
            ])
            ->get();
        $material_ID_arr = [];
        foreach ($obj_list as $item) {
            $material_ID_arr[] = $item->material_id;
        }
        //3.提出是否属于线边仓管理
        // 查询物料分類是否屬於線邊庫管理
        $materialObjList = DB::table(config('alias.rm') . ' as rm')
            ->leftJoin(config('alias.rmc') . ' as rmc', 'rmc.id', '=', 'rm.material_category_id')
            ->select(['rm.id', 'rmc.warehouse_management'])
            ->whereIn('rm.id', $material_ID_arr)
            ->get();
        $is_mes_manager = [];
        foreach ($materialObjList as $material) {
            !isset($is_mes_manager[$material->id]) && $is_mes_manager[$material->id] = $material->warehouse_management == 1 ? 1 : 0;
        }
        //4.组装数据
        $materialSendDepotArr = [];
        $batchSendDepotArr = [];
        foreach ($obj_list as $key => $value) {
            //如果属于线边仓管理，就剔除
            if (isset($is_mes_manager[$value->material_id]) && $is_mes_manager[$value->material_id] == 1) {
                continue;
            }
            //如果原始发料地点为空，则是用采购仓储
            if (empty($value->send_depot)) {
                $value->send_depot = $this->getSaleDepotAndProduceDepot($value->material_id, $value->factory_id);
            }
            if (empty($materialSendDepotArr[$value->material_id . '_' . $value->send_depot])) {
                $materialSendDepotArr[$value->material_id . '_' . $value->send_depot] = [
                    'send_depot' => $value->send_depot,
                    'material_id' => $value->material_id,
                    'material_code' => $value->material_code,
                    'material_name' => $value->material_name,
                ];
            }
            $batchSendDepotArr[$value->material_id . '_' . $value->send_depot][] = [
                'storage_number' => $value->storage_number,
                'batch' => $value->batch,
                'unit_id' => $value->unit_id,
                'bom_commercial' => $value->bom_commercial,
                'inve_id' => $value->inve_id,
            ];
        }

        foreach ($materialSendDepotArr as $k => &$v) {
            $v['batches'] = isset($batchSendDepotArr[$k]) ? $batchSendDepotArr[$k] : [];
        }
        $result['items'] = array_values($materialSendDepotArr);
        return $result;
    }

    /**
     * 获取 车间退料的 可退的库存数量
     *
     * 1.获取当前WO下面所有的领、补料单(的inve_id)
     * 2.统计所有的分组
     * @param $input
     * @return array
     */
    public function getWorkShopReturnStorage($input)
    {
        $obj_list = DB::table($this->table . ' as rmr')
            ->leftJoin($this->itemTable . ' as rmri', 'rmri.material_requisition_id', '=', 'rmr.id')
            ->leftJoin(config('alias.rmrib') . ' as rmrib', 'rmrib.item_id', '=', 'rmri.id')
            ->leftJoin(config('alias.rwo') . ' as rwo', 'rwo.id', '=', 'rmr.work_order_id')
            ->leftJoin(config('alias.rsi') . ' as rsi', [['rsi.id', '=', 'rmrib.inve_id'], ['rsi.depot_id', '=', 'rmr.line_depot_id']])
            ->leftJoin(config('alias.ruu') . ' as ruu', 'ruu.id', '=', 'rsi.unit_id')
            ->leftJoin(config('alias.rsd') . ' as rsd_o', 'rsd_o.id', '=', 'rmri.depot_id')//原发料仓库
            ->leftJoin(config('alias.rsd') . ' as rsd_n', 'rsd_n.id', '=', 'rsi.depot_id')//现库存仓库
            ->select([
                'rmr.line_depot_id',    //当前线边库(当前库存仓库)
                'rmri.material_id',
                'rmri.material_code',
                'rmrib.inve_id',
//                'rmrib.actual_receive_qty as received_qty',
                'rsd_n.id  as  now_depot_id',     //物料当前库存仓库
                'rsd_n.code as now_depot_code',
                'rsd_n.name as now_depot_name',
                'rsd_o.id  as  origin_depot_id',     //物料上个车间（原发料仓库）
                'rsd_o.code as origin_depot_code',
                'rsd_o.name as origin_depot_name',
                'rsi.lot as batch',
                'rsi.storage_validate_quantity as storage_number',
                'rsi.unit_id',
                'ruu.commercial as unit_name',
            ])
//            ->addSelect(DB::raw('SUM(rmrib.actual_receive_qty) as received_qty'))
            ->where([
                ['rmr.work_order_id', '=', $input['work_order_id']],
                ['rmr.push_type', '=', 2],
                ['rmr.status', '=', 4],
                ['rmr.is_delete', '=', 0],
            ])
            ->whereIn('rmr.type', [1, 7])
            ->groupBy('rsi.id')
            ->get();
        //如果为空，则直接返回
        if (empty($obj_list)) {
            return [];
        }

        $tempArr = [];
        foreach ($obj_list as $obj) {
            //库存小于等于0，则不返回
            if ($obj->storage_number <= 0) {
                continue;
            }
            $tempArr[$obj->material_id][] = $obj;
        }
        return $tempArr;
    }

    /**
     * @param $input
     * @return array
     * @throws \App\Exceptions\ApiException
     */
    public function getWorkShopSyncSapData($input)
    {
        $objs = DB::table($this->table . ' as rmr')
            ->leftJoin(config('alias.rmri') . ' as rmri', 'rmri.material_requisition_id', '=', 'rmr.id')
            ->leftJoin(config('alias.rmrib') . ' as rmrib', 'rmrib.item_id', '=', 'rmri.id')
            ->leftJoin(config('alias.rf') . ' as rf', 'rf.id', '=', 'rmr.factory_id')
            ->leftJoin(config('alias.rwb') . ' as rwb', 'rwb.id', '=', 'rmr.workbench_id')
            ->leftJoin(config('alias.rwo') . ' as rwo', 'rwo.id', '=', 'rmr.work_order_id')
            ->leftJoin(config('alias.re') . ' as re', 're.id', '=', 'rmr.employee_id')
            ->leftJoin(config('alias.rsd') . ' as rsd', 'rsd.id', '=', 'rmr.line_depot_id')//需求库存车间(当前)
            ->leftJoin(config('alias.rsd') . ' as rsd2', 'rsd2.id', '=', 'rmri.depot_id')//发料车间(上一个)
            ->leftJoin(config('alias.rm') . ' as rm', 'rm.id', '=', 'rmri.material_id')
            ->leftJoin(config('alias.ruu') . ' as ruu_d', 'ruu_d.id', '=', 'rmrib.bom_unit_id')
            ->select([
                'rmr.code as mr_code',
                'rmr.time',
                'rmr.from',
                'rmr.type',
                'rmr.status',
                'rmr.sale_order_code',  // 销售订单号
                'rmr.sale_order_project_code', //销售订单项目号
                'rmr.send_depot',
                're.name as employee_name',
                'rf.name as factory_name',
                'rf.code as factory_code',
                'rwb.code as workbench_code',
                'rwo.number as work_order_code',
                'rsd.code as line_depot_code',
                'rsd2.code as depot_code',
                'rmri.line_project_code',
                'rmri.material_id',
                'rm.item_no as material_code',
                'rm.name as material_name',
                'rm.material_category_id',
                'rmri.demand_qty',
                'ruu_d.id as bom_unit_id',
                'ruu_d.commercial as unit_name', // bom单位
                'rmrib.actual_send_qty',
                'rmrib.actual_receive_qty',
                'rmrib.batch',
                'rmri.is_special_stock',

            ])
            ->where([
                ['rmr.id', '=', $input[$this->apiPrimaryKey]],
                ['rmr.push_type', '=', 2],
                ['rmr.is_delete', '=', 0],
            ])
            ->whereIn('rmr.status', [4])
            ->get();
//        if (empty(obj2array($objs))) {
//            TEA('2432');    // 不允许推送或已推送
//        }
        $sendData = [];
        foreach ($objs as $key => $value) {
            //如果当前物料的分类不在限定之列，则不需要发送
            if (!$this->checkMaterialCategoryIsInArray(
                $value->material_category_id, config('app.need_send_to_sap_material_category', []))
            ) {
                continue;
            }
            // bom单位转为基本单位
            //如果状态为3，则为实发;状态为4，则为实收
            $qty = $value->status == 3 ? $value->actual_send_qty : $value->actual_receive_qty;
            $baseUnitArr = $this->bomUnitToBaseUnit($value->material_id, $value->bom_unit_id, $qty);
            $temp = [
                'LLDH' => $value->mr_code,
                'LLHH' => $value->line_project_code,
                'LLLX' => $this->intToType($value->type),
                'LLRQ' => date('Ymd', $value->time),
                'LLSJ' => date('His', $value->time),
                'LLR' => $value->employee_name,
                'WERKS' => $value->factory_code,
                'XNBK' => $value->line_depot_code,     //需求线边库
                'GONGW' => empty($value->workbench_code) ? '' : $value->workbench_code,
                'GONGD' => $value->work_order_code,
                'FCKCDD' => $value->depot_code,     //发出库存地点
                'AUFNR' => '',      //订单号（非PO）
                'KDAUF' => $value->is_special_stock == 'E' ? $value->sale_order_code : '',  //销售订单（非mes销售订单）
                'KDPOS' => $value->is_special_stock == 'E' ? $value->sale_order_project_code : '',    //销售订单项目
                'LIFNR' => '',
                'MATNR' => $value->material_code,
                'MAKTX' => $value->material_name,
                'XQSL' => $baseUnitArr['base_qty'],
                'XQSLDW' => empty($baseUnitArr['base_unit']) ? '' : strtoupper($baseUnitArr['base_unit']),
                'XTLY' => 1,  //系统来源
                'BATCH' => $value->batch,
            ];
            $sendData[] = $temp;
        }
        return $sendData;
    }

    /**
     * SAP领料 查询采购仓库和生产仓库
     *
     * @param $input
     * @return array
     * @throws \App\Exceptions\ApiException
     */
    public function getMaterialDepot($input)
    {
        if (empty($input['materials'])) TEA(700, 'materials');
        try {
            $input['materialArr'] = explode(',', $input['materials']);
        } catch (\Exception $e) {
            TEA(700, 'materials');
        }
        if (empty($input['factory_id'])) TEA(700, 'factory_id');

        $obj_list = DB::table(config('alias.ramc') . ' as ramc')
            ->leftJoin(config('alias.rf') . ' as rf', 'rf.code', '=', 'ramc.WERKS')
            ->select(['ramc.material_id', 'ramc.LGPRO', 'ramc.LGFSB'])
            ->where([['rf.id', '=', $input['factory_id']]])
            ->whereIn('ramc.material_id', $input['materialArr'])
            ->get();

        $data = [];
        foreach ($obj_list as $obj) {
            $data[$obj->material_id] = $obj;
        }
        return $data;
    }

    /**
     * 获取采购仓储，如果无，则用生产仓储
     *
     * @param $material_id
     * @param $factory_id
     * @return string
     */
    private function getSaleDepotAndProduceDepot($material_id, $factory_id)
    {
        $obj = DB::table(config('alias.ramc') . ' as ramc')
            ->leftJoin(config('alias.rf') . ' as rf', 'rf.code', '=', 'ramc.WERKS')
            ->select([
                'ramc.material_id',
                'ramc.LGPRO',  //生产仓储
                'ramc.LGFSB', //采购仓储
            ])
            ->where([
                ['rf.id', '=', $factory_id],
                ['ramc.material_id', '=', $material_id]
            ])
            ->first();
        $depot_code = '';
        if (!empty($obj)) {
            $depot_code = empty($obj->LGFSB) ? $obj->LGPRO : $obj->LGFSB;
        }
        return $depot_code;
    }

    /**
     * sap领料查询时间数据
     *
     * @param $input
     * @return array
     * @throws \App\Exceptions\ApiException
     */
    public function getSapPackingInfo($input)
    {
        if (empty($input['work_order_id'])) TEA(700, 'work_order_id');

        $is_first = 1;
        $is_unfinished = 0;

        $obj = DB::table($this->table)
            ->where([
                ['work_order_id', '=', $input['work_order_id']],
                ['type', '=', 1],
                ['is_delete', '=', 0],
                ['push_type', '=', 1]
            ])
            ->count();
        // 如果存在，则不是第一次领料
        if ($obj) {
            $is_first = 0;
            //查询是否有未完成的领料单
            $obj = DB::table($this->table)
                ->where([
                    ['work_order_id', '=', $input['work_order_id']],
                    ['type', '=', 1],
                    ['push_type', '=', 1],
                    ['is_delete', '=', 0],
                    ['status', '<>', 4]
                ])
                ->count();
            if ($obj) {
                $is_unfinished = 1;
            }
        }

        //查询所有领料的实收数据总和
        $obj_list = DB::table($this->table . ' as rmr')
            ->leftJoin(config('alias.rmri') . ' as rmri', 'rmri.material_requisition_id', '=', 'rmr.id')
            ->leftJoin(config('alias.rmrib') . ' as rmrib', 'rmrib.item_id', '=', 'rmri.id')
            ->select([
                'rmri.material_id',
            ])
            ->addSelect(DB::raw('SUM(rmrib.actual_receive_qty) as sum'))
            ->where([
                ['rmr.work_order_id', '=', $input['work_order_id']],
                ['rmr.push_type', '=', 1],
                ['rmr.type', '=', 1],
                ['rmr.is_delete', '=', 0],
            ])
            ->groupBy('rmri.material_id')
            ->get();
        $data = [];
        foreach ($obj_list as $o) {
            $data[$o->material_id] = $o->sum;
        }
        return [
            'is_first' => $is_first,
            'is_unfinished' => $is_unfinished,
            'materials' => $data
        ];
    }

//endregion

//region 推送
    /**
     * 同步委外领料单结果
     *
     * @param array $input
     * @return array
     * @throws \App\Exceptions\ApiException
     * @throws \App\Exceptions\ApiSapException
     */
    public function syncPickingResult($input)
    {
        // $ApiControl = new SapApiRecord();
        // $ApiControl->store($input);

        /**
         * @todo 业务处理
         * 如果有异常,直接 TESAP('code',$params='',$data=null)
         */
        foreach ($input['DATA'] as $value) {
            if (empty($value['LLDH'])) TESAP('703', 'LLDH');
            if (empty($value['LLHH'])) TESAP('703', 'LLHH');

            $keyVal = [
                'actual_send_qty' => $value['SFHSL'],
                'actual_send_unit' => $value['SFHSLDW'],
            ];
            $order_obj_z = DB::table($this->ZyTable)->where('code', $value['LLDH'])->first();
            if (!$order_obj_z) TESAP('2479');
            $order_id = $order_obj_z->id;
            $where = [
                'out_machine_zxxx_order_id' => $order_id,
                'line_project_code' => str_pad($value['LLHH'], 4, '0', STR_PAD_LEFT),
            ];
            $upd = DB::table($this->ZyItemTable)->where($where)->update($keyVal);
            // $item_res  = DB::table($this->ZyItemTable)->where($where)->select('MATNR')->first();
            // $material_code  = str_pad($item_res->MATNR, 18, '0', STR_PAD_LEFT);
            // //同时反写到委外订单明细中
            // $keypickVal = [
            //     'lineItem.actual_send_qty' => $value['SFHSL'],
            //     'lineItem.actual_send_unit' => $value['SFHSLDW'],
            // ];
            // $updd  = DB::table('ruis_sap_out_picking_line_item as lineItem')
            //        ->leftJoin('ruis_sap_out_picking_line  as line', 'line.id', '=', 'lineItem.line_id')
            //        ->where('line.picking_id',$order_obj_z->out_picking_id)
            //        ->where('lineItem.DMATNR',$material_code)
            //        ->update($keypickVal);
            if ($upd === false) TESAP('804');
        }
        return [];
    }

    /**
     * 同步车间领料单结果
     *
     * @param array $input
     * @return array
     * @throws \App\Exceptions\ApiException
     * @throws \App\Exceptions\ApiSapException
     */
    public function syncShopResult($input)
    {
        $ApiControl = new SapApiRecord();
        $ApiControl->store($input);

        $data = $input['DATA'];

        foreach ($data as $datum) {
            if (empty($datum['LLDH'])) TESAP('703', 'LLDH');
            if (empty($datum['LLHH'])) TESAP('703', 'LLHH');
            if (empty($datum['LLLX'])) TESAP('700', 'LLLX');

            //判断当前所属工单是否被锁定
            $this->checkWorkOrderLockByMRCode($datum['LLDH']);

            /**
             * 如果是退料类型，行项目号取前五位
             */
            $datum['status'] = 2;
            if ($datum['LLLX'] == 'ZY02') {
                // order 为行项目的后五位
                $order = substr($datum['LLHH'], 5);
                $datum['LLHH'] = substr($datum['LLHH'], 0, 5);
//                $datum['status'] = 3;
                $datum['status'] = 2;   //2018.11.23 先出库在更改状态完成
            }

            $obj = DB::table($this->table . ' as rmr')
                ->leftJoin($this->itemTable . ' as rmri', 'rmri.material_requisition_id', '=', 'rmr.id')
                ->select([
                    'rmr.id as mr_id',
                    'rmri.id as item_id',
                    'rmri.material_code',
                    'rmri.material_id',
                    'rmri.demand_unit_id as bom_unit_id',
                ])
                ->where([
                    ['rmr.code', '=', $datum['LLDH']],
                    ['rmri.line_project_code', '=', $datum['LLHH']],
                    ['rmr.status', '=', $datum['status']],
                    ['rmr.is_delete', '=', 0],
                ])
                ->first();
            if (empty($obj)) {
                TESAP('2421');
            }

            $insertKeyValArrays = [];
            $keyVal = [
                'material_requisition_id' => $obj->mr_id,
                'item_id' => $obj->item_id,
            ];

            /**
             * 如果类型为 退料， 则执行更新。
             * 其他则为添加。
             * ps:
             * 如果为退料，ITEMS数组中只会有一条数据
             */
            if ($datum['LLLX'] == 'ZY02') {
                foreach ($datum['ITEMS'] as $value) {

                    !isset($value['SQNM']) && TESAP('700', 'SQNM');
                    !isset($value['MATNR']) && TESAP('700', 'MATNR');
                    !isset($value['BATCH']) && TESAP('700', 'BATCH');
                    !isset($value['MATQTY']) && TESAP('700', 'MATQTY');
                    !isset($value['MEINS']) && TESAP('700', 'MEINS');

                    if ($obj->material_code != ltrim($value['MATNR'], '0')) {
                        TESAP('2428');
                    }

                    $rmribObj = DB::table(config('alias.rmrib'))
                        ->select(['id', 'bom_unit_id'])
                        ->where([
                            ['material_requisition_id', '=', $obj->mr_id],
                            ['item_id', '=', $obj->item_id],
                            ['order', '=', $order],
                            ['batch', '=', $value['BATCH']]
                        ])
                        ->first();
                    if (empty($rmribObj)) {
                        TESAP('2421');
                    }

                    // SAP传过来的基本单位转为 bom单位
                    $bomUnitArr = $this->baseUnitToBomUnit($obj->material_id, $value['MEINS'], $value['MATQTY'], $rmribObj->bom_unit_id);

                    $where = [
                        ['material_requisition_id', '=', $obj->mr_id],
                        ['item_id', '=', $obj->item_id],
                        ['order', '=', $order],
                        ['batch', '=', $value['BATCH']]
                    ];
                    $update = [
                        'actual_receive_qty' => $bomUnitArr['bom_qty'],
//                        'bom_unit_id' => $bomUnitArr['bom_unit_id'],
                        'base_unit' => $value['MEINS'],
                    ];
                    DB::table(config('alias.rmrib'))->where($where)->update($update);
                }
                //如果当前 退料单的所有明细批次实收数据已完成修改，则表明退料完成，更新状态为4
                if ($this->checkIsLastReturn($obj->mr_id)) {
                    $auditingParam[$this->apiPrimaryKey] = $obj->mr_id;
                    $this->auditing($auditingParam);        // SAP退料 出库  状态：2->3
                    $this->updateStatus($obj->mr_id, 4);    // 实退数，退料完成 状态 3->4
                }
            } else {
                foreach ($datum['ITEMS'] as $value) {

                    !isset($value['SQNM']) && TESAP('700', 'SQNM');
                    !isset($value['MATNR']) && TESAP('700', 'MATNR');
                    !isset($value['BATCH']) && TESAP('700', 'BATCH');
                    !isset($value['MATQTY']) && TESAP('700', 'MATQTY');
                    !isset($value['MEINS']) && TESAP('700', 'MEINS');

                    if ($obj->material_code != ltrim($value['MATNR'], '0')) {
                        TESAP('2428');
                    }
                    // SAP传过来的基本单位转为 bom单位
                    $bomUnitArr = $this->baseUnitToBomUnit($obj->material_id, $value['MEINS'], $value['MATQTY'], $obj->bom_unit_id);
                    $keyVal['order'] = str_pad($value['SQNM'], 5, '0', STR_PAD_LEFT);
                    $keyVal['batch'] = $value['BATCH'];
                    $keyVal['actual_send_qty'] = $bomUnitArr['bom_qty'];
                    $keyVal['bom_unit_id'] = $bomUnitArr['bom_unit_id'];
                    $keyVal['base_unit'] = $value['MEINS'];
                    $insertKeyValArrays[] = $keyVal;
                }
                DB::table(config('alias.rmrib'))->insert($insertKeyValArrays);
                //如果 当前领补料单 所有的明细批次已完成发料，则表示发料完成，更新状态为3
                if ($this->checkIsLastSend($obj->mr_id)) {
                    $this->updateStatus($obj->mr_id, 3);    //实发数
                }
            }

        }
        return [];
    }
//endregion

//region 报工&mes领料

    /**
     * 报工用到的适合库存
     * @param array $input
     * @return array
     * @throws \App\Exceptions\ApiException
     */
    public function getMaterialStorageInPW($input)
    {
        if (empty($input['material_ids'])) return [];
        $input['material_id_arr'] = array_unique(explode(',', $input['material_ids']));

        if (empty($input['line_depot_id'])) TEA('700', 'line_depot_id');
        $has = $this->isExisted([['id', $input['line_depot_id']]], config('alias.rsd'));
        if (!$has) TEA('700', 'line_depot_id');

        // 验证 物料id是否存在
        $material_count = DB::table(config('alias.rm'))
            ->whereIn('id', $input['material_id_arr'])
            ->count();
        if ($material_count != count($input['material_id_arr'])) TEA('700', 'material_ids');

        //验证 工单
        if (empty($input['work_order_code'])) TEA('700', 'work_order_code');
        $has = $this->isExisted([['number', '=', $input['work_order_code']]], config('alias.rwo'));
        if (!$has) TEA('700', 'work_order_code');

        //验证 订单
        if (empty($input['product_order_code'])) TEA('700', 'product_order_code');
        $has = $this->isExisted([['number', '=', $input['product_order_code']]], config('alias.rpo'));
        if (!$has) TEA('700', 'product_order_code');

        //如果销售订单为空，查询的时候也要带上条件，值为空字符串
        $input['sale_order_code'] = empty($input['sale_order_code']) ? '' : $input['sale_order_code'];

        $obj_list = DB::table(config('alias.rsi') . ' as rsi')
            ->leftJoin(config('alias.rm') . ' as rm', 'rm.id', '=', 'rsi.material_id')
            ->leftJoin(config('alias.ruu') . ' as ruu', 'ruu.id', '=', 'rsi.unit_id')
            ->leftJoin(config('alias.rsd') . ' as rsd', 'rsd.id', '=', 'rsi.depot_id')
            ->leftJoin(config('alias.rf') . ' as rf', 'rf.id', '=', 'rsi.plant_id')
            ->select([
                'rsi.id as inve_id',
                'rsi.plant_id as factory_id',
                'rsi.depot_id',
                'rsi.lot as batch',
                'rsi.unit_id',
                'ruu.commercial as unit_name',
                'rsi.sale_order_code',
                'rsi.po_number as product_order_code',
                'rsi.wo_number as work_order_code',
                'rsi.material_id',
                'rsi.send_depot',
                'rm.item_no as material_code',
                'rsd.code as depot_code',
                'rsd.name as depot_name',
                'rf.code as factory_code',
                'rf.name as factory_name',
                'rsi.storage_validate_quantity as storage_number',
            ])
//            ->addSelect(DB::raw('SUM(rsi.storage_validate_quantity) as storage_number'))
            ->where(function ($query) use ($input) {
                $query->where([
                    ['rsi.po_number', '=', $input['product_order_code']],
                    ['rsi.wo_number', '=', $input['work_order_code']]
                ])
                    ->orWhere([
                        ['rsi.po_number', '=', ''],
                        ['rsi.wo_number', '=', '']
                    ]);
            })
            ->where([
                ['rsi.sale_order_code', '=', $input['sale_order_code']],
                ['rsi.depot_id', '=', $input['line_depot_id']]
            ])
            ->whereIn('rsi.material_id', $input['material_id_arr'])
//            ->groupBy('rsi.material_id', 'rsi.lot', 'rsi.depot_id', 'rsi.po_number')
            ->get();
        $tempArr = [];
        foreach ($obj_list as $obj) {
            //只有实时库存大于0，才会收集
            if ($obj->storage_number > 0) {
                $tempArr[$obj->material_id][] = $obj;
            }
        }
        return $tempArr;
    }

    /**
     * 验证报工中的mes领料参数
     *
     * @param array $input
     * @throws \App\Exceptions\ApiException
     */
    public function checkMixedStoreParams(&$input)
    {
        if (empty($input['product_order_code'])) TEA('700', 'product_order_code');
        $po_obj = DB::table(config('alias.rpo'))->select('id')->where('number', $input['product_order_code'])->first();
        if (empty($po_obj)) TEA('700', 'product_order_code');
        $input['product_order_id'] = $po_obj->id;

        if (empty($input['work_order_id'])) TEA('700', 'work_order_id');
        $wo_obj = DB::table(config('alias.rwo'))->select('number as code')->where('id', $input['work_order_id'])->first();
        if (empty($po_obj)) TEA('700', 'work_order_code' . json_encode($wo_obj));
        $input['work_order_code'] = $wo_obj->code;

        if (!isset($input['sale_order_code'])) TEA('700', 'sale_order_code');
        if (!isset($input['sales_order_project_code'])) TEA('700', 'sales_order_project_code');
        $input['sale_order_project_code'] = $input['sales_order_project_code'];

        if (empty($input['factory_id'])) TEA('700', 'factory_id');
        $has = $this->isExisted([['id', '=', $input['factory_id']]], config('alias.rf'));
        if (!$has) TEA('700', 'factory_id');

        if (!isset($input['in_materials'])) TEA('700', 'in_materials');
        try {
            $input['materials'] = json_decode($input['in_materials'], true);
        } catch (\Exception $e) {
            TEA('700', 'in_materials');
        }
        if (empty($input['materials'])) TEA('700', 'in_materials');
        foreach ($input['materials'] as &$material) {
            if (empty($material['material_id'])) TEA('700', 'material_id');
            $material_obj = DB::table(config('alias.rm'))
                ->where('id', $material['material_id'])
                ->select(['id', 'item_no as material_code'])
                ->first();
            if (empty($material_obj)) TEA('700', 'material_id');
            $material['material_code'] = $material_obj->material_code;

            //验证单位
            if (empty($material['unit_id'])) TEA('700', 'unit_id');
            $has = $this->isExisted([['id', '=', $material['unit_id']]], config('alias.ruu'));
            if (!$has) TEA('700', 'unit_id');

            //验证库存地点
            if (empty($material['depot_id'])) TEA('700', 'depot_id');
            $has = $this->isExisted([['id', '=', $material['depot_id']]], config('alias.rsd'));
            if (!$has) TEA('700', 'depot_id');

            if (empty($material['inve_id'])) TEA('700', 'inve_id');
            $has = $this->isExisted([['id', '=', $material['inve_id']]], config('alias.rsi'));
            if (!$has) TEA('700', 'inve_id');

            if (!isset($material['qty'])) TEA('700', 'qty'); //计划数量 从WO过来的
            if (!isset($material['batch_qty'])) TEA('700', 'batch_qty');    //额定数量
            if (!isset($material['GMNGA'])) TEA('700', 'GMNGA');        //消耗数
            if (!isset($material['storage_number'])) TEA('700', 'storage_number');        //消耗数
            $material['plan_qty'] = $material['qty'];
            $material['rated_qty'] = $material['batch_qty'];
            $material['actual_qty'] = $material['GMNGA'];
            //额定数量不能大于计划数量
            if ($material['rated_qty'] > $material['plan_qty']) {
                TEA('700', 'batch_qty');
            }
            //消耗数量不能大于实际库存
            if ($material['actual_qty'] > $material['storage_number']) {
                TEA('700', 'GMNGA');
            }
        }
        $input['creator_id'] = (!empty(session('administrator')->admin_id)) ? session('administrator')->admin_id : 0;
        $input['employee_id'] = $input['creator_id'];
    }

    /**
     * @param $input
     * @param int $is_last_produce_work 是否为最后一次报工
     * @param int $declare_id 报工单id
     * @throws \App\Exceptions\ApiException
     */
    public function mixedStore($input, $is_last_produce_work = 0, $declare_id)
    {
        $this->checkMixedStoreParams($input);
        $mr_keyVal = [
            'push_type' => 0,
            'sale_order_code' => get_value_or_default($input, 'sale_order_code', ''),
            'sale_order_project_code' => get_value_or_default($input, 'sale_order_project_code', ''),
            'factory_id' => get_value_or_default($input, 'factory_id', 0),
            'line_depot_id' => get_value_or_default($input, 'depot_id', 0),
            'send_depot' => get_value_or_default($input, 'send_depot', ''),
            'workbench_id' => get_value_or_default($input, 'workbench_id', 0),
            'work_order_id' => $input['work_order_id'],
            'product_order_code' => $input['product_order_code'],
            'product_order_id' => $input['product_order_id'],
            'employee_id' => get_value_or_default($input, 'employee_id', 0),
            'creator_id' => get_value_or_default($input, 'creator_id', 0),
            'declare_id' => $declare_id, //报工单id
            'from' => 1,
            'ctime' => time(),
            'mtime' => time(),
            'time' => time(),
            'status' => 1,
        ];

        /**
         * @var array $mes_material_arr mes领料的物料数据数组
         * @var array $return_material_arr 退料的物料数据数组
         * @var array $fullUp_material_arr 补料的物料数据数组
         */
        $mes_material_arr = [];
        $return_material_arr = [];
        $fullUp_material_arr = [];
        // 根据计划用量和实际用量关系 分出领补退物料数据数组
        foreach ($input['materials'] as $material) {
            if ($material['rated_qty'] > 0) {
                $mes_material_arr[] = $material;
            }
            if ($material['rated_qty'] > $material['actual_qty']) {
                $return_material_arr[] = $material;
            }
            if ($material['rated_qty'] < $material['actual_qty']) {
                $fullUp_material_arr[] = $material;
            }
        }

        // 1. 分别组装数据，插入到三张表中
        // 2. 然后分别对三个订单 进行出入库操作

        //领
        if (!empty($mes_material_arr)) {
            $mes_mr_id = $this->createMR($mes_material_arr, $mr_keyVal, 1);
            $input[$this->apiPrimaryKey] = $mes_mr_id;
            $mes_mr_id && $this->auditing($input);
        }

        //退
        if (!empty($return_material_arr)) {
            $return_mr_id = $this->createMR($return_material_arr, $mr_keyVal, 2);
            $input[$this->apiPrimaryKey] = $return_mr_id;
            $return_mr_id && $this->auditing($input, $is_last_produce_work);
        }

        //补
        if (!empty($fullUp_material_arr)) {
            $fullUp_mr_id = $this->createMR($fullUp_material_arr, $mr_keyVal, 7);
            $input[$this->apiPrimaryKey] = $fullUp_mr_id;
            $fullUp_mr_id && $this->auditing($input);
        }
    }

    /**
     * 创建领、补、退料单
     *
     * @param array $materials 需要处理的数组
     * @param array $mrKeyVal mr的主表(领、补、退)的 公共字段
     * @param int $type [1,2,7] 分别为 mes领料，车间退料，车间补料
     * @return mixed
     */
    public function createMR($materials, $mrKeyVal, $type = 1)
    {
        if (empty($materials)) {
            return false;
        }
        //按照物料和地点分组
        $temp_material_arr = [];
        foreach ($materials as $material) {
            $temp_material_arr[$material['material_id'] . '_' . $material['depot_id']][] = $material;
        }

        $i = 1;
        $itemKeyValArr = [];
        foreach ($temp_material_arr as $key => $value) {
            $itemTempKeyValArr = [];

            $batchKeyValArr = [];
            $j = 1;
            foreach ($value as $v) {
                empty($itemTempKeyValArr) && $itemTempKeyValArr = [
                    'line_project_code' => str_pad($i++, 5, '0', STR_PAD_LEFT),
                    'material_id' => $v['material_id'],
                    'material_code' => $v['material_code'],
                    'demand_qty' => $v['plan_qty'],
                    'demand_unit_id' => $v['unit_id'],  //此为 bom_unit_id
                    'send_status' => 1,
                    'is_special_stock' => isset($v['is_spec_stock']) ? $v['is_spec_stock'] : '',
                    'depot_id' => $v['depot_id'],
                ];
                $qtyArr = $this->getQty($v, $type);
                //如果数量为0，则不生成领料单
                if ($qtyArr['actual_receive_qty'] <= 0) {
                    continue;
                }
                $batchKeyValArr[] = [
                    'order' => str_pad($j++, 5, '0', STR_PAD_LEFT),
                    'batch' => empty($v['batch']) ? '' : $v['batch'],
                    'actual_send_qty' => $qtyArr['actual_send_qty'],
                    'actual_receive_qty' => $qtyArr['actual_receive_qty'],
                    'bom_unit_id' => $v['unit_id'],
                    'inve_id' => $v['inve_id']
                ];
            }
            $itemTempKeyValArr['batchArr'] = $batchKeyValArr;
            $itemKeyValArr[] = $itemTempKeyValArr;
        }
        $mrKeyVal['code'] = $this->getNewCode($type);
        $mrKeyVal['type'] = $type;

        $insert_batch_key_val_arr = [];     //收集要插入rmrib表的KeyVal数组
        $mr_id = DB::table($this->table)->insertGetId($mrKeyVal);
        foreach ($itemKeyValArr as $itemKeyVal) {
            $batchArr = $itemKeyVal['batchArr'];
            unset($itemKeyVal['batchArr']);

            $itemKeyVal['material_requisition_id'] = $mr_id;
            $mri_id = DB::table($this->itemTable)->insertGetId($itemKeyVal);

            //遍历，并添加主表的id
            foreach ($batchArr as $batch) {
                $batch['material_requisition_id'] = $mr_id;
                $batch['item_id'] = $mri_id;
                $insert_batch_key_val_arr[] = $batch;
            }
        }
        DB::table(config('alias.rmrib'))->insert($insert_batch_key_val_arr);
        return $mr_id;
    }

    /**
     * 获取领退补数据
     *
     * @param array $array
     * @param int $type [1,2,7] 分别为 mes领料，车间退料，车间补料
     * @return array
     */
    public function getQty($array, $type = 1)
    {
        $arr = [];
        switch ($type) {
            case 1:
            default:
                $arr['actual_send_qty'] = $array['rated_qty'];
                $arr['actual_receive_qty'] = $array['rated_qty'];
                break;
            case 2:     //车间退料
                $arr['actual_send_qty'] =
                $arr['actual_receive_qty'] = $array['rated_qty'] - $array['actual_qty'];
                break;
            case 7:
                $arr['actual_send_qty'] =
                $arr['actual_receive_qty'] = $array['actual_qty'] - $array['rated_qty'];
                break;
        }
        return $arr;
    }
//endregion

//region other
    /**
     * 发料类型 数字转字符串
     *
     * 如：1->ZY01
     *
     * @param int $i
     * @return string
     */
    private function intToType($i)
    {
        $type = 'ZY01';
        if (!is_numeric($i)) {
            return $type;
        }
        switch ($i) {
            case 1:
                $type = 'ZY01';
                break;
            case 2:
                $type = 'ZY02';
                break;
            case 3:
                $type = 'ZY03';
                break;
            case 4:
                $type = 'ZY04';
                break;
            case 5:
                $type = 'ZY05';
                break;
            case 6:
                $type = 'ZY06';
                break;
            case 7:
                $type = 'ZB01';
                break;
            case 8:
                $type = 'ZB03';
                break;
            default:
                $type = 'ZY01';
                break;
        }
        return $type;
    }

    /**
     * 基本单位 转 bom(生产)单位
     *
     * @param $material_id
     * @param $base_unit
     * @param $qty
     * @param $bom_unit_id
     * @return array
     * @throws \App\Exceptions\ApiSapException
     */
    private function baseUnitToBomUnit($material_id, $base_unit, $qty, $bom_unit_id)
    {
        $unit_obj = DB::table(config('alias.ruu'))
            ->select('id')
            ->where('commercial', $base_unit)
            ->first();
        if (empty($unit_obj)) {
            TESAP('700', 'MEINS');
        }

        $Units = new Units();
        $bom_qty = $Units->getExchangeUnitValueById($unit_obj->id, $bom_unit_id, $qty, $material_id);
        if (empty($bom_qty)) {
            TESAP('2433');
        }
        return ['bom_qty' => $bom_qty, 'bom_unit_id' => $bom_unit_id];
    }

    /**
     * bom单位 转 基本单位
     *
     * @param $material_id
     * @param $bom_unit_id
     * @param $qty
     * @return array
     * @throws \App\Exceptions\ApiException
     */
    private function bomUnitToBaseUnit($material_id, $bom_unit_id, $qty)
    {
        $material_obj = DB::table(config('alias.rm') . ' as rm')
            ->leftJoin(config('alias.ruu') . ' as ruu', 'ruu.id', '=', 'rm.unit_id')
            ->select(['rm.unit_id as base_unit_id', 'ruu.commercial as base_unit'])
            ->where('rm.id', $material_id)
            ->first();
        if (empty($material_obj)) {
            TEA('2433');
        }
        $Units = new Units();
        $base_qty = $Units->getExchangeUnitValueById($bom_unit_id, $material_obj->base_unit_id, $qty, $material_id);
        if (empty($base_qty)) {
            TEA('2433');
        }
        return ['base_qty' => ceil_dot($base_qty, 1), 'base_unit_id' => $material_obj->base_unit_id, 'base_unit' => $material_obj->base_unit];
    }

//endregion
}