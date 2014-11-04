// run initialize once the html has loaded
document.addEventListener("DOMContentLoaded", initialize, false);

// Enable the visual refresh
google.maps.visualRefresh = true;

var map; // the google map
var train_stations = []; // array of all train station co-ordinates
var trainSelected; // the train that is selected - being tracked and in the table
var all_train = []; // array of all trains
var all_train_iw = []; // array of all train infowindows
var updateTime = 200; // time in ms to update the trains movement along track
var minorAlarmProb = 1 - (document.getElementById("minorSlider").value / 100) * updateTime/1000; // alarm probability set from the slider
var majorAlarmProb = (document.getElementById("majorSlider").value / 100) * updateTime/1000; // alarm probability set from the slider

function setAlarmProbability(level){
	// alarm probability is set at %chance per second
	var alarmProbability = document.getElementById("alarmProbability");
	if (level == 1){
		minorAlarmProb = 1 - (document.getElementById("minorSlider").value / 100) * updateTime/1000; // set probability based on on slider value
		alarmProbability.rows[0].cells[1].innerHTML = Math.round(((1-minorAlarmProb) * 1000/updateTime)*100)+"%"; // update probability table with new probability
	}
	if (level == 2){
		majorAlarmProb = (document.getElementById("majorSlider").value / 100) * updateTime/1000; // set probability based on on slider value
		alarmProbability.rows[1].cells[1].innerHTML = Math.round((majorAlarmProb * 1000/updateTime)*100)+"%"; // update probability table with new probability
	}
}

function trainDetails(trainId){
	// table showing train details
	var trainTable = document.getElementById("trainTable");
	if (trainSelected){ // trainSelected exists and is not null
		var id = trainSelected.id; // id of the selected train
		var speed = document.getElementById('speed' + id).innerHTML;
		var speedSlider = document.getElementById("speedSlider").value;
		if (id != trainId){ // if the selected train has changed
			document.getElementById("speedSlider").value = speed; // update the slider to show speed of train
		}
		var position = trainSelected.getPosition(); // get the position of the selected train
		var lat = position.lat(); // latitude
		var lng = position.lng(); // longitude
		var alarm = trainSelected.getAlarmDescription(); // get alarm description of selected train
		document.getElementById("trainTitle").innerHTML = "Train "+trainSelected.id; // set heading to train name
		// populate the table with values of the selected train
		trainTable.rows[0].cells[1].innerHTML = speed+" km/h";
		trainTable.rows[1].cells[1].innerHTML = lat;
		trainTable.rows[2].cells[1].innerHTML = lng;
		trainTable.rows[3].cells[1].innerHTML = alarm;
		if (speed != speedSlider){
			// speed has been changed by the slider
			document.getElementById('speed' + trainSelected.id).innerHTML = speedSlider; // set the speed to the slider value
		}
	} else { // no train is selected
		document.getElementById("trainTitle").innerHTML = "Train";
		trainTable.rows[0].cells[1].innerHTML = "";
		trainTable.rows[1].cells[1].innerHTML = "";
		trainTable.rows[2].cells[1].innerHTML = "";
		trainTable.rows[3].cells[1].innerHTML = "";
	}
	// update the table inline with the update time;
	window.setTimeout(function () {
            trainDetails(id); // call this method
        }, updateTime);
}

function logAlarms(){
	// populate the alarm table
	var alarmTableMinor = document.getElementById("alarmTableMinor"); // the minor alarm table
	var alarmTableMajor = document.getElementById("alarmTableMajor"); // the major alarm table
	alarmTableMinor.innerHTML = ""; // clear the table
	alarmTableMajor.innerHTML = ""; // clear the table
	for (i = all_train.length-1; i >= 0 ; i--){ // iterate through all of the trains in reverse order
		var alarmLevel = all_train[i].getAlarmLevel(); // alarm level of train
		if (alarmLevel == 1){ // minor alarm
			var row = alarmTableMinor.insertRow(0); // first row of the table
			// insert the alarm data
			row.insertCell(0).innerHTML = "Train "+all_train[i].id;
			row.insertCell(1).innerHTML = "Minor Alarm";
			row.insertCell(2).innerHTML = '<button type="buttonTest" onclick="all_train['+i+'].outAlarm()">Reset Alarm</button>'; // button to reset train alarm
		} else if (alarmLevel == 2){ // major alarm
			var row = alarmTableMajor.insertRow(0); // first row of the table
			// insert the alarm data
			row.insertCell(0).innerHTML = "Train "+all_train[i].id;
			row.insertCell(1).innerHTML = "Major Alarm";
			row.insertCell(2).innerHTML = '<button type="buttonTest" onclick="all_train['+i+'].outAlarm()">Reset Alarm</button>'; // button to reset train alarm
		}
	}
}

