$(function () {
	localStorage.clear();
	var pen = 0;
	var penColors = ['red', 'blue', 'orange'];
	var penColor = penColors[pen];
	var roomTemplate = $("#roomSelector").html();
	var areaTemplate = $("#areaSelector").html();
	var pointTemplate = $("#pointSelector").html();
	var modalTitles = ['Select Room','Select Area','Select Point' ];
	var templates = [roomTemplate, areaTemplate, pointTemplate];
	var modalInnerHtml = templates[pen];
	var modalTitle = modalTitles[pen];
	var roomCount = 0, areaCount = 0, pointCount = 0;
	$(".draw-modal-body").html(modalInnerHtml);
    $("input[type='radio']").on("click",function(){
		pen = parseInt($(this).val());
		penColor = penColors[pen];
		modalInnerHtml = templates[pen];
		modalTitle = modalTitles[pen];
		$(".draw-modal-body").html(modalInnerHtml);
		$("#myModalLabel").text(modalTitle);
		bindCanvasEvent();
	});


    // var domCanvas = document.getElementById('layer0');
    var domCanvas = $('#layer0')[0];
    $('#layer0').addLayer({
	  type: 'image',
	  source: 'img/5px.png',
	  width:950,
	  height:634,
	  x: 480, y: 310
	});
	$('#layer0').drawLayers();
	// var domContext = domCanvas.getContext('2d');
	// domContext.fillRect(50,50,150,50);

	// var balls = [];
    var rooms= [], areas = [], points = [];
    var roomPaths= [], areaPaths = [], pointPaths = [];

    /**
     * 事件交互, 点击事件为例
     * isPointInPath(横坐标, 纵坐标)
     */
 //    for(var i = 0; i < 10; i++){
 //        var ball = {
 //            X: Math.random()*domCanvas.width,
 //            Y: Math.random()*domCanvas.height,
 //            R: Math.random()*50 + 20
 //        }
 //        balls[i] = ball;
 //    }
 //    draw();
	// $("#layer0").click(function(){
 //        //标准的获取鼠标点击相对于canvas画布的坐标公式
 //        var x = event.pageX - domCanvas.getBoundingClientRect().left;
 //        var y = event.pageY - domCanvas.getBoundingClientRect().top;
 //        var context = createNewCanvas();
 //        /*for(var i = 0; i < balls.length; i++){
 //            domContext.beginPath();
 //            domContext.arc(balls[i].X, balls[i].Y, balls[i].R, 0, Math.PI*2);
 //            if(domContext.isPointInPath(x, y)){
 //                domContext.fillStyle = "red";
 //                domContext.fill();
 //            }
 //        }*/

 //    });
	function _calculateXY(e){
		return {
          x: e.clientX - domCanvas.getBoundingClientRect().left,
          y: e.clientY - domCanvas.getBoundingClientRect().top
        }
	}
	var layerNumber = 0;
	var layerName = 'layer' + layerNumber;
	var startX = 0;
	var startY = 0;
	var moveX = 0;
	var moveY = 0;
	var isShot = false;
	var drawingLines = false;
	var lineStartPoint = null;
	var lineCurrPoint = null;
	var AllLinePoints = [];
	var drawingLinePoints = [];
	var copyDomCanvas = domCanvas;
	bindCanvasEvent();
	function bindCanvasEvent(){
		if(pen === 0 || pen === 1){
			$("#layer0").unbind();
			$("#myModal").unbind();
			$('#layer0').mousedown(function(e) {
				layerNumber++;
				layerName = 'layer' + layerNumber;
				startX = _calculateXY(e).x;
				startY = _calculateXY(e).y;
				var _in = inRect2(startX, startY, rooms); //临时加2
				isShot = pen === 0 ? (!_in) : _in;
				/*$('#layer0').addLayer({
					type: 'rectangle',
					strokeStyle: 'red',
					strokeWidth: 2,
					fillStyle: '#333333',
					name:layerName,
					fromCenter: false,
					x: startX,
					y: startY,
					width: 1,
					height: 1
				});*/
			}).mousemove(function(e) {
			    if(isShot) {
			      $('#layer0').removeLayer(layerName);
			      moveX = _calculateXY(e).x;
			      moveY = _calculateXY(e).y;
			      var width = moveX - startX;
			      var height = moveY - startY;
			      /*if(width === 0){
			      	isShot = false;
			      	return;
			      }*/
			      /*var _inRooms = inRect(moveX, moveY, rooms) || inRect(startX, moveY, rooms) 
			      || inRect(moveX, startY, rooms);*/
			      var _inRooms = inRect2(moveX, moveY, rooms) || inRect2(startX, moveY, rooms) 
			      || inRect2(moveX, startY, rooms);
			      var _inAreas = inRect2(moveX, moveY, areas) || inRect2(startX, moveY, areas) 
			      || inRect2(moveX, startY, areas);
			      /*var _allIn = inRect(moveX, moveY, rooms) && inRect(startX, moveY, rooms) 
			      && inRect(moveX, startY, rooms);*/
			      var _allIn = inRect2(moveX, moveY, rooms) && inRect2(startX, moveY, rooms) 
			      && inRect2(moveX, startY, rooms);
			      var standard = pen === 0 ? (!_inRooms) : _allIn&&(!_inAreas);
			      /*var layers = $('#layer0').getLayers(), laysCount = layers.length;
			      if(laysCount > 0){
				      var lastLayer = layers[laysCount -1].name;
				      $('#layer0').removeLayer(lastLayer);
			      }*/
			      if(standard){
					$('#layer0').addLayer({
					  type: 'rectangle',
					  strokeStyle: penColor,
					  strokeWidth: 2,
					  // fillStyle: '#fff',
					  name:layerName,
					  fromCenter: false,
					  x: startX,
					  y: startY,
					  width: width,
					  height: height
					});
					$('#layer0').drawLayers();
			      }else{
					isShot = false;
			      }
			    }
			}).mouseup(function(e) {
			    moveX = _calculateXY(e).x;
			    moveY = _calculateXY(e).y;
			    var width = Math.abs(moveX - startX);
			    var height = Math.abs(moveY - startY);
			    if(isShot && width!==0){
					$('#myModal').modal({  
					  keyboard: false  
					});
			    	/*if(pen === 0){
			    		rooms.push([{'x': startX, 'y': startY},{'x': moveX, 'y': moveY}]);
			    	}else{
			    		areas.push([{'x': startX, 'y': startY},{'x': moveX, 'y': moveY}]);
			    	}*/
			    }else{
			    	$('#layer0').removeLayer(layerName);
			    }
			    isShot = false;
			});
		}else if(pen === 2) {
			$("#layer0").unbind();
			$("#myModal").unbind();
			$('#layer0').click(function(e) {
				startX = _calculateXY(e).x;
				startY = _calculateXY(e).y;
				var _inAreas = inRect2(startX, startY, areas);
				if(_inAreas){
					$('#layer0').addLayer({
			          type: 'arc',
					  fillStyle: '#69f',
					  strokeStyle: '#000',
					  strokeWidth: 1,
			          x: startX,
			          y: startY,
					  radius: 10
			      	});
		          	// $('#layer0').drawLayers();
		          	$('#myModal').modal({  
					  keyboard: false  
					});
				}
			});
		}else if(pen === 3){
			$("#layer0").unbind();
			$("#myModal").unbind();
			if(!drawingLines){
				$('#layer0').mousedown(function(e) {
					layerNumber++;
					layerName = 'layer' + layerNumber;
					startX = _calculateXY(e).x;
					startY = _calculateXY(e).y;
					lineStartPoint = new Point(startX, startY);
					isShot = true;
				}).mousemove(function(e) {
				    if(isShot) {
				      	$('#layer0').removeLayer(layerName);
				      	moveX = _calculateXY(e).x;
				      	moveY = _calculateXY(e).y;
						$('#layer0').addLayer({
						  type: 'line',
						  strokeStyle: penColor,
						  strokeWidth: 2,
						  // fillStyle: '#fff',
						  name:layerName,
						  x1: startX,
						  y1: startY,
						  x2: moveX,
						  y2: moveY
						});
						$('#layer0').drawLayers();
				    }
				}).mouseup(function(e) {
				    moveX = _calculateXY(e).x;
				    moveY = _calculateXY(e).y;
				    var width = Math.abs(moveX - startX);
				    var height = Math.abs(moveY - startY);
				    if(isShot && !(width === 0 && height === 0)){
						/*$('#myModal').modal({  
						  keyboard: false  
						});*/
						drawingLines = true;
						drawingLinePoints.push(new Point(startX, startY));
						drawingLinePoints.push(new Point(moveX, moveY));
						requestAnimationFrame(function(){
							bindCanvasEvent();
						});
						/*$("#layer0").unbind();
						$('#layer0').click(function(e) {
							layerNumber++;
							layerName = 'layer' + layerNumber;
							startX = moveX;
							startY = moveY;

							moveX = _calculateXY(e).x;
							moveY = _calculateXY(e).y;
							lineCurrPoint = new Point(moveX, moveY);
							if(inCircle(15, lineStartPoint, lineCurrPoint)){
								moveX = lineStartPoint.x;
								moveY = lineStartPoint.y;
								drawingLines = false;
							}
							$('#layer0').addLayer({
							  type: 'line',
							  strokeStyle: penColor,
							  strokeWidth: 2,
							  // fillStyle: '#fff',
							  name:layerName,
							  x1: startX,
							  y1: startY,
							  x2: moveX,
							  y2: moveY
							});
							$('#layer0').drawLayers();

						});*/
				    }else{
				    	$('#layer0').removeLayer(layerName);
				    }
				    isShot = false;
				});
			}else{
				$('#layer0').click(function(e) {
					layerNumber++;
					layerName = 'layer' + layerNumber;
					startX = moveX;
					startY = moveY;
					moveX = _calculateXY(e).x;
					moveY = _calculateXY(e).y;
					var np = new Point(moveX , moveY);
			  		var inLines = AllLinePoints.reduce(function(r,v){
			    		var inn = isPolygonContainsPoint(v, np);
			    		return r || inn;
			  		}, false);
		    		console.log(inLines);
					lineCurrPoint = new Point(moveX, moveY);
					if(inCircle(10, lineStartPoint, lineCurrPoint)){
						moveX = lineStartPoint.x;
						moveY = lineStartPoint.y;
						drawingLines = false;
						drawingLinePoints.push(new Point(moveX, moveY));
						AllLinePoints.push(drawingLinePoints);
						drawingLinePoints = [];
						bindCanvasEvent();
					} else {
						drawingLinePoints.push(new Point(moveX, moveY));
					}
					$('#layer0').addLayer({
					  type: 'line',
					  strokeStyle: penColor,
					  strokeWidth: 2,
					  // fillStyle: '#fff',
					  name:layerName,
					  x1: startX,
					  y1: startY,
					  x2: moveX,
					  y2: moveY
					});
					$('#layer0').drawLayers();
				});
			}
		}
	}

	function toRectPathArray(start, end){
		return [[start.x, start.y], [end.x, start.y], [end.x, end.y], [start.x, end.y], [start.x, start.y]];
	}

	function getRectPath(rects, paths){
		rects.forEach(function(item, index){
			paths.push(toRectPathArray({'x': item.start.x, 'y': item.start.y}, {'x': item.end.x, 'y': item.end.y}));
		});
	}

	function refreshLocalStorage(){
		localStorage.clear();
		roomPaths = [];
		areaPaths = [];
		pointPaths = [];
        getRectPath(rooms, roomPaths);
		localStorage.setItem('roomPaths', JSON.stringify(roomPaths));
		getRectPath(areas, areaPaths);
		localStorage.setItem('areaPaths', JSON.stringify(areaPaths));
		getPointPath(points, pointPaths)
		localStorage.setItem('pointPaths', JSON.stringify(pointPaths));
	}

	function getPointPath(points, paths){
		points.forEach(function(item, index){
			paths.push({ x: item.start.x, y: item.start.y, radius:20,value: 100});
		});
	}

    function inRect(x, y, rooms){
    	var _inAnyRoom = rooms.some(function(room){
			return room[0].x < x && room[0].y < y && room[1].x > x && room[1].y > y;
		});
		return _inAnyRoom;
    }
    function inRect2(x, y, rooms){
    	var _inAnyRoom = rooms.some(function(room){
			return room.start.x < x && room.start.y < y && room.end.x > x && room.end.y > y;
		});
		return _inAnyRoom;
    }

    function getParent(x, y, rooms){
    	var _room;
    	rooms.forEach(function(room){
			if(room.start.x < x && room.start.y < y && room.end.x > x && room.end.y > y){
				_room =  room;
			}
		});
		return _room;
    }

    function Point(x, y) {
	  this.x = x;
	  this.y = y;
	}

	function isPolygonContainsPoint(mPoints, point) {
		var nCross = 0;
		for (var i = 0, mPointsCount = mPoints.length; i < mPointsCount; i++) {
			var p1 = mPoints[i];
			var p2 = mPoints[(i + 1) % mPointsCount];
			// p1p2是水平线段,要么没有交点,要么有无限个交点
			if (p1.y == p2.y) continue;
			// point 在p1p2 底部 --> 无交点
			if (point.y < Math.min(p1.y, p2.y)) continue;
			// point 在p1p2 顶部 --> 无交点
			if (point.y >= Math.max(p1.y, p2.y)) continue;
			// 求解 point点水平线与当前p1p2边的交点的 X 坐标 通过前面几个if条件筛选,这里的如果求出来有交点一定在p1p2连接线上,而不是延长线上.
  			var x = (point.y - p1.y) * (p2.x - p1.x) / (p2.y - p1.y) + p1.x;
      		if (x > point.x) {// 当x=point.x时,说明point在p1p2线段上
        		nCross++; // 只统计单边交点
    		}
		}
		return (nCross % 2 == 1);
	}

	function inCircle(radius, c, e) {
		return (e.x-c.x)*(e.x-c.x)+(e.y-c.y)*(e.y-c.y)<=radius*radius;
	}

    $("#drawOKBtn").on("click", function(e){
    	var v = $(".form-control").val();
    	var nodes = treeData[0].nodes;
    	var newRoomID, newAreaID, newPointID;
    	var textX, textY;
    	var room, roomID;
		var area, areaID;
    	if(pen === 2){
    		textX = startX;
    		textY = startY-17;
    	}else{
    		textX = moveX-25;
    		textY = startY+10;
    	}
    	if(pen === 0){
    		roomCount++;
    		var lastRoomID = nodes.length === 0 ? '10' : nodes[nodes.length-1].id;
    		newRoomID = (parseInt(lastRoomID)+1).toString();
    		var newRoomNode = {
    			id: newRoomID,
    			text: v,
    			start: {'x': startX, 'y': startY},
    			end: {'x': moveX, 'y': moveY}
    		}
    		nodes.push(newRoomNode);
    		$("#tree").treeview("addNode", [0, { node: newRoomNode }]);
    		// rooms.push([{'x': startX, 'y': startY},{'x': moveX, 'y': moveY}]); //原版
    		rooms.push({
    			id: newRoomID,
    			text: v,
    			start: {'x': startX, 'y': startY},
    			end: {'x': moveX, 'y': moveY}
    		});
    		// roomPaths.push(toRectPathArray({'x': startX, 'y': startY}, {'x': moveX, 'y': moveY}));
    		roomPaths = [];
    		getRectPath(rooms, roomPaths);
    		localStorage.setItem('roomPaths', JSON.stringify(roomPaths));
    	}else if(pen === 1){
    		room = getParent(startX, startY, rooms);
    		roomID = room.id;
    		var roomNode = nodes.filter(function(node){
    			return node.id === roomID;
    		})[0];
    		var lastAreaID = (roomNode.nodes === undefined || roomNode.nodes.length === 0) ? (roomID + '0') : roomNode.nodes[roomNode.nodes.length-1].id;
    		newAreaID = (parseInt(lastAreaID)+1).toString();
    		var newAreaNode = {
    			id: newAreaID,
    			text: v,
    			start: {'x': startX, 'y': startY},
    			end: {'x': moveX, 'y': moveY}
    		}
    		if(roomNode.nodes === undefined){
    			roomNode.nodes = [];
    		}
    		// roomNode.nodes.push(newAreaNode);
    		$("#tree").treeview("addNode", [roomNode.nodeId, { node: newAreaNode }]);
    		// areas.push([{'x': startX, 'y': startY},{'x': moveX, 'y': moveY}]);
    		areas.push({
    			roomID: roomID,
    			id: newAreaID,
    			text: v,
    			start: {'x': startX, 'y': startY},
    			end: {'x': moveX, 'y': moveY}
    		});
    		// areaPaths.push(toRectPathArray({'x': startX, 'y': startY}, {'x': moveX, 'y': moveY}));
    		areaPaths = [];
    		getRectPath(areas, areaPaths);
    		localStorage.setItem('areaPaths', JSON.stringify(areaPaths));
    	}else{
    		area = getParent(startX, startY, areas);
    		areaID = area.id;
    		roomID = area.roomID;
    		var roomNode = nodes.filter(function(node){
    			return node.id === roomID;
    		})[0];
			var areaNode = roomNode.nodes.filter(function(node){
    			return node.id === areaID;
    		})[0];
    		var lastPointID = (areaNode.nodes === undefined || areaNode.nodes.length === 0) ? (areaID + '0') : areaNode.nodes[areaNode.nodes.length-1].id;
    		newPointID = (parseInt(lastPointID)+1).toString();

			var newPointNode = {
    			id: newPointID,
    			text: v,
    			start: {'x': startX, 'y': startY},
    			end: {'x': moveX, 'y': moveY}
    		}
    		if(areaNode.nodes === undefined){
    			areaNode.nodes = [];
    		}
			$("#tree").treeview("addNode", [areaNode.nodeId, { node: newPointNode }]);
    		// points.push({'x': startX, 'y': startY});
    		points.push({
    			roomID: roomID,
    			areaID: areaID,
    			id: newPointID,
    			text: v,
    			start: {'x': startX, 'y': startY},
    			end: {'x': moveX, 'y': moveY}
    		});
    		// pointPaths.push({ x: startX, y: startY, radius:20,value: 100});
    		getPointPath(points, pointPaths)
    		localStorage.setItem('pointPaths', JSON.stringify(pointPaths));
    	}
    	var newIDs = [newRoomID, newAreaID, newPointID];
    	var parentID;
    	$('#layer0').addLayer({
		  type: 'text',
		  fillStyle: '#9cf',
		  strokeStyle: '#25a',
		  strokeWidth: 1,
		  x: textX, y: textY,
		  fontSize: 14,
		  fontFamily: 'Verdana, sans-serif',
		  text: v,
		  data: {
		  	id: newIDs[pen],
		  	roomID: roomID,
		  	areaID: areaID
		  }
		});
		$('#layer0').drawLayers();
		$('#myModal').modal('hide');
    });

    $("#drawCloseBtn").on('click', function(){
    	var layers = $('#layer0').getLayers();
    	$('#layer0').removeLayer(layers.length - 1);
    	$('#layer0').drawLayers();
    	$('#myModal').modal('hide');
    });
    /*function draw(){
        domContext.fillStyle = "blue";
        for(var i = 0; i < balls.length; i++){
            domContext.beginPath();
            domContext.arc(balls[i].X, balls[i].Y, balls[i].R, 0, Math.PI*2);
            domContext.fill();
        }
    }

    function createNewCanvas() {
    	var canvas = document.createElement('canvas');
		var ctx = canvas.getContext('2d');
		return ctx;
    }*/
    function getTree() {
        var data = [
            {
                text: "p1",
                id: '1',
                nodes: [
                    { text: "room1", id: '11' },
                    { text: "room2", id: '12' },
                    { text: "room3", id: '13' },
                    {
                        text: "room4",
                        id: '14',
                        nodes: [
                            {
                                text: 'area1',
                                id: '141'
                            }
                        ]
                    }
                ]
            }
        ];
        return data;
    }

    var treeData = [{
    	text: "rooms",
        id: '1',
        nodes: [
            /*{
                text: "room1",
                id: '11',
                nodes: [
                    {
                        text: 'area1',
                        id: '111'
                    }
                ]
            }*/
        ]
    }];
    function getTreeData() {
    	return treeData;
    }
    var currentLayerData;
	$("#tree").treeview({
        // data: getTree(),
        data: getTreeData(),
        showIcon: false,
        showCheckbox: false,
        onhoverColor: "#E8E8E8",
        showBorder: false,
        showTags: true,
        highlightSelected: true,
        highlightSearchResults: false,
        selectedBackColor: "#8D9CAA",
        levels: 2,
        onNodeSelected: function(event, data) {
            if (data.nodeId === undefined || data.nodeId === null) {
                return;
            }
            currentLayerData = data;
            $('#treeModal').modal({  
			  keyboard: false  
			});
            // $("#tree").treeview("deleteNode", [data.nodeId, { silent: true }]);
            //nodeData是checkedNode或者selectedNode，选中或者checked这个节点， 该节点如果有父节点的话就会被删除。
        },
        onNodeExpanded:
            function(event, data) {
                /*$.ajax({
                    type: "Post",
                    url: "/Bootstrap/GetExpandJson?id=" + data.id,
                    dataType: "json",
                    success: function (result) {
                        for (var index = 0; index < result.length; index++) {
                            var item = result[index];
                            $("#tree1")
                                .treeview("addNode",
                                [
                                    data.nodeId,
                                    { node: { text: item.text, id: item.id }, silent: true }
                                ]);
                        }
                    }
                });*/
            }
    });

    $("#treeOKBtn").on("click", function(e){
        $("#tree").treeview("deleteNode", [currentLayerData.nodeId, { silent: true }]);
        $('#treeModal').modal('hide');
        treeData[0].nodes = treeData[0].nodes.filter(function(item){
        	return item.nodeId !== currentLayerData.nodeId;
        });
        //通过节点ID长度来判断删除的节点是room/area/point
        switch(currentLayerData.id.length) {
			case 2:
		        rooms = rooms.filter(function(item){
					return item.id !== currentLayerData.id;
		        });
		        areas = areas.filter(function(item){
					return item.roomID !== currentLayerData.id;
		        });
		        points = points.filter(function(item){
					return item.roomID !== currentLayerData.id;
		        });
			break;
			case 3:
		        areas = areas.filter(function(item){
					return item.id !== currentLayerData.id;
		        });
		        points = points.filter(function(item){
					return item.areaID !== currentLayerData.id;
		        });
			break;
			case 4:
				points = points.filter(function(item){
					return item.id !== currentLayerData.id;
		        });
			break;
			default:
				break;
		}
		refreshLocalStorage();
        var layers = $('#layer0').getLayers();
		for(var i=layers.length-1;i>=0;i=i-2){
			var item = layers[i];
		    if(item.type === 'text' && (item.data.id === currentLayerData.id || item.data.roomID === currentLayerData.id || item.data.areaID === currentLayerData.id)){
		        layers.splice(i-1,2);//根据右上角的文字删除
		    }
		}

		$('#layer0').drawLayers();
    });
    $("#treeCloseBtn").on("click", function(e){
        $('#treeModal').modal('hide');
    });
});