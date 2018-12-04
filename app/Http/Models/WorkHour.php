<?php
namespace App\Http\Models;//定义命名空间
use Illuminate\Support\Facades\DB;//引入DB操作类

/**
 * 工序工时模型
 * Class WorkHour
 * @package App\Http\Models
 * @auth leo.yan
 */
class WorkHour extends Base
{
    protected $table;
    protected $rmTable;
    protected $rioTable;
    protected $riomcTable;
    protected $riorTable;
    protected $time;
    protected $datetime;

    public function __construct()
    {
        $this->table = config('alias.rimw');
        $this->rmTable = config('alias.rm');
        $this->rioTable = config('alias.rio');
        $this->riomcTable = config('alias.riomc');
        $this->rioaTable = config('alias.rioa');
        $this->riwTable = config('alias.riw');
        $this->uuTable = config('alias.uu');
        $this->otable=config('alias.rio');
        $this->ria=config('alias.ria');
        $this->bomTable=config('alias.rb');
        $this->rbrTable=config('alias.rbr');
        $this->rpfTable=config('alias.rpf');        
        $this->routingBaseTable=config('alias.rbrb');        
        // $this->lzpTable=config('alias.rbrl');
        $this->operationMaterialTable=config('alias.riomc');
        $this->materialCategoryTable=config('alias.rmc');
        $this->itemtable='ruis_flow_ability_item';

        $this->time = time();
        $this->datetime = date('Y-m-d H:i:s',$this->time);

        //定义表别名
        $this->aliasTable=[
            'material_workhours'=>$this->table.' as material_workhours',
            'material'=>$this->rmTable.' as material',
            'operation'=>$this->rioTable.' as operation',
            'operation_material_category'=>$this->riomcTable.' as operation_material_category',
            'ability'=>$this->rioaTable.' as ability',
            'ieability'=>$this->ria.' as ieability',
            'workhours'=>$this->riwTable.' as workhours',
            'unit'=>$this->uuTable.' as unit',
            'operation'=>$this->otable.' as operation',
            'flowitem'=>$this->itemtable.' as flowitem',
            'nextability'=>$this->ria.' as nextability',
            // 'lzpmaterial'=>$this->lzpTable.' as lzpmaterial',
            'materialcategory'=>$this->materialCategoryTable.' as materialcategory',
            'materialoperation'=>$this->operationMaterialTable.' as materialoperation',
            'nextoperation'=>$this->otable.' as nextoperation'
        ];

        if(empty($this->flowitem)) $this->flowitem =new FlowAbilityItems();
        if(empty($this->standardmaterialitem)) $this->standardmaterialitem =new SapStandardMaterialWorkHoursItem();
    }


    // 通过工序获取物料、流转品
    public function  showMaterialsByProcess($input)
    {
        //判断是否有item_no
        $item_no  =  isset($input['item_no'])?$input['item_no']:'';

        $data = [
                'material.id  as   material_id',
                'material.name  as   material_name',
                'material.material_category_id  as   material_category_id',
                'material.item_no  as   material_item_no',
                'materialcategory.id  as   materialcategory_id',
                'materialcategory.name  as   materialcategory_name',
        ];

        if (!empty( $item_no)) 
        {
            $final =obj2array(DB::table($this->aliasTable['material'])->select($data)->where('item_no',$item_no)->leftJoin($this->aliasTable['materialcategory'], 'materialcategory.id', '=', 'material.material_category_id')->get()); 
        } 
        else
        {
            $operation_id  =  $input['operation'];
            if (empty($operation_id))  TEA('9003');
            $isset  =  $input['isset'];
          
            // 根绝工序获得物料分类
             $where[] = ['operation_id', '=', $operation_id];
             $catresult = DB::table($this->operationMaterialTable)->select('material_category_id')->where($where)->get(); 
             //一个容器  物料类
             $material_categorys = []; 

             //定义一个容器 物料列表
             $materials   =  [];
             $final = [];
             foreach ($catresult as $value) 
             {
              $material_categorys[] = $value->material_category_id;
             }  
           
            $data = [
                'material.id  as   material_id',
                'material.name  as   material_name',
                'material.material_category_id  as   material_category_id',
                'material.item_no  as   material_item_no',
                'materialcategory.id  as   materialcategory_id',
                'materialcategory.name  as   materialcategory_name',
             ];

             foreach (array_unique($material_categorys) as  $category)
             {
                $result =obj2array(DB::table($this->aliasTable['material'])->select($data)->where('material_category_id',$category)->leftJoin($this->aliasTable['materialcategory'], 'materialcategory.id', '=', 'material.material_category_id')->get()); 
                if (count($result)>0) 
                {
                  $materials []  = $result;
                  $final =  array_merge($final,$result);
                } 
                
             }

             //查找bom_id
             foreach ($final as $key => $value) 
             {
                 $bomwhere  =[
                      ['material_id', '=', $value['material_id']],
                      ['is_version_on', '=',1]
                    ];
                $has = DB::table($this->bomTable)->select('id')->where($bomwhere)->first(); 
                $final[$key]['bom_id']=$has?$has->id:'';
             }


             if ($isset == 1)
             {
                foreach ($final as  $K => $v) 
                {
                    //判断是否存在 ie_material_workhour 表里面
                    $signwhere  =[
                      ['material_no', '=', $v['material_item_no']],
                      ['operation_id', '=',$operation_id]
                    ];
                    $sign = DB::table($this->table)->select('id','work_hours')->where($signwhere)->get(); 
                    //  假如存在 在ie_material_workhours 表里面
                    if (count($sign) > 0) 
                    {
                        $ssum  = 0;
                        //如果表里面存在该数据  则需要判断是否工时work_hours 是否全是0 
                        foreach ($sign as $va) 
                        {
                            $ssum += $va->work_hours;
                        }
                        if ($ssum > 0) 
                        {
                           unset($final[$K]);
                        } 
                    } 
                }
             }
             elseif($isset == 2)
             {
                foreach ($final as  $Kk => $vv) 
                {
                    //判断是否存在 ie_material_workhour 表里面
                    $ssignwhere  =[
                      ['material_no', '=', $vv['material_item_no']],
                      ['operation_id', '=',$operation_id]
                    ];
                    $ssign = DB::table($this->table)->select('id','work_hours')->where($ssignwhere)->get(); 
                  
                    $sum  = 0;
                    if(count($ssign)< 1) 
                    {
                       unset($final[$Kk]);
                    } 
                    else
                    {
                        //如果表里面存在该数据  则需要判断是否工时work_hours 是否全是0 
                        foreach ($ssign as $val) 
                        {
                            $sum += $val->work_hours;
                        }

                        if ($sum ==0) 
                        {
                           unset($final[$Kk]);
                        } 
                        
                    }
                }
             }
        }
        return  array_values($final);
    }

    //  storOperationSetting
    //  工序维护的同时插入工时设置的操作
    public   function storOperationSetting($input,$id)
    {
        //先 保存工序级别  获得 parent_id
        $operation_data['operation_id']  = $id;
        //添加
        $operation_id=DB::table($this->riwTable)->insertGetId($operation_data);
        if(!$operation_id) TEA('802');

        //2 以operation_id  为partent_id 
        $parent_id  = $operation_id;
        $ability_id = explode(',', $input['ability_id']);

        $data =  [];
        $data['parent_id'] =  $parent_id;
        foreach ($ability_id as  $value) 
        {
            $data['ability_id'] = $value;
            $data['operation_id'] = $id;
            $instor_id=DB::table($this->riwTable)->insertGetId($data);
            if(!$instor_id) TEA('802');
        }
        return  TRUE;
    }

    //  fitSetting
    //  同步操作
    //  MingLi
    public  function   fitSetting()
    {

        //1 获取工序列表里面所有的 工序
        $operationids = DB::table($this->rioTable)->select('id')->get(); 

        try {
        //开启事务
        DB::connection()->beginTransaction();

        // 2遍历工序  与当前对比
        foreach ($operationids as  $opid) {
            $has = DB::table($this->riwTable)->select('id')->where('operation_id',$opid->id)->get(); 

            // 3判断  有则跳过  无则获取能力id 并插入
            if (count($has)>0)
            {
                continue;
            } 
            else
            {

                $abilitys  =  DB::table($this->rioaTable)->select('ability_id')->where('operation_id',$opid->id)->get(); 
                // 有能力就遍历添加   没有能力就跳过继续
                if (count($abilitys) >0 ) 
                {
                    //添加工序父级
                    $operation_data['operation_id']  = $opid->id;
                    
                    $operation_id=DB::table($this->riwTable)->insertGetId($operation_data);
                    if(!$operation_id) TEA('802');

                    $data =  [];
                    foreach ($abilitys as $ability) 
                    {
                        $data['parent_id'] =  $operation_id;
                        $data['ability_id'] = $ability->ability_id;
                        $data['operation_id'] = $opid->id;

                        if($opid->id  == 10){
                        }
                        $instor_id=DB::table($this->riwTable)->insertGetId($data);
                        if(!$instor_id) TEA('802');
                    }   

                } 
                else 
                {
                  continue;
                }
                
            }
        }

       }catch(\ApiException $e){
                //回滚
                DB::connection()->rollBack();
                TEA($e->getCode());
       }
       //提交事务
       DB::connection()->commit();

       return TRUE;
    }

    // delOperationSetting
    // 删除工时设置
    public  function  delOperationSetting($id)
    {
        $result = DB::table($this->riwTable)->select('id','rated_value','preparation_hour','ability_value')->where('operation_id',$id)->first(); 
        if (!$result ) 
        {
           return  TRUE;
        }

        $parent_id  =  $result->id;
        //  先删除子类 再删除自己
        $child_ids  = DB::table($this->riwTable)->select('id')->where('parent_id',$parent_id)->get(); 
        foreach ($child_ids as $key => $value)
        {
          $child_id   = $value->id;
          $child_res  = DB::table($this->riwTable)->select('id','rated_value','preparation_hour','ability_value')->where('id',$child_id)->first();
          if ($child_res) 
          {
              // 删除之前 先删除 对应的 流转设置
              DB::table('ruis_flow_ability_item')->where('setting_id',$child_res->id)->delete();
              $delc_id = DB::table($this->riwTable)->where('id','=',$child_id)->delete();
          }
        }
        // 删除之前 先删除 对应的 流转设置
        DB::table('ruis_flow_ability_item')->where('setting_id',$result->id)->delete();
        $delp_id = DB::table($this->riwTable)->where('id','=',$result->id)->delete();
    }


