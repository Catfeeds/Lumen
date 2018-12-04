var layerModal,
    layerLoading,
    pageNo=1,
    pageSize=20,
    ajaxData={},
    codeCorrect=!1,
    nameCorrect=!1,
    textCorrect=!1,
    validatorToolBox={
        checkName: function(name){
            var value=$('#'+name).val().trim();
            return $('#'+name).parents('.el-form-item').find('.errorMessage').hasClass('active')?(nameCorrect=!1,!1):
                Validate.checkNull(value)?(showInvalidMessage(name,"英文名不能为空"),nameCorrect=!1,!1):
                    (nameCorrect=1,!0);
        },
        checkCode: function(name){
            var value=$('#'+name).val().trim();
            return $('#'+name).parents('.el-form-item').find('.errorMessage').hasClass('active')?(codeCorrect=!1,!1):
                Validate.checkNull(value)?(showInvalidMessage(name,"国际标准化组织码不能为空"),codeCorrect=!1,!1):
                        (codeCorrect=1,!0);
        },
        checkText: function(name){
            var value=$('#'+name).val().trim();
            return $('#'+name).parents('.el-form-item').find('.errorMessage').hasClass('active')?(textCorrect=!1,!1):
                Validate.checkNull(value)?(showInvalidMessage(name,"中文名不能为空"),textCorrect=!1,!1):
                        (textCorrect=1,!0);
        }
    },
    remoteValidatorToolbox={
        remoteCheckName: function(name){
            var value=$('#'+name).val().trim();
            getUnique(name,value,function(rsp){
                if(rsp.results&&rsp.results.exist){
                    nameCorrect=!1;
                    var val='已注册';
                    showInvalidMessage(name,val);
                }else{
                    nameCorrect=1;
                }
            });
        },
        remoteCheckCode: function(name){
            var value=$('#'+name).val().trim();
            getUnique(name,value,function(rsp){
                if(rsp.results&&rsp.results.exist){
                    codeCorrect=!1;
                    var val='已注册';
                    showInvalidMessage(name,val);
                }else{
                    codeCorrect=1;
                }
            });
        },
        remoteText: function(name){
                var value=$('#'+name).val().trim();
                getUnique(name,value,function(rsp){
                    if(rsp.results&&rsp.results.exist){
                        textCorrect=!1;
                        var val='已注册';
                        showInvalidMessage(name,val);
                    }else{
                        textCorrect=1;
                    }
                });
            },
        },
    validatorConfig = {
        name: "checkName",
        iso_code: "checkCode",
        unit_text:"checkText"
    },remoteValidatorConfig={
        name: "remoteCheckName",
        iso_code: "remoteCheckCode",
        unit_text:"remoteText"
    };
$(function(){
    getUnits();
    bindEvent();
});

//检测唯一性
function getUnique(field, value, fn) {
    var urlLeft='';

    urlLeft=`&field=${field}&value=${value}`;

    var xhr=AjaxClient.get({
        url: URLS['unit'].unique+"?"+_token+urlLeft,
        dataType: 'json',
        beforeSend: function(){
            // layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            // layer.close(layerLoading);
            fn && typeof fn==='function'? fn(rsp):null;
        },
        fail: function(rsp){
            console.log('唯一性检测失败');
            // layer.close(layerLoading);
        }
    },this);
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
            getUnits();
        }
    });
}
//显示错误信息
function showInvalidMessage(name,val){
    $('#'+name).parents('.el-form-item').find('.errorMessage').html(val).addClass('active');
    $('#addUnit_from').find('.submit').removeClass('is-disabled');
}


