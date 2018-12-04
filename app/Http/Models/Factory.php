<?php
/**
 * Created by PhpStorm.
 * User: haoziye
 * Date: 2018/2/2
 * Time: 下午5:09
 */
namespace App\Http\Models;
use App\Http\Models\Trace\Trace;
use App\Libraries\Tree;
use Illuminate\Support\Facades\DB;

class Factory extends Base{

    public $apiPrimaryKey = 'factory_id';

    public function __construct()
    {
        parent::__construct();
        if(!$this->table) $this->table = config('alias.rf');
    }

//region 增

    /**
     * 添加工厂
     * @param $input
     * @author hao.wei <weihao>
     */
    public function add($input){
        $data = [
            'company_id'=>$input['company_id'],
            'code'=>$input['code'],
            'name'=>$input['name'],
            'country_id'=>$input['country_id'],
            'address'=>$input['address'],
            'phone'=>$input['phone'],
            'mobile'=>$input['mobile'],
            'fax'=>$input['fax'],
            'email'=>$input['email'],
            'ctime'=>time(),
        ];
        $insert_id = DB::table($this->table)->insertGetId($data);
        if(!$insert_id) TEA('802');
        return $insert_id;
    }

//endregion

//region 检

    /**
     * 检查输入的参数
     * @param $input
     * @author hao.wei <weihao>
     */
    public function checkFormField(&$input){
        $add = $this->judgeApiOperationMode($input);
        if(empty($input['name'])) TEA('700','name');
        $check = $add ? [['name','=',$input['name']]] : [[$this->primaryKey,'<>',$input[$this->apiPrimaryKey]],['name','=',$input['name']]];
        $has = $this->isExisted($check);
        if($has) TEA('700','name');
        if($add){
            if(empty($input['code'])) TEA('700','code');
            $has = $this->isExisted([['code','=',$input['code']]]);
            if($has) TEA('700','code');
            if(!preg_match(config('app.pattern.factory_code'),$input['code'])) TEA('700','code');
            if(empty($input['company_id']) || !is_numeric($input['company_id'])) TEA('700','company_id');
            $has = $this->isExisted([['id','=',$input['company_id']]],config('alias.rcp'));
            if(!$has) TEA('1151','company_id');
            if(empty($input['country_id']) || !is_numeric($input['country_id'])) TEA('700','country_id');
            $has = $this->isExisted([['id','=',$input['country_id']]],config('alias.rc'));
            if(!$has) TEA('1153','country_id');
        }
        if(!isset($input['address'])) TEA('700','address');
        if(!isset($input['phone'])) TEA('700','phone');
        if(!isset($input['mobile'])) TEA('700','mobile');
        if(!isset($input['fax'])) TEA('700','fax');
        if(!isset($input['email'])) TEA('700','email');
        if($input['mobile'] && !preg_match(config('app.pattern.mobile'),$input['mobile'])) TEA('700','mobile');
    }

//endregion

//region 查

    /**
     * 工厂分页列表
     * @param $input
     * @author hao.wei <weihao>
     */
    public function getFactoryListByPage(&$input){
        $field = [
            'rf.id as '.$this->apiPrimaryKey,
            'rcp.name as company_name',
            'rf.code',
            'rf.name as factory_name',
            'rc.name as country_name',
            'rf.phone',
            'rf.mobile',
            'rf.fax',
            'rf.email',
            'rf.ctime',
        ];
        $where = [];
        $admin_id = (!empty(session('administrator')->admin_id)) ? session('administrator')->admin_id : 0;
        $admin = $this->getRecordById($admin_id,['employee_id','superman'],config('alias.rrad'));
        if($admin){
            if(!$admin->superman) {
                $employee = $this->getRecordById($admin->employee_id, ['company_id', 'factory_id', 'workshop_id', 'workcenter_id'], config('alias.re'));
                if ($employee) {
                    if (!empty($employee->factory_id)) $where[] = ['rf.id', '=', $employee->factory_id];
                }
            }
        }
        if(!empty($input['company_id'])) $where[] = ['rf.company_id','=',$input['company_id']];
        if(!empty($input['code'])) $where[] = ['rf.code','like','%'.$input['code'].'%'];
        if(!empty($input['name'])) $where[] = ['rf.name','like','%'.$input['name'].'%'];
        if(!empty($input['country_name'])) $where[] = ['rc.name','like','%'.$input['country_name'].'%'];
        $builder = DB::table($this->table.' as rf')->select($field)
            ->leftJoin(config('alias.rcp').' as rcp','rcp.id','=','rf.company_id')
            ->leftJoin(config('alias.rc').' as rc','rc.id','=','rf.country_id')
            ->where($where);
        $input['total_records'] = $builder->count();
        $builder->offset(($input['page_no'] - 1) * $input['page_size'])->limit($input['page_size']);
        if(!empty($input['sort']) && !empty($input['order'])) $builder->orderBy('rf.'.$input['sort'],$input['order']);
        $obj_list = $builder->get();
        foreach($obj_list as $k=>&$v){
            $v->ctime = date('Y-m-d H:i:s',$v->ctime);
        }
        return $obj_list;
    }

