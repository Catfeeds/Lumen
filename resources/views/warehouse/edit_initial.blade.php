{{--继承父模板--}}
@extends("layouts.base")

@section("inline-header")
<link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/storage/storage-initial-add.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/common/transfer/transfer.css?v={{$release}}">
@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")
<form id="addSTinit_form" class="formStorage" dataflag="edit">
	<div class="el-form-item">
		<div class="el-form-item-div">
			<label class="el-form-item-label" style="width: 100px;">订单号</label>
			<input type="text" readonly="readonly" id="customcode" class="el-input" placeholder="" value="">
		</div>
		<p class="errorMessage" style="padding-left: 20px;"></p>
	</div>
	<div class="el-form-item">
		<div class="el-form-item-div">
			<label class="el-form-item-label" style="width: 100px;">厂区</label>
			<input type="text" readonly="readonly" id="plant_name" class="el-input" placeholder="" value="">
		</div>
		<p class="errorMessage" style="padding-left: 20px;"></p>
	</div>
	<div class="el-form-item">
		<div class="el-form-item-div">
			<label class="el-form-item-label" style="width: 100px;">仓库</label>
			<input type="text" readonly="readonly" id="depot_name" class="el-input" placeholder="" value="">
		</div>
		<p class="errorMessage" style="padding-left: 20px;"></p>
	</div>
	<div class="el-form-item">
		<div class="el-form-item-div">
			<label class="el-form-item-label" style="width: 100px;">仓区</label>
			<input type="text" readonly="readonly" id="subarea_name" class="el-input" placeholder="" value="">
		</div>
		<p class="errorMessage" style="padding-left: 20px;"></p>
	</div>
	<div class="el-form-item">
		<div class="el-form-item-div">
			<label class="el-form-item-label" style="width: 100px;">仓位</label>
			<input type="text" readonly="readonly" id="bin_name" class="el-input" placeholder="" value="">
		</div>
		<p class="errorMessage" style="padding-left: 20px;"></p>
	</div>
	<div class="el-form-item">
		<div class="el-form-item-div">
			<label class="el-form-item-label" style="width: 100px;">物料名称</label>
			<input type="text" readonly="readonly" id="material_name" class="el-input" placeholder="" value="">
		</div>
		<p class="errorMessage" style="padding-left: 20px;"></p>
	</div>
	<div class="el-form-item">
		<div class="el-form-item-div">
			<label class="el-form-item-label" style="width: 100px;">物料编码</label>
			<input type="text" readonly="readonly" id="material_number" class="el-input" placeholder="" value="">
		</div>
		<p class="errorMessage" style="padding-left: 20px;"></p>
	</div>
	<div class="el-form-item">
		<div class="el-form-item-div">
			<label class="el-form-item-label" style="width: 100px;">单位</label>
			<input type="text" readonly="readonly" id="unit_text" class="el-input" placeholder="" value="">
		</div>
		<p class="errorMessage" style="padding-left: 20px;"></p>
	</div>
	<div class="el-form-item">
		<div class="el-form-item-div">
			<label class="el-form-item-label" style="width: 100px;">数量</label>
			<input type="text" id="quantity" class="el-input" placeholder="" value="">
		</div>
		<p class="errorMessage" style="padding-left: 20px;"></p>
	</div>
	<div class="el-form-item">
		<div class="el-form-item-div">
			<label class="el-form-item-label" style="width: 100px;">单价</label>
			<input type="text" id="price" readonly="readonly" class="el-input" placeholder="" value="">
		</div>
		<p class="errorMessage" style="padding-left: 20px;"></p>
	</div>
	<div class="el-form-item">
		<div class="el-form-item-div">
			<label class="el-form-item-label" style="width: 100px;">单据日期</label>
			<input type="text" readonly="readonly" id="billdate" class="el-input" placeholder="" value="">
		</div>
		<p class="errorMessage" style="padding-left: 20px;"></p>
	</div>
	<div class="el-form-item">
		<div class="el-form-item-div">
			<label class="el-form-item-label" style="width: 100px;">锁状态</label>
			<div class="el-radio-group" id="lock_status">
				<label class="el-radio">
					<span class="el-radio-input">
						<span class="el-radio-inner"></span>
						<input class="is_lock_status yes" type="hidden" value="1">
					</span>
					<span class="el-radio-label">锁库存</span>
				</label>
				<label class="el-radio">
					<span class="el-radio-input is-radio-checked">
						<span class="el-radio-inner"></span>
						<input class="is_lock_status no" type="hidden" value="0">
					</span>
					<span class="el-radio-label">未锁库存</span>
				</label>
			</div>    
		</div>
	</div>
	<div class="el-form-item">
		<div class="el-form-item-div">
			<label class="el-form-item-label" style="width: 100px;">状态</label>
			<div class="el-radio-group" id="status">
				<label class="el-radio">
					<span class="el-radio-input">
						<span class="el-radio-inner"></span>
						<input class="is_status yes" type="hidden" value="1">
					</span>
					<span class="el-radio-label">已审核</span>
				</label>
				<label class="el-radio">
					<span class="el-radio-input is-radio-checked">
						<span class="el-radio-inner"></span>
						<input class="is_status no" type="hidden" value="-1">
					</span>
					<span class="el-radio-label">未审核</span>
				</label>
			</div>    
		</div>
	</div>
	<div class="el-form-item">
		<div class="el-form-item-div">
			<label class="el-form-item-label" style="width: 100px;">备注</label>
			<textarea type="textarea" readonly="readonly" maxlength="350" id="comment" rows="5" class="el-textarea" placeholder=""></textarea>
		</div>
		<p class="errorMessage" style="padding-left: 20px;"></p>
	</div>
	<div class="el-form-item btnShow">
		<div class="el-form-item-div btn-group" id="material_attribute_add">
			<button type="button" class="el-button el-button--primary submit add">确定</button>
		</div>
	</div>
</form>
@endsection

@section("inline-bottom")
<script src="/statics/custom/js/ajax-public.js?v={{$release}}"></script>
<script src="/statics/custom/js/storage/storage-initial-view.js?v={{$release}}"></script>
<script src="/statics/custom/js/storage/storage-initial-add.js?v={{$release}}"></script>
<script src="/statics/custom/js/storage/storage-url.js?v={{$release}}"></script>
@endsection