    // updateOperationSetting
    // 修改工时设置
    public  function  updateOperationSetting($input)
    {
        $operation_id   = $input['operation_id'];
        $old_abilitys   = [];
        $new_abilitys   = explode(',', $input['ability_id']);
        $workhour   = DB::table($this->riwTable)->select('id')->where('operation_id',$operation_id)->first();
        try{
            //开启事务
            DB::connection()->beginTransaction();

              if (!empty($workhour)) 
              {

                    $result   = DB::table($this->riwTable)->select('ability_id')->where('parent_id',$workhour->id)->get(); 
                    foreach ($result as $key => $value) 
                    {
                        $old_abilitys[]  = $value->ability_id;
                    }
                    // 需要删除的id
                    $del_ids = array_diff($old_abilitys, empty($new_abilitys) ? array() : $new_abilitys);
                    if ($del_ids)
                    {
                        foreach ($del_ids as  $delid)
                        {
                            $where  =[['ability_id',$delid], ['parent_id',$workhour->id]];
                            //判断是否已经维护过
                             $child_res= DB::table($this->riwTable)->select('id','flow_value','preparation_hour','ability_value')->where($where)->first();
                             if ($child_res) 
                             {
                                 // 删除之前 先删除 对应的 流转设置
                                 DB::table('ruis_flow_ability_item')->where('setting_id',$child_res->id)->delete();
                                 DB::table($this->riwTable)->where($where)->delete();
                             }
                          
                        }
                    }

                    //需要新增的id
                    $add_ids = array_diff($new_abilitys, empty($old_abilitys) ? array() : $old_abilitys);
                    if ($add_ids)
                    {
                         foreach ($add_ids as $addid) 
                         {
                               $adddata =  [];  
                               $adddata['parent_id'] = $workhour->id ;  
                               $adddata['ability_id'] =  $addid; 
                               $adddata['operation_id'] =  $operation_id; 
                               $instor_id=DB::table($this->riwTable)->insertGetId($adddata);
                               if(!$instor_id) TEA('802'); 
                         }
                    }
             } 
             else
             {
                    //先 保存工序级别  获得 parent_id
                    $operation_data['operation_id']  = $operation_id ;
                    //添加
                    $operation_ins_id=DB::table($this->riwTable)->insertGetId($operation_data);
                    if(!$operation_ins_id) TEA('802');

                    //2 以operation_id  为partent_id 
                    $parent_id  = $operation_ins_id;
                    $ability_id = explode(',', $input['ability_id']);

                    $data =  [];
                    $data['parent_id'] =  $parent_id;
                    foreach ($ability_id as  $value) 
                    {
                        $data['ability_id'] = $value;
                        $data['operation_id'] =  $operation_id; 
                        $instor_id=DB::table($this->riwTable)->insertGetId($data);
                        if(!$instor_id) TEA('802');
                    }
            }
       }catch(\ApiException $e){
        //回滚
        DB::connection()->rollBack();
        TEA($e->getCode());
       }
        //提交事务
        DB::connection()->commit();          
    }



    //标准工时设置修改
     public function updateSetting($input)
    {

        //获取编辑数组
        $data=[
            'quantity_interval'=>$input['quantity_interval'],
            'multiple'=>$input['multiple'],
            'preparation_hour'=>$input['preparation_hour'],
            'ability_value'=>$input['ability_value'],
            'rated_value'=>$input['rated_value'],
            'type'=>$input['type'],
            'remark'=>$input['remark'],
            'is_ladder'=>$input['is_ladder']
        ];

        try{
            //开启事务
            DB::connection()->beginTransaction();
            $upd=DB::table($this->riwTable)->where('id',$input['id'])->update($data);
            if($upd===false) TEA('804');

            //流转明细保存
            $this->flowitem->saveItem($input);

        }catch(\ApiException $e){
            //回滚
            DB::connection()->rollBack();
            TEA($e->getCode());
        }

        //提交事务
        DB::connection()->commit();

        return $input['id'];
    }

    // 设置基准工时
    public  function  setting_sign($input)
    {

            // 设置为 基准工时
            $data=[
                'is_sign'=>1,
                'sign_id'=>0,
                'ability_value'=>1,
            ];

            try{
            //开启事务
            DB::connection()->beginTransaction();


            //1 修改为基准能力
            $upd=DB::table($this->riwTable)->where('id',$input['id'])->update($data);
            if($upd===false) TEA('804');

            //2 设置其他 同兄弟 的 sign_id   为本id
            $temp=DB::table($this->riwTable)->where('id',$input['id'])->first();
            $parent_id =  $temp->parent_id;
            if ($parent_id == 0)  TEA('804');
            
            $borthers  =  DB::table($this->riwTable)->select('id')->where('parent_id',$parent_id)->get();
            foreach ($borthers as $key => $value)
            {
                    
                if ($value->id != $input['id']) 
                {
                   $updata=[
                    'sign_id' => $input['id'],
                    'is_sign' => 0,
                    'ability_value' => 0
                   ];
                   $res=DB::table($this->riwTable)->where('id',$value->id)->update($updata);
                }
            }
      
        }catch(\ApiException $e){
            //回滚
            DB::connection()->rollBack();
            TEA($e->getCode());
        }

        //提交事务
        DB::connection()->commit();



           return $input['id'];
    }

    // 取消基准工时
    public  function  cancel_sign($input)
    {

            // 设置为 基准工时
            $data=[
                'is_sign'=>0,
                'sign_id'=>0,
                'ability_value'=>0,
            ];

            try{
            //开启事务
            DB::connection()->beginTransaction();


            //1 修改为基准能力
            $upd=DB::table($this->riwTable)->where('id',$input['id'])->update($data);
            if($upd===false) TEA('804');

            //2 设置其他 同兄弟 的 sign_id   为本id
            $temp=DB::table($this->riwTable)->where('id',$input['id'])->first();
            $parent_id =  $temp->parent_id;
            if ($parent_id == 0)  TEA('804');
            
            $borthers  =  DB::table($this->riwTable)->select('id')->where('parent_id',$parent_id)->get();
            foreach ($borthers as $key => $value)
            {
                    
                if ($value->id != $input['id']) 
                {
                   $updata=[
                    'sign_id' => 0,
                    'is_sign' => 0,
                    'ability_value' => 0
                   ];
                   $res=DB::table($this->riwTable)->where('id',$value->id)->update($updata);
                }
            }
      
        }catch(\ApiException $e){
            //回滚
            DB::connection()->rollBack();
            TEA($e->getCode());
        }

        //提交事务
        DB::connection()->commit();



           return $input['id'];
    }


    //标准工时设置列表
    public function Setting_list($input)
    {
        //数量区间 1=工时溢出  2=工时负溢出  3=正常情况 4=不按区间维护
        // $interval = array(array("0","工时溢出"),array("1","工时负溢出"),array("2","正常情况"),array("3","不按区间维护")); 
        $interval = array(array("0"," "),array("1","工时溢出"),array("2","工时负溢出"),array("3","正常情况"),array("4","不按区间维护")); 
        //倍数设置 1=按倍数 2=固定值
        // $multiple= array(array("0","按倍数"),array("1","固定值"));
        $multiple= array(array("0"," "),array("1","按倍数"),array("2","固定值"));

        //类型
        $type= array(array("0"," "),array("1","同步"),array("2","异步"));

        $where = $this->_search($input);


        $builder = DB::table($this->aliasTable['workhours'])
            ->select(
                "workhours.*",
                'operation.name as operation_name',
                'operation.code as operation_code',
                'nextoperation.name as nextoperation_name',
                'nextoperation.code as nextoperation_code',
                'ieability.id as ability_id',
                'ieability.name as   ability_name',
                'ieability.code as   ability_code'
                )
            ->where($where)
            ->leftJoin($this->aliasTable['operation'],'operation.id','=','workhours.operation_id')
            ->leftJoin($this->aliasTable['nextoperation'],'nextoperation.id','=','workhours.next_operation')
            ->leftJoin($this->aliasTable['ieability'],'ieability.id','=','workhours.ability_id');
        //get获取接口
        $obj_list = $builder->get();

        foreach ($obj_list as $key => $value) 
        {
            $value->flow_value=nf($value->flow_value,2);
            $value->ability_value=nf($value->ability_value,2);
            $value->rated_value=nf($value->rated_value,2);
            $value->preparation_hour=nf($value->preparation_hour,2);

            $value->quantity_interval=$interval[$value->quantity_interval][1];
            $value->multiple=$multiple[$value->multiple][1];
            $value->type=$type[$value->type][1];

            $group_list = $this->getItemsByOrder($value->id);
            $value->groups = $group_list;
        }

        return $obj_list;
    }
 
     /**
     * 查看标准工时
     * @param $input
     * @return mixed
     */
    public function setting_show($input)
    {
         if(empty($input['id'])) TEA('700','id');

        //检测标准工时记录是否存在
        $has = $this->getRecordById($input['id'],'*',$this->riwTable);
        if(!$has)
        {
            TEA('2205','id');
        }
    
        $builder = DB::table($this->aliasTable['workhours'])
            ->select(
                "workhours.*",
                'operation.name as operation_name',
                'operation.code as operation_code',
                'nextoperation.name as nextoperation_name',
                'nextoperation.code as nextoperation_code',
                'ieability.id as ability_id',
                'ieability.name as   ability_name',
                'ieability.code as   ability_code'
                )
            ->leftJoin($this->aliasTable['operation'],'operation.id','=','workhours.operation_id')
            ->leftJoin($this->aliasTable['nextoperation'],'nextoperation.id','=','workhours.next_operation')
            ->leftJoin($this->aliasTable['ieability'],'ieability.id','=','workhours.ability_id')
            ->where('workhours.id','=',$input['id']);
        //get获取接口
        $obj_list = $builder->get();
        foreach ($obj_list as  $obj) 
        {
             $group_list = $this->getItemsByOrder($obj->id);
             $obj->groups = $group_list;
        }

        return $obj_list;
    }

     /**
     * 获取明细数据
     * @param $id
     * @return mixed
     * @author liming
     */
    public function getItemsByOrder($id)
    {
        //获取列表
        $obj_list = DB::table($this->aliasTable['flowitem'])
            ->select(
             'flowitem.id',
             'flowitem.flow_value        as flow_value', 
             'nextability.id   as nextability_id',
             'nextability.name as nextability_name',
             'nextability.code as nextability_code',
             'nextoperation.id   as nextoperation_id',
             'nextoperation.name as nextoperation_name',
             'nextoperation.code as nextoperation_code'
             )
            ->leftJoin($this->aliasTable['nextoperation'],'nextoperation.id','=','flowitem.next_operation')
            ->leftJoin($this->aliasTable['nextability'],'nextability.id','=','flowitem.next_ability')
            ->where('flowitem.setting_id', $id)
            ->orderBy('flowitem.id', 'asc')->get();
            return $obj_list;
    }

