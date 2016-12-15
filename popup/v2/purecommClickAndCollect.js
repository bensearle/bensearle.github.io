/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global google*/
/*global PurecommFAPIjsInterface*/


// cartItems is an array of SKUs

var //popupConfig, // the details from the config file for popup customization
	//branchId, // a “virtual branch” used to identify the client website, and pick up the config file. 
	//sessionId, // a website Id that’s used as a temporary Purecomm order number, until the actual order number is allocated
	popupInitialized, // has the popup been initialized
	storesInitialized, // have the stores been initialized
	currentView, // current view of popup is either 'map' or 'list'
	searchRefresh, // true if the user has searched and the map needs bounds set/table top row needs to be in view
	test;

var purecommBranchId, // a “virtual branch” used to identify the client website, and pick up the config file. 

    purecommFAPI, // instance of the FAPI interface
	purecommItems, // array for skus
	purecommOrderNumber, // order number for this session
	purecommStores, // array of stores
	purecommHostParam, // parameter for the host, eg "uat"
	purecommMapSearchBox, // google places search box
	purecommCallback, // function to be called when a store is selected purecommCallback(storeId);
	map, // the google map
	mapStoreMarkers = [], // array of the markers
	mapOpenedIW, // the infowindow that is currently open
	mapInitialized, // true after the map has been opened for the first time and resized
	mapCurrentLocationMarker, // marker for the current/searched location of the user	
	purecommSearchBoxBounds, // bounds for all stores, used for the bounds of the searchbox and default view location is not know and no cookies
	purecomm_SelectedStoreID, // COOKIE: store id that has been selected
	purecomm_SortFrom, // COOKIE: coordinates for current/seatched location, stores will be sorted by distance to this location
	purecomm_MapBounds, // COOKIE: last known mapbounds, updated when new search and closing the modal
	testttt;

var purecommPopupConfiguration;

function getPurecommPopupConfiguration() {
    'use strict';
    purecommPopupConfiguration = { // default config for the popup, will be updated with details from the config file for popup customization
        //"locator": {
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
            "map": "https://" + purecommHostParam + ".purecomm.hk/en/map_popup/v3/images/mapview_white.png",
            "mapSelected": "https://" + purecommHostParam + ".purecomm.hk/en/map_popup/v3/images/mapview_black.png",
            "list": "https://" + purecommHostParam + ".purecomm.hk/en/map_popup/v3/images/listview_white.png",
            "listSelected": "https://" + purecommHostParam + ".purecomm.hk/en/map_popup/v3/images/listview_black.png",
            "search": "https://" + purecommHostParam + ".purecomm.hk/en/map_popup/v3/images/search_black.png",
            //"nearby": "https://" + purecommHostParam + ".purecomm.hk/en/map_popup/v3/images/gps_white.png",
            "close": "https://" + purecommHostParam + ".purecomm.hk/en/map_popup/v3/images/close_white.png"
        },
        "map": {
            "searchedLocation": "https://" + purecommHostParam + ".purecomm.hk/en/map_popup/v3/images/search_black.png",
            "store": {
                "red": "https://" + purecommHostParam + ".purecomm.hk/en/map_popup/v3/images/markerred.png",
                "default": "https://" + purecommHostParam + ".purecomm.hk/en/map_popup/v3/images/markergreen.png",
                "green": "https://" + purecommHostParam + ".purecomm.hk/en/map_popup/v3/images/markergreen.png",
                "amber": "https://" + purecommHostParam + ".purecomm.hk/en/map_popup/v3/images/markeramber.png"
            },
            "currentLocation": "https://" + purecommHostParam + ".purecomm.hk/en/map_popup/v3/images/currentLocation.png"
        }
        //}
    };
}

/*
 * branchId is a “virtual branch” used to identify the client website, and pick up the config file. 
 * sessionId is a website Id that’s used as a temporary Purecomm order number, until the actual order number is allocated 
 * (eg. Could use Magneto quoteId)
 */
