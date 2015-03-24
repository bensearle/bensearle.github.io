// run initialize once the html has loaded
document.addEventListener("DOMContentLoaded", initialize, false);

// Enable the visual refresh
google.maps.visualRefresh = true;

var map; // the google map

var route_south = [];
var route_north = [];
var route_southE = [];

var train_stations = []; // array of all train station co-ordinates
var trainSelected; // the train that is selected - being tracked and in the table
var all_train = []; // array of all trains
var all_train_iw = []; // array of all train infowindows
var updateTime = 200; // time in ms to update the trains movement along track

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
		document.getElementById("trainTitle").innerHTML = "Train "+trainSelected.id; // set heading to train name
		// populate the table with values of the selected train
		trainTable.rows[0].cells[1].innerHTML = speed+" km/h";
		trainTable.rows[1].cells[1].innerHTML = lat;
		trainTable.rows[2].cells[1].innerHTML = lng;
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
    var train_track_s = new google.maps.Polyline({
        path: route_south,
        strokeColor: "#0000FF",
        strokeOpacity: 0.8,
        strokeWeight: 2
    });
	var train_track_n = new google.maps.Polyline({
        path: route_north,
        strokeColor: "#0000FF",
        strokeOpacity: 0.8,
        strokeWeight: 2
    });
	var train_track_se = new google.maps.Polyline({
        path: route_southE,
        strokeColor: "#0000FF",
        strokeOpacity: 0.8,
        strokeWeight: 2
    });
    train_track_s.setMap(map); // put the polyline on the map
    train_track_n.setMap(map); // put the polyline on the map
	train_track_se.setMap(map); // put the polyline on the map

	//addStations(map);
	var station_drammen = Station(map, 
		'drammen', 
		new google.maps.LatLng(59.740334, 10.203579), 
		'http://rtd.jbv.no/auto/realtime-display/index.html#/?id=f442e70f85ad3120416b04914b0a3ec53f8e5466', 5);
	
	var station_alnabru = Station(map, 
		'alnabru', 
		new google.maps.LatLng(59.932979, 10.835244), 
		'http://rtd.jbv.no/auto/realtime-display/index.html#/?id=1d36f07687a7aa7517d4ed4aaf729b17b58724ba', 6);
	// set initial view of the map to show the entire track
    var bounds = new google.maps.LatLngBounds();
    for (var i = 0; i < route_south.length; i++) {
        bounds.extend(route_south[i]);
    }
	for (var i = 0; i < route_north.length; i++) {
        bounds.extend(route_north[i]);
    }
	for (var i = 0; i < route_southE.length; i++) {
        bounds.extend(route_southE[i]);
    }
    map.fitBounds(bounds);

    var route_south_len = google.maps.geometry.spherical.computeLength(route_south); // get length of track in km
    var route_south_len = google.maps.geometry.spherical.computeLength(route_north); // get length of track in km
    var route_south_len = google.maps.geometry.spherical.computeLength(route_southE); // get length of track in km

	
	// create station array for each train
    var route_R1 = route_south.slice(0);
    var route_R3 = route_south.slice(0).reverse();
	var route_F4 = route_north.slice(0);
    var route_F7 = route_north.slice(0).reverse();
	var route_L2 = route_southE.slice(0);
    var route_L5 = route_southE.slice(0).reverse();
	
	// create 10 trains
    var train_R1 = new Train(map, 1, 'R1_red.png');
    var train_R3 = new Train(map, 2, 'R3_red.png');
    var train_F4 = new Train(map, 1, 'F4_green.png');
    var train_F7 = new Train(map, 2, 'F7_green.png');
    var train_L2 = new Train(map, 1, 'L2_blue.png');
    var train_L5 = new Train(map, 2, 'L5_blue.png');
	
    var k = 15000; // used to space the trains on track
	// start each train moving along the track
    moveAlongTrack(train_R1, route_R1, route_south_len / 5 * 1, 1, map);
    moveAlongTrack(train_R3, route_R3, route_south_len / 5 * 2, 2, map);
	moveAlongTrack(train_F4, route_F4, route_south_len / 5 * 1, 3, map);
    moveAlongTrack(train_F7, route_F7, route_south_len / 5 * 2, 4, map);
	moveAlongTrack(train_L2, route_L2, route_south_len / 5 * 1, 5, map);
    moveAlongTrack(train_L5, route_L5, route_south_len / 5 * 2, 6, map);
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


function Station(map, name, pos, url, trainId) {
    var icon = 'images/station.png';

	// create train marker
    var marker = new google.maps.Marker({
        position: pos,
        icon: icon,
        map: map,
        title: 'Train'
    });
	
	var train = this;
    all_train.push(this); // push the train to the train array
	this.id = trainId;
    
    this.getMarker = function () {
        return marker;
    };
	this.getPosition = function () {
        return marker.getPosition();
    }       
    var infoWindow = new StationIW(map, this, trainId, url);
    
    google.maps.event.addListener(marker, 'click', function () {
		trainSelected = null; // change the train that is to be updated in the table
		if (isInfoWindowOpen(infoWindow.getWindow())) {
			// infowindow is open
            closeIW(); // close all info infowindows
        } else {
            // infowindow is closed
			closeIW(); // close all info infowindows
			infoWindow.openWindow(marker); // open this infowindow
			
			console.log(marker.getPosition());
        }
    });
}


function StationIW(map, train, trainId, url) {
    this.id = trainId;
    var infoWindow = new google.maps.InfoWindow({
        //content: contentString
		maxWidth: 600,
		minWidth: 600,
		maxHeight: 400,
		minHeight: 400
    });
    all_train_iw.push(this); // push infowindow to infowindow array

    var zero = new google.maps.LatLng(0, 0);
    infoWindow.setContent(
		'<iframe name="iframe" id="train_page" width="1000px" height="400px"' +
		'src="' + url + 
		'"></iframe>'
	);
    //console.log(train);
    this.openWindow = function (marker) {
		console.log(train.getMarker().position);
        infoWindow.close(map, marker);
        infoWindow.open(map, marker);
    };
    this.closeWindow = function () {
        infoWindow.close(map, train.getMarker());
    };
    this.getWindow = function () {
        return infoWindow;
    }
}


function Train(map, trainId, image) {
	// image for each alarm state
    var icon = 'images/' + image;

    var pos = new google.maps.LatLng(0, 0); // initial position of train
	// create train marker
    var marker = new google.maps.Marker({
        position: pos,
        icon: icon,
        map: map,
        title: 'Train'
    });
	
	var train = this;
    all_train.push(this); // push the train to the train array
	this.id = trainId;
    
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
			map.panTo(trainSelected.getPosition());
		}
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

