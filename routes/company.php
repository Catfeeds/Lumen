<?php
/**
 * Created by PhpStorm.
 * User: haoziye
 * Date: 2018/2/2
 * Time: 上午11:30
 */

/*
|------------------------------------------------------------------------------
|公司
|@author   hao.wei <weihao>
|------------------------------------------------------------------------------
|
 */
$router->post('Company/store','Mes\CompanyController@store');
$router->get('Company/unique','Mes\CompanyController@unique');
$router->get('Company/show','Mes\CompanyController@show');
$router->get('Company/pageIndex','Mes\CompanyController@pageIndex');
$router->post('Company/update','Mes\CompanyController@update');
$router->get('Company/delete','Mes\CompanyController@delete');
$router->get('Company/select','Mes\CompanyController@select');
$router->get('Company/countrySelect','Mes\CompanyController@contrySelect');
$router->get('Company/getCurrentAdminCompany','Mes\CompanyController@getCurrentAdminCompany');