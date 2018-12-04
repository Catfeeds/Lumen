<?php
namespace App\Http\Models;

use Illuminate\Support\Facades\DB;
use App\Libraries\Soap;

class OffcutWeright extends Base
{
    public function __construct()
    {
        $this->table='ruis_sap_weight';
    }

//endregion
    /**
     * 保存数据
     */
    public function save($data,$id=0)
    {

        if ($id>0)
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
                $order_id   = $id;

        }
        else
        {
            //代码唯一性检测
            $has=$this->isExisted([['code','=',$data['code']]]);
            if($has) TEA('8305','code');
            //添加
            $order_id=DB::table($this->table)->insertGetId($data);
            if(!$order_id) TEA('802');
        }
        return $order_id;
    }

//region store
    /**
     * 新增
     * @param $input
     * @return mixed
     * @throws \App\Exceptions\ApiException
     */
    public function store($input)
    {
        try {
              //开启事务
              DB::connection()->beginTransaction();
              if(empty($input['MATNR'])) TEA('703','MATNR');
              if(empty($input['MENGE'])) TEA('703','MENGE');
              if(empty($input['factory_id'])) TEA('703','factory_id');
              if ($input['factory_id'] < 1) TEA('703','factory_id');
              $timeStr = date('YmdHis');
              $temp_code  = 'CZ4'. $timeStr . rand(100, 999);
              //1、入库单添加
              //获取编辑数组
              $data=[
                  'code' => $temp_code,
                  'MENGE' => isset($input['MENGE'])?$input['MENGE']:'',//数量
                  'MATNR' => $input['MATNR'],//边角料编码
                  'ZDATE' => isset($input['ZDATE'])?$input['ZDATE']:date('Ymd'),//称重日期
                  'remark' => isset($input['remark'])?$input['remark']:'',
                  'ctime' => time(),
                  'mtime' => time(),
                  'factory_id' =>isset($input['factory_id'])?$input['factory_id']:'',
                  'from' => 1,                                  //系统来源
                  'status' => 1,
                  'creator_id' =>isset($input['creator_id'])?$input['creator_id']:'' 
              ];
              $insert_id = $this->save($data);
              if(!$insert_id) TEA('802');

        } catch (\ApiException $e) {
            //回滚
            DB::connection()->rollBack();
            TEA($e->getCode());
        }
        DB::connection()->commit();
        return $insert_id;
    }
