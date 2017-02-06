/*jslint vars: true, indent: 4, maxerr: 50 */
/*global console*/
/*global google*/
/*global PurecommFAPIjsInterface*/


// cartItems is an array of SKUs

var //popupConfig, // the details from the config file for popup customization
	//branchId, // a “virtual branch” used to identify the client website, and pick up the config file. 
	//sessionId, // a website Id that’s used as a temporary Purecomm order number, until the actual order number is allocated

	currentView, // current view of popup is either 'map' or 'list'
	searchRefresh, // true if the user has searched and the map needs bounds set/table top row needs to be in view
	test;

var purecommBranchId, // a “virtual branch” used to identify the client website, and pick up the config file.
    purecommLanguage, // language for the popup
    purecommPopupConfiguration, // the details from the config file for popup customization
    purecommFAPI, // instance of the FAPI interface
	purecommItems, // array for skus
	purecommStores, // array of stores
	purecommMapSearchBox, // google places search box
	purecommCallback, // function to be called when a store is selected purecommCallback(storeId);
	map, // the google map
	mapStoreMarkers = [], // array of the markers
	mapOpenedIW, // the infowindow that is currently open
	mapCurrentLocationMarker, // marker for the current/searched location of the user	
	mapInitialized, // true after the map has been opened for the first time and resized
    popupInitialized, // has the popup been initialized
	storesInitialized, // have the stores been initialized
    purecommSearchBoxBounds, // bounds for all stores, used for the bounds of the searchbox and default view location is not know and no cookies
	purecomm_SelectedStoreID, // COOKIE: store id that has been selected
	purecomm_SortFrom, // COOKIE: coordinates for current/seatched location, stores will be sorted by distance to this location
	purecomm_MapBounds, // COOKIE: last known mapbounds, updated when new search and closing the modal
    purecommUserLocation, // coordinates of the user
    purecommPopupConfiguration, // the details from the config file for popup customization
    purecommHost, // eg. "https://www.purecomm.hk" OR "https://uat.purecomm.hk"
    purecommHostFiles; // location of css, images, etc

if (document.currentScript) {
    purecommHost = 'https://' + document.currentScript.src.split("/")[2];
    purecommHostFiles = document.currentScript.src.replace("purecommClickAndCollect.js", "") + 'map_popup/';
    if (document.currentScript.src.split("/")[2].indexOf('localhost') !== -1) { // localhost is the host
        purecommHost = 'https://www.purecomm.com';
    }
} else {
    //IE
    var allScripts = document.getElementsByTagName('script'),
        currentScript = allScripts[allScripts.length - 1];
    purecommHost = 'https://' + currentScript.src.split("/")[2];
    purecommHostFiles = currentScript.src.replace("purecommClickAndCollect.js", "") + 'map_popup/';
    
}

//**************************************************************************************

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
            "map": purecommHostFiles + "images/mapview_white.png",
            "mapSelected": purecommHostFiles + "images/mapview_black.png",
            "list": purecommHostFiles + "images/listview_white.png",
            "listSelected": purecommHostFiles + "images/listview_black.png",
            "search": purecommHostFiles + "images/search_black.png",
            //"nearby": purecommHostFiles + "images/gps_white.png",
            "close": purecommHostFiles + "images/close_white.png"
        },
        "map": {
            "searchedLocation": purecommHostFiles + "images/search_black.png",
            "store": {
                "red": purecommHostFiles + "images/markerred.png",
                "default": purecommHostFiles + "images/markergreen.png",
                "green": purecommHostFiles + "images/markergreen.png",
                "amber": purecommHostFiles + "images/markeramber.png"
            },
            "currentLocation": purecommHostFiles + "images/currentLocation.png"
        }
        //}
    };
}

/*
 **************************************************************************************
 * Cookie functionality
 * cname: name of cookie
 * cvalie: value of cookie
 * exdays: days until the cookie expires
 */
function setCookie(cname, cvalue) {
    'use strict';
	var exdays = 7, // expire in 7 days
        d = new Date(),
        expires;
	d.setTime(d.getTime() + (exdays * 86400000)); // 86400000=24*60*60*1000
    expires = "expires=" + d.toGMTString();
	document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}
function getCookie(cname) {
    'use strict';
	var name = cname + "=",
        ca = document.cookie.split(';'),
        i, // index
        c; // cookie
	for (i = 0; i < ca.length; i += 1) {
		c = ca[i];
		while (c.charAt(0) === ' ') {
			c = c.substring(1);
		}
		if (c.indexOf(name) === 0) {
			return c.substring(name.length, c.length);
		}
	}
	return false; // return false if the cookie does not exist 
}
function deleteCookie(cname) {
    'use strict';
	setCookie(cname, "", -1);
}


//**************************************************************************************

