{{--继承父模板--}}
@extends("layouts.base")

@section("inline-header")
<link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/storage/storage.css?v={{$release}}">
@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")
<div class="div_con_wrapper">
    <div class="actions">
        <button id="storage_locate_add" class="button button_action button_add"><i class="fa fa-plus"></i>添加</button>
    </div>
    <div class="searchItem" id="searchForm">
      <form class="searchMAttr searchModal formModal" id="searchMAttr_from">
        <div class="el-item">
          <div class="el-item-show">
            <div class="el-item-align">
              <div class="el-form-item">
                <div class="el-form-item-div">
                    <label class="el-form-item-label">仓位编码</label>
                    <input type="text" id="storageNum" class="el-input" placeholder="请输入仓位编码" value="">
                </div>
            </div>
            <div class="el-form-item">
                <div class="el-form-item-div">
                    <label class="el-form-item-label">仓位名称</label>
                    <input type="text" id="storageName" class="el-input" placeholder="请输入仓位名称" value="">
                </div>
            </div>
        </div>
</div>
<div class="el-form-item">
  <div class="el-form-item-div btn-group" style="margin-top: 10px;">
    <!-- <span class="arrow el-select"><i class="el-input-icon el-icon el-icon-caret-top"></i></span> -->
    <button type="button" class="el-button el-button--primary submit">搜索</button>
    <button type="button" class="el-button reset">重置</button>
</div>
</div>
</div>
</form>
</div>

<div class="table_page">
    <div class="wrap_table_div" style="overflow: hidden;min-height: 500px;">
        <table id="table_storage_table" class="sticky uniquetable commontable">
            <thead>
                <tr>
                    <!-- <th class="left nowrap tight">NO.</th> -->
                    <th class="left nowrap tight">仓位编码</th>
                    <th class="left nowrap tight">仓位名称</th>
                    <th class="left nowrap tight">所属仓库</th>
                    <th class="left nowrap tight">所属分区</th>
                    <th class="left nowrap tight">负责人</th>
                    <!-- <th class="left nowrap tight">最大容量</th> -->
                    <th class="left nowrap tight">描述</th>
                    <!-- <th class="left nowrap tight">是否启用</th> -->
                    <th class="right nowrap tight"></th>
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
<script src="/statics/custom/js/storage/storage-locate.js?v={{$release}}"></script>
@endsection

