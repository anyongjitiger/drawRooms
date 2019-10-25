$(function () {
	var pen = 0;
	var penColors = ['red', 'blue', 'green', 'orange'];
	var penColor = penColors[pen];
	getRoomOptions();
	var roomTemplate = $("#roomSelector").html();
	var areaTemplate = $("#areaSelector").html();
	var pointTemplate = $("#pointSelector").html();
	var modalTitles = ['Select Room','Select Area','Select Point' ];
	var templates = [roomTemplate, areaTemplate, pointTemplate, roomTemplate];
	var modalInnerHtml = templates[pen];
	var modalTitle = modalTitles[pen];
	var roomCount = 0, areaCount = 0, pointCount = 0;
	$(".draw-modal-body").html(modalInnerHtml);
    $("input[type='radio']").on("click",function(){
    	$("input[type='radio']").prop("checked",false);
    	let radioName = $(this).attr("name");
    	// $(this).attr("checked",true);
    	$(`input[name='${radioName}']`).prop("checked",true);
		pen = parseInt($(this).val());
		penColor = penColors[pen];
		modalInnerHtml = templates[pen];
		modalTitle = modalTitles[pen];
		$(".draw-modal-body").html(modalInnerHtml);
		$("#myModalLabel").text(modalTitle);
		bindCanvasEvent();
	});
	const MAPS = [{'floor_id': '110-HM1-1043', 'url': '110-HM1-1043.png', 'width': 1100, 'height': 800},
	{'floor_id': '110-HM1-1044', 'url': '110-HM1-1044.png', 'width': 1100, 'height': 800},
	{'floor_id': '110-HM1-1053', 'url': '110-HM1-1053.png', 'width': 1100, 'height': 800}, 
	{'floor_id': '110-HM1-1054', 'url': '110-HM1-1054.png', 'width': 1100, 'height': 800}, 
	{'floor_id': '110-HM1-3046', 'url': '110-HM1-3046.png', 'width': 1100, 'height': 800},
	{'floor_id': '110-HM1-3047', 'url': '110-HM1-3047.png', 'width': 1100, 'height': 800},
	{'floor_id': '110-HM1-3048', 'url': '110-HM1-3048.png', 'width': 1100, 'height': 800},
	{'floor_id': '110-HM1-3051', 'url': '110-HM1-3051.png', 'width': 1100, 'height': 800},
	{'floor_id': '110-HM1-3057', 'url': '110-HM1-3057.png', 'width': 1100, 'height': 800}
	];
	var curMap = '110-HM1-1043.png';
	for(var i = 0; i < MAPS.length; i++) {
		//添加option元素
		$("#mapSelect").append("<option value='" + MAPS[i].url + "'>" + MAPS[i].floor_id + "</option>");
	}
	curMap = $("#mapSelect").val();
	getSelectedMapData('110-HM1-1043');
    $("#mapSelect").change(function (data) {
    	if(!(AllLinePoints.length === 0 && roomPaths.length ===0)){
    		$("#mapSelect").val(curMap);
    		alert('Please save first!');
    		return;
    	}
    	curMap = $("#mapSelect").val();
    	var text = $("#mapSelect").find("option:selected").text();
    	getSelectedMapData(text);
        clear();
    });


    // var domCanvas = document.getElementById('layer0');
    var domCanvas = $('#layer0')[0];
    $('#layer0').addLayer({
	  type: 'image',
	  source: 'img/110-HM1-1043.png',
	  width:872,
	  height:634,
	  x: 436, y: 317
	});
	$('#layer0').drawLayers();
	// var domContext = domCanvas.getContext('2d');
	// domContext.fillRect(50,50,150,50);

	// var balls = [];
    var rooms= [], areas = [], points = [];
    var roomPaths= [], areaPaths = [], pointPaths = [], linePaths = [];

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
				startX = _calculateXY(e, domCanvas).x;
				startY = _calculateXY(e, domCanvas).y;
				var _in = inRect2(startX, startY, rooms); //临时加2
				isShot = pen === 0 ? (!_in) : _in;
			}).mousemove(function(e) {
			    if(isShot) {
			      $('#layer0').removeLayer(layerName);
			      moveX = _calculateXY(e, domCanvas).x;
			      moveY = _calculateXY(e, domCanvas).y;
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
				getRoomOptions();
			    moveX = _calculateXY(e, domCanvas).x;
			    moveY = _calculateXY(e, domCanvas).y;
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
				startX = _calculateXY(e, domCanvas).x;
				startY = _calculateXY(e, domCanvas).y;
				if(pointInRooms(startX, startY)){
					var thisRoom = getParent(startX, startY, rooms);
					var thisLines = getLinesParent(startX, startY, AllLinePoints);
					var text = (thisRoom !== undefined) ? thisRoom['text'] : thisLines["name"];
					getPointOptions(text);
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
			const groupsLength = AllLinePoints.length;
			if(!drawingLines){
				$('#layer0').mousedown(function(e) {
					layerNumber++;
					layerName = 'layer' + layerNumber;
					startX = _calculateXY(e, domCanvas).x;
					startY = _calculateXY(e, domCanvas).y;
					lineStartPoint = new Point(startX, startY);
					isShot = true;
				}).mousemove(function(e) {
				    if(isShot) {
				      	$('#layer0').removeLayer(layerName);
				      	moveX = _calculateXY(e, domCanvas).x;
				      	moveY = _calculateXY(e, domCanvas).y;
						$('#layer0').addLayer({
						  type: 'line',
						  groups: ['lineGroup'+ groupsLength],
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
				    moveX = _calculateXY(e, domCanvas).x;
				    moveY = _calculateXY(e, domCanvas).y;
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
					let _moveX = moveX, _moveY = moveY;
					_moveX = _calculateXY(e, domCanvas).x;
					_moveY = _calculateXY(e, domCanvas).y;
			  		if(pointInRooms(_moveX, _moveY)){
			  			return;
			  		}
			  		startX = moveX;
					startY = moveY;
					moveX = _moveX;
					moveY = _moveY;

					lineCurrPoint = new Point(moveX, moveY);
					if(inCircle(10, lineStartPoint, lineCurrPoint)){
						moveX = lineStartPoint.x;
						moveY = lineStartPoint.y;
						drawingLines = false;
						drawingLinePoints.push(new Point(moveX, moveY));
						AllLinePoints.push({'path': drawingLinePoints});
						if(AllLinePoints.length >1 ){ //这里是判断两个多边形的边界是否相交
							var jc = isPolygonsIntersectant(AllLinePoints[0].path, AllLinePoints[1].path);
							// console.log(jc);
						}
						getRoomOptions();
						$('#myModal').modal({  
						  keyboard: false  
						});
						drawingLinePoints = [];
						bindCanvasEvent();
					} else {
						drawingLinePoints.push(new Point(moveX, moveY));
					}
					const lastLayerGroup = $('#layer0').getLayer(-1).groups[0];
					$('#layer0').addLayer({
					  type: 'line',
					  groups: [lastLayerGroup],
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

	function pointInRooms(x, y) {
		var _inAreas = inRect2(x, y, rooms);
		var np = new Point(x , y);
		var _inLines = AllLinePoints.reduce(function(r,v){
    		var inn = isPolygonContainsPoint(v.path, np);
    		return r || inn;
  		}, false);
  		return _inAreas || _inLines;
	}

	function refreshLocalStorage(){
		// roomPaths = [];
		// areaPaths = [];
		pointPaths = [];
		linePaths = [];
        // getRectPath(rooms, roomPaths);
		// getRectPath(areas, areaPaths);
		getPointPath(points, pointPaths);
		AllLinePoints.forEach((v, i) => {
			linePaths[i] = v.path.reduce((s, val) => {
				s.push([val.x, val.y]);
				return s;
			}, []);
		});
	}

    $("#drawOKBtn").on("click", function(e){
    	var v = $(".pop-select").val();
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
    	if(pen === 0 || pen === 3){
    		roomCount++;
    		var lastRoomID = nodes.length === 0 ? '10' : _.orderBy(nodes, ['id'], ['desc'])[0].id;
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
    		
    		if(pen === 3){
    			AllLinePoints[AllLinePoints.length -1].id = newRoomID;
    			AllLinePoints[AllLinePoints.length -1].name = v;
    			if(!AllLinePoints[AllLinePoints.length -1].hasOwnProperty('points')){
					AllLinePoints[AllLinePoints.length -1].points = [];
    			}
				AllLinePoints.forEach((v, i) => {
					linePaths[i] = v.path.reduce((s, val) => {
						s.push([val.x, val.y]);
						return s;
					}, []);
				});
    		}else{
    			rooms.push({
	    			id: newRoomID,
	    			text: v,
	    			start: {'x': startX, 'y': startY},
	    			end: {'x': moveX, 'y': moveY}
	    		});
	    		// roomPaths.push(toRectPathArray({'x': startX, 'y': startY}, {'x': moveX, 'y': moveY}));
	    		roomPaths = [];
    			getRectPath(rooms, roomPaths);
    		}
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
    	}else if(pen === 2){
    		/*area = getParent(startX, startY, areas);
    		areaID = area.id;
    		roomID = area.roomID;
    		var roomNode = nodes.filter(function(node){
    			return node.id === roomID;
    		})[0];
			var areaNode = roomNode.nodes.filter(function(node){
    			return node.id === areaID;
    		})[0];
    		var lastPointID = (areaNode.nodes === undefined || areaNode.nodes.length === 0) ? (areaID + '0') : areaNode.nodes[areaNode.nodes.length-1].id;*/
    		let pointIn;
    		let _roomOfPoint = getParent(startX, startY, rooms),_LinesOfPoint = getLinesParent(startX, startY, AllLinePoints);
    		if(_roomOfPoint){
    			room = _roomOfPoint;
    			pointIn = 'room';
    		}else{
    			room = _LinesOfPoint;
    			pointIn = 'line';
    		}
    		roomID = room.id;
    		var roomNode = nodes.find(function(node){
    			return node.id === roomID;
    		});
    		var lastPointID = (roomNode.nodes === undefined || roomNode.nodes.length === 0) ? (roomID + '0') : roomNode.nodes[roomNode.nodes.length-1].id;
    		newPointID = (parseInt(lastPointID)+1).toString();
			var newPointNode = {
    			id: newPointID,
    			text: v,
    			start: {'x': startX, 'y': startY},
    			end: {'x': moveX, 'y': moveY}
    		}
    		if(roomNode.nodes === undefined){
    			roomNode.nodes = [];
    		}
			$("#tree").treeview("addNode", [roomNode.nodeId, { node: newPointNode }]);
    		// points.push({'x': startX, 'y': startY});
    		points.push({
    			roomID: roomID,
    			// areaID: areaID,
    			id: newPointID,
    			text: v,
    			start: {'x': startX, 'y': startY},
    			end: {'x': moveX, 'y': moveY}
    		});
    		// pointPaths.push({ x: startX, y: startY, radius:20,value: 100});
    		getPointPath(points, pointPaths);
    		if(pointIn === 'room'){
    			const room = roomPaths.find((v)=>{
    				return v.id === roomID
    			});
    			room.points.push({'id': newPointID, 'text': v, 'position': new Point(startX, startY)});
    		}else{
    			const room = AllLinePoints.find((v)=>{
    				return v.id === roomID
    			});
    			room.points.push({'id': newPointID, 'text': v, 'position': new Point(startX, startY)});
    		}
    	}
    	var newIDs = [newRoomID, newAreaID, newPointID, newRoomID];
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
    	// 这里没有删除localstorage
    	var layers = $('#layer0').getLayers();
    	if(pen !== 3){
    		$('#layer0').removeLayer(layers.length - 1);
    	}else{
    		AllLinePoints.pop();
    		const groupName = layers[layers.length-2].groups[0];
    		$('#layer0').removeLayerGroup(groupName);
    	}
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

    var treeData = [{
    	text: "rooms",
        id: '1',
        state: {
		    expanded: true
		},
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
    function initTree() {
    	$("#tree").treeview({
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
    }
	
    initTree();

    $("#treeOKBtn").on("click", function(e){
        $("#tree").treeview("deleteNode", [currentLayerData.nodeId, { silent: true }]);
        $('#treeModal').modal('hide');
        treeData[0].nodes = treeData[0].nodes.filter(function(item){
        	return item.nodeId !== currentLayerData.nodeId;
        });
        var layers = $('#layer0').getLayers();
        var i=layers.length-1;
        while(i>=0){
		// for(var i=(layers.length-1); i>=0;){
			var item = layers[i];
		    if(item.type === 'text'){
		    	if(item.data.id === currentLayerData.id || item.data.roomID === currentLayerData.id || item.data.areaID === currentLayerData.id){
					if(layers[i-1].type !== 'line'){
			        	layers.splice(i-1,2);//根据右上角的文字删除
			        	i = i - 2;
			        	// break;
			        }else{
			        	const cur = AllLinePoints.find((v) => {
			        		return v.id === currentLayerData.id;
			        	});
			        	const length = cur.path.length;
			        	layers.splice(i-length+1,length);
			        	i = i - length;
			        	// break;
			        }
		    	}else{
		    		i--;
		    	}
		    }else if(item.type === 'image'){
		    	break;
		    }else{
		    	i--;
		    }
		}

        //通过节点ID长度来判断删除的节点是room/area/point
        switch(currentLayerData.id.length) {
			case 2:
		        rooms = rooms.filter(function(item){
					return item.id !== currentLayerData.id;
		        });
		        roomPaths = roomPaths.filter(function(item){
					return item.id !== currentLayerData.id;
		        });
		        areas = areas.filter(function(item){
					return item.roomID !== currentLayerData.id;
		        });
		        points = points.filter(function(item){
					return item.roomID !== currentLayerData.id;
		        });
		        AllLinePoints = AllLinePoints.filter(function(item){
					return item.id !== currentLayerData.id;
		        });
				break;
			/*case 3:
		        areas = areas.filter(function(item){
					return item.id !== currentLayerData.id;
		        });
		        points = points.filter(function(item){
					return item.areaID !== currentLayerData.id;
		        });
			break;*/
			case 3:
				points = points.filter(function(item){
					return item.id !== currentLayerData.id;
		        });
		        const pid = currentLayerData.id;
		        const rid = pid.substr(0,2);
		        let __room = (AllLinePoints.find(function(item){
					return item.id === rid;
		        })) || (roomPaths.find(function(item){
						return item.id === rid;
			        }));
		        __room.points = __room.points.filter(v => {
	        		return v.id !== pid
	        	});
				break;
			default:
				break;
		}
		refreshLocalStorage();
		$('#layer0').drawLayers();
    });
    $("#treeCloseBtn").on("click", function(e){
        $('#treeModal').modal('hide');
    });

    function restartPaint() {
    	var mapid = $("#mapSelect option:selected").attr("value");
        const mapWidth = MAPS.find(v => {
        	return v.url === mapid;
        }).width;
        $('#layer0').addLayer({
		  type: 'image',
		  source: 'img/'+ mapid,
		  width: Math.round(mapWidth/800 * 634),
		  height:634,
		  x: 436, y: 317
		});
		$('#layer0').drawLayers();
    }

    function clear() {
    	$('#layer0').removeLayers();
    	restartPaint();
    	rooms= [];
    	points = [];
    	roomPaths= [];
    	pointPaths = [];
    	linePaths = [];
    	AllLinePoints = [];
    	$("input:radio").prop("checked",false);
    	$("#room").prop("checked",true);
    	pen = parseInt($("#room").val());
		penColor = penColors[pen];
		modalInnerHtml = templates[pen];
		modalTitle = modalTitles[pen];
		$(".draw-modal-body").html(modalInnerHtml);
		$("#myModalLabel").text(modalTitle);
		bindCanvasEvent();
    	treeData[0].nodes = [];
    	$('#tree').treeview('remove');
    	initTree();
    }

    function save() {
    	var mapid = $("#mapSelect option:selected").attr("value");
        const map = MAPS.find(v => {
        	return v.url === mapid;
        });
        map.rooms = [...roomPaths, ...AllLinePoints];
        $.post("/set_floor_data", {'floor_data': JSON.stringify(map)}, function(data){
			if(data.success){
				alert('Saved successfully');
				clear();
	        	filterRoomOptions(map);
			}
		},"json");
    }
    $("#save").on("click", function(e){
    	if(AllLinePoints.length === 0 && roomPaths.length ===0){
    		alert('No data');
    		return;
    	}
        save();
    });
    $("#clear").on("click", function(){
		clear();
    });

    function getRoomOptions() {
		$.get("/get_enabled_location3s",function(data,status){
		    var roomOpts = _.sortBy(data.list).map(v => `<option>${v}</option>`).join("");
		    $(".pop-select").empty();
		    $(".pop-select").append(roomOpts);
		});
    }
    function getPointOptions(room) {
		$.get("/get_enabled_locationIds?l3_name="+room,function(data,status){
		    var pointOpts = data.list.map(v => `<option>${v}</option>`).join("");
		    $(".pop-select").empty();
		    $(".pop-select").append(pointOpts);
		});
    }
    function filterRoomOptions(map){
    	map.rooms.forEach(room => {
    		let param = {"usable": "","unusable": room.name};
    		$.post("/set_used_location3", param, function(data){
				console.log(data);
			},"json");
    	});
    }

    function getSelectedMapData(map){
    	$.post("/get_floor_data", {"floor_id": map}, function(data){
			if(data.success){
				let rtRooms = data.list.rooms;
				$('#layer0').removeLayers();
				$('#layer0').addLayer({
				  type: 'image',
				  source: 'img/'+ data.list.url,
				  width: Math.round(data.list.width/800 * 634),
				  height:634,
				  x: 436, y: 317
				});
				layerNumber = 0;
				rtRooms.forEach((v, i, a) => {
					var newRoomNode = {
		    			id: v.id,
		    			text: v.text || v.name,
		    			start: v.path.length > 5 ? v.path[v.path.length - 2] : v.path[0],
		    			end: v.path.length > 5 ? v.path[v.path.length - 1] : v.path[2]
		    		}
		    		treeData[0].nodes.push(newRoomNode);
		    		$("#tree").treeview("addNode", [0, { node: newRoomNode }]);
		    		if(v.path.length > 5){
		    			let _paths = [], _points = [];
		    			_paths = v.path.map((pth) => {
		    				return new Point(pth.x, pth.y);
		    			});
		    			_points = v.points.map((pt) => {
		    				return {
		    					id: pt.id,
		    					text: pt.text,
		    					position:new Point(pt.position.x, pt.position.y)
		    				};
		    			});
		    			AllLinePoints.push({
		    				id: v.id,
			    			text: v.name,
			    			path: _paths,
			    			points: _points
		    			});
		    			for(var index = 0; index < v.path.length -1 ; index++){
			    			layerNumber++;
							layerName = 'layer' + layerNumber;
		    				$('#layer0').addLayer({
							  type: 'line',
							  groups: ['lineGroup'+ (i + 1)],
							  strokeStyle: 'orange',
							  strokeWidth: 2,
							  // fillStyle: '#fff',
							  name:layerName,
							  x1: v.path[index].x,
							  y1: v.path[index].y,
							  x2: v.path[index+1].x,
							  y2: v.path[index+1].y
							});
		    			}
		    		}else{
			    		layerNumber++;
						layerName = 'layer' + layerNumber;
			    		$('#layer0').addLayer({
						  type: 'rectangle',
						  strokeStyle: 'red',
						  strokeWidth: 2,
						  // fillStyle: '#fff',
						  name:layerName,
						  fromCenter: false,
						  x: v.path[0].x,
						  y: v.path[0].y,
						  width: v.path[2].x - v.path[0].x,
						  height: v.path[2].y - v.path[0].y
						});
						rooms.push({
			    			id: v.id,
			    			text: v.name,
			    			start: {'x': v.path[0].x, 'y': v.path[0].y},
			    			end: {'x': v.path[2].x, 'y': v.path[2].y}
			    		});
			    		let _pathArray = v.path.map(n => {
			    			return new Point(n.x, n.y);
			    		})
			    		roomPaths.push({'id': v.id, 'name': v.name, 'path': _pathArray, 'points': v.points.map(m => {
			    			return {
			    				id: m.id,
			    				text: m.text,
			    				position: new Point(m.position.x, m.position.y)
		    				};
			    		})});
		    		}
		    		$('#layer0').addLayer({
					  type: 'text',
					  fillStyle: '#9cf',
					  strokeStyle: '#25a',
					  strokeWidth: 1,
					  x: v.path[1].x - 25, y: v.path[1].y + 10,
					  fontSize: 14,
					  fontFamily: 'Verdana, sans-serif',
					  text: v.name,
					  data: {
					  	id: v.id
					  }
					});
		    		v.points.forEach((p) => {
		    			var newPointNode = {
			    			id: p.id,
			    			text: p.text,
			    			start: {'x': p.position.x, 'y': p.position.y},
			    			end: {'x': 0, 'y': 0}
			    		}
			    		var nodes = treeData[0].nodes;
			    		var roomNode = nodes.filter(function(node){
			    			return node.id === v.id;
			    		})[0];
		    			$("#tree").treeview("addNode", [parseInt(roomNode.nodeId), { node: newPointNode }]);
		    			$('#layer0').addLayer({
				          type: 'arc',
						  fillStyle: '#69f',
						  strokeStyle: '#000',
						  strokeWidth: 1,
				          x: p.position.x,
				          y: p.position.y,
						  radius: 10
				      	});
				      	$('#layer0').addLayer({
						  type: 'text',
						  fillStyle: '#9cf',
						  strokeStyle: '#25a',
						  strokeWidth: 1,
						  x: p.position.x, y: p.position.y - 17,
						  fontSize: 14,
						  fontFamily: 'Verdana, sans-serif',
						  text: p.text,
						  data: {
						  	id: p.id,
						  	roomID: v.id
						  }
						});
		    		});
					$('#layer0').drawLayers();
				});
			}
		},"json");
    }
});