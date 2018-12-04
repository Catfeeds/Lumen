{{--继承父模板--}}
@extends("layouts.base")

@section("inline-header")
<link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/common/fileinput/fileinput.min.css?v={{$release}}" >
<link type="text/css" rel="stylesheet" href="/statics/common/fileinput/theme/theme.css?v={{$release}}" >
<link type="text/css" rel="stylesheet" href="/statics/custom/css/material/material-template.css?v={{$release}}" >
<link type="text/css" rel="stylesheet" href="/statics/custom/css/material/material-add.css?v={{$release}}" >
<link type="text/css" rel="stylesheet" href="/statics/custom/css/bom/log.css?v={{$release}}">
@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")
<input type="hidden" id="pic_view" value="">
<input type="hidden" id="opattr_view" value="">
<input type="hidden" id="addhtml" value="/MaterialManagement/materialCreate">
<div class="templates_wrap">
	<div class="tap-btn-wrap">
		<div class="el-tap-wrap">
			<span data-item="addMBasic_from" class="el-tap active">基础信息</span>
			<span data-item="addMAttr_from" class="el-tap">属性</span>
			<span data-item="addMPlan_from" class="el-tap">计划</span>
			<span data-item="addMPic_from" class="el-tap">图纸</span>
			<span data-item="addMFujian_from" class="el-tap">附件</span>
		</div>
		<div class="logBtnWrap">
	        <button class="log_btn none" id="showLog">显示日志</button>
	    </div>
    </div>
	<div class="el-panel-wrap" style="margin-top: 20px;">
		<div class="el-panel addMBasic_from active">
			<form id="addMBasic_from" class="formMateriel formTemplate normal">
				<div class="basic_wrap">
					<div class="categorywrap">
						<div class="el-form-item category">
							<div class="el-form-item-div">
								<label id="material_category_id" class="el-form-item-label">物料分类<span class="mustItem">*</span></label>
								<p class="errorMessage"></p>
							</div>
							<div class="categoryTree">
								<div class="bom_tree_container">
									<div class="bom-tree"></div>
								</div>
							</div>
						</div>	
					</div>
					<div class="otherwrap">
						<div class="wrap_div">
							<div class="querywrap querywrapleft" style="flex: 1;margin-right: 0;">
								<h4>基本信息</h4>
								<div class="basicwrap">
									<div>
										<div class="el-form-item">
											<div class="el-form-item-div">
												<label class="el-form-item-label">物料编码号<span class="mustItem">*</span></label>
												<input type="text" id="item_no" class="el-input" value="">
											</div>
											<p class="errorMessage" style="padding-left: 20px;"></p>
										</div>
										<div class="el-form-item">
											<div class="el-form-item-div">
												<label class="el-form-item-label">名称<span class="mustItem">*</span></label>
												<input type="text" id="name" class="el-input" value="">
											</div>
											<p class="errorMessage" style="padding-left: 20px;"></p>
										</div>
										<div class="el-form-item">
											<div class="el-form-item-div">
												<label class="el-form-item-label">标签</label>
												<input type="text" id="label" class="el-input" placeholder="" value="">
											</div>
											<p class="errorMessage" style="padding-left: 20px;"></p>
										</div>
										<div class="el-form-item">
											<div class="el-form-item-div">
												<label class="el-form-item-label">批次号前缀</label>
												<input type="text" id="batch_no_prefix" class="el-input" value="">
											</div>
											<p class="errorMessage" style="padding-left: 20px;"></p>
										</div>
										<div class="el-form-item">
											<div class="el-form-item-div">
												<label class="el-form-item-label">最小订单数量</label>
												<input type="number" min="0" id="moq" class="el-input" value="">
											</div>
											<p class="errorMessage" style="padding-left: 20px;"></p>
										</div>
										<div class="el-form-item">
											<div class="el-form-item-div">
												<label class="el-form-item-label">描述</label>
												<textarea type="textarea" maxlength="500" id="description" rows="5" class="el-textarea"></textarea>
											</div>
											<p class="errorMessage"></p>
										</div>
									</div>				
								</div>
							</div>
							<div class="querywrap querywrapright" style="flex: 1;margin-right: 0;">
								<h4>包装设置</h4>
								<div class="el-form-item unitlist">
									<div class="el-form-item-div">
										<label class="el-form-item-label">基本单位<span class="mustItem">*</span></label>
										<input type="text" id="unit_name" class="el-input" value="">
										<span class="unit"></span>
									</div>
									<p class="errorMessage" style="padding-left: 20px;"></p>
								</div>
								<div class="el-form-item">
					                <div class="el-form-item-div">
					                    <label class="el-form-item-label">最小包装数量</label>
					                    <input type="number" min="0" id="mpq" class="el-input" value="">
					                    <span class="unit"></span>
					                </div>
					                <p class="errorMessage" style="padding-left: 20px;"></p>
					            </div>
					            <div class="el-form-item">
					                <div class="el-form-item-div">
					                    <label class="el-form-item-label">最小包装重量</label>
					                    <input type="text" id="weight" class="el-input" value="">
					                    <span class="unit">[kg]</span>
					                </div>
					                <p class="errorMessage" style="padding-left: 20px;"></p>
					            </div>
					            <div class="el-form-item">
					                <div class="el-form-item-div">
					                    <label class="el-form-item-label">最小包装长度</label>
					                    <input type="text" id="length" class="el-input" value="">
					                    <span class="unit">[m]</span>
					                </div>
					                <p class="errorMessage" style="padding-left: 20px;"></p>
					            </div>
					            <div class="el-form-item">
					                <div class="el-form-item-div">
					                    <label class="el-form-item-label">最小包装宽度</label>
					                    <input type="text" id="width" class="el-input" value="">
					                    <span class="unit">[m]</span>
					                </div>
					                <p class="errorMessage" style="padding-left: 20px;"></p>
					            </div>
					            <div class="el-form-item">
					                <div class="el-form-item-div">
					                    <label class="el-form-item-label">最小包装高度</label>
					                    <input type="text" id="height" class="el-input" value="">
					                    <span class="unit">[m]</span>
					                </div>
					                <p class="errorMessage" style="padding-left: 20px;"></p>
					            </div>
							</div>
						</div>
					</div>
				</div>
			</form>
		</div>
		<div class="el-panel addMAttr_from">
			<form id="addMAttr_from" class="formMateriel formTemplate normal">
				<div class="align">
					<div class="el-form-item template">
						<div class="el-form-item-div">
							<label class="el-form-item-label">物料模板</label>
							<input type="text" id="template_name" class="el-input" value="--无--">
						</div>
						<p class="errorMessage" style="padding-left: 30px;"></p>
					</div>
				</div>
				<div class="attr-container">
					<div class="mattr-container common-con none">
						<div class="title template">
							<h4>物料属性</h4>
						</div>
						<div class="mattr-con-detail">
						</div>	
					</div>
					<div class="mgattr-container common-con none">
						<div class="title template">
							<h4>工艺属性</h4>
						</div>
						<div class="mattr-con-detail">
						</div>
					</div>
				</div>
			</form>
		</div>
		<div class="el-panel addMPlan_from">
			<form id="addMPlan_from" class="formMateriel formTemplate normal">
				<div class="wrap_div">
					<div class="querywrap querywrapleft" style="flex: 2;margin-right: 0;">
						<div class="basicwrap">
							<div>
								<div class="el-form-item source">
									<div class="el-form-item-div">
										<label class="el-form-item-label">物料来源<span class="mustItem">*</span></label>
										<div class="divwrap" style="width: 100%;">

										</div>
										<span class="unit"></span>
									</div>
									<p class="errorMessage" style="padding-left: 20px;"></p>
								</div>
								<div class="el-form-item">
									<div class="el-form-item-div">
										<label class="el-form-item-label">固定提前期</label>
										<input type="number" min="0" id="fixed_advanced_period" class="el-input" placeholder="" value="">
										<span class="unit">[天]</span>
									</div>
									<p class="errorMessage" style="padding-left: 20px;"></p>
								</div>
								<div class="el-form-item scrap">
									<div class="el-form-item-div">
										<label class="el-form-item-label">累计提前期</label>
										<input type="number" id="cumulative_lead_time" class="el-input" placeholder="" value="">
										<span class="unit">[天]</span>
									</div>
									<p class="errorMessage" style="padding-left: 20px;"></p>
								</div>
								<div class="el-form-item">
									<div class="el-form-item-div">
										<label class="el-form-item-label">低阶码</label>
										<input type="text" readonly="readonly" id="low_level_code" class="el-input" placeholder="" value="">
										<span class="unit"></span>
									</div>
									<p class="errorMessage" style="padding-left: 20px;"></p>
								</div>
							</div>	
							<div>
								<div class="el-form-item othersource">
									<div class="el-form-item-div">
										<label class="el-form-item-label">是否指定供应商</label>
										<span class="el-checkbox_input other-check ">
					                        <span class="el-checkbox-outset"></span>
					                    </span>
									</div>
									<p class="errorMessage" style="padding-left: 20px;"></p>
								</div>
								<div class="el-form-item">
									<div class="el-form-item-div">
										<label class="el-form-item-label">安全库存</label>
										<input type="number" min="0" id="safety_stock" class="el-input" placeholder="" value="">
										<span class="unit"></span>
									</div>
									<p class="errorMessage" style="padding-left: 20px;"></p>
								</div>
								<div class="el-form-item">
									<div class="el-form-item-div">
										<label class="el-form-item-label">最高库存</label>
										<input type="number" min="0" id="max_stock" class="el-input" placeholder="" value="">
										<span class="unit"></span>
									</div>
									<p class="errorMessage" style="padding-left: 20px;"></p>
								</div>
								<div class="el-form-item">
									<div class="el-form-item-div">
										<label class="el-form-item-label">最低库存</label>
										<input type="number" min="0" id="min_stock" class="el-input" placeholder="" value="">
										<span class="unit"></span>
									</div>
									<p class="errorMessage" style="padding-left: 20px;"></p>
								</div>
							</div>				
						</div>
					</div>
					<div class="querywrap querywrapright" style="flex: 1;margin-right: 0;">   
					</div>
				</div>
				<div class="showStoragePlace" id="showStoragePlace">

				</div>
			</form>
		</div>
		<div class="el-panel addMPic_from">
			<form id="addMPic_from" class="formMateriel formTemplate normal">
				<div class="picCon">
					<div class="picList ulwrap">
						<ul>
						</ul>
					</div>
				</div>
			</form>
		</div>
		<div class="el-panel addMFujian_from">
			<form id="addMFujian_from" class="formMateriel formTemplate normal">
				<div class="fujian"></div>
			</form>
		</div>
	</div>
