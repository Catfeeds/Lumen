var layerLoading, layerEle,
    img_page_no = 1,
    img_page_size = 8,
    ajaxData = {
        order: 'desc',
        sort: 'ctime'
    },
    selectImg = {},
    unique_num = 200,
    count = 0,
    searchData = {
        name: '',
        practice_code: '',
        description_id: ''
    },
    searchChainData = {
        name: '',
        practice_code: ''
    },
    field_select = [],
    img_collection = [],
    img_flag = '',
    single_id = '',
    attr_html = '',
    usageIds = [],
    attr_data = [],
    attr_checks = [],
    typeCode = {
        pro: '',
        prac: ''
    },
    imgchecks = [],
    practiceOrderImg = [];
validatorToolBox = {
        checkName: function (name) {
            var value = $('#operation_form').find('#' + name).val();
            return $('#operation_form').find('#' + name).parents('.el-form-item').find('.errorMessage').hasClass('active') ? (!1) :
                Validate.checkNull(value) ? (showInvalidMessage(name, "名称不能为空"), !1) : 
                !Validate.checkName(value)?(showInvalidMessage(name,"名称长度不能超出30位"), !1):
                (!0);
        },
        checkCode: function (name) {
            var value = $('#operation_form').find('#' + name).val();
            return $('#operation_form').find('#' + name).parents('.el-form-item').find('.errorMessage').hasClass('active') ? (!1) :
                Validate.checkNull(value) ? (showInvalidMessage(name, "编码不能为空"), !1) : 
                !Validate.checkMaintainCode(value)?(showInvalidMessage(name,"编码由1-20位字母数字下划线横线组成"), !1):
                (!0);
        },
        checkMate: function (name) {
            var value = $('#operation_form').find('#' + name).val();
            return $('#operation_form').find('#' + name).parents('.el-form-item').find('.errorMessage').hasClass('active') ? (!1) :
                Validate.checkNull(value) ? (showInvalidMessage(name, "请选择物料分类"), !1) : (!0);
        },
        checkProTypeId: function (name) {
            var value = $('#operation_form').find('#' + name).val();
            return $('#operation_form').find('#' + name).parents('.el-form-item').find('.errorMessage').hasClass('active') ? (!1) :
                Validate.checkNull(value) ? (showInvalidMessage(name, "请选择产品分类"), !1) : (!0);
        },
        checkPracTypeId: function (name) {
            var value = $('#operation_form').find('#' + name).val();
            return $('#operation_form').find('#' + name).parents('.el-form-item').find('.errorMessage').hasClass('active') ? (!1) :
                Validate.checkNull(value) ? (showInvalidMessage(name, "请选择做法分类"), !1) : (!0);
        }
    },
    remoteValidatorToolbox = {
        remoteCheckCode: function (name, id) {
            var value = $('#' + name).val().trim();
            getUnique(name, value, id, function (rsp) {
                if (rsp.results && rsp.results.exist) {
                    var val = '已注册';
                    showInvalidMessage(name, val);
                }
            });
        },
    },
    validatorConfig = {
        name: 'checkName',
        code: 'checkCode',
        m_c_id: 'checkMate',
        product_type_id: 'checkProTypeId',
        practice_type_id: 'checkPracTypeId'
    },
    remoteValidatorConfig = {
        code: 'remoteCheckCode'
    };

var transformStyle = {
    rotate: "rotate(0deg)",
    scale: "scale(1)",
};
//获取id
function getImgIds(data) {
    var ids = [];
    data.forEach(function (item) {
        ids.push(item.drawing_id);
    });

    return ids;
}
//操作数组
function actImgArray(data, id) {
    var ids = getImgIds(data);
    var index = ids.indexOf(Number(id));
    data.splice(index, 1);
}
$(function () {
    getAllProcedure();
    getProTypeTree();
    getPracTypeTree();
    getDescription('', '', 'search');
    bindEvent();
});

function showInvalidMessage(name, val) {
    $('#operation_form').find('#' + name).parents('.el-form-item').find('.errorMessage').addClass('active').html(val);
    $('#operation_form').find('.submit').removeClass('is-disabled');
}
//唯一性检测
function getUnique(field, value, id, fn) {
    var xhr = AjaxClient.get({
        url: URLS['workWay'].unique + "?" + _token + '&code=' + value,
        dataType: 'json',
        success: function (rsp) {
            fn && typeof fn === 'function' ? fn(rsp) : null;
        },
        fail: function (rsp) {
            console.log('唯一性检测失败');
        }
    }, this);
}

function getAllProcedure(flag) {
    AjaxClient.get({
        url: URLS['workWay'].procedureList + '?' + _token,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            if (rsp.results && rsp.results.list.length) {
                if (flag) {
                    showProcedureList($('.chain_procedure ul'), rsp.results.list);
                    $('.chain_procedure ul li').eq(0).click();
                } else {
                    showProcedureList($('.procedure_list ul'), rsp.results.list);
                    $('.procedure_list ul li').eq(0).click()
                }
            }
        },
        fail: function (rsp) {
            layer.close(layerLoading);
        }
    }, this);
}

function showProcedureList(ele, data) {
    ele.html('');
    data.forEach(function (item, index) {
        var list = `<li data-id="${item.id}" data-name="${item.name}" data-code="${item.code}" title="${item.name}"><i class="item-dot expand-icon"></i>${item.name}</li>`;
        ele.append(list);
    })
}

