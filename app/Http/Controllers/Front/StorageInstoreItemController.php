<?php 
namespace App\Http\Controllers\Front;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

/**
 * 其他入库
 * @author  liming
 */

class StorageInstoreItemController extends Controller
{
    public function storageInItemIndex()
    {
        return view('warehouse.initem_index');
    }
}