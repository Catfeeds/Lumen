<?php
/**
 * Created by PhpStorm.
 * User: haoziye
 * Date: 2018/2/3
 * Time: 下午5:58
 */
namespace App\Http\Models;
use Illuminate\Support\Facades\DB;

class WorkBenchOperationAbility extends Base{

    public $apiPrimaryKey = 'workbench_operation_id';

    public function __construct()
    {
        parent::__construct();
        if(!$this->table) $this->table = config('alias.rwboa');
    }

//region 检

    /**
     * @param $input
     * @throws \App\Exceptions\ApiException
     */
    public function checkFormField(&$input){
        if(empty($input['workbench_id'])) TEA('700','workbench_id');
        $has = $this->isExisted([['id','=',$input['workbench_id']]],config('alias.rwb'));
        if(!$has) TEA('1159');
        if(empty($input['operation_to_ability'])) TEA('700','operation_to_ability');
        $input['operation_to_ability'] = json_decode($input['operation_to_ability'],true);
        if(!count($input['operation_to_ability'])) TEA('700','operation_to_ability');
        $input['data'] = [];
        foreach($input['operation_to_ability'] as $k=>$v){
            if(empty($v['operation_to_ability_id'])) TEA('700','operation_to_ability');
            $has = $this->isExisted([['workbench_id','=',$input['workbench_id']],['operation_to_ability_id','=',$v['operation_to_ability_id']]]);
            if($has) TEA('700','operation_to_ability');
//            if(empty($v['value'])) TEA('700','operation_to_ability');
            $ability = $this->getRecordById($v['operation_to_ability_id'],['operation_id'],config('alias.rioa'));
            if(empty($ability)) TEA('700','operation_to_ability');
            $input['data'][] = [
                'workbench_id'=>$input['workbench_id'],
                'operation_to_ability_id'=>$v['operation_to_ability_id'],
//                'value'=>$v['value'],
                'operation_id'=>$ability->operation_id,
            ];
        }
    }

//endregion

//region 增

    /**
     * 添加
     * @param array $input
     * @throws \App\Exceptions\ApiException
     * @author Hao.wei <weihao>
     */
    public function add($input){
        $res = DB::table($this->table)->insert($input['data']);
        if(!$res) TEA('802');
    }

//endregion

//region 查

    public function getWorkBenchOperationListByPage(&$input){
        $field = [
            'rwboa.id as '.$this->apiPrimaryKey,
            'rwboa.value',
            'rioa.ability_name',
            'rio.code as operation_code',
            'rio.name as opeartion_name',
            'rf.name as factory_name',
            'rwb.name as workbench_name',
            'rws.name as workshop_name',
            'rwc.name as workcenter_name',
            'riw.id as workhour_id',
            'riw.multiple',
            'riw.preparation_hour',
            'riw.rated_value',
            'riw.ability_value',
            'riw.type as workhour_type',
            'riw.quantity_interval',
        ];
        $where = [];
        if(!empty($input['factory_id'])) $where[] = ['rf.id','=',$input['factory_id']];
        if(!empty($input['workshop_id'])) $where[] = ['rws.id','=',$input['workshop_id']];
        if(!empty($input['workcenter_id'])) $where[] = ['rwc.id','=',$input['workcenter_id']];
        if(!empty($input['workbench_id'])) $where[] = ['rwboa.workbench_id','=',$input['workbench_id']];
        if(!empty($input['operation_code'])) $where[] = ['rio.code','like','%'.$input['operation_code'].'%'];
        if(!empty($input['operation_name'])) $where[] = ['rio.name','like','%'.$input['operation_name'].'%'];
        $builder = DB::table($this->table.' as rwboa')->select($field)
            ->leftJoin(config('alias.rwb').' as rwb','rwb.id','=','rwboa.workbench_id')
            ->leftJoin(config('alias.rwc').' as rwc','rwc.id','=','rwb.workcenter_id')
            ->leftJoin(config('alias.rws').' as rws','rws.id','=','rwc.workshop_id')
            ->leftJoin(config('alias.rf').' as rf','rf.id','=','rws.factory_id')
            ->leftJoin(config('alias.rioa').' as rioa','rioa.id','=','rwboa.operation_to_ability_id')
            ->leftJoin(config('alias.rio').' as rio','rio.id','=','rioa.operation_id')
            ->leftJoin(config('alias.riw').' as riw',[['rioa.ability_id','=','riw.ability_id'],['rwboa.operation_id','=','riw.operation_id']])
            ->where($where);
        $input['total_records'] = $builder->count();
        $builder->offset(($input['page_no'] - 1) * $input['page_size'])->limit($input['page_size']);
        if(!empty($input['sort']) && !empty($input['order'])) $builder->orderBy('rwboa.'.$input['sort'],$input['order']);
        $obj_list = $builder->get();
        return $obj_list;
    }

