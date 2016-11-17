// cartItems is an array of SKUs

var popupConfig, // the details from the config file for popup customization
branchId, 
sessionId,
	popupInitialized, // has the popup been initialized
	storesInitialized, // have the stores been initialized
	currentView, // current view of popup is either 'map' or 'list'
	stores = [], // list of JSON store details
	selectedStore, // JSON of selected store id and details
	map, // the google map
	mapStoreMarkers = [],
	mapOpenedIW, // the infowindow that is currently open
	mapBounds, // the bound for the map when first opened
	mapInitialized, // true after the map has been opened for the first time and resized
	mapCurrentLocationMarker, // marker for the current location of the user
	test;


/*
 * 
 */
 function getConfigFile (branchId){
	// Config file allows per-branchId config of:
	// Which of nav icons to show
	// Start in map or list view?
	// Sprite for the map pointers
	// Colour and font for header/footer
	// All text strings for localisations

	// JSON standard is to use "double quotes" for strings
	// mapView (0,1) whether to show the mapview
	// listView (0,1) whether to show the listview
	// defaultView ("map","list") which view to show when the popup is opened
	// iconNearby (0,1) whether to show the nearby icon
	// bgColor (css: background-color) backgroud color of the popup
	// fgColor (css: color) foreground color of the popup (text color)
	// fontFamily (css: font-family) font of the popup
	// mapPointer.anchor ("top","bottom","left","right","center") where to anchor the pointer to the map
	// mapPointer.default (url) url to for the marker image before stock is known
	// mapPointer.green,amber,reg (url) url to the image used for each type of marker
	// currentLocationPointer (url) url to the image for the users current location

	if (branchId == "id123"){
		return {mapView:1, listView:1, defaultView:"map", iconNearby:true, bgColor:"black", fgColor:"white", fontFamily:"'Source Sans Pro', 'Helvetica Neue', Helvetica, Arial, sans-serif",
		mapPointer:{anchor: "bottom", default:"images/markergreen.png", green:"images/markergreen.png", amber:"images/markeramber.png", red:"images/markerred.png"}, currentLocationPointer:"images/currentLocation.png"};
	} else {
		return {mapView:1, listView:1, defaultView:"list", iconNearby:false, bgColor:"blue", fgColor:"red", fontFamily:"'Times New Roman', Helvetica, Arial, sans-serif",
		mapPointer:{anchor: "middle", default:"images/markergreen.png", green:"images/markergreen.png", amber:"images/markeramber.png", red:"images/markerred.png"}};
	}
}

