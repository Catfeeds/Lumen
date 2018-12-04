{{--继承父模板--}}
@extends("layouts.base")

{{--额外添加的头部内容--}}
@section("inline-header")
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")
    <div class="div_con_wrapper">
        <div class="searchItem" id="searchForm">
            <form class="searchMAttr searchModal formModal" id="searchMAttr_from">
                <div class="el-item">
                    <div class="el-item-show">
                        <div class="el-item-align">
                            <div class="el-form-item">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label">客诉单号</label>
                                    <input type="text" id="complaint_code" class="el-input" placeholder="客诉单号" value="">
                                </div>
                            </div>
                            <div class="el-form-item">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label">客户名</label>
                                    <input type="text" id="customer_name" class="el-input" placeholder="客户名" value="">
                                </div>
                            </div>
                        </div>
                        <ul class="el-item-hide">
                            <li>
                                <div class="el-form-item">
                                    <div class="el-form-item-div">
                                        <label class="el-form-item-label">审核状态</label>
                                        <div class="el-select-dropdown-wrap">
                                            <div class="el-select">
                                                <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                                <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                                                <input type="hidden" class="val_id" id="status" value="">
                                            </div>
                                            <div class="el-select-dropdown">
                                                <ul class="el-select-dropdown-list">
                                                    <li data-id="" data-code="" data-name="--请选择--" class=" el-select-dropdown-item">--请选择--</li>
                                                    <li data-id="1" data-code="" data-name="--未审核--" class=" el-select-dropdown-item">--未审核--</li>
                                                    <li data-id="2" data-code="" data-name="--审核中--" class=" el-select-dropdown-item">--审核中--</li>
                                                    <li data-id="3" data-code="" data-name="--审核不通过--" class=" el-select-dropdown-item">--审核不通过--</li>
                                                    <li data-id="4" data-code="" data-name="--审核通过--" class=" el-select-dropdown-item">--审核通过--</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="el-form-item">
                                    <div class="el-form-item-div">
                                        <label class="el-form-item-label">完结状态</label>
                                        <div class="el-select-dropdown-wrap">
                                            <div class="el-select">
                                                <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                                <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                                                <input type="hidden" class="val_id" id="over_status" value="0">
                                            </div>
                                            <div class="el-select-dropdown">
                                                <ul class="el-select-dropdown-list">
                                                    <li data-id="0" data-code="" data-name="--请选择--" class=" el-select-dropdown-item">--请选择--</li>
                                                    <li data-id="1" data-code="" data-name="--客诉归档--" class=" el-select-dropdown-item">--客诉归档--</li>
                                                    <li data-id="2" data-code="" data-name="--客诉终止--" class=" el-select-dropdown-item">--客诉终止--</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </li>

                        </ul>
                    </div>

                    <div class="el-form-item">
                        <div class="el-form-item-div btn-group" style="margin-top: 13px;">
                            <span class="arrow el-select"><i class="el-input-icon el-icon el-icon-caret-top"></i></span>
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
                                客诉单号

                            </div>
                        </th>
                        <th>
                            <div class="el-sort">
                                客户名

                            </div>
                        </th>
                        <th>
                            <div class="el-sort">
                                接収日期
                            </div>
                        </th>
                        <th>
                            <div class="el-sort">
                                不良品接収日期
                            </div>
                        </th>
                        <th>
                            <div class="el-sort">
                                状态
                            </div>
                        </th>

                        <th>
                            <div class="el-sort">
                                创建时间
                            </div>
                        </th>
                        <th class="right"></th>
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
    <script src="/statics/custom/js/qc/qc-url.js?v={{$release}}"></script>
    <script src="/statics/custom/js/qc/complaint/view_complaint.js?v={{$release}}"></script>
@endsection