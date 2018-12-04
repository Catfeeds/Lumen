<?php
/**
 * Created by PhpStorm.
 * User: xujian
 * Date: 17/9/25
 * Time: 下午17:49
 */

namespace App\Http\Models;//定义命名空间
use App\Http\Models\Encoding\EncodingSetting;
use Illuminate\Support\Facades\DB;//引入DB操作类

/**
 * 工序模型
 * Class Operation
 * @package App\Http\Models
 */
class Operation extends Base
{
    protected $apiPrimaryKey = 'operation_id';
    protected $time;
    protected $datetime;
    protected $table;
    protected $rmcTable;
    protected $riomcTable;
    protected $riorTable;
    protected $rimwTable;
    protected $rmTable;
    protected $rioaTable;
    //add by minxin 20180319
    protected $riaTable;

    //end add

    public function __construct()
    {
        parent::__construct();
        $this->table = config('alias.rio');
        $this->rmcTable = config('alias.rmc');
        $this->riomcTable = config('alias.riomc');
        $this->riorTable = config('alias.rior');
        $this->rioaTable = config('alias.rioa');
        $this->rmTable = config('alias.rm');
        $this->rimwTable = config('alias.rimw');
        //add by minxin 20180319
        $this->riaTable = config('alias.ria');
        $this->rbrb = config('alias.rbrb');//bom基础数据表, 用于判断工序ability和practice_fields是否已经被bom使用;
        $this->rpf=config('alias.rpf');//做法字段表;
        //end add

        $this->time = time();
        $this->datetime = date('Y-m-d H:i:s', $this->time);


        $this->aliasTable = [
            'operation' => $this->table . ' as operation',
            'operation_material_category' => $this->riomcTable . ' as operation_material_category',
            'material_category' => $this->rmcTable . ' as material_category',
            'operation_relation' => $this->riorTable . ' as operation_relation',
            'material' => $this->rmTable . ' as material',
            'ability' => $this->rioaTable . ' as ability',
            'ie_ability' => $this->riaTable . ' as ie_ability',
            'material_workhours' => $this->rimwTable . ' as material_workhours'
        ];
    }

    /**
     * 检测字段
     * @param $input
     * @throws \App\Exceptions\ApiException
     * @throws \Illuminate\Container\EntryNotFoundException
     * @since lester.you 2018-04-12 添加对 practice_field_id_str字段的检测
     */
    public function checkFields(&$input)
    {
        $input['company_id'] = (!empty(session('administrator')->company_id)) ? session('administrator')->company_id : 0;
        $input['factory_id'] = (!empty(session('administrator')->factory_id)) ? session('administrator')->factory_id : 0;

        if (empty($input['name'])) TEA('700', 'name');
        if (!isset($input['desc'])) TEA('700', 'desc');
        if (!isset($input['ability_string'])) TEA('700', 'ability_string');
        $ability_arr = explode(',', $input['ability_string']);
        if (!isset($input['ability_id'])) TEA('700', 'ability_id');
        $ability_id = explode(',', $input['ability_id']);

        //做法字段非必传 Modify By Bruce.Chu On 2018-11-27
//        if (!isset($input['practice_field_id_str']) || empty($input['practice_field_id_str'])) TEA('700', 'practice_field_id_str');
        $practice_field_id_arr = explode(',', $input['practice_field_id_str']);

        //检测apiPrimaryKey是否正常;
        $add = true;
        if (!empty($input[$this->apiPrimaryKey])) {
            $add = false;
            $has = $this->isExisted([$this->primaryKey => $input[$this->apiPrimaryKey]]);
            if (!$has) {
                TEA('111', $this->apiPrimaryKey);
            }
        }else{
            if (empty($input['code'])) TEA('700', 'code');
        }

        //唯一性检测
        $check = $add ? [['code', '=', $input['code']]] : [['code', '=', $input['code']], [$this->primaryKey, '<>', $input[$this->apiPrimaryKey]]];
        $has = $this->isExisted($check);
        if ($has) {
            TEA('110', 'code');//工序编码已存在
        }
        $check = $add ? [['name', '=', $input['name']]] : [['name', '=', $input['name']], [$this->primaryKey, '<>', $input[$this->apiPrimaryKey]]];
        $has = $this->isExisted($check);
        if ($has) TEA('700', 'name');//name缺失

        //检测能力name和id是否匹配;
//        $nameJudge = DB::table($this->riaTable)->where(['name' => $ability_arr[0], 'id' => $ability_id[0]]);
//        //判断数据合理性
//        foreach ($ability_arr as $key => $val) {
//            if ($key > 0) {
//                $nameJudge->orWhere(['name' => $val, 'id' => $ability_id[$key]]);
//            }
//        }
//        $nameJudgeCount = $nameJudge->count();//根据name和id查询到的能力的个数
//        if ($nameJudgeCount != count($ability_arr)) TEA('701', 'ability_id OR ability_name');//能力和id不匹配

        //做法字段非必传 Modify By Bruce.Chu On 2018-11-27
        if(!empty($input['practice_field_id_str'])){
            //检测所提交的字段是否存在
            foreach ($practice_field_id_arr as $key => $value) {
                $res = DB::table(config('alias.rpf'))->where('id', '=', $value)->first();
                if (empty($res)) TEA('701', 'praictice_field_id');
            }
        }
    }


