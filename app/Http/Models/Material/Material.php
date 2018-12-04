<?php
/**
 * Created by sansheng
 * User: sansheng
 * Date: 17/10/19
 * Time: 下午13:39
 */

namespace App\Http\Models\Material;//定义命名空间
use App\Http\Models\Base;
use App\Http\Models\Encoding\EncodingSetting;
use App\Http\Models\OperationAttributeValue;
use App\Http\Models\SapApiRecord;
use App\Libraries\Trace;
use Illuminate\Support\Facades\DB;
use App\Http\Models\ImageAttribute;
use App\Http\Models\Erp\ErpBomDataImport;
use App\Http\Models\Erp\ErpMaterial;

/**
 * 物料操作类
 * @author  sam.shan  <sam.shan@ruis-ims.cn>
 * @time    2017年10月19日13:39:39
 */
class Material extends Base
{


    /**
     * 前端传递的api主键名称
     * @var string
     */
    public  $apiPrimaryKey='material_id';

    public  $keyValue;


    public  function __construct()
    {
        parent::__construct();
        $this->table=config('alias.rm');
        //操作日志需要编辑的字段，Type：1：直接存的值2：存的关联id 其他就是特殊情况 table是当type为2时需要查询的表名，field是需要查询的字段
        $this->keyValue = [
            'description'=>['name'=>'描述','type'=>1,'table'=>'','field'=>''],
            'identity_card'=>['name'=>'身份识别码','type'=>1,'table'=>'','field'=>''],
            'material_category_id'=>['name'=>'物料分类','type'=>2,'table'=>config('alias.rmc'),'field'=>'name'],
            'item_no'=>['name'=>'物料编码','type'=>1,'table'=>'','field'=>''],
            'name'=>['name'=>'物料名称','type'=>1,'table'=>'','field'=>''],
            'batch_no_prefix'=>['name'=>'批次号前缀','type'=>1,'table'=>'','field'=>''],
            'moq'=>['name'=>'最小订单数量','type'=>1,'table'=>'','field'=>''],
            'unit_id'=>['name'=>'基本单位','type'=>2,'table'=>config('alias.uu'),'field'=>'label'],
            'mpq'=>['name'=>'最小包装数量','type'=>1,'table'=>'','field'=>''],
            'weight'=>['name'=>'最小包装重量','type'=>1,'table'=>'','field'=>''],
            'height'=>['name'=>'最小包装高度','type'=>1,'table'=>'','field'=>''],
            'length'=>['name'=>'最小包装长度','type'=>1,'table'=>'','field'=>''],
            'width'=>['name'=>'最小包装宽度','type'=>1,'table'=>'','field'=>''],
            'source'=>['name'=>'物料来源','type'=>3,'table'=>'','field'=>''],
            'safety_stock'=>['name'=>'安全库存','type'=>1,'table'=>'','field'=>''],
            'max_stock'=>['name'=>'最高库存','type'=>1,'table'=>'','field'=>''],
            'min_stock'=>['name'=>'最低库存','type'=>1,'table'=>'','field'=>''],
            'fixed_advanced_period'=>['name'=>'固定提前期','type'=>1,'table'=>'','field'=>''],
            'cumulative_lead_time'=>['name'=>'累计提前期','type'=>1,'table'=>'','field'=>''],
            'label'=>['name'=>'标签','type'=>1,'table'=>'','field'=>''],
            'is_provider'=>['name'=>'是否指定供应商','type'=>4,'table'=>'','field'=>''],
        ];
    }





//region 检


