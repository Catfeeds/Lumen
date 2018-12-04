<?php
/**
 * Created by PhpStorm.
 * User: xujian
 * Date: 17/9/25
 * Time: 下午17:49
 */

namespace App\Http\Models;//定义命名空间
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Session;//引入DB操作类

/**
 * 做法
 * Class Practice
 * create by xin.min 20180411
 * @package App\Http\Models
 */
class Practice extends Base
{
    protected $time;
    protected $datetime;
    protected $table;
    protected $operation;
    protected $mcTable;
    protected $pfTable;
    protected $fTable;
    protected $faTable;
    protected $ofTable;
    protected $rbrb;
    protected $rioa;
    protected $lTable;
    protected $plTable;
    protected $uTable;
    protected $puTable;
    protected $dTable;
    protected $daTable;
    protected $aTable;
    protected $pdTable;
    protected $rpt;
    protected $rppt;
    protected $cTable;
    protected $EnCode;

    public function __construct()
    {
        $this->table = config('alias.rp');//做法表
        $this->operation = config('alias.rio');//工序表(做法模板表)
        $this->mcTable = config('alias.rmc');//物料分类表
        $this->aTable = config('alias.ria');//能力表
        $this->fTable = config('alias.rpf');//做法字段表
        $this->ofTable = config('alias.riopf');//做法模板-做法字段关系表;
        $this->pfTable = config('alias.rppf');//做法_做法字段关系表
        $this->rbrb = config('alias.rbrb');//bom绑定做法;
        $this->rioa = config('alias.rioa');//工序-能力表;
        $this->uTable = config('alias.rpu');//用处表;
        $this->puTable = config('alias.rppu');//做法-用处关系表 add by xin 20180510
        $this->dTable = config('alias.rdr');//图纸表
        $this->daTable = config('alias.rda');//图纸-属性关系表;
        $this->aTable = config('alias.rdad');//图纸属性表;
        $this->pdTable = config('alias.rpd');//做法-图纸关系表;
        $this->faTable = config('alias.rpfa');//做法字段_能力关系表  暂时无用
        $this->lTable = config('alias.rpl');//做法表;  暂时无用
        $this->plTable = config('alias.rppl');//做法-做法表关系表;
        $this->rpt = config('alias.rpt');//产品细分类表;
        $this->rppt = config('alias.rppt');//做法-产品细分类关系表;
        $this->cTable = config('alias.rpc');//做法分类表; add by xin 20180514

        $this->EnCode = new Encoding\EncodingSetting();
        $this->time = time();
        $this->datetime = date('Y-m-d H:i:s', $this->time);
    }

    /**获取全部做法;
     * @param
     * @return
     * @author
     */
    public function index()
    {
        $results = DB::table($this->table)->get();
        return $results;
    }

    /**检查做法模板id是否正常/正确
     * @param * @param $input
     * @return
     * @author
     */
    public function checkIndexBO($input)
    {
        if (!isset($input['operation_id'])) TEA('700', 'operation_id');
        $where = [['id', '=', $input['operation_id']]];
        $has = $this->isExisted($where, $this->operation);
        if (!$has) TEA('700', 'operation_id');
    }

    /**根据做法模板id获取该做法模板所有做法;
     * @param $input
     * @return
     * @author
     */
    public function indexByOperation($input)
    {
        $results = DB::table($this->table)
            ->where('operation_id', '=', $input['operation_id'])
            ->get();
        return $results;
    }

    /**检查做法模板id是否正常/正确, name, description是否正常;
     * @param $input
     * @return
     * @author
     */
    public function checkIndexBC($input)
    {
        if (!isset($input['operation_id'])) TEA('700', 'operation_id');
        if (!isset($input['name'])) TEA('700', 'name');//缺失名字
//        if (!isset($input['description'])) TEA('700', 'description');//缺失用处描述
        if (!isset($input['description_id'])) TEA('700', 'description_id');//缺失用处描述

        //做法模板id是否正常;
        $where = [['id', '=', $input['operation_id']]];
        $has = $this->isExisted($where, $this->operation);
        if (!$has) TEA('700', 'operation_id');


    }

    /**根据做法模板id和查询条件获取符合查询条件的做法;
     * @param $input
     * @return
     * @author
     */
    public function indexByCondition($input)
    {
        $where = [['operation_id', '=', $input['operation_id']]];
        if (!empty($input['name'])) $where[] = ['name', 'like', '%' . $input['name'] . '%'];//做法名
        //条件只有name(做法名)
        $ret = DB::table($this->table)->where($where);
        
        //根据做法用处检索 add by xin 20180605
        if (!empty($input['description_id'])) {
//            return explode(',',$input['description_id']);
            $description_ids = explode(',', $input['description_id']);
            //根据用处id集合查practice_id交集;以数组形式返回交集结果;
            $practice_ids = DB::table(DB::raw('(select practice_id from ruis_practice_practice_use where use_id in (' . $input['description_id'] . ') ) as a'))
                ->groupBy('a.practice_id')
                ->having(DB::raw('count(a.practice_id)'), count($description_ids))
//                ->toSql();
                ->pluck('a.practice_id');
            $ret = $ret->whereIn('id', $practice_ids);
        }

        //做法code; add by xin 20180528
        if (!empty($input['practice_code'])) {
            $where = [['code', 'like', '%' . $input['practice_code'] . '%']];
            $ret = $ret->where($where);
        }
        //做法分类id;
        if (!empty($input['practice_category_id'])) {
            $ret = $ret->where('practice_category_id', '=', $input['practice_category_id']);
        }
        //产品分类id;
        if (!empty($input['product_type_id'])) {
            $ret = $ret->where('product_type_id', '=', $input['product_type_id']);
        }
        //获取搜索结果
//        $results = $ret->toSql();
        $results = $ret->get();
        return $results;
    }

