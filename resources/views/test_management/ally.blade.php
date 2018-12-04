{{--继承父模板--}}
@extends("layouts.base")

@section("inline-header")

<link type="text/css" rel="stylesheet" href="/statics/custom/css/schedule/calendar.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/bom/routing.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/test/test.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/routing/routing.css?v={{$release}}">
@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")

<div class="div_con_wrapper" id="appsss">
    <div class="top-section">
        <div class="left-po">
            <h4 style="border-left: 0px solid #0097E7;" class="po-number title-comm" ><span>  当前生产订单：</span><span v-text="podata.number"></span> </h4>
            <div class="po-box">
                <ul class="po-data">
                    <li>
                        <div>销售订单号</div>
                        <div>产品</div>
                        <div>物料编码</div>
                        <div>数量[<span v-text="podata.commercial"></span>]</div>
                        <div>废料[%]</div>
                        <div>开始日期-结束日期</div>
                    </li>
                    <li>
                        <div v-text="podata.sales_order_code"></div>
                        <div v-text="podata.material_name" :title="podata.material_name"></div>
                        <div v-text="podata.item_no"></div>
                        <div v-text="podata.qty"></div>
                        <div v-text="podata.scrap"></div>
                        <div v-text="this.startData+'/'+this.endData"></div>
                    </li>
                </ul>
            </div>
        </div> 
        <div class="right-img">
            <div class="img-btn">
                <button style="font-size: 16px; color: '#333';" @click="gant_art = false" :class="{'color-chose':!gant_art}">GANT*图</button>
                <button style="font-size: 16px; color: '#333';" @click="gant_art = true" :class="{'color-chose':gant_art}">工艺路线*图</button>
            </div>
            <div class="wo-mask" style="overflow:hidden;box-shadow: 0 0 24px 2px #eee;">
                <!-- 这是gant图 -->
                <div class="scroll-screen" :class="{'move-scroll-screen':gant_art}">
                    <div class="gant" style="width: 50%;float: left;">
                        <div class="gant-left">
                            <div class="gant-header">
                                <div class="gant-title-keyname">工单号</div>
                                <div class="gant-title-keyname">工序</div>
                                <div class="gant-title-keyname">进度</div>
                            </div>
                            <div class="gant-contene">
                                <ul>
                                    <li v-for="(item,index) in podata.wt_info" style="display:flex" class="gant-line">
                                        <div class="gant-item" v-text="item.number">工单号</div>
                                        <div class="gant-item" v-text="item.operation_name">工序</div>
                                        <div class="gant-item" v-text="(100*item.wt_completion.split('/')[0]/item.wt_completion.split('/')[1]).toFixed(0) + '%'">进度</div>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div class="gant-right">
                            <div class="scroll-box" @mousedown="mousedown" :style="{left: -(this.startPosition*48) + 'px'}" >
                                <div class="gant-header">
                                    <div class="day-box" v-for="(month,index) in day_data">
                                        <div class="date-month" v-text="month+'月'"></div>
                                        <div class="date-day">
                                        <span class="date-day-item" v-for="day in getDaysOfMonth(month)"
                                                v-text="day"></span>
                                        </div>
                                    </div>
                                </div>
                                <div class="gant-contene">
                                    <ul>
                                        <li v-for="(item,index) in podata.wt_info" style="display:flex" class="gant-line-bar">
                                            <div v-if="item.simple_plan_start_time !=='0' && item.simple_plan_start_time !==''" class="gant-bar" :style="{backgroundColor:'#00C853', transform: 'translateX('+startDay(item.simple_plan_start_time, item.simple_plan_end_time)*48 +'px)', width:(endDay(item.simple_plan_start_time, item.simple_plan_end_time)*48)+'px' }">
                                                <!-- <div class="gant-bar-int" v-text="(100*item.wt_completion.split('/')[0]/item.wt_completion.split('/')[1]).toFixed(0) + '%'"></div> -->
                                            </div>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="route_line" style="width: 50%;float: left;margin-top:0;padding: 7px">
                        <div id="routing_graph" class="routing_graph"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="bottom-main">
        <!-- <h4 class="bottom-title">排产入口</h4> -->
        <div class="bottom-section">
            <div class="left-workOrderDetails">
                <h4 class="left-title"><span class="title-comm">工单详情</span></h4>
                <div class="wt-box" :class="{'showop':action}">
                    <ul class="select-coll">
                        <li class="common-border" v-for="(item,index) in podata.wt_info" :key="index">
                            <div class="common-wt" @mouseenter="showtipson($event,item,podata.commercial)" @mouseleave="showtipsoff()" @click="getwoOnce(item.wt_id,item.wt_status,index)">
                                <span class="wt wt-note" :style="{backgroundColor:colorList[index%3]}"> WT </span>
                                <span class="wt-number" v-text=item.number></span>
                                [<span class="work-process" v-text="getOperationName(item.operation_name)" :style="{backgroundColor:colorShallowList[index%3], color:colorList[index%3]}"> </span>]
                                [<span v-text="'已排['+podata.commercial+']：'+item.wt_completion"> [完成进度] </span>]
                                <span v-if="item.wt_status == 0" class="or-single-btn">未拆单</span>
                                <span v-else class="or-single-btn">已拆单</span>
                            </div>
                            <div class="wo-box" :style="{'height':now_index==index?wo_height+'px':'0px'}">
                                <div class="wo-list" v-for="(woitem,woindex) in wodata[item.wt_id]" :key="woindex"
                                    :draggable="woitem.status?false:true" @dragstart="dragStart(woitem, $event)">
                                    <span class="wo" :class="{'woDisEable':woitem.status}">WO</span>
                                    <span v-if="!woitem.status && woitem.qty>1" style="background: #009DF0; color: #fff; padding: 2px 3px; border-radius: 4px;" @click="woSplitModal(woitem)">拆</span>
                                    <i class="fa fa-info-circle wo-deinfo" @click="woDetail(woitem)"></i>
                                    <span v-text="woitem.number"></span>
                                    (数量[<span v-text="woitem.commercial"></span>]：<span v-text="woitem.qty"></span>)
                                    <span v-if="woitem.status" class="right is-single" style="background-color: #5B9BD5;">已排</span>
                                    <span v-else class="right no-single">未排</span>
                                </div>
                                <div class="wo-list" @click="getwo(item.wt_id)" v-show="woshow[item.wt_id]">
                                    加载更多
                                </div>
                            </div>
                        </li>
                    </ul>

                </div>
            </div>
            <div class="right-workCenter">
                <h4 class="workCenter-title"><span style="color: #FFA04D; padding: 4px;background: #FFFCDC;border-radius:2px;">请选择工作中心，并拖入WO进行排产<span></h4>
                <div style="padding-left: 10px; margin-top:12px;display: flex;justify-content: flex-start;align-items: center">
                    <span><span style="padding: 3px 6px; border-radius: 3px; font-size: 18px; color: #0097E7; margin-right: 20px;">排产入口</span>
                    <!-- <i class="note-tip">>></i></span> -->
                    <span style="font-size: 16px; color: '#333';">请选择排产时间段</span>&nbsp;&nbsp;&nbsp;&nbsp;
                    <input style="font-size: 16px; color: '#333'; width:260px;" type="text" class="layui-input date-select" placeholder="请选择时间周期">
                    <span style="color: red;font-size:14px;margin-left:20px;padding-top: 14px;" v-text='selectDateWarn'></span>
                </div>
                <div class="product-workshorp">
                    <div class='work_center_item' v-for="(item,index) in work_center_group" :key="index"  @dragover="dang($event)" @drop="dong(item, $event)" @click="operationDetail(item, index)">
                        <div class='item_infor'><span class="circle"></span><span v-text="item.factory_name + ' >> '"></span> <span v-text="item.workshop_name + ' >> '"></span> <span class="infor_name" v-text="item.workcenter_name"></span>[ <span v-text="item.workcenter_code"></span> ]<span class="infor_opName work-process" :style="{color:getSub(item.operation_id, 'deep'), backgroundColor:getSub(item.operation_id, 'shallow')}" v-text="item.operation_name"></span><span class="infor_all">总产能：</span><span v-text='item.all_ability_capacity'></span>[s]<span class="infor_remain">剩余产能：</span><span v-text='item.all_ability_capacity_remain'></span>[s]</div>
                        <div class='item_progress_out'>
                            <div v-text="workCenterProgress(item.all_ability_capacity, item.all_ability_capacity_remain, '1')" class='item_progress_in' :style="{backgroundColor:getSub(item.operation_id, 'deep'),width: workCenterProgress(item.all_ability_capacity, item.all_ability_capacity_remain, '2') }"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
    </div>
    
    <form id="dialog" class="selectCapacity formModal formMateriel" style="display: none;">
        <div class="el-tap-wrap edit">
            <span data-item="woWcenter_from" class="el-tap active">工作中心的能力</span>
            <span data-item="woAbs_from" class="el-tap">工单中步骤的能力</span>
        </div>
        <div class="el-panel-wrap" style="margin-top: 20px;">
            <div class="el-panel woWcenter_from active">
                <div class="woAbility">
                    <div class="womodal-wrap" v-for="(item,index) in workCenterAbilityList" :key="index">
                        <label class="el-radio" >
                            <span class="el-radio-input" :class="{'is-radio-checked': index == isIndex}">
                                <span class="el-radio-inner" @click="selectWorkCenterAbility(item, index)"></span>
                                <input class="wowkcapacity" name='workCenterAbility' type="hidden" :value="item.operation_to_ability_id">
                            </span>
                            <span class="el-radio-label" v-text="item.ability_name"></span>
                        </label>
                    </div>
                </div>
            </div>
            <div class="el-panel woAbs_from">
                <div class="chooseWOAbility tabbable tabs-left">
                    <ul id="chooseWOCapacityTab" class="nav nav-tabs">
                        <template>
                            <li v-for="(item,index) in workOrderAbilityList" @click="selectOrderAbility(item, index)" :key="index" :class="temp_selectAb == item.base_step_id?`active`:''">   
                                <a data-toggle="tab" :aria-expanded="temp_selectAb == item.base_step_id?true:false">
                                    <i class="item-dot expand-icon" ></i>
                                    <span v-text="item.step_name"></span>
                                </a>
                            </li>
                        </template>
                    </ul> 
                    <div id="chooseWOCapacityPane" class="tab-content">
                        <div class="womodal-wrap" v-for="(item,key) in workOrderChildAbility">
                            <label class="el-radio">
                                <span class="el-radio-input" :class="{'is-radio-checked': key == isOrderIndex}">
                                    <span class="el-radio-inner" @click="selectOrderChildAbility(item, key)"></span>
                                    <input class="wocapacity_gxid" type="hidden" :value="key">
                                </span>
                                <span class="el-radio-label" v-text="item"></span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <p class="errorMessage" style="text-align: right;display: block"></p>
        <div class="el-form-item btnShow">
            <div class="el-form-item-div btn-group" style="margin-top: 10px;">
                <button type="button" class="el-button el-button--primary submit capacity-submit" @click="trueSelectAbility()">确定</button>
            </div>
        </div>   
    </form>

    <form class="editWO formModal formMateriel" id="editWO" style="display: none;">
        <div class="el-tap-wrap edit">
            <span data-item="wo_from" class="el-tap active">已排工单</span>
            <span data-item="time_from" class="el-tap">工时产能集合</span>
        </div>
        <div class="modal-wrap">
            <div class="el-panel-wrap" style="margin-top: 20px;">
                <div class="el-panel wo_from active">
                    <div class="table_page">
                        <div id="pagenation" class="pagenation opwo"></div>
                        <div class="table-wrap" style="max-height: 600px;overflow-y: auto;">
                            <table class="sticky uniquetable commontable">
                                <thead>
                                    <tr>
                                        <th>生产订单号</th>
                                        <th>工单号</th>
                                        <th>数量[<span v-text="podata.commercial"></span>]</th>
                                        <th>所排能力</th>
                                        <th>所占产能[s]</th>
                                        <th>所排日期</th>
                                        <th class="right">操作</th>
                                    </tr>
                                </thead>
                                <tbody class="table_tbody">
                                    <tr v-for="(item, index) in dialogOpInforList" :key="index" class="tritem">
                                        <td v-text="item.production_order_number"></td>    
                                        <td v-text="item.number"></td>
                                        <td v-text="item.qty"></td>
                                        <td v-text="item.ability_name"></td>
                                        <td v-text="item.total_workhour"></td>
                                        <td v-text="dateFormat(item.work_station_time)"></td>
                                        <td class="right">
                                            <button type="button" class="el-button btn-wo-del" :class="{'btn-remove-disabled': Number(item.production_order_id) !== Number(opId)}" :disabled="Number(item.production_order_id) !== Number(opId)"  @click="removeWorkorder(item)">移除</button>
                                        </td>
                                    </tr>
                                    <tr v-if="dialogOpInforList.length == 0" class="tritem"><td style="text-align: center;" colspan="7">暂无数据</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                <div class="el-panel time_from">
                    <div class="table_page">
                        <div class="table-wrap" style="max-height: ${height};overflow-y: auto;">
                            <table class="sticky uniquetable commontable">
                                <thead>
                                    <tr>
                                        <th>能力</th>
                                        <th>总产能[s]</th>
                                        <th>剩余产能[s]</th>
                                    </tr>
                                </thead>
                                <tbody class="table_tbody">  
                                    <tr v-for="(item, index) in dialogAbilityList" :key="index" class="tritem" data-opa-id="${item.operation_to_ability_id}">
                                        <td v-text="item.ability_name"></td>
                                        <td v-text="item.capacity_total"></td>
                                        <td v-text="item.capacity_remain"></td>
                                    </tr>
                                    <tr v-if="dialogAbilityList.length == 0" class="tritem"><td style="text-align: center;" colspan="3">暂无数据</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </form>

    <!-- 工单详情 -->
    <div id="workOrderDialog" class="wo-deinfo-wrap" style="display: none; max-height: 600px;overflow-y: auto;position: relative;">
        <button v-if="woDetailList.status == 0 && inMaterialList.length !== 0" type="button" class="el-button el-button--primary" style="position: absolute; right: 126px;" @click="saveInMaterial()">保存</button>
        <div class="qrcode-conten">
            <div id="qrcode11" style="width:100px; height:100px;">
                <div id="qrCodeIco11"></div>
            </div>
        </div>
        <div class="block-div" style="height: 100px;">
            <div class="basic-infos">
                <p><span>&nbsp;&nbsp;工单号：<span class="highlight wt-number" v-text="workOrderList.wo_number"></span><input type="hidden" class="wt-input-number"> </span></p>
                <p><span>&nbsp;&nbsp;数量[<span v-text="woDetailList.commercial"></span>]：<span class="highlight" v-text="woDetailList.qty"></span></span>&nbsp;&nbsp;&nbsp;&nbsp;<span>工序：<span class="highlight" v-text="woDetailList.operation_name"></span></span></p>
                <p v-if="woDetailList.status"><span>&nbsp;&nbsp;总工时：<span v-text="woDetailList.total_workhour"></span>s</span></p>
            </div>
        </div>
        <div v-if="woDetailList.status == 1" class="block-div">
            <h4>排单详情</h4>
            <div class="basic_info yipai_info">
                <div class="table-wrap">
                    <table class="sticky uniquetable commontable">
                        <thead>
                            <tr>
                                <th>排单日期</th>
                                <th>工厂</th>
                                <th>车间</th>
                                <th>工作中心</th>
                                <th>工作中心的能力</th>
                            </tr>
                        </thead>
                        <tbody class="table_tbody">
                            <tr>   
                                <td><span id="workorder_time" v-text="dateFormat(workOrderList.work_station_time)"></span></td>
                                <td><span id="factory_name" v-text="workOrderList.factory_name"></span></td>
                                <td><span id="workshop_name" v-text="workOrderList.workshop_name"></span></td>
                                <td><span id="workcenter_name" v-text="workOrderList.workcenter_name"></span></td>
                                <td><span id="workcenter_ability" v-text="workOrderList.ability_name"></span></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        <div class="block-div">
            <h4>进料</h4>
            <div class="basic-info income">
                <div class="table_page">
                    <div class="table-wrap">
                        <table class="sticky uniquetable commontable">
                            <thead>
                                <tr>
                                    <th v-if="woDetailList.status == 0"></th>
                                    <th>编码</th>
                                    <th>名称</th>
                                    <th>数量</th>
                                    <th>物料属性</th>
                                    <th>工艺属性</th>
                                    <th>图纸</th>
                                    <th>是否排单</th>
                                </tr>
                            </thead>
                            <tbody class="table_tbody">
                                <template  v-for="(item, index) in inMaterialList" >
                                    <tr>
                                        <td v-if="woDetailList.status == 0"><button type="button" @click="deleteInMaterial(item.material_id)">删除</button></td>
                                        <td v-text="item.item_no"></td>
                                        <td v-text="item.name"></td>
                                        <td v-text="item.qty + '[' + (item.bom_commercial || item.material_commercial) + ']'"></td>
                                        <td>
                                            <p v-for="(k, index) in item.material_attributes" :key="index"><span v-text="k.name + '：'"></span><span v-text="k.value + (k.unit?k.unit:'')"></span></p>
                                        </td>
                                        <td>
                                            <p v-for="(k, index) in item.operation_attributes" :key="index"><span v-text="k.name + '：'"></span><span v-text="k.value + (k.unit?k.unit:'')"></span></p>
                                        </td>
                                        <td>
                                            <p v-for="(k, index) in item.drawings" :key="index" :attachment_id="k.drawing_id" :data-creator="k.creator_name" :data-ctime="k.ctime" :data-url="k.image_path"  :title="k.name"><img class="pic-img" onerror="this.onerror=null;this.src='/statics/custom/img/logo_default.png'" width="80" height="40" :src="'/storage/' + k.image_path" :data-src="'/storage/' + k.image_path" :alt="k.name"></p>
                                        </td>
                                        <td v-text="woDetailList.status == 0? '未排' : '已排'"></td>
                                    </tr>
                                    <tr v-if="item.material_replace_no">
                                        <td colspan="7" style="padding:0;"><h4 style="background: #D8E8E3">被替换的物料</h4></td>
                                    </tr>
                                    <tr v-if="item.material_replace_no" style="background: #D8E8E3">
                                        <td v-text="item.material_replace.item_no"></td>
                                        <td v-text="item.material_replace.name"></td>
                                        <td v-text="item.material_replace.qty + '[' + (item.material_replace.bom_commercial || item.material_commercial) + ']'"></td>
                                        <td>
                                            <p v-for="(k, index) in item.material_replace.material_attributes" :key="index"><span v-text="k.name + '：'"></span><span v-text="k.value + (k.unit?k.unit:'')"></span></p>
                                        </td>
                                        <td>
                                            <p v-for="(k, index) in item.material_replace.operation_attributes" :key="index"><span v-text="k.name + '：'"></span><span v-text="k.value + (k.unit?k.unit:'')"></span></p>
                                        </td>
                                        <td>
                                            <p v-for="(k, index) in item.material_replace.drawings" :key="index" :attachment_id="k.drawing_id" :data-creator="k.creator_name" :data-ctime="k.ctime" :data-url="k.image_path"  :title="k.name"><img class="pic-img" onerror="this.onerror=null;this.src='/statics/custom/img/logo_default.png'" width="80" height="40" :src="'/storage/' + k.image_path" :data-src="'/storage/' + k.image_path" :alt="k.name"></p>
                                        </td>
                                        <td v-text="woDetailList.status == 0? '未排' : '已排'"></td>
                                    </tr>
                                </template>
                                <tr v-if="inMaterialList.length == 0"><td colspan="8">暂无数据</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
        <div class="block-div">
            <h4>出料</h4>
            <div class="basic-info outcome">
                <div class="table_page">
                        <div class="table-wrap">
                            <table class="sticky uniquetable commontable">
                                <thead>
                                    <tr>
                                        <th>编码</th>
                                        <th>名称</th>
                                        <th>数量</th>
                                        <th>物料属性</th>
                                        <th>工艺属性</th>
                                        <th>图纸</th>
                                        <th>是否排单</th>
                                    </tr>
                                </thead>
                                <tbody class="table_tbody">
                                    <tr v-for="(item, index) in outMaterialList" :key="index">
                                        <td v-text="item.item_no"></td>
                                        <td v-text="item.name"></td>
                                        <td v-text="item.qty + '[' + (item.bom_commercial || item.material_commercial) + ']'"></td>
                                        <td>
                                            <p v-for="(k, index) in item.material_attributes" :key="index"><span v-text="k.name + '：'"></span><span v-text="k.value + (k.unit?k.unit:'')"></span></p>
                                        </td>
                                        <td>
                                            <p v-for="(k, index) in item.operation_attributes" :key="index"><span v-text="k.name + '：'"></span><span v-text="k.value + (k.unit?k.unit:'')"></span></p>
                                        </td>
                                        <td>
                                            <p v-for="(k, index) in item.drawings" :key="index" :attachment_id="k.drawing_id" :data-creator="k.creator_name" :data-ctime="k.ctime" :data-url="k.image_path"  :title="k.name"><img class="pic-img" onerror="this.onerror=null;this.src='/statics/custom/img/logo_default.png'" width="80" height="40" :src="'/storage/' + k.image_path" :data-src="'/storage/' + k.image_path" :alt="k.name"></p>
                                        </td>
                                        <td v-text="woDetailList.status == 0? '未排' : '已排'"></td>
                                    </tr>
                                    <tr v-if="inMaterialList.length == 0"><td colspan="7">暂无数据</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
            </div>
        </div>
    </div> 
    <form style="display: none;" class="splitwo formModal formMateriel" id="splitWO" >
        <div class="modal-wrap" style="max-height: 400px;overflow-y: auto;">
            <div class="woinfo">
                <p><span>工单号：<span class="highlight" v-text="woSplitData.number"></span></span></p>
                <p><span>数量[<span v-text="woSplitData.commercial"></span>]：<span class="highlight" v-text="woSplitData.qty"></span></span></p>
                <p><span>工序：<span class="highlight" v-text="woSplitData.operation_name"></span></span><p>
            </div>
            <div class="el-form-item">
                <div class="el-form-item-div">
                    <label class="el-form-item-label" style="width: 118px;flex: none;">拆出数量[<span v-text="woSplitData.commercial"></span>]：<span class="mustItem">*</span></label>
                    <input v-model.number="splitWOqty" type="number" min="1" step="1" class="el-input" @focus="verification()" @blur="blurVerification()">
                </div>
                <p class="errorMessage" style="display: block;" v-text="hintSplitWO"></p>
            </div>
        </div>
        <div class="el-form-item">
            <div class="el-form-item-div btn-group" style="margin-top: 10px;">
                <button type="button" :class="{'btn-disabled': btnStatus}" class="el-button el-button--primary submit split-submit" :disabled="btnStatus" @click="woSplit()">确定</button>
            </div>
        </div>   
    </form> 
