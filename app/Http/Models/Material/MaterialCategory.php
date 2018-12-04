<?php

namespace App\Http\Models\Material;
use App\Http\Models\Base;
use Illuminate\Support\Facades\DB;//引入DB操作类


/**
 * 物料分类数据操作类
 * @author  sam.shan  <sam.shan@ruis-ims.cn>
 * @time    2017年11月30日08:58:28
 */
class MaterialCategory extends  Base
{

    /**
     * 前端传递的api主键名称
     * @var string
     */
    public  $apiPrimaryKey='material_category_id';

    public function __construct()
    {
        parent::__construct();
        $this->table=config('alias.rmc');
    }



//region  检


    /**
     * add/update参数检测
     * @param array $input 要过滤判断的get/post数组
     * @throws \App\Exceptions\ApiException
     * @throws \Illuminate\Container\EntryNotFoundException
     */
    public function checkFormFields(&$input)
    {
        //过滤参数
        trim_strings($input);
        //判断操作模式
        $add=$this->judgeApiOperationMode($input);

        //1.name 物料分类名称   YU
             #1.1 不可以为空
        if(empty($input['name'])) TEA('700','name');
             #1.2 唯一性检测
        $check=$add?[['name','=',$input['name']]]:[['name','=',$input['name']],[$this->primaryKey,'<>',$input[$this->apiPrimaryKey]]];
        $has=$this->isExisted($check);
        if($has) TEA('1001','name');
        //2.  parent_id  上级分类  YS
        if($add){
            #2.1  数据类型正确与否
            if(!isset($input['parent_id']) || !is_numeric($input['parent_id']))  TEA('700','parent_id');
            if($input['parent_id']>0){
            #2.2  选择的上级分类必须是存在数据库中的分类
                $has=$this->isExisted([[$this->primaryKey,'=',$input['parent_id']]]);
                if(!$has) TEA('700','parent_id');
            #2.3 如果选择的上级分类已经存有物料,则不允许被其他分类选择作为上级分类
                $has=$this->isExisted([[$this->apiPrimaryKey,'=',$input['parent_id']]],config('alias.rm'));
                if($has) TEA('1008','parent_id');
            }

        }

        //3.description 描述
             #3.1 数据类型以及字数限制检测
        if(!isset($input['description']) || mb_strlen($input['description'])>config('app.comment.category')) TEA('700','description');
        //4.forefathers 祖先路径
        if($add){
            #4.1 自动识别祖先路径
            if($input['parent_id']==0){
                $input['forefathers']='';
            }else{
                $f_forefathers=$this->getFieldValueById($input['parent_id'],'forefathers');
                $input['forefathers']=rtrim($f_forefathers,',').','.$input['parent_id'].',';
            }
        }
        //5.code  物料分类编码,被用户强制要求改了,所以格式检测就不做了
             #5.1 自动获取物料分类编码,别顾忌同时的添加行为导致的并发量,表中已经设置了唯一索引,大不了添加失败,不影响的
        if($add && empty($input['code'])) $input['code']=$this->getAutoCodeByParentId($input['parent_id']);
        if(!isset($input['source'])) TEA('700','source');
        if($input['source'] && !in_array($input['source'],[1,2,3,4])) TEA('700','source');
        if(empty($input['unit_id'])) TEA('700','unit_id');
        $has = $this->isExisted([['id','=',$input['unit_id']]],config('alias.uu'));
        if(!$has) TEA('700','unit_id');

        //6.公司和工厂
        $input['company_id'] = (!empty(session('administrator')->company_id)) ? session('administrator')->company_id: 0;
        $input['factory_id'] = (!empty(session('administrator')->factory_id)) ? session('administrator')->factory_id : 0;
    }
//endregion
//region  增



