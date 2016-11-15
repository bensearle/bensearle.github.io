// cartItems is an array of SKUs

var branchId, 
	sessionId,
	popupInitialized, // has the popup been initialized
	storesInitialized, // have the stores been initialized
	currentView, // current view of popup is either 'map' or 'list'
	popupConfig, // the details from the config file for popup customization
	map, // the google map
	selectedStore, // JSON of selected store id and details
	test;



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

	    //TODO change CSS based on config

	    // create modal html
		var modal = document.createElement('div');
		modal.id = 'purecommModal';
		modal.className = 'purecommModal';
		
		modal.onclick = function(event) {
			if (event.target == purecommModal) {
				purecommModal.style.display = "none"; // close modal if  user clicks outside of it
			}
		}

		var modalHTML =	'<div class="purecommModalContent">' +
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

		// initialize the map and list view based on popupConfig
		if(popupConfig.defaultView == "list"){ // default view is list
			listInit(1);
			if(popupConfig.mapView){
				mapInit(0);
			}
		} else { // default view is map or undefined
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
	console.log('init list');

	var modalBody = document.getElementById('purecommModalBody');
	var modalFooter = document.getElementById('purecommModalFooter');
	var bodyHTML =  '<div id="purecommTables" class="tables">' +
						'<table id="table_inStock" class="table"></table>' +
						'<table id="table_noStock" class="table"></table>' +
					'</div>';
	var footerHTML ='<div class="listdiv">' +
						'<span>List</span>' +
						'<img class="view" id="listbtn" src="images/listview.png" alt="" onclick="listview()" />' +
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
	console.log('init map');
	// load google maps api and call initializeMap when complete
	var head = document.getElementsByTagName('head')[0];
	var script = document.createElement('script');
	script.src = "https://maps.googleapis.com/maps/api/js?key=AIzaSyD07c9hGOtQnuF30nwqml5OQkqzrPejIFs&callback=initializeMap";
	head.appendChild(script);

	var modalBody = document.getElementById('purecommModalBody');
	var modalFooter = document.getElementById('purecommModalFooter');
	var bodyHTML = 	'<div id="purcommMap" class="map"></div>';
	var footerHTML ='<div class="mapdiv">' +
						'<span>Map</span>' +
						'<img id="mapbtn" src="images/mapview.png" alt="" onclick="mapview()" />' +
					'</div>';	

	modalBody.innerHTML += bodyHTML;
	modalFooter.innerHTML += footerHTML;

	if (defaultView){
		currentView = 'map';
		document.getElementById('purcommMap').style.display = "block";
	}
}

/*
 * when the google maps api is loaded, this method will run
 * map is defined 
 */
function initializeMap() {
	console.log("map being initialized");
	map = new google.maps.Map(document.getElementById('map'), {
		center: mapCenter, // this data is overwritten when popup is clicked
		zoom: 15,
		mapTypeId: google.maps.MapTypeId.ROADMAP,
		mapTypeControl: false // no option to change map type
	});
	google.maps.event.addListener(map, 'click', function () { // click on the map
	    //TODO closeIW()
	    //closeIW(); // close all infowindows
	});
}

/*
function storesInit(){
	if (!storesInitialized){
		
		stores = getStoreDetails();

		bounds = new google.maps.LatLngBounds();
		stores.forEach(function(storeDetails) {
			//console.log(storeDetails);
			//var stock = getStockCount(storeDetails.id);
			new StoreMarker(storeDetails);
			bounds.extend(storeDetails.coords);
			//if(stock.count>0){
			//	totalStoresWithStock ++;
			//}
		});

		//document.getElementById('purecommModalHeader').innerHTML = "Item is stocked in "+totalStoresWithStock+" stores";
		refreshTable();
		mapview();
		google.maps.event.trigger(map,'resize');
		map.fitBounds(bounds);

		storesInitialized = true;
	} 
}
function openModel() {
	else {
	}
}
*/

/*
 * popup store selection map for a single SKU
 */
function purecommProductAvailabilityPopup(sku){
	if (popupInitialized){
		// popup has been initialized
		// do stuff
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

	if (branchId == "id123"){
		return {mapView:1, listView:1, defaultView:"map", iconNearby:true, bgColor:"black", fgColor:"white", fontFamily:"'Source Sans Pro', 'Helvetica Neue', Helvetica, Arial, sans-serif",
			mapPointer:{anchor: "bottom", default:"images/markergreen.png", green:"images/markergreen.png", amber:"images/markeramber.png", red:"images/markerred.png"}};
	} else {
		return {mapView:0, listView:1, defaultView:"list", iconNearby:false, bgColor:"blue", fgColor:"red", fontFamily:"'Times New Roman', Helvetica, Arial, sans-serif",
			mapPointer:{anchor: "middle", default:"images/markergreen.png", green:"images/markergreen.png", amber:"images/markeramber.png", red:"images/markerred.png"}};
	}
}

function getStores (){

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