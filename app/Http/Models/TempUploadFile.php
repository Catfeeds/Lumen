<?php

namespace App\Http\Models;
use Illuminate\Support\Facades\DB;//引入DB操作类


/**
 * 上传文件临时表操作模型类
 * @author  sam.shan  <sam.shan@ruis-ims.cn>
 * @time    2017年11月22日08:46:14
 */
class TempUploadFile extends  Base
{
    public function __construct()
    {
        $this->table='ruis_temp_upload_file';
    }



    /**
     * 入库操作,添加上传临时文件路径
     * @param $input array  input数组
     * @return int         返回插入表之后返回的主键值
     * @author     sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function add($input)
    {

        //获取入库数组,此处一定要严谨一些,否则前端传递额外字段将导致报错,甚至攻击
        $data=[
            'path'=>$input['path'],
            'type'=>$input['type'],
            'flag'=>$input['flag'],
            'created_at'=>time(),
            'created_date_at'=>date('Y-m-d H:i:s',time()),
            'updated_at'=>time(),
        ];
        //入库
        $insert_id=DB::table($this->table)->insertGetId($data);
        if(!$insert_id) TEA('802');
        return  $insert_id;
    }


    /**
     * 物理删除临时表
     * @param $id
     * @throws \Exception
     * @author   sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function destroy($id)
    {
        $num=$this->destroyById($id);
        if($num===false) TEA('803');
        if(empty($num))  TEA('404');
    }











}