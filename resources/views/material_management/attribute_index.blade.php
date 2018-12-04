{{--继承父模板--}}
@extends("layouts.base")

@section("inline-header")
<link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/material/material-attribute.css?v={{$release}}">
@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")
<div class="div_con_wrapper">
    <div class="actions">
        <button class="button button_action button_add"><i class="fa fa-plus"></i>添加</button>
    </div>
    <div class="searchItem" id="searchForm">
        <form class="searchMAttr searchModal formModal" id="searchMAttr_from">
          <div class="el-item">
            <div class="el-item-show">
                <div class="el-item-align">
                    <div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label">键值</label>
                            <input type="text" id="key" data-name="键值" class="el-input" placeholder="请输入键值" value="" onkeyup="value=value.replace(/\#/g,'')">
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
                      <div class="el-form-item datatype">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label">数据类型</label>
                            <div class="el-select-dropdown-wrap">
                                <div class="el-select">
                                    <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                    <input type="text" readonly="readonly" id="unitval" class="el-input" value="--请选择--">
                                    <input type="hidden" class="val_id" id="datatype_id" value="">
                                </div>
                            </div>
                        </div>
                      </div>
                    </li>
                    <li>
                        <div class="el-form-item unit">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label">单位</label>
                                <div class="el-select-dropdown-wrap">
                                    <div class="el-select">
                                        <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                        <input type="text" readonly="readonly" id="unitval" class="el-input" value="--请选择--">
                                        <input type="hidden" class="val_id" id="unit_id" value="">
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
                                键值
                                <span class="caret-wrapper">
                                    <i data-key="key" data-sort="asc" class="sort-caret ascending"></i>
                                    <i data-key="key" data-sort="desc" class="sort-caret descending"></i>
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
                        <th>数据类型</th>
                        <th>单位</th>
                        <th class="right">操作</th>
                    </tr>
                </thead>
                <tbody class="table_tbody">
                    <tr><td style="text-align: center;" colspan="6">暂无数据</td></tr>
                </tbody>
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
<script src="/statics/custom/js/mgm_material/material_basic/material-attribute.js?v={{$release}}"></script>
@endsection

