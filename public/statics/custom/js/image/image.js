var layerModal,
    layerLoading,
    pageNo = 1,
    pageSize = 20,
    ajaxData = {},
    start_time = '',
    end_time = '',
    imagesGroup = [],
    imagesType = [],
    imagesCategory = [],
    viewurl = '',
    editurl = '';


$(function () {
    imgCategory();
    imgType();
    imgGroup();
    resetParam();
    setAjaxData();
    getImgList();
    bindEvent();
});

function setAjaxData() {
    var ajaxDataStr = window.location.hash;
    if (ajaxDataStr !== undefined && ajaxDataStr !== '') {
        try{
            ajaxData = JSON.parse(decodeURIComponent(ajaxDataStr).substring(1));
        }catch (e) {
            ajaxData = {};
        }
    }
}


function bindPagenationClick(totalData, pageSize) {
    $('#pagenation').show();
    $('#pagenation').pagination({
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
            getImgList();
        }
    });
}

function getCurrentDate() {
    var curDate = new Date();
    var _year = curDate.getFullYear(),
        _month = curDate.getMonth() + 1,
        _day = curDate.getDate();
    return _year + '-' + _month + '-' + _day + ' 23:59:59';
}

//重置搜索参数
function resetParam() {
    ajaxData = {
        name: '',
        creator_name: '',
        category_id: '',
        has_attribute: '',
        start_time: '',
        end_time: '',
        drawing_attributes: '',
        type_id: '',
        group_id: '',
        sale_order_code: '',
        material_code: '',
        order: 'desc',
        sort: 'ctime'
    };
}

//获取图纸列表
function getImgList() {
    var urlLeft = '';
    for (var param in ajaxData) {
        urlLeft += `&${param}=${ajaxData[param]}`;
    }
    urlLeft += "&page_no=" + pageNo + "&page_size=" + pageSize;

    $('.table_tbody').html('');
    AjaxClient.get({
        url: URLS['image'].list + "?" + _token + urlLeft,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            if (layerModal != undefined) {
                layer.close(layerModal);
            }
            var totalData = rsp.paging.total_records;
            if (rsp.results && rsp.results.length) {
                createHtml($('.table_tbody'), rsp.results);
            } else {
                noData('暂无数据', 7);
            }
            if (totalData > pageSize) {
                bindPagenationClick(totalData, pageSize);
            } else {
                $('#pagenation').html('');
            }
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            if (layerModal != undefined) {
                layer.close(layerModal);
            }
            noData('获取图纸列表失败，请刷新重试', 7);
        },
        complete: function () {
            $('#searchForm .submit,#searchForm .reset').removeClass('is-disabled');
        }
    }, this);
}

//获取图纸来源数据
function imgCategory() {
    AjaxClient.get({
        url: URLS['category'].select + "?" + _token,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            if (rsp && rsp.results && rsp.results.length) {
                imagesCategory = rsp.results;
                var lis = '';
                rsp.results.forEach(function (item) {
                    lis += `<li data-id="${item.imageCategory_id}" class="el-select-dropdown-item">${item.name}</li>`;
                });
                $('#searchForm .el-form-item.category .el-select-dropdown-list').append(lis);
            }
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            console.log('获取图纸分类列表失败');
        },
        complete: function () {
            $('#searchForm .submit').removeClass('is-disabled');
        }
    })
}

//获取图纸分类数据
function imgType(fn) {
    AjaxClient.get({
        url: URLS['groupType'].select + "?" + _token,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            if (rsp && rsp.results && rsp.results.length) {
                imagesType = rsp.results;
                var lis = '';
                rsp.results.forEach(function (item) {
                    lis += `<li data-id="${item.image_group_type_id}" data-code="${item.code}" class="el-select-dropdown-item">${item.name}</li>`;
                });
                $('.el-form-item.type .el-select-dropdown-list').append(lis);
            }

            fn && typeof fn == 'function' ? fn() : null;
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            console.log('获取图纸分类列表失败');
        },
        complete: function () {
            $('#searchForm .submit').removeClass('is-disabled');
        }
    })
}

