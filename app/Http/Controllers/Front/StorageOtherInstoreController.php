<?php 
namespace App\Http\Controllers\Front;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

/**
 * 其他入库
 * @author  liming
 */

class StorageOtherInstoreController extends Controller
{
    public function instoreIndex()
    {
        return view('warehouse.instore_index');
    }

    public function addInstore()
    {
        return view('warehouse.add_instore');
    }

    public function editInstore()
    {
        return view('warehouse.edit_instore');
    }

    public function viewInstore()
    {
        return view('warehouse.view_instore');
    }


}