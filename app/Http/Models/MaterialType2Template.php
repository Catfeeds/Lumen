<?php
/**
 * Created by PhpStorm.
 * User: xujian
 * Date: 17/9/25
 * Time: 下午17:49
 */

namespace App\Http\Models;//定义命名空间
use Illuminate\Support\Facades\DB;//引入DB操作类

/**
 * 计量单位的操作类
 * @author  xujian
 * @time    2017年09月28日 16:36
 */
class  MaterialType2Template extends Base
{

    public function __construct()
    {
       $this->table='material_type2template';
    }
    /**
     * 根据条件获取相关的信息
     * @param array  input数组
     * @return mixed
     * @author xujian
     * @todo handle，info字段是用来干嘛的，不清楚
     */
    public function get($input)
    {
        $whereStr = "";
        $data = array();
        if (isset($input['type_id']) && $input['type_id']) {
            $whereStr .= 'type_id = ? ';
            $data[] = $input['type_id'];
        }
        if (isset($input['template_id']) && $input['template_id']) {
            if ($whereStr != '')
                $whereStr .= 'and ';
            $whereStr .= 'template_id = ? ';
            $data[] = $input['template_id'];
        }
        $obj_list = DB::table($this->table)
            ->whereRaw($whereStr,$data)
            ->select('id','type_id','template_id')->get();
        return $obj_list;
    }
}