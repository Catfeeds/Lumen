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
 * 模板绑定工序操作类
 * @author  xujian
 * @time    2017年09月28日 17:28
 */
class TemplateOperation extends Base
{

    public function __construct()
    {
        $this->table='template_operation';
    }

    /**
     * 查看模板与工序关联信息
     * @param array  input数组
     * @return array
     * @author  xujian
     */
    public function get($input)
    {
        $whereStr = "";
        $data = array();
        if (isset($input['template_id']) && $input['template_id']) {
            $whereStr .= 'template_id = ? ';
            $data[] = $input['template_id'];
        }
        if (isset($input['operation_id']) && $input['operation_id']) {
            if ($whereStr != '')
                $whereStr .= 'and ';
            $whereStr .= 'operation_id = ? ';
            $data[] = $input['operation_id'];
        }
        $obj_list = DB::table($this->table)
            ->whereRaw($whereStr,$data)
            ->select('id','operation_id','template_id')->get();
        return $obj_list;
    }

    /**
     * 添加模板与operation绑定
     * @param $input array  input数组
     * @return int  返回插入表之后返回的主键值
     * @author     xujian
     */
    public function  add($input)
    {
        //是否存在operation，不存在的返回错误
        $operation = new Operation();
        $has=$operation->isExisted([['id','=',$input['operation_id']]]);
        if (!$has) TEA('5003','operation_id:' . $input['operation_id']);

        $template = new Template();
        $has=$template->isExisted([['id','=',$input['template_id']]]);
        if (!$has) TEA('5006','template_id:' . $input['template_id']);

        //是否有绑定，若有绑定返回绑定信息
        $has=$this->isExisted([['template_id','=',$input['template_id']],['operation_id','=',$input['operation_id']]]);
        if($has) TEA('5002','operation_id:' . $input['operation_id']);

        $data=[
            'template_id' => $input['template_id'],
            'operation_id' => $input['operation_id'],
        ];
        //入库
        $insert_id=DB::table($this->table)->insertGetId($data);
        if(!$insert_id) TEA('802');
        return  $insert_id;
    }

    /**
     * 删除template与operation的关联
     * @param $id
     * @throws \Exception
     * @author  xujian
     * @todo 涉及到多个表格的操作，应该使用事务进行处理
     */
    public function destroy($id)
    {
        $has=$this->isExisted([['id','=',$id]]);
        if (!$has) TEA('5003','template_operation:id' .$id);

        //判断是否已经使用【此处目前省略】

        //删除与template关联的attribute
        $num=$this->destroyById($id);
        if($num===false) TEA('803');
        if(empty($num))  TEA('404');
    }
}