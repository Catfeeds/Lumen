{{--继承父模板--}}
@extends("layouts.base")

{{--额外添加的头部内容--}}
@section("inline-header")
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/implement/encoding.css?v={{$release}}">
@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")
<!-- 物料编码 -->
<div class="code_wrap">
	<div class="el-tap-wrap" style="display: block;">
		<span data-item="addCode_from" class="el-tap active">编号设置</span>
		<span data-item="lookNumber_from" class="el-tap">查看流水号</span>
	</div>
	<div class="el-panel-wrap">
		<div class="el-panel addCode_from active">
			<div class="panel-left"></div>
			<div class="panel-right">
				<div class="addCode panel-div">
					<form id="addCode_from" class="formMateriel formTemplate normal">
						<div class="info">
							<fieldset>
							    <legend>详细信息</legend>
							    <div class="el-form-item">
					                <div class="el-form-item-div">
					                	<span class="el-checkbox_input" data-set="1" data-post="0">
				                            <span class="el-checkbox-outset"></span>
				                        </span>
					                    <label>完全手工编号</label>
					                </div>
					            </div>
					            <div class="el-form-item">
					                <div class="el-form-item-div">
					                	<span class="el-checkbox_input" data-set="2" data-post="1">
				                            <span class="el-checkbox-outset"></span>
				                        </span>
					                    <label>自动生成编号，允许手工改动</label>
					                </div>
					            </div>
					            <div class="el-form-item">
					                <div class="el-form-item-div">
					                	<span class="el-checkbox_input" data-set="3" data-post="2">
				                            <span class="el-checkbox-outset"></span>
				                        </span>
					                    <label>自动生成编号，不允许手工改动</label>
					                </div>
					            </div>
					            <div class="el-form-item">
					                <div class="el-form-item-div">
					                	<span class="el-checkbox_input" data-set="4" data-post="1">
				                            <span class="el-checkbox-outset"></span>
				                        </span>
					                    <label>单前缀不固定长度</label>
					                </div>
					            </div>
					            <table>
									<thead>
										<tr><th></th><th>长度</th><th>规则</th><th>分隔符</th></tr>
									</thead>
									<tbody>
										<tr class="tr-prefix">
											<td>
												<div class="el-form-item prefix one" data-input="prefix_one">
													<div class="el-form-item-div">
														<label class="lable-text">前缀1</label>
														<div class="divwrap">
															<div class="el-select-dropdown-wrap">
								                                <div class="el-select">
								                                    <i class="el-input-icon el-icon el-icon-caret-top"></i>
								                                    <span class="el-input">--请选择--</span>
								                                    <input type="hidden" class="val_id" id="prefix1" value="">
								                                </div>
								                            </div>
														</div>
													</div>
												</div>
											</td>
											<td>
												<div class="el-form-item">
													<div class="el-form-item-div">
														<input type="number" min="1" id="prefix1_length" readonly="readonly" class="el-input length prefixlength" placeholder="" value="">
													</div>
												</div>
											</td>
											<td>
												<div class="el-form-item rule one">
													<div class="el-form-item-div">
														<input type="text" class="el-input rule val_id" readonly="readonly" placeholder="" value="">
													</div>
												</div>
											</td>
											<td>
												<div class="el-form-item prefix_symbol" data-input="prefix1_symbol">
													<div class="el-form-item-div">
														<div class="divwrap">
															<div class="el-select-dropdown-wrap">
								                                <div class="el-select">
								                                    <i class="el-input-icon el-icon el-icon-caret-top"></i>
								                                    <span class="el-input">--请选择--</span>
								                                    <input type="hidden" class="val_id" id="prefix1_symbol" value="0">
								                                </div>
								                                <div class="el-select-dropdown">
														            <ul class="el-select-dropdown-list">
														            	<li data-id="0" class="el-select-dropdown-item kong">--请选择--</li>
														            </ul>
														        </div>
								                            </div>
														</div>
													</div>
												</div>
											</td>
										</tr>
										<tr class="tr-prefix">
											<td>
												<div class="el-form-item prefix two" data-input="prefix_two">
													<div class="el-form-item-div">
														<label class="lable-text">前缀2</label>
														<div class="divwrap">
															<div class="el-select-dropdown-wrap">
								                                <div class="el-select">
								                                    <i class="el-input-icon el-icon el-icon-caret-top"></i>
								                                    <span class="el-input">--请选择--</span>
								                                    <input type="hidden" class="val_id" id="prefix2" value="">
								                                </div>
								                            </div>
														</div>
													</div>
												</div>
											</td>
											<td>
												<div class="el-form-item">
													<div class="el-form-item-div">
														<input type="number" min="1" id="prefix2_length" readonly="readonly" class="el-input length prefixlength" placeholder="" value="">
													</div>
												</div>
											</td>
											<td>
												<div class="el-form-item rule two">
													<div class="el-form-item-div">
														<input type="text" class="el-input rule val_id" readonly="readonly" placeholder="" value="">
													</div>
												</div>
											</td>
											<td>
												<div class="el-form-item prefix_symbol" data-input="prefix2_symbol">
													<div class="el-form-item-div">
														<div class="divwrap">
															<div class="el-select-dropdown-wrap">
								                                <div class="el-select">
								                                    <i class="el-input-icon el-icon el-icon-caret-top"></i>
								                                    <span class="el-input">--请选择--</span>
								                                    <input type="hidden" class="val_id" id="prefix2_symbol" value="0">
								                                </div>
								                                <div class="el-select-dropdown">
														            <ul class="el-select-dropdown-list">
														            	<li data-id="0" class="el-select-dropdown-item kong">--请选择--</li>
														            </ul>
														        </div>
								                            </div>
														</div>
													</div>
												</div>
											</td>
										</tr>
										<tr class="tr-prefix">
											<td>
												<div class="el-form-item prefix three" data-input="prefix_three">
													<div class="el-form-item-div">
														<label class="lable-text">前缀3</label>
														<div class="divwrap">
															<div class="el-select-dropdown-wrap">
								                                <div class="el-select">
								                                    <i class="el-input-icon el-icon el-icon-caret-top"></i>
								                                    <span class="el-input">--请选择--</span>
								                                    <input type="hidden" class="val_id" id="prefix3" value="">
								                                </div>
								                            </div>
														</div>
													</div>
												</div>
											</td>
											<td>
												<div class="el-form-item">
													<div class="el-form-item-div">
														<input type="number" min="1" id="prefix3_length" readonly="readonly" class="el-input length prefixlength" placeholder="" value="">
													</div>
												</div>
											</td>
											<td>
												<div class="el-form-item rule three">
													<div class="el-form-item-div">
														<input type="text" class="el-input rule val_id" readonly="readonly" placeholder="" value="">
													</div>
												</div>
											</td>
											<td>
												<div class="el-form-item prefix_symbol" data-input="prefix3_symbol">
													<div class="el-form-item-div">
														<div class="divwrap">
															<div class="el-select-dropdown-wrap">
								                                <div class="el-select">
								                                    <i class="el-input-icon el-icon el-icon-caret-top"></i>
								                                    <span class="el-input">--请选择--</span>
								                                    <input type="hidden" class="val_id" id="prefix3_symbol" value="0">
								                                </div>
								                                <div class="el-select-dropdown">
														            <ul class="el-select-dropdown-list">
														            	<li data-id="0" class="el-select-dropdown-item kong">--请选择--</li>
														            </ul>
														        </div>
								                            </div>
														</div>
													</div>
												</div>
											</td>
										</tr>
										<tr>
											<td>
												<div class="el-form-item num">
													<div class="el-form-item-div">
														<label class="lable-text">流水号</label>
														<div style="margin-left: 20px;">
															<label>长度<span class="mustItem">*</span></label>
															<input type="number" id="serial_number_length" min="1" class="el-input length active" placeholder="" value="6">
														</div>
													</div>
												</div>
											</td>
											<td>
												<div class="el-form-item num">
													<div class="el-form-item-div">
														<label>起始值</label>
														<input type="number" id="serial_number_start" class="el-input start" placeholder="" value="0">
													</div>
												</div>
											</td>
											<td>
												<div class="el-form-item num">
													<div class="el-form-item-div">
														<label>步长</label>
														<input type="number" id="serial_number_step" min="1" class="el-input" placeholder="" value="1">
													</div>
												</div>
											</td>
										</tr>
									</tbody>
					            </table>
							</fieldset>
						</div>
						<div class="preview">
							<fieldset>
							    <legend>编号预览</legend>
								<div class="previewdiv">
									<div class="el-form-item preview">
										<div class="el-form-item-div">
											<label>档案编码=</label>
											<input readonly="readonly" type="text" class="el-input prefix_input prefix_one" placeholder="" value="">
											<span> + </span>
											<input readonly="readonly" type="text" class="el-input prefix_input prefix_two" placeholder="" value="">
											<span> + </span>
											<input readonly="readonly" type="text" class="el-input prefix_input prefix_three" placeholder="" value="">
											<span> + </span>
											<input readonly="readonly" type="text" class="el-input serial_num" placeholder="" value="">
										</div>
									</div>
									<div class="el-form-item out">
										<div class="el-form-item-div">
											<label>效果</label>
											<input style="width: 530px;" readonly="readonly" type="text" class="el-input previewout" placeholder="" value="">
										</div>
									</div>
								</div>
							</fieldset>
						</div>
						<div class="el-form-item flex-end">
							<div class="el-form-item-div btn-group" style="margin-right: 20px;">
								<button type="button" class="el-button el-button--primary submit">保存</button>
							</div>
						</div>
					</form>
				</div>
			</div>
		</div>
		<div class="el-panel lookNumber_from">
			<div class="panel-left">
				<ul class="treeul">
					<li class="treeli">
						<div class="title-item" data-type="lookNum" data-item="" title="基础编码"><i class="fa fa-folder-o"></i>基础编码</div>
						<ul class="ctreeul">
							<li class="treeli"><div class="title-item" data-type="lookNum" data-item="otherNum" title="潜在客户编码"><i class="line"></i><i class="fa fa-file-o"></i>潜在客户编码</div></li>
							<li class="treeli"><div class="title-item" data-type="lookNum" data-item="otherNum" title="客户编码"><i class="line"></i><i class="fa fa-file-o"></i>客户编码</div></li>
							<li class="treeli"><div class="title-item" data-type="lookNum" data-item="otherNum" title="人员编码"><i class="line"></i><i class="fa fa-file-o"></i>人员编码</div></li>
							<li class="treeli"><div class="title-item" data-type="lookNum" data-item="materialNum" title="物料编码"><i class="line"></i><i class="fa fa-file-o"></i>物料编码</div></li>
							<li class="treeli"><div class="title-item" data-type="lookNum" data-item="otherNum" title="职位"><i class="line"></i><i class="fa fa-file-o"></i>职位</div></li>
							<li class="treeli"><div class="title-item" data-type="lookNum" data-item="otherNum" title="人员工号"><i class="line"></i><i class="fa fa-file-o"></i>人员工号</div></li>
							<li class="treeli"><div class="title-item" data-type="lookNum" data-item="otherNum" title="班组编码"><i class="line"></i><i class="fa fa-file-o"></i>班组编码</div></li>
							<li class="treeli"><div class="title-item" data-type="lookNum" data-item="otherNum" title="供应商编码"><i class="line"></i><i class="fa fa-file-o"></i>供应商编码</div></li>
						</ul>
					</li>
				</ul>
			</div>
			<div class="panel-right">
				<div class="materialNum lookNum panel-div">
					<table class="bordered">
						<thead><tr><th></th><th>级次</th><th>编码</th><th>流水号</th></tr></thead>
						<tbody><tr><td></td><td></td><td></td><td></td></tr></tbody>
					</table>
				</div>
			</div>
		</div>
	</div>
</div>
@endsection

{{--额外添加的底部内容--}}
@section("inline-bottom")
<script src="/statics/custom/js/encoding/encoding-url.js?v={{$release}}"></script>
<script src="/statics/custom/js/encoding/encoding.js?v={{$release}}"></script>
@endsection