    /**
     * 工厂详情
     * @param $id
     * @return mixed
     * @throws \App\Exceptions\ApiException
     * @author hao.wei <weihao>
     */
    public function get($id){
        $field = [
            'rf.id as '.$this->apiPrimaryKey,
            'rcp.name as company_name',
            'rf.name as factory_name',
            'rc.name as country_name',
            'rf.code',
            'rf.phone',
            'rf.mobile',
            'rf.fax',
            'rf.address',
            'rf.email',
            'rf.ctime',
            'rf.company_id',
            'rf.country_id'
        ];
        $obj = DB::table($this->table.' as rf')->select($field)
            ->leftJoin(config('alias.rcp').' as rcp','rcp.id','=','rf.company_id')
            ->leftJoin(config('alias.rc').' as rc','rc.id','=','rf.country_id')
            ->where('rf.'.$this->primaryKey,$id)->first();
        if(!$obj) TEA(404);
        $obj->ctime = date('Y-m-d H:i:s',$obj->ctime);
        return $obj;
    }

    /**
     * 工厂select列表
     */
    public function getFactoryList($input){
        $where = [];
        $admin_id = (!empty(session('administrator')->admin_id)) ? session('administrator')->admin_id : 0;
        $admin = $this->getRecordById($admin_id,['employee_id','superman'],config('alias.rrad'));
        if($admin){
            if(!$admin->superman) {
                $employee = $this->getRecordById($admin->employee_id, ['company_id', 'factory_id', 'workshop_id', 'workcenter_id'], config('alias.re'));
                if ($employee) {
                    if (!empty($employee->factory_id)) $where[] = ['id', '=', $employee->factory_id];
                }
            }
        }
        if(!empty($input['company_id'])) $where[] = ['company_id','=',$input['company_id']];
        $obj_list = DB::table($this->table)->select('id','name')->where($where)->get();
        return $obj_list;
    }

