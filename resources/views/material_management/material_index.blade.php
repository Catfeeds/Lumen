{{--继承父模板--}}
@extends("layouts.base")

@section("inline-header")
<link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")
<input type="hidden" id="material_view" value="/MaterialManagement/materialView">
<input type="hidden" id="material_edit" value="/MaterialManagement/materialEdit">
<div class="div_con_wrapper">
    <div class="actions">
        <a href="/MaterialManagement/materialCreate"><button class="button button_action button_add"><i class="fa fa-plus"></i>添加</button></a>
    </div>
    <div class="searchItem" id="searchForm">
        <form class="searchMAttr searchModal formModal" id="searchMAttr_from">
          <div class="el-item">
            <div class="el-item-show">
                <div class="el-item-align">
                    <div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label">物料编码</label>
                            <input type="text" id="item_no" class="el-input" placeholder="请输入物料编码" value="">
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
                                <label class="el-form-item-label">创建人</label>
                                <input type="text" id="creator_name" class="el-input" placeholder="请输入创建人" value="">
                            </div>
                        </div>
                        <div class="el-form-item template">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label">物料模板</label>
                                <div class="el-select-dropdown-wrap">
                                    <div class="el-select">
                                        <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                        <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                                        <input type="hidden" class="val_id" id="template_id" value="">
                                    </div>
                                </div>
                            </div>
                        </div>
                    </li>
                    <li>
                        <div class="el-form-item category" style="width: 100%;">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label">物料分类</label>
                                <div class="el-select-dropdown-wrap">
                                    <div class="el-select">
                                        <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                        <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                                        <input type="hidden" class="val_id" id="material_category_id" value="">
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
                                物料编码
                                <span class="caret-wrapper">
                                    <i data-key="item_no" data-sort="asc" class="sort-caret ascending"></i>
                                    <i data-key="item_no" data-sort="desc" class="sort-caret descending"></i>
                                </span>
                            </div>
                        </th>
                        <th>
                            名称
                        </th>
                        <th>
                            创建人
                        </th>
                        <th>
                            <div class="el-sort">
                                物料分类
                                <span class="caret-wrapper">
                                    <i data-key="category_id" data-sort="asc" class="sort-caret ascending"></i>
                                    <i data-key="category_id" data-sort="desc" class="sort-caret descending"></i>
                                </span>
                            </div>
                        </th>
                        <th>
                            <div class="el-sort">
                                物料模板
                                <span class="caret-wrapper">
                                    <i data-key="template_id" data-sort="asc" class="sort-caret ascending"></i>
                                    <i data-key="template_id" data-sort="desc" class="sort-caret descending"></i>
                                </span>
                            </div>
                        </th>
                        <th>
                            <div class="el-sort">
                                创建时间
                                <span class="caret-wrapper">
                                    <i data-key="ctime" data-sort="asc" class="sort-caret ascending"></i>
                                    <i data-key="ctime" data-sort="desc" class="sort-caret descending"></i>
                                </span>
                            </div>
                        </th>
                        <th>
                            <div class="el-sort">
                                修改时间
                                <span class="caret-wrapper">
                                    <i data-key="mtime" data-sort="asc" class="sort-caret ascending"></i>
                                    <i data-key="mtime" data-sort="desc" class="sort-caret descending"></i>
                                </span>
                            </div>
                        </th>
                        <th class="right">
                            操作
                        </th>
                    </tr>
                </thead>
                <tbody class="table_tbody"></tbody>
            </table>
        </div>
        <div id="pagenation" class="pagenation bottom-page"></div>
    </div>
</div>
@endsection

@section("inline-bottom")
<script src="/statics/custom/js/mgm_material/material-url.js?v={{$release}}"></script>
<script src="/statics/custom/js/ajax-public.js?v={{$release}}"></script>
<script src="/statics/common/pagenation/pagenation.js?v={{$release}}"></script>
<script src="/statics/custom/js/mgm_material/material/material.js?v={{$release}}"></script>
@endsection