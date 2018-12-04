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
 * @time    2017年09月28日 16:01
 */
class UomUnit extends Base
{

    public function __construct()
    {

       parent::__construct();
       $this->table=config('alias.ruu');
    }
    /**
     * 获取单位
     * @return mixed
     * @author xujian
     * @reviser  sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function getUnitList($input)
    {
        $builder = DB::table($this->table)->orderBy('name','asc')
                                           ->select('id','id as unit_id','name','unit_text','commercial','label');
        if(!empty($input['like_str'])) $builder->where('commercial','like','%'.$input['like_str'].'%');
        $obj_list = $builder->get();
        return $obj_list;
    }


    /**
     * 获取单位参考数组
     * @return mixed
     * @author  sam.shan  <sam.shan@ruis-ims.cn>
     * @todo   基础常量表尽量别连表操作
     */
    public  function  getReferUnitList()
    {
        $obj_list = DB::table($this->table)->pluck('unit_text','id');
        return obj2array($obj_list);

    }

}