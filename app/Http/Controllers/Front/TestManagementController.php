<?php


namespace App\Http\Controllers\Front;
use App\Http\Controllers\Controller;



/**
 * 测试
 * Class TestController
 * @package App\Http\Controllers\Test
 */
class TestManagementController extends Controller
{
     public  function  ally()
     {

         return view('test_management.ally');
     }

     public function chaidan(){
         return view('test_management.chaidan');
     }

     public function testThree(){
         return view('test_management.testThree');
     }

    public function testFour(){
        return view('test_management.testFour');
    }

}