    /**编码唯一性检测
     * @param $input
     * @return
     * @author
     */
    public function checkCodeUnique($input)
    {
        if (!isset($input['code'])) TEA('700', 'code');//缺失编码
        $where = [['code', '=', $input['code']]];
        $has = $this->isExisted($where, $this->table);
        return ['exist' => $has, 'field' => 'code', 'value' => $input['code']];
    }

    /**添加做法判断字段是否正确
     * @param $input
     * @return
     * @author
     */
    public function checkAddAFields($input)
    {
        if (!isset($input['practice_id'])) TEA('700', 'practice_id');//缺失做法id
        if (!isset($input['field_id'])) TEA('700', 'field_id');//缺失做法字段id;

        //判断做法id是否正常/正确
        $where = [['id', '=', $input['practice_id']]];
        $has = $this->isExisted($where, $this->table);
        if (!$has) TEA('700', 'practice_id');


        //判断做法字段id是否正常/正确
        $operation_id = DB::table($this->table)->select('operation_id')->where($where)->first();//获取operation_id
        $where = [['practice_field_id', '=', $input['field_id']], ['operation_id', '=', $operation_id->operation_id]];
        $has = $this->isExisted($where, $this->ofTable);
        if (!$has) TEA('700', 'field_id');

    }

    /**添加一条做法字段;
     * @param $input
     * @return
     * @author
     */
    public function addAFields($input)
    {
        $data = [];
        $data['practice_id'] = $input['practice_id'];
        $data['field_id'] = $input['field_id'];
        $data['ctime'] = $this->datetime;
        $data['order'] = 0;//默认order, 后面会强制要求用户填写order,这个0会被覆盖成用户填写的;
        $data['creator_id'] = Session::get('administrator')->admin_id;
        //插入并返回插入的pfid;
        return DB::table($this->pfTable)->insertGetId($data);
    }

    /**检查做法是否已被bom绑定使用
     * @param $input
     * @return
     * @author
     */
    public function hasUsed($input)
    {
        if (!isset($input['practice_id'])) TEA('700', 'practice_id');//缺失做法id
        $where = [['practice_id', '=', $input['practice_id']]];
        $has = $this->isExisted($where, $this->rbrb);
        $results = ['exist' => $has, 'field' => 'practice_id', 'value' => $input['practice_id']];
        return $results;
    }

    /**检查  做法新建做法字段;
     * @param $input
     * @return
     * @author
     */
    public function checkStoreFields($input)
    {
        if (!isset($input['name'])) TEA('700', 'name');//缺失名称
        if (!isset($input['operation_id'])) TEA('700', 'operation_id');//缺失所属工序id(做法模板id)
        if (!isset($input['m_c_id'])) TEA('700', 'material_category_id');//缺失物流分类id
//        if (!isset($input['description'])) TEA('700', 'description');//缺失做法用处描述 add by xin 20180418
        if (!isset($input['description_ids'])) TEA('700', 'description_ids');//缺失做法用处描述ids add by xin 20180510
        if (!isset($input['images'])) TEA('700', 'images');//缺失图纸id集合    add by xin 20180426
        if (!isset($input['product_type_id'])) TEA('700', 'product_type_id');//缺失产品细分类id   add by xin 20180502
        if (!isset($input['practice_category_id'])) TEA('700', 'practice_category_id');//缺失做法分类id  add by xin 20180514
        if (!isset($input['fields']) || empty($input['fields'])) TEA('700', 'field_id');//缺失做法字段id集合

        //做法分类id是否正常;  add by xin 20180514
        if (!empty($input['practice_category_id'])) {
            $where = [['id', '=', $input['practice_category_id']]];
            $has = $this->isExisted($where, $this->cTable);
            if (!$has) TEA('700', 'practice_category_id');
        }

        //产品细分类id是否正常
        if (!empty($input['product_type_id'])) {
            $where = [['id', '=', $input['product_type_id']]];
            $has = $this->isExisted($where, $this->rpt);
            if (!$has) TEA('700', 'product_type_id');
        }

        //用处id是否正常;
        if (!empty($input['description_ids'])) {
            $description_ids = json_decode($input['description_ids']);
            foreach ($description_ids as $key => $value) {
                $where = [['id', '=', $value]];
                $has = $this->isExisted($where, $this->uTable);
                if (!$has) TEA('700', 'description and description_id');
            }
            unset($key);
            unset($value);
        }


        //图纸id是否正常;
        if (!empty($input['images'])) {
            $allimageids = DB::table($this->dTable)->pluck('id')->toArray();
            $checkImageIds = [];
            $inputImgs = json_decode($input['images']);
            foreach ($inputImgs as $key => $value) {
                $checkImageIds[] = $value->img_id;
            }
        }
        $imgDiff = array_diff($checkImageIds, $allimageids);
        if (count($imgDiff) > 0) {
            return get_api_response('700', 'images', $imgDiff);//做法库图纸id有异常;
        }


        //工序id是否正常/正确
        $where = [['id', '=', $input['operation_id']]];
        $has = $this->isExisted($where, $this->operation);
        if (!$has) TEA('700', 'operation_id');

        //物料分类id是否正常/正确;
        $where = [['id', '=', $input['m_c_id']]];
        $has = $this->isExisted($where, $this->mcTable);
        if (!$has) TEA('700', 'material_category_id');

        //验证做法字段是否正常/正确;
        //获取input的所有做法字段;
        if (empty($input['fields'])) TEA('700', 'fields');
        $fields = [];
        $tmp = json_decode($input['fields']);
//        return $tmp;
        foreach ($tmp as $key => $value) {
            $fields[] = $value->field_id;
        }
        unset($key);
        unset($value);

        //获取该做法模板的所有做法字段id;
        $tmp = DB::table($this->ofTable)->select('practice_field_id')->where('operation_id', '=', $input['operation_id'])->get();//所有可用的practice_field_id
        $hasFields = [];//所有做法字段id;
        foreach ($tmp as $key => $value) {
            $hasFields[] = $value->practice_field_id;
        }
        //比对hasFields里面的值和fields里面的值,如果fields里面有不存在于hasFields里面的值, 则以数组形式返回;
        $diff = array_diff($fields, $hasFields);
        if (count($diff) > 0) {
            return get_api_response('700', 'field_id', $diff);//做法字段有问题;
        } else {
            return true;//做法字段没问题返回true;
        }


    }

