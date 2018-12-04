var layerModal,
layerLoading,
itemSelect=[],
validatorToolBox={
	checkName: function(name){
        var value=$('#'+name).val().trim();
		return $('#'+name).parents('.el-form-item').find('.errorMessage').hasClass('active')?(!1):
        Validate.checkNull(value)?(showInvalidMessage(name,"菜单名称不能为空"),!1):(!0);
	},
    checkSort: function(name){
        var value=Number($('#'+name).val().trim());
        return $('#'+name).parents('.el-form-item').find('.errorMessage').hasClass('active')?(!1):
        value<1||value>100?(showInvalidMessage(name,"排序范围为1-100"),!1):(!0); 
    },
    checkUris: function(name){
        var value=$('#'+name).val().trim();
        return $('#'+name).parents('.el-form-item').find('.errorMessage').hasClass('active')?(!1):
        !value.length?(!0):/[\uff0c]/g.test(value)?(showInvalidMessage(name,"包含中文逗号"),!1):!0;
    }
},
remoteValidatorToolbox={
    remoteCheckName: function(name,flag,id){
        var value=$('#'+name).val().trim();
        getUnique(flag,name,value,id,function(rsp){
            if(rsp.results&&rsp.results.exist){
                var val='已注册';
                showInvalidMessage(name,val);
            }
        });
    }
},
validatorConfig = {
    name: "checkName",
    sort: 'checkSort',
    belong_to_uris: 'checkUris'
},remoteValidatorConfig={
    name: "remoteCheckName"
};
$(function(){
	getMenu();
	bindEvent();
});
//显示错误信息
function showInvalidMessage(name,val){
	$('#'+name).parents('.el-form-item').find('.errorMessage').html(val).addClass('active');
    $('#addMenu').find('.submit').removeClass('is-disabled');
}
//获取菜单配置列表
function getMenu(){
    $('.table_tbody').html('');
	AjaxClient.get({
		url: URLS['menu'].list+"?"+_token,
		dataType: 'json',
		beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
		success: function(rsp){
			layer.close(layerLoading);
			if(rsp.results&&rsp.results.length){
				var parent_id=rsp.results[0].parent_id;
				$('.table_tbody').html(treeHtml(rsp.results,parent_id,'table'));
			}else{
				noData('暂无数据',7);
			}	
		},
		fail: function(rsp){
			layer.close(layerLoading);
			noData('获取菜单配置列表失败，请刷新重试',7);
		}
	},this);
}
//添加菜单配置
function addMenu(data){
    AjaxClient.post({
        url: URLS['menu'].store,
        data: data,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            layer.close(layerModal);
            getMenu();
        },
        fail: function(rsp){
            layer.close(layerLoading);
            if(rsp&&rsp.field!==undefined&&rsp.message){
                showInvalidMessage(rsp.field,rsp.message);
            }else{
                if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                    LayerConfig('fail',rsp.message);
                }else{
                    LayerConfig('fail','添加失败');
                }
            }
            $('#addMenu').find('.submit').removeClass('is-disabled');
        }
    },this);
}
//查看菜单配置
function viewMenu(id,flag){
    AjaxClient.get({
        url: URLS['menu'].show+"?"+_token+"&menu_id="+id,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            if(rsp&&rsp.results){
                menuModal(flag,rsp.results);
            }else{
                console.log('获取该菜单失败');
            }
        },
        fail: function(rsp){
            layer.close(layerLoading);
            console.log('获取该菜单失败');
            if(rsp.code==404){
                getMenu();
            }
        }
    },this);
}
//编辑菜单配置
function editMenu(data){
    AjaxClient.post({
        url: URLS['menu'].update,
        data: data,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            layer.close(layerModal);
            getMenu();
        },
        fail: function(rsp){
            layer.close(layerLoading);
            if(rsp&&rsp.field!==undefined&&rsp.message){
                showInvalidMessage(rsp.field,rsp.message);
            }else{
                if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                    LayerConfig('fail',rsp.message);
                }else{
                    LayerConfig('fail','添加失败');
                }
            }
            $('#addMenu').find('.submit').removeClass('is-disabled');
        }
    },this);
}
//删除菜单配置
function deleteMenu(id){
    AjaxClient.get({
        url: URLS['menu'].delete+"?"+_token+"&menu_id="+id,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            // LayerConfig('success','删除成功');
            getMenu();
        },
        fail: function(rsp){
            layer.close(layerLoading);
            if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                LayerConfig('fail',rsp.message);
            }
            if(rsp&&rsp.code==404){
                getMenu();
            }
            console.log('删除菜单');
        }
    },this);
}
//获取select列表
function getMenuSelect(flag,data){
	AjaxClient.get({
        url: URLS['menu'].select+"?"+_token,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            var ul='',lis='',value='';
            if(data){
                value=data.parent_id;
            }
            if(rsp&&rsp.results&&rsp.results.length){
                var parent_id=rsp.results[0].parent_id;
                lis=treeHtml(rsp.results,parent_id,'select',value);
            }
            if(flag=='view'||flag=='edit'){
                var input=`<input type="text" readonly="readonly" id="parent_id" class="el-input" placeholder="请输入字体标签" value="${itemSelect.length?itemSelect[0].name:'--无--'}">`;
                $('#addMenu .el-form-item.select .el-select-dropdown-wrap').remove();
                $('#addMenu .el-form-item.select .el-form-item-label').after(input);

            }else{
                ul=`<ul class="el-select-dropdown-list">
                    <li data-id="0" data-pid="0" class=" el-select-dropdown-item">--请选择--</li>
                    ${lis}
                </ul>`;
                $('#addMenu .el-form-item.select .el-select-dropdown').html(ul);
            }
        },
        fail: function(rsp){
            layer.close(layerLoading);
            console.log('获取上级菜单失败');
        }
    },this);
}
//检测唯一性
function getUnique(flag,field,value,id,fn){
	var urlLeft='';
	if(flag==='edit'){
		urlLeft=`&field=${field}&value=${value}&id=${id}`;
	}else{
		urlLeft=`&field=${field}&value=${value}`;
	}
	var xhr=AjaxClient.get({
		url: URLS['menu'].unique+"?"+_token+urlLeft,
		dataType: 'json',
		beforeSend: function(){
            // layerLoading = LayerConfig('load');
        },
		success: function(rsp){
			// layer.close(layerLoading);
			fn && typeof fn==='function'? fn(rsp):null;
		},
		fail: function(rsp){
            console.log('唯一性检测失败');
			// layer.close(layerLoading);
		}
	},this);
}

//清空缓存
function clearHistory(){
    AjaxClient.get({
        url: URLS['menu'].clear+"?"+_token,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            LayerConfig('success','清空缓存成功',function(){
                 window.location.reload();
            });
        },
        fail: function(rsp){
            layer.close(layerLoading);
            LayerConfig('fail','清空缓存失败');
            console.log('清空缓存失败');
        }
    },this);
}

//菜单初始化
function initMenu(){
    AjaxClient.get({
        url: URLS['menu'].init+"?"+_token,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            LayerConfig('success','菜单初始化成功');
        },
        fail: function(rsp){
            layer.close(layerLoading);
            LayerConfig('fail','菜单初始化失败');
            console.log('菜单初始化失败');
        }
    },this);
}

function bindEvent(){
	//点击弹框内部关闭dropdown
	$(document).click(function (e) {
        var obj = $(e.target);
        if (!obj.hasClass('el-select-dropdown-wrap') && obj.parents(".el-select-dropdown-wrap").length === 0) {
            $('.el-select-dropdown').slideUp().siblings('.el-select').find('.el-input-icon').removeClass('is-reverse');
        }
    });
	$('body').on('click','.el-select-dropdown-wrap',function(e){
		e.stopPropagation();
	});
    $('body').on('click','.cancle',function(e){
    	e.stopPropagation();
        layer.close(layerModal);
    });
    $('.uniquetable').on('click','.view',function(){
        $(this).parents('tr').addClass('active');
        viewMenu($(this).attr("data-id"),'view');
    });
    $('.uniquetable').on('click','.edit',function(){
        $(this).parents('tr').addClass('active');
        viewMenu($(this).attr("data-id"),'edit');
    });
    $('.uniquetable').on('click','.delete',function(){
    	var id=$(this).attr("data-id");
        $(this).parents('tr').addClass('active');
    	layer.confirm('将执行删除操作?', {icon: 3, title:'提示',offset: '250px',end:function(){
            $('.uniquetable tr.active').removeClass('active');
        }}, function(index){
		  layer.close(index);
		  deleteMenu(id);
		});
    });
    //单选按钮点击事件
    $('body').on('click','.el-radio-input:not(.noedit)',function(e){
        $(this).parents('.el-radio-group').find('.el-radio-input').removeClass('is-radio-checked');
        $(this).addClass('is-radio-checked');     
    });
    $('body').on('click','.el-select',function(){
		$(this).find('.el-input-icon').toggleClass('is-reverse');
		$(this).siblings('.el-select-dropdown').toggle();
	});

	$('body').on('click','.el-select-dropdown-item',function(e){
		e.stopPropagation();
        $(this).parents('.el-form-item').find('.errorMessage').html('');
        $(this).parent().find('.el-select-dropdown-item').removeClass('selected');
        $(this).addClass('selected');
        if($(this).hasClass('selected')){
           var ele=$(this).parents('.el-select-dropdown').siblings('.el-select');
            ele.find('.el-input').val($(this).text());
            ele.find('.val_id').val($(this).attr('data-id'));
        }
		$(this).parents('.el-select-dropdown').hide().siblings('.el-select').find('.el-input-icon').removeClass('is-reverse');
	});
	//添加和编辑的提交
    $('body').on('click','.submit',function(e){
    	e.stopPropagation();
        if(!$(this).hasClass('is-disabled')){
            var parentForm=$(this).parents('#addMenu'),
            id=parentForm.find('#itemId').val(),
            flag=parentForm.attr("data-flag"),
            correct=0;
            for (var type in validatorConfig) {
                correct=validatorConfig[type]&&validatorToolBox[validatorConfig[type]](type);
                if(!correct){
                    break;
                }
            }
         	if(correct){
                $(this).addClass('is-disabled');
                var name=parentForm.find('#name').val().trim(),
                icon=parentForm.find('#icon').val().trim(),
                uri=parentForm.find('#uri').val().trim(),
                belong_to_uris=parentForm.find('#belong_to_uris').val().trim(),
                name=parentForm.find('#name').val().trim(),
                sort=parentForm.find('#sort').val().trim(),
                status=parentForm.find('.is-radio-checked .status').val(),
                parent_id=parentForm.find('#parent_id').val()||0;
	            $(this).hasClass('edit')?(
	                editMenu({
                        menu_id: id,
	                	name: name,
                        icon: icon,
                        uri: uri,
                        belong_to_uris: belong_to_uris,
                        sort: sort,
                        status: status,
                        _token: TOKEN 
	                })
	                ):(
	                addMenu({
	                    name: name,
                        icon: icon,
                        uri: uri,
                        belong_to_uris: belong_to_uris,
	                    parent_id: parent_id,
                        sort: sort,
                        status: status,
	                    _token: TOKEN 
	                })
	            )
            }
        }  
    });
    //输入框的相关事件
    $('body').on('focus','.el-input:not([readonly]),.el-textarea',function(){
    	$(this).parents('.el-form-item').find('.errorMessage').removeClass('active').html("");
    }).on('blur','.el-input:not([readonly]),.el-textarea',function(){
    	var flag=$('#addMenu').attr("data-flag"),
    	name=$(this).attr("id"),
    	id=$('#itemId').val();
        validatorConfig[name] 
        && validatorToolBox[validatorConfig[name]] 
        && validatorToolBox[validatorConfig[name]](name)
        && remoteValidatorConfig[name] 
        && remoteValidatorToolbox[remoteValidatorConfig[name]] 
        && remoteValidatorToolbox[remoteValidatorConfig[name]](name,flag,id);
    });
    //添加菜单配置
    $('.button_add').on('click',function(){
        menuModal('add');
    }); 
    $('.button_clear').on('click',function(){
        clearHistory();
    }); 
    $('.button_init').on('click',function(){
        initMenu();
    }); 
    //树形表格展开收缩
    $('body').on('click','.treeNode .itemIcon',function(){
    	if($(this).parents('.treeNode').hasClass('collasped')){
    		$(this).parents('.treeNode').removeClass('collasped').addClass('expand');
    		showChildren($(this).parents('.treeNode').attr("data-id"));
    	}else{
    		$(this).parents('.treeNode').removeClass('expand').addClass('collasped');
    		hideChildren($(this).parents('.treeNode').attr("data-id"));
    	}
    });
}

