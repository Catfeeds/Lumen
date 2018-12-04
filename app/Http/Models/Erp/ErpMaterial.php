<?php
/**
 * Created by PhpStorm.
 * User: xin
 * Date: 2018/5/7
 * Time: 下午2:25
 */

namespace App\Http\Models\Erp;

use App\Http\Controllers\Test\BruceController;
use App\Http\Models\Base;
use App\Http\Models\Encoding\EncodingSetting;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Session;
use App\Http\Models\Erpbom;

class ErpMaterial extends Base
{
    protected $ErpModel;
    protected $table;
    protected $aTable;
    protected $maTable;
    protected $mcTable;
    protected $uuTable;
    protected $implode;
    protected $creator_id;

    public function __construct()
    {
        $this->table = config('alias.rm');//物料表
        $this->aTable = config('alias.ad');//属性表
        $this->maTable = config('alias.ma');//物料-属性关系表
        $this->mcTable = config('alias.rmc');//物料分类表
        $this->uuTable = config('alias.uu');//基础单位表
        $this->attachment=config('alias.attachment');//基础附件表;
        $this->rmaTable=config('alias.rma');//物料附件关系表;
        $this->ErpModel = new Erpbom();
        $this->EnCode = new EncodingSetting();
        $this->implode = new BruceController();//excel导入model;
        parent::__construct();
    }

