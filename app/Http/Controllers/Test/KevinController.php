<?php
/**
 * Created by PhpStorm.
 * User: kevin
 * Date: 18/04/23
 * Time: 上午9:02
 */

namespace App\Http\Controllers\Test;
use App\Http\Models\Bom;
use App\Http\Models\OperationOrder;
use App\Http\Models\ProductionWorkOrder;
use Codeception\Module\Memcache;
use Illuminate\Http\File;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Redis;
//use Illuminate\Support\Facades\Request;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Facades\Image;//图像处理
use Intervention\Image\ImageManager;//可以直接使用
use Laravel\Lumen\Routing\Controller as BaseController;//引入Lumen底层控制器
use Illuminate\Support\Facades\DB;//引入DB操作类
use Illuminate\Http\Request;
use App\Libraries\MongodbLog;
use Gregwar\Captcha\PhraseBuilder;
use Gregwar\Captcha\CaptchaBuilder;
use Maatwebsite\Excel\Facades\Excel;
use PHPExcel;

/**
 * kevin用来测试的控制器
 * Class KevinController
 * @package App\Http\Controllers\Test
 */
class KevinController extends BaseController
{

    public function test(){
        $product_order_mode = new \App\Http\Models\ProductOrder();
        $all_wo_data = $product_order_mode->createAutoPlanData('161');
        pd($all_wo_data);
        //pd($all_wo_data);
        $APS_mode = new \App\Http\Models\APS();
        foreach ($all_wo_data as $item) {
            $APS_mode->simplePlanByPeriod($item);
        }
        pd($item);

        //$res2 = DB::table('ruis_material')->where('id',10)->pluck('item_no')->toArray();
        $res = DB::table('material_attribute')->where('id',17)->pluck('material_id','value')->toArray();
        var_dump($res);die;

    }

    public function handleBOM(){

        $url = "http://58.221.197.202:30087/Probom/showBom?company_id=&item_no=CP-HT-SHJD-0337&_token=8b5491b17a70e24107c89f37b1036078";
        $ch =   curl_init();
        $timeout = 10; // set to zero for no timeout
        curl_setopt ($ch, CURLOPT_URL,$url);
        curl_setopt ($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt ($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/34.0.1847.131 Safari/537.36');
        curl_setopt ($ch, CURLOPT_CONNECTTIMEOUT, $timeout);

        $data = curl_exec($ch);
        curl_close($ch);
        $response = trim($data,chr(239).chr(187).chr(191));
        $response = json_decode($response, true);

        if(isset($response['results'])){
            foreach($response['results'] as $v){
                echo "<pre>";
                print_r($v);
                echo "</pre>";
                break;
            }
        }

    }

    public function handleMaterial(){


        $url = "http://58.221.197.202:30087/Proinv/showInv?company_id=&item_no=CP-HT-SHJD-0337&_token=8b5491b17a70e24107c89f37b1036078";
        $ch =   curl_init();
        $timeout = 10; // set to zero for no timeout
        curl_setopt ($ch, CURLOPT_URL,$url);
        curl_setopt ($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt ($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/34.0.1847.131 Safari/537.36');
        curl_setopt ($ch, CURLOPT_CONNECTTIMEOUT, $timeout);

        $data = curl_exec($ch);
        curl_close($ch);
        $response = trim($data,chr(239).chr(187).chr(191));
        $response = json_decode($response, true);

        if(isset($response['results'])){
            foreach($response['results'] as $v){
                echo "<pre>";
                print_r($v);
                echo "</pre>";
                break;
            }
        }

    }


    public function handleOrder(){


        $url = "http://58.221.197.202:30087/Proorder/showOrder?company_id=&order_no=HK1010195JO&_token=8b5491b17a70e24107c89f37b1036078";
        $ch =   curl_init();
        $timeout = 10; // set to zero for no timeout
        curl_setopt ($ch, CURLOPT_URL,$url);
        curl_setopt ($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt ($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/34.0.1847.131 Safari/537.36');
        curl_setopt ($ch, CURLOPT_CONNECTTIMEOUT, $timeout);

        $data = curl_exec($ch);
        curl_close($ch);
        $response = trim($data,chr(239).chr(187).chr(191));
        $response = json_decode($response, true);

        if(isset($response['results'])){
            foreach($response['results'] as $v){
                echo "<pre>";
                print_r($v);
                echo "</pre>";
                break;
            }
        }

    }

    public function managerVersion(){
        $version_config = config('version','null');
        //var_dump($version_config);die;
        $info = explode('|',$version_config['comment']);
        //echo "<pre>";
        //var_dump($info);die;
        //echo "</pre>";
    }


}


