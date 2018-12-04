<?php
/**
 * Created by PhpStorm.
 * User: haoziye
 * Date: 2018/5/8
 * Time: 上午9:18
 */
namespace App\Http\Models\Erp;
use App\Libraries\Tree;
use Illuminate\Support\Facades\DB;
use App\Http\Models\Base;

class ErpBomDataImport extends Base{

    public function __construct()
    {
        parent::__construct();
    }

//region 查

    public function getBomData($url,$item_no,$company_id = 0){
//        $url = "http://58.221.197.202:30087/Probom/showBom?_token=8b5491b17a70e24107c89f37b1036078";
        if(!empty($item_no)) $url .= "&item_no=".$item_no;
        if(!empty($company_id)) $url .= "&company_id=".$company_id;
        $curl = curl_init($url);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt ($curl, CURLOPT_CONNECTTIMEOUT, 5);
        $bomData = curl_exec($curl);
        curl_close($curl);
        $bomData = trim($bomData,chr(239).chr(187).chr(191));
        $bomData = json_decode($bomData,true);
        return $bomData['results'];
    }

//endregion

//region 增

    /**
     * 组合出要添加的bom和item数据
     */
    public function createBomAndItemData($bomData,&$bomList,$bom_code){
        //1.先得到bom
        $bom = [
            'bom_material_code'=>$bom_code,
        ];
        foreach ($bomData as $k=>$v){
            //如果parent_code为bom的物料code，则改项为他的子项
            if($v['parent_code'] == $bom_code){
                $bom['item'][] = [
                    'item_material_code'=>$v['subitem_code'],
                    'usage_number'=>$v['child_qty'],
                ];
                //如果子项还有子项
                $has = false;
                foreach ($bomData as $j=>$w){
                    if($w['parent_code'] == $v['subitem_code']){
                        $has = true;
                        break;
                    }
                }
                if($has){
                    $this->createBomAndItemData($bomData,$bomList,$v['subitem_code']);
                }
            }
        }
        $bomList[] = $bom;
    }


    public function importBomData($item_no){
        $bomData = $this->getBomData('http://58.221.197.202:30087/Probom/showBom?_token=8b5491b17a70e24107c89f37b1036078',$item_no);
        $bomList = [];
        //如果获取的bom结构空了或者只有他本身一条数据那么bom也就没必要添加了
        if(!empty($bomData)){
            $this->createBomAndItemData($bomData,$bomList,$item_no);
        }
        try{
            DB::connection()->beginTransaction();
            foreach ($bomList as $k=>$v) {
                //先查找bom物料信息,如果没有就跳过
                $bom_material = DB::table(config('alias.rm'))->select('id', 'name','description','material_category_id')->where('item_no', $v['bom_material_code'])->first();
                if (empty($bom_material)) continue;
                //再判断此物料有没有存在bom，如果存在，不继续添加
                $has = $this->isExisted([['material_id', '=', $bom_material->id]], config('alias.rb'));
                if ($has) continue;
                $bomData = [
                    'code' => $v['bom_material_code'],//bom编码
                    'name' => $bom_material->name,//名称
                    'version' => 1,//版本
                    'material_id' => $bom_material->id,//物料id
                    'status' => 1,
                    'qty' => 1,
                    'creator_id' => (!empty(session('administrator')->admin_id)) ? session('administrator')->admin_id : 0,
                    'company_id' => (!empty(session('administrator')->company_id)) ? session('administrator')->company_id : 0,
                    'factory_id' => (!empty(session('administrator')->factory_id)) ? session('administrator')->factory_id : 0,
                    'mtime' => time(),//最后修改时间
                    'ctime' => time(),//创建时间
                    'is_version_on'=>1,
                    'is_from_erp'=>1,
                    'description'=>$bom_material->description,
                ];
                $bom_id = DB::table(config('alias.rb'))->insertGetId($bomData);
                $item_material_ids = [];//子项物料id的集合
                $bom_items = [];
                //如果bom顶级物料的上级物料分类为模塑或棉，那么要额外拿到棉泡作为进料
                $bom_mother_category_code = $this->getMotherMaterialCategory($bom_material->material_category_id);
                $erp_mp = config('app.erp_mp');
                if(in_array($bom_mother_category_code,array_keys($erp_mp))){
                    $common_material= DB::table(config('alias.rm').' as rm')->select('rm.id')
                        ->leftJoin(config('alias.rmc').' as rmc','rmc.id','rm.material_category_id')
                        ->where('rmc.code',$erp_mp[$bom_mother_category_code])
                        ->whereNull('rm.from')
                        ->first();
                    $bom_items[] = [
                        'bom_id'=>$bom_id,
                        'parent_id'=>0,
                        'material_id'=>$common_material->id,
                        'bom_material_id'=>$bom_material->id,
                        'usage_number'=>1,
                        'is_from_erp'=>1,
                        'total_consume'=>0,
                        'is_assembly'=>0,
                        'version'=>0,
                    ];
                }
                //添加bom的附件
                $this->addBomAttachment($item_no,$bom_id);
                foreach ($v['item'] as $j => $w) {
                    $item_material = DB::table(config('alias.rm').' as rm')->select('rm.id','rm.item_no','rm.name','rmc.id as material_category_id','rm.description','rmc.code')
                        ->leftJoin(config('alias.rmc').' as rmc','rmc.id','rm.material_category_id')
                        ->where('rm.item_no', $w['item_material_code'])->first();
                    if (empty($item_material)) continue;
                    $is_assembly = 0;
                    $version = 0;
                    $has_bom = $this->isExisted([['material_id','=',$item_material->id]],config('alias.rb'));
                    if($has_bom){
                        $is_assembly = 1;
                        $version = 1;
                    }
                    //如果子项的上级物料分类为模塑或棉，那么要额外生成bom
                    //因为通用棉泡的物料分类也是定义在BPM，BPC，FLT下的，但是上面bom的顶级物料的物料分类为BPM或者BPC，FLT的话也会拿到通用棉泡作为进料，
                    //就会导致生成一个通用棉泡的bom并且进料为它自己
                    if(!in_array($item_material->code,array_keys($erp_mp))){
                        $mother_category_code = $this->getMotherMaterialCategory($item_material->material_category_id);
                        if(in_array($mother_category_code,array_keys($erp_mp)) && !$has_bom){
                            $is_assembly = 1;
                            $version = 1;
                            $this->insertMPBom($item_material,$mother_category_code);
                        }
                    }
                    $item_material_ids[] = $item_material->id;
                    $bom_items[] = [
                        'bom_id'=>$bom_id,
                        'parent_id'=>0,
                        'material_id'=>$item_material->id,
                        'bom_material_id'=>$bom_material->id,
                        'usage_number'=>$w['usage_number'],
                        'is_from_erp'=>1,
                        'total_consume'=>0,
                        'is_assembly'=>$is_assembly,
                        'version'=>$version,
                    ];
                }
                //如果子项物料一个都不存在，那么bom也没有存在的必要了，理论上应该删除,这边先不删了
                if(!empty($bom_items)){
                    DB::table(config('alias.rbi'))->insert($bom_items);
                    //并且更新bom的子项物料集合
                    DB::table(config('alias.rb'))->where('id',$bom_id)->update(['item_material_path'=>implode(',',$item_material_ids)]);
                }
            }
        }catch (\ApiException $exception){
            DB::connection()->rollback();
            TEA($exception->getCode());
        }
        DB::connection()->commit();
    }


