var fileFlag='single',
    attrArr=[],
    attrCArr=[],
    validatorImgToolBox={
        checkSource: function(name){
            var val=$('#addImage_form').find('#'+name).val(),cname=$('#addImage_form').find('#'+name).siblings('.el-input').val();
            return $('#addImage_form').find('#'+name).parents('.el-form-item').find('.errorMessage').hasClass('active')?(!1):
                val==''||cname=='--请选择--'?(showImgInvalidMessage('img_category_id','图纸来源必选'),!1):(!0);
        },
        checkCategory: function(name){
            var val=$('#addImage_form').find('#'+name).val(),cname=$('#addImage_form').find('#'+name).siblings('.el-input').val();
            return $('#addImage_form').find('#'+name).parents('.el-form-item').find('.errorMessage').hasClass('active')?(!1):
                val==''||cname=='--请选择--'?(showImgInvalidMessage('img_type_id','图纸分类必选'),!1):(!0);
        },
        checkGroup: function(name){
            var val=$('#addImage_form').find('#'+name).val(),cname=$('#addImage_form').find('#'+name).siblings('.el-input').val();
            return $('#addImage_form').find('#'+name).parents('.el-form-item').find('.errorMessage').hasClass('active')?(!1):
                val==''||cname=='--请选择--'?(showImgInvalidMessage('img_group_id','图纸分组必选'),!1):(!0);
        },
        imgcheckCode:function (name) {
            var value = $('#addImage_form').find('#'+name).val().trim();
            return $('#addImage_form').find('#'+name).parents('.el-form-item').find('.errorMessage').hasClass('active')?(!1):
                !Validate.checkImgCode(value)?(showImgInvalidMessage(name,"由1-20位字母、数字、下划线和中划线组成"),!1):(!0);
        },
        imgcheckName:function (name) {
            var value=$('#addImage_form').find('#'+name).val().trim();
            return $('#addImage_form').find('#'+name).parents('.el-form-item').find('.errorMessage').hasClass('active')?(!1):
                Validate.checkNull(value)?(showImgInvalidMessage(name,"名称必填"),!1):
                    (!0);
        }
    },
    validatorImgConfig={
        img_category_id: 'checkSource',
        img_type_id: 'checkCategory',
        img_group_id: 'checkGroup',
        img_code: 'imgcheckCode',
        img_name: 'imgcheckName',
    };