    /**物料插入接口;
     * @param $input
     * @return
     * @author
     * @updateLog xin 20180712 维护物料-附件关系;
     */
    public function material($input)
    {
        $this->creator_id = (!empty(session('administrator')->admin_id)) ? session('administrator')->admin_id : 0;
        $production_code = $input;


        $url = 'http://58.221.197.202:30087/Probom/showBom?company_id=&item_no=' . $production_code . '&_token=8b5491b17a70e24107c89f37b1036078';
        $tmp = $this->ErpModel->myCurl($url);
//        return $tmp;
        $needToBeInsert = [$production_code];//顶级production_code;
        foreach ($tmp as $key => $value) {
            $needToBeInsert[] = $value['subitem_code'];//子production_code插入;
        }
        unset($key);
        unset($value);

        //查询顶级production_code是否已经存在, 如果已经插入了那直接返回id
        $production_id = DB::table($this->table)->where('item_no', '=', $production_code)->pluck('id')->toArray();
        if (!empty($production_id)) {
            //已经存在
            //无bom, 返回0;
            if (empty($tmp)) return 0;
            //有bom, 返回production_id
            return $production_id[0];
        }


        //去重复;得到所有顶级bom/非bom物料;
        $needToBeInsert_ = array_unique($needToBeInsert);
        $material = DB::table($this->table)->pluck('item_no')->toArray();
        $needToBeInsert = array_diff($needToBeInsert_, $material);//需要插入的production_code
        //比对material
//        return $needToBeInsert;


        /*
         * 循环调接口获取物料信息
         * todo 后期期望能去除掉foreach调用接口的方式,90%的时间都在这上面浪费掉了;
         */
        $allMaterialInfo = [];//所有物料信息
        $allMaterialAttribute = [];//所有属性信息;单独维护属性;
        $allMaterialUnit = [];//所有物料的单位
        $allMaterialDescription = [];//所有物料规格描述
        $allMaterialInvclass = [];//所有物料分类
        $allMaterialAttachment = [];//所有物料附件
        foreach ($needToBeInsert as $key => $value) {
            $url = 'http://58.221.197.202:30087/Proinv/showInv?company_id=&item_no=' . $value . '&code=&_token=8b5491b17a70e24107c89f37b1036078';
            $tmp = $this->ErpModel->myCurl($url);
            //空数组就跳过, 物料接口都查不到的数据, 直接无视就好了;
//            if (empty($tmp) && $key == 0) TEA('7070');//顶级bom丢失;
            if (empty($tmp) && $key == 0) return -1;//顶级bom丢失;
            if (empty($tmp)) continue;

//            return $tmp[0]['attribute'];
            $allMaterialInfo[] = $tmp[0];
            //获取所有属性名
//            if(!isset($tmp[0]['attribute']))continue;
            foreach ($tmp[0]['attribute'] as $k => $v) {
                $allMaterialAttribute[] = $k;
            }
            unset($k);
            unset($v);
            //所有物料单位
            $allMaterialUnit[] = $tmp[0]['calculate_unit'];
            //所有物料规格(放在description字段里
            $allMaterialDescription[$tmp[0]['item_no']] = $tmp[0]['std'];
            $allMaterialInvclass[$tmp[0]['item_no']] = $tmp[0]['inv_class'];

            //调附件接口获取物料附件 add by xin 20180712
            $url = 'http://58.221.197.202:30087/Proattachment/showAttachment?_token=8b5491b17a70e24107c89f37b1036078&item_no=' . $value;
            $tmp = $this->ErpModel->myCurl($url);
            if (empty($tmp)) continue;
            $allMaterialAttachment[$value] = $tmp;

        }
        unset($key);
        unset($value);
        //去重,得到各种需要参考的属性;
        $allMaterialAttribute = array_unique($allMaterialAttribute);
        $allMaterialUnit = array_unique($allMaterialUnit);

//        return $allMaterialInfo;
//        return $allMaterialAttribute;
//        return $allMaterialUnit;
//        return $allMaterialDescription;
//        return $allMaterialInvclass;
//        return $allMaterialAttachment;

        //如果连production_code在物料里面都查不到, 说明这是个假数据, 直接return -1
        //todo 需要review 在上面的foreach那里, 已经判断过,如果顶级物料没有信息,直接return-1, 是否与这个return-1重复了
        if (empty($allMaterialInfo)) return -1;


        /*category物料分类处理:*/
        //全部的分类 [物料code=>分类id...]数组;
        //$allCategory_Id = $this->dealCategory($needToBeInsert);  //update by xin 20180608;
        $allCategory_Id = $this->dealCategory($allMaterialInvclass);
//        return $allCategory_Id;


        /*物料单位处理*/
        //全部的物料单位 [单位名字=>单位id...]数组;
        $allUnit_Id = $this->dealUnit($allMaterialUnit);
//        return $allUnit_Id;


        /*
         * 插入material表
         */
        //成功插入的物料id;
        $allMaterial_Id = $this->insertMaterial($allMaterialInfo, $allCategory_Id, $allUnit_Id, $allMaterialDescription);
//        return $allMaterial_Id;

        /*物料属性处理*/
        //获取所有的属性名,做array_diff判断;
        $this->dealAttribute($allMaterialAttribute, $allMaterialInfo, $allMaterial_Id);

        /*物料附件处理*/
        //全部物料附件 [物料code=>附件id(str)]数组;
        //add by xin 20180712; 维护物料-附件关系;
        $this->dealAttachment($allMaterialAttachment, $allMaterial_Id);

//        return $allMaterial_Id;
        /*返回值*/
        //如果只有一个物料(传进来的production_code),说明bom接口查不到数据,此物料不是bom, 如果不止一个,说明是bom
        if (count($needToBeInsert) == 1) {
//            TEA('7071');//不是bom
            return 0;
        } else {
            return $allMaterial_Id[$production_code];
        }

    }