    /**
     * 检查基础信息字段
     * @param $input
     * @author  sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function checkBaseFormFields(&$input,$add)
    {

        //1.material_category_id 物料分类 Y
            #1.1数据类型检测
        if(empty($input['material_category_id']) || !is_numeric($input['material_category_id'])) TEA('700','material_category_id');
            #1.2 物料分类是存在数据库中的
        $has=$this->isExisted([['id','=',$input['material_category_id']]],config('alias.rmc'));
        if(!$has)  TEA('701','material_category_id');
        //2.name  物料名称YU
            #2.1 非空检测
        if(empty($input['name']))  TEA('700','name');
            #2.2 唯一性检测
//        $check=$add?[['name','=',$input['name']]]:[['name','=',$input['name']],[$this->primaryKey,'<>',$input[$this->apiPrimaryKey]]];
//        $has=$this->isExisted($check);
//        if($has) TEA('7000','name');
        //3.batch_no_prefix  批次号前缀N
            #3.1 参数是否传递
        if(!isset($input['batch_no_prefix']))  TEA('700','batch_no_prefix');
        //4.item_no 物料编码YUS
            #4.1 不可以为空
        if(empty($input['item_no']))  TEA('700','item_no');
            #4.2 唯一性检测
        $check=$add?[['item_no','=',$input['item_no']]]:[['item_no','=',$input['item_no']],[$this->primaryKey,'<>',$input[$this->apiPrimaryKey]]];
        $has=$this->isExisted($check);
        if($has) TEA('7001','item_no');
            #4.3 编码规则
        if(!preg_match(config('app.pattern.item_no'),$input['item_no'])) TEA('701','item_no');
        //5.moq    最小订单数量N
            #5.1 参数检测
        if(!isset($input['moq']))  TEA('700','moq');
            #5.2 处理空字符串,否则入库的时候会自动转成数字0
        if(!is_numeric($input['moq']))  $input['moq']=NULL;
        //6.description     描述(不超过500字) N
            #6.1 参数以及字数限制检测
        if(!isset($input['description']) || mb_strlen($input['description']) >config('app.comment.material')) TEA('700','description');
        //7.unit_id   单位  Y
            #7.1非空检测
            if(empty($input['unit_id']))  TEA('700','unit_id');
            #7.2数据来源是否正确
            $has=$this->isExisted([['id','=',$input['unit_id']]],config('alias.uu'));
            if(!$has)  TEA('701','unit_id');

        //8.mpq       最小包装数量 N
            #8.1 参数检测
        if(!isset($input['mpq']))  TEA('700','mpq');
            #8.2 处理空字符串,否则入库的时候会被自动转成数字0
        if(!is_numeric($input['mpq']))  $input['mpq']=NULL;
        //9.weight    最小包装重量 N
            #9.1 参数检测
        if(!isset($input['weight']))  TEA('700','weight');
            #9.2 处理空字符串,否则入库的时候会被自动转成数字0
        if(!is_numeric($input['weight']))  $input['weight']=NULL;
        //10.length   最小包装长度   N
            #10.1 参数检测
        if(!isset($input['length']))  TEA('700','length');
            #10.2 处理空字符串,否则入库的时候会被数据库自动转成数字0
        if(!is_numeric($input['length']))  $input['length']=NULL;
        //11.width    最小包装宽度   N
            #11.1 参数检测
        if(!isset($input['width']))  TEA('700','width');
            #11.2 处理空字符串,否则入库的时候会被数据库自动转成数字0
        if(!is_numeric($input['width']))  $input['width']=NULL;
        //12.height   最小包装高度   N
            #12.1 参数检测
        if(!isset($input['height']))  TEA('700','height');
            #12.2 处理空字符串,否则入库的时候会被数据库自动转成数字0
        if(!is_numeric($input['height']))  $input['height']=NULL;
        //13.是否是供应商
        if(!isset($input['is_provider'])) TEA('700','is_provider');

    }

    /**
     * 检查属性信息字段
     * @param $input
     * @author  sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function checkAttributesFormFields(&$input,$add)
    {
        //13.template_id  物料模板 NS
            #13.1参数检测
        if($add) if(!isset($input['template_id']))  TEA('700','template_id');
        //14.material_attributes  物料属性  N
            #14.1参数类型
        if(!isset($input['material_attributes']) || !is_json($input['material_attributes'])) TEA('700','material_attributes');
           #14.2 转成数组
        $input['material_attributes']=json_decode($input['material_attributes'],true);
           #14.3 判断数据源是否正确,顺便生成ref
        $input['input_ref_arr_material_attributes']=[];
        foreach( $input['material_attributes'] as $key =>$value){
            if(trim($value['value'])==='') unset($input['material_attributes'][$key]);
            $input['input_ref_arr_material_attributes'][$value['attribute_definition_id']]=$value;
            $has=$this->isExisted([['id','=',$value['attribute_definition_id']], ['category_id','=',config('app.category.material')]],config('alias.ad'));
            if(!$has)  TEA('701','material_attributes');
        }

        //15.operation_attributes 工艺属性 N
            #15.1参数类型
        if(!isset($input['operation_attributes']) || !is_json($input['operation_attributes'])) TEA('700','operation_attributes');
            #15.2 转成数组
        $input['operation_attributes']=json_decode($input['operation_attributes'],true);
            #15.3 数据来源是否正确,顺便生成ref
        $input['input_ref_arr_operation_attributes']=[];
        foreach( $input['operation_attributes'] as $key =>$value){
            if(trim($value['value'])==='') unset($input['operation_attributes'][$key]);
            $input['input_ref_arr_operation_attributes'][$value['attribute_definition_id']]=$value;
            $has=$this->isExisted([['id','=',$value['attribute_definition_id']], ['category_id','=',config('app.category.operation')]],config('alias.ad'));
            if(!$has)  TEA('701','operation_attributes');
        }

    }

    /**
     * 检查计划信息字段
     * @param $input
     * @author  sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function checkPlanFormFields(&$input)
    {

        //16.source       物料来源 Y
            #16.1 非空以及数据类型检测
        if(empty($input['source']) || !is_numeric($input['source']))  TEA('700','source');
            #16.2 是否是正确的物料来源值
        if(!in_array($input['source'],array_values(config('app.source')))) TEA('701','source');

        //17.safety_stock 安全库存 N
            #17.1 参数检测
        if(!isset($input['safety_stock'])) TEA('700','safety_stock');
            #17.2 处理空字符串,否则入库的时候会被数据库自动转成数字0
        if(!is_numeric($input['safety_stock']))  $input['safety_stock']=NULL;
        //18.max_stock    最高库存 N
            #18.1 参数检测
        if(!isset($input['max_stock'])) TEA('700','max_stock');
            #18.2 处理空字符串,否则入库的时候会被数据库自动转成数字0
        if(!is_numeric($input['max_stock']))  $input['max_stock']=NULL;
        //19.min_stock    最小库存 N
            #19.1 参数检测
        if(!isset($input['min_stock'])) TEA('700','min_stock');
            #19.2 处理空字符串,否则入库的时候会被数据库自动转成数字0
        if(!is_numeric($input['min_stock']))  $input['min_stock']=NULL;
        //20.fixed_advanced_period  固定提前期限，单位是天 N
            #20.1参数检测
        if(!isset($input['fixed_advanced_period'])) TEA('700','fixed_advanced_period');
            #20.2 处理空字符串,否则入库的时候会被数据库自动转成数字0
        if(!is_numeric($input['fixed_advanced_period']))  $input['fixed_advanced_period']=NULL;
        //21.cumulative_lead_time  累计提前期限，单位是天 N
            #21.1参数检测
        if(!isset($input['cumulative_lead_time'])) TEA('700','cumulative_lead_time');
            #21.2 处理空字符串,否则入库的时候会被数据库自动转成数字0
        if(!is_numeric($input['cumulative_lead_time']))  $input['cumulative_lead_time']=NULL;
    }


    /**
     * 检查图纸信息字段
     * @param $input
     * @author  sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function checkDrawingsFormFields(&$input)
    {
        //22.drawings
           #22.1参数类型
        if(!isset($input['drawings']) || !is_json($input['drawings'])) TEA('700','drawings');
           #22.2 转成数组
        $input['drawings']=json_decode($input['drawings'],true);
           #22.3 传递的数据源是否正确,顺便生成ref
        $input['input_ref_arr_drawings']=[];
        foreach( $input['drawings'] as $key =>$value){
            $has=$this->isExisted([['id','=',$value['drawing_id']]],config('alias.drawing'));
            $input['input_ref_arr_drawings'][$value['drawing_id']]=$value;
            if(!$has)  TEA('701','drawings');
        }

    }


    /**
     * 检查附件信息字段
     * @param $input
     * @author  sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function checkAttachmentsFormFields(&$input)
    {
        //23.attachments 物料附件N
            #23.1参数类型
        if(!isset($input['attachments']) || !is_json($input['attachments'])) TEA('700','attachments');
            #23.2 转成数组
        $input['attachments']=json_decode($input['attachments'],true);
            #23.3 传递的数据源是否正确,顺便转成ref
        $input['input_ref_arr_attachments']=[];
        foreach( $input['attachments'] as $key =>$value){
            if(empty($value['attachment_id'])) TEA('700','attachment_id');
            $has=$this->isExisted([['id','=',$value['attachment_id']]],config('alias.attachment'));
            $input['input_ref_arr_attachments'][$value['attachment_id']]=$value;
            if(!$has)  TEA('700','attachments');
        }

    }

    /**
     * 自动生成的参数检测
     * @param $input
     * @param $add
     * @throws \App\Exceptions\ApiException
     * @author  sam.shan  <sam.shan@ruis-ims.cn>
     */
    public  function  checkAutoFormFields(&$input,$add)
    {

        //24.1 不为空
        $input['creator_id'] = (!empty(session('administrator')->admin_id)) ? session('administrator')->admin_id : 0;
        $input['company_id'] = (!empty(session('administrator')->company_id)) ? session('administrator')->company_id: 0;
        $input['factory_id'] = (!empty(session('administrator')->factory_id)) ? session('administrator')->factory_id : 0;

        if(!empty($input['input_ref_arr_material_attributes'])) {
            $identity = $this->identityCard($input['input_ref_arr_material_attributes']);
            //25.identity_card 物料身份唯一识别码
            //25.1生成身份识别串
            $input['identity_card'] = $identity['identity_card_md5'];
            $input['identity_card_string'] = $identity['identity_card_string'];
            $input['material_attribute_ids'] = $identity['material_attribute_ids'];
            //25.2 判断是否存在
            $check = $add ? [['identity_card', '=', $input['identity_card']]] : [['identity_card', '=', $input['identity_card']], [$this->primaryKey, '<>', $input[$this->apiPrimaryKey]]];
            $has = $this->isExisted($check);
            if ($has) TEA('7002', 'identity_card');
        }else{
            $input['identity_card']='';
        }
        //26.uuid  分布式唯一识别码
            #26.1 生成uuid
        if($add) $input['uuid']=create_uuid();

    }

    /**
     * 将因素的键值生成串
     * @param $factors
     * @return string
     * @author  sam.shan <sam.shan@ruis-ims.cn>
     */
    public function  identityCard($factors)
    {
        //通过key值进行排序
        ksort($factors);
        $material_attribute_ids=!empty($factors)?','.implode(',',array_keys($factors)).',':'';
        //摘菜了
        $strings_arr= [];
        foreach ($factors  as $key=>$factor){
            $strings_arr[] = implode(',',$factor);
        }

        //属性与属性之间以' | '隔开
        $string=!empty($strings_arr)?implode('|',$strings_arr):'';
        $md5_string=!empty($string)?md5($string):'';
        $identity_card_string=!empty($string)?'|'.$string.'|':'';
        return ['material_attribute_ids'=>$material_attribute_ids,'identity_card_string'=>$identity_card_string,'identity_card_md5'=>$md5_string];
    }


    /**
     * 对字段进行检查
     * @param $input  array 要过滤判断的get/post数组
     * @return void         址传递,不需要返回值
     * @author  sam.shan@ruis-ims.cn
     */
    public function checkFormFields(&$input)
    {

        //过滤
        trim_strings($input);
        //判断操作模式
        $add=$this->judgeApiOperationMode($input);
        //1-12 基础信息参数检测
        $this->checkBaseFormFields($input,$add);
        //13-15  属性信息参数检测
        $this->checkAttributesFormFields($input,$add);
        //16-21  MRP信息参数检测
        $this->checkPlanFormFields($input);
        //22   图纸信息参数检测
        $this->checkDrawingsFormFields($input);
        //23  附件信息参数检测
        $this->checkAttachmentsFormFields($input);
        //24-26 自动生成的参数检测
        $this->checkAutoFormFields($input,$add);

    }

