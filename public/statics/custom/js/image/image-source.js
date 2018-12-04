var layerModal,
    layerLoading,
    pageNo = 1,
    pageSize = 20,
    inputVal={},
    ajaxData = {
        sort: 'ctime',
        order: 'asc'
    },
    encode='',
    validatorToolBox = {
        checkCode: function (name) {
            var value = $('#addImageCategory').find('#' + name).val().trim();
            return $('#addImageCategory').find('#' + name).parents('.el-form-item').find('.errorMessage').hasClass('active') ? (!1) :
                !Validate.checkFactoryCode(value) ? (showInvalidMessage(name, "由1-20位字母、数字、下划线组成，字母开头"), !1) : (!0);
        },
        checkName: function (name) {
            var value = $('#addImageCategory').find('#' + name).val().trim();
            return $('#addImageCategory').find('#' + name).parents('.el-form-item').find('.errorMessage').hasClass('active') ? (!1) :
                Validate.checkNull(value) ? (showInvalidMessage(name, "分类名称必填"), !1) : (!0);
        },
        checkOwner: function (name) {
            var value = $('#addImageCategory').find('#' + name).val().trim();
            return $('#addImageCategory').find('#' + name).parents('.el-form-item').find('.errorMessage').hasClass('active') ? (!1) :
                !/^[a-zA-Z_]{1,20}$/g.test(value) ? (showInvalidMessage(name, "由1-20位字母、下划线组成"), !1) : (!0);
        }
    },
    remoteValidatorToolbox = {
        remoteCheck: function (name, flag, id) {
            var value = $('#addImageCategory').find('#' + name).val().trim();
            getUnique(flag, name, value, id, function (rsp) {
                if (rsp.results && rsp.results.exist) {
                    var val = '已注册';
                    showInvalidMessage(name, val);
                }
            });
        }
    },
    validatorConfig = {
        code: 'checkCode',
        name: 'checkName',
        owner: 'checkOwner'
    },
    remoteValidatorConfig = {
        code: 'remoteCheck',
        name: 'remoteCheck',
        owner: 'remoteCheck'
    };

$(function () {
    resetParam();
    imgCategoryList();
    bindEvent();
});

//显示错误信息
function showInvalidMessage(name, val) {
    $('#addImageCategory').find('#' + name).parents('.el-form-item').find('.errorMessage').addClass('active').html(val);
    $('#addImageCategory').find('.submit').removeClass('is-disabled');
}

//重置搜索参数
function resetParam() {
    ajaxData = {
        sort: 'ctime',
        order: 'asc'
    }
}

//分页
function bindPagenationClick(total, size) {
    $('#pagenation').show();
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
            imgCategoryList();
        }
    });
}

//获取图纸分类数据
function imgCategoryList() {
    var urlLeft = '';
    for (var param in ajaxData) {
        urlLeft += `&${param}=${ajaxData[param]}`;
    }
    urlLeft += "&page_no=" + pageNo + "&page_size=" + pageSize;
    $('.table_tbody').html('');
    AjaxClient.get({
        url: URLS['category'].list + "?" + _token + urlLeft,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            var pageTotal = rsp.paging.total_records;
            if (pageTotal > pageSize) {
                bindPagenationClick(pageTotal, pageSize);
            } else {
                $('#pagenation').html('');
            }
            if (rsp.results && rsp.results.length) {
                createHtml($('.table_tbody'), rsp.results)
            } else {
                noData('暂无数据', 6);
            }
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            noData('获取图纸来源列表失败，请刷新重试', 6);
        },
        complete: function () {
            $('#searchForm .submit,#searchForm .reset').removeClass('is-disabled');
        }
    })
}

function createHtml(ele, data) {
    data.forEach(function (item, index) {
        var tr = ` <tr data-id="${item.imageCategory_id}">
                    <td>${item.code}</td>
                    <td>${item.name}</td>
                    <td>${item.owner}</td>
                    <td>${tansferNull(item.creator_name)}</td>
                    <td>${item.ctime}</td>
                    <td class="right nowrap">
                        <button class="button pop-button view" data-id="${item.imageCategory_id}">查看</button>
                        <button class="button pop-button edit" data-id="${item.imageCategory_id}">编辑</button>
                        <button class="button pop-button delete" data-id="${item.imageCategory_id}">删除</button>
                    </td>
                </tr>`;
        ele.append(tr);
        ele.find('tr:last-child').data("trData", item);
    })
}

