<?php
/**
 * Created by PhpStorm.
 * User: haoziye
 * Date: 2018/3/7
 * Time: 下午2:09
 */
namespace App\Http\Models;
use Illuminate\Support\Facades\DB;

class WorkCenterOperation extends Base{

    public $apiPrimaryKey = 'workcenter_to_operation_id';

    public function __construct()
    {
        parent::__construct();
        if(empty($this->table)) $this->table = config('alias.rwco');
    }

//region 检

    public function checkFromField(&$input){
        if(empty($input['workcenter_id'])) TEA('700','workcenter_id');
        $has = $this->isExisted([['id','=',$input['workcenter_id']]],config('alias.rwc'));
        if(!$has) TEA('1157');
        if(!isset($input['operation_info']) || !is_json($input['operation_info'])) TEA('700','operation_info');
        if(!isset($input['step_info']) || !is_json($input['step_info'])) TEA('700','step_info');
        $input['operation_info'] = json_decode($input['operation_info'],true);
        $input['step_info'] = json_decode($input['step_info'],true);
        $input['input_ref_operation_info'] = [];
        foreach ($input['operation_info'] as $k=>$v){
            $has = $this->isExisted([['id','=',$v['operation_id']]],config('alias.rio'));
            if(!$has) TEA('1167');
            $input['input_ref_operation_info'][$v['operation_id']] = $v;
        }
        $input['input_ref_step_info'] = [];
        foreach ($input['step_info'] as $k=>$v){
            $has = $this->isExisted([['id','=',$v['step_id']]],config('alias.rpf'));
            if(!$has) TEA('1168');
            $input['input_ref_step_info'][$v['step_id'].'-'.$v['operation_id']] = $v;
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
            $this->saveWorkcenterOperation($input);
            $this->saveWorkcenterStep($input);
        }catch (\ApiException $e){
            DB::connection()->rollback();
            TEA($e->getCode());
        }
        DB::connection()->commit();
    }

    /**
     * 保存工作中心的的工序
     * @param $input
     */
    public function saveWorkcenterOperation($input){
        $db_operation_info = DB::table(config('alias.rwco'))->where('workcenter_id',$input['workcenter_id'])->get();
        $db_operation_info = obj2array($db_operation_info);
        $db_ref_operation_info = [];
        foreach ($db_operation_info as $k=>$v){
            $db_ref_operation_info[$v['operation_id']] = $v;
        }
        $set = get_array_diff_intersect(array_keys($input['input_ref_operation_info']),array_keys($db_ref_operation_info));
        //要添加的
        if(!empty($set['add_set'])){
            $add_data = [];
            foreach ($set['add_set'] as $k=>$v){
                if(empty($v)) continue;
                $add_data[] = [
                    'workcenter_id'=>$input['workcenter_id'],
                    'operation_id'=>$input['input_ref_operation_info'][$v]['operation_id'],
                ];
            }
            DB::table(config('alias.rwco'))->insert($add_data);
        }
        //要编辑,暂不考虑
        //要删除
        if(!empty($set['del_set'])){
            $det_data = [];
            foreach ($set['del_set'] as $k=>$v){
                if(empty($v)) continue;
                $det_data[] = $db_ref_operation_info[$v]['id'];
            }
            DB::table(config('alias.rwco'))->whereIn('id',$det_data)->delete();
            //删除工作中心下相关的步骤
            DB::table(config('alias.rwcos'))->where('workcenter_id',$input['workcenter_id'])->whereIn('operation_id',$det_data)->delete();
            //删除工作中心工作台的能力
            DB::table(config('alias.rwboa').' as rwboa')
                ->leftJoin(config('alias.rwb').' as rwb','rwb.id','rwboa.workbench_id')
                ->where('rwb.workcenter_id',$input['workcenter_id'])
                ->whereIn('rwboa.operation_id',$det_data)
                ->delete();
        }
    }

