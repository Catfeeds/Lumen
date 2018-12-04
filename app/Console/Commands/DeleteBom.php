<?php
/**
 * Created by PhpStorm.
 * User: haoziye
 * Date: 2018/11/8
 * Time: 3:24 PM
 */
namespace App\Console\Commands;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use App\Http\Models\BomRouting;

class DeleteBom extends Command{
    protected $signature = 'init:DeleteBom';
    protected $description = '删除期初导入时不想要的bom';
    protected $data = [310100006839,310100007774,310100007775];

    public function handle()
    {
        $bom_code = DB::table('ruis_temp_routing_error_info')->select(DB::raw('distinct bom_material_code'))->get();
        $count = count($bom_code);
        foreach ($bom_code as $k=>$v){
            echo '共有'.$count.'条bom物料，正在处理第'.($k+1).'条'.PHP_EOL;
            //找到物料号下所有的bom
            $bom_list = DB::table(config('alias.rb'))->where('code',"=",$v->bom_material_code)->get();
            $bom_count = count($bom_list);
            foreach ($bom_list as $j=>$w){
                if(empty($w)) continue;
                echo '物料'.$v->bom_material_code.'共有'.$bom_count.'条bom，正在删除第'.($j+1).'条'.PHP_EOL;
                try {
                    DB::connection()->beginTransaction();
//                    $items  = array();
//                    //删除bom
//                    DB::table(config('alias.rb') )->where('id',"=",$w->id)->delete();
//                    //找出bom_item
//                    $bom_items = DB::table(config('alias.rbi') )->where('bom_id',"=",$w->id)->get();
//                    //删除bom_item
//                    DB::table(config('alias.rbi') )->where('bom_id',"=",$w->id)->delete();
//                    //删除阶梯用量
//                    foreach ($bom_items as $bom_item){
//                        $items[] = $bom_item->id;
//                    }
//                    if(!empty($items)){
//                        DB::table(config('alias.rbiql') )->whereIn('bom_item_id',$items)->delete();
//                    }
                    //删除工艺路线
                    $bomRoutingDao = new BomRouting();
                    //先找出bom的工艺路线
                    $routing_ids = DB::table(config('alias.rbr'))->where([['bom_id','=',$w->id]])->pluck('routing_id');
                    foreach ($routing_ids as $h=>$z){
                        $bomRoutingDao->deleteBomRouting($w->id,$z);
                    }

                } catch (\ApiException $e) {
                    //回滚
                    DB::connection()->rollBack();
                    exit($e->getCode());
                }
                DB::connection()->commit();
            }
        }
//        $this->deleteRouting();
//        $this->deleteTempRouInfo();
    }


    public function deleteRouting(){
        $count = count($this->data);
        foreach ($this->data as $k=>$v){
            echo '共有'.$count.'条bom物料，正在处理第'.($k+1).'条'.PHP_EOL;
            $bom = DB::table(config('alias.rb'))->where([['code',"=",$v],['is_version_on','=',1]])->first();
            $bomRoutingDao = new BomRouting();
            //先找出bom的工艺路线
            $routing_id = DB::table(config('alias.rbr'))->where('bom_id',$bom->id)->orderBy('id','desc')->limit(1)->value('routing_id');
            $bomRoutingDao->deleteBomRouting($bom->id,$routing_id);
        }
    }

    public function deleteTempRouInfo(){
        DB::table('ruis_temp_operation_code_node')->whereIn('material_code',$this->data)->delete();
    }
}