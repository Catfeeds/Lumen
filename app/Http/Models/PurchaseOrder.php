<?php
/**
 * Created by PhpStorm.
 * User: xiafengjuan
 * Date: 2017/10/17
 * Time: 15:13
 */
namespace App\Http\Models;//定义命名空间
use Illuminate\Support\Facades\DB;//引入DB操作类
class PurchaseOrder extends Base
{
    public function __construct()
    {
        $this->table = 'order';
    }
    /**
     * 根据条件查看采购订单
     * @author xiafengjuan
     * @获取SRM对应的字段
     */
    public function getOrderList($input)
    {
        $whereStr = "";$start_time=0;$end_time=0;
        $data = array();
        if (isset($input['number']) && $input['number']) {//根据采购单号查找
            $whereStr .= 'order.number like ? ';
            $data[] = '%' .$input['number']. '%';
        }
        if (isset($input['partner']) && $input['partner']) {//根据供应商名称查找
            if (!empty($whereStr))
            {
                $whereStr .= 'and ';
            }
            $whereStr .= 'partner.name like ? ';
            $data[] = '%' . $input['partner'] . '%';
        }
        if (isset($input['material_name']) && $input['material_name']) {//根据采购物料查找
            if (!empty($whereStr))
            {
                $whereStr .= 'and ';
            }
            $whereStr .= 'material.name like ? ';
            $data[] = '%' . $input['material_name'] . '%';
        }
        if (isset($input['buyer']) && $input['buyer']) {//根据采购员查找
            if (!empty($whereStr))
            {
                $whereStr .= 'and ';
            }
            $whereStr .= 'user.name like ? ';
            $data[] = '%' . $input['buyer'] . '%';
        }
        if (isset($input['starttime']) && $input['starttime']) {//获取单据开始时间
            $start_time = $input['starttime'];
        }
        if (isset($input['endtime']) && $input['endtime']) {//获取单据结束时间
            $end_time = $input['endtime'];
        }
        if($start_time>0&&$end_time>0)//根据日期范围查找
        {
            if (!empty($whereStr))
            {
                $whereStr .= 'and ';
            }
            $whereStr .= 'order.ctime >= '.$start_time;
            $whereStr .= ' and order.ctime <= '.$end_time;
        }

        if (isset($input['material_item_no']) && $input['material_item_no']) {//根据采购物料编码查找
            if (!empty($whereStr))
            {
                $whereStr .= 'and ';
            }
            $whereStr .= 'material.item_no like ? ';
            $data[] = '%' . $input['material_item_no'] . '%';
        }
           if (!empty($whereStr)) {//查询条件
            $obj_list = DB::table($this->table)
                ->leftJoin('user', 'creator_id', '=', 'user.id')
                ->leftJoin('partner','order.partner_id','=','partner.id')
                ->leftJoin('currency','currency.id','=','order.currency_id')
                ->leftJoin('plan','plan.id','=','order.plan_id')
                ->leftJoin('process_status','process_status.id','=','order.status_id')
                ->Join('_r_order_btransaction_item','order.id','=','_r_order_btransaction_item.id1')
                ->Join('btransaction_item','btransaction_item.id','=','_r_order_btransaction_item.id2')
                ->leftJoin('material','material.id','=','btransaction_item.material_id')
                ->leftJoin('tax','tax.id','=','btransaction_item.tax_id')
                ->whereRaw($whereStr, $data)
                ->select('order.number',//采购订单号
                    'order.id as order_id',//采购订单ID
                    'btransaction_item.id as btransaction_item_id',//明细ID
                    'order.quotation_id as quotation_id',//报价单ID
                    'user.name as creator',//制单人
                    'plan.code',//采购计划单号
                    'plan.id as plan_id',//采购计划ID
                    'partner.name as partner_name',//供应商
                    'partner.number as partner_number',//供应商编号
                    'btransaction_item.qty',//采购数量
                    'btransaction_item.unit_price',//单价
                    'currency.label as currency',//币制
                    'tax.cal_rate',//税率
                    'btransaction_item.tax_rate',//税种
                    'material.name as material_name',//物料
                    'material.item_no as material_item_no',//物料编码
                    'process_status.label',//状态标志
                    'order.audition_time',//审核日期
                    'order.ctime',//单据日期
                    'btransaction_item.delivery_date',//应到日期
                    'btransaction_item.remark',//备注
                    'order.place_name'//送达地址
                )
                ->get();
        }else//无查询条件
        {
            $obj_list = DB::table($this->table)
                ->leftJoin('user', 'creator_id', '=', 'user.id')
                ->leftJoin('partner','order.partner_id','=','partner.id')
                ->leftJoin('currency','currency.id','=','order.currency_id')
                ->leftJoin('plan','plan.id','=','order.plan_id')
                ->leftJoin('process_status','process_status.id','=','order.status_id')
                ->Join('_r_order_btransaction_item','order.id','=','_r_order_btransaction_item.id1')
                ->Join('btransaction_item','btransaction_item.id','=','_r_order_btransaction_item.id2')
                ->leftJoin('material','material.id','=','btransaction_item.material_id')
                ->leftJoin('tax','tax.id','=','btransaction_item.tax_id')
                ->select('order.number',//采购订单号
                    'order.id as order_id',//采购订单ID
                    'btransaction_item.id as btransaction_item_id',//明细ID
                    'order.quotation_id as quotation_id',//报价单ID
                    'user.name as creator',//制单人
                    'plan.code',//采购计划单号
                    'plan.id as plan_id',//采购计划ID
                    'partner.name as partner_name',//供应商
                    'partner.number as partner_number',//供应商编号
                    'btransaction_item.qty',//采购数量
                    'btransaction_item.unit_price',//单价
                    'currency.label as currency',//币制
                    'tax.cal_rate',//税率
                    'btransaction_item.tax_rate',//税种
                    'material.name as material_name',//物料
                    'material.item_no as material_item_no',//物料编码
                    'process_status.label',//状态标志
                    'order.audition_time',//审核日期
                    'order.ctime',//单据日期
                    'btransaction_item.delivery_date',//应到日期
                    'btransaction_item.remark',//备注
                    'order.place_name'//送达地址
                )
                ->get();
        }
        return $obj_list;
    }

    
    /**
     * @todo 业务处理
     * @param $input
     * @return array
     * @throws \App\Exceptions\ApiSapException
     */
    public function syncPurchaseOrder($input)
    {
        $ApiControl = new SapApiRecord();
        $ApiControl->checkControl($input);
        $ApiControl->store($input);
        /**
         * @todo 业务处理
         * 如果有异常,直接 TESAP('code',$params='',$data=null)
         */

        return [];
    }

    
}