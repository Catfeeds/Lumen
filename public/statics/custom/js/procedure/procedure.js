
var layerModal,
    layerLoading,
    layerEle,
    nameCorrect=!1,
    codeCorrect=!1,
    pageNo=1,
    procedureIds=[],
    practiceIds=[],
    ajaxData={},
    tagsData=[],
    pageSize=20,
    validatorToolBox={
        checkName: function(name){
            var value=$('#'+name).val().trim();
            return $('#'+name).parents('.el-form-item').find('.errorMessage').hasClass('active')?(nameCorrect=!1,!1):
                Validate.checkNull(value)?(showInvalidMessage(name,"工序名称不能为空"),nameCorrect=!1,!1):
                !Validate.checkName(value)?(showInvalidMessage(name,"工序名称长度不能超出30位"), nameCorrect=!1,!1):
                (nameCorrect=1,!0);
        },
        checkCode:function (name) {
            var value=$('#'+name).val().trim();
            return $('#'+name).parents('.el-form-item').find('.errorMessage').hasClass('active')?(codeCorrect=!1,!1):
                Validate.checkNull(value)?(showInvalidMessage(name,"编码不能为空"),codeCorrect=!1,!1):
                !Validate.checkOperaCode(value)?(showInvalidMessage(name,"编码为1-4位数字"),codeCorrect=!1,!1):
                (codeCorrect=1,!0);
        }
    },
    remoteValidatorToolbox={
        remoteCheckName: function(flag,name,id){
            var value=$('#'+name).val().trim();
            getUnique(flag,name,value,id,function(rsp){
                if(rsp.results&&rsp.results.exist){
                    var val='已注册';
                    showInvalidMessage(name,val);
                }
            });
        }
    },
    validatorConfig = {
        name:'checkName',
        code:'checkCode'
    },
    remoteValidatorConfig={
        code: "remoteCheckName",
        name: "remoteCheckName",
    };

$(function () {
    getProcedureData();
    bindEvent();
    resetParam();

});

function getUnique(flag,field,value,id,fn){
    var urlLeft='';
    if(flag==='edit'){
        urlLeft=`&field=${field}&value=${value}&id=${id}`;
    }else{
        urlLeft=`&field=${field}&value=${value}`;
    }
    var xhr=AjaxClient.get({
        url: URLS['procedure'].unique+"?"+_token+urlLeft,
        dataType: 'json',
        success: function(rsp){
            fn && typeof fn==='function'? fn(rsp):null;
        },
        fail: function(rsp){
            console.log('唯一性检测失败');
        }
    },this);
}
//显示错误信息
function showInvalidMessage(name,val) {
    $('#'+name).parents('.el-form-item').find('.errorMessage').html(val).addClass('active');
    $('#addProcedureModal_form').find('.submit').removeClass('is-disabled');
}


