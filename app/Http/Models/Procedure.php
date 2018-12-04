<?php
/**
 * Created by PhpStorm.
 * User: xujian
 * Date: 17/9/25
 * Time: 下午17:49
 */

namespace App\Http\Models;//定义命名空间
use App\Http\Models\Encoding\EncodingSetting;
use App\Http\Models\Sap\StandardValue;
use Illuminate\Support\Facades\DB;
use function PHPSTORM_META\type;//引入DB操作类

/**
 * 工艺参数模型
 * Class Operation
 * @package App\Http\Models
 */
class Procedure extends Base
{
    protected $time;
    protected $datetime;
    protected $table;//工艺路线表
    protected $operation;//工艺表;
    protected $mapTable;//工艺路线路由表
    protected $opTable;//工艺路线工序表
    protected $oaTable;//工序能力对应表
    protected $defaultOperation;//默认工序"开始"{id: ,name:}
    protected $rbrb;//bom绑定工艺路线表;

    /**
     * Procedure constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $this->table = config('alias.rpr');
        $this->mapTable = config('alias.rprm');
        $this->operation = config('alias.rio');
        $this->opTable = config('alias.rpro');
        $this->oaTable = config('alias.rioa');
        $this->rbrb = config('alias.rbrb');
        $this->time = time();
        $this->datetime = date('Y-m-d H:i:s', $this->time);

        //默认工艺:开始
        $this->defaultOperation = DB::table($this->operation)->select('id', 'name')->where('name', '=', '开始')->first();
//        if (count($this->defaultOperation) == 0) TEA('700', 'defaultOperation');\
        //
        if (count($this->defaultOperation) == 0) {
            $data = [];
            $data['code'] = 'P000001D';
            $data['name'] = '开始';
            $data['desc'] = '默认工序请不要删除';
            $data['ctime'] = time();
            $data['mtime'] = time();
            DB::table($this->operation)->insert($data);
            $this->defaultOperation = DB::table($this->operation)->select('id', 'name')->where('name', '=', '开始')->first();
        }
    }

//region 检

    /**
     * 检查所需字段是否完整合理
     *
     * @param $input
     * @throws \App\Exceptions\ApiException
     */
    public function checkFields($input)
    {
        if (!isset($input['id']) || empty($input['id'])) TEA('700', 'id');
    }

    /**
     * 工艺路线添加工艺 字段检查
     *
     * @param $input
     * @throws \App\Exceptions\ApiException
     */
    public function checkDetailFields($input)
    {
        if (!isset($input['route_id'])) TEA('700', 'route_id');
        if (!isset($input['operation_id'])) TEA('700', 'operation_id');
        //工艺路线是否存在;
        $where = [['id', '=', $input['route_id']]];
        $has = $this->isExisted($where, $this->table);
        if (!$has) TEA('143');//工艺路线id异常
        //工艺是否存在;
        $where = [['id', '=', $input['operation_id']]];
        $has = $this->isExisted($where, $this->operation);
        if (!$has) TEA('111');//工序不存在
    }

    /**
     * 检查做法是否已被bom绑定使用
     * @param array $input
     * @return mixed
     * @throws \App\Exceptions\ApiException
     */
    public function hasUsed($input)
    {
        if (!isset($input['route_id'])) TEA('700', 'route_id');//缺失工艺路线id
        $where = [['routing_id', '=', $input['route_id']]];
        // 验证 是否被 [ruis_bom_routing](BOM的工艺路线表) 使用
        $has = $this->isExisted([['routing_id', '=', $input['route_id']]], config('alias.rbr'));
        if ($has) return ['exist' => $has, 'field' => 'route_id', 'value' => $input['route_id']];
        // 验证 是否被 [ruis_bom_routing_base](bom的工艺路线节点基本信息) 使用
        $has = $this->isExisted($where, $this->rbrb);
        $results = ['exist' => $has, 'field' => 'route_id', 'value' => $input['route_id']];

        return $results;
    }
//endregion

//region 增

    /**
     * 增加工艺路线基础信息(base)
     *
     * @param $input
     * @return mixed
     * @throws \App\Exceptions\ApiException
     */
    public function store($input)
    {
        if (!isset($input['name']) || empty($input['name'])) TEA('700', 'name');
        if (!isset($input['code']) || empty($input['code'])) TEA('700', 'code');

        //code是否重复;重复警告;
        $where = [['code', '=', $input['code']]];
        $tmp = $this->isExisted($where, $this->table);
        if ($tmp) TEA('140');//工艺路线Code已存在

        //工艺基本信息添加
        $data = [];
        $data['name'] = $input['name'];
        $data['code'] = $input['code'];
        $data['description'] = isset($input['description']) ? $input['description'] : '';
        $result = DB::table($this->table)->insertGetId($data);

        //添加默认工艺(开始);
        $defaultOperation = [];
        $defaultOperation['oid'] = $this->defaultOperation->id;
        $defaultOperation['rid'] = $result;
        $defaultOperation['order'] = 1;//从1开始, null为0;
        $defaultOperation['type'] = 0;
        $defaultOperation['ctime'] = $this->datetime;
        DB::table($this->opTable)->insert($defaultOperation);

        return $result;
    }

