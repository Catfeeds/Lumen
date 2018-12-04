<?php
/**
 * Created by PhpStorm.
 * User: haoziye
 * Date: 2018/2/3
 * Time: 下午5:58
 */
namespace App\Http\Models;
use Illuminate\Support\Facades\DB;

class WorkShop extends Base{

    public $apiPrimaryKey = 'workshop_id';

    public function __construct()
    {
        parent::__construct();
        if(!$this->table) $this->table = config('alias.rws');
    }

//region 检

    public function checkFormField(&$input){
        $add = $this->judgeApiOperationMode($input);
        if(empty($input['name'])) TEA('700','name');
        $check = $add ? [['name','=',$input['name']]] : [['id','<>',$input[$this->apiPrimaryKey]],['name','=',$input['name']]];
        $has = $this->isExisted($check);
        if($has) TEA('700','name');
        if($add){
            if(empty($input['factory_id'])) TEA('700','factory_id');
            $has = $this->isExisted([['id','=',$input['factory_id']]],config('alias.rf'));
            if(!$has) TEA('1152');
            if(empty($input['code'])) TEA('700','code');
            $has = $this->isExisted([['code','=',$input['code']],['factory_id','=',$input['factory_id']]]);
            if($has) TEA('700','code');
            if(!preg_match(config('app.pattern.factory_code'),$input['code'])) TEA('700','code');
        }
        if(!isset($input['address'])) TEA('700','address');
        if(!isset($input['desc'])) TEA('700','desc');
        if(mb_strlen($input['desc']) > config('app.comment.factory_desc')) TEA('700','desc');
    }

//endregion

//region 增

    /**
     * 添加车间
     * @param $input
     * @author Hao.wei <weihao>
     */
    public function add($input){
        $data = [
            'code'=>$input['code'],
            'name'=>$input['name'],
            'factory_id'=>$input['factory_id'],
            'address'=>$input['address'],
            'desc'=>$input['desc'],
            'ctime'=>time(),
        ];
        $insert_id = DB::table($this->table)->insertGetId($data);
        if(!$insert_id) TEA('802');
        return $insert_id;
    }

//endregion

//region 查

    public function getWorkShopListByPage(&$input){
        $field = [
            'rws.id as '.$this->apiPrimaryKey,
            'rws.code',
            'rws.address',
            'rws.name as workshop_name',
            'rcp.name as company_name',
            'rf.name as factory_name',
            'rws.ctime',
        ];
        $where = [];
        $admin_id = (!empty(session('administrator')->admin_id)) ? session('administrator')->admin_id : 0;
        $admin = $this->getRecordById($admin_id,['employee_id','superman'],config('alias.rrad'));
        if($admin){
            if(!$admin->superman) {
                $employee = $this->getRecordById($admin->employee_id, ['company_id', 'factory_id', 'workshop_id', 'workcenter_id'], config('alias.re'));
                if ($employee) {
                    if (!empty($employee->workshop_id)) $where[] = ['rws.id', '=', $employee->workshop_id];
                }
            }
        }
        if(!empty($input['code'])) $where[] = ['rws.code','like','%'.$input['code'].'%'];
        if(!empty($input['name'])) $where[] = ['rws.name','like','%'.$input['name'].'%'];
        if(!empty($input['company_id'])) $where[] = ['rcp.id','=',$input['company_id']];
        if(!empty($input['factory_id'])) $where[] = ['rf.id','=',$input['factory_id']];
        $builder = DB::table($this->table.' as rws')->select($field)
            ->leftJoin(config('alias.rf').' as rf','rf.id','=','rws.factory_id')
            ->leftJoin(config('alias.rcp').' as rcp','rcp.id','=','rf.company_id')
            ->where($where);
        $input['total_records'] = $builder->count();
        $builder->offset(($input['page_no'] - 1) * $input['page_size'])->limit($input['page_size']);
        if(!empty($input['sort']) && !empty($input['order'])) $builder->orderBy('rws.'.$input['sort'],$input['order']);
        $obj_list = $builder->get();
        foreach($obj_list as $k=>&$v){
            $v->ctime = date('Y-m-d H:i:s',$v->ctime);
        }
        return $obj_list;
    }

    /**
     * 车间详情
     * @param $id
     * @return mixed
     * @throws \App\Exceptions\ApiException
     */
    public function get($id){
        $field = [
            'rws.id as '.$this->apiPrimaryKey,
            'rws.code',
            'rws.name as workshop_name',
            'rcp.name as company_name',
            'rf.name as factory_name',
            'rws.address',
            'rws.desc',
            'rws.ctime',
        ];
        $obj = DB::table($this->table.' as rws')->select($field)
            ->leftJoin(config('alias.rf').' as rf','rf.id','=','rws.factory_id')
            ->leftJoin(config('alias.rcp').' as rcp','rcp.id','=','rf.company_id')
            ->where('rws.id',$id)->first();
        if(!$obj) TEA('404');
        return $obj;
    }

    /**
     * select列表
     * @author hao.wei <weihao>
     */
    public function getWorkShopList($input){
        $where = [];
        $admin_id = (!empty(session('administrator')->admin_id)) ? session('administrator')->admin_id : 0;
        $admin = $this->getRecordById($admin_id,['employee_id','superman'],config('alias.rrad'));
        if($admin){
            if(!$admin->superman) {
                $employee = $this->getRecordById($admin->employee_id, ['company_id', 'factory_id', 'workshop_id', 'workcenter_id'], config('alias.re'));
                if ($employee) {
                    if (!empty($employee->workshop_id)) $where[] = ['rws.id', '=', $employee->workshop_id];
                }
            }
        }
        if(!empty($input['company_id'])) $where[] = ['rcp.id','=',$input['company_id']];
        if(!empty($input['factory_id'])) $where[] = ['rf.id','=',$input['factory_id']];
        $obj_list = DB::table($this->table.' as rws')->select('rws.id','rws.name')
            ->leftJoin(config('alias.rf').' as rf','rf.id','=','rws.factory_id')
            ->leftJoin(config('alias.rcp').' as rcp','rcp.id','=','rf.company_id')
            ->where($where)->get();
        return $obj_list;
    }
//endregion

//region

    /**
     * 修改车间信息
     * @param $input
     * @throws \App\Exceptions\ApiException
     * @author hao.wei <weihao>
     */
    public function update($input){
        $data = [
            'name'=>$input['name'],
            'address'=>$input['address'],
            'desc'=>$input['desc'],
            'mtime'=>time(),
        ];
        $res = DB::table($this->table)->where($this->primaryKey,$input[$this->apiPrimaryKey])->update($data);
        if($res === false) TEA('804');
    }

//endregion

//region 删

    /**
     * 删除车间
     * @param $id
     * @throws \App\Exceptions\ApiException
     * @author hao.wei <weihao>
     */
    public function delete($id){
        $res = DB::table($this->table)->where($this->primaryKey,$id)->delete();
        if(!$res) TEA('803');
    }

//endregion
}