<?php
/**
 * Created by PhpStorm.
 * User: xujian
 * Date: 17/10/25
 * Time: 下午14:20
 */

namespace App\Http\Models;//定义命名空间
use Illuminate\Support\Facades\DB;//引入DB操作类

/**
 * 附件公共表数据操作
 * @author  sam.shan  <sam.shan@ruis-ims.cn>
 * @time    2017年10月25日 14:20
 */
class Attachment extends Base
{


    public function __construct()
    {
        parent::__construct();
        $this->table=config('alias.attachment');
    }

    /**
     * 获取附件列表
     * @param $owner_id    类型表主键值
     * @param $owner_type  类型,如drawing
     * @author   sam.shan <sam.shan@ruis-ims.cn>
     */
    public function  getAttachmentList($owner_id,$owner_type)
    {
        $obj_list=DB::table($this->table)->select('id as attachment_id','filename','path','comment')
            ->where('owner_id',$owner_id)
            ->where('owner_type',$owner_type)
            ->get();
        return $obj_list;
    }



    /**
     * 入库操作,添加上传的附件
     * @param $input array  input数组
     * @return int         返回插入表之后返回的主键值
     * @author     sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function add($input)
    {

        //$input['attachment']-> getClientOriginalName()
        //获取文件名以及后缀
        //$file_path_arr=explode('/',$input['path']);
        //$file_name=end($file_path_arr); //获得数组中最后的值
        //$file_name_arr=explode('.',$file_name);
        //$name=isset($file_name_arr['0'])?$file_name_arr['0']:'';
        //$extension=isset($file_name_arr['1'])?$file_name_arr['1']:'';


        $file=$input['attachment'];
        $file_name=$file->getClientOriginalName();
        $extension=$file -> getClientOriginalExtension();
        $size=$file->getClientSize();
        $name=current(explode('.',$file_name));


        //获取入库数组,此处一定要严谨一些,否则前端传递额外字段将导致报错,甚至攻击
        $data=[
            'name'=>$name,
            'filename'=>$file_name,
            'path'=>$input['path'],
            'extension'=>$extension,
            'comment'=>'pretreatment',
            'ctime'=>time(),
            'mtime'=>time(),
            'owner_type'=>$input['flag'],
            'size'=>$size,
            'creator_id'=>!empty(session('administrator')->admin_id)?session('administrator')->admin_id:0,
            //'owner_id'=>'',
        ];
        //入库
        $insert_id=DB::table($this->table)->insertGetId($data);
        if(!$insert_id) TEA('802');
        return  $insert_id;
    }


    /**
     * 删除上传的附件
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