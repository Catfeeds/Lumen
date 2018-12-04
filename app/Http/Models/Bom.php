<?php
/**
 * Created by PhpStorm.
 * User: rick
 * Date: 2017/11/23
 * Time: 10:28
 */

namespace App\Http\Models;//定义命名空间
use App\Http\Models\Material\Material;
use App\Libraries\CheckBomItem;
use App\Libraries\Tree;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use App\Libraries\Trace;
/**
 * BOM操作类
 * @author  rick
 * @time    2017年10月19日13:39:39
 */
class Bom extends Base
{

    /**
     * 前端传递的api主键名称
     * @var string
     */
    public  $apiPrimaryKey='bom_id';

    public function __construct()
    {
        parent::__construct();
        $this->table   = config('alias.rb');
    }

//region 检

    /**
     * 制定规则
     * @return array
     */
    public function getRules()
    {
        return array(

            'code'   => array('name'=>'code','type'=>'string','require'=>true,'on'=>'add,update','desc'=>'物料清单编码'),
            'name'   => array('name'=>'name','type'=>'string','require'=>true,'on'=>'add,update','desc'=>'名称'),
            'version'=> array('name'=>'version','type'=>'string','require'=>false,'on'=>'add,update','desc'=>'版本'),
            'version_description' => array('name'=>'version_description','max'=>200,'type'=>'string','require'=>false,'on'=>'add,update','desc'=>'版本描述'),
            'bom_group_id' => array('name'=>'bom_group_id','default'=>'','type'=>'int','require'=>false,'extra'=>'1','on'=>'add,update','desc'=>'bom组id'),
            'qty' => array('name'=>'qty','type'=>'int','default'=>1,'require'=>false,'on'=>'add,update','desc'=>'基础质量'),
            'material_id' => array('name'=>'material_id','type'=>'int','require'=>true,'on'=>'add,update','desc'=>'物料id'),
            'description' => array('name'=>'description','default'=>'','type'=>'string','max'=>500,'require'=>false,'on'=>'add,update','desc'=>'描述'),
            'loss_rate' => array('name'=>'loss_rate','type'=>'float','require'=>false,'default'=>0.00,'min'=>0.00,'max'=>99.99,'on'=>'add,update','desc'=>'损耗率'),
            'bom_tree'=>array('name'=>'bom_tree','type'=>'array','format'=>'json','require'=>true,'on'=>'add,update','desc'=>'常规中项的添加'),
            'is_upgrade' =>array('name'=>'is_upgrade','type'=>'int','require'=>true,'on'=>'update','desc'=>'是否升级'),
//            'cookie' => array('name'=>'cookie','type'=>'string','require'=>true,'on'=>'add,update,changeStatus','desc'=>'客户端cookie'),
            'bom_id' => array('name'=>'bom_id','type'=>'int','require'=>true,'on'=>'update,changeStatus','desc'=>'物料清单ID'),
            'type' => array('name'=>'type','type'=>'string','require'=>true,'on'=>'changeStatus','desc'=>'类型'),
            'status' => array('name'=>'status','type'=>'int','require'=>true,'on'=>'changeStatus','desc'=>'状态'),
            'operation_id' => array('name'=>'operation_id','type'=>'int','require'=>true,'on'=>'add,update','desc'=>'工序'),
            'label' => array('name'=>'label','type'=>'string','default'=>'','require'=>false,'on'=>'add,update','desc'=>'标签'),                 //'factory_id' => array('name'=>'factory_id','type'=>'string','require'=>true,'on'=>'add,update','desc'=>'标签'),
        );
    }


    /**
     * 对字段进行检查
     * @param $input  array 要过滤判断的get/post数组
     * @return void         址传递,不需要返回值
     * @author  sam.shan@ruis-ims.cn
     * @todo 后面统一放置到rick的Rules中
     */
    public function checkFormFields(&$input)
    {

        //用户id
        //if(empty($input['cookie']))  TEA('700','cookie');
        //$input['creator_id']=$this->getUserFieldByCookie($input['cookie'],'id');
        $input['creator_id']=(!empty(session('administrator')->admin_id)) ? session('administrator')->admin_id : 0;

        //附件信息参数检测
        $this->checkAttachmentsFormFields($input);

    }

    /**
     * 检查附件信息字段
     * @param $input
     * @author  sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function checkAttachmentsFormFields(&$input)
    {
        //1.attachments 物料附件N
        #1.1参数类型
        if(!isset($input['attachments']) || !is_json($input['attachments'])) TEA('701','attachments');
        #1.2 转成数组
        $input['attachments']=json_decode($input['attachments'],true);
        #1.3 传递的数据源是否正确,顺便转成ref
        $input['input_ref_arr_attachments']=[];
        foreach( $input['attachments'] as $key =>$value){
            $has=$this->isExisted([['id','=',$value['attachment_id']]],config('alias.attachment'));
            $input['input_ref_arr_attachments'][$value['attachment_id']]=$value;
            if(!$has)  TEA('700','attachments');
        }

    }



//endregion

//region 查
    /**
     * 查看Bom详情
     * @param $id
     * @return mixed
     * @throws \App\Exceptions\ApiException
     * @author  sam.shan <sam.shan@ruis-ims.cn>
     */
    public function get($id,$need_find_level)
    {
        //先从缓存中取
//        $cache_key = make_redis_key(['bom_detail',$id]);
//        $obj = Cache::get($cache_key);
//        if(!empty($obj)) return unserialize($obj);

        $fields= ['rb.id as bom_id','rb.code','rb.name','rb.version','rb.version_description','rb.material_id',

            'rb.bom_group_id','rb.qty','rb.loss_rate','rb.description','rb.status','rb.is_version_on','rb.creator_id','rb.ctime','rb.mtime','rb.operation_id','rb.operation_ability as operation_capacity','rb.label','rb.company_id','rb.factory_id',

            'rb.was_release','rb.bom_no','rb.bom_sap_desc','rb.DATUV','rb.BMEIN','rb.STLAN','rb.is_ecm','rb.AENNR','rb.from','rb.bom_unit_id','rio.name as operation_name',

            'u.name as creator_name','rb.name as bom_group_name','rm.item_no','ruu.commercial'
        ];
        $obj = DB::table(config('alias.rb').' as rb')
            ->leftJoin(config('alias.rm').' as rm','rm.id','rb.material_id')
            ->leftJoin(config('alias.rio').' as rio','rio.id','rb.operation_id')
            ->leftJoin(config('alias.u').' as u','u.id','rb.creator_id','u.id')
            ->leftJoin(config('alias.rbg').' as rbg','rbg.id','rb.bom_group_id')
            ->leftJoin(config('alias.ruu').' as ruu','ruu.id','rb.bom_unit_id')
            ->select($fields)
            ->where('rb.id',$id)->first();
        if (!$obj) TEA('404');
        //时间格式转换
//        $obj->ctime=$obj->ctime>0?date('Y-m-d H:i:s',$obj->ctime):'';
//        $obj->mtime=$obj->mtime>0?date('Y-m-d H:i:s',$obj->mtime):'';
//        //工序名
//        $obj->operation_name='';
//        if(!empty($obj->operation_id)) $obj->operation_name=$this->getFieldValueById($obj->operation_id,'name',config('alias.rio'));
//        //用户名
//        $obj->creator_name='';
//        if(!empty($obj->creator_id)) $obj->creator_name=$this->getFieldValueById($obj->creator_id,'name',config('alias.u'));
//        //Bom组名称
//        $obj->bom_group_name='';
//        if(!empty($obj->bom_group_id)) $obj->bom_group_name=$this->getFieldValueById($obj->bom_group_id,'name',config('alias.rbg'));
//        //bom顶级母件编码
//        $material=DB::table(config('alias.rm'))->select('item_no','unit_id')->where('id','=',$obj->material_id)->first();
//
//        $obj->item_no=$material->item_no;
//
//        $unit =DB::table(config('alias.uu'))->select('label','commercial')->where('id','=',$material->unit_id)->first();
//
//        $obj->unit=$unit->label;
//        $obj->commercial=$unit->commercial;

        //获得bom树
        $obj->bom_tree=$this->getBomTree($obj->material_id,$obj->version,false,true,$need_find_level,$obj->bom_no);
//        $obj->bom_tree=$this->getNewBomTree($obj->material_id,$obj->version,true,true,false,$obj->bom_no);
        //获取bom的关联附件
        $obj->attachments=$this->getBomAttachments($id);
        //获得bom的工厂
        $obj->factory_list = $this->getMaterialBomFactory($obj->code,$obj->bom_no);
        //放入缓存
//        if(!empty($obj)) Cache::put($cache_key,serialize($obj),config('app.redis_timeout.bom'));
        return $obj;
    }



//region 新bom树



    /**
     * 根据bom母件获取Bom树节点
     * @param $bom_material_id    int   bom母件material_id值
     * @param $version       int        版本号,默认值为1
     * @param $replace            bool  是否取替代物料
     * @param $bom_item_qty_level bool  是否取阶梯用量比
     * @author sam.shan <sam.shan@ruis-ims.cn>
     * @throws \App\Exceptions\ApiException
     * @return mixed
     */
    public function getNewBomTree($bom_material_id,$version=1,$replace=TRUE,$bom_item_qty_level=False,$need_find_level = true,$bom_no = '01')
    {
        //第一步 获取Bom母件信息
        $trees=$this->getNewMaterialMotherDetail($bom_material_id,$version,$bom_no);
        if(empty($trees)) TEA('404','bom_material_id');
        //第二步  获取母件儿子们的信息,注意 只有它的儿子们的bom_id值才是$bom_id额
        $trees->children=$this->getNewParentItemSons($trees->bom_id,$replace,$bom_item_qty_level,$need_find_level);
        return $trees;

    }

    public function getMaterialBomFactory($code,$bom_no){
        $list = DB::table(config('alias.rbf').' as rbf')
            ->select('rf.name')
            ->leftJoin(config('alias.rf').' as rf','rf.id','rbf.factory_id')
            ->where([['rbf.material_code','=',$code],['rbf.bom_no','=',$bom_no]])
            ->get();
        return $list;
    }

