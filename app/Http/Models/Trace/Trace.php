<?php

namespace App\Http\Models\Trace;
use App\Http\Models\Base;
use Illuminate\Support\Facades\DB;//引入DB操作类


/**
 * 操作日志基类
 * @author  sam.shan  <sam.shan@ruis-ims.cn>
 * @time    2017年12月27日13:38:21
 */
class Trace extends  Base
{

    /**
     * 前端传递的api主键名称
     * @var string
     */
    public  $apiPrimaryKey='trace_id';

    public function __construct()
    {
        parent::__construct();
        $this->table=config('alias.rt').'_'.date('Y');
    }

//region  检

//endregion
//region  增

    /**
     * 入库操作
     * @param $data array    data数组
     * @return int            返回插入表之后返回的主键值
     * @author     sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function add($data)
    {
        return DB::table($this->table)->insertGetId($data);

    }


//endregion
//region  修





//endregion
//region  查

    /**
     * 分页查询列表
     * @param $input
     * @return mixed
     * @author  sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function getTraceList(&$input)
    {
        //重置table
        if(!empty($input['year'])) $this->table=config('alias.rt').'_'.$input['year'];
        //1.创建公共builder
          //1.1where条件预搜集
        $where = [];
        !empty($input['owner_type']) && $where[] = ['owner_type', '=',$input['owner_type']];
        !empty($input['owner_id']) && $where[] = ['owner_id', '=',$input['owner_id']];
        !empty($input['operation_id']) && $where[] = ['operation_id', '=',$input['operation_id']];
          //1.2.预生成builder,注意仅仅在get中需要的连表请放在builder_get中
       $builder = DB::table($this->table);
          //1.3 where条件拼接
        if (!empty($where)) $builder->where($where);
        //2.总共有多少条记录
        $input['total_records']=$builder->count();
        //3.select查询
        $builder_get=$builder;
           //3.1拼接分页条件
        $builder_get->select('id as trace_id','events','ctime','operation_id')
                    ->offset(($input['page_no'] - 1) * $input['page_size'])
                    ->limit($input['page_size']);
           //3.2 order排序
        if (!empty($input['order']) && !empty($input['sort'])) $builder_get->orderBy($input['sort'], $input['order']);
           //3.3 get查询
        $obj_list = $builder_get->get();
        //4.遍历格式化数据
           //4.1获取操作用户
        $ref_operators=$this->getTraceOperatorsList($input);
        foreach($obj_list as $key=>&$value){
            $value->ctime=date('Y-m-d H:i:s',$value->ctime);
            $value->events=json_decode($value->events);
            $value->operation_name=isset($ref_operators[$value->operation_id]['operation_name'])?$ref_operators[$value->operation_id]['operation_name']:'anonymous';
        }
        return $obj_list;
    }


    /**
     * 获取日志操作者的列表
     * @param $input
     * @return array
     * @author  sam.shan <sam.shan@ruis-ims.cn>
     */
    public function getTraceOperatorsList($input)
    {

        //重置table
        if(!empty($input['year'])) $this->table=config('alias.rt').'_'.$input['year'];

        $obj_list=DB::table($this->table)
                                                   ->where('owner_type',$input['owner_type'])
                                                   ->where('owner_id',$input['owner_id'])
                                                   ->distinct()
                                                   ->pluck('operation_id');
        //遍历获取名称
        $results=[];
        foreach($obj_list as $key=>$obj){
            $results[$obj]=['operation_id'=>$obj,'operation_name'=>$this->getFieldValueById($obj,'name',config('alias.u'))];
        }
        return $results;
    }



//endregion




//region  删




//endregion



























}