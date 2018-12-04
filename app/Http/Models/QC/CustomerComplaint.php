<?php
/**
 * 客诉model
 * Created by PhpStorm.
 * User: xin.min
 * Date: 2018-06-21
 * Time: 10:54
 */

namespace App\Http\Models\QC;

use App\Http\Models\Base;
use GuzzleHttp\Psr7\Request;
use Illuminate\Support\Facades\DB;

class CustomerComplaint extends Base
{
    public $table;
    public $rqmi;
    public $rqcca;
    public $rqccq;
    public $re;
    public $rqccm;
    public $rd;
    public $rqccd1;
    public $rqccd2;
    public $rqccd3;

    public function __construct()
    {
        $this->rqmi = config('alias.rqmi');//缺失项
        $this->table = config('alias.rqcc');//基础客诉单表;
        $this->rqcca = config('alias.rqcca');//客诉答案表
        $this->rqccq = config('alias.rqccq');//客诉问题表
        $this->re = config('alias.re');//员工表
        $this->rqccm = config('alias.rqccm');//审核/打回描述表
        $this->rd = config('alias.rd');//部门表 add by xin.min 20180710
        $this->rqccd1 = config('alias.rqccd1');//D1;
        $this->rqccd2 = config('alias.rqccd2');//D2;
        $this->rqccd3 = config('alias.rqccd3');//D3;
        $this->user = config('alias.u');//D3;
        $this->rpo = config('alias.rpo');//production_order;
        $this->rm = config('alias.rm');//物料表;
    }

     /**
     * 检查增加客诉单的字段是否正常/正确
     * @param $input
     * @return
     * @author
     */
    public function checkStoreComplaint($input)
    {
        if (!isset($input['customer_name'])) TEA('700', 'customer_name');
        if (!isset($input['complaint_code'])) TEA('700', 'complaint_code');
        if (!isset($input['po_id'])) TEA('700', 'po_id');
        if (!isset($input['received_date'])) TEA('700', 'received_date');
        if (!isset($input['samples_received_date'])) TEA('700', 'samples_received_date');
        if (!isset($input['defect_material_batch'])) TEA('700', 'defect_material_batch');
        if (!isset($input['defect_rate'])) TEA('700', 'defect_rate');
        if (!isset($input['defect_material_rejection_num'])) TEA('700', 'defect_material_rejection_num');
        if (!isset($input['defect_description'])) TEA('700', 'defect_description');
        //判断客诉code是否唯一
        if ($this->isHave('complaint_code', $input['complaint_code'], $this->table)) TEA('700', 'complaint_code');

    }


    /**
     * 根据登录id获取绑定的员工id
     * @param
     * @return
     * @author
     */
    protected function employeeId()
    {
        $admin_id = session('administrator')->admin_id;
        return DB::table(config('alias.rrad'))->where('id', $admin_id)->value('employee_id');
    }

//region 发送

    /**
     * 检查发送数据是否正确/正常
     * @param $input
     * @return 无异常返回false
     * @author
     */
    public function checkSend($input)
    {
        if (!isset($input['sendItem']))
            TEA('700', 'sendItem');//客诉单id

        $sendItem = json_decode($input['sendItem']);
        //客诉单id;
        $customer_complaint_ids = [];
        //负责人id;
        $responsible_person_ids = [];
        //问题id;
        $question_ids = [];
        foreach ($sendItem as $key => $value) {
            $customer_complaint_ids[] = $value->customer_complaint_id;
            $responsible_person_ids[] = $value->responsible_person_id;
            $question_ids[] = $value->question_id;
        }
        unset($key, $value);
        //所有客诉单id
        $Cids = DB::table($this->table)->pluck('id')->toArray();
        //所有用户id
        $Pids = DB::table($this->re)->pluck('id')->toArray();
        //所有问题id
        $Qids = DB::table($this->rqccq)->pluck('id')->toArray();
        $diffC = array_diff($customer_complaint_ids, $Cids);
        $diffP = array_diff($responsible_person_ids, $Pids);
        $diffQ = array_diff($question_ids, $Qids);
        if (count($diffC) > 0) {
            return array('field' => 'customer_complaint_id', 'value' => $diffC);
        }
        if (count($diffP) > 0) {
            return array('field' => 'responsible_person_id', 'value' => $diffP);
        }
        if (count($diffQ) > 0) {
            return array('field' => 'question_id', 'value' => $diffQ);
        }

        return false;
    }

    /**
     * 发送问题至相关人员填写
     * @param $input
     * @return
     * @author
     */
    public function sendQuestion($input)
    {
        $data = json_decode($input['sendItem']);
        $insertData = [];
        foreach ($data as $key => $value) {
            //查询是否已经存在,存在则跳过; 如若有最新回答, 也跳过
            $checkData = [
                ['customer_complaint_id', '=', $value->customer_complaint_id],
                ['question_id', '=', $value->question_id],
                ['responsible_person_id', '=', $value->responsible_person_id],
                ['status', '<>', 1]//已发送/已有最新回答
            ];
            $has1 = $this->isExisted($checkData, $this->rqcca);
            if ($has1) continue;

            //不存在则添加一条;
            $insertData[] = [
                'customer_complaint_id' => $value->customer_complaint_id,
                'question_id' => $value->question_id,
                'question_value' => '',
                'responsible_person_id' => $value->responsible_person_id,
                'status' => 0,//已发送
                'create_time' => date('Y-m-d H:i:s', time())
            ];
        }
        unset($key, $value);
//        return $insertData;
        return DB::table($this->rqcca)->insert($insertData);
    }

