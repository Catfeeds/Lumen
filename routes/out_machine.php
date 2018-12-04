<?php 
/**
 * mes系统路由放置位置
 * @author liming
 * @time    2017年11月22日
 */

/**
 |------------------------------------------------------------------------------
 |委外领料单
 |@author   liming   
 |@reviser  liming
 |------------------------------------------------------------------------------
 |委外领料单分页列表
 |
 |
 */
 $router->get('OutMachine/pageIndex','Mes\OutMachineController@pageIndex');
 $router->get('OutMachine/show','Mes\OutMachineController@show');
 //通过委外订单获取 委外工单
 $router->get('OutMachine/showOutWork', 'Mes\OutMachineController@showOutWork');

 /**
 |------------------------------------------------------------------------------
 |委外退料 ZY04    ZY05 委外定额领料   ZY06 委外定额退料  ZB03委外补料
 |@author   liming   
 |@reviser  liming
 |------------------------------------------------------------------------------
 */
 /*委外相关单据
  */
 $router->post('OutMachineZy/storeZy', 'Mes\OutMachineZyController@storeZy');



 //委外相关单据列表
 $router->get('OutMachineZy/pageIndex', 'Mes\OutMachineZyController@pageIndex');
 $router->get('OutMachineZy/show', 'Mes\OutMachineZyController@show');





 ?>