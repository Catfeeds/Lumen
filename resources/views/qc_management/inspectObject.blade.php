{{--继承父模板--}}
@extends("layouts.base")

{{--额外添加的头部内容--}}
@section("inline-header")
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
@endsection


{{--重写父模板中的区块 page-main --}}
@section("page-main")
    <div class="div_con_wrapper">
        <input type="hidden" id="template_create" value="/QC/templateCreate">
        <div class="actions">
            <button class="button button_action button_add"><i class="fa fa-plus"></i>添加</button>
        </div>
        <div class="table_page">
            <div class="wrap_table_div" style="overflow: hidden;min-height: 500px;">
                <table id="table_type_table" class="uniquetable">
                    <thead>
                    <tr>
                        <th style="width: 30%">名称</th>
                        <th style="width: 50%">检验描述</th>
                        <th class="right">操作</th>
                    </tr>
                    </thead>
                    <tbody class="table_tbody">
                    <tr><td style="text-align: center;" colspan="3">暂无数据</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
@endsection

{{--额外添加的底部内容--}}
@section("inline-bottom")
    <script src="/statics/common/laydate/laydate.js"></script>
    <script src="/statics/custom/js/qc/qc-url.js?v={{$release}}"></script>
    <script src="/statics/custom/js/qc/qc_basic/qc-inspect.js?v={{$release}}"></script>
@endsection