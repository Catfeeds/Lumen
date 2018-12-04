var layerModal,
selectBomChild = '',
    creator_token = '',
    ajaxTopData = {
        order: 'desc',
        sort: 'id'
    },
    ajaxData = {
        order: 'desc',
        sort: 'id'
    },
    pageNo = 1,
    pageNo1 = 1,
    selectedRouteList = [],
    materialData = [],
    bomShowData = {},
    itemAddFlag = 1,
    replaceId = '',
    topMaterial = {},
    ajaxSubmitData = {},
    codeCorrect = !1,
    nameCorrect = !1,
    materialCorrect = !1,
    bomChildrenCorrect = !1,
    versionCorrect = !1,
    operationCorrect = !1,
    mActionFlag = 'add',
    noEditFlag = '',
    bomOperation = [],
    bom_id = '',
    bomDesign = '',
    bomProduct = '',
    productId,
    productPageNo = 1,
    productPageSize = 10,
    productDifference = [],
    operationSource = [],
    abilitySource = [],
    bomItemArr = [],
    editData = {},
    routeid = 0,
    routenodes = [],
    opabs = [],
    workCenters = {},
    checkedPractice = [],
    selectedMaterialType = [],
    go = true,
    alltreego = true, routeLine = [],
    newroutingGraph = null,
    isVersionOn = '',
    Status = '',
    wasRelease = '',
    Version='',
    bom_no='',
    scrollTop=0,
    material_code='',
    choose_code=[],
    inserttreego= true,
    bomMaterialIdList={},
    validatorToolBox = {
        checkCode: function ($name) {
            var value = $name.val().trim();
            return $name.parents('.el-form-item').find('.errorMessage').hasClass('active') ? (codeCorrect = !1, !1) : Validate.checkNull(value) ? (showInvalidMessage($name, "物料清单编码不能为空"), codeCorrect = !1, !1) :
                !Validate.checkItemno(value) ? (showInvalidMessage($name, "物料清单编码由4-20位字母数字下划线组成"), codeCorrect = !1, !1) :
                    (codeCorrect = 1, !0);
        },
        checkLossrate: function ($name) {
            var value = $name.val().trim();
            if (isNaN(value) || value < 0) {
                $name.val(0);
            } else if (value >= 100) {
                $name.val(99.99);
            } else if (!(/^\d+(\.\d{1,2})?$/g.test(value))) {
                var str = value.toString(),
                    index = str.indexOf('.');
                if (index > -1) {
                    var newStr = '';
                    str.length >= index + 3 ? (newStr = str.substring(0, index + 3)) : (newStr = str.substring(0, index));
                    $name.val(Number(newStr));
                } else {
                    $name.val(0);
                }
            }
            return 1;
        },
        checkName: function ($name) {
            var value = $name.val().trim();
            return $name.parents('.el-form-item').find('.errorMessage').hasClass('active') ? (nameCorrect = !1, !1) : Validate.checkNull(value) ? (showInvalidMessage($name, "物料清单名称不能为空"), nameCorrect = !1, !1) :
                (nameCorrect = 1, !0);
        },
        checkOperationId: function ($name) {
            var value = $name.val();
            if (value == '--请选择--') {
                value = '';
            }
            return $name.parents('.el-form-item').find('.errorMessage').hasClass('active') ? (operationCorrect = !1, !1) :
                Validate.checkNull(value) ? (showInvalidMessage($name, "请选择工序"), operationCorrect = !1, !1) :
                    (operationCorrect = 1, !0);
        },
        checkMaterial: function ($name) {
            var val = $name.data('topMaterial');
            return $name.parents('.el-form-item').find('.errorMessage').hasClass('active') ? (materialCorrect = !1, !1) : val == undefined || val != undefined && val.material_id == undefined ? (showInvalidMessage($name, "物料编码不能为空"), materialCorrect = !1, !1) :
                (materialCorrect = 1, !0);
        },
        checkBomChildren: function (data) {
            if (data.children != undefined) {
                return data.children.length ? (bomChildrenCorrect = 1, !0) : (bomChildrenCorrect = !1, !1);
            }

        },
        checkVersion: function () {
            if (!$('.ma-tritem.is-version-tr').length) {
                versionCorrect = 1;
            } else {
                versionCorrect = 1;
                $('.ma-tritem.is-version-tr').each(function () {
                    if ($(this).find('#is-version').val() == '' || $(this).find('#is-version').siblings('.el-input').val() == '--请选择--') {
                        versionCorrect = !1;
                        return false;
                    }
                });
            }
            return versionCorrect;
        },
        checkBomNum: function () {

        }
    },
    remoteValidatorToolbox = {
        remoteCheckCode: function (name) {
            var value = $('#' + name).val().trim();
            getUnique(name, value, function (rsp) {
                if (rsp.results && rsp.results.exist) {
                    codeCorrect = !1;
                    var val = '已注册';
                    showInvalidMessage($('#' + name), val);
                } else {
                    codeCorrect = 1;
                }
            });
        },
        remoteCheckName: function (name) {
            var value = $('#' + name).val().trim();
            getUnique(name, value, function (rsp) {
                if (rsp.results && rsp.results.exist) {
                    nameCorrect = !1;
                    var val = '已注册';
                    showInvalidMessage($('#' + name), val);
                } else {
                    nameCorrect = 1;
                }
            });
        },
        remoteMaterial: function (name) {
            var value = $('#' + name).data('topMaterial').material_id;
            getUnique(name, value, function (rsp) {
                if (rsp.results && rsp.results.exist) {
                    materialCorrect = !1;
                    var val = '该物料已存在BOM';
                    $('.bom-button.bom-add-new-item').addClass('is-disabled');
                    $('.el-form-item-label.show-material').removeClass('mater-active');
                    showInvalidMessage($('#' + name), val);
                } else {
                    // $('.bom-button.bom-add-new-item').removeClass('is-disabled');
                    $('.el-form-item-label.show-material').addClass('mater-active');
                    $('#material_id').parents('.el-form-item').find('.errorMessage').removeClass('active').html('');
                    materialCorrect = 1;
                }
            });
        }
    },
    validatorConfig = {
        bom_children: "checkBomChildren",
        iversion: "checkVersion",
        code: 'checkCode',
        loss_rate: "checkLossrate",
        name: "checkName",
        material_id: "checkMaterial"
        // basic_operation_id:"checkOperationId"
    }, remoteValidatorConfig = {
        code: 'remoteCheckCode',
        // name: 'remoteCheckName',
        material_id: 'remoteMaterial'
    };
var tabError = {
    'addBBasic_from': ['name', 'code', 'material_id'],
};

$(function () {
    $('#showLog').hide();
    creator_token = '88t8r9m70r2ea5oqomfkutc753';
    $('.el-tap-wrap').addClass('edit');
    $('.el-button.next').addClass('edit');

    var url = window.location.pathname.split('/');
    if (url.indexOf('bomEdit') > -1) {
        $('.bom-fake-tree').addClass('show');
        mActionFlag = 'edit';
        noEditFlag = 'edit';
        procedureData = 'no-checked';
        bom_id = getQueryString('id');
        bomDesign = getQueryString('design') || '';
        bomProduct = getQueryString('product') || '';
        bom_id != undefined ? getBomInfo(bom_id) : LayerConfig('fail', 'url链接缺少id参数，请给到id参数');
        $('.tap-btn-wrap .saveoption').css('display', 'flex');
        $('.tap-btn-wrap .saveUpProduct').css('display', 'flex');

        /*编辑时添加项不可编辑by judy*/
        $('#addBBasic_from .bom-add-new-item').css('background', '#ccc').attr('disabled', true);
        /*编辑时添加项不可编辑 by judy*/

    } else {
        $('#showLog').hide();
        mActionFlag = 'add';
        getBOMGroup();//获取物料清单分组
        attchfileinit('attachment', [], []);

        //顶级无物料时不可点击保存
        $('.saveBtn .submit.save').attr('disabled', true)
    }
    bindEvent();
});
//调整大小
$(".bom-fake-tree").mousedown(function(ev){
    var ev = ev || event;
    var mouseDownX = ev.clientX;
    var mouseDownY = ev.clientY;
    var L0 = this.offsetLeft;
    var R0 = this.offsetLeft + this.offsetWidth;
    var W = this.offsetWidth;
    var H = this.offsetHeight;
    var areaL = L0 + 10;
    var areaR = R0 - 10;
    // 左
    var changeL = mouseDownX < areaL;
    // 右
    var changeR = mouseDownX > areaR;
    document.onmousemove = function(ev){
      var ev = ev || event;
      var mouseMoveX = ev.clientX;
      var mouseMoveY = ev.clientY;
      // 左
      if(changeL){
        $(".bom-fake-tree").css("width",(mouseDownX - mouseMoveX) + W + 'px');
        $(".bom-fake-tree").css("left",L0 - (mouseDownX - mouseMoveX) + 'px');
      }
      // 右
      if(changeR){
        $(".bom-fake-tree").css("width", (mouseMoveX - mouseDownX) + W + 'px');
      }
    }
    //全局释放鼠标
    document.onmouseup = function(){
      document.onmousemove = null;
    }
    return false;
})
//显示错误信息
function showInvalidMessage($name, val) {
    $name.parents('.el-form-item').find('.errorMessage').addClass('active').html(val);
}

//附件初始化
function attchfileinit(ele, preUrls, preOther) {
    $('#' + ele).fileinput({
        'theme': 'explorer-fa',
        language: 'zh',
        uploadAsync: true,
        'uploadUrl': URLS['bomAdd'].uploadAttachment,
        uploadExtraData: function (previewId, index) {
            var obj = {};
            obj.flag = 'bom';
            obj._token = TOKEN;
            obj.creator_token = creator_token;
            return obj;
        },
        initialPreview: preUrls,
        initialPreviewConfig: preOther,
        dropZoneEnabled: false,
        showCaption: false,
        showClose: false,
        showUpload: false,
        showRemove: false,
        maxFileSize: 10 * 1024,
        maxFileCount: 1,
        overwriteInitial: false,
        showCancel: false
    }).on('fileselect', function (event, numFiles, label) {
        $(this).fileinput("upload");
    }).on('fileloaded', function (event, file, previewId, index, reader) {
        $('#' + previewId).attr('data-preview', 'preview-' + file.lastModified);
        var last_mod = file.lastModified;
        var flag=0;
        $('.file-preview-thumbnails tr').each(function(v,n){
            
            if(n.getAttribute('data-preview')!=undefined && n.getAttribute('data-preview').indexOf(last_mod)>0){
                flag++;
            }
            if(flag>1){
                $('#'+n.id).remove();
                layer.msg('当前文件已选择');
                return false;
            }
            console.log(flag);
        });
    }).on('fileuploaded', function (event, data, previewId, index) {
        var result = data.response,
            file = data.files[0];
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

function bindPagenationClick(totalData, pageSize, pageno) {
    $('#pagenation').show();
    $('#pagenation').pagination({
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
            itemAddFlag == 3 ? (pageNo = pageno, getTopMaterialList()) : (pageNo1 = pageno, getMaterialList(topMaterial.material_id));
        }
    });
}

function getBomInfo(bom_id) {
    // var is_design = (getQueryString('is_design') == 1) ? 1 : 0;
    // function getUrlParms(name){
    //     var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
    //     var r = window.location.search.substr(1).match(reg);
    //     if(r!=null)
    //         return unescape(r[2]);
    //     return null;
    // }
    // var is_design = getUrlParms("is_design") ? 1 : 0;
    // console.log(is_design);
    AjaxClient.get({
        url: URLS['bomAdd'].bomShow + "?" + _token + '&bom_id=' + bom_id ,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            var info = rsp.results;
            isVersionOn = info.is_version_on;
            wasRelease = info.was_release;
            Status = info.status;
            Version=info.version;
            bom_no = info.bom_no;
            material_code = info.code;
            // console.log(isVersionOn);
            if (isVersionOn == 0 && wasRelease == 0 && Status == 1) {
                $('.el-form-item.version_release').html("当前版本:"+Version+".0未定版,可以编辑");
                openBtn();
                openSave();
                noEditFlag = 'canEdit';
                // $('#addBBasic_from .bom-add-new-item').css('background-color', '#20a0ff').attr('disabled', false);
                createMaterialItem(materialData);
            } else if (info.status == 0) {
                $('.el-form-item.version_release').html("当前版本:"+Version+".0未激活,不可编辑");
                closeBtn();
                closeSave();
            } else {
                $('.el-form-item.version_release').html("当前版本:"+Version+".0已定版,不可编辑");
                closeBtn();
                closeSave();
            }
            if (rsp.results) {
                $('#showLog').show();
                editData = $.extend({}, rsp.results);
                editData.bom_tree.ppid = 0;
                actParentTree(editData.bom_tree);
                bomTreeOld = editData.bom_tree;
                createRealBom(editData.bom_tree, function (bomHtml) {
                    $('.bom-fake-tree .bom-tree').html(bomHtml);
                    setTimeout(function () {
                        $('.top-item.item-name.allBOM').addClass('selected');
                        // getBomRouteLine();
                    }, 20);
                }, 'allBOM');
                setBomData(rsp.results);
                getBOMGroup(rsp.results.bom_group_id);
                getProcedure(function () {
                    getBomRouteLine();
                    // //工艺路线
                    // var span='';
                    // if(bomShowData.routings){
                    //   var routings=JSON.parse(bomShowData.routings);
                    //   routings.forEach(function (rlitem) {
                    //     span+=`<span data-route-id="${rlitem.id}" data-name="${rlitem.name}" class="el-tag route-tag">${rlitem.name}<i data-route-id="${rlitem.id}" class="fa fa-close"></i></span>`;
                    //   });
                    // }
                    // $('#addRoute_form .route-lists').html(span);
                    // setTimeout(function () {
                    //   $('#addRoute_form .route-lists').find('.route-tag').eq(0).click();
                    // },20);
                });
                getProcedureSource(rsp.results.item_no, rsp.results.operation_id, rsp.results.bom_tree.operation_ability)
            } else {
                getBOMGroup();
            }
        },
        fail: function (rsp) {
            getBOMGroup();
            console.log('获取物料清单详细信息失败');
        }
    }, this);
}

//同步SAP
$('body').on('click','.sync-SAP',function(){
    var bom_id = $('.item-name.bom-tree-item.allBOM.selected').attr('data-bom-id'),routing_id = $(this).attr('data-routing-id'),factory_id = $(this).attr('data-factoryId');
    AjaxClient.get({
        url: URLS['bomAdd'].syncSAP+ "?" + _token + '&bom_id=' + bom_id + '&routing_id='+routing_id+ '&factory_id='+factory_id,
        dataType: 'json',
        success: function (rsp) {
            var msg = rsp.message;
            layer.open({
                title:'同步成功',
                content:msg
            });
        },
        fail: function (rsp) {
            var msg = rsp.message;
            layer.open({
                title:'同步失败',
                content:msg
            });
        }
    }, this);
})

$('body').on('click','.bom-tree-item.top-item.item-name.allBOM',function(){
    var bom_id = getQueryString('id');
    AjaxClient.get({
        url: URLS['bomAdd'].bomShow + "?" + _token + '&bom_id=' + bom_id ,
        dataType: 'json',
        success: function (rsp) {
            var info = rsp.results;
            isVersionOn = info.is_version_on;
            wasRelease = info.was_release;
            Status = info.status;
            Version=info.version;
            bom_no = info.bom_no;

            // console.log(isVersionOn,wasRelease,Status,Version);
            if (isVersionOn == 0 && wasRelease == 0 && Status == 1) {
                $('.el-form-item.version_release').html("当前版本:"+Version+".0未定版,可以编辑");
                openBtn();
                openSave();
                noEditFlag = 'canEdit';
                // $('#addBBasic_from .bom-add-new-item').css('background-color', '#20a0ff').attr('disabled', false);
                createMaterialItem(materialData);
            } else if (info.status == 0) {
                $('.el-form-item.version_release').html("当前版本:"+Version+".0未激活,不可编辑");
                closeBtn();
                closeSave();
            } else {
                $('.el-form-item.version_release').html("当前版本:"+Version+".0已定版,不可编辑");
                closeBtn();
                closeSave();
            }
        },
        fail: function (rsp) {
        }
    }, this);
})
//获取子项bom
function getItemBomInfo(bom_id) {
    AjaxClient.get({
        url: URLS['bomAdd'].bomShow + "?" + _token + '&bom_id=' + bom_id,
        dataType: 'json',
        success: function (rsp) {
            var info = rsp.results;
            isVersionOn = info.is_version_on;
            wasRelease = info.was_release;
            Status = info.status;
            Version=info.version;
            bom_no = info.bom_no;

            // console.log(isVersionOn,wasRelease,Status,Version);
            if (isVersionOn == 0 && wasRelease == 0 && Status == 1) {
                $('.el-form-item.version_release').html("当前版本:"+Version+".0未定版,可以编辑");
                openBtn();
                openSave();
            } else if (info.status == 0) {
                $('.el-form-item.version_release').html("当前版本:"+Version+".0未激活,不可编辑");
                closeBtn();
                closeSave();
            } else {
                $('.el-form-item.version_release').html("当前版本:"+Version+".0已定版,不可编辑");
                closeBtn();
                closeSave();
            }
            if (rsp.results) {
                $('#showLog').show();
                setBomData(rsp.results);
                getProcedure(function () {
                    getBomRouteLine();
                    // //工艺路线
                    // var span='';
                    // if(bomShowData.routings){
                    //   var routings=JSON.parse(bomShowData.routings);
                    //   routings.forEach(function (rlitem) {
                    //     span+=`<span data-route-id="${rlitem.id}" data-name="${rlitem.name}" class="el-tag route-tag">${rlitem.name}<i data-route-id="${rlitem.id}" class="fa fa-close"></i></span>`;
                    //   });
                    // }
                    // $('#addRoute_form .route-lists').html(span);
                    // setTimeout(function () {
                    //   $('#addRoute_form .route-lists').find('.route-tag').eq(0).click();
                    // },20);
                });
                getProcedureSource(rsp.results.item_no, rsp.results.operation_id, rsp.results.bom_tree.operation_ability);
                //物料清单分组
                if (rsp.results.bom_group_id) {
                    $('.el-form-item.bom_group').find('.el-select-dropdown-item[data-id=' + rsp.results.bom_group_id + ']').click();
                }
            }
        },
        fail: function (rsp) {
            console.log('获取子项物料清单详细信息失败');
        }
    }, this);
}

//获取物料信息
function getMaterialInfo(id, flag, version) {
    AjaxClient.get({
        url: URLS['bomAdd'].materialShow + "?" + _token + "&material_id=" + id,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            if (rsp && rsp.results) {

                materialDetailInfoModal(rsp.results, flag, version);
            } else {
                console.log('获取物料信息失败');
            }
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            console.log('获取物料信息失败');
        }
    }, this);
}

//获取物料分类
function getCategory() {
    AjaxClient.get({
        url: URLS['bomAdd'].category + "?" + _token,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            if (rsp && rsp.results && rsp.results.length) {
                var catehtml = treeList(rsp.results, rsp.results[0].parent_id, 'fake');
                $('.selectMaterial_tree .bom-tree').html(catehtml);
                setTimeout(function () {//填充数据
                    if (itemAddFlag == 3) {
                        ajaxTopData.material_category_id != undefined &&
                        ajaxTopData.material_category_id != '' ? $('.selectMaterial_tree .bom-tree').find('.item-name[data-post-id=' + ajaxTopData.material_category_id + ']').addClass('selected') : null;
                        $('.selectMaterial_table').find('#item_no').val(ajaxTopData.item_no);
                        $('.selectMaterial_table').find('#name').val(ajaxTopData.name);
                        // console.log(ajaxTopData.material_attributes)
                        if (ajaxTopData.material_attributes) {
                            var m_attr = JSON.parse(ajaxTopData.material_attributes),
                                template_id = $('.selectMaterial_tree .bom-tree').find('.item-name.selected').attr('data-template-id');
                            getMaterialTemplate(template_id, m_attr)
                        }

                    } else {
                        ajaxData.material_category_id != undefined &&
                        ajaxData.material_category_id != '' ? $('.selectMaterial_tree .bom-tree').find('.item-name[data-post-id=' + ajaxData.material_category_id + ']').addClass('selected') : null;
                        $('.selectMaterial_table').find('#item_no').val(ajaxData.item_no);
                        $('.selectMaterial_table').find('#name').val(ajaxData.name);
                        if (ajaxData.material_attributes) {
                            var m_attr = JSON.parse(ajaxData.material_attributes),
                                template_id = $('.selectMaterial_tree .bom-tree').find('.item-name.selected').attr('data-template-id');
                            getMaterialTemplate(template_id, m_attr);
                        }
                        ajaxData.has_bom != undefined && ajaxData.has_bom != '' ? $('.selectMaterial_table').find('.el-form-item.has_bom .el-select-dropdown-item[data-id=' + ajaxData.has_bom + ']').click() : null;
                    }
                }, 100);
            } else {
                console.log('获取物料分类失败');
            }
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            console.log('获取物分类失败');
        }
    }, this);
}

//获取顶级物料
function getTopMaterialList() {
    var urlLeft = '';
    urlLeft += "&page_no=" + pageNo + "&page_size=6";
    $('.selectMaterial_table .table-container .table_tbody').html('');
    AjaxClient.get({
        url: URLS['bomAdd'].bomMother + "?" + _token + urlLeft,
        data: ajaxTopData,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            template_ids = [];
            var totalData = rsp.paging.total_records;
            if (totalData != 0 && pageNo > Math.ceil(totalData / 6)) {
                pageNo = 1;
                getTopMaterialList();
                return;
            }
            if (rsp.results && rsp.results.length) {
                createMaterialTable($('.selectMaterial_table .table_tbody'), rsp.results);
            } else {
                var tr = `<tr>
                <td class="nowrap" colspan="6" style="text-align: center;">暂无数据</td>
            </tr>`;
                $('.selectMaterial_table .table-container .table_tbody').html(tr);
            }
            if (totalData > 5) {
                bindPagenationClick(totalData, 6, pageNo);
            } else {
                $('#pagenation').html('');
            }
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            if (layerModal != undefined) {
                layer.close(layerModal);
            }
            var tr = `<tr>
                <td class="nowrap" colspan="5" style="text-align: center;">获取物料列表失败，请刷新重试</td>
            </tr>`;
            $('.selectMaterial_table .table-container .table_tbody').html(tr);
        },
        complete: function () {
            // $('#searchMAttr_from .submit').removeClass('is-disabled');
        }
    }, this);
}

//获取物料列表
function getMaterialList(bom_material_id) {
    var urlLeft = '';
    urlLeft += "&page_no=" + pageNo1 + "&page_size=6&bom_material_id=" + bom_material_id;
    $('.selectMaterial_table .table-container .table_tbody').html('');
    AjaxClient.get({
        url: URLS['bomAdd'].bomItem + "?" + _token + urlLeft,
        data: ajaxData,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            var totalData = rsp.paging.total_records;
            if (totalData != 0 && pageNo1 > Math.ceil(totalData / 6)) {
                pageNo1 = 1;
                getMaterialList(bom_material_id);
                return;
            }
            if (rsp.results && rsp.results.length) {
                // console.log(rsp.results);
                createMaterialTable($('.selectMaterial_table .table_tbody'), rsp.results);
            } else {
                var tr = `<tr>
                <td class="nowrap" colspan="6" style="text-align: center;">暂无数据</td>
            </tr>`;
                $('.selectMaterial_table .table-container .table_tbody').html(tr);
            }
            if (totalData > 5) {
                bindPagenationClick(totalData, 6, pageNo1);
            } else {
                $('#pagenation').html('');
            }
            // console.log('success');
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            if (layerModal != undefined) {
                layer.close(layerModal);
            }
            var tr = `<tr>
                <td class="nowrap" colspan="5" style="text-align: center;">获取物料列表失败，请刷新重试</td>
            </tr>`;
            $('.selectMaterial_table .table-container .table_tbody').html(tr);
            console.log('fail');
        },
        complete: function () {
            // $('#searchMAttr_from .submit').removeClass('is-disabled');
            // console.log('finish');
        }
    }, this);
}

//给从这个页面打开的页面调用
function pagegetMaterial() {
    getMaterialList(topMaterial.material_id);
}

//获取bom分组
function getBOMGroup(val) {
    AjaxClient.get({
        url: URLS['bomGroup'].select + "?" + _token,
        dataType: 'json',
        success: function (rsp) {
            // console.log(rsp);
            if (rsp.results && rsp.results.length) {
                var lis = '', innerhtml = '';
                rsp.results.forEach(function (item) {
                    lis += `<li data-id="${item.bom_group_id}" class="el-select-dropdown-item" class=" el-select-dropdown-item">${item.name}</li>`;
                });
                innerhtml = `
                        <li data-id="" class="el-select-dropdown-item kong" class=" el-select-dropdown-item">--请选择--</li>
                        ${lis}`;
                $('.el-form-item.bom_group').find('.el-select-dropdown-list').html(innerhtml);
                if (val) {
                    $('.el-form-item.bom_group').find('.el-select-dropdown-item[data-id=' + val + ']').click();
                }
            }
        },
        fail: function (rsp) {
            console.log('获取物料清单分组失败');
        }
    }, this);
}

//获取bom树
function getBomTree(id, version) {
    AjaxClient.get({
        url: URLS['bomAdd'].bomTree + "?" + _token + '&bom_material_id=' + id + '&version=' + version + '&bom_item_qty_level=1&replace=1',
        dataType: 'json',
        success: function (rsp) {
            if (rsp.results) {
                var ids = getIds(materialData, 'material');
                var index = ids.indexOf(Number(id));
                materialData[index].children = rsp.results.children;
                if ($('.ma-tritem[data-id=' + id + ']').length) {
                    $('.ma-tritem[data-id=' + id + ']').data('matableItem').children = rsp.results.children;
                }
            }
        },
        fail: function (rsp) {
            console.log('获取bom树失败');
        }
    }, this);
}

//获取设计bom
function getDesignBom(id, flag, version) {
    AjaxClient.get({
        url: URLS['bomAdd'].bomDesign + "?" + _token + '&material_id=' + id + '&bom_no=' + bom_no,
        dataType: 'json',
        success: function (rsp) {
            if (rsp.results) {
                if (flag == 'pop') {
                    var trs = createDesignTable(rsp.results);
                    $('.materialInfo_table .t-body').html(trs);
                    if (version != 0) {
                        $('.materialInfo_table .t-body').find('.tr-bom-item[data-version=' + version + ']').click();
                    } else {
                        $('.materialInfo_table .t-body').find('.tr-bom-item:first-child').click();
                    }
                } else {
                    var trs = createMainDesignTable(rsp.results);
                    $('#addDesignBom_from .design_main_table .t-body').html(trs);
                }
            }
        },
        fail: function (rsp) {
            console.log('获取设计bom失败');
        }
    }, this);
}

//获取设计bom树
function getDesignBomTree(id, version) {
    AjaxClient.get({
        url: URLS['bomAdd'].bomTree + "?" + _token + '&bom_material_id=' + id + '&version=' + version + '&bom_item_qty_level=1&replace=1',
        dataType: 'json',
        success: function (rsp) {
            if (rsp.results) {
                createRealBom(rsp.results, function (bomHtml) {
                    $('.materialInfo_tree .bom-tree').html(bomHtml);
                }, 'noedit');
            }
        },
        fail: function (rsp) {
            console.log('获取设计bom树失败');
        }
    }, this);
}

