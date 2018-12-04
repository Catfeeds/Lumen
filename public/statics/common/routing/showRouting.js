
/**
 * draw a routing operation node graph
 * @param parentElementName The name of the <div> element which will contain the new canvas element
 * @param routingGraph The routing graph data to be visualized, usually retrieved via AJAX
 * @param width The width of the drawing area (the node graph will be scaled accordingly)
 * @param height The height of the drawing area (the node graph will be scaled accordingly)
 */
var rnodes=null;

//根据工序获取能力
function getOpabs(opnode) {

  AjaxClient.get({
    url: URLS['bomAdd'].opabs + '?' +_token+'&operation_id='+opnode.operation_id,
    dataType: 'json',
    beforeSend: function(){
      layerLoading = LayerConfig('load');
    },
    success:function (rsp) {
      layer.close(layerLoading);
      if(rsp&&rsp.results&&rsp.results.length){
        opabs=rsp.results;
      }
    },
    fail:function (rsp) {
      layer.close(layerLoading);
      console.log('获取能力失败');
    }
  },this);
}

function emi2cRoutingGraph(parentElementName, routingGraph, width, height) {
  this.width = width;
  this.height = height;
  this.margin = 64;
  this.maxNodeDist = {x: 128, y: 96};
  this.graphDepth = 0;
  this.graphBreadth = 0;
  //the radius of the operation node circles in pixels
  this.nodeRadius = 30;
  //the angle of the arrow "arms" in degrees
  this.arrowArmAngle = 10;
  //the length of the arrowhead in pixels
  this.arrowheadLength = 26;
  this.mouseOverNode = null;
  this.tooltipDiv = null;
  this.parent = $('#' + parentElementName);
  if (this.parent.length) {
    this.routingGraph = routingGraph;
    var noCanvasStr = 'Sorry, but the "canvas" HTML element doesn\'t seem to be supported.';
    //create a new canvas element for drawing the routing graph
    this.canvas = $('<canvas width="' + width + '" height="' + height + '">' + noCanvasStr + '</canvas>');

    this.parent.append(this.canvas);
    this.context = this.canvas[0].getContext('2d');
    //create the node mode color legend box
    var download=$('<button class="btn" style="position: absolute;right: 10px;top: 10px; padding:8px;">export</button>')
    var legendBox = $('<div class="routing_legend"></div>');
    //create the table which holds the routing mode color descriptions
    var legendTable = $('<ul class="legend_table"></ul>');
    legendTable.append('<li><div><canvas class="required" width="18" height="18"></canvas></div><div>必选</div></li>');
    legendTable.append('<li><div><canvas class="skippable" width="18" height="18"></canvas></div><div>可跳过</div></li>');
    legendTable.append('<li><div><canvas class="selectable" width="18" height="18"></canvas></div><div>可选择</div></tr>');
    legendTable.append('<li><div><canvas class="skippable_selectable" width="18" height="18"></canvas></div><div>跳过并可选</div></li>');
    legendBox.append(legendTable);
    this.parent.append(legendBox);
    // this.parent.append(download);
    this.setupEventHandlers();
    //draw the legend color blobs
    this.drawLegendCircle($('div.routing_graph canvas.required'), 'MODE_REQUIRED', 9, 9);
    this.drawLegendCircle($('div.routing_graph canvas.skippable'), 'MODE_SKIPPABLE', 9, 9);
    this.drawLegendCircle($('div.routing_graph canvas.selectable'), 'MODE_SELECTABLE', 9, 9);
    this.drawLegendCircle($('div.routing_graph canvas.skippable_selectable'), 'MODE_SKIPPABLE_SELECTABLE', 9, 9);
  }
}

