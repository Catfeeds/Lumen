<?php
/**
 * Created by PhpStorm.
 * User: ruiyanchao
 * Date: 2018/2/6
 * Time: 上午10:55
 */

namespace App\Http\Models;//定义命名空间
use Illuminate\Support\Facades\DB;
use App\Http\Models\Material\Material;
/**
 * 生产订单操作类
 * @author  rick
 * @time    2018年02月06日10:56:18
 */
class ProductOrder extends Base
{

    /**
     * 前端传递的api主键名称
     * @var string
     */
    public $apiPrimaryKey = 'product_order_id';

    public function __construct()
    {
        parent::__construct();
        $this->table = config('alias.rpo');
    }

    public function getRules()
    {
        return array(

            'product_id'   => array('name'=>'product_id','type'=>'int','require'=>true,'on'=>'add','desc'=>'物料ID'),
            'qty'   => array('name'=>'qty','type'=>'int','require'=>true,'on'=>'add','desc'=>'数量'),
            'scrap'   => array('name'=>'scrap','type'=>'float','require'=>true,'on'=>'add','desc'=>'废料'),
            'start_date'   => array('name'=>'start_date','type'=>'string','require'=>true,'on'=>'add','desc'=>'开始时间'),
            'end_date'   => array('name'=>'end_date','type'=>'string','require'=>true,'on'=>'add','desc'=>'结束时间'),

        );
    }

    public function getProductOrderList(&$input)
    {
        //这里事实上前端展示的是物料名称 查询字段从item_no改为name time=>2018-07-30 operator=>Bruce.Chu
        !empty($input['item_no']) &&  $where[]=['a2.name','like','%'.$input['item_no'].'%'];
        !empty($input['admin_name']) &&  $where[]=['a3.name','like','%'.$input['admin_name'].'%'];
        !empty($input['status']) &&  $where[]=['a1.status','=',$input['status']];
        !empty($input['sales_order_code']) &&  $where[]=['a1.sales_order_code','=',$input['sales_order_code']];
        !empty($input['number']) &&  $where[]=['a1.number','=',$input['number']];
        !empty($input['start_date']) && $where[] = ['a1.start_date','>=',strtotime($input['start_date'])];
        !empty($input['end_date']) && $where[] = ['a1.end_date','<=',strtotime($input['end_date'])];
        $builder = DB::table($this->table.' as a1')
            ->select('a1.id as product_order_id',
                'a1.ctime',
                'a1.number',
                'a3.name as admin_name',
                'a1.status',
                'a2.name as material_name',
                'a2.item_no',
                'a1.qty',
                'a1.scrap',
                'a1.start_date',
                'a1.end_date',
                'description',
                'a1.sales_order_code'
            )
            ->leftJoin(config('alias.rrad').' as a3','a3.id','=','a1.creator_id')
            ->leftJoin(config('alias.rm').' as a2','a2.id','=','a1.product_id')
            ->offset(($input['page_no']-1)*$input['page_size'])
            ->limit($input['page_size']);

        if (!empty($where)) $builder->where($where);
        //order  (多order的情形,需要多次调用orderBy方法即可)
        if (!empty($input['order']) && !empty($input['sort'])) $builder->orderBy( 'a1.'.$input['sort'],$input['order']);
        //get获取接口
        $obj_list = $builder->get();
        foreach($obj_list as $key=>&$value){
            $value->ctime=date('Y-m-d H:i:s',$value->ctime);
            $value->start_date=date('Y-m-d',$value->start_date);
            $value->end_date=date('Y-m-d',$value->end_date);
        }
        //总共有多少条记录
        $count_builder= DB::table($this->table.' as a1');
        if (!empty($where)) $count_builder
            ->leftJoin(config('alias.rrad').' as a3','a3.id','=','a1.creator_id')
            ->leftJoin(config('alias.rm').' as a2','a2.id','=','a1.product_id')
            ->where($where);
        $input['total_records']=$count_builder->count();
        return $obj_list;
    }

