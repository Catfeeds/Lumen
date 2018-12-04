<?php
/**
 * Created by PhpStorm.
 * User: wangguangyang
 * Date: 2018/3/23
 * Time: 15:57
 */

namespace App\Http\Models\QC;
use App\Http\Models\Base;
use Illuminate\Support\Facades\DB;
class Question extends Base
{
    public function __construct()
    {
//        $this->table='ruis_missing_items';
        $this->table=config('alias.rqmi');
    }

//region 检

//endregion

//region 增

    public function addItems($input)
    {
        $data=[
            'type' => $input['type'],
            'name' => $input['name'],
            'parent_id' => $input['parent_id'],
            'docking_people' => $input['docking_people'],
            'grade' => $input['grade'],
        ];
        $insert_id = DB::table($this->table)->insertGetid($data);
        if(empty($insert_id)) TEA('6501');
        return $insert_id;
    }

//endregion

//region 修

    public function updateItems($input)
    {
        $data=[
            'type' => $input['type'],
            'name' => $input['name'],
            'parent_id' => $input['parent_id'],
            'docking_people' => $input['docking_people'],
            'grade' => $input['grade'],
        ];
        DB::table($this->table)->where('id','=',$input['question_items_id'])->update($data);
        return $input['question_items_id'];
    }

//endregion
//region 查

    public function viewItems($input)
    {
        $list = DB::table($this->table." as rmi")->select('rmi.id as id','rmi.type as type_id','rct.name as type_name','rmi.name as question_name','rmi.parent_id as parent_id','rmi.docking_people as employee_id','re.name as docking_people_name','rmi.grade as grade')
            ->where('rmi.id','=',$input['question_items_id'])
            ->leftJoin('ruis_check_type as rct','rct.id','=','rmi.type')
            ->leftJoin('ruis_employee as re','re.id','=','rmi.docking_people')
            ->get();
//
        return $list;
    }

    public function viewItemsList($input)
    {
        $list = DB::table($this->table." as rmi")->select('rmi.id as id','rmi.type as type_id','rct.name as type_name','rmi.name as question_name','rmi.parent_id as parent_id','rmi.docking_people as employee_id','re.name as docking_people_name','rmi.grade as grade')
            ->leftJoin('ruis_check_type as rct','rct.id','=','rmi.type')
            ->leftJoin('ruis_employee as re','re.id','=','rmi.docking_people')
            ->groupBy('rmi.id')
            ->get();
        return $list;
    }

//endregion
//region 删

    public function deleteItems($input)
    {
        DB::table($this->table)->where('id','=',$input['question_items_id'])->delete();
        return $input['question_items_id'];
    }

//endregion

}