    public function getWorkBenchOperationList($input){
        $field = [
            'rwboa.id as '.$this->apiPrimaryKey,
            'rwboa.value',
            'rioa.ability_name',
            'rio.code as operation_code',
            'rio.name as opeartion_name',
            'rf.name as factory_name',
            'rwb.name as workbench_name',
            'rws.name as workshop_name',
            'rwc.name as workcenter_name',
        ];
        $where = [];
        if(!empty($input['factory_id'])) $where[] = ['rf.id','=',$input['factory_id']];
        if(!empty($input['workshop_id'])) $where[] = ['rws.id','=',$input['workshop_id']];
        if(!empty($input['workcenter_id'])) $where[] = ['rwc.id','=',$input['workcenter_id']];
        if(!empty($input['workbench_id'])) $where[] = ['rwboa.workbench_id','=',$input['workbench_id']];
        if(!empty($input['operation_code'])) $where[] = ['rio.code','like','%'.$input['operation_code'].'%'];
        if(!empty($input['operation_name'])) $where[] = ['rio.name','like','%'.$input['operation_name'].'%'];
        $obj_list = DB::table($this->table.' as rwboa')->select($field)
            ->leftJoin(config('alias.rwb').' as rwb','rwb.id','=','rwboa.workbench_id')
            ->leftJoin(config('alias.rwc').' as rwc','rwc.id','=','rwb.workcenter_id')
            ->leftJoin(config('alias.rws').' as rws','rws.id','=','rwc.workshop_id')
            ->leftJoin(config('alias.rf').' as rf','rf.id','=','rws.factory_id')
            ->leftJoin(config('alias.rioa').' as rioa','rioa.id','=','rwboa.operation_to_ability_id')
            ->leftJoin(config('alias.rio').' as rio','rio.id','=','rioa.operation_id')
            ->where($where)->get();
        return $obj_list;
    }

    /**
     * 详情
     *
     * 根据工序和能力 去查工时
     *
     * @param $id
     * @return mixed
     * @throws \App\Exceptions\ApiException
     */
    public function get($id){
        $field = [
            'rwboa.id as '.$this->apiPrimaryKey,
            'rwboa.value',
            'rioa.ability_name',
            'rio.code as operation_code',
            'rio.name as opeartion_name',
            'rf.name as factory_name',
            'rwb.name as workbench_name',
            'rws.name as workshop_name',
            'rwc.name as workcenter_name',
            'riw.id as workhour_id',
            'riw.multiple',
            'riw.preparation_hour',
            'riw.rated_value',
            'riw.ability_value',
            'riw.type as workhour_type',
            'riw.quantity_interval',
        ];
        $obj = DB::table($this->table.' as rwboa')->select($field)
            ->leftJoin(config('alias.rwb').' as rwb','rwb.id','=','rwboa.workbench_id')
            ->leftJoin(config('alias.rwc').' as rwc','rwc.id','=','rwb.workcenter_id')
            ->leftJoin(config('alias.rws').' as rws','rws.id','=','rwc.workshop_id')
            ->leftJoin(config('alias.rf').' as rf','rf.id','=','rws.factory_id')
            ->leftJoin(config('alias.rioa').' as rioa','rioa.id','=','rwboa.operation_to_ability_id')
            ->leftJoin(config('alias.rio').' as rio','rio.id','=','rioa.operation_id')
            ->leftJoin(config('alias.riw').' as riw',[['rioa.ability_id','=','riw.ability_id'],['rwboa.operation_id','=','riw.operation_id']])
            ->where('rwboa.id',$id)->first();
        if(!$obj) TEA('404');
        return $obj;
    }

