<?php
/**
 * Created by PhpStorm.
 * User: kevin
 * Date: 2018/4/8
 * Time: 下午2:25
 */
namespace App\Http\Models;
use App\Http\Models\Encoding\EncodingSetting;
use App\Http\Models\Material\Material;
use App\Libraries\Tree;
use Illuminate\Support\Facades\DB;

class Erpbom extends Base{

    public function __construct()
    {
        parent::__construct();
    }

//region 检


    /**
     * @param $input
     * @throws \App\Exceptions\ApiException
     */
    public function checkOrderFormField(&$input){
        if(empty($input['select_type']) || !is_numeric($input['select_type']) || !in_array($input['select_type'],[1,2,3,4])) TEA('700','select_type');
        if(empty($input['bom_id']) || !is_numeric($input['bom_id'])) TEA('700','bom_id');
        $has = $this->isExisted([['id','=',$input['bom_id']]],config('alias.rb'));
        if(!$has) TEA('1136');
        if(empty($input['operation_id']) || !is_numeric($input['operation_id'])) TEA('700','operation_id');

    }


//endregion

//region 增

//endregion

//region 查

    /**
     * @param $item_no
     * @return array
     */
    public function getBom($item_no){
        //$url = "http://58.221.197.202:30087/Probom/showBom?company_id=&item_no=".$item_no."&_token=8b5491b17a70e24107c89f37b1036078";
        $url = "http://58.221.197.202:30087/Probom/showBom?company_id=&item_no=CP-HT-SHJD-0337&_token=8b5491b17a70e24107c89f37b1036078";
        $data = $this->myCurl($url);
        return $data;
    }

    public function getMaterial($item_no){

        //$url = "http://58.221.197.202:30087/Proinv/showInv?company_id=&item_no=".$item_no."&_token=8b5491b17a70e24107c89f37b1036078";
        $url = "http://58.221.197.202:30087/Proinv/showInv?company_id=&item_no=CP-HT-SHJD-0337&_token=8b5491b17a70e24107c89f37b1036078";
        $data = $this->myCurl($url);
        return $data;
    }

    public function myCurl($url){

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
        return $response['results'];
    }


//endregion


//region 改


//endregion

//region 删


//endregion
}