    /**
     * 保存工作中兴关联的能力(不用了)
     * @param $input
     */
    public function saveWorkcenterOperationAbility($input){
        $db_ability_info = DB::table(config('alias.rwcoa'))->where('workcenter_id',$input['workcenter_id'])->get();
        $db_ability_info = obj2array($db_ability_info);
        $db_ref_ability_info = [];
        foreach ($db_ability_info as $k=>$v){
            $db_ref_ability_info[$v['operation_to_ability_id'].'-'.$v['routing_id']] = $v;
        }
        $set = get_array_diff_intersect(array_keys($input['input_ref_ability_info']),array_keys($db_ref_ability_info));
        //要添加的
        if(!empty($set['add_set'])){
            $add_data = [];
            foreach ($set['add_set'] as $k=>$v){
                if(empty($v)) continue;
                $add_data[] = [
                    'workcenter_id'=>$input['workcenter_id'],
                    'operation_id'=>$input['input_ref_ability_info'][$v]['operation_id'],
                    'operation_to_ability_id'=>$input['input_ref_ability_info'][$v]['operation_to_ability_id'],
                    'routing_id'=>$input['input_ref_ability_info'][$v]['routing_id'],
                ];
            }
            DB::table(config('alias.rwcoa'))->insert($add_data);
        }
        //要编辑,暂不考虑
        //要删除
        if(!empty($set['del_set'])){
            $del_data = [];
            foreach ($set['del_set'] as $k=>$v){
                if(empty($v)) continue;
                $del_data[] = $db_ref_ability_info[$v]['id'];
            }
            DB::table(config('alias.rwcoa'))->whereIn('id',$del_data)->delete();
            //删除工作中心下工作台的能力
            DB::table(config('alias.rwboa').' as rwboa')
                ->leftJoin(config('alias.rwb').' as rwb','rwb.id','rwboa.workbench_id')
                ->where('rwb.workcenter_id',$input['workcenter_id'])
                ->whereIn('rwboa.operation_to_ability_id',$del_data)
                ->delete();
        }
    }

    /**
     * 保存工作中心工艺路线（不用了）
     * @param $input
     */
    public function saveWorkcenterRouting($input){
        $db_routing_info = DB::table(config('alias.rwr'))->where('workcenter_id',$input['workcenter_id'])->get();
        $db_routing_info = obj2array($db_routing_info);
        $db_ref_routing_info = [];
        foreach ($db_routing_info as $k=>$v){
            $db_ref_routing_info[$v['routing_id']] = $v;
        }
        $set = get_array_diff_intersect(array_keys($input['routing_info']),array_keys($db_ref_routing_info));
        //要添加
        if(!empty($set['add_set'])){
            $add_data = [];
            foreach ($set['add_set'] as $k=>$v){
                if(empty($v)) continue;
                $add_data[] = [
                    'routing_id'=>$v,
                    'workcenter_id'=>$input['workcenter_id'],
                ];
            }
            DB::table(config('alias.rwr'))->insert($add_data);
        }
        //要编辑，暂不考虑（因为这边没有冗余其他字段）
        //要删除
        if(!empty($set['del_set'])){
            $del_data = [];
            foreach ($set['del_set'] as $k=>$v){
                if(empty($v)) continue;
                $del_data[] = $db_ref_routing_info[$v]['id'];
            }
            DB::table(config('alias.rwr'))->whereIn('id',$del_data)->delete();
            //删除工作中心关联的工序
            DB::table(config('alias.rwco'))->where('workcenter_id',$input['workcenter_id'])->whereIn('routing_id',$del_data)->delete();
            //删除工作中心下相关的能力
            DB::table(config('alias.rwcoa'))->where('workcenter_id',$input['workcenter_id'])->whereIn('routing_id',$del_data)->delete();
            //删除工作中心工作台的能力
            DB::table(config('alias.rwboa').' as rwboa')
                ->leftJoin(config('alias.rwb').' as rwb','rwb.id','rwboa.workbench_id')
                ->where('rwb.workcenter_id',$input['workcenter_id'])
                ->whereIn('rwboa.routing_id',$del_data)
                ->delete();
        }
    }

    /**
     * 保存工作中心的工序下的步骤
     * @param $input
     */
    public function saveWorkcenterStep($input){
        $db_step_info = DB::table(config('alias.rwcos'))->where('workcenter_id',$input['workcenter_id'])->get();
        $db_step_info = obj2array($db_step_info);
        $db_ref_step_info = [];
        foreach ($db_step_info as $k=>$v){
            $db_ref_step_info[$v['step_id'].'-'.$v['operation_id']] = $v;
        }
        $set = get_array_diff_intersect(array_keys($input['input_ref_step_info']),array_keys($db_ref_step_info));
        //要添加的
        if(!empty($set['add_set'])){
            $add_data = [];
            foreach ($set['add_set'] as $k=>$v){
                if(empty($v)) continue;
                $add_data[] = [
                    'workcenter_id'=>$input['workcenter_id'],
                    'operation_id'=>$input['input_ref_step_info'][$v]['operation_id'],
                    'step_id'=>$input['input_ref_step_info'][$v]['step_id'],
                ];
            }
            DB::table(config('alias.rwcos'))->insert($add_data);
        }
        //要编辑,暂不考虑
        //要删除
        if(!empty($set['del_set'])){
            $del_data = [];
            foreach ($set['del_set'] as $k=>$v){
                if(empty($v)) continue;
                $del_data[] = $db_ref_step_info[$v]['id'];
            }
            DB::table(config('alias.rwcos'))->whereIn('id',$del_data)->delete();
        }
    }

//endregion

//region 查