    /**
     * PO排产信息
     * @param $input
     * @return mixed
     * @author Bruce.Chu
     */
    public function getProductOrderScheduleList(&$input)
    {
        //过滤未发布订单
        $where = [];
        $order_mode = 'a1.ctime';
        $desc = 'acs';
        if(!empty($input['order_mode'])){
            switch ($input['order_mode']) {
                case '1':
                    $order_mode = 'a1.end_date';
                    $desc = 'acs';
                    break;
                case '2':
                    $order_mode = 'a1.start_date';
                    $desc = 'acs';
                    break;
                case '3':
                    $order_mode = 'a1.priority';
                    $desc = 'desc';
                    break;
                default:
                    $order_mode = 'a1.end_date';
                    $desc = 'acs';
            }
        }
        $where[] = ['a1.is_delete', '=', 0];//订单状态未删除
        is_numeric($input['status'])  && $where[] = ['a1.status', '=', $input['status']] ;//订单状态
        !empty($input['number']) && $where[] = ['a1.number', '=', $input['number']];//生产订单号
        !empty($input['priority']) && $where[] = ['a1.priority', '=', $input['priority']];//优先级
        !empty($input['start_date']) && $where[] = ['a1.start_date', '>=', strtotime($input['start_date'])];//订单开始时间
        !empty($input['end_date']) && $where[] = ['a1.end_date', '<=', strtotime($input['end_date'])];//订单结束时间
        !empty($input['sales_order_code']) &&  $where[]=['a1.sales_order_code','=',$input['sales_order_code']];//销售订单
        !empty($input['sales_order_project_code']) &&  $where[]=['a1.sales_order_project_code','=',$input['sales_order_project_code']];//销售订单行项目号
        //按员工档案那配置的生产单元，按厂对po进行划分
        $admin_id = session('administrator')->admin_id;
        $admin_is_super = session('administrator')->superman;
        $where2=[['re.admin_id','=',$admin_id]];
        $emploee_info = DB::table(config('alias.re'). ' as re')
            ->select('re.id', 're.factory_id', 're.workshop_id')
            ->where($where2)
            ->first();
        if(!empty($emploee_info)){
            if($admin_is_super != 1 && $emploee_info->factory_id != 0){
                $where[] = ['a1.factory_id', '=', $emploee_info->factory_id];//区分到厂
            }
        }

        $obj_list = DB::table($this->table . ' as a1')
            ->select('a1.id as product_order_id',
                'a1.number',
                'a2.item_no',
                'a2.name as material_name',
                'a1.sales_order_code',
                'a1.sales_order_project_code',
                'a1.start_date',
                'a1.end_date',
                'a1.priority',
                'a1.ctime',
                'a1.status',
                'a1.on_off',
                'a1.qty',
                'a4.name as unit_name'
            )
            ->leftJoin(config('alias.rrad') . ' as a3', 'a3.id', '=', 'a1.creator_id')
            ->leftJoin(config('alias.rm') . ' as a2', 'a2.id', '=', 'a1.product_id')
            ->leftJoin(config('alias.ruu') . ' as a4', 'a4.id', '=', 'a1.unit_id')
            ->offset(($input['page_no'] - 1) * $input['page_size'])
            ->limit($input['page_size'])
            ->where($where)
            //排序优先级 结束时间升序 开始时间升序 优先级降序
            ->orderBy($order_mode, $desc)
            ->orderBy('a1.ctime', 'desc')
            ->get();
        //格式转换 添加字段
        foreach ($obj_list as $key => &$value) {
            $value->start_date = date('Y-m-d', $value->start_date);//订单开始时间
            $value->end_date = date('Y-m-d', $value->end_date);//订单结束时间
            //排单开始时间 主排
            $value->schedule_start_date = '';
            //排单结束时间 主排
            $value->schedule_end_date = '';
            //是否排完 以粗排为基准
            $value->is_scheduled = 0;
            if ($value->status == 3) {
                $value->is_scheduled = 1;
                //最早主排开始时间
                $value->schedule_start_date = DB::table(config('alias.rwo'))
                    ->where('production_order_id', $value->product_order_id)
                    ->min('work_station_time');
                $value->schedule_start_date = date('Y-m-d', $value->schedule_start_date);
                //最晚主排结束时间
                $value->schedule_end_date = DB::table(config('alias.rwo'))
                    ->where('production_order_id', $value->product_order_id)
                    ->max('work_station_time');
                $value->schedule_end_date = date('Y-m-d', $value->schedule_end_date);
            }
            //已排进度 这里的已排指工单已粗排
            $value->schedule = 0;
            //该PO是否已开始排产
            $has_scheduled=$this->isExisted([
                ['production_order_id',$value->product_order_id],
                ['status','<>',0]
            ],config('alias.rwo'));
            //已开始排产 计算已排进度 整数百分比
            if ($has_scheduled){
                //该PO下所有WT的qty
                $qty=DB::table(config('alias.roo'))
                    ->where('production_order_id',$value->product_order_id)
                    ->sum('qty');
                //该PO下的已排WO的qty
                $wo_qty=DB::table(config('alias.rwo'))
                    ->where([['production_order_id', $value->product_order_id], ['status', '<>', 0]])
                    ->sum('qty');
                $value->schedule = sprintf("%01.0f", ($wo_qty / $qty) * 100) . '%';
            }
        }
        //总共有多少条记录
        $count_builder = DB::table($this->table . ' as a1');
        if (!empty($where)) $count_builder
            ->leftJoin(config('alias.rrad') . ' as a3', 'a3.id', '=', 'a1.creator_id')
            ->leftJoin(config('alias.rm') . ' as a2', 'a2.id', '=', 'a1.product_id')
            ->where($where);
        $input['total_records'] = $count_builder->count();
        return $obj_list;
    }

