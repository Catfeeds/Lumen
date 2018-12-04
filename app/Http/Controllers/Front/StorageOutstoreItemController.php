<?php 
namespace App\Http\Controllers\Front;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

/**
 * 其他入库
 * @author  liming
 */

class StorageOutstoreItemController extends Controller
{
    public function storageOutItemIndex()
    {
        return view('warehouse.outitem_index');
    }
}