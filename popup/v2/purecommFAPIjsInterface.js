/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global purecommFAPIjsInterfaceLoaded*/
/*global ActiveXObject*/
 
/***************************************************************************************************
 * purecommFAPIjsInterface.js																		*
 * @author Ben Searle <ben@purecomm.com>															*
 * FAPI defined in Purecomm Distributed Fulfilment Integration Guide 1.8.2 (16-Nov-2016)			*
 * HTML:<script type='text/javascript' src='purecommFAPIjsInterface.js'><\/script>                  *
 * JS:	var head = document.getElementsByTagName('head')[0];                                        *
 *      fapiScript = document.createElement('script');                                              *
 *      fapiScript.type = 'text/javascript';                                                        *
 *      fapiScript.src = 'purecommFAPIjsInterface.js';                                              *
 *      head.appendChild(fapiScript);                                                               *
 *                                                                                                  *
 * optional: create function (purecommFAPIjsInterfaceLoaded), to be executed when this script loads	*
 *      purecommFAPIjsInterfaceLoaded(){ //do stuff }                                               *
 *                                                                                                  *
 * example of how to use this javascript interface                                                  *
 *      api = new purecommFAPIjsInterface('username', 'password', 'uat'); //initialize              *
 *      api.cancelOrder(callback,orderNumber); //make api call                                      *
 *      callback = function(success,data){console.log(success,data)} //process api return data      *
 *                                                                                                  *
 * Notes:                                                                                           *
 *      callback is the name of a function to be executed when there is a response from the API     *
 *      callback functions must have 2 paramenters [bool:success] [object:data]                     *
 ****************************************************************************************************/

// if it exists, call purecommFAPIjsInterfaceLoaded to confirm script has been loaded
if (typeof purecommFAPIjsInterfaceLoaded !== 'undefined') {purecommFAPIjsInterfaceLoaded(); }