    /**
     * 增加工艺路线详细信息(detail)
     *
     * @param $input
     * @return mixed
     * @throws \App\Exceptions\ApiException
     */
    public function storeDetail($input)
    {
        if (!isset($input['type'])) TEA('700', 'type');

        $data = [];
        $data['rid'] = $input['route_id'];
        $data['oid'] = $input['operation_id'];
        $data['type'] = $input['type'];
        $data['ctime'] = $this->datetime;
        //查询当前order, 进行++, 作为data['order'];
        $prev = DB::table($this->opTable)
            ->select('id', 'order')
            ->where('rid', '=', $data['rid'])
            ->orderBy('order', 'desc')
            ->first();
        $data['order'] = $prev->order + 1;
        //插入opTable;
        $insertId = DB::table($this->opTable)->insertGetId($data);
        //插入成功,修改mapTable表,默认上一个order关联这一个;
        $mapData = [];
        $mapData['route_id'] = $data['rid'];
        $mapData['cid'] = $prev->id;
        $mapData['nid'] = $insertId;
        $mapData['ctime'] = $this->datetime;
        $result = DB::table($this->mapTable)->insertGetId($mapData);

        return $result;
    }
//endregion

//region 删
    /**
     * 删除工艺路线(删除基本信息和所有的关联关系)
     *
     * @param $input
     * @return mixed
     * @throws \App\Exceptions\ApiException
     */
    public function delete($input)
    {
        $id = $input['id'];
        $tmpT = DB::table($this->table)->where('id', '=', $id)->first();
        $tmpM = DB::table($this->mapTable)->where('route_id', '=', $id)->first();
        if (!is_object($tmpT)) TEA('143');//工艺路线id异常
        $affectedId = DB::table($this->table)->where('id', '=', $id)->delete();

        DB::table($this->opTable)->where('rid', '=', $id)->delete();//一定有节点, 因为有一个开始节点
        //有工艺对应关系
        if (is_object($tmpM)) {
            DB::table($this->mapTable)->where('route_id', '=', $id)->delete();
        }
        return $affectedId;
    }

    /**
     * 删除工艺路线详细信息(删除一个节点)
     *
     * @param $input
     * @return mixed
     * @throws \App\Exceptions\ApiException
     */
    public function deleteDetail($input)
    {
        $data = [];
        $data['rid'] = $input['route_id'];
        $data['oid'] = $input['oid'];
        //获取所要删除的opId;
        $opId = DB::table($this->opTable)
            ->select('id', 'order')
            ->where([['rid', '=', $data['rid']], ['id', '=', $data['oid']]])
            ->first();
        if (!is_object($opId) || $opId->id <= 0) TEA('142');//工艺id错误
        if ($opId->order == 0) TEA('149');//该节点不能删除(开始节点);


        //重排列order
        $deletedOrder = $opId->order;
        DB::table($this->opTable)
            ->where([['rid', '=', $data['rid']], ['order', '>', $deletedOrder]])
            ->decrement('order', 1);

        //删除opTable表中的记录;(节点删除)
        $flagOp = DB::table($this->opTable)
            ->where([['rid', '=', $data['rid']], ['id', '=', $data['oid']]])
            ->delete();

        //删除mapTable表中的相关记录(节点关系删除)
        $flagMap = DB::table($this->mapTable)
            ->where([['route_id', '=', $data['rid']], ['cid', '=', $opId->id]])
            ->orWhere([['route_id', '=', $data['rid']], ['nid', '=', $opId->id]])
            ->delete();

        return $flagMap;
    }
//endregion

//region 改
    /**
     * 修改工艺路线基础信息(名字,描述)
     *
     * @param $input
     * @return mixed
     * @throws \App\Exceptions\ApiException
     */
    public function edit($input)
    {
        if (!isset($input['id'])) TEA('700', 'id');
        if (!isset($input['name'])) TEA('700', 'name');
        if (!isset($input['description'])) TEA('700', 'description');
        $where = [['id', '=', $input['id']]];
        $has = $this->isExisted($where, $this->table);
        if (!$has) TEA('700', 'id');

        $data['name'] = $input['name'];
        $data['description'] = isset($input['description']) ? trim($input['description']) : '';
        //更新基础信息
        $result = DB:: table($this->table)->where('id', '=', $input['id'])->update($data);
        return $result;
    }

    /**
     * 重新选节点
     *
     * @param $input
     * @return mixed
     * @throws \App\Exceptions\ApiException
     */
    public function editDetail($input)
    {
        if (!isset($input['route_id'])) TEA('700', 'route_id');
        if (!isset($input['operation_id'])) TEA('700', 'operation_id');
        if (!isset($input['order'])) TEA('700', 'order');

        //工艺路线是否存在;
        $where = [['id', '=', $input['route_id']]];
        $has = $this->isExisted($where, $this->table);
        if (!$has) TEA('143');//工艺路线id异常

        //operation_id是否正常/正确;
        $where = [['id', '=', $input['operation_id']]];
        $has = $this->isExisted($where, $this->operation);
        if (!$has) TEA('700', 'operation_id');

        //order是否正常/正确;
        $where = [['order', '=', $input['order']], ['rid', '=', $input['route_id']]];
        $has = $this->isExisted($where, $this->opTable);
        if (!$has) TEA('700', 'order');


        $data = [];
        $data['oid'] = $input['operation_id'];
        if (isset($input['type'])) {
            $data['type'] = $input['type'];
        }
        $data['ctime'] = $this->datetime;
        $yuanData = DB::table($this->opTable)->where([['rid', '=', $input['route_id']], ['order', '=', $input['order']]])->update($data);
        return $yuanData;
    }

