var input = document.getElementById("input").value;

var geocoder;

function initializeMap() {
	console.log("ready");
	geocoder = new google.maps.Geocoder;
	console.log(validCoodinates(34,34));
	console.log(validCoodinates(34,-202));

	/*
	var map = new google.maps.Map(document.getElementById('map'), {
		zoom: 8,
		center: {lat: 40.731, lng: -73.997}
	});
	var geocoder = new google.maps.Geocoder;
	var infowindow = new google.maps.InfoWindow;

	document.getElementById('submit').addEventListener('click', function() {
		geocodeLatLng(geocoder, map, infowindow);
	});*/
}

//var geocoder = new google.maps.Geocoder();


function GetCoordinates(){
	//var branchId = document.getElementById('branchId').value;
	//console.log(branchId);
	//var a = coordStringToArray("{'lat=1.555,'lang':1");
	var b = coordStringToArray("{'lat=22.281896,'lang':114.155153");
	//coordStringToArray("\"441.24422\"\"lat\" 15.3676745");

	getAddress(b);
}

/*
 * checks whether coordinates are valid
 * latitude range is -90 to +90 (for southern and northern hemisphere)
 * longitude range is -180 to +180 (west and east of the Prime Meridian)
 */
function validCoodinates(lat,lng){
	return -90<=lat && lat<=90 && -180<=lng && lng<=180
}




/*
 * returns an array of coodinates from string of coordinates
 * {"latitude=22.281896 longitude=114.155153   	--> ["22.281896", "114.155153"]
 * {"lat":22.281896,"lng":114.155153}   		--> ["22.281896", "114.155153"]
 * 22.281896 114.155153  						--> ["22.281896", "114.155153"]
 */
function coordStringToArray(coordinateString){
	var coodinates = [],
		coordArray = coordinateString.match(/[+-]?\d+(\.\d+)/g); // matches decimal numbers (must contain ".")
	if (coordArray.length == 2){
		coodinates = {lat: parseFloat(coordArray[0]), lng: parseFloat(coordArray[1])};
	}
	console.log("coodinates",coodinates);
	return coodinates;
}

function getAddress(coodinates,id){
	var firstLine = true;
	geocoder.geocode({'location': coodinates}, function(results, status) {
		if (status === 'OK') {
			if (results[1]) {
				console.log("",results[1]);
				var address = results[1].formatted_address.replace(/[;]/g,",");;
				var fullAddress = "";
				results[1].address_components.forEach(function(addressLine){
					if (firstLine){
						fullAddress += addressLine.long_name;
						firstLine = false;
					} else {
						fullAddress += ", " + addressLine.long_name;
					}
				});
				fullAddress = fullAddress.replace(/[;]/g,",");
				console.log("",address);
				console.log("",fullAddress);

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

function getCoodinates(id, address){

	var addressString =  address.replace(/[^A-Z0-9]+/ig, "+"); // regex ^:not +:match-multiple i:case-insensitive g:global-match

	geocoder.geocode({'address': address}, function(results, status) {
		if (status === 'OK') {
			resultsMap.setCenter(results[0].geometry.location);
			var marker = new google.maps.Marker({
				map: resultsMap,
				position: results[0].geometry.location
			});
		} else {
			alert('Geocode was not successful for the following reason: ' + status);
		}
	});

}