    /**
     * 旧产能 需要优化
     * @param $input
     * @author hao.wei <weihao>
     */
    public function getCapacityList(&$input){
        if(empty($input['factory_id'])) TEA('700','factory_id');
        if(empty($input['workshop_id'])) TEA('700','workshoip_id');
        $operationList = $this->getDistinctOperationIdByPage($input);
        $newOperationList = [];
        foreach($operationList as $k=>$v){
            $operationAbilityList = $this->getOperationAbilityValueListByOperationId($v->operation_id,$input);
            foreach ($operationAbilityList as $h=>$z){
                $newOperationList[] = [
                    'operation_to_ability_id'=>$z->operation_to_ability_id,
                    'value'=>$z->value,
                    'ability_name'=>$z->ability_name,
                    'operation_id'=>$z->operation_id,
                    'operation_code'=>$z->operation_code,
                    'opeartion_name'=>$z->opeartion_name,
                    'workcenter_id'=>$z->workcenter_id,
                ];
            }
        }
        $thenOperationList = [];
        foreach ($newOperationList as $k=>&$v){
            $workTimeList = DB::table(config('alias.rwcr').' as rwcr')->select('rrp.work_time')
                ->leftJoin(config('alias.rrp').' as rrp','rrp.id','rwcr.rankplan_id')
                ->where('rwcr.workcenter_id',$v['workcenter_id'])->get();
            $v['capacity'] = 0;
            foreach($workTimeList as $h=>$z){
                $v['capacity'] += intval($z->work_time / 60) * $v['value'];
            }
            $has = false;
            $index = 0;
            foreach ($thenOperationList as $h=>$z){
                if($z['operation_to_ability_id'] == $v['operation_to_ability_id']){
                    $has = true;
                    $index = $h;
                }
            }
           if($has){
               $thenOperationList[$index]['capacity'] += $newOperationList[$k]['capacity'];
           }else{
               $thenOperationList[] = [
                   'operation_to_ability_id'=>$v['operation_to_ability_id'],
                   'ability_name'=>$v['ability_name'],
                   'operation_id'=>$v['operation_id'],
                   'operation_code'=>$v['operation_code'],
                   'opeartion_name'=>$v['opeartion_name'],
                   'capacity'=>$v['capacity'],
               ];
           }
        }
        $capacityList = [];
        foreach($thenOperationList as $k=>$v){
            $has = false;
            $index = 0;
            foreach($capacityList as $h=>$z){
                if($z['operation_id'] == $v['operation_id']){
                    $has = true;
                    $index = $h;
                }
            }
            if($has){
                $capacityList[$index]['ability'][] = [
                    'operation_to_ability_id'=>$v['operation_to_ability_id'],
                    'ability_name'=>$v['ability_name'],
                    'capacity'=>$v['capacity'],
                ];
            }else{
                $capacityList[] = [
                    'operation_id'=>$v['operation_id'],
                    'operation_code'=>$v['operation_code'],
                    'opeartion_name'=>$v['opeartion_name'],
                    'ability'=>[
                        [
                            'operation_to_ability_id'=>$v['operation_to_ability_id'],
                            'ability_name'=>$v['ability_name'],
                            'capacity'=>$v['capacity'],
                        ]
                    ]
                ];
            }
        }
        return $capacityList;
    }

    /**
     * 根据operation_id获取工序能力值
     * @param $operation_id
     * @author hao.wei <weihao>
     */
    public function getOperationAbilityValueListByOperationId($operation_id,$input){
        $field = [
            'rwboa.operation_to_ability_id',
            'rwboa.value',
            'rioa.ability_name',
            'rioa.operation_id',
            'rio.code as operation_code',
            'rio.name as opeartion_name',
            'rwc.id as workcenter_id',
            'rwboa.workbench_id',
            'rwb.name as workbench_name'
        ];
        $where = [];
        $where[] = ['rwboa.operation_id','=',$operation_id];
        $where[] = ['rwb.status','=',1];
        if(!empty($input['factory_id'])) $where[] = ['rf.id','=',$input['factory_id']];
        if(!empty($input['workshop_id'])) $where[] = ['rws.id','=',$input['workshop_id']];
        if(!empty($input['workcenter_id'])) $where[] = ['rwc.id','=',$input['workcenter_id']];
        $obj_list = DB::table($this->table.' as rwboa')
            ->select($field)
            ->leftJoin(config('alias.rioa').' as rioa','rwboa.operation_to_ability_id','rioa.id')
            ->leftJoin(config('alias.rio').' as rio','rioa.operation_id','rio.id')
            ->leftJoin(config('alias.rwb').' as rwb','rwb.id','=','rwboa.workbench_id')
            ->leftJoin(config('alias.rwc').' as rwc','rwc.id','=','rwb.workcenter_id')
            ->leftJoin(config('alias.rws').' as rws','rws.id','rwc.workshop_id')
            ->leftJoin(config('alias.rf').' as rf','rf.id','rws.factory_id')
            ->where($where)->get();
        return $obj_list;
    }

    /**
     * 获取不重复工序id列表
     * @author hao.wei <weihao>
     */
    public function getDistinctOperationIdByPage(&$input){
        $field = [
            'rwboa.operation_id',
        ];
        $where = [];
        $where[] = ['rwb.status','=',1];
        if(!empty($input['factory_id'])) $where[] = ['rf.id','=',$input['factory_id']];
        if(!empty($input['workshop_id'])) $where[] = ['rws.id','=',$input['workshop_id']];
        if(!empty($input['workcenter_id'])) $where[] = ['rwc.id','=',$input['workcenter_id']];
        $builder = DB::table($this->table.' as rwboa')
            ->select(DB::raw('distinct rwboa.operation_id'))
            ->addSelect($field)
            ->leftJoin(config('alias.rwb').' as rwb','rwb.id','rwboa.workbench_id')
            ->leftJoin(config('alias.rwc').' as rwc','rwc.id','rwb.workcenter_id')
            ->leftJoin(config('alias.rws').' as rws','rws.id','rwc.workshop_id')
            ->leftJoin(config('alias.rf').' as rf','rf.id','rws.factory_id')
            ->where($where);
        $input['total_records'] = $builder->count(DB::raw('distinct rwboa.operation_id'));
        $builder->offset(($input['page_no'] - 1) * $input['page_size'])->limit($input['page_size']);
        if(!empty($input['sort']) && !empty($input['order'])) $builder->orderBy('rwboa.'.$input['sort'],$input['order']);
        $obj_list = $builder->get();
        return $obj_list;
    }