    /**
     * 更新工艺路线路由
     *
     * @param $input
     * @return mixed
     * @throws \App\Exceptions\ApiException
     */
    public function updateDetail($input)
    {
        if (!isset($input['route_id'])) TEA('700', 'route_id');
        if (!isset($input['current_oid'])) TEA('700', 'current_oid');
        if (!isset($input['next_oid'])) TEA('700', 'next_oid');

        //工艺路线是否存在;
        $where = [['id', '=', $input['route_id']]];
        $has = $this->isExisted($where, $this->table);
        if (!$has) TEA('143');//工艺路线id异常

        //current_oid是否正常/正确;
        $where = [['id', '=', $input['current_oid']], ['rid', '=', $input['route_id']]];
        $has = $this->isExisted($where, $this->opTable);
        if (!$has) TEA('700', 'current_oid');

        //next_oid是否正常/正确;
        $where = [['id', '=', $input['next_oid']], ['rid', '=', $input['route_id']]];
        $has = $this->isExisted($where, $this->opTable);
        if (!$has) TEA('700', 'next_oid');

        //map表是否已经有此oid;(nid==$input['next_oid'])
        $where = [['nid', '=', $input['next_oid']], ['route_id', '=', $input['route_id']], ['cid', '=', $input['current_oid']]];
        $has = $this->isExisted($where, $this->mapTable);
        if ($has) {
            //已经存在,删除
            return DB::table($this->mapTable)->where($where)->delete();
        } else {
            //不存在,添加;
            $data = [];
            $data['cid'] = $input['current_oid'];
            $data['nid'] = $input['next_oid'];
            $data['route_id'] = $input['route_id'];
            return DB::table($this->mapTable)->insertGetId($data);
//            return 'add successed';
        }
    }
//endregion

//region 查

    /**
     * @param $input
     * @return mixed
     * @throws \App\Exceptions\ApiException
     */
    public function indexPage($input)
    {
        if (empty($input['page_no']) || !is_numeric($input['page_no']) || $input['page_no'] < 1) TEA('700', 'page_no');
        if (empty($input['page_size']) || !is_numeric($input['page_size']) || $input['page_size'] < 0) TEA('700', 'page_size');
        $list = DB::table($this->table)
            ->offset(($input['page_no'] - 1) * $input['page_size'])
            ->limit($input['page_size'])
            ->get();

        $result['list'] = $list;
        $result['current_page_no'] = $input['page_no'];
        $result['current_page_size'] = $input['page_size'];
        $result['total_records'] = DB::table($this->table)->count();
        $result['total_pages'] = ceil($result['total_records'] / $result['current_page_size']);
        return $result;
    }

    /**
     * 获取全部工艺路线列表
     *
     * @return mixed
     */
    public function index()
    {
        $list = DB::table($this->table)->orderBy('id', 'desc')->get();
        return $list;
    }


