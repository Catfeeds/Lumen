var activeTap='editPerson_from',
admin_id='',
validatorToolBox={
	checkOld: function(name){
		var value=$('#'+name).val().trim();
        return $('#'+name).parents('.el-form-item').find('.errorMessage').hasClass('active')?(!1):
        Validate.checkNull(value)?(showInvalidMessage(name,"原密码必填"),!1):
        (!0);
	},
    checkPwd: function(name){
        var value=$('#'+name).val().trim();
        return $('#'+name).parents('.el-form-item').find('.errorMessage').hasClass('active')?(!1):
        !Validate.checkPassword(value)?(showInvalidMessage(name,"密码为6-18位或格式不正确"),!1):
        (!0);
    },
    confirmPwd: function(name){
    	var value=$('#'+name).val().trim();
        return $('#'+name).parents('.el-form-item').find('.errorMessage').hasClass('active')?(!1):
        $('#editPwd_from #new_password').val().trim()!=value?(showInvalidMessage(name,"确认密码与新密码不一致"),!1):
        (!0);
    },
    checkRealName: function(name){
        var value=$('#'+name).val().trim();
        return $('#'+name).parents('.el-form-item').find('.errorMessage').hasClass('active')?(!1):
        Validate.checkNull(value)?(!0):
        !Validate.checkRealName(value)?(showInvalidMessage(name,"姓名至少两位，或含有非法字符，或长度不正确"),!1):(!0);
    },
    checkMobile: function(name){
        var value=$('#'+name).val().trim();
        return $('#'+name).parents('.el-form-item').find('.errorMessage').hasClass('active')?(!1):
        Validate.checkNull(value)?(!0):
        !Validate.checkMobile(value)?(showInvalidMessage(name,"手机号不正确"),!1):(!0);
    },
    checkEmail: function(name){
        var value=$('#'+name).val().trim();
        return $('#'+name).parents('.el-form-item').find('.errorMessage').hasClass('active')?(!1):
        Validate.checkNull(value)?(!0):
        value.length>500?(showInvalidMessage(name,"邮箱不能超过500个字符"),!1):
        !Validate.checkEmail(value)?(showInvalidMessage(name,"邮箱不正确"),!1):(!0);
    }
},
remoteValidatorToolbox={
    remoteCheck: function(name){
        var value=$('#'+name).val().trim();
        getUnique(name,value,function(rsp){
            if(rsp.results&&rsp.results.exist){
                var val='已注册';
                showInvalidMessage(name,val);
            }
        });
    }
},
validatorConfig = {
    cn_name: 'checkRealName',
    email: 'checkEmail',
    mobile: 'checkMobile'
},remoteValidatorConfig={
    cn_name: 'remoteCheck',
    email: 'remoteCheck',
    mobile: 'remoteCheck'
};
$(function() {
	initDate();
	getProfile();
	bindEvent();
});

//显示错误信息
function showInvalidMessage(name,val){
    $('#'+name).parents('.el-form-item').find('.errorMessage').addClass('active').html(val).show();
    $('.submit').removeClass('is-disabled');
}

function getCurrentDate() {
    var curDate = new Date();
    var  _year = curDate.getFullYear(),
        _month = curDate.getMonth()+1,
        _day = curDate.getDate();
    return _year + '-' + _month + '-'+ _day;
}

function initDate(value){
	if(value){
		laydate.render({
		  elem: '#date_of_birth',
		  value: value,
		  max: getCurrentDate(),
		  done: function(value, date, endDate){ 
		  	
		  }
		});
	}else{
		laydate.render({
		  elem: '#date_of_birth',
		  max: getCurrentDate(),
		  done: function(value, date, endDate){ 
		  	
		  }
		});
	}
}