    /**
     * 检查传入参数在数据库中相同字段不同的值
     * @param $fields       限定字段
     * @param $material_id  物料id
     * @return  array       返回需要改变的字段对应值的数组
     * @author  hao.wei <weihao>
     */
    public function checkChangeFieldsValue($id,$fields,$input){
        $obj = DB::Table($this->table)->select($fields)->where('id','=',$id)->first();
        $obj_list = [];
        foreach($obj as $k=>$v){
            if($v != $input[$k]){
                $obj_list[$k] = $v;
            }
        }
        return $obj_list;
    }


    /**
     * 检测物料属性
     * @param $input
     * @author  sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function checkSimilar(&$input)
    {


        //1.创建公共builder
        //1.1where条件预搜集
        $where = [];
        !empty($input['identity_card_string']) && $where[] = ['t.identity_card_string', 'like', '%' . $input['identity_card_string'] . '%'];
        //1.2.预生成builder,注意仅仅在get中需要的连表请放在builder_get中
        $builder = DB::table($this->table.' as t')
            ->select('t.id as material_id','t.item_no','t.name', 't.description','t.template_id',
                'u.name as creator_name',
                'rmc.name as material_category_name',
                'tmp.name as template_name'
            )
            ->leftJoin(config('alias.rrad').' as u', 't.creator_id', '=', 'u.id')
            ->leftJoin(config('alias.rmc').' as rmc', 't.material_category_id', '=', 'rmc.id')
            ->leftJoin(config('alias.template').' as tmp', 't.template_id', '=', 'tmp.id');
        //1.3 where条件拼接
        if (!empty($where)) $builder->where($where);
        //1.4 whereIn条件拼接
        if (!empty($input['material_category_ids'])) $builder->whereIn('material_category_id',$input['material_category_ids']);
        //2.总共有多少条记录
        $input['total_records'] = $builder->count();
        //3.select查询
        $builder_get=$builder;
        //3.1拼接分页条件
        $builder_get->offset(($input['page_no'] - 1) * $input['page_size'])
            ->limit($input['page_size']);
        //3.2 order排序
        if (!empty($input['order']) && !empty($input['sort'])) $builder_get->orderBy('t.' . $input['sort'], $input['order']);
        //3.3 get查询
        $obj_list = $builder_get->get();
        return $obj_list;

    }

//endregion
//region 增

    /**
     * 添加物料的时候,根据template获取物料属性的列表
     * @param $template_id  选择的模板id
     * @return array
     * @author  sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function getTemplateAttributeList($template_id)
    {
        $m=new Template();
        //初始化返回值
        $results=[];
        //1.获取模板的祖宗路径
        $forefathers=$m->getFieldValueById($template_id,'forefathers');
        //2.循环获取祖宗模板的属性列表
        if(!empty($forefathers)){
            $forefathers_arr=array_values(array_filter(explode(',',$forefathers)));
            foreach($forefathers_arr as $key=>$value){
                $results['forefathers'][$key]['template_id']=$value;
                $results['forefathers'][$key]['template_name']=$m->getFieldValueById($value,'name');
                $results['forefathers'][$key]['material_attributes']=$m->getSelectedAttributesByTemplate($value, config('app.category.material'),1);
            }
        }
        //3.获取自身的属性列表
        $results['self']['template_id']=$template_id;
        $results['self']['template_name']=$m->getFieldValueById($template_id,'name');
        $results['self']['material_attributes']=$m->getSelectedAttributesByTemplate($template_id, config('app.category.material'));
        $results['self']['operation_attributes']=$m->getSelectedAttributesByTemplate($template_id, config('app.category.operation'));
        return $results;
    }

    /**
     * 继承属性参照已存在物料列表
     * @param $input
     * @return mixed
     * @author  sam.shan   <sam.shan@ruis-ims.cn>
     */
    public function getGeneticReferMaterial(&$input)
    {
        //获取父模板主键
        $parent_template_id =$this->getFieldValueById($input['template_id'], 'parent_id',config('alias.template'));
        if(empty($parent_template_id))  return [];
        return $this->getMaterialList($input);
    }
    /**
     * 获取某个物料的物料属性以及值
     * @param $id
     * @return mixed
     * @author sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function getAttributeByMaterial($id)
    {

        //获取列表
        $obj_list = DB::table(config('alias.ma').' as ma')
            ->select('ma.material_id','ma.value','ma.attribute_definition_id','ma.is_view','ma.filter_value',
                'ad.name','ad.datatype_id','ad.range','ad.key',
                'rm.template_id',
                'uu.commercial as unit')
            ->leftJoin(config('alias.ad').' as ad', 'ad.id', '=', 'ma.attribute_definition_id')
            ->leftJoin(config('alias.uu').' as uu','uu.id','=','ad.unit_id')
            ->leftJoin(config('alias.rm').' as rm','rm.id','=','ma.material_id')
            ->where('ma.material_id', $id)
            ->get();

       //进一步判断过滤值
        foreach($obj_list as $key=>&$value){
             if(!empty($value->template_id)){
                 $obj = DB::table(config('alias.ad2t'))->select('is_view','filter_value')
                                  ->where('template_id',$value->template_id)
                                  ->where('attribute_definition_id',$value->attribute_definition_id)
                                  ->first();
                 if(!empty($obj)){
                     $value->is_view=$obj->is_view;
                     $value->filter_value=$obj->filter_value;
                 }
             }
        }
        return $obj_list;
    }

    /**
     * 对物料进行添加
     * 注意在添加物料之前要执行检查是否有相同属性的物料，若存在则跳转到该物料的查看material/index/checkExistMaterial?
     * @param $input
     * @return mixed
     * @author sam.shan   <sam.shan@ruis-ims.cn>
     */
    public function add($input)
    {

        try {
            //开启事务
            DB::connection()->beginTransaction();
            //1.对物料基础信息进行添加
            //使用编码
            $encodingDao = new EncodingSetting();
            $input['item_no'] = $encodingDao->useEncoding(1,$input['item_no']);
            $material_id=$this->addMaterialBase($input);
            if(empty($material_id))  TEA('802');
            //2.添加物料属性值,注意编辑的时候不需要判断非空,因为肯能是全部删除额
            if(!empty($input['input_ref_arr_material_attributes'])) $this->saveMaterialAttribute($input['input_ref_arr_material_attributes'],$material_id,$input['creator_id']);
            //3.添加工艺属性值
            if(!empty($input['input_ref_arr_operation_attributes'])) $this->saveOperationAttribute($input['input_ref_arr_operation_attributes'],$material_id,$input['creator_id']);
            //4.添加物料图纸
            if(!empty($input['input_ref_arr_drawings'])) $this->saveMaterialDrawings($input['input_ref_arr_drawings'],$material_id,$input['creator_id']);
            //5.添加物料附件
            if(!empty($input['input_ref_arr_attachments'])) $this->saveMaterialAttachments($input['input_ref_arr_attachments'],$material_id,$input['creator_id']);
        } catch (\ApiException $e) {
            //回滚
            DB::connection()->rollBack();
            TEA($e->getCode());
        }
        DB::connection()->commit();
        return ['material_id'=>$material_id,'item_no'=>$input['item_no']];
    }


/**
 * 对物料进行入库处理
 * @param $input
 * @return $insert_id 添加后的id
 * @author sam.shan <sam.shan@ruis-ims.cn>
 */
public function addMaterialBase($input)
{


    //获取入库数组,此处一定要严谨一些,否则前端传递额外字段将导致报错,甚至攻击
    $data = [
        'uuid'=>$input['uuid'],//分布式uuid
        'identity_card'=>isset($input['identity_card'])?$input['identity_card']:'',//身份识别码
        'material_category_id'=>$input['material_category_id'],//物料分类
        'item_no'=>$input['item_no'],//物料编码
        'name'=>$input['name'],//物料名称
        'batch_no_prefix'=>$input['batch_no_prefix'],//批次号前缀
        'moq'=>$input['moq'],//最小订单数量
        'description'=>$input['description'],//描述
        'unit_id'=>$input['unit_id'],//单位
        'mpq'=>$input['mpq'],//最小包装数量
        'weight'=>$input['weight'],//最小包装重量
        'length'=>$input['length'],//最小包装长度
        'width'=>$input['width'],//最小包装宽度
        'height'=>$input['height'],//最小包装高度
        'template_id'=>$input['template_id'],//模板
        'source'=>$input['source'],//物料来源
        'safety_stock'=>$input['safety_stock'],//安全库存
        'max_stock'=>$input['max_stock'],//最高库存
        'min_stock'=>$input['min_stock'],//最低库存
        'fixed_advanced_period'=>$input['fixed_advanced_period'],//固定提前期
        'cumulative_lead_time'=>$input['cumulative_lead_time'],//累计提前期
        'creator_id'=>$input['creator_id'],//操作者
        'company_id'=>$input['company_id'],//公司ID
        'factory_id'=>$input['factory_id'],//工厂ID
        'lzp_identity_card'=>isset($input['lzp_identity_card'])?$input['lzp_identity_card']:'',//流转品的身份信息
        'mtime'=>time(),//最后修改时间
        'ctime'=>time(),//创建时间
    ];
    //后续添加的字段
    if(isset($input['label']))  $data['label']=$input['label'];
    if(isset($input['identity_card_string']))  $data['identity_card_string']=$input['identity_card_string'];
    if(isset($input['material_attribute_ids']))  $data['material_attribute_ids']=$input['material_attribute_ids'];
    if(isset($input['is_provider'])) $data['is_provider'] = $input['is_provider'];

    //入库
    $insert_id = DB::table($this->table)->insertGetId($data);
    if (!$insert_id) TEA('802');
    //操作日志
    $events = [
        'action'=>'add',
        'desc'=>'添加物料基础信息',
    ];
    Trace::save($this->table,$insert_id,$input['creator_id'],$events);
    return $insert_id;
}

