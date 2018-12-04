<?php

namespace App\Http\Models;//定义命名空间
use App\Http\Models\Material\Material;
use Illuminate\Support\Facades\DB;
/**
 * 工艺单处理类
 * @author  sam.shan  <sam.shan@ruis-ims.cn>
 * @time    2018年02月08日09:15:36
 */
class OperationOrder extends Base
{

    /**
     * 前端传递的api主键名称
     * @var string
     */
    public $apiPrimaryKey = 'operation_order_id';

    public function __construct()
    {
        parent::__construct();
        $this->table = config('alias.roo');
    }


//region  拆生产订单

    /**
     * 拆分生产订单
     * @param $production_order_id  int           生产订单表主键
     * @param $bom_tree             object|array  制造BOM树
     * @param $qty                  int           生产单的数量
     * @return     返回bool值           true表示拆单成功,false表示失败
     * @author  sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function splitProductionOrder($production_order_id,$bom_tree,$qty)
    {
        //遍历bom树获取结构图
        $operations=[];
        $this->RQOperation($bom_tree,$operations,$qty);

        foreach($operations as $key=> $operation){
        //工时处理
        foreach($operation['operation_ability_pluck'] as $key2 =>  &$value2){
            $where=[
                ['material_id','=',$operation['out_material']['0']['material_id']],
                ['operation_id','=',$operation['operation_id']],
                ['ability_id','=',$key2],
             ];
            $value2=[
                'name'=>$value2,
                'standard_working_hours'=>$this->getFieldValueByWhere($where,'work_hours',config('alias.rimw')),
            ];
        }
            //入库
        $data=[
            'number'=>$key,
            'production_order_id'=>$production_order_id,
            'qty'=>$operation['out_material']['0']['qty'],
            'name'=>$operation['out_material']['0']['name'],
            'operation_id'=>$operation['operation_id'],
            'operation_name'=>$operation['operation_name'],
            'operation_ability'=>$operation['operation_ability'],
            'level'=>$operation['level'],
            'operation_ability_pluck'=>json_encode($operation['operation_ability_pluck']),
            'dependency_operations'=>is_array($operation['dependency_operations'])?implode(',',$operation['dependency_operations']):'',
            'out_material'=>json_encode($operation['out_material']),
            'out_material_id'=>$operation['out_material_id'],
            'out_material_name'=>$operation['out_material_name'],
            'in_material'=>json_encode($operation['in_material']),
            'in_material_ids'=>is_array($operation['in_material_ids'])?implode(',',$operation['in_material_ids']):'',
            'admin_id'=>!empty(session('administrator')->admin_id)?session('administrator')->admin_id:0,
            'created_at'=>time(),
            ];

            $insert_id=DB::table($this->table)->insertGetId($data);
            if(!$insert_id) return false;
        }
        return true;

    }


    /**
     * 递归遍历BOM树查找工序
     * @param $bom_tree          object|array  BOM树
     * @param $operations        array  工序保存数组
     * @param $qty            int    生产单数量
     * @param $j                 int    递归开始序号,建议使用订单号代替
     * @param $level                  int         层级数
     * @author  sam.shan  <sam.shan@ruis-ims.cn>
     * @todo    由于损耗率压根不准,所以暂时都未考虑损耗率,替代物料也暂时未考虑进去(后来者做吧)
     */
    public function RQOperation($bom_tree,&$operations,$qty,$j=NULL,$level=1)
    {

         //递归new不影响的,因为laravel底层是单例模式
         $m=new Material();
        //母件部分判断
        if(!empty($bom_tree['operation_id'])){
            if(empty($j))  $j=get_order_sn('WT');
            //需要母件的个数
            $usage_number=$bom_tree['usage_number'];
            $mother_qty=round(eval("return $usage_number;")*$qty,3);
            $operations[$j]=[
                'operation_id'=>$bom_tree['operation_id'],
                'operation_name'=>$bom_tree['operation_name'],
                'operation_ability'=>$bom_tree['operation_ability'],
                'operation_ability_pluck'=>$bom_tree['operation_ability_pluck'],
                'dependency_operations'=>'',//依赖工序
                'level'=>$level,
                'out_material_id'=>$bom_tree['material_id'],
                'out_material_name'=>$bom_tree['name'],
                'out_material'=>[[
                    'material_category_id'=>$bom_tree['material_category_id'],
                    'material_category_name'=>$bom_tree['material_category_name'],
                    'material_id'=>$bom_tree['material_id'],
                    'item_no'=>$bom_tree['item_no'],
                    'material_attributes' => $m->getAttributeByMaterial($bom_tree['material_id']),
                    'operation_attributes' => $m->getOperationAttributeValue($bom_tree['material_id']),
                    'drawings'=>$m->getMaterialDrawings($bom_tree['material_id']),
                    'name'=>$bom_tree['name'],
                    'unit_id'=>$bom_tree['unit_id'],
                    'unit'=>$bom_tree['unit'],
                    'commercial'=>$bom_tree['commercial'],
                    'usage_number'=>$bom_tree['usage_number'],
                    'loss_rate'=>isset($bom_tree['loss_rate'])?$bom_tree['loss_rate']:0,
                    'qty'=>$mother_qty,//这个数量暂时先不结合损耗率进行计算了,因为压根不准确,不同工序的不同能力的损耗是不同的
                ]]
            ];
            //bom树必然有儿子
            $children=$bom_tree['children'];
            for($i=0;$i<count($children);$i++){
                $operations[$j]['in_material_ids'][]=$children[$i]['material_id'];
                $operations[$j]['in_material'][]=[
                    'material_category_id'=>$children[$i]['material_category_id'],
                    'material_category_name'=>$children[$i]['material_category_name'],
                    'material_id'=>$children[$i]['material_id'],
                    'item_no'=>$children[$i]['item_no'],
                    'material_attributes' => $m->getAttributeByMaterial($children[$i]['material_id']),
                    'operation_attributes' => $m->getOperationAttributeValue($children[$i]['material_id']),
                    'drawings'=>$m->getMaterialDrawings($children[$i]['material_id']),
                    'name'=>$children[$i]['name'],
                    'unit_id'=>$children[$i]['unit_id'],
                    'unit'=>$children[$i]['unit'],
                    'commercial'=>$children[$i]['commercial'],
                    'usage_number'=>$children[$i]['usage_number'],
                    'loss_rate'=>isset($children[$i]['loss_rate'])?$children[$i]['loss_rate']:0,
                    'is_assembly'=>$children[$i]['is_assembly'],
                    'qty'=>$mother_qty*$children[$i]['usage_number'],
                ];
                //依赖工序
                if(!empty($children[$i]['operation_id'])){
                    //因有些环境php版本为7.1以上，解决php7.1数组格式问题，先定义为数组即可
                    $operations[$j]['dependency_operations']=array();
                    $operations[$j]['dependency_operations'][]=$children[$i]['operation_id'];
                }
            }

            //遍历一下半成品,注意不是所有的半成品都要拆单的
            foreach ($children  as $key => $value){
                if($value['is_assembly'] && !empty($value['operation_id'])) $this->RQOperation($value,$operations,$mother_qty,get_order_sn('WT'),$level+1);
            }




        }

    }

