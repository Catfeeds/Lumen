<?php

namespace App\Http\Controllers\Front;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
/**
 * 仓位
 * @author  liming
 */
class SubareasController extends Controller
{
 
    public function subareaIndex()
    {
        return view('warehouse.subarea_index');
    }

    public function addsubarea()
    {
        return view('warehouse.add_subarea');
    }

    public function editsubarea()
    {
        return view('warehouse.edit_subarea');
    }
}