function bindEvent() {
    $('body').on('click','.formModal:not(".disabled") .cancle',function(e){
        e.stopPropagation();
        layer.close(layerModal);
    });
    //点击弹框内部关闭dropdown
    $(document).click(function (e) {
        var obj = $(e.target);
        if (!obj.hasClass('el-select-dropdown-wrap') && obj.parents(".el-select-dropdown-wrap").length === 0) {
            $('.el-select-dropdown').slideUp().siblings('.el-select').find('.el-input-icon').removeClass('is-reverse');
        }
    });
    //下拉框点击事件
  $('body').on('click','.el-select:not(.ability,.practice_field)',function(){
    $(this).find('.el-input-icon').toggleClass('is-reverse');
    $(this).parents('.el-form-item').siblings().find('.el-select-dropdown').hide();
    $(this).parents('.el-form-item').siblings().find('.el-select .el-input-icon').removeClass('is-reverse');
    $(this).siblings('.el-select-dropdown').toggle();
    $(this).parents('.el-form-item').find('.el-select-dropdown').width($(this).width());
  });
  //能力
  $('body').on('click','.el-form-item.abilitySelect .el-select-dropdown-item',function (e) {
    e.stopPropagation();
    $('.selectValue.ability').find(".kong").remove();
    $(this).parents('.el-select-dropdown').hide().siblings('.el-select').find('.el-input-icon').removeClass('is-reverse');

    var selectInput = $('.selectValue.ability');

    if(!$(this).hasClass('proceDisabled')){
      var proId = $(this).attr('data-id'),proText = $(this).text();
      console.log(proId);

      var tips = `<span class="proceTip ability" data-id="${proId}">${proText}<i class="fa fa-close proceTipDel"></i></span>`;

      selectInput.append(tips);
      procedureIds.push({'id':proId});
      $('.abilitySelect .errorMessage').html('');

      $(this).addClass('proceDisabled');
    }
  });
  $('body').on('click','.el-form-item.abilitySelect .proceTipDel',function (e) {
        e.preventDefault();
        e.stopPropagation();
        var ids = $(this).parents('.proceTip').attr('data-id');
        if($('#addProcedureModal_form').attr('data-flag')=='edit'){
            var op_id = $('#addProcedureModal_form #itemId').val();
            fieldCheckUse('ability',op_id,ids,function (rsp) {
                if(rsp.results==true){
                    // $(this).parents('.el-form-item.abilitySelect').find('.ability.errorMessage').html('该能力已被使用，不可删除').addClass('active')
                    LayerConfig('fail','该能力已被使用，不能删除')
                }else{
                    $('.selectValue span').remove('.proceTip[data-id='+ids+']');
                    $('.el-form-item.abilitySelect .el-select-dropdown-item[data-id='+ids+']').removeClass('proceDisabled');
                    procedureIds.forEach(function (item,index) {
                        if(item.id == ids){
                            procedureIds.splice(index,1);
                        }
                    })
                }
            })
        }else{
            $('.selectValue span').remove('.proceTip[data-id='+ids+']');

            $('.el-form-item.abilitySelect .el-select-dropdown-item[data-id='+ids+']').removeClass('proceDisabled');

            procedureIds.forEach(function (item,index) {
                if(item.id == ids){
                    procedureIds.splice(index,1);
                }
            })
        }

        if(procedureIds.length == 0) {
            $('.selectValue.ability').html('<span class="kong">--请选择--</span>');
        }

    })
//做法字段
  $('body').on('click','.el-form-item.practiceSelect .el-select-dropdown-item',function (e) {
    e.stopPropagation();
    $('.selectValue.practice').find(".kong").remove();
    $(this).parents('.el-select-dropdown').hide().siblings('.el-select').find('.el-input-icon').removeClass('is-reverse');

    var _selectInput = $('.selectValue.practice');

    if(!$(this).hasClass('proceDisabled')){
      var praId = $(this).attr('data-id'),praText = $(this).text();

      var _tips = `<span class="proceTip practice" data-id="${praId}">${praText}<i class="fa fa-close proceTipDel"></i></span>`;

      _selectInput.append(_tips);
      practiceIds.push({'id':praId});
      $('.practiceSelect .errorMessage').html('');

      $(this).addClass('proceDisabled');
    }
  });
    $('body').on('click','.el-form-item.practiceSelect .proceTipDel',function (e) {
        e.preventDefault();
        e.stopPropagation();
        var ids = $(this).parents('.proceTip').attr('data-id');
        if($('#addProcedureModal_form').attr('data-flag')=='edit'){
            var op_id = $('#addProcedureModal_form #itemId').val();
            console.log(op_id);
            fieldCheckUse('practice',op_id,ids,function (rsp) {
                if(rsp.results==true){
                    // $(this).parents('.el-form-item.abilitySelect').find('.ability.errorMessage').html('该能力已被使用，不可删除').addClass('active')
                    LayerConfig('fail','该做法字段已被使用，不能删除')
                }else{
                    $('.selectValue span').remove('.proceTip[data-id='+ids+']');
                    $('.el-form-item.practiceSelect .el-select-dropdown-item[data-id='+ids+']').removeClass('proceDisabled');
                    practiceIds.forEach(function (item,index) {
                        if(item.id == ids){
                            practiceIds.splice(index,1);
                        }
                    })
                }
            })

        }else{
            $('.selectValue span').remove('.proceTip[data-id='+ids+']');
            $('.el-form-item.practiceSelect .el-select-dropdown-item[data-id='+ids+']').removeClass('proceDisabled');
            practiceIds.forEach(function (item,index) {
                if(item.id == ids){
                    practiceIds.splice(index,1);
                }
            })
        }
        if(practiceIds.length == 0) {
            $('.selectValue.practice').html('<span class="kong">--请选择--</span>');
        }
    })

    $('body').on('click','.actions #procedure_add',function () {

        nameCorrect=!1;
        codeCorrect=!1;
        getProcedureCode();
    });

    $('body').on('click','#operation_table .table_tbody .pop-button',function () {

        $(this).parents('tr').addClass('active');
        var id = $(this).attr('data-id');

        if($(this).hasClass('view')){

            viewProcedureData(id,'view');
        }else if($(this).hasClass('edit')){
            nameCorrect=!1;
            codeCorrect=!1;
            viewProcedureData(id,'edit');

        }else {

            layer.confirm('将执行删除操作?', {icon: 3, title:'提示',offset: '250px',end:function(){
                $('.uniquetable tr.active').removeClass('active');
            }}, function(index){
                layer.close(index);
                deleteProcedureData(id);
            });
        }

    })

    $('body').on('click','#addProcedureModal_form:not(".disabled") .submit',function () {

        var parentForm = $(this).parents('#addProcedureModal_form'),
            id=parentForm.find('#itemId').val(),
            flag=parentForm.attr("data-flag"),abilityTag=1;
            produceTag=1;

        var _select = $('.selectValue .proceTip.ability'),ability_string=[],ability_id=[];
        // console.log(_select.length)
        if(_select.length){
            abilityTag=1;
            $('.abilitySelect .errorMessage').html('');
            $(_select).each(function (k,v) {
                ability_string.push($(v).text());
                ability_id.push($(v).attr('data-id'))
            })
        }else{

            ability_string=[];
            ability_id=[];
        }

      var _selectP = $('.selectValue.practice .proceTip.practice'),practice_string=[],practice_id=[];
        // console.log(_selectP.length)
      if(_selectP.length){
        practiceTag=1;
        $('.practiceSelect .errorMessage').html('');
        $(_selectP).each(function (k1,v1) {
          practice_string.push($(v1).text());
          practice_id.push($(v1).attr('data-id'))
        })
      }else{

        practice_string=[];
        practice_id=[];
      }

        for (var type in validatorConfig){validatorToolBox[validatorConfig[type]](type,flag,id)}

        if(nameCorrect&&codeCorrect&&abilityTag){
            if(!$(this).hasClass('is-disabled')){
                $(this).addClass('is-disabled');
                parentForm.addClass('disabled');

                var name = parentForm.find('#name').val().trim(),
                    code = parentForm.find('#code').val().trim(),
                    is_excrete = parentForm.find('.is-radio-checked .is_excrete').val(),
                    is_ipqc = parentForm.find('.is-radio-checked .is_ipqc').val(),
                    is_oqc = parentForm.find('.is-radio-checked .is_oqc').val(),
                    description = parentForm.find('#description').val().trim();

                $(this).hasClass('edit') ? editProcedureData({
                    operation_id:id,
                    name : name,
                    code: code,
                    ability_string:ability_string.join(','),
                    ability_id:ability_id.join(','),
                    practice_string:practice_string.join(','),
                    practice_field_id_str:practice_id.join(','),
                    is_excrete: is_excrete,
                    is_ipqc: is_ipqc,
                    is_oqc: is_oqc,
                    desc: description,
                    _token:TOKEN
                }) :
                    addProcedureData({
                        name : name,
                        code: code,
                        ability_string:ability_string.join(','),
                        ability_id:ability_id.join(','),
                        practice_string:practice_string.join(','),
                        practice_field_id_str:practice_id.join(','),
                        is_excrete: is_excrete,
                        is_ipqc: is_ipqc,
                        is_oqc: is_oqc,
                        desc: description,
                        _token:TOKEN
                    })
            }
        }

    });
    
    $('body').on('keydown','.tags_enter',function (e) {
        var key_code = e.keyCode;
        if(key_code == 13){
            addTag($(this))
        }
    }).on('blur','.tags_enter',function () {
        addTag($(this));
        $(this).parents(".tags").css({
            "border-color": "#d5d5d5"
        })
    })
    $('body').on("click", ".tag-close",function() {
            $(this).parent(".tag").remove();
        });

    //输入框的相关事件
    $('body').on('focus','.formMateriel:not(".disabled") .el-input:not([readonly])',function(){
        $(this).parents('.el-form-item').find('.errorMessage').removeClass('active').html("");
    }).on('blur','.formMateriel:not(".disabled") .el-input:not([readonly])',function(){
        var flag=$('#addProcedureModal_form').attr("data-flag"),
            name=$(this).attr("id"),
            id=$('#itemId').val();
        validatorConfig[name]
        && validatorToolBox[validatorConfig[name]]
        && validatorToolBox[validatorConfig[name]](name)
        && remoteValidatorConfig[name]
        && remoteValidatorToolbox[remoteValidatorConfig[name]]
        && remoteValidatorToolbox[remoteValidatorConfig[name]](flag,name,id);
    });

    //搜索
    $('body').on('click','#searchForm .submit:not(".is-disabled")',function(e){
        e.stopPropagation();
        $('#searchForm .el-item-hide').slideUp(400,function(){
            $('#searchForm .el-item-show').css('background','transparent');
        });
        $('.arrow .el-input-icon').removeClass('is-reverse');
        if(!$(this).hasClass('is-disabled')){
            // $(this).addClass('is-disabled');
            var parentForm=$(this).parents('#searchForm');
            $('.el-sort').removeClass('ascending descending');
            pageNo=1;
            ajaxData={
                name: encodeURIComponent(parentForm.find('#operation_name').val().trim()),
                code: parentForm.find('#operation_code').val().trim(),
            }
            console.log(ajaxData);
            getProcedureData();
        }
    });
    //重置搜索框值
    $('body').on('click','#searchForm .reset:not(.is-disabled)',function(e){
        e.stopPropagation();
        // $(this).addClass('is-disabled');
        $('#searchForm .el-item-hide').slideUp(400,function(){
            $('#searchForm .el-item-show').css('background','transparent');
        });
        $('.arrow .el-input-icon').removeClass('is-reverse');
        var parentForm=$(this).parents('#searchForm');
        parentForm.find('#operation_name').val('');
        parentForm.find('#operation_code').val('');
        $('.el-select-dropdown-item').removeClass('selected');
        $('.el-select-dropdown').hide();
        pageNo=1;
        resetParam();
        getProcedureData();
    });


}
function fieldCheckUse(flag,op_id,ids,fn) {
    if(flag =='ability'){
        AjaxClient.get({
            url: URLS['procedure'].abilityUsed+"?operation_id="+op_id+"&ability_id="+ids+'&'+_token,
            dataType: 'json',
            success: function(rsp){
                layer.close(layerLoading);
                fn && typeof fn==='function'? fn(rsp):null;
            },
            fail: function(rsp){
                layer.close(layerLoading);
                console.log('能力检测失败');
            }
        },this);
    }else{
        AjaxClient.get({
            url: URLS['procedure'].pracUsed+"?operation_id="+op_id+"&practiceFields_id="+ids+'&'+_token,
            dataType: 'json',
            success: function(rsp){
                layer.close(layerLoading);
                fn && typeof fn==='function'? fn(rsp):null;
            },
            fail: function(rsp){
                layer.close(layerLoading);
                console.log('做法字段检测失败');
            }
        },this);
    }
}
function addTag(obj) {
    
    var tag = obj.val();
    if (tag != '') {
        var i = 0;
        $(".tag").each(function() {
            var _this = $(this);
            if ($(this).text() == tag + "×") {
                $(this).addClass("tag-warning");
                setTimeout(function () {
                    _this.removeClass('tag-warning')
                }, 400);
                i++;
            }
        });
        obj.val('');
        if (i > 0) { //说明有重复
            return false;
        }
        $("#form-field-tags").before("<span class='tag'><i>" + tag + "</i><button class='close tag-close' type='button'>×</button></span>"); //添加标签
    }
}
//重置搜索参数
function resetParam(){
    ajaxData={
        name: '',
        code: '',
    };
}

