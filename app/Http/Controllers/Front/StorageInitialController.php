<?php 
namespace App\Http\Controllers\Front;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

/**
 * 期初库存
 * @author  liming
 */

class StorageInitialController extends Controller
{
    public function initialIndex()
    {
        return view('warehouse.initial_index');
    }

    public function addInitial()
    {
        return view('warehouse.add_initial');
    }

    public function editInitial()
    {
        return view('warehouse.edit_initial');
    }

    public function viewInitial()
    {
        return view('warehouse.view_initial');
    }

}