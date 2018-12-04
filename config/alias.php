<?php
/**
 * Created by PhpStorm.
 * User: sansheng
 * Date: 17/12/7
 * Time: 下午5:05
 */

return [

    /*
    |--------------------------------------------------------------------------
    | 系统表别名定义,请按照字典排序方式定义
    |--------------------------------------------------------------------------
    |@author  sam.shan  <sam.shan@ruis-ims.cn>
    |
    */

//region  A
    'ad' => 'attribute_definition',//公共属性表
    'ad2t' => 'attribute_definition2template',//模板与属性关联表
    'adt' => 'attribute_data_type',//属性数据类型基础表
    'attachment' => 'attachment',//附件公共表
//endregion

//region  B
//endregion
//region  C
//endregion

//region  D
    'drawing' => 'ruis_drawing',//图纸公共表
//endregion

//region  E
//endregion
//region  F
//endregion
//region  G
//endregion
//region  H
//endregion
//region  I
//endregion
//region  J
//endregion
//region  K
//endregion
//region  L
//endregion

//region  M
    'ma' => 'material_attribute',//物料与物料属性关联表
//endregion

//region  N
//endregion

//region  O
    'o' => 'operation',//工序表
    'oa' => 'operation_attribute',//工序与工艺属性关联表
    'oav' => 'operation_attribute_value',//任何与工艺属性关联的公共表,垃圾
//endregion

//region  P
//endregion
//region  Q
//endregion

//region  R

    //region RA
    //endregion

    //region RB
    'ramc' => 'ruis_material_marc',
    'ramm' => 'ruis_material_marm',
    'rb' => 'ruis_bom',//物料清单主表
    'rba' => 'ruis_bom_attachment',//物料清单附件表
    'rbg' => 'ruis_bom_group',//物料清单分组
    'rbi' => 'ruis_bom_item',
    'rbiql' => 'ruis_bom_item_qty_level',//物料清单阶梯用量表
    'rbf' => 'ruis_bom_factory',//bom和工艺路线的关联
    'rbpf' => 'ruis_bpo_file',//委外报工报表excel文件
    'rbprf' => 'ruis_bpo_report_form',//委外点报表
    'rbr' => 'ruis_bom_routing',//bom的工艺路线
    'rbra' => 'ruis_bom_routing_attachment',//bom的工艺路线节点附件
    'rbrb' => 'ruis_bom_routing_base',//bom的工艺路线节点基本信息
    'rbrd' => 'ruis_bom_routing_drawing',//bom的工艺路线节点的图纸
    'rbri' => 'ruis_bom_routing_item',//bom的工艺路线节点的进出料
    'rbrl' => 'ruis_bom_routing_lzp',//bom的工艺路线节点的流转品
    'rbroc' => 'ruis_bom_routing_operation_control',//bom的工艺文件的工序控制码
    'rbrw' => 'ruis_bom_routing_workcenter',//bom的工艺路线节点上选中能力的工作中心
    //endregion

    //region RC
    'rc' => 'ruis_country',//国家表
    'rci' => 'ruis_customer_info',//客户信息表
    'rcp' => 'ruis_company',//公司表
    //endregion

    //region RD
    'rd' => 'ruis_department', //部门
    'rda' => 'ruis_drawing_attribute',//图纸属性表
    'rdad' => 'ruis_drawing_attribute_definition',//图纸属性定义表
    'rdadgt' => 'ruis_drawing_attribute_definition_group_type',//图纸属性定义_分组分类关联表
    'rdat' => 'ruis_drawing_attachment',//图纸附件关联 add by lester.you 2018-05-03
    'rdc' => 'ruis_drawing_category',//图纸分类/模块表
    'rdcl' => 'ruis_drawing_care_label',      // 洗标
    'rdg' => 'ruis_drawing_group',//图纸分组表
    'rdgt' => 'ruis_drawing_group_type',//图纸分组分类表
    'rdl' => 'ruis_drawing_link',//图纸关联 add by lester.you 2018-05-03
    'rdlt' => 'ruis_device_list',//设备列表
    'rdo' => 'ruis_device_options',//设备使用状态
    'rdr' => 'ruis_drawing',//图纸表
    'rdt' => 'ruis_drawing_temp',//图纸文件临时表 用于临时存储上传文件的数据 add by lester.you 2018-05-18
    'rdtp' => 'ruis_device_type',//设备类型
    //endregion

    //region RE
    're' => 'ruis_employee',//员工
    'rel' => 'ruis_encoding_list',//编码流水表
    'rep' => 'ruis_employee_position', //岗位表
    'repr' => 'ruis_employee_position_role',//职位关联功能表
    'rer' => 'ruis_encoding_recycle',//编码回收表
    'res' => 'ruis_encoding_setting',//编码设置表
    'ret' => 'ruis_error_type',//工位机错误类型
    //endregion

    //region RF
    'rf' => 'ruis_factory',
    'rfit' => 'ruis_flow_ability_item',
    'rgfr' => 'ruis_group_factory_relation',//工艺路线组+工厂关系表
    //endregion

    //region RG
    //endregion
    //region RH
    //endregion

    //region RI
    //add by xin.min 20180319 能力
    'ria' => 'ruis_ie_ability',//能力表;
    'rimw' => 'ruis_ie_material_workhours',    //标准工时表
    'rio' => 'ruis_ie_operation',    //工序表
    'rioa' => 'ruis_ie_operation_ability',   //工序对应的多个能力的表
    'riomc' => 'ruis_ie_operation_material_category',  //物料分类与工序的关联表
    'riopf' => 'ruis_ie_operation_practice_field',   //工序(做法模板)和做法的关联表 add by lester.you 2018-04-11
    'rior' => 'ruis_ie_operation_relation',   //工序之间的关系
    'riw' => 'ruis_ie_workhours',
    //endregion

    //region RJ
    //endregion
    //region RK
    //endregion
    //region RL
    //endregion

    //region RM
    'rm' => 'ruis_material',//物料表
    'rma' => 'ruis_material_attachment',//物料附件关联表

    'rmb' => 'ruis_manufacture_bom',
    'rmba' => 'ruis_make_bom_attachment',//制造bom的附件
    'rmbi' => 'ruis_make_bom_item',//制造bom的子项
    'rmbiql' => 'ruis_make_bom_item_qty_level',//制造bom子项的阶梯用量
    'rmbr' => 'ruis_make_bom_routing',//制造bom的工艺路线
    'rmbra' => 'ruis_make_bom_routing_attachment',//制造bom工艺路线附件
    'rmbrb' => 'ruis_make_bom_routing_base',//制造bom工艺路线基础表
    'rmbrd' => 'ruis_make_bom_routing_drawing',//制造bom工艺路线图片
    'rmbri' => 'ruis_make_bom_routing_item',//制造bom工艺路线进出料
    'rmbrw' => 'ruis_make_bom_routing_workcenter',//制造bom工艺路线工作中心
    'rmbw' => 'ruis_make_bom_workhours',//制造bom工艺路线工时

    'rmc' => 'ruis_material_category',//物料分类表
    'rmd' => 'ruis_material_drawing',//物料图纸关联表

    'rmdb' => 'ruis_material_default_bom',//物料默认bom编号

    'rmkb' => 'ruis_make_bom',//制造bom

    'rmr' => 'ruis_material_requisition',//领料单
    'rmri' => 'ruis_material_requisition_item',//领料单子表
    'rmrib' => 'ruis_material_requisition_item_batch',//领料物料子表批次表
    //endregion

    //region RN
    //endregion

    //region RO
    'roo' => 'ruis_operation_order',//工艺单
    //endregion

    //region RP
    'rp' => 'ruis_partner',//往来业务伙伴
    'rp' => 'ruis_practice',//做法表
    'rpc' => 'ruis_practice_category',//做法分类
    'rpd' => 'ruis_practice_drawing',//做法_图纸关联 add by lester.you 2018-04-26
    'rpf' => 'ruis_practice_field',//做法字段 Add by lester.you 2018-04-11
    'rpfa' => 'ruis_practice_field_ability',//做法字段-做法能力关系表

    'rpl' => 'ruis_practice_line',//做法线表
    'rpn' => 'ruis_partner_new',  //新往来业务伙伴

    'rpo' => 'ruis_production_order',//生产订单
    'rppf' => 'ruis_practice_practice_field',//做法-做法字段关系表
    'rppl' => 'ruis_practice_practice_line',//做法-做法线关系表
    'rppu' => 'ruis_practice_practice_use',//做法-用处关系表 add by xin 20180510

    //add by xin.min 20180403 工艺
    'rpr' => 'ruis_procedure_route',//工艺路线表
    'rprg' => 'ruis_procedure_route_group',     //add by bruce 20180815 工艺路线组表
    'rprgn' => 'ruis_procedure_route_gn',   //add by bruce 20180901 sap 工艺路线组 工艺路线 BOM 关联表
    'rprm' => 'ruis_procedure_route_map',//工艺路线路由表
    'rpro' => 'ruis_procedure_route_operation',//工艺路线-工艺关联表
    'rps' => 'ruis_preselection', // 预选方案（原因）
    'rpt' => 'ruis_product_type',//产品细分类 add by lester.you 2018-04-28
    'rpu' => 'ruis_practice_use',//用处表 add by lester.you 2018-04-25
    //endregion

    //region RQ
    //add by xin 20180620 qc模块表
    'rqmi' => 'ruis_qc_missing_items',//qc模块缺失项表
    'rqcc' => 'ruis_qc_customer_complaint',//qc模块 客诉单表
    'rqcca' => 'ruis_qc_customer_complaint_answer',//qc模块, D4-D8答案表;
    'rqccd1' => 'ruis_qc_customer_complaint_D1',//qc模块, 给业务填的D1表
    'rqccd2' => 'ruis_qc_customer_complaint_D2',//qc模块, 给业务填的D2表
    'rqccd3' => 'ruis_qc_customer_complaint_D3',//qc模块, 给业务填的D3表
    'rqccq' => 'ruis_qc_customer_complaint_question',//qc模块, D4-D8问题表;
    'rqccm' => 'ruis_qc_customer_complaint_message',//qc模块, 审核/打回描述表;
    'rqr' => 'ruis_queue_record', // 队列 日志表
    'rqt' => 'ruis_qc_template',//qc 检验模板表
    //endregion

    //region RR
    'rra' => 'ruis_rbac_auth',//角色与节点关联表
    'rrad' => 'ruis_rbac_admin',//后台系统用户管理表
    'rrall' => 'ruis_rbac_admin_login_log',//登陆日志表

    'rri' => 'ruis_rbac_identity',//管理员与角色关联表
    'rrm' => 'ruis_rbac_menu',//菜单表
    'rrn' => 'ruis_rbac_node',//权限节点表
    'rrp' => 'ruis_rank_plan',//班次表
    'rrpt' => 'ruis_rank_plan_type',//班次类型表
    'rrr' => 'ruis_rbac_role',//权限角色表
    //endregion

    //region RS
    'rsco' => 'ruis_subcontract_order',//委外工序表
    'rscoi' => 'ruis_subcontract_order_item',
    'rsd' => 'ruis_storage_depot', //仓库表
    'rsi' => 'ruis_storage_inve',
    'rsit' => 'ruis_storage_item',
    'rsm' => 'ruis_sys_message',//系统消息表

    'rso' => 'ruis_sell_order',//销售订单表
    'rsoi' => 'ruis_subcontract_order_item',//委外工序表物料明细表
    'rsop' => 'ruis_sellorder_product_list',//销售订单产品列表
    //endregion

    //region RT
    'rt' => 'ruis_trace',//公共日志基础表
    //endregion

    //region RU
    'rusm' => 'ruis_user_sys_message',//'用户的系统消息表'
    'ruu' => 'ruis_uom_unit',//单位表
    //endregion

    //region RV
    //add by kevin 20180530 版本管理
    'rvr' => 'ruis_version_record',//版本记录表
    //endregion

    //region RW
    'rwb' => 'ruis_workbench',//工作台
    'rwbdi' => 'ruis_workbench_device_item',//工作台设备明细
    'rwbre' => 'ruis_workbench_rankplan_emplyee',//班次关联人的表
    'rwboa' => 'ruis_workbench_operation_ability',//工作台关联工序.能力
    'rwc' => 'ruis_workcenter',//工作中心
    'rwco' => 'ruis_workcenter_operation',//工作中心关联工序
    'rwcos' => 'ruis_workcenter_operation_step',//工作中心关联的步骤
    'rwcr' => 'ruis_workcenter_rankplan',//工作中心关联班次
    'rwdo' => 'ruis_work_declare_order',//报工表
    'rwdoi' => 'ruis_work_declare_order_item',//报工用料
    'rwm' => 'ruis_workmachine',//工位机
    'rwo' => 'ruis_work_order',//工单表
    'rwoa' => 'ruis_work_order_alarm',//工单报警
    'rws' => 'ruis_workshop',//车间表
//    'rwdo' => 'ruis_work_declare_order',//报工表
    //endregion
    //region RX
    //endregion
    //region RY
    //endregion
    //region RZ
    //endregion
//endregion

//region  S
    'sar' => 'sap_api_record', // SAP接口请求记录
    'sb' => 'sap_bom',
    'smarc' => 'sap_marc',//SAP物料从表1
    'smarm' => 'sap_marm',//SAP物料从表2
    'spi' => 'sap_param_item',
    'spiv' => 'sap_standard_material_workhours_item',
    'spo' => 'sap_product_order',
    'spos' => 'sap_product_order_status',
    'ssv' => 'sap_standard_value',
    'ssvpi' => 'sap_standard_value_param_item',
    'sw' => 'sap_workcenter',
//endregion

//region  T
    'template' => 'template',//公共模板表
//endregion

//region  U
    'u' => 'ruis_rbac_admin',//用户表
    'uu' => 'ruis_uom_unit',//单位表

//endregion
//region  V
//endregion
//region  W
//endregion
//region  X
//endregion
//region  Y
//endregion
//region  Z
//endregion

];