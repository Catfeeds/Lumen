{{--继承父模板--}}
@extends("layouts.base")

{{--额外添加的头部内容--}}
@section("inline-header")
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/product/work_task.css?v={{$release}}">
    {{--<link type="text/css" rel="stylesheet" href="/statics/common/laydate/theme/default/laydate.css?v={{$release}}">--}}

@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")

    <div class="div_con_wrapper">
        <div class="searchItem" id="searchForm">
            <input type="text" id="add_check_checkbox" value="" style="display: none;">
            <form class="searchOutsource searchModal formModal" id="outsource_from">
                <div class="el-item">
                    <div class="el-item-show">
                        <div class="el-item-align">
                            <div class="el-form-item">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label" style="width: 100px;">生产订单号</label>
                                    <input type="text" id="production_code" class="el-input" placeholder="请输入生产订单号" value="">
                                </div>
                            </div>
                            <div class="el-form-item">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label" style="width: 100px;">委外采购订单</label>
                                    <input type="text" id="purchase_code" class="el-input" placeholder="请输入委外采购订单" value="">
                                </div>
                            </div>
                        </div>
                        {{--<ul class="el-item-hide">--}}
                            {{--<li>--}}
                                {{--<div class="el-form-item">--}}
                                    {{--<div class="el-form-item-div">--}}
                                        {{--<label class="el-form-item-label" style="width: 100px;">公司代码</label>--}}
                                        {{--<input type="text" id="search_BUKRS" class="el-input" placeholder="请输入公司代码" value="">--}}
                                    {{--</div>--}}
                                {{--</div>--}}
                                {{--<div class="el-form-item">--}}
                                    {{--<div class="el-form-item-div">--}}
                                        {{--<label class="el-form-item-label" style="width: 150px;">供应商或债权人的帐号</label>--}}
                                        {{--<input type="text" id="search_LIFNR" class="el-input" placeholder="请输入供应商或债权人的帐号" value="">--}}
                                    {{--</div>--}}
                                {{--</div>--}}
                            {{--</li>--}}
                        {{--</ul>--}}
                    </div>

                    <div class="el-form-item">
                        <div class="el-form-item-div btn-group" style="margin-top: 10px;">
                            {{--<span class="arrow el-select"><i class="el-input-icon el-icon el-icon-caret-top"></i></span>--}}
                            <button type="button" class="el-button el-button--primary submit">搜索</button>
                            <button type="button" class="el-button reset">重置</button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
        <div class="table_page">
            <div class="wrap_table_div" style="height: 300px; overflow-y: scroll;">
                <table id="outsource_table" class="sticky uniquetable commontable">
                    <thead>
                    <tr>
                        <th></th>
                        <th>委外工单号</th>
                        <th>采购申请编号</th>
                        <th>采购申请的项目编号</th>
                        <th>生产订单号</th>
                        <th>工序名称</th>
                        <th>工单状态</th>

                        <th class="right">操作</th>
                    </tr>
                    </thead>
                    <tbody class="table_tbody" >
                    </tbody>
                </table>
            </div>
            <div id="pagenation" class="pagenation bottom-page"></div>
        </div>
        <div class="item_table_page" style="margin-top: 30px;">
            <div class="tap-btn-wrap">
                <div class="el-tap-wrap edit">
                    <span data-status="1"  class="el-item-tap active">领料</span>
                    <span data-status="2"  class="el-item-tap">补料</span>
                    <span data-status="3"  class="el-item-tap">退料</span>

                </div>
            </div>
            <div class="show_item_table_page" style="height: 300px; overflow-y: auto; overflow-x: hidden;">

            </div >

        </div>
    </div>
@endsection

{{--额外添加的底部内容--}}
@section("inline-bottom")
    <script src="/statics/custom/js/outsource/outsource-url.js?v={{$release}}"></script>
    <script src="/statics/common/pagenation/pagenation.js?v={{$release}}"></script>
    <script src="/statics/custom/js/outsource/outsource_work_order.js?v={{$release}}"></script>
    {{--<script src="/statics/common/laydate/laydate.js"></script>--}}

@endsection