</div>

<div class="logWrap" id="log">
    <div class="log-container">
        <div class="title">
            <span class="header">操作日志</span>
            <span class="close logClose"><i class="fa fa-close"></i></span>
        </div>
        <div class="log-content">
            <div class="log-modifier-user"></div>
            <div class="log-item-wrap">
                <div>
                    <span class="item-title"><i class="fa fa-tasks"></i>&nbsp;&nbsp;操作信息</span>
                    <div class="log-datepicker">
                        <label for="log-date"><i class="fa fa-calendar datepicker-icon"></i></label>
                        <input type="text" id="log-date" readonly class="log-datepicker-input" value="">
                    </div>
                </div>
                <div class="log-pagenation-wrap">
                    <div id="log-pagenation" class="log-pagenation"></div>
                </div>
                <div class="log-item-container">
                    <ul class="log-item-ul">
                    </ul>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection

@section("inline-bottom")
<script src="/statics/custom/js/mgm_material/material-url.js?v={{$release}}"></script>
<script src="/statics/custom/js/ajax-public.js?v={{$release}}"></script>
<script src="/statics/common/laydate/laydate.js?v={{$release}}"></script>
<script src="/statics/common/fileinput/fileinput.js?v={{$release}}"></script>
<script src="/statics/common/fileinput/theme/theme.js?v={{$release}}"></script>
<script src="/statics/common/fileinput/locales/zh.js?v={{$release}}"></script>
<script src="/statics/common/picZoom/picZoom.js?v={{$release}}"></script>
<script src="/statics/common/pagenation/pagenation.js?v={{$release}}"></script>
<script src="/statics/custom/js/mgm_material/material/material-view.js?v={{$release}}"></script>
<script src="/statics/custom/js/mgm_material/material/log.js?v={{$release}}"></script>
@endsection