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
<div class="div_con_wrapper">
    <div class="actions">
        <a href="/ProductOrder/productOrderCreate"><button class="button"><i class="fa fa-plus"></i>添加</button></a>
        <button class="button" id="pull"><i class="fa fa-hourglass-1"></i>拉取</button>
    </div>
    <div class="searchItem" id="searchForm">
        <form class="searchMAttr searchModal formModal" id="searchBomAttr_from">
            <div class="el-item">
                <div class="el-item-show">
                    <div class="el-item-align">
                        <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label">创建人</label>
                                <input type="text" id="creator" class="el-input" placeholder="请输入创建人" value="">
                            </div>
                        </div>
                        <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label">产品</label>
                                <input type="text" id="materialName" class="el-input" placeholder="请输入产品" value="">
                            </div>
                        </div>
                    </div>
                    <ul class="el-item-hide">
                        <li>
                            <div class="el-form-item">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label">销售订单号</label>
                                    <input type="text" id="sales_order_code" class="el-input" placeholder="请输入销售订单号" value="">
                                </div>
                            </div>
                            <div class="el-form-item">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label">生产订单号</label>
                                    <input type="text" id="number" class="el-input" placeholder="请输入生产订单号" value="">
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
                    <th>生产订单号</th>
                    <th>销售订单号</th>
                    <th>产品</th>
                    <th>数量</th>
                    <th>废料(%)</th>
                    <th>开始日期</th>
                    <th>结束日期</th>
                    <th>当前状态</th>
                    <th>创建人</th>
                    <th>创建时间</th>
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
<script src="/statics/custom/js/product_order/product-url.js?v={{$release}}"></script>
<script src="/statics/common/pagenation/pagenation.js?v={{$release}}"></script>
<script src="/statics/custom/js/product_order/product_order.js?v={{$release}}"></script>
<script src="/statics/common/laydate/laydate.js"></script>

@endsection