//附件初始化
function fileinit(preUrls,preothers){
	var actions='<div class="file-actions">\n' +
        '    <div class="file-footer-buttons">\n' +
        '        {upload} {download} <button type="button" title="重新选择" class="btn btn-kv btn-default addNew"><i class="glyphicon glyphicon-plus"></i></button> {delete} {zoom}' +
        '    </div>\n' +
        '    {drag}\n' +
        '    <div class="clearfix"></div>\n' +
        '</div>';
    $("#header_photo").fileinput({
        uploadAsync: true,
        language: 'zh',
        'uploadUrl': URLS['setting'].upload,
        uploadExtraData: function (previewId, index) {
            var obj = {};
            obj.flag = 'administrator';
            obj._token = TOKEN;
            return obj;
        },
        overwriteInitial: true,
        defaultPreviewContent: '<img src="/statics/custom/img/avatar.png" alt=""><h6 class="text-muted">点击上传</h6>',
        initialPreview: preUrls,
        initialPreviewConfig:preothers,
        showCaption: false,//隐藏标题
        showClose: false, //关闭按钮
        browseClass: 'btn btn-primary btn-file-input',
        browseOnZoneClick: true, //点击上传
        maxFileSize: 1500,
        layoutTemplates: {main2: '{browse}{preview}',actions: actions,actionDrag:''},
        msgErrorClass: 'alert alert-block alert-danger',
        allowedFileExtensions: ["jpg", "png", "gif","jpeg"],
    }).on('fileselect', function(event, numFiles, label) {
        $(this).fileinput("upload");
    }).on('fileloaded', function (event, file, previewId, index, reader) {
        $('#' + previewId).attr('data-preview', 'preview-' + file.lastModified);
    }).on('fileuploaded', function (event, data, previewId, index) {
        console.log('附件上传成功');
        var result = data.response,
            file = data.files[0];
        if (result.code == '200') {
            $('.file-preview-frame[data-preview=preview-'+file.lastModified+']').addClass('uploaded').
            attr({
                'data-url':result.results.path,
                'attachment_id': result.results.attachment_id
            });
        }
    });
}

//查看管理员
function getProfile(){
    AjaxClient.get({
        url: URLS['setting'].show+"?"+_token,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            if(rsp&&rsp.results){
            	setData(rsp);
            }
        },
        fail: function(rsp){
            layer.close(layerLoading);
            console.log('获取个人详情失败');
        }
    },this);
}

function setData(rsp){
	var data=rsp.results;
	var form=$('#editPerson_from');
	admin_id=data.admin_id;
	form.find('#cn_name').val(data.cn_name);
	form.find('#email').val(data.email);
	form.find('#mobile').val(data.mobile);
	initDate(data.date_of_birth);
	data.sex==0?form.find('.sex.no').parent().addClass('is-radio-checked'):form.find('.sex.yes').parent().addClass('is-radio-checked');
	form.find('#introduction').val(data.introduction);
	var preurls=[],
predata=[],img='';
	data.header_photo?(img=`<img class="imginit" src="/storage/${data.header_photo}" data-id="${data.attachment_id}" />`,
		setTimeout(function(){
		$('.file-preview-frame').attr({'data-url':data.header_photo,'attachment_id':data.attachment_id});
	},100),preurls.push(img)):null;
	fileinit(preurls,[]);
}

//检测唯一性
function getUnique(field,value,fn){
    var urlLeft=`&field=${field}&value=${value}&id=${admin_id}`;
    AjaxClient.get({
        url: URLS['setting'].unique+"?"+_token+urlLeft,
        dataType: 'json',
        beforeSend: function(){
            // layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            // layer.close(layerLoading);
            fn && typeof fn==='function'? fn(rsp):null;
        },
        fail: function(rsp){
            // layer.close(layerLoading);
            console.log('唯一性检测失败');
        }
    },this);
}
//保存密码
function savePwd(data){
	AjaxClient.post({
        url: URLS['setting'].updatePwd,
        data: data,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            LayerConfig('success','密码更新成功',function(){
            	$('#old_password').val('');
            	$('#new_password').val('');
            	$('#confirm_password').val('');
            });
        },
        fail: function(rsp){
            layer.close(layerLoading); 
            if(rsp&&rsp.field!==undefined&&rsp.message){
                showInvalidMessage(rsp.field,rsp.message);
            }else{
                if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                    LayerConfig('fail',rsp.message);
                }else{
                    LayerConfig('fail','密码更新失败');
                }
            } 
        },
        complete: function(){
        	$('#editPwd_from').find('.submit').removeClass('is-disabled');
        }
    },this);
}
//保存个人资料
function saveProfile(data){
	AjaxClient.post({
        url: URLS['setting'].updateProfile,
        data: data,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            LayerConfig('success','个人信息更新成功',function(){
            	console.log(data.header_photo);
            	var header_photo='/storage/'+data.header_photo;
            	$('.nav.ace-nav .nav-user-photo').attr('src',header_photo);
            });
        },
        fail: function(rsp){
            layer.close(layerLoading); 
            if(rsp&&rsp.field!==undefined&&rsp.message){
                showInvalidMessage(rsp.field,rsp.message);
            }else{
                if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                    LayerConfig('fail',rsp.message);
                }else{
                    LayerConfig('fail','个人信息更新失败');
                }
            } 
        },
        complete: function(){
        	$('#editPerson_from').find('.submit').removeClass('is-disabled');
        }
    },this);
}