    /**
     * 获取母件的儿子
     * @param $material_id
     * @author sam.shan <sam.shan@ruis-ims.cn>
     */
    public function getNewParentItemSons($bom_id,$replace,$bom_item_qty_level,$need_find_level = true,$father_materials = [])
    {
        //获取每个父节点的儿子们(不含伪儿子-儿子们的替身)
        $where=[['rbi.parent_id','=',0],['rbi.bom_id','=',$bom_id]];
        $obj_list=$this->getBomItemList($where);
        //递归遍历亲儿子们
        $materialDao = new Material();
        foreach($obj_list as $key=>&$value){
            //看看儿子们是否有bom结构
            $value->has_bom=$this->isExisted([['material_id','=',$value->material_id],['is_version_on','=','1'],['status','=',1]],config('alias.rb'));
            //儿子们的阶梯配置信息
            if($bom_item_qty_level)  $value->bom_item_qty_levels=$this->getBomItemQtyLevel($value->bom_item_id);
            //儿子们的替身-注意替身可能也有儿子以及阶梯配置额,另外儿子的替身不可能有替身的,但是儿子的替身的子孙可能有替身额
            $replaces=$this->getNewReplaceItems($value->bom_item_id,$replace,$bom_item_qty_level,$need_find_level,$father_materials);
            if($replace) $value->replaces=$replaces;
            //给儿子们找儿子(递归下去就是一条家谱树)
            $value->children=[];
            if($value->has_bom){
                if($value->is_assembly == 1){
                    $value->versions=DB::table($this->table.' as rb')
                        ->where([['material_id','=',$value->material_id],['bom_no','=',$value->bom_no]])
                        ->pluck('version');
                    $bom=$this->getNewBomOperation($value->material_id,$value->version,$value->bom_no);
                    //注意半成品后来添加Bom结构的一个问题
                    if(!empty($bom) && !in_array($value->material_id,$father_materials)) {
                        $father_materials[] = $value->material_id;
                        //是否有工艺路线
                        $value->has_route = $this->isExisted([['bom_id','=',$bom->bom_id]],config('alias.rbr'));
                        //子项bom自身的bom id
                        $value->self_bom_id = $bom->bom_id;
                        $value->operation_id=!empty($bom->operation_id)?$bom->operation_id:0;
                        $value->operation_name=!empty($bom->operation_name)?$bom->operation_name:'';
                        $value->operation_ability=isset($bom->operation_ability)?$bom->operation_ability:'';
                        $value->operation_ability_pluck=isset($bom->operation_ability_pluck)?$bom->operation_ability_pluck:[];
                        if($need_find_level){
                            $value->children=$this->getNewParentItemSons($bom->bom_id,$replace,$bom_item_qty_level,$need_find_level,$father_materials);
                        }
                    }
                }else{
                    $value->bom_nos = $this->getMaterialBomNos($value->material_id);
                }
            }else{
                //如果是原料药取出物料的附件
                $value->attachment = $materialDao->getMaterialAttachments($value->material_id);
            }
        }
        return $obj_list;
    }

    /**
     * BOM与工序关联的获取信息
     * @param $bom_material_id
     * @param int $version
     * @return mixed
     * @author  sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function getNewMaterialMotherDetail($bom_material_id,$version=1,$bom_no = '01')
    {
        $bom=DB::table($this->table.' as rb')
            ->where('rb.material_id',$bom_material_id)
            ->where('rb.version',$version)
            ->where('rb.bom_no',$bom_no)
            ->leftJoin(config('alias.rm').' as rm','rb.material_id','=','rm.id')
            ->leftJoin(config('alias.rio').' as rio', 'rb.operation_id', '=', 'rio.id')
            ->leftJoin(config('alias.uu').' as uu', 'rb.bom_unit_id', '=', 'uu.id')
            ->leftJoin(config('alias.rmc').' as rmc','rm.material_category_id','=','rmc.id')
            ->select(
                'rb.id as bom_id','rb.operation_id','rb.operation_ability','rb.qty as usage_number','rb.material_id','rb.loss_rate',
                'rm.name','rm.item_no','uu.id as unit_id','rm.material_category_id',
                'rio.name as operation_name',
                'uu.label as unit','uu.commercial',
                'rmc.name as material_category_name'
            )
            ->first();
        //处理一下能力
        $bom->operation_ability_pluck='';
        if(!empty($bom->operation_ability)){
            $operation_ability=explode(',',$bom->operation_ability);
            //获取能力名称
            $operation_pluck= DB::table(config('alias.rioa'))->whereIn('id',$operation_ability)
                ->pluck('ability_name','id');
            $bom->operation_ability_pluck=obj2array($operation_pluck);
        }
        return $bom;
    }

    /**
     * BOM与工序关联的获取信息
     * @param $bom_material_id
     * @param int $version
     * @return mixed
     * @author  sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function getNewBomOperation($bom_material_id,$version=1,$bom_no = '01')
    {
        $bom=DB::table($this->table.' as rb')
            ->where('material_id',$bom_material_id)
            ->where('version',$version)
            ->where('bom_no',$bom_no)
            ->leftJoin(config('alias.rio').' as rio', 'rb.operation_id', '=', 'rio.id')
            ->select('rb.id as bom_id','rb.operation_id','rio.name as operation_name','rb.operation_ability')
            ->first();
        if(!empty($bom->operation_ability)){
            $operation_ability=explode(',',$bom->operation_ability);
            //获取能力名称
            $operation_pluck= DB::table(config('alias.rioa'))->whereIn('id',$operation_ability)
                ->pluck('ability_name','id');
            $bom->operation_ability_pluck=obj2array($operation_pluck);
        }

        return $bom;
    }

    /**
     * 寻找物料项的替代物料
     * @param $parent_id
     * @return mixed
     * @author  sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function getNewReplaceItems($parent_id,$replace,$bom_item_qty_level,$need_find_level = true,$father_materials)
    {

        //获取伪儿子们
        $where=[['rbi.parent_id','=',$parent_id]];
        $obj_list=$this->getBomItemList($where);
        //递归遍历伪儿子们
        foreach($obj_list  as $key=>&$value){
            //看看伪儿子们是否有bom结构
            $value->has_bom=$this->isExisted([['material_id','=',$value->material_id],['is_version_on','=',1]],config('alias.rb'));
            //伪儿子们的阶梯配置信息
            if($bom_item_qty_level)  $value->bom_item_qty_levels=$this->getBomItemQtyLevel($value->bom_item_id);
            //给伪儿子们找儿子(递归下去就是一条家谱树)
            $value->children=[];
            if($value->has_bom){
                if($value->is_assembly == 1){
                    $value->versions=DB::table($this->table.' as rb')
                        ->where([['material_id','=',$value->material_id],['bom_no','=',$value->bom_no]])
                        ->pluck('version');
                    $bom=$this->getNewBomOperation($value->material_id,$value->version);
                    if(!empty($bom) && !in_array($value->material_id,$father_materials)){
                        $father_materials[] = $value->material_id;
                        $value->operation_id=$bom->operation_id;
                        $value->operation_name=$bom->operation_name;
                        $value->operation_ability=isset($bom->operation_ability)?$bom->operation_ability:'';
                        $value->operation_ability_pluck=isset($bom->operation_ability_pluck)?$bom->operation_ability_pluck:[];
                        if($need_find_level){
                            $value->children=$this->getNewParentItemSons($bom->bom_id,$replace,$bom_item_qty_level,$need_find_level,$father_materials);
                        }
                    }
                }
            }
        }
        return $obj_list;
    }

    /**
     * 查询物料的bom编号
     * @param $material_id
     * @return mixed
     */
    public function getMaterialBomNos($material_id){
        $obj_list = DB::table(config('alias.rb'))
            ->where([['material_id','=',$material_id],['is_version_on','=',1]])
            ->select('bom_no','id as bom_id','version')
            ->get();
        return $obj_list;
    }

    /**
     * 组装bom子项
     * @param $input
     * @throws \App\Exceptions\ApiException
     */
    public function assemblyItem($input){
        if(empty($input['item_id']) || !is_numeric($input['item_id'])) TEA('700','item_id');
        if(!isset($input['bom_no'])) TEA('700','bom_no');
        if(empty($input['version'])) TEA('700','version');
        $res = DB::table(config('alias.rbi'))->where('id',$input['item_id'])->update(['is_assembly'=>1,'bom_no'=>$input['bom_no'],'version'=>$input['version']]);
        if($res === false) TEA('804');
    }

//endregion
    /**
     * BOM与工序关联的获取信息
     * @param $bom_material_id
     * @param int $version
     * @return mixed
     * @author  sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function getMaterialMotherDetail($bom_material_id,$version=1,$bom_no = '01')
    {
        $bom=DB::table($this->table.' as rb')
            ->where('rb.material_id',$bom_material_id)
            ->where('rb.version',$version)
            ->where('rb.bom_no',$bom_no)
            ->leftJoin(config('alias.rm').' as rm','rb.material_id','=','rm.id')
            ->leftJoin(config('alias.rio').' as rio', 'rb.operation_id', '=', 'rio.id')
            ->leftJoin(config('alias.uu').' as uu', 'rb.bom_unit_id', '=', 'uu.id')
            ->leftJoin(config('alias.rmc').' as rmc','rm.material_category_id','=','rmc.id')
            ->select(
                'rb.id as bom_id','rb.operation_id','rb.operation_ability','rb.qty as usage_number','rb.material_id','rb.loss_rate',
                'rm.name','rm.item_no','uu.id as unit_id','rm.material_category_id',
                'rio.name as operation_name',
                'uu.label as unit','uu.commercial',
                'rmc.name as material_category_name'
            )
            ->first();
        //处理一下能力
        $bom->operation_ability_pluck='';
        if(!empty($bom->operation_ability)){
            $operation_ability=explode(',',$bom->operation_ability);
            //获取能力名称
            $operation_pluck= DB::table(config('alias.rioa'))->whereIn('id',$operation_ability)
                ->pluck('ability_name','id');
            $bom->operation_ability_pluck=obj2array($operation_pluck);
        }
        return $bom;
    }




    /**
     * 获取BOM附件
     * @param $bom_id
     * @return mixed
     */
    public function getBomAttachments($bom_id)
    {
        $obj_list=DB::table(config('alias.rba').' as rba')
            ->where('rba.bom_id',$bom_id)
            ->leftJoin(config('alias.attachment').' as attach', 'rba.attachment_id', '=', 'attach.id')
            ->leftJoin(config('alias.u').' as u','attach.creator_id','=','u.id')
            ->select(
                'rba.bom_id',
                'rba.attachment_id',
                'rba.comment',
                'u.name as creator_name',
                'attach.name',
                'attach.filename',
                'attach.path',
                'attach.size',
                'attach.ctime',
                'attach.creator_id',
                'attach.is_from_erp'
            )->get();
        //遍历装饰数据(一般不在M层处理)
        foreach($obj_list as $key=>&$value){
            $value->ctime=date('Y-m-d H:i:s',$value->ctime);
        }
        return $obj_list;
    }

