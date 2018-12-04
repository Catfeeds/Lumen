<?php
/**
 * Created by PhpStorm.
 * User: wangguangyang
 * Date: 2018/2/9
 * Time: 14:19
 */
namespace App\Http\Models\QC;
use App\Http\Models\Base;
use Illuminate\Support\Facades\DB;

use App\Http\Models\QC\CheckItemResult;
use App\Http\Models\SapApiRecord;
use App\Libraries\Soap;

class Check extends Base
{

    protected $connection = 'mysql';

    public function __construct()
    {
        $this->table='ruis_qc_check';
        $this->typeTable='ruis_check_type';
        $this->materialTable='ruis_material';
        $this->productionOrderTable='ruis_production_order';
        $this->factoryTable='ruis_factory';
        $this->materialAttributeTable='material_attribute';
        $this->operationTable='ruis_ie_operation';


         //定义表别名
        $this->aliasTable=[
            'qcheck'=>$this->table.' as qcheck',
            'checkType'=>$this->typeTable.' as checkType',
            'material'=>$this->materialTable.' as material',
            'productionOrder'=>$this->productionOrderTable.' as productionOrder',
            'factory'=>$this->factoryTable.' as factory',
            'operation'=>$this->operationTable.' as operation',
        ];


    }

//region 检

//endregion

//region 修
//修改检验
    /**
     *选择模板
     *selectTemplate
     */
    public function selectTemplate($input)
    {
        try{
            //开启事务
            DB::connection()->beginTransaction();
            $data = ['check_type' => $input['check_type']];
            DB::table($this->table)->where('id','=',$input['check_id'])->update($data);
        }catch(\ApiException $e){
            //回滚
            DB::connection()->rollBack();
            TEA($e->getCode());
        }
        //提交事务
        DB::connection()->commit();
        return $input['check_id'];
    }

    //查看检验模板
    public  function   showTemplate($id)
    {
       $data = [
            'checkType.*',
            'qcheck.id  as   check_id'
        ];
        $obj = DB::table($this->aliasTable['qcheck'])
            ->select($data)
            ->leftJoin($this->aliasTable['checkType'], 'checkType.id', '=', 'qcheck.check_type')
            ->where("qcheck.$this->primaryKey",'=',$id)
            ->first();
        if (!$obj) TEA('404');
        return $obj;
    }