    public function add(&$input)
    {
        $this->checkRules($input);
        $creator_id = (!empty(session('administrator')->admin_id)) ? session('administrator')->admin_id : 0;
        $bom = DB::table(config('alias.rb'))->where([['material_id','=',$input['product_id']],['status','=','1'],['is_version_on','=',1]])->first();
        $number = get_order_sn('PO');
        if(!empty($bom)){
            $bom_model =  new Bom();
            $bom_tree=$bom_model->getBomTree($bom->material_id,$bom->version,true,true,true,01);
            $attachments=$bom_model->getBomAttachments($bom->id);
            $bom_input['code']         = $bom->code;
            $bom_input['material_id']  = $bom->material_id;
            $bom_input['loss_rate']    = $bom->loss_rate;
            $bom_input['name']         = $bom->name;
            $bom_input['bom_group_id'] = $bom->bom_group_id;
            $bom_input['version']      = $bom->version;
            $bom_input['version_description']      = $number;
            $bom_input['qty']          = $bom->qty;
            $bom_input['description']      = $bom->description;
            $bom_input['bom_tree']         = obj2array($bom_tree);
            $bom_input['attachments']      = $attachments;
            $bom_input['differences']      = '';

            $routing_id = isset($input['routing_id']) ? $input['routing_id'] : 0;
            //所有工艺路线信息
            $bom_input['routing_package'] = json_encode($this->getBomRoutingPackage($bom->id,$routing_id,$input['qty']));

            //所有工时信息
            $workhour_model =  new WorkHour();
            $workhour_package = $workhour_model->getAllHoursByBom($bom->id,$routing_id);
            if(empty($workhour_package)){TEA('2406');}
            $bom_input['workhour_package'] = json_encode($workhour_package);

            $manufacture_bom_model = new ManufactureBom();
            $input['manufacture_bom_id'] = $manufacture_bom_model->add($bom_input,false,1);

        }else{
            TEA('2401');
            //$input['manufacture_bom_id'] = 0;
        }
        $data = [
            'number'=>$number,//订单序号
            'status'=>0,//名称
            'product_id'=>$input['product_id'],//物料ID
            'scrap'=>$input['scrap'],
            'qty'=>$input['qty'],
            'start_date'=>strtotime($input['start_date']),
            'creator_id'=>$creator_id,
            'end_date'=>strtotime($input['end_date']),
            'manufacture_bom_id'=>$input['manufacture_bom_id'],
            'ctime'=>time(),//创建时间
            'bom_id'=>isset($bom->id) ? $bom->id : NULL,//顶级bom_id
            'bom_qty'=>isset($bom->qty) ? $bom->qty : NULL,//顶级bom用料
            'routing_id'=>isset($input['routing_id']) ? $input['routing_id'] : NULL,//工艺路线id
            'remark'=>isset($input['remark'])?$input['remark']:'',//备注
            'sales_order_code'=>$input['sales_order_code'],//销售订单号
            'priority'=>$input['priority'],//优先级
            'unit_id'=>$this->getFieldValueById($input['product_id'],'unit_id',config('alias.rm'))//单位
        ];
        //入库
        $insert_id = DB::table($this->table)->insertGetId($data);
        return $insert_id;
    }

    //获取拆WT所需的工艺文件包，存入制造bom，便于后边SAP对接后，在返回给mes使用
    public function getBomRoutingPackage($bom_id,$routing_id,$qty)
    {
        $m=new Material();

        $operationOrderModel=new RoutingOrder();
        $bomRoutingPackage = [];
        //遍历工艺路线，获取所有的出料
        $routing_out_material=$operationOrderModel->getRoutingOutMaterial($bom_id,$routing_id);
        //遍历工艺路线上所有出料
        foreach($routing_out_material as $key => $out_material) {
            if ($out_material->material_id && $out_material->operation_id) {
                //计算出料qty
                $usage_number = $out_material->use_num;
                $mother_qty=round(eval("return $usage_number;")*$qty,3);

                //获取工序名称
                $operation_name = $operationOrderModel->getOperationName($out_material->operation_id);

                //出料重新组装
                $out_material_value = [[
                    'material_category_id' => $out_material->material_category_id,
                    'material_category_name' => $out_material->material_category_name,
                    'material_id' => $out_material->material_id,
                    'item_no' => $out_material->material_code,
                    'material_attributes' => $m->getAttributeByMaterial($out_material->material_id),
                    'operation_attributes' => $m->getOperationAttributeValue($out_material->material_id),
                    'drawings' => $m->getMaterialDrawings($out_material->material_id),
                    'name' => $out_material->material_name,
                    'unit_id' => $out_material->unit_id,
                    'unit' => $out_material->unit_name,
                    'material_commercial' => $out_material->material_commercial,
                    'bom_unit_id' => $out_material->bom_unit_id,
                    'bom_commercial' => $out_material->bom_commercial,
                    'usage_number' => $out_material->use_num,
                    'loss_rate' => isset($out_material->loss_rate) ? $out_material->loss_rate : 0,
                    'qty'=>$mother_qty,
                ]];

                //获取进料
                $in_material = $operationOrderModel->getBaseInMaterial($out_material->bom_id, $out_material->routing_node_id, $out_material->group_index);
                //重新组装进料
                $in_material_value = [];
                $in_material_ids = [];
                foreach ($in_material as $each) {
                    $in_material_value[] = [
                        'material_category_id' => $each->material_category_id,
                        'material_category_name' => $each->material_category_name,
                        'material_id' => $each->material_id,
                        'item_no' => $each->material_code,
                        'material_attributes' => $m->getAttributeByMaterial($each->material_id),
                        'operation_attributes' => $m->getOperationAttributeValue($each->material_id),
                        'drawings' => $m->getMaterialDrawings($each->material_id),
                        'name' => $each->material_name,
                        'unit_id' => $each->unit_id,
                        'unit' => $each->unit_name,
                        'material_commercial' => $each->material_commercial,
                        'bom_unit_id' => $each->bom_unit_id,
                        'bom_commercial' => $each->bom_commercial,
                        'usage_number' => $each->use_num,
                        'loss_rate' => isset($each->loss_rate) ? $each->loss_rate : 0,
                        'qty'=>$mother_qty*$each->use_num,
                    ];
                    $in_material_ids[] = $each->material_id;
                }

                //工艺路线上工序顺序号,order
                $routing_operation_order = $operationOrderModel->getOperationOrder($out_material->routing_node_id);

                //当前工序节点下,该步骤的顺序号，index
                $routingnode_step_order = $out_material->index;

                //当前步骤组所有步骤，能力的id和名称组合
                $group_steps = $operationOrderModel->getGroupSteps($out_material->bom_id, $out_material->routing_node_id, $out_material->group_index);
                $group_step_withnames = [];

                foreach ($group_steps as $key3 => $value3) {
                    if(!empty($value3->operation_ability_ids)){
                        $operation_ability_ids = explode(',', $value3->operation_ability_ids);
                        $ability_names = $operationOrderModel->getAbilityName($operation_ability_ids);
                    }else{
                        $ability_names = [];
                    }

                    $group_step_withnames[$key3] = [
                        'base_step_id' => $value3->base_step_id,
                        'base_step_index' => $value3->index,
                        'step_name' => $value3->step_name,
                        'operation_id' => $value3->operation_id,
                        'operation_name' => $value3->operation_name,
                        'abilitys' => $ability_names,
                    ];
                }

                //当前步骤组的所有工艺文件信息，后期到工位机时使用
                $bom_routing_model = new BomRouting();
                $group_routing_package = json_encode($bom_routing_model->getSchedulingNeedRoutingInfo($out_material->bom_id, $out_material->routing_node_id, $out_material->group_index));

                $data = [
                    'qty' => $mother_qty,
                    'name' => $out_material->material_name,
                    'operation_id' => $out_material->operation_id,
                    'operation_name' => $operation_name->name,
                    'operation_ability' => $out_material->operation_ability_ids,
                    'routing_operation_order' => $routing_operation_order->order,
                    'routingnode_step_order' => $routingnode_step_order,
                    'out_material' => json_encode($out_material_value),
                    'out_material_id' => $out_material->material_id,
                    'out_material_name' => $out_material->material_name,
                    'in_material' => json_encode($in_material_value),
                    'in_material_ids' => is_array($in_material_ids) ? implode(',', $in_material_ids) : '',
                    'belong_bom_id' => $out_material->bom_id,
                    'group_step_withnames' => json_encode($group_step_withnames),
                    'group_routing_package' => json_encode($group_routing_package),
                ];
                $bomRoutingPackage[] = $data;
            }
        }
        return $bomRoutingPackage;
    }

