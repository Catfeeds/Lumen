<?php
/**
 * Created by PhpStorm.
 * User: yjd
 * Date: 2017/12/5
 * Time: 上午9:56
 */
namespace App\Http\Models\Encoding;
use Illuminate\Support\Facades\DB;//引入DB操作类
use App\Http\Models\Base;

class EncodingSetting extends Base
{
    /**
     * 编码设置表
     * @var string
     */
    protected $table;
    protected $eTable;
    protected $rTable;

    public function __construct()
    {
        parent::__construct();
        $this->table = config('alias.res');
        $this->eTable = config('alias.rel');
        $this->rTable = config('alias.rer');
        $this->aliasTable = [
            'res'=>$this->table.' as res',
            'rel'=>$this->eTable.' as rel',
        ];
    }

    /**
     *
     * @param $input
     */
    public function checkFormFields($input)
    {
        if(empty($input['type'])) TEA('700','type');
        if(!isset($input['automatic_number'])) TEA('700','automatic_number');
        if(!isset($input['serial_number_length'])) TEA('700','serial_number_length');
        if(!isset($input['serial_number_start'])) TEA('700','serial_number_start');
        if(!isset($input['serial_number_step'])) TEA('700','serial_number_step');


        if(!in_array($input['automatic_number'],[0,1,2]))
        {
            TEA(103,'automatic_number');
        }
        if($input['automatic_number'] == 1 || $input['automatic_number'] == 2)
        {
            if($input['serial_number_length'] <= 0)
            {
                TEA(100,'serial_number_length');
            }
            if($input['serial_number_start'] < 0)
            {
                TEA(101,'serial_number_start');
            }
            if($input['serial_number_step'] <= 0)
            {
                TEA(102,'serial_number_step');
            }
        }
    }

    /**
     * 保存编码设置
     * @param $input
     * @return mixed
     */
    public function save($input)
    {
        $rule = [
            'prefix1'=>isset($input['prefix1'])?$input['prefix1']:'',
            'prefix1_length'=>isset($input['prefix1_length'])?$input['prefix1_length']:0,
            'prefix1_rule'=>isset($input['prefix1_rule'])?$input['prefix1_rule']:'',
            'prefix2'=>isset($input['prefix2'])?$input['prefix2']:'',
            'prefix2_length'=>isset($input['prefix2_length'])?$input['prefix2_length']:0,
            'prefix2_rule'=>isset($input['prefix2_rule'])?$input['prefix2_rule']:'',
            'prefix3'=>isset($input['prefix3'])?$input['prefix3']:'',
            'prefix3_length'=>isset($input['prefix3_length'])?$input['prefix3_length']:0,
            'prefix3_rule'=>isset($input['prefix3_rule'])?$input['prefix3_rule']:'',
            'prefix1_symbol'=>isset($input['prefix1_symbol'])?$input['prefix1_symbol']:1,
            'prefix2_symbol'=>isset($input['prefix2_symbol'])?$input['prefix2_symbol']:1,
            'prefix3_symbol'=>isset($input['prefix3_symbol'])?$input['prefix3_symbol']:1,
            'automatic_number'=>$input['automatic_number'],
            'serial_number_length'=>$input['serial_number_length'],
            'serial_number_start'=>$input['serial_number_start'],
            'serial_number_step'=>$input['serial_number_step'],
            'single_prefix'=>isset($input['single_prefix'])?$input['single_prefix']:0,
        ];
        //入库
        $has = $this->isExisted([['type','=',$input['type']]]);
        if($has){
            $res = DB::table($this->table)->where('type',$input['type'])->update(['rule'=>json_encode($rule)]);
        }else{
            $res = DB::table($this->table)->insertGetId(['type'=>$input['type'],'rule'=>json_encode($rule)]);
        }
        if($res === false) TEA('804');
        //修改规则相应的流水表记录和记录表会因为使用方法找不到而不做任何操作导致问题，按理说相应表的记录都需要改为符合现有规则的记录
        //这边先暂时删除流水表相同类型编码规则的记录
        $res = DB::table($this->rTable)->where('type',$input['type'])->delete();
    }

    /**
     * 获取编码设置
     * @return mixed
     */
    public function show($type)
    {
        $where = [];
        if(!empty($type)) $where[] = ['type','=',$type];
        $result = DB::table($this->table)->where($where)->first();
        if(empty($result)) TEA(104);
        return $result;
    }

