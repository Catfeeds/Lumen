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
class AttributeDataType extends Base
{

    public function __construct()
    {
       $this->table=config('alias.adt');
    }
    /**
     * 获取自定义属性的数据类型,基础数据默认支持中英,不建议一开始做语言包
     * 基础数据默认取值请按照某个字段进行字典排序
     * @return mixed
     * @author xujian
     * @reviser  sam.shan  <sam.shan@ruis-ims.cn>
     * @todo handle，info字段是用来干嘛的，不清楚
     */
    public function getDataTypeList()
    {
        $obj_list = DB::table($this->table)->orderBy('name','asc')->select('id','id as data_type_id','name','cn_name','label')->get();
        return $obj_list;
    }



    /**
     * 获取属性数据类型参考数组
     * @return mixed
     * @author  sam.shan  <sam.shan@ruis-ims.cn>
     * @todo   基础常量表尽量别连表操作
     */
    public  function  getReferDataTypeList()
    {
        $obj_list = DB::table($this->table)->pluck('cn_name','id');
        return obj2array($obj_list);

    }




}