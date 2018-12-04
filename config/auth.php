<?php
/**
 * Admin模块的后台权限配置项
 * @author  sam.shan@ruis-ims.cn
 * @time    2018年01月13日11:01:32
 */


return  [

     'dm_auth_nodes'=>true,//是否开启权限节点的采集
     'salt'=>'999_emi2c_!@#$%',//加密盐
     'auto_test'=>'auto',//自动化测试
    //免登录的地址,注意模糊匹配只支持二级
    'ignore_login_nodes'=>array(
        //'AccountManagement/login',
//        'AccountManagement/makeCaptcha',
//        'AccountManagement/logout',
//        'Admin/login',
        //'Admin/captcha',
        //'Upload/*',
        //'sam/*',
        //'rick/*',
        //'error/*',
    ),
    //免授权的地址
    'ignore_auth_nodes'=>array(
        '/',//控制台
        //'adminmanager/profile',//个人资料
        //'upload/headerphoto',//上传头像
    ),





];




