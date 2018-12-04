<?php
/**
 * Created by PhpStorm.
 * User: haoziye
 * Date: 2018/1/16
 * Time: 下午2:34
 */

namespace App\Http\Models;

use Illuminate\Support\Facades\DB;
use App\Libraries\Trace;
class ImageCategory extends Base
{

    public $apiPrimaryKey = 'imageCategory_id';

    public function __construct()
    {
        $this->table = config('alias.rdc');
    }

//region 检

    /**
     * 检查参数
     * @param $input
     * @throws \App\Exceptions\ApiException
     * @throws \Illuminate\Container\EntryNotFoundException
     * @author hao.wei <weihao>
     */
    public function checkFormField(&$input)
    {
        $input['creator_id'] = (!empty(session('administrator')->admin_id)) ? session('administrator')->admin_id : 0;
        $add = $this->judgeApiOperationMode($input);
        if (empty($input['name'])) TEA('700', 'name');
        $check = ($add) ? [['name', '=', $input['name']]] : [['name', '=', $input['name']], [$this->primaryKey, '<>', $input[$this->apiPrimaryKey]]];
        $has = $this->isExisted($check);
        if ($has) TEA('700', 'name');
        //        if(!preg_match(config('app.pattern.image_category_name'),$input['name'])) TEA('700','name');
        if (empty($input['code'])) TEA('700', 'code');
        $check = $add ? [['code', '=', $input['code']]] : [['code', '=', $input['code']], [$this->primaryKey, '<>', $input[$this->apiPrimaryKey]]];
        $has = $this->isExisted($check);
        if ($has) TEA('700', 'code');
        if (!preg_match(config('app.pattern.image_code'), $input['code'])) TEA('700', 'code');
        if (empty($input['owner'])) TEA('700', 'owner');
        $check = ($add) ? [['owner', '=', $input['owner']]] : [['owner', '=', $input['owner']], [$this->primaryKey, '<>', $input[$this->apiPrimaryKey]]];
        $has = $this->isExisted($check);
        if ($has) TEA('700', 'owner');
        if (!preg_match(config('app.pattern.image_category_owner'), $input['owner'])) TEA('700', 'owner');
        if (!isset($input['description']) || mb_strlen($input['description']) > config('app.comment.image_category')) TEA('700', 'description');

    }

//endregion

//region 增

    /**
     * 添加图纸模块
     * @param $input
     * @return $insert_id 插入记录的主键id
     * @throws \Exception
     * @throws \App\Exceptions\ApiException
     * @author hao.wei <weihao>
     */
    public function add($input)
    {
        $data = [
            'code' => $input['code'],
            'name' => $input['name'],
            'owner' => $input['owner'],
            'description' => $input['description'],
            'ctime' => time(),
            'creator_id' => $input['creator_id'],
        ];
        $insert_id = DB::table($this->table)->insertGetId($data);
        if (empty($insert_id)) TEA('802');

        /**
         * 添加操作日志
         */
        $events = [
            'action' => 'add', //必填字段,值为add|delete|update            Y
            'desc' => "添加一条code为：[{$input['code']}],名字为：[{$input['name']}]的记录",//对当前事件行为的描述         Y
            'extra' => $data,  //对该事件行为的额外附加信息,通过数组形式保存在这里       N
        ];
        Trace::save($this->table, $insert_id, $input['creator_id'], $events);
        return $insert_id;
    }

//endregion

//region 查

    /**
     * 根据主键查找模块信息
     * @param $imageCategory_id
     * @return object
     * @throws \App\Exceptions\ApiException
     * @author hao.wei <weihao>
     */
    public function get($imageCategory_id)
    {
        $obj = DB::table($this->table . ' as rdc')
            ->select(['rdc.id as ' . $this->apiPrimaryKey, 'rdc.name', 'rdc.owner', 'rdc.description', 'rdc.code',
                'rdc.ctime', 'u.name as creator_name'])
            ->leftJoin(config('alias.u') . ' as u', 'rdc.creator_id', '=', 'u.id')
            ->where('rdc.id', '=', $imageCategory_id)
            ->first();
        if (!$obj) TEA('404');
        $obj->ctime = date('Y-m-d H:i:s', $obj->ctime);
        return $obj;
    }

