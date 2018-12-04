<?php
/**
 * Created by PhpStorm.
 * User: ruiyanchao
 * Date: 2017/12/18
 * Time: 下午2:37
 */

namespace App\Http\Models;//定义命名空间
use App\Exceptions\ApiException;
use function GuzzleHttp\Psr7\parse_header;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

/**
 * BOM操作类
 * @author  rick
 * @time    2017年10月19日13:39:39
 */
class BomGroup extends Base
{
    public  $apiPrimaryKey='bom_group_id';
    public function __construct()
    {
        parent::__construct();
        $this->table   = config('alias.rbg');
    }

//region  检
    /**
     * 制定规则
     * @return array
     */
//    public function getRules()
//    {
//        return array(
//            'bom_group_id'=> array('name'=>'bom_group_id','min'=>1,'type'=>'string','require'=>true,'on'=>'update','desc'=>'更新时的主键'),
//            'code'   => array('name'=>'code','type'=>'string','require'=>true,'on'=>'add,update','desc'=>'物料清单分组编码'),
//            'name'   => array('name'=>'name','type'=>'string','require'=>true,'on'=>'add,update','desc'=>'物料清单分组名称'),
//            'description' => array('name'=>'description','default'=>'','type'=>'string','max'=>500,'require'=>false,'on'=>'add','desc'=>'物料清单分组描述'),
//        );
//    }


    /**
     * add/update参数检测
     * @param $input  array 要过滤判断的get/post数组
     * @return void         址传递,不需要返回值
     */
    public function checkFormFields(&$input)
    {
        //过滤参数
        trim_strings($input);
        //判断操作模式
        $add=$this->judgeApiOperationMode($input);

        //1.code 物料清单分组编码   YUS
        if($add){
            #1.1 不可以为空,且3-50位字母数字下划线组成,字母打头
            if(empty($input['code']) || !preg_match(config('app.pattern.bom_group_code'),$input['code'])) TEA('700','code');
            #1.2 唯一性检测
            $has=$this->isExisted([['code','=',$input['code']]]);
            if($has) TEA('2104','code');
        }
        //2.name 物料清单分组名称   YU
            #2.1 不可以为空
        if(empty($input['name'])) TEA('700','name');
            #2.2 唯一性检测
        $check=$add?[['name','=',$input['name']]]:[['name','=',$input['name']],[$this->primaryKey,'<>',$input[$this->apiPrimaryKey]]];
        $has=$this->isExisted($check);
        if($has) TEA('2105','name');
        //3.description 描述   N
            #3.1 数据类型以及字数限制检测
        if(!isset($input['description']) || mb_strlen($input['description'])>config('app.comment.bom_group')) TEA('700','description');
    }

//endregion
//region  增
    /**
     * BomGroup的添加接口
     * @param $input
     * @return mixed
     * @reviser   sam.shan   <sam.shan@ruis-ims.cn>
     */
    public function add($input)
    {
        $this->checkFormFields($input);
        //$this->checkRules($input);
        //获取入库数组
        $data = [
            'code'=>$input['code'],//bom编码
            'name'=>$input['name'],//名称
            'description'=>$input['description'],
        ];
        //入库
        $insert_id = DB::table($this->table)->insertGetId($data);
        if (!$insert_id) TEA('802');
        return $insert_id;
    }


//endregion
//region  修
    /**
     * BomGroup的更新接口
     * @param $input
     * @return mixed
     * @reviser  sam.shan <sam.shan@ruis-ims.cn>
     */
    public function update($input)
    {
        $this->checkFormFields($input);
        //$this->checkRules($input);
        //获取入库数组
        $data = [
            //'code'=>$input['code'],//bom编码
            'name'=>$input['name'],//名称
            'description'=>$input['description'],
        ];

        //入库
        $upd= DB::table($this->table)->where($this->primaryKey,$input[$this->apiPrimaryKey])->update($data);
        if($upd===false) TEA('806');
    }
//endregion
//region  查

    /**
     * 查看详情
     * @param $id  int  主键id
     * @return object   返回的是一个对象
     * @author  sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function get($id)
    {
        $obj=$this->getRecordById($id,['id','id as '.$this->apiPrimaryKey,'name','code','description']);
        if(!$obj) TEA('404');
        return $obj;
    }

    /**
     * 获得select列表
     * @return object list
     * @author rick
     */
    public function getSelectBomGroupList()
    {
        $obj_list = DB::table($this->table)
            ->select('id as bom_group_id','name','code','description')
            ->orderBy('id','desc')
            ->get();
        return $obj_list;
    }


    /**
     * 获得BOM分组分页列表
     * @param $input
     * @return object list
     * @author rick
     */
    public function getBomGroupList(&$input)
    {
        !empty($input['code']) &&  $where[]=['code','like','%'.$input['code'].'%']; //物料分组编码
        !empty($input['name']) &&  $where[]=['name','like','%'.$input['name'].'%'];  //名称
        $builder = DB::table($this->table)
            ->select('id as bom_group_id',
                'name',
                'code',
                'description')
            ->offset(($input['page_no']-1)*$input['page_size'])
            ->limit($input['page_size']);

        if (!empty($where)) $builder->where($where);
        //order  (多order的情形,需要多次调用orderBy方法即可)
        if (!empty($input['order']) && !empty($input['sort'])) $builder->orderBy( $input['sort'], $input['order']);
        //get获取接口
        $obj_list = $builder->get();
        //总共有多少条记录
        $count_builder= DB::table($this->table);
        if (!empty($where)) $count_builder->where($where);
        $input['total_records']=$count_builder->count();
        return $obj_list;
    }

//endregion
//region  删

    /**
     * 删除
     * @param $id
     * @throws \Exception
     * @author   sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function destroy($id)
    {

        //该分类使用已经使用了,使用的话,则禁止删除
        $has=$this->isExisted([[$this->apiPrimaryKey,'=',$id]],config('alias.rb'));
        if($has) TEA('2103');

        $num=$this->destroyById($id);
        if($num===false) TEA('803');
        if(empty($num))  TEA('404');
    }




//endregion











}