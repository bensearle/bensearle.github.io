

// run initialize once the html has loaded
//document.addEventListener("DOMContentLoaded", initialize, false);

// Enable the visual refresh
//google.maps.visualRefresh = true;




// Get the modal
var modal = document.getElementById('myModal');

// Get the button that opens the modal
var btn = document.getElementById("myBtn");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks on the button, open the modal 
btn.onclick = function() {
	modal.style.display = "block";
	openModel();
}

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
	modal.style.display = "none";
}

closeModal = function() {
	modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
	if (event.target == modal) {
		modal.style.display = "none";
	}
}

showSearch = function(){
	console.log("show search bar");
	var searchbtn = document.getElementById('searchicon');
	searchbtn.src = "images/search_inverted.png"
	searchbtn.style.backgroundColor = "white";	
	document.getElementById("searchtxt").style.display = "none";
	document.getElementById("searchbox").style.display = "block";
	document.getElementById("searchbox").focus();
}

var selectedStoreId = "";

mapview = function (){
	// change button colours
	var listbutton = document.getElementById('listbtn');
	listbutton.src ='images/listview.png';
	listbutton.style.backgroundColor = "black";
	var mapbutton = document.getElementById('mapbtn');
	mapbutton.src='images/mapview_inverted.png';
	mapbutton.style.backgroundColor = "white";

	document.getElementById("tables").style.display = "none";
	closeIW();
	document.getElementById("map").style.display = "block";

	google.maps.event.trigger(map,'resize');

	//map.setCenter(mapCenter);
	map.fitBounds(bounds);
    google.maps.event.addListener(map, 'click', function () { // click on the map
	    closeIW(); // close all infowindows
		//storeSelected = null; // unselect train
	});
}

listview = function(){
	// change button colours
	var mapbutton = document.getElementById('mapbtn');
	mapbutton.src='images/mapview.png';
	mapbutton.style.backgroundColor = "black";
	var listbutton = document.getElementById('listbtn');
	listbutton.src='images/listview_inverted.png';
	listbutton.style.backgroundColor = "white";

	document.getElementById("map").style.display = "none";
	document.getElementById("tables").style.display = "block";

	refreshTable();
}

var map;
var mapCenter = {lat: 22.282137, lng: 114.157619};

locateUser = function(){
  	// Try HTML5 geolocation.
  	if (navigator.geolocation) {
  		navigator.geolocation.getCurrentPosition(function(position) {
  			var pos = {
  				lat: position.coords.latitude,
  				lng: position.coords.longitude
  			};
  			map.setCenter(pos);

  			var markerImage = new google.maps.MarkerImage('images/currentLocation.png',
                new google.maps.Size(30, 30), // size
                new google.maps.Point(0, 0), // origin
                new google.maps.Point(15, 15), // anchor (location on map)
                new google.maps.Size(30, 30)); // scaled size

  			var marker = new google.maps.Marker({
  				map: map,
  				position: pos,
  				icon: markerImage
  			});
  		}, function() {
  			handleLocationError(true, infoWindow, map.getCenter());
  		});
  	} else {
    	// Browser doesn't support Geolocation
    	handleLocationError(false, infoWindow, map.getCenter());
    }
}

function initMap() {
	map = new google.maps.Map(document.getElementById('map'), {
		center: mapCenter, // this data is overwritten when popup is clicked
		zoom: 15,
		mapTypeId: google.maps.MapTypeId.ROADMAP,
		mapTypeControl: false // no option to change map type
	}); 
}
var bounds;
var initialized;

function refreshTable(){
	var inStockTable = document.getElementById("table_inStock");
	var noStockTable = document.getElementById("table_noStock");

	inStockTable.innerHTML = "";
	//tbl2.innerHTML = "BBBENENENENE";
	stores.forEach(function(storeDetails) {

		//console.log(storeDetails);
		var stock = getStockCount(storeDetails.id);

		new StoreMarker(storeDetails, stock);
		bounds.extend(storeDetails.coords);

		//var inStockTable = document.getElementById("table_inStock"); 
		var row;
		console.log ("selected "+selectedStoreId+" actual "+storeDetails.id)
		if (selectedStoreId==storeDetails.id){
			row = inStockTable.insertRow(0);
		} else {
			row = inStockTable.insertRow(-1); // insert bottom row
		}
		row.insertCell(0).innerHTML = tableString(storeDetails, stock);

	});
}

