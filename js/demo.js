var heatmapInstance = h337.create({
  container: document.querySelector('#heatmap')
});
var popheatmapInstance = h337.create({
  container: document.querySelector('#pop-heatmap')
});
var zoom = 1;
var innerPath = false; //5.21 for judgeing cousor in draw path
var _inRect = false; //small house
var heatmap = document.querySelector('#heatmap');
var mapDiv = document.querySelector('#map');
var initH = parseInt(heatmap.style.height);
var initW = parseInt(heatmap.style.width);
var c = document.getElementsByClassName('heatmap-canvas')[1],
drawCanvas = document.getElementById("drawCanvas");
var ctx = c.getContext("2d"), drawCtx = drawCanvas.getContext("2d");
var cH = parseInt(c.height), cW = parseInt(c.width);
var drawTop = parseInt(drawCanvas.style.top), drawLeft, scrollTop = 0, scrollLeft = 0;
// drawLeft = parseInt(window.getComputedStyle(drawCanvas, null).left);
drawLeft = parseInt(getStyle(mapDiv, 'marginLeft'));

var hoverPop1 = document.getElementById("hover-pop");
var clickPop = document.getElementById("click-pop");
var popupDiv = document.getElementById("popup-div");
var hoverPop2 = document.getElementById("hover-pop2");
var hoverPopf = document.getElementById("hover-popf");
var closeIcon = document.getElementById("close-icon");

var house1 = [[27,308],[166,308],[166,319],[261,319],[261,435],[27,435],[27,308]];
var house2 = [[27,436],[261,436],[261,580],[211,580],[210,611],[27,611]];
var house3 = [[212,581],[264,581],[264,612],[212,612],[212,581]];
var house4 = [[439,177],[637,177],[637,199],[439,199],[439,177]];
var house5 = [[690,364],[787,364],[787,452],[690,452],[690,364]];
var houses = [house1, house2, house3];
let roomPaths = JSON.parse(localStorage.getItem('roomPaths'));
let areaPaths = JSON.parse(localStorage.getItem('areaPaths'));
let pointPaths = JSON.parse(localStorage.getItem('pointPaths'));
houses = roomPaths;
//因为data是一组数据,web切图报价所以直接setData
 //heatmapInstance.setData(data); //数据绑定还可以使用
var initData = 
{   
  max:500, 
  data:[{ x: 150, y: 400, radius:20,value: 200},
  { x: 50, y: 550, radius:20,value: 200},
  { x: 45, y: 500, radius:20,value: 200},
  { x: 225, y: 600, radius:20,value: 180},
  { x: 235, y: 600, radius:20,value: 280},
  { x: 245, y: 600, radius:20,value: 180},
  { x: 225, y: 590, radius:20,value: 180},
  { x: 235, y: 590, radius:20,value: 180},
  { x: 245, y: 590, radius:20,value: 180},
  { x: 210, y: 460, radius:20,value: 80},
  { x: 850, y: 500, radius:20,value: 30},
  { x: 720, y: 410, radius:20,value: 40}]
};
initData.data = pointPaths;
if(initData.data!=null){
  heatmapInstance.setData(initData);
}

var itv;
function getValue(initVal, clear){
  var v = initVal;
  if(v.data == null){
    return;
  }
  if(clear || false){
    heatmapInstance.removeData();
    clearInterval(itv);
  }
  itv = setInterval(
    function(){
      // v.data.forEach(v => {v.value = v.value + 20});
      v.data.forEach(function(v){v.value = v.value + 20});
      heatmapInstance.setData(initVal);
      if(v.data.some(function(val){
        return val.value > 500;
      })){
        clearInterval(itv);
      }
    }, 500);
};
getValue(initData);

function getStyle(obj,attr) {
  return obj.currentStyle ? obj.currentStyle[attr]:getComputedStyle(obj)[attr];
}

function computePoints(points, zoom) {
	if(points === null){
		return;
	}
  return Array.prototype.slice.call(points).map(function(v){
    let obj = {};
    obj.x = Math.round(v.x * zoom);
    obj.y = Math.round(v.y * zoom);
    obj.radius = v.radius;
    obj.value = v.value;
    return obj;
  });
}