    /**(新建做法)做法根据operation_id关联做法字段
     * @param $input
     * @return
     * @author
     */
    public function storeFields($input)
    {
//        return $input;
        //判断做法code是否唯一;
        if (!isset($input['code'])) TEA('700', 'code');
        $where = [['code', '=', $input['code']]];
        $has = $this->isExisted($where, $this->table);
        if ($has) TEA('700', 'code');
        $creator_id = Session::get('administrator')->admin_id;
        //基础数据插入;
        $dataBase = [];
        $dataBase['name'] = $input['name'];
        $dataBase['operation_id'] = $input['operation_id'];
        $dataBase['m_c_id'] = $input['m_c_id'];
        $dataBase['ctime'] = $this->datetime;
//        $dataBase['description'] = empty($input['description']) ? '' : trim($input['description']);//做法用处描述 add by xin 20180418
//        $dataBase['description_id'] = empty($input['description_id']) ? '' : trim($input['description_id']);//做法用处描述id add by xin 20180425
        $dataBase['product_type_id'] = empty($input['product_type_id']) ? '' : trim($input['product_type_id']);//产品细分类id add by xin 20180502
        $dataBase['practice_category_id'] = empty($input['practice_category_id']) ? 0 : trim($input['practice_category_id']);//做法分类id add by xin 20180514
        //处理编码;
        $code = $this->EnCode->useEncoding(8, $input['code']);
        $dataBase['code'] = $code;
//        $dataBase['code']=$input['code'];
        //获取管理员数据
        $dataBase['creator_id'] = $creator_id;
        //基础数据(practice表)插入;
        $practice_id = DB::table($this->table)->insertGetId($dataBase);
//        return $practice_id;

        //处理用处, 并插入做法-用处关系表;add by xin 20180510
        if (!empty($input['description_ids'])) {
            $description_ids = json_decode($input['description_ids']);
            $dataDesc = [];

            foreach ($description_ids as $key => $value) {
                $dataDesc[] = [
                    'practice_id' => $practice_id,
                    'use_id' => $value,
                    'creator_id' => $creator_id,
                    'create_time' => $this->datetime
                ];
            }
            unset($key);
            unset($value);
            DB::table($this->puTable)->insert($dataDesc);
        }

        //处理图纸数据,并插入做法-图纸关系表; add by xin 20180426
        if (!empty($input['images'])) {
            $dataImg = [];
            $img = json_decode($input['images']);
            foreach ($img as $key => $value) {
                $dataImg[] = [
                    'practice_id' => $practice_id,
                    'drawing_id' => $value->img_id,
                    'description' => $value->description,
                    'create_time' => $this->datetime,
                    'creator_id' => $dataBase['creator_id']
                ];
            }
            DB::table($this->pdTable)->insert($dataImg);
            unset($key);
            unset($value);
        }

        //拼接插入数据(步骤数据);
        $data = [];
        $tmp = json_decode($input['fields']);
        foreach ($tmp as $key => $value) {
            $data[] = [
                'practice_id' => $practice_id,
                'field_id' => $value->field_id,
                'order' => $value->order,
                'img_name' => isset($value->img_name) ? $value->img_name : '',
                'img_id' => isset($value->img_id) ? $value->img_id : '',
                'img_url' => isset($value->img_url) ? $value->img_url : '',
                'description' => isset($value->description) ? $value->description : '',
                'creator_id' => $dataBase['creator_id'],
                'ctime' => $this->datetime
            ];
        }
//        return $data;
        //插入数据
        DB::table($this->pfTable)->insert($data);
        return $practice_id;
    }