    /**
     * 从客诉单业务发送到qc
     * @param  $input
     * @return
     * @author
     */
    public function sendToQc($input){
        if(!isset($input['customer_complaint_id']))TEA('700','customer_complaint_id');
        DB::table($this->table)->where('id',$input['customer_complaint_id'])->update(['status'=>1]);
        return true;
    }


    /**
     * 业务完成
     * @param  $input
     * @return
     * @author
     */
    public function overComplaint($input){
        if(!isset($input['customer_complaint_id']))TEA('700','customer_complaint_id');
        DB::table($this->table)->where('id',$input['customer_complaint_id'])->update(['over_status'=>1]);
        return true;
    }


    /**
     * 客诉单终止
     * @param  $input
     * @return
     * @author
     */
    public function stopComplaint($input){
        if(!isset($input['customer_complaint_id']))TEA('700','customer_complaint_id');
        DB::table($this->table)->where('id',$input['customer_complaint_id'])->update(['finish_status'=>2]);
        return true;
    }
//endregion

//region终止
    /**
     * 检查客诉是否能够归档
     * @param  $input
     * @return
     * @author
     */
    public function checkFinishComplaint($input)
    {
        if (!isset($input['customer_complaint_id'])) TEA('customer_complaint_id');
        $where = [['status', '=', 4], ['id', '=', $input['customer_complaint_id']]];
        $has = $this->isExisted($where, $this->table);
        if (!$has) TEA('700', 'customer_complaint_id');
    }



    /**
     * 归档客诉,只有已审核通过的才能归档
     * @param  $input
     * @return
     * @author
     */
    public function finishComplaint($input)
    {
        DB::table($this->table)->where('id', $input['customer_complaint_id'])->update(['finish_status' => 1]);
        return true;
    }

//endregion


//region 增
    /**
     * 添加答案/修改答案
     * @param
     * @return
     * @author      xin.min
     * @description 如果已经回答了, 先修改原回答状态status=1, 然后再增加新的;
     *              如果没有回答, 修改原答案status=2;
     */
    public function storeAnswer($input)
    {

        $data = json_decode($input['sendItem']);
        $employee_id = $this->employeeId();
        $insertData = [];
        foreach ($data as $key => $value) {
            //查询是否已经有答案(status=2)
            $where = [
                ['customer_complaint_id', '=', $value->customer_complaint_id],
                ['question_id', '=', $value->question_id],
                ['responsible_person_id', '=', $employee_id],
                ['status', '=', 2]
            ];
            $hasAnswered = $this->isExisted($where, $this->rqcca);
            //已经有答案, 修改原答案status=1, 新增答案
            if ($hasAnswered) {
                $this->deleteOneAnswer($value);
                $insertData[] = [
                    'customer_complaint_id' => $value->customer_complaint_id,
                    'question_id' => $value->question_id,
                    'question_value' => $value->question_value,
                    'responsible_person_id' => $value->responsible_person_id,
                    'status' => 2,//已发送
                    'create_time' => date('Y-m-d H:i:s', time())
                ];
            } else {
                //无答案, 直接更新答案和status
                $updateData = [
                    'question_value' => $value->question_value,
                    'status' => 2
                ];
                $updateWhere = [
                    ['customer_complaint_id', '=', $value->customer_complaint_id],
                    ['question_id', '=', $value->question_id],
                    ['responsible_person_id', '=', $employee_id]
                ];
                DB::table($this->rqcca)->where($updateWhere)->update($updateData);
            }
        }
        unset($key, $value);
        return DB::table($this->rqcca)->insert($insertData);
    }

   

    /**
     * 增加一条客诉
     * @param  $input
     * @return
     * @author
     */
    public function storeComplaint($input)
    {
        $creator_id = (!empty(session('administrator')->admin_id)) ? session('administrator')->admin_id : 0;


        //新增客诉基本信息
        $baseInsertData = [
            'customer_name' => $input['customer_name'],
            'complaint_code' => $input['complaint_code'],
            'po_id' => $input['po_id'],
            'material_id' => $input['material_id'],
            'received_date' => $input['received_date'],
            'samples_received_date' => $input['samples_received_date'],
            'defect_description' => $input['defect_description'],
            'type' => $input['type'],
            'defect_material_batch' => $input['defect_material_batch'],
            'defect_rate' => $input['defect_rate'],
            'defect_material_rejection_num' => $input['defect_material_rejection_num'],
            'creator_id'  => $creator_id,
            'file_status' => 1,
            'create_time' => date('Y-m-d H:i:s', time())
        ];
        $complaint_id = DB::table($this->table)->insertGetId($baseInsertData);
        return $complaint_id;
    }