    /**
     * 自动获取物料分类的编码,没有必要增加用户的工作量
     * @param $parent_id   int  物料分类父亲主键值
     * @return string      返回自动生成的编码
     * @todo   后续可以进行优化的
     * @author  sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function getAutoCodeByParentId($parent_id)
    {

        //必须这样,否则不是最后一个被删除的将导致重复值问题
        $prev_brother=DB::table($this->table)
            ->where('parent_id',$parent_id)
            ->select('code')
            ->orderBy('id','desc')
            ->first();
        //先判断是否存在兄弟
        if(isset($prev_brother->code)){
            if($prev_brother->code>0 && $prev_brother->code<10){
                $code=str_pad($prev_brother->code+1,2, '0', STR_PAD_LEFT);
            }else{
                preg_match('/^0+/',$prev_brother->code,$matches);
                $lead_zero=isset($matches['0'])?$matches['0']:'';
                $code=$lead_zero.($prev_brother->code+1);
            }
        }else{
            $father_code=$this->getFieldValueById($parent_id,'code');
            $code=$father_code.'01';
        }
        return $code;
    }


    /**
     * 入库操作,添加物料分类
     * @param $input array    input数组
     * @return int            返回插入表之后返回的主键值
     * @author     sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function add($input)
    {
        //获取入库数组,此处一定要严谨一些,否则前端传递额外字段将导致报错,甚至攻击
        $data=[
            'code'=>$input['code'],
            'template_id'=>isset($input['template_id'])?$input['template_id']:0,
            'name'=>$input['name'],
            'parent_id'=>$input['parent_id'],
            'description'=>$input['description'],
            'forefathers'=>$input['forefathers'],
            'source'=>$input['source'],
            'unit_id'=>$input['unit_id'],
            'company_id'=>$input['company_id'],//公司ID
            'factory_id'=>$input['factory_id'],//工厂ID
            'warehouse_unit_id'=>$input['warehouse_unit_id'],  //仓库发货单位
            'batch_management'=>$input['batch_management'],//批次管理
            'warehouse_management'=>$input['warehouse_management'],//现编仓管理
         ];
        //入库
        $insert_id=DB::table($this->table)->insertGetId($data);
        if(!$insert_id) TEA('802');
        return  $insert_id;
    }
//endregion
//region  修



    /**
     * 入库操作,编辑物料分类
     * 由于不能修改上级分类,所以判断辈分是否错乱就不需要了
     * @param $input
     * @throws \Exception
     * @author  sam.shan   <sam.shan@ruis-ims.cn>
     */
    public function update($input)
    {
        //获取编辑数组
        $data=[
            'name'=>$input['name'],
            'description'=>$input['description'],
            'template_id'=>isset($input['template_id'])?$input['template_id']:0,
            'source'=>$input['source'],
            'unit_id'=>$input['unit_id'],
            'warehouse_unit_id'=>$input['warehouse_unit_id'],  //仓库发货单位
            'batch_management'=>$input['batch_management'],//批次管理
            'warehouse_management'=>$input['warehouse_management'],//现编仓管理
        ];
        //入库
        $upd=DB::table($this->table)->where($this->primaryKey,$input[$this->apiPrimaryKey])->update($data);
        //当返回值为0的时候,表示影响的行数为0,即更新的内容未做任何改变或者说更新的记录不存在数据库中
        if($upd===false) TEA('804');
        //if($upd==0) TEA('805');
    }


//endregion
//region  查

    /**
     * 查看某条物料分类信息
     * @param $id  int  主键id
     * @return object   返回的是一个对象
     * @author  sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function get($id)
    {
        $field = [
            'rmc.id','rmc.id as '.$this->apiPrimaryKey,
            'rmc.name',
            'rmc.parent_id',
            'rmc.description',
            'rmc.code',
            'rmc.forefathers',
            'rmc.template_id',
            'rmc.warehouse_unit_id',
            'rmc.batch_management',
            'rmc.warehouse_management',
            'rmc.source',
            'rmc.unit_id',
            'ruu.commercial',
            'ruuruu.commercial as warehouse_commercial'
        ];
        $obj = DB::table(config('alias.rmc').' as rmc')
            ->leftJoin(config('alias.ruu').' as ruu','ruu.id','rmc.unit_id')
            ->leftJoin(config('alias.ruu').' as ruuruu','ruuruu.id','rmc.warehouse_unit_id')
            ->select($field)
            ->where('rmc.id',$id)
            ->first();
        if(!$obj) TEA('404');
        return $obj;
    }



    /**
     * 获取所有的物料分类列表
     * @return object  返回对象集合
     * @author sam.shan   <sam.shan@ruis-ims.cn>
     * @todo  分类树少的时候适合采取,后续多的时候采用层级递进方式
     */
    public function getCategoriesList()
    {
        $field = [
            'id','id as '.$this->apiPrimaryKey,
            'name',
            'parent_id',
            'description',
            'code',
            'forefathers',
            'template_id',
            'unit_id',
            'warehouse_unit_id',
            'batch_management',
            'source'
        ];
        $obj_list=DB::table($this->table)->select($field)
            ->get();
        return $obj_list;

    }

    /**
     * 有条件的搜索select(连同父类一起查出来)
     * @param $name
     * @return mixed
     */
    public function getCategoriesListByWhere($name){
        $field = [
            'id','id as '.$this->apiPrimaryKey,
            'name',
            'parent_id',
            'description',
            'code',
            'forefathers',
            'template_id',
            'unit_id',
            'warehouse_unit_id',
            'batch_management',
            'source'
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




//region  删


    /**
     * 物理删除物料分类
     * @param $id
     * @throws \Exception
     * @author   sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function destroy($id)
    {

        //存在一个儿子就禁止删除[更别说子孙一片了]
        $has_son=$this->isExisted([['parent_id','=',$id]]);
        if($has_son) TEA('904');
        //该分类使用已经使用了,使用的话,则禁止删除
        $has=$this->isExisted([[$this->apiPrimaryKey,'=',$id]],config('alias.rm'));
        if($has) TEA('1009');
        try{
            DB::connection()->beginTransaction();
            $num=$this->destroyById($id);
            if($num===false) TEA('803');
            if(empty($num))  TEA('404');
            //删除和工序关联的关系
            DB::table(config('alias.rimoc'))->where('material_category_id',$id)->delete();
        }catch (\ApiException $e){
            DB::connection()->rollback();
        }
        DB::connection()->commit();
    }


//endregion



























}