<?php
/**
 * Created by PhpStorm.
 * User: wangguangyang
 * Date: 2018/2/7
 * Time: 09:07
 */
namespace App\Http\Models\QC;
use App\Http\Models\Base;
use Illuminate\Support\Facades\DB;

class Setting extends Base
{
    public function __construct()
    {
        $this->table=config('alias.rqt');
        $this->checkTable='ruis_qc_check';
        $this->checkTypeTable='ruis_check_type';
        $this->resultTable='ruis_qc_check_item_result';
        $this->inspectTable='ruis_inspect_object';
        $this->materialTable='ruis_material';
        $this->materialCategoryTable='ruis_material_category';
        
    }
//region 检
    public function checkItemList($input)
    {
        if(empty($input['check_type'])) TEA('6500');
        if(empty($input['check_inspect_id'])) TEA('6501');

        $has = DB::table($this->table)->where([
            ['check_type', '=', $input['check_type']],
            ['check_inspect_id', '=', $input['check_inspect_id']],
        ])->limit(1)->count();

        if(!empty($has)) TEA('6502');
    }

//endregion

//region 增
    /**
     * @message 编辑模板
     * @author  liming
     * @time    年 月 日
     */    
    public function addCheckItem($input)
    {

         try{
            //开启事务
            DB::connection()->beginTransaction();
            $insert_id  = 0;
            $inspect  = $input['check_inspect_id'];

             //代码唯一性检测
             $has=$this->isExisted([['code','=',$input['check_type_code'].$input['check_inspect_code']]]);
             if($has) TEA('6526','code');

            $insert_data  = [
                'check_inspect_id' => $input['check_inspect_id'],
                'check_type_code' => $input['check_type_code'],
                'code' => $input['check_type_code'].$input['check_inspect_code'],
            ];
            $temp_count =  DB::table($this->table)->where($insert_data)->count();
            if ($temp_count < 1) 
            {
                $insert_id=DB::table($this->table)->insertGetId($insert_data);

                // 获取 最顶级  id
                $this->save_father($inspect,$input['check_type_code']);
                if(empty($insert_id)) TEA('6503');


                // 检验是否只有唯一的code
                $count =  DB::table($this->checkTypeTable)->where('code',$input['check_type_code'])->count();
                if($count > 1) TEA('6517');

                // 反写  check_type    has_templete
                $data = [
                   'has_templete' => 1  
                ];
                $upd  =  DB::table($this->checkTypeTable)->where('code',$input['check_type_code'])->update($data);
                if($upd===false) TEA('804');
            }

          }catch(\ApiException $e){
            //回滚
            DB::connection()->rollBack();
            TEA($e->getCode());
        }
        //提交事务
        DB::connection()->commit();
        return $insert_id;
    }
//endregion

    public  function  save_father($inspect,$check_code)
    {
        //找上一级
        $father  =   DB::table($this->inspectTable)->select('parent_id')->where('id',$inspect)->first();

        if ($father)
        {
            if ($father->parent_id > 0) 
            {
                $owndata=[
                   'check_type_code' => $check_code,
                   'check_inspect_id' => $father->parent_id,
                ];

                // 查询 是否存在
                $count  = DB::table($this->table)->where($owndata)->count();
                if ($count>0) 
                {
                    return true;
                }
                $store_id=DB::table($this->table)->insertGetId($owndata);
                $this->save_father($father->parent_id,$check_code); 
            }
            else
            {
                return true;
            }
        }
        else
        {
            return true;
        }
            
    }
//region 修
//endregion

//region 查
    public function getItemsByType($input)
    {
        $data = [
            'rqt.id as template_id',
            'rio.id as inspect_id',
            'rio.id as id',
            'rio.parent_id as parent_id',
            'rio.name as name',
            'rio.remark as remark',
            'rio.type as type',
            'rio.code as code'
        ];

        $select = DB::table($this->table.' as rqt')
            ->select($data)
            ->leftJoin('ruis_inspect_object as rio','rqt.check_inspect_id','=','rio.id')
            ->where('rqt.check_type_code',$input['check_type_code'])
            ->get();
        if(empty($select)) TEA('6507');
        return $select;
    }

    



    /**
     * @message 检验
     * @author  liming
     * @time    年 月 日
     */    
        