//图纸分类添加
function addImageCategory(data) {
    AjaxClient.post({
        url: URLS['category'].store,
        data: data,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            layer.close(layerModal);
            imgCategoryList();
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            if (rsp && rsp.field !== undefined && rsp.message) {
                showInvalidMessage(rsp.field, rsp.message);
            } else {
                if (rsp && rsp.message != undefined && rsp.message != null) {
                    LayerConfig('fail', rsp.message);
                } else {
                    LayerConfig('fail', '添加失败');
                }
            }
            $('#addImgGroup').find('.submit').removeClass('is-disabled');
        }
    }, this);
}

//图纸分类查看
function viewImgCategory(id, flag) {
    AjaxClient.get({
        url: URLS['category'].show + '?' + _token + '&imageCategory_id=' + id,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            imgCategoryModal(flag, rsp.results)
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            if (rsp.code == 404) {
                imgCategoryList();
            }
        }
    }, this);
}

//图纸分类删除
function deleteImgCategory(id, leftNum) {
    AjaxClient.get({
        url: URLS['category'].delete + "?" + _token + "&imageCategory_id=" + id,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            // LayerConfig('success','删除成功啦');
            if (leftNum == 1) {
                pageNo--;
                pageNo ? null : (pageNo = 1);
            }
            imgCategoryList();
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            if (rsp && rsp.message != undefined && rsp.message != null) {
                LayerConfig('fail', rsp.message);
            }
            if (rsp && rsp.code == 404) {
                pageNo ? null : pageNo = 1;
                imgCategoryList();
            }
        }
    }, this);
}

//图纸分类编辑
function editimgCategory(data) {
    AjaxClient.post({
        url: URLS['category'].update,
        data: data,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            layer.close(layerModal);
            imgCategoryList();
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            if (rsp && rsp.field !== undefined && rsp.message) {
                showInvalidMessage(rsp.field, rsp.message);
            } else {
                if (rsp && rsp.message != undefined && rsp.message != null) {
                    LayerConfig('fail', rsp.message);
                } else {
                    LayerConfig('fail', '编辑失败');
                }
            }
            $('#addImageCategory').find('.submit').removeClass('is-disabled');
        }
    }, this);
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
        url: URLS['category'].unique + "?" + _token + urlLeft,
        dataType: 'json',
        success: function (rsp) {
            fn && typeof fn === 'function' ? fn(rsp) : null;
        },
        fail: function (rsp) {
            console.log('唯一性检测失败');
        }
    }, this);
}

function imgCategoryModal(flag, data) {
    var {
        imageCategory_id = '', code = '', name = '', owner = '', description = ''
    } = {};
    if (data) {
        ({
            imageCategory_id = '',
            code = '',
            name = '',
            owner = '',
            description = ''
        } = data);
    }
    var labelWidth = 100,
        btnShow = 'btnShow',
        title = "查看图纸来源",
        placeholder = "请输入描述，最多能输入500个字符";

    flag == 'view' ? (btnShow = 'btnHide', placeholder = '') : (flag == 'add' ? title = '添加图纸来源' : (title = '编辑图纸来源'));
    layerModal = layer.open({
        type: 1,
        title: title,
        offset: '100px',
        area: '500px',
        shade: 0.1,
        shadeClose: true,
        resize: false,
        move: false,
        content: `<form class="addImageCategory formModal formMateriel" id="addImageCategory" data-flag="${flag}">
                    <input type="hidden" id="itemId" value="${imageCategory_id}">
                    <div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="width: ${labelWidth}px;">来源编码<span class="mustItem">*</span></label>
                            <input type="text" id="code" value="${code}" autocomplete="off" class="el-input" placeholder="由1-20位字母、数字、下划线组成，字母开头">
                        </div>
                        <p class="errorMessage" style="padding-left: ${labelWidth}px;display: block;"></p>
                    </div>
                    <div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="width: ${labelWidth}px;">来源名称<span class="mustItem">*</span></label>
                            <input type="text" id="name" value="${name}" autocomplete="off" class="el-input" placeholder="请输入分类名称">
                        </div>
                        <p class="errorMessage" style="padding-left: ${labelWidth}px;display: block;"></p>
                    </div>
                    <div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="width: ${labelWidth}px;">来源所有者<span class="mustItem">*</span></label>
                            <input type="text" id="owner" value="${owner}" class="el-input" placeholder="由1-20位字母、下划线组成">
                        </div>
                        <p class="errorMessage" style="padding-left: ${labelWidth}px;display: block;"></p>
                    </div>
                    <div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="width: ${labelWidth}px;">描述</label>
                            <textarea type="textarea" maxlength="500" id="description" rows="5" class="el-textarea" placeholder="${placeholder}">${description}</textarea>
                        </div>
                        <p class="errorMessage" style="padding-left: ${labelWidth}px;display: block;"></p>
                    </div>
                    <div class="el-form-item ${btnShow}">
                        <div class="el-form-item-div btn-group">
                            <button type="button" class="el-button cancle">取消</button>
                            <button type="button" class="el-button el-button--primary submit ${flag}">确定</button>
                        </div>
                    </div>
        </form>`,
        success: function (layero, index) {
            if (flag == 'view') {
                $('#addImageCategory .el-input,#addImageCategory .el-textarea').attr('readonly', 'readonly');
            } else if (flag == 'edit') {
                $('#addImageCategory #code').attr('readonly', 'readonly');
            }
        },
        end: function () {
            $('.uniquetable tr.active').removeClass('active');
        }
    });
}

