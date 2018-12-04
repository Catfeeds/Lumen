{{--继承父模板--}}
@extends("layouts.base")

{{--额外添加的头部内容--}}
@section("inline-header")
<link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/bom/bom.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/product/work_task.css?v={{$release}}">
<input type="hidden" id="workOrder_view" value="/WorkOrder/workOrderView">
<input type="hidden" id="workOrderItem_view" value="/WorkOrder/viewPickingList">

@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")
<div class="div_con_wrapper">
    <div class="tap-btn-wrap">
        <div class="el-tap-wrap edit">
            <span data-status="0" class="el-tap ">未排</span>
            <span data-status="1" class="el-tap active">主排程</span>
            <span data-status="2" class="el-tap">细排程</span>
        </div>
    </div>
    
    <div class="el-panel-wrap" style="margin-top: 20px;">
    <div class="searchItem" id="searchForm">
        <input type="text" id="status" style="display: none;">
        <input type="text" id="pageNnber" style="display: none;" value="1">
    <form class="searchSTallo searchModal formModal" id="searchSTallo_from">
        <div class="el-item">
          <div class="el-item-show">
            <div class="el-item-align">
                <div class="el-form-item">
                    <div class="el-form-item-div">
                        <label class="el-form-item-label" style="width: 100px;">销售订单号</label>
                        <input type="text" id="sales_order_code" class="el-input" placeholder="请输入销售订单号" value="">
                    </div>
                </div>
                <div class="el-form-item">
                    <div class="el-form-item-div">
                        <label class="el-form-item-label" style="width: 100px;">生产订单号</label>
                        <input type="text" id="production_order_number" class="el-input" placeholder="请输入生产订单号" value="">
                    </div>
                </div>
            </div>
            <ul class="el-item-hide">
              <li>
                  <div class="el-form-item">
                      <div class="el-form-item-div">
                          <label class="el-form-item-label" style="width: 100px;">工单号</label>
                          <input type="text" id="work_order_number" class="el-input" placeholder="请输入工单号" value="">
                      </div>
                  </div>
                  <div class="el-form-item">
                      <div class="el-form-item-div">
                          <label class="el-form-item-label" style="width: 100px;">工作任务号</label>
                          <input type="text" id="work_task_number" class="el-input" placeholder="请输入工作任务号" value="">
                      </div>
                  </div>
              </li>
              <li>
                  <div class="el-form-item">
                      <div class="el-form-item-div">
                          <label class="el-form-item-label" style="width: 100px;">销售订单行项号</label>
                          <input type="text" id="sales_order_project_code" class="el-input" placeholder="请输入销售订单行项号" value="">
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
                {{--<button type="button" class="el-button declare" style="display: none;" >齐料检查</button>--}}
            </div>
        </div>
        </div>
    </form>
    </div>
    <div class="table_page">
        
    </div>

    <div class="item_table_page" style="margin-top: 30px;display: none;" id="showPickingList">
        <div class="tap-btn-wrap">
            <div class="el-tap-wrap edit">
                <span data-status="1" class="el-item-tap active">领料单</span>
                <span data-status="2" class="el-item-tap">退料单</span>
                <span data-status="7" class="el-item-tap">补料单</span>
                <span data-status="8" class="el-item-tap">报工单</span>
            </div>
        </div>
        <div class="show_item_table_page">

        </div >

    </div>
    </div>   
</div>
@endsection

{{--额外添加的底部内容--}}
@section("inline-bottom")
    <script src="/statics/common/cookie/jquery.cookie.js" type="text/javascript"></script>

    <script src="/statics/custom/js/product_order/product-url.js?v={{$release}}"></script>
<script src="/statics/custom/js/product_order/work_order.js?v={{$release}}"></script>
<script src="/statics/common/pagenation/pagenation.js?v={{$release}}"></script>
<script src="/statics/common/JsBarcode/JsBarcode.all.min.js?v={{$release}}"></script>
@endsection