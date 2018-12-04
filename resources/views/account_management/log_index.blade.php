{{--继承父模板--}}
@extends("layouts.base")

@section("inline-header")
<link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")
<div class="div_con_wrapper">
    <div class="searchItem" id="searchForm" style="">
        <form class="searchMAttr searchModal formModal" id="searchLoginLog_from">
            <div class="el-item">
                <div class="el-item-show">
                    <div class="el-item-align">
                        <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label">账户名</label>
                                <input type="text" id="admin_name" class="el-input" placeholder="请输入账户名" value="">
                            </div>
                        </div>
                        <div class="el-form-item">
		                    <div class="el-form-item-div btn-group" style="margin-top: 5px;">
		                        <button type="button" class="el-button el-button--primary submit">搜索</button>
		                        <button type="button" class="el-button reset">重置</button>
		                    </div>
		                </div>
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
                        <th>账户名</th>
                        <th>登录IP</th>
                        <th>登录时间</th>
                    </tr>
                </thead>
                <tbody class="table_tbody">
                    <tr><td style="text-align: center;" colspan="4">暂无数据</td></tr>
                </tbody>
            </table>
        </div>
        <div id="pagenation" class="pagenation bottom-page"></div>
    </div>
</div>   
@endsection

@section("inline-bottom")
<script src="/statics/custom/js/account/account-url.js?v={{$release}}"></script>
<script src="/statics/custom/js/ajax-public.js?v={{$release}}"></script>
<script src="/statics/common/pagenation/pagenation.js?v={{$release}}"></script>
<script src="/statics/custom/js/account/log.js?v={{$release}}"></script>
@endsection