//添加
function bomStore() {
    AjaxClient.post({
        url: URLS['bomAdd'].store,
        data: ajaxSubmitData,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            $('.submit.save').removeClass('is-disabled');
            if (window.location.pathname.split('/').indexOf('bomEdit') > -1) {//在树上直接添加
                layer.confirm('添加成功,是否将该子项组装到树上?', {
                    icon: 3, title: '提示', closeBtn: 0, offset: '250px', end: function () {
                    }
                }, function (index) {//确定按钮
                    layer.close(index);
                    if (rsp && rsp.results) {
                        var bomItemId = $('.item-name.bom-tree-item.allBOM.selected').attr('data-bom-item-id');
                        changeAssembly(bomItemId, function () {
                            publishBom(rsp.results.bom_id, 'active', 1, 'saveActive');
                            setTimeout(function () {
                                resetAllData();
                                mActionFlag = 'edit';
                                noEditFlag = 'edit';
                                procedureData = 'no-checked';
                                editData = {};
                                getBomInfo(bom_id);
                                $('.tap-btn-wrap .saveoption').css('display', 'flex');
                                $('#addBBasic_from .bom-add-new-item').css('background', '#ccc').attr('disabled', true);
                            }, 400);
                        });
                    } else {
                        console.log('没有返回bom_id');
                    }
                    // bomAct(rsp.results.bom_id,'active',1,'saveActive');
                    // bomAct(rsp.results.bom_id,'release',1,'saveRelease');
                }, function () {//取消按钮
                    if (rsp && rsp.results) {
                        publishBom(rsp.results.bom_id, 'active', 1, 'saveActive');
                        setTimeout(function () {
                            resetAllData();
                            mActionFlag = 'edit';
                            noEditFlag = 'edit';
                            procedureData = 'no-checked';
                            editData = {};
                            getBomInfo(bom_id);
                            $('.tap-btn-wrap .saveoption').css('display', 'flex');
                            $('#addBBasic_from .bom-add-new-item').css('background', '#ccc').attr('disabled', true);
                        }, 400);
                    }
                });
            } else {//通过添加接口进入的
                layer.confirm('添加成功,是否发布?', {
                    icon: 3, title: '提示', offset: '250px', end: function () {
                        setTimeout(function () {
                            window.location.href = $('#bom_edit').val() + '?id=' + rsp.results.bom_id;
                        }, 200);
                    }
                }, function (index) {
                    layer.close(index);
                    publishBom(rsp.results.bom_id, 'active', 1, 'saveActive')
                    // bomAct(rsp.results.bom_id,'active',1,'saveActive');
                    // bomAct(rsp.results.bom_id,'release',1,'saveRelease');
                });
            }
            // resetAllData();
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            if (rsp && rsp.message != undefined && rsp.message != null) {
                LayerConfig('fail', rsp.message, function () {
                    if (rsp && rsp.field !== undefined && rsp.field != "") {
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
            $('.submit.save').removeClass('is-disabled');
        }
    }, this);
}

//bom保存时激活和发布
function publishBom(bom_id, type, status, flag) {
    AjaxClient.get({
        url: URLS['bomAdd'].bomAct + "?" + _token + '&bom_id=' + bom_id + '&type=' + type + '&status=' + status + '&cookie=' + creator_token,
        dataType: 'json',
        success: function (rsp) {
            if (flag == 'saveActive') {
                publishBom(rsp.results.bom_id, 'release', 1, 'saveRelease');
            } else {
                // LayerConfig('success','发布成功');
                // if(window.location.pathname.split('/').indexOf('bomEdit')>-1){//直接在树上添加的发布
                //   LayerConfig('success','发布成功');
                // }else {
                //   console.log('发布成功');
                // }
            }
        },
        fail: function (rsp) {
            if (window.location.pathname.split('/').indexOf('bomEdit') > -1) {//直接在树上添加的发布
                if (rsp && rsp.message) {
                    LayerConfig('fail', rsp.message);
                }
            } else {
                console.log('发布失败');
            }
        }
    }, this);
}

//制造bom添加提交
function bomProductSubmit() {
    AjaxClient.post({
        url: URLS['bomProduct'].productAdd,
        data: ajaxSubmitData,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            // console.log(ajaxSubmitData);
            $('.submit.save').removeClass('is-disabled');
            // window.open($('#product_bom_view').val()+'?id='+rsp.results.manufacture_bom_id);
            var pbom_id = $('.item-name.bom-tree-item.allBOM.selected').attr('data-bom-id');
            if (bom_id == pbom_id) {//刷新页面
                window.location.reload();
            } else {//否则不跳页面，重新填充该子bom的信息
                bomDesign = '';
                bomProduct = '';
                resetAllData();
                mActionFlag = 'edit';
                noEditFlag = 'edit';
                procedureData = 'no-checked';
                $('.tap-btn-wrap .saveoption').css('display', 'flex');
                $('.tap-btn-wrap .saveoption .el-checkbox_input.editOption').removeClass('is-checked');
                $('#addBBasic_from .bom-add-new-item').css('background', '#ccc').attr('disabled', true);
                getItemBomInfo(pbom_id);
            }
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            if (rsp && rsp.message != undefined && rsp.message != null) {
                LayerConfig('fail', rsp.message, function () {
                    if (rsp && rsp.field !== undefined && rsp.field != "") {
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
            $('.submit.save').removeClass('is-disabled');
        }
    }, this)
}

//编辑
function bomEdit() {
   
    if(ajaxSubmitData.workcenters == undefined) {
        ajaxSubmitData.workcenters = [];
    }
  
   if(ajaxSubmitData.current_routing_info && ajaxSubmitData.current_routing_info.routing_info) {
    var tempSubmitData = ajaxSubmitData.current_routing_info.routing_info;
    if(typeof tempSubmitData == 'string') {
        tempSubmitData = JSON.parse(tempSubmitData);
       
        if(tempSubmitData.length) {
            tempSubmitData.forEach(function(item, index) {
                if(item.material_info.length) {
                    item.material_info.forEach(function(itemChild, index) {
                        if(itemChild.type == '2') {
                            itemChild.POSNR = '';
                        }
                    });
                }
            });
            tempSubmitData =JSON.stringify(tempSubmitData);
            ajaxSubmitData.current_routing_info.routing_info = tempSubmitData;
        }
    }
   }
    
   
    AjaxClient.post({
        url: URLS['bomAdd'].update,
        data: ajaxSubmitData,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            $('.submit.save').removeClass('is-disabled');
            if ($('.saveoption').find('.el-checkbox_input').hasClass('is-checked')) {
                //升级成功后怎么处理比较好
                LayerConfig('success', '升级成功', function () {
                    //如果顶级bom的id和ajaxsubmitData的id相同则跳到升级后的版本页面
                    if (bom_id == ajaxSubmitData.bom_id) {
                        window.location.href = $('#bom_edit').val() + '?id=' + rsp.results.bom_id + '&is_design=1';
                    } else {//否则不跳页面，重新填充该子bom的信息
                        var nbom_id = ajaxSubmitData.bom_id;
                        bomDesign = '';
                        bomProduct = '';
                        resetAllData();
                        mActionFlag = 'edit';
                        noEditFlag = 'edit';
                        procedureData = 'no-checked';
                        $('.tap-btn-wrap .saveoption').css('display', 'flex');
                        $('.tap-btn-wrap .saveoption .el-checkbox_input.editOption').removeClass('is-checked');
                        $('#addBBasic_from .bom-add-new-item').css('background', '#ccc').attr('disabled', true);
                        getItemBomInfo(nbom_id);
                    }
                });
            } else {
                // 编辑成功不改变树结构，可不操作
                LayerConfig('success', '编辑成功',function(){
                    if (bom_id == ajaxSubmitData.bom_id) {
                        window.location.href = $('#bom_edit').val() + '?id=' + rsp.results.bom_id + '&is_design=1';
                    }
                });
            }
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            if (rsp && rsp.message != undefined && rsp.message != null) {
                LayerConfig('fail', rsp.message, function () {
                    if (rsp && rsp.field !== undefined && rsp.field != "") {
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
            $('.submit.save').removeClass('is-disabled');
        }
    }, this);
}

//发布，激活，冻结
function bomAct(bomid, type, status, flag) {
    
    AjaxClient.get({
        url: URLS['bomAdd'].bomAct + "?" + _token + '&bom_id=' + bomid + '&type=' + type + '&status=' + status + '&cookie=' + creator_token,
        dataType: 'json',
        success: function (rsp) {
            if (flag == 'saveActive' && type == 'active') {
                // LayerConfig('success','发布成功');
                // bomAct(rsp.results.bom_id,'release',1,'saveRelease');
            } else {
                if (rsp.results) {
                    
                    if (type == 'release') {
                        if (bomDesign != '') {
                            LayerConfig('success', '发布成功');
                            window.opener.pagegetMaterial();
                        } else if (bomid != bom_id) {//bom子项，直接刷新页面，子项的bomId已改变
                            // window.location.href = '/BomManagement/bomEdit?id=' + bomid;
                            // window.location.reload();
                            // return false;
                            $('.item-name.bom-tree-item.allBOM.sonBom.selected').attr('data-bom-id', bomid);
                            var nbom_id = bomid;
                            bomDesign = '';
                            bomProduct = '';
                            resetAllData();
                            mActionFlag = 'edit';
                            noEditFlag = 'edit';
                            procedureData = 'no-checked';
                            $('.tap-btn-wrap .saveoption').css('display', 'flex');
                            $('.tap-btn-wrap .saveoption .el-checkbox_input.editOption').removeClass('is-checked');
                            $('#addBBasic_from .bom-add-new-item').css('background', '#ccc').attr('disabled', true);
                            getItemBomInfo(nbom_id);
                            return false;
                        } 
                    } else {
                        if (status == 1) {
                            LayerConfig('success', '激活成功');
                            $('.status-btn.activate').addClass('none');
                            $('.status-btn.freeze').removeClass('none');
                            if (bomDesign != '') {
                                window.opener.pagegetMaterial();
                            }
                        } else {
                            LayerConfig('success', '冻结成功');
                            $('.status-btn.activate').removeClass('none');
                            $('.status-btn.freeze').addClass('none');
                        }
                    }
                    getDesignBom($('#addDesignBom_from .tr-bom-item[data-bom-id=' + bomid + ']').attr('data-id'), 'nopop');
                }
            }
        },
        fail: function (rsp) {
            if (rsp && rsp.message) {
                LayerConfig('fail', rsp.message);
            }
            console.log('bom操作失败');
        }
    }, this);
}

//检测唯一性
function getUnique(field, value, fn) {
    var urlLeft = '';
    if (mActionFlag == 'add') {
        urlLeft = `&field=${field}&value=${value}`;
    } else if (mActionFlag == 'edit' && bom_id != '') {
        urlLeft = `&field=${field}&value=${value}&id=` + bom_id;
    }
    var xhr = AjaxClient.get({
        url: URLS['bomAdd'].unique + "?" + _token + urlLeft,
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
// 时间戳转换成指定格式日期
// dateFormat(11111111111111, 'Y年m月d日 H时i分s秒')
function dateFormat (timestamp, formats) {
    // formats格式包括
    // 1. Y-m-d
    // 2. Y-m-d H:i:s
    // 3. Y年m月d日
    // 4. Y年m月d日 H时i分
    formats = formats || 'Y-m-d H:i:s';

    var zero = function (value) {
        if (value < 10) {
            return '0' + value;
        }
        return value;
    };

    var myDate = timestamp? new Date(timestamp*1000): new Date();

    var year = myDate.getFullYear();
    var month = zero(myDate.getMonth() + 1);
    var day = zero(myDate.getDate());

    var hour = zero(myDate.getHours());
    var minite = zero(myDate.getMinutes());
    var second = zero(myDate.getSeconds());

    return formats.replace(/Y|m|d|H|i|s/ig, function (matches) {
        return ({
            Y: year,
            m: month,
            d: day,
            H: hour,
            i: minite,
            s: second
        })[matches];
    });
};

//填充bom数据
function setBomData(data) {
    // var limitTime = dateFormat(data.DATUV);
    var bomFrom = '';
    if(data.from == 1){
        bomFrom = 'MES';
    }else if(data.from == 2){
        bomFrom = 'ERP';
    }else if(data.from == 3){
        bomFrom = 'SAP';
    }
    // console.log(limitTime);
    // if(data.is_ecm == 0){
    //     $('.el-checkbox_input.editOption.upgrade').css('pointer-events','auto');
    // }else{
    //     $('#ecm_warning').css('display','inline-block');
    //     $('.el-checkbox_input.editOption.upgrade').css('pointer-events','none');
    // }
    var objStr = JSON.stringify(data.bom_tree);
    bomShowData = JSON.parse(objStr);
    topMaterial = JSON.parse(objStr);
    data.status == 1 ? $('.status-btn.freeze').removeClass('none') : $('.status-btn.activate').removeClass('none');
    //填充基础数据
    var basicForm = $('#addBBasic_from');
    basicForm.find('#code').val(data.code).attr('readonly', 'readonly');
    basicForm.find('#unit').val(data.unit);
    basicForm.find('#bom_no').val(data.bom_no).attr('readonly','readonly');
    // basicForm.find('#update_no').val(data.AENNR);
    basicForm.find('#bom_unit').val(data.BMEIN);
    basicForm.find('#bom_from').val(bomFrom).attr('readonly','readonly');
    // basicForm.find('#validity').val(limitTime);
    basicForm.find('#use').val(data.STLAN);
    basicForm.find('#BOM_desc').val(data.bom_sap_desc);
    basicForm.find('#name').val(data.name);
    basicForm.find('#loss_rate').val(data.loss_rate);
    basicForm.find('#qty').val(data.qty);
    basicForm.find('#label').val(data.label);
    basicForm.find('#description').val(data.description);
    basicForm.find('#bom_unit_id').val(data.bom_unit_id);
    basicForm.find('#SAP_desc').val(data.bom_sap_desc);
    basicForm.find('#material_id').val(data.bom_tree.name).data('topMaterial', topMaterial).attr('readonly', 'readonly').siblings('label').addClass('mater-active').siblings('.choose-material').hide();
    // basicForm.find('.bom-add-new-item').removeClass('is-disabled');
    basicForm.find('.el-form-item.version').show();
    basicForm.find('#version').val(data.version);
    basicForm.find('#version_description').val(data.version_description);
    if(mActionFlag=='edit'){
        $("#factory_toggle").show();
        basicForm.find('#factory').html('');
        data.factory_list.forEach(function (item) {
            var factory = `<span style="display: inline-block;font-size: 12px;border-radius: 2px;background-color: rgba(32, 160, 255, 0.51);color: #fff;margin-left: 5px;padding: 0 5px;margin-bottom: 5px;" >${item.name}</span>`;
            basicForm.find('#factory').append(factory);
        });
    }



    //添加项
    materialData = [], bomOperation = [];
    if (data.bom_tree.children && data.bom_tree.children.length) {
        data.bom_tree.children.forEach(function (item) {
            item.itemAddFlag = 1;
            materialData.push(item);
            bomOperation.push(item);
            if (item.replaces && item.replaces.length) {//替代物料
                item.replaces.forEach(function (reitem) {
                    reitem.itemAddFlag = 2;
                    reitem.replaceItemId = item.material_id;
                    materialData.push(reitem);
                    bomOperation.push(reitem);
                });
            }
        })
    }
    createMaterialItem(materialData);
    actParentTree(bomShowData);
    //附件
    var preurls = [], predata = [];
    if (data.attachments && data.attachments.length) {
        data.attachments.forEach(function (item) {
            var url = window.storage + item.path, preview = '';
            var path = item.path.split('/');
            var name = item.filename;
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
                // url: URLS['bomList'].list + '?page_no=1&page_size=5'
            };
            preurls.push(preview);
            predata.push(pitem);
        });
    }
    attchfileinit('attachment', preurls, predata);
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
                    var attachment_dowload = $('#addBFujian_from').find('tr[attachment_id=' + item.attachment_id + ']').eq(0);
                    // console.log(item.is_from_erp);
                    if (item.is_from_erp == 0) {
                        var a = `<a href="${window.storage + item.path}" class="attch-download" download="${item.filename}"><i class='fa fa-download' style="margin-left: 10px;font-size: 20px;"></i></a>`;
                        if (!attachment_dowload.find('.attch-download').length) {
                            attachment_dowload.find('.file-footer-buttons').append(a);
                        }
                    } else if (item.is_from_erp == 1) {
                        var a = `<a href="${item.path}" class="attch-download" download="${item.filename}"><i class='fa fa-download' style="margin-left: 10px;font-size: 20px;"></i></a>`;
                        if (!attachment_dowload.find('.attch-download').length) {
                            attachment_dowload.find('.file-footer-buttons').append(a);
                        }
                    }


                });
            }
        }
    }, 1000);
    $('.tap-btn-wrap .el-tap[data-item=addRoute_form]').removeClass('none');
    //设计bom
    $('.tap-btn-wrap .el-tap[data-item=addDesignBom_from]').removeClass('none');
    getDesignBom(data.material_id, 'nopop');
    if (bomDesign != '') {
        setTimeout(function () {
            $('.tap-btn-wrap .el-tap[data-item=addDesignBom_from]').click();
        }, 50);
    }
    //制造bom
    $('.tap-btn-wrap .el-tap[data-item=addMakeBom_from]').removeClass('none');
    getProductBom(data.material_id);
    productId = data.material_id;
    if (bomProduct != '') {
        setTimeout(function () {
            $('.tap-btn-wrap .el-tap[data-item=addMakeBom_from]').click();
        }, 50);
    }
}

//填充物料数据
function setMaterialData(data) {
    // console.log(data);
    // console.log(data);
    topMaterial = $.extend({}, data);
    setTopMa();
    //将其他按钮隐藏，回到添加状态
    $('.tap-btn-wrap .el-tap[data-item=addRoute_form]').addClass('none');
    $('.tap-btn-wrap .el-tap[data-item=addDesignBom_from]').addClass('none');
    $('.tap-btn-wrap .el-tap[data-item=addMakeBom_from]').addClass('none');
    $('#showLog').hide();
    noEditFlag = '';
    mActionFlag = 'add';
    $('.tap-btn-wrap .saveoption').hide();
    $('.status-btn').addClass('none');
    // $('#addBBasic_from .bom-add-new-item').css('background-color', '#20a0ff').attr('disabled', false);

    // 物料附件列表展示（缩略图、名称和文件大小）
    var preurls = [], predata = [];
    if (data.attachment&&data.attachment.length){
        data.attachment.forEach(function (item) {
            var url = window.storage + item.path, preview = '';
            var path = item.path.split('/');
            var name = item.filename;
            if (item.path.indexOf('jpg') > -1 || item.path.indexOf('png') > -1 || item.path.indexOf('jpeg') > -1) {
                preview = `<img width="60" height="60" src="${url}" data-creator="${item.creator_name || ''}" data-ctime="${item.ctime}" data-url="${item.path}" comment="${item.comment}" attachment_id="${item.attachment_id}" class='file-preview-image existAttch'>`;
            } else {
                preview = `<div class='file-preview-text existAttch' data-creator="${item.creator_name || ''}" data-ctime="${item.ctime}" data-url="${item.path}" comment="${item.comment}" attachment_id="${item.attachment_id}">
                      <h3 style="font-size: 50px;"><i class='el-icon el-icon-file'></i></h3>
                      </div>`;
            }
            var pitem = {
                caption: name,
                size: item.size
            };
            preurls.push(preview);
            predata.push(pitem);
        });
    }
    // 调用物料附件上传的功能插件
    attchfileinit('attachment', preurls, predata);
    // 物料附件其他的信息展示（创建人及时间以及下载附件功能）
    setTimeout(function () {
        if ($('.existAttch').length) {
            $('.existAttch').each(function () {
                var pele = $(this).parents('.file-preview-frame');
                pele.attr({
                    'data-url': $(this).attr('data-url'),
                    'attachment_id': $(this).attr('attachment_id')
                });
                var cname = $(this).attr('data-creator'),
                    ctime = $(this).attr('data-ctime'),
                    cbtn = pele.find('.file-actions button');
                // console.log(cbtn);
                pele.find('.fujiantext').text($(this).attr('comment'));
                pele.find('.creator').html(`<p>${cname}</p><p>${ctime}</p>`);
                pele.addClass('init-success-file');
                cbtn.css('display','none');
            });
            // 物料附件下载
            if (data.attachment && data.attachment.length) {
                data.attachment.forEach(function (item) {
                    var attachment_dowload = $('#addBFujian_from').find('tr[attachment_id=' + item.attachment_id + ']').eq(0);
                    // console.log(item.is_from_erp);
                    if (item.is_from_erp == 0) {
                        var a = `<a href="${window.storage + item.path}" class="attch-download" download="${item.filename}"><i class='fa fa-download' style="margin-left: 10px;font-size: 20px;"></i></a>`;
                        if (!attachment_dowload.find('.attch-download').length) {
                            attachment_dowload.find('.file-footer-buttons').append(a);
                        }
                    } else if (item.is_from_erp == 1) {
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

//顶层物料选择后填充相应值
function setTopMa() {
    $('#material_id').val(topMaterial.name).attr('data-id', topMaterial.material_id).data('topMaterial', topMaterial);
    $('#addBBasic_from #code').val(topMaterial.item_no);
    $('#addBBasic_from #name').val(topMaterial.name);
    $('#addBBasic_from #unit').val(topMaterial.unit);

    getProcedureSource(topMaterial.item_no);
    $('.choose-operation').removeClass('none');
    // $('.bom-button.bom-add-new-item').removeClass('is-disabled');
    $('.el-form-item-label.show-material').addClass('mater-active');
    $('#material_id').parents('.el-form-item').find('.errorMessage').removeClass('active').html('');
    // remoteValidatorToolbox['remoteMaterial']('material_id');

    if ($('#material_id').val() != '') {
        $('.saveBtn .submit.save').attr('disabled', false)
    }
}

//获取制造bom数据
function getProductBom(id) {
    var urlLeft = "&page_no=" + productPageNo + "&page_size=" + productPageSize + "&material_id=" + id + "&sort=id&order=asc";
    AjaxClient.get({
        url: URLS['bomProduct'].productList + '?' + _token + urlLeft,
        dataType: 'json',
        success: function (rsp) {

            var pageTotal = rsp.paging.total_records;

            if (pageTotal > productPageSize) {
                bindProductPagenationClick(pageTotal, productPageSize);
            } else {
                $('#producePagenation').html('');
            }

            if (rsp.results) {
                var tr = showProductTable(rsp.results);
                $('#addMakeBom_from .t-body').html(tr);
            }
        },
        fail: function (rsp) {

        }
    }, this)
}

function bindProductPagenationClick(total, size) {
    $('.pagenation_wrap').show();
    $('#producePagenation').pagination({
        totalData: total,
        showData: size,
        current: productPageNo,
        isHide: true,
        coping: true,
        homePage: '首页',
        endPage: '末页',
        prevContent: '上页',
        nextContent: '下页',
        jump: true,
        callback: function (api) {
            productPageNo = api.getCurrent();
            getProductBom(productId);
        }
    });
}

//显示制造bom列表
function showProductTable(data) {
    var trs = [];
    if (data.length) {
        data.forEach(function (item, index) {
            var tr = `
               <tr>
                    <td>${item.code}</td>
                    <td>${item.name}</td>
                    <td>${item.version}</td>
                    <td>${item.version_description}</td>
                    <td><button type="button" class="bom-info-button productLog" data-id="${item.product_bom_id}">详情</button></td>
                    <td>
                        <button type="button" data-id="${item.product_bom_id}" class="bom-info-button view">查看</button>
                        <button type="button" data-id="${item.product_bom_id}" class="bom-info-button bom-info-del">删除</button>
                    </td>
                </tr>`;
            trs.push(tr);
            var obj = {
                key: item.product_bom_id,
                value: item.differences
            }
            productDifference.push(obj)

        });

    } else {
        var tr = `
               <tr>
                    <td colspan="6">暂无数据</td> 
                </tr>`;
        trs.push(tr);
    }

    return trs;
}

//删除制造bom
function deleteProductBom(id) {
    AjaxClient.get({
        url: URLS['bomProduct'].productDelete + '?' + _token + '&manufacture_bom_id=' + id + '&cookie=' + creator_token,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            getProductBom(productId);
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            if (rsp && rsp.message != undefined && rsp.message != null) {
                LayerConfig('fail', rsp.message);
            }
            if (rsp && rsp.code == 404) {
                getProductBom(productId);
            }
        }
    }, this);
}

//组装bom子项
function changeAssembly(id, fn) {
    AjaxClient.get({
        url: URLS['bomAdd'].changeAssembly + '?' + _token + '&bom_item_id=' + id,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            fn && typeof fn == 'function' ? fn() : null;
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            console.log('在树上组装该子项失败');
        }
    }, this);
}

function getnodeIncome() {
    var nodes = [], materialIds = [];
    actRoutes(nodes);
    nodes.forEach(function (nitem) {
        if (nitem.material_info && nitem.material_info.length) {
            nitem.material_info.forEach(function (nmitem) {
                if (nmitem.type == 1 && materialIds.indexOf(nmitem.material_id) == -1) {
                    materialIds.push(nmitem.material_id);
                }
            });
        }
    });

    $('.route-tbody tr.step-tr').each(function (index, tritrm) {
        if ($(tritrm).find('tr.income').length) {
            $(tritrm).find('tr.income').each(function (index, initem) {
                var mid = Number($(initem).attr('data-id'));
                if (materialIds.indexOf(mid) == -1) {
                    materialIds.push(mid);
                }
            });
        }
    });
    // console.log(materialIds);
    return materialIds;
}

//获取进料(√)
function getIncome(bom) {
    AjaxClient.get({
        url: URLS['bomAdd'].income + '?' + _token + '&bom_id=' + bom.bom_id + '&routing_id=' + $('#route_id').val(),
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            if (rsp && rsp.results && rsp.results.length) {
                var maIds = getnodeIncome();
                $('#material-route').find('.income-tbody').html('');
                rsp.results.forEach(function (bitem) {
                    var colorspan = '';
                    if (maIds.indexOf(bitem.material_id) > -1) {
                        colorspan = 'color';
                    }
                    var attrvalus = '';
                    if (bitem.attributes && bitem.attributes.length) {
                        bitem.attributes.forEach(function (aitem) {
                            attrvalus += `<tr><td>${aitem.name}</td><td style="word-break: break-all;">${aitem.value}${aitem.commercial == 'null' ? '' : [aitem.commercial]}</td></tr>`;
                        });
                    }
                    var attchs = '';
                    if (bitem.attachment && bitem.attachment.length) {
                        bitem.attachment.forEach(function (citem) {
                            attchs += `<p><a class="attchlink" href="/storage/${citem.path}" download="${citem.name}">${citem.name}</a></p>`;
                        });
                    }
                    // console.log(attchs);
                    var _bhtml = `<tr class="income-tr" data-id="${bitem.material_id}">
                        <td>
                            <span class="el-checkbox_input bom_check">
                                <span class="el-checkbox-outset"></span>
                            </span>
                        </td>
                        <td><span class="income-name ${colorspan}">${bitem.name}</span></td>
                        <td>${bitem.item_no}</td>
                        <td>${bitem.POSNR}</td>
                        <td><div class="pre_attr"><table><tbody>${attrvalus}</tbody></table></div></td>
                        <td>${attchs}</td>
                        <td>${bitem.is_lzp?`<button data-id="${bitem.material_id}" class="el-button el-button--primary delete-material">删除</button>`:'--'}</td>
                    </tr>`;
                    $('#material-route').find('.income-tbody').append(_bhtml);
                    $('#material-route').find('.income-tbody tr:last-child').data('bitem', bitem);
                });
                
            }
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            console.log('获取进料失败');
        }
    }, this);
}

// 存在字段is_lzp 可删除物料
$('body').on('click','.delete-material',function(){
    var bom_id = $('.item-name.bom-tree-item.allBOM.selected').attr('data-bom-id');
    var routing_id = $('#route_id').val();
    var material_id = $(this).attr('data-id');
    
    AjaxClient.get({
        url: URLS['bomAdd'].deleteEnterMaterialLzp+ "?" + _token + '&bom_id=' + bom_id + '&routing_id='+routing_id+ '&material_id='+material_id,
        dataType: 'json',
        success: function (rsp) {
            var msg = rsp.message;
            layer.open({
                title:'删除成功',
                content:msg,
                yes: function(index, layero){
                    //do something
                    layer.close(index); //如果设定了yes回调，需进行手工关闭
                    getIncome(bomShowData);
                }
            });
            
        },
        fail: function (rsp) {
            var msg = rsp.message;
            layer.open({
                title:'删除失败',
                content:msg
            });
        }
    }, this);
})

//获取工艺路线列表异步
function getProcedure(fn) {
    AjaxClient.get({
        url: URLS['bomGroup'].procedureGroup + '?' + _token + '&material_code=' + material_code + '&bom_no=' + bom_no,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            // console.log(rsp);
            factorys = rsp && rsp.results || [];
            var factoryLis = '<li data-id="" class="el-select-dropdown-item kong">--请选择--</li>';
            // console.log(factorys);
            if(factorys){
               
                factorys.forEach(function(item){
                    var factoryMsg=JSON.stringify(item.groups);
                    factoryLis += `<li data-json='${factoryMsg}' data-id="${item.factory_id}"  class="el-select-dropdown-item show_description" data-desc="${item.factory_name}" >${item.factory_name}</li>`
                })
            }
            // console.log(factoryLis);
            $('.el-form-item.route-line .el-select-dropdown-list-factory').html(factoryLis);
            $('body').on('click','.el-select-dropdown-list-factory .el-select-dropdown-item',function(e){
                e.stopPropagation();
                if(!$(this).attr('data-json')==''){
                    var groupMsg = JSON.parse($(this).attr('data-json'));
                    var factoryId = $(this).attr('data-id');
                    routeLine = groupMsg || [];
                    var lis = '<li data-id="" class="el-select-dropdown-item kong">--请选择--</li>';
                    if (routeLine) {
                        routeLine.forEach(function (item) {
                            var groupArray=JSON.stringify(item.procedure_route);
                            var factoryArray=JSON.stringify(item.factory);
                            lis += `<li data-json='${groupArray}'  data-id="${item.group_id}" data-factoryId="${factoryId}" class="el-select-dropdown-item show_description" data-desc="${item.group_name}">${item.group_name}</li>`;
                        });
                    }
                    $('.el-form-item.route-line .el-select-dropdown-list-group').html(lis);
                }else{
                    $('.el-form-item.route-line .el-select-dropdown-list-route').html('<li data-id="" class="el-select-dropdown-item kong">--请选择--</li>');
                }
                $('.el-form-item.route-line .el-select-dropdown-list-group li:first-child').click();
            })

            $('body').on('click','.el-select-dropdown-list-group .el-select-dropdown-item',function(e){
                e.stopPropagation();
                if(!$(this).attr('data-json')==''){
                    var routeMsg=JSON.parse($(this).attr('data-json'));
                    var groupId=$(this).attr('data-id');
                    var factoryID=$(this).attr('data-factoryId');
                    // console.log(routeMsg);
                    var routeLis = '<li data-id="" class="el-select-dropdown-item kong">--请选择--</li>';

                    if(selectedRouteList.length) {
                        
                        routeMsg.forEach(function(val,i){
                            var state = false;
                            selectedRouteList.forEach(function(item) {
                                if(String(item.factory_id) !== String(factoryID) && item.routing_id == val.id) {
                                    state = true;
                                } 
                            });
                            if(state) {
                                routeLis += `<li data-id="${val.id}" data-groupId="${groupId}" data-factoryID="${factoryID}" class="el-select-dropdown-item show_description selected-route-list" data-desc="${val.name}">${val.name}</li>`;
                            } else {
                                routeLis += `<li data-id="${val.id}" data-groupId="${groupId}" data-factoryID="${factoryID}" class="el-select-dropdown-item show_description" data-desc="${val.name}">${val.name}</li>`;
                            }
                        });
                        
                    } else {
                        routeMsg.forEach(function(val,i){
                            routeLis += `<li data-id="${val.id}" data-groupId="${groupId}" data-factoryID="${factoryID}" class="el-select-dropdown-item show_description" data-desc="${val.name}">${val.name}</li>`;
                        })
                    }
                   
                    $('.el-form-item.route-line .el-select-dropdown-list-route').html(routeLis);
                }else{
                    $('.el-form-item.route-line .el-select-dropdown-list-route').html('<li data-id="" class="el-select-dropdown-item kong">--请选择--</li>');
                }
                $('.el-form-item.route-line .el-select-dropdown-list-route li:first-child').click();
            })

            fn && typeof fn == 'function' ? fn() : null;
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            console.log('获取工艺路线列表失败');
        }
    }, this);
}
//获取工艺路线组列表
// function getProcedureGroup(){
//     AjaxClient.get({
//         url: URLS['bomGroup'].procedureGroup + '?' + _token,
//         dataType: 'json',
//         beforeSend: function () {
//             layerLoading = LayerConfig('load');
//         },
//         success: function (rsp) {
//             layer.close(layerLoading);
//             console.log(rsp);
//             routeLine = rsp && rsp.results || [];
//             var lis = '<li data-id="" class="el-select-dropdown-item kong">--请选择--</li>';
//             if (routeLine) {
//                 routeLine.forEach(function (item) {
//                     lis += `<li class="el-select-dropdown-item">${item.name}</li>`;
//                 });
//             }
//             $('.el-form-item.route-line .el-select-dropdown-list-group').html(lis);
//         },
//         fail: function (rsp) {
//             layer.close(layerLoading);
//             console.log('获取工艺路线组列表失败');
//         }
//     }, this);
//
// }

//获取工艺路线详情
function getProcedureShow(routeid) {
    $('.route_pic-wrap .make_list_all').html('<p style="padding-left: 10px;">暂无数据</p>');
    $('.make_list_line_all').html('');
    AjaxClient.get({
        url: URLS['bomAdd'].procedureShow + '?' + _token + '&id=' + routeid,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
           
            layer.close(layerLoading);
            bomItemArr = [];
            if (rsp && rsp.results && rsp.results.operations && rsp.results.orderlist) {
                var ritem = '',
                    rdata = {
                        routing_graph: {
                            nodes: [],
                            edges: []
                        }
                    };
                rsp.results.operations.forEach(function (item, index) {
                    var op = {}, mode = '';
                    switch (item.type) {
                        case '0':
                            mode = 'MODE_REQUIRED';
                            break;
                        case '1':
                            mode = 'MODE_SKIPPABLE';
                            break;
                        case '2':
                            mode = 'MODE_SELECTABLE';
                            break;
                        case '3':
                            mode = 'MODE_SKIPPABLE_SELECTABLE';
                            break;
                    }
                    console.log(item, 'item')
                    console.log(index, 'index')
                    if (index == 0) {
                        op = {
                            operation: '<none>',
                            label: 'root',
                            mode: "MODE_REQUIRED"
                        };
                    } else {
                        op = {
                            operation: item.name,
                            operation_id: item.operation_id,
                            operation_code: item.operation_code,
                            routeid: item.routeid,
                            oid: item.oid,
                            label: item.order - 1,
                            mode: mode
                        };
                        var arr = createNodeInfo(item.oid);
                        console.log(arr, 'arr===');
                        if (arr.length) {
                            op.ipractice_id = arr[0].practice_id;
                            op.iroutes = arr;
                        }
                    }
                    
                    rdata.routing_graph.nodes.push(op);
                });
                rdata.routing_graph.edges = rsp.results.orderlist;
                // rdata.routing_graph.edges.unshift([0,1]);
                $('#routing_graph_new').html('');
                console.log(rdata.routing_graph, 'rdata.routing_graph===');
                newroutingGraph = new RoutingGraph('routing_graph_new', rdata.routing_graph, 700, 338);
                newroutingGraph.calcPositions();
                newroutingGraph.draw();
            }
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            console.log('获取工艺路线详情失败');
        }
    }, this);
}

function createStpe(step, index, ele, flag) {
    // if (flag == 'update'){
        var opworkcenters = workCenters;
    // }else{
    //     var opworkcenters = step.workcenters;
    // }
    
    var abs = '', abwrap = '无',workcenters='',workcenterswrap='无';
    var stepsid=step.field_id;
   
    var tempCenterId = '';
    if(step.workcenters) {
        tempCenterId = step.workcenters[0];
    } 
    
    if (opabs.length) {
        opabs.forEach(function (abitem) {
            // if(abitem.workcenters!=[]){
            //     abitem.workcenters.forEach(function(witem){
            //         workcenter_name+=`<li data-wcid="${witem.workcenter_id}" data-wcname="${witem.workcenter_name}">${witem.workcenter_name}</li>`
            //     })
            // }
            abs += `<li data-id="${abitem.id}" data-name="${abitem.ability_name}" class="el-select-dropdown-item route-ability-item" style="height:auto;">
                       <span class="el-checkbox_input route-ab-check" data-checkid="${abitem.id}" data-checkname="${abitem.ability_name}">
                         <span class="el-checkbox-outset"></span>
                         <span class="el-checkbox__label show_description" data-desc="${abitem.ability_description}">${abitem.ability_name}</span>  
                       </span>
                    </li>`;
        });
        abwrap = `<div class="el-form-item ma-ability_wrap">
                            <p class="abs-name"></p>
                            <div class="el-form-item-div">
                                <div class="el-select-dropdown-wrap">
                                    <div class="el-select">
                                        <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                        <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                                        <input type="hidden" class="val_id" value="">                                   
                                    </div>
                                    <div class="el-select-dropdown ability" style="display: none;width: auto;">
                                        <ul class="el-select-dropdown-list">
                                            <li data-id="" class="el-select-dropdown-item kong route-ability-item" data-name="--请选择--">--请选择--</li>
                                            ${abs}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>`;
    }

    if (opworkcenters[stepsid]) {
        // if (flag == 'update'){
        //     if(opworkcenters[stepsid]){
                $.each(opworkcenters[stepsid],function (wcindex,wcitem) {
                    // console.log(wcitem);
                    workcenters += `<li data-id="${wcitem.workcenter_id}" data-name="${wcitem.name}" class="el-select-dropdown-item route-workcenter-item" style="height:auto;">
                       <span class="el-checkbox_input route-ab-check" data-checkid="${wcitem.workcenter_id}" data-checkname="${wcitem.name}" data-checkcode="${wcitem.code}">
                         <span class="el-checkbox-outset"></span>
                         <span class="el-checkbox__label show_description" data-desc="${wcitem.desc}">${wcitem.name}</span>  
                       </span>
                    </li>`;
                });
            // }
        // }else{
        //
        //     opworkcenters.forEach(function (wcitem,wcindex) {
        //         workcenters += `<li data-id="${wcitem.workcenter_id}" data-name="${wcitem.name}" class="el-select-dropdown-item route-workcenter-item" style="height:auto;">
        //                <span class="el-checkbox_input route-ab-check" data-checkid="${wcitem.workcenter_id}" data-checkname="${wcitem.name}" data-checkcode="${wcitem.code}">
        //                  <span class="el-checkbox-outset"></span>
        //                  <span class="el-checkbox__label show_description" data-desc="${wcitem.desc}">${wcitem.name}</span>
        //                </span>
        //             </li>`;
        //
        //     });
        // }

        workcenterswrap = `<div class="el-form-item ma-workcenters_wrap">
                            <p class="workcenters-name"></p>
                            <div class="el-form-item-div">
                                <div class="el-select-dropdown-wrap">
                                    <div class="el-select">
                                        <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                        <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                                        <input type="hidden" class="val_id" value="">                                
                                    </div>
                                    <div class="el-select-dropdown workcenters" style="display: none;width: auto;">
                                        <ul class="el-select-dropdown-list">
                                            <li data-id="" class="el-select-dropdown-item kong route-workcenter-item" data-name="--请选择--">--请选择--</li>
                                            ${workcenters}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>`;
    }

    var msg=step.practice_step_order_id?step.practice_step_order_id:step.pfid;
    // console.log(step.practice_step_order_id,step.pfid);
    var workhours=JSON.stringify(step.workHours)?JSON.stringify(step.workHours):'[]';
    // console.log(workhours);
    var steps = `<tr data-name="${step.name}" data-pfid="${msg|| 0}" data-cate-id="${step.material_category_id}" data-code="${step.code}" data-step-id="${step.field_id}_${index + 1}" class="step-tr" data-index="${index + 1}" data-field-id="${step.field_id}" data-workhours='${workhours}' data-field-desc='${step.field_description}'>
                <td class="index-column">${index + 1}</td>
                <td>
                  <p>${step.name}</p>
                  <p>(${step.code})</p>
                  <p>${step.field_description}</p>
                  <p class="check-group">
                      <span class="el-checkbox_input s-e-check start" data-step-id="${step.field_id}_${index + 1}">
                         <span class="el-checkbox-outset"></span>
                         <span class="el-checkbox__label">开始</span>
                      </span>
                      <span class="el-checkbox_input s-e-check end" data-step-id="${step.field_id}_${index + 1}">
                         <span class="el-checkbox-outset"></span>
                         <span class="el-checkbox__label">结束</span>
                      </span>
                  </p>
                  <p class="step-act">
                     <span class="new_step">新增</span>
                     <span class="delete_step">删除</span>
                  </p>
                </td>
                <td>${abwrap}</td>
                <td>${workcenterswrap}</td>
                <td class="step-device" data-device-id="${step.device_id}" data-workcenter-id="${tempCenterId}"></td>
                <td>
                  <div class="mode-wrap">
                      <span class="el-checkbox_input mode-check">
                         <span class="el-checkbox-outset"></span>
                         <span class="el-checkbox__label">一进料一流转品</span>
                      </span>
                      <span class="el-checkbox_input mode-check">
                         <span class="el-checkbox-outset"></span>
                         <span class="el-checkbox__label">一进料多流转品</span>
                      </span>
                      <span class="el-checkbox_input mode-check">
                         <span class="el-checkbox-outset"></span>
                         <span class="el-checkbox__label">多进料一流转品</span>
                      </span>
                      <span class="el-checkbox_input mode-check">
                         <span class="el-checkbox-outset"></span>
                         <span class="el-checkbox__label">多进料多流转品</span>
                      </span>
                  </div>
                </td>
                <td>
                    <div class="route_item">
                        <div class="select_route">
                            <table class="sticky uniquetable commontable">
                                <thead>
                                <tr>
                                    <th>物料</th>
                                    <th>数量</th>
                                    <th>类型</th>
                                    <th>描述</th>
                                    <th style="text-align: right;">操作</th>
                                </tr>
                                </thead>
                                <tbody>
                                </tbody>
                            </table>
                        </div>
                        <div class="bottom">
                            <span class="ma_item_add">添加进料</span>
                        </div>
                    </div>
                </td>
                <td><div class="img-wrap"></div><div class="img-add"><span class="ma_item_img_add">编辑图纸</span></div></td>
                <td style="width: 93px;"><div class="basic-text" style="word-break: break-all">${step.description || ''}</div></td>
                <td><textarea class="el-textarea ma-textarea auto-textarea"></textarea></td>
                <td><div class="attch-wrap"></div><div class="attch-add"><span class="ma_item_attch_add">上传附件</span></div></td>
            </tr>`;

    ele.append(steps);
    step.index = index + 1;
    step.unique_id = step.field_id + '_' + step.index;
    ele.find('.step-tr:last-child').data('step', step);
}

//获取做法详情
function getStep(prid) {
    var ele = $('.route_overflow tbody.route-tbody'),
        flag = 'edit';
    ele.html('');
    AjaxClient.get({
        url: URLS['bomAdd'].getstep + '?' + _token + '&practice_id=' + prid,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            // console.log(rsp);
            layer.close(layerLoading);
            if (rsp && rsp.results && rsp.results.length) {
                rsp.results.forEach(function (step, index) {
                    // console.log(step);
                    createStpe(step, index, ele, flag);
                    setTimeout(function () {
                        imgchecks = [];
                        if (step.drawing && step.drawing.length) {
                            var imgs = '', imgchecks = step.drawing;
                            imgchecks.forEach(function (item) {
                                imgs += `<p><img data-img-id="${item.drawing_id}" src="/storage/${item.image_path}" width="80" height="40"><i class="fa fa-times-circle img-delete" data-img-id="${item.drawing_id}"></i></p>`;
                            });
                            ele.find('.step-tr[data-step-id=' + step.field_id + '_' + Number(index + 1) + ']').attr('data-imgs', JSON.stringify(imgchecks)).find('.img-wrap').html(imgs);
                        }
                    }, 0);
                });
            }
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            console.log('获取做法详情失败');
        },
        complete: function () {
            $('.make-item.is-disabled').removeClass('is-disabled');
        }
    }, this);
}

//生成流转品(√)
function createExchange(ele, data) {
    AjaxClient.post({
        url: URLS['bomAdd'].exchange,
        data: data,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            if (layerModal) {
                layer.close(layerModal);
            }
            if (rsp && rsp.results && rsp.results.length) {
                var pele = ele.parents('.route_item').find('.select_route tbody');
                rsp.results.forEach(function (litem) {
                    console.log(litem);
                    var tr = `<tr class="outcome mas" data-is-lzp="1" data-id="${litem.material_id}" data-item-no="${litem.item_no}" data-type="2" data-json='${JSON.stringify(litem)}'>
                    <td><span class="">${litem.item_no}</span><span class="name_flow">(${litem.name || ''})</span></td>
                    <td><input type="text" class="el-input el-input-num" value="${litem.usage_number || 1}">[${litem.commercial}]</td>
                    <td><span class="outcome">出料</span></td>
                    <td><input type="text" class="describe" style="width: 100px;height: 25px" value="${litem.desc && litem.desc != '' ? litem.desc : ''}"></td>
                    <td>    
                        <i class="fa fa-times-circle outcome icon-delete ma-delete" data-id="${litem.material_id}"></i>
                        <span class="caret-wrapper">
                            <i class="sort-caret ascending up"></i>
                            <i class="sort-caret descending down"></i>
                        </span>
                    </td>
                </tr>`;
                    pele.append(tr);
                });
                // LayerConfig('','请去【工时列表】里面维护生成的这个物料的工时');
            } else {
                console.log('生成流转品出错');
            }
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            console.log('生成出料失败');
            if (rsp && rsp.message) {
                LayerConfig('fail', rsp.message);
            }
        }
    }, this);
}

//获取工艺路线的出料(√)
function getOutCome(ele, data) {
    var bid = $('.bom-tree-item.allBOM.selected').attr('data-bom-id');
    AjaxClient.get({
        url: URLS['bomAdd'].outcome + '?' + _token + '&bom_id=' + bid + '&materials=' + data,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            var pele = ele.parents('.route_item').find('.select_route tbody');
            if (rsp && rsp.results && rsp.results.length) {
                chooseMaterialOut(ele, rsp.results);
            }
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            console.log('获取出料失败');
        }
    }, this);
}

//生成每一个节点info
function createNodeInfo(nodeid) {
    var arr = [];
    console.log(nodeid, 'nodeid')
    console.log($('#route_id').val().trim(), 'nodeid')
    if (routeid == $('#route_id').val().trim()) {
        arr = filternodes(routenodes, nodeid);
    }
    return arr;
}

function filternodes(dataArr, nodeid) {
    return dataArr.filter(function (e) {
        return e.routing_node_id == nodeid;
    });
}
//获取bom工艺路线(√)
function getBomRoute(rid) {
    
    var bid = Number($('.bom-tree-item.allBOM.selected').attr('data-bom-id').trim());
    routenodes = [];
    AjaxClient.get({
        url: URLS['bomAdd'].bomRoute + '?' + _token + '&bom_id=' + bid + '&routing_id=' + rid,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
           
            layer.close(layerLoading);
            choose_code = rsp.results.control_info;
            if (rsp && rsp.results) {
                rsp.results.routing_info.forEach(function (item,index) {
                    var rworkarr=[],
                        wcenter = item.workcenters;
                    $.each(wcenter,function(rindex,ritem){
                        rworkarr.push(ritem.workcenter_id);
                    });
                    item.workcenters = rworkarr;
                });
                routenodes = rsp.results.routing_info;
            }
            getProcedureShow(rid);
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            console.log('获取bom工艺路线失败');
        }
    }, this);
}

//获取bom工艺路线集合
function getBomRouteLine() {
    var bid = $('.bom-tree-item.allBOM.selected').attr('data-bom-id').trim();
    // console.log(typeof(bid));
    // console.log(bid);
    bid =Number(bid);
    // console.log(bid);
    // var bid =getQueryString('id');
    // // console.log(bid);
    AjaxClient.get({
        url: URLS['bomAdd'].getBomRoute + '?' + _token + '&bom_id=' + bid,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            // console.log(isVersionOn);
            //工艺路线
            var span = '';
            var groupLis = '';
            // console.log(rsp);
            if (rsp && rsp.results && rsp.results.length) {
                selectedRouteList = rsp.results;
                rsp.results.forEach(function (rlitem) {
                    span += `
                            <span style="cursor: pointer;" data-route-id="${rlitem.routing_id}" data-status="${rlitem.is_default}" data-groupId="${rlitem.procedure_group_id}" data-name="${rlitem.name}" data-factoryId="${rlitem.factory_id}" class="el-tag route-tag">
                                ${rlitem.name}<i data-route-id="${rlitem.routing_id}" class="fa fa-close"></i>
                            </span>
                            
                            `;

                });
            }
            $('#addRoute_form .bom_blockquote').show();
            $('#addRoute_form .route-lists').html(span);
            setTimeout(function () {
                if(rsp.results.length == 1){
                    $('#addRoute_form .route-lists').find('.route-tag').eq(0).click();
                    $('#addRoute_form .route-lists').find('.route-tag').eq(0).next().children().click();
                }else{
                    if($('.route-lists .el-tag[data-status = 1]').length){
                        $('.route-lists .el-tag[data-status = 1]').click();
                    }else{
                        $('#addRoute_form .route-lists').find('.route-tag').eq(0).click();
                    }

                    $('#addRoute_form .route-lists .el-checkbox-outset[data-is_default = 1]').click();
                }
            }, 20);
            setTimeout(function(){
                if(!(isVersionOn==0&&wasRelease==0&&Status==1)){
                    // $('#addRoute_form .route-lists .el-tag.route-tag').css('pointer-events','none');
                    $('#addRoute_form .route-lists .fa.fa-close').css('pointer-events','none');
                    $('#addRoute_form .route-lists .el-checkbox_input').css('pointer-events','none');
                }
            },30)
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            console.log('获取bom工艺路线集合失败');
        }
    }, this);
}
//勾选默认工艺路线
$('body').on('click','.route-lists .el-checkbox_input .el-checkbox-outset',function(){
    $(this).parents().find('.route-lists').children('.el-checkbox_input').removeClass('is-checked');
    $(this).parents().find('.route-lists').children('.route-tag').attr('data-status',0);
    $(this).parent().addClass('is-checked');
    $(this).parent().prev().attr('data-status',1);
})

//保存工艺路线
function saveRoute(data) {
    data.control_info=JSON.stringify(choose_code);
    AjaxClient.post({
        url: URLS['bomAdd'].bomRouteAdd,
        data: data,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            // console.log(rsp);
            if (rsp.code == '200' || rsp.code == '700') {
                var routeId = $('#route_id').val(), routeText = $('#route_id').siblings('.el-input').val(),groupId=$('#route_id').attr('data-groupId'),factoryId=$('#route_id').attr('data-factoryId');

                if ($('.route-lists .route-tag[data-route-id=' + routeId + ']').length) {
                    $('.route-lists .route-tag[data-route-id=' + routeId + ']').addClass('selected').siblings('.el-tag').removeClass('selected');
                    if($('.route-lists .el-tag').length == 1){
                        $('.route-lists .el-tag').eq(0).next().children().click();
                    }
                } else {
                    var span = `<span style="cursor: pointer;" data-route-id="${routeId}" data-groupId="${groupId}" data-factoryId="${factoryId}" data-status="0" class="el-tag route-tag selected">${routeText}<i data-route-id="${routeId}" class="fa fa-close"></i></span><span  data-route-id="${routeId}" class="el-checkbox_input" style="top:5px;left: 5px;margin-right: 25px;">
                                </span>`;
                    $('.route-lists').find('.route-tag.selected').removeClass('selected');
                    $('.route-lists').append(span);
                    selectedRouteList = JSON.parse(data.routings);
                   
                    if($('.route-lists .el-tag').length == 1){
                        $('.route-lists .el-tag').eq(0).next().children().click();
                    }
                }
                LayerConfig('success', '工艺路线保存成功');

            } else {
                LayerConfig('fail', rsp.message);
            }

        },
        fail: function (rsp) {
            layer.close(layerLoading);
            LayerConfig('fail', '工艺路线保存失败');
            // $('.el-button.el-button--primary.save-route').removeClass('preventRedraw');
            // console.log('保存工艺路线失败');
        },
        complete:function(){
            $('.el-button.el-button--primary.save-route').removeClass('preventRedraw');
        }
    }, this);
}

//删除工艺路线
function deleteRoute(rid, obj) {
    var bid = $('.bom-tree-item.allBOM.selected').attr('data-bom-id');
    var routings = [];
    $('.route-lists .route-tag').each(function () {
        if ($(this).attr('data-route-id') != rid) {
            var spanobj = {
                id: $(this).attr('data-route-id'),
                name: $(this).attr('data-name')
            };
            routings.push(spanobj.id);
        }
    });
    AjaxClient.get({
        url: URLS['bomAdd'].routeLineDelete + '?' + _token + '&bom_id=' + bid + '&routing_id=' + rid + '&routings=' + JSON.stringify(routings),
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            var temp_arr = [];
        
            if(selectedRouteList.length) {
                selectedRouteList.forEach(function(item) {
                    if(item.factory_id == obj.factory_id && item.routing_id == obj.routing_id) {
                        console.log(item);
                    } else {
                        temp_arr.push(item);
                    }
                });
                selectedRouteList = temp_arr;
            }
          
            //如果删除的是选中的路线，显示第一条路线信息
            var spanele = $('.route-lists .route-tag[data-route-id=' + rid + ']'),
                radioele = $('.route-lists .el-checkbox_input[data-route-id=' + rid + ']');
            syncele = $('.route-lists .sync-SAP[data-routing-id=' + rid + ']').parent();

            if (spanele.hasClass('selected')) {
                spanele.remove();
                radioele.remove();
                syncele.remove();
                if ($('.route-lists .route-tag').length > 0) {
                    $('.route-lists .route-tag').eq(0).click();
                } else {
                    $('.el-form-item.route-line .el-select-dropdown-item.kong').click();
                    $('#routing_graph_new').html('');
                }
            } else {
                spanele.remove();
                radioele.remove();
                syncele.remove();
            }
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            console.log('删除工艺路线失败');
        }
    }, this);
}

function getCateByOP(opid) {
    AjaxClient.get({
        url: URLS['bomAdd'].cateByOp + '?' + _token + '&operation_id=' + opid,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            // console.log(rsp);
            var lis = '<li data-id="" class="el-select-dropdown-item kong" style="pointer-events:none">--请选择--</li>';
            if (rsp && rsp.results && rsp.results.length) {
                rsp.results.forEach(function (opitem) {
                    lis += `<li data-id="${opitem.material_category_id}" class="el-select-dropdown-item">${opitem.name}</li>`;
                });
            }
            $('#step-route .el-form-item.category .el-select-dropdown-list').html(lis);
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            console.log('获取关联的物料分类失败');
        }
    }, this);
}