    public function get($id)
    {
        $obj = new \stdClass();
        $orderFields= ['id as product_order_id',
            'number',
            'qty',
            'start_date',
            'scrap',
            'end_date',
            'product_id',
            'manufacture_bom_id',
            'routing_id',
            'remark',//备注
            'sales_order_code',//销售订单号
            'priority',//优先级
            'unit_id',
            'optional_bom_number',
            'confirm_number',
        ];

        $orderObj = $this->getRecordById($id,$orderFields,$this->table);
        if (!$orderObj) TEA('404');
        $obj->order = $orderObj;
        $obj->order->start_date =  date('Y-m-d',$orderObj->start_date);
        $obj->order->end_date =  date('Y-m-d',$orderObj->end_date);

        $obj->order->unit=$unit=DB::table(config('alias.rpo').' as po')
            ->leftJoin(config('alias.uu').' as uu','po.unit_id','uu.id')
            ->where('po.id',$id)
            ->value('uu.name');
        $routing = DB::table(config('alias.rpr'))->where('id','=',$obj->order->routing_id)->first();
        $obj->order->routing_name = isset($routing->name) ? $routing->name : '';

        $material = DB::table(config('alias.rm'))->where('id','=',$orderObj->product_id)->first();
        $obj->order->material_name = $material->name;
        $obj->order->item_no = $material->item_no;

        if($orderObj->manufacture_bom_id !=0){
            $manufacture_bom = $this->getRecordById($orderObj->manufacture_bom_id,'*',config('alias.rmb'));
            $obj->bom = $manufacture_bom;
            //dd(json_decode($manufacture_bom->attachments));
            $obj->bom->attachments = $this->getBomAttachments(json_decode($manufacture_bom->attachments));



        }else{
            $obj->bom = new \stdClass();
        }
        return $obj;
    }

    public function destroy($id)
    {
        $order = $this->getRecordById($id);
        if($order->on_off != 0){
            TEA('2408');
        }
        $data = ['is_delete' => 1];

        DB::table(config('alias.rpo'))
            ->where('id', $id)
            ->update($data);

        DB::table(config('alias.roo'))
            ->where('production_order_id', $id)
            ->update($data);

        DB::table(config('alias.rwo'))
            ->where('production_order_id', $id)
            ->update($data);

        DB::table(config('alias.rsco'))
            ->where('production_order_id', $id)
            ->update($data);

        return true;


//        if($order->status != 0){
//            TEA('2400');
//        }
//
//        $num=$this->destroyById($id);
//        if($num===false) TEA('803');
//        if(empty($num))  TEA('404');
//
//        $this->destroyById($order->manufacture_bom_id,config('alias.rmb'));
    }

    public function getBomAttachments($attachments)
    {
        $attachments_ids = array();
        $tmp = array();
        foreach ($attachments as $row){
            $attachments_ids[] = $row->attachment_id;
            $tmp[$row->attachment_id] = $row->comment;
        }
        if(!empty($attachments_ids)){
            $obj_list=DB::table(config('alias.attachment').' as attach')
                ->whereIn('attach.id',$attachments_ids)

                ->leftJoin(config('alias.u').' as u','attach.creator_id','=','u.id')
                ->select(
                    'attach.id as attachment_id',
                    'u.name as creator_name',
                    'attach.name',
                    'attach.filename',
                    'attach.path',
                    'attach.size',
                    'attach.ctime',
                    'attach.creator_id',
                    'attach.is_from_erp'
                )->get();
            foreach($obj_list as $key=>&$value){
                $value->ctime=date('Y-m-d H:i:s',$value->ctime);
                $value->comment = isset($tmp[$value->attachment_id])?$tmp[$value->attachment_id]:'';
            }
            return $obj_list;
        }else{
            return '';
        }
    }

