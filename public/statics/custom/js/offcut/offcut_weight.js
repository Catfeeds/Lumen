var layerModal,layerLoading,
    // codeCorrect=!1,
    ids=[],

    pageNo=1,
    pageSize=15,
    ajaxData={};


$(function () {
    resetParam()
    getOffcutWeightData();
    bindEvent()
});

//重置搜索参数
function resetParam(){
    ajaxData={
        code: '',
        order: 'desc',
        sort: 'id',
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
            getOffcutWeightData();
        }
    });
}

function getUnique(flag,field,value,id,fn){
    var urlLeft='';
    if(flag==='edit'){
        urlLeft=`&field=${field}&value=${value}&id=${id}`;
    }else{
        urlLeft=`&field=${field}&value=${value}`;
    }
    var xhr=AjaxClient.get({
        url: URLS['OffcutWeight'].unique+"?"+_token+urlLeft,
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
    $('.addOffcutWeight').find('#'+name).parents('.el-form-item').find('.errorMessage').html(val).addClass('active');
    $('.addOffcutWeight').find('.submit').removeClass('is-disabled');
}

function getOffcutWeightData(){
    $('.table_tbody').html('');
    var urlLeft='';
    for(var param in ajaxData){
        urlLeft+=`&${param}=${ajaxData[param]}`;
    }
    urlLeft+="&page_no="+pageNo+"&page_size="+pageSize;
    AjaxClient.get({
        url: URLS['OffcutWeight'].pageIndex+'?'+_token+urlLeft,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success:function (rsp) {
            layer.close(layerLoading);
            if(layerModal!=undefined){
                layer.close(layerModal);
            }
            var totalData=rsp.paging.total_records;
            if(rsp.results && rsp.results.length){
                createHtml($('.table_tbody'),rsp.results)
            }else{
                noData('暂无数据',9)
            }
            if(totalData>pageSize){
                bindPagenationClick(totalData,pageSize);
            }else{
                $('#pagenation').html('');
            }
        },
        fail: function(rsp){
            layer.close(layerLoading);
            noData('获取列表失败，请刷新重试',9);
        },
        complete: function(){
            $('#searchForm .submit').removeClass('is-disabled');
        }
    })
}

function OffcutWeightDelete(id) {
    AjaxClient.get({
        url: URLS['OffcutWeight'].delete+"?"+_token+"&id="+id,
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            layer.msg('删除成功', {icon: 1,offset: '250px',time: 1500});
            getOffcutWeightData();
        },
        fail: function(rsp){
            layer.close(layerLoading);
            layer.msg(rsp.message, {icon: 2,offset: '250px',time: 1500});
        }
    },this);
}
function OffcutWeightSend(id) {
    AjaxClient.get({
        url: URLS['OffcutWeight'].send+"?"+_token+"&ids="+id,
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            layer.msg('推送成功', {icon: 1,offset: '250px',time: 1500});
            getOffcutWeightData();
        },
        fail: function(rsp){
            layer.close(layerLoading);
            layer.msg(rsp.message, {icon: 2,offset: '250px',time: 1500});
        }
    },this);
}
function OffcutWeightView(id,flag) {
    AjaxClient.get({
        url: URLS['OffcutWeight'].show+'?'+_token+"&"+"id="+id,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            showOffcutWeightModal(flag,[],rsp.results);
        },
        fail: function(rsp){
            layer.close(layerLoading);
            layer.msg('获取信息失败，请重试', {icon: 5,offset: '250px',time: 1500});
        }
    },this);
}

