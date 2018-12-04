<?php
/**
 * Created by PhpStorm.
 * User: ruiyanchao
 * Date: 2018/1/4
 * Time: 下午1:26
 */
namespace App\Http\Models;//定义命名空间
use App\Libraries\CheckBomItem;
use Illuminate\Support\Facades\DB;
use App\Libraries\Trace;
use phpDocumentor\Reflection\Types\Null_;
use App\Http\Models\Material\Material;

/**
 * BOM操作类
 * @author  rick
 * @time    2017年10月19日13:39:39
 */
class ManufactureBom extends Base
{

    /**
     * 前端传递的api主键名称
     * @var string
     */
    public $apiPrimaryKey = 'manufacture_bom_id';
    protected $connection = 'mysql';

    public function __construct()
    {
        parent::__construct();
        $this->table = config('alias.rmb');
    }

    //region 检

    /**
     * 规则检测
     * @return array
     */
    public function getRules()
    {
        return array(

            'code' => array('name' => 'code', 'type' => 'string', 'require' => true, 'on' => 'add,update', 'desc' => '物料清单编码'),
            'name' => array('name' => 'name', 'type' => 'string', 'require' => true, 'on' => 'add,update', 'desc' => '物料清单名称'),
            'version' => array('name' => 'version', 'type' => 'string', 'require' => true, 'on' => 'add,update', 'desc' => '衍生版本'),
            'version_description' => array('name' => 'version_description', 'max' => 200, 'type' => 'string', 'require' => false, 'on' => 'add,update', 'desc' => '版本描述'),
            'material_id' => array('name' => 'material_id', 'type' => 'int', 'require' => true, 'on' => 'add,update', 'desc' => '物料ID'),
            'bom_group_id' => array('name' => 'bom_group_id', 'type' => 'int', 'require' => true, 'on' => 'add,update', 'desc' => '物料清单分组'),
            'qty' => array('name' => 'qty', 'type' => 'int', 'require' => true, 'on' => 'add,update', 'desc' => '用量'),
            'loss_rate' => array('name' => 'loss_rate', 'type' => 'float', 'require' => false, 'default' => 0.00, 'min' => 0.00, 'max' => 99.99, 'on' => 'add,update', 'desc' => '损耗率'),
            'description' => array('name' => 'description', 'default' => '', 'type' => 'string', 'max' => 500, 'require' => false, 'on' => 'add,update', 'desc' => '描述'),
            'cookie' => array('name' => 'cookie', 'type' => 'string', 'require' => false, 'on' => 'add,delete', 'desc' => '客户端cookie'),
            'bom_tree' => array('name' => 'bom_tree', 'type' => 'array', 'format' => 'json', 'require' => true, 'on' => 'add,update', 'desc' => '常规中项的添加'),
            'attachments' => array('name' => 'attachments', 'type' => 'array', 'format' => 'json', 'require' => true, 'on' => 'add,update', 'desc' => '常规中项的添加'),
            'manufacture_bom_id' => array('name' => 'manufacture_bom_id', 'type' => 'int', 'on' => 'delete,show,update', 'require' => true, 'desc' => '制造BOM ID'),
        );
    }

    //endregion


    //region 查
    /**
     * 获取列表
     * @param $input
     * @return mixed
     */
    public function getProductBomList(&$input)
    {
        if (!isset($input['material_id'])) TEA('700', 'material_id');
        !empty($input['code']) && $where[] = ['code', 'like', '%' . $input['code'] . '%']; //物料分组编码
        !empty($input['name']) && $where[] = ['name', 'like', '%' . $input['name'] . '%']; //名称
        !empty($input['material_id']) && $where[] = ['material_id', '=', $input['material_id']]; //名称

        $builder = DB::connection($this->connection)->table($this->table)
            ->select('id as product_bom_id',
                'code',
                'name',
                'version',
                'bom_tree',
                'differences',
                'version_description')
            ->offset(($input['page_no'] - 1) * $input['page_size'])
            ->limit($input['page_size']);

        if (!empty($where)) $builder->where($where);
        //order  (多order的情形,需要多次调用orderBy方法即可)
        if (!empty($input['order']) && !empty($input['sort'])) $builder->orderBy($input['sort'], $input['order']);
        //get获取接口
        $obj_list = $builder->get();
        //总共有多少条记录
        $count_builder = DB::connection($this->connection)->table($this->table);
        if (!empty($where)) $count_builder->where($where);
        $input['total_records'] = $count_builder->count();
        return $obj_list;
    }

