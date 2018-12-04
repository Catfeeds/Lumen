<?php
/**
 * Created by PhpStorm.
 * User: haoziye
 * Date: 2018/2/3
 * Time: 下午5:58
 */
namespace App\Http\Models;
use Illuminate\Support\Facades\DB;

class WorkCenter extends Base{

    public $apiPrimaryKey = 'workcenter_id';

    public function __construct()
    {
        parent::__construct();
        if(!$this->table) $this->table = config('alias.rwc');
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
            if(empty($input['workshop_id'])) TEA('700','workshop_id');
            $has = $this->isExisted([['id','=',$input['workshop_id']]],config('alias.rws'));
            if(!$has) TEA('1155');
        }
        if(!isset($input['desc'])) TEA('700','desc');
        if(mb_strlen($input['desc']) > config('app.comment.factory_desc')) TEA('700','desc');
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
            'workshop_id'=>$input['workshop_id'],
            'desc'=>$input['desc'],
            'ctime'=>time(),
        ];
        $insert_id = DB::table($this->table)->insertGetId($data);
        if(!$insert_id) TEA('802');
        return $insert_id;
    }

    /**
     * 同步 工作中心给mes
     *
     * @param $input
     * @return array
     * @throws \App\Exceptions\ApiException
     * @throws \App\Exceptions\ApiSapException
     */
    public function syncWorkCenter($input)
    {
        $ApiControl = new SapApiRecord();
        $ApiControl->store($input);

        foreach ($input['DATA'] as $key => $value) {

            /**
             * 工厂参数验证
             * 验证工厂是否存在 条件：工厂code
             */
            ltrim($value['WERKS'],'0');
            if(empty($value['WERKS'])) TESAP('700', 'WERKS');
            $factoryData = DB::table(config('alias.rf'))->select(['id'])->where('code', $value['WERKS'])->first();
            if(empty($factoryData)) TESAP('2471');

            /*
             * 车间参数验证
             * 验证车间是否存在  条件：车间code+工厂ID
             */
            if(empty($value['VERAN'])) TESAP('700', 'VERAN');
            $workShopData = DB::table(config('alias.rws'))
                ->select(['id'])
                ->where([
                    ['code','=', $value['VERAN']],
                    ['factory_id','=',$factoryData->id]
                ])
                ->first();
            if(empty($workShopData)) TESAP('2472');

            /**
             * 工作中心是否存在
             * 是 -->修改
             * 否 -->添加
             * 条件：工作中心code + 车间ID
             */
            if(empty($value['ARBPL'])) TESAP('700', 'ARBPL');
            $workCenterData = DB::table($this->table)
                ->select(['id'])
                ->where([
                    ['code','=', $value['ARBPL']],
                    ['workshop_id','=',$workShopData->id]
                ])
                ->first();
            // 判断是否为添加
            if (empty($workCenterData)) {
                $add = true;
            }else{
                $add = false;
            }

//            if(empty($value['STEXT'])) TESAP('700', 'STEXT');
//            $keyVal = [
//                'code' => get_value_or_default($value,'ARBPL'),
//                'name' => get_value_or_default($value,'STEXT'),
//                'verwe' => get_value_or_default($value,'VERWE'),
//                'workshop_code' => get_value_or_default($value,'VERAN'),
//                'lvorm' => get_value_or_default($value,'LVORM'),
//                'vgwts' => get_value_or_default($value,'VGWTS'),
//            ];
//            DB::table(config('alias.sw'))->insertGetId($keyVal);

            /**
             * 修改 名称、工作车间
             * 注：修改时，只允许修改名称
             */
            if (!$add) {
                $update=[
                    'name' => $value['STEXT'],
//                    'workshop_id' => $workShopData->id,
                    'standard_code'=>$value['VGWTS'],
                    'mtime'=>time()
                ];
                DB::table($this->table)->where('id', '=', $workCenterData->id)->update($update);
            }else{
                $insert = [
                    'code' => $value['ARBPL'],
                    'name' => $value['STEXT'],
                    'workshop_id' => $workShopData->id,
                    'ctime' => time(),
                    'mtime' => time(),
                    'standard_code'=>$value['VGWTS'],
                ];
                DB::table($this->table)->insertGetId($insert);
            }

            // 更新 标准值码
            $this->updateStandValue($value['VGWTS'], $value);

        }
        return [];
    }

//endregion