    /**
     * 根据工艺路线id获取其相关工序内容和关联关系
     *
     * @param $input
     * @return array
     */
    public function display($input)
    {
        //获取该工艺路线id全部工艺信息(id, name, order);
        $operationList = [];
        //添加root默认隐藏快
        $operationList['operations'][] = ["operation" => "null", "label" => "root", "mode" => "MODE_REQUIRED"];

        $arr = DB::table($this->table)//rpr
        ->leftJoin($this->opTable, $this->table . '.id', '=', $this->opTable . '.rid')//rpro
        ->leftJoin($this->operation, $this->opTable . '.oid', '=', $this->operation . '.id')//rio
        ->leftJoin($this->oaTable, $this->operation . '.id', '=', $this->oaTable . '.operation_id')//rioa
        ->select(
            $this->opTable . '.order',
            $this->operation . '.name',
            $this->operation . '.code as operation_code',
            $this->operation . '.is_excrete',
            $this->opTable . '.rid as routeid',
            $this->opTable . '.id as oid',
            $this->opTable . '.oid as operation_id',
            $this->opTable . '.type',
            DB::raw('group_concat(' . $this->oaTable . '.ability_name) as abilities_name'),
            DB::raw('group_concat(' . $this->oaTable . '.ability_id) as abilities_id'),
            DB::raw('group_concat(' . $this->oaTable . '.id) as operation_to_ability_ids')
        )
            ->where('rid', '=', $input['id'])
            ->groupBy($this->opTable . '.id')
            ->orderBy($this->opTable . '.order', 'asc')
//            ->toSql();
            ->get()->toArray();
        array_unshift($arr, ["operation" => "null", "label" => "root", "mode" => "MODE_REQUIRED"]);
        $operationList['operations'] = json_decode(json_encode($arr));

//        return $operationList;
//        return $operationList[0]->oid;

        //前端所需要的[[0,1],[0,2],[1,3],[1,4]...]的数据格式;
        $orderArr = [[0, 1]];//默认[0,1]放进去
//        $orderArr=[];
        foreach ($operationList['operations'] as $key => $value) {
            if ($key == 0) continue;
            //重组所有工序能力成一个数组;
            $operationList['operations'][$key]->abilities = [];
            if ($value) {
                $tmpanamearr = explode(',', $value->abilities_name);
                $tmpaidarr = explode(',', $value->abilities_id);
                $tmpoptoabarr = explode(',', $value->operation_to_ability_ids);

                foreach ($tmpaidarr as $tk => $tv) {
                    $operationList['operations'][$key]->abilities[] = ['ability_id' => $tv, 'ability_name' => $tmpanamearr[$tk], 'operation_to_ability_id' => $tmpoptoabarr[$tk]];
                }
                unset($operationList['operations'][$key]->abilities_name);
                unset($operationList['operations'][$key]->abilities_id);
                unset($operationList['operations'][$key]->operation_to_ability_ids);
            }

            //根据operation_id找rprm表对应关系;
            $tmp = DB::table($this->mapTable)
                ->leftJoin($this->opTable, $this->mapTable . '.nid', '=', $this->opTable . '.id')
                ->leftJoin($this->operation, $this->opTable . '.oid', '=', $this->operation . '.id')
                ->select(
                    $this->opTable . '.order',
                    $this->opTable . '.id as oid',
                    $this->opTable . '.oid as operation_id',
                    $this->operation . '.name',
                    $this->mapTable . '.ctime'
                )
                ->where([['cid', '=', $value->oid], ['route_id', '=', $value->routeid]])
                ->orderBy('nid', 'asc')
                ->get();

            //根据每个children的oid和order, 完成orderArr数组;
            if (count($tmp) > 0) {
                foreach ($tmp as $v) {
                    $orderArr[] = [$value->order, $v->order];
                }
            }
            $operationList['operations'][$key]->children = $tmp;

        }
        $operationList['orderlist'] = $orderArr;

//        $operationList['operations']['root'] = ["operation"=>"null","label"=>"root","mode"=>"MODE_REQUIRED"];

        //工艺路线基础信息
        $routeInfo = DB::table($this->table)->select()->where('id', '=', $input['id'])->get();
        $operationList['routeInfo'] = $routeInfo;


//        return DB::table($this->mapTable)->where([['cid','=',$operationList[0]->oid],['route_id','=',$operationList[0]->routeid]])->get();
        return $operationList;
    }

