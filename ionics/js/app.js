/*global angular*/

// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic'])

	.run(function ($ionicPlatform) {
		$ionicPlatform.ready(function () {
			if (window.cordova && window.cordova.plugins.Keyboard) {
				// Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
				// for form inputs)
				cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

				// Don't remove this line unless you know what you are doing. It stops the viewport
				// from snapping when text inputs are focused. Ionic handles this internally for
				// a much nicer keyboard experience.
				cordova.plugins.Keyboard.disableScroll(true);
			}
			if (window.StatusBar) {
				StatusBar.styleDefault();
			}
		});
	});

angular.module('womApp', ['ionic'])

    .config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
        $stateProvider
            .state('home', {
                url: "/home",
                templateUrl: "home.html"
            })
            .state('customerOrders', {
                url: "/customerOrders",
                templateUrl: "customerOrders.html",
                params: { 
                    searchValue: "",
                    test: null
                }
            })
            .state('createOrder', {
                url: "/createOrder",
                templateUrl: "createOrder.html"
            });
        $urlRouterProvider.otherwise("/home"); // default page
        $ionicConfigProvider.views.transition('none'); // disable animation between pages
        })

    .controller('AppCtrl', function ($scope, $stateParams, $document, $location, $ionicModal, $ionicTabsDelegate) {
        $scope.session = {
            user: 'Charlie',
            store: 'MOKO, Mongkok'
        }

        $scope.customerOrders = userData.orders;
        $scope.selectedOrder = {};

        $scope.text = {
            tabActions: 'Actions',
            tabOrders: 'Orders',
            dashboardTitle: 'PureComm Action Dashboard',
            dashboardPickTickets: 'Pick Ticket(s)',
            dashboardCancelledItems: 'Cancelled Item(s)',
            dashboardShipmentLabels: 'Shipment Label(s)',
            dashboardOverdueCollections: 'Overdue Collection(s)',
            dashboardPicksToConfirm: 'Pick(s) to Confirm',
            dashboardShipmentsToArrive: 'Shipment(s) to Arrive',
            dashboardCourierCollections: 'Courier Collection(s)',


            customerOrdersTitle: 'Customer Orders',
            confirmPick: 'Confirm Pick',
            ticketNumber: 'Ticket No.',
            itemDetail: 'Item Detail',
            scanBarcode: 'Scan Barcode',
            pickFailed: 'Pick Failed',


            // buttons
            //confirmPick: 'Confirm Pick', // already defined
            print: 'Print',
            reprint: 'Reprint',
            back: 'Back',
            submit: 'Submit',

            damaged: 'Damaged',
            wrongItem: 'Wrong Item',
            notFound: 'Not Found',
            other: 'Other',
            comment: 'Comment',


            orders: 'Orders',
            provisional: 'Provisional'

        };



        // test data
        $scope.tasks = [
            { title: 'Collect coins' },
            { title: 'Eat mushrooms' },
            { title: 'Get high enough to grab the flag' },
            { title: 'Find the Princess' }
        ];

        
        $scope.pickTicketsCount= 0;
        $scope.getPickTicketsCount = function(){
            var count = 0;
            for (var i = 0; i < $scope.customerOrders.length; i += 1) {
                if (!$scope.customerOrders[i].isPrinted) {
                    count += $scope.customerOrders[i].items.length;
                }
            }
            $scope.pickTicketsCount = count;
            return count;
        }

        $scope.picksToConfirmLength = 0;
        $scope.picksToConfirm = function(){
            var allItems = [];
            for (var i = 0; i < $scope.customerOrders.length; i += 1) {
                if ($scope.customerOrders[i].isPrinted) {
                    var items = $scope.customerOrders[i].items;
                    for (var j = 0; j < items.length; j += 1) {
                        if (items[j].currentBranch === $scope.session.store && !items[j].picked) {
                            allItems.push(items[j])
                        }
                    }
                }
            }
            console.log("*************",allItems);
            $scope.picksToConfirmLength = allItems.length;
            return allItems;
        }
        //$scope.picksToConfirm = $scope.getPicksToConfirm();
        

        $scope.shipmentsToArrive = [];
        $scope.courierCollections = [];


        
    
        // Open our new task modal

        getItemsByStore = function () {
            if (!$scope.selectedOrder) {
                return [];
            }
            order = $scope.selectedOrder;
            var stores = [];
            for (var i = 0; i < order.items.length; i++) {
                var storeName = order.items[i].currentBranch;
                if (!stores[storeName]) {
                    stores[storeName] = [];
                }
                stores[storeName].push(order.items[i]);
            }

            itemsByStore = [];
            for (var storeName in stores) {
                var show = storeName === $scope.session.store;
                itemsByStore.push({'name': storeName, 
                    'title': stores[storeName].length + ' Item(s) from ' + storeName, 
                    'items': stores[storeName], 
                    'show': show});
            }

            itemsByStore.sort(function(a, b) {
                console.info("______________", a.name === $scope.session.store, a, b )
                if (a.name === $scope.session.store) return -1;
                if (b.name === $scope.session.store) return 1;
                if (a.name < b.name) return -1;
                if (a.name > b.name) return 1;
                return 0;
            });

            return itemsByStore;
        }

        $scope.selectOrder = function (order) {
            console.log('^^^^^^^^^', $scope.selectedOrder)
            $scope.selectedOrder = order;
            console.log('^^^^^^^^^', $scope.selectedOrder)
            $scope.itemsByStore = getItemsByStore();
        };



        $scope.getOrangeIcon = function (order) {
            if (!order.isReady){
                return 'img/flag.png';
            } else if (order.isOverdue) {
                return 'img/clock.png';
            } else {
                return 'img/emptyOrange.png';

            }

        };

        $scope.getGreyIcon = function (order) {
            if (order.isClickAndCollect){
                return 'img/C&C.png';
            } else {
                return 'img/emptyGrey.png';
            }
        };

        $scope.getOrderStatus = function (order) {
            var isReadyToCollect = true;
            for (var i = 0; i < order.items; i += 1){
                isProvisional = isProvisional && order.items[i].picked;
            }
            if (!isReadyToCollect){
                order.status = 'provisional';
            }
        };

        //document.getElementById('input-search').value = $stateParams.searchValue;
        $scope.initialSearchValue = function(){
            console.log("^^^^^^^^^^",$stateParams.searchValue);
            return $stateParams.searchValue;
        }
        $scope.isOrderShown = function (order) {
            var searchValue = document.getElementById('input-search').value;
            if (!searchValue) { // nothing is being searched
                return true;
            } else if (order.orderNumber.toUpperCase().includes(searchValue.toUpperCase())){
                return true;
            } else if (order.customerName.toUpperCase().includes(searchValue.toUpperCase())){
                return true;
            } else {
                console.log("**", order.orderNumber, order.customerName, searchValue)
                return false;
            }

            /*var searchValue = document.getElementById('input-search').value;
            console.log ('&&&&,$',searchValue, $stateParams);
            if (searchValue) {
                return order.isProvisional;
            } else if($stateParams.searchValue){
                document.getElementById('input-search').value = $stateParams.searchValue;
                $stateParams.searchValue = '';
                return order.isProvisional;
            } else {
                return true;   
            }*/
        };
        $scope.clearSearch = function(){
            document.getElementById('input-search').value = '';
        }

    
        $scope.toggleGroup = function (group) {
            group.show = !group.show;
        };
        $scope.isGroupShown = function (group) {
            return group.show;
        };

        $scope.isSelectedOrder = function (order) {
            return order.orderNumber === $scope.selectedOrder.orderNumber;
        };

        $scope.isNonEmpty = function (array) {
            console.log("isNonEmpty",array, array.length > 0);
            return array.length > 0;
        }

        $scope.isCurrentTab = function (tabUrl) {
            return tabUrl === $location.$$url;
        }

        $scope.isOrderHidden = function (order) {
            console.log('****', $scope)

            return false;
        }


        /*
         * Modal Creation and Navigation
         */
        $ionicModal.fromTemplateUrl('new-task.html', function (modal) {
            $scope.confirmPickModal = modal;
        }, {
            scope: $scope,
            animation: 'slide-in-up'
        });
        $scope.goToConfirmPick = function (item) {
            $scope.selectedItem = item;
            $scope.confirmPickModal.show();
            $ionicTabsDelegate.$getByHandle('confirmPick-tabs').select(0);
        };
        $scope.closeConfirmPick = function () {
            $scope.confirmPickModal.hide();
        };
        $scope.goToTab = function(tab, index) {
            switch(tab) {
            case 'confirmPick':
                $ionicTabsDelegate.$getByHandle('confirmPick-tabs').select(index);
                break;
            default:
                break;
            }
        }


        /*
         * 
         */
        $scope.confirmPick = function (item) {
            console.log("PICK CONFIRMED", item);
            item.picked = true;
            $scope.closeConfirmPick();
        };

        $scope.pickFailed = function (item, comment) {
            console.log("PICK FAILED", comment, item);
            item.currentBranch = 'Warehouse';
            $scope.itemsByStore = getItemsByStore();

            $scope.closeConfirmPick();
        };

        printTicket = function() {
            printPDF();


            for(var i = 0; i < $scope.customerOrders.length; i += 1) {
                $scope.customerOrders[i].isPrinted = true;
            }
            $scope.$apply();
        }
        printPDF = function() {
            var printWindow = window.open('print.htm');
            printWindow.focus();
            printWindow.print();
            setTimeout(function(){ printWindow.close(); }, 100); // wait 100ms to give print dialog time to open
        };

        $scope.getItems = function(ev) {
            // Reset items back to all of the items
            //this.initializeItems();

            // set val to the value of the ev target
            var val = ev.target.value;

            // if the value is an empty string don't filter the items
            if (val && val.trim() != '') {
              this.items = this.items.filter((item) => {
                return (item.toLowerCase().indexOf(val.toLowerCase()) > -1);
              })
            }
        };


        /* create a new order */
        $scope.createNewOrder = function() {
            console.log('NEW ORDER');
            var newOrder = {
              "createDate": "2016-12-06 08:55:09",
              "orderNumber": "order24359",
              "customerName": "Mr Test",
              "mobileNumber": "61431002293",
              "totalPrice": "100", //b
              "currency": "HKD",
             
              "isReady": false, // b
              "isOverdue": 0,
              "isCompleted": false, // b

              "isClickAndCollect": true, // b
              
              "customerFeedback": 1,
              "datePlace": "06/12/2016",
              "extendDays": 2,



              "modifyConfirmDate": false,
              "orderStatus": "2",
              "originBranch": "WebReserve",
              "payBarcode": "tx12134345",
              "shippingRelease": "Hold",
              "statusTitle": "Stock Reserved",

              "collectionDate": "",  // if there is collectionDate, then it is click&collect?
              "itemsCount": "3", // b
              "items": [ // b, itemCount was called items
                {
                    "displayPrice": 100,
                    "itemTitle":"Big Red Shoes",
                    "currentBranch": "MOKO, Mongkok",
                    "barcode": "SKU#100",
                    "itemStatus": "Pending Pick",
                    "reservationId": 50510,
                    "shipmentNumber": "",
                    "size": "SIZE 1",
                    "styleRef": "SKU10001",
                    "tickNumber": "901",
                    "title": "",
                    "picked": false
                },
                {
                    "itemTitle":"T-Shirt",
                    "currentBranch": "MOKO, Mongkok",
                    "barcode": "SKU#200",
                    "itemStatus": "Pending Pick",
                    "reservationId": 50510,
                    "shipmentNumber": "",
                    "size": "1",
                    "styleRef": "SKU10001",
                    "tickNumber": "902",
                    "title": "",
                    "picked": false
                }
              ]
            };

            //$scope.customerOrders.push(newOrder);
            //$scope.selectOrder(newOrder);
            var order = newOrder;
            $scope.customerOrders.push(order);
            //$scope.selectOrder(order);

            orderNotification(order);


            /*var notification = new createNotification('PureComm Store Fulfilment', 'New Customer Order\nClick Here', 'img/notification_newOrder.png')
            notification.onclick = function() {
                $scope.selectOrder(newOrder);
                console.log('=================');
                console.log($scope.selectedOrder);
                console.log(newOrder);
                console.log($scope.customerOrders);*/
            //}
        };


        /******************************************************************************************
                                    NOTIFICATION FUNCTIONS
        ******************************************************************************************/
        document.addEventListener('DOMContentLoaded', function () {
            'use strict';
            if (!Notification) {
                console.error('Desktop notifications not available in your browser. Try Chromium.');
                return;
            }
            if (Notification.permission !== "granted") {
                Notification.requestPermission();
            }
        });

        function orderNotification(order) {
            'use strict';
            if (Notification.permission !== "granted") {
                Notification.requestPermission();
            } else {
                var notification = new Notification('PureComm Store Fulfilment', {
                    body: 'New Customer Order\nClick Here',
                    icon: 'img/notification_newOrder.png',
                    requireInteraction: true,
                    sound: 'Sosumi.aiff' // not supported
                });
                notification.onclick = function () {
                    window.focus(document);
                    $scope.selectOrder(order);
                    //window.location.href = '#/home';
                    window.location.href = '#/customerOrders';

                    console.log('=================');
                    console.log($scope.selectedOrder);
                    console.log(order);
                    console.log($scope.customerOrders);
                    notification.close();
                    $scope.$apply();
                };
                notification.onerror = function () {
                    console.error('The notification encountered an error');
                };
                return notification;
            }
        }

        function notify() {
            'use strict';
            var date = new Date(),
                time = date.toLocaleTimeString();
            createNotification('PureComm',
                               time + ' new notification',
                               'logo.png');
        }

    })



        


;
