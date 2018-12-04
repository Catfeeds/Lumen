<?php
/**
 * Created by PhpStorm.
 * User: haoziye
 * Date: 2018/2/3
 * Time: 下午5:58
 */
namespace App\Http\Models;
use Illuminate\Support\Facades\DB;

class RankPlan extends Base{

    public $apiPrimaryKey = 'rankplan_id';

    public function __construct()
    {
        parent::__construct();
        if(!$this->table) $this->table = config('alias.rrp');
    }

//region 检

    public function checkFormField(&$input){
        $add = $this->judgeApiOperationMode($input);
        if(empty($input['from'])) TEA('700','from');
        if(empty($input['to'])) TEA('700','to');
        if(empty($input['work_date'])) TEA('700','work_date');
        if($add){
            if(empty($input['type_id'])) TEA('700','type_id');
            $has = $this->isExisted([['id','=',$input['type_id']]],config('alias.rrpt'));
            if(!$has) TEA('1165');
        }
        $now = time();
        $from = strtotime(date('Y-m-d',$now).$input['from']);
        $to = strtotime(date('Y-m-d',$now).$input['to']);
        if($from >= $to) TEA('1163','from');
//        $where = $add?[]:[['id','<>',$input[$this->apiPrimaryKey]]];
//        $otherTime = DB::table($this->table)->select('from','to')->where($where)->get();
//        foreach($otherTime as $k=>$v){
//            $otherFrom = strtotime(date('Y-m-d',$now).$v->from);
//            $otherTo = strtotime(date('Y-m-d',$now).$v->to);
//            if(($from >= $otherFrom && $from < $otherTo) || ($to > $otherFrom && $to <= $otherTo)) TEA('1162');
//            if($from == $otherFrom && $to == $otherTo) TEA('1162');
//            if($from < $otherFrom && $to > $otherTo) TEA('1162');
//        }
        if(empty($input['rest_time']) || !is_json($input['rest_time'])) TEA('700','rest_time');
        $rest_time = json_decode($input['rest_time'],true);
        $input['work_time'] = $to - $from;
        foreach ($rest_time as $k=>$v){
            if(empty($v['rest_from'])) TEA('700','rest_from');
            if(empty($v['rest_to'])) TEA('700','rest_to');
            if(!isset($v['comment'])) TEA('700','comment');
            $restFrom = strtotime(date('Y-m-d',$now).$v['rest_from']);
            $restTo = strtotime(date('Y-m-d',$now).$v['rest_to']);
            if($restFrom >= $restTo) TEA('1163','rest_from');
            if($restFrom < $from || $restFrom > $to || $restTo < $from || $restTo > $to) TEA('1161');
            $rest_time = $restTo - $restFrom;
            $input['work_time'] -= $rest_time;
        }
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
        $rankData = [
            'from'=>$input['from'],
            'to'=>$input['to'],
            'rest_time'=>$input['rest_time'],
            'work_time'=>$input['work_time'],
            'work_date'=>$input['work_date'],
            'type_id'=>$input['type_id'],
        ];
        $insert_id = DB::table($this->table)->insertGetId($rankData);
        if(!$insert_id) TEA('802');
        return $insert_id;
    }

//endregion

//region 查

    public function getRankPlanListByPage(&$input){
        $field = [
            'rrp.id as '.$this->apiPrimaryKey,
            'rrp.from',
            'rrp.to',
            'rrp.rest_time',
            'rrp.work_date',
            'rrpt.name as type_name'
        ];
        $where = [];
        $superman = (!empty(session('administrator')->superman)) ? session('administrator')->superman : 0;
        if(!$superman) {
            if(!empty(session('administrator')->company_id)) $where[] = ['rrpt.company_id','=',session('administrator')->company_id];
            if(!empty(session('administrator')->factory_id)) $where[] = ['rrpt.factory_id','=',session('administrator')->factory_id];
        }
        if(!empty($input['type_id'])) $where[] = ['rrp.type_id','=',$input['type_id']];
        $builder = DB::table($this->table.' as rrp')->select($field)
            ->leftJoin(config('alias.rrpt').' as rrpt','rrpt.id','rrp.type_id')
            ->where($where);
        $input['total_records'] = $builder->count();
        $builder->offset(($input['page_no'] - 1) * $input['page_size'])->limit($input['page_size']);
        if(!empty($input['sort']) && !empty($input['order'])) $builder->orderBy('rrp.'.$input['sort'],$input['order']);
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
            'rrp.id as '.$this->apiPrimaryKey,
            'rrp.from',
            'rrp.to',
            'rrp.rest_time',
            'rrp.work_date',
            'rrpt.name as type_name'
        ];
        $obj = DB::table($this->table.' as rrp')->select($field)
            ->leftJoin(config('alias.rrpt').' as rrpt','rrpt.id','rrp.type_id')
            ->where('rrp.id',$id)->first();
        if(!$obj) TEA('404');
        return $obj;
    }

    /**
     * select列表
     * @author hao.wei <weihao>
     */
    public function getRankPlanList($input){
        $field = [
            'rrp.*',
            'rrpt.name as type_name'
        ];
        $where = [];
        $superman = (!empty(session('administrator')->superman)) ? session('administrator')->superman : 0;
        if(!$superman) {
            if(!empty(session('administrator')->company_id)) $where[] = ['rrpt.company_id','=',session('administrator')->company_id];
            if(!empty(session('administrator')->factory_id)) $where[] = ['rrpt.factory_id','=',session('administrator')->factory_id];
        }
        if(!empty($input['type_id'])) $where[] = ['rrp.type_id','=',$input['type_id']];
        $obj_list = DB::table($this->table.' as rrp')->select($field)
            ->leftJoin(config('alias.rrpt').' as rrpt','rrp.type_id','rrpt.id')
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
            'from'=>$input['from'],
            'to'=>$input['to'],
            'rest_time'=>$input['rest_time'],
            'work_time'=>$input['work_time'],
            'work_date'=>$input['work_date'],
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
        $has = $this->isExisted([['rankplan_id','=',$id]],config('alias.rwcr'));
        if($has) TEA('1164');
        $res = DB::table($this->table)->where($this->primaryKey,$id)->delete();
        if(!$res) TEA('803');
    }

//endregion
}