    /**
     * 显示所有节点;
     *
     * @param $input
     * @return mixed
     * @throws \App\Exceptions\ApiException
     */
    public function showDetail($input)
    {
        if (!isset($input['route_id'])) TEA('700', 'route_id');
        if (!isset($input['order'])) TEA('700', 'order');
        //工艺路线是否存在;
        $where = [['id', '=', $input['route_id']]];
        $has = $this->isExisted($where, $this->table);
        if (!$has) TEA('700', 'route_id');//工艺路线id异常
        //顺序是否存在;
        $where = [['order', '=', $input['order']], ['rid', '=', $input['route_id']]];
        $has = $this->isExisted($where, $this->opTable);
        if (!$has) TEA('700', 'route_id');//工艺路线order异常

        return DB::table($this->opTable)->where([['order', '>', $input['order']], ['rid', '=', $input['route_id']]])->get();
    }
//endregion


//region 推送
    /**
     * mes把工艺路线推送给SAP
     * 获取需要推送的数据
     *
     * @param int $bom_id BOM的ID
     * @param int $routing_id 工艺路线ID
     * @param int $factory_id 工厂ID
     * @return array
     * @throws \App\Exceptions\ApiException
     * @author lester.you
     */
    public function GetSyncRouteToSapData($bom_id, $routing_id, $factory_id)
    {

        $dataObj = DB::table(config('alias.rbr') . ' as rbr')
            // 关联ruis_bom
            ->leftJoin(config('alias.rb') . ' as rb', 'rb.id', '=', 'rbr.bom_id')
            //  ruis_procedure_route
            ->leftJoin(config('alias.rpr') . ' as rpr', 'rpr.id', '=', 'rbr.routing_id')
            // ruis_material
            ->leftJoin(config('alias.rm') . ' as rm', 'rm.id', '=', 'rb.material_id')
            //ruis_procedure_route_operation 当前工序
            ->leftJoin(config('alias.rpro') . ' as rpro', 'rpro.rid', '=', 'rbr.routing_id')
            // ruis_ie_operation
            ->leftJoin(config('alias.rio') . ' as rio', 'rio.id', '=', 'rpro.oid')
            ->leftJoin(config('alias.ruu') . ' as ruu', 'ruu.id', '=', 'rm.unit_id')
            ->select([
                'rm.id as material_id',
                'rm.item_no as material_code',
                'rm.name as material_name',
                'ruu.commercial as material_unit',
                'rpr.id as route_id',
                'rpr.code as route_code',
                'rpr.name as route_name',
                'rb.id as bom_id',
                'rb.bom_no as bom_no',
                'rb.BMEIN',
                'rb.STLAN',
                'rb.qty as base_number',
                'rio.id as operation_id',
                'rio.code as operation_code',
                'rio.name as operation_name',
                'rpro.id as rpro_id',
                'rpro.order as index',

            ])
            ->where([['rb.id', '=', $bom_id], ['rb.is_version_on', '=', 1], ['rpr.id', '=', $routing_id]])
            ->orderBy('rpro.order', 'ASC')
            ->get();

        if (empty(json_decode(json_encode($dataObj)))) {
            TEA('2474');  // BOM不是有效bom
        }

        // 去除第一个工序
        $tempArr = [];
        foreach ($dataObj as $ok => $item) {
            if ($ok == 0) {
                continue;
            }
            $tempArr[] = $item;
        }
        array_values($tempArr);
        $dataObj = json_decode(json_encode($tempArr));
        unset($tempArr);

        /**
         * @var string $bomNo bom 编号
         * @var string $materialCode 物料code
         */
        $bomNo = '';
        $materialCode = '';

        $sendData = [];
        foreach ($dataObj as $key => $value) {

            //获取下一个工序
            $nextOperationOjb = DB::table(config('alias.rprm') . ' as rprm')
                ->leftJoin(config('alias.rpro') . ' as rpro', 'rpro.id', '=', 'rprm.nid')
                ->select([
                    'rpro.id as next_rpro.id',
                    'rpro.oid as next_operation_id',
                ])
                ->where([
                    ['rprm.cid', '=', $value->rpro_id],
                    ['rprm.route_id', '=', $value->route_id]
                ])
                ->get();
            $nextOperationIDArr = [];
            foreach ($nextOperationOjb as $noKey => $nkValue) {
                $nextOperationIDArr[] = $nkValue->next_operation_id;
            }

            $bomNo = $value->bom_no;
            $materialCode = $value->material_code;

            // 获取工厂
            $factoryObj = DB::table(config('alias.rf'))->select(['code'])->where('id', $factory_id)->first();

            // 获取 ruis_bom_routing_base
            $rbrbOjb = DB::table(config('alias.rbrb') . ' as rbrb')
//                ->leftJoin(config('alias.rpro') . ' as rpro', 'rpro.id', '=', 'rbrb.routing_node_id')
                ->select('rbrb.id')
                ->where([
                    ['rbrb.routing_node_id', '=', $value->rpro_id],
                    ['rbrb.bom_id', '=', $bom_id],
                    ['rbrb.routing_id', '=', $routing_id],
                ])
                ->get();
            $rbrbIDArr = [];
            foreach ($rbrbOjb as $rbrbKey => $rbrbValue) {
                $rbrbIDArr[] = $rbrbValue->id;
            }

            /**
             * 工作中心
             * 返回第一个
             */
            $value->workcenter_code = '';
            $workCenterOjb = DB::table(config('alias.rbrw') . ' as rbrw')
                ->leftJoin(config('alias.rbrb') . ' as rbrb', 'rbrb.id', '=', 'rbrw.bom_routing_base_id')
                ->leftJoin(config('alias.rwc') . ' as rwc', 'rwc.id', '=', 'rbrw.workcenter_id')
                ->select([
                    'rbrw.workcenter_id',
                    'rwc.code',
                    'rwc.name',
                    'rwc.standard_code',
                    'rbrb.operation_ability_ids'
                ])
                ->where([
                    ['rbrb.routing_id', '=', $value->route_id],
                    ['rbrb.bom_id', '=', $value->bom_id],
                    ['rbrb.operation_id', '=', $value->operation_id],
                ])
                ->orderBy('rbrb.index', 'ASC')
                ->first();
            if (!isset($workCenterOjb->code) || !isset($workCenterOjb->standard_code)) {
                TEA('2480');    //工作中心配置不完整
            }
            $value->workcenter_code = $workCenterOjb->code;

            $work_hour_param_arr = [
                'operation_id' => $value->operation_id,
                'route_id' => $value->route_id,
                'rbrb_ID_Arr' => $rbrbIDArr,
                'next_operation_ID_Arr' => $nextOperationIDArr,
            ];
            $work_hour_arr = $this->get_work_hour($work_hour_param_arr);

            $control_code_arr = $this->get_control_code($bom_id, $routing_id, $value->rpro_id);

            /**
             * @since 2018-10-22 旋切
             */
            $xq_sum = DB::table(config('alias.rimw') . ' as rimw')
                ->leftJoin(config('alias.rioa') . ' as rioa', 'rioa.id', '=', 'rimw.ability_id')
//                ->leftJoin(config('alias.riw').' as riw',[
//                    ['riw.operation_id', '=', 'rimw.operation_id'],
//                    ['riw.ability_id','=','rioa.ability_id']
//                ])
                ->where(
                    [
                        ['rimw.operation_id', '=', $value->operation_id],
                        ['rimw.routing_id', '=', $value->route_id],
                    ])
                ->whereIn('rimw.step_info_id', $rbrbIDArr)
                ->select([
                    'rimw.id',
                    'riw.id as riw_id',
//                    'riw.is_ladder',
                    'rimw.once_clip_time'
                ])
                ->sum('once_clip_time');
//            $xq_SLWID = '';
            $xq_PAR05 = '';
            $xq_USE05 = '';
            $xq_USR05 = '';
            if ($xq_sum > 0) {
//                $xq_SLWID = 'MLILY01';
                $xq_PAR05 = 'MLILY01';   //ZPP022
                $xq_USE05 = 'S';
                $xq_USR05 = $xq_sum;
            }

            /**
             * ruis_procedure_route_gn
             * 通过查询上表，确定当前工艺路线是否为新添加的，
             * 如果为修改，需要把原来的goup_number count 传给SAP
             * 否则，两值为空
             */
            $gnObj = DB::table(config('alias.rprgn'))
                ->select(['group_number', 'group_count'])
                ->where([
                    ['bom_no', '=', $value->bom_no],
                    ['material_code', '=', $value->material_code],
                    ['routing_id', '=', $value->route_id],
//                    ['factory_id', '=', $factory_id]
                ])
                ->first();

            $temp = [
                'MATNR' => isset($value->material_code) ? trim($value->material_code) : "",
                'MAKTX' => isset($value->material_name) ? trim($value->material_name) : "",
                'WERKS' => isset($factoryObj->code) ? $factoryObj->code : "",
                'KTEXT' => $value->route_name,
                'LOSVN1' => 0,
                'LOSBS1' => 99999999,
                'PLNME1' => $value->material_unit,
                "VORNR" => str_pad($value->index * 10, 4, '0', STR_PAD_LEFT),
                'LTXA1' => $value->operation_name,
                'ARBPL' => $value->workcenter_code,
                'STEUS' => $control_code_arr['control_code'],      // 控制码
                'BMSCH1' => $control_code_arr['base_qty'],
                'MEINH1' => $value->BMEIN,
                'ZWNOR1' => round($work_hour_arr['lz_work_hour']) + $work_hour_arr['pre_work_hour'],  //流转时间
                'ZEIWN1' => 'S',
                'VGWTS' => 'ZHF1',  //标准值码 默认为 ZHF1
                'VGW011' => '',
                'VGE011' => '',
                'VGW021' => '',
                'VGE021' => '',
                'VGW031' => '',
                'VGE031' => '',
                'VGW041' => '',
                'VGE041' => '',
                'VGW051' => '',
                'VGE051' => '',
                'VGW061' => '',
                'VGE061' => '',
                'STALT' => $value->bom_no,  //BOM编号
                'STLAN' => $value->STLAN,     //BOM用途
                'PLNNR' => isset($gnObj->group_number) ? $gnObj->group_number : '', // 任务清单组键值
                'PLNAL' => isset($gnObj->group_count) ? $gnObj->group_count : '',   // 组计数器
//                'SLWID' => $xq_SLWID,
                'userfields_keyword_id' => $xq_PAR05,   //参数ID
                'userfield_unit_05' => $xq_USE05,       //数量字段单位
                'userfield_quan_05 ' => empty($xq_USR05) ? '' : $xq_USR05 * $control_code_arr['base_qty'],      //用户字段数量
                'SPMUS' => empty($control_code_arr['is_split']) ? '' : 'X',
                'SPLIM' => empty($control_code_arr['is_split']) ? '' : $control_code_arr['max_split_point'],

            ];

            /**
             * 标准值
             * 1.先根据标准值码 获取相对应的参数条目
             * 2.遍历
             * 3.处理对应的业务
             */
            $StandardValue = new StandardValue();
            $sv_list = $StandardValue->getParamItem($workCenterOjb->standard_code);
            if (empty($sv_list)) {
                TEA('2484');
            }
            $temp['VGWTS'] = $workCenterOjb->standard_code;
            foreach ($sv_list as $paramItem) {
                $temp['VGE0' . $paramItem['index'] . '1'] = $paramItem['unit'];     // 标准值X 的单位

                //根据不同类型获取对应的值
                switch ($paramItem['code']) {
                    case 'ZPP002':   // 人工工时
                        $this_standard_value = $work_hour_arr['rg_work_hour'];
                        break;
                    case 'ZPP005':   // 作业量
                        $this_standard_value = $this->get_param_item_value($rbrbIDArr, $paramItem['code']);
                        break;
                    case 'ZPP007':   // 针数
                        $this_standard_value = $this->get_param_item_value($rbrbIDArr, $paramItem['code']);
                        break;
                    case 'ZPP008':   // 模具数量
                        $this_standard_value = $this->get_param_item_value($rbrbIDArr, $paramItem['code']);
                        break;
                    case 'ZPP009':   // 仓容
                        $this_standard_value = $this->get_param_item_value($rbrbIDArr, $paramItem['code']);
                        break;
                    default:
                    case 'ZPP001':   // 机器工时
                        $this_standard_value = $work_hour_arr['jq_work_hour'];
                        break;
                }
                $temp['VGW0' . $paramItem['index'] . '1'] = $this_standard_value * $control_code_arr['base_qty'];   // 标准值X 的值
            }
            $sendData[] = $temp;

        }

        /**
         * 可选的 BOM
         * BOM 项目号
         * 操作/活动编号
         */
        $new_objs = DB::table(config('alias.rbri') . ' as rbri')
            ->leftJoin(config('alias.rb') . ' as rb', 'rb.id', '=', 'rbri.bom_id')
            ->leftJoin(config('alias.rbrb') . ' as rbrb', 'rbrb.id', '=', 'rbri.bom_routing_base_id')
            ->leftJoin(config('alias.rpro') . ' as rpro', 'rpro.id', '=', 'rbrb.routing_node_id')
            ->select([
                'rb.bom_no',
                'rbri.POSNR',
                'rpro.order as index'
            ])
            ->where([
                ['rbri.bom_id', '=', $bom_id],
                ['rbri.routing_id', '=', $routing_id],
                ['rbri.type', '=', 1]
            ])
            ->whereExists(function ($query) use ($bom_id) {
                $query->select(['rbii.material_id'])
                    ->from(config('alias.rbi') . ' as rbii')
                    ->whereRaw('`rbii`.`bom_id` = ' . $bom_id . ' and `rbii`.`material_id` = `rbri`.`material_id`');
            })
            ->get();
        $i = 1;
        foreach ($new_objs as $obj) {
            $sendData['Label_Fix__COMPONENT+' . $i++] = [
                'ALTERNATIVE_BOM' => $obj->bom_no,
                'ITEM_NO' => $obj->POSNR,
                'ACTIVITY' => str_pad($obj->index * 10, 4, '0', STR_PAD_LEFT)
            ];
        }

        return ['data' => $sendData, 'bomNo' => $bomNo, 'materialCode' => $materialCode];
    }