    /**
     * 获得BOM分页列表
     * @param $input
     * @return object list
     * @author rick
     * @reviser sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function getBomList(&$input)
    {

        //1.创建公共builder
             //1.1where条件预搜集
        $where=[['rb.version',1]];
        !empty($input['code']) &&  $where[]=['rb.code','like',$input['code'].'%']; //物料清单编码
        !empty($input['name']) &&  $where[]=['rb.name','like','%'.$input['name'].'%'];  //物料清单名称
        isset($input['status']) && is_numeric($input['status']) &&  $where[]=['rb.status',$input['status']];  //冻结或者激活
        isset($input['is_version_on']) &&  is_numeric($input['is_version_on']) &&  $where[]=['rb.is_version_on',$input['is_version_on']];  //生效版本
        !empty($input['item_material_path']) &&  $where[]=['rb.item_material_path','like','%'.$input['item_material_path'].'%'];  //Bom物料项
        !empty($input['replace_material_path']) &&  $where[]=['rb.replace_material_path','like','%'.$input['replace_material_path'].'%'];  //Bom替代物料项
        !empty($input['creator_name']) && $where[] = ['u.name', 'like', '%' . $input['creator_name'] . '%'];//创建人
        !empty($input['bom_group_id']) &&  $where[]=['rbg.id',$input['bom_group_id']];  //组号
        !empty($input['is_lzp']) && $where[] = ['rm.lzp_identity_card','=',''];
            //1.2 预生成builder,注意仅仅在get中需要的连表请放在builder_get中
        $builder = DB::table($this->table.' as rb')
            ->leftJoin(config('alias.rrad').' as u', 'u.id', '=', 'rb.creator_id')
            ->leftJoin(config('alias.rm').' as rm','rm.id','=','rb.material_id')
            ->leftJoin(config('alias.uu').' as uu','uu.id','rb.bom_unit_id')
            ->leftJoin(config('alias.rmc').' as rmc','rm.material_category_id','rmc.id')
            ->leftJoin(config('alias.rmc').' as brmc','rm.sap_big_material_type_id','brmc.id')
            ->leftJoin(config('alias.rbg').' as rbg', 'rbg.id', '=', 'rb.bom_group_id');
//        $input['child_code'] = 'BCB-HA-0005';
        if (!empty($input['child_code'])) {
            $builder->leftJoin(config('alias.rbi').' as rbi','rbi.bom_material_id','=','rb.material_id');
            $where[] = ['rm.item_no', '=', $input['child_code']];
        }
            //1.3 where条件拼接
        if (!empty($where)) $builder->where($where);
        //添加工时的搜索
        if(!empty($input['operation_id']) && isset($input['has_workhour'])){
            $opertion_id = $input['operation_id'];
            $builder->whereExists(function($query)use($opertion_id){
                $query->select('rrb.material_id')->from(config('alias.rbrb').' as rbrb')
                    ->leftJoin(config('alias.rb').' as rrb','rrb.id','rbrb.bom_id')
                    ->whereRaw('rrb.is_version_on = 1 and rb.material_id=rrb.material_id and rbrb.operation_id='.$opertion_id);
            });
            if($input['has_workhour'] == 1){
                $builder->whereExists(function($query)use($opertion_id){
                    $query->select('rrb.material_id')->from(config('alias.rimw').' as rimw')
                        ->leftJoin(config('alias.rb').' as rrb','rimw.bom_id','rrb.id')
                        ->whereRaw('rrb.is_version_on=1 and rb.material_id=rrb.material_id and rimw.operation_id='.$opertion_id);
                });
            }else if($input['has_workhour'] == '0'){
                $builder->whereNotExists(function($query)use($opertion_id){
                    $query->select('rrb.material_id')->from(config('alias.rimw').' as rimw')
                        ->leftJoin(config('alias.rb').' as rrb','rimw.bom_id','rrb.id')
                        ->whereRaw('rrb.is_version_on=1 and rb.material_id=rrb.material_id and rimw.operation_id='.$opertion_id);
                });
            }
        }
        //2.总共有多少条记录
        $input['total_records'] = $builder->count();
        //3.select查询
        $builder_get=$builder;
             //3.1 拼接不同于公共builder的条件
        $builder_get->select('rb.id as bom_id', 'rb.creator_id','rb.bom_group_id','rb.name as bom_name','rb.code','rb.qty','rb.version','rb.ctime','rb.status','rb.is_version_on', 'rb.description','rb.bom_no',
            'u.name as creator_name','brmc.name as big_material_type_name','rb.material_id',
            'rbg.name as bom_group_name','rb.material_id','rb.from','rmc.name as material_type_name','uu.commercial')
            ->addSelect(DB::raw("ifnull((select version from ruis_bom rrb where rrb.material_id = rb.material_id and rrb.bom_no = rb.bom_no and status = 1 and is_version_on = 1),'') as release_version"))
            ->addSelect(DB::raw("ifnull((select id from ruis_bom rrb where rrb.material_id = rb.material_id and rrb.bom_no = rb.bom_no and status = 1 and is_version_on = 1),'') as release_version_bom_id"))
            ->offset(($input['page_no']-1)*$input['page_size'])->limit($input['page_size']);
             //3.2 order拼接
//        if (!empty($input['order']) && !empty($input['sort'])) $builder->orderBy('rb.' . $input['sort'], $input['order']);
        $builder_get->orderBy('rb.ctime','desc');
        $builder_get->orderBy('rb.is_ecm','desc');
             //3.3 get获取接口
        $obj_list = $builder_get->get();

        //4.遍历处理一下数据
        foreach($obj_list as $key=>&$value){
            //创建时间
            $value->ctime=!empty($value->ctime)?date('Y-m-d H:i:s',$value->ctime):'';
            //版本包含
//            $value->versions=DB::table($this->table)->where('code','=',$value->code)->pluck('version');
//            生效的版本,后续添加上去的,我就不一次性取了,用户催的急
//            $value->release_version=$this->getFieldValueByWhere([['code','=',$value->code],['status','=',1],['is_version_on','=',1]],'version');
//            $value->release_version_bom_id=$this->getFieldValueByWhere([['code','=',$value->code],['status','=',1],['is_version_on','=',1]],'id');
//            $release_bom = DB::table(config('alias.rb'))->where([['material_id','=',$value->material_id],['bom_no','=',$value->bom_no],['status','=',1],['is_version_on','=',1]])->select('version','id')->first();
//            if(!empty($release_bom)){
//                $value->release_version = $release_bom->version;
//                $value->release_version_bom_id = $release_bom->id;
//            }else{
//                $value->release_version = '';
//                $value->release_version_bom_id = '';
//            }
        }
        return $obj_list;
    }




    /**
     * BOM与工序关联的获取信息
     * @param $bom_material_id
     * @param int $version
     * @return mixed
     * @author  sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function getBomOperation($bom_material_id,$version=1,$bom_no = '')
    {
        $bom=DB::table($this->table.' as rb')
            ->where('material_id',$bom_material_id)
            ->where('version',$version)
            ->where('bom_no',$bom_no)
            ->leftJoin(config('alias.rio').' as rio', 'rb.operation_id', '=', 'rio.id')
            ->select('rb.id as bom_id','rb.operation_id','rio.name as operation_name','rb.operation_ability')
            ->first();
        if(!empty($bom->operation_ability)){
            $operation_ability=explode(',',$bom->operation_ability);
            //获取能力名称
            $operation_pluck= DB::table(config('alias.rioa'))->whereIn('id',$operation_ability)
                ->pluck('ability_name','id');
            $bom->operation_ability_pluck=obj2array($operation_pluck);
        }

        return $bom;
    }

    /**
     * 根据bom母件获取Bom树节点
     * @param $bom_material_id    int   bom母件material_id值
     * @param $version       int        版本号,默认值为1
     * @param $replace            bool  是否取替代物料
     * @param $bom_item_qty_level bool  是否取阶梯用量比
     * @author sam.shan <sam.shan@ruis-ims.cn>
     * @throws \App\Exceptions\ApiException
     * @return mixed
     */
    public function getBomTree($bom_material_id,$version=1,$replace=TRUE,$bom_item_qty_level=False,$need_find_level = true,$bom_no = '01')
    {
        //第一步 获取Bom母件信息
        $trees=$this->getMaterialMotherDetail($bom_material_id,$version,$bom_no);
        if(empty($trees)) TEA('404','bom_material_id');
        //第二步  获取母件儿子们的信息,注意 只有它的儿子们的bom_id值才是$bom_id额
        $trees->children=$this->getParentItemSons($trees->bom_id,$replace,$bom_item_qty_level,$need_find_level);
        return $trees;

    }

    /**
     * 获取bom子项阶梯用量信息
     * @param $bom_item_id
     * @return mixed
     * @author sam.shan   <sam.shan@ruis-ims.cn>
     */
    public function  getBomItemQtyLevel($bom_item_id)
    {

        $obj_list=DB::table(config('alias.rbiql'))
            ->select('id as bom_item_qty_level_id','bom_item_id','parent_min_qty','qty')
            ->where('bom_item_id',$bom_item_id)
            ->get();
        return $obj_list;
    }

    /**
     * 根据条件获取物料子项信息
     * @param $where
     * @return mixed
     * @author sam.shan <sam.shan@ruis-ims.cn>
     */
    public function getBomItemList($where)
    {
        if(!is_array($where) || empty($where)) return [];

        $obj_list=DB::table(config('alias.rbi').' as rbi')
            ->select(
                'rm.id as material_id','rm.name','rm.item_no','rm.material_category_id',
                'rbi.id as bom_item_id','rbi.bom_id','rbi.loss_rate','rbi.is_assembly','rbi.usage_number','rbi.total_consume','rbi.parent_id','rbi.comment','rbi.version','rbi.bom_material_id',
                'uu.commercial','uu.id as bom_unit_id',
                'rmc.name as material_category_name','rbi.bom_no',
                'rbi.bom_no','rbi.AENNR','rbi.DATUV','rbi.DATUB','rbi.POSNR','rbi.POSTP','rbi.MEINS'
            )
            ->where($where)
            ->leftJoin(config('alias.rm').' as rm','rbi.material_id','=','rm.id')
            ->leftJoin(config('alias.uu').' as uu', 'rbi.bom_unit_id', '=', 'uu.id')
            ->leftJoin(config('alias.rmc').' as rmc', 'rm.material_category_id', '=', 'rmc.id')
            ->get();
        return $obj_list;
    }

