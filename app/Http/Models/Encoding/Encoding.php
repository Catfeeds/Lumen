<?php
/**
 * Created by PhpStorm.
 * User: Xiaoliang.Chen
 * Date: 2017/11/29
 * Time: 10:40
 */

namespace App\Http\Models\Encoding;
use Illuminate\Support\Facades\DB;//引入DB操作类
use App\Http\Models\Base;

class Encoding extends  base
{
    protected $module_prefix_table  ;
    protected $prefix_table;

    public function __construct()
    {
        $this->table = 'ruis_encoding_module';
        $this->module_prefix_table = 'ruis_encoding_module_prefix';
        $this->prefix_table = 'ruis_encoding_prefix';
        $this->aliasTable=['em'  => $this->table.' as em',
                           'emp' => $this->module_prefix_table .' as emp',
                           'ep' => $this->prefix_table.' as ep'
                           ];
    }
    /*
     * 获取编码模块
     */
    public function getModuleList (){
        $obj_list = DB::table($this->table)->select('id','module_name')->where('status',1)->get();
        //获取相应的前缀规则
        foreach ($obj_list as $key =>$value){
            $value->prefix = DB::table($this->aliasTable['ep'])->leftJoin($this->aliasTable['emp'],'ep.id','=','emp.prefix_id')
                                                               ->select('ep.id','ep.prefix_name','ep.type')->where('emp.module_id',$value->id)
                                                               ->get();
        }
        return $obj_list;
    }
    /*
     *
     */
    public function update($module_id,$input){

    }

    public function getPrefix($module_id){
        return DB::table($this->aliasTable['emp'])->leftJoin($this->aliasTable['em'],'em.id','=','emp.module_id')
                                           ->leftJoin($this->aliasTable['ep'],'ep.id','=','emp.prefix_id')
                                           ->select('ep.id','ep.prefix_name')
                                           ->where('emp.module_id',$module_id)
                                           ->get();
    }
}