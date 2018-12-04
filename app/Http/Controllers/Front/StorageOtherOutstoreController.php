<?php 
namespace App\Http\Controllers\Front;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

/**
 * 其他入库
 * @author  liming
 */

class StorageOtherOutstoreController extends Controller
{
    public function outstoreIndex()
    {
        return view('warehouse.outstore_index');
    }

    public function addOutstore()
    {
        return view('warehouse.add_outstore');
    }

    public function editOutstore()
    {
        return view('warehouse.edit_outstore');
    }

    public function viewOutstore()
    {
        return view('warehouse.view_outstore');
    }

}