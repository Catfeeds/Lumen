<?php
/**
 * Created by PhpStorm.
 * User: haoziye
 * Date: 2018/3/31
 * Time: 下午6:01
 */
namespace App\Http\Models\Sell;

use App\Http\Models\Base;
use App\Http\Models\Encoding\EncodingSetting;
use App\Http\Models\ProductOrder;
use Illuminate\Support\Facades\DB;

class SellOrder extends Base{

    public $apiPrimaryKey = 'sellorder_id';

    public function __construct()
    {
        parent::__construct();
        if(empty($this->table)) $this->table = config('alias.rso');
    }

//region 检

    /**
     * 检查参数
     * @param $input
     */
    public function checkFormField(&$input){
        $this->checkSellOrder($input);
        $sellOrderProductListDao = new SellOrderProductList();
        $sellOrderProductListDao->checkProductList($input);
    }

    /**
     * 检查销售单数据
     * @param $input
     * @throws \App\Exceptions\ApiException
     */
    public function checkSellOrder(&$input){
        $add = $this->judgeApiOperationMode($input);
        if(empty($input['code'])) TEA('700','code');
        $check = $add ? [['code','=',$input['code']]] : [['id','<>',$input[$this->apiPrimaryKey]],['code','=',$input['code']]];
        $has = $this->isExisted($check);
        if($has) TEA('1103');
        if(empty($input['customer_id'])) TEA('700','customer_id');
        $has = $this->isExisted([['id','=',$input['customer_id']]],config('alias.rci'));
        if(!$has) TEA('1183');
        if(!isset($input['comment'])) TEA('700','comment');
        $input['creater_id'] = !empty(session('administrator')->admin_id) ? session('administrator')->admin_id : 0;
    }

//endregion

//region 增

    /**
     * 增加
     * @param $input
     */
    public function store(&$input){
        try{
            DB::connection()->beginTransaction();
            $insert_id = $this->addBaseSellOrder($input);
            $sellOrderProductListDao = new SellOrderProductList();
            $sellOrderProductListDao->save($input['input_ref_arr_productList'],$insert_id);
        }catch (\ApiException $e){
            DB::connection()->rollback();
            TEA($e->getCode());
        }
        DB::connection()->commit();
        return $insert_id;
    }

    /**
     * 添加销售单基础信息
     * @param $input
     */
    public function addBaseSellOrder($input){
        $encodingDao = new EncodingSetting();
        $input['code'] = $encodingDao->useEncoding(7,$input['code']);
        $data = [
            'code'=>$input['code'],
            'creater_id'=>$input['creater_id'],
            'customer_id'=>$input['customer_id'],
            'comment'=>$input['comment'],
            'ctime'=>time(),
        ];
        $insert_id = DB::table($this->table)->insertGetId($data);
        if(!$insert_id) TEA('802');
        return $insert_id;
    }

    /**
     * 生成生产单
     * @param $id
     */
    public function createPO($id){
        $sellOrderProductListDao = new SellOrderProductList();
        $productList = $sellOrderProductListDao->getSellOrderProductList($id);
        try{
            DB::connection()->beginTransaction();
            $productOrderDao = new ProductOrder();
            foreach ($productList as $k=>$v){
                $data = [
                    'product_id'=>$v->material_id,
                    'qty'=>$v->num,
                    'scrap'=>0,
                    'start_date'=>date('Y-m-d H:i:s',time()),
                    'end_date'=>$v->end_time,
                ];
                $productOrderDao->add($data);
            }
            DB::table($this->table)->where('id',$id)->update(['release_status'=>2]);
        }catch (\ApiException $exception){
            DB::connection()->rollback();
            TEA($exception->getCode());
        }
        DB::connection()->commit();
    }

//endregion

//region 改

    /**
     * 更新
     * @param $input
     */
    public function update($input){
        try{
            DB::connection()->beginTransaction();
            $this->updateSellOrder($input);
            $sellOrderProductListDao = new SellOrderProductList();
            $sellOrderProductListDao->save($input['input_ref_arr_productList'],$input[$this->apiPrimaryKey]);
        }catch (\ApiException $exception){
            DB::connection()->rollback();
            TEA($exception->getCode());
        }
        DB::connection()->commit();
    }

    /**
     * 更新销售单
     * @param $input
     */
    public function updateSellOrder($input){
        $data = [
            'code'=>$input['code'],
            'customer_id'=>$input['customer_id'],
            'comment'=>$input['comment'],
        ];
        $res = DB::table($this->table)->where('id',$input[$this->apiPrimaryKey])->update($data);
        if($res === false) TEA('804');
    }

//endregion

//region 查

    public function pageIndex(&$input){
        $field = [
            'rso.id as '.$this->apiPrimaryKey,
            'rso.code',
            'rso.release_status',
            'rso.comment',
            'rso.ctime',
            'rci.name as customer_name',
            'rrad.name as creater_name',
        ];
        $where = [];
        if(!empty($input['code'])) $where[] = ['rso.code','=',$input['code']];
        if(!empty($input['customer_name'])) $where[] = ['rci.name','like','%'.$input['customer_name'].'%'];
        if(!empty($input['creater_name'])) $where[] = ['rrad.name','like','%'.$input['creater_name'].'%'];
        $builder = DB::table($this->table.' as rso')->select($field)
            ->leftJoin(config('alias.rci').' as rci','rci.id','rso.customer_id')
            ->leftJoin(config('alias.rrad').' as rrad','rrad.id','rso.creater_id')
            ->where($where);
        $input['total_records'] = $builder->count();
        $builder->offset(($input['page_no'] - 1) * $input['page_size'])->limit($input['page_size']);
        if(!empty($input['sort']) && !empty($input['order'])) $builder->orderBy('rci.'.$input['sort'],$input['order']);
        $obj_list = $builder->get();
        foreach ($obj_list as $k=>&$v){
            $v->ctime = date('Y-m-d H:i:s',$v->ctime);
        }
        return $obj_list;
    }

    /**
     * 销售订单详情
     * @param $id
     * @return mixed
     */
    public function show($id){
        $field = [
            'rso.id as '.$this->apiPrimaryKey,
            'rso.code',
            'rso.release_status',
            'rso.comment',
            'rso.ctime',
            'rci.id as customer_id',
            'rci.name as customer_name',
            'rci.code as customer_code',
            'rci.position',
            'rci.company',
            'rci.mobile',
            'rci.email',
            'rci.address',
            'rci.label',
            'rrad.name as creater_name',
        ];
        $obj = DB::table($this->table.' as rso')->select($field)
            ->leftJoin(config('alias.rci').' as rci','rci.id','=','rso.customer_id')
            ->leftJoin(config('alias.rrad').' as rrad','rrad.id','=','rso.creater_id')
            ->where('rso.id',$id)->first();
        if(empty($obj)) TEA('404');
        $sellOrderProductListDao = new SellOrderProductList();
        $obj->productList = $sellOrderProductListDao->getSellOrderProductList($id);
        return $obj;
    }

//endregion

//region 删

    /**
     * 删除销售单
     * @param $id
     * @throws \App\Exceptions\ApiException
     */
    public function destory($id){
        try{
            DB::connection()->beginTransaction();
            DB::table(config('alias.rso'))->where('id',$id)->delete();
            DB::table(config('alias.rsop'))->where('sell_order_id',$id)->delete();
        }catch (\ApiException $exception){
            DB::connection()->rollback();
            TEA($exception->getCode());
        }
        DB::connection()->commit();
    }

//endregion
}