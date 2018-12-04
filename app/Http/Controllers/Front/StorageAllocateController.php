<?php 
namespace App\Http\Controllers\Front;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

/**
 * 盘点
 * @author  liming
 */

class StorageAllocateController extends Controller
{
    public function allocateIndex()
    {
        return view('warehouse.allocate_index');
    }

    public function addAllocate()
    {
        return view('warehouse.add_allocate');
    }

    public function editAllocate()
    {
        return view('warehouse.edit_allocate');
    }

    public function viewAllocate()
    {
        return view('warehouse.view_allocate');
    }

}