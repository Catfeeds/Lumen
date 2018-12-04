{{--继承父模板--}}
@extends("layouts.base")

@section("inline-header")
<link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
<link rel="stylesheet" href="/statics/common/ace/assets/css/ui.jqgrid.min.css" />
<link type="text/css" rel="stylesheet" href="/statics/custom/css/account/jqgrid.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/account/account.css?v={{$release}}">
@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")
<div class="div_con_wrapper">
    <div class="actions">
        <button class="button button_action button_add"><i class="fa fa-plus"></i>添加</button>
    </div>
    <div class="searchItem" id="searchForm">
        <form class="searchMAttr searchModal formModal" id="searchNode_from">
            <div class="el-item">
                <div class="el-item-show">
                    <div class="el-item-align">
                        <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label">权限名称</label>
                                <input type="text" id="name" class="el-input" placeholder="请输入权限名称" value="">
                            </div>
                        </div>
                        <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label">权限路径</label>
                                <input type="text" id="node" class="el-input" placeholder="请输入权限路径" value="">
                            </div>
                        </div>    
                    </div>
                    <ul class="el-item-hide">
                        <li>
                            <div class="el-form-item">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label">权限类型</label>
                                    <div class="el-select-dropdown-wrap">
                                        <div class="el-select">
                                            <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                            <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                                            <input type="hidden" class="val_id" id="type" value="">
                                        </div>
                                        <div class="el-select-dropdown">
                                            <ul class="el-select-dropdown-list">
                                                <li data-id="" class="el-select-dropdown-item kong" data-name="--请选择--">--请选择--</li>
                                                <li data-id="1" class="el-select-dropdown-item">免登录</li>
                                                <li data-id="2" class="el-select-dropdown-item">免授权</li>
                                                <li data-id="3" class="el-select-dropdown-item">需授权</li>
                                                <li data-id="4" class="el-select-dropdown-item">管理型</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
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
                                                <li data-id="1" class=" el-select-dropdown-item "><span>启用</span></li>
                                                <li data-id="0" class=" el-select-dropdown-item "><span>关闭</span></li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </li>
                        <li>
                            <div class="el-form-item menu" style="width: 100%;">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label">菜单名称</label>
                                    <div class="el-select-dropdown-wrap">
                                        <div class="el-select">
                                            <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                            <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                                            <input type="hidden" class="val_id" id="menu_id" value="">
                                        </div>
                                        <div class="el-select-dropdown">
                                            <ul class="el-select-dropdown-list">
                                                <li data-id="0" class="el-select-dropdown-item kong" class=" el-select-dropdown-item">--请选择--</li>
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
    <div class="table_page node">
    	<div class="row">
			<div class="col-xs-12">
				<table id="grid-table"></table>
                <p class="noData none">暂无数据</p>
			</div>
    	</div>
        <div id="pagenation" class="pagenation bottom-page node"></div>
    </div>
</div>   
@endsection

@section("inline-bottom")
<script src="/statics/custom/js/account/account-url.js?v={{$release}}"></script>
<script src="/statics/custom/js/ajax-public.js?v={{$release}}"></script>
<script src="/statics/common/ace/assets/js/bootstrap-datepicker.min.js"></script>
<script src="/statics/common/ace/assets/js/jquery.jqGrid.min.js"></script>
<script src="/statics/common/ace/assets/js/grid.locale-en.js"></script>
<script src="/statics/common/autocomplete/autocomplete.js?v={{$release}}"></script>
<script src="/statics/common/pagenation/pagenation.js?v={{$release}}"></script>
<script src="/statics/custom/js/account/node.js?v={{$release}}"></script>
@endsection

