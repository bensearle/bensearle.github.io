// cartItems is an array of SKUs

var popupConfig, // the details from the config file for popup customization
	branchId, // a “virtual branch” used to identify the client website, and pick up the config file. 
	sessionId, // a website Id that’s used as a temporary Purecomm order number, until the actual order number is allocated
	popupInitialized, // has the popup been initialized
	storesInitialized, // have the stores been initialized
	currentItems, // sku or cartItems for availability
	availabilityInitialized, 
	currentView, // current view of popup is either 'map' or 'list'
	//stores = [], // list of JSON store details
	selectedStore, // JSON of selected store id and details
	map, // the google map
	mapStoreMarkers = [],
	mapOpenedIW, // the infowindow that is currently open
	mapBounds, // bounds initially contains all stores, then contain location and some stores
	mapInitialized, // true after the map has been opened for the first time and resized
	mapCurrentLocationMarker, // marker for the current/searched location of the user
	searchRefresh, // true if the user has searched and the map needs bounds set/table top row needs to be in view
	test;

var purecommFAPI, // instance of the FAPI interface
	purecommItems, // array for skus
	purecommOrderNumber, // order number for this session
	purecommStores, // array of stores
	purecommHostParam = "uat", // 
	purecommMapSearchBox, // google places search box
	purecommSelectedStoreID, // store id that has been selected
	purecommCallback, // function to be called when a store is selected purecommCallback(storeId);
	testttt;


/*
 * function that runs when the purecommFAPIjsInterface.js is loaded
 */
 function purecommFAPIjsInterfaceLoaded(){
	//purecommFAPI = new purecommFAPIjsInterface('XQ1XA6', 'password57', 'uat');
	//purecommFAPI = new purecommFAPIjsInterface('67ZQJH', 'password57', 'uat');
	purecommFAPI = new purecommFAPIjsInterface('JZLDKH', 'rmw88', 'uat');
}

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

	var defaultConfiguration = { "locator": {
		"defaultView": "map",
		"mapView": "1",
		"listView": "1",
		"css": {
			"fontFamily": "\u0027Source Sans Pro\u0027, \u0027Helvetica Neue\u0027, Arial, sans-serif",
			"colors": {
				"bodyBG": "#ffffff",
				"modalBG": "#000000",
				"bodyFG": "#000000",
				"modalFG": "#ffffff"
			}
		},
		"iconNearby": "true",
		"icons": {
			"map": "https://" + purecommHostParam + ".purecomm.hk/en/map_popup/v2/images/mapview_white.png",
			"mapSelected": "https://" + purecommHostParam + ".purecomm.hk/en/map_popup/v2/images/mapview_black.png",
			"list": "https://" + purecommHostParam + ".purecomm.hk/en/map_popup/v2/images/listview_white.png",
			"listSelected": "https://" + purecommHostParam + ".purecomm.hk/en/map_popup/v2/images/listview_black.png",
			"search": "https://" + purecommHostParam + ".purecomm.hk/en/map_popup/v2/images/search_black.png",
			//"nearby": "https://" + purecommHostParam + ".purecomm.hk/en/map_popup/v2/images/gps_white.png",
			"close": "https://" + purecommHostParam + ".purecomm.hk/en/map_popup/v2/images/close_white.png"
		},
		"map": {
			"searchedLocation": "https://" + purecommHostParam + ".purecomm.hk/en/map_popup/v2/images/search_black.png",
			"store": {
				"red": "https://" + purecommHostParam + ".purecomm.hk/en/map_popup/v2/images/markerred.png",
				"default": "https://" + purecommHostParam + ".purecomm.hk/en/map_popup/v2/images/markergreen.png",
				"green": "https://" + purecommHostParam + ".purecomm.hk/en/map_popup/v2/images/markergreen.png",
				"amber": "https://" + purecommHostParam + ".purecomm.hk/en/map_popup/v2/images/markeramber.png"
			},
			"currentLocation": "https://" + purecommHostParam + ".purecomm.hk/en/map_popup/v2/images/currentLocation.png"

		}
	}}

	//var configuration = updateConfig(defaultConfiguration,getConfig(branchId));
	var configuration = defaultConfiguration.locator;

	var cssConfig = ':root {' + 	
	'--purecommFontFamily: ' + configuration.css.fontFamily + ';' +
	'--purecommModalBG: ' + configuration.css.colors.modalBG + ';' +
	'--purecommModalFG: ' + configuration.css.colors.modalFG + ';' +
	'--purecommBodyBG: ' + configuration.css.colors.bodyBG + ';' +
	'--purecommBodyFG: ' + configuration.css.colors.bodyFG + ';' +
	'}';
	var node = document.createElement('style');
	node.innerHTML = cssConfig;
	document.body.appendChild(node);

	return configuration;

	// copy data from newConfig to ogConfig
	function updateConfig (ogconfig,newConfig){
		console.log(newConfig);
		for (var attribute in newConfig) {
			var value = newConfig[attribute]; // value for the attribute
			if (value !== null && value !== "" ){
				if (typeof value === 'object'){
					// value is an object, recurcively call this method
					updateConfig(ogconfig[attribute],newConfig[attribute]);
				} else {
					ogconfig[attribute] = value;
				}
			}
		}
		return ogconfig;
	}

	function getConfig (branchId){
		// TODO get the config file from the server
	}
}