function purecommClickAndCollectInit(branchId, hostParam) {
    purecommHostParam = "uat";
    getPurecommPopupConfiguration();
    
    // get cookies
    console.log(getCookie("purecomm_SelectedStoreID"));
    console.log(getCookie("purecomm_SortFrom"));
    console.log(getCookie("purecomm_MapBounds"));
    
    purecomm_SelectedStoreID = getCookie("purecomm_SelectedStoreID");
    purecomm_SortFrom = JSON.parse(getCookie("purecomm_SortFrom"));
    purecomm_MapBounds = JSON.parse(getCookie("purecomm_MapBounds"));
    
    console.log(createUUID());

    console.log(document.cookie);
    var ccc = getCookie("document.cookie");
    console.log(ccc);
    
    function init(configFile) {
        if (configFile) {
            // copy data from newConfig to ogConfig
            function updateConfig(ogconfig, newConfig) {
                console.log(newConfig);
                var attribute;
                for (attribute in newConfig) {
                    var value = newConfig[attribute]; // value for the attribute
                    if (value !== null && value !== "") {
                        if (typeof value === 'object') {
                            // value is an object, recurcively call this method
                            updateConfig(ogconfig[attribute], newConfig[attribute]);
                        } else {
                            ogconfig[attribute] = value;
                        }
                    }
                }
                return ogconfig;
            }
            purecommPopupConfiguration = updateConfig(purecommPopupConfiguration, configFile);
        }
        
		var head = document.getElementsByTagName('head')[0],
			body = document.getElementsByTagName('body')[0];

        var cssConfig = ':root {' +
            '--purecommFontFamily: ' + purecommPopupConfiguration.css.fontFamily + ';' +
            '--purecommModalBG: ' + purecommPopupConfiguration.css.colors.modalBG + ';' +
            '--purecommModalFG: ' + purecommPopupConfiguration.css.colors.modalFG + ';' +
            '--purecommBodyBG: ' + purecommPopupConfiguration.css.colors.bodyBG + ';' +
            '--purecommBodyFG: ' + purecommPopupConfiguration.css.colors.bodyFG + ';' +
            '}';
        var node = document.createElement('style');
        node.innerHTML = cssConfig;
        document.body.appendChild(node);

		var hostExtension = "/en/map_popup/v3/";
		//var	purecommHost = "https://purecomm.hk" + hostExtension; // uat is default host
		var	purecommHost = "https://" + purecommHostParam + ".purecomm.hk" + hostExtension; // uat is default host
        
		//if(hostParam == "pp") {
		//	host = "https://pp.purecomm.hk" + hostExtension;
		//} else if(hostParam == "prod") {
		//	host = "https://www.purecomm.hk" + hostExtension;
		//} 

		// load css file
		var modalCSS  = document.createElement('link');
		modalCSS.type = 'text/css';
		modalCSS.rel = 'stylesheet';
		//modalCSS.href = 'purecommClickAndCollect.css';
		modalCSS.href = purecommHost + 'purecommClickAndCollect.css';
		head.appendChild(modalCSS);

		// create modal html
		var modal = document.createElement('div');
		modal.id = 'purecommModal';
		modal.className = 'purecommModal';

		modal.onclick = function (event) {
			if (event.target === purecommModal) {
				closePurecommModal();
			}
		};

		var modalHTML =	'<div class="purecommModalContent" id="purecommModalContent">' +
            '<div class="purecommModalHeader" id="purecommModalHeader">' +
            '<span class="modalHead" id="modalHead">Select A Store</span>' +
            '<img class="close" src="' + purecommPopupConfiguration.icons.close + '" alt="" onclick="closePurecommModal()" />' +
            '</div>' +
            '<div class="purecommModalBody" id="purecommModalBody"></div>' +
            '<div class="purecommModalFooter" id="purecommModalFooter">' +
            '</div>' +
            '</div>';

		modal.innerHTML = modalHTML;
		body.appendChild(modal);

		// initialize the map and list view based on popupConfig
		if (purecommPopupConfiguration.defaultView === "list") { // default view is list
			listInit(1);
			if (purecommPopupConfiguration.mapView) {
				mapInit(0);
			}
		} else { //if (purecommPopupConfiguration.defaultView === "map";) // default view is map or undefined
			mapInit(1);
			if (purecommPopupConfiguration.listView) {
				listInit(0);
			}
		}

		var modalFooter = document.getElementById('purecommModalFooter');

		modalFooter.innerHTML += /*'<div class="mapdiv">' +
            '<span>Nearby</span>' +
            '<img src="' + purecommPopupConfiguration.icons.nearby + '" alt="" onclick="findLocation()" />' +
            '</div>' +*/
            '<div class="searchdiv">' +
            '<img class="searchicon" id="searchicon" src="' + purecommPopupConfiguration.icons.search + '"\/>' +
            //'<span class="searchtxt" id="searchtxt" onclick="showSearch()">Search</span>' +
            '<input class="searchbox" id="pac-input" type="text" placeholder="Search">' +

            '</div>';


		popupInitialized = true;
    }

 	if (!popupInitialized) {
 		purecommBranchId = branchId;
        
        // import purecommFAPIjsInterface.js
		var head = document.getElementsByTagName('head')[0];	
		fapiScript = document.createElement('script');
		fapiScript.type = 'text/javascript';
		//fapiScript.src = 'https://' + purecommHostParam + '.purecomm.hk/en/map_popup/v3/purecommFAPIjsInterface.js';
        fapiScript.async = false;
		fapiScript.src =  'purecommFAPIjsInterface.js'; //todo change back
        fapiScript.onreadystatechange = fapiScript.onload = function () {
           //purecommFAPI = new PurecommFAPIjsInterface('JZLDKH', 'rmw88', 'uat');
           purecommFAPI = new PurecommFAPIjsInterface('EB2UMV', null, purecommHostParam);
           purecommFAPI = new PurecommFAPIjsInterface(purecommBranchId, null, purecommHostParam);
            // get the .properties file
			//init(); //TODO sort out CORS error and init after getting configfile
            
            
            purecommFAPI.ajax({
                type: "GET",
                url: "https://" + purecommHostParam + ".purecomm.hk/en/testnewpop/config/readConfig.jsp?m=getByAttribute&a=page&c=testnewpop/config/" + branchId + ".properties",
                authorization: null,
                async: false,
                success: function (response) {
                    console.log("^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^",1,response);
                    if (response.success){
                        init(response.result.locator); // initialize the popup
                    } else {
                        console.error("Cannot get properties file",response.error);
                        init(); // initialize the popup
                    }
                },
                error: function (response) {
                    console.error("Cannot get properties file",response);
                    init(); // initialize the popup
                }
            }); 
        };
		head.appendChild(fapiScript);
	}
}

