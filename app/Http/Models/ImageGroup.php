<?php
/**
 * Created by PhpStorm.
 * User: haoziye
 * Date: 2018/1/17
 * Time: 下午5:36
 */

namespace App\Http\Models;

use Illuminate\Support\Facades\DB;

class ImageGroup extends Base
{

    public $apiPrimaryKey = 'imageGroup_id';

    public function __construct()
    {
        $this->table = config('alias.rdg');
    }

//region 检

    /**
     * 检查添加和修改传入的参数
     * @param $input
     * @throws \App\Exceptions\ApiException
     * @throws \Illuminate\Container\EntryNotFoundException
     * @author hao.wei <weihao>
     * @since lesteryou code编码改为以字母数字开头
     */
    public function checkFormField(&$input)
    {
        $admin = session('administrator');
        $input['creator_id'] = ($admin) ? $admin->admin_id : 0;
        $add = $this->judgeApiOperationMode($input);
        if (empty($input['name'])) TEA('700', 'name');
        if (empty($input['type_id'])) TEA('700', 'type_id');
        $check = ($add) ? [['name', '=', $input['name']], ['type_id', '=', $input['type_id']]] : [['id', '<>', $input[$this->apiPrimaryKey]], ['name', '=', $input['name']], ['type_id', '=', $input['type_id']]];
        $has = $this->isExisted($check);
        if ($has) TEA('700', 'name');
//        if(!preg_match(config('app.pattern.image_group_name'),$input['name'])) TEA('700','name');
        if (empty($input['code'])) TEA('700', 'code');
        $check = $add ? [['code', '=', $input['code']]] : [['code', '=', $input['code']], [$this->primaryKey, '<>', $input[$this->apiPrimaryKey]]];
        $has = $this->isExisted($check);
        if ($has) TEA('700', 'code');
        if (!preg_match(config('app.pattern.image_group_type_code'), $input['code'])) TEA('700', 'code');
        if (!isset($input['description']) || mb_strlen($input['description']) > config('app.comment.image_group')) TEA('700', 'description');
    }


//endregion

//region 增

    /**
     * @param $input
     * @return mixed
     * @throws \App\Exceptions\ApiException
     */
    public function add($input)
    {
        $data = [
            'code' => $input['code'],
            'name' => $input['name'],
            'description' => $input['description'],
            'type_id' => $input['type_id'],
            'ctime' => time(),
            'creator_id' => $input['creator_id'],
        ];
        $insert_id = DB::table($this->table)->insertGetId($data);
        if (empty($insert_id)) TEA('802');
        return $insert_id;
    }

//endregion

//region 查

    /**
     * 图纸分组详情
     * @param $imageGroup_id
     * @return mixed
     * @throws \App\Exceptions\ApiException
     * @author hao.wei <weihao>
     */
    public function get($imageGroup_id)
    {
        $obj = DB::table($this->table . ' as rdg')
            ->select('rdg.id as ' . $this->apiPrimaryKey, 'rdg.name', 'rdg.description', 'rdg.ctime', 'rdg.type_id', 'u.name as creator_name', 'rdg.code', 'rdgt.name as type_name')
            ->leftJoin(config('alias.rdgt') . ' as rdgt', 'rdgt.id', '=', 'rdg.type_id')
            ->leftJoin(config('alias.u') . ' as u', 'rdg.creator_id', '=', 'u.id')
            ->where('rdg.' . $this->primaryKey, '=', $imageGroup_id)
            ->first();
        if (!$obj) TEA('404');
        $obj->ctime = date('Y-m-d H:i:s', $obj->ctime);
        return $obj;
    }

    /**
     * 图纸分组分页
     * @param $input
     * @return mixed
     * @author hao.wei <weihao>
     */
    public function getImageGroupListByPage(&$input)
    {
        $fields = [
            'rdg.id as ' . $this->apiPrimaryKey,
            'rdg.name',
            'rdg.code',
            'rdg.ctime',
            'rdgt.name as type_name',
            'u.name as creator_name',
        ];
        $where = [];
        if (!empty($input['name'])) $where[] = ['rdg.name', 'like', '%' . $input['name'] . '%'];
        if (!empty($input['code'])) $where[] = ['rdg.code', 'like', '%' . $input['code'] . '%'];
        if (!empty($input['type_id'])) $where[] = ['rdg.type_id', '=', $input['type_id']];
        if (!empty($input['creator_name'])) $where[] = ['u.name', 'like', '%' . $input['creator_name'] . '%'];
        $builder = DB::table($this->table . ' as rdg')
            ->select($fields)
            ->leftJoin(config('alias.u') . ' as u', 'rdg.creator_id', '=', 'u.id')
            ->leftJoin(config('alias.rdgt') . ' as rdgt', 'rdgt.id', '=', 'rdg.type_id')
            ->where($where);
        $input['total_records'] = $builder->count();
        $builder->offset(($input['page_no'] - 1) * $input['page_size'])
            ->limit($input['page_size']);
        if (!empty($input['sort']) && !empty($input['order'])) $builder->orderBy($input['sort'], $input['order']);
        $obj_list = $builder->get();
        foreach ($obj_list as $k => &$v) {
            $v->ctime = date('Y-m-d H:i:s', $v->ctime);
        }
        return $obj_list;
    }


    /**
     * 根据分类获取图纸分组select
     * @author hao.wei <weihao>
     */
    public function getImageGroupList($input)
    {
        $where = [];
        if (!empty($input['type_id'])) {
            $where[] = ['type_id', '=', $input['type_id']];
        }
        return DB::table($this->table)
            ->select('id as ' . $this->apiPrimaryKey, 'name','code')
            ->where($where)
            ->get();
    }
//endregion

//region 修

    /**
     * 修改图纸分组属性
     * 类别不允许修改
     * @param $input
     * @throws \App\Exceptions\ApiException
     * @author hao.wei <weihao>
     */
    public function update($input)
    {
        $data = [
            'code' => $input['code'],
            'name' => $input['name'],
            'description' => $input['description'],
            'mtime' => time(),
        ];
        $res = DB::table($this->table)->where($this->primaryKey, '=', $input[$this->apiPrimaryKey])->update($data);
        if ($res === false) TEA('804');
    }

//endregion

//region 删

    /**
     * 删除图纸分组
     * @param $imageGroup_id
     * @throws \App\Exceptions\ApiException
     * @author hao.wei <weihao>
     */
    public function delete($imageGroup_id)
    {
        $res = DB::table($this->table)->where($this->primaryKey, '=', $imageGroup_id)->delete();
        if (!$res) TEA('803');
    }

//endregion
}