/*
 * branchId is a “virtual branch” used to identify the client website, and pick up the config file. 
 * sessionId is a website Id that’s used as a temporary Purecomm order number, until the actual order number is allocated 
 * (eg. Could use Magneto quoteId)
 */
 function purecommClickAndCollectInit(branchId, sessionId) {
 	console.log(createUUID());

 	console.log(document.cookie);
 	var ccc = getCookie("document.cookie");
 	console.log(ccc);

 	if (!popupInitialized) {
 		this.branchId = branchId;
 		this.sessionId = sessionId;

		// global popup initialization
		popupConfig = getConfigFile(branchId);
		console.log(popupConfig);
		var head = document.getElementsByTagName('head')[0];
		var body = document.getElementsByTagName('body')[0];

		var hostExtension = "/en/map_popup/v2/"
		//var	purecommHost = "https://purecomm.hk" + hostExtension; // uat is default host
		var	purecommHost = "https://uat.purecomm.hk" + hostExtension; // uat is default host
		//if(hostParam == "pp") {
		//	host = "https://pp.purecomm.hk" + hostExtension;
		//} else if(hostParam == "prod") {
		//	host = "https://www.purecomm.hk" + hostExtension;
		//} 

		// load css file
		var modalCSS  = document.createElement('link');
		modalCSS.type = 'text/css';
		modalCSS.rel = 'stylesheet';
		modalCSS.href = 'purecommClickAndCollect.css';
		//modalCSS.href = purecommHost + 'purecommClickAndCollect.css';
		head.appendChild(modalCSS);

		var head = document.getElementsByTagName('head')[0];	
		fapiScript = document.createElement('script');
		fapiScript.type = 'text/javascript';
		fapiScript.src = purecommHost + 'purecommFAPIjsInterface.js';
		//fapiScript.src =  'purecommFAPIjsInterface.js'; //todo change back
		head.appendChild(fapiScript);

		// create modal html
		var modal = document.createElement('div');
		modal.id = 'purecommModal';
		modal.className = 'purecommModal';

		modal.onclick = function(event) {
			if (event.target == purecommModal) {
				purecommModal.style.display = "none"; // close modal if  user clicks outside of it
				console.log("closing modal");
			}
		}

		var modalHTML =	'<div class="purecommModalContent" id="purecommModalContent">' +
		'<div class="purecommModalHeader" id="purecommModalHeader">' +
		'<span class="modalHead" id="modalHead">Select A Store</span>' +
		'<img class="close" src="'+popupConfig.icons.close+'" alt="" onclick="closeModal()" />' +
		'</div>' +
		'<div class="purecommModalBody" id="purecommModalBody"></div>' +
		'<div class="purecommModalFooter" id="purecommModalFooter">' +

		'</div>' +
		'</div>';

		closeModal = function(){purecommModal.style.display = "none";}
		modal.innerHTML = modalHTML;
		body.appendChild(modal);

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

		var modalFooter = document.getElementById('purecommModalFooter');

		modalFooter.innerHTML += /*'<div class="mapdiv">' +
		'<span>Nearby</span>' +
		'<img src="' + popupConfig.icons.nearby + '" alt="" onclick="findLocation()" />' +
		'</div>' +*/
		'<div class="searchdiv">' +
		'<img class="searchicon" id="searchicon" src="' + popupConfig.icons.search + '" alt="" onclick="search()" />' +
		//'<span class="searchtxt" id="searchtxt" onclick="showSearch()">Search</span>' +
		'<input class="searchbox" id="searchbox" type="text" placeholder="Search">' +
		'</div>';

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
 	var footerHTML ='<div class="listdiv" id="listdiv" onclick="showListView()">' +
 	'<span>List</span>' +
 	'<img class="view" id="listbtn" src="' + popupConfig.icons.list + '" alt="" />' +
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
	script.src = "https://maps.googleapis.com/maps/api/js?key=AIzaSyD07c9hGOtQnuF30nwqml5OQkqzrPejIFs&libraries=places&callback=initializeMap";
	head.appendChild(script);

	var modalBody = document.getElementById('purecommModalBody');
	var modalFooter = document.getElementById('purecommModalFooter');
	var bodyHTML = 	'<div id="purecommMap" class="map"></div>';
	var footerHTML ='<div class="mapdiv" id="mapdiv" onclick="showMapView()">' +
	'<span>Map</span>' +
	'<img id="mapbtn" src="' + popupConfig.icons.map + '" alt=""  />' +
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
 	map = new google.maps.Map(document.getElementById('purecommMap'), {
 		styles: [{ featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }]}], // remove points of interest
 		clickableIcons: false, // disable google's clickable items and stop their infowindows appearing
 		zoom: 15,
 		mapTypeId: google.maps.MapTypeId.ROADMAP,
		mapTypeControl: false // no option to change map type
	});
	google.maps.event.addListener(map, 'click', function () { // click on the map
		if(mapOpenedIW){
			mapOpenedIW.close(); // close IW
			mapOpenedIW = null; // no IW is open
		}
	});


	google.maps.event.addListenerOnce(map, 'tilesloaded', function(){

		var gmnoprint = document.getElementsByClassName('gmnoprint')[0];
		var span = gmnoprint.firstChild.getElementsByTagName('span')[0];
		span.innerHTML += ", PureComm";
		span.setAttribute("id", "googlemapscopyright");
		span.addEventListener('change', bb, false);
		var bb = function(){console.log("[][][][][][][][][][][][][]");}
		var width = gmnoprint.clientWidth += 55;
		//gmnoprint.setAttribute("style","width:"+width+"px");
		gmnoprint.style.width = width+"px";
		//gmnoprint.style.position = "absolute";
		gmnoprint.style.display = "block";

//z-index: 1000001; position: absolute; right: 0px; bottom: 0px; width: 205px;
//width: 205px; display: block; right: 0px; bottom: 0px;
		console.log("***********BEN",gmnoprint.clientWidth);
		console.log("***********123",gmnoprint);

		var div = gmnoprint.firstChild;
		var div1 = gmnoprint.firstChild.getElementsByTagName('span')[0].innerHTML;
		var span = div.getElementsByTagName('span');
		//document.getElementsByTagName('gmnoprint');
		console.log("***********",div1,span[0].innerHTML);
		//document.getElementsByTagName('gmnoprint');

	});	
}