function editOffcutWeight(data) {
    AjaxClient.post({
        url: URLS['OffcutWeight'].update,
        data: data,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = layer.load(2, {shade: false,offset: '300px'});
        },
        success: function(rsp){
            layer.close(layerLoading);
            layer.close(layerModal);
            getOffcutWeightData();
        },
        fail: function(rsp){
            layer.close(layerLoading);
            layer.msg('编辑失败,请重试', {icon: 2,offset: '250px',time: 1500});
            $('body').find('#addPractice_form').find('.submit').removeClass('is-disabled');
            if(rsp.field!==undefined){
                showInvalidMessage(rsp.field,rsp.message);
            }
        },
    },this)
}
function createHtml(ele,data) {
    data.forEach(function (item,index) {
        var tr = ` <tr>
                    <td class="left norwap">
                         <span class="el-checkbox_input el-checkbox_input_check" id="${item.id}">
                            <span class="el-checkbox-outset"></span>
                        </span>
                    </td>
                    <td>${item.code}</td>
                    <td>${item.MENGE}</td>
                    <td>${item.MEINS}</td>
                    <td>${item.MATNR}</td>
                    <td>${item.ZDATE}</td>
                    <td>${item.status==1?'未推送':item.status==2?'已推送':''}</td>
                    <td class="right nowrap">
                        ${item.status==1?`<button class="button pop-button send" data-id="${item.id}">推送</button>`:''}
                        <button class="button pop-button edit" data-id="${item.id}">编辑</button>
                        <button class="button pop-button delete" data-id="${item.id}">删除</button>
                    </td>
                </tr>`;
        ele.append(tr);
    })
}

function bindEvent(){
    $(document).click(function (e) {
        var obj = $(e.target);
        if (!obj.hasClass('el-select-dropdown-wrap') && obj.parents(".el-select-dropdown-wrap").length === 0) {
            // $('.el-select-dropdown').slideUp();
            $('.el-select-dropdown').slideUp().siblings('.el-select').find('.el-input-icon').removeClass('is-reverse');
        }
        if(!obj.hasClass('.searchModal')&&obj.parents(".searchModal").length === 0){
            $('#searchForm .el-item-hide').slideUp(400,function(){
                $('#searchForm .el-item-show').css('background','transparent');
            });
            $('.arrow .el-input-icon').removeClass('is-reverse');
        }
    });

    $('body').on('click','.el-select-dropdown-wrap',function(e){
        e.stopPropagation();
    });

//排序
    $('.sort-caret').on('click',function(e){
        e.stopPropagation();
        $('.el-sort').removeClass('ascending descending');
        if($(this).hasClass('ascending')){
            $(this).parents('.el-sort').addClass('ascending')
        }else{
            $(this).parents('.el-sort').addClass('descending')
        }
        $(this).attr('data-key');
        ajaxData.order=$(this).attr('data-sort');
        ajaxData.sort=$(this).attr('data-key');
        getOffcutWeightData();
    });

//搜索
    $('body').on('click','#searchForm .submit:not(".is-disabled")',function(e){
        e.stopPropagation();
        $('#searchForm .el-item-hide').slideUp(400,function(){
            $('#searchForm .el-item-show').css('background','transparent');
        });
        $('.arrow .el-input-icon').removeClass('is-reverse');
        if(!$(this).hasClass('is-disabled')){
            $(this).addClass('is-disabled');
            var parentForm=$(this).parents('#searchForm');
            $('.el-sort').removeClass('ascending descending');
            // pageNo=1;
            ajaxData={
                name: encodeURIComponent(parentForm.find('#name').val().trim()),
                order: 'desc',
                sort: 'id',
            }
            getOffcutWeightData();
        }
    });

//重置搜索框值
    $('body').on('click','#searchForm .reset',function(e){
        e.stopPropagation();
        var parentForm=$(this).parents('#searchForm');
        parentForm.find('#name').val('');
        $('.el-select-dropdown-item').removeClass('selected');
        $('.el-select-dropdown').hide();
        // pageNo=1;
        resetParam();
        getOffcutWeightData();
    });



//点击弹框内部关闭dropdown
    $(document).click(function (e) {
        var obj = $(e.target);
        if (!obj.hasClass('el-select-dropdown-wrap') && obj.parents(".el-select-dropdown-wrap").length === 0) {
            $('.el-select-dropdown').slideUp();
        }
    });

//关闭弹窗
    $('body').on('click','.addOffcutWeight .cancle',function(e){
        e.stopPropagation();
        layer.close(layerModal);
    });


    $('body').on('click','.addOffcutWeight .submit',function () {
        if(!$(this).hasClass('is-disabled')){
            var parentForm = $(this).parents('#addOffcutWeight_form'), id=$('#itemId').val();

            var remark = parentForm.find('#remark').val(),
            number = parentForm.find('#number').val();
            editOffcutWeight({
                id: id,
                MENGE:number,
                _token: TOKEN

            });

        }
    })

//点击删除
    $('.uniquetable').on('click','.button.pop-button.delete',function(){
        var id=$(this).attr("data-id");
        $(this).parents('tr').addClass('active');
        layer.confirm('将执行删除操作?', {icon: 3, title:'提示',offset: '250px',end:function(){
            $('.uniquetable tr.active').removeClass('active');
        }}, function(index){
            layer.close(index);
            OffcutWeightDelete(id);
        });
    });
//点击推送
    $('.uniquetable').on('click','.button.pop-button.send',function(){
        var id=$(this).attr("data-id");
        $(this).parents('tr').addClass('active');
        layer.confirm('将执行推送操作?', {icon: 3, title:'提示',offset: '250px',end:function(){
            $('.uniquetable tr.active').removeClass('active');
        }}, function(index){
            layer.close(index);
            OffcutWeightSend([id]);
        });
    });

//点击编辑
    $('.uniquetable').on('click','.button.pop-button.edit',function(){
        nameCorrect=!1;
        $(this).parents('tr').addClass('active');
        OffcutWeightView($(this).attr("data-id"),'edit');
    });


    //复选按钮
    $('body').on('click','.el-checkbox_input_check',function(){
        $(this).toggleClass('is-checked');
        var id=$(this).attr("id");
        if($(this).hasClass('is-checked')){
            if(ids.indexOf(id)==-1){
                ids.push(id);
            }
        }else{
            var index=ids.indexOf(id);
            ids.splice(index,1);
        }
    });
    //全选按钮
    $('body').on('click','#choose_all',function(){
        $(this).toggleClass('is-checked');
        ids=[];
        if($(this).hasClass('is-checked')){
            $('.table_tbody tr td .el-checkbox_input_check').addClass('is-checked');
            $('.table_tbody tr td .el-checkbox_input_check').each(function (k,v) {
                ids.push($(v).attr("id"));
            })

        }else{
            $('.table_tbody tr td .el-checkbox_input_check').removeClass('is-checked');
        }

    });
    //批量推送
    $('body').on('click','#sendAll',function(){
        layer.confirm('将执行批量推送操作?', {icon: 3, title:'提示',offset: '250px',end:function(){
            $('.uniquetable tr.active').removeClass('active');
        }}, function(index){
            layer.close(index);
            OffcutWeightSend(ids);
        });
    });


}



