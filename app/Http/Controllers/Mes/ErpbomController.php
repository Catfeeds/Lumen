<?php
/**
 * Created by PhpStorm.
 * User: kevin
 * Date: 18/04/23
 * Time: 上午9:02
 */

namespace App\Http\Controllers\Mes;
use App\Http\Models\Erpbom;
use App\Libraries\Trace;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Http\Models\Bom;


class ErpbomController extends Controller
{

    public function __construct()
    {
        parent::__construct();
        if (empty($this->model)) $this->model = new Erpbom();
    }

    public function handleOrder(Request $request){
        $input = $request->all();
        trim_strings($input);

        $url = "http://58.221.197.202:30087/Proorder/showOrder?company_id=&order_no=&code=&product_department_id=&order_status=&start_date=20170601&end_date=20170601&_token=8b5491b17a70e24107c89f37b1036078";

        $result = $this->model->myCurl($url);
        if(isset($result)){
            foreach($result as $v){
                //根据订单中的bom编码查找bom接口
                $getbom = $this->model->getBom($v['production_code']);

                echo "<pre>";
                print_r($getbom);
                echo "</pre>";
                break;
            }
        }

    }





}


