{{--继承父模板--}}
@extends("layouts.base")

{{--额外添加的头部内容--}}
@section("inline-header")
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/bom/bom.css?v={{$release}}">
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/product/work_task.css?v={{$release}}">
    <input type="hidden" id="workOrder_view" value="/WorkOrder/viewPickingListForPicking">
@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")
    <div class="div_con_wrapper">
        <div class="tap-btn-wrap">
            <div class="el-tap-wrap edit">
                <span data-status="0" class="el-tap">线边</span>
                <span data-status="1" class="el-tap active">SAP</span>
                <span data-status="2" class="el-tap">车间</span>
            </div>
        </div>
        <div class="el-panel-wrap" style="margin-top: 20px;">
            <div class="searchItem" id="searchForm">
                <form class="searchSTallo searchModal formModal" id="searchSTallo_from">
                    <div class="el-item">
                        <div class="el-item-show">
                            <div class="el-item-align">
                                <div class="el-form-item">
                                    <div class="el-form-item-div">
                                        <label class="el-form-item-label" style="width: 100px;">生产订单号</label>
                                        <input type="text" id="product_order_code" class="el-input" placeholder="生产订单号" value="">
                                    </div>
                                </div>

                                <div class="el-form-item">
                                    <div class="el-form-item-div">
                                        <label class="el-form-item-label" style="width: 100px;">工单号</label>
                                        <input type="text" id="work_order_code" class="el-input" placeholder="请输入工单号" value="">
                                    </div>
                                </div>
                            </div>
                            <ul class="el-item-hide">
                                <li>
                                    <div class="el-form-item">
                                        <div class="el-form-item-div">
                                            <label class="el-form-item-label" style="width: 100px;">单号</label>
                                            <input type="text" id="code" class="el-input" placeholder="请输入单号" value="">
                                        </div>
                                    </div>
                                    <div class="el-form-item">
                                        <div class="el-form-item-div">
                                            <label class="el-form-item-label" style="width: 100px;">类型</label>
                                            <div class="el-select-dropdown-wrap">
                                                <div class="el-select">
                                                    <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                                    <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                                                    <input type="hidden" class="val_id" id="type" value="">
                                                </div>
                                                <div class="el-select-dropdown">
                                                    <ul class="el-select-dropdown-list">
                                                        <li data-id="1" class=" el-select-dropdown-item choose_status">领料</li>
                                                        <li data-id="7" class=" el-select-dropdown-item choose_status">补料</li>
                                                        <li data-id="2" class=" el-select-dropdown-item choose_status">退料</li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                                <li>
                                    <div class="el-form-item">
                                        <div class="el-form-item-div">
                                            <label class="el-form-item-label" style="width: 100px;">状态</label>
                                            <div class="el-select-dropdown-wrap">
                                                <div class="el-select">
                                                    <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                                    <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                                                    <input type="hidden" class="val_id" id="status" value="">
                                                </div>
                                                <div class="el-select-dropdown">
                                                    <ul class="el-select-dropdown-list" id="show_status">

                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            </ul>

                        </div>
                        <div class="el-form-item">
                            <div class="el-form-item-div btn-group" style="margin-top: 10px;">
                                <span class="arrow el-select"><i class="el-input-icon el-icon el-icon-caret-top"></i></span>
                                <button type="button" class="el-button el-button--primary submit" data-item="Unproduced_from">搜索</button>
                                <button type="button" class="el-button reset">重置</button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
            <div class="table_page">

            </div>
        </div>
    </div>
@endsection

{{--额外添加的底部内容--}}
@section("inline-bottom")
    <script src="/statics/custom/js/product_order/product-url.js?v={{$release}}"></script>
    <script src="/statics/custom/js/product_order/picking_list.js?v={{$release}}"></script>
    <script src="/statics/common/pagenation/pagenation.js?v={{$release}}"></script>
@endsection