/*
 * when the popup is opened for the first time, the store information is initialized
 * this function is called from 3 places, in 3 different ways
 * purecommFindAStorePopup	 		-->	purecommOpenModal()
 * purecommProductAvailabilityPopup	-->	purecommOpenModal(sku)
 * purecommCartAvailabilityPopup	-->	purecommOpenModal(cartItems)
 */
 function purecommOpenModal_(){
 	//console.log(stores);
	var mv = popupConfig.mapView; // map view to be shown
	var lv = popupConfig.listView; // list view to be shown
	document.getElementById('purecommModal').style.display = "block"; // open the model

 	if (!storesInitialized){ // if stores aren't itialized
 		//stores = getStores(); // get information on all stores
	 	if (mv) {
 			mapBounds = new google.maps.LatLngBounds(); // bounds for the initial view of the map

 			purecommStores.forEach(function(store) {
	 			var lat = parseFloat(store.latitude), lng = parseFloat(store.longitude);
 				if (store.longitude=="" || store.longitude=="" || typeof lat == "undefined" && typeof lng == "undefined"){
 					var storeString =  store.storeAddress.replace(/[^A-Z0-9]+/ig, "+"); // regex ^:not +:match-multiple i:case-insensitive g:global-match
 					purecommFAPI.ajax({
						type: "GET",
						url: "https://maps.googleapis.com/maps/api/geocode/json?address=" + storeString + "&key=AIzaSyD07c9hGOtQnuF30nwqml5OQkqzrPejIFs",
						dataType: "application/x-www-form-urlencoded", 
						authorization: null,
						success: function (response) {
							if(response.status="OK"){
								if(response.results.length>0){
 									console.log(",,,,"+store.storeId+","+response.results[0].geometry.location.lat+","+response.results[0].geometry.location.lng+",,,,");
									coords = response.results[0].geometry.location;
									store['coords'] =  coords;
									new mapStoreMarker(store); // create map marker for every store
									mapBounds.extend(coords); // extend bounds to show the marker
									map.fitBounds(mapBounds);
								} else {
									console.info("Geocode could not find the address, ignoring store",response,store);
									removeItem(purecommStores, store); // remove this store
								}
							} else {
								console.info("Geocode status is no \"OK\", ignoring store",response,store);
								removeItem(purecommStores, store); // remove this store
							}
						},
						error: function (response) {
							console.error("Geocode returned an error, ignoring store",response,store);
							removeItem(purecommStores, store); // remove this store
						}
					});

 					//getCoordsFromAddress();
 					if (store.storeAddress){
 						store.storeAddress
 					} else delete purecommStores[indexOf(store)]; //delete purecommStores.store; // remove this store
 				} else {
 					coords = {"lat":lat,"lng":lng};
 					store['coords'] =  coords;
					new mapStoreMarker(store); // create map marker for every store
					mapBounds.extend(coords); // extend bounds to show the marker
				}
			});

			// google maps search
			var input = document.getElementById('searchbox');

			purecommMapSearchBox = new google.maps.places.SearchBox(input);
			purecommMapSearchBox.setBounds(mapBounds); // search the location of the origninal map bounds
			purecommMapSearchBox.addListener('places_changed', searchLocation);
		}
	}



	function searchLocation(address){
		var places = purecommMapSearchBox.getPlaces();
		if (places.length == 0) {
			return;
		}
		// For each place, get the icon, name and location.
		//var bounds = new google.maps.LatLngBounds();
		places.forEach(function(place) {
			if (!place.geometry) {
				console.log("Returned place contains no geometry");
				return;
			}
			console.log("*****PLACE",place);
			findLocation(place.geometry.location,place.geometry.viewport);
		});
	}
	




	if(mv && storesInitialized){
		mapStoreMarkers.forEach(function(marker){
			marker.update(); 
		});
	}

	if (lv){
		//TO DO if distance is known
		if (purecommStores[0].distance){ // check first store to see if distance is known
			populateTable("distances"); // table populated by default order, use populateTable("name") to sort alphabetically

		} else {
			populateTable("name"); // table populated by default order, use populateTable("name") to sort alphabetically
		}
	}
	
	//if(stock.count>0){
	//	totalStoresWithStock ++;
	//}
	
	//document.getElementById('purecommModalHeader').innerHTML = "Item is stocked in "+totalStoresWithStock+" stores";
	//refreshTable();
	if(popupConfig.defaultView == "map"){
		showMapView();
	} else {
		showListView();
	}

	storesInitialized = true;
}


