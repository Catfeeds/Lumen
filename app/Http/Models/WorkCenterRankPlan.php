<?php
/**
 * Created by PhpStorm.
 * User: haoziye
 * Date: 2018/3/7
 * Time: 下午2:09
 */
namespace App\Http\Models;
use Illuminate\Support\Facades\DB;

class WorkCenterRankPlan extends Base{

    public $apiPrimaryKey = 'workcenter_to_rankplan_id';

    public function __construct()
    {
        parent::__construct();
        if(empty($this->table)) $this->table = config('alias.rwcr');
    }

//region 检

    public function checkFromField(&$input){
        if(empty($input['workcenter_id'])) TEA('700','workcenter_id');
        $has = $this->isExisted([['id','=',$input['workcenter_id']]],config('alias.rwc'));
        if(!$has) TEA('1157');
        if(empty($input['rankplans']) || !is_json($input['rankplans'])) TEA('700','rankplans');
        $input['rankplans'] = json_decode($input['rankplans'],true);
        $input['data'] = [];
        $now = time();
        foreach ($input['rankplans'] as $k=>$v){
            $rankplan = DB::table(config('alias.rrp'))->select('from','to','work_date')->where('id',$v)->first();
            if(!$rankplan) TEA('1156');
            $from = strtotime(date('Y-m-d',$now).$rankplan->from);
            $to = strtotime(date('Y-m-d',$now).$rankplan->to);
            foreach ($input['data'] as $h=>$j){
                $otherRankplan = DB::table(config('alias.rrp'))->select('from','to','work_date')->where('id',$j['rankplan_id'])->first();
                $arr = array_intersect(json_decode($rankplan->work_date,true),json_decode($otherRankplan->work_date,true));
                if(!empty($arr)){
                    $otherFrom = strtotime(date('Y-m-d',$now).$otherRankplan->from);
                    $otherTo = strtotime(date('Y-m-d',$now).$otherRankplan->to);
                    if(($from >= $otherFrom && $from < $otherTo) || ($to > $otherFrom && $to <= $otherTo)) TEA('1162');
                    if($from == $otherFrom && $to == $otherTo) TEA('1162');
                    if($from < $otherFrom && $to > $otherTo) TEA('1162');
                }
            }
            $input['data'][] = [
                'workcenter_id'=>$input['workcenter_id'],
                'rankplan_id'=>$v,
            ];
        }
    }

//endregion

//region 修

    /**
     * 更新
     * @param $input
     */
    public function update($input){
        try{
            DB::connection()->beginTransaction();
            DB::table($this->table)->where('workcenter_id',$input['workcenter_id'])->delete();
            DB::table($this->table)->insert($input['data']);
        }catch (\ApiException $e){
            DB::connection()->rollback();
            TEA($e->getCode());
        }
        DB::connection()->commit();
    }

//endregion

//region 查

    /**
     * 查找工作中心关联的工序
     * @param $id
     * @author hao.wei <weihao>
     */
    public function getWorkCenterRankPlan($id){
        $field = [
            'rwcr.rankplan_id',
            'rrp.from',
            'rrp.to',
            'rrp.rest_time',
            'rrp.work_date',
            'rrpt.name as type_name',
        ];
        $list = DB::table($this->table.' as rwcr')->select($field)
            ->leftJoin(config('alias.rrp').' as rrp','rrp.id','=','rwcr.rankplan_id')
            ->leftJoin(config('alias.rrpt').' as rrpt','rrpt.id','rrp.type_id')
            ->where('rwcr.workcenter_id',$id)->get();
        return $list;
    }

//endregion
}