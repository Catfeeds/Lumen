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
                <button data-id="${item.id}" class="button pop-button apply">审核</button>
                
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

    $('.table_tbody').on('click','.apply',function(){
        $(this).parents('tr').addClass('active');
        Modal($(this).attr("data-id"));
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

//检验单下拉筛选
    $('body').on('click','.search-span',function () {
        var code = $('#searchVal').val();
        var ele=$(this).siblings('.el-input');
        getSearchCode(ele,code);
    });

    $('body').on('click','.formReport:not(".disabled") .submit',function (e) {
        e.stopPropagation();
        if(!$(this).hasClass('is-disabled')){
            var parentForm=$(this).parents('#addReport_from'),
            item_id=parentForm.find('#item_id').attr('data-id'),
            check=parentForm.find('[name="apply"]:checked').val()?parentForm.find('[name="apply"]:checked').val():0;
            audit({
                id:item_id,
                audit:check,
                _token:TOKEN
            });

        };
    })

};
function audit(data) {
    AjaxClient.post({
        url: URLS['abnormal'].audit,
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
            layer.close(layerModal);

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
function Modal(id) {
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
            <input type="hidden" id="item_id" data-id="${id}">
            <div class="el-form-item">
                <div class="el-form-item-div">
                    <label class="el-form-item-label" style="width: ${labelWidth}px;">是否合格</label>
                    <div style="width: 100%">
                        <input type="radio" name="apply" id="apply_true" value="1">
                        <label for="apply_true">合格</label> 
                        <input type="radio" name="apply" id="apply_false" value="2">
                        <label for="apply_false">不合格</label> 
                    </div>
                
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
// <div class="el-form-item">
//                 <div class="el-form-item-div">
//                     <label class="el-form-item-label" style="width: ${labelWidth}px;">原因</label>
//                     <textarea type="textarea" maxlength="500" id="method" rows="5"  class="el-textarea" placeholder=""></textarea>
//                 </div>
//                 <p class="errorMessage" style="display: block;"></p>
//             </div>


function getSearchCode(ele,code) {

    AjaxClient.get({
        url:URLS['abnormal'].dropdown+"?"+_token+"&code="+code,
        dataType:'json',
        beforeSend:function () {
            layerLoading =  LayerConfig('load');
        },
        success:function (rsp) {
            layer.close(layerLoading);
            if(rsp.results&&rsp.results.length){
                var lis = `<li data-id="" class="el-select-dropdown-item kong" class=" el-select-dropdown-item">--请选择--</li>`;

                rsp.results.forEach(function (item) {
                    lis += `
    		<li data-id="${item.id}"  data-code="${item.code}"  class="el-select-dropdown-item ">${item.code}</li>
	        `;
                });
                ele.parent().siblings('.el-select-dropdown-list').html(lis);
            }else{
                ele.parent().siblings('.el-select-dropdown-list').html(`<li data-id="" class="el-select-dropdown-item kong" class=" el-select-dropdown-item">--请选择--</li>`);
            }
        },
        fail:function (rsp) {
            layer.close(layerLoading) ;
            layer.msg('获取模板列表失败', {icon: 5,offset: '250px',time: 1500});

        }
    },this);
}



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