    /**
     * 寻找物料项的替代物料
     * @param $parent_id
     * @return mixed
     * @author  sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function getReplaceItems($parent_id,$replace,$bom_item_qty_level,$need_find_level = true,$father_materials)
    {

        //获取伪儿子们
        $where=[['rbi.parent_id','=',$parent_id]];
        $obj_list=$this->getBomItemList($where);
        //递归遍历伪儿子们
        foreach($obj_list  as $key=>&$value){
            //看看伪儿子们是否有bom结构
            $value->has_bom=$this->isExisted([['material_id','=',$value->material_id],['is_version_on','=',1]],config('alias.rb'));
            //伪儿子们的阶梯配置信息
            if($bom_item_qty_level)  $value->bom_item_qty_levels=$this->getBomItemQtyLevel($value->bom_item_id);
            //给伪儿子们找儿子(递归下去就是一条家谱树)
            $value->children=[];
            if($value->has_bom){
                if($value->is_assembly == 1){
                    $value->versions=DB::table($this->table.' as rb')
                        ->where([['material_id','=',$value->material_id],['bom_no','=',$value->bom_no]])
                        ->pluck('version');
                    $bom=$this->getBomOperation($value->material_id,$value->version);
                    if(!empty($bom) && !in_array($value->material_id,$father_materials)){
                        $father_materials[] = $value->material_id;
                        $value->operation_id=$bom->operation_id;
                        $value->operation_name=$bom->operation_name;
                        $value->operation_ability=isset($bom->operation_ability)?$bom->operation_ability:'';
                        $value->operation_ability_pluck=isset($bom->operation_ability_pluck)?$bom->operation_ability_pluck:[];
                        if($need_find_level){
                            $value->children=$this->getParentItemSons($bom->bom_id,$replace,$bom_item_qty_level,$need_find_level,$father_materials);
                        }
                    }
                }
            }
        }
        return $obj_list;
    }

    /**
     * 获取母件的儿子
     * @param $material_id
     * @author sam.shan <sam.shan@ruis-ims.cn>
     */
    public function getParentItemSons($bom_id,$replace,$bom_item_qty_level,$need_find_level = true,$father_materials = [])
    {
        //获取每个父节点的儿子们(不含伪儿子-儿子们的替身)
        $where=[['rbi.parent_id','=',0],['rbi.bom_id','=',$bom_id]];
        $obj_list=$this->getBomItemList($where);
        //递归遍历亲儿子们
        $materialDao = new Material();
        foreach($obj_list as $key=>&$value){
            //看看儿子们是否有bom结构
            $value->has_bom=$this->isExisted([['material_id','=',$value->material_id],['is_version_on','=','1'],['status','=',1]],config('alias.rb'));
            //儿子们的阶梯配置信息
            if($bom_item_qty_level)  $value->bom_item_qty_levels=$this->getBomItemQtyLevel($value->bom_item_id);
            //儿子们的替身-注意替身可能也有儿子以及阶梯配置额,另外儿子的替身不可能有替身的,但是儿子的替身的子孙可能有替身额
            if($replace){
                $replaces = $this->getReplaceItems($value->bom_item_id,$replace,$bom_item_qty_level,$need_find_level,$father_materials);
                if(!empty($replaces)) $value->replaces=$replaces;
            }
            //给儿子们找儿子(递归下去就是一条家谱树)
            $value->children=[];
            if($value->has_bom){
                if($value->is_assembly == 1){
                    $value->versions=DB::table($this->table.' as rb')
                        ->where([['material_id','=',$value->material_id],['bom_no','=',$value->bom_no]])
                        ->pluck('version');
                    $bom=$this->getBomOperation($value->material_id,$value->version,$value->bom_no);
                    //注意半成品后来添加Bom结构的一个问题
//                    if(!empty($bom) && !in_array($value->material_id,$father_materials)) //此处判断是用来判定是否为互为父子或者子项互为父子，但是因为重复料的话就不能判断了
                    if(!empty($bom)) {
//                        $father_materials[] = $value->material_id;
                        //是否有工艺路线
                        $value->has_route = $this->isExisted([['bom_id','=',$bom->bom_id]],config('alias.rbr'));
                        //子项bom自身的bom id
                        $value->self_bom_id = $bom->bom_id;
                        $value->operation_id=!empty($bom->operation_id)?$bom->operation_id:0;
                        $value->operation_name=!empty($bom->operation_name)?$bom->operation_name:'';
                        $value->operation_ability=isset($bom->operation_ability)?$bom->operation_ability:'';
                        $value->operation_ability_pluck=isset($bom->operation_ability_pluck)?$bom->operation_ability_pluck:[];
                        if($need_find_level){
                            $value->children=$this->getParentItemSons($bom->bom_id,$replace,$bom_item_qty_level,$need_find_level,$father_materials);
                        }
                    }
                }else{
                    $value->bom_nos = $this->getMaterialBomNos($value->material_id);
                }
            }else{
                //如果是原料药取出物料的附件
                $value->attachment = $materialDao->getMaterialAttachments($value->material_id);
            }
        }
        return $obj_list;
    }

    /**
     * 获取进料
     * @param $bom_id
     * @param $routing_id
     */
   public function newGetEnterBomMaterial($bom_id,$routing_id){
       $enterMaterial = [];
       //先找bom的子项
       $item_list = DB::table(config('alias.rbi').' as rbi')
           ->select('rbi.material_id','rm.name','rm.item_no','uu.commercial','rbi.usage_number','rbi.bom_unit_id','rbi.POSNR')
           ->leftJoin(config('alias.rm').' as rm','rm.id','rbi.material_id')
           ->leftJoin(config('alias.uu').' as uu','uu.id','rbi.bom_unit_id')
           ->where([['rbi.bom_id','=',$bom_id]])
           ->whereNotExists(function($query)use($bom_id){
               $query->select('rbirbi.parent_id')->from(config('alias.rbi').' as rbirbi')
                   ->whereRaw('rbi.id=rbirbi.parent_id and rbirbi.bom_id='.$bom_id);
           })
           ->get();
       //再找流转品
       $lzp_list = DB::table(config('alias.rbrl').' as rbrl')->select(DB::raw('distinct rbrl.material_id,rm.name,rm.item_no,uu.commercial,uu.id as bom_unit_id,1 as is_lzp,"" as POSNR'))
           ->leftJoin(config('alias.rm').' as rm','rm.id','rbrl.material_id')
           ->leftJoin(config('alias.uu').' as uu','uu.id','rm.unit_id')
           ->where([['rbrl.bom_id','=',$bom_id],['rbrl.routing_id','=',$routing_id]])
           ->get();
       $enterMaterial = array_merge(obj2array($item_list),obj2array($lzp_list));
       //去重
//       $enterMaterial = $this->qc($enterMaterial,'material_id');
       //后续添加查找物料属性和物料附件
       foreach ($enterMaterial as $k=>&$v){
           if(isset($v['is_lzp']) && $v['is_lzp'] == 1){
               $drawing = DB::table(config('alias.rmd'))->select(DB::raw('drawing_id'))->where('material_id',$v['material_id'])->orderBy('id','asc')->first();
               if(!empty($drawing)){
                   $v['attributes'] = DB::table(config('alias.rda').' as rda')->select('rda.value','rdad.name')
                       ->leftJoin(config('alias.rdad').' as rdad','rdad.id','rda.attribute_definition_id')
                       ->where('rda.drawing_id',$drawing->drawing_id)
                       ->get();
               }
               //查找该流转品在生成的时候添加的描述
               $v['desc'] = DB::table(config('alias.rbri'))->where([['type','=',2],['material_id','=',$v['material_id']],['bom_id','=',$bom_id]])->value('desc');
           }else{
               $v['attributes'] = DB::table(config('alias.ma').' as ma')->select('ad.name','ma.value','uu.commercial')
                   ->leftJoin(config('alias.ad').' as ad','ad.id','ma.attribute_definition_id')
                   ->leftJoin(config('alias.uu').' as uu','uu.id','ad.unit_id')
                   ->where('ma.material_id',$v['material_id'])
                   ->get();
           }
           $v['attachment'] = DB::table(config('alias.rma').' as rma')->select('a.name','a.path')
               ->leftJoin(config('alias.attachment').' as a','a.id','rma.attachment_id')
               ->where('rma.material_id',$v['material_id'])
               ->get();
       }
       return $enterMaterial;
   }