    /**
     * 查找工作中心关联的工序
     * @param $id
     * @author hao.wei <weihao>
     */
    public function getWorkCenterOperation($id){
        //找到关联的工序
        $operation_list = DB::table($this->table.' as rwco')->select('rwco.operation_id','rio.name as operation_name')
            ->leftJoin(config('alias.rio').' as rio','rio.id','=','rwco.operation_id')
            ->where('rwco.workcenter_id',$id)->get();
        //找到步骤
        $step_list = DB::table(config('alias.rwcos').' as rwcos')->select('rpf.name','rpf.code','rwcos.*')
            ->leftJoin(config('alias.rpf').' as rpf','rpf.id','rwcos.step_id')
            ->where('rwcos.workcenter_id',$id)->get();
        //组合下
        foreach ($operation_list as $k=>&$v){
            $v->steps = [];
            foreach ($step_list as $j=>$w){
                if($w->operation_id == $v->operation_id){
                    $v->steps[] = $w;
                }
            }
        }
        return $operation_list;
    }

    /**
     * @param $input
     * @return mixed
     */
    public function getWorkCenterOperationAbilitys($input){
        $field = [
            'rwco.operation_id',
            'rio.name as operation_name',
            'rio.code as operation_code',
            'rioa.*',
            'riw.id as workhour_id',
            'riw.multiple',
            'riw.preparation_hour',
            'riw.rated_value',
            'riw.ability_value',
            'riw.type as workhour_type',
            'riw.quantity_interval',
        ];
        $where = [];
        $where[] = ['rioa.status','=',1];
        if(!empty($input['workcenter_id'])) $where[] = ['rwco.workcenter_id','=',$input['workcenter_id']];
        $builder = DB::table($this->table.' as rwco')->select($field)
                ->leftJoin(config('alias.rio').' as rio','rwco.operation_id','rio.id')
                ->leftJoin(config('alias.rioa').' as rioa','rio.id','rioa.operation_id')
                ->leftJoin(config('alias.riw').' as riw',[['rioa.ability_id','=','riw.ability_id'],['rwco.operation_id','=','riw.operation_id']])
                ->where($where);
        if(!empty($input['workbench_id'])){
            $workbench_id = $input['workbench_id'];
            $builder->whereNotIn('rioa.id',function($query) use($workbench_id){
                    $query->select('operation_to_ability_id')->from(config('alias.rwboa'))
                        ->where('workbench_id',$workbench_id);
            });
        }
        $obj_list = $builder->get();
        return $obj_list;
    }

    /**
     * 查找工作中心关联的工艺路线
     * @param $workcenter_id
     */
    public function getWorkcenterRoutings($workcenter_id){
        $routing_list = DB::table(config('alias.rwr').' as rwr')
            ->select('rpr.*')
            ->leftJoin(config('alias.rpr').' as rpr','rpr.id','rwr.routing_id')
            ->where('rwr.workcenter_id',$workcenter_id)
            ->get();
        return $routing_list;
    }

