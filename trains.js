// run initialize once the html has loaded
document.addEventListener("DOMContentLoaded", initialize, false);

// Enable the visual refresh
google.maps.visualRefresh = true;

var map;
var train_stations = [];
var all_train = []; // all trains
var all_train_iw = []; // all train IW
var updateTime = 200; // used to move along track and update infowindows

function testButton(){
	
	document.getElementById("speed"+trainInTable.id).innerHTML = "100000";
}

var trainInTable;

function trainDetails(){
	if (trainInTable){
		var speed = document.getElementById('speed' + trainInTable.id).innerHTML;
		var position = trainInTable.getPosition();
		var lat = position.lat();
		var lng = position.lng();
		var alarm = trainInTable.getAlarmDescription();
		var trainTable = document.getElementById("trainTable");
		trainTable.rows[0].cells[1].innerHTML = "Train "+trainInTable.id;
		trainTable.rows[1].cells[1].innerHTML = speed;
		trainTable.rows[2].cells[1].innerHTML = lat;
		trainTable.rows[3].cells[1].innerHTML = lng;
		trainTable.rows[4].cells[1].innerHTML = alarm;
	}
	window.setTimeout(function () {
            trainDetails();
        }, 100);
}

function logAlarms(){
	var majorPos = 1;
	var minorPos = 1;
	var alarmTableMinor = document.getElementById("alarmTableMinor");
	var alarmTableMajor = document.getElementById("alarmTableMajor");
	alarmTableMinor.innerHTML = "";
	alarmTableMajor.innerHTML = "";
	for (i = all_train.length-1; i >= 0 ; i--){
		var alarmLevel = all_train[i].getAlarmLevel();
		if (alarmLevel == 1){
			var row = alarmTableMinor.insertRow(0);
			var cell1 = row.insertCell(0);
			var cell2 = row.insertCell(1);
			var cell3 = row.insertCell(2);
			cell1.innerHTML = "Train "+all_train[i].id;
			cell2.innerHTML = "Minor Alarm";
			cell3.innerHTML = '<button type="buttonTest" onclick="all_train['+i+'].outAlarm()">Reset Alarm</button>';
		} else if (alarmLevel == 2){
			var row = alarmTableMajor.insertRow(0);
			var cell1 = row.insertCell(0);
			var cell2 = row.insertCell(1);
			var cell3 = row.insertCell(2);
			cell1.innerHTML = "Train "+all_train[i].id;
			cell2.innerHTML = "Major Alarm";
			cell3.innerHTML = '<button type="buttonTest" onclick="all_train['+i+'].outAlarm()">Reset Alarm</button>';
		}
	}
}

function addToAlarmLog(trainId, alarmLevel){
	
	
}
function removeFromAlarmLog(){
	var table = document.getElementById("alarmTable");
    //table.deleteRow(0);
	
    var row = table.insertRow(0);
    var cell1 = row.insertCell(0);
    var cell2 = row.insertCell(1);
    cell1.innerHTML = "NEW CELL1";
    cell2.innerHTML = "NEW CELL2";
}


function resetAlarms() {
    var trainCount = all_train.length;
    for (var i = 0; i < trainCount; i++) {
        all_train[i].outAlarm();
    }
}

function closeIW() {
    var iwCount = all_train_iw.length;
    for (var i = 0; i < iwCount; i++) {
        all_train_iw[i].closeWindow();
    }
}

function panToTrain() {
    var radios = document.getElementsByName('panToTrain');
    for (var i = 0; i < radios.length; i++) {
        if (radios[i].checked) {
            return i;
        }
    }
}

