<?php

/**
 * Created by PhpStorm.
 * User: sam.shan
 * Date: 17/10/19
 * Time: 上午9:02
 */



try{
    //开启事务
    DB::connection()->beginTransaction();

}catch(\ApiException $e){
    //回滚
    DB::connection()->rollBack();
    TEA($e->getCode());
}

//提交事务
DB::connection()->commit();
