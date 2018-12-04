var layerLoading,
    layerEle,
    layerModal,
    layerConfirm,
    pageNo = 1,
    pageMaNo = 1,
    pageSize = 10,
    picData = [],
    attrData = {
        operation_attributes: [],
        material_attributes: []
    },
    unitData = [],
    typeData = [],
    categoryData = [],
    itemnoCorrect = !1,
    nameCorrect = !1,
    categoryCorrect = 1,
    unitCorrect = !1,
    stockCorrect = 1,
    attrCorrect = 1;
tapFlag = 'addMBasic_from',
    creator_token = '',
    templateid = 0,
    picviewUrl = '',
    mActionFlag = '',
    material_id = '',
    setting_id = 0,
    automatic_number = 0,
    copy = '',
    saveFlag = false,
    ajaxMaterialData = {},
    ajaxPicData = {},
    ajaxAttrData = {},
    ajaxSubmitData = {},
    ajaxSameData = {},
    validatorToolBox = {
        checkItemno: function (name) {
            var value = automatic_number == 2 ? $('#' + name).attr('data-val') || '' : $('#' + name).val().trim();
            return Validate.checkNull(value) ? (showInvalidMessage(name, "物料编码不能为空"), itemnoCorrect = !1, !1) :
                !Validate.checkItemno(value) ? (showInvalidMessage(name, "物料编码由4-20位字母数字下划线组成"), itemnoCorrect = !1, !1) :
                    (itemnoCorrect = 1, !0);
        },
        checkName: function (name) {
            var value = $('#' + name).val().trim();
            return Validate.checkNull(value) ? (showInvalidMessage(name, "名称不能为空"), nameCorrect = !1, !1) :
                (nameCorrect = 1, !0);
        },
        checkCategory: function (name) {
            var ele = $('.bom-tree').find('.item-name.selected');
            if (ele.length && ele.attr('data-post-id') != '') {
                ele.parents('.el-form-item').find('.errorMessage').html('');
                categoryCorrect = !0;
                return !0;
            } else {
                showInvalidMessage('material_category_id', '物料分类必选');
                categoryCorrect = !1;
                return !1;
            }
        },
        checkUnit: function (name) {
            var val = $('#' + name).val(), cname = $('#' + name).siblings('.el-input').val();
            return val == '' || cname == '--请选择--' ? (showInvalidMessage('unit_id', '单位必填'), unitCorrect = !1, !1) : (unitCorrect = !0, !0);
        },
        checkStock: function (name) {
            stockCorrect = 1;
            var mval = $('#min_stock').val().trim(),
                mmval = $('#max_stock').val().trim(),
                dval = $('#' + name).val().trim();
            var minValue = Number(mval),
                maxValue = Number(mmval),
                defValue = Number(dval);

            if (mval !== '' && mmval !== '' && dval !== '') {
                return (defValue < minValue || defValue > maxValue) ? (showInvalidMessage(name, "安全库存应在最高和最低之间"), stockCorrect = !1, !1) :
                    (stockCorrect = 1, !0);
            } else if (mval !== '' && dval !== '') {
                return (defValue < minValue) ? (showInvalidMessage(name, "安全库存应该大于等于最低库存"), stockCorrect = !1, !1) :
                    (stockCorrect = 1, !0);
            } else if (mmval !== '' && dval !== '') {
                return (defValue > maxValue) ? (showInvalidMessage(name, "安全库存应该小于等于最高库存"), stockCorrect = !1, !1) :
                    (stockCorrect = 1, !0);
            } else if (mval !== '' && mmval !== '') {
                return (maxValue < minValue) ? (showInvalidMessage(name, "最高库存应大于等于最低库存"), stockCorrect = !1, !1) :
                    (stockCorrect = 1, !0);
            } else {
                return stockCorrect;
            }
        },
        checkAttr: function (name) {
            var ele = $('.attr-container');
            attrCorrect = 1;
            ele.find('.el-form-item:not(.btnShow)').each(function () {
                if ($(this).find('.attr-val').val().trim() == '') {
                    attrCorrect = !1;
                    return false;
                }
            });
            return attrCorrect;
        }
    },
    remoteValidatorToolbox = {
        remoteCheckItemno: function (name) {
            var value = automatic_number == 2 ? $('#' + name).attr('data-val') || '' : $('#' + name).val().trim();
            ;
            getUnique(name, value, function (rsp) {
                if (rsp.results && rsp.results.exist) {
                    itemnoCorrect = !1;
                    var val = '已注册';
                    showInvalidMessage(name, val);
                } else {
                    itemnoCorrect = 1;
                }
            });
        },
        remoteCheckName: function (name) {
            var value = $('#' + name).val().trim();
            getUnique(name, value, function (rsp) {
                if (rsp.results && rsp.results.exist) {
                    nameCorrect = !1;
                    var val = '已注册';
                    showInvalidMessage(name, val);
                } else {
                    nameCorrect = 1;
                }
            });
        }
    },
    validatorConfig = {
        material_category_id: 'checkCategory',
        item_no: "checkItemno",
        name: "checkName",
        unit_id: 'checkUnit',
        safety_stock: 'checkStock',
        attr: 'checkAttr'
    }, remoteValidatorConfig = {
    item_no: "remoteCheckItemno"
};

document.getElementById("moq").addEventListener("input",function(event){
    event.target.value = event.target.value.replace(/\-/g,"");
});
document.getElementById("mpq").addEventListener("input",function(event){
    event.target.value = event.target.value.replace(/\-/g,"");
});
document.getElementById("weight").addEventListener("input",function(event){
    event.target.value = event.target.value.replace(/\-/g,"");
});
document.getElementById("length").addEventListener("input",function(event){
    event.target.value = event.target.value.replace(/\-/g,"");
});
document.getElementById("width").addEventListener("input",function(event){
    event.target.value = event.target.value.replace(/\-/g,"");
});
document.getElementById("height").addEventListener("input",function(event){
    event.target.value = event.target.value.replace(/\-/g,"");
});


//错误tab
var tabError = {
    'addMBasic_from': ['name', 'material_category_id', 'item_no', 'unit_id'],
    'addMAttr_from': ['material_attributes', 'operation_attributes', 'template_id'],
    'addMPlan_from': ['safety_stock']
};
var ziduan = {
    'addMBasic_from': ['name', 'batch_no_prefix', 'label', 'item_no', 'moq', 'weight', 'description', 'mpq', 'length', 'width', 'height'],
    'addMPlan_from': ['fixed_advanced_period', 'cumulative_lead_time', 'safety_stock', 'max_stock', 'min_stock']
};
$(function () {
    // creator_token=getCookie("session_emi2c_mlily_demo");
    creator_token = getCookie("session_emi2c_mlily_demo");
    ajaxSubmitData.creator_token = '24ed0q9gukcdnnb3tjcna1unj7';
    // ajaxSubmitData.creator_token='24ed0q9gukcdnnb3tjcna1unj7';
    picviewUrl = $('#pic_view').val();
    $('.el-tap-wrap').addClass('edit');
    $('.el-button.next').addClass('edit');
    var url = window.location.pathname.split('/');
    if (url.indexOf('materialEdit') > -1) {
        $('#showLog').removeClass('none');
        mActionFlag = 'edit';
        material_id = getQueryString('id');
        copy = getQueryString('copy');
        if (copy != undefined && copy != "") {//复制物料
            mActionFlag = 'add';
        } else {
            $('.el-button.submit').addClass('edit');
        }
        material_id != undefined ? ajaxDone(material_id) : LayerConfig('fail', 'url链接缺少id参数，请给到id参数');
        // $('.saveoption').addClass('edit');
    } else {
        mActionFlag = 'add';
        $.when(getTemplate()).done(getCategory());
        // getTemplate();//模板
        // getCategory();//分类
        getUnit();//单位
        fileinit('attachment', [], []);
    }
    bindEvent();
    $('.bom_tree_container').height($(window).height() - 200);
    $('.el-form-item.source .divwrap').html(createSource(meterielSource, 1, 'source'));
});

//附件初始化
function fileinit(ele, preUrls, preOther) {
    $('#' + ele).fileinput({
        'theme': 'explorer-fa',
        language: 'zh',
        uploadAsync: true,
        'uploadUrl': URLS['material'].uploadAttachment,
        uploadExtraData: function (previewId, index) {
            var obj = {};
            obj.flag = 'material';
            obj._token = TOKEN;
            obj.creator_token = ajaxSubmitData.creator_token;
            return obj;
        },
        initialPreview: preUrls,
        initialPreviewConfig: preOther,
        dropZoneEnabled: false,
        showCaption: false,
        showClose: false,
        showUpload: false,
        showRemove: false,
        maxFileSize: 500 * 1024,
        maxFileCount: 1,
        overwriteInitial: false,
        showCancel: false
    }).on('fileselect', function (event, numFiles, label) {
        $(this).fileinput("upload");
    }).on('fileloaded', function (event, file, previewId, index, reader) {
        // console.log(previewId)
        //   console.log(file.lastModified);
        // $('#'+previewId).attr('data-preview','preview-'+file.lastModified);
    }).on('filepreupload', function (event, data, previewId, index) {
        // console.log(previewId);
        // console.log(data);
        // console.log(data.files[0].lastModified);
        $('#' + previewId).attr('data-preview', 'preview-' + data.files[0].lastModified);
    }).on('fileuploaded', function (event, data, previewId, index) {
        var result = data.response,
            file = data.files[0];
        // console.log(result);
        if (result.code == '200') {
            $('.file-preview-frame[data-preview=preview-' + file.lastModified + ']').addClass('uploaded').attr({
                'data-url': result.results.path,
                'attachment_id': result.results.attachment_id
            }).find('td.creator').html(`<p class="creator_name">${result.results.creator}</p>
            <p class="creator_time">${result.results.time}</p>`).removeAttr('data-preview');
        } else {
            var ele = $('.file-preview-frame[data-preview=' + previewId + ']');
            ele.remove();
            var errorHtml = `<button type="button" class="close kv-error-close" aria-label="Close">
                           <span aria-hidden="true">×</span>
                        </button>
                        <ul>
                            <li>${result.message}</li>
                        </ul>`;
            $('.kv-fileinput-error.file-error-message').html(errorHtml).show();
            console.log('文件上传失败' + previewId);
        }
    }).on('filebeforedelete', function (event, key, data) {
        console.log('初始化附件删除');
    });
}


//显示错误信息
function showInvalidMessage(name, val) {
    $('#' + name).parents('.el-form-item').find('.errorMessage').html(val);
}

//物料搜索分页绑定
function bindPagenationClick(ele, totalData, pageSize, fn) {
    $('#' + ele).find('.pagenation').show();
    $('#' + ele).find('.pagenation').pagination({
        totalData: totalData,
        showData: pageSize,
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
            fn();
        }
    });
}

//相同物料分页
function bindSamePagenationClick(ele, totalData, pageno, pageSize, fn) {
    $('#' + ele).find('.pagenation').show();
    $('#' + ele).find('.pagenation').pagination({
        totalData: totalData,
        showData: pageSize,
        current: pageno,
        isHide: true,
        coping: true,
        homePage: '首页',
        endPage: '末页',
        prevContent: '上页',
        nextContent: '下页',
        jump: true,
        callback: function (api) {
            pageno = api.getCurrent();
            fn(pageno);
        }
    });
}

function ajaxDone(id) {
    $.when(getCategory(), getTemplate(), getUnit())
        .done(function () {
            getMaterial(id);
        }).fail(function () {
        console.log('获取物料分类，单位或物料模板失败');
    }).always(function () {
        layer.close(layerLoading);
    });
}