function bindPagenationClick(totalData,pageSize){
    $('#pagenation').show();
    $('#pagenation').pagination({
        totalData:totalData,
        showData:pageSize,
        current: pageNo,
        isHide: true,
        coping:true,
        homePage:'首页',
        endPage:'末页',
        prevContent:'上页',
        nextContent:'下页',
        jump: true,
        callback:function(api){
            pageNo=api.getCurrent();
            getProcedureData();
        }
    });
}


function getProcedureData() {
    $('#operation_table .table_tbody').html("");
    var urlLeft='';
    for(var param in ajaxData){
        urlLeft+=`&${param}=${ajaxData[param]}`;
    }
    urlLeft += "&page_no="+pageNo+"&page_size="+pageSize;
    AjaxClient.get({
        url: URLS['procedure'].procedureList+'?'+_token+urlLeft,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success:function (rsp) {
            layer.close(layerLoading);
            if(layerModal!=undefined){
                layer.close(layerModal);
            }
            var totalData=rsp.results.total_records;
            if(rsp.results && rsp.results.list && rsp.results.list.length){
                createTableHtml($('#operation_table .table_tbody'),rsp.results.list)
            }else{
                noData('暂无数据',6);
            }
            if(totalData>pageSize){
                bindPagenationClick(totalData,pageSize);
            }else{
                $('#pagenation').html('');
            }


        },
        fail:function (rsp) {
            layer.close(layerLoading);
            if(layerModal!=undefined){
                layer.close(layerModal);
            }
            noData('获取工序列表失败，请刷新重试',10);

        }
    },this)
}