function initialize() {
	trainDetails()
    getTrainStations();
    five();
    // use this for the moment - will be passed in eventually.
    var lat = 51.463248;
    var lng = -0.077875;
    var energyPd = 6000; // kWh/day

    var latLng = new google.maps.LatLng(lat, lng);

    var mapOptions = {
        //center: latLng,
        zoom: 12,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    var map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);

    google.maps.event.addListener(map, 'click', function () {

        closeIW();
    });

    var train_track = new google.maps.Polyline({
        path: train_stations,
        strokeColor: "#0000FF",
        strokeOpacity: 0.8,
        strokeWeight: 2
    });
    train_track.setMap(map);

    var bounds = new google.maps.LatLngBounds();
    for (var i = 0; i < train_stations.length; i++) {
        bounds.extend(train_stations[i]);
    }
    map.fitBounds(bounds);

    var routeLength = google.maps.geometry.spherical.computeLength(train_stations);

    var train_stations1 = train_stations.slice(0);
    var train_stations2 = train_stations.slice(0);
    var train_stations3 = train_stations.slice(0);
    var train_stations4 = train_stations.slice(0);
    var train_stations5 = train_stations.slice(0);
    var train_stations6 = train_stations.slice(0).reverse();
    var train_stations7 = train_stations.slice(0).reverse();
    var train_stations8 = train_stations.slice(0).reverse();
    var train_stations9 = train_stations.slice(0).reverse();
    var train_stations10 = train_stations.slice(0).reverse();
    var speed1 = document.getElementById("speed1").innerHTML; // km/h
    var speed2 = document.getElementById("speed2").innerHTML; // km/h
    var speed3 = document.getElementById("speed3").innerHTML; // km/h
    var speed4 = document.getElementById("speed4").innerHTML; // km/h
    var speed5 = document.getElementById("speed5").innerHTML; // km/h
    var speed6 = document.getElementById("speed6").innerHTML; // km/h
    var speed7 = document.getElementById("speed7").innerHTML; // km/h
    var speed8 = document.getElementById("speed8").innerHTML; // km/h
    var speed9 = document.getElementById("speed9").innerHTML; // km/h
    var speed10 = document.getElementById("speed10").innerHTML; // km/h
    var train1 = new Train(map, 1);
    var train2 = new Train(map, 2);
    var train3 = new Train(map, 3);
    var train4 = new Train(map, 4);
    var train5 = new Train(map, 5);
    var train6 = new Train(map, 6);
    var train7 = new Train(map, 7);
    var train8 = new Train(map, 8);
    var train9 = new Train(map, 9);
    var train10 = new Train(map, 10);
    var k = 15000;
    moveAlongTrack(train1, train_stations1, routeLength / 5 * 1, speed1, 1, map);
    moveAlongTrack(train2, train_stations2, routeLength / 5 * 2, speed2, 2, map);
    moveAlongTrack(train3, train_stations3, routeLength / 5 * 3, speed3, 3, map);
    moveAlongTrack(train4, train_stations4, routeLength / 5 * 4, speed4, 4, map);
    moveAlongTrack(train5, train_stations5, routeLength / 5 * 5, speed5, 5, map);
    moveAlongTrack(train6, train_stations6, routeLength / 5 * 1 - k, speed6, 6, map);
    moveAlongTrack(train7, train_stations7, routeLength / 5 * 2 - k, speed7, 7, map);
    moveAlongTrack(train8, train_stations8, routeLength / 5 * 3 - k, speed8, 8, map);
    moveAlongTrack(train9, train_stations9, routeLength / 5 * 4 - k, speed9, 9, map);
    moveAlongTrack(train10, train_stations10, routeLength / 5 * 5 - k, speed10, 10, map);
}

var five_seconds = 0;

function five() {
    if (five_seconds == 5000/updateTime) {
        five_seconds = 1;
    } else {
        five_seconds++;
    }
    window.setTimeout(function () {
        five();
    }, updateTime);
}

function Train(map, trainId) {
    var iconAlarmG = 'http://i.imgur.com/dYqjQFv.png'
    var iconAlarmR = 'http://i.imgur.com/PCUxwpH.png'
    var iconStandard = 'http://i.imgur.com/g7eaBWv.png'
    var alarmLevel = 0;
    var iwBool = false;
    var pos = new google.maps.LatLng(0, 0);
    var marker = new google.maps.Marker({
        position: pos,
        icon: iconStandard,
        map: map,
        title: 'Train'
    });
	var train = this;
    all_train.push(this);
	
	this.id = trainId;
    this.inAlarmY = function () {
        marker.setIcon(iconAlarmG);
        alarmLevel = 1;
		logAlarms();
    };
    this.inAlarmR = function () {
        marker.setIcon(iconAlarmR);
        alarmLevel = 2;
		logAlarms();
    };
    this.outAlarm = function () {
        marker.setIcon(iconStandard);
		alarmLevel = 0;
        logAlarms();
    };
    this.getAlarmLevel = function () {
        return alarmLevel;
    };
	this.getAlarmDescription = function () {
        var alarmDescription = "No Alarms";
		switch (alarmLevel){
			case 1:
				alarmDescription = "Minor Alarm";
				break;
			case 2:
				alarmDescription = "Major Alarm";
				break;
			default:
		}
		return alarmDescription;
    };
    this.getMarker = function () {
        return marker;
    };
    this.setPosition = function (trainLocation) {
        marker.setPosition(trainLocation);
        if (five_seconds == 1) {
            infoWindow.updateLatLng(trainLocation);
        }
    }
	this.getPosition = function () {
        return marker.getPosition();
    }       
    var infoWindow = new TrainIW(map, this, trainId);
    
    google.maps.event.addListener(marker, 'click', function () {
		trainInTable = train; // change the train that is to be updated in the table
        if (isInfoWindowOpen(infoWindow.getWindow())) {
            // do something if it is open
            infoWindow.closeWindow();
        } else {
            // do something if it is closed
            infoWindow.openWindow();
            infoWindow.updateLatLng(marker.getPosition());
        }
    
    });
}

function isInfoWindowOpen(infoWindow) {
    var map = infoWindow.getMap();
    return (map !== null && typeof map !== "undefined");
}

function TrainIW(map, train, trainId) {
    this.id = trainId;
    var infoWindow = new google.maps.InfoWindow({
        //content: contentString
    });
    all_train_iw.push(this);

    var zero = new google.maps.LatLng(0, 0);
    infoWindow.setContent(iwString(train, trainId, zero));
    //console.log(train);
    this.openWindow = function () {
        infoWindow.close(map, train.getMarker());
        infoWindow.open(map, train.getMarker());
        //iwMap == infoWindow.getMap(); //tried to update the map
    };
    this.closeWindow = function () {
        infoWindow.close(map, train.getMarker());
        //iwMap == infoWindow.getMap(); //tried to update the map
    };
    this.updateLatLng = function (trainLocation) {
        if (isInfoWindowOpen(infoWindow)) {
            // do something if it is open
            infoWindow.setContent(iwString(train, trainId, trainLocation));
        }
    };
    this.getWindow = function () {
        return infoWindow;
    }
}

function iwString(train, trainId, location) {
    var contentString;
    var lat = location.lat();
    var lng = location.lng();
    lat = Math.round(lat * 1000) / 1000;
    lng = Math.round(lng * 1000) / 1000;
    var alarmString = "";

    //console.log(train);
    switch (train.getAlarmLevel()) {
        case 0:
            alarmString = "No alarms";
            break;
        case 1:
            alarmString = "Minor alarm";
            break;
        case 2:
            alarmString = "Major alarm";
            break;
        default:
            alarmString = "";
    }

    contentString = '<div class="scrollFix">' +
        '<h1 id="firstHeading" class="firstHeading">Train #' + trainId + '</h1>' +
        '<div id="bodyContent">' +
        '<p>Speed: ' + document.getElementById('speed' + trainId).innerHTML + ' km/h<br />' +
        'Latitude: ' + lat + '<br />' +
        'Longitude: ' + lng + '<br />' +
        'Alarms: ' + alarmString + '<br />' +
		'<button type="button" onclick="resetAlarm()">Reset Alarm</button><br />' +
        'Southeastern Trains</p>' +
        '</div>' +
        '</div>';
		
	resetAlarm = function () {
        train.outAlarm();
    }
		
    return contentString;
}

// function to go to each station
function moveToStation(marker, train_stations, c) {
    if (train_stations.length > c) {
        marker.setPosition(train_stations[c]);
        window.setTimeout(function () {
            moveToStation(marker, train_stations, c + 1);
        }, 1000);
    }
}

