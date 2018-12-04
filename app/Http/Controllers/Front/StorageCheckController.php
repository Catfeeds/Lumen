<?php 
namespace App\Http\Controllers\Front;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

/**
 * 盘点
 * @author  liming
 */

class StorageCheckController extends Controller
{
    public function checkIndex()
    {
        return view('warehouse.check_index');
    }

    public function addCheck()
    {
        return view('warehouse.add_check');
    }

    public function editCheck()
    {
        return view('warehouse.edit_check');
    }

    public function viewCheck()
    {
        return view('warehouse.view_check');
    }

}