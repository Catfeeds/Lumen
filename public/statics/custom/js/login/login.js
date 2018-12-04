var layerLoading,
	validatorToolBox = {
		checkName: function (name) {
			var value = $('#' + name).val().trim();
			return $('#' + name).parents('.form-item-wrap').find('.error').hasClass('active') ? (!1) :
				Validate.checkNull(value) ? (showInvalidMessage(name, "用户名不能为空"), !1) :
					($('#' + name).parents('.form-item-wrap').find('.error').html('').removeClass('active'), !0);
		},
		checkPassWord: function (name) {
			var value = $('#' + name).val().trim();
			return $('#' + name).parents('.form-item-wrap').find('.error').hasClass('active') ? (!1) :
				Validate.checkNull(value) ? (showInvalidMessage(name, "密码不能为空"), !1) :
					($('#' + name).parents('.form-item-wrap').find('.error').html('').removeClass('active'), !0);
		},
		// checkCaptcha: function(name){
		// 	var value=$('#'+name).val().trim();
		// 	return $('#'+name).parents('.form-item-wrap').find('.error').hasClass('active')?(!1):
		//    Validate.checkNull(value)?(showInvalidMessage(name,"验证码不能为空"),!1):
		// 	($('#'+name).parents('.form-item-wrap').find('.error').html('').removeClass('active'),!0);
		// }
	},
	validatorConfig = {
		name: "checkName",
		password: "checkPassWord",
		// captcha: "checkCaptcha"
	};
var errorField = ['name', 'password'];
var encrypt = new JSEncrypt();
$(function () {
	var public_key = '-----BEGIN PUBLIC KEY-----'
		+ 'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDqx+EibobNO3Mosvk9a03im+++'
		+ 'Q6XYu4cx++YvSiWwS1HuPWwXR8HCKSFJbVEQLCEdS9QarwI+urlOEQ0xTbM62lRN'
		+ 'y4s0kx2xa0IdejiwSJ6j/oDBL1Ky0eFl4X3m/3+jpUoEtvr87M/yaLnpLNvXhX+a'
		+ 'Es1MClC67PipJa0jUwIDAQAB-----END PUBLIC KEY-----';
	encrypt.setPublicKey(public_key);
	// getVerifyCode();
	if ($.cookie("rememberUser")) {
		$("#rememberUser").addClass("is-checked");
		$("#name").val($.cookie("name"));
		$("#password").val($.cookie("password"));
	}
	bindEvent();
});

//显示错误信息
function showInvalidMessage(name, val) {
	$('#' + name).parents('.form-item-wrap').find('.error').html(val).addClass('active');
	$('.btn-login').removeClass('is-disabled');
}
//登录异步
function postLogin(data) {
	AjaxClient.post({
		url: '/Admin/login',
		data: data,
		dataType: 'json',
		success: function (rsp) {
			//登录成功
			if (rsp && rsp.results) {
				saveUserInfo();
				window.location.href = rsp.results.next_url;
			}
		},
		fail: function (rsp) {
			//登录失败
			$('#btn-login').removeClass('disabled');
			if (rsp && rsp.field !== undefined && rsp.message != null && rsp.message != undefined) {
				if (errorField.indexOf(rsp.field) > -1) {
					showInvalidMessage(rsp.field, rsp.message);
				} else {
					$('#captcha').parents('.form-item-wrap').find('.error').html(rsp.message);
				}
			} else {
				$('#captcha').parents('.form-item-wrap').find('.error').html('登录失败');
			}
		}
	}, this);
}

function saveUserInfo() {
	if ($("#rememberUser").hasClass("is-checked") == true) {
		var name = $("#name").val();
		var password = $("#password").val();
		$.cookie("rememberUser", "true", {
			expires: 7
		}); // 存储一个带7天期限的 cookie
		$.cookie("name", name, {
			expires: 7
		}); // 存储一个带7天期限的 cookie
		$.cookie("password", password, {
			expires: 7
		}); // 存储一个带7天期限的 cookie
	} else {
		$.cookie("rememberUser", "false", {
			expires: -1
		}); // 删除 cookie
		$.cookie("name", '', {
			expires: -1
		});
		$.cookie("password", '', {
			expires: -1
		});
	}
}

// function getVerifyCode(){
// 	var data={
// 		imageW: 90,
// 		imageH: 32,
// 		length: 4,
// 		fontSize: 12,
// 		fontttf: '5.ttf',
// 		useImgBg: 0,
// 		useCurve: 0,
// 		useNoise: 0,
// 		useZh: 0,
// 		_token: TOKEN
// 	};
// 	AjaxClient.post({
// 		url: '/Admin/captcha',
// 		data: data,
// 		dataType: 'json',
// 		success: function(rsp){
// 			$('#verifCodeImg').removeClass('disabled');
// 			if(rsp&&rsp.results){
// 				$('#verifCodeImg').attr('src',rsp.results.captcha);
// 			}else{
// 				$('#captcha').parents('.form-item-wrap').find('.error').html('验证码获取失败，请刷新');
// 			}
// 		},
// 		fail: function(rsp){
// 			$('#verifCodeImg').removeClass('disabled');
// 			$('#captcha').parents('.form-item-wrap').find('.error').html('验证码获取失败，请刷新');
// 		}
// 	},this);
// }

function validate() {
	var correct = false;
	for (var type in validatorConfig) {
		correct = validatorToolBox[validatorConfig[type]](type);
		if (!correct) {
			break;
		}
	}
	if (correct) {
		$('#btn-login').addClass('disabled');
		var data = {
			name: $('#name').val().trim(),
			password: encrypt.encrypt($('#password').val().trim()),
			is_encrypt_rsa: 1,
			// captcha: $('#captcha').val().trim(),
			_token: TOKEN
		}
		postLogin(data);
	}
}

function bindEvent() {
	$('body').on('click', '.el-checkbox_input', function () {
		$(this).toggleClass('is-checked');
	})

	$('.login-input').on('focus change', function () {
		$(this).parents('.form-item-wrap').find('.error').html('').removeClass('active');
	}).on('blur', function () {
		var id = $(this).attr('id');
		validatorConfig[id] && validatorToolBox[validatorConfig[id]](id);
	});
	$('#verifCodeImg').on('click', function () {
		if (!$(this).hasClass('disabled')) {
			$(this).addClass('disabled');
			getVerifyCode();
		}
	});
	$('#btn-login').on('click', function (evt) {
		evt.stopPropagation();
		evt.preventDefault();
		if (!$(this).hasClass('disabled')) {
			validate();
			// saveUserInfo();
		}
	});
}