function PurecommFAPIjsInterface(usr, pwd, hostParam) {
    'use strict';
	var auth = "";
    if (usr && pwd) {
        auth = usr + ":" + pwd;
    } else if (usr) {
        auth = usr;
    }
	var	host = "https://uat.purecomm.hk"; // uat is default host
	if (hostParam.toUpperCase() === "pp".toUpperCase()) {
		host = "https://pp.purecomm.hk";
	} else if (hostParam.toUpperCase() === "prod".toUpperCase()) {
		host = "https://www.purecomm.hk";
	}

    
 /***************************************************************************************************
 * JQuery AJAX																						*
 * jQuery.ajax([settings])																			*
 ****************************************************************************************************/

    function getIEVersion() {
		if (navigator.appName === "Microsoft Internet Explorer" && navigator.appVersion.split(";")[1].replace(/[ ]/g, "") === "MSIE6.0") {
			return 6;
		} else if (navigator.appName === "Microsoft Internet Explorer" && navigator.appVersion.split(";")[1].replace(/[ ]/g, "") === "MSIE7.0") {
			return 7;
		} else if (navigator.appName === "Microsoft Internet Explorer" && navigator.appVersion.split(";")[1].replace(/[ ]/g, "") === "MSIE8.0") {
			return 8;
		} else if (navigator.appName === "Microsoft Internet Explorer" && navigator.appVersion.split(";")[1].replace(/[ ]/g, "") === "MSIE9.0") {
			return 9;
		}
		return 100;
	}
	
	function lessIE10() {
		if (getIEVersion() < 10) {
			return true;
		}
		return false;
	}
	
	/**
	 * 判断是否为null,undefined,''
	 */
	function isEmpty(variable) {
		
		if (variable === null || variable === undefined || variable === '' || variable === 'null') {
			return true;
		}
		return false;
		
	}
    
	/*
	 * jQuery.ajax([settings])
	 * data类型：String发送到服务器的数据。'&foo=bar1&foo=bar2'。
	 * type类型：String默认值: "GET")。请求方式 ("POST" 或 "GET")， 默认为 "GET"。注意：其它 HTTP 请求方法，如 PUT 和 DELETE 也可以使用，但仅部分浏览器支持。
	 * url类型：String默认值: 当前页地址。发送请求的地址。
	 */
	function ajax(settings, authorization) {
		//console.log(settings);
		var async = true;
		if (settings.async === false) {
			async = false;
		}
		
		var ajaxUrl = settings.url;
		var ajaxUrlArray = ajaxUrl.split("/");
		var ajaxHost = ajaxUrlArray[2];
		
		//跨域访问
	    if (getIEVersion() < 10 && window.XDomainRequest && window.location.host !== "" && window.location.host !== ajaxHost && !isEmpty(ajaxHost)) {

            // Use Microsoft XDR
            var xdr = new window.XDomainRequest();
            xdr.open(settings.type, settings.url, async);
            xdr.send();
            xdr.onload = function () {
                var data = xdr.responseText;
                data = JSON.parse(data);
                settings.success(data);
            };
	    } else {
            var xmlHttp = false;
		    try {
		        //Firefox, Opera 8.0+, Safari  
		        xmlHttp = new XMLHttpRequest();
		    } catch (e1) {
		        //IE  
		        try {
		            xmlHttp = new ActiveXObject("Msxml2.XMLHTTP");
		        } catch (e2) {
                    try {
                        xmlHttp = new ActiveXObject("Microsoft.XMLHTTP");
                    } catch (e3) {
                        alert("您的浏览器不支持AJAX！");
                    }
		        }
		    }

		    xmlHttp.open(settings.type, settings.url, async);
			if (settings.authorization !== undefined) {
				if (settings.authorization !== null && settings.authorization !== "") {
					xmlHttp.setRequestHeader("Authorization", settings.authorization); // if the ajax call defines the authorization, use that
				}
                // else settings.authorization is null or "", so do not set authorization
			} else {
				xmlHttp.setRequestHeader("Authorization", "Basic " + auth);
			}

		    if (settings.dataType) {
				xmlHttp.setRequestHeader("Content-Type", settings.dataType);
		    }
		    
            xmlHttp.onreadystatechange = function () {
		        if (xmlHttp.readyState === 4 && xmlHttp.status === 200) {
                    var data = xmlHttp.responseText;
                    try {
                        data = JSON.parse(data);
                    } catch (e) {
                    }
                    settings.success(data);
		        }
		    };
            xmlHttp.send(settings.data);
	    }
	}


 /***************************************************************************************************
 * Section 2                                                                                        *
 * Website Integration                                                                              *
 ****************************************************************************************************/

	/*
	 * 2.1 Create Order API
	 */
	function createOrder(callback, orderNumber, skus, replacedOrder) {
		var data = {"order": orderNumber, "skus": skus};
		if (replacedOrder) {
			data.replacedOrder = replacedOrder;
		}
		ajax({
			type: "POST",
			url: host + "/fulfilment/orders",
			data: JSON.stringify(data),
			dataType: "application/json",
			success: function (response) {
				callback(1, response);
			},
			error: function (response) {
				callback(0, response);
			}
		});
	}

    /*
	 * 2.2 Store Availability API
	 */
	function storeAvailability(callback, skus) {
		var data = {"skus": skus};
        //console.log("<>", auth, JSON.stringify(data));
		ajax({
			type: "POST",
			url: host + "/fulfilment/storeAvailability",
			data: JSON.stringify(data),
			dataType: "application/json",
			success: function (response) {
				callback(1, response);
			},
			error: function (response) {
				callback(0, response);
			}
		});
	}
    
	/*
	 * 2.2 Store Availability API
     * DEPRECIATED
	 */
	function storeAvailabilityFromOrderNumber(callback, orderNumber) {
		ajax({
			type: "GET",
			url: host + "/fulfilment/orders/" + orderNumber + "/storeavailability",
			success: function (response) {
				callback(1, response);
			},
			error: function (response) {
				callback(0, response);
			}
		});
	}

	/*
	 * 2.3 Shippable Stock on Hand API
	 */
	function shippableStockOnHand(callback, sinceUpdateTime) {
		var time = sinceUpdateTime.toISOString().split('.')[0] + "Z"; // convert time to iso string and remove miliseconds
		ajax({
			type: "GET",
			url: host + "/fulfilment/shippable?sinceUpdateTime=" + time,
			dataType: "application/x-www-form-urlencoded",
			success: function (response) {
				callback(1, response);
			},
			error: function (response) {
				callback(0, response);
			}
		});
	}


 /***************************************************************************************************
 * Section 3																						*
 * Order Management Integration																		*
 ****************************************************************************************************/

	/*
	 * 3.1 Update Order API
	 */
	function updateOrder(callback, orderNumber, name, phone, email, skus, shippingRelease, transactionId, ship, store, Address, currency, country, price, express) {
		var data = {"name": name, "phone": phone, "skus": skus};
		if (email) {
			data.email = email;
		}
		if (shippingRelease) {
			data.shippingRelease = shippingRelease;
		}
		if (transactionId) {
			data.transactionId = transactionId;
		}
		if (ship) {
			data.ship = ship;
		}
		if (store) {
			data.store = store;
		}
		if (Address) {
			data.Address = Address;
		}
		if (currency) {
			currency.email = currency;
		}
		if (country) {
			data.country = country;
		}
		if (price) {
			data.price = price;
		}
		if (express) {
			data.express = express;
		}

		ajax({
			type: "POST",
			url: host + "/fulfilment/orders/" + orderNumber + "/update",
			data: JSON.stringify(data),
			dataType: "application/json",
			success: function (response) {
				callback(1, response);
			},
			error: function (response) {
				callback(0, response);
			}
		});
	}

	/*
	 * 3.2 Cancel Order API
	 */
	function cancelOrder(callback, orderNumber) {
		ajax({
			type: "POST",
			url: host + "/fulfilment/orders/" + orderNumber + "/cancel",
			data: {},
			dataType: "application/x-www-form-urlencoded",
			success: function (response) {
				callback(1, response);
			},
			error: function (response) {
				callback(0, response);
			}
		});
	}

	/*
	 * 3.3 Monitor for Order Changes API
	 */
	function monitorForOrderChanges(callback, sinceUpdateTime) {
		var time = sinceUpdateTime.toISOString().split('.')[0] + "Z"; // convert time to iso string and remove miliseconds
		ajax({
			type: "GET",
			url: host + "/fulfilment/monitor?sinceUpdateTime=" + time,
			dataType: "application/x-www-form-urlencoded",
			success: function (response) {
				callback(1, response);
			},
			error: function (response) {
				callback(0, response);
			}
		});
	}

	/*
	 * 3.4 Order Status  API
	 */
	function orderStatus(callback, orderNumber) {
		ajax({
			type: "GET",
			url: host + "/fulfilment/orders/" + orderNumber + "/status",
			success: function (response) {
				callback(1, response);
			},
			error: function (response) {
				callback(0, response);
			}
		});
	}

	return {
		createOrder: createOrder,
		storeAvailability: storeAvailability,
		shippableStockOnHand: shippableStockOnHand,
		updateOrder: updateOrder,
		cancelOrder: cancelOrder,
		monitorForOrderChanges: monitorForOrderChanges,
		orderStatus: orderStatus,
		ajax: ajax
	};
}