    /**
     * 获取图纸模块列表
     * @param $input
     * @return mixed
     * @author hao.wei <weihao>
     */
    public function getImageCategoryListByPage(&$input)
    {
        $where = [];
        $fields = [
            'rdc.id as ' . $this->apiPrimaryKey,
            'rdc.name', 'rdc.owner',
            'rdc.ctime', 'u.name as creator_name',
            'rdc.code'
        ];
        if (!empty($input['name'])) $where[] = ['rdc.name', 'like', '%' . $input['name'] . '%'];
        if (!empty($input['owner'])) $where[] = ['rdc.owner', 'like', '%' . $input['owner'] . '%'];
        if (!empty($input['creator_name'])) $where[] = ['u.name', 'like', '%' . $input['creator_name'] . '%'];
        $builder = DB::table($this->table . ' as rdc')
            ->select($fields)
            ->leftJoin(config('alias.u') . ' as u', 'rdc.creator_id', '=', 'u.id');
        if (!empty($where)) $builder->where($where);
        $input['total_records'] = $builder->count();
        $builder->offset(($input['page_no'] - 1) * $input['page_size'])
            ->limit($input['page_size']);
        if (!empty($input['sort']) && !empty($input['order'])) $builder->orderBy('rdc.' . $input['sort'], $input['order']);
        $obj_list = $builder->get();
        foreach ($obj_list as $k => $v) {
            $obj_list[$k]->ctime = date('Y-m-d H:i:s', $v->ctime);
        }
        return $obj_list;
    }

    /**
     * 获取select列表
     * @return mixed
     * @author hao.wei <weihao>
     */
    public function getImageCategoryList()
    {
        $obj_list = DB::table($this->table)->select('id as ' . $this->apiPrimaryKey, 'name', 'owner')
            ->get();
        return $obj_list;
    }

//endregion

//region 改

    /**
     * @param $input
     * @throws \Exception
     * @throws \App\Exceptions\ApiException
     * @author hao.wei <weihao>
     */
    public function update($input)
    {
        $oldData = DB::table($this->table)->select(['*'])->where($this->primaryKey, $input[$this->apiPrimaryKey])->first();
        $data = [
            'code' => $input['code'],
            'name' => $input['name'],
            'owner' => $input['owner'],
            'description' => $input['description'],
            'mtime' => time(),
        ];
        $res = DB::table($this->table)->where($this->primaryKey, $input[$this->apiPrimaryKey])->update($data);
        if ($res === false) TEA('804');

        /**
         * 添加操作日志
         */
        $updateRecord = [];
        $oldData->code != $input['code'] && $updateRecord[] = "编码：由[{$oldData->code}]改为[{$input['code']}]";
        $oldData->name != $input['name'] && $updateRecord[] = "名称：由[{$oldData->name}]改为[{$input['name']}]";
        $oldData->owner != $input['owner'] && $updateRecord[] = "所有者：由[{$oldData->owner}]改为[{$input['owner']}]";
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

//region 删

    /**
     * 删除图纸分类/模块信息
     * @param int $imageCategory_id
     * @throws \Exception
     * @author hao.wei <weihao>
     */
    public function delete($imageCategory_id)
    {
        $oldData = DB::table($this->table)->select(['*'])->where($this->primaryKey, $imageCategory_id)->first();
        $num = DB::table($this->table)->where($this->primaryKey, '=', $imageCategory_id)->delete();
        if (!$num) TEA('803');

        /**
         * 添加操作日志
         */
        $events = [
            'action' => 'delete', //必填字段,值为add|delete|update            Y
            'desc' => "删除一条code为：[{$oldData->code}],名字为：[{$oldData->name}]的记录",//对当前事件行为的描述         Y
            'extra' => $oldData,  //对该事件行为的额外附加信息,通过数组形式保存在这里       N
        ];
        Trace::save($this->table, $imageCategory_id, (session('administrator')) ? session('administrator')->admin_id : 0, $events);
    }

//endregion
}