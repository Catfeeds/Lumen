<?php
namespace App\Http\Models;
use Illuminate\Support\Facades\DB;
use App\Libraries\SoapSrm;


class Claim extends Base
{
    public function __construct()
    {
        $this->table='ruis_claim';
        $this->itemTable='ruis_claim_item';
        $this->checkTable='ruis_qc_check';

        if(empty($this->item)) $this->item =new ClaimItem();

    }

    /**
     * @param $input
     * @throws \App\Exceptions\ApiException
     */
    public function checkFormField(&$input)
    {
        $input['creator_id'] = (!empty(session('administrator')->admin_id)) ? session('administrator')->admin_id : 0;
    }

    /**
     * 保存数据
     */
    public function save($data,$id=0)
    {
        if ($id>0)
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
                $order_id   = $id;

        }
        else
        {
            //代码唯一性检测
            $has=$this->isExisted([['code','=',$data['code']]]);
            if($has) TEA('8305','code');
            //添加
            $order_id=DB::table($this->table)->insertGetId($data);
            if(!$order_id) TEA('802');
        }
        return $order_id;
    }

//region store
    /**
     * 新增领料单
     *
     * @param $input
     * @return mixed
     * @throws \App\Exceptions\ApiException
     */
    public function store($input)
    {
        try {
              //开启事务
              DB::connection()->beginTransaction();
              $this->checkFormField($input);  //验证数据
              $timeStr = date('YmdHis');
              $temp_code  = 'SPD'. $timeStr . rand(100, 999);

              //获取编辑数组
              $data=[
                  'code' => $temp_code,
                  'check_id'=>$input['check_id'],                 //检验单 id
                  'remark' => isset($input['remark'])?$input['remark']:'',
                  'ctime' => time(),
                  'mtime' => time(),
                  'from' => 1,                                  //系统来源
                  'status' => 1,
                  'creator_id' => $input['creator_id']
              ];
              $insert_id = $this->save($data);
              if(!$insert_id) TEA('802');
              //2、添加明细
              $this->item->saveItem($input, $insert_id);

        } catch (\ApiException $e) {
            //回滚
            DB::connection()->rollBack();
            TEA($e->getCode());
        }
        DB::connection()->commit();
        return $insert_id;
    }