/*
 *
 */
function listInit (defaultView){
 	purecommPopupConfiguration.listView = 1;

    var modalBody = document.getElementById('purecommModalBody');
    var modalFooter = document.getElementById('purecommModalFooter');
    var bodyHTML =  '<div id="purecommTables" class="tables">' +
 	'<table id="table_inStock" class="table"></table>' +
 	'<table id="table_noStock" class="table"></table>' +
 	'</div>';
    var footerHTML ='<div class="listdiv" id="listdiv" onclick="showListView()">' +
 	'<span>List</span>' +
 	'<img class="view" id="listbtn" src="' + purecommPopupConfiguration.icons.list + '" alt="" />' +
 	'</div>';

 	modalBody.innerHTML += bodyHTML;
 	modalFooter.innerHTML += footerHTML;

 	if (defaultView) {
 		currentView = 'list';
 		document.getElementById('purecommTables').style.display = "block";
 	}
 }

/*
 *
 */
function mapInit (defaultView) {
    purecommPopupConfiguration.mapView = 1;

	// load google maps api and call initializeMap when complete
    var head = document.getElementsByTagName('head')[0];
	var script = document.createElement('script');
	script.src = "https://maps.googleapis.com/maps/api/js?key=AIzaSyD07c9hGOtQnuF30nwqml5OQkqzrPejIFs&libraries=places&callback=initializeMap";
	head.appendChild(script);
	
	var script2 = document.createElement('script');
	script2.src = "https://www.google.com/jsapi?key=AIzaSyD07c9hGOtQnuF30nwqml5OQkqzrPejIFs&callback=findLocation";
	head.appendChild(script2);


	var modalBody = document.getElementById('purecommModalBody');
	var modalFooter = document.getElementById('purecommModalFooter');
	var bodyHTML = 	'<div id="purecommMap" class="map"></div>';
	var footerHTML ='<div class="mapdiv" id="mapdiv" onclick="showMapView()">' +
	'<span>Map</span>' +
	'<img id="mapbtn" src="' + purecommPopupConfiguration.icons.map + '" alt=""  />' +
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

    // add the google logo, without hyperlink
    var googlelogo=document.createElement("img");
	googlelogo.setAttribute('src', 'https://maps.gstatic.com/mapfiles/api-3/images/google_white5_hdpi.png');
	googlelogo.setAttribute('draggable', 'false');
	googlelogo.setAttribute('position', '1px');
	googlelogo.setAttribute('width', '66px');
	googlelogo.setAttribute('height', '26px');
	googlelogo.setAttribute('user-select', 'none');
	googlelogo.setAttribute('border', '0px');
	googlelogo.setAttribute('padding', '0px');
	googlelogo.setAttribute('margin', '0px');
	//googlelogo.setAttribute('pointer-events', 'none !important');
	//googlelogo.setAttribute('cursor', 'default');
	map.controls[google.maps.ControlPosition.BOTTOM_LEFT].push(googlelogo);
}