    /**
     * 获取一条数据
     * @param $id
     * @return mixed
     */
    public function get($id)
    {
        $fields = ['id as manufacture_bom_id', 'code', 'name', 'version', 'version_description', 'material_id',
            'bom_group_id', 'qty', 'loss_rate', 'description', 'creator_id', 'ctime', 'bom_tree', 'attachments'
        ];
        $obj = $this->getRecordById($id, $fields, $this->table, $this->connection);
        if (!$obj) TEA('404');
        //时间格式转换
        $obj->ctime = $obj->ctime > 0 ? date('Y-m-d H:i:s', $obj->ctime) : '';
        //用户名
        $obj->creator_name = '';
        if (!empty($obj->creator_id)) $obj->creator_name = $this->getFieldValueById($obj->creator_id, 'name', config('alias.u'));
        //Bom组名称
        $obj->bom_group_name = '';
        if (!empty($obj->bom_group_id)) $obj->bom_group_name = $this->getFieldValueById($obj->bom_group_id, 'name', config('alias.rbg'));
        //bom顶级母件编码
        $obj->item_no = $this->getFieldValueById($obj->material_id, 'item_no', config('alias.rm'));
        //获取bom的关联附件
        $obj->attachments = $this->getBomAttachments(json_decode($obj->attachments));
        return $obj;
    }

    /**
     * 获取附件
     * @param $attachments
     * @return string
     */
    public function getBomAttachments($attachments)
    {
        $attachments_ids = array();
        $tmp = array();
        foreach ($attachments as $row) {
            $attachments_ids[] = $row->attachment_id;
            $tmp[$row->attachment_id] = $row->comment;
        }
        if (!empty($attachments_ids)) {
            $obj_list = DB::table(config('alias.attachment') . ' as attach')
                ->whereIn('attach.id', $attachments_ids)
                ->leftJoin(config('alias.u') . ' as u', 'attach.creator_id', '=', 'u.id')
                ->select(
                    'attach.id as attachment_id',
                    'u.name as creator_name',
                    'attach.name',
                    'attach.filename',
                    'attach.path',
                    'attach.size',
                    'attach.ctime',
                    'attach.creator_id'
                )->get();
            foreach ($obj_list as $key => &$value) {
                $value->ctime = date('Y-m-d H:i:s', $value->ctime);
                $value->comment = isset($tmp[$value->attachment_id]) ? $tmp[$value->attachment_id] : '';
            }
            return $obj_list;
        } else {
            return '';
        }
    }
    //endregion


    //region 增

    /**
     * @param $input
     * @param bool $check
     * @param int $from
     * @return mixed
     */
    public function add(&$input, $check = true, $from = 1)
    {
        $this->checkRules($input);
        $bom_tree = $input['bom_tree'];
        if ($check) {
            $bom = new Bom();
            $real_tree = $bom->getBomTree($input['material_id'], $input['version'], true, true);
            $this->check($bom_tree['children'], obj2array($real_tree->children), $input);
        }
        $bom_id = $this->addBom($input, $from);
        return $bom_id;
    }


    public function addBom($input, $from)
    {
        $creator_id = (!empty(session('administrator')->admin_id)) ? session('administrator')->admin_id : 0;
        $data = [
            'code' => $input['code'],//bom编码
            'name' => $input['name'],//名称
            'version' => $input['version'],//版本
            'version_description' => $input['version_description'],//版本介绍
            'material_id' => $input['material_id'],//物料id
            'loss_rate' => $input['loss_rate'],
            'bom_group_id' => $input['bom_group_id'],
            'qty' => $input['qty'],
            'description' => $input['description'],
            'creator_id' => $creator_id,
            'attachments' => json_encode($input['attachments']),
            'bom_tree' => json_encode($input['bom_tree']),
            'differences' => $input['differences'],
            'item_material_path' => 'test',
            'replace_material_path' => 'test',
            'ctime' => time(),//创建时间
            'routing_package' => isset($input['routing_package']) ? $input['routing_package'] : '',//所有工艺路线信息
            'workhour_package'=> isset($input['workhour_package'])? $input['workhour_package']: '',//所有工时信息
            'from' => $from
        ];
        //入库
        $insert_id = DB::connection($this->connection)->table($this->table)->insertGetId($data);
        if (!$insert_id) TEA('802');
        //添加日志
        $events = [
            'field' => 'manufacture_bom_id',
            'from' => '0',
            'to' => $insert_id,
            'action' => 'add',
            'desc' => '添加制造BOM[' . $input['name'] . ']基础信息',
        ];
        Trace::save($this->table, $insert_id, $creator_id, $events);
        return $insert_id;
    }
    //endregion

