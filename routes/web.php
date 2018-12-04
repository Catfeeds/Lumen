<?php
/**
 * 该文件为bootstrap/app.php中默认自动加载的路由文件
 * 这里我们做个桥接,将所有的路由都分门别类文件化,然后通过include_once引入
 * @author   sam.shan <sam.shan@ruis-ims.cn>
 * @time     2017年09月13日16:53:09
 * @todo     由于引入的文件没有做is_file()判断[影响性能],所以请确保文件一定存在
 */

Route::get('phpinfo','phpinfoController@info');
/*
 |---------------------------------------
 |视图访问路由
 |---------------------------------------
 |@author   sam.shan  <sam.shan@ruis-ims.cn>
 */
include_once(__DIR__.'/front.php');


/*
 |---------------------------------------
 |引入测试路由文件
 |---------------------------------------
 |建议所有的测试路由均统一放置在下面
 |@author   sam.shan <sam.shan@ruis-ims.cn>
 */


include_once(__DIR__.'/test.php');

/*
 |---------------------------------------
 |引入物料路由文件
 |---------------------------------------
 |建议所有的物料部分路由均统一放置在下面
 |@author   sam.shan <sam.shan@ruis-ims.cn>
 */
include_once(__DIR__.'/material.php');


/*
 |---------------------------------------
 |引入办成品仓库管理路由文件
 |---------------------------------------
 |
 |@author   xiaoliang.chen
 */
include_once(__DIR__.'/semi.php');

/*
 |---------------------------------------
 |引入iot模块路由文件
 |---------------------------------------
 |
 |@author   rick.rui
 */
include_once(__DIR__.'/iot.php');


/*
 |---------------------------------------
 |上传下载文件图纸等路由文件
 |---------------------------------------
 |@author   sam.shan <sam.shan@ruis-ims.cn>
 */
include_once(__DIR__.'/up-download.php');




/*
 |---------------------------------------
 |仓库路由文件
 |---------------------------------------
 |@author   liming
 */
include_once(__DIR__.'/storage.php');




/*
 |---------------------------------------
 |设备管理路由文件
 |---------------------------------------
 |@author   liming
 */
include_once(__DIR__.'/device.php');




/*
 |---------------------------------------
 |采购路由文件
 |---------------------------------------
 |@author   liming
 */
include_once(__DIR__.'/purchase.php');

/*
 |---------------------------------------
 |编码设置路由文件
 |---------------------------------------
 |@author   xiaoliang.chen
 */
include_once(__DIR__.'/encoding.php');

/*
 |---------------------------------------
 |工艺路由文件
 |---------------------------------------
 |@author   sam.shan   <sam.shan@ruis-ims.cn>
 */
include_once(__DIR__.'/operation.php');

/*
 |---------------------------------------
 |通用设置路由文件
 |---------------------------------------
 |@author   sam.shan   <sam.shan@ruis-ims.cn>
 */
include_once(__DIR__.'/general.php');

/*
 |---------------------------------------
 |bom路由文件
 |---------------------------------------
 |@author   rick.rui
 */
include_once(__DIR__.'/bom.php');

/*
 |---------------------------------------
 |工时工序路由文件
 |---------------------------------------
 |@author   leo.yan
 */
include_once(__DIR__.'/workhour.php');


/*
 |---------------------------------------
 |账户管理路由文件
 |---------------------------------------
 |@author   sam.shan  <sam.shan@ruis-ims.cn>
 */
include_once(__DIR__.'/account.php');

/*
 |---------------------------------------
 |图纸库
 |---------------------------------------
 |@author   hao.wei
 */
include_once(__DIR__ . '/image.php');

/*
 |人事路由文件
 |---------------------------------------
 |@author   sam.shan  <sam.shan@ruis-ims.cn>
 */
include_once(__DIR__.'/personnel.php');

/*
 |个人中心
 |---------------------------------------
 |@author   sam.shan  <sam.shan@ruis-ims.cn>
 */
include_once(__DIR__.'/center.php');

/*
 |系统消息
 |---------------------------------------
 |@author   hao.wei <weihao>
 */
include_once(__DIR__.'/message.php');

/*
 |公司
 |---------------------------------------
 |@author   hao.wei <weihao>
 */
include_once(__DIR__.'/company.php');

/*
 |工厂
 |---------------------------------------
 |@author   hao.wei <weihao>
 */
include_once(__DIR__.'/factory.php');

/*
 |生产管理
 |---------------------------------------
 |@author  rick
 */
include_once(__DIR__.'/produce.php');

/*
 |API接口
 |---------------------------------------
 |@author   rick
 */
include_once(__DIR__.'/api.php');


/*
 |QC接口
 |---------------------------------------
 |@author   guangyang.wang
 */
include_once(__DIR__.'/qc.php');

/*
 |销售管理
 |---------------------------------------
 |@author   hao.wei
 */
include_once(__DIR__.'/sell.php');


/*
 |恒康存储过程接口
 |---------------------------------------
 |@author   Ming.Li
 */
include_once(__DIR__.'/procedure.php');

/*
 |Erp订单转存Mes接口
 |---------------------------------------
 |@author   Bruce.Chu
 */
include_once(__DIR__.'/erp.php');

/*
 |导出Excel SAP工艺数据对接
 |---------------------------------------
 |@author   Bruce.Chu
 */
include_once(__DIR__.'/excel.php');

/*
 |Erp订单转存Mes接口
 |---------------------------------------
 |@author   Bruce.Chu
 */
include_once(__DIR__.'/sap.php');

/*
 |工艺路线组
 |---------------------------------------
 |@author   Bruce.Chu
 */
include_once(__DIR__.'/procedure_group.php');


/*
 |单位
 |---------------------------------------
 |@author   Ming.Li
 */
include_once(__DIR__.'/unit.php');



/*
 |委外领料
 |---------------------------------------
 |@author   Ming.Li
 */
include_once(__DIR__.'/out_machine.php');



/*
 |sap 称重
 |---------------------------------------
 |@author   Ming.Li
 */
include_once(__DIR__.'/offcut_weright.php');

/*
 |制造bom
 |---------------------------------------
 |@author   hao.wei
 */
include_once(__DIR__.'/make_bom.php');

/*
 |委外报工报表
 |---------------------------------------
 |@author   lester.you
 */
include_once(__DIR__.'/bpo.php');



/*
 |往来业务伙伴
 |---------------------------------------
 |@author   Ming.Li
 */
include_once(__DIR__.'/partner.php');
