<?php
/**
 * Created by PhpStorm.
 * User: wangguangyang
 * Date: 2018/2/9
 * Time: 14:13
 */
namespace App\Http\Controllers\Mes;

use App\Http\Models\QC\Check;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Http\Models\StorageInve;
use Excel;
use Illuminate\Support\Facades\DB;



class CheckItemController extends Controller
{
    public function __construct()
    {
        parent::__construct();
        if (empty($this->model)) $this->model = new Check();
    }

    /**
     * 根据条件列表，并将明细数据导出EXCEL
     * @param
     * @author  Ming.Li
     */
    //导出excel
    public function  exportExcel(Request $request)
    {
        //过滤,判断并提取所有的参数
        $input=$request->all();
        $cellData=[]; //定义一个容器
        // 开始组装
        // 1.确定第一行
        if (!isset($input['check_type_code'])) TEA('9533');
        $check_type_code  = $input['check_type_code'];

        // 通过类型 查找所有的检验项
        $ruis_qc_template =  DB::table('ruis_qc_template  as template')
                          ->select('inspect.name','template.*','inspect.type')
                          ->leftJoin('ruis_inspect_object  as  inspect', 'inspect.id', '=', 'template.check_inspect_id')
                          ->where('check_type_code',$check_type_code)
                          ->get();
        $now_time= date('Y-m-d H:i:s',time());                
        //组装第一行数据
        $first_line=[
             $now_time,
             $check_type_code
        ];
        $cellData[]=$first_line;
        //组装表格第二行数据
        $second_line=[
            '送检时间',
            '检验时间',
            'ASN号',
            '采购凭证编号',
            '采购凭证项目编号',
            '销售和分销凭证号',
            '销售凭证项目',
            '供应商',
            '物料编码',
            '物料属性',
            '检验结果',
            '数量',
            '检验数量',
            '采购仓储地',
            '检验类型',
            '检验人卡号',
        ];                 
        foreach ($ruis_qc_template as $template) 
        {
            $second_line[] = $template->name;
        }
        $cellData[]=$second_line;
        $search_data=[
            'qcheck.ctime as ctime',  // 送检时间
            'qcheck.check_time as check_time',  //检验时间 
            'qcheck.id as id',  //id 
            'qcheck.WMASN as WMASN',  //ASN 号
            'qcheck.EBELN as EBELN',  //采购凭证编号
            'qcheck.EBELP as EBELP',  //采购凭证项目编号
            'qcheck.VBELN as VBELN',  //销售和分销凭证号
            'qcheck.VBELP as VBELP',  //销售凭证项目
            'qcheck.NAME1 as NAME1',  //供应商
            'material.item_no as item_no',  //物料编码
            'qcheck.attr as attr',    //物料属性
            'qcheck.result as result',//检验结果
            'qcheck.GRQTY as GRQTY',  //数量
            'qcheck.amount_of_inspection as amount_of_inspection',  //抽检数量
            'qcheck.LGFSB as LGFSB',  //采购仓储地
            'qcheck.check_type_code as check_type_code',  //检验类型
            'employee.card_id  as  card_id', // 检验人卡号
        ];
        $where =  $this->_search($input);
        $check_res  =  DB::table('ruis_qc_check  as  qcheck')
              ->leftJoin('ruis_material  as  material', 'material.id', '=', 'qcheck.material_id')
              ->leftJoin('ruis_rbac_admin  as admin', 'admin.id', '=', 'qcheck.checker')
              ->leftJoin('ruis_employee  as employee', 'employee.id', '=', 'admin.employee_id')
              ->select($search_data)
              ->where($where)
              ->get();

        foreach (obj2array($check_res) as  $obj) 
        {   
            $obj['ctime'] = date("Y-m-d H:i:s",$obj['ctime']);
            $obj['check_time'] = date("Y-m-d H:i:s",$obj['check_time']);

            if ($obj['result']  == 0) 
            {
                $obj['result'] =  '合格';
            }
            if ($obj['result']  == 1) 
            {
               $obj['result'] =  '不合格'; 
            }
            $where = [
                'result.qc_check_id'=>$obj['id'],
            ]; 
            //检验结果集合
            $temp_res = DB::table('ruis_qc_check_item_result  as  result')
                       ->select('result.*','inspect.name','inspect.type','inspect.id  as  inspect_id')
                       ->leftJoin('ruis_qc_template  as  template', 'template.id', '=', 'result.qc_template')
                       ->leftJoin('ruis_inspect_object  as  inspect', 'inspect.id', '=', 'template.check_inspect_id')
                       ->where($where)
                       ->get();
            $result_res  = [];
            foreach ($temp_res as  $va)
            {
                $result_res[$va->qc_template]  = $va;
            }
            foreach ($ruis_qc_template as $template) 
            {
                $template_id  = $template->id;
                $template_name  = $template->name;
                if (array_key_exists($template_id,$result_res))
                {
                    //如果当前检验项  在 检验结果里面可以找到那就显示  结果
                    $str='/';
                    if ($result_res[$template->id]->value  == 0) 
                    {
                       $str = '√';
                    }

                    if ($result_res[$template->id]->value  == 1) 
                    {
                        $str = '×';
                    }
                    $obj[$template_name] = $str;
                }
                else
                {
                    $obj[$template_name]='' ;
                }
            }
            unset($obj['id']);
            $cellData[]=$obj;
        }
        Excel::create('iqc/excel',function($excel) use ($cellData){
            $excel->sheet('score', function($sheet) use ($cellData){
                $sheet->rows($cellData);
            });
        })->export('xls');
    }
    /**
     * 搜索
     */
    private function _search(&$input)
    {
        $where = array();
        if (isset($input['check_type']) && $input['check_type']) {
            $where[]=['qcheck.check_type','like','%'.$input['check_type'].'%'];
        }

        if (isset($input['WMASN']) && $input['WMASN']) {
            $where[]=['qcheck.WMASN','like','%'.$input['WMASN'].'%'];
        }

        if (isset($input['LGPRO']) && $input['LGPRO']) {
            $where[]=['qcheck.LGPRO','like','%'.$input['LGPRO'].'%'];
        }

        if (isset($input['code']) && $input['code']) {
            $where[]=['qcheck.code','like','%'.$input['code'].'%'];
        }

        if (isset($input['material_name']) && $input['material_name']) {
            $where[]=['material.name','like','%'.$input['material_name'].'%'];
        }

        if (isset($input['factory_name']) && $input['factory_name']) {
            $where[]=['factory.name','like','%'.$input['factory_name'].'%'];
        }

        if (isset($input['operation_name']) && $input['operation_name']) {
            $where[]=['operation.name','like','%'.$input['operation_name'].'%'];
        }

        if (isset($input['operation_id']) && $input['operation_id']) {
            $where[]=['operation.id','=',$input['operation_id']];
        }

        if (isset($input['start_time']) && $input['start_time']) {//根据创建时间
            $where[]=['qcheck.ctime','>=',strtotime($input['start_time'])];
        }
        if (isset($input['end_time']) && $input['end_time']) {//根据创建时间
            $where[]=['qcheck.ctime','<=', strtotime($input['end_time'])];
        }

        if (isset($input['check_type_code']) && $input['check_type_code']) {
            $where[]=['qcheck.check_type_code','=',$input['check_type_code']];
        }
        
        if (isset($input['check_resource']) && $input['check_resource']) 
        {
            $where[]=['qcheck.check_resource','=',$input['check_resource']];
        }
        else
        {
            TEA('6525');
        }

        if ($input['check_resource'] == 1) 
        {
            // 如果是iqc
            if (isset($input['check_status']) && $input['check_status']) 
            {
                if ($input['check_status'] == 1) 
                {
                    //如果是没有推送
                    //order  (多order的情形,需要多次调用orderBy方法即可)
                    if (empty($input['order']) || empty($input['sort'])) 
                    {
                        $input['order']='asc';$input['sort']='ctime';
                    } 
                }

                if ($input['check_status'] == 2) 
                {
                    //如果已经推送
                    //order  (多order的情形,需要多次调用orderBy方法即可)
                    if (empty($input['order']) || empty($input['sort'])) 
                    {
                        $input['order']='desc';$input['sort']='ctime';
                    } 
                }

                $where[]=['qcheck.status','=',$input['check_status']];
            }
            else
            {
                //order  (多order的情形,需要多次调用orderBy方法即可)
                if (empty($input['order']) || empty($input['sort'])) 
                {
                    $input['order']='asc';$input['sort']='ctime';
                } 
                $where[]=['qcheck.status','<',2];
            }
        }

        if ($input['check_resource'] == 2) 
        {
            //如果 是ipqc
            if (isset($input['man_check']) && $input['man_check']) 
            {
                if ($input['man_check'] == 0) 
                {
                    //如果没有人工检验
                    //order  (多order的情形,需要多次调用orderBy方法即可)
                    if (empty($input['order']) || empty($input['sort'])) 
                    {
                        $input['order']='asc';$input['sort']='ctime';
                    } 
                }

                if ($input['man_check'] == 1) 
                {
                    //如果已经人工检验
                    //order  (多order的情形,需要多次调用orderBy方法即可)
                    if (empty($input['order']) || empty($input['sort'])) 
                    {
                        $input['order']='desc';$input['sort']='ctime';
                    } 
                }
                $where[]=['qcheck.man_check','=',$input['man_check']];
            }
            else
            {
                //order  (多order的情形,需要多次调用orderBy方法即可)
                if (empty($input['order']) || empty($input['sort'])) 
                {
                    $input['order']='asc';$input['sort']='ctime';
                } 
                $where[]=['qcheck.man_check','=',0];
            }
        }
        return $where;
    }







