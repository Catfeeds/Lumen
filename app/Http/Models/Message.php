<?php
/**
 * Created by PhpStorm.
 * User: haoziye
 * Date: 2018/1/30
 * Time: 下午4:04
 */
namespace App\Http\Models;
use Illuminate\Support\Facades\DB;

class Message extends Base{

    public $apiPrimaryKey = 'message_id';

    public function __construct()
    {
        parent::__construct();
        if(!$this->table) $this->table = config('alias.rsm');
    }

//region 检

    /**
     * @param $input
     * @author hao.wei <weihao>
     */
    public function checkFormFields(&$input){
        $input['create_id'] = (!empty(session('administrator')->admin_id)) ? session('administrator')->admin_id : 0;
        if(empty($input['type']) || !is_numeric($input['type'])) TEA('700','type');
        if($input['type'] != 1 && $input['type'] != 2) TEA('700','type');
        if(empty($input['title']) || mb_strlen($input['title']) > config('app.comment.sys_message_title')) TEA('700','title');
        if(empty($input['content']) || mb_strlen($input['content']) > config('app.comment.sys_message_content')) TEA('700','content');
        if($input['type'] == 1){
            if(empty($input['receive_role']) || !is_json($input['receive_role'])) TEA('700','receive_role');
            $input['receive'] = json_decode($input['receive_role'],true);
            if(empty($input['receive'])) TEA('700','receive_role');
            foreach($input['receive'] as $v){
                if(!is_numeric($v)) TEA('700','receive_role');
                $has = $this->isExisted([['id','=',$v]],config('alias.rrr'));
                if(!$has) TEA('700','receive_role');
            }
        }
        if($input['type'] == 2){
            if(empty($input['receive_admin']) || !is_json($input['receive_admin'])) TEA('700','receive_role');
            $input['receive'] = json_decode($input['receive_admin'],true);
            if(empty($input['receive'])) TEA('700','receive_admin');
            foreach($input['receive'] as $v){
                $has = $this->isExisted([['id','=',$v]],config('alias.rrad'));
                if(!$has) TEA('700','receive_admin');
            }
        }
    }

//endregion

//region 增

    /**
     * 添加消息
     * @param $input
     * @insert_id 消息的主键id
     */
    public function add($input){
        //开启事务
        try{
            DB::connection()->beginTransaction();
            $sysMessage = [
                'create_id'=>$input['create_id'],
                'type'=>$input['type'],
                'title'=>$input['title'],
                'content'=>$input['content'],
                'ctime'=>time(),
            ];
            if($input['type'] == 1){
                $sysMessage['receive_role'] = $input['receive_role'];//角色接收
            }else{
                $sysMessage['receive_admin'] = $input['receive_admin'];//用户接收
            }
            $insert_id = DB::table($this->table)->insertGetId($sysMessage);//录入消息本体
            $userSysMessageData = [];
            foreach($input['receive'] as $k=>$v){
                if($input['type'] == 1){//角色接收时需要找到该角色下的用户
                    $adminArr = DB::table(config('alias.rri'))->select('admin_id')->where('role_id','=',$v)->get();
                    foreach($adminArr as $h=>$z){
                        $userSysMessageData[] = [
                            'admin_id'=>$z->admin_id,
                            'message_id'=>$insert_id,
                        ];
                    }
                }else{//用户接收是直接录入关联
                    $userSysMessageData[] = [
                        'admin_id'=>$v,
                        'message_id'=>$insert_id,
                    ];
                }
            }
            DB::table(config('alias.rusm'))->insert($userSysMessageData);
        }catch(\ApiException $e){
            DB::connection()->rollBack();
            TEA($e->getCode());
        }
        DB::connection()->commit();
        return $insert_id;
    }

//endregion

//region 查

    /**
     * 系统消息列表
     * @param Request $request
     * @return object
     * @author hao.wei <weihao>
     */
    public function getSysMessageList(&$input){
        $field = [
            'rsm.id as '.$this->apiPrimaryKey,
            'rsm.type',
            'rrad.name as create_name',
            'rsm.title',
            'rsm.ctime',
        ];
        $where = [];
        if(!empty($input['create_name'])) $where[] = ['rrad.name','like','%'.$input['create_name'].'%'];
        if(!empty($input['type'])) $where[] = ['rsm.type','=',$input['type']];
        if(!empty($input['start_time'])) $where[] = ['ctime','>=',strtotime($input['start_time'])];
        if(!empty($input['end_time'])) $where[] = ['ctime','<=',strtotime($input['end_time'])];
        if(!empty($input['title'])) $where[] = ['title','like','%'.$input['title'].'%'];
        $builder = DB::table($this->table.' as rsm')
            ->select($field)
            ->leftJoin(config('alias.rrad').' as rrad','rsm.create_id','=','rrad.id')
            ->where($where);
        $input['total_records'] = $builder->count();
        $builder->offset(($input['page_no'] - 1) * $input['page_size'])->limit($input['page_size']);
        if(!empty($input['sort']) && !empty($input['order'])) $builder->orderBy($input['sort'],$input['order']);
        $obj_list = $builder->get();
        foreach ($obj_list as $k=>&$v){
            $v->ctime = date('Y-m-d H:i:s',$v->ctime);
            $v->receiverCount = DB::table(config('alias.rusm'))->where('message_id',$v->message_id)->count();
            $v->receiverReadCount = DB::table(config('alias.rusm'))->where([['message_id',$v->message_id],['is_read',0]])->count();
        }
        return $obj_list;
    }

    /**
     * 消息详情
     * @param $id
     * @return object
     */
    public function get($id){
        $field = [
            'rsm.id as '.$this->apiPrimaryKey,
            'rsm.type',
            'rrad.name as create_name',
            'rsm.title',
            'rsm.content',
            'rsm.ctime',
        ];
        $obj = DB::table($this->table.' as rsm')->select($field)
            ->leftJoin(config('alias.rrad').' as rrad','rsm.create_id','=','rrad.id')->where('rsm.'.$this->primaryKey,$id)->first();
        if(!$obj) TEA('404');
        return $obj;
    }

//endregion

//region 删

    /**
     * 删除消息
     * @param $id
     * @author hao.wei <weihao>
     */
    public function delete($id){
        try{
            DB::connection()->beginTransaction();
            DB::table($this->table)->where($this->primaryKey,$id)->delete();
            DB::table(config('alias.rusm'))->where('message_id',$id)->delete();
        }catch(\ApiException $e){
            DB::connection()->rollbak();
        }
        DB::connection()->commit();
    }

//endregion
}