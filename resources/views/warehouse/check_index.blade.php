{{--继承父模板--}}
@extends("layouts.base")

@section("inline-header")
<link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/storage/storage.css?v={{$release}}">
<input type="hidden" id="checkindex_check" value="storageCheckAdd">
@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")
<div class="div_con_wrapper">
	<div class="actions">
        <div style="display: inline-block;position: relative;">   
            <form><input id="fileInput" class="button button_action button_import" type="file" name="file" style="position: absolute;z-index: 999;width: 46px;opacity: 0;">
                <button id="storage_check_import" class="button button_action button_import">文件导入</button>
            </form>
        </div>
        <div style="display: inline-block;position: relative;">  
            <button><a id="export_link" class="button button_action button_export" download="导出" href="/storagecheck/exportExcel?_token=8b5491b17a70e24107c89f37b1036078">导出</a></button>
            <!-- <a class="button button_action button_export" download="导出" href="/storagecheck/exportExcel?_token=8b5491b17a70e24107c89f37b1036078">导出</a> -->
       </div>
            <button id="storage_initial_auditing" class="button button_auditing">批量审核</button>
        </div>
        <div class="searchItem" id="searchForm">
	        <form class="searchSTinit searchModal formModal" id="searchSTinit_from">
	          <div class="el-item">
	            <div class="el-item-show">
	                <div class="el-item-align">
	                    <div class="el-form-item">
	                    <div class="el-form-item-div">
	                        <label class="el-form-item-label">物料编码</label>
	                        <input type="text" id="material_item_no" class="el-input" placeholder="请输入物料编码" value="">
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
                                <label class="el-form-item-label">厂区名</label>
                                <input type="text" id="plant_name" class="el-input" placeholder="请输入厂区名称" value="">
                            </div>
                        </div>
                        <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label">仓库名</label>
                                <input type="text" id="depot_name" class="el-input" placeholder="请输入仓库名" value="">
                            </div>
                        </div>
	                    </li>
	                    <li>
	                        <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label">分区名</label>
                                <input type="text" id="subarea_name" class="el-input" placeholder="请输入厂区名称" value="">
                            </div>
                        </div>
                        <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label">仓位名</label>
                                <input type="text" id="bin_name" class="el-input" placeholder="请输入仓位名" value="">
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
	                    <th class="left nowrap tight">订单编号</th>
	                    <th class="left nowrap tight">物料编码</th>
	                    <th class="left nowrap tight">物料名称</th>
	                    <th class="left nowrap tight">单位</th>
	                    <th class="left nowrap tight">数量</th>
	                    <th class="left nowrap tight">批次号</th>
	                    <th class="left nowrap tight">厂区</th>
	                    <th class="left nowrap tight">仓库</th>
	                    <th class="left nowrap tight">厂区</th>
	                    <th class="left nowrap tight">仓位</th>
	                    <th class="left nowrap tight">锁状态</th>
	                    <th class="left nowrap tight">所有者</th>
	                    <th class="left nowrap tight"></th>
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
<script src="/statics/custom/js/storage/storage-url.js?v={{$release}}"></script>
<script src="/statics/custom/js/ajax-public.js?v={{$release}}"></script>
<script src="/statics/common/pagenation/pagenation.js?v={{$release}}"></script>
<script src="/statics/custom/js/storage/storage-check-index.js?v={{$release}}"></script>
@endsection
