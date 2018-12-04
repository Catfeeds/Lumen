var layerModal,
    layerLoading,
    editFlag = '',
    parentId = 0,
    layerEle = '',
    commercial = '',
    warehouse_commercial = '',
    show_unit_id = 0,
    ware_house_unit_id = 0,
    itemSelect = [],
    templateData = [],
    tempSelect = [],
    tempId = {},
    procedureSource = [],
    procedureIds = [],
    codeCorrect = !1, unitCorrect = !1, warehouseUnitCorrect = !1,
    nameCorrect = !1,
    validatorToolBox = {
        checkName: function (name) {
            var value = $('#' + name).val().trim();
            return $('#' + name).parents('.el-form-item').find('.errorMessage').hasClass('active') ? (nameCorrect = !1, !1) :
                Validate.checkNull(value) ? (showInvalidMessage(name, "名称不能为空"), nameCorrect = !1, !1) : (nameCorrect = 1, !0);
        },
        checkCode: function (name) {
            var value = $('#' + name).val().trim();
            return $('#' + name).parents('.el-form-item').find('.errorMessage').hasClass('active') ? (codeCorrect = !1, !1) :
                Validate.checkNull(value) ? (showInvalidMessage(name, "编码不能为空"), codeCorrect = !1, !1) :
                    /[\u4E00-\u9FA5]/g.test(value) ? (showInvalidMessage(name, "编码不能包含中文"), codeCorrect = !1, !1) :
                        (codeCorrect = 1, !0);

            return $('#' + name).parents('.el-form-item').find('.errorMessage').hasClass('active') ? (codeCorrect = !1, !1) :
                Validate.checkNull(value) ? (showInvalidMessage(name, "编码不能为空"), codeCorrect = !1, !1) :
                    !/^[a-zA-Z]\w{0,49}$/g.test(value) ? (showInvalidMessage(name, "由1-49个字母数字下划线组成，且字母开头"), codeCorrect = !1, !1) :
                        (codeCorrect = 1, !0);
        },
        checkUnit: function (name) {
            var value = $('#' + name).val();
            return value == '' || $('#' + name).siblings('.el-input').text() == ' ' ? (showInvalidMessage(name, "请选择单位"), unitCorrect = !1, !1) :
                (unitCorrect = 1, !0);
        },
        checkWarehouseUnit: function (name) {
            var value = $('#' + name).val();
            return value == '' || $('#' + name).siblings('.el-input').text() == ' ' ? (showInvalidMessage(name, "请选择仓库发货单位"), warehouseUnitCorrect = !1, !1) :
                (warehouseUnitCorrect = 1, !0);
        },

    },
    remoteValidatorToolbox = {
        remoteCheckName: function (name, flag, id) {
            var value = $('#' + name).val().trim();
            getUnique(flag, name, value, id, function (rsp) {
                if (rsp.results && rsp.results.exist) {
                    nameCorrect = !1;
                    var val = '已注册';
                    showInvalidMessage(name, val);
                } else {
                    nameCorrect = 1;
                }
            });
        },
        remoteCheckCode: function (name, flag, id) {
            var datacode = $('#parent_id').attr('data-code'),
                value = datacode + $('#' + name).val().trim();
            // console.log(value);
            getUnique(flag, name, value, id, function (rsp) {
                if (rsp.results && rsp.results.exist) {
                    codeCorrect = !1;
                    var val = '已注册';
                    showInvalidMessage(name, val);
                } else {
                    codeCorrect = 1;
                }
            });
        },
    },
    validatorConfig = {
        name: "checkName",
        code: "checkCode",
        unit_id: 'checkUnit',
        store_id: 'checkWarehouseUnit'
    }, remoteValidatorConfig = {
        name: "remoteCheckName",
        code: "remoteCheckCode"
    };
$(function () {
    getMaterielCategories();

    getProcedureSourceData();

    selectMaterialHtml();

    bindEvent();
});
//显示错误信息
function showInvalidMessage(name, val) {
    $('#' + name).parents('.el-form-item').find('.errorMessage').html(val).addClass('active');
    $('#addMCategory_from').find('.submit').removeClass('is-disabled');
}