    /**
     * @message 添加ipqc送检单
     * @author  liming
     * @time    年 月 日
     */    
    public function  addIpqc(Request $request)
    {
        //过滤,判断并提取所有的参数
        $input=$request->all();
        if(empty($input['id']) || !is_numeric($input['id'])) TEA('703','id');
        $workorder_id  = $input['id'];
        
        //呼叫M层进行处理
        $order_id   =   $this->model->addIpqc($workorder_id);

        //拼接返回值
        $response=get_api_response('200');
        $response['results']=['order_id'=>$input['id']];
        return  response()->json($response);
    }  



    /**
     * 审核
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
        $order_id   =   $this->model->audit($input);

        //拼接返回值
        $response=get_api_response('200');
        $response['results']=['order_id'=>$input['id']];
        return  response()->json($response);
    }

    /**
     * 反审
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
        $this->model->noaudit($input);
        //拼接返回值
        $response=get_api_response('200');
        $response['results']=['order_id'=>$input['id']];
        return  response()->json($response);
    }

//region 修
//编辑检验
    public function updateCheck(Request $request)
    {
        //过滤,判断并提取所有的参数
        $input=$request->all();
        if(empty($input['check_id']) || !is_numeric($input['check_id']))  TEA('703','check_id');
        $qc_check_type=$this->model->update($input);
        $response=get_api_response('200');
        $response['results']=$qc_check_type;
        return  response()->json($response);
    }

    /**
     * @message 选择模板
     * @author  liming
     * @time    年 月 日
     */    
    public function selectTemplate(Request $request)
    {
        //过滤,判断并提取所有的参数
        $input=$request->all();
        //id判断
        if(empty($input['check_id']) || !is_numeric($input['check_id']))  TEA('703','check_id');
        $qc_check_type=$this->model->selectTemplate($input);
        $response=get_api_response('200');
        $response['results']=$qc_check_type;
        return  response()->json($response);
    }