    /**
     * 获取出料
     * @param $bom_id
     * @param $materials
     * @return array
     */
   public function newGetOutBomMaterial($bom_id,$materials){
       $outMaterial = [];
       $outMaterial[] = DB::table($this->table.' as rb')->select('rb.material_id','rm.name','rm.item_no','uu.commercial','rb.bom_unit_id')
           ->leftJoin(config('alias.rm').' as rm','rm.id','rb.material_id')
           ->leftJoin(config('alias.uu').' as uu','uu.id','rb.bom_unit_id')
           ->where([['rb.id','=',$bom_id]])->first();
       return $outMaterial;

   }

//这两个方法当时写的我想死，现在又要改成上面这种zz方法，就很难受，这一段先不删除，后续可能还要再改回来，反正也不是第一次了
//    /**
//     * 获取进料
//     * @param $bom_id
//     * @return mixed
//     */
//    public function getEnterBomMaterial($bom_id,$routing_id){
//        //先查找顶级母件物料
//        $enterMaterial = [];
//        $monther = DB::table($this->table.' as rb')->select('rb.material_id','rm.name','rm.item_no','uu.commercial','rb.qty as usage_number')
//            ->leftJoin(config('alias.rm').' as rm','rm.id','rb.material_id')
//            ->leftJoin(config('alias.uu').' as uu','uu.id','rm.unit_id')
//            ->where('rb.id',$bom_id)
//            ->get();
//        //找儿子
//        $this->getBomSons($bom_id,$enterMaterial);
//        //获取流转品
//        $lzp = DB::table(config('alias.rbrl').' as rbrl')->select('rbrl.material_id','rm.name','rm.item_no','uu.commercial')
//            ->leftJoin(config('alias.rm').' as rm','rm.id','rbrl.material_id')
//            ->leftJoin(config('alias.uu').' as uu','uu.id','rm.unit_id')
//            ->where([['rbrl.bom_id','=',$bom_id],['rbrl.routing_id','=',$routing_id]])
//            ->get();
//        //找流转品的儿子
//        foreach ($lzp as $k=>$v){
//            $has_bom = DB::table($this->table)->select('id as bom_id')->where([['material_id','=',$v->material_id],['is_version_on','=',1]])->first();
//            if($has_bom){
//                $this->getBomSons($has_bom->bom_id,$enterMaterial);
//            }
//        }
//        //合并
//        $enterMaterial = array_merge($enterMaterial,obj2array($monther),obj2array($lzp));
//        //去重
//        $enterMaterial = $this->qc($enterMaterial,'material_id');
//        //后续添加查找物料属性
//        foreach ($enterMaterial as $k=>&$v){
//            $v['attributes'] = DB::table(config('alias.ma').' as ma')->select('ad.name','ma.value','uu.commercial')
//                ->leftJoin(config('alias.ad').' as ad','ad.id','ma.attribute_definition_id')
//                ->leftJoin(config('alias.uu').' as uu','uu.id','ad.unit_id')
//                ->where('ma.material_id',$v['material_id'])
//                ->get();
//        }
//        //后续添加查找物料附件
//        foreach ($enterMaterial as $k=>&$v){
//            $v['attachment'] = DB::table(config('alias.rma').' as rma')->select('a.name','a.path')
//                ->leftJoin(config('alias.attachment').' as a','a.id','rma.attachment_id')
//                ->where('rma.material_id',$v['material_id'])
//                ->get();
//        }
//        return $enterMaterial;
//    }
//
//    /**
//     * 获取顶级bom的儿子们(列表展示)
//     * @param $bom_id
//     * @param $arr
//     */
//    public function getBomSons($bom_id,&$arr){
//        //获取父节点的儿子们(包含伪儿子)
//        $child = DB::table(config('alias.rbi').' as rbi')->select('rbi.material_id','rm.name','rm.item_no','uu.commercial','rbi.usage_number')
//            ->leftJoin(config('alias.rm').' as rm','rm.id','rbi.material_id')
//            ->leftJoin(config('alias.uu').' as uu','uu.id','rm.unit_id')
//            ->where('rbi.bom_id',$bom_id)
//            ->get();
//        $arr = array_merge(obj2array($child),$arr);
//        //递归遍历亲儿子们
//        foreach($child as $key=>&$value){
//            //看看儿子们是否有bom结构
//            $has_bom = DB::table($this->table)->select('id as bom_id')->where([['material_id','=',$value->material_id],['is_version_on','=',1]])->first();
//            //给儿子们找儿子(递归下去就是一条家谱树)
//            if($has_bom){
//                $this->getBomSons($has_bom->bom_id,$arr);
//            }
//        }
//    }
//
//    /**
//     * 根据进料集合获取出料
//     * @param $bom_id
//     * @param $materials
//     * @return array
//     */
//    public function getOutBomMaterial($bom_id,$materials){
//        $outMaterial = [];
//        $materials = json_decode($materials,true);
//        //查找所有物料的父项
//        $allParent = [];
//        foreach ($materials as $k=>$v){
//            $parent = DB::table(config('alias.rbi'))->where('material_id',$v)->pluck('bom_id');
//            if($k == 0){
//                $allParent = obj2array($parent);
//            }else{
//                //取交集获取相同父亲
//                $allParent = array_intersect($allParent,obj2array($parent));
//            }
//        }
//        //重建索引
//        $allParent = array_values($allParent);
//        //找寻每个父亲的顶级bom，如果和传入的顶级bom相同则该父亲是需要的出料
//        foreach ($allParent as $k=>$v){
//            $parentMaterial = DB::table($this->table.' as rb')->select('rb.material_id','rm.name','rm.item_no','uu.commercial')
//                ->leftJoin(config('alias.rm').' as rm','rm.id','rb.material_id')
//                ->leftJoin(config('alias.uu').' as uu','uu.id','rm.unit_id')
//                ->where([['rb.is_version_on','=',1],['rb.id','=',$v]])->first();
//            $this->getMontherBomBySon($v,$outMaterial,$bom_id,$parentMaterial);
//        }
//        //如果他的父亲有儿子的个数和传入的进料数不对，这里应该要判断出来返回不出出料
//        foreach ($outMaterial as $k=>$v){
//            $sons = DB::table(config('alias.rbi').' as rbi')->select('rbi.material_id')
//                ->leftJoin(config('alias.rb').' as rb','rbi.bom_id','rb.id')
//                ->where([['rb.is_version_on','=',1],['rb.material_id','=',$v->material_id]])->get();
//            if(count($sons) != count($materials)) unset($outMaterial[$k]);
//        }
//        //顶级bom自身物料也应该作为出料
//        $montherBomMaterial = DB::table($this->table.' as rb')->select('rb.material_id','rm.name','rm.item_no','uu.commercial')
//            ->leftJoin(config('alias.rm').' as rm','rm.id','rb.material_id')
//            ->leftJoin(config('alias.uu').' as uu','uu.id','rm.unit_id')
//            ->where([['rb.id','=',$bom_id]])->first();
//        if(!empty($montherBomMaterial)){
//            $montherBomMaterial->is_monther = 1;
//            $outMaterial[] = $montherBomMaterial;
//        }
//        //去掉重复的
//        $outMaterial = $this->qc(obj2array($outMaterial),'material_id');
//        return $outMaterial;
//    }
//
//
//    public function getMontherBomBySon($parent_bom_id,&$arr,$bom_id,$parentMaterial){
//        //如果该bom_id等于顶级bom的id，那么它上个递归的父亲物料就是出料的一员
//        if($parent_bom_id == $bom_id){
//            if(!empty($parentMaterial)) $arr[] = $parentMaterial;
//        }else{
//            //如果不等于，那么需要判定它是否还有父亲
//            //查找父亲的物料id
//            $material  = DB::table($this->table.' as rb')->select('rb.material_id','rm.name','rm.item_no')
//                ->leftJoin(config('alias.rm').' as rm','rm.id','rb.material_id')
//                ->where([['rb.is_version_on','=',1],['rb.id',$parent_bom_id]])->first();
//            if(!empty($material)){
//                $parent = DB::table(config('alias.rbi'))->where('material_id',$material->material_id)->pluck('bom_id');
//                if(!empty($parent)){
//                    //如果他还有父亲，那么递归查找它的顶级bom，判断是否是出料的一员
//                    foreach (obj2array($parent) as $k=>$v){
//                        $this->getMontherBomBySon($v,$arr,$bom_id,$parentMaterial);
//                    }
//                }
//            }
//        }
//
//    }



    /**
     * 根据物料ID获取设计bom
     * @param $material_id
     * @return mixed
     */
    public function getDesignBom($material_id,$bom_no = '01')
    {
        $bom = DB::table(config('alias.rb').' as rb' )
            ->select('rb.id as bom_id','rb.status','rb.is_version_on','material_id','rb.code','rb.name','rb.version','rb.version_description','u.name as user_name','rb.was_release','rb.bom_no')
            ->leftJoin(config('alias.u').' as u','rb.creator_id','=','u.id')
            ->where([['rb.material_id','=',$material_id],['bom_no','=',$bom_no]])
            ->get();
        return $bom;

    }

    /**
     * 版本发布前检验
     * @param $material_id
     * @return mixed
     */
    public function releaseBeforeCheck($material_id,$bom_no = '01')
    {
        $bom_item = DB::table(config('alias.rbi'))
            ->select('id')
            ->where([['material_id',"=",$material_id],['bom_no','=',$bom_no]])
            ->count();
        return $bom_item;
    }


//endregion

//region 增
    /**
     * bom的添加接口
     * @param $input
     * @return mixed
     */
    public function add(&$input)
    {

        $this->checkRules($input);
        $this->checkFormFields($input);
        $bom_tree   = $input['bom_tree'];
        try {
            //开启事务
            DB::connection()->beginTransaction();
            //1.物料清单基础资料添加
            $bom_id=$this->addBom($input);

            //2.物料清单项添加
            if(!empty($bom_tree)){
                $result = $this->addBomItem($bom_tree['children'],$bom_id,$input['material_id']);
                //3.更新bom
                if(is_array($result)) $this->updateBom($result,$bom_id);
            }

            //4.保存bom附件
            if(!empty($input['input_ref_arr_attachments'])) $this->saveBomAttachments($input['input_ref_arr_attachments'],$bom_id,$input['creator_id']);
        } catch (\ApiException $e) {
            //回滚
            DB::connection()->rollBack();
            TEA($e->getCode());
        }
        DB::connection()->commit();
        return $bom_id;




    }

