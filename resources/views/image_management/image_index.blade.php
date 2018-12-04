{{--继承父模板--}}
@extends("layouts.base")

@section("inline-header")
<link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/material/material-template.css?v={{$release}}" >
<link type="text/css" rel="stylesheet" href="/statics/custom/css/image/image.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/bom/bom.css?v={{$release}}">
@endsection
{{--重写父模板中的区块 page-main --}}
@section("page-main")
<input type="hidden" id="editurl" value="/ImageManagement/updateImage">
<div class="div_con_wrapper">
    <div class="actions">
        <a href="/ImageManagement/addImage"><button class="button button_action button_add"><i class="fa fa-plus"></i>添加</button></a>
    </div>
    <div class="searchItem" id="searchForm">
        <form class="searchMAttr searchModal formModal" id="searchImgGroup_from">
            <div class="el-item">
                <div class="el-item-show">
                    <div class="el-item-align">
                        <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label" style="width: 109px;">编码</label>
                                <input type="text" id="code" class="el-input" placeholder="请输入编码" value="">
                            </div>
                        </div>
                        <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label" style="width: 109px;">名称</label>
                                <input type="text" id="image_orgin_name" class="el-input" placeholder="请输入名称" value="">
                            </div>
                        </div>
                    </div>
                    <ul class="el-item-hide">
                        <li>
							<div class="el-form-item" style="width: 100%;">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label" style="width: 109px;">创建时间</label>
                                    <span class="el-input span start_time"><span id="start_time_input"></span><input type="text" id="start_time" placeholder="开始时间" value=""></span>——
                                    <span class="el-input span end_time"><span id="end_time_input"></span><input type="text" id="end_time" placeholder="结束时间" value=""></span>
                                </div>
                            </div>
                        </li>
                        <li>
                            <div class="el-form-item">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label" style="width: 109px;">创建人</label>
                                    <input type="text" id="creator_name" class="el-input" placeholder="请输入创建人" value="">
                                </div>
                            </div>
                            <div class="el-form-item category">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label" style="width: 109px;">图纸来源</label>
                                    <div class="el-select-dropdown-wrap">
                                        <div class="el-select">
                                            <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                            <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                                            <input type="hidden" class="val_id" id="category_id" value="">
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
                        <li>
                            <div class="el-form-item type">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label" style="width: 109px;">图纸分类</label>
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
                            <div class="el-form-item group">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label" style="width: 109px;">图纸分组</label>
                                    <div class="el-select-dropdown-wrap">
                                        <div class="el-select">
                                            <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                            <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                                            <input type="hidden" class="val_id" id="group_id" value="">
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
                        <li>
                            <div class="el-form-item">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label" style="width: 109px;">销售编码</label>
                                    <input type="text" id="sale_order_code" class="el-input" placeholder="请输入销售编码" value="">
                                </div>
                            </div>
                            <div class="el-form-item">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label" style="width: 109px;">物料号</label>
                                    <input type="text" id="material_code" class="el-input" placeholder="请输入物料号" value="">
                                </div>
                            </div>
                        </li>
                        <li>
                            <div class="el-form-item template_attr" style="">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label" style="width: 109px;">图纸属性</label>
                                    <div class="template_attr_wrap clearfix">
                                    </div>
                                    <!--<input type="text" id="material_attr_id"  class="el-input" placeholder="" value="">-->
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
            <table id="image_table" class="uniquetable commontable">
                <thead>
                    <tr>
                    	<th>缩略图</th>
                    	<th>图纸编码</th>
                        <th>图纸名称</th>
                       	<th>图纸来源</th>
                        <th>创建人</th>
                        <th>创建时间</th>
                        <th class="right">操作</th>
                    </tr>
                </thead>
                <tbody class="table_tbody">
                    <tr><td style="text-align: center;" colspan="7">暂无数据</td></tr>
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
<script src="/statics/common/laydate/laydate.js"></script>
<script src="/statics/custom/js/image/image.js?v={{$release}}"></script>
@endsection