    //根据物料分类code批量保存物料;
    public function implodeMaterial($input)
    {
        $this->creator_id = (!empty(session('administrator')->admin_id)) ? session('administrator')->admin_id : 0;
        $production_codes = $input;
//        return $input;

        /*
         * 循环调接口获取物料信息
         * todo 后期期望能去除掉foreach调用接口的方式,90%的时间都在这上面浪费掉了;
         */
        $needToBeInsert_ = [];
        $allMaterialInfo_ = [];//所有物料信息
        $allMaterialAttribute = [];//所有属性信息;单独维护属性;
        $allMaterialUnit = [];//所有物料的单位
        foreach ($production_codes as $key => $value) {
            $url = 'http://58.221.197.202:30087/Proinv/showInv?company_id=&item_no=&code=' . $value . '&_token=8b5491b17a70e24107c89f37b1036078';
            $tmp = $this->ErpModel->myCurl($url);
            foreach ($tmp as $k => $v) {
                //逐个查询是否已经存在;
                $allMaterialInfo_[] = $v;//获取所有的物料id;
            }
            unset($k);
            unset($v);
        }
        unset($key);
        unset($value);
//        return $allMaterialInfo;

        //unique处理;
        foreach ($allMaterialInfo_ as $key => $value) {
            $needToBeInsert_[] = $value['item_no'];
        }
        unset($key);
        unset($value);
//        return $needToBeInsert_;
        $material = DB::table($this->table)->pluck('item_no')->toArray();
        $needToBeInsert = array_diff($needToBeInsert_, $material);//需要插入的production_code
        //此处做一次返回值, 全部插入了直接return0;
        if (empty($needToBeInsert)) return 0;//所有东西都已经插入了;

        $allMaterialInfo = [];//unique过后的所有物料信息;
        foreach ($allMaterialInfo_ as $key => $value) {
            if (in_array($value['item_no'], $needToBeInsert)) {
                $allMaterialInfo[] = $value;
            }
        }
        unset($key);
        unset($value);


//        return $needToBeInsert;

        //把物料的item_no,物料单位和物料属性拆出来;
        foreach ($allMaterialInfo as $key => $value) {
            $needToBeInsert[] = $value['item_no'];
            foreach ($value['attribute'] as $k => $v) {
                $allMaterialAttribute[] = $k;
            }
            unset($k);
            unset($v);
            $allMaterialUnit[] = $value['calculate_unit'];
        }
        unset($key);
        unset($value);

        //去重,得到各种需要参考的属性;
        $allMaterialAttribute = array_unique($allMaterialAttribute);
        $allMaterialUnit = array_unique($allMaterialUnit);

//        return $needToBeInsert;
//        return $allMaterialAttribute;
//        return $allMaterialUnit;

        //如果连production_code在物料里面都查不到, 说明这是个假数据, 直接return -1
//        if (empty($allMaterialInfo)) return -1;


        /*category物料分类处理:*/
        //思路: 通过production_code进行字符串拆分, 拼接成数组,
//        return $needToBeInsert;
        //全部的分类 [分类code=>分类id...]数组;
        $allCategory_Id = $this->dealCategory($needToBeInsert);
//        return $allCategory_Id;


        /*物料单位处理*/;
//        return $allMaterialUnit;
        //全部的物料单位 [单位名字=>单位id...]数组;
        $allUnit_Id = $this->dealUnit($allMaterialUnit);
//        return $allUnit_Id;


        /*
         * 插入material表
         */
        //数据处理
//        return $allMaterialInfo;
//        return $allMaterialDescription;
        //需要插入material数据表的数据
        $allMaterial_Id = $this->insertMaterial($allMaterialInfo, $allCategory_Id, $allUnit_Id);
//        return $allMaterial_Id;


        /*物料属性处理*/
        //获取所有的属性名,做array_diff判断;
        $this->dealAttribute($allMaterialAttribute, $allMaterialInfo, $allMaterial_Id);

//        return $allMaterial_Id;
        /*返回值*/
        //如果只有一个物料(传进来的production_code),说明bom接口查不到数据,此物料不是bom, 如果不止一个,说明是bom
        if (count($needToBeInsert) == 1) {
//            TEA('7071');//不是bom
            return 0;
        } else {
            return $allMaterial_Id;
        }
    }

    /**
     * 物料单位处理;
     * @param $allMaterialUnit
     * @return  $allUnit_Id
     * @author  xin 20180516
     */
    protected function dealUnit($allMaterialUnit)
    {
        $allUnit_Id = [];
        foreach ($allMaterialUnit as $key => $value) {
            $has = DB::table($this->uuTable)->where('unit_text', '=', $value)->pluck('id');
            if (count($has) > 0) {
                $allUnit_Id[$value] = $has[0];
            } else {
                $tmpInsert = [
                    'name' => $value,
                    'deletable' => 1,
                    'is_base' => 1,
                    'unit_text' => $value,
                    'iso_code' => $value,
                    'commercial' => $value,
                    'technical' => $value,
                    'label' => $value,
                    'from' => 'erp'//来源erp;
                ];
                $allUnit_Id[$value] = DB::table($this->uuTable)->insertGetId($tmpInsert);
            }
        }
        unset($key);
        unset($value);
        return $allUnit_Id;
    }

