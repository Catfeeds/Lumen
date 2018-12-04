var layerModal,
    layerLoading,
    layerEle,
    nameCorrect = 1,
    codeCorrect = 1,
    codesCorrect = 1,
    pageNo = 1,
    procedureIds = [],
    practiceIds = [],
    ajaxData = {},
    tagsData = [],
    pageNo = 1,
    pageSize = 20,
    ajaxData = {
        // sort: 'ctime',
        // order: 'desc'
    },
    validatorToolBox = {
        checkCode: function (name) {
            var value = $('#addProcedureModal_form').find('#' + name).val().trim();
            return $('#addProcedureModal_form').find('#' + name).parents('.el-form-item').find('.errorMessage').hasClass('active') ? (!1) :
                !Validate.checkFactoryCode(value) ? (showInvalidMessage(name, "由1-20位字母、数字、下划线组成，字母开头"), !1) : (!0);
        },
        checkName: function (name) {
            var value = $('#addProcedureModal_form').find('#' + name).val().trim();
            return $('#addProcedureModal_form').find('#' + name).parents('.el-form-item').find('.errorMessage').hasClass('active') ? (!1) :
                Validate.checkNull(value) ? (showInvalidMessage(name, "名称不能为空"), !1) : (!0);
        }
    },
    remoteValidatorToolbox = {
        remoteCheck: function (name, flag, id) {
            var value = $('#addProcedureModal_form').find('#' + name).val().trim();
            getUnique(flag, name, value, id, function (rsp) {
                if (rsp.results && rsp.results.exist) {
                    codesCorrect = !1;
                    var val = '已注册';
                    showInvalidMessage(name, val);

                } else {
                    codesCorrect = 1
                }
            });
        }
    },
    validatorConfig = {
        code: 'checkCode',
        name: 'checkName'
    },
    remoteValidatorConfig = {
        code: 'remoteCheck',
    };
$(function () {
    procedureGroup();
    bindEvent();
    resetParam();
})
//重置搜索参数
function resetParam() {
    ajaxData = {
        name: '',
        code: '',
    };
}