    /**
     * 查看qc单
     * @param $id
     * @throws \Exception
     * @author liming 
     */
    public function get($id)
    {
        $results=[];
        $results['base']=DB::table($this->table.' as table')
            ->leftJoin($this->rqccm.' as m','table.judge_message_id','=','m.id')
            ->leftJoin($this->rm.' as material','table.material_id','=','material.id')
            ->leftJoin($this->rpo.' as production','table.po_id','=','production.id')
            ->select('table.*','m.content','production.number  as  production_number','material.name  as  material_name')
            ->where('table.id',$id)
            ->get();
        $results['D2']=DB::table($this->rqccd2)->where('customer_complaint_id',$id)->get();
        $results['D3']=DB::table($this->rqccd3)->where('customer_complaint_id',$id)->get();
        $results['D4-D8']=DB::table($this->rqcca.' as a')
            ->leftJoin($this->rqccq.' as q','a.question_id','=','q.id')
            ->leftJoin($this->re.' as e','a.responsible_person_id','=','e.id')
            ->leftJoin($this->rqccm.' as m','a.judge_message_id','=','m.id')
            ->select(
                'a.question_id',
                'q.question_name',
                'a.question_value',
                'a.responsible_person_id',
                'a.status',
                'm.content as judge_message',
                'e.name as responsible_person_id',
                'a.create_time',
                'q.discipline_no',
                'q.order as question_order'
            )
            ->where([['a.customer_complaint_id',$id],['a.status','<>',1]])
            ->orderBy('q.discipline_no')
            ->get();
        return $results;
    }  



     /**
     * 修改客诉单
     * @param $input   array   input数组
     * @throws \Exception
     * @author    liming
     */
    public function updateComplaint($input)
    {

        try{
            //开启事务
            DB::connection()->beginTransaction();
            //获取编辑数组
             $baseInsertData = [
                'customer_name' => $input['customer_name'],
                'complaint_code' => $input['complaint_code'],
                'po_id' => $input['po_id'],
                'material_id' => $input['material_id'],
                'received_date' => $input['received_date'],
                'defect_material_batch' => $input['defect_material_batch'],
                'defect_rate' => $input['defect_rate'],
                'defect_description' => $input['defect_description'],
                'samples_received_date' => $input['samples_received_date'],
                'defect_material_rejection_num' => $input['defect_material_rejection_num'],
                'type' => $input['type'],
            ];
            $upd=DB::table($this->table)->where('id',$input['id'])->update($baseInsertData);
            if($upd===false) TEA('804');
        }catch(\ApiException $e){
            //回滚
            DB::connection()->rollBack();
            TEA($e->getCode());
        }
        //提交事务
        DB::connection()->commit();

    }


    /**
     * 删除qc
     * @param $id
     * @throws \Exception
     * @author liming 
     */
    public function destroy($id)
    {
        //该分组的使用状况,使用的话,则禁止删除[暂时略][是否使用由具体业务场景判断]
        try{
             //开启事务
             DB::connection()->beginTransaction();
             //先删除 3D
             $son=DB::table($this->rqccd3)->where('customer_complaint_id',$id)->delete();
            
             $num=$this->destroyById($id);
             if($num===false) TEA('803');
             if(empty($num))  TEA('404');
        }catch(\ApiException $e){
            //回滚
            DB::connection()->rollBack();
            TEA($e->getCode());
        }
        //提交事务
        DB::connection()->commit();
    }


    /**
     * 检查D3是否正常/正确
     * @param  $input
     * @return
     * @author
     */
    public function checkStoreD3($input)
    {
        if (!isset($input['customer_complaint_id'])) TEA('700', 'customer_complaint_id');
        if (!isset($input['stock'])) TEA('700', 'stock');
        if (!isset($input['stock_num'])) TEA('700', 'stock_num');
        if (!isset($input['stock_quality'])) TEA('700', 'stock_quality');
        if (!isset($input['stock_flag'])) TEA('700', 'stock_flag');
        if (!isset($input['wip'])) TEA('700', 'wip');
        if (!isset($input['wip_num'])) TEA('700', 'wip_num');
        if (!isset($input['wip_quality'])) TEA('700', 'wip_quality');
        if (!isset($input['wip_flag'])) TEA('700', 'wip_flag');
        if (!isset($input['customer_stock'])) TEA('700', 'customer_stock');
        if (!isset($input['customer_stock_num'])) TEA('700', 'customer_stock_num');
        if (!isset($input['customer_stock_quality'])) TEA('700', 'customer_quality');
        if (!isset($input['customer_stock_time'])) TEA('700', 'customer_stock_time');
        if (!isset($input['rejected_handle'])) TEA('700', 'rejected_handle');
        if(!isset($input['rejected_effect']))TEA('700','rejected_effect');
        if(!isset($input['pay_for_rejected']))TEA('700','pay_for_rejected');
        if(!isset($input['pay_for_travel']))TEA('700','pay_for_travel');
        if(!isset($input['pay_for_other']))TEA('700','pay_for_other');

            if (!isset($input['next_shipment_schedule_time'])) TEA('700', 'next_shipment_schedule_time');
        if (!isset($input['next_shipment_schedule_num'])) TEA('700', 'next_shipment_schedule_num');
        if (!isset($input['next_shipment_schedule_flag'])) TEA('700', 'next_shipment_schedule_flag');
        //检查客诉单id是否正常/正确
        if (!$this->isHave('id', $input['customer_complaint_id'], $this->table)) TEA('700', 'customer_complaint_id');
    }

