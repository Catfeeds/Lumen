var layerLoading,
layerConfirm,
validatorToolBox={
    checkLength: function(ele){
        var value=Number(ele.val().trim());
        return value>=1&&Validate.checkNumber(1,2,value)?(!0):(!1);
    }
},
validatorConfig = {
    material: {
        length: 'checkLength'
    }
};

var results=[{
    "id": 1,
    "module_name": "物料编码",
    "prefix": [
        {
            "id": 1,
            "prefix_name": "物料分类编码",
            "type": "select",
            "Number": 1,
            "rule": ""
        },
        {
            "id": 2,
            "prefix_name": "操作员",
            "type": "",
            "Number":'' ,
            "rule": ""
        },
        {
            "id": 3,
            "prefix_name": "录入日期",
            "type": "",
            "Number":4,
            "rule": [{'id': 4,'prefix_name':'年'},
            {'id':5,'prefix_name':'年/月'},
            {'id':6,'prefix_name':'年/月/日'}]
        }
    ]
},{
    "id": 2,
    "module_name": "物料模板编码",
    "prefix": [
        {
            "id": 2,
            "prefix_name": "操作员",
            "type": "",
            "Number":'' ,
            "rule": ""
        },
        {
            "id": 3,
            "prefix_name": "录入日期",
            "type": "",
            "Number":4,
            "rule": [{'id': 4,'prefix_name':'年'},
            {'id':5,'prefix_name':'年/月'},
            {'id':6,'prefix_name':'年/月/日'}]
        }
    ]
},{
    "id": 3,
    "module_name": "属性编码",
    "prefix": [
        {
            "id": 2,
            "prefix_name": "操作员",
            "type": "",
            "Number":'' ,
            "rule": ""
        },
        {
            "id": 3,
            "prefix_name": "录入日期",
            "type": "",
            "Number":4,
            "rule": [{'id': 4,'prefix_name':'年'},
            {'id':5,'prefix_name':'年/月'},
            {'id':6,'prefix_name':'年/月/日'}]
        }
    ]
},{
  "id": 4,
  "module_name": "能力编码",
  "prefix": [
    {
      "id": 2,
      "prefix_name": "操作员",
      "type": "",
      "Number":'' ,
      "rule": ""
    },
    {
      "id": 3,
      "prefix_name": "录入日期",
      "type": "",
      "Number":4,
      "rule": [{'id': 4,'prefix_name':'年'},
        {'id':5,'prefix_name':'年/月'},
        {'id':6,'prefix_name':'年/月/日'}]
    }
  ]
},{
  "id": 5,
  "module_name": "工序编码",
  "prefix": [
    {
      "id": 2,
      "prefix_name": "操作员",
      "type": "",
      "Number":'' ,
      "rule": ""
    },
    {
      "id": 3,
      "prefix_name": "录入日期",
      "type": "",
      "Number":4,
      "rule": [{'id': 4,'prefix_name':'年'},
        {'id':5,'prefix_name':'年/月'},
        {'id':6,'prefix_name':'年/月/日'}]
    }
  ]
},{
  "id": 6,
  "module_name": "图纸编码",
  "prefix": [
    {
      "id": 1,
      "prefix_name": "分类分组编码",
      "type": "",
      "Number":'' ,
      "rule": ""
    },
    {
      "id": 2,
      "prefix_name": "操作员",
      "type": "",
      "Number":'' ,
      "rule": ""
    },
    {
      "id": 3,
      "prefix_name": "录入日期",
      "type": "",
      "Number":4,
      "rule": [{'id': 4,'prefix_name':'年'},
        {'id':5,'prefix_name':'年/月'},
        {'id':6,'prefix_name':'年/月/日'}]
    }
  ]
},{
  "id": 7,
  "module_name": "销售订单编码",
  "prefix": [
    {
      "id": 2,
      "prefix_name": "操作员",
      "type": "",
      "Number":'' ,
      "rule": ""
    },
    {
      "id": 3,
      "prefix_name": "录入日期",
      "type": "",
      "Number":4,
      "rule": [{'id': 4,'prefix_name':'年'},
        {'id':5,'prefix_name':'年/月'},
        {'id':6,'prefix_name':'年/月/日'}]
    }
  ]
},{
  "id": 8,
  "module_name": "做法编码",
  "prefix": [
    {
      "id": 1,
      "prefix_name": "工序产品分类做法分类",
      "type": "",
      "Number":'' ,
      "rule": ""
    },
    {
      "id": 2,
      "prefix_name": "操作员",
      "type": "",
      "Number":'' ,
      "rule": ""
    },
    {
      "id": 3,
      "prefix_name": "录入日期",
      "type": "",
      "Number":4,
      "rule": [{'id': 4,'prefix_name':'年'},
        {'id':5,'prefix_name':'年/月'},
        {'id':6,'prefix_name':'年/月/日'}]
    }
  ]
},{
  "id": 9,
  "module_name": "流转品编码",
  "prefix": [
    {
      "id": 1,
      "prefix_name": "物料分类工序编码",
      "type": "",
      "Number":'' ,
      "rule": ""
    },
    {
      "id": 2,
      "prefix_name": "操作员",
      "type": "",
      "Number":'' ,
      "rule": ""
    },
    {
      "id": 3,
      "prefix_name": "录入日期",
      "type": "",
      "Number":4,
      "rule": [{'id': 4,'prefix_name':'年'},
        {'id':5,'prefix_name':'年/月'},
        {'id':6,'prefix_name':'年/月/日'}]
    }
  ]
},{
  "id": 10,
  "module_name": "制造BOM编码",
  "prefix": [
    {
      "id": 1,
      "prefix_name": "物料清单编码+版本号",
      "type": "",
      "Number":'' ,
      "rule": ""
    },
    {
      "id": 2,
      "prefix_name": "操作员",
      "type": "",
      "Number":'' ,
      "rule": ""
    },
    {
      "id": 3,
      "prefix_name": "录入日期",
      "type": "",
      "Number":4,
      "rule": [{'id': 4,'prefix_name':'年'},
        {'id':5,'prefix_name':'年/月'},
        {'id':6,'prefix_name':'年/月/日'}]
    }
  ]
},{
    "id": 11,
    "module_name": "工艺路线编码",
    "prefix": [
        {
            "id": 1,
            "prefix_name": "操作员",
            "type": "",
            "Number":'' ,
            "rule": ""
        },
        {
            "id": 2,
            "prefix_name": "录入日期",
            "type": "",
            "Number":4,
            "rule": [{'id': 4,'prefix_name':'年'},
                {'id':5,'prefix_name':'年/月'},
                {'id':6,'prefix_name':'年/月/日'}]
        }
    ]
},{
    "id": 12,
    "module_name": "做法字段编码",
    "prefix": [
        {
            "id": 1,
            "prefix_name": "操作员",
            "type": "",
            "Number":'' ,
            "rule": ""
        },
        {
            "id": 2,
            "prefix_name": "录入日期",
            "type": "",
            "Number":4,
            "rule": [{'id': 4,'prefix_name':'年'},
                {'id':5,'prefix_name':'年/月'},
                {'id':6,'prefix_name':'年/月/日'}]
        }
    ]
}

];