function createTableHtml(ele,data) {
    data.forEach(function (item,index) {
        var ability = [];
            produce = [];
        if(item.abilitys.length){
            item.abilitys.forEach(function (ab) {
                ability.push(ab.ability_name);
            })
        }
        if(item.practice_field.length){
          item.practice_field.forEach(function(i){
                produce.push(i.practice_field_name);
          })
        }
        var tr = `<tr>
                        <td>${item.code}</td>
                        <td>${item.name}</td>
                        <td><div class="word_wrap">${ability.join(',')}</div></td>
                        <td><div class="word_wrap">${produce.join(',')}</div></td>
                        <td><div class="word_wrap" style="word-break: break-all;">${item.desc}</div></td>
                        <td class="right">
                            <button data-id="${item.id}" class="button pop-button view">查看</button>
                            <button data-id="${item.id}" class="button pop-button edit">编辑</button>
                            <button data-id="${item.id}" class="button pop-button delete">删除</button>
                        </td>
                      </tr>`;
        ele.append(tr)
    })
}

function addProcedureData(data) {
    AjaxClient.post({
        url: URLS['procedure'].procedureAdd,
        dataType: 'json',
        data: data,
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success:function (rsp) {
            layer.close(layerLoading);
            layer.close(layerModal);
            getProcedureData();
        },
        fail: function(rsp){
            layer.close(layerLoading);
            if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                LayerConfig('fail',rsp.message)
            }
            $('body').find('#addProcedureModal_form').removeClass('disabled').find('.submit').removeClass('is-disabled');

            if(rsp&&rsp.field!==undefined){
                showInvalidMessage(rsp.field,rsp.message);
            }

        }
    },this)
}

