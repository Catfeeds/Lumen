var layerLoading,
id;
$(function(){
	id=getQueryString('id');
	if(id!=undefined){
		editInitData(data);
	}else{
		layer.msg('url缺少id参数，请给到id参数',{icon: 5,offset: '250px'});	
	}
	bindEvent();
});

function editInitData(data){
	AjaxClient.post({
		url: URLS['storageInitial'].update+_token,
		data: data,
		dataType: 'json',
		beforeSend: function(){
			layerLoading = LayerConfig('load');
		},
		success: function(rsp){
			layer.close(layerLoading);
			LayerConfig('success','编辑仓库期初成功');
            getInitData();
		},
		fail: function(rsp){
			layer.close(layerLoading);
			LayerConfig('fail','编辑仓库期初失败');
            getInitData();
			if(rsp&&rsp.message!=undefined&&rsp.message!=null){
				LayerConfig('fail',rsp.message);
			}
			if(rsp&&rsp.field!==undefined){
				showInvalidMessage(rsp.field,rsp.message);
			}
		},
		complete: function(XHR, TS){
			$('body').find('#addSTinit_form').removeClass('disabled').find('.submit').removeClass('is-disabled');
		}
	},this);
}

function bindEvent(){
	//点击弹框内部关闭dropdown
	$(document).click(function (e) {
        var obj = $(e.target);
        if (!obj.hasClass('el-select-dropdown-wrap') && obj.parents(".el-select-dropdown-wrap").length === 0) {
            $('.el-select-dropdown').slideUp();
        }
    });
    $('body').on('click','.el-select-dropdown-wrap',function(e){
        e.stopPropagation();
    });

    $('body').on('click','.el-select:not(.noedit)',function(){
        $(this).find('.el-input-icon').toggleClass('is-reverse');
        $(this).parents('.el-form-item').siblings().find('.el-select-dropdown').hide();
        $(this).parents('.el-form-item').siblings().find('.el-select .el-input-icon').removeClass('is-reverse');
        if($(this).parents('.value_wrap').length&&$(this).find('.el-input-icon.is-reverse').length){
            var width=$(this).width();
            var offset=$(this).offset();
            $(this).siblings('.el-select-dropdown').width(width).css({top: 0,left: 0}).offset({top: offset.top+30,left: offset.left});
        }
        $(this).siblings('.el-select-dropdown').toggle();
    });
    //输入框的相关事件
    $('body').on('focus','.el-input:not([readonly]),.el-textarea',function(){
        $(this).parents('.el-form-item').find('.errorMessage').removeClass('active').html("").hide();
    }).on('blur','.el-input:not([readonly]),.el-textarea',function(){
        var flag=initActionFlag,
        name=$(this).attr("id");
    });
    //添加按钮点击
    $('body').on('click','.submit:not(".is-disabled")',function (e) {
        e.stopPropagation();
        if(!$(this).hasClass('is-disabled')) {
            var parentForm = $(this).parents('#addSTinit_form');
                $(this).addClass('is-disabled');
                parentForm.addClass('disabled');
                // console.log($(this).parents('#addSTinit_form').length);
                var billdate = parentForm.find('#billdate').val(),
                 customcode = parentForm.find('#customcode').val().trim(),
                 direct = parentForm.find('#direct').val().trim(),
                 material_id = parentForm.find('#material_id').val().trim(),
                 unit_id = parentForm.find('#unit_text').val().trim(),
                 lot = parentForm.find('#lot').val().trim(),
                 plant_id = parentForm.find('#plant_').val(),
                 depot_id = parentForm.find('#depot').val(),
                 subarea_id = parentForm.find('#subarea').val(),
                 bin_id = parentForm.find('#locate').val(),
                 volume = parentForm.find('#volume').val(),
                 amount = parentForm.find('#amount').val(),
                 remark = parentForm.find('#remark').val(),
                 status = parentForm.find('.is-radio-checked .is-packaging').val(),
                 lock_status = parentForm.find('.is-radio-checked .is-packaging').val();
                editStorageInit({
                    billdate: billdate,
                	direct: direct,
                	material_id: material_id,
                	unit_id: unit_id,
                	lot: lot,
                	depot_id: depot_id,
                	bin_id: bin_id,
                	volume: volume,
                	amount: amount,
                	status: status,
                	remark: remark,
                	customcode: customcode,
                	lock_status: lock_status,
                	plant_id: plant_id,
                	subarea_id: subarea_id
        })

        }
})


    

}

