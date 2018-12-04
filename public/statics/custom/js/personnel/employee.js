
var pageNo = 1,
    pageSize = 20,
    layerLoading,
    layerModal,
    ajaxData = {
        order: 'desc',
        sort: 'id'
    },
    creator_token = '',
    excelData = {};

var statusData=[{name:'在职',flag:'job',id:1},{name:'离职',flag:'quit',id:2},
    {name:'试用',flag:'probation',id:3},{name:'等待入职',flag:'waiting',id:4}];

$(function () {
    creator_token = '88t8r9m70r2ea5oqomfkutc753';
    // creator_token=getCookie("session_emi2c_mlily_demo");
    resetParam();
    setAjaxData();
    getEmployeeList();

    // getRoleSource();

    getStatusSource();

    getPositionSource();

    // getDeptSource();

    bindEvent();
    //下载
    var httplink = window.location.protocol;
    var urllink = window.location.host;
    var downlink = URLS['employee'].download+'?'+_token;
    var link=httplink+'//'+urllink+downlink;
    $('#download_excel').attr('href',link);
});
function setAjaxData() {
    var ajaxDataStr = window.location.hash;
    if (ajaxDataStr !== undefined && ajaxDataStr !== '') {
        try{
            ajaxData = JSON.parse(decodeURIComponent(ajaxDataStr).substring(1));
        }catch (e) {
            ajaxData = {};
        }
    }
}
function resetParam() {
    ajaxData = {
        name:'',
        card_number:'',
        department_id:'',
        position_id:'',
        role_id:'',
        gender:'',
        phone:'',
        email:'',
        status:'',
        admin_name: '',
        order: 'asc',
        sort: 'id'
    }
}

function getEmployeeList() {

    $('#table_employee_table .table_tbody').html("");
    var urlLeft='';

    for(var param in ajaxData){
        urlLeft+=`&${param}=${ajaxData[param]}`;
    }

    urlLeft += "&page_no="+pageNo+"&page_size="+pageSize;

    AjaxClient.get({
        url: URLS['employee'].employeeList+'?'+_token+urlLeft,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success:function (rsp) {
            layer.close(layerLoading);
            var totalData=rsp.paging.total_records;

            if(rsp.results && rsp.results.length){
                createTableHtml($('#table_employee_table .table_tbody'),rsp.results)
            }else{
                noData('暂无数据',13);
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
            noData('获取员工列表失败，请刷新重试',13);

        },
        complete: function(){
            $('#searchEmploAttr_from .submit,#searchEmploAttr_from .reset').removeClass('is-disabled');
        }
    },this)
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
            getEmployeeList();
        }
    });
}

function createTableHtml(ele,data) {

    var viewurl=$('#employee_view').val(),
        editurl=$('#employee_edit').val();

    data.forEach(function (item,index) {


        var status = '';

        for(var i=0;i<statusData.length;i++){

            if(item.status == statusData[i].id){
                status = statusData[i].name
            }
        }

        var tr = `<tr>
                        <td>${item.card_number}</td>
                        <td>${item.name}</td>
                        <td>${item.sex ==1 ? '男': '女'}</td>
                        <!--<td>${tansferNull(item.role_name)}</td>-->
                        <td>${tansferNull(item.admin_name)}</td>
                        <td>${status}</td>
                        <td>${tansferNull(item.department_name)}</td>
                        <td>${tansferNull(item.position_name)}</td>
                        <td>${item.phone}</td>
                        <td>${item.email}</td> 
                        <td class="right">
                            <a class="link_button" style="border: none;padding: 0;" href="${viewurl}?id=${item.id}"><button data-id="${item.id}" class="button pop-button view">查看</button></a>
                            <a class="link_button" style="border: none;padding: 0;" href="${editurl}?id=${item.id}"><button data-id="${item.id}" class="button pop-button edit">编辑</button></a>
                            <button type="button" data-id="${item.id}" class="button pop-button delete">删除</button>
                        </td>
                  </tr>`;

        ele.append(tr);
    })
}

