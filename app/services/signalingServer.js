angular.module('myApp').factory('signalingServer', ['chat','pubNub','channels', function (chat, pubNub, channels) {
    var connections = [];

   return{
        connect: function(c){
            chat.join({
                name:'signaling server',
                callback:function(message){
                    if(message.to == c.client){

                    }
                }
            })
        } ,
       acceptCall : function(a){
           chat.publish({
               channel:'signaling server',
               status:200,
               client:a.client
           });
       },
       rejectCall : function(r){
           chat.publish({
               channel:'signaling server',
               status:403,
               client:r.client
           })
       },
       endCall:function(e){
           chat.publish({
               channel:'signaling server',
               status:410,
               client:e.client
           });
           chat.leave({
               channel: e.client
           })
       },

   }
}]);