/*
 * when the popup is opened for the first time, the store information is initialized
 */
function purecommOpenModal_() {
 	//console.log(stores);
	var mv = purecommPopupConfiguration.mapView; // map view to be shown
	var lv = purecommPopupConfiguration.listView; // list view to be shown
	document.getElementById('purecommModal').style.display = "block"; // open the model

	mapStoreMarkers.forEach(function(marker){
		marker.remove();
	});
	mapStoreMarkers = [];
     
	console.log("**STORES**", purecommStores);
	//console.log("**purecomm_SortFrom**",purecomm_SortFrom);

 	//stores = getStores(); // get information on all stores

	purecommSearchBoxBounds = new google.maps.LatLngBounds(); // bounds for the initial view of the map

    // get create store coords and get marker details
	for (var i = purecommStores.length - 1; i > -1; i--) { // iterate backwards, because stores will be removed
		store = purecommStores[i];
	//purecommStores.forEach(function(store) {
		getMarkerDetails_(store); // update store with details for map marker: shown on mapView and listView
		if (!store.longitude || !store.longitude){
			console.error("store does not have cooridinates", store);
			removeItem(purecommStores, store); // remove this store
			
			/*
			if (store.storeAddress){ // if there is a store address
			// get cooridinates from address
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
							//mapBounds.extend(coords); // extend bounds to show the marker
							//map.fitBounds(mapBounds);
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
									
			} else {
				console.error("No address exists for store", store.storeId, store.storeName); //delete purecommStores[indexOf(store)]; //delete purecommStores.store; // remove this store
			}*/
		} else {
			// lat and lng are known
			var lat = parseFloat(store.latitude), 
			lng = parseFloat(store.longitude);
			coords = {"lat":lat,"lng":lng};
			store['coords'] =  coords;
			//store['coords'] = {"lat":parseFloat(store.longitude), "lng":parseFloat(store.latitude)}; // add googlemaps friendly coords attribute to store
			purecommSearchBoxBounds.extend(store.coords); // extend bounds for search box and to show the marker	
		}
	}//);

    // sort the stores 
	if (purecomm_SortFrom){
		console.log("^^^^^^^^^^^^^^^^^",purecomm_SortFrom)
		getStoreDistances(purecomm_SortFrom); // get the distance between each store and this postion
		sortStores("distance"); 
		//getStoreDistances(location); // get the distance between each store and this postion
		//sortStores("distance"); // sort the stores by distance
	} else if (purecommStores[0].distance){ // check first store to see if distance is known
		sortStores("distance");;
	} else {
		sortStores("name"); // table populated by default order, use populateTable("name") to sort alphabetically
	}
    
    // create a marker for each store
    purecommStores.forEach(function(store) {
        if(mv) {
				new mapStoreMarker(store); // create map marker for every store
        }
    });
    
    if (!storesInitialized){ // if stores aren't itialized	    
		
		// Create the search box and link it to the UI element.
	    var input = ( document.getElementById('pac-input'));
		var options = {
			bounds: purecommSearchBoxBounds,
			types: ['(cities)'] // doesn't work for SearchBox, only Autocomplete
		}
	    var searchBox = new google.maps.places.SearchBox(input, options);
		google.maps.event.addListener(searchBox, 'places_changed', function () {
	        var places = searchBox.getPlaces();
			var markers = [];
	        if (places.length == 0) {
	            return;
	        }
			places.forEach(function(place) {
				if (!place.geometry) {
					console.log("Returned place contains no geometry");
					return;
				}
				console.log("*****PLACE",place);
				findLocation(place.geometry.location,place.geometry.viewport);
			});
	    });
	    // Trigger search on button click
	    document.getElementById('searchicon').onclick = function () {
	        var input = document.getElementById('pac-input');
	        google.maps.event.trigger(input, 'focus')
	        google.maps.event.trigger(input, 'keydown', {
	            keyCode: 13
	        });
	    };
	}

	console.log("^^^^^^^^^^^^^^^^^",purecomm_SortFrom)

	mapStoreMarkers.forEach(function(marker){
		marker.updateLabel();
	});
	if (purecomm_MapBounds){
		console.log("BBBBBBOUNDS purecomm_MapBounds",purecomm_MapBounds);
		//console.log(JSON.parse(settings[0]), parseInt(settings[1]));
		map.fitBounds(purecomm_MapBounds); // setting bounds to a previous get bounds will be zoomed out 1 level
		map.setZoom(map.getZoom() + 1); // zoom in one level
	} else if (purecommUserLocation) {
		console.log("BBBBBBOUNDS purecommUserLocation",purecommUserLocation);
		findLocation();
	} else {
		console.log("BBBBBBOUNDS mapBounds",purecommSearchBoxBounds);
		map.fitBounds(purecommSearchBoxBounds);
	}

	if (lv){
		console.log("******",purecommStores[0])
		populateTable(); // table populated by default order, use populateTable("name") to sort alphabetically
	}

	if(purecommPopupConfiguration.defaultView == "map"){
		showMapView();
	} else {
		showListView();
	}

	if (purecomm_SortFrom){
		console.log("^^^^^^^^^^^^^^^^^",purecomm_SortFrom)
		getStoreDistances(purecomm_SortFrom); // get the distance between each store and this postion
		sortStores("distance"); 
		//getStoreDistances(location); // get the distance between each store and this postion
		//sortStores("distance"); // sort the stores by distance
	} 

	storesInitialized = true;
	console.log("[]",purecommStores);
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
 function showMapView(storeID) {
	// change button colours
	document.getElementById('listbtn').src = purecommPopupConfiguration.icons.list;
	document.getElementById('listdiv').style.color = purecommPopupConfiguration.css.colors.modalFG;
	document.getElementById('listdiv').style.backgroundColor = purecommPopupConfiguration.css.colors.modalBG;
	document.getElementById('mapbtn').src=purecommPopupConfiguration.icons.mapSelected;
	document.getElementById('mapdiv').style.color = purecommPopupConfiguration.css.colors.modalBG;
	document.getElementById('mapdiv').style.backgroundColor = purecommPopupConfiguration.css.colors.modalFG;

	document.getElementById("purecommTables").style.display = "none";
	//closeIW();
	document.getElementById("purecommMap").style.display = "block";

	if(!mapInitialized){
		google.maps.event.trigger(map,'resize');
        if(purecomm_MapBounds){
		  map.fitBounds(purecomm_MapBounds);
        } else {
            map.fitBounds(purecommSearchBoxBounds);
        }
		mapInitialized = 1;
	}

	if (storeID){
		mapStoreMarkers.forEach(function(marker) {
			if(marker.getID()==storeID){
				marker.viewOnMap();
			}
		})
	} else if(searchRefresh){
		//**
		console.log(purecomm_MapBounds);
		map.fitBounds(purecomm_MapBounds);
		if (map.getZoom() > 15) map.setZoom(15); // max zoom to 15
		searchRefresh = false;
	}
}

function showListView(storeID) {
	// change button colours
	purecomm_MapBounds = map.getBounds();
	document.getElementById('mapbtn').src = purecommPopupConfiguration.icons.map;
	document.getElementById('mapdiv').style.color = purecommPopupConfiguration.css.colors.modalFG;
	document.getElementById('mapdiv').style.backgroundColor = purecommPopupConfiguration.css.colors.modalBG;
	document.getElementById('listbtn').src = purecommPopupConfiguration.icons.listSelected;
	document.getElementById('listdiv').style.color = purecommPopupConfiguration.css.colors.modalBG;
	document.getElementById('listdiv').style.backgroundColor = purecommPopupConfiguration.css.colors.modalFG;

	document.getElementById("purecommMap").style.display = "none";
	document.getElementById("purecommTables").style.display = "block";

	if (storeID){
		var storeRow = document.getElementById(storeID);
		storeRow.scrollIntoView(true);
	} else if(searchRefresh){
		document.getElementById("table_inStock").scrollIntoView(true);
		searchRefresh = false;
	}
}


/*
 * compare whether 2 javascript objects are the same
 * the 2 objects will be sku or cartItems
 */
function sameItems(items1,items2) {
	if (typeof items1 == 'undefined' || typeof items2 == 'undefined'){
		return false;
	} else {
		return JSON.stringify(items1) == JSON.stringify(items2);
	}
}


function closePurecommModal() {
	var coords = map.getCenter(),
		center = {"lat":coords.lat(),"lng":coords.lng()},
		zoom = map.getZoom();
	
	purecomm_MapBounds = map.getBounds();
	setCookie("purecomm_MapBounds", JSON.stringify(purecomm_MapBounds));

	console.log(JSON.stringify(center),map.getZoom());
 	document.getElementById('purecommModal').style.display = "none";

}

/*
 * this function can be called in 3 differnt ways
 * Find a Store popup	 		-->	purecommAvailabilityPopup()
 * Product Availability popup	-->	purecommAvailabilityPopup(sku)
 * Cart Availability popup 		-->	purecommAvailabilityPopup([sku,sku])
 * The callback function is optional. When a store is selected the call back function is called, passing the store details
 */
function purecommAvailabilityPopup(items, callback) {    
 	if (popupInitialized){
 		purecommCallback = callback;
 		if (sameItems(purecommItems,items)){
 			// same items, just display popup
 			document.getElementById('purecommModal').style.display = "block";
 		} else {
 			console.log("##### new");
 			// new items, get availability and update popup
 			purecommItems = items;

			if (!items) items = []; // no items: "find a store" popup
			else if (!Array.isArray(items)) items = [items]; // change individual sku to array of 1 sku

			//var purecommOrderNumber = "rmwDemoOrder2"; //TODO 
            //testA(purecommOrderNumber,items);
			purecommFAPI.storeAvailability(storeAvailabilityResponse,items);
			//purecommFAPI.createOrder(createOrderResponse,purecommOrderNumber,items);
 		}
		return true;
	} else {
		return false;
	}


    function storeAvailabilityResponse(success,data) {
        purecommStores = data.stores;
        console.info("&&&ITEMS&&&",items);
        purecommOpenModal_(); // open the modal
    }
}


/*
 * returns a JSON array listing the skus from the cartItems that are available in the selected store
 */
 function purecommGetAvailableSkus (cartItems) {
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
 function purecommGetAvailability(items, store) {

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
 function purecommGetSkuAvailability(sku, store) {
	// allocate a temporary order Id
	// call FAPI create order for order Id
	// call FAPI storeavailability
	// call FAPI cancel order
}

/*
 * 
 */
 function purecommGetCartAvailability(cartItems, store) {
	// call FAPI status to see if order already created with orderId=sessionId
	// if not, call FAPI create order to create order
	// otherwise, call FAPI update to change SKUs in the basket (with shippingRelease blank; the order will be released when submitted)
	// call FAPI storeavailabilty

}


/*
 * TODO just returns Store ID
 * returns a JSON object with store name, store Id, opening hours, address etc.
 */
 function purecommGetSelectedStore () {
 	if(purecomm_SelectedStoreID){
 		return purecomm_SelectedStoreID;
 	} else {
	 	var cookie = getCookie("purecomm_SelectedStoreID");
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
 function purecommSetSelectedStore(storeID) {
	purecomm_SelectedStoreID = storeID; // set local variable
	setCookie("purecomm_SelectedStoreID",storeID,7); // set cookie
	if(purecommStores.some(function(store){
		console.log("compare",store.storeId,storeID);
		if(store.storeId == storeID){
			console.info("Selected store details:",store);
			console.info("Calling function:",purecommCallback);
			purecommCallback(store);
			closePurecommModal();
			return true;
		}
	})){return true;} else {
		console.info("Couldn't find store details:",storeID);
		return false;
	}
}

var purecommUserLocation;

/*
 * find a location on the map and calculate distances to that location
 * position is given, when called from a search
 * position is null, when locating the user
 */
 function findLocation(position,bounds) {
 	console.log('google.loader.ClientLocation',google.loader.ClientLocation);
 	if (position){
		// position given
		var location = { lat: position.lat(), lng: position.lng() };
		localize(location);
		//mapCurrentLocationMarker.setIcon(new google.maps.MarkerImage(purecommPopupConfiguration.map.searchedLocation));
	} else if (purecommUserLocation) {
		localize(purecommUserLocation,purecommPopupConfiguration.map.currentLocation);
	} else if (navigator.geolocation) {
		// HTML5 geolocation.
		navigator.geolocation.getCurrentPosition(function(pos) {
			purecommUserLocation = { lat: pos.coords.latitude, lng: pos.coords.longitude };
		});
	} else if(google.loader.ClientLocation) {
		//alert("Alert2: " + google.loader.ClientLocation);
		var location = { lat: google.loader.ClientLocation.latitude, lng: google.loader.ClientLocation.longitude };
		console.log('(*********,',google.loader.ClientLocation)
		localize(location);
	}

	function localize (location,iconImage) {
		purecomm_SortFrom = location;
		console.log("^^^^^^^^^^^^^^^^^",purecomm_SortFrom)

		setCookie('purecomm_SortFrom',JSON.stringify(location),7);
	 	if (iconImage){
			var markerImage = new google.maps.MarkerImage(iconImage, // ** TODO take image from config file
			new google.maps.Size(30, 30), // size
			new google.maps.Point(0, 0), // origin
			new google.maps.Point(15, 15), // anchor (location on map)
			new google.maps.Size(30, 30)); // scaled size
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
		}
		map.setCenter(location);
		console.log("** location ** ",location);

		getStoreDistances(location); // get the distance between each store and this postion
		sortStores("distance"); // sort the stores by distance
		
		// resort the table
		populateTable();
		mapStoreMarkers.forEach(function(marker){
			marker.updateLabel();
		});

		// fit bounds of map to the searched location and the nearest store
		var newBounds = new google.maps.LatLngBounds();
		newBounds.extend(location);
		console.log("STORE COORDS", purecommStores[0], purecommStores);
		newBounds.extend(purecommStores[0].coords);
		//if(bounds){
			//newBounds.union(bounds);
			//newBounds.extend(bounds.getNorthEast());
			//newBounds.extend(bounds.getSouthWest());
		//}

		map.fitBounds(newBounds);
		purecomm_MapBounds = newBounds;
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
function getStoreDistances(referencePoint) {
	// get distances
    console.log('************',referencePoint, purecommStores)
	purecommStores.forEach(function(store) {
		if (store.coords !== null && store.coords !== "" && typeof store.coords !== "undefined"){
			store['distance'] = distanceBetweenPoints(referencePoint, store.coords);
		}
	});

	// Haversine formula
	function distanceBetweenPoints(p1, p2) {
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

/*
 * sort the stores by distance or alphabetically
 * assign store index
 */
function sortStores(sortBy) {
	// sort the stores
	if (sortBy == "name"){
		purecommStores.sort(function(a,b) {
			if(a.storeName < b.storeName) return -1;
			if(a.storeName > b.storeName) return 1;
			return 0;})
	} else { //if (sortBy == "distance"){
		purecommStores = purecommStores.sort(function(a,b){return a.distance - b.distance})
	}
	var i = 1;
	purecommStores.forEach(function(store) {
		store["index"] = i++;
	});
}

function populateTable() {

	console.log("!!!!!!!!!!!!!!!!!!");
	// repopulate table
	var table = document.getElementById("table_inStock");
	table.innerHTML = ""; // clear the table
	purecommStores.forEach(function(store) {
		//console.log("!!!!!!!!!!!!!!!!!!",store);

		table.insertRow(-1).insertCell(0).innerHTML = tableString(store); // add each row to the table
	});
	table.scrollIntoView(true); // go to top of table

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
		'<figure><img src="' + store.icon.url + '"><figcaption>' + store.index + '</figcaption></figure>' +
		'<div class="left">' +
		'<p class="p1">' + store.availability + '</p>' +
		'<p class="p1">'+ store.storeName + ' ' + distance + '</p>' + 
		'<p class="p2">'+ store.storeAddress +'</p>' +
		'<button class="purecommTextButton" type="button" onclick=purecommSetSelectedStore("' + store.storeId + '","")>Select Store</button>' + 
		'<button class="purecommTextButton" type="button" onclick=showMapView("' + store.storeId + '","map")>View on Map</button>' + 
		'</div>' +
		'<div class="right">' + 
		'<p class="p2">'+
		openinghoursString + '</p>' + 
		'</div>' +
		'</div>';
		
		return contentString;
	}
}


function mapStoreMarker(store) {
	var markerZ = store.icon.z + 10000 - store.index;
		/* var label = {
			text: "",
			color: 'black',
			fontSize: "12px",
			zIndex: markerZ};
	if (store.index) {
		label = {
			text: ""+store.index,
			color: 'black',
			fontSize: "12px",
			zIndex: markerZ}
	}*/

	// create store marker
	var marker = new google.maps.Marker({
		map: map,
		position: store.coords,
		zIndex: markerZ,
		icon: {
			url: store.icon.url,
			labelOrigin: new google.maps.Point(14,11),
			scaledSize: new google.maps.Size(28,28)},
		label: {
			text: ""+store.index,
			color: 'black',
			fontSize: "12px",
			zIndex: markerZ}
	});
	
	var markerIW  = new google.maps.InfoWindow({
			content: iwString(store)
		});

	this.select = function () {
		map.setCenter(store.coords);
		openIW();
		map.setZoom(14);
	};
	this.getID = function (){
		return store.storeId;
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
			marker.setIcon({
				url: store.icon.url,
				labelOrigin: new google.maps.Point(14,11),
				scaledSize: new google.maps.Size(28,28)});
			marker.setZIndex(markerZ);
			marker.setLabel(""+store.index);
			markerIW.setContent(iwString(store));
		}
		// TODO update distance?
	}
	this.updateLabel = function(){
		if (store.availability){
			marker.setLabel(""+store.index);
			markerIW.setContent(iwString(store));
		}
	}
	this.remove = function(){
		marker.setMap(null);
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
		if (purecommPopupConfiguration.css.colors.bodyBG){
			var color = purecommPopupConfiguration.css.colors.bodyBG;
			var iwOuter = document.getElementsByClassName('gm-style-iw')[0];
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

	function iwString(store) {

		// html content of the infowindow
		var contentString = '<figure><img src="' + store.icon.url + '"><figcaption>' + store.index + '</figcaption></figure>' +
		'<div class="iwContent">' +
		'<p class="p1">' + store.availability + '</p>' +
		'<p class="p1">'+ store.storeName + '</p>' +
		'<p class="p2">'+ store.storeAddress +'</p>' +
		'<button class="purecommTextButton" type="button" onclick=purecommSetSelectedStore("' + store.storeId + '","")>Select Store</button>' + 
		'<button class="purecommTextButton" type="button" onclick=showListView("' + store.storeId + '","list")>View in List</button>' + 
		'</div>';

		getStore = function () { // button on infowindow function
			return store; // reset the train alarm
		}
		return contentString;
	}

	mapStoreMarkers.push(this); // push the marker

}

function getMarkerDetails_(store) {
	switch (store.availability){
		case "Immediate": // returned from FAPI
		case "In Stock":
			store["icon"] = {"url":purecommPopupConfiguration.map.store.green, "z":800000};
			store.availability = "In Stock";
			break;			
		case "TBC": // retured from FAPI
		case "Limited Stock":
		case "Some Items Available":
		case "Available in 2-3 Days":
			store["icon"] = {"url":purecommPopupConfiguration.map.store.amber, "z":400000};
			store.availability = "Available in 2-3 Days";
			break;
		case "Insufficient Stock": // returned from FAPI
		case "Not Available":
		default:
			store["icon"] = {"url":purecommPopupConfiguration.map.store.red, "z":100000};
			store.availability = "Not Available";
			break;		
		break;
	}
}

/*
 * Create a version 4 UUID is defined in RFC 4122 
 * 128 randomly-generated bits with six bits at certain positions set to particular values
 * eg 4513c570-5db9-408e-9ded-e1bben24436a
 */
function createUUID() {
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
function setCookie(cname, cvalue) {
	var exdays = 7, // expire in 7 days
 		d = new Date();
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