function bindEvent(){
	//tap切换按钮
    $('body').on('click','.el-tap',function(){
        var form=$(this).attr('data-item');
        if(!$(this).hasClass('active')){
            $(this).addClass('active').siblings('.el-tap').removeClass('active');
            activeTap=form;
          	if(activeTap=='editPerson_from'){
          		validatorConfig = {
				    cn_name: 'checkRealName',
				    email: 'checkEmail',
				    mobile: 'checkMobile'
				};
          	}else{
          		validatorConfig = {
					old_password: 'checkOld',
				    new_password: 'checkPwd',
				    confirm_password: 'confirmPwd',
				};
          	}
            $('#'+form).parent().addClass('active').siblings('.el-panel').removeClass('active');
        }
    });
    $('body').on('click','.addNew',function(){
    	$('.file-drop-zone.clickable').click();
    });

    $('body').on('click','.kv-file-remove.btn',function(){
    	$("#header_photo").fileinput('refresh',{
    		initialPreview: [],
    		initialPreviewConfig: []}).fileinput('clear');
    });
    //输入框的相关事件
    $('body').on('focus','.formMateriel .el-input:not([readonly])',function(){
        $(this).parents('.el-form-item').find('.errorMessage').html("").removeClass('active');
    }).on('blur','.formMateriel .el-input:not([readonly])',function(){
        var name=$(this).attr("id");
        validatorConfig[name] 
        && validatorToolBox[validatorConfig[name]] 
        && validatorToolBox[validatorConfig[name]](name)
        && remoteValidatorConfig[name] 
        && remoteValidatorToolbox[remoteValidatorConfig[name]] 
        && remoteValidatorToolbox[remoteValidatorConfig[name]](name);
    });
    //单选按钮点击事件
	$('body').on('click','.el-radio-input',function(e){
		$(this).parents('.el-radio-group').find('.el-radio-input').removeClass('is-radio-checked');
		$(this).addClass('is-radio-checked');     
	});
    //添加按钮点击
    $('body').on('click','.submit:not(.is-disabled)',function (e) {
        e.stopPropagation();
        if(!$(this).hasClass('is-disabled')) {
        	var correct=1;
            for (var type in validatorConfig) {
                correct=validatorConfig[type]&&validatorToolBox[validatorConfig[type]](type);
                if(!correct){
                    break;
                }
            }
            if(correct){
            	$(this).addClass('is-disabled');
            	if($(this).hasClass('pwd')){
	            	var data={
	            		old_password: $('#old_password').val().trim(),
	            		new_password: $('#new_password').val().trim(),
	            		confirm_password: $('#confirm_password').val().trim(),
	            		_token: TOKEN
	            	}
	            	savePwd(data);
	        	}else{
	        		var data={
	            		cn_name: $('#cn_name').val().trim(),
	            		email: $('#email').val().trim(),
	            		mobile: $('#mobile').val().trim(),
	            		date_of_birth: $('#date_of_birth').val().trim(),
	            		sex: $('.is-radio-checked .sex').val(),
	            		introduction: $('#introduction').val().trim(),
	            		header_photo: $('.file-preview-frame').attr('data-url')||'',
	            		attachment_id: $('.file-preview-frame').attr('attachment_id')||'',
	            		_token: TOKEN
	            	}
	            	saveProfile(data);
	        	}
            }
        }
    });
}