//获取全部工序数据
function getProcedureSourceData() {
    AjaxClient.get({
        url: URLS['category'].procedureAll + '?' + _token,
        dataType: 'json',
        success: function (rsp) {
            layer.close(layerLoading);

            procedureSource = rsp.results.list;
        },
        fail: function (rsp) {
            layer.close(layerLoading);
        }
    }, this)

}
//获取物料分类列表
function getMaterielCategories() {
    $('.table_tbody').html('');
    AjaxClient.get({
        url: URLS['category'].list + "?" + _token,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            if (rsp.results && rsp.results.length) {
                var parent_id = rsp.results[0].parent_id;
                $('.table_tbody').html(treeHtml(rsp.results, parent_id, 'table'));
            } else {
                noData('暂无数据', 3);
            }
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            noData('获取物料分类列表失败，请刷新重试', 3);
        }
    }, this);
}
//添加物料分类
function addMaterielCategories(data) {
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
            getMaterielCategories();
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            if (rsp && rsp.message != undefined && rsp.message != null) {
                LayerConfig('fail', rsp.message);
            }
            $('body').find('#addMCategory_from').removeClass('disabled').find('.submit').removeClass('is-disabled');
            if (rsp && rsp.field !== undefined) {
                showInvalidMessage(rsp.field, rsp.message);
            }
        }
    }, this);
}
//查看物料分类
function viewMaterielCategories(id, flag) {
    AjaxClient.get({
        url: URLS['category'].show + "?" + _token + "&material_category_id=" + id,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            commercial = rsp.results.commercial;
            warehouse_commercial = rsp.results.warehouse_commercial;
            show_unit_id = rsp.results.unit_id;
            ware_house_unit_id = rsp.results.warehouse_unit_id;
            getCategories(rsp.results.parent_id, flag, rsp.results);
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            console.log('获取该分类失败');
            if (rsp.code == 404) {
                getMaterielCategories();
            }
        }
    }, this);
}
//编辑物料分类
function editMaterielCategories(data) {
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
            // getMaterielCategories();
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            $('body').find('#addMCategory_from').removeClass('disabled').find('.submit').removeClass('is-disabled');
            if (rsp && rsp.field !== undefined) {
                showInvalidMessage(rsp.field, rsp.message);
            }
            if (rsp && rsp.message != undefined && rsp.message != null) {
                LayerConfig('fail', rsp.message);
            }
        }
    }, this);
}
//删除物料分类
function deleteMaterielClass(id) {
    AjaxClient.get({
        url: URLS['category'].delete + "?" + _token + "&material_category_id=" + id,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            // LayerConfig('success','删除成功');
            getMaterielCategories();
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            if (rsp && rsp.message != undefined && rsp.message != null) {
                LayerConfig('fail', rsp.message);
            }
            if (rsp && rsp.code == 404) {
                getMaterielCategories();
            }
        }
    }, this);
}
//获取select列表
function getCategories(id, flag, data) {
    var dtd = $.Deferred();
    var urlLeft = '';
    if (id !== 0) {
        urlLeft = `&material_category_id=${id}`;
    }
    AjaxClient.get({
        url: URLS['category'].selectList + "?" + _token + urlLeft,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            Modal(flag, rsp.results, data);
            dtd.resolve(rsp);
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            console.log('获取上级分类失败');
            dtd.reject(rsp);
        }
    }, this);
    return dtd;
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
        beforeSend: function () {
            // layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            // layer.close(layerLoading);
            fn && typeof fn === 'function' ? fn(rsp) : null;
        },
        fail: function (rsp) {
            console.log('唯一性检测失败');
            // layer.close(layerLoading);
        }
    }, this);
}

