{{--继承父模板--}}
@extends("layouts.base")

@section("inline-header")
<link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/image/image.css?v={{$release}}">
@endsection
{{--重写父模板中的区块 page-main --}}
@section("page-main")
<div class="div_con_wrapper">
    <div class="actions">
        <button class="button button_action button_add"><i class="fa fa-plus"></i>添加</button>
    </div>
    <div class="searchItem" id="searchForm">
        <form class="searchMAttr searchModal formModal" id="searchImgGroup_from">
            <div class="el-item">
                <div class="el-item-show">
                    <div class="el-item-align">
                        <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label">分组名称</label>
                                <input type="text" id="name" class="el-input" placeholder="请输入分组名称" value="">
                            </div>
                        </div>
                        <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label">分组编码</label>
                                <input type="text" id="code" class="el-input" placeholder="请输入分组编码" value="">
                            </div>
                        </div>
                    </div>
                    <ul class="el-item-hide">
                        <li>
                            <div class="el-form-item">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label" style="width: 60px;">创建人</label>
                                    <input type="text" id="creator_name" class="el-input" placeholder="请输入创建人" value="">
                                </div>
                            </div>
                            <div class="el-form-item category">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label" style="width: 60px;">图纸分类</label>
                                    <div class="el-select-dropdown-wrap">
                                        <div class="el-select">
                                            <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                            <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                                            <input type="hidden" class="val_id" id="type_id" value="">
                                        </div>
                                        <div class="el-select-dropdown">
                                            <ul class="el-select-dropdown-list">
                                                <li data-id="" class="el-select-dropdown-item kong">--请选择--</li>
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
            <table id="image_group_table" class="uniquetable commontable">
                <thead>
                    <tr>
                        <th>
                            <div class="el-sort">
                                分组编码
                                <span class="caret-wrapper">
                                    <i data-key="code" data-sort="asc" class="sort-caret ascending"></i>
                                    <i data-key="code" data-sort="desc" class="sort-caret descending"></i>
                                </span>
                            </div>
                        </th>
                        <th>
                            <div class="el-sort">
                                分组名称
                                <span class="caret-wrapper">
                                    <i data-key="name" data-sort="asc" class="sort-caret ascending"></i>
                                    <i data-key="name" data-sort="desc" class="sort-caret descending"></i>
                                </span>
                            </div>
                        </th>
                        <th>关联分类</th>
                        <th>创建人</th>
                        <th>创建时间</th>
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
<script src="/statics/custom/js/image/image-url.js?v={{$release}}"></script>
<script src="/statics/common/pagenation/pagenation.js?v={{$release}}"></script>
<script src="/statics/custom/js/image/imagegroup.js?v={{$release}}"></script>
@endsection

