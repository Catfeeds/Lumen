<?php
/**
 * Created by PhpStorm.
 * User: wangguangyang
 * Date: 2017/12/27
 * Time: 15:49
 */
namespace App\Http\Models\QC;
use App\Http\Models\Base;
use Illuminate\Support\Facades\DB;

class QualityAbnormalityReport extends Base
{
    protected $connection = 'mysql';
    protected $type = [1,2];

    public function __construct()
    {
        $this->table='ruis_quality_abnormality_report';
    }
//region  检


//endregion

////region  增

    public function insertAbnormal($input)
    {
        $data=[
            'order_id' => $input['order_id'],
            'check_id' => $input['check_id'],
            'material_id' => $input['material_id'],
            'partner' => $input['partner'],
            'number' => $input['number'],
            'spot_number' => $input['spot_number'],
            'disqualification_number' => $input['disqualification_number'],
            'reject_ratio' => $input['reject_ratio'],
            'batch' => $input['batch'],
//            'abnormal_type' => $input['abnormal_type'],
            'question_description' => $input['question_description'],
            'measures' => $input['measures'],
//            'responsibility_department_id' => $input['responsibility_department_id'],
//            'enclosure_id' => $input['enclosure_id'],
            'creator_id' => (session('administrator')) ? session('administrator')->admin_id : 0,
            'ctime' => time(),
        ];
        $insert_id = DB::table($this->table)->insertGetId($data);
        if(empty($insert_id)) TEA('6300');

        return $insert_id;
    }

    public function tranmission($input)
    {

        foreach ($this->type as $item){
            $data=[
                'abnormality_id' =>$input['abnormality_id'],
                'type' =>$item,
                'department_id' =>$input['department_id'],
                'person_liable_id' =>$input['person_liable_id'],
                'creator_id' => (session('administrator')) ? session('administrator')->admin_id : 0,
                'ctime' =>time(),
            ];
            $insert_id = DB::table('ruis_handling_suggestion')->insertGetId($data);
            if(empty($insert_id)) TEA('6301');
        }



        return $insert_id;
    }

    public function adjudicate($input)
    {

        $data=[
            'abnormality_id' => $input['abnormality_id'],
            'person_liable_id' => $input['person_liable_id'],
            'creator_id' => (session('administrator')) ? session('administrator')->admin_id : 0,
            'ctime' => time(),
        ];
        $insert_id = DB::table('ruis_adjudicate')->insertGetId($data);
        if(empty($insert_id)) TEA('6301');

        return $insert_id;
    }

//endregion

//region  修

    public function editAbnormal($input)
    {
        $data=[
            'number' => $input['number'],
            'spot_number' => $input['spot_number'],
            'disqualification_number' => $input['disqualification_number'],
            'reject_ratio' => $input['reject_ratio'],
            'batch' => $input['batch'],
            'question_description' => $input['question_description'],
            'measures' => $input['measures'],
//            'person_liable_id' => $input['person_liable_id'],
//            'responsibility_department_id' => $input['responsibility_department_id'],
//            'enclosure_id' => $input['enclosure_id'],
        ];
        DB::table($this->table)->where('id','=',$input['abnormal_id'])->update($data);
        return $input['abnormal_id'];
    }

    public function abnormalInform($input)
    {
        DB::table($this->table)->where('id','=',$input['abnormal_id'])->update(['progress' => 1]);
        return $input['abnormal_id'];
    }

    public function uptadeTranmission($input)
    {
        $pdu1 = DB::table('ruis_handling_suggestion')->where('id','=',$input['reasonId'])->update(['description' =>$input['reason']]);
//        if(empty($pdu1)) TEA('6303');
        $pdu2 = DB::table('ruis_handling_suggestion')->where('id','=',$input['methodId'])->update(['description' =>$input['method']]);
//        if(empty($pdu2)) TEA('6303');
//        if(!empty($pdu1) && !empty($pdu2))

        return true;
//        $data=[
//            'description' =>$input['description'],
//        ];
//        $pdu = DB::table('ruis_handling_suggestion')->where('id','=',$input['handling_suggestion_id'])->update($data);
//        if(empty($pdu)) TEA('6302');
//
//        return $pdu;
    }