//清空所有数据
function resetAllData() {
    if ($('#log').hasClass('open')) {
        $('.logWrap .logClose').click();
    }
    ajaxSubmitData = {};
    bomShowData = {};
    materialData = [];
    topMaterial = {};
    pageNo = 1;
    pageNo1 = 1;
    ajaxTopData = {
        order: 'desc',
        sort: 'id'
    };
    ajaxData = {
        order: 'desc',
        sort: 'id'
    };
    $('.operation-wrap .el-input').val("--请选择--");
    $('.ability_wrap .el-input').val("--请选择--");
    $('.ability_wrap .ability ul').html(`<li data-id="" class="el-select-dropdown-item kong ability-item" data-name="--请选择--">--请选择--</li>`)
    $('.ability_wrap .el-select').find('.el-input').val('--请选择--');
    $('.operation-wrap .list ul').html(`<li data-id="" class="el-select-dropdown-item kong operation-item" data-name="--请选择--">--请选择--</li>`);
    abilitySource = [];
    operationSource = [];
    //常规信息
    var basicForm = $('#addBBasic_from');
    basicForm.find('#code').val('');
    basicForm.find('#name').val('');
    basicForm.find('#unit').val('');
    basicForm.find('#loss_rate').val('0.00');
    basicForm.find('#description').val('');
    basicForm.find('#basic_operation_id').val('').siblings('span').removeClass('none');
    basicForm.find('#material_id').val('').data('topMaterial', {}).attr('data-id', '');
    basicForm.find('.el-form-item.bom_group .el-select-dropdown-item.kong').click();
    basicForm.find('.el-form-item-label.show-material').removeClass('mater-active');
    basicForm.find('.bom_table.item_table .t-body').html(`<tr>
      <td class="nowrap" colspan="8" style="text-align: center;">暂无数据</td>
    </tr>`);
    basicForm.find('.bom-add-new-item').addClass('is-disabled');

    //清掉工艺路线信息
    $('#route_id').val('').siblings('.el-input').val('--请选择--');
    $('#route_group_id').val('').siblings('.el-input').val('--请选择--');
    $('#factory_id').val('').siblings('.el-input').val('--请选择--');
    $('#routing_graph_new').html('');
    $('.el-input.el-input-search').val('');
    $('.make_list_all').html('<p style="padding-left: 10px;">暂无数据</p>');
    $('.make_list_line_all').html('');
    $('.route_overflow .route-tbody').html('<tr><td colspan="11" style="text-align: center;">暂无数据</td></tr>');

    //附件信息
    $("#attachment").fileinput('destroy');
    $('.tap-btn-wrap .el-tap[data-item=addBBasic_from]').click();
    $(window).scrollTop(0);
}
//bom有效期
// laydate.render({
//     elem: '#validity',
//     type: 'datetime',
//     min: 0
// })
//存储数据
function createBomSendData(treedata) {
    var basicForm = $('#addBBasic_from');
    ajaxSubmitData.code = basicForm.find('#code').val().trim();
    ajaxSubmitData.name = basicForm.find('#name').val().trim();
    ajaxSubmitData.material_id = basicForm.find('#material_id').data('topMaterial').material_id;
    ajaxSubmitData.operation_id = basicForm.find('#basic_operation_id').val();
    ajaxSubmitData.operation_id = basicForm.find('#basic_operation_id').val();
    ajaxSubmitData.bom_no = basicForm.find('#bom_no').val();
    ajaxSubmitData.BMEIN = basicForm.find('#bom_unit').val();
    // ajaxSubmitData.DATUV = basicForm.find('#validity').val();
    ajaxSubmitData.from = basicForm.find('#bom_from').val();
    ajaxSubmitData.STLAN = basicForm.find('#use').val();
    ajaxSubmitData.bom_sap_desc = basicForm.find('#SAP_desc').val().trim();
    ajaxSubmitData.operation_capacity = abilitySource.join(',');
    ajaxSubmitData.loss_rate = basicForm.find('#loss_rate').val().trim();
    ajaxSubmitData.bom_group_id = basicForm.find('#bom_group_id').val().trim();
    ajaxSubmitData.qty = basicForm.find('#qty').val().trim();
    ajaxSubmitData.label = basicForm.find('#label').val().trim();
    ajaxSubmitData.description = basicForm.find('#description').val().trim();
    ajaxSubmitData.bom_unit_id = basicForm.find('#bom_unit_id').val().trim();
    ajaxSubmitData.cookie = creator_token;
    ajaxSubmitData._token = TOKEN;
    createFujianData();
    if (mActionFlag == 'add') {
        ajaxSubmitData.version = 1;
        ajaxSubmitData.version_description = '第一版本';
        // ajaxSubmitData.bom_tree=JSON.stringify(createBomTreeData(treedata));
        var subData = {
            material_id: basicForm.find('#material_id').data('topMaterial').material_id,
            name: basicForm.find('#material_id').val().trim(),
            item_no: basicForm.find('#material_id').data('topMaterial').item_no,
            children: []
        }
        subData.children = createBomTreeData(treedata);
        ajaxSubmitData.bom_tree = JSON.stringify(subData);
    } else {
        ajaxSubmitData.bom_id = $('.item-name.bom-tree-item.allBOM.selected').attr('data-bom-id');
        var bom_tree = [];
        if (treedata.children && treedata.children.length) {
            treedata.children.forEach(function (item) {
                var bomObj = {
                    bom_no:item.bom_no,
                    AENNR:item.AENNR || 0,
                    DATUB:item.DATUB || 0,
                    DATUV: item.DATUV || 0,
                    POSNR: item.POSNR || '',
                    POSTP: item.POSTP || '',
                    MEINS: item.MEINS || '',
                    bom_unit_id: item.bom_unit_id || 0,
                    bom_id: ajaxSubmitData.bom_id,
                    item_no: item.item_no,
                    bom_material_id: ajaxSubmitData.material_id,
                    bom_item_id: item.bom_item_id || 0,
                    material_id: item.material_id,
                    loss_rate: item.loss_rate,
                    is_assembly: item.is_assembly || 0,
                    usage_number: item.usage_number,
                    comment: item.comment,
                    version: item.version || 0,
                    bom_item_qty_levels: item.bom_item_qty_levels || [],
                    son_material_id: item.son_material_id,
                    total_consume: item.total_consume || '',
                    replaces: []
                };
                if (item.replaces && item.replaces.length) {
                    item.replaces && item.replaces.forEach(function (ritem) {
                        var replaceObj = {
                            bom_no:ritem.bom_no,
                            AENNR:ritem.AENNR || 0,
                            DATUB:ritem.DATUB || 0,
                            DATUV: ritem.DATUV || 0,
                            bom_unit_id: ritem.bom_unit_id || 0,
                            POSNR: ritem.POSNR || '',
                            POSTP: ritem.POSTP || '',
                            MEINS: ritem.MEINS || '',
                            parent_id: bomObj.bom_item_id || 0 ,
                            bom_id: ajaxSubmitData.bom_id,
                            item_no: ritem.item_no,
                            bom_material_id: ajaxSubmitData.material_id,
                            bom_item_id: ritem.bom_item_id || 0,
                            material_id: ritem.material_id,
                            loss_rate: ritem.loss_rate,
                            is_assembly: ritem.is_assembly || 0,
                            usage_number: ritem.usage_number,
                            comment: ritem.comment,
                            version: ritem.version || 0,
                            bom_item_qty_levels: ritem.bom_item_qty_levels || [],
                            son_material_id: ritem.son_material_id,
                            total_consume: ritem.total_consume || ''
                        }
                        bomObj.replaces.push(replaceObj);
                    });
                }
                bom_tree.push(bomObj);
            });
        }
        // ajaxSubmitData.bom_tree=JSON.stringify(bom_tree);
        var subData = {
            material_id: basicForm.find('#material_id').data('topMaterial').material_id,
            name: basicForm.find('#material_id').val().trim(),
            item_no: basicForm.find('#material_id').data('topMaterial').item_no,
            children: []
        }
        subData.children = bom_tree;
        ajaxSubmitData.bom_tree = JSON.stringify(subData);
    }
}

function createBomProductData(treedata) {
    var basicForm = $('#addBBasic_from');
    ajaxSubmitData.code = basicForm.find('#code').val().trim();
    ajaxSubmitData.name = basicForm.find('#name').val().trim();
    ajaxSubmitData.version = basicForm.find('#version').val().trim();
    ajaxSubmitData.material_id = basicForm.find('#material_id').data('topMaterial').material_id;
    ajaxSubmitData.loss_rate = basicForm.find('#loss_rate').val().trim();
    ajaxSubmitData.bom_group_id = basicForm.find('#bom_group_id').val().trim();
    ajaxSubmitData.qty = basicForm.find('#qty').val().trim();
    ajaxSubmitData.description = basicForm.find('#description').val().trim();
    ajaxSubmitData.bom_unit_id = basicForm.find('#bom_unit_id').val().trim();
    ajaxSubmitData.cookie = creator_token;
    ajaxSubmitData._token = TOKEN;
    createFujianData();
    var bom_tree = [];
    var pbom_id = $('.item-name.bom-tree-item.allBOM.selected').attr('data-bom-id');
    if (treedata.children && treedata.children.length) {
        treedata.children.forEach(function (item) {
            var bomObj = {
                bom_id: pbom_id,
                item_no: item.item_no,
                name: item.name,
                bom_material_id: ajaxSubmitData.material_id,
                bom_item_id: item.bom_item_id || 0,
                material_id: item.material_id,
                loss_rate: item.loss_rate,
                is_assembly: item.is_assembly || 0,
                usage_number: item.usage_number,
                comment: item.comment,
                version: item.version || 0,
                bom_item_qty_levels: item.bom_item_qty_levels || [],
                son_material_id: item.son_material_id,
                total_consume: item.total_consume || '',
                replaces: []
            };
            if (item.replaces && item.replaces.length) {
                item.replaces && item.replaces.forEach(function (ritem) {
                    var replaceObj = {
                        parent_id: bomObj.bom_item_id || 0 ,
                        bom_id: pbom_id,
                        item_no: ritem.item_no,
                        name: ritem.name,
                        bom_material_id: ajaxSubmitData.material_id,
                        bom_item_id: ritem.bom_item_id || 0,
                        material_id: ritem.material_id,
                        loss_rate: ritem.loss_rate,
                        is_assembly: ritem.is_assembly || 0,
                        usage_number: ritem.usage_number,
                        comment: ritem.comment,
                        version: item.version || 0,
                        bom_item_qty_levels: ritem.bom_item_qty_levels || [],
                        son_material_id: ritem.son_material_id,
                        total_consume: ritem.total_consume || ''
                    }
                    bomObj.replaces.push(replaceObj);
                });
            }
            bom_tree.push(bomObj);
        });
    }

    var subData = {
        material_id: basicForm.find('#material_id').data('topMaterial').material_id,
        name: basicForm.find('#material_id').val().trim(),
        item_no: basicForm.find('#material_id').data('topMaterial').item_no,
        children: []
    }
    subData.children = bom_tree;

    ajaxSubmitData.bom_tree = JSON.stringify(subData);

}

//存储附件数据
function createFujianData() {
    var ele = $('#addBFujian_from .file-preview-frame.file-preview-success,#addBFujian_from .file-preview-frame.init-success-file');
    var fujianData = [];
    ele.each(function () {
        var item = {
            attachment_id: $(this).attr('attachment_id'),
            comment: $(this).find('.fujiantext').val().trim()
        };
        fujianData.push(item);
    });
    ajaxSubmitData.attachments = JSON.stringify(fujianData);
    // console.log("ajax",ajaxSubmitData.attachments);

}
//常规基础数量校验
$('body').on('blur','#qty',function(){
    var msg=$(this).val();
    var reg=/^\d+(\.{0,1}\d+){0,1}$/;
    var re=new RegExp(reg);
    console.log(msg);

    if(!re.test(msg)){
        $(this).parents('.el-form-item').find('.errorMessage').html('格式不正确');
        $('.el-button.el-button--primary.submit.save').addClass('preventRedraw');
    }else{
        $(this).parents('.el-form-item').find('.errorMessage').html('');
        $('.el-button.el-button--primary.submit.save').removeClass('preventRedraw');
    }
})
//存储bom树的数据
function createBomTreeData(data) {
    var ajaxBomData = [];
    if (data.children && data.children.length) {
        data.children.forEach(function (item) {
            var bomObj = {
                bom_no:ajaxSubmitData.bom_no,
                bom_item_id: 0,
                item_no: item.item_no,
                material_id: item.material_id,
                loss_rate: item.loss_rate,
                is_assembly: item.is_assembly || 0,
                usage_number: item.usage_number,
                comment: item.comment,
                version: item.version || 0,
                bom_item_qty_levels: item.bom_item_qty_levels || [],
                son_material_id: item.son_material_id,
                total_consume: item.total_consume || '',
                replaces: []
            };
            if (item.replaces && item.replaces.length) {
                item.replaces && item.replaces.forEach(function (ritem) {
                    var replaceObj = {
                        bom_no:ajaxSubmitData.bom_no,
                        bom_item_id: 0,
                        item_no: ritem.item_no,
                        material_id: ritem.material_id,
                        loss_rate: ritem.loss_rate,
                        is_assembly: ritem.is_assembly || 0,
                        usage_number: ritem.usage_number,
                        comment: ritem.comment,
                        version: item.version || 0,
                        bom_item_qty_levels: ritem.bom_item_qty_levels || [],
                        son_material_id: ritem.son_material_id,
                        total_consume: ritem.total_consume || ''
                    }
                    bomObj.replaces.push(replaceObj);
                });
            }
            ajaxBomData.push(bomObj);
        });
    }
    return ajaxBomData;
}

function createRealBom(treeData, fn, flag) {
    var bomHtml = '';
    if (treeData.children && treeData.children.length) {
        var bomitemHtml = treeList(treeData, 0, flag, treeData.usage_number, treeData.commercial);
        bomHtml = `<div class="tree-folder" data-id="${treeData.material_id}">
                     <div class="tree-folder-header">
                       <div class="flex-item">
                         <i class="icon-minus expand-icon"></i>
                         <div class="tree-folder-name">
                           <p class="bom-tree-item top-item item-name ${flag}" data-bom-id="${treeData.children[0].bom_id}" data-pid="0" data-post-id="${treeData.material_id}" title="${treeData.name}&nbsp;&nbsp;${flag == 'allBOM' ? `(${treeData.usage_number}${treeData.commercial}: ${treeData.usage_number}${treeData.commercial})` : ''}">
                             ${treeData.name}&nbsp;&nbsp;${flag == 'allBOM' ? `(${treeData.usage_number} ${treeData.commercial} : ${treeData.usage_number} ${treeData.commercial})` : ''} 
                           </p>
                         </div>
                       </div>
                     </div>
                     <div class="tree-folder-content">
                       ${bomitemHtml}
                     </div>
                  </div> `;
    } else {
        bomHtml = `<div class="tree-item" data-id="${treeData.material_id}">
                      <div class="flex-item">
                          <i class="item-dot expand-icon"></i>
                          <div class="tree-item-name">
                              <p class="bom-tree-item top-item item-name ${flag}" data-pid="0" data-post-id="${treeData.material_id}" title="${treeData.name}">
                                  ${treeData.name}
                              </p>
                          </div>
                      </div>  
                   </div>`;
    }
    fn && typeof fn == 'function' ? fn(bomHtml) : null;
}

// 重写bomTree

function newBomTree(data,flag,num,commercial,pmid) {
    var bomTree = '';
    data.forEach(function(item){
        var replaceStr = '', replaceCss = '', assemblyStr = '';
        if (item.replaces != undefined && item.replaces.length) {
            replaceStr = '<span>替</span>';
            replaceCss = 'replace-item';
        }
        if (item.has_bom && item.is_assembly == 1) {
            var content;
            if (item.has_route > 0) {
                content='*';
            }else{
                content='';
            }
            bomTree += `<div class="tree-folder" data-id="${item.material_id}" data-posnr="${item.POSNR}">
                                           <div class="tree-folder-header">
                                           <div class="flex-item">
                                           <i class="expand-icon icon-plus getSonBom" data-posnr="${item.POSNR}" data-bom-id="${item.self_bom_id}"  data-num="${num}" data-commercial="${commercial}"></i>
                                           <div class="tree-folder-name">
                                           <p class="item-name bom-tree-item ${flag} ${replaceCss}" data-bom-item-id="${item.bom_item_id}"
                                           data-bom-id="${item.self_bom_id || 0}"
                                           data-pid="${pmid || 0}"
                                           data-posnr="${item.POSNR}"
                                           data-post-id="${item.material_id}" title="${replaceStr}${item.name} ${flag == 'allBOM' ?
                `(${num}${commercial}: ${item.usage_number}${item.commercial})` : "" }">${replaceStr}${item.name}
                                           &nbsp;&nbsp; ${flag == 'allBOM' ? `(${num} ${commercial} : ${item.usage_number} ${item.commercial})` : "" } </p>
                                          <span class="replace">${content}</span>
                                           </div></div></div>
                                           <div class="tree-folder-content">

                                           </div>
                                        </div> `;
        }else{
            var assbomid = '';
            if (item.is_assembly != 1 && item.has_bom) {
                assemblyStr = '<span class="bom-flag" style="margin-left:3px;">BOM</span>';
                assbomid = item.self_bom_id;
                bom_nos = JSON.stringify(item.bom_nos);
                // console.log('非组装bom',bom_nos);
                bomTree += `<div class="tree-item" data-id="${item.material_id}">
                                <div class="flex-item">
                                <i class="item-dot expand-icon"></i>
                                <div class="tree-item-name">
                                    <p style="display:inline-block;background: #fffcdc;" class="item-name bom-tree-item ${flag} ${replaceCss} noAssemblyBom" data-bom-item-id="${item.bom_item_id}" data-bom-id="${assbomid}" data-p-bom-id="${item.bom_id}" data-posnr="${item.POSNR}" data-pid="${item.ppid || 0}" data-post-id="${item.material_id}" data-bom_nos='${bom_nos}' title="${item.name}&nbsp;&nbsp;${flag == 'allBOM' ? `(${num}${commercial}: ${item.usage_number}${item.commercial})` : "" }">
                                        ${item.name}&nbsp;&nbsp;${flag == 'allBOM' ? `(${num} ${commercial} : ${item.usage_number} ${item.commercial})` : "" }${replaceStr}${assemblyStr}
                                    </p>
                                    <span class="assemblyBtn">组装</span>
                                </div>
                                </div>
                                </div>`;
            }else{
                bomTree += `<div class="tree-item" data-id="${item.material_id}">
                                <div class="flex-item">
                                <i class="item-dot expand-icon"></i>
                                <div class="tree-item-name">
                                    <p class="item-name bom-tree-item ${flag} ${replaceCss}" data-bom-item-id="${item.bom_item_id}" data-posnr="${item.POSNR}"  data-pid="${item.ppid || 0}" data-post-id="${item.material_id}" data-p-bom-id="${item.bom_id}" title="${item.name}&nbsp;&nbsp;${flag == 'allBOM' ? `(${num}${commercial}: ${item.usage_number}${item.commercial})` : "" }">
                                        ${item.name}&nbsp;&nbsp;${flag == 'allBOM' ? `(${num} ${commercial} : ${item.usage_number} ${item.commercial})` : "" }${replaceStr}
                                    </p>
                                </div>
                                </div>
                                </div>`;
            }
        }
    })
    return bomTree;
}

// 点击子bom获取物料信息

$('body').on('click','.getSonBom',function(){
    if($(this).hasClass('icon-plus')){
        var bom_id = $(this).attr('data-bom-id');
        var num = $(this).attr('data-num');
        var commercial = $(this).attr('data-commercial');
        var sonBom = [];
        let posnr = $(this).attr('data-posnr');
        // $(this).parent().parent().parent().next().html('');
        function getSonBom(bom_id, posnr) {
            AjaxClient.get({
                url: URLS['bomAdd'].bomShow + "?" + _token + '&bom_id=' + bom_id ,
                dataType: 'json',
                success: function (rsp) {
                    // console.log(rsp);
                    pmid = rsp.results.material_id;
                    sonBom = rsp.results.bom_tree.children;
                    sonBom.forEach(function (val,i) {
                        val.ppid = pmid;
                    })
                    inserttreego = true;
                    insertBomTree(bomTreeOld,sonBom,pmid,bom_id);
                   
                     $('.bom-fake-tree').find("i[data-bom-id="+bom_id+"]").parents('.tree-folder-header').siblings('.tree-folder-content')
                        .html(newBomTree(sonBom,'allBOM',num,commercial,pmid));
                },
                fail: function (rsp) {
                    console.log('获取物料清单详细信息失败');
                }
            }, this);
        }
        getSonBom(bom_id, posnr);
    }
})

