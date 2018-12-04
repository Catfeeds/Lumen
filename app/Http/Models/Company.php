<?php
/**
 * Created by PhpStorm.
 * User: haoziye
 * Date: 2018/2/2
 * Time: 下午1:02
 */
namespace App\Http\Models;
use Illuminate\Support\Facades\DB;

class Company extends Base{

    public $apiPrimaryKey = 'company_id';

    public function __construct()
    {
        parent::__construct();
        if(!$this->table) $this->table = config('alias.rcp');
    }

//region 检

    /**
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
            $check = $add ? [['code','=',$input['code']]] : [[$this->primaryKey,'<>',$input[$this->apiPrimaryKey]],['code','=',$input['code']]];
            $has = $this->isExisted($check);
            if($has) TEA('700','code');
            if(!preg_match(config('app.pattern.company_code'),$input['code'])) TEA('700','code');
        }
        if(!isset($input['abbreviation'])) TEA('700','abbreviation');
        if(!isset($input['phone'])) TEA('700','phone');
        if(!isset($input['fax'])) TEA('700','fax');
        if(!isset($input['address'])) TEA('700','address');
        if(!isset($input['email'])) TEA('700','email');
        if(!isset($input['web'])) TEA('700','web');
        if(!isset($input['tax_no'])) TEA('700','tax_no');
        if(!isset($input['ceo'])) TEA('700','ceo');
        if(!isset($input['register'])) TEA('700','register');
        if(!isset($input['desc'])) TEA('700','desc');
        if(mb_strlen($input['desc']) > config('app.comment.company_desc')) TEA('700','desc');
        if(empty($input['country_id']) || !is_numeric($input['country_id'])) TEA('700','country_id');
        $has = $this->isExisted([['id','=',$input['country_id']]],config('alias.rc'));
        if(!$has) TEA('700','country_id');
    }

//endregion

//region 增

    /**
     * @param $input
     * @author hao.wei <weihao>
     */
    public function add($input){
        $data = [
            'name'=>$input['name'],
            'code'=>$input['code'],
            'abbreviation'=>$input['abbreviation'],
            'phone'=>$input['phone'],
            'fax'=>$input['fax'],
            'address'=>$input['address'],
            'email'=>$input['email'],
            'web'=>$input['web'],
            'tax_no'=>$input['tax_no'],
            'ceo'=>$input['ceo'],
            'register'=>$input['register'],
            'desc'=>$input['desc'],
            'country_id'=>$input['country_id'],
            'ctime'=>time(),
        ];
        $insert_id = DB::table($this->table)->insertGetId($data);
        if(!$insert_id) TEA('802');
        return $insert_id;
    }

//endregion

//region 查

    /**
     * @param $input
     * @author hao.wei <weihao>
     */
    public function getCompanyListByPage(&$input){
        $field = [
            'rcp.id as '.$this->apiPrimaryKey,
            'rcp.name as company_name',
            'rcp.code',
            'rcp.abbreviation',
            'rcp.phone',
            'rcp.fax',
            'rcp.address',
            'rcp.email',
            'rcp.web',
            'rc.name as country_name',
            'rcp.ctime'
        ];
        $where = [];
        $admin_id = (!empty(session('administrator')->admin_id)) ? session('administrator')->admin_id : 0;
        $admin = $this->getRecordById($admin_id,['employee_id','superman'],config('alias.rrad'));
        if($admin){
            if(!$admin->superman) {
                $employee = $this->getRecordById($admin->employee_id, ['company_id', 'factory_id', 'workshop_id', 'workcenter_id'], config('alias.re'));
                if ($employee) {
                    if (!empty($employee->company_id)) $where[] = ['rcp.id', '=', $employee->company_id];
                }
            }
        }
        if(!empty($input['company_name'])) $where[] = ['rcp.name','like','%'.$input['company_name'].'%'];
        if(!empty($input['abbreviation'])) $where[] = ['rcp.abbreviation','like','%'.$input['abbreviation'.'%']];
        $builer = DB::table($this->table.' as rcp')->select($field)
            ->leftJoin(config('alias.rc').' as rc','rc.id','=','rcp.country_id')
            ->where($where);
        $input['total_records'] = $builer->count();
        $builer->offset(($input['page_no'] - 1) * $input['page_size'])->limit($input['page_size']);
        if(!empty($input['sort']) && !empty($input['order'])) $builer->orderBy('rcp.'.$input['sort'],$input['order']);
        $obj_list = $builer->get();
        foreach($obj_list as $k=>&$v){
            $v->ctime = date('Y-m-d H:i:s',$v->ctime);
        }
        return $obj_list;
    }

