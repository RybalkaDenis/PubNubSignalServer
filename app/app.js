'use strict';

angular.module('myApp', ['ui.router', 'ui.bootstrap', 'pubNub', 'cgNotify', 'ngLodash', 'chart.js'])
    .config(function($stateProvider, $urlRouterProvider ) {



  $urlRouterProvider.otherwise("/main");

  $stateProvider
      .state('main', {
        url: "/main",
        templateUrl: "views/mainView.html",
        controller:'ChatCtrl'
      })
      .state('main.metrics', {
        url: "/metrics",
        templateUrl: "views/metrics.html",
          controller:'ChatCtrl'
      });
}).run(function(notify){

        notify.config({
            templateUrl:'bower_components/angular-notify/angular-notify.html',
            position:'right',
            duration:3000
        });

});
