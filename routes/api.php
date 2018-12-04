<?php
/**
 * Created by PhpStorm.
 * User: ruiyanchao
 * Date: 2018/3/8
 * Time: 上午9:41
 */


/*
 |-----------------------------------------------------------------------
 |员工模块
 |@author rick.rui
 |----------------------------------------------------------------------
 */
$router->post('api/Employee/getAllEmployee','Api\EmployeeController@getAllEmployee');
$router->post('api/Employee/getEmployeeInfo','Api\EmployeeController@getEmployeeInfo');


/*
 |-----------------------------------------------------------------------
 |工单模块
 |@author rick.rui
 |----------------------------------------------------------------------
 */
$router->post('api/WorkOrder/unfinishedWorkOrder','Api\WorkOrderController@unfinishedWorkOrder');
$router->post('api/WorkOrder/submitPiece','Api\WorkOrderController@submitPiece');
$router->post('api/WorkOrder/listHistoryWorkOrder','Api\WorkOrderController@listHistoryWorkOrder');
$router->post('api/WorkOrder/submitWorkOrder','Api\WorkOrderController@submitWorkOrder');
$router->post('api/WorkOrder/startUnfinishedWorkOrder','Api\WorkOrderController@startUnfinishedWorkOrder');
$router->post('api/WorkOrder/saveWorkOrder','Api\WorkOrderController@saveWorkOrder');
$router->post('api/WorkOrder/getUsedQty','Api\WorkOrderController@getUsedQty');


/*
 |-----------------------------------------------------------------------
 |报警模块
 |@author rick.rui
 |----------------------------------------------------------------------
 */
$router->post('api/Alarm/getErrorType','Api\AlarmController@getErrorType');
$router->post('api/Alarm/submitErrorType','Api\AlarmController@submitErrorType');
$router->post('api/Alarm/handleWorkOrderAlarm','Api\AlarmController@handleWorkOrderAlarm');



/*
 |-----------------------------------------------------------------------
 | 供测试
 | @author lester.you
 |----------------------------------------------------------------------
 */
$router->get('sap/test[/{apiCode}]', function ($apiCode='INT_PP000300012') {
    $data= [
        [
            'MATNR' => 300105110001,
            'MAKTX' => '物料描述',
            'WERKS' => '1101',
            'KTEXT' => '工艺路线描述',
            'PLNAL' => '01',
            'LOSVN1' => '0',
            'LOSBS1' => 999999,
            'PLNME1' => 'PC',
            'VORNR' => '0010',
            'LTXA1' => '工序描述',
            'ARBPL' => 'MBMS010',
            'STEUS' => 'PP01',
            'BMSCH1' => 100,
            'MEINH' => 'PC',
            'VGW011' => '1',
            'VGE011' => 'H',
            'VGW021' => 2,
            'VGE021' => 'MIN',
            'VGW031' => '',
            'VGE031' => '',
            'VGW041' => '',
            'VGE041' => '',
            'VGW051' => '',
            'VGE051' => '',
            'VGW061' => '',
            'VGE061' => '',
        ],
        [
            'MATNR' => 300105110001,
            'MAKTX' => '物料描述',
            'WERKS' => '1101',
            'KTEXT' => '工艺路线描述',
            'PLNAL' => '01',
            'LOSVN1' => '0',
            'LOSBS1' => 999999,
            'PLNME1' => 'PC',
            'VORNR' => '0020',
            'LTXA1' => '工序描述',
            'ARBPL' => 'MBMS010',
            'STEUS' => 'PP01',
            'BMSCH1' => 100,
            'MEINH' => 'PC',
            'VGW011' => '1',
            'VGE011' => 'H',
            'VGW021' => 2,
            'VGE021' => 'MIN',
            'VGW031' => '',
            'VGE031' => '',
            'VGW041' => '',
            'VGE041' => '',
            'VGW051' => '',
            'VGE051' => '',
            'VGW061' => '',
            'VGE061' => '',
        ]
    ];
    $response = \App\Libraries\Soap::doRequest($data,$apiCode,'0003');
    return json_encode($response);
});