    //region 删
    public function destroy($input)
    {
        $this->checkRules($input);
        $id = $input[$this->apiPrimaryKey];
        //TODO 已经用过不能删除
        $bom = DB::connection($this->connection)->table($this->table)->where('id', '=', $id)->first();
        $num = $this->destroyById($id, $this->table, $this->connection);
        if ($num === false) TEA('803');
        if (empty($num)) TEA('404');
        $events = [
            'field' => 'attachment_id',
            'from' => $id,
            'to' => 0,
            'comment' => '制造Bom',
            'action' => 'delete',
            'extra' => '',
            'desc' => '删除制造Bom[' . $bom->name . ']',
        ];
        //$creator_id = $this->getUserFieldByCookie($input['cookie'],'id');
        $creator_id = (!empty(session('administrator')->admin_id)) ? session('administrator')->admin_id : 0;
        Trace::save($this->table, $id, $creator_id, $events);
        return [$this->apiPrimaryKey => $id];;
    }

    //endregion

    //region 额外
    /**
     * 对比
     * @param $bom_tree
     * @param $real_tree
     * @param $input
     */
    public function check($bom_tree, $real_tree, &$input)
    {
        $collection = array();
        $bomTree = new CheckBomItem($bom_tree, $real_tree);

        $this->doCheck($input, 'master', 'update', $collection);


        $this->doCheck($bomTree, 'item', 'add', $collection);
        $this->doCheck($bomTree, 'item', 'update', $collection);
        $this->doCheck($bomTree, 'item', 'delete', $collection);

        $this->doCheck($bomTree, 'qty', 'add', $collection);
        $this->doCheck($bomTree, 'qty', 'update', $collection);
        $this->doCheck($bomTree, 'qty', 'delete', $collection);

        $this->doCheck($bomTree, 'replace_qty', 'add', $collection);
        $this->doCheck($bomTree, 'replace_qty', 'update', $collection);
        $this->doCheck($bomTree, 'replace_qty', 'delete', $collection);

        $this->doCheck($bomTree, 'replace', 'add', $collection);
        $this->doCheck($bomTree, 'replace', 'update', $collection);
        $this->doCheck($bomTree, 'replace', 'delete', $collection);

        $input['differences'] = json_encode($collection);
        $input['item_material_path'] = $bomTree->item_material_path;
        $input['replace_material_path'] = $bomTree->replace_material_path;
    }