    /**
     * 物料与物料属性进行关联
     * @param $input
     * @param $material_id
     * @author sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function saveMaterialAttribute($material_attributes, $material_id,$creator_id)
    {

        //1.获取数据库中物料已经添加的物料属性
        $db_ref_obj= DB::table(config('alias.ma'))->where($this->apiPrimaryKey,$material_id)
            ->pluck('value','attribute_definition_id');
        $db_ref_arr=obj2array($db_ref_obj);
        $db_ids=array_keys($db_ref_arr);
        //2.获取前端传递的物料属性
        $input_ref_arr=$material_attributes;
        $input_ids=array_keys($input_ref_arr);
        //3.通过颠倒位置的差集获取改动情况
        $set=get_array_diff_intersect($input_ids,$db_ids);
        if(!empty($set['add_set']) || !empty($set['del_set']) || $set['common_set'])  $m=new MaterialAttribute();
        //4.要添加的
        if(!empty($set['add_set']))  $m->addSet($set['add_set'],$material_id,$input_ref_arr,$creator_id);
        //5.要删除的
        if(!empty($set['del_set']))  $m->delSet($set['del_set'],$material_id,$db_ref_arr,$creator_id);
        //6.可能要编辑的
        if(!empty($set['common_set']))  $m->commonSet($set['common_set'],$material_id,$db_ref_arr,$input_ref_arr,$creator_id);
    }

    /**
     * 工艺属性值的添加
     * @param $input
     * @param $material_id
     * @author sam.shan <sam.shan@ruis-ims.cn>
     */
    public function saveOperationAttribute($operation_attributes,$material_id,$creator_id)
    {

        //1.获取数据库中物料已经添加的工艺属性
        $db_ref_obj= DB::table(config('alias.oav'))->where('owner_id',$material_id)->where('owner_type','material')
            ->pluck('value','attribute_id');
        $db_ref_arr=obj2array($db_ref_obj);
        $db_ids=array_keys($db_ref_arr);
        //2.获取前端传递的工艺属性
        $input_ref_arr=$operation_attributes;
        $input_ids=array_keys($input_ref_arr);
        //3.通过颠倒位置的差集获取改动情况
        $set=get_array_diff_intersect($input_ids,$db_ids);
        if(!empty($set['add_set']) || !empty($set['del_set']) || $set['common_set'])  $m=new OperationAttributeValue();
        //4.要添加的
        if(!empty($set['add_set']))  $m->addSet($set['add_set'],$material_id,$input_ref_arr,$creator_id);
        //5.要删除
        if(!empty($set['del_set']))  $m->delSet($set['del_set'],$material_id,$db_ref_arr,$creator_id);
        //6.可能要编辑的
        if(!empty($set['common_set']))  $m->commonSet($set['common_set'],$material_id,$db_ref_arr,$input_ref_arr,$creator_id);

    }


    /**
     * 添加物料关联图纸【该函数功能也可以用在update上吧，许建问题】
     * @param $input_drawings
     * @param $material_id
     * @throws ApiException
     * @author  sam.shan <sam.shan@ruis-ims.cn>
     */
    public function saveMaterialDrawings($input_drawings,$material_id,$creator_id)
    {

        //1.获取数据库中已经存在的物料图纸
        $db_ref_obj=DB::table(config('alias.rmd'))->where('material_id',$material_id)->pluck('comment','drawing_id');
        $db_ref_arr=obj2array($db_ref_obj);
        $db_ids=array_keys($db_ref_arr);

        //2.获取前端传递的物料图纸
        $input_ref_arr=$input_drawings;
        $input_ids=array_keys($input_ref_arr);
        //3.通过颠倒位置的差集获取改动情况,多字段要考虑编辑的情况额[有的人喜欢先删除所有然后变成全部添加,这种是错误的投机取巧行为,要杜绝!]
        $set=get_array_diff_intersect($input_ids,$db_ids);
        if(!empty($set['add_set']) || !empty($set['del_set']) || $set['common_set'])  $m=new MaterialDrawing();

        //4.要添加的
        if(!empty($set['add_set']))  $m->addSet($set['add_set'],$material_id,$input_ref_arr,$creator_id);
        //5.要删除的
        if(!empty($set['del_set']))  $m->delSet($set['del_set'],$material_id,$db_ref_arr,$creator_id);
        //6.可能要编辑的
        if(!empty($set['common_set']))  $m->commonSet($set['common_set'],$material_id,$db_ref_arr,$input_ref_arr,$creator_id);
    }

    /**
     * 添加物料附件
     * @param $input_attachments
     * @param $material_id
     * @throws ApiException
     * @author sam.shan   <sam.shan@ruis-ims.cn>
     */
    public function saveMaterialAttachments($input_attachments,$material_id,$creator_id)
    {

        //1.获取数据库中已经存在的附件
        $db_ref_obj=DB::table(config('alias.rma'))->where('material_id',$material_id)->pluck('comment','attachment_id');
        $db_ref_arr=obj2array($db_ref_obj);
        $db_ids=array_keys($db_ref_arr);
        //2.获取前端传递的附件
        $input_ref_arr=$input_attachments;
        $input_ids=array_keys($input_ref_arr);
        //3.通过颠倒位置的差集获取改动情况,多字段要考虑编辑的情况额[有的人喜欢先删除所有然后变成全部添加,这种是错误的投机取巧行为,要杜绝!]
        $set=get_array_diff_intersect($input_ids,$db_ids);
        if(!empty($set['add_set']) || !empty($set['del_set']) || $set['common_set'])  $m=new MaterialAttachment();

        //4.要添加的
        if(!empty($set['add_set']))  $m->addSet($set['add_set'],$material_id,$input_ref_arr,$creator_id);
        //5.要删除
        if(!empty($set['del_set']))  $m->delSet($set['del_set'],$material_id,$db_ref_arr,$creator_id);
        //6.可能要编辑的
        if(!empty($set['common_set']))  $m->commonSet($set['common_set'],$material_id,$db_ref_arr,$input_ref_arr,$creator_id);


    }