</div>
<script src="../../../statics/common/ace/assets/js/jquery-2.1.4.min.js"></script>
<script src="/statics/common/layer/layer.js?v={{$release}}"></script>
<script src="/statics/custom/js/custom-public.js?v={{$release}}"></script>
<script src="/statics/common/laydate/laydate.js"></script>
<script src="/statics/common/vue/vue.js"></script>
<script src="/statics/common/vue/axios.min.js"></script>
<script src="/statics/common/ace/assets/js/moment.min.js"></script>

<script>
    var aOrderList = [];
    var app = new Vue({
        delimiters: ['@{', '}'],
        el: '#appsss',
        data: {
            woDetailStatus: false,
            btnStatus: false,
            hintSplitWO: '',
            woSplitDialog: '',
            woSplitData: {},
            splitWOqty: '',
            initState: true,
            getaxiosallsLoad: '',
            getWorkCenterLoad: '',
            selectDateWarn: '',// 日历选择时间段超出po的截止时间 --- 状态
            routingId: '', // 工艺路线图 id
            dialogSelectAbility: '',
            inMaterialList: [], // 工单详情 --- 进料数据
            outMaterialList: [], // 工单详情 --- 出料数据
            woDetailList: '', // 工单详情 --- 对应wo数据
            workOrderList: '', // 工单详情
            currentWorkCenterIndex: 0,
            currentWorkCenterList: '',
            currentWtId: '',
            opId: '',
            dialogOpInforList: [], // 工单详情弹框 -- 已排工单
            dialogAbilityList: [], // 工单详情弹框 -- 工时产能集合
            centerStartData: null,
            centerEndData: null,
            startData: '',
            endData: '',
            isIndex: null,
            isOrderIndex: null,
            workOrderChildAbility: {},
            workCenterAbilityList: [],
            workOrderAbilityList: [],
            checkDataList: null,
            colorList: ['#5D8BF3', '#4BBF6D', '#03D6DB'],
            colorShallowList: ['#CED8F6', '#C9F4D1', '#CCFCFF'],
            wtWorkCenterIndex: [],
            statt: '40px',
            action: true,
            //===============================================
            podata: {}, //第一个请求获取到的 #po数据 //--->podata.wt_info 代表了当前PO下面的所有wt 这是一个数组
            wodata: {}, //所有wt下的wo 的合集 #wo数据
            woshow: {}, //所有wt下的wo加载更多 的合集 #wo数据   控制了每一个 wt里面的 [加载更多按钮] 是否显示
            wo_height: 0, // wo盒子的高度
            now_index: '-', //当前点击所在的WT box
            wo_flag: true, // 节流阀 wo 
            //==============gant 图相关参数
            day_data: [1, 2], //gant 图的月 数组  默认1 月
            startPosition: 0, // GANT图 进度条定位
            //===============================================
            gant_art: false, //gant和line 的切换 true 是工艺
            //===============================================
            work_center_group: [], //工作中心数组
            //=========================================
            // 排产请求涉及到的相关数据
            check_body: {
                ids: [],
                workshop_id: "",
                workcenter_id: "",
                workcenter_operation_to_ability_id: "",
                all_select_abilitys: {},
                start_time: "",
                end_time: ""
            },
            // 主排请求涉及到的相关数据
            main_body: {
                ids: [],
                work_task_id: "",
                factory_id: "",
                workshop_id: "",
                workcenter_id: "",
                workcenter_operation_to_ability_id: "",
                all_select_abilitys: {},
                start_time: "",
                end_time: "",
                operation_id: ""
            },
            temp_selectAb: ''
        },
        created() {
            this.opId = this.getQuery('production_order_id');
            this.axiosalls(); // 这是podata 的获取
        },
        watch: {
            work_center_group(val, oldVal) {
                this.dialogAbilityList = val[this.currentWorkCenterIndex].operation_ability;
            }
        },
        methods: {
            // 
            deleteInMaterial(materialId) {
                this.inMaterialList = this.inMaterialList.filter(function(item) {
                    return item.material_id !== materialId;
                });
            },
            // 保存删除后的进料
            saveInMaterial() {
                var workOrderId = this.workOrderList.work_order_id;
                var inMaterialJson = JSON.stringify(this.inMaterialList);
                var url = `/WorkOrder/edit`;
                axios.post(url, {
                    _token: '8b5491b17a70e24107c89f37b1036078',
                    work_order_id: workOrderId,
                    in_material: inMaterialJson
                }).then(res => {
                    if(res.data.code == '200') {
                        LayerConfig('success', '删除成功');
                        
                    } else{
                        LayerConfig('fail', res.data.message);
                    }
                }).catch(error => {
                    console.log('error: ' + error);
                })
            },
            // WT 工序展示字符长度超过5的保留前四位后面加...
            getOperationName(opName) {
                if(opName.length > 5) {
                    opName = opName.substr(0,4) + '...';
                }
                return opName;
            },
            verification() {
                this.hintSplitWO = '最大输入数量：' + (this.woSplitData.qty - 1);
            },
            blurVerification() {
                if(this.splitWOqty >= this.woSplitData.qty) {
                    this.splitWOqty = this.woSplitData.qty - 1;
                } else if(this.splitWOqty < 1) {
                    this.splitWOqty = 1;
                }
                this.hintSplitWO = '';
            },

            // 拆WO
            woSplitModal(obj){
                this.btnStatus = false;
                this.splitWOqty = '';
                this.hintSplitWO = '';
                this.woSplitData = obj;
                this.woSplitDialog=layer.open({
                    type: 1,
                    title: '拆单',
                    offset: '100px',
                    area: '350px',
                    shade: 0.1,
                    shadeClose: false,
                    resize: false,
                    move: false,
                    content: $("#splitWO")
                });
            },

            // 拆WO
            woSplit() {
                if(this.splitWOqty == '' && this.splitWOqty !== 0) {
                    this.hintSplitWO = '数量必填';
                    return;
                }
                if(this.woSplitData.qty == 1) {
                    this.hintSplitWO = '数量为1时，不可拆单';
                    return;
                }
                this.btnStatus = true;
                var url = `/APS/splitWorkOrder`;
                axios.post(url, {
                    _token: '8b5491b17a70e24107c89f37b1036078',
                    id: this.woSplitData.work_order_id,
                    qty: this.splitWOqty
                }).then(res => { 
                    this.btnStatus = false;
                    if(res.data.code == '200') {
                        LayerConfig('success','拆单成功');
                        layer.close(this.woSplitDialog);
                        this.wodata[this.currentWtId] = [];
                        this.getwo(this.currentWtId);

                    } else {
                        LayerConfig('fail',res.data.message);
                    }
                    
                }).catch(error => {
                    this.btnStatus = false;
                    console.log(error);
                });
            },
            // 初始化页面
            initPg(routingId) {
                this.initState = false;
                this.dateselet(); //日期选择器
                this.setDayData(); // 获取query 上带过来的日期. 
                this.procedureRouteData(routingId);
            },
            // 获取下标
            getSub(opId, state) {
                
                for(var i=0;i<this.wtWorkCenterIndex.length;i++){
                    if(this.wtWorkCenterIndex[i] == opId){
                        if(state == 'shallow') {
                            return this.colorShallowList[i%3];
                        } else {
                            return this.colorList[i%3];
                        }
                      
                    }
                }
                return '#666';
            },
            // 移除已排工单
            removeWorkorder(obj) {
                var _this = this;
                let url = `/APS/destroy`;
                
                axios.get(url, {
                    params: {
                        _token: "8b5491b17a70e24107c89f37b1036078",
                        id: obj.id
                    }
                }).then(res => {
                    if(res.data.code == '200') {
                        LayerConfig('success', '移除成功',function(){
                            var allTime = _this.currentWorkCenterList.all_ability_capacity;
                            var remainTime = _this.currentWorkCenterList.all_ability_capacity_remain + obj.total_workhour;
                            var useTime = allTime - remainTime;
                            var usePercentage = (100*useTime/allTime).toFixed(2) + '%';
                            $(".wo-title .wo-percent b").html(usePercentage);
                            _this.dialogOpInforList = _this.dialogOpInforList.filter(function(item){
                                return item.id != obj.id;
                            });
                            _this.axiosalls(); // 这是podata 的获取
                            // 打开节流阀
                            _this.wo_flag = true;
                            _this.currentWtId = obj.operation_order_id;
                            if(_this.currentWtId) {
                                _this.wodata[_this.currentWtId] = [];
                                _this.getwo(_this.currentWtId);
                            }
                        });
                        
                    } else{
                        LayerConfig('fail', res.data.message);
                    }
                }).catch(error => {
                    console.log(error, '删除工序下的工单失败');
                })
            },
            // 主排接口
            simplePlanByPeriodFu() {
                _this = this;
                this.main_body.ids = this.check_body.ids;
                this.main_body.workshop_id = this.check_body.workshop_id;
                this.main_body.workcenter_id = this.check_body.workcenter_id;
                this.main_body.workcenter_operation_to_ability_id = this.check_body.workcenter_operation_to_ability_id;
                this.main_body.all_select_abilitys = this.check_body.all_select_abilitys;
                this.main_body.start_time = this.check_body.start_time;
                this.main_body.end_time = this.check_body.end_time;
                
                var url = `/APS/simplePlanByPeriod?_token=8b5491b17a70e24107c89f37b1036078`
                axios.post(url, this.main_body).then(res => {
                    if(res.data.code == 200) {
                        
                        LayerConfig('success','排产成功',function(){
                           
                            _this.axiosalls(); // 这是podata 的获取
                            // 打开节流阀
                            _this.wo_flag = true;
                            
                            if(_this.currentWtId) {
                                _this.wodata[_this.currentWtId] = [];
                                _this.getwo(_this.currentWtId);
                            }
                            layer.close(_this.dialogSelectAbilityLoad); 
                        });
                    } else {
                        layer.close(this.dialogSelectAbilityLoad); 
                        LayerConfig('fail', res.data.message);
                    }
                }).catch(error => {
                    layer.close(this.dialogSelectAbilityLoad); 
                    console.log('error: ' + error);
                })
            },
            
            // 确定选择能力
            trueSelectAbility() {
                layer.close(this.dialogSelectAbility);
                if(typeof this.check_body.all_select_abilitys == 'string') {
                    this.check_body.all_select_abilitys = JSON.parse(this.check_body.all_select_abilitys);
                }
                var isSame = false;
                var lastAbility = this.workOrderAbilityList[this.workOrderAbilityList.length-1].base_step_id;
                var arrKeyList = Object.keys(this.check_body.all_select_abilitys);
                if(this.check_body.workcenter_operation_to_ability_id == '') {
                    LayerConfig('fail', '请选择工作中心能力！');
                    return false;
                }
                if(arrKeyList.length == 0 || this.check_body.all_select_abilitys == '') {
                    LayerConfig('fail', '请选择出料步骤的能力！');
                    return false;
                }
                
                if(this.check_body.workcenter_operation_to_ability_id == this.check_body.all_select_abilitys[String(lastAbility)]) {
                    isSame = true;
                }
              
                if(!isSame) {
                    LayerConfig('fail', '工作中心和WO步骤中出料选择的能力必须相同！');
                    return false;
                }
                
                if(typeof this.check_body.all_select_abilitys == 'object') {
                    this.check_body.all_select_abilitys = JSON.stringify(this.check_body.all_select_abilitys);
                }

                this.check_body.start_time = this.check_body.start_time?this.check_body.start_time:this.startData;
                this.check_body.end_time = this.check_body.end_time?this.check_body.end_time:this.endData;
                
                this.dialogSelectAbilityLoad = layer.load(2, {shade: 0.3,offset: '200px'});
                var url = `/APS/checkCanPlanByPeriod?_token=8b5491b17a70e24107c89f37b1036078`
                axios.post(url, this.check_body).then(res => {
                    if(res.data.code == 200) {
                        this.simplePlanByPeriodFu();
                    } else {
                        layer.close(this.dialogSelectAbilityLoad); 
                        LayerConfig('fail', res.data.message);
                    }
                    
                }).catch(error => {
                    layer.close(this.dialogSelectAbilityLoad); 
                    console.log('error: ' + error);
                })
            },

            // 工作中心能力选择
            selectWorkCenterAbility(item, index) {
                this.isIndex = index;
                this.check_body.workcenter_operation_to_ability_id = item.operation_to_ability_id;
            },

            // wo能力选择
            selectOrderAbility(item, index) {
                this.workOrderChildAbility = item.abilitys;
                this.temp_selectAb = item.base_step_id;
                this.isOrderIndex = this.check_body.all_select_abilitys[this.temp_selectAb];
            },

            // wo能力选择child 
            selectOrderChildAbility(item, index) {
                this.isOrderIndex = index;
                if(this.temp_selectAb) {
                    this.check_body.all_select_abilitys[this.temp_selectAb] = index;
                } else {
                    this.check_body.all_select_abilitys[this.workOrderAbilityList[0].base_step_id] = index;
                }
            },

            // 初始化能力选择
            initAbility() {
                this.check_body.all_select_abilitys = {};
                // var arrFirst = Object.keys(this.workOrderAbilityList[0].abilitys);
                
                this.temp_selectAb = this.workOrderAbilityList[this.workOrderAbilityList.length-1].base_step_id;
                this.isIndex = 0;
                // this.isOrderIndex = arrFirst[0];
                
                this.check_body.workcenter_operation_to_ability_id = this.workCenterAbilityList.length == 0?'':this.workCenterAbilityList[0].operation_to_ability_id;
                // this.check_body.all_select_abilitys[this.temp_selectAb] = arrFirst[0];

                if(this.workOrderAbilityList.length) {
                    var _this = this;
                    this.workOrderAbilityList.forEach(function(item, index) {
                        var arrDefaultFirst = Object.keys(item.abilitys);
                        _this.check_body.all_select_abilitys[item.base_step_id] = arrDefaultFirst[0];
                        if(index == (_this.workOrderAbilityList.length - 1)) {
                            _this.isOrderIndex = arrDefaultFirst[0];
                        }
                    });
                }

            },

            // 动态创建日期选择器
            dateselet() {
                _this = this;
                _this.selectDateWarn = '';
                let temp_date = '';
                temp_date = this.startData+ ' - ' + this.endData;
               
                if(sessionStorage.getItem('userSetDate')) {
                    // 取值时：把获取到的Json字符串转换回对象
                    var userSetDate = sessionStorage.getItem('userSetDate');
                    var userEntity = JSON.parse(userSetDate);
                    if(userEntity.startDate && userEntity.endDate) {
                        temp_date = userEntity.startDate+ ' - ' + userEntity.endDate;
                        _this.check_body.start_time = userEntity.startDate;
                        _this.check_body.end_time = userEntity.endDate;
                        _this.centerStartData = userEntity.startDate;
                        _this.centerEndData = userEntity.endDate;
                    } else {
                        _temp_date = this.startData+ ' - ' + this.endData;
                        _this.check_body.start_time = this.startData;
                        _this.check_body.end_time = this.endData;
                        _this.centerStartData = this.startData;
                        _this.centerEndData = this.endData;
                    }

                    if (moment(_this.check_body.end_time).isAfter(_this.endData)) {
                        _this.selectDateWarn = '注意日历选择时间段已超出当前生产订单的截止时间';
                        setTimeout(function() {
                            _this.selectDateWarn = '';
                        },  5000 )
                    } else {
                        _this.selectDateWarn = '';
                    }
                    
                } else {
                    _this.check_body.start_time = this.startData;
                    _this.check_body.end_time = this.endData;
                    _this.centerStartData = this.startData;
                    _this.centerEndData = this.endData;
                }
                
                $('.date-select').val(temp_date);
               
                var layDateui = laydate.render({
                    elem: '.date-select', //绑定在元素上
                    range: true, //默认创建的时候就显示
                    format: 'yyyy-MM-dd',
                    trigger: 'click', //触发的条件
                   // value: temp_date,
                   // isInitValue: true,
                    min: 0,
                    max: 365,
                    done: function(value, date, endDate){ 
                        _this.selectDateWarn = '';
                        _this.check_body.start_time = value.split(' - ')[0];
                        _this.check_body.end_time = value.split(' - ')[1];
                        _this.centerStartData = value.split(' - ')[0];
                        _this.centerEndData = value.split(' - ')[1];
                        if(moment(_this.check_body.start_time).isAfter(_this.check_body.end_time)) {
                            _this.check_body.start_time = value.split(' - ')[1];
                            _this.check_body.end_time = value.split(' - ')[0];
                            _this.centerStartData = value.split(' - ')[1];
                            _this.centerEndData = value.split(' - ')[0];
                        } 
                        var userSetDate = {
                            startDate: _this.centerStartData,
                            endDate: _this.centerEndData
                        };
                        
                        // 存储值：将对象转换为Json字符串
                        window.sessionStorage.setItem('userSetDate', JSON.stringify(userSetDate));
                        

                        if (_this.check_body.start_time && _this.check_body.end_time) {
                            _this.getWorkCenterLoad = layer.load(2, {shade: 0.3,offset: '440px'});
                            _this.workCenter();
                        } else {
                            $('.date-select').val('');
                            $('.date-select').click(); 
                        }

                        if (moment(_this.check_body.end_time).isAfter(_this.endData)) {
                            _this.selectDateWarn = '注意日历选择时间段已超出当前生产订单的截止时间';
                            setTimeout(function() {
                                _this.selectDateWarn = '';
                            },  5000 )
                        } else {
                            _this.selectDateWarn = '';
                        }
                    }
                })
            },

            // 点击工作中心详情 工单弹框
            operationDetail(data, index) {
                this.currentWorkCenterList = data;
                this.currentWorkCenterIndex = index;
                var _this = this;
                this.dialogOpInforList = data.work_orders;
                this.dialogAbilityList = data.operation_ability;
                var height=($(window).height()-200)+'px';
                var labelWidth=100;
                        
                var title=`<p class="wo-title"><span>${data.operation_name}</span>
                    <span>(${data.operation_code})</span>
                    <span class="wo-time">标准工时: <b>${data.all_ability_capacity}</b>[s]</span>
                    <span class="wo-percent">占用比: <b>${data.all_ability_capacity?((100*(data.all_ability_capacity-data.all_ability_capacity_remain)/data.all_ability_capacity)).toFixed(2):'0'}%</b></span></p>`;
                layerModal=layer.open({
                    type: 1,
                    title: title,
                    offset: '100px',
                    area: '700px',
                    shade: 0.1,
                    shadeClose: false,
                    resize: false,
                    move: '.layui-layer-title',
                    content: $("#editWO"),
                    success: function(layero,index){
                        layerEle=layero;
                    },
                    end: function(){
                        layerEle=null;
                        hasOPEvent=null;
                    }
                });
            },

            // 获取当前的时间:yyyy-mm-dd
            getCurrentDate(fdate){
                var date = fdate? fdate:new Date();
                var d = date.getDate();
                var m = date.getMonth()+1;
                var y = date.getFullYear();
                d<10?d='0'+d:null;
                m<10?m='0'+m:null;

                return y+'-'+m+'-'+d;
            },

            // 工单详情按钮
            woDetail(data) {
                this.woDetailList = data;
                let url = `/WorkOrder/show`;
                if(this.woDetailStatus) {
                    return;
                }
                this.woDetailStatus = true;
                axios.get(url, {
                    params: {
                        _token: "8b5491b17a70e24107c89f37b1036078",
                        work_order_id: data.work_order_id
                    }
                }).then(res => {
                    
                    if(res&&res.data.results){
                        this.workOrderList = res.data.results;
                        this.inMaterialList = JSON.parse(this.workOrderList.in_material);
                        this.outMaterialList = JSON.parse(this.workOrderList.out_material);
                        
                        let _this = this;
                        var height=($(window).height()-250)+'px';
                        var title=`工单${data.number}详情`;
                        layerModal=layer.open({
                            type: 1,
                            title: title,
                            offset: '80px',
                            area: '1000px',
                            shade: 0.1,
                            shadeClose: true,
                            resize: false,
                            content: $('#workOrderDialog'),
                            success: function(layero, index){
                                $("#qrcode11").html('');
                                //二维码
                                var qrcode = new QRCode(document.getElementById("qrcode11"), {
                                    width: 100,
                                    height: 100,
                                });
                                
                                _this.makeCode(_this.workOrderList.po_number, _this.workOrderList.sales_order_code, _this.workOrderList.wo_number, _this.workOrderList.qty, _this.workOrderList.work_order_id, qrcode);
                                
                            },
                            cancel: function() {
                                _this.woDetailStatus = false;
                            },
                            end: function(){
                                $("#qrCodeIco11").html('');
                                _this.woDetailStatus = false;
                            }
                        });
                        
                    }
                }).catch(error => {
                    console.log(error, '获取工单详情失败');
                })
            },
            
            // 二维码
            makeCode(po_number, sales_order_code, wo_number, qty, work_order_id, qrcode) {
                var elText = "生产订单号：" + po_number + "\r\n销售订单号：" + sales_order_code + "\r\n工单：" + wo_number + "\r\n工单数量[PCS]：" + qty + "\r\n工单Id：" + work_order_id;
                qrcode.makeCode(elText);
            },
            
            // 时间戳转换成指定格式日期
            // dateFormat(11111111111111, 'Y年m月d日 H时i分')
            dateFormat (timestamp, formats) {
                // formats格式包括
                // 1. Y-m-d
                // 2. Y-m-d H:i:s
                // 3. Y年m月d日
                // 4. Y年m月d日 H时i分
                formats = formats || 'Y-m-d';

                var zero = function (value) {
                    if (value < 10) {
                        return '0' + value;
                    }
                    return value;
                };

                var myDate = timestamp? new Date(timestamp*1000): new Date();

                var year = myDate.getFullYear();
                var month = zero(myDate.getMonth() + 1);
                var day = zero(myDate.getDate());

                var hour = zero(myDate.getHours());
                var minite = zero(myDate.getMinutes());
                var second = zero(myDate.getSeconds());

                return formats.replace(/Y|m|d|H|i|s/ig, function (matches) {
                    return ({
                        Y: year,
                        m: month,
                        d: day,
                        H: hour,
                        i: minite,
                        s: second
                    })[matches];
                });
            },

            setDayData() { //获取当前会处于那几个月
               
                let star_a = moment(new Date()).format('MM'); 
                let length = 12;
                for (var index = 0; index <= length; index++) {
                    if(Number(star_a) + index > 12) {
                        this.day_data[index] = Number(star_a) + index - 12;
                    } else {
                        this.day_data[index] = Number(star_a) + index;
                    }
                }
            },
            //这是每个月的天数
            getDaysOfMonth(month) {
                var year = moment(new Date()).format('YYYY'); 
                
                var date = new Date(year, month, 0);
                var days = date.getDate();
                if(month == 12) {
                    this.year++;
                }
                return days;
            }, //获取 query
            getQuery(name) {
                
                var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
                var r = window.location.search.substr(1).match(reg);
                if (r != null) return unescape(r[2]);
                return null;
            },

            // =============================================================================================================
            //gant图的拖动事件
            mousedown(e) {
                let odiv = e.currentTarget; //获取目标元素

                let gantright = document.querySelector('.gant').offsetWidth - 320
                let max_move = e.currentTarget.scrollWidth - gantright

                //算出鼠标相对元素的位置
                let disX = e.clientX - odiv.offsetLeft;
                document.onmousemove = (e) => { //鼠标按下并移动的事件
                    //用鼠标的位置减去鼠标相对元素的位置，得到元素的位置
                    let left = e.clientX - disX;
                    left > 0 ? left = 0 : left;
                    left < -max_move ? left = -max_move : left;
                    //移动当前元素
                    odiv.style.left = left + 'px';
                };
                document.onmouseup = (e) => {
                    document.onmousemove = null;
                    document.onmouseup = null;
                };
            },
            //获取 #po数据
            axiosalls() {
                // this.getaxiosallsLoad = LayerConfig('load');
                
                var url = `/APS/getProductOrderInfo?`;
                axios.get(url, {
                        params: {
                            _token: "8b5491b17a70e24107c89f37b1036078",
                            // material_id: "196",
                            page_no: 1,
                            page_size: 20,
                            sort: 'id', //id
                            order: 'asc', //desc
                            operation_ids: "",
                            production_order_id: this.opId
                        }
                    }).then(res => {
                        
                        this.podata = res.data.results;
                        this.startData = this.dateFormat(res.data.results.start_date);
                        this.endData = this.dateFormat(res.data.results.end_date);
                       
                        if(this.initState) {
                            this.centerStartData = this.dateFormat(res.data.results.start_date);
                            this.centerEndData = this.dateFormat(res.data.results.end_date);
                            this.check_body.start_time = this.dateFormat(res.data.results.start_date);
                            this.check_body.end_time = this.dateFormat(res.data.results.end_date);
                            this.routingId = res.data.results.routing_id;
                            _this = this;
                            if(_this.podata.wt_info.length) {
                                _this.podata.wt_info.forEach(function(item,index){
                                    _this.wtWorkCenterIndex[index] = item.operation_id;
                                });
                            }
                            this.initPg(res.data.results.routing_id);
                        }
                       
                        this.workCenter();
                        // layer.close(this.getaxiosallsLoad);
                    }).catch(error => {
                        // layer.close(this.getaxiosallsLoad);
                    })
            },

            // GANT图 进度条开始天数
            startDay(startTime, endTime) {
                if( startTime == '' || startTime == '0' ) {
                    return 0;
                }

                if(this.startPosition == 0) {
                    this.startPosition = moment(this.dateFormat(startTime)).get('date') - 1;
                }
                
                return moment(this.dateFormat(startTime)).get('date') - 1;
            },
            // GANT图 进度条结束天数
            endDay(startTime, endTime) {
                if( startTime == '' || startTime == '0' ) {
                    return 0;
                }
                
                var a = moment(this.dateFormat(startTime));
                var b = moment(this.dateFormat(endTime));
                
                return b.diff(a, 'days') + 1;
            },

            //获取wt下的wo 1次
            getwoOnce(e, wtStatus, f) {
                // if(wtStatus == 0) {
                //     layer.alert('请点击拆，进行拆单', {icon: 6}); 
                //     return;
                // }
                
                this.currentWtId = e;
                //当前点击对象的赋值
                this.now_index == f ? this.now_index = '-' : this.now_index = f
                
                if (this.wodata[e]) {
                    //控制当前wT下方对应的  WO 显示高度 -用于控制渐变
                    this.wo_height = (this.wodata[e].length + 1) * 40
                    return false;
                } else {
                    //当没有数据的时候的高度重置
                    this.wo_height = 0
                }
                
                this.getwo(e)
            },

            //获取wt下的wo
            getwo(e) { //e 就是wt_id 的值
                //判断并计算请求页
                var pageno = 1;
                if (this.wodata[e] && this.wodata[e].length > 0) {
                    pageno = this.wodata[e].length / 5;
                    pageno++;
                } else {
                    pageno = 1
                }
              
                //节流阀
                if (!this.wo_flag) {
                    return false
                }
               
                this.wo_flag = false;
                var url = `/APS/getWorkOrder`
                axios.get(url, {
                        params: {
                            _token: "8b5491b17a70e24107c89f37b1036078", //这是固定的验证码
                            page_no: pageno, //这是起始条数
                            page_size: 5, // 每次=拉取的数量  这个默认是5条
                            sort: 'id', //id  这个不知道是啥 固定的
                            order: 'asc', //desc   这个也不知道是啥  固定的
                            status: '', // 这个我兰原来的页面也没有备注
                            work_task_id: e // 这个就是WT的ID啦,点击的时候就能获取到
                        }
                    })
                    .then(res => {
                        //判断是否已经获取了所有数据,控制 加载更多按钮是否显示
                        this.woshow[e] = (res.data.paging.total_records - pageno * 5 > 0);
                        //处理v-for 深层对象赋值变化时无法监听并渲染的问题
                        this.wodata[e] ? this.wodata[e] = this.wodata[e] : this.wodata[e] = [];
                        this.wodata[e] = this.wodata[e].concat(res.data.results);
                       
                        var wodata_clone = this.wodata;
                        this.wodata = {};
                        this.wodata = wodata_clone;
                       
                        //控制当前wT下方对应的  WO 显示高度 -用于控制渐变
                        this.wo_height = (this.wodata[e].length + 1) * 40;
                       
                        //打开节流阀
                        this.wo_flag = true;
                    })
                    .catch(error => {
                        //打开节流阀   节流阀用于避免客户多次点击 发送冗余 的请求和事件   属于优化,可自行更改 
                        this.wo_flag = true;
                    })
            },
            //拖动确认
            dragStart(e, ev) {
                ev = ev||window.event;
                // ev.preventDefault(); 
                ev.dataTransfer.setData("数据的MIME（非空字符串）","数据");
               
                this.checkDataList = e;
                //拖动的时候避免被气泡阻挡 关闭气泡tip  
                // layer.close(tip_index)
                //拖动时候获取
                //这个返回的值有点尴尬, 里面居然有一个字段需要自己去做json 的处理妈耶
                var abilitysObj = JSON.parse(e.group_step_withnames);
                this.check_body.ids = [e.work_order_id];
                this.main_body.work_task_id = e.work_task_id;
                this.main_body.operation_id = e.operation_id;
               
                this.workOrderAbilityList = abilitysObj;
                this.workOrderChildAbility = this.workOrderAbilityList[this.workOrderAbilityList.length-1].abilitys;
            },
            dang(e) { //dragover.prevent默认事件的去除,不然会影响-并阻塞@drop事件的的触发
                e = e||window.event;
                e.preventDefault(); 
            },
            dong(obj, e) {
                e = e||window.event;
                e.preventDefault(); 
                this.workCenterAbilityList = obj.operation_ability;
                this.check_body.workshop_id = obj.workshop_id;
                this.check_body.workcenter_id = obj.workcenter_id;
                this.main_body.factory_id = obj.factory_id;
                this.initAbility();
                if(this.checkDataList.operation_id !== obj.operation_id) {
                    LayerConfig('fail', '当前工序不同');
                    return false;
                }
                
                var height=($(window).height()-200)+'px',
                title=`<p class="wo-title">请选择能力和步骤</p>`;
                this.dialogSelectAbility = layer.open({
                    type: 1,
                    title: title,
                    offset: '80px',
                    area: '500px',
                    shade: 0.1,
                    shadeClose: false,
                    resize: false,
                    content: $('#dialog') //这里content是一个DOM，注意：最好该元素要存放在body最外层，否则可能被其它的相对元素所影响
                });
            },

            //   鼠标结果 显示tips
            showtipson(e, f, commercial) { //e 事件对象 f 传递的参数 WT参数
                var num =
                    `  
                    <div class="wo-tips">
                        <ul>
                            <li>工单：${f.number}</li>
                            <li>工序：${f.operation_name}</li>
                            <li>出料编码：${f.item_no}</li>
                            <li>出料名称：${f.out_material_name}</li>
                            <li>数量[${commercial}]：${f.qty}</li>
                            <li>是否拆单：${f.wt_status!==0?'已拆单':'未拆单'}</li>
                            <li>已排完成度：${f.wt_completion}</li>
                            <li>预估工时：${f.wt_estimate_workhour}s</li>
                        </ul>
                    </div>
                    `
                var bom = e.currentTarget //当前点击的元素
                tip_index = layer.tips(num, bom, {
                    tips: [2, '#20A0FF'],
                    time: 0
                });
            },
            //鼠标离开wo 处理事件 移除tips
            showtipsoff() {
                layer.close(tip_index)
            },
            // 工艺路线
            procedureRouteData() {
                var url = `/procedure/display?`;
                axios.get(url, {
                    params: {
                        _token: "8b5491b17a70e24107c89f37b1036078",
                        id: this.routingId
                    }
                }).then(res => {
                    if(res.data.code == '200') {
                        if (res.data.results) { //这是工艺图的数据处理
                            var data = res.data.results;
                            if (data.routeInfo.length) {
                                showBasicInfo(data.routeInfo[0])
                            }
                            if (data.operations.length) {
                                $('.route_wrap').html('');
                                showRouteTap($('.route_wrap'), data.operations);
                                showRouteLine(data, 900, 280);
                            }
                        }
                        
                    } else{
                        LayerConfig('fail', res.data.message);
                    }
                }).catch(error => {
                    console.log(error, '获取工艺路线数据失败');
                })
            },
            workCenter() {
                if(this.centerStartData=='' ||  this.centerEndData == '') {
                    this.centerStartData = this.startData;
                    this.centerEndData = this.endData;
                    let temp_date = '';
                    temp_date = this.startData+ ' - ' + this.endData;
                    $('.date-select').val(temp_date);
                } 
               
                var url = `/APS/getWorkCenterInfo?_token=8b5491b17a70e24107c89f37b1036078`;
                axios.post(url, {
                    production_order_id: this.opId,
                    start_date: this.centerStartData,
                    end_date: this.centerEndData
                }).then(res => {
                    layer.close(this.getWorkCenterLoad); 
                    if(res.data.code == '200') {
                        if (res.data.results.length) {
                           
                            this.work_center_group = res.data.results;
                        }
                    } else {
                        LayerConfig('fail', res.data.message);
                    }
                    
                }).catch(error => {
                    layer.close(this.getWorkCenterLoad); 
                })
            },
            workCenterProgress(all_ability, remain_ability, state) {
                var work_center_progress = null;
                var used_ability = null;
                used_ability = all_ability - remain_ability;
                if (all_ability == 0) {
                    work_center_progress = 0;
                } else {
                    work_center_progress = used_ability/all_ability;
                }
               
                if(work_center_progress && work_center_progress < 0.04 && state == '2') {
                    work_center_progress = 0.04;
                }
                return (100*work_center_progress).toFixed(2) + '%';

            }
        }
    });

</script>
@endsection

@section("inline-bottom")
<script src="/statics/custom/js/bom/routing.js?v={{$release}}"></script>

<script src="/statics/custom/js/routing/routing-url.js?v={{$release}}"></script>
<script src="/statics/custom/js/schedule/routing.js?v={{$release}}"></script>
<script src="/statics/custom/js/routing/routing_add.js?v={{$release}}"></script>
<script src="/statics/custom/js/routing/routing-view.js?v={{$release}}"></script>
<script src="/statics/custom/js/product_order/qrcode.js?v={{$release}}"></script>

@endsection