function showOffcutWeightModal(flag,dedata,data) {
    // OffcutWeight_code，OffcutWeight_name，attr_code，attr_name
    var {id='',device_id='',device_name='',ATTR_CODE='',MATNR='',remark='',attr_name='',MENGE=''}={};
    if(data){
        ({id='',device_id='',device_name='',ATTR_CODE='',MATNR='',remark='',attr_name='',MENGE=''}=data)
    }
    var common_true =  '',common_false =  '';


    var labelWidth=120,title='查看称重',btnShow='btnShow',readonly='',noEdit='';

    flag==='view'?(btnShow='btnHide',readonly='readonly="readonly"'):(flag==='edit'?(title='编辑称重',noEdit='readonly="readonly"'):title='添加称重');
    layerModal = layer.open({
        type: 1,
        title: title ,
        offset: '100px',
        area: '500px',
        shade: 0.1,
        shadeClose: true,
        resize: false,
        move: false,
        content:`<form class="addOffcutWeight formModal formMateriel" id="addOffcutWeight_form" data-flag="${flag}">
                <input type="hidden" id="itemId" value="${id}">
               
                
                <div class="el-form-item">
                    <div class="el-form-item-div">
                        <label class="el-form-item-label" style="width: ${labelWidth}px;">数量<span class="mustItem">*</span></label>
                            <input type="number" id="number" ${readonly} class="el-input" placeholder="请输入数量" value="${MENGE}">
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
        success: function(layero,index){
            // device_id='',device_name='',ATTR_CODE='',MATNR=''


            getLayerSelectPosition($(layero));

        },
        end: function(){
            $('.uniquetable tr.active').removeClass('active');
        }
    })
}
$('body').on('input','.el-item-show #code',function(event){
    event.target.value = event.target.value.replace( /[`~!@#$%^&*()\+=<>?:"{}|,.\/;'\\[\]·~！@#￥%……&*（）\+={}|《》？：“”【】、；‘’，。、]/im,"");
})