var ziduan=['img_code','img_name','img_comment'];
$(function () {
    clickEvent();
});
//显示错误信息
function showImgInvalidMessage(name,val){
    $('#addImage_form').find('#'+name).parents('.el-form-item').find('.errorMessage').html(val).addClass('active');
}
//图纸
function fileinit(preUrls,preothers,flag){
    var actions='<div class="file-actions">\n' +
        '    <div class="file-footer-buttons">\n' +
        '        {upload} {download} <button type="button" title="重新选择" class="btn btn-kv btn-default addNew"><i class="glyphicon glyphicon-plus"></i></button> {delete} {zoom}' +
        '    </div>\n' +
        '    <div class="clearfix"></div>\n' +
        '</div>';
    var defaultPreviewContent='<img src="/statics/custom/img/pic.png" alt=""><h6 class="text-muted">点击上传</h6>',
        browseFlag=false,
        btnClass='btn btn-primary none file-btn-input',
        dropZoneTitle='',
        parameter={},
        footer=`<div class="file-thumbnail-footer">
        <div class="file-caption-name" style="width:{width}">{caption}</div>
        {progress}
        {actions}</div>
        `,
        layoutTemplates={main2: '{browse}{preview}',actions: actions,footer: footer,actionZoom:'',zoomCache:''};
    if(flag=='multiple'){
        defaultPreviewContent='';
        browseFlag=true;
        btnClass='btn btn-primary file-btn-input';
        dropZoneTitle='点击选择按钮去选择图纸';
        layoutTemplates={main2: '{browse}{preview}',footer: footer,actionZoom:'',zoomCache:''};
    }
    $("#drawing").on('filepreajax',function(event, previewId, index){
        parameter={
            category_id: $('#img_category_id').val(),
            _token: TOKEN
        };
    });
    $("#drawing").fileinput({
        uploadAsync: true,
        language: 'zh',
        'uploadUrl': URLS['image'].upload,
        uploadExtraData: function (previewId, index) {
            return parameter;
        },
        overwriteInitial: true,
        initialPreview: preUrls,
        initialPreviewConfig:preothers,
        defaultPreviewContent: defaultPreviewContent,
        showCaption: false,//隐藏标题
        showClose: false, //关闭按钮
        browseClass: btnClass,
        browseOnZoneClick: !browseFlag, //点击上传
        dropZoneTitle: dropZoneTitle,
        maxFileSize: 1500,
        maxFileCount: 10,
        layoutTemplates: layoutTemplates,
        msgErrorClass: 'alert alert-block alert-danger',
        allowedFileExtensions: ["jpg", "png", "gif", "jpeg"],
    }).on('fileselect', function(event, numFiles, label) {
        $(".drawing-img").html('');
        var correct=validatorImgToolBox[validatorImgConfig['img_category_id']]('img_category_id');
        $("#drawing").parents('.el-form-item').find('.errorMessage').html('').removeClass('active');
        if(correct){
            $(this).fileinput("upload");
        }else{
            LayerConfig('fail','请先选择分类');
            $("#drawing").fileinput('clear');
        }
    }).on('fileloaded', function (event, file, previewId, index, reader) {
        $('#' + previewId).attr('data-preview', 'preview-' + file.lastModified);
    }).on('fileuploaded', function (event, data, previewId, index) {
        console.log('附件上传成功');
        var result = data.response,
            file = data.files[0];
        if (result.code == '200') {
            $('.file-preview-frame[data-preview=preview-'+file.lastModified+']').addClass('uploaded').
            attr({
                'data-url':result.results.image_path,
                'drawing_id': result.results.insert_id
            });
        }

    }).on('filebeforedelete', function (event, key, data) {
        console.log('附件删除');
    })
}
function clickEvent() {
    $('body').on('click','#addImage_form .rebackPreview',function(e){
        layer.close(layerModal);
        if(selectImg!=null){
          showImageModal(selectImg.tr_id,selectImg.img_name,selectImg.img_id,selectImg.tr_index,selectImg.flag);
        }else{
          showImageModal($('#trId').val());
        }

    });
    //上传图纸
    $('body').on('click','#searchForm .upload_select_img',function (e) {
        layer.close(layerModal);
        if($('#itemId').length){
            var trid=$('#itemId').val();
            showUploadImg(trid);
        }else{
          showUploadImg();
        }
    });
    $('body').on('click','#addImage_form .el-select-dropdown-item',function(e){
        e.stopPropagation();
        var ele=$(this).parents('.el-select-dropdown').siblings('.el-select');
        var idval=$(this).attr('data-id'),formerVal=ele.find('.val_id').val();
        $(this).parent().find('.el-select-dropdown-item').removeClass('selected');
        $(this).addClass('selected');
        ele.find('.el-input').val($(this).text());
        ele.find('.val_id').val(idval);
        if(formerVal!=idval){
            if(ele.find('.val_id').attr('id')=='img_category_id'){
                $(this).parents('.el-form-item').find('.errorMessage').removeClass('active').html('');
                var scorrect=validatorImgToolBox[validatorImgConfig['img_category_id']]('img_category_id'),
                  tcorrect=validatorImgToolBox[validatorImgConfig['img_type_id']]('img_type_id');
                if(!scorrect){
                    $('.attr-container').hide().find('.querywrap').hide();
                    return;
                }
                fileinit([],[],fileFlag);
                if(scorrect&&tcorrect) {
                  $('.attr-container .querywrap').html('');
                  $('.attr-container').css('display', 'flex');
                  attrArr = [];
                  attrCArr = [];
                  getImgAttr(idval,$('#img_type_id').val());
                }
            }else if(ele.find('.val_id').attr('id')=='img_type_id'){
              var scorrect=validatorImgToolBox[validatorImgConfig['img_category_id']]('img_category_id'),
                tcorrect=validatorImgToolBox[validatorImgConfig['img_type_id']]('img_type_id');
                if(!tcorrect){
                    return;
                }
              if(scorrect&&tcorrect) {
                $('.attr-container .querywrap').html('');
                $('.attr-container').css('display', 'flex');
                attrArr = [];
                attrCArr = [];
                getImgAttr($('#img_category_id').val(),idval);
              }
                $('#img_group_id').val('').siblings('.el-input').val('--请选择--');
                getimgGroup(idval);
            }else if(ele.find('.val_id').attr('id')=='img_group_id'){
                var correct=validatorImgToolBox[validatorImgConfig['img_type_id']]('img_type_id');
                if(!correct){
                    $('#img_code').val('');
                    return;
                }

                var typeCode=$('.el-form-item.add_img_cate .el-select-dropdown-item.selected').attr('data-code')+$('.el-form-item.add_img_group .el-select-dropdown-item.selected').attr('data-code');
                getCode(typeCode);
            }
        }
        $(this).parents('.el-select-dropdown').hide().siblings('.el-select').find('.el-input-icon').removeClass('is-reverse');
    })
    //checkbox
    $('body').on('click','#addImage_form .el-checkbox_input.attr-check',function(){
        $(this).toggleClass('is-checked');
        var id=Number($(this).attr('data-id')), data=$(this).parent().data('attrItem'), ids=getAttrIds(attrCArr);
        if(!$(this).hasClass('is-checked')){
            index=ids.indexOf(id);
            attrCArr.splice(index,1);
        }else{
            if(ids.indexOf(id)==-1){
                attrCArr.push(data);
            }
        }
    });
    //图纸属性
    $('body').on('click','.el-button.choose-attr',function () {
        $('.confirm_img_attr').removeClass('none');
        ChooseAttr();
    });
    $('body').on('click','.el-button.exit_attr',function () {
        $('.confirm_img_attr').addClass('none');

    })
    $('body').on('click','.choose-attr-ok',function () {
        $('.confirm_img_attr').addClass('none');
        createAttrList();
    });
    $('body').on('click','#addImage_form .submit:not(.is-disabled)',function (e) {
        e.stopPropagation();
        
        if(!$(this).hasClass('is-disabled')) {
            var correct = 1;
            for (var type in validatorImgConfig) {
                correct = validatorImgConfig[type] && validatorImgToolBox[validatorImgConfig[type]](type);
                if (!correct) {
                    break;
                }
            }
            if(correct){
                var data={},
                    category_id=$('#img_category_id').val(),
                    group_id=$('#img_group_id').val(),
                    code=$('#img_code').val(),
                    name=$('#img_name').val(),
                    comment=$('#img_comment').val(),
                    drawing_attributes=JSON.stringify(createPicAttr()),
                    drawing_id=$('.file-preview-frame.krajee-default.kv-preview-thumb.file-preview-success.uploaded').attr('drawing_id');
                data={
                    category_id: category_id,
                    group_id: group_id,
                    code: code,
                    name: name,
                    comment: comment,
                    drawing_attributes: drawing_attributes,
                    drawing_id: drawing_id,
                    _token: TOKEN
                };

                if(drawing_id == '' || !drawing_id) {
                    $('.drawing-img').html('请上传图纸');
                    return;
                }
                
                saveImgUploadData(data)
            }
        }
    })
    //输入框的相关事件
    $('body').on('focus','#addImage_form .el-input:not([readonly])',function(){
        $(this).parents('.el-form-item').find('.errorMessage').html("").removeClass('active');
    }).on('blur','#addImage_form .el-input:not([readonly])',function(){
        if(!$(this).hasClass('attr_val')){
            var name=$(this).attr("id");
            validatorImgConfig[name]
            && validatorImgToolBox[validatorImgConfig[name]]
            && validatorImgToolBox[validatorImgConfig[name]](name);
            // && remoteValidatorConfig[name]
            // && remoteValidatorToolbox[remoteValidatorConfig[name]]
            // && remoteValidatorToolbox[remoteValidatorConfig[name]](name);
        }
    });
   // 图纸属性显示隐藏
    $('body').on('click','.showImg_btn',function(){
        var info=$(this).html();
        if(info=='收起'){
            $(this).html('展开')
        }else{
            $(this).html('收起')
        }
        $('#table_pic_table').toggle();
    })
}
//存储图纸属性
function createPicAttr(){
    var attr=[],
        ele=$('.query-item .el-form-item');
    ele.each(function(){
        var item={
            attribute_definition_id: $(this).attr('attr-id'),
            value: $(this).find('.el-input.pic-attr-input').val().trim()
        };
        attr.push(item);
    });
    return attr;
}