     /**
     * 工时设置  制空
     * @param $input
     * @return mixed
     */
    public function setting_empty($input)
    {
        $res = $this->getRecordById($input['id'],'*',$this->riwTable);

        //获取编辑数组
        $data=[
            'parent_id'=>$res->parent_id,
            'operation_id'=>$res->operation_id,
            'ability_id'=>isset($res->ability_id)?$res->ability_id:"",
            'quantity_interval'=>"",
            'multiple'=>"",
            'preparation_hour'=>"",
            'rated_value'=>"",
            'ability_value'=>"",
            'next_operation'=>"",
            'flow_value'=>"",
            'type'=>"",
            'remark'=>""
        ];
        try{
            //开启事务
            DB::connection()->beginTransaction();

            //删除流转品
            $res = DB::table($this->itemtable)->where('setting_id','=',$input['id'])->delete();

            $upd=DB::table($this->riwTable)->where('id',$input['id'])->update($data);

            if($upd===false) TEA('804');
        }catch(\ApiException $e){
            //回滚
            DB::connection()->rollBack();
            TEA($e->getCode());
        }
        //提交事务
        DB::connection()->commit();
    }

//============================上部分为工时设置========================================下部分是工时列表============================================
    /**
     * 根据物料编码获取工序工时
     * @param $input
     * @return array
     */
    public function getWorkHoursByMaterialNo($input)
    {
       if(empty($input['material_no'])) TEA('700','material_no');

        $material = DB::table($this->rmTable)->where('item_no',$input['material_no'])->first();
        if(empty($material))
        {
            TEA('114',$input['material_no']);
        }

        $operation_material_category = DB::table($this->aliasTable['operation_material_category'])
                    ->select('operation_material_category.*','operation.name as operation_name')
                    ->leftJoin($this->aliasTable['operation'],'operation.id','=','operation_material_category.operation_id')
                    ->where('material_category_id',$material->material_category_id)
                    ->get();
        $results = [];
        if(count($operation_material_category) > 0)
        {
            //判断是否已经维护
            $count = DB::table($this->table)->where('material_no',$input['material_no'])->count();
            // $results = [];
            foreach ($operation_material_category as $v)
            {
                //获取工序对应的能力
                $abilitys = DB::table($this->rioaTable)->where('operation_id',$v->operation_id)->where('status',1)->get(); 
                //获取识别是否按区间维护
                $interval = DB::table($this->riwTable)->where('operation_id',$v->operation_id)->first();

                if (!$interval) 
                {
                    TEA('9005'); 
                }
                

                foreach ($abilitys as $ability)
                {
                      $workhours = DB::table($this->table)
                        ->where('material_no',$input['material_no'])
                        ->where('operation_id',$v->operation_id)
                        ->where('ability_id',$ability->id)
                        ->get();
                      $data = ['operation_id'=>$v->operation_id,'operation_name'=>$v->operation_name,'work_hours'=>'','flag'=>0,'ability_id'=>$ability->id,'ability_name'=>$ability->ability_name];

                      if($interval->quantity_interval==4)
                      {
                          if (count($workhours) > 0)
                          {
                            foreach ($workhours as  $workhour)
                            {
                                 $data['workhours_id'] = $workhour->id;
                                 $data['work_hours'] = $workhour->work_hours;
                                 $data['sample_hours'] = $workhour->sample_hours;
                                 $data['flag'] = 1;
                                 $results[] = $data;
                            }
                          }else{
                              $results[] = $data;
                          }
                      }elseif ($interval->quantity_interval<>4 && $interval->quantity_interval > 0)
                      {

                          if (count($workhours) > 0)
                            {
                                foreach ($workhours as  $workhour)
                                {
                                    $data['workhours_id'] = $workhour->id;
                                    $data['min_value'] = $workhour->min_value;
                                    $data['max_value'] = $workhour->max_value;
                                    $data['work_hours'] = $workhour->work_hours;
                                    $data['sample_hours'] = $workhour->sample_hours;
                                    $data['flag'] = 1;
                                    $results[] = $data;
                                }
                            }
                            else
                            {
                                    $data['min_value'] = '';
                                    $data['max_value'] = '';
                                    $results[] = $data;
                            }
                      }

                }
            }

        }
        return $results;
    }

    
    /**
     * 根据bom_id 获取 所有的工时
     * @param $input
     * @return array
     */
    public   function  getAllHoursByBom($bom_id,$routing_id)
    {
        if(empty($bom_id)) TEA('9013','bom_id');
        $bom_id  =   $bom_id;
        $results = [];

        if (is_numeric($routing_id) && $routing_id>0) 
        {
                    $routing_id  =   $routing_id;
                    //获取  ie_material_workhours   所有时间
                    $where  = [
                        'hourlist.bom_id'=> $bom_id,
                        'hourlist.routing_id'=> $routing_id,
                    ];

                    $mathours=DB::table($this->table.' as  hourlist')
                              ->leftJoin($this->rmTable.' as material','hourlist.material_id','=','material.id')
                              ->leftJoin($this->rioTable.' as operation','hourlist.operation_id','=','operation.id')
                              ->leftJoin($this->rioaTable.' as opability','hourlist.ability_id','=','opability.id')
                              ->leftJoin($this->ria.' as ability','opability.ability_id','=','ability.id')
                              ->leftJoin($this->routingBaseTable.' as routingbase','hourlist.step_info_id','=','routingbase.id')
                              ->leftJoin($this->rpfTable.' as practice','routingbase.step_id','=','practice.id')
                              ->select(
                                'hourlist.*',
                                'material.name  as   material_name',
                                'operation.name  as   operation_name',
                                'ability.code  as   ability_code',
                                'operation.code  as   operation_code',
                                'material.item_no  as   item_no',
                                'practice.name  as   practice_name',
                                'practice.code  as   practice_code',
                                'ability.name  as   ability_name')
                              ->where($where)->orderBy('step_info_id')->get();

                    if (count( $mathours) > 0) 
                    {
                        foreach ($mathours as  $mathour) 
                        {

                          $arrmathour = obj2array($mathour);
                          $ie_operation_ability =  $arrmathour['ability_id'];
                          $operation_results=DB::table($this->rioaTable)->where('id',$ie_operation_ability)->first();
                          if ($operation_results) 
                          {
                              $real_ability  = $operation_results->ability_id;
                              $where = [];
                              $where[] = ['setting.operation_id', '=',  $arrmathour['operation_id']];
                              $where[] = ['setting.ability_id', '=',  $real_ability];

                              $setting=DB::table($this->riwTable.' as setting')
                                       ->leftJoin($this->ria.' as ability','setting.ability_id','=','ability.id')
                                       ->leftJoin($this->rioTable.' as operation','setting.operation_id','=','operation.id')
                                       ->select('setting.*','ability.name as ability_name','ability.code as ability_code','operation.name  as  operation_name','operation.code  as  operation_code')
                                       ->where($where)->first();

                              if (count($setting) > 0) 
                              {
                                 $results['step'][$mathour->step_info_id]['setting']['operation'][$arrmathour['operation_id']]['ability'][$mathour->ability_id]['value'] = obj2array($setting);

                                 $liuzhuan=DB::table($this->itemtable.' as item')
                                         ->leftJoin($this->ria.' as ability','item.next_ability','=','ability.id')
                                         ->leftJoin($this->rioTable.' as operation','item.next_operation','=','operation.id')
                                         ->select('item.*','ability.name  as   ability_name','operation.name  as   operation_name','ability.code as   ability_code','operation.code  as   ability_code')
                                         ->where('item.setting_id',$setting->id)->get();

                                 if (count($liuzhuan) > 0) 
                                 {
                                        
                                        foreach ($liuzhuan as $kk => $vv)
                                         {
                                           $results['step'][$mathour->step_info_id]['setting']['operation'][$arrmathour['operation_id']]['ability'][$mathour->ability_id]['liuzhuan']['next_operation'][$vv->next_operation]['next_ability'][$vv->next_ability]= obj2array($vv);
                                         }
                                 }
                                 else 
                                 {
                                     $results['step'][$mathour->step_info_id]['setting']['operation'][$arrmathour['operation_id']]['ability'][$mathour->ability_id]['liuzhuan'] = [];
                                 }

                              }
                              else
                              {
                                 $results['step'][$mathour->step_info_id]['setting']=[];
                              } 
                              $results['step'][$mathour->step_info_id]['workhourlist']['operation'][$arrmathour['operation_id']]['ability'][$mathour->ability_id][$arrmathour['id']] = $arrmathour;


                          }
                        }
                    }

        } 
        else 
        {
            // 通过 bom  找工艺路线
            $routingids=DB::table($this->rbrTable)->where('bom_id',$bom_id)->get();
            if (count($routingids)>0) 
            {
                foreach ($routingids as  $routing) 
                {
                    $routing_id  =   $routing->routing_id;
                     //获取  ie_material_workhours   所有时间
                    $where  = [
                        'hourlist.bom_id'=> $bom_id,
                        'hourlist.routing_id'=> $routing_id,
                    ];
                    $mathours=DB::table($this->table.' as  hourlist')
                              ->leftJoin($this->rmTable.' as material','hourlist.material_id','=','material.id')
                              ->leftJoin($this->rioTable.' as operation','hourlist.operation_id','=','operation.id')
                              ->leftJoin($this->rioaTable.' as opability','hourlist.ability_id','=','opability.id')
                              ->leftJoin($this->ria.' as ability','opability.ability_id','=','ability.id')
                              ->leftJoin($this->routingBaseTable.' as routingbase','hourlist.step_info_id','=','routingbase.id')
                              ->leftJoin($this->rpfTable.' as practice','routingbase.step_id','=','practice.id')
                              ->select(
                                'hourlist.*',
                                'material.name  as   material_name',
                                'operation.name  as   operation_name',
                                'operation.code  as   operation_code',
                                'ability.code    as   ability_code',
                                'material.item_no  as   item_no',
                                'practice.name  as   practice_name',
                                'practice.code  as   practice_code',
                                'ability.name  as   ability_name')
                              ->where($where)->orderBy('step_info_id')->get();
                    $results = [];
                    if (count( $mathours) > 0) 
                    {
                        foreach ($mathours as  $mathour) 
                        {
                          $arrmathour = obj2array($mathour);
                          $ie_operation_ability =  $arrmathour['ability_id'];
                          $operation_results=DB::table($this->rioaTable)->where('id',$ie_operation_ability)->first();

                          if($operation_results)
                          {
                            $real_ability  = $operation_results->ability_id;
                            $where = [];
                            $where[] = ['setting.operation_id', '=',  $arrmathour['operation_id']];
                            $where[] = ['setting.ability_id', '=',  $real_ability];

                            $setting=DB::table($this->riwTable.' as setting')
                                       ->leftJoin($this->ria.' as ability','setting.ability_id','=','ability.id')
                                       ->leftJoin($this->rioTable.' as operation','setting.operation_id','=','operation.id')
                                       ->select('setting.*','ability.name  as   ability_name','operation.name  as   operation_name','operation.code  as   operation_code','ability.code  as   ability_code')
                                       ->where($where)->first();
                            if (count($setting) > 0) 
                              {
                                 $results['routing'][$routing_id]['step'][$mathour->step_info_id]['setting']['operation'][$arrmathour['operation_id']]['ability'][$mathour->ability_id]['value'] = obj2array($setting);

                                 $liuzhuan=DB::table($this->itemtable.' as item')
                                         ->leftJoin($this->ria.' as ability','item.next_ability','=','ability.id')
                                         ->leftJoin($this->rioTable.' as operation','item.next_operation','=','operation.id')
                                         ->select('item.*','ability.name  as   ability_name','operation.name  as   operation_name','ability.code as   ability_code','operation.code  as   ability_code')
                                         ->where('item.setting_id',$setting->id)->get();

                                 if (count($liuzhuan) > 0) 
                                 {
                                        
                                        foreach ($liuzhuan as $kk => $vv)
                                         {
                                           $results['routing'][$routing_id]['step'][$mathour->step_info_id]['setting']['operation'][$arrmathour['operation_id']]['ability'][$mathour->ability_id]['liuzhuan']['next_operation'][$vv->next_operation]['next_ability'][$vv->next_ability]= obj2array($vv);
                                         }
                                 }
                                 else 
                                 {
                                     $results['routing'][$routing_id]['step'][$mathour->step_info_id]['setting']['operation'][$arrmathour['operation_id']]['ability'][$mathour->ability_id]['liuzhuan'] = [];
                                 }

                              }
                              else
                              {
                                 $results['routing'][$routing_id]['step'][$mathour->step_info_id]['setting']=[];
                              } 
                              $results['routing'][$routing_id]['step'][$mathour->step_info_id]['workhourlist']['operation'][$arrmathour['operation_id']]['ability'][$mathour->ability_id][$arrmathour['id']] = $arrmathour;
                              
                          }
                        }
                    }

                }
               
            }
        }
        return $results;

    }