//检测唯一性
function getUnique(flag, field, value, id, fn) {
    var urlLeft = '';
    if (flag === 'edit') {
        urlLeft = `&field=${field}&value=${value}&id=${id}`;
    } else {
        urlLeft = `&field=${field}&value=${value}`;
    }
    var xhr = AjaxClient.get({
        url: URLS['route'].unique + "?" + _token + urlLeft,
        dataType: 'json',
        success: function (rsp) {

            fn && typeof fn === 'function' ? fn(rsp) : null;
        },
        fail: function (rsp) {
            console.log('唯一性检测失败');
        }
    }, this);
}
//显示错误信息
function showInvalidMessage(name, val) {
    $('#addProcedureModal_form').find('#' + name).parents('.el-form-item').find('.errorMessage').addClass('active').html(val);
    $('#addProcedureModal_form').find('.submit').removeClass('is-disabled');
}
//点击事件
function bindEvent() {
    //取消
    $('body').on('click', '.formModal:not(".disabled") .cancle', function (e) {
        e.stopPropagation();
        layer.close(layerModal);
    });
    //添加仓库页面
    $('body').on('click', '.actions #practice_add', function (e) {
        e.stopPropagation();
        Modal('add', 0);
    });
    //点击弹框内部关闭dropdown
    $(document).click(function (e) {
        var obj = $(e.target);
        if (!obj.hasClass('el-select-dropdown-wrap') && obj.parents(".el-select-dropdown-wrap").length === 0) {
            $('.el-select-dropdown').slideUp().siblings('.el-select').find('.el-input-icon').removeClass('is-reverse');
        }
    });
    //下拉框点击事件
    $('body').on('click', '.el-select:not(.ability,.practice_field)', function () {
        $(this).find('.el-input-icon').toggleClass('is-reverse');
        $(this).parents('.el-form-item').siblings().find('.el-select-dropdown').hide();
        $(this).parents('.el-form-item').siblings().find('.el-select .el-input-icon').removeClass('is-reverse');
        $(this).siblings('.el-select-dropdown').toggle();
        $(this).parents('.el-form-item').find('.el-select-dropdown').width($(this).width());
    });
    //工厂
    $('body').on('click', '.el-form-item.abilitySelect .el-select-dropdown-item', function (e) {
        e.stopPropagation();
        $('.chooseFactory').hide().html('');
        $(this).parents('.el-select-dropdown').hide().siblings('.el-select').find('.el-input-icon').removeClass('is-reverse');

        var selectInput = $('.selectValue.ability');
        if (!$(this).hasClass('proceDisabled')) {
            var proId = $(this).attr('data-id'),
                proText = $(this).text();

            var tips = `<span class="proceTip ability" data-id="${proId}">${proText}<i class="fa fa-close proceTipDel"></i></span>`;

            selectInput.append(tips);
            procedureIds.push({
                'id': proId
            });
            $('.abilitySelect .errorMessage').html('');

            $(this).addClass('proceDisabled');
        }
    });
    //工艺路线组删除工厂
    $('body').on('click', '.el-form-item.abilitySelect .proceTipDel', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var ids = $(this).parents('.ability').attr('data-id');
        var _selectP = $('.selectValue.practice .proceTip.practice'),
        routes = [];
        if (_selectP.length) {
            $(_selectP).each(function (k1, v1) {
                routes.push($(v1).attr('data-id'));
            })
        }
        checkFactoryUsed(ids,routes.join(','));
    });

    //工艺路线
    $('body').on('click', '.el-form-item.practiceSelect .el-select-dropdown-item', function (e) {
        e.stopPropagation();
        $('.chooseRoute').hide().html('');
        $(this).parents('.el-select-dropdown').hide().siblings('.el-select').find('.el-input-icon').removeClass('is-reverse');
        var _selectInput = $('.selectValue.practice');
        if (!$(this).hasClass('proceDisabled')) {
            var praId = $(this).attr('data-id'),
                praText = $(this).text();
            var _tips = `<span class="proceTip practice" data-id="${praId}">${praText}<i class="fa fa-close proceTipDel"></i></span>`;
            _selectInput.append(_tips);
            practiceIds.push({
                'id': praId
            });
            $('.practiceSelect .errorMessage').html('');

            $(this).addClass('proceDisabled');
        }
    });
    //工艺路线组删除工艺路线
    $('body').on('click', '.el-form-item.practiceSelect .proceTipDel', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var ids = $(this).parents('.proceTip').attr('data-id');
        checkHasUse(ids);
    })

    //添加和编辑
    $('body').on('click', '#addProcedureModal_form:not(".disabled") .submit', function () {
        var parentForm = $(this).parents('#addProcedureModal_form'),
            id = parentForm.find('#itemId').val(),
            flag = parentForm.attr("data-flag"),
            factoryTag = 1;
        produceTag = 1;

        var _select = $('.selectValue .proceTip.ability'),
            factory_string = [];
            factory_id = [];

        if (_select.length) {
            abilityTag = 1;
            $('.abilitySelect .errorMessage').html('');
            $(_select).each(function (k, v) {
                factory_string.push($(v).text());
                factory_id.push($(v).attr('data-id'))

            })

        } else {
            abilityTag = !1;
            $('.abilitySelect .errorMessage').html('请选择工厂');
            factory_string = [];
            factory_id = [];
        }
        var _selectP = $('.selectValue.practice .proceTip.practice'),
            procedure_string = [];
        procedure_id = [];
        if (_selectP.length) {
            practiceTag = 1;
            $('.practiceSelect .errorMessage').html('');
            $(_selectP).each(function (k1, v1) {
                procedure_string.push($(v1).text());
                procedure_id.push($(v1).attr('data-id'))
            })
        }

        for (var type in validatorConfig) {
            validatorToolBox[validatorConfig[type]](type, flag, id)
        }
        // var factory_id1 = parentForm.find('#abilityProcedure').val().trim();
        // if (factory_id1 == "") {
        //     $('#addProcedureModal_form').find('.factoryMessage').html("请选择工厂");
        // }
        if (nameCorrect && codeCorrect  && abilityTag && codesCorrect) {
            var code = parentForm.find('#code').val().trim(),
                name = parentForm.find('#name').val().trim(),
                description = parentForm.find('#description').val().trim();
            id = parentForm.find('#itemId').val().trim();
            // factory_id = parentForm.find('#abilityProcedure').val().trim();
            if (code == "") {
                $('#addProcedureModal_form').find('.codeMessage').html("编码不能为空");
            } else if (name == "") {
                $('#addProcedureModal_form').find('.nameMessage').html("名称不能为空");
            } else {
                $(this).hasClass('edit') ? editGroup({
                        procedure_group_id: id,
                        name: name,
                        code: code,
                        factory: factory_id.join(','),
                        procedure_route: procedure_id.join(','),
                        description: description,
                        _token: TOKEN
                    }) :
                    addGroup({
                        name: name,
                        code: code,
                        factory: factory_id.join(','),
                        procedure_route: procedure_id.join(','),
                        description: description,
                        _token: TOKEN
                    })
            }
        }
    });
    //删除和查看
    $('body').on('click', '.table_tbody .pop-button', function () {
        $(this).parents('tr').addClass('active');
        var id = $(this).attr('data-id');
        if ($(this).hasClass('view')) {
            viewGroup(id, 'view');
        } else if ($(this).hasClass('edit')) {
            viewGroup(id, 'edit');
        } else if ($(this).hasClass('delete')) {
            layer.confirm('将执行删除操作?', {
                icon: 3,
                title: '提示',
                offset: '250px',
                end: function () {
                    $('.uniquetable tr.active').removeClass('active');
                }
            }, function (index) {
                layer.close(index);
                deleteGroup(id);
            });
        }
    });

    //输入框的相关事件
    $('body').on('focus', '.formMateriel .el-input:not([readonly])', function () {
        $(this).parents('.el-form-item').find('.errorMessage').removeClass('active').html("");
    }).on('blur', '.formMateriel .el-input:not([readonly])', function () {
        var flag = $('#addImageCategory').attr("data-flag"),
            name = $(this).attr("id"),
            id = $('#itemId').val();
        validatorConfig[name] &&
            validatorToolBox[validatorConfig[name]] &&
            validatorToolBox[validatorConfig[name]](name) &&
            remoteValidatorConfig[name] &&
            remoteValidatorToolbox[remoteValidatorConfig[name]] &&
            remoteValidatorToolbox[remoteValidatorConfig[name]](name, flag, id);
    });
    //搜索
    $('body').on('click', '#searchForm .submit:not(".is-disabled")', function (e) {
        e.stopPropagation();
        $('#searchForm .el-item-hide').slideUp(400, function () {
            $('#searchForm .el-item-show').css('background', 'transparent');
        });
        $('.arrow .el-input-icon').removeClass('is-reverse');
        if (!$(this).hasClass('is-disabled')) {
            var parentForm = $(this).parents('#searchForm');
            $('.el-sort').removeClass('ascending descending');
            pageNo = 1;
            ajaxData = {
                name: encodeURIComponent(parentForm.find('#name').val().trim()),
                code: encodeURIComponent(parentForm.find('#code').val().trim()),
            }
            procedureGroup();
        }
    });
    //重置
    $('body').on('click', '#searchForm .reset:not(.is-disabled)', function (e) {
        e.stopPropagation();
        $('#searchForm .el-item-hide').slideUp(400, function () {
            $('#searchForm .el-item-show').css('background', 'transparent');
        });
        $('.arrow .el-input-icon').removeClass('is-reverse');
        var parentForm = $(this).parents('#searchForm');
        parentForm.find('#name').val('');
        parentForm.find('#code').val('');
        $('.el-select-dropdown-item').removeClass('selected');
        $('.el-select-dropdown').hide();
        pageNo = 1;
        resetParam();
        procedureGroup();
    });
}

