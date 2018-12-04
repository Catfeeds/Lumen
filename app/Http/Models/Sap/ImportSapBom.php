<?php
/**
 * Created by PhpStorm.
 * User: haoziye
 * Date: 2018/8/23
 * Time: 上午10:18
 */
namespace App\Http\Models\Sap;

use App\Http\Models\Base;
use App\Http\Models\BomRouting;
use Illuminate\Support\Facades\DB;

class ImportSapBom extends Base{

    public function __construct()
    {
        parent::__construct();
    }

    /**
     * @param $input
     * @throws \App\Exceptions\ApiException
     * @throws \App\Exceptions\ApiSapException
     */
    public function importSapBomData($input){
        $data = $this->groupBomData($input);
        $bom_data = $data['bom_material'];
        $bom_item_data = $data['item_materials'];
//        DB::connection()->beginTransaction();
        try{
            //1.如果没有
            if(!$bom_data['has_bom']){
                $bom_id = $this->addBom($bom_data,1);
                $this->addBomItem($bom_id,$bom_data['material_id'],$bom_item_data);
                //添加默认
//                $this->addMaterialDefaultBom($bom_data['material_id'],$bom_data['STLAL']);
            }else if($bom_data['has_bom'] && $bom_data['need_upgrade']){
                //已经有相同编号的bom要判断是否升级
                //1.有ecm升级，无ecm不变
                $this->upgradeBom($bom_data,$bom_item_data);
            }
            //添加bom和工厂的关联
            if(!empty($bom_data['WERKS'])){
                $this->createBomToFactory($bom_data['MATNR'],$bom_data['STLAL'],$bom_data['WERKS']);
            }
        }catch (\ApiException $e){
//            DB::connection()->rollback();
            TESAP('500',$e->getMessage());
        }
//        DB::connection()->commit();
    }

    public function createBomToFactory($material_code,$bom_no,$factory_code){
        $factory_id = DB::table(config('alias.rf'))->where('code',$factory_code)->value('id');
        $has = DB::table(config('alias.rbf'))->where([['bom_no','=',$bom_no],['material_code','=',$material_code],['factory_id','=',$factory_id]])->count();
        if(!$has) DB::table(config('alias.rbf'))->insert(['bom_no'=>$bom_no,'ctime'=>time(),'factory_id'=>$factory_id,'material_code'=>$material_code]);
    }