    /**
     * @param $bom_id
     * @param $routing_id
     * @return mixed
     * @throws \App\Exceptions\ApiException
     */
    public function getFactoryID($bom_id, $routing_id)
    {
        $obj = DB::table(config('alias.rbr'))
            ->select(['factory_id'])
            ->where([
                ['bom_id', '=', $bom_id],
                ['routing_id', '=', $routing_id]
            ])
            ->first();
        if (!isset($obj->factory_id)) {
            TEA('700', 'factory_id');
        }
        return $obj->factory_id;
    }

    /**
     * 获取工时(同步SAP工艺路线)
     *
     * @param array $paramArr
     * @return array
     * @throws \App\Exceptions\ApiException
     */
    private function get_work_hour($paramArr)
    {
        /**
         * 机器工时 & 流转工时 &准备工时
         */
        $jq_workHourOjb = DB::table(config('alias.rimw'))
            ->where(
                [
                    ['operation_id', '=', $paramArr['operation_id']],
                    ['routing_id', '=', $paramArr['route_id']],
                ])
            ->whereIn('step_info_id', $paramArr['rbrb_ID_Arr'])
            ->select(['id', 'man_hours', 'work_hours', 'step_info_id'])
            ->get();
        $step_temp = [];
        foreach ($jq_workHourOjb as $item) {
            $step_temp[$item->step_info_id][] = $item;
        }

//        $step_count = count($step_temp);
        $jq_workHours = 0;  //机器工时
        $rg_workHours = 0;  //人工工时
        foreach ($step_temp as $k => &$v) {
            // 一组 step
            $work_hours_arr = [];
            $man_hours_arr = [];
            foreach ($v as $_v) {
                $work_hours_arr[] = $_v->work_hours;
                $man_hours_arr[] = $_v->man_hours;
            }
//            $jq_workHours += min($work_hours_arr ?: [0]) + min($man_hours_arr ?: [0]);
            $jq_workHours += min($work_hours_arr ?: [0]);
            $rg_workHours += min($man_hours_arr ?: [0]);
        }
        // 如果为0，则取 导入的值
        $jq_workHours = $jq_workHours ?: $this->get_param_item_value($paramArr['rbrb_ID_Arr'], 'ZPP001');
        $rg_workHours = $rg_workHours ?: $this->get_param_item_value($paramArr['rbrb_ID_Arr'], 'ZPP002');
        /**
         * @todo 机器工时可为空
         */
//        if ($jq_workHours == 0) {
//            TEA('2407', '机器工时');
//        }

        /**
         * 准备工时
         *
         * 1.先获取步骤ID
         * 2.rbrb 获取能力ID
         * 3.根据能力ID和工序ID 获取准备工时
         */
        // 步骤表 获取 能力ID
        $rbrbObj = DB::table(config('alias.rbrb'))
            ->select(['operation_ability_ids'])
            ->whereIn('id', $paramArr['rbrb_ID_Arr'])
            ->get();
        $preWorkHour = 0;
        $lz_workHour = 0;
//        foreach ($rbrbObj as $rbrbValue) {
//
//            // 准备工时
//            $preparationHourBuilder = DB::table(config('alias.riw') . ' as riw')
//                ->select('riw.preparation_hour', 'riw.id')
//                ->where([
//                    ['riw.operation_id', '=', $paramArr['operation_id']],
//                    ['riw.parent_id', '>', 0],
//                ])
//                ->orderBy('riw.preparation_hour', 'DESC');
//
//            if (isset($rbrbValue->operation_ability_ids) && !empty(intval($rbrbValue->operation_ability_ids))) {
//                $preparationHourBuilder
//                    ->leftJoin(config('alias.rioa') . ' as rioa', 'rioa.ability_id', '=', 'riw.ability_id')
//                    ->where([
//                        ['rioa.id', '=', intval($rbrbValue->operation_ability_ids)]
//                    ]);
//            }
//            $preparationHourObj = $preparationHourBuilder->first();
//            if (isset($preparationHourObj->preparation_hour)) {
//                $preWorkHour += $preparationHourObj->preparation_hour;
//            }
//
//            // 流传工时
//            $lz_workHourObj = DB::table(config('alias.rfit') . ' as rfit')
//                ->leftJoin(config('alias.riw') . ' as riw', 'riw.id', '=', 'rfit.setting_id')
//                ->leftJoin(config('alias.rioa') . ' as rioa', 'rioa.ability_id', '=', 'riw.ability_id')
//                ->where([
//                    ['riw.operation_id', '=', $paramArr['operation_id']],
//                    ['rioa.id', '=', intval($rbrbValue->operation_ability_ids)],
//                ])
//                ->whereIn('rfit.next_operation', $paramArr['next_operation_ID_Arr'])
//                ->select('rfit.flow_value')
//                ->get();
//            $lz_value_temp = [];
//            foreach ($lz_workHourObj as $v) {
//                if ($v->flow_value != 0) {
//                    $lz_value_temp[] = $v->flow_value;
//                }
//            }
//            $lz_workHour += min($lz_value_temp ?: [0]);
//        }
//        if (empty($preWorkHour)) {
//            TEA('2407', '准备工时');
//        }

        $rbrbObj = DB::table(config('alias.rbrb'))
            ->select(['operation_ability_ids'])
            ->whereIn('id', $paramArr['rbrb_ID_Arr'])
            ->orderBy('index','asc')
            ->first();
        $preparationHourBuilder = DB::table(config('alias.riw') . ' as riw')
            ->select('riw.preparation_hour', 'riw.id')
            ->where([
                ['riw.operation_id', '=', $paramArr['operation_id']],
                ['riw.parent_id', '>', 0],
            ])
            ->orderBy('riw.preparation_hour', 'DESC');

        if (isset($rbrbObj->operation_ability_ids) && !empty(intval($rbrbObj->operation_ability_ids))) {
            $preparationHourBuilder
                ->leftJoin(config('alias.rioa') . ' as rioa', 'rioa.ability_id', '=', 'riw.ability_id')
                ->where([
                    ['rioa.id', '=', intval($rbrbObj->operation_ability_ids)]
                ]);
        }
        $preparationHourObj = $preparationHourBuilder->first();

        if (isset($preparationHourObj->preparation_hour)) {
            $preWorkHour = $preparationHourObj->preparation_hour;
        }

        if (empty($preWorkHour)) {
            TEA('2407', '准备工时');
        }

        return [
            'jq_work_hour' => $jq_workHours,
            'rg_work_hour' => $rg_workHours,
            'pre_work_hour' => $preWorkHour,
            'lz_work_hour' => $lz_workHour,
        ];
    }

