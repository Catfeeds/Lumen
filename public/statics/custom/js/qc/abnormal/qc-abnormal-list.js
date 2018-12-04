var abnormalId;
$(function () {
    abnormalId=getQueryString('id');
    bindEvent();
    getSendEmployeeList();

});
function getSendEmployeeList() {
    //获取列表

        $('.table_tbody').html('');
        AjaxClient.get({
            url: URLS['abnormal'].sendEmployeeList+"?"+_token+"&abnormality_id="+abnormalId,
            dataType: 'json',
            beforeSend: function(){
                layerLoading = LayerConfig('load');
            },
            success: function(rsp){
                layer.close(layerLoading);
                if(rsp.results&&rsp.results.length){
                    createHtml($('.table_tbody'),rsp.results);
                }else{
                    noData('暂无数据',3);
                }
            },
            fail: function(rsp){
                layer.close(layerLoading);
                noData('获取质量类别列表失败，请刷新重试',3);
            }
        },this);
};

//生成列表数据
function createHtml(ele,data){
    data.forEach(function(item,index){
        var tr=`
            <tr class="tritem">
                <td>${item.dapartment}</td>
                <td>${item.employee}</td> 
                <td class="right">
                    <button data-id="${item.employee_id}" class="button pop-button view">查看填写结果</button>
                    <button data-id="${item.employee_id}" class="button pop-button back">打回</button>
                    <button data-id="${item.employee_id}" class="button pop-button delete">删除</button>
                </td> 
            </tr>
        `;
        ele.append(tr);
        ele.find('tr:last-child').data("trData",item);
    });
};
function bindEvent() {
    $(".button_check").click(function () {
        getDepartment();
    });
    //弹窗下拉
    $('body').on('click','.formEmployee:not(".disabled") .el-select',function(){
        $(this).find('.el-input-icon').toggleClass('is-reverse');
        $(this).siblings('.el-select-dropdown').toggle();

    });
    //下拉选择
    $('body').on('click','.formEmployee:not(".disabled") .el-select-dropdown-item',function(e){
        e.stopPropagation();
        $(this).parents('.el-form-item').find('.errorMessage').html('');
        $(this).parent().find('.el-select-dropdown-item').removeClass('selected');
        $(this).addClass('selected');

        var check=$(this).parents('.el-select-dropdown').parents('#selectDrop');
        if($(this).hasClass('selected')){
            var ele=$(this).parents('.el-select-dropdown').siblings('.el-select');
            ele.find('.el-input').val($(this).text());
            ele.find('.val_id').val($(this).attr('data-id'));
            ele.find('.val_id').attr('data-code',$(this).attr('data-code'));
        }
        $(this).parents('.el-select-dropdown').hide().siblings('.el-select').find('.el-input-icon').removeClass('is-reverse');
        if(check.length){
            getEmployeeByDepartment($(this).attr('data-id'));
        }
    });

    //添加和编辑的提交
    $('body').on('click','.formEmployee:not(".disabled") .submit',function(e){
        e.stopPropagation();
        if(!$(this).hasClass('is-disabled')){
            var parentForm=$(this).parents('#addEmployee_from');
                $(this).addClass('is-disabled');
                parentForm.addClass('disabled');
                var department=parentForm.find('#department').val().trim(),
                    employee=parentForm.find('#employee').val().trim();
                addSendEmployee({
                    abnormality_id:abnormalId,
                        department_id:department,
                    person_liable_id:employee,
                    _token:TOKEN,
                    });

        }
    });
    $('body').on('click','.formReport:not(".disabled") .submit',function(e){
        e.stopPropagation();
        if(!$(this).hasClass('is-disabled')){
            var parentForm=$(this).parents('#addReport_from');
                $(this).addClass('is-disabled');
                parentForm.addClass('disabled');
                var reasonBackId=parentForm.find('#reasoBback').attr('data-id'),
                    reasonBack=parentForm.find('#reasoBback').val().trim(),
                    methodBackId=parentForm.find('#methodBack').attr('data-id'),
                    methodBack=parentForm.find('#methodBack').val().trim();
                addReportBack({
                    reasonBackId:reasonBackId,
                    reasonBack:reasonBack,
                    methodBackId:methodBackId,
                    methodBack:methodBack,
                    _token:TOKEN,
                    });

        }
    });
    $('.uniquetable').on('click','.view',function () {
        $(this).parents('tr').addClass('active');
        viewReportInfor($(this).attr('data-id'),'view');
    });
    $('.uniquetable').on('click','.back',function () {
        $(this).parents('tr').addClass('active');
        viewReportInfor($(this).attr('data-id'),'back');
    });
    $('.uniquetable').on('click','.delete',function () {
        var employee_id=$(this).attr("data-id");
        $(this).parents('tr').addClass('active');
        layer.confirm('将执行删除操作?', {icon: 3, title:'提示',offset: '250px',end:function(){
            $('.uniquetable tr.active').removeClass('active');
        }}, function(index){
            layer.close(index);
            deleteReport(employee_id);
        });

        // deleteReport($(this).attr('data-id'))
    });

};
function deleteReport(employee_id) {
    AjaxClient.get({
        url: URLS['abnormal'].deleteReportInfo+"?"+_token+"&employee_id="+employee_id+"&abnormal_id="+abnormalId,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            // LayerConfig('success','删除成功');
            getSendEmployeeList();
        },
        fail: function(rsp){
            layer.close(layerLoading);
            if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                LayerConfig('fail',rsp.message);
            }
            if(rsp&&rsp.code==404){
                getSendEmployeeList();
            }
        }
    },this);
}