function viewProcedureData(id,flag) {
    AjaxClient.get({
        url:URLS['procedure'].procedureShow+'?'+_token+'&operation_id='+id,
        dataType: 'json',
        beforeSend:function () {
            layerLoading = LayerConfig('load');
        },
        success:function (rsp) {
            layer.close(layerLoading);
            procedureModal(id,flag,rsp.results)
        },
        fail:function (rsp) {
            layer.close(layerLoading);
            if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                LayerConfig('fail',rsp.message);
            }

            if(rsp.code==404){
                getProcedureData();
            }
        }
    },this);
}

function editProcedureData(data) {

    AjaxClient.post({
        url:URLS['procedure'].procedureUpdate,
        data:data,
        dataType: 'json',
        beforeSend:function () {
            layerLoading = LayerConfig('load');
        },
        success:function () {
            layer.close(layerLoading);
            layer.close(layerModal);
            getProcedureData();
        },
        fail:function (rsp) {
            layer.close(layerLoading);
            if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                LayerConfig('fail',rsp.message)
            }
            $('body').find('#addProcedureModal_form').removeClass('disabled').find('.submit').removeClass('is-disabled');

            if(rsp&&rsp.field!==undefined){
                showInvalidMessage(rsp.field,rsp.message);
            }
        }
    },this)
}

