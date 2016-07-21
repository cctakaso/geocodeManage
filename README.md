# geocodeManage
javascript management wrapper module  for google geocode API. 

## How to use
```
<!DOCTYPE html>
<html>
<head>
<script src="https://maps.googleapis.com/maps/api/js?key=Your google API KEY"></script>
<script type="text/javascript" src="js/geoManage.js"></script>
</head>
<body>
<div id="mapCanvas" style="width:100%; height:600px;"></div>

<script>
  $(window).load(function(){
    // Your google API KEY is enable to the Google Maps JavaScript API & the Google Maps Geocoding API.
    var map = new google.maps.Map( document.getElementById('mapCanvas') , {zoom:12} ) 
    var gm = new geocodeManage(map);
    var addressGroup = {1:"address-1", 2:"address-2"}, 3:"address-3", ...};
    or
    var addressGroup = {1:{address:"address-1", para:"xxx",...}, 2:{address:"address-2", para:"xxx",...}, 3:{address:"address-3", para:"xxx",...},  ...}:
    var option = {interval:500, retry:3, callback_one:my_callback_one, callback_end:my_callback_end};
    var geotask = gm.geocode_start(addressGroup, option);
  });
 function my_callback_one(results, status, map key, address) {....}
 function my_callback_end(work) {....}

</script>
</body>
</html>

```
