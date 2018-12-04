<?php
/**
 * Created by PhpStorm.
 * User: sansheng
 * Date: 18/1/4
 * Time: 上午11:23
 */

namespace App\Libraries;

use App\Http\Models\Trace\Trace as DBTrace;

/**
 * 公共操作日志处理类
 * @author  sam.shan <sam.shan@ruis-ims.cn>
 * @time    2018年01月04日11:25:29
 */
class Trace
{

    /**
     * 保存操作日志
     * @param string $owner_type 关联标志,请使用关联主表的表名,如 ruis_bom
     * @param int $owner_id 关联主表的主键值
     * @param int $operation_id 操作人员id
     * @param array $events 这里的是操作行为的详细改动,当只有一个事件行为的时候传递一维数组即可,当多条的时候传递二维数组
     * @throws \Exception
     *
     * 传递一维数组的形式:
     *  $events=[
     *     'field'=>'status',  //字段名称,无对应字段则可以为空或者不填该key     N
     *     'comment'=>'订单状态',//字段名称的注释,可以为空或者不填该key         N
     *     'from'=>0,          //字段原来的值,可以为空或者不填该key           N
     *     'to'=>1,            //字段新的值,可以为空或者不填该key             N
     *     'action'=>'update', //必填字段,值为add|delete|update            Y
     *     'desc'=>'把订单状态从未支付改为了已支付',//对当前事件行为的描述         Y
     *     'extra'=>[],  //对该事件行为的额外附加信息,通过数组形式保存在这里       N
     * ];
     * 传递二维数组的形式:
     *  $events=[
     *               [
     *                   'field'=>'status',
     *                   'comment'=>'订单状态',
     *                   'from'=>0,
     *                   'to'=>1,
     *                   'action'=>'update',
     *                   'desc'=>'把订单状态从未支付改为了已支付',
     *                   'extra'=>[],
     *               ],
     *               [
     *                 'field'=>'description',
     *                 'comment'=>'订单描述',
     *                 'from'=>'sam',
     *                 'to'=>'rick',
     *                 'action'=>'update',
     *                 'desc'=>'把订单描述从sam改为了rick'
     *               ],
     *          ]
     *
     * 增加时候的example:
     * Trace::save($this->table,$insert_id,$input['creator_id'],['action'=>'add','desc'=>'添加物料清单基础信息']);
     *
     * 编辑时候的example:
     *
     * $events=[
     *      'field'=>'comment',
     *      'comment'=>'附件备注',
     *      'from'=>???,
     *      'to'=> ??? ,
     *      'action'=>'update',
     *      'extra'=>$attachment,
     *      'desc'=>'将附件xxx的备注,从 ??? 改为 ??? ',
     * ];
     * Trace::save(config('alias.rb'),$bom_id,$creator_id,$events);
     *
     *
     *
     * 删除时候的example:
     *
     * Trace::save(config('alias.rb'),$bom_id,$creator_id,['field'=>'attachment_id','action'=>'delete','extra'=>$attachment,'desc'=>'删除附件xxx']);
     */
    static public function save($owner_type, $owner_id, $operation_id, $events)
    {

        //判断event
        if (!isset($events['0'])) $events = [$events];
        //events规则检测
        foreach ($events as $key => &$event) {
            if (!isset($event['field'])) $event['field'] = '';
            if (!isset($event['comment'])) $event['comment'] = '';
            if (!isset($event['from'])) $event['from'] = '';
            if (!isset($event['to'])) $event['to'] = '';
            if (empty($event['action']) || !in_array($event['action'], ['update', 'add', 'delete'])) TE('Invalid operation log parameters(action)');
            if (empty($event['desc'])) TE('The operation log parameters(desc) cannot be empty');
            if (!isset($event['extra'])) $event['extra'] = '';
        }
        //获取入库数组
        $data = [
            'owner_type' => $owner_type,
            'owner_id' => $owner_id,
            'operation_id' => $operation_id,
            'events' => json_encode($events),
            'ctime' => time(),
        ];
        //入库
        $m = new DBTrace();
        $m->add($data);
    }


}