function deleteProcedureData(id) {
    var data = {
        operation_id: id,
        _token: TOKEN
    };

    AjaxClient.post({
        url: URLS['procedure'].procedureDelete,
        data:data,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success:function (rsp) {
            layer.close(layerLoading);
            getProcedureData();
        },
        fail:function (rsp) {
            layer.close(layerLoading);
            if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                LayerConfig('fail',rsp.message);
            }

            if(rsp&&rsp.code==404){
                getProcedureData();
            }
        }

    },this)
}

function getProcedureCode() {
    AjaxClient.post({
        url:URLS['procedure'].getCode,
        dataType: 'json',
        data:{
            _token:TOKEN,
            type_code:'',
            type:5
        },
        beforeSend:function () {
            layerLoading = LayerConfig('load');
        },
        success:function (rsp) {
            console.log(rsp);
            layer.close(layerLoading);
            procedureModal(0,'add',rsp.results);
        },
        fail:function (rsp) {
            layer.close(layerLoading);
            if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                LayerConfig('fail',rsp.message);
            }
        }
    },this);
}
function procedureModal(ids,flag,data) {

    var {id='',code='',name='',desc='',ability=[],practice_field=[],is_excrete='',is_ipqc='',is_oqc=''} = {};
    if(data){
        ({id='',code='',name='',desc='',ability=[],practice_field=[],is_excrete='',is_ipqc='',is_oqc=''}=data);
    }


    var labelWidth=100,readonly='',title="查看工序",btnShow='btnShow',placeholder="请输入描述，最多能输入500个字符",noEdit='',disabled='';

    flag=='view' ? (readonly='readonly="readonly"',btnShow='btnHide',placeholder=''):(flag == 'add' ? title = '添加工序' : (title = '编辑工序',noEdit='readonly="readonly"'));

    layerModal=layer.open({
        type: 1,
        title: title,
        offset: '100px',
        area: '500px',
        shade: 0.1,
        shadeClose: false,
        resize: false,
        content:`<form class="addProcedureModal abilityModal formModal formMateriel" id="addProcedureModal_form" data-flag="${flag}">
                     <input type="hidden" id="itemId" value="${ids}">
                     <div style="max-height: 480px; overflow-y: auto; padding-right: 12px;">
                     <div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="width: ${labelWidth}px;">工序编码<span class="mustItem">*</span></label>
                            <input type="text" id="code" ${readonly} ${noEdit} data-name="编码" class="el-input" placeholder="请输入编码" value="${code}">
                        </div>
                        <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
                    </div>
                     <div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="width: ${labelWidth}px;">工序名称<span class="mustItem">*</span></label>
                            <input type="text" id="name" ${readonly} data-name="工序名称" class="el-input" placeholder="请输入工序名称" value="${name}">
                        </div>
                        <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
                    </div>
                     <div class="el-form-item abilitySelect">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="width: ${labelWidth}px;">能力</label>
                            <div class="el-select-dropdown-wrap">
                                <div class="el-select ${flag=='view' ? 'ability' :''}">
                                    <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                    <div style="padding-right: 35px;" class="selectValue ability">
                                        <span class="kong">--请选择--</span>
                                    </div>
                                    <input type="hidden" class="val_id" id="abilityProcedure" value="">
                                </div>
                                <div style="position: absolute;" class="el-select-dropdown">
                                    <ul class="el-select-dropdown-list">
                                        <li data-id="" class="el-select-dropdown-item kong proceDisabled" data-name="--请选择--">--请选择--</li>
                                       
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <p class="ability errorMessage" style="padding-left: ${labelWidth}px;"></p>
                    </div>
                    <div class="el-form-item practiceSelect">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="width: ${labelWidth}px;">做法字段</label>
                            <div class="el-select-dropdown-wrap">
                                <div class="el-select ${flag=='view' ? 'practice_field' :''}">
                                    <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                    <div style="padding-right: 35px;" class="selectValue practice">
                                        <span class="kong">--请选择--</span>
                                    </div>
                                    <input type="hidden" class="val_id" id="practiceProcedure" value="">
                                </div>
                                <div style="position: absolute;" class="el-select-dropdown">
                                    <ul class="el-select-dropdown-list">
                                        <li data-id="" class="el-select-dropdown-item kong proceDisabled" data-name="--请选择--">--请选择--</li>
                                   
                                    </ul>
                                </div>
                            </div>
                            <!--<div class="tags selectValue" id="tags" tabindex="1"> -->
                                <!--&lt;!&ndash;<span class="tag"></span> &ndash;&gt;-->
                                <!--<input id="form-field-tags" type="text" placeholder="Enter tags ..." value="Tag Input Control" name="tags" style="display: none;"/> -->
                                <!--<input type="text" placeholder="输入能力" class="tags_enter" autocomplete="off"/> -->
                            <!--</div> -->
                        </div>
                        <p class="practice errorMessage" style="padding-left: ${labelWidth}px;"></p>
                    </div>
                    <div class="el-form-item">
						<div class="el-form-item-div">
							<label class="el-form-item-label" style="width: ${labelWidth}px;">启用拆分</label>
							<div class="el-radio-group" style="width: 100%">
								<label class="el-radio">
									<span class="el-radio-input yes is_excrete is-radio-checked">
										<span class="el-radio-inner"></span>
										<input class="is_excrete" type="hidden" value="1">
									</span>
									<span class="el-radio-label">是</span>
								</label>
								<label class="el-radio">
									<span class="el-radio-input no is_excrete">
										<span class="el-radio-inner"></span>
										<input class="is_excrete" type="hidden" value="0">
									</span>
									<span class="el-radio-label">否</span>
								</label>
							</div>    
						</div>
					</div>  
					<div class="el-form-item">
						<div class="el-form-item-div">
							<label class="el-form-item-label" style="width: ${labelWidth}px;">IPQC检验</label>
							<div class="el-radio-group" style="width: 100%">
								<label class="el-radio">
									<span class="el-radio-input yes is_ipqc ">
										<span class="el-radio-inner"></span>
										<input class="is_ipqc" type="hidden" value="1">
									</span>
									<span class="el-radio-label">是</span>
								</label>
								<label class="el-radio">
									<span class="el-radio-input no is_ipqc is-radio-checked">
										<span class="el-radio-inner"></span>
										<input class="is_ipqc" type="hidden" value="0">
									</span>
									<span class="el-radio-label">否</span>
								</label>
							</div>    
						</div>
					</div>
					<div class="el-form-item">
						<div class="el-form-item-div">
							<label class="el-form-item-label" style="width: ${labelWidth}px;">OQC检验</label>
							<div class="el-radio-group" style="width: 100%">
								<label class="el-radio">
									<span class="el-radio-input yes is_oqc ">
										<span class="el-radio-inner"></span>
										<input class="is_oqc" type="hidden" value="1">
									</span>
									<span class="el-radio-label">是</span>
								</label>
								<label class="el-radio">
									<span class="el-radio-input no is_oqc is-radio-checked">
										<span class="el-radio-inner"></span>
										<input class="is_oqc" type="hidden" value="0">
									</span>
									<span class="el-radio-label">否</span>
								</label>
							</div>    
						</div>
					</div>       
                     <div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="width: ${labelWidth}px;">描述</label>
                            <textarea type="textarea" ${readonly} maxlength="500" id="description" rows="5" class="el-textarea" placeholder="${placeholder}">${desc}</textarea>
                        </div>
                        <p class="errorMessage"></p>
                    </div>
                    </div>
                    <div class="el-form-item ${btnShow}">
                        <div class="el-form-item-div btn-group">
                            <button type="button" class="el-button cancle">取消</button>
                            <button type="button" class="el-button el-button--primary submit ${flag}">确定</button>
                        </div>
                    </div>
                </form>`,
        success:function (layero) {
            layerEle=layero;
            // getLayerSelectPosition($(layero));
            getAbilitySource(ability,flag);
            getPracticeSource(practice_field,flag);
            if(is_excrete==0){
                $('.is_excrete.no').addClass('is-radio-checked');
                $('.is_excrete.yes').removeClass('is-radio-checked')
            }else {
                $('.is_excrete.no').removeClass('is-radio-checked');
                $('.is_excrete.yes').addClass('is-radio-checked');
            }
            if(is_ipqc==0){
                $('.is_ipqc.no').addClass('is-radio-checked');
                $('.is_ipqc.yes').removeClass('is-radio-checked')
            }else {
                $('.is_ipqc.no').removeClass('is-radio-checked');
                $('.is_ipqc.yes').addClass('is-radio-checked');
            }
            if(is_oqc==0){
                $('.is_oqc.no').addClass('is-radio-checked');
                $('.is_oqc.yes').removeClass('is-radio-checked')
            }else {
                $('.is_oqc.no').removeClass('is-radio-checked');
                $('.is_oqc.yes').addClass('is-radio-checked');
            }
            if(flag!=='view'){
                //单选按钮点击事件
                $('body').on('click','.formMateriel:not(".disabled") .el-radio-input',function(e){
                    $(this).parents('.el-radio-group').find('.el-radio-input').removeClass('is-radio-checked');
                    $(this).addClass('is-radio-checked');
                });
            }else{
                $('.el-radio-group').css('pointer-events','none');
            }
        },
        end: function(){
            $('.uniquetable tr.active').removeClass('active');
        }
    })
    }