    /**
     * @param array $rbrbIDArr
     * @param string $paramItemCode
     * @return int
     */
    private function get_param_item_value($rbrbIDArr, $paramItemCode)
    {
        $objs = DB::table(config('alias.spiv'))
            ->where('standard_item_code', $paramItemCode)
            ->whereIn('step_info_id', $rbrbIDArr)
            ->select(['value', 'id'])
            ->get();
        $values = 0.000;
        foreach ($objs as $v) {
            if (isset($v->value)) {
                $values += $v->value;
            }
        }
        return $values;
    }

    /**
     * 查询 控制码
     * 默认为PP01
     *
     * @param int $bom_id
     * @param int $routing_id
     * @param int $rpro_id
     * @return array
     */
    private function get_control_code($bom_id, $routing_id, $rpro_id)
    {
        $obj = DB::table(config('alias.rbroc'))
            ->select([
                'control_code',
                'base_qty',
                'is_split',
                'max_split_point'
            ])
            ->where([
                ['bom_id', '=', $bom_id],
                ['routing_id', '=', $routing_id],
                ['routing_node_id', '=', $rpro_id]
            ])
            ->first();
        $data = [
            'control_code' => 'PP01',
            'base_qty' => 1
        ];
        if (isset($obj->control_code) && !empty($obj->control_code)) {
            $data['control_code'] = $obj->control_code;
            $data['base_qty'] = $obj->base_qty;
            $data['is_split'] = $obj->is_split;
            $data['max_split_point'] = $obj->max_split_point;
        }
        return $data;
    }