function removeItem(array, item) {
	for(var i = array.length; i--;) {
		if(array[i] === item) {
			array.splice(i, 1);
		}
	}
}

/*
 * function to display the map view
 * storeID is given if there 
 */
 function showMapView(storeID){
	// change button colours
	document.getElementById('listbtn').src = popupConfig.icons.list;
	document.getElementById('listdiv').style.color = popupConfig.css.colors.modalFG;
	document.getElementById('listdiv').style.backgroundColor = popupConfig.css.colors.modalBG;
	document.getElementById('mapbtn').src=popupConfig.icons.mapSelected;
	document.getElementById('mapdiv').style.color = popupConfig.css.colors.modalBG;
	document.getElementById('mapdiv').style.backgroundColor = popupConfig.css.colors.modalFG;

	document.getElementById("purecommTables").style.display = "none";
	//closeIW();
	document.getElementById("purecommMap").style.display = "block";

	if(!mapInitialized){
		google.maps.event.trigger(map,'resize');
		map.fitBounds(mapBounds);
		mapInitialized = 1;
		findLocation();

		//smoothZoom (12, map.getZoom())
	}

	if (storeID){
		mapStoreMarkers.forEach(function(marker){
			if(marker.getID()==storeID){
				marker.viewOnMap();
			}
		})
	}

	if(searchRefresh){
		map.fitBounds(mapBounds);
		searchRefresh = false;
	}
}