    /**
     * 根据工艺路线获取工序工时
     * @param  $bom_id 
     * @param  $step_info_id    array
     * @param  $qty   
     * @param  $hourdata
     * @return array 
     */

    public  function   countTotalHours($bom_id,$step_info_id,$qty,$hourdata,$routing_id='')
    {
        //获取步骤id
        $steps  =  $step_info_id;
        $bom    =  $bom_id;
        $qty    =  $qty;
        $hourdata    =  $hourdata;
        $final=[]; // 存放结果
        // 默认值
        $default_data = [
                'sign_hours' => 0,
                'sample_hours' => 0,
                'liuzhuan' => 0,
                'preparation_hour' => 0,
                'total_hour' => 0,
                'work_hours' => 0,
                'man_hours' => 0
        ];
        // 遍历步骤
        foreach ($steps as $key => $step) 
        {
            $step_id  =  $step['base_step_id'];
            $operation_id  =  $step['operation_id'];
            if (count($step['abilitys']) < 1) TEA('9017','empty ability worklist ');
            $temp_abilitys  = [];
            foreach ($step['abilitys'] as $ke => $va) 
            {
                 $temp_abilitys[] = $ke;
            }

            $temp_sign = [];

            foreach ($temp_abilitys as  $temp_ability)
            {
                    //判断是否是基准
                    $operation_info=DB::table($this->rioaTable )->where('id',$temp_ability)->first();

                    if ($operation_info) 
                    {
                        $real_ability_id  = $operation_info->ability_id;

                        $sign_where =  [
                          'operation_id'=>$operation_id,
                          'ability_id'=>$real_ability_id,
                          'is_sign'=>1,
                        ];

                        $ladder_where =  [
                          'operation_id'=>$operation_id,
                          'ability_id'=>$real_ability_id
                        ];

                        $sign = DB::table($this->riwTable)->where($sign_where)->first();
                        $ladder = DB::table($this->riwTable)->where($ladder_where)->first();
                        if (isset($ladder)) 
                        {
                            //是否是圆盘机
                            $is_ladder = $ladder->is_ladder;
                            if ($sign) 
                            {
                                $temp_sign['step']  = $step_id;
                                $temp_sign['ability']  = $temp_ability;
                            }
                        }


                    }
                if (isset($hourdata['step'])) 
                {       
                        //工时包正常
                        // 获取该步骤的工时列表
                        if (array_key_exists($step_id, $hourdata['step'])){
                            $temp_hourlist =  $hourdata['step'][$step_id]['workhourlist'];
                            //存在工时
                            if (count($temp_hourlist )>0)
                            {
                                if (array_key_exists($operation_id, $temp_hourlist['operation']))
                                {
                                    $temp_operation_hourlist = $temp_hourlist['operation'][$operation_id];


                                    if (array_key_exists($temp_ability, $temp_operation_hourlist['ability']))
                                    {
                                        $hourlist = $temp_operation_hourlist['ability'][$temp_ability];

                                    }
                                    else
                                    {
                                        // 默认值
                                        $final[$step_id][$temp_ability]= $default_data;
                                        continue;
                                    }

                                }
                                else
                                {
                                    // 默认值
                                    $final[$step_id][$temp_ability]= $default_data;
                                    continue;
                                }
                            }
                            else
                            {
                                // 默认值
                                $final[$step_id][$temp_ability]= $default_data;
                                continue;

                            }
                            // 获取工序设置
                            // 获取该步骤的设置列表
                            $temp_settinglist =  $hourdata['step'][$step_id]['setting'];
                            //存在工时
                            if (count($temp_settinglist )>0)
                            {

                                if (array_key_exists($operation_id, $temp_settinglist['operation']))
                                {
                                    $temp_operation_settinglist = $temp_settinglist['operation'][$operation_id];

                                    if (array_key_exists($temp_ability, $temp_operation_settinglist['ability']))
                                    {
                                        $settinglist = $temp_operation_settinglist['ability'][$temp_ability]['value'];
                                        $liuzhuanlist = $temp_operation_settinglist['ability'][$temp_ability]['liuzhuan'];
                                    }
                                    else
                                    {
                                        // 默认值
                                        $final[$step_id][$temp_ability]= $default_data;
                                        continue;
                                    }
                                }
                                else
                                {
                                    // 默认值
                                    $final[$step_id][$temp_ability]= $default_data;
                                    continue;
                                }

                            }
                            else
                            {
                                // 默认值
                                $final[$step_id][$temp_ability]= $default_data;
                                continue;
                            }
                            $temp_type=DB::table($this->riwTable)->where([['operation_id','=',$operation_id],['parent_id' ,'=',0]])->first();


                            // 判断是否是   圆盘切割
                             if ($is_ladder  !=1) 
                             {
//=========================================================================== 正常情况 计算总工时==================================================================================
                                    $type  = $temp_type->quantity_interval;       //是否按区间维护  4 不按区间维护    3正常区间维护    2工时负溢出  向上取值      1工时溢出  向下取值
                                    // 计算
                                    $hours =  $this-> calculate($type,$qty,$hourlist);
                                    // 获取流转工时、准备工时
                                    $settinghours  = $this->gain($steps,$settinglist,$liuzhuanlist);

                                    if(count($hours)>0)
                                    {
                                        $work_hours = $hours ['work_hours'];                    // 机器工时
                                        $man_hours = $hours ['man_hours'];                      // 人工工时

                                        $sign_hours = $hours ['worklist_hour'];                    // 标准工时
                                        $sample_hours = $hours ['sample_hours'];                   // 首样时间
                                        $liuzhuan = $settinghours ['liuzhuan'];                    // 流转时间
                                        $preparation_hour = $settinghours ['preparation_hour'];    // 准备时间


                                        $final[$step_id][$temp_ability]['work_hours'] = $work_hours;
                                        $final[$step_id][$temp_ability]['man_hours'] = $man_hours;
                                        $final[$step_id][$temp_ability]['sign_hours'] = $sign_hours;
                                        $final[$step_id][$temp_ability]['sample_hours'] = $sample_hours;
                                        $final[$step_id][$temp_ability]['liuzhuan'] = $liuzhuan;
                                        $final[$step_id][$temp_ability]['preparation_hour'] = $preparation_hour;
                                        $final[$step_id][$temp_ability]['total_hour'] = $preparation_hour+$liuzhuan+$sample_hours+$sign_hours;
                                    }
                                    else
                                    {
                                        // 默认值
                                        $final[$step_id][$temp_ability]= $default_data; 
                                    }
                                }
                                else
//====================================================================================================================================================================================
//========================================================================是圆盘机====================================================================================================
                                {
                                    $clip_data  = current($hourlist);
                                    $once_clip_time  =   $clip_data['once_clip_time'];   //  单次切割时间
                                    if ($once_clip_time  == 0) TEA('9023');
                                    //获取单次切割数量
                                    $routing_node_res=DB::table('ruis_bom_routing_base')->select('routing_node_id','routing_id')->where('id',$step_id)->first();
                                    if (!$routing_node_res) TEA('9024');
                                    $routing_node_id= $routing_node_res->routing_node_id;
                                    $routing_id= $routing_node_res->routing_id;
                                    //查找基础数量
                                    $base_qty_where=[
                                        'bom_id'=>$bom,
                                        'routing_id'=>$routing_id,
                                        'routing_node_id'=>$routing_node_id,
                                    ];
                                    $base_qty_res =DB::table('ruis_bom_routing_operation_control')->select('base_qty')->where($base_qty_where)->first();
                                    if (!$base_qty_res) TEA('9025');
                                    $once_clip_qty  = $base_qty_res->base_qty;
                                    // $once_clip_qty  =   $clip_data['once_clip_qty'];     //  单次切割张数
                                     // 获取流转工时、准备工时
                                    $settinghours  = $this->gain($steps,$settinglist,$liuzhuanlist);
                                    // 进一取整数  切割次数
                                    $clip_qty  = ceil($qty/$once_clip_qty);
                                    // 切割所用时间
                                    $clip_time = $clip_qty* $once_clip_time;

                                    $sign_hours =  $clip_time;                                   // 标准工时
                                    $sample_hours = 0;                                          // 首样时间
                                    $liuzhuan = $settinghours ['liuzhuan'];                     // 流转时间
                                    $preparation_hour = $settinghours ['preparation_hour'];     // 准备时间

                                    $final[$step_id][$temp_ability]['sign_hours'] = $sign_hours;
                                    $final[$step_id][$temp_ability]['sample_hours'] = $sample_hours;
                                    $final[$step_id][$temp_ability]['liuzhuan'] = $liuzhuan;
                                    $final[$step_id][$temp_ability]['preparation_hour'] = $preparation_hour;
                                    $final[$step_id][$temp_ability]['total_hour'] = $preparation_hour+$liuzhuan+$sample_hours+$sign_hours;
                                }
//====================================================================================================================================================================================
                        }else{
                            $final[$step_id]=[];
                        }
                }
                else
                {
                    //空工时包
                    $final[$step_id]=[];
                }

            }

                //获取标准工时
                if (count($temp_sign) > 0)
                {
                    if (isset($final[$temp_sign['step']][$temp_sign['ability']]))
                    {
                        if ($final[$temp_sign['step']][$temp_sign['ability']]['sign_hours'] > 0) 
                        {
                            $final[$step_id]['base_hour']=  $final[$temp_sign['step']][$temp_sign['ability']];
                        }
                        else
                        {
                            //判断最大工时
                            $max_key =  $this-> verdict($final[$step_id]);
                            if(!$max_key){
                                continue;
                            }else{
                                $final[$step_id]['base_hour']=  $final[$step_id][$max_key];
                            }
                        }
                    }
                    else
                    {
                        //判断最大工时
                        $max_key =  $this-> verdict($final[$step_id]);
                        if(!$max_key){
                            continue;
                        }else{
                            $final[$step_id]['base_hour']=  $final[$step_id][$max_key];
                        }
                    }

                }
                else
                {
                    //判断最大工时
                   $max_key =  $this-> verdict($final[$step_id]);
                   if(!$max_key){
                       continue;
                   }else{
                       $final[$step_id]['base_hour']=  $final[$step_id][$max_key];
                   }
                }

        }
        return  $final;

    }