    /**
     * @param $input
     * @return array
     * @throws \App\Exceptions\ApiException
     * @throws \App\Exceptions\ApiSapException
     */
    public function syncProductOrder($input)
    {
        $ApiControl = new SapApiRecord();
        $ApiControl->store($input);
        /**
         * @todo 业务处理
         * 如果有异常,直接 TESAP('code',$params='',$data=null)
         */
        foreach ($input['DATA'] as $key => $value) {
            $keyVal = [
                'code' => get_value_or_default($value,'AUFNR'),
                'materiel_code' => get_value_or_default($value,'PLNBEZ'),
                'factory_code' => get_value_or_default($value,'DWERK'),
                'DAUAT' => get_value_or_default($value,'DAUAT'),
                'qty' => get_value_or_default($value,'GAMNG'),
                'material_unit' => get_value_or_default($value,'GMEIN'),
                'sales_order_code' => get_value_or_default($value,'KDAUF'),
                'KDPOS' => get_value_or_default($value,'KDPOS'),
                'procedure_group' => get_value_or_default($value,'PLNNR'),
                'procedure_group_count' => get_value_or_default($value,'PLNAL'),
                'start_date' => get_value_or_default($value,'GSTRP'),
                'end_date' => get_value_or_default($value,'GLTRP'),
                'MATNR' => get_value_or_default($value,'MATNR'),
                'BDMNG' => get_value_or_default($value,'BDMNG'),
                'ERFME' => get_value_or_default($value,'ERFME'),
                'SOBKZ' => get_value_or_default($value,'SOBKZ'),
                'LGORT' => get_value_or_default($value,'LGORT'),

            ];
            DB::table(config('alias.spo'))->insertGetId($keyVal);
        }
        return [];
    }

    /**
     * @param $input
     * @return array
     * @throws \App\Exceptions\ApiException
     * @throws \App\Exceptions\ApiSapException
     */
    public function syncProductOrderStatus($input)
    {
        $ApiControl = new SapApiRecord();
        $ApiControl->store($input);
        /**
         * @todo 业务处理
         * 如果有异常,直接 TESAP('code',$params='',$data=null)
         */
        foreach ($input['DATA'] as $key => $value) {
            $keyVal = [
                'code' => get_value_or_default($value,'AUFNR'),
                'materiel_code' => get_value_or_default($value,'PLNBEZ'),
                'factory_code' => get_value_or_default($value,'DWERK'),
                'DAUAT' => get_value_or_default($value,'DAUAT'),
                'STTXT' => get_value_or_default($value,'STTXT'),
                'qty' => get_value_or_default($value,'GAMNG'),
                'material_unit' => get_value_or_default($value,'GMEIN'),
                'sales_order_code' => get_value_or_default($value,'KDAUF'),
                'KDPOS' => get_value_or_default($value,'KDPOS'),
                'procedure_group' => get_value_or_default($value,'PLNNR'),
                'procedure_group_count' => get_value_or_default($value,'PLNAL'),
                'start_date' => get_value_or_default($value,'GSTRP'),
                'end_date' => get_value_or_default($value,'GLTRP'),
                'MATNR' => get_value_or_default($value,'MATNR'),
                'BDMNG' => get_value_or_default($value,'BDMNG'),
                'ERFME' => get_value_or_default($value,'ERFME'),
                'SOBKZ' => get_value_or_default($value,'SOBKZ'),
                'LGORT' => get_value_or_default($value,'LGORT'),

            ];
            DB::table(config('alias.spos'))->insertGetId($keyVal);
        }
        return [];
    }

//region  发布生产订单


    /**
     * 发布生产单
     * @param $production_order_id
     * @throws \App\Exceptions\ApiException
     * @author sam.shan  <sam.shan@ruis-ims.cn>
     * @time   2018年02月09日16:02:25
     */
    public  function  release($production_order_id)
    {

        //先判断当前订单是否已经拆过了
        $has=$this->isExisted([['production_order_id','=',$production_order_id]],config('alias.roo'));
        if($has)  TEA('1200','production_order_id');

        //如果选择了工艺路线，走工艺路线这套拆单
        $has_r = $this->hasRouting($production_order_id);
        if(isset($has_r->routing_id)){
            if($has_r->routing_id != 0) {
                $this->route_release($production_order_id,$has_r->routing_id);
                return true;
            }
        }

        //获取一些额外的入库信息
        $production_order_info=$this->get($production_order_id);
        $bom_tree=json_decode($production_order_info->bom->bom_tree,true);
        $qty=$production_order_info->order->qty;
        try {
            //开启事务大杀特杀
            DB::connection()->beginTransaction();
            //调用发布订单接口
            $m=new OperationOrder();
            $split=$m->splitProductionOrder($production_order_id,$bom_tree,$qty);
            if(!$split) TEA('2402');
            //修改状态为已发布
            $upd=DB::table($this->table)->where('id',$production_order_id)->update(['status'=>1]);
            if($upd===false) TEA('2403');
        } catch (\ApiException $e) {
            //回滚
            DB::connection()->rollBack();
            TEA($e->getCode());
        }
        //提交事务
        DB::connection()->commit();


    }
    /**
     * 根据工艺路线发布生产单
     * @param $production_order_id
     * @throws \App\Exceptions\ApiException
     * @author kevin
     * @time   2018年04月13日16:02:25
     */
    public  function  route_release($production_order_id,$routing_id)
    {
        //获取一些额外的入库信息
        $production_order_info=$this->get($production_order_id);
        //应对sap需求，放弃bom树，2018-10-17，by kevin
        //$bom_tree=json_decode($production_order_info->bom->bom_tree,true);
        $material_id = $production_order_info->order->product_id;
        $bom_no = $production_order_info->order->optional_bom_number;
        $bom_no = !empty($bom_no) ? $bom_no : '01';
        $obj_bom_id = DB::table(config('alias.rb'))->where([['material_id', '=', $material_id], ['status', '=', '1'], ['is_version_on', '=', 1],['bom_no', '=', $bom_no]])->first();
        $qty=$production_order_info->order->qty;
        $confirm_number = $production_order_info->order->confirm_number;

        try {
            //开启事务
            DB::connection()->beginTransaction();
            //调用发布订单接口
            $m=new RoutingOrder();
            $split=$m->splitProductionOrderByRouting($production_order_id,$obj_bom_id->id,$qty,$routing_id,$confirm_number);
            if(!$split) TEA('2402');
            //修改状态为已发布
            $upd=DB::table($this->table)->where('id',$production_order_id)->update(['status'=>1]);
            if($upd===false) TEA('2403');
        } catch (\ApiException $e) {
            //回滚
            DB::connection()->rollBack();
            TEA($e->getCode());
        }
        //提交事务
        DB::connection()->commit();
    }

