<?php
/**
 * Created by PhpStorm.
 * User: Bruce Chu
 * Date: 2018/5/4
 * Time: 上午10:13
 */
namespace App\Http\Controllers\Test;
use App\Http\Models\BomRouting;
use App\Http\Models\Erp\ErpMaterial;
use App\Http\Models\Procedure;
use Laravel\Lumen\Routing\Controller as BaseController;//引入Lumen底层控制器
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Excel;
use Illuminate\Http\Request;
use App\Http\Models\Base;
use App\Http\Models\Erpbom;

/**
 * 使用Maatwebsite/Excel组件操作Excel
 * @package App\Http\Controllers\Test
 * @author  Bruce Chu
 */
class BruceController extends BaseController
{
    protected $ErpModel;
    public function __construct()
    {
        if(empty($this->model)){
            $this->model=new Base();
        }
        $this->ErpModel=new Erpbom();
    }

    /**
     * 下载导出的excel文件
     * @return \Symfony\Component\HttpFoundation\BinaryFileResponse
     */
    public function downloadExcel()
    {
        return response()->download(realpath(base_path('storage/exports')).'/2018-07-25-08.57.03.csv', '2018-07-25-08.57.03.csv');
    }
    /**
     * 将数据导出为Excel
     */
    public function export()
    {
        //声明数组,设置表头
        $cellData = [
            ['英文名', '中文名', '邮箱', '手机号'],
        ];
        //取数据库中数据
        $result = DB::table(config('alias.u'))
            ->select('name', 'cn_name', 'email', 'mobile')->get();
        //遍历数据,插入到数组中
        foreach ($result as $key => $value) {
            $cellData[] = [$value->name, $value->cn_name, $value->email, $value->mobile];
        }
        //导出数据至Excel中,并保存至/storage/exports目录下
        Excel::create('admin1', function ($excel) use ($cellData) {
            $excel->sheet('score', function ($sheet) use ($cellData) {
                $sheet->rows($cellData);
            });
        })->export('csv');
    }

