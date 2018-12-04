
{{--继承父模板--}}
@extends("layouts.base")

@section("inline-header")
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/procedure/procedure.css?v={{$release}}">
@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")
    <div class="div_con_wrapper">
        <div class="actions">
            <button class="button button_action" id="sendAll"><i class="fa fa-search-plus"></i>批量推送</button>
        </div>
        <div class="searchItem" id="searchForm">
            <form class="searchMAttr searchModal formModal" id="addSpecial_form">
                <div class="el-item">
                    <div class="el-item-show">
                        <div class="el-item-align">
                            <div class="el-form-item">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label">名称</label>
                                    <input type="text" id="name" class="el-input" placeholder="请输入名称" value="">
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="el-form-item">
                        <div class="el-form-item-div btn-group" style="margin-top: 10px;">
                            <button type="button" class="el-button el-button--primary submit">搜索</button>
                            <button type="button" class="el-button reset">重置</button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
        <div class="table_page">
            <div class="wrap_table_div" style="overflow: hidden;min-height: 500px;">
                <table id="practice_table" class="sticky uniquetable commontable">
                    <thead>
                    <tr>
                        <th class="left nowrap tight">
                            <span class="el-checkbox_input" id="choose_all">
                                <span class="el-checkbox-outset"></span>
                            </span>
                        </th>
                        <th class="left nowrap tight">编码</th>
                        <th class="left nowrap tight">数量</th>
                        <th class="left nowrap tight">单位</th>
                        <th class="left nowrap tight">边角料物料号</th>
                        <th class="left nowrap tight">称重日期</th>
                        <th class="left nowrap tight">状态</th>
                        <th class="right nowrap tight">操作</th>
                    </tr>
                    </thead>
                    <tbody class="table_tbody"></tbody>
                </table>
            </div>
            <div id="pagenation" class="pagenation bottom-page"></div>
        </div>
    </div>
@endsection

@section("inline-bottom")
    <script src="/statics/common/pagenation/pagenation.js?v={{$release}}"></script>
    <script src="/statics/custom/js/offcut/offcut_url.js?v={{$release}}"></script>
    <script src="/statics/custom/js/offcut/offcut_weight.js?v={{$release}}"></script>
    <script src="/statics/common/autocomplete/autocomplete-revision.js?v={{$release}}"></script>
@endsection