    /**
     * 判断最大工时    //现在改为最小工时
     * @param $type    类型
     * @param $qty     数量
     * @param $hourlist     工时列表
     * @return array
     */
    public  function  verdict($final)
    {
        $temp_final = [];
        // if(count($final) < 1){
        //     $max_key = '';
        //     return   $max_key;
        // }
        // $temp = [];
        // $max_key = 0;
        // foreach ($final as $kk => $ability)
        // {
        //     $temp[$kk] = $ability['total_hour'];
        // }
        // if (empty($temp)){
        //     $max_key = '';
        // }else{
        //     $max_key = array_search(max($temp),$temp);
        // }
        // return   $max_key;

        //在操作之前 删除所有为空的 key
        foreach ($final as $key => $value) 
        {
            if ($value['sign_hours'] > 0) 
            {
              $temp_final[$key]=$value;
            }
        }

        if(count($temp_final) < 1){
            $min_key = '';
            return   $min_key;
        }
        $temp = [];
        $min_key = 0;
        foreach ($temp_final as $kk => $ability)
        {
            $temp[$kk] = $ability['total_hour'];
        }
        if (empty($temp)){
            $min_key = '';
        }else{
            $min_key = array_search(min($temp),$temp);
        }
        return   $min_key;
    }

    /**
     * 计算标准工时总工时
     * @param $type    类型
     * @param $qty     数量
     * @param $hourlist     工时列表
     * @return array
     */

    public  function  calculate($type,$qty,$hourlist)
    {
        $result=[];

        if ($type == 3 || $type ==2 || $type==1)   // 正常情况
        {
            $temp = [];
            $sample_hours=0;
            $max_area_hour_work_hours=0;
            $max_area_hour_man_hours=0;
            $mod_worklist_hour =0;
            foreach ($hourlist as $key => $value) 
            {
               $temp[] = $value['max_value'];
               $sample_hours = $value['sample_hours'];
             
            }
            $max_area =max($temp);
            foreach ($hourlist as $kkk => $vvv)
            {
                if ($vvv['max_value'] == $max_area) 
                {
                    $max_area_hour_work_hours = $vvv['work_hours'];
                    $max_area_hour_man_hours = $vvv['man_hours'];
                }
            }
            if ($max_area  == 0) TEA('9026','empty max_area');
            $times  =  floor($qty/$max_area);  //轮数

            $mod  = $qty - ($times * $max_area);  //余数
            if ($mod > 0) 
            {
                foreach ($hourlist as $k => $v) 
                {

                    if ( $mod>=$v['min_value']  &&  $mod<=$v['max_value'] )
                    {
                     //余数所在 区间
                     $mod_worklist_hour  = $mod * $v['work_hours'] + $mod * $v['man_hours'];
                     $mod_work_hours  = $mod * $v['work_hours'];
                     $mod_man_hours  =$mod * $v['man_hours'];
                    }
                }
            }
            //计算总工时
             $result['work_hours']  =  $times * $max_area * $max_area_hour_work_hours + $mod_work_hours;
             $result['man_hours']  =  $times * $max_area * $max_area_hour_man_hours + $mod_man_hours;
             $result['worklist_hour']  =  $times * $max_area * $max_area_hour_work_hours + $times * $max_area * $max_area_hour_man_hours + $mod_worklist_hour;
             $result['sample_hours']  =  $sample_hours;  // 首样工时
        } 

        if ($type == 4) 
        {

            $temp_list  = current($hourlist);
            $result['worklist_hour']  = $qty * $temp_list['work_hours']  + $qty * $temp_list['man_hours'];
            $result['sample_hours']  =  $temp_list['sample_hours'];  // 首样工时
            $result['work_hours']  =  $qty * $temp_list['work_hours'];  // 机器工时
            $result['man_hours']  =  $qty * $temp_list['man_hours'];  // 人工工时

        } 
        return   $result;

    }


    /**
     * 获取 最大流转工时  和 准备时间
     * @param $steps     步骤信息
     * @return array
     */

    public  function  gain($steps,$settinglist,$liuzhuanlist)
    {
        $result=[];// 保存返回值
        $temp=[];// 保存所有的流转时间
        // $now_step  =  current($steps);
        $liuzhuanlist  = $liuzhuanlist;
        if (count($liuzhuanlist) >0) 
        {
           $result['preparation_hour']=$settinglist['preparation_hour'];
           $next_operation_set  = $liuzhuanlist['next_operation'];
           foreach ($next_operation_set as $kkk => $vvv)
           {
                foreach ($vvv['next_ability'] as $kk => $vv) 
                {
                    $temp[]=$vv['flow_value'];
                }
           }
                
        } 
        else 
        {
           $result['liuzhuan'] =0;
           $result['preparation_hour'] =0;
        }

        if(count($temp)>0){
            $result['liuzhuan']=min($temp);
        }
        else{
            $result['liuzhuan']=0;
        }
        return   $result;

    }


    /**
     * 复制工时
     * @param $type    类型
     * @param $qty     数量
     * @param $hourlist     工时列表
     * @return array
     */
    public  function  copyWorkHours($update)
    {
        if ($update)
        {
          $where  = $update['old'];

          $workhourslists=DB::table($this->table)->where($where)->get();

          if ($workhourslists) 
          {
              foreach ($workhourslists as $value) 
              {
                    $new_data = obj2array($value);
                    unset($new_data['id']);
                    $new_data['routing_id']=$update['new']['routing_id'];
                    $new_data['step_info_id']=$update['new']['step_info_id'];
                    $new_data['bom_version']=$update['new']['bom_version'];
                    $new_data['bom_version_description']=$update['new']['bom_version_description'];
                    $new_data['ctime']=time();
                    $new_data['mtime']=time();

                    //添加
                    $insert_id=DB::table($this->table)->insertGetId($new_data);
                    if(!$insert_id) TEA('802');
              }
          }
        }

        return TRUE;

    }


    /**
     * 根据工艺路线获取工序工时
     * @param $input
     * @return array
     */
    public function getWorkHoursByRouting($input)
    {
       if(empty($input['step_info_id'])) TEA('9009','step_info_id');
       if(empty($input['operation_id'])) TEA('9007','operation_id');
       if(empty($input['abilitys'])) TEA('9010','abilitys');
       $operation_id  = $input['operation_id'];
       $step_info_id  = $input['step_info_id'];

       $abilitys =explode(',', $input['abilitys']);


       $results = [];
       $where = ['operation_id'=>$operation_id,'step_info_id'=>$step_info_id];

            //获取识别是否按区间维护
            $operation = DB::table($this->rioTable)->where('id',$operation_id )->first();
 
            //获取识别是否按区间维护
            $interval = DB::table($this->riwTable)->where('operation_id', $operation_id)->first();

            if (!$interval) 
            {
                TEA('9005'); 
            }

            foreach ($abilitys as $ability_id)
            {
                  $workhours = DB::table($this->table)
                    ->where('operation_id',$operation_id)
                    ->where('step_info_id',$step_info_id)
                    ->where('ability_id',$ability_id)
                    ->get();
                  $ability = DB::table($this->rioaTable)->where('id', $ability_id)->first();

                  $sign_ability_id  =  $ability->ability_id;

                  $sign_where =  [
                      'operation_id'=>$operation_id,
                      'ability_id'=>$sign_ability_id,
                  ];

                  $sign = DB::table($this->riwTable)->where($sign_where)->first();
                  if (!$sign) 
                  {
                     TEA('9021');
                  }

                  if(!$ability) TEA('9011');

                  $data = ['operation_id'=>$operation->id,'operation_name'=>$operation->name,'work_hours'=>'','flag'=>0,'ability_id'=>$ability_id,'ability_name'=>$ability->ability_name];

                  if ($interval->quantity_interval==0) TEA('9012'); 
                  
                  if($interval->quantity_interval==4)
                  {
                      if (count($workhours) > 0)
                      {
                        foreach ($workhours as  $workhour)
                        {
                             $data['workhours_id'] = $workhour->id;
                             $data['work_hours'] = $workhour->work_hours;
                             $data['man_hours'] = $workhour->man_hours;
                             $data['sample_hours'] = $workhour->sample_hours;
                             $data['flag'] = 1;
                             $data['is_sign'] = $sign->is_sign;
                             $data['is_ladder'] = $sign->is_ladder;
                             $data['ability_value'] = $sign->ability_value;
                             $data['real_abilityid'] = $sign_ability_id;
                             $data['setting_id'] = $sign->id;
                             $data['sign_id'] = $sign->sign_id;
                             $data['once_clip_time'] = $workhour->once_clip_time;
                             $data['once_clip_qty'] = $workhour->once_clip_qty;
                             $results[] = $data;
                        }
                      }else{
                             $data['is_sign'] = $sign->is_sign;
                             $data['is_ladder'] = $sign->is_ladder;
                             $data['ability_value'] = $sign->ability_value;
                             $data['real_abilityid'] = $sign_ability_id;
                             $data['setting_id'] = $sign->id;
                             $data['sign_id'] = $sign->sign_id;
                             $results[] = $data;
                      }
                  }elseif ($interval->quantity_interval<>4 && $interval->quantity_interval > 0)
                  {

                      if (count($workhours) > 0)
                        {
                            foreach ($workhours as  $workhour)
                            {
                                $data['workhours_id'] = $workhour->id;
                                $data['min_value'] = $workhour->min_value;
                                $data['max_value'] = $workhour->max_value;
                                $data['work_hours'] = $workhour->work_hours;
                                $data['man_hours'] = $workhour->man_hours;
                                $data['sample_hours'] = $workhour->sample_hours;
                                $data['once_clip_time'] = $workhour->once_clip_time;
                                $data['once_clip_qty'] = $workhour->once_clip_qty;
                                $data['flag'] = 1;
                                $data['is_sign'] = $sign->is_sign;
                                $data['is_ladder'] = $sign->is_ladder;
                                $data['ability_value'] = $sign->ability_value;
                                $data['sign_id'] = $sign->sign_id;
                                $data['setting_id'] = $sign->id;
                                $data['real_abilityid'] = $sign_ability_id;
                                $results[] = $data;
                            }
                        }
                        else
                        {
                                $data['min_value'] = '';
                                $data['max_value'] = '';
                                $data['is_sign'] = $sign->is_sign;
                                $data['is_ladder'] = $sign->is_ladder;
                                $data['ability_value'] = $sign->ability_value;
                                $data['sign_id'] = $sign->sign_id;
                                $data['setting_id'] = $sign->id;
                                $data['real_abilityid'] = $sign_ability_id;
                                $results[] = $data;
                        }
                  }
            }
        return $results;
    }

