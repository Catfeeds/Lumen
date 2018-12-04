<?php
/**
 * Created by PhpStorm.
 * User: haoziye
 * Date: 2018/2/3
 * Time: 下午5:58
 */

namespace App\Http\Models;

use Illuminate\Support\Facades\DB;

class WorkBench extends Base
{

    public $apiPrimaryKey = 'workbench_id';

    public function __construct()
    {
        parent::__construct();
        if (!$this->table) $this->table = config('alias.rwb');
        $this->benchItemTable = config('alias.rwbdi');

        if (empty($this->benchitem)) $this->benchitem = new WorkBenchItem();
    }

//region 检

    public function checkFormField(&$input)
    {
        $add = $this->judgeApiOperationMode($input);
        if (empty($input['name'])) TEA('700', 'name');
//        $check = $add ? [['name', '=', $input['name']]] : [['id', '<>', $input[$this->apiPrimaryKey]], ['name', '=', $input['name']]];
//        $has = $this->isExisted($check);
//        if ($has) TEA('700', 'name');
        if ($add) {
            if (!preg_match(config('app.pattern.factory_code'), $input['code'])) TEA('700', 'code');
            if (empty($input['workcenter_id'])) TEA('700', 'workcenter_id');
            $has = $this->isExisted([['id', '=', $input['workcenter_id']]], config('alias.rwc'));
            if (!$has) TEA('1157');
            if (empty($input['code'])) TEA('700', 'code');
            $has = $this->isExisted([['code', '=', $input['code']],['workcenter_id', '=', $input['workcenter_id']]]);
            if ($has) TEA('700', 'code');

        }
        if (!isset($input['status'])) TEA('700', 'status');
        if ($input['status'] != 0 && $input['status'] != 1) TEA('700', 'status');
        if (!isset($input['desc'])) TEA('700', 'desc');
        if (mb_strlen($input['desc']) > config('app.comment.factory_desc')) TEA('700', 'desc');
    }

//endregion

//region 增

    /**
     * 添加
     * @param $input
     * @author Hao.wei <weihao>
     */
    public function add($input)
    {
        $data = [
            'code' => $input['code'],
            'name' => $input['name'],
            'workcenter_id' => $input['workcenter_id'],
            'desc' => $input['desc'],
            'status' => $input['status'],
            'ctime' => time(),
        ];
        $insert_id = DB::table($this->table)->insertGetId($data);
        if (!$insert_id) TEA('802');

        //新增设备列表
        $this->benchitem->saveItem($input, $insert_id);
        return $insert_id;
    }
//endregion

//region 查
    public function getWorkBenchListByPage(&$input)
    {
        $field = [
            'rwb.id as ' . $this->apiPrimaryKey,
            'rwb.code',
            'rwb.name as workbench_name',
            'rws.name as workshop_name',
            'rwc.name as workcenter_name',
            'rf.name as factory_name',
            'rwb.status',
            'rwb.ctime',
        ];
        $where = [];
        if (isset($input['status']) && $input['status'] != '') $where[] = ['rwb.status', '=', $input['status']];
        if (!empty($input['code'])) $where[] = ['rwb.code', 'like', '%' . $input['code'] . '%'];
        if (!empty($input['name'])) $where[] = ['rwb.name', 'like', '%' . $input['name'] . '%'];
        if (!empty($input['factory_id'])) $where[] = ['rf.id', '=', $input['factory_id']];
        if (!empty($input['workshop_id'])) $where[] = ['rws.id', '=', $input['workshop_id']];
        if (!empty($input['workcenter_id'])) $where[] = ['rwb.workcenter_id', '=', $input['workcenter_id']];
        $builder = DB::table($this->table . ' as rwb')->select($field)
            ->leftJoin(config('alias.rwc') . ' as rwc', 'rwc.id', '=', 'rwb.workcenter_id')
            ->leftJoin(config('alias.rws') . ' as rws', 'rws.id', '=', 'rwc.workshop_id')
            ->leftJoin(config('alias.rf') . ' as rf', 'rf.id', '=', 'rws.factory_id')
            ->where($where);
        $input['total_records'] = $builder->count();
        $builder->offset(($input['page_no'] - 1) * $input['page_size'])->limit($input['page_size']);
        if (!empty($input['sort']) && !empty($input['order'])) $builder->orderBy('rwb.' . $input['sort'], $input['order']);
        $obj_list = $builder->get();
        foreach ($obj_list as $k => &$v) {
            $v->ctime = date('Y-m-d H:i:s', $v->ctime);
        }
        return $obj_list;
    }