//点击非组装bom进行组装
$('body').on('click','.assemblyBtn',function(){
    var bomSelect = JSON.parse($(this).prev().attr('data-bom_nos'));
    var bomItemId = $(this).prev().attr('data-bom-item-id');
    // console.log(bomItemId);
    var trs = '';
    bomSelect.forEach(function(val,index){
        trs += `<tr class="tritem">
                     <td>
                         <span class="el-checkbox_input selectNo" data-bomId="${val.bom_id}" data-bomItemId="${bomItemId}" data-bomNo="${val.bom_no}" data-version="${val.version}">
                              <span class="el-checkbox-outset "></span>
                         </span>
                     </td>
                     <td>${val.bom_no}</td>
                </tr>`
    })
    // console.log(trs);
    // console.log('非组装bom ',bomSelect);
    layerModal = layer.open({
        type: 1,
        title: '组装BOM',
        offset: '100px',
        area: ['500px','300px'],
        shade: 0.1,
        btn: '确定',
        shadeClose: false,
        resize: false,
        move: false,
        content: `<table class="chooseNo">
                        <thead>
                            <th>选择</th>
                            <th>BOM编号</th>
                        </thead>
                        <tbody>
                            ${trs}    
                        </tbody>
                      </table>
                     `,
        yes: function () {
            layer.closeAll();
            var trele = $('table.chooseNo .selectNo.is-checked');
            var bomItemId = trele.attr('data-bomItemId'),
                bomNo = trele.attr('data-bomNo'),
                bomId = trele.attr('data-bomId'),
                Version = trele.attr('data-version');
            // console.log(bom_item_id,bom_id,version);
            var assemblyObj = {
                item_id : bomItemId,
                bom_no : bomNo,
                version : Version
            }
            //console.log(assemblyObj);
            getBomId(assemblyObj,bomId,bomItemId);
        },
        end: function () {

        }
    });
})

//完成组装
function getBomId(data,bomId,bomItemId){
    var loadPackage = null;
    AjaxClient.post({
            url: URLS['bomAdd'].assemblyItem+ "?" + _token,
            dataType: 'json',
            data : data,
            beforeSend: function () {
                var bodyWidth=document.body.clientWidth,
                sidebar=$('#sidebar').width(),
                center=(bodyWidth+sidebar)/2;
                loadPackage = layer.load(2, {shade: 0.3,offset: ['300px',`${center}px`]});
            },
            success: function (rsp) {
                
                //console.log(rsp,bomId);
                if(rsp.code == 200){
                    $('.self-make-btn').attr({
                        'data-opcode': '',
                        'data-node-id': '',
                        'data-id': '',
                        'data-opid': ''
                    });
                    function getSonBom(bom_id,bomItemId) {
                        AjaxClient.get({
                            url: URLS['bomAdd'].bomShow + "?" + _token + '&bom_id=' + bom_id ,
                            dataType: 'json',
                            success: function (rsp) {
                                layer.close(loadPackage);
                                pmid = rsp.results.material_id;
                                sonBom = rsp.results.bom_tree.children;
                                sonBom.forEach(function (val,i) {
                                    val.ppid = pmid;
                                })
                                inserttreego = true;
                                $('.tap-btn-wrap .saveoption').show();
                                insertBomTree2(bomTreeOld,sonBom,pmid,bomItemId);
                            },
                            fail: function (rsp) {
                                layer.close(loadPackage);
                                console.log('获取物料清单详细信息失败');
                            }
                        }, this);
                    }
                    getSonBom(bomId,bomItemId);
                } else {
                    layer.close(loadPackage);
                }
            },
            fail: function (rsp) {
                layer.close(loadPackage);
                console.log('获取bom_id失败');
            },
            end: function(rsp){
                layer.close(loadPackage);
                layer.close(layerModal);
            }
        },
        this);
}

//递归插入bomTree children
function insertBomTree(bomTreeOld,sonbom,id,bom_id){
    if (inserttreego == false) {
        return;
    }
    // console.log(bomTreeOld,id,bom_id);
    if (bomTreeOld.material_id == id && bomTreeOld.self_bom_id == bom_id) {
        //do something and break;
        // console.log(sonbom);
        bomTreeOld.children = sonbom;

        inserttreego = false;
        return;
    } else {
        if (bomTreeOld.children && bomTreeOld.children.length) {
            bomTreeOld.children.forEach(function (item) {
                insertBomTree(item, sonbom, id,bom_id);
            });
        }
    }

};

function insertBomTree2(bomTreeOld,sonbom,id,bom_item_id){
    if (inserttreego == false) {
        return;
    }
    // console.log(bomTreeOld,id,bom_id);
    if (bomTreeOld.material_id == id && bomTreeOld.bom_item_id == bom_item_id) {
        //do something and break;
        // console.log(sonbom);
        bomTreeOld.children = sonbom;
        // console.log(123, bom_item_id);
        // if(){
        //
        // }
        var topBomId = $('.bom-fake-tree .top-item').attr("data-bom-id");
        var pBomId = $('.bom-fake-tree').find("p[data-bom-item-id="+bom_item_id+"]").attr('data-p-bom-id');
        if(pBomId && pBomId == topBomId){
            // history.go(0);
            getBomInfo(topBomId);

        }else{
            $('.bom-fake-tree').find("i[data-bom-id="+pBomId+"]").click();
            // console.log($('.bom-fake-tree').find("i[data-bom-id="+pBomId+"]"));
        }

        inserttreego = false;
        return;
    } else {
        if (bomTreeOld.children && bomTreeOld.children.length) {
            bomTreeOld.children.forEach(function (item) {
                insertBomTree2(item, sonbom, id,bom_item_id);
            });
        }
    }

};

// 扩展物料结构树

// function treeList(data, pid, flag, num, commercial) {
//     var bomTree = '';
//     if (flag == 'realBOM' || flag == 'noedit' || flag == 'allBOM') {
//         data.children.forEach(function (item) {
//             var replaceStr = '', replaceCss = '', assemblyStr = '';
//             if (item.replaces != undefined && item.replaces.length) {
//                 replaceStr = '<span>替</span>';
//                 replaceCss = 'replace-item';
//             }
//
//             if (item.children && item.children.length && item.is_assembly) {
//                 var content;
//                 if (item.has_route > 0) {
//                     content='*';
//                 }else{
//                     content='';
//                 }
//                 bomTree += `<div class="tree-folder" data-id="${item.material_id}">
//                    <div class="tree-folder-header">
//                    <div class="flex-item">
//                    <i class="icon-minus expand-icon"></i>
//                    <div class="tree-folder-name">
//                    <p class="item-name bom-tree-item ${flag} ${replaceCss}" data-bom-item-id="${item.bom_item_id}"
//                    data-bom-id="${item.children[0].bom_id || ''}"
//                    data-pid="${item.ppid || 0}"
//                    data-post-id="${item.material_id}" title="${replaceStr}${item.name} ${flag == 'allBOM' ? `(${num}${commercial}: ${item.usage_number}${item.commercial})` : "" }">${replaceStr}${item.name}
//                    &nbsp;&nbsp; ${flag == 'allBOM' ? `(${num} ${commercial} : ${item.usage_number} ${item.commercial})` : "" } </p>
//                   <span class="replace">${content}</span>
//                    </div></div></div>
//                    <div class="tree-folder-content">
//                      ${treeList(item, 0, flag, num, commercial)}
//                    </div>
//                 </div> `;
//             } else {
//
//                 var assbomid = '';
//                 if (item.is_assembly == 0 && item.children && item.children.length) {
//                     assemblyStr = '<span class="bom-flag" style="margin-left:3px;">BOM</span>';
//                     assbomid = item.children[0].bom_id;
//                 }
//                 bomTree += `<div class="tree-item" data-id="${item.material_id}">
//                 <div class="flex-item">
//                 <i class="item-dot expand-icon"></i>
//                 <div class="tree-item-name">
//                 <p class="item-name bom-tree-item ${flag} ${replaceCss}" data-bom-item-id="${item.bom_item_id}" data-bom-id="${assbomid}" data-pid="${item.ppid || 0}" data-post-id="${item.material_id}" title="${item.name}&nbsp;&nbsp;${flag == 'allBOM' ? `(${num}${commercial}: ${item.usage_number}${item.commercial})` : "" }">${item.name}&nbsp;&nbsp;${flag == 'allBOM' ? `(${num} ${commercial} : ${item.usage_number} ${item.commercial})` : "" }${replaceStr}${assemblyStr} </p>
//                 </div>
//                 </div>
//                 </div>`;
//             }
//         });
//     } else {
//         var children = getChildById(data, pid);
//         children.forEach(function (item, index) {
//             var hasChild = hasChilds(data, item.id);
//             if (hasChild) {
//                 bomTree += `<div class="tree-folder" data-id="${item.id}" data-pid="${pid}">
//                    <div class="tree-folder-header">
//                    <div class="flex-item">
//                    <i class="icon-minus expand-icon"></i>
//                    <div class="tree-folder-name">
//                    <p class="item-name ${flag}" data-template-id="${item.template_id}" data-post-id="${item.id}" title="${item.name}">${item.name}</p>
//                    </div></div></div>
//                    <div class="tree-folder-content">
//                      ${treeList(data, item.id, flag)}
//                    </div>
//                 </div> `;
//             } else {
//                 bomTree += `<div class="tree-item" data-id="${item.id}" data-pid="${pid}">
//                   <div class="flex-item">
//                   <i class="item-dot expand-icon"></i>
//                   <div class="tree-item-name"><p class="item-name ${flag}" data-template-id="${item.template_id}" data-post-id="${item.id}" title="${item.name}">${item.name}</p></div></div>
//                 </div>`;
//             }
//         });
//     }
//     return bomTree;
// }


//重写扩展物料结构树

function treeList(data, pid, flag, num, commercial) {
    
    var bomTree = '';
    if (flag == 'realBOM' || flag == 'noedit' || flag == 'allBOM') {
        data.children.forEach(function (item) {
            
            // if(!item.self_bom_id && bomMaterialIdList[item.material_id]) {
            //     item.self_bom_id = bomMaterialIdList[item.material_id];
            // } else {
            //     bomMaterialIdList[item.material_id] = item.self_bom_id;
            // }
           
            var replaceStr = '', replaceCss = '', assemblyStr = '';
            if (item.replaces != undefined && item.replaces.length) {
                replaceStr = '<span>替</span>';
                replaceCss = 'replace-item';
            }

            if (item.has_bom && item.is_assembly == 1) {
                var content;
                if (item.has_route > 0) {
                    content='*';
                }else{
                    content='';
                }

                bomTree += `<div class="tree-folder" data-id="${item.material_id}">
                   <div class="tree-folder-header">
                   <div class="flex-item">
                   <i class="expand-icon icon-plus getSonBom" data-posnr="${item.POSNR}" data-bom-id="${item.self_bom_id}"  data-num="${num}" data-commercial="${commercial}"></i>
                   <div class="tree-folder-name">
                   <p class="item-name bom-tree-item ${flag} ${replaceCss} sonBom" data-bom-item-id="${item.bom_item_id}"
                   data-bom-id="${item.self_bom_id || 0}" data-p-bom-id="${item.bom_id}"
                   data-pid="${item.ppid || 0}"
                   data-posnr="${item.POSNR}"
                   data-post-id="${item.material_id}" title="${replaceStr}${item.name} ${flag == 'allBOM' ?
                    `(${num}${commercial}: ${item.usage_number}${item.commercial})` : "" }">${replaceStr}${item.name}
                   &nbsp;&nbsp; ${flag == 'allBOM' ? `(${num} ${commercial} : ${item.usage_number} ${item.commercial})` : "" } </p>
                  <span class="replace">${content}</span>
                   </div></div></div>
                   <div class="tree-folder-content">

                   </div>
                </div> `;
            }
            else {
                var assbomid = '';
                if (item.is_assembly != 1 && item.has_bom) {
                    assemblyStr = '<span class="bom-flag" style="margin-left:3px;">BOM</span>';
                    assbomid = item.self_bom_id;
                    bom_nos = JSON.stringify(item.bom_nos);
                    bomTree += `<div class="tree-item" data-id="${item.material_id}">
                                <div class="flex-item">
                                <i class="item-dot expand-icon"></i>
                                <div class="tree-item-name">
                                    <p style="display:inline-block;background:#fffcdc;" class="item-name bom-tree-item ${flag} ${replaceCss} noAssemblyBom" data-p-bom-id="${item.bom_id}" data-bom-item-id="${item.bom_item_id}" data-bom-id="${assbomid}" data-posnr="${item.POSNR}" data-pid="${item.ppid || 0}" data-post-id="${item.material_id}" data-bom_nos='${bom_nos}' title="${item.name}&nbsp;&nbsp;${flag == 'allBOM' ? `(${num}${commercial}: ${item.usage_number}${item.commercial})` : "" }">
                                        ${item.name}&nbsp;&nbsp;${flag == 'allBOM' ? `(${num} ${commercial} : ${item.usage_number} ${item.commercial})` : "" }${replaceStr}${assemblyStr}
                                    </p>
                                    <span class="assemblyBtn">组装</span>
                                </div>
                                </div>
                                </div>`;
                }else{
                    bomTree += `<div class="tree-item" data-id="${item.material_id}" data-posnr="${item.POSNR}">
                                <div class="flex-item">
                                <i class="item-dot expand-icon"></i>
                                <div class="tree-item-name">
                                    <p class="item-name bom-tree-item ${flag} ${replaceCss}" data-bom-item-id="${item.bom_item_id}" data-p-bom-id="${item.bom_id}" data-posnr="${item.POSNR}"  data-pid="${item.ppid || 0}" data-post-id="${item.material_id}" title="${item.name}&nbsp;&nbsp;${flag == 'allBOM' ? `(${num}${commercial}: ${item.usage_number}${item.commercial})` : "" }">
                                        ${item.name}&nbsp;&nbsp;${flag == 'allBOM' ? `(${num} ${commercial} : ${item.usage_number} ${item.commercial})` : "" }${replaceStr}
                                    </p>
                                </div>
                                </div>
                                </div>`;
                }
            }
        });
    } else {
        var children = getChildById(data, pid);
        children.forEach(function (item, index) {
            var hasChild = hasChilds(data, item.id);
            if (hasChild) {
                bomTree += `<div class="tree-folder" data-id="${item.id}" data-pid="${pid}">
                   <div class="tree-folder-header">
                   <div class="flex-item">
                   <i class="icon-minus expand-icon"></i>
                   <div class="tree-folder-name">
                   <p class="item-name ${flag}" data-template-id="${item.template_id}" data-post-id="${item.id}" title="${item.name}">${item.name}</p>
                   </div></div></div>
                   <div class="tree-folder-content">
                     ${treeList(data, item.id, flag)}
                   </div>
                </div> `;
            } else {
                bomTree += `<div class="tree-item" data-id="${item.id}" data-pid="${pid}">
                  <div class="flex-item">
                  <i class="item-dot expand-icon"></i>
                  <div class="tree-item-name"><p class="item-name ${flag}" data-template-id="${item.template_id}" data-post-id="${item.id}" title="${item.name}">${item.name}</p></div></div>
                </div>`;
            }
        });
    }
    return bomTree;
}

//操作结构图中的树形结构,填充数据
function actTree(data, id, ppid, newData, replaceid) {
    if (go == false) {//阻止继续遍历下去
        return;
    }
    var posnr = $('.item-name.bom-tree-item.realBOM.selected').attr('data-posnr');
    if (data.material_id == id && data.ppid == ppid && data.POSNR == posnr) {
        //do something and break;
        if (newData) {
            if (replaceid != undefined) {
                data.replaces && data.replaces.forEach(function (item) {
                    if (item.material_id == replaceid) {
                        item.bom_item_qty_levels = newData.bom_item_qty_levels;
                        item.total_consume = newData.total_consume;
                        return false;
                    }
                });
            } else {
                if(data.POSNR == newData.POSNR) {
                    data.bom_item_qty_levels = newData.bom_item_qty_levels;
                    data.total_consume = newData.total_consume;
                } else {
                    bomShowData.children.forEach(function (item) {
                        if(item.POSNR == posnr) {
                            item.bom_item_qty_levels = newData.bom_item_qty_levels;
                            item.total_consume = newData.total_consume;
                        }
                    });
                }
            }
        } else {
            if(posnr) {
                bomShowData.children.forEach(function (item) {
                    if(item.POSNR == posnr) {
                        createMDetailInfo(item, true, ppid, posnr);
                    } 
                });
            } else {
                createMDetailInfo(data, true, ppid, posnr);
            }
        }
        go = false;
        return;
    } else {
        if (data.children && data.children.length) {
            data.children.forEach(function (item) {
                actTree(item, id, ppid, newData, replaceid, item.POSNR);
            });
        }
    }
}

//操作整个大树，填充数据
function actAllTree(data, id, ppid) {
    // console.log(data);
    if (alltreego == false) {
        return;
    }
    // console.log(data.material_id,data.ppid)
    if (data.material_id == id && data.ppid == ppid) {
        //do something and break;
        // console.log(data);
        createFormData(data);
        alltreego = false;
        return;
    } else {
        if (data.children && data.children.length) {
            data.children.forEach(function (item) {
                actAllTree(item, id, ppid);
            });
        }
    }
}

//根据大树中的每一项重置页面
function createFormData(data) {
    bomDesign = '';
    bomProduct = '';
    if (data.self_bom_id || data.ppid == 0 ) {//已经有子项，只能进入编辑状态
        resetAllData();
        mActionFlag = 'edit';
        noEditFlag = 'edit';
        procedureData = 'no-checked';
        $('.tap-btn-wrap .saveoption').css('display', 'flex');
        $('.tap-btn-wrap .saveoption .el-checkbox_input.editOption').removeClass('is-checked');
        $('#addBBasic_from .bom-add-new-item').css('background', '#ccc').attr('disabled', true);
        if (data.ppid == 0) {//顶级bom不发异步
            $('#showLog').show();
            setBomData(editData);
            getProcedure(function () {
                getBomRouteLine();
            });
            getProcedureSource(editData.item_no, editData.operation_id, editData.bom_tree.operation_ability);
            //物料清单分组
            if (editData.bom_group_id) {
                $('.el-form-item.bom_group').find('.el-select-dropdown-item[data-id=' + editData.bom_group_id + ']').click();
            }
        } else {
            getItemBomInfo(data.self_bom_id);
        }
    } else {//没有子项，进入添加
        // console.log(222);
        resetAllData();
        // console.log(data);
        setMaterialData(data);
    }
}

//删除树中的项
function deleteTreeItem(data, id, flag, replaceid) {
    if (flag == 'replace') {//删除替代物料
        data.children.forEach(function (item, index) {
            if (item.material_id == id) {
                actArray(data.children[index].replaces, 'material', replaceid);
            }
        });
    } else {//删除物料
        actArray(data.children, 'material', id);
    }
}

//为每一个子项加pid
function actParentTree(data) {
    data.son_material_id = [];
    if (data.replaces && data.replaces.length) {
        data.replaces.forEach(function (item) {
            item.son_material_id = [];
            if (item.children && item.children.length) {
                item.children.forEach(function (citem) {
                    item.son_material_id.push(citem.material_id);
                    actParentTree(item);
                });
            }
        });
    }
    if (data.children && data.children.length) {
        data.children.forEach(function (item) {
            item.ppid = data.material_id;
            data.son_material_id.push(item.material_id);
            actParentTree(item);
        });
    }
}

//为树添加层级
function actTreeLevel(data) {
    if (data.children && data.children.length) {
        data.children.forEach(function (item) {
            var level = data.level;
            item.level = level + 1;
            actTreeLevel(item);
        });
    }
}

//构造每一个子项的详细内容
function createMDetailInfo(data, flag, ppid, posnr) {
    var ele = $('#addExtend_from .bom_item_container'),
        eletap = ele.find('.el-tap-wrap'),
        topId = $('.bom-tree-item.top-item.realBOM').attr('data-post-id');
    var posnr = $('.item-name.bom-tree-item.realBOM.selected').attr('data-posnr');
    if (flag) {
        
        eletap.removeClass('edit').html('');
        if (data.replaces != undefined && data.replaces.length) {//有替代物料
            var span = `<span data-id="${data.material_id}" data-pid="${data.ppid}" class="el-tap el-ma-tap active">${data.name}&nbsp;&nbsp;<span class="hasReplace">替</span></span>`;
            eletap.append(span).addClass('edit');
            eletap.find('span:last-child').data('spanItem', data);
            data.replaces.forEach(function (item) {
                var span = `<span data-main-id="${data.material_id}" data-id="${item.material_id}" data-pid="${data.ppid}" class="el-tap el-ma-tap">${item.name}</span>`;
                eletap.append(span).addClass('edit');
                eletap.find('span:last-child').data('spanItem', item);
            });
        }
    }
    //基本信息
    ele.find('.mbasic_info .name span').html(data.name);
    ele.find('.mbasic_info .item_no span').html(data.item_no);
    ele.find('.mbasic_info .attr .show-material').attr({
        'data-id': data.material_id,
        'data-assembly': data.is_assembly || 0,
        'data-version': data.version
    });
    //工艺路线
    //阶梯用量
    var qtyBtn = '', qtyhtml = '', consumInput = '', consumtr = '';
    if (ppid == 0) {//顶级物料
        qtyhtml = '';
    } else {
        if (ppid == topId) {//bom的儿子
            qtyBtn = `<button type="button" class="bom-info-button add-qty" data-id="${data.material_id}" data-posnr="${data.POSNR}" data-bom-item-id="${data.bom_item_id || 0}">添加一行</button>`;
            consumInput = `<input type="number" style="width: 150px;"  class="bom-ladder-input total_consume" value="${data.total_consume || ''}">`;
        } else {//bom的孙子
            qtyBtn = '';
            data.total_consume == undefined || data.total_consume == '' ? consumInput = '' :
                consumInput = `<input type="number" readonly="readonly" style="width: 150px;"  class="bom-ladder-input total_consume" value="${data.total_consume}">`;
        }
        var qtytr = '';
     
        if (data.bom_item_qty_levels && data.bom_item_qty_levels.length) {
            data.bom_item_qty_levels.forEach(function (item) {
                if (ppid == topId) {
                    qtytr += `<tr class="tritem" data-bom-qty-id="${item.bom_item_qty_level_id}" data-bom-item-id="${item.bom_item_id}">
              <td><input type="number" style="width: 150px;" class="bom-ladder-input parent_min_qty" value="${item.parent_min_qty}"></td>
              <td><input type="number" style="width: 150px;" class="bom-ladder-input qty" value="${item.qty}"><span class="fa fa-minus-circle qty-close"></span></td>           
          </tr>`;
                } else {
                    qtytr += `<tr class="tritem" data-bom-qty-id="${item.bom_item_qty_level_id}">
              <td>${item.parent_min_qty}</td>
              <td>${item.qty}</td>           
          </tr>`;
                }
            });
        }
        qtyhtml = qtyBtn.length || qtytr.length ? `<div class="bom_blockquote qty">
        <h3>阶梯用量 ${qtyBtn}</h3>
        <div class="basic_info qty" style="display: ${qtytr.length ? '' : 'none'};">
            <div class="table-container">
                <table class="bom_table qty_table">
                  <thead>
                    <tr>
                      <th class="thead">父项最小数量</th>
                      <th class="thead">用量</th>
                    </tr>
                  </thead>
                  <tbody class="t-body">${qtytr}</tbody>
                </table>
            </div>
        </div>
    </div>` : '';
    }
    ele.find('.bom_blockquote_wrap.qty').html(qtyhtml);

    //总单耗
    if (data.children && data.children.length) {
        data.children.forEach(function (item) {
            consumtr += `<tr class="tritem" data-id="${item.material_id}">
            <td><p class="show-material" data-id="${item.material_id}">${item.item_no}</p></td>
            <td>${item.name}</td>
            <td>${item.usage_number}</td>            
            <td>${item.unit}</td>            
        </tr>`;
        });
    }
    var consumhtml = consumInput.length || consumtr.length ? `<div class="bom_blockquote">
        <h3>总单耗</h3>
        ${consumInput}
        <div class="basic_info consum" style="display: ${consumtr.length ? '' : 'none'};">
          <div class="table-container">
            <table class="bom_table qty_table">
              <thead>
                <tr>
                  <th class="thead">物料编码</th>
                  <th class="thead">名称</th>
                  <th class="thead">使用数量</th>
                  <th class="thead">单位</th>
                </tr>
              </thead>
              <tbody class="t-body">${consumtr}</tbody>
            </table>
          </div>
        </div>
    </div>` : '';
    ele.find('.bom_blockquote_wrap.consum').html(consumhtml);
    //工艺路线
    $('#routing_graph').html('');
    get_routing_graph(bomShowData)
}

//工艺路线----start
function getOrderArr(list) {
    var list2 = changedata(list);

    //parent_id对应的序号关系数组
    var relation = [];
    var used_parentid = [];
    //结果表
    var final = [];
    final.push([0, 1]);
    //var final2 = [];
    var mother = 0;
    var incre = 1;
    for (var i = 0; i < list2.length; i++) {
        var tmp = [];
        if (list2[i].parent_id == 0) {
            tmp.push(list2[i].material_id);
            tmp.push(incre);
            relation.push(tmp);
            used_parentid.push(list2[i].material_id);
        } else {
            if (jQuery.inArray(list2[i].parent_id, used_parentid) != -1) {
                var order_pid = get_order_pid(list2[i].parent_id, relation);
                var tmp1 = [];
                tmp1.push(list2[i].material_id);
                var incre = incre + 1;
                tmp1.push(incre);
                relation.push(tmp1);
                used_parentid.push(list2[i].material_id);
                var tmp2 = [];
                tmp2.push(order_pid);
                tmp2.push(incre);
                final.push(tmp2);
            }
        }
    }
    return final;
}

function getOrderArrName(list) {
    var list2 = changedata(list);

    //parent_id对应的序号关系数组
    var relation = [];
    var used_parentid = [];
    //结果表
    //var final = [];
    var final2 = [];
    var mother = 0;
    var incre = 0;
    for (var i = 0; i < list2.length; i++) {
        var tmp = [];
        if (list2[i].parent_id == 0) {
            tmp.push(list2[i].material_id);
            tmp.push(0);
            relation.push(tmp);
            used_parentid.push(list2[i].material_id);
            final2.push({"operation": "<none>", "label": "root", "mode": "MODE_REQUIRED"}, {
                "operation": list2[i].name,
                "label": incre,
                "mode": "MODE_REQUIRED"
            });
        } else {
            if (jQuery.inArray(list2[i].parent_id, used_parentid) != -1) {
                var order_pid = get_order_pid(list2[i].parent_id, relation);
                var tmp1 = [];
                tmp1.push(list2[i].material_id);
                var incre = incre + 1;
                tmp1.push(incre);
                relation.push(tmp1);
                used_parentid.push(list2[i].material_id);

                var tmp3 = [];
                tmp3.push(incre);
                tmp3.push(list2[i].name);
                final2.push({"operation": list2[i].name, "label": incre, "mode": "MODE_REQUIRED"});
            }
        }
    }
    return final2;
}

function changedata(data) {
    var list2 = [];
    list2.push({
        "material_id": data.material_id,
        "name": data.name,
        "operation_name": data.operation_name, "parent_id": 0
    });

    function getdata(data) {
        if (data.children.length > 0) {
            for (var i in data.children) {
                list2.push({
                    "material_id": data.children[i].material_id, "name": data.children[i].name,
                    "operation_name": data.children[i].operation_name, "parent_id": data.material_id
                });
                //if(data.children[i].children.length > 0){
                //  getdata(data.children[i]);
                //}
            }
            for (var i in data.children) {
                if (data.children[i].children && data.children[i].children.length > 0) {
                    getdata(data.children[i]);
                }
            }
        }
    }

    getdata(data);
    // console.log(list2);
    return list2;

}

function get_order_pid(parent_id, relation) {
    for (var i = 0; i < relation.length; i++) {
        if (parent_id == relation[i][0]) {
            return relation[i][1];
        }
    }
    return 0;
}

function get_routing_graph(list) {
    var nodes_value = getOrderArrName(list);
    var edges_value = getOrderArr(list);
    var data = {
        "routing_graph":
            {"nodes": nodes_value, "edges": edges_value},
        "success": 1
    };
    var routingGraph = new emi2cRoutingGraph('routing_graph', data.routing_graph, 500, 300);
    routingGraph.calcPositions();
    routingGraph.draw();

}

//工艺路线---end
//添加阶梯用量
function createQtyLevel(posnr, mid, bid, trlen) {
    var tr = `<tr class="tritem" data-posnr="${posnr}" data-bom-qty-id="_${mid}_${trlen + 1}" data-bom-item-id="${bid}">
            <td><input type="number" style="width: 150px;" class="bom-ladder-input parent_min_qty" value=""></td>
            <td><input type="number" style="width: 150px;" class="bom-ladder-input qty" value=""><span class="fa fa-minus-circle qty-close"></span></td>           
        </tr>`;
    $('.basic_info.qty').show().find('.qty_table .t-body').append(tr);
}

//获取id
function getIds(data, flag) {
    var ids = [];
    if (flag == 'material') {
        data.forEach(function (item) {
            ids.push(item.material_id);
        });
    } else if(flag == 'POSNR') {
        data.forEach(function (item) {
            ids.push(item.POSNR);
        });
    } else {
        data.forEach(function (item) {
            ids.push(item.attribute_definition_id);
        });
    }
    return ids;
}

//获取bomid
function getBomid(data) {
    var ids = [];
    data.forEach(function (item) {
        ids.push(item.bom_id);
    });

    return ids;
}

//操作数组
function actArray(data, flag, id) {
    var ids = getIds(data, flag);
    var index = ids.indexOf(Number(id));
    data.splice(index, 1);
}

//添加扩展数据
function addExtendData(id, ppid, replaceid) {
    var maConEle = $('.bom_item_container'),
        newData = {
            bom_item_qty_levels: [],
            total_consume: maConEle.find('.total_consume').length && maConEle.find('.total_consume').val().trim() || ''
        };
    if (maConEle.find('.basic_info.qty').is(':visible') && maConEle.find('.parent_min_qty').length) {
        maConEle.find('.basic_info.qty .tritem').each(function () {
            var parent_min_qty = $(this).find('.parent_min_qty').val().trim(),
                qty = $(this).find('.qty').val().trim();
            if (parent_min_qty != '' && qty != '') {
                var qtyobj;
                if (mActionFlag == 'add') {
                    qtyobj = {
                        bom_item_posnr: 0,
                        bom_item_qty_level_id: 0,
                        bom_item_id: 0,
                        parent_min_qty: parent_min_qty,
                        qty: qty
                    };
                } else {
                    qtyobj = {
                        bom_item_posnr: $(this).attr('data-posnr'),
                        bom_item_qty_level_id: $(this).attr('data-bom-qty-id'),
                        bom_item_id: $(this).attr('data-bom-item-id'),
                        parent_min_qty: parent_min_qty,
                        qty: qty
                    };
                }
                newData.POSNR = $(this).attr('data-posnr');
                newData.bom_item_qty_levels.push(qtyobj);
            }
        });
    }
    go = true;
    actTree(bomShowData, id, ppid, newData, replaceid);
}

//填充扩展数据操作
function actExtendData() {
    var former = $('.item-name.bom-tree-item.realBOM.selected');
    //顶级物料的儿子才操作数据
    if (former.attr('data-pid') != $('.bom-tree-item.top-item.realBOM').attr('data-post-id')) {
        return false;
    }
    if (former.find('span').length) {//有替代物料,具体到替代物料的tab
        var reformer = $('.el-ma-tap.active'),
            reformerMId = reformer.attr('data-main-id'),
            reformerPId = reformer.attr('data-pid'),
            reformerREId = reformer.attr('data-id');
        reformerMId == undefined ? addExtendData(reformerREId, reformerPId) : addExtendData(reformerMId, reformerPId, reformerREId);
    } else {
        var formerMId = former.attr('data-post-id'),
            formerPId = former.attr('data-pid');
        addExtendData(formerMId, formerPId);
    }
}

//校验常规
function checkBasic() {
    var correct = 1;
    for (var type in validatorConfig) {
        if (type == 'attr' && validatorConfig[type] == '') {
            correct = 1;
        } else {
            correct = validatorConfig[type] &&
                validatorToolBox[validatorConfig[type]]($('#' + type));
        }
        if (!correct) {
            break;
        }
    }
    checkTopBom(correct);
}

//校验顶级bom
function checkTopBom(correct) {
    if (correct) {
        $('#addExtend_from .extend_wrap').show();
        var existData = JSON.parse(JSON.stringify(bomShowData));
        existData.children == undefined ? existData.children = [] : null;
        bomShowData = {};
        createExistBomData(existData);
    } else {
        $('#addExtend_from .extend_wrap').hide();
    }
}

//设计bom发布前检查
function releaseBeforeCheck(id, bomId) {

    AjaxClient.get({
        url: URLS['bomAdd'].releaseCheck + "?" + _token + '&material_id=' + id + '&bom_no=' + bom_no,
        dataType: 'json',
        success: function (rsp) {
            if (rsp.results) {
                if (rsp.results.num == 0) {
                    layer.confirm('将执行发布操作?', {
                        icon: 3, title: '提示', offset: '250px', end: function () {
                        }
                    }, function (index) {
                        bomAct(bomId, 'release', 1);
                        layer.close(index);
                    });
                } else {
                    layer.confirm(`有${rsp.results.num}个BOM含有该子项，将会被同步更新，是否继续?`, {
                        icon: 3, title: '提示', offset: '250px', end: function () {
                        }
                    }, function (index) {
                        bomAct(bomId, 'release', 1);
                        layer.close(index);
                    });
                }
            }
        },
        fail: function (rsp) {
            console.log('获取物料清单分组失败');
        }
    }, this);
}

