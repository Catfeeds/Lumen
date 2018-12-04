<?php
/**
 * 库存盘点管理控制器
 * User: xiafengjuan
 * Date: 2017/12/4
 * Time: 13:17
 */
namespace App\Http\Controllers\Mes;//定义命名空间
use App\Http\Controllers\Controller;//引入基础控制器类
use Illuminate\Http\Request;//获取请求参数
use Laravel\Lumen\Routing\Controller as BaseController;//引入Lumen底层控制器
use App\Http\Models\StorageCheck;
use App\Http\Models\StorageInve;

class StorageCheckController extends Controller
{
    public function __construct()
    {
        parent::__construct();
        if (empty($this->storagecheck)) $this->storagecheck = new StorageCheck();
        if(empty($this->sinve)) $this->sinve =new StorageInve();
    }
    /**
     * 根据条件获得实时库存列表
     * @return  string  返回json|jsonp格式
     * @author  xiafengjuan
     */
    public function index(Request $request)
    {
        $input = $request->all();
        //获取数据
        $obj_list=$this->sinve->getStorageInveList($input);
        //呼叫M层进行处理
        $response=get_api_response('200');
        $response['results']=$obj_list;
        return  response()->json($response);
    }
    /**
     * 根据条件获得实时库存列表
     * @return  string  返回json|jsonp格式
     * @author  xiafengjuan
     */
    public function getCheckList(Request $request)
    {
        $input = $request->all();
        //分页参数判断
        $this->checkPageParams($input);
        //获取数据
        $obj_list=$this->storagecheck->getCheckLists($input);
        //呼叫M层进行处理
        $response=get_api_response('200');
        $response['results']=$obj_list;
        //获取返回值
        $paging=$this->getPagingResponse($input);
        return  response()->json(get_success_api_response($obj_list,$paging));
    }


    /**
     * 所有字段检测唯一性
     * @param Request $request
     * @return string  返回json
     * @throws \App\Exceptions\ApiException
     */
    public  function unique(Request $request)
    {
        //获取参数并过滤
        $input=$request->all();
        trim_strings($input);
        $where=$this->getUniqueExistWhere($input);
        $input['has']=$this->storagecheck->isExisted($where);
        //拼接返回值
        $results=$this->getUniqueResponse($input);
        return  response()->json(get_success_api_response($results));
    }


