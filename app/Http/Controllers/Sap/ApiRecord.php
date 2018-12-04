<?php
/**
 * Created by PhpStorm.
 * User: lester
 * Date: 2018/10/20 14:02
 * Desc:
 */

namespace App\Http\Controllers\Sap;


use App\Http\Controllers\Controller;
use App\Http\Models\SapApiRecord;
use Illuminate\Http\Request;

class ApiRecord extends Controller
{
    public function __construct()
    {
        parent::__construct();
        !$this->model && $this->model = new SapApiRecord();
    }

    public function pageIndex(Request $request)
    {
        $input = $request->all();
        trim_strings($input);
        $obj_list = $this->model->pageIndex($input);
        $paging = $this->getPagingResponse($input);
        return response()->json(get_success_api_response($obj_list, $paging));
    }
}