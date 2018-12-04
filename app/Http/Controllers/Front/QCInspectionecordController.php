<?php
/**
 * Created by PhpStorm.
 * User: wangguangyang
 * Date: 2018/4/3
 * Time: 18:54
 */
namespace App\Http\Controllers\Front;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;


/**
 * 质检管理视图控制器
 * @author  guangyang.wang
 */
class QCInspectionecordController extends Controller
{



//region IQC检验记录


    /**
     *
     * @return   string   json
     * @author   guangyang.wang
     */
    public function inspectionIQCIndex(Request  $request)
    {
        return view('qc_management.inspectionIQCIndex');
    }
//endregion

//region IQC检验计划


    /**
     *
     * @return   string   json
     * @author   guangyang.wang
     */
    public function inspectionIQCPlan(Request  $request)
    {
        return view('qc_management.inspectionIQCPlan');
    }
//endregion
//region IPQC检验记录


    /**
     *
     * @return   string   json
     * @author   guangyang.wang
     */
    public function inspectionIPQCIndex(Request  $request)
    {
        return view('qc_management.inspectionIPQCIndex');
    }
//endregion
//region OQC检验记录


    /**
     *
     * @return   string   json
     * @author   guangyang.wang
     */
    public function inspectionOQCIndex(Request  $request)
    {
        return view('qc_management.inspectionOQCIndex');
    }
//endregion


//region 特采申请


    /**
     *
     * @return   string   json
     * @author   guangyang.wang
     */
    public function acceptOnDeviationApply(Request  $request)
    {
        return view('qc_management.acceptOnDeviationApply');
    }
//endregion


//region 特采审核


    /**
     *
     * @return   string   json
     * @author   guangyang.wang
     */
    public function acceptOnDeviationAudit(Request  $request)
    {
        return view('qc_management.acceptOnDeviationAudit');
    }
//endregion


//region 异常申请


    /**
     *
     * @return   string   json
     * @author   guangyang.wang
     */
    public function abnormalApply(Request  $request)
    {
        return view('qc_management.abnormalApply');
    }
//endregion

//region 异常发送


    /**
     *
     * @return   string   json
     * @author   guangyang.wang
     */
    public function abnormalSend(Request  $request)
    {
        return view('qc_management.abnormalSend');
    }
//endregion


//region 异常发送


    /**
     *
     * @return   string   json
     * @author   guangyang.wang
     */
    public function abnormalSendList(Request  $request)
    {
        return view('qc_management.abnormalSendList');
    }
//endregion


//region 异常填写


    /**
     *
     * @return   string   json
     * @author   guangyang.wang
     */
    public function abnormalFillReport(Request  $request)
    {
        return view('qc_management.abnormalFillReport');
    }
//endregion


//region 异常审核


    /**
     *
     * @return   string   json
     * @author   guangyang.wang
     */
    public function abnormalAudit(Request  $request)
    {
        return view('qc_management.abnormalAudit');
    }
//endregion

}
