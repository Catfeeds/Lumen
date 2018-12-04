// routeArr={
//     routing_graph: {
//         nodes: [],
//         edges: []
//     }
// };
$(function () {
    // var bomData={"bom_id":28,"operation_id":20,"operation_ability":"","usage_number":1,"material_id":43,"loss_rate":0,"name":"切割厚垫-婴儿床垫1","item_no":"CPHDQD000253","unit_id":2,"material_category_id":10,"operation_name":"绗缝","unit":"件","commercial":"PCS","material_category_name":"切割厚垫","operation_ability_pluck":"","children":[{"material_id":46,"name":"普通topper-床外套1","item_no":"BPBTCW000259","material_category_id":49,"bom_item_id":62,"bom_id":28,"loss_rate":0,"is_assembly":1,"usage_number":"1","total_consume":0,"parent_id":0,"comment":"","version":1,"unit":"件","commercial":"PCS","unit_id":2,"material_category_name":"床垫外套","has_bom":1,"replaces":[],"children":[{"material_id":56,"name":"空气层裁片001","item_no":"BPCJ000276","material_category_id":154,"bom_item_id":58,"bom_id":25,"loss_rate":0,"is_assembly":1,"usage_number":"1","total_consume":0,"parent_id":0,"comment":"","version":1,"unit":"件","commercial":"PCS","unit_id":2,"material_category_name":"裁片","has_bom":1,"replaces":[],"children":[{"material_id":23,"name":"空气层195","item_no":"ML01000195","material_category_id":67,"bom_item_id":47,"bom_id":20,"loss_rate":0,"is_assembly":0,"usage_number":"0.1141","total_consume":0,"parent_id":0,"comment":"","version":0,"unit":"米","commercial":"m","unit_id":3,"material_category_name":"空气层","has_bom":0,"replaces":[],"children":[]}],"versions":[1],"operation_id":20,"operation_name":"绗缝","operation_ability":"","operation_ability_pluck":[]},{"material_id":54,"name":"裁片0001","item_no":"BPCJ000273","material_category_id":154,"bom_item_id":59,"bom_id":25,"loss_rate":0,"is_assembly":1,"usage_number":"2","total_consume":0,"parent_id":0,"comment":"","version":1,"unit":"件","commercial":"PCS","unit_id":2,"material_category_name":"裁片","has_bom":1,"replaces":[],"children":[{"material_id":24,"name":"点塑布196","item_no":"ML06000196","material_category_id":72,"bom_item_id":55,"bom_id":22,"loss_rate":0,"is_assembly":0,"usage_number":"0.1534","total_consume":0,"parent_id":0,"comment":"","version":0,"unit":"米","commercial":"m","unit_id":3,"material_category_name":"点塑布","has_bom":0,"replaces":[],"children":[]}],"versions":[1],"operation_id":19,"operation_name":"裁剪","operation_ability":"","operation_ability_pluck":[]}],"versions":[1],"operation_id":19,"operation_name":"裁剪","operation_ability":"","operation_ability_pluck":[]},{"material_id":45,"name":"topper-床内套1","item_no":"BPBTCN000258","material_category_id":50,"bom_item_id":63,"bom_id":28,"loss_rate":0,"is_assembly":1,"usage_number":"1","total_consume":0,"parent_id":0,"comment":"","version":1,"unit":"件","commercial":"PCS","unit_id":2,"material_category_name":"床垫内套","has_bom":1,"replaces":[],"children":[{"material_id":55,"name":"裁片","item_no":"BPCJ000274","material_category_id":154,"bom_item_id":60,"bom_id":26,"loss_rate":0,"is_assembly":1,"usage_number":"","total_consume":0,"parent_id":0,"comment":"","version":1,"unit":"件","commercial":"PCS","unit_id":2,"material_category_name":"裁片","has_bom":1,"replaces":[],"children":[{"material_id":31,"name":"汗布203","item_no":"ML29000203","material_category_id":94,"bom_item_id":56,"bom_id":23,"loss_rate":0,"is_assembly":0,"usage_number":"1.45","total_consume":0,"parent_id":0,"comment":"","version":0,"unit":"米","commercial":"m","unit_id":3,"material_category_name":"汗布","has_bom":0,"replaces":[],"children":[]}],"versions":[1],"operation_id":0,"operation_name":"","operation_ability":"","operation_ability_pluck":[]}],"versions":[1],"operation_id":20,"operation_name":"绗缝","operation_ability":"","operation_ability_pluck":[]},{"material_id":53,"name":"普通床垫切割绵99","item_no":"BPBPQG000267","material_category_id":153,"bom_item_id":64,"bom_id":28,"loss_rate":0,"is_assembly":0,"usage_number":"1","total_consume":0,"parent_id":0,"comment":"","version":0,"unit":"件","commercial":"PCS","unit_id":2,"material_category_name":"床垫切割绵","has_bom":0,"replaces":[],"children":[]},{"material_id":50,"name":"慢回弹切割绵111","item_no":"BPBPQG000266","material_category_id":153,"bom_item_id":65,"bom_id":28,"loss_rate":0,"is_assembly":0,"usage_number":"1","total_consume":0,"parent_id":0,"comment":"","version":0,"unit":"立方米","commercial":"m³","unit_id":7,"material_category_name":"床垫切割绵","has_bom":0,"replaces":[],"children":[]},{"material_id":47,"name":"彩盒","item_no":"BCCH000264","material_category_id":102,"bom_item_id":66,"bom_id":28,"loss_rate":0,"is_assembly":0,"usage_number":"1","total_consume":0,"parent_id":0,"comment":"","version":0,"unit":"件","commercial":"PCS","unit_id":2,"material_category_name":"彩盒","has_bom":0,"replaces":[],"children":[]},{"material_id":49,"name":"普通黄箱-纸箱001","item_no":"BCWX000265","material_category_id":103,"bom_item_id":67,"bom_id":28,"loss_rate":0,"is_assembly":0,"usage_number":"1","total_consume":0,"parent_id":0,"comment":"","version":0,"unit":"件","commercial":"PCS","unit_id":2,"material_category_name":"纸箱","has_bom":0,"replaces":[],"children":[]},{"material_id":33,"name":"纸箱205","item_no":"BCWX000205","material_category_id":103,"bom_item_id":68,"bom_id":28,"loss_rate":0,"is_assembly":0,"usage_number":"1","total_consume":0,"parent_id":0,"comment":"","version":0,"unit":"件","commercial":"PCS","unit_id":2,"material_category_name":"纸箱","has_bom":0,"replaces":[],"children":[]},{"material_id":44,"name":"圆筒包","item_no":"BCYT000256","material_category_id":101,"bom_item_id":69,"bom_id":28,"loss_rate":0,"is_assembly":0,"usage_number":"1","total_consume":0,"parent_id":0,"comment":"","version":0,"unit":"件","commercial":"PCS","unit_id":2,"material_category_name":"圆筒包","has_bom":0,"replaces":[],"children":[]}]};
    // console.log(bomData);
    // function createRoute(data) {
    //     if(data.children&&data.children.length){
    //         data.children.forEach(function(item){
    //             if(data.operation_id){
    //                 if(item.operation_id){
    //                     var tarr=[],tobj={};
    //                     tarr.push(data.material_id);
    //                     tarr.push(item.material_id);
    //                     routeArr.routing_graph.edges.push(tarr);
    //                     tobj={
    //                         operation: item.operation_name,
    //                         label: '',
    //                         mode: "MODE_REQUIRED"
    //                     };
    //                     routeArr.routing_graph.nodes.push(tobj);
    //                 }else{
    //                     // var tarr=[];
    //                     // tarr.push(0);
    //                     // tarr.push(data.material_id);
    //                     // routeArr.routing_graph.edges.push(tarr);
    //                 }
    //             }
    //             createRoute(item);
    //         });
    //     }
    // }
    //
    // if(bomData.operation_id){
    //     var tobj={};
    //     tobj={
    //         operation: bomData.operation_name,
    //         label: '',
    //         mode: "MODE_REQUIRED"
    //     };
    //     routeArr.routing_graph.nodes.push(tobj);
    // }
    // createRoute(bomData);
    // console.log(routeArr);

    // var data={"routing_graph":{
    //     "nodes":[{"operation":"<none>","label":"root","mode":"MODE_REQUIRED"},
    //         {"operation":"\u5f00\u59cb (START)","label":"0","mode":"MODE_REQUIRED"},
    //         {"operation":"组圆","label":"4","mode":"MODE_REQUIRED"},
    //         {"operation":"裁剪","label":"5","mode":"MODE_REQUIRED"},
    //         {"operation":"裁剪","label":"18","mode":"MODE_REQUIRED"},
    //         {"operation":"测试","label":"19","mode":"MODE_REQUIRED"}],
    //     //"edges":[[0,1],[1,2],[1,3]]}
    //     //"edges":[[55,133],[54,133]]}
    //     "edges":[[0,1],[3,5]]}
    // }
    var data={"routing_graph":
      {"nodes":[
        {"operation":"<none>","label":"root","mode":"MODE_REQUIRED"},
        {"operation":"BPBTP003000001测试","label":0,"mode":"MODE_REQUIRED"},
        {"operation":"切割厚垫","label":1,"mode":"MODE_REQUIRED"}],
        "edges":[[0,1],[1,2]]},"success":1};
    // "success":1};
    // console.log(data);
    var routingGraph = new emi2cRoutingGraph('routing_graph', data.routing_graph, 900, 500);
    routingGraph.calcPositions();
    routingGraph.draw();
})
// var list ={
//     "bom_id": 3,
//     "operation_id": 0,
//     "operation_ability": "",
//     "usage_number": 1,
//     "material_id": 2,
//     "loss_rate": 0,
//     "name": "床垫外套",
//     "item_no": "BPBTCW000001",
//     "unit_id": 11,
//     "material_category_id": 8,
//     "operation_name": null,
//     "unit": "厘米",
//     "commercial": "cm",
//     "material_category_name": "床垫外套",
//     "operation_ability_pluck": "",
//     "children": [
//         {
//             "material_id": 6,
//             "name": "切割厚垫",
//             "item_no": "CPHDQD000002",
//             "material_category_id": 5,
//             "bom_item_id": 3,
//             "bom_id": 3,
//             "loss_rate": 0,
//             "is_assembly": 1,
//             "usage_number": "",
//             "total_consume": 0,
//             "parent_id": 0,
//             "comment": "",
//             "version": 1,
//             "unit": "厘米",
//             "commercial": "cm",
//             "unit_id": 11,
//             "material_category_name": "切割厚垫",
//             "has_bom": 1,
//             "bom_item_qty_levels": [],
//             "replaces": [],
//             "children": [
//                 {
//                     "material_id": 4,
//                     "name": "床垫外套",
//                     "item_no": "BPBTCW000003",
//                     "material_category_id": 8,
//                     "bom_item_id": 2,
//                     "bom_id": 2,
//                     "loss_rate": 0,
//                     "is_assembly": 1,
//                     "usage_number": "1",
//                     "total_consume": 1,
//                     "parent_id": 0,
//                     "comment": "",
//                     "version": 1,
//                     "unit": "厘米",
//                     "commercial": "cm",
//                     "unit_id": 11,
//                     "material_category_name": "床垫外套",
//                     "has_bom": 1,
//                     "bom_item_qty_levels": [],
//                     "replaces": [],
//                     "children": [
//                         {
//                             "material_id": 1,
//                             "name": "毛巾布",
//                             "item_no": "ML02000001",
//                             "material_category_id": 12,
//                             "bom_item_id": 1,
//                             "bom_id": 1,
//                             "loss_rate": 0,
//                             "is_assembly": 0,
//                             "usage_number": "1",
//                             "total_consume": 0,
//                             "parent_id": 0,
//                             "comment": "",
//                             "version": 0,
//                             "unit": "厘米",
//                             "commercial": "cm",
//                             "unit_id": 11,
//                             "material_category_name": "毛巾布",
//                             "has_bom": 0,
//                             "bom_item_qty_levels": [],
//                             "replaces": [],
//                             "children": []
//                         }
//                     ],
//                     "versions": [
//                         1
//                     ],
//                     "operation_id": 2,
//                     "operation_name": "裁剪",
//                     "operation_ability": "3",
//                     "operation_ability_pluck": {
//                         "3": "手工裁剪"
//                     }
//                 }
//             ],
//             "versions": [
//                 1
//             ],
//             "operation_id": 3,
//             "operation_name": "切割",
//             "operation_ability": "5,6",
//             "operation_ability_pluck": {
//                 "5": "手工切割",
//                 "6": "机器切割"
//             }
//         },
//         {
//             "material_id": 4,
//             "name": "床垫外套",
//             "item_no": "BPBTCW000003",
//             "material_category_id": 8,
//             "bom_item_id": 4,
//             "bom_id": 3,
//             "loss_rate": 0,
//             "is_assembly": 1,
//             "usage_number": "",
//             "total_consume": 0,
//             "parent_id": 0,
//             "comment": "",
//             "version": 1,
//             "unit": "厘米",
//             "commercial": "cm",
//             "unit_id": 11,
//             "material_category_name": "床垫外套",
//             "has_bom": 1,
//             "bom_item_qty_levels": [],
//             "replaces": [],
//             "children": [
//                 {
//                     "material_id": 1,
//                     "name": "毛巾布",
//                     "item_no": "ML02000001",
//                     "material_category_id": 12,
//                     "bom_item_id": 1,
//                     "bom_id": 1,
//                     "loss_rate": 0,
//                     "is_assembly": 0,
//                     "usage_number": "1",
//                     "total_consume": 0,
//                     "parent_id": 0,
//                     "comment": "",
//                     "version": 0,
//                     "unit": "厘米",
//                     "commercial": "cm",
//                     "unit_id": 11,
//                     "material_category_name": "毛巾布",
//                     "has_bom": 0,
//                     "bom_item_qty_levels": [],
//                     "replaces": [],
//                     "children": []
//                 }
//             ],
//             "versions": [
//                 1
//             ],
//             "operation_id": 2,
//             "operation_name": "裁剪",
//             "operation_ability": "3",
//             "operation_ability_pluck": {
//                 "3": "手工裁剪"
//             }
//         },
//         {
//             "material_id": 3,
//             "name": "床垫外套",
//             "item_no": "BPBTCW000002",
//             "material_category_id": 8,
//             "bom_item_id": 5,
//             "bom_id": 3,
//             "loss_rate": 0,
//             "is_assembly": 0,
//             "usage_number": "",
//             "total_consume": 0,
//             "parent_id": 0,
//             "comment": "",
//             "version": 0,
//             "unit": "厘米",
//             "commercial": "cm",
//             "unit_id": 11,
//             "material_category_name": "床垫外套",
//             "has_bom": 0,
//             "bom_item_qty_levels": [],
//             "replaces": [],
//             "children": []
//         }
//     ]
// };
// $(function () {
//
//
//     // console.log();
//
//     function get_routing_graph(list){
//         var nodes_value = getOrderArrName(list);
//         var edges_value = getOrderArr(list);
//         var data={"routing_graph":
//         {"nodes":nodes_value,"edges":edges_value},
//             "success":1};
//
//         return data;
//         // console.log(data);
//
//     }
//
//     function getOrderArr(list) {
//         var list2 = changedata(list);
//
//         //parent_id对应的序号关系数组
//         var relation = [];
//         var used_parentid = [];
//         //结果表
//         var final = [];
//         final.push([0,1]);
//         //var final2 = [];
//         var mother = 0;
//         var incre = 1;
//         for (var i = 0; i < list2.length; i++) {
//             var tmp = [];
//             if (list2[i].parent_id == 0) {
//                 tmp.push(list2[i].material_id);
//                 tmp.push(incre);
//                 relation.push(tmp);
//                 used_parentid.push(list2[i].material_id);
//             }else{
//                 if(jQuery.inArray(list2[i].parent_id,used_parentid) != -1){
//                     var order_pid =	get_order_pid(list2[i].parent_id,relation);
//                     var tmp1 = [];
//                     tmp1.push(list2[i].material_id);
//                     var incre = incre + 1;
//                     tmp1.push(incre);
//                     relation.push(tmp1);
//                     used_parentid.push(list2[i].material_id);
//                     var tmp2 = [];
//                     tmp2.push(order_pid);
//                     tmp2.push(incre);
//                     final.push(tmp2);
//                 }
//             }
//         }
//         return final;
//     }
//     function getOrderArrName(list) {
//         var list2 = changedata(list);
//
//         //parent_id对应的序号关系数组
//         var relation = [];
//         var used_parentid = [];
//         //结果表
//         //var final = [];
//         var final2 = [];
//         var mother = 0;
//         var incre = 0;
//         for (var i = 0; i < list2.length; i++) {
//             var tmp = [];
//             if (list2[i].parent_id == 0) {
//                 tmp.push(list2[i].material_id);
//                 tmp.push(0);
//                 relation.push(tmp);
//                 used_parentid.push(list2[i].material_id);
//                 final2.push({"operation":"<none>","label":"root","mode":"MODE_REQUIRED"},{"operation":list2[i].name,"label":incre,"mode":"MODE_REQUIRED"});
//             }else{
//                 if(jQuery.inArray(list2[i].parent_id,used_parentid) != -1){
//                     var order_pid =	get_order_pid(list2[i].parent_id,relation);
//                     var tmp1 = [];
//                     tmp1.push(list2[i].material_id);
//                     var incre = incre + 1;
//                     tmp1.push(incre);
//                     relation.push(tmp1);
//                     used_parentid.push(list2[i].material_id);
//
//                     var tmp3 = [];
//                     tmp3.push(incre);
//                     tmp3.push(list2[i].name);
//                     final2.push({"operation":list2[i].name,"label":incre,"mode":"MODE_REQUIRED"});
//                 }
//             }
//         }
//         return final2;
//     }
//     function changedata(data){
//         var list2 = [];
//         list2.push({"material_id": data.material_id,
//             "name": data.name,
//             "operation_name": data.operation_name,"parent_id": 0});
//         function getdata(data) {
//             if(data.children.length > 0){
//                 for (var i in data.children) {
//                     list2.push({"material_id": data.children[i].material_id,"name": data.children[i].name,
//                         "operation_name": data.children[i].operation_name,"parent_id": data.material_id});
//                     //if(data.children[i].children.length > 0){
//                     //	getdata(data.children[i]);
//                     //}
//                 }
//                 for (var i in data.children) {
//                     if(data.children[i].children.length > 0){
//                         getdata(data.children[i]);
//                     }
//                 }
//             }
//         }
//         getdata(data);
//         //console.log(list2);
//         return list2;
//
//     }
//     function get_order_pid(parent_id,relation) {
//         for (var i = 0; i < relation.length; i++) {
//             if(parent_id == relation[i][0]){
//                 return relation[i][1];
//             }
//         }
//         return 0;
//     }
//
//     // var datas = get_routing_graph(list);
//         var datas={"routing_graph":
//     {"nodes":[
//         {"operation":"<none>","label":"root","mode":"MODE_REQUIRED"},
//         {"operation":"\u5f00\u59cb (START)","label":"0","mode":"MODE_REQUIRED"},
//         {"operation":"\u591a\u9488\u7ed7\u7f1d\u591a (NZHF)","label":"1","mode":"MODE_REQUIRED"},
//         {"operation":" ()","label":"2","mode":"MODE_SELECTABLE"},
//         {"operation":" ()","label":"3","mode":"MODE_REQUIRED"},
//         {"operation":"\u88c1\u526a (CJ)","label":"4","mode":"MODE_SKIPPABLE_SELECTABLE"},
//         {"operation":" ()","label":"5","mode":"MODE_SKIPPABLE"},
//         {"operation":" ()","label":"6","mode":"MODE_REQUIRED"},
//         {"operation":"\u7ee3\u82b1 (XH)","label":"7","mode":"MODE_SKIPPABLE"}],
//      "edges":[[0,1],[0,4],[4,6],[1,2],[1,3]]
//     }}
//     // "success":1};
//     console.log(datas);
//     var routingGraph = new emi2cRoutingGraph('routing_graph', datas.routing_graph, 900, 500);
//     routingGraph.calcPositions();
//     routingGraph.draw();
// })