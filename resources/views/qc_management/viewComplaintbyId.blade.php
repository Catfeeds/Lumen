{{--继承父模板--}}
@extends("layouts.base")

{{--额外添加的头部内容--}}
@section("inline-header")
<link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/qc/complaint.css?v={{$release}}">
@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")
<div class="div_con_wrapper">
    <div class="container">
        <div class="report_container">
            <table>
                <tr>
                    <td colspan="4" style="font-size: 14px;line-height: 30px;height: 30px;text-align: center;">梦百合家居科技股份有限公司</td>
                </tr>
                <tr>
                    <td colspan="4" style="font-size: 11px;line-height: 20px;height: 20px;text-align: right;padding-right: 20px;"> HK-QWI-024/0001</td>
                </tr>
                <tr>
                    <td colspan="4" style="font-size: 16px;line-height: 25px;height: 25px;text-align: center;">改 善 措 施 报 告</td>
                </tr>
                <tr>
                    <td style="width: 20%;text-align: left">Customer Name(客户名称)</td>
                    <td style="width: 30%;text-align: center;" id="customer_name"></td>
                    <td style="width: 20%;text-align: left;">NNC No.(客訴單號)</td>
                    <td style="width: 30%;text-align: center;" id="complaint_code"></td>
                </tr>
                <tr>
                    <td style="text-align: left;">NNC Received Date(NNC 接收日期)</td>
                    <td style="text-align: center;" id="received_date"></td>
                    <td style="text-align: left;">Target Resp.Date(应回复日期)</td>
                    <td style="text-align: center;" id="target_respond_date"></td>
                </tr>
                <tr>
                    <td style="text-align: left;">Samples Received Date(不良样品接收日期)</td>
                    <td style="text-align: center;" id="samples_received_date"></td>
                    <td style="text-align: left;">Actual Respond Date(实际回复日期)</td>
                    <td style="text-align: center;" id="actual_respond_date"></td>
                </tr>
            </table>
            <table>
                <thead>
                    <tr>
                        <th colspan="6">Discipline 1:Team Approach (问题处理小组)：</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>- Team Leader (组长): </td>
                        <td colspan="5">徐红</td>
                    </tr>
                    <tr>
                        <td>- Team Members (组员): </td>
                        <td>孙建</td>
                        <td>张红建</td>
                        <td colspan="2">沈鹏</td>
                        <td>徐红</td>
                    </tr>
                    <tr>
                        <td>- Department(部门):</td>
                        <td>业务部</td>
                        <td>生产部</td>
                        <td colspan="2" width="20%">技术研发部</td>
                        <td width="20%">品管部</td>
                    </tr>
                    <tr>
                        <th colspan="3">Problem Solving Process/问题解决过程</th>
                        <th>RESP.责任人</th>
                        <th>DATE完成日期</th>
                        <th>STATUS完成状态</th>
                    </tr>
                </tbody>
            </table>
            <table>
                <thead>
                    <tr>
                        <th colspan="5">Discipline 2:Problem Description (问题描述):</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td width="20%">- 物料名称/图号:</td>
                        <td></td>
                        <td width="10%" rowspan="6"></td>
                        <td width="10%" rowspan="6"></td>
                        <td width="20%" rowspan="6"></td>
                    </tr>
                    <tr>
                        <td>- 缺陷物料制造批次:</td>
                        <td></td>

                    </tr>
                    <tr>
                        <td>- 客户抽检/使用缺陷比例:</td>
                        <td></td>

                    </tr>
                    <tr>
                        <td>- 缺陷物料拒收数量:</td>
                        <td></td>

                    </tr>
                    <tr>
                        <td>- 缺陷描述/照片:</td>
                        <td></td>

                    </tr>
                    <tr>
                        <td colspan="2" height="100px;"></td>
                    </tr>
                </tbody>
            </table>
            <table>
                <thead>
                    <tr>
                        <th colspan="5">Discipline 3:Containment Plan (紧急处置计划):</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td width="20%">1. Stock (库存品):</td>
                        <td id="stock"></td>
                        <td width="10%" rowspan="18" id="employee_name"></td>
                        <td width="10%" rowspan="18" id="status"></td>
                        <td width="20%" rowspan="18" id="create_time"></td>
                    </tr>
                    <tr>
                        <td>- 数量确认:</td>
                        <td id="stock_num"></td>
                    </tr>
                    <tr>
                        <td>- 质量确认:</td>
                        <td id="stock_quality"></td>
                    </tr>
                    <tr>
                        <td>- 是否需要隔离/标识?</td>
                        <td id="stock_flag"></td>
                    </tr>
                    <tr>
                        <td>2.Wip(在制品):</td>
                        <td id="wip"></td>
                    </tr>
                    <tr>
                        <td>- 数量确认:</td>
                        <td id="wip_num"></td>
                    </tr>
                    <tr>
                        <td>- 质量确认:</td>
                        <td id="wip_quality"></td>
                    </tr>
                    <tr>
                        <td>- 是否需要隔离/标识?</td>
                        <td id="wip_flag"></td>
                    </tr>
                    <tr>
                        <td>3.Customer stock (客户库存品):</td>
                        <td id="customer_stock"></td>
                    </tr>
                    <tr>
                        <td>- 数量确认:</td>
                        <td id="customer_stock_num"></td>

                    </tr>
                    <tr>
                        <td>- 质量确认:</td>
                        <td id="customer_stock_quality"></td>
                    </tr>
                    <tr>
                        <td>- 可维持客户多久的生产?</td>
                        <td id="customer_stock_time"></td>
                    </tr>
                    <tr>
                        <td>4.Rejected goods handle(客户退货品处理方案):</td>
                        <td></td>
                    </tr>
                    <tr>
                        <td colspan="2" id="rejected_handle">

                        </td>
                    </tr>
                    <tr>
                        <td>5. Next shipment schedule (改善后的送货时间):</td>
                        <td></td>
                    </tr>
                    <tr>
                        <td>- 计划送货时间:</td>
                        <td id="next_shipment_schedule_time"></td>

                    </tr>
                    <tr>
                        <td>- 送货数量:</td>
                        <td id="next_shipment_schedule_num"></td>
                    </tr>
                    <tr>
                        <td>- 原定的交期是否能按时完成?</td>
                        <td id="next_shipment_schedule_flag"></td>
                    </tr>
                </tbody>
            </table>


            <table>
                <thead>
                    <tr>
                        <th colspan="4">Discipline 4:Describe The Root Cause (根本原因描述):</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>1. Root Cause (根本原因)：</td>
                        <td width="10%" rowspan="6" id="basic_employee_name"></td>
                        <td width="10%" rowspan="6" id="basic_status"></td>
                        <td width="20%" rowspan="6" id="basic_create_time"></td>
                    </tr>
                    <tr>
                        <td id="basicCasue"></td>

                    </tr>
                    <tr>
                        <td> 2. Why escaped from process control (为何从制程管制中流出):</td>

                    </tr>
                    <tr>
                        <td id="escapedProcess"></td>

                    </tr>
                    <tr>
                        <td>3. Why escaped from outgoing inspection (为何从最终检验中流出):</td>

                    </tr>
                    <tr>
                        <td id="escapedOutgoing"></td>

                    </tr>
                </tbody>
            </table>

            <table>
                <thead>
                <tr>
                    <th colspan="4">Discipline 5:Permanent C/A plan (永久性改善措施):</th>
                </tr>
                </thead>
                <tbody>
                <tr>
                    <td>1. How to prevent recurrence?(如何防止再发生):</td>
                    <td width="10%" rowspan="8" id="improve_employee_name"></td>
                    <td width="10%" rowspan="8" id="improve_status"></td>
                    <td width="20%" rowspan="8" id="improve_create_time"></td>
                </tr>
                <tr>
                    <td id="recurrence"></td>

                </tr>
                <tr>
                    <td> 2.If need to update the related process files?是否需要更新相关工艺文件？</td>

                </tr>
                <tr>
                    <td>
                        <table>
                            <tr>
                                <td colspan="4"id="is_update"></td>

                            </tr>
                            <tr>
                                <td width="25%">- 文件更新日期：</td>
                                <td width="25%" id="update_date"></td>
                                <td width="25%">文件执行日期：</td>
                                <td width="25%" id="execute_update"></td>
                            </tr>
                            <tr>
                                <td colspan="2">- 文件更新部分执行效果确认/日期：</td>
                                <td colspan="2" id="check_result"></td>

                            </tr>
                        </table>
                    </td>

                </tr>
                <tr>
                    <td>3. How to detect out? (怎样检查出此不良)</td>

                </tr>
                <tr>
                    <td id="method"></td>

                </tr>
                <tr>
                    <td>4.How to identify the improvement date?(何时生产的产品为改善后的产品?)</td>

                </tr>
                <tr>
                    <td id="improveDate"></td>

                </tr>
                </tbody>
            </table>

            <table>
                <thead>
                    <tr>
                        <th colspan="5">Discipline 6:Verification of Corrective Effect(改善措施的效果跟踪):</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td width="20%">- 跟踪区间所生产的数量：</td>
                        <td id="follow_number"></td>
                        <td width="10%" rowspan="3" id="overflow_employee_name"></td>
                        <td width="10%" rowspan="3" id="overflow_status"></td>
                        <td width="20%" rowspan="3" id="overflow_create_time"></td>
                    </tr>
                    <tr>
                        <td>- 改善效果的确认方法：</td>
                        <td id="follow_method"></td>

                    </tr>
                    <tr>
                        <td>- 改善措施的效果：	</td>
                        <td id="follow_effect"></td>

                    </tr>
                </tbody>
            </table>

            <table>
                <thead>
                <tr>
                    <th colspan="4">Discipline 7: learn from lesson & study if there is similar problem then make a plan of correct(从此次问题处理中的经吸取验教训，并研究是否还有类似问题存在，若有，请制定改善计划)</th>
                </tr>
                </thead>
                <tbody>
                <tr>
                    <td id="learning"></td>
                    <td width="10%" id="lesson_employee_name"></td>
                    <td width="10%" id="lesson_status"></td>
                    <td width="20%" id="lesson_create_time"></td>
                </tr>
                </tbody>
            </table>

            <table>
                <thead>
                <tr>
                    <th colspan="4">Discipline 8：If the same problem happen again please describe your reason(如果问题重复发生，请解释原因)：</th>
                </tr>
                </thead>
                <tbody>
                <tr>
                    <td id="repeat_reason"></td>
                    <td width="10%" id="repeat_employee_name"></td>
                    <td width="10%" id="repeat_status"></td>
                    <td width="20%" id="repeat_create_time"></td>
                </tr>
                </tbody>
            </table>
            <table>
                <tr>
                    <td width="25%">Preparation/Date (编制/日期)</td>
                    <td width="25%"></td>
                    <td width="25%">Approval/Date (审批/日期)</td>
                    <td width="25%"></td>
                </tr>
            </table>

        </div>
    </div>
</div>
@endsection

{{--额外添加的底部内容--}}
@section("inline-bottom")
<script src="/statics/custom/js/qc/qc-url.js?v={{$release}}"></script>
<script src="/statics/custom/js/qc/complaint/view_complaint_details.js?v={{$release}}"></script>
@endsection