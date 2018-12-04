<?php
/**
 * Created by PhpStorm.
 * User: haoziye
 * Date: 2018/2/3
 * Time: 下午5:58
 */
namespace App\Http\Models;
use Illuminate\Support\Facades\DB;

class WorkMachine extends Base{

    public $apiPrimaryKey = 'workmachine_id';

    public function __construct()
    {
        parent::__construct();
        if(!$this->table) $this->table = config('alias.rwm');
    }

//region 检

    public function checkFormField(&$input){
        $add = $this->judgeApiOperationMode($input);
        if(empty($input['name'])) TEA('700','name');
        $check = $add ? [['name','=',$input['name']]] : [['id','<>',$input[$this->apiPrimaryKey]],['name','=',$input['name']]];
        $has = $this->isExisted($check);
        if($has) TEA('700','name');
        if($add){
            if(empty($input['code'])) TEA('700','code');
            $has = $this->isExisted([['code','=',$input['code']]]);
            if($has) TEA('700','code');
            if(!preg_match(config('app.pattern.factory_code'),$input['code'])) TEA('700','code');
            if(empty($input['workbench_id'])) TEA('700','workbench_id');
            $has = $this->isExisted([['id','=',$input['workbench_id']]],config('alias.rwb'));
            if(!$has) TEA('1159');
        }
        if(!isset($input['status']) || !is_numeric($input['status'])) TEA('700','status');
        if($input['status'] != 0 && $input['status'] != 1) TEA('700','status');
        if(empty($input['ip_address'])) TEA('700','ip_address');
        if(empty($input['compose_type_no']) || !preg_match(config('app.pattern.factory_code'),$input['compose_type_no'])) TEA('700','compose_type_no');
        $check = $add ? [['compose_type_no','=',$input['compose_type_no']]] : [['id','<>',$input[$this->apiPrimaryKey]],['compose_type_no','=',$input['compose_type_no']]];
        $has = $this->isExisted($check);
        if($has) TEA('700','compose_type_no');
        if(!isset($input['online_status']) || !is_numeric($input['online_status'])) TEA('700','online_status');
        if($input['online_status'] != 0 && $input['online_status'] != 1) TEA('700','online_status');
    }

//endregion

//region 增

    /**
     * 添加
     * @param $input
     * @author Hao.wei <weihao>
     */
    public function add($input){
        $data = [
            'code'=>$input['code'],
            'name'=>$input['name'],
            'workbench_id'=>$input['workbench_id'],
            'compose_type_no'=>$input['compose_type_no'],
            'status'=>$input['status'],
            'ip_address'=>$input['ip_address'],
            'online_status'=>$input['online_status'],
            'ctime'=>time(),
        ];
        $insert_id = DB::table($this->table)->insertGetId($data);
        if(!$insert_id) TEA('802');
        return $insert_id;
    }

//endregion

//region 查

    public function getWorkMachineListByPage(&$input){
        $field = [
            'rwm.id as '.$this->apiPrimaryKey,
            'rwm.code',
            'rwm.name as workmachine_name',
            'rwb.name as workbench_name',
            'rws.name as workshop_name',
            'rwc.name as workcenter_name',
            'rcp.name as company_name',
            'rf.name as factory_name',
            'rwm.compose_type_no',
            'rwm.status',
            'rwm.ip_address',
            'rwm.online_status',
            'rwm.ctime',
        ];
        $where = [];
        if(!empty($input['code'])) $where[] = ['rwm.code','like','%'.$input['code'].'%'];
        if(!empty($input['name'])) $where[] = ['rwm.name','like','%'.$input['name'].'%'];
        if(!empty($input['company_id'])) $where[] = ['rcp.id','=',$input['company_id']];
        if(!empty($input['factory_id'])) $where[] = ['rf.id','=',$input['factory_id']];
        if(!empty($input['workshop_id'])) $where[] = ['rws.id','=',$input['workshop_id']];
        if(!empty($input['workcenter_id'])) $where[] = ['rwc.id','=',$input['workcenter_id']];
        if(!empty($input['workbench_id'])) $where[] = ['rwm.workbench_id','=',$input['workbench_id']];
        $builder = DB::table($this->table.' as rwm')->select($field)
            ->leftJoin(config('alias.rwb').' as rwb','rwb.id','=','rwm.workbench_id')
            ->leftJoin(config('alias.rwc').' as rwc','rwc.id','=','rwb.workcenter_id')
            ->leftJoin(config('alias.rws').' as rws','rws.id','=','rwc.workshop_id')
            ->leftJoin(config('alias.rf').' as rf','rf.id','=','rws.factory_id')
            ->leftJoin(config('alias.rcp').' as rcp','rcp.id','=','rf.company_id')
            ->where($where);
        $input['total_records'] = $builder->count();
        $builder->offset(($input['page_no'] - 1) * $input['page_size'])->limit($input['page_size']);
        if(!empty($input['sort']) && !empty($input['order'])) $builder->orderBy('rwm.'.$input['sort'],$input['order']);
        $obj_list = $builder->get();
        foreach($obj_list as $k=>&$v){
            $v->ctime = date('Y-m-d H:i:s',$v->ctime);
        }
        return $obj_list;
    }

