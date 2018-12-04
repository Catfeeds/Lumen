{{--继承父模板--}}
@extends("layouts.base")

{{--额外添加的头部内容--}}
@section("inline-header")
<link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/common/fileinput/fileinput.min.css">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/personnel/personnel.css?v={{$release}}">
@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")
<input type="hidden" id="employee_edit" value="employeeEdit">
<input type="hidden" id="employee_view" value="employeeView">
<div class="div_con_wrapper">

    <div class="actions">
        <a href="/Personnel/employeeCreate"><button id="department_add" class="button"><i class="fa fa-plus"></i>添加</button></a>
        <button id="export_excel" class="button"><i class="fa fa-file-o"></i>导入</button>
        <!-- <button id="download_excel" class="button"><i class="fa fa-download"></i>下载模板</button> -->
        <a href='' id="download_excel" class="button"><i class="fa fa-download"></i>下载模板</a>
    </div>

    <div class="searchItem" id="searchForm">
        <form class="searchMAttr searchModal formModal" id="searchEmploAttr_from">
            <div class="el-item">
                <div class="el-item-show">
                    <div class="el-item-align">
                        <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label">姓名</label>
                                <input type="text" id="name" class="el-input" placeholder="请输入姓名" value="" onkeyup="value=value.replace(/\#/g,'')">
                            </div>
                        </div>
                        <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label">卡号</label>
                                <input type="text" id="cardNumber" class="el-input" placeholder="请输入卡号" value="" onkeyup="value=value.replace(/\#/g,'')">
                            </div>
                        </div>
                    </div>
                    <ul class="el-item-hide">
                        <li>
                            <div class="el-form-item">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label">创建人</label>
                                    <input type="text" id="admin_name" class="el-input" placeholder="请输入创建人" value="">
                                    <!--<div class="el-select-dropdown-wrap">-->
                                        <!--<div class="el-select">-->
                                            <!--<i class="el-input-icon el-icon el-icon-caret-top"></i>-->
                                            <!--<input type="text" readonly="readonly" class="el-input" value="&#45;&#45;请选择&#45;&#45;">-->
                                            <!--<input type="hidden" class="val_id" id="creator" value="">-->
                                        <!--</div>-->
                                        <!--<div class="el-select-dropdown">-->
                                            <!--<ul class="el-select-dropdown-list">-->
                                                <!--<li data-id="" class="el-select-dropdown-item kong" data-name="&#45;&#45;请选择&#45;&#45;">&#45;&#45;请选择&#45;&#45;</li>-->
                                            <!--</ul>-->
                                        <!--</div>-->
                                    <!--</div>-->
                                </div>
                            </div>
                            <div class="el-form-item">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label">职位</label>
                                    <div class="el-select-dropdown-wrap">
                                        <div class="el-select">
                                            <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                            <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                                            <input type="hidden" class="val_id" id="job" value="">
                                        </div>
                                        <div class="el-select-dropdown" id="position">
                                            <ul class="el-select-dropdown-list">
                                                <li data-id="" class="el-select-dropdown-item kong" data-name="--请选择--">--请选择--</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <!--<div class="el-form-item">-->
                                <!--<div class="el-form-item-div">-->
                                    <!--<label class="el-form-item-label">绑定角色</label>-->
                                    <!--<div class="el-select-dropdown-wrap">-->
                                        <!--<div class="el-select">-->
                                            <!--<i class="el-input-icon el-icon el-icon-caret-top"></i>-->
                                            <!--<input type="text" readonly="readonly" class="el-input" value="&#45;&#45;请选择&#45;&#45;">-->
                                            <!--<input type="hidden" class="val_id" id="adminRole" value="">-->
                                        <!--</div>-->
                                        <!--<div class="el-select-dropdown" id="role">-->
                                            <!--<ul class="el-select-dropdown-list">-->
                                                <!--<li data-id="" class="el-select-dropdown-item kong" data-name="&#45;&#45;请选择&#45;&#45;">&#45;&#45;请选择&#45;&#45;</li>-->
                                            <!--</ul>-->
                                        <!--</div>-->
                                    <!--</div>-->
                                <!--</div>-->
                            <!--</div>-->
                        </li>
                        <li>
                            <div class="el-form-item">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label">性别</label>
                                    <div class="el-radio-group">
                                        <label class="el-radio">
                                            <span class="el-radio-input">
                                                <span class="el-radio-inner"></span>
                                                <input class="status yes" type="hidden" value="1">
                                            </span>
                                            <span class="el-radio-label">男</span>
                                        </label>
                                        <label class="el-radio">
                                            <span class="el-radio-input">
                                                <span class="el-radio-inner"></span>
                                                <input class="status no" type="hidden" value="2">
                                            </span>
                                            <span class="el-radio-label">女</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <div class="el-form-item">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label">当前状态</label>
                                    <div class="el-select-dropdown-wrap">
                                        <div class="el-select">
                                            <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                            <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                                            <input type="hidden" class="val_id" id="currentState" value="">
                                        </div>
                                        <div class="el-select-dropdown" id="status">
                                            <ul class="el-select-dropdown-list">
                                                <li data-id="" class="el-select-dropdown-item kong" data-name="--请选择--">--请选择--</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </li>
                        <li>
                            <!--<div class="el-form-item">-->
                                <!--<div class="el-form-item-div">-->
                                    <!--<label class="el-form-item-label">职位</label>-->
                                    <!--<div class="el-select-dropdown-wrap">-->
                                        <!--<div class="el-select">-->
                                            <!--<i class="el-input-icon el-icon el-icon-caret-top"></i>-->
                                            <!--<input type="text" readonly="readonly" class="el-input" value="&#45;&#45;请选择&#45;&#45;">-->
                                            <!--<input type="hidden" class="val_id" id="job" value="">-->
                                        <!--</div>-->
                                        <!--<div class="el-select-dropdown" id="position">-->
                                            <!--<ul class="el-select-dropdown-list">-->
                                                <!--<li data-id="" class="el-select-dropdown-item kong" data-name="&#45;&#45;请选择&#45;&#45;">&#45;&#45;请选择&#45;&#45;</li>-->
                                            <!--</ul>-->
                                        <!--</div>-->
                                    <!--</div>-->
                                <!--</div>-->
                            <!--</div>-->
                            <!--<div class="el-form-item">-->
                                <!--<div class="el-form-item-div">-->
                                    <!--<label class="el-form-item-label">部门</label>-->
                                    <!--<div class="el-select-dropdown-wrap">-->
                                        <!--<div class="el-select">-->
                                            <!--<i class="el-input-icon el-icon el-icon-caret-top"></i>-->
                                            <!--<input type="text" readonly="readonly" class="el-input" value="&#45;&#45;请选择&#45;&#45;">-->
                                            <!--<input type="hidden" class="val_id" id="department" value="">-->
                                        <!--</div>-->
                                        <!--<div class="el-select-dropdown" id="dept">-->
                                            <!--<ul class="el-select-dropdown-list">-->
                                                <!--<li data-id="" class="el-select-dropdown-item kong" data-name="&#45;&#45;请选择&#45;&#45;">&#45;&#45;请选择&#45;&#45;</li>-->
                                            <!--</ul>-->
                                        <!--</div>-->
                                    <!--</div>-->
                                <!--</div>-->
                            <!--</div>-->
                        </li>
                        <li>
                            <div class="el-form-item">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label">手机</label>
                                    <input type="text" id="phone" class="el-input" placeholder="请输入手机" value="">
                                </div>
                            </div>
                            <div class="el-form-item">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label">邮箱</label>
                                    <input type="text" id="email" class="el-input" placeholder="请输入邮箱" value="">
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
            <table id="table_employee_table" class="sticky uniquetable commontable">
                <thead>
                    <tr>
                        <th class="left nowrap tight">卡号</th>
                        <th class="left nowrap tight">姓名</th>
                        <th class="left nowrap tight">性别</th>
                        <!--<th class="left nowrap tight">绑定角色</th>-->
                        <th class="left nowrap tight">创建人</th>
                        <th class="left nowrap tight">当前状态</th>
                        <th class="left nowrap tight">部门</th>
                        <th class="left nowrap tight">职位</th>
                        <th class="left nowrap tight">手机</th>
                        <th class="left nowrap tight">邮箱</th>
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
    <script src="http://oss.sheetjs.com/js-xlsx/xlsx.full.min.js"></script>
    <script src="/statics/custom/js/custom-config.js?v={{$release}}"></script>
<script src="/statics/common/fileinput/fileinput.js"></script>
<!--<script src="/statics/common/fileinput/theme/theme.js"></script>-->
<script src="/statics/common/fileinput/locales/zh.js"></script>
<script src="/statics/custom/js/personnel/personnel-url.js?v={{$release}}"></script>
<script src="/statics/common/pagenation/pagenation.js"></script>
<script src="/statics/custom/js/personnel/employee.js?v={{$release}}"></script>
@endsection