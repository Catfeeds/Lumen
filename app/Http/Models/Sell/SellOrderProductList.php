<?php
/**
 * Created by PhpStorm.
 * User: haoziye
 * Date: 2018/4/1
 * Time: 上午9:35
 */
namespace App\Http\Models\Sell;

use App\Http\Models\Base;
use Illuminate\Support\Facades\DB;

class SellOrderProductList extends Base{

    public function __construct()
    {
        parent::__construct();
        if(empty($this->table)) $this->table = config('alias.rsop');
    }

//region 检

    /**
     * 检查产品数据
     * @param $input
     */
    public function checkProductList(&$input){
        if (!isset($input['productList']) || !is_json($input['productList'])) TEA('700', 'productList');
        $input['productList'] = json_decode($input['productList'], true);
        $input['input_ref_arr_productList'] = [];
        foreach ($input['productList'] as $key => $value) {
            if (trim($value['material_id']) === '') unset($input['productList'][$key]);
            $input['input_ref_arr_productList'][$value['material_id']] = $value;
            $has = $this->isExisted([['id', '=', $value['material_id']]], config('alias.rm'));
            if (!$has) TEA('701', 'productList');
            if(empty($value['code'])) TEA('700','code');
            if(empty($value['name'])) TEA('700','name');
            if(empty($value['num']) || !is_numeric($value['num'])) TEA('700','num');
            if(empty($value['end_time'])) TEA('700','end_time');
            if(!isset($value['comment'])) TEA('700','comment');
            if(empty($value['unit_id'])) TEA('700','unit_id');
        }
    }

//endregion
//region 改

    /**
     *
     * @param $input
     */
    public function save($productList,$sellorder_id){
        //1.获取数据库中已经添加产品
        $dbProductList = DB::table($this->table)->where('sell_order_id', $sellorder_id)->get();
        $dbProductList = obj2array($dbProductList);
        $db_ref_arr = [];
        foreach ($dbProductList as $k=>$v){
            if(trim($v['material_id'])) unset($productList[$k]);
            $db_ref_arr[$v['material_id']] = $v;
        }
        $db_ids = array_keys($db_ref_arr);
        //2.获取前端传递的产品
        $input_ref_arr = $productList;
        $input_ids = array_keys($input_ref_arr);
        //3.通过颠倒位置的差集获取改动情况
        $set = get_array_diff_intersect($input_ids, $db_ids);
        //4.要添加的
        if (!empty($set['add_set'])) {
            $data = [];
            foreach ($set['add_set'] as $k => $v) {
                if (empty($v)) continue;
                $data[] = [
                    'sell_order_id' => $sellorder_id,
                    'material_id' => $v,
                    'code' => $input_ref_arr[$v]['code'],
                    'num'=>$input_ref_arr[$v]['num'],
                    'end_time'=>strtotime($input_ref_arr[$v]['end_time']),
                    'name'=>$input_ref_arr[$v]['name'],
                    'unit_id'=>$input_ref_arr[$v]['unit_id'],
                    'comment'=>$input_ref_arr[$v]['comment'],
                ];
            }
            $res = DB::table($this->table)->insert($data);
            if (!$res) TEA('802');
        }
        //5.要删除的
        if (!empty($set['del_set'])) {
            foreach ($set['del_set'] as $k => $v) {
                if (empty($v)) continue;
                $res = DB::table($this->table)->where([['sell_order_id', '=', $sellorder_id], ['material_id', '=', $v]])->delete();
                if (!$res) TEA('803');
            }
        }
        //6.可能要编辑的
        if (!empty($set['common_set'])) {
            foreach ($set['common_set'] as $k => $v) {
                if (empty($v)) continue;
                $needChange = [];
                if($input_ref_arr[$v]['code'] != $db_ref_arr[$v]['code']) $needChange['code'] = $input_ref_arr[$v]['code'];
                if($input_ref_arr[$v]['num'] != $db_ref_arr[$v]['num']) $needChange['num'] = $input_ref_arr[$v]['num'];
                if($input_ref_arr[$v]['end_time'] != strtotime($db_ref_arr[$v]['end_time'])) $needChange['end_time'] = strtotime($input_ref_arr[$v]['end_time']);
                if($input_ref_arr[$v]['name'] != $db_ref_arr[$v]['name']) $needChange['name'] = $input_ref_arr[$v]['name'];
                if($input_ref_arr[$v]['unit_id'] != $db_ref_arr[$v]['unit_id']) $needChange['unit_id'] = $input_ref_arr[$v]['unit_id'];
                if($input_ref_arr[$v]['comment'] != $db_ref_arr[$v]['comment']) $needChange['comment'] = $input_ref_arr[$v]['comment'];
                if(!empty($needChange)){
                    $res = DB::table($this->table)
                        ->where([['sell_order_id','=',$sellorder_id],['material_id','=',$v]])
                        ->update($needChange);
                    if ($res === false) TEA('804');
                }
            }
        }
    }

    /**
     * 获取销售订单产品列表
     * @param $sellOrderId
     * @return mixed
     */
    public function getSellOrderProductList($sellOrderId){
        $field = [
            'rsop.*',
            'rsop.code as item_no',
            'uu.unit_text',
            'uu.iso_code',
        ];
        $obj_list = DB::table($this->table.' as rsop')->select($field)
            ->leftJoin(config('alias.uu').' as uu','uu.id','rsop.unit_id')
            ->where('rsop.sell_order_id',$sellOrderId)->get();
        foreach ($obj_list as $k=>&$v){
            $v->end_time = date('Y-m-d H:i:s',$v->end_time);
        }
        return $obj_list;
    }

//endregion
}