    /**
     * 根据sap定义的表格格式与数据 导出csv表格
     * @param Request $request
     * @return string
     */
    public function exportProcedureRoute(Request $request){
        //前端传参 => 物料清单编码
        $item_no = $request->input('item_no');
        if (empty($item_no)) TEA('700', 'item_no');
        //声明数组 设置表头
        $cellData = [
            [
                '物料编码', '物料描述', '工厂', '工艺路线描述','组计数器',
                '从批量','到批量','批量单位','系统标识','设备代码','工序号',
                '工序描述','工作中心','控制码','SAP基本数量','SAP基本单位',
                '准备时间','单位','机器成本时间','单位','人工时间','单位',
                '机器排产时间','单位','有效期始于','有效期至'
            ]
        ];
        //拼接 表格中 除了表头之外的 表格内容数据
        //拿BOM信息 bom'id + bom'description
        $bom_info=DB::table(config('alias.rb'))
            ->select('id','description')
            ->where([['code','=',$item_no],['is_version_on','=','1']])
            ->first();
        //判断BOM是否存在
        if(!isset($bom_info)) TEA('2112');
        $bom_id=$bom_info->id;
        $bom_desc=$bom_info->description;
        //查找此物料涉及多少个工艺路线 过滤重复值 正常情况是不会有重复routing_id
        $bom_routing_num=DB::table(config('alias.rbr'))
            ->where('bom_id',$bom_id)
            ->distinct()
            ->pluck('routing_id')
            ->count();
        //拿物料的来源和单位 from + unit
        $material_info=DB::table(config('alias.rm').' as a')
            ->select('a.from','b.commercial')
            ->leftJoin(config('alias.uu').' as b','a.unit_id','b.id')
            ->where('a.item_no',$item_no)
            ->first();
        //定义系统标识 M:MES=>NULL S:SAP=>erp A:ALL 目前数据库只区分了物料是否来源于erp
        $from='M';
        if(isset($material_info->from)) $from='S';
        //物料单位
        $unit=$material_info->commercial;
        //拿bom工艺路线信息 走BomRouting Model
        $bom_routing=new BomRouting();
        //返回bom_routing_id与关联的工艺路线名称
        $bom_routing_info=$bom_routing->getBomRoutings($bom_id);
        //转换为适用函数参数的格式 'id'=>$id
        $bom_routing_id=['id'=>$bom_routing_info[0]->routing_id];
        //工艺路线名称
        $procedure_name=$bom_routing_info[0]->name;
        //拿工艺路线上的工序信息 走Procedure Model
        $procedure=new Procedure();
        $procedure_info=$procedure->display($bom_routing_id);
        $operations=$procedure_info['operations'];
        //遍历工序 将拼接好的数据 逐行插入表格内容数组
        for($i=2;$i<count($operations);$i++){
            //工序id
            $operation_id=$operations[$i]->operation_id;
            //准备工时
            $preparation_hour=DB::table(config('alias.riw'))
                ->where([['parent_id','=',0],['operation_id','=',$operation_id]])
                ->value('preparation_hour');
            //总工时求和 这里没调李明那边接口 遍历计算 直接通过物料编码,工序id,bom'id查询数据库
            $total_hour=DB::table(config('alias.rimw'))
                ->where([['material_no','=',$item_no],['operation_id','=',$operation_id],['bom_id','=',$bom_id]])
                ->sum('work_hours');
            //人工时间
            $man_hour=DB::table(config('alias.rimw'))
                ->where([['material_no','=',$item_no],['operation_id','=',$operation_id]])
                ->value('man_hours');
            //sheet的每一行记录
            $cellData[]=[
                $item_no,$bom_desc,'',$procedure_name,$bom_routing_num,'','','',$from,
                '',$operations[$i]->operation_code,$operations[$i]->name,'','PP01','1',$unit,
                $preparation_hour,'S',$total_hour,'S',$man_hour,'S','','S'
            ];
        }
        //调用Maatwebsite/Excel组件 并导出 文件名使用物料编码与当前时间标识
        Excel::create($item_no.'_'.date('Y.m.d.H.i.s',time()), function ($excel) use ($cellData) {
            $excel->sheet('score', function ($sheet) use ($cellData) {
                $sheet->rows($cellData);
            });
        })->export('csv');
    }
    /**
     * 下载Excel模版
     * @author Bruce.Chu
     */
    public function downloadTemplate()
    {
        //声明数组,设置表头
        $cellData = [
            ['#','#','#男1女2','#无需填写,系统自动识别','#在职1离职0','#','#','#11位手机号','#注意邮箱格式'],//表头注释
            ['身份证号', '姓名','性别','卡号','角色','员工状态','生日','部门','学历','职位', '手机','邮箱',
                '省份','户籍地址','居住地址','入职日期','离职日期','员工类型','招聘来源','描述','创建人'],//表头
        ];
        $data= DB::table($this->table.' as a1')
            //字段依次对应表格的列
            ->select(
                'a1.card_id',
                'a1.name',
                'a1.gender',
                'a3.name as admin_name',
                'a1.status_id as status',
                'a4.name as department_name',
                'a5.name as position_name',
                'a1.phone',
                'a1.email'
            )
            ->leftJoin(config('alias.rrad').' as a3','a3.id','=','a1.creator_id')
            ->leftJoin(config('alias.rd').' as a4','a4.id','=','a1.department_id')
            ->leftJoin(config('alias.rep').' as a5','a5.id','=','a1.position_id')
            ->get()
            ->toArray();
        //将查询出来的结果转为二维索引数组 [0=>[0=>,...],...]
        $data=array_map(function($value){
            return array_values(obj2array($value));
        },$data);
        //合并表头与内容数据
        $cellData=array_merge($cellData,$data);
        //导出Excel
        Excel::create('employee', function ($excel) use ($cellData) {
            $excel->sheet('employee', function ($sheet) use ($cellData) {
                $sheet->rows($cellData);
                //单元格字体大小设置为15号
                $sheet->setFontSize(15);
                //解决导出xls格式文件乱码
                ob_end_clean();
            });
        })->export('xls');
    }
    /**
     * 将Excel导入到Mysql
     * @return array
     */
    public function import()
    {
        //取上传的Excel文件路径
        $excel_path = Storage::disk('public')->exists('material6.xls');
        if ($excel_path) {
            $excel_path = Storage::disk('public')->url('material1.xls');
            $excel_path = substr($excel_path, 1);
        }
        //取Excel记录,封装为数组
        $results = [];
        Excel::load($excel_path, function ($reader) use (&$results) {
            $reader = $reader->getSheet(0);
            $results = $reader->toArray();
        });
        //表头
        $keysarray = $results[0];
        //将数组拼接成关联数组,设置表头值为key,过滤表头
        $needstobeinserted = [];
//        for ($i = 1; $i < count($results); $i++) {
//            foreach ($keysarray as $key => $value) {
//                if ($key != 'id') {
//                    $tmp[$value] = $results[$i][$key];
//                }
//            }
//            $needstobeinserted[] = $tmp;
//        }
        for ($i = 1; $i < count($results); $i++) {
            $tmp['item_no']=$results[$i][2];
            $tmp['name']=$results[$i][3];
            for($j=12;$j<count($keysarray)-2;$j++){
                if($results[$i][$j]){
                    $tmp['attribute'][$keysarray[$j]]=$results[$i][$j];
                }
            }
            $tmp['流水描述']=$results[$i][7];
            $tmp['calculate_unit']=$results[$i][5];
            $tmp['item_class']=$results[$i][8];
//            $tmp['drawing_url']=$results[$i][4];
//            $tmp['attachment_url']=$results[$i][4];
//            $tmp['procurement_lead_time']=$results[$i][4];
//            $tmp['min_procurement_cycle']=$results[$i][4];
            $needstobeinserted[] = $tmp;
        }

//        return $results;
        //入库
        try {
            //开启事务
            DB::connection()->beginTransaction();
//            unset($results[0]);
//            foreach($results as $result){
//                $data=[
//                    'company_id'=>$result[1],'factory_id'=>$result[2],'name'=>$result[3],'cn_name'=>$result[4],'sex'=>$result[5],'password'=>$result[6],'salt'=>$result[7],'email'=>$result[8],'mobile'=>$result[9],'superman'=>$result[10],
//                    'header_photo'=>$result[11],'date_of_birth'=>$result[12],'attachment_id'=>$result[13],'introduction'=>$result[14],'status'=>$result[15],'last_login_at'=>$result[16],'created_at'=>$result[17],'updated_at'=>$result[18],'employee_id'=>$result[19],
//                ];
//                $res['result'] = DB::table(config('alias.u'))->insertGetId($data);
//            }
            $res['result'] = DB::table(config('alias.u'))->insert($needstobeinserted);
        } catch (\ApiException $e) {
            //回滚
            DB::connection()->rollBack();
            TEA($e->getCode());
        }
        //提交事务
        DB::connection()->commit();
        return response()->json(get_success_api_response($res));
    }