    /**
     * 获取明细数据
     * @param $id
     * @return mixed
     * @author liming
     */
    public function getStandardsByStep($id)
    {
        $data=[
            'item.*',
            'value.code   as   value_code',
            'value.name   as   value_name',
            'param.code   as   param_code',
            'param.name   as   param_name',
            'param.unit   as   param_unit',

        ];
        //获取列表
        $obj_list = DB::table('sap_standard_material_workhours_item  as  item')
            ->select($data)
            ->leftJoin('sap_standard_value_param_item  as  standard', 'standard.id', '=', 'item.standard_item_id')
            ->leftJoin('sap_param_item  as  param', 'param.id', '=', 'standard.param_item_id')
            ->leftJoin('sap_standard_value  as  value', 'value.id', '=', 'standard.standard_value_id')
            ->where('item.step_info_id', $id)
            ->orderBy('item.id', 'asc')
            ->get();
        return $obj_list;
    }

     /**
     * 保存工时数据
     */
    public function save($data,$id)
    {
        if ($id > 0)
        {
            try{
                //开启事务
                DB::connection()->beginTransaction();
                $upd=DB::table($this->table)->where('id',$id)->update($data);
                if($upd===false) TEA('804');
            }catch(\ApiException $e){
                //回滚
                DB::connection()->rollBack();
                TEA($e->getCode());
            }
            //提交事务
            DB::connection()->commit();
            $this->pk = $id;
        }
        else
        {
            //添加
            $item_id=DB::table($this->table)->insertGetId($data);
            if(!$item_id) TEA('802');
            $this->pk = $item_id;
        }
    }


     /**
     * 修改标准工时
     * @param $input
     * @return mixed
     */
    public function update($input)
    {
        if(empty($input['workhours_id'])) TEA('700','workhours_id');
        if(empty($input['work_hours'])) TEA('700','work_hours');

        $data = [
            'min_value'=>isset($input['min_value'])?$input['min_value']:"",
            'max_value'=>isset($input['max_value'])?$input['max_value']:"",
            'work_hours'=>isset($input['work_hours'])?$input['work_hours']:"",
            'sample_hours'=>isset($input['sample_hours'])?$input['sample_hours']:"",
            'mtime'=>$this->time
        ];

        // 判断是否可以   修改
        if ($input['min_value']>0 && $input['min_value']>0) 
        {
             $flag   =  $this->check_update_data($input);
        }
        else
        {
             $flag = 0; 
        }

        if ($flag)
        {
            TEA('9000','code');
        } 
        else
        {
           return DB::table($this->table)->where($this->primaryKey,$input['workhours_id'])->update($data);
        }
    }


    /**
     * 检测是否可以修改
     */

    public  function  check_update_data($input,$arr)
    {
        $flag = 0;
        $is_ladder = isset($input['is_ladder'])?$input['is_ladder']:0;
        if ($is_ladder  == 1) 
        {
            return $flag;
        }

        $max_value =$input['max_value'];
        $min_value =$input['min_value'];
        if($min_value > $max_value)
        {
            TEA('9014','code');
        }

        $workhours  =  $arr;

        if (count($workhours)>0)
        {
            $temp_number = 0;
            foreach ($workhours as  $key => $value)
            {
                if($input['operation_id'] == $value['operation_id'] && $input['ability_id'] == $value['ability_id'])
                {
                    //判断是否是本身
                    if ($max_value == $value['max_value'] && $min_value == $value['min_value'])
                    {

                        $temp_number+=1;
                        // 判断 是否有多个自己
                        if ($temp_number >1)
                        {
                            TEA('9022','code');
                        }
                        // 如果是自己就跳过
                        continue;
                    }

                    // 判断数据是否符合规范
                    if ($max_value < $value['min_value']   ||   $min_value > $value['max_value'])
                    {
                        $flag = 0;

                    }
                    else
                    {
                       $flag = 1;
                       TEA('9000');

                        break;
                    }

                }

            }
        }

        return $flag;
    }


    /**
     * 添加标准工时
     * @param $input
     * @return bool
     */
    public function store($input)
    {

        $material_no  = $input['material_no'];
        if(empty($material_no)) TEA('700','material_no');
        if(empty($input['data'])) TEA('700','data');

        $material = DB::table($this->rmTable)->where('item_no',$input['material_no'])->first();
        if(empty($material))
        {
            TEA('114',$input['material_no']);
        }
        $data_arr = json_decode($input['data'],true);
        $insert_data = [];

        try{
                //开启事务
                DB::connection()->beginTransaction();

                //删除  不同的id
                $where = ['material_id'=>$material->id];
                $db_ids = obj2array(DB::table($this->table)->select('id')->where($where)->get());//获取id
                $act_ids =  [];
                foreach ($data_arr as  $value) 
                {
                   if ($value['workhours_id'] > 0) 
                   {
                     $act_ids[] = $value['workhours_id'];
                   } 
                }

                foreach($db_ids as $db_id)
                {
                     // 需要删除的id                
                    $del_ids = array_diff($db_id, empty($act_ids) ? array() : $act_ids);
                    if ($del_ids)
                    {
                        foreach ($del_ids as $id)
                        {
                            //再删除自己
                            $this->destroyById($id);
                        } 
                    }
                }

                // 删除之后在 添加
                foreach ($data_arr as $v)
                {

                    if($v['work_hours'] < 0)
                    {
                        TEA('2201','work_hours');
                    }

                    $operation_material_category = DB::table($this->riomcTable)->where(['operation_id'=>$v['operation_id'],'material_category_id'=>$material->material_category_id])->first();
                    if(empty($operation_material_category))
                    {
                        TEA('2200','operation_id');
                    }

                    //获取识别是否按区间维护
                    $interval = DB::table($this->riwTable)->where('operation_id',$v['operation_id'])->first();
           
                    //按区间维护
                    if($interval->quantity_interval<>'4')
                    {

                         $insert_data[] = ['workhours_id'=>$v['workhours_id'],'work_hours'=>$v['work_hours'],'sample_hours'=>$v['sample_hours'],'operation_id'=>$v['operation_id'],'ability_id'=>$v['ability_id'],'min_value'=>$v['min_value'],'max_value'=>$v['max_value']];
                        
                    }
                    else//不按区间维护
                    {

                        $insert_data[] = ['workhours_id'=>$v['workhours_id'],'work_hours'=>$v['work_hours'],'sample_hours'=>$v['sample_hours'],'operation_id'=>$v['operation_id'],'ability_id'=>$v['ability_id']];
                    }
                }



                foreach ($insert_data as $insert)
                {

                    $where = ['operation_id'=>$insert['operation_id'],'material_category_id'=>$material->material_category_id,'material_no'=>$input['material_no'],'ability_id'=>$insert['ability_id'],'material_id'=>$material->id];
                     //获取识别是否按区间维护
                    $interval = DB::table($this->riwTable)->where('operation_id',$insert['operation_id'])->first();
                    $db_ids = obj2array(DB::table($this->table)->select('id')->where($where)->get());//获取id


                        //按区间维护
                        if($interval->quantity_interval<>'4')
                        {
                            //获得material
                            $insert['material_no']  =  $material_no;

                            // 判断max min    是否合理
                            $flag   =  $this->check_update_data($insert);

                            if($flag)
                            {
                                TEA('9001');
                            }
                             $ins_data = [
                              'material_no' => $input['material_no'],
                              'operation_id' => $insert['operation_id'],
                              'ability_id' => $insert['ability_id'],
                              'material_category_id' =>$material->material_category_id,
                              'material_id' =>$material->id,
                                'ctime' => $this->time,
                                'mtime' => $this->time,
                                'min_value'         => $insert['min_value'],
                                'max_value'    => $insert['max_value'],
                                'work_hours'       => $insert['work_hours'],
                                'sample_hours'       => $insert['sample_hours'],
                                'creator_id'       => 0,   //创建人
                            ];

                            //插入
                            $ins_id =$insert['workhours_id']? $insert['workhours_id']:0;
                            $this->save($ins_data,$ins_id);
                        }
                        else
                        {
                            $ins_data = [
                              'material_no' => $input['material_no'],
                              'operation_id' => $insert['operation_id'],
                              'ability_id' => $insert['ability_id'],
                              'material_category_id' =>$material->material_category_id,
                              'material_id' =>$material->id,
                                'ctime' => $this->time,
                                'mtime' => $this->time,
                                'work_hours'       => $insert['work_hours'],
                                'sample_hours'       => $insert['sample_hours'],
                                'creator_id'       => 0,  //创建时间
                            ];
                            //插入
                            $ins_id =$insert['workhours_id']? $insert['workhours_id']:0;
                            $this->save($ins_data,$ins_id);
                          
                        }
                }

        }catch(\ApiException $e){
            //回滚
            DB::connection()->rollBack();
            TEA($e->getCode());
        }
        //提交事务
        DB::connection()->commit();
        return true;
        }