    /**
     * 撤回发布的生产单
     * @param $production_order_id
     * @throws \App\Exceptions\ApiException
     * @author kevin
     * @time   2018年11月14日20:02:25
     */
    public  function  cancelRelease($production_order_id)
    {
        //已经领料或者报工的工单不能撤回
        $has=$this->isExisted([['product_order_id','=',$production_order_id]],config('alias.rmr'));
        $has2=$this->isExisted([['production_order_id','=',$production_order_id]],config('alias.rwdo'));
        if($has || $has2) TEA('1210');

        try {
            //开启事务
            DB::connection()->beginTransaction();

            //撤回发布操作
            DB::table(config('alias.roo'))->where('production_order_id','=',$production_order_id)->delete();
            DB::table(config('alias.rwo'))->where('production_order_id','=',$production_order_id)->delete();
            $data = [
                'status' => 0,
                'last_cancel_time' => time()
            ];
            DB::table(config('alias.rpo'))->where('id', $production_order_id)->update($data);
        } catch (\ApiException $e) {
            //回滚
            DB::connection()->rollBack();
            TEA($e->getCode());
        }
        //提交事务
        DB::connection()->commit();

        return true;
    }

    public  function  hasRouting($production_order_id)
    {
        $obj =  DB::table(config('alias.rpo'))
            ->where('id',$production_order_id)
            ->select('routing_id')
            ->first();
        if (!$obj) TEA('404');
        return $obj;
    }
//endregion

    /**
     * 检测BOM是否配置is_ecm
     * @param $material_id
     * @return bool
     * @author Bruce.Chu
     */
    public function isEcm($material_id)
    {
        //根据物料id拿到有效bom的bom_id
        $bom=DB::table(config('alias.rb'))
            ->where([['material_id',$material_id],['is_version_on',1]])
            ->select('id','is_ecm')
            ->first();
        if($bom->is_ecm) return true;
        //去bom子表中找到该bom的子项
        $bom_items=DB::table(config('alias.rbi'))
            ->where('bom_id',$bom->id)
            ->select('material_id','is_assembly','version')
            ->get();
        //对每个子项进行检测
        foreach ($bom_items as $item){
            //子项是否有bom结构
            $has_bom=$this->isExisted([['material_id',$item->material_id],['is_version_on','1'],['status',1]],config('alias.rb'));
            if($has_bom){
                //组装判断 是 递归 继续找子bom的子项is_ecm是否为1
                if($item->is_assembly){
                    //递归找下去 找到直接跳出 否 继续操作下一个儿子
                    if($this->isEcm($item->material_id)) return true;
                }
            }else{
                //物料单层结构 直接判断即可
                $is_ecm=DB::table(config('alias.rm'))->where('id',$item->material_id)->value('is_ecm');
                if($is_ecm) return true;
            }
        }
        return false;
    }

