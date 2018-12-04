<?php
/**
 * Created by PhpStorm.
 * User: zhufeng
 * Date: 2018/8/15
 * Time: 下午1:33
 */
namespace App\Http\Controllers\Front;
use App\Http\Controllers\Controller;

/**
 * 工艺路线组
 * Class ProcedureGroupController
 * @package App\Http\Controllers\Front
 * @author Bruce.Chu
 */
class ProcedureGroupController extends Controller
{
    /**
     * 工艺路线组列表
     * @return \Illuminate\View\View
     */
    public function procedureGroupIndex()
    {
        return view('procedure_group.procedure_group_index');
    }
}