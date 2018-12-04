<?php
/**
 * Created by PhpStorm.
 * User: wangguangyang
 * Date: 2018/11/14
 * Time: 10:17
 */


namespace App\Http\Controllers\Front;
use App\Http\Controllers\Controller;


class ImportExcelController extends Controller
{

    public function __construct()
    {
        parent::__construct();
    }


    public function ImportExcel()
    {
        return view('import.importExcel');

    }
    public function ImportExcelItem()
    {
        return view('import.importExcelItem');

    }














}