<?php
/**
 * File : ImageGroupType.php
 * Desc :
 * Time : 2018/3/31 14:21
 * Create by Lester You.
 */

namespace App\Http\Models;

use Illuminate\Support\Facades\DB;
use App\Libraries\Trace;

class ImageGroupType extends Base
{
    public $apiPrimaryKey = 'image_group_type_id';

    public function __construct()
    {
        parent::__construct();
        $this->table = config('alias.rdgt');
    }

    //region 检

    /**
     * 参数判断
     * @param array $input
     * @throws \App\Exceptions\ApiException
     * @throws \Illuminate\Container\EntryNotFoundException
     * @since lesteryou code编码改为以字母数字开头
     */
    public function checkFormField(&$input)
    {
        $add = $this->judgeApiOperationMode($input);
        if (empty($input['name'])) TEA('700', 'name');
        if (empty($input['code'])) TEA('700', 'code');
        if (!preg_match(config('app.pattern.image_group_type_code'), $input['code'])) {
            TEA('1104', 'code');
        }
        $check_name = $add ? [['name', '=', $input['name']]] : [['name', '=', $input['name']], [$this->primaryKey, '<>', $input[$this->apiPrimaryKey]]];
        if ($this->isExisted($check_name)) TEA('1105', 'name');
        $check_code = $add ? [['code', '=', $input['code']]] : [['code', '=', $input['code']], [$this->primaryKey, '<>', $input[$this->apiPrimaryKey]]];
        if ($this->isExisted($check_code)) TEA('1105', 'code');
        if ($add) {
            $input['creator_id'] = !empty(session('administrator')->admin_id) ? session('administrator')->admin_id : 0;
        }
    }

    //endregion


    //region 增
    /**
     * 增加数据
     * @param array $input
     * @return mixed
     * @throws \Exception
     * @throws \App\Exceptions\ApiException
     * @author lesteryou
     */
    public function add($input)
    {
        $data = [
            'name' => $input['name'],
            'code' => $input['code'],
            'description' => empty($input['description']) ? '' : $input['description'],
            'creator_id' => $input['creator_id'],
            'ctime' => time(),
            'mtime' => time()
        ];
        $inset_id = DB::table($this->table)->insertGetId($data);
        if (!$inset_id) TEA('802');

        /**
         * 添加操作日志
         */
        $events = [
            'action' => 'add', //必填字段,值为add|delete|update            Y
            'desc' => "添加一条code为：[{$input['code']}],名字为：[{$input['name']}]的记录",//对当前事件行为的描述         Y
            'extra' => $data,  //对该事件行为的额外附加信息,通过数组形式保存在这里       N
        ];
        Trace::save($this->table, $inset_id, $input['creator_id'], $events);
        return $inset_id;
    }
    //endregion

    //region 删

    /**
     * 根据id删除数据
     * @param array $input
     * @throws \Exception
     * @throws \App\Exceptions\ApiException
     * @author lesteryou
     */
    public function delete($input)
    {
        $oldData = DB::table($this->table)->select(['*'])->where($this->primaryKey, '=', $input[$this->apiPrimaryKey])->first();
        if (empty($input[$this->apiPrimaryKey])) TEA('700', $this->apiPrimaryKey);
        //在删除之前判断该数据有没有被其他表使用
        $res = DB::table(config('alias.rdg'))->where('type_id', $input[$this->apiPrimaryKey])->first();
        if (!empty($res)) TEA('1102');
        $res = DB::table($this->table)->where($this->primaryKey, '=', $input[$this->apiPrimaryKey])->delete();
        if (!$res) TEA('803');

        /**
         * 添加操作日志
         */
        $events = [
            'action' => 'delete', //必填字段,值为add|delete|update            Y
            'desc' => "删除一条code为：[{$oldData->code}],名字为：[{$oldData->name}]的记录",//对当前事件行为的描述         Y
            'extra' => $oldData,  //对该事件行为的额外附加信息,通过数组形式保存在这里       N
        ];
        Trace::save($this->table, $input[$this->apiPrimaryKey], (session('administrator')) ? session('administrator')->admin_id : 0, $events);

    }
    //endregion