function openModel() {


	if (!initialized){
		getStoreDetails();
		bounds = new google.maps.LatLngBounds();


		stores.forEach(function(storeDetails) {

			//console.log(storeDetails);
			var stock = getStockCount(storeDetails.id);

			new StoreMarker(storeDetails, stock);
			bounds.extend(storeDetails.coords);

		});
		refreshTable();

		mapview();

		initialized = true;
	} else {
	}
	
}



function isInfoWindowOpen(infoWindow) {
	// check to see if the info window is open (on the map)
	var map = infoWindow.getMap();
	return (map !== null && typeof map !== "undefined");
}

function closeIW() {
	// close all infowindows
    for (var i = 0; i < all_store_iw.length; i++) { // iterate through all infowindows
        all_store_iw[i].closeWindow(); // close window
    }
}

var all_store_marker = []; // array of all store marker
var all_store_iw = []; // array of all train infowindows

var markerGreen = 'images/markergreen.png'
var markerAmber = 'images/markeramber.png'
var markerRed = 'images/markerred.png'


function markerDetails(stockmessage){
	switch (stockmessage){
		case "In Stock":
		return {"icon":markerGreen, "z":10};
		break;
		case "Limited Stock":
		return {"icon":markerAmber, "z":9};
		break;
		case "Some Items Available":
		return {"icon":markerAmber, "z":8};
		break;
		case "Available in 2-3 Days":
		return {"icon":markerAmber, "z":7};
		break;
		case "Not Available":
		return {"icon":markerRed, "z":6};
		break;
		default:
		return {"icon":markerRed, "z":5};
		break;
	}
}

function StoreMarker(storeDetails, stock) {

	var markerdetails = markerDetails(stock.message);
    var pos = new google.maps.LatLng(storeDetails.lat, storeDetails.lng); // initial position of train

	// create store marker
	var marker = new google.maps.Marker({
		position: storeDetails.coords,
		icon: markerdetails.icon,
		map: map,
		title: 'Store',
		zIndex: markerdetails.z
	});
	
	var train = this;
    all_store_marker.push(this); // push the train to the train array
    this.id = storeDetails.id;
    this.inAlarmG = function () {
    	marker.setIcon(iconAlarmG);
    	logAlarms();
    };
    this.inAlarmR = function () {
    	marker.setIcon(iconAlarmR);
    	logAlarms();
    };
    this.outAlarm = function () {
    	marker.setIcon(iconStandard);
    	logAlarms();
    };
    this.getMarker = function () {
    	return marker;
    };
    this.setPosition = function (trainLocation) {
    	marker.setPosition(trainLocation);
    }
    this.getPosition = function () {
    	return marker.getPosition();
    }       

    
    google.maps.event.addListener(marker, 'click', function () {
		//storeSelected = store; // change the train that is to be updated in the table
		if (isInfoWindowOpen(infoWindow.getWindow())) {
			// infowindow is open
            closeIW(); // close all info infowindows
        } else {
            // infowindow is closed
			closeIW(); // close all info infowindows
			infoWindow.openWindow(); // open this infowindow
		}
	});


    var infowindowString = iwString(storeDetails, stock);
    var infoWindow = new storeIW(this, storeDetails);

    function storeIW(store, storeDetails) {
    	this.id = storeDetails.id;
    	var infoWindow = new google.maps.InfoWindow({
        //content: contentString
    });
	    all_store_iw.push(this); // push infowindow to infowindow array

	    infoWindow.setContent(infowindowString);

	    this.openWindow = function () {
	    	infoWindow.close(map, store.getMarker());
	    	infoWindow.open(map, store.getMarker());
	    };
	    this.closeWindow = function () {
	    	infoWindow.close(map, store.getMarker());
	    };
	    this.getWindow = function () {
	    	return infoWindow;
	    }
	}

}

function selectStore(id, goToPage){
	selectedStoreId = id;
	if (goToPage=="list"){
		listview();
	}
}
function iwString(storeDetails, stock) {

	// html content of the infowindow
	var contentString = '<div class="iwContent">' +
		'<p class="p1">'+
		storeDetails.name + '</p>' +
		'<p class="p2">'+
		storeDetails.address + '</p>' +
		'<p class="p1">'+
		stock.message + '</p>' +
		'<button type="button" onclick=selectStore("' + storeDetails.id + '","")>Select Store</button>' + 
		'<button type="button" onclick=selectStore("' + storeDetails.id + '","list")>View Opening</button>' + 
	'</div>';

	resetAlarm = function () { // button on infowindow function
        train.outAlarm(); // reset the train alarm
    }
    return contentString;
}

