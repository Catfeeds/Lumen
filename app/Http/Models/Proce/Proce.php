<?php
namespace App\Http\Models\Proce;//定义命名空间
use App\Http\Models\Encoding\EncodingSetting;
use Illuminate\Support\Facades\DB;
use App\Http\Models\Base;
// use function PHPSTORM_META\type;//引入DB操作类


class Proce extends Base
{

    public function __construct()
    {
        parent::__construct();
        $query = app('db')->connection("sqlsrv");
        $this->order_table='ruis_production_order';
        $this->bom_table='ruis_bom';
        $this->material_table='ruis_material';
        $this->depot_table='ruis_storage_depot';


         //定义表别名
        $this->aliasTable=[
            'production'=>$this->order_table.' as production',
        ];



    }

    /**
     * Bom
     * @return array
     * @author  liming 
     * @todo 
     */
    public function getBom($input)
    {
        $result  = array();
        //  获取提交参数  
        $item_no    =  isset($input['item_no'])?$input['item_no']:'';
        $company_id =  isset($input['company_id'])?$input['company_id']:'';

        $dbh = DB::connection('sqlsrv')->getPdo();
        $stmt = $dbh->prepare("EXEC lc0019999.P_ERPTOMES_BOM ?,?");
        $stmt->bindParam(1, $company_id);
        $stmt->bindParam(2, $item_no);
        $stmt->execute();
        while ($row = $stmt->fetch()) 
        {
            $tmp['parent_code']     = mb_convert_encoding(isset($row['parent_code'])?$row['parent_code']:NULL, "UTF-8", "GBK");
            $tmp['subitem_code']    = mb_convert_encoding(isset($row['subitem_code'])?$row['subitem_code']:NULL, "UTF-8", "GBK"); 
            $tmp['specification']   = mb_convert_encoding(isset($row['specification'])?$row['specification']:NULL, "UTF-8", "GBK"); 
            $tmp['calculate_unit']  = mb_convert_encoding(isset($row['calculate_unit'])?$row['calculate_unit']:NULL, "UTF-8", "GBK"); 
            $tmp['parent_qty']      = mb_convert_encoding(isset($row['parent_qty'])?$row['parent_qty']:NULL, "UTF-8", "GBK"); 
            $tmp['child_qty']       = mb_convert_encoding(isset($row['child_qty'])?$row['child_qty']:NULL, "UTF-8", "GBK");
            $tmp['product_type']    = mb_convert_encoding(isset($row['product_type'])?$row['product_type']:NULL, "UTF-8", "GBK");
            $tmp['version']         = mb_convert_encoding(isset($row['version'])?$row['version']:NULL, "UTF-8", "GBK");
            $result[]  = $tmp;
        }
        return $result;
    }



   /**
     * Inv
     * @return array
     * @author  liming 
     * @todo 
     */
    public function getInv($input)
    {
        $result  = array();
        //  获取提交参数  
        $company_id =  isset($input['company_id'])?$input['company_id']:'';
        $item_no    =  isset($input['item_no'])?$input['item_no']:'';
        $code    =  isset($input['code'])?$input['code']:'';

        $dbh = DB::connection('sqlsrv')->getPdo();
        $stmt = $dbh->prepare("EXEC lc0019999.P_ERPTOMES_INV ?,?,?");
        $stmt->bindParam(1, $company_id);
        $stmt->bindParam(2, $item_no);
        $stmt->bindParam(3, $code);
        $stmt->execute();

        // 定义一个空数组存放 $key
        $key_arr = [];


        while ($row = $stmt->fetch()) 
        {
            foreach ($row as $key => $value) 
            {   
                if (is_numeric($key)) 
                {
                    unset($row[$key]);
                }
                else
                {
                    $encode = mb_detect_encoding($key, array('UTF-8','GB2312','GBK'));
                    if($encode !== "UTF-8")
                    {
                        $temp  = mb_convert_encoding($key, "UTF-8", "GBK");
                        $row[$temp] = $value;
                        $key_arr[] = $temp;
                    }
                    else
                    {
                         $key_arr[] = $key;
                    }
                }
               
            }

            // 根据键值获取新值
            foreach ($key_arr as $length => $key) {
               if ( $length >2   &&   $length < 13  ) 
               {    
                    if (empty($row[$key]) || $row[$key] == ' ') 
                    {   
                        unset($row[$key]);
                    } 
                    else
                    {
                       $tmp['attribute'][$key] = mb_convert_encoding($row[$key], "UTF-8", "GBK");
                    }

                    if (!isset($tmp['attribute']))
                    {
                       $tmp['attribute'] = [];
                    } 
                    
               } 
               else
               {
                     $tmp[$key]  = mb_convert_encoding(isset($row[$key])?$row[$key]:NULL, "UTF-8", "GBK");
               }
               
            }

            $result[]  = $tmp;

        }

        return $result;
    }