$(function(){
    createTreeList($('.addCode_from .panel-left'),results);
    bindEvent();
});

//清空数据
function resetData(){
    $('.el-checkbox_input.is-checked').removeClass('is-checked');
    $('.el-input.prefixlength').removeClass('lenactive').val('').attr('readonly','readonly');
    $('.el-form-item.rule .el-form-item-div').html('<input type="text" class="el-input rule val_id" readonly="readonly" placeholder="" value="">');
    $('tr.tr-prefix').each(function(){
        separator(false,$(this).find('.el-form-item.prefix_symbol'));
    });
    $('#serial_number_length').val(6);
    $('#serial_number_start').val(0);
    $('#serial_number_step').val(1);
    $('.el-form-item.preview .prefix_input').val('');
    createOut();
}

//生成树形列表
function createTreeList(ele,data){
    var ul=$(`<ul class="treeul">
            <li class="treeli">
                <div class="title-item" title="基础编码"><i class="fa fa-folder-o"></i>基础编码</div>
                <ul class="ctreeul">
                </ul>
            </li>
        </ul>`);
    var ulele=ul.find('.ctreeul');
    data.forEach(function(item){
        var li=`<li class="treeli"><div class="title-item" data-id="${item.id}" id="${item.id}" title="${item.module_name}"><i class="line"></i><i class="fa fa-file-o"></i>${item.module_name}</div></li>`;
        ulele.append(li);
        ulele.find('li:last-child').data('item',item);
    }); 

    ele.append(ul);
}


