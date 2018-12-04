{{--继承父模板--}}
@extends("layouts.base")

{{--额外添加的头部内容--}}
@section("inline-header")
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/device/upkee-require.css?v={{$release}}">
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
                            <div class="el-form-item deviceType">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label">设备类型</label>
                                    <div class="el-select-dropdown-wrap">
                                        <div class="el-select">
                                            <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                            <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                                            <input type="hidden" class="val_id" id="type" value="">
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="el-form-item">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label">保养部位</label>
                                    <input type="text" id="upkee_part" class="el-input" placeholder="请输入保养部位" value="">
                                </div>
                            </div>
                        </div>
                        <ul class="el-item-hide">
                            <li>
                                <div class="el-form-item">
                                    <div class="el-form-item-div">
                                        <label class="el-form-item-label">保养标准</label>
                                        <input type="text" id="upkee_require" class="el-input" placeholder="请输入保养标准" value="">
                                    </div>
                                </div>
                            </li>
                        </ul>

                    </div>
                    <div class="el-form-item">
                        <div class="el-form-item-div btn-group" style="margin-top: 10px;">
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
                                设备类型
                            </div>
                        </th>
                        <th>
                            <div class="el-sort">
                                保养部位
                            </div>
                        </th>
                        <th>
                            <div class="el-sort">
                                保养标准
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
    <script src="/statics/custom/js/device/upkee-require.js?v={{$release}}"></script>
@endsection