/*
 * branchId is a “virtual branch” used to identify the client website, and pick up the config file. 
 * sessionId is a website Id that’s used as a temporary Purecomm order number, until the actual order number is allocated 
 * (eg. Could use Magneto quoteId)
 */
 function purecommClickAndCollectInit(branchId, sessionId) {
 	if (!popupInitialized) {
 		this.branchId = branchId;
 		this.sessionId = sessionId;

		// global popup initialization
		popupConfig = getConfigFile(branchId);
		console.log(popupConfig);
		var head = document.getElementsByTagName('head')[0];
		var body = document.getElementsByTagName('body')[0];

		// load css file
		var modalCSS  = document.createElement('link');
		modalCSS.type = 'text/css';
		modalCSS.rel = 'stylesheet';
		modalCSS.href = 'purecommClickAndCollect.css';
		head.appendChild(modalCSS);

	    // create modal html
	    var modal = document.createElement('div');
	    modal.id = 'purecommModal';
	    modal.className = 'purecommModal';

	    modal.onclick = function(event) {
	    	if (event.target == purecommModal) {
				purecommModal.style.display = "none"; // close modal if  user clicks outside of it
			}
		}

		var modalHTML =	'<div class="purecommModalContent" id="purecommModalContent">' +
		'<div class="purecommModalHeader" id="purecommModalHeader">' +
		'<span class="modalHead" id="modalHead">Modal Header</span>' +
		'<img class="close" src="images/close1.png" alt="" onclick="closeModal()" />' +
		'</div>' +
		'<div class="purecommModalBody" id="purecommModalBody"></div>' +
		'<div class="purecommModalFooter" id="purecommModalFooter">' +
		'<div class="mapdiv">' +
		'<span>Nearby</span>' +
		'<img src="images/gps.png" alt="" onclick="locateUser()" />' +
		'</div>' +
		'<div class="searchdiv">' +
		'<span class="searchtxt" id="searchtxt" onclick="showSearch()">Search</span>' +
		'<input class="searchbox" id="searchbox" type="text">' +
		'<img class="searchicon" id="searchicon" src="images/search.png" alt="" onclick="search()" />' +
		'</div>' +
		'</div>' +
		'</div>';

		modal.innerHTML = modalHTML;
		body.appendChild(modal);

		//TODO change CSS based on config
		//console.log(body);
		var purecommModalContent = document.getElementById('purecommModalContent');
	    if (popupConfig.fgColor) purecommModalContent.style.color = popupConfig.fgColor;
	    if (popupConfig.bgColor) purecommModalContent.style.backgroundColor = popupConfig.bgColor;
	    if (popupConfig.fontFamily) purecommModalContent.style.fontFamily = popupConfig.fontFamily;

		// initialize the map and list view based on popupConfig
		if(popupConfig.defaultView == "list"){ // default view is list
			listInit(1);
			if(popupConfig.mapView){
				mapInit(0);
			}
		} else { // default view is map or undefined
			popupConfig.defaultView == "map"; // map is default view if not defined
			mapInit(1);
			if(popupConfig.listView){
				listInit(0);
			}
		}

		popupInitialized = true;
	}
}

/*
 *
 */
 function listInit (defaultView){
 	popupConfig.listView = 1;

 	var modalBody = document.getElementById('purecommModalBody');
 	var modalFooter = document.getElementById('purecommModalFooter');
 	var bodyHTML =  '<div id="purecommTables" class="tables">' +
				 	'<table id="table_inStock" class="table"></table>' +
				 	'<table id="table_noStock" class="table"></table>' +
				 	'</div>';
 	var footerHTML ='<div class="listdiv">' +
				 	'<span>List</span>' +
				 	'<img class="view" id="listbtn" src="images/listview.png" alt="" onclick="showListView()" />' +
				 	'</div>';

 	modalBody.innerHTML += bodyHTML;
 	modalFooter.innerHTML += footerHTML;

 	if (defaultView){
 		currentView = 'list';
 		document.getElementById('purecommTables').style.display = "block";
 	}
 }

/*
 *
 */
 function mapInit (defaultView){
 	popupConfig.mapView = 1;

	// load google maps api and call initializeMap when complete
	var head = document.getElementsByTagName('head')[0];
	var script = document.createElement('script');
	script.src = "https://maps.googleapis.com/maps/api/js?key=AIzaSyD07c9hGOtQnuF30nwqml5OQkqzrPejIFs&callback=initializeMap";
	head.appendChild(script);

	var modalBody = document.getElementById('purecommModalBody');
	var modalFooter = document.getElementById('purecommModalFooter');
	var bodyHTML = 	'<div id="purecommMap" class="map"></div>';
	var footerHTML ='<div class="mapdiv">' +
					'<span>Map</span>' +
					'<img id="mapbtn" src="images/mapview.png" alt="" onclick="showMapView()" />' +
					'</div>';	

	modalBody.innerHTML += bodyHTML;
	modalFooter.innerHTML += footerHTML;

	if (defaultView){
		currentView = 'map';
		document.getElementById('purecommMap').style.display = "block";
	}


}

