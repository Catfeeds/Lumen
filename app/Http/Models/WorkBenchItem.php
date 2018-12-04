<?php
/**
 * Created by PhpStorm.
 * User: 李明
 * Date: 2018/9/6
 * Time: 9:48
 */

namespace App\Http\Models;
use Illuminate\Support\Facades\DB;


class WorkBenchItem extends  Base
{
    public function __construct()
    {
        parent::__construct();
        $this->table = config('alias.rwbdi');

    }

    /**
     * @param $data
     * @param $id
     */
    public function save ($data, $id)
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
     * @param $input
     * @param $bench_id
     */
    public function saveItem($input, $bench_id)
    {
        foreach (json_decode($input['items'],true)  as  $key=>$item)
        {
            $item_data = [
                'workbench_id' => $bench_id,
                'device_id' => $item['device_id'],
            ];
            $id  =  $item['id']? $item['id'] : 0;
            $this->save($item_data,$id);

            $id = $this->pk;
            $act_ids[] = $id;
        }
        // 获取明细
        $db_ids = $this->_get_ids($bench_id);

        // 需要删除的id
        $del_ids = array_diff($db_ids, empty($act_ids) ? array() : $act_ids);
        if ($del_ids)
        {
            foreach ($del_ids as $id)  $this->destroyById($id);
        }
    }

    /**
     * @param $id
     * @return array
     */
    private function _get_ids($id)
    {
        $list = $this->getLists([['workbench_id','=',$id]], 'id');
        foreach ($list as $val)
            $ids[] = $val;
        return empty($ids) ? array() : $ids;
    }

    /**
     * @param $id
     * @return array
     */
    public function getItems($id)
    {
        $list = $this->getListsByWhere([['workbench_id','=',$id]]);
        return empty($list) ? array() : $list;
    }
}