     /**
     * Order
     * @return array
     * @author  liming 
     * @todo 
     */
    public function getOrder($input)
    {
        $result  = array();
        //  获取提交参数  
        $company_id =  isset($input['company_id'])?$input['company_id']:'';
        $product_department_id  =  isset($input['product_department_id'])?$input['product_department_id']:'';
        $order_status  =  isset($input['order_status'])?$input['order_status']:'';
        $start_date  =  isset($input['start_date'])?$input['start_date']:'';
        $end_date  =  isset($input['end_date'])?$input['end_date']:'';
        $order_no  =  isset($input['order_no'])?$input['order_no']:'';


        $dbh = DB::connection('sqlsrv')->getPdo();
        $stmt = $dbh->prepare("EXEC lc0019999.P_ERPTOMES_ORDER ?,?,?,?,?,?");
        $stmt->bindParam(1, $company_id);
        $stmt->bindParam(2, $product_department_id);
        $stmt->bindParam(3, $order_status);
        $stmt->bindParam(4, $start_date);
        $stmt->bindParam(5, $end_date);
        $stmt->bindParam(6, $order_no);
        $stmt->execute();
        while ($row = $stmt->fetch()) 
        {
            $tmp['number']           = mb_convert_encoding(isset($row['number'])?$row['number']:NULL, "UTF-8", "GBK");
            $tmp['sales_order_no']   = mb_convert_encoding(isset($row['sales_order_no'])?$row['sales_order_no']:NULL, "UTF-8", "GBK");
            $tmp['production_code']  = mb_convert_encoding(isset($row['production_code'])?$row['production_code']:NULL, "UTF-8", "GBK");
            $tmp['production_name']  = mb_convert_encoding(isset($row['production_name'])?$row['production_name']:NULL, "UTF-8", "GBK");
            $tmp['qty']              = mb_convert_encoding(isset($row['qty'])?$row['qty']:NULL, "UTF-8", "GBK");
            $tmp['production_unit']  = mb_convert_encoding(isset($row['production_unit'])?$row['production_unit']:NULL, "UTF-8", "GBK");
            $tmp['release_date']     = mb_convert_encoding(isset($row['release_date'])?$row['release_date']:NULL, "UTF-8", "GBK");
            $tmp['status']           = mb_convert_encoding(isset($row['status'])?$row['status']:NULL, "UTF-8", "GBK");
            $tmp['start_date']       = mb_convert_encoding(isset($row['start_date'])?$row['start_date']:NULL, "UTF-8", "GBK");
            $tmp['product_standard'] = mb_convert_encoding(isset($row['product_standard'])?$row['product_standard']:NULL, "UTF-8", "GBK"); 
            $tmp['product_lead_time']= mb_convert_encoding(isset($row['product_lead_time'])?$row['product_lead_time']:NULL, "UTF-8", "GBK");
            $tmp['department_name']  = mb_convert_encoding(isset($row['department_name'])?$row['department_name']:NULL, "UTF-8", "GBK");
            $result[]  = $tmp;
        }
        return $result;
    }