    /**
     * 详情
     * @param $id
     * @return mixed
     * @throws \App\Exceptions\ApiException
     */
    public function get($id)
    {
        $field = [
            'rwb.id as ' . $this->apiPrimaryKey,
            'rwb.code',
            'rwb.name as workbench_name',
            'rwc.name as workcenter_name',
            'rwc.id as workcenter_id',
            'rf.name as factory_name',
            'rf.id as factory_id',
            'rws.name as workshop_name',
            'rwc.id as workshop_id',
            'rwb.desc',
            'rwb.status',
            'rwb.ctime',
        ];
        $obj = DB::table($this->table . ' as rwb')->select($field)
            ->leftJoin(config('alias.rwc') . ' as rwc', 'rwc.id', '=', 'rwb.workcenter_id')
            ->leftJoin(config('alias.rws') . ' as rws', 'rws.id', '=', 'rwc.workshop_id')
            ->leftJoin(config('alias.rf') . ' as rf', 'rf.id', '=', 'rws.factory_id')
            ->where('rwb.id', $id)->first();
        //查找设备相关信息
        $items = DB::table($this->benchItemTable . ' as deviceitem')
            ->leftJoin(config('alias.rdlt') . ' as device', 'device.id', '=', 'deviceitem.device_id')
            ->leftJoin(config('alias.rdtp') . ' as devicetype', 'device.device_type', '=', 'devicetype.id')
            ->leftJoin(config('alias.rdo') .' as  status', 'device.use_status', '=', 'status.id')
            ->leftJoin(config('alias.re') .' as  employee', 'device.employee_id', '=', 'employee.id')
            ->leftJoin(config('alias.rdo') .' as  sign', 'device.device_sign', '=', 'sign.id')
            ->leftJoin(config('alias.rd') .' as  department', 'device.use_department', '=', 'department.id')
            ->leftJoin(config('alias.rp') .' as  rentpartner', 'device.rent_partner', '=', 'rentpartner.id')  // 租用单位
            ->select(
                'deviceitem.id  as  id',
                'device.code  as    device_code',
                'device.name  as    device_name',
                'device.spec  as    device_spec',
                'device.id    as     device_id',
                'device.procude_partner  as   procude_partner',
                'device.useful_life  as   useful_life',
                'device.purchase_time  as   purchase_time',
                'device.initial_price  as   initial_price',
                'device.net_price  as   net_price',
                'device.placement_address  as   address',
                'device.remark  as   remark',
                'status.id  as   status_id',
                'status.name  as   status_name',
                'status.code  as   status_code',
                'employee.id  as   employee_id',
                'employee.name  as   employee_name',
                'sign.id  as   sign_id',
                'sign.name  as   sign_name',
                'sign.code  as   sign_code',
                'devicetype.id  as   devtype_id',
                'devicetype.name  as   devtype_name',
                'devicetype.code  as   devtype_code',
                'department.id  as   department_id',
                'department.name  as   department_name',
                'rentpartner.id  as   rentpartner_id',
                'rentpartner.name  as   rentpartner_name',
                'rentpartner.code  as   rentpartner_code'
            )
            ->where('workbench_id', $id)
            ->get();
        foreach ($items  as   $item)
        {
            $obj->items[] =$item;
        }
        if (!$obj) TEA( '404');
        $obj->ctime = date('Y-m-d H:i:s', $obj->ctime);
        return $obj;
    }

    /**
     * select列表
     * @author hao.wei <weihao>
     */
    public function getWorkBenchList($input)
    {
        $where = [];
        if (!empty($input['factory_id'])) $where[] = ['rf.id', '=', $input['factory_id']];
        if (!empty($input['workshop_id'])) $where[] = ['rws.id', '=', $input['workshop_id']];
        if (!empty($input['workcenter_id'])) $where[] = ['rwb.workcenter_id', '=', $input['workcenter_id']];
        if (isset($input['status']) && $input['status'] != '') $where[] = ['rwb.status', '=', $input['status']];
        $obj_list = DB::table($this->table . ' as rwb')->select('rwb.id', 'rwb.name')
            ->leftJoin(config('alias.rwc') . ' as rwc', 'rwc.id', '=', 'rwb.workcenter_id')
            ->leftJoin(config('alias.rws') . ' as rws', 'rws.id', '=', 'rwc.workshop_id')
            ->leftJoin(config('alias.rf') . ' as rf', 'rf.id', '=', 'rws.factory_id')
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
    public function update($input)
    {
        try {
            DB::connection()->beginTransaction();
            $data = [
                'name' => $input['name'],
                'desc' => $input['desc'],
                'status' => $input['status'],
                'mtime' => time(),
            ];
            DB::table($this->table)->where($this->primaryKey, $input[$this->apiPrimaryKey])->update($data);
            if ($input['status']) {
                $status = 1;
            } else {
                $status = 0;
            }
            DB::table(config('alias.rwm'))->where('workbench_id', $input[$this->apiPrimaryKey])->update(['status' => $status]);

            //新增设备列表
            $this->benchitem->saveItem($input, $input[$this->apiPrimaryKey]);

        } catch (\ApiException $e) {
            DB::connection()->rollback();
            TEA($e->getCode());
        }
        DB::connection()->commit();
    }

//endregion

//region 删

    /**
     * 删除
     * @param $id
     * @throws \App\Exceptions\ApiException
     * @author hao.wei <weihao>
     */
    public function delete($id)
    {
        try {
            DB::connection()->beginTransaction();
            //删除之前 先删除所有的关联设备
            DB::table($this->benchItemTable)->where('workbench_id', $id)->delete();

            DB::table($this->table)->where($this->primaryKey, $id)->delete();
            DB::table(config('alias.rwboa'))->where($this->apiPrimaryKey, $id)->delete();
            DB::table(config('alias.rwbre'))->where($this->apiPrimaryKey, $id)->delete();
        } catch (\ApiException $e) {
            DB::connection()->rollback();
            TEA($e->getCode());
        }
        DB::connection()->commit();
    }

//endregion
}