route_south = [				
	new google.maps.LatLng(59.910895287975045, 10.753804743289948),
	new google.maps.LatLng(59.913385607357235, 10.739720463752747),
	new google.maps.LatLng(59.91755902826017, 10.721846222877502),
	new google.maps.LatLng(59.91837644100032, 10.717211365699768),
	new google.maps.LatLng(59.918483993809495, 10.713863968849182),
	new google.maps.LatLng(59.91923685371464, 10.691998600959778),
	new google.maps.LatLng(59.91954874781492, 10.689273476600647),
	new google.maps.LatLng(59.92301165086928, 10.6764417886734),
	new google.maps.LatLng(59.92304391224217, 10.67571222782135),
	new google.maps.LatLng(59.92315144992534, 10.674896836280823),
	new google.maps.LatLng(59.92312994241659, 10.673180222511292),
	new google.maps.LatLng(59.922968635656595, 10.671635270118713),
	new google.maps.LatLng(59.92219435229321, 10.669017434120178),
	new google.maps.LatLng(59.921161946371015, 10.666463971138),
	new google.maps.LatLng(59.917214848451955, 10.657263994216919),
	new google.maps.LatLng(59.91684915349499, 10.656276941299438),
	new google.maps.LatLng(59.9166125251993, 10.655161142349243),
	new google.maps.LatLng(59.916461942678204, 10.654088258743286),
	new google.maps.LatLng(59.916268335575836, 10.652457475662231),
	new google.maps.LatLng(59.91616077558655, 10.65099835395813),
	new google.maps.LatLng(59.915816581278484, 10.649925470352173),
	new google.maps.LatLng(59.915214232650854, 10.648080110549927),
	new google.maps.LatLng(59.913708313258475, 10.641315579414368),
	new google.maps.LatLng(59.9132457671591, 10.63777506351471),
	new google.maps.LatLng(59.91349317633958, 10.63526451587677),
	new google.maps.LatLng(59.91460111657223, 10.630221962928772),
	new google.maps.LatLng(59.91480548985675, 10.627604126930237),
	new google.maps.LatLng(59.91428917597505, 10.624642968177795),
	new google.maps.LatLng(59.9117074860988, 10.617368817329407),
	new google.maps.LatLng(59.907619399819886, 10.606023073196411),
	new google.maps.LatLng(59.90650046741583, 10.600873231887817),
	new google.maps.LatLng(59.90579035614007, 10.59855580329895),
	new google.maps.LatLng(59.90411185093731, 10.594693422317505),
	new google.maps.LatLng(59.9035092899129, 10.593277215957642),
	new google.maps.LatLng(59.902088924237994, 10.587097406387329),
	new google.maps.LatLng(59.900474798593926, 10.580617189407349),
	new google.maps.LatLng(59.899656944990916, 10.577484369277954),
	new google.maps.LatLng(59.899248010637166, 10.575252771377563),
	new google.maps.LatLng(59.8990327800076, 10.574179887771606),
	new google.maps.LatLng(59.89905430313333, 10.561691522598267),
	new google.maps.LatLng(59.89888211773708, 10.560446977615356),
	new google.maps.LatLng(59.898580791145775, 10.559545755386353),
	new google.maps.LatLng(59.8980857486684, 10.558172464370728),
	new google.maps.LatLng(59.89759069881285, 10.556799173355103),
	new google.maps.LatLng(59.89735393323029, 10.55559754371643),
	new google.maps.LatLng(59.897181739019324, 10.554645359516144),
	new google.maps.LatLng(59.897074117184175, 10.552574694156647),
	new google.maps.LatLng(59.89750460243265, 10.54911732673645),
	new google.maps.LatLng(59.89791355825114, 10.547572374343872),
	new google.maps.LatLng(59.89840860329482, 10.544739961624146),
	new google.maps.LatLng(59.89825793819301, 10.5428946018219),
	new google.maps.LatLng(59.89802117736653, 10.541263818740845),
	new google.maps.LatLng(59.89761222287303, 10.539976358413696),
	new google.maps.LatLng(59.8971386903271, 10.53890347480774),
	new google.maps.LatLng(59.8952983065614, 10.53288996219635),
	new google.maps.LatLng(59.89233841122309, 10.52415132522583),
	new google.maps.LatLng(59.89177869227474, 10.522091388702393),
	new google.maps.LatLng(59.891305076568706, 10.520203113555908),
	new google.maps.LatLng(59.890960624541954, 10.517971515655518),
	new google.maps.LatLng(59.89065922608917, 10.511877536773682),
	new google.maps.LatLng(59.89048699717433, 10.507071018218994),
	new google.maps.LatLng(59.88958278072433, 10.503981113433838),
	new google.maps.LatLng(59.88816181944314, 10.502607822418213),
	new google.maps.LatLng(59.88686998372884, 10.502264499664307),
	new google.maps.LatLng(59.88394163684259, 10.503380298614502),
	new google.maps.LatLng(59.882649637065974, 10.503466129302979),
	new google.maps.LatLng(59.881228379300694, 10.502865314483643),
	new google.maps.LatLng(59.87980706076034, 10.500376224517822),
	new google.maps.LatLng(59.87773957984334, 10.495741367340088),
	new google.maps.LatLng(59.87649041447551, 10.491793155670166),
	new google.maps.LatLng(59.87575812329897, 10.487844944000244),
	new google.maps.LatLng(59.874121178813404, 10.48046350479126),
	new google.maps.LatLng(59.872699556371686, 10.476515293121338),
	new google.maps.LatLng(59.87140711958612, 10.474369525909424),
	new google.maps.LatLng(59.87002846497559, 10.471537113189697),
	new google.maps.LatLng(59.8693391162353, 10.467932224273682),
	new google.maps.LatLng(59.86886518068688, 10.464584827423096),
	new google.maps.LatLng(59.867400246287716, 10.461580753326416),
	new google.maps.LatLng(59.86503036283654, 10.459520816802979),
	new google.maps.LatLng(59.862444842834556, 10.460121631622314),
	new google.maps.LatLng(59.86037628212449, 10.460894107818604),
	new google.maps.LatLng(59.85658358672391, 10.463125705718994),
	new google.maps.LatLng(59.85369567643747, 10.466902256011963),
	new google.maps.LatLng(59.85166967933177, 10.468189716339111),
	new google.maps.LatLng(59.85046264369983, 10.467760562896729),
	new google.maps.LatLng(59.8481346656308, 10.465357303619385),
	new google.maps.LatLng(59.84645324686202, 10.462696552276611),
	new google.maps.LatLng(59.84421122303615, 10.457117557525635),
	new google.maps.LatLng(59.84132223892375, 10.451538562774658),
	new google.maps.LatLng(59.84097726884141, 10.450068712234497),
	new google.maps.LatLng(59.84074009983628, 10.446892976760864),
	new google.maps.LatLng(59.84035200145615, 10.44376015663147),
	new google.maps.LatLng(59.839812968422855, 10.442472696304321),
	new google.maps.LatLng(59.83897205946436, 10.44101357460022),
	new google.maps.LatLng(59.83795862813969, 10.440069437026978),
	new google.maps.LatLng(59.83640607777742, 10.438653230667114),
	new google.maps.LatLng(59.8350044076346, 10.43676495552063),
	new google.maps.LatLng(59.833516416307816, 10.434790849685669),
	new google.maps.LatLng(59.824198785348315, 10.422956943511963),
	new google.maps.LatLng(59.8123754472056, 10.4075288772583),
	new google.maps.LatLng(59.80607370694953, 10.39980411529541),
	new google.maps.LatLng(59.79104831608204, 10.381608009338379),
	new google.maps.LatLng(59.78871618313459, 10.378518104553223),
	new google.maps.LatLng(59.785174484304406, 10.370278358459473),
	new google.maps.LatLng(59.77627538706282, 10.334293842315674),
	new google.maps.LatLng(59.764002837402, 10.292515754699707),
	new google.maps.LatLng(59.76002625526743, 10.279126167297363),
	new google.maps.LatLng(59.75250403353098, 10.262646675109863),
	new google.maps.LatLng(59.75103397627636, 10.257303714752197),
	new google.maps.LatLng(59.7470558499865, 10.240824222564697),
	new google.maps.LatLng(59.74523959139336, 10.235931873321533),
	new google.maps.LatLng(59.742515018418025, 10.23103952407837),
	new google.maps.LatLng(59.74106614709535, 10.22901177406311),
	new google.maps.LatLng(59.739552333850845, 10.226608514785767),
	new google.maps.LatLng(59.73827635230088, 10.223475694656372),
	new google.maps.LatLng(59.73741125236016, 10.21926999092102),
	new google.maps.LatLng(59.73695706592947, 10.212961435317993),
	new google.maps.LatLng(59.738038452048855, 10.209485292434692),
	new google.maps.LatLng(59.739530707450676, 10.206438302993774),
	new google.maps.LatLng(59.74066607454572, 10.20306408405304),				
	new google.maps.LatLng(59.74141215192541, 10.199523568153381),
	new google.maps.LatLng(59.74157434045656, 10.19731342792511),
	new google.maps.LatLng(59.74165002816842, 10.192721486091614),
	new google.maps.LatLng(59.74158515299731, 10.190361142158508),
	new google.maps.LatLng(59.741076959800495, 10.188902020454407),
	new google.maps.LatLng(59.74040656546672, 10.188043713569641),
	new google.maps.LatLng(59.73934688248424, 10.18782913684845),
	new google.maps.LatLng(59.73836286106366, 10.188665986061096),
	new google.maps.LatLng(59.73749776336162, 10.189846158027649),
	new google.maps.LatLng(59.735951345445535, 10.19282877445221),
	new google.maps.LatLng(59.734945594706716, 10.19531786441803),
	new google.maps.LatLng(59.73286911037458, 10.202441811561584),
	new google.maps.LatLng(59.73159287372869, 10.20628273487091),
	new google.maps.LatLng(59.73007863147644, 10.208600163459778),
	new google.maps.LatLng(59.72915923665485, 10.21081030368805),
	new google.maps.LatLng(59.72843451939266, 10.213256478309631),
	new google.maps.LatLng(59.72749344518222, 10.216754078865051),
	new google.maps.LatLng(59.72627109086818, 10.22003710269928),
	new google.maps.LatLng(59.726054740318574, 10.221667885780334),
	new google.maps.LatLng(59.72586002362736, 10.224221348762512),
	new google.maps.LatLng(59.72536240915516, 10.22604525089264),
	new google.maps.LatLng(59.724886423167156, 10.226882100105286),
	new google.maps.LatLng(59.72430224928756, 10.227590203285217),
	new google.maps.LatLng(59.723718065205205, 10.228126645088196),
	new google.maps.LatLng(59.721402864987056, 10.228942036628723),
	new google.maps.LatLng(59.72024520478691, 10.229542851448059),
	new google.maps.LatLng(59.717085778715536, 10.232675671577454),
	new google.maps.LatLng(59.715841402307866, 10.233426690101624),
	new google.maps.LatLng(59.7148783314069, 10.233598351478577),
	new google.maps.LatLng(59.71413166185717, 10.233362317085266),
	new google.maps.LatLng(59.712887175581876, 10.232482552528381),
	new google.maps.LatLng(59.711523598353416, 10.232632756233215),
	new google.maps.LatLng(59.709781168815624, 10.23402750492096),
	new google.maps.LatLng(59.707107824165185, 10.236881375312805),
	new google.maps.LatLng(59.70514867895153, 10.23849070072174),
	new google.maps.LatLng(59.70289714395232, 10.239670872688293),
	new google.maps.LatLng(59.70134912579401, 10.24025022983551),
	new google.maps.LatLng(59.69985516627422, 10.241344571113586),
	new google.maps.LatLng(59.6995303836442, 10.241623520851135),
	new google.maps.LatLng(59.69838279311909, 10.241687893867493),
	new google.maps.LatLng(59.69727847076171, 10.242138504981995),
	new google.maps.LatLng(59.69650975428769, 10.242417454719543),
	new google.maps.LatLng(59.6903593871621, 10.242653489112854),
	new google.maps.LatLng(59.688864937271894, 10.242873430252075),
	new google.maps.LatLng(59.68704551697257, 10.243817567825317),
	new google.maps.LatLng(59.685355966777465, 10.245319604873657),
	new google.maps.LatLng(59.68383963122951, 10.246435403823853),
	new google.maps.LatLng(59.682691502945644, 10.246821641921997),
	new google.maps.LatLng(59.68160832698723, 10.247079133987427),
	new google.maps.LatLng(59.68063343868407, 10.247079133987427),
	new google.maps.LatLng(59.679311878142116, 10.246821641921997),
	new google.maps.LatLng(59.66264707847397, 10.235964059829712),
	new google.maps.LatLng(59.6576178396578, 10.232659578323364),
	new google.maps.LatLng(59.65328168355688, 10.229355096817017),
	new google.maps.LatLng(59.650766456152965, 10.227724313735962),
	new google.maps.LatLng(59.648251040152836, 10.226608514785767),
	new google.maps.LatLng(59.64567037430534, 10.226222276687622),
	new google.maps.LatLng(59.64230870516716, 10.226565599441528),
	new google.maps.LatLng(59.63907684767539, 10.22703766822815),
	new google.maps.LatLng(59.63714626083405, 10.22703766822815),
	new google.maps.LatLng(59.63506370559048, 10.226737260818481),
	new google.maps.LatLng(59.63291593516664, 10.225964784622192),
	new google.maps.LatLng(59.627252972615786, 10.222703218460083),
	new google.maps.LatLng(59.62443198355938, 10.22154450416565),
	new google.maps.LatLng(59.62093796861548, 10.219913721084595),
	new google.maps.LatLng(59.617704053262955, 10.218626260757446),
	new google.maps.LatLng(59.61262465839571, 10.215450525283813),
	new google.maps.LatLng(59.61060571126661, 10.213733911514282),
	new google.maps.LatLng(59.60737080114731, 10.210601091384888),
	new google.maps.LatLng(59.60326701072086, 10.206524133682251),
	new google.maps.LatLng(59.60152980562457, 10.204979181289673),
	new google.maps.LatLng(59.59840261018514, 10.203133821487427),
	new google.maps.LatLng(59.5948624476391, 10.201975107192993),
	new google.maps.LatLng(59.59177807581172, 10.201932191848755),
	new google.maps.LatLng(59.58888893573083, 10.202833414077759),
	new google.maps.LatLng(59.58358791300814, 10.205708742141724),
	new google.maps.LatLng(59.566875534533985, 10.216137170791626),
	new google.maps.LatLng(59.563288571923536, 10.21926999092102),
	new google.maps.LatLng(59.55546114489205, 10.22803544998169),
	new google.maps.LatLng(59.54906739620565, 10.234043598175049),
	new google.maps.LatLng(59.548153904447986, 10.23550271987915),
	new google.maps.LatLng(59.543847109615356, 10.245974063873291),
	new google.maps.LatLng(59.54288996932285, 10.248291492462158),
	new google.maps.LatLng(59.54132368109996, 10.250093936920166),
	new google.maps.LatLng(59.54006189596815, 10.25223970413208),
	new google.maps.LatLng(59.5391916717953, 10.253956317901611),
	new google.maps.LatLng(59.53806034677181, 10.255587100982666),
	new google.maps.LatLng(59.53710304208551, 10.256359577178955),
	new google.maps.LatLng(59.53536241843758, 10.25799036026001),
	new google.maps.LatLng(59.53327355138786, 10.259106159210205),
	new google.maps.LatLng(59.53192442261189, 10.260136127471924),
	new google.maps.LatLng(59.53148920826142, 10.261595249176025),
	new google.maps.LatLng(59.53074933096913, 10.264084339141846),
	new google.maps.LatLng(59.52979181860111, 10.266315937042236),
	new google.maps.LatLng(59.529487149871116, 10.268890857696533),
	new google.maps.LatLng(59.529878866303925, 10.27172327041626),
	new google.maps.LatLng(59.53035762465142, 10.274126529693604),
	new google.maps.LatLng(59.53022705486736, 10.276186466217041),
	new google.maps.LatLng(59.53000943743667, 10.277817249298096),
	new google.maps.LatLng(59.529269527663786, 10.279362201690674),
	new google.maps.LatLng(59.52844255046329, 10.27996301651001),
	new google.maps.LatLng(59.52626619773196, 10.279877185821533),
	new google.maps.LatLng(59.525221498516316, 10.27996301651001),
	new google.maps.LatLng(59.52478619762245, 10.27996301651001),
	new google.maps.LatLng(59.52448148365277, 10.281078815460205),
	new google.maps.LatLng(59.523915578974325, 10.282280445098877),
	new google.maps.LatLng(59.523436729135476, 10.284254550933838),
	new google.maps.LatLng(59.52295787249617, 10.285284519195557),
	new google.maps.LatLng(59.52208720663806, 10.285627841949463),
	new google.maps.LatLng(59.5215647963321, 10.286228656768799),
	new google.maps.LatLng(59.52051995143976, 10.2876877784729),
	new google.maps.LatLng(59.52008458984637, 10.288277864456177),
	new google.maps.LatLng(59.519105005710884, 10.289007425308228),
	new google.maps.LatLng(59.51755938176498, 10.289779901504517),
	new google.maps.LatLng(59.51642733055597, 10.2902090549469),
	new google.maps.LatLng(59.5157742068047, 10.290552377700806),
	new google.maps.LatLng(59.51457678041244, 10.292354822158813),
	new google.maps.LatLng(59.51388007640431, 10.292869806289673),
	new google.maps.LatLng(59.51239953260595, 10.292483568191528),
	new google.maps.LatLng(59.510940697953096, 10.29171109199524),
	new google.maps.LatLng(59.50983019943643, 10.292226076126099),
	new google.maps.LatLng(59.50878499096892, 10.293642282485962),
	new google.maps.LatLng(59.50628071395433, 10.297375917434692),
	new google.maps.LatLng(59.50525717331877, 10.29866337776184),
	new google.maps.LatLng(59.503863365932126, 10.300036668777466),
	new google.maps.LatLng(59.5019467867692, 10.301238298416138),
	new google.maps.LatLng(59.499692489020454, 10.302391648292542),
	new google.maps.LatLng(59.498156866654206, 10.304043889045715),
	new google.maps.LatLng(59.496065694063034, 10.307069420814514),
	new google.maps.LatLng(59.49443187532926, 10.309301018714905),
	new google.maps.LatLng(59.49241672331465, 10.311704277992249),
	new google.maps.LatLng(59.491360082025125, 10.312841534614563),
	new google.maps.LatLng(59.4900092759277, 10.313978791236877),
	new google.maps.LatLng(59.48818995972757, 10.315373539924622),
	new google.maps.LatLng(59.487089607147894, 10.3169184923172),
	new google.maps.LatLng(59.48605458932244, 10.318506360054016),
	new google.maps.LatLng(59.485172075383424, 10.321210026741028),
	new google.maps.LatLng(59.484126103071596, 10.323312878608704),
	new google.maps.LatLng(59.48272052676131, 10.324600338935852),
	new google.maps.LatLng(59.479734845002824, 10.326982140541077),
	new google.maps.LatLng(59.47874319158133, 10.327754616737366),
	new google.maps.LatLng(59.47816562177718, 10.328248143196106),
	new google.maps.LatLng(59.47675979739755, 10.328784584999084),
	new google.maps.LatLng(59.475920634031276, 10.329235196113586),
	new google.maps.LatLng(59.4747544892885, 10.330007672309875),
	new google.maps.LatLng(59.474264042559085, 10.33039391040802),
	new google.maps.LatLng(59.4736754970855, 10.330758690834045),
	new google.maps.LatLng(59.47286895515498, 10.330973267555237),
	new google.maps.LatLng(59.47188799983125, 10.331273674964905),
	new google.maps.LatLng(59.47104871544719, 10.331788659095764),
	new google.maps.LatLng(59.47025301100067, 10.332689881324768),
	new google.maps.LatLng(59.46966439565419, 10.333612561225891),
	new google.maps.LatLng(59.46904306833134, 10.334685444831848),
	new google.maps.LatLng(59.468759652074134, 10.33513605594635),
	new google.maps.LatLng(59.46784398330523, 10.335752964019775),
	new google.maps.LatLng(59.46675386908629, 10.33738374710083),
	new google.maps.LatLng(59.465750932947145, 10.338499546051025),
	new google.maps.LatLng(59.464224668669615, 10.340473651885986),
	new google.maps.LatLng(59.46309082772971, 10.342018604278564),
	new google.maps.LatLng(59.4622622276037, 10.34339189529419),
	new google.maps.LatLng(59.461259158168026, 10.347511768341064),
	new google.maps.LatLng(59.46027786578644, 10.348445177078247),
	new google.maps.LatLng(59.458489659750974, 10.348659753799438),
	new google.maps.LatLng(59.45742105245602, 10.349303483963013),
	new google.maps.LatLng(59.4545421871885, 10.349518060684204),
	new google.maps.LatLng(59.45316809689086, 10.349045991897583),
	new google.maps.LatLng(59.45229562962317, 10.348788499832153),
	new google.maps.LatLng(59.45148857735797, 10.34887433052063),
	new google.maps.LatLng(59.45055062755176, 10.349818468093872),
	new google.maps.LatLng(59.449001862789075, 10.351148843765259),
	new google.maps.LatLng(59.44841287729191, 10.351277589797974),
	new google.maps.LatLng(59.44653678104061, 10.350204706192017),
	new google.maps.LatLng(59.445031465777895, 10.34938931465149),
	new google.maps.LatLng(59.44464967227082, 10.349491238594055),
	new google.maps.LatLng(59.44377698521463, 10.349963307380676),
	new google.maps.LatLng(59.44292609365658, 10.35163700580597),
	new google.maps.LatLng(59.44180244765113, 10.354555249214172),
	new google.maps.LatLng(59.441126060215446, 10.355585217475891),
	new google.maps.LatLng(59.440318741378746, 10.356271862983704),
	new google.maps.LatLng(59.43892225250083, 10.356400609016418),
	new google.maps.LatLng(59.43832218097992, 10.356336236000061),
	new google.maps.LatLng(59.437678456061334, 10.356336236000061),
	new google.maps.LatLng(59.43601998967905, 10.35710871219635),
	new google.maps.LatLng(59.435070699313634, 10.358267426490784),
	new google.maps.LatLng(59.42595833956028, 10.380127429962158),
	new google.maps.LatLng(59.42399367706537, 10.384504795074463),
	new google.maps.LatLng(59.422596514361494, 10.387508869171143),
	new google.maps.LatLng(59.417793327761395, 10.394375324249268),
	new google.maps.LatLng(59.41320783214656, 10.403645038604736),
	new google.maps.LatLng(59.41104588313439, 10.405951738357544),
	new google.maps.LatLng(59.40877459613796, 10.406337976455688),
	new google.maps.LatLng(59.40604448233751, 10.405962467193604),
	new google.maps.LatLng(59.403423366077156, 10.407850742340088),
	new google.maps.LatLng(59.40206904321942, 10.410082340240479),
	new google.maps.LatLng(59.40005930308177, 10.410254001617432),
	new google.maps.LatLng(59.39761250201729, 10.410339832305908),
	new google.maps.LatLng(59.394815941601664, 10.411627292633057),
	new google.maps.LatLng(59.39184434329707, 10.41102647781372),
	new google.maps.LatLng(59.38747387248674, 10.409996509552002),
	new google.maps.LatLng(59.38533213608734, 10.409824848175049),
	new google.maps.LatLng(59.379474451717925, 10.411112308502197),
	new google.maps.LatLng(59.37737593055183, 10.410339832305908),
	new google.maps.LatLng(59.37252260299064, 10.407249927520752),
	new google.maps.LatLng(59.36753738151939, 10.406734943389893),
	new google.maps.LatLng(59.36281386434629, 10.40827989578247),
	new google.maps.LatLng(59.35793658034078, 10.41002869606018),
	new google.maps.LatLng(59.35332110569311, 10.409760475158691),
	new google.maps.LatLng(59.34780796288377, 10.416626930236816),
	new google.maps.LatLng(59.344832244010696, 10.417828559875488),
	new google.maps.LatLng(59.34168119861541, 10.41576862335205),
	new google.maps.LatLng(59.33958033925637, 10.414566993713379),
	new google.maps.LatLng(59.33432762231983, 10.411477088928223),
	new google.maps.LatLng(59.32986217428469, 10.401177406311035),
	new google.maps.LatLng(59.32548371429322, 10.395169258117676),
	new google.maps.LatLng(59.319790872867365, 10.390362739562988),
	new google.maps.LatLng(59.31558631636064, 10.383667945861816),
	new google.maps.LatLng(59.31348384309691, 10.38109302520752),
	new google.maps.LatLng(59.31032988942372, 10.38109302520752),
	new google.maps.LatLng(59.30787661208955, 10.386242866516113),
	new google.maps.LatLng(59.30428399382073, 10.392422676086426),
	new google.maps.LatLng(59.29885053314575, 10.394139289855957),
	new google.maps.LatLng(59.293153231169, 10.395855903625488),
	new google.maps.LatLng(59.282764156292316, 10.400211811065674),
	new google.maps.LatLng(59.28076926640012, 10.402261018753052),
	new google.maps.LatLng(59.27980466232966, 10.4055655002594),
	new google.maps.LatLng(59.27859886880945, 10.408183336257935),
	new google.maps.LatLng(59.27346828812673, 10.420714616775513),
	new google.maps.LatLng(59.27151671049952, 10.422388315200806),
	new google.maps.LatLng(59.269236073599394, 10.419641733169556),
	new google.maps.LatLng(59.26899484345849, 10.415178537368774),
	new google.maps.LatLng(59.271231639238344, 10.410758256912231),
	new google.maps.LatLng(59.27368755952325, 10.407882928848267),
	new google.maps.LatLng(59.277721901245684, 10.407711267471313),
	new google.maps.LatLng(59.27870848816678, 10.407153367996216),
	new google.maps.LatLng(59.2796731232935, 10.404835939407349),
	new google.maps.LatLng(59.28081311139034, 10.401231050491333),
	new google.maps.LatLng(59.28256686469854, 10.395694971084595),
	new google.maps.LatLng(59.28326834072631, 10.382477045059204),
	new google.maps.LatLng(59.2838601998817, 10.368186235427856),
	new google.maps.LatLng(59.283465628254774, 10.361577272415161),
	new google.maps.LatLng(59.28458356931965, 10.340205430984497),
	new google.maps.LatLng(59.28396980229977, 10.336815118789673),
	new google.maps.LatLng(59.28269839255476, 10.334755182266235),
	new google.maps.LatLng(59.25561486114667, 10.313780307769775),
	new google.maps.LatLng(59.248593752624615, 10.310540199279785),
	new google.maps.LatLng(59.24481930915727, 10.31139850616455),
	new google.maps.LatLng(59.24227351830478, 10.314316749572754),
	new google.maps.LatLng(59.239903128361235, 10.315690040588379),
	new google.maps.LatLng(59.236742352112486, 10.314316749572754),
	new google.maps.LatLng(59.232966596538475, 10.313115119934082),
	new google.maps.LatLng(59.23006864017356, 10.310883522033691),
	new google.maps.LatLng(59.223788890105574, 10.30493974685669),
	new google.maps.LatLng(59.21996777732973, 10.296463966369629),
	new google.maps.LatLng(59.21504801366811, 10.28942584991455),
	new google.maps.LatLng(59.21118198757105, 10.285649299621582),
	new google.maps.LatLng(59.20670036400014, 10.284276008605957),
	new google.maps.LatLng(59.20248182795153, 10.285477638244629),
	new google.maps.LatLng(59.19914178398049, 10.285305976867676),
	new google.maps.LatLng(59.19333987861877, 10.282559394836426),
	new google.maps.LatLng(59.188855913150846, 10.279812812805176),
	new google.maps.LatLng(59.18463517278283, 10.277409553527832),
	new google.maps.LatLng(59.17821513080311, 10.277581214904785),
	new google.maps.LatLng(59.17469678815781, 10.27620792388916),
	new google.maps.LatLng(59.17223373285787, 10.274319648742676),
	new google.maps.LatLng(59.16444755202136, 10.265200138092041),
	new google.maps.LatLng(59.16211575184391, 10.263161659240723),
	new google.maps.LatLng(59.14239908928454, 10.248570442199707),
	new google.maps.LatLng(59.14046201864851, 10.24399995803833),
	new google.maps.LatLng(59.135222573976506, 10.229837894439697),
	new google.maps.LatLng(59.135046444261086, 10.225632190704346),
	new google.maps.LatLng(59.13671963998123, 10.214474201202393),
	new google.maps.LatLng(59.13597111516039, 10.210268497467041),
	new google.maps.LatLng(59.13442998312293, 10.20803689956665),
	new google.maps.LatLng(59.123199641732185, 10.197758674621582),
	new google.maps.LatLng(59.11112842542435, 10.170636177062988),
	new google.maps.LatLng(59.10822012465311, 10.166516304016113),
	new google.maps.LatLng(59.10143312986518, 10.16634464263916),
	new google.maps.LatLng(59.09420394376247, 10.169949531555176),
	new google.maps.LatLng(59.082343015232205, 10.165293216705322),
	new google.maps.LatLng(59.06924272817476, 10.159285068511963),
	new google.maps.LatLng(59.05547542464322, 10.144436359405518),
	new google.maps.LatLng(59.054680988732315, 10.141603946685791),
	new google.maps.LatLng(59.05190031835815, 10.12812852859497),
	new google.maps.LatLng(59.04947256496515, 10.122549533843994),
	new google.maps.LatLng(59.0454553598886, 10.116627216339111),
	new google.maps.LatLng(59.04223242730901, 10.110790729522705),
	new google.maps.LatLng(59.04006891947098, 10.103323459625244),
	new google.maps.LatLng(59.036889640467464, 10.096542835235596),
	new google.maps.LatLng(59.036359732044936, 10.086071491241455),
	new google.maps.LatLng(59.039759835805505, 10.08195161819458),
	new google.maps.LatLng(59.047662673556125, 10.073540210723877),
	new google.maps.LatLng(59.04836898398499, 10.057575702667236),
	new google.maps.LatLng(59.047662673556125, 10.048391819000244),
	new google.maps.LatLng(59.047221222165405, 10.041182041168213),
	new google.maps.LatLng(59.04995812936756, 10.031472444534302)
]