function resetAlarms() {
	// reset alarms for each train
    for (var i = 0; i < all_train.length; i++) { // iterate through all trains
        all_train[i].outAlarm(); // reset alarm
    }
}

function closeIW() {
	// close all infowindows
    for (var i = 0; i < all_train_iw.length; i++) { // iterate through all infowindows
        all_train_iw[i].closeWindow(); // close window
    }
}

function initialize() {
	trainDetails(0); // call method to update the train table
    getTrainStations(); // call method to populate train station array
    five(); // start the five second timer

    var mapOptions = {
        zoom: 12,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    var map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);

    google.maps.event.addListener(map, 'click', function () { // click on the map
        closeIW(); // close all infowindows
		trainSelected = null; // unselect train
    });

	// draw a polyline of the track using the array of station co-ordinates
    var train_track = new google.maps.Polyline({
        path: train_stations,
        strokeColor: "#0000FF",
        strokeOpacity: 0.8,
        strokeWeight: 2
    });
    train_track.setMap(map); // put the polyline on the map

	// set initial view of the map to show the entire track
    var bounds = new google.maps.LatLngBounds();
    for (var i = 0; i < train_stations.length; i++) {
        bounds.extend(train_stations[i]);
    }
    map.fitBounds(bounds);

    var routeLength = google.maps.geometry.spherical.computeLength(train_stations); // get length of track in km

	// create station array for each train
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
	// create 10 trains
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
    var k = 15000; // used to space the trains on track
	// start each train moving along the track
    moveAlongTrack(train1, train_stations1, routeLength / 5 * 1, 1, map);
    moveAlongTrack(train2, train_stations2, routeLength / 5 * 2, 2, map);
    moveAlongTrack(train3, train_stations3, routeLength / 5 * 3, 3, map);
    moveAlongTrack(train4, train_stations4, routeLength / 5 * 4, 4, map);
    moveAlongTrack(train5, train_stations5, routeLength / 5 * 5,  5, map);
    moveAlongTrack(train6, train_stations6, routeLength / 5 * 1 - k, 6, map);
    moveAlongTrack(train7, train_stations7, routeLength / 5 * 2 - k, 7, map);
    moveAlongTrack(train8, train_stations8, routeLength / 5 * 3 - k, 8, map);
    moveAlongTrack(train9, train_stations9, routeLength / 5 * 4 - k, 9, map);
    moveAlongTrack(train10, train_stations10, routeLength / 5 * 5 - k, 10, map);
}

var five_seconds = 0; // counter
function five() {
    if (five_seconds == 5000/updateTime) { // 5 seconds have passed
        five_seconds = 1;
    } else {
        five_seconds++; // increment counter
    }
    window.setTimeout(function () {
        five(); // call this method
    }, updateTime);
}

function Train(map, trainId) {
	// image for each alarm state
    var iconAlarmG = 'http://i.imgur.com/dYqjQFv.png'
    var iconAlarmR = 'http://i.imgur.com/PCUxwpH.png'
    var iconStandard = 'http://i.imgur.com/g7eaBWv.png'
    var alarmLevel = 0; // alarm level, initially 0
    var pos = new google.maps.LatLng(0, 0); // initial position of train
	// create train marker
    var marker = new google.maps.Marker({
        position: pos,
        icon: iconStandard,
        map: map,
        title: 'Train'
    });
	
	var train = this;
    all_train.push(this); // push the train to the train array
	this.id = trainId;
    this.inAlarmG = function () {
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
		switch (alarmLevel){
			case 1:
				return "Minor Alarm";
				break;
			case 2:
				return "Major Alarm";
				break;
			default:
				return "No Alarms";
			break;
		}
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
		trainSelected = train; // change the train that is to be updated in the table
		if (isInfoWindowOpen(infoWindow.getWindow())) {
			// infowindow is open
            closeIW(); // close all info infowindows
        } else {
            // infowindow is closed
			closeIW(); // close all info infowindows
			infoWindow.openWindow(); // open this infowindow
			infoWindow.updateLatLng(marker.getPosition()); // set position of this infowindow
        }
    });
}

