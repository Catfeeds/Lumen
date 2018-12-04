{{--继承父模板--}}
@extends("layouts.base")

{{--额外添加的头部内容--}}
@section("inline-header")
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/product/product_order.css?v={{$release}}">
    <link type="text/css" rel="stylesheet" href="/statics/common/laydate/theme/default/laydate.css?v={{$release}}">

@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")
    <input type="hidden" id="order_view" value="/ProductOrder/productOrderView">
    <input type="hidden" id="order_edit" value="/ProductOrder/productOrderEdit">
    <input type="hidden" id="order_released" value="/ProductOrder/productOrderReleasedView">
    <div class="div_con_wrapper">
        <div class="actions">
            <a href="/ProductOrder/productOrderCreate"><button class="button"><i class="fa fa-plus"></i>添加</button></a>
            <button class="button" style="display: none;" id="pull"><i class="fa fa-hourglass-1"></i>拉取</button>
            <button class="batch-release">批量发布&自动排产</button>
            <button class="stop-refresh" style="display: none">停止刷新</button>
            <div class="showMsg" style="border:0.5px solid #ddd;font-size: 12px;padding: 4px 10px;border-radius:4px;display:none;"></div>
        </div>
        <div class="searchItem" id="searchForm">
            <form class="searchMAttr searchModal formModal" id="searchReleased_from">
                <div class="el-item">
                    <div class="el-item-show">
                        <div class="el-item-align">
                            <div class="el-form-item">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label">销售订单号</label>
                                    <input type="text" id="sales_order_code" class="el-input" placeholder="请输入生产订单号" value="">
                                </div>
                            </div>
                            <div class="el-form-item">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label">生产订单号</label>
                                    <input type="text" id="creator" class="el-input" placeholder="请输入生产订单号" value="">
                                </div>
                            </div>

                        </div>
                        <ul class="el-item-hide">
                            <li>
                                <div class="el-form-item">
                                    <div class="el-form-item-div">
                                        <label class="el-form-item-label">订单排序</label>
                                        <div class="el-select-dropdown-wrap">
                                            <div class="el-select">
                                                <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                                <input type="text" readonly="readonly" id="order_modeShow" class="el-input" value="--请选择--">
                                                <input type="hidden" class="val_id" id="order_mode" value="">
                                            </div>
                                            <div class="el-select-dropdown list">
                                                <ul class="el-select-dropdown-list">
                                                    <li data-id="" class="el-select-dropdown-item kong">--请选择--</li>
                                                    <li data-id="1" class="el-select-dropdown-item">截止日期</li>
                                                    <li data-id="2" class="el-select-dropdown-item">开始日期</li>
                                                    <li data-id="3" class="el-select-dropdown-item">优先级</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div class="el-form-item">
                                    <div class="el-form-item-div">
                                        <label class="el-form-item-label">优先级</label>
                                        <div class="el-select-dropdown-wrap">
                                            <div class="el-select">
                                                <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                                <input type="text" readonly="readonly" id="priorityShow" class="el-input" value="--请选择--">
                                                <input type="hidden" class="val_id" id="priority" value="">
                                            </div>
                                            <div class="el-select-dropdown list">
                                                <ul class="el-select-dropdown-list">
                                                    <li data-id="" class="el-select-dropdown-item kong">--请选择--</li>
                                                    <li data-id="1" class="el-select-dropdown-item">低</li>
                                                    <li data-id="2" class="el-select-dropdown-item">中</li>
                                                    <li data-id="3" class="el-select-dropdown-item">高</li>
                                                    <li data-id="4" class="el-select-dropdown-item">紧急</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </li>
                            <li id="start_end">
                                <div class="el-form-item">
                                    <div class="el-form-item-div">
                                        <label class="el-form-item-label">开始日期</label>
                                        <input type="text" id="start_date" class="el-input show_description" placeholder="请选择开始日期" value="" data-desc="该日期筛选的订单为当前开始日期之前的所有订单">
                                    </div>
                                </div>
                                <div class="el-form-item">
                                    <div class="el-form-item-div">
                                        <label class="el-form-item-label">结束日期</label>
                                        <input type="text" id="end_date" class="el-input show_description" placeholder="请选择结束日期" value="" data-desc="该日期筛选的订单为当前结束日期之前的所有订单">
                                    </div>
                                </div>
                            </li>
                            <li>
                                <div class="el-form-item">
                                    <div class="el-form-item-div">
                                        <label class="el-form-item-label">订单状态</label>
                                        <div class="el-select-dropdown-wrap">
                                            <div class="el-select">
                                                <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                                <input type="text" readonly="readonly" id="all_ofShow" class="el-input" value="--请选择--">
                                                <input type="hidden" class="val_id" id="all_of" value="">
                                            </div>
                                            <div class="el-select-dropdown all_of_list">
                                                <ul class="el-select-dropdown-list">
                                                    <li data-id="" class="el-select-dropdown-item kong">--请选择--</li>
                                                    <li data-id="0" class="el-select-dropdown-item">未发布</li>
                                                    <li data-id="1" class="el-select-dropdown-item">已发布</li>
                                                    <li data-id="2" class="el-select-dropdown-item">已拆完</li>
                                                    <li data-id="3" class="el-select-dropdown-item">已排完</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="el-form-item">
                                    <div class="el-form-item-div">
                                        <label class="el-form-item-label">销售订单行项号</label>
                                        <input type="text" id="sales_order_project_code" class="el-input" placeholder="请输入销售订单行项号" value="">
                                    </div>
                                </div>
                            </li>
                        </ul>
                    </div>

                    <div class="el-form-item">
                        <div class="el-form-item-div btn-group" style="margin-top: 10px;">
                            <span class="arrow el-select"><i class="el-input-icon el-icon el-icon-caret-top"></i></span>
                            <button type="button" class="el-button el-button--primary submit">搜索</button>
                            <button type="button" class="el-button reset">重置</button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
        <div class="table_page">
            <div class="wrap_table_div">
                <table id="product_order_table" class="sticky uniquetable commontable">
                    <thead>
                    <tr>
                        <th>销售订单号/行项号</th>
                        <th>生产订单号</th>
                        <th>物料编码</th>
                        <th>名称</th>
                        <th class="text-center">数量</th>
                        <th class="text-center">单位</th>
                        <th style="width: 370px;text-align: center">计划时间</th>
                        <th class="text-center">优先级</th>
                        <th class="text-center">订单状态</th>
                        <th class="text-center">已排进度(%)</th>
                        <th class="text-center">下发时间</th>
                        <th class="right">操作</th>
                    </tr>
                    </thead>
                    <tbody class="table_tbody">
                    </tbody>
                </table>
            </div>
            <div id="pagenation" class="pagenation bottom-page"></div>
        </div>
    </div>
@endsection

{{--额外添加的底部内容--}}
@section("inline-bottom")
    <script src="/statics/common/ace/assets/js/moment.min.js"></script>
    <script src="/statics/custom/js/product_order/product-url.js?v={{$release}}"></script>
    <script src="/statics/common/pagenation/pagenation.js?v={{$release}}"></script>
    <script src="/statics/custom/js/product_order/product_released.js?v={{$release}}"></script>
    <script src="/statics/common/laydate/laydate.js?v={{$release}}"></script>

@endsection