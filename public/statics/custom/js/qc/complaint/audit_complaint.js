var layerModal,
    layerLoading,
    pageNo=1,
    pageSize=20,
    ajaxData={};


$(function(){
    resetParam();
    getComplaint();
    bindEvent();
});
//重置搜索参数
function resetParam(){
    ajaxData={
        complaint_code: '',
        customer_name: '',
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
            getComplaint();
        }
    });
};
//获取质检类别列表
function getComplaint(){
    var urlLeft='';
    for(var param in ajaxData){
        urlLeft+=`&${param}=${ajaxData[param]}`;
    }
    urlLeft+="&page_no="+pageNo+"&page_size="+pageSize;
    $('.table_tbody').html('');
    AjaxClient.get({
        url: URLS['complaint'].auditSelect+"?"+_token+urlLeft,
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

};
//生成列表数据
function createHtml(ele,data){
    data.forEach(function(item,index){
        var tr=`
            <tr class="tritem" data-id="${item.id}">
                <td>${item.complaint_code}</td>
                <td>${item.customer_name}</td>
                <td>${item.received_date}</td>
                <td>${item.samples_received_date}</td>
                <td>${item.status==1?'未审核':item.status==2?'审核中':item.status==3?"审核未通过":item.status==4?"审核通过":''}</td>
                <td>${item.create_time}</td> 
                <td class="right">
                    <button data-id="${item.id}" class="button pop-button audit">审核</button>
                </td>
                
            </tr>
        `;
        ele.append(tr);
        ele.find('tr:last-child').data("trData",item);
    });
};

function bindEvent() {

    $('body').on('click','.audit',function (e) {
        e.stopPropagation();
        Modal($(this).attr('data-id'))
    });
    $('body').on('click','.auditForm:not(".disabled") .submit',function (e) {
        e.stopPropagation();
        if(!$(this).hasClass('is-disabled')){
            var parentForm=$(this).parents('#audit_from'),
                id=parentForm.find('#id').val(),
                is_true=parentForm.find('#is_true').is(':checked'),
                description=parentForm.find('#description').val();
            auditComplaint({
                customer_complaint_id:id,
                judge_result:is_true,
                judge_message:description,
                _token:TOKEN

            });


        };
    })

    $('body').on('click','#searchForm .el-select',function(){
        if($(this).find('.el-input-icon').hasClass('is-reverse')){
            $('.el-item-show').find('.el-select-dropdown').hide();
            $('.el-item-show').find('.el-select .el-input-icon').removeClass('is-reverse');
        }else{
            $('.el-item-show').find('.el-select-dropdown').hide();
            $('.el-item-show').find('.el-select .el-input-icon').removeClass('is-reverse');
            $(this).find('.el-input-icon').addClass('is-reverse');
            $(this).siblings('.el-select-dropdown').show();
        }
    });
    $('body').on('click','.el-select-dropdown-item',function(e){
        e.stopPropagation();
        $(this).parent().find('.el-select-dropdown-item').removeClass('selected');
        $(this).addClass('selected');
        if($(this).hasClass('selected')){
            var ele=$(this).parents('.el-select-dropdown').siblings('.el-select');
            ele.find('.el-input').val($(this).text());
            ele.find('.val_id').val($(this).attr('data-id'));
        }
        $(this).parents('.el-select-dropdown').hide().siblings('.el-select').find('.el-input-icon').removeClass('is-reverse');
    });
    //更多搜索条件下拉
    $('#searchForm').on('click','.arrow:not(".noclick")',function(e){
        e.stopPropagation();
        $(this).find('.el-icon').toggleClass('is-reverse');
        var that=$(this);
        that.addClass('noclick');
        if($(this).find('.el-icon').hasClass('is-reverse')){
            $('#searchForm .el-item-show').css('background','#e2eff7');
            $('#searchForm .el-item-hide').slideDown(400,function(){
                that.removeClass('noclick');
            });
        }else{
            $('#searchForm .el-item-hide').slideUp(400,function(){
                $('#searchForm .el-item-show').css('background','transparent');
                that.removeClass('noclick');
            });
        }
    });
    //重置搜索框值
    $('body').on('click','#searchForm .reset:not(.is-disabled)',function(e){
        e.stopPropagation();
        $(this).addClass('is-disabled');
        $('#searchForm .el-item-hide').slideUp(400,function(){
            $('#searchForm .el-item-show').css('background','transparent');
        });
        $('.arrow .el-input-icon').removeClass('is-reverse');
        var parentForm=$(this).parents('#searchForm');
        parentForm.find('#customer_name').val('');
        parentForm.find('#complaint_code').val('');
        $('.el-select-dropdown-item').removeClass('selected');
        $('.el-select-dropdown').hide();
        pageNo=1;
        resetParam();
        getComplaint();
    });
    // 搜索
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
            pageNo=1;
            ajaxData={
                customer_name: parentForm.find('#customer_name').val().trim(),
                complaint_code: parentForm.find('#complaint_code').val().trim(),
            }
            getComplaint();
        }
    });

}

function auditComplaint(data) {
    console.log(data);
    AjaxClient.post({
        url: URLS['complaint'].audit,
        data: data,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            layer.close(layerModal);
            getComplaint();
        },
        fail: function(rsp){
            layer.close(layerLoading);
            layer.close(layerModal);

            if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                LayerConfig('fail',rsp.message);
            }
            if(rsp&&rsp.code==404){
                getComplaint();
            }

        }
    },this);
}


function Modal(id) {
    var labelWidth=100,
        btnShow='btnShow',
        title='审核',
        textareaplaceholder='审核信息';
    layerModal=layer.open({
        type: 1,
        title: title,
        offset: '100px',
        area: '500px',
        shade: 0.1,
        shadeClose: false,
        resize: false,
        move: false,
        content: `<form class="formModal auditForm" id="audit_from" >
            <input type="hidden" id="id" value="${id}">
         <div class="el-form-item">
            <div class="el-form-item-div">
                <label class="el-form-item-label" style="width: ${labelWidth}px;">是否合格</label>
                <ul class="tg-list">
                    <li class="tg-list-item">
                        <input class="tgl tgl-light"  id="is_true" type="checkbox"/>
                        <label class="tgl-btn" for="is_true"></label>
                    </li>
                </ul>
            </div>
            <p class="errorMessage" style="display: block;"></p>
          </div>
          <div class="el-form-item">
            <div class="el-form-item-div">
                <label class="el-form-item-label" style="width: ${labelWidth}px;">审核信息</label>
                <textarea type="textarea"  maxlength="500" id="description" rows="5" class="el-textarea" placeholder="${textareaplaceholder}"></textarea>
            </div>
            <p class="errorMessage" style="display: block;"></p>
          </div>
          <div class="el-form-item ">
            <div class="el-form-item-div btn-group">
                <button type="button" class="el-button cancle">取消</button>
                <button type="button" class="el-button el-button--primary submit ">确定</button>
            </div>
          </div>
        </form>` ,
        success: function(layero,index){
            getLayerSelectPosition($(layero));
        },
        end: function(){
            $('.uniquetable tr.active').removeClass('active');
        }
    });
}

$('body').on('input','.el-item-show input',function(event){
    event.target.value = event.target.value.replace( /[`~!@#$%^&*()_\-+=<>?:"{}|,.\/;'\\[\]·~！@#￥%……&*（）——\-+={}|《》？：“”【】、；‘’，。、]/im,"");
})