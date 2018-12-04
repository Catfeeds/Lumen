var layerLoading,
layerModal,
layerEle,
pageNo=1,
pageRoleNo=1,
totalPage=0,
pageSize=20,
roleData=[],
formerval='',
menuData=[],
ajaxData={},
ajaxRoleData={
	sort: 'id',
	order: 'desc'
},
grid_selector = "#grid-table",
pager_selector = "#grid-pager",
parent_column = $(grid_selector).closest('[class*="col-"]'),
validatorToolBox={
    checkNode: function(name){
        var value=$('#addNode_from').find('#'+name).val().trim(),
        origin=window.location.origin,
        href=origin+'/'+value;
        return $('#addNode_from').find('#'+name).parents('.el-form-item').find('.errorMessage').hasClass('active')?(!1):
        Validate.checkNull(value)?(showInvalidMessage(name,"权限路径不能为空"),!1):(!0);
    },
    checkName: function(name){
        var value=$('#addNode_from').find('#'+name).val().trim();
        return $('#addNode_from').find('#'+name).parents('.el-form-item').find('.errorMessage').hasClass('active')?(!1):
        Validate.checkNull(value)?(showInvalidMessage(name,"权限名称不能为空"),!1):
            value.length>100||value.length<2?(showInvalidMessage(name,"权限名称由2-100个字符组成"),!1):(!0);
    }
},
remoteValidatorToolbox={
    remoteCheckNode: function(flag,name){
        var value=$('#addNode_from').find('#'+name).val().trim();
        getUnique(flag,name,value,function(rsp){
            if(rsp.results&&rsp.results.exist){
                var val='已注册';
                showInvalidMessage(rsp.results.field,val);
            }
        });
    },
    remoteCheckName: function(flag,name){
        var value=$('#addNode_from').find('#'+name).val().trim();
        getUnique(flag,name,value,function(rsp){
            if(rsp.results&&rsp.results.exist){
                var val='已注册';
                showInvalidMessage(rsp.results.field,val);
            }
        });
    }
},
validatorConfig = {
    name: "checkName",
    node: "checkNode"
},remoteValidatorConfig={
    name: "remoteCheckName",
    node: "remoteCheckNode"
},
types=[{
    name: '免登录',
    type_id: 1
},{
    name: '免授权',
    type_id: 2
},{
    name: '需授权',
    type_id: 3
},{
    name: '管理型',
    type_id: 4
}];
$(function(){
	resetParam();
	getGridData();
	getMenu();
	initGrid();
	//trigger window resize to make the grid get the correct size
	bindEvent();
    $(window).triggerHandler('resize.jqGrid');

});

//显示错误信息
function showInvalidMessage(name,val){
    $('#addNode_from').find('#'+name).parents('.el-form-item').find('.errorMessage').addClass('active').html(val);
    $('#addNode_from').find('.submit').removeClass('is-disabled');
}

//重置搜索参数
function resetParam(){
    ajaxData={
        type: '',
        menu_id: '',
        node: '',
        name: '',
        status: '',
        order: 'asc',
        sort: 'node'
    };
}
//分页
function bindPagenationClick(totalData,pageSize,pageno,flag){
    $('#pagenation.'+flag).show();
    $('#pagenation.'+flag).pagination({
        totalData:totalData,
        showData:pageSize,
        current: pageno,
        isHide: true,
        coping:true,
        homePage:'首页',
        endPage:'末页',
        prevContent:'上页',
        nextContent:'下页',
        jump: true,
        callback:function(api){
            pageno=api.getCurrent();
            if(flag=='role'){
            	pageRoleNo=pageno;
            	getRoleList();
            }else{
            	pageNo=pageno;
            	getGridData();
            }
        }
    });
}