//生成dropdown list
function createDropDown(data,type){
    var lis='',val,id;
    data.forEach(function(item){
        lis+=`<li data-id="${item.id}" data-type="${item.type||''}" data-number="${item.Number||''}" class="el-select-dropdown-item" class="el-select-dropdown-item">${item.prefix_name}</li>`;
    });
    var innerhtml='';
    if(type!='rule'){
        innerhtml=`<div class="el-select-dropdown-wrap">
        <div class="el-select">
            <i class="el-input-icon el-icon el-icon-caret-top"></i>
            <span type="text" class="el-input">--请选择--</span>
            <input type="hidden" class="val_id attr-val" value="">
        </div>
        <div class="el-select-dropdown">
            <ul class="el-select-dropdown-list">
                <li data-id="" class="el-select-dropdown-item kong" data-name="--请选择--" class=" el-select-dropdown-item">--请选择--</li>
                ${lis}
            </ul>
        </div>
        </div>`;
    }else{
        innerhtml=`<div class="el-select-dropdown-wrap">
        <div class="el-select">
            <i class="el-input-icon el-icon el-icon-caret-top"></i>
            <span type="text" class="el-input">${data[0].prefix_name}</span>
            <input type="hidden" class="val_id attr-val" value="${data[0].id}">
        </div>
        <div class="el-select-dropdown">
            <ul class="el-select-dropdown-list">
                ${lis}
            </ul>
        </div>
        </div>`;
    }
    return innerhtml;
}

//生成或清空分隔符
function separator(flag,ele){
    if(flag){
        var lis=`<li data-id="0" class="el-select-dropdown-item kong">--请选择--</li>
                <li data-id="1" class="el-select-dropdown-item">中划线</li>
                <li data-id="2" class="el-select-dropdown-item">下划线</li>`;
        ele.find('.el-select-dropdown-list').html(lis);
    }else{
        ele.find('.val_id').val('');
        ele.find('.el-input').text('--请选择--');
        ele.find('.el-select-dropdown-list').html('<li data-id="0" class="el-select-dropdown-item kong">--请选择--</li>');
    }
}
//效果展示
function createOut(){
    var len=0,slen=0,start=0,str='';
    $('.el-input.length:not([readonly])').each(function(){
        if($(this).val()!=''){
            if($(this).hasClass('prefixlength')){
                len=Number($(this).val());
                var prefix_symbol=$(this).parents('tr').find('.el-form-item.prefix_symbol .val_id').val();
                if(prefix_symbol==1){//中划线
                    str=str+new Array(len+1).join('*')+'-';
                }else if(prefix_symbol==2){//下划线
                    str=str+new Array(len+1).join('*')+'_';
                }else{
                   str=str+new Array(len+1).join('*'); 
                }
            }else{
                slen=Number($(this).val());
            }
        }

    });
    var start=Number($('#serial_number_length').val())==0?'':$('.el-input.start').val().trim();
    str+=new Array(slen+1).join('0');
    var len1=str.length-start.length;
    str=str.substring(0,len1)+start;
    $('.el-input.previewout').val(str);
}