function bindEvent() {
    $(document).click(function (e) {
        var obj = $(e.target);
        if (!obj.hasClass('el-select-dropdown-wrap') && obj.parents(".el-select-dropdown-wrap").length === 0) {
            $('.el-select-dropdown').slideUp().siblings('.el-select').find('.el-input-icon').removeClass('is-reverse');
        }
    });

    $('body').on('click', '.el-select-dropdown-wrap', function (e) {
        e.stopPropagation();
    });
    //更多搜索条件下拉
    $('.work_way_relation #searchForm').on('click', '.arrow:not(".noclick")', function (e) {
        e.stopPropagation();
        $(this).find('.el-icon').toggleClass('is-reverse');
        var that = $(this);
        that.addClass('noclick');
        if ($(this).find('.el-icon').hasClass('is-reverse')) {
            $('.work_way_relation #searchForm .el-item-show').css('background', '#e2eff7');
            $('.work_way_relation #searchForm .el-item-hide').slideDown(400, function () {
                that.removeClass('noclick');
            });
        } else {
            $('.work_way_relation #searchForm .el-item-hide').slideUp(400, function () {
                $('.work_way_relation #searchForm .el-item-show').css('background', 'transparent');
                that.removeClass('noclick');
            });
        }
    });
    //图纸更多搜索条件下拉
    $('body').on('click', '#img_select_form #searchForm .arrow:not(.noclick)', function (e) {
        e.stopPropagation();
        $(this).find('.el-icon').toggleClass('is-reverse');
        var that = $(this);
        that.addClass('noclick');
        if ($(this).find('.el-icon').hasClass('is-reverse')) {

            $(this).find('.el-icon').removeClass('is-reverse');
            $('#searchForm:not(.search_wrap) .el-item-show').css('background', '#e2eff7');
            $('#searchForm:not(.search_wrap) .el-item-hide').slideDown(400, function () {
                that.removeClass('noclick');
            });
        } else {
            $(this).find('.el-icon').addClass('is-reverse');
            $('#searchForm:not(.search_wrap) .el-item-hide').slideUp(400, function () {
                $('#searchForm:not(.search_wrap) .el-item-show').css('background', 'transparent');
                that.removeClass('noclick');
            });
        }
    });
    //checkbox 点击
    $('body').on('click', '.el-checkbox_input:not(.noedit)', function (e) {
        e.preventDefault();
        if (!$(this).parents().hasClass('addImage_form')) {
            if ($(this).hasClass('practice-check')) {
                $(this).toggleClass('is-checked');
                if ($(this).hasClass('is-checked')) {
                    field_select.push({
                        practice_id: $(this).parents('tr').attr('data-id'),
                        operation_id: $(this).parents('tr').attr('data-o-id')
                    })
                } else {
                    for (var i = 0; i < field_select.length; i++) {
                        if (field_select[i].practice_id == $(this).parents('tr').attr('data-id')) {
                            field_select.splice(i, 1);
                        }
                    }
                }
            }
            //做法字段单张图纸
            else if ($(this).hasClass('field_img')) {
                $(this).toggleClass('is-checked');
                if ($(this).hasClass('is-checked')) {
                    var zfid = $("#img_select_form").find("#itemId").attr("data-index");
                    //console.log(zfid);
                    var _attr = [];
                    if ($(this).parents('tr').data('trData').length) {
                        $(this).parents('tr').data('trData').forEach(function (aitem) {
                            _attr.push(`${aitem.definition_name}:${aitem.value}`)
                        })
                    }
                    imgchecks.push({
                        id: $(this).attr('data-id'),
                        name: $(this).attr('data-name'),
                        url: $(this).attr('data-path'),
                        pfid: $('#img_select_form').find('#itemId').attr('data-index'),
                        attr: _attr.join(','),
                        desc: ''
                    });

                } else {
                    for (var i = 0; i < imgchecks.length; i++) {
                        if (imgchecks[i].id == $(this).attr('data-id')) {
                            imgchecks.splice(i, 1);
                        }
                    }
                }
            } else { //做法字图纸选择多张
                $(this).toggleClass('is-checked');
                if ($(this).hasClass('is-checked')) {
                    img_collection.push({
                        id: $(this).attr('data-id'),
                        name: $(this).attr('data-name'),
                        url: $(this).attr('data-path'),
                        attr: $(this).parents('tr').data('trData'),
                        desc: ''
                    });
                } else {
                    for (var j = 0; j < img_collection.length; j++) {
                        if (img_collection[j].id == $(this).attr('data-id')) {
                            img_collection.splice(j, 1);
                        }
                    }
                }
            }
        }
    });
    $('body').on('click', '.el-tap-wrap:not(.is-disabled,.image) .el-tap', function () {
        if ($(this).hasClass('image')) {
            var form = $(this).attr('data-item');
            if (!$(this).hasClass('active')) {
                $(this).addClass('active').siblings('.el-tap').removeClass('active');
                $('.pic-wrap #' + form).addClass('active').siblings('.el-panel').removeClass('active');
            }
        } else {
            if (!$(this).hasClass('active')) {
                $(this).addClass('active').siblings('.el-tap').removeClass('active');
                var form = $(this).attr('data-item');
                $('.' + form).addClass('active').siblings('.el-panel').removeClass('active');
            }
        }

    });
    //弹窗关闭
    $('body').on('click', '.formModal .cancle', function (e) {
        e.stopPropagation();
        layer.close(layerModal);
    });
    //下拉框点击事件
    $('body').on('click', '.el-select:not(.desc)', function () {
        $(this).find('.el-input-icon').toggleClass('is-reverse');
        $(this).parents('.el-form-item').siblings().find('.el-select-dropdown').hide();
        $(this).parents('.el-form-item').siblings().find('.el-select .el-input-icon').removeClass('is-reverse');
        $(this).siblings('.el-select-dropdown').toggle();
        if ($(this).find('.selectValue').length) {
            $(this).parents('.el-form-item').find('.el-select-dropdown').width($(this).find('.selectValue').width() + 10)
        } else {
            $(this).parents('.el-form-item').find('.el-select-dropdown').width($(this).width())
        }

    });
    //下拉框item点击事件
    $('body').on('click', '.el-select-dropdown-item:not(.el-auto)', function (e) {
        if (!$(this).parents().hasClass('addImage_form')) {
            if (!$(this).parents('.el-form-item').hasClass('descSelect')) {
                e.stopPropagation();
                $(this).parent().find('.el-select-dropdown-item').removeClass('selected');
                $(this).addClass('selected');
                if ($(this).hasClass('selected')) {
                    var ele = $(this).parents('.el-select-dropdown').siblings('.el-select');
                    ele.find('.el-input').val($(this).text());
                    ele.find('.val_id').val($(this).attr('data-id'));
                    if ($(this).parents('.el-form-item').hasClass('imgSource')) {
                        getImgSelectAttr($(this).attr('data-id'));
                    }
                    if ($(this).parents('.el-form-item').hasClass('type')) {
                        getImgGroupType($(this).attr('data-id'))
                    }
                    if (ele.find('.val_id').attr('id') == 'product_type_id') {
                        typeCode.pro = $(this).parents('.el-select-dropdown').find('.el-select-dropdown-item.selected').attr('data-code');
                        getPracticeCode(typeCode)
                    }
                    if (ele.find('.val_id').attr('id') == 'practice_type_id') {
                        typeCode.prac = $(this).parents('.el-select-dropdown').find('.el-select-dropdown-item.selected').attr('data-code');
                        getPracticeCode(typeCode)
                    }
                }
                $(this).parents('.el-select-dropdown').hide().siblings('.el-select').find('.el-input-icon').removeClass('is-reverse');
            }
        }
    });
    //用处
    $('body').on('click', '.el-form-item.descSelect .el-select-dropdown-item', function (e) {
        e.stopPropagation();
        $(this).parents('.el-select-dropdown').hide().siblings('.el-select').find('.el-input-icon').removeClass('is-reverse');
        var selectInput = $('.descSelect .selectValue.desc');

        if (!$(this).hasClass('proceDisabled')) {
            var proId = $(this).attr('data-id'),
                proText = $(this).text();

            var tips = `<span class="proceTip ability" data-id="${proId}">${proText}<i class="fa fa-close proceTipDel"></i></span>`;

            selectInput.append(tips);
            usageIds.push({
                'id': proId
            });
            $('.descSelect .errorMessage').html('');

            $(this).addClass('proceDisabled');
        }
        $('.el-form-item.descSelect .proceTipDel').click(function (e) {
            e.preventDefault();
            e.stopPropagation();

            var ids = $(this).parents('.proceTip').attr('data-id');
            $('.descSelect .selectValue span').remove('.proceTip[data-id=' + ids + ']');

            $('.el-form-item.descSelect .el-select-dropdown-item[data-id=' + ids + ']').removeClass('proceDisabled');

            usageIds.forEach(function (item, index) {
                if (item.id == ids) {
                    usageIds.splice(index, 1);
                }
            })
        })
    })
    //搜索用处
    $('body').on('click', '.el-form-item.search_descSelect .el-select-dropdown-item', function (e) {
        e.stopPropagation();
        $(this).parents('.el-select-dropdown').hide().siblings('.el-select').find('.el-input-icon').removeClass('is-reverse');
        var selectInput = $('.search_descSelect .selectValue.desc');

        if (!$(this).hasClass('proceDisabled')) {
            var proId = $(this).attr('data-id'),
                proText = $(this).text();

            var tips = `<span class="proceTip ability" data-id="${proId}">${proText}<i class="fa fa-close proceTipDel"></i></span>`;

            selectInput.append(tips);
            $(this).addClass('proceDisabled');
        }
        $('.el-form-item.search_descSelect .proceTipDel').click(function (e) {
            e.preventDefault();
            e.stopPropagation();

            var ids = $(this).parents('.proceTip').attr('data-id');
            $('.search_descSelect .selectValue span').remove('.proceTip[data-id=' + ids + ']');

            $('.el-form-item.search_descSelect .el-select-dropdown-item[data-id=' + ids + ']').removeClass('proceDisabled');
        })
    })
    //搜索做法
    $('body').on('click', '#searchForm.search_wrap .submit', function (e) {
        e.stopPropagation();
        $('#searchForm.search_wrap .el-item-hide').slideUp(400, function () {
            $('#searchForm.search_wrap .el-item-show').css('background', 'transparent');
        });
        $('.arrow .el-input-icon').removeClass('is-reverse');
        var parentForm = $('#searchForm.search_wrap');
        var name = encodeURIComponent(parentForm.find('#searchName').val()),
            code = parentForm.find('#searchCode').val(),
            practice_category_id = parentForm.find('#practice_category_id').val(),
            product_type_id = parentForm.find('#product_type_id').val();
        var id = $('.procedure_list ul li.selected').attr('data-id');
        var desc = $('.search_descSelect .selectValue.desc').find('span'),
            desc_arr = [];
        if (desc.length) {
            desc.each(function (k, v) {
                desc_arr.push($(v).attr('data-id'))
            })
        }
        searchData = {
            name: name,
            practice_code: code,
            description_id: desc_arr.join(','),
            practice_category_id: practice_category_id,
            product_type_id: product_type_id
        };
        getPracticeData(id);
    });
    //搜索重置
    $('body').on('click', '#searchForm .reset', function (e) {
        $('#searchForm.search_wrap .el-item-hide').slideUp(400, function () {
            $('#searchForm.search_wrap .el-item-show').css('background', 'transparent');
        });
        var parentForm = $('#searchForm.search_wrap');
        parentForm.find('#searchName').val('');
        parentForm.find('#searchCode').val('');
        parentForm.find('.selectValue').html('');
        var id = $('.procedure_list ul li.selected').attr('data-id');
        searchData = {
            name: '',
            practice_code: '',
            description_id: '',
            practice_category_id: '',
            product_type_id: ''
        };
        parentForm.find('#practice_category_id').val('').siblings('.el-input').val('--请选择--');
        parentForm.find('#product_type_id').val('').siblings('.el-input').val('--请选择--');
        $('.el-select-dropdown-item').removeClass('selected');
        $('.el-select-dropdown').hide();
        getPracticeData(id)
    });
    //工序tap切换
    $('body').on('click', '.procedure_list ul li', function () {
        count=0;
        $(this).addClass('selected').siblings().removeClass('selected');
        var id = $(this).attr('data-id');
        if ($(this).hasClass('selected')) {
            getPracticeData(id);
            typeCode = {
                pro: '',
                prac: ''
            }
        }
    });
    //弹窗工序tap切换
    $('body').on('click', '.chain_procedure ul li', function () {
        $(this).addClass('selected').siblings().removeClass('selected');
        var id = $(this).attr('data-id');
        if ($(this).hasClass('selected')) {
            searchChainData = {
                practice_code: '',
                name: '',
                description_id: '',
                operation_id: id,
                _token: TOKEN
            }
            getPracticeModal(id);
        }
    });
    //添加做法页面
    $('body').on('click', '.operation_add', function (e) {
        img_collection = [];
        imgchecks = [];
        getMaterialCate();
        getDescription();
        getProTypeTree();
        getPracTypeTree();
        var practice_id = $('.procedure_list ul li.selected').attr('data-id');
        getPracticeList(practice_id, 'add', []);
        $('.way_list li').removeClass('selected');
        showOperationHtml('add', 0, []);
        typeCode = {
            pro: '',
            prac: ''
        }
    });
    //做法tap切换
    $('body').on('click', '.list_wrap li span', function () {
        $(this).parents('li').addClass('selected').siblings().removeClass('selected');

        var id = $(this).parents('li').attr('data-id');
        if ($(this).parents('li').hasClass('selected')) {
            getAllPractice(id);
            //获取做法图片顺序集合
            practiceOrderImg = [];
            getPracticeOrderImg(id);
            getPracticeLine(id);
        }
    });
    $('body').on('click', '.img_icon img', function () {
        var id = $(this).attr('data-id');
        id != 0 && id != undefined ? getImgInfo(id) : '';
    });
    //做法字段删除
    $('body').on('click', '.practice_delete', function (e) {
       
        count = 0;
        $(this).parents('tr').addClass('none');
        $('.operation_list').find('.errorMessage').addClass('active').html('');
        var tr_length = $('.operation_list .table_tbody tr:not(.none)');
       
        tr_length.each(function (index, item) {
            $(this).find('.tr_count').html(index + 1);
        });
        count = tr_length.length;
    });
    //做法字段添加可重复
    $('body').on('click', '.practice_add_item', function (e) {
        var tr_id = $(this).parents('tr').attr('data-id'),
            flag = '',
            tr_index = $(this).parents('tr').attr('data-index'),
            tr_pfid = $(this).parents('tr').attr('data-pfid');
        if ($(this).hasClass('edit')) {
            showSelectPracticeModal(tr_id, tr_pfid, 'edit');
        } else {
            showSelectPracticeModal(tr_id, tr_index, 'add');
        }
    });
    $('body').on('click', '.add_aField', function (e) {
        showSelectPracticeModal('', '', 'addTotal');
           
    });
   
    $('body').on('click', '.submit.practice_item_add', function (e) {
        unique_num = unique_num + 1;
        var tr_id = $(this).parents('#practice_field_item').find('#itemId').val();
        var id = $(this).parents('#practice_field_item').find('#practice_item_id').val();
        var tr_index = $(this).parents('#practice_field_item').find('#itemId').attr('data-index');
        var pfid = $('.list_wrap ul li.selected').attr('data-id'),
            edit_pfid = '';
        var name = $(this).parents('#practice_field_item').find('.el-select-dropdown-item.selected').attr('data-name');

        // if(id==""){
        //     var tr_length = $('.operation_list .table_tbody tr:not(.none)');
        //     tr_length.each(function (index, item) {
        //         $(this).find('.tr_count').html(index + 1);
        //     });
        //     count = tr_length.length;
        // }else{
        //     count = count + 1;
        // }
        if(id == "") {
            $(this).attr("disabled","disabled");
            $(this).addClass('is-disabled');
            $('#itemMessage').html("请选择做法字段");
            return;
        }

        var tr_length = $('.operation_list .table_tbody tr:not(.none)').length;

        if ($(this).hasClass('edit')) {
            getPfid({
                _token: TOKEN,
                practice_id: pfid,
                field_id: id
            }, tr_id, id, name, tr_index)
        } else if($(this).hasClass('addTotal')) {
            count = tr_length + 1;
            var tr = `<tr data-id="${id}" data-pfid="" data-index="${unique_num}">
                  <td class="tr_count">${count}</td>
                  <td>${name}</td>
                  <td><div class="img_name"><input type="text" id="imgs" data-id="" data-name="" data-path="" class="el-input imgs add" readonly="readonly" style="width: 80px;" placeholder="选择图纸"/></div></td>
                  <td><div class="img_icon"></div></td>
                  <td><div class="img_attr"></div></td>
                  <td><textarea type="textarea" maxlength="500" style="min-width: 200px" id="desc" rows="1" class="el-textarea" placeholder="请输入备注"></textarea></td>
                  <td>
                      <span class="practice_add_item add" style="font-size: 14px;color:rgba(32, 160, 255, 0.8)"><i class="fa fa-plus-square"></i></span>
                       &nbsp;
                      <span class="practice_delete" style="font-size: 14px;color: rgba(227, 0, 0, 0.6)"><i class="fa fa-minus-circle"></i></span>
                  </td>
              </tr>`;
           
                $('.operation_list .table_tbody').append(tr);
                layer.close(layerModal);
           
        } else if ($(this).hasClass('add')) {
            var tr = `<tr data-id="${id}" data-pfid="" data-index="${unique_num}">
                  <td class="tr_count">${count}</td>
                  <td>${name}</td>
                  <td><div class="img_name"><input type="text" id="imgs" data-id="" data-name="" data-path="" class="el-input imgs add" readonly="readonly" style="width: 80px;" placeholder="选择图纸"/></div></td>
                  <td><div class="img_icon"></div></td>
                  <td><div class="img_attr"></div></td>
                  <td><textarea type="textarea" maxlength="500" style="min-width: 200px" id="desc" rows="1" class="el-textarea" placeholder="请输入备注"></textarea></td>
                  <td>
                      <span class="practice_add_item add" style="font-size: 14px;color:rgba(32, 160, 255, 0.8)"><i class="fa fa-plus-square"></i></span>
                       &nbsp;
                      <span class="practice_delete" style="font-size: 14px;color: rgba(227, 0, 0, 0.6)"><i class="fa fa-minus-circle"></i></span>
                  </td>
              </tr>`;
            
                $('.operation_list tr[data-id=' + tr_id + '][data-index=' + tr_index + ']').after(tr);
                layer.close(layerModal);
           
        } else {
            var tr = `<tr data-id="${id}" data-pfid="" data-index="${unique_num}">
                  <td class="tr_count">${count}</td>
                  <td>${name}</td>
                  <td><div class="img_name"><input type="text" id="imgs" data-id="" data-name="" data-path="" class="el-input imgs add" readonly="readonly" style="width: 80px;" placeholder="选择图纸"/></div></td>
                  <td><div class="img_icon"></div></td>
                  <td><div class="img_attr"></div></td>
                  <td><textarea type="textarea" maxlength="500" style="min-width: 200px" id="desc" rows="1" class="el-textarea" placeholder="请输入备注"></textarea></td>
                  <td>
                      <span class="practice_add_item add" style="font-size: 14px;color:rgba(32, 160, 255, 0.8)"><i class="fa fa-plus-square"></i></span>
                       &nbsp;
                      <span class="practice_delete" style="font-size: 14px;color: rgba(227, 0, 0, 0.6)"><i class="fa fa-minus-circle"></i></span>
                  </td>
              </tr>`;
            
                $('.operation_list .table_tbody').append(tr);
                layer.close(layerModal);
        }
    });
    //删除图纸选项卡下面的图片列表
    $('body').on('click', '.image_collect', function (e) {
        e.stopPropagation();
        var id = $(this).parents('tr').attr('data-id');
        $(this).parents('tr').addClass('none');
        for (var j = 0; j < img_collection.length; j++) {
            if (img_collection[j].id == id) {
                img_collection.splice(j, 1);
            }
        }
        var tr_img=$('.img_collect_wrap .table_tbody tr:not(.none)');
        tr_img.each(function (index, item) {
            $(this).find('.img_count').html(index + 1);
        });
        
    });
    //做法字段修改之后点击保存事件
    $('body').on('click', '.submit.practice_add:not(.is-disabled)', function (e) {
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
                var parentForm = $('#operation_form'),
                    id = parentForm.find('#itemId').val();
                var name = parentForm.find('#name').val().trim(),
                    code = parentForm.find('#code').val().trim(),
                    m_c_id = parentForm.find('#m_c_id').val(),
                    product_type_id = parentForm.find('#product_type_id').val(),
                    practice_category_id = parentForm.find('#practice_type_id').val(),
                    operation_id = $('.procedure_list li.selected').attr('data-id'),
                    description_ids = [],
                    fields = [],
                    images = [];
                var len = $('.operation_list .table_tbody tr:not(.none)'),
                    img_len = $('.img_collect_wrap .table_tbody tr:not(.none)');

                if (len.length) {
                    $(len).each(function (k, v) {
                        var img = $(v).find('.img_name .imgs'),
                            strId = [],
                            strName = [],
                            strUrl = [],
                            strDesc = [];
                        if (img.length) {
                            $(img).each(function (i, w) {
                                strId.push($(w).attr('data-id'));
                                strName.push($(w).attr('data-name'));
                                strUrl.push($(w).attr('data-path'));
                                strDesc.push($(w).attr('data-desc'));
                            })
                        }

                        var obj = {
                            field_id: $(v).attr('data-id'),
                            pfid: $(v).attr('data-pfid'),
                            order: k + 1,
                            img_name: strName.join(','),
                            img_id: strId.join(','),
                            img_url: strUrl.join(','),
                            // img_attribute:strDesc.join('|||'),
                            description: $(v).find('#desc').val()
                        };
                        fields.push(obj)
                    })

                }

                if (img_len.length) {
                    $(img_len).each(function (k, v) {
                        var imgObj = {
                            img_id: $(v).attr('data-id'),
                            description: $(v).find('#img_desc').val()
                        };
                        images.push(imgObj);
                    })
                }
                var _desc = $('.selectValue .proceTip.ability');
                if (_desc.length) {
                    $(_desc).each(function (k, v) {
                        description_ids.push($(v).attr('data-id'))
                    })
                }
                $(this).hasClass('edit') ? ($(this).hasClass('fix_name') ? editPractice({
                        name: name,
                        practice_id: id,
                        operation_id: operation_id,
                        description_ids: JSON.stringify(description_ids),
                        m_c_id: m_c_id,
                        product_type_id: product_type_id,
                        practice_category_id: practice_category_id,
                        _token: TOKEN,
                        fields: JSON.stringify(fields),
                        images: JSON.stringify(images)
                    }) :
                    editPractice({
                        name: name,
                        practice_id: id,
                        operation_id: operation_id,
                        description_ids: JSON.stringify(description_ids),
                        m_c_id: m_c_id,
                        product_type_id: product_type_id,
                        practice_category_id: practice_category_id,
                        _token: TOKEN,
                        fields: JSON.stringify(fields),
                        images: JSON.stringify(images)
                    })) : storePractice({
                    name: name,
                    code: code,
                    operation_id: operation_id,
                    description_ids: JSON.stringify(description_ids),
                    m_c_id: m_c_id,
                    product_type_id: product_type_id,
                    practice_category_id: practice_category_id,
                    _token: TOKEN,
                    fields: JSON.stringify(fields),
                    images: JSON.stringify(images)
                })
            }
        }
    });
    $('body').on('click', '.submit.chain_practice', function (e) {
        var parentForm = $('#chain_form'),
            line_id = parentForm.find('#itemId').val(),
            name = parentForm.find('#name').val();
        if (name == '') {
            parentForm.find('.el-form-item.line_name .errorMessage').html('名称不能为空')
        }
        if (field_select.length && name != "") {
            var p_id = $('.way_list li.selected').attr('data-id'),
                o_id = $('.procedure_list li.selected').attr('data-id');
            field_select.unshift({
                practice_id: p_id,
                operation_id: o_id
            });
            var relation = get_unique(field_select);
            $(this).hasClass('edit') ? editPracticeLine({
                    line_id: line_id,
                    _token: TOKEN,
                    relation: JSON.stringify(relation),
                    name: name
                }) :
                storePracticeLine({
                    _token: TOKEN,
                    relation: JSON.stringify(relation),
                    name: name
                })
        }
    });

    //选择图纸点击确认
    $('body').on('click', '.select_img_btn', function (e) {
        if (!$(this).hasClass('field_img')) { //图纸集合选择图纸
            layer.close(layerModal);
            $('.img_collect_wrap .table_tbody').html('');
            if (img_collection.length) {
                img_collection.forEach(function (item, index) {
                    var _attr = [];
                    if (item.attr.length) {
                        item.attr.forEach(function (aitem) {
                            _attr.push(`${aitem.definition_name}:${aitem.value}`)
                        })
                    }
                    var tr = ` <tr data-id="${item.id}">
                    <td class="img_count">${index+1}</td>
                    <td>${item.name}</td>
                    <td><div class="img_icon"><img onerror="this.onerror=null;this.src='/statics/custom/img/logo_default.png'" width="48" height="32" src="/storage/${item.url}" data-id="${item.id}" alt=""></div></td>
                    <td>${_attr.join(',')}</td>
                    <td><textarea type="textarea" maxlength="500" style="min-width: 200px" id="img_desc" rows="1" class="el-textarea" placeholder="请输入备注">${item.desc}</textarea></td>
                    <td><span class="image_collect add" style="font-size: 14px;color: rgba(227, 0, 0, 0.6)"><i class="fa fa-minus-circle"></i></span></td>
                </tr>`;
                    $('.img_collect_wrap .table_tbody').append(tr);
                })
            }
        } else { //做法字段选择图纸保存
            layer.close(layerModal);
            var parentForm = $('#img_select_form'),
                tr_id = parentForm.find('#itemId').val(),
                tr_index = parentForm.find('#itemId').attr('data-index');

            if (imgchecks.length) {
                var tmp = 0;
                imgchecks.forEach(function (item, index) {
                    if (item.pfid == tr_index) {
                        tmp = 1;
                        return;
                    }
                });
                if (tmp == 1) {
                    $('.operation_list .table_tbody').find('tr[data-id=' + tr_id + '][data-index=' + tr_index + '] .img_icon').html('');
                    $('.operation_list .table_tbody').find('tr[data-id=' + tr_id + '][data-index=' + tr_index + '] .img_name').html('');
                    $('.operation_list .table_tbody').find('tr[data-id=' + tr_id + '][data-index=' + tr_index + '] .img_attr').html('');
                }

                imgchecks.forEach(function (item, index) {
                    if (item.pfid == tr_index) {

                        var imgs = `<p><img data-img-id="${item.id}" onerror="this.onerror=null;this.src='/statics/custom/img/logo_default.png'" width="48" height="32" src="/storage/${item.url}" alt="${item.name}"></p>`;
                        var imgname = `<p><input type="text" id="imgs" data-id="${item.id}" data-index="${tr_index}" data-desc="${item.attr}" data-path="${item.url}" class="el-input imgs edit" data-name="${item.name}" style="width: 80px;" readonly="readonly" placeholder="选择图纸" value="${item.name}"></p>`;
                        var attr = `<p style="height: 32px;overflow: hidden;">${tansferNull(item.attr).length > 27 ? tansferNull(item.attr).substring(0, 25) + '...' : tansferNull(item.attr)}</p>`;
                    }

                    $('.operation_list .table_tbody').find('tr[data-id=' + tr_id + '][data-index=' + tr_index + '] .img_icon').append(imgs);
                    $('.operation_list .table_tbody').find('tr[data-id=' + tr_id + '][data-index=' + tr_index + '] .img_name').append(imgname);
                    $('.operation_list .table_tbody').find('tr[data-id=' + tr_id + '][data-index=' + tr_index + '] .img_attr').append(attr);

                });

            }
            layer.close(layerModal);
        }
    });
    $('body').on('click', '.oper_icon', function (e) {
        $(this).parents('li').addClass('selected').siblings().removeClass('selected');
        var id = $(this).attr('data-id');
        img_collection = [];
        if ($(this).hasClass('edit')) {
            checkHasUse(id, 'edit');
        } else if ($(this).hasClass('delete')) {
            checkHasUse(id, 'delete');
        } else {
            showPracticeChain('chain')
        }
    });
    $('body').on('click', '.operation_list .el-input.imgs', function (e) {
        var tr_id = $(this).parents('tr').attr('data-id');
        var tr_index = $(this).parents('tr').attr('data-index');
        img_flag = 'field_img';
        selectImg = {
            tr_id: tr_id,
            img_name: $(this).val(),
            tr_index: tr_index,
            img_id: $(this).attr('data-id'),
            flag: 'field_img'
        };
        showImageModal(tr_id, $(this).val(), $(this).attr('data-id'), tr_index, 'field_img');
    });
    //添加图纸集合
    $('body').on('click', '.add_imgs', function () {
        img_flag = 'total_img';
        selectImg = {
            tr_id: '',
            img_name: '',
            tr_index: '',
            img_id: '',
            flag: 'total_img'
        };
        showImageModal('', '', '', '', 'total_img');
    });
    //编辑做法线
    $('body').on('click', '.line_edit', function () {
        var line_id = $(this).attr('data-id');
        getAlineData(line_id)
    });
    //删除做法线
    $('body').on('click', '.line_delete', function () {
        var line_id = $(this).attr('data-id');
        layer.confirm('将执行删除操作?', {
            icon: 3,
            title: '提示',
            offset: '250px',
            end: function () {}
        }, function (index) {
            layer.close(index);
            deleteLine(line_id);
        });
    });
    //搜索做法线
    $('body').on('click', '.search-item-chain .submit', function (e) {
        e.stopPropagation();
        var parentForm = $(this).parents('#chain_form'),
            id = $('.chain_procedure ul li.selected').attr('data-id');
        searchChainData = {
            practice_code: parentForm.find('#chain_code').val(),
            name: parentForm.find('#chain_name').val(),
            description_id: '',
            operation_id: id,
            _token: TOKEN
        }
        getPracticeModal(id)
    })
    //查看图纸集合
    $('body').on('click', '.button.img_collection', function (e) {
        var id = $(this).attr('data-id');
        if (id != undefined) {
            getImgCollection(id)
        }
    });
    $('body').on('click', '#searchForm .choose-search', function (e) {
        e.stopPropagation();
        $('#searchForm .el-item-hide').slideUp(400, function () {
            $('#searchForm .el-item-show').css('background', 'transparent');
            $('.arrow .el-input-icon').removeClass('is-reverse');
        });

        var parentForm = $(this).parents('#searchImgAttr_from');
        var ele = $('.template_attr_wrap .attr_item'),
            _temp = [];
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
        ajaxData = {
            code: parentForm.find('#searchCode').val(),
            name: parentForm.find('#searchName').val(),
            creator_name: parentForm.find('#searchCreator').val(),
            drawing_attributes: JSON.stringify(_temp),
            category_id: parentForm.find('#img_source').val(),
            group_id: parentForm.find('#group_id').val(),
            type_id: parentForm.find('#type_id').val(),
            order: 'desc',
            sort: 'ctime'
        };
        getImageSource('', img_flag);
    });
    $('body').on('focus', '#chain_form .el-input', function () {
        $(this).parents('.el-form-item').find('.errorMessage').removeClass('active').html("");
    });
    $('body').on('focus', '#operation_form .el-input:not([readonly])', function () {
        $('.operation_list').find('.errorMessage').addClass('active').html('');
        $(this).parents('.el-form-item').find('.errorMessage').removeClass('active').html("");
    }).on('blur', '#operation_form .el-input:not([readonly])', function () {
        var name = $(this).attr("id"),
            id = $('#operation_form #itemId').val();
        validatorConfig[name] &&
            validatorToolBox[validatorConfig[name]] &&
            validatorToolBox[validatorConfig[name]](name) &&
            remoteValidatorConfig[name] &&
            remoteValidatorToolbox[remoteValidatorConfig[name]] &&
            remoteValidatorToolbox[remoteValidatorConfig[name]](name, id);
    });
    //下拉框的相关事件
    $('body').on('focus', '.el-select .el-input', function () {
        $(this).parents('.el-form-item').find('.errorMessage').removeClass('active').html("");
    }).on('blur', '.el-select .el-input', function () {
        $('.practice_item_add').removeAttr("disabled");
        $('.practice_item_add').removeClass('is-disabled');
        var name = $(this).siblings('input').attr("id");
        var obj = $(this);
        setTimeout(function () {
            if (obj.siblings('input').val() == '') {
                validatorConfig[name] &&
                    validatorToolBox[validatorConfig[name]] &&
                    validatorToolBox[validatorConfig[name]](name);
            } else {
                $('#operation_form').find('#' + name).parents('.el-form-item').find('.errorMessage').removeClass('active').html("");
            }
        }, 200);
    });
    $('body').on('click', '.pic-img', function () {
        var imgList, current;
        imgList = $(this);
        current = $(this).attr('data-id');
        showBigImg(imgList, current);
    });

    $('body').on('click', '.practice_line .content .oper_prac p', function () {
        var oId = $(this).parents('.content').attr('data-oid'),
            pracId = $(this).attr('data-pracId');
        $('.procedure_list ul').find('li[data-id=' + oId + ']').addClass('selected').siblings().removeClass('selected');
        getPracticeData(oId, pracId)
    });
    //图纸放大
    $('body').on('click', '.el-icon.fa-search-plus', function (e) {
        e.stopPropagation();
        e.preventDefault();
        var obj = $(this).parent().siblings('.pic-detail-wrap').find('img');
        zoomPic(1, obj);
    });

    //图纸缩小
    $('body').on('click', '.el-icon.fa-search-minus', function (e) {
        e.stopPropagation();
        e.preventDefault();
        var obj = $(this).parent().siblings('.pic-detail-wrap').find('img');
        zoomPic(-1, obj);
    });

    //图纸旋转
    $('body').on('click', '.el-icon.fa-rotate-right', function (e) {
        e.stopPropagation();
        e.preventDefault();
        var obj = $(this).parent().siblings('.pic-detail-wrap').find('img');
        rotatePic(obj);
    });
    //图纸前一页
    $('body').on('click', '.el-icon.fa-chevron-left', function (e) {
        e.stopPropagation();
        e.preventDefault();
        var current_img_id = $(this).attr('data-drawingId');
        var new_img_id = filterPracticeOrderImg(current_img_id, practiceOrderImg, 'prev');
        if (new_img_id != 0) {
            layer.close(layerModal);
            getImgInfo(new_img_id)
        }
    })
    //图纸后一页
    $('body').on('click', '.el-icon.fa-chevron-right', function (e) {
        e.stopPropagation();
        e.preventDefault();
        var current_img_id = $(this).attr('data-drawingId');
        var new_img_id = filterPracticeOrderImg(current_img_id, practiceOrderImg, 'next');
        if (new_img_id != 0) {
            layer.close(layerModal);
            getImgInfo(new_img_id)
        }
    })
}

function getPracticeOrderImg(id) {
    AjaxClient.get({
        url: URLS['workWay'].showPracticeOrderImg + "?practice_id=" + id + "&" + _token,
        dataType: 'json',
        success: function (rsp) {
            if (rsp.results && rsp.results.length) {
                rsp.results.forEach(function (item, index) {
                    if (item.img_id != null && item.img_id != 0) {
                        practiceOrderImg.push(item.img_id)
                    }
                });
            }
        },
        fail: function (rsp) {
            console.log('获取做法图片失败');
        }
    }, this);
}

function filterPracticeOrderImg(current_id, prac_img, flag) {
    var img_id;
    if (flag == 'next') {
        if (prac_img.length) {
            if (prac_img.length == 1) {
                img_id = 0
            } else {
                for (var i = 0; i < prac_img.length; i++) {
                    if (current_id == prac_img[i]) {
                        if (i > 0) {
                            img_id = prac_img[i - 1]
                        } else {
                            img_id = 0
                        }
                    }
                }
            }

        }
    } else {
        if (prac_img.length) {
            if (prac_img.length == 1) {
                img_id = 0
            } else {
                for (var j = 0; j < prac_img.length; j++) {
                    if (current_id == prac_img[j]) {
                        if (j + 1 == prac_img.length) {
                            img_id = 0
                        } else {
                            img_id = prac_img[j + 1]
                        }

                    }
                }
            }

        }
    }

    return img_id
}

function getPracticeCode() {
    if ($('#operation_form').attr('data-flag') != 'edit') {
        var _type_code = '',
            procedure_code = $('.procedure_list li.selected').attr('data-code');
        if (typeCode.pro && typeCode.prac) {
            _type_code = `${procedure_code}-${typeCode.pro}-${typeCode.prac}`;
            AjaxClient.post({
                url: URLS['workWay'].getCode,
                dataType: 'json',
                data: {
                    _token: TOKEN,
                    type_code: _type_code,
                    type: 8
                },
                beforeSend: function () {
                    layerLoading = LayerConfig('load');
                },
                success: function (rsp) {
                    layer.close(layerLoading);
                    $('#operation_form #code').val(rsp.results.code)
                },
                fail: function (rsp) {
                    layer.close(layerLoading);
                    if (rsp && rsp.message != undefined && rsp.message != null) {
                        LayerConfig('fail', rsp.message);
                    }
                }
            }, this);
        }
    }
}

function get_unique(arr) {
    var result = [];
    for (var i = 0; i < arr.length; i++) {
        if (i == 0) result.push(arr[i]);
        b = false;
        if (result.length > 0 && i > 0) {
            for (var j = 0; j < result.length; j++) {
                if (arr[i].practice_id == result[j].practice_id) {
                    b = true;
                }
            }
            if (!b) {
                result.push(arr[i])
            }
        }
    }
    return result;
}
//获取pfid
function getPfid(data, tr_id, id, name, tr_index) {
   
    AjaxClient.post({
        url: URLS['workWay'].addFields,
        data: data,
        dataType: 'json',
        success: function (rsp) {
            var currentNumber = $('.operation_list tr[data-id=' + tr_id + '][data-pfid=' + tr_index + ']').find('.tr_count').html();
            count = Number(currentNumber) + 1;
            console.log($('.operation_list tr[data-id=' + tr_id + '][data-pfid=' + tr_index + ']').find('.tr_count').html(), '====');
            var tr = `<tr data-id="${id}" data-pfid="${rsp.results}" data-index="${rsp.results}">
                  <td class="tr_count">${count}</td>
                  <td>${name}</td>
                  <td><input type="text" id="imgs" data-id="" data-name="" data-path="" class="el-input imgs edit" readonly="readonly" style="width: 80px;" placeholder="选择图纸"/></td>
                  <td><div class="img_icon"></div></td>
                  <td><div class="img_attr"></div></td>
                  <td><textarea type="textarea" maxlength="500" id="desc" style="min-width: 200px" rows="1" class="el-textarea" placeholder="请输入备注"></textarea></td>
                  <td>
                      <span class="practice_add_item edit" style="font-size: 14px;color:rgba(32, 160, 255, 0.8)"><i class="fa fa-plus-square"></i></span>
                       &nbsp;
                      <span class="practice_delete" style="font-size: 14px;color: rgba(227, 0, 0, 0.6)"><i class="fa fa-minus-circle"></i></span>
                  </td>
              </tr>`;
           
                $('.operation_list tr[data-id=' + tr_id + '][data-pfid=' + tr_index + ']').after(tr);
                layer.close(layerModal);

                var tr_length = $('.operation_list .table_tbody tr:not(.none)');
                tr_length.each(function (index, item) {
                    if(index > currentNumber) {
                        count++;
                        $(this).find('.tr_count').html(count);
                    }
                });
            
        },
        fail: function (rsp) {
            console.log('获取pfid失败');
        }
    }, this);
}

function showOperationHtml(flag, ids, data, exist, code) {
    var readonly = '',
        btnShow = '';
    if (exist) {
        exist > 0 ? (readonly = 'readonly', btnShow = 'btnHide') : (readonly = '', btnShow = 'btnShow');
    }
    var html = `<div class="operation_form" id="operation_form" data-flag="${flag}">
                    <input type="hidden" id="itemId" value="${ids}">
                    <div class="practice_info">
                        <div>
                            <div class="el-form-item">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label" style="width: 100px;">编码<span class="mustItem">*</span></label>
                                    <input type="text" id="code" ${flag=='edit'? 'readonly':''} ${readonly} value="${code?code.code:''}" data-name="编码" class="el-input" placeholder="请输入编码">
                                </div>
                                <p class="errorMessage" style="padding-left: 100px;display: block"></p>
                            </div>
                            <div class="el-form-item">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label" style="width: 100px;">名称<span class="mustItem">*</span></label>
                                    <input type="text" id="name" value="" data-name="名称" class="el-input" placeholder="请输入名称">
                                </div>
                                <p class="errorMessage" style="padding-left: 100px;display: block"></p>
                            </div>
                            
                        </div>

                        <div style="margin-left:20px;">
                            <div class="el-form-item mate">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label" style="width: 115px;">物料分类<span class="mustItem">*</span></label>
                                   <div class="el-select-dropdown-wrap">
                                        <div class="el-select">
                                            <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                            <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                                            <input type="hidden" class="val_id" id="m_c_id" value="">
                                        </div>
                                        <div class="el-select-dropdown">
                                            <ul class="el-select-dropdown-list">
                                                <li data-id="" class="el-select-dropdown-item kong" data-name="--请选择--">--请选择--</li>
                                            </ul>
                                        </div>
                                    </div>
        
                                </div>
                                <p class="errorMessage" style="padding-left: 100px;display: block"></p>
                            </div>
                            <div class="el-form-item descSelect">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label" style="width: 100px;">用处</label>
                                    <div class="el-select-dropdown-wrap">
                                        <div class="el-select">
                                            <div class="selectValue desc"></div>
                                            <input type="hidden" class="val_id" id="description_id" value="">
                                        </div>
                                        <div class="el-select-dropdown">
                                            <ul class="el-select-dropdown-list">
                                                <li data-id="" class="el-select-dropdown-item kong proceDisabled" data-name="--请选择--">--请选择--</li>
                                               
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                                <p class="errorMessage" style="padding-left: 100px;display: block"></p>
                            </div>
                        </div>
                        <div style="margin-left:20px;">
                            <div class="el-form-item proCate">
                                    <div class="el-form-item-div">
                                        <label class="el-form-item-label" style="width: 110px;">产品分类<span class="mustItem">*</span></label>
                                        <div class="el-select-dropdown-wrap">
                                            <div class="el-select">
                                                <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                                <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                                                <input type="hidden" class="val_id" id="product_type_id" value="">
                                            </div>
                                            <div class="el-select-dropdown">
                                                <ul class="el-select-dropdown-list">
                                                    <li data-id="" class="el-select-dropdown-item kong" data-name="--请选择--">--请选择--</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                    <p class="errorMessage" style="padding-left: 100px;display: block"></p>
                            </div>
                            <div class="el-form-item pracTice">
                                    <div class="el-form-item-div">
                                        <label class="el-form-item-label" style="width: 110px;">做法分类<span class="mustItem">*</span></label>
                                        <div class="el-select-dropdown-wrap">
                                            <div class="el-select">
                                                <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                                <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                                                <input type="hidden" class="val_id" id="practice_type_id" value="">
                                            </div>
                                            <div class="el-select-dropdown">
                                                <ul class="el-select-dropdown-list">
                                                    <li data-id="" class="el-select-dropdown-item kong" data-name="--请选择--">--请选择--</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                    <p class="errorMessage" style="padding-left: 100px;display: block"></p>
                            </div>
                            
                        </div>
                        
                    </div>
                    <div class="tab_wrap">
                        <div class="tap-btn-wrap">
                            <div class="el-tap-wrap edit">
                                <span data-item="practiceField" class="el-tap active">步骤</span>
                                <span data-item="practiceImage" class="el-tap">图纸</span>
                            </div>
                            <div class="el-form-item btnShow saveBtn">
                               <div class="el-form-item-div btn-group">
                                   <span class="no_edit"></span>
                                   <button type="button" class="el-button el-button--primary submit practice_add ${exist>0?'fix_name':''} ${flag}">保存</button>
                               </div>
                            </div>
                        </div>
                        <div class="el-panel-wrap" style="margin-top:20px;">
                            <div class="el-panel practiceField active">
                                 <div class="operation_list">
                                        <button class="button add_aField ${exist&&exist>0? 'none':''}" type="button">添加步骤</button>
                                        <div style="max-height: 430px; overflow-y: auto;">
                                            <table class="sticky uniquetable commontable">
                                                <thead>
                                                    <tr>
                                                        <th class="left nowrap tight">序号</th>
                                                        <th class="left nowrap tight">步骤</th>
                                                        <th class="left nowrap tight">选择图纸</th>
                                                        <th class="left nowrap tight">图纸</th>
                                                        <th class="left nowrap tight">图纸属性</th>
                                                        <th class="left nowrap tight">标准工艺</th>
                                                        <th class="left nowrap tight ${exist&&exist>0? 'none':''}">操作</th>
                                                    </tr>
                                                </thead>
                                                <tbody class="table_tbody"></tbody>
                                            </table>
                                        </div>
                                        <p class="errorMessage" style="padding-left: 100px;display: block"></p>
                                 </div>
                            </div>
                            <div class="el-panel practiceImage">
                               <div class="img_collect_wrap">
                                    <button class="button add_imgs ${exist&&exist>0? 'none':''}" type="button">添加图纸</button>
                                    <div style="height: 430px; overflow-y: auto;">
                                        <table class="sticky uniquetable commontable">
                                            <thead>
                                                <tr>
                                                    <th class="left nowrap tight">序号</th>
                                                    <th class="left nowrap tight">图纸名称</th>
                                                    <th class="left nowrap tight">图纸</th>
                                                    <th class="left nowrap tight">图纸属性</th>
                                                    <th class="left nowrap tight">备注</th>
                                                    <th class="left nowrap tight"></th>
                                                </tr>
                                            </thead>
                                            <tbody class="table_tbody"></tbody>
                                        </table>
                                    </div>
                               </div>
                            </div>
                        </div>    
                    </div>
        </div>`;
    $('.way_wrap').html(html);
}

function checkHasUse(id, flag) {
    AjaxClient.get({
        url: URLS['workWay'].hasUsed + "?practice_id=" + id + "&" + _token,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            if (rsp.results.exist == 0) {
                if (flag == 'edit') {
                    viewPractice('edit', id, rsp.results.exist)
                } else {
                    layer.confirm('将执行删除操作?', {
                        icon: 3,
                        title: '提示',
                        offset: '250px',
                        end: function () {
                            $('.uniquetable tr.active').removeClass('active');
                        }
                    }, function (index) {
                        layer.close(index);
                        deletePracticeField(id);
                    });
                }
            } else {
                if (flag == 'edit') {
                    viewPractice('edit', id, rsp.results.exist);
                    // LayerConfig('fail','做法已经被占用，部分功能不可编辑')
                } else {
                    LayerConfig('fail', '做法已经被占用，不可删除')
                }
            }
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            console.log('做法检测失败');
        }
    }, this);
}

function viewPractice(flag, id, exist) {
    AjaxClient.get({
        url: URLS['workWay'].showPracticeField + "?practice_id=" + id + "&" + _token,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            getMaterialCate(rsp.results.base.m_c_id, exist);
            getProTypeTree(rsp.results.base.product_type_id, exist);
            getPracTypeTree(rsp.results.base.practice_category_id, exist);
            getDescription(rsp.results.base.description_id, exist);
            showOperationHtml(flag, id, rsp.results, exist);
            var practice_id = $('.procedure_list ul li.selected').attr('data-id');
            getPracticeList(practice_id, flag, rsp.results.fields, exist);
            getImageCollection($('.img_collect_wrap .table_tbody'), rsp.results.images);
            $('.operation_form #name').val(rsp.results.base.name);
            $('.operation_form #code').val(rsp.results.base.code);
            $('.operation_form #description').val(tansferNull(rsp.results.base.description));
            if (exist > 0) {
                $('.operation_form .no_edit').html('做法已被占用，部分字段不可编辑')
            }

        },
        fail: function (rsp) {
            layer.close(layerLoading);
            console.log('获取做法失败');
        }
    }, this);
}

function editPractice(data) {
    AjaxClient.post({
        url: URLS['workWay'].updatePracticeField,
        data: data,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            var id = $('.procedure_list li.selected').attr('data-id');
            getPracticeData(id, data.practice_id);
            // LayerConfig('success','编辑成功');
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            if (rsp && rsp.message != undefined && rsp.message != null) {
                LayerConfig('fail', rsp.message);
            } else {
                layer.msg('编辑失败', {
                    icon: 2,
                    offset: '250px',
                    time: 1500
                });
            }
        },
        complete: function () {
            $('#operation_form .submit').removeClass('is-disabled');
        }
    }, this);
}

function storePractice(data) {
    AjaxClient.post({
        url: URLS['workWay'].storePractice,
        data: data,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            // layer.close(layerModal);

            var id = $('.procedure_list li.selected').attr('data-id');
            getPracticeData(id, rsp.results);
            unique_num = 200;
            img_collection = [];
            imgchecks = [];
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            if (rsp && rsp.message != undefined && rsp.message != null) {
                LayerConfig('fail', rsp.message);
            } else {
                layer.msg('添加失败', {
                    icon: 2,
                    offset: '250px',
                    time: 1500
                });
            }
        },
        complete: function () {
            $('#operation_form .submit').removeClass('is-disabled');
        }
    }, this);
}

