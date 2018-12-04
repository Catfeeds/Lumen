{{--继承父模板--}}
@extends("layouts.base")

@section("inline-header")
<link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/material/material-add.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/bom/bom.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/storage/allocate.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/common/laydate/theme/default/laydate.css?v={{$release}}">
@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")
<div class="storage_wrap">
	<div class="tap-btn-wrap">
		<div class="el-form-item btnShow saveBtn">
			<div class="el-form-item-div btn-group">
				<button type="button" class="el-button el-button--primary submit save" style="margin-right: 20px; margin-bottom: 10px;">保存</button>
			</div>
		</div>
	</div>
</div>
<form id="addSBasic_form" class="formTemplate formStorage normal">
	<div class="storage_blockquote">
		<h4>客户信息</h4>
		<div class="basic_info">
			<div>
				<div class="el-form-item">
					<div class="el-form-item-div">
						<label class="el-form-item-label">客户编码<span class="mustItem">*</span></label>
						<input type="text" id="customerNum" class="el-input" placeholder="请选择客户编码" value="" style="width: 178px;">
						<span class="fa fa-table pos-icon bom-add-item customer choose-material"></span>
					</div>
					<p class="errorMessage" style="padding-left: 30px;"></p>
				</div>
				<div class="el-form-item">
					<div class="el-form-item-div">
						<label class="el-form-item-label">客户名称</label>
						<input type="text" id="customerName" class="el-input" placeholder="" value="" style="width: 178px;">
					</div>
					<p class="errorMessage" style="padding-left: 30px;"></p>
				</div>
				<div class="el-form-item">
					<div class="el-form-item-div">
						<label class="el-form-item-label">公司</label>
						<input type="text" id="company" class="el-input" placeholder="" value="" style="width: 178px;">
					</div>
					<p class="errorMessage" style="padding-left: 30px;"></p>
				</div>

			</div>

			<div>
                <div class="el-form-item">
					<div class="el-form-item-div">
						<label class="el-form-item-label">销售单编码<span class="mustItem">*</span></label>
						<input type="text" readonly="readonly" id="code" class="el-input" placeholder="请输入销售单编码" value="">
					</div>
					<p class="errorMessage" style="padding-left: 30px;"></p>
				</div>
				<div class="el-form-item">
					<div class="el-form-item-div">
						<label class="el-form-item-label">职位</label>
						<input type="text" id="position" class="el-input" placeholder="" value="">
					</div>
					<p class="errorMessage" style="padding-left: 30px;"></p>
				</div>

				<div class="el-form-item">
					<div class="el-form-item-div">
						<label class="el-form-item-label">手机号</label>
						<input type="text" id="phonenum" class="el-input" placeholder="" value="">
					</div>
					<p class="errorMessage" style="padding-left: 30px;"></p>
				</div>

				<div class="el-form-item">
					<div class="el-form-item-div">
						<label class="el-form-item-label">邮箱</label>
						<input type="text" id="email" class="el-input" placeholder="" value="">
					</div>
					<p class="errorMessage" style="padding-left: 30px;"></p>
				</div>

			</div>
			<div>
				<div class="el-form-item">
					<div class="el-form-item-div">
						<label class="el-form-item-label">地址</label>
						<input type="text" id="address" class="el-input" placeholder="" value="">
					</div>
					<p class="errorMessage" style="padding-left: 30px;"></p>
				</div>
				<div class="el-form-item">
					<div class="el-form-item-div">
						<label class="el-form-item-label">标签</label>
						<input type="text" id="lable" class="el-input" placeholder="" value="">
					</div>
					<p class="errorMessage" style="padding-left: 30px;"></p>
				</div>
				<div class="el-form-item">
					<div class="el-form-item-div">
						<label class="el-form-item-label">描述</label>
						<textarea type="textarea" maxlength="500" id="remark" rows="5" class="el-textarea" placeholder="请输入描述，最多只能输入500字"></textarea>
					</div>
					<p class="errorMessage" style="padding-left: 20px;"></p>
				</div>
			</div>
		</div>
	</div>
	<div class="storage_blockquote">
		<h4 style="font-size: 14px; margin-top: 10px; margin-bottom: 10px;">明细 <button type="button" id="edit-add-btn" class="storage-button storage-add-item storage-add-new-item">添加明细</button></h4>
		<div class="basic_info">
			<div class="table-container">
				<table class="storage_table item_table">
					<thead>
						<tr>
							<th class="thead">物料编码</th>
                            <th class="thead">名称</th>
                            <th class="thead">数量<span class="mustItem" style="color: red;">*</span></th>
                            <th class="thead">单位</th>
                            <th class="thead">截止日期<span class="mustItem" style="color: red;">*</span></th>
                            <th class="thead">简要描述</th>
                            <th class="thead"></th>
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
	</form>	
</div>
</div>
@endsection

@section("inline-bottom")
<script src="/statics/common/laydate/laydate.js"></script>
<script src="/statics/custom/js/ajax-public.js?v={{$release}}"></script>
<script src="/statics/custom/js/validate.js?v={{$release}}"></script>
<script src="/statics/common/pagenation/pagenation.js?v={{$release}}>"></script>
<script src="/statics/custom/js/sellsManagement/sell-url.js?v={{$release}}"></script>
<script src="/statics/custom/js/sellsManagement/sellOrder-edit.js?v={{$release}}"></script>
@endsection