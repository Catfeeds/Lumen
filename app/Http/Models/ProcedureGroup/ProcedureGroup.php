<?php
/**
 * Created by PhpStorm.
 * User: zhufeng
 * Date: 2018/8/15
 * Time: 下午1:44
 */
namespace App\Http\Models\ProcedureGroup;
use App\Http\Models\Base;
use Illuminate\Support\Facades\DB;

/**
 * 工艺路线组模型
 * Class ProcedureGroup
 * @package App\Http\Models\ProcedureGroup
 * @author Bruce.Chu
 */
class ProcedureGroup extends Base
{
    /**
     * 前端传递的api主键名称
     * @var string
     */
    public $apiPrimaryKey = 'procedure_group_id';

    public function __construct()
    {
        parent::__construct();
        //基础表 工艺路线组表 ruis_procedure_route_group
        $this->table = config('alias.rprg');
    }

    /**增
     * @param $input
     * @return mixed
     */
    public function add($input)
    {
        $this->checkRules($input);
        $data=[
            'code'=>$input['code'],//编码
            'name'=>$input['name'],//名称
            'description'=>$input['description'],//描述
        ];
        //入库
        $insert_id = DB::table($this->table)->insertGetId($data);
        //向工艺路线表添加关联关系 工艺路线组:工艺路线=>1:n
        $procedure_route_ids=explode(',',$input['procedure_route']);
        DB::table(config('alias.rpr'))->whereIn('id',$procedure_route_ids)->update([$this->apiPrimaryKey=>$insert_id]);
        //向工艺路线组+工厂关系表加入关联关系 工艺路线组:工厂=>n:n
        $factory_ids=explode(',',$input['factory']);
        //插入关联关系 这里可以考虑拼接成二维关系数组一次insert 量小拼接繁琐 还是用foreach吧
        foreach($factory_ids as $factory_id){
            DB::table(config('alias.rgfr'))->insert([$this->apiPrimaryKey=>$insert_id,'factory_id'=>$factory_id]);
        }
        return $insert_id;
    }

    /**
     * 删除一条记录
     * @param $id
     */
    public function delete($id)
    {
        //检验 若bom配置了组下的工艺路线 该组不可删
        $used_count=DB::table(config('alias.rbr').' as bom_routing')
            ->leftJoin(config('alias.rpr').' as route','bom_routing.routing_id','route.id')
            ->where($this->apiPrimaryKey,$id)
            ->count();
        if($used_count) TEA('2003');
        $delete=$this->destroyById($id);
        if(!$delete) TEA('803');
        //置空工艺路线组对工艺路线关联关系
        DB::table(config('alias.rpr'))->where($this->apiPrimaryKey,$id)->update([$this->apiPrimaryKey=>0]);
        //删除工艺路线组对工厂关联关系
        DB::table(config('alias.rgfr'))->where($this->apiPrimaryKey,$id)->delete();
    }

    /**
     * 改
     * @param $input
     * @return mixed
     */
    public function update($input)
    {
        $this->checkRules($input);
        $data=[
            'code'=>$input['code'],//编码
            'name'=>$input['name'],//名称
            'description'=>$input['description'],//描述
        ];
        $update= DB::table($this->table)->where($this->primaryKey,$input[$this->apiPrimaryKey])->update($data);
        if($update===false) TEA('806');
        //向工艺路线表更新关联关系
        $procedure_route_ids=explode(',',$input['procedure_route']);
        //先置空该组关联的工艺路线
        DB::table(config('alias.rpr'))->where($this->apiPrimaryKey,$input[$this->apiPrimaryKey])->update([$this->apiPrimaryKey=>0]);
        //再关联工艺路线组关系
        DB::table(config('alias.rpr'))->whereIn($this->primaryKey,$procedure_route_ids)->update([$this->apiPrimaryKey=>$input[$this->apiPrimaryKey]]);
        //向工艺路线组+工厂关系表 更新关联关系
        //先删除工艺路线组对工厂关联关系 这里不采用array_diff
        DB::table(config('alias.rgfr'))->where($this->apiPrimaryKey,$input[$this->apiPrimaryKey])->delete();
        //再向工艺路线组+工厂关系表加入关联关系
        $factory_ids=explode(',',$input['factory']);
        //插入关联关系 这里可以考虑拼接成二维关系数组一次insert 量小拼接繁琐 还是用foreach吧
        foreach($factory_ids as $factory_id){
            DB::table(config('alias.rgfr'))->insert([$this->apiPrimaryKey=>$input[$this->apiPrimaryKey],'factory_id'=>$factory_id]);
        }
        return $input[$this->apiPrimaryKey];
    }

    /**
     * 分页展示工艺路线组
     * @param $input
     * @return mixed
     */
    public function getProcedureGroupList(&$input)
    {
        !empty($input['code']) &&  $where[]=['code','like','%'.$input['code'].'%'];
        !empty($input['name']) &&  $where[]=['name','like','%'.$input['name'].'%'];
        $builder = DB::table($this->table)
            ->offset(($input['page_no']-1)*$input['page_size'])
            ->limit($input['page_size']);
        if (!empty($where)) $builder->where($where);
        //order  (多order的情形,需要多次调用orderBy方法即可)
        if (!empty($input['order']) && !empty($input['sort'])) $builder->orderBy($input['sort'],$input['order']);
        //get获取接口
        $obj_list = $builder->get();
        foreach ($obj_list as $value){
            //所属的工厂
            $value->factory=DB::table(config('alias.rgfr') .' as rgfr')
                ->leftJoin(config('alias.rf') .' as factory','rgfr.factory_id','factory.id')
                ->select('factory.id','factory.name')
                ->where($this->apiPrimaryKey,$value->id)
                ->get();
            //下属的工艺路线
            $value->procedure_route=DB::table(config('alias.rpr'))
                ->select('id','name')
                ->where($this->apiPrimaryKey,$value->id)
                ->get();
        }
        //总共有多少条记录
        $count_builder= DB::table($this->table);
        if (!empty($where)) $count_builder
            ->where($where);
        $input['total_records']=$count_builder->count();
        return $obj_list;
    }

