


/*
 * Create a version 4 UUID is defined in RFC 4122 
 * 128 randomly-generated bits with six bits at certain positions set to particular values
 * eg 4513c570-5db9-408e-9ded-e1bben24436a
 */
function createUUID() {
    'use strict';
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}


// copy data from newObject to ogObject
function updateObject(ogObject, newObject) {
    'use strict';
    //console.log("copy", newObject, "to", ogObject);
    var attribute;
    for (attribute in newObject) {
        var value = newObject[attribute]; // value for the attribute
        if (value !== null && value !== "") {
            if (typeof value === 'object') {
                // value is an object, recurcively call this method
                updateConfig(ogObject[attribute], newObject[attribute]);
            } else {
                ogObject[attribute] = value;
            }
        }
    }
    return ogObject;
}

/*
 * compare whether 2 javascript objects are the same
 * the 2 objects will be sku or cartItems
 */
function sameItems(items1,items2) {
	'use strict';
    if (typeof items1 === 'undefined' || typeof items2 === 'undefined') {
		return false;
	} else {
		return JSON.stringify(items1) === JSON.stringify(items2);
	}
}

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

// await sleep(1000);
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function demo() {
  console.log('Taking a break...');
  await sleep(2000);
  console.log('Two second later');
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
        d = new Date();
	d.setTime(d.getTime() + (exdays * 86400000)); // 86400000=24*60*60*1000
	var expires = "expires=" + d.toGMTString();
	document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}
function getCookie(cname) {
    'use strict';
	var name = cname + "=",
        ca = document.cookie.split(';'),
        i;
	for (i = 0; i < ca.length; i++) {
		var c = ca[i];
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

/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */