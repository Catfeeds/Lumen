{{--继承父模板--}}
@extends("layouts.base")

{{--额外添加的头部内容--}}
@section("inline-header")
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/qc/complaint.css?v={{$release}}">

@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")
    <div class="div_con_wrapper">
        <div class="table_page" style="margin-top: 40px;">
            <h2>根本原因</h2>
            <hr>
            <div class="wrap_table_div">
                <table id="table_attr_table" class="sticky uniquetable basictable">
                    <thead>
                    <tr>
                        <th>
                            <div class="el-sort">
                                部门
                            </div>
                        </th>
                        <th>
                            <div class="el-sort">
                                员工
                            </div>
                        </th>
                        <th class="right">
                            <button id="basic_add" class="button add"><i class="fa fa-plus"></i>添加</button>
                        </th>
                    </tr>
                    </thead>
                    <tbody class="table_tbody"></tbody>
                </table>
            </div>
        </div>
        <hr>
        <div class="table_page" style="margin-top: 40px;">
            <h2>流出原因</h2>
            <hr>
            <div class="wrap_table_div">
                <table id="table_attr_table" class="sticky uniquetable outflowtable">
                    <thead>
                    <tr>
                        <th>
                            <div class="el-sort">
                                部门
                            </div>
                        </th>
                        <th>
                            <div class="el-sort">
                                员工
                            </div>
                        </th>
                        <th class="right">
                            <button id="outflow_add" class="button add"><i class="fa fa-plus"></i>添加</button>
                        </th>
                    </tr>
                    </thead>
                    <tbody class="table_tbody"></tbody>
                </table>
            </div>
        </div>
        <hr>
        <div class="table_page" style="margin-top: 40px;">
            <h2>改善措施</h2>
            <hr>
            <div class="wrap_table_div">
                <table id="table_attr_table" class="sticky uniquetable improvetable">
                    <thead>
                    <tr>
                        <th>
                            <div class="el-sort">
                                部门
                            </div>
                        </th>
                        <th>
                            <div class="el-sort">
                                员工
                            </div>
                        </th>
                        <th class="right">
                            <button id="improve_add" class="button add"><i class="fa fa-plus"></i>添加</button>
                        </th>
                    </tr>
                    </thead>
                    <tbody class="table_tbody"></tbody>
                </table>
            </div>
        </div>
        <hr>
        <div class="table_page" style="margin-top: 40px;">
            <h2>工艺更替</h2>
            <hr>
            <div class="wrap_table_div">
                <table id="table_attr_table" class="sticky uniquetable processtable">
                    <thead>
                    <tr>
                        <th>
                            <div class="el-sort">
                                部门
                            </div>
                        </th>
                        <th>
                            <div class="el-sort">
                                员工
                            </div>
                        </th>
                        <th class="right">
                            <button id="process_add" class="button add"><i class="fa fa-plus"></i>添加</button>
                        </th>
                    </tr>
                    </thead>
                    <tbody class="table_tbody"></tbody>
                </table>
            </div>
        </div>
        <hr>
        <div class="table_page" style="margin-top: 40px;">
            <h2>改善跟踪</h2>
            <hr>
            <div class="wrap_table_div">
                <table id="table_attr_table" class="sticky uniquetable trackingtable">
                    <thead>
                    <tr>
                        <th>
                            <div class="el-sort">
                                部门
                            </div>
                        </th>
                        <th>
                            <div class="el-sort">
                                员工
                            </div>
                        </th>
                        <th class="right">
                            <button id="tracking_add" class="button add"><i class="fa fa-plus"></i>添加</button>
                        </th>
                    </tr>
                    </thead>
                    <tbody class="table_tbody"></tbody>
                </table>
            </div>
        </div>
        <hr>
        <div class="table_page" style="margin-top: 40px;">
            <h2>经验教训</h2>
            <hr>
            <div class="wrap_table_div">
                <table id="table_attr_table" class="sticky uniquetable leaningtable">
                    <thead>
                    <tr>
                        <th>
                            <div class="el-sort">
                                部门
                            </div>
                        </th>
                        <th>
                            <div class="el-sort">
                                员工
                            </div>
                        </th>
                        <th class="right">
                            <button id="leaning_add" class="button add"><i class="fa fa-plus"></i>添加</button>
                        </th>
                    </tr>
                    </thead>
                    <tbody class="table_tbody"></tbody>
                </table>
            </div>
        </div>
        <hr>
        <div class="table_page" style="margin-top: 40px;">
            <h2>重复原因</h2>
            <hr>
            <div class="wrap_table_div">
                <table id="table_attr_table" class="sticky uniquetable recurringtable">
                    <thead>
                    <tr>
                        <th>
                            <div class="el-sort">
                                部门
                            </div>
                        </th>
                        <th>
                            <div class="el-sort">
                                员工
                            </div>
                        </th>
                        <th class="right">
                            <button id="recurring_add" class="button add"><i class="fa fa-plus"></i>添加</button>
                        </th>
                    </tr>
                    </thead>
                    <tbody class="table_tbody"></tbody>
                </table>
            </div>
        </div>
        <hr>
    </div>

@endsection

{{--额外添加的底部内容--}}
@section("inline-bottom")
    <script src="/statics/custom/js/qc/qc-url.js?v={{$release}}"></script>
    <script src="/statics/common/pagenation/pagenation.js?v={{$release}}"></script>
    <script src="/statics/custom/js/qc/complaint/dispose_complaint_send.js?v={{$release}}"></script>
@endsection