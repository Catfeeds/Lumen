<?php
/**
 * @message  单位
 * @author  liming
 * @time    年 月 日
 */    
    
namespace App\Http\Models;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

class Units extends Base{

    public $apiPrimaryKey = 'id';

    public function __construct()
    {
        parent::__construct();
        if(!$this->table) $this->table = config('alias.ruu');
    }

    /**
     * @param $input
     * @author ming.li
     */
    public function checkFormField(&$input)
    {
        $add = $this->judgeApiOperationMode($input);
        if(empty($input['name'])) TEA('700','name');
        $check = $add ? [['name','=',$input['name']]] : [[$this->primaryKey,'<>',$input[$this->apiPrimaryKey]],['name','=',$input['name']]];
        $has = $this->isExisted($check);
        if($has) TEA('700','name');

        if($add){
            if(empty($input['iso_code'])) TEA('700','iso_code');
            $check = $add ? [['iso_code','=',$input['iso_code']]] : [[$this->primaryKey,'<>',$input[$this->apiPrimaryKey]],['iso_code','=',$input['iso_code']]];
            $has = $this->isExisted($check);
            if($has) TEA('700','iso_code');
        }

        if(!isset($input['unit_text'])) TEA('700','unit_text');
        if(!isset($input['commercial'])) TEA('700','commercial');
        if(!isset($input['technical'])) TEA('700','technical');
        if(!isset($input['label'])) TEA('700','label');
    }

    /**
     * @param $input
     * @author ming.li
     */
    public function add($input){
        $data = [
            'dimension_id'=>isset($input['dimension_id'])?$input['dimension_id']:'',
            'name'=>isset($input['name'])?$input['name']:'',
            'deletable'=>isset($input['deletable'])?$input['deletable']:'',
            'is_base'=>isset($input['is_base'])?$input['is_base']:'',
            'unit_text'=>isset($input['unit_text'])?$input['unit_text']:'',
            'iso_code'=>isset($input['iso_code'])?$input['iso_code']:'',
            'commercial'=>isset($input['commercial'])?$input['commercial']:'',
            'technical'=>isset($input['technical'])?$input['technical']:'',
            'decimal_places'=>isset($input['decimal_places'])?$input['decimal_places']:'',
            'c2b_numerator'=>isset($input['c2b_numerator'])?$input['c2b_numerator']:'',
            'c2b_denominator'=>isset($input['c2b_denominator'])?$input['c2b_denominator']:'',
            'c2b_exponent'=>isset($input['c2b_exponent'])?$input['c2b_exponent']:'',
            'c2b_additive_constant'=>isset($input['c2b_additive_constant'])?$input['c2b_additive_constant']:'',
            'c2b_decimal_rounding'=>isset($input['c2b_decimal_rounding'])?$input['c2b_decimal_rounding']:'',
            'c2b_final_factor'=>isset($input['c2b_final_factor'])?$input['c2b_final_factor']:'',
            'handle'=>isset($input['handle'])?$input['handle']:'',
            'description'=>isset($input['description'])?$input['description']:'',
            'label'=>isset($input['label'])?$input['label']:'',
        ];
        $insert_id = DB::table($this->table)->insertGetId($data);
        if(!$insert_id) TEA('802');
        return $insert_id;
    }


    /**
     * @param $input
     * @author ming.li
     */
    public function getUnitListByPage(&$input)
    {
        $where = $this->_search($input);
        $builer = DB::table($this->table.' as ruu')->select('*')->where($where);
        $input['total_records'] = $builer->count();
        $builer->offset(($input['page_no'] - 1) * $input['page_size'])->limit($input['page_size']);
        if(!empty($input['sort']) && !empty($input['order'])) $builer->orderBy('rcp.'.$input['sort'],$input['order']);
        $obj_list = $builer->get();
        return $obj_list;
    }

    /**
     * @param $input
     * @author ming.li
     */
    public function select(&$input)
    {
        $where = $this->_search($input);
        $obj_list = DB::table($this->table.' as ruu')->select('*')->where($where)->get();
        return $obj_list;
    }