    /**
     * 物料分类处理;
     * @param   $needToBeInsert
     * @return  $$allCategory_Id
     * @author  xin 20180516
     * @review  xin 20180608  由于erp物料数据只有一层物料分类(第一个-号之前的字符), 改变mes系统的物料分类插入, 暂定为由ERP物料接口获取物料分类字段, 例如BMCP, 则一级分类BM, 二级分类BMC, 三级分类BMCP
     */
    protected function dealCategory($needToBeInsert)
    {
        $allCategory_Id = [];
        foreach ($needToBeInsert as $key => $tmpArr) {
//            return $tmpArr;
//            return $tmpArr;
            //拆分物料分类;
            //一级分类
            $category1 = substr($tmpArr, 0, 2);
            //一级分类的id
            $fatherId = $this->getFatherId($category1, 0);
//            return $fatherId;
            $categoryLen = strlen($tmpArr);
            //2层结构
            if ($categoryLen >= 3) {
                $category2 = substr($tmpArr, 0, 3);
                $fatherId = $this->getFatherId($category2, $fatherId);
            }
            //3层结构
            if ($categoryLen == 4) {
                $category3 = substr($tmpArr, 0, 4);
                $fatherId = $this->getFatherId($category3, $fatherId);
            }

            $allCategory_Id[$key] = $fatherId;

            unset($k);
            unset($v);
        }
//
        unset($key);
        unset($value);
        return $allCategory_Id;
    }

    /**
     * 专供dealCategory函数使用, 输入分类name和parent_id, 返回分类的id(存在就返回id, 不存在就先插入再返回id)
     * @param
     * @return
     * @author
     */
    protected function getFatherId($code, $parent_id)
    {
        $has = DB::table($this->mcTable)->where([['code', '=', $code], ['parent_id', '=', $parent_id]])->pluck('id');
//        return $has;
        if (count($has) > 0) {
            $id = $has[0];
        } else {
            $insertData = [
                'code' => $code,
                'name' => $code,
                'forefathers' => '',
                'parent_id' => $parent_id,
                'from' => 'erp'
            ];
            $id = DB::table($this->mcTable)->insertGetid($insertData);
        }
        return $id;
    }

    /**
     * @param   $allMaterialAttribute   所有查询到的物料属性
     * @param   $allMaterialInfo        所有查询到的物料信息
     * @param   $allMaterial_Id         所有已经插入的物料id;
     * @return
     * @author  xin 20180516
     */
    protected function dealAttribute($allMaterialAttribute, $allMaterialInfo, $allMaterial_Id)
    {
        $allAttribute = DB::table($this->aTable)->pluck('name')->toArray();
        $NTBIattribute = array_diff($allMaterialAttribute, $allAttribute);//需要插入的属性; NTBI=need to be insert
//        return $NTBIattribute;
        //循环查询属性信息,返回属性id;
        $insertAttributeData = [];
        foreach ($NTBIattribute as $value) {
            //自动生成物料属性编码
            $key = $this->EnCode->get(['type_code' => '', 'type' => 3]);
            $key_ = $this->EnCode->useEncoding(3, $key['code']);
            $insertAttributeData[] = [
                'key' => $key_,
                'name' => $value,
                'unit_id' => 0,
                'datatype_id' => 3,
                'range' => '{}',
                'category_id' => 3,
                'from' => 'erp'
            ];
        }
        unset($value);
        DB::table($this->aTable)->insert($insertAttributeData);
//        return $insertAttributeData;
        //所有的属性 ,[属性名=>属性id...]形式数组
        $allAttribute_Id = DB::table($this->aTable)->pluck('id', 'name')->toArray();
//        return $allAttribute_Id;
//        return $allMaterialInfo;

        //拼接插入material_attribute表的数据;
        $insertMAData = [];
        foreach ($allMaterialInfo as $key => $value) {
            //物料id
            $materialId = $allMaterial_Id[$value['item_no']];
            foreach ($value['attribute'] as $k => $v) {
                $insertMAData[] = [
                    'material_id' => $materialId,
                    'attribute_definition_id' => $allAttribute_Id[$k],
                    'value' => $v,
                    'is_view' => 1,
                    'from' => 'erp'
                ];
            }
        }
        unset($key);
        unset($value);
        DB::table($this->maTable)->insert($insertMAData);
    }

