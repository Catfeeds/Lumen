<?php
/**
 * Created by PhpStorm.
 * User: xujian
 * Date: 17/9/25
 * Time: 下午17:49
 */

namespace App\Http\Models\Material;//定义命名空间
use App\Http\Models\AttributeDataType;
use App\Http\Models\Base;
use App\Http\Models\Encoding\EncodingSetting;
use App\Http\Models\UomUnit;
use Illuminate\Support\Facades\DB;//引入DB操作类

/**
 * 模板操作类
 * @author  sam.shan <sam.shan@ruis-ims.cn>
 * @time    2017年09月28日 17:28
 */
class Template extends Base
{


    public $apiPrimaryKey='template_id';
    public function __construct()
    {
        parent::__construct();
        $this->table=config('alias.template');
    }


//region  检

    /**
     * 添加模板时需要检查是否每个函数都有值
     * @param $input  array 要过滤判断的get/post数组
     * @return void         址传递,不需要返回值
     * @author   xujian
     * @reviser  sam.shan   <sam.shan@ruis-ims.cn>
     *
     */
    public function checkFormFields(&$input)
    {
        //过滤
        trim_strings($input);

        //判断操作模式,要么是添加模式要么是编辑模式
        $add=$this->judgeApiOperationMode($input);


        //1.parent_id 基于模板,这里的上级不同于物料分类,这里本质就是复制 NS
        if($add){
              #1.1 parent_id  数据类型
            if(!isset($input['parent_id']) || !is_numeric($input['parent_id']))  TEA('700','parent_id');
              #1.2 parent_id  必须是存在数据库中的分类
            if($input['parent_id']>0){
                $has=$this->isExisted([[$this->primaryKey,'=',$input['parent_id']]]);
                if(!$has) TEA('700','parent_id');
            }
        }
        //2.code  物料模板编码
        if($add){
             #2.1   由1-50字母数字下划线组成，且字母打头
            if(empty($input['code']) || !preg_match(config('app.pattern.template'),$input['code'])) TEA('700','code');
             #2.2 唯一性检测
            $has=$this->isExisted([['code','=',$input['code']]]);
            if($has) TEA('5011','code');
        }
        //3.name 模板名称
            #3.1 不为空
        if(empty($input['name'])) TEA('700','name');
            #3.2唯一性检测
        $check=$add?[['name','=',$input['name']]]:[['name','=',$input['name']],[$this->primaryKey,'<>',$input[$this->apiPrimaryKey]]];
        $has=$this->isExisted($check);
        if($has) TEA('5012','name');
        //4.label  模板标签
            #4.1 参数是否传递
        if(!isset($input['label']))  TEA('700','label');
        //5.description  描述
            #5.1 参数传递以及个数限制
        if(!isset($input['description']) || mb_strlen($input['description'])>config('app.comment.template')) TEA('700','description');
        //6.status 模板状态
            #6.1 添加的时候,如果有继承属性
        if($add) {
            $input['status']=0;
            if($input['parent_id']>0){
                $check=[['is_extends','=',1],['template_id','=',$input['parent_id']]];
                $has=$this->isExisted($check,config('alias.ad2t'));
                if($has)  $input['status']=1;
            }
        }
        //7.forefathers 祖先路径
           #7.1添加的时候自动识别路径
        if($add){
            if($input['parent_id']==0){
                $input['forefathers']='';
            }else{
                $f_forefathers=$this->getFieldValueById($input['parent_id'],'forefathers');
                $input['forefathers']=rtrim($f_forefathers,',').','.$input['parent_id'].',';
            }
        }

        //8.公司和工厂
        $input['company_id'] = (!empty(session('administrator')->company_id)) ? session('administrator')->company_id: 0;
        $input['factory_id'] = (!empty(session('administrator')->factory_id)) ? session('administrator')->factory_id : 0;


    }
    
    
    


//endregion
//region  增



