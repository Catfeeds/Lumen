<?php
/**
 * Created by PhpStorm.
 * User: lester
 * Date: 2018/9/19 9:51
 * Desc:
 */

namespace App\Http\Models;


use Illuminate\Support\Facades\DB;

class Preselection extends Base
{
    public $apiPrimaryKey = 'preselection_id';

    public function __construct()
    {
        !$this->table && $this->table = config('alias.rps');
    }

//region 检

    /**
     * @param $input
     * @throws \App\Exceptions\ApiException
     */
    public function checkFormField(&$input)
    {
        $add = $this->judgeApiOperationMode($input);

        if (empty($input['name'])) TEA('700', 'name');
        if (!isset($input['is_usual'])) TEA('700', 'is_usual');
//        $check = $add ? [['name', '=', $input['name']]] : [['name', '=', $input['name']], ['id', '<>', $input[$this->apiPrimaryKey]]];
//        $has = $this->isExisted($check);
//        if ($has) TEA('700', 'name');
        if ($add) {
            $input['creator_id'] = !empty(session('administrator')->admin_id) ? session('administrator')->admin_id : 0;
        }
    }

//endregion


//region 增
    /**
     * @param $input
     * @return mixed
     * @throws \App\Exceptions\ApiException
     */
    public function store($input)
    {
        $keyVal = [
            'name' => $input['name'],
            'ctime' => time(),
            'mtime' => time(),
            'creator_id' => $input['creator_id'],
            'is_usual' => $input['is_usual'],
        ];
        if (!empty($input['description'])) $keyVal['description'] = $input['description'];
        $id = DB::table($this->table)->insertGetId($keyVal);
        if ($id === false) {
            TEA('802');
        }
        return $id;
    }
//endregion

//region 删

    /**
     * @param $input
     * @throws \App\Exceptions\ApiException
     */
    public function delete($input)
    {
        if (empty($input[$this->apiPrimaryKey])) TEA('700', $this->apiPrimaryKey);
        DB::table($this->table)->where('id', $input[$this->apiPrimaryKey])->delete();
    }
//endregion

//region 改

    /**
     * 名称和详情描述都可以修改
     *
     * @param $input
     * @throws \App\Exceptions\ApiException
     */
    public function update($input)
    {
        $data = array(
            'name' => $input['name'],
            'mtime' => time()
        );
        !empty($input['description']) && $data['description'] = $input['description'];
        $res = DB::table($this->table)->where($this->primaryKey, $input[$this->apiPrimaryKey])->update($data);
        if ($res === false) TEA('804');
    }

//endregion

//region 查

    /**
     * 列表
     * @param $input
     * @return mixed
     */
    public function selectAll(&$input)
    {
        $where = [];
        if(!empty($input['name'])) $where[] = ['rps.name', 'like', '%' . $input['name'] . '%'];
        $select = [
            'rps.id as ' . $this->apiPrimaryKey,
            'rps.name',
            'rps.description',
            'rps.ctime',
            'rps.mtime',
            'rps.is_usual',
            'rrad.cn_name as creator_name'
        ];
        $builder = DB::table($this->table . ' as rps')
            ->leftJoin(config('alias.rrad') . ' as rrad', 'rrad.id', '=', 'rps.creator_id')
            ->select($select)
            ->where($where);
        $input['total_records'] = $builder->count();
        $obj_list = $builder->forPage($input['page_no'], $input['page_size'])->get();
        foreach ($obj_list as $key => &$value) {
            $value->ctime = date('Y-m-d H:i:s',$value->ctime);
            $value->mtime = date('Y-m-d H:i:s',$value->mtime);
        }
        return $obj_list;
    }

    /**
     * 详情
     * @param $input
     * @return mixed
     * @throws \App\Exceptions\ApiException
     */
    public function selectOne($input)
    {
        if(empty($input[$this->apiPrimaryKey])) TEA('700', $this->apiPrimaryKey);
        $obj = DB::table($this->table . ' as rps')
            ->leftJoin(config('alias.rrad') . ' as rrad', 'rrad.id', '=', 'rps.creator_id')
            ->select([
                'rps.id as ' . $this->apiPrimaryKey,
                'rps.name',
                'rps.description',
                'rps.ctime',
                'rps.mtime',
                'rps.is_usual',
                'rrad.cn_name as creator_name'
            ])
            ->where('rps.id',$input[$this->apiPrimaryKey])
            ->first();
        if (!empty($obj)) {
            $obj->ctime = date('Y-m-d H:i:s',$obj->ctime);
            $obj->mtime = date('Y-m-d H:i:s',$obj->mtime);
        }
        return $obj;
    }
//endregion
}