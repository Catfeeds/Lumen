<?php
namespace App\Http\Controllers\Front;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
/**
 * 版本管理
 * @author  kevin
 * @time    2018年05月31日14:41:31
 */
class VersionManagerController extends Controller
{
    public function versionList(){
        return view('version.version_list');
    }
}