    /**
     * 获取某个工艺单的儿子们,排产中工序依赖用到
     * @param $operation_order_id int 工艺单主键
     * @return array
     * @author sam.shan <sam.shan@ruis-ims.cn>
     */
    public  function getOperationOrderSons($operation_order_id)
    {
        //获取当前工艺单的情况
        $operation_order=$this->getRecordById($operation_order_id,['in_material_ids','production_order_id','level']);
        //获取儿子们的情况
        $son_obj=DB::table($this->table)
                           ->where('production_order_id',$operation_order->production_order_id)
                           ->where('level',$operation_order->level+1)
                           ->whereIn('out_material_id',explode(',',$operation_order->in_material_ids))
                           ->pluck('out_material','id');
        $son_arr=obj2array($son_obj);

        foreach($son_arr as $key=>&$value){
            $value=json_decode($value,true);
            $value=isset($value['0'])?$value['0']:[];
            unset($value['qty']);
        }

        return $son_arr;
    }

//endregion
//region  增









//endregion
//region  修



//endregion
//region  查

    public function getOperationOrderList(&$input)
    {
        $where[] = ['a1.status','=','0'];
        !empty($input['production_order_id']) &&  $where[]=['a1.production_order_id','=',$input['production_order_id']];
        //!empty($input['status']) &&  $where[]=['a1.status','=',$input['status']];
        //!empty($input['admin_name']) &&  $where[]=['a3.name','like','%'.$input['admin_name'].'%'];
        $builder = DB::table($this->table.' as a1')
            ->select('a1.id as work_task_id',
                'a1.number as wt_number',
                'a1.qty',
                'a2.number as po_number',
                'a1.operation_name',
                'a1.name',
                'a4.item_no',
                'a1.status'
                )
            ->leftJoin(config('alias.rpo').' as a2','a2.id','=','a1.production_order_id')
            //->leftJoin(config('alias.roo').' as a3','a3.id','=','a1.operation_id')
            ->leftJoin(config('alias.rm').' as a4','a4.id','=','a2.product_id')
            ->offset(($input['page_no']-1)*$input['page_size'])
            ->limit($input['page_size']);

        if (!empty($where)) $builder->where($where);
        //order  (多order的情形,需要多次调用orderBy方法即可)
        if (!empty($input['order']) && !empty($input['sort'])) $builder->orderBy( 'a1.'.$input['sort'], $input['order']);
        //get获取接口
        $obj_list = $builder->get();

        //总共有多少条记录
        $count_builder= DB::table($this->table.' as a1');
        if (!empty($where)) $count_builder
            ->leftJoin(config('alias.rpo').' as a2','a2.id','=','a1.production_order_id')
            //->leftJoin(config('alias.roo').' as a3','a3.id','=','a1.operation_id')
            ->leftJoin(config('alias.rm').' as a4','a4.id','=','a2.product_id')
            ->where($where);
        $input['total_records']=$count_builder->count();
        return $obj_list;
    }

    public function get($id)
    {
        $obj = DB::table($this->table.' as a1')
            ->select('a1.id as product_order_id',
                'a1.number as wt_number',
                'a1.qty',
                'a1.name as material_name',
                'a2.number as po_number',
                'a1.operation_name',
                'a4.item_no',
                'a2.product_id as material_id'
            )
            ->leftJoin(config('alias.rpo').' as a2','a2.id','=','a1.production_order_id')
            ->leftJoin(config('alias.rm').' as a4','a4.id','=','a2.product_id')
            ->where('a1.id','=',$id)
            ->first();
        if (!$obj) TEA('404');
        return $obj;
    }


//endregion

}