/*
// the smooth zoom function
function smoothZoom (max, cnt) {
	if (cnt > max) {
		return;
	}
	else {
		map.setCenter({"lat":-31.953317, "lng":115.860819});
		console.log("zoom "+cnt);
		map.setZoom(cnt);

		setTimeout(function(){smoothZoom(max, cnt + 0.5)}, 100); // 80ms is what I found to work well on my system -- it might not work well on all systems
	}
} */

function showListView(storeID){
	// change button colours
	document.getElementById('mapbtn').src = popupConfig.icons.map;
	document.getElementById('mapdiv').style.color = popupConfig.css.colors.modalFG;
	document.getElementById('mapdiv').style.backgroundColor = popupConfig.css.colors.modalBG;
	document.getElementById('listbtn').src = popupConfig.icons.listSelected;
	document.getElementById('listdiv').style.color = popupConfig.css.colors.modalBG;
	document.getElementById('listdiv').style.backgroundColor = popupConfig.css.colors.modalFG;

	document.getElementById("purecommMap").style.display = "none";
	document.getElementById("purecommTables").style.display = "block";


	if (storeID){
		var storeRow = document.getElementById(storeID);
		storeRow.scrollIntoView(true);
	}

	if(searchRefresh){
		document.getElementById("table_inStock").scrollIntoView(true);
		searchRefresh = false;
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
		purecommOpenModal();
		return true;
	} else {
		return false;
	}
}

/*
 * popup store selection map for a single SKU
 */
 function purecommProductAvailabilityPopup(sku,callback){
 	if (popupInitialized){
 		purecommCallback = callback;
 		if (purecommItems == sku){
 			// same items, just open popup
 		} else {
 			// new items
 			purecommItems = sku;
 			purecommProcessNewItems(sku);
 		}
		return true;
	} else {
		return false;
	}
}

function sameItems(items1,items2){
	var same = true;
	if(!items1 || !items2){
		same = false; // not given 2 arrays of items
	} else if (items1.length !== items2.length){ 
		same = false; // the arrays are different length
	}
	for(var item in items1) {
		console.log("()()()()",item);
		//if(x[propertyName] !== y[propertyName]) {
		//	objectsAreSame = false;
		//	break;
		//}
	}
	return same;
}
function openPurecommModal(){
 	document.getElementById('purecommModal').style.display = "block";

}
function closePurecommModal(){
 	document.getElementById('purecommModal').style.display = "none";

}
/*
 * popup store selection map for one or more skus in the shopping cart (listed as a JSON array)
 */
 function purecommCartAvailabilityPopup(cartItems,callback){
 	sameItems(cartItems,cartItems);
 	if (popupInitialized){
 		purecommCallback = callback;
 		console.log("#####",purecommItems,cartItems);
 		if (sameItems(purecommItems,cartItems)){
 			console.log("##### same");
 			// same items, just open popup
 			openPurecommModal();
 		} else {
 			console.log("##### new");
 			// new items
 			purecommItems = cartItems;
 			purecommProcessNewItems(cartItems);
 		}
		// popup has been initialized
		// do stuff
		return true;
	} else {
		return false;
	}
}