    /**
     * 添加工序
     * @param $input
     * @return mixed
     * @throws \App\Exceptions\ApiException
     * @since lesteryou 2018-04-12 添加 工序_做法字段
     */
    //update by minxin 20180320 for 增加能力id字段;
    public function store($input)
    {
        $encodingDao = new EncodingSetting();
        $input['code'] = $encodingDao->useEncoding(5, $input['code']);

        $data = [
            'code' => $input['code'],
            'name' => $input['name'],
            'desc' => $input['desc'],
            'is_excrete' => $input['is_excrete'],
            'is_oqc' => $input['is_oqc'],
            'is_ipqc' => $input['is_ipqc'],
            'company_id' => $input['company_id'],
            'factory_id' => $input['factory_id'],
            'ctime' => $this->time,
            'mtime' => $this->time,
        ];

        //入库
        $insert_id = DB::table($this->table)->insertGetId($data);
        if (!$insert_id) TEA('802');
        //能力非必传 Modify By Bruce.Chu On 2018-11-27
        if (!empty($input['ability_id'])) {
            //工序能力入库
            //入库能力数组;
            $ability_data = [];
            //能力名字数组
            $ability_arr = explode(',', $input['ability_string']);

            $ability_id = explode(',', $input['ability_id']);

            foreach ($ability_arr as $key => $ability) {
                $where = ['operation_id' => $insert_id, 'ability_name' => $ability, 'ability_id' => $ability_id[$key]];
                $info = DB::table($this->rioaTable)->where($where)->first();
                if (empty($info)) {
                    $where['code'] = 'AB' . $insert_id . $this->time . mt_rand(1000, 9999);
                    $ability_data[] = $where;
                }
            }
            DB::table($this->rioaTable)->insert($ability_data);
        }
        //做法字段非必传 Modify By Bruce.Chu On 2018-11-27
        if (!empty($input['practice_field_id_str'])) {
            //添加 工序_做法字段
            $practice_field_id_arr = explode(',', $input['practice_field_id_str']);
            $keyVal = [];
            foreach ($practice_field_id_arr as $key => $value) {
                $keyVal[] = ['practice_field_id' => $value, 'operation_id' => $insert_id];
            }
            DB::table(config('alias.riopf'))->insert($keyVal);
        }
        return $insert_id;
    }

