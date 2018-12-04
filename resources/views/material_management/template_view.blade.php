
{{--继承父模板--}}
@extends("layouts.base")

{{--额外添加的头部内容--}}
@section("inline-header")
<link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/material/material-template.css?v={{$release}}" >
@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")
<div class="templates_wrap">
	<div class="el-panel-wrap" style="margin-top: 20px;">
		<div class="el-panel viewMTemplate_from active">
			<form id="viewMTemplate_from" class="formMateriel formTemplate" data-flag="view">
				<div class="el-form-item parent">
					<div class="el-form-item-div">
						<label class="el-form-item-label">基于模板</label>
						<div class="el-select-dropdown-wrap">
				            <div class="el-select">
					            <input type="text" readonly="readonly" class="el-input" value="无">
					            <input type="hidden" class="val_id" id="material_type_id" value="">
					        </div>
				        </div>
					</div>
					<p class="info"></p>
					<p class="errorMessage" style="padding-left: 20px;"></p>
				</div>
				<div class="el-form-item">
					<div class="el-form-item-div">
						<label class="el-form-item-label">代码<span class="mustItem">*</span></label>
						<input type="text" id="code" readonly="readonly" class="el-input" placeholder="" value="">
					</div>
					<p class="errorMessage" style="padding-left: 20px;"></p>
				</div>
				<div class="el-form-item">
					<div class="el-form-item-div">
						<label class="el-form-item-label">名称<span class="mustItem">*</span></label>
						<input type="text" id="name" readonly="readonly" class="el-input" placeholder="" value="">
					</div>
					<p class="errorMessage" style="padding-left: 20px;"></p>
				</div>
				<div class="el-form-item">
					<div class="el-form-item-div">
						<label class="el-form-item-label">标签</label>
						<input type="text" id="label" readonly="readonly" class="el-input" placeholder="" value="">
					</div>
					<p class="info"></p>
					<p class="errorMessage" style="padding-left: 20px;"></p>
				</div>
				<div class="el-form-item status" style="display: none;">
					<div class="el-form-item-div" >
						<label class="el-form-item-label">状态</label>
						<div class="status"></div>
					</div>
				</div>
				<div class="el-form-item">
					<div class="el-form-item-div">
						<label class="el-form-item-label">描述</label>
						<textarea type="textarea" readonly="readonly" id="description" rows="5" class="el-textarea" placeholder=""></textarea>
					</div>
					<p class="errorMessage"></p>
				</div>
				<div class="el-form-item">
					<label class="el-form-item-label">物料属性</label>
					<div class="allAttr_wrap">
						<div class="attrp_wrap">
							<p class="title">继承属性</p>
							<div class="attrWrap material_parent_attr">
							</div>
						</div>
						<div class="attr_wrap">
							<p class="title">自身属性</p>
							<div class="attrWrap material_attr">
							</div>
						</div>
					</div>
				</div>
				<div class="el-form-item">
					<label class="el-form-item-label">工艺属性</label>
					<div class="allAttr_wrap">
						<div class="op_wrap">
							<p class="title">自身属性</p>
							<div class="attrWrap op_attr">
							</div>
						</div>
					</div>
				</div>
			</form>
		</div>
	</div>
</div>    
@endsection

{{--额外添加的底部内容--}}
@section("inline-bottom")
<script src="/statics/custom/js/mgm_material/material-url.js?v={{$release}}"></script>
<script src="/statics/custom/js/ajax-public.js?v={{$release}}"></script>
<script src="/statics/custom/js/mgm_material/material_basic/material-template-view.js?v={{$release}}"></script>
@endsection