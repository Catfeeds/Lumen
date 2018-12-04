{{--继承父模板--}}
@extends("layouts.base")

@section("inline-header")
<link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/material/material-attribute.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/account/account.css?v={{$release}}">
@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")
<div class="div_con_wrapper">
    <div class="actions">
        <button class="button button_action button_add"><i class="fa fa-plus"></i>添加</button>
    </div>
    <div class="searchItem" id="searchForm">
        <form class="searchMAttr searchModal formModal" id="searchRole_from">
            <div class="el-item">
                <div class="el-item-show">
                    <div class="el-item-align">
                        <div class="el-form-item" style="width: 33.3%;">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label">账户名称</label>
                                <input type="text" id="name" class="el-input" placeholder="请输入账户名称" value="">
                            </div>
                        </div>
                        <div class="el-form-item" style="width: 33.3%;">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label">姓名</label>
                                <input type="text" id="cn_name" class="el-input" placeholder="请输入姓名" value="">
                            </div>
                        </div>
                        <div class="el-form-item" style="width: 33.3%;">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label">状态</label>
                                <div class="el-select-dropdown-wrap">
                                    <div class="el-select">
                                        <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                        <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                                        <input type="hidden" class="val_id" id="status" value="">
                                    </div>
                                    <div class="el-select-dropdown">
                                        <ul class="el-select-dropdown-list">
                                            <li data-id="" class="el-select-dropdown-item kong" data-name="--请选择--">--请选择--</li>
                                            <li data-id="1" class=" el-select-dropdown-item"><span>已激活</span></li>
                                            <li data-id="0" class=" el-select-dropdown-item"><span>已关闭</span></li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="el-form-item">
                    <div class="el-form-item-div btn-group" style="margin-top: 13px;">
                        <button type="button" class="el-button el-button--primary submit">搜索</button>
                        <button type="button" class="el-button reset">重置</button>
                    </div>
                </div>
            </div>
        </form>
    </div>
    <div class="table_page">
        <div class="wrap_table_div">
            <table id="table_attr_table" class="sticky uniquetable commontable">
                <thead>
                    <tr>
                        <th>头像</th>
                        <th>
                            <div class="el-sort">
                                账户名称
                                <span class="caret-wrapper">
                                    <i data-key="name" data-sort="asc" class="sort-caret ascending"></i>
                                    <i data-key="name" data-sort="desc" class="sort-caret descending"></i>
                                </span>
                            </div>
                        </th>
                        <th>姓名</th>
                        <th>邮箱</th>
                        <th>手机号</th>
                        <th>上次登录时间</th>
                        <th>状态</th>
                        <th class="right">操作</th>
                    </tr>
                </thead>
                <tbody class="table_tbody">
                    <tr><td style="text-align: center;" colspan="8">暂无数据</td></tr>
                </tbody>
            </table>
        </div>
        <div id="pagenation" class="pagenation bottom-page admin"></div>
    </div>
</div>   
@endsection

@section("inline-bottom")
<script src="/statics/custom/js/account/account-url.js?v={{$release}}"></script>
<script src="/statics/custom/js/ajax-public.js?v={{$release}}"></script>
<script src="/statics/common/pagenation/pagenation.js?v={{$release}}"></script>
<script src="/statics/custom/js/account/admin.js?v={{$release}}"></script>
@endsection

