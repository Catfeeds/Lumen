<?php 
namespace App\Http\Controllers\Front;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

/**
 * 其他入库
 * @author  liming
 */

class StorageInveController extends Controller
{
    public function inveIndex()
    {
        return view('warehouse.inve_index');
    }
}