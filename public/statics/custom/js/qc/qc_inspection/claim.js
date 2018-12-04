var layerModal,
    layerLoading,
    pageNo=1,
    pageSize=20,
    ajaxData={};
$(function(){
    resetParam();
    getClaims();
    bindEvent();


});

//重置搜索参数
function resetParam(){
    ajaxData={
        code: '',
        material_name: '',
        check_type: '',
        factory_name: '',
        order: 'desc',
        sort: 'id'
    };
};
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
            getClaims();
        }
    });
};
//获取索赔单列表
function getClaims(){
    var urlLeft='';
    for(var param in ajaxData){
        urlLeft+=`&${param}=${ajaxData[param]}`;
    }
    urlLeft+="&page_no="+pageNo+"&page_size="+pageSize;
    $('.table_tbody').html('');
    AjaxClient.get({
        url: URLS['check'].claimIndex+"?"+_token+urlLeft,
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
                noData('暂无数据',11);
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
            noData('获取物料列表失败，请刷新重试',11);
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
                <td>${tansferNull(item.code)}</td>
                <td>${tansferNull(item.ES_FORM_STATUS)}</td>
                <td>${tansferNull(item.CURRENCY_CODE)}</td>
                <td>${tansferNull(item.createdate)}</td>       
                <td class="right">
                    ${item.status==1?`<button data-id="${item.id}" class="button pop-button send">推送</button>`:''}
                    <button data-id="${item.id}" class="button pop-button view">查看</button>
                </td>
            </tr>
        `;
        ele.append(tr);
        ele.find('tr:last-child').data("trData",item);
    });
}

function bindEvent() {
    $('body').on('click','.view',function (e) {
        e.stopPropagation();
        var id = $(this).attr('data-id');
        getClaim(id);
    });
    $('body').on('click','.send',function (e) {
        e.stopPropagation();
        var id = $(this).attr('data-id');
        layer.confirm('将执行推送操作?', {icon: 3, title:'提示',offset: '250px',end:function(){
            $('.uniquetable tr.active').removeClass('active');
        }}, function(index){
            layer.close(index);
            sumbitCheck(id);
        });
    })
}
function sumbitCheck(id) {
    AjaxClient.get({
        url: URLS['check'].pushClaim+"?"+_token+"&id="+id,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            layer.confirm('推送成功！', {icon: 1, title:'提示',offset: '250px',end:function(){
                $('.uniquetable tr.active').removeClass('active');
            }}, function(index){
                layer.close(index);
                getClaims();
            });


        },
        fail: function(rsp){
            layer.close(layerLoading);
            layer.confirm(rsp.message?rsp.message:'推送失败！', {icon: 3, title:'提示',offset: '250px',end:function(){
                $('.uniquetable tr.active').removeClass('active');
            }}, function(index){
                layer.close(index);
                getClaims();
            });
        }
    },this);
}
function getClaim(id) {
    var dtd = $.Deferred();
    AjaxClient.get({
        url: URLS['check'].showQcClaim + "?" + _token + "&id=" + id,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            if (rsp && rsp.results) {
                console.log(rsp)
                getClaimModal(rsp.results[0].groups);
            } else {
                layer.msg('获取索赔单失败', {icon: 5,offset: '250px',time: 1500});
            }
            dtd.resolve(rsp);
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            layer.msg('获取索赔单失败', {icon: 5,offset: '250px',time: 1500});
            dtd.reject(rsp);
        }
    }, this);
    return dtd;
}
function getClaimModal(data)  {

    var {DEFECT_DESC='',DEFECT_SUM='',MATNR='',MATNR_qty='',RELATIVE_ITEM_CODE='',RELATIVE_ITEM_SUM=''}={};

    if(data.length>0){
        ({DEFECT_DESC='',DEFECT_SUM='',MATNR='',MATNR_qty='',RELATIVE_ITEM_CODE='',RELATIVE_ITEM_SUM=''}=data[0]);
    }



    var title = '索赔单';
    layerModal = layer.open({
        type: 1,
        title: title,
        offset: '70px',
        area: '500px',
        shade: 0.1,
        shadeClose: false,
        resize: false,
        move: '.layui-layer-title',
        moveOut: true,
        content: `<form class="attachmentForm formModal formAttachment" id="claim_form"> 
              <div class="el-form-item">
                <div class="el-form-item-div">
                    <label class="el-form-item-label" style="width: 150px;">物料号<span class="mustItem">*</span></label>
                    <input type="text" id="MATNR" data-name="物料号" class="el-input" readonly placeholder="请输入物料号" value="${MATNR}">
                </div>
                <p class="errorMessage" style="padding-left: 100px;display: block;"></p>
              </div>
              <div class="el-form-item">
                <div class="el-form-item-div">
                    <label class="el-form-item-label" style="width: 150px;">数量<span class="mustItem">*</span></label>
                    <input type="number" id="MATNR_qty" readonly min="0" onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')" data-name="数量" class="el-input" placeholder="请输入数量" value="${MATNR_qty}">
                </div>
                <p class="errorMessage" style="padding-left: 100px;display: block;"></p>
              </div>
              <div class="el-form-item">
                <div class="el-form-item-div">
                    <label class="el-form-item-label" style="width: 150px;">缺陷数量<span class="mustItem">*</span></label>
                    <input type="number" id="DEFECT_SUM" readonly min="0" onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')" data-name="缺陷数量" class="el-input" placeholder="请输入缺陷数量" value="${DEFECT_SUM}">
                </div>
                <p class="errorMessage" style="padding-left: 100px;display: block;"></p>
              </div>
              <div class="el-form-item">
                <div class="el-form-item-div">
                    <label class="el-form-item-label" style="width: 150px;">连带物料号<span class="mustItem">*</span></label>
                    <input type="text" id="RELATIVE_ITEM_CODE" readonly data-name="连带物料号" class="el-input" placeholder="请输入连带物料号" value="${RELATIVE_ITEM_CODE}">
                </div>
                <p class="errorMessage" style="padding-left: 100px;display: block;"></p>
              </div>
              <div class="el-form-item">
                <div class="el-form-item-div">
                    <label class="el-form-item-label" style="width: 150px;">连带物料数量<span class="mustItem">*</span></label>
                    <input type="number" id="RELATIVE_ITEM_SUM" min="0" readonly onkeyup="this.value=this.value.replace(/[^\\d.]/g,'')" data-name="数量" class="el-input" placeholder="请输入连带物料数量" value="${RELATIVE_ITEM_SUM}">
                </div>
                <p class="errorMessage" style="padding-left: 100px;display: block;"></p>
              </div>
            <div class="el-form-item">
                <div class="el-form-item-div">
                    <label class="el-form-item-label" style="width: 150px;">问题描述<span class="mustItem">*</span></label>
                    <textarea type="textarea" maxlength="500" readonly id="DEFECT_DESC" rows="5" class="el-textarea" placeholder="请输入描述，最多只能输入500字符">${DEFECT_DESC}</textarea>                 
                  </div>
                <p class="errorMessage" style="padding-left: 100px;display: block;"></p>
              </div>
            
        </form>`,
        success: function (layero, index) {
            layerEle = layero;

        },
        end: function () {

        }
    });
}