    public function store_new($input)
    {
        $material_no         = $input['material_no'];
        $routing_id          = $input['routing_id'];
        $step_info_id        = $input['step_info_id'];
        $bom_id              = $input['bom_id'];
        $operation_id        = $input['operation_id'];
        if(empty($material_no)) TEA('700','material_no');
        if(empty($routing_id)) TEA('700','routing_id');
        if(empty($step_info_id)) TEA('9006','step_info_id');
        if(empty($operation_id)) TEA('9007','operation_id');

        // 获取bom 版本信息
        $versiondata = DB::table($this->bomTable)->select('version','version_description')->where('id', $bom_id)->first();
        if (!$versiondata) TEA('9027',$bom_id);
        $version        = $versiondata->version;
        $version_description        = $versiondata->version_description;
        $material = DB::table($this->rmTable)->where('item_no',$input['material_no'])->first();
        if(empty($material))
        {
            TEA('114',$input['material_no']);
        }
        $insert_data = [];
        $where = ['operation_id'=>$operation_id,'step_info_id'=>$step_info_id,'bom_id'=>$bom_id,'routing_id'=>$routing_id];
        $db_ids = obj2array(DB::table($this->table)->select('id')->where($where)->get());//获取id
        $act_ids =  [];
        $data_arr = json_decode($input['data'],true);
        if (!$data_arr) 
        {

        }
        else
        {
          foreach ($data_arr as  $value) 
          {
            $act_ids[] = $value['workhours_id'];
          }
        }

         //获取识别是否按区间维护
         $interval = DB::table($this->riwTable)->where('operation_id',$operation_id)->first();

        try{
                //开启事务
                DB::connection()->beginTransaction();

                // 保存standard  value
                $this->standardmaterialitem->saveItem($input,$step_info_id);


                // 先删除 要删除的工时
                foreach($db_ids as $db_id)
                {
                     // 需要删除的id                
                    $del_ids = array_diff($db_id, empty($act_ids) ? array() : $act_ids);
                    if ($del_ids)
                    {
                        foreach ($del_ids as $id)  $this->destroyById($id);
                    }
                }

                foreach ($data_arr as $v) 
                {
                    if($v['work_hours'] < 0)
                    {
                        TEA('2201','work_hours');
                    }

                    // 获取 能力
                    // operation_ability_id    =>   $v['ability_id'
                      $ability = DB::table($this->rioaTable)->where('id', $v['ability_id'])->first();
                      $real_ability_id  =  $ability->ability_id;
                      $setting_where =  [
                          'operation_id'=>$operation_id,
                          'ability_id'=>$real_ability_id,
                      ];
                      $setting = DB::table($this->riwTable)->where($setting_where)->first();
                      $is_ladder  = $setting->is_ladder;
                    //按区间维护  并且不是 圆盘切割（阶梯型增涨）
                    if($interval->quantity_interval<>'4'  &&  $is_ladder !=1)
                    {
                         $insert_data[] = ['workhours_id'=>$v['workhours_id'],'work_hours'=>$v['work_hours'],'sample_hours'=>$v['sample_hours'],'operation_id'=>$v['operation_id'],'ability_id'=>$v['ability_id'],'min_value'=>$v['min_value'],'max_value'=>$v['max_value'],'man_hours'=>$v['man_hours'],'once_clip_time'=>$v['once_clip_time'],'once_clip_qty'=>$v['once_clip_qty'],'is_ladder'=>$is_ladder];
                    }
                    else//不按区间维护
                    {

                        $insert_data[] = ['workhours_id'=>$v['workhours_id'],'work_hours'=>$v['work_hours'],'sample_hours'=>$v['sample_hours'],'operation_id'=>$v['operation_id'],'ability_id'=>$v['ability_id'],'man_hours'=>$v['man_hours'],'once_clip_time'=>$v['once_clip_time'],'once_clip_qty'=>$v['once_clip_qty'],'is_ladder'=>$is_ladder];
                    }
                }

                foreach ($insert_data as $insert)
                {
                        //按区间维护
                        if($interval->quantity_interval<>'4')
                        {
                            //获得material
                            $insert['material_no']  =  $material_no;
                            $insert['bom_id']  =  $bom_id;
                            $insert['step_info_id']  =  $step_info_id;
                            // 判断max min    是否合理
                            $flag   =  $this->check_update_data($insert,$data_arr);
                            if($flag)
                            {
                                TEA('9001');
                            }


                             $ins_data = [
                              'material_no'  => $input['material_no'],
                              'step_info_id' => $step_info_id,
                              'routing_id'   => $routing_id,
                              'bom_id'       => $bom_id,
                              'bom_version'       => $version,
                              'bom_version_description' => $version_description,
                              'operation_id' =>$operation_id,
                              'ability_id'   => $insert['ability_id'],
                              'material_category_id' =>$material->material_category_id,
                              'material_id' =>$material->id,
                                'ctime' => $this->time,
                                'mtime' => $this->time,
                                'min_value'         => isset($insert['min_value'])?$insert['min_value']:0,
                                'max_value'         => isset($insert['max_value'])?$insert['max_value']:0,
                                'work_hours'       => $insert['work_hours'],
                                'man_hours'       => $insert['man_hours'],
                                'sample_hours'       => $insert['sample_hours'],
                                'once_clip_time'       => $insert['once_clip_time'],
                                'once_clip_qty'       => $insert['once_clip_qty'],
                                'creator_id'       => 0,   //创建人
                            ];

                            //插入
                            $ins_id =$insert['workhours_id']? $insert['workhours_id']:0;
                            $this->save($ins_data,$ins_id);
                        }
                        else
                        {
                            $ins_data = [
                              'material_no'  => $input['material_no'],
                              'routing_id'   => $routing_id,
                              'step_info_id' => $step_info_id,
                              'bom_id'       => $bom_id,
                              'bom_version'  => $version,
                              'bom_version_description' => $version_description,
                              'operation_id' =>$operation_id,
                              'ability_id' => $insert['ability_id'],
                              'material_category_id' =>$material->material_category_id,
                              'material_id' =>$material->id,
                                'ctime' => $this->time,
                                'mtime' => $this->time,
                                'man_hours'       => $insert['man_hours'],
                                'work_hours'       => $insert['work_hours'],
                                'sample_hours'       => $insert['sample_hours'],
                                'once_clip_time'       => $insert['once_clip_time'],
                                'once_clip_qty'       => $insert['once_clip_qty'],
                                'creator_id'       => 0,  //创建时间
                            ];
                            //插入
                            $ins_id =$insert['workhours_id']? $insert['workhours_id']:0;
                            $this->save($ins_data,$ins_id);
                        }
                }
 
        }catch(\ApiException $e){
            //回滚
            DB::connection()->rollBack();
            TEA($e->getCode());
        }
        //提交事务
        DB::connection()->commit();
        return true;
        }


    /**
     * 获取标准工时列表
     * @param $input
     * @return mixed
     */
    public function index($input)
    {
        if(empty($input['page_no']) || !is_numeric($input['page_no'])  || $input['page_no'] < 1) TEA('700','page_no');
        if(empty($input['page_size']) || !is_numeric($input['page_size']) || $input['page_size']  < 0) TEA('700','page_size');
        
        $where = $this->_search($input);

        $builder = DB::table($this->aliasTable['material_workhours'])
        ->select(
            "material_workhours.*",
            'material.name as material_name',
            'operation.name as operation_name',
            'unit.unit_text as unit_text',
            'operation.code as operation_code','ability.ability_name')
        ->where($where)
        ->leftJoin($this->aliasTable['material'],'material.item_no','=','material_workhours.material_no')
        ->leftJoin($this->aliasTable['operation'],'operation.id','=','material_workhours.operation_id')
        ->leftJoin($this->aliasTable['ability'],'ability.id','=','material_workhours.ability_id') 
        ->leftJoin($this->aliasTable['unit'], 'unit.id', '=', 'material.unit_id')
        ->offset(($input['page_no']-1)*$input['page_size'])
        ->limit($input['page_size']);
        $result['list'] = $builder->get();
        $result['current_page_no'] = $input['page_no'];
        $result['current_page_size'] = $input['page_size'];
        $result['total_records'] = DB::table($this->aliasTable['material_workhours'])->where($where)->count();
        $result['total_pages'] = ceil($result['total_records']/$result['current_page_size']);
        return $result;
    }



    /**
     * 获取标准工时列表
     * @param $input
     * @return mixed
     */
    public function indextest($input)
    {
        $where = $this->_search($input);
        $builder = DB::table($this->aliasTable['material_workhours'])
        ->select(
            "material_workhours.*",
            'material.name as material_name',
            'operation.name as operation_name',
            'unit.unit_text as unit_text',
            'operation.code as operation_code','ability.ability_name')
        ->where($where)
        ->leftJoin($this->aliasTable['material'],'material.item_no','=','material_workhours.material_no')
        ->leftJoin($this->aliasTable['operation'],'operation.id','=','material_workhours.operation_id')
        ->leftJoin($this->aliasTable['ability'],'ability.id','=','material_workhours.ability_id') 
        ->leftJoin($this->aliasTable['unit'], 'unit.id', '=', 'material.unit_id');
        $result['list'] = $builder->get();
        $result['current_page_no'] = $input['page_no'];
        $result['current_page_size'] = $input['page_size'];
        $result['total_records'] = DB::table($this->aliasTable['material_workhours'])->where($where)->count();
        $result['total_pages'] = ceil($result['total_records']/$result['current_page_size']);
        $final =   $this->groups($result);
        return $final;
    }