/*
 * when the google maps api is loaded, this method will run
 * map is defined 
 */
 function initializeMap() {
 	console.log("map being initialized");
 	map = new google.maps.Map(document.getElementById('purecommMap'), {
		zoom: 15,
		mapTypeId: google.maps.MapTypeId.ROADMAP,
		mapTypeControl: false // no option to change map type
	});
	google.maps.event.addListener(map, 'click', function () { // click on the map
		console.log(mapOpenedIW);
	    if(mapOpenedIW){
			mapOpenedIW.close(); // close IW
			mapOpenedIW = null; // no IW is open
		}
	});
}

/*
 * when the popup is opened for the first time, the store information is initialized
 * this function is called from 3 places, in 3 different ways
 * purecommFindAStorePopup	 		-->	storesInit()
 * purecommProductAvailabilityPopup	-->	storesInit(sku)
 * purecommCartAvailabilityPopup	-->	storesInit(cartItems)
 */
function storesInit(items){
	if (!storesInitialized){
		stores = getStores();

		mapBounds = new google.maps.LatLngBounds();
		var mv = popupConfig.mapView; // map view to be shown
		var lv = popupConfig.listView; // list view to be shown
		if (items){
			if (items.constructor == Array){
				// cartItems
				stores.forEach(function(store) {
					var availability = purecommGetCartAvailability(items, store);
					store['availability'] = availability;
					if(mv){
						new mapStoreMarker(store);
						mapBounds.extend(store.coords);
					}
					if (lv){
						populateTableRow(store); // table populated by default order, use populateTable("name") to sort alphabetically
					}
				});
			} else {
				// sku
				stores.forEach(function(store) {
					var availability = purecommGetSkuAvailability(items, store);
					store['availability'] = availability;
					if(mv){
						new mapStoreMarker(store);
						mapBounds.extend(store.coords);
					}
					if (lv){
						populateTableRow(store);
					}
				});
			}
		} else {
			// no sku or cart items
			stores.forEach(function(store) {
				if(mv){
					new mapStoreMarker(store);
					mapBounds.extend(store.coords);
				}
				if (lv){
					populateTableRow(store);
				}
			});
		}


		
		//if(stock.count>0){
		//	totalStoresWithStock ++;
		//}
		
		//document.getElementById('purecommModalHeader').innerHTML = "Item is stocked in "+totalStoresWithStock+" stores";
		//refreshTable();
		if(popupConfig.defaultView == "map"){ // default view is list
			showMapView();
		} else {
			showListView();
		}

		storesInitialized = true;
	}
}

showMapView = function (storeID){
	// change button colours
	var listbutton = document.getElementById('listbtn');
	listbutton.src ='images/listview.png';
	listbutton.style.backgroundColor = "black";
	var mapbutton = document.getElementById('mapbtn');
	mapbutton.src='images/mapview_inverted.png';
	mapbutton.style.backgroundColor = "white";

	document.getElementById("purecommTables").style.display = "none";
	//closeIW();
	document.getElementById("purecommMap").style.display = "block";

	if(!mapInitialized){
		google.maps.event.trigger(map,'resize');
		map.fitBounds(mapBounds);
		mapInitialized = 1;
	}

	if (storeID){
		mapStoreMarkers.forEach(function(marker){
			if(marker.getID()==storeID){
				marker.viewOnMap();
			}
		})
	}
}

showListView = function(storeID){
	// change button colours
	var mapbutton = document.getElementById('mapbtn');
	mapbutton.src='images/mapview.png';
	mapbutton.style.backgroundColor = "black";
	var listbutton = document.getElementById('listbtn');
	listbutton.src='images/listview_inverted.png';
	listbutton.style.backgroundColor = "white";

	document.getElementById("purecommMap").style.display = "none";
	document.getElementById("purecommTables").style.display = "block";


	if (storeID){
		var storeRow = document.getElementById(storeID);
		//var table = document.getElementById('tables');
		storeRow.scrollIntoView(true);
		//var tbls = document.getElementById('tables');
		//tbls.scrollTop = 0;
	}


	//("name"); // *** testing repopulate table by name

	//refreshTable();
}