    /**
     * 根据编码设置产生编码
     *
     * @param $input
     * @return array
     * @throws \App\Exceptions\ApiException
     */
    public function get($input)
    {
        $result = [];
        $result['code'] = '';
        $setting = $this->show($input['type']);
        $rule = json_decode($setting->rule,true);
        $result['automatic_number'] = $rule['automatic_number'];
        $result['encoding_setting_id'] = $setting->id;
        $result['serial_number_length'] = $rule['serial_number_length'];
        //完全手工编号
        if($rule['automatic_number'] == 0){
            return $result;
        }
        $prefix_code = '';
        $prefix_code .= $this->getCodeByPrefix($rule['prefix1'],$rule['prefix1_length'],$rule['prefix1_rule'],$input['type_code'],$rule['prefix1_symbol']);
        $prefix_code .= $this->getCodeByPrefix($rule['prefix2'],$rule['prefix2_length'],$rule['prefix2_rule'],$input['type_code'],$rule['prefix2_symbol']);
        $prefix_code .= $this->getCodeByPrefix($rule['prefix3'],$rule['prefix3_length'],$rule['prefix3_rule'],$input['type_code'],$rule['prefix3_symbol']);
        //先去流水号回收表找有没有这个类型编码规则下相同前缀的编流水号
        $recycle = DB::table($this->rTable)->where([['type','=',$input['type']],['prefix_code','=',$prefix_code]])->orderBy('serial_number','asc')->first();
        if(empty($recycle)){
            //获取到最后一条生成的编码记录
            $encoding = DB::table($this->eTable)->where([['type','=',$input['type']],['prefix_code','=',$prefix_code]])->orderBy('serial_number','desc')->first();
            if(!empty($encoding))
            {
                //之前根据设置产生过编码
                $serial_number = $encoding->serial_number+$rule['serial_number_step'];
            }
            else
            {
                $serial_number = $rule['serial_number_start'];
            }
            //判断是否超出设置的流水号长度
            if(mb_strlen($serial_number) > $rule['serial_number_length']) TEA('121');
            $serial_code = str_pad($serial_number, $rule['serial_number_length'], '0', STR_PAD_LEFT);
            $code = $prefix_code.$serial_code;
            //因为有手工编码所以要判断是否已经在使用的表中添加
            $code = $this->addUsedEncodingReturnNewCode($rule,$input['type'],$prefix_code,$code,$serial_code,$serial_number);
        }else{
            $serial_number = $recycle->serial_number;
            if(mb_strlen($serial_number) > $rule['serial_number_length']) TEA('121');
            $serial_code = str_pad($serial_number, $rule['serial_number_length'], '0', STR_PAD_LEFT);
            $code = $prefix_code.$serial_code;
        }
        $result['prefix_code'] = $prefix_code;
        $result['code'] = $code;
        return $result;
    }

    /**
     * 使用编码
     * @param $setting_id
     * @param $encoding
     */
    public function useEncoding($type,$encoding){
        $setting = $this->show(['type'=>$type]);
        $rule = json_decode($setting->rule,true);
        $isUsedEncoding = DB::table($this->eTable)->where([['type','=',$type],['code','=',$encoding]])->first();
        if($isUsedEncoding){
            //讲道理应该返回新的编码，但是考虑到不知道怎么交互，还是先提醒吧(最后想想还是返回吧，都一样),最后返回新的编码
            $lastEncoding = DB::table($this->eTable)->where([['type','=',$type],['prefix_code','=',$isUsedEncoding->prefix_code]])->orderBy('serial_number','desc')->first();
            $serial_number = $lastEncoding->serial_number+$rule['serial_number_step'];
            if(mb_strlen($serial_number) > $rule['serial_number_length']) TEA('121');
            $serial_code = str_pad($serial_number, $rule['serial_number_length'], '0', STR_PAD_LEFT);
            $encoding = $lastEncoding->prefix_code.$serial_code;
            $prefix_code = $lastEncoding->prefix_code;
            $encoding = $this->addUsedEncodingReturnNewCode($rule,$type,$prefix_code,$encoding,$serial_code,$serial_number);
        }else{
            $recycleEncoding = DB::table($this->rTable)->where([['type','=',$type],['code','=',$encoding]])->first();
            if($recycleEncoding){
                DB::table($this->rTable)->where('id',$recycleEncoding->id)->delete();
                $serial_code = $recycleEncoding->serial_code;
                $serial_number = $recycleEncoding->serial_number;
                $prefix_code = $recycleEncoding->prefix_code;
            }else{
                return $encoding;
            }
        }
        $data = [
            'type'=>$type,
            'prefix_code'=>$prefix_code,
            'serial_code'=>$serial_code,
            'serial_number'=>$serial_number,
            'code'=>$encoding,
        ];
        DB::table($this->eTable)->insert($data);
        return $encoding;
    }

