<?php

namespace App\Http\Controllers\WorkHour;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Http\Models\WorkHour;
use App\Libraries\Tree;//引入无限极分类操作类


/**
 * 工时控制器
 * Class WorkHourController
 * @package App\Http\Controllers\WorkHour
 * @auth leo.yan
 */
class WorkHourController extends Controller
{
    protected $model;

    public function __construct()
    {
        parent::__construct();
        if(empty($this->model))
        {
            $this->model = new WorkHour();
        }
    }

    /**
     * 成品寻找流转品
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function showMaterials(Request $request)
    {
        $input = $request->all();
        $obj_list = $this->model->showMaterials($input);
        return  response()->json(get_success_api_response($obj_list));
    }


    // 根据工序获得物料列表   （维护过的 、 没有维护过的）
    /**
     * 成品寻找流转品
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * liming
     */
    public function showMaterialsByProcess(Request $request)
    {
        $input = $request->all();
        $obj_list =[];
        $obj_list['code'] =200;
        $obj_list['results'] = $this->model->showMaterialsByProcess($input);
        return json_encode($obj_list);
    }


     /**
     * 工时工序设置
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function setting(Request $request)
    {
        $input = $request->all();
        //检测字段
        // $this->model->checkSettingFields($input);

        //插入数据
        $result = $this->model->addSetting($input);
        $results=['work_hour_id'=>$result];
        return  response()->json(get_success_api_response($results));
    }

     /**
     * 获取标准工时设置列表
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function Setting_list(Request $request)
    {
        $input = $request->all();
        $abc = $this->model->Setting_list($input);

        $results=Tree::findDescendants($abc);
        return  response()->json(get_success_api_response($results));
    }

    public function setting_show(Request $request)
    {
        $input = $request->all();
        $results = $this->model->setting_show($input);
        return  response()->json(get_success_api_response($results));
    }
    
    //工时设置制空
    public function setting_empty(Request $request)
    {
        $input = $request->all();

        if(empty($input['id']) || !is_numeric($input['id'])) TEA('703','id');

        $results = $this->model->setting_empty($input);

        return  response()->json(get_success_api_response($results));
    }



        /**
         * 工时工序修改
         * @param Request $request
         * @return \Illuminate\Http\JsonResponse
         */
        public function updateSetting(Request $request)
        {
            $input = $request->all();
            //检测字段
            // $this->model->checkSettingFields($input);

            if(empty($input['id']) || !is_numeric($input['id'])) TEA('703','id');

            //插入数据
            $result = $this->model->updateSetting($input);

            $results=['work_hour_id'=>$result];
            return  response()->json(get_success_api_response($results));
        }


        /**
         * 设置为基准工时
         * @param Request $request
         * @return \Illuminate\Http\JsonResponse
         */
        public function setting_sign(Request $request)
        {
            $input = $request->all();
            //更新数据
            $result = $this->model->setting_sign($input);
            return  response()->json(get_api_response(200));
        }

        /**
         * 取消基准工时
         * @param Request $request
         * @return \Illuminate\Http\JsonResponse
         */
        public function cancel_sign(Request $request)
        {
            $input = $request->all();
            //更新数据
            $result = $this->model->cancel_sign($input);
            return  response()->json(get_api_response(200));
        }

        

        /**
         * 添加标准工时
         * @param Request $request
         * @return \Illuminate\Http\JsonResponse
         */
        public function store(Request $request)
        {
            $input = $request->all();
            //更新数据
            $result = $this->model->store_new($input);
            return  response()->json(get_api_response(200));
        }

    /**
     * 根据物料编码获取工序工时
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getWorkHoursByMaterialNo(Request $request)
    {
        $input = $request->all();
        $results = $this->model->getWorkHoursByMaterialNo($input);
        return  response()->json(get_success_api_response($results));
    }


    /**
     * 根据bom获取工序工时
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getWorkHoursByRouting(Request $request)
    {
        $input = $request->all();
        $results = $this->model->getWorkHoursByRouting($input);
        return  response()->json(get_success_api_response($results));
    }


    /**
     * 根据bom获取所有有关的工时
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */

     public  function  getAllHoursByBom(Request $request)
     {
        $input = $request->all();
        $results = $this->model->getAllHoursByBom(25,0);
        return  response()->json(get_success_api_response($results));
     }


     // 算总工时
     public  function  getTotalHours(Request $request)
     {
        $input = $request->all();
        $bom_id =  312 ;
        $step =[];
        $step[] =[
            'base_step_id'=>333,
            'operation_id'=>20,
            'abilitys'=>[
                '122'=>'',
                '110'=>'',
            ],
        ];
         $qty  =  1;
         $hourdata   =  $this->model->getAllHoursByBom($bom_id,45); // 68 是routing_id
         $results = $this->model->countTotalHours($bom_id,$step,$qty,$hourdata);
         return  response()->json(get_success_api_response($results));
     }


     // 算总工时
     public  function  copyWorkHours(Request $request)
     {
        $update = [];
        $update['old']=[
            'bom_id'=>2,
            'routing_id'=>10,
            'step_info_id'=>1,
            'bom_version'=>1,
            'bom_version_description'=>'第一版本',
        ];
        $update['new']=[
            'bom_id'=>2,
            'routing_id'=>10,
            'step_info_id'=>3,
            'bom_version'=>2,
            'bom_version_description'=>'第二版本',
        ];

        $results = $this->model->copyWorkHours($update);
     }


    /**
     * 获取标准工时列表
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        $input = $request->all();
        $results = $this->model->index($input);
        return  response()->json(get_success_api_response($results));
    }



    /**
     * 获取标准工时列表
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function indextest(Request $request)
    {
        $input = $request->all();
        $results = $this->model->indextest($input);
        return  response()->json(get_success_api_response($results));
    }



    /**
     * 标准工时删除
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(Request $request)
    {
        $input = $request->all();
        //删除数据
        $result = $this->model->destroy($input);
        return  response()->json(get_api_response(200));
    }

    /**
     * 修改标准工时
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request)
    {
        $input = $request->all();
        //删除数据
        $result = $this->model->update($input);
        return  response()->json(get_api_response(200));
    }

    /**
     * 查看标准工时
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(Request $request)
    {
        $input = $request->all();
        $results = $this->model->show($input);
        return  response()->json(get_success_api_response($results));
    }
/**
     * 获取标准工时列表Excel导出查询
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function whlistExportExcel(Request $request)
    {
        $input = $request->all();
        $list = $this->model->work_hours_list_Excel($input);
        //呼叫M层进行处理
        $response=get_api_response('200');
        $response['results']=$list;
        //获取返回值
        $paging=$this->getPagingResponse($input);
        return  response()->json(get_success_api_response($list,$paging));
    }
    /**
     * 导出标准工时列表
     * @param Request $request
     */
    public function workHoursListExportExcel(Request $request)
    {
        $input = $request->all();

        $objPHPExcel = new \PHPExcel();
        $objPHPExcel->getProperties()->setTitle('export')->setDescription('Work Hours Excel Export');
        $objPHPExcel->setActiveSheetIndex(0);

        $list = $this->model->work_hours_list_Excel($input);
        //print_r($list);
        //添加表头
        $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(0,1, '物料名称');
        $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(1,1, '物料编码');
        $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(2,1, '工序');
        $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(3,1, '工序代码');
        $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(4,1, '能力');
        $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(5,1, '能力id');
        $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(6,1, '最小值');
        $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(7,1, '最大值');
        $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(8,1, '单位');
        $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(9,1, '标准工时');
        $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(10,1, '实际工时');


        if(count($list) > 0)
        {
            $rows = 1;
            foreach ($list as $v)
            {
                $rows++;
                $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(0,$rows,$v['material_name']);
                $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(1,$rows,$v['material_no']);
                $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(2,$rows,$v['operation_name']);
                $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(3,$rows,$v['operation_code']);
                $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(4,$rows,$v['ability_name']);
                $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(5,$rows,$v['ability_id']);
                $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(6,$rows,'');
                $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(7,$rows,'');
                $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(8,$rows,$v['unit_text']);
                $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(9,$rows,'');
                $objPHPExcel->getActiveSheet()->setCellValueByColumnAndRow(10,$rows,'');
            }
        }

        $objPHPExcel->setActiveSheetIndex(0);

        ob_end_clean();//清除缓冲区,避免乱码
        header('Content-Type:application/vnd.ms-excel');
        header('Content-Disposition:attachment;filename="Work_Hours_' .date('Y-m-d') . '.xls"');
        header('Cache-Control:max-age=0');
        $objWrite = \PHPExcel_IOFactory::createWriter($objPHPExcel,'Excel5');
        $objWrite->save('php://output');
    }

