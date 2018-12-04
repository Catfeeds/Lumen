<?php
/**
 * Created by PhpStorm.
 * User: lester
 * Date: 2018/4/25 10:28
 * Desc:
 */

namespace App\Http\Models;

use App\Libraries\Tree;
use Illuminate\Support\Facades\DB;

class ProductType extends Base
{
    public $apiPrimaryKey = 'product_type_id';

    public function __construct()
    {
        parent::__construct();
        $this->table = config('alias.rpt');
    }

    //region 检

    /**
     * @param $input
     * @throws \App\Exceptions\ApiException
     * @throws \Illuminate\Container\EntryNotFoundException
     */
    public function checkFormField(&$input)
    {
        $add = $this->judgeApiOperationMode($input);

        if (empty($input['name'])) TEA('700', 'name');
        $check_name = $add ? [['name', '=', $input['name']]] : [['name', '=', $input['name']], ['id', '<>', $input[$this->apiPrimaryKey]]];
        $has_name = $this->isExisted($check_name);
        if ($has_name) TEA('700', 'name');
        if ($add) {
            //parent_id 可为0
            !isset($input['parent_id']) && TEA('700', 'parent_id');
            $has_parentID = $this->isExisted([['id', '=', $input['parent_id']]]);
            if (!$has_parentID && $input['parent_id'] != 0) TEA('700', 'parent_id');

            //如果为添加，则需要验证code唯一性
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
     * @param $input
     * @return mixed
     * @throws \App\Exceptions\ApiException
     */
    public function store($input)
    {
        $data = [
            'name' => $input['name'],
            'code' => $input['code'],
            'parent_id' => $input['parent_id'],
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

    //region
    /**
     * 删除
     *
     * @param $input
     * @throws \App\Exceptions\ApiException
     */
    public function delete($input)
    {
        if (empty($input[$this->apiPrimaryKey])) TEA('700', $this->apiPrimaryKey);
//        //删除之前检测有没有被使用
        $has_use = DB::table($this->table)->select(['id'])->where('parent_id', $input[$this->apiPrimaryKey])->first();
//        exit(json_encode($has_use));
        if (!empty($has_use)) {
            TEA('1190');
        }
        $res = DB::table($this->table)->where('id', $input[$this->apiPrimaryKey])->delete();
        if (!$res) TEA('803');
    }
    //endregion

    //region 改

    /**
     * 修改
     * 只允许修改名称，不允许修改父级
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
            'id as ' . $this->apiPrimaryKey,
            'name',
            'code',
            'parent_id'
        ];
        $where = [];
        $obj_list = DB::table($this->table)
            ->select($select)
            ->where($where)
            ->get();
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
            'rpt.id as ' . $this->apiPrimaryKey,
            'rpt.name',
            'rpt.code',
            'rpt.parent_id',
            'rpt.ctime',
            'rpt.mtime',
            'rpt.description',
            'rrad.name as creator_name'
        ];
        $where = [];
        !empty($input['name']) && $where[] = ['rpt.name', 'like', '%' . $input['name'] . '%'];
        !empty($input['code']) && $where[] = ['rpt.code', 'like', $input['code']];
        $handler = DB::table($this->table . ' as rpt')
            ->select($select)
            ->leftJoin(config('alias.rrad') . ' as rrad', 'rrad.id', '=', 'rpt.creator_id')
            ->where($where);
        $input['total_records'] = $handler->count();
        $obj_list = $handler->offset(($input['page_no'] - 1) * $input['page_size'])->limit($input['page_size'])->get();
        foreach ($obj_list as $k => &$v) {
            $v->ctime = date('Y-m-d H:i:s', $v->ctime);
            $v->mtime = date('Y-m-d H:i:s', $v->mtime);
        }
        return $obj_list;
    }

    /**
     * 获取树形结构的数据
     *
     * @param $input
     * @return array
     */
    public function selectTree(&$input)
    {
        $select = [
            'rpt.id as ' . $this->apiPrimaryKey,
            'rpt.name',
            'rpt.code',
            'rpt.parent_id',
            'rpt.ctime',
            'rpt.mtime',
            'rpt.description',
            'rrad.name as creator_name'
        ];
        $where = [];
        $obj_list = DB::table($this->table . ' as rpt')
            ->select($select)
            ->leftJoin(config('alias.rrad') . ' as rrad', 'rrad.id', '=', 'rpt.creator_id')
            ->where($where)
            ->get();

        foreach ($obj_list as $k => &$v) {
            $v->ctime = date('Y-m-d H:i:s', $v->ctime);
            $v->mtime = date('Y-m-d H:i:s', $v->mtime);
        }
        $emptyArr = array();
        return Tree::findLevel(obj2array($obj_list), 0, 0, $emptyArr, $this->apiPrimaryKey);
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
            'rpt.id as ' . $this->apiPrimaryKey,
            'rpt.name',
            'rpt.code',
            'rpt.parent_id',
            'rpt2.name as parent_name',
            'rpt.ctime',
            'rpt.mtime',
            'rpt.description',
            'rrad.name as creator_name'
        ];
        $obj = DB::table($this->table . ' as rpt')
            ->select($select)
            ->leftJoin(config('alias.rrad') . ' as rrad', 'rrad.id', '=', 'rpt.creator_id')
            ->leftJoin($this->table . ' as rpt2', 'rpt2.id', '=', 'rpt.parent_id')
            ->where([['rpt.id', '=', $id]])
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