{{--继承父模板--}}
@extends("layouts.base")

@section("inline-header")
<link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
<script src="/statics/custom/js/mgm_material/material-url.js?v={{$release}}"></script>
@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")
<input type="hidden" id="template_view" value="/MaterialManagement/templateView">
<input type="hidden" id="template_edit" value="/MaterialManagement/templateEdit">
<div class="div_con_wrapper">
    <div class="actions_wrap">
        <div class="actions">
            <a href="/MaterialManagement/templateCreate"><button class="button button_action button_add"><i class="fa fa-plus"></i>添加</button></a>
            <button class="button button_action look_list" style="padding-left: 4px!important;">查看列表</button>
        </div>
        <div class="actions" style="display: none;">
            <button class="button button_action back" style="padding-left: 4px!important;">返回树形结构</button>
            <a href="/MaterialManagement/templateCreate"><button class="button button_action button_add"><i class="fa fa-plus"></i>添加</button></a>
        </div>
    </div>
    <div class="searchItem hide" id="searchForm" style="display: none;">
        <form class="searchMAttr searchModal formModal" id="searchMAttr_from">
          <div class="el-item">
            <div class="el-item-show">
                <div class="el-item-align">
                    <div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label">模板编码</label>
                            <input type="text" id="code" class="el-input" placeholder="请输入编码" value="">
                        </div>
                    </div>
                  <div class="el-form-item">
                    <div class="el-form-item-div">
                        <label class="el-form-item-label">名称</label>
                        <input type="text" id="name" class="el-input" placeholder="请输入名称" value="">
                    </div>
                 </div>
                </div>
                <ul class="el-item-hide">
                    <li>
                        <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label">标签</label>
                                <input type="text" id="label" class="el-input" placeholder="请输入标签" value="">
                            </div>
                        </div>
                        <div class="el-form-item parent">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label">继承于</label>
                                <div class="el-select-dropdown-wrap">
                                    <div class="el-select">
                                        <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                        <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                                        <input type="hidden" class="val_id" id="parent_id" value="">
                                    </div>
                                </div>
                            </div>
                        </div>
                    </li>
                    <li>
                        <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label">状态</label>
                                <div class="el-select-dropdown-wrap">
                                    <div class="el-select">
                                        <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                        <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                                        <input type="hidden" class="val_id" id="status" value="">
                                    </div>
                                    <div class="el-select-dropdown">
                                        <ul class="el-select-dropdown-list">
                                            <li data-id="" class="el-select-dropdown-item kong" data-name="--请选择--">--请选择--</li>
                                            <li data-id="1" data-name="裁片" class=" el-select-dropdown-item "><span>有效</span></li>
                                            <li data-id="0" data-name="模板1号" class=" el-select-dropdown-item "><span>无效</span></li>
                                        </ul>
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
            <table id="table_template" class="sticky uniquetable commontable">
                <thead>
                    <tr>
                        <th>
                            <div class="el-sort">
                                模板编码
                                <span class="caret-wrapper">
                                    <i data-key="code" data-sort="asc" class="sort-caret ascending"></i>
                                    <i data-key="code" data-sort="desc" class="sort-caret descending"></i>
                                </span>
                            </div>
                        </th>
                        <th>
                            <div class="el-sort">
                                名称
                                <span class="caret-wrapper">
                                    <i data-key="name" data-sort="asc" class="sort-caret ascending"></i>
                                    <i data-key="name" data-sort="desc" class="sort-caret descending"></i>
                                </span>
                            </div>
                        </th>
                        <th>
                            <div class="el-sort">
                                标签
                                <span class="caret-wrapper">
                                    <i data-key="label" data-sort="asc" class="sort-caret ascending"></i>
                                    <i data-key="label" data-sort="desc" class="sort-caret descending"></i>
                                </span>
                            </div>
                        </th>
                        <th>继承于</th>
                        <th>状态</th>
                        <th class="right">操作</th>
                    </tr>
                </thead>
                <tbody class="table_tbody">
                    <tr><td style="text-align: center;" colspan="6">暂无数据</td></tr>
                </tbody>
            </table>
            <table id="table_template_tree" class="uniquetable" style="display: none;">
                <thead>
                    <tr>
                        <th>模板编码</th>
                        <th>名称</th>
                        <th>标签</th>
                        <th>状态</th>
                        <th class="right">操作</th>
                    </tr>
                </thead>
                <tbody class="table_tbody">
                    <tr><td style="text-align: center;" colspan="5">暂无数据</td></tr>
                </tbody>
            </table>
        </div>
        <div id="pagenation" class="pagenation bottom-page"></div>
    </div>
</div>
@endsection

@section("inline-bottom")
<script src="/statics/common/pagenation/pagenation.js?v={{$release}}"></script>
<script src="/statics/custom/js/mgm_material/material_basic/material-template.js?v={{$release}}"></script> 
@endsection