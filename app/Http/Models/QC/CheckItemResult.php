<?php
/**
 * Created by PhpStorm.
 * User: wangguangyang
 * Date: 2018/2/9
 * Time: 14:19
 */
namespace App\Http\Models\QC;
use App\Http\Models\Base;
use Illuminate\Support\Facades\DB;
class CheckItemResult extends Base
{
    public function __construct()
    {
        $this->table='ruis_qc_check_item_result';
    }


    /**
     * 保存数据
     */
    public function save($data, $id)
    {
        if ($id > 0)
        {
                try{
                    //开启事务
                    DB::connection()->beginTransaction();
                    $upd=DB::table($this->table)->where('id',$id)->update($data);
                    if($upd===false) TEA('804');
                }catch(\ApiException $e){
                    //回滚
                    DB::connection()->rollBack();
                    TEA($e->getCode());
                }
                //提交事务
                DB::connection()->commit();
                $this->pk = $id;
        }
        else
        {
            //添加
            $item_id=DB::table($this->table)->insertGetId($data);
            if(!$item_id) TEA('802');
            $this->pk = $item_id;
        }
    }

    /**
     * @message 保存检验结果
     * @author  liming
     * @time    年 月 日
     */    
    public function add($input)
    {
        $check_ids =  json_decode($input['check_choose']);
        $items =  json_decode($input['check_item']);
        foreach ($check_ids as $check_id) 
        {
            $check  = $check_id->check_id;
            foreach ($items as  $item) 
            {

                $item_data  = [
                     'qc_check_id' => $check,
                     'qc_template' =>$item->template_id,
                     'template_code' =>$item->template_code,
                     'value' =>$item->value,
                   ];

                $id  = $item->item_id?$item->item_id : 0;
                $this->save($item_data,$id);
                $id = $this->pk;
                $act_ids[] = $id;
            }
            // 获取明细
            $db_ids = $this->_get_ids($check);

            // 需要删除的id
            $del_ids = array_diff($db_ids, empty($act_ids) ? array() : $act_ids);
            if ($del_ids)
            {
                foreach ($del_ids as $id)  $this->destroyById($id); 
            }
        }
    }


    //编辑检验项结果
    public function edit($input)
    {
        try{
            //开启事务
            DB::connection()->beginTransaction();
            foreach (json_decode($input['check_item']) as $item){
                DB::table($this->table)
                    ->where('id','=',$item->item_id)
                    ->update(
                        [
                            'value' =>$item->value,
                        ]
                    );
            }
        }catch(\ApiException $e){
            //回滚
            DB::connection()->rollBack();
            TEA($e->getCode());
        }
        //提交事务
        DB::connection()->commit();
        return true;
    }

    //查看检验项结果
    public function view($check_id)
    {
        $select = DB::table($this->table)->select('*')->where('qc_check_id','=',$check_id)->get();
        return $select;
    }


    /**
     * 获取明细id
     * @param int $id
     */
    private function _get_ids($id)
    {
        $list = $this->getLists([['qc_check_id','=',$id]], 'id');
        foreach ($list as $val) 
            $ids[] = $val;
        return empty($ids) ? array() : $ids;
    }


    /**
     * 获取明细list
     * @param array   list
     */
    public function getItems($id)
    {
        $list = $this->getListsByWhere([['qc_check_id','=',$id]]);
        return empty($list) ? array() : $list;
    }

}