    /**
     * 获取工厂直到工作中心的树形结构 (急需优化)
     * @return mixed
     * @throws \Illuminate\Container\EntryNotFoundException
     */
    public function getTree($input){
        $admin_id = (!empty(session('administrator')->admin_id)) ? session('administrator')->admin_id : 0;
        $admin = $this->getRecordById($admin_id,['superman','employee_id'],config('alias.rrad'));
        $companyWhere = [];
        $factoryWhere = [];
        $workshopWhere = [];
        $workcenterWhere = [];
        if($admin){
            if(!$admin->superman){
                $employee = $this->getRecordById($admin->employee_id,['company_id','factory_id','workshop_id','workcenter_id'],config('alias.re'));
                if($employee){
                    if(!empty($employee->company_id)) $companyWhere[] = ['id','=',$employee->company_id];
                    if(!empty($employee->factory_id)) $factoryWhere[] = ['id','=',$employee->factory_id];
                    if(!empty($employee->workshop_id)) $workshopWhere[] = ['rws.id','=',$employee->workshop_id];
                    if(!empty($employee->workcenter_id)) $workcenterWhere[] = ['rwc.id','=',$employee->workcenter_id];
                }
            }
        }
//        第一种解决方式直接查,数据库io最多，效率最差
//        $obj_list = DB::table(config('alias.rf'))->where('company_id',$company_id)->select('id','name')->get();
//        foreach ($obj_list as $k=>&$v) {
//            $v->child = DB::table(config('alias.rws'))->where('factory_id',$v->id)->select('id', 'name')->get();
//            foreach ($v->child as $h => &$j) {
//                $j->child = DB::table(config('alias.rwc'))->where('workshop_id',$j->id)->select('id', 'name')->get();
//            }
//        }
        $obj_list = [];
        if(!empty($input['company_id'])) $companyWhere[] = ['id','=',$input['company_id']];
        $companyList = DB::table(config('alias.rcp'))->select('id','name')->where($companyWhere)->get();
        $factoryList = DB::table(config('alias.rf'))->select('id','name','company_id')->where($factoryWhere)->get();
        $workshopList = DB::table(config('alias.rws').' as rws')
            ->select('rws.id', 'rws.name','rws.factory_id','rf.company_id')
            ->leftJoin(config('alias.rf').' as rf','rws.factory_id','rf.id')
            ->where($workshopWhere)->get();
        $builder = DB::table(config('alias.rwc').' as rwc')
            ->select('rwc.id', 'rwc.name','rwc.workshop_id','rws.factory_id','rf.company_id')
            ->leftJoin(config('alias.rws').' as rws','rws.id','rwc.workshop_id')
            ->leftJoin(config('alias.rf').' as rf','rf.id','rws.factory_id')
            ->where($workcenterWhere);
        if(!empty($input['nohas_workbench'])){//过滤掉不存在工作台的工作中心
            $builder->whereNotIn('id',function($query){
                $query->select('workcenter_id')->from(config('alias.rwb'));
            });
        }
        $workcenterList = $builder->get();
        //第二种三个层级都查出来遍历,地址传递,会有冗余字段
        foreach ($companyList as $a=>&$b){
            $obj_list[] = $b;
            $b->flag = 1;
            $b->child = [];
            foreach($factoryList as $c=>&$d){
                if($d->company_id == $b->id){
                    $b->child[] = $d;
                    $d->flag = 2;
                    $d->child = [];
                    foreach($workshopList as $e=>&$f){
                        if($f->factory_id == $d->id){
                            $d->child[] = $f;
                            $f->flag = 3;
                            $f->child = [];
                            foreach ($workcenterList as $g=>&$h){
                                if($h->workshop_id == $f->id){
                                    $h->flag = 4;
                                    $f->child[] = $h;
                                }
                            }
                        }
                    }
                }
            }
        }
        //第三种三个层级都查出来遍历，遍历方式不同
//        foreach ($factoryList as $k=>$v){
//            $obj = [
//                'id'=>$v->id,
//                'name'=>$v->name,
//                'child'=>[],
//            ];
//            foreach($workshopList as $h=>$j){
//                $nextobj = [
//                    'id'=>$j->id,
//                    'name'=>$j->name,
//                    'child'=>[],
//                ];
//                if($j->factory_id == $obj['id']){
//                    foreach ($workcenterList as $z=>$w){
//                        if($w->workshop_id == $j->id){
//                            $nextobj['child'][] = [
//                                'id'=>$w->id,
//                                'name'=>$w->name,
//                            ];
//                        }
//                    }
//                    $obj['child'][] = $nextobj;
//                }
//            }
//            $obj_list[] = $obj;
//        }
//        第四种一条sql先查询出来，在运算
//        $sql = "select wh.factory_id,wh.factory_name,group_concat(wh.workshop_name) as workshop_names,
//                group_concat(wh.workcenter_ids,'|') as workcenter_ids,
//                group_concat(wh.workcenter_names,'|') as workcenter_names
//                from
//                (
//                select a.id as factory_id,a.name as factory_name,b.name as workshop_name,
//                ifnull(group_concat(c.id),'kong') as workcenter_ids,
//                ifnull(group_concat(c.name),'kong') as workcenter_names
//                from ruis_factory a
//                left join ruis_workshop b on a.id = b.factory_id
//                left join ruis_workcenter c on b.id = c.workshop_id
//                where a.company_id = ?
//                group by a.id,b.id
//                ) wh
//                group by wh.factory_id";
//        $obj_list = DB::select($sql,[$company_id]);
        return $obj_list;
    }
//endregion

//region 改

    /**
     * 编辑工厂信息
     * @param $input
     * @author hao.wei <weihao>
     */
    public function update($input){
        $data = [
            'name'=>$input['name'],
            'address'=>$input['address'],
            'phone'=>$input['phone'],
            'mobile'=>$input['mobile'],
            'fax'=>$input['fax'],
            'email'=>$input['email'],
            'mtime'=>time(),
        ];
        $res = DB::table($this->table)->where($this->primaryKey,$input[$this->apiPrimaryKey])->update($data);
        if($res === false) TEA('804');
    }

//endregion

//region 删

    /**
     * 删除工厂
     * @param $id
     * @author hao.wei <weihao>
     */
    public function delete($id){
        $res = DB::table($this->table)->where($this->primaryKey,$id)->delete();
        if(!$res) TEA('803');
    }

//endregion
}