function computeHover(points, zoom){
  var bs = slider.getValue();
  if(points == null){
    return [];
  }
  return Array.prototype.slice.call(points).map(function(v){
    let obj = {};
    obj.x = Math.round(v.x * bs) + drawLeft - scrollLeft;
    obj.y = Math.round(v.y * bs) + drawTop - scrollTop;
    obj.radius = v.radius;
    obj.isHover = false;
    return obj;
  });
}

function contextZoom(scale){
  drawCtx.scale(scale, scale);
  ctx.scale(scale, scale);
}

function draw(ctx, scale, color, house, scrollTop, scrollLeft, lineWidth){
	if(lineWidth == undefined){
		lineWidth = 5;
	}
	ctx.scale(scale, scale);
	var bs = slider.getValue();
	var house1 = house.map(function(v) {
		return [v[0] - scrollLeft/bs, v[1] - scrollTop/bs]
	});
	if(house1!==undefined){
		ctx.beginPath();
		ctx.lineWidth=lineWidth;
		ctx.strokeStyle = color;
		ctx.moveTo(house1[0][0], house1[0][1]);
		for(let i = 1; i < house1.length; i++){
		  ctx.lineTo(house1[i][0], house1[i][1]);
		}
		ctx.closePath();
		ctx.stroke();
	}
}

 //构建一些随机数据点,网页切图价格这里替换成你的业务数据
 /*var points = [];
 var max = 0;
 var width = document.body.clientWidth;
 var height = document.body.clientHeight;
 var len = 10;
 while (len--) {
   var val = Math.floor(Math.random()*100);
   max = Math.max(max, val);
   var point = {
    x: Math.floor(Math.random()*width),
    y: Math.floor(Math.random()*height),
    value: val
  };
  points.push(point);
}
var data = {
  max: max,
  data: points
};*/

drawCanvas.onmousemove = function(e){
  _inRect = false;
  zoom = 1;
  drawCtx.clearRect(0,0,1650,1100);
  hoverPop1.style.visibility = 'hidden';
  innerPath = false;
  houses.forEach(function(house, index){
    draw(drawCtx, zoom, "#35A1E9", house, scrollTop, scrollLeft, 2);
    if(drawCtx.isPointInPath(e.pageX-drawLeft, e.pageY-drawTop)){
      draw(drawCtx, zoom, "#35A1E9", house, scrollTop, scrollLeft);
      hoverPop1.style.left = e.pageX+ 5 + 'px';
      hoverPop1.style.top = e.pageY+ 5 + 'px';
      switch (index) {
        case 0:
          hoverPop1.src = "./img/c.png";
          break;
        case 1:
          hoverPop1.src = "./img/b.png";
          break;
        case 2:
          hoverPop1.src = "./img/a.png";
          _inRect = true;
          break;
        default:
          break;
      }
      hoverPop1.style.visibility = 'visible';
      innerPath = true;
    }
  });
  if(areaPaths !== null) {
    areaPaths.forEach(function(area, index){
      draw(drawCtx, zoom, "#E8A595", area, scrollTop, scrollLeft, 2);
      if(drawCtx.isPointInPath(e.pageX-drawLeft, e.pageY-drawTop)){
        draw(drawCtx, zoom, "#E8A595", area, scrollTop, scrollLeft);
      }
    });
  }

  var objs = computeHover(initData.data, zoom);
  var isHover = false;
  for(var i=0;i<objs.length;i++){  
    var cc = objs[i]; 
    if((e.clientX-cc.x)*(e.clientX-cc.x)+(e.clientY-cc.y)*(e.clientY-cc.y)<=cc.radius*cc.radius){
      isHover = true;
      hoverPop2.style.visibility = 'visible';
      hoverPop2.style.left = e.pageX+ 5 + 'px';
      hoverPop2.style.top = e.pageY- 150 + 'px';
      hoverPop1.style.visibility = 'hidden';
    }else{
      hoverPop2.style.visibility = 'hidden';
    }
  }
  if(isHover){
    hoverPop2.style.visibility = 'visible';
    hoverPop1.style.visibility = 'hidden';
  }else{
    hoverPop2.style.visibility = 'hidden';
  }
}
// var preWidth = document.documentElement.clientWidth;
window.addEventListener('resize', function() {
  /*var zoom = document.documentElement.clientWidth/preWidth;
  let pArr = computePoints(initData.data, zoom);
  heatmapInstance.setData({
    max:500, 
    data:pArr
  });*/
  drawLeft = parseInt(getStyle(mapDiv, 'marginLeft'));
});

