<?php
/**
 * Created by PhpStorm.
 * User: haoziye
 * Date: 2018/5/8
 * Time: 上午10:12
 */
namespace App\Http\Controllers\Erp;
use App\Http\Controllers\Controller;
use App\Http\Models\Erp\ErpBomDataImport;
use Illuminate\Http\Request;

class ErpBomDataImportController extends Controller{

    public function __construct()
    {
        parent::__construct();
        if(empty($this->mdoel)) $this->model = new ErpBomDataImport();
    }

//region 查

    public function getBomData(Request $request){
        $item_no = $request->input('item_no');
        if(empty($item_no)) TEA('700','item_no');
        $obj_list = $this->model->getBomData($item_no);
        return response()->json(get_success_api_response($obj_list));
    }

//endregion

//region 增

    public function importBomData(Request $request){
        $item_no = $request->input('item_no');
        if(empty($item_no)) TEA('700','item_no');
        $this->model->importBomData($item_no);
        return response()->json(get_success_api_response(200));
    }

//endregion
}