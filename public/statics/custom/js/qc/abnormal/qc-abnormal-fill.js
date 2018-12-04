var layerModal,
    layerLoading,
    pageNo=1,
    pageSize=20,
    ajaxData={};
$(function(){
    getAbnormal();
    bindEvent();
    resetParam();
});
//重置搜索参数
function resetParam(){
    ajaxData={
        order_id: '',
        material_id: '',
        order: 'desc',
        sort: 'id'
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
            getAbnormal();
        }
    });
};
//获取异常单列表
function getAbnormal(){
    var urlLeft='';
    for(var param in ajaxData){
        urlLeft+=`&${param}=${ajaxData[param]}`;
    }
    urlLeft+="&page_no="+pageNo+"&page_size="+pageSize;
    $('.table_tbody').html('');
    AjaxClient.get({
        url: URLS['abnormal'].select+"?"+_token+urlLeft,
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
//生成列表数据
function createHtml(ele,data){
    data.forEach(function(item,index){
        var tr=`
            <tr class="tritem" data-id="${item.id}">
                <td>${item.order_id}</td>
                <td>${item.material_id}</td>
                <td>${tansferNull(item.question_description)}</td>
                <td>${tansferNull(item.measures)}</td>
                <td>${item.ctime}</td> 
                <td class="right">
                <button data-id="${item.id}" class="button pop-button view">查看</button>
                <button data-id="${item.id}" class="button pop-button edit">编辑</button>
                <!--<button data-id="${item.id}" class="button pop-button delete">删除</button></td>-->
            </tr>
        `;
        ele.append(tr);
        ele.find('tr:last-child').data("trData",item);
    });
};
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
        getAbnormal();
    });
//搜索物料属性
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
                order_id: parentForm.find('#order_id').val().trim(),
                material_id: parentForm.find('#material_id').val().trim(),
                order: 'desc',
                sort: 'id'
            }
            getAbnormal();
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
        parentForm.find('#order_id').val('');
        parentForm.find('#material_id').val('');
        $('.el-select-dropdown-item').removeClass('selected');
        $('.el-select-dropdown').hide();
        pageNo=1;
        resetParam();
        getAbnormal();
    });

    $('.table_tbody').on('click','.view',function(){
        $(this).parents('tr').addClass('active');
        viewAbnormal($(this).attr("data-id"),'view');
    });
    // $('.table_tbody').on('click','.edit',function(){
    //     $(this).parents('tr').addClass('active');
    //     viewAbnormal($(this).attr("data-id"),'view');
    // });
    $('.table_tbody').on('click','.edit',function(){
        nameCorrect=!1;
        codeCorrect=!1;
        $(this).parents('tr').addClass('active');
        viewReportInfor($(this).attr('data-id'),'edit');

        // ($(this).attr("data-id"),'edit');
    });


    //弹窗下拉
    $('body').on('click','.formAbnormal:not(".disabled") .el-select',function(){
        $(this).find('.el-input-icon').toggleClass('is-reverse');
        $(this).siblings('.el-select-dropdown').toggle();

    });
    //下拉选择
    $('body').on('click','.formAbnormal:not(".disabled") .el-select-dropdown-item',function(e){
        e.stopPropagation();
        $(this).parents('.el-form-item').find('.errorMessage').html('');
        $(this).parent().find('.el-select-dropdown-item').removeClass('selected');
        $(this).addClass('selected');
        if($(this).hasClass('selected')){
            var ele=$(this).parents('.el-select-dropdown').siblings('.el-select');
            ele.find('.el-input').val($(this).text());
            ele.find('.val_id').val($(this).attr('data-id'));
            ele.find('.val_id').attr('data-code',$(this).attr('data-code'));
        }
        $(this).parents('.el-select-dropdown').hide().siblings('.el-select').find('.el-input-icon').removeClass('is-reverse');
    });
    $('body').on('click','.formReport:not(".disabled") .submit',function(e){
        e.stopPropagation();
        if(!$(this).hasClass('is-disabled')){
            var parentForm=$(this).parents('#addReport_from');
            $(this).addClass('is-disabled');
            parentForm.addClass('disabled');
            var reasonId=parentForm.find('#reason').attr('data-id'),
                reason=parentForm.find('#reason').val().trim(),
                methodId=parentForm.find('#method').attr('data-id'),
                method=parentForm.find('#method').val().trim();
            addReportBack({
                reasonId:reasonId,
                reason:reason,
                methodId:methodId,
                method:method,
                _token:TOKEN,
            });

        }
    });

};
function addReportBack(data) {
    AjaxClient.post({
        url: URLS['abnormal'].reportInfo,
        data: data,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            layer.close(layerModal);
            getAbnormal();
        },
        fail: function(rsp){
            layer.close(layerLoading);
            if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                LayerConfig('fail',rsp.message);
            }
            $('body').find('#addAbnormal_from').removeClass('disabled').find('.submit').removeClass('is-disabled');
            if(rsp&&rsp.field!==undefined){
                showInvalidMessage(rsp.field,rsp.message);
            }
        }
    },this);
}

