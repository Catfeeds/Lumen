var layerModal,
layerLoading,
pageNo=1,
pageNodeNo=1,
nodeData=[],
pageSize=20,
ajaxData={},
ajaxNodeData={
    type: '',
    menu_id: '',
    node: '',
    name: '',
    status: '',
    order: 'asc',
    sort: 'node'
},
layerEle='',
validatorToolBox={
    checkName: function(name){
        var value=$('#addRole_from').find('#'+name).val().trim();
        return $('#addRole_from').find('#'+name).parents('.el-form-item').find('.errorMessage').hasClass('active')?(!1):
        Validate.checkNull(value)?(showInvalidMessage(name,"名称不能为空"),!1):
        value.length>50||value.length<2?(showInvalidMessage(name,'2-15个字符组成'),!1):
        (!0);
    }
},
remoteValidatorToolbox={
    remoteCheckName: function(flag,name){
        var value=$('#addRole_from').find('#'+name).val().trim();
        getUnique(flag,name,value,function(rsp){
            if(rsp.results&&rsp.results.exist){
                var val='已注册';
                showInvalidMessage(name,val);
            }
        });
    }
},
validatorConfig = {
    name: "checkName"
},remoteValidatorConfig={
    name: "remoteCheckName"
};
$(function(){
    resetParam();
	getRoleList();
	bindEvent();
});

//显示错误信息
function showInvalidMessage(name,val){
    $('#addRole_from').find('#'+name).parents('.el-form-item').find('.errorMessage').addClass('active').html(val);
    $('#addRole_from').find('.submit').removeClass('is-disabled');
}

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
                pageNo=pageno;
                getRoleList();
            }else{
                pageNodeNo=pageno;
                getNodeList();
            }
        }
    });
}

//重置搜索参数
function resetParam(){
    ajaxData={
        name: '',
        status: '', 
        order: 'desc',
        sort: 'id'
    };
}

//获取角色列表
function getRoleList(){
    var urlLeft='';
    for(var param in ajaxData){
        urlLeft+=`&${param}=${ajaxData[param]}`;
    }
    urlLeft+="&page_no="+pageNo+"&page_size="+pageSize;
    $('.table_tbody').html('');
	AjaxClient.get({
		url: URLS['role'].list+"?"+_token+urlLeft,
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
                noData('暂无数据',4);                
            }  
            if(totalData>pageSize){
                bindPagenationClick(totalData,pageSize,pageNo,'role');
            }else{
                $('#pagenation').html('');
            }   
		},
		fail: function(rsp){
			layer.close(layerLoading);
            if(layerModal!=undefined){
                layer.close(layerModal);
            }
			noData('获取功能列表失败，请刷新重试',4);
		},
        complete: function(){
            $('#searchRole_from .submit,#searchRole_from .reset').removeClass('is-disabled');
        }
	},this);
}

//删除角色
function deleteRole(id,leftNum){
    AjaxClient.get({
        url: URLS['role'].delete+"?"+_token+"&role_id="+id,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            // LayerConfig('success','删除成功啦');
            if(leftNum==1){
                pageNo--;
                pageNo?null:(pageNo=1);
            }
            getRoleList();
        },
        fail: function(rsp){
            layer.close(layerLoading);
            if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                LayerConfig('fail',rsp.message);
            }
            if(rsp&&rsp.code==404){
                pageNo? null:pageNo=1;
                getRoleList();
            }
        }
    },this);
}

//添加角色
function addRole(data){
    AjaxClient.post({
        url: URLS['role'].store,
        data: data,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            layer.close(layerModal);
            getRoleList();
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
            $('#addRole_from').find('.submit').removeClass('is-disabled');
        }
    },this);
}
//查看角色
function getRole(id,flag){
    AjaxClient.get({
        url: URLS['role'].show+"?"+_token+"&role_id="+id,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            range=rsp.results.range;
            RoleModal(flag,rsp.results);
        },
        fail: function(rsp){
            layer.close(layerLoading);
            console.log('获取属性详情失败');
        }
    },this);
}