    /**
     * 整理sap过来的数据
     * @param $input
     * @return array
     */
    public function groupBomData($input){
        //sap拿过来的都是bom子项的信息，但是每个子项都会包含父项的信息
        /**
         * 但是会有以下几种情况
         * 1.bom的物料不存在或子项物料不存在 此种情况已排除，因为物料会在bom之前导入
         * 3.bom已经存在的情况下可能是升级bom 此种情况，第一判断条件是sap过来的子项的最大更改编号于mes中已有的bom的子项的最大更改编号不一致
         * 4.bom可能是一个物料的多个bom之一 此种情况导致在导入bom的过程中无法完成组装
         */
        $bom = [];
        //判断bom的物料存不存在
        $bom_material = DB::table(config('alias.rm'))->where('item_no',preg_replace('/^0+/','',$input[0]['MATNR']))->first();
        if(empty($bom_material)){
            //添加物料
            TESAP('2475');
        }else{
            $bom['material_id'] = $bom_material->id;
            $bom['material_name'] = $bom_material->name;
        }
        $bom['MATNR'] = preg_replace('/^0+/','',$input[0]['MATNR']);
//        $bom['AENNR'] = '';//这个字段是子项的属性，要删除
//        $bom['DATUV'] = $input[0]['DATUV'];//这个字段是子项的属性，要删除
        $bom['STLAL'] = $input[0]['STLAL'];
        $bom['STLAN'] = $input[0]['STLAN'];
        $bom['BMENG'] = $input[0]['BMENG'];
        $bom['BMEIN'] = $input[0]['BMEIN'];
        $bom['STLST'] = $input[0]['STLST'];
        $bom['LKENZ'] = $input[0]['LKENZ'];
        $bom['ZTEXT'] = $input[0]['ZTEXT'];//备注
        $bom['WERKS'] = $input[0]['WERKS'];//工厂
        $bom_item = [];
        //首先判断bom是否已经存在
        $old_biggest_aennr = 0;//定义老bom的最大子项更改编号
        $old_bom = DB::table(config('alias.rb'))->where([['material_id','=',$bom['material_id']],['bom_no','=',$bom['STLAL']]])->orderBy('version','desc')->first();
        if(!empty($old_bom)){
            $bom['has_bom'] = true;
            $old_biggest_aennr = DB::table(config('alias.rbi'))->where('bom_id','=',$old_bom->id)->orderby('AENNR','desc')->value('AENNR');
        }else{
            $bom['has_bom'] = false;
        }
        //找到sap子项最大更改编号
        $new_biggest_aennr = [
            'AENNR'=>0,
            'DATUV'=>0,
        ];
        //定义新bom最大子项更改编号 同时收集子项的bom单位
        $bom_unit_list = [];
        $bom_unit_list[] = $input[0]['BMEIN'];
        foreach ($input as $k=>$v){
            //如果有更改编号比定义的高就赋值
            if($v['AENNR'] > $new_biggest_aennr['AENNR']){
                $new_biggest_aennr['AENNR'] = $v['AENNR'];
                $new_biggest_aennr['DATUV'] = strtotime($v['DATUV']);
            }
            if(!in_array($v['MEINS'],$bom_unit_list)){
                $bom_unit_list[] = $v['MEINS'];
            }
        }
        //查找所有单位
        $bom_units = DB::table(config('alias.ruu'))->whereIn('commercial',$bom_unit_list)->pluck('id','commercial');
        $bom_units = array_change_key_case(obj2array($bom_units),CASE_LOWER);
        $bom['bom_unit_id'] = !empty($bom_units[strtolower($input[0]['BMEIN'])]) ? $bom_units[strtolower($input[0]['BMEIN'])] : 0;
        foreach ($input as $k=>$v){
            if(strtotime($v['DATUB']) < $new_biggest_aennr['DATUV']) continue;
            $bom_item[preg_replace('/^0+/','',$v['IDNRK']).'-'.$v['POSNR']] = [
                'POSNR'=>$v['POSNR'],
                'POSTP'=>$v['POSTP'],
                'IDNRK'=>$v['IDNRK'],
                'MAKTX'=>$v['MAKTX'],
                'MENGE'=>$v['MENGE'],
                'MEINS'=>$v['MEINS'],
                'AENNR'=>$v['AENNR'],
                'DATUV'=>strtotime($v['DATUV']),
                'DATUB'=>strtotime($v['DATUB']),
                'bom_unit_id'=>!empty($bom_units[strtolower($v['MEINS'])]) ? $bom_units[strtolower($v['MEINS'])] : 0,
            ];
            $item_material = DB::table(config('alias.rm'))->where('item_no',preg_replace('/^0+/','',$v['IDNRK']))->first();
            if(empty($item_material)){
                TESAP('2476','编码：'.$v['IDNRK']);
                $item_materials[] = $v;
            }else{
                $bom_item[preg_replace('/^0+/','',$v['IDNRK']).'-'.$v['POSNR']]['material_id'] = $item_material->id;
//                $item_bom = DB::table(config('alias.rb'))->select('version')->where([['material_id','=',$item_material->id],['is_version_on','=',1]])->first();
//                if(!empty($item_bom)){
//                    $bom_item[preg_replace('/^0+/','',$v['IDNRK'])]['is_assembly'] = 1;
//                    $bom_item[preg_replace('/^0+/','',$v['IDNRK'])]['version'] = $item_bom->version;
//                }else{
//                    $bom_item[preg_replace('/^0+/','',$v['IDNRK'])]['is_assembly'] = 2;
//                    $bom_item[preg_replace('/^0+/','',$v['IDNRK'])]['version'] = 0;
//                }
            }
        }
        //判断是否要升级
        if($new_biggest_aennr['AENNR'] > $old_biggest_aennr){
            $bom['need_upgrade'] = true;
        }else{
            $bom['need_upgrade'] = false;
        }
        return ['bom_material'=>$bom,'item_materials'=>$bom_item];
    }

//region 增