emi2cRoutingGraph.prototype = {
  /**
   * set up the colors used for drawing different node types
   */
  colors: {
      'MODE_REQUIRED': {'fill': '#f49d00', 'stroke': '#ff880d'},
      'MODE_SKIPPABLE': {'fill': '#85ca46', 'stroke': '#5eba0a'},
      'MODE_SELECTABLE': {'fill': '#d2326b', 'stroke': '#b51a51'},
      'MODE_SKIPPABLE_SELECTABLE': {'fill': '#4db3c7', 'stroke': '#2a99af'},
      'MODE_VISITED': {'fill': '#b625b9'},
      'MODE_BEGIN': {'fill': '#f5f5f5','stroke': '#999'}
  },
  //ajax相关
  ajaxFn: function (node) {
      if(node.label==0){
          $('.bom_blockquote.route').find('span').html('');
      }else{
          $('.bom_blockquote.route').find('span').html(`(当前工序${node.label}-${node.operation})`)
      }
    var there=this,
      ele=there.parent.parents('.route_pic').siblings('.make_list').find('.make_list_all');
    ele.html('');
    $('.route_overflow .route-tbody').html('<tr><td colspan="11" style="text-align: center;">暂无数据</td></tr>');
    AjaxClient.get({
      url: URLS['bomAdd'].makeList + '?' +_token+'&operation_id='+node.operation_id,
      dataType: 'json',
      beforeSend: function(){
        layerLoading = LayerConfig('load');
      },
      success:function (rsp) {
        layer.close(layerLoading);
        rnodes=null;
        rnodes=node;
        var listHtml='';
        if(rsp&&rsp.results&&rsp.results.length){
          rsp.results.forEach(function (item) {
            listHtml+='<div class="make-item" data-opcode="'+node.operation_code+'" data-node-id="'+node.oid+'" data-id="'+item.id+'" data-c-id="'+item.m_c_id+'" data-opid="'+item.operation_id+'">'+item.name+'</div>';
          });
        }else{
          listHtml='<p style="padding-left: 10px;">暂无数据</p>';
        }
        ele.html(listHtml);
        setTimeout(function () {
          if(rnodes.ipractice_id==-1){
            $('.self-make-btn').click();
          }else{
            rnodes.ipractice_id&&$('.make-item[data-id='+rnodes.ipractice_id+']').click();
          }
        },20);
      },
      fail:function (rsp) {
        layer.close(layerLoading);
        console.log('获取做法列表失败');
      }
    },this);
  },
  /**
   * set up event handlers for input devices, etc.
   */
  setupEventHandlers: function() {
    if (this.canvas) {
      var that = this;
      //set up the mouse enter/mouse leave events for showing and hiding node tooltips
      this.canvas.mousemove(function(event) {
        if (that.routingGraph) {
          //get the absolute document position of the canvas element
          var canvasPos = that.canvas.offset();
          //calculate the mouse position relative to the canvas position
          //(i.e. convert absolute mouse coordinates to local canvas space coordinates)
          var relativeXPos = event.pageX - canvasPos.left;
          var relativeYPos = event.pageY - canvasPos.top;
          //check if we are hovering above a graph node
          var mouseOverNode = null;
          for (i in that.routingGraph.nodes) {
            //only process graph nodes if they actually have screen coordinates
            if (that.nodeHasPos(that.routingGraph.nodes[i])) {
              //calculate a vector which points from the mouse position to the node location
              var nodeVecX = that.routingGraph.nodes[i].x - relativeXPos;
              var nodeVecY = that.routingGraph.nodes[i].y - relativeYPos;
              //calculate the distance between the two positions
              var dist = Math.sqrt(nodeVecX * nodeVecX + nodeVecY * nodeVecY);
              //if the distance is shorter than the node radius, we are hovering above a graph node
              if (dist <= that.nodeRadius) {
                mouseOverNode = that.routingGraph.nodes[i];
                //given the spacing of the graph nodes, we can only be inside one node at a time,
                //so we can exit the loop
                break;
              }
            }
          }
          //check if the 'mouse over status' has changed for the routing graph
          if (mouseOverNode != that.mouseOverNode) {
            if (mouseOverNode) {
              //we have entered a graph node
              that.mouseOverNode = mouseOverNode;
              //construct a tooltip <div> and place it on the screen near the graph node
              if(that.mouseOverNode.operation){
                that.tooltipDiv = $('<div class="routing_graph_tooltip">' + that.mouseOverNode.operation + '</div>');
                that.tooltipDiv.css('left', that.mouseOverNode.x + 'px');
                that.tooltipDiv.css('top', that.mouseOverNode.y + 'px');
                //add the tooltip to the DOM
                that.canvas.parent().append(that.tooltipDiv);
              }
            } else {
              //we have left a graph node
              that.mouseOverNode = null;
              //remove the tooltip from the DOM
              if (that.tooltipDiv) {
                that.tooltipDiv.remove();
              }
            }
          }
        }
      });
      this.canvas.click(function (event) {
        if (that.routingGraph) {
          //get the absolute document position of the canvas element
          var canvasPos = that.canvas.offset();
          //calculate the mouse position relative to the canvas position
          //(i.e. convert absolute mouse coordinates to local canvas space coordinates)
          var relativeXPos = event.pageX - canvasPos.left;
          var relativeYPos = event.pageY - canvasPos.top;
          //check if we are hovering above a graph node
          var clickNode = null;
          for (i in that.routingGraph.nodes) {
            //only process graph nodes if they actually have screen coordinates
            if (that.nodeHasPos(that.routingGraph.nodes[i])) {
              //calculate a vector which points from the mouse position to the node location
              var nodeVecX = that.routingGraph.nodes[i].x - relativeXPos;
              var nodeVecY = that.routingGraph.nodes[i].y - relativeYPos;
              //calculate the distance between the two positions
              var dist = Math.sqrt(nodeVecX * nodeVecX + nodeVecY * nodeVecY);
              //if the distance is shorter than the node radius, we are hovering above a graph node
              if (dist <= that.nodeRadius) {
                clickNode = that.routingGraph.nodes[i];
                //given the spacing of the graph nodes, we can only be inside one node at a time,
                //so we can exit the loop
                break;
              }
            }
          }
          //check if the 'mouse over status' has changed for the routing graph
          if (clickNode != that.clickNode) {
            if (clickNode) {
              //we have entered a graph node
              that.clickNode = clickNode;
              console.log(that.clickNode);
              opabs=[];
              $('.self-make-btn').removeClass('is-disabled selected');
              getOpabs(that.clickNode);
              that.ajaxFn(that.clickNode);
            } else {
              //we have left a graph node
              that.clickNode = null;
            }
          }
        }
      });
    }
    //create a jpg
    var canvas=this.canvas[0];
    this.parent.find('.btn').off('click').on('click',function(){
      canvas.toBlob&&canvas.toBlob(function(blob){
        var url=webkitURL.createObjectURL(blob)||URL.createObjectURL(blob);
        var a=$("<a></a>").attr("href", url).attr("download", "gongyi.png");
        a[0].click();
      });
    });
  },
  /**
   * draw a circular color blob for the routing mode legend
   */
  drawLegendCircle: function(canvas, nodeMode, x, y) {
    if (canvas.length) {
      var gfx = canvas[0].getContext('2d');
      //draw the filled circle
      gfx.fillStyle = this.colors[nodeMode].fill;
      gfx.beginPath();
      gfx.arc(x, y, 16, 0, 2 * Math.PI);
      gfx.fill();
      //draw the circle outline
      gfx.lineWidth = 2;
      gfx.strokeStyle = this.colors[nodeMode].stroke;
      gfx.stroke();
    }
  },
  /**
   * draw a circular operation node object
   * @param node The node to be drawn
   */
  drawNode: function(node) {
      if (this.context) {
          var gfx = this.context;
          //choose the node color based on the node's routing mode
          if (node.mode !== undefined && (node.mode in this.colors)) {
              if(node.label==0){
                  gfx.fillStyle = this.colors['MODE_BEGIN'].fill;
              }else{
                  gfx.fillStyle = this.colors[node.mode].fill;
              }
              if (node.visited) {
                  gfx.strokeStyle = this.colors['MODE_VISITED'].fill;
              }else if(node.label==0){
                  gfx.strokeStyle = this.colors['MODE_BEGIN'].stroke;
              } else {
                  gfx.strokeStyle = this.colors[node.mode].stroke;
              }
          }
          //draw the filled node circle
          gfx.beginPath();
          gfx.arc(node.x, node.y, this.nodeRadius, 0, 2 * Math.PI);
          gfx.fill();
          //draw the slightly darker node outline
          gfx.lineWidth = 2;
          gfx.stroke();
          //draw the node label text
          gfx.font = 'normal 13px Arial';
          gfx.fillStyle = 'black';
          var labelX = node.x - gfx.measureText(node.label).width / 2;
          var labelY = node.y + 5;
          if(node.operation.indexOf('()')>-1){
              node.operation='';
              gfx.font = 'bold 13px Arial';
              gfx.fillText(node.label, labelX, labelY);
          }else{
              gfx.fillText(node.label, labelX, labelY-12);
              if(node.operation.indexOf('(')>-1){
                  var val=node.operation.split('(');
                  val[1]='('+val[1];
                  val[0].length>4?(val[0]=val[0].substring(0,3)+'...'):null;
                  labelX=node.x-gfx.measureText(val[0]).width / 2
                  gfx.fillText(val[0], labelX, labelY);
                  labelX=node.x-gfx.measureText(val[1]).width / 2
                  gfx.fillText(val[1], labelX, labelY+12);
              }else{
                  var str = node.operation.split(''),sub='';
                  str.length>4 ? sub=node.operation.substring(0,3)+'...':sub=node.operation;
                  labelX=node.x-gfx.measureText(sub).width / 2;
                  gfx.fillText(sub, labelX, labelY);
              }
          }
      }
  },
  drawReactNode: function(node){
    if (this.context) {
      var gfx = this.context;
      //choose the node color based on the node's routing mode
      if (node.mode !== undefined && (node.mode in this.colors)) {
        gfx.fillStyle = this.colors[node.mode].fill;
        if (node.visited) {
          gfx.strokeStyle = this.colors['MODE_VISITED'].fill;
        } else {
          gfx.strokeStyle = this.colors[node.mode].stroke;
        }
      }
      //draw the filled node circle
      gfx.beginPath();
      // gfx.arc(node.x, node.y, this.nodeRadius, 0, 2 * Math.PI);
      gfx.fillRect(node.x-30,node.y-30,60,60);
      //draw the slightly darker node outline
      gfx.lineWidth = 2;
      // gfx.strokeStyle = "#F5270B";
      gfx.strokeRect(node.x-30,node.y-30,60,60);
      // gfx.stroke();
      //draw the node label text
      gfx.font = 'normal 12px Arial';
      gfx.fillStyle = 'black';
      var labelX = node.x - gfx.measureText(node.label).width / 2;
      var labelY = node.y + 5;
      if(node.operation.indexOf('()')>-1){
        node.operation='';
        gfx.font = 'bold 12px Arial';
        gfx.fillText(node.label, labelX, labelY);
      }else{
        gfx.fillText(node.label, labelX, labelY-12);
        if(node.operation.indexOf('(')>-1){
          var val=node.operation.split('(');
          val[1]='('+val[1];
          val[0].length>4?(val[0]=val[0].substring(0,3)+'...'):null;
          labelX=node.x-gfx.measureText(val[0]).width / 2
          gfx.fillText(val[0], labelX, labelY);
          labelX=node.x-gfx.measureText(val[1]).width / 2
          gfx.fillText(val[1], labelX, labelY+12);
        }else{
          var str = node.operation.split(''),sub='';
          str.length>4 ? sub=node.operation.substring(0,3)+'...':sub=node.operation;
          labelX=node.x-gfx.measureText(sub).width / 2;
          gfx.fillText(node.operation, labelX, labelY);
        }
      }
    }
  },
  /**
   * draw a connecting line between two operation graph nodes
   * @param startNode The operation node from where we start drawing the line
   * @param endNode The operation where we stop drawing the line (and place the arrow tip)
   */
  drawEdge: function(startNode, endNode) {
    if (this.context) {
      var gfx = this.context;
      //draw the connecting line
      if (startNode.visited && endNode.visited) {
        gfx.strokeStyle = gfx.fillStyle = this.colors['MODE_VISITED'].fill;
      } else {
        gfx.strokeStyle = gfx.fillStyle = '#999';
      }
      gfx.lineWidth = 2;
      gfx.beginPath();
      gfx.moveTo(startNode.x, startNode.y);
      gfx.lineTo(endNode.x, endNode.y);
      gfx.stroke();
      //draw an arrow tip at the end node
      gfx.lineWidth = 2;
      //calculate the vector pointing from the end node to the start node
      var dirVec = {x: startNode.x - endNode.x,
        y: startNode.y - endNode.y};
      //normalize the vector so we can scale it easily
      var vecLength = Math.sqrt(dirVec.x * dirVec.x + dirVec.y * dirVec.y);
      var normalizedDirVec = {x: dirVec.x / vecLength, y: dirVec.y / vecLength};
      //calculate the tip position of the arrow
      var arrowTipPos = {x: normalizedDirVec.x * (this.nodeRadius), y: normalizedDirVec.y * (this.nodeRadius)};
      var arrowLeftPos = {x: normalizedDirVec.x * this.arrowheadLength*1.4, y: normalizedDirVec.y * this.arrowheadLength*1.4};
      //calculate the left 'arm' of the arrow (as seen in the direction of the arrow)
      var turnRadians = Math.PI / 180 * this.arrowArmAngle;
      arrowLeftPos.x = arrowLeftPos.x * Math.cos(turnRadians) - arrowLeftPos.y * Math.sin(turnRadians);
      arrowLeftPos.y = arrowLeftPos.x * Math.sin(turnRadians) + arrowLeftPos.y * Math.cos(turnRadians);
      var arrowRightPos = {};
      //calculate the right 'arm' of the arrow (as seen in the direction of the arrow)
      turnRadians = Math.PI / 180 * -(this.arrowArmAngle * 2);
      arrowRightPos.x = arrowLeftPos.x * Math.cos(turnRadians) - arrowLeftPos.y * Math.sin(turnRadians);
      arrowRightPos.y = arrowLeftPos.x * Math.sin(turnRadians) + arrowLeftPos.y * Math.cos(turnRadians);
      //draw the actual arrow shape
      gfx.beginPath();
      gfx.moveTo(endNode.x + arrowLeftPos.x, endNode.y + arrowLeftPos.y);
      gfx.lineTo(endNode.x + arrowTipPos.x, endNode.y + arrowTipPos.y);
      gfx.lineTo(endNode.x + arrowRightPos.x, endNode.y + arrowRightPos.y);
      gfx.strokeStyle = "#999";
      gfx.stroke();
    }
  },
  /**
   * detect if we need to draw shortcut edges between visited (i.e. completed/started) nodes.
   * This is only necessary if the user has skipped one or more nodes inbetween
   */
  drawShortcutEdges: function() {
    var lastVisitedNodeIndex = null;
    //traverse all graph nodes, but ignore the invisible root node
    for (var i = 1; i < this.routingGraph.nodes.length; i++) {
      //only process visited nodes
      if (this.routingGraph.nodes[i].visited) {
        //check if a previously visited node is available to draw the edge from
        if (lastVisitedNodeIndex !== null) {
          var edgeExists = false;
          //traverse all edges and check if an edge connection already exists
          //between the previously visited node and the current node
          for (var j in this.routingGraph.edges) {
            if (this.routingGraph.edges[j][0] == lastVisitedNodeIndex &&
              this.routingGraph.edges[j][1] == i) {
              edgeExists = true;
              break;
            }
          }
          //only draw the shortcut edge if the two visited nodes aren't connected yet
          if (!edgeExists) {
            this.drawEdge(this.routingGraph.nodes[lastVisitedNodeIndex],
              this.routingGraph.nodes[i]);
          }
        }
        //mark the current visited node as the starting point for the next shortcut edge
        lastVisitedNodeIndex = i;
      }
    }
  },
  nodeHasPos: function(node) {
    // console.log(node)
    return (node.x !== undefined && node.y !== undefined);
  },
  /**
   * calculate the node x coordinate in a recursive fashion
   * @param nodeIndex The emi2cRoutingGraph.nodes array index of the node
   * @param currentDepth The current node depth, which increases as we walk deeper into the routing graph
   */
  calcXCoord: function(nodeIndex, currentDepth) {
    //update the maximum depth level of the graph
    if (currentDepth > this.graphDepth) {
      this.graphDepth = currentDepth;
    }
    //only update the node x coordinate under certain circumstances (i.e. not the invisible root node,
    //not set yet, or if we have followed a deeper path to a node which already has a lower x coordinate)
    if (nodeIndex && (this.routingGraph.nodes[nodeIndex].x === undefined ||
        currentDepth > this.routingGraph.nodes[nodeIndex].x)) {
      this.routingGraph.nodes[nodeIndex].x = currentDepth;
    }
    //find all nodes which are linked to this one, and recursively run this method on them
    for (var i in this.routingGraph.edges) {
      //this.routingGraph.edges[i][0] holds the array index of the source node
      if (this.routingGraph.edges[i][0] == nodeIndex) {
        //this.routingGraph.edges[i][1] holds the array index of the target node
        this.calcXCoord(this.routingGraph.edges[i][1], currentDepth + 1);
      }
//            else{
//                //处理非连续节点
//                if(currentDepth >= this.routingGraph.nodes[nodeIndex].x && currentDepth <= i){
//                      this.routingGraph.nodes[currentDepth].x =  nodeIndex;
//                      this.calcXCoord(this.routingGraph.edges[i][1], this.routingGraph.edges[i][1]);
//                  }
//            }
    }
  },
  /**
   * calculate the node y coordinate (this is actually the hard part...)
   */
  calcYCoords: function() {
    //create an array to hold the breadth values of the individual graph levels
    var graphBreadths = new Array(this.graphDepth);
    //initialize the graph's maximum breadth value
    this.graphBreadth = 0;
    //calculate the breadth levels for all graph levels (i.e. node x coordinates)
    for (var i = 0; i < this.graphDepth; i++) {
      graphBreadths[i] = 0;
      //find and count all nodes which are on this graph level
      for (var j in this.routingGraph.nodes) {
        //check if the node is on this level
        if (this.routingGraph.nodes[j].x !== undefined &&
          this.routingGraph.nodes[j].x == i + 1) {
          //increase the breadth value of this graph depth level
          graphBreadths[i]++;
          //check if we should update the maximum breadth value (used for vertically centering the graph layout, etc.)
          if (graphBreadths[i] > this.graphBreadth) {
            this.graphBreadth = graphBreadths[i];
          }
        }
      }
    }
    //assign relative y coordinates to the graph nodes
    for (var i in graphBreadths) {
      //align the the center of the current breadth value to the vertical center of the graph
      var breadthPosY = Math.round(-(graphBreadths[i] / 2));
      //traverse all graph nodes and find all nodes which belong to this graph level
      for (var j in this.routingGraph.nodes) {
        //check if this graph node x coordinate matches the current breadth level
        if (this.routingGraph.nodes[j].x !== undefined &&
          this.routingGraph.nodes[j].x == parseInt(i) + 1) {
          //only graph levels with an uneven breadth value will use the vertical canvas middle to keep the
          //graph alignment symmetrical
          if (!breadthPosY && !(graphBreadths[i] % 2)) {
            //skip the middle of the canvas if we have reached the center line
            breadthPosY++;
          }
          //assign the current relative breadth y coordinate
          this.routingGraph.nodes[j].y = breadthPosY;
          //move to the next available y axis position
          breadthPosY++;
        }
      }
    }
  },
  /**
   * calculate relative grid positions for the operation graph nodes
   */
  calcGridPositions: function() {
    //calculate X coordinates recursively
    this.calcXCoord(0, 0);
    this.calcYCoords();
  },
  /**
   * calculate node screen positions based on relative grid positions
   */
  calcScreenPositions: function() {
    //only bother to calculate node coordinates if the routing graph covers screen space
    if (this.graphDepth) {
      //figure out the vertical center of the screen
      var yCenter = this.height / 2;
      //calculate the available screen canvas real estate
      var totalWidth = this.width - this.margin * 2;
      var totalHeight = this.height - this.margin * 2;
      //scale the horizontal grid based on the canves width and the total number of graph levels
      var nodeDistX = totalWidth / (this.graphDepth - 1);
      //if the node distance becomes too big, shrink it down to its maximum size
      if (nodeDistX > this.maxNodeDist.x) {
        nodeDistX = this.maxNodeDist.x;
      }
      //avoid divide-by-zero if the graph breadth is 0
      if (this.graphBreadth) {
        //scale the vertical grid based on the canvas height and the total number of graph levels
        var nodeDistY = totalHeight / (this.graphBreadth - 1);
        //if the node distance becomes too big, shrink it down to its maximum size
        if (nodeDistY > this.maxNodeDist.y) {
          nodeDistY = this.maxNodeDist.y;
        }
      } else {
        var nodeDistY = 0;
      }
      //calculate the actual screen coordinates
      for (var i in this.routingGraph.nodes) {
        //make sure we skip the "invisible root node" (i.e. the first node) of the graph
        if (i) {
          //scale the relative node coordinates by the on-screen grid size
          this.routingGraph.nodes[i].x = this.margin + (this.routingGraph.nodes[i].x - 1) * nodeDistX;
          this.routingGraph.nodes[i].y = yCenter + this.routingGraph.nodes[i].y * nodeDistY;
        }
      }
    }
  },
  /**
   * calculate X and Y coordinates for all operation graph nodes
   */
  calcPositions: function() {
    //first, calculate the relative grid positions of the nodes
    this.calcGridPositions();
    //convert the grid positions to actual screen coordinates
    this.calcScreenPositions();
  },
  /**
   * mark the nodes of the graph as visited based on an array of visited node labels
   * @param visitedNodeLabels An array filled with the labels of nodes which have been marked as visited
   */
  updateVisitedNodes: function(visitedNodeLabels) {
    //traverse all routing record operation nodes except the invisible root node
    for (i = 1; i < this.routingGraph.nodes.length; i++) {
      //assume that this node hasn't been visited yet
      this.routingGraph.nodes[i].visited = false;
      //check if the label of this node can be found inside the visitedNodeLabels array
      for (var j in visitedNodeLabels) {
        //if the labels match, mark this node as visited and exit the loop
        if (this.routingGraph.nodes[i].label == visitedNodeLabels[j]) {
          this.routingGraph.nodes[i].visited = true;
          break;
        }
      }
    }
  },
  /**
   * draw the operation routing graph
   */
  draw: function() {
    //make sure we that don't accumulate pixel data when redrawing the screen
    if (this.context) {
      this.context.clearRect(0, 0, this.width, this.height);
    }
    if (this.routingGraph) {
      //draw the edges behind the node circles
      for (var i in this.routingGraph.edges) {
        var edge = this.routingGraph.edges[i];
        var sourceNode = this.routingGraph.nodes[edge[0]];
        var targetNode = this.routingGraph.nodes[edge[1]];
        //only draw an edge if the source and target nodes have coordinates
        if (this.nodeHasPos(sourceNode) && this.nodeHasPos(targetNode)) {
          //draw the edge
          this.drawEdge(sourceNode, targetNode);
        }
      }
      //draw extra edges which create shortcuts between 'visited' nodes, when nodes inbetween were skipped over
      this.drawShortcutEdges();
      //draw the node circles above the edges
      for (var i in this.routingGraph.nodes) {
        //only draw this node if it has valid coordinates
        if (this.nodeHasPos(this.routingGraph.nodes[i])) {
          //draw the node
          this.drawNode(this.routingGraph.nodes[i]);
        }
      }
    }
  }
};

