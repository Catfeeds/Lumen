{{--继承父模板--}}
@extends("layouts.base")

{{--额外添加的头部内容--}}
@section("inline-header")
<link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/common/orgChart/css/jquery.orgchart.css">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/product/work_task.css?v={{$release}}">
@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")
<div class="work_task_wrap">
    <form class="workTaskForm formTemplate">
        <div class="work_task_basic">
            <h4 class="title">基本信息</h4>
            <div class="el-form-item">
                <div class="el-form-item-div">
                    <label class="el-form-item-label">生产订单</label>
                    <input type="text" disabled id="product_order" class="el-input" value="PO0007219">
                </div>
                <p class="errorMessage" style="padding-left: 30px;"></p>
            </div>
            <div class="el-form-item">
                <div class="el-form-item-div">
                    <label class="el-form-item-label">物料清单</label>
                    <input type="text" disabled id="bom_code" class="el-input" value="bpt4-cpc-0005">
                </div>
                <p class="errorMessage" style="padding-left: 30px;"></p>
            </div>
            <div class="el-form-item">
                <div class="el-form-item-div">
                    <label class="el-form-item-label">路径</label>
                    <input type="text" disabled id="order_road" class="el-input" value="LX1">
                </div>
                <p class="errorMessage" style="padding-left: 30px;"></p>
            </div>
        </div>
        <div class="work_task_bom">
            <h4 class="title">BOM结构</h4>
            <div class="work_tree_wrap">
                <div id="orgchart-container"></div>
            </div>

        </div>
    </form>

</div>
@endsection

{{--额外添加的底部内容--}}
@section("inline-bottom")
<script src="/statics/common/orgChart/js/html2canvas.min.js"></script>
<script src="/statics/common/orgChart/js/jquery.orgchart.js"></script>
<script src="/statics/custom/js/product_order/product-url.js?v={{$release}}"></script>
<script src="/statics/custom/js/product_order/work_task_view.js?v={{$release}}"></script>
@endsection