    /**
     * @param $id
     * @author hao.wei <weihao>
     */
    public function get($id){
        $field = [
            'rcp.id as '.$this->apiPrimaryKey,
            'rcp.name as company_name',
            'rcp.abbreviation',
            'rcp.phone',
            'rcp.fax',
            'rcp.address',
            'rcp.email',
            'rcp.web',
            'rc.name as country_name',
            'rcp.id as country_id',
            'rcp.tax_no',
            'rcp.ceo',
            'rcp.register',
            'rcp.desc',
            'rcp.ctime',
            'rcp.code'
        ];
        $obj = DB::table($this->table.' as rcp')->select($field)->where('rcp.'.$this->primaryKey,$id)
            ->leftJoin(config('alias.rc').' as rc','rc.id','=','rcp.country_id')->first();
        if(!$obj) TEA('404');
        $obj->ctime = date('Y-m-d H:i:s',$obj->ctime);
        return $obj;
    }

    /**
     * 公司select列表
     * @return mixed
     * @author hao.wei <weihao>
     */
    public function select(){
        $where = [];
        $admin_id = (!empty(session('administrator')->admin_id)) ? session('administrator')->admin_id : 0;
        $admin = $this->getRecordById($admin_id,['employee_id','superman'],config('alias.rrad'));
        if($admin){
            if(!$admin->superman) {
                $employee = $this->getRecordById($admin->employee_id, ['company_id', 'factory_id', 'workshop_id', 'workcenter_id'], config('alias.re'));
                if ($employee) {
                    if (!empty($employee->company_id)) $where[] = ['id', '=', $employee->company_id];
                }
            }
        }
        $obj_list = DB::table($this->table)->select('id as company_id','name as company_name')
            ->where($where)
            ->get();
        return $obj_list;
    }

    /**
     * 国家select列表
     * @return mixed
     * @author hao.wei <weihao>
     */
    public function contrySelect(){
        $obj_list = DB::table(config('alias.rc'))->select('id','name')->orderBy('id','desc')->get();
        return $obj_list;
    }

//endregion

//region 改

    /**
     * 修改公司
     * @param $input
     * @author hao.wei <weihao>
     */
    public function update($input){
        $data = [
            'name'=>$input['name'],
//            'code'=>$input['code'],
            'abbreviation'=>$input['abbreviation'],
            'phone'=>$input['phone'],
            'fax'=>$input['fax'],
            'address'=>$input['address'],
            'email'=>$input['email'],
            'web'=>$input['web'],
            'tax_no'=>$input['tax_no'],
            'ceo'=>$input['ceo'],
            'register'=>$input['register'],
            'desc'=>$input['desc'],
            'country_id'=>$input['country_id'],
            'mtime'=>time(),
        ];
        $res = DB::table($this->table)->where($this->primaryKey,$input[$this->apiPrimaryKey])->update($data);
        if($res === false) TEA('804');
    }

//endregion

//region 删

    /**
     * 删除公司
     * @param $id
     * @author hao.wei <weihao>
     */
    public function delete($id){
        $res = DB::table($this->table)->where($this->primaryKey,$id)->delete();
        if(!$res) TEA('803');
    }

//endregion
}