    /**
     * 物料清单基础资料添加
     * @param $input
     * @return mixed
     * @throws \Exception
     * @throws \App\Exceptions\ApiException
     * @throws \Illuminate\Container\EntryNotFoundException
     */
    public function addBom($input)
    {
        //获取入库数组
        $data = [
            'code'=>$input['code'],//bom编码
            'name'=>$input['name'],//名称
            'version'=>$input['version'],//版本
            'version_description'=>$input['version_description'],//版本介绍
            'material_id'=>$input['material_id'],//物料id
            'loss_rate'=>$input['loss_rate'],
            'status'  => isset($input['status'])?$input['status']:0,
            'bom_group_id'=>$input['bom_group_id'],
            'qty'=>$input['qty'],
            'label'=>$input['label'],
            'description'=>$input['description'],
            'creator_id'=>$input['creator_id'],
            'operation_id'=>$input['operation_id'],
            'operation_ability'=>$input['operation_capacity'],
            'company_id'=>(!empty(session('administrator')->company_id)) ? session('administrator')->company_id: 0,
            'factory_id'=>(!empty(session('administrator')->factory_id)) ? session('administrator')->factory_id : 0,
            'mtime'=>time(),//最后修改时间
            'ctime'=>time(),//创建时间
            //对应sap字段
            'bom_no'=>!empty($input['bom_no']) ? $input['bom_no'] : '',
            'bom_sap_desc'=>!empty($input['bom_sap_desc']) ? $input['bom_sap_desc'] : '',
            'BMEIN'=>!empty($input['BMEIN']) ? $input['BMEIN'] : '',
            'STLAN'=>!empty($input['STLAN']) ? $input['STLAN'] : 0,
            'bom_unit_id'=>!empty($input['bom_unit_id']) ? $input['bom_unit_id'] :0,
        ];
        //入库
        $insert_id = DB::table($this->table)->insertGetId($data);
        if (!$insert_id) TEA('802');
        //添加日志
        $events=['action'=>'add', 'desc'=>'添加物料清单['.$input['name'].']基础信息'];
        Trace::save($this->table,$insert_id,$input['creator_id'],$events);
        return $insert_id;
    }
    /**
     * 插入物料子项以及替换物料
     * @param $bom_tree
     * @param $bom_id
     * @param $bom_material_id
     * @return array|bool
     */
    public function addBomItem($bom_tree,$bom_id,$bom_material_id)
    {
        //物料id
        $item_material_ids         = array();
        //替换物料id
        $item_replace_material_ids = array();
        //阶梯数据
        $qtyData = array();
        //替换项
        $replaceData = array();
        $i = 0;
        //遍历前端非空数据
        foreach ($bom_tree as $row){
            //加入子类以及自身的物料id
            $item_material_ids = array_merge($item_material_ids,$row['son_material_id']);
            array_push($item_material_ids,$row['material_id']);
            //插入操作
            $data['bom_id']        = $bom_id;
            $data['parent_id']     = 0;
            $data['material_id']   = $row['material_id'];
            $data['version']       = $row['version'];
            $data['bom_material_id']   = $bom_material_id;
            $data['loss_rate']     = $row['loss_rate'];
            $data['is_assembly']   = $row['is_assembly'];
            $data['bom_no'] = !empty($row['bom_no']) ? $row['bom_no'] : '';
            $data['AENNR'] = !empty($row['AENNR']) ? $row['bom_no'] : 0;
            $data['DATUV'] = !empty($row['DATUV']) ? $row['DATUV'] : 0;
            $data['DATUB'] = !empty($row['DATUB']) ? $row['DATUB'] : 0;
            $data['POSNR'] = !empty($row['POSNR']) ? $row['POSNR'] : '';
            $data['POSTP'] = !empty($row['POSTP']) ? $row['POSTP'] : '';
            $data['MEINS'] = !empty($row['MEINS']) ? $row['MEINS'] : '';
            $data['bom_unit_id'] = !empty($row['bom_unit_id']) ? $row['bom_unit_id'] : 0;
            $data['usage_number']  = $row['usage_number'];
            $data['comment']       = $row['comment'];
            $data['total_consume'] = $row['total_consume'];
            $insert_id = DB::table(config('alias.rbi') )->insertGetId($data);
            if (!$insert_id) TEA('802');
            //遍历阶梯数据

            foreach ($row['bom_item_qty_levels']  as $rowQty){
                $qtyData[$i]['bom_item_id'] = $insert_id;
                $qtyData[$i]['parent_min_qty'] = $rowQty['parent_min_qty'];
                $qtyData[$i]['qty'] = $rowQty['qty'];
                $i++;
            }
            //遍历替换物料数据
            foreach ($row['replaces'] as $rowReplace ){
                //加入子类以及自身的物料id
                $item_replace_material_ids = array_merge($item_replace_material_ids,$rowReplace['son_material_id']);
                array_push($item_replace_material_ids,$rowReplace['material_id']);

                //插入操作
                $replaceData['bom_id']        = $bom_id;
                $replaceData['bom_material_id']   = $bom_material_id;
                $replaceData['parent_id']     = $insert_id;
                $replaceData['material_id']   = $rowReplace['material_id'];
                $replaceData['version']       = $rowReplace['version'];
                $replaceData['loss_rate']     = $rowReplace['loss_rate'];
                $replaceData['is_assembly']   = $rowReplace['is_assembly'];
                $replaceData['bom_no'] = !empty($rowReplace['bom_no']) ? $rowReplace['bom_no'] : '';
                $replaceData['AENNR'] = !empty($rowReplace['AENNR']) ? $rowReplace['AENNR'] : 0;
                $replaceData['DATUV'] = !empty($rowReplace['DATUV']) ? $rowReplace['DATUV'] : 0;
                $replaceData['DATUB'] = !empty($rowReplace['DATUB']) ? $rowReplace['DATUB'] : 0;
                $replaceData['POSNR'] = !empty($replaceData['POSNR']) ? $replaceData['POSNR'] : '';
                $replaceData['POSTP'] = !empty($replaceData['POSTP']) ? $replaceData['POSTP'] : '';
                $replaceData['MEINS'] = !empty($replaceData['MEINS']) ? $replaceData['MEINS'] : '';
                $replaceData['bom_unit_id'] = !empty($replaceData['bom_unit_id']) ? $replaceData['bom_unit_id'] : 0;
                $replaceData['usage_number']  = $rowReplace['usage_number'];
                $replaceData['comment']       = $rowReplace['comment'];
                $replaceData['total_consume'] = $rowReplace['total_consume'];
                $replace_insert_id = DB::table(config('alias.rbi') )->insertGetId($replaceData);
                if (!$replace_insert_id) TEA('802');
                //遍历阶梯数据
                foreach ($rowReplace['bom_item_qty_levels']  as $rowReplaceQty){
                    $qtyData[$i]['bom_item_id']    = $replace_insert_id;
                    $qtyData[$i]['parent_min_qty'] = $rowReplaceQty['parent_min_qty'];
                    $qtyData[$i]['qty']            = $rowReplaceQty['qty'];
                    $i++;
                }
            }
        }
        if(!empty($qtyData)) DB::table(config('alias.rbiql') )->insert($qtyData);

        if(empty($item_material_ids) && empty($item_replace_material_ids)){
            return false;
        }else{
            return array('item_material_path'=>empty(implode(',',$item_material_ids))?'':','.implode(',',$item_material_ids).',','replace_material_path'=>empty(implode(',',$item_replace_material_ids))?'':','.implode(',',$item_replace_material_ids).',');
        }

    }



    /**
     * 保存bom附件
     * @param $input_attachments
     * @param $material_id
     * @throws ApiException
     * @author sam.shan   <sam.shan@ruis-ims.cn>
     */
    public function saveBomAttachments($input_attachments,$bom_id,$creator_id)
    {

        //1.获取数据库中已经存在的附件
        $db_ref_obj=DB::table(config('alias.rba'))->where('bom_id',$bom_id)->pluck('comment','attachment_id');
        $db_ref_arr=obj2array($db_ref_obj);
        $db_ids=array_keys($db_ref_arr);
        //2.获取前端传递的附件
        $input_ref_arr=$input_attachments;
        $input_ids=array_keys($input_ref_arr);
        //3.通过颠倒位置的差集获取改动情况,多字段要考虑编辑的情况额[有的人喜欢先删除所有然后变成全部添加,这种是错误的投机取巧行为,要杜绝!]
        $set=get_array_diff_intersect($input_ids,$db_ids);
        if(!empty($set['add_set']) || !empty($set['del_set']) || $set['common_set'])  $m=new BomAttachment();

        //4.要添加的
        if(!empty($set['add_set']))  $m->addSet($set['add_set'],$bom_id,$input_ref_arr,$creator_id);
        //5.要删除
        if(!empty($set['del_set']))  $m->delSet($set['del_set'],$bom_id,$db_ref_arr,$creator_id);
        //6.可能要编辑的
        if(!empty($set['common_set']))  $m->commonSet($set['common_set'],$bom_id,$db_ref_arr,$input_ref_arr,$creator_id);


    }


//endregion

//region 改


    public function changeAssembly($input)
    {
        if(!isset($input['bom_item_id'])) TEA('700');
        $result = DB::table(config('alias.rbi'))
            ->where('id', $input['bom_item_id'])
            ->update(['is_assembly'=>1]);
        if($result===false) TEA('806');
    }

    /**
     * @param $input
     * @return mixed
     * @throws \Exception
     * @throws \App\Exceptions\ApiException
     */
    public function update(&$input)
    {
        //判断是否升级 是的话 直接进入add方法
        if($input['is_upgrade'] == 1){
            $bom_new_id = $this->upgradeBom($input);
            return $bom_new_id;
        }
        //校验
        $this->checkRules($input);
        $bom_tree        = $input['bom_tree'];
        $data = [
            //'code'=>$input['code'],//bom编码
            'name'=>$input['name'],//名称
            //'version'=>$input['version'],//版本
            //'version_description'=>$input['version_description'],//版本介绍
            'material_id'=>$input['material_id'],//物料id
            'operation_id'=>$input['operation_id'],//物料id
            'operation_ability'=>$input['operation_capacity'],
            'loss_rate'=>$input['loss_rate'],
            'label'=>$input['label'],
            'bom_group_id'=>$input['bom_group_id'],
            'qty'=>$input['qty'],
            'description'=>$input['description'],
            'mtime'=>time(),//最后修改时间
            //对应sap字段
            'bom_no'=>$input['bom_no'],
            'bom_sap_desc'=>$input['bom_sap_desc'],
            'BMEIN'=>$input['BMEIN'],
            'STLAN'=>$input['STLAN'],
        ];
        $this->checkFormFields($input);
        $tmp = DB::table($this->table)
            ->where('id', $input['bom_id'])
            ->first();

        $bom_really_tree = $this->getBomTree($input['material_id'],$tmp->version,true,true,false,$input['bom_no']);
        try {
            //开启事务
            DB::connection()->beginTransaction();
            //1.物料清单基础资料更新
            $this->doCheck($input,'master','update',$input['bom_id'],$input['creator_id']);
            $this->updateBom($data,$input['bom_id']);
            //2.更新子项内容
            $this->check($bom_tree['children'],obj2array($bom_really_tree->children),$input);
            //3.保存附件
            $this->saveBomAttachments($input['input_ref_arr_attachments'],$input['bom_id'],$input['creator_id']);
            //4.删除缓存
            $cache_key = make_redis_key(['bom_detail',$input['bom_id']]);
            Cache::forget($cache_key);

        } catch (\ApiException $e) {
            //回滚
            DB::connection()->rollBack();
            TEA($e->getCode());
        }
        DB::connection()->commit();
        return null;
    }

    /**
     * bom升级
     * @param $input
     * @return mixed
     * @throws \App\Exceptions\ApiExcepiton
     */
    public function upgradeBom($input){
        $bom = DB::table($this->table)
            ->where([['material_id','=',$input['material_id']],['bom_no','=',$input['bom_no']]])
            ->orderBy('version','DESC')
            ->limit(1)
            ->first();
        $input['version']             = $bom->version+1;
        $input['status']              = $bom->status;
        $input['source_version']      = $bom->version;
        $bomRoutingDao = new BomRouting();
        try{
            DB::connection()->beginTransaction();
            $bom_new_id = $this->add($input);
            //1.保存老bom当前编辑的工艺路线信息
            if(!empty($input['current_routing_info']['routing_info'] && !empty($input['current_routing_info']['routing_id']))){
                $routing_data = [
                    'bom_id'=>$bom_new_id,
                    'routing_info'=>$input['current_routing_info']['routing_info'],
                    'routing_id'=>$input['current_routing_info']['routing_id'],
                    'routings'=>'[{"routing_id":'.$input['current_routing_info']['routing_id'].',"is_default":'.$input['current_routing_info']['is_default'].',"factory_id":'.$input['current_routing_info']['factory_id'].'}]',
                    'is_upgrade'=>1,
                    'version'=>$input['version'],
                    'version_description'=>$input['version_description'],
                    'control_info'=>$input['current_routing_info']['control_info']
                ];
                $bomRoutingDao->checkBomRoutingFormField($routing_data);
                $bomRoutingDao->saveBomRoutingInfo($routing_data);
            }
            //2.复制除当前编辑以外老bom的工艺路线
            $bomRoutingDao->addBomRoutingByUpgrade($bom_new_id,$input['bom_id'],$input['current_routing_info']['routing_id'],$input['version'],$input['version_description']);
        }catch (\ApiException $exception){
            DB::connection()->rollback();
            TEA($exception->getCode());
        }
        DB::connection()->commit();
        return $bom_new_id;
    }