function bindEvent() {
    //点击弹框内部关闭dropdown
    $(document).click(function (e) {
        var obj = $(e.target);
        if (!obj.hasClass('el-select-dropdown-wrap') && obj.parents(".el-select-dropdown-wrap").length === 0) {
            $('.el-select-dropdown').slideUp().siblings('.el-select').find('.el-input-icon').removeClass('is-reverse');
        }
    });
    $('body').on('click', '.formMateriel:not(".disabled") .el-select-dropdown-wrap,.procedureModal:not(".disabled") .el-select-dropdown-wrap', function (e) {
        e.stopPropagation();
    });
    $('body').on('click', '.formMateriel:not(".disabled") .cancle,.procedureModal:not(".disabled") .cancle', function (e) {
        e.stopPropagation();
        layer.close(layerModal);
    });
    $('.uniquetable').on('click', '.view', function () {
        $(this).parents('tr').addClass('active');
        viewMaterielCategories($(this).attr("data-id"), 'view');
    });
    $('.uniquetable').on('click', '.edit', function () {
        nameCorrect = !1;
        codeCorrect = !1;
        $(this).parents('tr').addClass('active');
        viewMaterielCategories($(this).attr("data-id"), 'edit');
    });
    $('.uniquetable').on('click', '.delete', function () {
        var id = $(this).attr("data-id");
        $(this).parents('tr').addClass('active');
        layer.confirm('将执行删除操作?', {
            icon: 3, title: '提示', offset: '250px', end: function () {
                $('.uniquetable tr.active').removeClass('active');
            }
        }, function (index) {
            layer.close(index);
            deleteMaterielClass(id);
        });
    });
    $('body').on('click', '.formMateriel:not(".disabled") .el-select,.procedureModal:not(".disabled") .el-select', function () {
        $(this).find('.el-input-icon').toggleClass('is-reverse');
        $(this).siblings('.el-select-dropdown').toggle();
        if (layerEle != '' && $(this).siblings('.el-select-dropdown').is(':visible')) {
            getLayerSelectPosition(layerEle);
        }
    });

    $('body').on('click', '.formMateriel:not(".disabled") .el-select-dropdown-item', function (e) {
        e.stopPropagation();
        $(this).parents('.el-form-item').find('.errorMessage').html('');
        $(this).parent().find('.el-select-dropdown-item').removeClass('selected');
        $(this).addClass('selected');
        
        if ($(this).hasClass('selected')) {
            var ele = $(this).parents('.el-select-dropdown').siblings('.el-select');
            ele.find('.el-input').val($(this).text());
            ele.find('.val_id').val($(this).attr('data-id'));
            ele.find('.val_id').attr('data-code', $(this).attr('data-code'));
            if (ele.find('.val_id').attr('id') == 'unit_id_show') {
                if ($(this).text() == '') {
                    ele.parents('.el-form-item').find('.errorMessage').html('请输入单位');
                } else {
                    ele.parents('.el-form-item').find('.errorMessage').html('');
                }
            }
        }
        $(this).parents('.el-select-dropdown').hide().siblings('.el-select').find('.el-input-icon').removeClass('is-reverse');
    });

    $('body').on('click', '.el-form-item.procedureSelect .el-select-dropdown-item', function (e) {

        $('.selectValue .pleaseChoose').remove();
        e.stopPropagation();

        $(this).parents('.el-select-dropdown').hide().siblings('.el-select').find('.el-input-icon').removeClass('is-reverse');

        var selectInput = $('.selectValue');

        if (!$(this).hasClass('proceDisabled')) {
            var proId = $(this).attr('data-id'), proText = $(this).text();

            var tips = `<span class="proceTip" data-id="${proId}">${proText}<i class="fa fa-close proceTipDel"></i></span>`;

            selectInput.append(tips);
            procedureIds.push({ 'id': proId });
            $('.procedureSelect .errorMessage').html('');

            $(this).addClass('proceDisabled');
        }
        $('.proceTipDel').click(function (e) {
            e.preventDefault();
            e.stopPropagation();

            var ids = $(this).parents('.proceTip').attr('data-id');
            $('.selectValue span').remove('.proceTip[data-id=' + ids + ']');

            $('.el-select-dropdown-item[data-id=' + ids + ']').removeClass('proceDisabled');

            procedureIds.forEach(function (item, index) {
                if (item.id == ids) {
                    procedureIds.splice(index, 1);
                }
            })
        })
    });

    //关联工序
    $('body').on('click', '.table_tbody .procedure', function () {
        var id = $(this).attr('data-id');
        var name = $(this).attr('data-name');
        getMaterialProcedure(id, name);
    });

    $('body').on('click', '#addProcedureModal_form .submit', function () {

        var id = $('#mcategroyName').attr('data-mid');
        $('.procedureSelect .errorMessage').html('');
        var val = JSON.stringify(procedureIds);
        var data = {
            operation_ids: val,
            material_category_id: id,
            _token: TOKEN
        };
        procedureRelationSubmit(data)

    })

    //添加和编辑的提交
    $('body').on('click', '.formMateriel:not(".disabled") .submit', function (e) {
        e.stopPropagation();
        if (!$(this).hasClass('is-disabled')) {
            var parentForm = $(this).parents('#addMCategory_from'),
                id = parentForm.find('#itemId').val(),
                flag = parentForm.attr("data-flag");
                if($('#unit_id_show').val()==''){
                    showInvalidMessage('unit_id_show','请输入单位！')
                    var value = $('#' + name).val();
                    return value == '' || $('#' + name).siblings('.el-input').text() == ' ' ? (showInvalidMessage(name, "请选择单位"), unitCorrect = !1, !1) :
                        (unitCorrect = 1, !0);
                }
                if($('#store_id_show').val()==''){
                    showInvalidMessage('store_id_show','请输入仓库发货单位！')
                    var value = $('#' + name).val();
                    return value == '' || $('#' + name).siblings('.el-input').text() == ' ' ? (showInvalidMessage(name, "请选择仓库发货单位"), warehouseUnitCorrect = !1, !1) :
                        (warehouseUnitCorrect = 1, !0);
                }
            for (var type in validatorConfig) { validatorToolBox[validatorConfig[type]](type); }
            if (nameCorrect && codeCorrect && unitCorrect && warehouseUnitCorrect) {
                $(this).addClass('is-disabled');
                parentForm.addClass('disabled');
                var $unit_id_show = $('#unit_id_show');
                var unit_id_show_val = $unit_id_show.data('inputItem') == undefined || $unit_id_show.data('inputItem') == '' ? '' :
                    $unit_id_show.data('inputItem').commercial == $unit_id_show.val().replace(/\（.*?）/g, "").trim() ? $unit_id_show.data('inputItem').id : '';
                var $store_id_show = $('#store_id_show');
                var store_id_show_val = $store_id_show.data('inputItem') == undefined || $store_id_show.data('inputItem') == '' ? '' :
                    $store_id_show.data('inputItem').commercial == $store_id_show.val().replace(/\（.*?）/g, "").trim() ? $store_id_show.data('inputItem').id : '';

                var name = parentForm.find('#name').val().trim(),
                    datacode = parentForm.find('#parent_id').attr('data-code'),
                    code = datacode + parentForm.find('#code').val().trim(),
                    description = parentForm.find('#description').val().trim(),
                    template_id = parentForm.find('#template_id').val(),
                    unit_id = unit_id_show_val,
                    source = parentForm.find('#source_id').val(),
                    batch_management = parentForm.find('#batch_management').is(':checked') ? 1 : 0,
                    warehouse_management = parentForm.find('#line_management').is(':checked') ? 1 : 0,
                    warehouse_unit = store_id_show_val,
                    parent_id = parentForm.find('#parent_id').val() || 0;
                $(this).hasClass('edit') ? (
                    editMaterielCategories({
                        material_category_id: id,
                        template_id: template_id,
                        name: name,
                        code: code,
                        description: description,
                        unit_id: unit_id,
                        batch_management: batch_management,
                        warehouse_management: warehouse_management,
                        warehouse_unit_id: warehouse_unit,
                        source: source,
                        _token: TOKEN
                    })
                ) : (
                        addMaterielCategories({
                            name: name,
                            code: code,
                            parent_id: parent_id,
                            description: description,
                            template_id: template_id,
                            unit_id: unit_id,
                            batch_management: batch_management,
                            warehouse_management: warehouse_management,
                            warehouse_unit_id: warehouse_unit,
                            source: source,
                            _token: TOKEN
                        })
                    )
            }
        }
    });
    //输入框的相关事件
    $('body').on('focus', '.formMateriel:not(".disabled") .el-input:not([readonly])', function () {
        $(this).parents('.el-form-item').find('.errorMessage').removeClass('active').html("");
    }).on('blur', '.formMateriel:not(".disabled") .el-input:not([readonly])', function () {
        var flag = $('#addMCategory_from').attr("data-flag"),
            name = $(this).attr("id"),
            id = $('#itemId').val();
        validatorConfig[name]
            && validatorToolBox[validatorConfig[name]]
            && validatorToolBox[validatorConfig[name]](name)
            && remoteValidatorConfig[name]
            && remoteValidatorToolbox[remoteValidatorConfig[name]]
            && remoteValidatorToolbox[remoteValidatorConfig[name]](name, flag, id);
    });
    //添加物料分类
    $('.button_add').on('click', function () {
        nameCorrect = !1;
        codeCorrect = !1;
        getCategories(0, 'add');
    });
    //树形表格展开收缩
    $('body').on('click', '.treeNode .itemIcon', function () {
        if ($(this).parents('.treeNode').hasClass('collasped')) {
            $(this).parents('.treeNode').removeClass('collasped').addClass('expand');
            showChildren($(this).parents('.treeNode').attr("data-id"));
        } else {
            $(this).parents('.treeNode').removeClass('expand').addClass('collasped');
            hideChildren($(this).parents('.treeNode').attr("data-id"));
        }
    });
    $('body').on('click', '.search-div .search-icon', function () {
        if ($(this).hasClass('m_category')) {
            var _ele = $(this).siblings('.el-input');
            findAttrval(_ele, 'category');
        } else {
            var ele = $(this).siblings('.el-input');
            findAttrval(ele, 'template');
        }

    });
}
//搜索过滤物料分类单位，模板
function filterAttrData(val, dataArr) {
    return dataArr.filter(function (e) {
        return e.name.indexOf(val) > -1;
    });
}

function findAttrval(ele, flag) {
    if (flag == 'template') {
        var val = ele.val();
        searchMaterialHtml(ele, val);
        console.log('1');
    } else {
        console.log(2);
        var _val = ele.val();
        getSearchCate(ele, _val);
    }
}

function getSearchCate(ele, name) {
    AjaxClient.get({
        url: URLS['category'].selectList + "?" + _token + "&name=" + name,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            if (rsp.results && rsp.results.length) {
                var parent_id = rsp.results[0].parent_id;
                var lis = `<li data-id="" class="el-select-dropdown-item kong" class=" el-select-dropdown-item">--请选择--</li>`;
                lis += treeHtml(rsp.results, parent_id, 'select');
                ele.parent().siblings('.el-select-dropdown-list').html(lis);
            } else {
                ele.parent().siblings('.el-select-dropdown-list').html(`<li data-id="" class="el-select-dropdown-item kong" class=" el-select-dropdown-item">--请选择--</li>`);
            }
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            console.log('获取上级分类失败');
        }
    }, this);
}

$('#unit_id').change(function () {
    AjaxClient.get({
        url: URLS['category'].unitList + "?" + _token + "&like_str=" + $('#unit_id').val(),
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            var lis = '', innerHtml = '';
            if (rsp.results && rsp.results.length) {
                rsp.results.forEach(function (item) {
                    lis += `<li data-id="${item.unit_id}" class="el-select-dropdown-item" class=" el-select-dropdown-item">${item.unit_text}</li>`;
                    if (val && flag == 'view') {
                        if (val == item.id) {
                            $('#unit_id_view').val(item.unit_text)
                        }
                    }
                });
                innerHtml = `
                        <li data-id="" class="el-select-dropdown-item kong" class=" el-select-dropdown-item">--请选择--</li>
                        ${lis}`;
                $('.el-form-item.unit_wrap').find('.el-select-dropdown-list').html(innerHtml);
                if (val) {
                    $('.el-select-dropdown-wrap.unit_wrap').find('.el-select-dropdown-item[data-id=' + val + ']').click();
                }
            }

        },
        fail: function (rsp) {
            layer.close(layerLoading);
            layer.msg('获取模板列表失败', { icon: 5, offset: '250px', time: 1500 });
        }
    })
})

//查看和添加和编辑模态框
function Modal(flag, category, data) {
    var { id = '', code = '', name = '', description = '', parent_id = '', template_id = '', unit_id = '', source = '', warehouse_unit_id = '', batch_management = '',warehouse_management='' } = {};
    if (data) {
        ({ id='', code='', name='', description='', parent_id='', template_id='', unit_id='', source='', warehouse_unit_id='', batch_management='',warehouse_management='' } = data);
    }
    tempId.id = template_id;
    var batch_management_flag,line_management_flag;
    tempId.flag = flag;
    if (batch_management == 1) {
        batch_management_flag = 'checked="checked"'
    }
    if (warehouse_management == 1) {
        line_management_flag = 'checked="checked"'
    }
    var labelWidth = 150,
        btnShow = 'btnShow',
        title = '查看物料分类',
        textareaplaceholder = '',
        readonly = '',
        noEdit = '',
        selecthtml = selectHtml(category, flag, parent_id),
        temp_select = selectTempHtml(templateData, flag, template_id);
    flag === 'view' ? (btnShow = 'btnHide', readonly = 'readonly="readonly"') : (textareaplaceholder = '请输入描述，最多只能输入500字符', flag === 'add' ? title = '添加物料分类' : (title = '编辑物料分类', textareaplaceholder = '', noEdit = 'readonly="readonly"'));
    //$('#unit_id_show').val(rsp.results.depot_name+'（'+rsp.results.line_depot_code+'）').data('inputItem',{id:rsp.results.unit_id,commercial:rsp.results.commercial}).blur();
    layerModal = layer.open({
        type: 1,
        title: title,
        offset: '100px',
        area: ['500px'],
        shade: 0.1,
        shadeClose: false,
        resize: false,
        move: false,
        content: `<form class="addMGroup formModal formMateriel" autocomplete="off" id="addMCategory_from" data-flag="${flag}">
            <input type="hidden" id="itemId" value="${id}">
          <div class="form-content">
          <div class="el-form-item">
            <div class="el-form-item-div">
                <label class="el-form-item-label" style="width: ${labelWidth}px;">上级分类</label>
                ${selecthtml}
            </div>
            <p class="errorMessage" style="padding-left: ${labelWidth}px;display: block;"></p>
          </div>
          <div class="el-form-item">
            <div class="el-form-item-div">
                <label class="el-form-item-label" style="width: ${labelWidth}px;">编码<span class="mustItem">*</span></label>
                <input type="text" id="code" ${readonly} ${noEdit} data-name="编码" class="el-input" placeholder="请输入编码" value="${code}">
            </div>
            <p class="errorMessage" style="padding-left: ${labelWidth}px;display: block;"></p>
          </div>
          <div class="el-form-item">
            <div class="el-form-item-div">
                <label class="el-form-item-label" style="width: ${labelWidth}px;">名称<span class="mustItem">*</span></label>
                <input type="text" id="name" ${readonly} data-name="名称" class="el-input" autocomplete="off" placeholder="请输入名称" value="${name}" maxlength='30'>
            </div>
            <p class="errorMessage" style="padding-left: ${labelWidth}px;display: block;"></p>
          </div>
          <div class="el-form-item unit_wrap">
            <div class="el-form-item-div">
                <label class="el-form-item-label" style="width: ${labelWidth}px;">单位<span class="mustItem">*</span></label>
                <div class="el-select-dropdown-wrap">
                    <input type="text" id="unit_id_show" ${readonly} class="el-input" autocomplete="off" placeholder="请输入单位" value="">
                </div>
            </div>
            <p class="errorMessage" id="unit_id_show_error" style="padding-left: ${labelWidth}px;display: block;"></p>
          </div>
          
          <div class="el-form-item warehouse_unit_wrap">
            <div class="el-form-item-div">
                <label class="el-form-item-label" style="width: ${labelWidth}px;">仓库发货单位<span class="mustItem">*</span></label>
                <div class="el-select-dropdown-wrap">
                    <input type="text" id="store_id_show" ${readonly} class="el-input" placeholder="请输入单位" value="">
                </div>
            </div>
            <p class="errorMessage" style="padding-left: ${labelWidth}px;display: block;"></p>
          </div>
          <div class="el-form-item source_wrap">
            <div class="el-form-item-div">
                <label class="el-form-item-label" style="width: ${labelWidth}px;">来源</label>
                ${flag == 'view' ? `<input type="text" id="source_id_view" readonly class="el-input" value="">` : `
                <div class="el-select-dropdown-wrap source_wrap">
                    <div class="el-select">
                        <i class="el-input-icon el-icon el-icon-caret-top"></i>
                        <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                        <input type="hidden" class="val_id" id="source_id" value="">
                    </div>
                    <div class="el-select-dropdown">
                        <ul class="el-select-dropdown-list">
                            <li data-id="" class="el-select-dropdown-item kong" class=" el-select-dropdown-item">--请选择--</li>
                        </ul>
                    </div>
                </div> `}
            </div>
            <p class="errorMessage" style="padding-left: ${labelWidth}px;display: block;"></p>
          </div>
          <div class="el-form-item materialTempSelect">
            <div class="el-form-item-div">
                <label class="el-form-item-label" style="width: ${labelWidth}px;">批次管理</label>
                <div >
                    <li class="tg-list-item">
                    <input class="tgl tgl-flat" id="batch_management" ${flag == 'view' ? 'disabled="disabled"' : ''} ${batch_management_flag} type="checkbox">
                    <label class="tgl-btn" for="batch_management"></label>
                    </li>
                </div>
                <label class="el-form-item-label" style="width: ${labelWidth}px;">线边仓管理</label>
                <div >
                    <li class="tg-list-item">
                    <input class="tgl tgl-flat" id="line_management" ${flag == 'view' ? 'disabled="disabled"' : ''} ${line_management_flag} type="checkbox">
                    <label class="tgl-btn" for="line_management"></label>
                    </li>
                </div>
            </div>
            <p class="errorMessage" style="padding-left: ${labelWidth}px;display: block;"></p>
          </div>
        
          <div class="el-form-item materialTempSelect">
            <div class="el-form-item-div">
                <label class="el-form-item-label" style="width: ${labelWidth}px;">物料模板</label>
                ${temp_select}
            </div>
            <p class="errorMessage" style="padding-left: ${labelWidth}px;display: block;"></p>
          </div>
          <div class="el-form-item">
            <div class="el-form-item-div">
                <label class="el-form-item-label" style="width: ${labelWidth}px;">描述</label>
                <textarea type="textarea" ${readonly} maxlength="500" id="description" rows="5" class="el-textarea" placeholder="${textareaplaceholder}">${description}</textarea>
            </div>
            <p class="errorMessage" style="display: block;"></p>
          </div>
          </div>
          <div class="el-form-item ${btnShow}">
            <div class="el-form-item-div btn-group">
                <button type="button" class="el-button cancle">取消</button>
                <button type="button" id="materiel" class="el-button el-button--primary submit ${flag}">确定</button>
            </div>
          </div>
        </form>` ,
        success: function (layero, index) {
            getLayerSelectPosition($(layero));
            selectUnitHtml(unit_id, flag);
            selectWarehouseUnitHtml(warehouse_unit_id, flag);
            selectMaterialSource(source, flag);
            $('#unit_id_show').val(commercial).data('inputItem', { commercial: commercial, id: show_unit_id }).blur();
            $('#store_id_show').val(warehouse_commercial).data('inputItem', { commercial: warehouse_commercial, id: ware_house_unit_id }).blur();
            $('#unit_id_show').autocomplete({
                url: URLS['category'].unitList + "?" + _token + "&page_no=1&page_size=10",
                param: 'like_str',
                showCode: 'commercial'
            });
            $('#store_id_show').autocomplete({
                url: URLS['category'].unitList + "?" + _token + "&page_no=1&page_size=10",
                param: 'like_str',
                showCode: 'commercial'
            });
            if(flag == 'view'){
                $('.el-form-item.unit_wrap').css('pointer-events','none');
                $('.el-form-item.warehouse_unit_wrap').css('pointer-events','none');
            }
        },
        end: function () {
            $('.uniquetable tr.active').removeClass('active');
        }
    });
}
//物料来源
function selectMaterialSource(val, flag) {
    var lis = '', innerHtml = '';
    meterielSource.forEach(function (item) {
        lis += `<li data-id="${item.id}" class="el-select-dropdown-item" class=" el-select-dropdown-item">${item.name}</li>`;
        if (val && flag == 'view') {
            if (val == item.id) {
                $('#source_id_view').val(item.name)
            }
        }
    });
    innerHtml = `
                <li data-id="" class="el-select-dropdown-item kong" class=" el-select-dropdown-item">--请选择--</li>
                ${lis}`;
    $('.el-form-item.source_wrap').find('.el-select-dropdown-list').html(innerHtml);
    if (val) {
        $('.el-select-dropdown-wrap.source_wrap').find('.el-select-dropdown-item[data-id=' + val + ']').click();
    }

}
//单位下拉
function selectUnitHtml(val, flag) {
    AjaxClient.get({
        url: URLS['category'].unitList + '?' + _token,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            var lis = '', innerHtml = '';
            if (rsp.results && rsp.results.length) {
                rsp.results.forEach(function (item) {
                    lis += `<li data-id="${item.unit_id}" class="el-select-dropdown-item" class=" el-select-dropdown-item">${item.unit_text}</li>`;
                    if (val && flag == 'view') {
                        if (val == item.id) {
                            $('#unit_id_view').val(item.unit_text)
                        }
                    }
                });
                innerHtml = `
                        <li data-id="" class="el-select-dropdown-item kong" class=" el-select-dropdown-item">--请选择--</li>
                        ${lis}`;
                $('.el-form-item.unit_wrap').find('.el-select-dropdown-list').html(innerHtml);
                if (val) {
                    $('.el-select-dropdown-wrap.unit_wrap').find('.el-select-dropdown-item[data-id=' + val + ']').click();
                }
            }

        },
        fail: function (rsp) {
            layer.close(layerLoading);
            layer.msg('获取模板列表失败', { icon: 5, offset: '250px', time: 1500 });
        }
    }, this)
}
//单位下拉
function selectWarehouseUnitHtml(val, flag) {
    AjaxClient.get({
        url: URLS['category'].unitList + '?' + _token,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            var lis = '', innerHtml = '';
            if (rsp.results && rsp.results.length) {
                rsp.results.forEach(function (item) {
                    lis += `<li data-id="${item.unit_id}" class="el-select-dropdown-item" class=" el-select-dropdown-item">${item.unit_text}</li>`;
                    if (val && flag == 'view') {
                        if (val == item.id) {
                            $('#warehouse_unit_view').val(item.unit_text)
                        }
                    }
                });
                innerHtml = `
                        <li data-id="" class="el-select-dropdown-item kong" class=" el-select-dropdown-item">--请选择--</li>
                        ${lis}`;
                $('.el-form-item.warehouse_unit_wrap').find('.el-select-dropdown-list').html(innerHtml);
                if (val) {
                    $('.el-select-dropdown-wrap.warehouse_unit_wrap').find('.el-select-dropdown-item[data-id=' + val + ']').click();
                }
            }

        },
        fail: function (rsp) {
            layer.close(layerLoading);
            layer.msg('获取模板列表失败', { icon: 5, offset: '250px', time: 1500 });
        }
    }, this)
}
//物料模板下拉select
function selectMaterialHtml() {
    var dtd = $.Deferred();
    AjaxClient.get({
        url: URLS['template'].select + '?' + _token,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            templateData = rsp.results;
            dtd.resolve(rsp);
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            layer.msg('获取模板列表失败', { icon: 5, offset: '250px', time: 1500 });
            dtd.reject(rsp);
        }
    }, this);
    return dtd;
}
function searchMaterialHtml(ele, name) {
    AjaxClient.get({
        url: URLS['template'].select + '?' + _token + '&name=' + name,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            if (rsp.results && rsp.results.length) {
                var parent_id = rsp.results[0].parent_id;
                var lis = `<li data-id="" class="el-select-dropdown-item kong" class=" el-select-dropdown-item">--请选择--</li>`;
                lis += treeHtml(rsp.results, parent_id, 'template');
                ele.parent().siblings('.el-select-dropdown-list').html(lis);
            } else {
                ele.parent().siblings('.el-select-dropdown-list').html(`<li data-id="" class="el-select-dropdown-item kong" class=" el-select-dropdown-item">--请选择--</li>`);
            }
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            layer.msg('获取模板列表失败', { icon: 5, offset: '250px', time: 1500 });

        }
    }, this);
}
//生成上级分类数据
function selectHtml(fileData, flag, value) {
    var elSelect, innerhtml, selectVal, lis = '', parent_id = '';
    if (fileData.length) {
        parent_id = fileData[0].parent_id;
        lis = treeHtml(fileData, parent_id, 'select', value);
    }
    itemSelect.length ? (selectVal = itemSelect[0].name, parent_id = itemSelect[0].id) :
        (flag == 'view' || flag == 'edit' ? (selectVal = '无', parent_id = 0) : (selectVal = '--请选择--', parent_id = 0));
    if (flag === 'view' || flag === 'edit') {
        innerhtml = `<div class="el-select">
			<input type="text" readonly="readonly" id="selectVal" class="el-input readonly" value="${selectVal}">
			<input type="hidden" class="val_id" data-code="" id="parent_id" value="${parent_id}">
		</div>`;
    } else {
        innerhtml = `<div class="el-select">
			<i class="el-input-icon el-icon el-icon-caret-top"></i>
			<input type="text" readonly="readonly" id="selectVal" class="el-input" value="--请选择--">
			<input type="hidden" class="val_id" data-code="" id="parent_id" value="">
		</div>
		<div class="el-select-dropdown">
            <div class="search-div">
                <input type="text" class="el-input el-input-search" placeholder="搜索"/>
                <span class="search-icon search-span m_category"><i class="fa fa-search"></i></span>
            </div>
			<ul class="el-select-dropdown-list">
				<li data-id="0" data-pid="0" data-code="" data-name="--请选择--" class=" el-select-dropdown-item">--请选择--</li>
				${lis}
			</ul>
		</div>`;
    }
    elSelect = `<div class="el-select-dropdown-wrap">
			${innerhtml}
		</div>`;
    itemSelect = [];
    return elSelect;
}
//生成模板数据
function selectTempHtml(fileData, flag, value) {

    var elSelect, innerhtml, selectVal, lis = '', parent_id = '';
    if (fileData.length) {
        parent_id = fileData[0].parent_id;
        lis = treeHtml(fileData, parent_id, 'template', value);
    }

    tempSelect.length ? (selectVal = tempSelect[0].name, parent_id = tempSelect[0].id) :
        (flag == 'view' ? (selectVal = '无', parent_id = 0) : (selectVal = '--请选择--', parent_id = 0));
    if (flag === 'view') {
        innerhtml = `<div class="el-select">
			<input type="text" readonly="readonly" id="selectVal" class="el-input readonly" value="${selectVal}">
			<input type="hidden" class="val_id" data-code="" id="template_id" value="${parent_id}">
		</div>`;
    } else {
        innerhtml = `<div class="el-select">
			<i class="el-input-icon el-icon el-icon-caret-top"></i>
			<input type="text" readonly="readonly" id="selectVal" class="el-input" value="${flag == 'edit' ? selectVal : '--请选择--'}">
			<input type="hidden" class="val_id" data-code="" id="template_id" value="">
		</div>
		<div class="el-select-dropdown">
            <div class="search-div">
                <input type="text" class="el-input el-input-search" placeholder="搜索"/>
                <span class="search-icon search-span"><i class="fa fa-search"></i></span>
            </div>
			<ul class="el-select-dropdown-list">
				<li data-id="0" data-pid="0" data-code="" data-name="--请选择--" class=" el-select-dropdown-item">--请选择--</li>
				${lis}
			</ul>
		</div>`;
    }
    elSelect = `<div class="el-select-dropdown-wrap">
			${innerhtml}
		</div>`;
    tempSelect = [];
    return elSelect;
}