function getAttrIds(data) {
    var ids=[];
    data.forEach(function (item) {
        ids.push(item.attribute_definition_id);
    });
    return ids;
}
//获取图纸属性
function getImgAttr(cid,tid) {
    $('.confirm_img_attr .img_attr_wrap').html('');
    AjaxClient.get({
        url: URLS['image'].attrSelect+"?"+_token+"&category_id="+cid+"&group_type_id="+tid,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success:function (rsp) {
            layer.close(layerLoading);
            attrArr=rsp&&rsp.results||[];
        },
        fail: function(rsp){
            layer.close(layerLoading);
            console.log('获取图纸属性列表失败');
        }
    })
}
function ChooseAttr() {
    $('.confirm_img_attr .img_attr_wrap').html('');
    var attrhtml='';
    if(attrArr.length){
        var ids=getAttrIds(attrCArr);
        attrArr.forEach(function (item) {
            attrhtml=`<p><span class="el-checkbox_input attr-check ${ids.indexOf(item.attribute_definition_id)>-1?'is-checked':''}" data-id="${item.attribute_definition_id}">
                        <span class="el-checkbox-outset"></span>
                        <input class="selected" type="hidden" value="1">
                    </span><span class="attr-label" title="${item.definition_name}">${item.definition_name}</span></p>`;
            $('.confirm_img_attr .img_attr_wrap').append(attrhtml);
            $('.confirm_img_attr .img_attr_wrap').find('p:last-child').data('attrItem',item);
        });
    }else{
        attrhtml='<p>暂无数据</p>';
        $('.confirm_img_attr .img_attr_wrap').append(attrhtml);
    }
}
function createAttrList() {
    if(attrCArr.length){
        var _html='';
        attrCArr.forEach(function (item) {
            _html+=`<div class="el-form-item" attr-id="${item.attribute_definition_id}">
                    <div class="el-form-item-div">
                        <label class="el-form-item-label">${item.definition_name}</label>
                        <input type="text" class="el-input pic-attr-input" placeholder="" value="${item.value||''}">
                    </div>
                </div>`;
        });
        var ulhtml=`<ul class="query-item">
                    <li>${_html}</li>
                </ul>`;
        $('.mattr-con-detail .querywrap').html(ulhtml).show();
    }else{
        $('.mattr-con-detail .querywrap').html('').hide()
    }
}
//获取编码
function getCode(typecode){
    var data={
        _token: TOKEN,
        type_code: typecode,
        type: 6
    };
    AjaxClient.post({
        url: URLS['image'].getCode,
        data: data,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            if(rsp&&rsp.results){
                setting_id=rsp.results.encoding_setting_id;
                automatic_number=rsp.results.automatic_number;
                if(rsp.results.automatic_number=='1'){//自动生成允许手工改动
                    $('#img_code').val(rsp.results.code).removeAttr('readonly').attr('data-val',rsp.results.code);
                }else if(rsp.results.automatic_number=='2'){//自动生成不允许手工改动
                    // var len=Number(rsp.results.serial_number_length),
                    //   start=rsp.results.code.length-len;
                    // var newCode=rsp.results.code.substring(0,start)+new Array(len+1).join('*');
                    $('#img_code').val(rsp.results.code).attr({'readonly':'readonly','data-val':rsp.results.code});
                }else{
                    $('#img_code').removeAttr('readonly');
                }
            }else{
                console.log('获取图纸编码失败');
            }
        },
        fail: function(rsp){
            layer.close(layerLoading);
            console.log('获取图纸编码失败');
        }
    },this);
}
//上传图纸
function showUploadImg(trid) {
    layerModal = layer.open({
        type: 1,
        title: '上传图纸',
        offset: '50px',
        area: '800px',
        shade: 0.1,
        shadeClose: true,
        resize: false,
        move: false,
        content: `<form id="addImage_form" class="formModal addImage_form">
                    <input type="hidden" id="trId" value="${trid||''}">
                <div class="flex-wrap">
                    <div class="basic-wrap">
                        <div class="el-form-item add_img_source">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label">图纸来源<span class="mustItem">*</span></label>
                                <div class="el-select-dropdown-wrap">
                                    <div class="el-select">
                                        <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                        <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                                        <input type="hidden" class="val_id" id="img_category_id" value="">
                                    </div>
                                    <div class="el-select-dropdown" style="width: 672px;">
                                        <ul class="el-select-dropdown-list">
                                            <li data-id="" class="el-select-dropdown-item kong">--请选择--</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            <p class="errorMessage" style="padding-left: 88px;"></p>
                        </div>
                        <div class="el-form-item add_img_cate">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label">图纸分类<span class="mustItem">*</span></label>
                                <div class="el-select-dropdown-wrap">
                                    <div class="el-select">
                                        <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                        <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                                        <input type="hidden" class="val_id" id="img_type_id" value="">
                                    </div>
                                    <div class="el-select-dropdown" style="width: 672px;">
                                        <ul class="el-select-dropdown-list">
                                            <li data-id="" class="el-select-dropdown-item kong">--请选择--</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            <p class="errorMessage" style="padding-left: 88px;"></p>
                        </div>
                        <div class="el-form-item add_img_group">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label">图纸分组<span class="mustItem">*</span></label>
                                <div class="el-select-dropdown-wrap">
                                    <div class="el-select">
                                        <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                        <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                                        <input type="hidden" class="val_id" id="img_group_id" value="">
                                    </div>
                                    <div class="el-select-dropdown" style="width: 672px;">
                                        <ul class="el-select-dropdown-list">
                                            <li data-id="" class="el-select-dropdown-item kong">--请选择--</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            <p class="errorMessage" style="padding-left: 88px;"></p>
                        </div>
                        <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label">编码<span class="mustItem">*</span></label>
                                <input type="text" id="img_code"  class="el-input" placeholder="由1-20位字母、数字、下划线和中划线组成" value="">
                            </div>
                            <p class="errorMessage" style="padding-left: 88px;"></p>
                        </div>
                        <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label">名称<span class="mustItem">*</span></label>
                                <input type="text" id="img_name"  class="el-input" placeholder="请输入名称" value="">
                            </div>
                            <p class="errorMessage" style="padding-left: 88px;"></p>
                        </div>
                        <div class="attr-container">
                            <label class="el-form-item-label">图纸属性</label>
                            <div class="mattr-con-detail">
                                <div class="el-form-item" style="display: block;">
                                    <div class="el-form-item-div choose-btn">
                                        <button type="button" class="el-button choose choose-attr choose-template">选择图纸属性</button>
                                        <button type="button" class="el-button find-same">查找相同属性图纸</button>
                                    </div>
                                </div>
                                <div class="confirm_img_attr none">
                                    <div class="img_attr_wrap"></div>
                                    <button type="button" class="el-button choose-attr-ok">确定</button>
                                    <button type="button" class="el-button exit_attr">取消</button>
                                </div>
                                <div class="querywrap"></div>
                            </div>
                        </div>
                        <div class="sameImg" style="display:none">
                            <h4 style="font-weight: bold;display:inline-block">相同属性图纸</h4> 
                            <button style="margin-left: 50px;background:#009688;color:#F5F5F5 " class="showImg_btn" type="button">收起</button>
                            <div class="table table_page">
                                <table id="table_pic_table" class="sticky uniquetable commontable" style="border:1px solid #c2c2c2">
                                    <thead>
                                    <tr>
                                        <th>缩略图</th>
                                        <th>图纸编码</th>
                                        <th>图纸名称</th>
                                        <th>创建人</th>
                                        <th>创建时间</th>
                                    </tr>
                                    </thead>
                                    <tbody class="table_tbody">
                                        <tr class="tritem"><td colspan="5" style="text-align: center;">暂无数据</td></tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label">描述</label>
                                <textarea type="textarea" maxlength="500" id="img_comment" rows="3" class="el-textarea" placeholder="请输入描述，最多只能输入500字"></textarea>
                            </div>
                            <p class="errorMessage" style="padding-left: 88px;"></p>
                        </div>
                        <div class="el-form-item">
                            <div class="el-form-item-div">
                                <label class="el-form-item-label">图纸上传</label>
                                <div class="file-wrap">
                                    <div class="file-loading">
                                        <input id="drawing" name="drawing" type="file" required data-preview-file-type="image">
                                    </div>
                                </div>
                            </div>
                            <p class="errorMessage drawing-img" style="padding-left: 88px;"></p>
                        </div>
                    </div>
                </div>
                <div class="el-form-item btnShow">
                  <div class="el-form-item-div btn-group">
                      <button type="button" class="el-button rebackPreview">返回</button>
                      <button type="button" class="el-button el-button--primary submit">确定</button>
                  </div>
              </div>
            </form>`,
        success:function () {
            getimgSource();//来源
            getimgCategory();//分类
            fileinit([],[],fileFlag);
        },
        end:function () {

        }
    })
}
//获取图纸来源数据
function getimgSource(){
    AjaxClient.get({
        url: URLS['image'].category+"?"+_token,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success:function (rsp) {
            layer.close(layerLoading);
            if(rsp&&rsp.results&&rsp.results.length){
                var lis='';
                rsp.results.forEach(function(item){
                    lis+=`<li data-id="${item.imageCategory_id}" class="el-select-dropdown-item">${item.name}</li>`;
                });
                $('.el-form-item.add_img_source .el-select-dropdown-list').append(lis);
            }
        },
        fail: function(rsp){
            layer.close(layerLoading);
            console.log('获取图纸来源列表失败');
        },
        complete: function(){

        }
    })
}
function getimgCategory(){
    AjaxClient.get({
        url: URLS['image'].type+"?"+_token,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success:function (rsp) {
            layer.close(layerLoading);
            if(rsp&&rsp.results&&rsp.results.length){
                var lis='';
                rsp.results.forEach(function(item){
                    lis+=`<li data-id="${item.image_group_type_id}" data-code="${item.code}" class="el-select-dropdown-item">${item.name}</li>`;
                });
                $('.el-form-item.add_img_cate .el-select-dropdown-list').append(lis);
            }
        },
        fail: function(rsp){
            layer.close(layerLoading);
            console.log('获取图纸分类列表失败');
        },
        complete: function(){

        }
    })
}
//获取图纸分组数据
function getimgGroup(cid,id){
    $('.el-form-item.add_img_group .el-select-dropdown-list').html('');
    AjaxClient.get({
        url: URLS['image'].groupSelect+"?"+_token+"&type_id="+cid,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success:function (rsp) {
            layer.close(layerLoading);
            if(rsp&&rsp.results&&rsp.results.length){
                var lis='<li data-id="" class="el-select-dropdown-item kong">--请选择--</li>';
                rsp.results.forEach(function(item){
                    lis+=`<li data-id="${item.imageGroup_id}" data-code="${item.code}" class="el-select-dropdown-item">${item.name}</li>`;
                });
                $('.el-form-item.add_img_group .el-select-dropdown-list').html(lis);
                if(id){
                    $('.el-form-item.group .el-select-dropdown-item[data-id='+id+']').click();
                }
            }else{
                var li='<li data-id="" class="el-select-dropdown-item kong">--请选择--</li>';
                $('.el-form-item.add_img_group .el-select-dropdown-list').html(li);
            }
        },
        fail: function(rsp){
            layer.close(layerLoading);
            console.log('获取图纸分类列表失败');
        },
        complete: function(){

        }
    })
}