     //拉取已入库物料的附件
     public function pullAttachment(Request $request)
     {
         //前端传参 => 物料编码
         $item_no = $request->input('item_no');
         if (empty($item_no)) TEA('700', 'item_no');
         //判断该ERP物料有无入库
         $has = $this->model->isExisted([['item_no', '=', $item_no],['from','=','erp']], config('alias.rm'));
         if(!$has) TEA('7074');
         //已入库的物料 查询物料主键ID、item_no集合 配合闵鑫那边函数的参数格式
         $material_id=DB::table(config('alias.rm'))->where('item_no',$item_no)->pluck('id','item_no');
         //判断该ERP物料附件有无入库 这里物料附件不及时更新
         //由于新建 删除 更新附件都会影响物料附件关系表的状态 这里只把关系表作为判断依据 双重判断可以采用whereIn
         $has_attachment=$this->model->isExisted([['material_id','=',$material_id]],config('alias.rma'));
         if($has_attachment) TEA('7075');
         //处理物料附件 声明数组存放物料附件
         $attachment = [];
         //调用ERP附件接口
         $url = 'http://58.221.197.202:30087/Proattachment/showAttachment?_token=8b5491b17a70e24107c89f37b1036078&item_no=' . $item_no;
         $tmp = $this->ErpModel->myCurl($url);
         if(empty($tmp)) TEA('7076');
         $attachment[$item_no] = $tmp;
         $erp_material=new ErpMaterial();
         //走拉取ERP物料接口=>附件处理
         $result=$erp_material->dealAttachment($attachment, $material_id);
         return response()->json(get_success_api_response($result));
    }