function getRoleSource() {
    AjaxClient.get({
        url: URLS['employee'].getRole+'?'+_token,
        async: false,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success:function (rsp) {
            layer.close(layerLoading);
            var data = rsp.results;

            var role = $('#searchEmploAttr_from #role ul');

            if(data&&data.length){

                data.forEach(function (item,index) {

                    var li = `<li data-id="${item.id}" data-name="${item.name}" class=" el-select-dropdown-item">${item.name}</li>`;

                    role.append(li);

                })

            }

        },
        fail:function (rsp) {
            layer.close(layerLoading);
            if(layerModal!=undefined){
                layer.close(layerModal);
            }
            noData('获取上级部门失败，请刷新重试',4);

        }
    },this)

}

function getStatusSource() {

    var status = $('#searchEmploAttr_from #status ul');
    statusData.forEach(function (item,index) {
        var li = `<li data-id="${item.id}" data-name="${item.name}" class=" el-select-dropdown-item">${item.name}</li>`;

        status.append(li);
    })
}

function getPositionSource() {
    AjaxClient.get({
        url: URLS['employee'].getPosition+'?'+_token,
        async: false,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success:function (rsp) {
            layer.close(layerLoading);

            var data = rsp.results;

            var position = $('#searchEmploAttr_from #position ul');

            if(data&&data.length){

                data.forEach(function (item,index) {

                    var li = `<li data-id="${item.id}" data-name="${item.name}" class=" el-select-dropdown-item">${item.name}</li>`;

                    position.append(li);

                })
            }
        },
        fail:function (rsp) {
            layer.close(layerLoading);
            if(layerModal!=undefined){
                layer.close(layerModal);
            }
            noData('获取职位失败，请刷新重试',4);

        }
    },this)

}

function getDeptSource() {
    AjaxClient.get({
        url: URLS['employee'].getDept+'?'+_token,
        async: false,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success:function (rsp) {
            layer.close(layerLoading);
            var data = rsp.results;

            var dept = $('#searchEmploAttr_from #dept ul');

            if(data&&data.length){

                data.forEach(function (item,index) {

                    var li = `<li data-id="${item.id}" data-name="${item.name}" class=" el-select-dropdown-item">${item.name}</li>`;

                    dept.append(li);

                })
            }
        },
        fail:function (rsp) {
            layer.close(layerLoading);
            if(layerModal!=undefined){
                layer.close(layerModal);
            }
            noData('获取部门失败，请刷新重试',4);

        }
    },this)

}