/*
 * popup to find a store, with no stock information
 */
 function purecommFindAStorePopup(){
 	if (popupInitialized){
		// popup has been initialized
		// do stuff
 		document.getElementById('purecommModal').style.display = "block";
		storesInit();
		return true;
	} else {
		return false;
	}
}

/*
 * popup store selection map for a single SKU
 */
 function purecommProductAvailabilityPopup(sku){
 	if (popupInitialized){
		// popup has been initialized
		// do stuff
 		document.getElementById('purecommModal').style.display = "block";
		storesInit(sku);
		return true;
	} else {
		return false;
	}
}

/*
 * popup store selection map for one or more skus in the shopping cart (listed as a JSON array)
 */
 function purecommCartAvailabilityPopup(cartItems){
 	if (popupInitialized){
		// popup has been initialized
		// do stuff
		return true;
	} else {
		return false;
	}
}

/*
 * returns a JSON object with store name, store Id, opening hours, address etc.
 */
 function purecommGetSelectedStore (){
 	var cookie = getCookie("purecomm_selectedstore");
 	if (cookie) {
		return cookie; // stored as cookie
	} else if (selectedStore){
		return selectedStore; // stored as local variable
	} else {
		return ""; // not stored
	}
}

/*
 * returns a JSON array listing the skus from the cartItems that are available in the selected store
 */
 function purecommGetAvailableSkus (cartItems){
 	var store = purecommGetSelectedStore();
 	if (store){
 		var json = {};
 		cartItems.forEach(function(sku) {
			json[sku] = purecommGetSkuAvailability(sku, store); // add sku:availability to json
		});
 		return json;
 	} else {
		// no store has been selected
		return false;
	}
}