//获取单位列表
function getUnits(){

    var urlLeft="&page_no="+pageNo+"&page_size="+pageSize;

    $('.table_tbody').html('');
    AjaxClient.get({
        url: URLS['unit'].pageIndex+"?"+_token+urlLeft,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            if(layerModal!=undefined){
                layer.close(layerModal);
            }
            var totalData=rsp.paging.total_records;
            if(rsp.results&&rsp.results.length){
                createHtml($('.table_tbody'),rsp.results);
            }else{
                noData('暂无数据',10);
            }
            if(totalData>pageSize){
                bindPagenationClick(totalData,pageSize);
            }else{
                $('#pagenation').html('');
            }
        },
        fail: function(rsp){
            layer.close(layerLoading);
            if(layerModal!=undefined){
                layer.close(layerModal);
            }
            noData('获取物料列表失败，请刷新重试',10);
        },
        complete: function(){
            $('#searchForm .submit,#searchForm .reset').removeClass('is-disabled');
        }
    },this);
}

//删除物料
function deleteUnit(id,leftNum){
    AjaxClient.get({
        url: URLS['unit'].delete+"?"+_token+"&id="+id,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            // LayerConfig('success','删除成功');
            if(leftNum==1){
                pageNo--;
                pageNo?null:(pageNo=1);
            }
            getUnits();
        },
        fail: function(rsp){
            layer.close(layerLoading);
            if(rsp&&rsp.message){
                LayerConfig('fail',rsp.message);
            }else{
                LayerConfig('fail','删除失败');
            }
            if(rsp.code==404){
                pageNo? null:pageNo=1;
                getUnits();
            }
        }
    },this);
}

//生成列表数据
function createHtml(ele,data){
    data.forEach(function(item,index){
        var tr=`
            <tr class="tritem" data-id="${item.id}">
                <td>${tansferNull(item.name)}</td>
                <td>${tansferNull(item.unit_text)}</td>
                <td>${tansferNull(item.label)}</td>
                <td>${tansferNull(item.iso_code)}</td>
                <td>${tansferNull(item.commercial)}</td>
                <td>${tansferNull(item.technical)}</td>
                <td>${tansferNull(item.description)}</td>
                <td class="right">
                 <button data-id="${item.id}" class="button pop-button view">查看</button>
                 <button data-id="${item.id}" class="button pop-button edit">编辑</button>
                 <button data-id="${item.id}" class="button pop-button delete">删除</button>
                </td>
            </tr>
        `;
        ele.append(tr);
        ele.find('tr:last-child').data("trData",item);
    });
}