//编辑角色
function editRole(data){
    AjaxClient.post({
        url: URLS['role'].update,
        data: data,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            layer.close(layerModal);
            getRoleList();
        },
        fail: function(rsp){
            layer.close(layerLoading); 
            if(rsp&&rsp.field!==undefined&&rsp.message){
                showInvalidMessage(rsp.field,rsp.message);
            }else{
                if(rsp&&rsp.message!=undefined&&rsp.message!=null){
                    LayerConfig('fail',rsp.message);
                }else{
                    LayerConfig('fail','编辑失败');
                }
            }
            $('#addRole_from').find('.submit').removeClass('is-disabled');
        }
    },this);
}

//检测唯一性
function getUnique(flag,field,value,fn){
    var urlLeft='';
    if(flag==='edit'){
    	var id=$('#itemId').val();
        urlLeft=`&field=${field}&value=${value}&id=${id}`;
    }else{
        urlLeft=`&field=${field}&value=${value}`;
    }
    var xhr=AjaxClient.get({
        url: URLS['role'].unique+"?"+_token+urlLeft,
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
            if(rsp&&rsp.results){
                var lis=treeHtml(rsp.results,0,'none','');
                $('#addNode .el-form-item.menu .el-select-dropdown-list').append(lis);
            }
        },
        fail: function(rsp){
            layer.close(layerLoading);
            console.log('获取一级目录失败');
        }
    },this);
}

//获取权限列表
function getNodeList(){
    var urlLeft='';
    for(var param in ajaxNodeData){
        urlLeft+=`&${param}=${ajaxNodeData[param]}`;
    }
    urlLeft+="&page_no="+pageNodeNo+"&page_size=10";
    AjaxClient.get({
        url: URLS['node'].select+'?'+_token+urlLeft,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            layer.close(layerLoading);
            var totalData=rsp.paging.total_records;
            createNodeHtml(rsp);
            if(totalData>10){
                bindPagenationClick(totalData,10,pageNodeNo,'node');
            }else{
                $('#pagenation.node').html('');
            }   
        },
        fail: function(rsp){
            layer.close(layerLoading);
            $('#addNode .table_tbody').html('<tr><td colspan="4" style="text-align: center;">获取权限列表失败</td></tr>');
        },
        complete: function(){
            $('#addNode .choose-node').removeClass('is-disabled');
        }
    },this);
}

//获取选中
function getNodeSelected(id){
    AjaxClient.get({
        url: URLS['role'].selectedNode+"?"+_token+"&role_id="+id,
        dataType: 'json',
        beforeSend: function(){
            // layerLoading = LayerConfig('load');
        },
        success: function(rsp){
            // layer.close(layerLoading);
            if(rsp&&rsp.results&&rsp.results.length){
                nodeData=rsp.results;
            }else{
                nodeData=[];
            }
            createSelectNode();
            getNodeList();
        },
        fail: function(rsp){
            console.log('获取选中的权限失败');
        }
    },this);
}

function createSelectNode(){
    var nodes='';
    nodeData.forEach(function(item) {
        nodes+=`<span data-id="${item.node_id}" class="el-tag"><span title="${item.node}">${item.name?item.name:item.node}</span><i class="el-icon el-icon-close icon-close el-node-close"></i></span>`;
    });
    if(nodes){
        $('#addNode .node-selected').html(nodes);
    }
}

//保存权限
function saveNode(data){
    AjaxClient.post({
        url: URLS['role'].saveNode,
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
            console.log('分配权限失败');
        },
    },this)
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

//生成列表数据
function createHtml(ele,data){
    data.forEach(function(item,index){
    	var status=item.status==1?'<span class="el-status el-status-success">已激活</span>':
    	'<span class="el-status">已停用</span>';
        var tr=`
            <tr class="tritem" data-id="${item.role_id}">
                <td>${item.name}</td>
                <td>${status}</td>
                <td>${item.created_at}</td>
                <td class="right">
                <button data-id="${item.role_id}" class="button pop-button choose-node">分配权限</button>
                <button data-id="${item.role_id}" class="button pop-button edit">编辑</button>
                <button data-id="${item.role_id}" class="button pop-button delete">删除</button></td>
            </tr>
        `;
        ele.append(tr);
        ele.find('tr:last-child').data("trData",item);
    });
}