//生成列表数据
function createHtml(data){
    var trs='';
    data.forEach(function(item,index){
        var imgsrc=item.image_path==''?'/statics/custom/img/logo_default.png':window.storage+item.image_path;
        trs+=`
            <tr class="tritem" data-id="${item.drawing_id}">
                <td><img class="img pic-img" data-src="${imgsrc}" data-id="${item.drawing_id}" onerror="this.onerror=null;this.src='/statics/custom/img/logo_default.png'" width="48" height="32" src="${imgsrc}" /></td>
                <td>${item.code}</td>
                <td>${item.name}</td>
                <td>${tansferNull(item.creator_name)}</td>
                <td>${item.ctime}</td> 
            </tr>
        `;
    });
    return trs;
}

// 查询相同属性图纸
function sameImg(){
    AjaxClient.get({
        url: URLS['image'].searchImg,
        data: sameAjax,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            
            layer.close(layerLoading);
            if(rsp&&rsp.results&&rsp.results.length){
                var _html=createHtml(rsp.results);
                $('.sameImg').show().find('#table_pic_table tbody').html(_html);
            }else{
                $('.sameImg').show().find('#table_pic_table tbody').html('<tr class="tritem"><td colspan="5" style="text-align: center;">暂无数据</td></tr>');
            }
        },
        fail: function(rsp){
            layer.close(layerLoading);

        }
    },this);
}

