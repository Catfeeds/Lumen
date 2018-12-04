<?php
/**
 * Created by PhpStorm.
 * User: wangguangyang
 * Date: 2018/6/13
 * Time: 10:52
 */

namespace App\Http\Controllers\Front;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;


/**
 * 质检管理视图控制器
 * @author  guangyang.wang
 */
class QCComplaintManagementController extends Controller
{



//region  客诉


    /**
     * 索赔单
     * @return   string   json
     * @author   guangyang.wang
     */
    public function claimIndex(Request  $request)
    {
        return view('qc_management.claimIndex');
    }
    /**
     * 查看客诉
     * @return   string   json
     * @author   guangyang.wang
     */
    public function addComplaint(Request  $request)
    {
        return view('qc_management.addComplaint');
    }

    /**
     * 查看客诉
     * @return   string   json
     * @author   guangyang.wang
     */
    public function viewComplaint(Request  $request)
    {
        return view('qc_management.viewComplaint');
    }

    /**
     * 查看客诉详情
     * @return   string   json
     * @author   guangyang.wang
     */
    public function viewComplaintById(Request  $request)
    {
        return  view('qc_management.viewComplaintbyId');
    }


    /**
     * 处理客诉
     * @return   string   json
     * @author   guangyang.wang
     */
    public function disposeComplaint(Request  $request)
    {
        return view('qc_management.disposeComplaint');
    }
    /**
     * 发生到各部门
     * @return   string   json
     * @author   guangyang.wang
     */
    public function disposeComplaintSend(Request  $request)
    {
        return view('qc_management.disposeComplaintSend');
    }


    /**
     * 回复客诉
     * @return   string   json
     * @author   guangyang.wang
     */
    public function replyComplaint(Request  $request)
    {
        return view('qc_management.replyComplaint');
    }
  /**
     * 回复客诉
     * @return   string   json
     * @author   guangyang.wang
     */
    public function replyComplaintView(Request  $request)
    {
        return view('qc_management.replyComplaintView');
    }


    /**
     * 审核客诉
     * @return   string   json
     * @author   guangyang.wang
     */
    public function auditComplaint(Request  $request)
    {
        return view('qc_management.auditComplaint');
    }

    /**
     * 新增客诉
     * @return   string   json
     * @author   guangyang.wang
     */
    public function addComplaintItem(Request  $request)
    {
        return view('qc_management.addComplaintItem');
    }
    /**
     * 新增客诉
     * @return   string   json
     * @author   guangyang.wang
     */
    public function viewComplaintItem(Request  $request)
    {
        return view('qc_management.viewComplaintItem');
    }
    /**
     * 新增客诉
     * @return   string   json
     * @author   guangyang.wang
     */
    public function editComplaintItem(Request  $request)
    {
        return view('qc_management.editComplaintItem');
    }



//endregion







}