    /**
     * @param $id
     * @author ming.li
     */
    public function get($id){
        $obj = DB::table($this->table.' as rcp')->select('*')->where('rcp.'.$this->primaryKey,$id)->first();
        if(!$obj) TEA('404');
        return $obj;
    }

    /**
     * 修改单位
     * @param $input
     * @author ming.li
     */
    public function update($input){
        $data = [
            'name'=>$input['name'],
            'unit_text'=>$input['unit_text'],
            'iso_code'=>$input['iso_code'],
            'commercial'=>$input['commercial'],
            'technical'=>$input['technical'],
            'description'=>$input['description'],
            'label'=>$input['label'],
        ];
        $res = DB::table($this->table)->where($this->primaryKey,$input[$this->apiPrimaryKey])->update($data);
        if($res === false) TEA('804');
    }
    
    /**
     * 删除单位
     * @param $id
     * @author ming.li
     */
    public function delete($id){
        $res = DB::table($this->table)->where($this->primaryKey,$id)->delete();
        if(!$res) TEA('803');
    }


    /**
     * @param int $curren_unit_id
     * @param int $want_to_id
     * @param float $value
     * @param int $material_id
     * @return float|int -1表示失败
     */
    public function getExchangeUnitValueById($curren_unit_id,$want_to_id,$value,$material_id = 0){
        if($curren_unit_id == $want_to_id) return floor($value * 1000) / 1000 ;
        $current_cache_key = make_redis_key(['unit_info',$curren_unit_id]);
        $curren_cache_unit = Cache::get($current_cache_key);
        if(!empty($curren_cache_unit)){
            $curren_unit = unserialize($curren_cache_unit);
        }else{
            $curren_unit = DB::table(config('alias.ruu'))->where('id',$curren_unit_id)->first();
            if(!empty($curren_unit)) Cache::forever($current_cache_key,serialize($curren_unit));
        }
        $want_cache_key = make_redis_key(['unit_info',$want_to_id]);
        $want_cache_unit = Cache::get($want_cache_key);
        if(!empty($want_cache_unit)){
            $want_unit = unserialize($want_cache_unit);
        }else{
            $want_unit = DB::table(config('alias.ruu'))->where('id',$want_to_id)->first();
            if(!empty($want_unit)) Cache::forever($want_cache_key,serialize($want_unit));
        }
        if(empty($curren_unit) || empty($want_unit)) return -1;
        if($curren_unit->identify == $want_unit->identify){
            $res = floor($value * (($curren_unit->element / $curren_unit->denominator) * pow(10,$curren_unit->power)) / (($want_unit->element / $want_unit->denominator) * pow(10,$want_unit->power)) * 1000) / 1000;
        }else{
            if(empty($material_id)) return -1;
            $db_curren_unit = DB::table(config('alias.ramm'))
                ->where([['material_id','=',$material_id],['MEINH','=',$curren_unit->commercial]])
                ->first();
            $db_want_unit = DB::table(config('alias.ramm'))
                ->where([['material_id','=',$material_id],['MEINH','=',$want_unit->commercial]])
                ->first();
            if(empty($db_curren_unit) || empty($db_want_unit)) return -1;
            $res = floor($value * ($db_curren_unit->UMREZ / $db_curren_unit->UMREN) / ($db_want_unit->UMREZ / $db_want_unit->UMREN) * 1000) / 1000;
        }
        return $res;
    }



    /**
     * @message 搜索
     * @author  liming
     * @time    年 月 日
     */    
    private function _search($input)
    {
        $where = array();
        if (isset($input['unit_text']) && $input['unit_text']) {//unit_text
            $where[]=['unit_text','like','%'.$input['unit_text'].'%'];
        }
        if (isset($input['commercial']) && $input['commercial']) {//commercial
            $where[]=['commercial','like','%'.$input['commercial'].'%'];
        }
        return $where;
    }

}