function moveAlongTrack(marker, train_stationsN, d, speed, tId, map) {
    // the train will be between 2 stations, the startStation and the endStation
    var distanceToEndStation = 0;
    var startStation = 0;
    
    var incrementDistance = speed * updateTime * (1000 / 3600000); //distance=speed*time 1000 metres/3600000 miliseconds
    //console.log(incrementDistance)
    while (distanceToEndStation < d) {
        distanceToEndStation += google.maps.geometry.spherical.computeDistanceBetween(train_stationsN[startStation], train_stationsN[startStation + 1]);
        startStation++; // 
    }

    var endStation = startStation;
    startStation--;

    var distanceToEndStaion = distanceToEndStation - d;
    var distanceBetweenStartEndStation = google.maps.geometry.spherical.computeDistanceBetween(train_stationsN[startStation], train_stationsN[endStation]);
    var percentFromStartStation = 1 - distanceToEndStaion / distanceBetweenStartEndStation;
    var trainLocation = google.maps.geometry.spherical.interpolate(train_stationsN[startStation], train_stationsN[endStation], percentFromStartStation);

    marker.setPosition(trainLocation);

    if (panToTrain() == tId) {
        map.panTo(trainLocation);
    }

    // random alarm 5%
    var random = Math.random(); // random number between 0 and 1
    if (random < 0.005) {
        if (random < 0.001) {
            marker.inAlarmR();
        } else {
            marker.inAlarmY();
        }
    } else if (random > 0.995) {
        //marker.outAlarm()
    }

    window.setTimeout(function () {
        if (endStation == train_stationsN.length - 1 && distanceToEndStaion < incrementDistance) {
            moveAlongTrack(marker, train_stationsN.reverse(), incrementDistance, speed, tId, map);
        } else {
            moveAlongTrack(marker, train_stationsN, d + incrementDistance, speed, tId, map);
        }
    }, updateTime);
}

// return segment length
function calcSegmentLength(latlng1, latLng2) {
    var y1 = latlng1.lat();
    var y2 = latLng2.lat();

    var x1 = latlng1.lng();
    var x2 = latLng2.lng();
    return Math.sqrt(Math.pow((y2 - y1), 2) + Math.pow((x2 - x1), 2));
}