//获取权限列表
function getGridData(){
	var urlLeft='';
    for(var param in ajaxData){
        urlLeft+=`&${param}=${ajaxData[param]}`;
    }
    urlLeft+="&page_no="+pageNo+"&page_size="+pageSize;
	AjaxClient.get({
		url: URLS['node'].list+'?'+_token+urlLeft,
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
            $(grid_selector).jqGrid('clearGridData',true);
            if(rsp&&rsp.results&&rsp.results.length){
            	$('p.noData').addClass('none');
	            $(grid_selector)[0].addJSONData(rsp.results);
            }else{
            	$('p.noData').removeClass('none');
            }
            if(totalData>pageSize){
                bindPagenationClick(totalData,pageSize,pageNo,'node');
            }else{
                $('.node').find('#pagenation').html('');
            }  
		},
		fail: function(rsp){
			layer.close(layerLoading);
            if(layerModal!=undefined){
                layer.close(layerModal);
            }
            $(grid_selector).jqGrid('clearGridData',true);
            $('p.noData').removeClass('none');
		},
		complete: function(){
			$('#searchNode_from .submit,#searchNode_from .reset').removeClass('is-disabled');
		}
	},this);
}
//获取权限路径
function getNodePath(){

}
//获取一级菜单
function getMenu(){
	AjaxClient.get({
		url: URLS['menu'].select+'?'+_token,
		dataType: 'json',
		beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
		success: function(rsp){
			layer.close(layerLoading);
			if(rsp&&rsp.results&&rsp.results.length){
				menuData=rsp.results;
                var lis=treeHtml(rsp.results,0,'none','');
                $('#searchForm .el-form-item.menu .el-select-dropdown-list').append(lis);
			}
		},
		fail: function(rsp){
			layer.close(layerLoading);
            console.log('获取目录失败');
		}
	},this);
}
//添加权限
function addNode(data){
	AjaxClient.post({
        url: URLS['node'].store,
        data: data,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            layer.close(layerModal);
            pageNo=1;
            getGridData();
        },
        fail: function(rsp){
            layer.close(layerLoading);
            if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                LayerConfig('fail',rsp.message);
            }
            if(rsp&&rsp.field!==undefined){
                showInvalidMessage(rsp.field,rsp.message);
            }
            $('#addNode_from').find('.submit').removeClass('is-disabled');
            console.log('添加失败');
        },
    },this)
}

//编辑权限
function editNode(data,rowInfo){
	AjaxClient.post({
        url: URLS['node'].edit,
        data: data,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
        },
        fail: function(rsp){
            layer.close(layerLoading);
            console.log('编辑失败');
            if(rsp&&rsp.message!=undefined&&rsp.message!=null){
        		LayerConfig('fail',rsp.message);
            }
            if(rsp&&rsp.code=='913'){
                $(grid_selector).jqGrid('setCell',rowInfo.id,rowInfo.name,rowInfo.formerval,'',{},true);
            }
        },
    },this)
}

//删除权限
function deleteNode(id,leftNum){
	AjaxClient.get({
        url: URLS['node'].delete+"?"+_token+"&node_id="+id,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            if(leftNum==1){
                pageNo--;
                pageNo?null:(pageNo=1);
            }
            getGridData();
        },
        fail: function(rsp){
            layer.close(layerLoading);
            if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                LayerConfig('fail',rsp.message);
            }
            if(rsp&&rsp.code==404){
                pageNo? null:pageNo=1;
                getGridData();
            }
        }
    },this);
}

//检测唯一性
function getUnique(flag,field,value,fn){
    var urlLeft='';
    if(flag==='edit'){
        urlLeft=`&field=${field}&value=${value}&id=${attrid}`;
    }else{
        urlLeft=`&field=${field}&value=${value}`;
    }
    var xhr=AjaxClient.get({
        url: URLS['node'].unique+"?"+_token+urlLeft,
        dataType: 'json',
        beforeSend: function(){
            // layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            // layer.close(layerLoading);
            fn && typeof fn==='function'? fn(rsp):null;
        },
        fail: function(rsp){
            // layer.close(layerLoading);
            console.log('唯一性检测失败');
        }
    },this);
}

