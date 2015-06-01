angular.module('myApp').factory('signalingServer', ['chat','channels','$rootScope','lodash', function (chat, channels, $rootScope, lodash) {

   return{
       initChannel:function(c){
           chat.join({
               channel: c.channel,
               callback: c.callback
           });
       }

   }
}]);