//检查开始和结束对应关系
function checkSE() {
    var alltr = $('.route-tbody').find('tr.step-tr.step-check');
    if (alltr.length % 2 == 1) {
        // console.log('开始和结束不对应');
        //禁用按钮
        $('.route-tbody').find('.ma_item_add,.create-out').addClass('is-disabled');
        $('.route-tbody').find('.ma_item_add,.create-out').css("pointer-events", "none");
    } else {
        $('.route-tbody').find('.ma_item_add,.create-out').removeClass('is-disabled');
        $('.route-tbody').find('.ma_item_add,.create-out').css("pointer-events", "auto");
        //判断是不是一个开始一个结束相邻
        alltr.each(function (cindex, citem) {
            if (cindex == 0) {//第一个节点
                var ckinput = $(citem).find('.s-e-check.is-checked');
                if (ckinput.hasClass('start')) {//开始
                    if ($(alltr[cindex + 1]).find('.s-e-check.is-checked').hasClass('end')) {
                        $('.route-tbody').find('.ma_item_add,.create-out').removeClass('is-disabled');
                        $('.route-tbody').find('.ma_item_add,.create-out').css("pointer-events", "auto");
                    } else {//开始后面还是开始
                        $('.route-tbody').find('.ma_item_add,.create-out').addClass('is-disabled');
                        $('.route-tbody').find('.ma_item_add,.create-out').css("pointer-events", "none");
                    }
                } else {//没有开始，禁用按钮
                    $('.route-tbody').find('.ma_item_add,.create-out').addClass('is-disabled');
                    $('.route-tbody').find('.ma_item_add,.create-out').css("pointer-events", "none");
                }
            } else if (cindex == alltr.length - 1) {//最后一个节点
                var ckinput = $(citem).find('.s-e-check.is-checked');
                if (ckinput.hasClass('end')) {//结束
                    if ($(alltr[cindex - 1]).find('.s-e-check.is-checked').hasClass('start')) {
                        $('.route-tbody').find('.ma_item_add,.create-out').removeClass('is-disabled');
                        $('.route-tbody').find('.ma_item_add,.create-out').css("pointer-events", "auto");
                    } else {//结束前面还是结束
                        $('.route-tbody').find('.ma_item_add,.create-out').addClass('is-disabled');
                        $('.route-tbody').find('.ma_item_add,.create-out').css("pointer-events", "none");
                    }
                } else {//没有结束，禁用按钮
                    $('.route-tbody').find('.ma_item_add,.create-out').addClass('is-disabled');
                    $('.route-tbody').find('.ma_item_add,.create-out').css("pointer-events", "none");
                }
            } else {//中间节点
                var before = $(alltr[cindex - 1]),
                    after = $(alltr[cindex + 1]);
                var ckinput = $(citem).find('.s-e-check.is-checked');
                if (ckinput.hasClass('start')) {//开始
                    if (before.find('.s-e-check.is-checked').hasClass('end')
                        && after.find('.s-e-check.is-checked').hasClass('end')) {
                        $('.route-tbody').find('.ma_item_add,.create-out').removeClass('is-disabled');
                        $('.route-tbody').find('.ma_item_add,.create-out').css("pointer-events", "auto");
                    } else {//前后节点不对
                        $('.route-tbody').find('.ma_item_add,.create-out').addClass('is-disabled');
                        $('.route-tbody').find('.ma_item_add,.create-out').css("pointer-events", "none");
                    }
                } else {//结束
                    if (before.find('.s-e-check.is-checked').hasClass('start')
                        && after.find('.s-e-check.is-checked').hasClass('start')) {
                        $('.route-tbody').find('.ma_item_add,.create-out').removeClass('is-disabled');
                        $('.route-tbody').find('.ma_item_add,.create-out').css("pointer-events", "auto");
                    } else {//前后节点不对
                        $('.route-tbody').find('.ma_item_add,.create-out').addClass('is-disabled');
                        $('.route-tbody').find('.ma_item_add,.create-out').css("pointer-events", "none");
                    }
                }
            }
        });
    }
}

function actRoutes(routing_info) {
    if (newroutingGraph != null) {
        newroutingGraph.routingGraph.nodes.forEach(function (nitem) {
            
            if (nitem.iroutes) {
               
                nitem.iroutes.forEach(function (nritem) {
                    routing_info.push(nritem);
                });
            }
        });
    }
    console.log(routing_info, 'routing_info===');
}

function setStep() {
    var ele = $('.route_overflow tbody.route-tbody');
    ele.html('');
   
    var flag = 'update';
    rnodes.iroutes = rnodes.iroutes || [];

    if(!rnodes.iroutes.length) {
        var noneHtml = '<tr><td colspan="11" style="text-align: center;">暂无数据</td></tr>';
        $('.route-tbody').html(noneHtml);
    }
    rnodes.iroutes.forEach(function (step, index) {
        createStpe(step, index, ele, flag);
    });
    setTimeout(function () {
        rnodes.iroutes.forEach(function (ritem, index) {
            var uniqueId = ritem.field_id + '_' + Number(index + 1);
            var rele = $('.step-tr[data-step-id=' + uniqueId + ']');
            if (ritem.is_start_or_end == 1) {//单步骤
                rele.find('.route_item .bottom').append('<span class="create-out">生成出料</span>');
            } else if (ritem.is_start_or_end == 2) {//开始
                rele.find('.s-e-check.start').click();
            } else if (ritem.is_start_or_end == 3) {//结束
                rele.find('.s-e-check.end').click();
            }
            var mahtml = '';
            ritem.material_info.forEach(function (maitem) {
                var inclass = 'income', inname = '进料';
                if (maitem.type == 2) {
                    inclass = 'outcome';
                    inname = '出料';
                }

                mahtml += `<tr class="${inclass} mas" data-is-lzp="${maitem.is_lzp}" data-id="${maitem.material_id}" data-item-no="${maitem.item_no}" data-type="${maitem.type}" data-json='${JSON.stringify(maitem)}'>
                      <td><span class="">${maitem.item_no}</span><span class="name_flow">(${maitem.name || ''})</span></td>
                      <td><input type="text" class="el-input el-input-num" value="${maitem.usage_number || ''}"><span class="unit-format">[${maitem.commercial}]</span><p style="color:red"></p></td>
                      <td><span class="${inclass}">${inname}</span></td>
                      <td><input type="text" class="describe" style="width: 100px;height: 25px" value="${maitem.desc}"></td>
                      <td><i class="fa fa-times-circle outcome icon-delete ma-delete" data-id="${maitem.material_id}"></i>
                          <span class="caret-wrapper">
                              <i class="sort-caret ascending up"></i>
                              <i class="sort-caret descending down"></i>
                          </span>
                      </td>
                  </tr>`;
            });
            rele.find('.route_item .select_route tbody').html(mahtml);
            rele.find('.ma-textarea').val(ritem.comment);
            if(ritem.workcenters){
                ritem.workcenters.forEach(function(witem){
                    var workcenterId=witem;
                    rele.find('.el-form-item.ma-workcenters_wrap .el-select-dropdown-item[data-id=' + workcenterId + '] .route-ab-check').click();
                })
            }
            if (ritem.operation_ability_ids) {
                ritem.operation_ability_ids.split(',').forEach(function (aitem) {
                    rele.find('.el-form-item.ma-ability_wrap .el-select-dropdown-item[data-id=' + aitem + '] .route-ab-check').click();
                });
            }
            setTimeout(function () {
                if (ritem.select_type) {
                    rele.find('.mode-wrap .mode-check').eq(ritem.select_type - 1).click();
                }
            }, 20);
            imgchecks = [];
            if (ritem.drawings && ritem.drawings.length) {
                var imgs = '', imgchecks = ritem.drawings;
                imgchecks.forEach(function (item) {
                    imgs += `<p><img data-img-id="${item.drawing_id}" src="/storage/${item.image_path}" width="80" height="40"><i class="fa fa-times-circle img-delete" data-img-id="${item.drawing_id}"></i></p>`;
                });
                rele.attr('data-imgs', JSON.stringify(imgchecks)).find('.img-wrap').html(imgs);
            }
            if (ritem.attachments && ritem.attachments.length) {
                var attchs = '';
                ritem.attachments.forEach(function (titem) {
                    attchs += `<p><a href="/storage/${titem.path}" download="${titem.filename}">${titem.filename}</a><i class="fa fa-times-circle attch-delete" data-attch-id="${titem.attachment_id}"></i></p>`;
                });
                rele.attr('data-attch', JSON.stringify(ritem.attachments)).find('.attch-wrap').html(attchs);
            }
        });
    }, 100);
}