function bindEvent() {
    //点击弹框内部关闭dropdown
    $(document).click(function (e) {
        var obj = $(e.target);
        if (!obj.hasClass('el-select-dropdown-wrap') && obj.parents(".el-select-dropdown-wrap").length === 0) {
            $('.el-select-dropdown').slideUp().siblings('.el-select').find('.el-input-icon').removeClass('is-reverse');
        }
        if (!obj.hasClass('.searchModal') && obj.parents(".searchModal").length === 0) {
            $('#searchForm .el-item-hide').slideUp(400, function () {
                $('#searchForm .el-item-show').css('background', 'transparent');
            });
            $('.arrow .el-input-icon').removeClass('is-reverse');
        }
    });
    $('body').on('click', '.formMateriel .cancle', function (e) {
        e.stopPropagation();
        layer.close(layerModal);
    });
    //图纸分类 添加
    $('.button_add').on('click', function () {
        imgCategoryModal('add');
    });

    //排序
    $('.sort-caret').on('click', function (e) {
        e.stopPropagation();
        $('.el-sort').removeClass('ascending descending');
        if ($(this).hasClass('ascending')) {
            $(this).parents('.el-sort').addClass('ascending')
        } else {
            $(this).parents('.el-sort').addClass('descending')
        }
        $(this).attr('data-key');
        ajaxData.order = $(this).attr('data-sort');
        ajaxData.sort = $(this).attr('data-key');
        imgCategoryList();
    });

    //图纸分类 添加提交
    $('body').on('click', '#addImageCategory .submit', function (e) {
        e.stopPropagation();
        var parentForm = $(this).parents('#addImageCategory'),
            flag = parentForm.attr("data-flag");
        var correct = 1;
        for (var type in validatorConfig) {
            correct = validatorConfig[type] && validatorToolBox[validatorConfig[type]](type);
            if (!correct) {
                break;
            }
        }
        if (correct) {
            if (!$(this).hasClass('is-disabled')) {
                $(this).addClass('is-disabled');
                var id = parentForm.find('#itemId').val(),
                    code = parentForm.find('#code').val().trim(),
                    name = parentForm.find('#name').val().trim(),
                    owner = parentForm.find('#owner').val().trim(),
                    description = parentForm.find('#description').val().trim();
                $(this).hasClass('edit') ? (
                    editimgCategory({
                        code: code,
                        name: name,
                        owner: owner,
                        description: description,
                        imageCategory_id: id,
                        _token: TOKEN
                    })
                ) : (
                    addImageCategory({
                        code: code,
                        name: name,
                        owner: owner,
                        description: description,
                        _token: TOKEN
                    })
                )
            }
        }
    })

    //图纸分类查看
    $('.uniquetable').on('click', '.view', function () {
        $(this).parents('tr').addClass('active');
        viewImgCategory($(this).attr("data-id"), 'view')
    });

    //图纸分类 编辑
    $('.uniquetable').on('click', '.edit', function () {
        $(this).parents('tr').addClass('active');
        viewImgCategory($(this).attr("data-id"), 'edit')
    });

    //删除分类
    $('.uniquetable').on('click', '.delete', function () {
        var id = $(this).attr("data-id");
        var num = $('#image_category_table .table_tbody tr').length;
        $(this).parents('tr').addClass('active');
        layer.confirm('将执行删除操作?', {
            icon: 3,
            title: '提示',
            offset: '250px',
            end: function () {
                $('.uniquetable tr.active').removeClass('active');
            }
        }, function (index) {
            layer.close(index);
            deleteImgCategory(id, num);
        });
    });

    $('body').on('click', '.el-select:not(.noedit)', function () {
        $(this).find('.el-input-icon').toggleClass('is-reverse');
        $(this).parents('.el-form-item').siblings().find('.el-select-dropdown').hide();
        $(this).parents('.el-form-item').siblings().find('.el-select .el-input-icon').removeClass('is-reverse');
        $(this).siblings('.el-select-dropdown').toggle();
    });

    //下拉列表项点击事件
    $('body').on('click', '.el-select-dropdown-item:not(disabled)', function (e) {
        e.stopPropagation();
        $(this).parent().find('.el-select-dropdown-item').removeClass('selected');
        $(this).addClass('selected');
        var ele = $(this).parents('.el-select-dropdown').siblings('.el-select');
        var idval = $(this).attr('data-id');
        ele.find('.el-input').val($(this).text());
        ele.find('.val_id').val(idval);
        $(this).parents('.el-select-dropdown').hide();
    });

    //单选按钮点击事件
    $('body').on('click', '.el-radio-input:not(.noedit)', function (e) {
        $(this).parents('.el-radio-group').find('.el-radio-input').removeClass('is-radio-checked');
        $(this).addClass('is-radio-checked');
    });

    //搜索
    $('body').on('click', '#searchForm .submit', function (e) {
        e.stopPropagation();
        $('#searchForm .el-item-hide').slideUp(400, function () {
            $('#searchForm .el-item-show').css('background', 'transparent');
        });
        $('.arrow .el-input-icon').removeClass('is-reverse');
        if (!$(this).hasClass('is-disabled')) {
            $(this).addClass('is-disabled');
            var parentForm = $(this).parents('#searchForm');
            ajaxData.code=parentForm.find('#code').val().trim();
            ajaxData.name=encodeURIComponent(parentForm.find('#name').val().trim());
            ajaxData.owner=parentForm.find('#owner').val().trim();
            ajaxData.creator_name=parentForm.find('#creator_name').val().trim();
            pageNo = 1;
            imgCategoryList();
        }
    });
    //更多搜索条件下拉
    $('#searchForm').on('click', '.arrow:not(".noclick")', function (e) {
        e.stopPropagation();
        $(this).find('.el-icon').toggleClass('is-reverse');
        var that = $(this);
        that.addClass('noclick');
        if ($(this).find('.el-icon').hasClass('is-reverse')) {
            $('#searchForm .el-item-show').css('background', '#e2eff7');
            $('#searchForm .el-item-hide').slideDown(400, function () {
                that.removeClass('noclick');
            });
        } else {
            $('#searchForm .el-item-hide').slideUp(400, function () {
                $('#searchForm .el-item-show').css('background', 'transparent');
                that.removeClass('noclick');
            });
        }
    });

    //搜索重置
    $('body').on('click', '#searchForm .reset:not(.is-disabled)', function (e) {
        e.stopPropagation();
        $(this).addClass('is-disabled');
        var parentForm = $(this).parents('#searchForm');
        parentForm.find('#code').val('');
        parentForm.find('#name').val('');
        parentForm.find('#owner').val('');
        parentForm.find('#creator_name').val('');
        $('.el-select-dropdown-item').removeClass('selected');
        $('.el-select-dropdown').hide();
        resetParam();
        pageNo = 1;
        imgCategoryList();
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
}

$('body').on('input', '.el-item-show #code, #owner ', function (event) {
    event.target.value = event.target.value.replace(/[`~!@#$%^&()\+=<>?:"{}|,.\/;'\\[\]·~！@#￥%……&（）\+={}|《》？：“”【】、；‘’，。、]/im, "");
})
 