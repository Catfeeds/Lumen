{{--继承父模板--}}
@extends("layouts.base")

{{--额外添加的头部内容--}}
@section("inline-header")
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">


@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")
    <div class="div_con_wrapper">
        <div class="actions">
            <button class="button button_action button_add"><i class="fa fa-plus"></i>添加</button>
        </div>

        <div class="table_page">
            <div class="wrap_table_div">
                <table id="table_attr_table" class="sticky uniquetable commontable">
                    <thead>
                    <tr>
                        <th>英文名</th>
                        <th>中文名</th>
                        <th>标签</th>
                        <th>国际标准化组织码</th>
                        <th>商业用码</th>
                        <th>工艺用码</th>
                        <th>描述</th>
                        <th class="right">操作</th>
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

{{--额外添加的底部内容--}}
@section("inline-bottom")
    <script src="/statics/custom/js/encoding/encoding-url.js?v={{$release}}"></script>
    <script src="/statics/custom/js/implement/unit_setting.js?v={{$release}}"></script>
    <script src="/statics/common/pagenation/pagenation.js?v={{$release}}"></script>
@endsection