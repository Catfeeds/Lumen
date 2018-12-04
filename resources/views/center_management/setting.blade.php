{{--继承父模板--}}
@extends("layouts.base")

@section("inline-header")
<link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/common/fileinput/fileinput.min.css">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/material/material-template.css?v={{$release}}" >
<link type="text/css" rel="stylesheet" href="/statics/custom/css/center/center.css?v={{$release}}" >
@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")
<div class="templates_wrap">
	<div class="tap-btn-wrap">
		<div class="el-tap-wrap edit">
			<span data-item="editPerson_from" class="el-tap active">个人信息</span>
			<span data-item="editPwd_from" class="el-tap">修改密码</span>
		</div>
    </div>
	<div class="el-panel-wrap" style="margin-top: 20px;">		
		<div class="el-panel editPerson_from active">
			<form id="editPerson_from" class="formMateriel formTemplate normal">
				<div class="el-flex-wrap">
					<div>
						<div class="el-form-item">
							<div class="el-form-item-div">
								<label class="el-form-item-label">姓名</label>
								<input type="text" id="cn_name" class="el-input" value="">
							</div>
							<p class="errorMessage" style="padding-left: 130px;"></p>
						</div>
						<div class="el-form-item">
							<div class="el-form-item-div">
								<label class="el-form-item-label">邮箱</label>
								<input type="text" id="email" class="el-input" value="">
							</div>
							<p class="errorMessage" style="padding-left: 130px;"></p>
						</div>
						<div class="el-form-item">
							<div class="el-form-item-div">
								<label class="el-form-item-label">手机号</label>
								<input type="text" id="mobile" class="el-input" value="">
							</div>
							<p class="errorMessage" style="padding-left: 130px;"></p>
						</div>
						<div class="el-form-item">
							<div class="el-form-item-div">
								<label class="el-form-item-label">出生日期</label>
								<input type="text" id="date_of_birth" class="el-input" value="">
							</div>
							<p class="errorMessage" style="padding-left: 130px;"></p>
						</div>
						<div class="el-form-item">
							<div class="el-form-item-div">
								<label class="el-form-item-label">性别</label>
								<div class="el-radio-group">
									<label class="el-radio">
										<span class="el-radio-input">
											<span class="el-radio-inner"></span>
											<input class="sex yes" type="hidden" value="1">
										</span>
										<span class="el-radio-label">男</span>
									</label>
									<label class="el-radio">
										<span class="el-radio-input">
											<span class="el-radio-inner"></span>
											<input class="sex no" type="hidden" value="0">
										</span>
										<span class="el-radio-label">女</span>
									</label>
								</div>    
							</div>
							<p class="errorMessage"></p>
						</div>
						<div class="el-form-item">
							<div class="el-form-item-div">
								<label class="el-form-item-label">自我介绍</label>
								<textarea rows="3" id="introduction" maxlength="50" placeholder="请输入自我介绍，最多只能输入500字" class="el-textarea"></textarea>
							</div>
							<p class="errorMessage" style="padding-left: 130px;"></p>
						</div>
					</div>
					<div>
						<div class="el-form-item">
							<div class="el-form-item-div" style="margin-left: 30px;width: auto;">
								<div class="kv-avatar">
                                    <div class="file-loading">
                                        <input id="header_photo" name="attachment" type="file" required data-preview-file-type="image">
                                    </div>
                                </div>
                                 <div id="kv-avatar-errors-2" class="center-block" style="width:800px;display:none"></div>
							</div>
							<p class="errorMessage" style="padding-left: 20px;"></p>
						</div>
					</div>
				</div>
				<div class="el-form-item btnShow btnMargin">
			        <div class="el-form-item-div" style="padding-left: 30px;">
			            <button type="button" class="el-button el-button--primary submit">保存</button>
			        </div>
			    </div>
			</form>
		</div>
		<div class="el-panel editPwd_from">
			<form id="editPwd_from" class="formMateriel formTemplate normal">
				<div class="el-form-item">
					<div class="el-form-item-div">
						<label class="el-form-item-label">原密码<span class="mustItem">*</span></label>
						<input type="password" autocomplete="off" id="old_password" class="el-input" value="">
					</div>
					<p class="errorMessage" style="padding-left: 130px;"></p>
				</div>
				<div class="el-form-item">
					<div class="el-form-item-div">
						<label class="el-form-item-label">新密码<span class="mustItem">*</span></label>
						<input type="password" autocomplete="off" id="new_password" placeholder="6-18位字符" class="el-input" value="">
					</div>
					<p class="errorMessage" style="padding-left: 130px;"></p>
				</div>
				<div class="el-form-item">
					<div class="el-form-item-div">
						<label class="el-form-item-label">确认新密码<span class="mustItem">*</span></label>
						<input type="password" autocomplete="off" id="confirm_password" class="el-input" value="">
					</div>
					<p class="errorMessage" style="padding-left: 130px;"></p>
				</div>
				<div class="el-form-item btnShow btnMargin">
			        <div class="el-form-item-div" style="padding-left: 30px;">
			            <button type="button" class="el-button el-button--primary submit pwd">保存</button>
			        </div>
			    </div>
			</form>
		</div>
	</div>
</div>
@endsection

@section("inline-bottom")
<script src="/statics/custom/js/center/center-url.js?v={{$release}}"></script>
<script src="/statics/custom/js/ajax-public.js?v={{$release}}"></script>
<script src="/statics/common/laydate/laydate.js"></script>
<script src="/statics/common/fileinput/fileinput.js"></script>
<script src="/statics/common/fileinput/locales/zh.js"></script>
<script src="/statics/custom/js/center/setting.js?v={{$release}}"></script>
@endsection