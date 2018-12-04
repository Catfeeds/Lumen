<?php
/**
 * Created by PhpStorm.
 * User: haoziye
 * Date: 2018/1/25
 * Time: 下午2:55
 */
namespace App\Http\Models;
use Illuminate\Support\Facades\DB;

class OperationAttributeDefinition extends Base{

    public  $apiPrimaryKey='attribute_definition_id';
    public function __construct()
    {
        parent::__construct();
        $this->table=config('alias.ad');
    }

//region 检

    /**
     * 添加自定义函数时需要检查是否每个函数都有值
     * @param $input  array 要过滤判断的get/post数组
     * @return void         址传递,不需要返回值
     * @author   xujian
     * @reviser   sam.shan  <sam.shan@ruis-ims.cn>
     * @todo  现在属性表是公共的,且做了单一的唯一索引,所以一旦两种不同类型的属性需要具有相同的键值或者名称的时候就达不到了,所有有好事者在添加属性的时候给了个是否全局唯一的选项
     */
    public function checkFormFields(&$input)
    {
        //过滤
        trim_strings($input);
        //判断操作模式,要么是添加模式要么是编辑模式
        $add=$this->judgeApiOperationMode($input);

        //1.key 属性键值 YUS
        if($add){
            #1.1 键值由3-50位字母下划线数字组成,字母开头
            if(empty($input['key']) || !preg_match(config('app.pattern.attribute'),$input['key']) ) TEA('700','key');
            #1.2 唯一性检测
            $has=$this->isExisted([['key','=',$input['key']]]);
            if($has) TEA('4004','key');
        }
        //2.name 属性名称  YU
        #2.1 不可以为空
        if(empty($input['name'])) TEA('700','name');
        #2.2 唯一性检测
        $check=$add?[['name','=',$input['name']]]:[['name','=',$input['name']],[$this->primaryKey,'<>',$input[$this->apiPrimaryKey]]];
        $has=$this->isExisted($check);
        if($has) TEA('4005','name');
        //3.label 标签  N
        #3.1 参数必须传递
        if(!isset($input['label']))  TEA('700','label');
        //4 unit_id  单位  NS+
        #4.1 参数必须传递
        if(!isset($input['unit_id'])) TEA('700','unit_id');
        #4.2 单位数据源对不对
        if(!empty($input['unit_id'])){
            $has=$this->isExisted([['id','=',$input['unit_id']]],config('alias.uu'));
            if(!$has) TEA('700','unit_id');
        }
        //5.datatype_id 数据类型 YS,虽然不可以修改,但仍需要前端传递,range需要进行比对
        //5.1 非空检测
        if(empty($input['datatype_id'])) TEA('700','datatype_id');
        //5.2 数据源是否正确
        $has=$this->isExisted([['id','=',$input['datatype_id']]],config('alias.adt'));
        if(!$has) TEA('700','datatype_id');
        //6.range 数据类型为选择或者数字的时候需要传递的值 Y
        #6.1 参数以及格式检测
        if(empty($input['range']) || !is_json($input['range']))  TEA('700','range');
        #6.2 为数字的时候,最小值/最大值/默认值检测(取值区间就不要在这里验证了,放在前端)
        if($input['datatype_id']==config('app.data_type.number')){
            $range=json_decode($input['range'],true);
            if(!isset($range['min_value']) || !isset($range['max_value']) ||!isset($range['default_value'])) TEA('700','range');
        }

        #6.3 选择添加项格式检测,顺便给添加项设置值
        if($input['datatype_id']==config('app.data_type.select')){
            $range=json_decode($input['range'],true);
            if(empty($range['options']))  TEA('700','range');
            if(!isset($range['default_value'])) TEA('700','range.default_value');
            foreach ($range['options'] as $key=>&$value){
                if( empty($value['label'])) TEA('700','range.options.'.$key);
                $value['code']=trim($value['code']);
                if(empty($value['code'])) $value['code']=make_random_code($key+1).rand(0,10);
            }
            $input['range']=json_encode($range);
        }

        //7.is_man_haur_param 与工时有关
        #7.1 参数必传
        if(!isset($input['is_man_haur_param']) || !is_numeric($input['is_man_haur_param'])) TEA('700','is_man_haur_param');
        //8.is_visible_table  在报表中显示
        #7.1 参数必传
        if(!isset($input['is_visible_table']) || !is_numeric($input['is_visible_table'])) TEA('700','is_visible_table');
        //9.is_searchable  可用来搜索
        #9.1 参数必传
        if(!isset($input['is_searchable']) || !is_numeric($input['is_searchable'])) TEA('700','is_searchable');
        //10.comment
        #10.1注释限制检测
        if(!isset($input['comment']) || mb_strlen($input['comment'])>config('app.comment.attribute')) TEA('700','comment');
    }

//endregion

//region 增

