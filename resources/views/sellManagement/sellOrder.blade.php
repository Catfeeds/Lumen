{{--继承父模板--}}
@extends("layouts.base")

@section("inline-header")
<link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
<input type="hidden" id="sellOrder_view" value="sellOrderShow">
<input type="hidden" id="sellOrder_edit" value="sellOrderUpdate">
@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")
<div class="div_con_wrapper">
    <div class="actions">
       <a href="sellOrderAdd"><button id="sellOrder_add" class="button button_action button_add">添加</button></a>
   </div>
   <div class="searchItem" id="searchForm">
    <form class="searchSTallo searchModal formModal" id="searchSTallo_from">
        <div class="el-item">
          <div class="el-item-show">
            <div class="el-item-align">
                <div class="el-form-item">
                <div class="el-form-item-div">
                    <label class="el-form-item-label">销售单编号</label>
                    <input type="text" id="code" class="el-input" placeholder="请输入销售单编号" value="">
                </div>
            </div>
            <div class="el-form-item">
                <div class="el-form-item-div">
                    <label class="el-form-item-label">创建人</label>
                    <input type="text" id="creater_name" class="el-input" placeholder="请输入创建人名称" value="">
                </div>
            </div>         
        </div>
        <ul class="el-item-hide">
          <li>
            <div class="el-form-item">
                <div class="el-form-item-div">
                    <label class="el-form-item-label">客户</label>
                    <input type="text" id="customer_name" class="el-input" placeholder="请输入客户名称" value="">
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
    <div class="wrap_table_div" style="overflow: hidden;min-height: 500px;">
        <table id="table_sellsOrder_table" class="sticky uniquetable commontable">
            <thead>
                <tr>
                    <th class="left nowrap">创建时间</th>
                    <th class="left nowrap">销售单编码</th>
                    <th class="left nowrap">创建人</th>
                    <th class="left nowrap">客户名称</th>
                    <th class="left nowrap">描述</th>
                    <th class="left nowrap">状态</th>
                    <th class="right nowrap"></th>
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

@section("inline-bottom")
<script src="/statics/custom/js/ajax-public.js?v={{$release}}"></script>
<script src="/statics/custom/js/sellsManagement/sell-url.js?v={{$release}}"></script>
<script src="/statics/custom/js/sellsManagement/sellsOrder.js?v={{$release}}"></script>
@endsection