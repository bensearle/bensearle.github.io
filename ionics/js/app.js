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

angular.module('todo', ['ionic'])

    .config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
        $stateProvider
            .state('home', {
                url: "/home",
                templateUrl: "home.html"
            })
            .state('customerOrders', {
                url: "/customerOrders",
                templateUrl: "customerOrders.html" 
            });
        $urlRouterProvider.otherwise("/home"); // default page
        $ionicConfigProvider.views.transition('none'); // disable animation between pages
        })

    .controller('TodoCtrl', function ($scope, $ionicModal) {
        // test data
        $scope.tasks = [
            { title: 'Collect coins' },
            { title: 'Eat mushrooms' },
            { title: 'Get high enough to grab the flag' },
            { title: 'Find the Princess' }
        ];
    
        $scope.picksToConfirm = [
            {number:'1234'},
            {number:'1235'},
            {number:'1236'},
            {number:'1237'}
        ];
        $scope.shipmentsToArrive = [];
        $scope.courierCollections = [];


        // populate customer orders
        $scope.customerOrders = userData.orders;
    
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
                myArray.push({'name': groupName, 
                    'title': groups[groupName].length + ' Item(s) from ' + groupName, 
                    'items': groups[groupName], 
                    'show': true});
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

        // Create and load the Modal
        $ionicModal.fromTemplateUrl('new-task.html', function (modal) {
            $scope.taskModal = modal;
        }, {
            scope: $scope,
            animation: 'slide-in-up'
        });

        // Called when the form is submitted
        $scope.createTask = function (task) {
            $scope.tasks.push({
                title: task.title
            });
            $scope.taskModal.hide();
            task.title = "";
        };

        // Open our new task modal
        $scope.newTask = function () {
            $scope.taskModal.show();
        };

        // Close the new task modal
        $scope.closeNewTask = function () {
            $scope.taskModal.hide();
        };

    })

;