//获取编码
function getCode(typecode, mid) {
    var data = {
        _token: TOKEN,
        type_code: typecode,
        material_category_id: mid,
        action_code: creator_token,
        type: 1
    };
    AjaxClient.post({
        url: URLS['material'].getCode,
        data: data,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            if (rsp && rsp.results) {
                setting_id = rsp.results.encoding_setting_id;
                automatic_number = rsp.results.automatic_number;
                if (rsp.results.automatic_number == '1') {//自动生成允许手工改动
                    $('#addMBasic_from #item_no').val(rsp.results.code).removeAttr('readonly').attr('data-val', rsp.results.code);
                } else if (rsp.results.automatic_number == '2') {//自动生成不允许手工改动
                    var len = Number(rsp.results.serial_number_length),
                        start = rsp.results.code.length - len;
                    var newCode = rsp.results.code.substring(0, start) + new Array(len + 1).join('*');
                    $('#addMBasic_from #item_no').val(newCode).attr({
                        'readonly': 'readonly',
                        'data-val': rsp.results.code
                    });
                } else {
                    $('#addMBasic_from #item_no').removeAttr('readonly');
                }
            } else {
                console.log('获取物料分类编码失败');
            }
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            console.log('获取物料分类编码失败');
        }
    }, this);
}

//获取物料详细信息
function getMaterial(id) {
    var dtd = $.Deferred();
    AjaxClient.get({
        url: URLS['material'].show + "?" + _token + "&material_id=" + id,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            if (rsp && rsp.results) {
                setData(rsp.results);
            } else {
                console.log('获取物料信息失败');
            }
            dtd.resolve(rsp);
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            console.log('获取物料信息失败');
            dtd.reject(rsp);
        }
    }, this);
    return dtd;
}

// 物料模板列表
function getTemplate() {
    var dtd = $.Deferred();
    AjaxClient.get({
        url: URLS['template'].select + "?" + _token,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            if (rsp && rsp.results && rsp.results.length) {
                $('.el-form-item.template .errorMessage').html('');
                var templatelis = selectHtml(rsp.results, 'template_id');
                $('.el-form-item.template').find('.val_id').val('').siblings('.el-input').val('--请选择--');
                $('.el-form-item.template').find('.el-select-dropdown').html(templatelis);
            } else {
                $('.el-form-item.template').find('.el-select-dropdown').html(`<ul class="el-select-dropdown-list">
                        <li data-id="" data-name="" class="el-select-dropdown-item kong">--请选择--</li>
                    </ul>`);
                $('.el-form-item.template .errorMessage').html('物料模板无数据,无法使用模板');
            }
            dtd.resolve(rsp);
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            console.log('获取物料模板列表失败');
            dtd.reject(rsp);
        }
    }, this);
    return dtd;
}

// 获得分类
function getCategory() {
    var dtd = $.Deferred();
    AjaxClient.get({
        url: URLS['category'].selectList + "?" + _token,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            if (rsp && rsp.results && rsp.results.length) {
                categoryData = rsp.results;
                var catehtml = treeList(rsp.results, rsp.results[0].parent_id);
                $('.categoryTree').find('.bom-tree').html(catehtml);
            } else {
                $('.el-form-item.category .errorMessage').html('暂无物料分类，请先完善');
            }
            dtd.resolve(rsp);
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            $('.el-form-item.category .errorMessage').html('获取物料分类失败，请重试');
            dtd.reject(rsp);
        }
    }, this);
    return dtd;
}

//获取物料属性
function getMaterialAtrr(id, flag, editFlag) {
    AjaxClient.get({
        url: URLS['material'].attrlist + "?" + _token + "&template_id=" + id,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            if (rsp && rsp.results) {
                if (mActionFlag == 'edit' && editFlag) {
                    if (flag == 'attr') {
                        var allattr = [];
                        if (rsp.results.forefathers && rsp.results.forefathers.length) {
                            rsp.results.forefathers.forEach(function (item) {
                                allattr.push.apply(allattr, item.material_attributes || []);
                            });
                        }
                        if (rsp.results.self) {
                            allattr.push.apply(allattr, rsp.results.self.material_attributes || []);
                        }
                        ChooseParentModal(allattr, 'attr');
                    } else {
                        var allopattr = [];
                        if (rsp.results.self) {
                            allopattr = rsp.results.self.operation_attributes || [];
                        }
                        ChooseParentModal(allopattr, 'opattr');
                    }
                } else {
                    var parent = '', opattr = '';
                    if (rsp.results.forefathers && rsp.results.forefathers.length) {
                        var parentdiv = createAttrHtml(rsp.results.forefathers, 'parent', 'attr');
                        if (parentdiv != '') {
                            parent += '<div class="parentdiv">' + parentdiv + '</div>';
                        }
                    }
                    if (rsp.results.self) {
                        parent += createAttrHtml(rsp.results.self, 'self', 'attr');
                        opattr = createAttrHtml(rsp.results.self, 'self', 'opattr');
                    }
                    opattr == '' ? ($('#addMAttr_from .mgattr-container').hide()) : ($('#addMAttr_from .mgattr-container').show().find('.mattr-con-detail').html(opattr));
                    parent == '' ? ($('#addMAttr_from .mattr-container').hide()) : ($('#addMAttr_from .mattr-container').show().find('.mattr-con-detail').html(parent));
                }
            } else {
                console.log('获取物料属性失败');
            }
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            console.log('获取物料属性失败');
        }
    }, this);
}

//复制模板获取属性及值
function getTemCopyAttr(tid, mid) {
    AjaxClient.get({
        url: URLS['material'].temAttrList + "?" + _token + "&template_id=" + tid + "&material_id=" + mid,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            if (rsp && rsp.results) {
                var parent = '', opattr = '';
                if (rsp.results.forefathers && rsp.results.forefathers.length) {
                    var parentdiv = createAttrHtml(rsp.results.forefathers, 'parent', 'attr');
                    if (parentdiv != '') {
                        parent += '<div class="parentdiv">' + parentdiv + '</div>';
                    }
                }
                if (rsp.results.self) {
                    parent += createAttrHtml(rsp.results.self, 'self', 'attr');
                    opattr = createAttrHtml(rsp.results.self, 'self', 'opattr');
                }
                opattr == '' ? ($('#addMAttr_from .mgattr-container').hide()) : ($('#addMAttr_from .mgattr-container').show().find('.mattr-con-detail').html(opattr));
                parent == '' ? ($('#addMAttr_from .mattr-container').hide()) : ($('#addMAttr_from .mattr-container').show().find('.mattr-con-detail').html(parent));
            } else {
                console.log('获取模板物料属性失败');
            }
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            console.log('获取模板物料属性失败');
        }
    }, this);
}

//拼接单位数据
function getUnit() {
    ajax_PublicFn.getUnits(function () {
        layerLoading = LayerConfig('load');
    })
        .done(function (unitrsp) {
            if (unitrsp && unitrsp.results && unitrsp.results.length) {
                unitData = unitrsp.results;
                $('.el-form-item.unitlist .divwrap').html(createSource(unitrsp.results, '', 'unit_id'));
            } else {
                console.log('单位列表无数据');
            }
        }).fail(function (unitrsp) {
        console.log('获取单位列表失败');
    }).always(function () {
        layer.close(layerLoading);
    });
}

//获取数据类型
function getDataType() {
    ajax_PublicFn.getAttributeDataType().done(function (rsp) {
        var dataTypehtml = `<div class="el-select">
                    <i class="el-input-icon el-icon el-icon-caret-top"></i>
                    <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                    <input type="hidden" class="val_id" id="drawing_group_id" value="">
                </div>`;
        if (rsp && rsp.results && rsp.results.length) {
            typeData = rsp.results;
            dataTypehtml = selectHtml(rsp.results, 'datatype_id');
            $('#chooseAttr_from .el-form-item.datatype_id').find('.div_wrap .el-select-dropdown-wrap').html(dataTypehtml);
            setTimeout(function () {
                getLayerSelectPosition($(layerEle));
            }, 500);
        }
    }).fail(function (rsp) {
        console.log('获取数据类型失败');
    });
}

//检测唯一性
function getUnique(field, value, fn) {
    var urlLeft = '';
    if (mActionFlag == 'add') {
        urlLeft = `&field=${field}&value=${value}`;
    } else if (mActionFlag == 'edit' && material_id != '') {
        urlLeft = `&field=${field}&value=${value}&id=${material_id}`;
    }
    var xhr = AjaxClient.get({
        url: URLS['material'].unique + "?" + _token + urlLeft,
        dataType: 'json',
        beforeSend: function () {
            // layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            // layer.close(layerLoading);
            fn && typeof fn === 'function' ? fn(rsp) : null;
        },
        fail: function (rsp) {
            // layer.close(layerLoading);
            console.log('唯一性检测失败');
        }
    }, this);
}

//获取图纸分类
function getPicCategory() {
    var dtd = $.Deferred();
    AjaxClient.get({
        url: URLS['material'].picType + "?" + _token,
        dataType: 'json',
        success: function (rsp) {
            var catehtml = `<div class="el-select-dropdown-wrap">
                <div class="el-select">
                    <i class="el-input-icon el-icon el-icon-caret-top"></i>
                    <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                    <input type="hidden" class="val_id" id="drawing_type_id" value="">
                </div></div>`;
            if (rsp && rsp.results && rsp.results.length) {
                catehtml = `<div class="el-select-dropdown-wrap">
                ${selectHtml(rsp.results, 'drawing_type_id')}
                </div>`;
            }
            $('#choosePic_from .pictype .div_wrap').html(catehtml);
            setTimeout(function () {
                getLayerSelectPosition($(layerEle));
            }, 500);
            dtd.resolve(rsp);
        },
        fail: function (rsp) {
            dtd.reject(rsp);
        }
    }, this);
    return dtd;
}

//获取图纸分组列表
function getPicGroup(typeid) {
    var dtd = $.Deferred();
    AjaxClient.get({
        url: URLS['material'].picGroup + "?" + _token + "&type_id=" + typeid,
        dataType: 'json',
        success: function (rsp) {
            var picgrouphtml = `<div class="el-select-dropdown-wrap">
                <div class="el-select">
                    <i class="el-input-icon el-icon el-icon-caret-top"></i>
                    <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                    <input type="hidden" class="val_id" id="drawing_group_id" value="">
                </div></div>`;
            if (rsp && rsp.results && rsp.results.length) {
                picgrouphtml = `<div class="el-select-dropdown-wrap">
                ${selectHtml(rsp.results, 'drawing_group_id')}
                </div>`;
            }
            $('#choosePic_from .picgroup .div_wrap').html(picgrouphtml);
            setTimeout(function () {
                getLayerSelectPosition($(layerEle));
            }, 500);
            dtd.resolve(rsp);
        },
        fail: function (rsp) {
            dtd.reject(rsp);
        }
    }, this);
    return dtd;
}

//获取图纸列表
function getPicList() {
    var urlLeft = '';
    for (var param in ajaxPicData) {
        urlLeft += `&${param}=${ajaxPicData[param]}`;
    }
    urlLeft += "&page_no=" + pageNo + "&page_size=5";
    AjaxClient.get({
        url: URLS['material'].picList + "?" + _token + urlLeft + '&owner=material',
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            $('#choosePic_from .choose-pic').removeClass('is-disabled');
            var totalData = rsp.paging.total_records;
            if (rsp && rsp.results) {
                createPicTable(rsp.results);
            } else {
                console.log('获取图纸列表失败');
            }
            if (totalData > 5) {
                bindPagenationClick('choosePic_from', totalData, 5, function () {
                    getPicList();
                });
            } else {
                $('#choosePic_from .pagenation').html('');
            }

        },
        fail: function (rsp) {
            layer.close(layerLoading);
            $('#choosePic_from .choose-pic').removeClass('is-disabled');
            var tr = `<tr>
                <td class="nowrap" colspan="8" style="text-align: center;">获取图纸列表失败</td>
            </tr>`;
            $('#choosePic_from .table_tbody').html(tr);
            console.log('获取图纸列表失败');
        }
    }, this);
}

//获取图纸详情
function getPicDetail(id, group) {
    AjaxClient.get({
        url: URLS['material'].picShow + "?" + _token + "&drawing_id=" + id,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            if (rsp && rsp.results) {
                createPicDetail(rsp.results, group);
                $('#addMPic_from .picCon').hide();

            } else {
                console.log('获取图纸详情失败');
            }
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            console.log('获取图纸详情失败');
        }
    }, this);
}

//获取物料属性
function getAttrList(flag) {
    var urlLeft = '';
    for (var param in ajaxAttrData) {
        urlLeft += `&${param}=${ajaxAttrData[param]}`;
    }
    urlLeft += "&page_no=" + pageNo + "&page_size=5";
    var url = flag == 'attr' ? URLS['attr'].list : URLS['attr'].oplist;
    AjaxClient.get({
        url: url + "?" + _token + urlLeft,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            $('#chooseAttr_from .choose-search').removeClass('is-disabled');
            var totalData = rsp.paging.total_records;
            if (rsp && rsp.results) {
                createAttrTable(rsp.results, flag);
            } else {
                console.log('获取物料属性列表失败');
            }
            if (totalData > 5) {
                bindPagenationClick('chooseAttr_from', totalData, 5, function () {
                    getAttrList(flag);
                });
            } else {
                $('#chooseAttr_from .pagenation').html('');
            }
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            $('#chooseAttr_from .choose-search').removeClass('is-disabled');
            var tr = `<tr>
                <td class="nowrap" colspan="6" style="text-align: center;">获取物料属性列表失败</td>
            </tr>`;
            $('#chooseAttr_from .table_tbody').html(tr);
            console.log('获取物料属性列表失败');
        }
    }, this);
}

//获取物料属性相同的物料列表
function getSameMaterial() {
    AjaxClient.post({
        url: URLS['material'].sameMaterial,
        data: ajaxSameData,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            var totalData = rsp && rsp.paging && rsp.paging.total_records || 0;
            var sametable = createSameMaterial(rsp && rsp.results || []);
            $('.sameMaterial').html(sametable);
            setTimeout(function () {
                if (totalData > 10) {
                    bindSamePagenationClick('sameMaterial', totalData, pageMaNo, 10, function (pageno) {
                        pageMaNo = pageno;
                        ajaxSameData.page_no = pageMaNo;
                        getSameMaterial();
                    });
                } else {
                    $('#sameMaterial .pagenation').html('');
                }
            }, 20);
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            console.log('获取相同属性列表失败');
        }
    }, this);
}

//重置所有数据
function resetAllData() {
    pageMaNo = 1,
        pageNo = 1,
        picData = [],
        attrData = {
            operation_attributes: [],
            material_attributes: []
        },
        unitData = [],
        typeData = [],
        ajaxMaterialData = {},
        ajaxPicData = {},
        ajaxAttrData = {},
        ajaxSubmitData = {},
        templateid = 0;
    ajaxSubmitData.creator_token = creator_token;
    validatorConfig['attr'] = '';
    //getCategory();//分类
    //getTemplate();//模板
    //getUnit();//单位
    $('.is-disabled').removeClass('is-disabled');
    for (var type in ziduan) {
        var form = $('#' + type);
        ziduan[type].forEach(function (item) {
            form.find('#' + item).val('');
        });
    }
    //基础信息重置
    var basic = $('#addMBasic_from');
    // 属性
    $('.title.template').hide();
    $('.title.notemplate').show();
    $('.mattr-con-detail').html('');
    $('.sameMaterial').html('');
    //计划清空
    var planForm = $('#addMPlan_from');
    planForm.find('.el-form-item.source .el-select-dropdown-item[data-id=1]').click();
    $('.el-form-item.othersource .el-checkbox_input.other-check').removeClass('is-checked')
    //图纸清空
    $('#addMPic_from .picList ul').html('');
    $('#addMPic_from .picDetail').hide().siblings('.picCon').show();
    //附件清空
    $('#addMFujian_from tbody.file-preview-thumbnails').html('');
    $('.el-tap[data-item=addMBasic_from]').click();
    $(window).scrollTop(0);
}

//保存所有数据
function saveAllData() {
    AjaxClient.post({
        url: URLS['material'].store,
        data: ajaxSubmitData,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            saveFlag = true;
            LayerConfig('success', '添加成功', function () {
                if (copy != undefined && copy != "") {
                    // window.location.href=$('#addhtml').val();
                    rsp && rsp.results && $('#item_no').val(rsp.results.item_no);
                    $('.el-tap[data-item=addMBasic_from]').click();
                } else {
                    // resetAllData();
                    rsp && rsp.results && $('#item_no').val(rsp.results.item_no);
                    $('#addMAttr_from .el-form-item.template #template_id').val(-1);
                    $('.el-tap[data-item=addMBasic_from]').click();
                }
            });
            $('.submit.saveAll').removeClass('is-disabled');
        },
        fail: function (rsp) {
            saveFlag = false;
            layer.close(layerLoading);
            if (rsp && rsp.message != undefined && rsp.message != null) {
                LayerConfig('fail', rsp.message, function () {
                    if (rsp && rsp.field !== undefined && rsp.field != "") {
                        rsp.field == 'identity_card' ? rsp.field = 'material_attributes' : null;
                        for (var key in tabError) {
                            if (tabError[key].indexOf(rsp.field) > -1) {
                                $('.el-tap[data-item=' + key + ']').click();
                                setTimeout(function () {
                                    showInvalidMessage(rsp.field, rsp.message);
                                }, 200);
                                break;
                            }
                        }
                    }
                });
            }
            $('.submit.saveAll').removeClass('is-disabled');
        }
    }, this);
}

//存储物料属性数据
function getAttrData(ele) {
    var attributes = [];
    $(ele).find('.mattr-con-detail .el-form-item').each(function () {
        var val = $(this).find('.attr-val').val();
        if (val != 0 && val != '') {
            var item = {
                attribute_definition_id: $(this).attr('data-id'),
                value: $(this).find('.attr-val').val()
            };
            attributes.push(item);
        }
    });
    return attributes;
}

//获取物料属性相关数据
function getAttrSData() {
    var parentForm = $('#addMAttr_from');
    ajaxSubmitData.template_id = templateid;
    ajaxSubmitData.material_attributes = JSON.stringify(getAttrData('#addMAttr_from .mattr-container'));
    ajaxSubmitData.operation_attributes = JSON.stringify(getAttrData('#addMAttr_from .mgattr-container'));
}

//存储基础信息数据
function getBasicData() {
    var basicForm = $('#addMBasic_from');
    for (var type in ziduan) {
        var form = $('#' + type);
        ziduan[type].forEach(function (item) {
            if (item == 'item_no' && automatic_number == 2) {
                ajaxSubmitData[item] = form.find('#' + item).attr('data-val');
            } else {
                ajaxSubmitData[item] = form.find('#' + item).val().trim();
            }
        });
    }
    ajaxSubmitData.material_category_id = basicForm.find('.item-name.selected').attr('data-post-id');
    ajaxSubmitData.unit_id = basicForm.find('#unit_id').val();
    var planForm = $('#addMPlan_from');
    ajaxSubmitData.source = planForm.find('#source').val();
    if (ajaxSubmitData.source == 1) {
        $('.el-form-item.othersource .el-checkbox_input.other-check.is-checked').length ? ajaxSubmitData.is_provider = 1 : ajaxSubmitData.is_provider = 2;
    } else {
        ajaxSubmitData.is_provider = 0;
    }
}

//填充数据
function setData(data) {
    var basicForm = $('#addMBasic_from');
    for (var type in ziduan) {
        var form = $('#' + type);
        ziduan[type].forEach(function (item) {
            form.find('#' + item).val(data[item]);
        });
    }
    mActionFlag !== 'add' ? basicForm.find('#item_no').attr('readonly', 'readonly') : basicForm.find('#item_no').val('');
    data.material_category_id != '' ? basicForm.find('.item-name[data-post-id=' + data.material_category_id + ']').addClass('selected') : null;
    mActionFlag == 'edit' ? basicForm.find('.item-name').addClass('noedit') : null;
    data.unit_id != '' ? basicForm.find('.el-form-item.unitlist .el-select-dropdown-item[data-id=' + data.unit_id + ']').click() : null;
    var attrForm = $('#addMAttr_from'), attrhtml = '';
    if (copy == 1) {
        var selectItem = categoryData.filter(function (e) {
            return e.id == data.material_category_id;
        });
        $('#addMBasic_from #item_no').parents('.el-form-item').find('.errorMessage').html('');
        getCode(selectItem[0].code, selectItem[0].material_category_id);
    }
    if (data.template_id == 0 || data.template_id == '') {
        templateid = 0;
        attrData.material_attributes = data.material_attributes;
        attrData.operation_attributes = data.operation_attributes;
        $('#addMAttr_from .mattr-container').show().find('.mattr-con-detail').html(createAttrHtml(attrData, 'self', 'attr'));
        $('#addMAttr_from .mgattr-container').show().find('.mattr-con-detail').html(createAttrHtml(attrData, 'self', 'opattr'));
    } else {
        validatorConfig['attr'] = '';
        templateid = data.template_id;
        attrForm.find('.title.notemplate').hide();
        attrForm.find('.title.template').show();
        if (mActionFlag == 'add') {
            var temele = attrForm.find('.el-form-item.template .el-select-dropdown-item[data-id=' + templateid + ']');
            attrForm.find('.el-form-item.template #template_id').val(templateid).siblings('.el-input').val(temele.text());
            attrForm.find('.title.template .editShow').hide();
            getTemCopyAttr(templateid, material_id);
        } else {
            attrForm.find('.el-form-item.template .div_wrap').html(`<input type="text" readonly="readonly" class="el-input" value="${data.template_name}">
            <input type="hidden" class="val_id" id="template_id" value="${data.template_id}">`);
            attrForm.find('.title.template .editShow').show();
            attrData.material_attributes = data.material_attributes;
            attrData.operation_attributes = data.operation_attributes;
            var attrhtml = createAttrHtml(data, 'self', 'attr');
            var opattrhtml = createAttrHtml(data, 'self', 'opattr');
            $('#addMAttr_from .mattr-container').show().find('.mattr-con-detail').html(attrhtml);
            $('#addMAttr_from .mgattr-container').show().find('.mattr-con-detail').html(opattrhtml);
        }
    }
    var addMPlan_from = $('#addMPlan_from');
    addMPlan_from.find('.el-form-item.source .el-select-dropdown-item[data-id=' + data.source + ']').click();
    if (data.source == 1) {
        data.is_provider == 1 ? $('.el-form-item.othersource .el-checkbox_input.other-check').addClass('is-checked') : $('.el-form-item.othersource .el-checkbox_input.other-check').removeClass('is-checked');

    }
    addMPlan_from.find('#low_level_code').val(data.low_level_code);
    var showStoragePlace_form = $('#showStoragePlace');
    if(data.storage_place&&data.storage_place.length){
        showStoragePlace_form.html(createHtml(data.storage_place));
    }
    var addMPic_from = $('#addMPic_from');
    if (data.drawings && data.drawings.length) {
        picData = data.drawings;
        addMPic_from.find('.picList ul').html(createPicHtml());
    }
    var preurls = [], predata = [];
    if (data.attachments && data.attachments.length) {
        data.attachments.forEach(function (item) {
            var url = '/storage/' + item.path, preview = '';
            var path = item.path.split('/');
            var name = item.filename;

            // var a = `<a href="${window.storage+item.path}" class="attch-download" download="${item.filename}"><i class='fa fa-download' style="margin-left: 10px;font-size: 20px;"></i></a>`;
            // console.log(a);
            // var file = find('.file-footer-buttons');
            // $(".file-footer-buttons").append(a);


            if (item.path.indexOf('jpg') > -1 || item.path.indexOf('png') > -1 || item.path.indexOf('jpeg') > -1) {
                preview = `<img width="60" height="60" src="${url}" data-creator="${item.creator_name || ''}" data-ctime="${item.ctime}" data-url="${item.path}" comment="${item.comment}" attachment_id="${item.attachment_id}" class='file-preview-image existAttch'>`;
            } else {
                preview = `<div class='file-preview-text existAttch' data-creator="${item.creator_name || ''}" data-ctime="${item.ctime}" data-url="${item.path}" comment="${item.comment}" attachment_id="${item.attachment_id}">
                        <h3 style="font-size: 50px;"><i class='el-icon el-icon-file'></i></h3>
                        </div>`;
            }
            var pitem = {
                caption: name,
                size: item.size,
            };
            preurls.push(preview);
            predata.push(pitem);
        });
    }
    fileinit('attachment', preurls, predata);
    setTimeout(function () {
        if ($('.existAttch').length) {
            $('.existAttch').each(function () {
                var pele = $(this).parents('.file-preview-frame');
                pele.attr({
                    'data-url': $(this).attr('data-url'),
                    'attachment_id': $(this).attr('attachment_id')
                });
                var cname = $(this).attr('data-creator'),
                    ctime = $(this).attr('data-ctime');
                pele.find('.fujiantext').text($(this).attr('comment'));
                pele.find('.creator').html(`<p>${cname}</p><p>${ctime}</p>`);
                pele.addClass('init-success-file');
            });
            //下载
            if (data.attachments && data.attachments.length) {
                data.attachments.forEach(function (item) {
                    var attachment_dowload = $('#addMFujian_from').find('tr[attachment_id=' + item.attachment_id + ']').eq(0);
                    // console.log(item.is_from_erp);
                    if (item.is_from_erp == 1) {
                        var a = `<a href="${window.storage + item.path}" class="attch-download" download="${item.filename}"><i class='fa fa-download' style="margin-left: 10px;font-size: 20px;"></i></a>`;
                        if (!attachment_dowload.find('.attch-download').length) {
                            attachment_dowload.find('.file-footer-buttons').append(a);
                        }
                    } else if (item.is_from_erp == 0) {
                        var a = `<a href="${item.path}" class="attch-download" download="${item.filename}"><i class='fa fa-download' style="margin-left: 10px;font-size: 20px;"></i></a>`;
                        if (!attachment_dowload.find('.attch-download').length) {
                            attachment_dowload.find('.file-footer-buttons').append(a);
                        }
                    }


                });
            }


        }

    }, 1000);

}

//生成仓储地列表数据
function createHtml(data){
    console.log(data);
    var trs='';
    if(data&&data.length){
        data.forEach(function(item,index){

            trs+= `
			<tr>
			
			<td>${tansferNull(item.name)}</td>
			<td>${tansferNull(item.LGFSB)}</td>
			<td>${tansferNull(item.LGPRO)}</td>
		
			</tr>
			`;
        })
    }else{
        trs='<tr><td colspan="8" class="center">暂无数据</td></tr>';
    }
    var thtml=`<div class="wrap_table_div">
            <table id="work_order_table" class="sticky uniquetable commontable" >
                <thead>
                    <tr>
                        <th class="left nowrap tight">工厂</th>
                        <th class="left nowrap tight">采购仓储</th>
                        <th class="left nowrap tight">生产仓储</th>
                        
                    </tr>
                </thead>
                <tbody class="table_tbody">${trs}</tbody>
            </table>
        </div>
        <div id="pagenation" class="pagenation unpro"></div>`;
    return thtml;
}

//存储图纸数据
function getPicData() {
    var ele = $('#addMPic_from .pic-li');
    var picData = [];
    ele.each(function () {
        var item = {
            drawing_id: $(this).attr('data-id'),
            comment: $(this).find('.comment textarea').val().trim()
        };
        picData.push(item);
    });
    ajaxSubmitData.drawings = JSON.stringify(picData);
}

//存储附件数据
function getFujianData() {
    var ele = $('#addMFujian_from .file-preview-frame.file-preview-success,#addMFujian_from .file-preview-frame.init-success-file');
    var fujianData = [];
    ele.each(function () {
        var item = {
            attachment_id: $(this).attr('attachment_id'),
            comment: $(this).find('.fujiantext').val().trim()
        };
        fujianData.push(item);
    });
    ajaxSubmitData.attachments = JSON.stringify(fujianData);
}

// 编辑整体
function editAll() {
    ajaxSubmitData.material_id = material_id;
    AjaxClient.post({
        url: URLS['material'].update,
        data: ajaxSubmitData,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            LayerConfig('success', '编辑成功');
            $('.submit').removeClass('is-disabled');

        },
        fail: function (rsp) {
            layer.close(layerLoading);
            $('.submit').removeClass('is-disabled');
            // LayerConfig('fail',rsp.message);
            if (rsp && rsp.message != undefined && rsp.message != null) {
                LayerConfig('fail', rsp.message, function () {
                    if (rsp && rsp.field !== undefined && rsp.field != "") {
                        rsp.field == 'identity_card' ? rsp.field = 'material_attributes' : null;
                        for (var key in tabError) {
                            if (tabError[key].indexOf(rsp.field) > -1) {
                                $('.el-tap[data-item=' + key + ']').click();
                                setTimeout(function () {
                                    showInvalidMessage(rsp.field, rsp.message);
                                }, 200);
                                break;
                            }
                        }
                    }
                });
            }
        }
    }, this);
}

//扩展物料结构树
function treeList(data, pid) {
    var bomTree = '';
    var children = getChildById(data, pid);
    children.forEach(function (item, index) {
        var hasChild = hasChilds(data, item.id);
        if (hasChild) {
            bomTree += `<div class="tree-folder" data-id="${item.id}" data-pid="${pid}">
                   <div class="tree-folder-header">
                   <div class="flex-item">
                   <i class="icon-minus expand-icon"></i>
                   <div class="tree-folder-name"><p class="item-name" data-template-id="${item.template_id}" data-post-id="${item.id}">${item.name}(${item.code})</p></div></div></div>
                   <div class="tree-folder-content">
                     ${treeList(data, item.id)}
                   </div>
                </div> `;
        } else {
            bomTree += `<div class="tree-item" data-id="${item.id}" data-pid="${pid}">
                  <div class="flex-item">
                  <i class="item-dot expand-icon"></i>
                  <div class="tree-item-name"><p class="item-name" data-template-id="${item.template_id}" data-post-id="${item.id}">${item.name}(${item.code})</p></div></div>  
                </div>`;
        }
    });
    return bomTree;
}

//生成下拉框数据
function selectHtml(fileData, flag) {
    var innerhtml, selectVal, parent_id, lis = '';
    if (flag == 'drawing_type_id') {
        fileData.forEach(function (item) {
            lis += `<li data-id="${item.image_group_type_id}" data-code="${item.code}" class="el-select-dropdown-item" class=" el-select-dropdown-item">${item.name}</li>`;
        });
    } else if (flag == 'drawing_group_id') {
        fileData.forEach(function (item) {
            lis += `<li data-id="${item.imageGroup_id}" class="el-select-dropdown-item" class=" el-select-dropdown-item">${item.name}</li>`;
        });
    } else if (flag == 'unit_id') {
        fileData.forEach(function (item) {
            lis += `<li data-id="${item.id}" class="el-select-dropdown-item" class=" el-select-dropdown-item">${item.unit_text}</li>`;
        });
    } else if (flag == 'datatype_id') {
        fileData.forEach(function (item) {
            lis += `<li data-id="${item.id}" class="el-select-dropdown-item" class=" el-select-dropdown-item">${item.cn_name}</li>`;
        });
    } else if (flag == 'category_search') {
        fileData.forEach(function (item) {
            lis += `<li data-id="${item.id}" class="el-select-dropdown-item" class=" el-select-dropdown-item">${item.name}</li>`;
        });
    } else {
        parent_id = fileData[0].parent_id;
        lis = selecttreeHtml(fileData, parent_id);
    }
    if (flag == 'material_category_id' || flag == 'category_search') {
        innerhtml = `<ul class="el-select-dropdown-list">
                <li data-id="" data-pid="" class="el-select-dropdown-item kong" data-name="--请选择--" class=" el-select-dropdown-item">--请选择--</li>
                ${lis}
            </ul>`;
    } else if (flag == 'template_id') {
        innerhtml = `<ul class="el-select-dropdown-list">
                <li data-id="0" data-pid="" class="el-select-dropdown-item kong" data-name="--请选择--" class=" el-select-dropdown-item">--请选择--</li>
                ${lis}
            </ul>`;
    } else {
        innerhtml = `<div class="el-select">
            <i class="el-input-icon el-icon el-icon-caret-top"></i>
            <input type="text" readonly="readonly" class="el-input" value="--请选择--">
            <input type="hidden" class="val_id" id="${flag}" value="">
        </div>
        <div class="el-select-dropdown">
            <ul class="el-select-dropdown-list">
                <li data-id="" data-pid="" class="el-select-dropdown-item kong" data-name="--请选择--" class=" el-select-dropdown-item">--请选择--</li>
                ${lis}
            </ul>
        </div>`;
    }
    itemSelect = [];
    return innerhtml;
}

//生成物料来源数据和单位列表和数据类型
function createSource(data, val, unitFlag) {
    var lis = '', sItem = [], eleInput = '';
    data && data.length && data.forEach(function (item) {
        var selected = '';
        if (val && val == item.id) {
            selected = 'selected';
            sItem.push(item);
        }
        lis += `<li data-id="${item.id}" data-name="${item.name}" class="el-select-dropdown-item ${selected}">${unitFlag == 'unit_id' ? item.unit_text : item.name}</li>`;
    });
    var uname = '--请选择--', uid = '';
    if (sItem.length) {
        unitFlag == 'unit_id' ? (uname = sItem[0].unit_text) : (uname = sItem[0].name);
        uid = sItem[0].id;
    }
    eleInput = `<div class="el-select">
        <i class="el-input-icon el-icon el-icon-caret-top"></i>
        <input type="text" readonly="readonly" id="selectVal" class="el-input" value="${uname}">
        <input type="hidden" class="val_id" id="${unitFlag}" value="${uid}">
    </div>
    <div class="el-select-dropdown">
        <ul class="el-select-dropdown-list">
            ${lis}
        </ul>
    </div>`;
    var eleSource = `<div class="el-select-dropdown-wrap">      
        ${eleInput}
    </div>`;
    return eleSource;
}

//生成属性列表,flag:self,type:attr
function createAttrHtml(data, flag, type) {
    var divCon = [];
    if (type == 'opattr') {
        divCon.push(createAttrli(data, data.operation_attributes, flag, type));
    } else {
        if (flag == 'self') {
            divCon.push(createAttrli(data, data.material_attributes, flag, type));
        } else {
            data.forEach(function (item) {
                divCon.push(createAttrli(item, item.material_attributes, flag, type));
            });
        }
    }
    return divCon.join('');
}

//生成属性具体项
function createAttrli(item, itemdata, flag, type) {
    var divwrap = '', lis = '', len = 0;
    if (itemdata && itemdata.length) {
        var divitems = [];
        itemdata.forEach(function (attritem, index) {
            var inputhtml = '', divitem = '', unithtml = '', deletehtml = '';
            inputhtml = `<input type="text" class="el-input attr-val mattr-val" placeholder="" value="${attritem.value || ''}">`;
            unithtml = attritem.unit !== null && attritem.unit !== '' && attritem.unit !== undefined ? `<span class="unit">[${attritem.unit}]</span>` : '<span class="unit"></span>';
            deletehtml = `<div data-id="${attritem.attribute_definition_id}"><i class="el-icon el-input-icon icon-close el-${type}-close el-icon-delete"></i></div>`;
            if (attritem.datatype_id == 2) {
                inputhtml = createOption(attritem.range, type, attritem.value);
            }
            divitem = `<div class="el-form-item" data-id="${attritem.attribute_definition_id}" datatype_id="${attritem.datatype_id}" data-template-id="${attritem.template_id == undefined ? '' : attritem.template_id}" data-attr-id="${attritem.attribute_definition_id}">
                <div class="el-form-item-div">
                    <label class="el-form-item-label"
                     data-key="${attritem.key}"><span>${attritem.name}</span><span style="overflow: hidden;text-overflow: ellipsis;" title="${attritem.key}">(${attritem.key})</span></label>
                    ${inputhtml}
                    ${unithtml}
                    ${deletehtml}
                </div>
            </div>`;
            divitems.push(divitem);
        });
        divwrap = `<div class="querywrap ${flag == 'self' ? 'own' : ''}" data-template_id="${item.template_id == undefined ? '' : item.template_id}">
                <h4>${item.template_name == undefined ? '' : item.template_name}</h4> 
                <div class="queryCon">
                    <ul class="query-item">
                        <li>${divitems.join('')}</li>
                    </ul>
                </div>
            </div>`;
    }
    return divwrap;
}

//生成图纸属性列表
function createPicAttr(data) {
    var divs = [], divwrap = '';
    data.forEach(function (item, index) {
        var div = `<div class="el-form-item">
                <div class="el-form-item-div">
                    <label class="el-form-item-label" title="${item.definition_name}">${item.definition_name}</label>
                    <input type="text" readonly="readonly" class="el-input pic-attr-val" placeholder="" value="${item.value}">
                </div>
            </div>`;
        divs.push(div);
    });
    divwrap = `<div class="querywrap">
            <h4>图纸属性</h4> 
            <div class="queryCon">
                <ul class="query-item">
                    <li>${divs.join('')}</li>
                </ul>
            </div>
        </div>`;
    return divwrap;
}

//生成属性下拉框数据
function createOption(data, flag, value) {
    var opdata = JSON.parse(data);
    var ophtml = '', index = 0, innerhtml, selectVal = '', selectIndex = '';
    if (opdata == null) {
        opdata = {};
    }
    if (opdata.default_value != undefined) {
        index = opdata.default_value;
    }
    if (opdata.options && opdata.options.length) {
        opdata.options.forEach(function (item) {
            if (flag == 'attr' || flag == 'opattr') {
                ophtml += `<li data-id="${item.index}" class="el-select-dropdown-item" class="el-select-dropdown-item">${item.label}</li>`;
                if (value != '' && value != undefined) {
                    if (item.index == value) {
                        selectVal = item.label;
                        selectIndex = item.index;
                    }
                } else if (item.index == index) {
                    selectVal = item.label;
                    selectIndex = item.index;
                }
            } else {
                if (item.index == value) {
                    selectVal = item.label;
                    selectIndex = index;
                }
            }
        });
    }
    if (flag == 'pic') {
        innerhtml = `<div class="el-select-dropdown-wrap">
            <div class="el-select">
                <input type="text" readonly="readonly" class="el-input readonly" value="${selectVal != undefined && selectVal != '' ? selectVal : '--无--'}">
                <input type="hidden" class="val_id attr-val" value="${selectIndex != undefined && selectIndex != '' ? selectIndex : ''}">
            </div>
            </div>`;
    } else {
        innerhtml = `<div class="el-select-dropdown-wrap">
            <div class="el-select">
                <i class="el-input-icon el-icon el-icon-caret-top"></i>
                <input type="text" readonly="readonly" class="el-input" value="${selectVal != undefined && selectIndex != '' ? selectVal : '--请选择--'}">
                <input type="hidden" class="val_id attr-val ${flag == 'attr' ? 'mattr-val' : ''}" value="${selectIndex != undefined && selectIndex != '' ? selectIndex : ''}">
            </div>
            <div class="el-select-dropdown">
                <div class="search-div" data-range=${data}><input type="text" class="el-input el-input-search" placeholder="search"/><span class="search-icon search-span"><i class="fa fa-search"></i></span></div>
                <ul class="el-select-dropdown-list">
                    <li data-id="" class="el-select-dropdown-item kong" data-name="--请选择--" class=" el-select-dropdown-item">--请选择--</li>
                    ${ophtml}
                </ul>
            </div>
            </div>`;
    }
    selectVal = '';
    selectIndex = '';
    return innerhtml;
}

//生成图纸表格
function createPicTable(data) {
    $('#choosePic_from .table_tbody').html('');
    var picId = getIds(picData, 'pic');
    if (data.length) {
        data.forEach(function (item, index) {
            var imgurl = item.image_path.split('.');
            var tr = `
                <tr class="tritem" data-id="${item.drawing_id}">
                    <td>${tansferNull(item.code)}</td>
                    <td><div style="width: 120px;word-break: break-all;white-space: normal;word-wrap: break-word;">${tansferNull(item.name)}</div></td>
                    <td>${tansferNull(item.group_name)}</td>
                    <td><img data-id="${item.drawing_id}" data-src="${window.storage}${item.image_path}" class="pic-img" width="80" height="40" src="${window.storage}${item.image_path}"/></td>              
                    <td class="right">
                        <button data-picid="${item.drawing_id}" class="button pop-button material-pic-button ${picId.indexOf(item.drawing_id) > -1 ? 'is-disabled' : ''}">选择</button></td>
                </tr>`;
            $('#choosePic_from .table_tbody').append(tr);
            $('#choosePic_from .table_tbody').find('tr:last-child').data('picItem', item);
        });
    } else {
        var tr = `<tr>
                <td class="nowrap" colspan="8" style="text-align: center;">暂无数据</td>
            </tr>`;
        $('#choosePic_from .table_tbody').append(tr);
    }
}

//生成图纸列表
function createPicHtml() {
    var lis = [];
    if (picData.length) {
        picData.forEach(function (item) {
            var imgurl = item.image_path.split('.');
            var li = `<li class="pic-li" data-id="${item.drawing_id}" data-src="${window.storage}${item.image_path}"><div class="el-card">
                    <div class="el-card-body">
                    <img data-src="${window.storage}${item.image_path}" class="pic-img pic-list-img" src="${window.storage}${imgurl[0]}370x170.jpg" alt="">
                    </div>
                    <div class="el-card-info">
                        <span>${item.code}(${item.name})</span>
                        <div class="comment"><textarea class="textarea-comment" rows="2" maxlength="50" placeholder="请输入注释，最多只能输入50字">${item.comment != undefined ? item.comment : ''}</textarea></div>
                        <div data-id="${item.drawing_id}">
                            <i class="el-icon el-input-icon el-icon-info" data-id="${item.drawing_id}" data-group="${item.group_name}"></i>
                            <i class="el-icon el-input-icon icon-close el-pic-close el-icon-delete"></i>
                        </div>
                    </div>
                </div></li>`;
            lis.push(li);
        });
    }
    return lis.join('');
}

//生成图纸关联图列表
function createPicLinkHtml(data) {
    var trs = [];
    data.forEach(function (item) {
        var tr = `<tr class="tritem" data-id="${item.drawing_id}">
                <td>${item.code}</td>
                <td>${item.attribute_name}</td>
                <td>${item.length == null ? '' : item.length}</td>
                <td>${item.length2 == null ? '' : item.length2}</td>
                <td>${item.width == null ? '' : item.width}</td>
                <td>${item.width2 == null ? '' : item.width2}</td>
                <td>${item.height == null ? '' : item.height}</td> 
                <td>${item.height2 == null ? '' : item.height2}</td>
                <td><img data-src="/${item.image_path}${item.image_name}.jpg" class="pic-img" width="80" height="40" src="/${item.image_path}${item.image_name}.jpg80x40.jpg"/></td>              
                <td class="right">
                    <a target="_blank" class="link_button" href="${picviewUrl}.${item.drawing_id}">查看</a></td>
            </tr>`;
        trs.push(tr);
    });
    var table = `<div class="querywrap">
        <h4>关联图</h4>
        <table class="sticky uniquetable commontable">  
        <thead>
            <tr>
                <th>编码</th>
                <th>名称</th>
                <th>长</th>
                <th>长2</th>
                <th>宽</th>
                <th>宽2</th>
                <th>高</th>
                <th>高2</th>
                <th>缩略图</th>
                <th class="right"></th>
            </tr>
        </thead>
        <tbody>${trs.join('')}</tbody>
    </table></div>`;
    return table;
}

//生成附件列表
function createPicFujian(data) {
    var fujians = [];
    data.forEach(function (item) {
        var fujianitem = `<li><div class="el-card fujian" data-id="${item.attachment_id}" data-path="${item.path}">
                <div class="info">
                    <span>${item.filename}</span>
                    <p class="des" title="${item.comment}">${item.comment != '' ? '注释:' : ''}${item.comment}</p>
                    <div>
                        <a download="${item.filename}" href="/${item.path}"><i class="el-icon el-input-icon el-icon-download"></i></a>
                    </div>
                </div>
            </div><p class="errorMessage" style="width: 100%;word-break: break-all;"></p></li>`;
        fujians.push(fujianitem);
    });
    var fujianhtml = `<div class="querywrap">
                        <h4>附件</h4>
                        <div class="ulwrap">
                            <ul>
                                ${fujians.join('')}
                            </ul>
                        </div>
                </div>`;
    return fujianhtml;
}

//生成图纸详情
function createPicDetail(data) {
    var parentEle = $('#addMPic_from .picDetail');
    var imgurl = data.image_path.split('.'),
        attribute = data.attributes,
        // attachment=data.attachment,
        // combination=data.combination,
        src = `${window.storage}${imgurl[0]}370x170.jpg`;
    parentEle.find('#code').val(data.code);
    parentEle.find('#name').val(data.name);
    parentEle.find('#comment').html(data.comment);
    parentEle.find('#picCategory').val(data.category_name);
    parentEle.find('#picGroup').val(data.group_name);
    parentEle.find('#imgShow').attr('src', src);
    parentEle.find('.picAttr').html('');
    if (attribute && attribute.length) {
        parentEle.find('.picAttr').html(createPicAttr(attribute));
    }
    // if(attachment&&attachment.length){
    //     parentEle.find('.fujian').html(createPicFujian(attachment));
    // }
    // if(combination&&combination.length){
    //     parentEle.find('.linkPic').html(createPicLinkHtml(combination));
    // }
    $('#addMPic_from .picDetail').show();

}

//生成属性表格
function createAttrTable(data, flag) {
    $('#chooseAttr_from .table_tbody').html('');
    var attrId = [];
    if (flag == 'attr') {
        attrId = getIds(attrData.material_attributes, 'attr');
    } else {
        attrId = getIds(attrData.operation_attributes, 'attr');
    }
    if (data.length) {
        data.forEach(function (item, index) {
            var tr = `
                <tr class="tritem" data-id="${item.attribute_definition_id}">
                    <td><div class="overflow" title="${item.key}">${item.key}</div></td> 
                    <td><div class="overflow" title="${item.name}">${item.name}</div></td>
                    <td><div class="overflow" title="${item.label}">${item.label}</div></td>
                    <td>${item.data_type == null ? '' : item.data_type}</td>
                    <td>${item.unit == null ? '' : item.unit}</td>             
                    <td class="right">
                        <button data-id="${item.attribute_definition_id}" class="button pop-button attr-button ${attrId.indexOf(item.attribute_definition_id) > -1 ? 'is-disabled' : ''} ${flag}">选择</button></td>
                </tr>`;
            $('#chooseAttr_from .table_tbody').append(tr);
            $('#chooseAttr_from .table_tbody').find('tr:last-child').data('attrItem', item);
        });
    } else {
        var tr = `<tr>
                <td class="nowrap" colspan="6" style="text-align: center;">暂无数据</td>
            </tr>`;
        $('#chooseAttr_from .table_tbody').append(tr);
    }
}

function createSameMaterial(data) {
    var trs = '';
    if (data.length) {
        data.forEach(function (item) {
            trs += ` <tr class="tritem" data-id="${item.material_id}">
                    <td>${item.item_no}</td> 
                    <td><div class="overflow" title="${item.name}">${item.name}</div></td>
                    <td>${tansferNull(item.creator_name)}</td>
                    <td>${tansferNull(item.material_category_name)}</td>
                    <td>${tansferNull(item.template_name)}</td>             
                   </tr>`;
        });
    } else {
        trs = `<tr>
                <td class="nowrap" colspan="5" style="text-align: center;">暂无数据</td>
            </tr>`;
    }
    var table = `<div id="sameMaterial">
        <div class="table table_page">
                <div id="pagenation" class="pagenation"></div>
                <table id="table_pic_table" class="sticky uniquetable commontable">
                    <thead>
                        <tr>
                            <th>物料编码</th>
                            <th>名称</th>
                            <th>创建人</th>
                            <th>物料分类</th>
                            <th>物料模板</th>
                        </tr>
                    </thead>
                    <tbody class="table_tbody">${trs}</tbody>
                </table>
            </div>
    </div>`;
    return table;

}

//查询模板属性模态框
function ChooseParentModal(data, flag) {
    var labelWidth = 100,
        title = '选择模板属性',
        cData = [],
        pichtml = '';
    flag == 'attr' ? cData = attrData.material_attributes : cData = attrData.operation_attributes;
    if (cData.length) {
        cData.forEach(function (item) {
            pichtml += `<span data-id="${item.attribute_definition_id}" class="el-tag">${item.key}(${item.name})<i class="el-icon icon-close ${flag == 'attr' ? 'el-attr-close' : 'el-opattr-close'} el-icon-close"></i></span>`;
        });
    }
    layerModal = layer.open({
        type: 1,
        title: title,
        offset: '100px',
        area: '700px',
        shade: 0.1,
        shadeClose: true,
        resize: false,
        move: false,
        content: `<form class="chooseAttr formModal formMateriel" id="chooseAttr_from">
            <div class="pic-selected-wrap">
                <div class="pic-selected">
                    ${pichtml}
                </div>
                <div class="el-form-item">
                    <div class="el-form-item-div btn-group">
                        <button style="margin: 5px 0;" type="button" class="el-button el-button--primary choose-search choose-${flag}-ok attr-ok">确认</button>
                    </div>
                </div>
            </div>
            <div class="table table_page" style="max-height: 350px;overflow-y: auto;">
                <table id="table_pic_table" class="sticky uniquetable commontable">
                    <thead>
                        <tr>
                            <th>键值</th>
                            <th>名称</th>
                            <th>标签</th>
                            <th>数据类型</th>
                            <th>单位</th>
                            <th class="right"></th>
                        </tr>
                    </thead>
                    <tbody class="table_tbody"></tbody>
                </table>
            </div>
        </form>`,
        success: function (layero, index) {
            createAttrTable(data, flag);
        },
        end: function () {
        }
    });
}

//查询图纸模态框
function ChoosePic() {
    var labelWidth = 100,
        title = '搜索图纸',
        parent = {},
        type = [],
        pichtml = '';
    if (picData.length) {
        picData.forEach(function (item) {
            pichtml += `<span data-id="${item.drawing_id}" class="el-tag">${item.code}(${item.name})<i class="el-icon icon-close el-pic-close el-pic-pop-close el-icon-close"></i></span>`;
        });
    }
    layerModal = layer.open({
        type: 1,
        title: title,
        offset: '70px',
        area: '700px',
        shade: 0.1,
        shadeClose: false,
        resize: false,
        move: false,
        content: `<form class="choosePic formModal formMateriel" id="choosePic_from">
            <div>
                <ul class="query-item">
                    <li>
                        <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label" style="width: ${labelWidth}px;margin-left: 0;">编码</label>
                                <input type="text" id="code"  class="el-input" placeholder="" value="">
                            </div>
                        </div>
                        <div class="el-form-item pictype">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label" style="width: ${labelWidth}px;margin-left: 0;">图纸类</label>
                                <div class="div_wrap">
                                    <div class="el-select-dropdown-wrap">
                                        <div class="el-select">
                                            <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                            <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                                            <input type="hidden" class="val_id" id="drawing_type_id" value="">
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="el-form-item picgroup">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label" style="width: ${labelWidth}px;margin-left: 0;">图纸组</label>
                                <div class="div_wrap">
                                    <div class="el-select-dropdown-wrap">
                                        <div class="el-select">
                                            <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                            <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                                            <input type="hidden" class="val_id" id="drawing_group_id" value="">
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </li>
                    <li>
                        <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label" style="width: ${labelWidth}px;margin-left: 0;">名称</label>
                                <input type="text" id="name"  class="el-input" placeholder="" value="">
                            </div>
                        </div>
                        <div class="el-form-item">
                        </div>
                        <div class="el-form-item">
                            <div class="el-form-item-div btn-group">
                                <button style="margin: 5px 0;" type="button" class="el-button el-button--primary choose-search choose-pic">搜索</button>
                            </div>
                        </div>
                    </li>
                </ul>
            </div>
            <div class="pic-selected-wrap">
                <div class="pic-selected">
                    ${pichtml}
                </div>
                <div class="el-form-item">
                    <div class="el-form-item-div btn-group">
                        <button type="button" class="el-button el-button--primary choose-search choose-pic-ok">确认</button>
                    </div>
                </div>
            </div>
            <div class="table table_page">
                <div id="pagenation" class="pagenation"></div>
                <table id="table_pic_table" class="sticky uniquetable commontable">
                    <thead>
                        <tr>
                            <th>编码</th>
                            <th>名称</th>
                            <th>图纸分组</th>
                            <th>缩略图</th>
                            <th class="right"></th>
                        </tr>
                    </thead>
                    <tbody class="table_tbody">
                        <tr>
                            <td class="nowrap" colspan="8" style="text-align: center;">暂无数据</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </form>`,
        success: function (layero, index) {
            layerEle = layero;
            getPicCategory();
            // getPicGroup();
            getPicList();
            getLayerSelectPosition($(layero));
        },
        end: function () {
            pageNo = 1;
            ajaxPicData = {
                type_id: '',
                group_id: '',
                code: '',
                name: '',
                sort: 'id',
                order: 'desc'
            };
        }
    });
}

//查询属性模态框
function ChooseAttr(title, flag) {
    var labelWidth = 100,
        title = title,
        parent = {},
        type = [],
        unithtml = selectHtml(unitData, 'unit_id'), pichtml = '', cData = [];
    flag == 'attr' ? cData = attrData.material_attributes : cData = attrData.operation_attributes;
    if (cData.length) {
        cData.forEach(function (item) {
            pichtml += `<span data-id="${item.attribute_definition_id}" class="el-tag">${item.key}(${item.name})<i class="el-icon icon-close ${flag == 'attr' ? 'el-attr-close' : 'el-opattr-close'} el-icon-close"></i></span>`;
        });
    }
    layerModal = layer.open({
        type: 1,
        title: title,
        offset: '100px',
        area: '700px',
        shade: 0.1,
        shadeClose: false,
        resize: false,
        move: false,
        content: `<form class="chooseAttr formModal formMateriel" id="chooseAttr_from">
            <div>
                <ul class="query-item">
                    <li>
                        <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label" style="width: ${labelWidth}px;">键值</label>
                                <input type="text" id="key" class="el-input" placeholder="" value="">
                            </div>
                        </div>
                        <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label" style="width: ${labelWidth}px;">名称</label>
                                <input type="text" id="name"  class="el-input" placeholder="" value="">
                            </div>
                        </div>
                        <div class="el-form-item datatype_id">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label" style="width: ${labelWidth}px;">数据类型</label>
                                <div class="div_wrap">
                                    <div class="el-select-dropdown-wrap">
                                        <div class="el-select">
                                            <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                            <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                                            <input type="hidden" class="val_id" id="datatype_id" value="">
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </li>
                    <li>
                        <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label" style="width: ${labelWidth}px;">单位</label>
                                <div class="div_wrap">
                                    <div class="el-select-dropdown-wrap">
                                        ${unithtml}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label" style="width: ${labelWidth}px;">标签</label>
                                <input type="text" id="label"  class="el-input" placeholder="" value="">
                            </div>
                        </div>
                        <div class="el-form-item">
                            <div class="el-form-item-div btn-group">
                                <button style="margin-top: 5px;" type="button" class="el-button choose-search ${flag}">搜索</button>
                            </div>
                        </div>
                    </li>
                </ul>
            </div>
            <div class="pic-selected-wrap">
                <div class="pic-selected">
                    ${pichtml}
                </div>
                <div class="el-form-item">
                    <div class="el-form-item-div btn-group">
                        <button style="margin: 5px 0;" type="button" class="el-button el-button--primary choose-search choose-${flag}-ok attr-ok">确认</button>
                    </div>
                </div>
            </div>
            <div class="table table_page">
                <div id="pagenation" class="pagenation"></div>
                <table id="table_pic_table" class="sticky uniquetable commontable">
                    <thead>
                        <tr>
                            <th>
                                <div class="el-sort">
                                    键值
                                    <span class="caret-wrapper">
                                        <i data-key="key" data-sort="asc" class="sort-caret ascending attr"></i>
                                        <i data-key="key" data-sort="desc" class="sort-caret descending attr"></i>
                                    </span>
                                </div>
                            </th>
                            <th>
                                <div class="el-sort">
                                    名称
                                    <span class="caret-wrapper">
                                        <i data-key="name" data-sort="asc" class="sort-caret ascending attr"></i>
                                        <i data-key="name" data-sort="desc" class="sort-caret descending attr"></i>
                                    </span>
                                </div>
                            </th>
                            <th>
                                <div class="el-sort">
                                    标签
                                    <span class="caret-wrapper">
                                        <i data-key="label" data-sort="asc" class="sort-caret ascending attr"></i>
                                        <i data-key="label" data-sort="desc" class="sort-caret descending attr"></i>
                                    </span>
                                </div>
                            </th>
                            <th>数据类型</th>
                            <th>单位</th>
                            <th class="right"></th>
                        </tr>
                    </thead>
                    <tbody class="table_tbody"></tbody>
                </table>
            </div>
        </form>`,
        success: function (layero, index) {
            layerEle = layero;
            getAttrList(flag);
            if (!typeData.length) {
                getDataType();
            } else {
                var dataTypehtml = selectHtml(typeData, 'datatype_id');
                $('#chooseAttr_from .el-form-item.datatype_id').find('.div_wrap .el-select-dropdown-wrap').html(dataTypehtml);
            }
            getLayerSelectPosition($(layero));
        },
        end: function () {
            pageNo = 1;
            ajaxAttrData = {
                key: '',
                label: '',
                name: '',
                datatype_id: '',
                unit_id: '',
                order: 'desc',
                sort: 'id'
            };
        }
    });
}

//物料存在询问模态框
function ConfirmModal(id) {
    layerConfirm = layer.open({
        type: 1,
        title: '询问',
        offset: '200px',
        area: '260px',
        shade: 0.1,
        shadeClose: true,
        resize: false,
        move: false,
        content: `<form class="confirm formModal formMateriel" id="confirm_from">
            <div>
                <p>存在物料属性一样的物料，是否继续添加物料？</p>
                <a href="" style="text-decoration: underline;color: #20a0ff;padding-top: 10px;display: inline-block;">查看同属性物料</a>
            </div>
            <div class="el-form-item">
                <div class="el-form-item-div btn-group">
                    <button type="button" class="el-button cancle no">否</button>
                    <button type="button" class="el-button el-button--primary submit yes">是</button>
                </div>
            </div>
        </form>`,
        success: function (layero, index) {
        }
    });
}

//tab点击发异步
function tabClick(panel) {
    $(window).scrollTop(0);
}

//获取id
function getIds(data, flag) {
    var ids = [];
    if (flag == 'pic') {
        data.forEach(function (item) {
            ids.push(item.drawing_id);
        });
    } else {
        data.forEach(function (item) {
            ids.push(item.attribute_definition_id);
        });
    }

    return ids;
}

//操作数组
function actArray(data, flag, id) {
    var ids = getIds(data, flag);
    var index = ids.indexOf(Number(id));
    data.splice(index, 1);
}

//过滤数据函数
function getFilterData(type, dataArr) {
    return dataArr.filter(function (e) {
        return e.name.indexOf(type) > -1 || e.code.toString().indexOf(type) > -1;
    });
}

//操作物料分类
function findLeaf(data, id, selectedId) {
    var returnId = 0;
    if (hasChilds(data, id)) {
        var children = getChildById(data, id);
        findLeaf(data, children[0].id, selectedId);
    } else {
        $('.bom-tree').find('.item-name[data-post-id=' + id + ']').addClass('selected');
        validatorToolBox[validatorConfig['material_category_id']]('material_category_id');
        if (categoryCorrect) {
            $('.bom-tree').parents('.el-form-item').find('.errorMessage').html('');
            if (mActionFlag == 'add' && selectedId != id) {
                var selectItem = categoryData.filter(function (e) {
                    return e.id == id;
                });
                $('#addMBasic_from #item_no').parents('.el-form-item').find('.errorMessage').html('');
                getCode(selectItem[0].code, selectItem[0].material_category_id);
                if (selectItem[0].unit_id) {
                    $('#addMBasic_from .el-form-item.unitlist').find('.el-select-dropdown-item[data-id=' + selectItem[0].unit_id + ']').click();
                }
                if (selectItem[0].source) {
                    $('#addMPlan_from .el-form-item.source').find('.el-select-dropdown-item[data-id=' + selectItem[0].source + ']').click();
                }
                templateid = selectItem[0].template_id;
                var tempEle = $('#addMAttr_from .el-form-item.template .div_wrap');
                tempEle.find('.el-select-dropdown-item[data-id=' + templateid + ']').click();
                $('#addMBasic_from #name').val(selectItem[0].name);
            }
        }
    }
}

function filterAttrData(val, dataArr) {
    return dataArr.filter(function (e) {
        return e.label.indexOf(val) > -1;
    });
}

function findAttrval(ele) {
    var val = ele.val();
    var parseData = JSON.parse(ele.parent().attr('data-range'));
    if (parseData != null && parseData != undefined) {
        if (parseData.options && parseData.options.length) {
            var filterdata = filterAttrData(val, parseData.options);
            var nlis = '<li data-id="" class="el-select-dropdown-item kong" data-name="--请选择--" class=" el-select-dropdown-item">--请选择--</li>';
            filterdata.forEach(function (item) {
                nlis += `<li data-id="${item.index}" class="el-select-dropdown-item" class="el-select-dropdown-item">${item.label}</li>`;
            });
            ele.parent().siblings('.el-select-dropdown-list').html(nlis);
        }
    }
}

function bindEvent() {
    //附件列表的删除
    $('body').on('click','#addImage .kv-file-remove.btn',function(){
        if($('#addImage .file-preview-frame').length==1){
            $("#drawing").fileinput('refresh',{
                initialPreview: [],
                initialPreviewConfig: []}).fileinput('clear');
        }else{
            if(mActionFlag=='edit'){
                var ele=$(this).parents('.file-preview-frame');
                ele.remove();
            }
        }
    });
    $('body').on('click','.kv-file-remove.btn',function(){
        var ele=$(this).parents('.file-preview-frame');
        ele.remove();
    });
    //点击弹框内部关闭dropdown
    $(document).click(function (e) {
        var obj = $(e.target);
        if (!obj.hasClass('el-select-dropdown-wrap') && obj.parents(".el-select-dropdown-wrap").length === 0) {
            $('.el-select-dropdown').slideUp();
        }
    });
    //所有按钮禁止冒泡及默认行为
    $('body').on('click', '.button', function (e) {
        e.stopPropagation();
        e.preventDefault();
    });
    //取消
    $('body').on('click', '.cancle', function (e) {
        e.stopPropagation();
        if ($(this).hasClass('no')) {
            layer.close(layerConfirm);
        }
    });
    $('body').on('click', '.el-select-dropdown-wrap', function (e) {
        e.stopPropagation();
    });
    //下拉列表项点击事件
    $('body').on('click', '.el-select-dropdown-item', function (e) {
        e.stopPropagation();
        var ele = $(this).parents('.el-select-dropdown').siblings('.el-select');
        var idval = $(this).attr('data-id'), formerVal = ele.find('.val_id').val();
        $(this).parent().find('.el-select-dropdown-item').removeClass('selected');
        $(this).addClass('selected');
        ele.find('.el-input').val($(this).text());
        ele.find('.val_id').val(idval);
        if (formerVal != idval) {
            if (ele.find('.val_id').attr('id') == 'template_id') {
                attrData = {
                    material_attributes: [],
                    operation_attributes: []
                };
                $('.sameMaterial').html('');
                if ($(this).text() == '--请选择--') {
                    $('#addMAttr_from .common-con').show();
                    $('#addMAttr_from .title.notemplate').show();
                    $('#addMAttr_from .title.template').hide();
                    templateid = 0;
                    $('#addMAttr_from .mattr-con-detail').html('');
                    validatorConfig['attr'] = '';
                } else {
                    templateid = idval;
                    $('#addMAttr_from .title.notemplate').hide();
                    $('#addMAttr_from .title.template').show();
                    $('#addMAttr_from .mattr-con-detail').html('');
                    validatorConfig['attr'] = '';
                    getMaterialAtrr(idval, '', false);
                }
            } else if (ele.find('.val_id').attr('id') == 'unit_id') {
                validatorToolBox[validatorConfig['unit_id']]('unit_id');
                if (unitCorrect) {
                    $(this).parents('.el-form-item').find('.errorMessage').html('');
                }
            } else if (ele.find('.val_id').attr('id') == 'source') {
                if (idval == 1) {
                    $('.el-form-item.othersource').show();
                } else {
                    $('.el-form-item.othersource').hide();
                }
            } else if (ele.find('.val_id').attr('id') == 'drawing_type_id') {
                if ($(this).text() == '--请选择--') {
                    var catehtml = `<div class="el-select-dropdown-wrap">
                    <div class="el-select">
                        <i class="el-input-icon el-icon el-icon-caret-top"></i>
                        <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                        <input type="hidden" class="val_id" id="drawing_type_id" value="">
                    </div></div>`;
                    $('#choosePic_from .picgroup .div_wrap').html(catehtml);
                } else {
                    getPicGroup(idval);
                }
            }
        }
        $(this).parents('.el-select-dropdown').hide().siblings('.el-select').find('.el-input-icon').removeClass('is-reverse');
    });
    //树形表格展开收缩
    $('body').on('click', '.bom-tree .expand-icon', function (e) {
        if ($(this).hasClass('icon-minus')) {
            $(this).addClass('icon-plus').removeClass('icon-minus');
            $(this).parents('.tree-folder-header').siblings('.tree-folder-content').hide();
        } else {
            $(this).addClass('icon-minus').removeClass('icon-plus');
            $(this).parents('.tree-folder-header').siblings('.tree-folder-content').show();
        }
    });
    //树中节点点击
    $('body').on('click', '.item-name:not(.noedit)', function () {
        var parele = $(this).parents('.bom_tree_container');
        var material_category_id = '',
            selectedId = parele.find('.item-name.selected').attr('data-post-id');
        if (saveFlag) {
            saveFlag = false;
            selectedId = 0;
            resetAllData();
            $(this).hasClass('selected') ? $(this).removeClass('selected') : null;
        }
        if (!$(this).hasClass('selected')) {
            parele.find('.item-name').removeClass('selected');
            findLeaf(categoryData, $(this).attr('data-post-id'), selectedId);
        }
    });
    $('body').on('click', '.search-div .search-icon', function () {
        var ele = $(this).siblings('.el-input');
        findAttrval(ele);
    });
    //autocomplete输入框事件
    $('body').on('focus', '.el-input-search', function () {
        // $(this).parent().siblings('.el-select-dropdown').show();
        // $(this).siblings('.el-input-icon').addClass('is-reverse');
        // console.log($(this).parent().attr('data-range'));

    }).on('input', '.el-input-search', function () {
        // var that=$(this);
        // var currentVal = that.val().trim();
        // setTimeout(function(){
        //     var val=that.val().trim();
        //     if(currentVal==val){
        //         var filterData=getFilterData(val,categoryData);
        //         var categorylis=selectHtml(filterData,'category_search');
        //         $('.el-form-item.category').find('.el-select-dropdown').html(categorylis);
        //     }
        // },500);
    });
    $('body').on('click', '.el-select.el-search .el-input-icon', function (e) {
        e.stopPropagation();
        $(this).toggleClass('is-reverse');
        $(this).parent().siblings('.el-select-dropdown').toggle();
    });
    $('body').on('click', '.el-select:not(.noedit,.el-search)', function (e) {
        e.stopPropagation();
        $(this).find('.el-input-icon').toggleClass('is-reverse');
        $(this).siblings('.el-select-dropdown').toggle();
    });
    //排序
    $('body').on('click', '.sort-caret', function (e) {
        e.stopPropagation();
        $('.el-sort').removeClass('ascending descending');
        if ($(this).hasClass('ascending')) {
            $(this).parents('.el-sort').addClass('ascending')
        } else {
            $(this).parents('.el-sort').addClass('descending')
        }
        if ($(this).hasClass('attr') || $(this).hasClass('opattr')) {
            ajaxAttrData.order = $(this).attr('data-sort');
            ajaxAttrData.sort = $(this).attr('data-key');
            $(this).hasClass('attr') ? getAttrList('attr') : getAttrList('opattr');
        }
    });
    //弹出搜索弹框
    $('body').on('click', '.choose', function () {
        if ($(this).hasClass('choose-pic')) {//图纸弹框
            picData.forEach(function (item) {
                var id = item.drawing_id;
                item.comment = $('.pic-li[data-id=' + id + ']').find('.textarea-comment').val();
            });
            ajaxPicData.sort = 'id';
            ajaxPicData.order = 'desc';
            ChoosePic();
        } else if ($(this).hasClass('choose-attr')) {//物料属性弹框
            var ele = $('.mattr-container .mattr-con-detail');
            attrData.material_attributes.forEach(function (item) {
                var id = item.attribute_definition_id;
                item.value = ele.find('.el-form-item:not(.btnShow)[data-id=' + id + '] .attr-val').val().trim() || '';
            });
            if ($(this).hasClass('choose-template')) {//模板中选择
                getMaterialAtrr(templateid, 'attr', true);
            } else {
                ajaxAttrData.sort = 'id';
                ajaxAttrData.order = 'desc';
                ChooseAttr('物料属性', 'attr');
            }
        } else if ($(this).hasClass('choose-opattr')) {//工艺属性弹框
            var ele = $('.mgattr-container .mattr-con-detail');
            attrData.operation_attributes.forEach(function (item) {
                var id = item.attribute_definition_id;
                item.value = ele.find('.el-form-item[data-id=' + id + '] .attr-val').val().trim() || '';
            });
            if ($(this).hasClass('choose-template')) {//模板中选择
                getMaterialAtrr(templateid, 'opattr', true);
            } else {
                ajaxAttrData.sort = 'id';
                ajaxAttrData.order = 'desc';
                ChooseAttr('工艺属性', 'opattr');
            }
        }
    });
    //弹框搜索
    $('body').on('click', '.choose-search:not(.is-disabled)', function (e) {
        e.stopPropagation();
        var parentForm = $(this).parents('.formModal');
        $(this).addClass('is-disabled');
        pageNo = 1;
        if ($(this).hasClass('choose-pic')) {//搜索图纸
            ajaxPicData = {
                type_id: parentForm.find('#drawing_type_id').val() || '',
                group_id: parentForm.find('#drawing_group_id').val() || '',
                code: parentForm.find('#code').val().trim(),
                name: parentForm.find('#name').val(),
                sort: 'id',
                order: 'desc'
            };
            getPicList();
        } else if ($(this).hasClass('attr') || $(this).hasClass('opattr')) {//搜索属性
            ajaxAttrData = {
                key: parentForm.find('#key').val(),
                name: parentForm.find('#name').val(),
                label: parentForm.find('#label').val(),
                datatype_id: parentForm.find('#datatype_id').val(),
                unit_id: parentForm.find('#unit_id').val(),
                sort: 'id',
                order: 'desc'
            };
            $(this).hasClass('attr') ? getAttrList('attr') : getAttrList('opattr');
        } else if ($(this).hasClass('attr-ok')) {//确认属性
            if ($(this).hasClass('choose-attr-ok')) {
                var attr = createAttrHtml(attrData, 'self', 'attr');
                attr = '' ? null : ($('#addMAttr_from .mattr-container').show().find('.mattr-con-detail').html(attr));
            } else {
                var opattr = createAttrHtml(attrData, 'self', 'opattr');
                opattr == '' ? null : ($('#addMAttr_from .mgattr-container').show().find('.mattr-con-detail').html(opattr));
            }
            layer.close(layerModal);
        } else if ($(this).hasClass('choose-pic-ok')) {//确认图纸
            $('#addMPic_from .picList ul').html(createPicHtml());
            layer.close(layerModal);
        }
    });
    //弹框选择按钮
    $('body').on('click', '.pop-button:not(.is-disabled)', function (e) {
        e.preventDefault();
        e.stopPropagation();
        if ($(this).hasClass('material-pic-button')) {//选择图纸
            var data = $(this).parents('.tritem').data('picItem');
            var ids = getIds(picData, 'pic');
            if (ids.indexOf(data.drawing_id) == -1) {
                picData.push(data);
                var tag = `<span data-id="${data.drawing_id}" class="el-tag">${data.code}(${data.name})<i class="el-icon icon-close el-pic-close el-pic-pop-close el-icon-close"></i></span>`;
                $('#choosePic_from .pic-selected').append(tag);
            }
            $(this).addClass('is-disabled');
        } else if ($(this).hasClass('attr-button')) {//选择属性
            var data = $(this).parents('.tritem').data('attrItem');
            if ($(this).hasClass('attr')) { //物料属性
                var ids = getIds(attrData.material_attributes, 'attr');
                if (ids.indexOf(data.attribute_definition_id) == -1) {
                    attrData.material_attributes.push(data);
                    var tag = `<span data-id="${data.attribute_definition_id}" class="el-tag">${data.key}(${data.name})<i class="el-icon icon-close el-attr-close el-icon-close"></i></span>`;
                    $('#chooseAttr_from .pic-selected').append(tag);
                }
            } else {
                var ids = getIds(attrData.operation_attributes, 'attr');
                if (ids.indexOf(data.attribute_definition_id) == -1) {
                    attrData.operation_attributes.push(data);
                    var tag = `<span data-id="${data.attribute_definition_id}" class="el-tag">${data.key}(${data.name})<i class="el-icon icon-close el-opattr-close el-icon-close"></i></span>`;
                    $('#chooseAttr_from .pic-selected').append(tag);
                }
            }
            $(this).addClass('is-disabled');
        }
    });
    //checkbox点击事件
    $('body').on('click', '.el-checkbox_input', function () {
        $(this).toggleClass('is-checked');
        var ele = $(this).parents('.el-form-item');
        if (!$(this).hasClass('is-checked')) {

            if (ele.find('.el-select').length) {
                ele.find('.el-select').addClass('noedit');
            } else {
                ele.find('.el-input').attr('readonly', 'readonly');
            }
        } else {
            if (ele.find('.el-select').length) {
                ele.find('.el-select').removeClass('noedit');
            } else {
                ele.find('.el-input').removeAttr('readonly');
            }
        }
    });
    //tap切换按钮
    $('body').on('click', '.el-tap-wrap:not(.is-disabled) .el-tap', function () {
        var form = $(this).attr('data-item');
        // if(tapFlag=='addMAttr_from'&&tapFlag!=form){//离开物料属性tap
        //     getAttrSData();
        // }
        if (!$(this).hasClass('active')) {
            $(this).addClass('active').siblings('.el-tap').removeClass('active');
            $('#' + form).parent().addClass('active').siblings('.el-panel').removeClass('active');
            tapFlag = form;
            tabClick(form);
        }
    });
    //上一步按钮
    $('body').on('click', '.el-button.prev', function () {
        var prevPanel = $(this).attr('data-prev');
        $(this).parents('.el-panel').removeClass('active').siblings('.' + prevPanel).addClass('active');
        $('.el-tap[data-item=' + prevPanel + ']').addClass('active').siblings().removeClass('active');
        tapFlag = prevPanel;
        tabClick(prevPanel);
    });
    //下一步按钮
    $('body').on('click', '.el-button.next:not(.is-disabled)', function () {
        var nextPanel = $(this).attr('data-next');
        // if(nextPanel=='addMGAttr_from'||nextPanel=='addMPlan_from'){//离开物料属性
        //     getAttrSData();
        // }
        $(this).parents('.el-panel').removeClass('active').siblings('.' + nextPanel).addClass('active');
        $('.el-tap[data-item=' + nextPanel + ']').addClass('active').siblings().removeClass('active');
        tapFlag = nextPanel;
        tabClick(nextPanel);
    });
    //删除图纸
    $('body').on('click', '.icon-close', function () {
        var id = $(this).parent().attr('data-id');
        if ($(this).hasClass('el-pic-close')) {
            actArray(picData, 'pic', id);
            if ($(this).hasClass('el-pic-pop-close')) {//从弹框中删除
                $(this).parent().remove();
                $('.material-pic-button[data-picid=' + id + ']').removeClass('is-disabled');
            } else if ($(this).hasClass('el-icon-delete')) {//从列表中删除
                $(this).parents('.pic-li').remove();
            }
        } else {
            if ($(this).hasClass('el-attr-close')) {
                actArray(attrData.material_attributes, 'attr', id);
            } else if ($(this).hasClass('el-opattr-close')) {
                actArray(attrData.operation_attributes, 'opattr', id);
            }
            if ($(this).hasClass('el-icon-delete')) {//从列表中删除
                $(this).parents('.el-form-item').remove();
            } else {
                $(this).parent().remove();
                $('.attr-button[data-id=' + id + ']').removeClass('is-disabled');
            }
        }
    });
    //图纸放大
    $('body').on('click', '.pic-img', function () {
        var imgList, current;
        if ($(this).hasClass('pic-list-img')) {
            imgList = $(this).parents('ul').find('.pic-li');
            current = $(this).parents('.pic-li').attr('data-id');
        } else {
            imgList = $(this);
            current = $(this).attr('data-id');
        }
        showBigImg(imgList, current);
    });
    //查看图纸详细信息
    $('body').on('click', '.pic-li .el-icon-info', function () {
        var id = $(this).attr('data-id');
        var arr = picData.filter(function (e) {
            return e.drawing_id == id;
        });
        arr.length && createPicDetail(arr[0]);
        $('#addMPic_from .picCon').hide();
        //getPicDetail($(this).attr('data-id'),$(this).attr('data-group'));
    });
    //返回图纸列表
    $('body').on('click', '.back-pic', function () {
        $('.picDetail').hide().siblings('.picCon').show();
    });
    //单选按钮点击事件
    $('body').on('click', '.el-radio-input', function (e) {
        $(this).parents('.el-radio-group').find('.el-radio-input').removeClass('is-radio-checked');
        $(this).addClass('is-radio-checked');
    });
    //输入框的相关事件
    $('body').on('focus', '.el-input:not([readonly],.el-input-search)', function () {
        if (!$(this).hasClass('attr_val')) {
            if ($(this).attr('id') == 'min_stock' || $(this).attr('id') == 'max_stock') {
                $('#safety_stock').parents('.el-form-item').find('.errorMessage').html("");
            } else {
                $(this).parents('.el-form-item').find('.errorMessage').html("");
            }
        }
    }).on('blur', '.el-input:not([readonly],.el-input-search),.el-textarea', function () {
        if (!$(this).hasClass('attr_val')) {
            var name = $(this).attr("id");
            if (name == 'min_stock' || name == 'max_stock') {
                name = 'safety_stock';
            }
            validatorConfig[name]
            && validatorToolBox[validatorConfig[name]]
            && validatorToolBox[validatorConfig[name]](name)
            && remoteValidatorConfig[name]
            && remoteValidatorToolbox[remoteValidatorConfig[name]]
            && remoteValidatorToolbox[remoteValidatorConfig[name]](name);
        }
    });
    //查找相同物料
    $('#addMAttr_from .sameAttr').on('click', function () {
        var material_attributes = getAttrData('#addMAttr_from .mattr-container'),
            category_id = $('#addMBasic_from').find('.item-name.selected').length &&
                $('#addMBasic_from').find('.item-name.selected').attr('data-post-id') || 0;
        $('.sameMaterial').html('');
        if (material_attributes.length) {
            pageMaNo = 1;
            ajaxSameData = {
                material_category_id: category_id,
                material_attributes: JSON.stringify(material_attributes),
                page_no: pageMaNo,
                page_size: 10,
                order: 'desc',
                sort: 'id',
                _token: TOKEN
            };
            getSameMaterial();
        }
    });
    //添加按钮点击
    $('body').on('click', '.submit:not(.is-disabled)', function (e) {
        e.stopPropagation();
        if (!$(this).hasClass('is-disabled')) {
            var correct = 1;
            for (var type in validatorConfig) {
                if (type == 'attr' && validatorConfig[type] == '') {
                    correct = 1;
                } else {
                    correct = validatorConfig[type] &&
                        validatorToolBox[validatorConfig[type]](type);
                }
                if (!correct) {
                    break;
                }
            }
            if (correct) {
                $(this).addClass('is-disabled');
                getBasicData();
                getAttrSData();
                getPicData();
                getFujianData();
                ajaxSubmitData._token = TOKEN;
                if ($(this).hasClass('edit-submit')) {
                    editAll();
                } else {
                    ajaxSubmitData.setting_id = setting_id;
                    saveAllData();
                }
            } else if (!stockCorrect) {
                //库存填写错误
                $('.el-tap[data-item=addMPlan_from]').click();
            } else if (!attrCorrect) {
                $('.el-tap[data-item=addMAttr_from]').click();
                setTimeout(function () {
                    LayerConfig('fail', '无模板的自选属性必填,请全部填写');
                }, 20);
            } else if (!nameCorrect || !itemnoCorrect || !categoryCorrect || !unitCorrect) {
                //必填字段在基础信息tab中
                $('.el-tap[data-item=addMBasic_from]').click();
            }
        }
    });
}

    