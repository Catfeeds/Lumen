<?php
/**
 * Created by PhpStorm.
 * User: haoziye
 * Date: 2018/1/2
 * Time: 上午9:04
 */

namespace App\Console\Commands;

use App\Libraries\Log4php;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class CleanAccessory extends Command
{
    /**
     * 控制台命令 signature 的名称。
     * php artisan cron:test
     * @var string
     */
    protected $signature = 'clean:accessory';

    /**
     * 控制台命令说明。
     * php artisan help  cron:test命令后的输出内容
     * @var string
     *
     */
    protected $description = '清理长时间不用的垃圾附件';
    protected $time = 1;//附件存在的超过的天数
    protected $tables;
    protected $limit = 10;//一次取得数量
    protected $getNum = 2;//一次取得表的数量

    /**
     * 创建一个新的命令实例。
     */
    public function __construct()
    {
        parent::__construct();
        if(!$this->tables){
            $this->tables = [
                'material'=>config('alias.rma'),
                'bom'=>config('alias.rba')
            ];
        }
    }

    /**
     * 执行控制台命令。
     */
    public function handle()
    {
        $limitime =  time() - $this->time * 3600 * 24;
        $sql = "select id,filename,path as attachment_path from attachment where ctime < ?";
        $inOwnTypes = ' and owner_type in (';
        $oldTables = $this->tables;
        shuffle($this->tables);
        foreach($this->tables as $k=>$v){
            if($k > $this->getNum){
                break;
            }
            $key = array_search($v,$oldTables);
            if($k == 0){
                $inOwnTypes .= "'$key'";
            }else {
                $inOwnTypes .= ','."'$key'";
            }
            $sql .= " and id not in(select attachment_id from $v)";
        }
        $inOwnTypes .= ')';
        $sql .= $inOwnTypes." limit ?";
        $list = DB::select($sql,[$limitime,$this->limit]);
        foreach($list as $v){
            if(is_file(env('EMI2C_MES_CODE_URL').$v->attachment_path)){
                $res = Storage::disk('emi2c-mes')->delete($v->attachment_path);
                if($res){
                    Log4php::info('MES:删除垃圾附件成功,filename: '.$v->filename.',path: '.env('EMI2C_MES_CODE_URL').$v->attachment_path.',num:'.$res);
                }else{
                    Log4php::warn('MES:删除垃圾附件失败,filename: '.$v->filename.',path: '.env('EMI2C_MES_CODE_URL').$v->attachment_path.',num:'.$res);
                }
                $ret = DB::table(config('alias.attachment'))->where('id','=',$v->id)->delete();
                if($ret){
                    Log4php::info('MES:删除垃圾附件在数据库中的数据成功，table：attachment'.',id:'.$v->id);
                }else{
                    Log4php::warn('MES:删除垃圾附件在数据库中的数据失败，table：attachment'.',id:'.$v->id);
                }
            }
        }
    }
}