    /**
     * 生产实时看板
     * @return bool
     * @author kevin
     */
    public function productBoard()
    {
        $today_start = strtotime(date('Y-m-d 00:00:00'));
        $today_end = strtotime(date('Y-m-d 23:59:59'));

        //根据今天时间点获取当天的执行的所有工单
        $where=[['rwo.work_station_time',$today_start],['rwo.status','=',2]];
        $today_workorder = DB::table(config('alias.rwo') . ' as rwo')
            ->select(
                'rwb.name as workbench_name',
                'rwo.id as work_order_id',
                'rwo.number',
                'rwo.qty',
                'rwo.plan_start_time as predict_start_time',
                'rwo.plan_end_time as predict_end_time',
                'rwo.rank_plan_id',
                'rwo.rank_plan_type_id',
                'rwo.work_center_id',
                'rio.name as operation_name'
            )
            ->leftJoin(config('alias.rwb') . ' as rwb', 'rwb.id', '=', 'rwo.work_shift_id')
            ->leftJoin(config('alias.rio') . ' as rio', 'rio.id', '=', 'rwo.operation_id')
            ->where($where)
            ->get();
        //pd($today_workorder);

        //对所有工单按排班进行汇总
        $all_order_rank_count = [];

        foreach($today_workorder as &$v){
            if($v->rank_plan_type_id == 0){
                continue;
            }
            if(!isset($all_order_rank_count[$v->rank_plan_type_id]['work_order_total_qty'])){
                $all_order_rank_count[$v->rank_plan_type_id]['work_order_total_qty'] = $v->qty;
                $all_order_rank_count[$v->rank_plan_type_id]['rank_total_complete_qty'] = 0;
                $all_order_rank_count[$v->rank_plan_type_id]['ontime_complete_qty'] = 0;
            }else{
                $all_order_rank_count[$v->rank_plan_type_id]['work_order_total_qty'] += $v->qty;
            }
            //获取当前班次类型的排班,数组
            $arr_rank_plan = $this->getRankPlan($v->rank_plan_type_id,$today_start);

            //获取报工单
            $all_declare = $this->get_all_declare($v->work_order_id);

            //不存在报工的处理,status:0未开始，1进行中，2完成
            if(count($all_declare) <= 0){
                $v->actual_start_time = 0;
                $v->complete = 0;
                $v->complete_percent = 0;
                $v->status = 0;
                continue;
            }
            //报工单按报工开始时间排序，最小开始时间做为工单实际开始时间
            $declare_first = $all_declare['0'];
            $v->actual_start_time = $declare_first->declare_start_time;

            //工单的计划截止时间，后面统计按时完成率要使用
            $work_order_plan_endtime = $v->predict_end_time;

            //报工单
            $is_last_declare = 0;
            $declare_num = 0;
            foreach ($all_declare as $k){
                if($k->is_teco == 1){
                    $is_last_declare = 1;
                }
                //统计报工单中的出料报工数量
                $declare_num = $declare_num + $k->out_qty;

                //统计在班次类型内的报工单完成数量
                $declare_end_time = date("H:i:s",$k->declare_end_time);
                foreach ($arr_rank_plan as $each_rank){
                    $all_order_rank_count[$v->rank_plan_type_id]['rank_name'] = $each_rank['name'];

                    //该班次下总的完成数量,作为白／夜班的完成率
                    if(!isset($all_order_rank_count[$v->rank_plan_type_id]['rank_total_complete_qty'])){
                        $all_order_rank_count[$v->rank_plan_type_id]['rank_total_complete_qty'] = $declare_num;
                    }else{
                        $all_order_rank_count[$v->rank_plan_type_id]['rank_total_complete_qty'] += $declare_num;
                    }

//                    //统计截止时间在该班次之内的数量，作为白／夜班的完成率
//                    if($declare_end_time >= $each_rank->work_time_start && $declare_end_time <= $each_rank->work_time_end){
//                        if(!isset($all_order_rank_count[$v->rank_plan_type_id]['rank_complete_qty'])){
//                            $all_order_rank_count[$v->rank_plan_type_id]['rank_complete_qty'] = $declare_num;
//                        }else{
//                            $all_order_rank_count[$v->rank_plan_type_id]['rank_complete_qty'] += $declare_num;
//                        }
//                    }
                    //统计开始时间在该班次之内的数量，作为白／夜班的按时完成率
                    if($declare_end_time <= $work_order_plan_endtime){
                        if(!isset($all_order_rank_count[$v->rank_plan_type_id]['ontime_complete_qty'])){
                            $all_order_rank_count[$v->rank_plan_type_id]['ontime_complete_qty'] = $declare_num;
                        }else{
                            $all_order_rank_count[$v->rank_plan_type_id]['ontime_complete_qty'] += $declare_num;
                        }
                    }
                }
            }
            //计算工单达成率，获得整数，前端自己加%
            $v->complete_percent = intval(($declare_num / $v->qty) * 100 );

            //complete是1：完工；status为2：完成，1：进行中；
            if($is_last_declare == 1){
                $v->complete = 1;
                $v->status = 2;
            }else{
                $v->complete = 0;
                $v->status = 1;
            }
        }
        foreach ($all_order_rank_count as $key => $rank){
            $all_order_rank_count[$key]['rank_complete_percent'] = intval(($all_order_rank_count[$key]['rank_total_complete_qty'] / $all_order_rank_count[$key]['work_order_total_qty']) * 100 );
            $all_order_rank_count[$key]['ontime_rank_complete_percent'] = intval(($all_order_rank_count[$key]['ontime_complete_qty'] / $all_order_rank_count[$key]['work_order_total_qty']) * 100 );
        }
        $response_data = [
            'orders' => $today_workorder,
            'ranks' => $all_order_rank_count
        ];

        return $response_data;
    }

    public function getRankPlan($rank_plan_type_id,$today_start)
    {
        //今天的日期是周几
        $time_week=date('w',$today_start);
        //排班信息 班次名称 排班可能有多个
        $rank_plan=DB::table(config('alias.rrp').' as plan')
            ->leftJoin(config('alias.rrpt').' as plan_type','plan.type_id','plan_type.id')
            ->select('plan.from as work_time_start','plan.to as work_time_end','plan.work_date',
                'plan.rest_time','plan.id as rank_plan_id','plan.work_time','plan_type.name')
            ->where('type_id',$rank_plan_type_id)
            ->get();
        //筛出包含当天日期的排班
        $rank_plan2=array_filter(obj2array($rank_plan),function($value) use($time_week){
            return in_array($time_week,json_decode($value['work_date']));
        });

        return $rank_plan2;
    }

    public function get_all_declare($work_order_id)
    {
        $where2=[['rwdo.work_order_id',$work_order_id],['rwdoi.type','=','-1']];
        $get_declare = DB::table(config('alias.rwdo') . ' as rwdo')
            ->select(
                'rwdo.work_order_id',
                'rwdo.id as declare_id',
                'rwdo.start_time as declare_start_time',
                'rwdo.end_time as declare_end_time',
                'rwdo.is_teco',
                'rwdoi.qty as out_qty'
            )
            ->leftJoin(config('alias.rwdoi') . ' as rwdoi', 'rwdoi.declare_id', '=', 'rwdo.id')
            ->where($where2)
            ->orderBy('rwdo.start_time', 'asc')
            ->get();

        return $get_declare;
    }