function bindEvent() {

    // 弹窗下拉
    $('body').on('click','#select_type_code .el-select',function(){
        $(this).find('.el-input-icon_routing').toggleClass('is-reverse');
        $(this).siblings('.el-select-dropdown').toggle();
        var width=$(this).width();
        var offset=$('#select_type_code').offset();
        var offset_page=$('.div-all-wrap').offset();
        $(this).siblings('.el-select-dropdown:not(.other-info)').width(width).css({top: 50,left:0});
        $(this).siblings('.el-select-dropdown.other-info').width(width).css({top: 50});

    });

    //下拉选择
    $('body').on('click','#select_type_code .el-select-dropdown-item',function(e){
        e.stopPropagation();
        $(this).parent().find('.el-select-dropdown-item').removeClass('selected');
        $(this).addClass('selected');
        if($(this).hasClass('selected')){
            var ele=$(this).parents('.el-select-dropdown').siblings('.el-select');
            ele.find('.el-input').val($(this).text());
            ele.find('.val_id').val($(this).attr('data-id'));
        }
        var  that = $(this),flag=false;

        controlCode={
            routing_node_id:current_click_routing_node_id,
            operation_id:current_click_operation_id,
            control_code:$(this).attr('data-id')
        }
        choose_code.forEach(function (item) {
            if(item.ruoting_node_id==controlCode.routing_node_id){
                flag=true;
            }
        });

        if(flag){
            choose_code.forEach(function (item) {
                if(item.ruoting_node_id==controlCode.ruoting_node_id){
                    item.control_code= that.attr('data-id');
                }
            })

        }else {
            controlCode.control_code= $(this).attr('data-id');
            choose_code.push(controlCode);
        }

        $(this).parents('.el-select-dropdown').hide().siblings('.el-select').find('.el-input-icon_routing').removeClass('is-reverse');
    });
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

    // $(document).click(function (e) {
    //     var obj = $(e.target);
    //     if (!obj.hasClass('el-select-dropdown-wrap') && obj.parents(".el-select-dropdown-wrap").length === 0) {
    //         $('.el-select-dropdown').slideUp().siblings('.el-select').find('.el-input-icon').removeClass('is-reverse');
    //     }
    //     // if(!obj.hasClass('.searchModal')&&obj.parents(".searchModal").length === 0){
    //     //     $('#searchForm .el-item-hide').slideUp(400,function(){
    //     //         $('#searchForm .el-item-show').css('background','transparent');
    //     //     });
    //     //     $('.arrow .el-input-icon').removeClass('is-reverse');
    //     // }
    // });

    //保存工艺路线
    function checkSaveRoute() {
        
        var routing_info = [];
        if ($('#route_id').val() != '') {//校验数量必填和已挂bom的工序有能力
            if ($('.route-tbody tr').length){
                // if ($('.route_item tbody tr').length) {
                    var nodesfalg = actrnodes();
                    if (!nodesfalg) {
                        return false;
                    }
                // } 
            }else{
                var nodesfalg = actrnodes();
                if (!nodesfalg) {
                    return false;
                }
            }
        }
        
        actRoutes(routing_info);
     
        var routings = [];
        if($('.route-lists .el-tag[data-status = 1]').length==0){
            $('#addRoute_form .route-lists').find('.route-tag').eq(0).click();
        }
        
        $('.route-lists .route-tag').each(function () {
            var spanobj = {
                id: $(this).attr('data-route-id'),
                name: $(this).attr('data-name')
            };
            if($('.route-lists .el-tag').length == 1){
                var routeObj = {
                    routing_id: $(this).attr('data-route-id'),
                    is_default: 1,
                    factory_id: $(this).attr('data-factoryId')
                }
            }else{
                var routeObj = {
                    routing_id: $(this).attr('data-route-id'),
                    is_default: $(this).attr('data-status'),
                    factory_id: $(this).attr('data-factoryId')
                }
            }
            routings.push(routeObj);
        });
        
        if (!$('.route-lists .route-tag[data-route-id=' + $('.el-form-item.route-line #route_id').val() + ']').length) {
            var sobj = {
                id: $('.el-form-item.route-line #route_id').val(),
                name: $('.el-form-item.route-line .el-input').val()
            }
            var isDefault = 0;
            if($('.route-lists .route-tag').length == 0){
                isDefault = 1;
            }
            var route_obj = {
                routing_id: $('.el-form-item.route-line #route_id').val(),
                is_default:isDefault,
                factory_id:$('.el-form-item.route-line #route_id').attr('data-factoryId')
            }
            routings.push(route_obj);
        }
        
       
        if(routing_info.length) {
            routing_info.forEach(function(item, index) {
                if(item.material_info.length) {
                    item.material_info.forEach(function(item, index) {
                        if(item.type == '2') {
                            item.POSNR = '';
                        }
                    })
                }
            });
        }
       
        var ajaxRouteData = {
            _token: TOKEN,
            bom_id: $('.bom-tree-item.allBOM.selected').attr('data-bom-id'),
            routing_id: $('.el-form-item.route-line #route_id').val(),
            routing_info: JSON.stringify(routing_info),
            routings: JSON.stringify(routings)
        };
    
        saveRoute(ajaxRouteData);
    }

    $('body').on('click', '.save-route', function (e) {
        e.stopPropagation();
        e.preventDefault();
        $(this).addClass('preventRedraw');
        //校验工艺路线
        checkSaveRoute();

    });
    //删除工艺路线列表
    $('body').on('click', '.el-tag.route-tag .fa-close', function (e) {
        e.stopPropagation();
        e.preventDefault();
        var that = $(this);
        console.log('将执行删除工艺路线操作');
        layer.confirm('将执行删除工艺路线操作?', {
            icon: 3, title: '提示', offset: '250px', end: function () {
            }
        }, function (index) {
            var routeId = that.attr('data-route-id');
            var obj = {
                factory_id: that.parent().attr('data-factoryid'),
                is_default: that.parent().attr('data-status'),
                routing_id: that.parent().attr('data-route-id')
            };
            deleteRoute(routeId, obj);
            layer.close(index);
        });

    });

    // 双击工艺路线列表 
    $('body').on('dblclick', '.route-tag', function () {
        var bomId = $('.item-name.bom-tree-item.allBOM.selected').attr('data-bom-id');
        var routingId = $(this).attr('data-route-id');
        AjaxClient.get({
            url: URLS['bomAdd'].getCanReplaceBom + '?' + _token + '&bom_id=' + bomId + '&routing_id=' + routingId,
            dataType: 'json',
            beforeSend: function () {
                layerLoading = LayerConfig('load');
            },
            success: function (rsp) {
                layer.close(layerLoading);
                var obj = [];
                obj = rsp.results;
                showDblRoute(obj, routingId);
            },
            fail: function (rsp) {
                layer.close(layerLoading);
                console.log('获取已选工艺路线信息失败');
            }
        }, this);
    });

    function showDblRoute(obj, currentRoutingId) {
        
        layer.open({
            type: 1,
            title: '工艺路线信息',
            offset: '100px',
            area: '800px',
            shade: 0.1,
            shadeClose: false,
            resize: false,
            move: '.layui-layer-title',
            content:`
            <form class="splitwo formModal formMateriel" style="overflow:hidden;">
                <div class="modal-wrap" style="max-height: 400px;overflow-y: auto; padding-right: 12px;">
                    <table class="uniquetable">
                        <thead><tr><th></th><th>工厂名称</th><th>工艺路线名称</th><th>组号</th><th>组数</th></tr></thead>
                        <tbody class="route-list-tbody">
                            <tr><td colspan="5" style="text-align: center;">暂无数据</td></tr>
                        </tbody>
                    </table>
                </div>
                <div style="margin-top: 20px;margin-bottom: 10px;float: right;overflow: hidden;">
                    <span class="errorMessage route-note" style="margin-right: 5px;display: inline-block;">请选择工艺路线</span>
                    <button type="button" class="el-button el-button--primary replace-route">确定</button>
                </div>
            </form> `,
            success: function (layero, index) {
                $('.route-note').hide();
                var routeList = '';
                if(obj.length) {
                    obj.forEach(function(item, index){
                        routeList+=`<tr class="route-item">
                            <td>
                                <span class="el-radio-input route-list-checked" data-id="${item.routing_id}">
                                    <span class="el-radio-inner"></span>
                                </span>
                            </td>
                            <td>${item.factory_name}</td>
                            <td>${item.routing_name}</td>
                            <td>${item.group_number}</td>
                            <td>${item.group_count}</td>
                        </tr>`;
                    });
                    $(".route-list-tbody").html(routeList);
                } 
                var needReplaceRoutingId = '';
                $('.route-list-tbody .route-list-checked').on('click', function() {
                    $('.route-note').hide();
                    needReplaceRoutingId = $(this).attr('data-id');
                    if (!$(this).hasClass('is-radio-checked')) {
                        $(this).addClass('is-radio-checked').parents('.route-item').siblings('.route-item').find('.route-list-checked').removeClass('is-radio-checked');
                    }
                });

                
                $('.replace-route').on('click', function () {
                    if(!needReplaceRoutingId) {
                        $('.route-note').show();
                        return;
                    } else {
                        $('.route-note').hide();
                    }
                    var replaceData = {
                        _token: TOKEN,
                        bom_id: bom_id,
                        current_routing_id: currentRoutingId,
                        need_replace_routing_id: needReplaceRoutingId
                    };
                    AjaxClient.post({
                        url: URLS['bomAdd'].replaceBomRoutingGn,
                        data: replaceData,
                        dataType: 'json',
                        beforeSend: function () {
                            layerLoading = LayerConfig('load');
                        },
                        success: function (rsp) {
                            layer.close(layerLoading);
                            layer.close(index);
                            LayerConfig('success',rsp.message);
                        },
                        fail: function (rsp) {
                            layer.close(layerLoading);
                            LayerConfig('fail',rsp.message);
                            console.log('替换工艺路线失败:'+rsp.message);
                        }
                    }, this);
                });
            }
        });
    };
    //点击工艺路线列表
    $('body').on('click', '.route-tag', function () {
        if (!$(this).hasClass('selected')) {
            $(this).addClass('selected').siblings('.el-tag').removeClass('selected');
            var routeId = $(this).attr('data-route-id');
            var groupId = $(this).attr('data-groupId');
            var factoryId = $(this).attr('data-factoryId');
            // console.log(routeId);
            $('#addRoute_form .route_overflow .route-tbody').html('<tr><td colspan="11" style="text-align: center;">暂无数据</td></tr>');
            $('#routing_graph_new').html('');
            $('.el-select-dropdown-list-factory .el-select-dropdown-item[data-id=' + factoryId + ']').click();
            $('.el-select-dropdown-list-group .el-select-dropdown-item[data-id=' + groupId + ']').click();
            $('.el-select-dropdown-list-route .el-select-dropdown-item[data-id=' + routeId + ']').click();
            getBomRoute(routeId);

            $('.bom_blockquote.route').find('span').html('');
            routeid = routeId;
        }
    });
    //步骤中开始结束点击
    $('body').on('click', '.check-group .s-e-check', function () {
        $(this).toggleClass('is-checked');
        if ($(this).hasClass('is-checked')) {
            $(this).siblings('.el-checkbox_input').removeClass('is-checked');
            $(this).parents('.step-tr').addClass('step-check');
            checkSE();
            if ($(this).hasClass('start')) {//作为开始工序
            } else if ($(this).hasClass('end')) {//作为结束工序
                $('.route-tbody').find('tr.step-tr').removeAttr('data-group-id');
                $(this).parents('.route-tbody').find('tr.step-tr').each(function () {
                    var checkele = $(this).find('.check-group .s-e-check.is-checked');
                    if (checkele.length) {
                        if (checkele.hasClass('start')) {
                            $(this).addClass('_group').nextAll().addClass('_group');
                            $(this).find('.route_item .bottom .create-out').remove();
                        } else if (checkele.hasClass('end')) {
                            if ($('tr.step-tr._group').length) {
                                var start = $('tr.step-tr._group').eq(0).attr('data-step-id'),
                                    end = $(this).attr('data-step-id');
                                $(this).nextAll().removeClass('_group');
                                var groupEle = $('tr.step-tr._group').attr('data-group-id', start + '-' + end);
                                groupEle.not(':last').find('.mode-wrap').html('');
                                // groupEle.not(':last-child').find('.img-add').html('');
                                groupEle.removeClass('_group');
                                if (!$(this).find('.mode-wrap').html()) {
                                    var modeHtml = `<span class="el-checkbox_input mode-check" data-index="1">
                               <span class="el-checkbox-outset"></span>
                               <span class="el-checkbox__label">一进料一流转品</span>
                            </span>
                            <span class="el-checkbox_input mode-check" data-index="2">
                               <span class="el-checkbox-outset"></span>
                               <span class="el-checkbox__label">一进料多流转品</span>
                            </span>
                            <span class="el-checkbox_input mode-check" data-index="3">
                               <span class="el-checkbox-outset"></span>
                               <span class="el-checkbox__label">多进料一流转品</span>
                            </span>
                            <span class="el-checkbox_input mode-check" data-index="4">
                               <span class="el-checkbox-outset"></span>
                               <span class="el-checkbox__label">多进料多流转品</span>
                            </span>`;
                                    $(this).find('.mode-wrap').html(modeHtml);
                                }
                                // if(!$(this).find('.img-add').html()){
                                //   $(this).find('.img-add').html('<span class="ma_item_img_add">编辑图纸</span>');
                                // }
                                var routeItem = $(this).find('.route_item');
                                routeItem.find('.create-out').length ? null : routeItem.find('.bottom').append('<span class="create-out">生成出料</span>');
                            } else {
                                console.log('没有选择开始，禁用按钮');
                            }
                        }
                    } else {
                        $(this).find('.route_item .bottom .create-out').remove();
                    }
                });
            }
        } else {
            $(this).parents('.step-tr').removeClass('step-check');
            checkSE();
        }
    });

    // 点击自定义步骤按钮 -- 选择做法字段弹框
    $('body').on('click', '.self-make-btn', function (e) {
        e.stopPropagation();
        e.preventDefault();
       
        // if ($('.route_item tbody tr').length) {
        //     var nodesfalg=actrnodes();
        //     console.log(rnodes, 'rnodes===');
        //     if(!nodesfalg){
        //         return false;
        //     }
        // }
          
        $(this).addClass('selected');
        $('.make_list_line_all').html('');
        $('.make_list_all .make-item').removeClass('selected');

        if ($(this).hasClass('is-disabled')) {
            return false;
        }
        if ($(this).attr('data-opid')) {
            chooseStep($(this).attr('data-opid'));
        }
    });

    //物料名称展示全
    var tip_index = '';
    $('body').on('mouseenter', '.name_flow', function () {
        var num = $(this).html();
        tip_index = layer.tips(num, this,
            {
                tips: [2, '#20A0FF'], time: 0
            });
    }).on('mouseleave', '.name_flow', function () {
        layer.close(tip_index)
    })

    $('body').on('mouseenter', '.show_desc_for_mack', function () {
        var msg = $(this).attr('data-fielddesc');
        if(msg!='' && msg!=undefined){
            desc_show = layer.tips(msg, this,
                {
                    tips: [2, '#20A0FF'], time: 0
                });
        }
    }).on('mouseleave', '.show_desc_for_mack', function () {
        layer.close(desc_show);
    })

    //能力描述展示全
    var desc_show='';
    $('body').on('mouseenter', '.show_description', function () {
        var msg = $(this).attr('data-desc');
        if(msg!=''){
            desc_show = layer.tips(msg, this,
                {
                    tips: [2, '#20A0FF'], time: 0
                });
        }
    }).on('mouseleave', '.show_description', function () {
        layer.close(desc_show);
    })

    var show_desc = '';
    $('body').on('mouseenter', '.show_desc', function () {
        var msg = $(this).parent().next().find('li.selected').attr('data-desc');
        if(msg!=''&&msg!= undefined){
            show_desc = layer.tips(msg, this,
                {
                    tips: [2, '#20A0FF'], time: 0
                });
        }
    }).on('mouseleave', '.show_desc', function () {
        layer.close(show_desc);
    })

    //进/出料数量验证
    $('body').on('blur', '.el-input.el-input-num', function () {
        var val = $(this).val();
        var reg = /^([1-9]\d{0,3})$|^\s*$|^(0|[1-9]\d{0,3})\.(\d{0,7})$/;
        var re = new RegExp(reg);
        // console.log(val);
        if (!re.test(val)) {
            $(this).parent().find('p').html('格式不正确');
            $('.el-button.el-button--primary.save-route').addClass('preventRedraw');
        } else {
            $(this).parent().find('p').html('');
            $('.el-button.el-button--primary.save-route').removeClass('preventRedraw');
        }
    })
    //做法点击
    $('body').on('click', '.make-item', function () {
        
        var makeid = $(this).attr('data-id');
        
        rnodes.ipractice_id = makeid;
        $('.el-button.self-make-btn').attr("data-num",makeid);
        $('.self-make-btn').removeClass('selected');
        $(this).addClass('selected').siblings('.make-item').removeClass('selected');
        
        if (!$(this).hasClass('is-disabled')) {
            
            $(this).addClass('is-disabled');
            // if (!$('.make_list_line_all').find('.line-check.is-checked').length) {
                
                getPracticeLine(makeid);
            // }
            if (rnodes.iroutes && rnodes.iroutes.length) {
                if (rnodes.iroutes[0].practice_id != makeid) {
                    getStep(makeid);
                    return false;
                }
                setStep();
            } else {
                getStep(makeid);
            }
        }
    });
    //选择进料
    $('body').on('click', '.ma_item_add', function () {
        bomItemArr = [];
        var ele = $(this).parent().siblings('.select_route').find('tbody');
        chooseMaterial(ele);
    });
    //生成出料
    $('body').on('click', '.create-out', function () {
        var pele = $(this).parents('.step-tr'), incomes = [];
        if (pele.attr('data-group-id')) {//步骤组
            var groupid = pele.attr('data-group-id'),
                groupele = $('.route-tbody').find('tr.step-tr[data-group-id=' + groupid + ']');
            groupele.each(function (gindex, gitem) {
                $(gitem).find('.select_route tr.income').each(function (index, iitem) {
                    incomes.push($(iitem).attr('data-id'));
                });
            });
        } else {//单步骤
            pele.find('.select_route tr.income').each(function (index, iitem) {
                incomes.push($(iitem).attr('data-id'));
            });
        }
        if (incomes.length) {
            getOutCome($(this), JSON.stringify(incomes));
        }
    });
    //删除进出料
    $('body').on('click', '.ma-delete', function () {
        $(this).parent().parent().remove();
    });
    $('body').on('click', '.selectMaterial_table .arrow:not(.noclick)', function (e) {
        e.stopPropagation();
        $(this).find('.el-icon').toggleClass('is-reverse');
        var that = $(this);
        that.addClass('noclick');
        if ($(this).find('.el-icon').hasClass('is-reverse')) {
            $(this).find('.el-icon').removeClass('is-reverse');
            $('#searchForm .el-item-show').css('background', '#e2eff7');
            $('#searchForm .el-item-hide').slideDown(400, function () {
                that.removeClass('noclick');
            });
        } else {
            $(this).find('.el-icon').addClass('is-reverse');
            $('#searchForm .el-item-hide').slideUp(400, function () {
                $('#searchForm .el-item-show').css('background', 'transparent');
                that.removeClass('noclick');
            });
        }
    });
    //弹窗关闭
    $('body').on('click', 'div.el-form-item-div.btn-group button.cancle', function (e) {
        e.stopPropagation();
        layer.close(layerModal);
    });

    $('body').on('click', '.bom-info-button', function (e) {
        // e.stopPropagation();
        e.preventDefault();
    });
    //tap切换按钮
    $('body').on('click', '.el-tap-wrap:not(.is-disabled) .el-tap', function () {
        if (!$(this).hasClass('active')) {
            if ($(this).hasClass('el-ma-tap')) {//替代物料相互切换
                actExtendData();
                $(this).addClass('active').siblings('.el-tap').removeClass('active');
                var data = $(this).data('spanItem'),
                    ppid = $(this).attr('data-pid');
                   
                createMDetailInfo(data, false, ppid);
            } else {
                var formerForm = $(this).siblings('.el-tap.active').attr('data-item');
                $(this).addClass('active').siblings('.el-tap').removeClass('active');
                var form = $(this).attr('data-item');
                if (form == 'addExtend_from') {
                    var correct = validatorToolBox[validatorConfig['material_id']]($('#material_id'));
                    checkTopBom(correct);
                    if ($('#showBomTree').text() == '显示列表项') {
                        showBomPic(bomShowData);
                    }
                }
                if (formerForm == 'addExtend_from') {//前一个active的tap是结构图，采集一下数据
                    actExtendData();
                }
                $('#' + form).parent().addClass('active').siblings('.el-panel').removeClass('active');
                tapFlag = form;
                tabClick(form);
            }
        }
    });
    //设计bom的发布按钮
    $('body').on('click', '.bom-info-button.publish:not(.noedit)', function () {
        
        //调发布的异步
        releaseBeforeCheck(topMaterial.material_id, $(this).attr('data-bom-id'));
    });
    //冻结和激活
    $('body').on('click', '.status-btn', function () {
        if ($(this).hasClass('freeze')) {
            layer.confirm('冻结所有版本?', {
                icon: 3, title: '提示', offset: '250px', end: function () {
                }
            }, function (index) {
                bomAct(bom_id, 'active', 0);
                console.log(isVersionOn,wasRelease,Status,Version);
                var msg=$('.el-form-item.version_release').html();
                // console.log(msg);
                var num=msg.substring(5,msg.indexOf('.'));
                // console.log(num);
                $('.el-form-item.version_release').html("当前版本:"+num+".0未激活,不可编辑");
                closeBtn();
                closeSave();
                layer.close(index);
            });
        } else {
            layer.confirm('将执行激活操作?', {
                icon: 3, title: '提示', offset: '250px', end: function () {
                }
            }, function (index) {
                bomAct(bom_id, 'active', 1)
                console.log(isVersionOn,wasRelease,Version);
                if (isVersionOn == 0 && wasRelease == 0 ) {
                    $('.el-form-item.version_release').html("当前版本:"+Version+".0未定版,可以编辑");
                    openBtn();
                    openSave();
                } else {
                    $('.el-form-item.version_release').html("当前版本:"+Version+".0已定版,不可编辑");
                    closeBtn();
                    closeSave();
                }
                layer.close(index);
            });
        }
    });
    $('body').on('click', '.el-select-dropdown-wrap', function (e) {
        e.stopPropagation();
    });
    //下拉框点击事件
    $('body').on('click', '.el-select:not(.other-info)', function (e) {
        e.stopPropagation();
        $(this).find('.el-input-icon').toggleClass('is-reverse');
        $(this).siblings('.el-select-dropdown').toggle();
    });
    //能力，工作中心下拉框item移出事件
    $('body').on('mouseleave','.el-select-dropdown.ability,.el-select-dropdown.workcenters',function(e){
        $(this).prev().click();
    })

    //下拉框item点击
    $('body').on('click', '.el-select-dropdown-item:not(.el-auto,.ability-item,.route-ability-item,.route-workcenter-item,.other-info)', function (e) {
        
        e.stopPropagation();
        $(this).parent().find('.el-select-dropdown-item').removeClass('selected');
        $(this).addClass('selected');
        if ($(this).hasClass('selected')) {
            var ele = $(this).parents('.el-select-dropdown').siblings('.el-select');
            var idval = Number($(this).attr('data-id').trim());
            var groupId = $(this).attr('data-groupId');
            var factoryId = $(this).attr('data-factoryID');
            // console.log(groupId);
            // if (idval == '') {
            //     $('#addRoute_form .bom_blockquote').hide();
            // }
            ele.find('.el-input').val($(this).text());
            ele.find('.val_id').val($(this).attr('data-id'));
            ele.find('.group_val_id').val($(this).attr('data-id'));
            ele.find('#route_id').attr('data-groupId',groupId);
            ele.find('#route_id').attr('data-factoryId',factoryId);
            ele.find('.factory_val_id').val($(this).attr('data-id'));
            if (ele.find('.val_id').attr('id') == 'route_id') {//工艺路线
                if (idval != '') {
                    $('#addRoute_form .bom_blockquote').show();
                    $('.bom_blockquote.route').find('span').html('')
                    rnodes = null;
                    getBomRoute(idval);
                    getProcedureShow(idval);
                    if($('.route-lists .el-tag[data-route-id = '+idval+'][data-factoryId = '+factoryId+']').length){
                        $('.route-lists .el-tag[data-route-id = '+idval+'][data-factoryId = '+factoryId+']').addClass('selected');
                        $('.route-lists .el-tag[data-route-id = '+idval+'][data-factoryId = '+factoryId+']').siblings('.el-tag').removeClass('selected');
                    }else{
                        $('.route-lists .el-tag').removeClass('selected');
                    }
                    routeid = idval;
                } else {
                    $('#addRoute_form .route_overflow .route-tbody').html('<tr><td colspan="11" style="text-align: center;">暂无数据</td></tr>');
                    // $('#routing_graph_new').html('');
                    $('.make_list_all').html('<p style="padding-left: 10px;">暂无数据</p>');
                    $('.make_list_line_all').html('');
                    // $('#addRoute_form .bom_blockquote').hide();
                }
            } else if ($(this).parents('.el-form-item').hasClass('imgSource')) {
                if ($('#searchImgAttr_from #img_source').val() && $('#searchImgAttr_from #type_id').val()) {
                    getImgSelectAttr($(this).attr('data-id'), $('#searchImgAttr_from #type_id').val());
                } else {
                    $('.el-form-item.template_attr .template_attr_wrap').html('');
                }
            } else if (ele.find('.val_id').attr('id') == 'material_category_id') {
                if ($(this).text() == '--请选择--') {
                    ele.parents('.el-form-item').find('.errorMessage').html('物料分类必填');
                } else {
                    ele.parents('.el-form-item').find('.errorMessage').html('');
                }
            } else if ($(this).parents('.el-form-item').hasClass('type')) {
                if ($('#searchImgAttr_from #img_source').val() && $('#searchImgAttr_from #type_id').val()) {
                    getImgSelectAttr($('#searchImgAttr_from #img_source').val(), $(this).attr('data-id'));
                } else {
                    $('.el-form-item.template_attr .template_attr_wrap').html('');
                }
                $('#searchImgAttr_from #group_id').val('').siblings('.el-input').val('--请选择--');
                $('#searchImgAttr_from #group_id').parents('.el-form-item.group').find('.el-select-dropdown-list').html('<li data-id="" class="el-select-dropdown-item kong" data-name="--请选择--">--请选择--</li>');
                if ($(this).attr('data-id')) {
                    getImgGroupType($(this).attr('data-id'));
                }
            }
        }
        $(this).parents('.el-select-dropdown').hide().siblings('.el-select').find('.el-input-icon').removeClass('is-reverse');
    });
    $('body').on('click', '#addRoute_form .el-form-item.route-line .el-select-dropdown-item', function () {
        $('.route_overflow .route-tbody').html('<tr><td colspan="11" style="text-align: center;">暂无数据</td></tr>');
    })

    //上一步按钮
    $('body').on('click', '.el-button.prev', function () {
        var prevPanel = $(this).attr('data-prev');
        if (prevPanel == 'addBBasic_from') {//离开扩展
            actExtendData();
        }
        $(this).parents('.el-panel').removeClass('active').siblings('.' + prevPanel).addClass('active');
        $('.el-tap[data-item=' + prevPanel + ']').addClass('active').siblings().removeClass('active');
        tapFlag = prevPanel;
        tabClick(prevPanel);
    });
    //下一步按钮
    $('body').on('click', '.el-button.next:not(.is-disabled)', function () {
        var nextPanel = $(this).attr('data-next');
        if (nextPanel == 'addExtend_from') {//离开常规
            var correct = validatorToolBox[validatorConfig['material_id']]($('#material_id'));
            checkTopBom(correct);
            if ($('#showBomTree').text() == '显示列表项') {
                showBomPic(bomShowData);
            }
        } else if (nextPanel == 'addBFujian_from') {//离开扩展
            actExtendData();
        }
        $(this).parents('.el-panel').removeClass('active').siblings('.' + nextPanel).addClass('active');
        $('.el-tap[data-item=' + nextPanel + ']').addClass('active').siblings().removeClass('active');
        tapFlag = nextPanel;
        tabClick(nextPanel);
    });
    //添加阶梯用量
    $('body').on('click', '.bom-info-button.add-qty', function () {
        var trlen = $(this).parents('.bom_blockquote.qty').find('.t-body .tritem').length;
        createQtyLevel($(this).attr('data-posnr'), $(this).attr('data-id'), $(this).attr('data-bom-item-id'), trlen);
    });
    //删除阶梯用量
    $('body').on('click', '.qty-close', function () {
        $(this).parents('tr').remove();
        if (!$('.basic_info.qty').find('.t-body tr').length) {
            $('.basic_info.qty').hide();
        }
    });
    //搜索按钮物料
    $('body').on('click', '.choose-search', function () {
        if ($(this).hasClass('choose-material')) {
            var parentForm = $('.addBomItem');
            var ele = $('.template_attr_wrap .attr_item'), _temp = [];
            if (ele.length) {
                $(ele).each(function (key, value) {
                    if ($(value).find('input').val() != '') {
                        var obj = {
                            attribute_definition_id: $(value).attr('data-id'),
                            value: $(value).find('input').val()
                        };
                        _temp.push(obj)
                    }

                })
            }

            if (itemAddFlag == 3) {
                pageNo = 1;
                ajaxTopData = {
                    material_category_id: parentForm.find('.item-name.selected').length && parentForm.find('.item-name.selected').attr('data-post-id') || '',
                    item_no: parentForm.find('#item_no').val(),
                    name: parentForm.find('#name').val(),
                    material_attributes: JSON.stringify(_temp),
                    order: 'desc',
                    sort: 'id'
                };
                $('#searchForm .el-item-hide').slideUp(400, function () {
                    $('#searchForm .el-item-show').css('background', 'transparent');
                    $('.arrow .el-input-icon').removeClass('is-reverse');
                });
                getTopMaterialList();

            } else {
                pageNo1 = 1;
                ajaxData = {
                    material_category_id: parentForm.find('.item-name.selected').length && parentForm.find('.item-name.selected').attr('data-post-id') || '',
                    item_no: parentForm.find('#item_no').val(),
                    name: parentForm.find('#name').val(),
                    material_attributes: JSON.stringify(_temp),
                    has_bom: parentForm.find('#has_bom').val(),
                    order: 'desc',
                    sort: 'id'
                };
                $('#searchForm .el-item-hide').slideUp(400, function () {
                    $('#searchForm .el-item-show').css('background', 'transparent');
                    $('.arrow .el-input-icon').removeClass('is-reverse');
                });
                getMaterialList(topMaterial.material_id);
            }
        }
    });
    //树中节点点击
    $('body').on('click', '.item-name:not(.noedit)', function () {
        var parele = $(this).parents('.bom_tree_container');
        if ($(this).hasClass('bom-tree-item')) {//bom的树
            if ($(this).hasClass('selected')) {
                return false;
            }
            if ($(this).hasClass('realBOM')) {
                actExtendData();
                parele.find('.item-name').removeClass('selected');
                $(this).addClass('selected');
                var id = $(this).attr('data-post-id'),
                    ppid = $(this).attr('data-pid');
                var posnr = $(this).attr('data-posnr');
                go = true;
                actTree(bomShowData, id, ppid,undefined,undefined, posnr);
            } else {
                parele.find('.item-name').removeClass('selected');
                $(this).addClass('selected');
                var id = $(this).attr('data-post-id'),
                    ppid = $(this).attr('data-pid');
                alltreego = true;
                actAllTree(bomTreeOld, id, ppid);
            }

        } else {
            var material_category_id = '';
            if ($(this).hasClass('selected')) {
                // parele.find('.item-name').removeClass('selected');
                // $(this).removeClass('selected');
                return false;
            } else {
                parele.find('.item-name').removeClass('selected');
                $(this).addClass('selected');
                material_category_id = $(this).attr('data-post-id');
                //获取模板
                //  console.log($(this).attr('data-template-id'))
                getMaterialTemplate($(this).attr('data-template-id'))
            }
            var parentForm = $('.addBomItem');

            var ele = $('.template_attr_wrap .attr_item'), _temp = [];
            if (ele.length) {
                $(ele).each(function (key, value) {
                    if ($(value).find('input').val() != '') {
                        var obj = {
                            attribute_definition_id: $(value).attr('data-id'),
                            value: $(value).find('input').val()
                        };
                        _temp.push(obj);
                    }

                })
            }

            if (itemAddFlag == 3) {
                if (!$(this).hasClass('selected')) {
                    template_ids = [];
                    $('.template_attr_wrap').html('')
                }
                pageNo = 1;
                ajaxTopData = {
                    material_category_id: material_category_id,
                    item_no: parentForm.find('#item_no').val(),
                    name: parentForm.find('#name').val(),
                    material_attributes: JSON.stringify(_temp),
                    order: 'desc',
                    sort: 'id'
                };
                getTopMaterialList();
            } else {
                if (!$(this).hasClass('selected')) {
                    template_ids = [];
                    $('.template_attr_wrap').html('')
                }
                pageNo1 = 1;
                ajaxData = {
                    material_category_id: material_category_id,
                    item_no: parentForm.find('#item_no').val(),
                    name: parentForm.find('#name').val(),
                    material_attributes: JSON.stringify(_temp),
                    has_bom: parentForm.find('#has_bom').val(),
                    order: 'desc',
                    sort: 'id'
                };
                getMaterialList(topMaterial.material_id);
            }
        }
    });
    //checkbox 点击
    $('body').on('click', '.el-checkbox_input:not(.noedit,.operation-check,.opab_check,.route-ab-check,.bom_check)', function (e) {
        e.preventDefault();
        if ($(this).hasClass('assembly-check')) {
            $(this).toggleClass('is-checked');
            var id = $(this).attr('data-id');
            if ($(this).hasClass('is-checked')) {//选择组装
                getBomTree(id, $(this).attr('data-version'));
            } else {//选择不组装
                var ids = getIds(materialData, 'material');
                var index = ids.indexOf(Number(id));
                materialData[index].children = [];
                $(this).parents('.ma-tritem').data('matableItem').children = [];
            }
        } else if($(this).hasClass('selectNo')){//选择组装bom
            $('table.chooseNo .selectNo').removeClass('is-checked');
            $(this).addClass('is-checked');

        } else if ($(this).hasClass('editOption')) {//升级版本或升级为制造bom
            $(this).toggleClass('is-checked');
            if ($(this).hasClass('is-checked')) {
                if(!(isVersionOn==0&&wasRelease==0&&Status==1)){
                    openBtn();
                    $('#addRoute_form .route-lists .fa.fa-close').css('pointer-events','auto');
                    $('#addRoute_form .route-lists .el-checkbox_input').css('pointer-events','auto');
                }
                noEditFlag = 'canEdit';
                // $('#addBBasic_from .bom-add-new-item').css('background-color', '#20a0ff').attr('disabled', false);
                createMaterialItem(materialData);
                $(this).parents('.saveoption').siblings().find('.el-checkbox_input').removeClass('is-checked');
            } else {
                if(!(isVersionOn==0&&wasRelease==0&&Status==1)){
                    closeBtn();
                    $('#addRoute_form .route-lists .fa.fa-close').css('pointer-events','none');
                    $('#addRoute_form .route-lists .el-checkbox_input').css('pointer-events','none');
                    noEditFlag = 'edit';
                    $('#addBBasic_from .bom-add-new-item').css('background', '#ccc').attr('disabled', true);
                    createMaterialItem(materialData);
                }

            }

        } else if (itemAddFlag == 3) {//选择物料
            $(this).addClass('is-checked').parents('.tritem').siblings('.tritem').find('.el-checkbox_input:not(.noedit)').removeClass('is-checked');
            topMaterial = $(this).parents('.tritem').data('materItem');
        } else if ($(this).hasClass('material-check') && itemAddFlag != 3) {//添加项
            $(this).toggleClass('is-checked');
            var ids = getIds(materialData, 'material');
            var data = $(this).parents('.tritem').data('materItem');
            if ($(this).hasClass('is-checked')) {
                if (ids.indexOf(data.material_id) == -1 && topMaterial.material_id != data.material_id) {
                    data.itemAddFlag = itemAddFlag;
                    if (itemAddFlag == 2) {//替换物料
                        // console.log($(this));
                        data.replaceItemId = replaceId;
                        var itemIndex = ids.indexOf(Number(replaceId));
                        materialData[itemIndex].replaceFlag = true;
                        materialData.splice(itemIndex + 1, 0, data);
                    } else {
                        materialData.push(data);
                    }
                }
            } else {
                var index = ids.indexOf(Number(data.material_id));
                index > -1 ? materialData.splice(index, 1) : null;
            }
        }
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

    //添加项
    $('body').on('click', '.bom-add-item:not(.is-disabled)', function () {
        if ($(this).hasClass('choose-material')) {
            itemAddFlag = 3;
        } else {
            var ele = $('.bom_table.item_table .t-body');
            materialData.forEach(function (item) {
                var id = item.material_id,
                    trele = ele.find('.ma-tritem[data-id=' + id + ']');
                item.loss_rate = trele.find('.loss_rate').val().trim();
                item.usage_number = trele.find('.usage_number').val().trim();
                item.comment = trele.find('.el-textarea').val();
                item.is_assembly = trele.find('.assembly-check.is-checked').length;
                item.version = trele.find('.assembly-check.is-checked').length;
                item.bom_no = $(this).find('.assembly-check.is-checked').length==0?'':item.bom_no;

            });
            if ($(this).hasClass('bom-button')) {//添加项
                itemAddFlag = 1;
            } else {//添加替换物料
                itemAddFlag = 2;
                replaceId = $(this).attr('data-id');
            }
        }
        addBomItemModal();
    });
    //删除
    $('body').on('click', '.bom-del', function () {
        var that = $(this);
        layer.confirm('将删除项?', {
            icon: 3, title: '提示', offset: '250px', end: function () {
            }
        }, function (index) {
            if (that.hasClass('bom-item-del')) {//删除项及下面的替代物料
                var ele = that.parents('.ma-tritem'),
                    id = that.attr('data-id');
                $('.ma-tritem.tr-replace[data-replace-id=' + id + ']').each(function () {
                    actArray(materialData, 'material', that.attr('data-id'));
                    $(this).remove();
                });
                actArray(materialData, 'material', id);
                if (bomShowData.material_id != undefined) {
                    deleteTreeItem(bomShowData, id, 'item');
                }
                ele.remove();
            } else if (that.hasClass('bom-replace-del')) {//删除替代物料
                var id = that.attr('data-replace-id'),
                    replaceid = that.attr('data-id');
                actArray(materialData, 'material', replaceid);
                if (bomShowData.material_id != undefined) {
                    deleteTreeItem(bomShowData, id, 'replace', replaceid);
                }
                that.parents('.ma-tritem').remove();
            }
            layer.close(index);
        });
    });
    //物料详细信息
    $('body').on('click', '.show-material', function () {
        if ($(this).hasClass("top-material")) {
            if ($(this).hasClass('mater-active')) {
                var id = topMaterial.material_id;
                getMaterialInfo(id, 'top');
            }
        } else {
            var id = $(this).attr('data-id');
            if ($(this).attr('data-has-bom') == 1) {
                var curversion = $(this).attr('data-version');
                getMaterialInfo(id, 'item', curversion);
            } else {
                getMaterialInfo(id, 'top');
            }
        }
    });
    $('body').on('click', '.bom-tap-wrap .bom-tap', function () {
        var form = $(this).attr('data-item');
        if (!$(this).hasClass('active')) {
            $(this).addClass('active').siblings('.bom-tap').removeClass('active');
            if (form == 'materialDesignBom_from') {
                var version = $(this).attr('data-version');
                getDesignBom($(this).attr('data-ma-id'), 'pop', version);
            }
            $('#' + form).addClass('active').siblings().removeClass('active');
        }
    });
    //输入框的相关事件
    $('body').on('focus', '.el-input:not([readonly])', function () {
        if (!$(this).hasClass('no-check')) {
            $(this).parents('.el-form-item').find('.errorMessage').removeClass('active').html("");
        }
    }).on('blur', '.el-input:not([readonly],.el-input-search)', function () {
        var name = '';
        if ($(this).hasClass('loss_rate')) {
            name = 'loss_rate';
        } else {
            name = $(this).attr("id")
        }
        validatorConfig[name]
        && validatorToolBox[validatorConfig[name]]
        && validatorToolBox[validatorConfig[name]]($(this))
        && remoteValidatorConfig[name]
        && remoteValidatorToolbox[remoteValidatorConfig[name]]
        && remoteValidatorToolbox[remoteValidatorConfig[name]](name);
    }).on('input', '.bom-ladder-input.parent_min_qty', function () {
        var that = $(this);
        var currentVal = $.trim(that.val());
        setTimeout(function () {
            if ($.trim(that.val()) === currentVal) {
                if ($.trim(that.val()) !== "") {
                    var allqty = [];
                    that.parents('.tritem').siblings('.tritem').each(function () {
                        allqty.push($(this).find('.bom-ladder-input.parent_min_qty').val().trim());
                    });
                    if (allqty.indexOf(currentVal) > -1) {//填写了相同的父项用量
                        LayerConfig('fail', '填写了相同的父项用量', function () {
                            that.val('');
                        });
                    }
                }
            }
        }, 500);
    });
    //下拉框的相关事件
    $('body').on('focus', '.el-select .el-input', function () {
        $(this).parents('.el-form-item').find('.errorMessage').removeClass('active').html("");
    }).on('blur', '.el-select .el-input', function () {
        var name = $(this).siblings('input').attr("id");
        var obj = $(this);
        setTimeout(function () {
            if (obj.siblings('input').val() == '') {
                validatorConfig[name]
                && validatorToolBox[validatorConfig[name]]
                && validatorToolBox[validatorConfig[name]](obj)
            } else {
                $('#' + name).parents('.el-form-item').find('.errorMessage').removeClass('active').html("");
            }
        }, 200);
    });

    //设计bom显示具体项
    $('body').on('click', '.materialInfo_container .tr-bom-item', function () {
        if (!$(this).hasClass('active')) {
            $(this).addClass('active').siblings('.tr-bom-item').removeClass('active');
            var id = $(this).attr('data-id'),
                version = $(this).attr('data-version');
            getDesignBomTree(id, version);
        }
    });
    //保存版本
    $('body').on('click', '.submit', function () {
       
        if ($(this).hasClass('ma-item-ok')) {
            // console.log(itemAddFlag);
            if (itemAddFlag == 3) {//选择物料
                if (topMaterial.material_id != undefined) {
                    if (topMaterial.material_id != $('#material_id').attr('data-id')) {//顶级物料改变，清空数据
                        bomShowData = {};
                        materialData = [];
                        $('.operation-wrap .el-input').val("--请选择--");
                        $('.ability_wrap .el-input').val("--请选择--");
                        $('.ability_wrap .ability ul').html(`<li data-id="" class="el-select-dropdown-item kong ability-item" data-name="--请选择--">--请选择--</li>`)
                        $('.ability_wrap .el-select').find('.el-input').val('--请选择--');
                        abilitySource = [];
                        operationSource = [];
                        $('#addBBasic_from .bom_table.item_table .t-body').html(`<tr>
                  <td class="nowrap" colspan="8" style="text-align: center;">暂无数据</td>
                </tr>`);
                    }
                    setTopMa();
                } else {
                    $('#material_id').val('').attr('data-id', '').data('topMaterial', {});
                    $('.bom-button.bom-add-new-item').addClass('is-disabled');
                    $('.el-form-item-label.show-material').removeClass('mater-active');
                    if (topMaterial.material_id != $('#material_id').attr('data-id')) {//顶级物料改变，清空数据
                        bomShowData = {};
                        materialData = [];
                        $('#addBBasic_from .bom_table.item_table .t-body').html(`<tr>
                  <td class="nowrap" colspan="8" style="text-align: center;">暂无数据</td>
                </tr>`);
                    }
                }
            } else {
                // console.log(materialData);
                createMaterialItem(materialData);//添加项
            }
            layer.close(layerModal);
        }
        // else if($(this).hasClass('assembly-item-ok')){
        //     var trele = $('table.chooseNo .selectNo.is-checked');
        //     var bomItemId = trele.attr('data-bomItemId'),
        //         bomNo = trele.attr('data-bomNo'),
        //         bomId = trele.attr('data-bomId'),
        //         Version = trele.attr('data-version');
        //     // console.log(bom_item_id,bom_id,version);
        //     var assemblyObj = {
        //         item_id : bomItemId,
        //         bom_no : bomNo,
        //         version : Version
        //     }
        //     //console.log(assemblyObj);
        //     getBomId(assemblyObj,bomId,bomItemId);
        // }
        else if ($(this).hasClass('save')) {//保存bom
            //先采集数据在做校验
            if ($('.tap-btn-wrap .el-tap.active').attr('data-item') == 'addBBasic_from') {//填充基础项信息
                var existData = JSON.parse(JSON.stringify(bomShowData));
                existData.children == undefined ? existData.children = [] : null;
                bomShowData = {};
                // return;
                createExistBomData(existData);
            } else if ($('.tap-btn-wrap .el-tap.active').attr('data-item') == 'addExtend_from') {//填充扩展
                actExtendData();
            }
            var correct = 1;
            for (var type in validatorConfig) {
                if (type == 'bom_children') {
                    correct = validatorConfig[type] &&
                        validatorToolBox[validatorConfig[type]](bomShowData);
                } else {
                    correct = validatorConfig[type] &&
                        validatorToolBox[validatorConfig[type]]($('#' + type));
                }
                if (!correct) {
                    break;
                }
            }
            if (correct) {
                if (mActionFlag == 'edit') {//编辑

                    if ($(this).siblings('.saveoption').find('.el-checkbox_input').hasClass('is-checked')) {//升级版本 --制造bom的编辑
                        if ($(this).siblings('.saveoption').find('.el-checkbox_input.upgrade').hasClass('is-checked')) {
                            confirmUpgrade('upgrade');
                        }
                        if ($(this).siblings('.saveoption').find('.el-checkbox_input.up-to-product').hasClass('is-checked')) {
                            confirmUpgrade('up-to-product');
                        }
                    } else {
                        // bomShowData.children.forEach(function(val,index){
                        //     val.version = 0;
                        // })
                        createBomSendData(bomShowData);
                        ajaxSubmitData.is_upgrade = 0;
                        // var routings=[];
                        // $('.route-lists .route-tag').each(function () {
                        //   var spanobj={
                        //     id: $(this).attr('data-route-id'),
                        //     name: $(this).attr('data-name')
                        //   };
                        //   routings.push(spanobj.id);
                        // });
                        // ajaxSubmitData.routings=JSON.stringify(routings);
                        layer.confirm('是否已经保存工艺文件?', {
                            icon: 3, title: '提示', offset: '250px', end: function () {
                            }
                        }, function (index) {
                            bomEdit();
                            layer.close(index);
                        });
                    }
                } else {
                    createBomSendData(bomShowData);
                    // console.log(bomShowData);
                    bomStore();
                }
            } else {//必填字段不正确
                $('.el-tap[data-item=addBBasic_from]').click();
                if (!bomChildrenCorrect) {
                    LayerConfig('fail', '物料清单必须有子项');
                }
            }
        } else if ($(this).hasClass('confirm-ok')) {//填写版本描述
            var version_description = $(this).parents('.confirm_upgrade').find('#version_description').val().trim();
            if (version_description == '') {
                $(this).parents('.confirm_upgrade').find('.errorMessage').html('版本描述必填');
                return false;
            }
            if (version_description.length>190) {
                $(this).parents('.confirm_upgrade').find('.errorMessage').html('版本描述必须在200字以内');
                return false;
            }
            if ($(this).hasClass('upgrade')) {
                createBomSendData(bomShowData);
                ajaxSubmitData.version_description = version_description;
                ajaxSubmitData.is_upgrade = 1;
                var current_routing_info = [], routing_info = [],
                    routing_id = $('.el-form-item.route-line #route_id').val();
                if ($('#route_id').val() != '') {//校验数量必填和已挂bom的工序有能力
                    // if ($('.route_item tbody tr').length) {
                        var nodesfalg = actrnodes();
                        if (!nodesfalg) {
                            return false;
                        }
                    // }
                }
                if($('.route-lists .route-tag').length == 0){
                    var is_default = 1;
                }else{
                    if($('.route-lists .el-tag.route-tag[data-route-id=' + routing_id +']').length){
                        var is_default = $('.route-lists .el-tag.route-tag[data-route-id=' + routing_id +']').attr('data-status');
                    }else{
                        var is_default = 0;
                    }
                }

                // console.log(is_default);
                actRoutes(routing_info);
                routing_info = JSON.stringify(routing_info);
                var factoryId=$('#route_id').attr('data-factoryId');
                current_routing_info = {"routing_id": routing_id, "routing_info": routing_info,'is_default': is_default,'factory_id':factoryId,control_info:JSON.stringify(choose_code)};
                ajaxSubmitData.current_routing_info = current_routing_info;
                // var routings=[];
                // $('.route-lists .route-tag').each(function () {
                //   var spanobj={
                //     id: $(this).attr('data-route-id'),
                //     name: $(this).attr('data-name')
                //   };
                //   routings.push(spanobj);
                // });
                // ajaxSubmitData.routings=JSON.stringify(routings);

                layer.confirm('是否升级版本?', {
                    icon: 3, title: '提示', offset: '250px', end: function () {
                    }
                }, function (index) {
                    bomEdit();
                    layer.close(index);
                });
            } else {
                createBomProductData(bomShowData);
                ajaxSubmitData.version_description = version_description;
                bomProductSubmit();
            }
            layer.close(layerModal);
        }
    });

    /*制造bom*/
    $('body').on('click', '#addMakeBom_from .bom-info-button.view', function (e) {

        var id = $(this).attr('data-id');
        var viewurl = $('#product_bom_view').val() + '?id=' + id;
        window.open(viewurl);

    })
    //显示树形图
    $('body').on('click', '.addExtend_from #showBomTree', function () {
        if (!$('.bom_container').hasClass('active')) {
            $(this).text('显示树形图');
            $('.bom_container').addClass('active').siblings('.bom_tree_wrap').removeClass('active')
        } else {
            actExtendData();//存储项的数据
            $(this).text('显示列表项');
            $('.bom_tree_wrap').addClass('active').siblings('.bom_container').removeClass('active');
            showBomPic(bomShowData);
        }
    });

    $('body').on('click', '#addMakeBom_from .bom-info-del', function (e) {
        var id = $(this).attr('data-id');
        $(this).parents('tr').addClass('active');

        layer.confirm('将执行删除操作?', {
            icon: 3, title: '提示', offset: '250px', end: function () {
                $('.uniquetable tr.active').removeClass('active');
            }
        }, function (index) {
            layer.close(index);
            deleteProductBom(id);
        });
    });

    $('body').on('click', '#addMakeBom_from .productLog', function (e) {
        var id = $(this).attr('data-id');
        if (productDifference.length) {
            productDifference.forEach(function (item, index) {
                if (id == item.key) {
                    showProductLogModal(item.value)
                }
            })
        }
    })
    /*制造bom*/
    $('body').on('click', '.operation-item', function () {
        $('.ability_wrap .el-select').find('.el-input').val('--请选择--');
        abilitySource = [];
        var _this = $(this);
        var _checkbox = $('.ability_wrap .ability ul');
        operationSource.forEach(function (item, index) {
            if (_this.attr('data-id') == '') {
                $('.ability_wrap .el-select').find('.el-input').val('--请选择--');
                $('.ability_wrap .ability ul').html(`<li data-id="" class="el-select-dropdown-item kong ability-item" data-name="--请选择--">--请选择--</li>`)
                abilitySource = [];
            }
            if (_this.attr('data-id') == item.operation_id) {
                _checkbox.html(`<li data-id="" class="el-select-dropdown-item kong ability-item" data-name="--请选择--">--请选择--</li>`)
                if (item.ability.length) {
                    item.ability.forEach(function (lity) {
                        var innerHtml = `<li data-id="${lity.id}" data-name="${lity.ability_name}" class="el-select-dropdown-item ability-item">
                                         <span class="el-checkbox_input operation-check" data-checkId="${lity.id}">
                                         <span class="el-checkbox-outset"></span>
                                         <span class="el-checkbox__label">${lity.ability_name}</span>
                                         </span>
                                    </li>`;
                        _checkbox.append(innerHtml)
                    })
                }
            }
        })
    });

    $('body').on('click', '.el-checkbox_input.route-ab-check', function () {
        if($(this).parents().hasClass('ma-ability_wrap')){
            var abele = $(this).parents('.ma-ability_wrap'),
                // ids = abele.find('.val_id').val().trim() ? abele.find('.val_id').val().trim().split(',') : [],  ---- cm
                ids = [];
                // workcenter_ids = [],
                // workcenter_names = [],
                abjson = [];
            // var lis=$(this).next().children();
            // if(lis.length>0){
            //     $(lis).each(function(key,val){
            //         workcenter_ids.push($(this).attr('data-wcid'));
            //         workcenter_names.push($(this).attr('data-wcname'));
            //     })
            // }
            // var workcenterNames = workcenter_names.join(',');
            // if(workcenterNames==''){
            //     workcenterNames='无';
            //     // $('.showwcnames').css('display','none');
            //
            // }
            // console.log(workcenterNames);
            // if (abele.attr('data-json')) {  // ------------- cm
            //     abjson = JSON.parse(abele.attr('data-json'));
            // } else {
            //     abjson = [];
            // }
            if (!$(this).hasClass('is-checked')) {
                $(this).addClass('is-checked').parents('.route-ability-item').siblings('.route-ability-item').find('.route-ab-check').removeClass('is-checked');
            }
           // $(this).toggleClass('is-checked');  ------------cm
            var id = $(this).attr('data-checkid');
            cname = $(this).attr('data-checkname');

            if ($(this).hasClass('is-checked')) {
                var obj = {
                    ability_id: id,
                    ability_name: cname,
                    // workcenter_names:workcenterNames,
                    // workcenter_ids : workcenter_ids
                };

                abjson.push(obj);
                ids.push(id);

            } else {
                var index = ids.indexOf(id);
                ids.splice(index, 1);
                abjson.splice(index, 1);
            }
            var names = [];
            
            abjson.forEach(function (item,index) {
                var i=index+1;
                names.push("<span style='background: #d2f8ce'><span style='display:inline-block;'>"+i+'.'+"</span>"+item.ability_name+"<br></span>");
            });
            abele.find('.val_id').val(ids.join(','));
            abele.attr('data-json', JSON.stringify(abjson));
            abele.find('.abs-name').html(names.join(''));
            if (ids.length) {
                abele.find('.el-input').val(ids.length + '项被选中');
            } else {
                abele.find('.el-input').val('--请选择--');
            }
        }
        if($(this).parents().hasClass('ma-workcenters_wrap')){
            var wcele = $(this).parents('.ma-workcenters_wrap'),
                // wcids = wcele.find('.val_id').val().trim() ? wcele.find('.val_id').val().trim().split(',') : [], // -------cm
                wcids = [];
                wcjson = [];
            // if (wcele.attr('data-json')) {
            //     wcjson = JSON.parse(wcele.attr('data-json'));
            // } else {
            //     wcjson = [];
            // }
            if (!$(this).hasClass('is-checked')) {
                $(this).addClass('is-checked').parents('.route-workcenter-item').siblings('.route-workcenter-item').find('.route-ab-check').removeClass('is-checked');
            }
            // $(this).toggleClass('is-checked');
            var id = $(this).attr('data-checkid');
            cname = $(this).attr('data-checkname');
            ccode = $(this).attr('data-checkcode');

            if ($(this).hasClass('is-checked')) {
                var obj = {
                    workcenter_id: id,
                    workcenter_name: cname,
                    workcenter_code: ccode
                };

                wcjson.push(obj);
                wcids.push(id);

            } else {
                var index = wcids.indexOf(id);
                wcids.splice(index, 1);
                wcjson.splice(index, 1);
            }
            var names = [];
           
            wcjson.forEach(function (item,index) {
                var i=index+1;
                names.push("<span style='background: #fffcdc'><span style='display:inline-block;'>"+i+'.'+"</span>"+item.workcenter_name+"<br></span>");
            });
            wcele.find('.val_id').val(wcids.join(','));
            wcele.attr('data-json', JSON.stringify(wcjson));
            wcele.find('.workcenters-name').html(names.join(''));
            if (wcids.length) {
                wcele.find('.el-input').val(wcids.length + '项被选中');
            } else {
                wcele.find('.el-input').val('--请选择--');
            }
            var currentTr = $(this).parents().find('.step-tr');
            var centersList = workCenters[currentTr.attr('data-field-id')];
            var devicesList = [];
            var deviceHtml = '无';
            var liDevice = '';
            var deviceId = '';
            var workcenterId = '';
            var currentDeviceName = '';
            var selectDevice = '--请选择--';
            centersList.forEach(function(item) {
                if(String(item.workcenter_id) == String(id)) {
                    devicesList = item.element_list;
                }
            });
            deviceId = $(this).parents('.step-tr').find('td.step-device').attr('data-device-id');
            workcenterId = $(this).parents('.step-tr').find('td.step-device').attr('data-workcenter-id');
            
            if(devicesList.length) {
                var state = true;
                devicesList.forEach(function(item) {
                    
                    if (String(item.device_id) == String(deviceId) && String(id) == String(workcenterId)) {
                        state = false;
                        selectDevice = '1项被选中';
                        currentDeviceName = `<span style='background: #fffcdc'><span style='display:inline-block;'>1.</span>${item.device_name}<br></span>`;
                        liDevice += `<li data-id="${item.device_id}" data-name="${item.device_name}" data-workcenter_id="${item.workcenter_id}" class="el-select-dropdown-item route-device-item" style="height:auto;">
                            <span class="el-checkbox_input route-device-check is-checked" data-checkid="${item.device_id}" data-checkname="${item.device_name}">
                                <span class="el-checkbox-outset"></span>
                                <span class="el-checkbox__label show_description" data-desc="${item.device_name}">${item.device_name || '--'}</span>  
                            </span>
                        </li>`;
                    } else {
                       
                        liDevice += `<li data-id="${item.device_id}" data-name="${item.device_name}" data-workcenter_id="${item.workcenter_id}" class="el-select-dropdown-item route-device-item" style="height:auto;">
                            <span class="el-checkbox_input route-device-check" data-checkid="${item.device_id}" data-checkname="${item.device_name}">
                                <span class="el-checkbox-outset"></span>
                                <span class="el-checkbox__label show_description" data-desc="${item.device_name}">${item.device_name || '--'}</span>  
                            </span>
                        </li>`;
                    }
                });
                if(state) {
                    selectDevice = '--请选择--';
                    currentDeviceName = '';
                    workcenterId = '';
                }
                
                deviceHtml =`<div class="el-form-item ma-device_wrap" data-json="[{}]">
                    <p class="device-name">${currentDeviceName}</p>
                    <div class="el-form-item-div">
                        <div class="el-select-dropdown-wrap" style="pointer-events: auto;">
                            <div class="el-select">
                                <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                <input type="text" style="color: #333;background: none!important;" readonly="readonly" class="device-input" value="${selectDevice}">
                                <input type="hidden" class="device-val" value="${deviceId}">                                
                            </div>
                            <div class="el-select-dropdown device-lists" style="width: auto; display: none;">
                                <ul class="el-select-dropdown-list">
                                    <li data-id="" class="el-select-dropdown-item kong route-workcenter-item" data-name="--请选择--">--请选择--</li>
                                    ${liDevice}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>`;
            }
            
            $(this).parents('.step-tr').find('td.step-device').html(deviceHtml);
        }

    })

    $('body').on('click', '.el-checkbox_input.route-device-check', function () {
        if (!$(this).hasClass('is-checked')) {
            $(this).addClass('is-checked').parents('.route-device-item').siblings('.route-device-item').find('.route-device-check').removeClass('is-checked');
            var deviceId = $(this).attr('data-checkid');
            var deviceName = $(this).attr('data-checkname');
            $(this).parents('.ma-device_wrap').find('.device-val').val(deviceId);
            $(this).parents('.ma-device_wrap').find('.device-input').val('1项被选中');
            $(this).parents('.ma-device_wrap').find('.device-name').html(`<span style='background: #fffcdc'><span style='display:inline-block;'>1.</span>${deviceName}<br></span>`);
            $(this).parents('.ma-device_wrap').find('.device-lists').hide();
            $(this).parents().find('.step-tr td.step-device').attr('data-device-id', '');
        } else {
            $(this).removeClass('is-checked');
            $(this).parents('.ma-device_wrap').find('.device-val').val('');
            $(this).parents('.ma-device_wrap').find('.device-input').val('--请选择--');
            $(this).parents('.ma-device_wrap').find('.device-name').html('');
            $(this).parents('.ma-device_wrap').find('.device-lists').hide();
            $(this).parents().find('.step-tr td.step-device').attr('data-device-id', '');
        } 
        
    });

    $('body').on('click', '.el-checkbox_input.operation-check', function () {
        $(this).toggleClass('is-checked');
        var id = $(this).attr('data-checkid');
        if ($(this).hasClass('is-checked')) {
            abilitySource.push(id);
        } else {
            for (var i = 0; i < abilitySource.length; i++) {
                if (id == abilitySource[i]) {
                    abilitySource.splice(i, 1);
                }
            }
        }
        if (abilitySource.length) {
            $('.ability_wrap .el-select').find('.el-input').val(abilitySource.length + '项被选中');
        } else {
            $('.ability_wrap .el-select').find('.el-input').val('--请选择--');
        }
    })

    $('body').on('click', '.el-checkbox_input.bom_check', function () {
        $(this).toggleClass('is-checked');
    });

    $('body').on('click', '.el-checkbox_input.opab_check,.el-checkbox_input.step_check', function () {
        $(this).toggleClass('is-checked');
    });
    $('body').on('click', '.el-checkbox_input.mode-check', function () {
        $(this).toggleClass('is-checked');
        if ($(this).hasClass('is-checked')) {
            $(this).siblings('.mode-check').removeClass('is-checked');
        }
    });

    $('body').on('click', '.ma_out_check', function () {
        $(this).toggleClass('is-checked');
        if ($(this).hasClass('is-checked')) {
            $(this).parent().siblings('.ma-item-li').find('.el-checkbox_input').removeClass('is-checked');
        }
    });

    $('body').on('blur', '#edit_usage_num', function () {
        var reg1 = "^[0-9]+.([0-9])+$", reg2 = "^[0-9]+/([0-9])+$", reg3 = "^[0-9]+$";
        var _reg1 = new RegExp(reg1), _reg2 = new RegExp(reg2), _reg3 = new RegExp(reg3);
        var value = $(this).val(), test = _reg1.test(value) || _reg2.test(value) || _reg3.test(value);
        if (!test) {
            $(this).val('')
        }
    })
}

//获取物料模板属性
function getMaterialTemplate(id, val) {

    if (id == 0 || id == undefined) {
        var ele = $('.el-form-item.template_attr .template_attr_wrap');
        ele.html('');
        return false;
    }
    AjaxClient.get({
        url: URLS['bomAdd'].materialTempAttr + '?' + _token + '&template_id=' + id,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            if (rsp.results && rsp.results.self) {
                var data = rsp.results.self;
                if (data.material_attributes && data.material_attributes.length) {
                    var ele = $('.el-form-item.template_attr .template_attr_wrap');
                    ele.html(' ');
                    data.material_attributes.forEach(function (item, index) {
                        var li = `<div class="attr_item" data-id="${item.attribute_definition_id}"><span>${item.name}</span><input type="text" value=""/></div>`;
                        ele.append(li)
                    });

                    if (val) {

                        setTimeout(function () {
                            val.forEach(function (item) {
                                $('.template_attr_wrap .attr_item[data-id=' + item.attribute_definition_id + ']').find('input').val(item.value);
                            });
                        }, 100)
                    }

                } else {
                    var ele = $('.el-form-item.template_attr .template_attr_wrap');
                    ele.html('')
                }
            }

        },
        fail: function (rsp) {
            layer.close(layerLoading);
            layer.msg('获取列表失败', {icon: 5, offset: '250px', time: 1500});
        }
    }, this);
}

//制造bom详情
function showProductLogModal(data) {

    var list = '',
        listObj = data && JSON.parse(data);

    if (listObj.length) {

        listObj.forEach(function (item, index) {
            var text = '', actionStyle = '';

            switch (item.action) {
                case "add":
                    actionStyle = "#20a0ff";
                    text = "添加";
                    break;
                case "delete" :
                    actionStyle = '#f00';
                    text = "删除";
                    break;
                case "update" :
                    actionStyle = '#449d44';
                    text = "更新";
                    break;
                default:
                    actionStyle = '#333';
                    text = "";
            }

            list += `<li><i class="fa fa-info-circle" style="color: #449d44;"></i>&nbsp;<span style="color:${actionStyle}">${text}</span>${item.desc}</li>`;

        })
    } else {
        list = `<li style="text-align: center;color:#666">暂无数据</li>`
    }

    layerModal = layer.open({
        type: 1,
        title: '详细信息',
        offset: '100px',
        area: '600px',
        shade: 0.1,
        shadeClose: true,
        resize: false,
        content: `<div class="product_log_contanier">
                     <ul>${list}</ul>
                 </div>`,
        success: function (layero, index) {

        },
        end: function () {
            $('.uniquetable tr.active').removeClass('active');
        }
    })
}

//tab点击发异步
function tabClick(panel) {
    $(window).scrollTop(0);
}

//已生成bom后修改项及顶级bom
function createExistBomData(existData) {
    console.log(existData, 'existData');
    var form1 = $('#addBBasic_from');
    bomShowData = form1.find('#material_id').data('topMaterial');
    bomShowData.ppid = 0;
    bomShowData.operation_id = form1.find('#basic_operation_id').val();
    bomShowData.operation_id == '' ? bomShowData.operation_name = '' : bomShowData.operation_name = form1.find('#basic_operation_id').siblings('.el-input').val();
    bomShowData.operation_ability = abilitySource.join(',');
    bomShowData.operation_ability_pluck = '';
    if (abilitySource.length) {
        operationSource.forEach(function (item, index) {
            if (item.operation_id == bomShowData.operation_id) {
                var obj = {};
                item.ability.forEach(function (aitem, index) {
                    if (abilitySource.indexOf(aitem.id.toString()) > -1) {
                        obj[aitem.id] = aitem.ability_name;
                    }
                });
                bomShowData.operation_ability_pluck = obj;
            }
        });
    }
    bomShowData.usage_number = form1.find('#qty').val();
    form1.find('.ma-tritem').each(function () {
        var data = $(this).data('matableItem');
        data.loss_rate = $(this).find('.loss_rate').val().trim();
        data.usage_number = $(this).find('.usage_number').val().trim();
        data.comment = $(this).find('.el-textarea').val();
        data.is_assembly = $(this).find('.assembly-check.is-checked').length;
        data.version = $(this).find('.assembly-check.is-checked').length;
        data.bom_no = $(this).find('.assembly-check.is-checked').length==0?'':data.bom_no;
        var existIds = getIds(existData.children, 'material');
        if ($(this).hasClass('tr-replace')) {//替代物料
            console.log('111')
            var existIndex = existIds.indexOf(Number($(this).attr('data-replace-id')));
            var replaceids = getIds(existData.children[existIndex].replaces, 'material');
            var replaceIndex = replaceids.indexOf(data.material_id);
            if (replaceIndex == -1) {//该替代物料为新增
                existData.children[existIndex].replaces.push(data);
            } else {//该替代物料已存在，修改该替代物料数据
                existData.children[existIndex].replaces[replaceIndex].loss_rate = data.loss_rate;
                existData.children[existIndex].replaces[replaceIndex].usage_number = data.usage_number;
                existData.children[existIndex].replaces[replaceIndex].comment = data.comment;
                existData.children[existIndex].replaces[replaceIndex].children = data.children || [];
                existData.children[existIndex].replaces[replaceIndex].is_assembly = data.is_assembly;
                existData.children[existIndex].replaces[replaceIndex].version = data.version;
                existData.children[existIndex].replaces[replaceIndex].bom_no = data.bom_no;
            }
        } else {
            var existIds = getIds(existData.children, 'POSNR');
            var existIndex = existIds.indexOf(data.POSNR);
           
            if (existIndex == -1) {//该项为新添加项
                data.replaces = [];
                existData.children.push(data);
            } else {//该项已存在，修改该项数据
                existData.children[existIndex].loss_rate = data.loss_rate;
                existData.children[existIndex].usage_number = data.usage_number;
                existData.children[existIndex].comment = data.comment;
                existData.children[existIndex].children = data.children || [];
                existData.children[existIndex].is_assembly = data.is_assembly;
                existData.children[existIndex].version = data.version;
                existData.children[existIndex].bom_no = data.bom_no;
            }
        }
    });
    bomShowData.children = existData.children;
    actParentTree(bomShowData);
    createRealBom(bomShowData, function (bomHtml) {
        $('#addExtend_from .bom-tree').html(bomHtml);
        setTimeout(function () {
            $('#addExtend_from .bom-tree').find('.item-name.bom-tree-item').eq(0).click();
        }, 200);
    }, 'realBOM');
}

//orgchart树形图
function showBomPic(data) {
    $('#orgchart-container').html('');
    var nodeTemplate = function (data) {
        var ability = '';
        if (data.operation_ability_pluck) {
            var abs = data.operation_ability_pluck;
            for (var type in abs) {
                ability += abs[type] + ',';
            }
        }
        return `<div class="title">
                   ${data.item_no}
                </div>
                <div class="content">
                    <p class="name" title="${data.name}"><span style="color: #666;">名称：</span>${data.name.length > 6 ? data.name.substring(0, 4) + '...' : data.name}</p>
                    <p class="name"><span style="color: #666;">数量：</span>${data.usage_number}${data.commercial != undefined ? '[' + data.commercial + ']' : ''}</p>
                    <p class="name"><span style="color: #666;">工序：</span>${tansferNull(data.operation_name)}</p>
                    <p class="name" title="${ability}"><span style="color: #666;">能力：</span>${ability.length > 6 ? ability.substring(0, 4) + '...' : ability}</p>
                </div>`;
    };
    $('#orgchart-container').orgchart({
        'data': bomShowData,
        'zoom': true,
        'pan': true,
        'depth': 99,
        'exportButton': true,
        'exportFilename': `物料${data.name}的树形图`,
        'nodeTemplate': nodeTemplate,
        'createNode': function ($node, data) {
            var replaceClass = data.replaces != undefined && data.replaces.length ? 'nodeReplace' : '';
            $node.addClass(replaceClass);
            if (data.bom_item_qty_levels && data.bom_item_qty_levels.length) {
                var secondMenuIcon = $('<i>', {
                    'class': 'fa fa-info-circle second-menu-icon',
                    'node-id': `${data.material_id}`,
                    click: function (e) {
                        e.stopPropagation();
                        var that = $(this);
                        if ($(this).siblings('.second-menu').is(":hidden")) {
                            $('.second-menu').hide();
                            $(this).siblings('.second-menu').show();
                        } else {
                            $(this).siblings('.second-menu').hide();
                        }
                    }
                });
                var trs = '';
                data.bom_item_qty_levels.forEach(function (item) {
                    trs += ` <tr>
                  <td>${item.parent_min_qty}</td>
                  <td>${item.qty}</td>
              </tr>`;
                });
                var table = `<table class="bordered">
                <tr>
                    <th> 父项最小数量 </th>
                    <th> 用量 </th>
                </tr>
                ${trs}            
          </table>`;
                var secondMenu = `<div id="second-menu" class="second-menu">${table}</div>`;
                $node.append(secondMenuIcon).append(secondMenu);
            }
        }
    });
}

//添加项弹层
function addBomItemModal() {
    var has_bom = '', width = 33;
    if (itemAddFlag != 3) {
        width = 30;
        has_bom = `<div class="el-form-item has_bom">
        <div class="el-form-item-div">
            <label class="el-form-item-label" style="width: 109px;">是否有BOM结构</label>
            <div class="el-select-dropdown-wrap">
                <div class="el-select">
                    <i class="el-input-icon el-icon el-icon-caret-top"></i>
                    <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                    <input type="hidden" class="val_id" id="has_bom" value="">
                </div>
                <div class="el-select-dropdown" style="position: absolute;">
                    <ul class="el-select-dropdown-list">
                        <li data-id="" class="el-select-dropdown-item kong" data-name="--请选择--">--请选择--</li>
                        <li data-id="1" class=" el-select-dropdown-item "><span>是</span></li>
                        <li data-id="0" class=" el-select-dropdown-item "><span>否</span></li>
                    </ul>
                </div>
            </div>
        </div>
    </div>`;
    }
    layerModal = layer.open({
        type: 1,
        title: '选择物料',
        offset: '100px',
        area: '1100px',
        shade: 0.1,
        shadeClose: false,
        resize: false,
        content: `<form class="addBomItem formModal" id="">
                      <div class="selectMaterial_container">
                        <div class="selectMaterial_tree">
                          <div class="bom_tree_container">
                              <div class="bom-tree"></div>
                          </div>
                        </div>
                        <div class="selectMaterial_table">
                          <div class="searchItem" id="searchForm">
                               <form class="searchMAttr searchModal formModal" id="searchBomAttr_from">
                                    <div class="el-item">
                                        <div class="el-item-show">
                                            <div class="el-item-align">
                                                <div class="el-form-item" style="">
                                                    <div class="el-form-item-div">
                                                        <label class="el-form-item-label" style="width: 109px;">物料编码</label>
                                                        <input type="text" id="item_no"  class="el-input" placeholder="" value="">
                                                    </div>
                                                </div>
                                                <div class="el-form-item" style="">
                                                    <div class="el-form-item-div">
                                                        <label class="el-form-item-label" style="width: 109px;text-align: center;">名称</label>
                                                        <input type="text" id="name"  class="el-input" placeholder="" value="">
                                                    </div>
                                                </div>
                                            </div>
                                            <!--<ul class="el-item-hide">
                                                <li>${has_bom}</li>
                                                <li>
                                                    <div class="el-form-item template_attr" style="">
                                                        <div class="el-form-item-div">
                                                            <label class="el-form-item-label" style="width: 109px;">物料模板属性</label>
                                                            <div class="template_attr_wrap clearfix">
                                                              
                                                            </div>
                                                            <input type="text" id="material_attr_id"  class="el-input" placeholder="" value="">
                                                        </div>
                                                    </div>
                                                </li>
                                            </ul>-->
                                        </div>
                                        <div class="el-form-item">
                                            <div class="el-form-item-div btn-group" style="margin-top: 10px;">
                                                <!--<span class="arrow el-select"><i class="el-input-icon el-icon el-icon-caret-top"></i></span>-->
                                                <button type="button" class="el-button choose-search choose-material">搜索</button>
                                            </div>
                                        </div>
                                    </div>
                               </form>
                          </div>
                          <div class="table-container select_table_margin">
                              <div class="table-container table_page">
                                    <div id="pagenation" class="pagenation"></div>
                                    <table class="bom_table">
                                      <thead>
                                        <tr>
                                          <th class="thead">选择</th>
                                          <th class="thead">物料编码</th>
                                          <th class="thead">名称</th>
                                          <th class="thead" style="display: ${itemAddFlag == 3 ? 'none' : ''}">BOM</th>
                                          <th class="thead">创建人</th>
                                          <th class="thead">物料分类</th>
                                        </tr>
                                      </thead>
                                      <tbody class="table_tbody">
                                      </tbody>
                                    </table>
                              </div>
                           </div>
                        </div>
                      </div>
                      <div class="el-form-item" style="margin-bottom: 10px;margin-right: 10px;">
                        <div class="el-form-item-div btn-group">
                            <button type="button" class="el-button el-button--primary ma-item-ok submit">确定</button>
                        </div>
                      </div>  
                </form>`,
        success: function (layero, index) {
            getCategory();
            if (itemAddFlag == 3) {
                getTopMaterialList();
            } else {
                getMaterialList(topMaterial.material_id);
            }
        },
        cancel: function (layero, index) {//右上角关闭按钮
            if (itemAddFlag != 3) {//添加项的关闭
                if (materialData.length > $('#addBBasic_from .item_table .ma-tritem').length) {
                    materialData = [];
                    $('.item_table .ma-tritem').each(function () {
                        materialData.push($(this).data('matableItem'));
                    });
                }
            } else {//选择物料的关闭
                topMaterial = $('#material_id').data('topMaterial') || {};
            }
        },
        end: function () {
            // pageNo=1;
            // pageNo1=1;
        }

    })
}

function actIncome(ele, bom_tree) {
    if (ele.find('.s-e-check.end.is-checked').length || ele.find('.create-out').length) {
        var absele = ele.find('.el-form-item.ma-ability_wrap'),
            abs = absele.find('.val_id').val();
        if (!abs) {//能力选择
            LayerConfig('fail', '请检查进料数量及出料能力选择');
            return false;
        }
    }
    if (ele.find('.s-e-check.start.is-checked').length || (ele.find('.create-out').length && ele.attr('data-group-id') == undefined)) {
        ele.find('.route_item tr.income').each(function (iindex, iitem) {
            if ($(iitem).find('.el-input.el-input-num').val().trim() == '') {
                LayerConfig('fail', '请检查进料数量及出料能力选择');
                return false;
            }
            var bomObj = {
                // bom_no : '',
                // bom_item_id: 0,
                // item_no: $(iitem).attr('data-item-no'),
                material_id: $(iitem).attr('data-id'),
                bom_unit_id: JSON.parse($(iitem).attr('data-json')).bom_unit_id,
                // loss_rate: '',
                // is_assembly: 0,
                usage_number: $(iitem).find('.el-input.el-input-num').val().trim(),
                // comment: '',
                // version: 0,
                // bom_item_qty_levels: [],
                // son_material_id: [],
                // total_consume: '',
                // replaces: [],

            };
            bom_tree.push(bomObj);
        });
    }
    return true;
}

//流转品名称
function exchangeModal(ele) {
    layerModal = layer.open({
        type: 1,
        title: '',
        offset: '100px',
        area: '400px',
        shade: 0.1,
        shadeClose: false,
        resize: false,
        content: `<form class="confirm_upgrade formModal" id="">
            <div class="el-form-item">
                <div class="el-form-item-div">
                    <label class="el-form-item-label" style="width: 120px;">流转品名称<span class="mustItem">*</span></label>
                    <input type="text" class="el-input" id="exchange-name">
                </div>
                <p class="errorMessage" style="padding-left: 80px;display: block;"></p>
            </div>
            <div class="el-form-item" style="margin-top: 10px;">
              <div class="el-form-item-div btn-group">
                  <button type="button" class="el-button el-button--primary exchange-ok">确定</button>
              </div>
            </div>       
      </form>`,
        success: function (layero, index) {
            $(layero).find('.exchange-ok').off('click').on('click', function () {
                var nameEle = $(layero).find('#exchange-name');
                if (nameEle.val().trim() == '') {
                    nameEle.parent().siblings('.errorMessage').html('流转品名称必填');
                } else {
                    var dataObj = {
                            _token: TOKEN,
                            bom_id: $('.bom-tree-item.allBOM.selected').attr('data-bom-id'),
                            name: $('#exchange-name').val().trim(),
                            material_category_id: '-1',
                            start_step_id: '',
                            end_step_id: '',
                            step_path: '',
                            routing_id: $('#route_id').val().trim(),
                            routing_node_id: '',
                            children: JSON.stringify([]),
                            practice_id: '',
                            operation_id: '',
                            operation_ability_ids: '',
                            workcenters:'',
                        },
                        step_path = [], bom_tree = [];
                    var ptrele = $(ele).parents('.step-tr'), createFlag = true;
                    //校验数量，出料能力是否全部选择
                    if (ptrele.attr('data-group-id')) {
                        var groupid = ptrele.attr('data-group-id');
                        dataObj.start_step_id = groupid.split('-')[0];
                        dataObj.end_step_id = groupid.split('-')[1];
                        $('.route-tbody').find('tr.step-tr[data-group-id=' + groupid + ']').each(function () {
                            step_path.push($(this).attr('data-step-id'));
                            var tFlag = actIncome($(this), bom_tree);
                            if (!tFlag) {
                                createFlag = false;
                                return false;
                            }
                        });
                        dataObj.step_path = step_path.join(',');
                    } else {
                        dataObj.end_step_id = dataObj.start_step_id = ptrele.attr('data-step-id');
                        dataObj.step_path = dataObj.end_step_id;
                        var tFlag = actIncome(ptrele, bom_tree);
                        if (!tFlag) {
                            createFlag = false;
                            return false;
                        }
                    }
                    if (createFlag) {
                        var pracele = $('.make_list_all .make-item.selected');
                        dataObj.material_category_id = ptrele.attr('data-cate-id') || '-1';
                        dataObj.routing_node_id = pracele.attr('data-node-id');
                        dataObj.operation_id = pracele.attr('data-opid');
                        dataObj.practice_id = pracele.attr('data-id');
                        dataObj.operation_ability_ids = ptrele.find('.el-form-item.ma-ability_wrap .val_id').val();
                        dataObj.workcenters = ptrele.find('.el-form-item.ma-workcenters_wrap .val_id').val();
                        dataObj.children = JSON.stringify(bom_tree);
                        createExchange(ele, dataObj);
                    }
                }
                layer.close(layerModal);
            });
        },
        cancel: function (layero, index) {//右上角关闭按钮
        },
        end: function () {
        }

    })
}

//版本升级弹层--制造bom
function confirmUpgrade(flag) {

    var title = '';
    if (flag == 'upgrade') {
        title = '填写版本描述';
    } else {
        title = '填写制造BOM描述'
    }

    layerModal = layer.open({
        type: 1,
        title: title,
        offset: '100px',
        area: '400px',
        shade: 0.1,
        shadeClose: false,
        resize: false,
        content: `<form class="confirm_upgrade formModal" id="">
      <div class="el-form-item">
          <div class="el-form-item-div">
              <label class="el-form-item-label" style="width: 100px;">版本描述<span class="mustItem">*</span></label>
              <textarea type="textarea" maxlength="200" id="version_description" rows="4" class="el-textarea" placeholder="请输入版本描述，最多只能输入200字"></textarea>
          </div>
          <p class="errorMessage" style="padding-left: 80px;display: block;"></p>
      </div>
      <div class="el-form-item" style="margin-top: 10px;">
        <div class="el-form-item-div btn-group">
            <button type="button" class="el-button el-button--primary confirm-ok submit ${flag}">确定</button>
        </div>
      </div>       
</form>`,
        success: function (layero, index) {
        },
        cancel: function (layero, index) {//右上角关闭按钮
        },
        end: function () {
        }

    })
}

//工艺路线添加出料
function chooseMaterialOut(ele, mas) {
    var height = ($(window).height() - 280) + 'px';
    layerModal = layer.open({
        type: 1,
        title: '选择出料',
        offset: '100px',
        area: '600px',
        shade: 0.1,
        shadeClose: false,
        resize: false,
        content: `<div class="material-out" id="material-out">
            <div class="el-form-item">
                <div class="el-form-item-div">
                    <label class="el-form-item-label">物料</label>
                    <div class="ma-item-wrap" style="max-height: ${height}">
                        <ul class="ma-item-ul">
                        </ul>
                    </div>
                </div>
            </div>
            <div class="el-form-item">
                <div class="el-form-item-div btn-group">
                    <button class="el-button el-button--primary create-ma-pop-out">生成流转品</button>
                    <button class="el-button el-button--primary choose-ma-pop-out">确定</button>
                </div>            
            </div>
        </div>`,
        success: function (layero, index) {
            mas.forEach(function (bitem) {
                var _bhtml = `<li data-id="${bitem.material_id}" class="ma-item-li">
                    <span class="el-checkbox_input ma_out_check">
                        <span class="el-checkbox-outset"></span>
                        <span class="el-checkbox__label">${bitem.name}</span>
                    </span>
                </li>`;
                $('#material-out').find('.ma-item-ul').append(_bhtml);
                $('#material-out').find('.ma-item-ul .ma-item-li:last-child').data('bitem', bitem);
            });
            $(layero).find('.create-ma-pop-out').off('click').on('click', function () {
                layer.close(layerModal);
                var dataObj = {
                        _token: TOKEN,
                        bom_id: $('.bom-tree-item.allBOM.selected').attr('data-bom-id'),
                        material_category_id: '-1',
                        start_step_id: '',
                        end_step_id: '',
                        step_path: '',
                        routing_id: $('#route_id').val().trim(),
                        routing_node_id: '',
                        children: JSON.stringify([]),
                        practice_id: '',
                        operation_id: '',
                        operation_ability_ids: '',
                        select_type: '',
                        operation_code: '',
                        drawings: JSON.stringify([]),
                        index: 0
                    },
                    step_path = [], bom_tree = [];
                var ptrele = $(ele).parents('.step-tr'), createFlag = true;
                //检验模式
                if (!ptrele.find('.mode-wrap .mode-check.is-checked').length) {
                    LayerConfig('fail', '请选择进/出料的模式');
                    return false;
                }
                //校验数量，出料能力是否全部选择
                if (ptrele.attr('data-group-id')) {
                    var groupid = ptrele.attr('data-group-id');
                    dataObj.start_step_id = groupid.split('-')[0].split('_')[0];
                    dataObj.end_step_id = groupid.split('-')[1].split('_')[0];
                    dataObj.index = groupid.split('-')[1].split('_')[1];
                    var startObj = {
                        start_step_path: dataObj.start_step_id,
                        index: groupid.split('-')[0].split('_')[1]
                    };
                    dataObj.start_child = JSON.stringify(startObj);
                    $('.route-tbody').find('tr.step-tr[data-group-id=' + groupid + ']').each(function () {
                        step_path.push($(this).attr('data-field-id'));
                        var tFlag = actIncome($(this), bom_tree);
                        if (!tFlag) {
                            createFlag = false;
                            return false;
                        }
                    });
                    dataObj.step_path = step_path.join(',');
                } else {
                    dataObj.end_step_id = dataObj.start_step_id = ptrele.attr('data-field-id');
                    dataObj.step_path = dataObj.end_step_id;
                    dataObj.index = ptrele.attr('data-step-id').split('_')[1];
                    var startObj = {
                        start_step_path: dataObj.start_step_id,
                        index: dataObj.index
                    };
                    dataObj.start_child = JSON.stringify(startObj);
                    var tFlag = actIncome(ptrele, bom_tree);
                    if (!tFlag) {
                        createFlag = false;
                        return false;
                    }
                }
                if (createFlag) {
                    var pracele = $('.make_list_all .make-item.selected'),
                        drawings = [];
                    if (!pracele.length) {
                        pracele = $('.self-make-btn');
                    }
                    if (ptrele.attr('data-imgs')) {
                        var sdrawings = JSON.parse(ptrele.attr('data-imgs'));
                        sdrawings.forEach(function (ditem) {
                            var dobj = {
                                drawing_id: ditem.drawing_id,
                                code: ditem.code,
                                name: ditem.name,
                                image_path: ditem.image_path,
                                comment: ''
                            };
                            drawings.push(dobj);
                        });
                    }
                    if (!drawings.length) {
                        LayerConfig('fail', '请选择生成流转品的图纸');
                        return false;
                    }
                    dataObj.material_category_id = ptrele.attr('data-cate-id') || '-1';
                    dataObj.routing_node_id = pracele.attr('data-node-id');
                    dataObj.operation_id = pracele.attr('data-opid');
                    dataObj.select_type = ptrele.find('.mode-wrap .mode-check.is-checked').index() + 1;
                    dataObj.practice_id = pracele.attr('data-id');
                    dataObj.operation_code = pracele.attr('data-opcode');
                    dataObj.operation_ability_ids = ptrele.find('.el-form-item.ma-ability_wrap .val_id').val();
                    dataObj.drawings = JSON.stringify(drawings);
                    dataObj.children = JSON.stringify(bom_tree);
                    createExchange(ele, dataObj);
                }
                // exchangeModal(ele);
            });
            $(layero).find('.choose-ma-pop-out').off('click').on('click', function () {
                var pele = ele.parents('.route_item').find('.select_route tbody');
                var selectele = $(layero).find('.el-checkbox_input.is-checked');
                if (selectele.length) {
                    var oitem = selectele.parents().data('bitem');
                    var tr = `<tr class="outcome mas" data-is-lzp="${oitem.is_lzp || 0}" data-id="${oitem.material_id}" data-item-no="${oitem.item_no}" data-type="2" data-json='${JSON.stringify(oitem)}'>
                    <td><span class="">${oitem.item_no}</span><span class="name_flow">(${oitem.name || ''})</span></td>
                    <td><input type="text" class="el-input el-input-num" value="${oitem.usage_number || 1}"><span class="unit-format">[${oitem.commercial}]</span><p style="color:red"></p></td>
                    <td><span class="outcome">出料</span></td>
                    <td><input type="text" class="describe" style="width: 100px;height: 25px" ></td>
                    <td>
                        <i class="fa fa-times-circle outcome icon-delete ma-delete" data-id="${oitem.material_id}"></i>
                        <span class="caret-wrapper">
                            <i class="sort-caret ascending up"></i>
                            <i class="sort-caret descending down"></i>
                        </span>
                    </td>
                </tr>`;
                    pele.append(tr);
                    layer.close(layerModal);
                }
            });
        },
        cancel: function (layero, index) {//右上角关闭按钮
        },
        end: function () {
        }

    })
}

//工艺路线的添加进料
function chooseMaterial(ele) {
    var height = ($(window).height() - 280) + 'px';
    layerModal = layer.open({
        type: 1,
        title: '选择物料',
        offset: '100px',
        area: '800px',
        shade: 0.1,
        shadeClose: false,
        resize: false,
        content: `<div class="material-route" id="material-route">
             <div class="table-page">
                <div  style="max-height: ${height};padding: 10px 0;overflow-y: auto;margin-bottom: 20px; padding-right: 20px;">
                <table class="uniquetable">
                    <thead><tr><th></th><th>物料名称</th><th>物料编码</th><th>sap行项目号</th><th>物料属性</th><th>附件</th><th>操作</th></tr></thead>
                    <tbody class="income-tbody"></tbody>
                </table>
                </div>
                <div class="el-form-item">
                  <div class="el-form-item-div btn-group" style="margin-right: 0px">
                      <button class="el-button el-button--primary choose-bom-pop">确定</button>
                  </div>            
                </div>
             </div>          
        </div>`,
        success: function (layero, index) {
            $('body').off('click', '.choose-bom-pop').on('click', '.choose-bom-pop', function () {
                var trs = '';
                $(layero).find('.el-checkbox_input.is-checked').each(function (index, eitem) {
                    var bitem = $(eitem).parents('.income-tr').data('bitem');
                    trs += `<tr class="income mas" data-id="${bitem.material_id}" data-is-lzp="${bitem.is_lzp || 0}" data-type="1" data-json='${JSON.stringify(bitem).replace(/\'/g,"&rsquo;")}'>
                    <td><span class="">${bitem.item_no}</span><span class="name_flow">(${bitem.name || ''})</span></td>
                    <td><input type="text" class="el-input el-input-num" value="${bitem.usage_number || 1}"><span class="unit-format">[${bitem.commercial || ''}]</span><p style="color:red"></p></td>
                    <td><span class="income">进料</span></td>
                    <td><input type="text" class="describe" style="width: 100px;height: 25px" value="${bitem.desc && bitem.desc != '' ? bitem.desc : ''}"></td>
                    <td>
                        <i class="fa fa-times-circle income icon-delete ma-delete" data-id="${bitem.material_id}"></i>
                        <span class="caret-wrapper">
                            <i class="sort-caret ascending up"></i>
                            <i class="sort-caret descending down"></i>
                        </span>
                    </td>
                </tr>`;
                });
                ele.parents('.route_item').find('.select_route tbody').append(trs);
                layer.close(layerModal);
                var trele = ele.parents('.step-tr'),
                    btnwrap = trele.find('.route_item .bottom');
                if (trele.attr('data-group-id')) {//有组id
                    var groupId = trele.attr('data-group-id'),
                        groupele = $('.route-tbody tr[data-group-id=' + groupId + ']'),
                        endgroup = groupele.eq(groupele.length - 1);
                    endgroup.find('.create-out').length ? null : endgroup.find('.bottom').append('<span class="create-out">生成出料</span>');
                } else if (trele.attr('data-group-id') == undefined) {//单独的步骤
                    btnwrap.find('.create-out').length ? null : btnwrap.append('<span class="create-out">生成出料</span>');
                }
            });
            getIncome(bomShowData);
        },
        cancel: function (layero, index) {//右上角关闭按钮
        },
        end: function () {
        }

    })
}

//工艺路线的添加步骤
function chooseStep(id) {
    var height = ($(window).height() - 280) + 'px';
    var num=$('.el-button.self-make-btn').attr('data-num');
   
    layerModal = layer.open({
        type: 1,
        title: '选择做法字段',
        offset: '100px',
        area: '600px',
        shade: 0.1,
        shadeClose: false,
        resize: false,
        content: `<div class="step-route" id="step-route">
                <div class="el-form-item category">
                  <div class="el-form-item-div">
                     <label class="el-form-item-label" style="width: 80px;">物料分类<span class="mustItem">*</span></label>
                     <div class="el-select-dropdown-wrap" style="width: 450px;">
                        <div class="el-select">
                          <i class="el-input-icon el-icon el-icon-caret-top is-reverse"></i>
                          <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                          <input type="hidden" class="val_id" id="material_category_id" value="">
                        </div>
                        <div class="el-select-dropdown" style="width: 450px;">
                            <ul class="el-select-dropdown-list">
                                <li data-id="" data-pid="" class="el-select-dropdown-item kong" data-name="--请选择--">--请选择--</li>           
                            </ul>
                        </div>
                     </div>
                  </div>
                  <p class="errorMessage" style="display: block;padding-left: 80px;"></p>
                </div>
              <div class="el-form-item">
                <div class="el-form-item-div">
                    <label class="el-form-item-label" style="width: 80px;">做法字段</label>
                    <div class="ma-item-wrap" style="max-height: ${height};margin-top: 0;">
                        <ul class="ma-item-ul">
                        </ul>
                    </div>
                </div>
            </div>
              <div class="el-form-item">
                  <div class="el-form-item-div btn-group">
                      <button class="el-button el-button--primary choose-step-pop">确定</button>
                  </div>            
              </div>
            </div>`,
        success: function (layero, index) {
            //暂时注释
            if(selectedMaterialType.length) {
                selectedMaterialType.forEach(item => {
                    if(item.nodeId == $('.self-make-btn').attr('data-node-id')) {
                        $('#step-route .el-input').val(item.name);
                        $('#step-route #material_category_id').val(item.val);
                    }
                })
            }

            $('body').off('click', '.choose-step-pop').on('click', '.choose-step-pop', function () {
                
                if ($('#step-route .el-input').val() == '--请选择--') {
                    $('#step-route .errorMessage').html('物料分类必填');
                    return false;
                } else {
                    let state = false;
                    if(selectedMaterialType.length) {
                        selectedMaterialType.forEach(item => {
                            if(item.nodeId == $('.self-make-btn').attr('data-node-id')) {
                                state = true;
                                item.name = $('#step-route .el-input').val();
                                item.val = $('#step-route #material_category_id').val();
                            }
                        })
                    }
                    if(!state) {
                        selectedMaterialType.push({
                            nodeId: $('.self-make-btn').attr('data-node-id'),
                            name: $('#step-route .el-input').val(),
                            val: $('#step-route #material_category_id').val()
                        });
                    }
                }
                
                var cateId = $('#step-route #material_category_id').val();
                var trele = $('.route_overflow .route-tbody');
                trele.html('');
                
                let practiceList = [];
                $('#step-route .step_check.is-checked').each(function (index, item) {
                    
                    var stepEle = $(this).parents('.ma-item-li'),
                        step = {
                            field_id: stepEle.attr('data-id'),
                            name: stepEle.attr('data-name'),
                            code: stepEle.attr('data-code'),
                            material_category_id: cateId,
                            field_description: stepEle.attr('data-fielddesc')
                            
                            // workcenters: JSON.parse(stepEle.attr('data-workcenters'))  //工作中心不从这里取，而是由工厂下的，工序节点去取
                        },
                        abs = '';
                        practiceList.push(step);

                    var workcentersHtml='',workcenterswrap='无';
                    
                    if ( workCenters[step.field_id]) {
                        workCenters[step.field_id].forEach(function (wcitem) {
                            workcentersHtml += `<li data-id="${wcitem.workcenter_id}" data-name="${wcitem.name}" class="el-select-dropdown-item route-workcenter-item" style="height:auto;">
                                               <span class="el-checkbox_input route-ab-check" data-checkid="${wcitem.workcenter_id}" data-checkname="${wcitem.name}" data-checkcode="${wcitem.code}">
                                                 <span class="el-checkbox-outset"></span>
                                                 <span class="el-checkbox__label show_description" data-desc="${wcitem.desc}">${wcitem.name}</span>  
                                               </span>
                                            </li>`;
                        });
                        workcenterswrap = `<div class="el-form-item ma-workcenters_wrap">
                            <p class="workcenters-name"></p>
                            <div class="el-form-item-div">
                                <div class="el-select-dropdown-wrap">
                                    <div class="el-select">
                                        <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                        <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                                        <input type="hidden" class="val_id" value="">                                
                                    </div>
                                    <div class="el-select-dropdown workcenters" style="display: none;width: auto;">
                                        <ul class="el-select-dropdown-list">
                                            <li data-id="" class="el-select-dropdown-item kong route-workcenter-item" data-name="--请选择--">--请选择--</li>
                                            ${workcentersHtml}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>`;
                    }
                    if (opabs.length) {
                        opabs.forEach(function (abitem) {
                            abs += `<li data-id="${abitem.id}" data-name="${abitem.ability_name}" class="el-select-dropdown-item route-ability-item" style="height:auto;">
                                         <span class="el-checkbox_input route-ab-check" data-checkid="${abitem.id}" data-checkname="${abitem.ability_name}">
                                            <span class="el-checkbox-outset"></span>
                                            <span class="el-checkbox__label show_description" data-desc="${abitem.ability_description}">${abitem.ability_name}</span>
                                         </span>
                                    </li>`;
                        });
                    }
                    abwrap = `<div class="el-form-item ma-ability_wrap">
                    <p class="abs-name"></p>
                    <div class="el-form-item-div">
                        <div class="el-select-dropdown-wrap">
                            <div class="el-select">
                                <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                                <input type="hidden" class="val_id" value="">
                            </div>
                            <div class="el-select-dropdown ability" style="display: none;width:auto;">
                                <ul class="el-select-dropdown-list">
                                    <li data-id="" class="el-select-dropdown-item kong route-ability-item" data-name="--请选择--">--请选择--</li>
                                    ${abs}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>`;
                    var steps = `<tr data-name="${step.name}" data-pfid="0" data-workhours="[]" data-code="${step.code}" data-cate-id="${step.material_category_id}" data-step-id="${step.field_id}_0" class="step-tr" data-field-id="${step.field_id}" data-field-desc='${step.field_description}'>
                      <td class="index-column"></td>
                      <td>
                        <p>${step.name}</p>
                        <p>(${step.code})</p>
                        <p>${step.field_description}</p>
                        <p class="check-group">
                            <span class="el-checkbox_input s-e-check start" data-step-id="${step.field_id}_0">
                               <span class="el-checkbox-outset"></span>
                               <span class="el-checkbox__label">开始</span>
                            </span>
                            <span class="el-checkbox_input s-e-check end" data-step-id="${step.field_id}_0">
                               <span class="el-checkbox-outset"></span>
                               <span class="el-checkbox__label">结束</span>
                            </span>
                        </p>
                        <p class="step-act">
                           <span class="new_step">新增</span>
                           <span class="delete_step">删除</span>
                        </p>
                      </td>
                      <td>${abwrap}</td>
                      <td>${workcenterswrap}</td>
                      <td class="step-device"></td>
                      <td>
                        <div class="mode-wrap">
                            <span class="el-checkbox_input mode-check">
                               <span class="el-checkbox-outset"></span>
                               <span class="el-checkbox__label">一进料一流转品</span>
                            </span>
                            <span class="el-checkbox_input mode-check">
                               <span class="el-checkbox-outset"></span>
                               <span class="el-checkbox__label">一进料多流转品</span>
                            </span>
                            <span class="el-checkbox_input mode-check">
                               <span class="el-checkbox-outset"></span>
                               <span class="el-checkbox__label">多进料一流转品</span>
                            </span>
                            <span class="el-checkbox_input mode-check">
                               <span class="el-checkbox-outset"></span>
                               <span class="el-checkbox__label">多进料多流转品</span>
                            </span>
                        </div>
                      </td>
                      <td>
                          <div class="route_item">
                              <div class="select_route">
                                  <table class="sticky uniquetable commontable">
                                      <thead>
                                      <tr>
                                          <th>物料</th>
                                          <th>数量</th>
                                          <th>类型</th>
                                          <th>描述</th>
                                          <th style="text-align: right;">操作</th>
                                      </tr>
                                      </thead>
                                      <tbody>
                                      </tbody>
                                  </table>
                              </div>
                              <div class="bottom">
                                  <span class="ma_item_add">添加进料</span>
                              </div>
                          </div>
                      </td>
                      <td><div class="img-wrap"></div><div class="img-add"><span class="ma_item_img_add">编辑图纸</span></div></td>
                      <td style="width:93px;"><div class="basic-text" style="word-break: break-all">${step.description || ''}</div></td>
                      <td><textarea class="el-textarea ma-textarea auto-textarea"></textarea></td>
                      <td><div class="attch-wrap"></div><div class="attch-add"><span class="ma_item_attch_add">上传附件</span></div></td>
                  </tr>`;
                    trele.append(steps);
                    trele.find('tr.step-tr:last-child').data('step', step);
                });

                let practiceListState = false;
                if(checkedPractice.length) {
                    checkedPractice.forEach(item => {
                        if(item.nodeId == $('.self-make-btn').attr('data-node-id')) {
                            practiceListState = true;
                            item.practiceList = practiceList;
                        }
                    })
                }

                if(!practiceListState) {
                    checkedPractice.push({
                        nodeId: $('.self-make-btn').attr('data-node-id'),
                        practiceList: practiceList
                    });
                }

                testSE();
                checkSE();
                
                if(!rnodes) {
                    rnodes = {};
                }
                rnodes.ipractice_id = -1;
                $('.make_list_all .make-item.selected').removeClass('selected');
                $('.make_list_all .make-item.is-disabled').removeClass('is-disabled');
                layer.close(layerModal);
                
            });
            getCateByOP(id);
            getPracticeList(id, 'more');
        },
        cancel: function (layero, index) {// 右上角关闭按钮
            // console.log(num);
            if(num){
                $('.make_list .make_list_all .make-item[data-id='+num+']').click();
            }
            // $('.el-button.self-make-btn').removeClass('selected');
        },
        end: function () {
            
        }

    })
}

//详细信息弹层
function materialDetailInfoModal(data, flag, version) {
    var {
            material_id = '',
            material_category_name = '',
            name = '', item_no = '',
            batch_no_prefix = '',
            moq = '', description = '',
            unit_name = '', mpq = '', weight = '',
            length = '', width = '', height = '',
            template_name = '', material_attributes = [],
            operation_attributes = [],
            source = 1, fixed_advanced_period = '',
            cumulative_lead_time = '',
            safety_stock = '', max_stock = '', min_stock = '',
            low_level_code = '', drawings = [],
            attachments = []
        } = {},
        attrData = {
            material_attributes: [],
            operation_attributes: []
        };
    if (data != undefined && data != null) {
        ({
            material_id = '',
            material_category_name = '',
            name = '', item_no = '',
            batch_no_prefix = '',
            moq = '', description = '',
            unit_name = '', mpq = '', weight = '',
            length = '', width = '', height = '',
            template_name = '无', material_attributes = [],
            operation_attributes = [],
            source = 1, fixed_advanced_period = '',
            cumulative_lead_time = '',
            safety_stock = '', max_stock = '', min_stock = '',
            low_level_code = '', drawings = [],
            attachments = []
        } = data);
        attrData = {
            material_attributes: material_attributes,
            operation_attributes: operation_attributes
        };
    }
    layerModal = layer.open({
        type: 1,
        title: `物料${item_no}详细信息`,
        offset: '100px',
        area: ['900px', '444px'],
        shade: 0.1,
        shadeClose: true,
        resize: false,
        content: `<div class="bom-wrap-container" id="#materialModal">
                    <div class="bom-wrap">
                        <div class="bom-tap-wrap">
                            <span data-item="materialBasicInfo_from" class="bom-tap active">基础信息</span>
                            <span data-item="materialAttribute_from" class="bom-tap">属性</span>
                            <span data-item="materialPlan_from" class="bom-tap">计划</span>
                            <span data-item="materialPic_from" class="bom-tap">图纸</span>
                            <span data-item="materialFile_from" class="bom-tap">附件</span>
                            <span data-ma-id="${material_id}" data-version="${version || 0}" data-item="materialDesignBom_from" class="bom-tap" style="display: ${flag == 'top' ? 'none' : ''}">设计BOM</span>
                        </div>  
                        <div class="bom-panel-wrap" style="padding-top: 10px;">
                            <div class="bom-panel active" id="materialBasicInfo_from">
                                <div class="material_block">
                                    <h3>基本信息</h3>
                                    <div class="basic_info">
                                        <div class="item">
                                            <div class="el-form-item">
                                                <div class="el-form-item-div">
                                                    <label class="el-form-item-label">物料分类:</label>
                                                    <span>${tansferNull(material_category_name)}</span>
                                                </div> 
                                            </div>
                                            <div class="el-form-item">
                                                <div class="el-form-item-div">
                                                    <label class="el-form-item-label">批次号前缀:</label>
                                                    <span>${tansferNull(batch_no_prefix)}</span>
                                                </div>
                                            </div> 
                                        </div>
                                        <div class="item">
                                            <div class="el-form-item">
                                                <div class="el-form-item-div">
                                                    <label class="el-form-item-label">名称:</label>
                                                    <span>${tansferNull(name)}</span>
                                                </div>
                                            </div>
                                            <div class="el-form-item">
                                                <div class="el-form-item-div">
                                                    <label class="el-form-item-label">最小订单数量:</label>
                                                    <span>${tansferNull(moq)}</span>
                                                </div>
                                            </div> 
                                        </div>
                                        <div class="item">
                                            <div class="el-form-item">
                                                <div class="el-form-item-div">
                                                    <label class="el-form-item-label">物料编码号:</label>
                                                    <span>${tansferNull(item_no)}</span>
                                                </div>
                                            </div>
                                            <div class="el-form-item">
                                                <div class="el-form-item-div">
                                                    <label class="el-form-item-label">描述:</label>
                                                    <p title="${description}" style="margin-bottom: 0px;">${tansferNull(description)}</p>
                                                </div>
                                            </div> 
                                        </div>
                                    </div>
                                </div> 
                                <div class="material_block">
                                    <h3>包装设置</h3>
                                    <div class="basic_info">
                                        <div class="item">
                                            <div class="el-form-item">
                                                <div class="el-form-item-div">
                                                    <label class="el-form-item-label">基本单位:</label>
                                                    <span>${tansferNull(unit_name)}</span>
                                                </div> 
                                            </div>
                                            <div class="el-form-item">
                                                <div class="el-form-item-div">
                                                    <label class="el-form-item-label">最小包装长度:</label>
                                                    <span>${tansferNull(length)}[m]</span>
                                                </div>
                                            </div> 
                                        </div>
                                        <div class="item">
                                            <div class="el-form-item">
                                                <div class="el-form-item-div">
                                                    <label class="el-form-item-label">最小包装数量:</label>
                                                    <span>${tansferNull(mpq)}</span>
                                                </div>
                                            </div>
                                            <div class="el-form-item">
                                                <div class="el-form-item-div">
                                                    <label class="el-form-item-label">最小包装宽度:</label>
                                                    <span>${tansferNull(width)}[m]</span>
                                                </div>
                                            </div> 
                                        </div>
                                        <div class="item">
                                            <div class="el-form-item">
                                                <div class="el-form-item-div">
                                                    <label class="el-form-item-label">最小包装重量:</label>
                                                    <span>${tansferNull(weight)}[kg]</span>
                                                </div>
                                            </div>
                                            <div class="el-form-item">
                                                <div class="el-form-item-div">
                                                    <label class="el-form-item-label">最小包装高度:</label>
                                                    <span>${tansferNull(height)}[m]</span>
                                                </div>
                                            </div> 
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="bom-panel" id="materialAttribute_from">
                                  <div class="material_block">
                                    <div class="basic_info">
                                        <div class="item">
                                            <div class="el-form-item">
                                                <div class="el-form-item-div">
                                                    <label class="el-form-item-label">物料模板:</label>
                                                    <span>${tansferNull(template_name) == '' ? '--无--' : tansferNull(template_name)}</span>
                                                </div> 
                                            </div>
                                        </div>
                                    </div>
                                  </div> 
                                  <div class="material_block">
                                    <h3>物料属性</h3>
                                    <div class="basic_info">
                                        <div class="item attr_item">
                                          ${createAttrHtml(attrData, 'self', 'attr')}
                                        </div>
                                    </div>
                                  </div> 
                                  <div class="material_block">
                                    <h3>工艺属性</h3>
                                    <div class="basic_info">
                                        <div class="item attr_item">
                                            ${createAttrHtml(attrData, 'self', 'opattr')}
                                        </div>
                                    </div>
                                  </div> 
                            </div>
                            <div class="bom-panel" id="materialPlan_from">
                                <div class="material_block">
                                    <h3>计划信息</h3>
                                    <div class="basic_info">
                                        <div class="item">
                                            <div class="el-form-item">
                                                <div class="el-form-item-div">
                                                    <label class="el-form-item-label">物料来源:</label>
                                                    <span>${createSource(meterielSource, source)}</span>
                                                </div> 
                                            </div>
                                            <div class="el-form-item">
                                                <div class="el-form-item-div">
                                                    <label class="el-form-item-label">安全库存:</label>
                                                    <span>${tansferNull(safety_stock)}</span>
                                                </div>
                                            </div> 
                                            <div class="el-form-item">
                                                <div class="el-form-item-div">
                                                    <label class="el-form-item-label">低阶码:</label>
                                                    <span>${tansferNull(low_level_code)}</span>
                                                </div>
                                            </div> 
                                        </div>
                                        <div class="item">
                                            <div class="el-form-item">
                                                <div class="el-form-item-div">
                                                    <label class="el-form-item-label">固定提前期:</label>
                                                    <span>${tansferNull(fixed_advanced_period)}</span>
                                                </div>
                                            </div>
                                            <div class="el-form-item">
                                                <div class="el-form-item-div">
                                                    <label class="el-form-item-label">最高库存:</label>
                                                    <span>${tansferNull(max_stock)}</span>
                                                </div>
                                            </div> 
                                        </div>
                                        <div class="item">
                                            <div class="el-form-item">
                                                <div class="el-form-item-div">
                                                    <label class="el-form-item-label">累计提前期:</label>
                                                    <span>${tansferNull(cumulative_lead_time)}</span>
                                                </div>
                                            </div>
                                            <div class="el-form-item">
                                                <div class="el-form-item-div">
                                                    <label class="el-form-item-label">最低库存:</label>
                                                    <span>${tansferNull(min_stock)}</span>
                                                </div>
                                            </div> 
                                        </div>
                                    </div>
                                </div> 
                            </div>
                            
                            <div class="bom-panel clearfix" id="materialPic_from">
                              ${createPicList(drawings)}
                            </div>
                            <div class="bom-panel" id="materialFile_from">
                                 <div class="table-container">
                                    <table class="bom_table">
                                      <thead>
                                        <tr>
                                          <th class="thead">缩略图</th>
                                          <th class="thead">名称</th>
                                          <th class="thead">创建人</th>
                                          <th class="thead">创建时间</th>
                                          <th class="thead">注释</th>
                                          <th class="thead">操作</th>
                                        </tr>
                                      </thead>
                                      <tbody class="t-body">
                                        ${createAttachTable(attachments)}
                                      </tbody>
                                    </table>
                                </div>
                            </div>
                            <div class="bom-panel" id="materialDesignBom_from" style="display: ${flag == 'top' ? 'none' : ''}">
                                  <div class="materialInfo_container">
                                    <div class="materialInfo_table" style="overflow-y: auto;">
                                         <div class="table-container select_table_margin">
                                            <div class="table-container">
                                              <table class="bom_table design_table">
                                                <thead>
                                                  <tr>
                                                    <th class="thead">物料清单编码</th>
                                                    <th class="thead">物料清单名称</th>
                                                    <th class="thead">创建人</th>
                                                    <th class="thead">版本</th>
                                                    <th class="thead">版本描述</th>
                                                  </tr>
                                                </thead>
                                                <tbody class="t-body">
                                                  
                                                </tbody>
                                              </table>
                                            </div>
                                         </div>
                                    </div>  
                                    <div class="materialInfo_tree">
                                      <div class="bom_tree_container">
                                        <div class="bom-tree">
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                            </div>
                        </div>
                    </div>
                    <div class="el-form-item">
                       <div class="el-form-item-div btn-group">
                         <button type="button" class="el-button cancle">关闭</button>
                       </div>
                    </div>
                </div>`
    })
}

//生成图纸列表
function createPicList(picData) {
    var items = [];
    if (picData.length) {
        picData.forEach(function (item) {
            var item = `<div class="pic_item">
                 <div class="pic_img">
                    <img width="370" height="170" src="/storage/${item.image_path}" alt="">
                 </div>
                 <div class="pic_text"><span>${item.code}</span></div>
            </div>`;
            items.push(item);
        });
    }
    return items.join('');
}

//生成附件表格
function createAttachTable(data) {
    console.log(data);
    var trs = [];
    if (data.length) {
        data.forEach(function (item, index) {
            var path = item.path.split('/');
            var name = path[path.length - 1],
                namepre = name.split('.')[0],
                nameSuffix = name.split('.')[1],
                nameSub = namepre.length > 4 ? namepre.substring(0, 4) + '...' : namepre;
            var tr = `
              <tr class="tritem" data-id="${item.attachment_id}">
                  <td style="font-size: 20px;">
                    <i class="el-icon el-input-icon el-icon-file"></i>
                  </td>
                  <td><p style="cursor: default;" title="${name}">${nameSub}.${nameSuffix}</p></td>
                  <td><p>${item.creator_name || ''}</p></td>
                  <td>
                    <p>${item.ctime}</p>
                  </td>
                  <td><p title="${item.comment}">${item.comment!=null&&item.comment!=''?(item.comment.length>11?item.comment.substring(0,9)+'...':item.comment):''}</p></td>
                  <td><a download="${namepre}" href="/storage/${item.path}"><i class="el-icon el-input-icon el-icon-download"></i></a></td>             
              </tr>
          `;
            trs.push(tr);
        });
    } else {
        var tr = `<tr>
                <td class="nowrap" colspan="6" style="text-align: center;">暂无数据</td>
            </tr>`;
        trs.push(tr);
    }
    return trs.join('');
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
            inputhtml = `<span>${attritem.value || ''}</span>`;
            unithtml = attritem.unit !== null && attritem.unit !== '' && attritem.unit !== undefined ? `<span class="unit">[${attritem.unit}]</span>` : '<span class="unit"></span>';
            if (attritem.datatype_id == 2) {
                inputhtml = createOption(attritem.range, attritem.value);
            }
            divitem = `<div class="attr_wrap">
                  <p>名称：${attritem.name}</p>
                    <p>值：${inputhtml}${unithtml}</p>
                </div>`;
            divitems.push(divitem);
        });
        divwrap = `<h4>${item.template_name == undefined ? '' : item.template_name}</h4> 
                <div class="attr_wrap_con">
                    ${divitems.join('')}
                </div>`;
    }
    return divwrap;
}

