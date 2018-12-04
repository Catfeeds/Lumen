{{--继承父模板--}}
@extends("layouts.base")

{{--额外添加的头部内容--}}
@section("inline-header")
<link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/storage/storage-initial-add.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/storage/allocate.css?v={{$release}}">
<link type="text/css"  rel="stylesheet" href="/statics/custom/css/bom/routing.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/bom/routing.css?v={{$release}}">

@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")

<form id="addSTinit_form" class="formStorage" dataflag="view">
	<div class="el-form-item">
		<div class="el-form-item-div">
			<label class="el-form-item-label" style="width: 100px;">工单</label>
			<input type="text" style="border: 0; background: none;" readonly="readonly" id="wo_number" class="el-input" placeholder="" value="" style="border: hidden;">
		</div>
		<p class="errorMessage" style="padding-left: 20px;"></p>
	</div>
	<div class="el-form-item">
		<div class="el-form-item-div">
			<label class="el-form-item-label" style="width: 100px;">工艺单</label>
			<input type="text" readonly="readonly" id="wt_number" class="el-input" placeholder="" value="" style="border: hidden;">
			<!-- <button data-id="" type="button" class="button pop-button attrview">查看</button> -->
		</div>
		<button data-id="" type="button" class="button pop-button attrview">查看</button>
		<button data-id="" type="button" class="button pop-button printAttr">打印工艺单</button>
	</div>
	<div class="qrcode-conten">
		<div id="qrcode" style="width:110px; height:110px;">
			<div id="qrCodeIco"></div>
		</div>
	</div>


	<div class="storage_blockquote">
		<h3 style="font-size: 14px; font-weight: bold;">消耗品</h3>
			<div class="basic_info">
				<div class="table-container">
					<table class="storage_table item_table table-bordered">
						<thead>
							<tr>
								<th class="thead">编码</th>
								<th class="thead">名称</th>
								<th class="thead">数量</th>
								<th class="thead">单位</th>
								<th class="thead">属性</th>
								<th class="thead">图纸</th>
							</tr>
						</thead>
						<tbody class="t-body">
							<tr>
								<td class="nowrap" colspan="11" style="text-align: center;">暂无数据</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>
    </div>
    <div class="storage_blockquote">
	  <h3 style="font-size: 14px; font-weight: bold;">产成品</h3>
		<div class="basic_info">
			<div class="table-container">
				<table class="storage_table item_table_out table-bordered">
					<thead>
						<tr>
							<th class="thead">编码</th>
							<th class="thead">名称</th>
							<th class="thead">数量</th>
							<th class="thead">单位</th>
							<th class="thead">属性</th>
							<th class="thead">图纸</th>
						</tr>
					</thead>
					<tbody class="t-body">
						<tr>
							<td class="nowrap" colspan="11" style="text-align: center;">暂无数据</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
    </div>
</form>

@endsection

{{--额外添加的底部内容--}}
@section("inline-bottom")
<script src="/statics/custom/js/validate.js?v={{$release}}"></script>
<script src="/statics/custom/js/product_order/product-url.js?v={{$release}}"></script>
<script src="/statics/custom/js/product_order/work-order-view.js?v={{$release}}"></script>
<script src="/statics/custom/js/product_order/qrcode.js?v={{$release}}"></script>
<script src="/statics/common/print/jQuery.print.js?v={{$release}}"></script>
@endsection