    /**
     * 检验方法
     * @param $data
     * @param $type
     * @param $way
     * @param $collection
     */
    public function doCheck($data, $type, $way, &$collection)
    {
        switch ($type) {
            case 'master':
                $fields = ['name', 'bom_group_id', 'qty', 'loss_rate', 'description'];
                //$bom = DB::table(config('alias.rb'))->where('material_id', '=', $data['material_id'])->first();
                //母件的损耗率 BOM分组 描述 基础数量 BOM名称 从制造BOM取 Modify by Bruce.Chu in 2018-08-13
                $bom = DB::table(config('alias.rmb'))->where('id', '=', $data['manufacture_bom_id'])->first();
                foreach ($fields as $row) {
                    if ($data[$row] != $bom->$row) {
                        if ($row == 'bom_group_id') {
                            if ($bom->$row == 0) {
                                $group_old = new \stdClass();
                                $group_old->name = '""';
                            } else {
                                $group_old = DB::table(config('alias.rbg'))->select('name')->where('id', '=', $bom->$row)->first();
                            }
                            if ($data[$row] == 0) {
                                $group_new = new \stdClass();
                                $group_new->name = '""';
                            } else {
                                $group_new = DB::table(config('alias.rbg'))->select('name')->where('id', '=', $data[$row])->first();
                            }


                            $data[$row] = $group_new->name;
                            $bom->$row = $group_old->name;
                        }
                        $tmp = [
                            'action' => $way,
                            'extra' => $type,
                            'value' => [$row => $bom->$row . '=>' . $data[$row]],
                            'desc' => $this->getDesc($way, [$row => '[' . $bom->$row . ']变为[' . $data[$row] . ']'], $type)
                        ];
                        array_push($collection, $tmp);
                    }
                }
                break;
            case 'item':
                $element = $way;
                if (!empty($data->$element)) {
                    foreach ($data->$element as $key => $value) {
                        $item_no = $way == 'delete' ? $data->$element[$key]['item_no'] : $data->deal[$key]['item_no'];
                        $tmp = [
                            'item_no' => $item_no,
                            'action' => $way,
                            'extra' => $type,
                            'value' => $value,
                            'desc' => $this->getDesc($way, $value, $type, ['item_no' => $item_no])
                        ];
                        array_push($collection, $tmp);
                    }
                }
                break;
            case 'qty':
                $element = $type . '_' . $way;
                if (!empty($data->$element)) {
                    foreach ($data->$element as $key => $value) {
                        foreach ($value as $k => $v) {
                            $tmp = [
                                'item_no' => $data->deal[$key]['item_no'],
                                'action' => $way,
                                'extra' => $type,
                                'value' => $v,
                                'desc' => $this->getDesc($way, $v, $type, ['item_no' => $data->deal[$key]['item_no']])
                            ];
                            array_push($collection, $tmp);
                        }
                    }
                }
                break;
            case 'replace':
                $element = $type . '_' . $way;
                if (!empty($data->$element)) {
                    foreach ($data->$element as $key => $value) {
                        foreach ($value as $k => $v) {
                            if ($way == 'delete') {
                                $tmp_data = $data->real;
                            } else {
                                $tmp_data = $data->deal;
                            }
                            $tmp = [
                                'item_no' => $tmp_data[$key]['item_no'],
                                'replace_item_no' => $tmp_data[$key]['replaces'][$k]['item_no'],
                                'action' => $way,
                                'extra' => $type,
                                'value' => $v,
                                'desc' => $this->getDesc($way, $v, $type, ['item_no' => $tmp_data[$key]['item_no'], 'replace_item_no' => $tmp_data[$key]['replaces'][$k]['item_no']])
                            ];
                            array_push($collection, $tmp);
                        }
                    }
                }
                break;
            case 'replace_qty':
                $element = $type . '_' . $way;
                if (!empty($data->$element)) {
                    foreach ($data->$element as $key => $value) {
                        foreach ($value as $k => $v) {
                            foreach ($v as $k1 => $v1) {
                                $tmp = [
                                    'item_no' => $data->deal[$key]['item_no'],
                                    'replace_item_no' => $data->deal[$key]['replaces'][$k]['item_no'],
                                    'action' => $way,
                                    'extra' => $type,
                                    'value' => $v1,
                                    'desc' => $this->getDesc($way, $v, $type, ['item_no' => $data->deal[$key]['item_no'], 'replace_item_no' => $data->deal[$key]['replaces'][$k]['item_no']])
                                ];
                                array_push($collection, $tmp);
                            }

                        }
                    }
                }
                break;
        }
    }

