<?php 
namespace App\Http\Controllers\Front;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

/**
 * 盘点
 * @author  liming
 */

class StorageMoveController extends Controller
{
    public function moveIndex()
    {
        return view('warehouse.move_index');
    }

    public function addMove()
    {
        return view('warehouse.add_move');
    }

    public function editMove()
    {
        return view('warehouse.edit_move');
    }

    public function viewMove()
    {
        return view('warehouse.view_move');
    }

}