
{{--继承父模板--}}
@extends("layouts.base")

@section("inline-header")
<link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/common/fileinput/fileinput.min.css">
<link type="text/css" rel="stylesheet" href="/statics/common/fileinput/theme/theme.css">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/practice/work_way.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/practice/img_upload.css?v={{$release}}">
@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")
<div class="div_con_wrapper">
    <div class="work_way_wrap">
        <div class="procedure_list">
            <h5>工序列表</h5>
            <ul></ul></div>
        <div class="work_way_relation">
            <div class="search_wrap searchItem" id="searchForm">
                <form class="searchMAttr searchModal formModal">
                    <div class="el-item">
                        <div class="el-item-show">
                            <div class="el-item-align">
                                <div class="el-form-item">
                                    <div class="el-form-item-div">
                                        <label class="el-form-item-label">编码</label>
                                        <input type="text" id="searchCode" class="el-input" placeholder="请输入编码" value="">
                                    </div>
                                </div>
                                <div class="el-form-item">
                                    <div class="el-form-item-div">
                                        <label class="el-form-item-label">名称</label>
                                        <input type="text" id="searchName" class="el-input" placeholder="请输入名称" value="">
                                    </div>
                                </div>
                            </div>
                            <ul class="el-item-hide">
                                <li>
                                    <div class="el-form-item pracTice">
                                        <div class="el-form-item-div">
                                            <label class="el-form-item-label">做法分类</label>
                                            <div class="el-select-dropdown-wrap">
                                                <div class="el-select">
                                                    <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                                    <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                                                    <input type="hidden" class="val_id" id="practice_category_id" value="">
                                                </div>
                                                <div class="el-select-dropdown">
                                                    <ul class="el-select-dropdown-list">
                                                        <li data-id="" class="el-select-dropdown-item kong" data-name="--请选择--">--请选择--</li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="el-form-item proCate">
                                        <div class="el-form-item-div">
                                            <label class="el-form-item-label">产品分类</label>
                                            <div class="el-select-dropdown-wrap">
                                                <div class="el-select">
                                                    <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                                    <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                                                    <input type="hidden" class="val_id" id="product_type_id" value="">
                                                </div>
                                                <div class="el-select-dropdown">
                                                    <ul class="el-select-dropdown-list">
                                                        <li data-id="" class="el-select-dropdown-item kong" data-name="--请选择--">--请选择--</li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                                <li>
                                    <div class="el-form-item search_descSelect">
                                        <div class="el-form-item-div">
                                            <label class="el-form-item-label">用处</label>
                                            <div class="el-select-dropdown-wrap">
                                                <div class="el-select">
                                                    <div class="selectValue desc"></div>
                                                    <input type="hidden" class="val_id" id="search_description_id" value="">
                                                </div>
                                                <div class="el-select-dropdown">
                                                    <ul class="el-select-dropdown-list">
                                                        <li data-id="" class="el-select-dropdown-item kong proceDisabled" data-name="--请选择--">--请选择--</li>

                                                    </ul>
                                                </div>
                                            </div>
                                            <!--<input type="text" id="searchUse" class="el-input" placeholder="请输入用处" value="">-->
                                        </div>
                                    </div>
                                </li>
                            </ul>
                        </div>
                        <div class="el-form-item">
                            <div class="el-form-item-div btn-group" style="margin-top: 10px;">
                                <span class="arrow el-select"><i class="el-input-icon el-icon el-icon-caret-top"></i></span>
                                <button type="button" class="el-button el-button--primary submit search">搜索</button>
                                <button type="button" class="el-button reset">重置</button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
            <div class="work_way_list">
                <div class="list_wrap">
                    <button class="button operation_add">添加</button>
                    <ul class="way_list"></ul>
                </div>
                <div class="way_wrap">
                    <div class="display_basic_info">
                        <div>
                            <div class="el-form-item" style="margin-right: 10px">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label" style="width: 100px;">编码</label>
                                    <span></span>
                                </div>
                                <p class="errorMessage" style="padding-left: 100px;display: block"></p>
                            </div>
                            <div class="el-form-item" style="margin-right: 10px">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label" style="width: 100px;">名称</label>
                                    <span></span>
                                </div>
                                <p class="errorMessage" style="padding-left: 100px;display: block"></p>
                            </div>
                            <div class="el-form-item desc">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label" style="width: 110px;">图纸集合</label>
                                    <button class="button img_collection" data-id="${id}">查看图纸集合</button>
                                </div>
                                <p class="errorMessage" style="padding-left: 100px;display: block"></p>
                            </div>
                        </div>
                        <div>
                            <div class="el-form-item mate">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label" style="width: 110px;">物料分类</label>
                                    <span></span>
                                </div>
                                <p class="errorMessage" style="padding-left: 100px;display: block"></p>
                            </div>
                            <div class="el-form-item desc">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label" style="width: 110px;">用处</label>
                                    <span></span>
                                </div>
                                <p class="errorMessage" style="padding-left: 100px;display: block"></p>
                            </div>
                        </div>
                        <div>
                            <div class="el-form-item proCate">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label" style="width: 110px;">产品分类</label>
                                    <span></span>
                                </div>
                                <p class="errorMessage" style="padding-left: 100px;display: block"></p>
                            </div>
                            <div class="el-form-item proCate">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label" style="width: 110px;">做法分类</label>
                                    <span></span>
                                </div>
                                <p class="errorMessage" style="padding-left: 100px;display: block"></p>
                            </div>
                        </div>
                    </div>
                    <table class="sticky uniquetable commontable">
                        <thead>
                        <tr>
                            <th class="left nowrap tight">序号</th>
                            <th class="left nowrap tight">步骤</th>
                            <th class="left nowrap tight">图纸名称</th>
                            <th class="left nowrap tight">图纸</th>
                            <th class="left nowrap tight">图纸属性</th>
                            <th class="left nowrap tight">标准工艺</th>
                        </tr>
                        </thead>
                        <tbody class="table_tbody"></tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
    <div class="practice_line_wrap">
        <h5>做法线</h5>
        <div class="practice_line"></div>
    </div>
</div>
@endsection

@section("inline-bottom")
<script src="/statics/common/fileinput/fileinput.js"></script>
<script src="/statics/common/fileinput/theme/theme.js"></script>
<script src="/statics/common/fileinput/locales/zh.js"></script>
<script src="/statics/common/pagenation/pagenation.js"></script>
<script src="/statics/custom/js/practice/work_way-url.js"></script>
<script src="/statics/custom/js/practice/work_way.js"></script>
<script src="/statics/custom/js/practice/img_upload.js"></script>
@endsection