    /**
     * 校验附件
     * @param $data
     * @param $collection
     */
    public function checkAttach($data, &$collection)
    {
        $add_ids = array();
        $delete_ids = array();
        $update_ids = array();
        $bom = DB::table(config('alias.rb'))->where('material_id', '=', $data['material_id'])->first();
        $bom_attach = DB::table(config('alias.rba'))->where('bom_id', '=', $bom->material_id)->get();
        $deal = array();
        $real = array();
        foreach ($bom_attach as $row) {
            $real[$row->attachment_id] = $row->comment;
        }
        foreach (json_decode($data['attachments']) as $row) {
            $deal[$row['attachment_id']] = $row['comment'];
        }
        //根据key进行的计算
        //deal有的real没得为新增 （差集）
        $add = array_diff_key($deal, $real);
        //real有的deal没得为删除  （差集）
        $delete = array_diff_key($real, $deal);
        //不变的就继续往下判断  （交集）
        $update = array_intersect_key($deal, $real);

        foreach ($add as $key => $value) {
            $add_ids[] = $key;
        }

        if (!empty($add_ids)) {
            $value = obj2array(DB::table(config('alias.rba'))->select('id', 'name')->whereIn('id', $add_ids)->get());
            foreach ($value as $row) {
                $tmp = array(
                    'action' => 'add',
                    'extra' => 'attach',
                    'value' => $row,
                    'desc' => $this->getDesc('add', $row, 'attach')
                );
                array($collection, $tmp);
            }

        }

        foreach ($delete as $key => $value) {
            $delete_ids[] = $key;
        }

        if (!empty($delete_ids)) {
            $value = obj2array(DB::table(config('alias.rba'))->select('id', 'name')->whereIn('id', $delete_ids)->get());
            foreach ($value as $row) {
                $tmp = array(
                    'action' => 'delete',
                    'extra' => 'attach',
                    'value' => $row,
                    'desc' => $this->getDesc('delete', $row, 'attach')
                );
                array($collection, $tmp);
            }

        }
        foreach ($update as $key => $value) {
            if ($deal[$key] != $real[$key]) {
                $attach = DB::table(config('alias.rba'))->select('id', 'name')->where('id', '=', $key)->first();
                $row = ['name' => $attach->name, 'comment' => $real[$key] . '=>' . $deal[$key]];
                $tmp = array(
                    'action' => 'delete',
                    'extra' => 'attach',
                    'value' => $row,
                    'desc' => $this->getDesc('delete', $row, 'attach')
                );
                array($collection, $tmp);
            }
        }
    }

    public function getDesc($way, $value, $type = '', $extra = array())
    {
        $config = config('dictionary');
        $desc = '';
        switch ($type) {
            case 'master':
                foreach ($value as $k => $v) {
                    $desc = "将基础信息 " . $config[$type][$k] . "的值由" . $v;
                }
                break;
            case 'item':
                $tmp = '';
                if ($way == 'update') {
                    foreach ($value as $k => $v) {
                        $tmp = $tmp . " " . $config[$type][$k] . "的值由" . $v;
                    }
                }
                $desc = "项中物料编码为" . $extra['item_no'] . " " . $tmp;
                break;
            case 'qty':
                $tmp = '';
                foreach ($value as $k => $v) {
                    if (array_key_exists($k, $config[$type])) {
                        if ($way == 'update') {
                            $tmp = $tmp . " " . $config[$type][$k] . "的值由" . $v;
                        } else {
                            $tmp = $tmp . " " . $config[$type][$k] . "的值 [" . $v . "]";
                        }

                    }
                }
                $desc = "项中物料编码为" . $extra['item_no'] . "的阶梯用量 " . $tmp;
                break;
            case 'replace':
                $tmp = '';
                if ($way == 'update') {
                    foreach ($value as $k => $v) {
                        $tmp = $tmp . " " . $config[$type][$k] . "的值由" . $v;
                    }
                }
                $desc = "项中物料编码为" . $extra['item_no'] . "的替换物料" . $extra['replace_item_no'] . " " . $tmp;
                break;
            case 'replace_qty':
                $tmp = '';
                foreach ($value as $k => $v) {
                    foreach ($v as $k1 => $v1) {
                        if (array_key_exists($k1, $config[$type])) {
                            $tmp = $tmp . " " . $config[$type][$k1] . "的值" . $v1;
                        }
                    }
                }
                $desc = "项中物料编码为" . $extra['item_no'] . "的替换物料" . $extra['replace_item_no'] . "的阶梯用量 " . $tmp;
                break;
            case 'attach':
                $tmp = '';
                if ($way == 'update') {
                    $tmp = "描述的值由 " . $value['comment'];
                }
                $desc = "附件[" . $value['name'] . "] " . $tmp;
                break;
            default:
                $desc = "";
        }


        return $desc;
    }

    //endregion