//获取角色列表
function getRoleList(){
    var urlLeft='';
    for(var param in ajaxRoleData){
        urlLeft+=`&${param}=${ajaxRoleData[param]}`;
    }
    urlLeft+="&page_no="+pageRoleNo+"&page_size=10";
	AjaxClient.get({
		url: URLS['role'].list+"?"+_token+urlLeft,
		dataType: 'json',
		beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
		success: function(rsp){
			layer.close(layerLoading);
            var totalData=rsp.paging.total_records;
            createRoleHtml(rsp);
            if(totalData>10){
                bindPagenationClick(totalData,10,pageRoleNo,'role');
            }else{
                $('#pagenation.role').html('');
            }   
		},
		fail: function(rsp){
			layer.close(layerLoading);
			$('#addRole .table_tbody').html('<tr><td colspan="3" style="text-align: center;">获取功能列表失败</td></tr>');
		},
        complete: function(){
            $('#addRole .choose-role').removeClass('is-disabled');
        }
	},this);
}

//获取选中
function getRoleSelected(id){
	AjaxClient.get({
		url: URLS['node'].selectdRole+"?"+_token+"&node_id="+id,
		dataType: 'json',
		beforeSend: function(){
            // layerLoading = LayerConfig('load');
        },
		success: function(rsp){
			// layer.close(layerLoading);
            if(rsp&&rsp.results&&rsp.results.length){
            	roleData=rsp.results;
            }else{
            	roleData=[];
            }
            getRoleList();
		},
		fail: function(rsp){
			console.log('获取选中的功能失败');
		}
	},this);
}

//保存角色
function saveRole(data){
	AjaxClient.post({
        url: URLS['node'].saveRole,
        data: data,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            layer.close(layerModal);
        },
        fail: function(rsp){
            layer.close(layerLoading);
            if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                LayerConfig('fail',rsp.message);
            }
            console.log('赋予功能失败');
        },
    },this)
}

function createRoleHtml(rsp){
	var ele=$('#addRole .table_tbody');
	ele.html('');
	if(rsp&&rsp.results&&rsp.results.length){
		rsp.results.forEach(function(item,index){
	    	var status=item.status==1?'<span class="el-status el-status-success">已激活</span>':
	    	'<span class="el-status">已停用</span>',
	    	checkbox=`<span class="el-checkbox_input ${roleData.indexOf(item.role_id)>-1?'is-checked':''}">
                        <span class="el-checkbox-outset"></span>
                    </span>`;
	        var tr=`
	            <tr class="tritem" data-id="${item.role_id}">
	                <td>${item.name}</td>
	                <td>${status}</td>
	                <td class="right">${checkbox}</td>
	            </tr>
	        `;
	        ele.append(tr);
	        ele.find('tr:last-child').data("roleData",item);
	    });
	}else{
		var tr=`<tr><td colspan="3" style="text-align: center;">暂无数据</td></tr>`;
		ele.append(tr);
	}
}

