document.write("<script type='text/javascript' src='purecommFAPIjsInterface.js'><\/script>");
/*
 * function that runs when the purecommFAPIjsInterface.js is loaded
 */
function purecommFAPIjsInterfaceLoaded(){
	api = new purecommFAPIjsInterface('67ZQJH', 'password57', 'uat');

	var clientId = 57;
	var orderNumber = "abcBEN2";
	var skus = [{"barcode":"1234","quantity":2,"unitPrice":2.10}];
	//var skus = [];
	//var replacedOrder = "231-332-001";

	api.createOrder(createOrderResponse,orderNumber,skus);

	api.cancelOrder(cancelOrderResponse,orderNumber);
	api.storeAvailability(storeAvailabilityResponse,orderNumber);
    //var host = "uat";
    //var store = "S9TBCG"; // Forever New
    //var store = "67ZQJH"; // WebReserve
    api.orderStatus(orderStatusResponse,orderNumber);

    var date = new Date();
	date.setDate(date.getDate() - 7);

	//date.setMilliseconds(0);

    //var d = dateFormat(date..toISOString(),"isoDateTime");

    api.monitorForOrderChanges(monitorForOrderChangesResponse,date);
    api.shippableStockOnHand(shippableStockOnHandResponse,date);
    var store = "";
    api.updateOrder(updateOrderResponse,orderNumber,"","","",skus,"","","",store);
}


/*
 * functions that are called when the api responds
 */

function createOrderResponse(success,data){
	console.log("createOrder",data);
}

function storeAvailabilityResponse(success,data){
	console.log("storeAvailability",data);
}

function shippableStockOnHandResponse(success,data){
	console.log("shippableStockOnHand",data);
}

function cancelOrderResponse(success,data){
	console.log("cancelOrder",data);
}

function updateOrderResponse(success,data){
	console.log("updateOrder",data);
}

function monitorForOrderChangesResponse(success,data){
	console.log("monitorForOrderChanges",data);
}

function orderStatusResponse(success,data){
	console.log("orderStatus",data);
}