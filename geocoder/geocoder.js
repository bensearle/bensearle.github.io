/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50, regexp: true */
/*global google*/
/*regexp: true*/


var input = document.getElementById("input"),
    outputJSON = document.getElementById("json"),
    outputTOML = document.getElementById("toml"),
    outputYAML = document.getElementById("yaml"),
    outputCSV = document.getElementById("csv"),
    outputErrors = document.getElementById("errors");

var map,
    bounds,
    markers = [],
    geocoder,
    output = [];// 

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

function recieveData(place) {
    'use strict';
    console.log("***RESULTS***", place.address, place.coordinates);
    var markerZ = 100000 - place.index;
    var marker = new google.maps.Marker({
		map: map,
		position: place.coordinates,
		zIndex: markerZ,
		icon: {
			url: 'markerOG.png',
			labelOrigin: new google.maps.Point(20, 15),
			scaledSize: new google.maps.Size(40, 40)
        },
		label: {
			text: place.index.toString(),
			color: 'white',
			fontSize: '14px',
			zIndex: markerZ
        }
	});
    
    markers.push(marker);
    bounds.extend(place.coordinates);
    map.fitBounds(bounds);

    output.push(place);
    console.log(JSON.stringify(output));
    
    outputJSON.value = JSON.stringify(output);
    outputCSV.value += place.coordinates.lat + "," + place.coordinates.lng + "," + place.address.replace(/[,]/g, ";") + "\n";
}

function processError(place, error) {
    'use strict';
    console.error(place, error);
    var errorString = '';
    if (place.index) {
        errorString += place.index + ". ";
    }
    if (place.address) {
        errorString += place.address + " :: ";
    }
    if (place.coordinates) {
        errorString += JSON.stringify(place.coordinates) + " :: ";
    }
    errorString += error + "\n";
    
    outputErrors.value += errorString;
    
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
	var coordArray = coordinateString.match(/[+\-]?\d+(\.\d+)/g); // matches decimal numbers (must contain ".")
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

function getAddress(place) {
    'use strict';
	var firstLine = true; // first line of geocode returned address
	geocoder.geocode({'location': place.coordinates}, function (results, status) {
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
                place.address = fullAddress;
                recieveData(place);

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
                console.error(results, status);
				window.alert('No results found');
			}
		} else {
            processError(place, status);
		}
	});
}

function getCoordinates(place, id) {
    'use strict';
	var addressString =  place.address.replace(/[^A-Z0-9]+/ig, " "); // regex ^:not +:match-multiple i:case-insensitive g:global-match

	geocoder.geocode({'address': place.address}, function (results, status) {
        if (status === 'OK') {
            if (results[0]) {
                console.log(results[0].geometry.location);
                var location = results[0].geometry.location;
                var coordinates = {lat: location.lat(), lng: location.lng()};
                place.coordinates = coordinates;
                recieveData(place);
            }
		} else {
            processError(place, status);
		}
	});
}


function readInput() {
    'use strict';
    output = []; // clear output
    outputJSON.value = '';
    outputTOML.value = '';
    outputYAML.value = '';
    outputCSV.value = '';
    outputErrors.value = '';
    bounds = new google.maps.LatLngBounds();
    markers.forEach(function (marker) {
        marker.setMap(null);
    });

    var lines = input.value.split('\n'),
        index = 1; // index for the place
    lines.forEach(function (line) {
        if (line.trim().length === 0) {
            // whitespace
        } else {
            console.log("read line:", line);
            var coordinates = readCoordinates(line); // return valid coordinates or false
            if (coordinates) {
                getAddress({'index': index, 'coordinates': coordinates}); // get address from coordinates
                index++;
            } else {
                getCoordinates({'index': index, 'address': line.trim()}); // get coordinates from address
                index++;
            }
        }
    });
}

//TODO implement copy to clipboard for output http://stackoverflow.com/questions/400212/how-do-i-copy-to-the-clipboard-in-javascript