    /**
     * 根据某个物料获取使用模板的属性及属性值
     * @param $material_id,$template_id
     * @throws \App\Exceptions\ApiException
     * @author  hao.wei  <weihao>
     */
    public function getAttributeByMaterialAndTemplate($template_id,$material_id){
        $m=new Template();
        //初始化返回值
        $results=[];
        //1.获取模板的祖宗路径
        $forefathers=$m->getFieldValueById($template_id,'forefathers');
        //2.循环获取祖宗模板的属性列表
        if(!empty($forefathers)){
            $forefathers_arr=array_values(array_filter(explode(',',$forefathers)));
            foreach($forefathers_arr as $key=>$value){
                $results['forefathers'][$key]['template_id']=$value;
                $results['forefathers'][$key]['template_name']=$m->getFieldValueById($value,'name');
                $results['forefathers'][$key]['material_attributes']=$m->getAttributesByTemplateByTemplateAndMaterial($value, config('app.category.material'),$material_id,1);
            }
        }
        //3.获取自身的属性列表
        $results['self']['template_id']=$template_id;
        $results['self']['template_name']=$m->getFieldValueById($template_id,'name');
        $results['self']['material_attributes']=$m->getAttributesByTemplateByTemplateAndMaterial($template_id, config('app.category.material'),$material_id);
        $results['self']['operation_attributes']=$m->getAttributesByTemplateByTemplateAndMaterial($template_id, config('app.category.operation'),$material_id);
        return $results;
    }


    /**
     * @param $input
     * @return array
     * @throws \App\Exceptions\ApiException
     * @throws \App\Exceptions\ApiSapException
     */
    public function syncMaterial($input)
    {
        $ApiControl = new SapApiRecord();
        $ApiControl->store($input);
        /**
         * @todo 业务处理
         * 如果有异常,直接 TESAP('code',$params='',$data=null)
         */

        return [];
    }

    //endregion



//region 修
    /**
     * 整体编辑物料
     * @param $input
     * @throws \Exception
     * @author  sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function update($input)
    {


        try {
            //开启事务
            DB::connection()->beginTransaction();

            //1.对物料基础信息进行修改
            $this->updateMaterialBase($input);
            $material_id=$input[$this->apiPrimaryKey];
            //2.保存物料属性值
            $this->saveMaterialAttribute($input['input_ref_arr_material_attributes'],$material_id,$input['creator_id']);
            //3.保存工艺属性值
            $this->saveOperationAttribute($input['input_ref_arr_operation_attributes'],$material_id,$input['creator_id']);
            //4.保存物料图纸
            $this->saveMaterialDrawings($input['input_ref_arr_drawings'],$material_id,$input['creator_id']);
            //5.保存物料附件
            $this->saveMaterialAttachments($input['input_ref_arr_attachments'],$material_id,$input['creator_id']);
        } catch (\ApiException $e) {
            //回滚
            DB::connection()->rollBack();
            TEA($e->getCode());
        }
        //提交事务
        DB::connection()->commit();
    }

    /**
     * 对物料基础信息进行编辑
     * @param $input
     * @return $insert_id 添加后的id
     * @author sam.shan <sam.shan@ruis-ims.cn>
     */
    public function updateMaterialBase($input)
    {
        $fields = ['identity_card','material_category_id','item_no','name','batch_no_prefix','moq','description',
            'mpq','weight','length','width','height','source','safety_stock','max_stock','min_stock','fixed_advanced_period',
            'cumulative_lead_time','unit_id','is_provider',
        ];
        $needChangeFieldList = $this->checkChangeFieldsValue($input[$this->apiPrimaryKey],$fields,$input);
        //获取入库数组,此处一定要严谨一些,否则前端传递额外字段将导致报错,甚至攻击
        $data = [
            //'uuid'=>$input['uuid'],//分布式uuid
            'identity_card'=>isset($input['identity_card'])?$input['identity_card']:'',
            'material_category_id'=>$input['material_category_id'],//物料分类
            'item_no'=>$input['item_no'],//物料编码
            'name'=>$input['name'],//物料名称
            'batch_no_prefix'=>$input['batch_no_prefix'],//批次号前缀
            'moq'=>$input['moq'],//最小订单数量
            'description'=>$input['description'],//描述
            'unit_id'=>$input['unit_id'],//单位
            'mpq'=>$input['mpq'],//最小包装数量
            'weight'=>$input['weight'],//最小包装重量
            'length'=>$input['length'],//最小包装长度
            'width'=>$input['width'],//最小包装宽度
            'height'=>$input['height'],//最小包装高度
            'template_id'=>$input['template_id'],//模板
            'source'=>$input['source'],//物料来源
            'safety_stock'=>$input['safety_stock'],//安全库存
            'max_stock'=>$input['max_stock'],//最高库存
            'min_stock'=>$input['min_stock'],//最低库存
            'fixed_advanced_period'=>$input['fixed_advanced_period'],//固定提前期
            'cumulative_lead_time'=>$input['cumulative_lead_time'],//累计提前期
            'is_provider'=>$input['is_provider'],
            //'creator_id'=>$input['creator_id'],//操作者
            'mtime'=>time(),//最后修改时间
        ];

        //后续添加的字段
        if(isset($input['label']))  $data['label']=$input['label'];
        if(isset($input['identity_card_string']))  $data['identity_card_string']=$input['identity_card_string'];
        if(isset($input['material_attribute_ids']))  $data['material_attribute_ids']=$input['material_attribute_ids'];

        //入库
        $upd= DB::table($this->table)->where($this->primaryKey,$input[$this->apiPrimaryKey])->update($data);
        if($upd===false) TEA('806');
        //操作日志
//        $material = $this->getRecordById($input[$this->apiPrimaryKey],['name']);
        $events = [];
        foreach($needChangeFieldList as $k=>$v){
            $event = [];
            $event['field'] = $k;
            $event['action'] = 'update';
            $event['from'] = $v;
            $event['to'] = $input[$k];
            $event['comment'] = $this->keyValue[$k]['name'];
            if($this->keyValue[$k]['type'] == 1){
                $event['desc'] = '把物料的'.$event['comment'].'从['.$v.']修改为['.$input[$k].']';
            }else if($this->keyValue[$k]['type'] == 2){
                $old = $this->getRecordById($v,[$this->keyValue[$k]['field']],$this->keyValue[$k]['table']);
                $old = json_decode(json_encode($old),true);
                $new = $this->getRecordById($input[$k],[$this->keyValue[$k]['field']],$this->keyValue[$k]['table']);
                $new = json_decode(json_encode($new),true);
                $event['desc'] = '把物料的'.$event['comment'].'从['.$old[$this->keyValue[$k]['field']].']修改为['.$new[$this->keyValue[$k]['field']].']';
            }else if($this->keyValue[$k]['type'] == 3){
                if($v == 1){
                    $oldSource = '采购';
                }else if($v == 2){
                    $oldSource = '自制';
                }else if($v == 3){
                    $oldSource = '委外';
                }else if($v == 4){
                    $oldSource = '客供，默认为采购';
                }
                if($input[$k] == 1){
                    $newSource = '采购';
                }else if($input[$k] == 2){
                    $newSource = '自制';
                }else if($input[$k] == 3){
                    $newSource = '委外';
                }else if($input[$k] == 4){
                    $newSource = '客供，默认为采购';
                }
                $event['desc'] = '把物料的'.$event['comment'].'从['.$oldSource.']修改为['.$newSource.']';
            }else if($this->keyValue[$k]['type'] == 4){
                if($v == 1){
                    $old = '是';
                }else if($v == 2){
                    $old = '否';
                }else{
                    $old = '不使用';
                }
                if($input[$k] == 1){
                    $new = '是';
                }else if($input[$k] == 2){
                    $new = '否';
                }else{
                    $new = '不使用';
                }
                $event['desc'] = '把物料的'.$event['comment'].'从['.$old.']修改为['.$new.']';
            }
            $events[] = $event;
        }
        if(!empty($events)){
            Trace::save($this->table,$input[$this->apiPrimaryKey],$input['creator_id'],$events);
        }
    }


//endregion

//region 查

