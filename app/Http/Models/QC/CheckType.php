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

class CheckType extends Base
{
    public function __construct()
    {
        $this->table='ruis_check_type';
    }
//region 检
//endregion
//region 增
    public function add($input)
    {
        try{
                //代码唯一性检测
                $has=$this->isExisted([['code','=',$input['code']]]);
                if($has) TEA('6213','code');
                //名称唯一性检测
                $has=$this->isExisted([['name','=',$input['name']]]);
                if($has) TEA('6212','name');

                //检验分类 种类唯一性检测
                $kindwhere  = [
                    'type_kind'=>$input['type_kind'],
                    'is_material_type'=>0,
                    'is_operation'=>0,
                ];
                $has=$this->isExisted($kindwhere);
                if($has) TEA('6218','type_kind');

                //判断是否合理
                if ($input['type_kind']  == 1)
                {
                 //如果是 iqc   则必须是    is_releva_operation != 1
                 if ( $input['is_releva_operation'] ==1) TEA('6219');

                }

                if ($input['type_kind']  == 2)
                {
                     //如果是 ipqc   则必须是  is_releva_type  != 1  
                     if ( $input['is_releva_type'] ==1) TEA('6220');

                }


                if ($input['type_kind']  == 3)
                {
                    //如果是oqc   则必须是    is_releva_operation = 0
                    if ( $input['is_releva_operation'] ==1) TEA('6221');
                }

                //开启事务
                 DB::connection()->beginTransaction();
                //获取添加数组,此处一定要严谨一些,否则前端传递额外字段将导致报错,甚至攻击
                $data=[
                        'code' => $input['code'],
                        'name' => $input['name'],
                        'parent_id' => $input['parent_id'],
                        'description' => $input['description'],
                        'material_type'  =>0,
                        'is_material_type'  =>0,
                        'is_operation'  =>0,
                        'is_releva_type'  =>$input['is_releva_type'],
                        'is_releva_operation'  =>$input['is_releva_operation'],
                        'type_kind'  =>$input['type_kind'],
                      ];
                $insert_id = DB::table($this->table)->insertGetId($data);
                if(empty($insert_id)) TEA('6503');
                // 判断 是否 加载物料分类
                if ($input['is_releva_type']  == 1) 
                {
                   //获取物料顶级分类
                   $ma_typelist  =obj2array(DB::table(config('alias.rmc'))->where('parent_id',0)->get());
                   foreach ($ma_typelist as $key => $value)
                   {
                    //递归新增每 一颗树
                    $result=  $this->save_son($insert_id,$value['id'],$input['code'],0,0,0,$input['type_kind']);
                   }
                }

                if ($input['is_releva_operation']  == 1) 
                {
                    //遍历添加所有的 大工序  operation  除了开始
                    $operation_list  =obj2array(DB::table(config('alias.rio'))->get());

                    // 剔除 工序 为开始  的默认
                    foreach ($operation_list as $key => $value) 
                    {   
                            //  如果 等于开始  则跳过该条
                            if ($value['name'] !='开始') 
                            {
                              $operation_data=[
                                        'code'       =>$input['code'].$value['code'],
                                        'name'       =>$value['name'],
                                        'parent_id'  =>$insert_id,
                                        'description' => '',
                                        'operation_id'  =>$value['id'],
                                        'is_operation'  =>1,
                                        'is_releva_operation'  =>0,
                                        'type_kind'  =>$input['type_kind'],
                                    ];
                                DB::table($this->table)->insertGetId($operation_data);
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
        return $insert_id;
    }
//endregion


//region 修
    public function edit($input)
    {
         try{
               
                $has=$this->isExisted([['code','=',$input['code']],[$this->primaryKey,'<>',$input['type_id']]]);
                if($has) TEA('6213','code');
                $original  =  obj2array( DB::table($this->table)->where('id','=',$input['type_id'])->first());
                $data=[
                        'code' => $input['code'],
                        'name' => $input['name'],
                        'parent_id' => $original['parent_id'],
                        'description' => $input['description'],
                        'material_type'  =>$original['material_type'],
                        'is_material_type'  =>$original['is_material_type'],
                        'is_releva_type'  =>$input['is_releva_type'],
                        'is_releva_operation'  =>$input['is_releva_operation'],
                        'type_kind'  =>$original['type_kind'],
                      ];

                DB::table($this->table)->where('id','=',$input['type_id'])->update($data);

                //  判断 是否物料分类
                if ($original['is_releva_type'] != $input['is_releva_type'])
                {
                    if ($input['is_releva_type']==1) 
                    {
                            //关联分类
                            $ma_typelist  =obj2array(DB::table(config('alias.rmc'))->where('parent_id',0)->get());

                            foreach ($ma_typelist as $key => $value)
                            {
                               $addresult=  $this->save_son($input['type_id'],$value['id'],$input['code'],$original['operation_id'],$original['is_operation'],$original['is_releva_operation'],$original['type_kind']);
                            }

                    }
                    else
                    {   
                            // 取消关联
                            $delresult=  $this->del_son($input['type_id']);
                    }
                }


                //  判断 是否工序分类
                if ($original['is_releva_operation'] != $input['is_releva_operation'])
                {
                    if ($input['is_releva_operation']==1) 
                    {
                        //遍历添加所有的 大工序  operation  除了开始
                        $operation_list  =obj2array(DB::table(config('alias.rio'))->get());

                        // 剔除 工序 为开始  的默认
                        foreach ($operation_list as $key => $value) 
                        {   
                            //  如果 等于开始  则跳过该条
                            if ($value['name'] !='开始') 
                            {
                              $operation_data=[
                                        'code'       =>$input['code'].$value['code'],
                                        'name'       =>$value['name'],
                                        'parent_id'  =>$input['type_id'],
                                        'description' => '',
                                        'operation_id'  =>$value['id'],
                                        'is_operation'  =>1,
                                        'is_releva_operation'  =>0,
                                        'type_kind'  =>2,
                                    ];
                               //判断自己有没有模板
                                $own_code  = $input['code'].$value['code'];
                                $has =  DB::table('ruis_qc_template')->where('check_type_code',$own_code)->first();
                                if ($has) 
                                {
                                  $operation_data['has_templete'] = 1;
                                } 
                                DB::table($this->table)->insertGetId($operation_data);
                            }
                        }
                    }
                    else
                    {   
                            // 取消关联
                            // 获取所有的第一层子集
                            $son_operations  =obj2array(DB::table($this->table)->where('parent_id',$input['type_id'])->get());

                            foreach ($son_operations as  $son_operation) 
                            {
                               //删除之前 先删除 儿子
                                $delresult=  $this->del_son($son_operation['id']);
                                // 删除自己
                               $deleted_id  =  $this->destroyById($son_operation['id']);
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
        return $input['type_id'];
    }
//endregion

    // 同步物料分类
    public  function  save_son($insert_id,$parent_id,$father_code,$father_operation,$is_operation,$is_releva_operation,$kind)
    {
        //保存自己
        $ownself  =obj2array(DB::table(config('alias.rmc'))->where('id',$parent_id)->first());
        $owndata=[
                'code'       =>$father_code.$ownself['code'],
                'name'       =>$ownself['name'],
                'parent_id'  =>$insert_id,
                'description' => '',
                'material_type'  =>$ownself['id'],
                'is_material_type'  =>1,
                'is_releva_type'  =>0,
                'operation_id'  =>$father_operation,
                'is_operation'  =>$is_operation,
                'is_releva_operation'  =>$is_releva_operation,
                'type_kind'  =>$kind,
            ];
        //判断自己有没有模板
        $has =  DB::table('ruis_qc_template')->where('check_type_code',$father_code.$ownself['code'])->first();
        if ($has) 
        {
          $owndata['has_templete'] = 1;
        }    
        $store_id=DB::table($this->table)->insertGetId($owndata);
        // 获取所以的 子集
        $sons  =obj2array(DB::table(config('alias.rmc'))->where('parent_id',$parent_id)->get());

        foreach ($sons as $key => $value)
        {
            $result=  $this->save_son($store_id,$value['id'],$owndata['code'],$owndata['operation_id'],$owndata['is_operation'],$owndata['is_releva_operation'],$owndata['type_kind']);
        }
        return  TRUE;
    }

    // 删除物料分类
    public  function  del_son($parent_id)
    {
        $where = [
            'parent_id' =>  $parent_id,
            'is_material_type' =>  1,
        ]; 
        $cateId = obj2array(DB::table($this->table)->where($where)->get());
        foreach ($cateId as $key => $value)
        {
          $temp_id  = $value['id'];
          $num=$this->destroyById($temp_id);
          $result=  $this->del_son($temp_id);
        }
        return  TRUE;
    }

//region 查
    public function select()
    {
        $select = DB::table($this->table)->select(
            'id','id as type_id','code as code','name as name','parent_id as parent_id','description as description'
        )->get();
        if(empty($select)) TEA('6505');//报删除失败
        return $select;
    }
    public function templateList($input)
    {
        !empty($input['name']) &&  $where[]=['name','like','%'.$input['name'].'%']; //code
        $select = DB::table($this->table)->select(
            'id','id as type_id','code as code','name as name','parent_id as parent_id','description as description'
        )
            ->where($where)
            ->get();
        if(empty($select)) TEA('6505');//报删除失败
        return $select;
    }


    public function viewType($input)
    {
        $insert_id = DB::table($this->table)->select('*','id as type_id')->where('id','=',$input['type_id'])->get();
        if(empty($insert_id)) TEA('6506');
        return $insert_id;
    }
//endregion
    /**
     * @message 删除检验分类 
     * @author  liming
     * @time    年 月 日
     */    
    public function deleteType($input)
    {
        //  删除分类之前 先删除子集
        $delresult=  $this->del_all_son($input['type_id']);   

        $delete_id = DB::table($this->table)->where('id','=',$input['type_id'])->delete();
        if(empty($delete_id)) TEA('6504');
        return $delete_id;
    }


    // 删除所有的子集
    public  function  del_all_son($parent_id)
    {
        $where = [
            'parent_id' =>  $parent_id
        ]; 
        $cateId = obj2array(DB::table($this->table)->where($where)->get());
        foreach ($cateId as $key => $value)
        {
          $temp_id  = $value['id'];
          $num=$this->destroyById($temp_id);
          $result=  $this->del_all_son($temp_id);
        }
        return  TRUE;
    }

}