    /**做法更新做法字段
     * @param $input
     * @return
     * @author
     * @todo 1,有一个漏洞,未验证fields里面的pfid是否归属于这个practice_id;是否需要进行这种深度的验证还需要讨论;
     * @todo 2,做法图纸采用的是直接删除然后重新插入的算法, 后期或许需要重新定义此算法;
     * @todo 2.1,针对todo2, 目前直接删除重新插入的做法,涉及到做法里面的图纸修改删除功能(直接删除重新插入就不需要对图纸进行编辑和删除的另外接口了) add by xin 20180525
     */
    public function updateFields($input)
    {
        if (!isset($input['practice_id'])) TEA('700', 'practice_id');//缺失做法id
        //做法id是否正常/正确
        $where = [['id', '=', $input['practice_id']]];
        $has = $this->isExisted($where, $this->table);
        if (!$has) TEA('700', 'practice_id');//做法id错误

        //判断哪些做法字段需要删除;
        //post过来的fields
        $tmp = json_decode($input['fields']);
//        return $tmp;
        //取出post过来的现存的pfid;
        $searchData = [];
        foreach ($tmp as $key => $value) {
            $searchData[] = $value->pfid;
        }
        unset($key);
        unset($value);
//        return $searchData;
        //查表搜索现有的pfid;
        $c = DB::table($this->pfTable)->where('practice_id', '=', $input['practice_id'])->pluck('id')->toArray();
        //找出是否有差异, 无差异则进行数据更新, 有差异则数据库删除差异再进行数据更新;
        $needToBeDelete = array_diff($c, $searchData);
        //return $needToBeDelete;
        if (!empty($needToBeDelete)) {
            foreach ($needToBeDelete as $key => $value) {
                DB::table($this->pfTable)->where('id', '=', $value)->delete();
            }
            unset($key);
            unset($value);
        }

        //删除原做法-图纸关系;
        DB::table($this->pdTable)->where('practice_id', '=', $input['practice_id'])->delete();
        //获取做法-图纸关系并插入表;
        $dataImg = [];
        $images = json_decode($input['images']);
        $creator_id = Session::get('administrator')->admin_id;
        foreach ($images as $key => $value) {
            $dataImg[] = [
                'practice_id' => $input['practice_id'],
                'drawing_id' => $value->img_id,
                'description' => $value->description,
                'create_time' => $this->datetime,
                'creator_id' => $creator_id
            ];
        }
        DB::table($this->pdTable)->insert($dataImg);


        //更新做法基础数据
        $data = [];
        $data['name'] = $input['name'];
        $data['operation_id'] = $input['operation_id'];
        $data['m_c_id'] = $input['m_c_id'];
//        $data['description'] = empty($input['description']) ? '' : trim($input['description']);//做法用处描述 add by xin 20180418
//        $data['description_id'] = empty($input['description_id']) ? '' : trim($input['description_id']);//做法用处描述id add by xin 20180425
        $data['product_type_id'] = empty($input['product_type_id']) ? '' : trim($input['product_type_id']);//产品细分类id add by xin 20180502
        $data['creator_id'] = $creator_id;
        $data['practice_category_id'] = empty($input['practice_category_id']) ? 0 : trim($input['practice_category_id']);//做法分类id add by xin 20180514
        //基础数据(practice表)插入;
        DB::table($this->table)->where('id', '=', $input['practice_id'])->update($data);


        //处理用处, 并插入做法-用处关系表;  add by xin 20180510
        //删除原做法-用处关系;
        DB::table($this->puTable)->where('practice_id', '=', $input['practice_id'])->delete();
        if (!empty($input['description_ids'])) {
            $description_ids = json_decode($input['description_ids']);
            $dataDesc = [];
            foreach ($description_ids as $key => $value) {
                $dataDesc[] = [
                    'practice_id' => $input['practice_id'],
                    'use_id' => $value,
                    'creator_id' => $creator_id,
                    'create_time' => $this->datetime
                ];
            }
            unset($key);
            unset($value);
            DB::table($this->puTable)->insert($dataDesc);
        }

        //更新做法字段;  有则更新, 无论是否改动; 无则插入;
        foreach ($tmp as $key => $value) {
            $insertData = [
                'field_id' => $value->field_id,
                'practice_id' => $input['practice_id'],
                'order' => $value->order,
                'img_name' => isset($value->img_name) ? $value->img_name : '',
                'img_id' => isset($value->img_id) ? $value->img_id : '',
                'img_url' => isset($value->img_url) ? $value->img_url : '',
                'description' => isset($value->description) ? $value->description : '',
                'creator_id' => $data['creator_id'],
                'ctime' => $this->datetime
            ];

            if ($value->pfid == '') {
                //如果pfid为空, 则新增一条;
                DB::table($this->pfTable)->insert($insertData);
            } else {
                //如果pfid不为空, 则根据pfid去更新内容;
                DB::table($this->pfTable)->where('id', '=', $value->pfid)->update($insertData);
            }
        }

        return 1;
//        return $this->storeFields($input);
    }

    /**删除做法
     * @param $input
     * @return
     * @author
     */
    public function deleteFields($input)
    {
        if (!isset($input['practice_id'])) TEA('700', 'practice_id');//缺失步骤id

        //步骤id是否正常/正确
        $where = [['id', '=', $input['practice_id']]];
        $has = $this->isExisted($where, $this->table);
        if (!$has) TEA('700', 'practice_id');//步骤id错误

        //删除practice表的数据;
        DB::table($this->table)->where('id', '=', $input['practice_id'])->delete();
        //删除practice-drawing表关系;
        DB::table($this->pdTable)->where('practice_id', '=', $input['practice_id'])->delete();
        //删除practice-use表关系;
        DB::table($this->puTable)->where('practice_id', '=', $input['practice_id'])->delete();
        //删除practice_practice-field表关系;
        return DB::table($this->pfTable)->where('practice_id', '=', $input['practice_id'])->delete();
    }