//初始化可编辑表格
function initGrid(){
    var typeclass=''
	jQuery(grid_selector).jqGrid({
		datatype: "local",
		height: 'auto',
		cellEdit: true,
		forceFit: true,
		cellsubmit: 'clientArray',
		colNames:['权限路径','权限名称','权限类型','菜单名称', '状态','操作'],
		colModel:[
			{name:'node',index:'node',sortable: false, classes: 'break-word auto-click'},
			{name:'name',index:'name',sortable: false, editable: true,classes: 'can-edit edit-name', edittype:"text",
                formatter:function(cellvalue,options,rowObject){
                    return $.trim(cellvalue);
                }
            },
			{name:'type',index:'type',sortable: false, width: 90,classes: 'auto-complete can-edit type', editable: true,edittype:"text",editoptions:{size:"20",maxlength:"30"},
			unformat: typeInput,
				formatter:function(cellvalue,options,rowObject){
                    var typeids=getTypeIds();
                    if(typeids.indexOf(cellvalue)>-1){
                        var value=getFilterType(cellvalue)[0].name;
                        return value;
                    }else{
                        return cellvalue;
                    }
				},
			},
			{name:'menu_name',index:'menu_name',sortable: false, classes: 'auto-complete can-edit',edittype:"text", editable: true,editoptions:{size:"20",maxlength:"30"},
			unformat: autoInput
            },
			{name:'status',index:'status',sortable: false, width: 80,classes: 'can-edit', editable: true,edittype:"checkbox",editoptions: {value:"1:0"},unformat: aceSwitch,
				formatter:function(cellvalue,options,rowObject){
					return cellvalue==1?'<span class="noclick" style="color: green;">启用</span>':'<span class="noclick">关闭</span>';
				}
			},
			{name:'myac',index:'',sortable: false, classes: 'td-action', width: 160, fixed:true, sortable:false, resize:false,
				formatter:function(cellvalue,options,rowObject){
                    var btn=rowObject.type==3?`<button data-id="${rowObject.node_id}" class="button pop-button choose-role">赋予功能</button>`:'';
					return `${btn}<button data-id="${rowObject.node_id}" class="button pop-button delete">删除</button>`
				}
			}
		], 
		viewrecords : false,
		rowNum: pageSize,
		pager : '',
		altRows: true,
        gridComplete: function(){
            $(grid_selector).find('tr.jqgrow').each(function(){
                var ele=$(this).find('td.type');
                if(ele.text()=='管理型'){
                    ele.addClass('yellow');
                }else if(ele.text()=='免登录'){
                    ele.addClass('purple');
                }else if(ele.text()=='免授权'){
                    ele.addClass('red');
                }
            });
        },
		afterEditCell: function (id,name,val,iRow,iCol){
			var tval='';
			formerval=val;
	    	if(name=='status'){
                tval=$(val).text();
	    		tval=='关闭'?formerval=0:formerval=1;
	    	}
	    },
	    afterSaveCell : function(rowid,name,val,iRow,iCol) {
            var trim_val=$.trim(val),
            trim_formerval=$.trim(formerval);   	
	    	if(trim_val!=""&&trim_val!=trim_formerval){
                if(name=='menu_name'){
                    name='menu_id';
                    if(trim_val=='--请选择--'){
                        trim_val=0;
                        $(grid_selector).jqGrid('setCell',rowid,'menu_name','','',{},true);
                    }else{
                        trim_val=getFilterMenu(menuData,trim_val)[0].menu_id;
                    }
                }
                if(name=='type'){
                    trim_val=getFilterTypeName(trim_val)[0].type_id;
                    if(trim_val==1){
                        $(grid_selector).find('tr[id='+rowid+'] td.type').removeClass('red yellow').addClass('purple');
                    }else if(trim_val==2){
                        $(grid_selector).find('tr[id='+rowid+'] td.type').removeClass('purple yellow').addClass('red');
                    }else if(trim_val==4){
                        $(grid_selector).find('tr[id='+rowid+'] td.type').removeClass('red purple').addClass('yellow');
                    }else{
                        $(grid_selector).find('tr[id='+rowid+'] td.type').removeClass('yellow red purple');
                        $(grid_selector).find('tr[id='+rowid+'] td.td-action').html(`<button data-id="${rowid}" class="button pop-button choose-role">赋予功能</button><button data-id="${rowid}" class="button pop-button delete">删除</button>`);
                    }
                    if(trim_val!=3){
                        $(grid_selector).find('tr[id='+rowid+'] td.td-action').html(`<button data-id="${rowid}" class="button pop-button delete">删除</button>`);
                    }
                } 
	    		editNode({
		    		pk: rowid,
		    		field: name,
		    		value: trim_val,
		    		_token: TOKEN
		    	},{id: rowid,col: iCol,name: name,formerval: trim_formerval});
	    	}else if(trim_val==''&&trim_formerval!=''){
                $(grid_selector).jqGrid('setCell',rowid,name,trim_formerval,'',{});
            }
	    },
		caption: "",
		autowidth: true
	});
}

//生成树结构
function treeHtml(fileData, parent_id, flag,value) {
    var _html = '';
    var children = getChildById(fileData, parent_id);
    children.forEach(function (item, index) {
      var lastClass=index===children.length-1? 'last-tag' : '';
      var level = item.level;
      var distance=level * 25,
      className='',
      selectedClass='',
      flagClass='';
      flag=='auto'?(flagClass='el-auto',distance=level*20):null;
      var hasChild = hasChilds(fileData, item.id);
      hasChild ? (className='treeNode expand') :(className='');
      var span=level?`<div style="padding-left: ${distance}px;"><span class="tag-prefix ${lastClass}"></span><span>${item.name}</span></div>`: `<span>${item.name}</span>`;
      item.name==value?(selectedClass='selected'):null;
      _html += `<li data-id="${item.id}" data-pid="${parent_id}" class="${className} el-select-dropdown-item ${selectedClass} ${flagClass}">${span}</li>${treeHtml(fileData, item.id, flag,value)}`;
    });
    return _html;
  };

