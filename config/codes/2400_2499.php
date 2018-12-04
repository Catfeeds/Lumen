<?php
/**
 * Created by PhpStorm.
 * User: ruiyanchao
 * Date: 2018/2/7
 * Time: 上午8:54
 */
return [
    //生产管理模块
    '2400' => '该订单已发布，不能删除！',
    '2401' => '该产品暂无生效bom无法添加！',
    '2402' => '由于根据BOM树自动拆单失败导致无法正常发布生产订单',
    '2403' => '由于修改订单生产订单状态失败导致无法正常发布生产订单',
    '2404' => '拆单失败',
    '2405' => '依赖订单排产时间前尚未完成排产，请先完成依赖订单排产！',
    '2406' => '工时信息为空，订单创建失败！',
    '2407' => '当前工艺路线工时未配置',
    '2408' => '请先将生产单关闭，再做删除！',

    //领料单
    '2410' => '有未完成的领/退料单，请先完成',
    '2411' => '领料单领取的物料超额',
    '2412' => '当前工单所关联的车间没有维护线边仓，请先去维护',
    '2413' => 'The work order has been locked, can not operate!',
    '2420' => '领料单添加失败',
    '2421' => '当前订单不存在',
    '2422' => '当前领料单子项不存在',
    '2423' => '当前领料单不允许修改',
    '2424' => '当前订单不允许出/入库',
    '2425' => '当前订单不允许反审',
    '2426' => '所选物料在线边库存量不足，无法生成领料单',
    '2427' => '当前工单对应的生产订单不存在',
    '2428' => '物料不存在',
    '2429' => '领料单物料数量不符合要求',
    '2430' => '退料单不允许重复创建',
    '2431' => '当前工单尚未完成领料',
    '2432' => '当前该订单不允许推送或者已推送',
    '2433' => '单位不存在或者单位无法换算',
    '2434' => '没有单位！',

    // 洗标
    '2435' => '参考单据不存在',
    '2436' => '未添加洗标数据,不能同步',

    // sap webservice
    '2450' => 'SERVER_ERROR:wsdl文件不存在',
    '2451' => 'SAP/SRM WebService返回数据异常',
    '2452' => '请求SAP WebService失败',
    '2453' => '获取WSDL文件失败',
    '2454' => 'SAP 返回状态有误',

    // sap 同步工作中心
    '2460' => '无法识别新增业务代码',
    '2461' => '当前订单不存在或者已完成',

    // sap 调用mes接口
    '2470' => 'SAP接口请求数据保存失败',
    '2471' => '工厂code有误',
    '2472' => '车间code有误',
    '2474' => '该BOM不是有效BOM',
    '2475' => 'BOM物料不存在',
    '2476' => '子项物料不存在',
    '2477' => '该BOM不存在',
    '2478' => '该工艺路线不存在',
    '2480' => '工作中心配置不完整',
    '2483' => '工作中心配置不完整,缺少标准值码',
    '2484' => '标准值码配置有误',
    '2485' => '该PO工序与工作中心配置缺失',
    '2486' => 'ROUTING节点数据缺失',
    '2487' => 'COMPONENT节点数据缺失',
    '2491' => '该PO已参与排产,不可覆盖',
    '2492' => '该PO未删除，不能更新',
    '2493' => '同步PO失败',
    '2494' => '编辑工单进料失败，请刷新重试',

    // mes 调用srm接口
    '2490' => 'SRM接收失败',


    //领料单
    '2479' => '该委外领料单不存在',
    '2481' => '该子项不存在或者已不允许被修改',
    '2482' => '该工单配置缺失',
    '2488' => '当前已经领取过定额领料单',
    '2489' => '当前訂單不允許刪除',

    '2499' => 'Queue Failed',
    '2450' => '领料单保存成功！推送失败！',
];