    /**根据做法id显示所有做法字段(给漫漫用的)
     * @param $input
     * @return
     * @author
     */
    public function displayFields($input)
    {
        //检查做法id
        if (!isset($input['practice_id'])) TEA('700', 'practice_id');
        $where = [['id', '=', $input['practice_id']]];
        $has = $this->isExisted($where, $this->table);
        if (!$has) TEA('700', 'practice_id');
        //根据做法id获取做法模板id, 反查模板所有能力
        $operation_ids = DB::table($this->table)->select('operation_id')->where('id', '=', $input['practice_id'])->first();
        $operation_id = $operation_ids->operation_id;
        //做法模板所有的能力
        $abilities = DB::table($this->rioa)->select('id as oaid', 'ability_id', 'ability_name as name', 'code')
            ->where([['operation_id', '=', $operation_id], ['status', '=', 1]])
            ->get();
        //查询做法字段;
//        return $abilities;
        $results = DB::table($this->table . ' as table')
            ->leftJoin($this->pfTable . ' as pf', 'table.id', '=', 'pf.practice_id')
            ->leftJoin($this->fTable . ' as f', 'pf.field_id', '=', 'f.id')
            ->leftJoin($this->daTable . ' as da', 'pf.img_id', '=', 'da.drawing_id')
            ->leftJoin($this->aTable . ' as a', 'da.attribute_definition_id', '=', 'a.id')
            ->select(
                'f.id as field_id',
                'pf.id as pfid',
                'pf.order',
                'pf.img_name',
                'pf.img_id',
                'pf.img_url',
                DB::raw('group_concat(a.name, ": " ,da.value separator ", ") as img_attribute'),
                'pf.description',
                'f.code',
                'f.name',
                'f.creator_id',
                'f.description as field_description'
            )
            ->where('pf.practice_id', '=', $input['practice_id'])
            ->groupBy('pf.id')
            ->orderBy('pf.order', 'asc')
            ->get();
//        return $results;
        //调整做法字段的图纸输出格式, 从三个字段变成一个前端需要的二维数组 add by xin 20180523
        foreach ($results as $key => $value) {
            $results[$key]->drawing = [];
            if ($value->img_id != 0) {
                //单个field图片是单张


                if (strpos($value->img_id, ',')===false) {
                    $results[$key]->drawing[0]['drawing_id'] = $value->img_id;
                    $results[$key]->drawing[0]['image_path'] = $value->img_url;
                    $results[$key]->drawing[0]['name'] = $value->img_name;
                    $results[$key]->drawing[0]['image_attribute'] = $value->img_attribute;
                }else{
                    $img_ids=explode(',',$value->img_id);
                    $img_urls=explode(',',$value->img_url);
                    $img_names=explode(',',$value->img_name);
                    //拼接attribute;
                    foreach ($img_ids as $k=>$v){

                        $results[$key]->drawing[$k]['drawing_id'] = $img_ids[$k];
                        $results[$key]->drawing[$k]['image_path'] = $img_urls[$k];
                        $results[$key]->drawing[$k]['name'] = $img_names[$k];
                        $tmpattributestr=DB::table($this->daTable.' as da')
                            ->leftJoin($this->aTable.' as a','da.attribute_definition_id','=','a.id')
                            ->select(DB::raw('group_concat(a.name, ": " ,da.value separator ", ") as img_attribute'))
                            ->where('da.drawing_id','=',$v)
                            ->first();
                        $results[$key]->drawing[$k]['image_attribute']= $tmpattributestr->img_attribute;
                    }unset($k,$v);
                }
            }


            //删除原字段;
            unset(
                $results[$key]->img_id,
                $results[$key]->img_url,
                $results[$key]->img_name,
                $results[$key]->img_name
            );
        }
        unset($key,$value);

        //查询做法字段所有能力
        //更新于20180420, 从做法-能力关系表切换到 工序-能力关系表;
        foreach ($results as $key => $v) {
            $results[$key]->abilities = $abilities;
        }

        //查询做法字段的步骤
//        $workcenter_list = DB::table(config('alias.rwcos').' as rwcos')
//            ->leftJoin(config('alias.rwc').' as rwc','rwc.id','rwcos.workcenter_id')
//            ->select('rwcos.workcenter_id','rwc.name','rwc.code','rwc.desc','rwcos.step_id')
//            ->where('rwcos.operation_id',$operation_id)
//            ->get();
//        foreach ($results as $k=>&$v){
//            $v->workcenters = [];
//            foreach ($workcenter_list as $j=>$w){
//                if($w->step_id == $v->field_id){
//                    $v->workcenters[] = $w;
//                }
//            }
//        }
        return $results;
    }