function addReportBack(data) {
    console.log(data);
    AjaxClient.post({
        url: URLS['abnormal'].backReportInfo,
        data: data,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            layer.close(layerModal);
            getSendEmployeeList();
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

function viewReportInfor(employee_id,flag) {
    var dtd=$.Deferred();
    AjaxClient.get({
        url: URLS['abnormal'].viewReportInfo+"?"+_token+"&abnormality_id="+abnormalId+"&employee_id="+employee_id,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            console.log(rsp.results);
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
        reasonHtml,
        reasonHtmlBack,
        methodHtml,
        methodHtmlBack,
        textareaplaceholder='',
        readonly='',
        noEdit='readonly="readonly"';
        flag==='view'?(btnShow='btnHide',readonly='readonly="readonly'):(btnShow='btnShow',readonly='');
    report.forEach(function (item) {
        if(item.type==1){
            reasonHtml=`<textarea type="textarea" ${noEdit} maxlength="500" id="reason" rows="5" class="el-textarea" placeholder="">${item.description}</textarea>`;
            reasonHtmlBack=`<textarea type="textarea" ${readonly} maxlength="500" id="reasoBback" rows="5" data-id="${item.id}" class="el-textarea" placeholder="">${item.send_back_reason}</textarea>`;
        };
        if(item.type==2){
            methodHtml=`<textarea type="textarea" ${noEdit} maxlength="500" id="method" rows="5" class="el-textarea" placeholder="">${item.description}</textarea>`;
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



function addSendEmployee(data) {
    AjaxClient.post({
        url: URLS['abnormal'].send,
        data: data,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            layer.close(layerModal);
            getSendEmployeeList();
        },
        fail: function(rsp){
            layer.close(layerLoading);
            $('body').find('#addQCType_from').removeClass('disabled').find('.submit').removeClass('is-disabled');
            if(rsp&&rsp.field!==undefined){
                showInvalidMessage(rsp.field,rsp.message);
            }
            if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                LayerConfig('fail',rsp.message);
            }
        }
    },this);
}

function getEmployeeByDepartment(department) {
    var lis = '',innerHtml='';
    AjaxClient.get({
        url: URLS['abnormal'].employee+"?"+_token+"&department_id="+department,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            if(rsp.results&&rsp.results.length){
                rsp.results.forEach(function (item) {
                    lis+=`<li data-id="${item.id}" class="el-select-dropdown-item" class=" el-select-dropdown-item">${item.name}</li>`;
                });
                innerHtml=`
                <li data-id="" class="el-select-dropdown-item kong" class="el-select-dropdown-item">--请选择--</li>
                ${lis}`;
                // $('.el-form-item.emlpoyee_wrap').find('.el-select-dropdown-list').html('');
                $('.el-form-item.emlpoyee_wrap').find('.el-select-dropdown-list').html(innerHtml);
            }else{
                LayerConfig('fail','员工列表为空！');
            }
        },
        fail: function(rsp){
            layer.close(layerLoading);
        }
    },this);

}

function getDepartment() {
    var dtd=$.Deferred();
    AjaxClient.get({
        url: URLS['abnormal'].department+"?"+_token,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            if(rsp.results&&rsp.results.length){
                Modal(rsp.results);
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
function Modal(department){


    var labelWidth=100,
        btnShow='btnShow',
        title='人员选择',


        textareaplaceholder='',
        readonly='',
        selecthtml=selectHtml(department),
        noEdit='';
    // console.log(selecthtml);


    layerModal=layer.open({
        type: 1,
        title: title,
        offset: '100px',
        area: '500px',
        shade: 0.1,
        shadeClose: false,
        resize: false,
        move: false,
        content: `<form class="formModal formEmployee" id="addEmployee_from" data-flag="">

          <div class="el-form-item">
            <div class="el-form-item-div" id="selectDrop">
                    <label class="el-form-item-label" style="width: ${labelWidth}px;">部门</label>
                    ${selecthtml}
            </div>
            <p class="errorMessage" style="padding-left: ${labelWidth}px;display: block;"></p>
          </div>
          <div class="el-form-item emlpoyee_wrap">
            <div class="el-form-item-div">
                <label class="el-form-item-label" style="width: ${labelWidth}px;">员工</label>
                
                <div class="el-select-dropdown-wrap emlpoyee_wrap">
                    <div class="el-select">
                        <i class="el-input-icon el-icon el-icon-caret-top"></i>
                        <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                        <input type="hidden" class="val_id" id="employee" value="">
                    </div>
                    <div class="el-select-dropdown">
                        <ul class="el-select-dropdown-list">
                            <li data-id="" class="el-select-dropdown-item kong" class="el-select-dropdown-item">--请选择--</li>
                        </ul>
                    </div>
                </div> 
            </div>
            <p class="errorMessage" style="padding-left: ${labelWidth}px;display: block;"></p>
          </div>

            <div class="el-form-item ${btnShow}">
            <div class="el-form-item-div btn-group">
                <button type="button" class="el-button cancle">取消</button>
                <button type="button" class="el-button el-button--primary submit" id="button">确定</button>
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
//生成上级分类数据
function selectHtml(fileData){
    var elSelect,innerhtml,lis='',parent_id='';
    if(fileData.length){
        parent_id=fileData[0].parent_id;
        lis=treeHtml(fileData,parent_id);
    }

        innerhtml=`<div class="el-select">
			<i class="el-input-icon el-icon el-icon-caret-top"></i>
			<input type="text" readonly="readonly" id="selectVal" class="el-input" value="--请选择--">
			<input type="hidden" class="val_id" data-code="" id="department" value="">
		</div>
		<div class="el-select-dropdown">
			<ul class="el-select-dropdown-list">
				<li data-id="0" data-pid="0" data-code="" data-name="--请选择--" class=" el-select-dropdown-item">--请选择--</li>
				${lis}
			</ul>
		</div>`;

    elSelect=`<div class="el-select-dropdown-wrap">
			${innerhtml}
		</div>`;
    itemSelect=[];
    return elSelect;
};
function treeHtml(fileData, parent_id) {
    var _html = '';
    var children = getChildById(fileData, parent_id);
    var hideChild = parent_id > 0 ? 'none' : '';
    children.forEach(function (item, index) {
        var lastClass=index===children.length-1? 'last-tag' : '';
        var level = item.level;
        distance=level * 20,tagI='',itemcode=''
        var distance,className,itemImageClass,tagI,itemcode='';
        distance=level * 20,tagI='',itemcode=''

        var hasChild = hasChilds(fileData, item.id);
        hasChild ? (className='treeNode expand',itemImageClass='el-icon itemIcon') :(className='',itemImageClass='');
        var selectedClass='';
        var span=level?`<div style="padding-left: ${distance}px;"><span class="tag-prefix ${lastClass}"></span><span>${item.name}</span> ${itemcode}</div>`: `<span>${item.name}</span> `;

            _html += `
    		<li data-id="${item.id}" data-pid="${parent_id}" data-code="${item.code}" data-name="${encodeURI(item.name)}" class="${className} el-select-dropdown-item ${selectedClass}">${span}</li>
	        ${treeHtml(fileData, item.id)}
	        `;

    });
    return _html;
};