function Save(automatic_number,single_prefix){  
    var data;
    data={
            _token: TOKEN,
            prefix1:$('.el-form-item.prefix.one').find('.val_id').val(),
            prefix1_length:$('#prefix1_length').val().trim(),
            prefix1_rule:$('.el-form-item.rule.one').find('.el-input').text(),
            prefix2:$('.el-form-item.prefix.two').find('.val_id').val(),
            prefix2_length:$('#prefix2_length').val().trim(),
            prefix2_rule:$('.el-form-item.rule.two').find('.el-input').text(),
            prefix3:$('.el-form-item.prefix.three').find('.val_id').val(),
            prefix3_length:$('#prefix3_length').val().trim(),
            prefix3_rule:$('.el-form-item.rule.three').find('.el-input').text(),
            automatic_number: automatic_number,
            serial_number_length:$('#serial_number_length').val().trim(),
            serial_number_start:$('#serial_number_start').val().trim(),
            serial_number_step:$('#serial_number_step').val().trim(),
            single_prefix: single_prefix,
            prefix1_symbol: $('#prefix1_symbol').val(),
            prefix2_symbol: $('#prefix2_symbol').val(),
            prefix3_symbol: $('#prefix3_symbol').val(),
            type: $('.title-item.active').attr('data-id')
        };
    AjaxClient.post({
        url: URLS['encoding'].save,
        data: data,
        dataType: 'json',
        success: function(rsp){
            LayerConfig('success','保存编码成功!');
        },
        fail: function(rsp){
            LayerConfig('fail',rsp.message||'保存失败');
        },
        complete: function(XHR, TS){
            $('body').find('.submit').removeClass('is-disabled');
        }
    },this);
}

function getSaveData(type){
    AjaxClient.get({
        url:URLS['encoding'].show+'?type='+type+'&'+_token,
        dataType:'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            if(rsp.results==null||rsp.results==undefined){
                return;
            }
            var data = JSON.parse(rsp.results.rule);
            $('.el-checkbox_input:not([data-set=4])').each(function(){
                var dapo=$(this).attr('data-post');
                if(data.automatic_number==dapo){
                    $(this).click();
                    if(data.automatic_number==0){
                        $('.el-select').addClass('noedit');
                        return;
                    }
                }
           });
            data.single_prefix==1?$('.el-checkbox_input[data-set=4]').click():null;
            if(data.prefix1!=0){
                $('.el-form-item.one').find('.el-select-dropdown-item[data-id='+data.prefix1+']').click();
                separator(true,$('.el-form-item.prefix_symbol[data-input=prefix1_symbol]'));
                setTimeout(function(){
                    $('#prefix1_symbol').parents('.el-select-dropdown-wrap').
                        find('.el-select-dropdown-item[data-id='+Number(data.prefix1_symbol)+']').click();
                },20);
                if(data.prefix1=='3'){
                    setTimeout(function(){
                        $('.el-form-item.rule.one').find('.el-select-dropdown-item[data-name="'+data.prefix1_rule+'"]').click();
                    },200);
                }else{
                    $('.el-form-item.rule.one').find('.el-form-item-div').html(`<input type="text" class="el-input rule" placeholder="" value="${data.prefix1_rule}">`);
                }
                data.prefix1_length?$('#prefix1_length').val(data.prefix1_length):$('#prefix1_length').val('');
            }
            if(data.prefix2!=0){
                $('.el-form-item.two').find('.el-select-dropdown-item[data-id='+data.prefix2+']').click();
                separator(true,$('.el-form-item.prefix_symbol[data-input=prefix2_symbol]'));
                setTimeout(function(){
                    $('#prefix2_symbol').parents('.el-select-dropdown-wrap').
                        find('.el-select-dropdown-item[data-id='+Number(data.prefix2_symbol)+']').click();
                },20);
                if(data.prefix2=='3'){
                    setTimeout(function(){
                        $('.el-form-item.rule.two').find('.el-select-dropdown-item[data-name="'+data.prefix2_rule+'"]').click();
                    },200);
                }else{
                    $('.el-form-item.rule.two').find('.el-form-item-div').html(`<input type="text" class="el-input rule" placeholder="" value="${data.prefix2_rule}">`);
                }
                data.prefix2_length?$('#prefix2_length').val(data.prefix2_length):$('#prefix2_length').val('');
            }
            if(data.prefix3!=0){
                $('.el-form-item.three').find('.el-select-dropdown-item[data-id='+data.prefix3+']').click();
                separator(true,$('.el-form-item.prefix_symbol[data-input=prefix3_symbol]'));
                setTimeout(function(){
                    $('#prefix3_symbol').parents('.el-select-dropdown-wrap').
                        find('.el-select-dropdown-item[data-id='+Number(data.prefix3_symbol)+']').click();
                },20);
                if(data.prefix3=='3'){
                    setTimeout(function(){
                        $('.el-form-item.rule.three').find('.el-select-dropdown-item[data-name="'+data.prefix3_rule+'"]').click();
                    },200); 
                }else{
                    $('.el-form-item.rule.three').find('.el-form-item-div').html(`<input type="text" class="el-input rule" placeholder="" value="${data.prefix3_rule}">`);
                }
                data.prefix3_length?$('#prefix3_length').val(data.prefix3_length):$('#prefix3_length').val('');
            }
           $('#serial_number_length').val(data.serial_number_length);
           $('#serial_number_start').val(data.serial_number_start);
           $('#serial_number_step').val(data.serial_number_step);
           setTimeout(function(){
            createOut();
           },40);
           
        },
        fail: function(rsp){
            layer.close(layerLoading);
            console.log('获取数据失败');
        }
    },this);
    }

