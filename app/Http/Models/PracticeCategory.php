<?php
/**
 * Created by PhpStorm.
 * User: haoziye
 * Date: 2018/5/11
 * Time: 上午9:38
 */
namespace App\Http\Models;
use App\Libraries\Tree;
use Illuminate\Support\Facades\DB;

class PracticeCategory extends Base{

    public $apiPrimaryKey = 'practiceCategory_id';

    public function __construct()
    {
        parent::__construct();
        if(empty($this->table)) $this->table = config('alias.rpc');
    }

//region 检

    /**
     * 检查传入参数
     * @param $input
     * @throws \App\Exceptions\ApiException
     */
    public function checkFormField(&$input){
        $add = $this->judgeApiOperationMode($input);
        if(empty($input['name'])) TEA('700','name');
        $check = $add ? [['name','=',$input['name']]] : [['id','<>',$input[$this->apiPrimaryKey]],['name','=',$input['name']]];
        $has = $this->isExisted($check);
        if($has) TEA('700','name');
        if(empty($input['code'])) TEA('700','code');
        $check = $add ? [['code','=',$input['code']]] : [['id','<>',$input[$this->apiPrimaryKey]],['code','=',$input['code']]];
        $has = $this->isExisted($check);
        if($has) TEA('700','code');
        if(!isset($input['parent_id']) || !is_numeric($input['parent_id'])) TEA('700','parent_id');
        if(!empty($input['parent_id'])){
            $has = $this->isExisted([['id','=',$input['parent_id']]]);
            if(!$has) TEA('160');
        }
        if(!isset($input['comment'])) TEA('700','comment');
    }

//endregion

//region 增

    /**
     * 添加
     * @param $input
     * @return mixed
     * @throws \App\Exceptions\ApiException
     */
    public function store($input){
        $data = [
            'name'=>$input['name'],
            'code'=>$input['code'],
            'parent_id'=>$input['parent_id'],
            'comment'=>$input['comment'],
        ];
        $res = DB::table($this->table)->insertGetId($data);
        if(!$res) TEA('802');
        return $res;
    }

//endregion

//region 查

    /**
     * 查询树结构
     * @return array
     */
    public function select(){
        $obj_list = DB::table($this->table)->get();
        $obj_list = Tree::findDescendants($obj_list);
        return $obj_list;
    }

    /**
     * 详情
     * @param $id
     * @return mixed
     * @throws \App\Exceptions\ApiException
     */
    public function show($id){
        $obj = DB::table($this->table)->where('id',$id)->first();
        if(empty($obj)) TEA('404');
        return $obj;
    }

//endregion

//region 修

    /**
     *  修改
     * @param $input
     * @throws \App\Exceptions\ApiException
     */
    public function update($input){
        $data = [
            'name'=>$input['name'],
            'code'=>$input['code'],
            'parent_id'=>$input['parent_id'],
            'comment'=>$input['comment'],
        ];
        $res = DB::table($this->table)->where('id',$input[$this->apiPrimaryKey])->update($data);
        if($res === false) TEA('804');
    }


//endregion


//region 删

    /**
     * 删除
     * @param $id
     * @throws \App\Exceptions\ApiException
     */
    public function delete($id){
        $has = $this->isExisted([['parent_id','=',$id]]);
        if($has) TEA('161');
        $res = DB::table($this->table)->where('id',$id)->delete();
        if(!$res) TEA('803');
    }

//endregion
}