function viewReportInfor(abnormalId,flag) {
    var dtd=$.Deferred();
    AjaxClient.get({
        url: URLS['abnormal'].viewReportInfo+"?"+_token+"&abnormality_id="+abnormalId,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            ReportModel(rsp.results,flag);
            dtd.resolve(rsp);
        },
        fail: function(rsp){
            layer.close(layerLoading);
        }
    },this);
    return dtd;
};
function ReportModel(report,flag) {
    var labelWidth=150,
        btnShow='btnShow',
        title='检验报告',
        reasonHtml='',
        reasonHtmlBack='',
        methodHtml='',
        methodHtmlBack='',
        textareaplaceholder='',
        readonly='',
        noEdit='readonly="readonly"';
    flag==='view'?(btnShow='btnHide',readonly='readonly="readonly'):(btnShow='btnShow',readonly='');
    report.forEach(function (item) {
        if(item.type==1){
            reasonHtml=`<textarea type="textarea" ${noEdit} maxlength="500" id="reason" rows="5"  data-id="${item.id}" class="el-textarea" placeholder="">${item.description}</textarea>`;
            reasonHtmlBack=`<textarea type="textarea" ${readonly} maxlength="500" id="reasoBback" rows="5" data-id="${item.id}" class="el-textarea" placeholder="">${item.send_back_reason}</textarea>`;
        };
        if(item.type==2){
            methodHtml=`<textarea type="textarea" ${noEdit} maxlength="500" id="method" rows="5" data-id="${item.id}" class="el-textarea" placeholder="">${item.description}</textarea>`;
            methodHtmlBack=`<textarea type="textarea" ${readonly} maxlength="500" id="methodBack" rows="5" data-id="${item.id}" class="el-textarea" placeholder="">${item.send_back_reason}</textarea>`;
        };
    })


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
            <div class="el-form-item">
            <div class="el-form-item-div">
                <label class="el-form-item-label" style="width: ${labelWidth}px;">原因</label>
                ${reasonHtml}
            </div>
            <p class="errorMessage" style="display: block;"></p>
            </div>
            <div class="el-form-item">
            <div class="el-form-item-div">
                <label class="el-form-item-label" style="width: ${labelWidth}px;">原因打回</label>
                ${reasonHtmlBack}
            </div>
            <p class="errorMessage" style="display: block;"></p>
            </div>
            <div class="el-form-item">
            <div class="el-form-item-div">
                <label class="el-form-item-label" style="width: ${labelWidth}px;">改善措施</label>
                ${methodHtml}
            </div>
            <p class="errorMessage" style="display: block;"></p>
            </div>
            <div class="el-form-item">
            <div class="el-form-item-div">
                <label class="el-form-item-label" style="width: ${labelWidth}px;">改善措施打回</label>
                ${methodHtmlBack}
            </div>
            <p class="errorMessage" style="display: block;"></p>
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
        },
        end: function(){
            $('.table_tbody tr.active').removeClass('active');
        }
    });
}