    /**
     * 操作数据库添加模板
     * @param $input array  input数组
     * @param $category_id  int  模板标志位,注意这个不是模板类别或者说类型,仅仅是个标志位吧了,别把别人搞晕了,默认取3   sam.shan
     * @return int  返回插入表之后返回的主键值
     * @author     xujian  2017年12月01日10:20:42
     * @reviser    sam.shan  <sam.shan@ruis-ims.cn> 2017年12月01日10:20:48
     */
    public function add($input,$category_id)
    {

        //获取入库数组,此处一定要严谨一些,否则前端传递额外字段将导致报错,甚至攻击
        $encodingDao = new EncodingSetting();
        $input['code'] = $encodingDao->useEncoding(2,$input['code']);
        $data = [
            'code' => $input['code'],
            'name' => $input['name'],
            'label' => $input['label'],
            'description' => $input['description'],
            'category_id' => $category_id,
            'parent_id' => $input['parent_id'],
            'forefathers'=>$input['forefathers'],
            'status' =>$input['status'],
            'company_id'=>$input['company_id'],//公司ID
            'factory_id'=>$input['factory_id'],//工厂ID
        ];

        //入库
        $insert_id = DB::table($this->table)->insertGetId($data);
        if (!$insert_id) TEA('802');
        return  $insert_id;
    }

    /**
     * 获取某个物料使用的模板具有哪些属性
     * @param $template_id   模板
     * @param $category_id   标志位
     * @param $is_extends    0表示该模板本身具有哪些非继承性属性
     * @param $material_id   物料id
     * @return mixed
     * @author  hao.wei   <weihao>
     */
    public function getAttributesByTemplateByTemplateAndMaterial($template_id,$category_id,$material_id,$is_extends=NULL){
        $fields = ['ad2t.id as r_definition_template_id','ad2t.attribute_definition_id','ad2t.is_extends','ad2t.template_id',
            'ad.name','ad.key','ad.range','ad.datatype_id','ad.label','adt.cn_name as data_type',
            'uu.commercial as unit'];
        if($category_id == config('app.category.operation')){
            $fields[] = 'oav.value';
        }else{
            $fields[] = 'ma.value';
        }
        $builder=DB::table(config('alias.ad2t').' as ad2t')
            ->select($fields)
            ->leftJoin(config('alias.ad').' as ad','ad2t.attribute_definition_id', '=', 'ad.id')
            ->leftJoin(config('alias.uu').' as uu','uu.id','=','ad.unit_id');
        if($category_id == config('app.category.operation')){
            $builder->leftJoin(config('alias.oav').' as oav',function ($join) use($material_id) {
                $join->on('oav.attribute_id', '=', 'ad2t.attribute_definition_id')
                    ->where('oav.owner_id', '=', $material_id)
                    ->where('oav.owner_type','=','material');
            });
        }else{
            $builder->leftJoin(config('alias.ma').' as ma',function ($join) use($material_id) {
                $join->on('ma.attribute_definition_id', '=', 'ad2t.attribute_definition_id')
                    ->where('ma.material_id', '=', $material_id);
            });
        }
        $builder->leftJoin(config('alias.adt').' as adt','adt.id','=','ad.datatype_id')
            ->orderBy('ad.key','asc')
            ->where('ad2t.template_id',$template_id)
            ->where('ad2t.category_id',$category_id);
        if($is_extends!==NULL) $builder->where('ad2t.is_extends',$is_extends);
        $obj_list=$builder->get();
        return $obj_list;
    }





//endregion
//region  修-基础信息


    /**
     * 编辑模板基础信息
     * @param $input
     * @throws \Exception
     * @author  sam.shan@ruis-ims.cn
     */
    public function update($input)
    {
        //获取入库数组,此处一定要严谨一些,否则前端传递额外字段将导致报错,甚至攻击
        $data = [
            'name' => $input['name'],
            'label' => $input['label'],
            'description' => $input['description'],
        ];
        //入库
        $upd=DB::table($this->table)->where($this->primaryKey,$input[$this->apiPrimaryKey])->update($data);
        //当返回值为0的时候,表示影响的行数为0,即更新的内容未做任何改变或者说更新的记录不存在数据库中
        //为0的话不做处理了
        if($upd===false) TEA('804');
    }

//endregion
//region  修-物料属性


