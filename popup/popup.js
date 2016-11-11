var map;
var mapCenter = {lat: 22.282137, lng: 114.157619};
var selectedStoreId = "";

var bounds;
var initialized;

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

function initMap() {
	map = new google.maps.Map(document.getElementById('map'), {
		center: mapCenter, // this data is overwritten when popup is clicked
		zoom: 15,
		mapTypeId: google.maps.MapTypeId.ROADMAP,
		mapTypeControl: false // no option to change map type
	}); 
}

var totalStoresWithStock = 0;
function openModel() {
	if (!initialized){
		getStoreDetails();
		bounds = new google.maps.LatLngBounds();
		stores.forEach(function(storeDetails) {
			//console.log(storeDetails);
			var stock = getStockCount(storeDetails.id);
			new StoreMarker(storeDetails, stock);
			bounds.extend(storeDetails.coords);
			if(stock.count>0){
				totalStoresWithStock ++;
			}
		});

		document.getElementById('modalHead').innerHTML = "Item is stocked in "+totalStoresWithStock+" stores";
		refreshTable();
		mapview();
		google.maps.event.trigger(map,'resize');
		map.fitBounds(bounds);
		google.maps.event.addListener(map, 'click', function () { // click on the map
	    	closeIW(); // close all infowindows
			//storeSelected = null; // 
		});
		initialized = true;
	} else {
	}
}

mapview = function (){
	// change button colours
	var listbutton = document.getElementById('listbtn');
	listbutton.src ='images/listview.png';
	listbutton.style.backgroundColor = "black";
	var mapbutton = document.getElementById('mapbtn');
	mapbutton.src='images/mapview_inverted.png';
	mapbutton.style.backgroundColor = "white";

	document.getElementById("tables").style.display = "none";
	//closeIW();
	document.getElementById("map").style.display = "block";
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

	//refreshTable();
}

showSearch = function(){
	console.log("show search bar");
	var searchbtn = document.getElementById('searchicon');
	searchbtn.src = "images/search_inverted.png";
	searchbtn.style.backgroundColor = "white";
	document.getElementById("searchtxt").style.display = "none";
	document.getElementById("searchbox").style.display = "block";
	document.getElementById("searchbox").focus();
}

search = function(){
	var txt = document.getElementById("searchtxt").value;
	if(txt){
		console.log("Searching for: " + txt);
	} else {
		var searchbtn = document.getElementById('searchicon');
		searchbtn.src = "images/search.png";
		searchbtn.style.backgroundColor = "black";	
		document.getElementById("searchbox").style.display = "none";
		document.getElementById("searchtxt").style.display = "block";
		
	}
}

var currentLocationMarker;
locateUser = function(){
  	// Try HTML5 geolocation.
  	if (navigator.geolocation) {
  		navigator.geolocation.getCurrentPosition(function(position) {
  			var pos = {
  				lat: position.coords.latitude,
  				lng: position.coords.longitude
  			};
  			map.setCenter(pos);
			if (!currentLocationMarker){
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
	  			currentLocationMarker = marker;
  			} else {
  				currentLocationMarker.setPosition(pos);
  			}
  		}, function() {
  			handleLocationError(true, infoWindow, map.getCenter());
  		});
  	} else {
    	// Browser doesn't support Geolocation
    	handleLocationError(false, infoWindow, map.getCenter());
    }
}


function refreshTable(){
	var inStockTable = document.getElementById("table_inStock");
	var noStockTable = document.getElementById("table_noStock");

	inStockTable.innerHTML = "";
	//tbl2.innerHTML = "BBBENENENENE";
	stores.forEach(function(storeDetails) {

		//console.log(storeDetails);
		var stock = getStockCount(storeDetails.id);

		//new StoreMarker(storeDetails, stock);
		//bounds.extend(storeDetails.coords);

		//var inStockTable = document.getElementById("table_inStock"); 
		var row;
		if (selectedStoreId==storeDetails.id){
			row = inStockTable.insertRow(0);
		} else {
			row = inStockTable.insertRow(-1); // insert bottom row
		}
		row.insertCell(0).innerHTML = tableString(storeDetails, stock);
	});
}