var imgEle = document.querySelectorAll(".sm-img");
Array.prototype.slice.call(imgEle).forEach(function(v){
  v.addEventListener('mouseout', function(){
    v.className = "sm-img";
  });
  v.addEventListener('mouseover', function(){
    v.className = "bg-img";
  })
});

document.getElementById("map").addEventListener("scroll", function(e){
  scrollTop = e.target.scrollTop, scrollLeft = e.target.scrollLeft;
  drawCtx.clearRect(0,0,1650,1100);
  ctx.clearRect(0,0,c.width,c.height);
  /*for(house of houses){
    draw(drawCtx, 1, "white", house, scrollTop/zoom, scrollLeft/zoom);
    if(drawCtx.isPointInPath(e.pageX-drawLeft, e.pageY-drawTop)){
      draw(drawCtx, 1, "red", house, scrollTop/zoom, scrollLeft/zoom);
    }
  }*/
  houses.forEach(function(house){
    draw(drawCtx, 1, "rgba(255,255,255,0.1)", house, scrollTop/zoom, scrollLeft/zoom);
    if(drawCtx.isPointInPath(e.pageX-drawLeft, e.pageY-drawTop)){
      draw(drawCtx, 1, "#35A1E9", house, scrollTop/zoom, scrollLeft/zoom);
    }
  });
  if(areaPaths !== null) {
    areaPaths.forEach(function(area, index){
      draw(drawCtx, 1, "rgba(255,255,255,0.1)", area, scrollTop, scrollLeft);
      if(drawCtx.isPointInPath(e.pageX-drawLeft, e.pageY-drawTop)){
        draw(drawCtx, 1, "#E8A595", area, scrollTop, scrollLeft);
      }
    });
  }
  var bs = slider.getValue();
  let pArr = computePoints(initData.data, bs);
  getValue({   
      max:500, 
      data:pArr
    },true);
});

document.getElementById("map-btn").addEventListener("click", function(e){
  this.classList.add("btn-primary");
  document.getElementById("report-btn").classList.remove("btn-primary");
  document.getElementById("map").style.display='block';
  heatmap.style.display='block';
  document.getElementById("report").style.display='none';
  document.getElementById("mapList").style.display='flex';
  document.getElementById("reportList").style.display='none';
});

document.getElementById("report-btn").addEventListener("click", function(e){
  this.classList.add("btn-primary");
  document.getElementById("map-btn").classList.remove("btn-primary");
  document.getElementById("map").style.display='none';
  heatmap.style.display='none';
  document.getElementById("report").style.display='block';
  document.getElementById("mapList").style.display='none';
  document.getElementById("reportList").style.display='flex';
});

closeIcon.addEventListener("click", function(e){
  clickPop.style.visibility = 'hidden';
  popupDiv.style.visibility = 'hidden';
  hoverPopf.style.visibility = 'hidden';
  closeIcon.style.visibility = 'hidden';
});

drawCanvas.addEventListener('click',function(e){
  if(innerPath){
    if(_inRect){
      //点击弹出窗口
      popupDiv.style.visibility = 'visible';
      closeIcon.style.visibility = 'visible';
      document.getElementById("big-area-btn").click();
      popcanvas = document.getElementsByClassName('heatmap-canvas')[1];
      setPopupHeatmap();
      //点击放大定位
      /*slider.setValue(4, true, true);
      var map = document.getElementById("map");
      map.scrollTop = map.scrollHeight;
      map.scrollLeft = 500;*/
    }else{
      clickPop.style.visibility = 'visible';
      closeIcon.style.visibility = 'visible';
    }
  }
});

document.getElementById("big-area-btn").addEventListener("click", function(e){
  this.classList.add("btn-primary");
  document.getElementById("dashboard-btn").classList.remove("btn-primary");
  document.getElementById("click-pop1").style.display='none';
  document.getElementById("click-pop21").style.display='block';
});
document.getElementById("dashboard-btn").addEventListener("click", function(e){
  this.classList.add("btn-primary");
  document.getElementById("big-area-btn").classList.remove("btn-primary");
  document.getElementById("click-pop21").style.display='none';
  document.getElementById("click-pop1").style.display='block';
  hoverPopf.style.visibility = 'hidden';
});