function tableString(storeDetails, stock) {
	var openinghoursString = "";
	var dayhrs = storeDetails.opening.split(',');
	dayhrs.forEach(function(hrs){
		openinghoursString += hrs + "<br/>"
	})
	// html content of the table
	var contentString = '<div class="tableRow">' +
		'<div class="left">' +
			'<p class="p1">'+
			storeDetails.name + '<br />' + 
			'<p class="p2">'+
			storeDetails.address +'</p>' +
			'<p class="p1">'+
			stock.message + '</p>' +
			'<button type="button" onclick="resetAlarm()">Select Store</button>' + 
		'</div>' +
		'<div class="right">' + 
			'<p class="p2">'+
			openinghoursString + '</p>' + 
		'</div>' +
	'</div>';
	
	resetAlarm = function () { // button on infowindow function
        train.outAlarm(); // reset the train alarm
    }
    return contentString;
}

function getStockCount(storeID, productID){
	switch (storeID){
		case "id1":
		return {"count":"30" ,"message":"In Stock"};
		break;
		case "id2":
		return {"count":"30" ,"message":"In Stock"};
		break;
		case "id3":
		return {"count":"3" ,"message":"Limited Stock"};
		break;
		case "id4":
		return {"count":"2" ,"message":"Some Items Available"};
		break;
		case "id5":
		return {"count":"0" ,"message":"Available in 2-3 Days"};
		break;
		case "id6":
		return {"count":"0" ,"message":"Not Available"};
		break;
		case "id7":
		return {"count":"0" ,"message":"Not Available"};
		break;
		default:
		return {"count":"0" ,"message":"No Stock Information"};
		break;
	}
}

var stores = [];

function getStoreDetails(){
	var openinghours = "Monday 10:00am-7:00pm,Tuesday 10:00am-7:00pm,Wednesday 10:00am-7:00pm,Thursday 10:00am-7:00pm,Friday 10:00am-9:00pm,Saturday 10:00am-9:00pm,Sunday 11:00am-5:00pm";
	s1 = {"id":"id1", "name":"PERTH MYER", "coords":{"lat":-31.953317, "lng":115.860819}, "address":"D200 Murray Street, PERTH, 6000 WA", "opening":openinghours}
	s2 = {"id":"id2", "name":"PERTH DJ", "coords":{"lat":-31.954218, "lng":115.859006}, "address":"Hay Street, PERTH, 6000 WA", "opening":openinghours}
	s3 = {"id":"id3", "name":"PERTH ENEX", "coords":{"lat":-31.954327, "lng":115.857064}, "address":"Shop H113, Enex 100, 100 St Georges Terrace, Perth, 6000 WA", "opening":openinghours}
	s4 = {"id":"id4", "name":"MORLEY MYER", "coords":{"lat":-31.897776, "lng":115.901813}, "address":"Collier Rd, Morley, 6062 WA", "opening":openinghours}
	s5 = {"id":"id5", "name":"GARDEN CITY DJ", "coords":{"lat":-32.033744, "lng":115.835483}, "address":"125 Risely Street, BOORAGOON, 6154 WA", "opening":openinghours}
	s6 = {"id":"id6", "name":"KARRINYUP DJ", "coords":{"lat":-31.877492, "lng":115.776409}, "address":"Karrinyup Road, KARRINYUP, 6018 WA", "opening":openinghours}
	//s1 = {"id":"id1", "name":"name", "lat":"000000", "lng":"000000", "address":"aaaaaaa", "opening":"Open: Mon-Wed 10:00am-7:00pm, Thu 10:00am-9:00pm, Fri-Sat 10:00am-7:00pm, Sun 11:00am-5:00pm"}
	//s1 = {"id":"id1", "name":"name", "lat":"000000", "lng":"000000", "address":"aaaaaaa", "opening":"Open: Mon-Wed 10:00am-7:00pm, Thu 10:00am-9:00pm, Fri-Sat 10:00am-7:00pm, Sun 11:00am-5:00pm"}
	//s1 = {"id":"id1", "name":"name", "lat":"000000", "lng":"000000", "address":"aaaaaaa", "opening":"Open: Mon-Wed 10:00am-7:00pm, Thu 10:00am-9:00pm, Fri-Sat 10:00am-7:00pm, Sun 11:00am-5:00pm"}
	//s1 = {"id":"id1", "name":"name", "lat":"000000", "lng":"000000", "address":"aaaaaaa", "opening":"Open: Mon-Wed 10:00am-7:00pm, Thu 10:00am-9:00pm, Fri-Sat 10:00am-7:00pm, Sun 11:00am-5:00pm"}



	stores.push(s1);
	stores.push(s2);
	stores.push(s3);
	stores.push(s4);
	stores.push(s5);
	stores.push(s6);
	//stores.push(s1);


}