    /**
     * @param   $allMaterialAttachment    所有查询到的物料附件
     * @return
     * @author  xin 20180712
     */
    public function dealAttachment($allMaterialAttachment,$allMaterial_id)
    {
        if(count($allMaterialAttachment)==0)return false;
        $admin_id=session('administrator')->admin_id;
        $halfCP=[];
        $rmaInsertData=[];

        foreach($allMaterialAttachment as $key => $value){
            //循环插入基础附件表;
            foreach($value as $k => $v){
                $insertData=[
                    'name'=>$v['file_name'],
                    'filename'=>$v['file_name'],
                    'path'=>$v['file_dir'],
                    'extension'=>$v['file_ext'],
                    'size'=>$v['file_length'],
                    'ctime'=>time(),
                    'mtime'=>time(),
                    'creator_id'=>$admin_id,
                    'is_from_erp'=>1
                ];
//                $halfCP[$allMaterial_id[$key]][]=DB::table($this->attachment)->insertGetId($insertData);
                //获取插入附件表基础表的数据
                $aID=DB::table($this->attachment)->insertGetId($insertData);
                //创建插入物料-附件关系表的数据
                $rmaInsertData[]=[
                    'material_id'=>$allMaterial_id[$key],
                    'attachment_id'=>$aID,
                    'is_from_erp'=>1
                ];
            }unset($k,$v);

        }unset($key,$value);
        DB::table($this->rmaTable)->insert($rmaInsertData);

    }

    /**
     * @param $allMaterialInfo  所有需要插入的物料
     * @param $allCategory_Id   所有物料分类id
     * @param $allUnit_Id       所有物料单位id
     * @return   $allMaterial_Id    所有插入的物料id
     * @author   xin20180516
     */
    protected function insertMaterial($allMaterialInfo, $allCategory_Id, $allUnit_Id, $allMaterialDescription = [])
    {
        $insertMaterial_ = [];

        $starttime = time();
        foreach ($allMaterialInfo as $key => $value) {
            $uuid = create_uuid();
            $insertMaterial_[] = [
                'uuid' => $uuid,
                'item_no' => $value['item_no'],
                'material_category_id' => $allCategory_Id[$value['item_no']],
                'name' => $value['name'],
                'unit_id' => $allUnit_Id[$value['calculate_unit']],
                'template_id' => 0,
                'source' => 1,
                'creator_id' => $this->creator_id,
                'mtime' => $starttime,
                'ctime' => $starttime,
                'is_provider' => 0,
                'description' => isset($allMaterialDescription[$value['item_no']]) ? $allMaterialDescription[$value['item_no']] : '',
                'from' => 'erp'
            ];
        }
        unset($key);
        unset($value);
//        return $insertMaterial_;
        //开启事务
        try {
            DB::connection()->beginTransaction();
            DB::table($this->table)->insert($insertMaterial_);
        } catch (\ApiException $e) {
            //回滚
            DB::connection()->rollBack();
            TEA($e->getCode());
        }
        //提交事务
        DB::connection()->commit();
        $endtime = time();

        //成功插入的物料id;
        $allMaterial_Id = DB::table($this->table)->where([['mtime', '<=', $endtime], ['mtime', '>=', $starttime]])->pluck('id', 'item_no');
        return $allMaterial_Id;
    }
}