    /**
     * 新增D3
     * @param $input
     * @return
     * @author
     */
    public function storeD3($input)
    {
        $admin_id = session('administrator')->admin_id;
        $insertData = [
            'customer_complaint_id' => $input['customer_complaint_id'],
            'stock' => $input['stock'],
            'stock_num' => $input['stock_num'],
            'stock_quality' => $input['stock_quality'],
            'stock_flag' => $input['stock_flag'],
            'wip' => $input['wip'],
            'wip_num' => $input['wip_num'],
            'wip_quality' => $input['wip_quality'],
            'wip_flag' => $input['wip_flag'],
            'customer_stock' => $input['customer_stock'],
            'customer_stock_num' => $input['customer_stock_num'],
            'customer_stock_quality' => $input['customer_stock_quality'],
            'customer_stock_time' => $input['customer_stock_time'],
            'rejected_handle' => $input['rejected_handle'],
            'rejected_effect'=>$input['rejected_effect'],
            'pay_for_rejected'=>$input['pay_for_rejected'],
            'pay_for_travel'=>$input['pay_for_travel'],
            'pay_for_other'=>$input['pay_for_other'],
            'exist_require'=>$input['exist_require'],
            'require'=>$input['require'],
            'next_shipment_schedule_time' => $input['next_shipment_schedule_time'],
            'next_shipment_schedule_num' => $input['next_shipment_schedule_num'],
            'next_shipment_schedule_flag' => $input['next_shipment_schedule_flag'],
            'create_time' => date('Y-m-d H:i:s', time()),
            'creator_id' => $admin_id,
            'status' => 1,
            'responsible_person_id' => $admin_id
        ];
        return DB::table($this->rqccd3)->insertGetId($insertData);
    }



      /**
     * 修改D3
     * @param $input   array   input数组
     * @throws \Exception
     * @author    liming
     */
    public function updateD3($input)
    {

        try{
            //开启事务
            DB::connection()->beginTransaction();
            //获取编辑数组
            $updateData = [
            'customer_complaint_id' => $input['customer_complaint_id'],
            'stock' => $input['stock'],
            'stock_num' => $input['stock_num'],
            'stock_quality' => $input['stock_quality'],
            'stock_flag' => $input['stock_flag'],
            'wip' => $input['wip'],
            'wip_num' => $input['wip_num'],
            'wip_quality' => $input['wip_quality'],
            'wip_flag' => $input['wip_flag'],
            'customer_stock' => $input['customer_stock'],
            'customer_stock_num' => $input['customer_stock_num'],
            'customer_stock_quality' => $input['customer_stock_quality'],
            'customer_stock_time' => $input['customer_stock_time'],
            'rejected_handle' => $input['rejected_handle'],
            'rejected_effect'=>$input['rejected_effect'],
            'pay_for_rejected'=>$input['pay_for_rejected'],
            'pay_for_travel'=>$input['pay_for_travel'],
            'pay_for_other'=>$input['pay_for_other'],
            'exist_require'=>$input['exist_require'],
            'require'=>$input['require'],
            'next_shipment_schedule_time' => $input['next_shipment_schedule_time'],
            'next_shipment_schedule_num' => $input['next_shipment_schedule_num'],
            'next_shipment_schedule_flag' => $input['next_shipment_schedule_flag']
        ];
            $upd=DB::table($this->rqccd3)->where('id',$input['id'])->update($updateData);
            if($upd===false) TEA('804');
        }catch(\ApiException $e){
            //回滚
            DB::connection()->rollBack();
            TEA($e->getCode());
        }
        //提交事务
        DB::connection()->commit();

    }
//endregion

// region 删
    /**
     * 删除一个答案(逻辑删除, status=1)
     * @param $input
     * @return
     * @author
     */
    public function deleteOneAnswer($input)
    {
        //更新同一个客诉单同一个问题同一个责任人的status记录
        $updateWhere = [
            ['customer_complaint_id', '=', $input->customer_complaint_id],
            ['responsible_person_id', '=', $input->responsible_person_id],
            ['question_id', '=', $input->question_id]
        ];
        $updateData = [
            'status' => 1//已回复, 非最新回复
        ];
        return DB::table($this->rqcca)->where($updateWhere)->update($updateData);
    }

    /**
     * 删除发送问题
     * @param  $input
     * @return
     * @author
     */
    public function checkDeleteSendQuestion($input){
        if (!isset($input['sendItem']))
            TEA('700', 'sendItem');//客诉单id

        $sendItem = json_decode($input['sendItem']);
        //客诉单id;
        $customer_complaint_ids = [];
        //负责人id;
        $responsible_person_ids = [];
        //问题id;
        foreach ($sendItem as $key => $value) {
            $customer_complaint_ids[] = $value->customer_complaint_id;
            $responsible_person_ids[] = $value->responsible_person_id;
        }
        unset($key, $value);
        //所有客诉单id
        $Cids = DB::table($this->table)->pluck('id')->toArray();
        //所有用户id
        $Pids = DB::table($this->re)->pluck('id')->toArray();
        //所有问题id
        $diffC = array_diff($customer_complaint_ids, $Cids);
        $diffP = array_diff($responsible_person_ids, $Pids);
        if (count($diffC) > 0) {
            return array('field' => 'customer_complaint_id', 'value' => $diffC);
        }
        if (count($diffP) > 0) {
            return array('field' => 'responsible_person_id', 'value' => $diffP);
        }


        return false;
    }