$('body').on('click','.find-same',function (e) {
    e.stopPropagation();
    e.preventDefault();
    sameAjax={
        drawing_attributes: JSON.stringify(createPicAttr()),
        _token: TOKEN
    };
    sameImg();
});

//保存
function saveImgUploadData(data){
    // console.log(data);
    AjaxClient.post({
        url: URLS['image'].store,
        data: data,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            resetImgAllData();
            if(rsp&&rsp.results) {
              var imgobj = {
                drawing_id: Number(rsp.results.drawing_id),
                code: rsp.results.code,
                name: rsp.results.name,
                image_path: rsp.results.image_path,
                comment: ''
              };
              if ($('#trId').val()&&typeof imgchecks!=undefined) {
                  var trele=$('.route-tbody .step-tr[data-step-id='+$('#trId').val()+']');
                  if(trele.length){
                    imgchecks=trele.attr('data-imgs')&&JSON.parse(trele.attr('data-imgs'))||[];
                    imgchecks.push(imgobj);
                    var imgs='';
                    imgchecks.forEach(function (item) {
                      imgs+=`<p><img data-img-id="${item.drawing_id}" src="/storage/${item.image_path}" width="80" height="40"><i class="fa fa-times-circle img-delete" data-img-id="${item.drawing_id}"></i></p>`;
                    });
                    trele.attr('data-imgs',JSON.stringify(imgchecks)).find('.img-wrap').html(imgs);
                  }
              }
            }
            // showImageModal(selectImg.tr_id,selectImg.img_name,selectImg.img_id,selectImg.tr_index,selectImg.flag);
        },
        fail: function(rsp){
            layer.close(layerLoading);
            if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                LayerConfig('fail',rsp.message,function(){
                    if(rsp&&rsp.field!==undefined&&rsp.field!=""){
                        showImgInvalidMessage(rsp.field,rsp.message);
                    }
                });
            }
        },
        complete: function(){
            $('#addImage_form .submit').removeClass('is-disabled');
        }
    },this);
}
//重置所有数据
function resetImgAllData(){
    $('.el-select-dropdown-item.selected').removeClass('selected');
    $('#img_category_id').val('').siblings('.el-input').val('--请选择--');
    $('#img_type_id').val('').siblings('.el-input').val('--请选择--');
    $('#img_group_id').val('').siblings('.el-input').val('--请选择--');
    $('.el-form-item.add_img_group .el-select-dropdown-list').html('<li data-id="" class="el-select-dropdown-item kong">--请选择--</li>');
    for(var i=0;i<ziduan.length;i++){
        $('#'+ziduan[i]).val('');
    }
    $('.attr-container').hide().find('.querywrap').html('').hide();
    attrArr=[];
    attrCArr=[];
    $("#drawing").fileinput('destroy');
    fileFlag='single';
    fileinit([],[],fileFlag);
}

