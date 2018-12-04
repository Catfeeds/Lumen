<?php
/**
 * Created by PhpStorm.
 * User: wangguangyang
 * Date: 2018/1/9
 * Time: 16:43
 */
namespace App\Http\Models\QC;
use App\Http\Models\Base;
use Illuminate\Support\Facades\DB;
class Aod extends Base
{
    public function __construct()
    {
        $this->table='ruis_accept_on_deviation';
    }
//region  检
//endregion
//region  增

    public function insertAod($input)
    {
        if(empty($input['creator_token']))  TEA('700','creator_token');
        $userInfo=$this->getUserInfoByCookie($input['creator_token'],['id','name']);
        if(empty($userInfo))  TEA('700','creator_token');
        $data=[
            'title'=>$input['title'],
            'provider'=>$input['provider'],
            'order_id'=>$input['order_id'],
            'material_id'=>$input['material_id'],
            'date'=>$input['date'],
            'number'=>$input['number'],
            'reason'=>$input['reason'],
            'content'=>$input['content'],
            'method'=>$input['method'],
            'status'=>$input['status'],
            'finish_date'=>$input['finish_date'],
            'is_withhold'=>$input['is_withhold'],
            'create_id'=>$userInfo->id,
        ];
        $insert_id=DB::table($this->table)->insertGetId($data);
        if(!$insert_id) TEA('6400');
        return $insert_id;
    }

    public function commitAod($input)
    {
        $data=[
            'person_liable_id' => $input['person_liable_id'],
            'ctime' => time(),
        ];
        $insert_id=DB::table('ruis_approval')->insertGetId($data);
        if(!$insert_id) TEA('6402');
        return $insert_id;

    }
//endregion
//region  修

    public function updateAod($input)
    {
        $data=[
            'title'=>$input['title'],
            'provider'=>$input['provider'],
            'order_id'=>$input['order_id'],
            'material_id'=>$input['material_id'],
            'date'=>$input['date'],
            'number'=>$input['number'],
            'reason'=>$input['reason'],
            'content'=>$input['content'],
            'method'=>$input['method'],
            'status'=>$input['status'],
            'finish_date'=>$input['finish_date'],
            'is_withhold'=>$input['is_withhold'],
        ];
        $pdu=DB::table($this->table)->where('id','=',$input['aod_id'])->update($data);
        if(!$pdu) TEA('6401');
        return $pdu;
    }
    public function approval($input)
    {
        $data=[
            'is_agress'=>$input['is_agress'],
            'idea'=>$input['idea'],
        ];
        $pdu=DB::table('ruis_approval')->where('id','=',$input['approval_id'])->update($data);
        if(!$pdu) TEA('6203');
        return $pdu;
    }

//endregion
//region  查
//endregion
//region  删
//endregion

}