    /**
     * 处理同步 工艺路线 时 SAP返回的数据
     *
     * @param string $groupNumber SAP返回的数据： 任务清单组键值
     * @param string $count SAP返回的数据： 组计数器
     * @param string $bomNo bom number
     * @param string $materialCode 物料code
     * @param string $route_id 工艺路线ID
     * @author lester.you
     */
    public function updateGroupNumberAndCount($groupNumber, $count, $bomNo, $materialCode, $route_id, $factory_id = 0)
    {
        $data = DB::table(config('alias.rprgn'))
            ->select(['id'])
            ->where([
                ['bom_no', '=', $bomNo],
                ['material_code', '=', $materialCode],
                ['group_number', '=', $groupNumber],
                ['group_count', '=', $count],
                ['factory_id', '=', $factory_id]
            ])
            ->first();
        if (!empty($data)) {
            DB::table(config('alias.rprgn'))
                ->where([
                    ['bom_no', '=', $bomNo],
                    ['material_code', '=', $materialCode],
                    ['group_number', '=', $groupNumber],
                    ['group_count', '=', $count],
                    ['factory_id', '=', $factory_id]
                ])
                ->update(['routing_id' => $route_id]);
        } else {
            DB::table(config('alias.rprgn'))
                ->insertGetId([
                    'bom_no' => $bomNo,
                    'material_code' => $materialCode,
                    'group_number' => $groupNumber,
                    'group_count' => $count,
                    'routing_id' => $route_id,
                    'factory_id' => $factory_id,
                    'ctime' => time()
                ]);
        }
    }

//endregion

}