    /**
     * 添加新bom
     * @param $bom_data
     * @return mixed
     * @throws \App\Exceptions\ApiException
     */
    public function addBom($bom_data,$version,$is_upgradeBom = false){
        $bomData = [
            'code' => $bom_data['MATNR'],//bom编码
            'name' => $bom_data['material_name'],//名称
            'version' => $version,//版本
            'material_id' => $bom_data['material_id'],//物料id
            'status' => ($bom_data['STLST'] == 1 && empty($bom_data['LKENZ'])) ? 1 : 0,
            'qty' => $bom_data['BMENG'],
            'creator_id' => (!empty(session('administrator')->admin_id)) ? session('administrator')->admin_id : 0,
            'company_id' => (!empty(session('administrator')->company_id)) ? session('administrator')->company_id : 0,
            'factory_id' => (!empty(session('administrator')->factory_id)) ? session('administrator')->factory_id : 0,
            'mtime' => time(),//最后修改时间
            'ctime' => time(),//创建时间
            'from' => 3,
            'bom_no' => $bom_data['STLAL'],
//            'DATUV' => strtotime($bom_data['DATUV']),
            'BMEIN' => $bom_data['BMEIN'],
            'STLAN' => $bom_data['STLAN'],
            'is_ecm' => !empty($bom_data['is_ecm']) ? $bom_data['is_ecm'] : 0,
//            'AENNR'=>$bom_data['AENNR'],
            'loss_rate' => !empty($bom_data['loss_rate']) ? $bom_data['loss_rate'] : 0,
            'bom_group_id' => !empty($bom_data['bom_group_id']) ? $bom_data['bom_group_id'] : 0,
            'label' => !empty($bom_data['label']) ? $bom_data['label'] : '',
//            'description' => !empty($bom_data['description']) ? $bom_data['description'] : '',
            'operation_id' => !empty($bom_data['operation_id']) ? $bom_data['operation_id'] : '',
            'operation_ability' => !empty($bom_data['operation_ability']) ? $bom_data['operation_ability'] : '',
            'description'=>$bom_data['ZTEXT'],
            'is_version_on'=>($is_upgradeBom) ? 0 : 1,
            'bom_unit_id'=>$bom_data['bom_unit_id'],
        ];
        $bom_id = DB::table(config('alias.rb'))->insertGetId($bomData);
        if(!$bom_id) TESAP('802');
        return $bom_id;
    }

    /**
     * 添加bom的子项
     * @param $bom_id
     * @param $bom_material_id
     * @param $bom_item_data
     */
    public function addBomItem($bom_id,$bom_material_id,$bom_item_data){
        $bom_items = [];
        $item_material_ids = [];
        foreach ($bom_item_data as $k=>$v){
            $bom_items[] = [
                'bom_id'=>$bom_id,
                'parent_id'=>0,
                'material_id'=>$v['material_id'],
                'bom_material_id'=>$bom_material_id,
                'usage_number'=>$v['MENGE'],
                'from'=>3,
                'total_consume'=>0,
                'comment'=>$v['MAKTX'],
                'POSNR'=>$v['POSNR'],
                'POSTP'=>$v['POSTP'],
                'MEINS'=>$v['MEINS'],
                'is_assembly'=>0,
                'version'=>0,
                'bom_no'=>'',
                'AENNR'=>$v['AENNR'],
                'DATUV'=>$v['DATUV'],
                'DATUB'=>$v['DATUB'],
                'bom_unit_id'=>$v['bom_unit_id'],
            ];
            $item_material_ids[] = $v['material_id'];
        }
        if(!empty($bom_items)){
            DB::table(config('alias.rbi'))->insert($bom_items);
            //并且更新bom的子项物料集合
            DB::table(config('alias.rb'))->where('id',$bom_id)->update(['item_material_path'=>implode(',',$item_material_ids)]);
        }
    }