function purecommProcessNewItems(items){
	if (!items) items = [];
	else if (!Array.isArray(items)) items = [items]; // change individual sku to array or 1 sku
	//var purecommOrderNumber = "benOrder5";
	var purecommOrderNumber = "rmwDemoOrder2";
	//var skus = [];
	//var items = [{"barcode":"B543S_87FGCH08_08","quantity":1,"unitPrice":2.10}];
	//var items = [{"barcode":"B543S_87FGCH08_08","quantity":1,"unitPrice":2.10},{"barcode":"B543Y_27FGCF06_08","quantity":1,"unitPrice":2.10}];
	//var items = [{"barcode":"","quantity":1,"unitPrice":2.10}];
	purecommFAPI.createOrder(createOrderResponse,purecommOrderNumber,items);

	function createOrderResponse(success,data){
		if (success){
			console.log("createOrderResponse",data);
			if (data.result == "OK"){
				// order created, get availabilty and store details
				purecommFAPI.storeAvailability(storeAvailabilityResponse,purecommOrderNumber);
			} else if (data.result == "Duplicate Order"){
				// order exists, update it
				purecommFAPI.updateOrder(updateOrderResponse,purecommOrderNumber,"","","",items,"","","","");
			} else {
				console.error(data);
			}
		} else {
			console.error(data);
		}
	}

	function updateOrderResponse (success,data){
		if (success){
			console.log("updateOrderResponse",data);
			if (data.result == "OK"){
				// order created, get availabilty and store details
				purecommFAPI.storeAvailability(storeAvailabilityResponse,purecommOrderNumber);
			} else {
				console.error(data);
			}
		} else {
			console.error(data);
		}
	}

	function storeAvailabilityResponse (success,data){
		if (success){
			console.log("storeAvailabilityResponse",data);
			//purecommFAPI.storeAvailability(storeAvailabilityResponse,purecommOrderNumber);
			purecommStores = data.stores;
			//purecommStores = purecommStores.slice(0,4); //TODO remove this.. get first 4 stores in testing
			console.log("!!!!!!!!!",purecommStores);
			// cancel order by updating all quantities to 0
			for (var sku in items) {
				items[sku].quantity = 0;
			}
			console.info("&&&ITEMS&&&",items);
			purecommFAPI.updateOrder(itemsRemoved,purecommOrderNumber,"","","",items,"","","","");

			purecommOpenModal_(); // open the modal
		} else {
			console.error(data);
		}
	}

	function itemsRemoved (success,data){
		if (success){
			console.log("itemsRemoved",data);
			purecommFAPI.orderStatus(orderStatusResponse,purecommOrderNumber);
		} else {
			console.error(data);
		}
	}

	function orderStatusResponse (success,data){
		if (success){
			console.log("orderStatusResponse",data);
		} else {
			console.error(data);
		}
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
 function purecommGetAvailability(items, store){

 	if (items){
 		if (items.constructor == Array){
			// cartItems
			console.log("purecommGetAvailability for cartItems: " )
			console.log(items)
			var availability = purecommGetCartAvailability(items, store);
			store['availability'] = availability;
		} else {
			// sku
			console.log("purecommGetAvailability for sku: " )
			console.log(items)
			var availability = purecommGetSkuAvailability(items, store);
			store['availability'] = availability;
		}
	} else {
		// no sku or cart items
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
 * returns a JSON object with store name, store Id, opening hours, address etc.
 */
 function purecommGetSelectedStore (){
 	if(purecommSelectedStoreID){
 		return purecommSelectedStoreID;
 	} else {
	 	var cookie = getCookie("purecomm_selectedstore");
	 	if (cookie) {
			return cookie; // stored as cookie
		} else {
			return ""; // not stored
		}
	}
}

/*
 * save the selected storeID as a local variable and a cookie
 */
 function purecommSetSelectedStore(storeID){
	purecommSelectedStoreID = storeID; // set local variable
	setCookie("purecomm_selectedstore",storeID,7); // set cookie
	if(purecommStores.some(function(store){
		console.log("compare",store.storeId,storeID);
		if(store.storeId == storeID){
			console.info("Selected store details:",store);
			console.info("Calling function:",purecommCallback);
			purecommCallback(store);
			purecommModal.style.display = "none";
			return true;
		}
	})){return true;} else {
		console.info("Couldn't find store details:",storeID);
		return false;
	}
}

search = function(){
	var txt = document.getElementById("searchtxt").value;
	if(txt){
		console.log("Searching for: " + txt);
	} else {
		
	}
}

/*
 * find a location on the map and calculate distances to that location
 * position is given, when called from a search
 * position is null, when locating the user
 */
 function findLocation(position,bounds){
 	if (position){
		// position given
		var location = { lat: position.lat(), lng: position.lng() };
		localize(location,popupConfig.map.searchedLocation);
		//mapCurrentLocationMarker.setIcon(new google.maps.MarkerImage(popupConfig.map.searchedLocation));
	} else if (navigator.geolocation) {
		// HTML5 geolocation.
		navigator.geolocation.getCurrentPosition(function(pos) {
			var location = { lat: pos.coords.latitude, lng: pos.coords.longitude };
			localize(location,popupConfig.map.currentLocation);
		});
	}

	var geocoder = new google.maps.Geocoder();
	console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%",google.loader.ClientLocation);
	if(google.loader.ClientLocation) {
		console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%");
		loc.lat = google.loader.ClientLocation.latitude;
		loc.lng = google.loader.ClientLocation.longitude;

		var latlng = new google.maps.LatLng(loc.lat, loc.lng);
		geocoder.geocode({'latLng': latlng}, function(results, status) {
			if(status == google.maps.GeocoderStatus.OK) {
				alert(results[0]['formatted_address']);
			};
		});
	}

	function localize (location,iconImage){
	 	
		//console.log("0000000000000000000000000",location)
	 	//		var lat = parseFloat(store.latitude), lng = parseFloat(store.longitude);

 		//if (store.longitude=="" || store.longitude=="" || typeof lat == "undefined" && typeof lng == "undefined"){

		var markerImage = new google.maps.MarkerImage(iconImage, // ** TODO take image from config file
		new google.maps.Size(30, 30), // size
		new google.maps.Point(0, 0), // origin
		new google.maps.Point(15, 15), // anchor (location on map)
		new google.maps.Size(30, 30)); // scaled size

		map.setCenter(location);
		if (!mapCurrentLocationMarker){

			var marker = new google.maps.Marker({
				map: map,
				position: location,
				icon: markerImage
			});
			mapCurrentLocationMarker = marker;
		} else {
			mapCurrentLocationMarker.setPosition(location);
			mapCurrentLocationMarker.setIcon(markerImage);
		}
		console.log("** location ** ",location);
		getStoreDistances(location); // get the distance between each store and this postion

		// resort the table
		populateTable("distance");

		// fit bounds of map to the searched location and the nearest store
		var newBounds = new google.maps.LatLngBounds();
		newBounds.extend(location);
		newBounds.extend(purecommStores[0].coords);
		if(bounds){
			//newBounds.extend(bounds.getNorthEast());
			//newBounds.extend(bounds.getSouthWest());

		}
		console.log(newBounds);
		map.fitBounds(newBounds);
		mapBounds = newBounds;
		if (map.getZoom() > 15) map.setZoom(15); // max zoom to 15
		//if (map.getZoom() < 4) map.setZoom(map.getZoom()+1); // zoom in if zoomed out too far
		searchRefresh = true;
		console.log("zoom "+map.getZoom());

		// close infowindow
		if(mapOpenedIW){
			mapOpenedIW.close(); // close IW
			mapOpenedIW = null; // no IW is open
		}
	}
}

/*
 * find disance between a point and each store
 * referencePoint is either current location or a searched location
 */
 function getStoreDistances(referencePoint){
	// get distances	
	purecommStores.forEach(function(store) {
		if (store.coords !== null && store.coords !== "" && typeof store.coords !== "undefined"){
			store['distance'] = distanceBetweenPoints(referencePoint, store.coords);
		}
	});

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
		return Math.ceil(d/100)/10; // return distance in km, rounded to nearest 100m
		//return Math.ceil(d/1000); // return distance in km, rounded up
		//return d; // returns the distance in metres

	}

}





function populateTable(sortBy){
	// sort the stores
	if (sortBy == "name"){
		purecommStores.sort(function(a,b){
			if(a.name < b.name) return -1;
			if(a.name > b.name) return 1;
			return 0;})
	} else if (sortBy == "distance"){
		purecommStores = purecommStores.sort(function(a,b){return a.distance - b.distance})
	}
	//console.log(stores);

	// repopulate table
	var table = document.getElementById("table_inStock");
	table.innerHTML = "";
	purecommStores.forEach(function(store) {
		populateTableRow(store);
	});
	table.scrollIntoView(true); // go to top of table

	function populateTableRow(store){
		var inStockTable = document.getElementById("table_inStock");
		var noStockTable = document.getElementById("table_noStock");


		//console.log(storeDetails);
		//var stock = getStockCount(storeDetails.id);

		//new StoreMarker(storeDetails, stock);
		//bounds.extend(storeDetails.coords);

		/*var row;
		if (purecommSelectedStoreID){
			if(purecommSelectedStoreID==purecommStores.storeId){
				row = inStockTable.insertRow(0);
			} 
		} else {
			row = inStockTable.insertRow(-1); // insert bottom row
		}*/
		var row = inStockTable.insertRow(-1); // insert bottom row
		row.insertCell(0).innerHTML = tableString(store);

	}

	function tableString(store) {
		var openinghoursString = '';
		var distance = "";
		if(store.distance){
			distance = " (" + store.distance + "km)";
		}

		//TODO sort out displaying stores
		openinghoursString = store.openingHours;
		/*var dayhrs = purecommStores.openingHours.split(',');
		dayhrs.forEach(function(hrs){
			openinghoursString += hrs + "<br/>"
		}) */
		openinghoursString +=  "</pre>"
		// html content of the table
		var contentString = '<div class="tableRow" id="' + store.storeId + '" >' +
		'<div class="left">' +
		'<p class="p1">'+
		store.storeName + ' ' + distance + '<br />' + 
		'<p class="p2">'+
		store.storeAddress +'</p>' +
		'<p class="p1">'+
		store.availability + '</p>' +
		'<button class="purecommTextButton" type="button" onclick=purecommSetSelectedStore("' + store.storeId + '","")>Select Store</button>' + 
		'<button class="purecommTextButton" type="button" onclick=showMapView("' + store.storeId + '","map")>View on Map</button>' + 
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
}


function mapStoreMarker(store) {
	var markerIcon,
	markerZ;

	var id = store.storeId;
	if (store.availability){
		var markerdetails = getMarkerDetails(store.availability);
		store.availability = markerdetails.availability;
		markerIcon = markerdetails.icon;
		markerZ = markerdetails.z;
	} else {
		// no availabilty information show
		markerIcon = popupConfig.map.store.default;
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
	var infowindowString = iwString(store);
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
	this.update = function(){
		if (store.availability){
			var markerdetails = getMarkerDetails(store.availability);
			marker.setIcon(markerdetails.icon);
			marker.setZIndex(markerdetails.z);
		}
		// TODO update distance?
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
		// make the IW window color match the config
		if (popupConfig.css.colors.bodyBG){
			var color = popupConfig.css.colors.bodyBG;
			var iwOuter = document.getElementsByClassName('gm-style-iw')[0];//or $('#outerDivId')[0];
			var iwBackground = iwOuter.previousSibling;
			var children = iwBackground.getElementsByTagName('div');
			//children[1].style.backgroundColor = color; // iw shadow
			children[4].style.backgroundColor = color; // iw arrow 
			children[6].style.backgroundColor = color; // iw arrow
			children[7].style.backgroundColor = color; // iw padding	
		}
	}

	function closeOpenedIW(){
		if(mapOpenedIW){
			mapOpenedIW.close(); // close the opened IW
			mapOpenedIW = null; // no IW is open
		}
	}

	mapStoreMarkers.push(this); // push the marker

	function iwString(store) {

		// html content of the infowindow
		var contentString = '<div class="iwContent">' +
		'<p class="p1">'+
		store.storeName + '</p>' +
		'<p class="p2">'+
		store.storeAddress + '</p>' +
		'<p class="p1">'+
		store.availability + '</p>' +
		'<button class="purecommTextButton" type="button" onclick=purecommSetSelectedStore("' + store.storeId + '","")>Select Store</button>' + 
		'<button class="purecommTextButton" type="button" onclick=showListView("' + store.storeId + '","list")>View Opening</button>' + 
		'</div>';

		getStore = function () { // button on infowindow function
			return store; // reset the train alarm
		}
		return contentString;
	}


}






function getStores (){
	var stores_ = [];
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

	stores_.push(s1);
	stores_.push(s2);
	stores_.push(s3);
	stores_.push(s4);
	stores_.push(s5);
	stores_.push(s6);
	stores_.push(s7);
	stores_.push(s8);
	stores_.push(s9);
	stores_.push(s10);
	stores_.push(s11);
	stores_.push(s12);
	stores_.push(s13);
	stores_.push(s14);

	return stores_;
}

function getMarkerDetails(availability){
	//var stockmessage = availability.message;
	switch (availability){
		case "Immediate":
		case "In Stock":
		return {"availability":"In Stock", "icon":popupConfig.map.store.green, "z":10};
		break;			
		case "TBC":
		case "Limited Stock":
		return {"availability":"Available in 2-3 Days", "icon":popupConfig.map.store.amber, "z":9};
		break;
		case "Some Items Available":
		return {"icon":popupConfig.map.store.amber, "z":8};
		break;
		case "Available in 2-3 Days":
		return {"icon":popupConfig.map.store.amber, "z":7};
		break;
		case "Not Available":
		return {"icon":popupConfig.map.store.red, "z":6};
		break;
		default:
		return {"icon":popupConfig.map.store.red, "z":5};
		break;

		// Immediate, Insufficient Stock
	}
}





/*
 * Create a version 4 UUID is defined in RFC 4122 
 * 128 randomly-generated bits with six bits at certain positions set to particular values
 * eg 4513c570-5db9-408e-9ded-e1bben24436a
 */
 function createUUID(){
 	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
 		var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
 		return v.toString(16);
 	});
 }

/*
 **************************************************************************************
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