    /**
     * 获取某个模板关联了哪些属性ids
     * @param $template_id
     * @return array
     * @author   sam.shan <sam.shan@ruis-ims.cn>
     */
    public function  getAttributeDefinitionIdsByTemplateId($template_id,$category_id=NULL)
    {
        $builder=DB::table(config('alias.ad2t'))->where('template_id',$template_id);
        if($category_id!==NULL) $builder->where('category_id',$category_id);
        $attribute_ids=$builder->pluck('attribute_definition_id');
        return  json_decode(json_encode($attribute_ids),true);
    }
    /**
     * 获取某个模板继承了哪些属性ids
     * @param $forefathers
     * @param null $category_id
     * @param null $is_extends
     * @return mixed
     * @author  sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function  getAttributeDefinitionIdsByForefathers($forefathers,$category_id=NULL)
    {
        if(is_string($forefathers))  $forefathers=filter_forefathers($forefathers);
        $builder=DB::table(config('alias.ad2t'))->whereIn('template_id',$forefathers)
            ->where('is_extends',1);
        if($category_id!==NULL) $builder->where('category_id',$category_id);
        $attribute_ids=$builder->pluck('attribute_definition_id');
        return  json_decode(json_encode($attribute_ids),true);
    }


    /**
     * 根据模板获取可选择的属性
     * @param $template_id
     * @return mixed
     * @author  sam.shan   <sam.shan@ruis-ims.cn>
     */
    public function getOptionalAttributesByTemplate($template_id,$category_id)
    {
        //去除该模板已经选择的物料属性
        $self_exclude=$this->getAttributeDefinitionIdsByTemplateId($template_id,$category_id);
        //去除从祖宗那里继承的物料属性(注意只有物料属性才有继承这一说法)
        $parent_exclude=[];
        if($category_id==config('app.category.material')){
            $forefathers=$this->getFieldValueById($template_id,'forefathers');
            if(!empty($forefathers)) $parent_exclude=$this->getAttributeDefinitionIdsByForefathers($forefathers,$category_id);
        }
        //合并去重
        $exclude_attribute_ids=array_merge($self_exclude,$parent_exclude);
        array_unique($exclude_attribute_ids);
        //获取列表
        $obj_list= DB::table(config('alias.ad'))
            ->select('id','id as attribute_definition_id','key','name','label')
            ->where('category_id',$category_id)
            ->whereNotIn('id',$exclude_attribute_ids)
            ->orderBy('key','asc')->get();
        return $obj_list;

    }

    /**
     * 获取某个模板自身具有哪些属性
     * @param $template_id   模板
     * @param $category_id   标志位
     * @param $is_extends    0表示该模板本身具有哪些非继承性属性
     * @return mixed
     * @author  sam.shan   <sam.shan@ruis-ims.cn>
     */
    public function getSelectedAttributesByTemplate($template_id,$category_id,$is_extends=NULL)
    {
        $builder=DB::table(config('alias.ad2t').' as ad2t')
            ->select( 'ad2t.id as r_definition_template_id','ad2t.attribute_definition_id','ad2t.is_extends','ad2t.template_id',
                'ad.name','ad.key','ad.range','ad.datatype_id','ad.label','adt.cn_name as data_type',
                'uu.commercial as unit')
            ->leftJoin(config('alias.ad').' as ad','ad2t.attribute_definition_id', '=', 'ad.id')
            ->leftJoin(config('alias.uu').' as uu','uu.id','=','ad.unit_id')
            ->leftJoin(config('alias.adt').' as adt','adt.id','=','ad.datatype_id')
            ->orderBy('ad.key','asc')
            ->where('ad2t.template_id',$template_id)
            ->where('ad2t.category_id',$category_id);
        if($is_extends!==NULL) $builder->where('ad2t.is_extends',$is_extends);
        $obj_list=$builder->get();
        return $obj_list;
    }


