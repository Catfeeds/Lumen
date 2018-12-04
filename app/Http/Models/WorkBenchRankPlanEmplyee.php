<?php
/**
 * Created by PhpStorm.
 * User: haoziye
 * Date: 2018/3/2
 * Time: 上午8:57
 */
namespace App\Http\Models;
use Illuminate\Support\Facades\DB;

class WorkBenchRankPlanEmplyee extends Base{

    public $apiPrimaryKey = 'workbench_rankplan_emplyee_id';

    public function __construct()
    {
        parent::__construct();
        if(!$this->table) $this->table = config('alias.rwbre');
    }

//region 检

    /**
     *
     * @param $input
     */
    public function checkFormField(&$input){
        if(empty($input['workbench_id'])) TEA('700','workbench_id');
        $has = $this->isExisted([['id','=',$input['workbench_id']]],config('alias.rwb'));
        if(!$has) TEA('1159');
        if(!isset($input['rankpan_emplyees']) || !is_json($input['rankpan_emplyees'])) TEA('700','rankpan_emplyees');
        $input['rankpan_emplyees'] = json_decode($input['rankpan_emplyees'],true);
        $input['data'] = [];
        foreach($input['rankpan_emplyees'] as $k=>$v){
            if(empty($v['rankplan_id'])) TEA('700','rankplan_id');
            $has = $this->isExisted([['id','=',$v['rankplan_id']]],config('alias.rrp'));
            if(!$has) TEA('1156');
            if(empty($v['emplyee_id'])) TEA('700','emplyee_id');
            $has = $this->isExisted([['id','=',$v['emplyee_id']],['status_id','=','1']],config('alias.re'));
            if(!$has) TEA('1158');
            $input['data'][] = [
                'workbench_id'=>$input['workbench_id'],
                'rankplan_id'=>$v['rankplan_id'],
                'emplyee_id'=>$v['emplyee_id'],
            ];
        }
    }

//endregion

//region 查

    /**
     * 获取班次关联的人员列表
     * @param $input
     * @author hao.wei <weihao>
     */
    public function getWorkBenchRankPlanEmplyeeList($input){
        $field = [
            'rwbre.id as '.$this->apiPrimaryKey,
            'rwbre.rankplan_id',
            'rwbre.emplyee_id',
            'rrp.from',
            'rrp.to',
            'rrp.rest_time',
            'rrp.work_date',
            'rrpt.name as type_name',
            're.name as emplyee_name'
        ];
        $where = [];
        if(!empty($input['workbench_id'])) $where[] = ['rwbre.workbench_id','=',$input['workbench_id']];
        $obj_list = DB::table($this->table.' as rwbre')->select($field)
            ->leftJoin(config('alias.rrp').' as rrp','rrp.id','rwbre.rankplan_id')
            ->leftJoin(config('alias.rrpt').' as rrpt','rrpt.id','rrp.type_id')
            ->leftJoin(config('alias.re').' as re','rwbre.emplyee_id','re.id')
            ->where($where)->get();
        return $obj_list;
    }

//endregion

//region 修

    /**
     * 修改班次关联的人员
     * @param $input
     * @author hao.wei <weihao>
     */
    public function updateWorkBenchRankPlanEmplyee($input){
        try{
            DB::connection()->beginTransaction();
            DB::table($this->table)->where('workbench_id','=',$input['workbench_id'])->delete();
            DB::table($this->table)->insert($input['data']);
        }catch(\Apiexception $exception){
            DB::connection()->rollback();
            TEA($exception->getCode());
        }
        DB::connection()->commit();
    }

//endregion

}