$(function () {
  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const QUARTERS = ['One','Two','Three','Four'];
  const YEARS = ['2016','2017','2018','2019'];
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
  const SAMPLE_TYPES = {
    "surface-viable":['S1','S2','S3','S4','S5','S6','S7','S8','S9','S10','S11','S12','S13','S14','S15',
    'S1_AN_B','S1_AN_BE','S1_AN_E','S1_AN_M',
    'S2_AN_B','S2_AN_BE','S2_AN_E','S2_AN_M',
    'S3_AN_B','S3_AN_BE','S3_AN_E','S3_AN_M',
    'S4_AN_B','S4_AN_E','S4_AN_M',
    'S5_AN_B','S5_AN_BE','S5_AN_E','S5_AN_M',],
    "shower-surface":['SH1'],
    "drain-surface":['D1','D2','D3','D4'],
    "floor-viable":['FS1','FS2','FS3'],
    "active-air": ['FILLROOM','SP1','SP2','SP3','SP4','SP5','VA1','VA1_AN_B', 'VA1_AN_BE', 'VA1_AN_E', 'VA1_AN_M', 'VA10',
        'VA11','VA12','VA2','VA2_AN_B','VA2_AN_BE','VA2_AN_E','VA2_AN_M','VA3','VA4','VA5','VA6','VA7','VA8','VA9'],
    "non-viable-05":['FILLROOM', 'NAV1', 'NVA1', 'NVA10', 'NVA11', 'NVA12', 'NVA2', 'NVA3', 'NVA4', 'NVA5', 'NVA6', 
        'NVA7', 'NVA8', 'NVA9', 'SEED_EXPANSION', 'SEED_EXPANSION1'],
    "non-viable-5":['FILLROOM', 'NAV1', 'NVA1', 'NVA10', 'NVA11', 'NVA12', 'NVA2', 'NVA3', 'NVA4', 'NVA5', 'NVA6', 
        'NVA7', 'NVA8', 'NVA9', 'SEED_EXPANSION', 'SEED_EXPANSION1'],
    "settle-plates":['SEED_EXPANSION', 'SEED_EXPANSION1', 'SEEDSTOCK10', 'SEEDSTOCK3', 'SEEDSTOCK4', 'SEEDSTOCK8',
      'SEEDSTOCK9', 'SP1', 'SP1_AN_B', 'SP1_AN_E', 'SP1_AN_M', 'SP2', 'SP2_AN_B', 'SP2_AN_E', 'SP2_AN_M']
  };
  // 初始化Heatmap
  var heatmapInstance = h337.create({
    container: document.querySelector('#heatmap')
  });
  var smMap1 = document.querySelectorAll('.sm-img-div')[0];
  var smMaps = [...document.querySelectorAll('.sm-img-div')];
  var smMapheatmapInstances = smMaps.slice(0, smMaps.length-1).map(v => {
    return h337.create({
      container: v
    });
  });
  var curMap;
  var startDate, endDate;
  var zoom = 1;
  var innerPath = false;
  var houses = [];
  var initData = 
  {
    min: 0,
    max:100, 
    data:[]
  };
  var pointTypes = [];
  for(k in SAMPLE_TYPES){
    pointTypes = [...pointTypes, ...SAMPLE_TYPES[k]];
  }
  pointTypes = [...new Set(pointTypes)];
  var heatmap = document.querySelector('#heatmap');
  var mapDiv = document.querySelector('#map');
  var initH = parseInt(heatmap.style.height);
  var initW = parseInt(heatmap.style.width);
  var c = document.getElementsByClassName('heatmap-canvas')[0];
  var drawCanvas = document.getElementById("drawCanvas");
  var ctx = c.getContext("2d");
  var drawCtx = drawCanvas.getContext("2d");
  var cH = parseInt(c.height), cW = parseInt(c.width);
  var drawTop = parseInt(drawCanvas.style.top), drawLeft, scrollTop = 0, scrollLeft = 0;
  // drawLeft = parseInt(window.getComputedStyle(drawCanvas, null).left);
  drawLeft = parseInt(getStyle(mapDiv, 'marginLeft')) + parseInt(getStyle(heatmap, 'marginLeft'));
  var pointHoverPop = document.getElementById("point-hover-pop");
  var roomHoverPop = document.getElementById("room-hover-pop");
  var clickPop = document.getElementById("click-pop-details");
  var closeIcon = document.getElementById("close-icon");
  var itv;
  var oPicList = document.getElementById("mapList");
  var oUl = oPicList.getElementsByTagName("ul")[0];
  var aLi = oUl.getElementsByTagName("li");
  var toggle = true;
  var curPointText = "", curPointsRoom = "", curRoom = "";
  oUl.style.width = aLi[0].offsetWidth * aLi.length + "px";
  oUl.style.left =-oUl.offsetWidth/2;
  var timeTypes = {'Month': '1','Quarter': '2', 'Year': '3', 'Specified': '4'};
 //----------------------------------------------------插件初始化---------------------------------------------------- 
  $("#dropdownMenu1").dropdown();
  $("#dropdownMenu2").dropdown();

  // 初始化Slider
  var slider = new Slider("#ex4", {
    reversed : true
  });

  // 初始化DatePicker
  $('.datepicker').datepicker({
    autoclose: true,
    clearBtn: true,
    todayBtn: true,
    format: "yyyy-mm-dd"}).on('changeDate', function(e) {
      if(e.currentTarget.id === 'dateFrom'){
        startDate = dayjs(e.date).format("YYYY-MM-DD") + " 00:00:00";
      }else{
        endDate = dayjs(e.date).format("YYYY-MM-DD") + " 00:00:00";
      }
      generateGroupCharts('4');
  }).prop('disabled', true);

  // 初始化Echarts
  var myChart = echarts.init(document.getElementById('chart'));
  var option = {
    title: {
      text: ''
    },
    tooltip: {},
    legend: {
      data:[{
            name:'ZERO',
            icon:'image://../img/blue.png'
        }, 'BELOW ALERT', 'ALERT', 'ACTION'],
      icon: 'rect',
      itemWidth: 14,
      itemGap: 20
    },
    xAxis: {
      data: []
    },
    yAxis: [{
      type : 'value'
    }],
    series: [{
      name: 'ZERO',
      type: 'bar',
      stack: 'total',
      itemStyle: {
        color: 'white',
        barBorderColor: '#00A2E8',
      },
      data: []
    },{
      name: 'BELOW ALERT',
      type: 'bar',
      stack: 'total',
      itemStyle: {
        color: '#32B16C',
        barBorderColor: '#00A2E8',
      },
      data: []
    },{
      name: 'ALERT',
      type: 'bar',
      stack: 'total',
      itemStyle: {
        color: '#F8B551',
        barBorderColor: '#00A2E8'
      },
      data: []
    },{
      name: 'ACTION',
      type: 'bar',
      stack: 'total',
      itemStyle: {
        color: '#E5004F',
        barBorderColor: '#00A2E8'
      },
      barWidth: 15,
      data: []
    }]
  };
  myChart.setOption(option);

  var myGroupChart = echarts.init(document.getElementById('groupChart'));
  var groupChartOption = {
    title: {
      text: ''
    },
    tooltip: {},
    legend: {
      data:[{
            name:'ZERO',
            icon:'image://../img/blue.png'
        }, 'BELOW ALERT', 'ALERT', 'ACTION'],
      icon: 'rect',
      itemWidth: 14,
      itemGap: 20
    },
    xAxis: {
      data: []
    },
    yAxis: [{
      type : 'value'
    }],
    series: [{
      name: 'ZERO',
      type: 'bar',
      stack: 'total',
      itemStyle: {
        color: 'white',
        barBorderColor: '#00A2E8',
      },
      data: []
    },{
      name: 'BELOW ALERT',
      type: 'bar',
      stack: 'total',
      itemStyle: {
        color: '#32B16C',
        barBorderColor: '#00A2E8',
      },
      data: []
    },{
      name: 'ALERT',
      type: 'bar',
      stack: 'total',
      itemStyle: {
        color: '#F8B551',
        barBorderColor: '#00A2E8',
      },
      data: []
    },{
      name: 'ACTION',
      type: 'bar',
      stack: 'total',
      itemStyle: {
        color: '#E5004F',
        barBorderColor: '#00A2E8',
      },
      barWidth: 15,
      data: []
    },]
  };
  myGroupChart.setOption(groupChartOption);

//----------------------------------------------------页面数据初始化----------------------------------------------------

  $('input[type="checkbox"]').prop({
    checked: true
  });

  for(var i = 0; i < MAPS.length; i++) {
    $("#mapSelect").append("<option value='" + MAPS[i].url + "'>" + MAPS[i].floor_id + "</option>");
  }
  curMap = $("#mapSelect").val();

  getSelectedMapData(curMap.substr(0, curMap.length - 4));

  bindSmallImagesClickEvent('month');

//----------------------------------------------------Functions----------------------------------------------------

  function getSelectedMapHeatData(map) {
    return new Promise((resolve, reject) => {
      $.get(`/get_floor_rooms_alert?floor_id=${map}`, function(data){
        if(data.success){
          initData.min = 0;
          initData.max = (data.list.max <=1 ? 5 : data.list.max);
          $("input[name = 'alertMax']").val(initData.max);
          $("input[name = 'alertMin']").val(initData.min);
          resolve(data.list);
        }else{
          reject('failed');
        }
      },"json");
    });
  }

  function getHeatmapValue(rooms, room, point) {
    let _room = rooms.find(v => {
      return v.name === room;
    });
    let _point = _room.points.find(v => {
      return v.text === point;
    });
    return _point === undefined ? 0 : _point.alert;
  }

  function getSelectedMapData(map){
    getSelectedMapHeatData(map).then(function(r) {
      $.post("/get_floor_data", {"floor_id": map}, function(data){
        drawCtx.clearRect(0,0,1650,1100);
        if(data.success){
          houses = data.list.rooms;
          var pointArray = [];
          data.list.rooms.forEach((vo, i, a) => {
            vo.points.forEach((v, i, a) => {
              let curr = {
                text: v.text,
                x: v.position.x, 
                y: v.position.y,
                radius: 20,
                value: getHeatmapValue(r.rooms, vo.name, v.text),
                roomOf: vo.name
              }
              pointArray.push(curr);
            });
          });
          initData.data = pointArray;
          if(initData.data!=null){
            heatmapInstance.setData(initData);
            smMapheatmapInstances.forEach(v => {
              v.setData(computeSmallHeatmapPosition(initData));
            });
              // getValue(initData, true);
            }
          }else{
            initData.data = [];
            heatmapInstance.setData(initData);
            smMapheatmapInstances.forEach(v => {
              v.setData({max: 0, data: []});
            });
            // getValue(initData, true);
            houses = [];
          }
        },"json");
    });
  }

  function formatDate(data, type){
    var start, end;
    if(type === "year"){
      start = dayjs(`${data}-01-01`).format("YYYY-MM-DD") + " 00:00:00";
      end = dayjs(`${data}-01-01`).endOf('year').format("YYYY-MM-DD") + " 00:00:00";
    }
    else if(type === "month"){
      let year = dayjs().get('year');
      data0 = startWith0(data);
      start = dayjs(`${year}-${data0}-01`).format("YYYY-MM-DD") + " 00:00:00";
      end = dayjs(`${year}-${data0}-01`).endOf('month').format("YYYY-MM-DD") + " 00:00:00";
    }else if(type === "quarter"){
      let year = dayjs().get('year');
      let monthBegin = startWith0(( parseInt(data) -1 ) * 3 + 1);
      let monthEnd = startWith0(( parseInt(data) -1 ) * 3 + 3);
      start = dayjs(`${year}-${monthBegin}-01`).format("YYYY-MM-DD") + " 00:00:00";
      end = dayjs(`${year}-${monthEnd}-01`).endOf('month').format("YYYY-MM-DD") + " 00:00:00";
    }
    return {
      'start': start,
      'end': end
    }
  }

  function startWith0(m){
    return m.length === 1 ? '0' + m : m;
  }

  function movePic(to){
    if(to ==='left'){
      let curLeft = parseInt(oUl.style.left === ''? 0 : oUl.style.left);
      if(-curLeft >= (aLi.length-5) * 220){
        return;
      }
      let newLeft = curLeft - 220;
      $("#mapList > ul").first().animate({left: newLeft.toString()},"fast");
        // oUl.style.left = oUl.offsetLeft - 220 + "px";
    }else{
      let curLeft = parseInt(oUl.style.left === ''? 0 : oUl.style.left);
      if(oUl.style.left === "" || parseInt(oUl.style.left) >= 0){
        return;
      }
      let newLeft = curLeft + 220;
      // oUl.style.left = oUl.offsetLeft + 220 + "px";
      $("#mapList > ul").first().animate({left: newLeft.toString()},"fast");
    }
  }

  function computeSmallHeatmapPosition(d){
    var deep = _.cloneDeep(d);
    deep.data.forEach(v => {
      v.x = Math.round((v.x + (950-872)*2) * 180/950);//这里的数凑着算的,不精确
      v.y = Math.round(v.y * 120/634)+10;
      v.radius = 10;
    });
    return deep;
  }

  function getRoomInfo(room){
    if(curRoom === room){
      return;
    }
    curRoom = room;
    let param = {"l1_name": '110',"l2_name":room, 'start_date': startDate, 'end_date': endDate}
    $.post("/get_lids_by_l3", param, function(data){
      $("#room-hover-pop .panel-heading").text(room);
      $("#roomHoverTable tr:gt(0)").remove();
      var newTrs = "";
      data.list.forEach((v) => {
        var newRow = 
        `<tr>
        <td>${v.lid}</td>
        <td>${v.total}</td>
        <td>${v.alert}</td>
        <td>${v.action}</td>
        </tr>`;
        newTrs = newTrs + newRow;
      });
      $("#roomHoverTable tr:last").after(newTrs);
    },"json");
  }

  function getPointDetails(room, point, type){
    let param = {"l1_name": '110',"l2_name":room,"l3_name":point, "type": type, 'start_date': startDate, 'end_date': endDate}
    $.post("/get_dates_by_lid", param, function(data){
      if(type === 2){
        $("#point-hover-pop .panel-heading").text(point);
        $("#pointHoverTable tr:gt(0)").remove();
        let newTrs = "";
        data.list.forEach((v) => {
          let newRow = 
          `<tr>
          <td>${v["Sample Type"]}</td>
          <td>${v.total}</td>
          <td>${v.alert}</td>
          <td>${v.action}</td>
          </tr>`;
          newTrs = newTrs + newRow;
        });
        $("#pointHoverTable tr:last").after(newTrs);
      }else if(type === 1){
        $("#click-pop-details .panel-heading").text(point);
        $("#clickPopTable tr:gt(0)").remove();
        let newTrs = "";
        _.reverse(_.sortBy(data.list, [function(o) { return o.DATE; }])).forEach((v) => {
          let newRow = 
          `<tr>
          <td>${v["DATE"]}</td>
          <td>${v["Test Type"]}</td>
          <td>${v["ALERT"]}</td>
          <td>${v["ACTION"]}</td>
          <td>${v["TOTAL"]}</td>
          </tr>`;
          newTrs = newTrs + newRow;
        });
        $("#clickPopTable tr:last").after(newTrs);
        $("#clickPopTable").show();
        $("#chart").hide();
      }else{
        let d = _.sortBy(data.list, [function(o) { return o.date; }]);
        let dates=[], alerts=[], belowAlertSums=[], actions=[], zeros=[];
        d.forEach(v => {
          dates.push(v.date);
          alerts.push(v.alert);
          belowAlertSums.push(v.belowAlertSum);
          actions.push(v.action);
          zeros.push(v.zero);
        });
        myChart.setOption({
          xAxis: {
            data: dates
          },
          series: [{
            name: 'ZERO',
            data: zeros
          },{
            name: 'BELOW ALERT',
            data: belowAlertSums
          },{
            name: 'ALERT',
            data: alerts
          },{
            name: 'ACTION',
            data: actions
          }]
        });
        $("#clickPopTable").hide();
        $("#chart").show();
      }
    },"json");
  }

  function getCheckedSampleTypeValues() {
    var id_array= [];  
    $('#sample-types input:checked').each(function(){
      id_array.push($(this).attr("name"));
    });  
    var idstr=id_array.join(',');
    return idstr;
  }

  function bindSmallImagesClickEvent(type){
    $(".sm-img-div").on('click', function(e){
      $(".sm-img-div").css('border','0');
      $(this).css('border','1px solid #35A1E9');
      if(type === 'month'){
        let curr = MONTHS.indexOf(e.currentTarget.innerText) + 1;
        let rt = formatDate(curr, 'month');
        startDate = rt.start;
        endDate = rt.end;
      }else if(type === 'quarter'){
        let curr = QUARTERS.indexOf(e.currentTarget.innerText) + 1;
        let rt = formatDate(curr, 'quarter');
        startDate = rt.start;
        endDate = rt.end;
      }else if(type === 'year'){
        let rt = formatDate(e.currentTarget.innerText, 'year');
        startDate = rt.start;
        endDate = rt.end;
      }
    });
  }

  function generateGroupCharts(type) {
    if(endDate === undefined){
      endDate = dayjs().format('YYYY-MM-DD');
    }
    let param = {"floor_id": curMap.substr(0, curMap.length - 4), "type": type, 'start_date': startDate && startDate.substr(0, 10), 'end_date': endDate && endDate.substr(0, 10)};
    $.post("/get_floor_rooms_report", param, function(data){
      if(!data.success){
        return;
      }
      let xAxisData = [],  belowAlertData = [], alertData = [], actionData = [], zeroData = [];
      let rt = data.list;
      if(type !== '4'){
        rt.forEach((v, i, a) => {
          let keys = Object.keys(v);
          let vSum = v[keys[0]];
          xAxisData.push(keys[0]);
          actionData.push(vSum.actionSum);
          alertData.push(vSum.alertSum);
          belowAlertData.push(vSum.belowAlertSum);
          zeroData.push(vSum.Zero);
        });
      }else{
        xAxisData = [],  belowAlertData = [rt.belowAlertSum], alertData = [rt.alertSum], actionData = [rt.actionSum], zeroData = [rt.Zero];
      }
      myGroupChart.setOption({
        xAxis: {
          data: xAxisData
        },
        series: [{
          name: 'ZERO',
          data: zeroData
        },{
          name: 'BELOW ALERT',
          data: belowAlertData
        },{
          name: 'ALERT',
          data: alertData
        },{
          name: 'ACTION',
          data: actionData
        }]
      });
    },"json");
  }

  function getValue(initVal, clear){
    var v = initVal;
    if(v.data == null){
      return;
    }
    if(clear || false){
      heatmapInstance.removeData();
    }
    heatmapInstance.setData(v);
  }

  function getStyle(obj,attr) {
    return obj.currentStyle ? obj.currentStyle[attr]:getComputedStyle(obj)[attr];
  }

  function computePoints(points, zoom) {
  	if(points === null){
  		return;
  	}
    return Array.prototype.slice.call(points)
      .filter((v) => {
        return pointTypes.includes(v.text);
      })
      .map(function(v){
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
    return Array.prototype.slice.call(points).filter((v) => {
        return pointTypes.includes(v.text);
      }).map(function(v){
      let obj = {};
      obj.x = Math.round(v.x * bs) + drawLeft - scrollLeft;
      obj.y = Math.round(v.y * bs) + drawTop - scrollTop;
      obj.radius = v.radius;
      obj.text = v.text;
      obj.roomOf = v.roomOf;
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
  	var house1 = house.path.map(function(v) {
  		return [v.x - scrollLeft/bs, v.y - scrollTop/bs]
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

//----------------------------------------------------Event listeners----------------------------------------------------

  drawCanvas.addEventListener("mousemove", function(e){
    zoom = 1;
    drawCtx.clearRect(0,0,1650,1100);
    roomHoverPop.style.visibility = 'hidden';
    innerPath = false;
    houses.forEach(function(house, index){
      draw(drawCtx, zoom, "#35A1E9", house, scrollTop, scrollLeft, 2);
      if(drawCtx.isPointInPath(e.pageX-drawLeft, e.pageY-drawTop)){
        draw(drawCtx, zoom, "#35A1E9", house, scrollTop, scrollLeft);
        getRoomInfo(house.name);
        roomHoverPop.style.left = e.pageX+ 5 + 'px';
        roomHoverPop.style.top = e.pageY - parseInt(window.getComputedStyle(roomHoverPop, null).height) + 'px';
        roomHoverPop.style.visibility = 'visible';
        innerPath = true;
      }
    });
    /*if(areaPaths !== null) {
      areaPaths.forEach(function(area, index){
        draw(drawCtx, zoom, "#E8A595", area, scrollTop, scrollLeft, 2);
        if(drawCtx.isPointInPath(e.pageX-drawLeft, e.pageY-drawTop)){
          draw(drawCtx, zoom, "#E8A595", area, scrollTop, scrollLeft);
        }
      });
    }*/
    var objs = computeHover(initData.data, zoom);
    var isHover = false;
    for(var i=0;i<objs.length;i++){  
      var cc = objs[i]; 
      if((e.clientX-cc.x)*(e.clientX-cc.x)+(e.clientY-cc.y)*(e.clientY-cc.y)<=cc.radius*cc.radius){
        isHover = true;
        pointHoverPop.style.visibility = 'visible';
        pointHoverPop.style.left = e.pageX+ 5 + 'px';
        pointHoverPop.style.top = e.pageY- 150 + 'px';
        roomHoverPop.style.visibility = 'hidden';
        if(cc.roomOf === curPointsRoom && cc.text === curPointText){
          return;
        }else{
          curPointsRoom = cc.roomOf;
          curPointText = cc.text;
          getPointDetails(cc.roomOf, cc.text, 2);
        }
      }else{
        pointHoverPop.style.visibility = 'hidden';
      }
    }
    if(isHover){
      pointHoverPop.style.visibility = 'visible';
      roomHoverPop.style.visibility = 'hidden';
    }else{
      pointHoverPop.style.visibility = 'hidden';
    }
  });

  drawCanvas.addEventListener('click',function(e){
    var np = new Point(e.pageX-drawLeft , e.pageY-drawTop);
    if(innerPath){
      toggle = true;
      var objs = computeHover(initData.data, zoom);
      var isHover = false;
      roomHoverPop.style.visibility = 'hidden';
      pointHoverPop.style.visibility = 'hidden';
      for(var i=0;i<objs.length;i++){  
        var cc = objs[i]; 
        if((e.clientX-cc.x)*(e.clientX-cc.x)+(e.clientY-cc.y)*(e.clientY-cc.y)<=cc.radius*cc.radius){
          getPointDetails(curPointsRoom, curPointText, 1);
          clickPop.style.visibility = 'visible';
          closeIcon.style.visibility = 'visible';
        }
      }
    }
  });

  closeIcon.addEventListener("click", function(e){
    clickPop.style.visibility = 'hidden';
    closeIcon.style.visibility = 'hidden';
  });

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

  document.getElementById("map-btn").addEventListener("click", function(e){
    this.classList.add("btn-primary");
    document.getElementById("report-btn").classList.remove("btn-primary");
    document.getElementById("map").style.display='block';
    heatmap.style.display='block';
    document.getElementById("report").style.display='none';
    document.getElementById("mapList").style.display='flex';
    document.getElementById("mapPrev").style.display='block';
    document.getElementById("mapNext").style.display='block';
    document.getElementById("reportList").style.display='none';
  });

  document.getElementById("report-btn").addEventListener("click", function(e){
    this.classList.add("btn-primary");
    document.getElementById("map-btn").classList.remove("btn-primary");
    document.getElementById("map").style.display='none';
    heatmap.style.display='none';
    document.getElementById("report").style.display='block';
    document.getElementById("mapList").style.display='none';
    document.getElementById("mapPrev").style.display='none';
    document.getElementById("mapNext").style.display='none';
    // document.getElementById("reportList").style.display='flex';
    var curTimeType = $("#timeTypeSelect").val();
    generateGroupCharts(timeTypes[curTimeType]);
  });

  document.getElementById("mapPrev").addEventListener("click", function(){
    movePic('left');
  });
  document.getElementById("mapNext").addEventListener("click", function(){
    movePic('right');
  });

  document.getElementById("map").addEventListener("scroll", function(e){
    scrollTop = e.target.scrollTop, scrollLeft = e.target.scrollLeft;
    var bs = slider.getValue();
    if(bs ===1){
      scrollLeft = 0;
    }
    drawCtx.clearRect(0,0,1650,1100);
    ctx.clearRect(0,0,c.width,c.height);
    houses.forEach(function(house){
      draw(drawCtx, 1, "rgba(255,255,255,0.1)", house, scrollTop/zoom, scrollLeft/zoom);
      if(drawCtx.isPointInPath(e.pageX-drawLeft, e.pageY-drawTop)){
        draw(drawCtx, 1, "#35A1E9", house, scrollTop/zoom, scrollLeft/zoom);
      }
    });
    /*if(areaPaths !== null) {
      areaPaths.forEach(function(area, index){
        draw(drawCtx, 1, "rgba(255,255,255,0.1)", area, scrollTop, scrollLeft);
        if(drawCtx.isPointInPath(e.pageX-drawLeft, e.pageY-drawTop)){
          draw(drawCtx, 1, "#E8A595", area, scrollTop, scrollLeft);
        }
      });
    }*/
    var bs = slider.getValue();
    let pArr = computePoints(initData.data, bs);
    getValue({
      min:initData.min,
      max:initData.max,
      data:pArr
    },true);
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
    var thisCW = mapDiv.offsetWidth;
    if (e.newValue > 1) {
      drawCanvas.height = cH - 17;
      drawCanvas.width = thisCW - 17;
    }else{
      drawCanvas.height = cH;
      drawCanvas.width = cW;
    }
    contextZoom(zoom);
    let pArr = computePoints(initData.data, zoom);
    getValue({
      min:initData.min,
      max:initData.max, 
      data:pArr}, true);
    var scrollWidth = mapDiv.clientWidth;
    $("#drawCanvas").parent().css("width", scrollWidth + "px");
    drawLeft = parseInt(getStyle(mapDiv, 'marginLeft')) + (e.newValue === 1 ? parseInt(getStyle(drawCanvas, 'marginLeft')) : 0);
  });

  $( "#p1s-button").click(function(){
    $("#p1s-button").toggleClass( "switch-button-1 switch-button-2");
    if (toggle) {
      getPointDetails(curPointsRoom, curPointText, 3);
      toggle = false;
    } else {
      getPointDetails(curPointsRoom, curPointText, 1);
      toggle = true;
    }
  });

  $('input[type="checkbox"]').change(function(e) {
    var checked = $(this).prop("checked"),
    container = $(this).parent(),
    siblings = container.siblings();
    container.find('input[type="checkbox"]').prop({
      indeterminate: false,
      checked: checked
    });
    function checkSiblings(el) {
      var parent = el.parent().parent(), all = true;
      el.siblings().each(function() {
        let returnValue = all = ($(this).children('input[type="checkbox"]').prop("checked") === checked);
        return returnValue;
      });
      if (all && checked) {
        parent.children('input[type="checkbox"]').prop({
          indeterminate: false,
          checked: checked
        });
        checkSiblings(parent);
      } else if (all && !checked) {
        parent.children('input[type="checkbox"]').prop("checked", checked);
        parent.children('input[type="checkbox"]').prop("indeterminate", (parent.find('input[type="checkbox"]:checked').length > 0));
        checkSiblings(parent);
      } else {
        el.parents("li").children('input[type="checkbox"]').prop({
          indeterminate: true,
          checked: false
        });
      }
    }
    checkSiblings(container);
  });

  $("#mapSelect").change(function (data) {
    slider.setValue(1, true, true);
    curMap = $("#mapSelect").val();
    $("#mapList .sm-img-div").css({"background-image":`url('./img/${curMap}')`});
    $("#heatmap").css({"background-image":`url('./img/${curMap}')`});
    var text = $("#mapSelect").find("option:selected").text();
    $("#building-name").text(text);
    getSelectedMapData(text);
    var curTimeType = $("#timeTypeSelect").val();
    generateGroupCharts(timeTypes[curTimeType]);
  });

  $("#timeTypeSelect").change(function (data) {
    $('.datepicker').datepicker('update', '');
    startDate = undefined;
    endDate = undefined;
    oUl.style.left = '0';
    var curTimeType = $("#timeTypeSelect").val();
    if(curTimeType === "Specified"){
      $(".datepicker").prop('disabled', false);
    }else{
      $(".datepicker").prop('disabled', true);
    }
    if(curTimeType === "Month"){
      let monthLis = MONTHS.reduce((s, v) => {
        return s + `<li><div class="sm-img-div"><div>${v}</div></div></li>`;
      },"");
      $("#mapList > ul").first().html(monthLis + '<li><div class="sm-img-div"><div></div></div></li>');
      bindSmallImagesClickEvent('month');
      generateGroupCharts('1');
    }else if(curTimeType === "Quarter"){
      let quarterLis = QUARTERS.reduce((s, v) => {
        return s + `<li><div class="sm-img-div"><div>${v}</div></div></li>`;
      },"");
      $("#mapList > ul").first().html(quarterLis);
      bindSmallImagesClickEvent('quarter');
      generateGroupCharts('2');
    }else if(curTimeType === "Year"){
      let yearLis = YEARS.reduce((s, v) => {
        return s + `<li><div class="sm-img-div"><div>${v}</div></div></li>`;
      },"");
      $("#mapList > ul").first().html(yearLis);
      bindSmallImagesClickEvent('year');
      generateGroupCharts('3');
    }
    var text = $("#mapSelect").find("option:selected").text();
    curMap = $("#mapSelect").val();
    $("#mapList .sm-img-div").css({"background-image":`url('./img/${curMap}')`});
    smMaps = [...document.querySelectorAll('.sm-img-div')];
    smMapheatmapInstances = smMaps.slice(0, smMaps.length - (curTimeType === "Month" ? 1 : 0)).map(v => {
      return h337.create({
        container: v
      });
    });
    getSelectedMapData(text);
  });

  $('#sample-types input').change(function (data) {
    if(getCheckedSampleTypeValues() === ""){
      getValue({
        min:initData.min,
        max:initData.max,
        data:[]
      },true);
    }else{
      var checked = getCheckedSampleTypeValues().split(',').filter(v => {
        let a = ['surface', 'non-viable'];
        return !a.includes(v);
      });
      pointTypes = [];
      checked.forEach((v) => {
        pointTypes = [...pointTypes, ...SAMPLE_TYPES[v]];
      });
      pointTypes = [...new Set(pointTypes)];
      var bs = slider.getValue();
      let pArr = computePoints(initData.data, bs);
      getValue({
        min:initData.min,
        max:initData.max,
        data:pArr
      },true);
    }
  });

  $("#changeMax").submit(function(e){
    e.preventDefault();
    var max = $("input[name = 'alertMax']").val();
    var min = $("input[name = 'alertMin']").val();
    initData.max = max;
    initData.min = min;
    var bs = slider.getValue();
    let pArr = computePoints(initData.data, bs);
    getValue({
      min:initData.min,
      max:initData.max,
      data:pArr
    },true);
    smMapheatmapInstances.forEach(v => {
      v.setData(computeSmallHeatmapPosition(initData));
    });
  });
});
