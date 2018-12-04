<!DOCTYPE html>
<html lang="en">
	<head>
		<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />
    	<meta charset="utf-8" />
    	<meta name="description" content="overview &amp; stats" />
	    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
	    {{--icon--}}
	    <link rel="shortcut icon" href="/statics/custom/img/favicon.ico" type="image/x-icon" />
    	<title>智能制造管理系统</title>
    	<link rel="stylesheet" href="/statics/custom/css/login/login.css" />
    	<!--[if !IE]> -->
		<script src="/statics/common/ace/assets/js/jquery-2.1.4.min.js"></script>
		<script src="/statics/common/cookie/jquery.cookie.js" type="text/javascript"></script>
		<!-- <![endif]-->

		<!--[if IE]>
		<script src="Scripts/jquery.js" type="text/javascript"></script>
		<script src="/statics/common/ace/assets/js/jquery-1.11.3.min.js"></script>
		<script src="/statics/common/cookie/jquery.cookie.js" type="text/javascript"></script>
		<![endif]-->
	</head>

	<body>
		<div class="login-con">
			<div class="login-head">
				<div class="title">
					<img class="login-logo" src="/statics/custom/img/login_logo.png" alt="">
					<p class="login-title margin">emi<sup>2</sup>c</p>
					<p class="login-title">i4.0 智能制造管理系统</p>
				</div>
			</div>
			<div class="login-center">
				<form class="login-form">
					<div class="login-form-header">
						<p>用户登录</p>
					</div>
					<div class="login-form-center">
						<div class="center-wrap">
							<div class="form-item-wrap">
								<div class="form-item">
									<label>用户名：</label>
									<input class="login-input" id="name" type="text" placeholder=" 用户名 ">
								</div>
								<p class="error"></p>
							</div>
							<div class="form-item-wrap">
								<div class="form-item">
									<label>密&emsp;码：</label>
									<input autocomplete="new-password" class="login-input" id="password" type="password" placeholder=" 密码 ">
								</div>
								<p class="error"></p>
							</div>


							<div class="form-item-wrap">
                                    <div class="form-item">
                                        <div class="remember_wrap">
                                             <span class="el-checkbox_input" id="rememberUser">
                                                <span class="el-checkbox-outset"></span>
                                             </span>
                                             <label>记住密码</label>
                                        </div>
                                    </div>
                                    <p class="error"></p>
                                </div>
							<div class="form-item">
								<button id="btn-login" class="btn-login">登录</button>
							</div>
						</div>
					</div>
					<div class="login-form-footer">
					</div>
				</form>
			</div>
			<div class="record_number">苏州瑞思智造信息科技有限公司</div>
		</div>
		<script src="/statics/custom/js/ajax-client.js"></script>
		<script src="/statics/custom/js/validate.js"></script>
		<script src="/statics/custom/js/custom-public.js"></script>
		<script src="/statics/custom/js/login/jsencrypt.min.js?v=20180420"></script>
		<script src="/statics/custom/js/login/login.js?v=20180420"></script>
	</body>
</html>