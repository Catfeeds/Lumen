<?php
/**
 * Created by PhpStorm.
 * User: lester
 * Date: 2018/9/14 9:03
 * Desc:
 */

namespace App\Http\Models\Sap;


use App\Http\Models\Base;
use Illuminate\Support\Facades\DB;

class StandardValue extends Base
{
    protected $apiPrimaryKey = 'standard_value_id';

    public function __construct()
    {
        !$this->table && $this->table = config('alias.ssv');
    }


//region 检

//endregion


//region 增
//endregion

//region 删
//endregion

//region 改
//endregion

//region 查

    /**
     * @param array $standardValue
     * @return array|mixed
     */
    public function getParamItem($standardValue)
    {
        if (empty($standardValue)) {
            return [];
        }
        $obj_list = DB::table(config('alias.spi').' as spi')
            ->leftJoin(config('alias.ssvpi').' as ssvpi','ssvpi.param_item_id','=','spi.id')
            ->leftJoin($this->table.' as ssv','ssv.id','=','ssvpi.standard_value_id')
            ->select([
                'spi.code',
                'spi.unit',
                'ssvpi.index'
            ])
            ->where([
                ['ssv.code','=',$standardValue]
            ])
            ->orderBy('ssvpi.index','ASC')
            ->get();
        return obj2array($obj_list);
    }
//endregion

}