{{--继承父模板--}}
@extends("layouts.base")

{{--额外添加的头部内容--}}
@section("inline-header")
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/bom/bom.css?v={{$release}}">
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/product/work_task.css?v={{$release}}">
    <input type="hidden" id="workOrder_view" value="/WorkOrder/viewPickingList">
@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")
    <div class="div_con_wrapper">

        <div class="el-panel-wrap" style="margin-top: 20px;">
            <div class="searchItem" id="searchForm">
                <form class="searchSTallo searchModal formModal" id="searchSTallo_from">
                    <div class="el-item">
                        <div class="el-item-show">
                            <div class="el-item-align">
                                <div class="el-form-item">
                                    <div class="el-form-item-div">
                                        <label class="el-form-item-label">单号</label>
                                        <input type="text" id="code" class="el-input" placeholder="请输入单号" value="">
                                    </div>
                                </div>
                                <div class="el-form-item">
                                    <div class="el-form-item-div">
                                        <label class="el-form-item-label">类型</label>
                                        <input type="text" id="type_code" class="el-input" placeholder="请输入类型" value="">
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
            <div class="table_page">
                <div class="wrap_table_div" >
                    <table id="work_order_table" class="sticky uniquetable commontable">
                        <thead>
                        <tr>
                            <th class="left nowrap tight">单号</th>
                            <th class="left nowrap tight">类型</th>
                            <th class="left nowrap tight">工厂</th>
                            <th class="left nowrap tight">员工</th>
                            <th class="left nowrap tight">创建时间</th>
                            <th class="left nowrap tight">状态</th>
                            <th class="right nowrap tight">操作</th>
                        </tr>
                        </thead>
                        <tbody class="table_tbody"></tbody>
                    </table>
                </div>
                <div id="pagenation" class="pagenation unpro"></div>
            </div>
        </div>
    </div>
@endsection

{{--额外添加的底部内容--}}
@section("inline-bottom")
    <script src="/statics/custom/js/outsource/outsource-url.js?v={{$release}}"></script>
    <script src="/statics/custom/js/outsource/otusource_picking_list.js?v={{$release}}"></script>
    <script src="/statics/common/pagenation/pagenation.js?v={{$release}}"></script>
@endsection