    /**
     * 更新物料id路径
     * @param $data
     * @param $bom_id
     */
    public function updateBom($data,$bom_id)
    {
        $result = DB::table($this->table)
            ->where('id', $bom_id)
            ->update($data);
        if($result===false) TEA('806');
    }

    /**
     * 更新物料清单item
     * @param $data
     * @param $bom_item_id
     */
    public function updateBomItem($data,$bom_item_id)
    {
        $result = DB::table(config('alias.rbi'))
            ->where('id', $bom_item_id)
            ->update($data);
        if($result===false) TEA('806');
    }

    /**
     * 更新一条物料清单
     * @param $data
     * @param $bom_item_qty_id
     */
    public function updateBomQty($data,$bom_item_qty_id){
        $result = DB::table(config('alias.rbiql'))
            ->where('id', $bom_item_qty_id)
            ->update($data);
        if($result===false) TEA('806');
    }


    /**
     * 修改状态
     * @param $input
     */
    public function changeStatus($input)
    {
        $this->checkRules($input);
        //$creator_id = $this->getUserFieldByCookie($input['cookie'],'id');
        $creator_id = (!empty(session('administrator')->admin_id)) ? session('administrator')->admin_id : 0;
        if($input['status'] !='0' && $input['status'] !='1'){
            TEA('2108');
        }
        switch ($input['type']){
            case "active":
                $this->active($input['bom_id'],$input['status'],$creator_id);
                break;
            case "release":
                $this->release($input['bom_id'],$input['status'],$creator_id);
                break;
            default:
                TEA('2109');
                break;
        }
    }

    public function active($bom_id,$status,$creator_id)
    {
        if($status == 1){
            $word = "激活";
        }else{
            $word = "冻结";
        }
        $bom = DB::table(config('alias.rb') )->where('id',"=",$bom_id)->first();
        $result = DB::table(config('alias.rb'))
            ->where('material_id', $bom->material_id)
            ->update(array('status'=>$status));
        $events=[
            'field'=>'bom_id',
            'comment'=>'激活状态',
            'action'=>'update',
            'desc'=>'修改状态为'.$word,
        ];
        Trace::save(config('alias.rb'),$bom_id,$creator_id,$events);
        if($result===false) TEA('806');

    }

    public function release($bom_id,$status,$creator_id)
    {
        if($status == 1){
            $word = "修改当前版本为发布状态";
        }else{
            $word = "修改当前版本为取消发布状态";
        }
        try {
            //开启事务
            DB::connection()->beginTransaction();
            $bom = DB::table(config('alias.rb') )->where('id',"=",$bom_id)->first();
            //将所有版本的状态改为未发布
            $result = DB::table(config('alias.rb'))
                ->where([['material_id','=',$bom->material_id],['bom_no','=',$bom->bom_no]])
//                ->where([['material_id','=',$bom->material_id]])
                ->update(array('is_version_on'=>0));
            if($result===false) TEA('806');

            //将当前版本改为发布
            $result = DB::table(config('alias.rb'))
                ->where('id', $bom_id)
                ->update(['is_version_on'=>$status,'was_release'=>1]);
            if($result===false) TEA('806');

            //将所有被用到的更新版本
            $count = DB::table(config('alias.rbi'))
                ->where([['material_id','=',$bom->material_id],['bom_no','=',$bom->bom_no]])
                ->count();
            if($count >0){
                $result = DB::table(config('alias.rbi'))
                    ->where([['material_id','=',$bom->material_id],['bom_no','=',$bom->bom_no]])
//                    ->where([['material_id','=',$bom->material_id]])
                    ->update(array('version'=>$bom->version));
                if($result===false) TEA('806');
            }



        } catch (\ApiException $e) {
            //回滚
            DB::connection()->rollBack();
            TEA($e->getCode());
        }
        DB::connection()->commit();
        $events=[
            'field'=>'bom_id',
            'comment'=>'激活状态',
            'action'=>'update',
            'desc'=>$word,
        ];
        Trace::save(config('alias.rb'),$bom_id,$creator_id,$events);
        return ;

    }

//endregion

//region 删
    /**
     * 整体树的删除
     * @param $tree
     */
    public function deleteBomItem($tree)
    {
        foreach ($tree as $row){
            $replaceIds  =  array();
            $qtyIds      =  array();
            DB::table(config('alias.rbi') )->where('id',"=",$row['bom_item_id'])->delete();
            foreach ($row['replaces'] as $replaceRow){
                $replaceIds[] = $replaceRow['bom_item_id'];
            }
            foreach ($row['bom_item_qty_levels'] as $qtyRow){
                $qtyIds[] = $qtyRow['bom_item_qty_level_id'];
            }
            if(!empty($replaceIds)){
                DB::table(config('alias.rbi') )->whereIn('id', $replaceIds)->delete();
            }
            if(!empty($qtyIds)){
                DB::table(config('alias.rbiql') )->whereIn('id', $qtyIds)->delete();
            }
        }
    }

    /**
     * 删除具体的替换物料
     * @param $data
     */
    public function deleteBomReplace($data)
    {
        foreach ($data as $row){
            DB::table(config('alias.rbi') )->where('id',"=",$row['bom_item_id'])->delete();
            foreach ($row['bom_item_qty_levels'] as $qtyRow){
                $qtyIds[] = $qtyRow['bom_item_qty_level_id'];
            }
            if(!empty($qtyIds)){
                DB::table(config('alias.rbiql') )->whereIn('id', $qtyIds)->delete();
            }
        }
    }

    /**
     * 删除具体的阶梯用量
     * @param $data
     */
    public function deleteBomQty($data)
    {
        foreach ($data as $qtyRow){
            $qtyIds[] = $qtyRow['bom_item_qty_level_id'];
        }
        if(!empty($qtyIds)){
            DB::table(config('alias.rbiql') )->whereIn('id', $qtyIds)->delete();
        }
    }

    /**
     * bom删除
     * @param $id
     */
    public function destroy($id)
    {
        $bom = DB::table(config('alias.rb') )->where('id',"=",$id)->first();
        $material_id = $bom->material_id;
        $num = DB::table(config('alias.rb') )->where('material_id',"=",$material_id)->count();
        if($num >1){
            TEA('2107');
        }
        $has = DB::table(config('alias.rbi') )->where('material_id',"=",$material_id)->first();
        if(!empty($has)){
            TEA('2106');
        }
        try {
            DB::connection()->beginTransaction();
            $items  = array();
            //删除bom
            DB::table(config('alias.rb') )->where('id',"=",$id)->delete();
            //找出bom_item
            $bom_items = DB::table(config('alias.rbi') )->where('bom_id',"=",$bom->id)->get();
            //删除bom_item
            DB::table(config('alias.rbi') )->where('bom_id',"=",$bom->id)->delete();
            //删除阶梯用量
            foreach ($bom_items as $bom_item){
                $items[] = $bom_item->id;
            }
            if(!empty($items)){
                DB::table(config('alias.rbiql') )->whereIN('bom_item_id',$items)->delete();
            }
            //删除工艺路线
            $bomRoutingDao = new BomRouting();
            //先找出bom的工艺路线
            $routing_ids = DB::table(config('alias.rbr'))->where('bom_id',$id)->pluck('routing_id');
            foreach ($routing_ids as $k=>$v){
                $bomRoutingDao->deleteBomRouting($id,$v);
            }

        } catch (\ApiException $e) {
            //回滚
            DB::connection()->rollBack();
            TEA($e->getCode());
        }
        DB::connection()->commit();


    }





//endregion

//region 额外