function getFilterMenu(dataArr,type){
    return dataArr.filter(function (e) {
        return e.name == type;
    });
}

function getTypeIds(){
    var ids=[];
    types.forEach(function(item){
        ids.push(item.type_id);
    });

    return ids;
}

function getFilterType(type){
    return types.filter(function(e){
        return e.type_id == type;
    });
}

function getFilterTypeName(type){
    return types.filter(function(e){
        return e.name==type;
    })
}

function typeInput(cellvalue,options,cell){
    var lis='';
    types.forEach(function(item){
        lis+=`<li data-id="${item.type_id}" class="el-select-dropdown-item el-auto ${cellvalue==item.name?'selected':''}">${item.name}</li>`;
    });
    setTimeout(function(){
    $(cell).
        find('input[type=text]')
            .addClass('el-input auto').attr('readonly','readonly').wrap(`<div class="el-form-item"><div class="el-select-dropdown-wrap menu"><div class="el-select"></div></div></div>`)
            .before(`<i class="el-input-icon el-icon el-icon-caret-top"></i>`)
            .after(`<input type="hidden" class="val_id" id="type_id" value="">`)
            .parent()
            .after(`<div class="el-select-dropdown"><ul class="el-select-dropdown-list" style="max-height: 130px;">${lis}</ul></div>`);

    }, 0);
}

function autoInput(cellvalue,options,cell){
    var lis=treeHtml(menuData,0,'auto',cellvalue);
    // menuData.forEach(function(item){
    //     lis+=`<li data-id="${item.menu_id}" class="el-select-dropdown-item el-auto ${cellvalue==item.name?'selected':''}">${item.name}</li>`;
    // });
    setTimeout(function(){
    $(cell).
        find('input[type=text]')
			.addClass('el-input auto').attr('readonly','readonly').wrap(`<div class="el-form-item"><div class="el-select-dropdown-wrap menu"><div class="el-select"></div></div></div>`)
            .before(`<i class="el-input-icon el-icon el-icon-caret-top"></i>`)
            .after(`<input type="hidden" class="val_id" id="menu_id" value="">`)
            .parent()
			.after(`<div class="el-select-dropdown" style="max-height: 120px;min-width: 250px;"><ul class="el-select-dropdown-list" style="max-height: 120px;"><li data-id="0" class="el-select-dropdown-item el-auto kong">--请选择--</li>${lis}</ul></div>`);

	}, 0);
}

function aceSwitch( cellvalue, options, cell ) {
	setTimeout(function(){
		cellvalue=='启用'?cellvalue=1:cellvalue=0;
		$(cell).find('input[type=checkbox]').prop('checked',cellvalue)
			.addClass('ace ace-switch ace-switch-5')
			.after('<span class="lbl"></span>');
	}, 0);
}