/*
 * 
 */
 function purecommGetSkuAvailability(sku, store){
	// allocate a temporary order Id
	// call FAPI create order for order Id
	// call FAPI storeavailability
	// call FAPI cancel order

	switch (store.id){
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

/*
 * 
 */
 function purecommGetCartAvailability(cartItems, store){
	// call FAPI status to see if order already created with orderId=sessionId
	// if not, call FAPI create order to create order
	// otherwise, call FAPI update to change SKUs in the basket (with shippingRelease blank; the order will be released when submitted)
	// call FAPI storeavailabilty

}

/*
 * store the selected store as a local variable and a cookie
 */
 function purecommSetSelectedStore(store){
	// set some local JS storage object that can persist between pages	
	selectedStore = store; // set local variable
	setCookie("purecomm_selectedstore",store,30); // set cookie
	var cookie = getCookie("purecomm_selectedstore");
	if (cookie==store && selectedStore==store) {
		return true; // success
	} else {
		return false; // failed
	}
}

function refreshAvailability(){

}

locateUser = function(){
  	// Try HTML5 geolocation.
  	if (navigator.geolocation) {
  		navigator.geolocation.getCurrentPosition(function(position) {
  			var pos = {
  				lat: position.coords.latitude,
  				lng: position.coords.longitude
  			};
  			map.setCenter(pos);
			if (!mapCurrentLocationMarker){
  				var markerImage = new google.maps.MarkerImage('images/currentLocation.png', // ** TODO take image from config file
                new google.maps.Size(30, 30), // size
                new google.maps.Point(0, 0), // origin
                new google.maps.Point(15, 15), // anchor (location on map)
                new google.maps.Size(30, 30)); // scaled size

	  			var marker = new google.maps.Marker({
	  				map: map,
	  				position: pos,
	  				icon: markerImage
	  			});
	  			mapCurrentLocationMarker = marker;
  			} else {
  				mapCurrentLocationMarker.setPosition(pos);
  			}

  			getStoreDistances(pos); // get the distance between each store and this postion

  		}, function() {
  			handleLocationError(true, infoWindow, map.getCenter());
  		});
  	} else {
    	// Browser doesn't support Geolocation
    	handleLocationError(false, infoWindow, map.getCenter());
    }
}

/*
 * find disance between a point and each store
 * referencePoint is either current location or a searched location
 */
function getStoreDistances(referencePoint){
	// get distances
	stores.forEach(function(store) {
		store['distance'] = distanceBetweenPoints(referencePoint, store.coords);
	});

	// resort the table
	populateTable("distance");


	// Haversine formula
	function distanceBetweenPoints(p1, p2){
		var radians = function(x) {
			return x * Math.PI / 180;
		};
		
		var R = 6378137; // Earth’s mean radius in meter
		var dLat = radians(p2.lat - p1.lat); // lat distance
		var dLng = radians(p2.lng - p1.lng); // lng distance
		var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
			Math.cos(radians(p1.lat)) * Math.cos(radians(p2.lat)) *
			Math.sin(dLng / 2) * Math.sin(dLng / 2);
		var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
		var d = R * c;
		return d; // returns the distance in meter
	}

}





function populateTable(sortBy){
	console.log(stores);
	// sort the stores
	if (sortBy == "name"){
		stores.sort(function(a,b){
	   		if(a.name < b.name) return -1;
	    	if(a.name > b.name) return 1;
	    	return 0;})
	} else if (sortBy == "distance"){
		stores = stores.sort(function(a,b){return a.distance - b.distance})
	}
	console.log(stores);

	// repopulate table
	document.getElementById("table_inStock").innerHTML = "";
	stores.forEach(function(store) {
		populateTableRow(store);
	});
}

function populateTableRow(store){
	var inStockTable = document.getElementById("table_inStock");
	var noStockTable = document.getElementById("table_noStock");


	//console.log(storeDetails);
	//var stock = getStockCount(storeDetails.id);

	//new StoreMarker(storeDetails, stock);
	//bounds.extend(storeDetails.coords);

	//var inStockTable = document.getElementById("table_inStock"); 
	var row;
	if (selectedStore){
		if(selectedStore.id==store.id){
			row = inStockTable.insertRow(0);
		} 
	} else {
		row = inStockTable.insertRow(-1); // insert bottom row
	}
	row.insertCell(0).innerHTML = tableString(store);

}

function tableString(store, stock) {
	var openinghoursString = '<pre class="p2">';
	var dayhrs = store.opening.split(',');
	dayhrs.forEach(function(hrs){
		openinghoursString += hrs + "<br/>"
	})
	openinghoursString +=  "</pre>"
	// html content of the table
	var contentString = '<div class="tableRow" id="' + store.id + '" >' +
		'<div class="left">' +
			'<p class="p1">'+
			store.name + '<br />' + 
			'<p class="p2">'+
			store.address +'</p>' +
			'<p class="p1">'+
			'stock.message' + '</p>' +
			'<button type="button" onclick=selectStore("' + store.id + '","")>Select Store</button>' + 
			'<button type="button" onclick=showMapView("' + store.id + '","map")>View on Map</button>' + 
		'</div>' +
		'<div class="right">' + 
			'<p class="p2">'+
			openinghoursString + '</p>' + 
		'</div>' +
	'</div>';
	
	getStore = function () { // button on infowindow function
        return store; // reset the train alarm
    }
    return contentString;
}


function mapStoreMarker(store) {
	var markerIcon,
	markerZ;
	var availability = store.availability;

	var id = store.id;
	if (availability){
		var markerdetails = getMarkerDetails(availability);
		markerIcon = markerdetails.icon;
		markerZ = markerdetails.z;
	} else {
		// no availabilty information show
		markerIcon = popupConfig.mapPointer.default;
		markerZ = 3;
	}
    var location = store.coords; // initial position of train

	// create store marker
	var marker = new google.maps.Marker({
		map: map,
		position: location,
		icon: markerIcon,
		title: store.name, // tooltip
		zIndex: markerZ
	});
	
    var markerIW  = new google.maps.InfoWindow({
        	//content: contentString
        });
    var infowindowString = iwString(store, availability);
	markerIW.setContent(infowindowString);

    this.select = function () {
    	map.setCenter(location);
    	openIW();
		map.setZoom(14);
	};
	this.getID = function (){
		return id;
	}
	this.marker = function () {
		return marker;
	};
	this.getPosition = function () {
		return marker.getPosition();
	}
	this.setIcon = function (icon) {
		return marker.setIcon(icon);
	}
	this.viewOnMap = function(){
		map.setCenter(marker.getPosition());
		map.setZoom(14);
		openIW();
	}

	google.maps.event.addListener(marker, 'click', function () {
		if (isInfoWindowOpen()) {
			// infowindow is open
            closeOpenedIW(); // close this IW
        } else {
            // infowindow is closed
			openIW();
		}
	});

	function isInfoWindowOpen() {
		// check to see if the info window is open (on the map)
		var map = markerIW.getMap();
		return (map !== null && typeof map !== "undefined");
	}

	function openIW(){
		closeOpenedIW();
		markerIW.close(map, marker); // close this IW
	    markerIW.open(map, marker); // open this IW
		mapOpenedIW = markerIW; // set this IW to the opened IW
	}

	function closeOpenedIW(){
		if(mapOpenedIW){
			mapOpenedIW.close(); // close the opened IW
			mapOpenedIW = null; // no IW is open
		}
	}

    mapStoreMarkers.push(this); // push the marker
}



function iwString(store, availability) {

	// html content of the infowindow
	var contentString = '<div class="iwContent">' +
	'<p class="p1">'+
	store.name + '</p>' +
	'<p class="p2">'+
	store.address + '</p>' +
	'<p class="p1">'+
	availability + '</p>' +
	'<button type="button" onclick=selectStore("' + store.id + '","")>Select Store</button>' + 
	'<button type="button" onclick=showListView("' + store.id + '","list")>View Opening</button>' + 
	'</div>';

	getStore = function () { // button on infowindow function
        return store; // reset the train alarm
    }
    return contentString;
}


function getStores (){
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

	return stores;
}

function getMarkerDetails(availability){
	var stockmessage = availability.message;
	switch (stockmessage){
		case "In Stock":
		return {"icon":popupConfig.mapPointer.green, "z":10};
		break;
		case "Limited Stock":
		return {"icon":popupConfig.mapPointer.amber, "z":9};
		break;
		case "Some Items Available":
		return {"icon":popupConfig.mapPointer.amber, "z":8};
		break;
		case "Available in 2-3 Days":
		return {"icon":popupConfig.mapPointer.amber, "z":7};
		break;
		case "Not Available":
		return {"icon":popupConfig.mapPointer.red, "z":6};
		break;
		default:
		return {"icon":popupConfig.mapPointer.red, "z":5};
		break;
	}
}

/*
 * Cookie functionality
 * cname: name of cookie
 * cvalie: value of cookie
 * exdays: days until the cookie expires
 */
 function setCookie(cname,cvalue,exdays) {
 	var d = new Date();
    d.setTime(d.getTime() + (exdays*86400000)); // 86400000=24*60*60*1000
    var expires = "expires=" + d.toGMTString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}
function getCookie(cname) {
	var name = cname + "=";
	var ca = document.cookie.split(';');
	for(var i = 0; i < ca.length; i++) {
		var c = ca[i];
		while (c.charAt(0) == ' ') {
			c = c.substring(1);
		}
		if (c.indexOf(name) == 0) {
			return c.substring(name.length, c.length);
		}
	}
    return false; // return false if the cookie does not exist 
}
function deleteCookie(cname) {
	setCookie(cname,"",-1);
}