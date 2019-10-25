function Point(x, y) {
  this.x = x;
  this.y = y;
}

function _calculateXY(e, canvas){
	return {
      x: e.clientX - canvas.getBoundingClientRect().left,
      y: e.clientY - canvas.getBoundingClientRect().top
    }
}

function toRectPathArray(start, end){
	return [[start.x, start.y], [end.x, start.y], [end.x, end.y], [start.x, end.y], [start.x, start.y]];
}

function toRectPathPointArray(start, end){
	return [new Point(start.x, start.y), new Point(end.x, start.y), new Point(end.x, end.y), new Point(start.x, end.y), new Point(start.x, start.y)];
}

function getRectPath(rects, paths){
	paths.length = 0;
	rects.forEach(function(item, index){
		var pathArray = toRectPathPointArray({'x': item.start.x, 'y': item.start.y}, {'x': item.end.x, 'y': item.end.y});
		console.log(pathArray);
		paths.push({'id': item.id, 'name': item.text, 'path': pathArray, 'points': []});
	});
}

function getPointPath(points, paths){
	paths.length = 0;
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
function getLinesParent(x, y, lines){
	return lines.find((v) => {
		return isPolygonContainsPoint(v.path, new Point(x, y));
	});
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

//判断两多边形线段是否相交
function isSegmentsIntersectant(segA, segB) {//线线
    const abc = (segA[0].x - segB[0].x) * (segA[1].y - segB[0].y) - (segA[0].y - segB[0].y) * (segA[1].x - segB[0].x);
    const abd = (segA[0].x - segB[1].x) * (segA[1].y - segB[1].y) - (segA[0].y - segB[1].y) * (segA[1].x - segB[1].x);
    if (abc * abd >= 0) {
        return false;
    }
    const cda = (segB[0].x - segA[0].x) * (segB[1].y - segA[0].y) - (segB[0].y - segA[0].y) * (segB[1].x - segA[0].x);
    const cdb = cda + abc - abd;
    return !(cda * cdb >= 0);
}

//判断两多边形边界是否相交
function isPolygonsIntersectant(plyA, plyB) {//面面
    for (let i = 0, il = plyA.length; i < il; i++) {
        for (let j = 0, jl = plyB.length; j < jl; j++) {
            const segA = [plyA[i], plyA[i === il - 1 ? 0 : i + 1]];
            const segB = [plyB[j], plyB[j === jl - 1 ? 0 : j + 1]];
            if (isSegmentsIntersectant(segA, segB)) {
                return true;
            }
        }
    }
    return false;
}

function inCircle(radius, c, e) {
	return (e.x-c.x)*(e.x-c.x)+(e.y-c.y)*(e.y-c.y)<=radius*radius;
}