    /**根据做法id获取基本信息以及所有做法字段信息(步骤);
     * @param $input
     * @return
     * @author 20180413
     */
    public function detailPractice($input)
    {
        //检查做法id
        if (!isset($input['practice_id'])) TEA('700', 'practice_id');
        $where = [['id', '=', $input['practice_id']]];
        $has = $this->isExisted($where, $this->table);
        if (!$has) TEA('700', 'practice_id');
        //查询做法基础信息;
        $results['base'] = DB::table($this->table . ' as table')
            ->leftJoin($this->mcTable . ' as mc', 'table.m_c_id', '=', 'mc.id')
            ->leftJoin($this->rpt . ' as rpt', 'table.product_type_id', '=', 'rpt.id')
            ->leftJoin($this->puTable . ' as pu', 'table.id', '=', 'pu.practice_id')
            ->leftJoin($this->uTable . ' as u', 'pu.use_id', '=', 'u.id')
            ->leftJoin($this->cTable . ' as c', 'table.practice_category_id', '=', 'c.id')
            ->select(
                'table.id as practice_id',
                'table.name',
                'table.m_c_id',
                'mc.name as m_c_name',
//                $this->table . '.description',
                DB::raw('group_concat(u.name) as description'),
                DB::raw('group_concat(u.id) as description_id'),
//                $this->table . '.description_id',
                'table.code',
                'table.product_type_id',
                'table.practice_category_id',
                'c.name as practice-category_name',
                'rpt.name as product_type_name'
            )
            ->where('table.id', '=', $input['practice_id'])
            ->groupBy('table.id')
            ->first();

        //查询做法关联图纸信息;
        $results['images'] = DB::table($this->pdTable . ' as pd')
            ->leftJoin($this->dTable . ' as d', 'pd.drawing_id', '=', 'd.id')
            ->leftJoin($this->daTable . ' as da', 'd.id', '=', 'da.drawing_id')
            ->leftJoin($this->aTable . ' as a', 'da.attribute_definition_id', '=', 'a.id')
            ->select(
                'pd.drawing_id as img_id',
                'd.name as img_name',
                'pd.description',
                'd.image_path as img_url',
                DB::raw('group_concat(a.name, ": " ,da.value' . ' separator ", ") as attribute')
            )
            ->where('practice_id', '=', $input['practice_id'])
            ->groupBy('d.id')
            ->get();

        //查询做法字段;
        $results['fields'] = DB::table($this->table . ' as table')
            ->leftJoin($this->pfTable . ' as pf', 'table.id', '=', 'pf.practice_id')
            ->leftJoin($this->fTable . ' as f', 'pf.field_id', '=', 'f.id')
            ->leftJoin($this->daTable . ' as da', 'pf.img_id', '=', 'da.drawing_id')
            ->leftJoin($this->aTable . ' as a', 'da.attribute_definition_id', '=', 'a.id')
            ->select(
                'f.id as field_id',
                'pf.id as pfid',
                'pf.order',
                'pf.img_name',
                'pf.img_id',
                'pf.img_url',
                DB::raw('group_concat(a.name, ": " ,da.value' . ') as img_attribute'),
                'pf.description',
                'f.code',
                'f.name',
                'f.creator_id'
            )
            ->where('pf.practice_id', '=', $input['practice_id'])
            ->groupBy('pf.id')
            ->orderBy('pf.order', 'asc')
            ->get();
        foreach($results['fields'] as $key => $value){
            if(strpos($value->img_id,',')){
                //多个图片id, 重新获取图片属性, 进行属性拼接
                $img_ids=explode(',',$value->img_id);
                $attrArr=[];
                foreach($img_ids as $k =>$v){
                    $tmpattributestr=DB::table($this->daTable.' as da')
                        ->leftJoin($this->aTable.' as a','da.attribute_definition_id','=','a.id')
                        ->select(DB::raw('group_concat(a.name, ": " ,da.value separator ", ") as img_attribute'))
                        ->where('da.drawing_id','=',$v)
                        ->first();
                    $attrArr[]=$tmpattributestr->img_attribute;
                }unset($k,$v);
//                return implode('|||',$attrArr);
                $results['fields'][$key]->img_attribute=implode('|||',$attrArr);
            }
        }
        unset($key,$value);

        return $results;
    }

    /**做法线字段检查;
     * @param $input
     * @return
     * @author
     * @todo 验证数组是否所有字段都正常(practice_id和operation_id是否一一匹配;)
     */
    public function checkStoreLine($input)
    {
        if (!isset($input['relation'])) TEA('700', 'relation');//缺失需要关联的数组数据;
        if (!isset($input['name'])) TEA('700', 'name');//缺失做法线名
        //做法线名是否重复
        /* $where = [['name', '=', $input['name']]];
         $has = $this->isExisted($where, $this->lTable);
         if ($has) TEA('700', 'unique name');//做法线名字不唯一*/

        $relation = json_decode($input['relation']);
        $practice_ids = [];
        $operation_ids = [];
        foreach ($relation as $key => $value) {
            $practice_ids[] = $value->practice_id;
            $operation_ids[] = $value->operation_id;
        }
        unset($key);
        unset($value);
        //获取所有practice_id, operation_id;
        $allpid = DB::table($this->table)->pluck('id')->toArray();
        $alloid = DB::table($this->operation)->pluck('id')->toArray();

        if (!empty(array_diff($practice_ids, $allpid))) {
            $tmp = array_diff($practice_ids, $allpid);
            return get_api_response('700', 'practice_id', $tmp);//做法id有问题;
        } else if (!empty(array_diff($operation_ids, $alloid))) {
            $tmp = array_diff($operation_ids, $alloid);
            return get_api_response('700', 'operation_id', $tmp);//做法模板id有问题;
        }
        return true;
    }

    /**
     * 创建做法和做法之间的关联
     *
     * @param $input
     * @return mixed
     * @throws \App\Exceptions\ApiException
     * @since 2018-07-31 lester.you 做法唯一性判断
     */
    public function storeLine($input)
    {
        //获取做法线内部关系数据;
        $relation = json_decode($input['relation']);

        //将做法线所有做法id拼接成字符串;
        $strarr = [];
        foreach ($relation as $v) {
            $strarr[] = $v->practice_id;
        }
        sort($strarr);
        unset($v);
        $str = implode(',', $strarr);

        // 获取db data
        $db_data = DB::table(config('alias.rpl'))->select(['practice_str','id'])->get();
        foreach ($db_data as $key => $value) {
            $db_practice_arr = explode(',', $value->practice_str);
            sort($db_practice_arr);
            if ($strarr == $db_practice_arr) {
                TEA('1501');    // 具有完全相同过的做法
            }
        }

        //插入基础数据;
        $dataBase = [];
        $dataBase['name'] = $input['name'];
        $dataBase['code'] = 'ZFX' . $this->time . mt_rand('1000', '9999');
        $dataBase['create_time'] = $this->datetime;
        $dataBase['creator_id'] = Session::get('administrator')->admin_id;
        $dataBase['practice_str'] = $str;
        //插入做法线表, 获取插入的id;
        $line_id = DB::table($this->lTable)->insertGetId($dataBase);


        $insertData = [];
        //处理做法-做法线关系数据
        foreach ($relation as $key => $value) {
            $insertData[] = [
                'line_id' => $line_id,
                'practice_id' => $value->practice_id,
                'operation_id' => $value->operation_id,
                'create_time' => $this->datetime,
                'creator_id' => $dataBase['creator_id']
            ];
        }
        //插入数据;
        DB::table($this->plTable)->insert($insertData);
        //返回插入的做法线id;
        return ['line_id'=>$line_id];
    }