    /**
     * 查看能力是否被bom使用;已被使用则返回true,未被使用返回false;
     * @param $input
     * @return  true/false
     * @author  xin 20180517
     */
    public function abilityHasUsed($input)
    {
        $ability_id = $input['ability_id'];//能力id
        $operation_id = $input['operation_id'];//工序id
        $tmpAbility = DB::table($this->rbrb)
            ->where('operation_id', '=', $operation_id)
            ->pluck('operation_ability_ids')
            ->toArray();
        $bomUsedAbility = array_unique($tmpAbility);
        $abilityArr = [];
        foreach ($bomUsedAbility as $key => $value) {
            if (empty($value)) continue;
            $tmp = explode(',', $value);
            foreach ($tmp as $k => $v) {
                $abilityArr[$v] = $k;
            }
            unset($k);
            unset($v);
        }
        unset($key);
        unset($value);
//        return array_unique($abilityArr);
        if (array_key_exists($ability_id, $abilityArr)) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * //验证做法字段是否已经被使用;
     * @param $input
     * @return  true/false
     * @author xin 20180517
     */
    public function practiceFieldsHasUsed($input){
        $practiceFields_id = $input['practiceFields_id'];//做法步骤id
        $operation_id = $input['operation_id'];//工序id
        //所有bom已经用到的做法字段;
        $tmpPracticeFields=DB::table($this->rbrb)
            ->where('operation_id','=',$operation_id)
            ->pluck('step_id')
            ->toArray();
        $bomUsedPracticeFields=array_unique($tmpPracticeFields);
        if(in_array($practiceFields_id,$bomUsedPracticeFields)){
            return true;
        }else{
            return false;
        }
    }

    /**
     * 修改工序
     * @param $input
     * @return mixed
     * @since lesteryou 2018-04-14 添加 更新工序_做法字段
     */
    //update by minxin 20180320 for 增加能力id字段;
    //update by minxin 20180321 for 更新能力插入逻辑;
    public function update($input)
    {
        //用户传参获取;
        $data = [
//            'code' => $input['code'],
            'name' => $input['name'],
            'desc' => $input['desc'],
            'is_excrete' => $input['is_excrete'],
            'is_oqc' => $input['is_oqc'],
            'is_ipqc' => $input['is_ipqc'],
            'mtime' => $this->time
        ];
        //更新ruis_ie_operation表
        DB::table($this->table)->where($this->primaryKey, $input[$this->apiPrimaryKey])->update($data);

//        //删除之前的工序能力(逻辑删除)
//        DB::table($this->rioaTable)->where($this->apiPrimaryKey, $input[$this->apiPrimaryKey])->update(['status' => 0]);
//
//        //工序能力入库
//        $ability_data = [];
//        //工序能力名称数组
//        $ability_arr = explode(',', $input['ability_string']);
//        //工序能力id数组;
//        $ability_id = explode(',', $input['ability_id']);
//        //更新rioa表
//        foreach ($ability_arr as $key => $ability) {
//            //where=['operation_id'=>19,'ability_name'=>'手工'];
//            $where = ['operation_id' => $input[$this->apiPrimaryKey], 'ability_name' => $ability];
//            $info = DB::table($this->rioaTable)->where($where)->first();
//            if (empty($info)) {
//                $where['code'] = 'AB' . $input[$this->apiPrimaryKey] . $this->time . mt_rand(1000, 9999);
//                //增加 插入ability_id;
//                $where['ability_id'] = $ability_id[$key];
//                $ability_data[] = $where;
//            } else {
//                DB::table($this->rioaTable)->where($this->primaryKey, $info->id)->update(['status' => 1]);
//            }
//        }
//        //如果ability_data非空, 则进行逐ability_id;条插入
//        if (!empty($ability_data)) {
//            DB::table($this->rioaTable)->insert($ability_data);
//        }
        $this->updateOperationToAbility($input[$this->apiPrimaryKey],explode(',', $input['ability_id']));

        /**
         * @todo 为了方便，直接把原来的删除，再重新添加
         *
         * 建议后来者如果遇上这种坑建议早日脱坑，因为写上以下代码的人不知道会给你埋上多少雷
         */
        DB::table(config('alias.riopf'))->where($this->apiPrimaryKey, $input[$this->apiPrimaryKey])->delete();

        //添加 工序_做法字段
        $practice_field_id_arr = explode(',', $input['practice_field_id_str']);
        $keyVal = [];
        foreach ($practice_field_id_arr as $key => $value) {
            $keyVal[] = ['practice_field_id' => $value, 'operation_id' => $input[$this->apiPrimaryKey]];
        }
        DB::table(config('alias.riopf'))->insert($keyVal);
        return $input[$this->apiPrimaryKey];
    }

    /**
     *  更新工序和能力的关联
     * @param $operation_id
     * @param $bility_ids
     */
    public function updateOperationToAbility($operation_id,$ability_ids){
        $db_abilitys = DB::table(config('alias.rioa').' as rioa')
            ->leftJoin(config('alias.ria').' as ria','ria.id','rioa.ability_id')
            ->select('rioa.ability_id','ria.name','rioa.id')
            ->where([['rioa.operation_id','=',$operation_id],['rioa.status','=',1]])
            ->get();
        $db_ref_abilitys = [];
        foreach ($db_abilitys as $k=>$v){
            $db_ref_abilitys[$v->ability_id] = $v;
        }
        $input_abilitys = DB::table(config('alias.ria'))->whereIn('id',$ability_ids)
            ->select('id','name')
            ->get();
        $input_ref_abilitys = [];
        foreach ($input_abilitys as $k=>$v){
            $input_ref_abilitys[$v->id] = $v;
        }
        $set = get_array_diff_intersect(array_keys($input_ref_abilitys),array_keys($db_ref_abilitys));
        if(!empty($set['add_set'])){
            $add_data = [];
            foreach ($set['add_set'] as $k=>$v){
                if(empty($v)) continue;
                $add_data[] = [
                    'ability_name'=>$input_ref_abilitys[$v]->name,
                    'operation_id'=>$operation_id,
                    'status'=>1,
                    'ability_id'=>$v,
                ];
            }
            DB::table(config('alias.rioa'))->insert($add_data);
        }
        if(!empty($set['del_set'])){
            $del_data = [];
            $ids = [];
            foreach ($set['del_set'] as $k=>$v){
                if(empty($v)) continue;
                $del_data[] = $v;
                $ids[] = $db_ref_abilitys[$v]->id;
            }
            //因为现在的能力和工序的关联表是以前的能力表，多数代码是以这张表作为能力，但是后续能力表被独立出来，那么其实在代码中有两张能力表，所以一旦能力表被使用了，那么两张表的数据都不能删
            //判断是否已经在工艺路线中使用了
            $names = DB::table(config('alias.rbrb').' as rbrb')
                ->leftJoin(config('alias.rioa').' as rioa','rbrb.operation_ability_ids','rioa.id')
                ->whereIn('rbrb.operation_ability_ids',$ids)
                ->pluck(DB::raw('distinct rioa.ability_name'))->toArray();
            if(!empty($names)) TEPA(implode('-',$names).'，已在工艺路线表中使用');
            //判断是否在工时列表中使用
            $names = DB::table(config('alias.rimw').' as rimw')
                ->leftJoin(config('alias.rioa').' as rioa','rimw.ability_id','rioa.id')
                ->whereIn('rimw.ability_id',$ids)
                ->pluck(DB::raw('distinct rioa.ability_name'))->toArray();
            if(!empty($names)) TEPA(implode('-',$names).',已在工时列表中使用');
            //判断是否在工作中心中使用
            $names = DB::table(config('alias.rwcoa').' as rwcoa')
                ->leftJoin(config('alias.rioa').' as rioa','rwcoa.ability_id','rioa.id')
                ->whereIn('rwcoa.ability_id',$ids)
                ->pluck(DB::raw('distinct rioa.ability_name'))->toArray();
            if(!empty($names)) TEPA(implode('-',$names).',已在工作中心中使用');
            //判断是否在工台中使用
            $names = DB::table(config('alias.rwboa').' as rwboa')
                ->leftJoin(config('alias.rioa').' as rioa','rwboa.operation_to_ability_id','rioa.id')
                ->whereIn('rwboa.operation_to_ability_id',$ids)
                ->pluck(DB::raw('distinct rioa.ability_name'))->toArray();
            if(!empty($names)) TEPA(implode('-',$names).',已在工台中使用');
            DB::table(config('alias.rioa'))->whereIn('id',$del_data)->delete();
        }
    }

    /**
     * 删除工序
     *
     * @param $input
     * @return mixed
     * @throws \App\Exceptions\ApiException
     * @since lester.you 2018-04-12 同时删除相应的做法字段
     * @since lester.you 2018-08-17 工序如果被使用，禁止删除
     */
    public function destroy($input)
    {
        if (empty($input[$this->apiPrimaryKey])) TEA('700', $this->apiPrimaryKey);

        $has = $this->isExisted([$this->primaryKey => $input[$this->apiPrimaryKey]]);
        if (!$has) {
            TEA('111', $this->apiPrimaryKey);
        }

        $has = $this->isExisted(['oid' => $input[$this->apiPrimaryKey]], config('alias.rpro'));
        if ($has) {
            TEA('171');
        }

        //判断该工序是否已经有维护关系 不已删除
        $relation1 = $this->isExisted(['from_operation_id' => $input[$this->apiPrimaryKey]], $this->riorTable);
        if (!empty($relation1)) {
            TEA('119', $this->apiPrimaryKey);
        }

        $relation2 = $this->isExisted(['to_operation_id' => $input[$this->apiPrimaryKey]], $this->riorTable);
        if (!empty($relation2)) {
            TEA('119', $this->apiPrimaryKey);
        }

        //存在工时不给删除
        $workhour = $this->isExisted(['operation_id' => $input[$this->apiPrimaryKey]], $this->rimwTable);
        if (!empty($workhour)) {
            TEA('120', $this->apiPrimaryKey);
        }

        //判断是否在bom中使用
        $has = $this->isExisted([['operation_id', '=', $input[$this->apiPrimaryKey]]], config('alias.rb'));
        if ($has) TEA('1300');

        //判断是否在工作中心工序关联
        $has = $this->isExisted([['operation_id', '=', $input[$this->apiPrimaryKey]]], config('alias.rwco'));
        if ($has) TEA('1301');

        //判断是否在物料分类中使用
        $has = $this->isExisted([['operation_id', '=', $input[$this->apiPrimaryKey]]], config('alias.riomc'));
        if($has) TEA('130');

        $result = DB::table($this->table)->where($this->primaryKey, $input[$this->apiPrimaryKey])->delete();


        //删除对应的工序能力
        DB::table($this->rioaTable)->where($this->apiPrimaryKey, $input[$this->apiPrimaryKey])->update(['status' => 0]);
        //删除对应的做法字段
        DB::table(config('alias.riopf'))->where($this->apiPrimaryKey, $input[$this->apiPrimaryKey])->delete();
        return $result;
    }

    /**
     * 分页获取工序列表
     *
     * @param $input
     * @return mixed
     * @throws \App\Exceptions\ApiException
     * @since lesteryou 2018-04-14 添加 工序_做法字段
     */
    public function index($input)
    {
        if (empty($input['page_no']) || !is_numeric($input['page_no']) || $input['page_no'] < 1) TEA('700', 'page_no');
        if (empty($input['page_size']) || !is_numeric($input['page_size']) || $input['page_size'] < 0) TEA('700', 'page_size');
        $where = $this->_search($input);
        $list = DB::table($this->table)
            ->select('id', 'name', 'code', 'desc','is_excrete','is_oqc','is_ipqc')
            ->where($where)
            ->offset(($input['page_no'] - 1) * $input['page_size'])
            ->limit($input['page_size'])
            ->get();

        $pf_select = [
            'riopf.practice_field_id',
            'rpf.name as practice_field_name'
        ];
        if (count($list) > 0) {
            foreach ($list as $v) {
                //获取对应的多个能力
                $v->abilitys = DB::table($this->rioaTable)->where($this->apiPrimaryKey, $v->id)->where('status', 1)->get();
                //获取对应的多个做法字段
                $v->practice_field = DB::table(config('alias.riopf') . ' as riopf')
                    ->select($pf_select)
                    ->leftJoin(config('alias.rpf') . ' as rpf', 'rpf.id', '=', 'riopf.practice_field_id')
                    ->where('riopf.operation_id', '=', $v->id)
                    ->get();
            }
        }
        $result['list'] = $list;
        $result['current_page_no'] = $input['page_no'];
        $result['current_page_size'] = $input['page_size'];
        $result['total_records'] = DB::table($this->table)->count();
        $result['total_pages'] = ceil($result['total_records'] / $result['current_page_size']);
        return $result;
    }

    /**
     * 获取列表
     * @return array  返回数组对象集合
     */
    public function getOperationList($input)
    {
        //order  (多order的情形,需要多次调用orderBy方法即可)
        if (empty($input['order']) || empty($input['sort'])) {
            $input['order'] = 'desc';
            $input['sort'] = 'id';
        }
        $obj_list = DB::table($this->table)
            ->select('id', 'name', 'code', 'desc','is_excrete')
            ->orderBy($input['sort'], $input['order'])
            ->get();
        if (!$obj_list) TEA('404');
        return $obj_list;
    }


    /**
     * 根据工序查询能力
     * @return array  返回数组对象集合
     */
    public function getAbilitysByOperation($input)
    {
        if (!isset($input['operation_id'])) TEA('9003');
        $operation_id = $input['operation_id'];
        $obj_list = DB::table($this->rioaTable)->select('*')->where('operation_id', '=', $operation_id)->get();
        if (!$obj_list) TEA('404');
        return $obj_list;
    }


    /**
     * 获取全部工序列表
     * @return mixed
     * @since lesteryou 2018-04-12 添加 工序_做法字段
     */
    public function AllIndex()
    {
        $list = DB::table($this->table)->where([['name', '<>', '开始'], ['desc', '<>', '默认工序请不要删除']])->select('id', 'name', 'code', 'desc','is_excrete')->get();
        if (count($list) > 0) {
            $pf_select = [
                'riopf.practice_field_id',
                'rpf.name as practice_field_name'
            ];
            foreach ($list as $v) {
                $v->abilitys = DB::table($this->rioaTable)->where($this->apiPrimaryKey, $v->id)->get();
                //获取对应的多个做法字段
                $v->practice_field = DB::table(config('alias.riopf') . ' as riopf')
                    ->select($pf_select)
                    ->leftJoin(config('alias.rpf') . ' as rpf', 'rpf.id', '=', 'riopf.practice_field_id')
                    ->where('riopf.operation_id', '=', $v->id)
                    ->get();
            }
        }
        $result['list'] = $list;
        return $result;
    }


    /**
     * 查看工序
     *
     * @param $input
     * @return mixed
     * @throws \App\Exceptions\ApiException
     * @since lesteryou 2018-04-12 添加多个做法字段
     */
    public function show($input)
    {
        if (empty($input[$this->apiPrimaryKey])) TEA('700', $this->apiPrimaryKey);

        $has = $this->isExisted([$this->primaryKey => $input[$this->apiPrimaryKey]]);
        if (!$has) {
            TEA('111', $this->apiPrimaryKey);
        }
        $result = DB::table($this->table)->select('id', 'name', 'code', 'desc','is_excrete','is_ipqc','is_oqc')->where($this->primaryKey, $input[$this->apiPrimaryKey])->first();

        //获取对应的多个能力
        $result->ability = DB::table($this->rioaTable)->where($this->apiPrimaryKey, $input[$this->apiPrimaryKey])->where('status', 1)->get();
        //获取对应的多个做法字段
        $pf_select = [
            'riopf.practice_field_id',
            'rpf.name as practice_field_name',
            'rpf.code as practice_field_code',
            'rpf.description as field_description'
        ];
        $result->practice_field = DB::table(config('alias.riopf') . ' as riopf')
            ->select($pf_select)
            ->leftJoin(config('alias.rpf') . ' as rpf', 'rpf.id', '=', 'riopf.practice_field_id')
            ->where('riopf.operation_id', '=', $input[$this->apiPrimaryKey])
            ->get();
//        //找到工序下的步骤关联的工作中心
//        $workcenter_list = DB::table(config('alias.rwcos').' as rwcos')
//            ->leftJoin(config('alias.rwc').' as rwc','rwc.id','rwcos.workcenter_id')
//            ->select('rwcos.workcenter_id','rwc.name','rwc.code','rwc.desc','rwcos.step_id')
//            ->where('rwcos.operation_id',$input['operation_id'])
//            ->get();
//        foreach ($result->practice_field as $k=>&$v){
//            $v->workcenters = [];
//            foreach ($workcenter_list as $j=>$w){
//                if($w->step_id == $v->practice_field_id){
//                    $v->workcenters[] = $w;
//                }
//            }
//        }
        return $result;
    }

    /**
     * 物料分类与工序关联
     * @param $input
     * @return mixed
     */
    public function operationMaterialCategory($input)
    {
        if (empty($input['material_category_id'])) TEA('700', 'material_category_id');

        $has = $this->isExisted([$this->primaryKey => $input['material_category_id']], $this->rmcTable);
        if (!$has) {
            TEA('112', $input['material_category_id']);
        }

        if (empty($input['operation_ids'])) TEA('700', 'operation_ids');
        $operation_arr = json_decode($input['operation_ids'], true);

        DB::table($this->riomcTable)->where('material_category_id', $input['material_category_id'])->delete();

        $data = [];
        foreach ($operation_arr as $v) {
            $has = $this->isExisted([$this->primaryKey => $v['id']]);
            if (!$has) {
                TEA('111', 'operation_id');
            }

            //判断工序与物料分类是否已经有关联
            $where = ['operation_id' => $v['id'], 'material_category_id' => $input['material_category_id']];
            /*$operation_material_category = DB::table($this->riomcTable)->where($where)->first();
            if(!empty($operation_material_category))
            {
                TEA('113','material_category_id');
            }*/
            $data[] = $where;
        }

        //入库
        $result = DB::table($this->riomcTable)->insert($data);
        return $result;
    }

    /**
     * 根据物料分类获取已关联的工序
     * @param $input
     * @return mixed
     */
    public function getOperationMaterialCategory($input)
    {
        if (empty($input['material_category_id'])) TEA('700', 'material_category_id');

        $list = DB::table($this->aliasTable['operation_material_category'])
            ->select("operation_material_category.*",
                'operation.name as operation_name',
                'operation.code as operation_code')
            ->leftJoin($this->aliasTable['operation'], 'operation.id', '=', 'operation_material_category.operation_id')
            ->where('operation_material_category.material_category_id', $input['material_category_id'])
            ->get();

        return $list;
    }

    /**
     * 添加工序关系
     * @param $input
     * @return mixed
     */
    public function relationStore($input)
    {
        if (empty($input['from_operation_id'])) TEA('700', 'from_operation_id');
        if (empty($input['to_operation_id'])) TEA('700', 'to_operation_id');
        if (empty($input['type'])) TEA('700', 'type');
        if (!isset($input['desc'])) TEA('700', 'desc');
        if (!isset($input['interval_time']) || !is_numeric($input['interval_time'])) TEA('700', 'interval_time');

        if ($input['interval_time'] < 0) {
            TEA('115', 'interval_time');
        }

        if (!in_array($input['type'], [1, 2, 3])) {
            TEA('117', 'type');
        }

        //判断工序是否存在
        $from_operation = $this->isExisted(['id' => $input['from_operation_id']], $this->table);
        if (empty($from_operation)) {
            TEA('111', 'from_operation_id');
        }

        $to_operation = $this->isExisted(['id' => $input['to_operation_id']], $this->table);
        if (empty($to_operation)) {
            TEA('111', 'to_operation_id');
        }

        //判断关系是否已经存在
        $relation1 = $this->isExisted(['from_operation_id' => $input['from_operation_id'], 'to_operation_id' => $input['to_operation_id']], $this->riorTable);
        if (!empty($relation1)) {
            TEA('116', 'from_operation_id');
        }

        $relation2 = $this->isExisted(['from_operation_id' => $input['to_operation_id'], 'to_operation_id' => $input['from_operation_id']], $this->riorTable);
        if (!empty($relation2)) {
            TEA('116', 'from_operation_id');
        }

        $data = [
            'from_operation_id' => $input['from_operation_id'],
            'to_operation_id' => $input['to_operation_id'],
            'desc' => $input['desc'],
            'ctime' => $this->time,
            'mtime' => $this->time,
            'interval_time' => $input['interval_time'],
            'type' => $input['type']
        ];

        //入库
        $insert_id = DB::table($this->riorTable)->insertGetId($data);
        if (!$insert_id) TEA('802');
        return $insert_id;
    }

    /**
     * 修改工序关系
     * @param $input
     * @return mixed
     */
    public function relationUpdate($input)
    {
        if (empty($input['relation_id'])) TEA('700', 'relation_id');
        if (empty($input['type'])) TEA('700', 'type');
        if (!isset($input['desc'])) TEA('700', 'desc');
        if (!isset($input['interval_time']) || !is_numeric($input['interval_time'])) TEA('700', 'interval_time');

        if ($input['interval_time'] < 0) {
            TEA('115', 'interval_time');
        }

        if (!in_array($input['type'], [1, 2, 3])) {
            TEA('117', 'type');
        }

        //判断关系是否存在
        $relation = $this->isExisted(['id' => $input['relation_id']], $this->riorTable);
        if (empty($relation)) {
            TEA('118', 'relation_id');
        }

        $data = [
            'desc' => $input['desc'],
            'mtime' => $this->time,
            'interval_time' => $input['interval_time'],
            'type' => $input['type']
        ];

        $result = DB::table($this->riorTable)->where($this->primaryKey, $input['relation_id'])->update($data);
        return $input['relation_id'];
    }

    /**
     * 获取维护关系列表
     * @param $input
     * @return mixed
     */
    public function relationIndex($input)
    {
        if (empty($input['page_no']) || !is_numeric($input['page_no']) || $input['page_no'] < 1) TEA('700', 'page_no');
        if (empty($input['page_size']) || !is_numeric($input['page_size']) || $input['page_size'] < 0) TEA('700', 'page_size');

        $builder = DB::table($this->aliasTable['operation_relation'])
            ->select("operation_relation.*",
                'from_operation.name as from_operation_name',
                'to_operation.name as to_operation_name')
            ->leftJoin($this->table . ' as from_operation', 'from_operation.id', '=', 'operation_relation.from_operation_id')
            ->leftJoin($this->table . ' as to_operation', 'to_operation.id', '=', 'operation_relation.to_operation_id')
            ->offset(($input['page_no'] - 1) * $input['page_size'])
            ->limit($input['page_size']);

        $result['list'] = $builder->get();
        $result['current_page_no'] = $input['page_no'];
        $result['current_page_size'] = $input['page_size'];
        $result['total_records'] = $builder->count();
        $result['total_pages'] = ceil($result['total_records'] / $result['current_page_size']);
        return $result;
    }

    /**
     * 删除维护关系
     * @param $input
     * @return mixed
     */
    public function relationDestroy($input)
    {
        if (empty($input['relation_id'])) TEA('700', 'relation_id');

        //判断关系是否存在
        $relation = $this->isExisted(['id' => $input['relation_id']], $this->riorTable);
        if (empty($relation)) {
            TEA('118', 'relation_id');
        }

        $result = DB::table($this->riorTable)->where($this->primaryKey, $input['relation_id'])->delete();
        return $result;
    }

    /**
     * 查看维护关系
     * @param $input
     * @return mixed
     */
    public function relationShow($input)
    {
        if (empty($input['relation_id'])) TEA('700', 'relation_id');

        //判断关系是否存在
        $relation = $this->isExisted(['id' => $input['relation_id']], $this->riorTable);
        if (empty($relation)) {
            TEA('118', 'relation_id');
        }

        $result = DB::table($this->aliasTable['operation_relation'])
            ->select("operation_relation.*",
                'from_operation.name as from_operation_name',
                'to_operation.name as to_operation_name')
            ->leftJoin($this->table . ' as from_operation', 'from_operation.id', '=', 'operation_relation.from_operation_id')
            ->leftJoin($this->table . ' as to_operation', 'to_operation.id', '=', 'operation_relation.to_operation_id')
            ->where('operation_relation.id', $input['relation_id'])
            ->first();

        return $result;
    }

    /**
     * 物料编码获取工序列表
     * @param $input
     * @return mixed
     */
    public function getOperationsByMaterialNo($input)
    {
        if (empty($input['material_no'])) TEA('700', 'material_no');
        if (empty($input['page_no']) || !is_numeric($input['page_no']) || $input['page_no'] < 1) TEA('700', 'page_no');
        if (empty($input['page_size']) || !is_numeric($input['page_size']) || $input['page_size'] < 0) TEA('700', 'page_size');


        $material = DB::table($this->rmTable)->where('item_no', $input['material_no'])->first();
        if (empty($material)) {
            TEA('114', $input['material_no']);
        }


        $builder = DB::table($this->aliasTable['operation_material_category'])
            ->select('operation_material_category.*', 'operation.name as operation_name', 'operation.code as operation_code')
            ->leftJoin($this->aliasTable['operation'], 'operation.id', '=', 'operation_material_category.operation_id')
            ->where('material_category_id', $material->material_category_id)
            ->offset(($input['page_no'] - 1) * $input['page_size'])
            ->limit($input['page_size']);

        $list = $builder->get();
        if (count($list) > 0) {
            foreach ($list as $v) {
                $v->ability = DB::table($this->rioaTable)->where('operation_id', $v->operation_id)->get();
            }
        }
        $result['list'] = $list;
        $result['current_page_no'] = $input['page_no'];
        $result['current_page_size'] = $input['page_size'];
        $result['total_records'] = $builder->count();
        $result['total_pages'] = ceil($result['total_records'] / $result['current_page_size']);
        return $result;
    }

    /**
     * 条件获取工序列表
     * @param $input
     * @return mixed
     */
    public function getOperations($input)
    {
        if (empty($input['page_no']) || !is_numeric($input['page_no']) || $input['page_no'] < 1) TEA('700', 'page_no');
        if (empty($input['page_size']) || !is_numeric($input['page_size']) || $input['page_size'] < 0) TEA('700', 'page_size');

        $where = [];
        if (!empty($input['operation_name'])) {
            $where[] = ['name', 'like', '%' . $input['operation_name'] . '%'];
        }
        if (!empty($input['operation_code'])) {
            $where[] = ['code', 'like', '%' . $input['operation_code'] . '%'];
        }

        if (!empty($input['sort_name'])) {
            if (!in_array($input['sort_name'], ['name', 'code'])) {
                TEA('700', 'sort_name');
            }

            if (!in_array($input['sort_rule'], ['asc', 'desc'])) {
                TEA('700', 'sort_rule');
            }
        }

        $builder = DB::table($this->table)
            ->select('id', 'name', 'code')
            ->offset(($input['page_no'] - 1) * $input['page_size'])
            ->limit($input['page_size']);


        if (!empty($where)) $builder->where($where);
        if (!empty($input['sort_name'])) $builder->orderBy($input['sort_name'], $input['sort_rule']);


        $list = $builder->get();
        if (count($list) > 0) {
            foreach ($list as $v) {
                $v->ability = DB::table($this->rioaTable)->where('operation_id', $v->id)->get();
            }
        }
        $result['list'] = $list;
        $result['current_page_no'] = $input['page_no'];
        $result['current_page_size'] = $input['page_size'];
        $result['total_records'] = $builder->count();
        $result['total_pages'] = ceil($result['total_records'] / $result['current_page_size']);
        return $result;
    }

    /*
     * 初始化能力表,同步更新riao表;
     * @return mixed
     * add by minxin 20180320
     * */
    public function initAbilities()
    {
        return false;
        //rioa的所有名字
        $oa = DB::table($this->rioaTable)->groupBy('ability_name')->get();
        //ria的所有名字
        $aname = DB::table($this->riaTable)->select('name')->get();
        $namearr = [];
        foreach ($aname as $v) {
            $namearr[] = $v->name;
        }

        //准备插入的句柄;
        $insertA = DB::table($this->riaTable);
        $tmp = [];
        foreach ($oa as $v) {
            if (!in_array($v->ability_name, $namearr)) {
                array_push($tmp, ['name' => $v->ability_name, 'code' => 'A' . $this->time . mt_rand(100, 999)]);
            }
        }
        //
        //插入ruis_ie_ability表;
        if (!empty($tmp)) {
            $insertA->insert($tmp);
        }
        //获取ria表所有name和id;
        $Aall = DB::table($this->riaTable)->select('id', 'name')->get();

        //更新表
        foreach ($Aall as $v) {
            DB::table($this->rioaTable)->where([['ability_name', '=', $v->name]])->update(['ability_id' => $v->id]);
        }
//        if($result==true){
//            return array('errno','0');
//        }
        return ['init is over'];
//        return '123123';
    }

    /**
     * 检查能力字段 (暂时用于createAbility & updateAbility, 其余未用到)
     * @param $input
     * @return mixed
     * @function 规避掉无name, 无code, 无效ability_id, 无效code
     * add by minxin 20180321
     */
    public function checkAbilityFields(&$input)
    {
        if (!isset($input['name'])) TEA('700', 'name');

        if (!isset($input['code'])) TEA('700', 'code');
        //检测ability_id和code是否存在(&&)且能力值为显示;用于updateAbility
        if (!empty($input['ability_id'])) {
            $has = $this->isExisted([['id', '=', $input['ability_id']], ['code', '=', $input['code']], ['deleted', '=', '0']], $this->riaTable);
            if (!$has) {
                TEA('128', 'ability_id/code');
            }
        } else {
            //检测code是否唯一; 用于createAbility
            $codeWhere = [['code', '=', $input['code']], ['deleted', '=', '0']];
            $codeHas = $this->isExisted($codeWhere, $this->riaTable);
            if ($codeHas) TEA('124', 'code');
        }

    }


    /**
     * 获取能力列表
     * @param $input
     * @return mixed
     * add by minxin 20180320
     */
    public function getAbilities(&$input)
    {
        if (empty($input['page_no']) || !is_numeric($input['page_no']) || $input['page_no'] < 1) $input['page_no'] = 1;
        if (empty($input['page_size']) || !is_numeric($input['page_size']) || $input['page_size'] < 0) $input['page_size'] = 100;

        $abilities = DB::table($this->riaTable)->select('id', 'name', 'code', 'description')->where('deleted', 0);
        $input['total_records'] = $abilities->count();
        $result = $abilities->offset(($input['page_no'] - 1) * $input['page_size'])
            ->limit($input['page_size'])->orderBy('id', 'desc')->get();
        return $result;
    }

    /**
     * 新增能力
     * @param $input
     * @return mixed
     * add by minxin 20180321
     */
    public function createAbility(&$input)
    {
        $encodingDao = new EncodingSetting();
        $input['code'] = $encodingDao->useEncoding(4, $input['code']);
        //能力名唯一性(未删除中的唯一性);
        $where = [['name', '=', $input['name']], ['deleted', '=', '0']];
        $has = $this->isExisted($where, $this->riaTable);
        if ($has) TEA('123', 'name');

        $description = empty($input['description']) ? '' : $input['description'];
        $data = [
            'name' => $input['name'],
            'description' => $description
        ];
        $code = !empty($input['code']) ? $input['code'] : 'A' . $this->time . mt_rand(100, 999);
        $data['code'] = $code;


        //查询是否有deleted=1 的同名记录, 如果有, 更新deleted=0;
        $where = [['name', '=', $input['name']], ['deleted', '=', '1']];
        $has = $this->isExisted($where, $this->riaTable);
        //存在同名的已被逻辑删除的记录,更新code,description, deleted状态;
        if ($has) {
            $data['deleted'] = 0;
            $addId = DB::table($this->riaTable)->where('name', '=', $input['name'])->update($data);
        } else {
            //不存在同名, 直接insert, 返回
            $addId = DB::table($this->riaTable)->insertGetId($data);
        }

        return $addId;
    }


    /**
     * 显示单个能力
     * @param $input
     * @return mixed
     * add by minxin 20180321
     */
    public function displayAbility(&$input)
    {
        if (!isset($input['ability_id'])) TEA('700', 'ability_id');
        //验证能力id是否存在;
        $where = [['id', '=', $input['ability_id']], ['deleted', '=', '0']];
        $has = $this->isExisted($where, $this->riaTable);
        if (!$has) {
            TEA('125', 'ability_id');
        }
        //返回;
        return DB::table($this->riaTable)->where($where)->get();

    }

    /**
     * 更新能力
     * @param $input
     * @return mixed
     * add by minxin 20180321
     */
    public function updateAbility(&$input)
    {
        if (!isset($input['ability_id'])) TEA('700', 'ability_id');//能力id缺失
        //获取能力id;
        $id = $input['ability_id'];
        $description = empty($input['description']) ? '' : $input['description'];

        //能力名唯一性(未删除中的唯一性);
        $where = [['name', '=', $input['name']], ['deleted', '=', '0'], ['id', '<>', $id]];
        $has = $this->isExisted($where, $this->riaTable);
        if ($has) TEA('123', 'name');//能力名字已被占用


        $data = [
            'name' => $input['name'],
            'description' => $description
        ];


        //手动添加的code
        if (!empty($input['code'])) {
            $data['code'] = $input['code'];
        }
        //更新rioa表
        DB::table($this->rioaTable)->where([['ability_id', '=', $id]])->update(['ability_name' => $input['name']]);
        //更新ria表;
        DB::table($this->riaTable)->where([['id', '=', $id], ['deleted', '=', 0]])->update($data);

        return $id;
    }

    /**
     * 能力唯一性检查, 包含名字唯一性, code唯一性;
     * @param $input
     * @return mixed
     * add by minxin 20180322
     */
    public function checkUnique($where)
    {
        $result = $this->isExisted($where, $this->riaTable);
        return $result;
    }

    /**
     * 删除能力
     * @param $input
     * @return mixed
     * add by minxin 20180321
     */
    public function deleteAbility(&$input)
    {
        if (!isset($input['ability_id'])) TEA('700', 'ability_id');
        $where = ['id' => $input['ability_id']];
        $has = $this->isExisted($where, $this->riaTable);
        if (!$has) TEA('125');//能力缺失;

        //todo 判断能力是否被绑定, 绑定则不允许删除;
        $has = $this->isExisted([['ability_id', '=', $input['ability_id']], ['status', '=', 1]], config('alias.rioa'));
        if ($has) {
            TEA('129');
        }
        $id = $input['ability_id'];
        //删除rioa表相关记录;
        DB::table($this->rioaTable)->where([['ability_id', '=', $id], ['status', '=', '1']])->update(['status' => 0]);
        //删除ria表相关记录;
        DB::table($this->riaTable)->where([['id', '=', $id], ['deleted', '=', 0]])->update(['deleted' => 1]);
        return $id;
    }


    /**
     * 获取能力列表(已弃用)
     * @param $input
     * @return mixed
     */
    public function getAbilitys(&$input)
    {
        if (empty($input['page_no']) || !is_numeric($input['page_no']) || $input['page_no'] < 1) TEA('700', 'page_no');
        if (empty($input['page_size']) || !is_numeric($input['page_size']) || $input['page_size'] < 0) TEA('700', 'page_size');
        $where = [];
        $where[] = ['ability.status', '=', 1];
        if (!empty($input['operation_name'])) $where[] = ['operation.name', 'like', '%' . $input['operation_name'] . '%'];
        if (!empty($input['operation_code'])) $where[] = ['operation.code', 'like', '%' . $input['operation_code'] . '%'];
        $builder = DB::table($this->aliasTable['ability'])
            ->select("ability.*", "operation.name as operation_name", "operation.code as operation_code")
            ->leftJoin($this->aliasTable['operation'], 'operation.id', '=', 'ability.operation_id')
            ->where($where);

        if (!empty($input['workbench_id'])) {
            $workbench_id = $input['workbench_id'];
            $builder->whereNotIn('ability.id', function ($query) use ($workbench_id) {
                $query->select('operation_to_ability_id')->from(config('alias.rwbo'))
                    ->where('workbench_id', $workbench_id);
            });
        }
        $input['total_records'] = $builder->count();
        $builder->offset(($input['page_no'] - 1) * $input['page_size'])
            ->limit($input['page_size']);
        $list = $builder->get();
        return $list;
    }

    /**
     * 获取所有工序不带能力
     * @param $input
     */
    public function getOperationListByPage(&$input)
    {
        $field = [
            'rio.id',
            'rio.name',
            'rio.code',
        ];
        $where = [];
        if (!empty($input['name'])) $where[] = ['rio.name', '=', $input['name']];
        if (!empty($input['code'])) $where[] = ['rio.code', '=', $input['code']];
        $builder = DB::table(config('alias.rio') . ' as rio')->select($field)
            ->where($where);
        if (!empty($input['workcenter_id'])) {
            $workcenter_id = $input['workcenter_id'];
            $builder->whereNotIn('rio.id', function ($query) use ($workcenter_id) {
                $query->select('operation_id')->from(config('alias.rwco'))
                    ->where('workcenter_id', $workcenter_id);
            });
        }
        $input['total_records'] = $builder->count();
        $builder->offset(($input['page_no'] - 1) * $input['page_size'])->limit($input['page_size']);
        $list = $builder->get();
        foreach ($list as $k=>&$v){
            $v->abilitys = DB::table(config('alias.rioa'))->where([['operation_id','=',$v->id],['status','=',1]])->get();
        }
        return $list;
    }

    /**
     * @param $input
     * @return mixed
     * @throws \App\Exceptions\ApiException
     * @since lester.you 2018-07-23 返回值显示工作中心
     */
    public function getAbilitiesByOperation($input)
    {
        if (!isset($input['operation_id'])) TEA('700', 'operation_id');
        $obj_abilities = DB::table(config('alias.rioa').' as rioa')
            ->leftJoin(config('alias.ria').' as ria','rioa.ability_id','=','ria.id')
            ->select([
                'rioa.id',
                'rioa.ability_name',
                'rioa.ability_id',
                'rioa.operation_id',
                'rioa.code',
                'rioa.status',
                'ria.code as ability_code',
                'ria.description as ability_description',
            ])
            ->where([['rioa.operation_id', '=', $input['operation_id']], ['rioa.status', '=', '1']])
            ->get();
        return $obj_abilities;
    }


    /**
     * 搜索
     */
    private function _search($input)
    {
        $where = array();
        if (isset($input['name']) && $input['name']) {//根据名称
            $where[] = ['name', 'like', '%' . $input['name'] . '%'];
        }
        if (isset($input['code']) && $input['code']) {//根据编号
            $where[] = ['code', 'like', '%' . $input['code'] . '%'];
        }
        if (isset($input['id']) && $input['id']) {//根据id
            $where[] = ['id', '=', $input['id']];
        }
        return $where;
    }

    /**
     * 根据工序获取已关联的物料分类
     * @param $operationId
     */
    public function getMaterialCategoryByOperation($operationId)
    {
        $field = [
            'rmc.id as material_category_id',
            'rmc.name',
        ];
        $obj_list = DB::table(config('alias.riomc') . ' as riomc')->select($field)
            ->leftJoin(config('alias.rmc') . ' as rmc', 'rmc.id', 'riomc.material_category_id')
            ->where('riomc.operation_id', $operationId)
            ->get();
        return $obj_list;
    }

    /**
     * 查找工序和步骤
     * @param $input
     * @return array
     */
    public function getAllOperationAndStep(&$input){
        //找到所有工序
        $builder = DB::table(config('alias.rio'))->select('code','name','desc','id as operation_id');
        $input['total_records'] = $builder->count();
        $builder->offset(($input['page_no'] - 1) * $input['page_size'])->limit($input['page_size']);
        if(!empty($input['order']) && !empty($input['sort'])) $builder->orderBy($input['sort'],$input['order']);
        $operation_list = $builder->get();
        //再找工序下的所有步骤
        $operation_arr = [];
        foreach ($operation_list as $k=>&$v){
            $v->steps = [];
            $operation_arr[$v->operation_id] = $v;
        }
        $step_list = DB::table(config('alias.riopf').' as riopf')
            ->leftJoin(config('alias.rpf').' as rpf','rpf.id','riopf.practice_field_id')
            ->select('riopf.operation_id','rpf.name','rpf.code','rpf.description','rpf.id as step_id')
            ->whereIn('riopf.operation_id',array_keys($operation_arr))
            ->get();
        //组合下
        foreach ($step_list as $k=>$v){
            if(isset($operation_arr[$v->operation_id])){
                $operation_arr[$v->operation_id]->steps[] = $v;
            }
        }
        return $operation_arr;
    }

}