function setPopupHeatmap() {
  var popinitData = 
   {   
     max:500, 
     data:[{ x: 100, y: 100, radius:30,value: 200},
     { x: 300, y: 100, radius:30,value: 280},
     { x: 500, y: 100, radius:30,value: 180},
     { x: 100, y: 300, radius:30,value: 180},
     { x: 300, y: 300, radius:30,value: 180},
     { x: 500, y: 300, radius:30,value: 180}]
   };
  popheatmapInstance.setData(popinitData);
  var itv2;
  var getValue2 = function(initVal, clear){
    var v = initVal;
    if(clear || false){
      popheatmapInstance.removeData();
      clearInterval(itv2);
    }
    itv2 = setInterval(
      function(){
        v.data.forEach(function(v){v.value = v.value + 20});
        popheatmapInstance.setData(initVal);
        if(v.data.some(function(val){
          return val.value > 500;
        })){
          clearInterval(itv2);
        }
      }, 500);
  };
  getValue2(popinitData);
}

var popcanvas = document.getElementsByClassName('heatmap-canvas')[0];
popcanvas.onmousemove = function(e){
  hoverPop2.style.visibility = 'hidden';
  var objs = [
  {x:770,y:396,radius:20,isHover:false},
  {x:970,y:396,radius:20,isHover:false},
  {x:1170,y:396,radius:20,isHover:false},
  {x:770,y:596,radius:20,isHover:false},
  {x:970,y:596,radius:20,isHover:false},
  {x:1170,y:596,radius:20,isHover:false},
  ];
  var isHover = false;
  for(var i=0;i<objs.length;i++){  
    var cc = objs[i]; 
    if((e.clientX-cc.x)*(e.clientX-cc.x)+(e.clientY-cc.y)*(e.clientY-cc.y)<=cc.radius*cc.radius){
      isHover = true;
      hoverPopf.style.visibility = 'visible';
      hoverPopf.style.left = e.pageX+ 5 + 'px';
      hoverPopf.style.top = e.pageY- 150 + 'px';
    }else{
      hoverPopf.style.visibility = 'hidden';
    }
  }
  if(isHover){
    hoverPopf.style.visibility = 'visible';
  }else{
    hoverPopf.style.visibility = 'hidden';
  }
}

var slider = new Slider("#ex4", {
  reversed : true
});

slider.on("change", function(e){
    zoom = e.newValue;
    drawCtx.clearRect(0,0,1650,1100);
    ctx.clearRect(0,0,c.width,c.height);
    heatmap.style.height = initH * zoom + 'px';
    heatmap.style.width = initW * zoom + 'px';
    c.height = cH * zoom;
    c.width = cW * zoom;
    heatmapInstance._renderer.setDimensions(c.width, c.height);
    if (e.newValue > 1) {
      drawCanvas.height = cH - 17;
      drawCanvas.width = cW - 17;
    }else{
      drawCanvas.height = cH;
      drawCanvas.width = cW;
    }
    contextZoom(zoom);
    let pArr = computePoints(initData.data, zoom);
    getValue({max:500, data:pArr}, true);
});

houses.forEach(function(house, index){
    draw(drawCtx, zoom, "#35A1E9", house, scrollTop, scrollLeft, 2);
});
if(areaPaths !== null) {
	areaPaths.forEach(function(area, index){
	  draw(drawCtx, zoom, "#E8A595", area, scrollTop, scrollLeft, 2);
	});
}

var toggle = true;
$(function () {
    $(".datepicker").datepicker({
        language: "zh-CN",
        autoclose: true,//选中之后自动隐藏日期选择框
        clearBtn: true,//清除按钮
        todayBtn: true,//今日按钮
        format: "yyyy-mm-dd"//日期格式，详见 http://bootstrap-datepicker.readthedocs.org/en/release/options.html#format
    });
    $( "#p1s-button").click(function(){
      $("#p1s-button").toggleClass( "switch-button-1 switch-button-2");
      if (toggle) {
			$("#ppimg1").attr("src", "./img/room_3.png")
			toggle = false;
		} else {
			$("#ppimg1").attr("src", "./img/03.png")
			toggle = true;
		}
    });
    $( "#p2s-button").click(function(){
      $("#p2s-button").toggleClass( "switch-button-1 switch-button-2");
      if (toggle) {
			$("#ppimg2").attr("src", "./img/room_3.png")
			toggle = false;
		} else {
			$("#ppimg2").attr("src", "./img/03.png")
			toggle = true;
		}
    });
});

