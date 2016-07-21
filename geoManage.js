var geocodeManage = (function() {
  //google gecode manager
  //use :
  //      var map = new google.maps.Map( document.getElementById('mapCanvas') , {zoom:12} ) 
  //      var gm = new geocodeManage(map);
  //      var addressGroup = {1:"address-1", 2:"address-2"}, 3:"address-3", ...};
  //        or
  //      var addressGroup = {1:{address:"address-1", para:"xxx",...}, 2:{address:"address-2", para:"xxx",...}, 3:{address:"address-3", para:"xxx",...},  ...}:
  //      var option = {interval:500, retry:3, callback_one:my_callback_one, callback_end:my_callback_end};
  //      var geotask = gm.geocode_start(addressGroup, option);
  //
  // function callback_one(results, status, map key, address) {....}
  // function callback_end(work)

  var geocodeManage = function(map) {
    initialize(this, map);
  };
  
  var initialize = function(me, map) {
    me.map = map;
    me.geocoder = new google.maps.Geocoder();
    me.tasks = {};
  };
  
  var genUniqId = function() {
    return Math.random().toString(36).substr(2, 9);
  }
  
  
  var initalTask = function(addressGroup, option) {
    var task = {};
    task.option = resetOption(option);
    task.work = resetWork(addressGroup);
    task.addressGroup = addressGroup;
    return task;
  }
  
  var resetWork = function(addressGroup) {
    var des = {};
    retryWork(addressGroup, des);
    des.retry = 0;
    return des;
  }
  var retryWork = function(addressGroup, work) {
    work.retry++;
    work.isRequest = false;
    work.count=0;
    work.count_all = Object.keys(addressGroup).length;;
    work.count_ok=0;
    work.count_ng=0;
    work.count_ng_limit=0;
    work.count_ng_others=0;
  }  
  var resetOption = function(option) {
    var des = {};
    des.interval = 500; //main interval 500ms
    des.retry = 3;
    des.callback_one = def_callback_one;
    des.callback_end = def_callback_end;
    if (option) {
      var keys = Object.keys(option);
      for (var key in keys) {
        des[key] = option[key];
      }
    }
    return des;
  }
  var def_callback_one = function(results, status, map, key, address) {
    if (status === google.maps.GeocoderStatus.OK) {
      map.setCenter(results[0].geometry.location);
      var marker = new google.maps.Marker({
        map: map,
        position: results[0].geometry.location,
        icon:"https://chart.googleapis.com/chart?chst=d_map_pin_letter&chld="+key+"|FF6666|000000",
/*            label: {
          color: "black" ,	// ラベルの色
          fontWeight: "bold" ,	// 文字の太さ
          text: key ,		// 文字
        } ,
          */
      });
    }
  }
  
  var def_callback_end = function(work) {
    if (work.count_ng > 0) {
      if (work.count_ng_limit >0) {
        window.alert("マーカー数が多い為、"+work.count_ng_limit+"件の下記住所などで表示できないものがありました。("+work.address_ng_limit+",...)");
      }
      if (work.count_ng_others >0) {
        window.alert("緯度経度変換エラー等のため、"+work.count_ng_others+"件の下記住所などで表示できないものがありました。("+work.address_ng_others+",...)");
      }
    }
  }
  
  var p = geocodeManage.prototype;
  
  var timerTask = function(me, task) {
    if (task.work.count >= task.work.count_all) {
      if (task.work.retry<task.option.retry && task.work.count_ng_limit>0) {
        retryWork(task.addressGroup, task.work);
      }else{
        clearTimeout(task.timerid);
        task.timerid = null;
        task.option.callback_end(task.work);
      }
      return;
    }
    if (!task.work.isRequest) {
      var keys = Object.keys(task.addressGroup);
      task.work.count++;
      var key = keys[task.work.count_ng_limit];
      var address = task.addressGroup[key];
      if (Object.prototype.toString.call(address) !== '[object String]') {
        if (Object.prototype.toString.call(address) !== '[object Object]') {
          address = task.addressGroup[key].address;
        }
      }
    
      task.work.isRequest = true;
      me.geocoder.geocode({'address': address}, function(results, status) {
        if (status === google.maps.GeocoderStatus.OK) {
          task.work.count_ok++;
          delete task.addressGroup[key];
        } else {
          task.work.count_ng++;
          if (status === google.maps.GeocoderStatus.OVER_QUERY_LIMIT) {
            task.work.count_ng_limit++;
            task.work.address_ng_limit = key+":"+address;
          }else{
            task.work.count_ng_others++;
            task.work.address_ng_others = key+":"+address;
            delete task.addressGroup[key];
          }
          console.info('Geocode was not successful for the following reason: ' + status+"="+address);
        }
        task.option.callback_one(results, status, me.map,  key, address);
        task.work.isRequest = false;
      });
    }
  }
  
  
  p.geocode_start = function(addressGroup, option) {
    var task = initalTask(addressGroup, option);
    var me = this;
    task.timerid = setInterval(function(){timerTask(me, task)}, task.option.interval);
    task.id = genUniqId();
    this.tasks[task.id] = task;
    return task.id;
  }
  
  p.geocode_stop = function(id) {
    var task = this.tasks[id];
    if (task) {
      clearTimeout(task.timerid);
      task.timerid = null;
    }
  }
  
  return geocodeManage;
})();