//获取图纸分组数据
function imgGroup(cid) {
    $('#searchForm .el-form-item.group .el-select').find('.el-input').val('--请选择--');
    $('#searchForm .el-form-item.group .el-select').find('#group_id').val('');
    AjaxClient.get({
        url: URLS['group'].select + "?" + _token + "&type_id=" + cid,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            if (rsp && rsp.results && rsp.results.length) {
                imagesGroup = rsp.results;

                var lis = '<li data-id="" class="el-select-dropdown-item kong" data-name="--请选择--">--请选择--</li>';
                rsp.results.forEach(function (item) {
                    lis += `<li data-id="${item.imageGroup_id}" data-code="${item.code}" class="el-select-dropdown-item">${item.name}</li>`;
                });
                $('.el-form-item.group .el-select-dropdown-list').html(lis);
                // if(id){
                //     $('.el-form-item.group .el-select-dropdown-item[data-id='+id+']').click();
                // }
            }
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            console.log('获取图纸分组列表失败');
        },
        complete: function () {
            $('#searchForm .submit').removeClass('is-disabled');
        }
    })
}

//获取图纸属性
function getImgattr(cid, tid) {
    AjaxClient.get({
        url: URLS['image'].attrSelect + '?' + _token + '&category_id=' + cid + '&group_type_id=' + tid,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            if (rsp.results && rsp.results.length) {
                var data = rsp.results;
                if (data && data.length) {
                    var ele = $('.el-form-item.template_attr .template_attr_wrap');
                    ele.html(' ');
                    data.forEach(function (item, index) {
                        var li = `<div class="attr_item" data-id="${item.attribute_definition_id}">
                                    <span class="img_text" title="${item.definition_name}">${item.definition_name}</span>
                                    <input type="text" value=""/>
                                </div>`;
                        ele.append(li)
                    });
                }
            } else {
                var ele = $('.el-form-item.template_attr .template_attr_wrap');
                ele.html('')
            }

        },
        fail: function (rsp) {
            layer.close(layerLoading);
            layer.msg('获取列表失败', {icon: 5, offset: '250px', time: 1500});
        }
    }, this);
}

//获取图纸详情
function getImgInfo(id) {
    AjaxClient.get({
        url: URLS['image'].show + "?" + _token + "&drawing_id=" + id,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            if (rsp && rsp.results) {
                Modal(rsp.results, 1);

                imgType(function () {
                    var text = $('.el-form-item.type .el-select-dropdown-item[data-id=' + rsp.results.type_id + ']').addClass('selected').text();
                    $('#type_id').val(rsp.results.type_id).siblings('.el-input').val(text);
                    imgGroup(rsp.results.type_id, rsp.results.group_id);
                });

            }
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            console.log('获取图纸失败');
        }
    }, this);
}

//删除图纸
function deleteImage(id, leftNum) {
    AjaxClient.get({
        url: URLS['image'].delete + "?" + _token + "&drawing_id=" + id,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            // LayerConfig('success','删除成功');
            if (leftNum == 1) {
                pageNo--;
                pageNo ? null : (pageNo = 1);
            }
            getImgList();
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            if (rsp && rsp.message) {
                LayerConfig('fail', rsp.message);
            } else {
                LayerConfig('fail', '删除失败');
            }
            if (rsp.code == 404) {
                pageNo ? null : pageNo = 1;
                getImgList();
            }
        }
    }, this);
}

//生成列表数据
function createHtml(ele, data) {
    var editurl = $('#editurl').val();
    data.forEach(function (item, index) {
        var imgsrc = item.image_path == '' ? '/statics/custom/img/logo_default.png' : window.storage + item.image_path;
        var tr = `
            <tr class="tritem" data-id="${item.drawing_id}">
                <td><img class="img" onerror="this.onerror=null;this.src='/statics/custom/img/logo_default.png'" width="48" height="32" src="${imgsrc}" /></td>
                <td>${item.code}</td>
                <td>${item.name}</td>
                <td>${tansferNull(item.category_name)}</td>
                <td>${tansferNull(item.creator_name)}</td>
                <td>${item.ctime}</td> 
                <td class="right">
                <button data-id="${item.drawing_id}" data-src="${imgsrc}" data-attribute="${item.has_attribute}"  class="button pop-button view">查看</button>
                <a class="link_button" style="border: none;padding: 0;" href="${editurl}?id=${item.drawing_id}"><button data-id="${item.drawing_id}" class="button pop-button edit">编辑</button></a>
                <button data-id="${item.drawing_id}" class="button pop-button delete">删除</button></td>
            </tr>
        `;
        ele.append(tr);
        ele.find('tr:last-child').data("trData", item);
    });
}

var transformStyle = {
    rotate: "rotate(0deg)",
    scale: "scale(1)",
};

