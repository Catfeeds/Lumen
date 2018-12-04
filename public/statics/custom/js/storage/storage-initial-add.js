var layerLoading,
id;
console.log('666')
$(function(){
	editurl=$('#init_edit').val();
	viewurl=$('#init_view').val();
	var url=window.location.pathname.split('/');
	if(url.indexOf('edit')>-1){
		initActionFlag='edit';
		initid=getQueryString('id');
		initid!=undefined?getInitData(initid):LayerConfig('fail','url缺少id参数，请给到id参数');
	}else{
		initActionFlag='add';
		// getAjaxSearchData();
	}
	bindEvent();
});
//显示错误信息
function showInvalidMessage(name,val){
	$('#'+name).parents('.el-form-item').find('.errorMessage').addClass('active').html(val).show();
	$('#addSTinit_form').find('.submit').removeClass('is-disabled');
}
//添加仓库期初
function addStorageInitial(data){
	AjaxClient.post({
		url: URLS['storageInitial'].store+_token,
		data: data,
		dataType:'json',
		beforeSend: function(){
			layerLoading = LayerConfig('load');
		},
		success: function(rsp){
			layer.close(layerLoading);
			LayerConfig('success','添加成功',resetparam);
		},
		fail: function(rsp){
			layer.close(layerLoading);
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

//编辑仓库期初
function editStorageInit(data){
	AjaxClient.post({
		url: URLS['storageInitial'].update,
		data: data,
		dataType: 'json',
		beforeSend: function(){
			layerLoading = LayerConfig('load');
		},
        success: function(rsp){
            layer.close(layerLoading);
            LayerConfig('success','编辑物料仓库期初成功');
        },
		fail: function(rsp){
			layer.close(layerLoading);
			console.log('编辑仓库期初失败');
			if(rsp&&rsp.message!=undefined&&rsp.message!=null){
				LayerConfig('fail',rsp.message);
			}
			if(rsp&&rsp.field!==undefined){
				showInvalidMessage(rsp.field,rsp.message);
			}
		},
		complete:function(XHR, TS){
			$('body').find('#addSTinit_form').removeClass('disabled').find('.submit').removeClass('is-disabled');
		}
	},this);
}

//重置添加数据
function resetParam(){
	var parentForm = $('#addSTinit_form');
	parentForm.find('#datatime').val('');
	parentForm.find('#orderNum').val('');
	parentForm.find('#direct').val('');
	parentForm.find('#material').val('');
	parentForm.find('#unit').val('');
	parentForm.find('#lot').val('');
	parentForm.find('#plant').val('');
	parentForm.find('#depot').val('');
	parentForm.find('#subarea').val('');
	parentForm.find('#locate').val('');
	parentForm.find('#volume').val('');
	parentForm.find('#num').val('');
	parentForm.find('#remark').val('');
	parentForm.find('#status').val('');
	parentForm.find('#lockStatus').val('');
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
    $('body').on('click','.formStorage:not(".disabled") .submit',function (e) {
        e.stopPropagation();
        console.log(id=getQueryString('id'));
        if(!$(this).hasClass('is-disabled')) {
            var parentForm = $(this).parents('#addSTinit_form');
                $(this).addClass('is-disabled');
                parentForm.addClass('disabled');
                var 
                 quantity = parentForm.find('#quantity').val(),
                 price = parentForm.find('#price').val();
                editStorageInit({
                    id: id,
                    _token: TOKEN,
                    quantity: quantity,
                    price: price
        })

        }
})
}