    /**
     * 检查做法线编辑是否成功
     *
     * @param $input
     * @throws \App\Exceptions\ApiException
     */
    public function checkEditLine($input)
    {
        if (!isset($input['line_id'])) TEA('700', 'line_id');
        if (!isset($input['name'])) TEA('700', 'name');
        if (!isset($input['relation'])) TEA('700', 'relation');
        //做法线是否存在;
        $where = [['id', '=', $input['line_id']]];
        $has = $this->isExisted($where, $this->lTable);
        if (!$has) TEA('700', 'line_id');
        /*$where = [['name', '=', $input['name']]];
        $has = $this->isExisted($where, $this->lTable);
        if ($has) TEA('700', 'unique name');//做法线名字不唯一*/
    }

    /**
     * @param array $input
     * @return array
     * @throws \App\Exceptions\ApiException
     * @author xin.min
     * @description 思路:先删除后insert
     * @since 2018-07-30 lester.you 做法唯一性判断
     */
    public function editLine($input)
    {
        $relation = json_decode($input['relation']);

        //将做法线所有做法id拼接成字符串;
        $strarr = [];
        foreach ($relation as $v) {
            $strarr[] = $v->practice_id;
        }
        sort($strarr);
        unset($v);
        $str = implode(',', $strarr);

        // 获取db data
        $db_data = DB::table(config('alias.rpl'))->select(['practice_str','id'])->where([['id','<>',$input['line_id']]])->get();
        foreach ($db_data as $key => $value) {
            $db_practice_arr = explode(',', $value->practice_str);
            sort($db_practice_arr);
            if ($strarr == $db_practice_arr) {
                TEA('1501');    // 具有完全相同过的做法
            }
        }

        $dataBase = [];
        if (!empty($input['name'])) {
            $dataBase['name'] = $input['name'];
        }
        $dataBase['create_time'] = $this->datetime;
        $dataBase['creator_id'] = Session::get('administrator')->admin_id;
        $dataBase['practice_str'] = $str;

        //更新做法线基础信息;
        DB::table($this->lTable)->where('id', '=', $input['line_id'])->update($dataBase);

        //删除原做法线内部关系
        DB::table($this->plTable)->where('line_id', '=', $input['line_id'])->delete();

        //处理做法-做法线关系数据
        $insertData = [];
        foreach ($relation as $key => $value) {
            $insertData[] = [
                'line_id' => $input['line_id'],
                'practice_id' => $value->practice_id,
                'operation_id' => $value->operation_id,
                'create_time' => $this->datetime,
                'creator_id' => $dataBase['creator_id']
            ];
        }
        //插入数据;
        DB::table($this->plTable)->insert($insertData);

        return ['line_id'=>$input['line_id']];
    }

    /**
     * 删除做法线
     *
     * @param $input
     * @return mixed
     * @throws \App\Exceptions\ApiException
     */
    public function deleteLine($input)
    {
        if (!isset($input['line_id'])) TEA('700', 'line_id');//做法线id缺失
        //验证做法线id是否正常/正确;
        $where = [['id', '=', $input['line_id']]];
        $has = $this->isExisted($where, $this->lTable);
        if (!$has) TEA('700', 'line_id');

        //删除做法线内部数据(做法关联);
        DB::table($this->plTable)->where('line_id', '=', $input['line_id'])->delete();
        //删除做法线基础数据;
        return DB::table($this->lTable)->where('id', '=', $input['line_id'])->delete();

    }

    /**根据传入的practice_id显示所有已有的关联记录;(给漫漫用)
     * @param $input
     * @return
     * @author
     */
    public function showLines($input)
    {
        if (!isset($input['practice_id'])) TEA('700', 'practice_id');
        //验证做法id是否正常/正确;
        $where = [['id', '=', $input['practice_id']]];
        $has = $this->isExisted($where, $this->table);
        if (!$has) TEA('700', 'practice_id');

        //通过practice_id反查做法线id;可能查到多个, 需要全部获取;
        $line_ids = DB::table($this->plTable)->where('practice_id', '=', $input['practice_id'])->pluck('line_id');
        $lines = [];
        //遍历查到的做法线id
        foreach ($line_ids as $value) {
            //做法线基础数据
            $base = DB::table($this->lTable)->where('id', '=', $value)->pluck('name', 'id');
            //做法线拥有的operation和拥有的practice group_concat集;
            $operation = DB::table($this->plTable . ' as pl')
                ->leftJoin($this->table . ' as table', 'pl.practice_id', '=', 'table.id')
                ->leftJoin($this->operation . ' as operation', 'pl.operation_id', '=', 'operation.id')
                ->select(
                    'pl.operation_id',
                    DB::raw('group_concat(table.id) as practice_ids'),
                    DB::raw('group_concat(table.name) as practice_names'),
                    DB::raw('group_concat(table.code) as practice_codes'),
                    'operation.name as operation_name',
                    'operation.code as operation_code'
                )
                ->where('line_id', '=', $value)
                ->groupBy('operation_id')
                ->get();
            //构成做法线基础结构
            $lines[] = ['base' => $base, 'operation' => $operation];
        }
        unset($value);
//        return $lines;
        //便利做法线结构, 取出practice group_concat集, 拼接成数组塞回原做法线结构, 并且删除冗余数据(删除原group_concat集)
        foreach ($lines as $key => $value) {

            foreach ($value['operation'] as $ke => $val) {
//                return $lines[$key]['owns'];
                //取出group_concat集, 变成数组;
                $practice_ids = explode(',', $val->practice_ids);
                $practice_codes = explode(',', $val->practice_codes);
                $practice_names = explode(',', $val->practice_names);
                $lines[$key]['operation'][$ke]->practice = [];
                //拼接进做法线结构;
                foreach ($practice_ids as $k => $v) {
                    $lines[$key]['operation'][$ke]->practice[] = [
                        'practice_id' => $v,
                        'practice_code' => $practice_codes[$k],
                        'practice_names' => $practice_names[$k]
                    ];
                }
                unset($k);
                unset($v);
                //清除原group_concat集;
                unset($lines[$key]['operation'][$ke]->practice_ids);
                unset($lines[$key]['operation'][$ke]->practice_names);
                unset($lines[$key]['operation'][$ke]->practice_codes);
            }
            unset($ke);
            unset($val);

        }

        return $lines;

    }