//验证是否可以删除工艺路线
function checkHasUse(id) {
    AjaxClient.get({
        url: URLS['route'].hasUsed + "?route_id=" + id + "&" + _token,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            if (rsp.results.exist == 0) {

                $('.selectValue span').remove('.proceTip[data-id=' + ids + ']');
                $('.el-form-item.practiceSelect .el-select-dropdown-item[data-id=' + ids + ']').removeClass('proceDisabled');
            } else {
                LayerConfig('fail', '工艺路线已经被使用，不可删除');
            }
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            console.log('做法检测失败');
        }
    }, this);
}

//验证是否可以删除工厂
function checkFactoryUsed(id,routes) {
    AjaxClient.get({
        url: URLS['route'].factoryUsed + "?factory_id=" + id + "&procedure_route=" + routes + "&" + _token,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            $('.selectValue span').remove('.proceTip[data-id=' + ids + ']');
            $('.el-form-item.practiceSelect .el-select-dropdown-item[data-id=' + ids + ']').removeClass('proceDisabled');
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            LayerConfig('fail', '该组在该厂下有工艺路线在被使用，不可删除');
        }
    }, this);
}

//分页
function bindPagenationClick(total, size) {
    $('.pagenation_wrap').show();
    $('#pagenation').pagination({
        totalData: total,
        showData: size,
        current: pageNo,
        isHide: true,
        coping: true,
        homePage: '首页',
        endPage: '末页',
        prevContent: '上页',
        nextContent: '下页',
        jump: true,
        callback: function (api) {
            pageNo = api.getCurrent();
            procedureGroup();
        }
    });
}
//工艺路线组列表
function procedureGroup() {
    $('.table_tbody').html('');
    var urlLeft = '';
    for (var param in ajaxData) {
        urlLeft += `&${param}=${ajaxData[param]}`;
    }
    urlLeft += "&page_no=" + pageNo + "&page_size=" + pageSize + "&sort=id&order=desc";
    AjaxClient.get({
        url: URLS['route'].group + "?" + _token + urlLeft,
        dataType: 'json',
        success: function (rsp) {
            var totalData = rsp.paging.total_records;
            if (totalData > pageSize) {
                bindPagenationClick(totalData, pageSize);
            } else {
                $('#pagenation').html('');
            }
            if (rsp.results && rsp.results.length) {
                createHtml($('.table_tbody'), rsp.results);
            } else {
                noData('暂无数据', 10);
            }

        },
        fail: function (rsp) {
            console.log('获取列表信息失败');
        }
    }, this);
}

