{{--继承父模板--}}
@extends("layouts.base")

@section("inline-header")
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
    <script src="/statics/custom/js/qc/qc-url.js?v={{$release}}"></script>
@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")
    <div class="templates_wrap">
        <div class="el-tap-wrap edit">
            <span data-item="addMTemplate_from" id="addMTemplate_from" class="el-tap"></span>
        </div>
        <div class="el-panel-wrap" style="margin-top: 20px;">
            <div class="div_con_wrapper">
                <div class="actions">
                    <button class="button button_action button_add"><i class="fa fa-plus"></i>添加检验项</button>
                </div>
                <div class="table_page">
                    <div class="wrap_table_div" style="overflow: hidden;min-height: 500px;">
                        <table id="table_type_table" class="uniquetable">
                            <thead>
                            <tr>
                                <th>检验项</th>
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
        </div>
    </div>
@endsection

@section("inline-bottom")
    <script src="/statics/custom/js/qc/qc_basic/qc-template.js?v={{$release}}"></script>
@endsection