function getIds(data){
    var ids=[];
    data.forEach(function(item){
        ids.push(item.node_id);
    });

    return ids;
}

//生成权限列表
function createNodeHtml(rsp){
    var ele=$('#addNode .table_tbody');
    ele.html('');
    if(rsp&&rsp.results&&rsp.results.length){
        rsp.results.forEach(function(item,index){
            var status=item.status==1?'<span class="el-status el-status-success">启用</span>':
            '<span class="el-status">关闭</span>',
            checkbox=`<span class="el-checkbox_input ${getIds(nodeData).indexOf(item.node_id)>-1?'is-checked':''}">
                        <span class="el-checkbox-outset"></span>
                    </span>`;
            var tr=`
                <tr class="tritem" data-id="${item.node_id}">
                    <td><div class="overflow" style="max-width: 250px;" title="${item.node}">${item.node}</div></td>
                    <td><div class="overflow" style="max-width: 150px;" title="${item.name}">${item.name}</div></td>
                    <td>${status}</td>
                    <td class="right">${checkbox}</td>
                </tr>
            `;
            ele.append(tr);
            ele.find('tr:last-child').data("nodeData",item);
        });
    }else{
        var tr=`<tr><td colspan="4" style="text-align: center;">暂无数据</td></tr>`;
        ele.append(tr);
    }
}

//角色弹层
function RoleModal(flag,data){
    var {role_id='',name='',status=1}={};
    if(data){
        ({role_id='',name='',status=1}=data);
    }
    var labelWidth=84,
        btnShow='btnShow',
        title='添加功能',
        yes='',
        no='';
    flag==='add'?title='添加功能':title='编辑功能';
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
      content: `<form id="addRole_from" class="formModal formMateriel" data-flag="${flag}">
                <input type="hidden" id="itemId" value="${role_id}">
                <div class="modal-wrap">
                    <div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="width: ${labelWidth}px;flex: none;">名称<span class="mustItem">*</span></label>
                            <input type="text" id="name" class="el-input" autocomplete="off" placeholder="由2-15个字符组成" value="${name}">
                        </div>
                        <p class="errorMessage" style="display: block;padding-left: ${labelWidth}px;"></p>
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
									<span class="el-radio-label">停用</span>
								</label>
							</div>    
						</div>
						<p class="errorMessage" style="display: block;padding-left: ${labelWidth}px;"></p>
					</div>
                </div>
                <div class="el-form-item ${btnShow}">
                    <div class="el-form-item-div btn-group">
                        <button type="button" class="el-button el-button--primary submit add">确定</button>
                    </div>
                </div>
            </form>` ,
        success: function(layero,index){
            layerEle=layero;
        },
        end: function(){
            layerEle='';
            $('.uniquetable tr.active').removeClass('active');
        }
    }); 
}

//分配权限弹层
function RoleNodeModal(id){
    var tableHeight=($(window).height()-415)+'px';
    layerModal = layer.open({
        type: 1,
        title: '选择功能',
        offset: '100px',
        area: '750px',
        shade: 0.1,
        shadeClose: false,
        resize: false,
        move: false,
        content:`<form class="addNode formModal chooseModal" id="addNode">
        <input type="hidden" id="roleId" value="${id}">
           <ul class="query-item">
                <li>
                    <div class="el-form-item" style="width: 45%;">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="width: 70px;">权限名称</label>
                            <input type="text" id="name" class="el-input" placeholder="请输入权限名称" value="">
                        </div>
                    </div>
                    <div class="el-form-item" style="width: 45%;">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="width: 70px;">权限路径</label>
                            <input type="text" id="node" class="el-input" placeholder="请输入权限路径" value="">
                        </div>
                    </div>
                </li>
                <li>
                    <div class="el-form-item menu" style="width: 90%;">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="width: 70px;">菜单名称</label>
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
                    </div>
                    <div class="el-form-item" style="width: 10%;">
                        <div class="el-form-item-div btn-group">
                            <button style="margin-top: 5px;" type="button" class="el-button choose-search choose-node">搜索</button>
                        </div>
                    </div>
                </li>
            </ul>
            <div class="node-selected">
            </div>
           <div class="table_page">
                <div id="pagenation" class="pagenation node"></div>
                <div class="table-wrap" style="max-height: ${tableHeight};overflow-y: auto;">
                    <table class="sticky uniquetable commontable">
                      <thead>
                        <tr>
                          <th>权限路径</th>
                          <th>权限名称</th>
                          <th>状态</th>
                          <th class="right">选择</th>
                        </tr>
                      </thead>
                      <tbody class="table_tbody">
                      </tbody>
                    </table>
                </div>
          </div>
          <div class="el-form-item">
            <div class="el-form-item-div btn-group" style="margin-top: 10px;">
                <button type="button" class="el-button el-button--primary submit">确定</button>
            </div>
          </div>       
    </form>`,
    success: function(layero, index){
        getLayerSelectPosition($(layero));
        getNodeSelected(id);
        getMenu();
    },
    cancel: function(layero, index){//右上角关闭按钮
    },
    end: function(){
        pageNodeNo=1;
        ajaxNodeData={
            type: '',
            menu_id: '',
            node: '',
            name: '',
            status: '',
            order: 'asc',
            sort: 'node'
        };
        nodeData=[];
    }

    })
}