    /**
     * 删除发送问题(直接删除数据表)
     * @param $input
     * @return
     * @author
     */
    public function deleteSendQuestion($input)
    {
        $data = json_decode($input['sendItem']);
        foreach ($data as $key => $value) {
            $order = $value->order;
            $question_ids = DB::table($this->rqccq)->where('order', '=', $order)->pluck('id')->toArray();
            $tmpDelete = [
                ['customer_complaint_id', '=', $value->customer_complaint_id],
                ['responsible_person_id', '=', $value->responsible_person_id],
                ['status', '<>', 1]
            ];
            DB::table($this->rqcca)->where($tmpDelete)->whereIn('question_id', $question_ids)->delete();
        }
        unset($key, $value);
        return true;
    }
//endregion


//region 查

    /**
     * 检查是否能显示完整的客诉单;
     * @param  $input
     * @return
     * @author
     */
    public function checkDisplayWholeComplaint($input){
        if(!isset($input['customer_complaint_id']))TEA('700','customer_complaint_id');
    }

    /**
     * 显示完整的客诉单(已审核通过的)
     * @param  $input
     * @return
     * @author
     */
    public function displayWholeComplaint($input){
        $results=[];
        $results['base']=DB::table($this->table.' as table')
            ->leftJoin($this->rqccm.' as m','table.judge_message_id','=','m.id')
            ->leftJoin($this->rm.' as material','table.material_id','=','material.id')
            ->leftJoin($this->rpo.' as production','table.po_id','=','production.id')
            ->select('table.*','m.content','production.number  as  production_number','material.name  as  material_name')
            ->where('table.id',$input['customer_complaint_id'])
            ->get();
        $results['D2']=DB::table($this->rqccd2)->where('customer_complaint_id',$input['customer_complaint_id'])->get();
        $results['D3']=DB::table($this->rqccd3.' as b')
            ->select(
                'b.*',
                'e.name as employee_name'
            )
            ->leftJoin($this->user.' as u','b.creator_id','=','u.id')
            ->leftJoin($this->re.' as e','u.employee_id','=','e.id')
            ->where('customer_complaint_id',$input['customer_complaint_id'])->get();
        $results['D4D8']=DB::table($this->rqcca.' as a')
            ->leftJoin($this->rqccq.' as q','a.question_id','=','q.id')
            ->leftJoin($this->re.' as e','a.responsible_person_id','=','e.id')
            ->leftJoin($this->rqccm.' as m','a.judge_message_id','=','m.id')
            ->select(
                'a.question_id',
                'q.question_name',
                'a.question_value',
                'a.responsible_person_id',
                'a.status',
                'm.content as judge_message',
                'e.name as responsible_person_id',
                'a.create_time',
                'q.discipline_no',
                'q.order as question_order'
            )
            ->where([['a.customer_complaint_id',$input['customer_complaint_id']],['a.status','<>',1]])
            ->orderBy('q.discipline_no')
            ->get();
        return $results;
    }

    /**
     * 查询所有已发送给qc的客诉单
     * @param
     * @return
     * @author
     */
    public function showAllComplaintToQc(&$input)
    {
        if (!isset($input['page_no']) || !isset($input['page_size'])) TEA('700', 'page');
        //取未发送给qc的所有的客诉单(status=0)
        $where = $this->_search($input);
        $content = DB::table($this->table)
            ->where($where)
            ->offset(($input['page_no'] - 1) * $input['page_size'])
            ->limit($input['page_size'])
            ->get();
        $input['total_records'] = $content->count();
        return $content;
    }



    /**
     * 查询所有未发送给qc的客诉单
     * @param $input
     * @return
     * @author
     */
    public function showAllComplaintNotToQc(&$input)
    {
        if (!isset($input['page_no']) || !isset($input['page_size'])) TEA('700', 'page');
        //取未发送给qc的所有的客诉单(status=0)
        $where = $this->_no_search($input);
        $content = DB::table($this->table)
            ->where('over_status', '=', 0)
            ->where($where)
            ->offset(($input['page_no'] - 1) * $input['page_size'])
            ->limit($input['page_size'])
            ->get();
        $input['total_records'] = DB::table($this->table)->where('over_status', '=', 0)->where($where)->count();
        return $content;
    }

    /**
     * detail的参数检查
     * @param $input
     * @return
     * @author
     */
    public function checkDetailAnswer($input)
    {
        if (!isset($input['customer_complaint_id'])) TEA('700', 'customer_complaint_id');
    }

