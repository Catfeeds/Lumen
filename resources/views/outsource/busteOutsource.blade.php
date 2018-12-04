{{--继承父模板--}}
@extends("layouts.base")

{{--额外添加的头部内容--}}
@section("inline-header")
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/product/work_task.css?v={{$release}}">
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/image/image.css?v={{$release}}">
@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")
    <div >
        <div class="el-form-item">
            <div class="el-form-item-div btn-group">
                <div class="btn-group" style="margin-right: 10px;">
                    <button type="button" class="button el-button--primary" data-toggle="dropdown">推送 <span class="caret"></span></button>
                    <ul class="dropdown-menu" style="right: 0;left: auto" role="menu">
                    </ul>
                </div>
                <button type="button" class="el-button el-button--primary submit">保存</button>
            </div>
        </div>

        <form class="formModal formWorkOrder" id="workOrder_from" >


                <div class="work_order_right">
                    <div>
                        <div class="el-form-item" style="width: 600px;">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label" style="width: 300px;text-align: center">报工单执行时间</label>
                                <span class="el-input span start_time"><span id="start_time_input"></span><input type="text" id="start_time" placeholder="开始时间" value=""></span>——
                                <span class="el-input span end_time"><span id="end_time_input"></span><input type="text" id="end_time" placeholder="结束时间" value=""></span>
                            </div>
                        </div>

                        <div id="show_workcenter" style="display: none;"></div>
                    </div>
                    <div>
                        <h3>消耗品</h3>
                        <table id="show_in_material">
                            <thead>
                            <tr>
                                <th>物料编码</th>
                                <th>物料名称</th>
                                <th>数量</th>
                                <th>计算数量</th>
                                <th>单位</th>
                                <th>消耗数量</th>
                                <th>组件差异数量</th>
                                <th>差异原因</th>
                                <th></th>
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
                                <th>物料编码</th>
                                <th>物料名称</th>
                                <th>数量</th>
                                <th>单位</th>
                                <th>实报数量</th>
                                <th></th>
                            </tr>
                            </thead>
                            <tbody class="table_tbody">

                            </tbody>

                        </table>
                    </div>


                </div>
        </form>
    </div>
@endsection

{{--额外添加的底部内容--}}
@section("inline-bottom")
    <script src="/statics/custom/js/outsource/outsource-url.js?v={{$release}}"></script>
    <script src="/statics/custom/js/outsource/buste_outsource_work_order.js?v={{$release}}"></script>
    <script src="/statics/common/JsBarcode/JsBarcode.all.min.js?v={{$release}}"></script>
    <script src="/statics/common/autocomplete/autocomplete-revision.js?v={{$release}}"></script>
@endsection