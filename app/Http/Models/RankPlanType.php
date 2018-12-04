<?php
/**
 * Created by PhpStorm.
 * User: haoziye
 * Date: 2018/2/3
 * Time: 下午5:58
 */
namespace App\Http\Models;
use Illuminate\Support\Facades\DB;

class RankPlanType extends Base{

    public $apiPrimaryKey = 'rankplantype_id';

    public function __construct()
    {
        parent::__construct();
        if(!$this->table) $this->table = config('alias.rrpt');
    }

//region 检

    public function checkFormField(&$input){
        $add = $this->judgeApiOperationMode($input);
        $input['company_id'] = (!empty(session('administrator')->company_id)) ? session('administrator')->company_id: 0;
//        $input['factory_id'] = (!empty(session('administrator')->factory_id)) ? session('administrator')->factory_id : 0;
        if(empty($input['factory_id'])) TEA('700','factory_id');
        $has = $this->isExisted([['id','=',$input['factory_id']]],config('alias.rf'));
        if(!$has) TEA('1152');
        if(empty($input['code'])) TEA('700','code');
        $where = $add ? [['code','=',$input['code']]] : [['id','<>',$input[$this->apiPrimaryKey]],['code','=',$input['code']]];
        $has = $this->isExisted($where);
        if($has) TEA('1103');
        if(empty($input['name'])) TEA('700','name');
//        $check = $add ? [['name','=',$input['name']],['company_id','=',$input['company_id']],['factory_id','=',$input['factory_id']]] : [['id','<>',$input[$this->apiPrimaryKey]],['name','=',$input['name']],['company_id','=',$input['company_id']],['factory_id','=',$input['factory_id']]];
//        $has = $this->isExisted($check);
//        if($has) TEA('700','name');
    }

//endregion

//region 增

    /**
     * 添加
     * @param $input
     * @throws \App\Exceptions\ApiException
     * @author hao.wei <weihao>
     */
    public function add($input){
        $data = [
            'name'=>$input['name'],
            'company_id'=>$input['company_id'],
            'factory_id'=>$input['factory_id'],
            'code'=>$input['code'],
        ];
        $insert_id = DB::table($this->table)->insertGetId($data);
        if(!$insert_id) TEA('802');
        return $insert_id;
    }

//endregion

//region 查

    public function getRankPlanTypeListByPage(&$input){
        $field = [
            'rrpt.id as '.$this->apiPrimaryKey,
            'rrpt.name',
            'rrpt.factory_id',
            'rf.name as factory_name',
            'rrpt.code',
        ];
        $where = [];
        $superman = (!empty(session('administrator')->superman)) ? session('administrator')->superman : 0;
        if(!$superman) {
            if(!empty(session('administrator')->company_id)) $where[] = ['rrpt.company_id','=',session('administrator')->company_id];
            if(!empty(session('administrator')->factory_id)) $where[] = ['rrpt.factory_id','=',session('administrator')->factory_id];
        }
        $builder = DB::table($this->table.' as rrpt')->select($field)
            ->leftJoin(config('alias.rf').' as rf','rf.id','rrpt.factory_id')
            ->where($where);
        $input['total_records'] = $builder->count();
        $builder->offset(($input['page_no'] - 1) * $input['page_size'])->limit($input['page_size']);
        if(!empty($input['sort']) && !empty($input['order'])) $builder->orderBy('rrpt.'.$input['sort'],$input['order']);
        $obj_list = $builder->get();
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
            'rrpt.id as '.$this->apiPrimaryKey,
            'rrpt.name',
            'rrpt.factory_id',
            'rf.name as factory_name',
            'rrpt.code',
        ];
        $obj = DB::table($this->table.' as rrpt')->select($field)
            ->leftJoin(config('alias.rf').' as rf','rf.id','rrpt.factory_id')
            ->where('rrpt.id',$id)->first();
        if(!$obj) TEA('404');
        return $obj;
    }

    /**
     * select列表
     * @author hao.wei <weihao>
     */
    public function getRankPlanTypeList($input){
        $where = [];
        $superman = (!empty(session('administrator')->superman)) ? session('administrator')->superman : 0;
        if(!$superman) {
            if(!empty(session('administrator')->company_id)) $where[] = ['rrpt.company_id','=',session('administrator')->company_id];
            if(!empty(session('administrator')->factory_id)) $where[] = ['rrpt.factory_id','=',session('administrator')->factory_id];
        }
        $obj_list = DB::table($this->table.' as rrpt')->select('rrpt.id','rrpt.name','rrpt.code')
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
        ];
        $res = DB::table($this->table)->where($this->primaryKey,$input[$this->apiPrimaryKey])->update($data);
        if($res === false) TEA('804');
    }

//endregion

//region 删

    /**
     * 删除班次
     * @param $id
     * @throws \App\Exceptions\ApiException
     * @author hao.wei <weihao>
     */
    public function delete($id){
        $has = $this->isExisted([['type_id','=',$id]],config('alias.rrp'));
        if($has) TEA('1164');
        $res = DB::table($this->table)->where($this->primaryKey,$id)->delete();
        if(!$res) TEA('803');
    }

//endregion
}