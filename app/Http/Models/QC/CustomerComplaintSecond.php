<?php
/**
 * 客诉model
 * Created by PhpStorm.
 * User: liming
 * Date: 2018-07-25
 * Time: 10:54
 */

namespace App\Http\Models\QC;
use App\Http\Models\Base;
use GuzzleHttp\Psr7\Request;
use Illuminate\Support\Facades\DB;

class CustomerComplaintSecond extends Base
{
     public function __construct()
    {
        $this->table='ruis_qc_customer_complaint_d2';

        //定义表别名
        $this->aliasTable=[
            'complainTwo'=>$this->table.' as complainTwo',
        ];

    }

    // /**
    //  * 保存数据
    //  */
    // public function save($data, $id)
    // {
    //     if ($id > 0)
    //     {
    //             try{
    //                 //开启事务
    //                 DB::connection()->beginTransaction();
    //                 $upd=DB::table($this->table)->where('id',$id)->update($data);
    //                 if($upd===false) TEA('804');
    //             }catch(\ApiException $e){
    //                 //回滚
    //                 DB::connection()->rollBack();
    //                 TEA($e->getCode());
    //             }
    //             //提交事务
    //             DB::connection()->commit();
    //             $this->pk = $id;
    //     }
    //     else
    //     {
    //         //添加
    //         $item_id=DB::table($this->table)->insertGetId($data);
    //         if(!$item_id) TEA('802');
    //         $this->pk = $item_id;
    //     }
    // }


    // /**
    //  * 保存明细数据
    //  */
    // public function saveItem($input, $order_id)
    // {
    //     foreach (json_decode($input['items'],true)  as  $key=>$item)
    //     {
    //          $item_data = [
    //                 'other_instore_id' => $order_id,
    //                 'material_id' => $item['material_id'],
    //                 'plant_id'    => $item['plant_id'],
    //                 'depot_id'    => $item['depot_id'],
    //                 'subarea_id'  => $item['subarea_id'],
    //                 'bin_id'      => $item['bin_id'],
    //                 'subarea_id'  => $item['subarea_id'],
    //                 'quantity'    => $item['quantity'],
    //                 'price'       => $item['price'],
    //                 'remark'      => $item['remark'],
    //                 'unit_id'     => $item['unit_id'],
    //                 'lock_status' => $item['lock_status'],
    //                 'amount'      => $item['price'] * $item['quantity'],
    //                 'trade_id'    => 1,    //  1 :入库
    //                 'ctime'       => time(),   //创建时间
    //                 'employee_id' => $input['employee_id'],
    //                 'indent_code' => $input['indent_code'],
    //                 'workorder_code' => $input['workorder_code'],
    //                 'own_id'         => $input['own_id'],
    //             ];

    //         $id  =  $item['id']? $item['id'] : 0;
    //         $this->save($item_data,$id);

    //         $id = $this->pk;
    //         $act_ids[] = $id;
    //     }
    //     // 获取明细
    //     $db_ids = $this->_get_ids($order_id);

    //     // 需要删除的id
    //     $del_ids = array_diff($db_ids, empty($act_ids) ? array() : $act_ids);
    //     if ($del_ids)
    //     {
    //         foreach ($del_ids as $id)  $this->destroyById($id); 
    //     }
    // }

    // /**
    //  * 获取明细id
    //  * @param int $id
    //  */
    // private function _get_ids($id)
    // {
    //     $list = $this->getLists([['other_instore_id','=',$id]], 'id');
    //     foreach ($list as $val) 
    //         $ids[] = $val;
    //     return empty($ids) ? array() : $ids;
    // }



    // /**
    //  * 获取明细list
    //  * @param array   list
    //  */
    // public function getItems($id)
    // {
    //     $list = $this->getListsByWhere([['other_instore_id','=',$id]]);
    //     return empty($list) ? array() : $list;
    // }








}