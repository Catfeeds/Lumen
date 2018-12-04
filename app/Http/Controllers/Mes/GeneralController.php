<?php
/**
 * Created by PhpStorm.
 * User: sam.shan
 * Date: 17/10/19
 * Time: 上午9:02
 */



/**
 *MES系统通用控制器类
 * @author    sam.shan  <sam.shan@ruis-ims.cn>
 */

namespace App\Http\Controllers\Mes;
use App\Http\Controllers\Controller;
use App\Http\Models\AttributeDataType;
use App\Http\Models\UomUnit;
//use GuzzleHttp\Psr7\Request;//单位数据处理模型
use Illuminate\Http\Request;


/**
 * 通用访问控制器
 * Class GeneralController
 * @package App\Http\Controllers\Mes
 * @author  sam.shan  <sam.shan@ruis-ims.cn>
 */
class GeneralController extends Controller
{

    /**
     * GeneralController constructor.
     */
    public function __construct()
    {
        parent::__construct();
    }



    /**
     * 获得所有的units值
     * @param   \Illuminate\Http\Request  $request   Request实例
     * @return  string  返回json
     * @author  xujian
     * @reviser  sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function getUnitList(Request $request)
    {
        //呼叫M层进行处理
        $input = $request->all();
        $m=new UomUnit();
        $results=$m->getUnitList($input);
        return  response()->json(get_success_api_response($results));
    }



    /**
     * 获得自定义属性的dataType值
     * @param   \Illuminate\Http\Request  $request   Request实例
     * @return  string  返回json
     * @author  xujian
     * @reviser  sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function getAttributeDataTypeList(Request $request)
    {
        $type = $request->input('type');
        //呼叫M层进行处理
        $m=new AttributeDataType();
        $results=$m->getDataTypeList();
        $new = [];
        if(in_array($type,array_keys(config('app.module_data_type')))){
            foreach($results as $k=>$v){
                if(in_array($v->name,config('app.module_data_type.'.$type))){
                    $new[] = $v;
                }
            }
        }else{
            $new = $results;
        }
        return  response()->json(get_success_api_response($new));
    }




















}