    /**
     * 操作数据库添加自定义函数
     * @param $input array  input数组,从前端传递
     * @param $category_id  int  属性标志位  1：人事模块 2：公司模块 3：物料模块 4:工艺参数 5：工时 6：做法库
     * @return int  返回插入表之后返回的主键值
     * @author      sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function add($input)
    {
        //获取入库数组,此处一定要严谨一些,否则前端传递额外字段将导致报错,甚至攻击
        $data=[
            'key' => $input['key'],
            'name' => $input['name'],
            'label' => $input['label'],
            'datatype_id' => $input['datatype_id'],
            'category_id' => config('app.category.operation'),
            'unit_id' => $input['unit_id'],
            'is_searchable'=>$input['is_searchable'],
            'is_visible_table'=>$input['is_visible_table'],
            'is_man_haur_param'=>$input['is_man_haur_param'],
            'comment'=>$input['comment'],
            'range'=>$input['range'],
        ];
        //入库
        $insert_id=DB::table($this->table)->insertGetId($data);
        if(!$insert_id) TEA('802');
        return  $insert_id;
    }

//endregion

//region  修



    /**
     * 编辑自定义参数
     * @param $input  api传递的数组参数
     * @throws \Exception
     * @author  sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function update($input)
    {

        //获取编辑数组
        $data=[
            'name'=>$input['name'],
            'label'=>$input['label'],
            'is_searchable'=>$input['is_searchable'],
            'is_visible_table'=>$input['is_visible_table'],
            'is_man_haur_param'=>$input['is_man_haur_param'],
            'comment'=>$input['comment'],
            'range'=>$input['range'],
        ];

        //即可填可不填,填了就不能改了  NS+需要特殊处理
        $db_unit_id=$this->getFieldValueById($input[$this->apiPrimaryKey],'unit_id');
        if(empty($db_unit_id))  $data['unit_id']=$input['unit_id'];
        //入库
        $upd=DB::table($this->table)->where('id',$input[$this->apiPrimaryKey])->update($data);
        if($upd===false) TEA('804');

    }




//endregion

//region  查


    /**
     * 查看某条自定义参数的信息
     * @param $id
     * @return array
     * @author  xujian
     * @reviser   sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function get($id)
    {
        $fields = [
            'ad.id','ad.id as '.$this->apiPrimaryKey,'ad.key','ad.name','ad.label','ad.range','ad.comment',
            'ad.is_searchable','ad.is_visible_table','ad.is_man_haur_param','ad.datatype_id','ad.unit_id',
            'adt.cn_name as datatype','uu.label as unit_text'
        ];
        $obj=DB::table($this->table.' as ad')->select($fields)
            ->leftJoin(config('alias.adt').' as adt','adt.id','=','ad.datatype_id')
            ->leftJoin(config('alias.uu').' as uu','uu.id','=','ad.unit_id')
            ->where('ad.id','=',$id)->first();

        if (!$obj) TEA('404');
        return $obj;
    }


    /**
     * 根据条件查询该列表
     * @param  $category_id  int  物料属性类型,默认取值3,目前大部分只有3在用，通过控制器进传值
     * @return mixed
     * @param $input array  input数组
     * @author xujian
     * @reviser   sam.shan <sam.shan@ruis-ims.cn>
     */
    public function getAttributeList(&$input)
    {
        //where条件拼接
        $where=[['ad.category_id',config('app.category.operation')]];
        !empty($input['key']) &&  $where[]=['ad.key','like','%'.$input['key'].'%'];//键值
        !empty($input['name']) &&  $where[]=['ad.name','like','%'.$input['name'].'%'];  //属性名称
        !empty($input['label']) &&  $where[]=['ad.label','like','%'.$input['label'].'%'];  //标签
        !empty($input['datatype_id']) && $where[]=['ad.datatype_id',$input['datatype_id']]; //数据类型
        !empty($input['unit_id']) && $where[]=['ad.unit_id',$input['unit_id']];//单位
        isset($input['is_man_haur_param']) && is_numeric($input['is_man_haur_param']) && $where[]=['ad.is_man_haur_param',$input['is_man_haur_param']];//与工时相关
        isset($input['is_visible_table']) && is_numeric($input['is_visible_table']) &&  $where[]=['ad.is_visible_table',$input['is_visible_table']];//在报表显示
        isset($input['is_searchable']) && is_numeric($input['is_searchable']) && $where[]=['ad.is_searchable',$input['is_searchable']];//可用来搜索
        //拼接sql语句
        $builder= DB::table($this->table.' as ad')
            ->select('ad.id','ad.id as attribute_definition_id','ad.key','ad.name','ad.label','ad.is_visible_table','ad.is_man_haur_param','ad.range','ad.datatype_id',
                'adt.cn_name as data_type',
                'uu.label as unit','ad.is_searchable')
            ->leftJoin(config('alias.adt').' as adt', 'ad.datatype_id', '=', 'adt.id')
            ->leftJoin(config('alias.uu').' as uu', 'ad.unit_id', '=', 'uu.id')
            ->where($where)
            ->offset(($input['page_no']-1)*$input['page_size'])
            ->limit($input['page_size']);
        //order  (多order的情形,需要多次调用orderBy方法即可)
        if(!empty($input['order']) && !empty($input['sort'])) $builder->orderBy('ad.'.$input['sort'],$input['order']);
        //get获取接口
        $obj_list=$builder->get();
        //总共有多少条记录
        $input['total_records']=DB::table($this->table.' as ad')
            ->leftJoin(config('alias.adt').' as adt', 'ad.datatype_id', '=', 'adt.id')
            ->leftJoin(config('alias.uu').' as uu', 'ad.unit_id', '=', 'uu.id')
            ->where($where)
            ->count();
        return $obj_list;
    }






//endregion
//region  删



    /**
     * 自定义函数进行删除
     * @param $id
     * @throws \Exception
     * @author  sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function destroy($id)
    {
        //1.判断是否已经在模板中使用了
        $has=$this->isExisted([[$this->apiPrimaryKey,'=',$id]],config('alias.ad2t'));
        if($has) TEA('4008',$this->apiPrimaryKey);
        //2.判断是否在未使用模板的物料中使用了

        $has=$this->isExisted([['attribute_id','=',$id]],config('alias.oav'));
        if($has)   TEA('4009',$this->apiPrimaryKey);
        //3.正式删除
        $num=$this->destroyById($id);
        if($num===false) TEA('803');
        if(empty($num))  TEA('404');
    }




//endregion
}