//生成属性下拉框数据
function createOption(data, value) {
    var opdata = JSON.parse(data);
    var innerhtml, selectVal;
    if (opdata.options && opdata.options.length) {
        opdata.options.forEach(function (item) {
            if (value != '' && value != undefined && item.index == value) {
                selectVal = item.label;
            }
        });
    }
    innerhtml = `<span>${selectVal != undefined && selectVal != '' ? selectVal : '--无--'}</span>`;
    selectVal = '';
    return innerhtml;
}

//生成物料来源数据
function createSource(data, val) {
    var sItem = [];
    data && data.length && data.forEach(function (item) {
        if (val && val == item.id) {
            sItem.push(item);
        }
    });
    var uname = '--无--', uid = '';
    if (sItem.length) {
        uname = sItem[0].name;
        uid = sItem[0].id;
    }
    var eleSource = `<span>${uname}</span>`;
    return eleSource;
}

//生成弹层设计bom列表
function createDesignTable(data) {
    var trs = [];
    if (data.length) {
        data.forEach(function (item, index) {
            var tr = `
            <tr class="tr-bom-item" data-id="${item.material_id}" data-version="${item.version}">
                <td>${item.code}</td>
                <td>${item.name}</td>
                <td>${item.user_name == null?'':item.user_name}</td>
                 <td>${item.version}.0</td>
                <td><p title="item.version_description">${item.version_description.length > 25 ? item.version_description.substring(0, 24) + '...' : item.version_description}</p></td>             
            </tr>
        `;
            trs.push(tr);
        });
    } else {
        var tr = `<tr>
                <td class="nowrap" colspan="5" style="text-align: center;">暂无数据</td>
            </tr>`;
        trs.push(tr);
    }

    return trs;
}