    /**
     * 自动排产
     * @return array
     * @author kevin
     */
    public function autoPlanAPS($production_order_id)
    {
        //先校验有没有发布
        $obj_po = DB::table(config('alias.rpo'))
            ->select('start_date', 'end_date', 'status')
            ->where('id', $production_order_id)
            ->first();
        //没有发布和排产完成的就不需要走排产了
        if($obj_po->status == 0 || $obj_po->status == 3){
            return true;
        }

        //构造自动排产的数据
        $all_wo_data = $this->createAutoPlanData($production_order_id);

        if(count($all_wo_data) > 0){
            //对该po底下的所有WO进行排产
            $APS_mode = new \App\Http\Models\APS();
            foreach ($all_wo_data as $item) {
                $APS_mode->simplePlanByPeriod($item);
            }
        }
    }

    /**
     * 构造自动排产的数据
     * @return array
     * @author kevin
     */
    public function createAutoPlanData($production_order_id)
    {
        //先校验有没有发布
        $obj_po = DB::table(config('alias.rpo'))
            ->select('start_date', 'end_date', 'status')
            ->where('id', $production_order_id)
            ->first();

        $start_time = $obj_po->start_date;
        $end_time = $obj_po->end_date;

        //找到所有未拆WO的WT
        $where1[]=['production_order_id','=',$production_order_id];
        $where1[]=['is_outsource','=','0'];
        $where1[]=['status','=','0'];
        $obj_wts = DB::table(config('alias.roo'))
            ->select(
                'id as wt_id', 'status as wt_status', 'qty', 'is_outsource',
                'group_step_withnames','work_center_id'
            )
            ->where($where1)
            ->get();

        $work_task=new WorkOrder();
        //对未拆wo的wt进行拆wo
        foreach($obj_wts as $key => $value1) {
            $wt_id = $value1->wt_id;
            $work_task->split(['operation_order_id' => $wt_id, 'split_rules' => json_decode("[$value1->qty]", true)]);
        }

        //找该PO底下所有未主排的WO，进行分类，构造数据
        $where2[]=['production_order_id','=',$production_order_id];
        $where2[]=['status','=','0'];
        $obj_wos = DB::table(config('alias.rwo'))
            ->select(
                'id as wo_id', 'status as wo_status', 'qty','operation_order_id as wt_id',
                'group_step_withnames','work_center_id','operation_id'
            )
            ->where($where2)
            ->get();
        $all_assemble_wo = [];
        foreach($obj_wos as $key => $value2) {
            $wo_id = $value2->wo_id;
            //根据wo的工作中心和步骤组，构建排产所需的数据
            $obj_factory = DB::table(config('alias.rwc') . ' as rwc')
                ->select(
                    'rwc.workshop_id as workshop_id', 'rws.factory_id as factory_id'
                )
                ->leftJoin(config('alias.rws') . ' as rws', 'rws.id', '=', 'rwc.workshop_id')
                ->where('rwc.id',$value2->work_center_id)
                ->first();
            if(!$obj_factory) TEA('1603');
            $factory_id = $obj_factory->factory_id;
            $workshop_id = $obj_factory->workshop_id;

            //处理步骤中的能力
            $array_step = json_decode($value2->group_step_withnames,true);
            $step_abilitys = [];
            foreach ($array_step as $v){
                //每个步骤取能力数组中第一个能力作为后期排产所选择的能力
                $step_abilitys[$v['base_step_id']] = key($v['abilitys']);
                $workcenter_ability_id = key($v['abilitys']);
            }

            //找到该工作中心下所有的能力，提前判断，防止事物死锁
            $rwcWhere = [];
            $rwcWhere[] = ['rwc.workshop_id','=',$workshop_id];
            $rwcWhere[] = ['rwc.id','=',$value2->work_center_id];
            $rwcWhere[] = ['rwboa.operation_to_ability_id','=',$workcenter_ability_id];
            $workcenterOperationAbilityCount = DB::table(config('alias.rwc').' as rwc')
                ->leftJoin(config('alias.rwb').' as rwb','rwc.id','rwb.workcenter_id')
                ->leftJoin(config('alias.rwboa').' as rwboa','rwb.id','rwboa.workbench_id')
                ->select('rwc.id','rwc.name','rwboa.operation_to_ability_id',DB::raw('count(rwc.id) as num'))
                ->groupBy('rwboa.operation_to_ability_id')
                ->where($rwcWhere)->count();
            if(empty($workcenterOperationAbilityCount)) TEA('1604');

            //组装数据
            $all_assemble_wo[] = [
                'ids' => [$wo_id],
                'work_task_id' => $value2->wt_id,
                'factory_id' => $factory_id,
                'workshop_id' => $workshop_id,
                'workcenter_id' => $value2->work_center_id,
                'workcenter_operation_to_ability_id' => $workcenter_ability_id,
                'all_select_abilitys' => json_encode($step_abilitys),
                'start_time' => date('Y-m-d',$start_time),
                'end_time' => date('Y-m-d',$end_time),
                'operation_id' => $value2->operation_id,
                '_token' => '8b5491b17a70e24107c89f37b1036078',
            ];

        }
        return $all_assemble_wo;
    }

    /**
     * 构造自动排产的数据
     * @return array
     * @author kevin
     */
    public function productOrderOnOff($id)
    {
        $order = $this->getRecordById($id);
        if($order->on_off == 0){
            $data = ['on_off' => 1];
        }else{
            $data = ['on_off' => 0];
        }
        DB::table(config('alias.rpo'))
            ->where('id', $id)
            ->update($data);

        DB::table(config('alias.roo'))
            ->where('production_order_id', $id)
            ->update($data);

        DB::table(config('alias.rwo'))
            ->where('production_order_id', $id)
            ->update($data);

        DB::table(config('alias.rsco'))
            ->where('production_order_id', $id)
            ->update($data);

        return $id;
    }


}