//获取厂区列表
function getDeplants(val, flag) {
    var urlLeft = '';
    for (var param in ajaxData) {
        urlLeft += `&${param}=${ajaxData[param]}`;
    }
    urlLeft += "&page_no=" + pageNo + "&page_size=" + pageSize;
    AjaxClient.get({
        url: URLS['route'].plants + _token + urlLeft,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            if (rsp.results && rsp.results.length) {
                var lis = '',
                    innerhtml = '';
                rsp.results.forEach(function (item, index) {
                    lis += `<li data-id="${item.factory_id}" class="el-select-dropdown-item" class=" el-select-dropdown-item">${item.factory_name}</li>`;
                })
                innerhtml = `
                        <li data-id="" class="el-select-dropdown-item kong proceDisabled">--请选择--</li>
                        ${lis}`;
                $('.el-form-item.abilitySelect').find('.el-select-dropdown-list').html(innerhtml);
                if (val.length) {
                    val.forEach(function (item) {
                        $('.el-form-item.abilitySelect .el-select-dropdown-item[data-id=' + item.id + ']').click();

                    })
                }

                flag == 'view' ? $('.proceTipDel').hide() : '';

            }
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            layer.msg('获取厂区列表失败', {
                icon: 5,
                offset: '250px',
                time: 1500
            });
        }
    }, this);
}

//工艺路线
function getListData(val, flag, id) {
    AjaxClient.get({
        url: URLS['route'].groupList + "?procedure_group_id=" + id + '&' + _token,
        dataType: 'json',
        success: function (rsp) {

            if (rsp.results && rsp.results.length) {
                var lis = '',
                    innerhtml = '';

                rsp.results.forEach(function (item, index) {
                    lis += `<li data-id="${item.id}" class="el-select-dropdown-item" class="el-select-dropdown-item">${item.name}</li>`;
                })
                innerhtml = `
                                <li data-id="" class="el-select-dropdown-item kong proceDisabled">--请选择--</li>
                                ${lis}`;
                $('.el-form-item.practiceSelect').find('.el-select-dropdown-list').html(innerhtml);

                if (val.length) {
                    val.forEach(function (item) {
                        $('.el-form-item.practiceSelect .el-select-dropdown-item[data-id=' + item.id + ']').click();
                    })
                }
                flag == 'view' ? $('.proceTipDel').hide() : '';

            }
        },
        fail: function (rsp) {
            console.log('获取列表信息失败');
        }
    }, this);
}