//生成树结构
function treeHtml(fileData, parent_id, flag, value) {

    var _html = '';
    var children = getChildById(fileData, parent_id);
    var hideChild = parent_id > 0 ? 'none' : '';
    children.forEach(function (item, index) {
        var lastClass = index === children.length - 1 ? 'last-tag' : '';
        var level = item.level;
        var distance, className, itemImageClass, tagI, itemcode = '';
        var hasChild = hasChilds(fileData, item.id);
        hasChild ? (className = 'treeNode expand', itemImageClass = 'el-icon itemIcon') : (className = '', itemImageClass = '');
        flag === 'table' ? (distance = level * 25, tagI = `<i class="tag-i ${itemImageClass}"></i>`, itemcode = `(${item.code})`) : (distance = level * 20, tagI = '', itemcode = '');
        var selectedClass = '';
        var span = level ? `<div style="padding-left: ${distance}px;">${tagI}<span class="tag-prefix ${lastClass}"></span><span>${item.name}</span> ${itemcode}</div>` : `${tagI}<span>${item.name}</span> ${itemcode}`;
        if (flag === 'table') {
            _html += `
	        <tr data-id="${item.id}" data-pid="${parent_id}" class="${className}">
	          <td>${span}</td>
	          <td><div>${item.description.length > 30 ? item.description.substring(0, 30) + '...' : item.description}</div></td>
	          <td class="right">
	            <button data-id="${item.id}" data-name="${item.name}" data-pid="${parent_id}" class="button pop-button procedure">关联工序</button>
                <button data-id="${item.id}" data-pid="${parent_id}" class="button pop-button view">查看</button>
                <button data-id="${item.id}" data-pid="${parent_id}" class="button pop-button edit">编辑</button>
                <button data-id="${item.id}" data-pid="${parent_id}" class="button pop-button delete">删除</button>
              </td>
            </tr>
	        ${treeHtml(fileData, item.id, flag)}
	        `;
        } else {
            if (flag == 'template') {
                item.id == value ? (tempSelect.push(item), selectedClass = 'selected') : null;
            } else {
                item.id == value ? (itemSelect.push(item), selectedClass = 'selected') : null;
            }

            _html += `
    		<li data-id="${item.id}" data-pid="${parent_id}" data-code="${item.code}" data-name="${item.name}" class="${className} el-select-dropdown-item ${selectedClass}">${span}</li>
	        ${treeHtml(fileData, item.id, flag, value)}
	        `;
        }
    });
    return _html;
};

