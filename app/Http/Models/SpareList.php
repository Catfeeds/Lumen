<?php 
/**
 * Created by Sublime.
 * User: liming
 * Date: 18/4/9
 */
namespace App\Http\Models;//定义命名空间
use Illuminate\Support\Facades\DB;//引入DB操作类

class SpareList extends  Base
{
    public function __construct()
    {
        $this->table='ruis_spare_list';
        $this->rentpartner_table='ruis_partner';
        $this->supplier_table='ruis_partner';
        $this->procude_table='ruis_partner';       //  生产厂商
        $this->employee_table='ruis_employee';       //  员工
        $this->sign_table='ruis_device_options';       // 设备标记
        $this->status_table='ruis_device_options';       // 设备状况
        $this->spare_type_table='ruis_spare_type';       // 备件类型

        //定义表别名
        $this->aliasTable=[
            'sparelist'=>$this->table.' as sparelist',
            'rentpartner'=>$this->rentpartner_table.' as rentpartner', // 租用单位
            'supplier'=>$this->supplier_table.' as supplier',         // 供应商
            'procude'=>$this->procude_table.' as procude',         // 生产厂商
            'employee'=>$this->employee_table.' as employee',         // 员工
            'sign'=>$this->sign_table.' as sign',         // 标记
            'status'=>$this->status_table.' as status',         // 设备状况
            'sparetype'=>$this->spare_type_table.' as sparetype',         // 备件类型
        ];

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
            //代码唯一性检测
            $has=$this->isExisted([['code','=',$data['code']]]);
            if($has) TEA('8305','code');
            //补全数据
            $data['ctime']=time();
            //添加
            $order_id=DB::table($this->table)->insertGetId($data);
            if(!$order_id) TEA('802');
        }
        return $order_id;
    }



    /**
     * 添加操作
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
            //1、入库单添加
            //获取编辑数组
            $data=[
                'code'=>$input['code'],
                'name'=>$input['name'],
                'spare_type'=>$input['spare_type'], 
                'spec'=>$input['spec'], 
                'procude_partner'=>$input['procude_partner'], 
                'supplier'=>$input['supplier'], 
                'chang_circle'=>$input['chang_circle'], 
                'unit_id'=>$input['unit_id'], 
                'reduced_unit'=>$input['reduced_unit'], 
                'reduced_ratio'=>$input['reduced_ratio'], 
                'price'=>$input['price'], 
                'max_storage'=>$input['max_storage'], 
                'min_storage'=>$input['min_storage'], 
                'remark'=>$input['remark'], 
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



    /**
     * 获取列表
     * @return array  返回数组对象集合
     */
    public function getList($input)
    {
        //order  (多order的情形,需要多次调用orderBy方法即可)
        if (empty($input['order']) || empty($input['sort']))
        {
            $input['order']='desc';$input['sort']='id';
        }
        $data = [
            'sparelist.id  as   id',
            'sparelist.code  as    spare_code',
            'sparelist.name  as    spare_name',
            'sparelist.spec  as   spare_spec',
            'sparelist.id  as   spare_id',
            'sparelist.remark  as   remark',
            'supplier.id  as   supplier_id',
            'supplier.name  as   supplier_name',
            'supplier.code  as   supplier_code',
            'procude.code  as   procude_code',
            'procude.name  as   procude_name',
            'procude.id  as   procude_id',
            'sparetype.id  as   sparetype_id',
            'sparetype.name  as   sparetype_name',
            'sparetype.code  as   sparetype_code',
        ];

        $obj_list = DB::table($this->aliasTable['sparelist'])
            ->orderBy('id','asc')
            ->select($data)
            ->leftJoin($this->aliasTable['supplier'], 'sparelist.supplier', '=', 'supplier.id')
            ->leftJoin($this->aliasTable['procude'], 'sparelist.procude_partner', '=', 'procude.id')
            ->leftJoin($this->aliasTable['sparetype'], 'sparelist.spare_type', '=', 'sparetype.id')
            ->orderBy($input['sort'],$input['order'])
            ->get();
        if (!$obj_list) TEA('404');
        return $obj_list;
    }


    public  function destroy($id)
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



    public function  update($input)
    {
    	// 唯一性检测
        $has=$this->isExisted([['name','=',$input['name']],[$this->primaryKey,'<>',$input['id']]]);
        if($has) TEA('8204','name');

        $has=$this->isExisted([['code','=',$input['code']],[$this->primaryKey,'<>',$input['id']]]);
        if($has) TEA('8207','code');


         //获取编辑数组
            $data=[
                'code'=>$input['code'],
                'name'=>$input['name'],
                'spare_type'=>$input['spare_type'], 
                'spec'=>$input['spec'], 
                'procude_partner'=>$input['procude_partner'], 
                'supplier'=>$input['supplier'], 
                'chang_circle'=>$input['chang_circle'], 
                'unit_id'=>$input['unit_id'], 
                'reduced_unit'=>$input['reduced_unit'], 
                'reduced_ratio'=>$input['reduced_ratio'], 
                'price'=>$input['price'], 
                'max_storage'=>$input['max_storage'], 
                'min_storage'=>$input['min_storage'], 
                'remark'=>$input['remark'], 
            ];




        try{
            //开启事务
            DB::connection()->beginTransaction();
            $order_id = $this->save($data,$input['id']);
            if($order_id===false) TEA('804');
        }catch(\ApiException $e){
            //回滚
            DB::connection()->rollBack();
            TEA($e->getCode());
        }

        //提交事务
        DB::connection()->commit();
        return $order_id;
    }


    /**
     * 查看某条设备台账信息
     * @param $id
     * @return array
     * @author  liming 
     * @todo 
     */
    public function get($id)
    {
         $data = [
            'sparelist.id  as   id',
            'sparelist.code  as    spare_code',
            'sparelist.name  as    spare_name',
            'sparelist.spec  as   spare_spec',
            'sparelist.id  as   spare_id',
            'sparelist.remark  as   remark',
            'supplier.id  as   supplier_id',
            'supplier.name  as   supplier_name',
            'supplier.code  as   supplier_code',
            'procude.code  as   procude_code',
            'procude.name  as   procude_name',
            'procude.id  as   procude_id',
            'sparetype.id  as   sparetype_id',
            'sparetype.name  as   sparetype_name',
            'sparetype.code  as   sparetype_code',
        ];

        $obj = DB::table($this->aliasTable['sparelist'])
            ->orderBy('id','asc')
            ->select($data)
            ->leftJoin($this->aliasTable['supplier'], 'sparelist.supplier', '=', 'supplier.id')
            ->leftJoin($this->aliasTable['procude'], 'sparelist.procude_partner', '=', 'procude.id')
            ->leftJoin($this->aliasTable['sparetype'], 'sparelist.spare_type', '=', 'sparetype.id')
            ->where("sparelist.$this->primaryKey",'=',$id)
            ->first();
        if (!$obj) TEA('404');
        return $obj;
    }




    /**
     * 分页列表
     * @return array  返回数组对象集合
     */
    public function getPageList($input)
    {
       //$input['page_no']、$input['page_size   检验是否存在参数
       if (!array_key_exists('page_no',$input ) && !array_key_exists('page_size',$input )) TEA('8211','page');
        //order  (多order的情形,需要多次调用orderBy方法即可)
        if (empty($input['order']) || empty($input['sort'])) 
        {
            $input['order']='desc';$input['sort']='id';
        } 
        
           $where = $this->_search($input);
           $data = [
            'sparelist.id  as   id',
            'sparelist.code  as    spare_code',
            'sparelist.name  as    spare_name',
            'sparelist.spec  as   spare_spec',
            'sparelist.id  as   spare_id',
            'sparelist.remark  as   remark',
            'supplier.id  as   supplier_id',
            'supplier.name  as   supplier_name',
            'supplier.code  as   supplier_code',
            'procude.code  as   procude_code',
            'procude.name  as   procude_name',
            'procude.id  as   procude_id',
            'sparetype.id  as   sparetype_id',
            'sparetype.name  as   sparetype_name',
            'sparetype.code  as   sparetype_code',
        ];

        $obj_list=DB::table($this->aliasTable['sparelist'])
            ->select($data)
            ->leftJoin($this->aliasTable['supplier'], 'sparelist.supplier', '=', 'supplier.id')
            ->leftJoin($this->aliasTable['procude'], 'sparelist.procude_partner', '=', 'procude.id')
            ->leftJoin($this->aliasTable['sparetype'], 'sparelist.spare_type', '=', 'sparetype.id')
            ->where($where)
            ->offset(($input['page_no']-1)*$input['page_size'])
            ->limit($input['page_size'])
            ->orderBy($input['sort'],$input['order'])
            ->get();
        $obj_list->total_count = DB::table($this->aliasTable['sparelist'])->where($where)->count();
        if (!$obj_list) TEA('404');
        return $obj_list;
    }



    // 搜索方法
    public   function  _search($input)
    {
    	$where  =  array();
        if (isset($input['type_name']) && $input['type_name']) {//根据设备类型名称
            $where[]=['devtype.name','like','%'.$input['type_name'].'%'];
        }
    	return  $where;
    }

}