    /**
     * 查看工艺路线组信息
     * @param $input
     * @return mixed
     */
    public function show($input)
    {
        //未分叉的基础sql
        $builder=DB::table(config('alias.rf'))->select('id as factory_id','name as factory_name');
        //拿到绑定bom的厂 即bom会在某个厂生产 bom的工艺路线模块展示已绑定bom的厂
        $bom_factory=DB::table(config('alias.rbf'))->select('factory_id')
            ->where([['material_code',$input['material_code']],['bom_no',$input['bom_no']]])
            ->distinct()
            ->get();
        $bom_factory=obj2array($bom_factory);
        //若该bom未绑定厂 展示所有厂的厂-组-线关系 否 展示绑定厂的厂-组-线关系
        if(empty($bom_factory)){
            $obj_list=$builder->orderBy('code')->get();
        }else{
            $obj_list=$builder->whereIn('id',obj2array($bom_factory))->orderBy('code')->get();
        }
        //内外两层foreach 外层向工厂加入下属的工艺路线组 内层向工艺路线组加入下属的工艺路线
        foreach ($obj_list as $value){
            //拿到该厂下所有的工艺路线组 工艺路线组+工厂关系表关联工艺路线组表
            $value->groups=DB::table(config('alias.rgfr').' as rgfr')
                ->leftJoin(config('alias.rprg').' as group','rgfr.procedure_group_id','group.id')
                ->select('group.id as group_id','group.name as group_name')
                ->where('rgfr.factory_id',$value->factory_id)
                ->get();
            foreach ($value->groups as $group){
                //拿到该工艺路线组下所有的工艺路线
                $group->procedure_route=DB::table(config('alias.rpr'))
                    ->select('id','name')
                    ->where($this->apiPrimaryKey,$group->group_id)
                    ->get();
            }
        }
        return $obj_list;
    }

    /**
     * 查看单条记录
     * @param $id
     * @return mixed
     */
    public function view($id)
    {
        $obj=$this->getRecordById($id);
        //所属的工厂
        $obj->factory=DB::table(config('alias.rgfr') .' as rgfr')
            ->leftJoin(config('alias.rf') .' as factory','rgfr.factory_id','factory.id')
            ->select('factory.id','factory.name')
            ->where($this->apiPrimaryKey,$id)
            ->get();
        //下属的工艺路线
        $obj->procedure_route=DB::table(config('alias.rpr'))
            ->select('id','name')
            ->where($this->apiPrimaryKey,$id)
            ->get();
        return $obj;
    }

    /**更新组时验证工艺路线是否被其他组占用 未使用
     * @param $procedure_group_id
     * @param $procedure_route_ids
     * @return array
     */
    public function groupIsUsed($procedure_group_id,$procedure_route_ids)
    {
        //转为一维数组
        $procedure_route_ids=explode(',',$procedure_route_ids);
        //声明返回数组
        $result=['used'=>0,'detail'=>[]];
        foreach ($procedure_route_ids as $value){
            $procedure_info=DB::table(config('alias.rpr'))
                ->select('procedure_group_id','name','id')
                ->where('id',$value)
                ->first();
            //组id不为0且不为当前组 表示被其他组占用
            if($procedure_info->procedure_group_id !=0 && $procedure_group_id!=$procedure_info->procedure_group_id){
                $result['used']=1;
                $result['detail'][]=$procedure_info->name;
            }
        }
        return $result;
    }

    /**添加组时验证工艺路线是否被占用 未使用
     * @param $procedure_route_ids
     * @return array
     */
    public function groupIsEmpty($procedure_route_ids)
    {
        //转为一维数组
        $procedure_route_ids=explode(',',$procedure_route_ids);
        //声明返回数组
        $result=['used'=>0,'detail'=>[]];
        foreach ($procedure_route_ids as $value){
            $procedure_info=DB::table(config('alias.rpr'))
                ->select('procedure_group_id','name','id')
                ->where('id',$value)
                ->first();
            //组id不为0 表示被其他组占用
            if($procedure_info->procedure_group_id !=0){
                $result['used']=1;
                $result['detail'][]=$procedure_info->name;
            }
        }
        return $result;
    }

    /**不同场景展示工艺路线 add/update
     * @param $input
     * @return mixed
     */
    public function getProcedureRoute($input)
    {
        //添加组时展示未绑定组的工艺路线
        $builder=DB::table(config('alias.rpr'))
            ->where('procedure_group_id',0);
        //编辑组时展示未绑定组的工艺路线+该组绑定的工艺路线
        if(isset($input[$this->apiPrimaryKey])) $builder->OrWhere('procedure_group_id',$input[$this->apiPrimaryKey]);
        $obj_list=$builder->get();
        return $obj_list;
    }

    /**
     * 校验厂是否与bom的工艺路线关联
     * @param $factory_id
     * @param $procedure_route_ids
     */
    public function factoryIsUsed($factory_id,$procedure_route_ids)
    {
        //转为一维数组
        $procedure_route_ids=explode(',',$procedure_route_ids);
        //取出库中 工艺路线集合对应的厂集合
        $factory_ids=DB::table(config('alias.rbr'))
            ->whereIn('routing_id',$procedure_route_ids)
            ->distinct()
            ->pluck('factory_id');
        //该厂正在使用,不可删除
        if(in_array($factory_id,obj2array($factory_ids))) TEA('2004');
    }
}