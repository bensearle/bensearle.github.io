/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define */

var input = document.getElementById("input");
var outputJSON = document.getElementById("json");
var outputTOML = document.getElementById("toml");
var outputYAML = document.getElementById("yaml");

var map,
    geocoder;
var output = [];// 
function initializeMap() {
    'use strict';
	geocoder = new google.maps.Geocoder();
	map = new google.maps.Map(document.getElementById('map'), {
		center: {lat: 22.281896, lng: 114.155153},
		zoom: 10,
		mapTypeId: google.maps.MapTypeId.ROADMAP,
		mapTypeControl: false // no option to change map type
	});
}

//var geocoder = new google.maps.Geocoder();

function readInput() {
    'use strict';
    output = []; // clear output
    outputJSON.value = '';
    outputTOML.value = '';
    outputYAML.value = '';

    var lines = input.value.split('\n');
    lines.forEach(function (line) {
        if (line.trim().length === 0) {
            // whitespace
        } else {
            console.log("read line:", line);
            var coordinates = readCoordinates(line); // return valid coordinates or false
            if (coordinates) {
                getAddress(coordinates); // get address from coordinates
            } else {
                getCoordinates(line); // get coordinates from address
            }
        }
    });
}

function process() {
    'use strict';
	//var branchId = document.getElementById('branchId').value;
	//console.log(branchId);
	//var a = coordStringToArray("{'lat=1.555,'lang':1");
	var b = readCoordinates("{'lat=22.281896,'lang':114.155153");
	//coordStringToArray("\"441.24422\"\"lat\" 15.3676745");

	getAddress(b);
    console.log(validCoodinates(34, 34));
	console.log(validCoodinates(34, -202));
    readInput();
}

/*
 * checks whether coordinates are valid
 * latitude range is -90 to +90 (for southern and northern hemisphere)
 * longitude range is -180 to +180 (west and east of the Prime Meridian)
 */
function validCoodinates(lat, lng) {
    'use strict';
	return -90 <= lat && lat <= 90 && -180 <= lng && lng <= 180;
}

/*
 * returns an JSON of coodinates from string of coordinates
 * latitude=22.281896 longitude=114.155153  --> ["22.281896", "114.155153"] --> JSON
 * {"lat":22.281896,"lng":114.155153}       --> ["22.281896", "114.155153"] --> JSON
 * 22.281896 114.155153                     --> ["22.281896", "114.155153"] --> JSON
 * return {lat: 22.281896, lng: 114.155153}
 */
function readCoordinates(coordinateString) {
    'use strict';
	var coordArray = coordinateString.match(/[+-]?\d+(\.\d+)/g); // matches decimal numbers (must contain ".")
    if (coordArray) {
        
    
        if (coordArray.length === 2) { // exactly 2 coordinates
            var lat = parseFloat(coordArray[0]),
                lng = parseFloat(coordArray[1]);
            if (validCoodinates(lat, lng)) { // coordinates are valid
                return {lat: lat, lng: lng}; // return JSON of coordinates
            }
        }
    }
	return false; // return false when there are not exactly 2 coordinates, both valid
}

function getAddress(coodinates, id) {
    'use strict';
	var firstLine = true; // first line of geocode returned address
	geocoder.geocode({'location': coodinates}, function (results, status) {
		if (status === 'OK') {
			if (results[1]) {
				console.log("", results[1]);
				var address = results[1].formatted_address.replace(/[;]/g, ","),
                    fullAddress = "";
				results[1].address_components.forEach(function (addressLine) {
					if (firstLine) {
						fullAddress += addressLine.long_name;
						firstLine = false;
					} else {
						fullAddress += ", " + addressLine.long_name;
					}
				});
				fullAddress = fullAddress.replace(/[;]/g, ",");
				console.log("", address);
				console.log("", fullAddress);
                recieveData(fullAddress, coodinates);

				/*
				map.setZoom(11);
				var marker = new google.maps.Marker({
					position: latlng,
					map: map
				});
				infowindow.setContent(results[1].formatted_address);
				infowindow.open(map, marker);
				*/
			} else {
				window.alert('No results found');
			}
		} else {
			window.alert('Geocoder failed due to: ' + status);
		}
	});
}

function getCoordinates(address, id) {
    'use strict';
	var addressString =  address.replace(/[^A-Z0-9]+/ig, " "); // regex ^:not +:match-multiple i:case-insensitive g:global-match

	geocoder.geocode({'address': address}, function (results, status) {
		if (status === 'OK') {
            if (results[0]) {
                console.log(results[0].geometry.location);
                var location = results[0].geometry.location;
                var coordinates = {lat: location.lat(), lng: location.lng()};
                recieveData(address.trim(), coordinates);
            }
		} else {
			alert('Geocode was not successful for the following reason: ' + status);
		}
	});
}

function recieveData(address, coordinates) {
    'use strict';
    console.log("***RESULTS***", address, coordinates);
    
    var marker = new google.maps.Marker({
		map: map,
		position: coordinates,
		zIndex: 1, // 100000 - index;
		icon: {
			url: 'markerOG.png',
			labelOrigin: new google.maps.Point(20, 15),
			scaledSize: new google.maps.Size(40, 40)},
		/*label: {
			text: ""+store.index,
			color: 'black',
			fontSize: "12px",
			zIndex: markerZ}*/
        //TODO extend map bounds
	});

    output.push({"address": address, "coordinates": coordinates});
    console.log(JSON.stringify(output));
    
    outputJSON.value = JSON.stringify(output);
    outputTOML.value += coordinates.lat + "," + coordinates.lng + "," + address.replace(/[,]/g, ";") + "\n";
}

//TODO implement copy to clipboard for output http://stackoverflow.com/questions/400212/how-do-i-copy-to-the-clipboard-in-javascript