//查看异常
function viewAbnormal(id,flag){
    AjaxClient.get({
        url: URLS['abnormal'].view+"?"+_token+"&abnormal_id="+id,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            getCheckform(rsp.results[0].check_id,flag,rsp.results[0]);
        },
        fail: function(rsp){
            layer.close(layerLoading);
            console.log('获取该分类失败');
            if(rsp.code==404){
                getAbnormal();
            }
        }
    },this);
}
function getCheckform(id,flag,data){

    var dtd=$.Deferred();
    var urlLeft='';
    if(id!==0){
        urlLeft=`&id=${id}`;
    }
    AjaxClient.get({
        url: URLS['abnormal'].dropdown+"?"+_token+urlLeft,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            if(rsp.results&&rsp.results.length){
                Modal(rsp.results,flag,data);
                dtd.resolve(rsp);
            }else{
                LayerConfig('fail','暂无检验单！');
            }
        },
        fail: function(rsp){
            layer.close(layerLoading);
            noData('获取检验单列表失败，请刷新重试',3);
            dtd.reject(rsp);
        }
    },this);
    return dtd;

};
function Modal(abnormalLists,flag,data){
    var {id='',check_id='',order_id='',material_id='',partner='',number='',batch='',spot_number='',disqualification_number='',reject_ratio='',question_description='',measures=''}={};
    if(data){
        ({id='',check_id='',order_id='',material_id='',partner='',number='',batch='',spot_number='',disqualification_number='',reject_ratio='',question_description='',measures=''}=data);
    }

    var labelWidth=150,
        btnShow='btnShow',
        title='异常查看',


        textareaplaceholder='',
        readonly='',
        selecthtml=selectHtml(abnormalLists,flag),
        noEdit='';
    flag==='view'?(btnShow='btnHide',readonly='readonly="readonly"'):(textareaplaceholder='请输入描述，最多只能输入500字符',flag==='add'?title='异常申请':(title='异常编辑',textareaplaceholder='',noEdit='readonly="readonly"'));


    layerModal=layer.open({
        type: 1,
        title: title,
        offset: '100px',
        area: ['500px', '300px'],
        shade: 0.1,
        shadeClose: false,
        resize: false,
        move: false,
        content: `<form class="formModal formAbnormal" id="addAbnormal_from" data-flag="${flag}">
                    <input type="hidden" id="itemId" value="${id}">

          <div class="el-form-item">
            <div class="el-form-item-div" id="selectDrop">
            
                    <label class="el-form-item-label" style="width: ${labelWidth}px;">检验编号</label>
                    ${selecthtml}
            </div>
            <p class="errorMessage" style="padding-left: ${labelWidth}px;display: block;"></p>
          </div>
          <div class="el-form-item">
            <div class="el-form-item-div">
                <label class="el-form-item-label" style="width: ${labelWidth}px;">订单编号<span class="mustItem">*</span></label>
                <input type="text" id="order" ${readonly} ${noEdit} data-name="编码" class="el-input" placeholder="2-50位字母数字下划线中划线组成" value="${order_id}">
            </div>
            <p class="errorMessage" style="padding-left: ${labelWidth}px;display: block;"></p>
          </div>
          <div class="el-form-item">
            <div class="el-form-item-div">
                <label class="el-form-item-label" style="width: ${labelWidth}px;">物料编号<span class="mustItem">*</span></label>
                <input type="text" id="material" ${readonly} ${noEdit} data-name="名称" class="el-input" placeholder="请输入名称" value="${material_id}">
            </div>
            <p class="errorMessage" style="padding-left: ${labelWidth}px;display: block;"></p>
          </div>
           <div class="el-form-item">
            <div class="el-form-item-div">
                <label class="el-form-item-label" style="width: ${labelWidth}px;">供应商<span class="mustItem">*</span></label>
                <input type="text" id="partner" ${readonly} ${noEdit} data-name="名称" class="el-input" placeholder="请输入名称" value="${partner}">
            </div>
            <p class="errorMessage" style="padding-left: ${labelWidth}px;display: block;"></p>
          </div>
           <div class="el-form-item">
            <div class="el-form-item-div">
                <label class="el-form-item-label" style="width: ${labelWidth}px;">数量<span class="mustItem">*</span></label>
                <input type="text" id="number" ${readonly} data-name="名称" class="el-input" placeholder="请输入名称" value="${number}">
            </div>
            <p class="errorMessage" style="padding-left: ${labelWidth}px;display: block;"></p>
          </div>
           <div class="el-form-item">
            <div class="el-form-item-div">
                <label class="el-form-item-label" style="width: ${labelWidth}px;">抽检数量<span class="mustItem">*</span></label>
                <input type="text" id="spot_number" ${readonly} data-name="名称" class="el-input" placeholder="请输入名称" value="${spot_number}">
            </div>
            <p class="errorMessage" style="padding-left: ${labelWidth}px;display: block;"></p>
          </div>
          <div class="el-form-item">
            <div class="el-form-item-div">
                <label class="el-form-item-label" style="width: ${labelWidth}px;">不合格数量<span class="mustItem">*</span></label>
                <input type="text" id="disqualification_number" ${readonly} data-name="名称" class="el-input" placeholder="请输入名称" value="${disqualification_number}">
            </div>
            <p class="errorMessage" style="padding-left: ${labelWidth}px;display: block;"></p>
          </div>
           <div class="el-form-item">
            <div class="el-form-item-div">
                <label class="el-form-item-label" style="width: ${labelWidth}px;">不良率<span class="mustItem">*</span></label>
                <input type="text" id="reject_ratio" ${readonly} data-name="名称" class="el-input" placeholder="请输入名称" value="${reject_ratio}">
            </div>
            <p class="errorMessage" style="padding-left: ${labelWidth}px;display: block;"></p>
          </div>
          <div class="el-form-item">
            <div class="el-form-item-div">
                <label class="el-form-item-label" style="width: ${labelWidth}px;">批次<span class="mustItem">*</span></label>
                <input type="text" id="batch" ${readonly} data-name="名称" class="el-input" placeholder="请输入名称" value="${batch}">
            </div>
            <p class="errorMessage" style="padding-left: ${labelWidth}px;display: block;"></p>
          </div>
          <div class="el-form-item">
            <div class="el-form-item-div">
                <label class="el-form-item-label" style="width: ${labelWidth}px;">问题描述</label>
                <textarea type="textarea" ${readonly} maxlength="500" id="question_description" rows="5" class="el-textarea" placeholder="">${question_description}</textarea>
            </div>
            <p class="errorMessage" style="display: block;"></p>
          </div>
          <div class="el-form-item">
            <div class="el-form-item-div">
                <label class="el-form-item-label" style="width: ${labelWidth}px;">临时应急措施</label>
                <textarea type="textarea" ${readonly} maxlength="500" id="measures" rows="5" class="el-textarea" placeholder="">${measures}</textarea>
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
        },
        end: function(){
            $('.table_tbody tr.active').removeClass('active');
        }
    });
};

function selectHtml(abnormalLists,flag) {
    var elSelect,innerhtml,lis='';

    abnormalLists.forEach(function (item) {
        lis += `
    		<li data-id="${item.id}"  data-code="${item.code}"  class="el-select-dropdown-item ">${item.code}</li>
	        `;
    });

    if(flag==='view'||flag==='edit'){
        innerhtml=`<div class="el-select">
			<input type="text" readonly="readonly" id="selectVal" class="el-input readonly" value="${abnormalLists[0].code}">
			<input type="hidden" class="val_id" data-code="" id="check_id" value="${abnormalLists[0].id}">
		</div>`;
    }else {
        innerhtml = `<div class="el-select">
			<i class="el-input-icon el-icon el-icon-caret-top"></i>
			<input type="text" readonly="readonly" id="selectVal" class="el-input" value="--请选择--">
			<input type="hidden" class="val_id" data-code="" id="check_id" value="">
		</div>
		<div class="el-select-dropdown">
		    <div class="search-div">
                <input type="text" class="el-input el-input-search" id="searchVal" placeholder="搜索"/>
                <span class="search-icon search-span"><i class="fa fa-search"></i></span>
            </div>
			<ul class="el-select-dropdown-list">
				<li data-id="0" data-pid="0" data-code="" data-name="--请选择--" class=" el-select-dropdown-item">--请选择--</li>
				${lis}
			</ul>
		</div>`;
    }

    elSelect=`<div class="el-select-dropdown-wrap">
			${innerhtml}
		</div>`;
    return elSelect;
}