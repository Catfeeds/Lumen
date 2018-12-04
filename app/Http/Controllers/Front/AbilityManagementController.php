<?php
namespace App\Http\Controllers\Front;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
/**
 * 能力模块
 * @author  leo
 * @time    2018年02月02日14:41:31
 */
class AbilityManagementController extends Controller
{
    //add by minxin 20180320
    /**
     * 能力
     * @return \Illuminate\View\View
     */
    public function abilityList(){
        return view('ability.ability_list');
    }
    //end add
}