    /**
 * 根据条件获得实时库存列表
 * @return  string  返回json|jsonp格式
 * @author  xiafengjuan
 */
    public function getCheckShow(Request $request)
    {
        $input = $request->all();
        //获取数据
        $obj_list=$this->storagecheck->getCheck($input);
        //呼叫M层进行处理
        $response=get_api_response('200');
        $response['results']=$obj_list;
        return  response()->json($response);
    }
    /**
     * 根据条件获得库存明细列表，并将明细数据导出EXCEL
     * @param
     * @author  xiafengjuan
     */
    //导出excel
    public function  storageinve_exportExcel(Request $request)
    {
        $input = $request->all();
        $objPHPExcel = new \PHPExcel();

        $objPHPExcel->getProperties()->setTitle('export')->setDescription('Storage Inve Excel Export');

        $objPHPExcel->setActiveSheetIndex(0);

        $obj_list=$this->sinve->getStorageInveList($input);
        //添加表头
        $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(0,1, 'id');
        $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(1,1, '物料名称');
        $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(2,1, '物料编码');
        $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(3,1, '单位');
        $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(4,1, '单位id');
        $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(5,1, '订单号');
        $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(6,1, '是否锁库存');
        $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(7,1, '批次号');
        $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(8,1, '厂区名称');
        $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(9,1, '仓库名称');
        $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(10,1, '仓库id');
        $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(11,1, '分区名');
        $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(12,1, '仓位名称');
        $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(13,1, '理论库存');
        $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(14,1, '实际库存（填）');
        $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(15,1, '所属单位');

        if(count($obj_list)>0)
        {
            $rows=1;
            foreach ($obj_list as $key => $value)
            {
                //添加数据
                $rows+=1;
                $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(0,$rows, $value['id']);
                $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(1,$rows, $value['material_name']);
                $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(2,$rows, $value['material_item_no']);
                $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(3,$rows, $value['unit_text']);
                $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(4,$rows, $value['unit_id']);
                $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(5,$rows,  $value['customcode']);
                $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(6,$rows, $value['lock_status']);
                $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(7,$rows, $value['lot']);
                $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(8,$rows, $value['plant_name']);
                $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(9,$rows, $value['depot_name']);
                $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(10,$rows, $value['depot_id']);
                $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(11,$rows, $value['subarea_name']);
                $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(12,$rows, $value['bin_name']);
                $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(13,$rows, $value['quantity']);
                $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(14,$rows,'');
                $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(15,$rows, $value['owner_name']);
            }
        }

        $objPHPExcel->setActiveSheetIndex(0);

        $objWrite = \PHPExcel_IOFactory::createWriter($objPHPExcel,'Excel5');
        //Sending headers to force the user to download the file
        ob_end_clean();//清除缓冲区,避免乱码
        header('Content-Type:application/vnd.ms-excel');

        //header('Content-Disposition:attachment;filename="Products_' .date('dMy') . '.xls"');

        header('Content-Disposition:attachment;filename="Storage_Check_' .date('Y-m-d') . '.xls"');

        header('Cache-Control:max-age=0');

        $objWrite->save('php://output');
    }
    /**
     * 获取EXCEL文件，并将结果保存至盘点表
     * @param
     * @author  xiafengjuan
     */
    //导入excel
    public function storageinve_importExcel(Request $request)
    {
        $input=$request->all();
        if(!$request->file('import_file'))
        {
            TEA('703','import_file');
        }
        $file=$request->import_file->path();
        //获得文件后缀，并且转为小写字母显示
        $extension = strtolower($request->import_file->getClientOriginalExtension());
        $excel_type = 'Excel5';
        if ($extension == 'xlsx' || $extension == 'xls')
        {
            //判断是否为excel
            $excel_type = ($extension == 'xlsx' ? 'Excel2007' : 'Excel5');
        }else
        {
            TEA('8700');
        }
        //创建读取对象
        $objReader = \PHPExcel_IOFactory::createReader($excel_type)->load($file);
        $sheet = $objReader->getSheet( 0 );
        $highestRow = $sheet->getHighestRow();       //取得总行数
        $highestColumn = $sheet->getHighestColumn(); //取得总列数
        //获得表头信息A,B,C......
        $col_span = range( 'A', $highestColumn );

        $values = [];
        //循环读取excel文件
        for ( $i = 0; $i < $highestRow; $i++ ) {
            $array = array( );
            foreach ( $col_span as $value ) {
                $excelvalue = $objReader->getActiveSheet()->getCell( $value . ($i + 1) )->getValue();
                if(empty($excelvalue))
                {
                    $excelvalue='';
                }
                $array[] =$excelvalue;

            }
            $values[] = $array;//以数组形式读取
        }

        unset($values[0]);
        $id=0;
        $this->storagecheck->saveCheck($values,$id);
        //拼接返回值
        $response=get_api_response('200');
        return  response()->json($response);
    }
    /**
     * 修改盘点单
     * @param Request $request
     * @return  string  返回json
     * @author xiafengjuan
     */
    public  function editcheck(Request $request)
    {
        //过滤,判断并提取所有的参数
        $input=$request->all();
        //id判断
        if(empty($input['id']) || !is_numeric($input['id'])) TEA('703','id');

        //呼叫M层进行处理
        $this->storagecheck->editcheck($input);


        //拼接返回值
        $response=get_api_response('200');
        $response['results']=['order_id'=>$input['id']];
        return  response()->json($response);
    }

    /**
     * 盘点批量审核
     * @param Request $request
     * @return  string  返回json
     * @author
     */
    public  function batchaudit(Request $request)
    {
        //过滤,判断并提取所有的参数
        $input=$request->all();

        if($input['ids']=="")
        {
            TEA('8701','ids');
        }
        //呼叫M层进行处理
        $this->storagecheck->batchaudit($input);


        //拼接返回值
        $response=get_api_response('200');
        $response['results']=['order_id'=>$input['ids']];
        return  response()->json($response);
    }
    /**
     * 盘点单审核
     * @param Request $request
     * @return  string  返回json
     * @author
     */
    public  function audit(Request $request)
    {
        //业务权限判断
        //过滤,判断并提取所有的参数
        $input=$request->all();
        //id判断
        if(empty($input['id']) || !is_numeric($input['id'])) TEA('703','id');

        //呼叫M层进行处理
        $this->storagecheck->audit($input);


        //拼接返回值
        $response=get_api_response('200');
        $response['results']=['order_id'=>$input['id']];
        return  response()->json($response);
    }
    /**
     * 盘点单反审
     * @param Request $request
     * @return  string  返回json
     * @author
     */
    public  function noaudit(Request $request)
    {
        //业务权限判断
        //过滤,判断并提取所有的参数
        $input=$request->all();

        //id判断
        if(empty($input['id']) || !is_numeric($input['id'])) TEA('703','id');
        //呼叫M层进行处理
        $this->storagecheck->noaudit($input);
        //拼接返回值
        $response=get_api_response('200');
        $response['results']=['order_id'=>$input['id']];
        return  response()->json($response);
    }
}