    /**
     *新产能
     * @param $input
     */
    public function getNewCapacityList(&$input){
        if(empty($input['factory_id'])) TEA('700','factory_id');
        if(empty($input['workshop_id'])) TEA('700','workshoip_id');
        $operationList = $this->getDistinctOperationIdByPage($input);
        $newOperationList = [];
        foreach($operationList as $k=>$v){
            $operationAbilityList = $this->getOperationAbilityValueListByOperationId($v->operation_id,$input);
            foreach ($operationAbilityList as $h=>$z){
                $newOperationList[] = [
                    'operation_to_ability_id'=>$z->operation_to_ability_id,
                    'value'=>$z->value,
                    'ability_name'=>$z->ability_name,
                    'operation_id'=>$z->operation_id,
                    'operation_code'=>$z->operation_code,
                    'opeartion_name'=>$z->opeartion_name,
                    'workcenter_id'=>$z->workcenter_id,
                ];
            }
        }
        $thenOperationList = [];
        foreach ($newOperationList as $k=>&$v){
            $v['capacity'] = $this->getEveryAbilityCapacity($v['value'],$v['workcenter_id']);
            $has = false;
            $index = 0;
            foreach ($thenOperationList as $h=>$z){
                if($z['operation_to_ability_id'] == $v['operation_to_ability_id']){
                    $has = true;
                    $index = $h;
                    break;
                }
            }
            if($has){
                foreach($v['capacity'] as $j=>$w){
                    $thenOperationList[$index]['capacity'][$j] += $w;
                }
            }else{
                $thenOperationList[] = [
                    'operation_to_ability_id'=>$v['operation_to_ability_id'],
                    'ability_name'=>$v['ability_name'],
                    'operation_id'=>$v['operation_id'],
                    'operation_code'=>$v['operation_code'],
                    'opeartion_name'=>$v['opeartion_name'],
                    'capacity'=>$v['capacity'],
                ];
            }
        }
        $capacityList = [];
        foreach($thenOperationList as $k=>$v){
            $has = false;
            $index = 0;
            foreach($capacityList as $h=>$z){
                if($z['operation_id'] == $v['operation_id']){
                    $has = true;
                    $index = $h;
                    break;
                }
            }
            if($has){
                $capacityList[$index]['ability'][] = [
                    'operation_to_ability_id'=>$v['operation_to_ability_id'],
                    'ability_name'=>$v['ability_name'],
                    'capacity'=>$v['capacity'],
                ];
            }else{
                $capacityList[] = [
                    'operation_id'=>$v['operation_id'],
                    'operation_code'=>$v['operation_code'],
                    'opeartion_name'=>$v['opeartion_name'],
                    'ability'=>[
                        [
                            'operation_to_ability_id'=>$v['operation_to_ability_id'],
                            'ability_name'=>$v['ability_name'],
                            'capacity'=>$v['capacity'],
                        ]
                    ]
                ];
            }
        }
        return $capacityList;
    }


    /**
     * 获取每个能力的产能(新产能)
     * @param $value
     * @param $workcenter_id
     * @return array
     */
    public function getEveryAbilityCapacity($value,$workcenter_id){
        $workTimeList = DB::table(config('alias.rwcr').' as rwcr')->select('rrp.work_time','rrp.work_date')
            ->leftJoin(config('alias.rrp').' as rrp','rrp.id','rwcr.rankplan_id')
            ->where('rwcr.workcenter_id',$workcenter_id)->get();
        $capacity = [];
        for($i = 0;$i < 7;$i++){
            $capacity[] = 0;
        }
        foreach($workTimeList as $k=>$v){
            $work_date = json_decode($v->work_date,true);
            foreach ($work_date as $h=>$j){
                $capacity[$j] += $v->work_time;
            }
        }
        return $capacity;
    }

//endregion

//region 修

    /**
     * 修改
     * @param $input
     * @throws \App\Exceptions\ApiException
     * @author hao.wei <weihao>
     */
    public function update($input){
        $data = [
            'value'=>$input['value'],
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