    /**
     * IQC检验
     *
     * @todo 临时修改：注释推送&状态更改
     * @param $input
     * @return int
     * @throws \App\Exceptions\ApiException
     */
    public function checkMore($input)
    {
        $input['creator_id'] = (!empty(session('administrator')->admin_id)) ? session('administrator')->admin_id : 0;
        $creator_id=$input['creator_id'];

        $data=[
            'dispose'             =>$input['dispose'],
            'result'              =>isset($input['check_result'])?$input['check_result']:'',
            'unit'                =>isset($input['unit_id'])?$input['unit_id']:'',
            'question_description'=>$input['question_description'],
            'deadly'              =>$input['deadly'],
            'seriousness'         =>$input['seriousness'],
            'slight'              =>$input['slight'],
            'dispose_ideas'       =>$input['dispose_ideas'],
            'missing_items'       =>$input['missing_items'],
            'scene'               =>$input['scene'],
            'check_time'          => time(),
            'department_id'       =>isset($input['department'])?$input['department']:'',
        ];

        try{
            //开启事务
            DB::connection()->beginTransaction();
            //判断模板是否一致
            $template = [];
            foreach (json_decode($input['check_choose']) as $value) 
            {
                $result  =   DB::table($this->table)->select('check_type')->where('id',$value->check_id)->first();
                $template[] =  $result->check_type;
            }

            $temp_arr = array_unique($template);
            if (count($temp_arr)>1) TEA('6214');

            foreach (json_decode($input['check_choose']) as $check)
            {
                // 判断 是否已经推送检验 结果  如果推送过 则不能再次进行检验
                $statu  =  DB::table($this->table)->select('status')->where('id',$check->check_id)->first();
                if ($statu->status  == 2) TEA('6217');

                if (!is_null($data['result'])) 
                {
                     // 更新 检验单状态
                     $statusdata = ['status'  => 1,'man_check'=>1,'checker'=>$creator_id];
                     DB::table($this->table)->where('id',$check->check_id)->update($statusdata);
                }
                DB::table($this->table)->where('id',$check->check_id)->update($data);

                $c= new CheckItemResult();
                $c->add($input);

                $type =   DB::table($this->table)->where('id',$check->check_id)->select('check_resource')->first();
                if ($input['check_result'] == 0 && $type->check_resource == 1) {
                    $check_id = [];
                    $check_id['check_id'] = $check->check_id;
                    $resp = $this->pushInspectOrder($check_id);
                    //如果推送成功，则更新状态
                    if (isset($resp['SERVICERESPONSE']) && isset($resp['SERVICERESPONSE']['RETURNCODE']) && $resp['SERVICERESPONSE']['RETURNCODE'] == 0) {
                        $this->updatePushStatus($check_id);
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
        return 1;
    }
//endregion

//region 查
//查看检验
    public function viewCheck($input)
    {
        $select = DB::table($this->table)->select('*')->where('id','=',$input['check_id'])->get();
        $c= new CheckItemResult();
        $items=$c->view($input['check_id']);
        $select[0]->items = $items;
        return $select;
    }
//检验列表
    public function select(&$input)
    {
        $data  = [
            'qcheck.*',
            'checkType.name as type_name',
            'checkType.code as type_code',
            'material.name as materialName',
            'material.item_no as material_code',
            'material.description as materialDescription',
            'productionOrder.id as po_id',
            'productionOrder.number as po_number',
            'productionOrder.sales_order_code as sales_order_code',
            'productionOrder.sales_order_project_code as sales_order_project_code',
            'operation.id as operation_id',
            'operation.name as operation_name',
            'factory.id as factory_id',
            'factory.name as factory_name',
            'factory.code as factory_code',
            'unit.commercial  as  unit_commercial',
            'unit.id  as  unit_id',
            'admin.id  as  admin_id',
            'admin.name  as  admin_name',
            'employee.id  as  employee_id',
            'employee.name  as  employee_name',
            'employee.card_id  as  card_id',
            'pro_factory.id as pro_factory_id',
            'pro_factory.name as pro_factory_name',
            'pro_factory.code as pro_factory_code'
        ];

        $where = $this->_search($input);
        $builder=DB::table($this->aliasTable['qcheck'])
            ->leftJoin('ruis_rbac_admin  as admin', 'admin.id', '=', 'qcheck.checker')
            ->leftJoin('ruis_employee  as employee', 'employee.id', '=', 'admin.employee_id')
            ->leftJoin($this->aliasTable['checkType'], 'qcheck.check_type', '=', 'checkType.id')
            ->leftJoin($this->aliasTable['material'], 'qcheck.material_id', '=', 'material.id')
            ->leftJoin($this->aliasTable['productionOrder'], 'qcheck.production_order_id', '=', 'productionOrder.id')
            ->leftJoin($this->aliasTable['factory'], 'qcheck.WERKS', '=', 'factory.code')
            ->leftJoin('ruis_factory as  pro_factory', 'pro_factory.id', '=', 'productionOrder.factory_id')
            ->leftJoin($this->aliasTable['operation'], 'operation.id', '=', 'qcheck.operation_id')
            ->leftJoin('ruis_uom_unit as  unit', 'unit.id', '=', 'qcheck.unit')
            ->offset(($input['page_no']-1)*$input['page_size'])
            ->limit($input['page_size'])
            ->orderBy($input['sort'],$input['order'],'LGFSB','desc')
            ->select($data)
            ->where($where);
        if (isset($input['check_resource']) && $input['check_resource']== 1) 
        {
            $LGFSB = [];
            if (!empty($input['LGFSB'])) 
            {
               $LGFSB[]=$input['LGFSB'];
                $LGFSB[]='';
                $builder->wherein('qcheck.LGFSB',$LGFSB);
            }
        }
        $obj_list = $builder->get();
        // pd($obj_list);
        foreach ($obj_list as $item){
            //判断是否已经 超过12小时
             $timediff =time()-$item->ctime;
             $hours = intval($timediff/3600);
             if ($hours > 12  &&  is_null($item->result)) 
             {
                $item->sign = 'red' ;
             }
             else
             {
                $item->sign = 'green' ;
             }

            if ($item->ctime > 0) 
            {
                 $item->ctime = date("Y-m-d H:i:s",$item->ctime);
            }
            else
            {
                $item->ctime ='';
            }
            if ($item->check_time > 0) 
            {
                $item->check_time = date("Y-m-d H:i:s",$item->check_time);
            }
            else
            {
                $item->check_time ='';
            }
        }
        //总共有多少条记录
        $total_builder =DB::table($this->table.' as qcheck')
                     ->leftJoin($this->aliasTable['checkType'], 'qcheck.check_type', '=', 'checkType.id')
                     ->leftJoin($this->aliasTable['material'], 'qcheck.material_id', '=', 'material.id')
                     ->leftJoin($this->aliasTable['productionOrder'], 'qcheck.production_order_id', '=', 'productionOrder.id')
                     ->leftJoin($this->aliasTable['factory'], 'qcheck.WERKS', '=', 'factory.code')
                     ->leftJoin('ruis_factory as  pro_factory', 'pro_factory.id', '=', 'productionOrder.factory_id')
                     ->leftJoin($this->aliasTable['operation'], 'operation.id', '=', 'qcheck.operation_id')
                     ->leftJoin('ruis_uom_unit as  unit', 'unit.id', '=', 'qcheck.unit')
                     ->where($where);
        if (isset($input['check_resource']) && $input['check_resource']== 1) 
        {
            $LGFSB = [];
            if (!empty($input['LGFSB'])) 
            {
               $LGFSB[]=$input['LGFSB'];
                $LGFSB[]='';
                $builder->wherein('qcheck.LGFSB',$LGFSB);
            }
        }           
        $input['total_records']=$total_builder->count();
        return $obj_list;
    }
    //检验列表
    public function dropdownSelect(&$input)
    {
        !empty($input['id']) &&  $where[]=['id','like','%'.$input['id'].'%']; //id
        !empty($input['code']) &&  $where[]=['code','like','%'.$input['code'].'%']; //code
        $builder = DB::connection($this->connection)->table($this->table)
            ->select('id','code');
        if (!empty($where)) $builder->where($where);
        //get获取接口
        $obj_list = $builder->get();
        return $obj_list;
    }
//endregion
//region 删
//endregion
    /**
     * @todo 业务处理
     * @param $input
     * @return arraygit
     * @throws \App\Exceptions\ApiException
     * @throws \App\Exceptions\ApiSapException
     */
    public function syncInspectOrder($input)
    {
        $ApiControl = new SapApiRecord();
        $ApiControl->store($input);
        /**
         * @todo 业务处理
         * 如果有异常,直接 TESAP('code',$params='',$data=null)
         */
        foreach ($input['DATA'] as $key => $value) {
            $keyVal = [
                'WMASN' => get_value_or_default($value,'WMASN'),
                'EBELP' => get_value_or_default($value,'EBELP'),
                'EBELN' => get_value_or_default($value,'EBELN'),
                'DHDAT' => strtotime(get_value_or_default($value,'DHDAT')),
                'GRQTY' => get_value_or_default($value,'GRQTY'),
                'MATNR' => get_value_or_default($value,'MATNR'),
                'NAME1' => get_value_or_default($value,'NAME1'),
                'LIFNR' => get_value_or_default($value,'LIFNR'),
                'WERKS' => get_value_or_default($value,'WERKS'),
                'VBELN' => get_value_or_default($value,'VBELN'),
                'VBELP' => get_value_or_default($value,'VBELP'),
                'check_resource' => 1,
                'ctime' => time(),
               ];
            $material_code=preg_replace('/^0+/','',$keyVal['MATNR']);
            $realmaterial_id  = DB::table($this->materialTable)
                              ->select('id')
                              ->where('item_no',$material_code)
                              ->first();
            $keyVal['material_id'] = isset($realmaterial_id->id)?$realmaterial_id->id:'';
            //根据物料 和 工厂 查找采购存储地址  和生产  存储地址
            $marc_where=[
                'material_id'=>$keyVal['material_id'],
                'WERKS'=>$keyVal['WERKS']
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
            $keyVal['order_number'] = $keyVal['GRQTY'];
            // // 根据 单子数量自动 填充检验数量
            $qty  = $keyVal['GRQTY'];
            $qc_checkqty_rules = config('app.qc_checkqty_rule');
            //判断数量在哪个区间
            $amount_of_inspection = 0;
            foreach ($qc_checkqty_rules as $k=> $qc_checkqty_rule) 
            {
                if ($qty>=$qc_checkqty_rule['min']  &&  $qty<=$qc_checkqty_rule['max']) 
                {
                    if ($k == 'own') 
                    {
                        $amount_of_inspection  = $qty;
                    }
                    else
                    {
                        $amount_of_inspection  = $k;
                    }
                    break;
                }
            }
            $keyVal['amount_of_inspection'] = $amount_of_inspection;
            if ($keyVal['material_id']>0) 
            {
                //获取  物料属性
                $temp = [];   // 定义一个临时空数组
                $attr ='';   // 定义一个空字符串，用来存物料属性      
                $vaules  = DB::table($this->materialAttributeTable)->select('value')->where('material_id',$keyVal['material_id'])->get();
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
            else
            {
                $keyVal['attr'] ='';
            }

            // 处理检验单号
            // 当前时间  
            $nowtime  =  date("YmdHis",time());
            $round_no  = rand(10,99);
            $keyVal['code'] = 'iqc'.$nowtime.$round_no;  // 检验单号 iqc开头 + 时间+两位随机数字
            DB::table($this->table)->insertGetId($keyVal);
        }
        return [];
    }

    /**
     * @message 添加ipqc检验单
     * @author  liming
     * @time    年 月 日
     */    
    public  function   addIpqc($id)
    {
        //$id 为工单id  获取工单信息
        $workOrder_res =  DB::table('ruis_work_order')->select('*')->where('id',$id)->first();
        if (!$workOrder_res) TEA('9521');
        $production_order_id=$workOrder_res->production_order_id;
        $wo_number=$workOrder_res->number;
        $work_order_id = $id;
        $out_material  =  json_decode($workOrder_res->out_material,true);
        $material_id  = $out_material[0]['material_id'];
        $item_no  = $out_material[0]['item_no'];
        $unit  = $out_material[0]['unit_id'];
        $operation_id  = $workOrder_res->operation_id;
        $attr = '';
        $order_number =$out_material[0]['qty'];
        if (count($out_material[0]['material_attributes'])>0)
        {   
            foreach ($out_material[0]['material_attributes'] as $key => $value)
            {
                $attr.=$value['name'];
                $attr.=$value['value'];
            }
        }

        $check_resource = 2;
        $check_time =time();
        $ctime =time();
        // 处理检验单号
        // 当前时间  
        $nowtime  =  date("YmdHis",time());
        $round_no  = rand(0,9);
        $keyVal['material_id'] = $material_id; 
        $keyVal['MATNR'] = $item_no; 
        $keyVal['check_time'] = $check_time;  
        $keyVal['order_number'] =$order_number; 
        $keyVal['ctime'] = $ctime;  
        $keyVal['attr'] = $attr; 
        $keyVal['operation_id'] = $operation_id ; 
        $keyVal['unit'] = $unit ; 
        $keyVal['code'] = 'ipqc'.$nowtime.$round_no;  // 检验单号 ipqc开头 + 时间+两位随机数字
        $keyVal['check_resource'] = $check_resource;  
        $keyVal['work_order_id'] =$work_order_id; 
        $keyVal['production_order_id'] =$production_order_id;  
        $keyVal['wo_number'] =$wo_number;
        $insert_id=DB::table($this->table)->insertGetId($keyVal);
        if(!$insert_id) TEA('802');
        return  $insert_id;
    }


    /**
     * @message  推送检验结果 给sap
     * @author  liming
     * @time    2018年 8月 14日
     */    
     public  function   pushInspectOrder($input) 
     { 

        //获取  检验状态
        $statu =  DB::table($this->table)->select('status')->where('id',$input['check_id'])->first();

        if ($statu->status >1) TESAP('6225');
        $result =[];
        //获取数据
        $temp_data = obj2array( DB::table($this->table)->where('id',$input['check_id'])->first());
        $temp_arr  = [];

        $temp_arr['NAME1']= $temp_data['NAME1'];
        $temp_arr['MATNR']= $temp_data['MATNR'];
        $temp_arr['GRQTY']= $temp_data['GRQTY'];
        $temp_arr['DHDAT']= date("Ymd",time());
        $temp_arr['WMASN']= $temp_data['WMASN'];
        $temp_arr['EBELN']= $temp_data['EBELN'];
        $temp_arr['EBELP']= $temp_data['EBELP'];

        $temp_arr['MES_INS_RATIO']= $temp_data['reject_ratio'];
        $temp_arr['MES_INS_DESCRIPTION']= $temp_data['question_description'];
        $temp_arr['MES_INS_CODE']= $temp_data['code'];
        $temp_arr['MES_INS_TIME']= date("YmdHis",$temp_data['check_time']);

        if ($temp_data['result']  == 1) 
        {
            //检查检验结果  
            $status_result  =  DB::table($this->table)->select('result','audit_status')->where('id',$input['check_id'])->first();
            if ($status_result->result ==1  && $status_result->audit_status ==0) 
            {
                TESAP('6222');
            }
            $temp_arr['MES_INS_RESULT']= 'Y2';
        }
        
        if ($temp_data['result']  == 0 && !is_null($temp_data['result'])) 
        {
            $temp_arr['MES_INS_RESULT']= 'Y1';
        }

        if (is_null($temp_data['result'])) 
        {
            TESAP('6226');
            $temp_arr['MES_INS_RESULT']= '';
        }
        $result[] =  $temp_arr;
        $response  =  Soap::doRequest($result,'INT_MM002200002','0002');       //接口名称     //系统序号
        return $response;
     }

     /**
      * @message 设置检验数量
      * @author  liming
      * @time    年 月 日
      */    
    public function setCheckQty($input)
    {
         try{
            //开启事务
            DB::connection()->beginTransaction();

            //修改之前判断   检验单状态
            $statu  =  DB::table($this->table)->select('status')->where('id',$input['check_id'])->first();
            if ($statu->status>0) TEA('6215');

            $data = [
                 'amount_of_inspection'  => $input['amount_of_inspection']
            ];

            $upd=DB::table($this->table)->where('id',$input['check_id'])->update($data);
            if($upd===false) TEA('804');
        }catch(\ApiException $e){
            //回滚
            DB::connection()->rollBack();
            TEA($e->getCode());
        }
        //提交事务
        DB::connection()->commit();
        return $input['check_id'];
    }


    /**
      * @message 更改 检验单 状态
      * @author  liming
      * @time    年 月 日
      */    
    public function updatePushStatus($input)
    {
         try{
            //开启事务
            DB::connection()->beginTransaction();

            //反写 检验单状态  
            $data = ['status'  => 2];
            $upd=DB::table($this->table)->where('id',$input['check_id'])->update($data);
            if($upd===false) TEA('804');
        }catch(\ApiException $e){
            //回滚
            DB::connection()->rollBack();
            TEA($e->getCode());
        }
        //提交事务
        DB::connection()->commit();
        return $input['check_id'];
    }


    /**
     * 审核
     * @param $input   array   input数组
     * @throws \Exception
     * @author    liming
     */
    public function audit($input)
    {
        $id   = $input['id'];
        $result  =  DB::table($this->table)->select('audit_status')->where('id',$id)->first();
        if ($result->audit_status == 1) TEA('6223');

        //获取编辑数组
        $data=[
            'audit_status'=>1,
        ];
        try{
            //开启事务
            DB::connection()->beginTransaction();
            //改变状态
            $upd=DB::table($this->table)->where('id',$id)->update($data);
            if($upd===false) TEA('804');

        }catch(\ApiException $e){
            //回滚
            DB::connection()->rollBack();
            TEA($e->getCode());
        }
        //提交事务
        DB::connection()->commit();
        return $id;
    }


    /**
     * 反审核
     * @param $input   array   input数组
     * @throws \Exception
     * @author    liming
     */
    public function noaudit($input)
    {
        $id   = $input['id'];
        $result  =  DB::table($this->table)->select('audit_status')->where('id',$id)->first();
        if ($result->audit_status == 0) TEA('6224');
        //获取编辑数组
        $data=[
            'audit_status'=>0,
        ];

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
        return $id;
    }


    /**
     * 搜索
     */
    private function _search(&$input)
    {
        $where = array();
        if (isset($input['check_type']) && $input['check_type']) {
            $where[]=['qcheck.check_type','like','%'.$input['check_type'].'%'];
        }

        if (isset($input['WMASN']) && $input['WMASN']) {
            $where[]=['qcheck.WMASN','like','%'.$input['WMASN'].'%'];
        }

        if (isset($input['LGPRO']) && $input['LGPRO']) {
            $where[]=['qcheck.LGPRO','like','%'.$input['LGPRO'].'%'];
        }

        if (isset($input['code']) && $input['code']) {
            $where[]=['qcheck.code','like','%'.$input['code'].'%'];
        }

        if (isset($input['check_type_code']) && $input['check_type_code']) {
            $where[]=['qcheck.check_type_code','=',$input['check_type_code']];
        }

        if (isset($input['material_name']) && $input['material_name']) {
            $where[]=['material.name','like','%'.$input['material_name'].'%'];
        }

        if (isset($input['factory_name']) && $input['factory_name']) {
            $where[]=['factory.name','like','%'.$input['factory_name'].'%'];
        }

        if (isset($input['operation_name']) && $input['operation_name']) {
            $where[]=['operation.name','like','%'.$input['operation_name'].'%'];
        }

        if (isset($input['operation_id']) && $input['operation_id']) {
            $where[]=['operation.id','=',$input['operation_id']];
        }

        if (isset($input['start_time']) && $input['start_time']) {//根据创建时间
            $where[]=['qcheck.ctime','>=',strtotime($input['start_time'])];
        }
        if (isset($input['end_time']) && $input['end_time']) {//根据创建时间
            $where[]=['qcheck.ctime','<=', strtotime($input['end_time'])];
        }

        if (isset($input['check_resource']) && $input['check_resource']) 
        {
            $where[]=['qcheck.check_resource','=',$input['check_resource']];
        }
        else
        {
            TEA('6525');
        }

        if ($input['check_resource'] == 1) 
        {
            // 如果是iqc
            if (isset($input['check_status']) && $input['check_status']) 
            {
                if ($input['check_status'] == 1) 
                {
                    //如果是没有推送
                    //order  (多order的情形,需要多次调用orderBy方法即可)
                    if (empty($input['order']) || empty($input['sort'])) 
                    {
                        $input['order']='asc';$input['sort']='ctime';
                    } 
                }

                if ($input['check_status'] == 2) 
                {
                    //如果已经推送
                    //order  (多order的情形,需要多次调用orderBy方法即可)
                    if (empty($input['order']) || empty($input['sort'])) 
                    {
                        $input['order']='desc';$input['sort']='ctime';
                    } 
                }

                $where[]=['qcheck.status','=',$input['check_status']];
            }
            else
            {
                //order  (多order的情形,需要多次调用orderBy方法即可)
                if (empty($input['order']) || empty($input['sort'])) 
                {
                    $input['order']='asc';$input['sort']='ctime';
                } 
                $where[]=['qcheck.status','<',2];
            }
        }

        if ($input['check_resource'] == 2) 
        {
            //如果 是ipqc
            if (isset($input['man_check']) && $input['man_check']) 
            {
                if ($input['man_check'] == 0) 
                {
                    //如果没有人工检验
                    //order  (多order的情形,需要多次调用orderBy方法即可)
                    if (empty($input['order']) || empty($input['sort'])) 
                    {
                        $input['order']='asc';$input['sort']='ctime';
                    } 
                }

                if ($input['man_check'] == 1) 
                {
                    //如果已经人工检验
                    //order  (多order的情形,需要多次调用orderBy方法即可)
                    if (empty($input['order']) || empty($input['sort'])) 
                    {
                        $input['order']='desc';$input['sort']='ctime';
                    } 
                }
                $where[]=['qcheck.man_check','=',$input['man_check']];
            }
            else
            {
                //order  (多order的情形,需要多次调用orderBy方法即可)
                if (empty($input['order']) || empty($input['sort'])) 
                {
                    $input['order']='asc';$input['sort']='ctime';
                } 
                $where[]=['qcheck.man_check','=',0];
            }
        }


        if ($input['check_resource'] == 3) 
        {
            //如果 是ipqc
            if (isset($input['man_check']) && $input['man_check']) 
            {
                if ($input['man_check'] == 0) 
                {
                    //如果没有人工检验
                    //order  (多order的情形,需要多次调用orderBy方法即可)
                    if (empty($input['order']) || empty($input['sort'])) 
                    {
                        $input['order']='asc';$input['sort']='ctime';
                    } 
                }

                if ($input['man_check'] == 1) 
                {
                    //如果已经人工检验
                    //order  (多order的情形,需要多次调用orderBy方法即可)
                    if (empty($input['order']) || empty($input['sort'])) 
                    {
                        $input['order']='desc';$input['sort']='ctime';
                    } 
                }
                $where[]=['qcheck.man_check','=',$input['man_check']];
            }
            else
            {
                //order  (多order的情形,需要多次调用orderBy方法即可)
                if (empty($input['order']) || empty($input['sort'])) 
                {
                    $input['order']='asc';$input['sort']='ctime';
                } 
                $where[]=['qcheck.man_check','=',0];
            }
        }











        return $where;
    }

}