    /**
     * 根据客诉单id和用户id获取需要填的所有问题, 以及上层问题的所有已有答案
     * @param $input
     * @return
     * @author
     * @description
     */
    public function detailAnswer($input)
    {
        //第一次打开, 无信息, 返回空数组;
        if (!$this->isHave('customer_complaint_id', $input['customer_complaint_id'], $this->rqcca))
            return [];
        //员工id;
        $employee_id = $this->employeeId();
        //所有需要回答的问题id
        $allQuestionId = DB::table($this->rqcca.' as a')
            ->leftJoin($this->rqccq.' as q','a.question_id','=','q.id')
            ->where(
                [
                    ['a.customer_complaint_id', $input['customer_complaint_id']],
                    ['a.responsible_person_id', $employee_id],
                    ['a.status', 0]
                ]
            )
            ->orderBy('q.order','desc')
            ->orderBy('a.question_id','desc')
            ->pluck('a.question_id')->toArray();
        //最后一个问题
        if (count($allQuestionId) > 0) {
            $lastQuestion = $allQuestionId[0];
            //所有上层已回答的问题id
            $answeredIds = DB::table($this->rqccq)
                ->where('order', '<=', DB::raw('(select `order` from ' . $this->rqccq . ' where `id`=' . $lastQuestion . ')'))
//                ->toSql();
                ->pluck('id')->toArray();
        } else {
            $answeredIds = [];
        }

//        return $allQuestionId;
//        return $answeredIds;
        //所有上层问题的答案;
        $answers = DB::table($this->rqcca . ' as a')
            ->leftJoin($this->rqccq . ' as q', 'a.question_id', '=', 'q.id')
            ->leftJoin($this->re . ' as e', 'a.responsible_person_id', '=', 'e.id')
            ->select(
                'a.id',
                'a.customer_complaint_id',
                'a.question_id',
                'q.question_name',
                'a.question_value',
                'a.responsible_person_id',
                'e.name as responsible_person_name',
                'a.status',
                'q.order as question_order',
                'a.create_time'
            )
            ->whereRaw(
                '((a.customer_complaint_id=' . $input['customer_complaint_id'] . ' and a.status=0) ' .
                ' or (a.customer_complaint_id = ' . $input['customer_complaint_id'] . ' and a.status=2))'
            )
            ->whereIn('a.question_id', $answeredIds)
            ->orderBy('q.id', 'asc')
            ->orderBy('q.order', 'asc')
            ->orderBy('a.status', 'desc')
            ->get();
//            ->toSql();
        //分离本用户的和其他用户的;
        $results = [];
        foreach ($answers as $key => $value) {
            if ($value->responsible_person_id == $this->employeeId()&& $value->status==0) {
                $results['question'][] = $value;
            } else {
                $results['answer'][] = $value;
            }
        }
        return $results;
    }


    /**
     * 根据当前用户id显示需要填写问题的客诉列表
     * @param $input
     * @return
     * @author
     */
    public function detailComplaintByAdmin(&$input)
    {
        //根据当前用户绑定的员工ID获取 所有需要回答问题的客诉单详情
        $where = $this->_no_search($input);
        $content = DB::table($this->rqcca . ' as a')
            ->leftJoin($this->table . ' as table', 'a.customer_complaint_id', '=', 'table.id')
            ->select(
                'table.id',
                'table.complaint_code',
                'table.customer_name',
                'table.po_id',
                'table.actual_respond_date',
                'table.create_time',
                'table.target_respond_date',
                'table.actual_respond_date',
                'table.received_date',
                'table.samples_received_date',
                'table.judge_result',
                'table.status',
                'table.judge_message_id'
            )
            ->where(
                [
                    ['a.responsible_person_id', $this->employeeId()],
                    ['a.status', 0]
                ]
            )
            ->whereIn('table.status', [1,3])
            ->where($where)
            ->groupBy('a.customer_complaint_id')
            ->get();
        $input['total_records'] = $content->count();
        return $content;
    }

    /**
     * 查看当前用户需要审核的客诉单;(status=2待审核)
     * @param
     * @return
     * @author
     */
    public function listComplaintToJudge(&$input)
    {
        $where = $this->_no_search($input);
        $content = DB::table($this->table)
            ->where([['status', '=', 2], ['judge_person_id', '=', $this->employeeId()]])
            ->where($where)
            ->get();
        $input['total_records'] = $content->count();
        return $content;
    }



    /**
     * 查看问题发送情况
     * @param $input
     * @return
     * @author
     */
    public function listQuestion($input)
    {
        if (!isset($input['customer_complaint_id'])) TEA('700', 'customer_complaint_id');
        if (!$this->isHave('customer_complaint_id', $input['customer_complaint_id'], $this->rqcca))
            return [];

        $list = DB::table($this->rqcca . ' as a')
            ->leftJoin($this->rqccq . ' as q', 'a.question_id', '=', 'q.id')
            ->leftJoin($this->re . ' as e', 'a.responsible_person_id', '=', 'e.id')
            ->leftJoin($this->rd . ' as d', 'e.department_id', '=', 'd.id')
            ->select(
                'a.question_id',
                'q.discipline_no',
                'q.order',
                'q.status as question_status',
                'a.responsible_person_id',
                'e.name as responsible_person_name',
                'e.department_id',
                'd.name as department_name'
            )
            ->where(
                [
                    ['a.customer_complaint_id', '=', $input['customer_complaint_id']],
                    ['a.status', '<>', 1]
                ]
            )
            ->orderBy('q.order', 'asc')
            ->get();
        $res = [];
        //遍历结果, 按照Dx的顺序分成几个数组
        foreach ($list as $key => $value) {
            $res[$value->order][] = $value;
        }
        unset($key, $value);
        $result = [];
        foreach ($res as $key => $value) {
            foreach ($value as $k => $v) {
                $result['O' . $key][$v->responsible_person_name] = $v;
            }
            unset($k, $v);
        }
        unset($key, $value);
        return $result;
    }

