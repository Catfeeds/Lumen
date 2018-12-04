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
            {{--<a class="link_button" style="border: none;padding: 0;" href="${viewurl}?id=${item.material_id}"><button data-id="${item.material_id}" class="button pop-button view">查看</button></a>--}}

            <a class="link_button" href="/Device/operateUpkeeExpreience"><button class="button button_action button_check"><i class="fa fa-add"></i>添加</button></a>
        </div>
        <div class="searchItem" id="searchForm">
            <form class="searchMAttr searchModal formModal" id="searchMAttr_from">
                <div class="el-item">
                    <div class="el-item-show">
                        <div class="el-item-align">
                            <div class="el-form-item experienceType">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label">经验类别</label>
                                    <div class="el-select-dropdown-wrap">
                                        <div class="el-select">
                                            <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                            <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                                            <input type="hidden" class="val_id" id="experience_type" value="">
                                        </div>
                                        <div class="el-select-dropdown">
                                            <ul class="el-select-dropdown-list">
                                                <li data-id="" data-pid="" data-code="" data-name="--请选择--" class=" el-select-dropdown-item">--请选择--</li>
                                                <li data-id="0" data-pid="0" data-code="" data-name="" class=" el-select-dropdown-item">维修经验</li>
                                                <li data-id="1" data-pid="1" data-code="" data-name="" class=" el-select-dropdown-item">保养经验</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="el-form-item deviceType">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label">设备类别</label>
                                    <div class="el-select-dropdown-wrap">
                                        <div class="el-select">
                                            <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                            <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                                            <input type="hidden" class="val_id" id="device_type" value="">
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <ul class="el-item-hide">
                            <li>
                                <div class="el-form-item faultType">
                                    <div class="el-form-item-div">
                                        <label class="el-form-item-label">故障类别</label>
                                        <div class="el-select-dropdown-wrap">
                                            <div class="el-select">
                                                <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                                <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                                                <input type="hidden" class="val_id" id="fault_type" value="">
                                            </div>
                                        </div>
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
                                经验类别
                            </div>
                        </th>
                        <th>
                            <div class="el-sort">
                                设备类别
                            </div>
                        </th>
                        <th>
                            <div class="el-sort">
                                故障类别
                            </div>
                        </th>
                        <th>
                            <div class="el-sort">
                                设备编号
                            </div>
                        </th>
                        <th>
                            <div class="el-sort">
                                设备名称
                            </div>
                        </th>
                        <th>
                            <div class="el-sort">
                                维修级别/保养级别
                            </div>
                        </th>
                        <th>
                            <div class="el-sort">
                                故障描述/保养要求
                            </div>
                        </th>
                        <th>
                            <div class="el-sort">
                                工作描述
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
    <script src="/statics/custom/js/device/upkee-experience.js?v={{$release}}"></script>
@endsection