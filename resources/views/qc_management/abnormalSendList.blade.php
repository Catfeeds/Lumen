{{--继承父模板--}}
@extends("layouts.base")

{{--额外添加的头部内容--}}
@section("inline-header")
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")
    <div class="div_con_wrapper">
        <div class="table_page">
            <div class="wrap_table_div">
                <h2>发送相关部门</h2>
                <div class="actions">
                    <button class="button button_action button_check" style="float: right; overflow:auto  ;"><i class="fa fa-add"></i>添加</button>
                    <br style="clear: both;"/>
                </div>
                <table id="table_attr_table" class="sticky uniquetable commontable">
                    <thead>
                    <tr>
                        <th>
                            <div class="el-sort">
                                所在单位
                            </div>
                        </th>
                        <th>
                            <div class="el-sort">
                                员工
                            </div>
                        </th>
                        <th class="right"></th>
                    </tr>
                    </thead>
                    <tbody class="table_tbody"></tbody>
                </table>
            </div>
        </div>
    </div>
@endsection

{{--额外添加的底部内容--}}
@section("inline-bottom")
    <script src="/statics/custom/js/qc/qc-url.js?v={{$release}}"></script>
    <script src="/statics/custom/js/qc/abnormal/qc-abnormal-list.js?v={{$release}}"></script>
@endsection