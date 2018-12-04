<?php
/**
 * Created by PhpStorm.
 * User: lester
 * Date: 2018/4/11 10:21
 * Desc:
 */

namespace App\Http\Models;

use Illuminate\Support\Facades\DB;

class PracticeField extends Base
{
    public $apiPrimaryKey = 'practice_field_id';

    public function __construct()
    {
        parent::__construct();
        $this->table = config('alias.rpf');
    }

    //region 检

    /**
     * 前端提交的字段检测
     *
     * @param array $input
     * @throws \App\Exceptions\ApiException
     * @throws \Illuminate\Container\EntryNotFoundException
     */
    public function checkFormField(&$input)
    {
        $add = $this->judgeApiOperationMode($input);
        if (empty($input['name'])) TEA('700', 'name');
        $check_code = $add ? [['name', '=', $input['name']]] : [['name', '=', $input['name']], ['id', '<>', $input[$this->apiPrimaryKey]]];
        $has_code = $this->isExisted($check_code);
        if ($has_code) TEA('700', 'name');
        if ($add) {
            if (empty($input['code'])) TEA('700', 'code');
            $check_code = $add ? [['code', '=', $input['code']]] : [['code', '=', $input['code']], ['id', '<>', $input[$this->apiPrimaryKey]]];
            $has_code = $this->isExisted($check_code);
            if ($has_code) TEA('700', 'code');

            $input['creator_id'] = !empty(session('administrator')->admin_id) ? session('administrator')->admin_id : 0;
        }
    }
    //endregion

    //region 增

    /**
     * 增加做法字段
     *
     * @param $input
     * @return mixed
     * @throws \App\Exceptions\ApiException
     */
    public function store($input)
    {
        $data = [
            'code' => $input['code'],
            'name' => $input['name'],
            'ctime' => time(),
            'mtime' => time(),
            'creator_id' => $input['creator_id']
        ];
        !empty($input['description']) && $data['description'] = $input['description'];
        $insert_id = DB::table($this->table)->insertGetId($data);
        if (!$insert_id) TEA('802');
        return $insert_id;
    }
    //endregion

    //region 删

    /**
     * 删除
     *
     * @param $input
     * @throws \App\Exceptions\ApiException
     */
    public function delete($input)
    {
        if (empty($input[$this->apiPrimaryKey])) TEA('700', $this->apiPrimaryKey);
        //删除之前检测有没有被使用
        $where = [['practice_field_id', '=', $input[$this->apiPrimaryKey]]];
        $has = $this->isExisted($where, config('alias.riopf'));
        if ($has) TEA('1102');
        $where = [['field_id', '=', $input[$this->apiPrimaryKey]]];
        $has = $this->isExisted($where, config('alias.rppf'));
        if ($has) TEA('1102');
        $res = DB::table($this->table)->where('id', '=', $input[$this->apiPrimaryKey])->delete();
        if (!$res) TEA('803');
    }
    //endregion

    //region 改

    /**
     * 修改
     * 注：只允许修改name，不允许修改code
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
     * 获取所有的数据（不分页）
     *
     * @param $input
     * @return mixed
     */
    public function selectAll($input)
    {
        $select = [
            'rpf.id as ' . $this->apiPrimaryKey,
            'rpf.name',
            'rpf.code',
            'rpf.ctime',
            'rpf.mtime',
            'rpf.description',
            'rrad.name as creator_name'
        ];
        $where = [];
        !empty($input['code']) && $where[] = ['rpf.code', 'like', '%' . $input['code'] . '%'];
        !empty($input['name']) && $where[] = ['rpf.name', 'like', '%' . $input['name'] . '%'];
        $obj_list = DB::table($this->table . ' as rpf')
            ->select($select)
            ->leftJoin(config('alias.rrad') . ' as rrad', 'rrad.id', '=', 'rpf.creator_id')
            ->where($where)
            ->get();
        foreach ($obj_list as $k => &$v) {
            $v->ctime = date('Y-m-d H:i:s', $v->ctime);
            $v->mtime = date('Y-m-d H:i:s', $v->mtime);
        }
        return $obj_list;
    }

    /**
     * 获取所有的数据（分页）
     *
     * @param $input
     * @return mixed
     */
    public function selectPage(&$input)
    {
        $select = [
            'rpf.id as ' . $this->apiPrimaryKey,
            'rpf.name',
            'rpf.code',
            'rpf.ctime',
            'rpf.mtime',
            'rpf.description',
            'rrad.name as creator_name'
        ];
        $where = [];
        !empty($input['code']) && $where[] = ['rpf.code', 'like', '%' . $input['code'] . '%'];
        !empty($input['name']) && $where[] = ['rpf.name', 'like', '%' . $input['name'] . '%'];
        $handler = DB::table($this->table . ' as rpf')
            ->select($select)
            ->leftJoin(config('alias.rrad') . ' as rrad', 'rrad.id', '=', 'rpf.creator_id')
            ->where($where);
        $input['total_records'] = $handler->count();
        $obj_list = $handler->offset(($input['page_no'] - 1) * $input['page_size'])->limit($input['page_size'])->orderBy('rpf.ctime','desc')->get();
        foreach ($obj_list as $k => &$v) {
            $v->ctime = date('Y-m-d H:i:s', $v->ctime);
            $v->mtime = date('Y-m-d H:i:s', $v->mtime);
        }
        return $obj_list;
    }

    /**
     * 根据id获取一条数据
     *
     * @param $id
     * @return mixed
     * @throws \App\Exceptions\ApiException
     */
    public function selectOne($id)
    {
        $select = [
            'rpf.id as ' . $this->apiPrimaryKey,
            'rpf.name',
            'rpf.code',
            'rpf.ctime',
            'rpf.mtime',
            'rpf.description',
            'rrad.name as creator_name'
        ];
        $obj = DB::table($this->table . ' as rpf')
            ->select($select)
            ->leftJoin(config('alias.rrad') . ' as rrad', 'rrad.id', '=', 'rpf.creator_id')
            ->where([['rpf.id', '=', $id]])
            ->first();
        if (empty($obj)) {
            TEA('404');
        }
        $obj->ctime = date('Y-m-d H:i:s', $obj->ctime);
        $obj->mtime = date('Y-m-d H:i:s', $obj->mtime);
        return $obj;
    }
    //endregion
}