$(function () {
    bindEvent()
})

var orgSource ={
    "bom_id": 13,
    "operation_id": 0,
    "usage_number": "1",
    "material_id": 10,
    "loss_rate": 0,
    "name": "测试物料",
    "item_no": "00120180000262",
    "unit_id": 4,
    "material_category_id": 1,
    "operation_name": null,
    "unit": "公斤",
    "commercial": "kg",
    "material_category_name": "原辅材料",
    "children": [
        {
            "material_id": 11,
            "name": "测试物料2",
            "item_no": "00120180000278",
            "material_category_id": 1,
            "bom_item_id": 24,
            "bom_id": 13,
            "loss_rate": "0",
            "is_assembly": 0,
            "usage_number": "",
            "total_consume": 0,
            "parent_id": 0,
            "comment": "",
            "version": 0,
            "unit": "公斤",
            "commercial": "kg",
            "unit_id": 4,
            "material_category_name": "原辅材料",
            "has_bom": 0,
            "replaces": [],
            "children": [],
            "itemAddFlag": 1,
            "ppid": 10,
            "son_material_id": []
        },
        {
            "material_id": 3,
            "name": "无纺布",
            "item_no": "00120180000247",
            "material_category_id": 1,
            "bom_item_id": 25,
            "bom_id": 13,
            "loss_rate": "0",
            "is_assembly": 0,
            "usage_number": "",
            "total_consume": 0,
            "parent_id": 0,
            "comment": "",
            "version": 0,
            "unit": "公斤",
            "commercial": "kg",
            "unit_id": 4,
            "material_category_name": "原辅材料",
            "has_bom": 1,
            "replaces": [
                {
                    "material_id": 1,
                    "name": "提花天鹅绒",
                    "item_no": "00120180000245",
                    "material_category_id": 1,
                    "bom_item_id": 26,
                    "bom_id": 13,
                    "loss_rate": "0",
                    "is_assembly": 0,
                    "usage_number": "",
                    "total_consume": 0,
                    "parent_id": 25,
                    "comment": "",
                    "version": 0,
                    "unit": "公斤",
                    "commercial": "kg",
                    "unit_id": 4,
                    "material_category_name": "原辅材料",
                    "has_bom": 0,
                    "children": [],
                    "itemAddFlag": 2,
                    "replaceItemId": 3,
                    "son_material_id": []
                }
            ],
            "children": [],
            "versions": [
                1
            ],
            "itemAddFlag": 1,
            "ppid": 10,
            "son_material_id": []
        },
        {
            "material_id": 2,
            "name": "空气层",
            "item_no": "00120180000246",
            "material_category_id": 1,
            "bom_item_id": 27,
            "bom_id": 13,
            "loss_rate": "0",
            "is_assembly": 0,
            "usage_number": "",
            "total_consume": 0,
            "parent_id": 0,
            "comment": "",
            "version": 0,
            "unit": "公斤",
            "commercial": "kg",
            "unit_id": 4,
            "material_category_name": "原辅材料",
            "has_bom": 1,
            "replaces": [],
            "children": [],
            "versions": [
                1
            ],
            "itemAddFlag": 1,
            "ppid": 10,
            "son_material_id": []
        },
        {
            "material_id": 4,
            "name": "床裙空气层墙子",
            "item_no": "00520180000249",
            "material_category_id": 5,
            "bom_item_id": 28,
            "bom_id": 13,
            "loss_rate": "0",
            "is_assembly": 0,
            "usage_number": "",
            "total_consume": 0,
            "parent_id": 0,
            "comment": "",
            "version": 1,
            "unit": "件",
            "commercial": "PCS",
            "unit_id": 2,
            "material_category_name": "自制半成品",
            "has_bom": 1,
            "replaces": [],
            "children": [
                {
                    "material_id": 2,
                    "name": "空气层",
                    "item_no": "00120180000246",
                    "material_category_id": 1,
                    "bom_item_id": 1,
                    "bom_id": 1,
                    "loss_rate": 0.1,
                    "is_assembly": 0,
                    "usage_number": "",
                    "total_consume": 0,
                    "parent_id": 0,
                    "comment": "",
                    "version": 0,
                    "unit": "公斤",
                    "commercial": "kg",
                    "unit_id": 4,
                    "material_category_name": "原辅材料",
                    "has_bom": 1,
                    "replaces": [],
                    "children": [],
                    "versions": [
                        1
                    ],
                    "ppid": 4,
                    "son_material_id": []
                }
            ],
            "versions": [
                1
            ],
            "operation_id": 0,
            "operation_name": "",
            "itemAddFlag": 1,
            "ppid": 10,
            "son_material_id": [
                2
            ]
        }
    ],
    "ppid": 0,
    "son_material_id": [
        11,
        3,
        2,
        4
    ]
}

function bindEvent() {
    showBomPic(orgSource)
}

//orgchart树形图
function showBomPic(source) {
    $('#orgchart-container').html('');

    var nodeTemplate = function (data) {
        return `<div class="title">
                   ${data.item_no}
                </div>
                <div class="content">
                    <p class="name" title="${data.name}"><span style="color: #666;">名称：</span>${data.name.length>6?data.name.substring(0,4)+'...':data.name}</p>
                    <p class="name"><span style="color: #666;">数量：</span>${data.usage_number}${data.commercial!=undefined?'['+data.commercial+']':''}</p>
                </div>`;
    };

    $('#orgchart-container').orgchart({
        'data' : source,
        'zoom' : true,
        'pan' : true,
        'depth': 99,
        // 'exportButton': true,
        // 'exportFilename': `物料${source.name}的树形图`,
        'nodeTemplate': nodeTemplate,
        'createNode': function($node, data){
            var replaceClass=data.replaces!=undefined&&data.replaces.length ? 'nodeReplace': '';
            $node.addClass(replaceClass);
            if(data.bom_item_qty_levels&&data.bom_item_qty_levels.length){
                var secondMenuIcon = $('<i>', {
                    'class': 'fa fa-info-circle second-menu-icon',
                    'node-id':`${data.material_id}`,
                    click: function(e) {
                        e.stopPropagation();
                        var that=$(this);
                        if($(this).siblings('.second-menu').is(":hidden")){
                            $('.second-menu').hide();
                            $(this).siblings('.second-menu').show();
                        }else{
                            $(this).siblings('.second-menu').hide();
                        }
                    }
                });
                var trs='';
                data.bom_item_qty_levels.forEach(function(item){
                    trs+=` <tr>
                  <td>${item.parent_min_qty}</td>
                  <td>${item.qty}</td>
              </tr>`;
                });
                var table=`<table class="bordered">
                <tr>
                    <th> 父项最小数量 </th>
                    <th> 用量 </th>
                </tr>
                ${trs}            
          </table>`;
                var secondMenu = `<div id="second-menu" class="second-menu">${table}</div>`;
                $node.append(secondMenuIcon).append(secondMenu);}
        }
    });
}