// run initialize once the html has loaded
document.addEventListener("DOMContentLoaded", initialize, false);

// Enable the visual refresh
google.maps.visualRefresh = true;

var map; // the google map

var route_south = [];

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
    var train_track = new google.maps.Polyline({
        path: route_south,
        strokeColor: "#0000FF",
        strokeOpacity: 0.8,
        strokeWeight: 2
    });
    train_track.setMap(map); // put the polyline on the map

	addStations(map);

	// set initial view of the map to show the entire track
    var bounds = new google.maps.LatLngBounds();
    for (var i = 0; i < route_south.length; i++) {
        bounds.extend(route_south[i]);
    }
    map.fitBounds(bounds);

    var route_south_len = google.maps.geometry.spherical.computeLength(route_south); // get length of track in km

	// create station array for each train
    var route_R1 = route_south.slice(0);
    var route_R3 = route_south.slice(0).reverse();
	// create 10 trains
    var train_R1 = new Train(map, 1, 'R1_red.png');
    var train_R3 = new Train(map, 2, 'R3_red.png');

    var k = 15000; // used to space the trains on track
	// start each train moving along the track
    moveAlongTrack(train_R1, route_R1, route_south_len / 5 * 1, 1, map);
    moveAlongTrack(train_R3, route_R3, route_south_len / 5 * 2, 2, map);
	
}

function addStations(map){
	
	var station_icon = 'images/station.png';
	
	var drammen = new google.maps.Marker({
        position: new google.maps.LatLng(59.740334, 10.203579),
        icon: station_icon,
        map: map
    });
	google.maps.event.addListener(drammen, 'click', function () {
		document.getElementById('train_page').src =  "http://rtd.jbv.no/auto/realtime-display/index.html#/?id=f442e70f85ad3120416b04914b0a3ec53f8e5466";
		map.panTo(drammen.position);
		console.log(iframe.src);
	});
	
	var alnabru = new google.maps.Marker({
        position: new google.maps.LatLng(59.932979, 10.835244),
        icon: station_icon,
        map: map
    });
	google.maps.event.addListener(alnabru, 'click', function () {
		document.getElementById('train_page').src = "http://rtd.jbv.no/auto/realtime-display/index.html#/?id=1d36f07687a7aa7517d4ed4aaf729b17b58724ba";
		map.panTo(alnabru.position);
		console.log(iframe.src);
	});
	

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
			map.panTo(trainLocation);
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
}