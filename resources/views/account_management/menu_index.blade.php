{{--继承父模板--}}
@extends("layouts.base")

@section("inline-header")
<link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/account/account.css?v={{$release}}">
@endsection
{{--重写父模板中的区块 page-main --}}
@section("page-main")
<div class="div_con_wrapper">
    <div class="actions">
        <button class="button button_action button_add"><i class="fa fa-plus"></i>添加</button>
        <button class="button button_action button_clear"><i class="fa fa-refresh"></i>清空缓存</button>
        <button class="button button_action button_init"><i class="fa fa-wrench"></i>菜单初始化</button>
    </div>
    <div class="table_page">
        <div class="wrap_table_div" style="overflow: hidden;min-height: 500px;">
            <table id="table_categories_table" class="uniquetable">
                <thead>
                    <tr>
                        <th>菜单名称</th>
                        <th>字体标签</th>
                        <th>资源定位符</th>
                        <th>归属资源</th>
                        <th>排序</th>
                        <th style="min-width: 56px;">状态</th>
                        <th class="right">操作</th>
                    </tr>
                </thead>
                <tbody class="table_tbody">
                    <tr><td style="text-align: center;" colspan="7">暂无数据</td></tr>
                </tbody>
            </table>
        </div>
    </div>
</div>

@endsection

@section("inline-bottom")
<script src="/statics/custom/js/account/account-url.js?v={{$release}}"></script>
<script src="/statics/custom/js/account/menu.js?v={{$release}}"></script>
@endsection

