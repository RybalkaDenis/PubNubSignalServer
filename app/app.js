'use strict';

angular.module('myApp', ['ui.router', 'ui.bootstrap', 'pubNub', 'cgNotify', 'ngLodash'])
    .config(function($stateProvider, $urlRouterProvider ) {



  $urlRouterProvider.otherwise("/state1");

  $stateProvider
      .state('main', {
        url: "/main",
        templateUrl: "views/mainView.html",
        controller:'ChatCtrl'
      })
      .state('state2', {
        url: "/state2",
        templateUrl: "partials/state2.html"
      });
}).run(function(notify){

        notify.config({
            templateUrl:'bower_components/angular-notify/angular-notify.html',
            position:'right',
            duration:3000
        });

});