//endregion
    /**
     * 编辑
     * @param $input array  input数组
     * @return int         返回插入表之后返回的主键值
     * @author liming
     */
    // public function update($input)
    // {
    //     //  判断单据是否审核
    //     $order_id   = $input['id'];
    //     try {
    //         //开启事务
    //         DB::connection()->beginTransaction();
    //         //明细修改
    //         $this->item->saveItem($input,$order_id);
    //     } catch (\ApiException $e) {
    //         //回滚
    //         DB::connection()->rollBack();
    //         TEA($e->getCode());
    //     }
    //     DB::connection()->commit();
    //     return $order_id;
    // }

    /**
     * 分页列表
     * @return array  返回数组对象集合
     */
    public function getPageList($input)
    {
        if (!array_key_exists('page_no',$input ) && !array_key_exists('page_size',$input )) TEA('8312','page');
        //order  (多order的情形,需要多次调用orderBy方法即可)
        if (empty($input['order']) || empty($input['sort']))
        {
            $input['order']='desc';$input['sort']='id';
        }

        $where = $this->_search($input);
        $builder = DB::table($this->table.' as claim')
            ->select('claim.*','creator.name  as creator_name')
            ->where($where)
            ->leftJoin(config('alias.rrad') . ' as creator', 'claim.creator_id', '=', 'creator.id')
            ->offset(($input['page_no'] - 1) * $input['page_size'])
            ->limit($input['page_size'])
            ->orderBy($input['sort'],$input['order']);
            $obj_list = $builder->get();
            foreach ($obj_list as $obj)
            {
                $obj->createdate  = date("Y-m-d H:i:s",$obj->ctime);
                $obj->editdate  = date("Y-m-d H:i:s",$obj->mtime);
                $group_list = $this->getItemsByOrder($obj->id);
                $obj->groups = $group_list;
            }
            $obj_list->total_count = DB::table($this->table.' as claim')->where($where)->count();
            return $obj_list;

    }


    /**
     * 获取
     * @return array  返回数组对象集合
     */
    public function show($id)
    {
          $obj_list = DB::table($this->table.' as claim')
          ->where('claim.id',$id)
          ->select('claim.*','creator.name  as creator_name')
          ->leftJoin(config('alias.rrad') . ' as creator', 'claim.creator_id', '=', 'creator.id')
          ->get();
          foreach ($obj_list as $key => $obj)
          {
              $obj->createdate  = date("Y-m-d H:i:s",$obj->ctime);
              $obj->editdate  = date("Y-m-d H:i:s",$obj->mtime);
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
    public function getItemsByOrder($order_id)
    {
         $obj_list=DB::table($this->itemTable)
                  ->select('*')
                  ->where('claim_id','=', $order_id)
                  ->get();
         return  $obj_list;
    }


    /**
     * @message 推送
     * @param $id
     * @return mixed
     * @throws \App\Exceptions\ApiException
     * @author  liming
     * @time    2018年 9月 25日
     */
    public function pushClaim($id)
    {
      //获取单据信息
      $data=[
          'item.*',
          'check.EBELP  as EBELP',   //采购凭证的项目编号
          'check.EBELN  as EBELN',   //采购凭证编号
          'check.MATNR  as MATNR',   //物料编号
          'check.NAME1  as NAME1',   //供应商名称
          'check.LIFNR  as LIFNR',   //供应商编码
          'check.WERKS  as WERKS',   //工厂编号
          'check.VBELN  as VBELN',   //销售和分销凭证号
          'claim.code   as claim_code',   //索赔单code
          'claim.CURRENCY_CODE   as claim_CURRENCY_CODE',   //索赔单币种
          'claim.code   as claim_code',   //索赔单code
          'claim.id     as claim_id',   //索赔单id
          'claim.ES_FORM_STATUS   as claim_ES_FORM_STATUS',   //索赔单id
          'claim.remark   as claim_remark',   //索赔单id
      ];
       $claim_res  =  DB::table($this->itemTable.' as item')
                  ->select($data)
                  ->leftJoin($this->table.' as claim', 'item.claim_id', '=', 'claim.id')
                  ->leftJoin($this->checkTable.' as check', 'check.id', '=', 'claim.check_id')
                  ->where('item.claim_id',$id)
                  ->first();
    
        $lns_record = [
            'ES_FORM_CODE' =>$claim_res->claim_code,
            'CLAIM_ITEM_CODE' =>$claim_res->code,
            'AMOUNT' =>'', //金额
            'OCCURRED_DATE' =>date("Y/m/d",$claim_res->OCCURRED_DATE),//发生日期
            'RESPONSIBLE_ITEM_CODE' =>'',
            'RESPONSIBLE_ITEM_UOM' =>'',
            'RESPONSIBLE_ITEM_SUM' =>'',
            'DEFECT_DESC' => $claim_res->DEFECT_DESC,//缺陷描述
            'DEFECT_SUM' =>$claim_res->DEFECT_SUM,  //缺陷数量
            'RELATIVE_ITEM_CODE' =>$claim_res->RELATIVE_ITEM_CODE,
            'RELATIVE_ITEM_UOM' =>'',
            'RELATIVE_ITEM_SUM' =>$claim_res->RELATIVE_ITEM_SUM,
            'COMMENTS' =>$claim_res->claim_remark,     //备注
            'CLAIM_DESC'=>'',
            'ATTRIBUTE_1'=>$claim_res->MATNR,
            'ATTRIBUTE_2'=>$claim_res->MATNR_qty,
        ];
        for ($i = 3; $i <= 10; $i++) {
            $lns_record['ATTRIBUTE_' . $i] = '';
        }

         $hds_record = [
            'ES_FORM_ID' => $claim_res->claim_id,  //外部索赔单ID
            'ES_FORM_CODE' => $claim_res->claim_code, //外部索赔单号
            'ES_FORM_STATUS' => $claim_res->claim_ES_FORM_STATUS,//索赔单据状态
            // 'CLAIM_TYPE_CODE' =>'',         //索赔类型
            'CLAIM_TYPE_CODE' =>'003',         //索赔类型  暂时先传003
            'DATA_SOURCE' => 'MSE系统',     //数据来源
            'DATA_SOURCE_CODE' =>'',        //来源单号
            'CLAIM_DESC' => $claim_res->DEFECT_DESC,           //索赔说明
            'ES_VENDOR_CODE' => $claim_res->LIFNR,         //供应商编码
            'TOTAL_AMOUNT' =>'',             //索赔总额
            'CURRENCY_CODE' => 'CNY',        //币种
            'FEEDBACK_DATE' => '',           //要求反馈日期
            'FEEDBACK_OPINION' =>'',         //反馈意见
            'RELEASED_BY_CODE' =>'',         //发布人
            'RELEASED_BY_DESC' =>'',         //发布人描述
            'RELEASED_DATE' =>'',            //发布日期
            'ES_BUSINESS_UNIT_CODE' => 'CN00', //公司
            'ES_INV_ORGANIZATION_CODE' =>'1101', //工厂
            'ATTRIBUTE_1'  =>'CO00000010',             //ATTRIBUTE_1
            'EITF_QMS_CLAIM_FORM_LNS' => [
                'RECORD' => $lns_record
            ]
        ];

        for ($i = 2; $i <= 5; $i++) {
            $hds_record['ATTRIBUTE_' . $i] = '';
        }
        $data = [
            'EITF_QMS_CLAIM_FORM_HDS' => [
                'RECORD' => $hds_record
            ]
        ];

     // pd($data);
     // $response_srm = SoapSrm::getParams();
     // print_r($response_srm);
     // $response = SoapSrm::getFunctions();
        $response = SoapSrm::doRequest($data);
     // print_r($response);
        return $response;
    }

    /**
     * 更改状态
     *
     * 1->填完申请单，未推送或推送失败
     * 2->推送成功（完成申请)
     * 3->完成（已填写实收数量）
     *
     * @param $id
     * @param $status
     */
    public function updateStatus($id, $status)
    {
        DB::table($this->table)->where('id', $id)->update(['status' => $status]);
    }

    /**
     * 搜索
     */
    private function _search($input)
    {
        $where = array();

        return $where;
    }

}