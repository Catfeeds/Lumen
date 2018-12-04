<?php
/**
 * Created by PhpStorm.
 * User: haoziye
 * Date: 2018/9/6
 * Time: 下午1:22
 */
namespace App\Console\Commands;

use App\Http\Models\Sap\ImportSapBom;
use App\Http\Models\Sap\SyncSapMaterial;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class ImportSapMaterialAndBom extends Command{

    protected $signature = 'clean:sapSyncDataReq';

    protected $description = '清理sap同步数据请求';
    protected $alreadyWaitTime = 60;//在待处理状态下的已经等待维持多少秒
    protected $limitTime = 120;//超过限定时间就不处理了
    protected $serviceIds = [
        'INT_PP000300012',
        'INT_PP000300010'
    ];
    protected $limit = 6;//一次任务执行多少条请求数据

    public function __construct()
    {
        parent::__construct();
    }

    public function Handle(){
        //先查找等待处理并且还未超过限定等待时间的请求数据
        $wait_data = DB::table(config('alias.sar'))->select('data_json','serviceID','id')
            ->whereIn('serviceID',$this->serviceIds)
            ->where('status',1)
            ->orderBy('id','asc')
            ->limit($this->limit)
            ->get();
        if(empty($wait_data)){
            //如果不存在那么查找等待处理并且时间超过限定等待时间的请求数据
            $wait_data = DB::table(config('alias.sar'))->select('data_json','serviceID','id')
                ->whereIn('serviceID',$this->serviceIds)
                ->where('status',2)
                ->where(DB::raw(time().' - ctime between '.$this->alreadyWaitTime.' and '.$this->limitTime))
                ->orderBy('id','asc')
                ->limit($this->limit)
                ->get();
        }
        if(empty($wait_data)) return;//如果还不存在那么证明就没有要处理的，直接返回
        $sapMaterialDao = new SyncSapMaterial();
        $sapBomDao = new ImportSapBom();
        //这边不用害怕bom会比物料先处理，因为sap那边把物料写在bom里面了，所以物料永远比使用它的bom先过来
        foreach ($wait_data as $k=>$v){
            //先把该次请求数据设置为正在处理状态
            DB::table(config('alias.sar'))->where('id',$v->id)->update(['status'=>2]);
            if($v->serviceID == $this->serviceIds[0]){
                //处理物料
                $sapMaterialDao->syncSapMaterial(json_decode($v->data_json,true));
            }else if($v->serviceID == $this->serviceIds[1]){
                //处理bom
                $sapBomDao->importSapBomData(json_decode($v->data_json,true));
            }
            //因为方法内部处理都是事物并且会抛出异常，所以如果过程中不出任何问题把该次请求数据状态更新为已处理
            DB::table(config('alias.sar'))->where('id',$v->id)->update(['status'=>3]);
        }
    }
}