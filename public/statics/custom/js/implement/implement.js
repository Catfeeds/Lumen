
var templateSource=[
    {name:'人事管理',children:[{name:'员工模板'},{name:'员工模板2'}]},
    {name:'物料管理',children:[{name:'物料模板'},{name:'物料模板2'}]},
];
var tableData = [];

$(function () {

    showTemplateList(templateSource);

    bindEvent();
});

function showTemplateList(data) {

    var _html = '',_right = '';

    data.forEach(function (item,index) {

        if(item.children && item.children.length){
            _right = '';

            item.children.forEach(function (citem,cindex) {

                _right += `<li><a href="javascript:;">${citem.name}</a></li>`

            })
        }
        _html += `<div class="templateContainer">
                     <div class="template-left"><span>${item.name}</span></div>
                     <div class="template-right"><ul>${_right}</ul></div>
                </div>`;
    });

    $('.templateContent').html(_html)
}

function bindEvent() {
    $('body').on('click','.formModal:not(".disabled") .cancle',function(e){
        e.stopPropagation();
        layer.close(layerModal);
    });

    $('body').on('click','.el-tap-wrap:not(.is-disabled) .el-tap',function(){

        if(!$(this).hasClass('active')){
            $(this).addClass('active').siblings('.el-tap').removeClass('active');

            var form=$(this).attr('data-item');

            if(form == 'importView'){
                showImportList(templateSource);
            }

            $('#'+form).parent().addClass('active').siblings('.el-panel').removeClass('active');
        }
    });

    $("body").on("change","#files_excel",function (e) {
        var filePath=$(this).val();

        if(filePath.indexOf('xlsx')!=-1 || filePath.indexOf('xls')!=-1){
            $(".excelError").html("").hide();
            $('#addExcel_form .submit').removeClass('is-disabled');

            var arr=filePath.split('\\');

            var fileName=arr[arr.length-1];

            $('.filename').html(fileName).attr('title',fileName);


        }else{
            $('.filename').html('');

            $('.excelError').html('上传文件类型错误').show();
            $('.submit').addClass('is-disabled')
        }


    });

    $('body').on('click','#export_excel',function () {

        showExcelModal();
    });
}

function showImportList(data) {

    var _html = '',_arrow = '',tr = '';

    data.forEach(function (item,index) {

        _arrow = ((index != data.length-1) ? `<span class="import_arrow"><i class="fa fa-arrow-right"></i></span>` : '');

        _html += `<label class="el-radio">
                    <span class="el-radio-input ${index == 0 ? 'is-radio-checked' : ''}">
                        <span class="el-radio-inner"></span>
                        <input class="status" type="hidden" value="">
                    </span>
                    <span class="el-radio-label">${item.name}</span>
                </label>${_arrow}`;
        if(item.children && item.children.length){
            tr = '';

            item.children.forEach(function (citem,cindex) {

                tr += `<tr data-id="${cindex}">
                            <td>
                                <label class="el-radio">
                                    <span class="el-radio-input">
                                        <span class="el-radio-inner"></span>
                                        <input class="status yes" type="hidden" value="1">
                                    </span>
                                    <span class="el-radio-label"></span>
                                </label>
                            </td>
                            <td>${citem.name}</td>
                        </tr>`;
            })
            $('.import-content .table_tbody').html(tr)
        }

    });

    $('.import-top').html(_html)
}

function showExcelModal() {

    layerModal=layer.open({
        type: 1,
        title: '批量导入',
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