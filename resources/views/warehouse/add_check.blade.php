{{--继承父模板--}}
@extends("layouts.base")

@section("inline-header")
<link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/storage/storage.css?v={{$release}}">
<input type="hidden" id="check_view" value="storageCheckView">
<input type="hidden" id="check_edit" value="storageCheckEdit">
@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")
<div class="div_con_wrapper">
	<div class="actions">
        <button id="storage_check_auditing" class="button button_auditing">批量审核</button>
    </div>
        <div class="searchItem" id="searchForm">
	        <form class="searchSTinit searchModal formModal" id="searchSTinit_from">
	          <div class="el-item">
	            <div class="el-item-show">
	                <div class="el-item-align">
	                    <div class="el-form-item">
	                    <div class="el-form-item-div">
	                        <label class="el-form-item-label">物料编码</label>
	                        <input type="text" id="material_item_no" class="el-input" placeholder="请输入仓库人员" value="">
	                    </div>
	                  </div>
	                    <div class="el-form-item">
	                        <div class="el-form-item-div">
	                            <label class="el-form-item-label">物料名称</label>
	                            <input type="text" id="material_name" data-name="物料名称" class="el-input" placeholder="请输入物料名称" value="">
	                        </div>
	                    </div>
	                </div>
	                <ul class="el-item-hide">
	                    <li>
	                    	<div class="el-form-item">
	                            <div class="el-form-item-div">
	                                <label class="el-form-item-label">已审核</label>
	                                <div class="el-select-dropdown-wrap">
	                                    <div class="el-select">
	                                        <i class="el-input-icon el-icon el-icon-caret-top"></i>
	                                        <input type="text" readonly="readonly" id="unitval" class="el-input" value="--请选择--">
	                                        <input type="hidden" class="val_id" id="is_audited" value="">
	                                    </div>
	                                    <div class="el-select-dropdown">
	                                        <ul class="el-select-dropdown-list">
	                                            <li data-id="" class=" el-select-dropdown-item kong">--请选择--</li>
	                                            <li data-id="1" class=" el-select-dropdown-item">是</li>
	                                            <li data-id="0" class=" el-select-dropdown-item">否</li>
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
	    <div class="wrap_table_div" style="overflow: hidden;min-height: 500px; margin-top: 10px;">
	        <table id="table_storage_table" class="sticky uniquetable commontable">
	            <thead>
	                <tr>
	                	<th class="left nowrap tight"></th>
	                	<th class="left nowrap tight">制单时间</th>
	                	<th class="left nowrap tight">订单号</th>
	                    <th class="left nowrap tight">物料编码</th>
	                    <th class="left nowrap tight">物料名称</th>
	                    <th class="left nowrap tight">单位</th>
	                    <th class="left nowrap tight">理论数量</th>
	                    <th class="left nowrap tight">真实数量</th>
	                    <th class="left nowrap tight">相差数</th>
	                    <th class="left nowrap tight">标识</th>
	                    <th class="left nowrap tight">锁状态</th>
	                    <th class="left nowrap tight"></th>
	                    <!-- <th class="left nowrap tight">差异数量</th> -->
	                    <!-- <th class="left nowrap tight">备注</th>                 
	                    <th class="left nowrap tight">锁状态</th> -->
	                </tr>
	            </thead>
	            <tbody class="table_tbody"></tbody>
	        </table>
	    </div>
	</div>
</div>
@endsection

@section("inline-bottom")
<script src="/statics/custom/js/storage/storage-url.js?v={{$release}}"></script>
<script src="/statics/custom/js/ajax-public.js?v={{$release}}"></script>
<script src="/statics/common/pagenation/pagenation.js?v={{$release}}"></script>
<script src="/statics/custom/js/storage/storage-check.js?v={{$release}}"></script>
@endsection