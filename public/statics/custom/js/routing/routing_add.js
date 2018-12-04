var layerLoading,
    validatorToolBox = {
        checkName: function (name) {
            var value = $('.basicForm').find('#' + name).val().trim();
            return $('.basicForm').find('#' + name).parents('.el-form-item').find('.errorMessage').hasClass('active') ? (!1) :
                Validate.checkNull(value) ? (showInvalidMessage(name, "名称不能为空"), !1) :
                    Validate.checkNot0(value) ? (showInvalidMessage(name, "名称不能为0"), !1) : (!0);
        },
        checkCode: function (name) {
            var value = $('.basicForm').find('#' + name).val().trim();
            return $('.basicForm').find('#' + name).parents('.el-form-item').find('.errorMessage').hasClass('active') ? (!1) :
                Validate.checkNull(value) ? (showInvalidMessage(name, "编码不能为空"), !1) :
                    !Validate.checkMaterialClass(value) ? (showInvalidMessage(name, "编码由2-50位字母数字下划线中划线组成"), !1) : (!0);
        }
    },
    remoteValidatorToolbox = {
        remoteCheckName: function (flag, name, id) {
            var value = $('#' + name).val().trim();
            getWorkClassUnique(flag, name, value, id, function (rsp) {
                if (rsp.results && rsp.results.exist) {
                    var val = '已注册';
                    showWorkClassInvalidMessage(name, val);
                }
            });
        }
    },
    validatorConfig = {
        name: 'checkName',
        code: 'checkCode'
    },
    remoteValidatorConfig = {
        // name:'remoteCheckName',
    };

$(function () {
    bindEvent()
});

function showInvalidMessage(name, val) {
    $('.basicForm').find('#' + name).parents('.el-form-item').find('.errorMessage').addClass('active').html(val);
    $('.basicForm').find('.submit').removeClass('is-disabled');
}

function bindEvent() {

    $('body').on('focus', '.basicForm .el-input:not([readonly])', function () {
        $(this).parents('.el-form-item').find('.errorMessage').removeClass('active').html("");
    }).on('blur', '.basicForm .el-input:not([readonly])', function () {
        var flag = $('.basicForm').attr("data-flag"),
            name = $(this).attr("id");
        validatorConfig[name]
        && validatorToolBox[validatorConfig[name]]
        && validatorToolBox[validatorConfig[name]](name);
        // && remoteWorkClassValidatorConfig[name]
        // && remoteWorkClassValidatorToolbox[remoteWorkClassValidatorConfig[name]]
        // && remoteWorkClassValidatorToolbox[remoteWorkClassValidatorConfig[name]](flag,name,id);
    });
    $('body').on('click', '#route_basic_form .submit', function () {
        var code = $("#code").val();
        if(code == ''){
            $('#codeMessage').show().html('编码不能为空')
        }
        var correct = 1;
        for (var type in validatorConfig) {
            correct = validatorConfig[type] && validatorToolBox[validatorConfig[type]](type);
            if (!correct) {
                break;
            }
        }
        // var description = $('#route_basic_form').find('#description').val().trim();
        // if(description.length>500){
        //     $('#route_basic_form').find('#description').parents('.el-form-item').find('.errorMessage').css('display','block').text('最多只能输入500个字符');
        //     return false;
        // }else{
        //     $('#route_basic_form').find('#description').parents('.el-form-item').find('.errorMessage').css('display','none');
        // }
        if (correct) {
            if (!$(this).hasClass('is-disabled')) {
                $(this).addClass('is-disabled');
                var parentForm = $('#route_basic_form');

                var code = parentForm.find('#code').val(),
                    name = parentForm.find('#name').val(),
                    desc = parentForm.find('#description').val().trim();
                
                   
                addRouteLine({
                    code: code,
                    name: name,
                    description: desc,
                    _token: TOKEN
                })

            }
        }

    })
}

function addRouteLine(data) {
    AjaxClient.post({
        url: URLS['route'].store,
        data: data,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            LayerConfig('success', '添加成功', function () {
                var viewUrl = $('#route_edit').val();
                window.location.href = viewUrl + '?id=' + rsp.results;
            });
        },
        fail: function (rsp) {
            if (rsp.code==140){
                $("#codeMessage").text(rsp.message)
            }
            layer.close(layerLoading);
        },
        complete: function () {
            $('.basicForm .submit').removeClass('is-disabled');
        }
    }, this)
}