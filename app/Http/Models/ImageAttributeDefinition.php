<?php

namespace App\Http\Models;

use Illuminate\Support\Facades\DB;
use App\Libraries\Trace;
/**
 * 图纸属性定义类
 * Class DrawingAttributeDefinition
 * @package App\Http\Models
 */
class ImageAttributeDefinition extends Base
{
    public $apiPrimaryKey = 'attribute_definition_id';

    public function __construct()
    {
        parent::__construct();
        $this->table = config('alias.rdad');
    }

//region 检

    /**
     * @param $input
     * @throws \App\Exceptions\ApiException
     * @throws \Illuminate\Container\EntryNotFoundException
     * @author lesteryou
     */
    public function checkFormField(&$input)
    {
        $add = $this->judgeApiOperationMode($input);
        if (empty($input['name'])) TEA('700', 'name');
        $check = $add ? [['name', '=', $input['name']]] : [['id', '<>', $input[$this->apiPrimaryKey]], ['name', '=', $input['name']]];
        $has = $this->isExisted($check);
        if ($has) TEA('700', 'name');
        //验证分组分类参数 20180516
        if(empty($input['group_type_str'])) TEA('700', 'group_type_str');
        $input['group_type_arr'] = explode(',', $input['group_type_str']);
        !$this->checkGroupTypeExist($input['group_type_arr']) && TEA('1111');

        if ($add) {
            if (empty($input['category_id'])) TEA('700', 'category_id');
            $where = [['id', '=', $input['category_id']]];
            $has = $this->isExisted($where, config('alias.rdc'));
            if (!$has) TEA('700', 'category_id');
            $input['creator_id'] = !empty(session('administrator')->admin_id) ? session('administrator')->admin_id : 0;
        }
    }

    /**
     * @param $groupIDArr
     * @return bool
     */
    public function checkGroupTypeExist($groupIDArr)
    {
        if (empty($groupIDArr)) return false;
        $count = DB::Table(config('alias.rdgt'))
            ->whereIn('id', $groupIDArr)
            ->count();
        if ($count < count($groupIDArr)) {
            return false;
        } else {
            return true;
        }
    }
//endregion

//region 增
    /**
     * 添加图纸属性的定义
     * @param array $input
     * @return mixed
     * @throws \Exception
     * @throws \App\Exceptions\ApiException
     */
    public function store($input)
    {
        $data = array(
            'name' => $input['name'],
            'mtime' => time(),
            'ctime' => time(),
            'category_id' => $input['category_id'],
            'creator_id' => $input['creator_id']
        );
        $inset_id = DB::table($this->table)->insertGetId($data);
        if (!$inset_id) TEA('802');
        $insertKeyVal = [];
        foreach ($input['group_type_arr'] as $key => $value) {
            $insertKeyVal[] = [
                'attribute_definition_id' => $inset_id,
                'group_type_id'=>$value
            ];
        }
        $res = DB::table(config('alias.rdadgt'))->insert($insertKeyVal);
        $events = [
            'action' => 'add', //必填字段,值为add|delete|update            Y
            'desc' => '添加图纸属性的定义',//对当前事件行为的描述         Y
        ];
        Trace::save(config('alias.rdr'),$inset_id,(!empty(session('administrator')->admin_id)) ? session('administrator')->admin_id:0,$events);
        return $inset_id;
    }

//endregion

//region 删
    /**
     * @param $input
     * @throws \Exception
     * @throws \App\Exceptions\ApiException
     */
    public function delete($input)
    {
        if (empty($input[$this->apiPrimaryKey])) TEA('700', $this->apiPrimaryKey);
        //在删除之前判断该数据有没有被其他表使用
        $res = DB::table(config('alias.rda'))->where('attribute_definition_id', $input[$this->apiPrimaryKey])->first();
        if (!empty($res)) TEA('1102');
        $res = DB::table($this->table)->where('id', '=', $input[$this->apiPrimaryKey])->delete();
        if (!$res) TEA('803');
        //删除 和分组分类的关联 20180516
        $res = DB::table(config('alias.rdadgt'))->where('attribute_definition_id', '=', $input[$this->apiPrimaryKey])->delete();
        $events = [
            'action' => 'delete', //必填字段,值为add|delete|update            Y
            'desc' => '删除图纸属性的定义',//对当前事件行为的描述         Y
        ];
        Trace::save(config('alias.rdr'),$input[$this->apiPrimaryKey],(!empty(session('administrator')->admin_id)) ? session('administrator')->admin_id:0,$events);
    }
//endregion

//region 改
    /**
     * @param $input
     * @throws \App\Exceptions\ApiException
     */
    public function update($input)
    {
        $data = array(
            'name' => $input['name'],
            'mtime' => time()
        );
        $db_id_ogj = DB::Table(config('alias.rdadgt'))
            ->select(['id','group_type_id'])
            ->where('attribute_definition_id',$input[$this->apiPrimaryKey])
            ->get();
        $db_id_arr = obj2array($db_id_ogj);
        $db_id_list = [];
        foreach ($db_id_arr as $value) {
            $db_id_list[$value['group_type_id']] = $value;
        }
        $set = get_array_diff_intersect($input['group_type_arr'], array_keys($db_id_list));
        //删
        if (!empty($set['del_set'])) {

            $res = DB::table(config('alias.rdadgt'))
                ->whereIn('group_type_id', $set['del_set'])
                ->where('attribute_definition_id', $input[$this->apiPrimaryKey])
                ->delete();
        }
        //增
        if (!empty($set['add_set'])) {
            $insertKeyVal = [];
            foreach ($set['add_set'] as $key => $value) {
                $insertKeyVal[] = [
                    'attribute_definition_id' => $input[$this->apiPrimaryKey],
                    'group_type_id' => $value
                ];
            }
            $res = DB::table(config('alias.rdadgt'))->insert($insertKeyVal);
        }

        $res = DB::table($this->table)->where($this->primaryKey, $input[$this->apiPrimaryKey])->update($data);
        if ($res === false) TEA('804');
    }
//endregion

//region 查