function deletePracticeField(id) {
    AjaxClient.post({
        url: URLS['workWay'].practiceDelete,
        data: {
            _token: TOKEN,
            practice_id: id
        },
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            var ids = $('.procedure_list li.selected').attr('data-id');
            getPracticeData(ids);

        },
        fail: function (rsp) {
            layer.close(layerLoading);
            if (rsp && rsp.message != undefined && rsp.message != null) {
                LayerConfig('fail', rsp.message);
            } else {
                layer.msg('删除失败', {
                    icon: 2,
                    offset: '250px',
                    time: 1500
                });
            }
        }
    }, this);
}
//获取字段表格数据
function getAllPractice(id) {
    var _table = `<div class="display_basic_info">
                        <div>
                            <div class="el-form-item" style="margin-right: 10px">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label" style="width: 100px;">编码</label>
                                    <span id="code"></span>
                                </div>
                                <p class="errorMessage" style="padding-left: 100px;display: block"></p>
                            </div>
                            <div class="el-form-item" style="margin-right: 10px">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label" style="width: 100px;">名称</label>
                                    <p id="name"></span>
                                </div>
                                <p class="errorMessage" style="padding-left: 100px;display: block"></p>
                            </div>
                            <div class="el-form-item desc">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label" style="width: 110px;">图纸集合</label>
                                    <button class="button img_collection" data-id="${id}">查看图纸集合</button>
                                </div>
                                <p class="errorMessage" style="padding-left: 100px;display: block"></p>
                            </div>
                        </div>
                        <div>
                            <div class="el-form-item mate">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label" style="width: 110px;">物料分类</label>
                                    <span id="m_c_name"></span>
                                </div>
                                <p class="errorMessage" style="padding-left: 100px;display: block"></p>
                            </div>
                            <div class="el-form-item desc">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label" style="width: 110px;">用处</label>
                                    <p id="description"></p>
                                </div>
                                <p class="errorMessage" style="padding-left: 100px;display: block"></p>
                            </div>
                        </div>
                        <div>
                            <div class="el-form-item proCate">
                                    <div class="el-form-item-div">
                                        <label class="el-form-item-label" style="width: 110px;">产品分类</label>
                                        <span id="product_type_name"></span>
                                    </div>
                                    <p class="errorMessage" style="padding-left: 100px;display: block"></p>
                            </div>
                            <div class="el-form-item proCate">
                                    <div class="el-form-item-div">
                                        <label class="el-form-item-label" style="width: 110px;">做法分类</label>
                                        <span id="practice-category_name"></span>
                                    </div>
                                    <p class="errorMessage" style="padding-left: 100px;display: block"></p>
                            </div>
                        </div>
                    </div>
                    <div  style="max-height: 430px; overflow-y: auto;">
                        <table class="sticky uniquetable commontable">
                            <thead>
                            <tr>
                                <th class="left nowrap tight">序号</th>
                                <th class="left nowrap tight">步骤</th>
                                <th class="left nowrap tight">图纸名称</th>
                                <th class="left nowrap tight">图纸</th>
                                <th class="left nowrap tight">图纸属性</th>
                                <th class="left nowrap tight">标准工艺</th>
                            </tr>
                            </thead>
                            <tbody class="table_tbody">

                            </tbody>
                        </table>
                    </div>`;
    $('.way_wrap').html('').append(_table);
    AjaxClient.get({
        url: URLS['workWay'].showPracticeField + '?' + _token + '&practice_id=' + id,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            img_collection = [];
            imgchecks = [];
            if (rsp && rsp.results) {
                if (rsp.results && rsp.results.base) {
                    var arr = ['code', 'name', 'm_c_name', 'description', 'product_type_name', 'practice-category_name'];
                    for (var i in arr) {
                        $('.display_basic_info').find('#' + arr[i]).html(rsp.results['base'][arr[i]]);
                    }
                    $('.display_basic_info').find('#description').attr('title', rsp.results.base.description)
                    $('.display_basic_info').find('#name').attr('title', rsp.results.base.name)
                }
                if (rsp.results.fields && rsp.results.images && rsp.results.fields.length) {
                    showPracticeField($('.way_wrap .table_tbody'), rsp.results.fields, rsp.results.images);

                } else {
                    var tr = `<tr><td colspan="6" style="text-align: center;color: #999;">暂无数据</td></tr>`;
                    $('.way_wrap .table_tbody').html(tr);
                }
            }

        },
        fail: function (rsp) {
            layer.close(layerLoading);
        }
    }, this);
}
//做法字段表格列表
function showPracticeField(ele, data, val) {
    ele.html('');
    data.forEach(function (item, index, vals) {
        //分割图纸名称，图纸，图纸id数组循环
        var imgid = [],
            imgname = [],
            imgnames = '',
            imgurl = [],
            imgurls = '',
            imgattr = [],
            imgattrs = '';
        imgid = item.img_id != null && item.img_id != '' ? item.img_id.split(',') : '';
        imgname = item.img_name != null && item.img_name != '' ? item.img_name.split(',') : '';
        imgurl = item.img_url != null && item.img_url != '' ? item.img_url.split(',') : '';
        imgattr = item.img_attribute != null && item.img_attribute != '' ? item.img_attribute.split('|||') : '';
        if (imgname != undefined) {
            for (i = 0; i < imgurl.length; i++) {
                if (imgname[i] != '' || imgid[i] != '' || imgname[i] != null || imgid[i] != null) {
                    if (imgname[i] != 'undefined') {
                        imgnames += `<p style="line-height: 31px;">${imgname[i]}</p>`;
                        imgurls += `<p style="min-height: 33px;"><img onerror="this.onerror=null;this.src=\'/statics/custom/img/logo_default.png\'" width="48" height="32" src="/storage/${imgurl[i]}" data-id="${imgid[i]}" alt=""></p>`;
                        imgattrs += `<p style="min-height: 33px;" title="${tansferNull(imgattr[i])}">${tansferNull(imgattr[i]).length > 27 ? tansferNull(imgattr[i]).substring(0, 25) + '...' : tansferNull(imgattr[i])}</p>`;
                    }
                }
            }
        }
        var tr = `<tr>
                    <td>${index+1}</td> 
                    <td>${item.name}</td>  
                    <td>${imgnames}</td>
                    <td><div class="img_icon">${imgurls}</div></td>
                    <td><div class="img_attr">${imgattrs}</div></td>
                    <td><p style="max-width:200px;word-break: break-all">${tansferNull(item.description)}</p></td>
                    <!--<td><button class="button pop-button delete" data-id="${item.pfid}">删除</button></td>-->
                </tr>`;
        ele.append(tr)
    })
}
//获取做法
function getPracticeData(id, practice_id) {
    searchData.operation_id = id;
    searchData._token = TOKEN;
    AjaxClient.post({
        url: URLS['workWay'].operationGetPractice,
        dataType: 'json',
        data: searchData,
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            img_collection = [];
            imgchecks = [];
            if (rsp.results && rsp.results.length) {

                showPracticeHtml($('.way_list'), rsp.results);
                if (practice_id) {
                    $('.way_list li[data-id=' + practice_id + ']').find('span').click();
                } else {
                    $('.way_list li span').eq(0).click()
                }
            } else {
                $('.way_list').html('');
                $('.practice_line').html('');
                var _table = `<table class="sticky uniquetable commontable">
                        <thead>
                        <tr>
                            <th class="left nowrap tight">步骤</th>
                            <th class="left nowrap tight">图纸名称</th>
                            <th class="left nowrap tight">图纸</th>
                            <th class="left nowrap tight">图纸属性</th>
                            <th class="left nowrap tight">标准工艺</th>
                        </tr>
                        </thead>
                        <tbody class="table_tbody">
                              <tr><td colspan="5" style="text-align: center;color: #999;">暂无数据</td></tr>
                        </tbody>
                    </table>`;
                $('.way_wrap').html('').append(_table);
            }
        },
        fail: function (rsp) {
            layer.close(layerLoading);
        }
    }, this);
}

function showPracticeHtml(ele, data) {
    ele.html('');
    data.forEach(function (item) {
        var li = `<li data-id="${item.id}">
                <span title="${item.name}">${item.name}</span>
                <i class="fa fa-minus-square oper_icon delete" title="删除做法" data-id="${item.id}"></i>
                <i class="fa fa-edit oper_icon edit" title="编辑做法" data-id="${item.id}" style="margin-right: 10px;color: #20a0ff"></i>
                <i class="fa fa-chain oper_icon link" title="关联做法" data-id="${item.id}" style="margin-right: 10px;color: #20a0ff"></i>
              </li>`;
        ele.append(li);
    })
}

function showImageModal(tr_id, img_name, img_id, tr_index, flag) {
    var labelWidth = 100,
        btnShow = '',
        fields = [];
    layerModal = layer.open({
        type: 1,
        title: '选择图纸',
        offset: '50px',
        area: '1000px',
        shade: 0.1,
        shadeClose: false,
        resize: false,
        content: `<div class="formModal" id="img_select_form" style="min-height:400px;">
                    <input type="hidden" id="itemId" value="${tr_id}" data-index="${tr_index}">
                    <div class="searchItem" id="searchForm">
                      <form class="searchMAttr searchModal formModal imgModal" id="searchImgAttr_from">
                          <div class="el-item">
                              <div class="el-item-show">
                                  <div class="el-item-align">
                                      <div class="el-form-item">
                                          <div class="el-form-item-div">
                                              <label class="el-form-item-label">编码</label>
                                              <input type="text" id="searchCode" class="el-input" placeholder="请输入编码" value="">
                                          </div>
                                      </div>
                                      <div class="el-form-item">
                                          <div class="el-form-item-div">
                                              <label class="el-form-item-label">名称</label>
                                              <input type="text" id="searchName" class="el-input" placeholder="请输入名称" value="">
                                          </div>
                                      </div>
                                  </div>
                                  <ul class="el-item-hide">
                                      <li>
                                          <div class="el-form-item category">
                                              <div class="el-form-item-div">
                                                  <label class="el-form-item-label">创建人</label>
                                                  <input type="text" id="searchCreator" class="el-input" placeholder="请输入创建人" value="">
                                              </div>
                                          </div>
                                          <div class="el-form-item type">
                                              <div class="el-form-item-div">
                                                  <label class="el-form-item-label">图纸分类</label>
                                                  <div class="el-select-dropdown-wrap">
                                                      <div class="el-select">
                                                          <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                                          <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                                                          <input type="hidden" class="val_id" id="type_id" value="">
                                                      </div>
                                                      <div class="el-select-dropdown">
                                                          <ul class="el-select-dropdown-list">
                                                              <li data-id="" class="el-select-dropdown-item kong" data-name="--请选择--">--请选择--</li>
                                                          </ul>
                                                      </div>
                                                  </div>
                                              </div>
                                          </div>
                                      </li>
                                      <li>
                                          <div class="el-form-item group">
                                              <div class="el-form-item-div">
                                                  <label class="el-form-item-label">图纸分组</label>
                                                  <div class="el-select-dropdown-wrap">
                                                      <div class="el-select">
                                                          <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                                          <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                                                          <input type="hidden" class="val_id" id="group_id" value="">
                                                      </div>
                                                      <div class="el-select-dropdown">
                                                          <ul class="el-select-dropdown-list">
                                                              <li data-id="" class="el-select-dropdown-item kong" data-name="--请选择--">--请选择--</li>
                                                          </ul>
                                                      </div>
                                                  </div>
                                              </div>
                                          </div>
                                          <div class="el-form-item imgSource">
                                              <div class="el-form-item-div">
                                                  <label class="el-form-item-label">图纸来源</label>
                                                  <div class="el-select-dropdown-wrap">
                                                      <div class="el-select">
                                                          <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                                          <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                                                          <input type="hidden" class="val_id" id="img_source" value="">
                                                      </div>
                                                      <div class="el-select-dropdown">
                                                          <ul class="el-select-dropdown-list">
                                                              <li data-id="" class="el-select-dropdown-item kong" data-name="--请选择--">--请选择--</li>
                                                          </ul>
                                                      </div>
                                                  </div>
                                              </div>
                                          </div>
                                      </li>
                                      <li>
                                        <div class="el-form-item template_attr" style="">
                                            <div class="el-form-item-div">
                                                <label class="el-form-item-label">图纸属性</label>
                                                <div class="template_attr_wrap clearfix"></div>
                                            </div>
                                        </div>
                                      </li>
                                  </ul>
                              </div>
                              <div class="el-form-item">
                                  <div class="el-form-item-div btn-group" style="margin-top: 10px;">
                                      <span class="arrow el-select"><i class="el-input-icon el-icon el-icon-caret-top"></i></span>
                                      <button type="button" class="el-button choose-search">搜索</button>
                                      <button type="button" class="el-button upload_select_img">上传图纸</button>
                                  </div>
                              </div>
                          </div>
                      </form>
                    </div>
                    <div class="img_list table_page">
                        <div id="pagenation" class="pagenation"></div>
                        <table class="sticky uniquetable commontable">
                            <thead>
                                <tr>
                                    <th class="left nowrap tight">选择</th>
                                    <th class="left nowrap tight">缩略图</th>
                                    <th class="left nowrap tight">图纸编码</th>
                                    <th class="left nowrap tight">图纸名称</th>
                                    <th class="left nowrap tight">图纸来源</th>
                                </tr>
                            </thead>
                            <tbody class="table_tbody">
                               
                            </tbody>
                        </table>
                        <p class="errorMessage" style="padding-left: ${labelWidth}px;display: block"></p>
                    </div>
                    <div class="el-form-item ${btnShow}">
                        <div class="el-form-item-div btn-group">
                            <!--<button type="button" class="el-button cancle">取消</button>-->
                            <button type="button" class="el-button el-button--primary submit select_img_btn ${flag}">确定</button>
                        </div>
                    </div>
        </div>`,
        success: function (layero, index) {
            single_id = img_id;
            getImageSource(img_id, tr_index, flag);
            imgCategory();
            getImgType();
        },
        end: function () {
            ajaxData = {
                order: 'desc',
                sort: 'ctime'
            }
        }
    })
}
//分页
function bindPagenationClick(total, size) {
    $('.pagenation_wrap').show();
    $('#pagenation').pagination({
        totalData: total,
        showData: size,
        current: img_page_no,
        isHide: true,
        coping: true,
        homePage: '首页',
        endPage: '末页',
        prevContent: '上页',
        nextContent: '下页',
        jump: true,
        callback: function (api) {
            img_page_no = api.getCurrent();
            if (img_flag == 'total_img') {
                getImageSource('', 'total_img');
            } else {
                getImageSource('', 'field_img');
            }

        }
    });
}

function getImageSource(img_id, tr_index, flag) {
    $('#img_select_form .table_tbody').html('');
    var urlLeft = '';
    for (var param in ajaxData) {
        urlLeft += `&${param}=${ajaxData[param]}`;
    }
    urlLeft += "&page_no=" + img_page_no + "&page_size=" + img_page_size;
    AjaxClient.get({
        url: URLS['workWay'].imageIndex + '?' + _token + urlLeft,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            var pageTotal = rsp.paging.total_records;

            if (pageTotal > img_page_size) {
                bindPagenationClick(pageTotal, img_page_size);
            } else {
                $('#pagenation').html('');
            }
            if (rsp.results && rsp.results.length) {
                createImgHtml($('#img_select_form .table_tbody'), rsp.results, img_id, tr_index, flag)
            } else {
                var tr = `<tr><td colspan="5" style="text-align: center;color: #999;">暂无数据</td></tr>`;

                $('#img_select_form .table_tbody').html(tr)
            }
        },
        fail: function (rsp) {
            layer.close(layerLoading);
        }
    }, this);
}