    /**
     * 检查已发送问题的解答情况
     * @param $input
     * @return
     * @author
     */
    public function checkDetailQuestion($input)
    {
        if (!isset($input['customer_complaint_id'])) TEA('700', 'customer_complaint_id');
        if (!isset($input['question_id'])) TEA('700', 'question_id');
        if (!isset($input['responsible_person_id'])) TEA('700', 'responsible_person_id');

        $where = [
            ['customer_complaint_id', '=', $input['customer_complaint_id']],
            ['responsible_person_id', '=', $input['responsible_person_id']],
            ['question_id', '=', $input['question_id']],
            ['status', '=', 2]
        ];
        $has = $this->isExisted($where, $this->rqcca);
        if (!$has) TEA('1400');//该问题暂无有效回答

    }

    /**
     * 查看已经发送的问题解答情况
     * @param $input
     * @return
     * @author xin.min 20180704
     */
    public function detailQuestion($input)
    {
        $where = [
            ['customer_complaint_id', '=', $input->customer_complaint_id],
            ['responsible_person_id', '=', $input->responsible_person_id],
            ['question_id', '=', $input->question_id],
            ['statue', '=', 2]
        ];
        return DB::table($this->rqcca)->where($where)->get();
    }

//endregion

//region 审核

    /**
     * 检查客诉单id是否正常/正确;
     * @param  $input
     * @return
     * @author
     */
    public function checkSubmitJudgeComplaint($input)
    {
        if (!isset($input['customer_complaint_id'])) TEA('700', 'customer_complaint_id');
        if (!isset($input['judge_person_id'])) TEA('700', 'judge_person_id');
        if(!isset($input['target_respond_date']))TEA('700','target_respond_date');
        if(!isset($input['actual_respond_date']))TEA('700','actual_respond_date');

        if (!$this->isHave('id', $input['customer_complaint_id'], $this->table)) TEA('700', 'customer_complaint_id');
        if (!$this->isHave('id', $input['judge_person_id'], $this->re)) TEA('700', 'judge_person_id');
    }

    /**
     * 申请审核客诉单
     * @param  $input
     * @return
     * @author
     */
    public function submitJudgeComplaint($input)
    {
        //判断  是否已经完结  完结了之后才能 提交申请
        $result =  DB::table($this->table)->select('over_status')->where('id', $input['customer_complaint_id'])->first();
        if($result->over_status <1) TEA('6200', 'customer_complaint_id');


        $updateData = [
            'target_respond_date'=>$input['target_respond_date'],
            'actual_respond_date'=>$input['actual_respond_date'],
            'judge_person_id'    => $input['judge_person_id'],
            'status' => 2
        ];
        return DB::table($this->table)->where('id', $input['customer_complaint_id'])->update($updateData);
    }
    /**
     * 检查审核客诉单字段是否正常/正确
     * @param $input
     * @return
     * @author
     */
    public function checkJudgeComplaint($input)
    {
        //客诉单id验证
        if (!isset($input['customer_complaint_id'])) TEA('700', 'customer_complaint_id');
        if (!isset($input['judge_result'])) TEA('700', 'judge_result');

        if ($input['judge_result'] !== 'true' && $input['judge_result'] !== 'false')
            TEA('700', 'judge_result');
        if (!$this->isHave('id', $input['customer_complaint_id'], $this->table))
            TEA('700', 'customer_complaint_id');
    }

    /**
     * 审核客诉单
     * @param  $input
     * @return
     * @author xin.min 20180704
     */
    public function judgeComplaint($input)
    {
        $canJudge = DB::table($this->table)->where('id', $input['customer_complaint_id'])->value('judge_result');
        //判断是否已经通过审核; 1代表审核通过,0代表审核未通过

        //已经通过审核, 直接return true;
        if ($canJudge == 1) {
            //规避错误, 强制改状态为4
            DB::table($this->table)->where('id',$input['customer_complaint_id'])->update(['status'=>4]);
            return '审核已通过';
        } elseif ($canJudge == 0) {
            //等待审核, 修改审核状态, judge_result=true为审核通过, judge_result=false为审核不通过;
            if ($input['judge_result'] === 'true') {
                //增加打回的描述
                $insertMessage = [
                    'content' => empty($input['judge_message']) ? '' : $input['judge_message'],
                    'creator_id' => session('administrator')->admin_id,
                    'create_time' => date('Y-m-d H:i:s', time()),
                    'type' => 1,
                    'customer_complaint_id' => $input['customer_complaint_id'],
                ];
                $messageId = DB::table($this->rqccm)->insertGetId($insertMessage);
                //通过审核;
                $updateData = [
                    'judge_result' => 1,
                    'judge_message_id' => $messageId,
                    'status' => 4
                ];
                DB::table($this->table)->where('id', $input['customer_complaint_id'])->update($updateData);
                return '审核已通过';
            } else {
                //增加打回的描述
                $insertMessage = [
                    'content' => empty($input['judge_message']) ? '' : $input['judge_message'],
                    'creator_id' => session('administrator')->admin_id,
                    'create_time' => date('Y-m-d H:i:s', time()),
                    'type' => 1,
                    'customer_complaint_id' => $input['customer_complaint_id'],
                ];
                $messageId = DB::table($this->rqccm)->insertGetId($insertMessage);
                //未通过审核;
                $updateData = [
                    'judge_result'=>0,
                    'judge_message_id' => $messageId,
                    'status' => 3
                ];
                DB::table($this->table)->where('id', $input['customer_complaint_id'])->update($updateData);
                //修改答案的状态为1,重新填写答案
                return '审核未通过';
            }
        }


    }

