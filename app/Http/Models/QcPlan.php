<?php 
/**
 * Created by Sublime.
 * User: liming
 * Date: 18/8/8
 */
namespace App\Http\Models;//定义命名空间
use Illuminate\Support\Facades\DB;//引入DB操作类

class QcPlan extends  Base
{
    public function __construct()
    {
        $this->table='ruis_qc_plan_list';
        $this->partner_table='ruis_partner';
        $this->material_table='ruis_material';


        //定义表别名
        $this->aliasTable=[
            'qcplan'=>$this->table.' as qcplan',
            'partner'=>$this->partner_table.' as partner',
            'material'=>$this->material_table.' as material',


        ];

    }

    /**
     * 分页列表
     * @return array  返回数组对象集合
     */
    public function getPageList($input)
    {
       //$input['page_no']、$input['page_size   检验是否存在参数
       if (!array_key_exists('page_no',$input ) && !array_key_exists('page_size',$input )) TEA('6211','page');
        //order  (多order的情形,需要多次调用orderBy方法即可)
        if (empty($input['order']) || empty($input['sort'])) 
        {
            $input['order']='desc';$input['sort']='id';
        } 

          $where = $this->_search($input);
          $obj_list=DB::table($this->aliasTable['qcplan'])
            ->select('qcplan.*','partner.name  as  partner_name','material.name  as  material_name')
            ->leftJoin($this->aliasTable['partner'], 'qcplan.supplier', '=', 'partner.id')
            ->leftJoin($this->aliasTable['material'], 'qcplan.material', '=', 'material.id')
            ->where($where)
            ->offset(($input['page_no']-1)*$input['page_size'])
            ->limit($input['page_size'])
            ->orderBy($input['sort'],$input['order'])
            ->get();
        $obj_list->total_count = DB::table($this->aliasTable['qcplan'])->where($where)->count();
        return $obj_list;
    }


    /**
     * 添加操作
     * @param $input array  input数组
     * @return int         返回插入表之后返回的主键值
     * @author liming
     */
    public function add($input)
    {
        //代码唯一性检测
        $has=$this->isExisted([['code','=',$input['code']]]);
        if($has) TEA('8207','code');
    
        //获取添加数组,此处一定要严谨一些,否则前端传递额外字段将导致报错,甚至攻击
        $data=[
            'code'=>$input['code'],
            'supplier'=>$input['supplier'],
            'material'=>$input['material'],
            'qty'=>$input['qty'],
            'arrive_time'=>$input['arrive_time'],
            'test_time'=>$input['test_time'],
            'lot'=>$input['lot'],
            'remark'=>$input['remark'],
        ];
        //添加
        $insert_id=DB::table($this->table)->insertGetId($data);
        if(!$insert_id) TEA('802');
        return  $insert_id;
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
     * 修改
     * @param $input   array   input数组
     * @throws \Exception
     * @author    liming
     */
    public function update($input)
    {
      //编码唯一性检测
        $has=$this->isExisted([['code','=',$input['code']],[$this->primaryKey,'<>',$input['id']]]);
        if($has) TEA('6204','code');

        //获取编辑数组
        $data=[
            'code'=>$input['code'],
            'supplier'=>$input['supplier'],
            'material'=>$input['material'],
            'qty'=>$input['qty'],
            'arrive_time'=>$input['arrive_time'],
            'test_time'=>$input['test_time'],
            'lot'=>$input['lot'],
            'remark'=>$input['remark'],
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
     * 查看某条
     * @param $id
     * @return array
     * @author  liming 
     * @todo 
     */
    public function get($id)
    {
        $obj = DB::table($this->aliasTable['qcplan'])
            ->select('qcplan.*','partner.name  as  partner_name','material.name  as  material_name')
            ->leftJoin($this->aliasTable['partner'], 'qcplan.supplier', '=', 'partner.id')
            ->leftJoin($this->aliasTable['material'], 'qcplan.material', '=', 'material.id')
            ->where("qcplan.$this->primaryKey",'=',$id)
            ->first();

        if (!$obj) TEA('404');
        return $obj;
    }

    /**
     * 搜索
     */
    private function _search($input)
    {
        $where = array();
        if (isset($input['code']) && $input['code']) {//根据编号查找
            $where[]=['qcplan.code','like','%'.$input['code'].'%'];
        }

        if (isset($input['arrive_start_time']) && $input['arrive_start_time']) {//根据预计到货时间
            $where[]=['qcplan.arrive_time','>=',strtotime($input['arrive_start_time'])];
        }
        if (isset($input['arrive_end_time']) && $input['arrive_end_time']) {//根据预计到货时间
            $where[]=['qcplan.arrive_time','<=', strtotime($input['arrive_end_time'])];
        }

        if (isset($input['test_start_time']) && $input['test_start_time']) {//根据预计到货时间
            $where[]=['qcplan.test_time','>=',strtotime($input['test_start_time'])];
        }
        if (isset($input['test_end_time']) && $input['test_end_time']) {//根据预计到货时间
            $where[]=['qcplan.test_time','<=', strtotime($input['test_end_time'])];
        }
        return $where;
    }

}