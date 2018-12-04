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
            <button class="button button_action button_check"><i class="fa fa-add"></i>添加</button>
        </div>
        <div class="searchItem" id="searchForm">
            <form class="searchMAttr searchModal formModal" id="searchMAttr_from">
                <div class="el-item">
                    <div class="el-item-show">
                        <div class="el-item-align">
                            <div class="el-form-item">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label">编号</label>
                                    <input type="text" id="option_code" class="el-input" placeholder="请输入编号" value="">
                                </div>
                            </div>
                            <div class="el-form-item type">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label">类别</label>
                                    <div class="el-select-dropdown-wrap">
                                        <div class="el-select">
                                            <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                            <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                                            <input type="hidden" class="val_id" id="category" value="">
                                        </div>
                                    </div>
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
            <div class="wrap_table_div">
                <table id="table_attr_table" class="sticky uniquetable commontable">
                    <thead>
                    <tr>
                        <th>
                            <div class="el-sort">
                                选型
                                {{--<span class="caret-wrapper">--}}
                                    {{--<i data-key="order_id" data-sort="asc" class="sort-caret ascending"></i>--}}
                                    {{--<i data-key="order_id" data-sort="desc" class="sort-caret descending"></i>--}}
                                {{--</span>--}}
                            </div>
                        </th>
                        <th>
                            <div class="el-sort">
                                编号
                                {{--<span class="caret-wrapper">--}}
                                    {{--<i data-key="material_id" data-sort="asc" class="sort-caret ascending"></i>--}}
                                    {{--<i data-key="material_id" data-sort="desc" class="sort-caret descending"></i>--}}
                                {{--</span>--}}
                            </div>
                        </th>

                        <th>
                            <div class="el-sort">
                                类别
                            </div>
                        </th>
                        <th>
                            <div class="el-sort">
                                描述
                            </div>
                        </th>
                        <th class="right">操作</th>
                    </tr>
                    </thead>
                    <tbody class="table_tbody"></tbody>
                </table>
            </div>
            <div id="pagenation" class="pagenation bottom-page"></div>
        </div>
    </div>
@endsection

{{--额外添加的底部内容--}}
@section("inline-bottom")
    <script src="/statics/common/pagenation/pagenation.js"></script>
    <script src="/statics/custom/js/device/device-url.js?v={{$release}}"></script>
    <script src="/statics/custom/js/device/other-opthion.js?v={{$release}}"></script>
@endsection