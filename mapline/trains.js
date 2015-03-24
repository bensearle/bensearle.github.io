// run initialize once the html has loaded
document.addEventListener("DOMContentLoaded", initialize, false);

// Enable the visual refresh
google.maps.visualRefresh = true;

//var map; // the google map
var train_stations = []; // array of all train station co-ordinates
var trainSelected; // the train that is selected - being tracked and in the table
var all_train = []; // array of all trains
var all_train_iw = []; // array of all train infowindows
var updateTime = 200; // time in ms to update the trains movement along track
var minorAlarmProb = 1 - (document.getElementById("minorSlider").value / 100) * updateTime/1000; // alarm probability set from the slider
var majorAlarmProb = (document.getElementById("majorSlider").value / 100) * updateTime/1000; // alarm probability set from the slider








var poly;
var map;
var index_of_point = 0;
function initialize() {
	var mapOptions = {
		zoom: 7,
		// Center the map on Norway.
		center: new google.maps.LatLng(59.911132, 10.753407)
	};

	map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

	var polyOptions = {
		strokeColor: '#000000',
		strokeOpacity: 1.0,
		strokeWeight: 3
	};
	poly = new google.maps.Polyline(polyOptions);
	poly.setMap(map);

	// Add a listener for the click event
	google.maps.event.addListener(map, 'click', addLatLng);
}

/**
 * Handles click events on a map, and adds a new point to the Polyline.
 * @param {google.maps.MouseEvent} event
 */
function addLatLng(event) {

	var path = poly.getPath();

  // Because path is an MVCArray, we can simply append a new coordinate
  // and it will automatically appear.
	path.push(event.latLng);
	
	var latLng = event.latLng;
	console.log(latLng);
	coordinates.textContent = coordinates.textContent + "\r\n" +
		"new google.maps.LatLng" + latLng +",";
	
	//coordinates.textContent = coordinates.textContent + "\r\n" +
	//	"var point" + index_of_point++ + " = new google.maps.LatLng" + latLng +";";
		
  // Add a new marker at the new plotted point on the polyline.
//  var marker = new google.maps.Marker({
//    position: event.latLng,
//    title: '#' + path.getLength(),
//    map: map
//  });
}






var previous_point = false;
function initialize2() {
    getTrainStations(); // call method to populate train station array
    five(); // start the five second timer

    var mapOptions = {
        zoom: 12,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    var map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);

    google.maps.event.addListener(map, 'click', function (event) { // click on the map
        closeIW(); // close all infowindows
		trainSelected = null; // unselect train
		
		var latLng = event.latLng;
		var latitude = event.latLng.lat();
		var longitude = event.latLng.lng();
		console.log( latitude + ', ' + longitude );
		console.log(previous_point);
		coordinates.textContent = coordinates.textContent + "\r\n" + latLng;
		if (previous_point){
			var line_coordinates = [
				previous_point,
				new google.maps.LatLng(latLng)
			];
			// draw a polyline of the track using the array of station co-ordinates
			var line = new google.maps.Polyline({
				path: line_coordinates,
				strokeColor: "#0000FF",
				strokeOpacity: 0.8,
				strokeWeight: 2
			});
			line.setMap(map); // put the polyline on the map
			console.log("TRUE");
		} else {
			previous_point = new google.maps.LatLng(latLng);
			console.log("FALSE");
		}
    });



	// set initial view of the map to show the entire track
    var bounds = new google.maps.LatLngBounds();
    for (var i = 0; i < train_stations.length; i++) {
        bounds.extend(train_stations[i]);
    }
    map.fitBounds(bounds);

    var routeLength = google.maps.geometry.spherical.computeLength(train_stations); // get length of track in km

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