    /**
     * 根据模板获取已经继承的属性,比如  只要B继承A,则B中必然继承了A中可被继承的属性
     * @param $template_id
     * @param $category_id
     * @return mixed
     * @author  sam.shan   <sam.shan@ruis-ims.cn>
     */
    public function getExtendAttributesByTemplate($template_id,$category_id)
    {
        $forefathers=$this->getFieldValueById($template_id,'forefathers');
        if(empty($forefathers))  return [];
        $forefathers=filter_forefathers($forefathers);

        $obj_list=DB::table(config('alias.ad2t').' as ad2t')
            ->select('ad2t.id','ad2t.attribute_definition_id','ad2t.template_id',
                'ad.name','ad.key','ad.label')
            ->leftJoin(config('alias.ad').' as ad','ad2t.attribute_definition_id', '=', 'ad.id')
            ->orderBy('ad.key','asc')
            ->whereIn('ad2t.template_id',$forefathers)
            ->where('ad2t.category_id',$category_id)
            ->where('ad2t.is_extends',1)
            ->get();
        return $obj_list;
    }


    /**
     * 保存属性之前对参数的有效性进行检测
     * @param $input
     * @throws \App\Exceptions\ApiException
     * @author sam.shan <sam.shan@ruis-ims.cn>
     */
    public function checkAttributeFields(&$input)
    {
        trim_strings($input);
        //参数判断之所以放到这里,是以为保存物料属性和工艺属性的时候都需要检测

        //1.template_id 模板
            #1.1 数据类型检测
        if(empty($input[$this->apiPrimaryKey]) || !is_numeric($input[$this->apiPrimaryKey])) TEA('700',$this->apiPrimaryKey);
            #1.2 存在性检测
        $has=$this->isExisted([[$this->primaryKey,'=',$input[$this->apiPrimaryKey]]]);
        if(!$has)TEA('700',$this->apiPrimaryKey);
        //2.attribute_definition_ids  属性参数,就算没有也要传递[]
            #2.1传递的格式
        if(empty($input['attribute_definition_ids']) || !is_json($input['attribute_definition_ids'])) TEA('700','attribute_definition_ids');
            #2.2转成数组
        $input['attribute_definition_ids']=json_decode($input['attribute_definition_ids'],true);
            #2.3数据来源是否正确
        foreach ($input['attribute_definition_ids'] as $key =>$value){
            if(!isset($value['attribute_definition_id']) || !isset($value['is_extends'])) TEA('701','attribute_definition_ids.'.$value['attribute_definition_id']);
            $has=$this->isExisted([['id','=',$value['attribute_definition_id']]],config('alias.ad'));
            if(!$has) TEA('702','attribute_definition_ids.'.$value['attribute_definition_id']);
        }


    }