    /**
     * 比较前端传递的BOM树与真实的BOM树 工序能力 组装
     * @param $bom_tree
     * @param $real_tree
     * @return array
     * @author Bruce.Chu
     */
    public function easyCheck($input_tree,$real_tree)
    {
        //前端传递BOM树
        $array_one = [
            'operation' => [
                'operation_id' => $input_tree['operation_id'],
                'operation_ability' => $input_tree['operation_ability'],
                'operation_ability_pluck' => json_encode($this->twoDemension2One($input_tree['operation_ability_pluck']))
            ],
            'assembly' => array_column($input_tree['children'],'is_assembly','item_no')
        ];
        //真实BOM树
        $array_two = [
            'operation' => [
                'operation_id' => $real_tree['operation_id'],
                'operation_ability' => $real_tree['operation_ability'],
                'operation_ability_pluck' => json_encode(empty($real_tree['operation_ability_pluck'])?[]:$real_tree['operation_ability_pluck'])
            ],
            'assembly' => array_column($real_tree['children'],'is_assembly','item_no')
        ];

        $off_checks = [
            'operation' => array_diff_assoc($array_one['operation'], $array_two['operation']),
            'assembly' => array_diff_assoc($array_one['assembly'], $array_two['assembly'])
        ];
        return array_filter($off_checks);
    }

    /**
     * BOM树添加子项(BOM/物料) / 子项添加替代物料
     * @param $insert
     * @param $bom_id  => 父项BOM的bom_id
     * @param $kind    => 标识是添加子项还是添加替代物料 add / replace
     * @return array
     * @author Bruce.Chu
     */
    public function insertManufactureBomTree($insert,$bom_id,$kind)
    {
        $new_son = [];
        $new_son['material_id'] = $insert->material_id;
        $new_son['name'] = $insert->name;
        $new_son['item_no'] = $insert->item_no;
        //拿物料分类id 物料分类名称 单位
        $material_info = DB::table(config('alias.rm') . ' as rm')
            ->leftJoin(config('alias.rmc') . ' as rmc', 'rm.material_category_id', 'rmc.id')
            ->leftJoin(config('alias.uu') . ' as uu', 'rm.unit_id', 'uu.id')
            ->select('rm.material_category_id', 'rmc.name  as material_category_name', 'uu.label as unit', 'uu.commercial', 'uu.id as unit_id')
            ->where('rm.id', $insert->material_id)
            ->first();
        $new_son['material_category_id'] = $material_info->material_category_id;
        $new_son['bom_item_id'] = $insert->bom_item_id;
        $new_son['bom_id']=$bom_id;
        $new_son['loss_rate'] = $insert->loss_rate;
        $new_son['is_assembly'] = $insert->is_assembly;
        $new_son['usage_number'] = $insert->usage_number;
        $new_son['total_consume'] = $insert->total_consume;
        $new_son['parent_id']=0;
        $new_son['comment'] = $insert->comment;
        $new_son['version'] = $insert->version;
        $new_son['unit'] = $material_info->unit;
        $new_son['commercial'] = $material_info->commercial;
        $new_son['unit_id'] = $material_info->unit_id;
        $new_son['has_bom'] = $insert->has_bom;
        $new_son['bom_item_qty_levels'] = [];
        //替身是不可能有替身的 这辈子不可能有替身的 只有添加项才有替身
        if($kind=='add'){
            $new_son['replaces']=[];
            if(!empty($insert->replaces)){
                foreach ($insert->replaces as $key=>$replace){
                    $new_son['replaces'][$key]= $this->insertManufactureBomTree($replace,$bom_id,'replace');
                }
            }
        }
        $new_son['children']=[];
        if ($insert->has_bom) {//子项为BOM
            $new_son['versions']=DB::table(config('alias.rb'))->where('material_id','=',$insert->material_id)->pluck('version');
            $bom = new Bom();
            $bom_operation=$bom->getBomOperation($insert->material_id,$insert->version);
            //注意半成品后来添加Bom结构的一个问题
            if(!empty($bom_operation) && !in_array($insert->material_id,[])) {
                $father_materials[] = $insert->material_id;
                //是否有工艺路线
                $new_son['has_route'] = $this->isExisted([['bom_id','=',$bom_operation->bom_id]],config('alias.rbr'));
                //子BOM的工序 能力
                $new_son['operation_id']=!empty($bom_operation->operation_id)?$bom_operation->operation_id:0;
                $new_son['operation_name']=!empty($bom_operation->operation_name)?$bom_operation->operation_name:'';
                $new_son['operation_ability']=isset($bom_operation->operation_ability)?$bom_operation->operation_ability:'';
                $new_son['operation_ability_pluck']=isset($bom_operation->operation_ability_pluck)?$bom_operation->operation_ability_pluck:[];
                //递归把儿子信息都拼接进去 新添加项并没有真实存入bom_item表
                $new_son['children']=$bom->getParentItemSons($bom_operation->bom_id,$replace=TRUE,$bom_item_qty_level=False,$father_materials);
            }
        } else {//子项为物料
            $materialDao = new Material();
            //物料附件
            $new_son['attachment'] = $materialDao->getMaterialAttachments($insert->material_id);
        }
        return $new_son;
    }

