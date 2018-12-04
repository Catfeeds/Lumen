<?php
$router->get('encoding/select','Encoding\EncodingController@getModuleList');
$router->get('encoding/getPrefix','Encoding\EncodingController@getPrefix');

//保存编码设置
$router->post('encoding/save','Encoding\EncodingController@saveEncodingSetting');
//获取编码设置
$router->get('encoding/show','Encoding\EncodingController@showEncodingSetting');
//根据编码设置产生编码
$router->post('encoding/get','Encoding\EncodingController@getEncoding');
$router->post('encoding/useEncoding','Encoding\EncodingController@useEncoding');