//添加权限弹层
function NodeModal(){
    var height=($(window).height()-200)+'px';
    var labelWidth=84,
        btnShow='btnShow',
        title='添加权限',
        unitHtml='',
        dataTypeHtml='';
    
    layerModal=layer.open({
      type: 1, 
      title: title,
      offset: '100px',
      area: '500px',
      shade: 0.1,
      shadeClose: false,
      resize: false,
      move: false,
      content: `<form id="addNode_from" class="formModal formMateriel">
                <div class="modal-wrap">
                	<div class="el-form-item">
						<div class="el-form-item-div" id="dataTypeDiv">
							<label class="el-form-item-label" style="width: ${labelWidth}px;">权限类型<span class="mustItem">*</span></label>
							<div class="el-select-dropdown-wrap">
				                <div class="el-select">
				                    <i class="el-input-icon el-icon el-icon-caret-top"></i>
				                    <input type="text" readonly="readonly" class="el-input" value="需授权">
				                    <input type="hidden" class="val_id" id="type" value="3">
				                </div>
				                <div class="el-select-dropdown" style="width: 396px;max-height: 165px;">
			                        <ul class="el-select-dropdown-list">
			                        	<li data-id="1" class="el-select-dropdown-item">免登录</li>
			                        	<li data-id="2" class="el-select-dropdown-item">免授权</li>
                                        <li data-id="3" class="el-select-dropdown-item selected">需授权</li>
                                        <li data-id="4" class="el-select-dropdown-item">管理型</li>
			                        </ul>
			                    </div>
				            </div>
						</div>
						<p class="errorMessage" style="padding-left: 20px;"></p>
					</div>
                    <div class="el-form-item menu">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="width: ${labelWidth}px;">菜单名称</label>
                            <div class="el-select-dropdown-wrap">
                                <div class="el-select">
                                    <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                    <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                                    <input type="hidden" class="val_id" id="menu_id" value="">
                                </div>
                                <div class="el-select-dropdown" style="width: 396px;">
                                    <ul class="el-select-dropdown-list" style="max-height: 165px;">
                                        <li data-id="0" class="el-select-dropdown-item kong" class=" el-select-dropdown-item">--请选择--</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
                    </div>
                    <div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="width: ${labelWidth}px;">权限名称<span class="mustItem">*</span></label>
                            <input type="text" id="name" class="el-input" placeholder="由2-100个字符组成" value="">
                        </div>
                        <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
                    </div>
                    <div class="el-form-item node">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="width: ${labelWidth}px;">权限路径<span class="mustItem">*</span></label>
                            <div class="el-select-dropdown-wrap">
                                <input type="text" id="node" class="el-input" autocomplete="off" placeholder="请输入权限路径" value="">
                            </div>
                        </div>
                        <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
                    </div>
                    <div class="el-form-item">
						<div class="el-form-item-div">
							<label class="el-form-item-label" style="width: ${labelWidth}px;">状态</label>
							<div class="el-radio-group">
								<label class="el-radio">
									<span class="el-radio-input is-radio-checked">
										<span class="el-radio-inner"></span>
										<input class="status yes" type="hidden" value="1">
									</span>
									<span class="el-radio-label">启用</span>
								</label>
								<label class="el-radio">
									<span class="el-radio-input">
										<span class="el-radio-inner"></span>
										<input class="status no" type="hidden" value="0">
									</span>
									<span class="el-radio-label">关闭</span>
								</label>
							</div>    
						</div>
					</div>                   
                </div>
                <div class="el-form-item ${btnShow}">
                    <div class="el-form-item-div btn-group" id="material_attribute_add">
                        <button type="button" class="el-button el-button--primary submit add">确定</button>
                    </div>
                </div>
            </form>` ,
        success: function(layero,index){
            layerEle=layero;
            // var lis=createMenuList();
            var lis=treeHtml(menuData,0,'none','');
            $('#addNode_from .el-form-item.menu .el-select-dropdown-list').append(lis);

            $(layero).find('#node').autocomplete({
                url: URLS['node'].list+"?"+_token+"&page_no=1&page_size=10",
                param: 'node'
            });
        },
        end: function(){
            layerEle='';
        }
    }); 
}

function addRoleModal(id) {
    layerModal = layer.open({
        type: 1,
        title: '选择功能',
        offset: '100px',
        area: '650px',
        shade: 0.1,
        shadeClose: false,
        resize: false,
        move: false,
        content:`<form class="addRole formModal chooseModal" id="addRole">
        <input type="hidden" id="nodeId" value="${id}">
           <ul class="query-item">
                <li>
                    <div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label">功能名称</label>
                            <input type="text" id="name" class="el-input" placeholder="请输入功能名称" value="">
                        </div>
                    </div>
                    <div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label">状态</label>
                            <div class="el-select-dropdown-wrap">
                                <div class="el-select">
                                    <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                    <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                                    <input type="hidden" class="val_id" id="status" value="">
                                </div>
                                <div class="el-select-dropdown">
                                    <ul class="el-select-dropdown-list">
                                        <li data-id="" class="el-select-dropdown-item kong" data-name="--请选择--">--请选择--</li>
                                        <li data-id="1" class=" el-select-dropdown-item"><span>已激活</span></li>
                                        <li data-id="0" class=" el-select-dropdown-item"><span>已停用</span></li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="el-form-item" style="width: 10%;">
                        <div class="el-form-item-div btn-group">
                            <button style="margin-top: 5px;" type="button" class="el-button choose-search choose-role">搜索</button>
                        </div>
                    </div>
                </li>
            </ul>
           <div class="table_page">
                <div id="pagenation" class="pagenation role"></div>
                <table class="sticky uniquetable commontable">
                  <thead>
                    <tr>
                      <th>功能名称</th>
                      <th>功能状态</th>
                      <th class="right">选择</th>
                    </tr>
                  </thead>
                  <tbody class="table_tbody">
                  </tbody>
                </table>
          </div>
          <div class="el-form-item">
            <div class="el-form-item-div btn-group" style="margin-top: 10px;">
                <button type="button" class="el-button el-button--primary ma-item-ok submit">确定</button>
            </div>
          </div>       
    </form>`,
    success: function(layero, index){
    	getLayerSelectPosition($(layero));
    	getRoleSelected(id);
    },
    cancel: function(layero, index){//右上角关闭按钮
    },
    end: function(){
    	pageRoleNo=1;
    	ajaxRoleData={
    		sort: 'id',
			order: 'desc'
    	};
    	roleData=[];
    }

    })
}

