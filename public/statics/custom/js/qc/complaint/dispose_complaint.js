var layerModal,
    layerLoading,
    pageNo=1,
    pageSize=20,
    ajaxData={},
    laydate;


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
        status: '',
        finish_status: ''
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
        urlLeft+=`&${param}=${encodeURIComponent(ajaxData[param])}`;
    }
    urlLeft+="&page_no="+pageNo+"&page_size="+pageSize;
    $('.table_tbody').html('');
    AjaxClient.get({
        url: URLS['complaint'].select+"?"+_token+urlLeft,
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
                <td>${item.finish_status==1?'归档':item.finish_status==2?'终止':item.status==1?'未审核':item.status==2?'审核中':item.status==3?"审核不通过":item.status==4?"审核通过":''}</td>
                <td>${item.create_time}</td> 
                <td class="right">
                ${item.finish_status!=0?'':`${item.status == 4 ?`<button data-id="${item.id}" class="button pop-button pigeonhole">客诉归档</button>`:item.status!=2?`<a href="disposeComplaintSend?id=${item.id}"><button data-id="${item.id}" class="button pop-button send">发送相关部门</button></a>
                    <button data-id="${item.id}" class="button pop-button missingItem">关联缺失项</button>
                    <button data-id="${item.id}" class="button pop-button audit">提交审核</button>`:''}
                    <button data-id="${item.id}" class="button pop-button terminate">客诉终止</button> `}
                                  
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
        Modal($(this).attr('data-id'));
    });
    $('body').on('click','.pigeonhole',function (e) {
        e.stopPropagation();
        var id = $(this).attr('data-id');
        layer.confirm('将执行归档操作?', {icon: 3, title:'提示',offset: '250px',end:function(){
            $('.uniquetable tr.active').removeClass('active');
        }}, function(index){
            layer.close(index);
            pigeonholeComplaint(id);
        });

    });
    $('body').on('click','.terminate',function (e) {
        e.stopPropagation();
        var id = $(this).attr('data-id');
        layer.confirm('将执行终止操作?', {icon: 3, title:'提示',offset: '250px',end:function(){
            $('.uniquetable tr.active').removeClass('active');
        }}, function(index){
            layer.close(index);
            terminateComplaint(id);
        });

    });


    $('body').on('click','.formReport:not(".disabled") .submit',function (e) {
        e.stopPropagation();
        if(!$(this).hasClass('is-disabled')){
            var parentForm=$(this).parents('#addReport_from'),
                itemId=parentForm.find('#itemId').val(),
                targetResponseDate=parentForm.find('#targetResponseDate').val(),
                actualResponseDate=parentForm.find('#actualResponseDate').val();
            var $itemJP=$('#judge_person_id');
            var judge_person_id=$itemJP.data('inputItem')==undefined||$itemJP.data('inputItem')==''?'':
                $itemJP.data('inputItem').name==$itemJP.val().trim()?$itemJP.data('inputItem').id:'';
            submit({
                customer_complaint_id:itemId,
                judge_person_id:judge_person_id,
                target_respond_date:targetResponseDate,
                actual_respond_date:actualResponseDate,
                _token:TOKEN

            });


        };
    });
    //弹窗取消
    $('body').on('click','.cancle',function(e){
        e.stopPropagation();
        layer.close(layerModal);
    });
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
        parentForm.find('#status').val('').siblings('.el-input').val('--请选择--');
        parentForm.find('#over_status').val('').siblings('.el-input').val('--请选择--');
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
                status: parentForm.find('#status').val().trim(),
                finish_status: parentForm.find('#over_status').val().trim()
            }
            getComplaint();
        }
    });


}

function terminateComplaint(id) {
    AjaxClient.get({
        url: URLS['complaint'].terminate+"?"+_token+"&customer_complaint_id="+id,
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
}function pigeonholeComplaint(id) {
    AjaxClient.get({
        url: URLS['complaint'].pigeonhole+"?"+_token+"&customer_complaint_id="+id,
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
function submit(data) {
    AjaxClient.post({
        url: URLS['complaint'].submit,
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
    var labelWidth=150,
        btnShow='btnShow',
        title='提交审核',
        readonly='';



    layerModal=layer.open({
        type: 1,
        title: title,
        offset: '100px',
        area: '500px',
        shade: 0.1,
        shadeClose: false,
        resize: false,
        move: false,
        content: `<form class="formModal formReport" id="addReport_from" data-flag="">
<input type="hidden" id="itemId" value="${id}">
            <div class="el-form-item">
                <div class="el-form-item-div">
                    <label class="el-form-item-label" style="width: ${labelWidth}px;">应回复时间</label>
                    <input type="text" id="targetResponseDate" ${readonly}  data-name="应回复时间" class="el-input" placeholder="应回复时间" value="">
                </div>
                <p class="errorMessage" style="display: block;"></p>
            </div>
            <div class="el-form-item">
                <div class="el-form-item-div">
                    <label class="el-form-item-label" style="width: ${labelWidth}px;">实回复时间</label>
                    <input type="text" id="actualResponseDate" ${readonly}  data-name="实回复时间" class="el-input" placeholder="实回复时间" value="">
                </div>
                <p class="errorMessage" style="display: block;"></p>
            </div>
           
            <div class="el-form-item">
                <div class="el-form-item-div">
                    <label class="el-form-item-label" style="width: ${labelWidth}px;">审核人</label>
                    <div class="el-select-dropdown-wrap">
                        <input type="text" id="judge_person_id" class="el-input" autocomplete="off" placeholder="审核人" value="">
                    </div>
                </div>
            </div>
            
          
            <div class="el-form-item ${btnShow}">
            <div class="el-form-item-div btn-group">
                <button type="button" class="el-button cancle">取消</button>
                <button type="button" class="el-button el-button--primary submit report">确定</button>
            </div>
          </div>
        </form>` ,
        success: function(layero,index){
            getLayerSelectPosition($(layero));
            laydate.render({
                elem: '#targetResponseDate'
                ,done: function(value, date, endDate){

                }
            });
            laydate.render({
                elem: '#actualResponseDate'
                ,done: function(value, date, endDate){

                }
            });
            $('#judge_person_id').autocomplete({
                url: URLS['complaint'].judge_person+"?"+_token+"&page_no=1&page_size=10"
            });
            $('#judge_person_id').each(function(item){
                var width=$(this).parent().width();
                $(this).siblings('.el-select-dropdown').width(width);

            });


        },
        end: function(){
            $('.table_tbody tr.active').removeClass('active');
        }
    });
}

$('body').on('input','.el-item-show input',function(event){
    event.target.value = event.target.value.replace( /[`~!@#$%^&*()_\-+=<>?:"{}|,.\/;'\\[\]·~！@#￥%……&*（）——\-+={}|《》？：“”【】、；‘’，。、]/im,"");
})