    /**
     * 给模塑和棉生成bom
     * @param $material
     * @throws \Illuminate\Container\EntryNotFoundException
     */
    public function insertMPBom($material,$mother_category_code){
        $bomData = [
            'code' => $material->item_no,//bom编码
            'name' => $material->name,//名称
            'version' => 1,//版本
            'material_id' => $material->id,//物料id
            'status' => 1,
            'qty' => 1,
            'creator_id' => (!empty(session('administrator')->admin_id)) ? session('administrator')->admin_id : 0,
            'company_id' => (!empty(session('administrator')->company_id)) ? session('administrator')->company_id : 0,
            'factory_id' => (!empty(session('administrator')->factory_id)) ? session('administrator')->factory_id : 0,
            'mtime' => time(),//最后修改时间
            'ctime' => time(),//创建时间
            'is_version_on'=>1,
            'is_from_erp'=>1,
            'description'=>$material->description,
        ];
        $bom_id = DB::table(config('alias.rb'))->insertGetId($bomData);
        $erp_mp = config('app.erp_mp');
        $item_material = DB::table(config('alias.rm').' as rm')->select('rm.id')
            ->leftJoin(config('alias.rmc').' as rmc','rmc.id','rm.material_category_id')
            ->where('rmc.code',$erp_mp[$mother_category_code])
            ->whereNull('rm.from')
            ->first();
        if(!empty($item_material)){
            $itemData = [
                'bom_id'=>$bom_id,
                'parent_id'=>0,
                'material_id'=>$item_material->id,
                'bom_material_id'=>$material->id,
                'usage_number'=>1,
                'is_from_erp'=>1,
                'total_consume'=>0,
                'is_assembly'=>0,
                'version'=>0,
            ];
            DB::table(config('alias.rbi'))->insert($itemData);
        }
    }

    /**
     * 添加erp
     * @param $item_no
     * @param $bom_id
     * @throws \Illuminate\Container\EntryNotFoundException
     */
    public function addBomAttachment($item_no,$bom_id){
        $erp_attachments = $this->getBomData("http://58.221.197.202:30087/Proattachment/showAttachment?_token=8b5491b17a70e24107c89f37b1036078",$item_no);
        $bom_attachments = [];
        foreach ($erp_attachments as $k=>$v){
            if(empty($v['file_dir'])) continue;
            $attachment = [
                'name'=>$v['file_name'],
                'filename'=>$v['file_name'],
                'path'=>$v['file_dir'],
                'extension'=>$v['file_ext'],
                'size'=>$v['file_length'],
                'ctime'=>time(),
                'mtime'=>time(),
                'creator_id'=>(!empty(session('administrator')->admin_id)) ? session('administrator')->admin_id: 0,
                'is_from_erp'=>1,
                'comment'=>'',
            ];
            $attachment_id = DB::table(config('alias.attachment'))->insertGetId($attachment);
            if(!empty($attachment_id)){
                $bom_attachments[] = [
                    'bom_id'=>$bom_id,
                    'attachment_id'=>$attachment_id,
                    'comment'=>'',
                ];
            }
        }
        DB::table(config('alias.rba'))->insert($bom_attachments);
    }
//endregion

//region 查

    /**
     * 查找物料分类顶级分类
     * @param $material_id
     * @return mixed
     */
    public function getMotherMaterialCategory($material_category_id){
        $material_category = DB::table(config('alias.rmc'))->select('id','parent_id','code')
            ->where('id',$material_category_id)
            ->first();
        if(in_array($material_category->code,array_keys(config('app.erp_mp'))) || $material_category->parent_id == 0){
            return $material_category->code;
        }else{
            return $this->getMotherMaterialCategory($material_category->parent_id);
        }
    }

//endregion
}