    /**
     * Bom
     * @return array
     * @author  liming 
     * @todo 
     */
    public function getBomTree($input)
    {
        $result  = array();
        //  获取提交参数  
        $item_no    =  isset($input['item_no'])?$input['item_no']:'';
        $company_id =  isset($input['company_id'])?$input['company_id']:'';

        $dbh = DB::connection('sqlsrv')->getPdo();
        $stmt = $dbh->prepare("EXEC lc0019999.P_ERPTOMES_BOM ?,?");
        $stmt->bindParam(1, $company_id);
        $stmt->bindParam(2, $item_no);
        $stmt->execute();
        while ($row = $stmt->fetch()) 
        {
            $tmp['parent_code']     = mb_convert_encoding(isset($row['parent_code'])?$row['parent_code']:NULL, "UTF-8", "GBK");
            $tmp['subitem_code']    = mb_convert_encoding(isset($row['subitem_code'])?$row['subitem_code']:NULL, "UTF-8", "GBK"); 
            $tmp['specification']   = mb_convert_encoding(isset($row['specification'])?$row['specification']:NULL, "UTF-8", "GBK"); 
            $tmp['calculate_unit']  = mb_convert_encoding(isset($row['calculate_unit'])?$row['calculate_unit']:NULL, "UTF-8", "GBK"); 
            $tmp['parent_qty']      = mb_convert_encoding(isset($row['parent_qty'])?$row['parent_qty']:NULL, "UTF-8", "GBK"); 
            $tmp['child_qty']       = mb_convert_encoding(isset($row['child_qty'])?$row['child_qty']:NULL, "UTF-8", "GBK");
            $tmp['product_type']    = mb_convert_encoding(isset($row['product_type'])?$row['product_type']:NULL, "UTF-8", "GBK");
            $tmp['version']         = mb_convert_encoding(isset($row['version'])?$row['version']:NULL, "UTF-8", "GBK");
            $result[]  = $tmp;          
        }

        foreach ($result as $key => $value)
        {
            $result[$key]['id']  =  $value['subitem_code'];
            $result[$key]['parent_id']  =  $value['parent_code'];
        }  

        $new_arr  =  $this->findDescendants($result, $item_no);
        //加一个根
        $root_date['id'] = $item_no;
        $root_date['parent_id'] = 0;
        $root_date['subitem_code'] = $item_no;
        $root_date['level'] = 0;
        array_unshift($new_arr,$root_date);

        return $new_arr;
    }



    static function findDescendants($arr, $id , $level = 1, &$descendants = array())
    {
        foreach ($arr as $key => $value) 
        {
                if ($value['parent_id'] == $id) 
                {
                    $value['level'] = $level;
                    $descendants[] = $value;
                    //调用自身看看儿子是否还有儿子,注意这里的参数不能少传递了
                    self::findDescendants($arr, $value['id'], $level + 1, $descendants);
                }
        }

        return $descendants;
    }