    /**
     * 导入标准工时
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function workHoursListImportExcel(Request $request)
    {
        $input=$request->all();
        $file = $input['import_file'];
        //获得文件后缀，并且转为小写字母显示
        //$extension = strtolower(pathinfo($file,PATHINFO_EXTENSION));
        $extension = strtolower($file->getClientOriginalExtension());
        $excel_type = 'Excel5';
        if ($extension == 'xlsx' || $extension == 'xls')
        {
            //判断是否为excel
            $excel_type = ($extension == 'xlsx' ? 'Excel2007' : 'Excel5');
        }
        else
        {
            TEA('8700');
        }
        //创建读取对象
        $objReader = \PHPExcel_IOFactory::createReader($excel_type)->load($file);
        $sheet = $objReader->getSheet(0);
        $highestRow = $sheet->getHighestRow();       //取得总行数
        $highestColumn = $sheet->getHighestColumn(); //取得总列数
        //获得表头信息A,B,C......
        $col_span = range( 'A', $highestColumn );

        $values = [];
        //循环读取excel文件
        for ($i = 1; $i < $highestRow; $i++)
        {
            $array = array();
            foreach ( $col_span as $value ) {
                $array[] = $objReader->getActiveSheet()->getCell( $value . ($i + 1) )->getValue();
            }

            $values[] = $array;//以数组形式读取
        }

        $results = $this->model->work_hours_list_importExcel($values);
        //print_r($values);
        return  response()->json(get_success_api_response($results));
    }
    /**
     * 批量提交待审核
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function batchSubmitCheck(Request $request)
    {
        $input=$request->all();
        $this->model->batch_submit_check($input);

        //拼接返回值
        $response = get_api_response('200');
        $response['results'] = ['hour_ids'=>$input['ids']];
        return  response()->json($response);
    }

    /**
     * 标准工时待审核撤回
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function returnCheck(Request $request)
    {
        $input=$request->all();
        $this->model->return_check($input);

        $response = get_api_response('200');
        $response['results']=['hour_id'=>$input['id']];
        return  response()->json($response);
    }

    /**
     * 标准工时待审核批量撤回
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function batchReturnCheck(Request $request)
    {
        $input=$request->all();
        $this->model->batch_return_check($input);

        $response=get_api_response('200');
        $response['results']=['hour_ids'=>$input['ids']];
        return  response()->json($response);
    }

    /**
     * 标准工时审核
     * @param Request $request
     * @return  string  返回json
     * @author xiafengjuan
     */
    public  function audit(Request $request)
    {
        //业务权限判断
        //过滤,判断并提取所有的参数
        $input=$request->all();
        //id判断
        if(empty($input['id']) || !is_numeric($input['id'])) TEA('703','id');

        //呼叫M层进行处理
        $this->model->audit($input);


        //拼接返回值
        $response=get_api_response('200');
        $response['results']=['hour_id'=>$input['id']];
        return  response()->json($response);
    }
    /**
     * 标准工时批量审核
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
            TEA('8800','ids');
        }
        //呼叫M层进行处理
        $this->model->batchaudit($input);


        //拼接返回值
        $response=get_api_response('200');
        $response['results']=['hour_ids'=>$input['ids']];
        return  response()->json($response);
    }
    public function test()
    {
        echo 111;
    }
}