    /**
     * 当sap传来的数据需要升级时（再改我是zz,我tm真是zz）
     * @param $bom_data
     * @param $bom_item_data
     * @throws \App\Exceptions\ApiException
     */
    public function upgradeBom($bom_data,$bom_item_data){
        //找到物料对应的bom编号的最大版本的bom
        $bom = DB::table(config('alias.rb'))
            ->where([['bom_no','=',$bom_data['STLAL']],['material_id','=',$bom_data['material_id']]])
            ->orderBy('version','desc')
            ->first();
        //先添加bom，因为是根据最大版本升级的，前一个版本维护过的数据
        $bom_data['loss_rate'] = $bom->loss_rate;
        $bom_data['bom_group_id'] = $bom->bom_group_id;
        $bom_data['label'] = $bom->label;
        $bom_data['description'] = $bom->description;
        $bom_data['operation_id'] = $bom->operation_id;
        $bom_data['operation_ability'] = $bom->operation_ability;
        $bom_data['is_ecm'] = 1;
        $bom_new_id = $this->addBom($bom_data,$bom->version+1,true);
        //然后添加bom的子项，如果以前有相同子项并且维护过替换物料和阶梯用量
        //先找寻和上个版本相同的子项
        $now_bom_item = [];
        $now_bom_ids = [];
        foreach ($bom_item_data as $k=>$v){
            $now_bom_item[$v['material_id'].'-'.$v['POSNR']] = $v;
            $now_bom_ids[] = $v['material_id'];
        }
        //以前和现在相同的子项
        $res = DB::table(config('alias.rbi'))->where('bom_id',$bom->id)->whereIn('material_id',$now_bom_ids)->get();
        $res = obj2array($res);
        $old_bom_item = [];
        foreach ($res as $k=>$v){
            $old_bom_item[$v['id']] = $v;
        }
        //拿出子项的阶梯用量
        $qty_level = DB::table(config('alias.rbiql'))->whereIn('bom_item_id',array_keys($old_bom_item))->get();
        $qty_level = obj2array($qty_level);
        //拿出子项的替换物料
        $item_replace_item = DB::table(config('alias.rbi'))->whereIn('parent_id',array_keys($old_bom_item))->get();
        $item_replace_item = obj2array($item_replace_item);
        //拿出子项替换物料的阶梯用量
        $old_replace_item = [];
        foreach ($item_replace_item as $k=>$v){
            $old_replace_item[$v['id']] = $v;
        }
        $replace_item_qty_level = DB::table(config('alias.rbiql'))->whereIn('bom_item_id',array_keys($old_replace_item))->get();
        $replace_item_qty_level = obj2array($replace_item_qty_level);
        //所有的数据都要映射进映射进新子项中去
        foreach ($replace_item_qty_level as $k=>$v){
            $old_replace_item[$v['bom_item_id']]['bom_item_qty_levels'][] = $v;
        }
        foreach ($old_replace_item as $k=>&$v){
            //相同子项老的子项的替换物料的子项
            $item_son = DB::table(config('alias.rbi').' as rbi')
                ->leftJoin(config('alias.rb').' as rb','rb.id','rbi.bom_id')
                ->where([['rb.material_id','=',$v['material_id']],['rb.bom_no','=',$v['bom_no']],['rb.is_version_on','=',1],['rb.status','=',1],['rbi.parent_id','=',0]])
                ->pluck('rbi.material_id');
//            $old_bom_item[$v['parent_id']]['replace']['son_material_id'] = obj2array($item_son);
            $v['son_material_id'] = obj2array($item_son);
            $old_bom_item[$v['parent_id']]['replace'][] = $v;
        }
        foreach ($qty_level as $k=>$v){
            $old_bom_item[$v['bom_item_id']]['bom_item_qty_levels'][] = $v;
        }
        //添加子项
        $ref_old_bom_item = [];
        foreach ($old_bom_item as $k=>$v){
            $ref_old_bom_item[$v['material_id'].'-'.$v['POSNR']] = $v;
            $item_son = DB::table(config('alias.rbi').' as rbi')
                ->leftJoin(config('alias.rb').' as rb','rb.id','rbi.bom_id')
                ->where([['rb.material_id','=',$v['material_id']],['rb.is_version_on','=',1],['rb.bom_no','=',$v['bom_no']],['rb.status','=',1],['rbi.parent_id','=',0]])
                ->pluck('rbi.material_id');
            $ref_old_bom_item[$v['material_id'].'-'.$v['POSNR']]['son_material_id'] = obj2array($item_son);
        }
        $qtys = [];
        //物料id
        $item_material_ids = [];
        //替换物料id
        $item_replace_material_ids = [];
        foreach ($now_bom_item as $k=>$v){
            if(!empty($ref_old_bom_item[$k]['son_material_id'])) $item_material_ids = array_merge($item_material_ids,$ref_old_bom_item[$k]['son_material_id']);
            array_push($item_material_ids,$v['material_id']);
            $bom_item = [
                'bom_id'=>$bom_new_id,
                'parent_id'=>0,
                'material_id'=>$v['material_id'],
                'bom_material_id'=>$bom_data['material_id'],
                'usage_number'=>$v['MENGE'],
                'from'=>3,
                'total_consume'=>!empty($ref_old_bom_item[$k]['total_consume']) ? $ref_old_bom_item[$k]['total_consume'] : 0,
                'is_assembly'=>!empty($ref_old_bom_item[$k]['is_assembly']) ? $ref_old_bom_item[$k]['is_assembly'] : 0,
                'version'=>!empty($ref_old_bom_item[$k]['version']) ? $ref_old_bom_item[$k]['version'] : 0,
                'bom_no'=>!empty($ref_old_bom_item[$k]['bom_no']) ? $ref_old_bom_item[$k]['bom_no'] : '',
                'comment'=>$v['MAKTX'],
                'POSNR'=>$v['POSNR'],
                'POSTP'=>$v['POSTP'],
                'MEINS'=>$v['MEINS'],
                'AENNR'=>$v['AENNR'],
                'DATUV'=>$v['DATUV'],
                'DATUB'=>$v['DATUB'],
                'bom_unit_id'=>$v['bom_unit_id'],
            ];
            $insert_id = DB::table(config('alias.rbi'))->insertGetId($bom_item);
            if (!$insert_id) TEA('802');
            if(!empty($ref_old_bom_item[$k]['bom_item_qty_levels'])){
                foreach ($ref_old_bom_item[$k]['bom_item_qty_levels'] as $rowQty){
                    $qtys[] = [
                        'bom_item_id'=>$insert_id,
                        'parent_min_qty'=>$rowQty['parent_min_qty'],
                        'qty'=>$rowQty['qty'],
                    ];
                }
            }
            if(!empty($ref_old_bom_item[$k]['replace'])){
                foreach ($ref_old_bom_item[$k]['replace'] as $rowReplace){
                    $item_replace_material_ids = array_merge($item_replace_material_ids,$rowReplace['son_material_id']);
                    array_push($item_replace_material_ids,$rowReplace['material_id']);
                    $replaceData = [
                        'bom_id'=>$bom_new_id,
                        'bom_material_id'=>$bom_data['material_id'],
                        'parent_id'=>$insert_id,
                        'material_id'=>$rowReplace['material_id'],
                        'version'=>$rowReplace['version'],
                        'loss_rate'=>$rowReplace['loss_rate'],
                        'is_assembly'=>$rowReplace['is_assembly'],
                        'usage_number'=>$rowReplace['usage_number'],
                        'comment'=>$rowReplace['comment'],
                        'total_consume'=>$rowReplace['total_consume'],
                        'bom_no'=>$rowReplace['bom_no'],
                        'bom_unit_id'=>$rowReplace['bom_unit_id'],
                    ];
                    $replace_insert_id = DB::table(config('alias.rbi') )->insertGetId($replaceData);
                    if (!$replace_insert_id) TEA('802');
                    //遍历阶梯数据
                    if(!empty($rowReplace['bom_item_qty_levels'])){
                        foreach ($rowReplace['bom_item_qty_levels'] as $rowReplaceQty){
                            $qtys[] = [
                                'bom_item_id'=>$replace_insert_id,
                                'parent_min_qty'=>$rowReplaceQty['parent_min_qty'],
                                'qty'=>$rowReplaceQty['qty'],
                            ];
                        }
                    }
                }
            }
        }
        if(!empty($qtys)) DB::table(config('alias.rbiql'))->insert($qtys);
        if(!empty($item_material_ids) || !empty($item_replace_material_ids)){
            $material_ids = [
                'item_material_path'=>empty(implode(',',$item_material_ids))?'':','.implode(',',$item_material_ids).',',
                'replace_material_path'=>empty(implode(',',$item_replace_material_ids))?'':','.implode(',',$item_replace_material_ids).','];
            if(is_array($material_ids)) DB::table(config('alias.rb'))->where('id', $bom_new_id)->update($material_ids);
        }
        //添加老版本的附件
        $sql = "insert into ruis_bom_attachment (bom_id,attachment_id,comment) select ".$bom_new_id.",attachment_id,comment from ruis_bom_attachment where bom_id=".$bom->id;
        DB::select($sql);
        //复制老版本的工艺路线
        $bomRoutingDao = new BomRouting();
        $bomRoutingDao->addBomRoutingByUpgrade($bom_new_id,$bom->id,0,$bom->version + 1,'');
    }

    /**
     * 添加物料默认bom
     * @param $bom_material_id
     * @param $bom_no
     */
    public function addMaterialDefaultBom($bom_material_id,$bom_no){
        //查找是否该物料已经有默认编号
        $material = DB::table(config('alias.rm'))->select('default_bom_no')->where('id',$bom_material_id)->first();
        //将道理没有的拿新建的bom编号做默认，有的话可能直接修改为新建的或者不修改，总之现在先修改为新建
        DB::table(config('alias.rm'))->where('id',$bom_material_id)->update(['default_bom_no'=>$bom_no]);
    }

//endregion

}