function isInfoWindowOpen(infoWindow) {
	// check to see if the info window is open (on the map)
    var map = infoWindow.getMap();
    return (map !== null && typeof map !== "undefined");
}

function TrainIW(map, train, trainId) {
    this.id = trainId;
    var infoWindow = new google.maps.InfoWindow({
        //content: contentString
    });
    all_train_iw.push(this); // push infowindow to infowindow array

    var zero = new google.maps.LatLng(0, 0);
    infoWindow.setContent(iwString(train, trainId, zero));
    //console.log(train);
    this.openWindow = function () {
        infoWindow.close(map, train.getMarker());
        infoWindow.open(map, train.getMarker());
    };
    this.closeWindow = function () {
        infoWindow.close(map, train.getMarker());
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
    var lat = location.lat(); // latitude
    var lng = location.lng(); // longitude
    lat = Math.round(lat * 1000) / 1000; // round to 3 decimal places
    lng = Math.round(lng * 1000) / 1000; // round to 3 decimal places
    var alarmString = ""; // alarm description

	// set alarm sting based on alarm level
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
			break;
    }

	// html content of the infowindow
    var contentString = '<div class="scrollFix">' +
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
	
	resetAlarm = function () { // button on infowindow function
        train.outAlarm(); // reset the train alarm
    }

    return contentString;
}

function moveAlongTrack(marker, train_stationsN, d, tId, map) {
    // the train will be between 2 stations, the startStation and the endStation
    var distanceToEndStation = 0;
    var startStation = 0;
    speed = document.getElementById("speed"+tId).innerHTML;
    var incrementDistance = speed * updateTime * (1000 / 3600000); //distance = speed*time * (1000 metres/3600000 milliseconds)
    while (distanceToEndStation < d) {
        distanceToEndStation += google.maps.geometry.spherical.computeDistanceBetween(train_stationsN[startStation], train_stationsN[startStation + 1]);
        startStation++;
    }

    var endStation = startStation;
    startStation--;

    var distanceToEndStaion = distanceToEndStation - d;
    var distanceBetweenStartEndStation = google.maps.geometry.spherical.computeDistanceBetween(train_stationsN[startStation], train_stationsN[endStation]);
    var percentFromStartStation = 1 - distanceToEndStaion / distanceBetweenStartEndStation;
    var trainLocation = google.maps.geometry.spherical.interpolate(train_stationsN[startStation], train_stationsN[endStation], percentFromStartStation);

    marker.setPosition(trainLocation);

	if (trainSelected){
		if (trainSelected.id == tId) {
			map.panTo(trainLocation);
		}
	}
    var random = Math.random(); // random number between 0 and 1
    if (random <= majorAlarmProb) {
        marker.inAlarmR();
    } else if (random >= minorAlarmProb) {
        marker.inAlarmG();
    }

    window.setTimeout(function () {
        if (endStation == train_stationsN.length - 1 && distanceToEndStaion < incrementDistance) {
            moveAlongTrack(marker, train_stationsN.reverse(), incrementDistance, tId, map);
        } else {
            moveAlongTrack(marker, train_stationsN, d + incrementDistance, tId, map);
        }
    }, updateTime);
}

function getTrainStations() {
	// list of the co-ordinates for each train station
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

	// set the train station array to contain the co-ordinates
    train_stations = [victoria, brixton, herne_hill, west_dulwich, sydenham_hill, penge_east, kent_house, beckenham_junction, shortlands, bromley_south, bickley, st_mary_cray, swanley, farningham_road, longfield, meopham, sole_street, rochester, chatham, gillingham_kent, rainham_kent, newington, sittingbourne, teynham, faversham, whitstable, chesterfield_swaleciffe, herne_bay, birchington_on_sea, westgate_on_sea, margate, broadstairs, dumpton_park, ramsgate, sandwich, deal, walmer, martin_mill, dover_priory, folkestone_central, folkestone_west, sandling, westenhanger, ashford_international, pluckley, headcorn, staplehurst, marden, paddock_wood, tonbridge, hidenborough, sevenoaks, dunton_green, knockholt, cheisfield, orpington, petts_wood, chislehurst, elmstead_woods, grove_park, hither_green, lewisham, st_johns, new_cross, london_bridge, cannon_street];

}