<?php
/**
 * 个人中心
 * @author  sam.shan  <sam.shan@ruis-ims.cn>
 * @time    2018年01月29日15:59:28
 */



/*
 |账号设置
 |-----------------------------------------------------------------------
 |@author sam.shan  <sam.shan@ruis-ims.cn>
 |----------------------------------------------------------------------
 |每个接口的含义请参考:账户管理——权限节点
 |
 */

$router->get('Center/profile','Mes\CenterController@profile');
$router->post('Center/updateProfile','Mes\CenterController@updateProfile');
$router->post('Center/updatePassword','Mes\CenterController@updatePassword');



/*
 |我的消息
 |-----------------------------------------------------------------------
 |@author sam.shan  <sam.shan@ruis-ims.cn>
 |----------------------------------------------------------------------
 |每个接口的含义请参考:账户管理——权限节点
 |
 */



/*
 |登陆日志
 |-----------------------------------------------------------------------
 |@author sam.shan  <sam.shan@ruis-ims.cn>
 |----------------------------------------------------------------------
 |每个接口的含义请参考:账户管理——权限节点
 |
 */
$router->get('Center/loginLog','Mes\CenterController@loginLog');









