<?php
/**
 * Created by PhpStorm.
 * User: zhufeng
 * Date: 2018/5/7
 * Time: 上午11:23
 */
namespace App\Http\Models\Erp;
use App\Http\Models\Base;
use App\Http\Models\Bom;
use App\Http\Models\ManufactureBom;
use Illuminate\Support\Facades\DB;

/**ERP拉取数组转存MES类
 * Class ErpOrder
 * @author Bruce Chu
 * @package App\Http\Models\Erp
 */
class ErpOrder extends Base
{
    protected $materialModel;
    protected $bomModel;
    protected $manufactureModel;
    protected $erpBomModel;

    public function __construct()
    {
        parent::__construct();
        $this->materialModel = new ErpMaterial();
        $this->bomModel = new Bom();
        $this->manufactureModel = new ManufactureBom();
        $this->erpBomModel = new ErpBomDataImport();
    }

    /**拉取ERP物料、BOM、生产订单
     * @author Bruce Chu
     * @param $orders => 生产订单可传数组
     * @return array
     */
    public function insertToMes($orders)
    {
        $creator_id = (!empty(session('administrator')->admin_id)) ? session('administrator')->admin_id : 0;
        //结果返回数组
        $result = ['list' => [], 'records' => ['success' => 0, 'fail' => 0, 'total' => 0]];
        foreach ($orders as $value) {
            //参数过滤
            if (!isset($value->number)) TEA('700', 'number');
            if (!isset($value->production_code)) TEA('700', 'production_code');
            if (!isset($value->status)) TEA('700', 'status');
            //默认只插入接口中订单状态为JH(计划)的订单,因为后续要拆单排产
            //取消判断
//            if ($value->status == 'JH') {
            //判断制造BOM是否已经存在,由于制造BOM与生产订单一一对应,生产订单不判断是否存在
            $has = $this->isExisted([['version_description', '=', $value->number]], config('alias.rmb'));
            if ($has) {
                $result['records']['fail'] += 1;
                $result['records']['total'] += 1;
                $result['list'][] = ['error' => 1, 'number' => $value->number, 'message' => '该生产订单已入库,不可重复操作'];
            } else {
                //开启事务
                DB::connection()->beginTransaction();
                //插入相关物料
                $product_id = $this->materialModel->material($value->production_code);
                //大于0  => 有物料有BOM,可生成生产订单,需判断是否已插入
                //等于0  => 有物料无BOM,可生成物料
                //等于-1 => 无物料无BOM,啥都生成不了
                if ($product_id > 0) {
                    //插入BOM
                    $this->erpBomModel->importBomData($value->production_code);
                    //看有无BOM
                    $bom = DB::table(config('alias.rb'))->where([['material_id', '=', $product_id], ['status', '=', '1'], ['is_version_on', '=', 1]])->first();
                    //根据第一步的物料去查BOM是否存在,物料判断好,正常是不会走到BOM为空的情况的
                    if (!empty($bom)) {
                        //生成制造BOM
                        $bom_tree = $this->bomModel->getBomTree($bom->material_id, $bom->version, true, true);
                        $attachments = $this->bomModel->getBomAttachments($bom->id);
                        $bom_input['code'] = $bom->code;
                        $bom_input['material_id'] = $bom->material_id;
                        $bom_input['loss_rate'] = $bom->loss_rate;
                        $bom_input['name'] = $bom->name;
                        $bom_input['bom_group_id'] = $bom->bom_group_id;
                        $bom_input['version'] = $bom->version;
                        $bom_input['version_description'] = $value->number;
                        $bom_input['qty'] = $bom->qty;
                        $bom_input['description'] = $bom->description;
                        $bom_input['bom_tree'] = obj2array($bom_tree);
                        $bom_input['attachments'] = $attachments;
                        $bom_input['differences'] = '';
                        $value->manufacture_bom_id = $this->manufactureModel->add($bom_input, false, 2);
                        //向生产订单表插入数据
                        $data = [
                            'number' => $value->number,//生产订单编号
                            'sales_order_code' => $value->sales_order_no,//销售订单编号
                            'status' => 0,//生产订单状态
                            'product_id' => $product_id,//物料ID
                            'scrap' => 0,//损耗率
                            'qty' => $value->qty,//生产数量
                            'start_date' => strtotime($value->start_date),
                            'creator_id' => $creator_id,
                            'end_date' => strtotime($value->release_date),
                            'manufacture_bom_id' => $value->manufacture_bom_id,//制造BOM的id
                            'ctime' => time(),//创建时间
                            'from' => 2,
                        ];
                        //生成生产订单
                        DB::table(config('alias.rpo'))->insertGetId($data);
                        $result['records']['success'] += 1;
                        $result['records']['total'] += 1;
                        $result['list'][] = ['error' => 0, 'number' => $value->number, 'message' => '拉取成功,已生成生产订单'];
                    } else {
                        //回滚
                        DB::connection()->rollBack();
                        $result['records']['fail'] += 1;
                        $result['records']['total'] += 1;
                        $result['list'][] = ['error' => 1, 'number' => $value->number, 'message' => '该生产订单暂无生效bom无法添加'];
                    }
                } elseif ($product_id == 0) {
                    $result['records']['success'] += 1;
                    $result['records']['total'] += 1;
                    $result['list'][] = ['error' => 0, 'number' => $value->number, 'message' => '拉取成功,已生成物料'];
                } else {
                    $result['records']['fail'] += 1;
                    $result['records']['total'] += 1;
                    $result['list'][] = ['error' => 1, 'number' => $value->number, 'message' => '物料数据异常,未找到可用物料'];
                }
                //提交事务
                DB::connection()->commit();
            }
        }
        return $result;
    }
}