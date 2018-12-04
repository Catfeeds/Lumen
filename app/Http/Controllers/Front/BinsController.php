<?php

namespace App\Http\Controllers\Front;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
/**
 * 仓位
 * @author  liming
 */
class BinsController extends Controller
{
 
    public function binIndex()
    {
        return view('warehouse.bin_index');
    }

    public function addbin()
    {
        return view('warehouse.add_bin');
    }

    public function editbin()
    {
        return view('warehouse.edit_bin');
    }
}