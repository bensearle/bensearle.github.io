// cartItems is an array of SKUs

var popupConfig, // the details from the config file for popup customization
	branchId, // a “virtual branch” used to identify the client website, and pick up the config file. 
	sessionId, // a website Id that’s used as a temporary Purecomm order number, until the actual order number is allocated
	popupInitialized, // has the popup been initialized
	storesInitialized, // have the stores been initialized
	currentView, // current view of popup is either 'map' or 'list'
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
	map, // the google map
	mapStoreMarkers = [], // array of the markers
	mapOpenedIW, // the infowindow that is currently open
	mapBounds, // bounds initially contains all stores, then contain location and some stores
	mapInitialized, // true after the map has been opened for the first time and resized
	mapCurrentLocationMarker, // marker for the current/searched location of the user	
	testttt;

var purecommPopupConfiguration = { // default config for the popup, will be updated with details from the config file for popup customization
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
                    /*"red": "https://" + purecommHostParam + ".purecomm.hk/en/map_popup/v2/images/markerred.png",
                    "default": "https://" + purecommHostParam + ".purecomm.hk/en/map_popup/v2/images/markergreen.png",
                    "green": "https://" + purecommHostParam + ".purecomm.hk/en/map_popup/v2/images/markergreen.png",
                    "amber": "https://" + purecommHostParam + ".purecomm.hk/en/map_popup/v2/images/markeramber.png"*/
                    "red": "images/markerred.png",
                    "default": "https://" + purecommHostParam + ".purecomm.hk/en/map_popup/v2/images/markergreen.png",
                    "green": "images/markergreen.png",
                    "amber": "images/markeramber.png"
                },
                "currentLocation": "https://" + purecommHostParam + ".purecomm.hk/en/map_popup/v2/images/currentLocation.png"
            }
        //}
    }

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



	//var configuration = updateConfig(defaultConfiguration,getConfig(branchId));


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
    
    function init(configFile){
        if(configFile){ 
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
            purecommPopupConfiguration = updateConfig(purecommPopupConfiguration, configFile);
        }
        
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

        console.log("<><><><><><><><><><><><><><><><><><><><><><>")
        //if(purecommFAPI) getConfig (branchId);

        //return configuration;


        
        
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
		'<img class="close" src="'+purecommPopupConfiguration.icons.close+'" alt="" onclick="closeModal()" />' +
		'</div>' +
		'<div class="purecommModalBody" id="purecommModalBody"></div>' +
		'<div class="purecommModalFooter" id="purecommModalFooter">' +

		'</div>' +
		'</div>';

		closeModal = function(){purecommModal.style.display = "none";}
		modal.innerHTML = modalHTML;
		body.appendChild(modal);

		// initialize the map and list view based on popupConfig
		if(purecommPopupConfiguration.defaultView == "list"){ // default view is list
			listInit(1);
			if(purecommPopupConfiguration.mapView){
				mapInit(0);
			}
		} else { // default view is map or undefined
			purecommPopupConfiguration.defaultView == "map"; // map is default view if not defined
			mapInit(1);
			if(purecommPopupConfiguration.listView){
				listInit(0);
			}
		}

		var modalFooter = document.getElementById('purecommModalFooter');

		modalFooter.innerHTML += /*'<div class="mapdiv">' +
		'<span>Nearby</span>' +
		'<img src="' + purecommPopupConfiguration.icons.nearby + '" alt="" onclick="findLocation()" />' +
		'</div>' +*/
		'<div class="searchdiv">' +
		'<img class="searchicon" id="searchicon" src="' + purecommPopupConfiguration.icons.search + '" alt="" onclick="searchLocation()" />' +
		//'<span class="searchtxt" id="searchtxt" onclick="showSearch()">Search</span>' +
		'<input class="searchbox" id="searchbox" type="text" placeholder="Search">' +

		'</div>';

		popupInitialized = true;
    } 

 	if (!popupInitialized) {
 		this.branchId = branchId;
 		this.sessionId = sessionId;
        
        // import purecommFAPIjsInterface.js
		var head = document.getElementsByTagName('head')[0];	
		fapiScript = document.createElement('script');
		fapiScript.type = 'text/javascript';
		fapiScript.src = 'https://' + purecommHostParam + '.purecomm.hk/en/map_popup/v2/purecommFAPIjsInterface.js';
        fapiScript.async = false;
		//fapiScript.src =  'purecommFAPIjsInterface.js'; //todo change back
        fapiScript.onreadystatechange = fapiScript.onload = function() {
           purecommFAPI = new purecommFAPIjsInterface('JZLDKH', 'rmw88', 'uat');
            // get the .properties file
            purecommFAPI.ajax({
                type: "GET",
                url: "https://uat.purecomm.hk/en/testnewpop/config/readConfig.jsp?m=getByAttribute&a=page&c=testnewpop/config/" + branchId + ".properties",
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
        //head.insertBefore(fapiScript, head.firstChild);
        


		// global popup initialization
		//purecommPopupConfiguration = getConfigFile(branchId);
		//console.log(purecommPopupConfiguration);
		
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

 	if (defaultView){
 		currentView = 'list';
 		document.getElementById('purecommTables').style.display = "block";
 	}
 }

/*
 *
 */
 function mapInit (defaultView){
 	purecommPopupConfiguration.mapView = 1;

	// load google maps api and call initializeMap when complete
	var head = document.getElementsByTagName('head')[0];
	var script = document.createElement('script');
	script.src = "https://maps.googleapis.com/maps/api/js?key=AIzaSyD07c9hGOtQnuF30nwqml5OQkqzrPejIFs&libraries=places&callback=initializeMap";
	head.appendChild(script);
	
	var script2 = document.createElement('script');
	script2.src = "https://www.google.com/jsapi?key=AIzaSyD07c9hGOtQnuF30nwqml5OQkqzrPejIFs";
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
	var mv = purecommPopupConfiguration.mapView; // map view to be shown
	var lv = purecommPopupConfiguration.listView; // list view to be shown
	document.getElementById('purecommModal').style.display = "block"; // open the model
	
	purecommStores.forEach(function(store) {
		getMarkerDetails_(store);
	});

    if (purecommStores[0].distance){ // check first store to see if distance is known
		sortStores("distances"); // table populated by default order, use populateTable("name") to sort alphabetically

	} else {
		sortStores("name"); // table populated by default order, use populateTable("name") to sort alphabetically
	}
    
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
			var options = {
				bounds: mapBounds,
				types: ['(cities)'] // doesn't work for SearchBox, only Autocomplete
			}

			purecommMapSearchBox = new google.maps.places.SearchBox(input,options);
			//purecommMapSearchBox.setBounds(mapBounds); // search the location of the origninal map bounds
			purecommMapSearchBox.addListener('places_changed', searchLocation);
		}
	}




	


	/*if (purecommStores[0].distance){ // check first store to see if distance is known
		sortStores("distances"); // table populated by default order, use populateTable("name") to sort alphabetically

	} else {
		sortStores("name"); // table populated by default order, use populateTable("name") to sort alphabetically
	}*/

	if(mv && storesInitialized){
		mapStoreMarkers.forEach(function(marker){
			marker.update(); 
		});
	}

	if (lv){
		populateTable(); // table populated by default order, use populateTable("name") to sort alphabetically
	}
	
	//if(stock.count>0){
	//	totalStoresWithStock ++;
	//}
	
	//document.getElementById('purecommModalHeader').innerHTML = "Item is stocked in "+totalStoresWithStock+" stores";
	//refreshTable();
	if(purecommPopupConfiguration.defaultView == "map"){
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
	/*var same = true;
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
	return same;*/

	if (typeof items1 == 'undefined' || typeof items2 == 'undefined'){
		return false;
	} else {
		console.log("$$$ ARE ITEMS THE SAME? ",JSON.stringify(items1),JSON.stringify(items2),JSON.stringify(items1) == JSON.stringify(items2))
		return JSON.stringify(items1) == JSON.stringify(items2);
	}
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

	var purecommOrderNumber = "rmwDemoOrder2"; //TODO 

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

function searchLocation(address){
	var places = purecommMapSearchBox.getPlaces();
	if (places.length == 0) {
		return;
	}
	console.log("address",address,places);
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

/*
 * find a location on the map and calculate distances to that location
 * position is given, when called from a search
 * position is null, when locating the user
 */
 function findLocation(position,bounds){
 	if (position){
		// position given
		var location = { lat: position.lat(), lng: position.lng() };
		localize(location,purecommPopupConfiguration.map.searchedLocation);
		//mapCurrentLocationMarker.setIcon(new google.maps.MarkerImage(purecommPopupConfiguration.map.searchedLocation));
	} /*else if (navigator.geolocation) {
		// HTML5 geolocation.
		navigator.geolocation.getCurrentPosition(function(pos) {
			var location = { lat: pos.coords.latitude, lng: pos.coords.longitude };
			localize(location,purecommPopupConfiguration.map.currentLocation);
		});
	} else if(google.loader.ClientLocation) {
		alert("Alert2: " + google.loader.ClientLocation);
		var location = { lat: google.loader.ClientLocation.latitude, lng: google.loader.ClientLocation.longitude };
		localize(location,purecommPopupConfiguration.map.currentLocation);
	}*/

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

		sortStores("distance");
		
		// resort the table
		populateTable();
		mapStoreMarkers.forEach(function(marker){
			marker.updateLabel();
		});

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

/*
 * sort the stores by distance or alphabetically
 * assign store index
 */
function sortStores(sortBy){
	// sort the stores
	if (sortBy == "name"){
		purecommStores.sort(function(a,b){
			if(a.storeName < b.storeName) return -1;
			if(a.storeName > b.storeName) return 1;
			return 0;})
	} else if (sortBy == "distance"){
		purecommStores = purecommStores.sort(function(a,b){return a.distance - b.distance})
	}
	var i = 1;
	purecommStores.forEach(function(store) {
		store["index"] = i++;
	});
}

function populateTable(){
	// repopulate table
	var table = document.getElementById("table_inStock");
	table.innerHTML = ""; // clear the table
	purecommStores.forEach(function(store) {
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
		
		return contentString;
	}
}


function mapStoreMarker(store) {
	markerZ = store.icon.z + 10000 - store.index;
	// create store marker
	var marker = new google.maps.Marker({
		map: map,
		position: store.coords,
		zIndex: markerZ,
		icon: {
			url: store.icon.url,
			labelOrigin: new google.maps.Point(14,10),
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
			marker.setIcon(markerdetails.icon.url);
			marker.setZIndex(markerdetails.icon.z);
			marker.setLabel(""+store.index);
		}
		// TODO update distance?
	}
	this.updateLabel = function(){
		if (store.availability){
			marker.setLabel(""+store.index);
		}
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
		var contentString = '<div class="iwContent">' +
		'<p class="p1">'+
		store.storeName + '</p>' +
		'<p class="p2">'+
		store.storeAddress + '</p>' +
		'<p class="p1">'+
		store.availability + '</p>' +
		'<button class="purecommTextButton" type="button" onclick=purecommSetSelectedStore("' + store.storeId + '","")>Select Store</button>' + 
		'<button class="purecommTextButton" type="button" onclick=showListView("' + store.storeId + '","list")>Store Details</button>' + 
		'</div>';

		getStore = function () { // button on infowindow function
			return store; // reset the train alarm
		}
		return contentString;
	}

	mapStoreMarkers.push(this); // push the marker

}

function getMarkerDetails_(store){
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