    /**
     * 根据分类查询所有的属性（不分页）
     * @param array $input
     * @return mixed
     */
    public function selectAllByCategory($input)
    {
        $filed = [
            'rdad.id as ' . $this->apiPrimaryKey,
            'rdad.name as definition_name',
            'rdad.ctime',
            'rdad.mtime',
            'rrad.name as user_name',
            'rdc.name as category_name'
        ];
        $where = [];
        if (!empty($input['category_id']))
            $where[] = ['rdad.category_id', '=', $input['category_id']];
        if(!empty($input['group_type_id']))
            $where[] = ['rdadgt.group_type_id', '=', $input['group_type_id']];

        $obj_list = DB::table($this->table . ' as rdad')
            ->select($filed)
            ->leftJoin(config('alias.rrad') . ' as rrad', 'rrad.id', '=', 'rdad.creator_id')
            ->leftJoin(config('alias.rdc') . ' as rdc', 'rdc.id', '=', 'rdad.category_id')
            ->leftJoin(config('alias.rdadgt').' as rdadgt','rdadgt.attribute_definition_id','=','rdad.id')
            ->where($where)
            ->get();
        foreach ($obj_list as $k => &$v) {
            $v->ctime = date('Y-m-d H:i:s', $v->ctime);
            $v->mtime = date('Y-m-d H:i:s', $v->mtime);
        }
        return $obj_list;
    }

    /**
     * 根据分类查询所有的属性（分页）
     * @param array $input
     * @return mixed
     */
    public function selectPagesByCategory(&$input)
    {
        $filed = [
            'rdad.id as ' . $this->apiPrimaryKey,
            'rdad.name as definition_name',
            'rdad.ctime',
            'rdad.mtime',
            'rrad.name as user_name',
            'rdc.name as category_name'
        ];
        $where = [];
        if (!empty($input['category_id'])){
            $where[] = ['rdad.category_id', '=', $input['category_id']];
        }
        if(!empty($input['name'])){
            $where[] = ['rdad.name', 'like', '%'.$input['name'].'%'];
        }

        $builder = DB::table($this->table . ' as rdad')
            ->select($filed)
            ->leftJoin(config('alias.rrad') . ' as rrad', 'rrad.id', '=', 'rdad.creator_id')
            ->leftJoin(config('alias.rdc') . ' as rdc', 'rdc.id', '=', 'rdad.category_id')
            ->where($where);
        $input['total_records'] = $builder->count();
        $builder->offset(($input['page_no'] - 1) * $input['page_size'])->limit($input['page_size']);
        $obj_list = $builder->get();
        foreach ($obj_list as $k => &$v) {
            $v->ctime = date('Y-m-d H:i:s', $v->ctime);
            $v->mtime = date('Y-m-d H:i:s', $v->mtime);
            $v->groupTypeArr = $this->getGroupType($v->{$this->apiPrimaryKey});
        }
        return $obj_list;
    }

    /**
     * 根据id获取一条记录
     * @param int $id
     * @return mixed
     * @throws \App\Exceptions\ApiException
     */
    public function selectOne($id)
    {
        $filed = [
            'rdad.id as ' . $this->apiPrimaryKey,
            'rdad.name as definition_name',
            'rdad.ctime',
            'rdad.mtime',
            'rrad.name as user_name',
            'rdc.name as category_name'
        ];

        $obj = DB::table($this->table . ' as rdad')
            ->select($filed)
            ->leftJoin(config('alias.rrad') . ' as rrad', 'rrad.id', '=', 'rdad.creator_id')
            ->leftJoin(config('alias.rdc') . ' as rdc', 'rdc.id', '=', 'rdad.category_id')
            ->where('rdad.id',$id)
            ->first();
        if (empty($obj)) {
            TEA('404');
        }
        $obj->ctime = date('Y-m-d H:i:s', $obj->ctime);
        $obj->mtime = date('Y-m-d H:i:s', $obj->mtime);
        $obj->group_type = $this->getGroupType($id);
        return $obj;
    }

    /**
     * 根据属性id获取与此关联的分组分类的名称
     * @param $attribute_definition_id
     * @return mixed
     */
    public function getGroupType($attribute_definition_id)
    {
        $select = [
            'rdadgt.id',
            'rdgt.id as group_type_id',
            'rdgt.name as group_type_name'
        ];
        $obj_list = DB::table(config('alias.rdadgt').' as rdadgt')
            ->select($select)
            ->leftJoin(config('alias.rdgt').' as rdgt','rdgt.id','=','rdadgt.group_type_id')
            ->where('rdadgt.attribute_definition_id',$attribute_definition_id)
            ->get();
        return $obj_list;
    }
//endregion
}