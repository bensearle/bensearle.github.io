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

        getPicksToConfirm = function(){
            /*var picks = [];

            for (var i = 0; i < $scope.customerOrders; i += 1){
                if ($scope.customerOrders[i].
            }
            $scope.customerOrders;*/

            return [
            {number:'718'},
            {number:'719'},
            {number:'725'}
        ]
        };
        $scope.picksToConfirm = getPicksToConfirm();
        

        $scope.shipmentsToArrive = [];
        $scope.courierCollections = [];


        
    
        // Open our new task modal
        $scope.viewOrder = function (order) {
            $scope.selectedOrder = order;
            console.log(order);
            
            /*$scope.groups = {};
            for (var i = 0; i < order.items.length; i += 1){
                $scope.groups[order.items[i].currentBranch] = order.items[i];
            }*/


            var groups = {};
            for (var i = 0; i < order.items.length; i++) {
                var groupName = order.items[i].currentBranch;
                if (!groups[groupName]) {
                    groups[groupName] = [];
                }
                groups[groupName].push(order.items[i]);
            }
            myArray = [];
            for (var groupName in groups) {
                var fromMoko = groupName === 'MOKO, Mongkok'
                myArray.push({'name': groupName, 
                    'title': groups[groupName].length + ' Item(s) from ' + groupName, 
                    'items': groups[groupName], 
                    'show': fromMoko});
            }
            console.log(myArray);
            console.log(order.items);
            
            $scope.groups = myArray;
            /*$scope.groups[0] = {
                    name: {left: "Order Details", right: "Status"},
                    items: [],
                    show: false
            };
            for (var i=1; i<10; i++) {
                $scope.groups[i] = {
                    name: {left: "...Item(s) from...", right: "Ticket Number"},
                    items: [],
                    show: false
                };
                for (var j=0; j<3; j++) {
                    $scope.groups[i].items.push(i + '-' + j);
                }
            };*/
            
            console.log($scope.groups);
            
        };

        $scope.isNotProvisional = function (order){
            console.log("provisional", order.status !== 'provisional');
            return order.status !== 'provisional';
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
            $scope.closeConfirmPick();
        };


        printPDF = function (){
            var printWindow = window.open('print.htm');
            printWindow.focus();
            printWindow.print();
            setTimeout(function(){ printWindow.close(); }, 100); // wait 100ms to give print dialog time to open
        }

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
        }

    })

;