//工艺路线版本控制（禁用按钮）
function closeBtn() {
    $('.main-content-inner .page-content .div-all-wrap .bom_wrap button').not('.bom-info-button.publish').not('#ecm_warning').not('.el-button.preview-route').not('.save-route').not('#materialAttrModal').not('.el-button.status-btn.freeze').not('.el-button.status-btn.activate').not('#showBomTree').not('#edit-add-btn').not('.sync-SAP').not('.self-make-btn').addClass('is-disabled').css('pointer-events', 'none');
    $('.bom_blockquote.route').addClass('cantClick');
    $('.self-make-btn').addClass('is-disabled');
    $('.self-make-btn').attr('disabled', true);
    // $('#addRoute_form .route-lists').css('pointer-events','none');
    // $('.el-form-item-div .el-select-dropdown-wrap').addClass('is-disabled').css('pointer-events', 'none');

}

function closeSave() {
    $('.el-button.el-button--primary.save-route').addClass('is-disabled').css('pointer-events', 'none');
}

function openSave() {
    $('.el-button.el-button--primary.save-route').removeClass('is-disabled').css('pointer-events', 'auto');
}

function openBtn() {
    $('.main-content-inner .page-content .div-all-wrap .bom_wrap button').not('.bom-info-button.publish').not('.self-make-btn').not('.el-button.preview-route').not('.save-route').not('.sync-SAP').not('#ecm_warning').removeClass('is-disabled').css('pointer-events', 'auto');
    $('.bom_blockquote.route').removeClass('cantClick');
    $('.el-form-item-div .el-select-dropdown-wrap').removeClass('is-disabled').css('pointer-events', 'auto');
    $('.self-make-btn').removeClass('is-disabled');
    $('.self-make-btn').attr('disabled', false);
    // $('#addRoute_form .route-lists').css('pointer-events','auto');
}

//生成设计bom列表
function createMainDesignTable(data) {
    var viewurl = $('#bom_view').val(),
        editurl = $('#bom_edit').val(),
        flag = $('.status-btn.activate.none').length;
    var trs = [];
    if (data.length) {
        data.forEach(function (item, index) {
            var tip = '';
            // console.log(item.is_version_on,item.was_release,item.status,index);
            var condition;
            if(item.status==0){
                condition=`<span style="padding: 2px;border: 1px solid #666;color: #666;border-radius: 4px;">未激活</span>`;
            }else{
                if(item.is_version_on==1){
                    condition=`<span style="padding: 2px;border: 1px solid #160;color: #160;border-radius: 4px;">已发布</span>`;
                }else{
                    condition=`<span style="padding: 2px;border: 1px solid #d2dc15;color: #d2dc15;border-radius: 4px;">已激活</span>`;
                }
            }
            if (!flag) {
                tip = `<div class="tipinfo" style="display: inline-block;line-height: 24px;"><i style="color: #ff7800;width: 15px;" class="el-icon fa-question-circle"></i><span class="tip" style="width: 70px;">请先激活<i></i></span></div>`;
            }
            var tr = `
            <tr class="tr-bom-item ${item.bom_id == bom_id ? 'active' : ''}" data-bom-id="${item.bom_id}" data-id="${item.material_id}" data-version="${item.version}">
                <td>${item.code}</td>
                <td>${item.name}</td>
                <td>${item.user_name == null?'':item.user_name}</td>
                <td>${item.version}.0</td>
                <td><span title="item.version_description">${item.version_description.length > 25 ? item.version_description.substring(0, 24) + '...' : item.version_description}</span></td>
                <td class="bomstatus">${condition}</td>
                <td>
                  <div class="design_operation">
                  <a class="link_button bom_link" target="_blank" href="${viewurl}?id=${item.bom_id}&is_design=1" >查看</a>
                  <a  style="display: ${item.is_version == 0 && item.was_release == 0 && item.status == 1 ? 'inline-block' : 'inline-block'}" class="link_button bom_link" href="${editurl}?id=${item.bom_id}&is_design=1">编辑</a>
                  <button style="display: ${flag && item.is_version_on == 1 ? 'none' : 'inline-block'}" type="button" data-bom-id="${item.bom_id}" class="bom-info-button publish ${flag ? '' : 'noedit'}">发布</button>
                  ${tip}
                  </div>
                </td>            
            </tr>
        `;
            trs.push(tr);
        });
    } else {
        var tr = `<tr>
                <td class="nowrap" colspan="7" style="text-align: center;">暂无数据</td>
            </tr>`;
        trs.push(tr);
    }

    return trs;
}

//生成物料列表
function createMaterialTable(ele, data) {
    var chooseIds = [],
        editurl = $('#bom_edit').val();
    if (itemAddFlag == 3) {//顶级bom
        if (topMaterial.material_id != undefined) {
            chooseIds.push(topMaterial.material_id);
        }
    } else {//添加项及替代物料
        chooseIds = getIds(materialData, 'material');
    }

    data.forEach(function (item, index) {
        var has_bom = '',
            checkbox = `<span class="el-checkbox_input material-check ${chooseIds.indexOf(item.material_id) > -1 ? 'is-checked' : ''}">
                        <span class="el-checkbox-outset"></span>
                    </span>`,
            maName = item.name;
        if (itemAddFlag != 3) {
            has_bom = `<td>
                  ${item.has_bom > 0 ? '是' : '否'}
                </td>`;
            if (item.has_bom == 1) {
                if (!(item.bom_status == 1 && item.is_version_on == 1)) {
                    checkbox = `<div class="tip_check">
                      <span class="el-checkbox_input material-check noedit ${chooseIds.indexOf(item.material_id) > -1 ? 'is-checked' : ''}" data-has-bom="${item.has_bom}">
                          <span class="el-checkbox-outset"></span>
                      </span>
                      <div class="tipinfo"><i style="color: #ff7800;width: 15px;" class="el-icon fa-question-circle"></i><span class="tip">未发布<i></i></span></div>
                    </div>`;
                    maName = `<a href="${editurl}?id=${item.bom_id}&design=1" target="_blank" style="color: #67b9ff;">${item.name}</a>`;
                }
            }
        }
        var tr = `
            <tr class="tritem" data-id="${item.material_id}">
                <td class="tdleft">
                  ${checkbox}
                </td>
                <td>${item.item_no}</td>
                <td>${maName}</td>
                ${has_bom}
                <td>${item.creator_name || ''}</td>
                <td>${item.material_category_name == null ? '' : item.material_category_name}</td>             
            </tr>
        `;
        ele.append(tr);
        ele.find('tr:last-child').data('materItem', item);

    });
    if($('.el-checkbox_input.material-check').hasClass('is-checked')){
        $('.el-checkbox_input.material-check.is-checked').parent().parent().css({'background':'#d0d0d0','pointer-events':'none'});
    }
}

//生成添加项列表
function createMaterialItem(data) {
    var ele = $('.bom_table.item_table .t-body');
    ele.html('');

    if (noEditFlag == 'edit') {//取消升级时数据还原
        data = bomOperation;
    }

    if (data.length) {
        data.forEach(function (item, index) {
            var editInputFlag = '',
                editBtnFlag = '',
                editStyleFlag = '',
                assemblyFlag = '';
            if (noEditFlag == 'edit') {
                editInputFlag = 'readonly', editBtnFlag = 'disabled', editStyleFlag = 'editDisabled', assemblyFlag = 'noedit'
            } else {
                editInputFlag = '', editBtnFlag = '', editStyleFlag = '', assemblyFlag = '';
            }

            var replaceBtn = `<button type="button" data-id="${item.material_id}" ${editBtnFlag} id="edit-replace-btn" style="pointer-events: none" class="bom-info-button bom-add-item bom-item-replace is-disabled ${editStyleFlag}">替换物料</button>`,
                delBtn = `<button type="button" id="edit-bom-btn" data-id="${item.material_id}" ${editBtnFlag} style="pointer-events: none" class="bom-info-button bom-info-del bom-item-del bom-del is-disabled ${editStyleFlag}">删除</button>`,
                replacetr = '',
                replacetrId = '';
            if (item.itemAddFlag == 2) {
                replaceBtn = '';
                replacetr = 'tr-replace';
                replacetrId = `data-replace-id="${item.replaceItemId}"`;
                delBtn = `<button type="button" id="edit-replace-btn" ${editBtnFlag} ${replacetrId} data-id="${item.material_id}" class="bom-info-button bom-info-del bom-replace-del bom-del ${editStyleFlag}">删除</button>`;
            }

            var tr = `
            <tr class="ma-tritem ${replacetr} ${item.is_assembly > 0 ? 'is-version-tr' : ''}" data-id="${item.material_id}" ${replacetrId}>
              <td><p class="show-material" data-version="${item.version}" data-has-bom="${item.has_bom > 0 ? '1' : '0'}" data-id="${item.material_id}">${item.item_no}</p></td>
              <td>${item.name}</td>
              <td><input type="number" step="0.01" value="${item.loss_rate != undefined ? item.loss_rate : '0.00'}" ${editInputFlag} class="el-input bom-ladder-input loss_rate"></td>
              <td class="assemblyBom">
                  <span class="el-checkbox_input assembly-check ${assemblyFlag} ${item.is_assembly != undefined && item.is_assembly == 1 ? 'is-checked' : ''} ${!(item.is_assembly != undefined && item.is_assembly == 1) ? 'noedit' : ''} ${item.has_bom ? '' : 'noedit'}" data-id="${item.material_id}" data-has-bom="${item.has_bom}" data-version="${item.version || 0}">
                      <span class="el-checkbox-outset"></span>
                  </span>
              </td>
              <td><input type="text" value="${item.usage_number != undefined ? item.usage_number : ''}" ${editInputFlag} id="edit_usage_num" class="bom-ladder-input usage_number"></td>
              <td>${item.commercial==null?'':item.commercial}</td>
              <td><textarea class="el-textarea bom-textarea comment" name="" id="" cols="30" rows="3">${item.comment != undefined ? item.comment : ''}</textarea></td>
              <td>
                ${replaceBtn}
                ${delBtn}
              </td>
            </tr>
        `;
            ele.append(tr);
            ele.find('tr:last-child').data('matableItem', item);
        });
    } else {
        var tr = `<tr>
                <td class="nowrap" colspan="8" style="text-align: center;">暂无数据</td>
            </tr>`;
        ele.append(tr);
    }
}

//禁止在添加项中勾选组装
$('body').on('click','.bom_table.item_table .el-checkbox_input.assembly-check.is-checked',function () {
    $(this).addClass('noedit');
})

function getProcedureSource(id, val, ability) {
    $('.operation-wrap .list ul').html(`<li data-id="" class="el-select-dropdown-item kong operation-item" data-name="--请选择--">--请选择--</li>`);
    AjaxClient.get({
        url: URLS['bomAdd'].workMaterialNo + '?' + _token + '&page_no=1&page_size=10&material_no=' + id,
        dataType: 'json',
        success: function (rsp) {
            var data = rsp.results.list;
            if (data && data.length) {
                operationSource = data;
                var _html = $('.operation-wrap .list ul'), innerHtml = '';
                data.forEach(function (item) {
                    innerHtml = `<li data-id="${item.operation_id}" data-name="${item.operation_name}" class=" el-select-dropdown-item operation-item">${item.operation_name}</li>`
                    _html.append(innerHtml);
                });

                if (val) {
                    $('.el-select-dropdown-wrap.operation-wrap').find('.el-select-dropdown-item[data-id=' + val + ']').click();
                    if (ability) {
                        var arr = ability.split(',');

                        for (var i in arr) {
                            $('.el-select-dropdown.ability').find('.operation-check[data-checkid=' + arr[i] + ']').click();
                        }
                    }
                }

            } else {
                // LayerConfig('fail','此物料暂无工序');
            }
        },
        fail: function (rsp) {
            if (rsp && rsp.message != undefined && rsp.message != null) {
                LayerConfig('fail', rsp.message);
            }
        }
    }, this);
}