    /**
     * 编辑生产订单 更新拆单可用的制造BOM 更新BOM名称 基础数量 损耗率 工序 能力 描述 子项(添加/删除/更新) 子项替代物料(添加/删除/更新)
     * 不推荐 生产应以BOM为基准 工艺,BOM不同的生产单应该升级BOM版本 这里属于快照 只是强制拼接制造BOM树 并没有真实向数据库添加/删除/更新上述的数据
     * @param $input
     * @return array|bool
     * @author Bruce.Chu
     */
    public function update($input)
    {
        $this->checkRules($input);
        $creator_id = (!empty(session('administrator')->admin_id)) ? session('administrator')->admin_id : 0;
        //前端传递的BOM树
        $bom_tree = $input['bom_tree'];
        //拆单可用的BOM树 快照信息 制造BOM树
        $real_tree=$this->getRecordById($input['manufacture_bom_id'],'bom_tree',config('alias.rmb'));
        $real_tree=json_decode($real_tree->bom_tree);
        $this->check($bom_tree['children'], obj2array($real_tree->children), $input);
        //check函数可监测到的变动 包括name loss_rate qty description 子项(添加/删除/更新/替换物料)
        $on_checks = json_decode($input['differences']);
        //统一转换为数组 进行操作
        $tree_to_array = obj2array($real_tree);
        //check函数监测不到的变动 包括BOM母件的工序/能力 已有项的组装与去除组装
        $off_checks = $this->easyCheck($input['bom_tree'], $tree_to_array);
        //没有任何变动 出去
        if (empty($on_checks) && empty($off_checks)) return true;
        $data = [
            'bom_group_id' => $input['bom_group_id'],//BOM分组
            'creator_id' => $creator_id,
            'attachments' => json_encode($input['attachments']),//BOM附件
            'differences' => $input['differences'],//check函数监测到的变动
            'item_material_path' => $input['item_material_path'],//子项
            'replace_material_path' => $input['replace_material_path'],//替换物料
        ];
        //BOM母件的工序/能力变动
        if (!empty($off_checks['operation'])) {
            //这里也不用foreach了
            $tree_to_array = array_merge($tree_to_array, $off_checks['operation']);
            $tree_to_array['operation_ability_pluck'] = json_decode($tree_to_array['operation_ability_pluck']);
        }
        //已有项的组装与去除组装
        if (!empty($off_checks['assembly'])) {
            foreach ($tree_to_array['children'] as $key => $value) {
                if (array_key_exists($value['item_no'], $off_checks['assembly'])) $tree_to_array['children'][$key]['is_assembly'] = $off_checks['assembly'][$value['item_no']];
            }
        }
        //check函数监测到的变动 细分
        if (!empty($on_checks)) {
            //母件更新 不参与遍历 直接赋值更新
            $data['name'] = $input['name'];//BOM名称
            $tree_to_array['name'] = $input['name'];
            $data['loss_rate'] = $input['loss_rate'];//损耗率
            $tree_to_array['loss_rate'] = $input['loss_rate'];
            $data['qty'] = $input['qty'];//基础数量
            $tree_to_array['usage_number'] = $input['qty'];
            $data['description'] = $input['description'];//描述
            foreach ($on_checks as $value) {
                //儿子们 [0=>[key=>value,...],...] 数组格式
                $children_to_array = $tree_to_array['children'];
                switch ($value->extra) {
                    //子项操作 更新$tree_to_array['children']
                    case 'item':
                        //将儿子们的物料编码收集起来 匹配下面的操作
                        $item_no_column = array_column($children_to_array, 'item_no');
                        //该操作针对于哪个儿子 索引数组的key
                        $children_key = array_search($value->item_no, $item_no_column);
                        switch ($value->action) {
                            //子项更新
                            case 'update':
                                //取消内外两层foreach 先把需要更新的key=>value 整理成数组 以便替换
                                $updates = array_map(function ($va) {
                                    //拿最后一个[]包裹的值 即更新值
                                    $va = trim(strrchr($va, '['), '[]');
                                    return $va;
                                }, obj2array($value->value));
                                $children_to_array[$children_key] = array_merge($children_to_array[$children_key], $updates);
                                break;
                            //子项删除
                            case 'delete':
                                unset($children_to_array[$children_key]);
                                break;
                            //子项添加
                            case 'add':
                                //子项拼接为拆单可用的制造BOM 前端已传参即用 未传参需要拿
                                $new_son = $this->insertManufactureBomTree($value->value, $tree_to_array['bom_id'], 'add');
                                $children_to_array[]=$new_son;
                                break;
                        }
                        break;
                    //替代物料操作 更新$tree_to_array['children'][index]['replaces']
                    case 'replace':
                        //将儿子们的物料编码收集起来 匹配下面的操作
                        $item_no_column = array_column($children_to_array, 'item_no');
                        //该操作针对于哪个儿子 索引数组的key
                        $children_key = array_search($value->item_no, $item_no_column);
                        //将儿子的替代物料编码收集起来 匹配下面的操作
                        $replace_item_no_column = array_column($children_to_array[$children_key]['replaces'], 'item_no');
                        //该操作针对于儿子的哪个替代物料 索引数组的key
                        $replace_key = array_search($value->replace_item_no, $replace_item_no_column);
                        switch ($value->action) {
                            //替代物料更新
                            case 'update':
                                //取消内外两层foreach 先把需要更新的key=>value 整理成数组 以便替换
                                $updates = array_map(function ($va) {
                                    //拿最后一个[]包裹的值 即更新值
                                    $va = trim(strrchr($va, '['), '[]');
                                    return $va;
                                }, obj2array($value->value));
                                $children_to_array[$children_key]['replaces'][$replace_key] = array_merge($children_to_array[$children_key]['replaces'][$replace_key], $updates);
                                break;
                            //替代物料删除
                            case 'delete':
                                unset($children_to_array[$children_key]['replaces'][$replace_key]);
                                //索引数组重置索引 从0排序
                                array_values($children_to_array[$children_key]['replaces']);
                                break;
                            //替代物料添加
                            case 'add':
                                $replace = $this->insertManufactureBomTree($value->value, $tree_to_array['bom_id'], 'replace');
                                $children_to_array[$children_key]['replaces'][] = $replace;
                        }
                        break;
                }
                //索引数组重置索引 从0排序
                $tree_to_array['children'] = array_values($children_to_array);
            }
        }
        $data['bom_tree'] = json_encode($tree_to_array);
        //入库
        $upd = DB::table($this->table)->where($this->primaryKey, $input[$this->apiPrimaryKey])->update($data);
        if ($upd === false) TEA('806');
    }