function createHtml(ele, data) {

    data.forEach((item, index) => {
        procedure_route = [];
        factory = [];
        if (item.procedure_route.length) {
            item.procedure_route.forEach(function (p) {
                procedure_route.push(p.name);
            })
        }
        //工厂
        if (item.factory.length) {
            item.factory.forEach(function (p) {
                factory.push(p.name);
            })
        }
        var tr = `<tr>
                <td>${item.code}</td>
                <td>${item.name}</td>
                <td><div class="word_wrap">${factory.join(',')}</div></td>
                <td><div class="word_wrap">${procedure_route.join(',')}</div></td>
                <td style="max-width: 500px;word-break: break-all">${item.description}</td>
                <td class="right ">
                    <button data-id="${item.id}" class="button pop-button view">查看</button>
                    <button data-id="${item.id}" class="button pop-button edit">编辑</button>
                    <button data-id="${item.id}" class="button pop-button delete">删除</button>
                </td>
        </tr>`;
        ele.append(tr);
        ele.find('tr:last-child').data("trData", item);
    });

}

//添加工艺路线组
function addGroup(data) {
    AjaxClient.post({
        url: URLS['route'].addGruop,
        dataType: 'json',
        data: data,
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            layer.close(layerModal);
            procedureGroup();
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            if (rsp && rsp.message != undefined && rsp.message != null) {
                LayerConfig('fail', rsp.message)
            }
            $('body').find('#addProcedureModal_form').removeClass('disabled').find('.submit').removeClass('is-disabled');

            if (rsp && rsp.field !== undefined) {
                showInvalidMessage(rsp.field, rsp.message);
            }
        }

    })

}
//编辑
function editGroup(data) {
    AjaxClient.post({
        url: URLS['route'].edit,
        data: data,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            layer.close(layerModal);
            procedureGroup();
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            if (rsp && rsp.message != undefined && rsp.message != null) {
                LayerConfig('fail', rsp.message)
            }
            $('body').find('#addProcedureModal_form').removeClass('disabled').find('.submit').removeClass('is-disabled');

            if (rsp && rsp.field !== undefined) {
                showInvalidMessage(rsp.field, rsp.message);
            }
        }

    }, this)
}

//查看工艺路线组
function viewGroup(id, flag) {
    AjaxClient.get({
        url: URLS['route'].viewGroup + "?procedure_group_id=" + id + "&" + _token,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            Modal(flag, id, rsp.results);

        },
        fail: function (rsp) {
            layer.close(layerLoading);
            if (rsp && rsp.message != undefined && rsp.message != null) {
                LayerConfig('fail', rsp.message);
            }

        }
    }, this);
}