    // 查看模板
    public  function   showTemplate(Request $request)
    {
       //判断ID是否提交
        $check_id=$request->input('check_id');
        if(empty($check_id)|| !is_numeric($check_id)) TEA('703','check_id');
        //呼叫M层进行处理
        $response=get_api_response('200');
        $response['results']=$this->model->showTemplate($check_id);
        return  response()->json($response);
    }


    /**
     * 添加检验结果
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     */
    public function checkMore(Request $request)
    {
        //过滤,判断并提取所有的参数
        $input=$request->all();
        $qc_check_type=$this->model->checkMore($input);
        $response=get_api_response('200');
        $response['results']=$qc_check_type;
        return  response()->json($response);
    }
//endregion

//region 查
//查看检验
    public function viewCheck(Request $request)
    {
        //过滤,判断并提取所有的参数
        $input=$request->all();
        $qc_check_type=$this->model->viewCheck($input);
        $response=get_api_response('200');
        $response['results']=$qc_check_type;
        return  response()->json($response);
    }

//检验列表
    public function select(Request $request)
    {
        //过滤,判断并提取所有的参数
        $input=$request->all();
        $obj_list=$this->model->select($input);
        //获取返回值
        $paging=$this->getPagingResponse($input);
        return  response()->json(get_success_api_response($obj_list,$paging));
    }
    //检验下拉框
    public function dropdownSelect(Request $request)
    {
        //过滤,判断并提取所有的参数
        $input=$request->all();
        $obj_list=$this->model->dropdownSelect($input);
        //获取返回值
        return  response()->json(get_success_api_response($obj_list));
    }
//endregion

//region 删
//endregion

    /**
     * @message  同步送检单
     * @author  liming
     * @time    年 月 日
     */    
    public function syncInspectOrder(Request $request)
    {
        $input = $request->all();
        api_to_txt($input, $request->path());
        $response = $this->model->syncInspectOrder($input);
        return response()->json(get_success_sap_response($response));
    } 


    /**
     * @message  同步送检单
     * @author  liming
     * @time    年 月 日
     */    
    public function pushInspectOrder(Request $request)
    {
        $input = $request->all();
        //id判断
        if(empty($input['check_id']) || !is_numeric($input['check_id'])) TEA('703','check_id');
        $response = $this->model->pushInspectOrder($input);
        return   $response;
    }


    /**
     * @message 编辑检验数量
     * @author  liming
     * @time    年 月 日
     */    
    public function setCheckQty(Request $request)
    {
        $input = $request->all();
        //id判断
        //过滤,判断并提取所有的参数
        $input=$request->all();
        if(empty($input['check_id']) || !is_numeric($input['check_id']))  TEA('703','check_id');
        $qc_check_type=$this->model->setCheckQty($input);
        $response=get_api_response('200');
        $response['results']=$qc_check_type;
        return  response()->json($response);
    }


    /**
     * @message 更改 检验单状态
     * @author  liming
     * @time    年 月 日
     */    
    public function updatePushStatus(Request $request)
    {
        $input = $request->all();
        //id判断
        //过滤,判断并提取所有的参数
        $input=$request->all();
        if(empty($input['check_id']) || !is_numeric($input['check_id']))  TEA('703','check_id');
        $qc_check_type=$this->model->updatePushStatus($input);
        $response=get_api_response('200');
        $response['results']=$qc_check_type;
        return  response()->json($response);
    }
}