    /**
     * 添加已经使用的编码，返回新的编码
     * @param $type
     * @param $code
     * @return string
     * @throws \App\Exceptions\ApiException
     */
    public function addUsedEncodingReturnNewCode($rule,$type,$prefix_code,$code,$serial_code='',$serial_number=0){
//        if($type == 1){
//            $field = 'item_no';
//            $table = config('alias.rm');
//        }else if($type == 2){
//            $field = 'code';
//            $table = config('alias.template');
//        }else if($type == 3){
//            $field = 'key';
//            $table = config('alias.ad');
//        }else if($type == 4){
//            $field = 'code';
//            $table = config('alias.rio');
//        }else if($type == 5){
//            $field = 'code';
//            $table = config('alias.ria');
//        }else if($type == 6){
//            $field = 'code';
//            $table = config('alias.rdr');
//        }else if($type == 7){
//            $field = 'code';
//            $table = config('alias.rso');
//        }else if($type == 8){
//            $field = 'code';
//            $table = config('alias.rp');//做法
//        }else if($type == 10){
//            $field = 'code'
//        }
        $field = config('app.encoding.'.$type.'.field');
        $table = config('alias.'.config('app.encoding.'.$type.'.table'));
        while(1){
            $has = $this->isExisted([[$field,'=',$code]],$table);
            if($has){
                $data = [
                    'type'=>$type,
                    'prefix_code'=>$prefix_code,
                    'serial_code'=>$serial_code,
                    'serial_number'=>$serial_number,
                    'code'=>$code,
                ];
                DB::table($this->eTable)->insert($data);
                $serial_number = $serial_number+$rule['serial_number_step'];
                //判断是否超出设置的流水号长度
                if(mb_strlen($serial_number) > $rule['serial_number_length']) TEA('121');
                $serial_code = str_pad($serial_number, $rule['serial_number_length'], '0', STR_PAD_LEFT);
                $code = $prefix_code.$serial_code;
            }else{
                break;
            }
        }
        $data = [
            'type'=>$type,
            'prefix_code'=>$prefix_code,
            'serial_code'=>$serial_code,
            'serial_number'=>$serial_number,
            'code'=>$code,
            'time'=>time(),
        ];
        DB::table($this->rTable)->insert($data);
        return $code;
    }

    private function getCodeByPrefix($prefix, $length, $rule = '', $type_code = '', $prefix_symbol = 1)
    {
        /**
         * 前缀
         * 3===>录入日期
         * 2===>操作员
         * 1===>物料分类编码
         */
        $code = '';
        if(empty($prefix))
        {
            return $code;
        }

        switch ($prefix)
        {
            case 1:
                //物料分类编码
//                $category = $this->getRecordById($material_category_id,['code','forefathers'],config('alias.rmc'));
//                if(!$category) TEA('700','material_category_id');
//                $forefathers = explode(',',$category->forefathers);
//                foreach ($forefathers as $k=>$v){
//                    if(!empty($v)){
//                        $item = $this->getRecordById($v,'code',config('alias.rmc'));
//                        if($item){
//                            $code .= $item->code;
//                        }
//                    }
//                }
//                $code .= $category->code;
                if(strlen($type_code)-$length >= 0)
                {
                    $code .= substr($type_code,0,$length);
                }else{
                    $code .= $type_code;
                }
                break;
            case 3:
                //录入日期
                if($rule == '年')
                {
                    if(strlen(date('Y'))-$length >= 0)
                    {
                        $code .= substr(date('Y'),strlen(date('Y'))-$length,$length);
                    }
                    else
                    {
                        $code .= str_pad(date('Y'), $length, '0', STR_PAD_LEFT);
                    }
                }
                elseif($rule == '年/月')
                {
                    if(strlen(date('Ym'))-$length >= 0)
                    {
                        $code .= substr(date('Ym'),strlen(date('Ym'))-$length,$length);
                    }
                    else
                    {
                        $code .= str_pad(date('Ym'), $length, '0', STR_PAD_LEFT);
                    }

                }
                elseif($rule == '年/月/日')
                {
                    if(strlen(date('Ymd'))-$length >= 0)
                    {
                        $code .= substr(date('Ymd'),strlen(date('Ymd'))-$length,$length);
                    }
                    else
                    {
                        $code .= str_pad(date('Ymd'), $length, '0', STR_PAD_LEFT);
                    }

                }
                break;
            case 2:
                //操作员
                $create_id = (!empty(session('administrator')->admin_id)) ? session('administrator')->admin_id : 0;
                if(strlen($create_id)-$length >= 0)
                {
                    $code .= substr($create_id,strlen($create_id)-$length,$length);
                }
                else
                {
                    $code .= str_pad($create_id, $length, '0', STR_PAD_LEFT);
                }
                break;

        }

        //前缀后面带的分隔符  1=中划线 2=下划线
        if($prefix_symbol == 2)
        {
            $code .= '_';
        }
        else if($prefix_symbol == 1)
        {
            $code .= '-';
        }else{
            $code .= '';
        }
        return $code;
    }
}