function createImgHtml(ele, data, img_id, tr_index, flag) {
    data.forEach(function (item, index) {
        var _checkbox = `<span class="el-checkbox_input img-check ${flag} ${flag=='field_img'&&img_id==item.drawing_id? 'is-checked':''}" 
                        data-path="${item.image_path}" 
                        data-id="${item.drawing_id}"
                        data-name="${item.name}">
                    <span class="el-checkbox-outset"></span>
                </span>`;

        var tr = ` <tr>
                    <td>${_checkbox}</td>
                    <td><img class="pic-img" onerror="this.onerror=null;this.src='/statics/custom/img/logo_default.png'" width="48" height="32" src="/storage/${item.image_path}" data-src="/storage/${item.image_path}" data-id="${item.drawing_id}" alt=""></td>
                    <td>${item.code}</td>
                    <td>${item.name}</td>
                    <td>${item.category_name}</td>
                </tr>`;
        ele.append(tr);
        //console.log(imgchecks);
        if (flag == 'field_img' && imgchecks.length) {
            var itemid = $('#img_select_form').find('#itemId').attr('data-index');
            for (var i = 0; i < imgchecks.length; i++) {
                if (imgchecks[i].id == item.drawing_id && imgchecks[i].pfid == tr_index) {
                    ele.find('span.el-checkbox_input[data-id=' + imgchecks[i].id + ']').addClass('is-checked');
                }
            }
        }
        if (flag == 'total_img' && img_collection.length) {
            for (var j = 0; j < img_collection.length; j++) {
                if (img_collection[j].id == item.drawing_id) {
                    ele.find('span.el-checkbox_input[data-id=' + img_collection[j].id + ']').addClass('is-checked');
                }
            }
        }

        ele.find('tr:last-child').data("trData", item.attributes);
    })
}
//获取图纸分类
function getImgType() {
    AjaxClient.get({
        url: URLS['workWay'].imgGroupType + "?" + _token,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            if (rsp && rsp.results && rsp.results.length) {
                var lis = '';
                rsp.results.forEach(function (item) {
                    lis += `<li data-id="${item.image_group_type_id}" class="el-select-dropdown-item">${item.name}</li>`;
                });
                $('#searchForm .el-form-item.type .el-select-dropdown-list').append(lis);
            }
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            console.log('获取图纸来源列表失败');
        },
        complete: function () {
            $('#searchForm .submit').removeClass('is-disabled');
        }
    })
}
//获取图纸来源数据
function imgCategory() {
    AjaxClient.get({
        url: URLS['workWay'].imageSource + "?" + _token,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            if (rsp && rsp.results && rsp.results.length) {
                var lis = '';
                rsp.results.forEach(function (item) {
                    lis += `<li data-id="${item.imageCategory_id}" class="el-select-dropdown-item">${item.name}</li>`;
                });
                $('#searchForm .el-form-item.imgSource .el-select-dropdown-list').append(lis);
            }
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            console.log('获取图纸来源列表失败');
        },
        complete: function () {
            $('#searchForm .submit').removeClass('is-disabled');
        }
    })
}
//获取图纸分组
function getImgGroupType(id) {
    $('#searchForm .el-form-item.group .el-select').find('.el-input').val('--请选择--');
    $('#searchForm .el-form-item.group .el-select').find('#group_id').val('');
    if (id != '') {
        $('#searchForm .el-form-item.group .el-select-dropdown-list').html('');
        AjaxClient.get({
            url: URLS['workWay'].imgGroupSelect + "?" + _token + '&type_id=' + id,
            dataType: 'json',
            beforeSend: function () {
                layerLoading = LayerConfig('load');
            },
            success: function (rsp) {
                layer.close(layerLoading);
                if (rsp && rsp.results && rsp.results.length) {
                    var lis = '<li data-id="" class="el-select-dropdown-item kong" data-name="--请选择--">--请选择--</li>';
                    rsp.results.forEach(function (item) {
                        lis += `<li data-id="${item.imageGroup_id}" class="el-select-dropdown-item">${item.name}</li>`;
                    });
                    $('#searchForm .el-form-item.group .el-select-dropdown-list').append(lis);
                } else {
                    var _html = `<li data-id="" class="el-select-dropdown-item kong" data-name="--请选择--">--请选择--</li>`;
                    $('#searchForm .el-form-item.group .el-select-dropdown-list').html(_html);
                }
            },
            fail: function (rsp) {
                layer.close(layerLoading);
                console.log('获取图纸来源列表失败');
            },
            complete: function () {
                $('#searchForm .submit').removeClass('is-disabled');
            }
        })
    } else {
        var _html = `<li data-id="" class="el-select-dropdown-item kong" data-name="--请选择--">--请选择--</li>`;
        $('#searchForm .el-form-item.group .el-select-dropdown-list').html(_html);
    }
}
//获取图纸属性
function getImgSelectAttr(id) {
    if (id == 0 || id == undefined) {
        var ele = $('.el-form-item.template_attr .template_attr_wrap');
        ele.html('');
        return false;
    }
    AjaxClient.get({
        url: URLS['workWay'].imageAttr + '?' + _token + '&category_id=' + id,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            if (rsp.results && rsp.results.length) {
                var ele = $('.el-form-item.template_attr .template_attr_wrap');
                ele.html(' ');
                rsp.results.forEach(function (item, index) {
                    var li = `<div class="attr_item" data-id="${item.attribute_definition_id}">
                            <span class="img_text" title="${item.definition_name}">${item.definition_name}</span>
                            <input type="text" value=""/>
                        </div>`;
                    ele.append(li);
                })
            } else {
                $('.el-form-item.template_attr .template_attr_wrap').html('');
            }

        },
        fail: function (rsp) {
            layer.close(layerLoading);
            layer.msg('获取列表失败', {
                icon: 5,
                offset: '250px',
                time: 1500
            });
        }
    }, this);
}

function getPracticeList(id, flag, fields, exist) {
    AjaxClient.get({
        url: URLS['workWay'].practiceList + '?' + _token + '&operation_id=' + id,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            if (rsp && rsp.results) {
                var data = rsp.results.practice_field;
                if (flag == 'modal') { //弹窗选择做法字
                    if (data.length) {
                        var lis = '';
                        data.forEach(function (item) {
                            lis += `<li data-id="${item.practice_field_id}" data-name="${item.practice_field_name}" class="el-select-dropdown-item">${item.practice_field_name}</li>`;
                        });
                        $('#practice_field_item .el-form-item.practice_item .el-select-dropdown-list').append(lis);
                    }
                } else { //表格显示做法字
                    $('.operation_list .table_tbody').html('');
                    if (data.length) {
                        createRowCell(flag, data, fields, exist);
                    }
                    // else{
                    //   noData('暂无数据',5);
                    // }
                }
            }
        },
        fail: function (rsp) {
            layer.close(layerLoading);
        }
    }, this);
}
// 编辑做法中做法字段表格列表
function createRowCell(flag, data, fields, exist) {
    imgchecks = [];
    if (flag == 'edit') {
        var readonly = '',
            display = '';
        if (exist) {
            exist > 0 ? (readonly = 'readonly', display = 'none') : (readonly = '', display = '');
        }
        if (fields.length) {
            fields.forEach(function (item, index) {
                var imgid = [],
                    imgids = '',
                    imgname = [],
                    imgnames = '',
                    imgurl = [],
                    imgurls = '',
                    imgattr = [],
                    imgattrs = '';
                imgid = item.img_id != null && item.img_id != '' ? item.img_id.split(',') : '';
                imgname = item.img_name != null && item.img_name != '' ? item.img_name.split(',') : '';
                imgurl = item.img_url != null && item.img_url != '' ? item.img_url.split(',') : '';
                imgattr = item.img_attribute != null && item.img_attribute != '' ? item.img_attribute.split('|||') : '';
                if (imgname != undefined) {
                    for (i = 0; i < imgid.length; i++) {
                        if (imgid[i] != '' || imgname[i] != '') {
                            if (imgname[i] != 'undefined') {
                                imgnames += `<p><input type="text" id="imgs" data-index="${item.pfid}" data-id="${imgid[i]}" data-path="${imgurl[i]}" class="el-input imgs ${flag}" data-name="${imgname[i]}" style="width: 80px;" readonly="readonly" placeholder="选择图纸" value="${tansferNull(imgname[i])}"/></p>`
                                imgurls += `<p><img onerror="this.onerror=null;this.src=\'/statics/custom/img/logo_default.png\'" width="48" height="32" src="/storage/${imgurl[i]}" data-id="${imgid[i]}" alt="${tansferNull(imgname[i])}"></p>`
                                imgattrs += `<p style="min-height: 33px;" title="${tansferNull(imgattr[i])}">${tansferNull(imgattr[i]).length>27?tansferNull(imgattr[i]).substring(0,25)+'...':tansferNull(imgattr[i])}</p>`;
                                imgchecks.push({
                                    id: imgid[i],
                                    name: imgname[i],
                                    url: imgurl[i],
                                    pfid: item.pfid,
                                    attr: imgattr[i],
                                    desc: ''
                                });
                            }
                        }
                    }
                }
                if (imgnames == '' || imgnames == undefined) {
                    imgnames = `<p><input type="text" id="imgs" data-id="" data-path="" class="el-input imgs edit" data-name="" style="width: 80px;" readonly="readonly" placeholder="选择图纸" value=""></p>`;
                }
                if (imgurls == '' || imgurls == undefined) {
                    imgurls = `<p><img onerror="this.onerror=null;this.src='/statics/custom/img/logo_default.png'" width="48" height="32" src="/statics/custom/img/logo_default.png" data-id="" alt=""></p>`;
                }
                var _html = `
                            <tr data-id="${item.field_id}" data-pfid="${item.pfid}" data-index="${item.pfid}">
                            <td class="tr_count">${index+1}</td>
                            <td>${item.name}</td>
                            <td><div class="img_name">${imgnames}</div></td>
                            <td><div class="img_icon">${imgurls}</div></td>
                            <td><div class="img_attr">${imgattrs}</div></td>
                            <td><textarea type="textarea"  maxlength="100" onchange="this.value=this.value.substring(0, 100)" onkeydown="this.value=this.value.substring(0, 100)" onkeyup="this.value=this.value.substring(0, 100)" id="desc" style="min-width: 200px" rows="1" class="el-textarea" placeholder="请输入备注">${tansferNull(item.description)}</textarea></td>
                            <td>
                               <span class="practice_add_item edit ${display}" style="font-size: 14px;color:rgba(32, 160, 255, 0.8)"><i class="fa fa-plus-square"></i></span>
                               &nbsp;<span class="practice_delete ${display}" style="font-size: 14px;color: rgba(227, 0, 0, 0.6)"><i class="fa fa-minus-circle"></i></span>
                            </td>
                        </tr>`;
                $('.operation_list .table_tbody').append(_html);
            })
        }
        // else{
        //   noData('暂无数据',5);
        // }
    }
}

function getImageCollection(ele, data) {
    ele.html('');
    if (data.length) {
        data.forEach(function (item, index) {
            var tr = ` <tr data-id="${item.img_id}">
                    <td>${index+1}</td>
                    <td>${item.img_name}</td>
                    <td><div class="img_icon"><img onerror="this.onerror=null;this.src='/statics/custom/img/logo_default.png'" width="48" height="32" src="/storage/${item.img_url}" data-id="${item.img_id}" alt=""></div></td>
                    <td><div class="img_attr">${tansferNull(item.attribute)}</div></td>
                    <td><textarea type="textarea"  maxlength="100" onchange="this.value=this.value.substring(0, 100)" onkeydown="this.value=this.value.substring(0, 100)" onkeyup="this.value=this.value.substring(0, 100)"  style="min-width: 300px" id="img_desc" rows="1" class="el-textarea" placeholder="请输入备注">${item.description}</textarea></td>
                    <td><span class="image_collect edit" style="font-size: 14px;color: rgba(227, 0, 0, 0.6)"><i class="fa fa-minus-circle"></i></span></td>
                </tr>`;
            ele.append(tr);
            var attr = item.attribute != null && item.attribute != '' ? item.attribute.split(',') : '',
                attr_arr = [];
            if (attr.length) {
                for (var i = 0; i < attr.length; i++) {
                    var str = attr[i].split(':');
                    var obj = {
                        definition_name: str[0],
                        value: str[1]
                    };
                    attr_arr.push(obj)
                }
            }
            img_collection.push({
                id: item.img_id,
                name: item.img_name,
                url: item.img_url,
                attr: attr_arr,
                desc: item.description
            });
            ele.find('tr:last-child').data("trData", attr_arr);
        });
    }
}

function getMaterialCate(val, exist) {
    AjaxClient.get({
        url: URLS['workWay'].materialCate + '?' + _token,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            if (rsp.results && rsp.results.length) {
                var parent_id = rsp.results[0].parent_id;
                var lis = `<li data-id="" class="el-select-dropdown-item kong" data-name="--请选择--" class="el-select-dropdown-item">--请选择--</li>`;
                lis += treeList(rsp.results, parent_id, 'cate');
                $('.el-form-item.mate').find('.el-select-dropdown-list').html(lis);

                if (val) {
                    if (exist > 0) {
                        rsp.results.forEach(function (item) {
                            if (item.id == val) {
                                $('.operation_form .el-input#m_c_id').val(item.name).attr('data-id', item.id);
                            }
                        });
                    } else {
                        $('.el-form-item.mate').find('.el-select-dropdown-item[data-id=' + val + ']').click();
                    }

                }
            }
        },
        fail: function (rsp) {
            layer.close(layerLoading);
        }
    }, this);
}

function getDescription(val, exist, flag) {
    AjaxClient.get({
        url: URLS['workWay'].descSelect + '?' + _token,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            if (rsp.results && rsp.results.length) {
                var parent_id = rsp.results[0].parent_id;
                var lis = `<li data-id="" class="el-select-dropdown-item kong proceDisabled" data-name="--请选择--" class="el-select-dropdown-item">--请选择--</li>`;
                lis += treeList(rsp.results, parent_id, 'desc', 0);
                if (flag) {
                    $('.el-form-item.search_descSelect').find('.el-select-dropdown-list').html(lis);
                } else {
                    $('.el-form-item.descSelect').find('.el-select-dropdown-list').html(lis);
                    if (val && val != '') {
                        var str = val.split(',');
                        if (str.length) {
                            for (var i = 0; i < str.length; i++) {
                                $('.el-form-item.descSelect .el-select-dropdown-item[data-id=' + str[i] + ']').click();
                            }
                        }
                    }
                }
            }
        },
        fail: function (rsp) {
            layer.close(layerLoading);
        }
    }, this);
}

function getProTypeTree(val, exist) {
    AjaxClient.get({
        url: URLS['workWay'].proType + '?' + _token,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            if (rsp.results && rsp.results.length) {
                var parent_id = rsp.results[0].parent_id;
                var lis = `<li data-id="" class="el-select-dropdown-item kong" data-name="--请选择--" data-code="" class="el-select-dropdown-item">--请选择--</li>`;
                lis += treeList(rsp.results, parent_id, 'pro', 0);
                $('.el-form-item.proCate').find('.el-select-dropdown-list').html(lis);
                if (val) {
                    $('.practice_info .el-form-item.proCate').find('.el-select-dropdown-item[data-id=' + val + ']').click();
                }
            }
        },
        fail: function (rsp) {
            layer.close(layerLoading);
        }
    }, this);
}

function getPracTypeTree(val, exist) {
    AjaxClient.get({
        url: URLS['workWay'].pracType + '?' + _token,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            if (rsp.results && rsp.results.length) {
                var parent_id = rsp.results[0].parent_id;
                var lis = `<li data-id="" class="el-select-dropdown-item kong" data-name="--请选择--" data-code="" class="el-select-dropdown-item">--请选择--</li>`;
                lis += treeList(rsp.results, parent_id, 'prac', 0);
                $('.el-form-item.pracTice').find('.el-select-dropdown-list').html(lis);
                if (val) {
                    $('.practice_info .el-form-item.pracTice').find('.el-select-dropdown-item[data-id=' + val + ']').click();
                }
            }
        },
        fail: function (rsp) {
            layer.close(layerLoading);
        }
    }, this);
}