function bindEvent(){
    //点击弹框内部关闭dropdown
    $(document).click(function (e) {
        var obj = $(e.target);
        if (!obj.hasClass('el-select-dropdown-wrap') && obj.parents(".el-select-dropdown-wrap").length === 0) {
            $('.el-select-dropdown').slideUp().siblings('.el-select').find('.el-input-icon').removeClass('is-reverse');
        }
        if(!obj.hasClass('.searchModal')&&obj.parents(".searchModal").length === 0){
            $('#searchForm .el-item-hide').slideUp(400,function(){
                $('#searchForm .el-item-show').css('background','transparent');
            });
            $('.arrow .el-input-icon').removeClass('is-reverse');
        }
    });
    $('body').on('click','#searchForm .el-select-dropdown-wrap',function(e){
        e.stopPropagation();
    });
    $('.uniquetable').on('click','.delete',function(){
        var id=$(this).attr("data-id");
        var num=$('#table_attr_table .table_tbody tr').length;
        $(this).parents('tr').addClass('active');
        layer.confirm('将执行删除操作?', {icon: 3, title:'提示',offset: '250px',end:function(){
            $('.uniquetable tr.active').removeClass('active');
        }}, function(index){
            layer.close(index);
            deleteUnit(id,num);
        });
    });
    //弹窗取消
    $('body').on('click','.formUnit:not(".disabled") .cancle',function(e){
        e.stopPropagation();
        layer.close(layerModal);
    });
    $('body').on('click','.button_add',function(){
        codeCorrect=!1;
        nameCorrect=!1;
        textCorrect=!1;
        Modal('add');
    });
    $('.uniquetable').on('click','.view',function(){
        $(this).parents('tr').addClass('active');
        viewUnit($(this).attr("data-id"),'view');
    });
    $('.uniquetable').on('click','.edit',function(){
        codeCorrect=!1;
        nameCorrect=!1;
        textCorrect=!1;
        $(this).parents('tr').addClass('active');
        viewUnit($(this).attr("data-id"),'edit');
    });
    //输入框的相关事件
    $('body').on('focus','.formUnit:not(".disabled") .el-input:not([readonly])',function(){
        $(this).parents('.el-form-item').find('.errorMessage').removeClass('active').html("");
    }).on('blur','.formUnit:not(".disabled") .el-input:not([readonly])',function(){
        var flag=$('#addUnit_from').attr("data-flag"),
            name=$(this).attr("id"),
            id=$('#itemId').val();
        validatorConfig[name]
        && validatorToolBox[validatorConfig[name]]
        && validatorToolBox[validatorConfig[name]](name)
        && remoteValidatorConfig[name]
        && remoteValidatorToolbox[remoteValidatorConfig[name]]
        && remoteValidatorToolbox[remoteValidatorConfig[name]](name,flag,id);
    });

    //添加和编辑的提交
    $('body').on('click','.formUnit:not(".disabled") .submit',function(e){
        e.stopPropagation();
        if(!$(this).hasClass('is-disabled')){
            var parentForm=$(this).parents('#addUnit_from'),
                id=parentForm.find('#itemId').val(),
                flag=parentForm.attr("data-flag");
            for (var type in validatorConfig) {validatorToolBox[validatorConfig[type]](type);}
            if(nameCorrect&&codeCorrect&&textCorrect){
                $(this).addClass('is-disabled');
                parentForm.addClass('disabled');
                var name=parentForm.find('#name').val().trim(),
                    unit_text=parentForm.find('#unit_text').val().trim(),
                    description=parentForm.find('#description').val().trim(),
                    label=parentForm.find('#label').val().trim(),
                    commercial=parentForm.find('#commercial').val().trim(),
                    technical=parentForm.find('#technical').val().trim(),
                    iso_code=parentForm.find('#iso_code').val().trim();
                $(this).hasClass('edit')?(
                    editUnit({
                        id: id,
                        name: name,
                        unit_text:unit_text,
                        description: description,
                        label: label,
                        commercial: commercial,
                        technical: technical,
                        iso_code: iso_code,
                        _token: TOKEN
                    })
                ):(
                    addUnit({
                        name: name,
                        unit_text:unit_text,
                        description: description,
                        label: label,
                        commercial: commercial,
                        technical: technical,
                        iso_code: iso_code,
                        _token: TOKEN
                    })
                )
            }
        }
    });
}
function editUnit(data) {
    AjaxClient.post({
        url: URLS['unit'].update,
        data: data,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            layer.close(layerModal);
            getUnits();
        },
        fail: function(rsp){
            layer.close(layerLoading);
            $('body').find('#addUnit_from').removeClass('disabled').find('.submit').removeClass('is-disabled');
            if(rsp&&rsp.field!==undefined){
                showInvalidMessage(rsp.field,rsp.message);
            }
            if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                LayerConfig('fail',rsp.message);
            }
        }
    },this);
}
function addUnit(data) {
    AjaxClient.post({
        url: URLS['unit'].store,
        data: data,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            layer.close(layerModal);
            getUnits();
        },
        fail: function(rsp){
            layer.close(layerLoading);
            if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                LayerConfig('fail',rsp.message);
            }
            $('body').find('#addUnit_from').removeClass('disabled').find('.submit').removeClass('is-disabled');
            if(rsp&&rsp.field!==undefined){
                showInvalidMessage(rsp.field,rsp.message);
            }
        }
    },this);
}

function viewUnit(id,flag) {
    AjaxClient.get({
        url: URLS['unit'].show+"?"+_token+"&id="+id,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            Modal(flag,rsp.results);
        },
        fail: function(rsp){
            layer.close(layerLoading);
            console.log('获取该单位失败');
            if(rsp.code==404){
                getUnits();
            }
        }
    },this);
}