//删除工艺路线组
function deleteGroup(id) {
    var data = {
        procedure_group_id: id,
        _token: TOKEN
    };
    AjaxClient.get({
        url: URLS['route'].deleteGroup,
        data: data,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            procedureGroup();
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            LayerConfig('fail', rsp.message);
        }
    }, this)

}
// 工艺路线组
function Modal(flag, id, data) {
    var {
        id = '',
            code = '',
            depot_code = '',
            name = '',
            factory = [],
            procedure_route = [],
            description = ''
    } = {};
    var labelWidth = 100,
        readonly = '',
        title = "查看工艺路线组",
        btnShow = 'btnShow',
        placeholder = "请输入描述，最多能输入500个字符",
        noEdit = '';
    if (data) {
        ({
            id = '',
            code = '',
            depot_code = '',
            name = '',
            factory = [],
            procedure_route = [],
            description = ''
        } = data);
    }
    flag == 'view' ? (readonly = 'readonly="readonly"', btnShow = 'btnHide', placeholder = '') : (flag == 'add' ? title = '添加工艺路线组' : (title = '编辑工艺路线组', noEdit = 'readonly="readonly"'));
    layerModal = layer.open({
        type: 1,
        title: title,
        offset: '100px',
        area: '500px',
        shade: 0.1,
        shadeClose: true,
        resize: false,
        content: `<form class="addProcedureModal abilityModal formModal formMateriel" id="addProcedureModal_form" data-flag="${flag}">
        <input type="hidden" id="itemId" value="${id}">
        <div class="el-form-item">
           <div class="el-form-item-div">
               <label class="el-form-item-label" style="width: ${labelWidth}px;">编码<span class="mustItem">*</span></label>
               <input type="text" id="code" ${readonly}  ${noEdit} maxlength="20" data-name="编码" class="el-input" placeholder="由1-20位字母、数字、下划线组成" value="${code}">
           </div>
           <p class="errorMessage codeMessage" style="padding-left: ${labelWidth}px;"></p>
       </div>
        <div class="el-form-item">
           <div class="el-form-item-div">
               <label class="el-form-item-label" style="width: ${labelWidth}px;">名称<span class="mustItem">*</span></label>
               <input type="text" id="name" ${readonly} data-name="名称" class="el-input" placeholder="请输入名称" value="${name}" maxlength="50">
           </div>
           <p class="errorMessage nameMessage" style="padding-left: ${labelWidth}px;"></p>
       </div>
        <div class="el-form-item abilitySelect">
           <div class="el-form-item-div">
               <label class="el-form-item-label" style="width: ${labelWidth}px;">工厂<span class="mustItem">*</span></label>
               <div class="el-select-dropdown-wrap">
                   <div class="el-select ${flag=='view' ? 'ability' :''}">
                       <div class="selectValue ability"><span class="chooseFactory" style="color:#C0C0C0;">--请选择--</span></div>
                       <i class="el-input-icon el-icon el-icon-caret-top"></i>
                       <input type="hidden" class="val_id" id="abilityProcedure" value="">
                   </div>
                   <div class="el-select-dropdown">
                       <ul class="el-select-dropdown-list">
                           <li data-id="" class="el-select-dropdown-item kong proceDisabled" data-name="--请选择--">--请选择--</li>
                          
                       </ul>
                   </div>
               </div>
           </div>
           <p class="ability errorMessage factoryMessage" style="padding-left: ${labelWidth}px;"></p>
       </div>
       <div class="el-form-item practiceSelect">
           <div class="el-form-item-div">
               <label class="el-form-item-label" style="width: ${labelWidth}px;">工艺路线</label>
               <div class="el-select-dropdown-wrap">
                   <div class="el-select ${flag=='view' ? 'practice_field' :''}">
                       <div class="selectValue practice" placeholder=""><span class="chooseRoute" style="color:#C0C0C0;">--请选择--</span></div>
                       <i class="el-input-icon el-icon el-icon-caret-top"></i>
                       <input type="hidden" class="val_id" id="practiceProcedure" value="">
                   </div>
                   <div class="el-select-dropdown">
                       <ul class="el-select-dropdown-list">
                           <li data-id="" class="el-select-dropdown-item kong proceDisabled" data-name="--请选择--">--请选择--</li>
                       </ul>
                   </div>
               </div>
           </div>
           <p class="practice errorMessage" style="padding-left: ${labelWidth}px;"></p>
       </div>
        <div class="el-form-item">
           <div class="el-form-item-div">
               <label class="el-form-item-label" style="width: ${labelWidth}px;">描述</label>
               <textarea type="textarea" ${readonly} maxlength="500" id="description" rows="5" class="el-textarea" placeholder="${placeholder}">${description}</textarea>
           </div>
           <p class="errorMessage"></p>
       </div>
       <div class="el-form-item ${btnShow}">
           <div class="el-form-item-div btn-group">
               <button type="button" class="el-button cancle">取消</button>
               <button type="button" class="el-button el-button--primary submit ${flag}">确定</button>
           </div>
       </div>
   </form>`,
        success: function (layero, index) {
            layerEle = layero;
            getDeplants(factory, flag);
            getListData(procedure_route, flag, id);
            // if (flag == 'view') {
            //     $('.el-form-item.practiceSelect .el-select-dropdown-item').css(' pointer-events', 'none');
            //     $('.selectValue.ability').html(factory.name);
            // } else if(flag == 'edit'){
            //     $('.selectValue.ability').html(factory.name);
            //     $('#abilityProcedure').val(factory.id);
            // }

        },
        end: function () {
            layerEle = '';
            $('.uniquetable tr.active').removeClass('active');
        }
    });
}