{{--继承父模板--}}
@extends("layouts.base")

{{--额外添加的头部内容--}}
@section("inline-header")
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/device/device.css?v={{$release}}">
    <link type="text/css" rel="stylesheet" href="/statics/common/laydate/theme/default/laydate.css?v={{$release}}">

@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")

    <div class="div_con_wrapper">

        <div class="actions">
            <a href="/Deveice/repairs"><button id="faulty_add" class="button"><i class="fa fa-plus"></i>添加</button></a>
        </div>
        <div class="searchItem" id="searchForm">
            <form class="searchMAttr searchModal formModal" id="searchMAttr_from">
                <div class="el-item">
                    <div class="el-item-show">
                        <div class="el-item-align">
                            <div class="el-form-item">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label">设备编码</label>
                                    <input type="text" id="device_code" class="el-input" placeholder="设备编码" value="">
                                </div>
                            </div>
                            <div class="el-form-item">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label">设备名称</label>
                                    <input type="text" id="device_name" class="el-input" placeholder="请输入名称" value="">
                                </div>
                            </div>
                        </div>
                        <ul class="el-item-hide">
                            <li>
                                <div class="el-form-item deviceType">
                                    <div class="el-form-item-div">
                                        <label class="el-form-item-label">故障类别</label>
                                        <div class="el-select-dropdown-wrap">
                                            <div class="el-select">
                                                <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                                <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                                                <input type="hidden" class="val_id" id="device_type" value="">
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
            <div class="wrap_table_div" style="overflow: hidden;min-height: 500px;">
                <table id="workhour_table" class="sticky uniquetable commontable">
                    <thead>
                    <tr>
                        <th class="left nowrap tight">单号</th>
                        <th class="left nowrap tight">审核人</th>
                        <th class="left nowrap tight">报修状态</th>
                        <th class="left nowrap tight">处理状态</th>
                        <th class="left nowrap tight">维修单号</th>
                        <th class="left nowrap tight">设备编号</th>
                        <th class="left nowrap tight">设备名称</th>
                        <th class="left nowrap tight">规格型号</th>
                        <th class="left nowrap tight">使用部门</th>
                        <th class="left nowrap tight">发生时间</th>
                        <th class="left nowrap tight">创建时间</th>
                        <th class="left nowrap tight">维修组</th>
                        <th class="left nowrap tight">故障等级</th>
                        <th class="left nowrap tight">故障类别</th>
                        <th class="left nowrap tight">故障描述</th>
                        <th class="right nowrap tight">操作</th>
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
    <script src="/statics/common/pagenation/pagenation.js"></script>
    <script src="/statics/custom/js/device/device-url.js?v={{$release}}"></script>
    <script src="/statics/custom/js/device/device-repairs.js?v={{$release}}"></script>
    <script src="/statics/common/laydate/laydate.js"></script>
@endsection