    /**
     * 处理工时列表
     * @param $input
     * @return mixed
     */
    public  function  groups($arr)
    {

        $results  =  obj2array($arr);
        // 定义一个容器  存放物料数组
        $materials = [];
        // 定义一个容器  存放结果
        $temp = [];

        foreach ($results['list'] as $key => $value)
        {
            //判断数组中是否存在
            if (in_array($value['material_id'],  $materials)) 
            {
                $temp[$value['material_no']]['sons'][$value['operation_code']]['sons'][]= $value ;
            }
            else 
            {
                $materials[] = $value['material_id'];
                $k  = $value['material_id'];
                $data = [
                   'id'  => '',
                   'material_no'  => $value['material_no'],
                   'status'  => '',
                   'auditor'  => '',
                   'audittime'  => '',
                   'material_category_id'=>$value['material_category_id'],
                   'min_value'  => '',
                   'max_value'  => '',
                   'work_hours'  => '',
                   'operation_id'  => '',
                   'ctime'  => '',
                   'mtime'  => '',
                   'creator_id'  => '',
                   'ability_id'  => '',
                   'material_id'  => '',
                   'sample_hours'  => '',
                   'material_name'  => $value['material_name'],
                   'operation_name'  => '',
                   'unit_text'  => '',
                   'operation_code'  => '',
                   'ability_name'  => '',
                   'sons'  => [],
                ];

                $operation_data = [
                   'operation_id'  => $value['operation_id'],
                   'operation_code'  => $value['operation_code'],
                   'operation_name'  => $value['operation_name'],
                   'sons'  => [],
                ];


                $temp[$value['material_no']] = $data;
                $temp[$value['material_no']]['sons'][$value['operation_code']]= $operation_data ;
                $temp[$value['material_no']]['sons'][$value['operation_code']]['sons'][]= $value ;
            }

        }
        return $temp;

    }


    /**
     * 标准工时删除
     * @param $input
     * @return mixed
     */
    public function destroy($input)
    {
        if(empty($input['workhours_id'])) TEA('700','workhours_id');

        $has = $this->getRecordById($input['workhours_id'],'*',$this->table);
        if(!$has)
        {
            TEA('2202','workhours_id');
        }

        return $this->destroyById($input['workhours_id'],$this->table);
    }

   
    //工时Excel导入
     public function work_hours_list_importExcel($values)
    {
        
        $result = [];
        $flag = 0;
        if(!empty($values))
        {
            foreach ($values as $v)
            {
                //根据工序code找到对应的工序信息
                $operation = DB::table($this->otable)->where('code',$v[3])->first();
                $update_data['min_value'] = !empty($v[6])?$v[6]:0;
                $update_data['max_value'] = !empty($v[7])?$v[7]:0;
                $update_data['work_hours'] = $v[9];
                $update_data['actual_hours'] = $v[10];
                $update_data['material_no'] = $v[1];
                $update_data['created_time'] = $this->time;
                $update_data['operation_id'] = $operation->id;
                $update_data['ability_id'] = $v[5];

                if(!empty($update_data['min_value']) && !empty($update_data['max_value']))
                {
                    $flag = $this->check_workhour_info($v[1],$operation->id,$v[5],$update_data['min_value'],$update_data['max_value']);
                }

                $update_data['flag'] = $flag;
                $insert_id = DB::table($this->table)->insertGetId($update_data);

                $res['insert_id'] = $insert_id;
                $res['error'] = $flag;

                $result[] = $res;
            }
        }

        return $result;
    }

    public function work_hours_list_Excel(&$input)
    {
        //根据物料名称查找
        if (isset($input['material_name']) && $input['material_name']) {
            $where[]=['material.name','like','%'.$input['material_name'].'%'];
        }
        //根据物料编码查找
        if (isset($input['material_item_no']) && $input['material_item_no']) {
            $where[]=['material.item_no','like','%'.$input['material_item_no'].'%'];
        }
        $alreadyCheckedOutDevices = DB::table($this->aliasTable['material_workhours'])
            ->select("material_workhours.material_no as material_no");//分次查询
        $builder = DB::table($this->aliasTable['material'])
            ->select("material.item_no as material_no",
                'material.name as material_name',
                'operation.name as operation_name',
                'operation.code as operation_code',
                'ability.ability_name as ability_name',
                'ability.ability_id as ability_id',
                'unit.unit_text as unit_text')
            ->leftJoin($this->aliasTable['operation_material_category'],'material.material_category_id','=','operation_material_category.material_category_id')
            ->leftJoin($this->aliasTable['operation'],'operation.id','=','operation_material_category.operation_id')
            ->leftJoin($this->aliasTable['ability'],'ability.operation_id','=','operation_material_category.operation_id')
            ->leftJoin($this->aliasTable['unit'], 'unit.id', '=', 'material.unit_id')
            ->whereNotIn('material.item_no', $alreadyCheckedOutDevices)//not in物料编码未维护工时
            ->whereNotNull('operation.code');//is not null工序code
        if(array_key_exists('page_no',$input )|| array_key_exists('page_size',$input ))//判断传入的key是否存在
        {
            $builder->offset(($input['page_no']-1)*$input['page_size'])
                ->limit($input['page_size']);
            if (!empty($where)) $builder->where($where);
            //order  (多order的情形,需要多次调用orderBy方法即可)
            if (!empty($input['order']) && !empty($input['sort'])) $builder->orderBy('material.' . $input['sort'], $input['order']);
            $builder->orderBy('material.id','desc');

        }else{
            if (!empty($where)) $builder->where($where);
            //order  (多order的情形,需要多次调用orderBy方法即可)
            if (!empty($input['order']) && !empty($input['sort'])) $builder->orderBy('material.' . $input['sort'], $input['order']);
            $builder->orderBy('material.id','desc');
        }

        //总共有多少条记录
        $count_builder= DB::table($this->aliasTable['material'])
            ->leftJoin($this->aliasTable['operation_material_category'], 'material.material_category_id', '=', 'operation_material_category.material_category_id')
            ->leftJoin($this->aliasTable['operation'], 'operation.id', '=', 'operation_material_category.operation_id')
            ->leftJoin($this->aliasTable['ability'],'ability.operation_id','=','operation_material_category.operation_id')
            ->leftJoin($this->aliasTable['unit'], 'unit.id', '=', 'material.unit_id')
            ->whereNotIn('material.item_no', $alreadyCheckedOutDevices)//not in物料编码未维护工时
            ->whereNotNull('operation.code');
        if (!empty($where)) $count_builder->where($where);
        $input['total_records']=$count_builder->count();

        $list = $builder->get();
        return obj2array($list);
    }
    /**
     * 查看标准工时
     * @param $input
     * @return mixed
     */
    public function show($input)
    {
         if(empty($input['workhours_id'])) TEA('700','workhours_id');

        //检测标准工时记录是否存在
        $has = $this->getRecordById($input['workhours_id'],'*',$this->table);
        if(!$has)
        {
            TEA('2202','workhours_id');
        }

        $result = DB::table($this->aliasTable['material_workhours'])
            ->select("material_workhours.*",
                'material.name as material_name',
                'operation.name as operation_name',
                'operation.code as operation_code','ability.ability_name')
            ->leftJoin($this->aliasTable['material'],'material.item_no','=','material_workhours.material_no')
            ->leftJoin($this->aliasTable['operation'],'operation.id','=','material_workhours.operation_id')
            ->leftJoin($this->aliasTable['ability'],'ability.id','=','material_workhours.ability_id')
            ->where('material_workhours.id',$input['workhours_id'])
            ->first();

        return $result;
    }

    public function batch_submit_check($input)
    {
        if(empty($input['ids'])) TEA('700','ids');
        $ids_arr = json_decode($input['ids'],true);
        foreach ($ids_arr as $v)
        {
            if(empty($v['id']) || !is_numeric($v['id'])) TEA('703','id');
            $status = $this->getFieldValueByWhere([['id','=',$v['id']]], 'status',$this->table);
            if($status == self::STATUS3) TEA('2203');
            if($status == self::STATUS1) TEA('2204');

            $data=[
                'status'=>self::STATUS3,
                'audittime'=>$this->time,
            ];
            $upd = DB::table($this->table)->where('id',$v['id'])->update($data);
            if($upd === false) TEA('804');
        }
    }

    public function return_check($input)
    {
        if(empty($input['id']) || !is_numeric($input['id'])) TEA('700','id');

        $status = $this->getFieldValueByWhere([['id','=',$input['id']]], 'status',$this->table);
        if($status != self::STATUS3) TEA('2207');

        $data['status'] = self::STATUS0;
        $data['audittime'] = $this->time;
        $upd=DB::table($this->table)->where('id',$input['id'])->update($data);
        if($upd===false) TEA('804');

        return $input['id'];
    }

    public function batch_return_check($input)
    {
        if(empty($input['ids'])) TEA('700','ids');

        $ids_array = json_decode($input['ids'],true);
        foreach ($ids_array as $v)
        {
            //id判断
            $this->return_check($v);
        }
    }

    /**
     * 标准工时审核
     * @throws \Exception
     * @author    xiafengjuan
     */
    public function audit($input)
    {
        $hour_id   = $input['id'];//获取标准工时ID
        //判断 是否 审核
        $status = $this->getFieldValueByWhere([['id','=',$hour_id]], 'status','ruis_ie_material_workhours');
        if ($status  ==  1) TEA('2204');
        if ($status  ==  0) TEA('2205');
        //获取编辑数组
        $data=[
            'status'=>1,
            'audittime'=>time(),
        ];
        try{
            //开启事务
            DB::connection()->beginTransaction();
            //改变状态
            $upd=DB::table($this->table)->where('id',$input['id'])->update($data);
            if($upd===false) TEA('804');

        }catch(\ApiException $e){
            //回滚
            DB::connection()->rollBack();
            TEA($e->getCode());
        }
        //提交事务
        DB::connection()->commit();

        return $hour_id;
    }
    /**
     * 批量标准工时审核
     * @throws \Exception
     * @author    xiafengjuan
     */
    public function batchaudit($input)
    {
        foreach (json_decode($input['ids'],true)  as  $key=>$tid)
        {
            //id判断
            if(empty($tid['id']) || !is_numeric($tid['id'])) TEA('703','id');
            $this->audit($tid);
        }
    }


    /**
     * 搜索
     */
    private function _search($input)
    {
        $where = array();
        //根据物料名称查找
        if (isset($input['material_name']) && $input['material_name']) {
            $where[]=['material.name','like','%'.$input['material_name'].'%'];
        }
        //根据物料编码查找
        if (isset($input['material_item_no']) && $input['material_item_no']) {
            $where[]=['material_no','like','%'.$input['material_item_no'].'%'];
        }
        //根据状态查找
        if(isset($input['status']) && $input['status'] != '')
        {
            $where[] = ['material_workhours.status','=',$input['status']];
        }
        //根据工序id查找
        if(isset($input['operation_id']) && $input['operation_id'] != '')
        {
            $where[] = ['material_workhours.operation_id','=',$input['operation_id']];
        }
        //根据能力id查找
        if(isset($input['ability_id']) && $input['ability_id'] != '')
        {
            $where[] = ['material_workhours.ability_id','=',$input['ability_id']];
        }

         //根据operation_name
        if(isset($input['operation_name']) && $input['operation_name'])
        {
            $where[]=['operation.name','like','%'.$input['operation_name'].'%'];
        }
        return $where;
    }

}