    /**
     * 编辑生产订单 更新拆单可用的制造BOM 更新BOM名称 基础数量 损耗率 工序 能力 描述 子项(添加/删除/更新) 子项替代物料(添加/删除/更新)
     * 不推荐 生产应以BOM为基准 工艺,BOM不同的生产单应该升级BOM版本 这里属于快照 只是强制拼接制造BOM树 并没有真实向数据库添加/删除/更新上述的数据
     * @param $input
     * @return array|bool
     * @author Bruce.Chu
     */
    public function update($input)
    {
        $this->checkRules($input);
        $creator_id = (!empty(session('administrator')->admin_id)) ? session('administrator')->admin_id : 0;
        //前端传递的BOM树
        $bom_tree = $input['bom_tree'];
        $bom = new Bom();
        //拆单可用的BOM树
        $real_tree = $bom->getBomTree($input['material_id'], $input['version'], true, true);
        $this->check($bom_tree['children'], obj2array($real_tree->children), $input);
        //check函数可监测到的变动 包括name loss_rate qty description 子项(添加/删除/更新/替换物料)
        $on_checks = json_decode($input['differences']);
        //统一转换为数组 进行操作
        $tree_to_array=obj2array($real_tree);
        //check函数监测不到的变动 包括BOM母件的工序/能力 已有项的组装与去除组装
        $off_checks = $this->easyCheck($input['bom_tree'], $tree_to_array);
        //没有任何变动 出去
        if(empty($on_checks) && empty($off_checks)) return true;
        $data = [
            'bom_group_id' => $input['bom_group_id'],//BOM分组
            'creator_id' => $creator_id,
            'attachments' => json_encode($input['attachments']),//BOM附件
            'differences' => $input['differences'],//check函数监测到的变动
            'item_material_path' => $input['item_material_path'],//子项
            'replace_material_path' => $input['replace_material_path'],//替换物料
        ];
        //BOM母件的工序/能力变动
        if (!empty($off_checks['operation'])) {
            //这里也不用foreach了
            $tree_to_array=array_merge($tree_to_array,$off_checks['operation']);
            $tree_to_array['operation_ability_pluck']=json_decode($tree_to_array['operation_ability_pluck']);
        }
        //已有项的组装与去除组装
        if (!empty($off_checks['assembly'])) {
            foreach ($tree_to_array['children'] as $key=>$value) {
                if (array_key_exists($value['item_no'], $off_checks['assembly'])) $tree_to_array['children'][$key]['is_assembly'] = $off_checks['assembly'][$value['item_no']];
            }
        }
        //check函数监测到的变动 细分
        if (!empty($on_checks)) {
            //母件更新
            $data['name'] = $input['name'];//BOM名称
            $tree_to_array['name'] = $input['name'];
            $data['loss_rate'] = $input['loss_rate'];//损耗率
            $tree_to_array['loss_rate'] = $input['loss_rate'];
            $data['qty'] = $input['qty'];//基础数量
            $tree_to_array['usage_number'] = $input['qty'];
            $data['description'] = $input['description'];//描述
            foreach ($on_checks as $value) {
                //儿子们
                $children_to_array = $tree_to_array['children'];
                switch ($value->extra) {
                    //子项操作 更新$tree_to_array['children']
                    case 'item':
                        switch ($value->action) {
                            //子项更新
                            case 'update':
                                //取消内外两层foreach 先把需要更新的key=>value 整理成数组 以便替换
                                $updates=array_map(function($va){
                                    //拿最后一个[]包裹的值 即更新值
                                    $va=trim(strrchr($va, '['), '[]');
                                    return $va;
                                },obj2array($value->value));
                                //根据物料编码找到指定儿子 替换更新
                                $children_to_array = array_map(function ($v) use ($value, $updates) {
                                    if ($v['item_no'] == $value->item_no) $v=array_merge($v,$updates);
                                    return $v;
                                }, $children_to_array);
                                break;
                            //子项删除
                            case 'delete':
                                //collection 统一一下 不用collection了
                                //$children_to_array = collect($children_to_array)->filter(function ($va) use ($value) {
                                //return ($value->item_no !== $va['item_no']);
                                //})->all();
                                //这里不用foreach了 根据要删除的儿子的物料编码 在儿子们中删除该儿子
                                $children_to_array = array_filter($children_to_array, function ($va) use ($value) {
                                    return ($value->item_no !== $va['item_no']);
                                });
                                break;
                            //子项添加
                            case 'add':
                                //子项拼接为拆单可用的制造BOM 前端已传参即用 未传参需要拿
                                $new_son = $this->insertManufactureBomTree($value->value, $tree_to_array['bom_id'], 'add');
                                array_push($children_to_array, $new_son);
                                break;
                        }
                        break;
                    //替代物料操作 更新$tree_to_array['children'][index]['replaces']
                    case 'replace':
                        switch ($value->action) {
                            //替代物料更新
                            case 'update':
                                //取消内外两层foreach 先把需要更新的key=>value 整理成数组 以便替换
                                $updates=array_map(function($va){
                                    //拿最后一个[]包裹的值 即更新值
                                    $va=trim(strrchr($va, '['), '[]');
                                    return $va;
                                },obj2array($value->value));
                                //先根据物料编码找到指定儿子 再根据替换物料编码找到儿子中指定的替换物料 替换更新
                                $children_to_array = array_map(function ($v) use ($value,$updates) {
                                    //存放修改后的替换物料们
                                    $replace=[];
                                    if ($v['item_no'] == $value->item_no){
                                        $replace=array_map(function ($va) use($value,$updates){
                                            if($va['item_no']==$value->replace_item_no) $va=array_merge($va,$updates);
                                            return $va;
                                        },$v['replaces']);
                                    }
                                    $v['replaces']=$replace;
                                    return $v;
                                }, $children_to_array);
                                break;
                            //替代物料删除
                            case 'delete':
                                //这里也不用foreach了 根据被替换的儿子的物料编码找到BOM树中这个儿子 根据替换物料的编码 删除指定替换物料
                                $children_to_array = array_map(function ($v) use ($value) {
                                    //存放修改后的替换物料们
                                    $replace=[];
                                    if ($v['item_no'] == $value->item_no) {
                                        //过滤替代物料
                                        $replace=array_filter($v['replaces'],function ($va) use($value){
                                            return ($va['item_no'] !== $value->replace_item_no);
                                        });
                                    }
                                    //重置索引数组的索引
                                    $v['replaces']=array_values($replace);
                                    return $v;
                                }, $children_to_array);
                                break;
                            //替代物料添加
                            case 'add':
                                $replace = $this->insertManufactureBomTree($value->value, $tree_to_array['bom_id'], 'replace');
                                //根据被替换的儿子的物料编码找到BOM树中这个儿子 将替换物料加进去 这里不用foreach了
                                $children_to_array = array_map(function ($v) use ($value, $replace) {
                                    if ($v['item_no'] == $value->item_no) $v['replaces'][] = $replace;
                                    return $v;
                                }, $children_to_array);
                                break;
                        }
                        break;
                }
                //索引数组重置索引 从0排序 转为object
                $tree_to_array['children'] = array_values($children_to_array);
            }
        }
        $data['bom_tree'] = json_encode($tree_to_array);
        //入库
        $upd = DB::table($this->table)->where($this->primaryKey, $input[$this->apiPrimaryKey])->update($data);
        if ($upd === false) TEA('806');
    }
}