function getTrainStations() {
    var victoria = new google.maps.LatLng(51.496103, -0.144046);
    var brixton = new google.maps.LatLng(51.463230, -0.114226);
    var herne_hill = new google.maps.LatLng(51.453341, -0.102251);
    var west_dulwich = new google.maps.LatLng(51.440720, -0.091333);
    var sydenham_hill = new google.maps.LatLng(51.432729, -0.080271);
    var penge_east = new google.maps.LatLng(51.419720, -0.054194);
    var kent_house = new google.maps.LatLng(51.412210, -0.045202);
    var beckenham_junction = new google.maps.LatLng(51.411168, -0.026007);
    var shortlands = new google.maps.LatLng(51.405929, 0.001831);
    var bromley_south = new google.maps.LatLng(51.400024, 0.017370);
    var bickley = new google.maps.LatLng(51.400132, 0.045330);
    var st_mary_cray = new google.maps.LatLng(51.394765, 0.106442);
    var swanley = new google.maps.LatLng(51.393395, 0.169316);
    var farningham_road = new google.maps.LatLng(51.401687, 0.235512);
    var longfield = new google.maps.LatLng(51.396163, 0.300414);
    var meopham = new google.maps.LatLng(51.386418, 0.357035);
    var sole_street = new google.maps.LatLng(51.383166, 0.378094);
    var rochester = new google.maps.LatLng(51.385631, 0.510310);
    var chatham = new google.maps.LatLng(51.380703, 0.520312);
    var gillingham_kent = new google.maps.LatLng(51.386613, 0.549868);
    var rainham_kent = new google.maps.LatLng(51.366315, 0.611386);
    var newington = new google.maps.LatLng(51.353384, 0.668579);
    var sittingbourne = new google.maps.LatLng(51.341995, 0.734718);
    var teynham = new google.maps.LatLng(51.333403, 0.807510);
    var faversham = new google.maps.LatLng(51.311859, 0.891055);
    var whitstable = new google.maps.LatLng(51.357742, 1.033261);
    var chesterfield_swaleciffe = new google.maps.LatLng(51.360427, 1.066945);
    var herne_bay = new google.maps.LatLng(51.364774, 1.117718);
    var birchington_on_sea = new google.maps.LatLng(51.377688, 1.301431);
    var westgate_on_sea = new google.maps.LatLng(51.381627, 1.338394);
    var margate = new google.maps.LatLng(51.385484, 1.372046);
    var broadstairs = new google.maps.LatLng(51.360724, 1.433495);
    var dumpton_park = new google.maps.LatLng(51.345889, 1.425850);
    var ramsgate = new google.maps.LatLng(51.341605, 1.406284);
    var sandwich = new google.maps.LatLng(51.269907, 1.342466);
    var deal = new google.maps.LatLng(51.223048, 1.398887);
    var walmer = new google.maps.LatLng(51.203341, 1.382909);
    var martin_mill = new google.maps.LatLng(51.170822, 1.348216);
    var dover_priory = new google.maps.LatLng(51.125877, 1.305357);
    var folkestone_central = new google.maps.LatLng(51.082922, 1.169507);
    var folkestone_west = new google.maps.LatLng(51.084659, 1.153936);
    var sandling = new google.maps.LatLng(51.090368, 1.066044);
    var westenhanger = new google.maps.LatLng(51.095059, 1.038093);
    var ashford_international = new google.maps.LatLng(51.143371, 0.875155);
    var pluckley = new google.maps.LatLng(51.156594, 0.747383);
    var headcorn = new google.maps.LatLng(51.165745, 0.627470);
    var staplehurst = new google.maps.LatLng(51.171528, 0.550426);
    var marden = new google.maps.LatLng(51.174999, 0.493106);
    var paddock_wood = new google.maps.LatLng(51.182401, 0.389092);
    var tonbridge = new google.maps.LatLng(51.191578, 0.270980);
    var hidenborough = new google.maps.LatLng(51.214687, 0.227510);
    var sevenoaks = new google.maps.LatLng(51.277040, 0.181685);
    var dunton_green = new google.maps.LatLng(51.296564, 0.170954);
    var knockholt = new google.maps.LatLng(51.345952, 0.130842);
    var cheisfield = new google.maps.LatLng(51.356319, 0.109118);
    var orpington = new google.maps.LatLng(51.373426, 0.089106);
    var petts_wood = new google.maps.LatLng(51.388755, 0.074453);
    var chislehurst = new google.maps.LatLng(51.405726, 0.057432);
    var elmstead_woods = new google.maps.LatLng(51.417113, 0.044332);
    var grove_park = new google.maps.LatLng(51.430938, 0.021709);
    var hither_green = new google.maps.LatLng(51.452029, -0.000910);
    var lewisham = new google.maps.LatLng(51.465780, -0.014073);
    var st_johns = new google.maps.LatLng(51.469403, -0.022702);
    var new_cross = new google.maps.LatLng(51.476357, -0.032343);
    var london_bridge = new google.maps.LatLng(51.505140, -0.086023);
    var cannon_street = new google.maps.LatLng(51.511399, -0.090278);

    train_stations = [victoria, brixton, herne_hill, west_dulwich, sydenham_hill, penge_east, kent_house, beckenham_junction, shortlands, bromley_south, bickley, st_mary_cray, swanley, farningham_road, longfield, meopham, sole_street, rochester, chatham, gillingham_kent, rainham_kent, newington, sittingbourne, teynham, faversham, whitstable, chesterfield_swaleciffe, herne_bay, birchington_on_sea, westgate_on_sea, margate, broadstairs, dumpton_park, ramsgate, sandwich, deal, walmer, martin_mill, dover_priory, folkestone_central, folkestone_west, sandling, westenhanger, ashford_international, pluckley, headcorn, staplehurst, marden, paddock_wood, tonbridge, hidenborough, sevenoaks, dunton_green, knockholt, cheisfield, orpington, petts_wood, chislehurst, elmstead_woods, grove_park, hither_green, lewisham, st_johns, new_cross, london_bridge, cannon_street];

}

//google.maps.event.addDomListener(window, 'load', initialize);