    /**
     * 检查打回问题字段是否正常/正确
     * @param  $input
     * @return
     * @author
     */
    public function checkJudgeQuestion($input)
    {
        if (!isset($input['customer_complaint_id'])) TEA('700', 'customer_complaint_id');
        if (!isset($input['order'])) TEA('700', 'order');
        if (!isset($input['responsible_person_id'])) TEA('700', 'responsible_person_id');


        $where = [
            ['customer_complaint_id', '=', $input['customer_complaint_id']],
            ['responsible_person_id', '=', $input['responsible_person_id']],
            ['status', '=', 2]
        ];
        $has = $this->isExisted($where, $this->rqcca);
        if (!$has) TEA('1400');//该问题暂无有效回答
    }

    /**
     * 打回问题
     * @param  $input
     * @return
     * @author
     */
    public function judgeQuestion($input)
    {
        //需要打回的问题ids;
        $question_ids = DB::table($this->rqccq)->where('order', $input['order'])->pluck('id');
        //打回已回答的答案
        $where = [
            ['customer_complaint_id', '=', $input['customer_complaint_id']],
            ['responsible_person_id', '=', $input['responsible_person_id']],
            ['status', '=', 2]
        ];
        DB::table($this->rqcca)->where($where)->whereIn('question_id', $question_ids)->update(['status' => 1]);


        //增加打回的描述
        $insertMessage = [
            'content' => empty($input['judge_message']) ? '' : $input['judge_message'],
            'creator_id' => session('administrator')->admin_id,
            'create_time' => date('Y-m-d H:i:s', time()),
            'type' => 2,//2代表打回
            'customer_complaint_id' => $input['customer_complaint_id'],
            'order' => $input['order'],
            'responsible_person_id' => $input['responsible_person_id'],
        ];
        $messageId = DB::table($this->rqccm)->insertGetId($insertMessage);

        //重新发送问题给对应负责人
        foreach ($question_ids as $value) {
            $insertDate[] = [
                'customer_complaint_id' => $input['customer_complaint_id'],
                'question_id' => $value,
                'responsible_person_id' => $input['responsible_person_id'],
                'status' => 0,
                'create_time' => date('Y-m-d H:i:s'),
                'judge_message_id' => $messageId
            ];
        }

        DB::table($this->rqcca)->insert($insertDate);

        return true;
    }
//endregion





/**
 * @message PO_number  模糊查询
 * @author  liming
 * @time    年 月 日
 */    
 public  function  dimPonumber($input)
 {
        $where=array();
        if (isset($input['name']) && $input['name']) {    
            $where[]=['number','like','%'.$input['name'].'%'];
        }

        $results=DB::table($this->rpo)
        ->select('*','number as name')
        ->where($where)
        ->limit(10)
        ->get();
        return  $results;
 }


/**
 * @message 物料编号  模糊查询
 * @author  liming
 * @time    年 月 日
 */    
 public  function  dimMaterial($input)
 {
        $where=array();
        $orwhere=array();
        if (isset($input['name']) && $input['name']) {    
            $where[]=['item_no','like','%'.$input['name'].'%'];
            $orwhere[]=['name','like','%'.$input['name'].'%'];
        }
        $results=DB::table($this->rm)
        ->select('item_no','name','id')
        ->where($where)
        ->orWhere($orwhere)
        ->limit(10)
        ->get();
        return  $results;
 }

/**
 * 搜索
 */
private function _search($input)
{
    $where = array();
    if (isset($input['finish_status']) && $input['finish_status']) {//归档  状态
        $where[]=['finish_status','=',$input['finish_status']];
    }


    if (isset($input['status']) && $input['status']!='') {//客诉单  状态
        $where[]=['status','=',$input['status']];
    }
    else
    {
         $where[]=['status','>',0];
         $where[]=['status','<',5];
    }

    if (isset($input['customer_name']) && $input['customer_name']) {
        $where[]=['customer_name','like','%'.$input['customer_name'].'%'];
    }

        if (isset($input['complaint_code']) && $input['complaint_code']) {
        $where[]=['complaint_code','like','%'.$input['complaint_code'].'%'];
    }
    return $where;
}
/**
 * 搜索
 */
private function _no_search($input)
{
    $where = array();
    if (isset($input['status']) && $input['status']!='') {//客诉单  状态
        $where[]=['status','=',$input['status']];
    }


    if (isset($input['customer_name']) && $input['customer_name']) {
        $where[]=['customer_name','like','%'.$input['customer_name'].'%'];
    }

        if (isset($input['complaint_code']) && $input['complaint_code']) {
        $where[]=['complaint_code','like','%'.$input['complaint_code'].'%'];
    }
    return $where;
}

}