function selectStore(id, goToPage){
	console.log(id);
	selectedStoreId = id;
	if (goToPage=="list"){
		refreshTable();
		listview();
		// go to top of list
		var tbls = document.getElementById('tables');
		tbls.scrollTop = 0;
	} if (goToPage=="map"){
		mapview();
		all_store_marker.forEach(function(marker){
			console.log (" "+marker.id+" actual "+id)
			if(marker.id==id){
				marker.select();
				//console.log ("selected "+marker.id+" actual "+id)
				//map.setCenter(marker.location);
			}
		})
		
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
	var id = storeDetails.id;

	var markerdetails = markerDetails(stock.message);
    var location = storeDetails.coords; // initial position of train

	// create store marker
	var marker = new google.maps.Marker({
		position: location,
		icon: markerdetails.icon,
		map: map,
		title: 'Store',
		zIndex: markerdetails.z
	});
	
    all_store_marker.push(this); // push the train to the train array
    this.id = id;
    this.location = storeDetails.coords;
    this.select = function () {
    	map.setCenter(location);
    	closeIW(); // close all info infowindows
		infoWindow.openWindow(); // open this infowindow
		map.setZoom(14);
    };
    
    this.getMarker = function () {
    	return marker;
    };
    this.setPosition = function (pos) {
    	marker.setPosition(pos);
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

	getStore = function () { // button on infowindow function
        return storeDetails; // reset the train alarm
    }
    return contentString;
}

function tableString(storeDetails, stock) {
	var openinghoursString = '<pre class="p2">';
	var dayhrs = storeDetails.opening.split(',');
	dayhrs.forEach(function(hrs){
		openinghoursString += hrs + "<br/>"
	})
	openinghoursString +=  "</pre>"
	// html content of the table
	var contentString = '<div class="tableRow">' +
		'<div class="left">' +
			'<p class="p1">'+
			storeDetails.name + '<br />' + 
			'<p class="p2">'+
			storeDetails.address +'</p>' +
			'<p class="p1">'+
			stock.message + '</p>' +
			'<button type="button" onclick=selectStore("' + storeDetails.id + '")>View on Map</button>' + 
			'<button type="button" onclick=selectStore("' + storeDetails.id + '","map")>View on Map</button>' + 
		'</div>' +
		'<div class="right">' + 
			'<p class="p2">'+
			openinghoursString + '</p>' + 
		'</div>' +
	'</div>';
	
	getStore = function () { // button on infowindow function
        return storeDetails; // reset the train alarm
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
		return {"count":"2" ,"message":"Limited Stock"};
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
		case "id8":
		return {"count":"30" ,"message":"In Stock"};
		break;
		case "id9":
		return {"count":"0" ,"message":"Not Available"};
		break;
		case "id10":
		return {"count":"30" ,"message":"In Stock"};
		break;
		case "id11":
		return {"count":"0" ,"message":"Available in 2-3 Days"};
		break;
		case "id12":
		return {"count":"0" ,"message":"In Stock"};
		break;
		case "id13":
		return {"count":"1" ,"message":"Limited Stock"};
		break;
		case "id14":
		return {"count":"30" ,"message":"In Stock"};
		break;
		default:
		return {"count":"0" ,"message":"No Stock Information"};
		break;
	}
}

var stores = [];

function getStoreDetails(){
	var openinghours = "Monday:\t\t10:00am-7:00pm,Tuesday:\t\t10:00am-7:00pm,Wednesday:\t10:00am-7:00pm,Thursday:\t\t10:00am-7:00pm,Friday:\t\t\t10:00am-9:00pm,Saturday:\t\t10:00am-9:00pm,Sunday:\t\t11:00am-5:00pm";
	s1 = {"id":"id1", "name":"PERTH MYER", "coords":{"lat":-31.953317, "lng":115.860819}, "address":"D200 Murray Street, PERTH, 6000 WA", "opening":openinghours}
	s2 = {"id":"id2", "name":"PERTH DJ", "coords":{"lat":-31.954218, "lng":115.859006}, "address":"Hay Street, PERTH, 6000 WA", "opening":openinghours}
	s3 = {"id":"id3", "name":"PERTH ENEX", "coords":{"lat":-31.954327, "lng":115.857064}, "address":"Shop H113, Enex 100, 100 St Georges Terrace, Perth, 6000 WA", "opening":openinghours}
	s4 = {"id":"id4", "name":"MORLEY MYER", "coords":{"lat":-31.897776, "lng":115.901813}, "address":"Collier Rd, Morley, 6062 WA", "opening":openinghours}
	s5 = {"id":"id5", "name":"GARDEN CITY DJ", "coords":{"lat":-32.033744, "lng":115.835483}, "address":"125 Risely Street, BOORAGOON, 6154 WA", "opening":openinghours}
	s6 = {"id":"id6", "name":"KARRINYUP DJ", "coords":{"lat":-31.877492, "lng":115.776409}, "address":"Karrinyup Road, KARRINYUP, 6018 WA", "opening":openinghours}
	s7 = {"id":"id7", "name":"SYDNEY DJ", "coords":{"lat":-33.869981, "lng":151.210067}, "address":"86 - 108 Castlereagh St, SYDNEY, 2000 NSW", "opening":openinghours}
	s8 = {"id":"id8", "name":"SYDNEY WESTFIELD", "coords":{"lat":-33.869893, "lng":151.208841}, "address":"Shop 2042 Westfield Sydney, 188 Pitt Street, SYDNEY, 2000 NSW", "opening":openinghours}
	s9 = {"id":"id9", "name":"SYDNEY MYER", "coords":{"lat":-33.870270, "lng":151.206966}, "address":"436 George St, SYDNEY, 2000 NSW", "opening":openinghours}
	s10 = {"id":"id10", "name":"QVB", "coords":{"lat":-33.871473, "lng":151.206676}, "address":"Shops 10 & 12, Ground Floor, Queen Victoria Building, George St, SYDNEY, 2000 NSW", "opening":openinghours}
	s11 = {"id":"id11", "name":"BROADWAY", "coords":{"lat":-33.883443, "lng":151.193934}, "address":"Shop 310, Broadway Shopping Centre, Broadway Shopping Centre, GLEBE, 2037 NSW", "opening":openinghours}
	s12 = {"id":"id12", "name":"GREENWOOD", "coords":{"lat":-33.839246, "lng":151.207087}, "address":"Shop P34, Greenwood Plaza, 90 Pacific Hwy, NORTH SYDNEY, 2060 NSW", "opening":openinghours}
	s13 = {"id":"id13", "name":"BONDI", "coords":{"lat":-33.891277, "lng":151.250876}, "address":"Shop 3038, Westfield Bondi Junction, 500 Oxford St, BONDI JUNCTION, 2022 NSW", "opening":openinghours}
	s14 = {"id":"id14", "name":"DOMESTIC AIRPORT", "coords":{"lat":-33.935519, "lng":151.166057}, "address":"Shop 13, Qantas Domestic Terminal 3, Keith Smith Ave, Sydney Airport, 2020 NSW", "opening":openinghours}
	//s1 = {"id":"id1", "name":"name", "coords":{"lat":000000, "lng":000000}, "address":"aaaaaaa", "opening":openinghours}
	//s1 = {"id":"id1", "name":"name", "coords":{"lat":000000, "lng":000000}, "address":"aaaaaaa", "opening":openinghours}



	stores.push(s1);
	stores.push(s2);
	stores.push(s3);
	stores.push(s4);
	stores.push(s5);
	stores.push(s6);
	stores.push(s7);
	stores.push(s8);
	stores.push(s9);
	stores.push(s10);
	stores.push(s11);
	stores.push(s12);
	stores.push(s13);
	stores.push(s14);
	//stores.push(s1);


}