/*
 * find disance between a point and each store
 * referencePoint is either current location or a searched location
 */
function getStoreDistances(referencePoint) {
    'use strict';
    // Haversine formula
	function distanceBetweenPoints(p1, p2) {
		var radians = function (x) {return x * Math.PI / 180; },
            R = 6378137, // Earth’s mean radius in meter
            dLat = radians(p2.lat - p1.lat), // lat distance
            dLng = radians(p2.lng - p1.lng), // lng distance
            a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(radians(p1.lat)) * Math.cos(radians(p2.lat)) *
                Math.sin(dLng / 2) * Math.sin(dLng / 2),
            c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)),
            d = R * c;
		return Math.ceil(d / 100) / 10; // return distance in km, rounded to nearest 100m
		//return Math.ceil(d/1000); // return distance in km, rounded up
		//return d; // returns the distance in metres
	}
    // get distances
	purecommStores.forEach(function (store) {
		if (store.coordinates !== null && store.coordinates !== "" && typeof store.coordinates !== "undefined") {
			store.distance = distanceBetweenPoints(referencePoint, store.coordinates);
		}
	});
}

/*
 * sort the stores by distance or alphabetically
 * assign store index
 */
function sortStores(sortBy) {
    'use strict';
    // sort the stores
	if (sortBy === "name") {
		purecommStores.sort(function (a, b) { // a and b are stores
			if (a.storeName < b.storeName) {
                return -1;
            } else if (a.storeName > b.storeName) {
                return 1;
            } else {
                return 0;
            }
        });
	} else { //if (sortBy == "distance"){
		purecommStores = purecommStores.sort(function (a, b) {return a.distance - b.distance; });
	}
	var i = 0;
	purecommStores.forEach(function (store) {
		store.index = i += 1;
	});
}

/*
 *
 */
function listInit(defaultView) {
    'use strict';
    purecommPopupConfiguration.listView = 1;

    var modalBody = document.getElementById('purecommModalBody'),
        modalFooter = document.getElementById('purecommModalFooter'),
        bodyHTML =  '<div id="purecommTables" class="tables">' +
            '<table id="table_inStock" class="table"></table>' +
            '<table id="table_noStock" class="table"></table>' +
            '</div>',
        footerHTML = '<div class="listdiv" id="listdiv" onclick="showListView()">' +
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
function mapInit(defaultView) {
    'use strict';
    purecommPopupConfiguration.mapView = 1;

	// load google maps api and call initializeMap when complete
    var head = document.getElementsByTagName('head')[0],
        modalBody = document.getElementById('purecommModalBody'),
        modalFooter = document.getElementById('purecommModalFooter'),
        bodyHTML = '<div id="purecommMap" class="map"></div>',
        footerHTML = '<div class="mapdiv" id="mapdiv" onclick="showMapView()">' +
            '<span>Map</span>' +
            '<img id="mapbtn" src="' + purecommPopupConfiguration.icons.map + '" alt=""  />' +
            '</div>',
        script = document.createElement('script');
	script.src = "https://maps.googleapis.com/maps/api/js?key=AIzaSyD07c9hGOtQnuF30nwqml5OQkqzrPejIFs&libraries=places&callback=initializeMap";
	head.appendChild(script);
	
	//var script2 = document.createElement('script');
	//script2.src = "https://www.google.com/jsapi?key=AIzaSyD07c9hGOtQnuF30nwqml5OQkqzrPejIFs&callback=findLocation";
	//head.appendChild(script2);


	

	modalBody.innerHTML += bodyHTML;
	modalFooter.innerHTML += footerHTML;

	if (defaultView) {
		currentView = 'map';
		document.getElementById('purecommMap').style.display = "block";
	}


}

/*
 * when the google maps api is loaded, this method will run
 * map is defined 
 */
function initializeMap() {
    'use strict';
    map = new google.maps.Map(document.getElementById('purecommMap'), {
        styles: [{ featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }]}], // remove points of interest
        clickableIcons: false, // disable google's clickable items and stop their infowindows appearing
        zoom: 15,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        mapTypeControl: false // no option to change map type
    });
	google.maps.event.addListener(map, 'click', function () { // click on the map
		if (mapOpenedIW) {
			mapOpenedIW.close(); // close IW
			mapOpenedIW = null; // no IW is open
		}
	});

    // add the google logo, without hyperlink
    var googlelogo = document.createElement("img");
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


function removeItem(array, item) {
    'use strict';
    var i;
	for (i = array.length; i > -1; i -= 1) {
		if (array[i] === item) {
			array.splice(i, 1);
		}
	}
}

/*
 * function to display the map view
 * storeID is given if there 
 */