    /**
     * 物料模板绑定属性之后入库处理
     * @param $input   array   前端传递的参数
     * @param int $category_id  int 1：人事模块 2：公司模块 3：物料模块 4:工艺参数 5：工时 6：做法库
     * @throws \App\Exceptions\ApiException
     * @author sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function saveAttributes($input,$category_id)
    {
        //检测参数统一放到M的原因是,保存物料属性和工艺属性是统一个方法
        $this->checkAttributeFields($input);

        try{
            //开启事务
            DB::connection()->beginTransaction();

            //1.获取数据库中物料模板已经绑定的物料属性
            $db_ref_obj= DB::table(config('alias.ad2t'))->where($this->apiPrimaryKey,$input[$this->apiPrimaryKey])
                ->where('category_id',$category_id)
                ->pluck('is_extends','attribute_definition_id');//第二个参数为key,第一个参数为value
            $db_ref_arr=obj2array($db_ref_obj);
            $db_ids=array_keys($db_ref_arr);
            //2.获取前端传递的物料属性
            $input_ref_arr=[];
            foreach($input['attribute_definition_ids'] as $key=>$value){
                $input_ref_arr[$value['attribute_definition_id']]=$value;
            }
            $input_ids=array_keys($input_ref_arr);
            //通过颠倒位置的差集获取改动情况
            $set=get_array_diff_intersect($input_ids,$db_ids);
            if(!empty($set['add_set']) || !empty($set['del_set']) || $set['common_set'])  $m=new AttributeDefinition2Template();
            //3.要添加的
            if(!empty($set['add_set']))  $m->addSet($set['add_set'],$input['template_id'],$category_id,$input_ref_arr);
            //4.要删除的属性，在删除的时候需要判断该属性是否在使用，如果有在使用的话则不能删除
            if(!empty($set['del_set']))  $m->delSet($set['del_set'],$input['template_id'],$db_ref_arr);
            //5.要编辑的
            if(!empty($set['common_set']))  $m->commonSet($set['common_set'],$input['template_id'],$db_ref_arr,$input_ref_arr);

            //6.保持模板状态有效,这条就被删除了,下面这条是亮哥三个月以来的结晶  liang 2017年12月01日17:33:03
            DB::table($this->table)->where($this->primaryKey,'=',$input[$this->apiPrimaryKey])->update(['status'=>1]);


        }catch(\ApiException $e){
            //回滚
            DB::connection()->rollBack();
            TEA($e->getCode());
        }

        //提交事务
        DB::connection()->commit();

    }


//endregion
//region 修-工艺属性
    /**
     * 获取工序对应的工艺属性(过滤掉已经选择的以及继承的)
     * @param $template_id
     * @param $operation_ids
     * @param int $category_id
     * @return mixed
     * @author  sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function getLinkAttributesByTemplateOperations($template_id,$operation_ids,$category_id)
    {

        //去除该模板已经选择的工艺属性
        $self_exclude=$this->getAttributeDefinitionIdsByTemplateId($template_id,$category_id);

        $builder=DB::table(config('alias.oa').' as oa')
            ->select('oa.operation_id','oa.attribute_id as attribute_definition_id',
                'ad.name','ad.key')
            ->leftJoin(config('alias.ad').' as ad','oa.attribute_id','=','ad.id')
            ->where('ad.category_id',$category_id);

        if(!empty($operation_ids)) $builder->whereIn('oa.operation_id',$operation_ids);
        if(!empty($self_exclude)) $builder->whereNotIn('oa.attribute_id',$self_exclude);
        return $builder->get();

    }

//endregion
//region  修-属性过滤

    /**
     * 物料模板属性过滤设置界面或者展示数据
     * @param $input
     * @param $categories
     * @return array
     * @author  sam.shan@ruis-ims.cn
     */
    public function attributesFilterList($input,$category,$ocategory)
    {

        //1.获取主要信息
        $obj_list=DB::table(config('alias.ad2t').' as ad2t')
            ->leftJoin(config('alias.ad').' as ad','ad2t.attribute_definition_id','=','ad.id')
            ->where('ad2t.template_id',$input['template_id'])
            ->whereIn('ad.category_id',[$category,$ocategory])
            ->select('ad2t.id','ad2t.template_id','ad2t.attribute_definition_id','ad2t.is_view','ad2t.is_merge','ad2t.is_extends','ad2t.filter_value',
                'ad.key','ad.label as name','ad.datatype_id','ad.unit_id','ad.category_id','ad.range')
            ->get();
        //2.获取常量表参考数据数组
        $uomUnitModel=new UomUnit();
        $attributeDataTypeModel=new AttributeDataType();
        $ref_unit=$uomUnitModel->getReferUnitList();
        $ref_data_type=$attributeDataTypeModel->getReferDataTypeList();
        //3.遍历获取次要信息
        $material_obj=[];
        $operation_obj=[];
        foreach ($obj_list as $key=>$value)
        {
            //属性数据类型
            $value->datatype_name=isset($ref_data_type[$value->datatype_id])?$ref_data_type[$value->datatype_id]:'';
            //单位
            $value->unit_name=isset($ref_unit[$value->unit_id])?$ref_unit[$value->unit_id]:'';
            //过滤值处理
            $value->filter_value=empty( $value->filter_value)?'':$value->filter_value;
            $value->filter_value=json_decode($value->filter_value,true);
            //筛选
            $value->category_id==$category && $material_obj[]=$value;
            $value->category_id==$ocategory && $operation_obj[]=$value;

        }
        //4.返回
        return ['material_attribute'=>$material_obj,'operation_attribute'=>$operation_obj];
    }