function zoomPcIMG() {
    $("body").css("overflow-y", "hidden");
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

function Modal(data, flag) {
    transformStyle = {
        rotate: "rotate(0deg)",
        scale: "scale(1)",
    };
    var {image_orgin_name = '', code = '', name = '', category_name = '', group_name = '', comment = '', attributes = []} = {};
    if (data) {
        ({
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
        move: false,
        content: `<div class="pic-wrap-container">
                    <div class="pic-wrap">
                        <div class="el-tap-wrap edit">
                            <span data-item="image_form" class="el-tap active">图纸</span>
                            <span data-item="basic_form" class="el-tap">属性信息</span> 
                        </div>  
                        <div class="el-panel-wrap" style="padding-top: 10px;">
                            <div class="el-panel image_form active" id="image_form">
                                <div class="pic-detail-wrap" style="width: ${mwidth};height: ${nheight - 130}px"></div>
                                <div class="action">
                                    <i class="el-icon fa-search-plus"></i>
                                    <i class="el-icon fa-search-minus"></i>
                                    <i class="el-icon fa-rotate-right"></i>
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
                imgObj.attr({"data-scale": 1, "data-rotate": 0});
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

function showAttrs(data) {
    var _html = '';
    if (data.length) {
        data.forEach(function (item) {
            if (item.isModel == 1) {
                _html += `<div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label">${item.definition_name}:</label>
                            <span>${item.value}</span>
                        </div> 
                    </div>
                    <div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label">样板时间:</label>
                            <span>${item.mtime}</span>
                        </div> 
                    </div>`
            } else {
                _html += `<div class="el-form-item">
                    <div class="el-form-item-div">
                        <label class="el-form-item-label">${item.definition_name}:</label>
                        <span>${item.value}</span>
                    </div> 
                </div>`

            }

        })
    }
    return _html;
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
    $('body').on('click', '.pop-button.view', function () {
        getImgInfo($(this).attr('data-id'));
        // Modal(imgData,0);
        // if($(this).attr('data-attribute')==1){//有属性
        //     getImgInfo($(this).attr('data-id'));
        // }else{//没有属性
        //     var imgData=$(this).attr('data-src');
        //     Modal(imgData,0);
        // }
    });
    $('body').on('click', '.el-tap-wrap .el-tap', function () {
        var form = $(this).attr('data-item');
        if (!$(this).hasClass('active')) {
            $(this).addClass('active').siblings('.el-tap').removeClass('active');
            $('.pic-wrap #' + form).addClass('active').siblings('.el-panel').removeClass('active');
        }
    });
    $('#start_time').on('click', function (e) {
        e.stopPropagation();
        var that = $(this);
        var max = $('#end_time_input').text() ? $('#end_time_input').text() : getCurrentDate();
        start_time = laydate.render({
            elem: '#start_time_input',
            max: max,
            type: 'datetime',
            show: true,
            closeStop: '#start_time',
            done: function (value, date, endDate) {
                that.val(value);
            }
        });
    });
    $('#end_time').on('click', function (e) {
        e.stopPropagation();
        var that = $(this);
        var min = $('#start_time_input').text() ? $('#start_time_input').text() : '2018-1-20 00:00:00';
        end_time = laydate.render({
            elem: '#end_time_input',
            min: min,
            max: getCurrentDate(),
            type: 'datetime',
            show: true,
            closeStop: '#end_time',
            done: function (value, date, endDate) {
                that.val(value);
            }
        });
    });
    $('body').on('click', '#searchForm .el-select-dropdown-wrap', function (e) {
        e.stopPropagation();
    });
    $('.uniquetable').on('click', '.delete', function () {
        var id = $(this).attr("data-id");
        var num = $('#image_table .table_tbody tr').length;
        $(this).parents('tr').addClass('active');
        layer.confirm('将执行删除操作?', {
            icon: 3, title: '提示', offset: '250px', end: function () {
                $('.uniquetable tr.active').removeClass('active');
            }
        }, function (index) {
            layer.close(index);
            deleteImage(id, num);
        });
    });
    $('body').on('click', '.el-select', function () {
        if ($(this).find('.el-input-icon').hasClass('is-reverse')) {
            $('.el-item-show').find('.el-select-dropdown').hide();
            $('.el-item-show').find('.el-select .el-input-icon').removeClass('is-reverse');
        } else {
            $('.el-item-show').find('.el-select-dropdown').hide();
            $('.el-item-show').find('.el-select .el-input-icon').removeClass('is-reverse');
            $(this).find('.el-input-icon').addClass('is-reverse');
            $(this).siblings('.el-select-dropdown').show();
        }
    });

    $('body').on('click', '.el-select-dropdown-item', function (e) {
        e.stopPropagation();
        var ele = $(this).parents('.el-select-dropdown').siblings('.el-select');
        var idval = $(this).attr('data-id'), formerVal = ele.find('.val_id').val();
        $(this).parent().find('.el-select-dropdown-item').removeClass('selected');
        $(this).addClass('selected');
        ele.find('.el-input').val($(this).text());
        ele.find('.val_id').val(idval);
        if (formerVal != idval) {
            if (ele.find('.val_id').attr('id') == 'category_id') {
                if ($('#category_id').val() && $('#type_id').val()) {
                    getImgattr(idval, $('#type_id').val());
                } else {
                    $('.el-form-item.template_attr .template_attr_wrap').html('');
                }
            } else if (ele.find('.val_id').attr('id') == 'type_id') {
                if ($('#category_id').val() && $('#type_id').val()) {
                    getImgattr($('#category_id').val(), idval);
                } else {
                    $('.el-form-item.template_attr .template_attr_wrap').html('');
                }
                $('#group_id').val('').siblings('.el-input').val('--请选择--');
                $('#group_id').parents('.el-form-item.group').find('.el-select-dropdown-list').html('<li data-id="" class="el-select-dropdown-item kong" data-name="--请选择--">--请选择--</li>');
                if (idval) {
                    imgGroup(idval);
                }
            }
        }
        $(this).parents('.el-select-dropdown').hide().siblings('.el-select').find('.el-input-icon').removeClass('is-reverse');
    });

    //搜索图纸属性
    $('body').on('click', '#searchForm .submit:not(".is-disabled")', function (e) {
        e.stopPropagation();
        $('#searchForm .el-item-hide').slideUp(400, function () {
            $('#searchForm .el-item-show').css('background', 'transparent');
        });
        $('.arrow .el-input-icon').removeClass('is-reverse');
        if (!$(this).hasClass('is-disabled')) {
            $(this).addClass('is-disabled');
            var parentForm = $(this).parents('#searchForm');
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
            pageNo = 1;
            ajaxData = {
                code: parentForm.find('#code').val().trim(),
                name: encodeURIComponent(parentForm.find('#image_orgin_name').val().trim()),
                creator_name:  encodeURIComponent(parentForm.find('#creator_name').val().trim()),
                category_id: parentForm.find('#category_id').val(),
                drawing_attributes: JSON.stringify(_temp),
                group_id: parentForm.find('#group_id').val().trim(),
                start_time: parentForm.find('#start_time').val(),
                end_time: parentForm.find('#end_time').val(),
                sale_order_code: encodeURIComponent(parentForm.find('#sale_order_code').val().trim()),
                material_code: encodeURIComponent(parentForm.find('#material_code').val().trim()),
                order: 'desc',
                sort: 'ctime'
            };
            window.location.href = '#' + encodeURIComponent(JSON.stringify(ajaxData));
            getImgList();
        }
    });

    //重置搜索框值
    $('body').on('click', '#searchForm .reset:not(.is-disabled)', function (e) {
        e.stopPropagation();
        $(this).addClass('is-disabled');
        $('#searchForm .el-item-hide').slideUp(400, function () {
            $('#searchForm .el-item-show').css('background', 'transparent');
        });
        $('.arrow .el-input-icon').removeClass('is-reverse');
        var parentForm = $(this).parents('#searchForm');
        parentForm.find('#code').val('');
        parentForm.find('#image_orgin_name').val('');
        parentForm.find('#creator_name').val('');
        parentForm.find('#category_id').val('').siblings('.el-input').val('--请选择--');
        parentForm.find('#type_id').val('').siblings('.el-input').val('--请选择--');
        parentForm.find('#group_id').val('').siblings('.el-input').val('--请选择--');
        parentForm.find('#start_time_input').text('');
        parentForm.find('#end_time_input').text('');
        parentForm.find('.template_attr_wrap').html('');
        parentForm.find('#start_time').val('');
        parentForm.find('#end_time').val('');
        parentForm.find('#sale_order_code').val('');
        parentForm.find('#material_code').val('');
        $('.el-select-dropdown-item').removeClass('selected');
        $('.el-select-dropdown').hide();
        $('.el-form-item.group .el-select-dropdown-list').html('<li data-id="" class="el-select-dropdown-item kong" data-name="--请选择--">--请选择--</li>');
        pageNo = 1;
        resetParam();
        getImgList();
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
}
$('body').on('input','.el-item-show #code',function(event){
    event.target.value = event.target.value.replace( /[`~!@#$%^&*()\-+=<>?:"{}|,.\/;'\\[\]·~！@#￥%……&*（）\-+={}|《》？：“”【】、；‘’，。、]/im,"");
})