//region 查

    public function getWorkCenterListByPage(&$input){
        $field = [
            'rwc.id as '.$this->apiPrimaryKey,
            'rwc.code',
            'rwc.name as workcenter_name',
            'rws.name as workshop_name',
            'rcp.name as company_name',
            'rf.name as factory_name',
            'rwc.ctime',
        ];
        $where = [];
        $admin_id = (!empty(session('administrator')->admin_id)) ? session('administrator')->admin_id : 0;
        $admin = $this->getRecordById($admin_id,['employee_id','superman'],config('alias.rrad'));
        if($admin){
            if(!$admin->superman) {
                $employee = $this->getRecordById($admin->employee_id, ['company_id', 'factory_id', 'workshop_id', 'workcenter_id'], config('alias.re'));
                if ($employee) {
                    if (!empty($employee->workcenter_id)) $where[] = ['rwc.id', '=', $employee->workcenter_id];
                }
            }
        }
        if(!empty($input['code'])) $where[] = ['rwc.code','like','%'.$input['code'].'%'];
        if(!empty($input['name'])) $where[] = ['rwc.name','like','%'.$input['name'].'%'];
        if(!empty($input['company_id'])) $where[] = ['rcp.id','=',$input['company_id']];
        if(!empty($input['factory_id'])) $where[] = ['rf.id','=',$input['factory_id']];
        if(!empty($input['workshop_id'])) $where[] = ['rwc.workshop_id','=',$input['workshop_id']];
        $builder = DB::table($this->table.' as rwc')->select($field)
            ->leftJoin(config('alias.rws').' as rws','rws.id','=','rwc.workshop_id')
            ->leftJoin(config('alias.rf').' as rf','rf.id','=','rws.factory_id')
            ->leftJoin(config('alias.rcp').' as rcp','rcp.id','=','rf.company_id')
            ->where($where);
        $input['total_records'] = $builder->count();
        $builder->offset(($input['page_no'] - 1) * $input['page_size'])->limit($input['page_size']);
        if(!empty($input['sort']) && !empty($input['order'])) $builder->orderBy('rwc.'.$input['sort'],$input['order']);
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
            'rwc.id as '.$this->apiPrimaryKey,
            'rwc.code',
            'rwc.name as workcenter_name',
            'rcp.name as company_name',
            'rcp.id as company_id',
            'rf.name as factory_name',
            'rf.id as factory_id',
            'rws.name as workshop_name',
            'rws.id as workshop_id',
            'rwc.desc',
            'rwc.ctime',
        ];
        $obj = DB::table($this->table.' as rwc')->select($field)
            ->leftJoin(config('alias.rws').' as rws','rws.id','=','rwc.workshop_id')
            ->leftJoin(config('alias.rf').' as rf','rf.id','=','rws.factory_id')
            ->leftJoin(config('alias.rcp').' as rcp','rcp.id','=','rf.company_id')
            ->where('rwc.id',$id)->first();
        if(!$obj) TEA('404');
        return $obj;
    }

    /**
     * select列表
     * @author hao.wei <weihao>
     */
    public function getWorkCenterList($input){
        $where = [];
        $admin_id = (!empty(session('administrator')->admin_id)) ? session('administrator')->admin_id : 0;
        $admin = $this->getRecordById($admin_id,['employee_id','superman'],config('alias.rrad'));
        if($admin){
            if(!$admin->superman) {
                $employee = $this->getRecordById($admin->employee_id, ['company_id', 'factory_id', 'workshop_id', 'workcenter_id'], config('alias.re'));
                if ($employee) {
                    if (!empty($employee->workcenter_id)) $where[] = ['rwc.id', '=', $employee->workcenter_id];
                }
            }
        }
        if(!empty($input['company_id'])) $where[] = ['rcp.id','=',$input['company_id']];
        if(!empty($input['factory_id'])) $where[] = ['rf.id','=',$input['factory_id']];
        if(!empty($input['workshop_id'])) $where[] = ['rwc.workshop_id','=',$input['workshop_id']];
        $obj_list = DB::table($this->table.' as rwc')->select('rwc.id','rwc.name')
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
            'desc'=>$input['desc'],
            'mtime'=>time(),
        ];
        $res = DB::table($this->table)->where($this->primaryKey,$input[$this->apiPrimaryKey])->update($data);
        if($res === false) TEA('804');
    }

    /**
     * 更新标准值码及其对应业务
     *
     * @param $standValue
     * @param array $arr
     * @throws \App\Exceptions\ApiException
     */
    public function updateStandValue($standValue,array $arr)
    {
        /**
         * @var int $s_id 标准值码ID
         */
        $s_obj = DB::table(config('alias.ssv'))->select(['id'])->where('code', $standValue)->first();
        if (empty($s_obj)) {
            $s_id = DB::table(config('alias.ssv'))->insertGetId(['code'=>$standValue]);
        }else{
            $s_id = $s_obj->id;
        }

        for ($i = 1; $i <= 6; $i++) {
            if (empty($arr['PAR0' . $i])) {
                continue;
            }
            $code = $arr['PAR0' . $i];
            $name = $arr['TXTLG0' . $i];
            $unit = $arr['UNIT0' . $i];
            $p_obj = DB::table(config('alias.spi'))->select(['id'])->where('code', $code)->first();
            if(empty($p_obj)) TEA('2460');
            DB::table(config('alias.spi'))->where('id', $p_obj->id)->update(['name' => $name, 'unit' => $unit]);

            $has = $this->isExisted([
                ['standard_value_id', '=', $s_id],
                ['index', '=', $i]
            ], config('alias.ssvpi'));
            if ($has) {
                DB::table(config('alias.ssvpi'))
                    ->where([
                        ['standard_value_id', '=', $s_id],
                        ['index', '=', $i]
                    ])
                    ->update(['param_item_id' => $p_obj->id]);
            }else{
                DB::table(config('alias.ssvpi'))
                    ->insert([
                        'standard_value_id' => $s_id,
                        'param_item_id' => $p_obj->id,
                        'index'=>$i
                    ]);
            }

        }


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
        try{
            DB::connection()->beginTransaction();
            DB::table($this->table)->where($this->primaryKey,$id)->delete();
            DB::table(config('alias.rwco'))->where('workcenter_id',$id)->delete();
            DB::table(config('alias.rwcr'))->where('workcenter_id',$id)->delete();
        }catch(\ApiException $e){
            DB::connection()->rollback();
            TEA($e->getCode());
        }
        DB::connection()->commit();
    }

//endregion
}