function getAbilitySource(val,flag) {
    AjaxClient.get({
        url: URLS['ability'].list+'?'+_token,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success:function (rsp) {
            layer.close(layerLoading);

            if(rsp.results && rsp.results.length){
                var lis='',innerhtml='';
               rsp.results.forEach(function (item,index) {
                   lis+=`<li data-id="${item.id}" class="el-select-dropdown-item" class=" el-select-dropdown-item">${item.name}</li>`;
               })
                innerhtml=`
                        <li data-id="" class="el-select-dropdown-item kong proceDisabled">--请选择--</li>
                        ${lis}`;
                $('.el-form-item.abilitySelect').find('.el-select-dropdown-list').html(innerhtml);

                if(val.length){
                    val.forEach(function (item) {
                        $('.el-form-item.abilitySelect .el-select-dropdown-item[data-id='+item.ability_id+']').click();
                    })
                }
                flag=='view' ? $('.proceTipDel').hide() :'';

            }
        },
        fail: function(rsp){
            layer.close(layerLoading);

        }
    })
}

function getPracticeSource(val,flag) {
  AjaxClient.get({
    url: URLS['practice'].listAll+'?'+_token,
    dataType: 'json',
    beforeSend: function(){
      layerLoading = LayerConfig('load');
    },
    success:function (rsp) {
      layer.close(layerLoading);

      if(rsp.results && rsp.results.length){
        var lis='',innerhtml='';
        rsp.results.forEach(function (item,index) {
          lis+=`<li data-id="${item.practice_field_id}" class="el-select-dropdown-item" class=" el-select-dropdown-item">${item.name}</li>`;
        })
        innerhtml=`
                        <li data-id="" class="el-select-dropdown-item kong proceDisabled">--请选择--</li>
                        ${lis}`;
        $('.el-form-item.practiceSelect').find('.el-select-dropdown-list').html(innerhtml);

        if(val.length){
          val.forEach(function (item) {
            $('.el-form-item.practiceSelect .el-select-dropdown-item[data-id='+item.practice_field_id+']').click();
          })
        }
        flag=='view' ? $('.proceTipDel').hide() :'';
      }
    },
    fail: function(rsp){
      layer.close(layerLoading);

    }
  })
}
$('body').on('input','.el-item-show #operation_code',function(event){
    event.target.value = event.target.value.replace( /[`~!@#$%^&*()\+=<>?:"{}|,.\/;'\\[\]·~！@#￥%……&*（）\+={}|《》？：“”【】、；‘’，。、]/im,"");
})