function createMenuList(){
	var lis='';
    menuData.forEach(function(item){
        lis+=`<li data-id="${item.menu_id}" class="el-select-dropdown-item">${item.name}</li>`;
    });

    return lis;
}

function bindEvent(){
	//resize to fit page size
	$(window).on('resize.jqGrid', function () {
		$(grid_selector).jqGrid( 'setGridWidth', parent_column.width() );
    });
    //resize on sidebar collapse/expand
    $(document).on('settings.ace.jqGrid' , function(ev, event_name, collapsed) {
		if( event_name === 'sidebar_collapsed' || event_name === 'main_container_fixed' ) {
			//setTimeout is for webkit only to give time for DOM changes and then redraw!!!
			setTimeout(function() {
				$(grid_selector).jqGrid( 'setGridWidth', parent_column.width() );
			}, 20);
		}
    });
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

	//checkbox 点击
    $('body').on('click','.el-checkbox_input:not(.noedit)',function (e) {
    	$(this).toggleClass('is-checked');
    	var data=$(this).parents('.tritem').data('roleData'),
    	index=roleData.indexOf(data.role_id);
    	if($(this).hasClass('is-checked')){
    		if(index==-1){
    			roleData.push(data.role_id);
    		}
    	}else{
    		roleData.splice(index,1);
    	}
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
    //搜索
    $('body').on('click','#searchForm .submit:not(".is-disabled")',function(e){
    	e.stopPropagation();
        $('#searchForm .el-item-hide').slideUp(400,function(){
             $('#searchForm .el-item-show').css('background','transparent');
        });
        $('.arrow .el-input-icon').removeClass('is-reverse');
        if(!$(this).hasClass('is-disabled')){
            $(this).addClass('is-disabled');
            var parentForm=$(this).parents('#searchForm');
            pageNo=1;
            ajaxData={
                type: parentForm.find('#type').val(),
                menu_id: parentForm.find('#menu_id').val().trim(),
                node: parentForm.find('#node').val().trim(),
                name: parentForm.find('#name').val(),
                status: parentForm.find('#status').val(),
                order: 'asc',
                sort: 'node'
            }
            getGridData();
        }  
    });
    //重置搜索框值
    $('body').on('click','#searchForm .reset:not(.is-disabled)',function(e){
        e.stopPropagation();
        $(this).addClass('is-disabled');
        var parentForm=$(this).parents('#searchForm');
        parentForm.find('#type').val('').siblings('.el-input').val('--请选择--');
        parentForm.find('#menu_id').val('').siblings('.el-input').val('--请选择--');
        parentForm.find('#node').val('');
        parentForm.find('#name').val('').siblings('.el-input').val('--请选择--');
        parentForm.find('#status').val('').siblings('.el-input').val('--请选择--');
        $('.el-select-dropdown-item').removeClass('selected');
        $('.el-select-dropdown').hide();
        pageNo=1;
        resetParam();
        getGridData();
    });

    //添加
    $('body').on('click','.button_add',function(){
        NodeModal('add');
    });
    $('body').on('click','.el-select:not(.noedit)',function(){
        $(this).find('.el-input-icon').toggleClass('is-reverse');
        $(this).parents('.el-form-item').siblings().find('.el-select-dropdown').hide();
        $(this).parents('.el-form-item').siblings().find('.el-select .el-input-icon').removeClass('is-reverse');
        $(this).siblings('.el-select-dropdown').toggle();
    });

    //下拉列表项点击事件
    $('body').on('click','.el-select-dropdown-item:not(disabled)',function(e){
        e.stopPropagation();
        $(this).parent().find('.el-select-dropdown-item').removeClass('selected');
        $(this).addClass('selected');
        var ele=$(this).parents('.el-select-dropdown').siblings('.el-select');
        var idval=$(this).attr('data-id');
        ele.find('.el-input').val($(this).text());
        ele.find('.val_id').val(idval);
        if($(this).hasClass('el-auto')){
            if(ele.parents('td.auto-complete').length){//表格的选择
            	ele.parents('td').siblings('td.auto-click').click();
            }
        }
        $(this).parents('.el-select-dropdown').hide();
    });
    //单选按钮点击事件
	$('body').on('click','.formMateriel:not(".disabled") .el-radio-input',function(e){
		$(this).parents('.el-radio-group').find('.el-radio-input').removeClass('is-radio-checked');
		$(this).addClass('is-radio-checked');     
	});
    //输入框的相关事件
    $('body').on('focus','#addNode_from .el-input:not([readonly])',function(){
        $(this).parents('.el-form-item').find('.errorMessage').html("").removeClass('active');
    }).on('blur','#addNode_from .el-input:not([readonly],.auto)',function(){
        var name=$(this).attr("id");
        validatorConfig[name] 
        && validatorToolBox[validatorConfig[name]] 
        && validatorToolBox[validatorConfig[name]](name)
        && remoteValidatorConfig[name] 
        && remoteValidatorToolbox[remoteValidatorConfig[name]] 
        && remoteValidatorToolbox[remoteValidatorConfig[name]]('add',name);
    });

    $('body').on('click','.pop-button.delete',function(){
    	var leftNum=$('#grid-table tbody tr').length,
    	id=$(this).attr("data-id");
    	layer.confirm('将执行删除操作?', {icon: 3, title:'提示',offset: '250px'}, function(index){
		  layer.close(index);
		  deleteNode(id,leftNum);
		});
    });

    $('body').on('click','.pop-button.choose-role',function(){
    	var id=$(this).attr('data-id');
    	addRoleModal(id);
    });

    //添加节点
    $('body').on('click','#addNode_from .submit',function () {
        if(!$(this).hasClass('is-disabled')){
            var parentForm = $(this).parents('#addNode_from');
            var correct=1;
            for (var type in validatorConfig) {
            	correct=validatorConfig[type]&&validatorToolBox[validatorConfig[type]](type);
                if(!correct){
                    break;
                }
            }
            if(correct){
            	$(this).addClass('is-disabled');
            	var type = parentForm.find('#type').val(),
	            	menu_id = parentForm.find('#menu_id').val().trim(),
	            	name = parentForm.find('#name').val().trim(),
	            	node = parentForm.find('#node').val().trim(),
	            	status = parentForm.find('.is-radio-checked .status').val();
	            addNode({
	            	type: type,
	            	menu_id: menu_id,
	            	name: name,
	            	node: node,
	            	status: status,
	            	_token: TOKEN
	            });
            }
            
        }
    });

    //搜索角色
    $('body').on('click','#addRole .choose-role',function () {
        if(!$(this).hasClass('is-disabled')){
        	$(this).addClass('is-disabled');
        	var ele=$('#addRole');
        	ajaxRoleData.name=ele.find('#name').val().trim();
        	ajaxRoleData.status=ele.find('#status').val();
        	pageRoleNo=1;
        	getRoleList();
        }
    });

    //选择角色
    $('body').on('click','#addRole .submit',function () {
        if(!$(this).hasClass('is-disabled')){
            var roleids=roleData.length?roleData:'';
        	var data={
        		node_id: $('#nodeId').val(),
        		role_ids: roleids,
        		_token: TOKEN
        	}
        	saveRole(data);
        }
    });

}
		