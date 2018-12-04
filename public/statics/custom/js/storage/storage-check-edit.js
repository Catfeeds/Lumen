var layerLoading,
id;
$(function(){
	id=getQueryString('id');
	if(id!=undefined){
	}else{
		layer.msg('url缺少id参数，请给到id参数',{icon: 5,offset: '250px'});	
	}
	bindEvent();
});

function editCheckData(data){
	AjaxClient.post({
		url: URLS['check'].update,
		data: data,
		dataType: 'json',
		beforeSend: function(rsp){
			layerLoading = LayerConfig('load');
		},
		success: function(rsp){
			layer.close(layerLoading);
			LayerConfig('success','编辑仓库盘点成功');
			// getCheckData();
		},
		fail: function(rsp){
			layer.close(layerLoading);
			LayerConfig('fail','编辑仓库盘点失败');
			// getCheckData();
		},
		complete: function(XHR, TS){
			$('body').find('#addSTinit_form').removeClass('disabled').find('.submit').removeClass('is-disabled');
		}
	},this)
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
        name=$(this).attr("id");
    });
    //添加按钮点击
    $('body').on('click','.submit:not(".is-disabled")',function (e) {
        e.stopPropagation();
        console.log(id=getQueryString('id'));
        if(!$(this).hasClass('is-disabled')) {
            var parentForm = $(this).parents('#addSTinit_form');
                $(this).addClass('is-disabled');
                parentForm.addClass('disabled');
                // console.log($(this).parents('#addSTinit_form').length);
                var nquantity = parentForm.find('#nquantity').val().trim();					
                editCheckData({
                    id: id,
                    _token: TOKEN,
                    real_quantity: nquantity
        })

        }
})


    

}