    /**
     * 对比
     * @param $bom_tree
     * @param $real_tree
     * @param $input
     */
    public function check($bom_tree,$real_tree,&$input)
    {
        $bomTree = new CheckBomItem($bom_tree,$real_tree);
        // ITEM: 删除项
        if(!empty($bomTree->delete)){
            $this->deleteBomItem($bomTree->delete);
            $this->doCheck($bomTree,'item','delete',$input['bom_id'],$input['creator_id']);
        }

        // ITEM: 更新并检验 项中的 除阶梯用量和替换物料的内容
        if(!empty($bomTree->update)){
            foreach ($bomTree->update as $key=>$value){
                foreach ($value as $k=>$v){
                    $update_data[$k] = $bomTree->deal[$key][$k];
                }
                if(!empty($update_data)) $this->updateBomItem($update_data,$bomTree->deal[$key]['bom_item_id']);
            }
            $this->doCheck($bomTree,'item','update',$input['bom_id'],$input['creator_id']);

        }

        // ITEM: 添加新增项 包括阶梯用量和替换物料
        if(!empty($bomTree->add)){
            $this->addBomItem($bomTree->add,$input['bom_id'],$input['material_id']);
            $this->doCheck($bomTree,'item','add',$input['bom_id'],$input['creator_id']);
        }




        // REPLACE: 删除替换物料
        if(!empty($bomTree->replace_delete)){
            foreach ($bom_tree->replace_delete as $row){
                $this->deleteBomReplace($row);
            }

            $this->doCheck($bomTree,'replace','delete',$input['bom_id'],$input['creator_id']);

        }
        // REPLACE: 更新替换物料
        if(!empty($bomTree->replace_update)){
            foreach ($bomTree->replace_update as $key=>$value){
                foreach ($value as $k=>$v){
                    foreach ($v as $k1=>$v2){
                        $update_replace_data[$k1] = $bomTree->deal[$key]['replaces'][$k][$k1];
                    }
                    if(!empty($update_replace_data)) $this->updateBomItem($update_replace_data,$bomTree->deal[$key]['replaces'][$k]['bom_item_id']);
                }
            }
            $this->doCheck($bomTree,'replace','update',$input['bom_id'],$input['creator_id']);
        }

        // REPLACE: 新增和检验 替换物料
        if(!empty($bomTree->replace_add)){
            $i = 0;
            foreach ($bomTree->replace_add as $key=>$value) {
                foreach ($value as $row) {
                    $add_replace_data = [
                        'material_id' => $row['material_id'],//bom编码
                        'loss_rate' => $row['loss_rate'],//名称
                        'is_assembly' => $row['is_assembly'],//版本
                        'usage_number' => $row['usage_number'],//版本介绍
                        'comment' => $row['comment'],
                        'version' => $row['version'],
                        'total_consume' => $row['total_consume'],
                        'parent_id' => $row['parent_id'],
                        'bom_material_id' => $row['bom_material_id'],
                        'bom_id' => $row['bom_id'],
                    ];
                    $tmp_insert_id = DB::table(config('alias.rbi'))->insertGetId($add_replace_data);
                    foreach ($row['bom_item_qty_levels'] as $qty_row) {
                        $qty_data[$i]['parent_min_qty'] = $qty_row['parent_min_qty'];
                        $qty_data[$i]['qty'] = $qty_row['qty'];
                        $qty_data[$i]['bom_item_id'] = $tmp_insert_id;
                        $i++;
                    }
                }
                if (!empty($qty_data)) DB::table(config('alias.rbiql'))->insert($qty_data);
            }
            $this->doCheck($bomTree,'replace','add',$input['bom_id'],$input['creator_id']);

        }

        // QTY :删除替换物料
        if(!empty($bomTree->qty_delete)){
            foreach ($bomTree->qty_delete as $key => $value){
                $this->deleteBomQty($value);
            }
            $this->doCheck($bomTree,'qty','delete',$input['bom_id'],$input['creator_id']);

        }

        //QTY :更新
        if(!empty($bomTree->qty_update)){
            foreach ($bomTree->qty_update as $key=>$value){
                foreach ($value as $k=>$v){
                    foreach ($v as $k1=>$v1){
                        $update_qty_data[$k1] = $bomTree->deal[$key]['bom_item_qty_levels'][$k][$k1];
                    }
                    if(!empty($update_qty_data))
                        $this->updateBomQty($update_qty_data,$k);
                    unset($update_qty_data);
                }
            }
            $this->doCheck($bomTree,'qty','update',$input['bom_id'],$input['creator_id']);
        }

        // QTY: 替换物料的新增
        if(!empty($bomTree->qty_add)){
            foreach ($bomTree->qty_add as $key=>$value){
                foreach ($value as $row){
                    $add_qty_data[] = [
                        'bom_item_id'=>$row['bom_item_id'],//bom编码
                        'parent_min_qty'=>$row['parent_min_qty'],//名称
                        'qty'=>$row['qty'],//版本

                    ];
                }
                if(!empty($add_qty_data))
                DB::table(config('alias.rbiql') )->insert($add_qty_data);
                unset($add_qty_data);
            }
            $this->doCheck($bomTree,'qty','add',$input['bom_id'],$input['creator_id']);
        }


        //REPLACE_QTY: 删除
        if(!empty($bomTree->replace_qty_delete)){
            foreach ($bomTree->replace_qty_delete as $key=>$value){
              foreach ($value as $k=>$v){
                  $this->deleteBomQty($v);
              }
            }
            $this->doCheck($bomTree,'replace_qty','delete',$input['bom_id'],$input['creator_id']);
        }

        //REPLACE_QTY:  更新
        if(!empty($bomTree->replace_qty_update)){
            foreach ($bomTree->replace_qty_update as $key=>$value){
                foreach ($value as $k=>$v){
                    foreach ($v as $k1=>$v1){
                        foreach ($v1 as $k2 =>$v2){
                            $update_qty_data[$k2] = $bomTree->deal[$key]['replaces'][$k]['bom_item_qty_levels'][$k1][$k2];
                        }
                        if(!empty($update_qty_data))
                            $this->updateBomQty($update_qty_data,$k1);
                        unset($update_qty_data);
                    }
                }
            }
            $this->doCheck($bomTree,'replace_qty','update',$input['bom_id'],$input['creator_id']);
        }

        // REPLACE_QTY: 新增
        if(!empty($bomTree->replace_qty_add)){
            foreach ($bomTree->replace_qty_add  as $key=>$value){
                foreach ($value as $k=>$v){
                    foreach ($v as $row){
                        $add_qty_data[] = [
                            'bom_item_id'=>$row['bom_item_id'],//bom编码
                            'parent_min_qty'=>$row['parent_min_qty'],//名称
                            'qty'=>$row['qty'],//版本

                        ];
                    }
                    if(!empty($add_qty_data)) DB::table(config('alias.rbiql') )->insert($add_qty_data);
                    unset($add_qty_data);
                }
            }
            $this->doCheck($bomTree,'replace_qty','add',$input['bom_id'],$input['creator_id']);
        }

        //TODO 缓存redis
        $update_route = array('item_material_path'=>$bomTree->item_material_path,'replace_material_path'=>$bomTree->replace_material_path);
        $this->updateBom($update_route,$input['bom_id']);
    }

    /**
     * @param $data
     * @param $type
     * @param $way
     * @param int $bom_id
     * @param int $creator_id
     */
    public function doCheck($data,$type,$way,$bom_id,$creator_id)
    {
        switch ($type){
            case 'master':
                $fields = ['name','bom_group_id','qty','loss_rate','description','label'];
                $bom    =  DB::table(config('alias.rb'))->where('id','=',$data['bom_id'])->first();
                foreach ($fields as $row){
                    if($data[$row] != $bom->$row){
                        if($row == 'bom_group_id'){
                            if($bom->$row == 0){
                                $group_old = new \stdClass();
                                $group_old->name = '""';
                            }else{
                                $group_old = DB::table(config('alias.rbg'))->select('name')->where('id','=',$bom->$row)->first();
                            }
                            if($data[$row] == 0){
                                $group_new = new \stdClass();
                                $group_new->name = '""';
                            }else{
                                $group_new = DB::table(config('alias.rbg'))->select('name')->where('id','=',$data[$row])->first();
                            }


                            $data[$row] = $group_new->name;
                            $bom->$row  = $group_old->name;
                        }
                        $events=[
                            'field'=>'bom_id',
                            'comment'=>'基础资料',
                            'action'=>$way,
                            'desc'=>$this->getDesc($way,[$row=>'['.$bom->$row.']变为['.$data[$row].']'],$type),
                        ];
                        Trace::save(config('alias.rb'),$bom_id,$creator_id,$events);
                    }
                }
                break;
            case 'item':
                $element = $way;
                if(!empty($data->$element)){
                    foreach ($data->$element as $key=>$value){
                        $item_no = $way=='update'?$data->deal[$key]['item_no']:$data->$element[$key]['item_no'];
                        $events=[
                            'field'=>'bom_id',
                            'comment'=>'项',
                            'action'=>$way,
                            'desc'=>$this->getDesc($way,$value,$type,['item_no'=>$item_no]),
                        ];
                        Trace::save(config('alias.rb'),$bom_id,$creator_id,$events);

                    }
                }
                break;
            case 'qty':
                $element = $type.'_'.$way;
                if(!empty($data->$element)){
                    foreach ($data->$element as $key=>$value){
                        foreach ($value as $k=>$v){
                            $events=[
                                'field'=>'bom_id',
                                'comment'=>'阶梯用量',
                                'action'=>$way,
                                'desc'=>$this->getDesc($way,$v,$type,['item_no'=>$data->deal[$key]['item_no']]),
                            ];
                            Trace::save(config('alias.rb'),$bom_id,$creator_id,$events);
                        }
                    }
                }
                break;
            case 'replace':
                $element = $type.'_'.$way;
                if(!empty($data->$element)){
                    foreach ($data->$element as $key=>$value){
                        foreach ($value as $k=>$v){
                            $events=[
                                'field'=>'bom_id',
                                'comment'=>'替换物料',
                                'action'=>$way,
                                'desc'=>$this->getDesc($way,$v,$type,['item_no'=>$data->deal[$key]['item_no'],'replace_item_no'=>$data->deal[$key]['replaces'][$k]['item_no']]),
                            ];
                            Trace::save(config('alias.rb'),$bom_id,$creator_id,$events);
                        }
                    }
                }
                break;
            case 'replace_qty':
                $element = $type.'_'.$way;
                if(!empty($data->$element)){
                    foreach ($data->$element as $key=>$value){
                        foreach ($value as $k=>$v){
                            foreach ($v as $k1=>$v1){
                                $events=[
                                    'field'=>'bom_id',
                                    'comment'=>'替换物料',
                                    'action'=>$way,
                                    'desc'=>$this->getDesc($way,$v,$type,['item_no'=>$data->deal[$key]['item_no'],'replace_item_no'=>$data->deal[$key]['replaces'][$k]['item_no']]),
                                ];
                                Trace::save(config('alias.rb'),$bom_id,$creator_id,$events);

                            }

                        }
                    }
                }
                break;
        }
    }



    public function getDesc($way,$value,$type = '',$extra = array())
    {
        $config = config('dictionary');
        $desc = '';
        switch ($type){
            case 'master':
                foreach ($value as $k=>$v){
                    $desc = "将基础信息 ".$config[$type][$k]."的值由".$v;
                }
                break;
            case 'item':
                $tmp = '';
                if($way == 'update'){
                    foreach ($value as $k=>$v){
                        $tmp = $tmp." ".$config[$type][$k]."的值由".$v;
                    }
                }
                $desc = "项中物料编码为".$extra['item_no']." ".$tmp;
                break;
            case 'qty':
                $tmp = '';
                foreach ($value as $k=>$v){
                    if(array_key_exists($k,$config[$type])){
                        if($way == 'update'){
                            $tmp = $tmp." ".$config[$type][$k]."的值由".$v;
                        }else{
                            $tmp = $tmp." ".$config[$type][$k]."的值 [".$v."]";
                        }

                    }
                }
                $desc = "项中物料编码为".$extra['item_no']."的阶梯用量 ".$tmp;
                break;
            case 'replace':
                $tmp = '';
                if($way == 'update'){
                    foreach ($value as $k=>$v){
                        $tmp = $tmp." ".$config[$type][$k]."的值由".$v;
                    }
                }
                $desc = "项中物料编码为".$extra['item_no']."的替换物料".$extra['replace_item_no']." ".$tmp;
                break;
            case 'replace_qty':
                $tmp = '';
                foreach ($value as $k=>$v){
                    foreach ($v as $k1 => $v1){
                        if(array_key_exists($k1,$config[$type])){
                            $tmp = $tmp." ".$config[$type][$k1]."的值".$v1;
                        }
                    }
                }
                $desc = "项中物料编码为".$extra['item_no']."的替换物料".$extra['replace_item_no']."的阶梯用量 ".$tmp;
                break;
            case 'attach':
                $tmp = '';
                if($way == 'update'){
                    $tmp =  "描述的值由 ".$value['comment'];
                }
                $desc = "附件[".$value['name']."] ".$tmp;
                break;
            default:
                $desc = "";
        }


        return $desc;
    }


//endregion



}