<?php
/**
 * Created by PhpStorm.
 * User: ruiyanchao
 * Date: 2018/1/19
 * Time: 上午9:30
 */
namespace App\Http\Models;//定义命名空间
use App\Libraries\Tree;
use Illuminate\Support\Facades\DB;

/**
 * 部门
 * @author  rick
 * @time    2018年01月18日13:17:35
 */
class Department extends Base
{

    /**
     * 前端传递的api主键名称
     * @var string
     */
    public $apiPrimaryKey = 'department_id';

    public function __construct()
    {
        parent::__construct();
        $this->table = config('alias.rd');
    }

    //region 检

    public function checkFormField(&$input){
        $add = $this->judgeApiOperationMode($input);
        if(empty($input['company_id'])) TEA('700','company_id');
        $has = $this->isExisted([['id','=',$input['company_id']]],config('alias.rcp'));
        if(!$has) TEA('700','company_id');
        if($add){
            #4.1 自动识别祖先路径
            if($input['parent_id']==0){
                $input['forefathers']='';
            }else{
                $f_forefathers=$this->getFieldValueById($input['parent_id'],'forefathers');
                $input['forefathers']=rtrim($f_forefathers,',').','.$input['parent_id'].',';
                $parentids = explode(',',$input['forefathers']);
                foreach ($parentids as $k=>$v){
                    if(!empty($v)){
                        $input['root_node'] = $v;
                        break;
                    }
                }
            }
        }
    }

    //endregion


    //region 增

    /**
     * 增加
     * @param $input
     * @return mixed
     */
    public function add($input)
    {
//        if($input['parent_id'] == 0){
//            $department = DB::table($this->table)
//                ->select(['id'])
//                ->where([['parent_id','=',0],['comapny_id','=',$input['company_id']]])
//                ->first();
//            if(!empty($department)) TEA('2304');
//        }

        if(empty($input['name'])) TEA('700','name');
        //获取入库数组
        $data = [
            'abbreviation'=>$input['abbreviation'],
            'name'=>$input['name'],//名称
            'description'=>$input['description'],
            'parent_id'=>$input['parent_id'],
            'phone'=>$input['phone'],
            'fax'=>$input['fax'],
            'email'=>$input['email'],
            'company_id'=>$input['company_id'],
            'forefathers'=>$input['forefathers'],
            'root_node'=>isset($input['root_node']) ? $input['root_node'] : 0,
        ];
        //入库
        $insert_id = DB::table($this->table)->insertGetId($data);
        if (!$insert_id) TEA('802');
        return $insert_id;
    }
    //endregion

    //region 查
    /**
     * 获取列表
     * @return mixed
     */
    public function getDepartmentList()
    {
        $obj_list=DB::table($this->table.' as a1')
            ->select(['a1.id as '.$this->apiPrimaryKey,'a1.name','a2.name as father_name','a1.abbreviation'])
            ->leftJoin(config('alias.rd').' as a2','a1.parent_id','=','a2.id')
            ->limit(50)
            ->get();
        return $obj_list;

    }

    public function get($id)
    {
        $obj=$this->getRecordById($id,['id as '.$this->apiPrimaryKey,'name','parent_id','description','fax','phone','email','abbreviation']);
        if(!$obj) TEA('404');
        return $obj;
    }

    public function select()
    {
        $admin_id = (!empty(session('administrator')->admin_id)) ? session('administrator')->admin_id : 0;
        $admin = $this->getRecordById($admin_id,['employee_id','superman'],config('alias.rrad'));
        $depWhere = [];
        $comWhere = [];
        if($admin){
            if(!$admin->superman) {
                $employee = $this->getRecordById($admin->employee_id, ['company_id','dep_factory_id'], config('alias.re'));
                if ($employee) {
                    if (!empty($employee->company_id)){
                        $depWhere[] = ['company_id', '=', $employee->company_id];
                        $comWhere[] = ['id','=',$employee->company_id];
                    }
                    if(!empty($employee->dep_factory_id)){
                        $depWhere[] = ['root_node','=',$employee->dep_factory_id];
                    }
                }
            }
        }
        $dep_list=DB::table($this->table)
            ->select(['id','name','parent_id','company_id'])
            ->where($depWhere)
            ->get();
        $com_list = DB::table(config('alias.rcp'))->select('id as company_id','name as company_name')->where($comWhere)->get();
        $dep_list = Tree::listToTree(obj2array($dep_list));
        foreach ($com_list as $k=>&$v){
            $v->factory = [];
            foreach ($dep_list as $h=>$j){
                if($j['company_id'] == $v->company_id){
                    $v->factory[] = $j;
                }
            }
        }
        return $com_list;
    }

    public function getCategoriesList()
    {
        $obj_list=DB::table($this->table)->select(['id','id as '.$this->apiPrimaryKey,'name','parent_id','description','fax','phone','email'])->get();
        return $obj_list;

    }

    /**
     * 根据公司获取部门树
     * @param $company_id
     * @return array
     */
    public function getTreeByCompany($company_id){
        $obj_list=DB::table($this->table)->select(['id','id as '.$this->apiPrimaryKey,'name','parent_id','description','fax','phone','email'])
            ->where('company_id',$company_id)
            ->get();
        $obj_list = Tree::listToTree(obj2array($obj_list));
        return $obj_list;
    }

    /**
     * 获取下级部门
     * @param $parent_id
     * @return mixed
     */
    public function getNextLevelList($input){
        $where = [];
        if(!empty($input['parent_id'])){
            $where[] = ['parent_id','=',$input['parent_id']];
        }else{
            $where[] = ['company_id','=',$input['company_id']];
        }
        $obj_list = DB::table($this->table)
            ->select('id as '.$this->apiPrimaryKey,'name','parent_id','description','fax','phone','email','abbreviation')
            ->where($where)->get();
        return $obj_list;
    }


    //endregion

    //region 改
    public function update($input)
    {
        if(empty($input['name'])) TEA('700','name');
        //获取入库数组
        $data = [
            'abbreviation'=>$input['abbreviation'],
            'name'=>$input['name'],//名称
            'description'=>$input['description'],
            'phone'=>$input['phone'],
            'fax'=>$input['fax'],
            'email'=>$input['email']
        ];
        //入库
        $upd= DB::table($this->table)->where($this->primaryKey,$input[$this->apiPrimaryKey])->update($data);
        if($upd===false) TEA('806');
    }
    //endregion

    //region 删
    public function destroy($id)
    {
        //该分类使用已经使用了,使用的话,则禁止删除
        $has=$this->isExisted([['parent_id','=',$id]],$this->table);
        if($has) TEA('2302');
        $has=$this->isExisted([['department_id','=',$id]],config('alias.re'));
        if($has) TEA('2303');

        $num=$this->destroyById($id);
        if($num===false) TEA('803');
        if(empty($num))  TEA('404');
    }
    //endregion
}