function bindEvent(){
	//点击弹框内部关闭dropdown
	$(document).click(function (e) {
        var obj = $(e.target);
        if (!obj.hasClass('el-select-dropdown-wrap') && obj.parents(".el-select-dropdown-wrap").length === 0) {
            $('.el-select-dropdown').slideUp().siblings('.el-select').find('.el-input-icon').removeClass('is-reverse');
        }
    });
	$('body').on('click','#searchForm .el-select-dropdown-wrap',function(e){
		e.stopPropagation();
	});
    $('.uniquetable').on('click','.delete',function(){
    	var id=$(this).attr("data-id");
        var num=$('#table_attr_table .table_tbody tr').length;
        $(this).parents('tr').addClass('active');
    	layer.confirm('将执行删除操作?', {icon: 3, title:'提示',offset: '250px',end:function(){
            $('.uniquetable tr.active').removeClass('active');
        }}, function(index){
		  layer.close(index);
		  deleteRole(id,num);
		});
    });

    //checkbox 点击
    $('body').on('click','.el-checkbox_input:not(.noedit)',function (e) {
        $(this).toggleClass('is-checked');
        var data=$(this).parents('.tritem').data('nodeData'),
        ids=getIds(nodeData),
        index=ids.indexOf(data.node_id);
        if($(this).hasClass('is-checked')){
            if(index==-1){
                nodeData.push(data);
                createSelectNode();
            }
        }else{
            nodeData.splice(index,1);
            $('span.el-tag[data-id='+data.node_id+']').remove();
        }
    });

    //删除节点
    $('body').on('click','.icon-close',function(){
        var id=$(this).parent().attr('data-id'),
        ids=getIds(nodeData),
        index=ids.indexOf(id);
        nodeData.splice(index,1);
        $(this).parent().remove();
        $('#addNode .tritem[data-id='+id+'] .el-checkbox_input').removeClass('is-checked');
    });

    //单选按钮点击事件
	$('body').on('click','.el-radio-input',function(e){
		$(this).parents('.el-radio-group').find('.el-radio-input').removeClass('is-radio-checked');
		$(this).addClass('is-radio-checked');     
	});

    $('body').on('click','.el-select:not(.noedit)',function(){
        $(this).find('.el-input-icon').toggleClass('is-reverse');
        $(this).parents('.el-form-item').siblings().find('.el-select-dropdown').hide();
        $(this).parents('.el-form-item').siblings().find('.el-select .el-input-icon').removeClass('is-reverse');
        $(this).siblings('.el-select-dropdown').toggle();
	});

	$('body').on('click','.el-select-dropdown-item',function(e){
		e.stopPropagation();
		$(this).parent().find('.el-select-dropdown-item').removeClass('selected');
		$(this).addClass('selected');
		var ele=$(this).parents('.el-select-dropdown').siblings('.el-select');
        var idval=$(this).attr('data-id');
        ele.find('.el-input').val($(this).text());
        ele.find('.val_id').val($(this).attr('data-id'));
		$(this).parents('.el-select-dropdown').hide().siblings('.el-select').find('.el-input-icon').removeClass('is-reverse');
	});

	//搜索角色
    $('body').on('click','#searchForm .submit:not(".is-disabled")',function(e){
    	e.stopPropagation();
        $('#searchForm .el-item-hide').slideUp(400,function(){
             $('#searchForm .el-item-show').css('background','transparent');
        });
        $('.arrow .el-input-icon').removeClass('is-reverse');
        if(!$(this).hasClass('is-disabled')){
            $(this).addClass('is-disabled');
            var parentForm=$(this).parents('#searchForm');
            $('.el-sort').removeClass('ascending descending');
            pageNo=1;
            ajaxData={
                name: parentForm.find('#name').val().trim(),
                status: parentForm.find('#status').val(),
                order: 'desc',
                sort: 'id'
            }
            getRoleList();
        }  
    });

    //重置搜索框值
    $('body').on('click','#searchForm .reset:not(.is-disabled)',function(e){
        e.stopPropagation();
        $(this).addClass('is-disabled');
        var parentForm=$(this).parents('#searchForm');
        parentForm.find('#name').val('');
        parentForm.find('#status').val('').siblings('.el-input').val('--请选择--');
        $('.el-select-dropdown-item').removeClass('selected');
        $('.el-select-dropdown').hide();
        pageNo=1;
        resetParam();
        getRoleList();
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

    //添加
    $('body').on('click','.button_add',function(){
        RoleModal('add');
    });

    $('body').on('click','.pop-button.choose-node',function(){
        var id=$(this).attr('data-id');
        RoleNodeModal(id);
    });

    //搜索权限
    $('body').on('click','#addNode .choose-node',function () {
        if(!$(this).hasClass('is-disabled')){
            $(this).addClass('is-disabled');
            var ele=$('#addNode');
            ajaxNodeData.name=ele.find('#name').val().trim();
            ajaxNodeData.node=ele.find('#node').val().trim();
            ajaxNodeData.menu_id=ele.find('#menu_id').val().trim();
            pageNodeNo=1;
            getNodeList();
        }
    });

    //选择权限
    $('body').on('click','#addNode .submit',function () {
        if(!$(this).hasClass('is-disabled')){
            var node_ids=nodeData.length?getIds(nodeData):'';
            var data={
                role_id: $('#roleId').val(),
                node_ids: node_ids,
                _token: TOKEN
            };
            saveNode(data);
        }
    });

    //输入框的相关事件
    $('body').on('focus','.formMateriel .el-input:not([readonly])',function(){
        $(this).parents('.el-form-item').find('.errorMessage').html("").removeClass('active');
    }).on('blur','.formMateriel .el-input:not([readonly])',function(){
        var flag=$('#addRole_from').attr('data-flag'),
        name=$(this).attr("id");
        validatorConfig[name] 
        && validatorToolBox[validatorConfig[name]] 
        && validatorToolBox[validatorConfig[name]](name)
        && remoteValidatorConfig[name] 
        && remoteValidatorToolbox[remoteValidatorConfig[name]] 
        && remoteValidatorToolbox[remoteValidatorConfig[name]](flag,name);
    });

    $('.uniquetable').on('click','.edit',function(){
        $(this).parents('tr').addClass('active');
        getRole($(this).attr("data-id"),'edit');
    });
    //添加按钮点击
    $('body').on('click','#addRole_from .submit',function (e) {
        e.stopPropagation();
        if(!$(this).hasClass('is-disabled')) {
            var parentForm = $(this).parents('#addRole_from');
            var correct=1;
            for (var type in validatorConfig) {
                correct=validatorConfig[type]&&validatorToolBox[validatorConfig[type]](type);
                if(!correct){
                    break;
                }
            }
            if (correct) {
                $(this).addClass('is-disabled');
                var role_id=parentForm.find('#itemId').val(),
                 name= parentForm.find('#name').val().trim(),
                 status = parentForm.find('.is-radio-checked .status').val();
                parentForm.attr('data-flag')=='add'?
                addRole({
                    name: name,
                    status: status,
                    _token: TOKEN
                }):
                editRole({
                    name: name,
                    status: status,
                    _token: TOKEN,
                    role_id: role_id
                })
            }
        }
    });
}