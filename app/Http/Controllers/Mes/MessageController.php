<?php
/**
 * Created by PhpStorm.
 * User: haoziye
 * Date: 2018/1/30
 * Time: 下午3:48
 */
namespace App\Http\Controllers\Mes;
use App\Http\Controllers\Controller;
use App\Http\Models\Message;
use Illuminate\Http\Request;

class MessageController extends Controller{

    public function __construct()
    {
        parent::__construct();
        if(!$this->model) $this->model = new Message();
    }

//region 增

    /**
     * 发送消息
     * @param Request $request
     * @author hao.wei <weihao>
     */
    public function sendMessage(Request $request){
        $input = $request->all();
        $this->model->checkFormFields($input);
        $insert_id = $this->model->add($input);
        return response()->json(get_success_api_response($insert_id));
    }

//endregion

//region 查

    /**
     * @param Request $request
     * @param json
     * @author hao.wei <weihao>
     */
    public function sysMessagePageIndex(Request $request){
        $input = $request->all();
        trim_strings($input);
        $this->checkPageParams($input);
        $obj_list = $this->model->getSysMessageList($input);
        $paging = $this->getPagingResponse($input);
        return response()->json(get_success_api_response($obj_list,$paging));
    }

    /**
     * @param Request $request
     * @param json
     * @author hao.wei <weihao>
     */
    public function sysMessageDetail(Request $request){
        $id = $request->input($this->model->apiPrimaryKey);
        if(empty($id)) TEA('700',$this->model->apiPrimaryKey);
        $obj = $this->model->get($id);
        return response()->json(get_success_api_response($obj));
    }

//endregion

//region 删

    /**
     * 删除消息
     * @param Request $request
     * @return json
     * @author hao.wei <weihao>
     */
    public function sysMessageDelete(Request $request){
        $id = $request->input($this->model->apiPrimaryKey);
        if(empty($id)) TEA('700',$this->model->apiPrimaryKey);
        $this->model->delete($id);
        return response()->json(get_success_api_response($id));
    }

//endregion
}