    /**
     * @param $input
     * @throws \App\Exceptions\ApiException
     * @author   sam.shan   <sam.shan@ruis-ims.cn>
     */
    public function  checkFilterFields(&$input)
    {

        //1.template_id  模板
            #1.1 数据类型
        if(empty($input[$this->apiPrimaryKey]) || !is_numeric($input[$this->apiPrimaryKey])) TEA('700',$this->apiPrimaryKey);
            #1.1 该模板是否存在
        $has=$this->isExisted([[$this->primaryKey,'=',$input[$this->apiPrimaryKey]]]);
        if(!$has)   TEA('701',$this->apiPrimaryKey);
        //2.attributes_config  属性配置
            #2.1 数据类型
        if(empty($input['attributes_config']) || !is_json($input['attributes_config']))  TEA('700','attributes_config');
            #2.2 转成数组
        $input['attributes_config']=json_decode($input['attributes_config'],true);
            #2.3 数据来源
        foreach($input['attributes_config'] as $key=>$value){
            if(!isset($value['is_merge']) || !isset($value['is_view']) || !isset($value['filter_value']))  TEA('701','attributes_config');
            $has=$this->isExisted([['template_id','=',$input['template_id']],['attribute_definition_id','=',$value['attribute_definition_id']]],config('alias.ad2t'));
            if(!$has)   TEA('703','attributes_config');

        }
    }
    /**
     * 保存属性过滤值
     * @param $input
     * @throws \App\Exceptions\ApiException
     * @author  sam.shan <sam.shan@ruis-ims.cn>
     */
    public  function  saveAttributesFilter($input)
    {

        $this->checkFilterFields($input);
        try{
            //开启事务
            DB::connection()->beginTransaction();

            foreach  ($input['attributes_config'] as $key =>$value){
                $data=[
                    'is_merge'=>$value['is_merge'],
                    'is_view'=>$value['is_view'],
                    'filter_value'=>is_array($value['filter_value'])?json_encode($value['filter_value']):$value['filter_value']
                ];
                $upd=DB::table(config('alias.ad2t'))
                    ->where('template_id',$input['template_id'])
                    ->where('attribute_definition_id',$value['attribute_definition_id'])
                    ->update($data);
                if($upd===false) TEA('806');
            }
        }catch(\ApiException $e){
            //回滚
            DB::connection()->rollBack();
            TEA($e->getCode());
        }

        DB::connection()->commit();

    }


//endregion



//region  查


    /**
     * 查看某条模板的信息
     * @param $id
     * @return array
     * @author  sam.shan   <sam.shan@ruis-ims.cn>
     */
    public function get($id)
    {
        $obj = $this->getRecordById($id,['id','code','name','label','description','parent_id','status','forefathers']);
        if (!$obj) TEA('404');
        return $obj;
    }

