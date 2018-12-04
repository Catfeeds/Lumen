<?php
/**
 * Created by PhpStorm.
 * User: ruiyanchao
 * Date: 2018/1/18
 * Time: 下午1:16
 */
namespace App\Http\Models;//定义命名空间
use Illuminate\Support\Facades\DB;
use App\Http\Models\Account\Admin;

/**
 * BOM操作类
 * @author  rick
 * @time    2018年01月18日13:17:35
 */
class EmployeePosition extends Base
{

    /**
     * 前端传递的api主键名称
     * @var string
     */
    public $apiPrimaryKey = 'employee_position_id';

    public function __construct()
    {
        parent::__construct();
        $this->table = config('alias.rep');
    }


    //region 查
    /**
     * 获取岗位列表
     * @param $input
     * @return mixed
     */
    public function getEmployeePositionList($input)
    {
        !empty($input['name']) &&  $where[]=['name','like','%'.$input['name'].'%'];  //名称
        $builder = DB::table($this->table)
            ->select('id as employee_position_id',
                'name',
                'abbreviation',
                'description')
            ->offset(($input['page_no']-1)*$input['page_size'])
            ->limit($input['page_size']);

        if (!empty($where)) $builder->where($where);
        //order  (多order的情形,需要多次调用orderBy方法即可)
        if (!empty($input['order']) && !empty($input['sort'])) $builder->orderBy( $input['sort'], $input['order']);
        //get获取接口
        $obj_list = $builder->get();
        //总共有多少条记录
        $count_builder= DB::table($this->table);
        if (!empty($where)) $count_builder->where($where);
        $input['total_records']=$count_builder->count();
        return $obj_list;
    }

    /**
     * 查看详情
     * @param $id  int  主键id
     * @return object   返回的是一个对象
     * @author  rick
     */
    public function get($id)
    {
        $obj=$this->getRecordById($id,['id','id as '.$this->apiPrimaryKey,'name','abbreviation','description']);
        if(!$obj) TEA('404');
        return $obj;
    }

    /**
     * 获取职位关联的功能
     * @param $position_id
     */
    public function getPositionRole($position_id){
        $obj_list = DB::table(config('alias.repr').' as repr')->select('rrr.id as role_id','rrr.name')
            ->leftJoin(config('alias.rrr').' as rrr','rrr.id','repr.role_id')
            ->where('repr.position_id',$position_id)
            ->get();
        return $obj_list;
    }

    //endregion


    //region 增
    public function add($input)
    {
        if(empty($input['name'])) TEA('700','name');
        //获取入库数组
        $data = [
            'abbreviation'=>$input['abbreviation'],//bom编码
            'name'=>$input['name'],//名称
            'description'=>$input['description'],
        ];
        //入库
        $insert_id = DB::table($this->table)->insertGetId($data);
        if (!$insert_id) TEA('802');
        return $insert_id;
    }
    //endregion


    //region 删
    public function destroy($id)
    {

        //该分类使用已经使用了,使用的话,则禁止删除
        $has=$this->isExisted([['position_id','=',$id]],config('alias.re'));
        if($has) TEA('2300');

        $num=$this->destroyById($id);
        if($num===false) TEA('803');
        if(empty($num))  TEA('404');
    }
    //endregion

    //region  改
    public function update($input)
    {
        if(empty($input['name'])) TEA('700','name');
        //获取入库数组
        $data = [
            //'code'=>$input['code'],//bom编码
            'name'=>$input['name'],//名称
            'abbreviation'=>$input['abbreviation'],
            'description'=>$input['description'],
        ];

        //入库
        $upd= DB::table($this->table)->where($this->primaryKey,$input[$this->apiPrimaryKey])->update($data);
        if($upd===false) TEA('806');
    }

    /**
     * 更新职位关联的角色（功能集合）
     * @param $input
     */
    public function positionToRole($input){
        $db_roles = DB::table(config('alias.repr'))->where('position_id',$input['position_id'])->pluck('role_id');
        $db_roles = obj2array($db_roles);
        $input_roles = json_decode($input['role_ids'],true);
        $set = get_array_diff_intersect($input_roles,$db_roles);
        //4.要添加的
        if(!empty($set['add_set'])){
            $add = [];
            foreach ($set['add_set'] as $k=>$v){
                if(empty($v)) continue;
                $add[] = [
                    'position_id'=>$input['position_id'],
                    'role_id'=>$v,
                ];
            }
            $res = DB::table(config('alias.repr'))->insert($add);
            if(!$res) TEA('806');
        }
        //5.要删除
        if(!empty($set['del_set'])){
            foreach ($set['del_set'] as $k=>$v){
                if(empty($v)) continue;
                $res = DB::table(config('alias.repr'))->where([['position_id','=',$input['position_id']],['role_id','=',$v]])->delete();
                if(!$res) TEA('806');
            }
        }
        //如果已经有人是当前职位还需要更新并且是管理员的还需要更新管理员权限
        $employees = DB::table(config('alias.re'))->select('id')->where([['position_id','=',$input['position_id']],['is_admin','=',1]])->get();
        if(!empty($employees)){
            $adminDao = new Admin();
            foreach ($employees as $k=>$v){
                $adminData = [
                    'employee_id'=>$v->id,
                    'role_ids'=>$input_roles,
                ];
                $res = $adminDao->syncSave($adminData);
                if($res === false) TEA('806');
            }
        }
    }

    //endregion


}