route_north = [			
	new google.maps.LatLng(59.90938379353754, 10.760185718536377),
	new google.maps.LatLng(59.90770546998145, 10.769069194793701),
	new google.maps.LatLng(59.906177691445805, 10.778768062591553),
	new google.maps.LatLng(59.905940987073635, 10.802843570709229),
	new google.maps.LatLng(59.908049748396586, 10.817821025848389),
	new google.maps.LatLng(59.911965664121674, 10.825953483581543),
	new google.maps.LatLng(59.92052743096186, 10.83178997039795),
	new google.maps.LatLng(59.92736665251616, 10.834193229675293),
	new google.maps.LatLng(59.937429358279864, 10.843291282653809),
	new google.maps.LatLng(59.9390201903793, 10.851960182189941),
	new google.maps.LatLng(59.94529678319641, 10.875563621520996),
	new google.maps.LatLng(59.948563580486294, 10.88569164276123),
	new google.maps.LatLng(59.9527755544467, 10.891270637512207),
	new google.maps.LatLng(59.95372102605853, 10.897965431213379),
	new google.maps.LatLng(59.95221685399793, 10.90543270111084),
	new google.maps.LatLng(59.9507555929119, 10.910754203796387),
	new google.maps.LatLng(59.94929426740136, 10.914444923400879),
	new google.maps.LatLng(59.948606562515415, 10.919766426086426),
	new google.maps.LatLng(59.94847761626091, 10.924744606018066),
	new google.maps.LatLng(59.94710215833544, 10.934786796569824),
	new google.maps.LatLng(59.94581261469714, 10.941481590270996),
	new google.maps.LatLng(59.943856711111586, 10.949571132659912),
	new google.maps.LatLng(59.94116984224465, 10.955793857574463),
	new google.maps.LatLng(59.93910617912959, 10.96411943435669),
	new google.maps.LatLng(59.938740725401004, 10.972702503204346),
	new google.maps.LatLng(59.94005204066633, 10.980234146118164),
	new google.maps.LatLng(59.942631525914166, 10.989160537719727),
	new google.maps.LatLng(59.94821972224712, 11.000146865844727),
	new google.maps.LatLng(59.95208792178764, 11.004953384399414),
	new google.maps.LatLng(59.955182156406494, 11.008729934692383),
	new google.maps.LatLng(59.95595566992277, 11.012678146362305),
	new google.maps.LatLng(59.95595566992277, 11.015596389770508),
	new google.maps.LatLng(59.955182156406494, 11.01902961730957),
	new google.maps.LatLng(59.95372102605853, 11.02177619934082),
	new google.maps.LatLng(59.95225983128989, 11.02503776550293),
	new google.maps.LatLng(59.952173876650235, 11.027956008911133),
	new google.maps.LatLng(59.95225983128989, 11.033105850219727),
	new google.maps.LatLng(59.952603647619426, 11.04151725769043),
	new google.maps.LatLng(59.9542367264784, 11.050100326538086),
	new google.maps.LatLng(59.95681510820991, 11.05748176574707),
	new google.maps.LatLng(59.961026033629246, 11.06348991394043),
	new google.maps.LatLng(59.96575194514551, 11.066751480102539),
	new google.maps.LatLng(59.980054459034235, 11.072287559509277),
	new google.maps.LatLng(59.98851279817465, 11.078510284423828),
	new google.maps.LatLng(59.998127776277705, 11.084346771240234),
	new google.maps.LatLng(60.010657392582715, 11.103229522705078),
	new google.maps.LatLng(60.01786406201116, 11.116619110107422),
	new google.maps.LatLng(60.0312437093664, 11.125545501708984),
	new google.maps.LatLng(60.03878881323579, 11.127948760986328),
	new google.maps.LatLng(60.05858651266601, 11.140050888061523),
	new google.maps.LatLng(60.101825866222, 11.141338348388672),
	new google.maps.LatLng(60.1203030138731, 11.156787872314453),
	new google.maps.LatLng(60.133470206254394, 11.158161163330078),
	new google.maps.LatLng(60.15671367933671, 11.146831512451172),
	new google.maps.LatLng(60.16525494433567, 11.129322052001953),
	new google.maps.LatLng(60.16756070532547, 11.111726760864258),
	new google.maps.LatLng(60.18079435106721, 11.092672348022461),
	new google.maps.LatLng(60.184891431234966, 11.091814041137695),
	new google.maps.LatLng(60.216541205433636, 11.109838485717773),
	new google.maps.LatLng(60.23128929086269, 11.110353469848633),
	new google.maps.LatLng(60.24236730156817, 11.11490249633789),
	new google.maps.LatLng(60.29395846842145, 11.176700592041016),
	new google.maps.LatLng(60.31674843284329, 11.24124526977539),
	new google.maps.LatLng(60.32191223178429, 11.246459484100342),
	new google.maps.LatLng(60.32781878639363, 11.248176097869873),
	new google.maps.LatLng(60.33363930902926, 11.247189044952393),
	new google.maps.LatLng(60.339331370931696, 11.246674060821533),
	new google.maps.LatLng(60.34207085274035, 11.246201992034912),
	new google.maps.LatLng(60.34330248278264, 11.245601177215576),
	new google.maps.LatLng(60.3504365281891, 11.245300769805908),
	new google.maps.LatLng(60.353090164751706, 11.245429515838623),
	new google.maps.LatLng(60.353981738173815, 11.245129108428955),
	new google.maps.LatLng(60.35769636505916, 11.245300769805908),
	new google.maps.LatLng(60.363808658370395, 11.245214939117432),
	new google.maps.LatLng(60.369919805754414, 11.24276876449585),
	new google.maps.LatLng(60.37132011565043, 11.24276876449585),
	new google.maps.LatLng(60.374672128233485, 11.243144273757935),
	new google.maps.LatLng(60.3873133254916, 11.235194206237793),
	new google.maps.LatLng(60.39435293892543, 11.230645179748535),
	new google.maps.LatLng(60.39630340587872, 11.23227596282959),
	new google.maps.LatLng(60.39893211122632, 11.237168312072754),
	new google.maps.LatLng(60.400691529272635, 11.238434314727783),
	new google.maps.LatLng(60.40141222727887, 11.234872341156006),
	new google.maps.LatLng(60.403659006867144, 11.23603105545044),
	new google.maps.LatLng(60.40910574367582, 11.23776912689209),
	new google.maps.LatLng(60.411691035035005, 11.239657402038574),
	new google.maps.LatLng(60.41414899039554, 11.238713264465332),
	new google.maps.LatLng(60.418725377941705, 11.239056587219238),
	new google.maps.LatLng(60.42177594527513, 11.23802661895752),
	new google.maps.LatLng(60.42474150030225, 11.238627433776855),
	new google.maps.LatLng(60.42643598174986, 11.240086555480957),
	new google.maps.LatLng(60.43304361566819, 11.239142417907715),
	new google.maps.LatLng(60.435859923146445, 11.237189769744873),
	new google.maps.LatLng(60.44147063539489, 11.241846084594727),
	new google.maps.LatLng(60.44756721673239, 11.24201774597168),
	new google.maps.LatLng(60.4578949238293, 11.23875617980957),
	new google.maps.LatLng(60.463057545953795, 11.243219375610352),
	new google.maps.LatLng(60.473718724080086, 11.239571571350098),
	new google.maps.LatLng(60.484460971566946, 11.236224174499512),
	new google.maps.LatLng(60.490295819711505, 11.233477592468262),
	new google.maps.LatLng(60.49731315938463, 11.233692169189453),
	new google.maps.LatLng(60.50356830218782, 11.238155364990234),
	new google.maps.LatLng(60.508132104118964, 11.243648529052734),
	new google.maps.LatLng(60.517088809464056, 11.243305206298828),
	new google.maps.LatLng(60.53668352593239, 11.243648529052734),
	new google.maps.LatLng(60.545969980983685, 11.24776840209961),
	new google.maps.LatLng(60.55137178320994, 11.247425079345703),
	new google.maps.LatLng(60.5562663874574, 11.251201629638672),
	new google.maps.LatLng(60.55947279555458, 11.251544952392578),
	new google.maps.LatLng(60.5658846580884, 11.254892349243164),
	new google.maps.LatLng(60.58190875240564, 11.272058486938477),
	new google.maps.LatLng(60.599947430918455, 11.292829513549805),
	new google.maps.LatLng(60.60281246173545, 11.292142868041992),
	new google.maps.LatLng(60.60542447411879, 11.284933090209961),
	new google.maps.LatLng(60.60887874652014, 11.282873153686523),
	new google.maps.LatLng(60.610732106135025, 11.278409957885742),
	new google.maps.LatLng(60.61191146138143, 11.27446174621582),
	new google.maps.LatLng(60.618228702010896, 11.268453598022461),
	new google.maps.LatLng(60.61966043793861, 11.265192031860352),
	new google.maps.LatLng(60.61999730774588, 11.259698867797852),
	new google.maps.LatLng(60.62277634942938, 11.253862380981445),
	new google.maps.LatLng(60.63304830371036, 11.239442825317383),
	new google.maps.LatLng(60.63801471445881, 11.231718063354492),
	new google.maps.LatLng(60.64710378947666, 11.225838661193848),
	new google.maps.LatLng(60.66746074489092, 11.22476577758789),
	new google.maps.LatLng(60.67586895367949, 11.215753555297852),
	new google.maps.LatLng(60.688813300289965, 11.212835311889648),
	new google.maps.LatLng(60.69486341628828, 11.209230422973633),
	new google.maps.LatLng(60.699988318529876, 11.208329200744629),
	new google.maps.LatLng(60.706204316690034, 11.204938888549805),
	new google.maps.LatLng(60.717373292449516, 11.194982528686523),
	new google.maps.LatLng(60.72862232040535, 11.185884475708008),
	new google.maps.LatLng(60.737769743982575, 11.177301406860352),
	new google.maps.LatLng(60.738273196216944, 11.171808242797852),
	new google.maps.LatLng(60.738524919373404, 11.161680221557617),
	new google.maps.LatLng(60.74397843643192, 11.145029067993164),
	new google.maps.LatLng(60.75328922361927, 11.121211051940918),
	new google.maps.LatLng(60.75519718201101, 11.112949848175049),
	new google.maps.LatLng(60.76880119962902, 11.094217300415039),
	new google.maps.LatLng(60.7745848267072, 11.093015670776367),
	new google.maps.LatLng(60.77952941946947, 11.100225448608398),
	new google.maps.LatLng(60.782546084419224, 11.100053787231445),
	new google.maps.LatLng(60.78891366681747, 11.091470718383789),
	new google.maps.LatLng(60.79067290723788, 11.081171035766602),
	new google.maps.LatLng(60.79117552961327, 11.075334548950195),
	new google.maps.LatLng(60.793520996424405, 11.070013046264648),
	new google.maps.LatLng(60.793520996424405, 11.063833236694336),
	new google.maps.LatLng(60.79385604909198, 11.060400009155273),
	new google.maps.LatLng(60.80055636645722, 11.037054061889648),
	new google.maps.LatLng(60.8035291832536, 11.031453609466553),
	new google.maps.LatLng(60.80648079162422, 11.027247905731201),
	new google.maps.LatLng(60.80892979198941, 11.022248268127441),
	new google.maps.LatLng(60.8109809472538, 11.018986701965332),
	new google.maps.LatLng(60.812320406274814, 11.01452350616455),
	new google.maps.LatLng(60.813952796166966, 11.009888648986816),
	new google.maps.LatLng(60.81700807142211, 11.006112098693848),
	new google.maps.LatLng(60.81981197145012, 11.00757122039795),
	new google.maps.LatLng(60.820732601457244, 11.006970405578613),
	new google.maps.LatLng(60.83236373486254, 10.976157188415527),
	new google.maps.LatLng(60.83508263446305, 10.976500511169434),
	new google.maps.LatLng(60.83713211365026, 10.974783897399902),
	new google.maps.LatLng(60.83951603639844, 10.966973304748535),
	new google.maps.LatLng(60.845203274436976, 10.964827537536621),
	new google.maps.LatLng(60.84867366518202, 10.962166786193848),
	new google.maps.LatLng(60.85247811837086, 10.956501960754395),
	new google.maps.LatLng(60.859291556165125, 10.957274436950684),
	new google.maps.LatLng(60.86581103162846, 10.95585823059082),
	new google.maps.LatLng(60.8696552267057, 10.950021743774414),
	new google.maps.LatLng(60.875587749896305, 10.94264030456543),
	new google.maps.LatLng(60.87876245028216, 10.940408706665039),
	new google.maps.LatLng(60.88519442773591, 10.926847457885742),
	new google.maps.LatLng(60.88895277546697, 10.914015769958496),
	new google.maps.LatLng(60.88824289925222, 10.907750129699707),
	new google.maps.LatLng(60.88703189749158, 10.903801918029785),
	new google.maps.LatLng(60.88744948949761, 10.898222923278809),
	new google.maps.LatLng(60.89371271377896, 10.881743431091309),
	new google.maps.LatLng(60.901226959954904, 10.868782997131348),
	new google.maps.LatLng(60.91574948322512, 10.838956832885742),
	new google.maps.LatLng(60.91549915093856, 10.80531120300293),
	new google.maps.LatLng(60.915290539197706, 10.766472816467285),
	new google.maps.LatLng(60.91620842064354, 10.760550498962402),
	new google.maps.LatLng(60.91616669933315, 10.757718086242676),
	new google.maps.LatLng(60.9141222882143, 10.75411319732666),
	new google.maps.LatLng(60.91332952208712, 10.748534202575684),
	new google.maps.LatLng(60.91216119922119, 10.739436149597168),
	new google.maps.LatLng(60.91266191426468, 10.731968879699707),
	new google.maps.LatLng(60.912724503092086, 10.728299617767334),
	new google.maps.LatLng(60.91259932531441, 10.724995136260986),
	new google.maps.LatLng(60.9143934931521, 10.721347332000732),
	new google.maps.LatLng(60.916625630743475, 10.720875263214111),
	new google.maps.LatLng(60.917543473737645, 10.719437599182129),
	new google.maps.LatLng(60.91791894734337, 10.716605186462402),
	new google.maps.LatLng(60.918169260622754, 10.712571144104004),
	new google.maps.LatLng(60.919253928779646, 10.709481239318848),
	new google.maps.LatLng(60.92063056981075, 10.7081937789917),
	new google.maps.LatLng(60.92229914586999, 10.7081937789917),
	new google.maps.LatLng(60.923508808873606, 10.70742130279541),
	new google.maps.LatLng(60.9249269759764, 10.703816413879395),
	new google.maps.LatLng(60.92840955965167, 10.700318813323975),
	new google.maps.LatLng(60.93193346333243, 10.694761276245117),
	new google.maps.LatLng(60.939021792582594, 10.691671371459961),
	new google.maps.LatLng(60.9440243691963, 10.685663223266602),
	new google.maps.LatLng(60.94785914560524, 10.68446159362793),
	new google.maps.LatLng(60.9579440690954, 10.66798210144043),
	new google.maps.LatLng(60.96244374734495, 10.665063858032227),
	new google.maps.LatLng(60.963318610873145, 10.663561820983887),
	new google.maps.LatLng(60.965026608412046, 10.659098625183105),
	new google.maps.LatLng(60.96962941338369, 10.654313564300537),
	new google.maps.LatLng(60.97245116574122, 10.653916597366333),
	new google.maps.LatLng(60.97472088073987, 10.652886629104614),
	new google.maps.LatLng(60.97891630341457, 10.650966167449951),
	new google.maps.LatLng(60.98033200348549, 10.649378299713135),
	new google.maps.LatLng(60.98212235739712, 10.641782283782959),
	new google.maps.LatLng(60.98233053153954, 10.638306140899658),
	new google.maps.LatLng(60.9823721662044, 10.634400844573975),
	new google.maps.LatLng(60.983496281539445, 10.629894733428955),
	new google.maps.LatLng(60.98514074901049, 10.625731945037842),
	new google.maps.LatLng(60.985952543351274, 10.620152950286865),
	new google.maps.LatLng(60.986202322053316, 10.617148876190186),
	new google.maps.LatLng(60.987284673741954, 10.6117844581604),
	new google.maps.LatLng(60.98817966748377, 10.606076717376709),
	new google.maps.LatLng(60.990219326470275, 10.601699352264404),
	new google.maps.LatLng(60.993330594853326, 10.599778890609741),
	new google.maps.LatLng(60.99533870996439, 10.595154762268066),
	new google.maps.LatLng(60.99750275407834, 10.589232444763184),
	new google.maps.LatLng(60.99991632166321, 10.583395957946777),
	new google.maps.LatLng(61.0022464887525, 10.576958656311035),
	new google.maps.LatLng(61.00353632916022, 10.571293830871582),
	new google.maps.LatLng(61.00499253762304, 10.565800666809082),
	new google.maps.LatLng(61.00757194297865, 10.559706687927246),
	new google.maps.LatLng(61.00969355482726, 10.550780296325684),
	new google.maps.LatLng(61.00815436034919, 10.542283058166504),
	new google.maps.LatLng(61.009194364794496, 10.531210899353027),
	new google.maps.LatLng(61.011191077830894, 10.518765449523926),
	new google.maps.LatLng(61.01518412716133, 10.517134666442871),
	new google.maps.LatLng(61.01618231100996, 10.515568256378174),
	new google.maps.LatLng(61.018719220334525, 10.507886409759521),
	new google.maps.LatLng(61.019509363787556, 10.502092838287354),
	new google.maps.LatLng(61.02300239383305, 10.499260425567627),
	new google.maps.LatLng(61.024332970806356, 10.491836071014404),
	new google.maps.LatLng(61.02957157525385, 10.49067735671997),
	new google.maps.LatLng(61.033312905978825, 10.493016242980957),
	new google.maps.LatLng(61.03510027487077, 10.4899263381958),
	new google.maps.LatLng(61.035973139348165, 10.486750602722168),
	new google.maps.LatLng(61.039505916819515, 10.48194408416748),
	new google.maps.LatLng(61.04253963509134, 10.472159385681152),
	new google.maps.LatLng(61.04686114335612, 10.463318824768066),
	new google.maps.LatLng(61.04956178687537, 10.46022891998291),
	new google.maps.LatLng(61.05271917057575, 10.458769798278809),
	new google.maps.LatLng(61.0599882660181, 10.457568168640137),
	new google.maps.LatLng(61.061732600793846, 10.456109046936035),
	new google.maps.LatLng(61.06439045005787, 10.45548677444458),
	new google.maps.LatLng(61.06677817132964, 10.457031726837158),
	new google.maps.LatLng(61.07240417658542, 10.457525253295898),
	new google.maps.LatLng(61.074064798878396, 10.458898544311523),
	new google.maps.LatLng(61.079544234557304, 10.459928512573242),
	new google.maps.LatLng(61.08535472100049, 10.462846755981445),
	new google.maps.LatLng(61.08643369390206, 10.462846755981445),
	new google.maps.LatLng(61.08817657242107, 10.464048385620117),
	new google.maps.LatLng(61.089836367485034, 10.464563369750977),
	new google.maps.LatLng(61.09639170689707, 10.466623306274414),
	new google.maps.LatLng(61.09863182793194, 10.466623306274414),
	new google.maps.LatLng(61.09929553703233, 10.467309951782227),
	new google.maps.LatLng(61.10195023416876, 10.46696662902832),
	new google.maps.LatLng(61.10410701152696, 10.464520454406738),
	new google.maps.LatLng(61.10680277638667, 10.464520454406738),
	new google.maps.LatLng(61.11401800060881, 10.461173057556152),
	new google.maps.LatLng(61.118537043646604, 10.460186004638672),
	new google.maps.LatLng(61.12185336137873, 10.451946258544922),
	new google.maps.LatLng(61.13047415892817, 10.438556671142578),
	new google.maps.LatLng(61.13345773314576, 10.431690216064453),
	new google.maps.LatLng(61.135778096042124, 10.42654037475586),
	new google.maps.LatLng(61.138781884088765, 10.422999858856201),
	new google.maps.LatLng(61.142821010661905, 10.419437885284424),
	new google.maps.LatLng(61.147791534115996, 10.419373512268066),
	new google.maps.LatLng(61.15346525838002, 10.413622856140137),
	new google.maps.LatLng(61.15532866792385, 10.405983924865723),
	new google.maps.LatLng(61.15847550977194, 10.40478229522705),
	new google.maps.LatLng(61.1620360312938, 10.404438972473145),
	new google.maps.LatLng(61.1653891783154, 10.404632091522217),
	new google.maps.LatLng(61.16824528169757, 10.40355920791626),
	new google.maps.LatLng(61.17383256210144, 10.408644676208496),
	new google.maps.LatLng(61.17490851724132, 10.408902168273926),
	new google.maps.LatLng(61.18384580209983, 10.416455268859863),
	new google.maps.LatLng(61.185252366151296, 10.416626930236816),
	new google.maps.LatLng(61.189471681701065, 10.414223670959473),
	new google.maps.LatLng(61.193690432385004, 10.409932136535645),
	new google.maps.LatLng(61.19555146636112, 10.41079044342041),
	new google.maps.LatLng(61.198942401165546, 10.416884422302246),
	new google.maps.LatLng(61.20419349443564, 10.422892570495605),
	new google.maps.LatLng(61.20816224381172, 10.429329872131348),
	new google.maps.LatLng(61.21320514112491, 10.436110496520996),
	new google.maps.LatLng(61.21919769816764, 10.43774127960205),
	new google.maps.LatLng(61.223081918767775, 10.43851375579834),
	new google.maps.LatLng(61.22915521765261, 10.43774127960205),
	new google.maps.LatLng(61.23349257060876, 10.434651374816895),
	new google.maps.LatLng(61.24022461002881, 10.43001651763916),
	new google.maps.LatLng(61.241793835411464, 10.428128242492676),
	new google.maps.LatLng(61.24806995388573, 10.424866676330566),
	new google.maps.LatLng(61.250051625758694, 10.423579216003418),
	new google.maps.LatLng(61.2581421561182, 10.415596961975098),
	new google.maps.LatLng(61.26061843273175, 10.411648750305176),
	new google.maps.LatLng(61.262434244887686, 10.408580303192139),
	new google.maps.LatLng(61.26470386250923, 10.406262874603271),
	new google.maps.LatLng(61.267262143963144, 10.399332046508789),
	new google.maps.LatLng(61.270645357507306, 10.390233993530273),
	new google.maps.LatLng(61.27320315508669, 10.380620956420898),
	new google.maps.LatLng(61.27477073450797, 10.372037887573242),
	new google.maps.LatLng(61.27559574487803, 10.364656448364258),
	new google.maps.LatLng(61.27510074125711, 10.355730056762695),
	new google.maps.LatLng(61.27460572983282, 10.350923538208008),
	new google.maps.LatLng(61.273780693451336, 10.347833633422852),
	new google.maps.LatLng(61.27328566121766, 10.345602035522461),
	new google.maps.LatLng(61.27328566121766, 10.341482162475586),
	new google.maps.LatLng(61.27353317830997, 10.337533950805664),
	new google.maps.LatLng(61.27254309823525, 10.330495834350586),
	new google.maps.LatLng(61.27213055565802, 10.324831008911133),
	new google.maps.LatLng(61.27188302751039, 10.320196151733398),
	new google.maps.LatLng(61.272213064607016, 10.314531326293945),
	new google.maps.LatLng(61.2726256061004, 10.310754776000977),
	new google.maps.LatLng(61.27312064873896, 10.308694839477539),
	new google.maps.LatLng(61.27658572871015, 10.299210548400879),
	new google.maps.LatLng(61.277080708921524, 10.294833183288574),
	new google.maps.LatLng(61.283143583273464, 10.284018516540527),
	new google.maps.LatLng(61.28836001747583, 10.277345180511475),
	new google.maps.LatLng(61.29205017256816, 10.27644395828247),
	new google.maps.LatLng(61.294317650383256, 10.276937484741211),
	new google.maps.LatLng(61.30412775676511, 10.291872024536133),
	new google.maps.LatLng(61.309237689132424, 10.2962064743042),
	new google.maps.LatLng(61.31162753298526, 10.295863151550293),
	new google.maps.LatLng(61.316200691816455, 10.289082527160645),
	new google.maps.LatLng(61.31859000495884, 10.285134315490723),
	new google.maps.LatLng(61.323244523041154, 10.276808738708496),
	new google.maps.LatLng(61.33115149979824, 10.275778770446777),
	new google.maps.LatLng(61.33358084709994, 10.275263786315918),
	new google.maps.LatLng(61.33848014391462, 10.268998146057129),
	new google.maps.LatLng(61.34370795991873, 10.268654823303223),
	new google.maps.LatLng(61.35025179068141, 10.268397331237793),
	new google.maps.LatLng(61.355025043314825, 10.269556045532227),
	new google.maps.LatLng(61.3611962736049, 10.263204574584961),
	new google.maps.LatLng(61.36703725030333, 10.264406204223633),
	new google.maps.LatLng(61.37279489220992, 10.256338119506836),
	new google.maps.LatLng(61.379538210553385, 10.235567092895508),
	new google.maps.LatLng(61.38422478245401, 10.22801399230957),
	new google.maps.LatLng(61.387842006609105, 10.218229293823242),
	new google.maps.LatLng(61.390143658580335, 10.216512680053711),
	new google.maps.LatLng(61.397951571799574, 10.213079452514648),
	new google.maps.LatLng(61.4014850385072, 10.209817886352539),
	new google.maps.LatLng(61.407400646066755, 10.202093124389648),
	new google.maps.LatLng(61.41216518182631, 10.202436447143555),
	new google.maps.LatLng(61.41996759237331, 10.205183029174805),
	new google.maps.LatLng(61.4262081168525, 10.191278457641602),
	new google.maps.LatLng(61.43113396530493, 10.188531875610352),
	new google.maps.LatLng(61.43593591885131, 10.187973976135254),
	new google.maps.LatLng(61.44065506742864, 10.185914039611816),
	new google.maps.LatLng(61.4444298722017, 10.187888145446777),
	new google.maps.LatLng(61.447588868422365, 10.185999870300293),
	new google.maps.LatLng(61.451690983190524, 10.182888507843018),
	new google.maps.LatLng(61.453208628850525, 10.179433822631836),
	new google.maps.LatLng(61.45402894709068, 10.171709060668945),
	new google.maps.LatLng(61.45616167347874, 10.16810417175293),
	new google.maps.LatLng(61.468053048298714, 10.166387557983398),
	new google.maps.LatLng(61.473792087860204, 10.16535758972168),
	new google.maps.LatLng(61.4824806205894, 10.16758918762207),
	new google.maps.LatLng(61.48952802624399, 10.164670944213867),
	new google.maps.LatLng(61.49229328729691, 10.164949893951416),
	new google.maps.LatLng(61.49407521422761, 10.164134502410889),
	new google.maps.LatLng(61.50468273587153, 10.154757499694824),
	new google.maps.LatLng(61.509268652151, 10.145058631896973),
	new google.maps.LatLng(61.51369014530863, 10.141024589538574),
	new google.maps.LatLng(61.51786542268696, 10.14111042022705),
	new google.maps.LatLng(61.52306326865676, 10.14763355255127),
	new google.maps.LatLng(61.525559562835674, 10.14960765838623),
	new google.maps.LatLng(61.52781014798712, 10.147290229797363),
	new google.maps.LatLng(61.52936500251678, 10.135445594787598),
	new google.maps.LatLng(61.53030606088185, 10.126690864562988),
	new google.maps.LatLng(61.53452001611737, 10.109696388244629),
	new google.maps.LatLng(61.538201645022745, 10.093817710876465),
	new google.maps.LatLng(61.539183339035105, 10.090556144714355),
	new google.maps.LatLng(61.54499106040004, 10.078797340393066),
	new google.maps.LatLng(61.54719934545252, 10.07072925567627),
	new google.maps.LatLng(61.550102592356716, 10.057511329650879),
	new google.maps.LatLng(61.55038881326416, 10.051932334899902),
	new google.maps.LatLng(61.54813986361559, 10.044035911560059),
	new google.maps.LatLng(61.54769005413573, 10.039315223693848),
	new google.maps.LatLng(61.54769005413573, 10.018351078033447),
	new google.maps.LatLng(61.54797629728601, 10.005755424499512),
	new google.maps.LatLng(61.54805808055853, 9.999747276306152),
	new google.maps.LatLng(61.54879412031664, 9.992880821228027),
	new google.maps.LatLng(61.5480171889492, 9.970307350158691),
	new google.maps.LatLng(61.546585948692055, 9.964985847473145),
	new google.maps.LatLng(61.546708629013615, 9.95837688446045),
	new google.maps.LatLng(61.54813986361559, 9.94412899017334),
	new google.maps.LatLng(61.55100213489402, 9.932112693786621),
	new google.maps.LatLng(61.55296468268263, 9.927821159362793),
	new google.maps.LatLng(61.554027677595556, 9.927306175231934),
	new google.maps.LatLng(61.55688940604073, 9.928722381591797),
	new google.maps.LatLng(61.55885158162124, 9.92837905883789),
	new google.maps.LatLng(61.562448581315955, 9.926319122314453),
	new google.maps.LatLng(61.564410405412424, 9.919795989990234),
	new google.maps.LatLng(61.56571821923052, 9.913959503173828),
	new google.maps.LatLng(61.566208635199445, 9.906063079833984),
	new google.maps.LatLng(61.56898751259264, 9.898509979248047),
	new google.maps.LatLng(61.570131683873626, 9.893016815185547),
	new google.maps.LatLng(61.56964132992104, 9.883403778076172),
	new google.maps.LatLng(61.570295133468576, 9.876537322998047),
	new google.maps.LatLng(61.5735639445004, 9.869327545166016),
	new google.maps.LatLng(61.574544520633076, 9.862804412841797),
	new google.maps.LatLng(61.57536164372703, 9.856624603271484),
	new google.maps.LatLng(61.576995825326016, 9.852161407470703),
	new google.maps.LatLng(61.57830310860153, 9.849071502685547),
	new google.maps.LatLng(61.57895672957197, 9.845638275146484),
	new google.maps.LatLng(61.5828781660651, 9.83877182006836),
	new google.maps.LatLng(61.58410351325626, 9.836797714233398),
	new google.maps.LatLng(61.585247126937894, 9.830961227416992),
	new google.maps.LatLng(61.585573865955055, 9.822893142700195),
	new google.maps.LatLng(61.585247126937894, 9.807958602905273),
	new google.maps.LatLng(61.58377675874094, 9.793710708618164),
	new google.maps.LatLng(61.58728918929313, 9.771909713745117),
	new google.maps.LatLng(61.590229522753475, 9.76161003112793),
	new google.maps.LatLng(61.59472116027937, 9.748392105102539),
	new google.maps.LatLng(61.59757913611983, 9.742727279663086),
	new google.maps.LatLng(61.60133493204469, 9.74264144897461),
	new google.maps.LatLng(61.60460047145016, 9.740989208221436),
	new google.maps.LatLng(61.60796769841076, 9.734852313995361),
	new google.maps.LatLng(61.61178344642923, 9.73440170288086),
	new google.maps.LatLng(61.61504788433503, 9.733028411865234),
	new google.maps.LatLng(61.61716958441388, 9.724788665771484),
	new google.maps.LatLng(61.62043345446169, 9.724445343017578),
	new google.maps.LatLng(61.627123312275465, 9.723758697509766),
	new google.maps.LatLng(61.63185428983452, 9.72066879272461),
	new google.maps.LatLng(61.63919402990268, 9.719295501708984),
	new google.maps.LatLng(61.64164022293961, 9.723072052001953),
	new google.maps.LatLng(61.64620593229758, 9.73062515258789),
	new google.maps.LatLng(61.65174910172605, 9.735774993896484),
	new google.maps.LatLng(61.65468331849281, 9.737834930419922),
	new google.maps.LatLng(61.66071388941507, 9.730281829833984),
	new google.maps.LatLng(61.66495088395089, 9.722042083740234),
	new google.maps.LatLng(61.66609151398264, 9.712085723876953),
	new google.maps.LatLng(61.6641361224311, 9.695262908935547),
	new google.maps.LatLng(61.662995420206684, 9.684619903564453),
	new google.maps.LatLng(61.66315838024569, 9.668827056884766),
	new google.maps.LatLng(61.6641361224311, 9.664020538330078),
	new google.maps.LatLng(61.66307690033364, 9.641103744506836),
	new google.maps.LatLng(61.65932859210129, 9.61552619934082),
	new google.maps.LatLng(61.66283245930821, 9.594240188598633),
	new google.maps.LatLng(61.66609151398264, 9.576730728149414),
	new google.maps.LatLng(61.66853557939296, 9.56033706665039),
	new google.maps.LatLng(61.67521503833707, 9.545917510986328),
	new google.maps.LatLng(61.679612917639005, 9.541454315185547),
	new google.maps.LatLng(61.68401017062847, 9.544200897216797),
	new google.maps.LatLng(61.69361680338781, 9.55038070678711)
]