function bindEvent() {

    $('body').on('click','.formModal:not(".disabled") .cancle',function(e){
        e.stopPropagation();
        layer.close(layerModal);
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

    //单选按钮点击事件
    $('body').on('click','.el-radio-input',function(e){

        $(this).toggleClass('is-radio-checked');

        if($(this).hasClass('is-radio-checked')){

            $(this).parents('.el-radio').siblings().find('.el-radio-input').removeClass('is-radio-checked');
        }
    });

    //下拉框点击事件
    $('body').on('click','.el-select',function(){
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

    //下拉框item点击事件
    $('body').on('click','.el-select-dropdown-item:not(.el-auto)',function(e){
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

    $('body').on('click','#searchEmploAttr_from:not(".is-disabled") .submit',function (e) {
        e.stopPropagation();

        $('#searchForm .el-item-hide').slideUp(400,function(){
            $('#searchForm .el-item-show').css('background','transparent');
        });
        $('.arrow .el-input-icon').removeClass('is-reverse');

        if(!$(this).hasClass('is-disabled')){
            $(this).addClass('is-disabled');
            var parentForm = $(this).parents('#searchEmploAttr_from');
            var name =encodeURIComponent(parentForm.find('#name').val().trim()),
                card_number = parentForm.find('#cardNumber').val().trim(),
                // department_id = parentForm.find('#department').val(),
                position_id = parentForm.find('#job').val(),
                // role_id = parentForm.find('#adminRole').val(),
                gender = parentForm.find('.is-radio-checked .status').val(),
                status = parentForm.find('#currentState').val(),
                phone = parentForm.find('#phone').val().trim(),
                email = parentForm.find('#email').val().trim(),
                admin_name =encodeURIComponent(parentForm.find('#admin_name').val().trim());

            ajaxData = {
                name:name,
                card_number:card_number,
                // department_id:department_id,
                position_id:position_id,
                // role_id:role_id,
                status:status,
                gender:gender,
                phone:phone,
                email:email,
                admin_name:admin_name,
                order: 'asc',
                sort: 'id'
            };
            window.location.href = '#' + encodeURIComponent(JSON.stringify(ajaxData));
            if(gender == undefined){
                 delete ajaxData.gender
            }

            getEmployeeList();
        }
    })

    $('body').on('click','#searchEmploAttr_from .reset:not(.is-disabled)',function (e) {
        e.stopPropagation();
        $(this).addClass('is-disabled');
        $('#searchForm .el-item-hide').slideUp(400);
        setTimeout(function(){
            $('#searchForm .el-item-show').css('background','transparent');
        },400);
        $('.arrow .el-input-icon').removeClass('is-reverse');

        var parentForm = $(this).parents('#searchEmploAttr_from');

        parentForm.find('#name').val('');
        parentForm.find('#cardNumber').val('');
        parentForm.find('#phone').val('');
        parentForm.find('#email').val('');
        parentForm.find('#department').val('').siblings('.el-input').val('--请选择--');
        parentForm.find('#currentState').val('').siblings('.el-input').val('--请选择--');
        parentForm.find('#job').val('').siblings('.el-input').val('--请选择--');
        parentForm.find('#adminRole').val('').siblings('.el-input').val('--请选择--');
        parentForm.find('.el-radio-group .el-radio-input').removeClass('is-radio-checked');
        parentForm.find('#currentState').val('').siblings('.el-input').val('--请选择--');
        parentForm.find('#admin_name').val('');

        resetParam();
        getEmployeeList();
    });

    $('#table_employee_table.uniquetable').on('click','.delete',function(){
        var id=$(this).attr("data-id");
        $(this).parents('tr').addClass('active');
        layer.confirm('将执行删除操作?', {icon: 3, title:'提示',offset: '250px',end:function(){
            $('.uniquetable tr.active').removeClass('active');
        }}, function(index){
            layer.close(index);
            deleteEmployee(id);
        });
    });

    $('body').on('click','.actions #export_excel',function () {

        showExcelModal()
    });
    
    $("body").on("change","#files_excel",function (e) {
        var filePath=$(this).val();
        if(filePath.indexOf('xlsx')!=-1 || filePath.indexOf('xls')!=-1){
            if(document.getElementById("files_excel").files[0].size<(1<<20)){
                $(".excelError").html("").hide();
                $('#addExcel_form .submit').removeClass('is-disabled');
                var arr=filePath.split('\\');
                var fileName=arr[arr.length-1];
                $('.filename').html(fileName).attr('title',fileName);
            }else {
                $('.filename').html('');
                $('.excelError').html('上传文件超过1兆（MKB）').show();
                $('#addExcel_form .submit').addClass('is-disabled')
            }
        }else{
            $('.filename').html('');
            $('.excelError').html('上传文件类型错误').show();
            $('#addExcel_form .submit').addClass('is-disabled')
        }
    });

    $('body').on('click','#addExcel_form .submit:not(".is-disabled")',function (ev) {
        var reader = new FileReader();
        var zzexcel,file;
        excelData._token = _token;
        excelData.creator_token = creator_token;
        reader.readAsBinaryString(document.getElementById("files_excel").files[0]);
        reader.onload = function(e) {
            var data = e.target.result;
            zzexcel = XLSX.read(data, {
                type: 'binary'
            });
            file =XLSX.utils.sheet_to_json(zzexcel.Sheets[zzexcel.SheetNames[0]]);
            var param = '';

            for(var i in excelData){
                param+=`&${i}=${excelData[i]}`;
            }
            var dateInfo = {
                file:file,
                _token:TOKEN
            }

            AjaxClient.post({
                url: URLS['employee'].uploadEmployeeExcel,
                data:dateInfo,
                dataType:'json',
                beforeSend: function(){
                    layerLoading = LayerConfig('load');
                },
                success:function (rsp) {
                    layer.close(layerLoading);
                    layer.close(layerModal);
                    layer.msg("导入成功", {icon: 1});
                    getEmployeeList();
                },
                fail:function (rsp) {
                    layer.close(layerLoading);
                    layer.close(layerModal);
                    if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                        LayerConfig('fail',rsp.message)
                    }

                }
            },this)



        };




    })

}
//文件切片
/*//shard是我们当前片段的位置，可以理解为当前需要准备的是第0,1,...,n-1片片段
//shardCount是总分片数，计算方式为shardCount=Math.ceil（file.size/shardSize）;
//shardSize是分片大小，当然，目前考虑的还是固定shardSize的分片方式。也可以根据先前的上传情况生成动态的shardSize，便于适应不同用户的网络状况，但要重新更换为shardSize数组的概念来切片，不能在采用shardSize*shard的方式来定位分片位置了（毕竟前面的shardSize可能大于或者小于当前的shardSize）

function getFormData (shard=0,shardCount=0,shardSize=0,data=null,file=null){
    var formData = new FormData();
    if(data!=null){
        formData.append("data",JSON.stringify(data));
    }
    if(file!=null){
        var start = shard*shardSize;
        var end   = Math.min(file.size,start+shardSize);//在file.size和start+shardSize中取最小值，避免切片越界
        formData.append("file",file.slice(start,end));
        formData.append("name",file.name);
        formData.append("type",file.type);
        formData.append("size",file.size);
        formData.append("shard",shard);
        formData.append("shardCount",shardCount);//shardCount传给服务端便于服务端判断文件上传是否完成
    }
    return formData;
}
//id用于我们唯一定位一次ajax请求，可以采用自增量的方式设置。通过id我们可以唯一查找当前XMLHttpRequest事件对应的XMLHttpRequest对象。

function ajax(id,url,data,onprogress,onloadstart,onload,onerror,onabort){
    console.log(data);
    // var xhr = new XMLHttpRequest();
    // var dateTime = new Date().getTime();
    // xhr.upload.onprogress = function(event){
    //     onprogress(event,dateTime,id,xhr);//onprogress是上传状态监控端口
    // }
    // xhr.onloadstart = function(event){
    //     onloadstart(event,dateTime,id,xhr);//onloadstart是上传开始监控端口
    // }
    // xhr.onload = function(event){
    //     onload(event,dateTime,id,xhr,JSON.parse(xhr.responseText));//onload是上传结束监控端口
    // }
    // xhr.onerror = function(event){
    //     var end = false;
    //     if(typeof(onerror)=="function"){
    //         //onerror是上传错误监控端口
    //         end = onerror(event,dateTime,id,xhr);
    //     }
    //     if(end){
    //         //当回调表示需要重传的时候，进行当前请求的重新提交
    //         xhr.open('POST',url,true);
    //         xhr.send(data);
    //     }else{
    //         return;
    //     }
    // }
    // xhr.onabort = function(event){
    //     onabort (event,dateTime,id,xhr);//onabort 是上传终止监控端口
    // }
    // xhr.open('POST',url,true);//open开启数据连接
    // xhr.send(data);//send发送数据
    // return;
}
function sendFileByAjax(file,data,url,ajaxid){
    var shardSize = 3*(1<<20);//3Mb一片
    var shardCount=Math.ceil(file.size/shardSize);
    for(var shard = 0;shard < shardCount;shard ++){
        ajax(ajaxid,url,getFormData(shard,shardCount,shardSize,data,file));
    }
}*/




function deleteEmployee(id) {
    AjaxClient.get({
        url: URLS['employee'].employeeDelete+'?'+_token+"&employee_id="+id,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success:function (rsp) {
            layer.close(layerLoading);
            getEmployeeList();
        },
        fail:function (rsp) {
            layer.close(layerLoading);
            if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                LayerConfig('fail',rsp.message);
            }
            if(rsp&&rsp.code==404){
                getEmployeeList();
            }
        }

    },this)
}

function showExcelModal() {
    layerModal=layer.open({
        type: 1,
        title: '员工批量导入',
        offset: '100px',
        area: '500px',
        shade: 0.1,
        shadeClose: true,
        resize: false,
        move: false,
        content: `<form class="addExcelModal formModal formMateriel" id="addExcel_form">
                    <div style="min-height: 155px;padding-top:20px">
                        <div class="excelInput">
                            <a href="javascript:;" class="file">
                                <input type="file" name="attachment" id="files_excel">选择Excel文件
                            </a>
                            <span class="filename"></span>
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

