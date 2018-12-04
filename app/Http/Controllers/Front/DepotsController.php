<?php

namespace App\Http\Controllers\Front;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
/**
 * 仓库
 * @author  liming
 */
class DepotsController extends Controller
{
 
    public function depotIndex()
    {
        return view('warehouse.depot_index');
    }

    public function addDepot()
    {
        return view('warehouse.add_depot');
    }

    public function editDepot()
    {
        return view('warehouse.edit_depot');
    }
}