<?php
/**
 * Created by PhpStorm.
 * User: kevin
 * Date: 2018/5/30
 * Time: 下午2:25
 */
namespace App\Http\Models;
use App\Http\Models\Encoding\EncodingSetting;
use Illuminate\Support\Facades\DB;

class Version extends Base{

    protected $model;

    public function __construct()
    {
        parent::__construct();
        $this->table = config('alias.rvr');
    }

//region 检


    /**
     * @param $data
     * @throws \App\Exceptions\ApiException
     */
    public function checkVersion($data){
        $exist_version = $this->isExisted([['version','=',$data['version']]]);
        if(!$exist_version){
            //将每个版本记录保存起来
            $data['addtime'] = date('Y-m-d H:i:s',time());
            if(isset($data['time'])){
                unset($data['time']);
            }
            $version_id=DB::table($this->table)->insertGetId($data);
            if(!$version_id) TEA('802');
        }
        $time = DB::table($this->table)->select(['addtime'])->where('version', $data['version'])->first();
        return $time;
    }


//endregion

//region 增

//endregion

//region 查


//endregion


//region 改


//endregion

//region 删


//endregion
}