<?php
/**
 * Created by PhpStorm.
 * User: xujian
 * Date: 17/10/21
 * Time: 下午16:29
 */

namespace App\Http\Models;//定义命名空间
use Illuminate\Support\Facades\DB;//引入DB操作类

/**
 * 图纸库
 * @author  xujian
 * @reviser sam.shan   <sam.shan@ruis-ims.cn>
 * @time    2017年10月21日 16:29
 */
class Drawing extends Base
{
    /**
     * drawing type
     * @var string
     */
    private  $dtTable;
    /**
     * drawing group
     * @var string
     */
    private  $dgTable;

    /**
     * user
     * @var string
     */
    private  $uTable;
    /**
     * 关联图表
     * @var
     */
    private  $dcTable;



    public function __construct()
    {
        $this->table = 'drawing';
        $this->dtTable = 'drawing_type';
        $this->dgTable = 'drawing_group';
        $this->uTable = 'user';
        $this->dcTable='drawing_combination';
        //定义表别名
        $this->aliasTable = [
            'd' => $this->table . ' as d',
            'dt' => $this->dtTable . ' as dt',
            'dg' => $this->dgTable . ' as dg',
            'u' => $this->uTable . ' as u',
            'dc'=>$this->dcTable .' as dc',
        ];
    }

    /**
     * 获取物料列表
     * @param $input array  input数组
     * @return array
     * @author xujian
     */
    public function getDrawingList(&$input)
    {
        $where = [];
        !empty($input['code']) && $where[] = ['d.code', 'like', '%' . $input['code'] . '%'];
        !empty($input['name']) && $where[] = ['d.name', 'like', '%' . $input['name'] . '%'];
        !empty($input['drawing_type_id']) && $where[] = ['dt.id', '=', $input['drawing_type_id']];
        !empty($input['drawing_group_id']) && $where[] = ['d.group_id', '=', $input['drawing_group_id']];

        $builder = DB::table($this->aliasTable['d'])
            ->select('d.id as drawing_id',
                     'd.name as drawing_name',
                     'd.code',
                     'd.length',
                     'd.width',
                     'd.height',
                     'd.image_name',
                     'd.image_path',
                    'dg.name as drawing_group_name')
            ->leftJoin($this->aliasTable['dg'], 'dg.id', '=', 'd.group_id')
            ->leftJoin($this->aliasTable['dt'], 'dt.id', '=', 'dg.type_id')
            ->offset(($input['page_no']-1)*$input['page_size'])
            ->limit($input['page_size']);

        if (!empty($where)) $builder->where($where);
        //order  (多order的情形,需要多次调用orderBy方法即可)
        if (!empty($input['order']) && !empty($input['sort'])) $builder->orderBy('d.' . $input['sort'], $input['order']);
        //get获取接口
        $obj_list = $builder->get();
        //总共有多少条记录
         $count_builder= DB::table($this->aliasTable['d'])
            ->leftJoin($this->aliasTable['dg'], 'dg.id', '=', 'd.group_id')
            ->leftJoin($this->aliasTable['dt'], 'dt.id', '=', 'dg.type_id');
         if (!empty($where)) $count_builder->where($where);
        $input['total_records']=$count_builder->count();
        return $obj_list;
    }

    /**
     * 图纸详情
     * @param $drawing_id  图纸主键
     * @return array   返回数组
     * @author sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function getMultiDetail($drawing_id)
    {
        //获取操作模型
        $operationAttributeValue=new OperationAttributeValue();
        $attachment=new Attachment();
        //获取各个tab数据
        $base=$this->getBaseInfo($drawing_id);
        $attribute=$operationAttributeValue->getOperationAttributeValueList($base->drawing_id,$this->table);
        $attachment=$attachment->getAttachmentList($base->drawing_id,$this->table);
        $combination=$this->getCombinationList($base->drawing_id);

        return ['base'=>$base,'attribute'=>$attribute,'attachment'=>$attachment,'combination'=>$combination];
    }

    /**
     * @param $drawing_id
     * @return mixed
     * @throws \App\Exceptions\ApiException
     */
    public function getBaseInfo($drawing_id)
    {
        $obj = $this->getRecordById($drawing_id,[
            'id as drawing_id',
            'code','name','length','length2',
            'width','width2','height','height2',
            'is_model','model_time','is_combined','group_id as drawing_group_id',
            'description','image_name','image_path'
         ]);
        if (!$obj) TEA('404');
        return $obj;
    }

    /**
     * @param $drawing_id
     * @return mixed
     * @author  sam.shan  <sam.shan@ruis-ims.cn>
     */
    public function getCombinationList($drawing_id)
    {
        $obj_list=DB::table($this->table)
            ->select('id as drawing_id',
                'name as drawing_name',
                'length',
                'length2',
                'width',
                'width2',
                'height',
                'height2',
                'image_name',
                'image_path',
                'code'
            )->whereIn('id',function($query) use ($drawing_id){
                   $query->from($this->dcTable)->where('parent_drawing_id',$drawing_id)->select('child_drawing_id')->get();
               })->get();
        return $obj_list;

    }



}