    /**
     * 详情
     * @param $id
     * @return mixed
     * @throws \App\Exceptions\ApiException
     */
    public function get($id){
        $field = [
            'rwm.id as '.$this->apiPrimaryKey,
            'rwm.code',
            'rwm.name as workmachine_name',
            'rwb.name as workbench_name',
            'rwb.id as workbench_id',
            'rws.name as workshop_name',
            'rws.id as workshop_id',
            'rwc.name as workcenter_name',
            'rwc.id as workcenter_id',
            'rcp.name as company_name',
            'rcp.id as company_id',
            'rf.name as factory_name',
            'rf.id as factory_id',
            'rwm.compose_type_no',
            'rwm.status',
            'rwm.ip_address',
            'rwm.online_status',
            'rwm.ctime',
        ];
        $obj = DB::table($this->table.' as rwm')->select($field)
            ->leftJoin(config('alias.rwb').' as rwb','rwb.id','=','rwm.workbench_id')
            ->leftJoin(config('alias.rwc').' as rwc','rwc.id','=','rwb.workcenter_id')
            ->leftJoin(config('alias.rws').' as rws','rws.id','=','rwc.workshop_id')
            ->leftJoin(config('alias.rf').' as rf','rf.id','=','rws.factory_id')
            ->leftJoin(config('alias.rcp').' as rcp','rcp.id','=','rf.company_id')
            ->where('rwm.id',$id)->first();
        if(!$obj) TEA('404');
        return $obj;
    }

    /**
     * select列表
     * @author hao.wei <weihao>
     */
    public function getWorkMachineList($input){
        $where = [];
        if(!empty($input['company_id'])) $where[] = ['rcp.id','=',$input['company_id']];
        if(!empty($input['factory_id'])) $where[] = ['rf.id','=',$input['factory_id']];
        if(!empty($input['workshop_id'])) $where[] = ['rws.id','=',$input['workshop_id']];
        if(!empty($input['workcenter_id'])) $where[] = ['rwc.id','=',$input['workcenter_id']];
        if(!empty($input['workbench_id'])) $where[] = ['rwm.workbench_id','=',$input['workbench_id']];
        $obj_list = DB::table($this->table.' as rwm')->select('rwm.id','rwm.name')
            ->leftJoin(config('alias.rwb').' as rwb','rwb.id','=','rwm.workbench_id')
            ->leftJoin(config('alias.rwc').' as rwc','rwc.id','=','rwb.workcenter_id')
            ->leftJoin(config('alias.rws').' as rws','rws.id','=','rwc.workshop_id')
            ->leftJoin(config('alias.rf').' as rf','rf.id','=','rws.factory_id')
            ->leftJoin(config('alias.rcp').' as rcp','rcp.id','=','rf.company_id')
            ->where($where)->get();
        return $obj_list;
    }
//endregion

//region

    /**
     * 修改
     * @param $input
     * @throws \App\Exceptions\ApiException
     * @author hao.wei <weihao>
     */
    public function update($input){
        $data = [
            'name'=>$input['name'],
            'compose_type_no'=>$input['compose_type_no'],
            'status'=>$input['status'],
            'ip_address'=>$input['ip_address'],
            'online_status'=>$input['online_status'],
            'mtime'=>time(),
        ];
        $res = DB::table($this->table)->where($this->primaryKey,$input[$this->apiPrimaryKey])->update($data);
        if($res === false) TEA('804');
    }

//endregion

//region 删

    /**
     * 删除
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