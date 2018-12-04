<?php
/**
 * 期初库存管理控制器
 * User: xiafengjuan
 * Date: 2017/11/4
 * Time: 11:17
 */
namespace App\Http\Controllers\Mes;//定义命名空间
use App\Http\Controllers\Controller;//引入基础控制器类
use Illuminate\Http\Request;//获取请求参数
use App\Http\Models\StorageInitial;

class StorageInitialController extends Controller
{
    private  $storageinitial;
    public function __construct()
    {
        parent::__construct();
        if (empty($this->storageinitial)) $this->storageinitial = new StorageInitial();
    }
     /**
     * 导出Excel模板
     */
    public function exportExcel()
    {
        
        //联系M层导出
        $er=$this->storageinitial->Export_initial();
        return $er;
    }
    /**
     * 根据条件获得期初库存列表
     * @param
     * @return  string  返回json|jsonp格式
     * @author  xiafengjuan
     */
    public function index(Request $request)
    {
        $input = $request->all();
        $obj_list=$this->storageinitial->getStorageInitialList($input);
        //呼叫M层进行处理
        $response=get_api_response('200');
        $response['results']=$obj_list;
        //获取返回值
        $paging=$this->getPagingResponse($input);
        return  response()->json(get_success_api_response($obj_list,$paging));
    }
    public function  show(Request $request)
    {
        $input = $request->all();
        $obj_list=$this->storageinitial->getStorageInitial($input);
        //呼叫M层进行处理
        $response=get_api_response('200');
        $response['results']=$obj_list;
        return  response()->json($response);

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
        $input['has']=$this->storageinitial->isExisted($where);
        //拼接返回值
        $results=$this->getUniqueResponse($input);
        return  response()->json(get_success_api_response($results));
    }

    /**
     * 获取EXCEL文件，并将结果保存至期初库存表
     * @param
     * @author  xiafengjuan
     */
    //导入excel
    public function storageinitial_importExcel(Request $request)
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
            pd('文件不是excel');
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
                $array[] = $objReader->getActiveSheet()->getCell( $value . ($i + 1) )->getValue();

            }
            $values[] = $array;//以数组形式读取
        }

        unset($values[0]);
        $this->storageinitial->saveInitial($values);
        //拼接返回值
        $response=get_api_response('200');
        return  response()->json($response);
    }

    /**
     * 添加期初库存
     * @return   string   json
     * @author   xiafengjuan
     */
    public function store(Request  $request)
    {
        //过滤,判断并提取所有的参数
        $input=$request->all();
        //呼叫M层进行处理
        $insert_id=$this->storageinitial->add($input);
        $response=get_api_response('200');
        $response['results']=['id'=>$insert_id];
        return  response()->json($response);
    }
    /**
     * 编辑期初库存
     * @param Request $request
     * @return  string
     * @author  xiafengjuan
     */
    public  function update(Request $request)
    {
        //过滤,判断并提取所有的参数
        $input=$request->all();
        //id判断
        if(empty($input['id']) || !is_numeric($input['id'])) TEA('703','id');
        //呼叫M层进行处理
        $this->storageinitial->update($input);
        $response=get_api_response('200');
        $response['results']=['id'=>$input['id']];
        return  response()->json($response);
    }

    /**
     * 删除期初库存
     * @param Request $request
     * @return   string  json
     * @author   xiafengjuan
     */
    public  function  destroy(Request $request)
    {
        //判断ID是否提交
        $id = $request->input('id');
        if(empty($id)|| !is_numeric($id)) TE('703','id');
        //呼叫M层进行处理
        $this->storageinitial->destroy($id);
        //获取返回值
        $response=get_api_response('200');
        return  response()->json($response);

    }
    /**
     * 入库单审核
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
        $this->storageinitial->audit($input);

        //拼接返回值
        $response=get_api_response('200');
        $response['results']=['order_id'=>$input['id']];
        return  response()->json($response);
    }
    /**
     * 调拨单批量审核
     * @param Request $request
     * @return  string  返回json
     * @author xiafengjuan
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
        $this->storageinitial->batchaudit($input);
        //拼接返回值
        $response=get_api_response('200');
        $response['results']=['order_id'=>$input['ids']];
        return  response()->json($response);
    }
    /**
     * 入库单反审
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
        $this->storageinitial->noaudit($input);
        //拼接返回值
        $response=get_api_response('200');
        $response['results']=['order_id'=>$input['id']];
        return  response()->json($response);
    }
}