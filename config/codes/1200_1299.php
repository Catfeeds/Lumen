<?php


/**
 * 订单部分的错误码
 */
return [
    '1200'=>'该生产单已经拆过工艺单了,不可以重复拆',
    '1201'=>'拆分数据错误,拆单后的总量与原单总量不符合!',
    '1202'=>'该生产任务已经拆过工单了,不可以重复拆,如有变更,请通过合单变更接口',
    '1203'=>'无法获取顶级bom，发布失败',
    '1204'=>'当前产品工时信息维护不完整，发布失败',
    '1205'=>'当前产品工艺文件不存在，发布失败',
    '1206'=>'当前产品工时包不存在，发布失败',
    '1207'=>'工艺文件不存在出料，发布失败',
    '1208'=>'工单不存在！',
    '1209'=>'当前生产订单未发布，不能排产！',
    '1210'=>'该生产单下的工单已经领料或者报工，不能撤回！',
    '1211'=>'工艺文件配置有误，请先检查工艺文件！',
];