function showMapView(storeID) {
    'use strict';
    // change button colours
	document.getElementById('listbtn').src = purecommPopupConfiguration.icons.list;
	document.getElementById('listdiv').style.color = purecommPopupConfiguration.css.colors.modalFG;
	document.getElementById('listdiv').style.backgroundColor = purecommPopupConfiguration.css.colors.modalBG;
	document.getElementById('mapbtn').src = purecommPopupConfiguration.icons.mapSelected;
	document.getElementById('mapdiv').style.color = purecommPopupConfiguration.css.colors.modalBG;
	document.getElementById('mapdiv').style.backgroundColor = purecommPopupConfiguration.css.colors.modalFG;

	document.getElementById("purecommTables").style.display = "none";
	//closeIW();
	document.getElementById("purecommMap").style.display = "block";

	if (!mapInitialized) {
		google.maps.event.trigger(map, 'resize');
        if (purecomm_MapBounds) {
            map.fitBounds(purecomm_MapBounds); // setting bounds to a previous get bounds will be zoomed out 1 level
            map.setZoom(map.getZoom() + 1); // zoom in one level
        } else {
            map.fitBounds(purecommSearchBoxBounds);
        }
		mapInitialized = 1;
	}

	if (storeID) {
		mapStoreMarkers.forEach(function (marker) {
			if (marker.getID() === storeID) {
				marker.viewOnMap();
			}
		});
	} else if (searchRefresh) {
		//**
		map.fitBounds(purecomm_MapBounds);
		if (map.getZoom() > 15) {
            map.setZoom(15); // max zoom to 15
        }
        searchRefresh = false;
	}
}

function showListView(storeID) {
	'use strict';
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

	if (storeID) {
		var storeRow = document.getElementById(storeID);
		storeRow.scrollIntoView(true);
	} else if (searchRefresh) {
		document.getElementById("table_inStock").scrollIntoView(true);
		searchRefresh = false;
	}
}


/*
 * compare whether 2 javascript objects are the same
 * the 2 objects will be sku or cartItems
 */
function sameItems(items1, items2) {
	'use strict';
    if (typeof items1 === 'undefined' || typeof items2 === 'undefined') {
		return false;
	} else {
		return JSON.stringify(items1) === JSON.stringify(items2);
	}
}


function closePurecommModal() {
    'use strict';
    var coordinates = map.getCenter(),
		center = {"lat": coordinates.lat(), "lng": coordinates.lng()},
		zoom = map.getZoom();
	
    purecomm_MapBounds = map.getBounds();
    setCookie("purecomm_MapBounds", JSON.stringify(purecomm_MapBounds));
    document.getElementById('purecommModal').style.display = "none";
}

/*
 * TODO just returns Store ID
 * returns a JSON object with store name, store Id, opening hours, address etc.
 */