    /**
     * 查看物料的详细信息,哥获取一条记录就不要再连表了,求求你了
     * @param $id
     * @return mixed
     * @throws \App\Exceptions\ApiException
     * @author  sam.shan <sam.shan@ruis-ims.cn>
     */
    public function get($id)
    {
        $fields= ['id as material_id','item_no','name','creator_id','unit_id','low_level_code','uuid',
            'batch_no_prefix','material_category_id','description','template_id',
            'mpq','weight','length','width','height','moq','source',
            'safety_stock','max_stock','min_stock','fixed_advanced_period','cumulative_lead_time',
            'mtime','ctime','label','is_provider',
        ];
        $obj =$this->getRecordById($id,$fields);
        if (!$obj) TEA('404');
        //时间格式转换
        $obj->ctime=date('Y-m-d H:i:s',$obj->ctime);
        $obj->mtime=date('Y-m-d H:i:s',$obj->mtime);
        //用户名
        $obj->creator_name='';
        if(!empty($obj->creator_id)) $obj->creator_name=$this->getFieldValueById($obj->creator_id,'name',config('alias.rrad'));
        //物料分类名称
        $obj->material_category_name='';
        if(!empty($obj->material_category_id)) $obj->material_category_name=$this->getFieldValueById($obj->material_category_id,'name',config('alias.rmc'));
        //模板名称
        $obj->template_name='';
        if(!empty($obj->template_id)) $obj->template_name=$this->getFieldValueById($obj->template_id,'name',config('alias.template'));
        //单位
        $obj->unit_name='';
        if(!empty($obj->unit_id)) $obj->unit_name=$this->getFieldValueById($obj->unit_id,'label',config('alias.uu'));
        //获得物料的物料属性以及属性值
        $obj->material_attributes = $this->getAttributeByMaterial($id);
        //获得物料的工艺属性以及属性值
        $obj->operation_attributes = $this->getOperationAttributeValue($id);
        //获得物料的关联图纸
        $obj->drawings=$this->getMaterialDrawings($id);
        //获取物料的关联附件
        $obj->attachments=$this->getMaterialAttachments($id);
        //获取物料的仓储地点
        $obj->storage_place = $this->getMaterialStoragePlace($id);

        return $obj;
    }

    /**
     * 查找物料的仓储地点
     * @param $id
     */
    public function getMaterialStoragePlace($id){
        $obj_list = DB::table(config('alias.ramc').' as ramc')
            ->leftJoin(config('alias.rf').' as rf','rf.code','ramc.WERKS')
            ->select('ramc.LGPRO','ramc.LGFSB','rf.name')->where('ramc.material_id',$id)->get();
        return $obj_list;
    }

    /**
     * 根据物料id和自定义属性id获得工艺属性的值
     * @param $id 物料id
     * @return array
     * @author  xujian
     */
    public function getOperationAttributeValue($id)
    {
        //获取参数
        $fields = [
            'oav.owner_id as material_id',
            'oav.value',
            'oav.attribute_id as attribute_definition_id',
            'oav.is_view',
            'oav.filter_value',
            'ad.key','ad.name','ad.range','ad.datatype_id',
            'rm.template_id',
            'uu.commercial as unit',
        ];
        $obj_list = DB::table(config('alias.oav').' as oav')
            ->select($fields)
            ->leftJoin(config('alias.ad').' as ad', 'ad.id', '=', 'oav.attribute_id')
            ->leftJoin(config('alias.uu').' as uu', 'uu.id', '=', 'ad.unit_id')
            ->leftJoin(config('alias.rm').' as rm','rm.id','=','oav.owner_id')
            ->where('oav.owner_id',$id)
            ->where('oav.owner_type','material')
            ->get();

        //进一步判断过滤值
        foreach($obj_list as $key=>&$value){
            if(!empty($value->template_id)){
                $obj = DB::table(config('alias.ad2t'))->select('is_view','filter_value')
                    ->where('template_id',$value->template_id)
                    ->where('attribute_definition_id',$value->attribute_definition_id)
                    ->first();
                if(!empty($obj)){
                    $value->is_view=$obj->is_view;
                    $value->filter_value=$obj->filter_value;
                }

            }
        }

        return $obj_list;
    }

    /**
     * 获取物料图纸
     * @param $material_id
     * @return mixed
     * @author sam.shan   <sam.shan@ruis-ims.cn>
     */
    public function getMaterialDrawings($material_id)
    {
        $obj_list=DB::table(config('alias.rmd').' as rmd')
            ->where('rmd.material_id',$material_id)
            ->leftJoin(config('alias.rdr').' as rdr', 'rmd.drawing_id', '=', 'rdr.id')
            ->leftJoin(config('alias.rrad').' as u','u.id','=','rdr.creator_id')
            ->leftJoin(config('alias.rdc').' as rdc','rdc.id','=','rdr.category_id')
            ->leftJoin(config('alias.rdg').' as rdg','rdg.id','=','rdr.group_id')
            ->select(
                'rmd.material_id',
                'rmd.drawing_id',
                'rmd.comment',
                'rdr.ctime',
                'rdr.code',
                'rdr.name',
                'u.name as creator_name',
                'rdc.name as category_name',
                'rdc.owner',
                'rdc.id as category_id',
                'rdr.image_orgin_name',
                'rdr.image_name',
                'rdr.image_path',
                'rdr.comment',
                'rdg.name as group_name'
            )
            ->get();
        $imageAttributeDao = new ImageAttribute();
        foreach($obj_list as $k=>&$v){
            $v->ctime = date('Y-m-d H:i:s',$v->ctime);
            $v->attributes = $imageAttributeDao->getDrawingAttributeList($v->drawing_id);
        }
        return $obj_list;
    }