function treeList(data, parent_id, flag, level) {
    var _html = '';
    var children = getChildById(data, parent_id);
    if (flag == 'cate' || flag == 'prac') {
        children.forEach(function (item, index) {
            var lastClass = index === children.length - 1 ? 'last-tag' : '';
            var distance, className, itemImageClass, tagI, itemcode = '';
            distance = item.level * 20, tagI = '', itemcode = '';
            var span = `<div style="padding-left: ${distance}px;">${tagI}<span class="tag-prefix ${lastClass}"></span><span>${item.name}</span> ${itemcode}</div>`;
            _html += `<li data-id="${item.id}" class="el-select-dropdown-item" data-code="${item.code}" data-name="${item.name}">${span}</li>
                    ${treeList(data,item.id,flag)}`;
        });
    } else if (flag == 'desc') {
        children.forEach(function (item, index) {
            var lastClass = index === children.length - 1 ? 'last-tag' : '';
            var distance, className, itemImageClass, tagI, itemcode = '';
            distance = item.level * 20, tagI = '', itemcode = '';
            var span = `<div style="padding-left: ${level*20}px;">${tagI}<span class="tag-prefix ${lastClass}"></span><span>${item.name}</span> ${itemcode}</div>`;
            _html += `<li data-id="${item.practice_use_id}" class="el-select-dropdown-item" data-name="${item.name}">${span}</li>
                    ${treeList(data,item.practice_use_id,flag,level+1)}`;
        });
    } else {
        children.forEach(function (item, index) {
            var lastClass = index === children.length - 1 ? 'last-tag' : '';
            var distance, className, itemImageClass, tagI, itemcode = '';
            distance = item.level * 20, tagI = '', itemcode = '';
            var span = `<div style="padding-left: ${level*20}px;">${tagI}<span class="tag-prefix ${lastClass}"></span><span>${item.name}</span> ${itemcode}</div>`;
            _html += `<li data-id="${item.product_type_id}" class="el-select-dropdown-item" data-code="${item.code}" data-name="${item.name}">${span}</li>
                    ${treeList(data,item.product_type_id,flag,level+1)}`;
        });
    }
    return _html;
}
//添加可重复的做法字段
function showSelectPracticeModal(id, index, flag) {
    layerModal = layer.open({
        type: 1,
        title: '插入步骤',
        offset: '100px',
        area: '300px',
        shade: 0.1,
        shadeClose: false,
        resize: false,
        content: `<form class="formModal" id="practice_field_item">
            <input type="hidden" id="itemId" value="${id}" data-index="${index}">
             <div class="el-form-item practice_item">
                <div class="el-form-item-div">
                    <label class="el-form-item-label" style="width: 115px;">做法字段<span class="mustItem">*</span></label>
                    <div class="el-select-dropdown-wrap">
                        <div class="el-select">
                            <i class="el-input-icon el-icon el-icon-caret-top"></i>
                            <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                            <input type="hidden" class="val_id" id="practice_item_id" value="">
                        </div>
                        <div class="el-select-dropdown">
                            <ul class="el-select-dropdown-list">
                                <li data-id="" class="el-select-dropdown-item kong" data-name="--请选择--">--请选择--</li>
                            </ul>
                        </div>
                    </div>
                </div>
                <p class="errorMessage" id="itemMessage" style="padding-left: 100px;display: block"></p>
             </div>
              <div class="el-form-item btnShow">
                  <div class="el-form-item-div btn-group">
                      <!--<button type="button" class="el-button cancle">取消</button>-->
                      <button type="button" class="el-button el-button--primary submit practice_item_add ${flag}">确定</button>
                  </div>
              </div>
    </form>`,
        success: function (layero) {
            var practice_id = $('.procedure_list ul li.selected').attr('data-id');
            getPracticeList(practice_id, 'modal', [])
        }
    })
}

function getPracticeModal(id) {
    
    AjaxClient.post({
        url: URLS['workWay'].operationGetPractice,
        dataType: 'json',
        data: searchChainData,
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            $('.chain_practice .table_tbody').html('');
            if (rsp.results && rsp.results.length) {
                rsp.results.forEach(function (item) {
                    var _checkbox = `<span class="el-checkbox_input practice-check" data-id="${item.id}">
                    <span class="el-checkbox-outset"></span>
                </span>`;
                    var tr = `<tr data-id="${item.id}" data-o-id="${item.operation_id}">
                      <td>${_checkbox}</td>
                      <td>${item.code}</td>
                      <td>${item.name}</td>
                      <td>${tansferNull(item.description)}</td>
                    </tr>`;
                    $('.chain_practice .table_tbody').append(tr)
                });
            } else {
                var tr = `<tr><td colspan="4" style="text-align: center;color: #999;">暂无数据</td></tr>`;
                $('.chain_practice .table_tbody').append(tr)
            }
            if (field_select.length && $('.chain_practice .table_tbody tr').length) {
                $('.chain_practice .table_tbody tr').each(function (k, v) {
                    for (var i = 0; i < field_select.length; i++) {
                        if ($(v).attr('data-id') == field_select[i].practice_id) {
                            $(v).find('.practice-check[data-id=' + field_select[i].practice_id + ']').addClass('is-checked')
                        }
                    }
                })
            }
        },
        fail: function (rsp) {
            layer.close(layerLoading);
        }
    }, this);
}

function showPracticeChain(flag, line_info) {
    var {
        name = '', line_id = ''
    } = {};
    if (line_info) {
        ({
            name = '',
            line_id = ''
        } = line_info);
    }
    layerModal = layer.open({
        type: 1,
        title: '关联做法',
        offset: '50px',
        area: '800px',
        shade: 0.1,
        shadeClose: false,
        resize: false,
        content: `<form class="formModal" id="chain_form">
                <input type="hidden" id="itemId" value="${line_id}">
                <div class="el-form-item line_name" style="max-width: 300px">
                    <div class="el-form-item-div">
                        <label class="el-form-item-label" style="width: 100px;">名称<span class="mustItem">*</span></label>
                        <input type="text" id="name" value="${name}" data-name="名称" class="el-input" placeholder="请输入名称">
                    </div>
                    <p class="errorMessage" style="padding-left: 100px;display: block"></p>
                </div>
                <div class="has_select_field">
                </div>
                <div class="chain_wrap">
                   <div class="chain_procedure"><ul></ul></div>
                   <div class="chain_practice">
                        <div class="search-item-chain">
                            <div class="el-form-item">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label">编码</label>
                                    <input type="text" id="chain_code" class="el-input" placeholder="请输入编码" value="">
                                </div>
                            </div>
                            <div class="el-form-item">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label">名称</label>
                                    <input type="text" id="chain_name" class="el-input" placeholder="请输入名称" value="">
                                </div>
                            </div>
                            <div class="el-form-item">
                                <div class="el-form-item-div btn-group" style="margin: 8px 0 0 10px">
                                    <button type="button" class="el-button el-button--primary submit">搜索</button>
                                </div>
                            </div>
                        </div>
                        <table class="sticky uniquetable commontable">
                          <thead>
                            <tr> 
                                <th class="left nowrap tight">选择</th>
                                <th class="left nowrap tight">做法编码</th>
                                <th class="left nowrap tight">做法名称</th>
                                <th class="left nowrap tight">用处</th>
                            </tr>
                          </thead>
                          <tbody class="table_tbody"></tbody>
                    </table>
                   </div>
                </div>
                <div class="el-form-item btnShow">
                    <div class="el-form-item-div btn-group">
                        <button type="button" class="el-button el-button--primary submit chain_practice ${flag}">确定</button>
                    </div>
                 </div>
          </form>`,
        success: function () {
            getAllProcedure(flag);
        },
        end: function () {
            field_select = [];
        }
    })
}

function storePracticeLine(data) {
    AjaxClient.post({
        url: URLS['line'].store,
        data: data,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            layer.close(layerModal);
            var id = $('.list_wrap li.selected').attr('data-id');
            getPracticeLine(id);
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            if (rsp && rsp.message != undefined && rsp.message != null) {
                LayerConfig('fail', rsp.message);
            } else {
                layer.msg('关联做法失败', {
                    icon: 2,
                    offset: '250px',
                    time: 1500
                });
            }
        },
        complete: function () {
            $('#chain_form .submit').removeClass('is-disabled');
        }
    }, this);
}

function editPracticeLine(data) {
    console.log(data);
    AjaxClient.post({
        url: URLS['line'].edit,
        data: data,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            layer.close(layerModal);
            var id = $('.list_wrap li.selected').attr('data-id');
            getPracticeLine(id);
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            if (rsp && rsp.message != undefined && rsp.message != null) {
                LayerConfig('fail', rsp.message);
            } else {
                layer.msg('编辑关联做法失败', {
                    icon: 2,
                    offset: '250px',
                    time: 1500
                });
            }
        },
        complete: function () {
            $('#chain_form .submit').removeClass('is-disabled');
        }
    }, this);
}

function getPracticeLine(id) {
    $('.practice_line').html('');
    AjaxClient.get({
        url: URLS['line'].show + '?' + _token + '&practice_id=' + id,
        dataType: 'json',
        // beforeSend: function(){
        //   layerLoading = LayerConfig('load');
        // },
        success: function (rsp) {
            layer.close(layerLoading);
            if (rsp.results && rsp.results.length) {
                showPracticeLineHtml($('.practice_line'), rsp.results)
            } else {
                $('.practice_line').html('暂无数据');
            }
        },
        fail: function (rsp) {
            console.log('获取做法线失败');
            // layer.close(layerLoading);
        }
    }, this);
}

function showPracticeLineHtml(ele, data) {
    data.forEach(function (item) {
        var _name = '',
            _line_id = '',
            _line = '';
        if (item.base) {
            for (var key in item.base) {
                _name = item.base[key];
                _line_id = key;
            }
        }
        if (item.operation.length) {
            item.operation.forEach(function (citem) {
                var practice = '';
                if (citem.practice) {
                    citem.practice.forEach(function (pitem) {
                        practice += ` <p data-pracId="${pitem.practice_id}">${pitem.practice_code}-${pitem.practice_names}</p>`
                    })
                }
                _line += `<div class="content" data-oId="${citem.operation_id}">
                    <div class="oper_name"><span>${citem.operation_name}</span></div>
                    <div class="oper_prac">${practice}</div>
                </div>`;
            })
        }
        var ul = `<ul class="line_container">
                <li>${_name} <span class="fa fa-edit line_edit" data-id="${_line_id}"></span>
                <span class="fa fa-minus-square line_delete" data-id="${_line_id}"></span></li>
                <li>${_line}</li>
            </ul>`;
        ele.append(ul)
    })
}

function deleteLine(id) {
    AjaxClient.get({
        url: URLS['line'].delete + '?' + _token + '&line_id=' + id,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            var ids = $('.way_list li.selected').attr('data-id');
            getPracticeLine(ids);
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            if (rsp && rsp.message != undefined && rsp.message != null) {
                LayerConfig('fail', rsp.message);
            } else {
                layer.msg('删除失败', {
                    icon: 2,
                    offset: '250px',
                    time: 1500
                });
            }
        }
    }, this);
}

function getAlineData(id) {
    AjaxClient.get({
        url: URLS['line'].lineShow + '?' + _token + '&line_id=' + id,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            if (rsp && rsp.results) {
                var line_info = {};
                if (rsp.results.base) {
                    for (var key in rsp.results.base) {
                        line_info = {
                            name: rsp.results.base[key],
                            line_id: key
                        };
                    }
                }
                if (rsp.results.operation && rsp.results.operation.length) {
                    var data = rsp.results.operation,
                        lineArr = [];
                    data.forEach(function (item) {
                        if (item.practice.length) {
                            item.practice.forEach(function (pitem) {
                                lineArr.push({
                                    practice_id: pitem.practice_id,
                                    operation_id: item.operation_id
                                });
                            })
                        }
                    });
                    field_select = lineArr;
                }
                showPracticeChain('edit', line_info);
            }
        },
        fail: function (rsp) {
            console.log('获取做法线失败');
            // layer.close(layerLoading);
        }
    }, this);
}

//获取图纸详情
function getImgInfo(id) {
    AjaxClient.get({
        url: URLS['workWay'].imgShow + "?" + _token + "&drawing_id=" + id,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            if (rsp && rsp.results) {
                showImgModal(rsp.results, 1);
            }
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            console.log('获取图纸失败');
        }
    }, this);
}

function getImgListInfo(id) {
    AjaxClient.get({
        url: URLS['workWay'].imgShow + "?" + _token + "&drawing_id=" + id,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            if (rsp && rsp.results) {
                attr_html = showAttrsData(rsp.results.attributes);
                attr_data.push(attr_html);

            }
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            console.log('获取图纸失败');
        }
    }, this);
}