    /**
     * 根据工序和步骤查询出
     * @param $operation_id
     * @param $step_ids
     */
    public function getWorkCenterBySteps($input){
        $builder = DB::table(config('alias.rwcos').' as rwcos')
            ->select('rwcos.workcenter_id','rwc.name','rwc.code','rwcos.step_id','rwc.desc')
            ->leftJoin(config('alias.rwc').' as rwc','rwc.id','rwcos.workcenter_id')
            ->leftJoin(config('alias.rws').' as rws','rwc.workshop_id','rws.id')
            ->where('rwcos.operation_id',$input['operation_id']);
        $step_ids = json_decode($input['step_ids'],true);
        if(!empty($step_ids)){
            $builder->whereIn('rwcos.step_id',$step_ids);
        }
        if(!empty($input['factory_id'])){
            $builder->where('rws.factory_id',$input['factory_id']);
        }
        $workcenter_list = $builder->get();
        //找到工作中心下所有的工台关联的设备
        //先找到该工序绑定的所有工作中心
        $distinct_workcenters_builder = DB::table(config('alias.rwcos').' as rwcos')
            ->leftJoin(config('alias.rwc').' as rwc','rwc.id','rwcos.workcenter_id')
            ->leftJoin(config('alias.rws').' as rws','rwc.workshop_id','rws.id')
            ->where('rwcos.operation_id',$input['operation_id']);
        if(!empty($step_ids)){
            $distinct_workcenters_builder->whereIn('rwcos.step_id',$step_ids);
        }
        if(!empty($input['factory_id'])){
            $distinct_workcenters_builder->where('rws.factory_id',$input['factory_id']);
        }
        $distinct_workcenters = $distinct_workcenters_builder->pluck(DB::raw('distinct rwcos.workcenter_id'));
        $element_list = DB::table(config('alias.rwbdi').' as rwbdi')
            ->leftJoin(config('alias.rdlt').' as rdlt','rwbdi.device_id','rdlt.id')
            ->leftJoin(config('alias.rwb').' as rwb','rwb.id','rwbdi.workbench_id')
            ->select(DB::raw('distinct rwbdi.device_id,rdlt.name as device_name,rwb.workcenter_id'))
            ->whereIn('rwb.workcenter_id',$distinct_workcenters)
            ->get();
        $temp_element = [];
        foreach ($element_list as $k=>$v){
            $temp_element[$v->workcenter_id][] = $v;
        }
        $step_workcenter_list = [];
        foreach ($workcenter_list as $k=>&$v){
            $v->element_list = isset($temp_element[$v->workcenter_id]) ? $temp_element[$v->workcenter_id] : [];
            $step_workcenter_list[$v->step_id][] = $v;
        }
        return $step_workcenter_list;
    }

//endregion
    /**
     * @message
     * @author  liming
     * @time    年 月 日
     */    
    public   function  getStandardByWorkCenter($workcenter_id,$step_info_id)
    {

        $res_obj =  DB::table('ruis_workcenter as workcenter')
                  ->leftJoin('sap_standard_value  as standard','standard.code','workcenter.standard_code')
                  ->leftJoin('sap_standard_value_param_item  as standard_item','standard_item.standard_value_id','standard.id')
                  ->leftJoin('sap_param_item  as item','item.id','standard_item.param_item_id')
                  ->select('item.*')
                  ->where('workcenter.id',$workcenter_id)
                  ->get();
      foreach ($res_obj as  $value) 
      {
        if (empty($value->id)) 
        {
           continue;
        }
         $where=[
            'step_info_id'=>$step_info_id,
            'standard_item_id'=>$value->id,
         ];
         $val =  DB::table('sap_standard_material_workhours_item')->where($where)->first();
         if ($val) 
         {
             $value->stand_id=$val->id;
             $value->standard_item_id=$val->standard_item_id;
             $value->value=$val->value;
             $value->step_info_id=$val->step_info_id;
         }
      }
      return   $res_obj;
    }        

    /**
     * @message
     * @author  liming
     * @time    年 月 日
     */    
    public   function  getDeclareStandardByWorkCenter($workcenter_id)
    {
        $res_obj =  DB::table('ruis_workcenter as workcenter')
                  ->leftJoin('sap_standard_value  as standard','standard.code','workcenter.standard_code')
                  ->leftJoin('sap_standard_value_param_item  as paramitem','paramitem.standard_value_id','standard.id')
                  ->leftJoin('sap_param_item  as item','item.id','paramitem.param_item_id')
                  ->select('paramitem.param_item_id as param_item_id','item.name as  name','item.code as code')
                  ->where('workcenter.id',$workcenter_id)
                  ->get();
      // foreach ($res_obj as  $value) 
      // {
      //   if (empty($value->id)) 
      //   {
      //      continue;
      //   }
      //    $where=[
      //       'declare_order_id'=>$declare_order_id,
      //       'standard_item_id'=>$value->id,
      //    ];
      //    $val =  DB::table('sap_standard_material_workhours_item')->where($where)->first();
      //    if ($val) 
      //    {
      //        $value->stand_id=$val->id;
      //        $value->standard_item_id=$val->standard_item_id;
      //        $value->value=$val->value;
      //        $value->declare_order_id=$val->declare_order_id;
      //    }
      // }
      return   $res_obj;
    }  

}