    /**
     * 获取物料附件
     * @param $material_id
     * @return mixed
     */
    public function getMaterialAttachments($material_id)
    {
        $obj_list=DB::table(config('alias.rma').' as rma')
            ->where('rma.material_id',$material_id)
            ->leftJoin(config('alias.attachment').' as attach', 'rma.attachment_id', '=', 'attach.id')
            ->leftJoin(config('alias.rrad').' as u','attach.creator_id','=','u.id')
            ->select(
                'rma.material_id',
                'rma.attachment_id',
                'rma.comment',
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
     * 获取某个模板关联了哪些属性ids
     * @param $template_id
     * @return array
     * @author   sam.shan <sam.shan@ruis-ims.cn>
     */
    public function  getMaterialCategoryIdsByForefatherId($material_category_id)
    {
        $material_category_ids=DB::table(config('alias.rmc'))
                 ->where('forefathers','like','%,'.$material_category_id.',%')
                 ->pluck('id');
        return  json_decode(json_encode($material_category_ids),true);
    }

    /**
     * 获取bom顶级母件的生理上的长辈们
     * @param $bom_material_id
     * @author  sam.shan   <sam.shan@ruis-ims.cn>
     */
    public function  getBomMotherForefathers($bom_material_id)
    {
        $bom_mother_forefathers_ids=DB::table(config('alias.rb'))
            ->where('item_material_path','like','%,'.$bom_material_id.',%')
            ->orWhere('replace_material_path','like','%,'.$bom_material_id.',%')
            ->pluck('material_id');
        return  json_decode(json_encode($bom_mother_forefathers_ids),true);
    }
    /**
     * 分页查询列表
     * @param $input
     * @return mixed
     * @author  sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function getMaterialList(&$input)
    {
        //1.创建公共builder
            //1.1where条件预搜集
        $where = [];
        !empty($input['item_no']) && $where[] = ['t.item_no', 'like', '%' . $input['item_no'] . '%'];
        !empty($input['name']) && $where[] = ['t.name', 'like', '%' . $input['name'] . '%'];
        !empty($input['creator_name']) && $where[] = ['u.name', 'like', '%' . $input['creator_name'] . '%'];
        !empty($input['template_id']) && is_numeric($input['template_id']) && $where[] = ['t.template_id', $input['template_id']];
            //1.2.预生成builder,注意仅仅在get中需要的连表请放在builder_get中
        $builder = DB::table($this->table.' as t')
            ->select('t.id as material_id','t.item_no','t.name', 't.ctime','t.mtime','t.description','t.template_id',
                'u.name as creator_name',
                'rmc.name as material_category_name',
                'tmp.name as template_name',
                't.unit_id',
                'uu.unit_text'
            )
            ->leftJoin(config('alias.rrad').' as u', 't.creator_id', '=', 'u.id')
            ->leftJoin(config('alias.rmc').' as rmc', 't.material_category_id', '=', 'rmc.id')
            ->leftJoin(config('alias.template').' as tmp', 't.template_id', '=', 'tmp.id')
            ->leftJoin(config('alias.uu').' as uu', 't.unit_id', '=', 'uu.id');
             //1.3 where条件拼接
        if (!empty($where)) $builder->where($where);
             //1.4 whereIn条件拼接
        if (!empty($input['material_category_ids'])) $builder->whereIn('material_category_id',$input['material_category_ids']);
        //2.总共有多少条记录
        $input['total_records'] = $builder->count();
        //3.select查询
        $builder_get=$builder;
           //3.1拼接分页条件
        $builder_get->offset(($input['page_no'] - 1) * $input['page_size'])
        ->limit($input['page_size']);
           //3.2 order排序
        if (!empty($input['order']) && !empty($input['sort'])) $builder_get->orderBy('t.' . $input['sort'], $input['order']);
           //3.3 get查询
        $obj_list = $builder_get->get();
        //4.遍历格式化数据
        foreach($obj_list as $key=>&$value){
            $value->ctime=date('Y-m-d H:i:s',$value->ctime);
            $value->mtime=date('Y-m-d H:i:s',$value->mtime);
        }
        return $obj_list;
    }


    /**
     * BOM顶级母件
     * @param $input
     * @return mixed
     * @author  sam.shan  <sam.shan@ruis-ims.cn>
     * @todo  不要试图合并不同业务场景的代码,保持独立性,好扩展与修改
     */
    public function getBomMotherMaterialList(&$input)
    {



        //1.创建公共builder
            //1.1where条件预搜集
        $where = [['rb.material_id','=',NULL]];
        !empty($input['identity_card_string']) && $where[] = ['t.identity_card_string', 'like', '%' . $input['identity_card_string'] . '%'];
        !empty($input['item_no']) && $where[] = ['t.item_no', 'like', '%' . $input['item_no'] . '%'];
        !empty($input['name']) && $where[] = ['t.name', 'like', '%' . $input['name'] . '%'];
        !empty($input['material_attribute_ids']) && $where[] = ['t.material_attribute_ids', 'like', '%' . $input['material_attribute_ids'] . '%'];
            //1.2 预生成builder,注意仅仅在get中需要的连表请放在builder_get中
        $builder = DB::table($this->table.' as t')
            ->select('t.id as material_id','t.item_no','t.name','t.unit_id',
                'u.name as creator_name',
                'rmc.name as material_category_name',
                'uu.label as unit','uu.commercial'
            )
            ->leftJoin(config('alias.rmc').' as rmc', 't.material_category_id', '=', 'rmc.id')
            ->leftJoin(config('alias.rb').' as rb', 't.id', '=', 'rb.material_id');
            //1.3 where条件拼接
        if (!empty($where)) $builder->where($where);
            //1.4 whereIn条件拼接
        if (!empty($input['material_category_ids'])) $builder->whereIn('t.material_category_id',$input['material_category_ids']);
        //2.总共有多少条记录
        $input['total_records'] = $builder->count();
        //3.select查询
        $builder_get=$builder;
             //3.1 拼接不同于公共builder的条件
        $builder_get->leftJoin(config('alias.rrad').' as u', 't.creator_id', '=', 'u.id')
                    ->leftJoin(config('alias.uu').' as uu', 't.unit_id', '=', 'uu.id')
                    ->offset(($input['page_no'] - 1) * $input['page_size'])
                    ->limit($input['page_size']);
             //3.2 order拼接
        if (!empty($input['order']) && !empty($input['sort'])) $builder->orderBy('t.' . $input['sort'], $input['order']);
            //3.3 get获取接口
        $obj_list = $builder->get();
        return $obj_list;
    }


    /**
     * BOM顶级母件,添加订单使用
     * @param $input
     * @return mixed
     * @author  sam.shan  <sam.shan@ruis-ims.cn>
     * @todo  不要试图合并不同业务场景的代码,保持独立性,好扩展与修改
     */
    public function getOrderBomMotherMaterialList(&$input)
    {


        //1.创建公共builder
           //1.1where条件预搜集
        $where = [['rb.status','=',1],['rb.is_version_on',1]];
        //$where = [['rb.version','=',1],['rb.status','=',1]];
        !empty($input['item_no']) && $where[] = ['t.item_no', 'like', '%' . $input['item_no'] . '%'];
        !empty($input['name']) && $where[] = ['t.name', 'like', '%' . $input['name'] . '%'];
           //1.2 预生成builder,注意仅仅在get中需要的连表请放在builder_get中
        $builder = DB::table($this->table.' as t')
            ->select('t.id as material_id','t.item_no','t.name',
                'u.name as creator_name',
                'rmc.name as material_category_name',
                'rb.id as bom_id','rb.bom_no','rb.version'
            )
            ->leftJoin(config('alias.rmc').' as rmc', 't.material_category_id', '=', 'rmc.id')
            ->Join(config('alias.rb').' as rb', 't.id', '=', 'rb.material_id');
            //1.3 where条件拼接
        if (!empty($where)) $builder->where($where);
            //1.4 whereIn条件拼接
        if (!empty($input['material_category_ids'])) $builder->whereIn('t.material_category_id',$input['material_category_ids']);
        //2.总共有多少条记录
        $input['total_records'] = $builder->count();
        //3.select查询
        $builder_get=$builder;
            //3.1 拼接不同于公共builder的条件
        $builder_get->leftJoin(config('alias.rrad').' as u', 't.creator_id', '=', 'u.id')
            ->offset(($input['page_no'] - 1) * $input['page_size'])
            ->limit($input['page_size']);
           //3.2 order拼接
        if (!empty($input['order']) && !empty($input['sort'])) $builder->orderBy('t.' . $input['sort'], $input['order']);
           //3.3 get获取接口
        $obj_list = $builder->get();
        return $obj_list;
    }



    /**
     * BOM子项查询
     * @param $input
     * @return mixed
     * @author  sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function getBomItemMaterialList(&$input)
    {

        //1.创建公共builder
           //1.1where条件预搜集
        $where =[];
        !empty($input['identity_card_string']) && $where[] = ['t.identity_card_string', 'like', '%' . $input['identity_card_string'] . '%'];
        !empty($input['item_no']) && $where[] = ['t.item_no', 'like', '%' . $input['item_no'] . '%'];
        !empty($input['name']) && $where[] = ['t.name', 'like', '%' . $input['name'] . '%'];
        !empty($input['material_attribute_ids']) && $where[] = ['t.material_attribute_ids', 'like', '%' . $input['material_attribute_ids'] . '%'];
        isset($input['has_bom']) && is_numeric($input['has_bom']) && $input['has_bom']==0 && $where[]=['rb.material_id','=',NULL];
        isset($input['has_bom']) && $input['has_bom']==1 && $where[]=['rb.material_id','!=',NULL];
           //1.2.预生成builder,注意仅仅在get中需要的连表请放在builder_get中
        $sub=DB::table(config('alias.rb'))->select('material_id')->groupBy('material_id');
        $builder = DB::table($this->table.' as t')
            ->leftJoin(config('alias.rmc').' as rmc', 't.material_category_id', '=', 'rmc.id')
            ->leftJoin(DB::raw('('.$sub->toSql().') as rb'),'t.id','=','rb.material_id');
           //1.3 where条件拼接
        if (!empty($where)) $builder->where($where);
            //1.4 whereIn条件拼接
        if (!empty($input['material_category_ids'])) $builder->whereIn('t.material_category_id',$input['material_category_ids']);
            //1.5 whereNotIn条件拼接
        if (!empty($input['bom_mother_forefathers_ids'])) $builder->whereNotIn('t.id',$input['bom_mother_forefathers_ids']);
        //2.总共有多少条记录
        $input['total_records'] = $builder->count();
        //3.select查询
        $builder_get=$builder;
            //3.1 拼接不同于公共builder的查询条件
        $builder_get->select('t.id as material_id','t.item_no','t.name',
                            'u.name as creator_name',
                            'rmc.name as material_category_name',
                            'rb.material_id as has_bom',
                            'uu.label as unit','uu.commercial'
          )
        ->leftJoin(config('alias.rrad').' as u', 't.creator_id', '=', 'u.id')
        ->leftJoin(config('alias.uu').' as uu', 't.unit_id', '=', 'uu.id')
        ->offset(($input['page_no'] - 1) * $input['page_size'])
        ->limit($input['page_size']);
             //3.2 order 拼接
        if (!empty($input['order']) && !empty($input['sort'])) $builder_get->orderBy('t.' . $input['sort'], $input['order']);
             //3.3 get查询
        $obj_list = $builder_get->get();

        //4.遍历
        foreach($obj_list as $key=>&$value){
            //获取版本号
            if(!empty($value->has_bom)){
                //4.1修改has_bom值
                $value->has_bom=1;
                //4.2 获取符合规则的bom
                $bom=DB::table(config('alias.rb'))->select('id','version','status','is_version_on')->where('material_id','=',$value->material_id)->where('status',1)->where('is_version_on',1)->first();
                if(empty($bom)) $bom=DB::table(config('alias.rb'))->select('id','version','status','is_version_on')->where('material_id','=',$value->material_id)->orderBy('version','desc')->first();
                $value->version=$bom->version;
                $value->bom_status=$bom->status;
                $value->is_version_on=$bom->is_version_on;
                $value->bom_id=$bom->id;
                //4.3 返回bom的版本列表
                //$value->versions=DB::table(config('alias.rb'))->where('material_id','=',$value->material_id)->pluck('version');
            }else{
                $value->has_bom=0;
            }

        }
        return $obj_list;
    }
//endregion









































//region   删

    /**
     * 对物料进行删除
     * @param $id
     * @return mixed
     * @author sam.shan   <sam.shan@ruis-ims.cn>
     */
    public function destroy($id,$creator_id)
    {

        //1.是否存在bom顶级母件在使用
        $has=$this->isExisted([[$this->apiPrimaryKey,'=',$id]],config('alias.rb'));
        if($has) TEA('7003');
        //2.是否存在bom的子项在使用
        $has=$this->isExisted([[$this->apiPrimaryKey,'=',$id]],config('alias.rbi'));
        if ($has) TEA('7004');
        //3.判断是否在工艺路线中使用
        $has = $this->isExisted([[$this->apiPrimaryKey,'=',$id]],config('alias.rbri'));
        if($has) TEA('7005');
//        $material = $this->getRecordById($id,['name'],config('alias.rm'));
        try {
            //开启事务大杀特杀
            DB::connection()->beginTransaction();

            //1.删除该物料的物料属性
            $this->destroyMaterialAttribute($id,$creator_id);
            //2.删除该物料的工艺属性
            $this->destroyOperationAttribute($id,$creator_id);
            //3.删除图纸
            $this->destroyDrawing($id);
            //4.删除附件
            $this->destroyAttachment($id);
            //5.删除物料关联工序得到的工时
            $this->destoryWorkHour($id);

            //5.删除物料
            $num = $this->destroyById($id);
            if ($num === false) TEA('803');
            if (empty($num)) TEA('404');
            //操作日志
            $events = [
                'action'=>'delete',
                'desc'=>'删除物料及其所有关联物料属性、工艺属性、图纸、附件，关联等信息',
            ];
            Trace::save(config('alias.rm'),$id,$creator_id,$events);
        } catch (\ApiException $e) {
            //回滚
            DB::connection()->rollBack();
            TEA($e->getCode());
        }
        //提交事务
        DB::connection()->commit();
    }


    /**
     * 删除所有的物料属性
     * @param $material_id
     * @return mixed
     * @author xujian
     * @author  sam.shan <sam.shan@ruis-ims.cn>
     */
    public function destroyMaterialAttribute($material_id)
    {
        $num = DB::table(config('alias.ma'))->where($this->apiPrimaryKey, '=', $material_id)->delete();
        if ($num === false) TEA('803');
    }


    /**
     * 删除工艺属性
     * @param $material_id
     * @param $attribute_id
     * @throws \Exception
     * @author  xujian
     * @reviser  sam.shan <sam.shan@ruis-ims.cn>
     */
    public function destroyOperationAttribute($material_id)
    {
        $num =  DB::table(config('alias.oav'))->where('owner_type','material')
                                          ->where('owner_id',$material_id)
                                          ->delete();
        if ($num === false) TEA('803');
    }


    /**
     * 删除物料关联图纸
     * @param $material_id
     * @throws \App\Exceptions\ApiException
     * @author  sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function destroyDrawing($material_id)
    {
        $num = DB::table(config('alias.rmd'))->where($this->apiPrimaryKey, '=', $material_id)->delete();
        if ($num === false) TEA('803');
    }

    /**
     * 删除物料关联附件
     * @param $material_id
     * @throws \App\Exceptions\ApiException
     * @author  sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function destroyAttachment($material_id)
    {
        $num = DB::table(config('alias.rma'))->where($this->apiPrimaryKey, '=', $material_id)->delete();
        if ($num === false) TEA('803');
    }

    /**
     * 删除物料关联工序得到的工时
     * @param $material_id
     */
    public function destoryWorkHour($material_id){
        $res = DB::table(config('alias.rimw'))->where($this->apiPrimaryKey,'=',$material_id)->delete();
        if($res === false) TEA('803');
    }


//endregion

//region 拉取ERP物料和BOM
    /**
     * @author Bruce Chu
     * @param $item_no
     * @return \Illuminate\Http\JsonResponse
     */
    public function pullErpMaterialAndBOM($item_no)
    {
        //先判断该物料编码对应的物料和BOM有无入库
        $has = $this->isExisted([['item_no', '=', $item_no]], config('alias.rm'));
        if($has){
            TEA('808');
        }else {
            //约定返回数组 material => -1 默认为空 bom => 0 默认为空
            $result = ['material' => -1, 'bom' => 0,'message'=>''];
            //走拉取ERP物料与BOM接口
            $erp_material = new ErpMaterial();
            //插入物料,此处沿用ERP拉取物料返回结果
            //大于0  => 有物料有BOM,可生成物料,返回真实的数据库中物料id
            //等于0  => 有物料无BOM,可生成物料
            //等于-1 => 无物料无BOM,不生成物料
            $product_id = $erp_material->material($item_no);
            $result['material'] = $product_id;
            if ($product_id > 0) {
                $result['message'] = '已成功拉取物料与BOM';
                $erp_bom = new ErpBomDataImport();
                //插入BOM
                $erp_bom->importBomData($item_no);
                //看有无BOM
                $bom = DB::table(config('alias.rb'))->where([['material_id', '=', $product_id], ['status', '=', '1'], ['is_version_on', '=', 1]])->first();
                if (!empty($bom)) {
                    //已插入bom 状态定义为1
                    $result['bom'] = 1;
                } else {
                    //拉取BOM失败
                    TEA('2111');
                }
            } elseif ($product_id == 0) {
                $result['message'] = '已成功拉取物料';
            } else {
                $result['message'] = '未查询到相关物料与BOM';
            }
            return $result;
        }
    }
//endregion









































}