function showImgModal(data, flag) {
    transformStyle = {
        rotate: "rotate(0deg)",
        scale: "scale(1)",
    };
    var {
        drawing_id = '', image_orgin_name = '', code = '', name = '', category_name = '', group_name = '', comment = '', attributes = []
    } = {};
    if (data) {
        ({
            drawing_id = '',
            image_orgin_name = '',
            code = '',
            name = '',
            category_name = '',
            group_name = '',
            comment = '',
            attributes = []
        } = data)
    }
    var attr_html = showAttrs(attributes);

    var img = new Image(),
        imgsrc = '',
        attribute = {},
        wwidth = $(window).width(),
        wheight = $(window).height() - 100;
    if (flag) {
        img.src = imgsrc = window.storage + data.image_path;
        if (data.attribute) {
            attribute = data.attribute;
        }
    } else {
        img.src = imgsrc = data;
    }
    var nwidth = img.width > wwidth ? (wwidth * 0.8) : (img.width),
        nheight = img.height + 170 > wheight ? (Number(wheight - 80)) : (img.height + 90);
    nwidth < 500 ? nwidth = 500 : null;
    nheight < 400 ? nheight = 400 : null;
    var mwidth = nwidth + 'px',
        mheight = nheight + 'px';
    layerModal = layer.open({
        type: 1,
        title: '图纸详细信息',
        offset: '100px',
        area: [mwidth, mheight],
        shade: 0.1,
        shadeClose: true,
        resize: false,
        content: `<div class="pic-wrap-container">
                    <div class="pic-wrap">
                        <div class="el-tap-wrap edit">
                            <span data-item="image_form" class="el-tap image active">图纸</span>
                            <span data-item="basic_form" class="el-tap image">属性信息</span> 
                        </div>  
                        <div class="el-panel-wrap" style="padding-top: 10px;">
                            <div class="el-panel image_form active" id="image_form">
                                <div class="pic-detail-wrap" style="width: ${mwidth};height: ${nheight-130}px"></div>
                                <div class="action">
                                    <i class="el-icon fa-chevron-left" style="position: relative; top: 2px;" data-drawingId="${drawing_id}"></i>
                                    <i class="el-icon fa-search-plus"></i>
                                    <i class="el-icon fa-search-minus"></i>
                                    <i class="el-icon fa-rotate-right"></i>
                                    <i class="el-icon fa-chevron-right" style="position: relative; top: 2px;" data-drawingId="${drawing_id}"></i>
                                </div>
                            </div>
                            <div class="el-panel" id="basic_form">
                                <div class="imginfo">
                                    <div class="el-form-item">
                                        <div class="el-form-item-div">
                                            <label class="el-form-item-label">编码:</label>
                                            <span>${code}</span>
                                        </div> 
                                    </div>
                                    <div class="el-form-item">
                                        <div class="el-form-item-div">
                                            <label class="el-form-item-label">名称:</label>
                                            <span>${name}</span>
                                        </div> 
                                    </div>
                                    <div class="el-form-item">
                                        <div class="el-form-item-div">
                                            <label class="el-form-item-label">图纸来源:</label>
                                            <span>${tansferNull(category_name)}</span>
                                        </div> 
                                    </div>
                                    <div class="el-form-item">
                                        <div class="el-form-item-div">
                                            <label class="el-form-item-label">图纸分组名称:</label>
                                            <span>${tansferNull(group_name)}</span>
                                        </div> 
                                    </div>
                                     <div class="el-form-item">
                                        <div class="el-form-item-div">
                                            <label class="el-form-item-label">图纸注释:</label>
                                            <span>${comment}</span>
                                        </div> 
                                    </div>
                                    ${attr_html}
                                </div> 
                            </div>
                        </div>
                    </div>
                </div>`,
        success: function () {
            var imgObj = $('<img src="' + imgsrc + '" alt="" />');
            img.onload = function () {
                imgObj.css({
                    "left": (nwidth - img.width) / 2,
                    "top": (nheight - img.height - 130) / 2,
                    'height': img.height + 'px',
                });
                imgObj.attr({
                    "data-scale": 1,
                    "data-rotate": 0
                });
                if (img.width > nwidth || img.height > (nheight - 130)) {
                    var widthscale = nwidth / img.width,
                        heightscale = nheight / img.height,
                        scale = Math.max(Math.min(widthscale, heightscale), 0.1),
                        imgHeight = img.height * scale;
                    imgObj.attr("data-scale", scale.toFixed(2));
                    transformStyle.scale = 'scale(' + scale.toFixed(2) + ')';
                    imgObj.css({
                        "-webkit-transform": transformStyle.rotate + " " + transformStyle.scale,
                        "transform": transformStyle.rotate + " " + transformStyle.scale,
                        "-moz-transform": transformStyle.rotate + " " + transformStyle.scale
                    });
                }
            }
            imgObj.on({
                "mousedown": function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    isMove = false;
                    var mTop = e.clientY;
                    var mLeft = e.clientX;
                    var oTop = parseFloat($(this).css("top"));
                    var oLeft = parseFloat($(this).css("left"));
                    var disTop = mTop - oTop;
                    var disLeft = mLeft - oLeft;
                    var that = $(this);
                    that.css({
                        "cursor": "url(images/cur/closedhand.cur) 8 8, default"
                    });
                    $(document).on("mousemove", function (event) {
                        isMove = true;
                        var x = event.clientX;
                        var y = event.clientY;
                        var posX = x - disLeft;
                        var posY = y - disTop;
                        that.css({
                            "top": posY + "px",
                            "left": posX + "px"
                        });
                    });
                }
            });
            $(document).on("mouseup", function (e) {
                $(document).off("mousemove");
                $(document).off("mousedown");
                $(imgObj).css({
                    "cursor": "url(images/cur/openhand.cur) 8 8, default"
                });
            });
            $('.pic-detail-wrap').append(imgObj);
            zoomPcIMG();
        },
        end: function () {
            $("body").css("overflow-y", "auto");
        }
    })
}

function zoomPcIMG(flag) {
    $("body").css("overflow-y", "hidden");
    if (flag == 'all') {
        if (isFirefox = navigator.userAgent.indexOf("Firefox") > 0) {
            $("#imgWrap").on("DOMMouseScroll", function (e) {
                wheelZoom(e, $("#imgWrap .current .zoomImg"), true);
            });
        } else {
            $("#imgWrap").on("mousewheel", function (e) {
                wheelZoom(e, $("#imgWrap .current .zoomImg"));
            });
        }
    } else {
        var imgele = $("#image_form .pic-detail-wrap").find('img');
        if (isFirefox = navigator.userAgent.indexOf("Firefox") > 0) {
            $("#image_form .pic-detail-wrap").on("DOMMouseScroll", function (e) {
                wheelZoom(e, imgele, true);
            });
        } else {
            $("#image_form .pic-detail-wrap").on("mousewheel", function (e) {
                wheelZoom(e, imgele);
            });
        }
    }
}

function wheelZoom(e, obj, isFirefox) {
    var zoomDetail = e.originalEvent.wheelDelta;
    if (isFirefox) {
        zoomDetail = -e.originalEvent.detail;
    }
    zoomPic(zoomDetail, $(obj));
}

function zoomPic(zoomDetail, obj) {
    var scale = Number($(obj).attr("data-scale"));
    if (zoomDetail > 0) {
        scale = scale + 0.05;
    } else {
        scale = scale - 0.05;
    }
    if (scale > 2) {
        scale = 2;
    } else if (scale < 0.1) {
        scale = 0.1;
    }
    obj.attr("data-scale", scale.toFixed(2));
    transformStyle.scale = 'scale(' + scale.toFixed(2) + ')';
    obj.css({
        "-webkit-transform": transformStyle.rotate + " " + transformStyle.scale,
        "transform": transformStyle.rotate + " " + transformStyle.scale,
        "-moz-transform": transformStyle.rotate + " " + transformStyle.scale
    });
}

function rotatePic(obj) {
    var rotate = Number($(obj).attr("data-rotate")) || 0;
    rotate += 90;
    if (rotate >= 360) {
        rotate = 0;
    }
    obj.attr("data-rotate", rotate);
    transformStyle.rotate = 'rotate(' + rotate + 'deg)';
    obj.css({
        "-webkit-transform": transformStyle.rotate + " " + transformStyle.scale,
        "transform": transformStyle.rotate + " " + transformStyle.scale,
        "-moz-transform": transformStyle.rotate + " " + transformStyle.scale
    });
}

function showAttrs(data) {
    var _html = '';
    if (data.length) {
        data.forEach(function (item) {
            _html += `<div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label">${item.definition_name}:</label>
                            <span>${item.value}</span>
                        </div> 
                    </div>`
        })
    }
    return _html;
}
// 做法字段读取图纸属性
function showAttrsData(data) {
    var _html = '';
    if (data.length) {
        data.forEach(function (item) {
            _html += `${item.definition_name}:${item.value}`
        })
    }
    return _html;
}

function closeBg(e) {
    if (e.target.tagName.toLowerCase() != "img" && e.target.tagName.toLowerCase() != "i") {
        $("body").css("overflow-y", "auto");
        var currImg = $("#imgWrap .zoomImg");
        defaultStatus(currImg);
        $("#pcToolBG").remove();
    }
}

function defaultStatus(currImg) {
    transformStyle.scale = "scale(1)";
    transformStyle.rotate = "rotate(0deg)";
    currImg.css({
        "-webkit-transform": transformStyle.rotate + " " + transformStyle.scale,
        "transform": transformStyle.rotate + " " + transformStyle.scale,
        "-moz-transform": transformStyle.rotate + " " + transformStyle.scale,
        "left": ($(window).width() - currImg.width()) / 2,
        "top": ($(window).height() - currImg.height()) / 2
    });
    var scale = 1;
    currImg.attr("data-scale", scale);
}

function initImgList(imgList, target, current) {
    var isMove = false;
    imgList.each(function () {
        var imgSrc = $(this).attr("data-src"),
            dataId = $(this).attr('data-id');
        var imgItem = $('<li data-id="' + dataId + '"><img class="zoomImg" data-scale="1" data-rotate="0" src="' + imgSrc + '" alt=""></li>');
        var imgObj = imgItem.find("img");
        //设置图纸初始大小
        var img = new Image();
        img.src = imgSrc;
        img.onload = function () {
            imgObj.css({
                "left": ($(window).width() - img.width) / 2,
                "top": ($(window).height() - img.height) / 2,
                'height': img.height
            });
            if (img.width > $(window).width() || img.height > document.body.clientHeight) {
                var widthscale = $(window).width() / img.width,
                    heightscale = $(window).height() / img.height,
                    scale = Math.max(Math.min(widthscale, heightscale), 0.1);
                imgObj.attr("data-scale", scale.toFixed(2));
                transformStyle.scale = 'scale(' + scale.toFixed(2) + ')';
                imgObj.css({
                    "-webkit-transform": transformStyle.rotate + " " + transformStyle.scale,
                    "transform": transformStyle.rotate + " " + transformStyle.scale,
                    "-moz-transform": transformStyle.rotate + " " + transformStyle.scale
                });
            }
        }
        imgObj.on({
            "mousedown": function (e) {
                e.preventDefault();
                e.stopPropagation();
                isMove = false;
                var mTop = e.clientY;
                var mLeft = e.clientX;
                var oTop = parseFloat($(this).css("top"));
                var oLeft = parseFloat($(this).css("left"));
                var disTop = mTop - oTop;
                var disLeft = mLeft - oLeft;
                var that = $(this);
                that.css({
                    "cursor": "url(images/cur/closedhand.cur) 8 8, default"
                });
                $(document).on("mousemove", function (event) {
                    isMove = true;
                    var x = event.clientX;
                    var y = event.clientY;
                    var posX = x - disLeft;
                    var posY = y - disTop;
                    that.css({
                        "top": posY + "px",
                        "left": posX + "px"
                    });
                });
            }
        });
        $(document).on("mouseup", function (e) {
            $(document).off("mousemove");
            $(document).off("mousedown");
            $(imgObj).css({
                "cursor": "url(images/cur/openhand.cur) 8 8, default"
            });
        });
        target.append(imgItem);
    });
    target.find('li[data-id=' + current + ']').addClass('current');
}

function showBigImg(e, current) {
    var imgList = e;
    var modelBg = $("#pcToolBG");
    if (modelBg.length) {
        modelBg.remove();
    }
    modelBg = $('<div id="pcToolBG"></div>');
    var closeBtn = $('<span class="el-icon closeModel"></span>');
    modelBg.append(closeBtn);
    closeBtn.on("click", closeBg);
    var target = $('<ul id="imgWrap"></ul>');
    modelBg.append(target);
    var actions = $('<div id="el-action" class="el-action"><i class="el-icon fa-search-plus all"></i><i class="el-icon fa-search-minus all"></i><i class="el-icon fa-rotate-right all"></i></div>');
    modelBg.append(actions);
    modelBg.on("click", closeBg);
    var left = $(`<div id="el-left-action" style="display: ${imgList.length==1?'none':'block'}" class="el-action"><i class="el-icon fa-chevron-circle-left"></i></div>`);
    var right = $(`<div id="el-right-action" style="display: ${imgList.length==1?'none':'block'}" class="el-action"><i class="el-icon fa-chevron-circle-right"></i></div>`);
    modelBg.append(left).append(right);
    $("body").append(modelBg);
    initImgList(imgList, target, current);
    zoomPcIMG('all');
    $('#el-action').on('click', '.fa-search-plus.all', function (e) {
        e.stopPropagation();
        e.preventDefault();
        zoomPic(1, $('#imgWrap .current .zoomImg'));
    });
    $('#el-action').on('click', '.fa-search-minus.all', function (e) {
        e.stopPropagation();
        e.preventDefault();
        zoomPic(-1, $('#imgWrap .current .zoomImg'));
    });
    $('#el-action').on('click', '.fa-rotate-right.all', function (e) {
        e.stopPropagation();
        e.preventDefault();
        rotatePic($('#imgWrap .current .zoomImg'));
    });
    $('#el-left-action:not(.is-disabled)').on('click', function () {
        $('#el-right-action').removeClass('is-disabled');
        var cur = $('#imgWrap .current').index();
        if (cur == 0) {
            $(this).addClass('is-disabled');
        } else {
            defaultStatus($('#imgWrap .current img'));
            $('#imgWrap li').eq(cur - 1).addClass('current').siblings('li').removeClass('current');
        }
    });
    $('#el-right-action:not(.is-disabled)').on('click', function () {
        $('#el-left-action').removeClass('is-disabled');
        var cur = $('#imgWrap .current').index();
        if (cur + 1 == $('#imgWrap li').length) {
            $(this).addClass('is-disabled');
        } else {
            defaultStatus($('#imgWrap .current img'));
            $('#imgWrap li').eq(cur + 1).addClass('current').siblings('li').removeClass('current');
        }
    });
}
//获取图纸集合
function getImgCollection(id) {
    AjaxClient.get({
        url: URLS['workWay'].imgCollect + "?" + _token + "&practice_id=" + id,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            if (rsp && rsp.results) {
                showImgColletionModal(rsp.results);
            }
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            console.log('获取图纸集合失败');
        }
    }, this);
}

function showImgColletionModal(data) {
    var tr = '';
    if (data && data.length) {
        data.forEach(function (item) {
            tr += `<tr>
                <td>${item.img_code}</td>
                <td>${item.img_name}</td>
                <td><img class="pic-img" onerror="this.onerror=null;this.src='/statics/custom/img/logo_default.png'" width="48" height="32" data-src="/storage/${item.img_url}" src="/storage/${item.img_url}" alt=""></td>
                <td>${tansferNull(item.img_attribute)}</td>
                <td>${item.description}</td>
            </tr>`
        })
    } else {
        tr = `<tr><td colspan="5" style="text-align: center;color: #999;">暂无数据</td></tr>`
    }
    layerModal = layer.open({
        type: 1,
        title: '图纸集合',
        offset: '100px',
        area: '600px',
        shade: 0.1,
        shadeClose: true,
        resize: false,
        content: `<form class="formModal" id="img_collection_form">
            <input type="hidden" id="itemId" value="" data-index="">
              <div class="collect_wrap">
                  <table class="sticky uniquetable commontable">
                        <thead>
                            <tr>
                                <th class="left nowrap tight">图纸编码</th>
                                <th class="left nowrap tight">图纸名称</th>
                                <th class="left nowrap tight">图纸</th>
                                <th class="left nowrap tight">图纸属性</th>
                                <th class="left nowrap tight">备注</th>
                            </tr>
                        </thead>
                        <tbody class="table_tbody">${tr}</tbody>
                  </table>
              </div>
              <div class="el-form-item btnShow">
                  <div class="el-form-item-div btn-group">
                      <button type="button" class="el-button cancle">关闭</button>
                  </div>
              </div>
    </form>`,
        end: function () {
            $('.collect_wrap .table_tbody').html('')
        }
    })
}
$('body').on('input', '.el-item-show #searchCode', function (event) {
    event.target.value = event.target.value.replace(/[`~!@#$%^&*()\+=<>?:"{}|,.\/;'\\[\]·~！@#￥%……&*（）\+={}|《》？：“”【】、；‘’，。、]/im, "");
})