    //region 改
    /**
     * @param $input
     * @throws \Exception
     * @throws \App\Exceptions\ApiException
     */
    public function update($input)
    {
        $oldData = DB::table($this->table)->select(['*'])->where($this->primaryKey, $input[$this->apiPrimaryKey])->first();
        $data = array(
            'name' => $input['name'],
            'code' => $input['code'],
            'description' => $input['description'],
            'mtime' => time()
        );
        $res = DB::table($this->table)->where($this->primaryKey, $input[$this->apiPrimaryKey])->update($data);
        if ($res === false) TEA('804');

        /**
         * 添加操作日志
         */
        $updateRecord = [];
        $oldData->code != $input['code'] && $updateRecord[] = "编码：由[{$oldData->code}]改为[{$input['code']}]";
        $oldData->name != $input['name'] && $updateRecord[] = "名称：由[{$oldData->name}]改为[{$input['name']}]";
        $oldData->description != $input['description'] && $updateRecord[] = "描述：由[{$oldData->description}]改为[{$input['description']}]";
        if (!empty($updateRecord)) {
            $events = [
                'action' => 'update', //必填字段,值为add|delete|update            Y
                'desc' =>'记录修改：'.implode(',',$updateRecord) ,//对当前事件行为的描述         Y
            'extra' => $oldData,  //对该事件行为的额外附加信息,通过数组形式保存在这里       N
        ];
            Trace::save($this->table, $input[$this->apiPrimaryKey], (session('administrator')) ? session('administrator')->admin_id : 0, $events);
        }

    }
    //endregion

    //region 查
    /**
     * 获取所有的图纸分类(不分页)
     * @param array $input
     * @return mixed
     */
    public function selectAll($input)
    {
        $filed = [
            'rdgt.id as ' . $this->apiPrimaryKey,
            'rdgt.name',
            'rdgt.ctime',
            'rdgt.mtime',
            'rdgt.code',
            'rdgt.description',
            'rrad.name as user_name'
        ];
        $where = [];
        if (!empty($input['name']))
            $where[] = ['rdgt.name', 'like', '%' . $input['name'] . '%'];
        if (!empty($input['code']))
            $where[] = ['rdgt.code', 'like', '%' . $input['code'] . '%'];
        $obj_list = DB::table($this->table . ' as rdgt')
            ->select($filed)
            ->leftJoin(config('alias.rrad') . ' as rrad', 'rrad.id', '=', 'rdgt.creator_id')
            ->where($where)
            ->get();
        foreach ($obj_list as $k => &$v) {
            $v->ctime = date('Y-m-d H:i:s', $v->ctime);
            $v->mtime = date('Y-m-d H:i:s', $v->mtime);
        }
        return $obj_list;
    }

    /**
     * 获取所有的图纸分类(分页)
     * @param array $input
     * @return mixed
     */
    public function selectPages(&$input)
    {
        $filed = [
            'rdgt.id as ' . $this->apiPrimaryKey,
            'rdgt.name',
            'rdgt.ctime',
            'rdgt.mtime',
            'rdgt.code',
            'rrad.name as user_name'
        ];
        $where = [];
        if (!empty($input['name']))
            $where[] = ['rdgt.name', 'like', '%' . $input['name'] . '%'];
        if (!empty($input['code']))
            $where[] = ['rdgt.code', 'like', '%' . $input['code'] . '%'];
        $builder = DB::table($this->table . ' as rdgt')
            ->select($filed)
            ->leftJoin(config('alias.rrad') . ' as rrad', 'rrad.id', '=', 'rdgt.creator_id')
            ->where($where);
        $input['total_records'] = $builder->count();
        $builder->offset(($input['page_no'] - 1) * $input['page_size'])->limit($input['page_size']);
        $obj_list = $builder->get();
        foreach ($obj_list as $k => &$v) {
            $v->ctime = date('Y-m-d H:i:s', $v->ctime);
            $v->mtime = date('Y-m-d H:i:s', $v->mtime);
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
            'rdgt.id as ' . $this->apiPrimaryKey,
            'rdgt.name',
            'rdgt.ctime',
            'rdgt.mtime',
            'rdgt.code',
            'rdgt.description',
            'rrad.name as user_name'
        ];
        $obj = DB::table($this->table . ' as rdgt')
            ->select($filed)
            ->leftJoin(config('alias.rrad') . ' as rrad', 'rrad.id', '=', 'rdgt.creator_id')
            ->where('rdgt.id', $id)
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