    /**
     * 根据条件查询该列表
     * @return mixed
     * @param $input array  input数组
     * @param $category_id  int   标志位,默认取3
     * @author xujian
     * @reviser  sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function getPageTemplateList(&$input,$category_id)
    {
        //多条件查询

        $where=[['category_id',$category_id]];
        !empty($input['code']) &&  $where[]=['code','like','%'.$input['code'].'%'];
        !empty($input['name']) && $where[]=['name','like','%'.$input['name'].'%'];
        !empty($input['label']) &&  $where[]=['label','like','%'.$input['label'].'%'];
        isset($input['parent_id']) && is_numeric($input['parent_id'])  && $where[]=['parent_id',$input['parent_id']];
        isset($input['status']) && is_numeric($input['status'])  && $where[]=['status',$input['status']];

        $builder = DB::table($this->table)->select(['id','code','name','label','description','parent_id','status','forefathers'])->where($where)
            ->offset(($input['page_no']-1)*$input['page_size'])
            ->limit($input['page_size']);
        //order  (多order的情形,需要多次调用orderBy方法即可)
        if(!empty($input['order']) && !empty($input['sort'])) $builder->orderBy($input['sort'],$input['order']);
        //get获取接口
        $obj_list=$builder->get();
        //总共有多少条记录
        $input['total_records'] = DB::table($this->table)->where($where)->count();
        return $obj_list;
    }

    /**
     * 获取模板类型列表
     * @param  $category_id   int  物料类型,不传递,默认取物料类型,为3
     * @return object
     * @author    sam.shan   <sam.shan@ruis-ims.cn>
     */
    public function getTemplateList($category_id)
    {
        $obj_list=DB::table($this->table)
            ->select(['id','code','name','label','description','parent_id','status','forefathers'])
            ->orderBy('id','desc')
            ->where('category_id',$category_id)
            ->get();
        return $obj_list;
    }

    /**
     * 获取有效的模板类型列表
     * @param  $category_id   int  物料类型,不传递,默认取物料类型,为3
     * @return object
     * @author    sam.shan   <sam.shan@ruis-ims.cn>
     */
    public function getSelectTemplateList($category_id)
    {
        $obj_list=DB::table($this->table)
            ->select(['id','code','name','label','description','parent_id','status','forefathers'])
            ->orderBy('id','desc')
            ->where('category_id',$category_id)
            ->where('status',1)
            ->get();
        return $obj_list;
    }

    /**
     * 有条件的搜索select(连同父类一起查出来)
     * @param $name
     * @return mixed
     */
    public function getSelectTemplateListByWhere($name){
        $field = [
            'id',
            'code',
            'name',
            'label',
            'description',
            'parent_id',
            'status',
            'forefathers'
        ];
        $id_list=DB::table($this->table)->select('id','parent_id')
            ->where('name','like','%'.$name.'%')
            ->get();
        $ids = [];
        foreach ($id_list as $k=>$v){
            $ids[] = $v->id;
        }
        foreach ($id_list as $k=>$v){
            if(!in_array($v->parent_id,$ids)){
                $ids[] = $v->parent_id;
            }
        }
        $obj_list = DB::table($this->table)->select($field)
            ->whereIn('id',$ids)
            ->get();
        return $obj_list;
    }





//endregion
//region  删-物料模板

    /**
     * 删除物料模板 [由于模板是公用的,删除不同模板对应的删除业务逻辑大大不同,所以单独封装,拆分耦合度]
     * @param $id
     * @throws \App\Exceptions\ApiException
     * @author  sam.shan <sam.shan@ruis-ims.cn>
     */
    public function destroyMaterialTemplate($id)
    {
        //1.存在一个儿子就禁止删除[更别说子孙一片了]
        $has=$this->isExisted([['parent_id','=',$id]]);
        if($has) TEA('5015');
        //2.物料中是否已经使用了
        $has=$this->isExisted([[$this->apiPrimaryKey,'=',$id]],config('alias.rm'));
        if ($has) TEA('5018');
        //3.开启事务大杀特杀
        try {
            //开启事务
            DB::connection()->beginTransaction();
            //删除主表 template
            $del=$this->destroyById($id);
            if($del===false) TEA('803');
            if($del==0) TEA('404');
            //删除模板与属性关联表  attribute_definition2template
            $del2=DB::table(config('alias.ad2t'))->where($this->apiPrimaryKey,'=',$id)->delete();
            if($del2===false) TEA('803');
        }catch(\ApiException $e){
            //回滚
            DB::connection()->rollBack();
            TEA($e->getCode());
        }
        //提交事务
        DB::connection()->commit();
    }

//endregion



























































}