//查看和添加和编辑模态框
function menuModal(flag,data){
    var height=($(window).height()-200)+'px';
    var {id='',name='',icon='',uri='',belong_to_uris='',parent_id=0,sort=1,status=1,descendants_uris=''}={};
    if(data){
        ({id='',name='',icon='',uri='',belong_to_uris='',parent_id=0,sort=1,status=1,descendants_uris=''}=data);
    }
    var labelWidth=100,
        btnShow='btnShow',
        title='查看菜单',
        textareaplaceholder='',
        readonly='',
        noEdit='',
        yes='',
        no='';
    flag==='view'?(btnShow='btnHide',readonly='readonly="readonly"'):(flag==='add'?title='添加菜单':(title='编辑菜单',textareaplaceholder='',noEdit='readonly="readonly"'));
    status==1?yes='is-radio-checked':no='is-radio-checked';
    layerModal=layer.open({
      type: 1, 
      title: title,
      offset: '100px',
      area: '500px',
      shade: 0.1,
      shadeClose: false,
      resize: false,
      move: false,
      content: `<form class="addMenu formModal formMateriel" id="addMenu" data-flag="${flag}">
            <input type="hidden" id="itemId" value="${id}">
            <div class="modal-wrap" style="max-height: ${height};overflow-y: auto;">
              <div class="el-form-item">
                <div class="el-form-item-div">
                    <label class="el-form-item-label" style="width: ${labelWidth}px;">菜单名称<span class="mustItem">*</span></label>
                    <input type="text" autocomplete="off" id="name" class="el-input" placeholder="${flag=='view'?'':'请输入菜单名称'}" value="${name}">
                </div>
                <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
              </div>
              <div class="el-form-item">
                <div class="el-form-item-div">
                    <label class="el-form-item-label" style="width: ${labelWidth}px;">字体标签</label>
                    <input type="text" id="icon" class="el-input" placeholder="${flag=='view'?'':'请输入字体标签'}" value="${icon}">
                </div>
                <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
              </div>
              <div class="el-form-item select">
                <div class="el-form-item-div">
                    <label class="el-form-item-label" style="width: ${labelWidth}px;">上级菜单</label>
                    <div class="el-select-dropdown-wrap">
                        <div class="el-select">
                            <i class="el-input-icon el-icon el-icon-caret-top"></i>
                            <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                            <input type="hidden" class="val_id" id="parent_id" value="0">
                        </div>
                        <div class="el-select-dropdown">
                            <ul class="el-select-dropdown-list">
                                <li data-id="0" data-pid="0" class=" el-select-dropdown-item">--请选择--</li>
                            </ul>
                        </div>
                    </div>
                </div>
                <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
              </div>
              <div class="el-form-item">
                <div class="el-form-item-div">
                    <label class="el-form-item-label" style="width: ${labelWidth}px;">资源</label>
                    <input type="text" id="uri" class="el-input" placeholder="${flag=='view'?'':'请输入资源定位符'}" value="${uri}">
                </div>
                <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
              </div>
              <div class="el-form-item">
                <div class="el-form-item-div">
                    <label class="el-form-item-label" style="width: ${labelWidth}px;">归属资源</label>
                    <textarea type="textarea" id="belong_to_uris" rows="3" class="el-textarea" placeholder="${flag=='view'?'':'英文逗号隔开'}">${belong_to_uris}</textarea>
                </div>
                <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
              </div>
              <div class="el-form-item" style="display: ${flag=='view'?'block':'none'};">
                <div class="el-form-item-div">
                    <label class="el-form-item-label" style="width: ${labelWidth}px;">包含资源</label>
                    <textarea type="textarea" id="descendants_uris" rows="6" class="el-textarea" placeholder="">${tansferNull(descendants_uris)}</textarea>
                </div>
                <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
              </div>
              <div class="el-form-item">
                <div class="el-form-item-div-wrap">
                    <div class="el-form-item-div">
                        <label class="el-form-item-label" style="width: ${labelWidth}px;">排序<span class="mustItem">*</span></label>
                        <input type="number" id="sort" class="el-input" placeholder="${flag=='view'?'':'请输入排序'}" value="${sort}">
                    </div>
                    <div class="tipinfo"><i style="color: #ff7800;width: 15px;" class="el-icon fa-question-circle"></i><span class="tip">越低越靠前<i></i></span></div>
                </div>
                <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
              </div>
              <div class="el-form-item">
                <div class="el-form-item-div">
                    <label class="el-form-item-label" style="width: ${labelWidth}px;flex: none;">状态<span class="mustItem">*</span></label>
                    <div class="el-radio-group">
                        <label class="el-radio">
                            <span class="el-radio-input ${yes}">
                                <span class="el-radio-inner"></span>
                                <input class="status yes" type="hidden" value="1">
                            </span>
                            <span class="el-radio-label">激活</span>
                        </label>
                        <label class="el-radio">
                            <span class="el-radio-input ${no}">
                                <span class="el-radio-inner"></span>
                                <input class="status no" type="hidden" value="0">
                            </span>
                            <span class="el-radio-label">未激活</span>
                        </label>
                    </div>    
                </div>
                <p class="errorMessage" style="display: block;padding-left: ${labelWidth}px;"></p>
              </div>
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
        getMenuSelect(flag,data);
        if(flag=='view'){
            $('#addMenu .el-input,#addMenu .el-textarea').attr('readonly','readonly');
            $('.el-radio-input').addClass('noedit');
        }
    },
    end: function(){
        $('.uniquetable tr.active').removeClass('active');
        itemSelect=[];
    }
	}); 
}
//生成树结构
function treeHtml(fileData, parent_id, flag,value) {
    var _html = '';
    var children = getChildById(fileData, parent_id);
    var hideChild = parent_id > 0 ? 'none' : '';
    children.forEach(function (item, index) {
      var lastClass=index===children.length-1? 'last-tag' : '';
      var level = item.level;
      var distance,className,itemImageClass,tagI;
      var hasChild = hasChilds(fileData, item.id);
      hasChild ? (className='treeNode expand',itemImageClass='el-icon itemIcon') :(className='',itemImageClass='');
      flag==='table'? (distance=level * 25,tagI=`<i class="tag-i ${itemImageClass}"></i>`) : (distance=level * 20,tagI='');
      var selectedClass='';
      var span=level?`<div style="padding-left: ${distance}px;">${tagI}<span class="tag-prefix ${lastClass}"></span><span>${item.name}</span></div>`: `${tagI}<span>${item.name}</span>`;
      if(flag==='table'){
        var status=item.status==1?'<span class="el-status el-status-success">已激活</span>':
        '<span class="el-status">未激活</span>';
        var belong_to_uris=item.belong_to_uris.split(','),uris='';
        belong_to_uris.forEach(function(bitem){
            uris+=`<p title="${bitem}" class="overflow" style="max-width: 200px;">${bitem}</p>`;
        });
	      _html += `
	        <tr data-id="${item.id}" data-pid="${parent_id}" class="${className}">
	          <td>${span}</td>
              <td>${item.icon}</td>
              <td><div class="overflow" style="max-width: 220px;" title="${item.uri}">${item.uri}</div></td>
              <td><div class="uris-wrap">${uris}</div></td>
              <td>${item.sort}</td>
              <td>${status}</td>
	          <td class="right">
                <button data-id="${item.id}" data-pid="${parent_id}" class="button pop-button view">查看</button><button data-id="${item.id}" data-pid="${parent_id}" class="button pop-button edit">编辑</button><button data-id="${item.id}" data-pid="${parent_id}" class="button pop-button delete">删除</button></td>
            </tr>
	        ${treeHtml(fileData, item.id, flag)}
	        `;
    	}else{
    		item.id==value?(itemSelect.push(item),selectedClass='selected'):null;
    		_html += `
    		<li data-id="${item.id}" data-pid="${parent_id}" data-name="${item.name}" class="${className} el-select-dropdown-item ${selectedClass}">${span}</li>
	        ${treeHtml(fileData, item.id, flag,value)}
	        `;
    	}
    });
    return _html;
  };
