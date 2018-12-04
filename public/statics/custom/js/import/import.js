var pageNo=1,pageSize=20,ajaxData={},layerModal;
$(function () {
    setAjaxData();
    getExcelFiles();
    bindEvent();
});
function setAjaxData() {
    var ajaxDataStr = window.location.hash;
    if (ajaxDataStr !== undefined && ajaxDataStr !== '') {
        try{
            ajaxData=JSON.parse(decodeURIComponent(ajaxDataStr).substring(1));
            delete ajaxData.pageNo;
            pageNo=JSON.parse(decodeURIComponent(ajaxDataStr).substring(1)).pageNo;
        }catch (e) {
            resetParam();
        }
    }
}
//重置搜索参数
function resetParam(){
    ajaxData={
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
            getExcelFiles();
        }
    });
}
function getExcelFiles() {
    var urlLeft='';
    for(var param in ajaxData){
        urlLeft+=`&${param}=${ajaxData[param]}`;
    }
    urlLeft+="&page_no="+pageNo+"&page_size="+pageSize;
    $('.table_tbody').html('');
    AjaxClient.get({
        url: URLS['import'].pageIndex+"?"+_token+urlLeft,
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
                <td>${tansferNull(item.name)}</td>
                <td>${tansferNull(item.creator_name)}</td>
                <td>${tansferNull(item.ctime)}</td>
                <td class="right">
                    <!--<button data-id="${item.material_id}" class="button pop-button view">查看</button>-->
                    <a href="/Outsource/ImportExcelItem?id=${item.id}"><button  class="button pop-button view">查看</button></a>
                    <button data-id="${item.id}"  class="button pop-button delete">删除</button>
                </td>
            </tr>
        `;
        ele.append(tr);
        ele.find('tr:last-child').data("trData",item);
    });
}
function bindEvent() {
    $('body').on('click','.formModal:not(".disabled") .cancle',function(e){
        e.stopPropagation();
        layer.close(layerModal);
    });
    $("body").on("change","#files_excel",function (e) {
        var filePath=$(this).val();
        var name=$('#name').val();
        if(filePath.indexOf('xlsx')!=-1 || filePath.indexOf('xls')!=-1){
            $(".excelError").html("").hide();
            $('#addExcel_form .submit').removeClass('is-disabled');
            var arr=filePath.split('\\');
            var fileName=arr[arr.length-1];
            $('.filename').html(fileName).attr('title',fileName);
            if(name==''){
                $('#name').val(fileName.split('.')[0]);
            }
        }else{
            $('.filename').html('');

            $('.excelError').html('上传文件类型错误').show();
            $('.submit').addClass('is-disabled')
        }
    });

    $('body').on('click','.formModal:not(".disabled") .submit',function () {
        submitExcel();
    });

    $('body').on('click','#export_excel',function () {
        showExcelModal();
    });
    $('.uniquetable').on('click','.delete',function(){
        var id=$(this).attr("data-id");
        var num=$('#table_attr_table .table_tbody tr').length;
        $(this).parents('tr').addClass('active');
        layer.confirm('将执行删除操作?', {icon: 3, title:'提示',offset: '250px',end:function(){
            $('.uniquetable tr.active').removeClass('active');
        }}, function(index){
            layer.close(index);
            deleteExcel(id,num);
        });
    });
}

//删除物料
function deleteExcel(id,leftNum){
    AjaxClient.post({
        url: URLS['import'].delete,
        data: {
            file_id:id,
            _token:TOKEN
        },
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
            getExcelFiles();
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
                getExcelFiles();
            }
        }
    },this);
}
function submitExcel() {
    var name=$('#name').val();
    var formData = new FormData();
    formData.append("file", document.getElementById("files_excel").files[0]);
    if(name==''){
        formData.append('name',document.getElementById("files_excel").files[0].name.split('.')[0]);
    }else {
        formData.append('name',name);
    }
    formData.append('_token',TOKEN);
    //保留，前端取Excel文件
    // var reader = new FileReader();
    // var zzexcel;
    // reader.readAsBinaryString(document.getElementById("files_excel").files[0]);
    // reader.onload = function(e) {
    //
    //     var data = e.target.result;
    //     zzexcel = XLSX.read(data, {
    //         type: 'binary'
    //     });
    //
    //     for(var i=0;i<zzexcel.SheetNames.length;i++){
    //         console.log(XLSX.utils.sheet_to_json(zzexcel.Sheets[zzexcel.SheetNames[i]]));
    //     }
    // };
        $.ajax({
            url: URLS['import'].uploadFile,
            type: "POST",
            data: formData,
            contentType: false,
            processData: false,
            success: function (data) {
                layer.close(layerModal);
                if (data.code== "200") {
                    layer.confirm('上传成功！', {icon: 1, title:'提示',offset: '250px',end:function(){
                        $('.uniquetable tr.active').removeClass('active');
                    }}, function(index){
                        layer.close(index);
                        getExcelFiles();
                    });
                } else{
                    if(data.code == 411) {
                        LayerConfig('fail',data.message,function(){
                            window.location.reload();
                        });
                    }else{
                        LayerConfig('fail', data.message);
                    }
                }

            },
            error: function (data) {
                LayerConfig('fail', data.message);
            }
        });
}
function showExcelModal() {

    layerModal=layer.open({
        type: 1,
        title: '数据导入',
        offset: '100px',
        area: '500px',
        shade: 0.1,
        shadeClose: true,
        resize: false,
        move: false,
        content: `<form class="addExcelModal formModal formMateriel" id="addExcel_form">
                     <div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="width: 100px;">名称</label>
                            <input type="text" id="name" data-name="编码" class="el-input" placeholder="请输入名称" value="">
                        </div>
                        <p class="errorMessage" style="display: block;"></p>
                      </div>
                      <div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="width: 100px;">文件</label>
                            <div class="excelInput" style="width: 100%">
                                <a href="javascript:;" class="file">
                                    <input type="file" name="attachment" id="files_excel">选择Excel文件
                                </a>
                            <span class="filename"></span>
                        </div>
                        </div>
                        <p class="excelError"></p>
                      </div>
                    <div class="el-form-item btnShow">
                        <div class="el-form-item-div btn-group">
                            <button type="button" class="el-button cancle">取消</button>
                            <button type="button" class="el-button el-button--primary submit is-disabled">提交</button>
                        </div>
                    </div>  
                </form>`,
        complete:function () {

        }
    })

}