function removeNoAuto(autoLength){
    if(autoLength){
        $('.el-select').removeClass('noedit');
        $('.el-input.serial_num').val('流水号');
        $('#serial_number_length').val(6);
        $('#serial_number_start').val(0);
        $('#serial_number_step').val(1);
    }
}

function bindEvent(){
    //点击弹框内部关闭dropdown
    $(document).click(function (e) {
        var obj = $(e.target);
        if (!obj.hasClass('el-select-dropdown-wrap') && obj.parents(".el-select-dropdown-wrap").length === 0) {
            $('.el-select-dropdown').slideUp();
        }
    });
    //所有按钮禁止冒泡及默认行为
    $('body').on('click','.button',function(e){
        e.stopPropagation();
        e.preventDefault();
    });
    //取消
    $('body').on('click','.cancle',function(e){
        e.stopPropagation();
        if($(this).hasClass('no')){
            layer.close(layerConfirm);
        }
    });
    $('body').on('click','.el-select-dropdown-wrap',function(e){
        e.stopPropagation();
    });

    //下拉列表项点击事件
    $('body').on('click','.el-select-dropdown-item',function(e){//li点击事件
        e.stopPropagation();
        var ele=$(this).parents('.el-select-dropdown').siblings('.el-select'),//input框
        parele=$(this).parents('.el-form-item');//td里的div
        var idval=$(this).attr('data-id')//li的id
        ,formerVal=ele.find('.val_id').val();//input框的值（hidden）
        var input=$(this).parents('.el-form-item').attr('data-input');//prefix_one
        if(idval!=""&&idval!=formerVal){
            if(parele.hasClass('prefix')){
                $(this).parents('td').siblings('td').find('.el-input').removeAttr('readonly');
                var preArr=[];
                $('.el-form-item.prefix').each(function(){
                    var val=$(this).find('.val_id').val().trim();
                    if(val!=''){
                        preArr.push(val);
                    }
                });
                if(preArr.indexOf(idval)!==-1){
                    console.log('前缀重复');
                    return false;
                }else{
                    var numval=$(this).attr('data-number');
                    ele.parents('tr').find('.length.prefixlength').val(numval).addClass('lenactive');
                    $('.el-input.'+input).val($(this).text());
                    if(idval=='3'){
                        var drop=createDropDown(results[0].prefix[2].rule,'rule');
                        ele.parents('tr').find('.rule .el-form-item-div').html(drop);
                    }else{
                        ele.parents('tr').find('.el-form-item.rule .el-form-item-div').html(`<input type="text" class="el-input rule" placeholder="" value="">`);
                    }
                    separator(true,parele.parents('tr').find('.el-form-item.prefix_symbol'));
                }
            }
        }else if(idval==""){
            if(parele.hasClass('prefix')){
                $('.el-input.'+input).val('');
                ele.parents('tr').find('.el-input.prefixlength').val('').removeClass('lenactive');
                ele.parents('tr').find('.el-form-item.rule .el-form-item-div').html(`<input type="text" class="el-input rule" readonly="readonly" placeholder="" value="">`);
                $(this).parents('td').siblings('td').find('.el-input').attr('readonly','readonly');
                separator(false,parele.parents('tr').find('.el-form-item.prefix_symbol'));
            }
        }
        $(this).parent().find('.el-select-dropdown-item').removeClass('selected');
        $(this).addClass('selected');
        ele.find('.el-input').text($(this).text());
        ele.find('.val_id').val(idval);
        $(this).parents('.el-select-dropdown').hide().siblings('.el-select').find('.el-input-icon').removeClass('is-reverse');
        createOut();
    });
    $('body').on('change','.el-input',function(){
        createOut();
    });

    $('body').on('click','.el-select:not(.noedit)',function(){
        $(this).find('.el-input-icon').toggleClass('is-reverse');
        $(this).parents('.el-form-item').siblings().find('.el-select-dropdown').hide();
        $(this).parents('.el-form-item').siblings().find('.el-select .el-input-icon').removeClass('is-reverse');
        if($(this).parents('.value_wrap').length&&$(this).find('.el-input-icon.is-reverse').length){
            var width=$(this).width();
            var offset=$(this).offset();
            $(this).siblings('.el-select-dropdown').width(width).css({top: 0,left: 0}).offset({top: offset.top+30,left: offset.left});
        }
        $(this).siblings('.el-select-dropdown').toggle();
    });
    // checkbox点击事件
    $('body').on('click','.el-checkbox_input',function(){
        var eles=$(this).parents('form'),
        ele=$(this).parents('.el-form-item'),
        autoLength=$('.el-checkbox_input.is-checked[data-set=1]').length;

        if($(this).attr('data-set')==1){
            removeNoAuto(autoLength);
            $(this).hasClass('is-checked')?($(this).removeClass('is-checked'),
                eles.find('.info .el-input').removeAttr('readonly'),
                createOut()
            ):($(this).addClass('is-checked'),
            ele.siblings('.el-form-item').find('.el-checkbox_input').removeClass('is-checked'),
            $('.el-input').val('').attr('readonly','readonly'),
            $('.el-select-dropdown-item.kong').click(),
            $('.el-select').addClass('noedit'));
        }else{
            if($(this).attr('data-set')==2||$(this).attr('data-set')==3){
                removeNoAuto(autoLength);
                $(this).hasClass('is-checked')?($(this).removeClass('is-checked'))
                :($(this).addClass('is-checked'),
                ele.siblings('.el-form-item').find('.el-checkbox_input:not([data-set=4])').removeClass('is-checked'),
                eles.find('.el-checkbox_input[data-set=4]').hasClass('is-checked')?(eles.
                    find('.info tbody tr:not(:first-child,:last-child)').find('.el-input').attr('readonly','readonly')):
                (eles.find('.info .el-input').removeAttr('readonly')),createOut());
            }else{
                removeNoAuto(autoLength);
                $(this).hasClass('is-checked')?($(this).removeClass('is-checked'),
                eles.find('.info .el-input').removeAttr('readonly'),
                $('.el-select').removeClass('noedit')
                ):($(this).addClass('is-checked'),
                ele.siblings('.el-form-item').find('.el-checkbox_input:not([data-set=2],[data-set=3])')
                .removeClass('is-checked'),
                $('.info tbody tr:not(:first-child)').find('.el-select').addClass('noedit').siblings('.el-select-dropdown').find('.el-select-dropdown-item.kong').click(),
                $('.el-input.prefix_two').val(''),$('.el-input.prefix_three').val(''),
                eles.find('.info tbody tr:first-child').find('.el-input').removeAttr('readonly'),
                eles.find('.info tbody tr:not(:first-child,:last-child)').find('.el-input').attr('readonly','readonly'),
                createOut());
            }
        }
        if(!$(this).hasClass('is-checked')){
            if(ele.find('.el-select').length){
                ele.find('.el-select').addClass('noedit');
            }else{
                ele.find('.el-input').attr('readonly','readonly');
            }  
        }else{
            if(ele.find('.el-select').length){
                ele.find('.el-select').removeClass('noedit');
            }else{
                ele.find('.el-input').removeAttr('readonly');
            }  
        }
    });
    //tap切换按钮
    $('body').on('click','.el-tap-wrap .el-tap',function(){    
        var form=$(this).attr('data-item');
        if(!$(this).hasClass('active')){
            $(this).addClass('active').siblings('.el-tap').removeClass('active');
            $('.'+form).addClass('active').siblings('.el-panel').removeClass('active');
        }
    });
    //树形列表的点击
    $('body').on('click','.title-item',function(){ 
        if($(this).attr('title')=='基础编码'){
            return false;
        }
        resetData();
        $(this).addClass('active').parent().siblings('li').find('.title-item').removeClass('active'); 
        var dataItem=$(this).parent().data('item');
        if(dataItem.prefix&&dataItem.prefix.length){
            var drop=createDropDown(dataItem.prefix,'prefix');
            $('.el-form-item.prefix').find('.divwrap').html(drop);
        }
        var ele=$('.previewdiv');
        ele.find('.serial_num').val('流水号');
        ele.find('.previewout').val('000000');
        getSaveData($(this).attr('id'));
    });
    //添加按钮点击
    $('body').on('click','.submit:not(.is-disabled)',function (e) {
        e.stopPropagation();
        if(!$(this).hasClass('is-disabled')) {
            $(this).addClass('is-disabled');
            var eles=$(this).parents('.formTemplate'),that=$(this);
            var checkbox=$('.el-checkbox_input.is-checked'),
            single_prefix=0,automatic_number=0;
            if(!checkbox.length){
                LayerConfig('fail','必须选择编号选项！');
                $('.submit').removeClass('is-disabled');
                return false;
            }
            checkbox.each(function(){
                if($(this).attr('data-set')==4){//单前缀
                    single_prefix=$(this).attr('data-post');
                }else{
                    automatic_number=$(this).attr('data-post');
                }
            });
            
            if(automatic_number!=0&&Number($('#serial_number_start').val())<0){
                LayerConfig('fail','起始值不能小于0！');
                $('.submit').removeClass('is-disabled');
                return false;
            }
            if(automatic_number!=0&&Number($('#serial_number_step').val())<1){
                LayerConfig('fail','步长不能小于1！');
                $('.submit').removeClass('is-disabled');
                return false;
            }
            var correct=1;
            $('.el-input.prefixlength.lenactive').each(function(){
                if(Number($(this).val())<=0){
                    LayerConfig('fail','已选前缀长度要大于0！');
                    $('.submit').removeClass('is-disabled');
                    correct=!1;
                    return false;
                }
            });
            if(!correct){
                return false;
            }
            var len=Number($('#serial_number_length').val()),
            start=$('#serial_number_start').val();
            if((automatic_number!=0||single_prefix==1)&&len<=0){
                LayerConfig('fail','流水号长度不能小于1');
                $('.submit').removeClass('is-disabled');
                return false;
            }else if((automatic_number!=0||single_prefix==1)&&len<start.length){
                LayerConfig('fail','起始值长度大于流水号长度');
                $('.submit').removeClass('is-disabled');
                return false;
            }else if ((automatic_number!=0||single_prefix==1)&&len!=0&&len<6){
                layer.confirm('流水号依据的长度太小!是否保存', {
                    icon: 5,
                    btn: ['是', '否'],
                    closeBtn: 0,
                    title: false,
                    offset: '250px',
                    btn2: function(index, layero){
                    $('.submit').removeClass('is-disabled');
                    layer.close(index);
                  }
                }, function(index, layero){
                    Save(automatic_number,single_prefix);
                    layer.close(index);
                });
            }else{
                Save(automatic_number,single_prefix);
            }
        }
    });

}

    