function Modal(flag,data){
    var {id='',unit_text='',label='',name='',description='',iso_code='',commercial='',technical=''}={};
    if(data){
        ({id='',unit_text='',label='',name='',description='',iso_code='',commercial='',technical=''}=data);
    }
    var labelWidth=200,
        btnShow='btnShow',
        title='查看单位',
        textareaplaceholder='',
        readonly='',
        noEdit='',


        disable='';


    flag==='view'?(btnShow='btnHide',disable='disabled="disabled"',readonly='readonly="readonly"'):(textareaplaceholder='请输入描述，最多只能输入500字符',flag==='add'?title='添加单位':(title='编辑单位',textareaplaceholder='',noEdit='readonly="readonly"'));

    layerModal=layer.open({
        type: 1,
        title: title,
        offset: '100px',
        area: '500px',
        shade: 0.1,
        shadeClose: false,
        resize: false,
        move: false,
        content: `<form class="formModal formUnit" id="addUnit_from" data-flag="${flag}">
            <input type="hidden" id="itemId" value="${id}">
          
          <div class="el-form-item">
            <div class="el-form-item-div">
                <label class="el-form-item-label" style="width: ${labelWidth}px;">中文名<span class="mustItem">*</span></label>
                <input type="text" id="unit_text"  ${readonly} ${noEdit} data-name="中文名" class="el-input" placeholder="请输入中文名" value="${unit_text}">
            </div>
            <p class="errorMessage" style="padding-left: ${labelWidth}px;display: block;"></p>
          </div>
          <div class="el-form-item">
            <div class="el-form-item-div">
                <label class="el-form-item-label" style="width: ${labelWidth}px;">英文名<span class="mustItem">*</span></label>
                <input type="text" id="name" ${readonly} data-name="英文名" class="el-input" placeholder="请输入英文名" value="${name}">
            </div>
            <p class="errorMessage" style="padding-left: ${labelWidth}px;display: block;"></p>
          </div>
          <div class="el-form-item">
            <div class="el-form-item-div">
                <label class="el-form-item-label" style="width: ${labelWidth}px;">国际标准化组织码<span class="mustItem">*</span></label>
                <input type="text" id="iso_code" ${readonly} data-name="国际标准化组织码" class="el-input" placeholder="请输入国际标准化组织码" value="${iso_code}">
            </div>
            <p class="errorMessage" style="padding-left: ${labelWidth}px;display: block;"></p>
          </div>
          
          <div class="el-form-item">
            <div class="el-form-item-div">
                <label class="el-form-item-label" style="width: ${labelWidth}px;">标签</label>
                <input type="text" id="label" ${readonly} data-name="标签" class="el-input" placeholder="请输入标签" value="${label}">
            </div>
            <p class="errorMessage" style="padding-left: ${labelWidth}px;display: block;"></p>
          </div>
          
          
          
          <div class="el-form-item">
            <div class="el-form-item-div">
                <label class="el-form-item-label" style="width: ${labelWidth}px;">商业用码</label>
                <input type="text" id="commercial" ${readonly} data-name="商业用码" class="el-input" placeholder="请输入商业用码" value="${commercial}">
            </div>
            <p class="errorMessage" style="padding-left: ${labelWidth}px;display: block;"></p>
          </div>
          <div class="el-form-item">
            <div class="el-form-item-div">
                <label class="el-form-item-label" style="width: ${labelWidth}px;">工艺用码</label>
                <input type="text" id="technical" ${readonly} data-name="工艺用码" class="el-input" placeholder="请输入工艺用码" value="${technical}">
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
          
          
          
          <div class="el-form-item ${btnShow}">
            <div class="el-form-item-div btn-group">
                <button type="button" class="el-button cancle">取消</button>
                <button type="button" class="el-button el-button--primary submit ${flag}">确定</button>
            </div>
          </div>
        </form>` ,
        success: function(layero,index){
            getLayerSelectPosition($(layero));
            if(flag=='view'){
                $(layero).find('.el-radio-input').addClass('noedit');
            }
        },
        end: function(){
            $('.uniquetable tr.active').removeClass('active');
        }
    });
}