    /**
     * Ruik之前的更新 依旧保存 以备恢复
     * @param $input
     */
    public function update_old($input)
    {
        $this->checkRules($input);
        $creator_id = (!empty(session('administrator')->admin_id)) ? session('administrator')->admin_id : 0;
        $bom_tree = $input['bom_tree'];
        $bom = new Bom();
        $real_tree  = $bom->getBomTree($input['material_id'],$input['version'],true,true);
        $this->check($bom_tree['children'],obj2array($real_tree->children),$input);
        $data = [
            'code'=>$input['code'],//bom编码
            'name'=>$input['name'],//名称
            'version'=>$input['version'],//版本
            'version_description'=>$input['version_description'],//版本介绍
            'material_id'=>$input['material_id'],//物料id
            'loss_rate'=>$input['loss_rate'],
            'bom_group_id'=>$input['bom_group_id'],
            'qty'=>$input['qty'],
            'description'=>$input['description'],
            'creator_id'=>$creator_id,
            'attachments'=>json_encode($input['attachments']),
            'bom_tree'=>json_encode($input['bom_tree']),
            'differences' => $input['differences'],
            'item_material_path' =>$input['item_material_path'],
            'replace_material_path'=>$input['replace_material_path'],
        ];
        //入库
        $upd= DB::table($this->table)->where($this->primaryKey,$input[$this->apiPrimaryKey])->update($data);
        if($upd===false) TEA('806');
    }
}