route_southE = [			
	new google.maps.LatLng(59.910631722724226, 10.75361967086792),
	new google.maps.LatLng(59.90865222703326, 10.762202739715576),
	new google.maps.LatLng(59.90609161732389, 10.768167972564697),
	new google.maps.LatLng(59.90432704865348, 10.768682956695557),
	new google.maps.LatLng(59.9027560732571, 10.766150951385498),
	new google.maps.LatLng(59.90133567536662, 10.761945247650146),
	new google.maps.LatLng(59.89950628555162, 10.756580829620361),
	new google.maps.LatLng(59.89672972496849, 10.755465030670166),
	new google.maps.LatLng(59.893995985102144, 10.758168697357178),
	new google.maps.LatLng(59.88945360493704, 10.763576030731201),
	new google.maps.LatLng(59.88631017265613, 10.768296718597412),
	new google.maps.LatLng(59.88234816322453, 10.771987438201904),
	new google.maps.LatLng(59.87033005055591, 10.781664848327637),
	new google.maps.LatLng(59.868175807831626, 10.78458309173584),
	new google.maps.LatLng(59.866107603521414, 10.784754753112793),
	new google.maps.LatLng(59.864642547648614, 10.785613059997559),
	new google.maps.LatLng(59.86283268364737, 10.785870552062988),
	new google.maps.LatLng(59.86054866709676, 10.787415504455566),
	new google.maps.LatLng(59.85830759277892, 10.7865571975708),
	new google.maps.LatLng(59.85623877479256, 10.786213874816895),
	new google.maps.LatLng(59.85326462355383, 10.78484058380127),
	new google.maps.LatLng(59.85136792452814, 10.785183906555176),
	new google.maps.LatLng(59.849384896318604, 10.788617134094238),
	new google.maps.LatLng(59.849040009785284, 10.792651176452637),
	new google.maps.LatLng(59.849643558873154, 10.799174308776855),
	new google.maps.LatLng(59.8486088965927, 10.801749229431152),
	new google.maps.LatLng(59.84628078885218, 10.802950859069824),
	new google.maps.LatLng(59.84373692941371, 10.801920890808105),
	new google.maps.LatLng(59.84119287556177, 10.7975435256958),
	new google.maps.LatLng(59.83631982285694, 10.797114372253418),
	new google.maps.LatLng(59.82808144834563, 10.798273086547852),
	new google.maps.LatLng(59.8206608539452, 10.797758102416992),
	new google.maps.LatLng(59.81884859724055, 10.797758102416992),
	new google.maps.LatLng(59.81712254683512, 10.796899795532227),
	new google.maps.LatLng(59.81349754995994, 10.798788070678711),
	new google.maps.LatLng(59.81142594613716, 10.800333023071289),
	new google.maps.LatLng(59.8083182989748, 10.805482864379883),
	new google.maps.LatLng(59.805728371685674, 10.804967880249023),
	new google.maps.LatLng(59.801325033508256, 10.803937911987305),
	new google.maps.LatLng(59.79700747073608, 10.802907943725586),
	new google.maps.LatLng(59.794503028189474, 10.80204963684082),
	new google.maps.LatLng(59.79225750601967, 10.800504684448242),
	new google.maps.LatLng(59.78828428877157, 10.79981803894043),
	new google.maps.LatLng(59.78094122911655, 10.801362991333008),
	new google.maps.LatLng(59.77774433361536, 10.802736282348633),
	new google.maps.LatLng(59.77333730000898, 10.806169509887695),
	new google.maps.LatLng(59.76996682287485, 10.810632705688477),
	new google.maps.LatLng(59.768238241065106, 10.811963081359863),
	new google.maps.LatLng(59.76460792795881, 10.813679695129395),
	new google.maps.LatLng(59.763570623148816, 10.816168785095215),
	new google.maps.LatLng(59.76344095778207, 10.82028865814209),
	new google.maps.LatLng(59.762835846080456, 10.823206901550293),
	new google.maps.LatLng(59.76158236553435, 10.824580192565918),
	new google.maps.LatLng(59.7599830289473, 10.826725959777832),
	new google.maps.LatLng(59.759377854591584, 10.831446647644043),
	new google.maps.LatLng(59.75842684416469, 10.834965705871582),
	new google.maps.LatLng(59.75708673805924, 10.836853981018066),
	new google.maps.LatLng(59.75103397627636, 10.83852767944336),
	new google.maps.LatLng(59.74783421630941, 10.835866928100586),
	new google.maps.LatLng(59.74299075351377, 10.838098526000977),
	new google.maps.LatLng(59.735810758451606, 10.839815139770508),
	new google.maps.LatLng(59.7326095407656, 10.841360092163086),
	new google.maps.LatLng(59.72888882160272, 10.840330123901367),
	new google.maps.LatLng(59.72525423111632, 10.838785171508789),
	new google.maps.LatLng(59.72179234913182, 10.83552360534668),
	new google.maps.LatLng(59.71521378621508, 10.833292007446289),
	new google.maps.LatLng(59.710885078805305, 10.830373764038086),
	new google.maps.LatLng(59.70655581142613, 10.826082229614258),
	new google.maps.LatLng(59.699801036054666, 10.814237594604492),
	new google.maps.LatLng(59.693304774328055, 10.805826187133789),
	new google.maps.LatLng(59.689146505392564, 10.80204963684082),
	new google.maps.LatLng(59.67805526403959, 10.79707145690918),
	new google.maps.LatLng(59.666960350501796, 10.793466567993164),
	new google.maps.LatLng(59.66496634395803, 10.79333782196045),
	new google.maps.LatLng(59.65577504181057, 10.797929763793945),
	new google.maps.LatLng(59.64901002174493, 10.798273086547852),
	new google.maps.LatLng(59.646407727658996, 10.79707145690918),
	new google.maps.LatLng(59.63018221042889, 10.782995223999023),
	new google.maps.LatLng(59.621328621874966, 10.776171684265137),
	new google.maps.LatLng(59.614556655490674, 10.769948959350586),
	new google.maps.LatLng(59.61186485382056, 10.765829086303711),
	new google.maps.LatLng(59.60170353017457, 10.744199752807617),
	new google.maps.LatLng(59.59944504098949, 10.740251541137695),
	new google.maps.LatLng(59.593537505673815, 10.73939323425293),
	new google.maps.LatLng(59.571809700912816, 10.724973678588867),
	new google.maps.LatLng(59.56320161050886, 10.722055435180664),
	new google.maps.LatLng(59.54545678424146, 10.724802017211914),
	new google.maps.LatLng(59.5361021944728, 10.728793144226074),
	new google.maps.LatLng(59.52787671226874, 10.731496810913086),
	new google.maps.LatLng(59.518386625926894, 10.727376937866211),
	new google.maps.LatLng(59.51002617241913, 10.721540451049805),
	new google.maps.LatLng(59.505322506627415, 10.716390609741211),
	new google.maps.LatLng(59.48798296544587, 10.704030990600586),
	new google.maps.LatLng(59.479571387651575, 10.693602561950684),
	new google.maps.LatLng(59.47246567696943, 10.687808990478516),
	new google.maps.LatLng(59.45571993442715, 10.673389434814453),
	new google.maps.LatLng(59.44943814172924, 10.66995620727539),
	new google.maps.LatLng(59.443329724371836, 10.66823959350586),
	new google.maps.LatLng(59.43617274656055, 10.658283233642578),
	new google.maps.LatLng(59.43425232417459, 10.654163360595703)
]
}