    public function getCheckItemsByType($input)
    {
            $final_result  =[];
            $ids_arr =  explode(',', $input['ids']);
            $type = [];
            if (count($ids_arr)>0) 
            {
               foreach ($ids_arr as  $id) 
               {
                    // 根据物料id获取   物料类型   
                    $result = DB::table($this->checkTable)->select('material_id','check_resource','check_type','operation_id','check_type_code','MATNR','WERKS')->where('id',$id)->first();

                    if (!empty($result->check_type_code)) 
                    {
                       $type[] =  $result->check_type_code;
                    }
                    else
                    {
                        // 根据物理id  获取物料类别
                        $material  = DB::table($this->materialTable.' as  material')
                                    ->select('category.id as category_id','category.name as category_name')
                                    ->leftJoin($this->materialCategoryTable.' as category','material.material_category_id','=','category.id')
                                    ->where('material.id',$result->material_id)
                                    ->first();
                        // 如果物料不存在  重新根据编码再次查找  如果还是不存在则报错
                        if (!$material) 
                        {
                            $MATNR  = $result->MATNR;
                            if (empty($MATNR))  TEA('6524');

                            $material_code=preg_replace('/^0+/','',$MATNR);
                            $realmaterial_id  = DB::table($this->materialTable)
                                              ->select('id')
                                              ->where('item_no',$material_code)
                                              ->first();
                            if (!$realmaterial_id) TEA('6518');
                            $WERKS  = $result->WERKS;
                            $keyVal['material_id'] = $realmaterial_id->id;
                            //根据物料 和 工厂 查找采购存储地址  和生产  存储地址
                            $marc_where=[
                                'material_id'=>$keyVal['material_id'],
                                'WERKS'=>$WERKS
                            ];
                            $marc_res  =  DB::table('ruis_material_marc')->select('LGPRO','LGFSB')->where($marc_where)->first();
                            if ($marc_res) 
                            {
                               $keyVal['LGPRO'] =$marc_res->LGPRO;
                               $keyVal['LGFSB'] =$marc_res->LGFSB;
                            }
                            else
                            {
                                $keyVal['LGPRO'] ='';
                                $keyVal['LGFSB'] ='';
                            }

                            $attr ='';   // 定义一个空字符串，用来存物料属性   
                            $temp = [];  // 定义一个临时空数组
                            if ($keyVal['material_id']>0) 
                            {
                                //获取  物料属性
                                $vaules  = DB::table('material_attribute')->select('value')->where('material_id',$keyVal['material_id'])->get();
                                if ($vaules) 
                                {
                                   foreach ($vaules as $key => $value) 
                                    {
                                       $temp[]=$value->value;
                                    } 
                                }
                                $attr = implode("/", $temp);
                                $keyVal['attr'] =$attr; 
                            }
                            // 更新检验单物料信息
                            $upd=DB::table($this->checkTable)->where('id',$id)->update($keyVal);
                            if($upd===false) TEA('804');

                            // 根据物理id  获取物料类别
                            $material  = DB::table($this->materialTable.' as  material')
                                    ->select('category.id as category_id','category.name as category_name')
                                    ->leftJoin($this->materialCategoryTable.' as category','material.material_category_id','=','category.id')
                                    ->where('material.id',$realmaterial_id->id)
                                    ->first();
                        }
                        $material_category  =  $material->category_id;
                        $check_resource  =  $result->check_resource; // 即是检验分类  也是检验单类型

                        if ($check_resource  ==1) //iqc
                        {
                            $where  = [
                                'material_type'=>$material_category,
                                'type_kind'=>$check_resource,   //type_kind: 检验分类   1iqc   2ipqc   3 oqc     check_resource：检验单类型1 iqc  2ipqc  3oqc
                            ];
                        }
//============================================ 需要完善=============================================================
                        if ($check_resource  ==2) //ipqc
                        {
                            //1 根据单号  找到operaton
                            $operation_id  =  $result->operation_id;
                            if ($operation_id <1) TEA('6521');

                            // 根据物理id  获取物料类别
                            $material  = DB::table($this->materialTable.' as  material')
                                        ->select('category.id as category_id','category.name as category_name')
                                        ->leftJoin($this->materialCategoryTable.' as category','material.material_category_id','=','category.id')
                                        ->where('material.id',$result->material_id)
                                        ->first();
                            if (!$material)  TEA('6518');
                            $material_category  =  $material->category_id;
                            $where  = [
                                'operation_id'=> $result->operation_id,     //工序id
                                'material_type'=>$material_category,
                                'type_kind'=>$check_resource,   
                            ];
                        }
//=================================================================================================================
                            //获取 检验分类
                            $check_type  =  DB::table($this->checkTypeTable)->select('id','has_templete','code')->where($where)->first();
                            if (!$check_type) 
                            {
                                if ($check_resource==2) 
                                {
                                    // 如果是 ipqc  可以忽略掉物料  重新查找
                                    unset($where['material_type']);
                                    $check_type  =  DB::table($this->checkTypeTable)->select('id','has_templete','code')->where($where)->first();
                                    if (!$check_type) 
                                    {
                                      TEA('6519'); 
                                    }
                                }
                                else
                                {
                                  TEA('6519');  
                                }
                            }
                            $type_own_id =  $check_type->id;
                            $check_type_code =  $check_type->code;
                            $has_templete =  $check_type->has_templete;
                            //如果 当前检验分类 有模板 则使用它  否则向上找父级 直到找到模板为止
                            if ( $has_templete  != 1) 
                            {
                                $type_own_id = $this->find_type($type_own_id);
                                // 找出模板code
                                if($type_own_id <1) TEA('6519');
                                $final_type_res  =  DB::table($this->checkTypeTable)->select('code')->where('id',$type_own_id)->first();
                                //  反写到 检验单
                                $updata=[
                                    'check_type_code'=>$final_type_res->code,
                                ];
                                $upd = DB::table($this->checkTable)->where('id',$id)->update($updata);
                                if($upd===false) TEA('804');  

                                $type[] =  $final_type_res->code;
                            }
                            else
                            {
                                //  反写到 检验单
                                $updata=[
                                    'check_type_code'=>$check_type_code
                                ];
                                $upd = DB::table($this->checkTable)->where('id',$id)->update($updata);
                                if($upd===false) TEA('804');
                                $type[] =  $check_type_code;
                            }
                        }
               }
            }
            else
            {
                    TEA('6514');
            }
            $check_type_arr =   array_unique($type);
            if (count( $check_type_arr) >1 ) TEA('6515');
            $data = [
                'rqt.id as template_id',
                'rqt.code as template_code',
                'rio.id as inspect_id',
                'rio.id as id',
                'rio.parent_id as parent_id',
                'rio.name as name',
                'rio.remark as remark',
                'rio.type as type',
                'rio.code as code'
            ];
            $select = DB::table($this->table.' as rqt')
                ->select($data)
                ->leftJoin('ruis_inspect_object as rio','rqt.check_inspect_id','=','rio.id')
                ->where('rqt.check_type_code',$check_type_arr[0])
                ->get();
            if(empty($select)) TEA('6507');
            $final_result['template']  = $select;

            //获取检验单的检验结果
            $first_id  =   $ids_arr[0];
            $check_res =   obj2array(DB::table($this->checkTable.' as check')
                            ->select('check.*','unit.name','unit.unit_text','unit.iso_code','unit.commercial')
                            ->leftJoin('ruis_uom_unit as unit','unit.id','=','check.unit')
                            ->where('check.id', $first_id)
                            ->first());
            $result_res  = obj2array(DB::table($this->resultTable)->select('*')->where('qc_check_id', $first_id)->get());
            $final_result['result_res']  = $result_res;
            $final_result['check_res']   = $check_res;
            return $final_result;
    }
//endregion
        /**
         * @message 寻找模板
         * @author  liming
         * @time    年 月 日
         */    
        private  function  find_type($parent_type_id)
        {
           $type_own_id  = 0;    //定义一个容器   默认值为0
           //找上一层父级
           $result =  DB::table($this->checkTypeTable)->select('parent_id')->where('id', $parent_type_id)->first();

           $parent_id  = $result->parent_id;
           $parent_result =  DB::table($this->checkTypeTable)->select('has_templete')->where('id', $parent_id)->first();
           if (!$parent_result) 
           {
              return $type_own_id;
           }
           if ($parent_result->has_templete == 1) 
           {   
              return  $parent_id;
           }
           else
           {
              return $this->find_type($result->parent_id);
           }
        }
        


//region 删
    public function deleteCheckItem($input)
    {

        try{
            //开启事务
            DB::connection()->beginTransaction();
            // 删除之前 获取 check_type
            $check_type  = DB::table($this->table)->select('check_type_code')->where('id','=',$input['template_id'])->first();
            $now_tem=DB::table($this->table)->where('id','=',$input['template_id'])->first();
            $teps = obj2array(DB::table($this->table.' as rqt')
                ->select('rqt.*','rio.id as check_inspect_id','rio.parent_id as parent_id')
                ->leftJoin('ruis_inspect_object as rio','rqt.check_inspect_id','=','rio.id')
                ->where('check_type_code','=',$now_tem->check_type_code)
                ->get());

            $this->deleteSon($now_tem->check_inspect_id,$teps);
            $delete = DB::table($this->table)->where('id','=',$input['template_id'])->delete();

            if(empty($delete)) TEA('6504');
            //判断条数是否为0
            $count  = DB::table($this->table)->where('check_type_code',$check_type->check_type_code)->count();
            if ($count<1) 
            {
                // 反写  check_type    has_templete
                $data = [
                   'has_templete' => 0 
                ];

                $upd  =  DB::table($this->checkTypeTable)->where('code',$check_type->check_type_code)->update($data);
                if($upd===false) TEA('804');  
            }
          }catch(\ApiException $e){
            //回滚
            DB::connection()->rollBack();
            TEA($e->getCode());
        }
        //提交事务
        DB::connection()->commit();
        return $delete;
    }

    public function deleteSon($id,$teps){

        foreach ($teps as $item){

            if($id == $item['parent_id']){
                DB::table($this->table)->where('id','=',$item['id'])->delete();
                $this->deleteSon($item['check_inspect_id'],$teps);
            }
        }
    }
//endregion
}