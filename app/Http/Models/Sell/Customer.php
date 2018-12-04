<?php
/**
 * Created by PhpStorm.
 * User: haoziye
 * Date: 2018/3/31
 * Time: 上午11:04
 */
namespace App\Http\Models\Sell;

use App\Http\Models\Base;
use Illuminate\Support\Facades\DB;

class Customer extends Base{

    public $apiPrimaryKey = 'customer_id';
    public function __construct()
    {
        parent::__construct();
        if(empty($this->table)) $this->table = config('alias.rci');
    }

//region 检

    /**
     * 检查传入参数
     * @param $input
     */
    public function checkFormField(&$input){
        $add = $this->judgeApiOperationMode($input);
        if(empty($input['code'])) TEA('700','code');
        $check = $add ? [['code','=',$input['code']]] : [['code','=',$input['code']],['id','<>',$input[$this->apiPrimaryKey]]];
        $has = $this->isExisted($check);
        if(!preg_match(config('app.pattern.sell_code'),$input['code'])) TEA('1104');
        if($has) TEA('1103');
        if(empty($input['name'])) TEA('700','name');
        if(!isset($input['position'])) TEA('700','position');
        if(!isset($input['company'])) TEA('700','company');
        if(empty($input['mobile'])) TEA('700','mobile');
        if(!preg_match(config('app.pattern.mobile'),$input['mobile'])) TEA('1181');
        if(!isset($input['email'])) TEA('700','email');
        if(!isset($input['address'])) TEA('700','address');
        if(!isset($input['label'])) TEA('700','label');
        $input['create_id'] = !empty(session('administrator')->admin_id) ? session('administrator')->admin_id : 0;
    }

//endregion

//region 增

    /**
     * 添加客户
     * @param $input
     * @return mixed
     * @throws \App\Exceptions\ApiException
     */
    public function store($input){
        $data = [
            'code'=>$input['code'],
            'name'=>$input['name'],
            'position'=>$input['position'],
            'company'=>$input['company'],
            'mobile'=>$input['mobile'],
            'email'=>$input['email'],
            'address'=>$input['address'],
            'label'=>$input['label'],
            'create_id'=>$input['create_id'],
            'ctime'=>time(),
        ];
        $insert_id = DB::table($this->table)->insertGetId($data);
        if(!$insert_id) TEA('802');
        return $insert_id;
    }

//endregion

//region 查

    /**
     * 分页列表
     * @param $input
     */
    public function pageIndex(&$input){
        $field = [
            'rci.id as '.$this->apiPrimaryKey,
            'rci.code',
            'rci.name',
            'rci.mobile',
            'rci.company',
            'rrad.name as create_name',
            'rci.ctime',
        ];
        $where = [];
        if(!empty($input['code'])) $where[] = ['rci.code','=',$input['code']];
        if(!empty($input['name'])) $where[] = ['rci.name','like','%'.$input['name'].'%'];
        if(!empty($input['create_name'])) $where[] = ['rrad.name','like','%'.$input['create_name'].'%'];
        $builder = DB::table($this->table.' as rci')->select($field)
            ->leftJoin(config('alias.rrad').' as rrad','rrad.id','rci.create_id')
            ->where($where);
        $input['total_records'] = $builder->count();
        $builder->offset(($input['page_no'] - 1) * $input['page_size'])->limit($input['page_size']);
        if(!empty($input['sort']) && !empty($input['order'])) $builder->orderBy('rci.'.$input['sort'],$input['order']);
        $obj_list = $builder->get();
        foreach ($obj_list as $k=>&$v){
            $v->ctime = date('Y-m-d H:i:s',$v->ctime);
        }
        return $obj_list;
    }

    /**
     * 详情
     * @param $id
     */
    public function show($id){
        $obj = DB::table($this->table)->where('id',$id)->first();
        if(empty($obj)) TEA('404');
        $obj->ctime = date('Y-m-d H:i:s',$obj->ctime);
        return $obj;
    }

//endregion

//region 改

    /**
     * 更新
     * @param $input
     */
    public function update($input){
        $data = [
            'code'=>$input['code'],
            'name'=>$input['name'],
            'position'=>$input['position'],
            'company'=>$input['company'],
            'mobile'=>$input['mobile'],
            'email'=>$input['email'],
            'address'=>$input['address'],
            'label'=>$input['label'],
        ];
        $res = DB::table($this->table)->where('id',$input[$this->apiPrimaryKey])->update($data);
        if($res === false) TEA('804');
    }

//endregion

//region 删

    /**
     * 删除
     * @param $id
     * @throws \App\Exceptions\ApiException
     */
    public function destory($id){
        $res = DB::table($this->table)->where('id',$id)->delete();
        if(!$res) TEA('803');
    }

//endregion
}