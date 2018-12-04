<?php 
/**
 * Created by Sublime.
 * User: liming
 */
namespace App\Http\Models;//定义命名空间
use Illuminate\Support\Facades\DB;//引入DB操作类
use App\Exceptions\ApiException;


class UpkeeExpreience extends  Base
{
    public function __construct()
    {
        $this->table='ruis_upkee_experience';
        $this->device_table='ruis_device_list';
        $this->item_table='ruis_upkee_spare';
        $this->device_type_table='ruis_device_type';
        $this->fault_type_table='ruis_fault_type';
        $this->options_table='ruis_device_options';
        $this->spare_table='ruis_spare_list';




        //定义表别名
        $this->aliasTable=[
            'experience'=>$this->table.' as experience',
            'item'=>$this->item_table.' as item',
            'device'=>$this->device_table.' as device',
            'devicetype'=>$this->device_type_table.' as devicetype',
            'faultype'=>$this->fault_type_table.' as faultype',
            'repairdegree'=>$this->options_table.' as repairdegree',
            'upkeedegree'=>$this->options_table.' as upkeedegree',
            'spare'=>$this->spare_table.' as spare',
           
        ];

        if(empty($this->upkeeitem)) $this->upkeeitem =new UpkeeItem();

    }

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
            //补全数据
            $data['createtime']=time();
            //添加
            $order_id=DB::table($this->table)->insertGetId($data);
            if(!$order_id) TEA('802');
        }
        return $order_id;
    }


    /**
     * 编辑
     * @param $input array  input数组
     * @return int         返回插入表之后返回的主键值
     * @author liming
     */
    public function update($input)
    {
        //  判断单据是否审核
        $order_id   = $input['id'];
        try {
            //开启事务
            DB::connection()->beginTransaction();

            //1、入库单修改
            //获取编辑数组
            $data=[
                'device_type'=>$input['device_type'],
                'experience_type'=>$input['experience_type'],
                'device_id'=>$input['device_id'],
                'sort'=>$input['sort'],
                'upkee_require'=>$input['upkee_require'],
                'upkee_degree'=>$input['upkee_degree'],
                'upkee_remark'=>$input['upkee_remark'],
                'fault_type'=>$input['fault_type'],
                'repair_degree'=>$input['repair_degree'],
                'fault_describe'=>$input['fault_describe'],
                'repair_remark'=>$input['repair_remark'],
            ];
            $order_id = $this->save($data,$order_id);
            if(!$order_id) TEA('804');

            //2、经验设备分类明细添加
            $this->upkeeitem->saveItem($input,$order_id);

        } catch (\ApiException $e) {
            //回滚
            DB::connection()->rollBack();
            TEA($e->getCode());
        }
        DB::connection()->commit();
        return $order_id;
    }



    /**
     * 添加操作,添加
     * @param $input array  input数组
     * @return int         返回插入表之后返回的主键值
     * @author liming
     */
    public function add($input)
    {
        $input['creator_id'] = (!empty(session('administrator')->admin_id)) ? session('administrator')->admin_id : 0;
        $creator_id=$input['creator_id'];
        $input['company_id'] = (!empty(session('administrator')->company_id)) ? session('administrator')->company_id: 0;
        $company_id=$input['company_id'];
        $input['factory_id'] = (!empty(session('administrator')->factory_id)) ? session('administrator')->factory_id : 0;
        $factory_id=$input['factory_id'];

        try {
            //开启事务
            DB::connection()->beginTransaction();
            //1、经验添加
            //获取编辑数组
            $data=[
                'device_type'=>$input['device_type'],
                'experience_type'=>$input['experience_type'],
                'device_id'=>$input['device_id'],
                'sort'=>$input['sort'],
                'upkee_require'=>$input['upkee_require'],
                'upkee_degree'=>$input['upkee_degree'],
                'upkee_remark'=>$input['upkee_remark'],
                'fault_type'=>$input['fault_type'],
                'repair_degree'=>$input['repair_degree'],
                'fault_describe'=>$input['fault_describe'],
                'repair_remark'=>$input['repair_remark'],
            ];
            $insert_id = $this->save($data);
            if(!$insert_id) TEA('802');

            //2、明细添加
            $this->upkeeitem->saveItem($input, $insert_id);

        } catch (\ApiException $e) {
            //回滚
            DB::connection()->rollBack();
            TEA($e->getCode());
        }
        DB::connection()->commit();
        return $insert_id;
    }

    /**
     * 删除
     * @param $id
     * @throws \Exception
     * @author liming
     */
    public function destroy($id)
    {
        try{
             //开启事务
             DB::connection()->beginTransaction();

             //1、删除入库单之前先删除明细
             $res = DB::table($this->item_table)->where('experience_id','=',$id)->delete();

             //2、删除入库单
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
     * 获取列表
     * @return array  返回数组对象集合
     */
    public function getPageList($input)
    {
        if (!array_key_exists('page_no',$input ) && !array_key_exists('page_size',$input )) TEA('8211','page');
        //order  (多order的情形,需要多次调用orderBy方法即可)
        if (empty($input['order']) || empty($input['sort']))
        {
            $input['order']='desc';$input['sort']='id';
        }
        $where = $this->_search($input);
        $builder = DB::table($this->aliasTable['experience'])
                ->select(
                'experience.id',
                'experience.createtime',
                'experience.experience_type',
                'experience.sort',
                'experience.upkee_remark',
                'experience.upkee_require',
                'experience.upkee_degree',
                'experience.fault_type',
                'experience.fault_describe',
                'device.id   as    device_id',
                'device.name   as    device_name',
                'device.code   as    device_code',
                'devicetype.id   as    devicetype_id',
                'devicetype.name   as    devicetype_name',
                'devicetype.code   as    devicetype_code',
                'faultype.id   as    faultype_id',
                'faultype.name   as    faultype_name',
                'faultype.code   as    faultype_code',
                'repairdegree.id     as    repairdegree_id',
                'repairdegree.code   as    repairdegree_code',
                'repairdegree.name   as    repairdegree_name',
                'upkeedegree.id     as    upkeedegree_id',
                'upkeedegree.code   as    upkeedegree_code',
                'upkeedegree.name   as    upkeedegree_name',
                'experience.repair_remark'
                )
            ->where($where)
            ->leftJoin($this->aliasTable['device'], 'experience.device_id', '=', 'device.id')
            ->leftJoin($this->aliasTable['devicetype'], 'experience.device_type', '=', 'devicetype.id')
            ->leftJoin($this->aliasTable['faultype'], 'experience.fault_type', '=', 'faultype.id')
            ->leftJoin($this->aliasTable['repairdegree'], 'experience.repair_degree', '=', 'repairdegree.id')
            ->leftJoin($this->aliasTable['upkeedegree'], 'experience.upkee_degree', '=', 'upkeedegree.id')
            ->offset(($input['page_no'] - 1) * $input['page_size'])
            ->limit($input['page_size'])
            ->orderBy($input['sort'],$input['order']);
            $obj_list = $builder->get();
            foreach ($obj_list as $obj)
            {
                $obj->degree = $obj->upkeedegree_name .  $obj->repairdegree_name;
                $obj->describe = $obj->fault_describe .  $obj->upkee_require;
                $obj->createdate  = date("Y-m-d H:i:s",$obj->createtime);
                $group_list = $this->getItemsByOrder($obj->id);
                $obj->groups = $group_list;
            }
            $obj_list->total_count = DB::table($this->aliasTable['experience'])->where($where)->count();
            return $obj_list;
    }

    /**
     * 获取
     * @return array  返回数组对象集合
     */
    public function getOne($id)
    {
        $builder = DB::table($this->aliasTable['experience'])
            ->select(
                'experience.id',
                'experience.createtime',
                'experience.experience_type',
                'experience.sort',
                'experience.upkee_remark',
                'experience.upkee_require',
                'experience.upkee_degree',
                'experience.fault_type',
                'experience.fault_describe',
                'device.id   as    device_id',
                'device.name   as    device_name',
                'device.code   as    device_code',
                'devicetype.id   as    devicetype_id',
                'devicetype.name   as    devicetype_name',
                'devicetype.code   as    devicetype_code',
                'faultype.id   as    faultype_id',
                'faultype.name   as    faultype_name',
                'faultype.code   as    faultype_code',
                'repairdegree.id     as    repairdegree_id',
                'repairdegree.code   as    repairdegree_code',
                'repairdegree.name   as    repairdegree_name',
                'upkeedegree.id     as    upkeedegree_id',
                'upkeedegree.code   as    upkeedegree_code',
                'upkeedegree.name   as    upkeedegree_name',
                'experience.repair_remark'
                )
            ->leftJoin($this->aliasTable['device'], 'experience.device_id', '=', 'device.id')
            ->leftJoin($this->aliasTable['devicetype'], 'experience.device_type', '=', 'devicetype.id')
            ->leftJoin($this->aliasTable['faultype'], 'experience.fault_type', '=', 'faultype.id')
            ->leftJoin($this->aliasTable['repairdegree'], 'experience.repair_degree', '=', 'repairdegree.id')
            ->leftJoin($this->aliasTable['upkeedegree'], 'experience.upkee_degree', '=', 'upkeedegree.id')
            ->where('experience.id', $id);
        $obj_list = $builder->get();
        foreach ($obj_list as $obj)
        {
            $obj->createdate  = date("Y-m-d H:i:s",$obj->createtime);
            $group_list = $this->getItemsByOrder($obj->id);
            $obj->groups = $group_list;
        }
        return $obj_list;
    }

    /**
     * 获取明细数据
     * @param $id
     * @return mixed
     * @author liming
     */
    public function getItemsByOrder($id)
    {
        //获取列表
        $obj_list = DB::table($this->aliasTable['item'])
            ->select('item.id',
             'spare.id   as       spare_id',
             'spare.name    as    spare_name',
             'spare.code    as    spare_code',
             'spare.spec    as    spare_spec',
             'item.experience_id  as experience_id'
             )
            ->leftJoin($this->aliasTable['spare'], 'item.spare_id', '=', 'spare.id')
            ->where('item.experience_id', $id)
            ->orderBy('item.id', 'asc')->get();

        return $obj_list;
    }

    /**
     * 搜索
     */
    private function _search($input)
    {
        $where = array();
        if (isset($input['device_type']) && $input['device_type']) {
            $where[]=['experience.device_type','=',$input['device_type']];
        }
        if (isset($input['experience_type']) && $input['experience_type'] != '') {
            $where[]=['experience.experience_type','=',$input['experience_type']];
        }
        if (isset($input['fault_type']) && $input['fault_type']) {
            $where[]=['experience.fault_type','=',$input['fault_type']];
        }
        return $where;
    }
}