    public function backTranmission($input)
    {
        $pdu1 = DB::table('ruis_handling_suggestion')->where('id','=',$input['reasonBackId'])->update(['send_back_reason' =>$input['reasonBack']]);
//        if(empty($pdu1)) TEA('6303');
        $pdu2 = DB::table('ruis_handling_suggestion')->where('id','=',$input['methodBackId'])->update(['send_back_reason' =>$input['methodBack']]);
//        if(empty($pdu2)) TEA('6303');
//        if(!empty($pdu1) && !empty($pdu2))

        return true;
    }

    public function editAdjudicate($input)
    {
        $data=[
            'following' => $input['following'],
            'adjuicate_idea' => $input['adjuicate_idea'],
        ];
        $pdu = DB::table('ruis_adjudicate')->where('id','=',$input['adjudicate_id'])->update($data);
        if(empty($pdu)) TEA('6304');

        return $pdu;
    }
    public function audit($input)
    {
        $data=[
            'audit' => $input['audit'],
        ];
        $pdu = DB::table($this->table)->where('id','=',$input['id'])->update($data);
        if(empty($pdu)) TEA('6305');

        return $pdu;
    }



//endregion

//region  查

    public function viewAbnormal($input)
    {
        $obj_list=DB::table($this->table)->select('*')->where('id','=',$input['abnormal_id'])->get();
        return $obj_list;
    }

    public function viewAbnormalAll(&$input)
    {
        !empty($input['order_id']) &&  $where[]=['order_id','like','%'.$input['order_id'].'%']; //名称
        !empty($input['material_id']) &&  $where[]=['material_id','=',$input['material_id']]; //名称

        $builder = DB::connection($this->connection)->table($this->table)
            ->select('*')
            ->offset(($input['page_no']-1)*$input['page_size'])
            ->limit($input['page_size']);

        if (!empty($where)) $builder->where($where);
        //order  (多order的情形,需要多次调用orderBy方法即可)
        if (!empty($input['order']) && !empty($input['sort'])) $builder->orderBy( $input['sort'], $input['order']);
        //get获取接口
        $obj_list = $builder->get();

        foreach ($obj_list as $item){
            $item->ctime = date("Y-m-d H:i:s",$item->ctime);
        }
        //总共有多少条记录
        $count_builder= DB::connection($this->connection)->table($this->table);
        if (!empty($where)) $count_builder->where($where);
        $input['total_records']=$count_builder->count();
        return $obj_list;

    }

    public function departmentList($input)
    {
        $obj_list=DB::table('ruis_department')->select('id','parent_id','name')->get();
        return $obj_list;
    }
    public function employeeList($input)
    {
        $obj_list=DB::table('ruis_employee')->select('ruis_employee.*','ruis_department.name as department_name')
            ->leftjoin('ruis_department','ruis_department.id','=','ruis_employee.department_id')
            ->where('department_id','=',$input['department_id'])->get();
        return $obj_list;
    }
    public function sendEmployee($input)
    {
        $obj_list=DB::table('ruis_handling_suggestion')->select('ruis_employee.id as employee_id','ruis_department.name as dapartment','ruis_employee.name as employee')
            ->leftjoin('ruis_department','ruis_department.id','=','ruis_handling_suggestion.department_id')
            ->leftjoin('ruis_employee','ruis_employee.id','=','ruis_handling_suggestion.person_liable_id')
            ->groupBy('ruis_handling_suggestion.person_liable_id')
            ->where('abnormality_id','=',$input['abnormality_id'])
            ->get();
        return $obj_list;
    }
    public function viewReportInfo($input)
    {
        $input['employee_id'] = 1;
        $obj_list=DB::table('ruis_handling_suggestion')->select('*')
            ->where([['abnormality_id','=',$input['abnormality_id']],['person_liable_id','=',$input['employee_id']]])
            ->get();
        return $obj_list;
    }

//endregion

//region  删
    public function delete($input)
    {
        $delete=DB::table($this->table)->where('id','=',$input['abnormal_id'])->delete();
        if(empty($delete)) TEA('6504');

    }
    public function deleteReportInfo($input)
    {
        $delete=DB::table('ruis_handling_suggestion')->where([['abnormality_id','=',$input['abnormal_id']],['person_liable_id','=',$input['employee_id']]])->delete();
        if(empty($delete)) TEA('6504');

    }

//endregion

}