     /**
     * Order
     * @return array
     * @author  liming 
     * @todo 
     */
    public function getOrderStatus($input)
    {
        $result  = array();
        //  获取提交参数  
        $company_id =  isset($input['company_id'])?$input['company_id']:'';
        $product_department_id  =  isset($input['product_department_id'])?$input['product_department_id']:'';
        $order_status  =  isset($input['order_status'])?$input['order_status']:'';
        $start_date  =  isset($input['start_date'])?$input['start_date']:'';
        $end_date  =  isset($input['end_date'])?$input['end_date']:'';
        $order_no  =  isset($input['order_no'])?$input['order_no']:'';


        $dbh = DB::connection('sqlsrv')->getPdo();
        $stmt = $dbh->prepare("EXEC lc0019999.P_ERPTOMES_ORDER ?,?,?,?,?,?");
        $stmt->bindParam(1, $company_id);
        $stmt->bindParam(2, $product_department_id);
        $stmt->bindParam(3, $order_status);
        $stmt->bindParam(4, $start_date);
        $stmt->bindParam(5, $end_date);
        $stmt->bindParam(6, $order_no);
        $stmt->execute();
        while ($row = $stmt->fetch()) 
        {
            $tmp['number']           = mb_convert_encoding(isset($row['number'])?$row['number']:NULL, "UTF-8", "GBK");
            $tmp['sales_order_no']   = mb_convert_encoding(isset($row['sales_order_no'])?$row['sales_order_no']:NULL, "UTF-8", "GBK");
            $tmp['production_code']  = mb_convert_encoding(isset($row['production_code'])?$row['production_code']:NULL, "UTF-8", "GBK");
            $tmp['production_name']  = mb_convert_encoding(isset($row['production_name'])?$row['production_name']:NULL, "UTF-8", "GBK");
            $tmp['qty']              = mb_convert_encoding(isset($row['qty'])?$row['qty']:NULL, "UTF-8", "GBK");
            $tmp['production_unit']  = mb_convert_encoding(isset($row['production_unit'])?$row['production_unit']:NULL, "UTF-8", "GBK");
            $tmp['release_date']     = mb_convert_encoding(isset($row['release_date'])?$row['release_date']:NULL, "UTF-8", "GBK");
            $tmp['status']           = mb_convert_encoding(isset($row['status'])?$row['status']:NULL, "UTF-8", "GBK");
            $tmp['start_date']       = mb_convert_encoding(isset($row['start_date'])?$row['start_date']:NULL, "UTF-8", "GBK");
            $tmp['product_standard'] = mb_convert_encoding(isset($row['product_standard'])?$row['product_standard']:NULL, "UTF-8", "GBK"); 
            $tmp['product_lead_time']= mb_convert_encoding(isset($row['product_lead_time'])?$row['product_lead_time']:NULL, "UTF-8", "GBK");
            $tmp['department_name']  = mb_convert_encoding(isset($row['department_name'])?$row['department_name']:NULL, "UTF-8", "GBK");

            // 查看是否存在 在BOM
            $bom_has  = DB::table($this->bom_table)->where([['code','=',$tmp['production_code']]])->first();

            // 查看是否存在 在物料
            $material_has=DB::table($this->material_table)->where([['item_no','=',$tmp['production_code']]])->first();

            if (!$bom_has &&  !$material_has) 
            {
               $tmp['storage_status']  = 0;
            } 
            else
            {
               $tmp['storage_status']  = 1;
            }

            $result[]  = $tmp;
        }
        return $result;
    }


    /**
     * 获取订单
     * @return array  返回数组对象集合
     */
    public function showEnterPriseOrder($input)
    {
        //  获取提交参数  
        $company_id =  isset($input['company_id'])?$input['company_id']:'';
        $product_department_id  =  isset($input['product_department_id'])?$input['product_department_id']:'';
        $order_status  =  isset($input['order_status'])?$input['order_status']:'';
        $start_date  =  isset($input['start_date'])?$input['start_date']:'';
        $end_date  =  isset($input['end_date'])?$input['end_date']:'';
        $order_no  =  isset($input['order_no'])?$input['order_no']:'';

        $url  = "http://58.221.197.202:30087/Proorder/showOrder?company_id=".$company_id."&product_department_id=".$product_department_id."&order_status=".$order_status."&start_date=".$start_date."&end_date=".$end_date."&order_no=".$order_no."&_token=8b5491b17a70e24107c89f37b1036078";

        $result = $this->myCurl($url);

        if (is_array($result))
        {
            foreach ($result as $key => $value) 
            {
                // 查看是否存在 在BOM
                $bom_has  = DB::table($this->bom_table)->where([['code','=',$value['production_code']]])->first();

                // 查看是否存在 在物料
                $material_has=DB::table($this->material_table)->where([['item_no','=',$value['production_code']]])->first();

                if (!$bom_has &&  !$material_has) 
                {
                  $result[$key]['storage_status']  = 0;
                } 
                else
                {
                  $result[$key]['storage_status']  = 1;

                }
            }
        }
        else
        {
            $result = [];
        }
        
        return $result;
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


}