    /**检查做法线id是否正常/正确;
     * @param $input
     * @return
     * @author
     */
    public function checkLineId($input)
    {
        if (!isset($input['line_id'])) TEA('700', 'line_id');//做法线id缺失
        //验证做法线id是否正常/正确;
        $where = [['id', '=', $input['line_id']]];
        $has = $this->isExisted($where, $this->lTable);
        if (!$has) TEA('700', 'line_id');
    }

    /**根据做法线id获取做法线所有内容;
     * @param $input
     * @return
     * @author
     */
    public function showALine($input)
    {
        //做法线基础数据;
        $base = DB::table($this->lTable)->where('id', '=', $input['line_id'])->pluck('name', 'id');
        //做法线拥有的operation和拥有的practice group_concat集;
        $operation = DB::table($this->plTable . ' as pl')
            ->leftJoin($this->table . ' as table', 'pl.practice_id', '=', 'table.id')
            ->leftJoin($this->operation . ' as operation', 'pl.operation_id', '=', 'operation.id')
            ->select(
                'pl.operation_id',
                DB::raw('group_concat(table.id) as practice_ids'),
                DB::raw('group_concat(table.name) as practice_names'),
                DB::raw('group_concat(table.code) as practice_codes'),
                'operation.name as operation_name',
                'operation.code as operation_code'
            )
            ->where('line_id', '=', $input['line_id'])
            ->groupBy('operation_id')
            ->get();
        //构成做法线基础结构
        $lines = ['base' => $base, 'operation' => $operation];

        //便利做法线结构, 取出practice group_concat集, 拼接成数组塞回原做法线结构, 并且删除冗余数据(删除原group_concat集)
        foreach ($lines['operation'] as $ke => $val) {
//                return $lines[$key]['owns'];
            //取出group_concat集, 变成数组;
            $practice_ids = explode(',', $val->practice_ids);
            $practice_codes = explode(',', $val->practice_codes);
            $practice_names = explode(',', $val->practice_names);
            $lines['operation'][$ke]->practice = [];
            //拼接进做法线结构;
            foreach ($practice_ids as $k => $v) {
                $lines['operation'][$ke]->practice[] = [
                    'practice_id' => $v,
                    'practice_code' => $practice_codes[$k],
                    'practice_names' => $practice_names[$k]
                ];
            }
            unset($k);
            unset($v);
            //清除原group_concat集;
            unset($lines['operation'][$ke]->practice_ids);
            unset($lines['operation'][$ke]->practice_names);
            unset($lines['operation'][$ke]->practice_codes);
        }
        unset($ke);
        unset($val);
        return $lines;
    }

    /**获取做法的所有图纸
     * @param $input
     * @return
     * @author
     */
    public function showPracticeDraw($input)
    {
        //验证做法id是否正常/正确
        if (!isset($input['practice_id'])) TEA('700', 'practice_id');
        $where = [['id', '=', $input['practice_id']]];
        $has = $this->isExisted($where, $this->table);
        if (!$has) TEA('700', 'practice_id');

        $res = DB::table($this->pdTable . ' as pd')
            ->leftJoin($this->dTable . ' as d', 'pd.drawing_id', '=', 'd.id')
            ->leftJoin($this->daTable . ' as da', 'd.id', '=', 'da.drawing_id')
            ->leftJoin($this->aTable . ' as a', 'da.attribute_definition_id', '=', 'a.id')
            ->select(
                'pd.description',
                'd.code as img_code',
                'd.id as img_id',
                'd.name as img_name',
                'd.image_path as img_url',
                DB::raw('group_concat(a.name, ": " ,da.value) as img_attribute')
            )
            ->where('practice_id', '=', $input['practice_id'])
            ->groupBy('pd.id')
            ->orderBy('pd.id', 'asc')
            ->get();
        return $res;
    }

    /**
     * 显示做法里做法字段的所有图片
     * @param $input
     * @return
     * @author xin 20180530
     */
    public function showPracticeFieldDraw($input)
    {
        //验证做法id是否正常/正确
        if (!isset($input['practice_id'])) TEA('700', 'practice_id');
        $where = [['id', '=', $input['practice_id']]];
        $has = $this->isExisted($where, $this->table);
        if (!$has) TEA('700', 'practice_id');

        $res = DB::table($this->pfTable)
            ->select('field_id', 'img_id', 'img_name', 'img_url')
            ->where('practice_id', '=', $input['practice_id'])
            ->orderBy('order', ' asc')
            ->get()->toArray();
        return $res;
    }
}