//endregion


    /**
     * 分页列表
     * @return array  返回数组对象集合
     */
    public function getPageList($input)
    {
        if (!array_key_exists('page_no',$input ) && !array_key_exists('page_size',$input )) TEA('8010','page');
        //order  (多order的情形,需要多次调用orderBy方法即可)
        if (empty($input['order']) || empty($input['sort']))
        {
            $input['order']='asc';$input['sort']='id';
        }
        $where = $this->_search($input);
        $obj_list = DB::table($this->table.' as rsw')
            ->leftJoin('ruis_factory as factory', 'factory.id', '=', 'rsw.factory_id')
            ->select('rsw.*','factory.name  as  factory_name','factory.code  as  factory_code','factory.id  as  factory_id')
            ->where($where)
            ->offset(($input['page_no']-1)*$input['page_size'])
            ->limit($input['page_size'])
            ->orderBy($input['sort'],$input['order'])
            ->get();

        $obj_list->total_count = DB::table($this->table)->where($where)->count();
        return $obj_list;
    }


    /**
     * 获取列表
     * @return array  返回数组对象集合
     */
    public function getOffList($input)
    {
        //order  (多order的情形,需要多次调用orderBy方法即可)
        if (empty($input['order']) || empty($input['sort']))
        {
            $input['order']='desc';$input['sort']='id';
        }
        $obj_list = DB::table($this->table.' as rsw')
            ->leftJoin('ruis_factory as factory', 'factory.id', '=', 'rsw.factory_id')
            ->select('rsw.*','factory.name  as  factory_name','factory.code  as  factory_code','factory.id  as  factory_id')
            ->where('rsw.status','<',2)
            ->orderBy($input['sort'],$input['order'])
            ->get();
        if (!$obj_list) TEA('404');
        return $obj_list;
    }


    /**
     * 删除列表
     * @param $id
     * @throws \Exception
     * @author
     */
    public function destroy($id)
    {

        //该分组的使用状况,使用的话,则禁止删除[暂时略][是否使用由具体业务场景判断]
        try{
            //开启事务
            DB::connection()->beginTransaction();
            $num=$this->destroyById($id);
            if($num===false) TEA('803');
            if(empty($num))  TEA('404');
        }catch(\ApiException $e){
            //回滚
            DB::connection()->rollBack();
            TEA($e->getCode());
        }
        //提交事务
        DB::connection()->commit();
    }

    /**
     * 查看某条信息
     * @param $id
     * @return array
     * @author  liming
     * @todo
     */
    public function get($id)
    {
        $obj = DB::table($this->table.' as rsw')
            ->leftJoin('ruis_factory as factory', 'factory.id', '=', 'rsw.factory_id')
            ->select('rsw.*','factory.name  as  factory_name','factory.code  as  factory_code','factory.id  as  factory_id')
            ->where("rsw.id",'=',$id)->first();
        if (!$obj) TEA('404');
        return $obj;
    }
    /**
     * 修改
     * @param $input   array   input数组
     * @throws \Exception
     * @author    liming
     */
    public function update($input)
    {
        if(empty($input['MENGE'])) TEA('703','MENGE');
        //获取编辑数组
        $data=[
            'mtime' => time(),
            'MENGE' =>$input['MENGE'],//数量
        ];
        try{
            //开启事务
            DB::connection()->beginTransaction();
            $upd=DB::table($this->table)->where('id',$input['id'])->update($data);
            if($upd===false) TEA('804');
        }catch(\ApiException $e){
            //回滚
            DB::connection()->rollBack();
            TEA($e->getCode());
        }

        //提交事务
        DB::connection()->commit();

    }


    /**
     * @message  推送领料结果 给sap
     *
     * @param $id
     * @return mixed
     * @throws \App\Exceptions\ApiException
     * @author  liming
     * @time    2018年 9月 13日
     */
    public function pushOffcutWeright($ids)
    {
        if (count($ids)>0)
        {
          foreach ($ids as  $id) 
          {
            $result = [];
            $objs = DB::table($this->table.' as rsw')
                 ->leftJoin('ruis_factory as factory', 'factory.id', '=', 'rsw.factory_id')
                 ->select('rsw.*','factory.code  as  factory_code')
                 ->where('rsw.id', $id) 
                 ->get();
            foreach ($objs as $key => $value) {
                $temp_data = [
                        'ZDATE' => $value->ZDATE,
                        'ZFLAG' => $value->ZFLAG,  //边角料标识  启用
                        'MENGE' => $value->MENGE,
                        'MEINS' => $value->MEINS,
                        'MATNR' => $value->MATNR,
                        'WERKS' => $value->factory_code,
                ];
                $result[] = $temp_data;
            }
            $response = Soap::doRequest($result, 'INT_PP000300016', '0003');       //接口名称     //系统序号 
          }
        }
        return $response;
    }


    /**
     * 更改状态
     *
     * 1->填完申请单，未推送或推送失败
     * 2->推送成功（完成申请)
     * 3->完成（已填写实收数量）
     *
     * @param $id
     * @param $status
     */
    public function updateStatus($id, $status)
    {
        DB::table($this->table)->where('id', $id)->update(['status' => $status]);
    }


    /**
     * 搜索
     */
    private function _search($input)
    {
        $where = array();
        // if (isset($input['type_code']) && $input['type_code']) {//根据类型编码
        //     $where[]=['outZy.type_code','=',$input['type_code']];
        // }
        // if (isset($input['picking_id']) && $input['picking_id']) {//根据委外订单
        //     $where[]=['outZy.out_picking_id','=',$input['picking_id']];
        // }
        return $where;
    }

}