function getMaterialProcedure(id, name) {

    AjaxClient.get({
        url: URLS['category'].procedure + '?' + _token + '&material_category_id=' + id,
        dataType: 'json',
        success: function (rsp) {

            addProcedureModal(id, name, rsp.results);
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            if (rsp && rsp.message != undefined && rsp.message != null) {
                LayerConfig('fail', rsp.message);
            }
        }
    }, this);
}

function procedureRelationSubmit(data) {

    AjaxClient.post({
        url: URLS['category'].procedureMcate,
        data: data,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            layer.close(layerModal);
            getMaterielCategories();
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            layer.close(layerModal);
            if (rsp && rsp.message != undefined && rsp.message != null) {
                LayerConfig('fail', rsp.message);
            }

            if (rsp && rsp.code == 404) {
                getMaterielCategories();
            }
        }
    }, this)
}

function addProcedureModal(id, name, data) {
    procedureIds = [];

    var labelWidth = 100, readonly = "readonly='readonly'", btnShow = 'btnShow', procedureitem = '';

    if (procedureSource && procedureSource.length) {

        procedureSource.forEach(function (item, index) {

            procedureitem += `<li data-id="${item.id}" data-name="${item.name}" class=" el-select-dropdown-item">${item.name}</li>`
        })
    }

    layerModal = layer.open({
        type: 1,
        title: '关联工序',
        offset: '100px',
        area: '500px',
        shade: 0.1,
        shadeClose: false,
        resize: false,
        move: false,
        content: `<form class="addProcedureModal formModal procedureModal" id="addProcedureModal_form" data-flag="">
                    <div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="width: ${labelWidth}px;">分类名称</label>
                            <input type="text" id="mcategroyName" ${readonly} data-name="分类名称" data-mid="${id}" class="el-input" placeholder="" value="${name}">
                        </div>
                        <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
                    </div>
                     <div class="el-form-item procedureSelect">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="width: ${labelWidth}px;">关联工序<span class="mustItem">*</span></label>
                            <div class="el-select-dropdown-wrap">
                                <div class="el-select">
                                    <div class="selectValue"><span class="pleaseChoose">--请选择--</span></div>
                                    <input type="hidden" class="val_id" id="nextProcedure" value="">
                                </div>
                                <div class="el-select-dropdown">
                                    <ul class="el-select-dropdown-list">
                                        <li data-id="" class="el-select-dropdown-item kong proceDisabled" data-name="--请选择--">--请选择--</li>
                                        ${procedureitem}
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
                    </div>
                    <div class="el-form-item ${btnShow}">
                        <div class="el-form-item-div btn-group">
                            <button type="button" class="el-button cancle">取消</button>
                            <button type="button" class="el-button el-button--primary submit">确定</button>
                        </div>
                    </div>
            </form>`,
        success: function (layero, index) {
            layerEle = layero;
            getLayerSelectPosition($(layero));

            if (data.length) {
                $('.pleaseChoose').remove();
                var selectInput = $('.selectValue');
                data.forEach(function (item, index) {
                    var tips = `<span class="proceTip" data-id="${item.operation_id}">${item.operation_name}<i class="fa fa-close proceTipDel"></i></span>`;

                    selectInput.append(tips);
                    procedureIds.push({ 'id': item.operation_id });
                    $('.procedureSelect .errorMessage').html('');

                    $('.procedureSelect .el-select-dropdown-item[data-id=' + item.operation_id + ']').addClass('proceDisabled');
                })

                $('.proceTipDel').click(function (e) {
                    e.preventDefault();
                    e.stopPropagation();

                    var ids = $(this).parents('.proceTip').attr('data-id');
                    $('.selectValue span').remove('.proceTip[data-id=' + ids + ']');

                    $('.el-select-dropdown-item[data-id=' + ids + ']').removeClass('proceDisabled');

                    procedureIds.forEach(function (item, index) {
                        if (item.id == ids) {
                            procedureIds.splice(index, 1);
                        }
                    })
                })
            }

        },
        end: function () {
            $('.uniquetable tr.active').removeClass('active');
        }
    })
}