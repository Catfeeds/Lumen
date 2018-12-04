<?php
/**
 * Created by PhpStorm.
 * User: zhufeng
 * Date: 2018/8/31
 * Time: 下午4:32
 */

namespace App\Console\Commands;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

/**
 * 递归处理SAP的物料分类
 * Class HandleSapMaterialCategory
 * @package App\Console\Commands
 * @author Bruce.Chu
 * @date 2018-08-31
 */
class HandleSapMaterialCategory extends Command
{
    protected $signature = 'material:category';

    /**
     * 控制台命令说明。
     * php artisan help  material:category命令后的输出内容
     * @var string
     *
     */
    protected $description = '处理sap物料分类';

    /**
     * 创建一个新的命令实例。
     */

    public function __construct()
    {
        parent::__construct();
    }

    /**
     * 执行控制台命令。
     * @return mixed
     */
    public function handle()
    {
        //将所有物料分类来源设置为sap
        DB::table(config('alias.rmc'))->update(['from' => 'sap']);
        //批量管理 从表格导入库中的该字符为非法字符(根号) 这里有该字符 就设置为1 无0
        DB::table(config('alias.rmc'))
            ->where('batch_management_content', '<>', '')
            ->update(['batch_management' => 1]);
        //数据库中所有的物料分类
        $all = DB::table(config('alias.rmc'))->get()->toArray();
        foreach ($all as $value) {
            //数据库存入的单位 根据单位拿单位id 存入库中
            if ($value->commercial) {
                //这里只处理库中已存在的单位 未匹配到的并没有插入单位表 过滤掉了 可以考虑新增单位 并更新物料分类的单位
                DB::table(config('alias.rmc'))
                    ->where('code', $value->code)
                    ->update(['unit_id' => DB::table(config('alias.uu'))
                        ->where('commercial', $value->commercial)
                        ->value('id')]);
            }
            //仓库发货单位 同上面的单位处理逻辑 不赘述
            if ($value->warehouse_unit) {
                DB::table(config('alias.rmc'))
                    ->where('code', $value->code)
                    ->update(['warehouse_unit_id' => DB::table(config('alias.uu'))
                        ->where('commercial', $value->warehouse_unit)
                        ->value('id')]);
            }
            //code长度大于2的物料分类为晚辈 递归找该物料分类的宗亲
            if (strlen($value->code) > 2) $this->updateHierarchies($value->code, strlen($value->code), []);
        }
    }

    /**
     * 递归处理物料分类层级关系
     * @param $code => 当前物料分类code
     * @param $strlen => 当前物料分类code长度
     * @param array $forefathers => 宗室物料分类数组
     */
    private function updateHierarchies($code, $strlen, $forefathers = [])
    {
        //父亲物料分类code
        $parent_code = substr($code, 0, $strlen - 2);
        //父亲物料分类id
        $parent_id = DB::table(config('alias.rmc'))
            ->where('code', $parent_code)
            ->value('id');
        //数据库中当前该父亲物料分类id为0(未执行过更新) 才执行更新操作
        DB::table(config('alias.rmc'))
            ->where([['code', $code], ['parent_id', 0]])
            ->update(['parent_id' => $parent_id]);
        //该宗室的物料分类id数组 父亲 爷爷 太爷爷 太太爷爷 太太太爷爷...
        $forefathers[] = $parent_id;
        //集中一次更新所有宗室信息 code长度为4的物料分类的父亲是祖宗 结束找宗亲行为
        if($strlen==4){
            DB::table(config('alias.rmc'))
                ->where('code', $code)
                //反转宗室数组 辈分大的宗亲排在前面 转为字符串插入数据库中
                ->update(['forefathers' => ',' . implode(',', array_reverse($forefathers)) . ',']);
        }
        //code长度为4的物料分类只有父亲 否 继续找宗亲
        if ($strlen > 4) $this->updateHierarchies($code, $strlen - 2, $forefathers);
    }
}