function purecommGetSelectedStore() {
    'use strict';
    if (purecomm_SelectedStoreID) {
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
	'use strict';
    purecomm_SelectedStoreID = storeID; // set local variable
	setCookie("purecomm_SelectedStoreID", storeID, 7); // set cookie
    var i,
        store;
    for (i = 0; i < purecommStores.length; i += 1) {
        store = purecommStores[i];
        if (store.storeId === storeID) {
            console.info("Selected store details:", store);
            console.info("Calling function:", purecommCallback);
            purecommCallback(store);
            closePurecommModal();
            return true;
        }
    }
    console.error("Couldn't find store details:", storeID);
    return false;
}


function populateTable() {
    'use strict';
    
    function getOpening(opening) {
        var hrs = '';
        if (opening.openTime && opening.closeTime) {
            hrs = opening.openTime + ' - ' + opening.closeTime;
        } else {
            hrs = 'closed';
        }
        switch (opening.day) {
        case 1:
            return '<tr><th>Monday</th><th>' + hrs + '</th></tr>';
        case 2:
            return '<tr><th>Tuesday</th><th>' + hrs + '</th></tr>';
        case 3:
            return '<tr><th>Wednesday</th><th>' + hrs + '</th></tr>';
        case 4:
            return '<tr><th>Thursday</th><th>' + hrs + '</th></tr>';
        case 5:
            return '<tr><th>Friday</th><th>' + hrs + '</th></tr>';
        case 6:
            return '<tr><th>Saturday</th><th>' + hrs + '</th></tr>';
        case 7:
            return '<tr><th>Sunday</th><th>' + hrs + '</th></tr>';
        default:
            return '';
        }
    }
    //TODO display phone number
	function tableString(store) {
		var openinghoursString = '',
            distance = "",
            contentString,
            selectStoreElement = '<button class="purecommTextButton" type="button" onclick=purecommSetSelectedStore("' + store.storeId + '","")>Select Store</button>';

        if (store.distance) {
			distance = " (" + store.distance + "km)";
		}

        if (store.openingHours) {
            // sort the stores day1 - day7
            store.openingHours.sort(function (a, b) { // a and b are opening hours
                return a.day - b.day;
            });
            store.openingHours.forEach(function (opening) {
                openinghoursString += getOpening(opening);
            });
        }
        
        if (store.cannotBeSelected) {
            selectStoreElement = '';
        }
        
		// html content of the table
        contentString = '<div class="tableRow" id="' + store.storeId + '" >' +
            '<figure><img src="' + store.icon.url + '"><figcaption>' + store.index + '</figcaption></figure>' +
            '<div class="left">' +
            '<p class="p1">' + store.availability + '</p>' +
            '<p class="p1">' + store.storeName + ' ' + distance + '</p>' +
            '<p class="p2">' + store.storeAddress + '</p>' +
            '<button class="purecommTextButton" type="button" onclick=showMapView("' + store.storeId + '","map")>View on Map</button>' +
            selectStoreElement +
            '</div>' +
            '<div class="right">' +
            '<table class="p2">' +
            openinghoursString + '</table>' +
            '</div>' +
            '</div>';
		
		return contentString;
	}
    
    // repopulate table
	var table = document.getElementById("table_inStock");
	table.innerHTML = ""; // clear the table
	purecommStores.forEach(function (store) {
		table.insertRow(-1).insertCell(0).innerHTML = tableString(store); // add each row to the table
	});
	table.scrollIntoView(true); // go to top of table


}

/*
 * find a location on the map and calculate distances to that location
 * position is given, when called from a search
 * position is null, when locating the user
 */
function findLocation(position, bounds) {
    'use strict';
	function localize(location, iconImage) {
        var newBounds = new google.maps.LatLngBounds(location),
            markerImage,
            marker;
		purecomm_SortFrom = location;
		setCookie('purecomm_SortFrom', JSON.stringify(location), 7);
        if (iconImage) {
            markerImage = new google.maps.MarkerImage(
                iconImage, // ** TODO take image from config file
                new google.maps.Size(30, 30), // size
                new google.maps.Point(0, 0), // origin
                new google.maps.Point(15, 15), // anchor (location on map)
                new google.maps.Size(30, 30)
            ); // scaled size
			if (!mapCurrentLocationMarker) {
                marker = new google.maps.Marker({
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

		getStoreDistances(location); // get the distance between each store and this postion
		sortStores("distance"); // sort the stores by distance
		
		// resort the table
		populateTable();
		mapStoreMarkers.forEach(function (marker) {
			marker.updateLabel();
		});

		// fit bounds of map to the searched location and the nearest store
		newBounds.extend(purecommStores[0].coordinates);
		//if(bounds){
			//newBounds.union(bounds);
		//}

		map.fitBounds(newBounds);
		purecomm_MapBounds = newBounds;
		if (map.getZoom() > 15) {
            map.setZoom(15); // max zoom to 15
        }
		//if (map.getZoom() < 4) map.setZoom(map.getZoom()+1); // zoom in if zoomed out too far
		searchRefresh = true;

        purecommSetCSS(); // set css for browsers where css vars are not supported
        
		// close infowindow
		if (mapOpenedIW) {
			mapOpenedIW.close(); // close IW
			mapOpenedIW = null; // no IW is open
		}
	}
    
    var location;
    if (position) {
		// position given
        location = { lat: position.lat(), lng: position.lng() };
		localize(location);
		//mapCurrentLocationMarker.setIcon(new google.maps.MarkerImage(purecommPopupConfiguration.map.searchedLocation));
	} else if (purecommUserLocation) {
		localize(purecommUserLocation, purecommPopupConfiguration.map.currentLocation);
	} else if (navigator.geolocation) {
		// HTML5 geolocation.
		navigator.geolocation.getCurrentPosition(function (pos) {
			purecommUserLocation = { lat: pos.coords.latitude, lng: pos.coords.longitude };
		});
	} else if (google.loader.ClientLocation) {
		//alert("Alert2: " + google.loader.ClientLocation);
        location = { lat: google.loader.ClientLocation.latitude, lng: google.loader.ClientLocation.longitude };
		localize(location);
	}

}



/*
 * a marker object to be displayed on the map
 */
function MapStoreMarker(store) {
	'use strict';
    
    function iwString(store) {
        var selectStoreElement = '<button style="font-family:' + purecommPopupConfiguration.css.fontFamily + ';background-color:' + purecommPopupConfiguration.css.colors.modalBG + ';color:' + purecommPopupConfiguration.css.colors.modalFG + ';" class="purecommTextButton" type="button" onclick=purecommSetSelectedStore("' + store.storeId + '","")>Select Store</button>';
        if (store.cannotBeSelected) {
            selectStoreElement = '';
        }
                
		// html content of the infowindow
		var contentString = '<figure><img src="' + store.icon.url + '"><figcaption>' + store.index + '</figcaption></figure>' +
            '<div class="iwContent">' +
            '<p class="p1">' + store.availability + '</p>' +
            '<p class="p1">' + store.storeName + '</p>' +
            '<p class="p2">' + store.storeAddress + '</p>' +
            '<button style="font-family:' + purecommPopupConfiguration.css.fontFamily + ';background-color:' + purecommPopupConfiguration.css.colors.modalBG + ';color:' + purecommPopupConfiguration.css.colors.modalFG + ';" class="purecommTextButton" type="button" onclick=showListView("' + store.storeId + '","list")>View in List</button>' +
            selectStoreElement +
            '</div>',
            getStore = function () { // button on infowindow function
                return store; // reset the train alarm
            };
		return contentString;
	}
    


	function closeOpenedIW() {
		if (mapOpenedIW) {
			mapOpenedIW.close(); // close the opened IW
			mapOpenedIW = null; // no IW is open
		}
	}
    
    var markerZ = store.icon.z + 10000 - store.index,
        marker = new google.maps.Marker({ // create store marker
            map: map,
            position: store.coordinates,
            zIndex: markerZ,
            icon: {
                url: store.icon.url,
                labelOrigin: new google.maps.Point(14, 11),
                scaledSize: new google.maps.Size(28, 28)
            },
            label: {
                text: store.index.toString(),
                color: 'black',
                fontSize: "12px",
                zIndex: markerZ
            }
        }),
        markerIW  = new google.maps.InfoWindow({
			content: iwString(store)
		});
    
    function isInfoWindowOpen() {
		// check to see if the info window is open (on the map)
		var map = markerIW.getMap();
		return (map !== null && typeof map !== "undefined");
	}

	function openIW() {
		closeOpenedIW();
		markerIW.close(map, marker); // close this IW
		markerIW.open(map, marker); // open this IW
		mapOpenedIW = markerIW; // set this IW to the opened IW
		// make the IW window color match the config
		if (purecommPopupConfiguration.css.colors.bodyBG) {
			var color = purecommPopupConfiguration.css.colors.bodyBG,
                iwOuter = document.getElementsByClassName('gm-style-iw')[0],
                iwBackground = iwOuter.previousSibling,
                children = iwBackground.getElementsByTagName('div');
			//children[1].style.backgroundColor = color; // iw shadow
			children[4].style.backgroundColor = color; // iw arrow 
			children[6].style.backgroundColor = color; // iw arrow
			children[7].style.backgroundColor = color; // iw padding	
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

    // returned functions that are called after the marker is initialized
	function getID() {
        return store.storeId;
    }
    function viewOnMap() { // go to this marker on the map
        map.setCenter(marker.getPosition());
        map.setZoom(14);
        openIW();
    }
    function updateLabel() { // update the index number on the marker
        marker.setLabel(store.index.toString());
        markerIW.setContent(iwString(store));

    }
    function remove() { // remover this marker from the map
        marker.setMap(null);
    }
    
    return {
		getID: getID,
		viewOnMap: viewOnMap,
		updateLabel: updateLabel,
		remove: remove
	};
}

function getMarkerDetails(store) {
    'use strict';
    
    if (store.lowStock) {
        store.icon = {"url": purecommPopupConfiguration.map.store.amber, "z": 500000};
        store.availability = "Limited Stock";
        return;
    }
    
    switch (store.availability) {
    case "Immediate": // returned from FAPI
    case "In Stock":
        store.icon = {"url": purecommPopupConfiguration.map.store.green, "z": 800000};
        store.availability = "In Stock";
        break;
    case "TBC": // retured from FAPI
    case "Limited Stock":
    case "Some Items Available":
    case "Available in 2-3 Days":
        store.icon = {"url": purecommPopupConfiguration.map.store.amber, "z": 400000};
        store.availability = "Available in 2-3 Days";
        break;
    case "Insufficient Stock": // returned from FAPI
    case "Not Available":
    default:
        if (store.unavailableSkus.length < purecommItems.length) {
            store.icon = {"url": purecommPopupConfiguration.map.store.amber, "z": 400000};
            store.availability = "Some Items Unvailable";
            return;
        }
        store.icon = {"url": purecommPopupConfiguration.map.store.red, "z": 100000};
        store.availability = "Not Available";
        store.cannotBeSelected = true;
        break;
	}
}

function purecommSetCSS() {
    'use strict';
    // IE doesn't support CSS vars in root
    // change CSS of elements to match config
    if (!(window.CSS && window.CSS.supports && window.CSS.supports('--fake-var', 0))) { // check if browser supports css vars
        var fontFamily = purecommPopupConfiguration.css.fontFamily,
            modalBG = purecommPopupConfiguration.css.colors.modalBG,
            modalFG = purecommPopupConfiguration.css.colors.modalFG,
            bodyBG = purecommPopupConfiguration.css.colors.bodyBG,
            bodyFG = purecommPopupConfiguration.css.colors.bodyFG,
            modalContent = document.getElementsByClassName('purecommModalContent'),
            modalFooter = document.getElementById('purecommModalFooter'),
            textButton = document.getElementsByClassName('purecommTextButton'),
            mapdiv = modalFooter.getElementsByClassName('mapdiv'),
            listdiv = modalFooter.getElementsByClassName('listdiv'),
            searchdiv = modalFooter.getElementsByClassName('searchdiv'),
            searchbox = modalFooter.getElementsByClassName('searchbox'),
            modalBody = document.getElementById('purecommModalBody'),
            modalBody_p = modalBody.getElementsByTagName('p'),
            modalBody_pre = modalBody.getElementsByTagName('pre'),
            modalBody_tables = document.getElementsByClassName('tables'),
            modalBody_tables_tr = document.getElementsByTagName('tr'),
            modalBody_map = document.getElementsByClassName('map'),
            modalBody_iwContent = document.getElementsByClassName('iwContent'),
            modalBody_tableRow = document.getElementsByClassName('tableRow'),
            i = 0,
            element;

        for (i = 0; i < modalContent.length; i += 1) {
            element = modalContent[i];
            console.log(element);
            element.style.fontFamily = fontFamily;
            element.style.backgroundColor = modalBG;
            element.style.color = modalFG;
        }

        for (i = 0; i < textButton.length; i += 1) {
            element = textButton[i];
            console.log(element);
            element.style.fontFamily = fontFamily;
            element.style.backgroundColor = modalBG;
            element.style.color = modalFG;
        }

        for (i = 0; i < mapdiv.length; i += 1) {
            element = mapdiv[i];
            console.log(element);
            element.style.border = '1px solid ' + modalFG;
        }

        for (i = 0; i < listdiv.length; i += 1) {
            element = listdiv[i];
            console.log(element);
            element.style.border = '1px solid ' + modalFG;
        }

        for (i = 0; i < searchdiv.length; i += 1) {
            element = searchdiv[i];
            console.log(element);
            element.style.backgroundColor = modalFG;
        }

        for (i = 0; i < searchbox.length; i += 1) {
            element = searchbox[i];
            console.log(element);
            element.style.fontFamily = fontFamily;
        }
        
        for (i = 0; i < modalBody_p.length; i += 1) {
            element = modalBody_p[i];
            console.log(element);
            element.style.fontFamily = fontFamily;
        }
        
        for (i = 0; i < modalBody_pre.length; i += 1) {
            element = modalBody_pre[i];
            console.log(element);
            element.style.fontFamily = fontFamily;
        }

        for (i = 0; i < modalBody_tables.length; i += 1) {
            element = modalBody_tables[i];
            console.log(element);
            element.style.backgroundColor = bodyBG;
            element.style.color = bodyFG;
        }
        
        for (i = 0; i < modalBody_tables_tr.length; i += 1) {
            element = modalBody_tables_tr[i];
            console.log(element);
            element.style.borderBottom = '2px solid ' + bodyFG;
        }
        
        for (i = 0; i < modalBody_map.length; i += 1) {
            element = modalBody_map[i];
            console.log(element);
            element.style.color = bodyFG;
        }
        
        for (i = 0; i < modalBody_iwContent.length; i += 1) {
            element = modalBody_iwContent[i];
            console.log(element);
            element.style.color = bodyFG;
        }
        
        for (i = 0; i < modalBody_tableRow.length; i += 1) {
            element = modalBody_tableRow[i];
            console.log(element);
            element.style.color = bodyFG;
        }

    }
}

/*
 * when the popup is opened for the first time, the store information is initialized
 */
function purecommOpenModal() {
    'use strict';
    console.log(purecommStores);
	var mv = purecommPopupConfiguration.mapView, // map view to be shown
        lv = purecommPopupConfiguration.listView, // list view to be shown
        storeIndex,
        store,
        coordinates;
	document.getElementById('purecommModal').style.display = "block"; // open the model

	mapStoreMarkers.forEach(function (marker) {
		marker.remove();
	});
	mapStoreMarkers = [];
     
	purecommSearchBoxBounds = new google.maps.LatLngBounds(); // bounds for the initial view of the map

    // get create store coordinates and get marker details
	for (storeIndex = purecommStores.length - 1; storeIndex > -1; storeIndex -= 1) { // iterate backwards, because stores will be removed
		store = purecommStores[storeIndex];
	//purecommStores.forEach(function(store) {
		getMarkerDetails(store); // update store with details for map marker: shown on mapView and listView
		if (!store.longitude || !store.longitude) {
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
							coordinates = response.results[0].geometry.location;
							store['coordinates'] =  coordinates;
							new mapStoreMarker(store); // create map marker for every store
							//mapBounds.extend(coordinates); // extend bounds to show the marker
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
            coordinates = {"lat": parseFloat(store.latitude), "lng": parseFloat(store.longitude)};
			store.coordinates =  coordinates; // add googlemaps friendly coordinates attribute to store
			purecommSearchBoxBounds.extend(store.coordinates); // extend bounds for search box and to show the marker	
		}
	}//);

    // sort the stores 
	if (purecomm_SortFrom) {
		getStoreDistances(purecomm_SortFrom); // get the distance between each store and this postion
		sortStores("distance");
		//getStoreDistances(location); // get the distance between each store and this postion
		//sortStores("distance"); // sort the stores by distance
	} else if (purecommStores[0].distance) { // check first store to see if distance is known
		sortStores("distance");
	} else {
		sortStores("name"); // table populated by default order, use populateTable("name") to sort alphabetically
	}
    
    // create a marker for each store
    purecommStores.forEach(function (store) {
        if (mv) {
            var storeMarker = new MapStoreMarker(store); // create map marker for every store
            mapStoreMarkers.push(storeMarker); // push the marker to list
        }
    });
    
    if (!storesInitialized) { // if stores aren't itialized	    
		
		// Create the search box and link it to the UI element.
	    var pacInput = (document.getElementById('pac-input')),
            options = {
                bounds: purecommSearchBoxBounds,
                types: ['(cities)'] // doesn't work for SearchBox, only Autocomplete
            },
            searchBox = new google.maps.places.SearchBox(pacInput, options);
        
		google.maps.event.addListener(searchBox, 'places_changed', function () {
	        var places = searchBox.getPlaces(),
                markers = [];
	        if (places.length === 0) {
	            return;
	        }
			places.forEach(function (place) {
				if (!place.geometry) {
					console.log("Returned place contains no geometry");
					return;
				}
				console.log("*****PLACE", place);
				findLocation(place.geometry.location, place.geometry.viewport);
			});
	    });
	    // Trigger search on button click
	    document.getElementById('searchicon').onclick = function () {
	        google.maps.event.trigger(pacInput, 'focus');
	        google.maps.event.trigger(pacInput, 'keydown', {
	            keyCode: 13
	        });
	    };
	}

	mapStoreMarkers.forEach(function (marker) {
		marker.updateLabel();
	});
	if (purecomm_MapBounds) {
		map.fitBounds(purecomm_MapBounds); // setting bounds to a previous get bounds will be zoomed out 1 level
		map.setZoom(map.getZoom() + 1); // zoom in one level
	} else if (purecommUserLocation) {
		findLocation();
	} else {
		map.fitBounds(purecommSearchBoxBounds);
	}

	if (lv) {
		populateTable(); // table populated by default order, use populateTable("name") to sort alphabetically
	}

	if (purecommPopupConfiguration.defaultView === "map") {
		showMapView();
	} else {
		showListView();
	}

	if (purecomm_SortFrom) {
		getStoreDistances(purecomm_SortFrom); // get the distance between each store and this postion
		sortStores("distance");
		//getStoreDistances(location); // get the distance between each store and this postion
		//sortStores("distance"); // sort the stores by distance
	}

	storesInitialized = true;
    purecommSetCSS(); // set css for browsers where css vars are not supported
}


/**********************************************************************************************************************************************
functions for the client to call:
    purecommClickAndCollectInit(branchId)
    purecommAvailabilityPopup(items, callback)
***********************************************************************************************************************************************/

/*
 * branchId is a “virtual branch” used to identify the client website, and pick up the config file.
 * languageParameter is the language for the popup, e.g. 'en' for English
 */
function purecommClickAndCollectInit(branchId, languageParameter) {
    'use strict';
    getPurecommPopupConfiguration();
    if (languageParameter) {
        purecommLanguage = languageParameter;
    } else {
        purecommLanguage = 'en';
    }
    
    // get cookies
    console.log(getCookie("purecomm_SelectedStoreID"));
    console.log(getCookie("purecomm_SortFrom"));
    console.log(getCookie("purecomm_MapBounds"));
    
    purecomm_SelectedStoreID = getCookie("purecomm_SelectedStoreID");
    purecomm_SortFrom = JSON.parse(getCookie("purecomm_SortFrom"));
    purecomm_MapBounds = JSON.parse(getCookie("purecomm_MapBounds"));
    
    // copy data from newConfig to ogConfig
    function updateConfig(ogconfig, newConfig) {
        console.log(newConfig);
        var i,
            value;
        for (i = 0; i < newConfig.length; i += 1) {
            value = newConfig[i]; // value for the attribute
            if (value !== null && value !== "") {
                if (typeof value === 'object') {
                    // value is an object, recurcively call this method
                    updateConfig(ogconfig[i], newConfig[i]);
                } else {
                    ogconfig[i] = value;
                }
            }
        }
        return ogconfig;
    }
    
    function init(configFile) {
        if (configFile) {
            purecommPopupConfiguration = updateConfig(purecommPopupConfiguration, configFile);
        }
        
		var head = document.getElementsByTagName('head')[0],
			body = document.getElementsByTagName('body')[0],
            cssConfig = ':root {' +
                '--purecommFontFamily: ' + purecommPopupConfiguration.css.fontFamily + ';' +
                '--purecommModalBG: ' + purecommPopupConfiguration.css.colors.modalBG + ';' +
                '--purecommModalFG: ' + purecommPopupConfiguration.css.colors.modalFG + ';' +
                '--purecommBodyBG: ' + purecommPopupConfiguration.css.colors.bodyBG + ';' +
                '--purecommBodyFG: ' + purecommPopupConfiguration.css.colors.bodyFG + ';' +
                '}';
        var node = document.createElement('style');
        node.innerHTML = cssConfig;
        document.body.appendChild(node);

		// load css file
		var modalCSS  = document.createElement('link');
		modalCSS.type = 'text/css';
		modalCSS.rel = 'stylesheet';
		modalCSS.href = purecommHostFiles + 'purecommClickAndCollect.css';
		head.appendChild(modalCSS);

		// create modal html
		var modal = document.createElement('div');
		modal.id = 'purecommModal';
		modal.className = 'purecommModal';

		modal.onclick = function (event) {
            var purecommModal = document.getElementById('purecommModal');
			if (event.target === purecommModal) {
                console.log("[][][][][][][][][][][][][]", purecommModal);
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
		var head = document.getElementsByTagName('head')[0],
            fapiScript = document.createElement('script');
		fapiScript.type = 'text/javascript';
		fapiScript.src = purecommHostFiles + 'purecommFAPIjsInterface.js';
        fapiScript.async = false;
        fapiScript.onreadystatechange = fapiScript.onload = function () {
           //purecommFAPI = new PurecommFAPIjsInterface('JZLDKH', 'rmw88', 'uat');
            //purecommFAPI = new PurecommFAPIjsInterface('EB2UMV', null, purecommHost);
            purecommFAPI = new PurecommFAPIjsInterface(purecommBranchId, null, purecommHost);
            // get the .properties file 
            //console.log(purecommHostFiles + "..testnewpop/config/readConfig.jsp?m=getByAttribute&a=page&c=testnewpop/config/" + branchId + ".properties");
            purecommFAPI.ajax({
                type: "GET",
                //url: purecommHostFiles + "..testnewpop/config/readConfig.jsp?m=getByAttribute&a=page&c=testnewpop/config/" + branchId + ".properties"), //doesn't work on UAT
                url: purecommHostFiles.replace('map_popup', 'testnewpop') + "config/readConfig.jsp?m=getByAttribute&a=page&c=testnewpop/config/" + branchId + ".properties",
                authorization: null,
                success: function (response) {
                    if (response.success) {
                        init(response.result.locator); // initialize the popup
                    } else {
                        console.error("Configuration File:", response.error);
                        init(); // initialize the popup
                    }
                },
                error: function (response) {
                    console.error("Configuration File:", response);
                    init(); // initialize the popup
                }
            });
        };
		head.appendChild(fapiScript);
    }
}

/*
 * this function can be called in 3 differnt ways
 * Find a Store popup          --> purecommAvailabilityPopup()
 * Product Availability popup  --> purecommAvailabilityPopup(sku)
 * Cart Availability popup     --> purecommAvailabilityPopup([sku,sku])
 * The callback function is optional. When a store is selected the call back function is called, passing the store details
 */
function purecommAvailabilityPopup(items, callback) {
    'use strict';
    function storeAvailabilityResponse(success, data) {
        if (success && data) {
            console.info("Items:", items);
            console.info("Stores:", data.stores);
            console.info(JSON.stringify(data.stores));
            purecommStores = data.stores;
            purecommOpenModal(); // open the modal
        } else {
            console.error("Store Availability:", success, data);
        }
        
    }
    
    if (popupInitialized) {
        purecommCallback = callback;
        if (sameItems(purecommItems, items)) {
            // same items, just display popup
            document.getElementById('purecommModal').style.display = 'block';
        } else {
            console.log("##### new");
            // new items, get availability and update popup
            purecommItems = items;

            if (!items) {
                items = []; // no items: "find a store" popup
            } else if (!Array.isArray(items)) {
                items = [items]; // change individual sku to array of 1 sku
            }
			purecommFAPI.storeAvailability(storeAvailabilityResponse, items);
        }
		return true;
	} else {
		return false;
    }
}
