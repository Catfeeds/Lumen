{{--继承父模板--}}
@extends("layouts.base")

{{--额外添加的头部内容--}}
@section("inline-header")
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/bom/bom.css?v={{$release}}">
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/product/work_task.css?v={{$release}}">
    <input type="hidden" id="workOrder_view" value="/Buste/busteIndex">
@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")
    <div class="div_con_wrapper">
        <div class="actions">
            <a href="/Buste/busteIndex" class="el-button declare"><button type="button" class="el-button" >快速报工</button></a>
        </div>
        <div class="el-panel-wrap" style="margin-top: 20px;">
            <div class="searchItem" id="searchForm">
                <form class="searchSTallo searchModal formModal" id="searchSTallo_from">
                    <div class="el-item">
                        <div class="el-item-show">
                            <div class="el-item-align">
                                <div class="el-form-item">
                                    <div class="el-form-item-div">
                                        <label class="el-form-item-label">生产订单号</label>
                                        <input type="text" id="code" class="el-input" placeholder="请输入生产订单号" value="">
                                    </div>
                                </div>
                                <div class="el-form-item">
                                    <div class="el-form-item-div">
                                        <label class="el-form-item-label">工单号</label>
                                        <input type="text" id="work_order_code" class="el-input" placeholder="请输入工单号" value="">
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="el-form-item">
                            <div class="el-form-item-div btn-group" style="margin-top: 10px;">
                                <button type="button" class="el-button el-button--primary submit" data-item="Unproduced_from">搜索</button>
                                <button type="button" class="el-button reset">重置</button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
            <?php  (session('administrator'))  ?>
            <div class="table_page">

            </div>
        </div>
    </div>
@endsection

{{--额外添加的底部内容--}}
@section("inline-bottom")
    <script src="/statics/custom/js/product_order/product-url.js?v={{$release}}"></script>
    <script src="/statics/custom/js/product_order/buste_list.js?v={{$release}}"></script>
    <script src="/statics/common/pagenation/pagenation.js?v={{$release}}"></script>
    <script src="/statics/custom/js/ajax-client-sap.js?v={{$release}}"></script>
@endsection