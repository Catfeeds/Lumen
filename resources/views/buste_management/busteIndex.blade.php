{{--继承父模板--}}
@extends("layouts.base")

{{--额外添加的头部内容--}}
@section("inline-header")
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/product/work_task.css?v={{$release}}">
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/image/image.css?v={{$release}}">
    <input type="hidden" id="workOrder_view" value="/Buste/busteIndex">

@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")
    <div >
        <div class="el-form-item" style="padding-right: 10px">
            <div class="el-form-item-div btn-group">
                <button type="button" class="el-button print" style="display: none;"><i class="fa fa-print" ></i>打印</button>
                <button type="button" class="el-button el-button--primary submit_SAP" style="display: none;">推送</button>
                <button type="button" class="el-button el-button--primary submit" style="display: none;">保存</button>
            </div>
        </div>

        <form class="formModal formWorkOrder" id="workOrder_from" >

            <div class="work_order_wrap">
                <div class="work_order_left">
                    <textarea  name="" id="work_order_form" cols="30" rows="8" style="margin-top: 10px; text-align: center; padding:20px;overflow: hidden;"></textarea>
                    <div  style="border: 1px #ccc solid;background: #fff;padding: 6px;border-radius: 4px;width: 270px;height:270px;margin: auto;">
                        <div id="qrcode" style="width:110px; height:110px;   margin-top: -56px;">
                            <div id="qrCodeIco"></div>
                        </div>
                    </div>
                </div>
                <div class="work_order_btn"><span></span></div>
                <div class="work_order_right" style="min-width: 1200px;">
                    <div style="border: solid 1px #d1dbe5; padding: 5px;">
                        <div class="el-form-item">
                            <div style="display: inline-block;width: 800px;">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label" style="width: 300px;text-align: center;color:#000;">报工单执行时间</label>
                                    <span class="el-input span start_time"><span id="start_time_input"></span><input type="text" id="start_time" placeholder="开始时间" value=""></span>——
                                    <span class="el-input span end_time"><span id="end_time_input"></span><input type="text" id="end_time" placeholder="结束时间" value=""></span>
                                </div>
                            </div>

                            <div class="el-form-item-div" style="display: inline-block;float: right;">
                                <label class="el-form-item-label" style="width: 150px;text-align: center;color: black">最后一次报工</label>
                                <span class="el-checkbox_input el-checkbox_input_check" id="is_teco" style="margin-top: 8px;">
                                    <span class="el-checkbox-outset"></span>
                                </span>
                            </div>
                            <div class="el-form-item-div" style="display: inline-block;float: right;">
                                <label class="el-form-item-label" style="width: 150px;text-align: center;color: black">异常报工</label>
                                <span class="el-checkbox_input el-checkbox_input_check" id="differient" style="margin-top: 8px;">
                                    <span class="el-checkbox-outset"></span>
                                </span>
                            </div>
                        </div>

                        <div id="show_workcenter" style="display: none;"></div>
                    </div>
                    <div>
                        <h3>消耗品</h3>
                        <table id="show_in_material">
                            <thead>
                            <tr>
                                <th class="center">物料编码</th>
                                <th class="center">物料名称</th>
                                <th class="center">批次号</th>
                                <th class="center">计划数量</th>
                                <th class="center">额定数量</th>
                                <th class="center">销售订单号</th>
                                <th class="center">生产订单号</th>
                                <th class="center storage">库存数量</th>
                                <th class="center">消耗数量</th>
                                <th class="center">单位</th>
                                <th class="center">组件差异数量</th>
                                <th class="center">差异原因</th>
                            </tr>
                            </thead>
                            <tbody class="table_tbody">

                            </tbody>

                        </table>
                    </div>
                    <div>
                        <h3>产成品</h3>
                        <table id="show_out_material">
                            <thead>
                            <tr>
                                <th class="center">物料编码</th>
                                <th class="center">物料名称</th>
                                <th class="center" id="batch">批次</th>
                                <th class="center">计划数量</th>
                                <th class="center">单位</th>
                                <th class="center">实报数量</th>
                                <th class="center">库存地</th>
                            </tr>
                            </thead>
                            <tbody class="table_tbody">

                            </tbody>

                        </table>
                    </div>
                </div>
            </div>
        </form>

        <div class="table_page">

        </div>
    </div>
@endsection

{{--额外添加的底部内容--}}
@section("inline-bottom")
    <script src="/statics/custom/js/product_order/product-url.js?v={{$release}}"></script>
    <script src="/statics/custom/js/product_order/buste_work_order.js?v={{$release}}"></script>
    <script src="/statics/common/JsBarcode/JsBarcode.all.min.js?v={{$release}}"></script>
    <script src="/statics/common/autocomplete/autocomplete-revision.js?v={{$release}}"></script>
    <script src="/statics/custom/js/product_order/qrcode.js?v={{$release}}"></script>
    <script src="/statics/common/laydate/laydate.js"></script>
    <script src="/statics/common/print/jQuery.print.js?v={{$release}}"></script>
@endsection